// Source: adiciones_layout/source/c_sectores.magik
//
// Lógica de "armado de sectores": dada una colección de segmentos sueltos
// (sector_rope), une los extremos coincidentes en cadenas continuas y
// devuelve un sector_rope con sectores ya encadenados.
//
// Cada "sector" original equivale a una polilínea (Coordinate[]); el
// resultado mantiene la misma forma pero agrupa segmentos consecutivos.

export type Coordinate = readonly [number, number];
export type Sector = Coordinate[];          // polilínea (lista de coordenadas)
export type SectorRope = Sector[];

function eq(a: Coordinate | undefined, b: Coordinate | undefined): boolean {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function first(s: Sector): Coordinate | undefined { return s[0]; }
function last (s: Sector): Coordinate | undefined { return s[s.length - 1]; }

// Magik: c_sectores.ordenamiento(RoSecRope, RoSector_a)
//   - Si RoSector_a está vacío → adopta el primer sector y lo elimina del rope
//   - Si no, busca sectores cuyo extremo coincida con un extremo de RoSector_a
//     y los empalma (add_all_first / add_all_last)
//
// Muta RoSecRope y RoSector_a in-place (igual que el original).
export function ordenamiento(roSecRope: SectorRope, roSectorA: Sector): void {
  // Snapshot del orden inicial — el original itera con elements() y muta el rope.
  const initial = roSecRope.slice();

  for (const loSecRopeIt of initial) {
    if (roSectorA.length === 0) {
      // Adoptar todas las coordenadas del primer sector
      for (const pnt of loSecRopeIt) roSectorA.push(pnt);
      removeFirst(roSecRope, loSecRopeIt);
      continue;
    }

    // Intentar empalmar
    if (eq(last(loSecRopeIt), first(roSectorA))) {
      // add_all_first: prepende loSecRopeIt (sin duplicar la coord común)
      const copia = loSecRopeIt.slice(0, -1);
      roSectorA.splice(0, 0, ...copia);
      removeFirst(roSecRope, loSecRopeIt);
    } else if (eq(first(loSecRopeIt), last(roSectorA))) {
      // add_all_last: añade loSecRopeIt al final (sin duplicar la coord común)
      const copia = loSecRopeIt.slice(1);
      roSectorA.push(...copia);
      removeFirst(roSecRope, loSecRopeIt);
    }
    // Resto de casos (coincidencias en first/first o last/last): el original
    // hace _continue sin tocar nada — se respeta.
  }
}

function removeFirst<T>(arr: T[], target: T): void {
  const i = arr.indexOf(target);
  if (i >= 0) arr.splice(i, 1);
}

// Magik: c_sectores.arma_sector(LoTCanaliz)
//   Loop: si el rope quedó vacío → guarda el sector actual y termina.
//   Si el tamaño no cambió respecto a la última iteración (estancado) →
//     guarda el sector actual y empieza uno nuevo.
//   Si el tamaño bajó → sigue empalmando en el mismo sector.
export function armaSector(loTCanaliz: SectorRope): SectorRope {
  const work = loTCanaliz.map(s => s.slice());   // mutable copy
  const out: SectorRope = [];
  let loSectorA: Sector = [];
  let loTfin = -1;

  // Guard de loop infinito (sanity check)
  for (let safety = 0; safety < 100000; safety++) {
    const loTini = work.length;

    if (loTini === 0) {
      out.push(loSectorA);
      break;
    }

    if (loTini === loTfin) {
      // No avanzamos: cerrar cadena y arrancar otra
      out.push(loSectorA);
      loSectorA = [];
      ordenamiento(work, loSectorA);
    } else {
      ordenamiento(work, loSectorA);
    }

    loTfin = work.length;
  }

  return out;
}

// =============================================================================
// CLASE
// =============================================================================

export interface MapTrail {
  // Magik: map.set_trail_from_geometry(geometry)
  setTrailFromGeometry(buffer: Buffer2D): void;
  // Magik: LoMapa.world — referencia abstracta
  world: string;
}

export interface Buffer2D {
  geometry: Sector;
  radius:   number;
  // Magik: LoBuffer.world << LoMapa.world
  world?:   string;
}

// Magik: sector.buffer(radius, :circular)
export function bufferOf(geometry: Sector, radius: number): Buffer2D {
  return { geometry, radius };
}

export class CSectores {
  static readonly activatePropertiesDialogOnInsert: boolean = false;
  static readonly allowedOnMenu: boolean = false;

  app:      string = 'pni_application';
  vpNombre: string | undefined = undefined;

  // Magik: dibuja_trazo(LoSec_Rope, LoRadio)
  dibujaTrazo(loSecRope: SectorRope, loRadio: number, mapTrail: MapTrail): Buffer2D {
    const sectores = armaSector(loSecRope);
    // El original toma el resultado completo, pero buffer requiere un
    // sector. Tomamos la primera cadena (matches LoSector_aux del original).
    const primer = sectores[0] ?? [];
    const buffer = bufferOf(primer, loRadio);
    buffer.world = mapTrail.world;
    mapTrail.setTrailFromGeometry(buffer);
    return buffer;
  }

  // Re-expone funciones puras para tests / showcase
  armaSector(rope: SectorRope): SectorRope { return armaSector(rope); }
  ordenamiento(rope: SectorRope, sector: Sector): void { ordenamiento(rope, sector); }
}
