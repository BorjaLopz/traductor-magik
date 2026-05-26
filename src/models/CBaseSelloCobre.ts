import { CBaseSello } from './CBaseSello'

// Cell color entry: [tableName, row, col, [r, g, b]]
type CeldaColor = [string, number, number, [number, number, number]]

export abstract class CBaseSelloCobre extends CBaseSello {
  protected _proyecto: unknown          // TODO: type as CProyecto once transcribed
  protected _distrito: unknown          // TODO: type as CDistrito once transcribed
  protected _tipoPlano: string | undefined
  protected _listaCeldasColor: CeldaColor[] = []

  override inicializar(properties: unknown[]): void {
    super.inicializar(properties)
    this._listaCeldasColor = this.asignarCeldasAColorear()
    // Fase 0 TODO: this._proyecto = new CProyecto()
    // Fase 0 TODO: this._distrito = new CDistrito()
  }

  asignarCeldasAColorear(): CeldaColor[] {
    return []
  }

  configurarColorSello(blancaNegra: boolean): void {
    for (const celdaColor of this._listaCeldasColor) {
      const [nombreTabla, numRenglon, numColumna, rgb] = celdaColor
      const color = blancaNegra ? [0, 0, 0] : rgb
      const celda = this._tablas.elemento(nombreTabla).celdas.celda(numRenglon, numColumna)
      if (celda.elemento !== undefined) {
        (celda.elemento as { color: unknown }).color = color
      }
    }
  }

  override drawContentOn(window: unknown): void {
    // Fase 0 TODO: read blanco_negro attribute from layout attributes
    this.configurarColorSello(false)
    super.drawContentOn(window)
  }

  enumBool(): Map<number, string> {
    return new Map([[1, 'SI'], [2, 'NO']])
  }

  escala(): string {
    try {
      // Fase 5 TODO: resolve viewport scale from layout plugin
      return ''
    } catch {
      return 'F/E'
    }
  }

  nombrePlano(): string {
    try {
      // Fase 5 TODO: resolve from layout document
      return ''
    } catch {
      return ''
    }
  }

  tipoPlano(): string | undefined {
    try {
      // Fase 5 TODO: this.layoutDocument.user!_tipo_plano
      return undefined
    } catch {
      return undefined
    }
  }
}
