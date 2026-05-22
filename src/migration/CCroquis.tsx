/**
 * Migración: c_croquis.magik
 * GE Network Solutions — aegijon — 04/12/2022
 * Clase Magik: c_croquis — mixins: layout_element + viewport_layout_mixin
 *
 * Componente de croquis de localización para planos de canalización subterránea.
 * Opera en tres fases:
 *   1. arma_sector()           → encadena tramos seleccionados en un polígono continuo
 *   2. dibuja_trazo()          → aplica buffer al sector encadenado (Turf.js)
 *   3. croquis_proyec_canaliz()→ genera los elementos del layout (viewport + norte + título)
 *
 * Métodos migrados:
 *   ordenamiento(RoSecRope, RoSector_a)   → ordenamiento(segments[], ordered[])
 *   arma_sector()                          → armarSector(rutas)
 *   dibuja_trazo()                         → dibujaTrazo(rutas)
 *   croquis_proyec_canaliz()               → croquisProyecCanaliz()
 *   defined_attributes()                   → DEFINED_ATTRIBUTES (constante estática)
 *
 * Equivalencias clave:
 *   sector_rope                → GeoJSON.Position[][] (array de segmentos)
 *   sector                     → GeoJSON.Position[]  (cadena continua de coords)
 *   sector.buffer(5000)        → turf.buffer(line, km, {units:'kilometers'})
 *   sector.add_all_first(seg)  → ordered.unshift(...seg.slice(0,-1))
 *   sector.add_all_last(seg)   → ordered.push(...seg.slice(1))
 *   sector_rope.remove(seg)    → segments.splice(i, 1)
 *   :underground_route         → feature.properties.tipo === 'underground_route'
 *   viewport_layout.new_with   → ViewportConfig { bounds, name, aceName }
 *   northarrow_layout.new_with → NorthArrowConfig { bounds, styleName }
 *   textbox_layout.new_with    → TextboxConfig { bounds, text, alignHorizontal }
 *   bounding_box.new(x0,y0,x1,y1) → BoundingBox { xMin,yMin,xMax,yMax }
 */

import React, { useState } from 'react';
import * as turf from '@turf/turf';
import type { BoundingBox } from './TituloDePlano';

// =============================================================================
// TIPOS
// =============================================================================

export type SegmentoRuta = GeoJSON.Feature<GeoJSON.LineString>;

/** Magik: viewport_layout.new_with(:bounds,...,:name,...,:ace_name,...) */
export interface ViewportConfig {
  tipo    : 'viewport';
  bounds  : BoundingBox;
  name    : string;       // "Vp_Croquis_Can"
  aceName : string;       // "CROQUIS_CAN"
}

/** Magik: northarrow_layout.new_with(:bounds,...,:style_name,...) */
export interface NorthArrowConfig {
  tipo        : 'northarrow';
  bounds      : BoundingBox;
  styleName   : string;       // "norte_1"
  fillStyle   : null;         // _unset
  outlineStyle: null;         // _unset
}

/** Magik: textbox_layout.new_with(:bounds,...,:text,...) */
export interface TextboxConfig {
  tipo           : 'textbox';
  bounds         : BoundingBox;
  text           : string;    // "Croquis de Localización"
  alignHorizontal: 'centre';
  clip           : boolean;   // _false
  fillStyle      : null;
  outlineStyle   : null;
}

export type LayoutElement = ViewportConfig | NorthArrowConfig | TextboxConfig;

export interface CroquisConfig {
  elementos   : LayoutElement[];
  trailBounds?: BoundingBox;  // bounds del buffer resultante
}

// =============================================================================
// DATOS MOCK — current_selection con :underground_route
// Reemplaza: paf.plugin(:map_plugin).current_map.current_selection
// Segmentos en orden desordenado para demostrar el algoritmo de encadenamiento.
// Coordenadas geográficas WGS84 (CDMX, para turf.buffer)
// =============================================================================

export const MOCK_SELECCION: SegmentoRuta[] = [
  // Tramo C — extremo oriental (entregado primero para forzar el algoritmo)
  {
    type: 'Feature',
    properties: { tipo: 'underground_route', nombre: 'Tramo C', orden: 3 },
    geometry: { type: 'LineString', coordinates: [[-99.140, 19.440], [-99.137, 19.438], [-99.134, 19.435]] },
  },
  // Tramo A — extremo occidental (inicio real)
  {
    type: 'Feature',
    properties: { tipo: 'underground_route', nombre: 'Tramo A', orden: 1 },
    geometry: { type: 'LineString', coordinates: [[-99.150, 19.432], [-99.147, 19.434], [-99.143, 19.437]] },
  },
  // Tramo B — segmento central que enlaza A y C
  {
    type: 'Feature',
    properties: { tipo: 'underground_route', nombre: 'Tramo B', orden: 2 },
    geometry: { type: 'LineString', coordinates: [[-99.143, 19.437], [-99.140, 19.440]] },
  },
  // Tramo NO-RUTA — filtrado por :underground_route guard
  {
    type: 'Feature',
    properties: { tipo: 'service_cable', nombre: 'Cable servicio' },
    geometry: { type: 'LineString', coordinates: [[-99.155, 19.428], [-99.152, 19.430]] },
  },
];

// =============================================================================
// UTILIDADES GEOMÉTRICAS
// =============================================================================

/** Magik: coord1 = coord2 (comparación de coordenadas con tolerancia) */
function coordsEqual(a: GeoJSON.Position, b: GeoJSON.Position): boolean {
  return Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
}

/** Proyección geográfica → SVG pixels para visualización */
function geoToSvg(
  coord  : GeoJSON.Position,
  extent : [number, number, number, number],  // [minLon, minLat, maxLon, maxLat]
  W      : number,
  H      : number,
): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = extent;
  return [
    ((coord[0] - minLon) / (maxLon - minLon)) * W,
    ((maxLat - coord[1]) / (maxLat - minLat)) * H,  // SVG Y-down
  ];
}

// =============================================================================
// CLASE — c_croquis
// =============================================================================

export class CCroquis {

  // Magik: define_shared_constant(:activate_properties_dialog_on_insert?,_false)
  static readonly ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false;

  // Magik: define_shared_constant(:allowed_on_menu?,_false)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: {:vp_nombre, _unset}
  vpNombre: string | null = null;

  // Magik: _self.bounds (herencia de layout_element)
  bounds: BoundingBox | null = null;

  // Magik: defined_attributes() → añade viewport_attribute_definition
  static readonly DEFINED_ATTRIBUTES = [
    { nombre: 'viewport', descripcion: 'Viewport de referencia', tipo: 'viewport_ref' },
  ];

  // ---------------------------------------------------------------------------
  // ordenamiento(RoSecRope, RoSector_a)
  //
  // Magik: recorre sector_rope; para cada sector intenta conectarlo al sector
  // ordenado comprobando coincidencia de extremos:
  //
  //   RoSector_a.first_coord _is _unset → vacío: init con coords del iterador
  //   LoSecIt.first_coord = RoSector_a.first_coord  → ya conectado → skip
  //   LoSecIt.last_coord  = RoSector_a.first_coord  → anteponer  → add_all_first
  //   LoSecIt.first_coord = RoSector_a.last_coord   → posponer   → add_all_last
  //   LoSecIt.last_coord  = RoSector_a.last_coord   → ya conectado → skip
  //
  // TS: muta segments[] y ordered[] por referencia (como Magik muta sector_rope y sector)
  // ---------------------------------------------------------------------------
  ordenamiento(segments: GeoJSON.Position[][], ordered: GeoJSON.Position[]): void {
    let i = 0;
    while (i < segments.length) {
      const seg = segments[i];

      if (ordered.length === 0) {
        // Magik: first_coord _is _unset → inicializar con todas las coords del primer tramo
        ordered.push(...seg);
        segments.splice(i, 1);
        continue;  // Magik: _continue (no avanzar i, el splice desplaza el siguiente)
      }

      const firstOrd = ordered[0];
      const lastOrd  = ordered[ordered.length - 1];
      const firstSeg = seg[0];
      const lastSeg  = seg[seg.length - 1];

      if (coordsEqual(firstSeg, firstOrd)) {
        // Magik: _if LoSecIt.first_coord = RoSector_a.first_coord → _continue (skip)
        i++;

      } else if (coordsEqual(lastSeg, firstOrd)) {
        // Magik: last_coord = first_coord → RoSector_a.add_all_first(LoSecIt)
        // Anteponer el segmento: slice(0,-1) para no duplicar el punto de unión
        ordered.unshift(...seg.slice(0, -1));
        segments.splice(i, 1);
        // No avanzar i: el splice recoloca el siguiente elemento en posición i

      } else if (coordsEqual(firstSeg, lastOrd)) {
        // Magik: first_coord = last_coord → RoSector_a.add_all_last(LoSecIt)
        // Posponer el segmento: slice(1) para no duplicar el punto de unión
        ordered.push(...seg.slice(1));
        segments.splice(i, 1);

      } else if (coordsEqual(lastSeg, lastOrd)) {
        // Magik: last_coord = last_coord → _continue (ya conectado por el otro extremo)
        i++;

      } else {
        // Sin coincidencia con este segmento en esta pasada
        i++;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // arma_sector()
  //
  // Magik:
  //   LoElementos << LoMapa.current_map.current_selection
  //   Filtra :underground_route → añade a sector_rope
  //   _loop hasta LoTCanaliz.size = 0: _self.ordenamiento(LoTCanaliz, LoSector_a)
  //   >> LoSector_a
  // ---------------------------------------------------------------------------
  armarSector(rutas: SegmentoRuta[]): GeoJSON.Position[] {
    // Magik: _if LoTramo.rwo.rwo_type _is :underground_route
    const underground = rutas.filter(f => f.properties?.tipo === 'underground_route');

    // Magik: sector_rope (colección mutable de segmentos)
    const segments = underground.map(f => [...f.geometry.coordinates] as GeoJSON.Position[]);

    const ordered: GeoJSON.Position[] = [];

    // Magik: _loop ... _if LoTCanaliz.size = 0 _then _leave ... _self.ordenamiento(...)
    let guard = segments.length * segments.length + 10;
    while (segments.length > 0 && guard-- > 0) {
      this.ordenamiento(segments, ordered);
    }

    return ordered;
  }

  // ---------------------------------------------------------------------------
  // dibuja_trazo()
  //
  // Magik:
  //   LoSector_aux << _self.arma_sector()
  //   LoBuffer << LoSector_aux.buffer(5000)   ← buffer en unidades del CRS nativo
  //   LoBuffer.world << LoMapa.world
  //   LoMapa.set_trail_from_geometry(LoBuffer)
  //
  // TS: turf.buffer en km (5000 unidades nativas ≈ 0.3km en demo; ajustable)
  // ---------------------------------------------------------------------------
  dibujaTrazo(rutas: SegmentoRuta[], bufferKm = 0.3): GeoJSON.Feature<GeoJSON.Polygon> | null {
    const ordered = this.armarSector(rutas);
    if (ordered.length < 2) return null;

    const linea   = turf.lineString(ordered);
    // Magik: LoSector_aux.buffer(5000) — buffer en unidades nativas del CRS
    // TS: turf.buffer requiere WGS84; usamos km configurables en el demo
    const buffer  = turf.buffer(linea, bufferKm, { units: 'kilometers' });
    return buffer ?? null;
  }

  // ---------------------------------------------------------------------------
  // croquis_proyec_canaliz()
  //
  // Magik:
  //   LoBound = _self.bounds ?? bounding_box.new(4400,1200,5900,2700)
  //   LoBound1 = inset(+100,+200,-100,-200) → viewport
  //   vp = viewport_layout.new_with(:bounds, LoBound1, :name,"Vp_Croquis_Can",...)
  //   vp.ace_name = "CROQUIS_CAN"
  //   LoBound1 = (xmin, ymax-600, xmin+350, ymax) → northarrow_layout ("norte_1")
  //   LoBound1 = (xmin+500, ymax-150, xmax-300, ymax-50) → textbox "Croquis de Localización"
  // ---------------------------------------------------------------------------
  croquisProyecCanaliz(rutas: SegmentoRuta[], bufferKm = 0.3): CroquisConfig {
    const buffer = this.dibujaTrazo(rutas, bufferKm);

    // Magik: _if _self.bounds _isnt _unset _then LoBound << _self.bounds
    //         _else LoBound << bounding_box.new(4400,1200,5900,2700)
    const b = this.bounds ?? { xMin: 4400, yMin: 1200, xMax: 5900, yMax: 2700 };

    // Magik: LoBound1 << bounding_box.new(xmin+100, ymin+200, xmax-100, ymax-200)
    const vpBounds: BoundingBox = {
      xMin: b.xMin + 100,
      yMin: b.yMin + 200,
      xMax: b.xMax - 100,
      yMax: b.yMax - 200,
    };

    // Magik: northarrow_layout bounds → (xmin, ymax-600, xmin+350, ymax)
    const northBounds: BoundingBox = {
      xMin: b.xMin,
      yMin: b.yMax - 600,
      xMax: b.xMin + 350,
      yMax: b.yMax,
    };

    // Magik: textbox_layout bounds → (xmin+500, ymax-150, xmax-300, ymax-50)
    const titleBounds: BoundingBox = {
      xMin: b.xMin + 500,
      yMin: b.yMax - 150,
      xMax: b.xMax - 300,
      yMax: b.yMax - 50,
    };

    const elementos: LayoutElement[] = [
      {
        tipo    : 'viewport',
        bounds  : vpBounds,
        name    : 'Vp_Croquis_Can',  // Magik: vp.name << "Vp_Croquis_Can"
        aceName : 'CROQUIS_CAN',     // Magik: vp.ace_name << "CROQUIS_CAN"
      },
      {
        tipo        : 'northarrow',
        bounds      : northBounds,
        styleName   : 'norte_1',     // Magik: LoNorte.style_name << "norte_1"
        fillStyle   : null,
        outlineStyle: null,
      },
      {
        tipo           : 'textbox',
        bounds         : titleBounds,
        text           : 'Croquis de Localización',  // Magik: LoTitulo.text
        alignHorizontal: 'centre',
        clip           : false,
        fillStyle      : null,
        outlineStyle   : null,
      },
    ];

    // Calcula trailBounds desde el buffer GeoJSON
    const trailBounds = buffer
      ? (() => {
          const [minLon, minLat, maxLon, maxLat] = turf.bbox(buffer);
          return { xMin: minLon, yMin: minLat, xMax: maxLon, yMax: maxLat };
        })()
      : undefined;

    return { elementos, trailBounds };
  }
}

// =============================================================================
// SVG — flecha de norte (northarrow_layout "norte_1")
// =============================================================================

function NorthArrow({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <polygon
        points={`${cx},${cy - r} ${cx - r * 0.4},${cy + r * 0.6} ${cx},${cy + r * 0.2} ${cx + r * 0.4},${cy + r * 0.6}`}
        fill="#1a237e" stroke="white" strokeWidth={0.8}
      />
      <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize={r * 0.6}
        fill="#1a237e" fontFamily="sans-serif" fontWeight="bold">N</text>
    </g>
  );
}

// =============================================================================
// COMPONENTE REACT — demo de c_croquis
// =============================================================================

const GEO_EXTENT: [number, number, number, number] = [-99.160, 19.425, -99.125, 19.450];
const MAP_W = 420;
const MAP_H = 260;

export function CCroquisUI() {
  const [bufferKm,      setBufferKm     ] = useState(0.3);
  const [showOrdenado,  setShowOrdenado ] = useState(true);
  const [showBuffer,    setShowBuffer   ] = useState(true);
  const [showLayout,    setShowLayout   ] = useState(true);
  const [showPasos,     setShowPasos    ] = useState(false);

  const inst = new CCroquis();
  const config = inst.croquisProyecCanaliz(MOCK_SELECCION, bufferKm);

  const ordered  = inst.armarSector(MOCK_SELECCION);
  const buffer   = inst.dibujaTrazo(MOCK_SELECCION, bufferKm);

  // Proyección → SVG
  const toSvg = (c: GeoJSON.Position) => geoToSvg(c, GEO_EXTENT, MAP_W, MAP_H);

  // SVG polyline points para el sector ordenado
  const ordPts = ordered.map(toSvg).map(([x, y]) => `${x},${y}`).join(' ');

  // SVG polygon points para el buffer
  const bufPts = buffer
    ? (buffer.geometry.coordinates[0] as GeoJSON.Position[])
        .map(toSvg).map(([x, y]) => `${x},${y}`).join(' ')
    : '';

  // Segmentos de cada ruta individual
  const rutasU = MOCK_SELECCION.filter(f => f.properties?.tipo === 'underground_route');
  const rutasO = MOCK_SELECCION.filter(f => f.properties?.tipo !== 'underground_route');

  const vp    = config.elementos.find(e => e.tipo === 'viewport')   as ViewportConfig   | undefined;
  const norte = config.elementos.find(e => e.tipo === 'northarrow') as NorthArrowConfig | undefined;
  const titulo = config.elementos.find(e => e.tipo === 'textbox')   as TextboxConfig    | undefined;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_croquis</h3>
      <p style={s.meta}>
        Croquis de localización de canalización subterránea.
        <strong> ordenamiento()</strong>: encadena tramos conectados.
        <strong> dibuja_trazo()</strong>: buffer Turf.js.
        <strong> croquis_proyec_canaliz()</strong>: genera viewport + norte + título.
      </p>

      {/* ── Controles ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          Buffer (km):
          <input type="range" min={0.1} max={2} step={0.1} value={bufferKm}
            onChange={e => setBufferKm(Number(e.target.value))} style={{ width: 80 }} />
          {bufferKm.toFixed(1)} km
          <span style={s.hint}>(Magik: sector.buffer(5000 u.))</span>
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showOrdenado} onChange={e => setShowOrdenado(e.target.checked)} />
          {' '}Cadena ordenada
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showBuffer} onChange={e => setShowBuffer(e.target.checked)} />
          {' '}Buffer (trail)
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showLayout} onChange={e => setShowLayout(e.target.checked)} />
          {' '}Layout (VP+Norte+Título)
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={showPasos} onChange={e => setShowPasos(e.target.checked)} />
          {' '}Detalle algoritmo
        </label>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── Mapa SVG ── */}
        <div>
          <svg width={MAP_W} height={MAP_H}
            style={{ border: '1px solid #90a4ae', borderRadius: 3, background: '#e8f5e9' }}>

            {/* Fondo tipo mapa */}
            <rect width={MAP_W} height={MAP_H} fill="#e8f5e9" />
            <text x={4} y={14} fontSize={9} fill="#78909c" fontFamily="monospace">
              CDMX ~19.43°N, -99.14°O
            </text>

            {/* Buffer (trail) — Magik: LoMapa.set_trail_from_geometry(LoBuffer) */}
            {showBuffer && bufPts && (
              <polygon points={bufPts}
                fill="rgba(21,101,192,0.12)" stroke="#1565c0" strokeWidth={1}
                strokeDasharray="4,3" />
            )}

            {/* Rutas NO underground (filtradas en arma_sector) */}
            {rutasO.map((f, i) => {
              const pts = f.geometry.coordinates.map(toSvg).map(([x,y]) => `${x},${y}`).join(' ');
              return <polyline key={`noru-${i}`} points={pts}
                fill="none" stroke="#bdbdbd" strokeWidth={1.5} strokeDasharray="3,2" />;
            })}

            {/* Tramos individuales underground (input del algoritmo) */}
            {rutasU.map((f, i) => {
              const pts = f.geometry.coordinates.map(toSvg).map(([x,y]) => `${x},${y}`).join(' ');
              const colors = ['#e53935','#f57c00','#7b1fa2','#00838f'];
              const c = colors[i % colors.length];
              return (
                <g key={`ruta-${i}`}>
                  <polyline points={pts} fill="none" stroke={c} strokeWidth={2.5} opacity={0.6} />
                  {f.geometry.coordinates.map((coord, ci) => {
                    const [sx, sy] = toSvg(coord);
                    return <circle key={ci} cx={sx} cy={sy} r={3} fill={c} opacity={0.8} />;
                  })}
                  {/* etiqueta */}
                  {(() => {
                    const mid = f.geometry.coordinates[Math.floor(f.geometry.coordinates.length/2)];
                    const [mx, my] = toSvg(mid);
                    return <text x={mx+4} y={my-4} fontSize={9} fill={c} fontWeight="bold">{f.properties?.nombre}</text>;
                  })()}
                </g>
              );
            })}

            {/* Sector ordenado (resultado de arma_sector) */}
            {showOrdenado && ordPts && (
              <polyline points={ordPts}
                fill="none" stroke="#1b5e20" strokeWidth={3}
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Leyenda */}
            <g transform={`translate(${MAP_W - 130}, ${MAP_H - 70})`}>
              <rect width={125} height={65} fill="rgba(255,255,255,0.85)" rx={3} stroke="#ccc" />
              <line x1={5} y1={12} x2={25} y2={12} stroke="#e53935" strokeWidth={2.5} />
              <text x={29} y={15} fontSize={8} fill="#333">Tramos (input)</text>
              <line x1={5} y1={24} x2={25} y2={24} stroke="#1b5e20" strokeWidth={3} />
              <text x={29} y={27} fontSize={8} fill="#333">Cadena ordenada</text>
              <polygon points="5,37 25,37 25,43 5,43" fill="rgba(21,101,192,0.12)" stroke="#1565c0" strokeWidth={1} />
              <text x={29} y={42} fontSize={8} fill="#333">Buffer (trail)</text>
              <line x1={5} y1={55} x2={25} y2={55} stroke="#bdbdbd" strokeWidth={1.5} strokeDasharray="3,2" />
              <text x={29} y={58} fontSize={8} fill="#888">Filtrado (no-ruta)</text>
            </g>
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            {MAP_W}×{MAP_H}px · {rutasU.length} tramos underground · cadena: {ordered.length} coords
            {buffer ? ` · buffer: ${bufferKm}km` : ' · sin buffer'}
          </small>
        </div>

        {/* ── Preview del layout del croquis ── */}
        {showLayout && (
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
              croquis_proyec_canaliz() → elementos del plano
            </div>
            <svg width={300} height={220}
              style={{ border: '1px solid #90a4ae', borderRadius: 3, background: '#fafafa' }}>

              {/* Representación del plano (bounds 4400-5900 × 1200-2700 → 300×220px) */}
              {vp && (() => {
                const SCALE_X = 300 / (5900 - 4400);
                const SCALE_Y = 220 / (2700 - 1200);
                const tx = (x: number) => (x - 4400) * SCALE_X;
                const ty = (y: number) => (2700 - y) * SCALE_Y;

                const vpB = vp.bounds;
                const nrB = norte?.bounds;
                const tiB = titulo?.bounds;

                return (
                  <>
                    {/* Viewport */}
                    <rect x={tx(vpB.xMin)} y={ty(vpB.yMax)} width={tx(vpB.xMax)-tx(vpB.xMin)} height={ty(vpB.yMin)-ty(vpB.yMax)}
                      fill="#e3f2fd" stroke="#1565c0" strokeWidth={1} />
                    <text x={(tx(vpB.xMin)+tx(vpB.xMax))/2} y={(ty(vpB.yMin)+ty(vpB.yMax))/2}
                      textAnchor="middle" dominantBaseline="middle" fontSize={8} fill="#1565c0">Vp_Croquis_Can</text>

                    {/* North arrow */}
                    {nrB && (
                      <>
                        <rect x={tx(nrB.xMin)} y={ty(nrB.yMax)} width={tx(nrB.xMax)-tx(nrB.xMin)} height={ty(nrB.yMin)-ty(nrB.yMax)}
                          fill="#f3e5f5" stroke="#7b1fa2" strokeWidth={0.8} />
                        <NorthArrow
                          cx={(tx(nrB.xMin)+tx(nrB.xMax))/2}
                          cy={(ty(nrB.yMin)+ty(nrB.yMax))/2}
                          r={Math.min(tx(nrB.xMax)-tx(nrB.xMin), ty(nrB.yMin)-ty(nrB.yMax)) * 0.3}
                        />
                      </>
                    )}

                    {/* Título */}
                    {tiB && (
                      <>
                        <rect x={tx(tiB.xMin)} y={ty(tiB.yMax)} width={tx(tiB.xMax)-tx(tiB.xMin)} height={ty(tiB.yMin)-ty(tiB.yMax)}
                          fill="#fff9c4" stroke="#f9a825" strokeWidth={0.8} />
                        <text x={(tx(tiB.xMin)+tx(tiB.xMax))/2} y={(ty(tiB.yMin)+ty(tiB.yMax))/2}
                          textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#e65100">
                          Croquis de Localización
                        </text>
                      </>
                    )}
                  </>
                );
              })()}
            </svg>
            <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
              3 elementos: viewport + norte + título
            </small>
          </div>
        )}

        {/* ── Detalle del algoritmo ── */}
        {showPasos && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            <table style={s.table}>
              <thead><tr>{['Tramo', 'Tipo', 'Coords inicio→fin', 'Acción ordenamiento'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_SELECCION.map((f, i) => {
                  const coords = f.geometry.coordinates;
                  const first  = coords[0];
                  const last   = coords[coords.length - 1];
                  const esRuta = f.properties?.tipo === 'underground_route';
                  return (
                    <tr key={i} style={{ background: esRuta ? (i%2===0 ? '#f1f8e9':'#fff') : '#fff3e0' }}>
                      <td style={{ ...s.td, fontWeight: 'bold' }}>{f.properties?.nombre}</td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}>{f.properties?.tipo}</td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}>
                        [{first[0].toFixed(3)},{first[1].toFixed(3)}]→[{last[0].toFixed(3)},{last[1].toFixed(3)}]
                      </td>
                      <td style={{ ...s.td, fontSize: 11, color: esRuta ? '#2e7d32' : '#888' }}>
                        {!esRuta ? 'filtrado (no :underground_route)'
                          : f.properties?.nombre === 'Tramo C' ? 'init ordered []'
                          : f.properties?.nombre === 'Tramo A' ? 'last_coord=first_coord → add_all_first'
                          : 'first_coord=last_coord → add_all_last'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <table style={s.table}>
              <thead><tr>{['Elemento layout', 'Tipo Magik', 'Bounds (u)', 'Propiedad'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {config.elementos.map((el, i) => {
                  const b = el.bounds;
                  const bStr = `(${b.xMin},${b.yMin})→(${b.xMax},${b.yMax})`;
                  const props = el.tipo === 'viewport'   ? `name="${(el as ViewportConfig).name}"` :
                                el.tipo === 'northarrow' ? `style="${(el as NorthArrowConfig).styleName}"` :
                                `text="${(el as TextboxConfig).text}"`;
                  return (
                    <tr key={i} style={{ background: i%2===0 ? '#f8f9fa' : '#fff' }}>
                      <td style={{ ...s.td, fontFamily: 'monospace' }}>{el.tipo}</td>
                      <td style={{ ...s.td, fontSize: 11, color: '#555' }}>
                        {el.tipo === 'viewport' ? 'viewport_layout' : el.tipo === 'northarrow' ? 'northarrow_layout' : 'textbox_layout'}
                      </td>
                      <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10 }}>{bStr}</td>
                      <td style={{ ...s.td, fontSize: 11 }}>{props}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>sector.buffer(5000)</code> (Magik) → <code>turf.buffer(line, {bufferKm}km)</code>.
        coords WGS84 requeridas por Turf. Magik usa el CRS nativo del mapa.
        <code> set_trail_from_geometry</code> → estado interno para render del viewport.
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
  hint   : { color: '#888', fontStyle: 'italic' },
  table  : { borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default CCroquisUI;
