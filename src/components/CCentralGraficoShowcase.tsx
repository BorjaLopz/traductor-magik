import { useEffect, useRef } from 'react'
import { CCentralGrafico, type Bounds, type CentralRecord } from '../models/CCentralGrafico'

const centrales: Array<{ record: CentralRecord; color: string; label: string }> = [
  { record: { 'user!_siglas': 'SAB' }, color: '#2196f3', label: 'CTL-SAB' },
  { record: { 'user!_siglas': 'NZA' }, color: '#e91e63', label: 'CTL-NZA' },
  { record: { 'user!_siglas': undefined }, color: '#4caf50', label: 'siglas=undefined' },
]

const boundsRow: Bounds[] = [
  { xmin: 30,  xmax: 130, ymin: 50, ymax: 150 },
  { xmin: 180, xmax: 280, ymin: 50, ymax: 150 },
  { xmin: 330, xmax: 430, ymin: 50, ymax: 150 },
]

export function CCentralGraficoShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    centrales.forEach(({ record, color }, i) => {
      const bounds = boundsRow[i]
      const grafico = new CCentralGrafico(record, bounds, color)
      grafico.despliega(ctx)
    })

    // label row
    ctx.save()
    ctx.fillStyle = '#999'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    centrales.forEach(({ label }, i) => {
      const b = boundsRow[i]
      ctx.fillText(label, (b.xmin + b.xmax) / 2, b.ymax + 16)
    })
    ctx.restore()
  }, [])

  const demo = new CCentralGrafico({ 'user!_siglas': 'TST' }, { xmin: 0, xmax: 90, ymin: 0, ymax: 90 })

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CCentralGrafico — símbolo de central FO</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Rectángulo + 3 diagonales de tramado + etiqueta CTL-&#123;siglas&#125;
      </p>
      <canvas
        ref={canvasRef}
        width={480}
        height={200}
        style={{ border: '1px solid #ddd', background: '#fafafa', display: 'block' }}
      />
      <h4 style={{ marginTop: 20 }}>getSectors() — 4 sectores (1 rect + 3 diagonales)</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {demo.getSectors().map((s, i) =>
          `sector[${i}]: ${s.map(([x, y]) => `(${x},${y})`).join(' → ')}`
        ).join('\n')}
      </pre>
      <h4>getCentral()</h4>
      <pre style={{ background: '#f5f5f5', padding: 8 }}>
        {`user!_siglas: "${demo.getCentral()['user!_siglas']}"`}
      </pre>
    </div>
  )
}
