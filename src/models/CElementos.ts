// Source: adiciones_layout/source/c_elementos.magik
//
// Colección con índice por nombre de objetos "elemento gráfico". Propaga
// el canvas (oVentana) y el área de dibujo (oArea) a cada elemento antes
// de invocar su método Despliega.

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Magik: c_elemento_grafico (interfaz mínima requerida por c_elementos.Despliega)
export interface IElementoGrafico {
  oVentana?: CanvasRenderingContext2D;
  oArea?:    BoundingBox;
  // Magik: LoElemento.Actualiza_Area_Elemento()
  actualizaAreaElemento(): void;
  // Magik: LoElemento.Despliega()
  despliega(): void;
}

export class CElementos {
  private _nTotalElementos = 0;
  private _collElementos: Map<string, IElementoGrafico> = new Map();
  private _oVentana?: CanvasRenderingContext2D;
  private _oArea?:    BoundingBox;

  get nTotalElementos(): number { return this._nTotalElementos; }
  get collElementos(): ReadonlyMap<string, IElementoGrafico> { return this._collElementos; }
  get oVentana(): CanvasRenderingContext2D | undefined { return this._oVentana; }
  get oArea(): BoundingBox | undefined { return this._oArea; }

  set oVentana(v: CanvasRenderingContext2D | undefined) { this._oVentana = v; }
  set oArea(v: BoundingBox | undefined)                  { this._oArea    = v; }

  // Magik: c_elementos.Agregar_elemento(RoElemento, RsNombre)
  agregarElemento(elemento: IElementoGrafico, nombre: string): void {
    this._collElementos.set(nombre, elemento);
    this._nTotalElementos += 1;       // contador idéntico al original (no detecta duplicados)
  }

  // Magik: c_elementos.obten_elemento(RsNombre)
  obtenElemento(nombre: string): IElementoGrafico | undefined {
    return this._collElementos.get(nombre);
  }

  // Magik: c_elementos.Despliega()
  despliega(): void {
    for (const elemento of this._collElementos.values()) {
      elemento.oVentana = this._oVentana;
      elemento.oArea    = this._oArea;
      elemento.actualizaAreaElemento();
      elemento.despliega();
    }
  }

  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['nTotal_Elementos', 'collElementos', 'oArea'],
      values: [this._nTotalElementos, [...this._collElementos.entries()], this._oArea],
    };
  }
}
