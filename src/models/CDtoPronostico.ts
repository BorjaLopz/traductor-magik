// Source: adiciones_layout/source/c_dto_pronostico.magik
//
// Sello "DTO. PRONOSTICO" — extiende layout_element. Compone 3 sub-tablas
// apiladas verticalmente:
//
//   tbl_Titulo       2×2 · rows [5,5] · cols [10,23] mm  · sólo borde inf en (1,2)
//   tbl_pares        3×2 · rows [3,3,3] · cols [15,18] mm · bordes ren internos
//   tbl_pronosticos  3×3 · rows [3,3,3] · cols [7,8,18] mm · default bordes
//
// El método draw_content_on construye las tablas la primera vez (guard
// bTablas_Creadas), las añade al LayoutManager y manda la página al fondo.

export interface Coordinate { x: number; y: number }

export type Alineacion = 'centre_left' | 'centre' | 'centre_right'

export interface TextoGrafico {
  tipo:        'texto' | 'captura'  // c_texto_grafico vs c_Captura_Texto
  texto:       string
  tamanio:     number
  alineacion:  Alineacion
}

export interface BordesCelda {
  sup: boolean
  inf: boolean
  izq: boolean
  der: boolean
}

export interface SubTabla {
  nombre:           string
  rows:             number
  cols:             number
  rowHeights:       number[]
  colWidths:        number[]
  oCoordenadaOrigen: Coordinate
  cells:            (TextoGrafico | undefined)[][]
  bordes:           BordesCelda[][]
  // flags del sello
  dibujaBordes:           boolean
  dibujaColumnasInternas: boolean
  dibujaRenglonesInternos: boolean
}

export interface AreaTotal {
  x: number; y: number; w: number; h: number
}

function makeTabla(rows: number, cols: number, nombre: string, origen: Coordinate): SubTabla {
  return {
    nombre,
    rows,
    cols,
    rowHeights: Array(rows).fill(0),
    colWidths:  Array(cols).fill(0),
    oCoordenadaOrigen: origen,
    cells:  Array.from({ length: rows }, () => Array(cols).fill(undefined) as (TextoGrafico | undefined)[]),
    bordes: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ sup: false, inf: false, izq: false, der: false })),
    ),
    dibujaBordes:            true,
    dibujaColumnasInternas:  true,
    dibujaRenglonesInternos: true,
  }
}

export class CDtoPronostico {
  static readonly allowedOnMenu: boolean = false;

  oCoordOrigen: Coordinate = { x: 0, y: 0 };
  bTablasCreadas = false;

  // Magik: c_tablas — lista de sub-tablas con orden de inserción
  private _tablas: SubTabla[] = [];

  // Inicializa el sello en RoCoord (default 0,0)
  inicializa(roCoord: Coordinate = { x: 0, y: 0 }): void {
    this.oCoordOrigen = roCoord;
    this._tablas = [];
    this.prvCreaCfgTablas();
    this.prvLlenaCeldasDeTablas();
    this.bTablasCreadas = true;
  }

  get tablas(): readonly SubTabla[] { return this._tablas; }

  // Área total ocupada por todas las sub-tablas
  areaTotal(): AreaTotal {
    let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity;
    for (const t of this._tablas) {
      const totalW = t.colWidths.reduce((a, b) => a + b, 0);
      const totalH = t.rowHeights.reduce((a, b) => a + b, 0);
      minX = Math.min(minX, t.oCoordenadaOrigen.x);
      maxX = Math.max(maxX, t.oCoordenadaOrigen.x + totalW);
      // origen.y = esquina superior (Y crece hacia arriba en Magik)
      minY = Math.min(minY, t.oCoordenadaOrigen.y - totalH);
      maxY = Math.max(maxY, t.oCoordenadaOrigen.y);
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  tabla(nombre: string): SubTabla | undefined {
    return this._tablas.find(t => t.nombre === nombre);
  }

  // Magik: prvCrea_Cfg_Tablas — 3 sub-tablas apiladas en Y
  private prvCreaCfgTablas(): void {
    let coord = { ...this.oCoordOrigen };
    let altura = this.prvCreaCfgTblTitulo(coord);
    coord = { x: this.oCoordOrigen.x, y: coord.y - altura };
    altura = this.prvCreaCfgTblPares(coord);
    coord = { x: this.oCoordOrigen.x, y: coord.y - altura };
    this.prvCreaCfgTblPronostico(coord);
  }

  private prvLlenaCeldasDeTablas(): void {
    this.prvLlenaTblTitulo();
    this.prvLlenaTblPares();
    this.prvLlenaTblPronostico();
  }

  // ─── tbl_Titulo ────────────────────────────────────────────────────────────
  private prvCreaCfgTblTitulo(coord: Coordinate): number {
    const t = makeTabla(2, 2, 'tbl_Titulo', coord);
    t.dibujaBordes           = false;
    t.dibujaColumnasInternas = false;
    t.dibujaRenglonesInternos = false;
    t.rowHeights = [5, 5];
    t.colWidths  = [10, 23];
    // Magik: celda(1,2).bordes_celda.bBorde_inf? = _true
    t.bordes[0][1].inf = true;
    this._tablas.push(t);
    return t.rowHeights.reduce((a, b) => a + b, 0);
  }

  private prvLlenaTblTitulo(): void {
    const t = this.tabla('tbl_Titulo')!;
    t.cells[0][0] = { tipo: 'texto',   texto: 'DTO.',      tamanio: 26, alineacion: 'centre_left' };
    t.cells[1][0] = { tipo: 'texto',   texto: 'D.A O.C.',  tamanio: 26, alineacion: 'centre_left' };
    t.cells[0][1] = { tipo: 'captura', texto: 'LJC-1',     tamanio:  4, alineacion: 'centre_left' };
    t.cells[1][1] = { tipo: 'captura', texto: '538.3 MTS', tamanio:  4, alineacion: 'centre_left' };
  }

  // ─── tbl_pares ─────────────────────────────────────────────────────────────
  private prvCreaCfgTblPares(coord: Coordinate): number {
    const t = makeTabla(3, 2, 'tbl_pares', coord);
    t.dibujaBordes            = true;
    t.dibujaColumnasInternas  = false;
    t.dibujaRenglonesInternos = true;
    t.rowHeights = [3, 3, 3];
    t.colWidths  = [15, 18];
    this._tablas.push(t);
    return t.rowHeights.reduce((a, b) => a + b, 0);
  }

  private prvLlenaTblPares(): void {
    const t = this.tabla('tbl_pares')!;
    const tituloBase = { tipo: 'texto'   as const, tamanio: 18, alineacion: 'centre_left' as const };
    const capBase    = { tipo: 'captura' as const, tamanio:  3, alineacion: 'centre_left' as const };

    t.cells[0][0] = { ...tituloBase, texto: 'P.PRINC.'    };
    t.cells[1][0] = { ...tituloBase, texto: 'P.SEC'       };
    t.cells[2][0] = { ...tituloBase, texto: 'ABNS. EXIST.' };

    t.cells[0][1] = { ...capBase, texto: '300+200' };
    t.cells[1][1] = { ...capBase, texto: '230+380' };
    t.cells[2][1] = { ...capBase, texto: '166'     };
  }

  // ─── tbl_pronosticos ───────────────────────────────────────────────────────
  private prvCreaCfgTblPronostico(coord: Coordinate): number {
    const t = makeTabla(3, 3, 'tbl_pronosticos', coord);
    t.rowHeights = [3, 3, 3];
    t.colWidths  = [7, 8, 18];
    this._tablas.push(t);
    return t.rowHeights.reduce((a, b) => a + b, 0);
  }

  private prvLlenaTblPronostico(): void {
    const t = this.tabla('tbl_pronosticos')!;
    const tituloBase = { tipo: 'texto'   as const, tamanio: 18, alineacion: 'centre_left' as const };
    const capBase    = { tipo: 'captura' as const, tamanio:  2, alineacion: 'centre_left' as const };

    t.cells[0][0] = { ...tituloBase, texto: 'N'    };
    t.cells[1][0] = { ...tituloBase, texto: 'N+1'  };
    t.cells[2][0] = { ...tituloBase, texto: 'SAT.' };

    t.cells[0][1] = { ...capBase, texto: '' };
    t.cells[1][1] = { ...capBase, texto: '' };
    t.cells[2][1] = { ...capBase, texto: '' };

    t.cells[0][2] = { ...capBase, texto: '' };
    t.cells[1][2] = { ...capBase, texto: '' };
    t.cells[2][2] = { ...capBase, texto: '' };
  }

  // Permite editar celdas de captura desde fuera (simula la edición SW).
  setCaptura(tabla: string, ren: number, col: number, valor: string): void {
    const t = this.tabla(tabla);
    if (!t) return;
    const c = t.cells[ren - 1]?.[col - 1];
    if (c && c.tipo === 'captura') c.texto = valor;
  }
}
