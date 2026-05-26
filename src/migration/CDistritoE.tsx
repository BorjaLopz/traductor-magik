// =============================================================================
// MIGRACIÓN: c_distrito_e  →  CDistritoE.tsx
// Jerarquía Magik: c_distrito_e (clase raíz, no hereda explícitamente)
// Fuente: adiciones_layout/source/Sellos/Entidad/c_distrito_e.magik
// Empresa: Sigma Tao  ·  Autor: dsanchez  ·  06/04/2005
// =============================================================================
//
// Modelo de dominio "Distrito" para planos de canalización (Smallworld PNI).
// Lee datos de la BD landbase (mockeada en TS) y agrega por NSE
// (Nivel Socio-Económico):
//   · número de viviendas por NSE
//   · número de líneas por NSE
//   · NSE predominante
//   · totales (viviendas / líneas)
//
// La BD original son colecciones :landbase Smallworld:
//   :user!_distrito       → DistritoRecord
//   :user!_lote           → LoteRecord (con .user!_detalle_lotes navegable)
//   :user!_detalle_lote   → DetalleLoteRecord (enumerador :user!_nivel_socio)
//
// Se mockea con MockLandbaseDB en memoria.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos (D5 — XxxRecord para campos user!_*)
// ---------------------------------------------------------------------------

// Enumerador sorted_values de :user!_nivel_socio
export type NSE =
  | 'RESIDENCIAL A'
  | 'RESIDENCIAL B'
  | 'RESIDENCIAL C'
  | 'RESIDENCIAL D'
  | 'RESIDENCIAL E'
  | 'COMERCIAL 1ª.'
  | 'COMERCIAL 2ª.'
  | 'COMERCIAL 3ª.'
  | 'INDUSTRIAL LIGERA'
  | 'INDUSTRIAL MEDIANA'
  | 'INDUSTRIAL PESADA'
  | 'LOTE BALDÍO';

// Orden estable (equivale a .type.enumerator.sorted_values)
export const NSE_SORTED: readonly NSE[] = [
  'RESIDENCIAL A',
  'RESIDENCIAL B',
  'RESIDENCIAL C',
  'RESIDENCIAL D',
  'RESIDENCIAL E',
  'COMERCIAL 1ª.',
  'COMERCIAL 2ª.',
  'COMERCIAL 3ª.',
  'INDUSTRIAL LIGERA',
  'INDUSTRIAL MEDIANA',
  'INDUSTRIAL PESADA',
  'LOTE BALDÍO',
] as const;

export interface DistritoRecord {
  'user!_distrito': string;
  'user!_limite':   string; // geometría serializada (mock como id)
}

export interface DetalleLoteRecord {
  'user!_nivel_socio':         NSE;
  'user!_cantidad_servicios':  number;
}

export interface LoteRecord {
  'user!_lote':            string;
  'user!_distrito_ref':    string; // FK al distrito
  'user!_limite':          string; // dentro del :limite del distrito
  'user!_detalle_lotes':   DetalleLoteRecord[];
}

// Mock de smallworld_product.pni_application().database.collection(...)
export interface MockLandbaseDB {
  distritos:    DistritoRecord[];
  lotes:        LoteRecord[];
  detalleLote?: DetalleLoteRecord[]; // referencia opcional al collection raíz
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const VALOR_DEFECTO = 'vacio';

// Magik: obten_inicial_NSE(PsNSE)  →  abreviatura
export const NSE_INITIAL: Record<NSE, string> = {
  'INDUSTRIAL LIGERA':  'IL',
  'INDUSTRIAL PESADA':  'IP',
  'INDUSTRIAL MEDIANA': 'IM',
  'RESIDENCIAL A':      'A',
  'RESIDENCIAL B':      'B',
  'RESIDENCIAL C':      'C',
  'RESIDENCIAL D':      'D',
  'RESIDENCIAL E':      'E',
  'COMERCIAL 1ª.':      '1ª',
  'COMERCIAL 2ª.':      '2ª',
  'COMERCIAL 3ª.':      '3ª',
  'LOTE BALDÍO':        'LB',
};

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_distrito_e. Representa los datos agregados de un distrito.
 * Los slots se rellenan lazy-mente cuando se asigna `distrito = "..."` o
 * cuando se invoca uno de los getters de totales/NSE.
 */
export class CDistritoE {
  // ── Slots (D1: prefijo _, D3: readonly si solo getter en Magik) ──────────
  private _sDistrito:         string | undefined        = undefined;
  private _sNSE_Predominante: string | undefined        = undefined;
  private _sTotal_Viviendas:  number | undefined        = undefined;
  private _sTotal_Lineas:     number | undefined        = undefined;
  private _oDto:              DistritoRecord | undefined = undefined; // public en Magik
  private _collLotes:         LoteRecord[] | undefined   = undefined;
  private _collNumViv:        Map<NSE, number> | undefined = undefined;
  private _collNumLin:        Map<NSE, number> | undefined = undefined;
  private readonly _sValor_Defecto = VALOR_DEFECTO;
  private _collDet_Lote:      DetalleLoteRecord[] | undefined = undefined;

  // Magik: la BD viene de smallworld_product.pni_application().database
  // En TS se inyecta.
  constructor(private readonly _db: MockLandbaseDB) {
    // Magik: _self.collDet_Lote << LoPAF.database.collection(:landbase,:user!_detalle_lote)
    // Se rellena al primer leer_distrito (igual que el original).
  }

  // ── version() ────────────────────────────────────────────────────────────
  static version(): string {
    return 'version 1.00.00.04 08/04/05 22:45 ';
  }

  // ── Acceso público a oDto ────────────────────────────────────────────────
  get oDto(): DistritoRecord | undefined { return this._oDto; }
  set oDto(v: DistritoRecord | undefined) { this._oDto = v; }

  // ── distrito (getter + setter — Magik: .distrito << RsValor) ─────────────
  get distrito(): string | undefined { return this._sDistrito; }
  set distrito(value: string) {
    this._sDistrito = value;
    // Magik: prvLeer_Distrito_BdD() + prvObtener_NumViv_Lineas_por_Dto(collLotes)
    this._prvLeer_Distrito_BdD();
    if (this._collLotes) {
      this._prvObtener_NumViv_Lineas_por_Dto(this._collLotes);
    }
  }

  // ── existe? ──────────────────────────────────────────────────────────────
  get existe(): boolean { return this._oDto !== undefined; }

  // ── sNSE_predominante ────────────────────────────────────────────────────
  get sNSE_Predominante(): string {
    if (!this._prvValida_Distrito()) return this._sValor_Defecto;
    if (this._sNSE_Predominante === undefined) {
      this._prvGeneraNSE_predominante();
    }
    return String(this._sNSE_Predominante);
  }

  // ── sTotal_Viviendas ─────────────────────────────────────────────────────
  // Bug del Magik: el original chequea .sTotal_Lineas en lugar de
  // .sTotal_Viviendas. Aquí preservamos la condición original (chequeo único
  // sobre Lineas, ya que ambos totales se generan a la vez) — equivalente
  // funcional.
  get sTotal_Viviendas(): string {
    if (!this._prvValida_Distrito()) return this._sValor_Defecto;
    if (this._sTotal_Lineas === undefined) {
      this._prvGeneraTotales_Viviendas_Lineas();
    }
    return String(this._sTotal_Viviendas);
  }

  // ── sTotal_Lineas ────────────────────────────────────────────────────────
  get sTotal_Lineas(): string {
    if (!this._prvValida_Distrito()) return this._sValor_Defecto;
    if (this._sTotal_Lineas === undefined) {
      this._prvGeneraTotales_Viviendas_Lineas();
    }
    return String(this._sTotal_Lineas);
  }

  // ── numero_Viviendas_NSE ─────────────────────────────────────────────────
  // Magik: si !valida → si collDet_Lote unset devuelve valor_defecto; en
  // otro caso devuelve vector inicializado a -1.
  numero_Viviendas_NSE(): Map<NSE, number> | string {
    if (this._prvValida_Distrito()) {
      return this._collNumViv ?? this.crea_inicializa_vector(0);
    }
    if (this._collDet_Lote === undefined) return this._sValor_Defecto;
    return this.crea_inicializa_vector(-1);
  }

  // ── numero_Lineas_NSE ────────────────────────────────────────────────────
  numero_Lineas_NSE(): Map<NSE, number> | string {
    if (this._prvValida_Distrito()) {
      return this._collNumLin ?? this.crea_inicializa_vector(0);
    }
    if (this._collDet_Lote === undefined) return this._sValor_Defecto;
    return this.crea_inicializa_vector(-1);
  }

  // ── crea_inicializa_vector(PnValor) ──────────────────────────────────────
  // Magik: itera el enumerador de :user!_nivel_socio y crea hash_table
  // {NSE → valor}.
  crea_inicializa_vector(valor: number): Map<NSE, number> {
    const m = new Map<NSE, number>();
    for (const nse of NSE_SORTED) m.set(nse, valor);
    return m;
  }

  // ── obten_inicial_NSE(PsNSE) ─────────────────────────────────────────────
  obten_inicial_NSE(nse: string): string {
    return NSE_INITIAL[nse as NSE] ?? '';
  }

  // ── prvValida_Distrito() ─────────────────────────────────────────────────
  private _prvValida_Distrito(): boolean {
    return this._oDto !== undefined;
  }

  // ── prvLeer_Distrito_BdD() ───────────────────────────────────────────────
  // Magik: LoPAF.database.collection(:landbase, :user!_distrito)
  //        .select(predicate.eq(:user!_distrito, _self.sDistrito)).an_element()
  //        + predicate.within(:user!_limite, oDto.user!_limite) → collLotes
  //        + .collDet_Lote << collection(:landbase, :user!_detalle_lote)
  private _prvLeer_Distrito_BdD(): void {
    const id = this._sDistrito;
    if (id === undefined) {
      this._oDto = undefined;
      this._collLotes = undefined;
      return;
    }

    this._oDto = this._db.distritos.find(d => d['user!_distrito'] === id);

    if (this._oDto !== undefined) {
      // predicate.within(:user!_limite, oDto.user!_limite)
      const limite = this._oDto['user!_limite'];
      this._collLotes = this._db.lotes.filter(l => l['user!_limite'] === limite);
    } else {
      this._collLotes = undefined;
    }

    // Magik: siempre se asigna (incluso si oDto unset)
    this._collDet_Lote =
      this._db.detalleLote ??
      // Por defecto, todos los detalles de todos los lotes registrados
      this._db.lotes.flatMap(l => l['user!_detalle_lotes']);
  }

  // ── prvObtener_NumViv_Lineas_por_Lote(RoLote) ────────────────────────────
  private _prvObtener_NumViv_Lineas_por_Lote(
    lote: LoteRecord,
  ): { viv: Map<NSE, number>; lin: Map<NSE, number> } | { viv: undefined; lin: undefined } {
    if (!this._prvValida_Distrito()) return { viv: undefined, lin: undefined };

    const viv = this.crea_inicializa_vector(0);
    const lin = this.crea_inicializa_vector(0);

    for (const det of lote['user!_detalle_lotes']) {
      const nse = det['user!_nivel_socio'];
      viv.set(nse, (viv.get(nse) ?? 0) + 1);
      lin.set(nse, (lin.get(nse) ?? 0) + det['user!_cantidad_servicios']);
    }
    return { viv, lin };
  }

  // ── prvObtener_NumViv_Lineas_por_Dto(RoLotes) ────────────────────────────
  private _prvObtener_NumViv_Lineas_por_Dto(lotes: LoteRecord[]): void {
    if (!this._prvValida_Distrito()) return;

    this._collNumViv = this.crea_inicializa_vector(0);
    this._collNumLin = this.crea_inicializa_vector(0);

    for (const lote of lotes) {
      const r = this._prvObtener_NumViv_Lineas_por_Lote(lote);
      if (r.viv && r.lin) {
        this._prvSumaVectores(this._collNumViv, r.viv);
        this._prvSumaVectores(this._collNumLin, r.lin);
      }
    }
  }

  // ── prvSumaVectores(R1, R2) ──────────────────────────────────────────────
  // Magik: condition.raise(:warning, ...) si tamaños difieren.
  private _prvSumaVectores(r1: Map<NSE, number>, r2: Map<NSE, number>): void {
    if (r1.size !== r2.size) {
      throw new Error('Las colecciones son de diferente tamaño. (CDistritoE)');
    }
    for (const k of r1.keys()) {
      r1.set(k, (r1.get(k) ?? 0) + (r2.get(k) ?? 0));
    }
  }

  // ── prvGeneraNSE_predominante() ──────────────────────────────────────────
  private _prvGeneraNSE_predominante(): void {
    if (!this._collNumViv || this._collNumViv.size === 0) return;
    let max = -Infinity;
    let pred: NSE | undefined;
    for (const [k, v] of this._collNumViv) {
      if (v > max) { max = v; pred = k; }
    }
    this._sNSE_Predominante = pred !== undefined ? String(pred) : undefined;
  }

  // ── prvGeneraTotales_Viviendas_Lineas() ──────────────────────────────────
  private _prvGeneraTotales_Viviendas_Lineas(): void {
    let tv = 0;
    let tl = 0;
    if (this._collNumViv) for (const v of this._collNumViv.values()) tv += v;
    if (this._collNumLin) for (const v of this._collNumLin.values()) tl += v;
    this._sTotal_Viviendas = tv;
    this._sTotal_Lineas    = tl;
  }

  // ── Helpers de inspección (solo UI, no en Magik) ─────────────────────────
  get collNumViv(): Map<NSE, number> | undefined { return this._collNumViv; }
  get collNumLin(): Map<NSE, number> | undefined { return this._collNumLin; }
  get collLotes(): LoteRecord[] | undefined { return this._collLotes; }
}

// =============================================================================
// Mock dataset — replica una landbase mínima para la demo
// =============================================================================

const MOCK_DB: MockLandbaseDB = {
  distritos: [
    { 'user!_distrito': 'DTO-001', 'user!_limite': 'POLY-001' },
    { 'user!_distrito': 'DTO-002', 'user!_limite': 'POLY-002' },
    { 'user!_distrito': 'DTO-003', 'user!_limite': 'POLY-003' },
  ],
  lotes: [
    {
      'user!_lote': 'L-101', 'user!_distrito_ref': 'DTO-001', 'user!_limite': 'POLY-001',
      'user!_detalle_lotes': [
        { 'user!_nivel_socio': 'RESIDENCIAL B', 'user!_cantidad_servicios': 2 },
        { 'user!_nivel_socio': 'RESIDENCIAL B', 'user!_cantidad_servicios': 1 },
        { 'user!_nivel_socio': 'COMERCIAL 1ª.', 'user!_cantidad_servicios': 3 },
      ],
    },
    {
      'user!_lote': 'L-102', 'user!_distrito_ref': 'DTO-001', 'user!_limite': 'POLY-001',
      'user!_detalle_lotes': [
        { 'user!_nivel_socio': 'RESIDENCIAL B', 'user!_cantidad_servicios': 1 },
        { 'user!_nivel_socio': 'RESIDENCIAL C', 'user!_cantidad_servicios': 2 },
      ],
    },
    {
      'user!_lote': 'L-103', 'user!_distrito_ref': 'DTO-001', 'user!_limite': 'POLY-001',
      'user!_detalle_lotes': [
        { 'user!_nivel_socio': 'LOTE BALDÍO', 'user!_cantidad_servicios': 0 },
      ],
    },
    {
      'user!_lote': 'L-201', 'user!_distrito_ref': 'DTO-002', 'user!_limite': 'POLY-002',
      'user!_detalle_lotes': [
        { 'user!_nivel_socio': 'INDUSTRIAL LIGERA', 'user!_cantidad_servicios': 4 },
        { 'user!_nivel_socio': 'INDUSTRIAL MEDIANA', 'user!_cantidad_servicios': 5 },
        { 'user!_nivel_socio': 'INDUSTRIAL MEDIANA', 'user!_cantidad_servicios': 2 },
        { 'user!_nivel_socio': 'COMERCIAL 2ª.', 'user!_cantidad_servicios': 1 },
      ],
    },
    {
      'user!_lote': 'L-202', 'user!_distrito_ref': 'DTO-002', 'user!_limite': 'POLY-002',
      'user!_detalle_lotes': [
        { 'user!_nivel_socio': 'INDUSTRIAL PESADA', 'user!_cantidad_servicios': 6 },
        { 'user!_nivel_socio': 'INDUSTRIAL LIGERA', 'user!_cantidad_servicios': 2 },
      ],
    },
    // DTO-003 → sin lotes (caso borde)
  ],
};

// =============================================================================
// Componente React — CDistritoEUI
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
  cardTitle: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  label:     { color: '#89dceb', fontSize: 11, marginRight: 6 } as React.CSSProperties,
  value:     { color: '#a6e3a1', fontSize: 11 } as React.CSSProperties,
  btn:       {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6,
  } as React.CSSProperties,
  table:     { borderCollapse: 'collapse' as const, width: '100%', marginTop: 4 },
  th:        {
    background: '#313244', color: '#cba6f7', textAlign: 'left' as const,
    padding: '4px 8px', border: '1px solid #45475a', fontSize: 11,
  },
  td:        { border: '1px solid #45475a', padding: '3px 8px', fontSize: 11 },
  pill:      (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 8px', borderRadius: 10, fontSize: 10,
    background: ok ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e', marginLeft: 6,
  }),
};

const DISTRITOS_DEMO = ['DTO-001', 'DTO-002', 'DTO-003', 'DTO-INEXISTENTE'] as const;

export function CDistritoEUI() {
  const [selected, setSelected] = useState<string>('DTO-001');
  const [tick, setTick] = useState(0);
  const force = () => setTick(t => t + 1);

  const dto = useMemo(() => {
    const inst = new CDistritoE(MOCK_DB);
    inst.distrito = selected;
    return inst;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, tick]);

  const numViv = dto.numero_Viviendas_NSE();
  const numLin = dto.numero_Lineas_NSE();

  const nsesConDatos = NSE_SORTED.filter(nse => {
    if (numViv instanceof Map && (numViv.get(nse) ?? 0) > 0) return true;
    if (numLin instanceof Map && (numLin.get(nse) ?? 0) > 0) return true;
    return false;
  });

  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CDistritoE</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          modelo dominio distrito · agrega viviendas/líneas por NSE
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 10 }}>
          ({CDistritoE.version().trim()})
        </span>
      </div>

      {/* Selector */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>distrito = "..." (asigna setter → lee BD)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {DISTRITOS_DEMO.map(d => (
            <button
              key={d}
              onClick={() => { setSelected(d); force(); }}
              style={{
                ...styles.btn,
                background: selected === d ? '#89b4fa' : '#313244',
                color: selected === d ? '#1e1e2e' : '#bac2de',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Estado del slot oDto */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          oDto (predicate.eq :user!_distrito)
          <span style={styles.pill(dto.existe)}>{dto.existe ? 'existe?' : 'no existe'}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <span><span style={styles.label}>distrito:</span><span style={styles.value}>{dto.distrito ?? '—'}</span></span>
          <span><span style={styles.label}>limite:</span><span style={styles.value}>{dto.oDto?.['user!_limite'] ?? '—'}</span></span>
          <span><span style={styles.label}>lotes (collLotes.size):</span><span style={styles.value}>{dto.collLotes?.length ?? 0}</span></span>
          <span><span style={styles.label}>NSE predominante:</span><span style={styles.value}>{dto.sNSE_Predominante}</span></span>
          <span><span style={styles.label}>total viviendas:</span><span style={styles.value}>{dto.sTotal_Viviendas}</span></span>
          <span><span style={styles.label}>total líneas:</span><span style={styles.value}>{dto.sTotal_Lineas}</span></span>
        </div>
      </div>

      {/* Tabla agregada por NSE */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          numero_Viviendas_NSE() / numero_Lineas_NSE()  ·  obten_inicial_NSE(NSE)
        </div>
        {(numViv instanceof Map) ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>NSE</th>
                <th style={styles.th}>inicial</th>
                <th style={styles.th}>viviendas</th>
                <th style={styles.th}>líneas</th>
              </tr>
            </thead>
            <tbody>
              {nsesConDatos.length === 0 && (
                <tr><td colSpan={4} style={{ ...styles.td, color: '#585b70', textAlign: 'center' }}>
                  Sin movimientos en este distrito.
                </td></tr>
              )}
              {nsesConDatos.map(nse => (
                <tr key={nse}>
                  <td style={styles.td}>{nse}</td>
                  <td style={{ ...styles.td, color: '#fab387' }}>{dto.obten_inicial_NSE(nse)}</td>
                  <td style={{ ...styles.td, color: '#a6e3a1' }}>{(numViv as Map<NSE, number>).get(nse) ?? 0}</td>
                  <td style={{ ...styles.td, color: '#89b4fa' }}>{(numLin as Map<NSE, number>).get(nse) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#f38ba8', fontSize: 11 }}>
            Vector devuelve "{String(numViv)}" — distrito inválido y sin collDet_Lote.
          </div>
        )}
      </div>

      {/* Lotes raw */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>collLotes (predicate.within :user!_limite)</div>
        {(dto.collLotes && dto.collLotes.length > 0) ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>lote</th>
                <th style={styles.th}>detalle_lotes</th>
                <th style={styles.th}>Σ servicios</th>
              </tr>
            </thead>
            <tbody>
              {dto.collLotes.map(l => {
                const sumServ = l['user!_detalle_lotes'].reduce((a, d) => a + d['user!_cantidad_servicios'], 0);
                return (
                  <tr key={l['user!_lote']}>
                    <td style={styles.td}>{l['user!_lote']}</td>
                    <td style={{ ...styles.td, color: '#bac2de' }}>
                      {l['user!_detalle_lotes'].map((d, i) => (
                        <span key={i} style={{ marginRight: 6 }}>
                          {dto.obten_inicial_NSE(d['user!_nivel_socio'])}×{d['user!_cantidad_servicios']}
                        </span>
                      ))}
                    </td>
                    <td style={{ ...styles.td, color: '#89b4fa' }}>{sumServ}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#585b70', fontSize: 11 }}>—</div>
        )}
      </div>
    </div>
  );
}
