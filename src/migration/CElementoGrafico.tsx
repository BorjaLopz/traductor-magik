// =============================================================================
// MIGRACIÓN: c_elemento_grafico  →  CElementoGrafico.tsx
// Jerarquía Magik: c_elemento_grafico  (base de c_texto_grafico, c_simbolo_grafico,
//                                       c_linea_grafico, c_celda, …)
// Fuente: adiciones_layout/source/Sellos/Utilerias/c_elemento_grafico.magik
// Autor original: fdiaz · 2004-10
// =============================================================================
//
// Clase base de todos los elementos gráficos de layout.
// Modela un área (bounding_box) con cuatro márgenes.
//
// INVARIANTE ×10: los setters de márgenes almacenan RnValor × 10 internamente.
// El getter devuelve el valor interno (×10). serial_slots() divide por 10
// para restaurar las unidades externas. initWith() usa los setters → acepta
// unidades externas.
//
// GIS omitido: oVentana (canvas Smallworld) se tipifica como unknown.
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface BBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export type ElementoProps = Partial<{
  oArea:       BBox;
  nMargen_Sup: number;
  nMargen_Inf: number;
  nMargen_Izq: number;
  nMargen_Der: number;
}>;

// ---------------------------------------------------------------------------
// Clase principal: c_elemento_grafico
// ---------------------------------------------------------------------------

export class CElementoGrafico {
  // Todos los slots son private (define_slot_access :writable, :private)
  private _oVentana:   unknown;
  private _oArea:      BBox | undefined;
  private _nMargenSup: number;
  private _nMargenInf: number;
  private _nMargenIzq: number;
  private _nMargenDer: number;

  constructor() {
    this._oVentana   = undefined;
    this._oArea      = undefined;
    this._nMargenSup = 0;
    this._nMargenInf = 0;
    this._nMargenIzq = 0;
    this._nMargenDer = 0;
  }

  // ── oVentana ──────────────────────────────────────────────────────────────
  get oVentana(): unknown  { return this._oVentana; }
  set oVentana(v: unknown) { this._oVentana = v; }

  // ── oArea ─────────────────────────────────────────────────────────────────
  get oArea(): BBox | undefined    { return this._oArea; }
  set oArea(v: BBox | undefined)   { this._oArea = v; }

  // ── Márgenes: setters multiplican × 10 (invariante del fuente Magik) ──────
  get nMargenSup(): number    { return this._nMargenSup; }
  set nMargenSup(v: number)   { this._nMargenSup = v * 10; }

  get nMargenInf(): number    { return this._nMargenInf; }
  set nMargenInf(v: number)   { this._nMargenInf = v * 10; }

  get nMargenIzq(): number    { return this._nMargenIzq; }
  set nMargenIzq(v: number)   { this._nMargenIzq = v * 10; }

  get nMargenDer(): number    { return this._nMargenDer; }
  set nMargenDer(v: number)   { this._nMargenDer = v * 10; }

  // ── actualizaAreaElemento — encoge el área aplicando los márgenes ─────────
  actualizaAreaElemento(): void {
    if (!this._oArea) return;
    this._oArea = {
      xMin: this._oArea.xMin + this._nMargenIzq,
      yMin: this._oArea.yMin + this._nMargenInf,
      xMax: this._oArea.xMax - this._nMargenDer,
      yMax: this._oArea.yMax - this._nMargenSup,
    };
  }

  // ── despliega — template method, override en subclases ────────────────────
  despliega(): void { /* override */ }

  // ── newFrom — copy constructor vacío, override en subclases ──────────────
  newFrom(_source: CElementoGrafico): this { return this; }

  // ── initWith — asignación masiva desde property_list (Magik: perform_private(key<<, val))
  // Acepta unidades EXTERNAS (los setters aplican el × 10 internamente)
  initWith(props: Map<string, unknown>): this {
    const setters: Record<string, (v: unknown) => void> = {
      oArea:       (v) => { this.oArea      = v as BBox | undefined; },
      nMargen_Sup: (v) => { this.nMargenSup = Number(v); },
      nMargen_Inf: (v) => { this.nMargenInf = Number(v); },
      nMargen_Izq: (v) => { this.nMargenIzq = Number(v); },
      nMargen_Der: (v) => { this.nMargenDer = Number(v); },
    };
    for (const [key, value] of props) {
      setters[key]?.(value);
    }
    return this;
  }

  // ── newFromSerial — deserialización XML (Magik: _clone.init_with(props)) ──
  static newFromSerial(keys: string[], xmlValues: unknown[]): CElementoGrafico {
    const props = new Map<string, unknown>(keys.map((k, i) => [k, xmlValues[i]]));
    return new CElementoGrafico().initWith(props);
  }

  // ── serialSlots — serialización: devuelve márgenes divididos /10 ──────────
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys: ['oArea', 'nMargen_Sup', 'nMargen_Inf', 'nMargen_Izq', 'nMargen_Der'],
      values: [
        this._oArea,
        this._nMargenSup / 10,
        this._nMargenInf / 10,
        this._nMargenIzq / 10,
        this._nMargenDer / 10,
      ],
    };
  }

  // ── serialStructure — estrategia de serialización Magik (:slotted) ────────
  get serialStructure(): 'slotted' { return 'slotted'; }
}

// =============================================================================
// Componente React — CElementoGraficoUI
// =============================================================================

const S = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 720,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a',
    borderRadius: 6, padding: 12, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '160px 1fr',
    gap: 4, padding: '2px 0', fontSize: 11,
  } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  vMut:  { color: '#f9e2af' } as React.CSSProperties,
  label: { color: '#cba6f7', fontSize: 11, marginBottom: 2, display: 'block' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

function KV({ k, v, mut }: { k: string; v: React.ReactNode; mut?: boolean }) {
  return (
    <div style={S.row}>
      <span style={S.k}>{k}</span>
      <span style={mut ? S.vMut : S.v}>{String(v)}</span>
    </div>
  );
}

function NumInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={S.label}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

// SVG: muestra área original y área reducida por márgenes
function AreaSVG({
  original, reduced,
  mSup, mInf, mIzq, mDer,
}: {
  original: BBox; reduced: BBox;
  mSup: number; mInf: number; mIzq: number; mDer: number;
}) {
  const PAD   = 24;
  const SCALE = 0.85;
  const ox = original.xMin * SCALE + PAD;
  const oy = original.yMin * SCALE + PAD;
  const ow = (original.xMax - original.xMin) * SCALE;
  const oh = (original.yMax - original.yMin) * SCALE;

  const rx = reduced.xMin * SCALE + PAD;
  const ry = reduced.yMin * SCALE + PAD;
  const rw = (reduced.xMax - reduced.xMin) * SCALE;
  const rh = (reduced.yMax - reduced.yMin) * SCALE;

  const svgW = (original.xMax - original.xMin) * SCALE + PAD * 2;
  const svgH = (original.yMax - original.yMin) * SCALE + PAD * 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display: 'block', background: '#11111b', borderRadius: 6 }}
    >
      {/* Área original */}
      <rect x={ox} y={oy} width={ow} height={oh}
        fill="none" stroke="#45475a" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={ox + 3} y={oy + 11} fontSize={8} fill="#45475a">área original</text>

      {/* Área reducida */}
      {rw > 0 && rh > 0 && (
        <rect x={rx} y={ry} width={rw} height={rh}
          fill="#89dceb18" stroke="#89dceb" strokeWidth={1.5} />
      )}
      {rw <= 0 || rh <= 0 ? (
        <text x={ox + ow / 2} y={oy + oh / 2} fontSize={9} fill="#f38ba8"
          textAnchor="middle" dominantBaseline="middle">
          área colapsada (márgenes exceden dimensiones)
        </text>
      ) : null}

      {/* Flechas de margen Superior */}
      {mSup !== 0 && (
        <>
          <line x1={rx + rw / 2} y1={oy} x2={rx + rw / 2} y2={ry}
            stroke="#fab387" strokeWidth={1} markerEnd="url(#arr)" />
          <text x={rx + rw / 2 + 3} y={(oy + ry) / 2} fontSize={7} fill="#fab387">
            Sup={mSup}→{mSup * 10}
          </text>
        </>
      )}
      {/* Margen Inferior */}
      {mInf !== 0 && (
        <>
          <line x1={rx + rw / 2} y1={oy + oh} x2={rx + rw / 2} y2={ry + rh}
            stroke="#fab387" strokeWidth={1} />
          <text x={rx + rw / 2 + 3} y={(oy + oh + ry + rh) / 2} fontSize={7} fill="#fab387">
            Inf={mInf}→{mInf * 10}
          </text>
        </>
      )}
      {/* Margen Izquierdo */}
      {mIzq !== 0 && (
        <>
          <line x1={ox} y1={ry + rh / 2} x2={rx} y2={ry + rh / 2}
            stroke="#a6e3a1" strokeWidth={1} />
          <text x={(ox + rx) / 2} y={ry + rh / 2 - 3} fontSize={7} fill="#a6e3a1">
            Izq={mIzq}→{mIzq * 10}
          </text>
        </>
      )}
      {/* Margen Derecho */}
      {mDer !== 0 && (
        <>
          <line x1={ox + ow} y1={ry + rh / 2} x2={rx + rw} y2={ry + rh / 2}
            stroke="#a6e3a1" strokeWidth={1} />
          <text x={(ox + ow + rx + rw) / 2} y={ry + rh / 2 - 3} fontSize={7} fill="#a6e3a1">
            Der={mDer}→{mDer * 10}
          </text>
        </>
      )}

      {/* Coordenadas */}
      <text x={ox}      y={oy - 4}       fontSize={7} fill="#585b70">{`(${original.xMin},${original.yMin})`}</text>
      <text x={ox + ow} y={oy + oh + 10} fontSize={7} fill="#585b70" textAnchor="end">{`(${original.xMax},${original.yMax})`}</text>
      {rw > 0 && rh > 0 && (
        <>
          <text x={rx}      y={ry + 9}       fontSize={7} fill="#89dceb">{`(${reduced.xMin.toFixed(0)},${reduced.yMin.toFixed(0)})`}</text>
          <text x={rx + rw} y={ry + rh - 3}  fontSize={7} fill="#89dceb" textAnchor="end">{`(${reduced.xMax.toFixed(0)},${reduced.yMax.toFixed(0)})`}</text>
        </>
      )}
    </svg>
  );
}

export function CElementoGraficoUI() {
  // Área
  const [xMin, setXMin] = useState('20');
  const [yMin, setYMin] = useState('20');
  const [xMax, setXMax] = useState('280');
  const [yMax, setYMax] = useState('200');

  // Márgenes (en unidades externas — los setters los multiplican × 10)
  const [mSup, setMSup] = useState('5');
  const [mInf, setMInf] = useState('3');
  const [mIzq, setMIzq] = useState('8');
  const [mDer, setMDer] = useState('4');

  const area: BBox = {
    xMin: parseFloat(xMin) || 0,
    yMin: parseFloat(yMin) || 0,
    xMax: parseFloat(xMax) || 0,
    yMax: parseFloat(yMax) || 0,
  };
  const ms = parseFloat(mSup) || 0;
  const mi = parseFloat(mInf) || 0;
  const mz = parseFloat(mIzq) || 0;
  const md = parseFloat(mDer) || 0;

  const { reduced, slots } = useMemo(() => {
    const e = new CElementoGrafico();
    e.oArea      = { ...area };
    e.nMargenSup = ms;
    e.nMargenInf = mi;
    e.nMargenIzq = mz;
    e.nMargenDer = md;
    e.actualizaAreaElemento();
    const r = e.oArea ?? area;
    const s = e.serialSlots();
    return { reduced: r, slots: s };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.xMin, area.yMin, area.xMax, area.yMax, ms, mi, mz, md]);

  // initWith round-trip
  const initWithResult = useMemo(() => {
    const props = new Map<string, unknown>([
      ['oArea',       { ...area }],
      ['nMargen_Sup', ms],
      ['nMargen_Inf', mi],
      ['nMargen_Izq', mz],
      ['nMargen_Der', md],
    ]);
    const e2 = new CElementoGrafico().initWith(props);
    return {
      sup: e2.nMargenSup,
      inf: e2.nMargenInf,
      izq: e2.nMargenIzq,
      der: e2.nMargenDer,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.xMin, area.yMin, area.xMax, area.yMax, ms, mi, mz, md]);

  // newFromSerial round-trip
  const serialResult = useMemo(() => {
    const { keys, values } = slots;
    const e3 = CElementoGrafico.newFromSerial(keys, values);
    return {
      sup: e3.nMargenSup,
      inf: e3.nMargenInf,
      izq: e3.nMargenIzq,
      der: e3.nMargenDer,
    };
  }, [slots]);

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CElementoGrafico</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          clase base de todos los elementos gráficos de layout · fdiaz 2004
        </span>
      </div>

      {/* Jerarquía de herederos */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#585b70' }}>
          <span style={{ color: '#cba6f7', fontWeight: 'bold' }}>CElementoGrafico</span>
          {' '}→{' '}
          {['c_texto_grafico', 'c_simbolo_grafico', 'c_linea_grafico', 'c_celda', 'c_imagen_bmp', '…'].map(c => (
            <span key={c} style={{
              marginRight: 6, padding: '1px 6px', borderRadius: 4,
              border: '1px solid #313244', color: '#89dceb',
            }}>{c}</span>
          ))}
        </div>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo: controles */}
        <div>
          <div style={S.card}>
            <div style={S.title}>oArea  ·  bounding_box inicial</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <NumInput label="xMin" value={xMin} onChange={setXMin} />
              <NumInput label="yMin" value={yMin} onChange={setYMin} />
              <NumInput label="xMax" value={xMax} onChange={setXMax} />
              <NumInput label="yMax" value={yMax} onChange={setYMax} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>
              setters de margen  ·{' '}
              <span style={{ color: '#f38ba8', fontWeight: 'normal' }}>invariante ×10</span>
            </div>
            <div style={{ background: '#1e1e2e', borderRadius: 4, padding: 8, marginBottom: 8, fontSize: 10, color: '#585b70' }}>
              Setter almacena <code>RnValor × 10</code> internamente.
              serialSlots() devuelve <code>interno / 10</code>.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <NumInput label="nMargen_Sup (ext)" value={mSup} onChange={setMSup} />
              <NumInput label="nMargen_Inf (ext)" value={mInf} onChange={setMInf} />
              <NumInput label="nMargen_Izq (ext)" value={mIzq} onChange={setMIzq} />
              <NumInput label="nMargen_Der (ext)" value={mDer} onChange={setMDer} />
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#585b70', fontSize: 10, marginBottom: 4 }}>valor interno (×10):</div>
              <KV k="nMargenSup (stored)" v={`${ms} × 10 = ${ms * 10}`} mut />
              <KV k="nMargenInf (stored)" v={`${mi} × 10 = ${mi * 10}`} mut />
              <KV k="nMargenIzq (stored)" v={`${mz} × 10 = ${mz * 10}`} mut />
              <KV k="nMargenDer (stored)" v={`${md} × 10 = ${md * 10}`} mut />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>serialSlots()  ·  serialización (÷10)</div>
            {slots.keys.map((k, i) => (
              <KV key={k} k={k} v={
                k === 'oArea'
                  ? `{xMin:${(slots.values[i] as BBox | undefined)?.xMin ?? '—'}, …}`
                  : String(slots.values[i])
              } />
            ))}
          </div>
        </div>

        {/* Panel derecho: visualización + round-trips */}
        <div>
          <div style={S.card}>
            <div style={S.title}>actualizaAreaElemento()  ·  área antes/después</div>
            <AreaSVG
              original={area}
              reduced={reduced}
              mSup={ms} mInf={mi} mIzq={mz} mDer={md}
            />
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#45475a', fontSize: 10, marginBottom: 2 }}>original (gris punteado)</div>
              <KV k="xMin / yMin" v={`${area.xMin}  /  ${area.yMin}`} />
              <KV k="xMax / yMax" v={`${area.xMax}  /  ${area.yMax}`} />
              <div style={{ color: '#89dceb', fontSize: 10, margin: '6px 0 2px' }}>reducida (azul)</div>
              <KV k="xMin = orig + mIzq×10" v={`${area.xMin} + ${mz * 10} = ${reduced.xMin.toFixed(1)}`} />
              <KV k="yMin = orig + mInf×10" v={`${area.yMin} + ${mi * 10} = ${reduced.yMin.toFixed(1)}`} />
              <KV k="xMax = orig − mDer×10" v={`${area.xMax} − ${md * 10} = ${reduced.xMax.toFixed(1)}`} />
              <KV k="yMax = orig − mSup×10" v={`${area.yMax} − ${ms * 10} = ${reduced.yMax.toFixed(1)}`} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>initWith(props) + newFromSerial()  ·  round-trips</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 4 }}>
                initWith — acepta unidades externas, aplica setters (×10)
              </div>
              <KV k="nMargenSup después" v={`${initWithResult.sup}  (input=${ms}, stored=${ms * 10})`} />
              <KV k="nMargenInf después" v={`${initWithResult.inf}  (input=${mi}, stored=${mi * 10})`} />
            </div>

            <div>
              <div style={{ color: '#fab387', fontSize: 10, marginBottom: 4 }}>
                newFromSerial(keys, xmlValues) — reconstruye desde serialSlots()
              </div>
              <KV k="serialSlots nMargen_Sup" v={`${ms} (÷10 de ${ms * 10})`} />
              <KV k="tras newFromSerial ×10" v={`${serialResult.sup}  ← igual al original`} />
              <KV k="round-trip ok"          v={String(serialResult.sup === ms * 10)} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>template methods — override en subclases</div>
            <div style={{ fontSize: 10, color: '#585b70', lineHeight: 1.8 }}>
              <div><code style={{ color: '#89dceb' }}>despliega()</code>: vacío → cada subclase dibuja su elemento en oVentana</div>
              <div><code style={{ color: '#89dceb' }}>newFrom(obj)</code>: vacío → copy constructor, override obligatorio</div>
              <div><code style={{ color: '#fab387' }}>initWith(props)</code>: functional — usa setters para asignar desde property_list</div>
              <div><code style={{ color: '#fab387' }}>newFromSerial(keys,vals)</code>: factory — construye desde arrays paralelos XML</div>
              <div><code style={{ color: '#a6e3a1' }}>serialSlots()</code>: functional — exporta keys+values para persistencia (÷10)</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
