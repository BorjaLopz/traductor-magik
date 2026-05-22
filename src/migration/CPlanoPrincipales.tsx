/**
 * CPlanoPrincipales.tsx
 * Migración de c_plano_principales.magik (Sigma Tao / GE / A. Enriquez 2005)
 *
 * Jerarquía Magik: c_plano_principales extends :layout_element + :viewport_layout_mixin
 * Propósito: genera el plano completo de "Red Principal" — hoja 24"×36"
 *   (9144×6096), marco de 6×3 módulos carta con marcas de doblez,
 *   viewport principal mapeado a la vista activa GIS, título
 *   "PRINCIPALES" y (opcional) sello + pep_dcs.
 *
 * Constantes Magik:
 *   Carta_X = 2160    (ancho módulo carta)
 *   Carta_Y = 2790    (alto módulo carta)
 *   origen  = 200     (offset esquina inferior-izq)
 *   Separacion = 50   (sangría interior del marco)
 *
 * Tipos de marco — set_marco(:T0..:T3):
 *   T0: 4×2 módulos · T1: 4×3 · T2: 5×3 · T3: 6×3 (default usado por genera_marco).
 *
 * Mapeo Magik → TypeScript:
 *   - bounding_box.new + .sectors          → 4 segmentos del rectángulo.
 *   - polyline_layout.new + sectors<<...   → array de LineString features.
 *   - transform.new.scale(1.009345)        → matriz escalado uniforme.
 *   - smallworld_product.pni_application() → mock GIS service.
 *   - LoView_map.map_viewport_on_map_view  → ajuste extent del View OL.
 *   - colour.new_from_hex("3025B8")        → CSS hex.
 *   - textbox_layout.new()                 → TextoLayout interno.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as turf from '@turf/turf';

import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { LineString as OLLineString, Point as OLPoint, Polygon as OLPolygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style, Fill, Text } from 'ol/style';
import { Projection } from 'ol/proj';
import 'ol/ol.css';

// ───────────────────────────────────────────────────────────────────────────
// TIPOS
// ───────────────────────────────────────────────────────────────────────────

export interface Bounds { xmin: number; ymin: number; xmax: number; ymax: number; }

/** Tipos de marco Magik — set_marco(:T0..:T3). */
export type MarcoTipo = 'T0' | 'T1' | 'T2' | 'T3';

/** textbox_layout.new() — datos puros. */
export interface TextoLayout {
  texto    : string;
  bounds   : Bounds;
  color    : string;
  fontSize : number;
}

/** viewport_layout.new_with(:bounds, ...) */
export interface ViewportLayout {
  bounds      : Bounds;
  fillStyle   : string | null;
  outlineStyle: string | null;
  /** Extent del CMV (current_map_view) al que se mapea — equivalente a
   *  LoView_map.map_viewport_on_map_view(vp, cmv, extent). */
  mapExtent   : Bounds;
}

/** Resultado de genera_plano — todo el layout listo para renderizar. */
export interface PlanoRender {
  paperSize  : { width: number; height: number };
  marco      : Bounds;                 // bbox del marco T3 sin sangría
  marcoSegs  : [number, number][][];   // perimetro + marcas de doblez (transformados)
  viewport   : ViewportLayout;
  titulo     : TextoLayout;
  sello?     : SelloRender | null;
}

/** Sello opcional — c_pep_dcs + c_sello_estandar. */
export interface SelloRender {
  pepDcs       : Bounds;
  pepNumeroHoja: number;
  pepTotalHoja : number;
  selloEstandar: { titulo: string; bounds: Bounds };
}

// ───────────────────────────────────────────────────────────────────────────
// Constantes Magik (define_shared_constant)
// ───────────────────────────────────────────────────────────────────────────
const CARTA_X    = 2160;
const CARTA_Y    = 2790;
const ORIGEN     = 200;
const SEPARACION = 50;

// ───────────────────────────────────────────────────────────────────────────
// CLASE PRINCIPAL — CPlanoPrincipales
// def_slotted_exemplar(:c_plano_principales, {...}, :layout_element, :viewport_layout_mixin)
// ───────────────────────────────────────────────────────────────────────────
export class CPlanoPrincipales {
  // Slots Magik
  vpNombre: string | null     = null;
  marco   : Bounds | null     = null;

  // ─── set_marco(MT: :T0|:T1|:T2|:T3) ────────────────────────────────────
  // Devuelve el bbox del marco según múltiplos de Carta_X × Carta_Y.
  setMarco(tipo: MarcoTipo): Bounds {
    const conf: Record<MarcoTipo, [number, number]> = {
      T0: [4, 2],
      T1: [4, 3],
      T2: [5, 3],
      T3: [6, 3],
    };
    const [mx, my] = conf[tipo];
    return {
      xmin: ORIGEN,
      ymin: ORIGEN,
      xmax: ORIGEN + CARTA_X * mx,
      ymax: ORIGEN + CARTA_Y * my,
    };
  }

  // ─── genera_marco() ────────────────────────────────────────────────────
  // Construye el polyline_layout del marco:
  //   1) Rectángulo interior (con sangría SEPARACION).
  //   2) Marcas de doblez en X cada Carta_X (arriba + abajo).
  //   3) Marcas de doblez en Y cada Carta_Y (izq + der).
  //   4) 4 esquinas en forma de L.
  //   5) Escala uniforme 1.009345 al conjunto (transform Magik).
  generaMarco(tipo: MarcoTipo = 'T3'): { marco: Bounds; segs: [number, number][][] } {
    const marco = this.setMarco(tipo);
    this.marco  = marco;
    const segs: [number, number][][] = [];

    // (1) Rectángulo interior — 4 lados.
    const ix1 = marco.xmin + SEPARACION, iy1 = marco.ymin + SEPARACION;
    const ix2 = marco.xmax - SEPARACION, iy2 = marco.ymax - SEPARACION;
    segs.push(
      [[ix1, iy1], [ix2, iy1]], // inf
      [[ix2, iy1], [ix2, iy2]], // der
      [[ix2, iy2], [ix1, iy2]], // sup
      [[ix1, iy2], [ix1, iy1]], // izq
    );

    // (2) Marcas eje X — range(origen+Carta_X, marco.xmax-10, Carta_X).
    for (let mark = ORIGEN + CARTA_X; mark < marco.xmax - 10; mark += CARTA_X) {
      segs.push([[mark, marco.ymax - SEPARACION], [mark, marco.ymax - 2 * SEPARACION]]);
      segs.push([[mark, marco.ymin + SEPARACION], [mark, marco.ymin + 2 * SEPARACION]]);
    }

    // (3) Marcas eje Y — range(origen+Carta_Y, marco.ymax-10, Carta_Y).
    for (let mark = ORIGEN + CARTA_Y; mark < marco.ymax - 10; mark += CARTA_Y) {
      segs.push([[marco.xmin + SEPARACION,     mark], [marco.xmin + 2 * SEPARACION, mark]]);
      segs.push([[marco.xmax - SEPARACION,     mark], [marco.xmax - 2 * SEPARACION, mark]]);
    }

    // (4) 4 esquinas en L.
    segs.push(esquinaL(marco.xmin + SEPARACION, marco.ymin,             marco.xmin,             marco.ymin,             marco.xmin,             marco.ymin + SEPARACION));
    segs.push(esquinaL(marco.xmin + SEPARACION, marco.ymax,             marco.xmin,             marco.ymax,             marco.xmin,             marco.ymax - SEPARACION));
    segs.push(esquinaL(marco.xmax - SEPARACION, marco.ymax,             marco.xmax,             marco.ymax,             marco.xmax,             marco.ymax - SEPARACION));
    segs.push(esquinaL(marco.xmax - SEPARACION, marco.ymin,             marco.xmax,             marco.ymin,             marco.xmax,             marco.ymin + SEPARACION));

    // (5) Escala uniforme 1.009345 — replica `transform.new.scale(1.009345)`.
    const k = 1.009345;
    const scaled = segs.map(seg => seg.map(([x, y]) => [x * k, y * k] as [number, number]));
    return { marco, segs: scaled };
  }

  // ─── agrega_viewport(LoPagina) ─────────────────────────────────────────
  // Crea el viewport principal y lo mapea al CMV (current_map_view).
  // Magik: bbox fijo (200,200,11000,8900) — área de mapeo CMV size 1.2M×1M.
  agregaViewport(): ViewportLayout {
    return {
      bounds      : { xmin: 200, ymin: 200, xmax: 11000, ymax: 8900 },
      fillStyle   : null,
      outlineStyle: null,
      mapExtent   : { xmin: 0, ymin: 0, xmax: 1_200_000, ymax: 1_000_000 },
    };
  }

  // ─── configura_plano(LoPagina, LoVport) ────────────────────────────────
  // Une marco + título "PRINCIPALES" en hex #3025B8, fontSize 25.
  // Magik bbox texto: (9000, 200, 11000, 600).
  configuraPlano(): { titulo: TextoLayout } {
    return {
      titulo: {
        texto   : 'PRINCIPALES',
        bounds  : { xmin: 9000, ymin: 200, xmax: 11000, ymax: 600 },
        color   : '#3025B8',
        fontSize: 25,
      },
    };
  }

  // ─── sello(LoPagina) ───────────────────────────────────────────────────
  // c_pep_dcs.new_with(:bounds, (150,320,1030,1230)) + numero_hoja(3) + total_hoja(8)
  // c_sello_estandar.crea_sello("DIV DTOS", (150,150,1900,300))
  generaSello(): SelloRender {
    return {
      pepDcs       : { xmin: 150, ymin: 320, xmax: 1030, ymax: 1230 },
      pepNumeroHoja: 3,
      pepTotalHoja : 8,
      selloEstandar: { titulo: 'DIV DTOS', bounds: { xmin: 150, ymin: 150, xmax: 1900, ymax: 300 } },
    };
  }

  // ─── genera_plano() ────────────────────────────────────────────────────
  // Orquestador principal — replica el Magik:
  //   LoHoja = abrir_hoja(); set_paper_size(9144, 6096);
  //   LoVport = agrega_viewport(LoHoja); configura_plano(LoHoja, LoVport).
  generaPlano(opts: { tipoMarco?: MarcoTipo; conSello?: boolean } = {}): PlanoRender {
    const { tipoMarco = 'T3', conSello = false } = opts;
    const { marco, segs } = this.generaMarco(tipoMarco);
    const viewport = this.agregaViewport();
    const { titulo } = this.configuraPlano();
    return {
      paperSize: { width: 9144, height: 6096 },
      marco,
      marcoSegs: segs,
      viewport,
      titulo,
      sello    : conSello ? this.generaSello() : null,
    };
  }

  // ─── Helper Turf.js ────────────────────────────────────────────────────
  /** turf.bboxPolygon del marco — útil para overlay/disjoint testing. */
  marcoGeoJSON(): GeoJSON.Feature<GeoJSON.Polygon> | null {
    if (!this.marco) return null;
    return turf.bboxPolygon([this.marco.xmin, this.marco.ymin, this.marco.xmax, this.marco.ymax]);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────
function esquinaL(
  x1: number, y1: number, x2: number, y2: number, x3: number, y3: number,
): [number, number][] {
  return [[x1, y1], [x2, y2], [x3, y3]];
}

// ───────────────────────────────────────────────────────────────────────────
// UI React — render OpenLayers v10
// ───────────────────────────────────────────────────────────────────────────
export function CPlanoPrincipalesUI() {
  const [tipoMarco, setTipoMarco] = useState<MarcoTipo>('T3');
  const [conSello,  setConSello]  = useState(false);

  const mapRef       = useRef<HTMLDivElement>(null);
  const olMapRef     = useRef<Map | null>(null);
  const paperSrcRef  = useRef<VectorSource | null>(null);
  const marcoSrcRef  = useRef<VectorSource | null>(null);
  const vpSrcRef     = useRef<VectorSource | null>(null);
  const selloSrcRef  = useRef<VectorSource | null>(null);
  const titleSrcRef  = useRef<VectorSource | null>(null);

  // Pipeline Magik — recálculo en cada cambio.
  const render = useMemo<PlanoRender>(() => {
    const plano = new CPlanoPrincipales();
    return plano.generaPlano({ tipoMarco, conSello });
  }, [tipoMarco, conSello]);

  // Init OL — proyección plana, unidades = mm/u del plano.
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;
    const projection = new Projection({
      code  : 'plano-principales-paper',
      units : 'pixels',
      extent: [-200, -200, 25000, 15000],
    });

    const paperSrc = new VectorSource();
    const marcoSrc = new VectorSource();
    const vpSrc    = new VectorSource();
    const selloSrc = new VectorSource();
    const titleSrc = new VectorSource();

    const layerPaper = new VectorLayer({
      source: paperSrc,
      style : new Style({
        stroke: new Stroke({ color: '#aaa', width: 1 }),
        fill  : new Fill({ color: 'rgba(255,255,255,0.95)' }),
      }),
    });
    const layerMarco = new VectorLayer({
      source: marcoSrc,
      style : new Style({ stroke: new Stroke({ color: '#000', width: 2 }) }),
    });
    const layerVp = new VectorLayer({
      source: vpSrc,
      style : new Style({
        stroke: new Stroke({ color: '#1976d2', width: 1.5, lineDash: [6, 4] }),
        fill  : new Fill({ color: 'rgba(25,118,210,0.05)' }),
      }),
    });
    const layerSello = new VectorLayer({
      source: selloSrc,
      style : new Style({
        stroke: new Stroke({ color: '#388e3c', width: 1.5 }),
        fill  : new Fill({ color: 'rgba(56,142,60,0.06)' }),
      }),
    });
    const layerTitle = new VectorLayer({
      source: titleSrc,
      style : (f, res) => new Style({
        text: new Text({
          text        : f.get('texto') as string,
          font        : `${Math.max(12, (f.get('fontSize') as number) * 20 / res)}px sans-serif`,
          fill        : new Fill({ color: f.get('color') as string }),
          textAlign   : 'center',
          textBaseline: 'middle',
        }),
      }),
    });

    olMapRef.current = new Map({
      target  : mapRef.current,
      layers  : [layerPaper, layerVp, layerSello, layerMarco, layerTitle],
      view    : new View({ projection, center: [6500, 4000], resolution: 12 }),
      controls: [],
    });

    paperSrcRef.current = paperSrc;
    marcoSrcRef.current = marcoSrc;
    vpSrcRef.current    = vpSrc;
    selloSrcRef.current = selloSrc;
    titleSrcRef.current = titleSrc;
  }, []);

  // Repobla capas.
  useEffect(() => {
    const paperSrc = paperSrcRef.current;
    const marcoSrc = marcoSrcRef.current;
    const vpSrc    = vpSrcRef.current;
    const selloSrc = selloSrcRef.current;
    const titleSrc = titleSrcRef.current;
    const map      = olMapRef.current;
    if (!paperSrc || !marcoSrc || !vpSrc || !selloSrc || !titleSrc || !map) return;

    paperSrc.clear(); marcoSrc.clear(); vpSrc.clear(); selloSrc.clear(); titleSrc.clear();

    // Hoja 24"×36" (paper_size).
    const w = render.paperSize.width;
    const h = render.paperSize.height;
    paperSrc.addFeature(new Feature({
      geometry: new OLPolygon([[[0, 0], [w, 0], [w, h], [0, h], [0, 0]]]),
    }));

    // Marco + marcas de doblez.
    for (const seg of render.marcoSegs) {
      marcoSrc.addFeature(new Feature({ geometry: new OLLineString(seg) }));
    }

    // Viewport principal.
    const v = render.viewport.bounds;
    vpSrc.addFeature(new Feature({
      geometry: new OLPolygon([[[v.xmin, v.ymin], [v.xmax, v.ymin], [v.xmax, v.ymax], [v.xmin, v.ymax], [v.xmin, v.ymin]]]),
    }));

    // Sello opcional.
    if (render.sello) {
      for (const bb of [render.sello.pepDcs, render.sello.selloEstandar.bounds]) {
        selloSrc.addFeature(new Feature({
          geometry: new OLPolygon([[[bb.xmin, bb.ymin], [bb.xmax, bb.ymin], [bb.xmax, bb.ymax], [bb.xmin, bb.ymax], [bb.xmin, bb.ymin]]]),
        }));
      }
    }

    // Título "PRINCIPALES".
    const tb = render.titulo.bounds;
    const ft = new Feature({
      geometry: new OLPoint([(tb.xmin + tb.xmax) / 2, (tb.ymin + tb.ymax) / 2]),
    });
    ft.set('texto',    render.titulo.texto);
    ft.set('color',    render.titulo.color);
    ft.set('fontSize', render.titulo.fontSize);
    titleSrc.addFeature(ft);

    // Ajuste de la vista.
    map.getView().fit([-200, -200, w + 200, h + 200], { padding: [20, 20, 20, 20] });
  }, [render]);

  return (
    <div>
      <p style={uiStyles.meta}>
        Plano de Red Principal — hoja 24"×36" (9144×6096). Marco T3 = 6×3 módulos
        carta (2160×2790) con marcas de doblez cada Carta_X/Carta_Y y 4 esquinas
        en L. Escala uniforme 1.009345 aplicada al conjunto. Viewport (200,200)→
        (11000,8900) mapeado a CMV (0,0)→(1.2M,1M). Título azul oscuro
        "PRINCIPALES" en (9000,200)→(11000,600).
      </p>
      <div style={uiStyles.controls}>
        <label>
          Marco:&nbsp;
          <select value={tipoMarco} onChange={e => setTipoMarco(e.target.value as MarcoTipo)} style={uiStyles.input}>
            {(['T0', 'T1', 'T2', 'T3'] as MarcoTipo[]).map(t => (
              <option key={t} value={t}>{t} ({{T0: '4×2', T1: '4×3', T2: '5×3', T3: '6×3'}[t]})</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={conSello} onChange={e => setConSello(e.target.checked)} />
          &nbsp;sello (pep_dcs + estándar)
        </label>
      </div>

      <div style={uiStyles.info}>
        <span>paper: {render.paperSize.width} × {render.paperSize.height}</span>
        <span>marco: ({render.marco.xmin}, {render.marco.ymin}) → ({render.marco.xmax}, {render.marco.ymax})</span>
        <span>segs: {render.marcoSegs.length}</span>
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
  map     : { width: '100%', height: 500, border: '1px solid #ccd', background: '#fafafa' },
};

export default CPlanoPrincipales;
