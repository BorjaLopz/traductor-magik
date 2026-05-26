// Source: adiciones_layout/source/c_tabla_simbologia.magik
//
// Tabla de SIMBOLOGÍA — compone 4 sub-tablas:
//   tbl_TitSimbologia (1×1) — título "SIMBOLOGIA"     (60mm × 5mm)
//   tbl_SubSimbologia (1×3) — ELEMENTO/EXISTENTE/PROY (30+15+15mm × 3mm)
//   tbl_EleSimbologia (N×1) — nombre del elemento     (30mm × 7mm)
//   tbl_SimSimbologia (N×2) — símbolo existente/proy  (15+15mm × 7mm)
//
// N por defecto = 11 (def_slotted Magik fija 11 renglones).

export type SimbologiaRow = readonly [
  elemento:   string,
  existente:  string,
  proyectado: string,
];

export interface Coordinate {
  x: number;   // mm
  y: number;   // mm
}

// Magik: c_tabla_simbologia.Llena_Lista — datos de prueba
export const LISTA_DEMO: readonly SimbologiaRow[] = [
  ['CANALIZACION CON POZO TELMEX', 'CANALIZACION CON POZO',  'CANALIZACION CON POZO P'],
  ['CAJA DE DISTRIBUCION',         'CAJA',                   'CAJA DE DISTRIBUCION P'],
  ['POSTE TELMEX',                 'POSTE DE TELMEX 1',      'POSTE DE TELMEX P'],
  ['POSTE LUZ',                    'POSTE DE LUZ 1',         ' '],
  ['REGISTRO AJENO',               'REGISTRO AJENO',         ' '],
  ['COLADERA PLUVIAL',             'COLADERA PLUVIAL',       ' '],
  ['CANALIZACION DE GAS',          'CNALIZACION DE GAS',     ' '],
  ['CANALIZACION DE AGUA',         'CANALIZACION DE AGUA',   ' '],
  ['CANALIZACION DE DRENAJE',      'CANALIZACION DE DRENAJE',' '],
  ['CABLE DE LUZ',                 'CABLE DE LUZ',           ' '],
  ['ARBOL',                        'ARBOL 1',                ' '],
];

// Magik: c_texto_grafico — texto con tamaño + alineación
export interface TextoGrafico {
  texto:      string;
  tamanio:    number;            // .nTamanio
  alineacion: 'centre_left' | 'centre' | 'centre_right';
  margenIzq:  number;            // .nMargen_izq
}

// Magik: c_simbolo_grafico — símbolo gráfico con márgenes
export interface SimboloGrafico {
  nombreGrafico: string;         // .sNombre_grafico
  margenIzq:     number;
  margenDer:     number;
  margenSup:     number;
  margenInf:     number;
  grupoEstilos:  'default';
}

export interface SubTabla {
  nombre:      string;
  rows:        number;
  cols:        number;
  rowHeights:  number[];         // mm
  colWidths:   number[];         // mm
  origen:      Coordinate;
  dibujaRenglonesInternos: boolean;
  dibujaColumnasInternas:  boolean;
  // Celdas indexadas: cells[row-1][col-1]
  cells:       (TextoGrafico | SimboloGrafico | undefined)[][];
}

// =============================================================================
// FÁBRICAS DE OBJETOS GRÁFICOS
// =============================================================================

function textoBase(texto: string): TextoGrafico {
  // Magik: LoBase << c_texto_grafico.new("BASE"); .nTamanio<<17; .sAlineacion<<:centre_left
  return { texto, tamanio: 17, alineacion: 'centre_left', margenIzq: 0 };
}

function nuevoTextoElemento(texto: string): TextoGrafico {
  // Magik: c_texto_grafico.new_from(LoBase, ...) + nMargen_izq << 0.5
  return { ...textoBase(texto), margenIzq: 0.5 };
}

function nuevoSimbolo(nombre: string): SimboloGrafico {
  // Magik: c_simbolo_grafico.new("Granja"); margen[izq,der,sup,inf] << 1
  return {
    nombreGrafico: nombre,
    margenIzq:     1,
    margenDer:     1,
    margenSup:     1,
    margenInf:     1,
    grupoEstilos:  'default',
  };
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CTablaSimbologia {
  readonly oLayout:      string;          // identificador de layout (mock)
  readonly oCoordOrigen: Coordinate;

  private _elementos: SimbologiaRow[] = [];

  // Sub-tablas resultado de prvCrea_Cfg_Tablas + Llena_*
  tblTitulo!:  SubTabla;
  tblSub!:     SubTabla;
  tblEle!:     SubTabla;
  tblSim!:     SubTabla;

  // Magik: c_tabla_simbologia.new(RoLayout, RoCoord)
  constructor(layout: string, coordOrigen: Coordinate, elementos: readonly SimbologiaRow[] = LISTA_DEMO) {
    this.oLayout      = layout;
    this.oCoordOrigen = coordOrigen;
    this._elementos   = [...elementos];

    this.prvCrearCfgTablas();
    this.prvLlenarTblTitulo();
    this.llenaElementos(this._elementos);
  }

  get elementos(): readonly SimbologiaRow[] { return this._elementos; }

  // Magik: c_tabla_simbologia.Pon_Elementos — actualiza textos/símbolos sin recrear objetos
  ponElementos(rows: readonly SimbologiaRow[]): void {
    this._elementos = [...rows];
    for (let i = 0; i < rows.length; i++) {
      const [ele, exi, pro] = rows[i];
      const textCell = this.tblEle.cells[i]?.[0] as TextoGrafico | undefined;
      if (textCell) textCell.texto = ele;

      const exiCell = this.tblSim.cells[i]?.[0] as SimboloGrafico | undefined;
      if (exiCell) exiCell.nombreGrafico = exi;

      const proCell = this.tblSim.cells[i]?.[1] as SimboloGrafico | undefined;
      if (proCell) proCell.nombreGrafico = pro;
    }
  }

  // Magik: c_tabla_simbologia.Llena_Elementos — crea texto/símbolo por renglón
  llenaElementos(rows: readonly SimbologiaRow[]): void {
    this._elementos = [...rows];
    for (let i = 0; i < rows.length; i++) {
      const [ele, exi, pro] = rows[i];
      this.tblEle.cells[i][0] = nuevoTextoElemento(ele);
      this.tblSim.cells[i][0] = nuevoSimbolo(exi);
      this.tblSim.cells[i][1] = nuevoSimbolo(pro);
    }
  }

  // Magik: prvCrea_Cfg_Tablas
  private prvCrearCfgTablas(): void {
    const altura = this.prvCrearCfgTblTitulo(this.oCoordOrigen);
    const coordDetalle: Coordinate = {
      x: this.oCoordOrigen.x,
      y: this.oCoordOrigen.y - altura,
    };
    this.prvCrearCfgDetalle(coordDetalle);
  }

  // Magik: prvCrea_Cfg_Tbl_Titulo — devuelve altura (mm) de tit + sub
  private prvCrearCfgTblTitulo(coord: Coordinate): number {
    this.tblTitulo = {
      nombre:     'tbl_TitSimbologia',
      rows:       1,
      cols:       1,
      rowHeights: [5],
      colWidths:  [60],
      origen:     coord,
      dibujaRenglonesInternos: true,
      dibujaColumnasInternas:  true,
      cells:      [[undefined]],
    };

    const subOrigen: Coordinate = { x: coord.x, y: coord.y - 5 };
    this.tblSub = {
      nombre:     'tbl_SubSimbologia',
      rows:       1,
      cols:       3,
      rowHeights: [3],
      colWidths:  [30, 15, 15],
      origen:     subOrigen,
      dibujaRenglonesInternos: true,
      dibujaColumnasInternas:  true,
      cells:      [[undefined, undefined, undefined]],
    };

    return 5 + 3;   // Longitud_total_renglones({:tbl_titSimbologia, :tbl_SubSimbologia})
  }

  // Magik: prvCrea_Cfg_Detalle
  private prvCrearCfgDetalle(coord: Coordinate): void {
    const N = this._elementos.length;
    const rowHeights = Array(N).fill(7);

    this.tblEle = {
      nombre:     'tbl_EleSimbologia',
      rows:       N,
      cols:       1,
      rowHeights,
      colWidths:  [30],
      origen:     coord,
      dibujaRenglonesInternos: true,
      dibujaColumnasInternas:  true,
      cells:      Array.from({ length: N }, () => [undefined]),
    };

    const coordSim: Coordinate = { x: coord.x + 30, y: coord.y };  // LnLongX=30
    this.tblSim = {
      nombre:     'tbl_SimSimbologia',
      rows:       N,
      cols:       2,
      rowHeights,
      colWidths:  [15, 15],
      origen:     coordSim,
      dibujaRenglonesInternos: false,    // bDibuja_Renglones_Internos? << _false
      dibujaColumnasInternas:  true,     // bDibuja_Columnas_Internas? << _true
      cells:      Array.from({ length: N }, () => [undefined, undefined]),
    };
  }

  // Magik: prvLlena_Tbl_Titulo — celdas del título/subtítulo (siempre las mismas)
  private prvLlenarTblTitulo(): void {
    const titulo:     TextoGrafico = { texto: 'SIMBOLOGIA', tamanio: 26, alineacion: 'centre', margenIzq: 0 };
    const elemento:   TextoGrafico = { texto: 'ELEMENTO',   tamanio: 20, alineacion: 'centre', margenIzq: 0 };
    const existente:  TextoGrafico = { texto: 'EXISTENTE',  tamanio: 20, alineacion: 'centre', margenIzq: 0 };
    const proyectado: TextoGrafico = { texto: 'PROYECTADO', tamanio: 20, alineacion: 'centre', margenIzq: 0 };

    this.tblTitulo.cells[0][0] = titulo;
    this.tblSub.cells[0][0]    = elemento;
    this.tblSub.cells[0][1]    = existente;
    this.tblSub.cells[0][2]    = proyectado;
  }

  // Magik: c_tabla_simbologia.Despliega(RoVentana) — delegado a oTablas.Despliega
  // En TS devolvemos las 4 sub-tablas listas para que el renderer las pinte.
  despliega(): SubTabla[] {
    return [this.tblTitulo, this.tblSub, this.tblEle, this.tblSim];
  }

  // Magik: serial_slots / new_from_serial — keys=:oTablas, values=.oTablas
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['oTablas'],
      values: [this.despliega()],
    };
  }
}
