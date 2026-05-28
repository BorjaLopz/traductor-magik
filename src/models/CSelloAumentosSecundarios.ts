// Source: adiciones_layout/source/Sellos/c_sello_aumentos_secundarios.magik
// Stamp layout_element for "aumento de red secundaria" per district.
// Shows secondary network growth data: existing, projected, long-term, total pairs.
// Extends layout_element (standalone — no CBaseSelloFibra).
// GIS: distrito loaded from landbase, obtener_numero_pares() → Fase 5.

// ─── Domain types ─────────────────────────────────────────────────────────────

// Magik: resp << .distrito.rwo.obtener_numero_pares()
export interface DatosAumento {
  existente:   number   // resp[:existente]   — green
  proyectado:  number   // resp[:proyectado]  — red
  largoPlayzo: number   // resp[:largo_plazo] — orange
}

// ─── Table geometry ───────────────────────────────────────────────────────────
// tbl_aumento:
//   - 5 columns, each 15 mm wide  → total 75 mm
//   - All rows 4 mm tall
//   - 2 rows normally; 3 rows when redDirecta = true
//   - Row 1 when redDirecta: full-width "RED DIRECTA" label (internal right
//     borders hidden via bDibuja_renglones_internos_dcha?(1, false))
//   - Col headers (fila_tit): DTO. | CONECT. | AUMENTO | L. PLAZO | TOTAL
//   - Col values  (fila_valor): nombre | existente | proyectado | largoPlayzo | total

export const NUM_COLS   = 5
export const COL_WIDTH  = 15   // mm, all 5 columns equal
export const ROW_HEIGHT = 4    // mm, all rows equal
export const TABLE_NAME = 'tbl_aumento' as const
export const TOTAL_WIDTH = NUM_COLS * COL_WIDTH   // 75 mm

export const COL_HEADERS = ['DTO.', 'CONECT.', 'AUMENTO', 'L. PLAZO', 'TOTAL'] as const

// Color coding for value cells (matches llena_celdas)
export const CELL_COLORS = {
  existente:   'green',
  proyectado:  'red',
  largoPlayzo: 'orange',
  total:       'black',
} as const

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: llena_celdas — total = proyectado + existente + largo_plazo
export function calcularTotal(datos: DatosAumento): number {
  return datos.proyectado + datos.existente + datos.largoPlayzo
}

// Row count depends on whether district has direct network.
export function numFilas(redDirecta: boolean): number {
  return redDirecta ? 3 : 2
}

// Which rows hold titles and values — shifts down by 1 when RED DIRECTA header present.
export interface FilaLayout {
  filaTitulo: number  // 1-indexed; row with column headers
  filaValor:  number  // 1-indexed; row with actual data values
}

export function filaLayout(redDirecta: boolean): FilaLayout {
  return redDirecta
    ? { filaTitulo: 2, filaValor: 3 }
    : { filaTitulo: 1, filaValor: 2 }
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloAumentosSecundarios {
  static readonly ALLOWED_ON_MENU = false

  // Slots
  distrito:      unknown = undefined   // GIS geometry / rwo — Fase 5
  oCoordOrigen:  [number, number] = [0, 0]
  oWindow:       unknown = undefined
  oTablas:       unknown = undefined

  // Defined attribute (layout_attribute_definition) — persisted on the layout object
  idDistrito: string | undefined = undefined

  // Magik: post_initialisation → inicializa(coordinate.new(0,0))
  postInitialisation(): void {
    this.inicializa([0, 0])
  }

  // Magik: inicializa — loads distrito from GIS, creates tables, fills cells. Fase 5.
  inicializa(_coord: [number, number] = [0, 0]): void {
    // 1. set fill colour white
    // 2. set oCoordOrigen = coord
    // 3. oTablas = new c_tablas(self)
    // 4. load distrito from landbase via id_distrito OR from .distrito slot
    // 5. red_directa? = .distrito.rwo.es_red_directa?
    // 6. crearSelloSecundario(coord, red_directa?)
    // 7. bounds = oTablas.area_total()
    // 8. llenarCeldas(red_directa?)
  }

  // Magik: crea_sello_secundario — builds tbl_aumento geometry. Fase 5.
  crearSelloSecundario(_coord: [number, number], _redDirecta: boolean): void {
    // rows = numFilas(redDirecta)
    // 5 cols × 15 mm; all rows 4 mm
    // if redDirecta: bDibuja_renglones_internos_dcha?(1, false)
    //   → row 1 internal vertical borders hidden = full-width "RED DIRECTA" row
  }

  // Magik: llena_celdas — assigns text and colours to cells. Fase 5.
  llenarCeldas(_redDirecta: boolean): void {
    // if redDirecta: cell(1,3) = "RED DIRECTA" size 30
    // fila_tit/fila_valor from filaLayout(redDirecta)
    // headers: DTO. | CONECT. | AUMENTO | L. PLAZO | TOTAL  size 20
    // values (from obtener_numero_pares):
    //   col1: distrito name, col2: existente (green), col3: proyectado (red)
    //   col4: largo_plazo (orange), col5: total (black)  all size 30
  }

  // Magik: draw_content_on — GIS canvas render. Fase 5.
  drawContentOn(_window: unknown): void { /* Fase 5 */ }
}
