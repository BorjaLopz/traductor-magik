/**
 * MarcoLayout.tsx
 * Migración de marco_layout.magik (Sigma Tao / Sigma Tao 2004 - llruiz)
 *
 * Jerarquía Magik: marco_layout extends :layout_element
 * Propósito: dibuja el marco de un plano. Soporta dos modos:
 *   1) Configuración NORMAL — tamaño hoja = num_mod * modulo_width + sello,
 *      altura * modulo_height + 400. Líneas verticales/horizontales en los
 *      límites de cada módulo.
 *   2) Configuración por TIPO DE PLANO ("Distritos1/2/3", "Itinerario1/2/3",
 *      "Construccion1", "Empalmes", "Topologico1/2/3"). Para cada tipo se
 *      define un arreglo de anchos y altos de columnas/filas. Se marcan las
 *      separaciones con pequeñas "ticks" azules en los bordes del marco
 *      y se añaden las cuatro "esquinas" del plano (esquinas_plano).
 *
 * Mapeo de tipos Magik → TypeScript:
 *   - sector.new + .add + .draw_on(window, line_style) → ol/Feature(LineString)
 *     dentro de un VectorSource con un Style(Stroke).
 *   - bounding_box.new                                  → Turf bboxPolygon / Bounds.
 *   - layout_page.set_paper_size                        → tamaño del View / mapSize.
 *   - line_style.called(:blue|:red)                     → colores hex.
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

// ───────────────────────────────────────────────────────────────────────────
// TIPOS — equivalentes a slots y estructuras del original
// ───────────────────────────────────────────────────────────────────────────

/** Equivale a bounding_box.new(xmin, ymin, xmax, ymax) */
export interface Bounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/** Tamaño de hoja calculado por initialise_for_page / set_paper_size */
export interface PaperSize {
  width: number;
  height: number;
}

/** Enum Magik :plano — valores devueltos por marco_layout.nombre_plano */
export type PlanoTipo =
  | ''
  | 'Distritos1' | 'Distritos2' | 'Distritos3'
  | 'Itinerario1' | 'Itinerario2' | 'Itinerario3'
  | 'Construccion1' | 'Construccion2'
  | 'Empalmes'
  | 'Topologico1' | 'Topologico2' | 'Topologico3';

/** Atributos editables del marco (layout_attribute_definition Magik) */
export interface MarcoAttributes {
  num_mod: number;   // numero de modulos
  altura : number;   // num pags
  sello  : number;   // area del sello
  plano  : PlanoTipo;
}

/** Configuración fija por tipo de plano — pares (anchos, altos) en mm/unid */
interface PlanoConfig {
  anchos: number[];
  altos : number[];
  /** Cuando el plano forzaba override de num_mod/altura en Magik */
  override?: { num_mod?: number; altura?: number };
}

// ───────────────────────────────────────────────────────────────────────────
// nombre_plano() — enum de tipos de plano (12 entradas + "")
// ───────────────────────────────────────────────────────────────────────────
export const PLANO_OPTIONS: PlanoTipo[] = [
  '',
  'Distritos1', 'Distritos2', 'Distritos3',
  'Itinerario1', 'Itinerario2', 'Itinerario3',
  'Construccion1', 'Construccion2',
  'Empalmes',
  'Topologico1', 'Topologico2', 'Topologico3',
];

// ───────────────────────────────────────────────────────────────────────────
// Tabla de configuraciones por tipo de plano — extraída del _if/_elif Magik
// ───────────────────────────────────────────────────────────────────────────
const PLANO_CONFIGS: Record<Exclude<PlanoTipo, ''>, PlanoConfig> = {
  Distritos1   : { anchos: [2040, 1750, 1750, 1750, 1750, 1690],       altos: [2741, 2791, 2741], override: { num_mod: 6, altura: 3 } },
  Distritos2   : { anchos: [2040, 1747, 1747, 1747, 1747, 1695],       altos: [2745, 2800, 2745], override: { num_mod: 6, altura: 3 } },
  Distritos3   : { anchos: [2035, 1745, 1745, 1745, 1745, 1745, 1710], altos: [2745, 2810, 2770] },
  Itinerario1  : { anchos: [2040, 1660, 1750, 1750, 1750, 1700],       altos: [2745, 2795, 2745] },
  Itinerario2  : { anchos: [2040, 1745, 1745, 1745, 1745, 1695],       altos: [2745, 2800, 2745] },
  Itinerario3  : { anchos: [2035, 1745, 1745, 1745, 1745, 1745, 1710], altos: [2445, 2810, 2770] },
  Construccion1: { anchos: [1950, 1700, 1700, 1650],                   altos: [2670, 2670] },
  Construccion2: { anchos: [1950, 1700, 1700, 1650],                   altos: [2670, 2670] }, // alias visual de Empalmes
  Empalmes     : { anchos: [1950, 1700, 1700, 1650],                   altos: [2670, 2670] },
  Topologico1  : { anchos: [2040, 1660, 1750, 1750, 1750, 1700],       altos: [2745, 2795, 2745] },
  Topologico2  : { anchos: [2040, 1745, 1745, 1745, 1695],             altos: [2745, 2800, 2745] },
  Topologico3  : { anchos: [2035, 1745, 1745, 1745, 1745, 1745, 1710], altos: [2745, 2770, 2745] },
};

// ───────────────────────────────────────────────────────────────────────────
// Segmento dibujable — equivale a sector.new() + add(p1) + add(p2)
// ───────────────────────────────────────────────────────────────────────────
export interface MarcoSegment {
  coords: [number, number][]; // 2 o más puntos (polyline)
  color : string;             // ':blue' | ':red' Magik → hex CSS
}

// ───────────────────────────────────────────────────────────────────────────
// CLASE PRINCIPAL — MarcoLayout
// def_slotted_exemplar(:marco_layout, {}, :layout_element)
// ───────────────────────────────────────────────────────────────────────────
export class MarcoLayout {
  // shared_constants Magik
  static readonly LONGITUD_VERTICAL = 100;
  static readonly MODULO_WIDTH      = 2160;
  static readonly MODULO_HEIGHT     = 2790;

  // Sangrías internas usadas en modo "config plano"
  private static readonly SANGRIA_HOR_A = 300;
  private static readonly SANGRIA_VER_A = 300;
  private static readonly SANGRIA_HOR   = 150;

  attrs : MarcoAttributes;
  bounds: Bounds = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 };
  paper : PaperSize = { width: 0, height: 0 };

  constructor(attrs: Partial<MarcoAttributes> = {}) {
    this.attrs = {
      num_mod: attrs.num_mod ?? 1,
      altura : attrs.altura  ?? 1,
      sello  : attrs.sello   ?? 0,
      plano  : attrs.plano   ?? '',
    };
  }

  // ─── initialise_for_page(a_layout_page) ────────────────────────────────
  // Set paper size = sello + 100 + num_mod*modulo_width × altura*modulo_height + 400.
  // bounds = inner bbox (xmin+sello+100, ymin+100, xmax-100, ymax-300).
  initialiseForPage(): void {
    const { sello, num_mod, altura } = this.attrs;
    this.paper = {
      width : sello + 100 + num_mod * MarcoLayout.MODULO_WIDTH,
      height: altura * MarcoLayout.MODULO_HEIGHT + 400,
    };
    this.bounds = {
      xmin: sello + 100,
      ymin: 100,
      xmax: this.paper.width  - 100,
      ymax: this.paper.height - 300,
    };
  }

  // ─── draw_content_on(window) — modo "config plano" ─────────────────────
  // Devuelve los segmentos a dibujar. Si el plano corresponde a una entrada
  // de PLANO_CONFIGS, calcula paper + bounds con sangrías y emite ticks +
  // esquinas. Si no, usa el modo normal por módulos.
  draw(): MarcoSegment[] {
    const cfg = this.attrs.plano ? PLANO_CONFIGS[this.attrs.plano] : null;
    return cfg ? this.drawConfigPlano(cfg) : this.drawConfigNormal();
  }

  // ── Modo CONFIG PLANO ──────────────────────────────────────────────────
  // Magik: _if LbConfigNormal.not _then ... (líneas 231–288).
  private drawConfigPlano(cfg: PlanoConfig): MarcoSegment[] {
    // Override Magik de num_mod / altura cuando el plano lo impone.
    if (cfg.override?.num_mod !== undefined) this.attrs.num_mod = cfg.override.num_mod;
    if (cfg.override?.altura  !== undefined) this.attrs.altura  = cfg.override.altura;

    const ancho = cfg.anchos.reduce((a, b) => a + b, 0);
    const alto  = cfg.altos .reduce((a, b) => a + b, 0);

    this.paper = {
      width : ancho + MarcoLayout.SANGRIA_HOR_A,
      height: alto  + MarcoLayout.SANGRIA_VER_A,
    };
    this.bounds = {
      xmin: MarcoLayout.SANGRIA_HOR,
      ymin: MarcoLayout.SANGRIA_HOR,
      xmax: this.paper.width  - MarcoLayout.SANGRIA_HOR,
      ymax: this.paper.height - MarcoLayout.SANGRIA_HOR,
    };

    const segs: MarcoSegment[] = [];

    // Marcas de ANCHO — ticks azules de 50u en bordes superior e inferior.
    let acc = 150;
    for (const med of cfg.anchos) {
      acc += med;
      segs.push({ coords: [[acc, this.bounds.ymax], [acc, this.bounds.ymax - 50]], color: BLUE });
      segs.push({ coords: [[acc, this.bounds.ymin], [acc, this.bounds.ymin + 50]], color: BLUE });
    }
    // Marcas de ALTO — ticks azules en bordes izquierdo y derecho.
    acc = 150;
    for (const med of cfg.altos) {
      acc += med;
      segs.push({ coords: [[this.bounds.xmin, acc], [this.bounds.xmin + 50, acc]], color: BLUE });
      segs.push({ coords: [[this.bounds.xmax, acc], [this.bounds.xmax - 50, acc]], color: BLUE });
    }
    // esquinas_plano(window) — cuatro L's en cada esquina.
    segs.push(...this.esquinasPlano());
    return segs;
  }

  // ── Modo CONFIG NORMAL — marco por módulos tamaño carta ────────────────
  // Magik: líneas 290–334.
  private drawConfigNormal(): MarcoSegment[] {
    this.initialiseForPage();
    const { num_mod, altura } = this.attrs;
    const bb = this.bounds;
    const segs: MarcoSegment[] = [];

    const anchoMod = (bb.xmax - bb.xmin) / num_mod;

    // Divisores verticales entre módulos: tick superior + tick inferior.
    for (let i = 1; i < num_mod; i++) {
      const x = bb.xmin + i * anchoMod;
      segs.push({ coords: [[x, bb.ymin], [x, bb.ymin + MarcoLayout.LONGITUD_VERTICAL]], color: BLUE });
      segs.push({ coords: [[x, bb.ymax], [x, bb.ymax - MarcoLayout.LONGITUD_VERTICAL]], color: BLUE });
    }
    // Divisores horizontales por altura: marca izq + marca der (rojas, 2× LONG).
    for (let i = 1; i < altura; i++) {
      const y = bb.ymin + i * MarcoLayout.MODULO_HEIGHT;
      segs.push({ coords: [[bb.xmin, y], [bb.xmin + 2 * MarcoLayout.LONGITUD_VERTICAL, y]], color: RED });
      segs.push({ coords: [[bb.xmax, y], [bb.xmax - 2 * MarcoLayout.LONGITUD_VERTICAL, y]], color: RED });
    }
    return segs;
  }

  // ─── esquinas_plano(window) ────────────────────────────────────────────
  // 4 esquinas (L de 50u) — inferior izq / sup izq / sup der / inf der.
  private esquinasPlano(): MarcoSegment[] {
    const { xmin, xmax, ymin, ymax } = this.bounds;
    const D = 50;
    return [
      // Inferior izquierda
      { coords: [[xmin - D, ymin - D], [xmin - D, ymin + D]], color: BLUE },
      { coords: [[xmin - D, ymin - D], [xmin + D, ymin - D]], color: BLUE },
      // Superior izquierda
      { coords: [[xmin - D, ymax - D], [xmin - D, ymax + D]], color: BLUE },
      { coords: [[xmin - D, ymax + D], [xmin + D, ymax + D]], color: BLUE },
      // Superior derecha
      { coords: [[xmax + D, ymax + D], [xmax - D, ymax + D]], color: BLUE },
      { coords: [[xmax + D, ymax + D], [xmax + D, ymax - D]], color: BLUE },
      // Inferior derecha
      { coords: [[xmax + D, ymin - D], [xmax - D, ymin - D]], color: BLUE },
      { coords: [[xmax + D, ymin - D], [xmax + D, ymin + D]], color: BLUE },
    ];
  }

  // ─── Helpers Turf.js ───────────────────────────────────────────────────
  /** Cada segment → GeoJSON LineString (para cálculos turf.length / bearing). */
  toGeoJSON(): GeoJSONFeature<LineString>[] {
    return this.draw().map(seg =>
      turf.lineString(seg.coords, { color: seg.color }) as GeoJSONFeature<LineString>,
    );
  }

  /** Rectángulo exterior del marco como GeoJSON Polygon (Turf bboxPolygon). */
  marcoBBoxGeoJSON() {
    return turf.bboxPolygon([this.bounds.xmin, this.bounds.ymin, this.bounds.xmax, this.bounds.ymax]);
  }
}

// Colores Magik :blue / :red → hex.
const BLUE = '#1e6fff';
const RED  = '#d33b3b';

// ───────────────────────────────────────────────────────────────────────────
// UI React — render del marco sobre un mapa OpenLayers v10
// ───────────────────────────────────────────────────────────────────────────
export function MarcoLayoutUI() {
  const [plano,   setPlano]   = useState<PlanoTipo>('Distritos1');
  const [numMod,  setNumMod]  = useState(2);
  const [altura,  setAltura]  = useState(2);
  const [sello,   setSello]   = useState(0);

  const mapRef        = useRef<HTMLDivElement>(null);
  const olMapRef      = useRef<Map | null>(null);
  const sourceRef     = useRef<VectorSource | null>(null);
  const boxSourceRef  = useRef<VectorSource | null>(null);

  // Reconstruye marco cuando cambian atributos.
  const marco = useMemo(() => {
    const m = new MarcoLayout({ num_mod: numMod, altura, sello, plano });
    m.draw(); // fuerza cálculo de bounds/paper
    return m;
  }, [numMod, altura, sello, plano]);

  // Inicialización del mapa OL — proyección plana (unidades = mm del plano).
  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;

    const projection = new Projection({
      code      : 'marco-paper',
      units     : 'pixels',
      extent    : [-1000, -1000, 25000, 15000],
    });

    const source     = new VectorSource();
    const boxSource  = new VectorSource();

    const layerBox = new VectorLayer({
      source : boxSource,
      style  : new Style({ stroke: new Stroke({ color: '#222', width: 2 }) }),
    });
    const layerSegs = new VectorLayer({
      source: source,
      style : (feat) => new Style({
        stroke: new Stroke({
          color: (feat.get('color') as string) ?? BLUE,
          width: 2,
        }),
      }),
    });

    olMapRef.current = new Map({
      target: mapRef.current,
      layers: [layerBox, layerSegs],
      view  : new View({
        projection,
        center    : [10000, 5000],
        resolution: 20,
      }),
      controls: [],
    });

    sourceRef.current    = source;
    boxSourceRef.current = boxSource;
  }, []);

  // Repobla segments + rectángulo exterior + ajusta view al marco.
  useEffect(() => {
    const src    = sourceRef.current;
    const boxSrc = boxSourceRef.current;
    const map    = olMapRef.current;
    if (!src || !boxSrc || !map) return;

    src.clear();
    boxSrc.clear();

    // Rectángulo exterior (marco)
    const { xmin, ymin, xmax, ymax } = marco.bounds;
    boxSrc.addFeature(new Feature({
      geometry: new OLLineString([
        [xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin],
      ]),
    }));

    // Segments internos del marco
    for (const seg of marco.draw()) {
      const f = new Feature({ geometry: new OLLineString(seg.coords) });
      f.set('color', seg.color);
      src.addFeature(f);
    }

    map.getView().fit(
      [xmin - 500, ymin - 500, xmax + 500, ymax + 500],
      { padding: [20, 20, 20, 20] },
    );
  }, [marco]);

  const cfg = plano ? PLANO_CONFIGS[plano] : null;

  return (
    <div>
      <p style={uiStyles.meta}>
        Marco de plano. Modo CONFIG_PLANO (anchos/altos fijos + esquinas) si <i>plano</i> ≠ "".
        Modo NORMAL (módulos × num_mod × altura) si plano = "".
      </p>
      <div style={uiStyles.controls}>
        <label>
          Plano:&nbsp;
          <select value={plano} onChange={e => setPlano(e.target.value as PlanoTipo)} style={uiStyles.input}>
            {PLANO_OPTIONS.map(p => <option key={p} value={p}>{p || '(normal)'}</option>)}
          </select>
        </label>
        <label>
          num_mod:&nbsp;
          <input type="number" min={1} max={10} value={numMod}
                 onChange={e => setNumMod(Math.max(1, +e.target.value))}
                 disabled={!!cfg?.override?.num_mod}
                 style={uiStyles.input} />
        </label>
        <label>
          altura:&nbsp;
          <input type="number" min={1} max={6} value={altura}
                 onChange={e => setAltura(Math.max(1, +e.target.value))}
                 disabled={!!cfg?.override?.altura}
                 style={uiStyles.input} />
        </label>
        <label>
          sello:&nbsp;
          <input type="number" min={0} value={sello}
                 onChange={e => setSello(Math.max(0, +e.target.value))}
                 style={uiStyles.input} />
        </label>
      </div>

      <div style={uiStyles.info}>
        <span>paper: {Math.round(marco.paper.width)} × {Math.round(marco.paper.height)}</span>
        <span>bounds: ({Math.round(marco.bounds.xmin)}, {Math.round(marco.bounds.ymin)}) → ({Math.round(marco.bounds.xmax)}, {Math.round(marco.bounds.ymax)})</span>
        <span>segments: {marco.draw().length}</span>
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
  map     : { width: '100%', height: 460, border: '1px solid #ccd', background: '#fafafa' },
};

export default MarcoLayout;
