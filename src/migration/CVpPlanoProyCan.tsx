/**
 * Migración: c_vp_plano_proy_can.magik
 * GE Network Solutions — ahernan / rbsaldan — SIGC11 / 2004-2025
 * Clase Magik: c_vp_plano_proy_can — extiende viewport_layout
 *
 * Viewport que renderiza una sección (plano) de la canalización proyectada.
 * El tramo completo se divide en N secciones mediante c_seccionamiento;
 * este viewport muestra únicamente la sección iIndicePlano.
 *
 * Métodos migrados:
 *   defined_attributes()                    → DEFINED_ATTRIBUTES (constante)
 *   val_falso_verdadero()                   → PozoUbicacion enum + VAL_POZO_UBICACION
 *   DibujaLineaEntrePozoIniYFin(win, plano) → dibujaLineaEntrePozos()
 *   DibujarMarcasDeContinuacion(win, i, g)  → dibujarMarcasDeContinuacion()
 *   draw_content_on(windows)                → drawContentOn()
 *   geometry_set_for_render                 → geometrySetForRender()
 *   initialise_for_page(page)               → initializeForPage()
 *   objetos_visibles(resultSet)             → objetosVisibles()
 *
 * Decisiones de diseño:
 *   obten_pto_separado(dist, angle) → getOffsetPoint(seg, dist, angleDeg)
 *   sector / sector_rope            → Coordinate[] / Coordinate[][]
 *   LsABC["ABCDEFGHIjk"][i]        → SECTION_LABELS[i - 1]  (Magik 1-based)
 *   cross-viewport (DibujaLinea)    → recibe datos de ambos viewports como parámetro
 */

import React, { useState } from 'react';
import * as turf from '@turf/turf';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: sector / sector_rope — coordenada proyectada [x, y] */
export type Coord2D = [number, number];

/** Segmento dirigido: dos puntos consecutivos de un LineString */
export type Segment = [Coord2D, Coord2D];

/** Datos de un pozo: ubicación y tipo */
export interface Pozo {
  location: Coord2D;
  tipo: 'inicial' | 'final';
}

/** Tramo de cobre con su canalización y pozos */
export interface TramoCobre {
  canalizacion: GeoJSON.Feature<GeoJSON.LineString>[];
  pozo1: Pozo | null;
  pozo2: Pozo | null;
}

/** Sección producida por c_seccionamiento */
export interface Seccion {
  area   : turf.Feature<turf.Polygon>;
  geom   : turf.Feature<turf.LineString>;
  angulo : number;   // radianes
  modulos: number;
}

/** Datos de otro viewport CVpPlanoProyCan (para la línea entre pozos) */
export interface ViewportHermano {
  pozo        : PozoUbicacion;
  coordPozo   : Coord2D;
  alturaPlano : number;   // layout_page.height en unidades de mapa
}

/** Magik: slots del exemplar */
export interface ICVpPlanoProyCan {
  oGeometria     : turf.Feature<turf.LineString> | null;
  iIndicePlano   : number;
  iNumeroSecciones: number;
}

// =============================================================================
// ENUMS Y CONSTANTES
// =============================================================================

/** Magik: val_falso_verdadero() — valores del slot :pozo */
export type PozoUbicacion = 'Ninguno' | 'Inicial' | 'Final' | 'Ambos';
export const VAL_POZO_UBICACION: PozoUbicacion[] = ['Ninguno', 'Inicial', 'Final', 'Ambos'];

/** Magik: LsABC << "ABCDEFGHIjk" — etiquetas de secciones, 0-based aquí */
export const SECTION_LABELS = 'ABCDEFGHIjk'.split('');

/** Magik: define_shared_constant(:allowed_on_menu?, _false) */
export const ALLOWED_ON_MENU = false;

/** Magik: defined_attributes() */
export const DEFINED_ATTRIBUTES = [
  {
    nombre       : 'ajusta_al_marco',
    tipo         : 'string',
    descripcion  : 'Ajustar al Marco',
    default      : 'Si',
    enPropiedades: true,
    enumMethod   : 'val_falso_verdadero',
  },
  {
    nombre       : 'Indice',
    tipo         : 'integer',
    descripcion  : 'Indica el indice del plano',
    default      : 0,
    enPropiedades: true,
  },
  {
    nombre       : 'pozo',
    tipo         : 'string',
    descripcion  : 'Indica si contiene el pozo inicial o final o ambos.',
    default      : 'Ninguno' as PozoUbicacion,
    enPropiedades: true,
    enumMethod   : 'val_falso_verdadero',
  },
  { nombre: 'xMin', tipo: 'float', descripcion: 'xmin', default: 0.0, enPropiedades: true },
  { nombre: 'yMin', tipo: 'float', descripcion: 'ymin', default: 0.0, enPropiedades: true },
  { nombre: 'xMax', tipo: 'float', descripcion: 'xmax', default: 0.0, enPropiedades: true },
  { nombre: 'yMax', tipo: 'float', descripcion: 'ymax', default: 0.0, enPropiedades: true },
] as const;

// =============================================================================
// HELPERS GEOMÉTRICOS
// =============================================================================

/**
 * Magik: segment.obten_pto_separado(distance, angleDeg)
 * Calcula un punto offset desde el extremo final del segmento,
 * rotado angleDeg grados respecto a la dirección del segmento.
 * -90 → derecha perpendicular, +90 → izquierda perpendicular.
 */
export function getOffsetPoint(seg: Segment, distance: number, angleDeg: number): Coord2D {
  const [p1, p2] = seg;
  const segAngle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const totalAngle = segAngle + (angleDeg * Math.PI) / 180;
  return [
    p2[0] + Math.cos(totalAngle) * distance,
    p2[1] + Math.sin(totalAngle) * distance,
  ];
}

/**
 * Magik: PoGeom.segment(n) — segmento n-ésimo (1-based en Magik → 0-based aquí).
 * Retorna [coordInicio, coordFin] del segmento n (1-based).
 */
export function getSegment(coords: Coord2D[], nOneBased: number): Segment {
  const i = nOneBased - 1;
  return [coords[i], coords[i + 1]];
}

/** Magik: segment.reversed() — invierte la dirección del segmento */
export function reverseSegment(seg: Segment): Segment {
  return [seg[1], seg[0]];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_CANALIZACION: TramoCobre = {
  canalizacion: [
    {
      type: 'Feature',
      properties: { tipo: 'underground_route', nombre: 'Canal Principal' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-99.152, 19.434], [-99.148, 19.436], [-99.144, 19.435],
          [-99.140, 19.433], [-99.136, 19.432],
        ],
      },
    },
  ],
  pozo1: { location: [-99.152, 19.434], tipo: 'inicial' },
  pozo2: { location: [-99.136, 19.432], tipo: 'final' },
};

const MOCK_SECCIONES: Seccion[] = [
  {
    area: turf.bboxPolygon([-99.152, 19.432, -99.144, 19.438]),
    geom: turf.lineString([[-99.152, 19.434], [-99.148, 19.436], [-99.144, 19.435]]),
    angulo: 0.05,
    modulos: 1,
  },
  {
    area: turf.bboxPolygon([-99.144, 19.430, -99.136, 19.437]),
    geom: turf.lineString([[-99.144, 19.435], [-99.140, 19.433], [-99.136, 19.432]]),
    angulo: -0.03,
    modulos: 1,
  },
];

// =============================================================================
// UTILIDADES SVG (proyección lon/lat → píxeles)
// =============================================================================

const GEO_EXTENT: [number, number, number, number] = [-99.158, 19.428, -99.130, 19.440];
const SVG_W = 500;
const SVG_H = 300;

function geoToSvg(c: GeoJSON.Position): [number, number] {
  const [minLon, minLat, maxLon, maxLat] = GEO_EXTENT;
  return [
    ((c[0] - minLon) / (maxLon - minLon)) * SVG_W,
    ((maxLat - c[1]) / (maxLat - minLat)) * SVG_H,
  ];
}

function coordsToPoints(coords: GeoJSON.Position[]): string {
  return coords.map(geoToSvg).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

// Factor de escala geo→svg para distancias (aprox. para mock)
const GEO_SCALE = SVG_W / (GEO_EXTENT[2] - GEO_EXTENT[0]);

// =============================================================================
// CLASE PRINCIPAL — c_vp_plano_proy_can
// =============================================================================

export class CVpPlanoProyCan implements ICVpPlanoProyCan {

  static readonly ALLOWED_ON_MENU = false;

  // Magik: {:oGeometria, _unset, :writable, :public}
  oGeometria: turf.Feature<turf.LineString> | null = null;

  // Magik: {:iIndicePlano, _unset, :writable, :public}
  iIndicePlano: number = 0;

  // Magik: {:iNumeroSecciones, _unset, :writable, :public}
  iNumeroSecciones: number = 0;

  // Atributos de layout (del defined_attributes)
  indice     : number       = 0;
  pozo       : PozoUbicacion = 'Ninguno';
  xMin       : number       = 0;
  yMin       : number       = 0;
  xMax       : number       = 0;
  yMax       : number       = 0;

  /** Magik: initialise_for_page(a_layout_page) */
  initializeForPage(): void {
    // Magik: _self.selection<<_false; _self.trail<<_false
    // _self.set_fill_colour(_unset); _self.outline_style<<_unset
    this.oGeometria = null;
    this.iIndicePlano = 0;
    this.iNumeroSecciones = 0;
  }

  /**
   * Magik: objetos_visibles(PcollResultSet)
   * Filtra features que intersectan con el bounding box del viewport.
   */
  objetosVisibles(features: GeoJSON.Feature[]): GeoJSON.Feature[] {
    const bbox = turf.bboxPolygon([this.xMin, this.yMin, this.xMax, this.yMax]);
    return features.filter(f => turf.booleanIntersects(f, bbox));
  }

  /**
   * Magik: geometry_set_for_render
   * Aplica objetosVisibles sobre el result set base del super.
   */
  geometrySetForRender(resultSet: GeoJSON.Feature[] | null): GeoJSON.Feature[] | null {
    if (resultSet === null) return null;
    return this.objetosVisibles(resultSet);
  }

  /**
   * Magik: DibujaLineaEntrePozoIniYFin(PoWindow, PoPlano)
   * Dibuja una línea vertical entre los pozos inicial y final que
   * conecta dos viewports distintos del mismo layout.
   * En TS se reciben las coordenadas ya transformadas de ambos viewports.
   *
   * Retorna los puntos SVG de la línea de 4 vértices (en forma de S).
   */
  dibujaLineaEntrePozos(
    coordPozo1Svg: [number, number],
    coordPozo2Svg: [number, number],
    alturaPlano1Svg: number,
    alturaPlano2Svg: number,
    offsetY = 200
  ): [number, number][] | null {
    if (this.pozo !== 'Inicial') return null;

    // Magik: LoY << LoPlanoIni.layout_page.height - LoCoordPozo1.y - 200
    const y1top = alturaPlano1Svg - coordPozo1Svg[1] - offsetY;
    const y2top = alturaPlano2Svg - coordPozo2Svg[1] - offsetY;

    return [
      coordPozo1Svg,
      [coordPozo1Svg[0], y1top],
      [coordPozo2Svg[0], y2top],
      coordPozo2Svg,
    ];
  }

  /**
   * Magik: DibujarMarcasDeContinuacion(PoWindow, PiIndice, PoGeom)
   * Dibuja marcas en forma de corchete C en los extremos del segmento.
   * Retorna los sectores SVG y etiquetas para renderizado.
   */
  dibujarMarcasDeContinuacion(
    indice     : number,
    coordsSvg  : [number, number][],
    scale      : number = 1
  ): { sectores: [number, number][][]; etiquetas: { pos: [number, number]; texto: string }[] } {
    const sectores: [number, number][][] = [];
    const etiquetas: { pos: [number, number]; texto: string }[] = [];

    const D10 = 10 * 100 * scale;
    const D8  =  8 * 100 * scale;
    const D7  =  7 * 100 * scale;
    const D4  =  4 * 100 * scale;

    const n = coordsSvg.length;
    if (n < 2) return { sectores, etiquetas };

    // Construye un segmento dirigido a partir de los últimos/primeros dos coords
    const lastSeg: Segment = [coordsSvg[n - 2], coordsSvg[n - 1]];
    const firstSeg: Segment = reverseSegment([coordsSvg[0], coordsSvg[1]]);

    const dibujaDerecha = (): void => {
      // Magik: LoSegmento << PoGeom.segment(.oGeometria.n_segments)
      const s1: [number, number][] = [
        getOffsetPoint(lastSeg, D10, -90),
        getOffsetPoint(lastSeg, D8, -90),
      ];
      const s2: [number, number][] = [
        getOffsetPoint(lastSeg, D4, -90),
        getOffsetPoint(lastSeg, D4, 90),
      ];
      const s3: [number, number][] = [
        getOffsetPoint(lastSeg, D8, 90),
        getOffsetPoint(lastSeg, D10, 90),
      ];
      sectores.push(s1, s2, s3);

      const label = SECTION_LABELS[indice - 1] ?? '?';
      etiquetas.push({ pos: s1[0], texto: label });
      etiquetas.push({ pos: s3[1], texto: label });
    };

    const dibujaIzquierda = (labelIndex: number): void => {
      // Magik: LoSegmento << PoGeom.segment(1).reversed()
      const s1: [number, number][] = [
        getOffsetPoint(firstSeg, D10, 90),
        getOffsetPoint(firstSeg, D8, 90),
      ];
      const s2: [number, number][] = [
        getOffsetPoint(firstSeg, D7, 90),
        getOffsetPoint(firstSeg, D7, -90),
      ];
      const s3: [number, number][] = [
        getOffsetPoint(firstSeg, D8, -90),
        getOffsetPoint(firstSeg, D10, -90),
      ];
      sectores.push(s1, s2, s3);

      const label = SECTION_LABELS[labelIndex - 1] ?? '?';
      etiquetas.push({ pos: s1[0], texto: label });
      etiquetas.push({ pos: s3[1], texto: label });
    };

    if (this.iIndicePlano === 1) {
      // Sólo marca derecha (sección inicial)
      dibujaDerecha();
    } else if (this.iIndicePlano === this.iNumeroSecciones) {
      // Sólo marca izquierda (sección final)
      dibujaIzquierda(indice - 1);
    } else {
      // Ambas marcas (secciones intermedias)
      dibujaDerecha();
      dibujaIzquierda(indice - 1);
    }

    return { sectores, etiquetas };
  }

  /**
   * Magik: draw_content_on(windows)
   * Lógica principal: crea la geometría del sector, la secciona y prepara
   * los datos de render para la sección iIndicePlano.
   *
   * En TS retorna los datos de visualización en lugar de dibujar directamente.
   */
  drawContentOn(tramoCobre: TramoCobre, secciones: Seccion[]): {
    geomSvg    : [number, number][];
    marcas     : ReturnType<CVpPlanoProyCan['dibujarMarcasDeContinuacion']>;
    labelPlano : string;
    totalSecs  : number;
  } | null {
    // Magik: _self.iIndicePlano << _self.Indice > 0 ? _self.Indice : 0
    this.iIndicePlano = this.indice > 0 ? this.indice : 0;

    // Magik: construir LoSector desde canalizacion
    const allCoords: GeoJSON.Position[] = [];
    for (const tramo of tramoCobre.canalizacion) {
      for (const coord of tramo.geometry.coordinates) {
        allCoords.push(coord);
      }
    }

    if (allCoords.length < 2) {
      // Magik: (09/08/25 ahernan) — por lo menos es un tramo
      this.iNumeroSecciones = 1;
      this.iIndicePlano = 1;
    } else if (secciones.length > 0) {
      this.iNumeroSecciones = secciones.length;

      if (
        this.iIndicePlano > 0 &&
        this.iIndicePlano <= secciones.length
      ) {
        const seccion = secciones[this.iIndicePlano - 1];
        this.oGeometria = seccion.geom;
      }
    } else {
      this.iNumeroSecciones = 1;
      this.iIndicePlano = 1;
    }

    const labelPlano =
      `PLANO NUMERO : ${this.iIndicePlano ?? 1} de ${this.iNumeroSecciones ?? 1}`;

    if (this.oGeometria === null) return null;

    const geomCoords = this.oGeometria.geometry.coordinates;
    const geomSvg = geomCoords.map(geoToSvg);

    const marcas =
      this.iNumeroSecciones > 1 && this.iIndicePlano > 0
        ? this.dibujarMarcasDeContinuacion(this.iIndicePlano, geomSvg, GEO_SCALE * 0.0001)
        : { sectores: [], etiquetas: [] };

    return { geomSvg, marcas, labelPlano, totalSecs: this.iNumeroSecciones };
  }
}

// =============================================================================
// COMPONENTE REACT — visualización de una sección de plano
// =============================================================================

const COLOR_MARCAS = 'rgb(175,175,93)';   // Magik: colour.new_from_dec("175,175,93")
const COLOR_LINEA  = 'rgb(0,0,0)';        // Magik: colour.new_from_dec("0,0,0")

export default function CVpPlanoProyCanViewer(): React.ReactElement {
  const [indicePlano, setIndicePlano] = useState(1);
  const [pozo, setPozo] = useState<PozoUbicacion>('Inicial');

  const vp = new CVpPlanoProyCan();
  vp.indice = indicePlano;
  vp.pozo = pozo;

  const result = vp.drawContentOn(MOCK_CANALIZACION, MOCK_SECCIONES);

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CVpPlanoProyCan — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_vp_plano_proy_can</code> — viewport de plano de proyección de canalización
      </p>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <label>
          Índice de plano:&nbsp;
          <select value={indicePlano} onChange={e => setIndicePlano(Number(e.target.value))}>
            {MOCK_SECCIONES.map((_, i) => (
              <option key={i + 1} value={i + 1}>Plano {i + 1}</option>
            ))}
          </select>
        </label>
        <label>
          Pozo:&nbsp;
          <select value={pozo} onChange={e => setPozo(e.target.value as PozoUbicacion)}>
            {VAL_POZO_UBICACION.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
      </div>

      {/* Viewport SVG */}
      <svg
        width={SVG_W}
        height={SVG_H}
        style={{ border: '1px solid #ccc', background: '#f8f8f8', display: 'block' }}
      >
        {/* Geometría de la sección */}
        {result && (
          <polyline
            points={result.geomSvg.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="steelblue"
            strokeWidth={2}
          />
        )}

        {/* Pozos mock */}
        {MOCK_CANALIZACION.pozo1 && (() => {
          const [sx, sy] = geoToSvg(MOCK_CANALIZACION.pozo1!.location);
          return <circle cx={sx} cy={sy} r={5} fill="green" />;
        })()}
        {MOCK_CANALIZACION.pozo2 && (() => {
          const [sx, sy] = geoToSvg(MOCK_CANALIZACION.pozo2!.location);
          return <circle cx={sx} cy={sy} r={5} fill="red" />;
        })()}

        {/* Marcas de continuación */}
        {result?.marcas.sectores.map((pts, si) => (
          <polyline
            key={si}
            points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
            fill="none"
            stroke={COLOR_MARCAS}
            strokeWidth={2}
          />
        ))}
        {result?.marcas.etiquetas.map((et, ei) => (
          <text
            key={ei}
            x={et.pos[0]}
            y={et.pos[1]}
            fontSize={14}
            fill={COLOR_MARCAS}
            textAnchor="middle"
            fontWeight="bold"
          >
            {et.texto}
          </text>
        ))}

        {/* Línea entre pozos (sólo si pozo=Inicial y tenemos coord del final) */}
        {pozo === 'Inicial' && result && (() => {
          const p1 = geoToSvg(MOCK_CANALIZACION.pozo1!.location);
          const p2 = geoToSvg(MOCK_CANALIZACION.pozo2!.location);
          const linePts = vp.dibujaLineaEntrePozos(p1, p2, SVG_H, SVG_H, 20);
          if (!linePts) return null;
          return (
            <polyline
              points={linePts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
              fill="none"
              stroke={COLOR_LINEA}
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          );
        })()}

        {/* Label de plano */}
        {result && (
          <text x={SVG_W / 2} y={SVG_H - 8} fontSize={11} fill="#444" textAnchor="middle">
            {result.labelPlano}
          </text>
        )}
      </svg>

      {/* Atributos definidos */}
      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          defined_attributes() — {DEFINED_ATTRIBUTES.length} atributos
        </summary>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, marginTop: 8 }}>
          <thead>
            <tr>
              {['nombre','tipo','descripcion','default'].map(h => (
                <th key={h} style={{ border: '1px solid #ccc', padding: '2px 8px', background: '#eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEFINED_ATTRIBUTES.map(a => (
              <tr key={a.nombre}>
                <td style={{ border: '1px solid #ccc', padding: '2px 8px' }}>{a.nombre}</td>
                <td style={{ border: '1px solid #ccc', padding: '2px 8px' }}>{a.tipo}</td>
                <td style={{ border: '1px solid #ccc', padding: '2px 8px' }}>{a.descripcion}</td>
                <td style={{ border: '1px solid #ccc', padding: '2px 8px' }}>{String(a.default)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {/* Estado interno */}
      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Estado interno del viewport</summary>
        <pre style={{ background: '#f0f0f0', padding: 8, fontSize: 11 }}>
          {JSON.stringify({
            iIndicePlano    : vp.iIndicePlano,
            iNumeroSecciones: vp.iNumeroSecciones,
            pozo,
            oGeometria      : vp.oGeometria ? 'Feature<LineString>' : null,
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
