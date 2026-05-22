/**
 * Migration: textbox_layout.magik → TextboxLayout.tsx
 *
 * Layout element for rendering text inside a bounded box with:
 *   - Word-wrap (horizontal or vertical orientation)
 *   - Configurable font, size, colour, alignment, angle, clipping
 *
 * Magik → TypeScript:
 *   defined_attributes (11 attrs)  → interface TextboxAtribs + DEFAULT_ATRIBS
 *   wrap_lines(window,str,…)       → wrapLines(ctx, atribs, bounds) : WrapResult
 *   rope.new()                     → string[]
 *   a_style.cell_size              → canvas measureText approximation
 *   text_bounds(window,…,i,j)      → ctx.measureText(slice)
 *   _self.bounds                   → BoundsRect parameter
 *   newline_char                   → '\n'
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface BoundsRect {
  width : number;
  height: number;
}

export interface BorderChars {
  x: number;  // margin fraction in X (× charHeight)
  y: number;  // margin fraction in Y (× charHeight)
}

/** defined_attributes — los 11 atributos configurables del textbox_layout */
export interface TextboxAtribs {
  text            : string;   // :text — contenido
  fontName        : string;   // :font_name — "plain" | "bold" | "italic" | "bold-italic"
  fontSize        : number;   // :font_size — 1..72 pt
  colour          : string;   // :colour — CSS color
  wrap            : boolean;  // :wrap — activar word-wrap
  clip            : boolean;  // :clip — recortar al bbox
  alignHorizontal : 'left' | 'center' | 'right'; // :align_horizontal
  alignVertical   : 'top'  | 'middle' | 'bottom'; // :align_vertical
  orientation     : 'left_right' | 'top_bottom';  // :orientation
  angle           : number;   // :angle — grados de rotación
  textWidth       : number;   // :text_width — grosor trazo (vector fonts), 1..72
  textAspect      : number;   // :text_aspect — ratio XY, 0.1..1.0
}

/** Resultado de wrapLines */
export interface WrapResult {
  lines      : string[];
  borderSpace: { x: number; y: number };
}

// ── Valores por defecto (= default_value de cada atributo Magik) ──────────────

export const DEFAULT_ATRIBS: TextboxAtribs = {
  text           : 'Introduce tu texto aquí',
  fontName       : 'plain',
  fontSize       : 6.0,
  colour         : '#000000',
  wrap           : true,
  clip           : true,
  alignHorizontal: 'left',
  alignVertical  : 'top',
  orientation    : 'left_right',
  angle          : 0.0,
  textWidth      : 1.0,
  textAspect     : 1.0,
};

// ── Constantes de delimitadores (Magik: delims parámetro) ─────────────────────

const WORD_DELIMS = ' \t\n,;:.!?()[]{}';

// ── Algoritmo principal: wrapLines ────────────────────────────────────────────

/**
 * Traducción de textbox_layout.wrap_lines(window, string, a_style, delims, border_chars)
 *
 * Divide el texto en líneas respetando el bbox.
 * Orientación left_right: ajusta por anchura máxima.
 * Orientación top_bottom: ajusta por altura máxima (texto vertical).
 *
 * @param ctx       CanvasRenderingContext2D — usado para medir texto
 * @param atribs    Atributos del textbox (incluye fontSize, orientation, etc.)
 * @param bounds    Dimensiones del bbox en píxeles
 * @param border    Fracción de charHeight para margen (Magik: border_chars)
 */
export function wrapLines(
  ctx     : CanvasRenderingContext2D,
  atribs  : TextboxAtribs,
  bounds  : BoundsRect,
  border  : BorderChars = { x: 0.15, y: 0.15 },
): WrapResult {

  // Configurar fuente en el canvas — equivale a a_style en Magik
  const cssFontName = atribs.fontName === 'bold'        ? 'bold'
                    : atribs.fontName === 'italic'       ? 'italic'
                    : atribs.fontName === 'bold-italic'  ? 'bold italic'
                    : 'normal';
  ctx.font = `${cssFontName} ${atribs.fontSize}px sans-serif`;

  // charHeight — Magik: a_style.cell_size → dev_char_height / nominal_scale
  const charHeight = atribs.fontSize;

  // borderSpace — Magik: border_chars * char_height
  const borderSpace = {
    x: border.x * charHeight,
    y: border.y * charHeight,
  };

  // Límites máximos del área de texto
  // Magik: max_line_width  = bounds.width  - 2*border_space.x
  //        max_line_height = bounds.height - 2*border_space.y
  const maxLineWidth  = bounds.width  - 2 * borderSpace.x;
  const maxLineHeight = bounds.height - 2 * borderSpace.y;

  if (!atribs.wrap || maxLineWidth <= 0 || maxLineHeight <= 0) {
    return { lines: [atribs.text], borderSpace };
  }

  // Añadir terminador para forzar el flush de la última línea
  // Magik: term_str << string + newline_char
  const termStr = atribs.text + '\n';

  const lines : string[] = [];
  let iFst  = 0;  // inicio de la línea actual
  let iLst  = -1; // fin de la última palabra completa
  let iFill = 0;  // altura/anchura acumulada para clipping

  const orientation = atribs.orientation;

  for (let i = 0; i < termStr.length; i++) {
    const ch = termStr[i];

    if (!WORD_DELIMS.includes(ch)) continue;

    // Mide el texto desde iFst hasta i-1
    // Magik: term_str_bounds << _self.text_bounds(window, a_style, term_str, i_fst, i-1)
    const proposedSlice = termStr.slice(iFst, i);
    const metrics       = ctx.measureText(proposedSlice);
    const propWidth     = metrics.width;
    // Altura aproximada = fontSize (canvas no expone height fiablemente en todos los navegadores)
    const propHeight    = charHeight * 1.2;

    if (orientation === 'top_bottom') {
      // Magik: _if prop_line_height > max_line_height _andif i_lst >= i_fst
      if (propHeight > maxLineHeight && iLst >= iFst) {
        iFill += propWidth;
        if (iFill > maxLineWidth) break;  // Magik: _leave
        lines.push(termStr.slice(iFst, iLst + 1));
        iFst = iLst + 2; // saltar el delimitador
      }
    } else {
      // left_right (default) — Magik: _if prop_line_width > max_line_width _andif i_lst >= i_fst
      if (propWidth > maxLineWidth && iLst >= iFst) {
        iFill += propHeight;
        if (iFill > maxLineHeight) break;  // Magik: _leave (clipping)
        lines.push(termStr.slice(iFst, iLst + 1));
        iFst = iLst + 2; // saltar el delimitador
      }
    }

    // Avanzar el fin de la última palabra completa
    // Magik: i_lst << i - 1
    iLst = i - 1;

    // Salto de línea explícito
    // Magik: _if ch = newline_char _andif line_n_chars >= 0
    if (ch === '\n' && iLst - iFst + 1 >= 0) {
      lines.push(termStr.slice(iFst, iLst + 1));
      iFst = i + 1;
    }
  }

  // Guardar cadena vacía si no hay líneas
  // Magik: _if lines.size = 0 _then lines.add_last("") _endif
  if (lines.length === 0) lines.push('');

  return { lines, borderSpace };
}

// ── Render en canvas ──────────────────────────────────────────────────────────

function renderTextbox(
  ctx    : CanvasRenderingContext2D,
  atribs : TextboxAtribs,
  bounds : BoundsRect,
): void {
  ctx.clearRect(0, 0, bounds.width, bounds.height);

  // Fondo del área
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  // Borde del bbox
  ctx.strokeStyle = '#2E4057';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(0.75, 0.75, bounds.width - 1.5, bounds.height - 1.5);

  // Obtener líneas ajustadas
  const { lines, borderSpace } = wrapLines(ctx, atribs, bounds);

  if (lines.length === 0) return;

  const cssFont = atribs.fontName === 'bold'       ? 'bold'
                : atribs.fontName === 'italic'      ? 'italic'
                : atribs.fontName === 'bold-italic' ? 'bold italic'
                : 'normal';
  ctx.font      = `${cssFont} ${atribs.fontSize}px sans-serif`;
  ctx.fillStyle = atribs.colour;

  const lineH    = atribs.fontSize * 1.3;
  const totalH   = lines.length * lineH;

  // Posición Y inicial según align_vertical
  // Magik: :align_vertical default "top"
  let baseY: number;
  if (atribs.alignVertical === 'bottom') {
    baseY = bounds.height - borderSpace.y - totalH + lineH;
  } else if (atribs.alignVertical === 'middle') {
    baseY = (bounds.height - totalH) / 2 + lineH;
  } else {
    baseY = borderSpace.y + lineH;
  }

  // Clipping
  if (atribs.clip) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(borderSpace.x, borderSpace.y,
             bounds.width  - 2 * borderSpace.x,
             bounds.height - 2 * borderSpace.y);
    ctx.clip();
  }

  // Rotación centrada
  if (atribs.angle !== 0) {
    ctx.save();
    ctx.translate(bounds.width / 2, bounds.height / 2);
    ctx.rotate((atribs.angle * Math.PI) / 180);
    ctx.translate(-bounds.width / 2, -bounds.height / 2);
  }

  // Dibujar líneas — Magik: align_horizontal "left"/"center"/"right"
  for (let i = 0; i < lines.length; i++) {
    const line  = lines[i];
    const lineY = baseY + i * lineH;

    if (atribs.orientation === 'top_bottom') {
      // Texto vertical: cada línea es una columna de caracteres
      ctx.save();
      ctx.translate(borderSpace.x + i * lineH, borderSpace.y);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign  = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(line, 0, 0);
      ctx.restore();
    } else {
      // left_right — horizontal estándar
      let lineX: number;
      if (atribs.alignHorizontal === 'right') {
        ctx.textAlign = 'right';
        lineX = bounds.width - borderSpace.x;
      } else if (atribs.alignHorizontal === 'center') {
        ctx.textAlign = 'center';
        lineX = bounds.width / 2;
      } else {
        ctx.textAlign = 'left';
        lineX = borderSpace.x;
      }
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(line, lineX, lineY);
    }
  }

  if (atribs.angle !== 0)  ctx.restore();
  if (atribs.clip)         ctx.restore();
}

// ── Componente React ──────────────────────────────────────────────────────────

const CANVAS_W = 400;
const CANVAS_H = 220;

export function TextboxLayoutUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [atribs,  setAtribs]  = useState<TextboxAtribs>(DEFAULT_ATRIBS);
  const [lines,   setLines]   = useState<string[]>([]);
  const [border,  setBorder]  = useState<BorderChars>({ x: 0.15, y: 0.15 });

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderTextbox(ctx, atribs, { width: CANVAS_W, height: CANVAS_H });

    // Actualizar lista de líneas para la tabla de debug
    const { lines: ls } = wrapLines(ctx, atribs, { width: CANVAS_W, height: CANVAS_H }, border);
    setLines(ls);
  }, [atribs, border]);

  useEffect(() => { redraw(); }, [redraw]);

  function set<K extends keyof TextboxAtribs>(key: K, val: TextboxAtribs[K]) {
    setAtribs(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div style={st.root}>

      {/* Controles — equivalen a los defined_attributes del Layout Designer */}
      <div style={st.controls}>

        <div style={st.group}>
          <GroupTitle>Contenido</GroupTitle>
          <label style={st.lbl}>
            Texto
            <textarea
              rows={3}
              value={atribs.text}
              onChange={e => set('text', e.target.value)}
              style={{ ...st.inp, width: 200, resize: 'vertical' }}
            />
          </label>
        </div>

        <div style={st.group}>
          <GroupTitle>Fuente</GroupTitle>
          <label style={st.lbl}>
            Font Name
            <select value={atribs.fontName} onChange={e => set('fontName', e.target.value)}
              style={st.sel}>
              {['plain','bold','italic','bold-italic'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label style={st.lbl}>
            Font Size (1–72)
            <input type="number" min={1} max={72} step={0.5}
              value={atribs.fontSize}
              onChange={e => set('fontSize', Number(e.target.value))}
              style={st.inp} />
          </label>
          <label style={st.lbl}>
            Colour
            <input type="color" value={atribs.colour}
              onChange={e => set('colour', e.target.value)}
              style={{ ...st.inp, width: 50, padding: 2 }} />
          </label>
          <label style={st.lbl}>
            Text Width (1–72)
            <input type="number" min={1} max={72} step={0.5}
              value={atribs.textWidth}
              onChange={e => set('textWidth', Number(e.target.value))}
              style={st.inp} />
          </label>
          <label style={st.lbl}>
            Text Aspect (0.1–1)
            <input type="number" min={0.1} max={1} step={0.05}
              value={atribs.textAspect}
              onChange={e => set('textAspect', Number(e.target.value))}
              style={st.inp} />
          </label>
        </div>

        <div style={st.group}>
          <GroupTitle>Layout</GroupTitle>
          <label style={st.lbl}>
            Align H.
            <select value={atribs.alignHorizontal}
              onChange={e => set('alignHorizontal', e.target.value as TextboxAtribs['alignHorizontal'])}
              style={st.sel}>
              {['left','center','right'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label style={st.lbl}>
            Align V.
            <select value={atribs.alignVertical}
              onChange={e => set('alignVertical', e.target.value as TextboxAtribs['alignVertical'])}
              style={st.sel}>
              {['top','middle','bottom'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label style={st.lbl}>
            Orientation
            <select value={atribs.orientation}
              onChange={e => set('orientation', e.target.value as TextboxAtribs['orientation'])}
              style={st.sel}>
              <option value="left_right">left_right (H)</option>
              <option value="top_bottom">top_bottom (V)</option>
            </select>
          </label>
          <label style={st.lbl}>
            Angle (°)
            <input type="number" min={-360} max={360} step={5}
              value={atribs.angle}
              onChange={e => set('angle', Number(e.target.value))}
              style={st.inp} />
          </label>
          <label style={st.chk}>
            <input type="checkbox" checked={atribs.wrap}
              onChange={e => set('wrap', e.target.checked)} />
            Wrap
          </label>
          <label style={st.chk}>
            <input type="checkbox" checked={atribs.clip}
              onChange={e => set('clip', e.target.checked)} />
            Clip
          </label>
        </div>

        <div style={st.group}>
          <GroupTitle>Márgenes (border_chars)</GroupTitle>
          <label style={st.lbl}>
            Border X
            <input type="number" min={0} max={1} step={0.05}
              value={border.x}
              onChange={e => setBorder(b => ({ ...b, x: Number(e.target.value) }))}
              style={st.inp} />
          </label>
          <label style={st.lbl}>
            Border Y
            <input type="number" min={0} max={1} step={0.05}
              value={border.y}
              onChange={e => setBorder(b => ({ ...b, y: Number(e.target.value) }))}
              style={st.inp} />
          </label>
        </div>
      </div>

      {/* Canvas — renderizado del textbox */}
      <div style={st.canvasWrap}>
        <div style={st.canvasLabel}>
          draw_content_on — {CANVAS_W}×{CANVAS_H}px
        </div>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={st.canvas} />
      </div>

      {/* Resultado de wrapLines */}
      <div style={st.linesBox}>
        <strong style={{ fontSize: 11 }}>
          wrap_lines() → {lines.length} línea{lines.length !== 1 ? 's' : ''}
        </strong>
        <table style={st.tbl}>
          <thead>
            <tr>
              {['#', 'Línea', 'Longitud (chars)'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((ln, i) => (
              <tr key={i}>
                <td style={st.td}>{i + 1}</td>
                <td style={st.td}>
                  <code style={{ fontSize: 11 }}>
                    {ln === '' ? <em style={{ color: '#aaa' }}>(vacía)</em> : ln}
                  </code>
                </td>
                <td style={{ ...st.td, textAlign: 'center' }}>{ln.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sub-componente ────────────────────────────────────────────────────────────

function GroupTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 'bold', color: '#2E4057',
                       textTransform: 'uppercase', letterSpacing: 0.5,
                       marginBottom: 4 }}>{children}</div>;
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root      : { fontFamily: 'sans-serif', fontSize: 12 },
  controls  : { display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  group     : { display: 'flex', flexDirection: 'column', gap: 6,
                padding: '8px 12px', background: '#f7f9fb',
                border: '1px solid #dde', borderRadius: 6, minWidth: 160 },
  lbl       : { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 },
  chk       : { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 },
  inp       : { padding: '3px 6px', border: '1px solid #bbb', borderRadius: 4,
                fontSize: 11, width: 90 },
  sel       : { padding: '3px 6px', border: '1px solid #bbb', borderRadius: 4, fontSize: 11 },
  canvasWrap: { marginBottom: 14 },
  canvasLabel:{ fontSize: 10, color: '#888', marginBottom: 3, fontStyle: 'italic' },
  canvas    : { border: '1px solid #ddd', borderRadius: 4, display: 'block' },
  linesBox  : { marginTop: 4 },
  tbl       : { width: '100%', borderCollapse: 'collapse', marginTop: 6 },
  th        : { background: '#2E4057', color: '#fff', padding: '4px 10px',
                fontSize: 11, textAlign: 'left' as const },
  td        : { padding: '4px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};
