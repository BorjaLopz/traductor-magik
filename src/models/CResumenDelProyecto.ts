import { CBaseSelloFibra } from './CBaseSelloFibra'

// Each summary row: [description, material, cantidad]
export type ResumenItem = [string, string, string | number]

const NOMBRE_TABLA = 'tbl_lista_materiales'
const ROJO: [number, number, number] = [1.0, 0.0, 0.0]

export class CResumenDelProyecto extends CBaseSelloFibra {
  protected readonly _loElemResumen: ResumenItem[]

  constructor(loElemResumen: ResumenItem[]) {
    super()
    this._loElemResumen = loElemResumen
  }

  protected override configurarTabla(): void {
    const renglones = this._loElemResumen.length + 2
    const tabla = this._tablas.crearTabla(renglones, 4, NOMBRE_TABLA)
    tabla.coordenadaOrigen = this._coordInicio

    for (let r = 1; r <= renglones; r++) tabla.renglones.elemento(r).longitud = 6

    tabla.columnas.elemento(1).longitud = 6
    tabla.columnas.elemento(2).longitud = 80
    tabla.columnas.elemento(3).longitud = 30
    tabla.columnas.elemento(4).longitud = 20

    // Row 1: hide top + right + left borders on all 4 cells
    this.ocultarBordesCeldas(tabla, {
      borderSup:    [[1, 1], [1, 2], [1, 3], [1, 4]],
      borderDerIzq: [[1, 1], [1, 2], [1, 3], [1, 4]],
    })
  }

  override asignarCeldasAColorear(): [string, number, number, [number, number, number]][] {
    const renTbl = this._loElemResumen.length + 2
    const lst: [string, number, number, [number, number, number]][] = [
      [NOMBRE_TABLA, 1, 2, ROJO],
    ]
    for (let row = 3; row <= renTbl; row++) {
      for (let col = 1; col <= 4; col++) {
        lst.push([NOMBRE_TABLA, row, col, ROJO])
      }
    }
    return lst
  }

  override etiquetarCeldas(): void {
    this.asignarTextoCelda(NOMBRE_TABLA, 1, 2, 'RESUMEN DEL PROYECTO', 35, 'centre_right')
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 1, 'No',          30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 2, 'DESCRIPCION', 30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 3, 'MATERIAL',    30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 4, 'TOTAL',       30, undefined)
    this.llenarDatosCeldas()
  }

  override llenarDatosCeldas(): void {
    const renTbl = this._loElemResumen.length + 2
    let cont = 2
    for (const item of this._loElemResumen) {
      cont++
      if (renTbl >= cont) {
        const name    = String(item[0]).toLowerCase().trim()
        const descUc  = String(item[0]).toUpperCase()
        const descMat = String(item[1])
        const cantidad = item[2]

        const attr  = this._attributes.get(name)
        const total = (attr?.value && attr.value.length > 0)
          ? attr.value.padEnd(10)
          : String(cantidad).padEnd(10)

        this.asignarTextoCelda(NOMBRE_TABLA, cont, 1, String(cont - 2), 25, undefined)
        this.asignarTextoCelda(NOMBRE_TABLA, cont, 2, descUc,   25, 'centre_left')
        this.asignarTextoCelda(NOMBRE_TABLA, cont, 3, descMat,  25, undefined)
        this.asignarTextoCelda(NOMBRE_TABLA, cont, 4, total,    25, undefined)
      }
    }
  }

  valorPropiedad(propiedad: string, datoActual: string): string {
    const attr = this._attributes.get(propiedad)
    if (attr?.value && attr.value.length > 0) return attr.value
    return datoActual
  }

  contarFusiones(): number {
    throw new Error('contarFusiones requires GIS platform (swg_dsn_admin_engine)')
  }
}
