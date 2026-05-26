export class CFila {
  private _longitud: number

  constructor(longitud: number = 0) {
    // Direct slot init (no ×10 — only the setter multiplies)
    this._longitud = longitud
  }

  get longitud(): number { return this._longitud }

  set longitud(v: number) {
    if (v < 0) return
    this._longitud = v * 10  // mm → internal units (same pattern as CElementoGrafico margins)
  }
}
