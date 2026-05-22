/**
 * Migración: c_fila.magik
 * dsanchez — 03/Noviembre/2004
 * Clase Magik: c_fila
 *
 * Clase de modelo para una fila de tabla en el motor de planos Smallworld.
 * Almacena la longitud (altura) de la fila con conversión interna ×10
 * (mm externos → décimas de mm internos).
 *
 * Métodos migrados:
 *   new(RnLongitud)               → constructor(nLongitud?)
 *   init_with(props)              → initWith(props)
 *   new_from_serial(keys, vals)   → static fromSerial(keys, values)
 *   nLongitud getter              → get nLongitud()
 *   nLongitud << setter           → set nLongitud(valor)
 *   serial_slots()                → serialSlots()
 *   serial_structure              → SERIAL_STRUCTURE (constante estática)
 *
 * Equivalencias clave:
 *   .nLongitud << RnValor * 10     → _nLongitud = valor * 10  (almacenamiento interno)
 *   condition.raise(:warning, ...) → throw new RangeError(...)
 *   rope.new_with(:nLongitud)      → ['nLongitud']
 *   perform_private(key<<, val)    → setter dinámico vía descriptor de prototipo
 *   _try … _when does_not_understand → try / catch
 *   _clone                         → new CFila() con estado copiado
 *   property_list.new()            → {}  (Record<string,unknown>)
 */

import React, { useState } from 'react';

// =============================================================================
// CLASE PRINCIPAL — c_fila
// =============================================================================

export class CFila {

  // Magik: {:nLongitud, _unSet}  — slot con almacenamiento interno ×10
  private _nLongitud: number | null = null;

  // ---------------------------------------------------------------------------
  // new(RnLongitud)
  // Magik: .nLongitud << RnLongitud ; _return _clone
  // En Magik new() asigna el slot y devuelve un clon. Aquí el constructor
  // delega en el setter para que la validación y la conversión ×10 operen.
  // ---------------------------------------------------------------------------
  constructor(nLongitud?: number) {
    if (nLongitud !== undefined) {
      this.nLongitud = nLongitud;  // pasa por el setter → validación + ×10
    }
  }

  // ---------------------------------------------------------------------------
  // nLongitud  getter
  // Magik: _return .nLongitud
  // Devuelve el valor interno (ya almacenado en décimas de mm).
  // ---------------------------------------------------------------------------
  get nLongitud(): number {
    return this._nLongitud ?? 0;
  }

  // ---------------------------------------------------------------------------
  // nLongitud << RnValor  setter
  //
  // Magik:
  //   _if RnValor < 0 _then
  //     condition.raise(:warning, :string, "Longitud no puede ser menor que cero")
  //   _endif
  //   .nLongitud << RnValor * 10
  //
  // Valida que el valor no sea negativo y almacena ×10 (mm → décimas de mm).
  // ---------------------------------------------------------------------------
  set nLongitud(valor: number) {
    // Magik: condition.raise(:warning, ...) → excepción en TS
    if (valor < 0) {
      throw new RangeError('Longitud no puede ser menor que cero');
    }
    // Conversión de unidad: mm externos → décimas de mm internos
    this._nLongitud = valor * 10;
  }

  // ---------------------------------------------------------------------------
  // init_with(props)
  //
  // Magik:
  //   _for key, value _over props.fast_keys_and_elements()
  //     _try _with cond
  //       _self.perform_private(key.with_chevron, value)  ← llama al setter privado
  //     _when does_not_understand
  //     _endtry
  //
  // Itera los pares clave→valor e invoca el setter correspondiente.
  // perform_private(key<<, val) en Magik llama al setter aunque sea privado;
  // aquí se usa el descriptor de prototipo para hacer lo mismo.
  // ---------------------------------------------------------------------------
  initWith(props: Record<string, unknown>): this {
    for (const [key, value] of Object.entries(props)) {
      try {
        // Magik: perform_private(key.with_chevron, value)
        const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
        if (desc?.set) {
          desc.set.call(this, value);
        }
      } catch {
        // Magik: _when does_not_understand — ignora claves sin setter
      }
    }
    return this;
  }

  // ---------------------------------------------------------------------------
  // new_from_serial(keys, xml_values)
  //
  // Magik:
  //   props << property_list.new()
  //   _for nr, key _over keys.fast_keys_and_elements()
  //     props[key] << xml_values[nr]
  //   _return _clone.init_with(props)
  //
  // Reconstruye una instancia desde datos serializados (pares clave/valor).
  // En Magik los valores vienen de XML; aquí aceptan cualquier array.
  // ---------------------------------------------------------------------------
  static fromSerial(keys: string[], values: unknown[]): CFila {
    // Magik: property_list.new() relleno en el bucle
    const props: Record<string, unknown> = {};
    keys.forEach((key, i) => { props[key] = values[i]; });
    return new CFila().initWith(props);
  }

  // ---------------------------------------------------------------------------
  // serial_slots()
  //
  // Magik:
  //   _try ln_long << .nLongitud / 10
  //   _when does_not_understand ln_long << 0
  //   keys   << rope.new_with(:nLongitud)
  //   values << rope.new_with(ln_long)
  //   >> keys, values
  //
  // Serializa la fila: divide ÷10 para deshacer la conversión interna
  // y recuperar el valor original en mm.
  // ---------------------------------------------------------------------------
  serialSlots(): { keys: string[]; values: number[] } {
    let ln_long: number;
    try {
      // Magik: .nLongitud / 10 — invierte la conversión ×10 del setter
      ln_long = (this._nLongitud ?? 0) / 10;
    } catch {
      // Magik: _when does_not_understand → 0
      ln_long = 0;
    }
    // Magik: rope.new_with(:nLongitud) / rope.new_with(ln_long)
    return { keys: ['nLongitud'], values: [ln_long] };
  }

  // ---------------------------------------------------------------------------
  // serial_structure
  // Magik: >> :slotted
  // Indica que la serialización es por slots (no por referencia).
  // ---------------------------------------------------------------------------
  static readonly SERIAL_STRUCTURE = 'slotted' as const;
}

// =============================================================================
// COMPONENTE REACT — demo interactivo de CFila
// =============================================================================

type FilaEntry = {
  id        : number;
  input     : number;       // valor introducido por el usuario (mm)
  internal  : number;       // _nLongitud almacenado (×10)
  serialized: number;       // serial_slots() → ÷10
  error     : string | null;
};

export function CFilaUI() {
  const [inputVal,  setInputVal ] = useState<string>('5');
  const [filas,     setFilas    ] = useState<FilaEntry[]>([]);
  const [nextId,    setNextId   ] = useState(1);

  // ── Serialización / deserialización ──────────────────────────────────────
  const [serialKeys,   setSerialKeys  ] = useState<string>('nLongitud');
  const [serialVals,   setSerialVals  ] = useState<string>('8');
  const [deserResult,  setDeserResult ] = useState<string | null>(null);

  // ── new(RnLongitud) ───────────────────────────────────────────────────────
  const handleNew = () => {
    const raw = parseFloat(inputVal);
    let entry: FilaEntry;
    try {
      const f = new CFila(raw);
      const { values } = f.serialSlots();
      entry = { id: nextId, input: raw, internal: f.nLongitud, serialized: values[0], error: null };
    } catch (e) {
      // Magik: condition.raise(:warning) → RangeError en TS
      entry = { id: nextId, input: raw, internal: 0, serialized: 0, error: (e as Error).message };
    }
    setFilas(prev => [...prev, entry]);
    setNextId(n => n + 1);
  };

  // ── new_from_serial(keys, values) ─────────────────────────────────────────
  const handleDeserialize = () => {
    try {
      const keys   = serialKeys.split(',').map(k => k.trim());
      const values = serialVals.split(',').map(v => parseFloat(v.trim()));
      const f      = CFila.fromSerial(keys, values);
      const { values: sv } = f.serialSlots();
      setDeserResult(
        `CFila.fromSerial → nLongitud (interno)=${f.nLongitud}  |  serialSlots()=${sv[0]}`
      );
    } catch (e) {
      setDeserResult(`Error: ${(e as Error).message}`);
    }
  };

  const handleClear = () => { setFilas([]); setNextId(1); };

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_fila</h3>
      <p style={st.meta}>
        Modelo de fila de tabla. Almacena <code>nLongitud</code> ×10 internamente
        (mm → décimas de mm). Setter valida valor ≥ 0.
        <code>serial_slots()</code> divide ÷10 al serializar.
      </p>

      {/* ── new(RnLongitud) ── */}
      <div style={st.control}>
        <span style={st.badge}>new(RnLongitud)</span>
        <label style={st.lbl}>
          nLongitud (mm):
          <input
            type="number" step="0.5" value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            style={st.numInput}
          />
        </label>
        <button onClick={handleNew} style={st.btn}>Crear fila</button>
        <button onClick={handleClear} style={{ ...st.btn, background: '#607d8b', borderColor: '#607d8b' }}>
          Limpiar
        </button>
      </div>

      {/* ── Tabla de instancias creadas ── */}
      {filas.length > 0 && (
        <table style={st.table}>
          <thead>
            <tr>
              {['#', 'Entrada (mm)', 'Interno ×10\n(_nLongitud)', 'serial_slots()\n(÷10)', 'Error / Advertencia'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.id} style={{ background: f.error ? '#fff3e0' : (f.id % 2 === 0 ? '#f8f9fa' : '#fff') }}>
                <td style={{ ...st.td, textAlign: 'center', color: '#888' }}>{f.id}</td>
                <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{f.input}</td>
                <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace', color: f.error ? '#aaa' : '#1565c0', fontWeight: 'bold' }}>
                  {f.error ? '—' : f.internal}
                </td>
                <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace', color: f.error ? '#aaa' : '#2e7d32' }}>
                  {f.error ? '—' : f.serialized}
                </td>
                <td style={{ ...st.td, color: '#e65100', fontSize: 11 }}>
                  {f.error
                    ? <><strong>RangeError:</strong> {f.error}</>
                    : <span style={{ color: '#aaa' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filas.length === 0 && (
        <p style={{ ...st.meta, fontStyle: 'italic', marginTop: 6 }}>
          Introduce un valor y pulsa <strong>Crear fila</strong>.
          Prueba valores negativos para ver la validación.
        </p>
      )}

      {/* ── new_from_serial / fromSerial ── */}
      <div style={{ ...st.control, marginTop: 12, flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        <span style={st.badge}>new_from_serial(keys, xml_values)</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={st.lbl}>
            keys (csv):
            <input type="text" value={serialKeys}
              onChange={e => setSerialKeys(e.target.value)} style={{ ...st.numInput, width: 120 }} />
          </label>
          <label style={st.lbl}>
            values (csv):
            <input type="text" value={serialVals}
              onChange={e => setSerialVals(e.target.value)} style={{ ...st.numInput, width: 120 }} />
          </label>
          <button onClick={handleDeserialize} style={st.btn}>fromSerial()</button>
        </div>
        {deserResult && (
          <p style={{ ...st.meta, fontFamily: 'monospace', color: deserResult.startsWith('Error') ? '#c62828' : '#1b5e20' }}>
            {deserResult}
          </p>
        )}
      </div>

      {/* ── Tabla de equivalencias ── */}
      <table style={{ ...st.table, marginTop: 12 }}>
        <thead>
          <tr>
            {['Magik', 'TypeScript', 'Notas'].map(h => <th key={h} style={st.th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {[
            { m: '.nLongitud << RnValor * 10',            t: '_nLongitud = valor * 10',           n: 'Almacenamiento interno en décimas de mm' },
            { m: 'condition.raise(:warning, …)',           t: 'throw new RangeError(…)',            n: 'Cuando valor < 0' },
            { m: '.nLongitud / 10  (serial_slots)',        t: '(_nLongitud ?? 0) / 10',            n: 'Deshace la conversión al serializar' },
            { m: 'perform_private(key<<, val)',            t: 'descriptor.set.call(this, val)',     n: 'Invoca setter dinámicamente' },
            { m: '_when does_not_understand',              t: 'catch { }',                          n: 'Ignora claves/métodos inexistentes' },
            { m: 'rope.new_with(:nLongitud)',              t: "['nLongitud']",                      n: 'Array de una sola clave' },
            { m: '_return _clone',                        t: 'new CFila().initWith(props)',         n: 'Clon con estado copiado' },
            { m: '>> :slotted  (serial_structure)',        t: "SERIAL_STRUCTURE = 'slotted'",       n: 'Constante estática' },
          ].map(({ m, t, n }, i) => (
            <tr key={m} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
              <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{m}</code></td>
              <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{t}</code></td>
              <td style={{ ...st.td, color: '#555', fontSize: 11 }}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ ...st.meta, marginTop: 6 }}>
        <code>CFila.SERIAL_STRUCTURE = '{CFila.SERIAL_STRUCTURE}'</code>
        {' '}— equivale a <code>serial_structure → :slotted</code>.
      </p>
    </div>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  numInput : { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3, width: 80, textAlign: 'right' as const },
  btn      : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  badge    : { fontSize: 10, background: '#2E4057', color: '#fff', borderRadius: 3, padding: '2px 7px', fontFamily: 'monospace' },
  table    : { borderCollapse: 'collapse' as const, width: '100%' },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' as const, fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default CFilaUI;
