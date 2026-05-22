/**
 * Migracion de: c_vp_ubicacion_cedo.magik
 * Clase Magik:  c_vp_ubicacion_cedo  (hereda de viewport_layout)
 * Metodos:      new_with, init_with, initialise_for_page, geometry_set_for_render,
 *               agregar_elementos, draw_content_on, agregar_titulo, defined_attributes
 *
 * Intencion:
 *   Viewport "DETALLE DE CANALIZACION".
 *   1) Filtra colecciones del set heredado (manzanas, ductos, postes, etc).
 *   2) Para cada elemento en oElementos, agrega geometria principal (LoGeom)
 *      y geometria de anotacion (LoGeomTxt) buscando por source_collection.name.
 *   3) Combina ambos sets en un composite_geometry_set.
 *   4) Agrega titulo "DETALLE DE CANALIZACION" en franja inferior del bounds.
 *
 *   Render real sobre OpenLayers v10 (ol/source/Vector) y geometrias expuestas
 *   como Turf FeatureCollection para calculos espaciales.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as turf from '@turf/turf';
import type { FeatureCollection, Geometry } from 'geojson';

import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { Point, LineString, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Projection } from 'ol/proj';
import 'ol/ol.css';

// =============================================================================
// CONSTANTES — Magik define_shared_constant
// =============================================================================

const TITULO = 'DETALLE DE CANALIZACION';
const TAMANIO = 6;
const ALLOWED_ON_MENU = false;

// Magik: LoGeom — property_list { source_collection.name -> nombre de geometria principal }
const LO_GEOM: Record<string, string> = {
  ubb              : 'location',
  splice_closure   : 'user!_posicion_interna',
  figure_eight     : 'user!_detalle',
};

// Magik: LoGeomTxt — property_list { source_collection.name -> nombre de geometria de anotacion }
const LO_GEOM_TXT: Record<string, string> = {
  'user!_empalme_distribucion': 'user!_anotacion',
};

// Magik: filtro select(:collection, {...}) en geometry_set_for_render
const COLECCIONES_PERMITIDAS = new Set([
  'user!_manzana',
  'access_point',
  'mit_terminal_enclosure',
  'user!_eje_calle',
  'pole',
  'mit_presentation_object',
  'uub',
  'underground_route',
  'aerial_route',
  'user!_registro_tablero',
  'mit_room',
  'mit_floor',
  'mdu_route',
]);

// =============================================================================
// TIPOS
// =============================================================================

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

// Magik: geometry — representamos con GeoJSON Geometry + metadata
export interface GeometryEntry {
  sourceCollection: string;
  name?: string;            // p.ej. 'location', 'user!_anotacion'
  geometry: Geometry;
  style?: 'point' | 'line' | 'poly' | 'text';
  label?: string;
}

// Magik: oElementos.elements() — coleccion de objetos con .source_collection.name + perform(nombreGeo)
export interface ElementoFuente {
  sourceCollection: string;
  geometries: Record<string, Geometry>;  // mapa nombre -> geometria
  label?: string;
}

export interface LayoutTextElement {
  bounds: Bounds;
  text: string;
  fontName: string;
  fontSize: number;
  alignHorizontal: 'centre' | 'left' | 'right';
  alignVertical: 'centre' | 'top' | 'bottom';
}

export interface LayoutPage {
  bounds: Bounds;
  elements: LayoutTextElement[];
  addElement(element: LayoutTextElement): void;
}

// =============================================================================
// CLASE PRINCIPAL — c_vp_ubicacion_cedo
// =============================================================================

export class VpUbicacionCedo {
  static readonly titulo = TITULO;
  static readonly tamanio = TAMANIO;
  static readonly allowedOnMenu = ALLOWED_ON_MENU;
  static readonly LoGeom = LO_GEOM;
  static readonly LoGeomTxt = LO_GEOM_TXT;

  // Magik slots
  oElementos: { elements(): Iterable<ElementoFuente> } | null = null;
  bounds: Bounds = { xmin: 0, xmax: 0, ymin: 0, ymax: 0 };
  oResulSet: GeometryEntry[] | null = null;

  // Magik: new_with(PoElementos, _gather args) -> _clone via super
  static createWith(elementos: ElementoFuente[], bounds: Bounds): VpUbicacionCedo {
    const vp = new VpUbicacionCedo();
    vp.bounds = bounds;
    vp.oElementos = { elements: () => elementos };
    return vp;
  }

  // Magik: init_with(properties) — solo delega al super
  async initWith(): Promise<this> {
    return this;
  }

  // Magik: initialise_for_page(a_layout_page)
  async initialiseForPage(page: LayoutPage): Promise<void> {
    await this.agregarTitulo(page);
  }

  // Magik: defined_attributes() — delega + colecta en rope
  definedAttributes(): string[] {
    return [];
  }

  // Magik: draw_content_on(windows) — solo super
  async drawContentOn(): Promise<void> {
    // Delegacion pura al super en Magik
  }

  // -------------------------------------------------------------------------
  // Magik: agregar_elementos()
  // Itera oElementos, busca nombre de geometria principal y de anotacion en
  // los lookup LoGeom/LoGeomTxt segun source_collection.name, agrega al set.
  // -------------------------------------------------------------------------
  async agregarElementos(): Promise<GeometryEntry[]> {
    const loest: GeometryEntry[] = [];
    if (!this.oElementos) return loest; // Magik: _if .oElementos _is _unset _then _return loest

    for (const el of this.oElementos.elements()) {
      // Geometria principal
      const nombreGeo = VpUbicacionCedo.LoGeom[el.sourceCollection];
      if (nombreGeo) {
        const geo = el.geometries[nombreGeo];
        if (geo) loest.push({ sourceCollection: el.sourceCollection, name: nombreGeo, geometry: geo });
      }

      // Geometria de anotacion / texto
      const nombreTxt = VpUbicacionCedo.LoGeomTxt[el.sourceCollection];
      if (nombreTxt) {
        const geoTxt = el.geometries[nombreTxt];
        if (geoTxt) loest.push({
          sourceCollection: el.sourceCollection,
          name: nombreTxt,
          geometry: geoTxt,
          style: 'text',
          label: el.label,
        });
      }
    }

    return loest;
  }

  // -------------------------------------------------------------------------
  // Magik: geometry_set_for_render
  // Filtra el super-set por coleccion permitida y combina con agregar_elementos.
  // -------------------------------------------------------------------------
  async geometrySetForRender(superSet: GeometryEntry[] = []): Promise<GeometryEntry[]> {
    const filtered = superSet.filter(g => COLECCIONES_PERMITIDAS.has(g.sourceCollection));
    const extra = await this.agregarElementos();
    this.oResulSet = [...filtered, ...extra];
    return this.oResulSet;
  }

  // -------------------------------------------------------------------------
  // Magik: agregar_titulo(PoPage) — franja inferior de 100 unidades
  // -------------------------------------------------------------------------
  async agregarTitulo(page: LayoutPage): Promise<void> {
    const titleBounds: Bounds = {
      xmin: this.bounds.xmin,
      xmax: this.bounds.xmax,
      ymin: this.bounds.ymin - 100,
      ymax: this.bounds.ymin,
    };

    const element: LayoutTextElement = {
      bounds: titleBounds,
      text: VpUbicacionCedo.titulo,
      fontName: 'bold',
      fontSize: VpUbicacionCedo.tamanio,
      alignHorizontal: 'centre',
      alignVertical: 'centre',
    };

    page.addElement(element);
  }

  // -------------------------------------------------------------------------
  // SALIDA GeoJSON (Turf) — permite calculo de bbox, area, intersect, etc.
  // -------------------------------------------------------------------------
  async toGeoJSON(): Promise<FeatureCollection> {
    const entries = this.oResulSet ?? await this.geometrySetForRender();
    return turf.featureCollection(
      entries.map(e => turf.feature(e.geometry, {
        sourceCollection: e.sourceCollection,
        name: e.name,
        label: e.label,
      })),
    );
  }

  // -------------------------------------------------------------------------
  // SALIDA OpenLayers — vuelca cada entry como ol/Feature al VectorSource.
  // Equivalente a draw_content_on -> draw_geometry_set.
  // -------------------------------------------------------------------------
  async drawOn(source: VectorSource): Promise<void> {
    const entries = this.oResulSet ?? await this.geometrySetForRender();
    source.clear();
    for (const e of entries) {
      const feat = geometryToOLFeature(e);
      if (feat) source.addFeature(feat);
    }
  }
}

// =============================================================================
// HELPERS — conversion GeoJSON -> ol/Feature
// =============================================================================

function geometryToOLFeature(entry: GeometryEntry): Feature | null {
  const g = entry.geometry;
  let feat: Feature | null = null;

  if (g.type === 'Point') {
    feat = new Feature({ geometry: new Point(g.coordinates as number[]) });
  } else if (g.type === 'LineString') {
    feat = new Feature({ geometry: new LineString(g.coordinates as number[][]) });
  } else if (g.type === 'Polygon') {
    feat = new Feature({ geometry: new Polygon(g.coordinates as number[][][]) });
  }
  if (!feat) return null;

  feat.setStyle(styleForEntry(entry));
  return feat;
}

function styleForEntry(entry: GeometryEntry): Style {
  if (entry.style === 'text' || entry.name?.includes('anotacion')) {
    return new Style({
      text: new Text({
        text: entry.label ?? entry.name ?? '',
        font: 'bold 10px sans-serif',
        fill: new Fill({ color: '#222' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
      }),
    });
  }
  if (entry.geometry.type === 'Point') {
    return new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({ color: '#1976d2' }),
        stroke: new Stroke({ color: '#0d47a1', width: 1 }),
      }),
    });
  }
  if (entry.geometry.type === 'Polygon') {
    return new Style({
      fill: new Fill({ color: 'rgba(76, 175, 80, 0.25)' }),
      stroke: new Stroke({ color: '#2e7d32', width: 1 }),
    });
  }
  return new Style({ stroke: new Stroke({ color: '#555', width: 1.5 }) });
}

// =============================================================================
// COMPONENTE REACT — demo con OpenLayers v10
// =============================================================================

const AREA: Bounds = { xmin: 0, xmax: 500, ymin: 0, ymax: 400 };

// Set heredado simulado (lo que devolveria _super.geometry_set_for_render)
const SUPER_SET: GeometryEntry[] = [
  { sourceCollection: 'user!_manzana',     geometry: turf.polygon([[[50, 50], [200, 50], [200, 180], [50, 180], [50, 50]]]).geometry },
  { sourceCollection: 'underground_route', geometry: turf.lineString([[60, 100], [250, 120], [400, 90]]).geometry },
  { sourceCollection: 'aerial_route',      geometry: turf.lineString([[60, 220], [200, 240], [380, 230]]).geometry },
  { sourceCollection: 'pole',              geometry: turf.point([100, 220]).geometry },
  { sourceCollection: 'access_point',      geometry: turf.point([260, 130]).geometry },
  // Coleccion no permitida (se descarta en filter)
  { sourceCollection: 'noise_collection',  geometry: turf.point([10, 10]).geometry },
];

// Elementos a procesar por agregar_elementos
const ELEMENTOS_DEMO: ElementoFuente[] = [
  {
    sourceCollection: 'ubb',
    geometries: { location: turf.point([320, 200]).geometry },
  },
  {
    sourceCollection: 'splice_closure',
    geometries: { 'user!_posicion_interna': turf.point([180, 260]).geometry },
  },
  {
    sourceCollection: 'figure_eight',
    geometries: { 'user!_detalle': turf.lineString([[300, 280], [360, 320]]).geometry },
  },
  {
    sourceCollection: 'user!_empalme_distribucion',
    geometries: { 'user!_anotacion': turf.point([260, 60]).geometry },
    label: 'EMP-CD-001',
  },
];

export function VpUbicacionCedoUI() {
  const [page, setPage] = useState<LayoutPage>(() => makePage());
  const [titulo, setTitulo] = useState<LayoutTextElement | null>(null);
  const [stats, setStats] = useState({ filtered: 0, extra: 0, total: 0 });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const sourceRef = useRef<VectorSource>(new VectorSource());
  const mapInstanceRef = useRef<Map | null>(null);

  const vp = useMemo(() => VpUbicacionCedo.createWith(ELEMENTOS_DEMO, AREA), []);

  // Init OL map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const projection = new Projection({
      code: 'local-cedo',
      units: 'pixels',
      extent: [AREA.xmin, AREA.ymin - 100, AREA.xmax, AREA.ymax],
    });

    const map = new Map({
      target: mapRef.current,
      layers: [new VectorLayer({ source: sourceRef.current })],
      view: new View({
        projection,
        center: [(AREA.xmin + AREA.xmax) / 2, (AREA.ymin + AREA.ymax) / 2],
        zoom: 1,
        extent: [AREA.xmin, AREA.ymin - 100, AREA.xmax, AREA.ymax],
      }),
    });
    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const set = await vp.geometrySetForRender(SUPER_SET);
      await vp.drawOn(sourceRef.current);

      const freshPage = makePage();
      await vp.initialiseForPage(freshPage);

      if (!mounted) return;

      setPage(freshPage);
      setTitulo(freshPage.elements[0] ?? null);
      setStats({
        filtered: set.length - (await vp.agregarElementos()).length,
        extra: (await vp.agregarElementos()).length,
        total: set.length,
      });
    })();

    return () => { mounted = false; };
  }, [vp]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_vp_ubicacion_cedo</div>

      <div ref={mapRef} style={s.map} />

      {titulo && (
        <div style={s.titleBox}>
          <strong>{titulo.text}</strong>
          <span style={s.meta}>
            {' '}· font_size = {titulo.fontSize} · align = {titulo.alignHorizontal}/{titulo.alignVertical}
          </span>
          <div style={s.meta}>
            bounds = ({titulo.bounds.xmin}, {titulo.bounds.ymin}) - ({titulo.bounds.xmax}, {titulo.bounds.ymax})
          </div>
        </div>
      )}

      <div style={s.meta}>
        Set total = {stats.total} | filtrados super = {stats.filtered} | extra (agregar_elementos) = {stats.extra}
      </div>
      <div style={s.meta}>Page elements registrados = {page.elements.length}</div>
    </div>
  );
}

function makePage(): LayoutPage {
  const elements: LayoutTextElement[] = [];
  return {
    bounds: AREA,
    elements,
    addElement(el) { elements.push(el); },
  };
}

const s: Record<string, React.CSSProperties> = {
  wrapper : { display: 'flex', flexDirection: 'column', gap: 8 },
  title   : { fontSize: 13, fontWeight: 'bold' },
  map     : { width: 500, height: 360, background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
  titleBox: { padding: 8, border: '1px solid #eee', borderRadius: 6, fontSize: 12, color: '#333' },
  meta    : { fontSize: 11, color: '#666' },
};

export default VpUbicacionCedoUI;
