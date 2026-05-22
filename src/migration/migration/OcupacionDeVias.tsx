/**
 * Migracion de: c_ocupacion_de_vias.magik
 * Clase Magik:  c_ocupacion_de_vias
 * Metodos:      defined_attributes, draw_content_on, symbol_names
 *
 * Intencion:
 *   Exponer atributos del simbolo y dibujar una muestra con color
 *   y transformaciones (rotacion, flip, mirror).
 */

import React, { useEffect, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface LayoutAttributeDefinition<T = unknown> {
  name: string;
  type: string;
  description: string;
  defaultValue: T;
  enumMethod?: 'symbolNames';
}

export interface SymbolRender {
  viewBox: string;
  elements: Array<
    | { type: 'circle'; cx: number; cy: number; r: number; fill: string }
    | { type: 'rect'; x: number; y: number; w: number; h: number; fill: string }
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
  private names = ['ocupacion', 'SYM_CIRCLE', 'SYM_SQUARE'];

  async listSymbolNames(): Promise<string[]> {
    return [...this.names].sort();
  }

  async renderSymbol(
    name: string,
    options: { color: string; angleRad: number; flip: boolean; mirror: boolean },
  ): Promise<SymbolRender | null> {
    const fill = options.color;
    const base: SymbolRender = { viewBox: '0 0 100 100', elements: [] };

    if (name === 'ocupacion') {
      base.elements.push({ type: 'rect', x: 18, y: 35, w: 64, h: 30, fill });
      return base;
    }

    if (name === 'SYM_CIRCLE') {
      base.elements.push({ type: 'circle', cx: 50, cy: 50, r: 24, fill });
      return base;
    }

    if (name === 'SYM_SQUARE') {
      base.elements.push({ type: 'rect', x: 28, y: 28, w: 44, h: 44, fill });
      return base;
    }

    return null;
  }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class OcupacionDeVias {
  name: string = 'ocupacion';
  colour: string | null = null;
  angle: number = 0.0;
  flip: boolean = false;
  mirror: boolean = false;

  private dataSource: SymbolDataSource;

  constructor(dataSource: SymbolDataSource) {
    this.dataSource = dataSource;
  }

  // Magik: defined_attributes
  async definedAttributes(base: LayoutAttributeDefinition[] = []): Promise<LayoutAttributeDefinition[]> {
    const attribs = [...base]; // Magik: rope.new_from(_super.defined_attributes)

    attribs.push({
      name: 'name',
      type: 'string',
      description: 'Simbolo',
      defaultValue: 'ocupacion',
      enumMethod: 'symbolNames',
    });

    attribs.push({
      name: 'colour',
      type: 'colour',
      description: 'Cambiar color para el simbolo',
      defaultValue: null,
    });

    attribs.push({
      name: 'angle',
      type: 'float',
      description: 'Angulo',
      defaultValue: 0.0,
    });

    attribs.push({
      name: 'flip',
      type: 'boolean',
      description: 'Rotar',
      defaultValue: false,
    });

    attribs.push({
      name: 'mirror',
      type: 'boolean',
      description: 'Espejo',
      defaultValue: false,
    });

    return attribs;
  }

  // Magik: symbol_names
  async symbolNames(): Promise<string[]> {
    return this.dataSource.listSymbolNames();
  }

  // Magik: draw_content_on(window)
  async drawContentOn(): Promise<DrawResult> {
    if (!this.name || this.name.length === 0) {
      return { status: 'incomplete', message: 'select a symbol' };
    }

    const angleRad = -(this.angle || 0) * (Math.PI / 180);
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
// COMPONENTE REACT — demo de atributos y muestra
// =============================================================================

export function OcupacionDeViasUI() {
  const dataSource = useMemo(() => new MockSymbolDataSource(), []);
  const ocupacion = useMemo(() => new OcupacionDeVias(dataSource), [dataSource]);

  const [names, setNames] = useState<string[]>([]);
  const [selected, setSelected] = useState('ocupacion');
  const [color, setColor] = useState('#2E4057');
  const [angle, setAngle] = useState(0);
  const [flip, setFlip] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [result, setResult] = useState<DrawResult>({ status: 'incomplete' });

  useEffect(() => {
    let mounted = true;
    ocupacion.symbolNames().then(list => {
      if (!mounted) return;
      setNames(list);
      if (list.length > 0 && !list.includes(selected)) setSelected(list[0]);
    });
    return () => {
      mounted = false;
    };
  }, [ocupacion, selected]);

  useEffect(() => {
    let mounted = true;
    ocupacion.name = selected || '';
    ocupacion.colour = color;
    ocupacion.angle = angle;
    ocupacion.flip = flip;
    ocupacion.mirror = mirror;

    ocupacion.drawContentOn().then(draw => {
      if (mounted) setResult(draw);
    });

    return () => {
      mounted = false;
    };
  }, [ocupacion, selected, color, angle, flip, mirror]);

  const render = result.render;
  const transform = buildTransform(angle, flip, mirror);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_ocupacion_de_vias</div>
      <div style={s.controls}>
        <label style={s.label}>
          Simbolo
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
          Angulo
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
              return <rect key={idx} x={el.x} y={el.y} width={el.w} height={el.h} fill={el.fill} />;
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

export default OcupacionDeViasUI;
