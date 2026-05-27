import { useEffect, useRef } from 'react'
import {
  CConexionEmpalme,
  type AnyPin,
  type Bounds,
  type CableLike,
  type DrawingContext,
  type EmpalmeRecord,
} from '../models/CConexionEmpalme'

// ─── Canvas DrawingContext adapter ────────────────────────────────────────────

function makeCtx(canvas: CanvasRenderingContext2D, scale: number): DrawingContext {
  const s = (n: number) => n * scale;
  return {
    drawPolyline(coords, color, width, dashed = false) {
      if (coords.length < 2) return;
      canvas.save();
      canvas.strokeStyle = color;
      canvas.lineWidth = width;
      canvas.setLineDash(dashed ? [6, 4] : []);
      canvas.beginPath();
      canvas.moveTo(s(coords[0][0]), s(coords[0][1]));
      for (const c of coords.slice(1)) canvas.lineTo(s(c[0]), s(c[1]));
      canvas.stroke();
      canvas.restore();
    },
    drawFilledArea(coords, strokeColor, width) {
      if (coords.length < 2) return;
      canvas.save();
      canvas.strokeStyle = strokeColor;
      canvas.lineWidth = width;
      canvas.beginPath();
      canvas.moveTo(s(coords[0][0]), s(coords[0][1]));
      for (const c of coords.slice(1)) canvas.lineTo(s(c[0]), s(c[1]));
      canvas.closePath();
      canvas.stroke();
      canvas.restore();
    },
    drawCircleFilled(cx, cy, r, fillColor) {
      canvas.save();
      canvas.fillStyle = fillColor;
      canvas.beginPath();
      canvas.arc(s(cx), s(cy), s(r), 0, Math.PI * 2);
      canvas.fill();
      canvas.restore();
    },
    drawText(text, x, y, color, fontSize, angleDeg = 0) {
      const px = Math.min(Math.max(8, Math.round(fontSize * scale * 0.6)), 11);
      canvas.save();
      canvas.fillStyle = color;
      canvas.font = `bold ${px}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'bottom';
      canvas.translate(s(x), s(y));
      if (angleDeg !== 0) canvas.rotate((angleDeg * Math.PI) / 180);
      canvas.fillText(text, 0, 0);
      canvas.restore();
    },
  };
}

// ─── Mock GIS data ────────────────────────────────────────────────────────────

function makePin(fiber_number: number, kind: 'tba' | 'salida' | 'none', tba: CableLike, salida: CableLike): AnyPin {
  const conn = kind === 'tba' ? { owner: tba } : kind === 'salida' ? { owner: salida } : undefined;
  return {
    kind: 'fiber',
    fiber_number,
    fiber_owner_record: {
      'user!_cuenta': kind !== 'none' ? `CTA-${fiber_number.toString().padStart(3, '0')}` : undefined,
      'user!_estado': kind === 'none' ? 'M' : kind === 'tba' ? 'A' : undefined,
    },
    connected_object: () => conn,
  };
}

function buildMocks(_bounds: Bounds): { cable: CableLike; empalme: EmpalmeRecord } {
  // TBA cable — 2 fibers go to TBA
  const tbaCable: CableLike = {
    construction_status: 'INSTALADO',
    spec_id: 'FOC-TBA-24',
    obtener_pines: () => [],
    mit_sheath_pins: { size: 0 },
  };
  // Outgoing (salida) cable
  const salidaCable: CableLike = {
    construction_status: 'INSTALADO',
    spec_id: 'FOC-SAL-12',
    obtener_pines: () => [],
    mit_sheath_pins: { size: 0 },
  };

  // Incoming (llegada) cable — 5 fibers: 2 to TBA, 2 to salida, 1 unconnected
  const llegadaPins: AnyPin[] = [
    makePin(1, 'tba', tbaCable, salidaCable),
    makePin(2, 'tba', tbaCable, salidaCable),
    makePin(3, 'salida', tbaCable, salidaCable),
    makePin(4, 'salida', tbaCable, salidaCable),
    makePin(5, 'none', tbaCable, salidaCable),
  ];
  const llegadaCable: CableLike = {
    construction_status: 'INSTALADO',
    spec_id: 'FOC-LLE-48',
    obtener_pines: () => llegadaPins,
    mit_sheath_pins: { size: llegadaPins.length },
  };

  // TBA cable exposes llegada through its pin connectivity
  const tbaPin: AnyPin = {
    kind: 'fiber',
    fiber_number: 1,
    fiber_owner_record: undefined,
    connected_object: () => ({ owner: llegadaCable }),
  };
  tbaCable.obtener_pines = () => [tbaPin];
  tbaCable.mit_sheath_pins = { size: 1 };

  return {
    cable: tbaCable,
    empalme: { construction_status: 'INSTALADO', 'user!_tipo_emp': 'FOSC-400-B4' },
  };
}

// ─── Ellipse-only demo (pure math, no mock GIS) ───────────────────────────────

function drawEllipseDemo(canvas: CanvasRenderingContext2D, w: number, h: number) {
  canvas.clearRect(0, 0, w, h);
  canvas.fillStyle = '#fafafa';
  canvas.fillRect(0, 0, w, h);

  const demo = new CConexionEmpalme(
    { construction_status: 'INSTALADO', spec_id: 'X', obtener_pines: () => [], mit_sheath_pins: { size: 0 } },
    { construction_status: 'INSTALADO', 'user!_tipo_emp': 'Y' },
    { xmin: 0, xmax: 400, ymin: 0, ymax: 300 },
  );

  const cases: Array<{ xc: number; yc: number; rx: number; ry: number; color: string; label: string }> = [
    { xc: 80, yc: 120, rx: 60, ry: 90, color: '#2196f3', label: 'rx=60 ry=90' },
    { xc: 240, yc: 120, rx: 100, ry: 60, color: '#e91e63', label: 'rx=100 ry=60' },
    { xc: 360, yc: 120, rx: 30, ry: 100, color: '#4caf50', label: 'rx=30 ry=100' },
  ];

  for (const c of cases) {
    const pts = demo.generaFormaCables(c.xc, c.yc, c.rx, c.ry);
    canvas.save();
    canvas.strokeStyle = c.color;
    canvas.lineWidth = 1.5;
    canvas.beginPath();
    canvas.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) canvas.lineTo(p[0], p[1]);
    canvas.closePath();
    canvas.stroke();
    canvas.fillStyle = '#555';
    canvas.font = '10px sans-serif';
    canvas.textAlign = 'center';
    canvas.fillText(c.label, c.xc, c.yc + c.ry + 14);
    canvas.restore();
  }
}

// ─── Full diagram demo ─────────────────────────────────────────────────────────

const DIAGRAM_BOUNDS: Bounds = { xmin: 0, xmax: 2000, ymin: 0, ymax: 3000 };
const SCALE = 0.13;

function drawDiagramDemo(canvas: CanvasRenderingContext2D) {
  const w = Math.ceil(DIAGRAM_BOUNDS.xmax * SCALE) + 20;
  const h = Math.ceil(DIAGRAM_BOUNDS.ymax * SCALE) + 40;
  canvas.canvas.width = w;
  canvas.canvas.height = h;
  canvas.clearRect(0, 0, w, h);
  canvas.fillStyle = '#fafafa';
  canvas.fillRect(0, 0, w, h);

  const { cable, empalme } = buildMocks(DIAGRAM_BOUNDS);
  const conn = new CConexionEmpalme(cable, empalme, DIAGRAM_BOUNDS, 40);
  const ctx = makeCtx(canvas, SCALE);
  conn.drawContentOn(ctx);
}

// ─── Showcase component ──────────────────────────────────────────────────────

export function CConexionEmpalmeShowcase() {
  const ellipseRef = useRef<HTMLCanvasElement>(null)
  const diagramRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ec = ellipseRef.current
    if (ec) {
      const ctx = ec.getContext('2d')
      if (ctx) drawEllipseDemo(ctx, ec.width, ec.height)
    }
    const dc = diagramRef.current
    if (dc) {
      const ctx = dc.getContext('2d')
      if (ctx) drawDiagramDemo(ctx)
    }
  }, [])

  // anotacion_linea demo
  const demoConn = new CConexionEmpalme(
    { construction_status: 'INSTALADO', spec_id: 'X', obtener_pines: () => [], mit_sheath_pins: { size: 0 } },
    { construction_status: 'INSTALADO', 'user!_tipo_emp': 'Y' },
    { xmin: 0, xmax: 100, ymin: 0, ymax: 100 },
  );
  const mockPins: AnyPin[] = [
    { kind: 'fiber', fiber_number: 3, fiber_owner_record: { 'user!_cuenta': 'CTA-003', 'user!_estado': 'A' }, connected_object: () => undefined },
    { kind: 'fiber', fiber_number: 1, fiber_owner_record: { 'user!_cuenta': 'CTA-001', 'user!_estado': 'A' }, connected_object: () => undefined },
    { kind: 'fiber', fiber_number: 2, fiber_owner_record: undefined, connected_object: () => undefined },
  ];

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h3>CConexionEmpalme — Diagrama Unifilar F.O. TBA</h3>
      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Fase 6 · CRÍTICO · Extends layout_element · Bresenham ellipse + GIS connectivity traversal
      </p>

      <h4>1. genera_forma_cables — Bresenham midpoint ellipse</h4>
      <canvas ref={ellipseRef} width={440} height={260}
        style={{ border: '1px solid #ddd', background: '#fafafa', display: 'block' }} />

      <h4 style={{ marginTop: 20 }}>2. anotacion_linea — fiber annotation string</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {`pins: fiber#1 (CTA-001 A), fiber#2 (sin owner), fiber#3 (CTA-003 A)\n→ "${demoConn.anotacionLinea(mockPins)}"`}
      </pre>

      <h4 style={{ marginTop: 20 }}>3. Diagrama completo (5 fibras mock: 2→TBA, 2→salida, 1 libre)</h4>
      <canvas ref={diagramRef} width={280} height={420}
        style={{ border: '1px solid #ddd', background: '#fafafa', display: 'block' }} />

      <h4 style={{ marginTop: 20 }}>Constantes de clase</h4>
      <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
        {`LoTitulo:    "${CConexionEmpalme.LoTitulo}"\nLoTipoLetra: "${CConexionEmpalme.LoTipoLetra}"\nLoGrados:    ${CConexionEmpalme.LoGrados}`}
      </pre>
    </div>
  )
}
