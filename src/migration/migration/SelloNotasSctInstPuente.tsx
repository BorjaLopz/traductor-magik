/**
 * Migracion de: c_sello_notas_sct_inst_puente.magik
 * Clase Magik:  c_sello_notas_sct_inst_puente
 * Metodos:      prvCrea_Cfg_Tbl_Notas_Grales, prvAsignaTexto
 *
 * Intencion:
 *   Crear la tabla de notas generales (2x1) y asignar el texto
 *   de instalacion lateral en puente.
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas [x, y] en proyeccion plana. */
export type Coord2D = [number, number];

export interface TableCell {
  row: number;
  col: number;
  text: string;
}

export interface TableDefinition {
  id: string;
  origin: Coord2D;
  rowHeights: number[];
  colWidths: number[];
  cells: TableCell[];
}

export interface SelloNotasParams {
  tipoCable: string;
  estado: string;
  baseTexto?: string;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class SelloNotasSctInstPuente {
  readonly sTipoCable: string;
  readonly sEstado: string;
  readonly baseTexto: string;

  constructor(params: SelloNotasParams) {
    this.sTipoCable = params.tipoCable;
    this.sEstado = params.estado;
    this.baseTexto = params.baseTexto ?? '';
  }

  // Magik: prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)
  async prvCreaCfgTblNotasGrales(origin: Coord2D): Promise<TableDefinition> {
    const table: TableDefinition = {
      id: 'tbl_notas_grales',
      origin,
      rowHeights: [10, 170],
      colWidths: [165],
      cells: [],
    };

    return table;
  }

  // Magik: prvAsignaTexto()
  async prvAsignaTexto(table: TableDefinition): Promise<TableDefinition> {
    const texto = this.baseTexto + this.buildTextoNotas();
    const cell: TableCell = { row: 2, col: 1, text: texto };

    return { ...table, cells: [cell] };
  }

  // Orquestador equivalente a crear tabla y asignar texto
  async build(origin: Coord2D): Promise<TableDefinition> {
    const table = await this.prvCreaCfgTblNotasGrales(origin);
    return this.prvAsignaTexto(table);
  }

  // Magik: concatenacion con character.newLine
  private buildTextoNotas(): string {
    const lines: string[] = [
      ` 5.- LA UBICACION DE LA INSTALACION LATERAL EN PUENTE CON CABLE DE ${this.sTipoCable}`,
      ' INDICADA EN ESTE PROYECTO DEBERA SER VERIFICADA Y PRECISADA EN EL LUGAR POR LA RESIDENCIA',
      ` GENERAL DE CONSERVACION DE CARRETERAS EN EL ESTADO DE ${this.sEstado}.`,
      '',
      ` 6.- LA INSTALACION CON CABLE DE ${this.sTipoCable} EN PUENTE, SE HARA SIN INTERRUMPIR `,
      ' EL TRANSITO, PARA LO CUAL DEBERA ESTAR LA SUPERFICIE DE RODAMIENTO LIBRE DE OBSTACULOS- ',
      ' COMO SON PIEDRAS, ARENA, BASURA, HERRAMIENTA, ETC. ',
      ' CARPETA ASFALTICA EVITANDO SU ROMPIMIENTO.',
      '',
      ` 7.- LA INSTALACION DE LA CANALETA CON CABLE DE ${this.sTipoCable} QUE SE INDICA EN,`,
      ' ESTE PROYECTO, DEBERA FIJARSE EN LA SUBESTRUCTURA DEL PUENTE CON BARRENANCLAS AHOGADAS ',
      ' EN RESINA EPOXICA, QUEDANDO ABSOLUTAMENTE PROHIBIDO EL USO DE PISTOLAS EXPLOSIVAS.',
      '',
      ' 8.- EN LA PROTECCION Y APARIENCIA DE LA CANALETA DEBERA USARSE PINTURA ANTICORROSIVA.',
      '',
      ' 9.- TODOS LOS TRABAJOS DEBERAN HACERSE DE ACUERDO CON LAS ESPECIFICACIONES GENERALES ',
      ' DE CONSTRUCCION DE ESTA SECRETARIA Y LAS INDICACIONES ADICIONALES DE LA RESIDENCIA GE-',
      ' NERAL DE CONSERVACION DE CARRETERAS EN ESA ENTIDAD. ',
      '',
      ' 10.- CUALQUIER DANO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SENALAMIENTO ',
      ' DEBERA SER REPARADO DE INMEDIATO POR CUENTA DE TELEFONOS DE MEXICO, S.A. DE C.V. DE ',
      ' ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACION DE CARRETERAS EN',
      ' ESA ENTIDAD.',
      '',
      ' 11.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCION DE LA OBRA TELEFONOS DE MEXICO, S.A. ',
      ' DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SENALES PREVENTIVAS, RES- ',
      ' RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE  CONSERVACION DE CARRE- ',
      " TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- ",
      " EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICION 1986.",
      '',
    ];

    return lines.join('\n');
  }
}

// =============================================================================
// COMPONENTE REACT — demo de la tabla y texto
// =============================================================================

export function SelloNotasSctInstPuenteUI() {
  const [table, setTable] = useState<TableDefinition | null>(null);

  useEffect(() => {
    let mounted = true;

    const sello = new SelloNotasSctInstPuente({
      tipoCable: 'FIBRA OPTICA',
      estado: 'ESTADO DE PRUEBA',
      baseTexto: '',
    });

    sello.build([0, 0]).then(result => {
      if (mounted) setTable(result);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!table) return <div style={s.meta}>Cargando notas...</div>;

  const cell = table.cells.find(c => c.row === 2 && c.col === 1);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_sello_notas_sct_inst_puente</div>
      <div style={s.meta}>
        Tabla {table.id} ({table.rowHeights.length}x{table.colWidths.length})
      </div>
      <pre style={s.text}>{cell?.text ?? ''}</pre>
      <div style={s.meta}>
        Filas: {table.rowHeights.join(' / ')} mm · Columnas: {table.colWidths.join(' / ')} mm
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#666' },
  text   : { fontSize: 12, whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8, borderRadius: 6 },
};

export default SelloNotasSctInstPuenteUI;
