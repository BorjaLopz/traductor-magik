/**
 * Migracion de: symbol_layout_mod.magik
 * Clase Magik:  symbol_layout
 * Metodos:      symbol_names, draw_content_on
 *
 * Intencion:
 *   Listar los nombres de simbolos disponibles y dibujar una
 *   muestra del simbolo seleccionado con color y transformaciones.
 */

import React, { useEffect, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface SymbolRender {
  viewBox: string;
  elements: Array<
    | { type: 'circle'; cx: number; cy: number; r: number; fill: string }
    | { type: 'rect'; x: number; y: number; w: number; h: number; fill: string }
    | { type: 'polygon'; points: string; fill: string }
  >;
}

export interface DrawResult {
  status: 'ok' | 'incomplete' | 'unknown';
  message?: string;
  render?: SymbolRender;
}

export interface SymbolDataSource {
  listSymbolNames(): Promise<string[]>;
  renderSymbol(
    name: string,
    options: { color: string; angleRad: number; flip: boolean; mirror: boolean },
  ): Promise<SymbolRender | null>;
}

// =============================================================================
// MOCK DATA SOURCE (equivalente a symbol_bundle_table.open(...).symbol_names)
// =============================================================================

class MockSymbolDataSource implements SymbolDataSource {
  private names = ['SYM_CIRCLE', 'SYM_SQUARE', 'SYM_TRIANGLE'];

  async listSymbolNames(): Promise<string[]> {
    return [...this.names].sort();
  }

  async renderSymbol(
    name: string,
    options: { color: string; angleRad: number; flip: boolean; mirror: boolean },
  ): Promise<SymbolRender | null> {
    const fill = options.color;
    const base: SymbolRender = {
      viewBox: '0 0 100 100',
      elements: [],
    };

    if (name === 'SYM_CIRCLE') {
      base.elements.push({ type: 'circle', cx: 50, cy: 50, r: 24, fill });
      return base;
    }
    if (name === 'SYM_SQUARE') {
      base.elements.push({ type: 'rect', x: 28, y: 28, w: 44, h: 44, fill });
      return base;
    }
    if (name === 'SYM_TRIANGLE') {
      base.elements.push({ type: 'polygon', points: '50,22 78,78 22,78', fill });
      return base;
    }

    return null;
  }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class SymbolLayout {
  name: string | null = null;
  colour: string | null = '#2E4057';
  angleDeg: number = 0;
  flip: boolean = false;
  mirror: boolean = false;

  private dataSource: SymbolDataSource;

  constructor(dataSource: SymbolDataSource) {
    this.dataSource = dataSource;
  }

  // Magik: symbol_names
  async symbolNames(): Promise<string[]> {
    const names = await this.dataSource.listSymbolNames();
    return names;
  }

  // Magik: draw_content_on(window)
  async drawContentOn(): Promise<DrawResult> {
    if (!this.name || this.name.length === 0) {
      return { status: 'incomplete', message: 'select a symbol' };
    }

    const angleRad = -(this.angleDeg || 0) * (Math.PI / 180);
    const render = await this.dataSource.renderSymbol(this.name, {
      color: this.colour ?? '#000000',
      angleRad,
      flip: this.flip,
      mirror: this.mirror,
    });

    if (!render) {
      return { status: 'unknown', message: `unknown symbol: ${this.name}` };
    }

    return { status: 'ok', render };
  }
}

// =============================================================================
// COMPONENTE REACT — demo de listado y muestra del simbolo
// =============================================================================

export function SymbolLayoutUI() {
  const dataSource = useMemo(() => new MockSymbolDataSource(), []);
  const layout = useMemo(() => new SymbolLayout(dataSource), [dataSource]);

  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [color, setColor] = useState('#2E4057');
  const [angle, setAngle] = useState(0);
  const [flip, setFlip] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [result, setResult] = useState<DrawResult>({ status: 'incomplete' });

  useEffect(() => {
    let mounted = true;
    layout.symbolNames().then(list => {
      if (!mounted) return;
      setNames(list);
      if (list.length > 0) setSelected(list[0]);
    });
    return () => {
      mounted = false;
    };
  }, [layout]);

  useEffect(() => {
    let mounted = true;
    layout.name = selected || null;
    layout.colour = color;
    layout.angleDeg = angle;
    layout.flip = flip;
    layout.mirror = mirror;

    layout.drawContentOn().then(draw => {
      if (mounted) setResult(draw);
    });

    return () => {
      mounted = false;
    };
  }, [layout, selected, color, angle, flip, mirror]);

  const render = result.render;
  const transform = buildTransform(angle, flip, mirror);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>symbol_layout</div>
      <div style={s.controls}>
        <label style={s.label}>
          Symbol
          <select value={selected} onChange={e => setSelected(e.target.value)} style={s.select}>
            {names.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label style={s.label}>
          Color
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        </label>
        <label style={s.label}>
          Angle
          <input
            type="number"
            value={angle}
            onChange={e => setAngle(Number(e.target.value))}
            style={s.angle}
          />
        </label>
        <label style={s.label}>
          <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} /> Flip
        </label>
        <label style={s.label}>
          <input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} /> Mirror
        </label>
      </div>

      {result.status !== 'ok' ? (
        <div style={s.meta}>{result.message}</div>
      ) : (
        <svg viewBox={render?.viewBox ?? '0 0 100 100'} width={140} height={140} style={s.preview}>
          <g transform={transform}>
            {render?.elements.map((el, idx) => {
              if (el.type === 'circle') {
                return <circle key={idx} cx={el.cx} cy={el.cy} r={el.r} fill={el.fill} />;
              }
              if (el.type === 'rect') {
                return <rect key={idx} x={el.x} y={el.y} width={el.w} height={el.h} fill={el.fill} />;
              }
              return <polygon key={idx} points={el.points} fill={el.fill} />;
            })}
          </g>
        </svg>
      )}
    </div>
  );
}

function buildTransform(angle: number, flip: boolean, mirror: boolean): string {
  const translate = 'translate(50 50)';
  const rotate = `rotate(${angle})`;
  const scaleX = mirror ? -1 : 1;
  const scaleY = flip ? -1 : 1;
  const scale = `scale(${scaleX} ${scaleY})`;
  const back = 'translate(-50 -50)';
  return [translate, rotate, scale, back].join(' ');
}

const s: Record<string, React.CSSProperties> = {
  wrapper : { display: 'flex', flexDirection: 'column', gap: 10 },
  title   : { fontSize: 13, fontWeight: 'bold' },
  meta    : { fontSize: 12, color: '#666' },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  label   : { fontSize: 12, color: '#333', display: 'flex', gap: 6, alignItems: 'center' },
  select  : { padding: '4px 6px', fontSize: 12 },
  angle   : { width: 70 },
  preview : { background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
};

export default SymbolLayoutUI;
