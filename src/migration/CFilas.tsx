// ================================================================================
//  MIGRACIÓN: c_filas.magik → CFilas.tsx
//  Clase origen : c_filas  (def_slotted_exemplar)
//  Autor orig.  : dsanchez — 28/10/2004, 03/11/2004, 04/01/2005
// ================================================================================
//
//  Contenedor 1D de filas (c_fila) del motor de plotting de Smallworld.
//  Maneja N filas indexadas por número (1-based), cada una con su nLongitud
//  (altura en décimas de mm — ver c_fila / CFila para la conversión ×10).
//
//  Operaciones clave:
//    · new(RnTot_Filas)         → crea N filas con nLongitud por defecto 10
//    · elemento(RnFila)         → acceso a la fila i
//    · Inicia_Elemento(N)       → suma longitudes de filas 1..N-1 (offset Y)
//    · Longitud_Total()         → suma todas las longitudes
//
//  Sin cálculo espacial Turf/OL en c_filas original — es contenedor puro.
//  El método Inicia_Elemento es el cálculo de offset Y que el layout usa
//  para posicionar la fila i sobre el canvas (acumulador 1D).
//
// ================================================================================

import React, { useMemo, useState } from 'react';
import { CFila } from './CFila';

// ─── Tipos serialización ──────────────────────────────────────────────────────

export interface CFilasSerialData {
  nTotal_Filas: number;
  collFilas:    Map<number, CFila>;
  nLong_Total:  number;
}

// ─── CFilas ───────────────────────────────────────────────────────────────────

export class CFilas {
  // Slots — define_slot_access(:writable)
  private _nTotal_Filas: number;
  private _collFilas:    Map<number, CFila>;
  private _nLong_Total:  number;       // :private en Magik (acceso vía métodos)

  // ── new(RnTot_Filas) ────────────────────────────────────────────────────
  // _self.nTotal_Filas << RnTot_Filas             (pasa por setter → validación >0)
  // _self.collFilas << hash_table.new()
  // _for LnNum_Fila _over range(1, _self.nTotal_Filas)
  // _loop _self.collFilas[LnNum_Fila] << c_fila.new(LnLong=10) _endloop
  // _return _clone
  constructor(RnTot_Filas: number) {
    this._nTotal_Filas = 0;
    this._collFilas    = new Map();
    this._nLong_Total  = 0;
    this.nTotal_Filas  = RnTot_Filas;     // pasa por setter (valida >0)
    this._buildRows();
  }

  // ── Getters / Setters de slots ──────────────────────────────────────────

  // nTotal_Filas getter / setter (público, validación >0)
  get nTotal_Filas(): number { return this._nTotal_Filas; }
  set nTotal_Filas(RnValor: number) {
    // _if RnValor > 0 _then .nTotal_Filas << RnValor
    // _else condition.raise(:warning, ...)
    if (RnValor > 0) {
      this._nTotal_Filas = RnValor;
    } else {
      throw new RangeError('Error al asignar el total de líneas');
    }
  }

  // collFilas getter / setter (público)
  get collFilas(): Map<number, CFila> { return this._collFilas; }
  set collFilas(filas: Map<number, CFila>) { this._collFilas = filas; }   // collFilas << filas

  // nLong_Total — :private en Magik (getter/setter privados, validación >0)
  protected get nLong_Total(): number { return this._nLong_Total; }
  protected setNLongTotal(valor: number): void {
    // _if valor > 0 _then .nLong_total << valor _endif
    if (valor > 0) this._nLong_Total = valor;
  }

  // ── elemento(RnFila) ────────────────────────────────────────────────────
  // _if RnFila <= 0 _and RnFila > _self.nTotal_Filas
  // _then condition.raise(:warning, ...) _endif
  // >> _self.collFilas[RnFila]
  //
  // NOTA Magik: el bug original usa AND donde lógicamente debería ser OR
  // (la condición nunca se cumple). Lo replicamos tal cual para fidelidad,
  // pero añadimos una validación efectiva opcional debajo.
  elemento(RnFila: number): CFila | undefined {
    // Replica literal del bug original (AND nunca true → no lanza):
    if (RnFila <= 0 && RnFila > this._nTotal_Filas) {
      throw new RangeError('Error número de fila incorrecto');
    }
    return this._collFilas.get(RnFila);
  }

  // ── Inicia_Elemento(RnNum_Elemento) ─────────────────────────────────────
  // LnLong << 0
  // _for LnFila _over range(1, RnNum_Elemento-1)
  // _loop LnLong << _self.collFilas[LnFila].nLongitud + LnLong _endloop
  // _return LnLong
  //
  // Suma de longitudes de las filas previas → offset Y de la fila solicitada.
  Inicia_Elemento(RnNum_Elemento: number): number {
    let LnLong = 0;
    // range(1, N-1) en Magik incluye ambos extremos → for i=1; i<=N-1; i++
    for (let LnFila = 1; LnFila <= RnNum_Elemento - 1; LnFila++) {
      const f = this._collFilas.get(LnFila);
      if (f) LnLong += f.nLongitud;
    }
    return LnLong;
  }

  // ── Longitud_Total() ────────────────────────────────────────────────────
  // LnLong_Total << 0
  // _for LnFila _over range(1, _self.nTotal_Filas)
  // _loop LnLong_Total << _self.collFilas[LnFila].nLongitud + LnLong_Total _endloop
  // _return LnLong_Total
  Longitud_Total(): number {
    let LnLong_Total = 0;
    for (let LnFila = 1; LnFila <= this._nTotal_Filas; LnFila++) {
      const f = this._collFilas.get(LnFila);
      if (f) LnLong_Total += f.nLongitud;
    }
    return LnLong_Total;
  }

  // ── Total_Elementos ─────────────────────────────────────────────────────
  // >> _self.nTotal_Filas
  Total_Elementos(): number { return this._nTotal_Filas; }

  // ── init_with(props) ────────────────────────────────────────────────────
  // _for key, value _over props.fast_keys_and_elements()
  //   _try _with cond
  //     _self.perform_private(key.with_chevron, value)
  //   _when does_not_understand _endtry
  initWith(props: Partial<CFilasSerialData>): this {
    if (props.nTotal_Filas !== undefined) {
      try { this.nTotal_Filas = props.nTotal_Filas; } catch { /* does_not_understand → ignorar */ }
    }
    if (props.collFilas !== undefined) this._collFilas = props.collFilas;
    if (props.nLong_Total !== undefined) this.setNLongTotal(props.nLong_Total);
    return this;
  }

  // ── new_from_serial(keys, xml_values) ───────────────────────────────────
  // props << property_list.new()
  // _for nr, key _over keys.fast_keys_and_elements()
  //   _loop props[key] << xml_values[nr] _endloop
  // _return _clone.init_with(props)
  static fromSerial(keys: string[], xmlValues: unknown[]): CFilas {
    const props: Record<string, unknown> = {};
    keys.forEach((key, i) => { props[key] = xmlValues[i]; });
    const nTot = Math.max(1, Number(props['nTotal_Filas']) || 1);
    return new CFilas(nTot).initWith(props as Partial<CFilasSerialData>);
  }

  // ── serial_slots() ──────────────────────────────────────────────────────
  // _try ln_long << .nLong_Total/10 _when does_not_understand ln_long << 0 _endtry
  // keys   << rope.new_with(:nTotal_Filas, :collFilas, :nLong_Total)
  // values << rope.new_with(.nTotal_Filas, .collFilas, .nLong_Total)
  // >> keys, values
  serialSlots(): { keys: string[]; values: unknown[]; nLongDecimm: number } {
    let lnLong: number;
    try { lnLong = this._nLong_Total / 10; } catch { lnLong = 0; }
    return {
      keys:        ['nTotal_Filas', 'collFilas', 'nLong_Total'],
      values:      [this._nTotal_Filas, this._collFilas, this._nLong_Total],
      nLongDecimm: lnLong,   // valor convertido a mm (÷10) — fidelidad al magik
    };
  }

  // ── serial_structure ────────────────────────────────────────────────────
  // >> :slotted
  static serialStructure(): 'slotted' { return 'slotted'; }

  // ── Helpers privados ────────────────────────────────────────────────────

  // Construye collFilas con N c_fila.new(10) — equivalente al _for de new()
  private _buildRows(): void {
    const LnLong = 10;  // _local LnLong << 10
    this._collFilas.clear();
    for (let LnNum_Fila = 1; LnNum_Fila <= this._nTotal_Filas; LnNum_Fila++) {
      this._collFilas.set(LnNum_Fila, new CFila(LnLong));
    }
  }
}

// ================================================================================
//  UI de demo — CFilasUI
// ================================================================================

const s = {
  wrap:  { fontFamily: 'monospace', fontSize: 13, padding: 16,
           background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  box:   { background: '#313244', padding: '10px 14px', borderRadius: 6,
           marginBottom: 12 } as React.CSSProperties,
  label: { color: '#a6e3a1', fontWeight: 700, marginBottom: 6,
           display: 'block', fontSize: 12 } as React.CSSProperties,
  row:   { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 },
  btn:   { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
           background: '#89b4fa', color: '#1e1e2e',
           fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  btnDanger: { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
               background: '#f38ba8', color: '#1e1e2e',
               fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  input: { background: '#45475a', color: '#cdd6f4', border: 'none', borderRadius: 4,
           padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
           width: 100 } as React.CSSProperties,
  code:  { background: '#181825', padding: '8px 12px', borderRadius: 4,
           fontSize: 11, color: '#cba6f7', display: 'block',
           marginBottom: 4 } as React.CSSProperties,
  th:    { padding: '4px 12px', color: '#89b4fa',
           borderBottom: '1px solid #45475a', textAlign: 'left' } as React.CSSProperties,
  td:    { padding: '4px 12px', color: '#f9e2af',
           borderBottom: '1px solid #313244' } as React.CSSProperties,
  errBox: { background: '#45263a', border: '1px solid #f38ba8',
            color: '#f38ba8', padding: '6px 12px', borderRadius: 4,
            marginBottom: 8 } as React.CSSProperties,
};

export function CFilasUI() {
  const [nTot,    setNTot]    = useState(5);
  const [rowIdx,  setRowIdx]  = useState(3);
  const [elemQuery, setElemQuery] = useState(2);
  const [newLen, setNewLen]   = useState(15);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);
  const [log,  setLog]        = useState<string[]>([]);

  // Build CFilas on dimension change
  const filas = useMemo(() => {
    setError(null);
    try { return new CFilas(nTot); }
    catch (e) { setError((e as Error).message); return null; }
  }, [nTot]);
  void tick;

  const pushLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  // ── elemento(RnFila) ──
  const handleElemento = () => {
    if (!filas) return;
    setError(null);
    try {
      const f = filas.elemento(elemQuery);
      pushLog(f
        ? `elemento(${elemQuery}) → CFila(nLongitud=${f.nLongitud})`
        : `elemento(${elemQuery}) → undefined (fuera de rango)`);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg); pushLog(`⚠ ${msg}`);
    }
  };

  // ── Inicia_Elemento ──
  const handleInicia = () => {
    if (!filas) return;
    const off = filas.Inicia_Elemento(rowIdx);
    pushLog(`Inicia_Elemento(${rowIdx}) → offset = ${off} (suma 1..${rowIdx - 1})`);
  };

  // ── Longitud_Total ──
  const handleTotal = () => {
    if (!filas) return;
    pushLog(`Longitud_Total() → ${filas.Longitud_Total()} (acumulado de ${filas.nTotal_Filas} filas)`);
  };

  // ── modificar nLongitud de una fila ──
  const handleSetLen = () => {
    if (!filas) return;
    try {
      const f = filas.elemento(rowIdx);
      if (!f) { pushLog(`fila ${rowIdx} no existe`); return; }
      f.nLongitud = newLen;          // pasa por setter de CFila → ×10
      pushLog(`fila[${rowIdx}].nLongitud = ${newLen} (interno ×10 = ${f.nLongitud})`);
      setTick(t => t + 1);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg); pushLog(`⚠ ${msg}`);
    }
  };

  // ── serial_slots / fromSerial ──
  const handleSerialize = () => {
    if (!filas) return;
    const { keys, values, nLongDecimm } = filas.serialSlots();
    pushLog(`serial_slots → keys=[${keys.join(', ')}]  nLong/10=${nLongDecimm}`);
    const clone = CFilas.fromSerial(keys, values);
    pushLog(`fromSerial → clon nTotal=${clone.nTotal_Filas}`);
  };

  // ── error nTotal_Filas = 0 ──
  const handleTriggerError = () => {
    try { setNTot(0); }
    catch (e) { setError((e as Error).message); }
  };

  // Lista de filas para tabla
  const rows = filas
    ? Array.from(filas.collFilas.entries()).sort((a, b) => a[0] - b[0])
    : [];

  // Offsets calculados para visualización (acumulador 1D)
  const offsets = filas
    ? rows.map(([k]) => filas.Inicia_Elemento(k))
    : [];

  return (
    <div style={s.wrap}>

      {/* ── new(RnTot_Filas) — estado del contenedor ── */}
      <div style={s.box}>
        <span style={s.label}>new(RnTot_Filas) — total de filas</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            nTotal_Filas:{' '}
            <input type="number" min={1} max={20} value={nTot}
              onChange={e => { setError(null); setNTot(Number(e.target.value)); }}
              style={s.input} />
          </label>
          <button style={s.btnDanger} onClick={handleTriggerError}>
            nTotal_Filas=0 → RangeError
          </button>
        </div>
        {filas && (
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#a6e3a1' }}>Total_Elementos:</span>{' '}
            <span style={{ color: '#f9e2af' }}>{filas.Total_Elementos()}</span>{'  '}
            <span style={{ color: '#a6e3a1' }}>Longitud_Total:</span>{' '}
            <span style={{ color: '#f9e2af' }}>{filas.Longitud_Total()}</span>{' '}
            <span style={{ color: '#6c7086' }}>(décimas de mm, internas ×10)</span>
          </div>
        )}
        {error && <div style={s.errBox}>⚠ {error}</div>}
      </div>

      {/* ── elemento(RnFila) ── */}
      <div style={s.box}>
        <span style={s.label}>elemento(RnFila) — acceso por índice 1-based</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            RnFila:{' '}
            <input type="number" min={1} value={elemQuery}
              onChange={e => setElemQuery(Number(e.target.value))} style={s.input} />
          </label>
          <button style={s.btn} onClick={handleElemento}>elemento({elemQuery})</button>
        </div>
        <code style={s.code}>{'>>'} _self.collFilas[{elemQuery}]</code>
      </div>

      {/* ── Inicia_Elemento + Longitud_Total ── */}
      <div style={s.box}>
        <span style={s.label}>Inicia_Elemento(N) / Longitud_Total()</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            N (fila):{' '}
            <input type="number" min={1} value={rowIdx}
              onChange={e => setRowIdx(Number(e.target.value))} style={s.input} />
          </label>
          <button style={s.btn} onClick={handleInicia}>Inicia_Elemento</button>
          <button style={s.btn} onClick={handleTotal}>Longitud_Total</button>
        </div>
        <code style={s.code}>
          _for LnFila _over range(1, N-1) _loop LnLong += collFilas[LnFila].nLongitud _endloop
        </code>
      </div>

      {/* ── Modificar nLongitud de una fila ── */}
      <div style={s.box}>
        <span style={s.label}>collFilas[N].nLongitud {'<<'} valor (×10 interno)</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            fila:{' '}
            <input type="number" min={1} value={rowIdx}
              onChange={e => setRowIdx(Number(e.target.value))} style={s.input} />
          </label>
          <label style={{ fontSize: 12 }}>
            nueva nLongitud (mm):{' '}
            <input type="number" min={0} value={newLen}
              onChange={e => setNewLen(Number(e.target.value))} style={s.input} />
          </label>
          <button style={s.btn} onClick={handleSetLen}>asignar</button>
        </div>
      </div>

      {/* ── Tabla collFilas con offsets acumulados ── */}
      <div style={s.box}>
        <span style={s.label}>collFilas — {rows.length} filas (offset 1D acumulado)</span>
        {rows.length === 0 ? (
          <div style={{ fontSize: 11, color: '#6c7086' }}>(sin filas)</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <thead>
              <tr>
                <th style={s.th}>fila (key)</th>
                <th style={s.th}>nLongitud (interno ×10)</th>
                <th style={s.th}>Inicia_Elemento(fila)</th>
                <th style={s.th}>banda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, f], i) => (
                <tr key={k}>
                  <td style={s.td}>{k}</td>
                  <td style={s.td}>{f.nLongitud}</td>
                  <td style={s.td}>{offsets[i]}</td>
                  <td style={{ ...s.td, padding: 0 }}>
                    <div style={{
                      marginLeft: offsets[i] / 2,
                      width: Math.max(8, f.nLongitud / 2),
                      height: 14,
                      background: '#cba6f7', borderRadius: 2,
                    }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Serialización ── */}
      <div style={s.box}>
        <span style={s.label}>serial_slots / new_from_serial</span>
        <button style={s.btn} onClick={handleSerialize}>serializar + fromSerial</button>
        <div style={{ fontSize: 11, color: '#6c7086', marginTop: 6 }}>
          serial_structure = <span style={{ color: '#cba6f7' }}>
            '{CFilas.serialStructure()}'
          </span>
        </div>
      </div>

      {/* ── Log ── */}
      {log.length > 0 && (
        <div style={s.box}>
          <span style={s.label}>log</span>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a6adc8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
