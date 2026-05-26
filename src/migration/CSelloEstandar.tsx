// =============================================================================
// MIGRACIÓN: c_sello_estandar  →  CSelloEstandar.tsx
// Jerarquía Magik: c_sello_estandar (clase raíz, sin parent)
// Fuente: adiciones_layout/source/Sellos/c_sello_estandar.magik
// Empresa: Sigma Tao  ·  Autor: Alejandro Díaz  ·  02/02/2005
// =============================================================================
//
// Factory de sellos estándar. Único método de instancia: crea_sello(nombre,
// bounding) → devuelve una instancia de la subclase concreta según el
// nombre solicitado:
//
//   "CONSTRUCCION"      → c_sello_estandar_construccion
//   "DIAGRAMA_EMPALMES" → c_sello_estandar_diag_empal
//   <cualquier otro>    → c_sello_estandar_ctl_edo  (default — estado/ctl)
//
// Las 3 subclases NO están migradas — se stubbean con clases mínimas que
// guardan los bounds y exponen tipo. Cuando se migren las reales,
// reemplazar los stubs por sus imports.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

// Magik: bounding_box.new(xmin, ymin, xmax, ymax)
export interface Bounds {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

// Magik: nombres aceptados por la fábrica
export type NombreSello =
  | 'CONSTRUCCION'
  | 'DIAGRAMA_EMPALMES'
  | (string & {}); // permite "otro" → rama default

// Magik: define_shared_constant :allowed_on_menu?
export const ALLOWED_ON_MENU = false;

// ---------------------------------------------------------------------------
// Stubs de las 3 subclases concretas
// ---------------------------------------------------------------------------

// Magik: new_with(:bounds, RoBounding) — keyword constructor.
export interface SelloNewWithOpts {
  bounds: Bounds;
}

// Base común para los stubs — guarda los bounds y expone tipo.
abstract class SelloEstandarBase {
  abstract readonly tipo: string;
  bounds: Bounds;

  constructor(opts: SelloNewWithOpts) {
    this.bounds = opts.bounds;
  }
}

// Magik: c_sello_estandar_construccion
export class CSelloEstandarConstruccion extends SelloEstandarBase {
  readonly tipo = 'c_sello_estandar_construccion';
}

// Magik: c_sello_estandar_diag_empal
export class CSelloEstandarDiagEmpal extends SelloEstandarBase {
  readonly tipo = 'c_sello_estandar_diag_empal';
}

// Magik: c_sello_estandar_ctl_edo
export class CSelloEstandarCtlEdo extends SelloEstandarBase {
  readonly tipo = 'c_sello_estandar_ctl_edo';
}

// Unión usable por el cliente
export type SelloEstandar =
  | CSelloEstandarConstruccion
  | CSelloEstandarDiagEmpal
  | CSelloEstandarCtlEdo;

// ---------------------------------------------------------------------------
// Clase principal — fábrica
// ---------------------------------------------------------------------------

export class CSelloEstandar {
  // Magik: define_shared_constant :allowed_on_menu?  = _false
  static readonly allowed_on_menu = ALLOWED_ON_MENU;

  // Sin slots — el def_slotted_exemplar declara {} vacío.

  // ── crea_sello(RsNomSello, RoBounding) ──────────────────────────────────
  // Magik: switch _if/_elif/_else por nombre. La rama default (06/05/05
  // DSB) usa el sello de estado/ctl, no el de localidad como hacía antes.
  crea_sello(rsNomSello: NombreSello, roBounding: Bounds): SelloEstandar {
    if (rsNomSello === 'CONSTRUCCION') {
      return new CSelloEstandarConstruccion({ bounds: roBounding });
    }
    if (rsNomSello === 'DIAGRAMA_EMPALMES') {
      return new CSelloEstandarDiagEmpal({ bounds: roBounding });
    }
    // default — anteriormente era el sello de localidad; cambiado a
    // ctl_edo el 06/05/05 por DSB.
    return new CSelloEstandarCtlEdo({ bounds: roBounding });
  }
}

// =============================================================================
// Componente React — CSelloEstandarUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 720,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '210px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  vmuted:{ color: '#fab387' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 70, marginLeft: 4,
  } as React.CSSProperties,
  textInput: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 200, marginLeft: 4,
  } as React.CSSProperties,
};

function Field({ label, value, muted = false }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={muted ? styles.vmuted : styles.v}>{value}</span>
    </div>
  );
}

const NOMBRES_DEMO = ['CONSTRUCCION', 'DIAGRAMA_EMPALMES', 'CTL_EDO', 'OTRO_NOMBRE'] as const;

const TIPO_COLOR: Record<string, string> = {
  c_sello_estandar_construccion: '#a6e3a1',
  c_sello_estandar_diag_empal:   '#89b4fa',
  c_sello_estandar_ctl_edo:      '#fab387',
};

export function CSelloEstandarUI() {
  const [nombre, setNombre] = useState<string>('CONSTRUCCION');
  const [bounds, setBounds] = useState<Bounds>({ xmin: 0, ymin: 0, xmax: 200, ymax: 80 });

  const factory = useMemo(() => new CSelloEstandar(), []);
  const sello = useMemo(() => factory.crea_sello(nombre, bounds), [factory, nombre, bounds]);
  const tipoColor = TIPO_COLOR[sello.tipo] ?? '#cdd6f4';

  const isDefault = nombre !== 'CONSTRUCCION' && nombre !== 'DIAGRAMA_EMPALMES';

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CSelloEstandar</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          factory · dispatch por nombre a subclase concreta
        </span>
      </div>

      {/* Selector de nombre */}
      <div style={styles.card}>
        <div style={styles.title}>crea_sello(RsNomSello, RoBounding) — dispatch _if/_elif/_else</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {NOMBRES_DEMO.map(n => (
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
        <label>
          <span style={styles.k}>RsNomSello libre:</span>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={styles.textInput}
          />
        </label>
        {isDefault && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#fab387' }}>
            ⚠ Nombre no reconocido — cae en la rama default (ctl_edo).
            Cambio del 06/05/05 DSB: antes era el sello de localidad.
          </div>
        )}
      </div>

      {/* Controles de bounds */}
      <div style={styles.card}>
        <div style={styles.title}>RoBounding (:bounds → new_with)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['xmin', 'ymin', 'xmax', 'ymax'] as const).map(k => (
            <label key={k}>
              <span style={styles.k}>{k}:</span>
              <input
                type="number"
                value={bounds[k]}
                onChange={e => setBounds(b => ({ ...b, [k]: Number(e.target.value) }))}
                style={styles.input}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div style={styles.card}>
        <div style={styles.title}>resultado — instancia generada</div>
        <Field label="instance.tipo"     value={<span style={{ color: tipoColor }}>{sello.tipo}</span>} />
        <Field label="instance.bounds"   value={`[${sello.bounds.xmin},${sello.bounds.ymin}] → [${sello.bounds.xmax},${sello.bounds.ymax}]`} />
        <Field
          label="ancho × alto"
          value={`${sello.bounds.xmax - sello.bounds.xmin} × ${sello.bounds.ymax - sello.bounds.ymin}`}
        />
        <Field label="ramea seleccionada" value={
          nombre === 'CONSTRUCCION'      ? '_if'
          : nombre === 'DIAGRAMA_EMPALMES' ? '_elif'
          : '_else (default)'
        } muted={isDefault} />
      </div>

      {/* Shared constant */}
      <div style={styles.card}>
        <div style={styles.title}>define_shared_constant</div>
        <Field label="allowed_on_menu?" value={String(CSelloEstandar.allowed_on_menu)} />
        <div style={{ fontSize: 10, color: '#585b70', marginTop: 4 }}>
          Constante <code>false</code> heredable por subclases — el sello
          base no aparece en el menú del usuario.
        </div>
      </div>

      {/* Preview gráfico del bounds */}
      <div style={styles.card}>
        <div style={styles.title}>preview del bounds</div>
        <div style={{
          width: 260, height: 130, background: '#11111b',
          border: '1px solid #45475a', borderRadius: 4, position: 'relative',
        }}>
          <svg width={260} height={130} viewBox="0 0 260 130">
            <rect
              x={20} y={20} width={220} height={90}
              fill="none" stroke={tipoColor} strokeWidth={1.5}
              strokeDasharray={isDefault ? '4,3' : 'none'}
            />
            <text
              x={130} y={70} textAnchor="middle" fill={tipoColor}
              fontFamily="monospace" fontSize={11}
            >
              {sello.tipo.replace('c_sello_estandar_', '')}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
