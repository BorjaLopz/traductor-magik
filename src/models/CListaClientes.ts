// Source: planos_fo/source/ruta_cables/sellos/c_lista_clientes.magik
// Sello that renders a table listing the clients (buildings/users) belonging to a cable route.
// Extends CBaseSelloFibra (which extends CBaseSello).
//
// Table layout (tbl_lista_clientes):
//   Rows: 2 header rows + 1 row per client (configura_tabla sizes dynamically)
//   Cols: 5
//   Row heights (mm):  row 1 = 10, row 2 = 20, rows 3+ = 6
//   Col widths  (mm):  cols 1-3 = 15, cols 4-5 = 30
//   Border hiding:
//     left border hidden  on row 1, cols 2-5
//     right border hidden on row 1, cols 1-4
//
// Cell labels (etiqueta_celdas):
//   (1,4) "RELACION DE USUARIOS"  — size 30
//   (2,1) "NO. DE\nEDIFICIO"      — size 20
//   (2,2) "DOE"                    — size 20
//   (2,3) "CLLI"                   — size 20
//   (2,4) "NOMBRE DEL EDIFICIO"    — size 20
//   (2,5) "DOMICILIO"              — size 20
//
// Data rows start at row 3; each client fills cols 1-5: numero, doe, clli, nombre, domicilio.
//
// obtenClientes() → Fase 5: c_engine_ruta_cables.new() → recorrer_ruta(cables) → getclientes()
//   Uses: pni_application().plugin(:gen_planos).cables_activados_fo

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Client record ────────────────────────────────────────────────────────────

export interface ClienteRecord {
  numero:    string | number
  doe:       string | number
  clli:      string | number
  nombre:    string
  domicilio: string
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CListaClientes extends CBaseSelloFibra {
  clientes: ClienteRecord[] | undefined = undefined

  // Magik: configura_tabla — builds tbl_lista_clientes, sets row/col sizes, hides borders.
  // Guard: calls obtenClientes() first; if clients still undefined, table gets 2 rows only.
  override configurarTabla(): void {
    this.obtenClientes()

    const numFilas = this.clientes !== undefined ? 2 + this.clientes.length : 2
    const tabla = this._tablas.crearTabla(numFilas, 5, 'tbl_lista_clientes')
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = 10
    tabla.renglones.elemento(2).longitud = 20
    if (this.clientes !== undefined) {
      for (let n = 3; n <= 2 + this.clientes.length; n++) {
        tabla.renglones.elemento(n).longitud = 6
      }
    }

    for (let col = 1; col <= 5; col++) {
      tabla.columnas.elemento(col).longitud = col <= 3 ? 15 : 30
    }

    this.ocultarBordesCeldas(tabla, {
      borderIzq: [[1, 2], [1, 3], [1, 4], [1, 5]],
      borderDer: [[1, 1], [1, 2], [1, 3], [1, 4]],
    })
  }

  // Magik: etiqueta_celdas — assigns static header text to cells.
  override etiquetarCeldas(): void {
    const t = 'tbl_lista_clientes'
    this.asignarTextoCelda(t, 1, 4, 'RELACION DE USUARIOS',  30, undefined)
    this.asignarTextoCelda(t, 2, 1, 'NO. DE\nEDIFICIO',      20, undefined)
    this.asignarTextoCelda(t, 2, 2, 'DOE',                   20, undefined)
    this.asignarTextoCelda(t, 2, 3, 'CLLI',                  20, undefined)
    this.asignarTextoCelda(t, 2, 4, 'NOMBRE DEL EDIFICIO',   20, undefined)
    this.asignarTextoCelda(t, 2, 5, 'DOMICILIO',             20, undefined)
  }

  // Magik: llena_datos_celdas — fills one row per client starting at row 3.
  override llenarDatosCeldas(): void {
    if (!this.clientes) return
    const t = 'tbl_lista_clientes'
    let row = 2
    for (const cliente of this.clientes) {
      row++
      this.asignarTextoCelda(t, row, 1, String(cliente.numero),    18, undefined)
      this.asignarTextoCelda(t, row, 2, String(cliente.doe),        18, undefined)
      this.asignarTextoCelda(t, row, 3, String(cliente.clli),       18, undefined)
      this.asignarTextoCelda(t, row, 4, cliente.nombre,             18, undefined)
      this.asignarTextoCelda(t, row, 5, cliente.domicilio,          18, undefined)
    }
  }

  // Magik: obten_clientes — traverses cable route via GIS engine and collects client list.
  // Fase 5: c_engine_ruta_cables.new() → recorrer_ruta(pni_application().plugin(:gen_planos)
  //           .cables_activados_fo) → getclientes()
  obtenClientes(): void { /* Fase 5 */ }
}
