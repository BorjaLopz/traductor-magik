/**
 * Migración de: c_Corte_Geografico.magik
 * Clase Magik:  c_Corte_Geografico — Sigma Tao / jesalaza / 19-Nov-2004
 * Hereda:       layout_element, layout_element_mixin, viewport_layout_mixin
 *
 * Layout element que dibuja un corte geográfico:
 *  1. Ruta de arranque (línea azul, 3px) sobre un viewport
 *  2. Capas del dataset landbase (colonia, lote, distrito)
 *     filtradas por buffer de 500 m alrededor de la ruta
 *
 * Cálculos espaciales (buffer, intersección) → Turf.js
 * Renderizado sobre el mapa                  → OpenLayers v10
 */

import React, { useEffect, useRef, useState } from 'react';
import OlMap from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import { Style, Stroke, Fill } from 'ol/style';
import GeoJSONFormat from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import * as turf from '@turf/turf';
import type {
  Feature as GeoJSONFeature,
  FeatureCollection,
  LineString as GeoJSONLineString,
} from 'geojson';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Equivale a un objeto c_Tipo_Geom de la lista LoLista_Geometrias.
 * .perform(:oDataset) / :oTabla / :oTipo_geom → propiedades directas en TS.
 */
export interface TipoGeomItem {
  dataset:   string;   // LoRegistro.perform(:oDataset)  → "landbase"
  tabla:     string;   // LoRegistro.perform(:oTabla)    → "colonia" | "user!_lote" | ...
  campoGeom: string;   // LoRegistro.perform(:oTipo_geom)
}

/** Abstrae .oMapPlugin.current_map_view */
export interface MapViewData {
  center: [number, number];                  // [lon, lat] EPSG:4326
  extent: [number, number, number, number];  // [minX, minY, maxX, maxY] EPSG:4326
}

/**
 * Abstrae el acceso a datos GIS:
 *   - swg_dsn_admin_engine → obtenerMapView
 *   - dataset collections  → obtenerFeatures
 *   - .oRwoArranque.route  → obtenerRuta
 */
export interface CorteGeograficoService {
  obtenerRuta(): Promise<GeoJSONFeature<GeoJSONLineString>>;
  obtenerMapView(): Promise<MapViewData>;
  obtenerFeatures(
    dataset: string,
    tabla:   string,
    campoGeom: string,
  ): Promise<FeatureCollection>;
}

// =============================================================================
// MOCK SERVICE
// =============================================================================

// Ruta en área Vallejo, CDMX (EPSG:4326)
const RUTA_MOCK: GeoJSONFeature<GeoJSONLineString> = {
  type:       'Feature',
  properties: { id: 'ruta-arranque' },
  geometry: {
    type: 'LineString',
    coordinates: [
      [-99.153, 19.478],
      [-99.148, 19.481],
      [-99.142, 19.484],
      [-99.136, 19.487],
      [-99.130, 19.489],
    ],
  },
};

function crearCirculo(cx: number, cy: number, radioKm: number, id: string): GeoJSONFeature {
  return turf.circle([cx, cy], radioKm, {
    steps: 8, properties: { id },
  }) as unknown as GeoJSONFeature;
}

export const mockCorteGeograficoService: CorteGeograficoService = {
  async obtenerRuta()    { return RUTA_MOCK; },
  async obtenerMapView() {
    return {
      center: [-99.14, 19.484],
      extent: [-99.165, 19.470, -99.120, 19.500],
    };
  },
  async obtenerFeatures(_dataset, tabla) {
    // Dos features próximas a la ruta (dentro del buffer) + una lejana (fuera)
    return {
      type: 'FeatureCollection',
      features: [
        crearCirculo(-99.150, 19.480, 0.25, `${tabla}-1`),  // dentro
        crearCirculo(-99.140, 19.485, 0.20, `${tabla}-2`),  // dentro
        crearCirculo(-99.175, 19.460, 0.40, `${tabla}-3`),  // fuera del buffer
      ],
    } as FeatureCollection;
  },
};

// =============================================================================
// CONSTANTES
// =============================================================================

// Magik: LoLista_Geometrias = { c_Tipo_Geom.new(...) × 3 }
const LISTA_GEOMETRIAS: TipoGeomItem[] = [
  { dataset: 'landbase', tabla: 'colonia',          campoGeom: 'limite' },
  { dataset: 'landbase', tabla: 'user!_lote',       campoGeom: 'user!_lote_linea' },
  { dataset: 'landbase', tabla: 'user!_distrito',   campoGeom: 'user!_limite_distrito' },
];

const COLORES: Record<string, { fill: string; stroke: string; label: string }> = {
  'colonia':          { fill: 'rgba(255,160,0,0.35)',  stroke: '#bb7700', label: 'Colonia (límite)' },
  'user!_lote':       { fill: 'rgba(0,160,80,0.35)',   stroke: '#006630', label: 'Lote' },
  'user!_distrito':   { fill: 'rgba(160,0,210,0.35)',  stroke: '#8800bb', label: 'Distrito' },
};

// 500000 unidades de mapa en Smallworld ≈ 500 m → 0.5 km en Turf
const BUFFER_KM = 0.5;

// =============================================================================
// CLASE PRINCIPAL
// Magik: def_slotted_exemplar(:c_Corte_Geografico, {4 slots}, {mixins})
// =============================================================================

export interface AttributeDefinition {
  name:         string;
  type:         string;
  description:  string;
  defaultValue: string;
  opciones?:    string[];
}

export class CCorteGeografico {

  // Magik slots → propiedades de instancia
  private oRwoArranque: GeoJSONFeature<GeoJSONLineString> | null = null;  // {:oRwoArranque}
  private dibujaCalles: 'Si' | 'No' = 'Si';   // atributo Dibuja_Calles? default "Si"

  // ── Setters (Magik: .slot << newValue) ───────────────────────────────────────
  setORwoArranque(rwo: GeoJSONFeature<GeoJSONLineString>): void {
    this.oRwoArranque = rwo;
  }

  setDibujaCalles(val: 'Si' | 'No'): void {
    this.dibujaCalles = val;
  }

  // ── defined_attributes ───────────────────────────────────────────────────────
  // Magik: rope.new_from(_super.defined_attributes)
  //        + viewport_attribute_definition
  //        + layout_attribute_definition.new(:Dibuja_Calles?, :string, ...)
  definedAttributes(): AttributeDefinition[] {
    return [
      {
        name: 'viewport', type: 'viewport',
        description: 'Viewport del corte', defaultValue: '',
      },
      {
        name: 'Dibuja_Calles', type: 'string',
        description: 'Dibuja Calles',
        defaultValue: 'Si',
        opciones: this.opciones(),   // :enum_method => :Opciones
      },
    ];
  }

  // ── opciones ─────────────────────────────────────────────────────────────────
  // Magik: LaOpciones.add("No"); LaOpciones.add("Si") → ["No","Si"]
  opciones(): ('Si' | 'No')[] {
    return ['No', 'Si'];
  }

  // ── Dibuja_Corte ─────────────────────────────────────────────────────────────
  // Magik: crea viewport [200,200,1500,1500], mapea la vista actual, dibuja
  //        la ruta de arranque (azul 3px) y las capas landbase filtradas por buffer.
  async dibujaCorte(
    routeSource:  VectorSource,
    layerSources: Record<string, VectorSource>,
    service:      CorteGeograficoService,
  ): Promise<{ featuresDrawn: number }> {

    const format = new GeoJSONFormat();

    // Obtener ruta (.oRwoArranque)
    const ruta = await service.obtenerRuta();
    this.oRwoArranque = ruta;

    // ── Dibujar geometría de arranque en azul (3px) ──────────────────────────
    // Magik: dibuja_geometria_en_viewport(window, .oRwoArranque, vpName, _unset,
    //         _true, :route, :linea, :blue, 3, _false, "", 0, _true, :blue, :spec_id, 8)
    routeSource.clear();
    const rutaOl = format.readFeature(ruta, {
      dataProjection:    'EPSG:4326',
      featureProjection: 'EPSG:3857',
    }) as OlFeature;
    rutaOl.setStyle(new Style({
      stroke: new Stroke({ color: '#0000cc', width: 3 }),
    }));
    routeSource.addFeature(rutaOl);

    // ── Buffer de 500 m alrededor de la ruta ─────────────────────────────────
    // Magik: dibuja_contenido_en_buffer(..., .oRwoArranque.route, _true, 500000, ...)
    const bufferZone = turf.buffer(ruta, BUFFER_KM, { units: 'kilometers' });
    if (!bufferZone) return { featuresDrawn: 0 };

    // ── Iterar LoLista_Geometrias y pintar features dentro del buffer ─────────
    // Magik: _for LoRegistro _over LoLista_Geometrias.elements() _loop
    //          LdsDataSet << LoRegistro.perform(:oDataset)
    //          LdscTabla  << LoRegistro.perform(:oTabla)
    //          LdsrCampoG << LoRegistro.perform(:oTipo_geom)
    //          _self.dibuja_contenido_en_buffer(window, vpName, route, _true, 500000, ...)
    let totalDrawn = 0;

    for (const item of LISTA_GEOMETRIAS) {
      const fc     = await service.obtenerFeatures(item.dataset, item.tabla, item.campoGeom);
      const source = layerSources[item.tabla];
      if (!source) continue;
      source.clear();

      const color = COLORES[item.tabla] ?? { fill: 'rgba(100,100,100,0.3)', stroke: '#555' };

      for (const feat of fc.features) {
        // Filtrar por intersección con el buffer de la ruta
        let dentroBuffer = false;
        try {
          dentroBuffer = !turf.booleanDisjoint(feat as unknown as turf.Feature, bufferZone);
        } catch {
          continue;
        }
        if (!dentroBuffer) continue;

        const olFeat = format.readFeature(feat, {
          dataProjection:    'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }) as OlFeature;
        olFeat.setStyle(new Style({
          fill:   new Fill({ color: color.fill }),
          stroke: new Stroke({ color: color.stroke, width: 1 }),
        }));
        source.addFeature(olFeat);
        totalDrawn++;
      }
    }

    return { featuresDrawn: totalDrawn };
  }

  // ── draw_content_on ──────────────────────────────────────────────────────────
  // Magik: _if _self.Dibuja_Calles? = "Si" _then _self.Dibuja_Corte(window)
  // Evento que se dispara al refrescar la vista del viewport.
  async drawContentOn(
    routeSource:  VectorSource,
    layerSources: Record<string, VectorSource>,
    service:      CorteGeograficoService,
  ): Promise<{ featuresDrawn: number } | null> {
    if (this.dibujaCalles === 'Si') {
      return this.dibujaCorte(routeSource, layerSources, service);
    }
    return null;
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

export function CorteGeograficoUI({
  service = mockCorteGeograficoService,
}: {
  service?: CorteGeograficoService;
}) {
  const mapDivRef   = useRef<HTMLDivElement>(null);
  const olMapRef    = useRef<OlMap | null>(null);

  // Una VectorSource por capa (equivale a un viewport layer en SW)
  const routeSource = useRef(new VectorSource());
  const layerSources = useRef<Record<string, VectorSource>>({
    'colonia':          new VectorSource(),
    'user!_lote':       new VectorSource(),
    'user!_distrito':   new VectorSource(),
  });

  const [dibujaCalles, setDibujaCalles] = useState<'Si' | 'No'>('Si');
  const [loading,      setLoading]      = useState(false);
  const [stats,        setStats]        = useState<{ featuresDrawn: number } | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  // ── Inicializar OL Map ────────────────────────────────────────────────────────
  // Equivale a: viewport_layout.new_with(:bounds, bounding_box.new(200,200,1500,1500))
  // + LoViewMapperPlugin.map_viewport_on_map_view(vp, mapView, mapView.current_view_bounds)
  useEffect(() => {
    if (!mapDivRef.current || olMapRef.current) return;

    const map = new OlMap({
      target: mapDivRef.current,
      view: new View({
        // LoMapView.current_view_bounds → centrado en área de la ruta mock
        center: fromLonLat([-99.14, 19.484]),
        zoom:   14,
      }),
      layers: [
        // Orden: capas base → ruta encima (igual que en el viewport SW)
        new VectorLayer({ source: layerSources.current['colonia'] }),
        new VectorLayer({ source: layerSources.current['user!_lote'] }),
        new VectorLayer({ source: layerSources.current['user!_distrito'] }),
        new VectorLayer({ source: routeSource.current }),
      ],
    });

    olMapRef.current = map;
    return () => { map.dispose(); olMapRef.current = null; };
  }, []);

  const ejecutar = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      const corte = new CCorteGeografico();
      corte.setDibujaCalles(dibujaCalles);

      const result = await corte.drawContentOn(
        routeSource.current,
        layerSources.current,
        service,
      );

      if (result !== null) {
        setStats(result);
        // Ajustar zoom al extent de la ruta
        const ruta = await service.obtenerRuta();
        const [minX, minY, maxX, maxY] = turf.bbox(ruta);
        olMapRef.current?.getView().fit(
          [
            ...fromLonLat([minX, minY]),
            ...fromLonLat([maxX, maxY]),
          ] as [number, number, number, number],
          { padding: [40, 40, 40, 40] },
        );
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.h3}>c_Corte_Geografico</h3>

      {/* Atributo Dibuja_Calles? — equivale al layout attribute definido en defined_attributes */}
      <div style={s.controls}>
        <label style={s.lbl}>Dibuja_Calles?</label>
        <select
          style={s.sel}
          value={dibujaCalles}
          onChange={e => setDibujaCalles(e.target.value as 'Si' | 'No')}
        >
          {(['No', 'Si'] as const).map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <button style={s.btn} onClick={ejecutar} disabled={loading}>
          {loading ? 'Dibujando…' : 'Dibujar Corte (draw_content_on)'}
        </button>
      </div>

      {error && <p style={s.err}>{error}</p>}

      {/* Viewport OL — equivale al viewport_layout con bounding_box.new(200,200,1500,1500) */}
      <div ref={mapDivRef} style={s.mapDiv} />

      {/* Leyenda de capas */}
      <div style={s.legend}>
        {LISTA_GEOMETRIAS.map(item => {
          const c = COLORES[item.tabla];
          return (
            <div key={item.tabla} style={s.legendRow}>
              <div style={{
                ...s.swatch,
                background: c.fill,
                border: `2px solid ${c.stroke}`,
              }} />
              <span style={{ fontSize: 11 }}>{c.label} — <code>{item.campoGeom}</code></span>
            </div>
          );
        })}
        <div style={s.legendRow}>
          <div style={{ ...s.swatch, background: '#0000cc', height: 3, borderRadius: 0 }} />
          <span style={{ fontSize: 11 }}>Ruta de arranque (azul · 3 px)</span>
        </div>
      </div>

      {/* Resultado */}
      {stats !== null && (
        <div style={s.stats}>
          {dibujaCalles === 'Si'
            ? `✓ ${stats.featuresDrawn} features dentro del buffer de ${BUFFER_KM} km.`
            : 'Dibuja_Calles? = "No" — draw_content_on omitió el corte.'}
        </div>
      )}

      <p style={s.note}>
        Buffer: {BUFFER_KM} km ≈ 500 m (Magik: 500 000 unidades de mapa)
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap     : { fontFamily: 'sans-serif', fontSize: 13 },
  h3       : { margin: '0 0 12px', fontSize: 14, fontWeight: 'bold' },
  controls : { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  lbl      : { color: '#555' },
  sel      : { padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 3 },
  btn      : { padding: '5px 16px', background: '#2E4057', color: '#fff',
               border: 'none', borderRadius: 4, cursor: 'pointer' },
  err      : { color: '#c00', fontSize: 12 },
  mapDiv   : { width: '100%', height: 380, border: '1px solid #ccc',
               borderRadius: 4, marginBottom: 12 },
  legend   : { display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 10 },
  legendRow: { display: 'flex', alignItems: 'center', gap: 6 },
  swatch   : { width: 18, height: 14, borderRadius: 2, flexShrink: 0 },
  stats    : { padding: '6px 12px', background: '#eef6ee', borderRadius: 4,
               color: '#1a5c1a', fontWeight: 'bold', marginBottom: 8 },
  note     : { fontSize: 11, color: '#888', margin: 0 },
};

export default CorteGeograficoUI;
