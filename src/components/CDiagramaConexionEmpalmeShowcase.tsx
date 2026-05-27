import { useEffect, useRef } from 'react'
import {
  CDiagramaConexionEmpalme,
  type Bounds,
  type DrawingContext,
  type FiberGroupDef,
} from '../models/CDiagramaConexionEmpalme'

// ─── Canvas adapter ───────────────────────────────────────────────────────────

function makeCtx(canvas: CanvasRenderingContext2D, scale: number): DrawingContext {
  const s = (n: number) => n * scale;
  return {
    drawPolyline(coords, color, width, dashed = false) {
      if (coords.length < 2) return;
      canvas.save();
      canvas.strokeStyle = color;
      canvas.lineWidth = width;
      canvas.setLineDash(dashed ? [5, 3] : []);
      canvas.beginPath();
      canvas.moveTo(s(coords[0][0]), s(coords[0][1]));
      for (const c of coords.slice(1)) canvas.lineTo(s(c[0]), s(c[1]));
      canvas.stroke();
      canvas.restore();
    },
    drawCircleFilled(cx, cy, r, fillColor) {
      canvas.save();
      canvas.fillStyle = fillColor;
      canvas.beginPath();
      canvas.arc(s(cx), s(cy), Math.max(s(r), 2), 0, Math.PI * 2);
      canvas.fill();
      canvas.restore();
    },
    drawText(text, x, y, color, fontSize) {
      const px = Math.min(Math.max(6, Math.round(fontSize * scale * 0.6)), 11);
      canvas.save();
      canvas.fillStyle = color;
      canvas.font = `bold ${px}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'bottom';
      canvas.fillText(text, s(x), s(y));
      canvas.restore();
    },
  };
}

// ─── Mock fiber groups ────────────────────────────────────────────────────────

const GREEN = '#2e7d32';
const GRAY  = '#9e9e9e';

const MOCK_GROUPS: FiberGroupDef[] = [
  {
    bundleLabel: 'AZUL',
    fibers: [
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 1', rightAnnot: ' 1' },
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 2', rightAnnot: ' 2' },
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 3', rightAnnot: ' 3' },
      { leftColor: GRAY,                     leftAnnot: ' 4' },
    ],
  },
  {
    bundleLabel: 'ROJO',
    fibers: [
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 5', rightAnnot: ' 5' },
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 6', rightAnnot: ' 6' },
      { leftColor: GRAY,                     leftAnnot: ' 7' },
      { leftColor: GRAY,                     leftAnnot: ' 8' },
    ],
  },
  {
    bundleLabel: 'VERDE',
    fibers: [
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 9',  rightAnnot: ' 9' },
      { leftColor: GREEN, rightColor: GREEN, leftAnnot: ' 10', rightAnnot: ' 10' },
      { leftColor: GRAY,                     leftAnnot: ' 11' },
      { leftColor: GRAY,                     leftAnnot: ' 12' },
    ],
  },
];

// ─── Draw helpers ─────────────────────────────────────────────────────────────

const BOUNDS: Bounds = { xmin: 50, xmax: 950, ymin: 80, ymax: 580 };
const SCALE = 0.62;

function drawDemo(canvas: HTMLCanvasElement, groups: FiberGroupDef[]) {
  canvas.width  = Math.ceil(1000 * SCALE);
  canvas.height = Math.ceil(680 * SCALE);

  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;
  ctx2d.fillStyle = '#fafafa';
  ctx2d.fillRect(0, 0, canvas.width, canvas.height);

  const diag = new CDiagramaConexionEmpalme(BOUNDS, groups, '#388e3c', '#1565c0');
  diag.drawOn(makeCtx(ctx2d, SCALE));
}

// ─── Showcase component ───────────────────────────────────────────────────────

export function CDiagramaConexionEmpalmeShowcase() {
  const ref8  = useRef<HTMLCanvasElement>(null);
  const ref12 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref8.current)  drawDemo(ref8.current,  MOCK_GROUPS.slice(0, 2));
    if (ref12.current) drawDemo(ref12.current, MOCK_GROUPS);
  }, []);

  // Static info for display
  const diag = new CDiagramaConexionEmpalme(BOUNDS, MOCK_GROUPS.slice(0, 2), '#388e3c', '#1565c0');

  const COLOR_CODES = [
    ['NAT', 'NATURAL'], ['AZU', 'AZUL'], ['AMA', 'AMARILLO'], ['ROJ', 'ROJO'],
    ['VER', 'VERDE'], ['NAR', 'NARANJA'], ['VIO', 'VIOLETA'], ['CAF', 'CAFE'],
    ['GRI', 'GRIS'], ['NEG', 'NEGRO'], ['ROS', 'ROSA'], ['BLA', 'BLANCO'],
  ];

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CDiagramaConexionEmpalme</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Fase 5 · Diagrama de conexión de empalme FO<br />
        Slots: oEmpalme, oCable_FO_llegada/salida, oLineasGrupo, oLineasForma, oFibrasCTba,<br />
        oArea, oTuboE, oTuboS, oCableE (Bresenham ellipse), oCableS
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: '#1565c0', marginBottom: 4 }}>
            8 fibras (2 grupos × 4) · empalmeColor=verde · cableColor=azul
          </div>
          <canvas ref={ref8} style={{ border: '1px solid #ddd', display: 'block' }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#1565c0', marginBottom: 4 }}>
            12 fibras (3 grupos × 4)
          </div>
          <canvas ref={ref12} style={{ border: '1px solid #ddd', display: 'block' }} />
        </div>
      </div>

      <h4 style={{ marginTop: 20 }}>Geometría calculada (8 fibras, bounds={JSON.stringify(BOUNDS)})</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 11, overflowX: 'auto' }}>
        {`empalme : x=[${diag.empalme.xmin.toFixed(0)}, ${diag.empalme.xmax.toFixed(0)}]  y=[${diag.empalme.ymin.toFixed(0)}, ${diag.empalme.ymax.toFixed(0)}]\n` +
         `tuboE   : x=[${diag.tuboE.xmin.toFixed(0)}, ${diag.tuboE.xmax.toFixed(0)}]  y=[${diag.tuboE.ymin.toFixed(0)}, ${diag.tuboE.ymax.toFixed(0)}]\n` +
         `tuboS   : x=[${diag.tuboS.xmin.toFixed(0)}, ${diag.tuboS.xmax.toFixed(0)}]  y=[${diag.tuboS.ymin.toFixed(0)}, ${diag.tuboS.ymax.toFixed(0)}]\n` +
         `cableE  : ${diag.cableE.length} puntos  (Bresenham rx=110)\n` +
         `cableS  : ${diag.cableS.length} puntos  (Bresenham rx=110)`}
      </pre>

      <h4 style={{ marginTop: 16 }}>Posiciones Y de fibras (8 fibras)</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 11, overflowX: 'auto' }}>
        {diag.fiberLines.map((l, i) =>
          `fibra[${i}] grupo=${l.groupIndex}  y=${l.y.toFixed(1)}  izq="${l.leftAnnot.trim()}"${l.rightAnnot !== undefined ? `  der="${l.rightAnnot.trim()}"` : '  (sin conexión)'}`
        ).join('\n')}
      </pre>

      <h4 style={{ marginTop: 16 }}>obtiene_color — mapa de códigos</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
        {COLOR_CODES.map(([code]) => (
          <span key={code} style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 2 }}>
            {`"${code}" → "${CDiagramaConexionEmpalme.obtienesColor(code)}"`}
          </span>
        ))}
      </div>

      <h4 style={{ marginTop: 16 }}>anotacion_linea</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {`['3','1','2'] → "${CDiagramaConexionEmpalme.anotacionLinea(['3','1','2'])}"\n` +
         `['7']        → "${CDiagramaConexionEmpalme.anotacionLinea(['7'])}"\n` +
         `[]           → "${CDiagramaConexionEmpalme.anotacionLinea([])}"`}
      </pre>
    </div>
  );
}
