import { CBaseSelloFibra } from './CBaseSelloFibra'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── GIS dataset record (D5) ────────────────────────────────────────────────────
// Positional data from GIS district collection (oDistrito[1..15] in Magik source)
export interface DistritoRecord {
  readonly distrito:    string   // [1]
  readonly fibras:      string   // [4]
  readonly cuentas:     string   // [5]
  readonly trayectoria: string   // [8]
  readonly nco:         string   // [9]
  readonly nse:         string   // [10]
  readonly clasifcomer: string   // [11]
  readonly viviendas:   string   // [12]
  readonly datos:       string   // [13]
  readonly clientes:    string   // [14]
  readonly distancia:   string   // [15]
}

const NOMBRE_TABLA = 'tbl_cuadro_resumen_distrito'
const PCT          = 0.35
const AZUL:  [number, number, number] = [0, 0, 1]
const VERDE: [number, number, number] = [0.3, 0.8, 0.3]
const ROJO:  [number, number, number] = [1, 0, 0]

const PROPS_CONOCIDAS = [
  'distrito', 'nco', 'trayectoria', 'distancia', 'nse',
  'clasifcomer', 'viviendas', 'fibras', 'cuentas', 'datos', 'clientes',
]

export class CCuadroResumenDistrito extends CBaseSelloFibra {
  private _distrito: DistritoRecord | undefined

  constructor(distrito?: DistritoRecord) {
    super()
    if (distrito) this._distrito = distrito
  }

  // ── Table configuration ────────────────────────────────────────────────────

  protected override configurarTabla(): void {
    const rglSize = 7 * (1 - PCT)    // 4.55 mm
    const rglNco  = 4 * (1 - PCT)    // 2.60 mm

    const tabla = this._tablas.crearTabla(6, 4, NOMBRE_TABLA)
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = rglSize
    tabla.renglones.elemento(2).longitud = rglNco
    for (let r = 3; r <= 6; r++) tabla.renglones.elemento(r).longitud = rglSize

    tabla.columnas.elemento(1).longitud = 30 * (1 - PCT)   // 19.5
    tabla.columnas.elemento(2).longitud = 10 * (1 - PCT)   //  6.5
    tabla.columnas.elemento(3).longitud = 30 * (1 - PCT)   // 19.5
    tabla.columnas.elemento(4).longitud = 18 * (1 - PCT)   // 11.7

    // Hide inner borders so district row reads as one span
    for (const [r, c] of [[1, 2], [1, 3]] as [number, number][]) {
      const bordes = tabla.celdas.celda(r, c).elementos.obtenerElemento('bordes_celda')
      bordes.bordeDer = false
      bordes.bordeIzq = false
    }
  }

  // ── Static labels ──────────────────────────────────────────────────────────

  override etiquetarCeldas(): void {
    const f = 30 * (1 - PCT)   // 19.5 pt

    // Column 1: row header labels
    this.asignarTextoCelda(NOMBRE_TABLA, 1, 1, 'DTO',                               f, 'centre_centre', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 1, 'NCO',                               f, 'top_centre',    0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 3, 1, 'TRAYECTORIA',                       f, 'top_centre',    0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 4, 1, 'DISTANCIA A\nNCO',                  f, 'top_centre',    0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 5, 1, 'NSE\nPREDOM',                       f, 'top_centre',    0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 6, 1, 'CLASIF\nPREDOM',                    f, 'top_centre',    0, AZUL)

    // Column 3: stat header labels
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 3, 'VIV,COM E IND',                     f, 'top_centre', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 3, 3, 'FIBRAS\nASIGNADAS',                 f, 'top_centre', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 4, 3, 'CUENTAS DE\nFO ASIG NCO',           f, 'top_centre', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 5, 3, 'C.DEDATOS + GAN\nSOL PENDIENTES',   f, 'top_centre', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 6, 3, 'CLIENTES\nSOLO VOZ',               f, 'top_centre', 0, AZUL)

    this.llenarDatosCeldas()
  }

  // ── Data calculation ───────────────────────────────────────────────────────

  calcularDatos(): Record<string, string> {
    const d = this._distrito
    const raw: Record<string, string> = {
      distrito:    d?.distrito    ?? '',
      fibras:      d?.fibras      ?? '',
      cuentas:     d?.cuentas     ?? '',
      nco:         d?.nco         ?? '',
      trayectoria: d?.trayectoria ?? '',
      distancia:   d?.distancia   ?? '',
      nse:         d?.nse         ?? '',
      clasifcomer: d?.clasifcomer ?? '',
      viviendas:   d?.viviendas   ?? '',
      datos:       d?.datos       ?? '',
      clientes:    d?.clientes    ?? '',
    }
    return this._infoSelloPropiedades(raw)
  }

  override llenarDatosCeldas(): void {
    const f      = 30 * (1 - PCT)
    const valores = this.calcularDatos()

    // Column 2: identification data
    this.asignarTextoCelda(NOMBRE_TABLA, 1, 3, (valores['distrito']    ?? '').toUpperCase(), f, 'centre_left', 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 2, (valores['nco']         ?? '').toUpperCase(), f, undefined,     0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 3, 2, (valores['trayectoria'] ?? '').toUpperCase(), f, undefined,     0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 4, 2, (valores['distancia']   ?? '').toUpperCase(), f, undefined,     0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 5, 2, (valores['nse']         ?? '').toUpperCase(), f, undefined,     0, VERDE)
    this.asignarTextoCelda(NOMBRE_TABLA, 6, 2, (valores['clasifcomer'] ?? '').toUpperCase(), f, undefined,     0, VERDE)

    // Column 4: statistics
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 4, (valores['viviendas'] ?? '').toUpperCase(), f, undefined, 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 3, 4, (valores['fibras']    ?? '').toUpperCase(), f, undefined, 0, ROJO)
    this.asignarTextoCelda(NOMBRE_TABLA, 4, 4, (valores['cuentas']   ?? '').toUpperCase(), f, undefined, 0, AZUL)
    this.asignarTextoCelda(NOMBRE_TABLA, 5, 4, (valores['datos']     ?? '').toUpperCase(), f, undefined, 0, VERDE)
    this.asignarTextoCelda(NOMBRE_TABLA, 6, 4, (valores['clientes']  ?? '').toUpperCase(), f, undefined, 0, VERDE)

    // Bold all data cells
    for (const [r, c] of [
      [1,3],[2,2],[3,2],[4,2],[5,2],[6,2],[2,4],[3,4],[4,4],[5,4],[6,4],
    ] as [number, number][]) {
      const el = this._tablas.elemento(NOMBRE_TABLA).celdas.celda(r, c).elemento
      if (el) (el as CTextoGrafico).estilo = 'Bold'
    }
  }

  actualizarDatos(): void {
    this.llenarDatosCeldas()
  }

  override asignarCeldasAColorear(): [string, number, number, [number, number, number]][] {
    return [[NOMBRE_TABLA, 3, 4, AZUL]]
  }

  // ── Layout attribute overrides (Fase 5 stub) ───────────────────────────────

  private _valorPropiedad(propiedad: string, datoActual: string): string {
    const attr = this._attributes.get(propiedad)
    if (attr?.value && attr.value.length > 0) return attr.value
    return datoActual
  }

  private _infoSelloPropiedades(valores: Record<string, string>): Record<string, string> {
    const result = { ...valores }
    for (const prop of PROPS_CONOCIDAS) {
      result[prop] = this._valorPropiedad(prop, result[prop] ?? '')
    }
    return result
  }
}
