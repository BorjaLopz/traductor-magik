import { CCuadroSimbologiaPlanosFo } from '../models/CCuadroSimbologiaPlanosFo'

const SCALE = 2.5   // map units → px

function TableViz({ name, rowH, colW, origin, cell }: {
  name: string
  rowH: number
  colW: number
  origin: { x: number; y: number }
  cell: { text?: string; fontSize?: number; symbolName?: string } | undefined
}) {
  const w = colW * SCALE
  const h = rowH * SCALE
  const isSymbol = !!cell?.symbolName

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>{name}</div>
      <div style={{
        width: w,
        height: h,
        border: '1.5px solid #555',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isSymbol ? '#eef6ff' : '#fff',
        position: 'relative',
      }}>
        {isSymbol ? (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#2196f3' }}>
            <div style={{ fontSize: 20 }}>⊞</div>
            <div>{cell?.symbolName}</div>
          </div>
        ) : (
          <span style={{
            fontSize: Math.min(Math.max(8, (cell?.fontSize ?? 12) * SCALE * 0.08), 13),
            fontWeight: 'bold',
            letterSpacing: 1,
          }}>
            {cell?.text ?? ''}
          </span>
        )}
        <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 9, color: '#bbb' }}>
          {colW}×{rowH}
        </span>
      </div>
      <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
        origin ({origin.x}, {origin.y})
      </div>
    </div>
  )
}

export function CCuadroSimbologiaPlanosFoShowcase() {
  const sello = new CCuadroSimbologiaPlanosFo({ x: 0, y: 200 })
  sello.configura_tabla()
  sello.etiqueta_celdas()

  const tables = sello.getTables()
  const tblTitulo = tables.find(t => t.name === 'tbl_titulo')!
  const tblSimbologia = tables.find(t => t.name === 'tbl_simbologia')!

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CCuadroSimbologiaPlanosFo</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Extends <code>c_base_sello_fibra</code> · 2 tablas: título + símbología FO
      </p>

      <h4>Layout visual (escala {SCALE}×)</h4>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 0, border: '2px solid #ccc', padding: 8 }}>
        <TableViz
          name="tbl_titulo"
          rowH={tblTitulo.rowHeights[0]}
          colW={tblTitulo.colWidths[0]}
          origin={tblTitulo.origin}
          cell={tblTitulo.cells.get('1,1')}
        />
        <TableViz
          name="tbl_simbologia"
          rowH={tblSimbologia.rowHeights[0]}
          colW={tblSimbologia.colWidths[0]}
          origin={tblSimbologia.origin}
          cell={tblSimbologia.cells.get('1,1')}
        />
      </div>

      <h4 style={{ marginTop: 20 }}>getTables() — tabla defs</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {tables.map(t =>
          `${t.name}:\n  origin: (${t.origin.x}, ${t.origin.y})\n  rowHeights: [${t.rowHeights}]\n  colWidths:  [${t.colWidths}]\n  cell(1,1): ${JSON.stringify(Object.fromEntries(t.cells), null, 0)}`
        ).join('\n\n')}
      </pre>
    </div>
  )
}
