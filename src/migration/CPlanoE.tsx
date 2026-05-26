// =============================================================================
// MIGRACIÓN: c_plano_e  →  CPlanoE.tsx
// Jerarquía Magik: c_plano_e (clase raíz, sin parent)
// Fuente: adiciones_layout/source/Sellos/Entidad/c_plano_e.magik
// Empresa: Sigma Tao  ·  Autor: vbluna  ·  19/12/2005
// =============================================================================
//
// Modelo de dominio "Plano" — wrapper de solo lectura sobre un registro
// :user!_plano. Construido a partir de un PlanoRecord (campos `user!_*`),
// expone 4 getters: Proyecto / Nombre / Tipo (UPPERCASE) / Comentario.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos (D5 — XxxRecord para campos user!_*)
// ---------------------------------------------------------------------------

export interface PlanoRecord {
  'user!_proyecto':   string;
  'user!_nombre':     string;
  'user!_tipo':       string;
  'user!_comentario': string | undefined;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_plano_e. Solo lectura — todos los slots se rellenan en el
 * ctor desde un PlanoRecord y nunca se modifican (D3: readonly).
 */
export class CPlanoE {
  // ── Slots (D1: prefijo _, D3: readonly por ser solo getter en Magik) ─────
  private readonly _sProyecto:   string;
  private readonly _sNombre:     string;
  private readonly _sTipo:       string;
  private readonly _sComentario: string | undefined;

  // ── Magik: new(PoPlano) → _clone.init(PoPlano) ──────────────────────────
  // En TS: ctor estándar (regla D2 — no se emite new()/init() como métodos).
  constructor(poPlano: PlanoRecord) {
    this._sProyecto   = poPlano['user!_proyecto'];
    this._sNombre     = poPlano['user!_nombre'];
    this._sTipo       = poPlano['user!_tipo'];
    this._sComentario = poPlano['user!_comentario'];
  }

  // ── Proyecto ─────────────────────────────────────────────────────────────
  get Proyecto(): string { return this._sProyecto; }

  // ── Nombre ───────────────────────────────────────────────────────────────
  get Nombre(): string { return this._sNombre; }

  // ── Tipo — Magik: >> .sTipo.uppercase (D6) ──────────────────────────────
  get Tipo(): string { return this._sTipo.toUpperCase(); }

  // ── Comentario ───────────────────────────────────────────────────────────
  get Comentario(): string | undefined { return this._sComentario; }
}

// =============================================================================
// Componente React — CPlanoEUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 700,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  vmuted:{ color: '#fab387' } as React.CSSProperties,
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 260, marginLeft: 4,
  } as React.CSSProperties,
};

// Catálogo de planos de ejemplo
const PLANOS_DEMO: { id: string; record: PlanoRecord }[] = [
  {
    id: 'roma-construccion',
    record: {
      'user!_proyecto':   'CAN0001 — Roma Norte FO',
      'user!_nombre':     'Plano FCYDG Roma',
      'user!_tipo':       'construccion',
      'user!_comentario': 'Revisión 2 — incluye derivaciones nuevas',
    },
  },
  {
    id: 'polanco-topo',
    record: {
      'user!_proyecto':   'CAN0002 — Polanco Backbone',
      'user!_nombre':     'Plano Topológico Polanco',
      'user!_tipo':       'topologico',
      'user!_comentario': undefined,
    },
  },
  {
    id: 'centro-permisos',
    record: {
      'user!_proyecto':   'CAN0003 — Centro Reubicación',
      'user!_nombre':     'Plano de Permisos SCT',
      'user!_tipo':       'permisos',
      'user!_comentario': 'Pendiente firma del responsable de área',
    },
  },
];

function Field({ label, value, highlight = false }: { label: string; value: string | undefined; highlight?: boolean }) {
  const empty = value === undefined;
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={empty ? styles.empty : (highlight ? styles.vmuted : styles.v)}>
        {empty ? '— (undefined)' : value}
      </span>
    </div>
  );
}

export function CPlanoEUI() {
  const [demoId, setDemoId] = useState<string>('roma-construccion');
  const [tipoCustom, setTipoCustom] = useState<string>('mIxEd cAsE');

  const plano = useMemo(() => {
    const demo = PLANOS_DEMO.find(d => d.id === demoId) ?? PLANOS_DEMO[0];
    return new CPlanoE(demo.record);
  }, [demoId]);

  // Demo de la regla D6 — .sTipo.uppercase → .toUpperCase()
  const planoCustom = useMemo(() => new CPlanoE({
    'user!_proyecto':   '(custom)',
    'user!_nombre':     '(custom)',
    'user!_tipo':       tipoCustom,
    'user!_comentario': undefined,
  }), [tipoCustom]);

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CPlanoE</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          modelo dominio · wrapper readonly sobre :user!_plano
        </span>
      </div>

      {/* Selector de plano de ejemplo */}
      <div style={styles.card}>
        <div style={styles.title}>new(PoPlano) — PlanoRecord → CPlanoE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PLANOS_DEMO.map(d => (
            <button
              key={d.id}
              onClick={() => setDemoId(d.id)}
              style={{
                ...styles.btn,
                background: demoId === d.id ? '#89b4fa' : '#313244',
                color:      demoId === d.id ? '#1e1e2e' : '#bac2de',
              }}
            >
              {d.record['user!_nombre']}
            </button>
          ))}
        </div>
      </div>

      {/* Getters del plano seleccionado */}
      <div style={styles.card}>
        <div style={styles.title}>4 getters readonly</div>
        <Field label="Proyecto"    value={plano.Proyecto} />
        <Field label="Nombre"      value={plano.Nombre} />
        <Field label="Tipo"        value={plano.Tipo} highlight />
        <Field label="Comentario"  value={plano.Comentario} />
        <div style={{ fontSize: 10, color: '#585b70', marginTop: 6 }}>
          <code>Tipo</code> aplica <code>toUpperCase()</code> (regla D6 —
          <code>.sTipo.uppercase</code> del Magik).
        </div>
      </div>

      {/* Demo regla D6 */}
      <div style={styles.card}>
        <div style={styles.title}>D6 en vivo — .sTipo.uppercase → toUpperCase()</div>
        <label>
          <span style={styles.k}>input user!_tipo:</span>
          <input
            value={tipoCustom}
            onChange={e => setTipoCustom(e.target.value)}
            style={styles.input}
          />
        </label>
        <Field label="get Tipo (uppercase)" value={planoCustom.Tipo} highlight />
      </div>

      {/* Inspector del record raw */}
      <div style={styles.card}>
        <div style={styles.title}>PlanoRecord (entrada del ctor)</div>
        {(['user!_proyecto', 'user!_nombre', 'user!_tipo', 'user!_comentario'] as const).map(k => {
          const demo = PLANOS_DEMO.find(d => d.id === demoId) ?? PLANOS_DEMO[0];
          const v = demo.record[k];
          return <Field key={k} label={k} value={v === undefined ? undefined : String(v)} />;
        })}
      </div>
    </div>
  );
}
