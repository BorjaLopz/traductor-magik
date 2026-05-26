// Source: adiciones_layout/source/Sellos/c_pep.magik

export interface PepAttributes {
  empreviso?: string;
  desmontaje?: string;
  canalizacion?: string;
  principal?: string;
  reconcentracion?: string;
  pep?: string;
  opb?: string;
  oei?: string;
  oe?: string;
  programa_proyecto?: string;
  ot?: string;
}

export interface PepData {
  opb: string;
  oei: string;
  oe: string;
  oe_desm: string;
  oe_canal: string;
  oe_reco: string;
  proyectista: string;
  supervisor: string;
  supervisor_telmex: string;
  pep: string;
  desmontaje: string;
  reconcentracion: string;
  principal: string;
  canalizacion: string;
  ruta: string;
  programa_proyecto: string;
  ot: string;
}

export type TableId =
  | 'tbl_OPB'
  | 'tbl_PEP'
  | 'tbl_Referencias_Titulo'
  | 'tbl_Referencias_Detalle'
  | 'tbl_Proyecto'
  | 'tbl_Ruta';

export interface TableConfig {
  rows: number;
  cols: number;
  rowHeights: number[];
  colWidths: number[];
}

export interface CellColor {
  tableId: TableId;
  row: number;
  col: number;
  color: [number, number, number];
}

// Magik: o_color_linea = {0.0, 0.8, 0.3} — RGB in 0–1 scale → rgb(0, 204, 77)
const COLOR_LINEA: [number, number, number] = [0.0, 0.8, 0.3];

export class CPep {
  private _oTipoEmpresaR: Map<number, string> | undefined;
  private _valor_empreviso: string | undefined;
  private readonly _attributes: PepAttributes;

  // Magik: pl_tam_* — table dimension configs used in configura_tabla()
  static readonly TABLE_CONFIGS: Record<TableId, TableConfig> = {
    tbl_OPB:               { rows: 7, cols: 3, rowHeights: [7, 8, 8, 8, 8, 8, 8], colWidths: [26, 26, 26] },
    tbl_PEP:               { rows: 1, cols: 2, rowHeights: [9],          colWidths: [26, 52] },
    tbl_Referencias_Titulo:{ rows: 1, cols: 1, rowHeights: [5],          colWidths: [78] },
    tbl_Referencias_Detalle:{ rows: 4, cols: 2, rowHeights: [5, 5, 5, 5], colWidths: [39, 39] },
    tbl_Proyecto:          { rows: 3, cols: 3, rowHeights: [5, 10, 10],  colWidths: [26, 26, 26] },
    tbl_Ruta:              { rows: 1, cols: 3, rowHeights: [7],          colWidths: [26, 26, 26] },
  };

  // Magik: etiqueta_celdas() — static header labels [tableId, row, col, text]
  static readonly CELL_LABELS: [TableId, number, number, string][] = [
    ['tbl_OPB', 1, 1, 'OPB'],
    ['tbl_OPB', 2, 1, 'OEI'],
    ['tbl_OPB', 3, 1, 'OEs'],
    ['tbl_OPB', 6, 1, 'PROG:'],
    ['tbl_OPB', 7, 1, 'OT:'],
    ['tbl_PEP', 1, 1, 'PEP'],
    ['tbl_Referencias_Titulo', 1, 1, 'REFERENCIAS'],
    ['tbl_Referencias_Detalle', 1, 1, 'DESMONTAJE'],
    ['tbl_Referencias_Detalle', 2, 1, 'CANALIZACION'],
    ['tbl_Referencias_Detalle', 3, 1, 'PRINCIPAL'],
    ['tbl_Referencias_Detalle', 4, 1, 'RECONCENTRACION'],
    ['tbl_Proyecto', 1, 1, 'PROYECTO'],
    ['tbl_Proyecto', 1, 2, 'SUPERVISO'],
    ['tbl_Proyecto', 1, 3, 'RNUM'],
  ];

  constructor(attributes: PepAttributes = {}) {
    this._attributes = attributes;
  }

  // Magik: enum_tipo_empresar — hash_table with allowed values for empreviso
  enumTipoEmpresaR(): Map<number, string> {
    if (!this._oTipoEmpresaR) {
      this._oTipoEmpresaR = new Map([
        [1, 'RNUM'],
        [2, 'RNUMN'],
        [3, 'TELMEX'],
      ]);
    }
    return this._oTipoEmpresaR;
  }

  // Magik: valor_propiedad — attribute value (uppercase) wins over GIS-fetched fallback
  valorPropiedad(propiedad: keyof PepAttributes, datoActual: string): string {
    const val = this._attributes[propiedad];
    if (val !== undefined && val.length > 0) {
      return val.toUpperCase(); // Magik: .write_string.uppercase
    }
    return datoActual;
  }

  // Magik: info_sello_propiedades — overlay manual attribute overrides onto fetched data
  infoSelloPropiedades(data: PepData): PepData {
    return {
      ...data,
      opb:              this.valorPropiedad('opb',             data.opb),
      oei:              this.valorPropiedad('oei',             data.oei),
      oe:               this.valorPropiedad('oe',              data.oe),
      programa_proyecto:this.valorPropiedad('programa_proyecto', data.programa_proyecto),
      ot:               this.valorPropiedad('ot',              data.ot),
      pep:              this.valorPropiedad('pep',             data.pep),
      canalizacion:     this.valorPropiedad('canalizacion',    data.canalizacion),
      desmontaje:       this.valorPropiedad('desmontaje',      data.desmontaje),
      reconcentracion:  this.valorPropiedad('reconcentracion', data.reconcentracion),
      principal:        this.valorPropiedad('principal',       data.principal),
    };
  }

  // Magik: asigna_celdas_a_colorear — data cells highlighted with o_color_linea
  asignaCeldasAColorear(): CellColor[] {
    const color = COLOR_LINEA;
    return [
      { tableId: 'tbl_PEP',                row: 1, col: 2, color },
      { tableId: 'tbl_OPB',                row: 1, col: 2, color },
      { tableId: 'tbl_OPB',                row: 2, col: 2, color },
      { tableId: 'tbl_OPB',                row: 3, col: 2, color },
      { tableId: 'tbl_OPB',                row: 4, col: 2, color },
      { tableId: 'tbl_OPB',                row: 5, col: 2, color },
      { tableId: 'tbl_OPB',                row: 6, col: 2, color },
      { tableId: 'tbl_OPB',                row: 7, col: 2, color },
      { tableId: 'tbl_Referencias_Detalle', row: 1, col: 2, color },
      { tableId: 'tbl_Referencias_Detalle', row: 2, col: 2, color },
      { tableId: 'tbl_Referencias_Detalle', row: 3, col: 2, color },
      { tableId: 'tbl_Referencias_Detalle', row: 4, col: 2, color },
      { tableId: 'tbl_Ruta',               row: 1, col: 1, color },
      { tableId: 'tbl_Proyecto',            row: 2, col: 1, color },
      { tableId: 'tbl_Proyecto',            row: 2, col: 2, color },
      { tableId: 'tbl_Proyecto',            row: 2, col: 3, color },
    ];
  }

  // Magik: llena_datos_dinamicos — page-counter placeholders (resolved at render time)
  llenaDatosDinamicos(): { plano: string; de: string } {
    return { plano: 'PLANO: 2', de: 'DE: 2' };
  }

  get attributes(): Readonly<PepAttributes> {
    return this._attributes;
  }

  get valorEmpreviso(): string | undefined {
    return this._valor_empreviso;
  }

  set valorEmpreviso(val: string | undefined) {
    this._valor_empreviso = val;
  }
}
