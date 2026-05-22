// ================================================================================
//  MIGRACIÓN: c_celdas.magik → CCeldas.tsx
//  Clase origen : c_celdas  (def_slotted_exemplar)
//  Autor orig.  : dsanchez — 28/10/2004, 03/11/2004
// ================================================================================

import React, { useState, useMemo, useCallback } from 'react';

// ─── CCelda — stub de c_celda (clase separada, referenciada aquí) ─────────────

export class CCelda {
  readonly ren: number;
  readonly col: number;
  texto: string = '';   // contenido de texto de la celda (placeholder)

  constructor(ren: number, col: number) {
    this.ren = ren;
    this.col = col;
  }
}

// ─── Tipos de serialización ───────────────────────────────────────────────────

export interface CCeldasSerialData {
  nNumRen:    number;
  nNumCol:    number;
  collCeldas: Map<number, CCelda>;
}

// ─── CCeldas ──────────────────────────────────────────────────────────────────

export class CCeldas {
  // Slots privados — define_slot_access(:writable, :private)
  private _nNumRen: number;
  private _nNumCol: number;
  private _collCeldas: Map<number, CCelda>;

  // ── new(RnRen, RnCol) ─────────────────────────────────────────────────────
  // Crea la cuadrícula; llena collCeldas con c_celda.new(ren, col) por cada posición.
  // _return _clone → new CCeldas(...) devuelve una instancia nueva.
  constructor(nNumRen: number, nNumCol: number) {
    this._nNumRen    = CCeldas._validatePos(nNumRen, 'renglón');   // private nNum_Ren <<
    this._nNumCol    = CCeldas._validatePos(nNumCol, 'columnas');  // private nNum_Col <<
    this._collCeldas = new Map();
    this._buildGrid();
  }

  // ── Getters públicos ──────────────────────────────────────────────────────

  get nNumRen(): number { return this._nNumRen; }
  get nNumCol(): number { return this._nNumCol; }
  get collCeldas(): Map<number, CCelda> { return this._collCeldas; }

  // collCeldas << valor
  set collCeldas(value: Map<number, CCelda>) { this._collCeldas = value; }

  // ── celda(RnRen, RnCol) ───────────────────────────────────────────────────
  // >> _self.collCeldas[ _self.nNumCol * (RnRen-1) + RnCol ]
  // condition.raise(:warning, ...) → throw RangeError
  celda(ren: number, col: number): CCelda {
    if (ren < 1 || ren > this._nNumRen || col < 1 || col > this._nNumCol) {
      throw new RangeError(`La celda que se solicita no existe ${ren} ${col}`);
    }
    return this._collCeldas.get(this._linearIndex(ren, col))!;
  }

  // Fórmula de índice lineal 1-based: nNumCol * (ren-1) + col
  linearIndex(ren: number, col: number): number {
    return this._linearIndex(ren, col);
  }

  // ── init_with(props) ──────────────────────────────────────────────────────
  // _for key, value _over props.fast_keys_and_elements() → perform_private(key<<, value)
  // _try/_when does_not_understand → keys desconocidos se ignoran silenciosamente
  initWith(props: Partial<CCeldasSerialData>): this {
    if (props.nNumRen    !== undefined) this._nNumRen    = CCeldas._validatePos(props.nNumRen, 'renglón');
    if (props.nNumCol    !== undefined) this._nNumCol    = CCeldas._validatePos(props.nNumCol, 'columnas');
    if (props.collCeldas !== undefined) this._collCeldas = props.collCeldas;
    return this;
  }

  // ── new_from_serial(keys, xmlValues) ─────────────────────────────────────
  // property_list.new() → {}; keys.fast_keys_and_elements() → forEach
  // _clone.init_with(props) → new CCeldas + initWith()
  static fromSerial(keys: string[], xmlValues: unknown[]): CCeldas {
    const props: Record<string, unknown> = {};
    keys.forEach((key, i) => { props[key] = xmlValues[i]; });

    const nNumRen = (props['nNumRen'] as number) ?? 1;
    const nNumCol = (props['nNumCol'] as number) ?? 1;
    const inst = new CCeldas(nNumRen, nNumCol);
    if (props['collCeldas'] instanceof Map) {
      inst.collCeldas = props['collCeldas'] as Map<number, CCelda>;
    }
    return inst;
  }

  // ── serial_slots() ────────────────────────────────────────────────────────
  // rope.new_with(:nNumRen,:nNumCol,:collCeldas), rope.new_with(.nNumRen,...)
  // >> keys, values  →  { keys, values }
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['nNumRen', 'nNumCol', 'collCeldas'],
      values: [this._nNumRen, this._nNumCol, this._collCeldas],
    };
  }

  // ── serial_structure ──────────────────────────────────────────────────────
  // >> :slotted
  static serialStructure(): 'slotted' { return 'slotted'; }

  // ── Privados ──────────────────────────────────────────────────────────────

  // _private nNum_Ren << / nNum_Col << — condition.raise(:warning) si <= 0
  private static _validatePos(value: number, label: string): number {
    if (value > 0) return value;
    throw new RangeError(`Error al asignar el número de ${label}`);
  }

  // Fórmula hash_table key: nNumCol * (ren - 1) + col  (1-based)
  private _linearIndex(ren: number, col: number): number {
    return this._nNumCol * (ren - 1) + col;
  }

  // Rellena collCeldas con c_celda.new(ren, col) — equivale a los _for anidados de new()
  private _buildGrid(): void {
    this._collCeldas.clear();
    for (let ren = 1; ren <= this._nNumRen; ren++) {
      for (let col = 1; col <= this._nNumCol; col++) {
        const pos = this._linearIndex(ren, col);
        this._collCeldas.set(pos, new CCelda(ren, col));
      }
    }
  }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

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
           width: 56 } as React.CSSProperties,
  cell: (selected: boolean, highlight: boolean): React.CSSProperties => ({
    width: 52, height: 40, border: `2px solid ${selected ? '#89b4fa' : highlight ? '#f9e2af' : '#45475a'}`,
    borderRadius: 4, cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 1,
    background: selected ? '#1e3a5a' : highlight ? '#3a3520' : '#181825',
    transition: 'all 0.1s',
  }),
  errBox: { background: '#45263a', border: '1px solid #f38ba8',
            color: '#f38ba8', padding: '6px 12px', borderRadius: 4,
            marginBottom: 8 } as React.CSSProperties,
  code:  { background: '#181825', padding: '8px 12px', borderRadius: 4,
           fontSize: 11, color: '#cba6f7', display: 'block',
           marginBottom: 4 } as React.CSSProperties,
};

// ─── Componente principal UI ──────────────────────────────────────────────────

export function CCeldasUI() {
  const [rows,    setRows]    = useState(4);
  const [cols,    setCols]    = useState(5);
  const [selected, setSelected] = useState<{ ren: number; col: number } | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [queryRen, setQueryRen] = useState(1);
  const [queryCol, setQueryCol] = useState(1);
  const [serialInput, setSerialInput] = useState<{ rows: number; cols: number } | null>(null);

  // Construye CCeldas al cambiar dimensiones
  const grid = useMemo(() => {
    setSelected(null);
    setError(null);
    try { return new CCeldas(rows, cols); }
    catch (e) { return null; }
  }, [rows, cols]);

  // celda(RnRen, RnCol) — llamada desde el panel de query
  const handleQuery = useCallback(() => {
    if (!grid) return;
    setError(null);
    try {
      const c = grid.celda(queryRen, queryCol);
      setSelected({ ren: c.ren, col: c.col });
    } catch (e) {
      setError((e as Error).message);
      setSelected(null);
    }
  }, [grid, queryRen, queryCol]);

  // new_from_serial demo
  const handleFromSerial = useCallback(() => {
    if (!serialInput) return;
    try {
      const inst = CCeldas.fromSerial(
        ['nNumRen', 'nNumCol'],
        [serialInput.rows, serialInput.cols]
      );
      setRows(inst.nNumRen);
      setCols(inst.nNumCol);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [serialInput]);

  const serial = grid?.serialSlots();
  const selCell = selected && grid ? (() => {
    try { return grid.celda(selected.ren, selected.col); }
    catch { return null; }
  })() : null;

  return (
    <div style={s.wrap}>

      {/* ── Constructor: new(RnRen, RnCol) ── */}
      <div style={s.box}>
        <span style={s.label}>new(RnRen, RnCol) — dimensiones de la cuadrícula</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            nNumRen (filas):{' '}
            <input type="number" min={1} max={10} value={rows}
              onChange={e => setRows(Number(e.target.value))} style={s.input} />
          </label>
          <label style={{ fontSize: 12 }}>
            nNumCol (cols):{' '}
            <input type="number" min={1} max={10} value={cols}
              onChange={e => setCols(Number(e.target.value))} style={s.input} />
          </label>
          <span style={{ fontSize: 11, color: '#6c7086', alignSelf: 'center' }}>
            {grid ? `${grid.nNumRen * grid.nNumCol} celdas totales` : 'dimensión inválida'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#6c7086' }}>
          Fórmula índice lineal: <span style={{ color: '#cba6f7' }}>pos = nNumCol × (ren−1) + col</span>
          {' '}(1-based, equivale a hash_table key en Magik)
        </div>
      </div>

      {/* ── Cuadrícula visual — collCeldas ── */}
      {grid && (
        <div style={s.box}>
          <span style={s.label}>collCeldas — {grid.nNumRen}×{grid.nNumCol} celdas</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Cabecera de columnas */}
            <div style={{ display: 'flex', gap: 4, marginLeft: 36 }}>
              {Array.from({ length: grid.nNumCol }, (_, c) => (
                <div key={c} style={{ width: 52, textAlign: 'center',
                  fontSize: 10, color: '#6c7086' }}>col {c + 1}</div>
              ))}
            </div>
            {Array.from({ length: grid.nNumRen }, (_, r) => (
              <div key={r} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 28, fontSize: 10, color: '#6c7086',
                  textAlign: 'right' }}>ren {r + 1}</div>
                {Array.from({ length: grid.nNumCol }, (_, c) => {
                  const ren = r + 1, col = c + 1;
                  const isSel = selected?.ren === ren && selected?.col === col;
                  const idx   = grid.linearIndex(ren, col);
                  return (
                    <div key={c}
                      style={s.cell(isSel, false)}
                      onClick={() => { setSelected({ ren, col }); setError(null); }}>
                      <span style={{ fontSize: 9, color: isSel ? '#89b4fa' : '#6c7086' }}>
                        [{idx}]
                      </span>
                      <span style={{ fontSize: 10, color: isSel ? '#cdd6f4' : '#a6adc8' }}>
                        {ren},{col}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#6c7086', marginTop: 6 }}>
            Clic en celda para seleccionarla. <b>[n]</b> = índice lineal en collCeldas.
          </div>
        </div>
      )}

      {/* ── celda(RnRen, RnCol) — query manual ── */}
      <div style={s.box}>
        <span style={s.label}>celda(RnRen, RnCol) — acceso directo</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            ren: <input type="number" min={1} value={queryRen}
              onChange={e => setQueryRen(Number(e.target.value))} style={s.input} />
          </label>
          <label style={{ fontSize: 12 }}>
            col: <input type="number" min={1} value={queryCol}
              onChange={e => setQueryCol(Number(e.target.value))} style={s.input} />
          </label>
          <button style={s.btn} onClick={handleQuery}>celda({queryRen},{queryCol})</button>
          <button style={s.btnDanger}
            onClick={() => { setQueryRen(999); setTimeout(handleQuery, 0); }}>
            fuera de rango → RangeError
          </button>
        </div>
        {error && <div style={s.errBox}>⚠ {error}</div>}
        {selCell && !error && (
          <div style={{ fontSize: 12 }}>
            <b style={{ color: '#a6e3a1' }}>Celda encontrada:</b>{' '}
            ren=<span style={{ color: '#f9e2af' }}>{selCell.ren}</span>{' '}
            col=<span style={{ color: '#f9e2af' }}>{selCell.col}</span>{' '}
            índice=<span style={{ color: '#cba6f7' }}>
              {grid!.linearIndex(selCell.ren, selCell.col)}
            </span>
          </div>
        )}
      </div>

      {/* ── new_from_serial(keys, xmlValues) ── */}
      <div style={s.box}>
        <span style={s.label}>new_from_serial(keys, xmlValues) — deserialización</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            filas:{' '}
            <input type="number" min={1} max={10}
              defaultValue={3}
              onChange={e => setSerialInput(p => ({ rows: Number(e.target.value), cols: p?.cols ?? 3 }))}
              style={s.input} />
          </label>
          <label style={{ fontSize: 12 }}>
            cols:{' '}
            <input type="number" min={1} max={10}
              defaultValue={3}
              onChange={e => setSerialInput(p => ({ rows: p?.rows ?? 3, cols: Number(e.target.value) }))}
              style={s.input} />
          </label>
          <button style={s.btn}
            onClick={() => { setSerialInput(si => si ?? { rows: 3, cols: 3 }); handleFromSerial(); }}>
            fromSerial()
          </button>
        </div>
        <code style={s.code}>
          CCeldas.fromSerial(['nNumRen','nNumCol'], [{serialInput?.rows ?? 3},{serialInput?.cols ?? 3}])
        </code>
      </div>

      {/* ── serial_slots() ── */}
      {grid && serial && (
        <div style={s.box}>
          <span style={s.label}>serial_slots() — rope keys + values</span>
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <thead>
              <tr>
                {serial.keys.map(k => (
                  <th key={k} style={{ padding: '4px 12px', color: '#89b4fa',
                    borderBottom: '1px solid #45475a', textAlign: 'left' }}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {serial.values.map((v, i) => (
                  <td key={i} style={{ padding: '4px 12px', color: '#f9e2af',
                    borderBottom: '1px solid #313244' }}>
                    {v instanceof Map
                      ? `Map(${v.size} celdas)`
                      : String(v)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: '#6c7086', marginTop: 4 }}>
            serial_structure = <span style={{ color: '#cba6f7' }}>
              '{CCeldas.serialStructure()}'
            </span>
          </div>
        </div>
      )}

      {/* ── Celda seleccionada — detalle ── */}
      {selCell && (
        <div style={s.box}>
          <span style={s.label}>Celda seleccionada — CCelda</span>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: '#a6e3a1' }}>ren:</span>{' '}
            <span style={{ color: '#f9e2af' }}>{selCell.ren}</span>{'  '}
            <span style={{ color: '#a6e3a1' }}>col:</span>{' '}
            <span style={{ color: '#f9e2af' }}>{selCell.col}</span>{'  '}
            <span style={{ color: '#a6e3a1' }}>índice lineal:</span>{' '}
            <span style={{ color: '#cba6f7' }}>{grid!.linearIndex(selCell.ren, selCell.col)}</span>
          </div>
          <code style={{ ...s.code, marginTop: 6 }}>
            collCeldas[{grid!.linearIndex(selCell.ren, selCell.col)}]
            {' = '} CCelda(ren={selCell.ren}, col={selCell.col})
          </code>
        </div>
      )}
    </div>
  );
}
