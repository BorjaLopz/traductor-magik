/**
 * CLeyendaAshurado.tsx
 * Migration: c_leyenda_ashurado.magik → TypeScript/React
 * Autor original: jtlelo — GE Network Solutions — 05/12/2023
 * Hereda de: layout_element, viewport_layout_mixin
 *
 * Leyenda de ashurado (hatching): dibuja 3 cuadros con distintos
 * patrones de relleno diagonal según el valor de `cont`:
 *   cont=1 → reticulado (/ rojo + \ verde)
 *   cont=2 → diagonal derecha / (rojo solo)
 *   cont=3 → diagonal izquierda \ (verde solo)
 */

import React, { useRef, useEffect, useState } from 'react';

// ── defined_attributes ────────────────────────────────────────────────────────
// :Tamano, :string, default "A", enum_method: :tamano_norte → rope ["A","B","C"]

export type TamanoNorte = 'A' | 'B' | 'C';

const TAMANO_PX: Record<TamanoNorte, number> = {
  A: 60,   // tamaño pequeño
  B: 90,   // tamaño mediano
  C: 120,  // tamaño grande (más cercano al original de 150 unidades)
};

// ── construir_arco() ──────────────────────────────────────────────────────────
// sector.new() + coordinate(cx+R*cos(ang), cy+R*sin(ang)) para ang in angIni..angFin
// (Definido en la clase Magik; no se usa en construir_leyenda pero se exporta)

export function construirArco(
  radio : number,
  centro: { x: number; y: number },
  angIni: number,   // grados
  angFin: number,   // grados
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let ang = angIni; ang <= angFin; ang++) {
    const r = (ang * Math.PI) / 180;   // degrees_to_radians
    pts.push({ x: centro.x + radio * Math.cos(r),
               y: centro.y + radio * Math.sin(r) });
  }
  return pts;
}

// ── Funciones de trazado ──────────────────────────────────────────────────────
//
// Mapeo de coordenadas: Magik usa y↑ (geográfico); Canvas usa y↓.
//
// Magik, box = (cx, cy) → (cx+s, cy+s), cx/cy = esquina inferior-izquierda:
//   Diagonal derecha Magik:  (cx,cy)    → (cx+s,cy+s)  → en papel = /
//   Diagonal izquierda Magik:(cx,cy+s)  → (cx+s,cy)    → en papel = \
//
// Canvas, box = (sx, sy) → (sx+s, sy+s), sx/sy = esquina superior-izquierda:
//   Para / visual:  (sx,   sy+s) → (sx+s, sy)
//   Para \ visual:  (sx,   sy)   → (sx+s, sy+s)
//
// Las líneas paralelas se obtienen desplazando el punto de inicio en
// pasos de step = size/6 (≡ 25 cuando size=150 como en el original Magik).

// Diagonal derecha (/) — cont=1 o cont=2 — rojo
// Magik: sector_rope de (cx,cy)→(cx+s,cy+s) + 10 paralelas
function drawSlashLines(
  ctx : CanvasRenderingContext2D,
  sx  : number,
  sy  : number,
  size: number,
) {
  const step = size / 6;
  ctx.beginPath();

  // Desde borde inferior: (sx+n, sy+size) → (sx+size, sy+n)
  for (let n = 0; n < size; n += step) {
    ctx.moveTo(sx + n,    sy + size);
    ctx.lineTo(sx + size, sy + n);
  }
  // Desde borde izquierdo: (sx, sy+size-n) → (sx+size-n, sy)
  for (let n = step; n < size; n += step) {
    ctx.moveTo(sx,          sy + size - n);
    ctx.lineTo(sx + size - n, sy);
  }

  ctx.strokeStyle = 'red';
  ctx.lineWidth   = Math.max(0.7, size / 180);
  ctx.stroke();
}

// Diagonal izquierda (\) — cont=1 o cont=3 — verde
// Magik: sector_rope de (cx,cy+s)→(cx+s,cy) + 10 paralelas
function drawBackslashLines(
  ctx : CanvasRenderingContext2D,
  sx  : number,
  sy  : number,
  size: number,
) {
  const step = size / 6;
  ctx.beginPath();

  // Desde borde izquierdo: (sx, sy+n) → (sx+size-n, sy+size)
  for (let n = 0; n < size; n += step) {
    ctx.moveTo(sx,              sy + n);
    ctx.lineTo(sx + size - n,   sy + size);
  }
  // Desde borde superior: (sx+n, sy) → (sx+size, sy+size-n)
  for (let n = step; n < size; n += step) {
    ctx.moveTo(sx + n,    sy);
    ctx.lineTo(sx + size, sy + size - n);
  }

  ctx.strokeStyle = 'green';
  ctx.lineWidth   = Math.max(0.7, size / 180);
  ctx.stroke();
}

// Marco negro — line_style.new(colour.called(:black), 3)
function drawFrame(
  ctx : CanvasRenderingContext2D,
  sx  : number,
  sy  : number,
  size: number,
) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth   = Math.max(1, size / 60);
  ctx.strokeRect(sx + 0.5, sy + 0.5, size, size);
}

// ── construir_leyenda() ───────────────────────────────────────────────────────
// Equivale a c_leyenda_ashurado.construir_leyenda(window)
// Itera cont 1..3, aplica las diagonales según la condición _if cont=1/_or/2/3

const PAD = 12;
const GAP = 20;

export function construirLeyenda(
  ctx : CanvasRenderingContext2D,
  size: number,
  cw  : number,
  ch  : number,
) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cw, ch);

  for (let cont = 1; cont <= 3; cont++) {
    const sx = PAD + (cont - 1) * (size + GAP);
    const sy = PAD;

    // Fondo blanco de cada caja
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx, sy, size, size);

    // diagonal derecha (/) — _if cont = 1 _or cont = 2
    if (cont === 1 || cont === 2) drawSlashLines(ctx, sx, sy, size);

    // diagonal izquierda (\) — _if cont = 1 _or cont = 3
    if (cont === 1 || cont === 3) drawBackslashLines(ctx, sx, sy, size);

    // marco negro (siempre, dibujado encima para no tapar las líneas)
    drawFrame(ctx, sx, sy, size);

    // etiqueta debajo — no existe en Magik, añadida para claridad
    ctx.fillStyle = '#333';
    ctx.font      = `${Math.max(9, Math.round(size / 8))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`cont = ${cont}`, sx + size / 2, sy + size + 15);
  }
}

// ── Componente React ──────────────────────────────────────────────────────────

export function CLeyendaAshuradoUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tamano, setTamano] = useState<TamanoNorte>('B');

  const size = TAMANO_PX[tamano];
  const cw   = PAD * 2 + 3 * size + 2 * GAP;
  const ch   = PAD * 2 + size + 22;

  // draw_content_on(window) → construir_leyenda(window)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    construirLeyenda(ctx, size, cw, ch);
  }, [size, cw, ch]);

  const colorLegend = [
    { color:'red',   symbol:'/',  label:'diagonal derecha — cont 1, 2' },
    { color:'green', symbol:'\\', label:'diagonal izquierda — cont 1, 3' },
    { color:'black', symbol:'■',  label:'marco — todos' },
  ];

  return (
    <div style={st.root}>

      {/* defined_attributes: :Tamano, enum_method: :tamano_norte */}
      <div style={st.controls}>
        <span style={st.fieldLabel}>Tamaño (tamano_norte)</span>
        <div style={st.radioGroup}>
          {(['A','B','C'] as TamanoNorte[]).map(t => (
            <label key={t} style={st.radio}>
              <input
                type="radio"
                name="tamano"
                value={t}
                checked={tamano === t}
                onChange={() => setTamano(t)}
              />
              {' '}{t} — {TAMANO_PX[t]}px · step={TAMANO_PX[t] / 6}
            </label>
          ))}
        </div>
      </div>

      {/* draw_content_on(window) → construir_leyenda(window) */}
      <div style={st.canvasWrap}>
        <div style={st.canvasLabel}>
          construir_leyenda() — 3 variantes de ashurado · step = size/6
        </div>
        <canvas
          ref={canvasRef}
          width={cw}
          height={ch}
          style={st.canvas}
        />
      </div>

      {/* Leyenda de colores */}
      <div style={st.legend}>
        {colorLegend.map(({ color, symbol, label }) => (
          <span key={label} style={st.legendItem}>
            <span style={{ color, fontWeight:'bold', fontFamily:'monospace', fontSize:14 }}>
              {symbol}
            </span>
            {' '}{label}
          </span>
        ))}
      </div>

      {/* Tabla de patrones por cont */}
      <details style={st.details}>
        <summary style={st.summary}>Patrones por cont (lógica construir_leyenda)</summary>
        <table style={st.tbl}>
          <thead>
            <tr>
              {['cont', '/ diagonal (rojo)', '\\ diagonal (verde)', 'Descripción'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { cont:1, slash:true,  back:true,  desc:'Reticulado — ambas diagonales' },
              { cont:2, slash:true,  back:false, desc:'Solo diagonal derecha (/)' },
              { cont:3, slash:false, back:true,  desc:'Solo diagonal izquierda (\\)' },
            ].map(r => (
              <tr key={r.cont}>
                <td style={st.td}><strong>cont = {r.cont}</strong></td>
                <td style={{ ...st.td, color: r.slash ? 'red'   : '#bbb' }}>{r.slash ? '✓' : '–'}</td>
                <td style={{ ...st.td, color: r.back  ? 'green' : '#bbb' }}>{r.back  ? '✓' : '–'}</td>
                <td style={st.td}>{r.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root       : { fontFamily:'sans-serif', fontSize:12 },
  controls   : { display:'flex', alignItems:'center', flexWrap:'wrap', gap:14,
                 marginBottom:12, padding:'8px 12px',
                 background:'#f8f9fb', border:'1px solid #dde', borderRadius:6 },
  fieldLabel : { fontSize:10, fontWeight:'bold', color:'#555',
                 textTransform:'uppercase', whiteSpace:'nowrap' },
  radioGroup : { display:'flex', gap:16 },
  radio      : { display:'flex', alignItems:'center', gap:4,
                 fontSize:12, cursor:'pointer' },
  canvasWrap : { marginBottom:12 },
  canvasLabel: { fontSize:10, color:'#888', marginBottom:4, fontStyle:'italic' },
  canvas     : { border:'1px solid #ddd', borderRadius:4, display:'block',
                 background:'#fff' },
  legend     : { display:'flex', flexWrap:'wrap', gap:16, marginBottom:12,
                 padding:'6px 12px', background:'#f8f9fb',
                 border:'1px solid #dde', borderRadius:6 },
  legendItem : { fontSize:11, display:'flex', alignItems:'center', gap:5 },
  details    : { marginTop:10 },
  summary    : { cursor:'pointer', fontSize:11, fontWeight:'bold', color:'#2E4057' },
  tbl        : { width:'100%', borderCollapse:'collapse', marginTop:6 },
  th         : { background:'#2E4057', color:'#fff', padding:'4px 10px',
                 fontSize:11, textAlign:'left' },
  td         : { padding:'4px 10px', borderBottom:'1px solid #eee',
                 fontSize:11, textAlign:'center' },
};
