/**
 * Migración: c_simbologia_plano_reubicacion_terminales.magik
 * Clase Magik:  c_simbologia_plano_reubicacion_terminales — extiende symbol_layout
 *
 * Símbolo configurable para planos de reubicación de terminales.
 *
 * Métodos migrados:
 *   defined_attributes()    → DEFINED_ATTRIBUTES (constante estática con defaults)
 *   draw_content_on(window) → drawContentOn()  — renderiza SVG con transformaciones
 *   symbol_names()          → symbolNames()    — lista ordenada del catálogo inline
 *
 * Equivalencias clave:
 *   symbol_layout             → clase base TS con catálogo SVG inline
 *   sw_gis!gis_point_style    → SYMBOL_CATALOG (Record de render functions)
 *   symbol_bundle_table       → Object.keys(SYMBOL_CATALOG).sort()
 *   colour.scaled_rgb_vector(100.0) → RGB 0-255 → CSS rgb()
 *   angle << -angle.degrees_to_radians → SVG rotate(-angle)
 *   :flipped?  → scaleY(-1)   |   :mirror? → scaleX(-1)
 *   outline_style = white     → SVG filter feMorphology → halo blanco
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS — equivalentes a layout_attribute_definition de Smallworld
// =============================================================================

export interface AtributoDefinicion {
  nombre      : string;
  tipo        : 'string' | 'colour' | 'float' | 'boolean';
  descripcion : string;
  valorDefault: string | [number, number, number] | number | boolean | undefined;
  enumMethod ?: string;  // Magik: :enum_method → función que devuelve opciones válidas
}

/** Magik: slots del exemplar + defined_attributes() */
export interface AtributosSimbolo {
  name  : string;                    // Magik: :name, :string, default "simbologia_reubicacion_term"
  colour?: [number, number, number]; // Magik: :colour — RGB 0-255 (TS) / _unset si no hay
  angle : number;                    // Magik: :angle, :float — grados
  flip  : boolean;                   // Magik: :flip, :boolean — girar vertically
  mirror: boolean;                   // Magik: :mirror, :boolean — espejo horizontal
}

type DrawResult =
  | { tipo: 'incompleto'; mensaje: string }
  | {
      tipo      : 'simbolo';
      renderer  : SymbolRenderer;
      fillColor : string;
      rotacion  : number;   // grados (ya negados, listos para SVG rotate())
      scaleX    : number;   // -1 si mirror, 1 si no
      scaleY    : number;   // -1 si flip,   1 si no
    };

// =============================================================================
// CATÁLOGO DE SÍMBOLOS SVG
// Reemplaza sw_gis!gis_point_style + symbol_bundle_table de Smallworld.
// Cada símbolo se dibuja con origen (0,0), coordenadas en rango ±18.
// =============================================================================

type SymbolRenderer = (fill: string, stroke: string) => React.ReactElement;

const SYMBOL_CATALOG: Record<string, SymbolRenderer> = {

  // Símbolo por defecto del componente: caja terminal + flecha de reubicación
  'simbologia_reubicacion_term': (fill, stroke) => (
    <g>
      {/* Caja terminal */}
      <rect x={-12} y={-8} width={14} height={16}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      {/* Flecha de reubicación (diagonal superior-derecha) */}
      <line x1={2} y1={-8} x2={14} y2={-16} stroke={stroke} strokeWidth={1.5} />
      <polygon points="14,-16 10,-16 14,-12" fill={stroke} />
      {/* Conector inferior */}
      <line x1={-5} y1={8} x2={-5} y2={15} stroke={stroke} strokeWidth={1.5} />
      <circle cx={-5} cy={15} r={2} fill={fill} stroke={stroke} strokeWidth={1} />
    </g>
  ),

  'terminal_fibra_optica': (fill, stroke) => (
    <g>
      <circle cx={0} cy={0} r={10} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {/* 4 fibras radiales */}
      {([0, 90, 180, 270] as number[]).map(a => {
        const r = (a * Math.PI) / 180;
        return (
          <line key={a}
            x1={Math.cos(r) * 3.5} y1={Math.sin(r) * 3.5}
            x2={Math.cos(r) * 10}  y2={Math.sin(r) * 10}
            stroke={stroke} strokeWidth={1.2}
          />
        );
      })}
      <circle cx={0} cy={0} r={3} fill={stroke} />
    </g>
  ),

  'caja_empalme': (fill, stroke) => (
    <g>
      <rect x={-13} y={-8} width={26} height={16}
        fill={fill} stroke={stroke} strokeWidth={1.5} />
      {/* División interna */}
      <line x1={-13} y1={0} x2={13} y2={0} stroke={stroke} strokeWidth={0.7} strokeDasharray="2,2" />
      {/* Conectores laterales */}
      {([-8, 8] as number[]).map(y => [
        <line key={`l${y}`} x1={-19} y1={y} x2={-13} y2={y} stroke={stroke} strokeWidth={1.2} />,
        <line key={`r${y}`} x1={13}  y1={y} x2={19}  y2={y} stroke={stroke} strokeWidth={1.2} />,
      ])}
    </g>
  ),

  'poste_red': (fill, stroke) => (
    <g>
      {/* Poste */}
      <line x1={0} y1={-18} x2={0} y2={18} stroke={stroke} strokeWidth={2} />
      {/* Brazo superior */}
      <line x1={-11} y1={-12} x2={11} y2={-12} stroke={stroke} strokeWidth={1.5} />
      {/* Brazo medio */}
      <line x1={-7}  y1={-4}  x2={7}  y2={-4}  stroke={stroke} strokeWidth={1.2} />
      {/* Terminales */}
      {([-11, 11] as number[]).map(x => (
        <circle key={x} cx={x} cy={-12} r={2.2} fill={fill} stroke={stroke} strokeWidth={1} />
      ))}
      {([-7, 7] as number[]).map(x => (
        <circle key={x} cx={x} cy={-4}  r={1.7} fill={fill} stroke={stroke} strokeWidth={1} />
      ))}
    </g>
  ),

  'armario_distribucion': (fill, stroke) => (
    <g>
      <rect x={-13} y={-17} width={26} height={34}
        fill={fill} stroke={stroke} strokeWidth={1.5} rx={1} />
      <rect x={-9}  y={-13} width={18} height={22}
        fill="none" stroke={stroke} strokeWidth={0.8} />
      {/* Filas de módulos */}
      {([-7, -3, 1, 5] as number[]).map(y => (
        <line key={y} x1={-9} y1={y} x2={9} y2={y} stroke={stroke} strokeWidth={0.4} strokeDasharray="1,1" />
      ))}
      {/* Manija */}
      <circle cx={6} cy={0} r={1.5} fill={stroke} />
    </g>
  ),
};

// =============================================================================
// CLASE — c_simbologia_plano_reubicacion_terminales
// =============================================================================

export class CSimbologiaPlanoReubicacionTerminales {

  // Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: slots del exemplar (vacíos en el original, heredados de symbol_layout)
  atributos: AtributosSimbolo = {
    name  : 'simbologia_reubicacion_term',
    colour: undefined,
    angle : 0.0,
    flip  : false,
    mirror: false,
  };

  // ---------------------------------------------------------------------------
  // defined_attributes()
  //
  // Magik:
  //   attribs << rope.new_from(_super.defined_attributes)
  //   attribs.add(layout_attribute_definition.new(:name,   :string,  :default_value, "simbologia_reubicacion_term", :enum_method, :symbol_names))
  //   attribs.add(layout_attribute_definition.new(:colour, :colour,  :default_value, _unset))
  //   attribs.add(layout_attribute_definition.new(:angle,  :float,   :default_value, 0.0))
  //   attribs.add(layout_attribute_definition.new(:flip,   :boolean, :default_value, _false))
  //   attribs.add(layout_attribute_definition.new(:mirror, :boolean, :default_value, _false))
  // ---------------------------------------------------------------------------
  static readonly DEFINED_ATTRIBUTES: AtributoDefinicion[] = [
    {
      nombre      : 'name',
      tipo        : 'string',
      descripcion : 'Símbolo',
      valorDefault: 'simbologia_reubicacion_term',
      enumMethod  : 'symbolNames',  // Magik: :enum_method, :symbol_names
    },
    {
      nombre      : 'colour',
      tipo        : 'colour',
      descripcion : 'Cambiar color para el símbolo',
      valorDefault: undefined,      // Magik: _unset
    },
    {
      nombre      : 'angle',
      tipo        : 'float',
      descripcion : 'Ángulo',
      valorDefault: 0.0,
    },
    {
      nombre      : 'flip',
      tipo        : 'boolean',
      descripcion : 'Girar',
      valorDefault: false,          // Magik: _false
    },
    {
      nombre      : 'mirror',
      tipo        : 'boolean',
      descripcion : 'Espejo',
      valorDefault: false,          // Magik: _false
    },
  ];

  // ---------------------------------------------------------------------------
  // symbol_names()
  //
  // Magik:
  //   LdsEstilosSigc << LoGpm.databases[:sigc_style_view]
  //   sym_table << symbol_bundle_table.open(LdsEstilosSigc.default(LoGpm.style_view)).symbol_names
  //   names << sorted_collection.new()
  //   _for sym_name _over sym_table.fast_elements() _loop names.add(sym_name.write_string) _endloop
  //   >> names.as_simple_vector()
  // ---------------------------------------------------------------------------
  symbolNames(): string[] {
    // symbol_bundle_table → SYMBOL_CATALOG inline; sorted_collection → Array.sort()
    return Object.keys(SYMBOL_CATALOG).sort();
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(window)
  //
  // Magik:
  //   _self.outline_style << line_style.new(colour.called(:white))   ← halo blanco
  //   _if _self.name _is _unset _orif _self.name.size _is 0
  //     → _self.draw_incomplete(window, :select_a_symbol); _return
  //   sym << LoDsSimbolos.collections[:sw_gis!gis_point_style].new_detached_record()
  //   col_vec << _self.colour.scaled_rgb_vector(100.0)  ← RGB 0-100 si colour ≠ _unset
  //   sym.symbol_name << _self.name; sym.realise(_unset, col_vec)
  //   _if sym.actual_geoms _is _unset
  //     → _self.draw_incomplete(window, :unknown_symbol, _self.name); _return
  //   angle << - _self.angle.default(0.0).degrees_to_radians   ← negado
  //   sym.draw_sample(window, _self.bounds,
  //     :rotate, angle, :flipped?, _self.flip, :mirror?, _self.mirror)
  // ---------------------------------------------------------------------------
  drawContentOn(): DrawResult {
    const { name, colour, angle, flip, mirror } = this.atributos;

    // Magik: _if _self.name _is _unset _orif _self.name.size _is 0
    if (!name || name.length === 0) {
      return { tipo: 'incompleto', mensaje: 'Seleccione un símbolo' };
    }

    // Magik: sym.realise() → buscar en catálogo
    const renderer = SYMBOL_CATALOG[name];

    // Magik: _if sym.actual_geoms _is _unset
    if (!renderer) {
      return { tipo: 'incompleto', mensaje: `Símbolo desconocido: "${name}"` };
    }

    // Magik: colour.scaled_rgb_vector(100.0) → [0-100, 0-100, 0-100]
    // TS:    colour en RGB 0-255 → CSS rgb(r, g, b)
    const fillColor = colour
      ? `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`
      : '#2E4057';

    return {
      tipo     : 'simbolo',
      renderer,
      fillColor,
      rotacion : -angle,        // Magik: angle << -angle.degrees_to_radians
      scaleX   : mirror ? -1 : 1, // Magik: :mirror? → scale(-1, 1)
      scaleY   : flip   ? -1 : 1, // Magik: :flipped? → scale(1, -1)
    };
  }
}

// =============================================================================
// COMPONENTE REACT — demo del símbolo configurable
// =============================================================================

const FILTER_ID = 'simbologia-white-halo';

export function SimbologiaPlanoReubicacionTerminalesUI() {
  const inst   = new CSimbologiaPlanoReubicacionTerminales();
  const nombres = inst.symbolNames();

  const [name,     setName    ] = useState(inst.atributos.name);
  const [useColor, setUseColor] = useState(false);
  const [colorHex, setColorHex] = useState('#2E4057');
  const [angle,    setAngle   ] = useState(0);
  const [flip,     setFlip    ] = useState(false);
  const [mirror,   setMirror  ] = useState(false);
  const [size,     setSize    ] = useState(100);

  // Hex → RGB 0-255 — Magik: colour.scaled_rgb_vector(100.0) produce 0-100
  const hexToRgb = (hex: string): [number, number, number] => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };

  inst.atributos = {
    name,
    colour: useColor ? hexToRgb(colorHex) : undefined,
    angle,
    flip,
    mirror,
  };

  const result = inst.drawContentOn();

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_simbologia_plano_reubicacion_terminales</h3>
      <p style={s.meta}>
        Símbolo configurable de reubicación de terminales —
        5 atributos: <code>name</code>, <code>colour</code>, <code>angle</code>, <code>flip</code>, <code>mirror</code>.
        Catálogo SVG inline reemplaza <code>sw_gis!gis_point_style</code>.
      </p>

      {/* ── Controles ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          Símbolo:
          <select value={name} onChange={e => setName(e.target.value)} style={s.select}>
            {nombres.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={useColor} onChange={e => setUseColor(e.target.checked)} />
          {' '}Color:
          <input
            type="color" value={colorHex} disabled={!useColor}
            onChange={e => setColorHex(e.target.value)}
            style={{ ...s.colorPick, opacity: useColor ? 1 : 0.4 }}
          />
        </label>

        <label style={s.lbl}>
          Ángulo:
          <input
            type="number" value={angle} min={-180} max={180}
            onChange={e => setAngle(Number(e.target.value))}
            style={s.numInput}
          />°
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={flip} onChange={e => setFlip(e.target.checked)} />
          {' '}Girar (flip)
        </label>

        <label style={s.lbl}>
          <input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} />
          {' '}Espejo (mirror)
        </label>

        <label style={s.lbl}>
          Tamaño:
          <input
            type="range" min={50} max={200} value={size}
            onChange={e => setSize(Number(e.target.value))}
            style={{ width: 70 }}
          />
          {size}px
        </label>
      </div>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── Previsualización SVG ── */}
        <div>
          {result.tipo === 'incompleto' ? (
            <svg width={size} height={size}
              style={{ border: '1px dashed #f9a825', background: '#fff9c4', borderRadius: 4 }}
            >
              <text x={size / 2} y={size / 2 - 7} textAnchor="middle" fontSize={10} fill="#e65100">⚠</text>
              <text x={size / 2} y={size / 2 + 7} textAnchor="middle" fontSize={8}  fill="#e65100">{result.mensaje}</text>
            </svg>
          ) : (
            <svg
              width={size} height={size}
              viewBox="-20 -20 40 40"
              style={{ border: '1px solid #bbb', background: '#d8dde2', borderRadius: 4 }}
            >
              <defs>
                {/*
                  Magik: outline_style << line_style.new(colour.called(:white))
                  SVG: feMorphology dilata el canal alpha → rellena con blanco → halo
                */}
                <filter id={FILTER_ID} x="-35%" y="-35%" width="170%" height="170%">
                  <feMorphology operator="dilate" radius={1.5} in="SourceAlpha" result="dilated" />
                  <feFlood floodColor="white" result="whiteFill" />
                  <feComposite in="whiteFill" in2="dilated" operator="in" result="halo" />
                  <feMerge>
                    <feMergeNode in="halo" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Magik: sym.draw_sample(window, bounds, :rotate, angle, :flipped?, flip, :mirror?, mirror) */}
              <g
                filter={`url(#${FILTER_ID})`}
                transform={`rotate(${result.rotacion}) scale(${result.scaleX}, ${result.scaleY})`}
              >
                {result.renderer(result.fillColor, '#1a2530')}
              </g>
            </svg>
          )}
          <small style={{ ...s.meta, display: 'block', marginTop: 2, textAlign: 'center' }}>
            {size}px · viewBox −20,−20 → 40×40 · fondo gris para mostrar halo blanco
          </small>
        </div>

        {/* ── Tabla de atributos ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          <table style={s.table}>
            <thead>
              <tr>
                {['Atributo Magik', 'Tipo', 'Valor actual', 'Default Magik'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CSimbologiaPlanoReubicacionTerminales.DEFINED_ATTRIBUTES.map((attr, i) => {
                const raw = inst.atributos[attr.nombre as keyof AtributosSimbolo];
                const valStr = raw === undefined          ? '_unset'
                  : Array.isArray(raw)                    ? `rgb(${(raw as number[]).join(', ')})`
                  : String(raw);
                const defStr = attr.valorDefault === undefined ? '_unset' : String(attr.valorDefault);
                return (
                  <tr key={attr.nombre} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}><code>:{attr.nombre}</code></td>
                    <td style={{ ...s.td, color: '#666' }}>{attr.tipo}</td>
                    <td style={{ ...s.td, fontWeight: 'bold' }}>{valStr}</td>
                    <td style={{ ...s.td, color: '#999' }}>{defStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <table style={s.table}>
            <thead>
              <tr>
                {['Transformación', 'Magik (original)', 'SVG equivalente'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  t: 'Rotación',
                  m: '-angle.degrees_to_radians',
                  svgVal: `rotate(${result.tipo === 'simbolo' ? result.rotacion : 0}°)`,
                },
                {
                  t: 'Girar (flip)',
                  m: ':flipped? → sym.draw_sample(...)',
                  svgVal: `scaleY(${flip ? -1 : 1})`,
                },
                {
                  t: 'Espejo (mirror)',
                  m: ':mirror? → sym.draw_sample(...)',
                  svgVal: `scaleX(${mirror ? -1 : 1})`,
                },
                {
                  t: 'Contorno blanco',
                  m: 'outline_style = line_style.new(white)',
                  svgVal: 'filter: feMorphology + feFlood(white)',
                },
              ].map(({ t, m, svgVal }, i) => (
                <tr key={t} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                  <td style={s.td}>{t}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{m}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}>{svgVal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={s.table}>
            <thead>
              <tr>
                {['Símbolo en catálogo', 'Equivalente Magik'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nombres.map((n, i) => (
                <tr key={n} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: n === name ? 'bold' : 'normal' }}>{n}</td>
                  <td style={{ ...s.td, color: '#888', fontSize: 10 }}>
                    {n === 'simbologia_reubicacion_term'
                      ? 'sym.symbol_name (default_value)'
                      : 'symbol_bundle_table → sym_name'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Magik: <code>colour.scaled_rgb_vector(100.0)</code> → RGB 0-100.
        TS: almacena RGB 0-255 → <code>{'rgb(r,g,b)'}</code>.{' '}
        <code>allowed_on_menu? = _false</code> → <code>ALLOWED_ON_MENU = false</code>.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  select   : { padding: '2px 6px', borderRadius: 3, border: '1px solid #b0bec5', fontSize: 11, minWidth: 200 },
  numInput : { width: 55, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  colorPick: { width: 28, height: 22, border: '1px solid #bbb', borderRadius: 2, cursor: 'pointer', padding: 0 },
  table    : { borderCollapse: 'collapse' },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SimbologiaPlanoReubicacionTerminalesUI;
