/**
 * CVpCroquisEdificio.tsx
 * Migración de c_vp_croquis_edificio.magik (Sigma Tao / GE / rbsaldan 2007)
 *
 * Jerarquía Magik: c_vp_croquis_edificio extends :c_vp_cobre
 * Propósito: viewport de croquis de edificio. Dibuja:
 *   1) Contorno del croquis (línea negra dashed long_dash).
 *   2) Etiqueta inferior centrada (font bold 50pt, color #AFAF5D).
 *   3) Símbolo NORTE configurable:
 *      - Tamaño A / B / C (proporciones distintas).
 *      - Ubicación en una de las 4 esquinas.
 *      - Rotado por -view_angle para mantener el norte verdadero.
 *   4) Geometrías GIS filtradas por colección (building/colonia/eje_calle/…).
 *   5) Boundary del edificio target (idEdificio) buffer 6, dashed rojo.
 *
 * Atributos editables (layout_attribute_definition):
 *   - ajusta_al_marco       "Si"/"No"          (val_falso_verdadero)
 *   - Tamano                "A"/"B"/"C"        (tamano_norte)
 *   - Ubicacion_Norte       4 esquinas         (ubica_norte)
 *   - etiqueta              texto libre        (pie de cuadro)
 *   - limite_edif           sector              (no editable)
 *   - idEdificio            integer             (no editable)
 *
 * Mapeo Magik → TypeScript:
 *   - sector.new + add(coord) + draw_on(window, line_style)
 *        → ol/Feature(LineString) + Style(Stroke[+lineDash]).
 *   - transform.new().rotate_about(c, θ)/translate(dx,dy)
 *        → matriz acumulable (rotate2DAbout / translate).
 *   - geometry_set.select(:collection, {symbols...})
 *        → features.filter(f => COLECCIONES.has(f.collection)).
 *   - LoBoundary.buffer(6)                     → turf.buffer.
 *   - construir_arco(R, c, θ1, θ2)             → puntos en discretización
 *                                                 entero de grados.
 *   - draw_vtext_transform(:bottom_centre)     → Style(Text) anchor centre.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as turf from '@turf/turf';

import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import {
  LineString as OLLineString,
  Point      as OLPoint,
  Polygon    as OLPolygon,
} from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style, Fill, Text } from 'ol/style';
import { Projection } from 'ol/proj';
import 'ol/ol.css';

// ───────────────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────────────

export interface Bounds { xmin: number; ymin: number; xmax: number; ymax: number; }

export type TamanoNorte = 'A' | 'B' | 'C';
export type UbicacionNorte =
  | 'Esq. Sup. Derecha' | 'Esq. Sup. Izquierda'
  | 'Esq. Inf. Derecha' | 'Esq. Inf. Izquierda';

/** Atributos editables del viewport (layout_attribute_definition Magik). */
export interface VpAttrs {
  ajustaAlMarco : 'Si' | 'No';
  tamano        : TamanoNorte;
  ubicacionNorte: UbicacionNorte;
  etiqueta      : string;
  idEdificio    : number | null;
}

/** Geometría GIS — equivalente a LoGeom Magik. */
export interface GeomGis {
  id        : number;
  collection: string;                       // :building/:user!_colonia/...
  type      : 'point' | 'line' | 'polygon';
  coords    : [number, number] | [number, number][] | [number, number][][];
  rwoId?    : number;                       // LoGeom.rwo.id
}

/** Resultado completo de draw_content_on(window). */
export interface CroquisRender {
  bounds      : Bounds;
  contorno    : [number, number][];               // long_dash negro 2u
  norteSegs   : [number, number][][];             // flecha + lineas + arcos
  norteThick  : Set<number>;                      // índices de segments con grosor 5 (T A/B)
  etiqueta    : { x: number; y: number; texto: string } | null;
  geomFiltered: GeomGis[];
  edificioBuffer: [number, number][] | null;      // anillo del boundary buffer 6
}

// ───────────────────────────────────────────────────────────────────────────
// Constantes Magik
// ───────────────────────────────────────────────────────────────────────────

/** Magik: geometry_set.select(:collection, {…}). 19 colecciones permitidas. */
const COLECCIONES_RENDER = new Set([
  'user!_colonia', 'user!_eje_calle',
  'building', 'user!_building',
  'underground_route', 'user!_central',
  'user!_distrito', 'user!_manzana', 'caseta_tel', 'punto_interes',
  'infraestructura', 'construcciones', 'cartog_ref_fibra_optica',
  'cuerpos_agua', 'rio', 'user!_geografia',
  'aeropuerto', 'user!_carretera', 'ferrocarril', 'vias_comunicacion',
]);

export const TAMANOS_NORTE     : TamanoNorte[]    = ['A', 'B', 'C'];
export const UBICACIONES_NORTE : UbicacionNorte[] = [
  'Esq. Sup. Derecha', 'Esq. Sup. Izquierda',
  'Esq. Inf. Derecha', 'Esq. Inf. Izquierda',
];

// ───────────────────────────────────────────────────────────────────────────
// CLASE PRINCIPAL — CVpCroquisEdificio
// def_slotted_exemplar(:c_vp_croquis_edificio, {:oGeometria}, :c_vp_cobre)
// ───────────────────────────────────────────────────────────────────────────
export class CVpCroquisEdificio {
  bounds   : Bounds;
  attrs    : VpAttrs;
  viewAngle: number = 0;   // grados — view_angle Magik
  scale    : number = 1;   // _self.transform aplicado al boundary

  constructor(bounds: Bounds, attrs: VpAttrs, viewAngle: number = 0) {
    this.bounds    = bounds;
    this.attrs     = attrs;
    this.viewAngle = viewAngle;
  }

  // ─── construir_arco(radio, centro, angIni, angFin) ────────────────────
  // Genera puntos del arco discretizados 1° (range(angIni, angFin) Magik).
  static construirArco(
    radio: number, centro: [number, number], angIni: number, angFin: number,
  ): [number, number][] {
    const pts: [number, number][] = [];
    for (let a = angIni; a <= angFin; a++) {
      const r = (a * Math.PI) / 180;
      pts.push([centro[0] + radio * Math.cos(r), centro[1] + radio * Math.sin(r)]);
    }
    return pts;
  }

  // ─── construir_norte(secRop, tamano) ───────────────────────────────────
  // Construye flecha + 2 líneas horizontales + 4 arcos según tamano A/B/C.
  // Devuelve los sectores construidos + bounds del símbolo.
  construirNorte(tamano: TamanoNorte): { segs: [number, number][][]; bound: Bounds } {
    const c: [number, number] = [
      (this.bounds.xmin + this.bounds.xmax) / 2,
      (this.bounds.ymin + this.bounds.ymax) / 2,
    ];
    const segs: [number, number][][] = [];

    if (tamano === 'A') {
      segs.push(flechaPaths(c, [5, 460, -30, -230, 20, -15, 0, -670, 30, -15, 0, 240, -20, 10]));
      segs.push([[c[0] - 15, c[1]], [c[0] - 90, c[1]]]); // linea izq
      segs.push([[c[0] + 15, c[1]], [c[0] + 90, c[1]]]); // linea der
      for (const [a1, a2] of [[20, 70], [110, 160], [200, 250], [290, 340]]) {
        segs.push(CVpCroquisEdificio.construirArco(65, c, a1, a2));
      }
      return { segs, bound: { xmin: 0, ymin: 0, xmax: 60, ymax: 960 } };
    }
    if (tamano === 'B') {
      segs.push(flechaPaths(c, [5, 320, -25, -170, 15, -15, 0, -470, 30, -15, 0, 170, -20, 10]));
      segs.push([[c[0] - 15, c[1]], [c[0] - 75, c[1]]]);
      segs.push([[c[0] + 15, c[1]], [c[0] + 75, c[1]]]);
      for (const [a1, a2] of [[20, 70], [110, 160], [200, 250], [290, 340]]) {
        segs.push(CVpCroquisEdificio.construirArco(45, c, a1, a2));
      }
      return { segs, bound: { xmin: 0, ymin: 0, xmax: 60, ymax: 710 } };
    }
    // tamano "C"
    segs.push(flechaPaths(c, [2.5, 230, -20, -116, 10, -10, 0, -330, 20, -10, 0, 120, -10, 10]));
    return { segs, bound: { xmin: 0, ymin: 0, xmax: 50, ymax: 500 } };
  }

  // ─── draw_content_on(window) ──────────────────────────────────────────
  drawContentOn(geomSet: GeomGis[]): CroquisRender {
    const b = this.bounds;
    const centro: [number, number] = [(b.xmin + b.xmax) / 2, (b.ymin + b.ymax) / 2];

    // (1) Contorno del croquis — bbox cerrado.
    const contorno: [number, number][] = [
      [b.xmin, b.ymin], [b.xmax, b.ymin], [b.xmax, b.ymax], [b.xmin, b.ymax], [b.xmin, b.ymin],
    ];

    // (2) Etiqueta inferior centrada (Magik: ymin-75, anchor :bottom_centre).
    const etiqueta = this.attrs.etiqueta
      ? { x: centro[0], y: b.ymin - 75, texto: this.attrs.etiqueta }
      : null;

    // (3) Norte — construir + rotar -view_angle + trasladar a esquina.
    const { segs, bound: norteBb } = this.construirNorte(this.attrs.tamano);
    const norteCentro: [number, number] = centro;
    const ang = -(this.viewAngle * Math.PI) / 180;
    let norteSegs = segs.map(s => s.map(p => rotateAbout(p, norteCentro, ang)));

    const wHalf = (norteBb.xmax - norteBb.xmin) / 2;
    const hHalf = (norteBb.ymax - norteBb.ymin) / 2;
    const dx = (b.xmax - b.xmin) * 0.6 + wHalf;
    const dy = (b.ymax - b.ymin) * 0.5 - hHalf;
    const offset = ubicacionOffset(this.attrs.ubicacionNorte, dx, dy);
    norteSegs = norteSegs.map(s => s.map(([x, y]) => [x + offset[0], y + offset[1]] as [number, number]));

    // Magik: en A/B, los segments[2] y [3] (líneas horiz) se redibujan con grosor 5.
    const norteThick = new Set<number>();
    if (this.attrs.tamano === 'A' || this.attrs.tamano === 'B') {
      norteThick.add(1); norteThick.add(2); // índices 0-based equivalentes a 2,3 Magik
    }

    // (4) Filtra geometrías por colección permitida.
    const geomFiltered = geomSet.filter(g => COLECCIONES_RENDER.has(g.collection));

    // (5) Boundary del edificio target — buffer 6.
    let edificioBuffer: [number, number][] | null = null;
    if (this.attrs.idEdificio != null) {
      const edif = geomFiltered.find(g =>
        (g.collection === 'building' || g.collection === 'user!_building') &&
        g.rwoId === this.attrs.idEdificio,
      );
      if (edif && edif.type === 'polygon') {
        // turf.buffer requiere distancia en km (units 'meters' lo permite).
        const poly = turf.polygon(edif.coords as [number, number][][]);
        const buf = turf.buffer(poly, 6, { units: 'meters' });
        if (buf && buf.geometry.type === 'Polygon') {
          edificioBuffer = buf.geometry.coordinates[0] as [number, number][];
        }
      }
    }

    return {
      bounds        : b,
      contorno,
      norteSegs,
      norteThick,
      etiqueta,
      geomFiltered,
      edificioBuffer,
    };
  }

  // ─── geometry_set_for_render ───────────────────────────────────────────
  static geometrySetForRender(geomSet: GeomGis[]): GeomGis[] {
    return geomSet.filter(g => COLECCIONES_RENDER.has(g.collection));
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/** Construye el polígono de la flecha del norte con deltas Magik
 *  alternados (dx, dy, dx, dy, ...) partiendo de centro+offsetX. */
function flechaPaths(centro: [number, number], deltas: number[]): [number, number][] {
  // Primer punto: centro + (deltas[0], 0).
  const pts: [number, number][] = [];
  let x = centro[0] + deltas[0];
  let y = centro[1];
  pts.push([x, y]);
  // Resto en pares (dx, dy).
  for (let i = 1; i < deltas.length; i += 2) {
    x += deltas[i] ?? 0;
    y += deltas[i + 1] ?? 0;
    pts.push([x, y]);
  }
  pts.push(pts[0]); // cierre Magik: .add(.first_coord)
  return pts;
}

function rotateAbout(p: [number, number], c: [number, number], theta: number): [number, number] {
  const cos = Math.cos(theta), sin = Math.sin(theta);
  const dx = p[0] - c[0], dy = p[1] - c[1];
  return [c[0] + dx * cos - dy * sin, c[1] + dx * sin + dy * cos];
}

function ubicacionOffset(u: UbicacionNorte, dx: number, dy: number): [number, number] {
  switch (u) {
    case 'Esq. Sup. Derecha'  : return [ dx,  dy];
    case 'Esq. Sup. Izquierda': return [-dx,  dy];
    case 'Esq. Inf. Derecha'  : return [ dx, -dy];
    case 'Esq. Inf. Izquierda': return [-dx, -dy];
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Mock GIS — set de geometrías para demo.
// ───────────────────────────────────────────────────────────────────────────
const MOCK_GEOMS: GeomGis[] = [
  { id: 1, collection: 'building', type: 'polygon', rwoId: 42,
    coords: [[[300, 300], [600, 300], [600, 500], [300, 500], [300, 300]]] },
  { id: 2, collection: 'user!_colonia',  type: 'polygon',
    coords: [[[100, 100], [900, 100], [900, 700], [100, 700], [100, 100]]] },
  { id: 3, collection: 'user!_eje_calle', type: 'line',
    coords: [[100, 400], [900, 400]] },
  { id: 4, collection: 'underground_route', type: 'line',
    coords: [[200, 200], [800, 600]] },
  { id: 5, collection: 'rio', type: 'line',
    coords: [[100, 100], [400, 200], [700, 100]] },
];

// ───────────────────────────────────────────────────────────────────────────
// UI React — render OpenLayers v10
// ───────────────────────────────────────────────────────────────────────────
export function CVpCroquisEdificioUI() {
  const [tamano,         setTamano]         = useState<TamanoNorte>('A');
  const [ubicacion,      setUbicacion]      = useState<UbicacionNorte>('Esq. Sup. Derecha');
  const [etiqueta,       setEtiqueta]       = useState('CROQUIS DE EDIFICIO');
  const [viewAngle,      setViewAngle]      = useState(0);
  const [idEdificio,     setIdEdificio]     = useState<number | null>(42);

  const bounds: Bounds = { xmin: 0, ymin: 0, xmax: 1000, ymax: 800 };

  const mapRef         = useRef<HTMLDivElement>(null);
  const olMapRef       = useRef<Map | null>(null);
  const contornoSrcRef = useRef<VectorSource | null>(null);
  const geomSrcRef     = useRef<VectorSource | null>(null);
  const norteSrcRef    = useRef<VectorSource | null>(null);
  const norteThickRef  = useRef<VectorSource | null>(null);
  const bufferSrcRef   = useRef<VectorSource | null>(null);
  const labelSrcRef    = useRef<VectorSource | null>(null);

  const render = useMemo<CroquisRender>(() => {
    const vp = new CVpCroquisEdificio(
      bounds,
      { ajustaAlMarco: 'No', tamano, ubicacionNorte: ubicacion, etiqueta, idEdificio },
      viewAngle,
    );
    return vp.drawContentOn(MOCK_GEOMS);
  }, [tamano, ubicacion, etiqueta, viewAngle, idEdificio]);

  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;
    const projection = new Projection({
      code: 'croquis-edificio', units: 'pixels', extent: [-200, -200, 1500, 1500],
    });

    const contornoSrc = new VectorSource();
    const geomSrc     = new VectorSource();
    const norteSrc    = new VectorSource();
    const norteThick  = new VectorSource();
    const bufferSrc   = new VectorSource();
    const labelSrc    = new VectorSource();

    const layerContorno = new VectorLayer({
      source: contornoSrc,
      style : new Style({ stroke: new Stroke({ color: '#000', width: 2, lineDash: [12, 6] }) }),
    });
    const layerGeom = new VectorLayer({
      source: geomSrc,
      style : (f) => {
        const col = f.get('collection') as string;
        const palette: Record<string, string> = {
          'building'         : '#9e9e9e', 'user!_building': '#9e9e9e',
          'user!_colonia'    : '#cfd8dc',
          'user!_eje_calle'  : '#90caf9', 'user!_carretera': '#64b5f6',
          'underground_route': '#a1887f',
          'rio'              : '#4fc3f7', 'cuerpos_agua': '#4fc3f7',
        };
        const c = palette[col] ?? '#bdbdbd';
        return new Style({
          stroke: new Stroke({ color: c, width: 1.5 }),
          fill  : new Fill({ color: c + '40' }),
        });
      },
    });
    const layerNorte = new VectorLayer({
      source: norteSrc,
      style : new Style({ stroke: new Stroke({ color: '#000', width: 2 }) }),
    });
    const layerNorteThick = new VectorLayer({
      source: norteThick,
      style : new Style({ stroke: new Stroke({ color: '#000', width: 5 }) }),
    });
    const layerBuffer = new VectorLayer({
      source: bufferSrc,
      style : new Style({ stroke: new Stroke({ color: '#d32f2f', width: 3, lineDash: [4, 4] }) }),
    });
    const layerLabel = new VectorLayer({
      source: labelSrc,
      style : (f, res) => new Style({
        text: new Text({
          text     : f.get('texto') as string,
          font     : `bold ${Math.max(12, 50 * 8 / res)}px sans-serif`,
          fill     : new Fill({ color: '#AFAF5D' }),
          textAlign: 'center',
          textBaseline: 'top',
        }),
      }),
    });

    olMapRef.current = new Map({
      target  : mapRef.current,
      layers  : [layerGeom, layerContorno, layerBuffer, layerNorte, layerNorteThick, layerLabel],
      view    : new View({ projection, center: [500, 400], resolution: 2 }),
      controls: [],
    });

    contornoSrcRef.current = contornoSrc;
    geomSrcRef.current     = geomSrc;
    norteSrcRef.current    = norteSrc;
    norteThickRef.current  = norteThick;
    bufferSrcRef.current   = bufferSrc;
    labelSrcRef.current    = labelSrc;
  }, []);

  useEffect(() => {
    const contornoSrc = contornoSrcRef.current;
    const geomSrc     = geomSrcRef.current;
    const norteSrc    = norteSrcRef.current;
    const norteThick  = norteThickRef.current;
    const bufferSrc   = bufferSrcRef.current;
    const labelSrc    = labelSrcRef.current;
    if (!contornoSrc || !geomSrc || !norteSrc || !norteThick || !bufferSrc || !labelSrc) return;

    contornoSrc.clear(); geomSrc.clear(); norteSrc.clear();
    norteThick.clear();  bufferSrc.clear(); labelSrc.clear();

    contornoSrc.addFeature(new Feature({ geometry: new OLLineString(render.contorno) }));

    // Geom GIS subyacentes.
    for (const g of render.geomFiltered) {
      let f: Feature | null = null;
      if (g.type === 'point') {
        f = new Feature({ geometry: new OLPoint(g.coords as [number, number]) });
      } else if (g.type === 'line') {
        f = new Feature({ geometry: new OLLineString(g.coords as [number, number][]) });
      } else if (g.type === 'polygon') {
        f = new Feature({ geometry: new OLPolygon(g.coords as [number, number][][]) });
      }
      if (f) { f.set('collection', g.collection); geomSrc.addFeature(f); }
    }

    // Norte — segs normales + segs gruesos.
    render.norteSegs.forEach((seg, i) => {
      const f = new Feature({ geometry: new OLLineString(seg) });
      (render.norteThick.has(i) ? norteThick : norteSrc).addFeature(f);
    });

    // Buffer del edificio.
    if (render.edificioBuffer) {
      bufferSrc.addFeature(new Feature({ geometry: new OLLineString(render.edificioBuffer) }));
    }

    // Etiqueta.
    if (render.etiqueta) {
      const f = new Feature({ geometry: new OLPoint([render.etiqueta.x, render.etiqueta.y]) });
      f.set('texto', render.etiqueta.texto);
      labelSrc.addFeature(f);
    }
  }, [render]);

  return (
    <div>
      <p style={uiStyles.meta}>
        Viewport croquis edificio. Contorno (dash) + geometrías GIS filtradas
        (colonia/eje_calle/building/…) + símbolo norte rotado por
        −view_angle + boundary del edificio target con buffer 6 (rojo
        dashed). Etiqueta inferior con color #AFAF5D.
      </p>
      <div style={uiStyles.controls}>
        <label>
          Tamaño:&nbsp;
          <select value={tamano} onChange={e => setTamano(e.target.value as TamanoNorte)} style={uiStyles.input}>
            {TAMANOS_NORTE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Ubicación norte:&nbsp;
          <select value={ubicacion} onChange={e => setUbicacion(e.target.value as UbicacionNorte)} style={uiStyles.input}>
            {UBICACIONES_NORTE.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label>
          Etiqueta:&nbsp;
          <input type="text" value={etiqueta} onChange={e => setEtiqueta(e.target.value)}
                 style={{ ...uiStyles.input, width: 240 }} />
        </label>
        <label>
          view_angle:&nbsp;
          <input type="range" min={0} max={360} value={viewAngle}
                 onChange={e => setViewAngle(+e.target.value)} />
          &nbsp;{viewAngle}°
        </label>
        <label>
          idEdificio:&nbsp;
          <input type="number" value={idEdificio ?? ''} onChange={e => setIdEdificio(e.target.value ? +e.target.value : null)}
                 style={{ ...uiStyles.input, width: 80 }} />
        </label>
      </div>

      <div style={uiStyles.info}>
        <span>norte segs: {render.norteSegs.length}</span>
        <span>thick: {render.norteThick.size}</span>
        <span>geom: {render.geomFiltered.length}</span>
        <span>buffer: {render.edificioBuffer ? 'sí' : '—'}</span>
      </div>

      <div ref={mapRef} style={uiStyles.map} />
    </div>
  );
}

const uiStyles: Record<string, React.CSSProperties> = {
  meta    : { color: '#666', fontSize: 12, margin: '4px 0 12px' },
  controls: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  input   : { padding: '3px 6px', border: '1px solid #b0bec5', borderRadius: 4, fontSize: 12 },
  info    : { display: 'flex', gap: 18, fontSize: 11, color: '#444', margin: '4px 0 10px' },
  map     : { width: '100%', height: 520, border: '1px solid #ccd', background: '#fafafa' },
};

export default CVpCroquisEdificio;
