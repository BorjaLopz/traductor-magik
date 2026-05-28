// Source: adiciones_layout/source/planos/c_sello_lista_cables.magik
// Cable list stamp for optical plans. Extends c_base_sello_fibra.
// Three stacked tables: title, column headers, and cable data rows.
// Cable data comes from c_distrito.obten_cables_secundarios_agrupados(DistritoOptico).
// All GIS calls → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface CableItem {
  capacidad: string   // fiber count or capacity label  e.g. "12", "48"
  tipo:      string   // cable type description
  longitud:  number   // length in metres
}

// ─── Table geometry ───────────────────────────────────────────────────────────
//
//  tbl_titulo     : 1 row  × 1 col   — row 20 mm, col 100 mm
//  tbl_subtitulos : 1 row  × 3 cols  — row 20 mm, cols [33, 33, 34] mm
//  tbl_contenido  : N rows × 3 cols  — rows 10 mm, cols [33, 33, 34] mm
//
//  All three share the same column widths for the 3-col sections (total 100 mm).

export const TBL_TITULO      = 'tbl_titulo'      as const
export const TBL_SUBTITULOS  = 'tbl_subtitulos'  as const
export const TBL_CONTENIDO   = 'tbl_contenido'   as const

export const ROW_TITULO     = 20   // mm
export const ROW_SUBTITULOS = 20   // mm
export const ROW_CONTENIDO  = 10   // mm

export const COL_TITULO     = 100  // mm (single column)
export const COL_WIDTHS_3   = [33, 33, 34] as const   // mm — subtítulos + contenido

// Column headers (etiqueta_celdas)
export const SUBTITULO_HEADERS = ['CAPACIDAD', 'TIPO DE CABLE', 'LONGITUD (MTS.)'] as const

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: datos[:longitud].write_string_normal(1) — 1 decimal place, no scientific notation.
export function formatLongitud(value: number): string {
  return value.toFixed(1)
}

// Row count for tbl_contenido: at least 1 even when no cables found.
export function calcTotRenglones(cableCount: number): number {
  return cableCount > 1 ? cableCount : 1
}

// Magik: llena_datos_celdas — _global dato logic.
// The method sets the module-level `dato` whenever a cable length exceeds 1000 m.
// Translated as a pure predicate; callers track the value externally.
export function esLongitudLarga(longitud: number): boolean {
  return longitud > 1000
}

// Total stamp height for a given number of cable rows (mm).
export function alturaTotal(numCables: number): number {
  return ROW_TITULO + ROW_SUBTITULOS + calcTotRenglones(numCables) * ROW_CONTENIDO
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloListaCables extends CBaseSelloFibra {
  // Defined attribute — stored on the layout object, not a slot.
  // Magik: layout_attribute_definition(:DistritoOptico, :integer, allowed_on_properties_page? = false)
  distritoOptico: number | undefined = undefined

  // Magik: configura_tabla — creates three stacked tables. Fase 5.
  override configurarTabla(): void {
    // tbl_titulo:    1×1, row=ROW_TITULO, col=COL_TITULO, origin=o_coord_inicio
    // tbl_subtitulos: 1×3, row=ROW_SUBTITULOS, cols=COL_WIDTHS_3,
    //                 origin.y -= longitud_total_renglones([tbl_titulo])
    // tbl_contenido: N×3, rows=ROW_CONTENIDO, cols=COL_WIDTHS_3,
    //                 N = calcTotRenglones(cables.size)
    //                 cables = c_distrito.obten_cables_secundarios_agrupados(distritoOptico)
    //                 origin.y -= longitud_total_renglones([tbl_titulo, tbl_subtitulos])
  }

  // Magik: etiqueta_celdas — sets title and column header labels.
  override etiquetarCeldas(): void {
    // tbl_titulo(1,1)    = "CANTIDAD DE CABLE A PROYECTAR", size 40
    // tbl_subtitulos(1,1) = "CAPACIDAD ",     size 25, centre_centre, black
    // tbl_subtitulos(1,2) = "TIPO DE CABLE",  size 25, centre_centre, black
    // tbl_subtitulos(1,3) = "LONGITUD (MTS.)",size 25, centre_centre, black
  }

  // Magik: llena_datos_celdas — fills content rows from GIS. Fase 5.
  // Note: sets module-level _global `dato` when longitud > 1000.
  llenarDatosCeldas(): void {
    // cables = c_distrito.obten_cables_secundarios_agrupados(distritoOptico)
    // for each (cont, cable):
    //   tbl_contenido(cont,1) = cable.capacidad
    //   tbl_contenido(cont,2) = cable.tipo
    //   tbl_contenido(cont,3) = formatLongitud(cable.longitud)
    //   if esLongitudLarga(cable.longitud): set global dato = cable.longitud
  }
}
