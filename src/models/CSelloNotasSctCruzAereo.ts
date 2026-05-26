// Magik source: adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_aereo.magik
import { CSelloNotasSct } from './CSelloNotasSct'
import { CTextoGrafico } from '../gis/CTextoGrafico'

const T = 'tbl_notas_grales'

export class CSelloNotasSctCruzAereo extends CSelloNotasSct {
  static readonly allowedOnMenu = false

  // Row 2: 110 mm (parent: 55 mm), Col 1: 160 mm (parent: 155 mm)
  protected override prvCreaCfgTblNotasGrales(roCoord: [number, number]): void {
    const t = this._tablas.crearTabla(2, 1, T)
    t.coordenadaOrigen = roCoord
    t.renglones.elemento(1).longitud = 10
    t.renglones.elemento(2).longitud = 110
    t.columnas.elemento(1).longitud  = 160
  }

  override llenarDatosCeldas(): void {
    super.llenarDatosCeldas()

    const cell    = this._tablas.elemento(T).celdas.celda(2, 1)
    const current = (cell.elemento as CTextoGrafico).texto

    let extra = '\n'
    extra += ` 5.- LA UBICACIÓN DEL CRUZAMIENTO AÉREO CON CABLE DE ${this._tipoCable} INDICADO EN \n`
    extra += ` ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR, POR LA RESIDENCIA GENERAL \n`
    extra += ` DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this._estado}\n`
    extra += '\n'
    extra += ` 6.- EL CRUZAMIENTO AÉREO CON POSTES, DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES DE \n`
    extra += ` LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS. \n`
    extra += '\n'
    extra += ` 7.- EL GÁLIBO O DISTANCIA LIBRE EXISTENTE ENTRE LA RASANTE DE LA CARRETERA Y EL CABLE DE \n`
    extra += `${this._tipoCable}, DEBERÁ SER NO MENOR DE 8.00 M. \n`
    extra += '\n'
    extra += ` 8.- LA COLOCACIÓN DE LOS  POSTES DEBERÁN SER FUERA DEL ÁREA DEL DERECHO DE VÍA O DENTRO \n`
    extra += ` DE UNA FRANJA NO MAYOR DE 2.50 M. DE ANCHO EN AMBOS LADOS DE LA CARRETERA, MEDIDOS A \n`
    extra += ` PARTIR DEL LIMITE DEL DERECHO DE VÍA. \n`

    const el = new CTextoGrafico(current + extra)
    el.tamanio    = 30
    el.alineacion = 'top_left'
    cell.elemento = el
  }
}
