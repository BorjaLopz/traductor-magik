// Source: adiciones_layout/source/Sellos/Utilerias/Tramo/c_elementos_tramo_g.magik
// Colección gráfica de elementos de tramo.
// CElementos — base: hash_table de CElementoGrafico, contador total.
// CElementosTrG — añade sNombreGrafico, override nTotalElementos (solo habilitados)
//                 y longitudTotal() que excluye instancias c_elemento_empalme_g.

export interface CElementoGrafico {
  bHabilitar: boolean;
  nLongGrafica: number;
  esEmpalme: boolean;
}

export class CElementos {
  protected _collElementos: Map<string, CElementoGrafico>;
  private _nTotalElementos: number;

  constructor() {
    this._collElementos = new Map();
    this._nTotalElementos = 0;
  }

  agregarElemento(elemento: CElementoGrafico, nombre: string): void {
    this._collElementos.set(nombre, elemento);
    this._nTotalElementos++;
  }

  obtenElemento(nombre: string): CElementoGrafico | undefined {
    return this._collElementos.get(nombre);
  }

  get nTotalElementos(): number {
    return this._nTotalElementos;
  }

  get collElementos(): Map<string, CElementoGrafico> {
    return this._collElementos;
  }
}

export class CElementosTrG extends CElementos {
  private _sNombreGrafico: string;

  constructor() {
    super();
    this._sNombreGrafico = '';
  }

  get sNombreGrafico(): string {
    return this._sNombreGrafico;
  }

  set sNombreGrafico(value: string) {
    this._sNombreGrafico = value;
  }

  // Magik: override de slot nTotal_Elementos — solo cuenta elementos habilitados
  override get nTotalElementos(): number {
    let count = 0;
    for (const el of this._collElementos.values()) {
      if (el.bHabilitar) count++;
    }
    return count;
  }

  // Magik: Longitud_Total — suma nLong_Grafica de habilitados excluyendo c_elemento_empalme_g
  longitudTotal(): number {
    let total = 0;
    for (const el of this._collElementos.values()) {
      if (el.bHabilitar && !el.esEmpalme) {
        total += el.nLongGrafica;
      }
    }
    return total;
  }
}
