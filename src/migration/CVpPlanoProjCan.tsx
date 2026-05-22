/**
 * CVpPlanoProjCan.tsx
 * Migración de c_vp_plano_proy_can.magik
 *
 * Viewport de layout para planos de canalización de cobre.
 * Hereda de :viewport_layout. Slots: oGeometria, iIndicePlano, iNumeroSecciones, oWindows.
 *
 * Flujo draw_content_on:
 *   1. obtener_canalizacion() → sector con ruta de ductos
 *   2. c_seccionamiento.do_seccionamiento() → secciones de papel
 *   3. Muestra sección i-ésima con su ángulo de rotación
 *   4. DibujarMarcasDeContinuacion: bracket Z en extremos
 *   5. DibujaLineaEntrePozoIniYFin: línea U entre pozos
 */

import React, { useMemo, useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature, LineString, Position } from 'geojson';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type PozoTipo = 'Ninguno' | 'Inicial' | 'Final' | 'Ambos';

interface Seccion {
  geom        : Feature<LineString>;
  viewAngleDeg: number;
  startDist   : number;
  endDist     : number;
}

interface GisObj { id: string; coord: Position; tipo: string }

// ---------------------------------------------------------------------------
// Mock GIS — tramo de cobre con canalización, ~170m cerca de CDMX
// Equivale a LoTramoCobre.obtener_canalizacion() → concatenar route.sectors
// ---------------------------------------------------------------------------
const MOCK_ROUTE: Feature<LineString> = turf.lineString([
  [-99.13320, 19.43260],
  [-99.13265, 19.43275],
  [-99.13215, 19.43262],
  [-99.13165, 19.43280],
]);

// Magik: LoTramoCobre.pozo1 / .pozo2 → location.coord
const MOCK_POZO1: Position = MOCK_ROUTE.geometry.coordinates[0];
const MOCK_POZO2: Position = MOCK_ROUTE.geometry.coordinates.at(-1)!;

// Magik: c_seccionamiento.new(200, 1, 10, 21, 18) → plano A4 1:200 ≈ 40m efectivos por sección
const SECTION_LEN_M = 40;

// Objetos GIS en el mundo del viewport (para objetos_visibles)
const MOCK_GIS_OBJECTS: GisObj[] = [
  { id: 'UUB-01', coord: [-99.13290, 19.43270], tipo: 'uub' },
  { id: 'UUB-02', coord: [-99.13240, 19.43268], tipo: 'uub' },
  { id: 'TER-01', coord: [-99.13195, 19.43274], tipo: 'terminal' },
  { id: 'TER-02', coord: [-99.13175, 19.43284], tipo: 'terminal' },
  { id: 'CEDO-A', coord: [-99.13310, 19.43258], tipo: 'cedo' },
];

const SVG_W  = 660;
const SVG_H  = 240;
const MARGIN = 38;
const ABC    = 'ABCDEFGHIJK';

// ---------------------------------------------------------------------------
// calcSecciones — Magik: c_seccionamiento.new(200,1,10,21,18).do_seccionamiento(LoSector)
// Divide la ruta en N secciones de SECTION_LEN_M metros cada una
// ---------------------------------------------------------------------------
function calcSecciones(route: Feature<LineString>): Seccion[] {
  const totalM = turf.length(route, { units: 'meters' });
  const n = Math.max(1, Math.ceil(totalM / SECTION_LEN_M));
  const secciones: Seccion[] = [];

  for (let i = 0; i < n; i++) {
    const startM = i * SECTION_LEN_M;
    const endM   = Math.min((i + 1) * SECTION_LEN_M, totalM);
    const geom   = turf.lineSliceAlong(route, startM, endM, { units: 'meters' });
    const coords = geom.geometry.coordinates;

    // Magik: LoSecciones[i][3].radians_to_degrees → bearing del primer segmento
    const viewAngleDeg = coords.length >= 2
      ? turf.bearing(turf.point(coords[0]), turf.point(coords[1]))
      : 0;

    secciones.push({ geom, viewAngleDeg, startDist: startM, endDist: endM });
  }
  return secciones;
}

// ---------------------------------------------------------------------------
// perpPt — Magik: LoSegmento.obten_pto_separado(dist_cm, angulo_grados)
// Punto a distM metros del coord, perpendicular al bearing en angulo grados
// ---------------------------------------------------------------------------
function perpPt(coord: Position, bearing: number, distM: number, angle: number): Position {
  return turf.destination(
    turf.point(coord),
    distM / 1000,
    (bearing + angle + 360) % 360,
  ).geometry.coordinates;
}

// ---------------------------------------------------------------------------
// buildZMarkRight — Magik: caso iIndicePlano≠iNumeroSecciones, lado derecho
// Bracket Z en el FINAL de la sección: 3 segmentos + posiciones de etiqueta
// Distancias: 10m exterior, 8m interior, 4m barra cruzada
// ---------------------------------------------------------------------------
interface ZSeg { p1: Position; p2: Position }
interface ZMark { segs: ZSeg[]; label1: Position; label2: Position }

function buildZMarkRight(coords: Position[]): ZMark {
  const n    = coords.length;
  const end  = coords[n - 1];
  const prev = coords[Math.max(0, n - 2)];
  const bear = turf.bearing(turf.point(prev), turf.point(end));
  return {
    segs: [
      { p1: perpPt(end, bear, 10, -90), p2: perpPt(end, bear, 8, -90) },
      { p1: perpPt(end, bear,  4, -90), p2: perpPt(end, bear, 4,  90) },
      { p1: perpPt(end, bear,  8,  90), p2: perpPt(end, bear, 10, 90) },
    ],
    label1: perpPt(end, bear, 11, -90),
    label2: perpPt(end, bear, 11,  90),
  };
}

// ---------------------------------------------------------------------------
// buildZMarkLeft — Magik: caso iIndicePlano≠1, lado izquierdo
// Bracket Z en el INICIO de la sección usando segment(1).reversed()
// Distancias: 10m exterior, 8m interior, 7m barra (vs 4m del derecho)
// ---------------------------------------------------------------------------
function buildZMarkLeft(coords: Position[]): ZMark {
  const start = coords[0];
  const next  = coords[Math.min(1, coords.length - 1)];
  // Magik: reversed → bearing desde next hacia start
  const bear = turf.bearing(turf.point(next), turf.point(start));
  return {
    segs: [
      { p1: perpPt(start, bear, 10,  90), p2: perpPt(start, bear,  8,  90) },
      { p1: perpPt(start, bear,  7,  90), p2: perpPt(start, bear,  7, -90) },
      { p1: perpPt(start, bear,  8, -90), p2: perpPt(start, bear, 10, -90) },
    ],
    label1: perpPt(start, bear, 11,  90),
    label2: perpPt(start, bear, 11, -90),
  };
}

// ---------------------------------------------------------------------------
// objetos_visibles — Magik: LcollResulSet.select(:bounds_interacting_with, LoBound)
// Filtra objetos GIS que intersectan la bbox de la sección
// ---------------------------------------------------------------------------
function objetosVisibles(bbox: number[], objs: GisObj[]): GisObj[] {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return objs.filter(o =>
    o.coord[0] >= minLng && o.coord[0] <= maxLng &&
    o.coord[1] >= minLat && o.coord[1] <= maxLat,
  );
}

// ---------------------------------------------------------------------------
// Proyección GeoJSON → SVG pixels con corrección de coseno latitud
// ---------------------------------------------------------------------------
interface Proj { toSvg: (lng: number, lat: number) => [number, number] }

function makeProj(refCoords: Position[], w: number, h: number, m: number): Proj {
  const lngs   = refCoords.map(c => c[0]);
  const lats   = refCoords.map(c => c[1]);
  const latMid = (Math.min(...lats) + Math.max(...lats)) / 2;
  const cosLat = Math.cos(latMid * Math.PI / 180);
  const pad    = 0.18;
  const dLng   = Math.max(...lngs) - Math.min(...lngs) || 1e-6;
  const dLat   = Math.max(...lats) - Math.min(...lats) || 1e-6;
  const minL   = Math.min(...lngs) - dLng * pad;
  const minB   = Math.min(...lats) - dLat * pad;
  const sLng   = dLng * (1 + 2 * pad) * cosLat;
  const sLat   = dLat * (1 + 2 * pad);
  const scaleX = (w - 2 * m) / sLng;
  const scaleY = (h - 2 * m) / sLat;
  const scale  = Math.min(scaleX, scaleY);
  const ox = m + ((w - 2 * m) - sLng * scale) / 2;
  const oy = m + ((h - 2 * m) - sLat * scale) / 2;
  return {
    toSvg: (lng, lat) => [
      ox + (lng - minL) * cosLat * scale,
      h - oy - (lat - minB) * scale,
    ],
  };
}

function pts2path(pts: [number, number][]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

// ---------------------------------------------------------------------------
// Componente principal — CVpPlanoProjCanUI
// ---------------------------------------------------------------------------
export function CVpPlanoProjCanUI() {
  const [indice,  setIndice]  = useState(1);
  const [pozo,    setPozo]    = useState<PozoTipo>('Ninguno');
  const [showObj, setShowObj] = useState(true);

  // Magik: LoSeccionamiento.do_seccionamiento → LoSecciones
  const secciones = useMemo(() => calcSecciones(MOCK_ROUTE), []);
  const numSec    = secciones.length;
  const idx       = Math.max(1, Math.min(indice, numSec));
  const seccion   = secciones[idx - 1];
  const secCoords = seccion.geom.geometry.coordinates;

  // Proyección fija basada en la ruta completa
  const proj = useMemo(
    () => makeProj(MOCK_ROUTE.geometry.coordinates, SVG_W, SVG_H, MARGIN),
    [],  // eslint-disable-line
  );

  // SVG paths
  const fullPath = pts2path(MOCK_ROUTE.geometry.coordinates.map(c => proj.toSvg(c[0], c[1])));
  const secPath  = pts2path(secCoords.map(c => proj.toSvg(c[0], c[1])));

  // --- Marcas de continuación — Magik: DibujarMarcasDeContinuacion ---
  interface MarkSvg { segs: string[]; labels: { pt:[number,number]; ch:string }[] }
  const marks: MarkSvg[] = [];

  function zmToSvg(zm: ZMark, letterChar: string): MarkSvg {
    return {
      segs: zm.segs.map(s =>
        pts2path([proj.toSvg(s.p1[0], s.p1[1]), proj.toSvg(s.p2[0], s.p2[1])]),
      ),
      labels: [
        { pt: proj.toSvg(zm.label1[0], zm.label1[1]), ch: letterChar },
        { pt: proj.toSvg(zm.label2[0], zm.label2[1]), ch: letterChar },
      ],
    };
  }

  if (numSec > 1 && secCoords.length >= 2) {
    // Lado derecho — excepto última sección
    if (idx < numSec) {
      marks.push(zmToSvg(buildZMarkRight(secCoords), ABC[idx - 1]));
    }
    // Lado izquierdo — excepto primera sección
    if (idx > 1) {
      marks.push(zmToSvg(buildZMarkLeft(secCoords), ABC[idx - 2]));
    }
  }

  // --- Pozos ---
  const p1svg = proj.toSvg(MOCK_POZO1[0], MOCK_POZO1[1]);
  const p2svg = proj.toSvg(MOCK_POZO2[0], MOCK_POZO2[1]);

  // --- Línea entre pozos — Magik: DibujaLineaEntrePozoIniYFin ---
  // Solo si .pozo="Inicial". Traza U: pozo1 → topPage → topPage → pozo2
  const topY = MARGIN / 2;
  const pozoLinePath = (pozo === 'Inicial' || pozo === 'Ambos')
    ? pts2path([p1svg, [p1svg[0], topY], [p2svg[0], topY], p2svg])
    : null;

  // --- objetos_visibles — filtrar por bbox de sección actual ---
  const secBbox  = turf.bbox(seccion.geom);
  const visibles = showObj ? objetosVisibles(secBbox, MOCK_GIS_OBJECTS) : [];

  const bStyle: React.CSSProperties = {
    padding: '3px 10px', borderRadius: 4, border: '1px solid #999',
    cursor: 'pointer', fontSize: 11,
  };

  const OBJ_COLOR: Record<string, string> = { cedo:'#1a4fff', terminal:'#1a7a1a', uub:'#aa2200' };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CVpPlanoProjCan</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          :viewport_layout · {numSec} secciones · PLANO {idx} de {numSec}
        </span>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Navegación sección — iIndicePlano */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button style={bStyle} disabled={idx <= 1}    onClick={() => setIndice(i => i - 1)}>◀</button>
          <span style={{ fontSize: 11, padding: '0 8px', minWidth: 90, textAlign: 'center' }}>
            PLANO {idx} / {numSec}
          </span>
          <button style={bStyle} disabled={idx >= numSec} onClick={() => setIndice(i => i + 1)}>▶</button>
        </div>

        {/* Selector pozo — val_falso_verdadero */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#666' }}>pozo:</span>
          {(['Ninguno','Inicial','Final','Ambos'] as PozoTipo[]).map(v => (
            <button key={v} onClick={() => setPozo(v)}
              style={{ ...bStyle, padding: '2px 8px',
                       background: pozo===v ? '#4a3000' : '#f5f5f5',
                       color: pozo===v ? '#fff' : '#333',
                       fontWeight: pozo===v ? 'bold' : 'normal' }}>
              {v}
            </button>
          ))}
        </div>

        {/* Toggle objetos_visibles */}
        <label style={{ fontSize: 11, cursor: 'pointer', display: 'flex', gap: 4, alignItems: 'center' }}>
          <input type="checkbox" checked={showObj} onChange={e => setShowObj(e.target.checked)} />
          objetos_visibles
        </label>
      </div>

      {/* SVG viewport — equivale a draw_content_on(window) */}
      <div style={{ border: '2px solid #888', background: '#f8f8f0', borderRadius: 3, overflow: 'hidden' }}>
        <svg width={SVG_W} height={SVG_H} style={{ display: 'block' }}>
          <defs>
            <pattern id="pg" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0L0 0 0 30" fill="none" stroke="#e4e4dc" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#pg)" />

          {/* Ruta completa — contexto del tramo completo */}
          <path d={fullPath} fill="none" stroke="#c0b080" strokeWidth="1.5" strokeDasharray="5 3" />

          {/* Sección actual — Magik: .oGeometria.transformed(transform).draw_on(window,gs) */}
          <path d={secPath} fill="none" stroke="#5a4000" strokeWidth="4" />

          {/* Marcas de continuación — Magik: DibujarMarcasDeContinuacion */}
          {marks.map((mk, mi) => (
            <g key={mi}>
              {mk.segs.map((d, si) => (
                <path key={si} d={d} fill="none" stroke="rgb(175,175,93)" strokeWidth="2.5" />
              ))}
              {mk.labels.map((lb, li) => (
                <text key={li} x={lb.pt[0]} y={lb.pt[1]}
                  fontSize="12" fontWeight="bold" fill="rgb(175,175,93)"
                  textAnchor="middle" dominantBaseline="middle">
                  {lb.ch}
                </text>
              ))}
            </g>
          ))}

          {/* Pozos — Magik: LoPozo1/LoPozo2.location.coord */}
          {(pozo === 'Inicial' || pozo === 'Ambos') && (
            <g>
              <circle cx={p1svg[0]} cy={p1svg[1]} r="8" fill="none" stroke="#333" strokeWidth="2"/>
              <circle cx={p1svg[0]} cy={p1svg[1]} r="3" fill="#333"/>
              <text x={p1svg[0]} y={p1svg[1] + 16} fontSize="9" fill="#333" textAnchor="middle">P1</text>
            </g>
          )}
          {(pozo === 'Final' || pozo === 'Ambos') && (
            <g>
              <circle cx={p2svg[0]} cy={p2svg[1]} r="8" fill="none" stroke="#333" strokeWidth="2"/>
              <circle cx={p2svg[0]} cy={p2svg[1]} r="3" fill="#333"/>
              <text x={p2svg[0]} y={p2svg[1] + 16} fontSize="9" fill="#333" textAnchor="middle">P2</text>
            </g>
          )}

          {/* Línea entre pozos — Magik: DibujaLineaEntrePozoIniYFin */}
          {pozoLinePath && (
            <path d={pozoLinePath} fill="none" stroke="#000" strokeWidth="1.5" />
          )}

          {/* Objetos visibles — Magik: geometry_set_for_render → objetos_visibles(bbox) */}
          {visibles.map(obj => {
            const pt    = proj.toSvg(obj.coord[0], obj.coord[1]);
            const color = OBJ_COLOR[obj.tipo] ?? '#666';
            return (
              <g key={obj.id}>
                <rect x={pt[0]-5} y={pt[1]-5} width="10" height="10"
                  fill={color} opacity="0.75" stroke="#fff" strokeWidth="0.8"/>
                <text x={pt[0]} y={pt[1]-8} fontSize="8" fill={color} textAnchor="middle">
                  {obj.id}
                </text>
              </g>
            );
          })}

          {/* Etiqueta inferior */}
          <text x={SVG_W / 2} y={SVG_H - 6} fontSize="10" fill="#555" textAnchor="middle">
            PLANO NÚMERO {idx} de {numSec}
            &nbsp;·&nbsp;ángulo: {seccion.viewAngleDeg.toFixed(1)}°
            &nbsp;·&nbsp;{seccion.startDist.toFixed(0)}–{seccion.endDist.toFixed(0)} m
          </text>
        </svg>
      </div>

      {/* Estado de slots — Magik: .iIndicePlano / .iNumeroSecciones / .oGeometria */}
      <div style={{ marginTop: 8, fontSize: 10, color: '#555', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>iIndicePlano: <strong>{idx}</strong></span>
        <span>iNumeroSecciones: <strong>{numSec}</strong></span>
        <span>oGeometria: <strong>{secCoords.length} coords</strong></span>
        <span>view_angle: <strong>{seccion.viewAngleDeg.toFixed(1)}°</strong></span>
        <span>pozo: <strong>{pozo}</strong></span>
        {showObj && (
          <span>objetos_visibles: <strong>{visibles.length}/{MOCK_GIS_OBJECTS.length}</strong></span>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: 6, fontSize: 10, color: '#777', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span><span style={{ color:'#c0b080' }}>- -</span> tramo completo</span>
        <span><span style={{ color:'#5a4000', fontWeight:'bold' }}>━━</span> sección actual</span>
        <span><span style={{ color:'rgb(175,175,93)', fontWeight:'bold' }}>Z</span> marcas (A,B,C…)</span>
        <span>◯ pozos · línea U = DibujaLineaEntrePozoIniYFin</span>
        {showObj && (
          <span>
            <span style={{ color:'#1a4fff' }}>■</span>cedo&nbsp;
            <span style={{ color:'#1a7a1a' }}>■</span>terminal&nbsp;
            <span style={{ color:'#aa2200' }}>■</span>uub
          </span>
        )}
      </div>
    </div>
  );
}

export default CVpPlanoProjCanUI;
