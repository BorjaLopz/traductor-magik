// Source: planos_fo/source/ruta_cables/sellos/c_cuadro_simbologia_planos_fo.magik
// Extends c_base_sello_fibra (stub defined below).

// ─── Table management types (stub for c_base_sello_fibra framework) ───────────

export interface Coord2D { x: number; y: number; }

export interface CellContent {
  text?: string;
  fontSize?: number;
  align?: string | undefined;
  symbolName?: string;
}

export interface TableDef {
  name: string;
  rows: number;
  cols: number;
  rowHeights: number[];    // nlongitud per row
  colWidths: number[];     // nlongitud per column
  origin: Coord2D;
  cells: Map<string, CellContent>;  // key: "row,col"
}

class TableProxy {
  private _def: TableDef;

  constructor(def: TableDef) { this._def = def; }

  get ocoordenada_origen(): Coord2D { return this._def.origin; }
  set ocoordenada_origen(c: Coord2D) { this._def.origin = c; }

  get orenglones() {
    return {
      elemento: (i: number) => ({
        get nlongitud() { return this._def.rowHeights[i - 1]; },   // Magik 1-indexed
        set nlongitud(v: number) { this._def.rowHeights[i - 1] = v; },
        _def: this._def,
      }),
      _def: this._def,
    };
  }

  get ocolumnas() {
    return {
      elemento: (i: number) => ({
        get nlongitud() { return this._def.colWidths[i - 1]; },
        set nlongitud(v: number) { this._def.colWidths[i - 1] = v; },
        _def: this._def,
      }),
      _def: this._def,
    };
  }
}

class TablasManager {
  private _tables = new Map<string, TableDef>();

  crea_tabla(rows: number, cols: number, name: string): TableProxy {
    const def: TableDef = {
      name, rows, cols,
      rowHeights: Array(rows).fill(0),
      colWidths: Array(cols).fill(0),
      origin: { x: 0, y: 0 },
      cells: new Map(),
    };
    this._tables.set(name, def);
    return new TableProxy(def);
  }

  longitud_total_renglones(names: string[]): number {
    return names.reduce((sum, n) => {
      const t = this._tables.get(n);
      return sum + (t ? t.rowHeights.reduce((s, h) => s + h, 0) : 0);
    }, 0);
  }

  getTable(name: string): TableDef | undefined {
    return this._tables.get(name);
  }

  getAllTables(): TableDef[] {
    return [...this._tables.values()];
  }
}

// ─── c_base_sello_fibra stub ──────────────────────────────────────────────────

export abstract class CBaseSelloFibra {
  protected o_tablas: TablasManager;
  protected o_coord_inicio: Coord2D;

  constructor(coordInicio: Coord2D) {
    this.o_tablas = new TablasManager();
    this.o_coord_inicio = coordInicio;
  }

  protected asigna_texto_celda(
    tableName: string,
    row: number,
    col: number,
    text: string,
    fontSize: number,
    align: string | undefined,
  ): void {
    this.o_tablas.getTable(tableName)?.cells.set(`${row},${col}`, { text, fontSize, align });
  }

  protected asigna_simbolo_celda(
    tableName: string,
    row: number,
    col: number,
    symbolName: string,
  ): void {
    this.o_tablas.getTable(tableName)?.cells.set(`${row},${col}`, { symbolName });
  }

  getTables(): TableDef[] {
    return this.o_tablas.getAllTables();
  }

  abstract configura_tabla(): void;
  abstract etiqueta_celdas(): void;
}

// ─── CCuadroSimbologiaPlanosFo ────────────────────────────────────────────────

export class CCuadroSimbologiaPlanosFo extends CBaseSelloFibra {

  configura_tabla(): void {
    const tblTitulo = this.o_tablas.crea_tabla(1, 1, 'tbl_titulo');
    tblTitulo.ocoordenada_origen = this.o_coord_inicio;
    tblTitulo.orenglones.elemento(1).nlongitud = 20;
    tblTitulo.ocolumnas.elemento(1).nlongitud = 110;

    const tblSimbologia = this.o_tablas.crea_tabla(1, 1, 'tbl_simbologia');
    const despY = this.o_tablas.longitud_total_renglones(['tbl_titulo']);
    tblSimbologia.ocoordenada_origen = {
      x: this.o_coord_inicio.x,
      y: this.o_coord_inicio.y - despY,
    };
    tblSimbologia.orenglones.elemento(1).nlongitud = 125;
    tblSimbologia.ocolumnas.elemento(1).nlongitud = 110;
  }

  etiqueta_celdas(): void {
    this.asigna_texto_celda('tbl_titulo', 1, 1, 'SIMBOLOGIA', 50, undefined);
    this.asigna_simbolos();
  }

  asigna_simbolos(): void {
    this.asigna_simbolo_celda('tbl_simbologia', 1, 1, 'simbolos_planos_fo');
  }
}
