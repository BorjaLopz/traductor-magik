/**
 * Migración: c_vp_detalle_interno_edificio.magik
 * Clase Magik:  c_vp_detalle_interno_edificio — extiende viewport_layout
 * Autor original: fhramire — GE Network Solutions — 24/05/2011
 *
 * Viewport de detalle interno de edificio (plano de planta TBA).
 *
 * Métodos migrados:
 *   initialise_for_page(a_layout_page)  → initializeForPage(page)
 *   geometry_set_for_render             → geometrySetForRender()
 *   draw_content_on(windows)            → drawContentOn()  — delega a super
 *   agregar_titulo(PoPage)              → agregarTitulo(page)
 *
 * Equivalencias clave:
 *   viewport_layout                 → ViewportLayoutBase (stub)
 *   bounding_box.new(x0,y0,x1,y1)  → BoundingBox (importado de TituloDePlano)
 *   c_titulo_de_plano.new_with(...) → TituloConfig + renderizado SVG (ver [12])
 *   composite_geometry_set          → GeoJSON FeatureCollection (Turf.js)
 *   !current_coordinate_system! = _unset → sin transformación CRS al renderizar
 *   ace_name = :mit_floor_internal  → constante identificadora del estilo ACE
 *
 * Layout del plano:
 *   ┌────────────────────────────┐  ← bounds.ymin (Magik Y-up)
 *   │  Viewport (planta edificio) │
 *   └────────────────────────────┘  ← bounds.ymax / bounds.ymin (Magik Y-up)
 *   ┌────────────────────────────┐  ← ymin − 100 (Magik) = viewport + 100u abajo
 *   │  DETALLE DE EDIFICIO (tit) │
 *   └────────────────────────────┘
 */

import React, { useState } from 'react';
import type { BoundingBox } from './TituloDePlano';

// =============================================================================
// TIPOS
// =============================================================================

/** GeoJSON mínimo — Turf.js re-exporta estos tipos; se definen inline para autocontención */
interface GeoJsonPolygon { type: 'Polygon'; coordinates: number[][][]; }
interface GeoJsonPoint  { type: 'Point';   coordinates: number[]; }
type GeoJsonGeometry = GeoJsonPolygon | GeoJsonPoint;

export interface EdificioFeature {
  type      : 'Feature';
  properties: Record<string, string>;
  geometry  : GeoJsonGeometry;
}

export interface EdificioFeatureCollection {
  type    : 'FeatureCollection';
  features: EdificioFeature[];
}

/** Magik: atributos de c_titulo_de_plano.new_with(...) */
export interface TituloConfig {
  bounds         : BoundingBox;          // bounding_box.new(...)
  fontName       : string;               // :font_name, "bold"
  fontSize       : number;               // :font_size, tamanio (= 8)
  fillStyle      : null;                 // :fill_style, _unset
  outlineStyle   : null;                 // :outline_style, _unset
  text           : string;               // :text, "DETALLE DE EDIFICIO"
  wrap           : boolean;              // :wrap, _false
  alignHorizontal: 'centre' | 'left' | 'right'; // :align_horizontal, :centre
  alignVertical  : 'centre' | 'top' | 'bottom'; // :align_vertical, :centre
  orientation    : 'left_right';         // :orientation, :left_right
}

/** Magik: layout_page — acumula elementos del plano */
export interface ILayoutPage {
  elementos: TituloConfig[];
  addElement(el: TituloConfig): void;
}

export class MockLayoutPage implements ILayoutPage {
  elementos: TituloConfig[] = [];
  addElement(el: TituloConfig): void { this.elementos.push(el); }
}

// =============================================================================
// BASE — viewport_layout (stub — pendiente migración)
// =============================================================================

/**
 * Stub para viewport_layout — base de viewports de plano en Smallworld.
 * Aporta bounds propios y geometrías de render (mock).
 */
export class ViewportLayoutBase {
  aceName: string                            = '';
  bounds : BoundingBox                       = { xMin: 0, xMax: 200, yMin: 0, yMax: 150 };
  oResulSet: EdificioFeatureCollection | null = null;

  // Magik: _super.geometry_set_for_render → devuelve geometrías del viewport
  protected superGeometrySetForRender(): EdificioFeatureCollection {
    return MOCK_FLOOR_PLAN;
  }

  // Magik: _super.draw_content_on(windows) → renderizado base del viewport
  protected superDrawContentOn(): void { /* delegado al SVG del componente React */ }
}

// =============================================================================
// DATOS MOCK — composite_geometry_set
// Representa las geometrías devueltas por geometry_set_for_render.
// En producción: obtenidas de la base de datos GIS (sigc_style_view / ACE :mit_floor_internal).
// Coordenadas: SVG Y-down, origen (0,0) = esquina superior-izquierda del viewport.
// =============================================================================

const MOCK_FLOOR_PLAN: EdificioFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Muro exterior del edificio
    {
      type: 'Feature',
      properties: { tipo: 'muro_exterior', nombre: 'Edificio TBA', color: '#78909c' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0,0],[200,0],[200,150],[0,150],[0,0]]],
      },
    },
    // Sala principal de telecomunicaciones
    {
      type: 'Feature',
      properties: { tipo: 'sala_principal', nombre: 'Sala TBA', color: '#eceff1' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[8,8],[145,8],[145,142],[8,142],[8,8]]],
      },
    },
    // Rack A — fibra óptica
    {
      type: 'Feature',
      properties: { tipo: 'rack', nombre: 'Rack A', color: '#b0bec5' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[15,15],[40,15],[40,55],[15,55],[15,15]]],
      },
    },
    // Rack B — cobre/distribución
    {
      type: 'Feature',
      properties: { tipo: 'rack', nombre: 'Rack B', color: '#b0bec5' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[15,65],[40,65],[40,105],[15,105],[15,65]]],
      },
    },
    // Rack C — equipos activos
    {
      type: 'Feature',
      properties: { tipo: 'rack', nombre: 'Rack C', color: '#b0bec5' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[15,115],[40,115],[40,135],[15,135],[15,115]]],
      },
    },
    // Corredor de servicio
    {
      type: 'Feature',
      properties: { tipo: 'corredor', nombre: 'Corredor', color: '#f5f5f5' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[153,8],[192,8],[192,142],[153,142],[153,8]]],
      },
    },
    // Zona de acceso / entrada
    {
      type: 'Feature',
      properties: { tipo: 'acceso', nombre: 'Acceso', color: '#e3f2fd' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[145,55],[153,55],[153,95],[145,95],[145,55]]],
      },
    },
  ],
};

// =============================================================================
// CLASE — c_vp_detalle_interno_edificio
// =============================================================================

export class CVpDetalleInternoEdificio extends ViewportLayoutBase {

  // Magik: define_shared_variable(:titulo, "", :public)
  static titulo = '';

  // Magik: define_shared_constant(:tamanio, 8, :public)
  static readonly TAMANIO = 8;

  // Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: constante identificadora del estilo ACE
  static readonly ACE_NAME = 'mit_floor_internal';

  // ---------------------------------------------------------------------------
  // initialise_for_page(a_layout_page)
  //
  // Magik:
  //   _self.ace_name << :mit_floor_internal
  //   _self.agregar_titulo(a_layout_page)
  // ---------------------------------------------------------------------------
  initializeForPage(page: ILayoutPage): void {
    this.aceName = CVpDetalleInternoEdificio.ACE_NAME;
    this.agregarTitulo(page);
  }

  // ---------------------------------------------------------------------------
  // geometry_set_for_render
  //
  // Magik:
  //   _dynamic !current_coordinate_system!
  //   !current_coordinate_system! << _unset   ← sin transformación CRS
  //   LcollGeometrias << _super.geometry_set_for_render
  //   .oResulSet << LcollGeometrias
  //   >> .oResulSet
  // ---------------------------------------------------------------------------
  geometrySetForRender(): EdificioFeatureCollection {
    // !current_coordinate_system! = _unset → coordenadas nativas, sin reproyección
    // En OL: usar la proyección nativa del datasource sin transformar
    const geometrias = this.superGeometrySetForRender();
    this.oResulSet = geometrias;
    return this.oResulSet;
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(windows)
  //
  // Magik:
  //   _super.draw_content_on(windows)   ← pura delegación
  // ---------------------------------------------------------------------------
  drawContentOn(): void {
    this.superDrawContentOn();
  }

  // ---------------------------------------------------------------------------
  // agregar_titulo(PoPage)
  //
  // Magik:
  //   LoBounds << bounding_box.new(
  //       _self.bounds.xmin,
  //       _self.bounds.ymin - 100,   ← 100u DEBAJO del viewport (Magik Y-up)
  //       _self.bounds.xmax,
  //       _self.bounds.ymin          ← borde inferior del viewport
  //   )
  //   LoTitulo << "DETALLE DE EDIFICIO"
  //   LoTitulo << c_titulo_de_plano.new_with(
  //       :bounds, LoBounds, :font_name, "bold", :font_size, _self.tamanio,
  //       :fill_style, _unset, :outline_style, _unset,
  //       :text, LoTitulo, :wrap, _false,
  //       :align_horizontal, :centre, :align_vertical, :centre,
  //       :orientation, :left_right
  //   )
  //   PoPage.add_element(LoTitulo)
  //
  // SVG Y-down: ymin-100 (Magik Y-up) → yMax + 100 (SVG Y-down)
  // La barra de título se renderiza DEBAJO del viewport: desde yMax hasta yMax+100.
  // ---------------------------------------------------------------------------
  agregarTitulo(page: ILayoutPage): void {
    // Magik Y-up: ymin − 100  →  SVG Y-down: yMax (=bounds.yMax) como inicio de barra
    const tituloBounds: BoundingBox = {
      xMin: this.bounds.xMin,
      yMin: this.bounds.yMax,           // SVG: empieza en el borde inferior del viewport
      xMax: this.bounds.xMax,
      yMax: this.bounds.yMax + 100,     // SVG: 100u más abajo (Magik: ymin - 100)
    };

    // c_titulo_de_plano.new_with(...) — ver migración [12]
    const tituloEl: TituloConfig = {
      bounds         : tituloBounds,
      fontName       : 'bold',
      fontSize       : CVpDetalleInternoEdificio.TAMANIO,
      fillStyle      : null,          // Magik: _unset
      outlineStyle   : null,          // Magik: _unset
      text           : 'DETALLE DE EDIFICIO',
      wrap           : false,         // Magik: _false
      alignHorizontal: 'centre',
      alignVertical  : 'centre',
      orientation    : 'left_right',
    };

    page.addElement(tituloEl);
  }
}

// =============================================================================
// UTILIDADES SVG
// =============================================================================

const COLORES_TIPO: Record<string, string> = {
  muro_exterior : '#78909c',
  sala_principal: '#eceff1',
  rack          : '#b0bec5',
  corredor      : '#f5f5f5',
  acceso        : '#e3f2fd',
};

function renderFeature(
  f       : EdificioFeature,
  scale   : number,
  etiqueta: boolean,
): React.ReactNode {
  if (f.geometry.type !== 'Polygon') return null;
  const coords = f.geometry.coordinates[0];
  const points = coords.map(([x, y]) => `${x * scale},${y * scale}`).join(' ');
  const fill   = COLORES_TIPO[f.properties.tipo] ?? '#cfd8dc';
  const tipo   = f.properties.tipo;
  const [cx, cy] = coords.reduce(
    ([ax, ay], [x, y]) => [ax + x / coords.length, ay + y / coords.length],
    [0, 0],
  );

  return (
    <g key={f.properties.nombre}>
      <polygon
        points={points}
        fill={fill}
        stroke={tipo === 'muro_exterior' ? '#455a64' : '#90a4ae'}
        strokeWidth={tipo === 'muro_exterior' ? 1.5 : 0.8}
      />
      {etiqueta && tipo !== 'muro_exterior' && (
        <text
          x={cx * scale} y={cy * scale}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.max(5, scale * 5)}
          fill={tipo === 'rack' ? '#1a237e' : '#37474f'}
          fontFamily="sans-serif"
          fontWeight={tipo === 'rack' ? 'bold' : 'normal'}
        >
          {f.properties.nombre}
        </text>
      )}
    </g>
  );
}

// =============================================================================
// COMPONENTE REACT — demo del viewport de detalle interno de edificio
// =============================================================================

export function VpDetalleInternoEdificioUI() {
  const [tituloText, setTituloText] = useState('DETALLE DE EDIFICIO');
  const [tamanio,    setTamanio   ] = useState(CVpDetalleInternoEdificio.TAMANIO);
  const [scale,      setScale     ] = useState(2.5);       // SVG px / unidad Magik
  const [etiquetas,  setEtiquetas ] = useState(true);
  const [showProps,  setShowProps ] = useState(false);

  // Instanciar y ejecutar el ciclo de vida del componente
  const vp   = new CVpDetalleInternoEdificio();
  const page = new MockLayoutPage();

  vp.initializeForPage(page);

  // Sobreescribir el título del elemento antes de renderizar
  if (page.elementos.length > 0) {
    page.elementos[0].text    = tituloText;
    page.elementos[0].fontSize = tamanio;
  }

  const geoSet   = vp.geometrySetForRender();
  const tituloEl = page.elementos[0];

  const { xMin, xMax, yMin, yMax } = vp.bounds;
  const vpW     = (xMax - xMin) * scale;
  const vpH     = (yMax - yMin) * scale;
  const titleH  = 100 * scale;   // 100 unidades Magik debajo del viewport
  const svgW    = vpW + 2;
  const svgH    = vpH + titleH + 2;

  // Font size en px para el título: fontSize Magik (8u) × scale
  const titleFontPx = Math.max(8, tamanio * scale * 1.2);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_vp_detalle_interno_edificio</h3>
      <p style={s.meta}>
        Viewport de detalle de planta de edificio TBA —
        ACE: <code>:mit_floor_internal</code> ·
        tamanio: <code>{tamanio}u</code> ·
        oResulSet: <code>{geoSet.features.length} features</code>
      </p>

      {/* ── Controles ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          Título:
          <input
            type="text" value={tituloText}
            onChange={e => setTituloText(e.target.value)}
            style={{ ...s.textInput, width: 220 }}
          />
        </label>

        <label style={s.lbl}>
          font_size:
          <input
            type="number" value={tamanio} min={4} max={24}
            onChange={e => setTamanio(Number(e.target.value))}
            style={s.numInput}
          />u
        </label>

        <label style={s.lbl}>
          Escala:
          <input
            type="range" min={1} max={5} step={0.5} value={scale}
            onChange={e => setScale(Number(e.target.value))}
            style={{ width: 70 }}
          />
          {scale}px/u
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={etiquetas} onChange={e => setEtiquetas(e.target.checked)} />
          {' '}Etiquetas
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={showProps} onChange={e => setShowProps(e.target.checked)} />
          {' '}Propiedades
        </label>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── SVG: viewport + barra de título ── */}
        <div>
          <svg
            width={svgW} height={svgH}
            style={{ border: '1px solid #90a4ae', borderRadius: 3, background: '#fff' }}
          >
            {/* ── Viewport — planta del edificio ── */}
            <rect x={0} y={0} width={vpW} height={vpH} fill="#fafafa" stroke="none" />

            {/* Magik: oResulSet ← geometry_set_for_render() */}
            {geoSet.features.map(f => renderFeature(f, scale, etiquetas))}

            {/* Borde del viewport */}
            <rect x={0} y={0} width={vpW} height={vpH}
              fill="none" stroke="#455a64" strokeWidth={1.5} />

            {/* Indicador de escala (watermark) */}
            <text x={4} y={vpH - 4} fontSize={7} fill="#90a4ae" fontFamily="monospace">
              scale {scale}px/u · ACE: mit_floor_internal
            </text>

            {/* ── Barra de título — agregar_titulo() ── */}
            {/* Magik: bounding_box.new(xmin, ymin−100, xmax, ymin) → 100u debajo */}
            <rect
              x={0} y={vpH} width={vpW} height={titleH}
              fill="#e8eaf6" stroke="#455a64" strokeWidth={1}
            />
            {tituloEl && (
              <text
                x={vpW / 2} y={vpH + titleH / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={titleFontPx}
                fontWeight="bold"
                fill="#1a237e"
                fontFamily="sans-serif"
                letterSpacing={1.5}
              >
                {tituloEl.text}
              </text>
            )}

            {/* Anotación de la estructura de bounds */}
            {showProps && (
              <>
                <line x1={vpW + 1} y1={0}   x2={vpW + 1} y2={vpH}          stroke="#f48fb1" strokeWidth={0.8} strokeDasharray="3,2" />
                <line x1={vpW + 1} y1={vpH}  x2={vpW + 1} y2={vpH + titleH} stroke="#a5d6a7" strokeWidth={0.8} strokeDasharray="3,2" />
                <text x={4}    y={12}           fontSize={7} fill="#c62828">bounds.yMin={yMin}  bounds.yMax={yMax}</text>
                <text x={4}    y={vpH + 12}     fontSize={7} fill="#2e7d32">title: yMin−100={yMin}  yMax={yMin} (Magik Y-up)</text>
              </>
            )}
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG {Math.round(svgW)}×{Math.round(svgH)}px ·
            viewport {Math.round(vpW)}×{Math.round(vpH)}px ·
            título {Math.round(vpW)}×{Math.round(titleH)}px
          </small>
        </div>

        {/* ── Tablas de propiedades ── */}
        {showProps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            <table style={s.table}>
              <thead>
                <tr>{['Propiedad', 'Valor', 'Magik origen'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {[
                  { k: 'aceName',       v: vp.aceName,                           m: 'define_shared_constant ACE_NAME' },
                  { k: 'titulo',        v: CVpDetalleInternoEdificio.titulo,     m: 'define_shared_variable' },
                  { k: 'tamanio',       v: CVpDetalleInternoEdificio.TAMANIO,    m: 'define_shared_constant' },
                  { k: 'allowedOnMenu', v: String(CVpDetalleInternoEdificio.ALLOWED_ON_MENU), m: 'define_shared_constant _false' },
                  { k: 'oResulSet',     v: `${vp.oResulSet?.features.length ?? '?'} features`, m: '{:oResulSet, _unset, :writable, :public}' },
                ].map(({ k, v, m }, i) => (
                  <tr key={k} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}><code>{k}</code></td>
                    <td style={{ ...s.td, fontWeight: 'bold' }}>{String(v)}</td>
                    <td style={{ ...s.td, fontSize: 10, color: '#777' }}>{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table style={s.table}>
              <thead>
                <tr>{['Bound / Eje', 'Unidades Magik', 'SVG px', 'Nota'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {[
                  { eje: 'Viewport xMin',  u: xMin, px: xMin * scale,       nota: 'bounds.xMin' },
                  { eje: 'Viewport xMax',  u: xMax, px: xMax * scale,       nota: 'bounds.xMax' },
                  { eje: 'Viewport yMin',  u: yMin, px: yMin * scale,       nota: 'bounds.yMin (SVG top)' },
                  { eje: 'Viewport yMax',  u: yMax, px: yMax * scale,       nota: 'bounds.yMax (SVG bottom)' },
                  { eje: 'Título yMin',    u: yMax, px: vpH,                nota: '= bounds.yMax (SVG Y-down)' },
                  { eje: 'Título yMax',    u: yMax + 100, px: vpH + titleH, nota: 'Magik: bounds.yMin − 100' },
                ].map(({ eje, u, px, nota }, i) => (
                  <tr key={eje} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={s.td}>{eje}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{u}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{Math.round(px)}</td>
                    <td style={{ ...s.td, fontSize: 10, color: '#777' }}>{nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table style={s.table}>
              <thead>
                <tr>{['Feature (oResulSet)', 'Tipo', 'Magik: composite_geometry_set'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {geoSet.features.map((f, i) => (
                  <tr key={f.properties.nombre} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={{ ...s.td, fontWeight: 'bold' }}>{f.properties.nombre}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}>{f.properties.tipo}</td>
                    <td style={{ ...s.td, fontSize: 10, color: '#777' }}>geometry_set_for_render → oResulSet</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>!current_coordinate_system! = _unset</code> → sin reproyección CRS.{' '}
        Título creado con <code>c_titulo_de_plano.new_with</code> (ver migración [12]).{' '}
        <code>draw_content_on</code> delega a <code>_super</code> sin lógica propia.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  textInput: { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  numInput : { width: 45, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  table    : { borderCollapse: 'collapse' },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default VpDetalleInternoEdificioUI;
