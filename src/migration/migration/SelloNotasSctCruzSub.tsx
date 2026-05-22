/**
 * Migracion de: c_sello_notas_sct_cruz_sub.magik
 * Clase Magik:  c_sello_notas_sct_cruz_sub
 * Metodos:      prvCrea_Cfg_Tbl_Notas_Grales, prvAsignaTexto
 *
 * Intencion:
 *   Crear la tabla de notas generales (2x1) y asignar un bloque
 *   de texto con reglas del cruce subterraneo.
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
  procedimiento: string;
  baseTexto?: string;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class SelloNotasSctCruzSub {
  readonly sTipoCable: string;
  readonly sEstado: string;
  readonly sProcedimiento: string;
  readonly baseTexto: string;

  constructor(params: SelloNotasParams) {
    this.sTipoCable = params.tipoCable;
    this.sEstado = params.estado;
    this.sProcedimiento = params.procedimiento;
    this.baseTexto = params.baseTexto ?? '';
  }

  // Magik: prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)
  async prvCreaCfgTblNotasGrales(origin: Coord2D): Promise<TableDefinition> {
    const table: TableDefinition = {
      id: 'tbl_notas_grales',
      origin,
      rowHeights: [10, 210],
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
      ` 5.- LA UBICACION DEL CRUZAMIENTO SUBTERRANEO CON CABLE DE ${this.sTipoCable}`,
      ' INDICADO EN ESTE PROYECTO DEBERA SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA',
      ` GENERAL DE CONSERVACION DE CARRETERAS EN EL ESTADO DE ${this.sEstado}.`,
      '',
      ` 6.- EL CRUZAMIENTO SUBTERRANEO CON CABLE DE ${this.sTipoCable} SE HARA POR EL `,
      ` PROCEDIMIENTO DE '${this.sProcedimiento}', PARA LO CUAL SE REQUIERE ENCAMISAR `,
      ' EL CABLE CON EL FIN DE PROTEGER LAS FIBRAS OPTICAS O COBRE Y PRINCIPALMENTE LA ',
      ' CARPETA ASFALTICA EVITANDO SU ROMPIMIENTO.',
      '',
      ` 7.- AL EFECTUAR EL CRUZAMIENTO POR EL PROCEDIMIENTO DE '${this.sProcedimiento}',`,
      ' SE EVITARA INTERRUMPIR EL TRANSITO Y MOLESTIAS AL USUARIO DE ESTA VIA.',
      '',
      ' 8.- DENTRO DEL DERECHO DE VIA, LA DISTANCIA ENTRE LA PARTE MAS BAJA DEL TERRENO',
      ` NATURAL O LA PARTE MAS BAJA DE LA SECCION DEL CAMINO, SOBRE LA CAMISA O CABLE DE ${this.sTipoCable} SERA DE 1.50 M. COMO MINIMO EN LOS TRAMOS CON/SIN TERRAPLEN Y `,
      ' NO MENOR DE 2.00 M. A PARTIR DEL FONDO DE LAS CUNETAS.',
      '',
      ` 9.- EL CRUZAMIENTO SUBTERRANEO CON CABLE DE ${this.sTipoCable} QUE SE INDICA EN `,
      ' ESTE PROYECTO, DEBERA EFECTUARSE CONFORME A LAS INDICACIONES ADICIONALES DE LA ',
      ' RESIDENCIA GENERAL DE CONSERVACION DE CARRETERAS, ASI COMO LAS RECOMENDACIONES ',
      ' QUE SE DERIVEN DE LAS INSPECCIONES EN CAMPO.',
      '',
      ' 10.- LOS POZOS DE VISITA SE UBICARAN FUERA DEL AREA DEL DERECHO DE VIA O DENTRO DE UNA',
      ' FRANJA NO MAYOR DE 2.50 M. DE ANCHO EN AMBOS LADOS DE LA CARRETERA, MEDIDOS A PARTIR ',
      ' DEL LIMITE DEL DERECHO DE VIA.',
      '',
      ' 11.- CUALQUIER DANO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SENALAMIENTO ',
      ' DEBERA SER REPARADO DE INMEDIATO POR CUENTA DE TELEFONOS DE MEXICO, S.A. DE C.V. DE ',
      ' ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACION DE CARRETERAS EN',
      ' ESA ENTIDAD.',
      '',
      ' 12.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCION DE LA OBRA TELEFONOS DE MEXICO, S.A. ',
      ' DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SENALES PREVENTIVAS, RES- ',
      ' RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE  CONSERVACION DE CARRE- ',
      " TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- ",
      " EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICION 1986.",
      '',
      ' 13.- UNA VEZ TERMINADOS LOS TRABAJOS DE ESTA OBRA, DEBERAN RETIRARSE FUERA DE LOS LIMITES',
      ' DEL DERECHO DE VIA TODOS LOS MATERIALES SOBRANTES DE LA EXCAVACION Y LOS DE  CONSTRUCCION',
      ' DE LA OBRA INCLUYENDO EL SENALAMIENTO DE MODO QUE LA CARRETERA Y LA ZONA DEL DERECHO DE -',
      ' VIA QUEDEN EN SUS CONDICIONES ORIGINALES.',
    ];

    return lines.join('\n');
  }
}

// =============================================================================
// COMPONENTE REACT — demo de la tabla y texto
// =============================================================================

export function SelloNotasSctCruzSubUI() {
  const [table, setTable] = useState<TableDefinition | null>(null);

  useEffect(() => {
    let mounted = true;

    const sello = new SelloNotasSctCruzSub({
      tipoCable: 'FIBRA OPTICA',
      estado: 'ESTADO DE PRUEBA',
      procedimiento: 'PERFORACION DIRIGIDA',
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
      <div style={s.title}>c_sello_notas_sct_cruz_sub</div>
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

export default SelloNotasSctCruzSubUI;
