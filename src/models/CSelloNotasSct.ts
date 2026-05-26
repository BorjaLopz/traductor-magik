// Source: adiciones_layout/source/Sellos/c_sello_notas_sct.magik
// Base class for SCT-permit note stamps. Standalone showcase version
// (full version extends layout_element for GIS rendering).

export const ENUM_TIPO_CABLE: Record<number, string> = {
  1: 'FIBRAS ÓPTICAS',
  2: 'COBRE',
};

export const ENUM_TIPO_PROC: Record<number, string> = {
  1: 'HINCADO',
  2: 'TUBO DIRECCIONAL',
};

export const ENUM_TIPO_INST: Record<number, string> = {
  1: 'SUBTERRÁNEA',
  2: 'CANALIZADA',
};

export interface SelloNotasSctConfig {
  estado: string;
  tipoCable: string;
  procedimiento: string;
  instalacion: string;
}

// Magik: tabla 2 filas × 1 columna "tbl_notas_grales"
export interface TableConfig {
  rowTitle: number;  // fila 1 — título (mm)
  rowText: number;   // fila 2 — cuerpo de notas (mm)
  colWidth: number;  // columna 1 (mm)
}

export const TABLE_CONFIG_BASE: TableConfig = {
  rowTitle: 10,
  rowText:  55,
  colWidth: 155,
};

export class CSelloNotasSct {
  static readonly allowedOnMenu = false;

  protected _estado: string;
  protected _tipoCable: string;
  protected _procedimiento: string;
  protected _instalacion: string;

  // Magik: defined_attributes — atributos editables del sello
  static readonly attributeNames = ['estado', 'tipo_cable', 'procedimiento', 'instalacion'] as const;

  constructor(config: SelloNotasSctConfig) {
    // Magik: prvAsignaTexto aplica .uppercase solo a estado
    this._estado      = config.estado.toUpperCase();
    this._tipoCable   = config.tipoCable;
    this._procedimiento = config.procedimiento;
    this._instalacion = config.instalacion;
  }

  get tableConfig(): TableConfig {
    return TABLE_CONFIG_BASE;
  }

  // Magik: prvAsignaTexto (porción del padre — notas 1-4)
  buildNotasBase(): string {
    const s = this._estado;
    return [
      ` 1.- TODAS LAS DIMENSIONES ESTÁN EN METROS, EXCEPTO LAS INDICADAS EN OTRA UNIDAD. `,

      ` 2.- PARA CUALQUIER MODIFICACIÓN A ESTE PROYECTO, TELÉFONOS DE MÉXICO, S.A. DE C.V. DEBERÁ\n` +
      ` COMUNICAR Y SOLICITAR A ESTA SECRETARIA LA REVISIÓN Y DICTAMEN CORRESPONDIENTE. `,

      ` 3.- TELÉFONOS DE MÉXICO, S.A. DE C.V. INFORMARÁ POR ESCRITO A LA RESIDENCIA GENERAL DE \n` +
      ` CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${s} LA FECHA DE \n` +
      ` INICIACIÓN DE LOS TRABAJOS CON DIEZ DÍAS DE ANTICIPACIÓN, PREVIA SUPERVISIÓN DE LA ZONA. `,

      ` 4.- LOS TRABAJOS DEBERÁN INICIARSE A MAS TARDAR 30 DÍAS NATURALES DESPUÉS DE OTORGADO EL \n` +
      ` PERMISO POR LA SECRETARIA Y CONCLUIRSE EN UN PLAZO NO MAYOR DE 180 DÍAS NATURALES A \n` +
      ` PARTIR DE SU INICIO. `,
    ].join('\n\n');
  }

  // Magik: prvLlenaCeldas — construye el contenido completo de la celda de notas
  buildTexto(): string {
    return '\n' + this.buildNotasBase();
  }
}
