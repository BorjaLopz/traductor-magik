// Source: adiciones_layout/source/c_simbologia_ocupacion_de_ductos.magik
//
// Sello de fibra muy simple: tabla 1×1 sin bordes con un único símbolo
// "ocupacion_de_ductos" (escala 3). Dimensiones de la celda: 37mm × 74mm
// (renglón × columna).
//
// allowed_on_menu? = _false → no aparece en el menú de planos.
// Extiende c_base_sello_fibra.

export interface Coordinate { x: number; y: number; }

export interface BordesCelda {
  sup: boolean;
  inf: boolean;
  izq: boolean;
  der: boolean;
}

export interface CeldaSimbolo {
  tipo:          'simbolo';
  nombreGrafico: string;
  escala:        number;
}

export interface TablaContenido {
  nombre:           string;
  rows:             number;
  cols:             number;
  rowHeights:       number[];   // mm
  colWidths:        number[];   // mm
  oCoordenadaOrigen: Coordinate;
  cells:            (CeldaSimbolo | undefined)[][];
  bordes:           BordesCelda[][];
}

// Stub mínimo c_base_sello_fibra
abstract class CBaseSelloFibra {
  protected o_coord_inicio: Coordinate = { x: 0, y: 0 };
  protected o_tablas: TablaContenido | undefined;

  protected creaTabla(rows: number, cols: number, nombre: string): TablaContenido {
    const t: TablaContenido = {
      nombre,
      rows,
      cols,
      rowHeights: Array(rows).fill(10),
      colWidths:  Array(cols).fill(50),
      oCoordenadaOrigen: { x: 0, y: 0 },
      cells:  Array.from({ length: rows }, () => Array(cols).fill(undefined) as (CeldaSimbolo | undefined)[]),
      bordes: Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ sup: true, inf: true, izq: true, der: true })),
      ),
    };
    this.o_tablas = t;
    return t;
  }

  // Magik: asigna_medidas_tabla(tabla, property_list(:ren {...}, :col {...}))
  protected asignaMedidasTabla(t: TablaContenido, dims: { ren: number[]; col: number[] }): void {
    dims.ren.forEach((h, i) => { if (i < t.rows) t.rowHeights[i] = h; });
    dims.col.forEach((w, i) => { if (i < t.cols) t.colWidths[i]  = w; });
  }

  // Magik: oculta_bordes_celdas(tabla, ...) — desactiva los 4 bordes de cada celda
  protected ocultaBordesCeldas(t: TablaContenido, _dims: { ren: number[]; col: number[] }): void {
    for (let r = 0; r < t.rows; r++) {
      for (let c = 0; c < t.cols; c++) {
        t.bordes[r][c] = { sup: false, inf: false, izq: false, der: false };
      }
    }
  }

  // Magik: asigna_simbolo_celda(tabla, ren, col, nombre, escala)
  protected asignaSimboloCelda(_tabla: string, ren: number, col: number, nombre: string, escala: number): void {
    if (!this.o_tablas) return;
    this.o_tablas.cells[ren - 1][col - 1] = { tipo: 'simbolo', nombreGrafico: nombre, escala };
  }

  get tabla(): TablaContenido | undefined { return this.o_tablas; }

  setCoordInicio(c: Coordinate): void { this.o_coord_inicio = c; }
  get coordInicio(): Coordinate { return this.o_coord_inicio; }
}

export class CSimbologiaOcupacionDeDuctos extends CBaseSelloFibra {
  static readonly allowedOnMenu: boolean = false;

  constructor(coordInicio: Coordinate = { x: 0, y: 0 }) {
    super();
    this.setCoordInicio(coordInicio);
    this.configuraTabla();
    this.etiquetaCeldas();
  }

  // Magik: configura_tabla — tabla 1×1, 37mm × 74mm, sin bordes
  configuraTabla(): void {
    const loTblContenido = { ren: [37], col: [74] };
    const loTbl = this.creaTabla(1, 1, 'tbl_contenido');
    loTbl.oCoordenadaOrigen = this.o_coord_inicio;
    this.asignaMedidasTabla(loTbl, loTblContenido);
    this.ocultaBordesCeldas(loTbl, loTblContenido);
  }

  // Magik: etiqueta_celdas
  etiquetaCeldas(): void {
    this.asignaSimboloCelda('tbl_contenido', 1, 1, 'ocupacion_de_ductos', 3);
  }
}
