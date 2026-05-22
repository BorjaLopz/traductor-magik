/**
 * Migracion de: c_simbologia_plano_construccion.magik
 * Clase Magik:  c_simbologia_plano_construccion
 * Metodos:      configura_tabla, configura_tabla_fija, asigna_simbolos, etiqueta_celdas
 *
 * Intencion:
 *   Crear la tabla de simbologia y asignar el titulo y el simbolo.
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface TableCellText {
  row: number;
  col: number;
  text: string;
  size: number;
}

export interface TableCellSymbol {
  row: number;
  col: number;
  symbolId: string;
}

export interface TableDefinition {
  id: string;
  rows: number;
  cols: number;
  rowHeights: number[];
  colWidths: number[];
  hideTopBorderRow2: boolean;
  texts: TableCellText[];
  symbols: TableCellSymbol[];
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class SimbologiaPlanoConstruccion {
  // Magik: configura_tabla()
  async configuraTabla(): Promise<TableDefinition> {
    return this.configuraTablaFija();
  }

  // Magik: configura_tabla_fija()
  async configuraTablaFija(): Promise<TableDefinition> {
    const table: TableDefinition = {
      id: 'tbl_simbologia',
      rows: 2,
      cols: 1,
      rowHeights: [5, 120],
      colWidths: [110],
      hideTopBorderRow2: true,
      texts: [],
      symbols: [],
    };

    return table;
  }

  // Magik: asigna_simbolos()
  async asignaSimbolos(table: TableDefinition): Promise<TableDefinition> {
    const next: TableDefinition = {
      ...table,
      texts: [
        { row: 1, col: 1, text: 'SIMBOLOGIA', size: 30 },
      ],
      symbols: [
        { row: 2, col: 1, symbolId: 'simbologia_plano_construccion' },
      ],
    };

    return next;
  }

  // Magik: etiqueta_celdas()
  async etiquetaCeldas(table: TableDefinition): Promise<TableDefinition> {
    return this.asignaSimbolos(table);
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function SimbologiaPlanoConstruccionUI() {
  const [table, setTable] = useState<TableDefinition | null>(null);

  useEffect(() => {
    let mounted = true;
    const simbologia = new SimbologiaPlanoConstruccion();

    simbologia.configuraTabla().then(t => simbologia.etiquetaCeldas(t)).then(result => {
      if (mounted) setTable(result);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!table) return <div style={s.meta}>Cargando simbologia...</div>;

  const textCell = table.texts[0];
  const symbolCell = table.symbols[0];

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_simbologia_plano_construccion</div>
      <div style={s.tableShell}>
        <div style={{ ...s.row, height: table.rowHeights[0] }}>
          <div style={s.cellTitle}>{textCell?.text ?? ''}</div>
        </div>
        <div style={{ ...s.row, height: table.rowHeights[1] }}>
          <div style={s.cellSymbol}>Simbolo: {symbolCell?.symbolId ?? ''}</div>
        </div>
      </div>
      <div style={s.meta}>Tabla 2x1, columna 110mm, borde sup oculto en fila 2.</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper   : { display: 'flex', flexDirection: 'column', gap: 8 },
  title     : { fontSize: 13, fontWeight: 'bold' },
  meta      : { fontSize: 11, color: '#777' },
  tableShell: { border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden', width: 260 },
  row       : { display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #eee' },
  cellTitle : { fontSize: 12, fontWeight: 'bold' },
  cellSymbol: { fontSize: 12, color: '#333' },
};

export default SimbologiaPlanoConstruccionUI;
