// Source: adiciones_layout/source/Sellos/c_lista_materiales_esquema.magik
// Material list stamp for schematic plans. Extends c_base_sello_fibra.
// Single slot `tipo` controls which list is shown: network elements or structures.
// Table has dynamic row count based on material count from GIS map view.
// GIS data retrieval (select_from_map, llena_datos_celdas) → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Domain types ─────────────────────────────────────────────────────────────

export type TipoLista = 'red' | 'estructuras'

export interface MaterialItem {
  no:          number
  descripcion: string
  unidad:      string    // "metros" | "pzas" | external_name
  cantidad:    string    // formatted; could be count or measured length
}

// ─── Table geometry ───────────────────────────────────────────────────────────
// tbl_lista_materiales:
//   - All rows:  6 mm tall
//   - Col 1:  6 mm  (No.)
//   - Col 2: 60 mm  (Descripción)
//   - Col 3: 35 mm  (Unidad)
//   - Col 4: 20 mm  (Cantidad)
// Total width: 121 mm

export const TABLE_NAME  = 'tbl_lista_materiales' as const
export const COL_WIDTHS  = [6, 60, 35, 20] as const   // mm, 1-indexed
export const ROW_HEIGHT  = 6                           // mm, all rows

// Row 1 cells have top/right/left borders hidden.
export const HIDDEN_BORDERS_ROW1: [number, number][] = [[1,1],[1,2],[1,3],[1,4]]

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: etiqueta_celdas — title based on tipo
export function titleForTipo(tipo: TipoLista): string {
  return tipo === 'red'
    ? 'LISTA DE MATERIALES DE ELEMENTOS DE RED'
    : 'LISTA DE MATERIALES ESTRUCTURAS'
}

// Magik: keys_Order — natural sort (strings_with_numbers collation).
// Sorts keys so "item10" comes after "item9", not after "item1".
export function keysOrder(keys: string[]): string[] {
  return [...keys].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  )
}

// Magik: llena_datos_celdas key parsing —
//   rpmaterial = Iterkey.write_string.split_by("|")
//   if size > 1: desc = split[2]  else: desc = split[1]
// (Magik split_by is 1-indexed; translated to 0-indexed JS)
export function descFromKey(key: string): string {
  const parts = key.split('|')
  if (parts.length > 2) return parts[2] ?? ''
  if (parts.length > 1) return parts[1] ?? ''
  return key
}

// Magik: material[:cantidad].as_fixed_string(5,2)
// Right-aligned numeric string with 2 decimal places, padded to 5 chars.
export function formatCantidadMetros(value: number): string {
  return value.toFixed(2).padStart(5, ' ')
}

// Resolves unit label based on whether the element has a route geometry.
export function resolveUnidad(isRoute: boolean): string {
  return isRoute ? 'metros' : 'pzas'
}

// Builds material description for sheath elements.
// Magik: IterObject.source_collection.external_name + clase + fiber_quantity
export function buildSheathDesc(externalName: string, clase: string, fiberQty: number): string {
  return `${externalName}${clase} ${fiberQty}`
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CListaMaterialesEsquema extends CBaseSelloFibra {
  tipo: TipoLista = 'red'

  // Magik: new_with(tipo, *args) — factory with tipo preset
  static newWith(tipo: TipoLista): CListaMaterialesEsquema {
    const inst = new CListaMaterialesEsquema()
    inst.tipo  = tipo
    return inst
  }

  // Magik: configura_tabla — creates tbl_lista_materiales with dynamic row count, Fase 5
  override configurarTabla(): void {
    // Dynamic: rows = 2 + ht.size (from obten_lista_materiales)
    // Col widths: [6, 60, 35, 20] mm; all rows 6 mm.
    // Row 1 cells: hides top/right/left borders.
  }

  // Magik: etiqueta_celdas — sets title and column headers
  override etiquetarCeldas(): void {
    // Row 1, col 2: titleForTipo(tipo)
    // Row 2: No | DESCRIPCION | UNIDAD | CANTIDAD
  }

  // Magik: actualiza_datos — refreshes cells and redraws, Fase 5
  actualizarDatos(): void { /* Fase 5 */ }

  // Magik: llena_datos_celdas — fills rows from GIS data, Fase 5
  llenarDatosCeldas(): void {
    // For each key in keysOrder(ht.keys):
    //   - if primary_geometry = :route → unidad="metros", sum measured_length
    //   - else → unidad="pzas", cantidad=values.size
    //   - desc from key.split("|") or source_collection.external_name
  }

  // Magik: obten_lista_materiales → elementos_de_proyecto, Fase 5
  obtenerListaMateriales(): { items: unknown[]; ht: Map<string, unknown[]> } {
    return { items: [], ht: new Map() }
  }

  // Magik: elementos_de_proyecto — dispatches by tipo, flattens ht, Fase 5
  elementosDeProyecto(): { all: unknown[]; ht: Map<string, unknown[]> } {
    return { all: [], ht: new Map() }
  }

  // Magik: select_from_map — GIS: reads selectable geometries from
  // current map view (ace_name must match "*esquema*"), filters PROYECTADO. Fase 5.
  selectFromMap(): { estructuras: Map<string, unknown[]>; elementos: Map<string, unknown[]> } {
    return { estructuras: new Map(), elementos: new Map() }
  }
}
