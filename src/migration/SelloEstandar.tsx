/**
 * Migración de: c_sello_estandar.magik
 * Clase Magik:  c_sello_estandar  —  Sigma Tao / Alejandro Díaz / 2005-02-02
 *
 * Patrón Factory: dado el nombre de un sello y un bounding box,
 * instancia la clase de sello correspondiente (construcción, diagrama
 * de empalmes o control de estado/localidad).
 *
 * Las subclases (c_sello_estandar_construccion, c_sello_estandar_diag_empal,
 * c_sello_estandar_ctl_edo) aún no han sido migradas → representadas como
 * stubs tipados que preservan la firma del factory.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Bounding box en proyección nativa del dataset. */
export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Nombres de sello reconocidos.
 * Magik: RsNomSello — string pasado a crea_sello().
 * Los dos literales son los únicos discriminados en el _if/_elif original;
 * cualquier otro valor cae en el _else (→ ctl_edo).
 */
export type SelloNombre = 'CONSTRUCCION' | 'DIAGRAMA_EMPALMES' | string;

// =============================================================================
// CLASES BASE — stubs pendientes de migración individual
// =============================================================================

/**
 * Base común para todos los sellos.
 * Magik: each .new_with(:bounds, RoBounding) → bounds es el único slot
 * compartido garantizado por la firma del factory.
 */
export abstract class SelloBase {
  readonly bounds: BoundingBox;
  abstract readonly tipo: string;

  constructor(bounds: BoundingBox) {
    this.bounds = bounds;
  }
}

/**
 * Magik: c_sello_estandar_construccion.new_with(:bounds, RoBounding)
 * Stub — pendiente de migración desde c_sello_estandar_construccion.magik
 */
export class SelloEstandarConstruccion extends SelloBase {
  readonly tipo = 'CONSTRUCCION' as const;
}

/**
 * Magik: c_sello_estandar_diag_empal.new_with(:bounds, RoBounding)
 * Stub — pendiente de migración desde c_sello_estandar_diag_empal.magik
 */
export class SelloEstandarDiagEmpal extends SelloBase {
  readonly tipo = 'DIAGRAMA_EMPALMES' as const;
}

/**
 * Magik: c_sello_estandar_ctl_edo.new_with(:bounds, RoBounding)
 * Nota: 06/05/05 DSB — renombrado de ctl_localidad a ctl_edo.
 * Stub — pendiente de migración.
 */
export class SelloEstandarCtlEdo extends SelloBase {
  readonly tipo = 'CTL_EDO' as const;
}

// =============================================================================
// CLASE PRINCIPAL — Factory
// =============================================================================

export class CSelloEstandar {

  /**
   * Magik: c_sello_estandar.crea_sello(RsNomSello, RoBounding)
   *
   *   _if RsNomSello = "CONSTRUCCION"
   *     LoSello << c_sello_estandar_construccion.new_with(:bounds, RoBounding)
   *   _elif RsNomSello = "DIAGRAMA_EMPALMES"
   *     LoSello << c_sello_estandar_diag_empal.new_with(:bounds, RoBounding)
   *   _else
   *     LoSello << c_sello_estandar_ctl_edo.new_with(:bounds, RoBounding)
   *   _endif
   *   _return LoSello
   *
   * TS: switch discriminado → instancia la clase stub apropiada.
   *     El caso default reproduce el _else de Magik (CTL_EDO para todo lo demás).
   */
  creaSello(nomSello: SelloNombre, bounds: BoundingBox): SelloBase {
    switch (nomSello) {
      case 'CONSTRUCCION':
        // c_sello_estandar_construccion.new_with(:bounds, RoBounding)
        return new SelloEstandarConstruccion(bounds);

      case 'DIAGRAMA_EMPALMES':
        // c_sello_estandar_diag_empal.new_with(:bounds, RoBounding)
        return new SelloEstandarDiagEmpal(bounds);

      default:
        // _else → c_sello_estandar_ctl_edo.new_with(:bounds, RoBounding)
        return new SelloEstandarCtlEdo(bounds);
    }
  }
}

// =============================================================================
// FUNCIÓN FACTORY PURA — atajo sin instanciar CSelloEstandar
// =============================================================================

/** Equivale a invocar directamente c_sello_estandar.crea_sello(name, bbox). */
export function creaSello(nomSello: SelloNombre, bounds: BoundingBox): SelloBase {
  return new CSelloEstandar().creaSello(nomSello, bounds);
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Selector de nombre de sello + inputs bounding box → muestra instancia creada.
// =============================================================================

const OPCIONES: SelloNombre[] = ['CONSTRUCCION', 'DIAGRAMA_EMPALMES', 'CTL_EDO'];

const DEMO_BOUNDS: BoundingBox = { xmin: 100, ymin: 100, xmax: 500, ymax: 300 };

/** Devuelve la llamada Magik equivalente para mostrar en la UI. */
function magikEquiv(nomSello: SelloNombre): string {
  switch (nomSello) {
    case 'CONSTRUCCION':
      return 'c_sello_estandar_construccion.new_with(:bounds, RoBounding)';
    case 'DIAGRAMA_EMPALMES':
      return 'c_sello_estandar_diag_empal.new_with(:bounds, RoBounding)';
    default:
      return 'c_sello_estandar_ctl_edo.new_with(:bounds, RoBounding)';
  }
}

export function SelloEstandarUI() {
  const [nomSello, setNomSello] = useState<SelloNombre>('CONSTRUCCION');
  const [bounds,   setBounds]   = useState<BoundingBox>(DEMO_BOUNDS);
  const [sello,    setSello]    = useState<SelloBase | null>(null);

  const ejecutar = () => setSello(creaSello(nomSello, bounds));

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_estandar — Factory de sellos</h3>

      {/* RsNomSello — selector de tipo */}
      <div style={s.row}>
        <label style={s.lbl}>RsNomSello</label>
        <select
          style={s.sel}
          value={nomSello}
          onChange={e => { setNomSello(e.target.value); setSello(null); }}
        >
          {OPCIONES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* RoBounding — bounding box */}
      <div style={s.grid}>
        {(['xmin', 'ymin', 'xmax', 'ymax'] as const).map(k => (
          <div key={k} style={s.row}>
            <label style={s.axLbl}>{k}</label>
            <input
              style={s.inp}
              type="number"
              value={bounds[k]}
              onChange={e => setBounds(v => ({ ...v, [k]: +e.target.value }))}
            />
          </div>
        ))}
      </div>

      <button style={s.btn} onClick={ejecutar}>crea_sello()</button>

      {/* Resultado */}
      {sello && (
        <div style={s.result}>
          <strong>Instancia creada:</strong>
          <table style={s.table}>
            <tbody>
              {[
                ['Clase TS',     sello.constructor.name],
                ['tipo',         sello.tipo],
                ['bounds.xmin',  sello.bounds.xmin],
                ['bounds.ymin',  sello.bounds.ymin],
                ['bounds.xmax',  sello.bounds.xmax],
                ['bounds.ymax',  sello.bounds.ymax],
              ].map(([k, v]) => (
                <tr key={String(k)}>
                  <td style={s.td}>{k}</td>
                  <td style={s.td}><code>{v}</code></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Equivalencia Magik */}
          <div style={s.equiv}>
            <strong>Equivalencia Magik:</strong><br />
            <code>{magikEquiv(nomSello)}</code>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame : { display: 'flex', flexDirection: 'column', gap: 10, width: 440, border: '1px solid #bbb', borderRadius: 6, padding: 16, fontFamily: 'sans-serif', fontSize: 13 },
  title : { margin: '0 0 6px', fontSize: 14, fontWeight: 'bold' },
  row   : { display: 'flex', alignItems: 'center', gap: 8 },
  grid  : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
  lbl   : { minWidth: 110, color: '#555' },
  axLbl : { minWidth: 50, color: '#888', fontSize: 11 },
  inp   : { width: 90, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 },
  sel   : { padding: '4px 6px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 },
  btn   : { alignSelf: 'flex-start', padding: '6px 16px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  result: { background: '#f0f4f8', border: '1px solid #d0dae4', borderRadius: 4, padding: 10 },
  table : { width: '100%', borderCollapse: 'collapse', marginTop: 6 },
  td    : { padding: '4px 8px', borderBottom: '1px solid #dde', fontSize: 12 },
  equiv : { marginTop: 10, fontSize: 11, color: '#444', background: '#fff3cd', padding: 8, borderRadius: 3 },
};

export default SelloEstandarUI;
