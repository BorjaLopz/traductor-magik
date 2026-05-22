/**
 * Mock de GisService para desarrollo y testing local.
 * Sustituye las llamadas reales a smallworld_product / mit_manager.
 *
 * Datos de prueba basados en el dominio real de SIGC11:
 *   - Ruta de cobre activa con 2 distritos ya asignados
 *   - 5 distritos disponibles (cajas) con distintos estados
 *   - 1 ruta GeoJSON de prueba para nearest_structure_route
 */

import * as turf from '@turf/turf';
import type { Coordinate } from 'ol/coordinate';
import type {
  Distrito,
  EstructuraCercana,
  GisService,
  RutaCo,
} from './ArbolDistritosParaRuta';

// ── Datos de prueba ──────────────────────────────────────────────────────────

const RUTA_ACTIVA: RutaCo = {
  id    : 'RC-001',
  numero: 'RC-2024-001',
  mitTerminalEnclosures: [],  // se puebla más abajo
};

const DISTRITOS: Distrito[] = [
  {
    id                : 'D-01',
    constructionStatus: 'Existing',
    nombreDistrito    : 'Distrito Norte',
    location          : [-3.703, 40.416],
    sourceCollection  : 'mit_terminal_enclosure',
  },
  {
    id                : 'D-02',
    constructionStatus: 'Existing',
    nombreDistrito    : 'Distrito Sur',
    rutaCo            : RUTA_ACTIVA,   // ya asignado a la ruta
    location          : [-3.709, 40.410],
    sourceCollection  : 'mit_terminal_enclosure',
  },
  {
    id                : 'D-03',
    constructionStatus: 'Proposed',
    nombreDistrito    : 'Distrito Centro',
    location          : [-3.700, 40.420],
    sourceCollection  : 'mit_terminal_enclosure',
  },
  {
    id                : 'D-04',
    constructionStatus: 'Existing',
    nombreDistrito    : 'Registro Tablero A',
    location          : [-3.715, 40.408],
    sourceCollection  : 'user!_registro_tablero',
  },
  {
    id                : 'D-05',
    constructionStatus: 'Proposed',
    nombreDistrito    : 'Distrito Oeste',
    location          : [-3.720, 40.415],
    sourceCollection  : 'mit_terminal_enclosure',
  },
];

// D-01 y D-02 ya en la ruta
RUTA_ACTIVA.mitTerminalEnclosures.push(DISTRITOS[0], DISTRITOS[1]);

// Ruta GeoJSON de prueba (underground_route ficticia)
const ROUTE_FEATURES = turf.featureCollection([
  turf.lineString(
    [[-3.700, 40.400], [-3.710, 40.420], [-3.720, 40.430]],
    { id: 'R-001', constructionStatus: 'Existing', nombreDistrito: '', sourceCollection: 'underground_route' },
  ),
  turf.lineString(
    [[-3.690, 40.410], [-3.705, 40.425]],
    { id: 'R-002', constructionStatus: 'Existing', nombreDistrito: '', sourceCollection: 'aerial_route' },
  ),
]);

// ── Implementación del mock ──────────────────────────────────────────────────

export const mockGisService: GisService = {

  getCurrentRuta: async (): Promise<RutaCo | null> => {
    // Magik: l_ed.current_object → devuelve la ruta activa del editor
    await delay(200);
    return RUTA_ACTIVA;
  },

  getCurrentTrailFirstCoord: async (): Promise<Coordinate | null> => {
    // Magik: l_mapa.current_trail.first_coord → primera coordenada del trazo activo
    await delay(100);
    return [-3.705, 40.415];  // coordenada de prueba en Madrid
  },

  getRouteFeatures: async (): Promise<turf.FeatureCollection<turf.LineString>> => {
    // Magik: mit_manager.modelit_dataset.collections[underground_route / aerial_route]
    await delay(150);
    return ROUTE_FEATURES as turf.FeatureCollection<turf.LineString>;
  },

  getCajasYCentral: async (
    _e: EstructuraCercana,
  ): Promise<{ cajas: Distrito[]; central: Distrito[] }> => {
    // Magik: user!_ruta_co_editor_plugin.get_cajas_y_central(oSeleccion)
    await delay(300);
    return {
      cajas  : DISTRITOS.slice(0, 4),  // D-01 a D-04 conectados
      central: [],
    };
  },

  getCurrentMapSelection: async (): Promise<Distrito | null> => {
    // Magik: l_mapa.current_selection — simula selección del distrito D-05
    await delay(100);
    return DISTRITOS[4];  // Distrito Oeste (no asignado)
  },

  saveRoute: async (ruta: RutaCo): Promise<void> => {
    // Magik: l_ed.action(:update).execute_action()
    await delay(400);
    console.log('[MockGisService] saveRoute →', ruta.numero,
      '| enclosures:', ruta.mitTerminalEnclosures.map(d => d.nombreDistrito));
  },

  highlightFeature: (distrito: Distrito): void => {
    // Magik: LoPaf.manager.highlight_rwo(rwo)
    console.log('[MockGisService] highlightFeature →', distrito.nombreDistrito, distrito.location);
  },
};

// ── Helper ───────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
