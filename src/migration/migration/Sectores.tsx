/**
 * Migración de: croquis.magik
 * Clase Magik:  c_sectores  —  SIGC11 / aegijon / 2004
 *
 * Clase de layout (viewport_layout_mixin) con dos responsabilidades:
 *   1. Algoritmo de chaining: une segmentos sueltos en cadenas continuas
 *      conectando extremos coincidentes (ordenamiento + armaSector).
 *   2. Visualización: buffer circular sobre la cadena resultante → trail en mapa OL.
 *
 * NOTA DE PROYECCIÓN:
 *   Las coordenadas son planas (proyectadas). turf.buffer espera WGS84.
 *   Si los datos están en UTM/locales, transformar antes de llamar a dibujaTrazo.
 */

import React, { useState } from 'react';
import * as turf from '@turf/turf';
import OLMap from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import OLFeature from 'ol/Feature';
import { LineString as OLLineString, Polygon as OLPolygon } from 'ol/geom';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas [x, y] en proyección nativa del dataset. */
export type Coord2D = [number, number];

// =============================================================================
// INTERFAZ GisService
// Abstrae smallworld_product.pni_application().plugin(:map_plugin).current_map
// =============================================================================

export interface SectoresGisService {
  /** Magik: LoMapa.set_trail_from_geometry(LoBuffer) */
  setTrailFromGeometry(geom: turf.Feature<turf.Polygon | turf.MultiPolygon>): void;
  /** Opcional: ajustar vista al extent del trail */
  fitView?(geom: turf.Feature): void;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Compara dos coordenadas con tolerancia épsilon (evita errores de punto flotante). */
function coordsEqual(a: turf.Position, b: turf.Position, eps = 1e-6): boolean {
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps;
}

// =============================================================================
// ALGORITMO PRINCIPAL — funciones puras
// =============================================================================

/**
 * Magik: c_sectores.ordenamiento(RoSecRope, RoSector_a)
 *
 * Una pasada sobre `rope`: intenta conectar cada segmento al extremo
 * inicial o final de `chain`. Muta ambos argumentos (rope: splice, chain: push/unshift).
 *
 * Casos de conexión (fieles al Magik original):
 *   segFirst == chainLast  → append   (add_all_last)
 *   segLast  == chainFirst → prepend  (add_all_first)
 *   segFirst == chainFirst → skip     (dirección duplicada)
 *   segLast  == chainLast  → skip     (extremo final duplicado)
 *   no coincide            → skip     (segmento no conectado en esta pasada)
 *
 * Si chain está vacía, el primer segmento encontrado la inicializa y se elimina del rope.
 */
export function ordenamiento(
  rope : turf.Position[][],   // RoSecRope — modificado en sitio
  chain: turf.Position[],     // RoSector_a — modificado en sitio
): void {
  let i = 0;
  while (i < rope.length) {
    const seg      = rope[i];
    const segFirst = seg[0];
    const segLast  = seg[seg.length - 1];

    // RoSector_a.first_coord _is _unset → chain vacía: sembrar con este segmento
    if (chain.length === 0) {
      chain.push(...seg);                               // add_last todos los puntos
      rope.splice(i, 1);                               // RoSecRope.remove(LoSecRopeIt)
      continue;                                        // _continue → siguiente iter sin avanzar i
    }

    const chainFirst = chain[0];
    const chainLast  = chain[chain.length - 1];

    if (coordsEqual(segFirst, chainLast)) {
      // LoSecIt.first_coord = RoSector_a.last_coord → add_all_last (append)
      chain.push(...seg.slice(1));                     // evita duplicar el punto compartido
      rope.splice(i, 1);
    } else if (coordsEqual(segLast, chainFirst)) {
      // LoSecIt.last_coord = RoSector_a.first_coord → add_all_first (prepend)
      chain.unshift(...seg.slice(0, -1));              // evita duplicar el punto compartido
      rope.splice(i, 1);
    } else if (coordsEqual(segFirst, chainFirst) || coordsEqual(segLast, chainLast)) {
      // Extremo duplicado — Magik: _continue (skip sin eliminar)
      i++;
    } else {
      // Sin conexión en esta pasada — Magik: _continue
      i++;
    }
  }
}

/**
 * Magik: c_sectores.arma_sector(LoTCanaliz) → LoSectorRope
 *
 * Loop que ejecuta ordenamiento() hasta agotar el rope.
 * Cuando una pasada no reduce el rope (LoTini === LoTfin → sin progreso),
 * finaliza la cadena actual y arranca una nueva (segmentos desconectados).
 *
 * @param tCanaliz  Segmentos de entrada (sector_rope — rope de LineStrings)
 * @returns         Array de LineStrings encadenadas (sector_rope resultante)
 */
export function armaSector(
  tCanaliz: turf.Feature<turf.LineString>[],
): turf.Feature<turf.LineString>[] {
  // Copia del rope como array de coordenadas (se muta en ordenamiento)
  const rope: turf.Position[][] = tCanaliz.map(f => turf.getCoords(f));

  const resultado: turf.Feature<turf.LineString>[] = [];   // LoSectorRope
  let chain: turf.Position[] = [];                          // LoSector_a
  let prevSize: number | undefined = undefined;             // LoTfin (empieza _unset)

  while (true) {
    const currSize = rope.length;                           // LoTini

    if (currSize === 0) {
      // Rope vacío → finalizar cadena actual y salir
      if (chain.length >= 2) {
        resultado.push(turf.lineString(chain));             // LoSectorRope.add_sectors_last
      }
      break;
    }

    if (prevSize !== undefined && currSize === prevSize) {
      // Sin progreso (LoTini === LoTfin) → cerrar cadena + nueva cadena
      if (chain.length >= 2) {
        resultado.push(turf.lineString(chain));             // LoSectorRope.add_sectors_last
      }
      chain = [];                                           // LoSector_a << sector.new()
      ordenamiento(rope, chain);                           // _self.ordenamiento(...)
    } else {
      // Progreso normal → seguir encadenando
      ordenamiento(rope, chain);
    }

    prevSize = rope.length;                                 // LoTfin << LoTCanaliz.size
  }

  return resultado;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSectores {

  // Magik: {:app, smallworld_product.pni_application()}
  // En TS: acceso a mapa delegado en GisService
  readonly #gis: SectoresGisService;

  // Magik: {:vp_nombre, _unset}
  vpNombre: string | null = null;

  // Capa OL para el trail del buffer
  #trailSource: VectorSource = new VectorSource();

  constructor(gisService: SectoresGisService) {
    this.#gis = gisService;
  }

  setMap(map: OLMap): void {
    map.addLayer(new VectorLayer({ source: this.#trailSource }));
  }

  // ---------------------------------------------------------------------------
  // armaSector(tCanaliz)
  // Magik: _self.arma_sector(LoTCanaliz) → LoSectorRope
  //
  // Wrapper del método de instancia → función pura armaSector().
  // ---------------------------------------------------------------------------
  armaSector(
    tCanaliz: turf.Feature<turf.LineString>[],
  ): turf.Feature<turf.LineString>[] {
    return armaSector(tCanaliz);
  }

  // ---------------------------------------------------------------------------
  // dibujaTrazo(secRope, radio)
  // Magik:
  //   LoMapa      << smallworld_product.pni_application().plugin(:map_plugin).current_map
  //   LoSector_aux << _self.arma_sector(LoSec_Rope)
  //   LoBuffer     << LoSector_aux.buffer(LoRadio, :circular)
  //   LoBuffer.world << LoMapa.world
  //   LoMapa.set_trail_from_geometry(LoBuffer)
  //
  // LoBuffer    → turf.buffer (buffer circular)
  // set_trail   → SectoresGisService.setTrailFromGeometry
  // ---------------------------------------------------------------------------
  dibujaTrazo(
    secRope: turf.Feature<turf.LineString>[],
    radio  : number,                          // radio en metros (unidades WGS84)
  ): void {
    const cadenas = this.armaSector(secRope); // _self.arma_sector(LoSec_Rope)

    if (cadenas.length === 0) return;

    // Unir todas las cadenas en un MultiLineString para bufferizar de una vez
    const multi = cadenas.length === 1
      ? cadenas[0]
      : turf.multiLineString(cadenas.map(f => turf.getCoords(f)));

    // LoSector_aux.buffer(LoRadio, :circular) → buffer circular de radio metros
    const buffer = turf.buffer(multi, radio, { units: 'meters' });

    if (!buffer) return;

    // LoMapa.set_trail_from_geometry(LoBuffer) → GisService.setTrailFromGeometry
    this.#gis.setTrailFromGeometry(
      buffer as turf.Feature<turf.Polygon | turf.MultiPolygon>,
    );
    this.#gis.fitView?.(buffer);
  }
}

// =============================================================================
// COMPONENTE REACT  —  demo del algoritmo de chaining
// Muestra segmentos de entrada y cadenas resultantes sin mapa OL.
// =============================================================================

interface Props {
  segmentos?: turf.Feature<turf.LineString>[];   // segmentos de prueba
}

const SEG_DEMO: turf.Feature<turf.LineString>[] = [
  // Tramo A-B
  turf.lineString([[0, 0], [1, 1]]),
  // Tramo C-D (conecta con B)
  turf.lineString([[1, 1], [2, 0]]),
  // Tramo E-F (desconectado)
  turf.lineString([[5, 5], [6, 6]]),
  // Tramo G-E (conecta con E por el extremo final → prepend)
  turf.lineString([[4, 4], [5, 5]]),
  // Tramo D-H (conecta con D=last de cadena 1)
  turf.lineString([[2, 0], [3, 1]]),
];

export function SectoresUI({ segmentos = SEG_DEMO }: Props) {
  const [cadenas, setCadenas] = useState<turf.Feature<turf.LineString>[] | null>(null);

  const ejecutar = () => {
    // Pasar copia para no mutar los datos de demo
    const copia = segmentos.map(f => turf.lineString(turf.getCoords(f)));
    setCadenas(armaSector(copia));
  };

  const fmtCoords = (coords: turf.Position[]) =>
    coords.map(([x, y]) => `(${x},${y})`).join(' → ');

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sectores — Chaining de segmentos</h3>

      <section style={s.block}>
        <strong>Entrada ({segmentos.length} segmentos):</strong>
        <ul style={s.list}>
          {segmentos.map((seg, i) => (
            <li key={i} style={s.item}>
              <code>{fmtCoords(turf.getCoords(seg))}</code>
            </li>
          ))}
        </ul>
      </section>

      <button style={s.btn} onClick={ejecutar}>
        Ejecutar armaSector()
      </button>

      {cadenas && (
        <section style={s.block}>
          <strong>Resultado ({cadenas.length} cadena{cadenas.length !== 1 ? 's' : ''}):</strong>
          <ul style={s.list}>
            {cadenas.map((c, i) => (
              <li key={i} style={{ ...s.item, background: i % 2 === 0 ? '#e8f5e9' : '#e3f2fd' }}>
                <strong>Cadena {i + 1}</strong> ({turf.getCoords(c).length} puntos):{' '}
                <code>{fmtCoords(turf.getCoords(c))}</code>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame : { display: 'flex', flexDirection: 'column', gap: 12, width: 560, border: '1px solid #bbb', borderRadius: 6, padding: 16, fontFamily: 'sans-serif', fontSize: 13 },
  title : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  block : { background: '#fafafa', border: '1px solid #eee', borderRadius: 4, padding: 10 },
  list  : { margin: '6px 0 0', paddingLeft: 20 },
  item  : { margin: '3px 0', padding: '2px 6px', borderRadius: 3 },
  btn   : { alignSelf: 'flex-start', padding: '6px 16px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
};

export default SectoresUI;
