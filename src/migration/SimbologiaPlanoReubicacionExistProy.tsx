/**
 * Migración de: c_simbologia_plano_reubicacion_exist_proy.magik
 * Clase Magik:  c_simbologia_plano_reubicacion_exist_proy  —  package user
 * Hereda:       symbol_layout  (Smallworld layout element)
 *
 * Elemento de simbología embebible en planos de reubicación (existente/proyectado).
 * Define 5 atributos configurables (name, colour, angle, flip, mirror) y los usa
 * para renderizar un símbolo GIS puntual con transformaciones sobre un canvas.
 *
 * Reutiliza de StyleSymbolOpenDialog.tsx:
 *   SymbolDefinition, DrawSampleParams, drawSample, SymbolStyleService
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

import {
  type SymbolDefinition,
  type DrawSampleParams,
  type SymbolStyleService,
  drawSample,
} from './StyleSymbolOpenDialog';

// =============================================================================
// TIPOS — atributos del layout symbol
// =============================================================================

/**
 * Magik: layout_attribute_definition.new(...)
 * Descriptor de un atributo editable del símbolo en el layout editor de Smallworld.
 */
export interface AttributeDefinition {
  name:         string;
  type:         'string' | 'colour' | 'float' | 'boolean';
  description:  string;
  defaultValue: unknown;
  enumMethod?:  string;   // :enum_method → llama a un método para las opciones válidas
}

/**
 * Magik: slots del exemplar — values editables en el layout editor.
 * colour: RGB en rango 0-100 (≡ colour.scaled_rgb_vector(100.0)) o null (= _unset).
 */
export interface SymbolLayoutAttribs {
  name:   string;
  colour: [number, number, number] | null;
  angle:  number;
  flip:   boolean;
  mirror: boolean;
}

export const DEFAULT_ATTRIBS: Readonly<SymbolLayoutAttribs> = {
  name:   'simbologia_de_la_red_sec_fo',
  colour: null,
  angle:  0.0,
  flip:   false,
  mirror: false,
};

// =============================================================================
// MOCK SymbolStyleService — amplía los símbolos de [11] con variantes reubicación
// =============================================================================

const SYMBOLS_REUBICACION: SymbolDefinition[] = [
  // Símbolo por defecto — leyenda red secundaria FO
  { symbolName: 'simbologia_de_la_red_sec_fo', shape: 'square',   fillColor: '#2E7D32', strokeColor: '#1B5E20', size: 18, hasActualGeoms: true  },
  // Elementos de red existente
  { symbolName: 'cable_fo_existente_12fo',      shape: 'circle',   fillColor: '#FF8C00', strokeColor: '#E65100', size: 14, hasActualGeoms: true  },
  { symbolName: 'cable_fo_existente_24fo',      shape: 'circle',   fillColor: '#1565C0', strokeColor: '#0D47A1', size: 14, hasActualGeoms: true  },
  { symbolName: 'empalme_subterraneo',          shape: 'diamond',  fillColor: '#6A1B9A', strokeColor: '#4A148C', size: 16, hasActualGeoms: true  },
  { symbolName: 'terminal_cobre',               shape: 'triangle', fillColor: '#F9A825', strokeColor: '#E65100', size: 16, hasActualGeoms: true  },
  // Elementos proyectados (reubicación)
  { symbolName: 'cable_fo_proyectado_12fo',     shape: 'circle',   fillColor: '#FF8C00', strokeColor: '#BF360C', size: 14, hasActualGeoms: true  },
  { symbolName: 'cable_fo_proyectado_24fo',     shape: 'circle',   fillColor: '#1565C0', strokeColor: '#0D47A1', size: 14, hasActualGeoms: true  },
  { symbolName: 'tuberia_proteccion',           shape: 'square',   fillColor: '#37474F', strokeColor: '#263238', size: 12, hasActualGeoms: true  },
  { symbolName: 'camara_empalme',               shape: 'star',     fillColor: '#C62828', strokeColor: '#B71C1C', size: 18, hasActualGeoms: true  },
  { symbolName: 'cruzamiento_aereo',            shape: 'cross',    fillColor: '#0277BD', strokeColor: '#01579B', size: 16, hasActualGeoms: true  },
  // Símbolo sin geometría para probar draw_incomplete
  { symbolName: 'simbolo_sin_geom',             shape: 'circle',   fillColor: '#ccc',    strokeColor: '#999',    size: 12, hasActualGeoms: false },
];

export const mockReubicacionSymbolService: SymbolStyleService = {
  getSymbol: (name) => SYMBOLS_REUBICACION.find(s => s.symbolName === name),
  listSymbolNames: () => SYMBOLS_REUBICACION.map(s => s.symbolName),
};

// =============================================================================
// HELPERS
// =============================================================================

/** RGB 0-100 → CSS rgb() string — invierte colour.scaled_rgb_vector(100.0) */
const rgb100ToCss = ([r, g, b]: [number, number, number]): string =>
  `rgb(${Math.round(r * 2.55)},${Math.round(g * 2.55)},${Math.round(b * 2.55)})`;

/** CSS hex #rrggbb → [r,g,b] 0-100 */
const hexToRgb100 = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [
    Math.round(((n >> 16) & 0xff) / 2.55),
    Math.round(((n >>  8) & 0xff) / 2.55),
    Math.round(((n      ) & 0xff) / 2.55),
  ];
};

/** [r,g,b] 0-100 → CSS hex #rrggbb */
const rgb100ToHex = ([r, g, b]: [number, number, number]): string => {
  const toHex = (v: number) => Math.round(v * 2.55).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/** Dibuja mensaje draw_incomplete — equivale a _self.draw_incomplete(window, str) */
function drawIncomplete(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
): void {
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ddd';
  ctx.strokeRect(2, 2, width - 4, height - 4);
  ctx.fillStyle = '#999';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, width / 2, height / 2);
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSimbologiaPlanoReubicacionExistProy {

  /** Atributos configurables — equivalen a los slots del exemplar Magik */
  private attribs: SymbolLayoutAttribs;

  constructor(attribs: Partial<SymbolLayoutAttribs> = {}) {
    this.attribs = { ...DEFAULT_ATTRIBS, ...attribs };
  }

  /**
   * Magik: c_simbologia_plano_reubicacion_exist_proy.defined_attributes
   *
   * attribs << rope.new_from(_super.defined_attributes)  ← atributos del padre symbol_layout
   * attribs.add(layout_attribute_definition.new(:name,   :string,  ...))
   * attribs.add(layout_attribute_definition.new(:colour, :colour,  ...))
   * attribs.add(layout_attribute_definition.new(:angle,  :float,   ...))
   * attribs.add(layout_attribute_definition.new(:flip,   :boolean, ...))
   * attribs.add(layout_attribute_definition.new(:mirror, :boolean, ...))
   * >> attribs
   *
   * Nota: _super.defined_attributes (atributos de symbol_layout: posición, tamaño)
   * no se transcriben — son metadatos del motor de layout de Smallworld.
   */
  static definedAttributes(): AttributeDefinition[] {
    return [
      {
        name:         'name',
        type:         'string',
        description:  'Símbolo',
        defaultValue: 'simbologia_de_la_red_sec_fo',
        enumMethod:   'symbol_names',  // :enum_method → getSymbolNames()
      },
      {
        name:         'colour',
        type:         'colour',
        description:  'Cambiar color para el símbolo',
        defaultValue: null,            // _unset → usa el color por defecto del símbolo
      },
      {
        name:         'angle',
        type:         'float',
        description:  'Ángulo',
        defaultValue: 0.0,
      },
      {
        name:         'flip',
        type:         'boolean',
        description:  'Girar',
        defaultValue: false,
      },
      {
        name:         'mirror',
        type:         'boolean',
        description:  'Espejo',
        defaultValue: false,
      },
    ];
  }

  /**
   * Magik: c_simbologia_plano_reubicacion_exist_proy.draw_content_on(window)
   *
   * 1. _self.outline_style << line_style.new(colour.called(:white))
   * 2. Obtiene la base de datos de símbolos (sigc_style_view o style_view)
   * 3. Si .name es _unset o vacío → draw_incomplete("select_a_symbol")
   * 4. sym << LoDsSimbolos.collections[:sw_gis!gis_point_style].new_detached_record()
   * 5. col_vec << _self.colour.scaled_rgb_vector(100.0)  (si colour _isnt _unset)
   * 6. sym.symbol_name << _self.name; sym.realise(_unset, col_vec)
   * 7. Si sym.actual_geoms _is _unset → draw_incomplete("unknown_symbol")
   * 8. angle << - _self.angle.default(0.0).degrees_to_radians
   * 9. sym.draw_sample(window, bounds, :rotate, angle, :flipped?, flip, :mirror?, mirror)
   */
  drawContentOn(canvas: HTMLCanvasElement, service: SymbolStyleService): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // _self.outline_style << line_style.new(colour.called(:white))
    // (en canvas: strokeStyle base blanco antes de dibujar el símbolo)
    ctx.strokeStyle = '#ffffff';

    // 3. if _self.name _is _unset _orif _self.name.size _is 0
    if (!this.attribs.name || this.attribs.name.length === 0) {
      drawIncomplete(ctx, width, height, 'Select a symbol');
      return;
    }

    // 4-6. new_detached_record() + symbol_name + realise() → service.getSymbol abstrae los 3 pasos
    const symDef = service.getSymbol(this.attribs.name);

    // 7. if sym.actual_geoms _is _unset
    if (!symDef || !symDef.hasActualGeoms) {
      drawIncomplete(ctx, width, height, `Unknown symbol: ${this.attribs.name}`);
      return;
    }

    // Colour override: col_vec << _self.colour.scaled_rgb_vector(100.0)
    // Si colour _isnt _unset → sobreescribir fillColor y strokeColor del símbolo
    const symToRender: SymbolDefinition = this.attribs.colour
      ? {
          ...symDef,
          fillColor:   rgb100ToCss(this.attribs.colour),
          strokeColor: rgb100ToCss(this.attribs.colour),
        }
      : symDef;

    // 8. angle << - _self.angle.default(0.0).degrees_to_radians
    const angleRad = -(this.attribs.angle ?? 0.0) * (Math.PI / 180);

    // 9. sym.draw_sample(window, bounds, :rotate, angle, :flipped?, flip, :mirror?, mirror)
    const params: DrawSampleParams = {
      rotate:  angleRad,
      flipped: this.attribs.flip   ?? false,
      mirror:  this.attribs.mirror ?? false,
    };
    drawSample(ctx, { width, height }, symToRender, params);
  }

  /**
   * Magik: c_simbologia_plano_reubicacion_exist_proy.symbol_names
   *
   * sym_table << symbol_bundle_table.open(LdsEstilosSigc.default(style_view)).symbol_names
   * names << sorted_collection.new()
   * _for sym_name _over sym_table.fast_elements() _loop names.add(sym_name.write_string) _endloop
   * >> names.as_simple_vector()
   *
   * TS: delega en el service e impone el orden con .sort().
   */
  static getSymbolNames(service: SymbolStyleService): string[] {
    // sorted_collection + as_simple_vector → Array.sort() en TS
    return service.listSymbolNames().sort();
  }

  /** Getters/setters de atributos — equivalen a los slots de Magik */
  get name()   { return this.attribs.name;   }
  get colour() { return this.attribs.colour; }
  get angle()  { return this.attribs.angle;  }
  get flip()   { return this.attribs.flip;   }
  get mirror() { return this.attribs.mirror; }

  setAttribs(partial: Partial<SymbolLayoutAttribs>): void {
    this.attribs = { ...this.attribs, ...partial };
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Editor de los 5 atributos + canvas de preview (≡ layout editor de Smallworld)
// =============================================================================

interface DemoProps {
  service?: SymbolStyleService;
  canvasSize?: number;
}

export function SimbologiaPlanoReubicacionExistProyUI({
  service    = mockReubicacionSymbolService,
  canvasSize = 140,
}: DemoProps) {

  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<CSimbologiaPlanoReubicacionExistProy | null>(null);

  const [name,   setName]   = useState(DEFAULT_ATTRIBS.name);
  const [colour, setColour] = useState<[number, number, number] | null>(DEFAULT_ATTRIBS.colour);
  const [angle,  setAngle]  = useState(DEFAULT_ATTRIBS.angle);
  const [flip,   setFlip]   = useState(DEFAULT_ATTRIBS.flip);
  const [mirror, setMirror] = useState(DEFAULT_ATTRIBS.mirror);

  // Inicializar instancia
  useEffect(() => {
    instanceRef.current = new CSimbologiaPlanoReubicacionExistProy();
  }, []);

  // Re-render canvas cuando cambia cualquier atributo
  const redraw = useCallback(() => {
    if (!canvasRef.current || !instanceRef.current) return;
    instanceRef.current.setAttribs({ name, colour, angle, flip, mirror });
    instanceRef.current.drawContentOn(canvasRef.current, service);
  }, [name, colour, angle, flip, mirror, service]);

  useEffect(() => { redraw(); }, [redraw]);

  const symbolNames = CSimbologiaPlanoReubicacionExistProy.getSymbolNames(service);
  const attrDefs    = CSimbologiaPlanoReubicacionExistProy.definedAttributes();

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_simbologia_plano_reubicacion_exist_proy — Layout symbol</h3>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

        {/* Panel de atributos — equivale al editor de propiedades del layout */}
        <div style={s.attrPanel}>
          <p style={s.subtitle}>defined_attributes (5 propiedades)</p>

          {/* name — :enum_method :symbol_names */}
          <div style={s.row}>
            <label style={s.lbl}>name (.s_name)</label>
            <select style={s.sel} value={name}
              onChange={e => setName(e.target.value)}>
              {symbolNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* colour — colour.scaled_rgb_vector(100.0) */}
          <div style={s.row}>
            <label style={s.lbl}>colour (RGB 0-100)</label>
            <input
              type="color"
              value={colour ? rgb100ToHex(colour) : '#000000'}
              onChange={e => setColour(hexToRgb100(e.target.value))}
              style={{ width: 36, height: 24, padding: 0, border: 'none', cursor: 'pointer' }}
            />
            <button style={s.clearBtn}
              onClick={() => setColour(null)}>
              _unset
            </button>
            <span style={{ fontSize: 10, color: '#888' }}>
              {colour ? `[${colour.map(v => v.toFixed(0)).join(',')}]` : '(unset — default color)'}
            </span>
          </div>

          {/* angle — degrees_to_radians (negativo en render) */}
          <div style={s.row}>
            <label style={s.lbl}>angle (°)</label>
            <input type="range" min={-180} max={180} step={5} value={angle}
              onChange={e => setAngle(+e.target.value)} style={{ width: 100 }} />
            <code style={{ fontSize: 11, minWidth: 40 }}>{angle}°</code>
            <span style={{ fontSize: 10, color: '#888' }}>
              → rad: {(-(angle) * Math.PI / 180).toFixed(3)}
            </span>
          </div>

          {/* flip — :flipped? en draw_sample */}
          <div style={s.row}>
            <label style={s.lbl}>flip / Girar (:flipped?)</label>
            <input type="checkbox" checked={flip}
              onChange={e => setFlip(e.target.checked)} />
            <span style={{ fontSize: 11, color: '#555', marginLeft: 4 }}>
              {flip ? 'scale(1,-1) — Y invertida' : 'sin inversión Y'}
            </span>
          </div>

          {/* mirror — :mirror? en draw_sample */}
          <div style={s.row}>
            <label style={s.lbl}>mirror / Espejo (:mirror?)</label>
            <input type="checkbox" checked={mirror}
              onChange={e => setMirror(e.target.checked)} />
            <span style={{ fontSize: 11, color: '#555', marginLeft: 4 }}>
              {mirror ? 'scale(-1,1) — X invertida' : 'sin inversión X'}
            </span>
          </div>
        </div>

        {/* Canvas — draw_content_on(window) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={s.subtitle}>draw_content_on (canvas)</p>
          <canvas ref={canvasRef} width={canvasSize} height={canvasSize} style={s.canvas} />
          <p style={s.meta}>
            angle → -{angle}° × π/180 = {(-(angle) * Math.PI / 180).toFixed(3)} rad
          </p>
        </div>

        {/* Tabla defined_attributes */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <p style={s.subtitle}>defined_attributes — metadata</p>
          <table style={s.table}>
            <thead>
              <tr>{['name','type','description','default','enumMethod'].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {attrDefs.map(d => (
                <tr key={d.name}>
                  <td style={s.td}><code>{d.name}</code></td>
                  <td style={{ ...s.td, color: '#2E4057' }}><code>{d.type}</code></td>
                  <td style={{ ...s.td, fontSize: 10 }}>{d.description}</td>
                  <td style={s.td}>
                    <code>{d.defaultValue === null ? '_unset' : String(d.defaultValue)}</code>
                  </td>
                  <td style={{ ...s.td, fontSize: 10, color: '#888' }}>
                    {d.enumMethod ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* symbol_names — sorted list */}
          <p style={{ ...s.subtitle, marginTop: 10 }}>
            symbol_names() — {symbolNames.length} símbolos (sorted)
          </p>
          <div style={s.nameList}>
            {symbolNames.map(n => (
              <span key={n} style={{
                ...s.nameTag,
                background: n === name ? '#2E4057' : '#f0f0f0',
                color:      n === name ? '#fff'    : '#333',
              }}
                onClick={() => setName(n)}
              >{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:740, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta     : { margin:0, fontSize:10, color:'#888' },
  attrPanel: { display:'flex', flexDirection:'column', gap:8, minWidth:360 },
  row      : { display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' as const },
  lbl      : { minWidth:180, fontSize:11, color:'#555' },
  sel      : { padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:11, maxWidth:200 },
  clearBtn : { padding:'2px 6px', fontSize:10, border:'1px solid #ccc', borderRadius:3, cursor:'pointer', background:'#f0f0f0' },
  canvas   : { border:'2px solid #ddd', borderRadius:4, background:'#fff', display:'block' },
  table    : { width:'100%', borderCollapse:'collapse' as const },
  th       : { background:'#2E4057', color:'#fff', padding:'4px 6px', textAlign:'left' as const, fontSize:10 },
  td       : { padding:'3px 6px', borderBottom:'1px solid #eee', fontSize:11 },
  nameList : { display:'flex', flexWrap:'wrap' as const, gap:4 },
  nameTag  : { padding:'2px 7px', borderRadius:10, fontSize:10, cursor:'pointer', userSelect:'none' as const },
};

export default SimbologiaPlanoReubicacionExistProyUI;
