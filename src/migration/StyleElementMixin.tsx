/**
 * StyleElementMixin.tsx
 * Migración de style_element_mixin.magik (Sigma Tao / GE Networks / rbsaldan 2004)
 *
 * Jerarquía Magik: def_mixin(:style_element_mixin)
 * Propósito: utilidad para definir y dibujar "estilos" parametrizados
 *   (área, círculo, texto) sobre un layout_element, con:
 *     · cálculo de bbox de cualquier combinación de figuras (calcula_bound).
 *     · rotación + escalado al bbox del propio elemento (draw_style).
 *     · línea opcional desde el centro del estilo a un objeto GIS, con
 *       lógica de "doblez" alrededor del viewport (Persistencia con
 *       PsConLinea/PsUsaVp) y punta de flecha opcional (PsConPunta).
 *     · agrega_linea: polyline + textbox de etiqueta sobre la mediana.
 *     · helpers geométricos: obten_pto_intersect / obten_pto_separado.
 *
 * Mapeo Magik → TypeScript:
 *   - transform.new().rotate(theta)            → matriz rotate2D(x,y,θ).
 *   - bounding_box.new_centred(cx,cy,r)        → Bounds {cx±r, cy±r}.
 *   - sector.new + add + draw_on               → ol/Feature(LineString).
 *   - circle.new(c,r) + draw_on                → ol/Feature(Polygon) ó Style(Circle).
 *   - draw_vtext_transform(..,θ,:centre_centre)→ Style(Text) rotation=−θ.
 *   - property_list.fast_keys()                → Object.keys(ESTILOS).
 *   - LoSectores.mid_point / angle_at_coord    → turf.along + turf.bearing.
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
import { Stroke, Style, Fill, Text, Circle as CircleStyle } from 'ol/style';
import { Projection } from 'ol/proj';
import 'ol/ol.css';

// ───────────────────────────────────────────────────────────────────────────
// TIPOS — estructura de tupla Magik por kind del estilo
// ───────────────────────────────────────────────────────────────────────────

export interface Bounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/** Magik: {:area, fill_style|_unset, line_style|_unset, coord_array} */
export interface EstiloArea {
  kind     : 'area';
  fillStyle: string | null;
  lineStyle: string | null;
  coords   : [number, number][];
}

/** Magik: {:circle, line_style, cx, cy, radius} */
export interface EstiloCirculo {
  kind     : 'circle';
  lineStyle: string;
  cx       : number;
  cy       : number;
  radius   : number;
}

/** Magik: {:text, text_style, x, y, text_string} */
export interface EstiloTexto {
  kind     : 'text';
  textStyle: string;
  x        : number;
  y        : number;
  texto    : string;
}

export type EstiloItem = EstiloArea | EstiloCirculo | EstiloTexto;

/** Catálogo Magik: ESTILOS property_list ↔ Record<string, EstiloItem[]>. */
export type Estilos = Record<string, EstiloItem[]>;

/** ObjGis para el ancla de la línea (PoObj + PyCpoGeoObj). */
export interface ObjGis {
  geomType: 'point' | 'chain';
  coords  : [number, number][]; // 1 pt si :point, N pts si :chain
}

/** Resultado de draw_style — primitivas dibujables. */
export interface DrawnPrimitive {
  type    : 'polyline' | 'polygon' | 'circle' | 'text';
  coords  : [number, number][];
  cx?     : number;
  cy?     : number;
  radius? : number;
  texto?  : string;
  rotation?: number;
  color   : string;
  fill?   : string | null;
}

// ───────────────────────────────────────────────────────────────────────────
// MIXIN — métodos puros (sin estado interno excepto bounds/page mocks)
// ───────────────────────────────────────────────────────────────────────────
export class StyleElementMixin {
  // Magik: shared constant ESTILOS = property_list.new()
  static ESTILOS: Estilos = {};

  /** bounds del elemento de layout (self_bounds). */
  bounds: Bounds = { xmin: 0, ymin: 0, xmax: 1000, ymax: 1000 };

  /** Slot Magik usa_viewport — desactivado cuando el centro cae dentro del VP. */
  usaViewport: 'Si' | 'No' = 'Si';

  // ─── calcula_bound(PaEstilos) ─────────────────────────────────────────
  // Recorre estilos y une los bboxes parciales (area/circle/text).
  calculaBound(estilos: EstiloItem[]): Bounds | null {
    let total: Bounds | null = null;
    for (const e of estilos) {
      const parcial = StyleElementMixin.bboxDeEstilo(e);
      if (!parcial) continue;
      total = total ? unionBounds(total, parcial) : parcial;
    }
    return total;
  }

  private static bboxDeEstilo(e: EstiloItem): Bounds | null {
    if (e.kind === 'area')   return boundsOfCoords(e.coords);
    if (e.kind === 'circle') return centeredBounds(e.cx, e.cy, e.radius);
    if (e.kind === 'text')   return centeredBounds(e.x, e.y, 2.0); // Magik: bounding_box.new_centred(x,y,2.0)
    return null;
  }

  // ─── draw_style(...) ──────────────────────────────────────────────────
  // Compone:
  //   1) (Opcional) Línea desde centro de self_bounds a un objeto GIS.
  //   2) Las figuras del estilo, rotadas + escaladas al bbox del elemento.
  drawStyle(opts: {
    estilos    : EstiloItem[];
    angulo     : number;            // rad
    obj?       : ObjGis | null;
    viewport?  : Bounds | null;
    paginaBb?  : Bounds | null;     // layout_page.bounds
    conLinea?  : boolean;           // PsConLinea
    usaVp?     : boolean;           // PsUsaVp
    conPunta?  : boolean;           // PsConPunta
  }): DrawnPrimitive[] {
    const { estilos, obj, viewport, paginaBb } = opts;
    let angulo = opts.angulo;
    const dataBoundsRaw = this.calculaBound(estilos);
    if (!dataBoundsRaw) return [];

    // Aplica rotación al outline y recalcula bbox post-rotación.
    const dataBounds = rotatedBounds(dataBoundsRaw, angulo);
    const self = this.bounds;
    const centro: [number, number] = [(self.xmin + self.xmax) / 2, (self.ymin + self.ymax) / 2];

    const out: DrawnPrimitive[] = [];

    // ── (1) Línea opcional → objeto GIS ──────────────────────────────
    let coordObj: [number, number] | null = null;
    if (obj) coordObj = StyleElementMixin.coordDeObj(obj);

    if (opts.conLinea && coordObj) {
      const sectores: [number, number][] = [coordObj];
      if (opts.usaVp && viewport && paginaBb) {
        // Lógica Magik de "doblez" del LoSectores respecto al viewport.
        const r = this.calculaDoblezVp(centro, coordObj, viewport, paginaBb, angulo);
        sectores.push(...r.puntos);
        angulo = r.anguloNuevo;
        if (
          centro[0] >= viewport.xmin && centro[0] <= viewport.xmax &&
          centro[1] >= viewport.ymin && centro[1] <= viewport.ymax
        ) {
          this.usaViewport = 'No';
        }
      } else if (centro[1] < coordObj[1]) {
        // Magik: si centro.y<LoCoord.y → angulo += 180°.
        angulo += Math.PI;
      }
      sectores.push(centro);

      // Punta de flecha opcional — usa obten_pto_separado + intersect.
      if (opts.conPunta && sectores.length >= 2) {
        const p1 = sectores[0];
        const p2 = sectores[1];
        const p3 = StyleElementMixin.obtenPtoSeparado(p1, p2, 50, 15);
        const p4 = StyleElementMixin.obtenPtoIntersect(p1, p2, p3);
        sectores.unshift(p4, p3);
      }
      out.push({ type: 'polyline', coords: sectores, color: '#000' });
    }

    // ── (2) Figuras del estilo, rotadas + escaladas al self_bounds ───
    const escala = Math.min(
      (self.ymax - self.ymin) / Math.max(1, dataBounds.ymax - dataBounds.ymin),
      (self.xmax - self.xmin) / Math.max(1, dataBounds.xmax - dataBounds.xmin),
    );

    for (const est of estilos) {
      if (est.kind === 'area') {
        const rotEsc = est.coords.map(c => {
          const r = rotate2D(c[0], c[1], angulo);
          return [r[0] * escala + centro[0], r[1] * escala + centro[1]] as [number, number];
        });
        out.push({
          type  : 'polygon',
          coords: rotEsc,
          color : est.lineStyle ?? 'transparent',
          fill  : est.fillStyle,
        });
      } else if (est.kind === 'circle') {
        const r = rotate2D(est.cx, est.cy, angulo);
        const pos: [number, number] = [centro[0] + r[0] * escala, centro[1] + r[1] * escala];
        out.push({
          type  : 'circle',
          coords: [pos],
          cx    : pos[0],
          cy    : pos[1],
          radius: est.radius * escala,
          color : est.lineStyle,
        });
      } else if (est.kind === 'text') {
        const r = rotate2D(est.x, est.y, angulo);
        const pos: [number, number] = [centro[0] + r[0] * escala, centro[1] + r[1] * escala];
        out.push({
          type    : 'text',
          coords  : [pos],
          texto   : est.texto,
          rotation: -angulo, // OL clockwise → texto legible bottom→top con −θ
          color   : '#000',
        });
      }
    }
    return out;
  }

  // ─── Subrutina del "doblez" frente al viewport (Magik líneas 167–221) ─
  private calculaDoblezVp(
    centro  : [number, number],
    _coord  : [number, number],
    vp      : Bounds,
    pagina  : Bounds,
    anguloIn: number,
  ): { puntos: [number, number][]; anguloNuevo: number } {
    const puntos: [number, number][] = [];
    let angulo = anguloIn;
    const [cx, cy] = centro;

    // ── Vertical izquierda ─────────────────────────────────────────────
    if (cx > pagina.xmin && cx < vp.xmin) {
      if (cy >= vp.ymin && cy <= vp.ymax) {
        angulo += Math.PI / 2;
        puntos.push([vp.xmin, cy]);
      } else if (cy > pagina.ymin && cy < vp.ymin) {
        angulo += Math.PI;
      }
    }
    // ── Vertical centrada con VP ──────────────────────────────────────
    if (cx >= vp.xmin && cx <= vp.xmax) {
      if (cy > pagina.ymin && cy <= vp.ymin) {
        // Magik literal: 1800.degrees_to_radians (10π); modulamos a 2π.
        angulo += (1800 * Math.PI / 180) % (2 * Math.PI);
        puntos.push([cx, vp.ymin]);
      } else if (cy >= vp.ymax && cy < pagina.ymax) {
        puntos.push([cx, vp.ymax]);
      }
    }
    // ── Vertical derecha ──────────────────────────────────────────────
    if (cx >= vp.xmin && cx < pagina.xmax) {
      if (cy >= vp.ymin && cy <= vp.ymax) {
        angulo -= Math.PI / 2;
        puntos.push([vp.xmax, cy]);
      } else if (cy > pagina.ymin && cy < vp.ymin) {
        angulo += Math.PI;
      }
    }
    return { puntos, anguloNuevo: angulo };
  }

  // ─── nombre_estilos() ──────────────────────────────────────────────────
  // Magik: lista de [nombre_interno, nombre_externo] desde ESTILOS.
  static nombreEstilos(): Array<[string, string]> {
    return Object.keys(StyleElementMixin.ESTILOS).map(n => [n, n]);
  }

  // ─── agrega_linea(coords, page, texto?) ────────────────────────────────
  // Devuelve {polyline, textBox} — la pagína Magik los agrega al layout.
  static agregaLinea(coords: [number, number][], texto: string | null) {
    const line = turf.lineString(coords);
    const len  = turf.length(line, { units: 'meters' });
    const midRaw = turf.along(line, len / 2, { units: 'meters' });
    const midPt: [number, number] = midRaw.geometry.coordinates as [number, number];
    // Ángulo en el punto medio: bearing entre vértices vecinos al midPt.
    const first = coords[0];
    const second = coords[1] ?? coords[0];
    const angDeg = turf.bearing(turf.point(first), turf.point(second));
    const angRad = (angDeg * Math.PI) / 180;

    // Magik: LoCO=60, LoAngulo=atan(LoCO/LoCA).deg, obten_pto_separado(...).
    const ca = len / 2;
    const co = 60;
    const alpha = (Math.atan(co / Math.max(1e-6, ca)) * 180) / Math.PI;
    const ptoTexto = StyleElementMixin.obtenPtoSeparado(first, midPt, ca, alpha);

    return {
      polyline: line,
      texto   : texto ?? '',
      textPos : ptoTexto,
      angulo  : angRad,
      midPt,
    };
  }

  // ─── obten_pto_intersect(p1, p2, p3) ───────────────────────────────────
  // Intersección de la recta L1(p1,p2) y la perpendicular por p3.
  static obtenPtoIntersect(
    p1: [number, number], p2: [number, number], p3: [number, number],
  ): [number, number] {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    if (dx === 0) return [p1[0], p3[1]];           // recta vertical → x fijo.
    const m = dy / dx;
    if (m === 0) return [p3[0], p1[1]];            // recta horizontal → y fijo.
    const mInv = 1 / m;
    const x = (m * (m * p1[0] + mInv * p3[0] - p1[1] + p3[1])) / (m * m + 1);
    const y = mInv * (p3[0] - x) + p3[1];
    return [x, y];
  }

  // ─── obten_pto_separado(p1, p2, mag, alphaDeg) ────────────────────────
  // Punto a magnitud mag desde p1, en dirección θ(p1→p2) + alpha.
  static obtenPtoSeparado(
    p1: [number, number], p2: [number, number], mag: number, alphaDeg: number,
  ): [number, number] {
    const alpha = (alphaDeg * Math.PI) / 180;
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    let theta = Math.atan(dy / (dx === 0 ? 1e-12 : dx));
    if (p2[0] < p1[0]) theta += Math.PI;
    return [p1[0] + mag * Math.cos(theta + alpha), p1[1] + mag * Math.sin(theta + alpha)];
  }

  // ─── coordDeObj(obj) ───────────────────────────────────────────────────
  // Magik: si :point → coord directa; si :chain → midpoint.
  private static coordDeObj(obj: ObjGis): [number, number] {
    if (obj.geomType === 'point') return obj.coords[0];
    const line = turf.lineString(obj.coords);
    const len  = turf.length(line, { units: 'meters' });
    const mid  = turf.along(line, len / 2, { units: 'meters' });
    return mid.geometry.coordinates as [number, number];
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers geométricos
// ───────────────────────────────────────────────────────────────────────────
function boundsOfCoords(coords: [number, number][]): Bounds {
  const xs = coords.map(c => c[0]);
  const ys = coords.map(c => c[1]);
  return { xmin: Math.min(...xs), ymin: Math.min(...ys), xmax: Math.max(...xs), ymax: Math.max(...ys) };
}
function centeredBounds(cx: number, cy: number, r: number): Bounds {
  return { xmin: cx - r, ymin: cy - r, xmax: cx + r, ymax: cy + r };
}
function unionBounds(a: Bounds, b: Bounds): Bounds {
  return {
    xmin: Math.min(a.xmin, b.xmin), ymin: Math.min(a.ymin, b.ymin),
    xmax: Math.max(a.xmax, b.xmax), ymax: Math.max(a.ymax, b.ymax),
  };
}
function rotate2D(x: number, y: number, theta: number): [number, number] {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [x * c - y * s, x * s + y * c];
}
function rotatedBounds(b: Bounds, theta: number): Bounds {
  // Magik: transform.convert_all(data_bounds.outline).bounds
  const corners: [number, number][] = [
    [b.xmin, b.ymin], [b.xmax, b.ymin], [b.xmax, b.ymax], [b.xmin, b.ymax],
  ];
  return boundsOfCoords(corners.map(c => rotate2D(c[0], c[1], theta)));
}

// ───────────────────────────────────────────────────────────────────────────
// Catálogo de estilos demo (poblado en init — equivalente a ESTILOS Magik)
// ───────────────────────────────────────────────────────────────────────────
StyleElementMixin.ESTILOS = {
  TRIANGULO: [
    { kind: 'area', fillStyle: '#ffd54f', lineStyle: '#5d4037',
      coords: [[-50, -50], [50, -50], [0, 50], [-50, -50]] },
    { kind: 'text', textStyle: 'plain', x: 0, y: 0, texto: 'T' },
  ],
  CIRCULO_PUNTO: [
    { kind: 'circle', lineStyle: '#1976d2', cx: 0, cy: 0, radius: 60 },
    { kind: 'text',   textStyle: 'plain',   x: 0, y: 0, texto: '●' },
  ],
  CUADRADO_ROJO: [
    { kind: 'area', fillStyle: '#ef9a9a', lineStyle: '#b71c1c',
      coords: [[-40, -40], [40, -40], [40, 40], [-40, 40], [-40, -40]] },
    { kind: 'text', textStyle: 'plain', x: 0, y: 0, texto: 'CD' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// UI React — render OpenLayers v10
// ───────────────────────────────────────────────────────────────────────────
export function StyleElementMixinUI() {
  const [estiloKey, setEstiloKey]   = useState<keyof typeof StyleElementMixin.ESTILOS>('TRIANGULO');
  const [anguloDeg, setAnguloDeg]   = useState(0);
  const [conLinea,  setConLinea]    = useState(true);
  const [conPunta,  setConPunta]    = useState(true);
  const [usaVp,     setUsaVp]       = useState(true);

  const mapRef       = useRef<HTMLDivElement>(null);
  const olMapRef     = useRef<Map | null>(null);
  const segSrcRef    = useRef<VectorSource | null>(null);
  const polySrcRef   = useRef<VectorSource | null>(null);
  const ptSrcRef     = useRef<VectorSource | null>(null);
  const txtSrcRef    = useRef<VectorSource | null>(null);
  const refSrcRef    = useRef<VectorSource | null>(null);

  // Composición Magik — pipeline drawStyle.
  const primitives = useMemo<DrawnPrimitive[]>(() => {
    const mixin = new StyleElementMixin();
    mixin.bounds = { xmin: 200, ymin: 200, xmax: 600, ymax: 600 };
    const estilos = StyleElementMixin.ESTILOS[estiloKey];
    const obj: ObjGis = { geomType: 'point', coords: [[1000, 1000]] };
    const vp: Bounds = { xmin: 700, ymin: 100, xmax: 1500, ymax: 1500 };
    const pagina: Bounds = { xmin: 0, ymin: 0, xmax: 2000, ymax: 2000 };
    return mixin.drawStyle({
      estilos,
      angulo  : (anguloDeg * Math.PI) / 180,
      obj,
      viewport: vp,
      paginaBb: pagina,
      conLinea, conPunta, usaVp,
    });
  }, [estiloKey, anguloDeg, conLinea, conPunta, usaVp]);

  // Init OL.
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;
    const projection = new Projection({ code: 'style-paper', units: 'pixels', extent: [-200, -200, 2200, 2200] });

    const refSrc  = new VectorSource();
    const polySrc = new VectorSource();
    const segSrc  = new VectorSource();
    const ptSrc   = new VectorSource();
    const txtSrc  = new VectorSource();

    const layerRef = new VectorLayer({
      source: refSrc,
      style : new Style({
        stroke: new Stroke({ color: '#999', width: 1, lineDash: [4, 4] }),
        fill  : new Fill({ color: 'rgba(200,200,200,0.08)' }),
      }),
    });
    const layerPoly = new VectorLayer({
      source: polySrc,
      style : (f) => new Style({
        stroke: new Stroke({ color: (f.get('color') as string) ?? '#000', width: 2 }),
        fill  : new Fill({ color: (f.get('fill') as string) ?? 'transparent' }),
      }),
    });
    const layerSeg = new VectorLayer({
      source: segSrc,
      style : new Style({ stroke: new Stroke({ color: '#000', width: 1 }) }),
    });
    const layerPt = new VectorLayer({
      source: ptSrc,
      style : (f) => new Style({
        image: new CircleStyle({
          radius: (f.get('radius') as number) ?? 6,
          stroke: new Stroke({ color: (f.get('color') as string) ?? '#000', width: 2 }),
          fill  : new Fill({ color: 'rgba(255,255,255,0.4)' }),
        }),
      }),
    });
    const layerTxt = new VectorLayer({
      source: txtSrc,
      style : (f, res) => new Style({
        text: new Text({
          text     : f.get('texto') as string,
          font     : `${Math.max(12, 80 / res)}px sans-serif`,
          rotation : f.get('rotation') as number,
          fill     : new Fill({ color: '#000' }),
          textAlign: 'center',
          textBaseline: 'middle',
        }),
      }),
    });

    olMapRef.current = new Map({
      target  : mapRef.current,
      layers  : [layerRef, layerPoly, layerSeg, layerPt, layerTxt],
      view    : new View({ projection, center: [1000, 1000], resolution: 4 }),
      controls: [],
    });

    refSrcRef.current  = refSrc;
    polySrcRef.current = polySrc;
    segSrcRef.current  = segSrc;
    ptSrcRef.current   = ptSrc;
    txtSrcRef.current  = txtSrc;

    // Marco de referencia: self_bounds + viewport + objetivo.
    refSrc.addFeature(new Feature({
      geometry: new OLPolygon([[[200, 200], [600, 200], [600, 600], [200, 600], [200, 200]]]),
    }));
    refSrc.addFeature(new Feature({
      geometry: new OLPolygon([[[700, 100], [1500, 100], [1500, 1500], [700, 1500], [700, 100]]]),
    }));
    refSrc.addFeature(new Feature({ geometry: new OLPoint([1000, 1000]) }));
  }, []);

  // Repobla primitives.
  useEffect(() => {
    const polySrc = polySrcRef.current;
    const segSrc  = segSrcRef.current;
    const ptSrc   = ptSrcRef.current;
    const txtSrc  = txtSrcRef.current;
    if (!polySrc || !segSrc || !ptSrc || !txtSrc) return;
    polySrc.clear(); segSrc.clear(); ptSrc.clear(); txtSrc.clear();

    for (const p of primitives) {
      if (p.type === 'polyline') {
        segSrc.addFeature(new Feature({ geometry: new OLLineString(p.coords) }));
      } else if (p.type === 'polygon') {
        const f = new Feature({ geometry: new OLPolygon([p.coords]) });
        f.set('color', p.color); f.set('fill', p.fill ?? 'transparent');
        polySrc.addFeature(f);
      } else if (p.type === 'circle') {
        const f = new Feature({ geometry: new OLPoint([p.cx!, p.cy!]) });
        f.set('color', p.color); f.set('radius', p.radius);
        ptSrc.addFeature(f);
      } else if (p.type === 'text') {
        const f = new Feature({ geometry: new OLPoint(p.coords[0]) });
        f.set('texto', p.texto); f.set('rotation', p.rotation ?? 0);
        txtSrc.addFeature(f);
      }
    }
  }, [primitives]);

  return (
    <div>
      <p style={uiStyles.meta}>
        Mixin Magik que dibuja un estilo (area/circle/text) rotado + escalado
        al bbox del elemento, con línea opcional a un objeto GIS y doblez
        alrededor del viewport. Marco gris = self_bounds + viewport + objeto.
      </p>
      <div style={uiStyles.controls}>
        <label>
          Estilo:&nbsp;
          <select value={estiloKey} onChange={e => setEstiloKey(e.target.value)} style={uiStyles.input}>
            {Object.keys(StyleElementMixin.ESTILOS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <label>
          Ángulo:&nbsp;
          <input type="range" min={0} max={360} value={anguloDeg}
                 onChange={e => setAnguloDeg(+e.target.value)} />
          &nbsp;{anguloDeg}°
        </label>
        <label><input type="checkbox" checked={conLinea} onChange={e => setConLinea(e.target.checked)} />&nbsp;línea</label>
        <label><input type="checkbox" checked={conPunta} onChange={e => setConPunta(e.target.checked)} />&nbsp;punta</label>
        <label><input type="checkbox" checked={usaVp}    onChange={e => setUsaVp(e.target.checked)} />&nbsp;usar viewport</label>
      </div>
      <div style={uiStyles.info}>
        <span>primitives: {primitives.length}</span>
        <span>estilos cat: {Object.keys(StyleElementMixin.ESTILOS).length}</span>
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
  map     : { width: '100%', height: 480, border: '1px solid #ccd', background: '#fafafa' },
};

export default StyleElementMixin;
