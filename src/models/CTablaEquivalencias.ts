// Source: planos_fo/source/detalles_construccion/sellos/c_tabla_equivalencias.magik
// Equivalence table for FO cables. Extends c_base_sello_fibra. No slots/attributes.
// Table layout is dynamically sized by capacidad_cable = numGrupos * numeroFibras.
//   With cable data  → 11 tables (tbl_1..tbl_11)
//   Without cable data → tbl_1 + tbl_2 only

import { CBaseSelloFibra } from './CBaseSelloFibra'

export const COLORES_FIBRA: readonly string[] = [
  'NATURAL', 'AZUL', 'AMARILLO', 'ROJO', 'VERDE', 'NARANJA',
  'VIOLETA', 'CAFE', 'GRIS', 'NEGRO', 'ROSA', 'BLANCO',
]

export class CTablaEquivalencias extends CBaseSelloFibra {
  // Set before calling configurarTabla() when cable data is available
  numGrupos:    number = 0
  numeroFibras: number = 0

  get capacidadCable(): number { return this.numGrupos * this.numeroFibras }

  override configurarTabla(): void {
    const [ox, oy] = this._coordInicio

    const tbl1 = this._tablas.crearTabla(3, 1, 'tbl_1')
    tbl1.coordenadaOrigen = [ox, oy]
    tbl1.renglones.elemento(1).longitud = 6
    tbl1.renglones.elemento(2).longitud = 6
    tbl1.renglones.elemento(3).longitud = 6
    tbl1.columnas.elemento(1).longitud = 99

    const tbl2 = this._tablas.crearTabla(1, 9, 'tbl_2')
    tbl2.coordenadaOrigen = [ox, oy - 180]
    tbl2.renglones.elemento(1).longitud = 8
    const cols2 = [8, 18, 10, 13, 13, 8, 8, 13, 8]
    cols2.forEach((w, i) => { tbl2.columnas.elemento(i + 1).longitud = w })

    const cap = this.capacidadCable
    if (cap <= 0) return

    const tbl3 = this._tablas.crearTabla(1, 1, 'tbl_3')
    tbl3.coordenadaOrigen = [ox, oy - 260]
    tbl3.renglones.elemento(1).longitud = cap * 5
    tbl3.columnas.elemento(1).longitud = 8

    const tbl4 = this._tablas.crearTabla(1, 1, 'tbl_4')
    tbl4.coordenadaOrigen = [ox + 80, oy - 260]
    tbl4.renglones.elemento(1).longitud = cap * 5
    tbl4.columnas.elemento(1).longitud = 18

    const tbl5 = this._tablas.crearTabla(1, 1, 'tbl_5')
    tbl5.coordenadaOrigen = [ox + 260, oy - 260]
    tbl5.renglones.elemento(1).longitud = cap * 5
    tbl5.columnas.elemento(1).longitud = 10

    const tbl6 = this._tablas.crearTabla(this.numGrupos, 1, 'tbl_6')
    tbl6.coordenadaOrigen = [ox + 360, oy - 260]
    for (let r = 1; r <= this.numGrupos; r++) {
      tbl6.renglones.elemento(r).longitud = this.numeroFibras * 5
    }
    tbl6.columnas.elemento(1).longitud = 13

    const tbl7 = this._tablas.crearTabla(cap, 1, 'tbl_7')
    tbl7.coordenadaOrigen = [ox + 490, oy - 260]
    for (let r = 1; r <= cap; r++) tbl7.renglones.elemento(r).longitud = 5
    tbl7.columnas.elemento(1).longitud = 13

    const tbl8 = this._tablas.crearTabla(cap, 1, 'tbl_8')
    tbl8.coordenadaOrigen = [ox + 620, oy - 260]
    for (let r = 1; r <= cap; r++) tbl8.renglones.elemento(r).longitud = 5
    tbl8.columnas.elemento(1).longitud = 8

    const tbl9 = this._tablas.crearTabla(cap, 1, 'tbl_9')
    tbl9.coordenadaOrigen = [ox + 700, oy - 260]
    for (let r = 1; r <= cap; r++) tbl9.renglones.elemento(r).longitud = 5
    tbl9.columnas.elemento(1).longitud = 8

    const tbl10 = this._tablas.crearTabla(cap, 1, 'tbl_10')
    tbl10.coordenadaOrigen = [ox + 780, oy - 260]
    for (let r = 1; r <= cap; r++) tbl10.renglones.elemento(r).longitud = 5
    tbl10.columnas.elemento(1).longitud = 13

    const tbl11 = this._tablas.crearTabla(cap, 1, 'tbl_11')
    tbl11.coordenadaOrigen = [ox + 910, oy - 260]
    for (let r = 1; r <= cap; r++) tbl11.renglones.elemento(r).longitud = 5
    tbl11.columnas.elemento(1).longitud = 8
  }

  override etiquetarCeldas(): void {
    this.asignarTextoCelda('tbl_1', 2, 1, 'TABLA DE EQUIVALENCIAS', 30, undefined)
    this.asignarTextoCelda('tbl_2', 1, 1, 'CTL.',             20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 2, 'DISTRIB.\nSECC.',  20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 3, 'CABLE\nNO.',       20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 4, 'TUBO\nHOLGADO.',   20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 5, 'COLOR\nF.O.',      20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 6, 'FIBRA',            20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 7, 'FIBRA',            20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 8, 'DTO.',             20, undefined)
    this.asignarTextoCelda('tbl_2', 1, 9, 'FIBRA\nCTL.',      20, undefined)
  }

  // Fase 5: fills dynamic cell data via canvas draw_vtext_transform
  llenaDatasCable(_window: unknown): void { /* TODO(GIS) */ }

  override drawContentOn(window: unknown): void {
    super.drawContentOn(window)
    this.llenaDatasCable(window)
  }

  // Fase 5: gets cable object from GIS or gen_planos plugin
  obtenDatos(): [unknown, unknown] { return [undefined, undefined] }

  override llenarDatosCeldas():          void { /* no static dynamic data */ }
  protected override llenarDatosDinamicos(): void { /* no static dynamic data */ }
}
