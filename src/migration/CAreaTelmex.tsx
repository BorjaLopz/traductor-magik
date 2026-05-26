// =============================================================================
// MIGRACIÓN: c_area_telmex  →  CAreaTelmex.tsx
// Jerarquía Magik: c_area_telmex (clase raíz, sin parent)
// Fuente: adiciones_layout/source/Sellos/Entidad/c_area_telmex.magik
// Autor: vbluna
// =============================================================================
//
// Modelo de "Área Telmex" para sellos de plano. Dado el nombre de un área,
// consulta la colección :landbase :user!_area, navega el campo .infoadmin
// y expone tres getters: direccion / telefono / responsable.
//
// El Magik usa `gis_program_manager.cached_dataset(:landbase)`. En TS se
// inyecta un MockLandbaseAreaDB con la misma forma. Todo el código está
// envuelto en _try _when does_not_understand → en TS se traduce a
// try/catch que devuelve '' / undefined cuando el navegado falla.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos (D5 — XxxRecord para campos user!_*)
// ---------------------------------------------------------------------------

// Sub-record almacenado en `.infoadmin` del registro :user!_area
export interface AreaInfoAdminRecord {
  'user!_direccion':   string;
  'user!_telefono':    string;
  'user!_responsable': string;
}

export interface AreaRecord {
  'user!_nombre': string;
  // infoadmin es una colección Smallworld; .an_element() devuelve el primer
  // AreaInfoAdminRecord. Aquí se modela como Array<AreaInfoAdminRecord>.
  infoadmin:      AreaInfoAdminRecord[];
}

// Mock de gis_program_manager.cached_dataset(:landbase).collection(:user!_area)
export interface MockLandbaseAreaDB {
  areas: AreaRecord[];
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_area_telmex. Constructor toma el nombre del área y dispara
 * la consulta a la BD inyectada. Los getters envuelven el acceso a campos
 * `user!_*` con try/catch (Magik: _try _when does_not_understand _endtry).
 */
export class CAreaTelmex {
  // ── Slot único (:writable en Magik) ──────────────────────────────────────
  objeto: AreaInfoAdminRecord | undefined = undefined;

  // ── Magik: new(PsNombre) → _clone.init(PsNombre) ─────────────────────────
  constructor(psNombre: string, private readonly _db: MockLandbaseAreaDB) {
    // init() del Magik se colapsa en el ctor (regla D2).
    this.objeto_area(psNombre);
  }

  // ── objeto_area(PsNombre) ────────────────────────────────────────────────
  // Magik:
  //   LtbArea << gis_program_manager.cached_dataset(:landbase)
  //                                  .collection(:user!_area)
  //   LoPred  << predicate.eq(:user!_nombre, PsNombre)
  //   .objeto << LtbArea.select(LoPred).an_element().infoadmin.an_element()
  // Si algo falla → write("Error al asignar el area") (lateral, sin throw).
  objeto_area(psNombre: string): void {
    try {
      const area = this._db.areas.find(a => a['user!_nombre'] === psNombre);
      // .an_element() encadenados → primer hit + primer infoadmin
      this.objeto = area?.infoadmin?.[0];
    } catch {
      // Magik: write("Error al asignar el area")
      this.objeto = undefined;
    }
  }

  // ── direccion ────────────────────────────────────────────────────────────
  direccion(): string {
    try {
      return String(this.objeto!['user!_direccion']);
    } catch {
      return '';
    }
  }

  // ── telefono ─────────────────────────────────────────────────────────────
  telefono(): string {
    try {
      return String(this.objeto!['user!_telefono']);
    } catch {
      return '';
    }
  }

  // ── responsable ──────────────────────────────────────────────────────────
  responsable(): string {
    try {
      return String(this.objeto!['user!_responsable']);
    } catch {
      return '';
    }
  }
}

// =============================================================================
// Mock dataset
// =============================================================================

const MOCK_DB: MockLandbaseAreaDB = {
  areas: [
    {
      'user!_nombre': 'AREA CENTRO',
      infoadmin: [{
        'user!_direccion':   'Av. Insurgentes Sur 1234, Col. Roma Norte',
        'user!_telefono':    '55-1234-5678',
        'user!_responsable': 'Ing. C. Hernández',
      }],
    },
    {
      'user!_nombre': 'AREA NORTE',
      infoadmin: [{
        'user!_direccion':   'Calzada de Guadalupe 4500, Col. Lindavista',
        'user!_telefono':    '55-9876-5432',
        'user!_responsable': 'Ing. L. Pérez',
      }],
    },
    {
      'user!_nombre': 'AREA SUR',
      infoadmin: [{
        'user!_direccion':   'Av. División del Norte 2900, Col. Portales',
        'user!_telefono':    '55-5555-1111',
        'user!_responsable': 'Ing. R. García',
      }],
    },
    {
      'user!_nombre': 'AREA SIN INFO',
      // infoadmin vacío → .an_element() devuelve unset → todos los getters ''
      infoadmin: [],
    },
  ],
};

// =============================================================================
// Componente React — CAreaTelmexUI
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
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  pill: (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 8px', borderRadius: 10, fontSize: 10,
    background: ok ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e', marginLeft: 6,
  }),
};

function Field({ label, value }: { label: string; value: string }) {
  const empty = value === '';
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={empty ? styles.empty : styles.v}>
        {empty ? '— (does_not_understand → "")' : value}
      </span>
    </div>
  );
}

const NOMBRES = ['AREA CENTRO', 'AREA NORTE', 'AREA SUR', 'AREA SIN INFO', 'AREA INEXISTENTE'] as const;

export function CAreaTelmexUI() {
  const [nombre, setNombre] = useState<string>('AREA CENTRO');

  const area = useMemo(() => new CAreaTelmex(nombre, MOCK_DB), [nombre]);
  const tieneObjeto = area.objeto !== undefined;

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CAreaTelmex</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          modelo dominio · landbase :user!_area → infoadmin
        </span>
      </div>

      {/* Selector */}
      <div style={styles.card}>
        <div style={styles.title}>new(PsNombre) — predicate.eq(:user!_nombre, ...)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {NOMBRES.map(n => (
            <button
              key={n}
              onClick={() => setNombre(n)}
              style={{
                ...styles.btn,
                background: nombre === n ? '#89b4fa' : '#313244',
                color:      nombre === n ? '#1e1e2e' : '#bac2de',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, marginTop: 6 }}>
          <span style={styles.k}>.objeto resuelto:</span>
          <span style={styles.pill(tieneObjeto)}>
            {tieneObjeto ? 'AreaInfoAdminRecord encontrado' : 'unset (área sin info o inexistente)'}
          </span>
        </div>
      </div>

      {/* Getters */}
      <div style={styles.card}>
        <div style={styles.title}>getters — .objeto.user!_xxx.write_string</div>
        <Field label="direccion()"   value={area.direccion()} />
        <Field label="telefono()"    value={area.telefono()} />
        <Field label="responsable()" value={area.responsable()} />
      </div>

      {/* Dataset crudo */}
      <div style={styles.card}>
        <div style={styles.title}>landbase mock — :user!_area</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #45475a', padding: '3px 8px', background: '#313244', color: '#cba6f7', textAlign: 'left', fontSize: 11 }}>nombre</th>
              <th style={{ border: '1px solid #45475a', padding: '3px 8px', background: '#313244', color: '#cba6f7', textAlign: 'left', fontSize: 11 }}>infoadmin.size</th>
              <th style={{ border: '1px solid #45475a', padding: '3px 8px', background: '#313244', color: '#cba6f7', textAlign: 'left', fontSize: 11 }}>responsable</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DB.areas.map(a => (
              <tr key={a['user!_nombre']} style={{ background: nombre === a['user!_nombre'] ? '#1e3a5a' : 'transparent' }}>
                <td style={{ border: '1px solid #45475a', padding: '3px 8px', fontSize: 11 }}>{a['user!_nombre']}</td>
                <td style={{ border: '1px solid #45475a', padding: '3px 8px', fontSize: 11, color: '#89b4fa' }}>{a.infoadmin.length}</td>
                <td style={{ border: '1px solid #45475a', padding: '3px 8px', fontSize: 11, color: '#a6e3a1' }}>
                  {a.infoadmin[0]?.['user!_responsable'] ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
