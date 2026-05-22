/**
 * CSembradoLayout.tsx
 * Migración de c_sembrado_layout.magik (Sigma Tao / hramirea Feb-2004)
 *
 * Jerarquía Magik: c_sembrado_layout extends :layout_element
 * Propósito: plantilla de plano de detalle "sembrado".
 *   - Se ancla al marco_layout existente (busca_elemento → bounds).
 *   - Pinta 4 textos verticales (90°): 2 referencias al plano (izq/der),
 *     2 líneas de copyright TELMEX al borde derecho.
 *   - Dibuja la zona de "detalles de escala" (1 cuadro pequeño).
 *   - Dibuja la rejilla "Detalles Fibra Óptica" y "Detalles Obra Civil"
 *     (6 cuadros por bloque a base de coordenadas LoP1..LoP16).
 *   - Crea un viewport_layout "Larguillo" con ace_name="CENTRALES",
 *     view_scale 50000, view_angle = bearing del primer→último coord del cable.
 *
 * Mapeo Magik → TS:
 *   - sector.new_with(p1,p2) + draw_on(window, :black) → ol/Feature(LineString) + Stroke.
 *   - bounding_box.new(x1,y1,x2,y2)                    → Bounds {xmin,ymin,xmax,ymax}.
 *   - draw_vtext_transform(.., 90.degrees_to_radians)   → SVG <text rotate(-90)> overlay.
 *   - viewport_layout.new_with(:bounds,...)             → ViewportConfig (datos puros).
 *   - LoCable.last_coord.angle_to(first_coord)          → turf.bearing.
 *   - c_larguillos_layout.busca_elemento(page,"marco_layout") → busca en lista de
 *     elementos previos por nombre; devuelve {found, element}.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature as GeoJSONFeature, LineString } from 'geojson';

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

/** bounding_box.new(xmin,ymin,xmax,ymax) */
export interface Bounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/** Cuadro dibujado por traza_cuadro(window, bounds, color) */
export interface Cuadro {
  bounds: Bounds;
  color : string; // ':black' Magik → hex CSS
}

/** Texto vertical (90°) dibujado por datos_del_plano */
export interface TextoVert {
  x        : number;
  y        : number;
  texto    : string;
  fontSize : number;
  rotation : number; // rad (siempre π/2 en el original)
}

/** Resultado de la composición — todos los primitives a renderizar */
export interface SembradoRender {
  bounds  : Bounds;
  cuadros : Cuadro[];
  textos  : TextoVert[];
  viewport: ViewportConfig | null;
}

/** viewport_layout.new_with(:bounds, …) — equivalente Magik */
export interface ViewportConfig {
  bounds    : Bounds;
  trail     : boolean;
  selection : boolean;
  fillColour: string | null;
  colour    : string | null;
  name      : string;
  viewAngle : number; // grados
  viewScale : number;
  aceName   : string;
}

/** Resultado de c_larguillos_layout.busca_elemento(page, name) */
export interface BuscaElementoResult {
  found  : boolean;
  element: { name: string; bounds: Bounds } | null;
}

/** Cable enlace — mock c_larguillos_layout.genera_canalizacion_unica() */
export interface Cable {
  coords: [number, number][];
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers — equivalentes Magik
// ───────────────────────────────────────────────────────────────────────────

/** turf.bearing entre dos coords (grados). Magik: angle_to + radians_to_degrees. */
function bearingDeg(a: [number, number], b: [number, number]): number {
  const pa = turf.point(a);
  const pb = turf.point(b);
  return turf.bearing(pa, pb);
}

/** first_coord / last_coord del cable (Magik: LoCable.first_coord/last_coord). */
function firstCoord(cable: Cable): [number, number] { return cable.coords[0]; }
function lastCoord (cable: Cable): [number, number] { return cable.coords[cable.coords.length - 1]; }

// ───────────────────────────────────────────────────────────────────────────
// CLASE PRINCIPAL — CSembradoLayout
// def_slotted_exemplar(:c_sembrado_layout, {}, :layout_element)
// ───────────────────────────────────────────────────────────────────────────
export class CSembradoLayout {
  bounds: Bounds = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 };

  // ─── initialise_for_page(a_layout_page) ────────────────────────────────
  // Busca el marco_layout previo y hereda sus bounds.
  initialiseForPage(buscaMarco: BuscaElementoResult): void {
    if (buscaMarco.found && buscaMarco.element) {
      this.bounds = { ...buscaMarco.element.bounds };
    }
  }

  // ─── draw_content_on(window) — orquestador principal ───────────────────
  // Replica el _if LbBandera _then ... del método Magik.
  drawContentOn(buscaMarco: BuscaElementoResult, cable: Cable | null): SembradoRender {
    const out: SembradoRender = {
      bounds  : this.bounds,
      cuadros : [],
      textos  : [],
      viewport: null,
    };
    if (!buscaMarco.found || !buscaMarco.element) return out;

    this.bounds = { ...buscaMarco.element.bounds };
    out.bounds  = this.bounds;

    // Bloques apiniados.
    out.textos.push(...this.referenciasAlPlano());
    out.textos.push(...this.copyrightTelmex());
    out.cuadros.push(...this.detallesDeEscala());
    out.cuadros.push(...this.detallesFibraOptica());
    out.cuadros.push(...this.detallesObraCivil());
    out.viewport = this.creaViewportLarguillo(buscaMarco.element.bounds, cable);

    return out;
  }

  // ── Bloque: REFERENCIA AL PLANO (izquierda + derecha) ──────────────────
  // Magik líneas 70–86: dos VPs alargados verticalmente con texto a 9pt.
  // bounding_box Magik normaliza min/max — replicamos con normalizeBounds().
  private referenciasAlPlano(): TextoVert[] {
    const b = this.bounds;
    const texto = 'REFERENCIA AL PLANO NO. ';
    const ymin = b.ymin + 200;
    const izqBb = normalizeBounds({ xmin: b.xmin, ymin, xmax: b.xmin + 150, ymax: ymin + 2200 });
    const derBb = normalizeBounds({ xmin: b.xmax, ymin, xmax: b.xmax - 150, ymax: ymin + 2200 });
    return [
      buildVText(izqBb, texto, 9),
      buildVText(derBb, texto, 9),
    ];
  }

  // ── Bloque: COPYRIGHT TELMEX (2 líneas) ────────────────────────────────
  // Magik líneas 88–102: dos textos verticales pegados al borde derecho.
  private copyrightTelmex(): TextoVert[] {
    const b = this.bounds;
    const ymin = b.ymin + 200;
    const bb1 = normalizeBounds({ xmin: b.xmax, ymin, xmax: b.xmax - 80, ymax: ymin + 2200 });
    const bb2 = normalizeBounds({ xmin: b.xmax, ymin, xmax: b.xmax - 20, ymax: ymin + 2200 });
    return [
      buildVText(bb1, 'INFORMACION CONFIDENCIAL PROPIEDAD DE TELMEX, ', 6),
      buildVText(bb2, 'PROHIBIDA SU REPRODUCCION  PARCIAL O TOTAL.', 6),
    ];
  }

  // ── Bloque: DETALLES DE ESCALA ─────────────────────────────────────────
  // Magik líneas 104–114: un cuadro 500×250 desde (xmin+150, ymin+2200).
  private detallesDeEscala(): Cuadro[] {
    const b = this.bounds;
    const x = b.xmin + 150;
    const y = b.ymin + 1920 + 280;
    return [{ bounds: { xmin: x, ymin: y, xmax: x + 500, ymax: y + 250 }, color: BLACK }];
  }

  // ── Bloque: DETALLES FIBRA ÓPTICA ──────────────────────────────────────
  // Magik líneas 116–160: 6 cuadros construidos sobre rejilla LoP1..LoP16.
  private detallesFibraOptica(): Cuadro[] {
    const b = this.bounds;
    const x = b.xmin + 150 + 500;
    const y = b.ymin + 1920;
    const xRight = b.xmax - 150;
    // Puntos clave (LoP1..LoP15) reducidos a deltas.
    return [
      // Cuadro 1: LoP1 → LoP3  (200×250)
      { bounds: { xmin: x,         ymin: y,       xmax: x + 200,  ymax: y + 250 }, color: BLACK },
      // Cuadro 2: LoP7 → LoP8  (400×250)
      { bounds: { xmin: x + 200,   ymin: y,       xmax: x + 600,  ymax: y + 250 }, color: BLACK },
      // Cuadro 3: LoP5 → LoP13 (ancho a borde der, en y+100..y+150)
      { bounds: { xmin: x + 200,   ymin: y + 100, xmax: xRight,   ymax: y + 150 }, color: BLACK },
      // Cuadro 4: LoP6 → LoP14 (en y+50..y+100)
      { bounds: { xmin: x + 200,   ymin: y +  50, xmax: xRight,   ymax: y + 100 }, color: BLACK },
      // Cuadro 5: LoP7→LoP15 (línea base y..y, ancho hasta xRight)
      { bounds: { xmin: x + 200,   ymin: y +  50, xmax: xRight,   ymax: y +  50 }, color: BLACK },
      // Cuadro 6: LoP12 → LoP15 (en x+600 → xRight, y..y+50)
      { bounds: { xmin: x + 600,   ymin: y,       xmax: xRight,   ymax: y +  50 }, color: BLACK },
    ];
  }

  // ── Bloque: DETALLES OBRA CIVIL ────────────────────────────────────────
  // Magik líneas 162–205: rejilla equivalente desplazada 280 hacia abajo.
  private detallesObraCivil(): Cuadro[] {
    const b = this.bounds;
    const x = b.xmin + 150 + 500;
    const y = b.ymin + 1640;
    const xRight = b.xmax - 150;
    return [
      { bounds: { xmin: x,         ymin: y,       xmax: x + 200,  ymax: y + 250 }, color: BLACK },
      { bounds: { xmin: x + 200,   ymin: y,       xmax: x + 600,  ymax: y + 250 }, color: BLACK },
      // LoP4 → LoP13 (y+150..y+250 ancho a xRight)
      { bounds: { xmin: x + 200,   ymin: y + 150, xmax: xRight,   ymax: y + 250 }, color: BLACK },
      // LoP5 → LoP14 (y+100..y+150)
      { bounds: { xmin: x + 200,   ymin: y + 100, xmax: xRight,   ymax: y + 150 }, color: BLACK },
      // LoP6 → LoP15 (y+50..y+100)
      { bounds: { xmin: x + 200,   ymin: y +  50, xmax: xRight,   ymax: y + 100 }, color: BLACK },
      // LoP7 → LoP16 (y..y+50)
      { bounds: { xmin: x + 200,   ymin: y,       xmax: xRight,   ymax: y +  50 }, color: BLACK },
    ];
  }

  // ── Bloque: VIEWPORT "Larguillo" ───────────────────────────────────────
  // Magik líneas 215–243: viewport_layout.new_with(:bounds, ...) +
  // configuración (view_angle, view_scale, ace_name).
  private creaViewportLarguillo(marcoBounds: Bounds, cable: Cable | null): ViewportConfig {
    const vpBounds: Bounds = {
      xmin: marcoBounds.xmin + 150 + 550,
      ymin: marcoBounds.ymin +  30,
      xmax: marcoBounds.xmax,
      ymax: marcoBounds.ymax - 960,
    };
    // view_angle = angle_to(last→first) en grados.
    // turf.bearing(last, first) devuelve grados desde norte: lo mapeamos directo.
    let viewAngle = 0;
    if (cable && cable.coords.length >= 2) {
      viewAngle = bearingDeg(lastCoord(cable), firstCoord(cable));
    }
    return {
      bounds    : vpBounds,
      trail     : false,
      selection : false,
      fillColour: null,
      colour    : null,
      name      : 'Larguillo',
      viewAngle,
      viewScale : 50000,
      aceName   : 'CENTRALES',
    };
  }

  // ─── Helpers públicos Turf.js ──────────────────────────────────────────
  /** Cada cuadro → 4 segmentos GeoJSON (traza_cuadro Magik). */
  cuadrosToGeoJSON(cuadros: Cuadro[]): GeoJSONFeature<LineString>[] {
    return cuadros.flatMap(c => trazaCuadroSegments(c.bounds).map(seg =>
      turf.lineString(seg, { color: c.color }) as GeoJSONFeature<LineString>,
    ));
  }
}

// ───────────────────────────────────────────────────────────────────────────
// traza_cuadro(window, bounds, color) — 4 sectores del borde
// ───────────────────────────────────────────────────────────────────────────
function trazaCuadroSegments(b: Bounds): [number, number][][] {
  const p1: [number, number] = [b.xmin, b.ymin];
  const p2: [number, number] = [b.xmin, b.ymax];
  const p3: [number, number] = [b.xmax, b.ymin];
  const p4: [number, number] = [b.xmax, b.ymax];
  return [
    [p1, p2], // izq
    [p1, p3], // inf
    [p3, p4], // der
    [p2, p4], // sup
  ];
}

// ───────────────────────────────────────────────────────────────────────────
// datos_del_plano: ancla del texto = (xmin+120, ymin) con anchor :center_center
// y rotación 90° CCW. Resultado: texto centrado en mitad vertical del bbox
// con ancla horizontal a 120u del borde izq.
// OL Text rotation: clockwise positive → usamos -π/2 para leer bottom→top.
// ───────────────────────────────────────────────────────────────────────────
function buildVText(bb: Bounds, texto: string, fontSize: number): TextoVert {
  const stripWidth  = bb.xmax - bb.xmin;
  const stripHeight = bb.ymax - bb.ymin;
  // Magik anchor en xmin+120, ymin con :center_center + rot 90° equivale a
  // texto centrado verticalmente en la franja, sobre la línea x = xmin+120.
  return {
    x       : bb.xmin + Math.min(120, stripWidth / 2),
    y       : bb.ymin + stripHeight / 2,
    texto,
    fontSize,
    rotation: -Math.PI / 2,
  };
}

function normalizeBounds(b: Bounds): Bounds {
  return {
    xmin: Math.min(b.xmin, b.xmax),
    ymin: Math.min(b.ymin, b.ymax),
    xmax: Math.max(b.xmin, b.xmax),
    ymax: Math.max(b.ymin, b.ymax),
  };
}

const BLACK = '#000000';

// ───────────────────────────────────────────────────────────────────────────
// Mock c_larguillos_layout — busca_elemento + genera_canalizacion_unica
// ───────────────────────────────────────────────────────────────────────────
export const mockLarguillosLayout = {
  buscaElemento(
    elements: Array<{ name: string; bounds: Bounds }>,
    name    : string,
  ): BuscaElementoResult {
    const el = elements.find(e => e.name === name);
    return { found: !!el, element: el ?? null };
  },
  generaCanalizacionUnica(): Cable {
    // Cable de muestra — usado solo para alimentar view_angle del viewport.
    return {
      coords: [
        [0,    0],
        [1200, 300],
        [2400, 200],
        [3600, 500],
      ],
    };
  },
};

// ───────────────────────────────────────────────────────────────────────────
// UI React — render OpenLayers v10
// ───────────────────────────────────────────────────────────────────────────
export function CSembradoLayoutUI() {
  // Marco de referencia (mock — equivalente al marco_layout previo).
  const [marcoBounds, setMarcoBounds] = useState<Bounds>({ xmin: 0, ymin: 0, xmax: 12960, ymax: 8370 });
  const [withCable,   setWithCable]   = useState(true);

  const mapRef        = useRef<HTMLDivElement>(null);
  const olMapRef      = useRef<Map | null>(null);
  const segSourceRef  = useRef<VectorSource | null>(null);
  const textSourceRef = useRef<VectorSource | null>(null);
  const boxSourceRef  = useRef<VectorSource | null>(null);
  const vpSourceRef   = useRef<VectorSource | null>(null);

  // Composición Magik — recalcula cada cambio.
  const render = useMemo<SembradoRender>(() => {
    const sembrado = new CSembradoLayout();
    const busca = mockLarguillosLayout.buscaElemento(
      [{ name: 'marco_layout', bounds: marcoBounds }],
      'marco_layout',
    );
    sembrado.initialiseForPage(busca);
    const cable = withCable ? mockLarguillosLayout.generaCanalizacionUnica() : null;
    return sembrado.drawContentOn(busca, cable);
  }, [marcoBounds, withCable]);

  // Init OL — proyección plana (unidades = mm del plano).
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;
    const projection = new Projection({
      code  : 'sembrado-paper',
      units : 'pixels',
      extent: [-1000, -1000, 25000, 15000],
    });

    const boxSource  = new VectorSource();
    const segSource  = new VectorSource();
    const textSource = new VectorSource();
    const vpSource   = new VectorSource();

    const layerBox = new VectorLayer({
      source: boxSource,
      style : new Style({ stroke: new Stroke({ color: '#444', width: 2 }) }),
    });
    const layerSeg = new VectorLayer({
      source: segSource,
      style : new Style({ stroke: new Stroke({ color: BLACK, width: 1 }) }),
    });
    const layerVp = new VectorLayer({
      source: vpSource,
      style : new Style({
        stroke: new Stroke({ color: '#1976d2', width: 2, lineDash: [6, 4] }),
        fill  : new Fill({ color: 'rgba(25,118,210,0.06)' }),
      }),
    });
    // Font size Magik → CSS px. Magik usa pt sobre coords de hoja; con
    // proyección plana (mm) y resolución actual del View, escalamos por
    // resolución inversa para que el texto se vea proporcional al marco.
    const layerText = new VectorLayer({
      source: textSource,
      style : (feat, resolution) => {
        const magikSize = feat.get('fontSize') as number;
        // Magik fontSize representa altura en unidades de hoja (×~20 para legibilidad).
        const px = Math.max(10, (magikSize * 20) / resolution);
        return new Style({
          text: new Text({
            text        : feat.get('texto') as string,
            font        : `${px}px sans-serif`,
            rotation    : feat.get('rotation') as number,
            fill        : new Fill({ color: BLACK }),
            textAlign   : 'center',
            textBaseline: 'middle',
            overflow    : true,
          }),
        });
      },
    });

    olMapRef.current = new Map({
      target  : mapRef.current,
      layers  : [layerBox, layerVp, layerSeg, layerText],
      view    : new View({ projection, center: [6500, 4500], resolution: 12 }),
      controls: [],
    });

    boxSourceRef.current  = boxSource;
    segSourceRef.current  = segSource;
    textSourceRef.current = textSource;
    vpSourceRef.current   = vpSource;
  }, []);

  // Repobla todas las capas cuando cambia el render.
  useEffect(() => {
    const map     = olMapRef.current;
    const boxSrc  = boxSourceRef.current;
    const segSrc  = segSourceRef.current;
    const textSrc = textSourceRef.current;
    const vpSrc   = vpSourceRef.current;
    if (!map || !boxSrc || !segSrc || !textSrc || !vpSrc) return;

    boxSrc.clear();
    segSrc.clear();
    textSrc.clear();
    vpSrc.clear();

    const { xmin, ymin, xmax, ymax } = render.bounds;

    // Marco exterior (referencia).
    boxSrc.addFeature(new Feature({
      geometry: new OLLineString([
        [xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin],
      ]),
    }));

    // Cuadros (4 segments cada uno).
    for (const c of render.cuadros) {
      for (const seg of trazaCuadroSegments(c.bounds)) {
        segSrc.addFeature(new Feature({ geometry: new OLLineString(seg) }));
      }
    }

    // Textos verticales — Point geom para anclar Style(Text) en (x,y).
    for (const t of render.textos) {
      const f = new Feature({ geometry: new OLPoint([t.x, t.y]) });
      f.set('texto', t.texto);
      f.set('fontSize', t.fontSize);
      f.set('rotation', t.rotation);
      textSrc.addFeature(f);
    }

    // Viewport "Larguillo" como polígono punteado.
    if (render.viewport) {
      const v = render.viewport.bounds;
      vpSrc.addFeature(new Feature({
        geometry: new OLPolygon([[
          [v.xmin, v.ymin], [v.xmax, v.ymin], [v.xmax, v.ymax], [v.xmin, v.ymax], [v.xmin, v.ymin],
        ]]),
      }));
    }

    map.getView().fit(
      [xmin - 500, ymin - 500, xmax + 500, ymax + 500],
      { padding: [20, 20, 20, 20] },
    );
  }, [render]);

  return (
    <div>
      <p style={uiStyles.meta}>
        Plantilla de plano de sembrado. Se anida al <code>marco_layout</code> previo:
        hereda bounds y compone referencias verticales, copyright, rejilla escala +
        fibra óptica + obra civil, más el viewport "Larguillo" (50000:1).
      </p>
      <div style={uiStyles.controls}>
        <label>
          Marco width:&nbsp;
          <input type="number" value={marcoBounds.xmax} min={4000}
                 onChange={e => setMarcoBounds(b => ({ ...b, xmax: Math.max(4000, +e.target.value) }))}
                 style={uiStyles.input} />
        </label>
        <label>
          Marco height:&nbsp;
          <input type="number" value={marcoBounds.ymax} min={3000}
                 onChange={e => setMarcoBounds(b => ({ ...b, ymax: Math.max(3000, +e.target.value) }))}
                 style={uiStyles.input} />
        </label>
        <label>
          <input type="checkbox" checked={withCable}
                 onChange={e => setWithCable(e.target.checked)} />
          &nbsp;cable enlace (view_angle)
        </label>
      </div>

      <div style={uiStyles.info}>
        <span>cuadros: {render.cuadros.length}</span>
        <span>textos: {render.textos.length}</span>
        <span>viewport: {render.viewport ? `${Math.round(render.viewport.viewAngle)}° / 1:${render.viewport.viewScale}` : '—'}</span>
      </div>

      <div ref={mapRef} style={uiStyles.map} />
    </div>
  );
}

const uiStyles: Record<string, React.CSSProperties> = {
  meta    : { color: '#666', fontSize: 12, margin: '4px 0 12px' },
  controls: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  input   : { padding: '3px 6px', border: '1px solid #b0bec5', borderRadius: 4, fontSize: 12, width: 100 },
  info    : { display: 'flex', gap: 18, fontSize: 11, color: '#444', margin: '4px 0 10px' },
  map     : { width: '100%', height: 480, border: '1px solid #ccd', background: '#fafafa' },
};

export default CSembradoLayout;
