import { useEffect, useRef } from 'react'
import { CClienteGrafico, type Bounds, type ClienteRecord } from '../models/CClienteGrafico'

type Case = { cliente: ClienteRecord; color: string; label: string; bounds: Bounds }

const cases: Case[] = [
  {
    label: 'name + nomCliente',
    color: '#2196f3',
    bounds: { xmin: 30, xmax: 150, ymin: 60, ymax: 180 },
    cliente: {
      name: 'CLI-001',
      'user!_clientes': { an_element: () => ({ txt_nom_cliente: 'Empresa SA' }) },
    },
  },
  {
    label: 'name only (sin clientes)',
    color: '#e91e63',
    bounds: { xmin: 200, xmax: 320, ymin: 60, ymax: 180 },
    cliente: {
      name: 'CLI-002',
      'user!_clientes': { an_element: () => undefined },
    },
  },
  {
    label: 'name=undefined',
    color: '#4caf50',
    bounds: { xmin: 370, xmax: 490, ymin: 60, ymax: 180 },
    cliente: {
      name: undefined,
      'user!_clientes': { an_element: () => ({ txt_nom_cliente: 'Sin nombre' }) },
    },
  },
]

export function CClienteGraficoShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const c of cases) {
      const grafico = new CClienteGrafico(c.cliente, c.bounds, c.color)
      grafico.despliega(ctx)

      ctx.save()
      ctx.fillStyle = '#999'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.label, (c.bounds.xmin + c.bounds.xmax) / 2, c.bounds.ymax + 16)
      ctx.restore()
    }
  }, [])

  const demo = new CClienteGrafico(
    {
      name: 'CLI-TST',
      'user!_clientes': { an_element: () => ({ txt_nom_cliente: 'Test Corp' }) },
    },
    { xmin: 0, xmax: 90, ymin: 0, ymax: 90 },
  )

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CClienteGrafico — símbolo de cliente FO</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Rectángulo + 1 diagonal + 2 etiquetas (name + txt_nom_cliente)
      </p>
      <canvas
        ref={canvasRef}
        width={530}
        height={220}
        style={{ border: '1px solid #ddd', background: '#fafafa', display: 'block' }}
      />
      <h4 style={{ marginTop: 20 }}>getSectors() — 2 sectores (rect + diagonal)</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {demo.getSectors().map((s, i) =>
          `sector[${i}]: ${s.map(([x, y]) => `(${x},${y})`).join(' → ')}`
        ).join('\n')}
      </pre>
      <h4>getCliente()</h4>
      <pre style={{ background: '#f5f5f5', padding: 8 }}>
        {`name:           "${demo.getCliente().name}"\ntxt_nom_cliente: "${demo.getCliente()['user!_clientes'].an_element()?.txt_nom_cliente}"`}
      </pre>
    </div>
  )
}
