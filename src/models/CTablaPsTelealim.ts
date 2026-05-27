// Source: planos_fo/source/montaje_tba/sellos/c_tabla_ps_telealim.magik
// Tabla de pares de telealimentación para planos montaje TBA.
// Extends c_base_sello_fibra. No slots. Entirely static (configura_tabla + etiqueta_celdas only).
// One table: tbl_ps_teleal (22×3).
//   Row 1 (7mm):    "PARES PRINCIPALES DE TELEALIMENTACION" [30pt, centre_left, 6°]
//                   borders(1,1).borderDer=false + borders(1,2).borderDer=false → header visually merged
//   Row 2 (7mm):    column headers: "TERMINAL DE BANDA ANCHA" | "STRIP" | "PAR" [20pt]
//   Rows 3-22 (7mm): 20 empty data rows (filled externally / Fase 5)

import { CBaseSelloFibra } from './CBaseSelloFibra'

export class CTablaPsTelealim extends CBaseSelloFibra {

  override configurarTabla(): void {
    const tbl = this._tablas.crearTabla(22, 3, 'tbl_ps_teleal')
    tbl.coordenadaOrigen = this._coordInicio

    for (let r = 1; r <= 22; r++) tbl.renglones.elemento(r).longitud = 7

    tbl.columnas.elemento(1).longitud = 50
    tbl.columnas.elemento(2).longitud = 12
    tbl.columnas.elemento(3).longitud = 12

    // Hide right border of cols 1 and 2 in row 1 → merged header appearance
    this.ocultarBordesCeldas(tbl, {
      borderDer: [[1, 1], [1, 2]],
    })
  }

  override etiquetarCeldas(): void {
    this.asignarTextoCelda('tbl_ps_teleal', 1, 1, 'PARES PRINCIPALES DE TELEALIMENTACION', 30, 'centre_left', 6)
    this.asignarTextoCelda('tbl_ps_teleal', 2, 1, 'TERMINAL DE BANDA ANCHA', 20, undefined)
    this.asignarTextoCelda('tbl_ps_teleal', 2, 2, 'STRIP',                   20, undefined)
    this.asignarTextoCelda('tbl_ps_teleal', 2, 3, 'PAR',                     20, undefined)
  }

  override llenarDatosCeldas():          void { /* rows 3-22 filled by parent plan engine */ }
  protected override llenarDatosDinamicos(): void { /* no dynamic data */ }
}
