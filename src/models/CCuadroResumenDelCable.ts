// Source: adiciones_layout/source/Sellos/c_cuadro_resumen_del_cable.magik
// Standalone showcase version — la versión completa extiende CBaseSelloFibra (renderizado GIS)

export interface CuadroResumenRow {
  distrito: string;
  cable: string;
  capacidad: string;
  totalFibras: string;
  cuentas: string;
  posicion: string;
  nco: string;
  trayectoria: string;
  nse: string;
  clasificacion: string;
  viviendas: string;
  distanciaNco: string;
}

export interface AttrDefinition {
  name: string;
  type: string;
  defaultValue: string;
}

// Mapeo columna → índice de la tabla GIS (tbl_cuadro_resumen_del_cable)
export const COL_MAP: Record<string, number> = {
  nco:             1,
  trayectoria:     2,
  cable:           3,
  posicion:        4,
  capacidad:       5,
  distrito:        6,
  'distancia-nco': 7,
  viviendas:       8,
  'total-fibras':  9,
  cuentas:         10,
  clasificacion:   11,
  nse:             12,
};

export class CCuadroResumenDelCable {
  static readonly allowedOnMenu = false;

  private readonly _loElemResumen: Map<string, CuadroResumenRow> | undefined;

  static newWith(poResumen: Map<string, CuadroResumenRow>): CCuadroResumenDelCable {
    return new CCuadroResumenDelCable(poResumen);
  }

  constructor(loElemResumen?: Map<string, CuadroResumenRow>) {
    this._loElemResumen = loElemResumen;
  }

  get rowCount(): number {
    return this._loElemResumen?.size ?? 0;
  }

  // Magik: defined_attributes_dinamicos — genera un atributo por cada campo × fila
  definedAttributesDinamicos(): AttrDefinition[] {
    const attribs: AttrDefinition[] = [{ name: 'titulo', type: 'string', defaultValue: '' }];
    if (this._loElemResumen === undefined) return attribs;

    let cont = 0;
    for (const row of this._loElemResumen.values()) {
      const renglon = ++cont;
      const suffix = `_${renglon}_${row.distrito}`.toLowerCase();
      for (const col of Object.keys(COL_MAP)) {
        attribs.push({ name: `${col}${suffix}`, type: 'string', defaultValue: '' });
      }
    }
    return attribs;
  }

  // Magik: clave generada por defined_attributes_dinamicos → "{col}_{renglon}_{distrito}"
  isDynamicAttrKey(key: string): boolean {
    if (key === 'locked') return false;
    const parts = key.split('_');
    return parts.length >= 2 && /^\d+$/.test(parts[1]);
  }

  // Magik: valor_propiedad — devuelve el override manual si existe, si no el valor base
  valorPropiedad(
    propiedad: string,
    overrides: Record<string, string>,
    datoActual?: string
  ): string {
    const val = overrides[propiedad];
    if (val !== undefined && val.length > 0) return val;
    return datoActual ?? '';
  }

  // Magik: llena_datos_celdas — devuelve el contenido de cada celda de datos
  buildCellData(): Array<{ row: number; col: number; colName: string; value: string }> {
    if (this._loElemResumen === undefined) return [];
    const cells: Array<{ row: number; col: number; colName: string; value: string }> = [];
    let tableRow = 2;
    for (const row of this._loElemResumen.values()) {
      tableRow++;
      const fieldMap: Array<[string, string]> = [
        ['distrito',      row.distrito],
        ['cable',         row.cable],
        ['capacidad',     row.capacidad],
        ['total-fibras',  row.totalFibras],
        ['cuentas',       row.cuentas],
        ['posicion',      row.posicion],
        ['nco',           row.nco],
        ['trayectoria',   row.trayectoria],
        ['viviendas',     row.viviendas],
        ['nse',           row.nse],
        ['clasificacion', row.clasificacion],
        ['distancia-nco', row.distanciaNco],
      ];
      for (const [colName, value] of fieldMap) {
        cells.push({ row: tableRow, col: COL_MAP[colName], colName, value: value.toUpperCase() });
      }
    }
    return cells;
  }
}
