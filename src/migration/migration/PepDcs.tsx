/**
 * Migracion de: c_pep_dcs.magik
 * Clase Magik:  c_pep_dcs
 * Metodos:      dfn_Detalle_Titulo_Referencias, dfn_Detalle_Valores_Referencias
 *
 * Intencion:
 *   Construir titulos y valores de referencia para la tabla PEP.
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface ProyectoReferencias {
  referenciaDesmontaje: string;
  referenciaCanalizacion: string;
  referenciaSecundarios: string;
}

export type ReferenciasMap = Record<number, string>;

// =============================================================================
// HELPERS
// =============================================================================

export function buildDetalleTituloReferencias(): {
  rowCount: number;
  titles: ReferenciasMap;
} {
  const titles: ReferenciasMap = {
    1: 'DESMONTAJE',
    2: 'CANALIZACION',
    3: 'SECUNDARIO',
  };

  return { rowCount: 3, titles };
}

export function buildDetalleValoresReferencias(
  proyecto: ProyectoReferencias | null,
): ReferenciasMap {
  if (proyecto) {
    return {
      1: proyecto.referenciaDesmontaje ?? '',
      2: proyecto.referenciaCanalizacion ?? '',
      3: proyecto.referenciaSecundarios ?? '',
    };
  }

  return { 1: '', 2: '', 3: '' };
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class PepDcs {
  nNumeroRenglones: number = 0;
  proyecto: ProyectoReferencias | null;

  constructor(proyecto: ProyectoReferencias | null = null) {
    this.proyecto = proyecto;
  }

  // Magik: dfn_Detalle_Titulo_Referencias()
  async dfnDetalleTituloReferencias(): Promise<ReferenciasMap> {
    const { rowCount, titles } = buildDetalleTituloReferencias();
    this.nNumeroRenglones = rowCount; // Magik: _self.nNumero_Renglones << 3
    return titles;
  }

  // Magik: dfn_Detalle_Valores_Referencias()
  async dfnDetalleValoresReferencias(): Promise<ReferenciasMap> {
    return buildDetalleValoresReferencias(this.proyecto);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de titulos y valores
// =============================================================================

export function PepDcsUI() {
  const [titles, setTitles] = useState<ReferenciasMap>({});
  const [values, setValues] = useState<ReferenciasMap>({});
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const mockProyecto: ProyectoReferencias = {
      referenciaDesmontaje: 'REF-DES-001',
      referenciaCanalizacion: 'REF-CAN-010',
      referenciaSecundarios: 'REF-SEC-120',
    };

    const pep = new PepDcs(mockProyecto);

    Promise.all([
      pep.dfnDetalleTituloReferencias(),
      pep.dfnDetalleValoresReferencias(),
    ]).then(([tit, val]) => {
      if (!mounted) return;
      setTitles(tit);
      setValues(val);
      setRowCount(pep.nNumeroRenglones);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const rows = rowCount > 0 ? Array.from({ length: rowCount }, (_, i) => i + 1) : [];

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_pep_dcs.dfn_Detalle_Referencias</div>
      <div style={s.meta}>Renglones: {rowCount}</div>
      {rows.length === 0 ? (
        <div style={s.meta}>Sin datos.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>titulo</th>
              <th style={s.th}>valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td style={s.td}>{titles[row] ?? ''}</td>
                <td style={s.td}>{values[row] ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={s.note}>
        Si no hay proyecto, los valores se devuelven como cadenas vacias.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#666' },
  note   : { fontSize: 11, color: '#888' },
  table  : { width: '100%', borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '6px 8px', textAlign: 'left', fontSize: 12 },
  td     : { borderBottom: '1px solid #eee', padding: '6px 8px', fontSize: 12 },
};

export default PepDcsUI;
