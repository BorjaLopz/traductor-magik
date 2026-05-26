import { CFila } from './CFila'

export class CFilas {
  private _totalFilas: number = 0
  private _filas: CFila[] = []
  private _longTotal: number = 0

  constructor(totalFilas: number = 0) {
    if (totalFilas > 0) this._inicializar(totalFilas)
  }

  private _inicializar(total: number): void {
    this._totalFilas = total
    this._filas = Array.from({ length: total }, () => new CFila(10))
  }

  // ── Getters / setters ──────────────────────────────────────────────────────

  get totalFilas(): number { return this._totalFilas }
  set totalFilas(v: number) {
    if (v > 0) this._totalFilas = v
  }

  get longTotal(): number { return this._longTotal }
  set longTotal(v: number) {
    if (v > 0) this._longTotal = v
  }

  get totalElementos(): number { return this._totalFilas }

  // ── Methods ────────────────────────────────────────────────────────────────

  elemento(n: number): CFila {
    if (n <= 0 || n > this._totalFilas) {
      console.warn(`CFilas.elemento: índice ${n} fuera de rango [1..${this._totalFilas}]`)
    }
    return this._filas[n - 1]!
  }

  iniciaElemento(n: number): number {
    let acc = 0
    for (let i = 0; i < n - 1; i++) {
      acc += this._filas[i]?.longitud ?? 0
    }
    return acc
  }

  longitudTotal(): number {
    let acc = 0
    for (const fila of this._filas) acc += fila.longitud
    return acc
  }
}
