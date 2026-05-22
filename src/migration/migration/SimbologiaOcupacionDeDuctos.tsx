/**
 * Migracion de: c_simbologia_ocupacion_de_ductos.magik
 * Clase Magik:  c_simbologia_ocupacion_de_ductos
 * Metodos:      configura_tabla, etiqueta_celdas
 *
 * Intencion:
 *   Crear una tabla 1x1 con medidas fijas y colocar el simbolo
 *   "ocupacion_de_ductos" en la celda (1,1).
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas [x, y] en proyeccion plana. */
export type Coord2D = [number, number];

export interface TableContent {
  rowHeights: number[];
  colWidths: number[];
}

export interface TableCellSymbol {
  symbolId: string;
  size: number;
}

export interface TableCell {
  row: number;
  col: number;
  symbol?: TableCellSymbol;
}

export interface TableDefinition {
  id: string;
  rows: number;
  cols: number;
  origin: Coord2D;
  content: TableContent;
  hideBorders: boolean;
  cells: TableCell[];
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class SimbologiaOcupacionDeDuctos {
  origin: Coord2D;

  constructor(origin: Coord2D = [0, 0]) {
    this.origin = origin;
  }

  // Magik: configura_tabla()
  async configuraTabla(): Promise<TableDefinition> {
    const content: TableContent = {
      rowHeights: [37],
      colWidths: [74],
    }; // Magik: property_list.new_with_properties(:ren,{37}, :col,{74})

    const table: TableDefinition = {
      id: 'tbl_contenido',
      rows: 1,
      cols: 1,
      origin: this.origin,
      content,
      hideBorders: true,
      cells: [],
    }; // Magik: crea_tabla(1,1, :tbl_contenido) + ocoordenada_origen + oculta_bordes

    return table;
  }

  // Magik: etiqueta_celdas()
  async etiquetaCeldas(table: TableDefinition): Promise<TableDefinition> {
    const next: TableDefinition = {
      ...table,
      cells: [
        {
          row: 1,
          col: 1,
          symbol: { symbolId: 'ocupacion_de_ductos', size: 3 },
        },
      ],
    }; // Magik: asigna_simbolo_celda(:tbl_contenido,1,1,"ocupacion_de_ductos", 3)

    return next;
  }

  // Orquestador equivalente a configurar + etiquetar
  async build(): Promise<TableDefinition> {
    const table = await this.configuraTabla();
    return this.etiquetaCeldas(table);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de la tabla 1x1 con simbolo
// =============================================================================

export function SimbologiaOcupacionDeDuctosUI() {
  const [table, setTable] = useState<TableDefinition | null>(null);

  useEffect(() => {
    let mounted = true;
    const simbologia = new SimbologiaOcupacionDeDuctos();

    simbologia.build().then(result => {
      if (mounted) setTable(result);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!table) return <div style={s.meta}>Cargando tabla...</div>;

  const cell = table.cells.find(c => c.row === 1 && c.col === 1);
  const symbol = cell?.symbol;
  const width = table.content.colWidths[0] ?? 0;
  const height = table.content.rowHeights[0] ?? 0;
  const border = table.hideBorders ? 'none' : '1px solid #ccc';

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_simbologia_ocupacion_de_ductos</div>
      <div style={s.tableShell}>
        <div style={{ ...s.cell, width, height, border }}>
          <div style={s.symbolBadge}>
            {symbol ? symbol.symbolId : 'sin_simbolo'}
          </div>
          <div style={s.symbolMeta}>size: {symbol?.size ?? 0}</div>
        </div>
      </div>
      <div style={s.meta}>
        Tabla 1x1, origen ({table.origin[0]}, {table.origin[1]})
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper   : { display: 'flex', flexDirection: 'column', gap: 8 },
  title     : { fontSize: 13, fontWeight: 'bold' },
  meta      : { fontSize: 12, color: '#666' },
  tableShell: { display: 'inline-block', padding: 6, background: '#f5f5f5', borderRadius: 6 },
  cell      : { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' },
  symbolBadge: { fontSize: 12, fontWeight: 'bold', color: '#2E4057' },
  symbolMeta : { fontSize: 11, color: '#888', marginTop: 2 },
};

export default SimbologiaOcupacionDeDuctosUI;
