// Source: planos_fo/source/ruta_cables/sellos/c_resumen_distritos_ruta.magik
// Sello showing a per-district fibre summary table (11 columns, "RESUMEN DE DISTRITOS DE LA RUTA").
// Extends CBaseSelloFibra. Districts populated by c_engine_ruta_cables (Fase 5).
//
// Table: tbl_res_dtos_ruta — 11 cols × (2 + n_districts) rows
//   Row 1:  title row — top/left/right borders hidden on all 11 cols; text in col 6
//   Row 2:  multiline column headers (40 mm tall)
//   Rows 3+: one 6-mm-tall row per district
//   All columns: 25 mm wide
//
// configurarTabla() calls obtenDistritos() first, then creates the table.
// obtenDistritos() uses c_engine_ruta_cables.recorrer_ruta() + gen_planos plugin → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── District data record ─────────────────────────────────────────────────────

export interface DistritoRutaRecord {
  central:            string
  distrito:           string
  distancia_oc:       string
  ruta:               string
  nse:                string
  nipp:               string
  moda:               string
  total_fibras:       string | number
  fibras_asignadas:   string | number
  reserva_grupo:      string | number
  reservas_generales: string | number
}

// ─── Layout constants ─────────────────────────────────────────────────────────

export const TABLA_RESUMEN_DISTRITOS = {
  nombre:          'tbl_res_dtos_ruta' as const,
  numColumnas:     11,
  alturaFilaTitulo: 10,   // mm — row 1
  alturaFilaHeader: 40,   // mm — row 2
  alturaFilaDato:   6,    // mm — each data row (rows 3+)
  anchoColumna:    25,    // mm — uniform for all 11 columns
} as const

// Row 1 (title row): top, left, and right borders hidden on all 11 columns.
// In Magik: ocultaSup, ocultaIzq, ocultaDer all target the same {1,1}..{1,11} cells.
export const BORDES_OCULTOS_FILA1: [number, number][] =
  Array.from({ length: 11 }, (_, i) => [1, i + 1])

// Column header text (row 2). Multiline headers use \n.
export const ETIQUETAS_COLUMNAS = [
  { col: 1,  texto: 'CENTRAL' },
  { col: 2,  texto: 'DISTRITO' },
  { col: 3,  texto: 'DISTANCIA\nA O.C. EN\nKMS.' },
  { col: 4,  texto: 'RUTA' },
  { col: 5,  texto: 'NSE' },
  { col: 6,  texto: 'NIPP' },
  { col: 7,  texto: 'MODA' },
  { col: 8,  texto: 'TOTAL\nFIBRAS\nDISTRITO' },
  { col: 9,  texto: 'NUMERO\nFIBRAS\nASIGNADAS' },
  { col: 10, texto: 'NUMERO\nFIBRAS\nRESERVAS\nPOR GRUPO' },
  { col: 11, texto: 'RESERVAS\nGENERALES' },
] as const

// ─── Class ────────────────────────────────────────────────────────────────────

export class CResumenDistritosRuta extends CBaseSelloFibra {
  distritos: DistritoRutaRecord[] | undefined = undefined

  constructor(distritos?: DistritoRutaRecord[], _bounds?: unknown) {
    super()
    this.distritos = distritos
  }

  override configurarTabla(): void {
    // Magik calls obten_distritos() here first to reduce coupling with plan generation.
    this.obtenDistritos()

    const n = this.distritos?.length ?? 0
    const tabla = this._tablas.crearTabla(
      2 + n,
      TABLA_RESUMEN_DISTRITOS.numColumnas,
      TABLA_RESUMEN_DISTRITOS.nombre,
    )
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = TABLA_RESUMEN_DISTRITOS.alturaFilaTitulo
    tabla.renglones.elemento(2).longitud = TABLA_RESUMEN_DISTRITOS.alturaFilaHeader
    for (let r = 3; r <= 2 + n; r++) {
      tabla.renglones.elemento(r).longitud = TABLA_RESUMEN_DISTRITOS.alturaFilaDato
    }

    for (let c = 1; c <= TABLA_RESUMEN_DISTRITOS.numColumnas; c++) {
      tabla.columnas.elemento(c).longitud = TABLA_RESUMEN_DISTRITOS.anchoColumna
    }

    this.ocultarBordesCeldas(tabla, {
      borderSup: BORDES_OCULTOS_FILA1,
      borderIzq: BORDES_OCULTOS_FILA1,
      borderDer: BORDES_OCULTOS_FILA1,
    })
  }

  override etiquetarCeldas(): void {
    const t = TABLA_RESUMEN_DISTRITOS.nombre
    this.asignarTextoCelda(t, 1, 6, 'RESUMEN DE DISTRITOS DE LA RUTA', 40, undefined)
    for (const { col, texto } of ETIQUETAS_COLUMNAS) {
      this.asignarTextoCelda(t, 2, col, texto, 40, undefined)
    }
  }

  override llenarDatosCeldas(): void {
    if (!this.distritos) return
    let fila = 2
    for (const dto of this.distritos) {
      fila++
      const t = TABLA_RESUMEN_DISTRITOS.nombre
      this.asignarTextoCelda(t, fila, 1,  String(dto.central),            35, undefined)
      this.asignarTextoCelda(t, fila, 2,  String(dto.distrito),           35, undefined)
      this.asignarTextoCelda(t, fila, 3,  String(dto.distancia_oc),       35, undefined)
      this.asignarTextoCelda(t, fila, 4,  String(dto.ruta),               35, undefined)
      this.asignarTextoCelda(t, fila, 5,  String(dto.nse),                35, undefined)
      this.asignarTextoCelda(t, fila, 6,  String(dto.nipp),               35, undefined)
      this.asignarTextoCelda(t, fila, 7,  String(dto.moda),               35, undefined)
      this.asignarTextoCelda(t, fila, 8,  String(dto.total_fibras),       35, undefined)
      this.asignarTextoCelda(t, fila, 9,  String(dto.fibras_asignadas),   35, undefined)
      this.asignarTextoCelda(t, fila, 10, String(dto.reserva_grupo),      35, undefined)
      this.asignarTextoCelda(t, fila, 11, String(dto.reservas_generales), 35, undefined)
    }
  }

  // Magik: obten_distritos() — c_engine_ruta_cables + gen_planos plugin. Fase 5.
  obtenDistritos(): void { /* Fase 5 */ }
}
