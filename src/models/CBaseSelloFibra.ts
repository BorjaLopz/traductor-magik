import { CBaseSello } from './CBaseSello'
import type { IBordesElemento, ITabla } from './CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// [tableName, row, col, [r, g, b]]  — r/g/b in 0-1 range
export type CeldaColorFibra = [string, number, number, [number, number, number]]

export type ConfigBordes = {
  borderDerIzq?: [number, number][]
  borderDer?:    [number, number][]
  borderIzq?:    [number, number][]
  borderSupInf?: [number, number][]
  borderSup?:    [number, number][]
  borderInf?:    [number, number][]
}

function rgbToStyle(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => Math.round(v * 255))
  return `rgb(${r},${g},${b})`
}

export abstract class CBaseSelloFibra extends CBaseSello {
  protected _distribuidorDatos: unknown = undefined
  protected _listaCeldasColor: CeldaColorFibra[] = []
  protected _blancaNegra: boolean = false
  protected _attributes: Map<string, { value?: string }> = new Map()

  override inicializar(properties: unknown[]): void {
    super.inicializar(properties)
    this._listaCeldasColor = this.asignarCeldasAColorear()
  }

  asignarCeldasAColorear(): CeldaColorFibra[] { return [] }

  configurarColorSello(): void {
    for (const [nombreTabla, numRenglon, numColumna, rgb] of this._listaCeldasColor) {
      const color = this._blancaNegra ? ([0, 0, 0] as [number, number, number]) : rgb
      const celda = this._tablas.elemento(nombreTabla).celdas.celda(numRenglon, numColumna)
      if (celda.elemento !== undefined) {
        (celda.elemento as CTextoGrafico).color = rgbToStyle(color)
      }
    }
  }

  override drawContentOn(window: unknown): void {
    this.configurarColorSello()
    super.drawContentOn(window)
  }

  protected asignarSimboloCelda(
    _nombreTabla: string,
    _renglon: number,
    _columna: number,
    _simbolo: string,
    _escala: number,
  ): void {
    // TODO(GIS): GIS symbol placement — not renderable in showcase
  }

  protected asignarTextoCelda(
    nombreTabla: string,
    renglon: number,
    columna: number,
    texto: string,
    tamanio: number,
    alineacion: string | undefined,
    angulo: number = 0,
    color: [number, number, number] = [0, 0, 0],
  ): void {
    const celda = this._tablas.elemento(nombreTabla).celdas.celda(renglon, columna)
    const el = new CTextoGrafico(texto)
    el.tamanio = tamanio
    el.alineacion = alineacion
    el.grados = angulo
    el.color = rgbToStyle(color)
    celda.elemento = el
  }

  ocultarBordesCeldas(tabla: ITabla, config: ConfigBordes): void {
    const apply = (
      pairs: [number, number][] | undefined,
      fn: (b: IBordesElemento) => void,
    ): void => {
      if (!pairs) return
      for (const [r, c] of pairs) {
        const bordes = tabla.celdas.celda(r, c).elementos.obtenerElemento('bordes_celda')
        fn(bordes)
      }
    }
    apply(config.borderDerIzq, b => { b.bordeDer = false; b.bordeIzq = false })
    apply(config.borderDer,    b => { b.bordeDer = false })
    apply(config.borderIzq,    b => { b.bordeIzq = false })
    apply(config.borderSupInf, b => { b.bordeSup = false; b.bordeInf = false })
    apply(config.borderSup,    b => { b.bordeSup = false })
    apply(config.borderInf,    b => { b.bordeInf = false })
  }

  // ── GIS stubs (Fase 5) ─────────────────────────────────────────────────────

  enumBool(): Map<number, string> {
    return new Map([[1, 'SI'], [2, 'NO']])
  }

  tipoPlano(): string | undefined {
    try { return undefined } catch { return undefined }
  }

  nombrePlano(): string {
    try { return '' } catch { return '' }
  }

  escala(): string {
    try { return '' } catch { return 'F/E' }
  }

  obtenerRegistros(): unknown {
    // Fase 5 TODO: CDistribuidorDatosSellos.obtenerInstancia().obtenerDatosSello(this)
    return undefined
  }
}
