/**
 * Migracion de: c_celdas_grafico.magik
 * Clase Magik:  c_celdas_grafico (hereda de c_elemento_grafico)
 *
 * Slots Magik -> propiedades TS:
 *   sNombre_Grafico -> sNombreGrafico
 *   bVoltear_H      -> bVoltearH       (flip horizontal)
 *   bVoltear_V      -> bVoltearV       (flip vertical)
 *   nGrados         -> nGrados         (rotacion N grados)
 *   bBordeSup/Inf/Izq/Der -> bBorde{Sup,Inf,Izq,Der}
 *   sColorLinea     -> sColorLinea
 *
 * Intencion:
 *   La clase representa una celda de un grafico que dibuja los bordes
 *   solicitados (superior, inferior, izquierdo, derecho) sobre un area
 *   rectangular (oArea) usando un estilo de linea (line_style).
 *
 *   El metodo `Despliega()` traza hasta 4 lineas (una por cada borde
 *   activado) sobre la ventana grafica. En la version TS exponemos
 *   los segmentos en formato:
 *     - lista de {x1,y1,x2,y2} para render SVG (preview React).
 *     - Features de OpenLayers para integrarlo en un VectorSource real.
 *     - LineString GeoJSON via Turf para reutilizarlo en analitica.
 */

import React, { useEffect, useMemo, useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature as GeoJsonFeature, LineString } from 'geojson';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import OlLineString from 'ol/geom/LineString';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

// =============================================================================
// TIPOS
// =============================================================================

// Magik: `oArea` (rectangulo con Xmin/Xmax/Ymin/Ymax).
export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

// Magik: line_style.new_with_properties(:foreground_colour, ..., :width, 2)
export interface LineStyle {
  color: string;
  width: number;
}

// Banderas de bordes -> Magik: bBordeSup / bBordeInf / bBordeIzq / bBordeDer
export interface BorderFlags {
  sup: boolean;
  inf: boolean;
  izq: boolean;
  der: boolean;
}

// Propiedades para `init_with(props)`.
export interface CeldasGraficoProps {
  bBordeSup?: boolean;
  bBordeInf?: boolean;
  bBordeIzq?: boolean;
  bBordeDer?: boolean;
  sColorLinea?: string;
  sNombreGrafico?: string | null;
  bVoltearH?: boolean;
  bVoltearV?: boolean;
  nGrados?: number;
}

// Segmento de salida del despliegue (cada borde activo -> 1 segmento).
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // Origen del segmento: cual borde lo produjo (debug/preview).
  borde: 'sup' | 'inf' | 'izq' | 'der';
}

// Resultado completo de `Despliega()`.
export interface DespliegaResult {
  segments: Segment[];
  style: LineStyle;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Construye los segmentos a partir del area y de las banderas de borde.
 * Equivalente a los 4 bloques `_if _self.bBorde{Sup,Inf,Izq,Der} _is _true`
 * dentro de `Despliega()` en Magik.
 */
function buildBorderSegments(area: Bounds, borders: BorderFlags): Segment[] {
  const segs: Segment[] = [];

  // Magik: borde superior -> linea (Xmax,Ymax) -> (Xmin,Ymax)
  if (borders.sup) {
    segs.push({ x1: area.xmax, y1: area.ymax, x2: area.xmin, y2: area.ymax, borde: 'sup' });
  }
  // Magik: borde inferior -> linea (Xmin,Ymin) -> (Xmax,Ymin)
  if (borders.inf) {
    segs.push({ x1: area.xmin, y1: area.ymin, x2: area.xmax, y2: area.ymin, borde: 'inf' });
  }
  // Magik: borde izquierdo -> linea (Xmin,Ymax) -> (Xmin,Ymin)
  if (borders.izq) {
    segs.push({ x1: area.xmin, y1: area.ymax, x2: area.xmin, y2: area.ymin, borde: 'izq' });
  }
  // Magik: borde derecho -> linea (Xmax,Ymin) -> (Xmax,Ymax)
  if (borders.der) {
    segs.push({ x1: area.xmax, y1: area.ymin, x2: area.xmax, y2: area.ymax, borde: 'der' });
  }

  return segs;
}

/**
 * Convierte un segmento a Feature de OpenLayers con su estilo de stroke.
 * Equivalente a Magik: `oVentana.draw_line_transform(LoEstiloLinea, LoCoordenada)`.
 */
export function segmentToOlFeature(seg: Segment, style: LineStyle): Feature {
  const feature = new Feature({
    geometry: new OlLineString([
      [seg.x1, seg.y1],
      [seg.x2, seg.y2],
    ]),
    borde: seg.borde,
  });
  feature.setStyle(
    new Style({
      stroke: new Stroke({ color: style.color, width: style.width }),
    }),
  );
  return feature;
}

/**
 * Convierte un segmento a Feature GeoJSON via Turf (analitica espacial).
 */
export function segmentToTurfLine(seg: Segment): GeoJsonFeature<LineString> {
  return turf.lineString([
    [seg.x1, seg.y1],
    [seg.x2, seg.y2],
  ], { borde: seg.borde });
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CeldasGrafico {
  // Slots Magik
  sNombreGrafico: string | null = null;
  bVoltearH: boolean = false;
  bVoltearV: boolean = false;
  nGrados: number = 0;
  bBordeSup: boolean = false;
  bBordeInf: boolean = false;
  bBordeIzq: boolean = false;
  bBordeDer: boolean = false;
  sColorLinea: string = '#000000';

  // Heredado de c_elemento_grafico: el area sobre la que se dibuja.
  oArea: Bounds;

  constructor(area: Bounds) {
    this.oArea = area;
  }

  // Magik: c_celdas_grafico.new() -> _clone.init()
  static create(area: Bounds): CeldasGrafico {
    const instance = new CeldasGrafico(area);
    instance.init();
    return instance;
  }

  // Magik: init() -> _self.color_linea << colour.new_rgb(0.0, 0.0, 0.0)
  init(): CeldasGrafico {
    this.sColorLinea = '#000000';
    return this;
  }

  // Magik: init_with(props) -> copia las banderas de borde
  async initWith(props: CeldasGraficoProps): Promise<CeldasGrafico> {
    if (props.bBordeSup !== undefined) this.bBordeSup = props.bBordeSup;
    if (props.bBordeInf !== undefined) this.bBordeInf = props.bBordeInf;
    if (props.bBordeIzq !== undefined) this.bBordeIzq = props.bBordeIzq;
    if (props.bBordeDer !== undefined) this.bBordeDer = props.bBordeDer;
    if (props.sColorLinea !== undefined) this.sColorLinea = props.sColorLinea;
    if (props.sNombreGrafico !== undefined) this.sNombreGrafico = props.sNombreGrafico;
    if (props.bVoltearH !== undefined) this.bVoltearH = props.bVoltearH;
    if (props.bVoltearV !== undefined) this.bVoltearV = props.bVoltearV;
    if (props.nGrados !== undefined) this.nGrados = props.nGrados;
    return this;
  }

  // Magik: serial_slots() -> mete las claves/valores en `rope`
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys: ['bBordeSup', 'bBordeInf', 'bBordeIzq', 'bBordeDer', 'ColorLinea'],
      values: [this.bBordeSup, this.bBordeInf, this.bBordeIzq, this.bBordeDer, this.sColorLinea],
    };
  }

  /**
   * Magik: c_celdas_grafico.Despliega()
   *   Calcula los segmentos a dibujar segun las banderas de borde activas
   *   y devuelve tanto el estilo como los segmentos resultantes.
   *
   *   En Magik, este metodo llamaba directamente a
   *   `oVentana.draw_line_transform(...)`. En TS desacoplamos el calculo
   *   del renderizado: el consumidor decidira si pinta en SVG, en
   *   OpenLayers o en cualquier otra superficie.
   */
  async despliega(): Promise<DespliegaResult> {
    const borders: BorderFlags = {
      sup: this.bBordeSup,
      inf: this.bBordeInf,
      izq: this.bBordeIzq,
      der: this.bBordeDer,
    };
    const segments = buildBorderSegments(this.oArea, borders);
    const style: LineStyle = { color: this.sColorLinea, width: 2 };
    return { segments, style };
  }

  /**
   * Helper auxiliar: vuelca el resultado de `despliega()` directamente sobre
   * un VectorSource de OpenLayers (equivalente moderno de
   * `oVentana.draw_line_transform`).
   */
  async desplegarEnOpenLayers(source: VectorSource): Promise<Feature[]> {
    const { segments, style } = await this.despliega();
    const features = segments.map(seg => segmentToOlFeature(seg, style));
    source.addFeatures(features);
    return features;
  }

  /**
   * Helper auxiliar: convierte el resultado en una FeatureCollection GeoJSON
   * por si se quiere combinar con Turf (interseccion, longitud, buffer...).
   */
  async desplegarComoGeoJson(): Promise<GeoJsonFeature<LineString>[]> {
    const { segments } = await this.despliega();
    return segments.map(segmentToTurfLine);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de la celda con sus 4 bordes
// =============================================================================

export function CeldasGraficoUI() {
  const [bordes, setBordes] = useState<BorderFlags>({ sup: true, inf: true, izq: true, der: true });
  const [color, setColor] = useState<string>('#1f6feb');
  const [render, setRender] = useState<DespliegaResult | null>(null);

  const area = useMemo<Bounds>(() => ({ xmin: 10, xmax: 190, ymin: 10, ymax: 110 }), []);

  useEffect(() => {
    let mounted = true;

    const celda = CeldasGrafico.create(area);
    celda.initWith({
      bBordeSup: bordes.sup,
      bBordeInf: bordes.inf,
      bBordeIzq: bordes.izq,
      bBordeDer: bordes.der,
      sColorLinea: color,
    }).then(() => celda.despliega()).then(result => {
      if (mounted) setRender(result);
    });

    return () => {
      mounted = false;
    };
  }, [area, bordes, color]);

  const toggle = (k: keyof BorderFlags) =>
    setBordes(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_celdas_grafico</div>

      <div style={s.controls}>
        {(['sup', 'inf', 'izq', 'der'] as (keyof BorderFlags)[]).map(b => (
          <label key={b} style={s.checkbox}>
            <input type="checkbox" checked={bordes[b]} onChange={() => toggle(b)} />
            borde {b}
          </label>
        ))}
        <label style={s.checkbox}>
          color
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ marginLeft: 4 }}
          />
        </label>
      </div>

      <svg viewBox="0 0 200 120" width={320} height={200} style={s.preview}>
        {/* Sombra del area como referencia visual del oArea */}
        <rect
          x={area.xmin}
          y={area.ymin}
          width={area.xmax - area.xmin}
          height={area.ymax - area.ymin}
          fill="#f0f4f8"
          stroke="#cbd5e0"
          strokeDasharray="2 2"
          strokeWidth={0.5}
        />
        {render?.segments.map((seg, idx) => (
          <line
            key={idx}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={render.style.color}
            strokeWidth={render.style.width}
          />
        ))}
      </svg>

      <div style={s.meta}>
        Bordes activos: {render?.segments.map(seg => seg.borde).join(', ') || 'ninguno'}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper : { display: 'flex', flexDirection: 'column', gap: 8 },
  title   : { fontSize: 13, fontWeight: 'bold' },
  controls: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  checkbox: { fontSize: 12, color: '#333', display: 'flex', gap: 4, alignItems: 'center' },
  preview : { background: '#fff', borderRadius: 6, border: '1px solid #ddd' },
  meta    : { fontSize: 11, color: '#777' },
};

export default CeldasGraficoUI;
