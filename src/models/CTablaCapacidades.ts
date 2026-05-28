// Source: planos_fo/source/ruta_cables/sellos/c_tabla_capacidades.magik
// Static cable-capacity abbreviation table. Extends c_base_sello_fibra.
// No slots, no attributes, no GIS reads — entirely static content.
// One table: tbl_capacidades (22×2).
//   Row 1 (8mm):    header "ABREVIATURAS\nPARA CAPACIDAD DE CABLE"  [30pt, top_left]
//   Rows 2-22 (5mm): 21 letter codes (col 1, 6mm) + descriptions (col 2, 45mm) [20pt]

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Static data ──────────────────────────────────────────────────────────────

export interface CapacidadEntry {
  readonly letra:       string
  readonly descripcion: string
}

export const CAPACIDADES: readonly CapacidadEntry[] = [
  { letra: 'A', descripcion: '10 PS.' },
  { letra: 'B', descripcion: '20' },
  { letra: 'C', descripcion: '30' },
  { letra: 'D', descripcion: '50' },
  { letra: 'E', descripcion: '70' },
  { letra: 'F', descripcion: '100' },
  { letra: 'G', descripcion: '150' },
  { letra: 'H', descripcion: '200' },
  { letra: 'I', descripcion: '300' },
  { letra: 'J', descripcion: '600' },
  { letra: 'K', descripcion: '900' },
  { letra: 'L', descripcion: '1200' },
  { letra: 'M', descripcion: '1800' },
  { letra: 'N', descripcion: '2400' },
  { letra: 'R', descripcion: 'CABLE PARA LA TIERRA FISICA' },
  { letra: 'S', descripcion: 'TUBO POLYFLO' },
  { letra: 'T', descripcion: 'TRONCALES' },
  { letra: 'V', descripcion: 'VIDEO' },
  { letra: 'W', descripcion: 'COMISION FEDERAL DE ELECTRICIDAD' },
  { letra: 'X', descripcion: 'CABLES COAXIALES' },
  { letra: 'Z', descripcion: 'FIBRAS OPTICAS F.O.' },
]

// ─── Class ────────────────────────────────────────────────────────────────────

export class CTablaCapacidades extends CBaseSelloFibra {

  // Magik: configura_tabla
  override configurarTabla(): void {
    const tbl = this._tablas.crearTabla(22, 2, 'tbl_capacidades')
    tbl.coordenadaOrigen = this._coordInicio

    tbl.renglones.elemento(1).longitud = 8
    for (let r = 2; r <= 22; r++) tbl.renglones.elemento(r).longitud = 5

    tbl.columnas.elemento(1).longitud = 6
    tbl.columnas.elemento(2).longitud = 45

    this.ocultarBordesCeldas(tbl, {
      borderIzq: [[1, 2]],
      borderDer: [[1, 1]],
    })
  }

  // Magik: etiqueta_celdas — all static content
  override etiquetarCeldas(): void {
    const titulo = 'ABREVIATURAS\nPARA CAPACIDAD DE CABLE'
    this.asignarTextoCelda('tbl_capacidades', 1, 2, titulo, 30, 'top_left', 5)

    CAPACIDADES.forEach(({ letra, descripcion }, i) => {
      const row = i + 2
      this.asignarTextoCelda('tbl_capacidades', row, 1, letra,       20, 'centre_left', 2)
      this.asignarTextoCelda('tbl_capacidades', row, 2, descripcion, 20, undefined)
    })
  }

  override llenarDatosCeldas():        void { /* no dynamic data */ }
  protected override llenarDatosDinamicos(): void { /* no dynamic data */ }
}
