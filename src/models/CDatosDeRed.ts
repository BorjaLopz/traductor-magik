// Source: planos_fo/source/montaje_tba/sellos/c_datos_de_red.magik
// Extends c_base_sello_fibra (stub defined below).

// ─── Stub framework ───────────────────────────────────────────────────────────

export interface Coord2D { x: number; y: number; }

export interface CellContent {
  text?: string;
  fontSize?: number;
  align?: string;
  colSpan?: number;
}

export interface CellBorders {
  bBorde_Sup: boolean;
  bBorde_Der: boolean;
  bBorde_Izq: boolean;
  bBorde_Inf: boolean;
}

export interface TableDef {
  name: string;
  rows: number;
  cols: number;
  rowHeights: number[];
  colWidths: number[];
  origin: Coord2D;
  cells: Map<string, CellContent>;
  borders: Map<string, CellBorders>;
}

function defaultBorders(): CellBorders {
  return { bBorde_Sup: true, bBorde_Der: true, bBorde_Izq: true, bBorde_Inf: true };
}

class TableProxy {
  private _def: TableDef;
  constructor(def: TableDef) { this._def = def; }

  get ocoordenada_origen(): Coord2D { return this._def.origin; }
  set ocoordenada_origen(c: Coord2D) { this._def.origin = c; }

  get orenglones() {
    const def = this._def;
    return {
      elemento: (i: number) => ({
        get nlongitud() { return def.rowHeights[i - 1]; },
        set nlongitud(v: number) { def.rowHeights[i - 1] = v; },
      }),
    };
  }

  get ocolumnas() {
    const def = this._def;
    return {
      elemento: (i: number) => ({
        get nlongitud() { return def.colWidths[i - 1]; },
        set nlongitud(v: number) { def.colWidths[i - 1] = v; },
      }),
    };
  }

  get oceldas() {
    const def = this._def;
    return {
      celda: (row: number, col: number) => ({
        oelementos: {
          obten_elemento: (_tipo: string): CellBorders => {
            const key = `${row},${col}`;
            if (!def.borders.has(key)) def.borders.set(key, defaultBorders());
            return def.borders.get(key)!;
          },
        },
      }),
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
      borders: new Map(),
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

  getTable(name: string): TableDef | undefined { return this._tables.get(name); }
  getAllTables(): TableDef[] { return [...this._tables.values()]; }
}

abstract class CBaseSelloFibraStub {
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
    text: string | number,
    fontSize: number,
    align?: string,
    colSpan?: number,
  ): void {
    this.o_tablas.getTable(tableName)?.cells.set(`${row},${col}`, { text: String(text), fontSize, align, colSpan });
  }

  getTables(): TableDef[] { return this.o_tablas.getAllTables(); }

  abstract configura_tabla(): void;
  abstract etiqueta_celdas(): void;
}

// ─── CDatosDeRed ──────────────────────────────────────────────────────────────

export interface DatosRedRecord {
  pares_conec_sec: string;
  lineas_ocup_sec: string;
  pares_conec_pri: string;
  lineas_ocup_pri: string;
  distancia_oc: string;
  ruta: string;
  fo_asignada: string;
  no_fo_asignada: string;
  fo_conetada_tba: string;
  nipp: string;
  nsep: string;
  moda: string;
  ailimip: string;
  b2a1a: string;
  c: string;
  d3a: string;
  e: string;
  baldios: string;
}

export class CDatosDeRed extends CBaseSelloFibraStub {
  datos: DatosRedRecord | undefined;

  configura_tabla(): void {
    const loTabla = this.o_tablas.crea_tabla(14, 5, 'tbl_datos_red');
    loTabla.ocoordenada_origen = this.o_coord_inicio;

    for (let n = 1; n <= 14; n++) {
      loTabla.orenglones.elemento(n).nlongitud = 5;
    }
    loTabla.ocolumnas.elemento(1).nlongitud = 41;
    for (let n = 2; n <= 5; n++) {
      loTabla.ocolumnas.elemento(n).nlongitud = 25;
    }

    const ocultaSup: [number, number][] = [[1,5],[2,5],[3,5],[4,5],[5,5],[14,1],[14,2],[2,1]];
    for (const [r, c] of ocultaSup) {
      loTabla.oceldas.celda(r, c).oelementos.obten_elemento('bordes_celda').bBorde_Sup = false;
    }

    const ocultaDer: [number, number][] = [[1,5],[2,5],[3,5],[4,5],[5,5],[1,1],[1,2],[1,3],[6,1],[6,2],[6,3],[6,4],[13,1],[14,1],[14,3]];
    for (const [r, c] of ocultaDer) {
      loTabla.oceldas.celda(r, c).oelementos.obten_elemento('bordes_celda').bBorde_Der = false;
    }

    const ocultaIzq: [number, number][] = [[13,2],[13,1],[14,1],[14,2]];
    for (const [r, c] of ocultaIzq) {
      loTabla.oceldas.celda(r, c).oelementos.obten_elemento('bordes_celda').bBorde_Izq = false;
    }

    const ocultaInf: [number, number][] = [[1,5],[2,5],[3,5],[4,5],[13,1],[13,2],[14,1],[14,2]];
    for (const [r, c] of ocultaInf) {
      loTabla.oceldas.celda(r, c).oelementos.obten_elemento('bordes_celda').bBorde_Inf = false;
    }
  }

  etiqueta_celdas(): void {
    this.asigna_texto_celda('tbl_datos_red', 1, 2, 'DATOS DE LA RED', 30);
    this.asigna_texto_celda('tbl_datos_red', 2, 2, 'PARES CONECTADOS', 20);
    this.asigna_texto_celda('tbl_datos_red', 2, 3, 'LINEAS OCUPADAS', 20);
    this.asigna_texto_celda('tbl_datos_red', 2, 4, 'LINEAS LIBRES', 20);
    this.asigna_texto_celda('tbl_datos_red', 3, 1, 'SECUNDARIOS', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 4, 1, 'PRINCIPALES', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 5, 1, 'DISTANCIA A O.C.', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 5, 3, 'RUTA', 20);
    this.asigna_texto_celda('tbl_datos_red', 6, 3, 'DATOS DE LA FIBRA OPTICA', 30);
    this.asigna_texto_celda('tbl_datos_red', 7, 1, 'F.O. ASIGNADA', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 8, 1, 'No. DE F.O. ASIGNADA', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 9, 1, 'No. DE F.O. A CONECTAR A TBA', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 10, 1, 'NIPP', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 11, 1, 'N.S.E.P', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 12, 1, 'MODA', 20, 'centre_left', 4);
    this.asigna_texto_celda('tbl_datos_red', 7, 3, 'N.S.E.', 20);
    this.asigna_texto_celda('tbl_datos_red', 7, 4, 'VIVIENDA', 20);
    this.asigna_texto_celda('tbl_datos_red', 7, 5, 'F.O. POR N.S.E.', 20);
    this.asigna_texto_celda('tbl_datos_red', 8, 3, 'A, IL, IM, IP', 20);
    this.asigna_texto_celda('tbl_datos_red', 9, 3, 'B, 2a, 1a', 20);
    this.asigna_texto_celda('tbl_datos_red', 10, 3, 'C', 20);
    this.asigna_texto_celda('tbl_datos_red', 11, 3, 'D,3a', 20);
    this.asigna_texto_celda('tbl_datos_red', 12, 3, 'E', 20);
    this.asigna_texto_celda('tbl_datos_red', 13, 3, 'BALDIOS', 20);
    this.asigna_texto_celda('tbl_datos_red', 14, 3, 'F.O. REQUERIDA', 20, 'centre_left', 22);
  }

  llena_datos_celdas(): void {
    if (!this.datos) return;
    const d = this.datos;

    this.asigna_texto_celda('tbl_datos_red', 3, 2, d.pares_conec_sec, 18);
    this.asigna_texto_celda('tbl_datos_red', 3, 3, d.lineas_ocup_sec, 18);
    this.asigna_texto_celda('tbl_datos_red', 4, 2, d.pares_conec_pri, 18);
    this.asigna_texto_celda('tbl_datos_red', 4, 3, d.lineas_ocup_pri, 18);

    if (d.pares_conec_sec !== '' && d.lineas_ocup_sec !== '') {
      const libsec = Number(d.pares_conec_sec) - Number(d.lineas_ocup_sec);
      this.asigna_texto_celda('tbl_datos_red', 3, 4, libsec, 18);
    }
    if (d.pares_conec_pri !== '' && d.lineas_ocup_pri !== '') {
      const libpri = Number(d.pares_conec_pri) - Number(d.lineas_ocup_pri);
      this.asigna_texto_celda('tbl_datos_red', 4, 4, libpri, 18);
    }

    this.asigna_texto_celda('tbl_datos_red', 5, 2, d.distancia_oc, 18);
    this.asigna_texto_celda('tbl_datos_red', 5, 4, d.ruta, 18);
    this.asigna_texto_celda('tbl_datos_red', 7, 2, d.fo_asignada, 18);
    this.asigna_texto_celda('tbl_datos_red', 8, 2, d.no_fo_asignada, 18);
    this.asigna_texto_celda('tbl_datos_red', 9, 2, d.fo_conetada_tba, 18);
    this.asigna_texto_celda('tbl_datos_red', 10, 2, d.nipp, 18);
    this.asigna_texto_celda('tbl_datos_red', 11, 2, d.nsep, 18);
    this.asigna_texto_celda('tbl_datos_red', 12, 2, d.moda, 18);
    this.asigna_texto_celda('tbl_datos_red', 8, 4, d.ailimip, 18);
    this.asigna_texto_celda('tbl_datos_red', 9, 4, d.b2a1a, 18);
    this.asigna_texto_celda('tbl_datos_red', 10, 4, d.c, 18);
    this.asigna_texto_celda('tbl_datos_red', 11, 4, d.d3a, 18);
    this.asigna_texto_celda('tbl_datos_red', 12, 4, d.e, 18);
    this.asigna_texto_celda('tbl_datos_red', 13, 4, d.baldios, 18);

    let foRequerida = 0;
    if (d.ailimip !== '') {
      const v = parseFloat(d.ailimip) / 64;
      this.asigna_texto_celda('tbl_datos_red', 8, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (d.b2a1a !== '') {
      const v = parseFloat(d.b2a1a) / 64;
      this.asigna_texto_celda('tbl_datos_red', 9, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (d.c !== '') {
      const v = parseFloat(d.c) / 64;
      this.asigna_texto_celda('tbl_datos_red', 10, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (d.d3a !== '') {
      const v = parseFloat(d.d3a) / 64;
      this.asigna_texto_celda('tbl_datos_red', 11, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (d.e !== '') {
      const v = parseFloat(d.e) / 64;
      this.asigna_texto_celda('tbl_datos_red', 12, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (d.baldios !== '') {
      const v = parseFloat(d.baldios) / 64;
      this.asigna_texto_celda('tbl_datos_red', 13, 5, v.toFixed(4), 18);
      foRequerida += v;
    }
    if (foRequerida !== 0) {
      this.asigna_texto_celda('tbl_datos_red', 14, 5, foRequerida.toFixed(4), 18);
    }
  }
}
