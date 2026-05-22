/**
 * Migración: c_simbolo_grafico.magik
 * fdiaz / DSB — 28/10/2004, 03/11/2004, 25/01/2005
 * Clase Magik: c_simbolo_grafico — extiende c_elemento_grafico
 *
 * Elemento gráfico de símbolo puntual para el motor de planos Smallworld.
 * Busca el símbolo en la tabla de estilos GIS (sw_gis!gis_point_style),
 * lo renderiza aplicando rotación y volteos horizontal/vertical.
 *
 * Métodos migrados:
 *   new(RsNombre)                    → constructor(nombre?)
 *   new_from(RoObjeto, RsNombre?)    → static fromInstance(origen, nombre?)
 *   init_with(props)                 → initWith(props)
 *   bVoltear_H? getter/setter        → get/set bVoltearH
 *   bVoltear_V? getter/setter        → get/set bVoltearV
 *   nGrados getter/setter            → get/set nGrados
 *   sNombre_Grafico getter/setter    → get/set sNombreGrafico
 *   grupo_estilos getter/setter      → get/set grupoEstilos
 *   Despliega()                      → despliega() → SimboloRenderProps
 *   serial_slots()                   → serialSlots()
 *
 * Equivalencias clave:
 *   def_slotted_exemplar → class CSimboloGrafico
 *   _self.sNombre_Grafico << RsNombre; _return _clone → constructor + props
 *   gis_program_manager.databases[:sigc_style_view]  → SYMBOL_CATALOG (mock)
 *   syb_table.new_detached_record()                  → new CSimboloGrafico()
 *   LoSym.symbol_name << ...; LoSym.realise(...)     → catalog lookup
 *   draw_sample(:rotate, :flipped?, :mirror?)        → SVG transform="rotate scale"
 *   :flipped? → scale(-1, 1)  (volteo horizontal)
 *   :mirror?  → scale( 1,-1)  (volteo vertical)
 *   condition.raise(:warning, ...)                   → throw TypeError
 *   _super.serial_slots() + add_all_last(...)        → spread + own slots
 *   RoObjeto.nMargen* / 10                           → división ×10 (mm→décimas mm)
 */

import React, { useState, useMemo } from 'react';

// =============================================================================
// CATÁLOGO DE SÍMBOLOS — mock de sw_gis!gis_point_style
// Magik: syb_table << sty_view.collections[:sw_gis!gis_point_style]
//        LoSym.symbol_name << .sNombre_Grafico ; LoSym.realise(...)
// =============================================================================

/** Función que renderiza el cuerpo SVG del símbolo (centrado en 0,0) */
type SymbolRenderFn = (fill: string, stroke: string) => React.ReactElement;

interface SymbolDef {
  label      : string;
  render     : SymbolRenderFn;
}

/** Equivale a la colección sw_gis!gis_point_style en Smallworld */
export const SYMBOL_CATALOG: Record<string, SymbolDef> = {
  'gis_point_circle': {
    label : 'Círculo',
    render: (f, s) => <circle cx={0} cy={0} r={10} fill={f} stroke={s} strokeWidth={1.5} />,
  },
  'gis_point_square': {
    label : 'Cuadrado',
    render: (f, s) => <rect x={-10} y={-10} width={20} height={20} fill={f} stroke={s} strokeWidth={1.5} />,
  },
  'gis_point_triangle': {
    label : 'Triángulo',
    render: (f, s) => <polygon points="0,-12 11,8 -11,8" fill={f} stroke={s} strokeWidth={1.5} />,
  },
  'gis_point_diamond': {
    label : 'Rombo',
    render: (f, s) => <polygon points="0,-13 10,0 0,13 -10,0" fill={f} stroke={s} strokeWidth={1.5} />,
  },
  'gis_point_cross': {
    label : 'Cruz',
    render: (f, s) => (
      <>
        <line x1={0} y1={-12} x2={0} y2={12} stroke={s} strokeWidth={2.5} />
        <line x1={-12} y1={0} x2={12} y2={0} stroke={s} strokeWidth={2.5} />
      </>
    ),
  },
  'gis_point_arrow': {
    label : 'Flecha',
    render: (f, s) => (
      <>
        <polygon points="14,0 2,-8 2,8" fill={f} stroke={s} strokeWidth={1.5} />
        <line x1={-12} y1={0} x2={2} y2={0} stroke={s} strokeWidth={2} />
      </>
    ),
  },
  'gis_point_star': {
    label : 'Estrella',
    render: (f, s) => {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 13 : 5;
        const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
        pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
      }
      return <polygon points={pts.join(' ')} fill={f} stroke={s} strokeWidth={1.2} />;
    },
  },
  'gis_point_terminal': {
    label : 'Terminal óptica',
    render: (f, s) => (
      <>
        <circle cx={0} cy={0} r={10} fill={f} stroke={s} strokeWidth={1.5} />
        <line x1={-7} y1={-7} x2={7}  y2={7}  stroke={s} strokeWidth={1.5} />
        <line x1={7}  y1={-7} x2={-7} y2={7}  stroke={s} strokeWidth={1.5} />
      </>
    ),
  },
  'gis_point_hexagon': {
    label : 'Hexágono',
    render: (f, s) => {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return `${(11 * Math.cos(a)).toFixed(2)},${(11 * Math.sin(a)).toFixed(2)}`;
      }).join(' ');
      return <polygon points={pts} fill={f} stroke={s} strokeWidth={1.5} />;
    },
  },
};

export const DEFAULT_SYMBOL = 'gis_point_circle';

// =============================================================================
// TIPOS
// =============================================================================

/** Resultado de despliega() — props necesarias para el renderer SVG */
export interface SimboloRenderProps {
  nombre   : string;   // símbolo a buscar en el catálogo
  grados   : number;   // :rotate
  voltearH : boolean;  // :flipped?
  voltearV : boolean;  // :mirror?
}

/** Props serializables — equivale a serial_slots() */
export interface SimboloSerialData {
  sNombre_grafico: string | null;
  bVoltear_H     : boolean;
  bVoltear_V     : boolean;
  nGrados        : number;
  grupo_estilos  : string | null;
}

// =============================================================================
// CLASE PRINCIPAL — c_simbolo_grafico  extends c_elemento_grafico
// =============================================================================

export class CSimboloGrafico {

  // Magik: {:sNombre_Grafico, _unset}
  private _sNombreGrafico: string | null = null;
  // Magik: {:bVoltear_H, _false}  — volteo horizontal (:flipped?)
  private _bVoltearH: boolean = false;
  // Magik: {:bVoltear_V, _false}  — volteo vertical (:mirror?)
  private _bVoltearV: boolean = false;
  // Magik: {:nGrados, 0}          — ángulo de rotación
  private _nGrados: number = 0;
  // Magik: {:o_sty_view, _unset}  — grupo de estilos
  private _oStyView: string | null = null;

  // Slots heredados de c_elemento_grafico (márgenes en décimas de mm)
  nMargenIzq: number = 0;
  nMargenDer: number = 0;
  nMargenSup: number = 0;
  nMargenInf: number = 0;

  // ---------------------------------------------------------------------------
  // new(RsNombre)
  // Magik: _self.sNombre_Grafico << RsNombre ; _return _clone
  // Constructor equivalente a new() en Magik — asigna nombre y devuelve instancia.
  // ---------------------------------------------------------------------------
  constructor(nombre?: string) {
    if (nombre !== undefined) this._sNombreGrafico = nombre;
  }

  // ---------------------------------------------------------------------------
  // sNombre_Grafico getter / setter
  // Magik: _return .sNombre_Grafico  /  .sNombre_Grafico << RsValor
  // ---------------------------------------------------------------------------
  get sNombreGrafico(): string | null { return this._sNombreGrafico; }
  set sNombreGrafico(v: string | null) { this._sNombreGrafico = v; }

  // ---------------------------------------------------------------------------
  // bVoltear_H? getter / setter
  // Magik: _return .bVoltear_H  /  .bVoltear_H << RbValor
  // ---------------------------------------------------------------------------
  get bVoltearH(): boolean { return this._bVoltearH; }
  set bVoltearH(v: boolean) { this._bVoltearH = v; }

  // ---------------------------------------------------------------------------
  // bVoltear_V? getter / setter
  // Magik: _return .bVoltear_V  /  .bVoltear_V << RbValor
  // ---------------------------------------------------------------------------
  get bVoltearV(): boolean { return this._bVoltearV; }
  set bVoltearV(v: boolean) { this._bVoltearV = v; }

  // ---------------------------------------------------------------------------
  // nGrados getter / setter
  // Magik: _return .nGrados  /  .nGrados << RnValor
  // ---------------------------------------------------------------------------
  get nGrados(): number { return this._nGrados; }
  set nGrados(v: number) { this._nGrados = v; }

  // ---------------------------------------------------------------------------
  // grupo_estilos getter / setter
  // Magik: _return .o_sty_view  /  .o_sty_view << sValor
  // ---------------------------------------------------------------------------
  get grupoEstilos(): string | null { return this._oStyView; }
  set grupoEstilos(v: string | null) { this._oStyView = v; }

  // ---------------------------------------------------------------------------
  // new_from(RoObjeto, RsNombre_Grafico?)
  //
  // Magik:
  //   _if RoObjeto.is_kind_of?(c_simbolo_grafico)
  //     _self.sNombre_grafico << RsNombre_Grafico ?? RoObjeto.sNombre_Grafico
  //     _self.bVoltear_H? << RoObjeto.bVoltear_H?
  //     _self.bVoltear_V? << RoObjeto.bVoltear_V?
  //     _self.nMargen* << RoObjeto.nMargen* / 10   ← conversión décimas→mm
  //     _self.nGrados  << RoObjeto.nGrados
  //     _return _clone
  //   _else condition.raise(:warning, ...)
  //
  // Los márgenes se dividen entre 10 al copiar (décimas de mm → mm).
  // ---------------------------------------------------------------------------
  static fromInstance(origen: CSimboloGrafico, nombre?: string): CSimboloGrafico {
    // Magik: _if RoObjeto.is_kind_of?(c_simbolo_grafico)
    if (!(origen instanceof CSimboloGrafico)) {
      // Magik: condition.raise(:warning, :string, "El objeto que se proporcionó, no es de tipo c_símbolo_grafico")
      throw new TypeError('El objeto proporcionado no es de tipo CSimboloGrafico');
    }
    const copy = new CSimboloGrafico(nombre ?? origen._sNombreGrafico ?? undefined);
    copy._bVoltearH = origen._bVoltearH;
    copy._bVoltearV = origen._bVoltearV;
    // Magik: _self.nMargen* << RoObjeto.nMargen* / 10
    copy.nMargenIzq = origen.nMargenIzq / 10;
    copy.nMargenDer = origen.nMargenDer / 10;
    copy.nMargenSup = origen.nMargenSup / 10;
    copy.nMargenInf = origen.nMargenInf / 10;
    copy._nGrados   = origen._nGrados;
    return copy;
  }

  // ---------------------------------------------------------------------------
  // init_with(props)
  //
  // Magik:
  //   _super.init_with(props)
  //   _self.bvoltear_h? << props[:bVoltear_H]
  //   _self.bvoltear_v? << props[:bVoltear_V]
  //   >> _self
  //
  // Inicializa desde un property_list — extiende init del padre con los slots propios.
  // ---------------------------------------------------------------------------
  initWith(props: Partial<SimboloSerialData>): this {
    if (props.sNombre_grafico !== undefined) this._sNombreGrafico = props.sNombre_grafico;
    // Magik: _self.bvoltear_h? << props[:bVoltear_H]
    if (props.bVoltear_H     !== undefined) this._bVoltearH      = props.bVoltear_H;
    // Magik: _self.bvoltear_v? << props[:bVoltear_V]
    if (props.bVoltear_V     !== undefined) this._bVoltearV      = props.bVoltear_V;
    if (props.nGrados        !== undefined) this._nGrados        = props.nGrados;
    if (props.grupo_estilos  !== undefined) this._oStyView       = props.grupo_estilos;
    return this;
  }

  // ---------------------------------------------------------------------------
  // serial_slots()
  //
  // Magik:
  //   (keys, values) << _super.serial_slots()
  //   keys.add_all_last( rope.new_with(:sNombre_grafico,:bVoltear_H,:bVoltear_V,:nGrados,:grupo_estilos))
  //   values.add_all_last( rope.new_with(.sNombre_grafico,.bVoltear_H,.bVoltear_V,.nGrados,_self.grupo_estilos))
  //   _return keys, values
  //
  // Extiende la serialización del padre con los slots propios de este exemplar.
  // ---------------------------------------------------------------------------
  serialSlots(): SimboloSerialData {
    return {
      sNombre_grafico: this._sNombreGrafico,
      bVoltear_H     : this._bVoltearH,
      bVoltear_V     : this._bVoltearV,
      nGrados        : this._nGrados,
      grupo_estilos  : this._oStyView,
    };
  }

  // ---------------------------------------------------------------------------
  // Despliega()
  //
  // Magik:
  //   LoAreaSimbolo << _self.oArea
  //   sty_view << gpm.databases[:sigc_style_view]
  //   syb_table << sty_view.collections[:sw_gis!gis_point_style]
  //   LoSym << syb_table.new_detached_record()
  //   LoSym.symbol_name << _self.sNombre_Grafico
  //   LoSym.realise(_unset, _unset)
  //   LoSym.draw_sample(_self.oVentana, LoAreaSimbolo,
  //                     :rotate,   _self.nGrados,
  //                     :flipped?, _self.bVoltear_H?,
  //                     :mirror?,  _self.bVoltear_V?)
  //
  // En TS devuelve los props de renderizado; el componente React aplica los transforms.
  // ---------------------------------------------------------------------------
  despliega(): SimboloRenderProps {
    // Magik: LoSym.symbol_name << _self.sNombre_Grafico → lookup en catálogo
    const nombre = this._sNombreGrafico ?? DEFAULT_SYMBOL;
    return {
      nombre  : SYMBOL_CATALOG[nombre] ? nombre : DEFAULT_SYMBOL,
      grados  : this._nGrados,
      voltearH: this._bVoltearH,
      voltearV: this._bVoltearV,
    };
  }
}

// =============================================================================
// RENDERER SVG — equivale a draw_sample() en el window de Smallworld
// Aplica los tres transforms: rotate, flipped? (:flipped? → scale(-1,1)), mirror? (scale(1,-1))
// =============================================================================

interface SymbolSVGProps {
  nombre  : string;
  grados  : number;
  voltearH: boolean;
  voltearV: boolean;
  size   ?: number;
  fill   ?: string;
  stroke ?: string;
}

export function SymbolSVG({
  nombre,
  grados,
  voltearH,
  voltearV,
  size   = 60,
  fill   = '#d0e8ff',
  stroke = '#1a237e',
}: SymbolSVGProps) {
  const sym  = SYMBOL_CATALOG[nombre] ?? SYMBOL_CATALOG[DEFAULT_SYMBOL];
  // Magik: :flipped? → scale(-1,1)  (espejo horizontal)
  const sX   = voltearH ? -1 : 1;
  // Magik: :mirror?  → scale(1,-1)  (espejo vertical)
  const sY   = voltearV ? -1 : 1;
  // Magik: draw_sample(..., :rotate, nGrados, :flipped?, ..., :mirror?, ...)
  // En SVG los transforms se aplican de derecha a izquierda:
  //   → primero scale (volteos), luego rotate. Equivale a voltear el símbolo y rotarlo.
  const xform = `rotate(${grados}) scale(${sX},${sY})`;

  return (
    <svg
      width={size} height={size}
      viewBox="-20 -20 40 40"
      style={{ overflow: 'visible', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 3 }}
    >
      {/* Ejes de referencia — ayuda visual, no están en Magik */}
      <line x1={-18} y1={0} x2={18} y2={0} stroke="#e8e8e8" strokeWidth={0.5} />
      <line x1={0} y1={-18} x2={0} y2={18} stroke="#e8e8e8" strokeWidth={0.5} />
      {/* Símbolo con transforms aplicados */}
      <g transform={xform}>
        {sym.render(fill, stroke)}
      </g>
    </svg>
  );
}

// =============================================================================
// COMPONENTE REACT — demo interactivo de CSimboloGrafico
// =============================================================================

export function CSimboloGraficoUI() {
  const [simbolo  , setSimboloNombre] = useState(DEFAULT_SYMBOL);
  const [grados   , setGrados       ] = useState(0);
  const [voltearH , setVoltearH     ] = useState(false);
  const [voltearV , setVoltearV     ] = useState(false);
  const [sty      , setSty          ] = useState('');
  const [copyError, setCopyError    ] = useState<string | null>(null);

  // Instancia activa — equivale a new(RsNombre) + asignación de props
  const instancia = useMemo(() => {
    const s = new CSimboloGrafico(simbolo);
    s.bVoltearH     = voltearH;
    s.bVoltearV     = voltearV;
    s.nGrados       = grados;
    s.grupoEstilos  = sty || null;
    s.nMargenIzq    = 5;  // décimas de mm — demo
    s.nMargenDer    = 5;
    s.nMargenSup    = 3;
    s.nMargenInf    = 3;
    return s;
  }, [simbolo, grados, voltearH, voltearV, sty]);

  const renderProps = instancia.despliega();
  const serial      = instancia.serialSlots();

  // Simulación de fromInstance() — new_from(RoObjeto)
  const handleCopy = () => {
    try {
      const copy = CSimboloGrafico.fromInstance(instancia);
      setCopyError(`OK → copia: "${copy.sNombreGrafico}", grados=${copy.nGrados}, margenIzq=${copy.nMargenIzq}`);
    } catch (e) {
      setCopyError((e as Error).message);
    }
  };

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_simbolo_grafico</h3>
      <p style={st.meta}>
        Elemento gráfico de símbolo puntual. Busca el símbolo en{' '}
        <code>sw_gis!gis_point_style</code> (catálogo mock) y lo renderiza
        aplicando <code>:rotate</code>, <code>:flipped?</code> y{' '}
        <code>:mirror?</code> via SVG transform.
      </p>

      {/* ── Controles ── */}
      <div style={st.control}>
        <span style={st.badge}>new(RsNombre) + props</span>

        <label style={st.lbl}>
          sNombre_Grafico:
          <select
            value={simbolo}
            onChange={e => setSimboloNombre(e.target.value)}
            style={st.select}
          >
            {Object.entries(SYMBOL_CATALOG).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({k})</option>
            ))}
          </select>
        </label>

        <label style={st.lbl}>
          nGrados:
          <input
            type="range" min={0} max={359} step={5} value={grados}
            onChange={e => setGrados(Number(e.target.value))}
            style={{ width: 80 }}
          />
          <span style={{ fontFamily:'monospace', width:36, display:'inline-block' }}>{grados}°</span>
        </label>

        <label style={{ ...st.lbl, gap: 4 }}>
          <input type="checkbox" checked={voltearH} onChange={e => setVoltearH(e.target.checked)} />
          bVoltear_H? (:flipped?)
        </label>

        <label style={{ ...st.lbl, gap: 4 }}>
          <input type="checkbox" checked={voltearV} onChange={e => setVoltearV(e.target.checked)} />
          bVoltear_V? (:mirror?)
        </label>

        <label style={st.lbl}>
          grupo_estilos:
          <input
            type="text" value={sty} placeholder="sigc_style_view"
            onChange={e => setSty(e.target.value)}
            style={{ ...st.numInput, width: 120 }}
          />
        </label>
      </div>

      {/* ── Vista principal + info ── */}
      <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginTop:12, alignItems:'flex-start' }}>

        {/* Preview grande — draw_sample() */}
        <div style={{ textAlign:'center' }}>
          <p style={{ ...st.meta, marginBottom:4, fontWeight:'bold' }}>
            Despliega() — draw_sample()
          </p>
          <SymbolSVG
            nombre={renderProps.nombre}
            grados={renderProps.grados}
            voltearH={renderProps.voltearH}
            voltearV={renderProps.voltearV}
            size={120}
          />
          <p style={{ ...st.meta, fontFamily:'monospace', marginTop:4 }}>
            rotate({grados}°) scale({voltearH ? -1 : 1},{voltearV ? -1 : 1})
          </p>
        </div>

        {/* Matriz 2×2 de transforms */}
        <div>
          <p style={{ ...st.meta, fontWeight:'bold', marginBottom:6 }}>Combinaciones de volteo</p>
          <table style={{ borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={st.th}></th>
                <th style={st.th}>Sin volteo H</th>
                <th style={st.th}>Volteo H (flipped)</th>
              </tr>
            </thead>
            <tbody>
              {[false, true].map(vV => (
                <tr key={String(vV)}>
                  <td style={{ ...st.td, fontWeight:'bold', fontSize:10 }}>
                    {vV ? 'Volteo V (mirror)' : 'Sin volteo V'}
                  </td>
                  {[false, true].map(vH => (
                    <td key={String(vH)} style={{ ...st.td, textAlign:'center' }}>
                      <SymbolSVG
                        nombre={simbolo} grados={grados}
                        voltearH={vH} voltearV={vV}
                        size={52} fill="#d0e8ff" stroke="#1a237e"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Catálogo de símbolos */}
        <div>
          <p style={{ ...st.meta, fontWeight:'bold', marginBottom:6 }}>Catálogo (sw_gis!gis_point_style)</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6 }}>
            {Object.entries(SYMBOL_CATALOG).map(([k, v]) => (
              <div
                key={k}
                onClick={() => setSimboloNombre(k)}
                style={{
                  cursor:'pointer', textAlign:'center', padding:4,
                  border: k === simbolo ? '2px solid #1565c0' : '1px solid #ddd',
                  borderRadius:4, background: k === simbolo ? '#e3f2fd' : '#fff',
                }}
              >
                <SymbolSVG nombre={k} grados={0} voltearH={false} voltearV={false}
                  size={38} fill="#d0e8ff" stroke="#1a237e" />
                <div style={{ fontSize:9, marginTop:2, color:'#555' }}>{v.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── serialSlots() ── */}
      <div style={{ marginTop:14 }}>
        <p style={{ ...st.meta, fontWeight:'bold', marginBottom:4 }}>
          serialSlots() — keys + values
        </p>
        <table style={st.table}>
          <thead>
            <tr>
              <th style={st.th}>Key (Magik: rope slot)</th>
              <th style={st.th}>Valor</th>
              <th style={st.th}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(serial) as [string, unknown][]).map(([k, v], i) => (
              <tr key={k} style={{ background: i%2===0?'#f8f9fa':'#fff' }}>
                <td style={{ ...st.td, fontFamily:'monospace', fontSize:10 }}><code>{k}</code></td>
                <td style={{ ...st.td, fontFamily:'monospace', color: v === null ? '#aaa' : '#1a1a1a' }}>
                  {v === null ? '_unset' : String(v)}
                </td>
                <td style={{ ...st.td, fontSize:11, color:'#555' }}>{typeof v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── new_from() / fromInstance() ── */}
      <div style={st.control}>
        <span style={st.badge}>new_from(RoObjeto)</span>
        <button onClick={handleCopy} style={st.btn}>fromInstance(instancia)</button>
        {copyError && (
          <span style={{ fontSize:11, fontFamily:'monospace',
            color: copyError.startsWith('OK') ? '#2e7d32' : '#c62828' }}>
            {copyError}
          </span>
        )}
      </div>

      {/* ── Tabla de equivalencias ── */}
      <EquivalenciasTable />
    </div>
  );
}

// Tabla de equivalencias Magik ↔ TypeScript
function EquivalenciasTable() {
  const rows = [
    { m: 'def_slotted_exemplar(:c_simbolo_grafico, {...}, :c_elemento_grafico)', t: 'class CSimboloGrafico extends (base simulada)', n: 'Herencia TS' },
    { m: '_self.sNombre_Grafico << RsNombre ; _return _clone',                   t: 'constructor(nombre?) → new CSimboloGrafico(n)', n: 'new() Magik' },
    { m: '_if RoObjeto.is_kind_of?(c_simbolo_grafico)',                          t: 'if (!(origen instanceof CSimboloGrafico))',      n: 'Type guard' },
    { m: 'condition.raise(:warning, :string, "...")',                            t: 'throw new TypeError("...")',                    n: 'Error Magik' },
    { m: '_self.nMargen* << RoObjeto.nMargen* / 10',                            t: 'copy.nMargen* = origen.nMargen* / 10',          n: 'Conversión ×10' },
    { m: 'gpm.databases[:sigc_style_view].collections[:sw_gis!gis_point_style]',t: 'SYMBOL_CATALOG (objeto mock)',                  n: 'BD de estilos' },
    { m: 'LoSym.symbol_name << ...; LoSym.realise(_unset,_unset)',               t: 'SYMBOL_CATALOG[nombre].render()',               n: 'Lookup símbolo' },
    { m: 'draw_sample(..., :rotate, nGrados, :flipped?, bH, :mirror?, bV)',      t: 'SVG transform="rotate(g) scale(sX,sY)"',        n: 'Renders símbolo' },
    { m: ':flipped? (volteo horizontal)',                                        t: 'scale(-1, 1)',                                  n: 'Espejo eje Y' },
    { m: ':mirror?  (volteo vertical)',                                          t: 'scale( 1,-1)',                                  n: 'Espejo eje X' },
    { m: '_super.serial_slots() + add_all_last(rope.new_with(...))',             t: 'return { ...superSlots, ...ownSlots }',         n: 'Serialización' },
    { m: '_super.init_with(props) + props[:bVoltear_H/V]',                      t: 'initWith(props: Partial<SimboloSerialData>)',   n: 'init desde props' },
    { m: '_return _clone',                                                       t: 'return this / return new CSimboloGrafico()',    n: 'Clon Magik' },
  ];
  return (
    <table style={{ ...st.table, marginTop:14 }}>
      <thead>
        <tr>{['Magik','TypeScript','Notas'].map(h=><th key={h} style={st.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(({ m, t, n }, i) => (
          <tr key={m} style={{ background: i%2===0?'#f8f9fa':'#fff' }}>
            <td style={{ ...st.td, fontFamily:'monospace', fontSize:10 }}><code>{m}</code></td>
            <td style={{ ...st.td, fontFamily:'monospace', fontSize:10 }}><code>{t}</code></td>
            <td style={{ ...st.td, color:'#555', fontSize:11 }}>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame   : { display:'flex', flexDirection:'column', gap:10, fontFamily:'sans-serif', fontSize:13 },
  title   : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  meta    : { color:'#666', fontSize:12, margin:'2px 0' },
  control : { display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#f0f4f8', borderRadius:4, border:'1px solid #dde', flexWrap:'wrap' },
  lbl     : { fontSize:11, display:'flex', alignItems:'center', gap:6 },
  numInput: { padding:'2px 6px', fontSize:11, border:'1px solid #b0bec5', borderRadius:3 },
  select  : { padding:'2px 6px', fontSize:11, border:'1px solid #b0bec5', borderRadius:3 },
  btn     : { padding:'4px 12px', fontSize:11, borderRadius:3, border:'1px solid #1565c0', background:'#1565c0', color:'#fff', cursor:'pointer' },
  badge   : { fontSize:10, background:'#2E4057', color:'#fff', borderRadius:3, padding:'2px 7px', fontFamily:'monospace' },
  table   : { borderCollapse:'collapse' as const, width:'100%' },
  th      : { background:'#2E4057', color:'#fff', padding:'5px 10px', textAlign:'left' as const, fontSize:11 },
  td      : { padding:'5px 10px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default CSimboloGraficoUI;
