// Source: adiciones_layout/source/c_simbologia_plano_construccion.magik
//
// Cuadro de simbología del plano de construcción. Extiende c_base_sello.
// Una sola tabla :tbl_simbologia (2×1):
//   - renglón 1: 5mm  · título "SIMBOLOGIA" (tamaño 30)
//   - renglón 2: 120mm · símbolo "simbologia_plano_construccion"
//   - columna 1: 110mm
// Celda (2,1) tiene bBorde_Sup? = _false (se une visualmente con la 1,1).

export interface CeldaTexto {
  tipo:    'texto';
  texto:   string;
  tamanio: number;
}

export interface CeldaSimbolo {
  tipo:           'simbolo';
  nombreGrafico:  string;
}

export type CeldaContenido = CeldaTexto | CeldaSimbolo | undefined;

export interface BordesCelda {
  sup: boolean;
  inf: boolean;
  izq: boolean;
  der: boolean;
}

export interface TablaSimbologia {
  nombre:      string;          // :tbl_simbologia
  rows:        number;
  cols:        number;
  rowHeights:  number[];        // mm
  colWidths:   number[];        // mm
  cells:       CeldaContenido[][];
  bordes:      BordesCelda[][];
}

// Stub mínimo de c_base_sello — provee la estructura .o_tablas + helpers.
abstract class CBaseSello {
  protected oTablas: TablaSimbologia | undefined;

  // Magik: _self.o_tablas.crea_tabla(rows, cols, :nombre) — devuelve la tabla
  // y la guarda como única tabla del sello.
  protected creaTabla(rows: number, cols: number, nombre: string): TablaSimbologia {
    const tabla: TablaSimbologia = {
      nombre,
      rows,
      cols,
      rowHeights: Array(rows).fill(10),
      colWidths:  Array(cols).fill(50),
      cells:      Array.from({ length: rows }, () => Array(cols).fill(undefined) as CeldaContenido[]),
      bordes:     Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ sup: true, inf: true, izq: true, der: true })),
      ),
    };
    this.oTablas = tabla;
    return tabla;
  }

  // Magik: _self.asigna_texto_celda(tabla, ren, col, texto, tamanio, ...)
  protected asignaTextoCelda(
    _tabla:   string,
    ren:      number,
    col:      number,
    texto:    string,
    tamanio:  number,
  ): void {
    if (!this.oTablas) return;
    this.oTablas.cells[ren - 1][col - 1] = { tipo: 'texto', texto, tamanio };
  }

  // Magik: _self.asigna_simbolo_celda(tabla, ren, col, nombreGrafico)
  protected asignaSimboloCelda(
    _tabla:        string,
    ren:           number,
    col:           number,
    nombreGrafico: string,
  ): void {
    if (!this.oTablas) return;
    this.oTablas.cells[ren - 1][col - 1] = { tipo: 'simbolo', nombreGrafico };
  }

  get tabla(): TablaSimbologia | undefined { return this.oTablas; }
}

export class CSimbologiaPlanoConstruccion extends CBaseSello {
  constructor() {
    super();
    this.configuraTabla();
    this.etiquetaCeldas();
  }

  // Magik: c_simbologia_plano_construccion.configura_tabla
  configuraTabla(): void {
    this.configuraTablaFija();
  }

  // Magik: configura_tabla_fija — dimensiones + bordes
  configuraTablaFija(): void {
    const t = this.creaTabla(2, 1, 'tbl_simbologia');

    t.rowHeights[0] = 5;     // renglón 1: 5mm
    t.colWidths[0]  = 110;   // columna 1: 110mm
    t.rowHeights[1] = 120;   // renglón 2: 120mm
    // (la línea redundante de colWidths[0]<<110 del original se omite)

    // Celda (2,1): bBorde_Sup? = _false
    t.bordes[1][0].sup = false;
  }

  // Magik: asigna_simbolos
  asignaSimbolos(): void {
    this.asignaTextoCelda  ('tbl_simbologia', 1, 1, 'SIMBOLOGIA', 30);
    this.asignaSimboloCelda('tbl_simbologia', 2, 1, 'simbologia_plano_construccion');
  }

  // Magik: etiqueta_celdas
  etiquetaCeldas(): void {
    this.asignaSimbolos();
  }
}
