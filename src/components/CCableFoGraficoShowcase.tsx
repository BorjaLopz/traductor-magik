import { useEffect, useRef } from 'react'
import { CCableFoGrafico, type Bounds, type CableGraficoRecord, type Direction } from '../models/CCableFoGrafico'

const mockCable: CableGraficoRecord = {
  'user!_km_real_medido': { value: 1.25, unit: { Short_description: 'km' } },
  spec_id: 'SPEC-FO-24',
  get_spec_record: () => ({ 'user!_clase': 'ADSS', fiber_quantity: 24 }),
}

type Case = { label: string; direction: Direction; bounds: Bounds; color: string; inicio?: boolean }

const cases: Case[] = [
  { label: 'right →', direction: 'right', bounds: { xmin: 20, xmax: 220, ymin: 35, ymax: 65 }, color: '#2196f3' },
  { label: '← left',  direction: 'left',  bounds: { xmin: 260, xmax: 460, ymin: 35, ymax: 65 }, color: '#e91e63' },
  { label: '↓ down',  direction: 'down',  bounds: { xmin: 30, xmax: 90, ymin: 100, ymax: 340 }, color: '#4caf50' },
  { label: '↑ up',    direction: 'up',    bounds: { xmin: 130, xmax: 190, ymin: 100, ymax: 340 }, color: '#ff9800' },
  {
    label: 'ini/fin (inicio=true)',
    direction: 'right',
    bounds: { xmin: 240, xmax: 480, ymin: 200, ymax: 240 },
    color: '#9c27b0',
    inicio: true,
  },
]

export function CCableFoGraficoShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const c of cases) {
      const cable = new CCableFoGrafico(mockCable, c.bounds, c.direction, c.color)
      if (c.inicio !== undefined) cable.inicio = c.inicio

      // bounds reference rect
      ctx.save()
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.strokeRect(c.bounds.xmin, c.bounds.ymin, c.bounds.xmax - c.bounds.xmin, c.bounds.ymax - c.bounds.ymin)
      ctx.restore()

      cable.despliega(ctx)
      if (c.inicio !== undefined) cable.dibujarAnotacionCabIniFin(ctx)

      // direction label
      ctx.save()
      ctx.fillStyle = '#999'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(c.label, (c.bounds.xmin + c.bounds.xmax) / 2, c.bounds.ymin - 4)
      ctx.restore()
    }
  }, [])

  const demo = new CCableFoGrafico(mockCable, { xmin: 0, xmax: 100, ymin: 0, ymax: 20 }, 'right')

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CCableFoGrafico — cable FO gráfico</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Cada rectángulo punteado = bounds de entrada. La línea coloreada = sector generado.
      </p>
      <canvas
        ref={canvasRef}
        width={520}
        height={370}
        style={{ border: '1px solid #ddd', background: '#fafafa', display: 'block' }}
      />
      <h4 style={{ marginTop: 20 }}>getCable().spec_id</h4>
      <pre style={{ background: '#f5f5f5', padding: 8 }}>{String(demo.getCable().spec_id)}</pre>
      <h4>getCable()['user!_km_real_medido']</h4>
      <pre style={{ background: '#f5f5f5', padding: 8 }}>
        {`value: ${demo.getCable()['user!_km_real_medido'].value}\nunit:  ${demo.getCable()['user!_km_real_medido'].unit.Short_description}`}
      </pre>
    </div>
  )
}
