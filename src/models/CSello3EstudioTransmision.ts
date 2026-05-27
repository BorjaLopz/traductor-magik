// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello3_estudio_transmision.magik
// Sello for the optical-budget transmission-study (power budget table).
// Extends c_base_sello_fibra. No extra slots. Single table:
//
//   tbl_tabla_unica — 10 rows × 2 cols
//     Col 1: 65mm × 0.7 = 45.5 mm (labels)
//     Col 2: 25mm × 0.7 = 17.5 mm (values)
//     Rows:  3mm × 0.7 = 2.1 mm each
//
// Data split:
//   llenarDatosDinamicos (rows 1-4): user-editable float attributes
//   llenarDatosCeldas    (rows 5-10): computed/derived float values
//     Row 9 = atenuacionEnFibra + perdidaPorEmpalmes + perdidaPorConectores
//     Row 10 = margenRespaldo
//
// All attributes are :float, default 0.0.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Layout constants ─────────────────────────────────────────────────────────

const SCALE = 0.7

export const TABLA_SELLO3_ET = {
  nombre:           'tbl_tabla_unica' as const,
  numRenglones:     10,
  numColumnas:      2,
  alturas:          Array(10).fill(3) as number[],  // mm before scale
  anchos:           [65, 25]          as const,      // mm before scale
  alturasEscaladas: Array(10).fill(3 * SCALE) as number[],
  anchosEscalados:  [65 * SCALE, 25 * SCALE] as const,
} as const

// ─── Config interface ─────────────────────────────────────────────────────────

export interface Sello3EstudioTransmisionConfig {
  potencia?:             number  // Potencia de salida del emisor       (default 0.0)
  sensibilidad?:         number  // Sensibilidad receptor               (default 0.0)
  maxPotencia?:          number  // Máxima potencia permisible           (default 0.0)
  atenuacionCable?:      number  // Atenuación permisible cable         (default 0.0)
  atenuacionEnFibra?:    number  // Atenuación en la fibra              (default 0.0)
  perdidaPorEmpalmes?:   number  // Pérdida por empalmes                (default 0.0)
  perdidaPorConectores?: number  // Pérdida por conectores              (default 0.0)
  margenRespaldo?:       number  // Margen de respaldo                  (default 0.0)
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSello3EstudioTransmision extends CBaseSelloFibra {
  potencia:             number = 0.0
  sensibilidad:         number = 0.0
  maxPotencia:          number = 0.0
  atenuacionCable:      number = 0.0
  atenuacionEnFibra:    number = 0.0
  perdidaPorEmpalmes:   number = 0.0
  perdidaPorConectores: number = 0.0
  margenRespaldo:       number = 0.0

  constructor(config?: Sello3EstudioTransmisionConfig) {
    super()
    if (config) {
      this.potencia             = config.potencia             ?? 0.0
      this.sensibilidad         = config.sensibilidad         ?? 0.0
      this.maxPotencia          = config.maxPotencia          ?? 0.0
      this.atenuacionCable      = config.atenuacionCable      ?? 0.0
      this.atenuacionEnFibra    = config.atenuacionEnFibra    ?? 0.0
      this.perdidaPorEmpalmes   = config.perdidaPorEmpalmes   ?? 0.0
      this.perdidaPorConectores = config.perdidaPorConectores ?? 0.0
      this.margenRespaldo       = config.margenRespaldo       ?? 0.0
    }
  }

  // Magik: l_atenuacion = atenuacion_en_fibra + perdida_por_empalmes + perdida_por_conectores
  get atenuacionTotal(): number {
    return this.atenuacionEnFibra + this.perdidaPorEmpalmes + this.perdidaPorConectores
  }

  // Magik: l_margen_res = margen_respaldo (row 10 mirrors row 8)
  get margenReservaAdicional(): number {
    return this.margenRespaldo
  }

  // Magik: configura_tabla — single table, 10 rows × 2 cols, scale 0.7.
  override configurarTabla(): void {
    const t = this._tablas.crearTabla(10, 2, TABLA_SELLO3_ET.nombre)
    t.coordenadaOrigen = this._coordInicio
    TABLA_SELLO3_ET.alturas.forEach((h, i) => {
      t.renglones.elemento(i + 1).longitud = h * SCALE
    })
    TABLA_SELLO3_ET.anchos.forEach((w, i) => {
      t.columnas.elemento(i + 1).longitud = w * SCALE
    })
  }

  // Magik: etiqueta_celdas — 10 static labels in column 1.
  override etiquetarCeldas(): void {
    const n = TABLA_SELLO3_ET.nombre
    this.asignarTextoCelda(n,  1, 1, 'POTENCIA DE SALIDA DEL EMISOR',         18, 'top_left', 1)
    this.asignarTextoCelda(n,  2, 1, 'SENSIBILIDAD DEL RECEPTOR',             18, 'top_left', 1)
    this.asignarTextoCelda(n,  3, 1, 'MAXIMA POTENCIA DE ENTRADA PERMISIBLE', 18, 'top_left', 1)
    this.asignarTextoCelda(n,  4, 1, 'ATENUACION PERMISIBLE EN EL CABLE',     18, 'top_left', 1)
    this.asignarTextoCelda(n,  5, 1, 'ATENUACION EN LA FIBRA',                18, 'top_left', 1)
    this.asignarTextoCelda(n,  6, 1, 'PERDIDA POR EMPALMES',                  18, 'top_left', 1)
    this.asignarTextoCelda(n,  7, 1, 'PERDIDA POR CONECTORES',                18, 'top_left', 1)
    this.asignarTextoCelda(n,  8, 1, 'MARGEN DE RESPALDO PARA MANTENIMIENTO', 18, 'top_left', 1)
    this.asignarTextoCelda(n,  9, 1, 'ATENUACION TOTAL',                      18, 'top_left', 1)
    this.asignarTextoCelda(n, 10, 1, 'MARGEN RESERVA ADICIONAL',              18, 'top_left', 1)
  }

  // Magik: llena_datos_celdas — rows 5-10 (attributes + derived sums).
  override llenarDatosCeldas(): void {
    const n = TABLA_SELLO3_ET.nombre
    this.asignarTextoCelda(n,  5, 2, this.atenuacionEnFibra.toString(),    18, undefined)
    this.asignarTextoCelda(n,  6, 2, this.perdidaPorEmpalmes.toString(),   18, undefined)
    this.asignarTextoCelda(n,  7, 2, this.perdidaPorConectores.toString(), 18, undefined)
    this.asignarTextoCelda(n,  8, 2, this.margenRespaldo.toString(),       18, undefined)
    this.asignarTextoCelda(n,  9, 2, this.atenuacionTotal.toString(),      18, undefined)
    this.asignarTextoCelda(n, 10, 2, this.margenReservaAdicional.toString(), 18, undefined)
  }

  // Magik: llena_datos_dinamicos — rows 1-4 (user-editable attributes).
  protected override llenarDatosDinamicos(): void {
    const n = TABLA_SELLO3_ET.nombre
    this.asignarTextoCelda(n, 1, 2, this.potencia.toString(),        18, undefined)
    this.asignarTextoCelda(n, 2, 2, this.sensibilidad.toString(),    18, undefined)
    this.asignarTextoCelda(n, 3, 2, this.maxPotencia.toString(),     18, undefined)
    this.asignarTextoCelda(n, 4, 2, this.atenuacionCable.toString(), 18, undefined)
  }
}
