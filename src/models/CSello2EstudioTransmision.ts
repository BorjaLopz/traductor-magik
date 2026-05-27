// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello2_estudio_transmision.magik
// Sello for the transmission-study secondary data (empalmes count + user attributes).
// Extends c_base_sello_fibra. Two tables, both 2 cols wide:
//
//   tbl_tabla_uno — 4 rows × 2 cols (origin = coordInicio)
//     Col 1: 35mm × 0.7 = 24.5 mm (labels)
//     Col 2: 15mm × 0.7 = 10.5 mm (values)
//     Rows:  3mm × 0.7 = 2.1 mm each
//     Labels: NO. DE EMPALMES / NO. DE CONECTORES / CONFIGURACION / AUMENTO
//
//   tbl_tabla_dos — 2 rows × 2 cols (origin = coordInicio.y - 100 mm)
//     Same col/row dimensions as tbl_tabla_uno
//     Labels: REQUIERE ATENUADOR / VALOR MINIMO
//
// oEngine (Fase 5): GIS engine object whose elements() yields splice_closure objects.
// getEmpalmes() filters splice_closure from engine → count fills cell (1,2).
// guardarElementosBdGis / obtenerElementosBdGis → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Layout constants ─────────────────────────────────────────────────────────

const SCALE = 0.7

export const TABLA_SELLO2_ET_UNO = {
  nombre:           'tbl_tabla_uno' as const,
  numRenglones:     4,
  numColumnas:      2,
  alturas:          [3, 3, 3, 3] as const,        // mm before scale
  anchos:           [35, 15]     as const,          // mm before scale
  alturasEscaladas: [3 * SCALE, 3 * SCALE, 3 * SCALE, 3 * SCALE] as const,
  anchosEscalados:  [35 * SCALE, 15 * SCALE]      as const,
} as const

export const TABLA_SELLO2_ET_DOS = {
  nombre:           'tbl_tabla_dos' as const,
  numRenglones:     2,
  numColumnas:      2,
  alturas:          [3, 3] as const,
  anchos:           [35, 15] as const,
  alturasEscaladas: [3 * SCALE, 3 * SCALE] as const,
  anchosEscalados:  [35 * SCALE, 15 * SCALE] as const,
  yOffset:          -100,  // mm — origin is coordInicio.y - 100
} as const

// ─── Config interface ─────────────────────────────────────────────────────────

export interface Sello2EstudioTransmisionConfig {
  conectores?:    string  // default "2"
  configuracion?: string  // default "1625"
  aumento?:       string
  atenuador?:     string  // values from siNo(): "Si" | "No" | ""
  valMin?:        string  // default "1"
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSello2EstudioTransmision extends CBaseSelloFibra {
  private _engine: unknown = undefined  // Magik: oEngine — GIS engine (Fase 5)

  conectores:    string = '2'
  configuracion: string = '1625'
  aumento:       string = ''
  atenuador:     string = ''
  valMin:        string = '1'

  constructor(config?: Sello2EstudioTransmisionConfig) {
    super()
    if (config) {
      this.conectores    = config.conectores    ?? '2'
      this.configuracion = config.configuracion ?? '1625'
      this.aumento       = config.aumento       ?? ''
      this.atenuador     = config.atenuador     ?? ''
      this.valMin        = config.valMin        ?? '1'
    }
  }

  get engine(): unknown            { return this._engine }
  set engine(value: unknown)       { this._engine = value; this.guardarElementosBdGis() }

  // Magik: si_no — enum for the atenuador attribute combo (enum_method: :si_no).
  siNo(): Map<number, string> {
    return new Map([[1, 'Si'], [2, 'No'], [3, '']])
  }

  // Magik: configura_tabla — creates tbl_tabla_uno and tbl_tabla_dos.
  override configurarTabla(): void {
    // tbl_tabla_uno: 4 rows × 2 cols at coordInicio
    const tblUno = this._tablas.crearTabla(4, 2, TABLA_SELLO2_ET_UNO.nombre)
    tblUno.coordenadaOrigen = this._coordInicio
    TABLA_SELLO2_ET_UNO.alturas.forEach((h, i) => {
      tblUno.renglones.elemento(i + 1).longitud = h * SCALE
    })
    TABLA_SELLO2_ET_UNO.anchos.forEach((w, i) => {
      tblUno.columnas.elemento(i + 1).longitud = w * SCALE
    })

    // tbl_tabla_dos: 2 rows × 2 cols, 100 mm below coordInicio
    const tblDos = this._tablas.crearTabla(2, 2, TABLA_SELLO2_ET_DOS.nombre)
    tblDos.coordenadaOrigen = [
      this._coordInicio[0],
      this._coordInicio[1] + TABLA_SELLO2_ET_DOS.yOffset,
    ]
    TABLA_SELLO2_ET_DOS.alturas.forEach((h, i) => {
      tblDos.renglones.elemento(i + 1).longitud = h * SCALE
    })
    TABLA_SELLO2_ET_DOS.anchos.forEach((w, i) => {
      tblDos.columnas.elemento(i + 1).longitud = w * SCALE
    })
  }

  // Magik: etiqueta_celdas — static labels in column 1.
  override etiquetarCeldas(): void {
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 1, 1, 'NO. DE EMPALMES',   20, 'top_left', 1)
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 2, 1, 'NO. DE CONECTORES', 20, 'top_left', 1)
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 3, 1, 'CONFIGURACION',     20, 'top_left', 1)
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 4, 1, 'AUMENTO',           20, 'top_left', 1)
    this.asignarTextoCelda(TABLA_SELLO2_ET_DOS.nombre, 1, 1, 'REQUIERE ATENUADOR',20, 'top_left', 1)
    this.asignarTextoCelda(TABLA_SELLO2_ET_DOS.nombre, 2, 1, 'VALOR MINIMO',       20, 'top_left', 1)
  }

  // Magik: llena_datos_celdas — empalmes count (GIS-derived, Fase 5 → 0).
  override llenarDatosCeldas(): void {
    const count = this.getEmpalmes().length.toString()
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 1, 2, count, 20, undefined)
  }

  // Magik: llena_datos_dinamicos — user-editable attribute values.
  protected override llenarDatosDinamicos(): void {
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 2, 2, this.conectores,    20, undefined)
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 3, 2, this.configuracion, 20, undefined)
    this.asignarTextoCelda(TABLA_SELLO2_ET_UNO.nombre, 4, 2, this.aumento,       20, undefined)
    this.asignarTextoCelda(TABLA_SELLO2_ET_DOS.nombre, 1, 2, this.atenuador,     20, undefined)
    this.asignarTextoCelda(TABLA_SELLO2_ET_DOS.nombre, 2, 2, this.valMin,        20, undefined)
  }

  // Magik: getempalmes — filters splice_closure elements from engine. Fase 5.
  getEmpalmes(): unknown[] { return [] }

  // Magik: guardar_elementos_bd_gis — serialises engine elements to elementos_bd_gis. Fase 5.
  guardarElementosBdGis(): void { /* Fase 5 */ }

  // Magik: obtener_elementos_bd_gis — rehydrates engine from stored GIS refs. Fase 5.
  obtenerElementosBdGis(): void { /* Fase 5 */ }
}
