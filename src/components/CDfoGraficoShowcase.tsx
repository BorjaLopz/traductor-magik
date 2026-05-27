import { useEffect, useRef } from 'react'
import { CDfoGrafico, type Coord, type Bounds, type Direction, type DfoLike, type DrawingContext } from '../models/CDfoGrafico'

// ─── Canvas adapter ───────────────────────────────────────────────────────────

function makeCtx(canvas: CanvasRenderingContext2D, scale: number, yOffset = 0): DrawingContext {
  const sx = (x: number) => x * scale;
  const sy = (y: number) => (y + yOffset) * scale;
  return {
    drawPolyline(coords: Coord[], color: string, width: number) {
      if (coords.length < 2) return;
      canvas.save();
      canvas.strokeStyle = color;
      canvas.lineWidth = width;
      canvas.beginPath();
      canvas.moveTo(sx(coords[0][0]), sy(coords[0][1]));
      for (const c of coords.slice(1)) canvas.lineTo(sx(c[0]), sy(c[1]));
      canvas.stroke();
      canvas.restore();
    },
    drawCircleFilled(cx: number, cy: number, r: number, fillColor: string) {
      canvas.save();
      canvas.fillStyle = fillColor;
      canvas.beginPath();
      canvas.arc(sx(cx), sy(cy), Math.max(sx(r), 3), 0, Math.PI * 2);
      canvas.fill();
      canvas.restore();
    },
    drawText(text: string, x: number, y: number, color: string, fontSize: number) {
      const px = Math.min(Math.max(8, Math.round(fontSize * scale * 0.55)), 11);
      canvas.save();
      canvas.fillStyle = color;
      canvas.font = `bold ${px}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'bottom';
      canvas.fillText(text, sx(x), sy(y));
      canvas.restore();
    },
  };
}

// ─── Mock DFO ────────────────────────────────────────────────────────────────

function mockDfo(nPorts: number, name: string): DfoLike {
  return {
    all_rme_port_components: () => ({ size: nPorts }),
    obtenerlenguajecomun: () => name,
    owner: { owner: {
      obtenernumerodepiso: () => '3',
      obtenertiposala: () => 'Sala Técnica',
    }},
  };
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

const DFO_BOUNDS: Bounds = { xmin: 50, xmax: 250, ymin: 50, ymax: 350 };

function drawDemo(
  canvas: HTMLCanvasElement,
  nPorts: number,
  direction: Direction,
  etNo: number,
  label: string,
  color: string,
) {
  const scale = 0.9;
  // direction='down' → terminal extends to y~550, yOffset=0; 'up' → terminal at y~-50, yOffset=250
  const yOffset = direction === 'up' ? 280 : 0;
  const W = Math.ceil(320 * scale);
  const H = Math.ceil((direction === 'down' ? 620 : 620) * scale);
  canvas.width = W;
  canvas.height = H;
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;
  ctx2d.fillStyle = '#fafafa';
  ctx2d.fillRect(0, 0, W, H);

  const dfo = new CDfoGrafico(mockDfo(nPorts, label), DFO_BOUNDS, direction, etNo, color);
  dfo.drawOn(makeCtx(ctx2d, scale, yOffset));
}

// ─── Showcase component ───────────────────────────────────────────────────────

export function CDfoGraficoShowcase() {
  const ref4down = useRef<HTMLCanvasElement>(null);
  const ref8up   = useRef<HTMLCanvasElement>(null);
  const ref24down = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref4down.current) drawDemo(ref4down.current, 4, 'down', 1, 'DFO-001', '#1565c0');
    if (ref8up.current)   drawDemo(ref8up.current, 8, 'up', 2, 'DFO-002', '#2e7d32');
    if (ref24down.current) drawDemo(ref24down.current, 24, 'down', 3, 'DFO-003', '#6a1f7a');
  }, []);

  const demoInfo = [
    { ref: ref4down,  label: '4 puertos, direction=down, ET 1',  color: '#1565c0' },
    { ref: ref8up,    label: '8 puertos, direction=up, ET 2',    color: '#2e7d32' },
    { ref: ref24down, label: '24 puertos, direction=down, ET 3', color: '#6a1f7a' },
  ];

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CDfoGrafico</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Fase 5 · DFO box + interior lines + terminal circle + ET annotation<br />
        Slots: oSectors, oAnotacion, oPuertos, oTerminal, oDfo, oColor
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {demoInfo.map(({ ref, label, color }, i) => (
          <div key={i}>
            <div style={{ fontSize: 11, color, marginBottom: 4 }}>{label}</div>
            <canvas ref={ref} style={{ border: '1px solid #ddd', display: 'block' }} />
          </div>
        ))}
      </div>

      <h4 style={{ marginTop: 20 }}>Estructura de sectores (4 ports, down)</h4>
      <SectorsTable nPorts={4} direction="down" />

      <h4 style={{ marginTop: 16 }}>crear_terminal</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {terminalInfo('down')}
        {'\n'}
        {terminalInfo('up')}
      </pre>
    </div>
  );
}

function SectorsTable({ nPorts, direction }: { nPorts: number; direction: Direction }) {
  const dfo = new CDfoGrafico(mockDfo(nPorts, 'DFO-DBG'), DFO_BOUNDS, direction, 1);
  const secs = dfo.sectors;
  return (
    <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 11, overflowX: 'auto' }}>
      {secs.map((s, i) =>
        `sector[${i}]: ${s.map(p => `(${p[0].toFixed(0)},${p[1].toFixed(0)})`).join(' → ')}`
      ).join('\n')}
      {'\npuertos: ' + dfo.puertos.map(p => `"${p.texto}"@(${p.ubicacion[0].toFixed(0)},${p.ubicacion[1].toFixed(0)})`).join(', ')}
    </pre>
  );
}

function terminalInfo(direction: Direction): string {
  const dfo = new CDfoGrafico(mockDfo(4, 'X'), DFO_BOUNDS, direction, 1);
  const t = dfo.terminal;
  return `direction="${direction}": ubicacion=(${t.ubicacion[0].toFixed(0)},${t.ubicacion[1].toFixed(0)}) anota=(${t.anota[0].toFixed(0)},${t.anota[1].toFixed(0)}) radio=${t.radio.toFixed(1)} texto="${t.texto}"`;
}
