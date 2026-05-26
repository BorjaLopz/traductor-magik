// Source: adiciones_layout/source/c_celdas.magik
//         adiciones_layout/source/c_celda.magik   (referencia obligatoria)
//
// Estructura matricial de celdas (renglones × columnas). Cada c_celda contiene:
//   - oElemento           : contenido principal (texto/símbolo gráfico)
//   - oElementos          : colección con sub-elementos, p.ej. :bordes_celda
//   - oElementos_captura  : colección paralela para captura (no se usa aquí)
//
// Indexado linealizado: pos = nNumCol * (nRen - 1) + nCol  (1-based).

import { CElementos, type IElementoGrafico } from './CElementos';

export type BordeLado = 'izquierda' | 'derecha' | 'superior' | 'inferior';

// Magik: c_celdas_grafico — flags de borde implementando IElementoGrafico
export class BordesCelda implements IElementoGrafico {
  bBorde_izq?: boolean;
  bBorde_der?: boolean;
  bBorde_sup?: boolean;
  bBorde_inf?: boolean;
  oVentana?:   CanvasRenderingContext2D;
  oArea?:      { x: number; y: number; w: number; h: number };

  constructor(init?: Partial<Pick<BordesCelda, 'bBorde_izq' | 'bBorde_der' | 'bBorde_sup' | 'bBorde_inf'>>) {
    this.bBorde_izq = init?.bBorde_izq ?? true;
    this.bBorde_der = init?.bBorde_der ?? true;
    this.bBorde_sup = init?.bBorde_sup ?? true;
    this.bBorde_inf = init?.bBorde_inf ?? true;
  }

  actualizaAreaElemento(): void { /* nada — c_celdas_grafico no recalcula área */ }

  despliega(): void {
    const ctx = this.oVentana;
    const a = this.oArea;
    if (!ctx || !a) return;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    if (this.bBorde_sup) { ctx.beginPath(); ctx.moveTo(a.x,         a.y);         ctx.lineTo(a.x + a.w, a.y);         ctx.stroke(); }
    if (this.bBorde_inf) { ctx.beginPath(); ctx.moveTo(a.x,         a.y + a.h);   ctx.lineTo(a.x + a.w, a.y + a.h);   ctx.stroke(); }
    if (this.bBorde_izq) { ctx.beginPath(); ctx.moveTo(a.x,         a.y);         ctx.lineTo(a.x,         a.y + a.h); ctx.stroke(); }
    if (this.bBorde_der) { ctx.beginPath(); ctx.moveTo(a.x + a.w,   a.y);         ctx.lineTo(a.x + a.w,   a.y + a.h); ctx.stroke(); }
  }
}

// Magik: c_texto_grafico — versión mínima necesaria para c_celda.texto
export interface TextoGrafico {
  sTexto:   string;
  nTamanio: number;
}

export function nuevoTextoGrafico(texto: string): TextoGrafico {
  return { sTexto: texto, nTamanio: 12 };
}

export { CElementos };

// Magik: c_celda
export class CCelda {
  nRen: number;
  nCol: number;

  // oElemento — _unset hasta que se asigne texto
  oElemento: TextoGrafico | undefined = undefined;

  oElementos:         CElementos;
  oElementos_captura: CElementos;

  constructor(nRen: number, nCol: number) {
    this.nRen = nRen;
    this.nCol = nCol;
    this.oElementos         = new CElementos();
    this.oElementos_captura = new CElementos();

    // _self.oElementos.Agregar_Elemento(LoCelda, :bordes_celda)
    this.oElementos.agregarElemento(new BordesCelda(), 'bordes_celda');
  }

  // Magik: c_celda.texto / c_celda.texto << pVal
  get texto(): string | undefined {
    return this.oElemento?.sTexto;
  }

  set texto(pVal: string) {
    if (this.oElemento === undefined) {
      this.oElemento = nuevoTextoGrafico(pVal);
    } else {
      this.oElemento.sTexto = pVal;
    }
  }

  // Magik: c_celda.bordes — devuelve la celda gráfica con los 4 flags
  get bordes(): BordesCelda {
    return this.oElementos.obtenElemento('bordes_celda') as BordesCelda;
  }

  // Magik: c_celda.bordes(pLado) — getter por lado
  bordeOf(lado: BordeLado): boolean | undefined {
    const b = this.bordes;
    switch (lado) {
      case 'izquierda': return b.bBorde_izq;
      case 'derecha':   return b.bBorde_der;
      case 'superior':  return b.bBorde_sup;
      case 'inferior':  return b.bBorde_inf;
    }
  }

  // Magik: c_celda.bordes(pLado) << pVal — setter por lado
  setBorde(lado: BordeLado, val: boolean): void {
    const b = this.bordes;
    switch (lado) {
      case 'izquierda': b.bBorde_izq = val; break;
      case 'derecha':   b.bBorde_der = val; break;
      case 'superior':  b.bBorde_sup = val; break;
      case 'inferior':  b.bBorde_inf = val; break;
    }
  }
}

// Magik: c_celdas
export class CCeldas {
  private _nNumRen: number;
  private _nNumCol: number;
  private readonly _collCeldas: CCelda[] = [];

  constructor(nNumRen: number, nNumCol: number) {
    if (nNumRen <= 0) throw new Error('Error al asignar el número de renglón');
    if (nNumCol <= 0) throw new Error('Error al asignar el número de columnas');

    this._nNumRen = nNumRen;
    this._nNumCol = nNumCol;

    // Magik: doble loop ren/col creando c_celda.new(LnRen, LnCol)
    for (let r = 1; r <= nNumRen; r++) {
      for (let c = 1; c <= nNumCol; c++) {
        const pos = this._linearPos(r, c);
        this._collCeldas[pos] = new CCelda(r, c);
      }
    }
  }

  get nNumRen(): number { return this._nNumRen; }
  get nNumCol(): number { return this._nNumCol; }

  // Magik: c_celdas.celda(RnRen, RnCol)
  celda(rnRen: number, rnCol: number): CCelda {
    // Magik: _if RnRen > nNumRen _or RnCol > nNumCol → condition.raise warning
    if (rnRen > this._nNumRen || rnCol > this._nNumCol || rnRen < 1 || rnCol < 1) {
      throw new Error(`La celda que se solicita no existe ${rnRen} ${rnCol}`);
    }
    return this._collCeldas[this._linearPos(rnRen, rnCol)];
  }

  // Recorrido lineal ren-major (idéntico al loop original)
  forEach(fn: (c: CCelda) => void): void {
    for (let r = 1; r <= this._nNumRen; r++) {
      for (let c = 1; c <= this._nNumCol; c++) {
        fn(this._collCeldas[this._linearPos(r, c)]);
      }
    }
  }

  // pos = nNumCol * (ren-1) + col
  private _linearPos(ren: number, col: number): number {
    return this._nNumCol * (ren - 1) + col;
  }

  // Magik: serial_slots
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['nNumRen', 'nNumCol', 'collCeldas'],
      values: [this._nNumRen, this._nNumCol, this._collCeldas.slice(1)],
    };
  }
}
