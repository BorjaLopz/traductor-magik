// Source: adiciones_layout/source/c_Tabla.magik
//
// Matriz N×M de celdas con dimensiones físicas (mm), color de línea
// y 3 flags para bordes (externos, columnas internas, renglones internos).
//
// La activación de un borde puntual se SINCRONIZA con la celda adyacente:
// si la celda (1,1) desactiva su borde derecho → la (1,2) desactiva su izquierdo.

export type RGB = readonly [r: number, g: number, b: number];   // 0..1 o 0..255

export type BordeLado = 'izquierda' | 'derecha' | 'superior' | 'inferior';

export interface BordesCelda {
  sup:        boolean;
  inf:        boolean;
  izq:        boolean;
  der:        boolean;
  colorLinea: RGB;
}

export interface Celda {
  nRen:    number;
  nCol:    number;
  bordes:  BordesCelda;
  texto?:  string;
}

export interface Fila {
  nLongitud: number;   // mm
}

export interface Coordinate { x: number; y: number }
export interface BoundingBox { xmin: number; ymin: number; xmax: number; ymax: number }

const BLACK: RGB = [0, 0, 0];

function newBordes(color: RGB): BordesCelda {
  return { sup: true, inf: true, izq: true, der: true, colorLinea: color };
}

// =============================================================================
// CLASE
// =============================================================================

export class CTabla {
  // Slots
  sNombre:                    string  = '';
  bDibujaColumnasInternas:    boolean = true;
  bDibujaRenglonesInternos:   boolean = true;
  oCoordenadaOrigen:          Coordinate = { x: 0, y: 0 };
  sColorLinea:                RGB     = BLACK;

  // Magik: oRenglones / oColumnas (c_filas con .nLongitud por elemento)
  readonly oRenglones: Fila[];
  readonly oColumnas:  Fila[];

  // Magik: oCeldas (c_celdas — matriz)
  readonly oCeldas:    Celda[][];

  // Magik: c_tabla.new(RnRenglones, RnColumnas, _optional PsColorLinea)
  constructor(nRenglones: number, nColumnas: number, psColorLinea: RGB = BLACK) {
    if (nRenglones <= 0 || nColumnas <= 0) {
      throw new Error('Dimensiones deben ser > 0');
    }
    this.sColorLinea = psColorLinea;
    this.oRenglones  = Array.from({ length: nRenglones }, () => ({ nLongitud: 10 }));
    this.oColumnas   = Array.from({ length: nColumnas }, () => ({ nLongitud: 30 }));
    this.oCeldas = Array.from({ length: nRenglones }, (_, r) =>
      Array.from({ length: nColumnas }, (_, c) => ({
        nRen:   r + 1,
        nCol:   c + 1,
        bordes: newBordes(psColorLinea),
      })),
    );
    // Setters Magik (orden del original)
    this.setRenglonesInternos(true);
    this.setColumnasInternas(true);
    this.setBordesExternos(true);
  }

  get totalRenglones(): number { return this.oRenglones.length }
  get totalColumnas():  number { return this.oColumnas.length  }

  // Magik: c_tabla.celda(pRen, pCol)
  celda(pRen: number, pCol: number): Celda {
    if (pRen < 1 || pRen > this.totalRenglones || pCol < 1 || pCol > this.totalColumnas) {
      throw new Error(`Celda fuera de rango: (${pRen}, ${pCol})`);
    }
    return this.oCeldas[pRen - 1][pCol - 1];
  }

  // Magik: c_tabla.activa_borde_celda(pRen, pCol, pBordeUbicacion) << pActivo
  // Sincroniza con la adyacente (der↔izq, sup↔inf).
  activaBordeCelda(pRen: number, pCol: number, lado: BordeLado, activo: boolean): void {
    const c = this.celda(pRen, pCol);
    setLado(c.bordes, lado, activo);

    let adyacente: Celda | undefined;
    let ladoAdyacente: BordeLado | undefined;
    switch (lado) {
      case 'derecha':
        if (pCol < this.totalColumnas)   { adyacente = this.celda(pRen, pCol + 1); ladoAdyacente = 'izquierda'; }
        break;
      case 'izquierda':
        if (pCol > 1)                    { adyacente = this.celda(pRen, pCol - 1); ladoAdyacente = 'derecha'; }
        break;
      case 'superior':
        if (pRen > 1)                    { adyacente = this.celda(pRen - 1, pCol); ladoAdyacente = 'inferior'; }
        break;
      case 'inferior':
        if (pRen < this.totalRenglones)  { adyacente = this.celda(pRen + 1, pCol); ladoAdyacente = 'superior'; }
        break;
    }
    if (adyacente && ladoAdyacente) {
      setLado(adyacente.bordes, ladoAdyacente, activo);
    }
  }

  // Magik: bDibuja_bordes? << val — bordes EXTERNOS (perímetro)
  setBordesExternos(activo: boolean): void {
    const N = this.totalRenglones, M = this.totalColumnas;
    for (let c = 1; c <= M; c++) {
      this.celda(1, c).bordes.sup = activo;
      this.celda(N, c).bordes.inf = activo;
    }
    for (let r = 1; r <= N; r++) {
      this.celda(r, 1).bordes.izq = activo;
      this.celda(r, M).bordes.der = activo;
    }
    // El original también escribe .bDibuja_columnas_internas (efecto secundario raro,
    // pero se respeta porque es lo que hace `bDibuja_bordes? << val`).
    this.bDibujaColumnasInternas = activo;
  }

  // Magik: bDibuja_columnas_internas? << val — bordes der de celdas (cols 1..M-1)
  setColumnasInternas(activo: boolean): void {
    const N = this.totalRenglones, M = this.totalColumnas;
    for (let r = 1; r <= N; r++) {
      for (let c = 1; c <= M - 1; c++) {
        this.celda(r, c).bordes.der = activo;
        // Sincronización con la adyacente (izq de la siguiente)
        this.celda(r, c + 1).bordes.izq = activo;
      }
    }
    this.bDibujaColumnasInternas = activo;
  }

  // Magik: bDibuja_renglones_internos? << val — bordes inf de celdas (rens 1..N-1)
  setRenglonesInternos(activo: boolean): void {
    const N = this.totalRenglones, M = this.totalColumnas;
    for (let r = 1; r <= N - 1; r++) {
      for (let c = 1; c <= M; c++) {
        this.celda(r,     c).bordes.inf = activo;
        this.celda(r + 1, c).bordes.sup = activo;
      }
    }
    this.bDibujaRenglonesInternos = activo;
  }

  // Magik: color_linea << [r,g,b] — propaga a todas las celdas
  setColorLinea(rgb: RGB): void {
    this.sColorLinea = rgb;
    for (const row of this.oCeldas) {
      for (const c of row) {
        c.bordes.colorLinea = rgb;
      }
    }
  }

  // Magik: oCoordenada_Origen << RoCoordenada
  setCoordenadaOrigen(coord: Coordinate): void {
    this.oCoordenadaOrigen = { x: coord.x, y: coord.y };
  }

  // Magik: c_tabla.Calcula_area_tabla — bbox que envuelve toda la tabla
  calculaAreaTabla(): BoundingBox {
    const totalW = this.oColumnas.reduce((a, c) => a + c.nLongitud, 0);
    const totalH = this.oRenglones.reduce((a, r) => a + r.nLongitud, 0);
    const { x, y } = this.oCoordenadaOrigen;
    return { xmin: x, ymin: y - totalH, xmax: x + totalW, ymax: y };
  }

  // Magik: c_filas.Inicia_Elemento(n) — desplazamiento acumulado
  iniciaCol(n: number): number {
    let acc = 0;
    for (let i = 0; i < n - 1; i++) acc += this.oColumnas[i].nLongitud;
    return acc;
  }
  iniciaRen(n: number): number {
    let acc = 0;
    for (let i = 0; i < n - 1; i++) acc += this.oRenglones[i].nLongitud;
    return acc;
  }

  // Bbox de una celda específica (en coords absolutas con origen incluido)
  bboxCelda(pRen: number, pCol: number): BoundingBox {
    const { x, y } = this.oCoordenadaOrigen;
    const x1 = x + this.iniciaCol(pCol);
    const x2 = x1 + this.oColumnas[pCol - 1].nLongitud;
    const y2 = y - this.iniciaRen(pRen);
    const y1 = y2 - this.oRenglones[pRen - 1].nLongitud;
    return { xmin: x1, ymin: y1, xmax: x2, ymax: y2 };
  }
}

function setLado(b: BordesCelda, lado: BordeLado, v: boolean): void {
  switch (lado) {
    case 'izquierda': b.izq = v; break;
    case 'derecha':   b.der = v; break;
    case 'superior':  b.sup = v; break;
    case 'inferior':  b.inf = v; break;
  }
}
