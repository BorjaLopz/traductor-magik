/**
 * Migración de: c_seccionamiento.magik
 * Clase Magik:  c_seccionamiento
 *
 * Algoritmo de particionado espacial recursivo para layouts GIS.
 * Dado un sector (LineString), encuentra el número mínimo de módulos
 * (viewports) necesarios para contenerlo, calcula su bounding box rotada
 * y repite sobre el tramo restante.
 *
 * Dependencias espaciales:
 *   Turf.js  → bboxPolygon, transformRotate, booleanWithin, booleanIntersects
 *   OpenLayers → test_vista (dibuja geometría en el mapa)
 *
 * NOTA DE PROYECCIÓN:
 *   Magik trabaja en coordenadas proyectadas (cm / m locales).
 *   Las funciones geométricas aquí usan aritmética plana (no esférica).
 *   Si los datos están en WGS84 lon/lat, hay que transformar primero.
 */

import * as turf from '@turf/turf';
import OLMap from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import OLFeature from 'ol/Feature';
import { LineString as OLLineString } from 'ol/geom';
import { fromLonLat } from 'ol/proj';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas [x, y] en la proyección nativa del dataset. */
export type Coord2D = [number, number];

/** Resultado almacenado por do_seccionamiento en collVistas.
 *  Magik: .collVistas.add({LoArea, LoGeom1, LfAngulo, LnModulosConsiderados}) */
export interface Vista {
  area   : turf.Feature<turf.Polygon>;      // bounding box del viewport (rotada)
  geom   : turf.Feature<turf.LineString>;   // línea ajustada del sector
  angulo : number;                           // ángulo en RADIANES
  modulos: number;                           // módulos considerados
}

// =============================================================================
// HELPERS GEOMÉTRICOS (coordenadas proyectadas — aritmética plana)
// Magik usa métodos built-in del framework (line_length, cut_to_length, etc.)
// Aquí se reimplementan como funciones puras.
// =============================================================================

/** Magik: geometry.line_length → longitud acumulada de una LineString. */
function lineLength(line: turf.Feature<turf.LineString>): number {
  const coords = turf.getCoords(line);
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i][0] - coords[i - 1][0];
    const dy = coords[i][1] - coords[i - 1][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/** Magik: geometry.cut_to_length(length) → [part1, part2]
 *  Divide la línea en el punto exacto donde se ha recorrido `length` unidades.
 *  Devuelve [part1, null] si length >= longitud total. */
function cutToLength(
  line  : turf.Feature<turf.LineString>,
  length: number,
): [turf.Feature<turf.LineString>, turf.Feature<turf.LineString> | null] {
  const coords = turf.getCoords(line);
  const total  = lineLength(line);

  if (length >= total) return [line, null];

  let accumulated = 0;
  for (let i = 1; i < coords.length; i++) {
    const dx     = coords[i][0] - coords[i - 1][0];
    const dy     = coords[i][1] - coords[i - 1][1];
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (accumulated + segLen >= length) {
      const t      = (length - accumulated) / segLen;
      const split  : Coord2D = [
        coords[i - 1][0] + t * dx,
        coords[i - 1][1] + t * dy,
      ];
      const part1 = turf.lineString([...coords.slice(0, i), split]);
      const part2 = turf.lineString([split, ...coords.slice(i)]);
      return [part1, part2];
    }
    accumulated += segLen;
  }
  return [line, null];
}

/** Magik: sector_rope.mid_point → punto medio a lo largo de la línea. */
function midPointAlongLine(line: turf.Feature<turf.LineString>): Coord2D {
  const half    = lineLength(line) / 2;
  const [part1] = cutToLength(line, half);
  const coords  = turf.getCoords(part1);
  return coords[coords.length - 1] as Coord2D;
}

/** Magik: sector.new(first, last) → LineString con sólo el primer y último punto. */
function sectorFromEndpoints(line: turf.Feature<turf.LineString>): turf.Feature<turf.LineString> {
  const coords = turf.getCoords(line);
  return turf.lineString([coords[0], coords[coords.length - 1]]);
}

/** Magik: sector_rope.angle_at_coordinate() → ángulo en radianes del tramo final.
 *  Para una línea recta (first→last) es simplemente atan2(dy, dx). */
function angleAtEndpoint(line: turf.Feature<turf.LineString>): number {
  const coords = turf.getCoords(line);
  const n      = coords.length;
  if (n < 2) return 0;
  const dx = coords[n - 1][0] - coords[n - 2][0];
  const dy = coords[n - 1][1] - coords[n - 2][1];
  return Math.atan2(dy, dx);                            // radianes
}

/** Magik: bounding_box rotada.
 *  Crea un rectángulo de (w × h) centrado en `centro`, rotado `angleDeg` grados.
 *  Equivale a bounding_box.new + transform.rotate_about. */
function createRotatedRect(
  w       : number,
  h       : number,
  centro  : Coord2D,
  angleDeg: number,
): turf.Feature<turf.Polygon> {
  const [cx, cy] = centro;
  const hw = w / 2;
  const hh = h / 2;

  // Vértices del rectángulo SIN rotar (centrado en origen, luego trasladado)
  const corners: Coord2D[] = [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
    [cx - hw, cy - hh],  // cerrar polígono
  ];

  // Rotar cada vértice alrededor del centro (rotación 2D plana)
  const rad    = angleDeg * (Math.PI / 180);
  const cosA   = Math.cos(rad);
  const sinA   = Math.sin(rad);
  const rotated: Coord2D[] = corners.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * cosA - dy * sinA, cy + dx * sinA + dy * cosA];
  });

  return turf.polygon([rotated]);
}

/** Magik: geometry.sectors.within?(area) → la LineString está completamente dentro del polígono. */
function lineWithinPolygon(
  line: turf.Feature<turf.LineString>,
  poly: turf.Feature<turf.Polygon>,
): boolean {
  return turf.booleanWithin(line, poly);
}

/** Magik: geometry.overlaps?(area) → la línea intersecta pero NO está contenida en el área.
 *  En el algoritmo Magik significa "la geometría sobresale del área → hay que recortar". */
function lineOverlapsPolygon(
  line: turf.Feature<turf.LineString>,
  poly: turf.Feature<turf.Polygon>,
): boolean {
  return !turf.booleanWithin(line, poly) && turf.booleanIntersects(line, poly);
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class Seccionamiento {

  // Magik: {:oGeometria, _unset, :writable, :private}
  #oGeometria   : turf.Feature<turf.LineString> | null = null;

  // Magik: {:nEscala, 0, :writable, :public}
  nEscala        : number = 0;

  // Magik: {:collVistas, rope.new(), :readable, :private}
  #collVistas   : Vista[] = [];                          // rope.new()

  // Magik: {:nMinModulos, :nMaxModulos, :nDefModAncho, :nDefModAlto}
  nMinModulos   : number = 0;
  nMaxModulos   : number = 0;
  nDefModAncho  : number = 0.0;                          // en centímetros
  nDefModAlto   : number = 0.0;                          // en centímetros

  // Referencia al mapa OL (para test_vista)
  #map          : OLMap | null = null;
  #trailSource  : VectorSource = new VectorSource();

  // ---------------------------------------------------------------------------
  // new() + init()
  //
  // Magik:
  //   _method c_seccionamiento.new(_optional PnEscala, ...)
  //     >>_clone.init(PnEscala.default(0), ...)
  //   _endmethod
  //
  //   _method c_seccionamiento.init(...)
  //     .nEscala << PnEscala
  //     .collVistas << rope.new()
  //     ...
  //     >>_self
  //   _endmethod
  //
  // _clone.init → constructor de clase con parámetros opcionales
  // rope.new()  → []
  // .default(0) → ?? 0
  // ---------------------------------------------------------------------------

  constructor(
    PnEscala      : number = 0,
    PnMinModulos  : number = 0,
    PnMaxModulos  : number = 0,
    PDefModAncho  : number = 0.0,
    PDefModAlto   : number = 0.0,
  ) {
    this.nEscala      = PnEscala;
    this.#collVistas  = [];                              // rope.new()
    this.nMinModulos  = PnMinModulos;
    this.nMaxModulos  = PnMaxModulos;
    this.nDefModAncho = PDefModAncho;
    this.nDefModAlto  = PDefModAlto;
  }

  setMap(map: OLMap): void {
    this.#map = map;
    // Capa de trail para test_vista
    const layer = new VectorLayer({ source: this.#trailSource });
    map.addLayer(layer);
  }

  // ---------------------------------------------------------------------------
  // get_geometria / set_geometria
  //
  // Magik:
  //   _method c_seccionamiento.get_geometria >> .oGeometria _endmethod
  //   _method c_seccionamiento.set_geometria << PoGeometria .oGeometria << PoGeometria _endmethod
  // ---------------------------------------------------------------------------

  get geometria(): turf.Feature<turf.LineString> | null { return this.#oGeometria; }
  set geometria(v: turf.Feature<turf.LineString> | null) { this.#oGeometria = v; }

  // ---------------------------------------------------------------------------
  // get_vistas()
  //
  // Magik: >> .collVistas
  // ---------------------------------------------------------------------------

  get vistas(): readonly Vista[] { return this.#collVistas; }

  // ---------------------------------------------------------------------------
  // get_area(PnModulos, PoCentro?, PfAngle?)
  //
  // Magik:
  //   LoArea << bounding_box.new(0,0, PnModulos*.nDefModAncho*.nEscala, .nDefModAlto*.nEscala)
  //   LoArea.bounds.centre << PoCentro.default(LoArea.bounds.centre)
  //   LoArea << LoArea.transformed(transform.new().rotate_about(PoCentro, PfAngle.degrees_to_radians))
  //
  // bounding_box.new + rotate_about → createRotatedRect (helper arriba)
  // PfAngle en GRADOS (el llamador convierte radianes→grados antes de pasar)
  // ---------------------------------------------------------------------------

  getArea(
    PnModulos: number,
    PoCentro ?: Coord2D,
    PfAngle  ?: number,   // grados
  ): turf.Feature<turf.Polygon> {
    const w      = PnModulos * this.nDefModAncho * this.nEscala;
    const h      = this.nDefModAlto * this.nEscala;
    const centro = PoCentro ?? [0, 0] as Coord2D;
    const angle  = PfAngle  ?? 0;

    return createRotatedRect(w, h, centro, angle);       // bounding_box + transform.rotate_about
  }

  // ---------------------------------------------------------------------------
  // get_area_reducida(PoGeometria, PoCentro, PfAngulo, PnModulos)
  //
  // Magik (recursivo):
  //   LoArea << _self.get_area(PnModulos, PoCentro, PfAngulo.radians_to_degrees)
  //   _if PoGeometria.sectors.within?(LoArea)
  //   _then
  //     (LoArea, LnModulos) << _self.get_area_reducida(..., PnModulos-1)  # reducir
  //   _else
  //     LoArea << _self.get_area(LnModulos+1, ...)                        # ampliar 1 módulo
  //     LnModulos << LnModulos+1
  //   _endif
  //   _return (LoArea, LnModulos)
  //
  // PfAngulo en RADIANES internamente; se convierte a grados para getArea.
  // ---------------------------------------------------------------------------

  getAreaReducida(
    PoGeometria: turf.Feature<turf.LineString>,
    PoCentro   : Coord2D,
    PfAngulo   : number,   // radianes
    PnModulos  : number,
  ): { area: turf.Feature<turf.Polygon>; modulos: number } {
    let modulos = PnModulos;
    const angleDeg = PfAngulo * (180 / Math.PI);         // radians_to_degrees

    let area = this.getArea(modulos, PoCentro, angleDeg);

    if (lineWithinPolygon(PoGeometria, area)) {          // .sectors.within?(LoArea)
      // La geometría cabe → intentar con un módulo menos (recursión)
      if (modulos > this.nMinModulos) {
        const reduced = this.getAreaReducida(PoGeometria, PoCentro, PfAngulo, modulos - 1);
        area    = reduced.area;
        modulos = reduced.modulos;
      }
    } else {
      // No cabe → subir un módulo
      modulos += 1;
      area = this.getArea(modulos, PoCentro, angleDeg);  // get_area(LnModulos+1, ...)
    }

    return { area, modulos };
  }

  // ---------------------------------------------------------------------------
  // get_linea_maxima_ajustada(PoGeometria, PnModulos)
  //
  // Magik (recursivo):
  //   LoLineaSector << sector.new(first_coord, last_coord)   # línea directa extremos
  //   LfLongitud    << LoLineaSector.line_length
  //   LfAngulo      << angle_at_coordinate(last_coord)       # ángulo en radianes
  //   LoCentro      << PoGeometria.as_sector_rope().mid_point
  //   LoArea        << _self.get_area(LnModulos, LoCentro, LfAngulo.radians_to_degrees)
  //
  //   _if PoGeometria.overlaps?(LoArea)  # sobresale → recortar
  //   _then
  //     _if LfLongitud >= .nDefModAncho*.nEscala
  //       (LoGeom1,_) << LoGeometria.cut_to_length(LfLongitud - .nDefModAncho*.nEscala)
  //     _else
  //       (LoGeom1,_) << LoGeometria.cut_to_length(LfLongitud/2)
  //     _endif
  //     (LoGeometria, ...) << _self.get_linea_maxima_ajustada(LoGeom1[1], LnModulos)
  //   _endif
  //   _return (LoGeometria, LoArea, LoCentro, LfAngulo)
  // ---------------------------------------------------------------------------

  getLineaMaximaAjustada(
    PoGeometria: turf.Feature<turf.LineString>,
    PnModulos  : number,
  ): { geom: turf.Feature<turf.LineString>; area: turf.Feature<turf.Polygon>; centro: Coord2D; angulo: number } {

    let geom = PoGeometria;

    // sector.new(first_coord, last_coord) → línea directa entre extremos
    const linea     = sectorFromEndpoints(geom);
    const longitud  = lineLength(linea);                 // line_length
    const angulo    = angleAtEndpoint(linea);            // angle_at_coordinate (radianes)
    const centro    = midPointAlongLine(geom);           // as_sector_rope().mid_point
    const angleDeg  = angulo * (180 / Math.PI);          // radians_to_degrees

    let area = this.getArea(PnModulos, centro, angleDeg);

    if (lineOverlapsPolygon(geom, area)) {               // PoGeometria.overlaps?(LoArea)
      const modWidth = this.nDefModAncho * this.nEscala;

      // Longitud de corte según si la longitud supera o no el ancho de un módulo
      const cutLen  = longitud >= modWidth
        ? longitud - modWidth                            // LfLongitud - .nDefModAncho*.nEscala
        : longitud / 2;                                  // LfLongitud / 2

      const [part1] = cutToLength(geom, cutLen);

      // Recursión sobre la parte recortada
      const sub = this.getLineaMaximaAjustada(part1, PnModulos);
      geom  = sub.geom;
      area  = sub.area;
      return { geom, area, centro: sub.centro, angulo: sub.angulo };
    }

    return { geom, area, centro, angulo };
  }

  // ---------------------------------------------------------------------------
  // do_seccionamiento(PoGeometria)   ← MÉTODO PRINCIPAL (recursivo)
  //
  // Magik:
  //   _if PoGeometria _is _unset _then _return _endif
  //
  //   (LoGeom1, LoArea, LoCentro, LfAngulo) << _self.get_linea_maxima_ajustada(PoGeometria, .nMaxModulos)
  //   (LoArea, LnModulos) << _self.get_area_reducida(LoGeom1, LoCentro, LfAngulo, .nMaxModulos)
  //   .collVistas.add({LoArea, LoGeom1, LfAngulo, LnModulos})
  //
  //   _if LoGeom1.line_length >= PoGeometria.line_length _then _return _endif
  //
  //   (LoGeoms, _) << PoGeometria.cut_to_length(LoGeom1.line_length)
  //   _if LoGeoms[2].line_length > 0 _then _self.do_seccionamiento(LoGeoms[2]) _endif
  // ---------------------------------------------------------------------------

  doSeccionamiento(PoGeometria: turf.Feature<turf.LineString> | null): void {
    if (!PoGeometria) return;                            // _if PoGeometria _is _unset

    // Obtener línea máxima que cabe en nMaxModulos
    const { geom: geom1, area: areaMax, centro, angulo } =
      this.getLineaMaximaAjustada(PoGeometria, this.nMaxModulos);

    // Reducir al mínimo de módulos que todavía contiene la geometría
    const { area, modulos } =
      this.getAreaReducida(geom1, centro, angulo, this.nMaxModulos);

    // Guardar vista: {area, geom, angulo, módulos}  →  .collVistas.add(...)
    this.#collVistas.push({ area, geom: geom1, angulo, modulos });

    const lenGeom1  = lineLength(geom1);
    const lenTotal  = lineLength(PoGeometria);

    if (lenGeom1 >= lenTotal) return;                   // ya cubre todo → fin

    // Cortar la geometría original a partir de donde termina geom1
    const [, rest] = cutToLength(PoGeometria, lenGeom1); // cut_to_length

    if (rest && lineLength(rest) > 0) {
      this.doSeccionamiento(rest);                       // recursión sobre el resto
    }
  }

  // ---------------------------------------------------------------------------
  // test_vista(PoVista, PoConGoto?)
  //
  // Magik:
  //   trilo << map_trail.new(LoCurrentMap)
  //   _for coor _over PoVista.sectors[1].fast_elements() _loop
  //     trilo.add_coordinate(coor)
  //   _endloop
  //   LoCurrentMap.set_trail_from_geometry(trilo)
  //   _if PoConGoto? _then current_map_view.goto(trilo) _endif
  //
  // map_trail → VectorSource con Feature<LineString>
  // current_map_view.goto(trilo) → map.getView().fit(extent)
  // ---------------------------------------------------------------------------

  testVista(
    PoVista    : turf.Feature<turf.LineString> | turf.Feature<turf.Polygon>,
    PoConGoto ?: boolean,
  ): void {
    if (!this.#map) return;

    // Extraer coordenadas — Magik: _for coor _over PoVista.sectors[1]
    let coords: number[][];
    if (PoVista.geometry.type === 'LineString') {
      coords = (PoVista as turf.Feature<turf.LineString>).geometry.coordinates;
    } else {
      coords = (PoVista as turf.Feature<turf.Polygon>).geometry.coordinates[0];
    }

    // map_trail → OL Feature<LineString>
    const olCoords = coords.map(c => fromLonLat(c as [number, number]));
    const trail    = new OLFeature({ geometry: new OLLineString(olCoords) });

    this.#trailSource.clear();
    this.#trailSource.addFeature(trail);                 // set_trail_from_geometry

    if (PoConGoto) {                                     // current_map_view.goto
      const extent = this.#trailSource.getExtent();
      this.#map.getView().fit(extent, { duration: 400, padding: [40, 40, 40, 40] });
    }
  }

  // ---------------------------------------------------------------------------
  // get_seccionamiento() — vacío en Magik original, stub aquí
  // ---------------------------------------------------------------------------

  getSeccionamiento(): Vista[] {
    return [...this.#collVistas];
  }
}

// =============================================================================
// EXPORT POR DEFECTO — para importar como módulo en el proyecto
// =============================================================================

export default Seccionamiento;
