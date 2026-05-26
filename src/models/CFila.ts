// Source: adiciones_layout/source/c_fila.magik
//
// Clase mínima — sólo almacena nLongitud. Comportamiento anómalo del original:
//
//   - new(R)              .nLongitud << R           (sin transformación)
//   - .nLongitud << val   .nLongitud << val * 10    (×10 + valida val ≥ 0)
//   - .nLongitud          devuelve valor crudo
//   - serial_slots        devuelve .nLongitud / 10  (compensa el ×10 del setter)
//
// El factor ×10 sólo aplica en la vía del setter; los valores creados por
// new() salen del serial como /10 de su valor original (asimetría heredada).

export class CFila {
  private _nLongitud!: number;

  // Magik: c_fila.new(RnLongitud) — sin transformación
  constructor(rnLongitud: number) {
    this._nLongitud = rnLongitud;
  }

  // Magik: c_fila.nLongitud (getter)
  get nLongitud(): number {
    return this._nLongitud;
  }

  // Magik: c_fila.nLongitud << RnValor — ×10 + guard negativo
  set nLongitud(rnValor: number) {
    if (rnValor < 0) {
      throw new Error('Longitud no puede ser menor que cero');
    }
    this._nLongitud = rnValor * 10;
  }

  // Magik: serial_slots — devuelve nLongitud / 10 (con catch a 0)
  serialSlots(): { keys: string[]; values: number[] } {
    let lnLong: number;
    try {
      lnLong = this._nLongitud / 10;
    } catch {
      lnLong = 0;
    }
    return { keys: ['nLongitud'], values: [lnLong] };
  }
}
