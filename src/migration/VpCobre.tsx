/**
 * Migración de: c_vp_cobre.magik (c_vp_plano_proy_can.magik)
 * Clase Magik:  c_vp_cobre  —  package user
 * Hereda:       viewport_layout
 * Autor orig.:  rbsaldan / GE Network Solutions (06-03-2016)
 *
 * Viewport layout para planos de red de cobre.
 * - Filtra objetos GIS contenidos en la zona límite (oLimite) por intersección espacial.
 * - Genera marcas de esquina (DibujarMarcas) en la ventana de dibujo del viewport.
 *
 * Filtrado espacial  → Turf.js + GeoJSON (pseudo_area + select(:overlaying))
 * Marcas en ventana  → Feature<LineString>[] para añadir a OL VectorSource
 */

import React, { useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature, Polygon, LineString } from 'geojson';

// Descomentar cuando OL esté montado en el proyecto:
// import OlFeature from 'ol/Feature';
// import OlLineString from 'ol/geom/LineString';
// import VectorSource from 'ol/source/Vector';

// =============================================================================
// TIPOS
// =============================================================================

/** bounding_box.new(xmin, ymin, xmax, ymax) en Magik */
export interface BBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/** coordinate(x, y) en Magik */
export type Coord2D = [number, number];

/** layout_attribute_definition en Magik */
export interface AttributeDefinition {
  name:                    string;
  type:                    string;
  description:             string;
  defaultValue:            unknown;
  allowedOnPropertiesPage: boolean;
}

/** Objeto GIS genérico con geometría GeoJSON (rwo en Smallworld) */
export type GisFeature = Feature;

// =============================================================================
// STUB clase base — viewport_layout
// =============================================================================

class CViewportLayout {
  /** _super.geometry_set_for_render — devuelve el result_set base sin filtrar */
  protected geometrySetForRenderBase(rs: GisFeature[] | null): GisFeature[] | null {
    return rs; // stub
  }
  /** _super.draw_content_on — stub del renderizado padre */
  protected drawContentOnBase(_windows: unknown): void { /* stub */ }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CVpCobre extends CViewportLayout {

  /** Magik: define_shared_constant(:SANGRIA_VER, 200, :public) */
  static readonly SANGRIA_VER = 200;

  /** Magik: define_shared_constant(:SANGRIA_HOR, 200, :public) */
  static readonly SANGRIA_HOR = 200;

  /** Magik: define_shared_constant(:allowed_on_menu?, _false, :public) */
  static readonly ALLOWED_ON_MENU = false;

  /** Magik: {:oWindows, _unset, :writable, :public} — slot de instancia */
  oWindows: unknown = null;

  /** Magik: atributo oLimite (:sector) — zona de estudio de población */
  oLimite: Feature<Polygon> | null = null;

  /**
   * Magik: c_vp_cobre.defined_attributes
   *
   *   LcollAtributos << rope.new_from(_super.defined_attributes)
   *   LcollAtributos.add(layout_attribute_definition.new(:oLimite, :sector,
   *     :description, "Geometria Limite",
   *     :default_value, _unset,
   *     :allowed_on_properties_page?, _true,
   *     :editor, _unset))
   *   >> LcollAtributos
   */
  static definedAttributes(): AttributeDefinition[] {
    return [
      {
        name:                    'oLimite',
        type:                    'sector',   // :sector en Magik
        description:             'Geometria Limite',
        defaultValue:            null,       // _unset
        allowedOnPropertiesPage: true,       // _true
      },
    ];
  }

  /**
   * Magik: c_vp_cobre.geometry_set_for_render
   *
   *   !current_coordinate_system! << _unset
   *   result_set << _super.geometry_set_for_render
   *   _if result_set _isnt _unset
   *     result_set << _self.objetos_visibles(result_set)
   *   >> result_set
   *
   * !current_coordinate_system! << _unset → no aplica en TS (sistema de referencia
   * se gestiona a nivel de mapa OL, no por contexto dinámico).
   */
  geometrySetForRender(resultSet: GisFeature[] | null): GisFeature[] | null {
    const base = this.geometrySetForRenderBase(resultSet);
    if (base !== null && base.length > 0) {
      return this.objetosVisibles(base);
    }
    return base;
  }

  /**
   * Magik: c_vp_cobre.objetos_visibles(PcollResultSet)
   *
   *   _if _self.oLimite _isnt _unset
   *     LoAreaEstPob = pseudo_area.new_with_sectors(_self.oLimite.sectors)
   *     LcollResulSet = LcollResultSet.select(:overlaying, LoAreaEstPob)
   *   _else
   *     LcollResulSet = PcollResultSet
   *   >> LcollResulSet
   *
   * pseudo_area.new_with_sectors + select(:overlaying, area)
   * → turf.booleanIntersects(feature, oLimite)
   */
  objetosVisibles(resultSet: GisFeature[]): GisFeature[] {
    if (this.oLimite === null) {
      // oLimite _is _unset → devuelve conjunto completo sin filtrar
      return resultSet;
    }
    // pseudo_area + select(:overlaying) ≡ filtrar por intersección espacial
    return resultSet.filter(f => turf.booleanIntersects(f, this.oLimite!));
  }

  /**
   * Magik: c_vp_cobre.draw_content_on(windows, _optional PbMarcoCompleto?)
   *
   *   .oWindows << windows
   *   _super.draw_content_on(windows)
   *   # _self.DibujarMarcas(windows, 200, _self.layout_page, PbMarcoCompleto?)
   *     ↑ comentado en el Magik original
   */
  drawContentOn(windows: unknown, _marcoCompleto?: boolean): void {
    this.oWindows = windows;
    this.drawContentOnBase(windows);
    // DibujarMarcas permanece comentado como en el Magik original
  }

  /**
   * Magik: c_vp_cobre.DibujarMarcas(PoWindow, PnAncho, _optional PoPage, PbMarcoCompleto?)
   *
   * Genera 4 marcas de esquina en L sobre el bounding box ajustado con SANGRIA.
   *
   * Lógica de coordenadas (a = PnAncho):
   *
   *   Inf. izquierda:  (xmin, ymin+a) → (xmin, ymin)   → (xmin+a, ymin)
   *                    [+marcoCompleto → (xmax-a, ymin)]
   *
   *   Inf. derecha:    (xmax-a, ymin) → (xmax, ymin)   → (xmax, ymin+a)
   *                    [+marcoCompleto → (xmax, ymax-a)]
   *
   *   Sup. derecha:    (xmax, ymax-a) → (xmax, ymax)   → (xmax-a, ymax)
   *                    [+marcoCompleto → (xmin+a, ymax)]
   *
   *   Sup. izquierda:  (xmin+a, ymax) → (xmin, ymax)   → (xmin, ymax-a)
   *                    [+marcoCompleto → (xmin, ymin+a)]
   *
   * Con marcoCompleto=true cada sector encadena con el inicio del siguiente,
   * formando un marco continuo (full rectangle frame).
   *
   * Retorna Feature<LineString>[] para añadir a un OL VectorSource.
   * (En Magik: LcollEsquinas.draw_on(.oWindows, colour.called(:black)))
   */
  dibujarMarcas(
    ancho:         number,
    bounds?:       BBox,
    marcoCompleto = false,
  ): Feature<LineString>[] {

    // LoBounds = PoPage.default(_self).bounds → fallback a bounds por defecto
    const raw = bounds ?? { xmin: 0, ymin: 0, xmax: 1000, ymax: 1000 };

    // Aplica SANGRIA: bounding_box.new(xmin+SANGRIA, ymin+SANGRIA, xmax-SANGRIA, ymax-SANGRIA)
    const b: BBox = {
      xmin: raw.xmin + CVpCobre.SANGRIA_HOR,
      ymin: raw.ymin + CVpCobre.SANGRIA_VER,
      xmax: raw.xmax - CVpCobre.SANGRIA_HOR,
      ymax: raw.ymax - CVpCobre.SANGRIA_VER,
    };

    const { xmin, ymin, xmax, ymax } = b;
    const a = ancho;

    // sector.new() + add() × 4 esquinas
    const sectors: Coord2D[][] = [
      mkCorner([xmin, ymin + a], [xmin, ymin],   [xmin + a, ymin], marcoCompleto ? [xmax - a, ymin] : null),
      mkCorner([xmax - a, ymin], [xmax, ymin],   [xmax, ymin + a], marcoCompleto ? [xmax, ymax - a] : null),
      mkCorner([xmax, ymax - a], [xmax, ymax],   [xmax - a, ymax], marcoCompleto ? [xmin + a, ymax] : null),
      mkCorner([xmin + a, ymax], [xmin, ymax],   [xmin, ymax - a], marcoCompleto ? [xmin, ymin + a] : null),
    ];

    // LcollEsquinas.draw_on(.oWindows, colour.called(:black))
    // → OL: source.addFeature(new OlFeature({ geometry: new OlLineString(coords) }))
    return sectors.map(coords => turf.lineString(coords) as Feature<LineString>);
  }

  /**
   * Integración OL: añade las marcas directamente a un VectorSource.
   * Descomenta las líneas OL cuando la librería esté disponible.
   */
  addMarcasToSource(
    // source: VectorSource,
    ancho:         number,
    bounds?:       BBox,
    marcoCompleto = false,
  ): Feature<LineString>[] {
    const features = this.dibujarMarcas(ancho, bounds, marcoCompleto);
    // features.forEach(f =>
    //   source.addFeature(new OlFeature({ geometry: new OlLineString(f.geometry.coordinates as number[][]) }))
    // );
    return features;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/** sector.new() + add() × n: construye un sector L con 3 ó 4 puntos */
function mkCorner(p0: Coord2D, p1: Coord2D, p2: Coord2D, p3: Coord2D | null): Coord2D[] {
  const pts: Coord2D[] = [p0, p1, p2];
  if (p3 !== null) pts.push(p3);
  return pts;
}

// =============================================================================
// MOCK — datos de demo
// =============================================================================

const DEMO_BOUNDS: BBox = { xmin: 0, ymin: 0, xmax: 1400, ymax: 1000 };

/** Features GIS de prueba (cables de cobre + empalmes) */
const MOCK_FEATURES: GisFeature[] = [
  turf.lineString([[200, 200], [600, 200]], { id: 'CAB-01', tipo: 'cable_cobre' }) as GisFeature,
  turf.lineString([[700, 400], [1100, 400]], { id: 'CAB-02', tipo: 'cable_cobre' }) as GisFeature,
  turf.lineString([[300, 700], [900, 700]], { id: 'CAB-03', tipo: 'cable_cobre' }) as GisFeature,
  turf.point([500, 500], { id: 'EMP-01', tipo: 'empalme' }) as GisFeature,
  turf.point([1050, 250], { id: 'EMP-02', tipo: 'empalme' }) as GisFeature,
];

/** Polígono límite (oLimite) — zona de estudio de población */
const MOCK_LIMITE: Feature<Polygon> = turf.polygon([[
  [150, 150], [850, 150], [850, 800], [150, 800], [150, 150],
]]) as Feature<Polygon>;

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

const SVG_W = 560;
const SVG_H = 400;

/** Convierte coordenadas del espacio layout → espacio SVG (Y invertido) */
function toSvg(x: number, y: number, b: BBox): [number, number] {
  const pw = SVG_W / (b.xmax - b.xmin);
  const ph = SVG_H / (b.ymax - b.ymin);
  return [(x - b.xmin) * pw, SVG_H - (y - b.ymin) * ph];
}

function coordsToPath(coords: number[][], b: BBox): string {
  return coords.map(([x, y], i) => {
    const [sx, sy] = toSvg(x, y, b);
    return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)} ${sy.toFixed(1)}`;
  }).join(' ');
}

export function VpCobreUI() {
  const [marcoCompleto, setMarcoCompleto] = useState(false);
  const [ancho,         setAncho]         = useState(80);
  const [usarLimite,    setUsarLimite]    = useState(true);
  const [showSangria,   setShowSangria]   = useState(true);

  const vp       = new CVpCobre();
  vp.oLimite     = usarLimite ? MOCK_LIMITE : null;

  // geometry_set_for_render → objetos_visibles
  const filtrados = vp.geometrySetForRender([...MOCK_FEATURES]) ?? [];
  const filtSet   = new Set(filtrados.map(f => f.properties?.id as string));

  // dibujarMarcas
  const marcas = vp.dibujarMarcas(ancho, DEMO_BOUNDS, marcoCompleto);

  // Bounds con SANGRIA aplicada (para visualización)
  const bS: BBox = {
    xmin: DEMO_BOUNDS.xmin + CVpCobre.SANGRIA_HOR,
    ymin: DEMO_BOUNDS.ymin + CVpCobre.SANGRIA_VER,
    xmax: DEMO_BOUNDS.xmax - CVpCobre.SANGRIA_HOR,
    ymax: DEMO_BOUNDS.ymax - CVpCobre.SANGRIA_VER,
  };

  const [bx0, by0] = toSvg(DEMO_BOUNDS.xmin, DEMO_BOUNDS.ymin, DEMO_BOUNDS);
  const [bx1, by1] = toSvg(DEMO_BOUNDS.xmax, DEMO_BOUNDS.ymax, DEMO_BOUNDS);
  const [sx0, sy0] = toSvg(bS.xmin, bS.ymin, DEMO_BOUNDS);
  const [sx1, sy1] = toSvg(bS.xmax, bS.ymax, DEMO_BOUNDS);

  const limPts = MOCK_LIMITE.geometry.coordinates[0]
    .map(([x, y]) => { const [a, b] = toSvg(x, y, DEMO_BOUNDS); return `${a.toFixed(1)},${b.toFixed(1)}`; })
    .join(' ');

  const CORNER_LABELS = ['Inf. izquierda', 'Inf. derecha', 'Sup. derecha', 'Sup. izquierda'];

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_vp_cobre — Viewport layout red de cobre</h3>

      {/* Controles */}
      <div style={s.controls}>
        <label style={s.chk}>
          <input type="checkbox" checked={usarLimite}
            onChange={e => setUsarLimite(e.target.checked)} />
          oLimite activo → objetos_visibles filtra por intersección espacial
        </label>
        <label style={s.chk}>
          <input type="checkbox" checked={marcoCompleto}
            onChange={e => setMarcoCompleto(e.target.checked)} />
          PbMarcoCompleto? → encadena esquinas (4 puntos por sector, marco continuo)
        </label>
        <label style={s.chk}>
          <input type="checkbox" checked={showSangria}
            onChange={e => setShowSangria(e.target.checked)} />
          Mostrar zona SANGRIA (SANGRIA_HOR/VER = {CVpCobre.SANGRIA_HOR} u.m.)
        </label>
        <div style={s.row}>
          <label style={s.lbl}>PnAncho (longitud de la marca)</label>
          <input type="range" min={20} max={200} value={ancho}
            onChange={e => setAncho(+e.target.value)} style={{ flex: 1 }} />
          <span style={s.val}>{ancho}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>

        {/* Visualización SVG */}
        <div>
          <p style={s.subtitle}>Viewport — DibujarMarcas + objetos_visibles</p>
          <svg width={SVG_W} height={SVG_H}
            style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block' }}>

            {/* Outer bounds */}
            <rect x={bx0} y={by1} width={bx1 - bx0} height={by0 - by1}
              fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="6,3" />

            {/* Zona SANGRIA */}
            {showSangria && (
              <rect x={sx0} y={sy1} width={sx1 - sx0} height={sy0 - sy1}
                fill="rgba(255,200,0,0.07)" stroke="#e8b000"
                strokeWidth={1} strokeDasharray="3,2" />
            )}

            {/* Polígono oLimite */}
            {usarLimite && (
              <polygon points={limPts}
                fill="rgba(0,120,255,0.07)" stroke="#0078ff"
                strokeWidth={1.5} strokeDasharray="6,3" />
            )}

            {/* Features GIS */}
            {MOCK_FEATURES.map(f => {
              const id  = f.properties?.id as string;
              const inc = filtSet.has(id);
              const col = inc ? '#0055cc' : '#ccc';

              if (f.geometry.type === 'LineString') {
                return (
                  <path key={id}
                    d={coordsToPath(f.geometry.coordinates as number[][], DEMO_BOUNDS)}
                    fill="none" stroke={col} strokeWidth={inc ? 2 : 1.5}
                    strokeDasharray={inc ? undefined : '4,3'} />
                );
              }
              if (f.geometry.type === 'Point') {
                const [cx, cy] = toSvg(
                  (f.geometry.coordinates as number[])[0],
                  (f.geometry.coordinates as number[])[1],
                  DEMO_BOUNDS,
                );
                return (
                  <circle key={id} cx={cx} cy={cy} r={5}
                    fill={col} opacity={inc ? 1 : 0.4} />
                );
              }
              return null;
            })}

            {/* Marcas de esquina DibujarMarcas → negro */}
            {marcas.map((m, i) => (
              <path key={`mk-${i}`}
                d={coordsToPath(m.geometry.coordinates as number[][], DEMO_BOUNDS)}
                fill="none" stroke="#000" strokeWidth={2.5} strokeLinecap="square" />
            ))}

            {/* Info */}
            <text x={6}  y={14} fontSize={9} fill="#999">
              SANGRIA {CVpCobre.SANGRIA_HOR}×{CVpCobre.SANGRIA_VER} | Bounds {DEMO_BOUNDS.xmax}×{DEMO_BOUNDS.ymax}
            </text>
          </svg>
          <p style={s.meta}>
            ■ negro: marcas esquina &nbsp;■ azul: features incluidas &nbsp;■ gris-punteado: excluidas por oLimite
          </p>
        </div>

        {/* Panel derecho */}
        <div style={{ flex: 1, minWidth: 260 }}>

          {/* Filtrado */}
          <p style={s.subtitle}>geometry_set_for_render → objetos_visibles</p>
          <table style={s.table}>
            <thead>
              <tr>{['ID', 'Geometría', 'Incluido'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MOCK_FEATURES.map(f => {
                const id  = f.properties?.id as string;
                const inc = filtSet.has(id);
                return (
                  <tr key={id} style={{ background: inc ? undefined : '#f9f9f9' }}>
                    <td style={s.td}><code>{id}</code></td>
                    <td style={s.td}>{f.geometry.type}</td>
                    <td style={{ ...s.td, textAlign: 'center' as const,
                      color: inc ? '#080' : '#bbb', fontWeight: inc ? 'bold' : 'normal' }}>
                      {inc ? '✓' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Marcas */}
          <p style={{ ...s.subtitle, marginTop: 10 }}>DibujarMarcas — marcas generadas</p>
          <table style={s.table}>
            <thead>
              <tr>{['Esquina', 'Puntos', 'P0 (inicio)'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {CORNER_LABELS.map((lbl, i) => {
                const coords = marcas[i].geometry.coordinates as number[][];
                return (
                  <tr key={lbl}>
                    <td style={s.td}>{lbl}</td>
                    <td style={{ ...s.td, textAlign: 'center' as const }}>{coords.length}</td>
                    <td style={s.td}>
                      <code style={{ fontSize: 10 }}>
                        ({Math.round(coords[0][0])}, {Math.round(coords[0][1])})
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Atributos */}
          <p style={{ ...s.subtitle, marginTop: 10 }}>defined_attributes</p>
          <table style={s.table}>
            <thead>
              <tr>{['name', 'type', 'properties page'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {CVpCobre.definedAttributes().map(a => (
                <tr key={a.name}>
                  <td style={s.td}><code>{a.name}</code></td>
                  <td style={s.td}>{a.type}</td>
                  <td style={{ ...s.td, textAlign: 'center' as const }}>
                    {a.allowedOnPropertiesPage ? '✓' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame   : { display:'flex', flexDirection:'column', gap:12, width:840, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title   : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle: { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta    : { margin:'4px 0 0', fontSize:10, color:'#888' },
  controls: { display:'flex', flexDirection:'column', gap:6 },
  row     : { display:'flex', alignItems:'center', gap:8 },
  chk     : { display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer' },
  lbl     : { minWidth:200, fontSize:11, color:'#555' },
  val     : { minWidth:28, textAlign:'right', fontSize:12, fontFamily:'monospace' },
  table   : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th      : { background:'#2E4057', color:'#fff', padding:'4px 8px', textAlign:'left' as const, fontSize:11 },
  td      : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:12 },
};

export default VpCobreUI;
