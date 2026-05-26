// Fase 5 TODO: implement rendering via OpenLayers / Canvas 2D
export class CElementoGrafico {
  protected _ventana: unknown
  protected _area: unknown
  private _margenSup: number = 0
  private _margenInf: number = 0
  private _margenIzq: number = 0
  private _margenDer: number = 0

  // Setters multiply by 10 (mm → internal units, per Magik source)
  get margenSup(): number  { return this._margenSup }
  set margenSup(v: number) { this._margenSup = v * 10 }

  get margenInf(): number  { return this._margenInf }
  set margenInf(v: number) { this._margenInf = v * 10 }

  get margenIzq(): number  { return this._margenIzq }
  set margenIzq(v: number) { this._margenIzq = v * 10 }

  get margenDer(): number  { return this._margenDer }
  set margenDer(v: number) { this._margenDer = v * 10 }

  drawContentOn(_window: unknown): void {
    throw new Error('drawContentOn: implement in Fase 5')
  }
}
