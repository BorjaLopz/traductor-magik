/**
 * Migracion de: c_linea_grafico.magik
 * Clase Magik:  c_linea_grafico  (hereda de c_elemento_grafico)
 * Metodos:      new, Color, coordenadaMin, coordenadaMax, Despliega, serial_slots
 *
 * Intencion:
 *   Dibujar una linea dentro de un area (bounding box) usando dos coordenadas
 *   proporcionales (0..1) que definen el punto inicial (oCoordenadaMin) y el
 *   punto final (oCoordenadaMax) relativos al area.
 *
 *   - LnLongEnX/Y         -> ancho/alto del area
 *   - LnXmin = Xmin + ancho * coordMin.x
 *   - LnYmin = Ymin + alto  * coordMin.y
 *   - LnXmax = Xmax - ancho * (1 - coordMax.x)
 *   - LnYmax = Ymax - alto  * (1 - coordMax.y)
 *   - draw_line_transform -> ol/Feature(LineString) sobre VectorSource
 *
 *   Calculo espacial expuesto como Turf LineString GeoJSON para poder usar
 *   turf.length, turf.bearing, etc. Render real sobre OpenLayers v10.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature as GeoJSONFeature, LineString } from 'geojson';

import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { LineString as OLLineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style } from 'ol/style';
import { Projection } from 'ol/proj';
import 'ol/ol.css';

// =============================================================================
// TIPOS
// =============================================================================

// Magik: oArea (heredado de c_elemento_grafico) — Xmin/Xmax/Ymin/Ymax
export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

// Magik: coordinate.new(x, y) — par de proporciones en [0, 1]
export interface Coord {
  x: number;
  y: number;
}

// Magik: line_style.new_with_properties(:foreground_colour, ..., :width, 2)
export interface LineStyle {
  color: string;
  width: number;
}

// Resultado del despliegue: dos endpoints absolutos + estilo
export interface LineaRender {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: LineStyle;
}

// =============================================================================
// CLASE PRINCIPAL — c_linea_grafico
// =============================================================================

export class LineaGrafico {
  // Magik slots
  oArea: Bounds;
  oCoordenadaMin: Coord;
  oCoordenadaMax: Coord;
  sColor: string;

  constructor(area: Bounds, coordMin: Coord, coordMax: Coord) {
    this.oArea = area;
    this.oCoordenadaMin = coordMin;
    this.oCoordenadaMax = coordMax;
    this.sColor = 'black'; // Magik: _self.sColor << :black
  }

  // Magik: new(PoCoordenadaMin, PoCoordenadaMax) -> _clone
  static create(area: Bounds, coordMin: Coord, coordMax: Coord): LineaGrafico {
    return new LineaGrafico(area, coordMin, coordMax);
  }

  // Magik: Color getter
  getColor(): string {
    return this.sColor;
  }

  // Magik: Color << PsColor
  setColor(color: string): void {
    this.sColor = color;
  }

  // Magik: coordenadaMin << PoCoordenada
  setCoordenadaMin(coord: Coord): void {
    this.oCoordenadaMin = coord;
  }

  // Magik: coordenadaMax << PoCoordenada
  setCoordenadaMax(coord: Coord): void {
    this.oCoordenadaMax = coord;
  }

  // -------------------------------------------------------------------------
  // CALCULO DE ENDPOINTS
  // Magik: parte logica de Despliega() (sin el draw_line_transform)
  // -------------------------------------------------------------------------
  private endpoints(): { x1: number; y1: number; x2: number; y2: number } {
    const { xmin, xmax, ymin, ymax } = this.oArea;
    const longEnX = xmax - xmin;
    const longEnY = ymax - ymin;

    const x1 = xmin + longEnX * this.oCoordenadaMin.x;
    const y1 = ymin + longEnY * this.oCoordenadaMin.y;
    const x2 = xmax - longEnX * (1 - this.oCoordenadaMax.x);
    const y2 = ymax - longEnY * (1 - this.oCoordenadaMax.y);

    return { x1, y1, x2, y2 };
  }

  // -------------------------------------------------------------------------
  // SALIDA GeoJSON (Turf)
  // Permite usar turf.length, turf.bearing, turf.midpoint, etc.
  // -------------------------------------------------------------------------
  async toGeoJSON(): Promise<GeoJSONFeature<LineString>> {
    const { x1, y1, x2, y2 } = this.endpoints();
    return turf.lineString(
      [[x1, y1], [x2, y2]],
      { color: this.sColor },
    );
  }

  // -------------------------------------------------------------------------
  // SALIDA OpenLayers
  // Magik: _self.oVentana.draw_line_transform(LoEstilo_Linea, LoCoordenada)
  // -------------------------------------------------------------------------
  async toOLFeature(): Promise<Feature<OLLineString>> {
    const { x1, y1, x2, y2 } = this.endpoints();
    const feature = new Feature({ geometry: new OLLineString([[x1, y1], [x2, y2]]) });
    feature.setStyle(
      new Style({
        stroke: new Stroke({ color: this.sColor, width: 2 }),
      }),
    );
    return feature;
  }

  // -------------------------------------------------------------------------
  // RESUMEN PLANO (para demos sin mapa)
  // -------------------------------------------------------------------------
  async despliega(): Promise<LineaRender> {
    const { x1, y1, x2, y2 } = this.endpoints();
    return {
      x1, y1, x2, y2,
      style: { color: this.sColor, width: 2 },
    };
  }

  // Magik: serial_slots() — serializa slots propios + heredados
  serialSlots(): Record<string, unknown> {
    return {
      oCoordenadaMin: this.oCoordenadaMin,
      oCoordenadaMax: this.oCoordenadaMax,
      sColor: this.sColor,
    };
  }
}

// =============================================================================
// COMPONENTE REACT — demo con OpenLayers v10
// =============================================================================

interface Preset {
  label: string;
  coordMin: Coord;
  coordMax: Coord;
  color: string;
}

const PRESETS: Preset[] = [
  { label: 'Diagonal completa',  coordMin: { x: 0,   y: 0   }, coordMax: { x: 1,   y: 1   }, color: '#1976d2' },
  { label: 'Diagonal invertida', coordMin: { x: 0,   y: 1   }, coordMax: { x: 1,   y: 0   }, color: '#d32f2f' },
  { label: 'Horizontal media',   coordMin: { x: 0,   y: 0.5 }, coordMax: { x: 1,   y: 0.5 }, color: '#388e3c' },
  { label: 'Vertical media',     coordMin: { x: 0.5, y: 0   }, coordMax: { x: 0.5, y: 1   }, color: '#f57c00' },
];

const AREA: Bounds = { xmin: 0, xmax: 100, ymin: 0, ymax: 100 };

export function LineaGraficoUI() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [render, setRender] = useState<LineaRender | null>(null);
  const [length, setLength] = useState<number>(0);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef<VectorSource>(new VectorSource());
  const mapInstanceRef = useRef<Map | null>(null);

  const preset = useMemo(() => PRESETS[presetIdx], [presetIdx]);

  // Init OL map (una sola vez)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Proyeccion local plana (coordenadas del Bounds, sin geo real)
    const projection = new Projection({
      code: 'local-linea',
      units: 'pixels',
      extent: [AREA.xmin, AREA.ymin, AREA.xmax, AREA.ymax],
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new VectorLayer({ source: sourceRef.current }),
      ],
      view: new View({
        projection,
        center: [(AREA.xmin + AREA.xmax) / 2, (AREA.ymin + AREA.ymax) / 2],
        zoom: 2,
        extent: [AREA.xmin, AREA.ymin, AREA.xmax, AREA.ymax],
      }),
    });
    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-render al cambiar preset
  useEffect(() => {
    let mounted = true;
    const linea = LineaGrafico.create(AREA, preset.coordMin, preset.coordMax);
    linea.setColor(preset.color);

    (async () => {
      const ren = await linea.despliega();
      const feat = await linea.toOLFeature();
      const geo = await linea.toGeoJSON();
      if (!mounted) return;

      // Volcado en VectorSource: limpiar + add
      sourceRef.current.clear();
      sourceRef.current.addFeature(feat);

      setRender(ren);
      setLength(turf.length(geo, { units: 'meters' }));
    })();

    return () => {
      mounted = false;
    };
  }, [preset]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_linea_grafico</div>

      <label style={s.label}>
        Preset
        <select
          value={presetIdx}
          onChange={e => setPresetIdx(Number(e.target.value))}
          style={s.input}
        >
          {PRESETS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </label>

      <div ref={mapRef} style={s.map} />

      {render && (
        <div style={s.meta}>
          P1 = ({render.x1.toFixed(1)}, {render.y1.toFixed(1)}) ·
          P2 = ({render.x2.toFixed(1)}, {render.y2.toFixed(1)}) ·
          color = <span style={{ color: render.style.color }}>{render.style.color}</span> ·
          longitud (Turf) = {length.toFixed(2)}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  label  : { fontSize: 12, color: '#333', display: 'flex', gap: 6, alignItems: 'center' },
  input  : { padding: '4px 6px', fontSize: 12 },
  map    : { width: 320, height: 320, background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
  meta   : { fontSize: 11, color: '#555' },
};

export default LineaGraficoUI;
