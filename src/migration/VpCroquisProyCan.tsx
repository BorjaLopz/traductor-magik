/**
 * Migración: c_vp_croquis_proy_can.magik
 * GE Network Solutions — rbsaldan — 06/03/2013
 * Clase Magik: c_vp_croquis_proy_can — extiende viewport_layout
 *
 * Viewport de croquis de localización para proyectos de canalización.
 * Opera en dos fases:
 *   1. objetos_visibles() → filtra geometrías GIS con predicados espaciales Turf.js
 *   2. draw_content_on()  → renderiza el viewport + título "CROQUIS DE LOCALIZACION"
 *
 * Métodos migrados:
 *   defined_attributes()              → DEFINED_ATTRIBUTES (constante estática)
 *   val_falso_verdadero()             → VAL_SI_NO (constante)
 *   geometry_set_for_render           → geometrySetForRender()
 *   objetos_visibles(PcollResultSet)  → objetosVisibles(features)
 *   initialise_for_page(page)         → initializeForPage()
 *   draw_content_on(windows)          → drawContentOn()
 *
 * Equivalencias clave:
 *   oGeometria.buffer(50*100)         → turf.buffer(line, 0.5km)
 *   pseudo_chain.new(oGeometria)      → lineString GeoJSON (la geometría directamente)
 *   predicate.interacts               → turf.booleanIntersects
 *   predicate.within                  → turf.booleanWithin
 *   predicate.overlays                → turf.booleanIntersects (línea sobre línea)
 *   !current_coordinate_system! = _unset → sin reproyección CRS
 *   colour.new_from_dec("175,175,93") → rgb(175,175,93)
 *   draw_vtext_transform(...ymin-75)  → texto 75u DEBAJO del viewport (Magik Y-up)
 *                                       → svgH + 75*SCALE en SVG Y-down
 */

import React, { useState } from 'react';
import * as turf from '@turf/turf';
import type { BoundingBox } from './TituloDePlano';

// =============================================================================
// TIPOS
// =============================================================================

export interface VpFeature extends GeoJSON.Feature {
  properties: {
    tipo   : string;
    nombre : string;
    [k: string]: unknown;
  };
}

export interface ObjetosVisiblesResult {
  buffer     : GeoJSON.Feature<GeoJSON.Polygon> | null;
  pseudoChain: GeoJSON.Feature<GeoJSON.LineString>;
  visible    : VpFeature[];
  filtrados  : { tipo: string; predicado: string; count: number }[];
}

// =============================================================================
// ATRIBUTOS DEFINIDOS — defined_attributes()
// =============================================================================

export const DEFINED_ATTRIBUTES = [
  {
    nombre       : 'ajusta_al_marco',
    tipo         : 'string',
    descripcion  : 'Ajustar al Marco',
    default      : 'Si',
    enPropiedades: true,
    enumMethod   : 'val_falso_verdadero',  // Magik: :enum_method
  },
  {
    nombre       : 'oGeomCanalizacion',
    tipo         : 'sector',
    descripcion  : 'Tramo de canalizacion',
    default      : null,
    enPropiedades: true,
  },
];

// Magik: val_falso_verdadero() → rope.new_with("Si","No")
export const VAL_SI_NO = ['Si', 'No'] as const;

// =============================================================================
// DATOS MOCK — geometría de canalización + features GIS del entorno
// =============================================================================

// Geometría de la canalización (oGeomCanalizacion / oGeometria)
export const MOCK_CANALIZACION: GeoJSON.Feature<GeoJSON.LineString> = {
  type: 'Feature',
  properties: { tipo: 'underground_route', nombre: 'Canalización Principal' },
  geometry: {
    type: 'LineString',
    coordinates: [[-99.148, 19.434], [-99.144, 19.436], [-99.141, 19.435], [-99.138, 19.433]],
  },
};

// Features GIS del entorno (simulan el result_set del viewport)
export const MOCK_RESULT_SET: VpFeature[] = [
  // user!_manzana — predicate.interacts(buffer) → bloques/manzanas
  { type: 'Feature', properties: { tipo: 'user!_manzana', nombre: 'Manzana 101' },
    geometry: { type: 'Polygon', coordinates: [[[-99.149,19.433],[-99.146,19.433],[-99.146,19.436],[-99.149,19.436],[-99.149,19.433]]] } },
  { type: 'Feature', properties: { tipo: 'user!_manzana', nombre: 'Manzana 102' },
    geometry: { type: 'Polygon', coordinates: [[[-99.145,19.433],[-99.142,19.433],[-99.142,19.436],[-99.145,19.436],[-99.145,19.433]]] } },
  // mit_terminal_enclosure — predicate.within(buffer)
  { type: 'Feature', properties: { tipo: 'mit_terminal_enclosure', nombre: 'Terminal A' },
    geometry: { type: 'Point', coordinates: [-99.146, 19.435] } },
  { type: 'Feature', properties: { tipo: 'mit_terminal_enclosure', nombre: 'Terminal B' },
    geometry: { type: 'Point', coordinates: [-99.143, 19.434] } },
  // uub — predicate.interacts(pseudo_chain/linestring)
  { type: 'Feature', properties: { tipo: 'uub', nombre: 'UUB-001' },
    geometry: { type: 'Point', coordinates: [-99.147, 19.435] } },
  { type: 'Feature', properties: { tipo: 'uub', nombre: 'UUB-002' },
    geometry: { type: 'Point', coordinates: [-99.141, 19.434] } },
  // user!_eje_calle — predicate.interacts(buffer)
  { type: 'Feature', properties: { tipo: 'user!_eje_calle', nombre: 'Av. Principal' },
    geometry: { type: 'LineString', coordinates: [[-99.151,19.434],[-99.136,19.434]] } },
  { type: 'Feature', properties: { tipo: 'user!_eje_calle', nombre: 'Calle Secundaria' },
    geometry: { type: 'LineString', coordinates: [[-99.144,19.430],[-99.144,19.440]] } },
  // user!_distrito — predicate.interacts(buffer)
  { type: 'Feature', properties: { tipo: 'user!_distrito', nombre: 'Distrito Centro' },
    geometry: { type: 'Polygon', coordinates: [[[-99.155,19.428],[-99.130,19.428],[-99.130,19.445],[-99.155,19.445],[-99.155,19.428]]] } },
  // underground_route — predicate.overlays(pseudo_chain)
  { type: 'Feature', properties: { tipo: 'underground_route', nombre: 'Ramal Norte' },
    geometry: { type: 'LineString', coordinates: [[-99.148,19.434],[-99.144,19.436]] } },
  // Feature FUERA del buffer (no debe aparecer en resultado)
  { type: 'Feature', properties: { tipo: 'mit_terminal_enclosure', nombre: 'Terminal Lejana' },
    geometry: { type: 'Point', coordinates: [-99.120, 19.450] } },
];

// =============================================================================
// UTILIDADES DE PROYECCIÓN SVG
// =============================================================================

const GEO_EXTENT: [number, number, number, number] = [-99.158, 19.428, -99.130, 19.446];
const MAP_W = 400;
const MAP_H = 240;

function geoToSvg(c: GeoJSON.Position): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = GEO_EXTENT;
  return [
    ((c[0] - minLon) / (maxLon - minLon)) * MAP_W,
    ((maxLat - c[1]) / (maxLat - minLat)) * MAP_H,
  ];
}

function positionsToSvgPoints(coords: GeoJSON.Position[]): string {
  return coords.map(geoToSvg).map(([x, y]) => `${x},${y}`).join(' ');
}

// =============================================================================
// CLASE — c_vp_croquis_proy_can
// =============================================================================

export class CVpCroquisProyCan {

  // Magik: define_shared_constant(:allowed_on_menu?,_false)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: {:oGeometria, _unset, :writable, :public}
  oGeometria: GeoJSON.Feature<GeoJSON.LineString> | null = null;

  // Magik: {:oWindows, _unset, :writable, :public}
  oWindows: unknown = null;  // canvas reference en Smallworld; no usado en SVG

  // Magik: :ajusta_al_marco atributo
  ajustaAlMarco: 'Si' | 'No' = 'Si';

  // Magik: :oGeomCanalizacion atributo (geometría de entrada de la canalización)
  oGeomCanalizacion: GeoJSON.Feature<GeoJSON.LineString> | null = null;

  // Magik: val_falso_verdadero() → ["Si", "No"]
  static valFalsoVerdadero(): readonly string[] { return VAL_SI_NO; }

  // ---------------------------------------------------------------------------
  // initialise_for_page(a_layout_page)
  //
  // Magik:
  //   _self.selection = _false; _self.trail = _false
  //   _self.set_fill_colour(_unset); _self.outline_style = _unset
  //   _if .oGeometria _is _unset → sector.new_from(oGeomCanalizacion)
  // ---------------------------------------------------------------------------
  initializeForPage(): void {
    // selection/trail/fill/outline → no aplicable en SVG (solo notas)
    if (!this.oGeometria && this.oGeomCanalizacion) {
      // Magik: sector.new_from(oGeomCanalizacion.sectors.as_sector())
      this.oGeometria = { ...this.oGeomCanalizacion };
    }
  }

  // ---------------------------------------------------------------------------
  // objetos_visibles(PcollResultSet)
  //
  // Magik:
  //   !current_coordinate_system! = _unset
  //   _if .oGeometria _isnt _unset _and _self.mapped?
  //   LoBuffer = oGeometria.buffer(50*100)       → turf.buffer(line, 0.5km)
  //   LoPseudoChain = pseudo_chain.new(oGeometria) → la lineString directamente
  //   Predicados espaciales → selección por tipo
  // ---------------------------------------------------------------------------
  objetosVisibles(
    features: VpFeature[],
    bufferKm = 0.5,
  ): ObjetosVisiblesResult {
    const geom = this.oGeometria;
    if (!geom) {
      return { buffer: null, pseudoChain: MOCK_CANALIZACION, visible: [], filtrados: [] };
    }

    // Magik: oGeometria.buffer(50*100) — buffer 5000 unidades nativas ≈ 500m
    const buffer = turf.buffer(geom, bufferKm, { units: 'kilometers' }) ?? null;

    // Magik: pseudo_chain.new(oGeometria) — la geometría de línea directamente
    const pseudoChain = geom;

    const visible: VpFeature[]  = [];
    const filtrados: { tipo: string; predicado: string; count: number }[] = [];

    // Magik: predicate.interacts(:user!_manzana, {LoBuffer})
    const manzanas = features.filter(f =>
      f.properties.tipo === 'user!_manzana' && buffer && turf.booleanIntersects(f, buffer)
    );
    if (manzanas.length) filtrados.push({ tipo: 'user!_manzana', predicado: 'interacts(buffer)', count: manzanas.length });
    visible.push(...manzanas);

    // Magik: predicate.within(:mit_terminal_enclosure, {LoBuffer})
    const terminales = features.filter(f =>
      f.properties.tipo === 'mit_terminal_enclosure' && buffer &&
      (() => { try { return turf.booleanWithin(f, buffer); } catch { return false; } })()
    );
    if (terminales.length) filtrados.push({ tipo: 'mit_terminal_enclosure', predicado: 'within(buffer)', count: terminales.length });
    visible.push(...terminales);

    // Magik: predicate.interacts(:uub, {LoPseudoChain})
    const uubs = features.filter(f =>
      f.properties.tipo === 'uub' && (() => { try { return turf.booleanIntersects(f, pseudoChain); } catch { return false; } })()
    );
    if (uubs.length) filtrados.push({ tipo: 'uub', predicado: 'interacts(pseudo_chain)', count: uubs.length });
    visible.push(...uubs);

    // Magik: predicate.interacts(:user!_eje_calle, {LoBuffer})
    const calles = features.filter(f =>
      f.properties.tipo === 'user!_eje_calle' && buffer && turf.booleanIntersects(f, buffer)
    );
    if (calles.length) filtrados.push({ tipo: 'user!_eje_calle', predicado: 'interacts(buffer)', count: calles.length });
    visible.push(...calles);

    // Magik: predicate.interacts(:user!_distrito, {LoBuffer})
    const distritos = features.filter(f =>
      f.properties.tipo === 'user!_distrito' && buffer && turf.booleanIntersects(f, buffer)
    );
    if (distritos.length) filtrados.push({ tipo: 'user!_distrito', predicado: 'interacts(buffer)', count: distritos.length });
    visible.push(...distritos);

    // Magik: predicate.overlays(:underground_route, {LoPseudoChain})
    const rutas = features.filter(f =>
      f.properties.tipo === 'underground_route' && (() => { try { return turf.booleanIntersects(f, pseudoChain); } catch { return false; } })()
    );
    if (rutas.length) filtrados.push({ tipo: 'underground_route', predicado: 'overlays(pseudo_chain)', count: rutas.length });
    visible.push(...rutas);

    return { buffer, pseudoChain, visible, filtrados };
  }

  // ---------------------------------------------------------------------------
  // geometry_set_for_render
  //
  // Magik:
  //   result_set = _super.geometry_set_for_render
  //   _if result_set _isnt _unset → objetos_visibles(result_set)
  // ---------------------------------------------------------------------------
  geometrySetForRender(features: VpFeature[], bufferKm = 0.5): ObjetosVisiblesResult {
    // Magik: result_set = _super.geometry_set_for_render (devuelve todas las geometrías del viewport)
    const resultSet = features;  // mock: todas las features disponibles
    return this.objetosVisibles(resultSet, bufferKm);
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(windows)
  //
  // Magik:
  //   .oWindows = windows
  //   _if .oGeometria _is _unset → sector.new_from(oGeomCanalizacion)
  //   _super.draw_content_on(windows)
  //   LoFontBold = font.new_with_properties(:type,:logical,:name,"bold",:point_size,50)
  //   LoTextStyle = text_style.new_with_properties(:colour, colour.new_from_dec("175,175,93"))
  //   draw_vtext_transform(style, centre.x, ymin-75, "CROQUIS DE LOCALIZACION", ..., :bottom_centre)
  //
  // Conversión coordenadas:
  //   Magik Y-up: ymin-75 = 75u DEBAJO del viewport (ymin es el borde inferior)
  //   SVG Y-down: svgH + 75*SCALE
  // ---------------------------------------------------------------------------
  drawContentOn(): DrawConfig {
    if (!this.oGeometria && this.oGeomCanalizacion) {
      this.oGeometria = { ...this.oGeomCanalizacion };
    }
    return {
      titulo    : 'CROQUIS DE LOCALIZACION',
      fontName  : 'bold',
      fontSize  : 50,
      // Magik: colour.new_from_dec("175,175,93") → rgb oliva/amarillo-verde
      color     : 'rgb(175,175,93)',
      // Magik: :bottom_centre → textAnchor='middle', alineado por debajo del viewport
      ancla     : 'bottom_centre',
    };
  }
}

export interface DrawConfig {
  titulo  : string;
  fontName: string;
  fontSize: number;
  color   : string;
  ancla   : string;
}

// =============================================================================
// ESTILOS SVG POR TIPO DE FEATURE
// =============================================================================

const TIPO_ESTILO: Record<string, { fill: string; stroke: string; label: string }> = {
  'user!_manzana'        : { fill: 'rgba(255,235,180,0.5)', stroke: '#b8860b', label: 'Manzana'    },
  'mit_terminal_enclosure': { fill: '#1565c0',               stroke: '#0d47a1', label: 'Terminal'   },
  'uub'                  : { fill: '#7b1fa2',                stroke: '#4a148c', label: 'UUB'        },
  'user!_eje_calle'      : { fill: 'none',                   stroke: '#555',    label: 'Eje calle'  },
  'user!_distrito'       : { fill: 'rgba(200,230,255,0.3)',  stroke: '#1565c0', label: 'Distrito'   },
  'underground_route'    : { fill: 'none',                   stroke: '#c62828', label: 'Canaliz.'   },
};

function renderFeatureSvg(f: VpFeature, idx: number): React.ReactNode {
  const est = TIPO_ESTILO[f.properties.tipo] ?? { fill: '#999', stroke: '#444', label: f.properties.tipo };
  const g   = f.geometry;

  if (g.type === 'Polygon') {
    const pts = positionsToSvgPoints(g.coordinates[0] as GeoJSON.Position[]);
    return <polygon key={idx} points={pts} fill={est.fill} stroke={est.stroke} strokeWidth={1} />;
  }
  if (g.type === 'LineString') {
    const pts = positionsToSvgPoints(g.coordinates as GeoJSON.Position[]);
    return <polyline key={idx} points={pts} fill="none" stroke={est.stroke} strokeWidth={2} />;
  }
  if (g.type === 'Point') {
    const [x, y] = geoToSvg(g.coordinates as GeoJSON.Position);
    return <circle key={idx} cx={x} cy={y} r={5} fill={est.fill} stroke={est.stroke} strokeWidth={1.5} />;
  }
  return null;
}

// =============================================================================
// COMPONENTE REACT — demo de c_vp_croquis_proy_can
// =============================================================================

export function VpCroquisProyCanUI() {
  const [bufferKm,     setBufferKm    ] = useState(0.5);
  const [ajusta,       setAjusta      ] = useState<'Si' | 'No'>('Si');
  const [showBuffer,   setShowBuffer  ] = useState(true);
  const [showFiltrados,setShowFiltrados] = useState(false);

  const vp = new CVpCroquisProyCan();
  vp.oGeomCanalizacion = MOCK_CANALIZACION;
  vp.ajustaAlMarco = ajusta;
  vp.initializeForPage();

  const result = vp.geometrySetForRender(MOCK_RESULT_SET, bufferKm);
  const draw   = vp.drawContentOn();

  const bufPts = result.buffer
    ? positionsToSvgPoints(result.buffer.geometry.coordinates[0] as GeoJSON.Position[])
    : '';

  const canPts = positionsToSvgPoints(MOCK_CANALIZACION.geometry.coordinates as GeoJSON.Position[]);

  // Título SVG: al center X, debajo del mapa (Magik: ymin-75 = debajo del viewport)
  const tituloY = MAP_H + 22;

  const totalInput   = MOCK_RESULT_SET.length;
  const totalVisible = result.visible.length;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_vp_croquis_proy_can</h3>
      <p style={s.meta}>
        Viewport croquis de canalización. <code>objetos_visibles()</code> filtra con predicados
        espaciales Turf.js. <code>draw_content_on()</code> añade título en color oliva.
      </p>

      <div style={s.control}>
        <label style={s.lbl}>
          Buffer (km):
          <input type="range" min={0.1} max={1.5} step={0.1} value={bufferKm}
            onChange={e => setBufferKm(Number(e.target.value))} style={{ width: 80 }} />
          {bufferKm.toFixed(1)} km
          <span style={s.hint}>(Magik: buffer(50×100 u.))</span>
        </label>
        <label style={s.lbl}>
          ajusta_al_marco:
          <select value={ajusta} onChange={e => setAjusta(e.target.value as 'Si' | 'No')} style={s.select}>
            {VAL_SI_NO.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showBuffer} onChange={e => setShowBuffer(e.target.checked)} />
          {' '}Buffer
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showFiltrados} onChange={e => setShowFiltrados(e.target.checked)} />
          {' '}Tabla predicados
        </label>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── SVG viewport + título ── */}
        <div>
          <svg
            width={MAP_W + 2}
            height={MAP_H + 50}
            style={{ border: '1px solid #90a4ae', borderRadius: 3, background: '#f5f5f0' }}
          >
            {/* Buffer */}
            {showBuffer && bufPts && (
              <polygon points={bufPts}
                fill="rgba(21,101,192,0.1)" stroke="#1565c0" strokeWidth={0.8} strokeDasharray="4,3" />
            )}

            {/* Features visibles (filtradas por objetos_visibles) */}
            {result.visible.map((f, i) => renderFeatureSvg(f, i))}

            {/* Canalización principal (oGeometria) */}
            <polyline points={canPts}
              fill="none" stroke="#c62828" strokeWidth={3}
              strokeLinecap="round" strokeLinejoin="round" />

            {/* Borde del viewport */}
            <rect x={0} y={0} width={MAP_W} height={MAP_H}
              fill="none" stroke="#455a64" strokeWidth={1.5} />

            {/* Magik: draw_vtext_transform(..., ymin-75, ..., :bottom_centre)
                SVG: texto centrado en X, posicionado DEBAJO del viewport */}
            <text
              x={MAP_W / 2}
              y={tituloY}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={13}
              fontWeight="bold"
              fill={draw.color}
              fontFamily="sans-serif"
              letterSpacing={2}
            >
              {draw.titulo}
            </text>

            <text x={4} y={14} fontSize={8} fill="#90a4ae" fontFamily="monospace">
              {totalVisible}/{totalInput} features · buffer {bufferKm}km
            </text>
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            Título: <code>colour.new_from_dec("175,175,93")</code> → <span style={{ background: draw.color, padding: '0 6px', borderRadius: 2, color: '#333', fontFamily: 'monospace', fontSize: 11 }}>{draw.color}</span>{' '}
            · posición: <code>ymin-75</code> (debajo del viewport)
          </small>
        </div>

        {/* ── Leyenda + tabla de predicados ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <table style={s.table}>
            <thead>
              <tr>{['Tipo GIS', 'Predicado Magik', 'Turf.js', 'Visible'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                { tipo: 'user!_manzana',         predMagik: 'predicate.interacts(:user!_limite,buffer)', turf: 'booleanIntersects(f,buffer)' },
                { tipo: 'mit_terminal_enclosure', predMagik: 'predicate.within(:location,buffer)',        turf: 'booleanWithin(f,buffer)'     },
                { tipo: 'uub',                    predMagik: 'predicate.interacts(:location,pseudoChain)',turf: 'booleanIntersects(f,line)'   },
                { tipo: 'user!_eje_calle',        predMagik: 'predicate.interacts(:user!_posicion,buffer)',turf:'booleanIntersects(f,buffer)'  },
                { tipo: 'user!_distrito',         predMagik: 'predicate.interacts(:user!_limite,buffer)', turf: 'booleanIntersects(f,buffer)' },
                { tipo: 'underground_route',      predMagik: 'predicate.overlays(:route,pseudoChain)',    turf: 'booleanIntersects(f,line)'   },
              ].map(({ tipo, predMagik, turf: t }, i) => {
                const est     = TIPO_ESTILO[tipo];
                const found   = result.filtrados.find(f => f.tipo === tipo);
                return (
                  <tr key={tipo} style={{ background: i%2===0 ? '#f8f9fa' : '#fff' }}>
                    <td style={s.td}>
                      <span style={{ display:'inline-block', width:10, height:10, background: est?.fill==='none'?'transparent':est?.fill, border:`1px solid ${est?.stroke}`, marginRight:4, borderRadius:2 }} />
                      <code style={{ fontSize: 10 }}>{tipo}</code>
                    </td>
                    <td style={{ ...s.td, fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{predMagik}</td>
                    <td style={{ ...s.td, fontSize: 10, fontFamily: 'monospace', color: '#1565c0' }}>{t}</td>
                    <td style={{ ...s.td, textAlign: 'center', fontWeight: 'bold', color: found ? '#2e7d32' : '#888' }}>
                      {found ? found.count : '0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showFiltrados && (
            <table style={s.table}>
              <thead>
                <tr>{['Slot Magik', 'Tipo TS', 'Valor'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  { slot: 'oGeometria',        tipo: 'Feature<LineString>|null', val: vp.oGeometria ? `${vp.oGeometria.geometry.coordinates.length} coords` : '_unset' },
                  { slot: 'oWindows',          tipo: 'unknown',                  val: 'null (canvas SVG)'     },
                  { slot: 'ajusta_al_marco',   tipo: '"Si"|"No"',                val: vp.ajustaAlMarco        },
                  { slot: 'oGeomCanalizacion', tipo: 'Feature<LineString>|null', val: 'MOCK_CANALIZACION'     },
                ].map(({ slot, tipo, val }, i) => (
                  <tr key={slot} style={{ background: i%2===0 ? '#f8f9fa' : '#fff' }}>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}><code>.{slot}</code></td>
                    <td style={{ ...s.td, fontSize: 10, color: '#555' }}>{tipo}</td>
                    <td style={{ ...s.td, fontWeight: 'bold' }}>{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>!current_coordinate_system! = _unset</code> → sin reproyección CRS.{' '}
        <code>predicate.overlays</code> → <code>booleanIntersects</code> (línea sobre línea).{' '}
        Buffer Magik: <code>50×100=5000</code> unidades nativas ≈ {bufferKm}km en demo.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl    : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  select : { padding: '2px 4px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  hint   : { color: '#888', fontStyle: 'italic' },
  table  : { borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default VpCroquisProyCanUI;
