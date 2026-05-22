/**
 * Migración: c_plano_desmontaje_cd.magik
 * Empresa:   SIGTAO SOFTWARE S.A. DE C.V. — vnguzman — 10-Abril-2006
 * Clase Magik: c_plano_desmontaje_cd — extiende layout_element + viewport_layout_mixin
 *
 * Orquestador del plano de desmontaje de Caja de Distribución (CD).
 * Compone tres elementos sobre una página de layout:
 *   1. marco()  → c_marco         — frame exterior de la hoja
 *   2. sello()  → c_sello_proyecto_canalizacion — cuadro de datos
 *   3. mapa()   → viewport_layout — viewport vinculado al mapa GIS activo
 *
 * Métodos migrados:
 *   new() / init()          → constructor + factory estático
 *   genera_plano()          → async generaPlano(service)
 *   marco(LoPagina)         → crearMarco() → MarcoConfig
 *   sello(LoPagina)         → crearSello() → SelloConfig
 *   mapa(LoPagina)          → async crearMapa(service) → ViewportConfig
 *
 * Equivalencias clave:
 *   app.plugin(:layout_plugin).start_layout_designer() → ILayoutService.getLayoutPage()
 *   LoPagina.elements.empty()                          → page.elements = []
 *   c_marco.new_with(:bounds,...)                      → MarcoConfig { bounds, largo, alto }
 *   c_sello_proyecto_canalizacion.new_with(...)        → SelloConfig { bounds }
 *   viewport_layout.new_with(:bounds,...)              → ViewportConfig { bounds, ... }
 *   LoMapView.current_view_bounds                      → IMapService.getCurrentViewBounds()
 *   LoMapView.viewing_angle.radians_to_degrees         → mapView.viewAngleDeg
 *   LoMapView.view_scale                               → mapView.viewScale
 *   LoViewBounds.width / LoViewportBounds.width        → cálculo de escala por ratio de bounds
 *   app_cs.unit_factor                                 → coordinateSystem.unitFactor
 *   display_styles → find matching by scale_id         → displayStyles.find(s=>s.scaleId===name)
 *   bounding_box.new_enlarging(0.10)                   → enlargeBBox(bbox, 0.10)
 */

import React, { useState } from 'react';

// ─── Tipos base ────────────────────────────────────────────────────────────────

/** Magik: bounding_box.new(xMin, yMin, xMax, yMax) */
export interface BBox {
  xMin: number; yMin: number;
  xMax: number; yMax: number;
}

/** Magik: c_marco — frame exterior de la hoja de plano */
export interface MarcoConfig {
  bounds    : BBox;
  largo     : number;   // Magik: LoMarco.Largo = 3
  alto      : number;   // Magik: LoMarco.Alto  = 1
  fillColor : string | null;  // Magik: set_fill_colour(_unset) → transparent
}

/** Magik: c_sello_proyecto_canalizacion — cuadro de datos del plano */
export interface SelloConfig {
  bounds: BBox;
  inicializado: boolean;
}

/** Magik: display_style — estilo de visualización del mapa */
export interface DisplayStyle {
  name   : string;
  scaleId: string;  // Magik: item.scale_id (comparado con current_display_style_name)
}

/** Magik: viewport_layout — configuración del viewport GIS en el plano */
export interface ViewportConfig {
  bounds            : BBox;
  mapped            : boolean;   // Magik: LoViewportLayout.mapped?
  socName           : string;    // Magik: soc_name ← spatial_object_controller.name
  centre            : [number, number];  // Magik: centre ← LoViewBounds.centre
  viewScale         : number;    // Magik: view_scale
  viewAngle         : number;    // Magik: view_angle (grados)
  aceName           : string;    // Magik: ace_name ← LoMapView.ace_name
  drawScale         : number;    // Magik: draw_scale = 1.0
  displayStyle      : string;    // Magik: display_style ← match por scale_id
  projection        : string;    // Magik: projection ← coordinate_system del viewport
  coordinateSystem  : string;    // Magik: coordinate_system ← app.coordinate_system
}

/** Página de layout — Magik: sw:layout_page */
export interface LayoutPage {
  elements: Array<MarcoConfig | SelloConfig | ViewportConfig>;
}

// ─── Interfaces de servicio (reemplazan Smallworld app + plugins) ──────────────

/** Magik: app.plugin(:map_plugin).current_map_view */
export interface MapViewState {
  viewBounds   : BBox;
  viewAngleDeg : number;  // ya en grados (Magik: .radians_to_degrees)
  viewScale    : number;
  aceName      : string;
  world        : string;
  socName      : string;
  coordinateSystem: {
    name      : string;
    unitFactor: number;   // Magik: app_cs.unit_factor
  };
  currentDisplayStyleName: string;
  displayStyles           : DisplayStyle[];
  projection              : string;
}

/** Servicio combinado — reemplaza app + plugins de Smallworld */
export interface IPlanoService {
  /** Magik: app.plugin(:layout_plugin).start_layout_designer() → LoLayoutDesigner */
  getLayoutPage(): Promise<LayoutPage | null>;
  /** Magik: app.plugin(:map_plugin).current_map_view */
  getMapViewState(): Promise<MapViewState>;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Magik: bounding_box.new_enlarging(factor) → amplía bbox un % en cada dirección */
function enlargeBBox(bbox: BBox, factor: number): BBox {
  const dx = (bbox.xMax - bbox.xMin) * factor;
  const dy = (bbox.yMax - bbox.yMin) * factor;
  return { xMin: bbox.xMin - dx, yMin: bbox.yMin - dy,
           xMax: bbox.xMax + dx, yMax: bbox.yMax + dy };
}

/** Magik: bounding_box.centre */
function bboxCentre(bbox: BBox): [number, number] {
  return [(bbox.xMin + bbox.xMax) / 2, (bbox.yMin + bbox.yMax) / 2];
}

// ─── Mock de servicio ─────────────────────────────────────────────────────────

export const mockPlanoService: IPlanoService = {
  getLayoutPage: async () => {
    await new Promise(r => setTimeout(r, 200));
    return { elements: [] };  // página vacía — Magik: LoPagina.elements.size = 0
  },
  getMapViewState: async () => {
    await new Promise(r => setTimeout(r, 300));
    return {
      viewBounds   : { xMin: 455000, yMin: 4470000, xMax: 456000, yMax: 4471000 },
      viewAngleDeg : 0,        // sin rotación → escala por ratio de bounds
      viewScale    : 1000,
      aceName      : 'DEFAULT_ACE',
      world        : 'gis_world',
      socName      : 'main_soc',
      coordinateSystem: { name: 'UTM30N', unitFactor: 1.0 },
      currentDisplayStyleName: 'scale_1000',
      displayStyles: [
        { name: 'Escala 1:500',   scaleId: 'scale_500'  },
        { name: 'Escala 1:1000',  scaleId: 'scale_1000' },
        { name: 'Escala 1:2000',  scaleId: 'scale_2000' },
      ],
      projection: 'EPSG:25830',
    };
  },
};

// ─── Clase principal ───────────────────────────────────────────────────────────

export class PlanoDesmontajeCd {

  // Magik: define_shared_constant(:allowed_on_menu?, _false)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: slot :app — referencia a la aplicación PNI
  private service: IPlanoService;

  constructor(service: IPlanoService = mockPlanoService) {
    this.service = service;
  }

  // ---------------------------------------------------------------------------
  // genera_plano()
  //
  // Magik:
  //   LoLayoutDesigner << .app.plugin(:layout_plugin).start_layout_designer()
  //   _if LoLayoutDesigner _isnt _unset
  //   LoPagina.elements.empty() si tiene elementos
  //   _self.marco(LoPagina) + _self.sello(LoPagina) + _self.mapa(LoPagina)
  // ---------------------------------------------------------------------------
  async generaPlano(): Promise<LayoutPage | null> {
    // Magik: start_layout_designer() → null si no disponible → _return
    const pagina = await this.service.getLayoutPage();
    if (!pagina) return null;

    // Magik: _if LoPagina.elements.size > 0 _then LoPagina.elements.empty()
    pagina.elements = [];

    // Magik: _self.marco(LoPagina)
    pagina.elements.push(this.crearMarco());

    // Magik: _self.sello(LoPagina)
    pagina.elements.push(this.crearSello());

    // Magik: _self.mapa(LoPagina)
    const viewport = await this.crearMapa();
    pagina.elements.push(viewport);

    return pagina;
  }

  // ---------------------------------------------------------------------------
  // marco(LoPagina)
  //
  // Magik:
  //   c_marco.new_with(:bounds, bounding_box.new(0,0,1,1))
  //   LoMarco.Largo = 3  LoMarco.Alto = 1
  //   LoMarco.set_fill_colour(_unset)   → transparente
  //   LoPagina.add_element(LoMarco)
  // ---------------------------------------------------------------------------
  crearMarco(): MarcoConfig {
    return {
      bounds   : { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      largo    : 3,       // módulos horizontales
      alto     : 1,       // módulos verticales
      fillColor: null,    // _unset → sin relleno
    };
  }

  // ---------------------------------------------------------------------------
  // sello(LoPagina)
  //
  // Magik:
  //   c_sello_proyecto_canalizacion.new_with(
  //     :bounds, bounding_box.new(420, 0, 3600, 2920))
  //   LoSello.Inicializa()
  //   LoPagina.add_element(LoSello)
  // ---------------------------------------------------------------------------
  crearSello(): SelloConfig {
    return {
      bounds      : { xMin: 420, yMin: 0, xMax: 3600, yMax: 2920 },
      inicializado: true,  // Magik: LoSello.Inicializa()
    };
  }

  // ---------------------------------------------------------------------------
  // mapa(LoPagina)
  //
  // Magik:
  //   viewport_layout.new_with(:bounds, bounding_box.new(2540, 270, 6600, 2920))
  //   _if LoViewportLayout.mapped? _is false
  //     LoViewBounds     = LoMapView.current_view_bounds
  //     LoViewportBounds = LoViewportLayout.bounds.new_enlarging(0.10)
  //     LoViewAngle      = LoMapView.viewing_angle.radians_to_degrees
  //     _if LoViewAngle.abs > 0.1
  //       LoViewScale = LoMapView.view_scale
  //     _else
  //       LoViewScale = min(viewW/vpW, viewH/vpH) * unitFactor
  //     _endif
  //     … asigna propiedades al viewport …
  //     display_style = match por scale_id o primer estilo disponible
  // ---------------------------------------------------------------------------
  async crearMapa(): Promise<ViewportConfig> {
    const vpBounds: BBox = { xMin: 2540, yMin: 270, xMax: 6600, yMax: 2920 };

    // Consulta estado actual del mapa (reemplaza .app.plugin(:map_plugin))
    const mapState = await this.service.getMapViewState();

    // Magik: LoViewportLayout.mapped? — aquí siempre false en init
    const alreadyMapped = false;

    if (alreadyMapped) {
      return { bounds: vpBounds, mapped: true,
               socName: '', centre: [0,0], viewScale: 1,
               viewAngle: 0, aceName: '', drawScale: 1,
               displayStyle: '', projection: '', coordinateSystem: '' };
    }

    // Magik: LoViewportBounds = LoViewportLayout.bounds.new_enlarging(0.10)
    const vpBoundsEnlarged = enlargeBBox(vpBounds, 0.10);
    const vpW = vpBoundsEnlarged.xMax - vpBoundsEnlarged.xMin;
    const vpH = vpBoundsEnlarged.yMax - vpBoundsEnlarged.yMin;

    const vb = mapState.viewBounds;
    const viewW = vb.xMax - vb.xMin;
    const viewH = vb.yMax - vb.yMin;

    // Magik: _if LoViewAngle.abs > 0.1 _then LoViewScale = LoMapView.view_scale
    //        _else LoViewScale = min(viewW/vpW, viewH/vpH) * unitFactor
    let viewScale: number;
    if (Math.abs(mapState.viewAngleDeg) > 0.1) {
      viewScale = mapState.viewScale;
    } else {
      viewScale = Math.min(viewW / vpW, viewH / vpH)
                  * mapState.coordinateSystem.unitFactor;
    }

    // Magik: display_style = busca item donde item.scale_id = current_display_style_name
    //        _default display_styles.first.name
    const currentStyleName = mapState.currentDisplayStyleName;
    const matchedStyle = mapState.displayStyles.find(s => s.scaleId === currentStyleName);
    const displayStyle = matchedStyle?.name
                      ?? mapState.displayStyles[0]?.name
                      ?? '';

    return {
      bounds          : vpBounds,
      mapped          : true,
      socName         : mapState.socName,
      centre          : bboxCentre(mapState.viewBounds),
      viewScale,
      viewAngle       : mapState.viewAngleDeg,
      aceName         : mapState.aceName,
      drawScale       : 1.0,   // Magik: draw_scale << 1.0
      displayStyle,
      projection      : mapState.projection,
      coordinateSystem: mapState.coordinateSystem.name,
    };
  }
}

// ─── Helpers de tipo (type guards) ────────────────────────────────────────────

function esMarco(el: MarcoConfig | SelloConfig | ViewportConfig): el is MarcoConfig {
  return 'largo' in el;
}
function esSello(el: MarcoConfig | SelloConfig | ViewportConfig): el is SelloConfig {
  return 'inicializado' in el;
}
function esViewport(el: MarcoConfig | SelloConfig | ViewportConfig): el is ViewportConfig {
  return 'viewScale' in el;
}

// ─── Componente React ─────────────────────────────────────────────────────────

// Escala de visualización: unidades de layout → px SVG
const LAYOUT_W = 6600;  // ancho máximo del layout
const LAYOUT_H = 2920;  // alto máximo del layout
const SVG_W    = 660;   // ancho de la preview SVG
const SVG_H    = 292;   // alto de la preview SVG
const SX = SVG_W / LAYOUT_W;
const SY = SVG_H / LAYOUT_H;

function bboxToSvg(b: BBox) {
  return {
    x: b.xMin * SX,
    y: SVG_H - b.yMax * SY,    // eje Y invertido (Magik Y↑, SVG Y↓)
    w: (b.xMax - b.xMin) * SX,
    h: (b.yMax - b.yMin) * SY,
  };
}

export function PlanoDesmontajeCdUI() {
  const [pagina,  setPagina ] = useState<LayoutPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);

  const handleGenerar = async () => {
    setLoading(true); setError(null);
    try {
      const plano = new PlanoDesmontajeCd(mockPlanoService);
      const result = await plano.generaPlano();
      if (!result) { setError('Layout Designer no disponible (genera_plano retornó null).'); }
      else           { setPagina(result); }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  };

  const marco    = pagina?.elements.find(esMarco)    as MarcoConfig    | undefined;
  const sello    = pagina?.elements.find(esSello)    as SelloConfig    | undefined;
  const viewport = pagina?.elements.find(esViewport) as ViewportConfig | undefined;

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_plano_desmontaje_cd</h3>
      <p style={st.meta}>
        Orquestador del plano de Desmontaje de Caja de Distribución.
        Compone: <strong>marco</strong> (frame hoja) + <strong>sello</strong> (cuadro datos) + <strong>viewport</strong> (mapa GIS).
      </p>

      {/* ── Botón principal ── */}
      <div style={st.control}>
        <button onClick={handleGenerar} disabled={loading} style={st.btn}>
          {loading ? 'Generando…' : 'genera_plano()'}
        </button>
        <span style={st.hint}>
          Simula: start_layout_designer → limpiar página → marco + sello + mapa
        </span>
        {error && <span style={{ ...st.hint, color: '#c62828' }}>{error}</span>}
      </div>

      {pagina && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12, alignItems: 'flex-start' }}>

          {/* ── Preview SVG del layout ── */}
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
              Preview layout — escala {SX.toFixed(3)}px/u × {SY.toFixed(3)}px/u
            </div>
            <svg width={SVG_W + 2} height={SVG_H + 2}
              style={{ border: '1px solid #90a4ae', background: '#f9f9f9', borderRadius: 3, display: 'block' }}>

              {/* Fondo de página */}
              <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#fff" />

              {/* Marco — c_marco, bounds (0,0,1,1) escalado a toda la página */}
              {marco && (() => {
                // bounds (0,0,1,1) → esquina total del layout
                const r = { x: 0, y: 0, w: SVG_W, h: SVG_H };
                return (
                  <g>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h}
                      fill="none" stroke="#455a64" strokeWidth={2} strokeDasharray="6 3" />
                    <text x={r.x + 4} y={r.y + 10} fontSize={7} fill="#78909c" fontFamily="monospace">
                      c_marco Largo:{marco.largo} Alto:{marco.alto} fill:{marco.fillColor ?? 'none'}
                    </text>
                  </g>
                );
              })()}

              {/* Sello — c_sello_proyecto_canalizacion */}
              {sello && (() => {
                const r = bboxToSvg(sello.bounds);
                return (
                  <g>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h}
                      fill="#fff9c4" stroke="#f9a825" strokeWidth={1} />
                    <text x={r.x + r.w/2} y={r.y + r.h/2 - 4}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={7} fill="#e65100" fontFamily="sans-serif" fontWeight="bold">
                      c_sello_proyecto_canalizacion
                    </text>
                    <text x={r.x + r.w/2} y={r.y + r.h/2 + 6}
                      textAnchor="middle" fontSize={6} fill="#bf360c" fontFamily="monospace">
                      ({sello.bounds.xMin},{sello.bounds.yMin}) → ({sello.bounds.xMax},{sello.bounds.yMax})
                    </text>
                  </g>
                );
              })()}

              {/* Viewport — viewport_layout */}
              {viewport && (() => {
                const r = bboxToSvg(viewport.bounds);
                return (
                  <g>
                    <rect x={r.x} y={r.y} width={r.w} height={r.h}
                      fill="#e3f2fd" stroke="#1565c0" strokeWidth={1.2} />
                    <text x={r.x + r.w/2} y={r.y + r.h/2 - 8}
                      textAnchor="middle" fontSize={7} fill="#0d47a1" fontFamily="sans-serif" fontWeight="bold">
                      viewport_layout
                    </text>
                    <text x={r.x + r.w/2} y={r.y + r.h/2 + 4}
                      textAnchor="middle" fontSize={6} fill="#1565c0" fontFamily="monospace">
                      escala 1:{Math.round(viewport.viewScale)} · {viewport.aceName}
                    </text>
                    <text x={r.x + r.w/2} y={r.y + r.h/2 + 13}
                      textAnchor="middle" fontSize={6} fill="#1565c0" fontFamily="monospace">
                      {viewport.coordinateSystem} · {viewport.displayStyle}
                    </text>
                  </g>
                );
              })()}
            </svg>
            <small style={{ ...st.meta, display: 'block', marginTop: 2 }}>
              Layout: {LAYOUT_W}u × {LAYOUT_H}u · {pagina.elements.length} elementos
            </small>
          </div>

          {/* ── Detalle de elementos ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>

            {/* Marco */}
            {marco && (
              <div style={st.card}>
                <div style={st.cardTitle}>c_marco (marco)</div>
                <table style={st.tbl}>
                  <tbody>
                    {[
                      ['bounds',    `(${marco.bounds.xMin},${marco.bounds.yMin}) → (${marco.bounds.xMax},${marco.bounds.yMax})`],
                      ['Largo',     String(marco.largo)],
                      ['Alto',      String(marco.alto)],
                      ['fillColor', marco.fillColor ?? '_unset (transparente)'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={st.tdK}><code>{k}</code></td>
                        <td style={st.tdV}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sello */}
            {sello && (
              <div style={st.card}>
                <div style={st.cardTitle}>c_sello_proyecto_canalizacion (sello)</div>
                <table style={st.tbl}>
                  <tbody>
                    {[
                      ['bounds',       `(${sello.bounds.xMin},${sello.bounds.yMin}) → (${sello.bounds.xMax},${sello.bounds.yMax})`],
                      ['Inicializa()', sello.inicializado ? 'sí' : 'no'],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={st.tdK}><code>{k}</code></td>
                        <td style={st.tdV}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Viewport */}
            {viewport && (
              <div style={st.card}>
                <div style={st.cardTitle}>viewport_layout (mapa)</div>
                <table style={st.tbl}>
                  <tbody>
                    {[
                      ['bounds',            `(${viewport.bounds.xMin},${viewport.bounds.yMin}) → (${viewport.bounds.xMax},${viewport.bounds.yMax})`],
                      ['centre',            `(${viewport.centre[0].toFixed(0)}, ${viewport.centre[1].toFixed(0)})`],
                      ['viewScale',         `1:${Math.round(viewport.viewScale)}`],
                      ['viewAngle',         `${viewport.viewAngle}°`],
                      ['aceName',           viewport.aceName],
                      ['drawScale',         String(viewport.drawScale)],
                      ['displayStyle',      viewport.displayStyle],
                      ['projection',        viewport.projection],
                      ['coordinateSystem',  viewport.coordinateSystem],
                      ['socName',           viewport.socName],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={st.tdK}><code>{k}</code></td>
                        <td style={st.tdV}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  btn      : { padding: '4px 16px', fontSize: 12, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  hint     : { fontSize: 11, color: '#666', fontStyle: 'italic' },
  card     : { padding: '8px 12px', background: '#f8f9fa', borderRadius: 4, border: '1px solid #dde' },
  cardTitle: { fontWeight: 'bold', fontSize: 11, marginBottom: 6, color: '#2E4057' },
  tbl      : { borderCollapse: 'collapse' as const, width: '100%' },
  tdK      : { padding: '2px 8px 2px 0', fontSize: 10, color: '#555', whiteSpace: 'nowrap' as const },
  tdV      : { padding: '2px 0', fontSize: 11, fontFamily: 'monospace' },
};

export default PlanoDesmontajeCdUI;
