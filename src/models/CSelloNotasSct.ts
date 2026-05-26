// Magik source: adiciones_layout/source/Sellos/c_sello_notas_sct.magik
import { CBaseSello } from './CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

const T = 'tbl_notas_grales'

export class CSelloNotasSct extends CBaseSello {
  protected _estado    = 'JALISCO'
  protected _tipoCable = 'FIBRAS ÓPTICAS'

  setDemoValues(estado: string, tipoCable: string): void {
    this._estado    = estado.toUpperCase()
    this._tipoCable = tipoCable
  }

  protected override configurarTabla(): void {
    this.prvCreaCfgTblNotasGrales(this._coordInicio)
  }

  // Row 2: 55 mm, Col 1: 155 mm — overridden by subclasses
  protected prvCreaCfgTblNotasGrales(roCoord: [number, number]): void {
    const t = this._tablas.crearTabla(2, 1, T)
    t.coordenadaOrigen = roCoord
    t.renglones.elemento(1).longitud = 10
    t.renglones.elemento(2).longitud = 55
    t.columnas.elemento(1).longitud  = 155
  }

  override etiquetarCeldas(): void {
    const celdas = this._tablas.elemento(T).celdas

    const titulo = new CTextoGrafico('NOTAS SCT')
    titulo.tamanio    = 50
    titulo.alineacion = 'centre_centre'
    celdas.celda(1, 1).elemento = titulo

    const desc = new CTextoGrafico('')
    desc.tamanio    = 30
    desc.alineacion = 'top_left'
    celdas.celda(2, 1).elemento = desc

    this.llenarDatosCeldas()
  }

  override llenarDatosCeldas(): void {
    const cell = this._tablas.elemento(T).celdas.celda(2, 1)

    let texto = '\n'
    texto += ` 1.- TODAS LAS DIMENSIONES ESTÁN EN METROS, EXCEPTO LAS INDICADAS EN OTRA UNIDAD. \n\n`
    texto += ` 2.- PARA CUALQUIER MODIFICACIÓN A ESTE PROYECTO, TELÉFONOS DE MÉXICO, S.A. DE C.V. DEBERÁ\n`
    texto += ` COMUNICAR Y SOLICITAR A ESTA SECRETARIA LA REVISIÓN Y DICTAMEN CORRESPONDIENTE. \n\n`
    texto += ` 3.- TELÉFONOS DE MÉXICO, S.A. DE C.V. INFORMARA POR ESCRITO A LA RESIDENCIA GENERAL DE \n`
    texto += ` CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this._estado} LA FECHA DE \n`
    texto += ` INICIACIÓN DE LOS TRABAJOS CON DIEZ DÍAS DE ANTICIPACIÓN, PREVIA SUPERVISIÓN DE LA ZONA. \n\n`
    texto += ` 4.- LOS TRABAJOS DEBERÁN INICIARSE A MAS TARDAR 30 DÍAS NATURALES DESPUÉS DE OTORGADO EL \n`
    texto += ` PERMISO POR LA SECRETARIA Y CONCLUIRSE EN UN PLAZO NO MAYOR DE 180 DÍAS NATURALES A \n`
    texto += ` PARTIR DE SU INICIO. \n`

    const el = new CTextoGrafico(texto)
    el.tamanio    = 30
    el.alineacion = 'top_left'
    cell.elemento = el
  }
}
