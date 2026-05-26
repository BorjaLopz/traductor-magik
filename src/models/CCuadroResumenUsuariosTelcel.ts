import { CBaseSelloFibra } from './CBaseSelloFibra'
import type { CeldaColorFibra } from './CBaseSelloFibra'

// ── GIS dataset record (D5) ────────────────────────────────────────────────────
// Each row of LoElemResumen is a tuple accessed positionally [1..5] in Magik
export interface TelcelRow {
  readonly no:       string   // [1]
  readonly usuarios: string   // [2]
  readonly id:       string   // [3]
  readonly pes:      string   // [4]
  readonly fibras:   string   // [5]
}

const NOMBRE_TABLA = 'tbl_cuadro_resumen_usuarios_telcel'
const AZUL_OSCURO: [number, number, number] = [0, 0, 0.7]
const VERDE:       [number, number, number] = [0, 0.5, 0]

export class CCuadroResumenUsuariosTelcel extends CBaseSelloFibra {
  private _loElemResumen: Map<string, TelcelRow>

  constructor(loElemResumen: Map<string, TelcelRow> = new Map()) {
    super()
    this._loElemResumen = loElemResumen
  }

  // ── Table configuration ────────────────────────────────────────────────────

  protected override configurarTabla(): void {
    const dataRows = this._loElemResumen.size
    const tabla = this._tablas.crearTabla(2 + dataRows, 5, NOMBRE_TABLA)
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = 10   // título
    tabla.renglones.elemento(2).longitud = 8    // encabezados

    for (let r = 3; r <= 2 + dataRows; r++) {
      tabla.renglones.elemento(r).longitud = 6
    }

    tabla.columnas.elemento(1).longitud = 10    // No.
    tabla.columnas.elemento(2).longitud = 120   // Usuarios
    tabla.columnas.elemento(3).longitud = 30    // ID
    tabla.columnas.elemento(4).longitud = 9     // PES
    tabla.columnas.elemento(5).longitud = 36    // Fibras Asignadas

    // Row 1: hide all borders, then selectively restore to create merged-title look
    for (let c = 1; c <= 5; c++) {
      const b = tabla.celdas.celda(1, c).elementos.obtenerElemento('bordes_celda')
      b.bordeSup = false
      b.bordeDer = false
      b.bordeIzq = false
    }
    const b11 = tabla.celdas.celda(1, 1).elementos.obtenerElemento('bordes_celda')
    b11.bordeSup = true
    b11.bordeIzq = true
    for (let c = 2; c <= 5; c++) {
      tabla.celdas.celda(1, c).elementos.obtenerElemento('bordes_celda').bordeSup = true
    }
    tabla.celdas.celda(1, 5).elementos.obtenerElemento('bordes_celda').bordeDer = true
  }

  // ── Static labels ──────────────────────────────────────────────────────────

  override etiquetarCeldas(): void {
    const titulo = '                                             RESUMEN DE USUARIOS TELCEL'
    this.asignarTextoCelda(NOMBRE_TABLA, 1, 2, titulo, 60, 'centre_centre', 0, AZUL_OSCURO)

    this.asignarTextoCelda(NOMBRE_TABLA, 2, 1, 'No.',              37, 'centre_centre', 0, AZUL_OSCURO)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 2, 'USUARIOS',         37, 'centre_centre', 0, AZUL_OSCURO)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 3, 'ID',               37, 'centre_centre', 0, AZUL_OSCURO)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 4, 'PES',              37, 'centre_centre', 0, AZUL_OSCURO)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 5, 'FIBRAS ASIGNADAS', 37, 'centre_centre', 0, AZUL_OSCURO)
  }

  // ── Dynamic data ───────────────────────────────────────────────────────────

  override llenarDatosCeldas(): void {
    const sortedKeys = [...this._loElemResumen.keys()].sort()
    let row = 2

    for (const key of sortedKeys) {
      row++
      const item = this._loElemResumen.get(key)!
      this.asignarTextoCelda(NOMBRE_TABLA, row, 1, item.no.toUpperCase(),       30, undefined)
      this.asignarTextoCelda(NOMBRE_TABLA, row, 2, item.usuarios.toUpperCase(), 30, 'centre_left')
      this.asignarTextoCelda(NOMBRE_TABLA, row, 3, item.id.toUpperCase(),       30, undefined)
      this.asignarTextoCelda(NOMBRE_TABLA, row, 4, item.pes.toUpperCase(),      30, undefined)
      this.asignarTextoCelda(NOMBRE_TABLA, row, 5, item.fibras.toUpperCase(),   30, undefined)
    }
  }

  actualizarDatos(): void {
    this.llenarDatosCeldas()
  }

  override asignarCeldasAColorear(): CeldaColorFibra[] {
    const result: CeldaColorFibra[] = [[NOMBRE_TABLA, 1, 2, AZUL_OSCURO]]
    const totalRows = 2 + this._loElemResumen.size

    for (let r = 3; r <= totalRows; r++) {
      result.push([NOMBRE_TABLA, r, 1, AZUL_OSCURO])
      result.push([NOMBRE_TABLA, r, 2, VERDE])
      result.push([NOMBRE_TABLA, r, 3, VERDE])
      result.push([NOMBRE_TABLA, r, 4, AZUL_OSCURO])
      result.push([NOMBRE_TABLA, r, 5, AZUL_OSCURO])
    }

    return result
  }

  // ── Layout attribute overrides (Fase 5 stub) ───────────────────────────────

  private _valorPropiedad(propiedad: string, datoActual: string): string {
    const attr = this._attributes.get(propiedad)
    if (attr?.value && attr.value.length > 0) return attr.value
    return datoActual
  }

  calcularDatos(): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [k] of this._attributes) {
      result[k] = this._valorPropiedad(k, result[k] ?? '')
    }
    return result
  }
}
