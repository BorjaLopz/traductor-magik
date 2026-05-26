// =============================================================================
// MIGRACIÓN: c_simbolo_grafico  →  CSimboloGrafico.tsx
// Jerarquía Magik: c_simbolo_grafico  extends  :c_elemento_grafico
// Fuente: adiciones_layout/source/Sellos/Utilerias/c_simbolo_grafico.magik
// Autor: fdiaz / dsanchez  ·  03/11/2004
// =============================================================================
//
// Elemento gráfico que dibuja un símbolo del catálogo de estilos
// (:sw_gis!gis_point_style) sobre un área del sello. Soporta:
//   · nombre del símbolo (sNombre_Grafico)
//   · flip horizontal / vertical (bVoltear_H, bVoltear_V)
//   · rotación en grados (nGrados)
//   · grupo de estilos (o_sty_view) — :default usa el style_view global
//
// El padre c_elemento_grafico NO está migrado. Aquí se incluye un stub
// CElementoGrafico con las primitivas mínimas (oArea, oVentana, márgenes,
// init_with, serial_slots) suficientes para no romper la subclase.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Stub mínimo del padre c_elemento_grafico
// ---------------------------------------------------------------------------

// Magik: bounding_box.new(xmin, ymin, xmax, ymax) — equivalente a Extent OL.
export interface Area {
  xmin: number; ymin: number; xmax: number; ymax: number;
}

// Magik: ventana de dibujo (canvas/window). En TS basta con un id opaco.
export interface VentanaDibujo {
  id: string;
}

export interface ElementoGraficoProps {
  oArea?:        Area;
  oVentana?:     VentanaDibujo;
  nMargen_izq?:  number;
  nMargen_der?:  number;
  nMargen_sup?:  number;
  nMargen_inf?:  number;
}

export class CElementoGrafico {
  // Slots base que cualquier subclase espera tener.
  oArea:        Area | undefined        = undefined;
  oVentana:     VentanaDibujo | undefined = undefined;
  nMargen_izq:  number = 0;
  nMargen_der:  number = 0;
  nMargen_sup:  number = 0;
  nMargen_inf:  number = 0;

  init_with(props: ElementoGraficoProps): this {
    if (props.oArea       !== undefined) this.oArea       = props.oArea;
    if (props.oVentana    !== undefined) this.oVentana    = props.oVentana;
    if (props.nMargen_izq !== undefined) this.nMargen_izq = props.nMargen_izq;
    if (props.nMargen_der !== undefined) this.nMargen_der = props.nMargen_der;
    if (props.nMargen_sup !== undefined) this.nMargen_sup = props.nMargen_sup;
    if (props.nMargen_inf !== undefined) this.nMargen_inf = props.nMargen_inf;
    return this;
  }

  serial_slots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['oArea', 'oVentana', 'nMargen_izq', 'nMargen_der', 'nMargen_sup', 'nMargen_inf'],
      values: [this.oArea, this.oVentana, this.nMargen_izq, this.nMargen_der, this.nMargen_sup, this.nMargen_inf],
    };
  }
}

// ---------------------------------------------------------------------------
// Stub del catálogo de estilos (:sw_gis!gis_point_style)
// ---------------------------------------------------------------------------

// Magik: sty_view.collections[:sw_gis!gis_point_style].new_detached_record()
// + .symbol_name << ... + .realise(unset, unset) + .draw_sample(...)
export interface SymbolStyleRecord {
  symbol_name: string;
  realise(_a?: unknown, _b?: unknown): void;
  draw_sample(
    ventana:    VentanaDibujo,
    area:       Area,
    opts:       { rotate: number; flipped: boolean; mirror: boolean },
  ): void;
}

export interface StyleViewLike {
  collections: { 'sw_gis!gis_point_style': { new_detached_record(): SymbolStyleRecord } };
}

// gpm.databases[:sigc_style_view] / gpm.style_view simulados
export interface GisProgramManagerMock {
  databases:  { sigc_style_view?: StyleViewLike };
  style_view: StyleViewLike;
}

// Magik: :default o el grupo nombrado por el slot o_sty_view
export type GrupoEstilos = ':default' | string | undefined;

// ---------------------------------------------------------------------------
// Símbolos disponibles (mock de sw_gis!gis_point_style.enumerate)
// ---------------------------------------------------------------------------

export const SYMBOL_NAMES = [
  'gis_point_circle',
  'gis_point_square',
  'gis_point_triangle',
  'gis_point_diamond',
  'gis_point_cross',
  'gis_point_arrow',
  'gis_point_star',
  'gis_point_terminal',
  'gis_point_hexagon',
] as const;

export type SymbolName = typeof SYMBOL_NAMES[number] | (string & {});

// Mock de gpm con dos style_views diferenciables (default vs sigc)
const GPM_MOCK: GisProgramManagerMock = {
  databases: {
    sigc_style_view: {
      collections: {
        'sw_gis!gis_point_style': {
          new_detached_record() {
            const rec: SymbolStyleRecord = {
              symbol_name: '',
              realise() {},
              draw_sample() {},
            };
            return rec;
          },
        },
      },
    },
  },
  style_view: {
    collections: {
      'sw_gis!gis_point_style': {
        new_detached_record() {
          const rec: SymbolStyleRecord = {
            symbol_name: '',
            realise() {},
            draw_sample() {},
          };
          return rec;
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Tipos de props para init_with / new_from
// ---------------------------------------------------------------------------

export interface SimboloGraficoProps extends ElementoGraficoProps {
  sNombre_Grafico?: string;
  bVoltear_H?:      boolean;
  bVoltear_V?:      boolean;
  nGrados?:         number;
  grupo_estilos?:   GrupoEstilos;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_simbolo_grafico. Subclase de CElementoGrafico (stub).
 * El método Despliega() resuelve la style_view a usar (sigc o default) y
 * registra los parámetros que el catálogo invocaría sobre el record
 * temporal (sin canvas real — devuelve un descriptor que la UI pinta).
 */
export class CSimboloGrafico extends CElementoGrafico {
  // ── Slots (todos :private :writable en Magik) ────────────────────────────
  private _sNombre_Grafico: string | undefined = undefined;
  private _bVoltear_H:      boolean = false;
  private _bVoltear_V:      boolean = false;
  private _nGrados:         number  = 0;
  private _o_sty_view:      GrupoEstilos = undefined;

  // ── Magik: new(RsNombre) ─────────────────────────────────────────────────
  constructor(rsNombre?: string) {
    super();
    if (rsNombre !== undefined) this._sNombre_Grafico = rsNombre;
  }

  // ── new_from(RoObjeto, RsNombre_Grafico?) — constructor de copia ────────
  // Magik: si RoObjeto NO es kind_of c_simbolo_grafico → condition.raise.
  // Si lo es: copia atributos y DIVIDE márgenes entre 10 (bug histórico
  // conservado: nota 25/01/05 DSB).
  static new_from(roObjeto: unknown, rsNombre_Grafico?: string): CSimboloGrafico {
    if (!(roObjeto instanceof CSimboloGrafico)) {
      throw new Error('El objeto que se proporcionó, no es de tipo c_símbolo_grafico');
    }
    const c = new CSimboloGrafico();
    c._sNombre_Grafico = rsNombre_Grafico ?? roObjeto._sNombre_Grafico;
    c._bVoltear_H      = roObjeto._bVoltear_H;
    c._bVoltear_V      = roObjeto._bVoltear_V;
    c.nMargen_izq      = roObjeto.nMargen_izq / 10;
    c.nMargen_der      = roObjeto.nMargen_der / 10;
    c.nMargen_sup      = roObjeto.nMargen_sup / 10;
    c.nMargen_inf      = roObjeto.nMargen_inf / 10;
    c._nGrados         = roObjeto._nGrados;
    return c;
  }

  // ── sNombre_Grafico (getter / setter) ────────────────────────────────────
  get sNombre_Grafico(): string | undefined { return this._sNombre_Grafico; }
  set sNombre_Grafico(v: string) { this._sNombre_Grafico = v; }

  // ── bVoltear_H? (getter / setter) ────────────────────────────────────────
  // Magik usa nombre `bVoltear_H?` — en TS se mapea a bVoltear_H.
  get bVoltear_H(): boolean { return this._bVoltear_H; }
  set bVoltear_H(v: boolean) { this._bVoltear_H = v; }

  // ── bVoltear_V? (getter / setter) ────────────────────────────────────────
  get bVoltear_V(): boolean { return this._bVoltear_V; }
  set bVoltear_V(v: boolean) { this._bVoltear_V = v; }

  // ── nGrados (getter / setter) ────────────────────────────────────────────
  get nGrados(): number { return this._nGrados; }
  set nGrados(v: number) { this._nGrados = v; }

  // ── grupo_estilos (getter / setter) ──────────────────────────────────────
  // Magik: slot :o_sty_view. Si vale :default → usa gpm.style_view global.
  get grupo_estilos(): GrupoEstilos { return this._o_sty_view; }
  set grupo_estilos(v: GrupoEstilos) { this._o_sty_view = v; }

  // ── init_with(props) ─────────────────────────────────────────────────────
  // Magik: _super.init_with(props) + asigna bVoltear_H/V desde props.
  init_with(props: SimboloGraficoProps): this {
    super.init_with(props);
    if (props.bVoltear_H      !== undefined) this._bVoltear_H      = props.bVoltear_H;
    if (props.bVoltear_V      !== undefined) this._bVoltear_V      = props.bVoltear_V;
    if (props.sNombre_Grafico !== undefined) this._sNombre_Grafico = props.sNombre_Grafico;
    if (props.nGrados         !== undefined) this._nGrados         = props.nGrados;
    if (props.grupo_estilos   !== undefined) this._o_sty_view      = props.grupo_estilos;
    return this;
  }

  // ── serial_slots() ───────────────────────────────────────────────────────
  // Magik: _super.serial_slots() + añade 5 claves (sNombre, voltear_H,
  // voltear_V, nGrados, grupo_estilos).
  override serial_slots(): { keys: string[]; values: unknown[] } {
    const base = super.serial_slots();
    base.keys.push('sNombre_grafico', 'bVoltear_H', 'bVoltear_V', 'nGrados', 'grupo_estilos');
    base.values.push(
      this._sNombre_Grafico,
      this._bVoltear_H,
      this._bVoltear_V,
      this._nGrados,
      this.grupo_estilos,
    );
    return base;
  }

  // ── Despliega() ──────────────────────────────────────────────────────────
  // Magik: resuelve sty_view (sigc o default), crea record temporal,
  // .symbol_name << ..., .realise(unset, unset), .draw_sample(ventana,
  // area, :rotate, :flipped?, :mirror?).
  // En TS: devuelve un descriptor "DrawCall" que la UI puede renderizar.
  Despliega(gpm: GisProgramManagerMock = GPM_MOCK): DrawCall | undefined {
    if (this._sNombre_Grafico === undefined || this.oArea === undefined) return undefined;

    const stySigc = gpm.databases.sigc_style_view;
    const useSigc = stySigc !== undefined && this._o_sty_view !== ':default';
    const sybTable = (useSigc ? stySigc! : gpm.style_view).collections['sw_gis!gis_point_style'];

    const rec = sybTable.new_detached_record();
    rec.symbol_name = this._sNombre_Grafico;
    rec.realise(undefined, undefined);
    rec.draw_sample(
      this.oVentana ?? { id: 'default' },
      this.oArea,
      { rotate: this._nGrados, flipped: this._bVoltear_H, mirror: this._bVoltear_V },
    );

    return {
      symbol_name: this._sNombre_Grafico,
      area:        this.oArea,
      ventana:     this.oVentana?.id ?? 'default',
      rotate:      this._nGrados,
      flipped:     this._bVoltear_H,
      mirror:      this._bVoltear_V,
      source:      useSigc ? 'sigc_style_view' : 'gpm.style_view (default)',
    };
  }
}

// Descriptor del draw_sample resuelto — útil para la UI.
export interface DrawCall {
  symbol_name: string;
  area:        Area;
  ventana:     string;
  rotate:      number;
  flipped:     boolean;
  mirror:      boolean;
  source:      string;
}

// =============================================================================
// Componente React — CSimboloGraficoUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    marginLeft: 4,
  } as React.CSSProperties,
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={styles.v}>{value}</span>
    </div>
  );
}

// SVG canónico por símbolo — equivale al draw_sample del catálogo.
function SymbolSVG({ name }: { name: string }) {
  const stroke = '#cba6f7';
  return (
    <svg width="100%" height="100%" viewBox="-18 -18 36 36">
      {name.includes('circle')   && <circle r={13} fill="none" stroke={stroke} strokeWidth={2} />}
      {name.includes('square')   && <rect x={-11} y={-11} width={22} height={22} fill="none" stroke={stroke} strokeWidth={2} />}
      {name.includes('triangle') && <polygon points="0,-14 12,9 -12,9" fill="none" stroke={stroke} strokeWidth={2} />}
      {name.includes('diamond')  && <polygon points="0,-14 14,0 0,14 -14,0" fill="none" stroke={stroke} strokeWidth={2} />}
      {name.includes('cross')    && (
        <>
          <line x1={-13} y1={0} x2={13} y2={0} stroke={stroke} strokeWidth={2} />
          <line x1={0}   y1={-13} x2={0} y2={13} stroke={stroke} strokeWidth={2} />
        </>
      )}
      {name.includes('arrow')    && <polygon points="0,-14 13,9 0,3 -13,9" fill={stroke} />}
      {name.includes('star')     && <polygon points="0,-14 4,-4 13,-4 6,2 9,12 0,6 -9,12 -6,2 -13,-4 -4,-4" fill={stroke} />}
      {name.includes('terminal') && (
        <>
          <circle r={12} fill="none" stroke={stroke} strokeWidth={2} />
          <line x1={-8} y1={-8} x2={8} y2={8} stroke={stroke} strokeWidth={2} />
          <line x1={8}  y1={-8} x2={-8} y2={8} stroke={stroke} strokeWidth={2} />
        </>
      )}
      {name.includes('hexagon')  && <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" fill="none" stroke={stroke} strokeWidth={2} />}
    </svg>
  );
}

export function CSimboloGraficoUI() {
  const [nombre,     setNombre]     = useState<SymbolName>('gis_point_arrow');
  const [voltearH,   setVoltearH]   = useState(false);
  const [voltearV,   setVoltearV]   = useState(false);
  const [grados,     setGrados]     = useState(0);
  const [grupo,      setGrupo]      = useState<GrupoEstilos>(undefined);

  // Crear/actualizar instancia con cada cambio
  const simbolo = useMemo(() => {
    const s = new CSimboloGrafico(nombre);
    s.oArea       = { xmin: 0, ymin: 0, xmax: 100, ymax: 100 };
    s.oVentana    = { id: 'demo-canvas' };
    s.bVoltear_H  = voltearH;
    s.bVoltear_V  = voltearV;
    s.nGrados     = grados;
    s.grupo_estilos = grupo;
    return s;
  }, [nombre, voltearH, voltearV, grados, grupo]);

  const drawCall = simbolo.Despliega();
  const { keys, values } = simbolo.serial_slots();

  // Demo de new_from con márgenes /10
  const copiaMargen = useMemo(() => {
    const proto = new CSimboloGrafico('gis_point_square');
    proto.nMargen_izq = 50; proto.nMargen_der = 50;
    proto.nMargen_sup = 50; proto.nMargen_inf = 50;
    proto.bVoltear_H  = true;
    proto.nGrados     = 45;
    return CSimboloGrafico.new_from(proto, 'gis_point_star');
  }, []);

  // CSS transform que replica rotate + flip
  const transform = useMemo(() => {
    const sx = voltearH ? -1 : 1;
    const sy = voltearV ? -1 : 1;
    return `rotate(${grados}deg) scale(${sx}, ${sy})`;
  }, [voltearH, voltearV, grados]);

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CSimboloGrafico</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          c_elemento_grafico → símbolo del catálogo gis_point_style
        </span>
      </div>

      {/* Controles */}
      <div style={styles.card}>
        <div style={styles.title}>new(RsNombre) · slots editables</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={styles.k}>sNombre_Grafico:</span>
            <select
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={styles.input}
            >
              {SYMBOL_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>
            <span style={styles.k}>nGrados:</span>
            <input
              type="number"
              value={grados}
              onChange={e => setGrados(Number(e.target.value))}
              style={{ ...styles.input, width: 70 }}
              step={15}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={voltearH}
              onChange={e => setVoltearH(e.target.checked)}
            />
            <span style={styles.k}> bVoltear_H?</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={voltearV}
              onChange={e => setVoltearV(e.target.checked)}
            />
            <span style={styles.k}> bVoltear_V?</span>
          </label>
          <label>
            <span style={styles.k}>grupo_estilos:</span>
            <select
              value={grupo ?? ''}
              onChange={e => setGrupo(e.target.value === '' ? undefined : e.target.value as GrupoEstilos)}
              style={styles.input}
            >
              <option value="">unset (usa sigc_style_view si existe)</option>
              <option value=":default">:default (gpm.style_view global)</option>
              <option value="sigc">sigc (vista nombrada)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Preview gráfico */}
      <div style={styles.card}>
        <div style={styles.title}>Despliega() — draw_sample(ventana, area, :rotate, :flipped?, :mirror?)</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: 180, height: 180, background: '#11111b',
            border: '1px solid #45475a', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 130, height: 130, transform, transformOrigin: 'center',
              transition: 'transform 0.25s ease-out',
            }}>
              <SymbolSVG name={nombre} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="draw.symbol_name"  value={drawCall?.symbol_name ?? '—'} />
            <Field label="draw.rotate"       value={`${drawCall?.rotate ?? 0}°`} />
            <Field label="draw.flipped (H)"  value={String(drawCall?.flipped ?? false)} />
            <Field label="draw.mirror  (V)"  value={String(drawCall?.mirror  ?? false)} />
            <Field label="draw.source"       value={drawCall?.source ?? '—'} />
            <Field label="draw.area"         value={drawCall ? `[${drawCall.area.xmin},${drawCall.area.ymin}]→[${drawCall.area.xmax},${drawCall.area.ymax}]` : '—'} />
            <Field label="draw.ventana"      value={drawCall?.ventana ?? '—'} />
          </div>
        </div>
      </div>

      {/* serial_slots() — herencia */}
      <div style={styles.card}>
        <div style={styles.title}>serial_slots() — super + 5 claves propias</div>
        {keys.map((k, i) => (
          <Field key={k} label={k} value={String(values[i] ?? '—')} />
        ))}
      </div>

      {/* new_from + reglas / 10 */}
      <div style={styles.card}>
        <div style={styles.title}>
          new_from(otro, nombre?) — copia con márgenes ÷ 10
          <span style={{ color: '#fab387', marginLeft: 8 }}>
            (bug histórico preservado — nota DSB 25/01/05)
          </span>
        </div>
        <Field label="origen.sNombre"  value="gis_point_square (margenes 50/50/50/50, voltear_H=true, 45°)" />
        <Field label="copia.sNombre"   value={copiaMargen.sNombre_Grafico ?? '—'} />
        <Field label="copia.bVoltear_H" value={String(copiaMargen.bVoltear_H)} />
        <Field label="copia.nGrados"   value={`${copiaMargen.nGrados}°`} />
        <Field
          label="copia.margenes"
          value={`izq=${copiaMargen.nMargen_izq}  der=${copiaMargen.nMargen_der}  sup=${copiaMargen.nMargen_sup}  inf=${copiaMargen.nMargen_inf}`}
        />
      </div>
    </div>
  );
}
