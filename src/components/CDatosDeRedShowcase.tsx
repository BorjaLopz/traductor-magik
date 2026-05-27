import type { CSSProperties } from 'react'
import { CDatosDeRed, type TableDef, type CellContent } from '../models/CDatosDeRed'

const SCALE = 3  // map units → px

const MOCK_DATOS = {
  pares_conec_sec: '200', lineas_ocup_sec: '140',
  pares_conec_pri: '100', lineas_ocup_pri: '72',
  distancia_oc: '850 m', ruta: 'OPTICA',
  fo_asignada: 'FOC-48', no_fo_asignada: '12',
  fo_conetada_tba: '8', nipp: '320', nsep: '256',
  moda: 'E', ailimip: '192', b2a1a: '128',
  c: '64', d3a: '32', e: '16', baldios: '0',
}

function cell(tbl: TableDef, r: number, c: number): CellContent | undefined {
  return tbl.cells.get(`${r},${c}`)
}

function borderStyle(tbl: TableDef, r: number, c: number): CSSProperties {
  const b = tbl.borders.get(`${r},${c}`)
  if (!b) return { border: '1px solid #aaa' }
  return {
    borderTop:    b.bBorde_Sup ? '1px solid #888' : '1px solid transparent',
    borderRight:  b.bBorde_Der ? '1px solid #888' : '1px solid transparent',
    borderBottom: b.bBorde_Inf ? '1px solid #888' : '1px solid transparent',
    borderLeft:   b.bBorde_Izq ? '1px solid #888' : '1px solid transparent',
  }
}

function TableGrid({ tbl }: { tbl: TableDef }) {
  const colW = tbl.colWidths.map(w => w * SCALE)
  const rowH = tbl.rowHeights.map(h => Math.max(h * SCALE, 18))

  return (
    <div style={{ display: 'inline-block', fontFamily: 'monospace' }}>
      {tbl.rowHeights.map((_, ri) => (
        <div key={ri} style={{ display: 'flex', height: rowH[ri] }}>
          {tbl.colWidths.map((_, ci) => {
            const r = ri + 1; const c = ci + 1;
            const content = cell(tbl, r, c);
            const isLabel = !!content && !cell(tbl, r, c)?.text?.match(/^\d/)
            return (
              <div
                key={ci}
                style={{
                  width: colW[ci],
                  minHeight: rowH[ri],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: isLabel && content?.colSpan ? '#e8f0ff' : content ? '#fff' : '#f9f9f9',
                  fontSize: 8,
                  padding: '0 2px',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  ...borderStyle(tbl, r, c),
                }}
              >
                {content?.text ?? ''}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function CDatosDeRedShowcase() {
  const sello = new CDatosDeRed({ x: 0, y: 200 })
  sello.configura_tabla()
  sello.etiqueta_celdas()

  const selloFilled = new CDatosDeRed({ x: 0, y: 200 })
  selloFilled.configura_tabla()
  selloFilled.etiqueta_celdas()
  selloFilled.datos = MOCK_DATOS
  selloFilled.llena_datos_celdas()

  const tbl = sello.getTables()[0]
  const tblFilled = selloFilled.getTables()[0]

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CDatosDeRed</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Extends <code>c_base_sello_fibra</code> · 14×5 table · border hiding · NSE/FO calculations
      </p>

      <h4>Estructura (etiquetas estáticas, escala {SCALE}×)</h4>
      <div style={{ overflowX: 'auto' }}>
        <TableGrid tbl={tbl} />
      </div>

      <h4 style={{ marginTop: 20 }}>Con datos mock (llena_datos_celdas)</h4>
      <div style={{ overflowX: 'auto' }}>
        <TableGrid tbl={tblFilled} />
      </div>

      <h4 style={{ marginTop: 20 }}>Cálculo FO requerida</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {`ailimip=${MOCK_DATOS.ailimip} → FO=${(+MOCK_DATOS.ailimip/64).toFixed(4)}\n` +
         `b2a1a=${MOCK_DATOS.b2a1a}   → FO=${(+MOCK_DATOS.b2a1a/64).toFixed(4)}\n` +
         `c=${MOCK_DATOS.c}           → FO=${(+MOCK_DATOS.c/64).toFixed(4)}\n` +
         `d3a=${MOCK_DATOS.d3a}       → FO=${(+MOCK_DATOS.d3a/64).toFixed(4)}\n` +
         `e=${MOCK_DATOS.e}           → FO=${(+MOCK_DATOS.e/64).toFixed(4)}\n` +
         `────────────────────────────────────────────\n` +
         `FO requerida = ${((+MOCK_DATOS.ailimip + +MOCK_DATOS.b2a1a + +MOCK_DATOS.c + +MOCK_DATOS.d3a + +MOCK_DATOS.e)/64).toFixed(4)}`}
      </pre>

      <h4 style={{ marginTop: 20 }}>Bordes ocultos configurados</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {`bBorde_Sup=false: [1,5],[2,5],[3,5],[4,5],[5,5],[14,1],[14,2],[2,1]\n` +
         `bBorde_Der=false: [1,5],[2,5],[3,5],[4,5],[5,5],[1,1],[1,2],[1,3],[6,1-4],[13,1],[14,1],[14,3]\n` +
         `bBorde_Izq=false: [13,2],[13,1],[14,1],[14,2]\n` +
         `bBorde_Inf=false: [1,5],[2,5],[3,5],[4,5],[13,1],[13,2],[14,1],[14,2]`}
      </pre>
    </div>
  )
}
