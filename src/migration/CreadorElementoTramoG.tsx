/**
 * Migración de: c_creador_elemento_tramo_g.magik
 * Clase Magik:  c_creador_elemento_tramo_g  —  SIGC11 / fdiaz + dsanchez / 2005
 *
 * Patrón FACTORY: crea el tipo correcto de c_elemento_tramo_g según el tipo
 * de entidad GIS recibida.
 *
 * Magik usa is_kind_of?(splice_closure/sheath/building) para discriminar.
 * TypeScript usa discriminated union con campo entityType.
 *
 * Subtipos de empalme controlados por sCveSello:
 *   "ET" + tipo_emp="DERIVACION" → ElementoEmpalmeDerivacionG  (pendiente migración)
 *   "ET" + otro tipo_emp         → ElementoEmpalmeG             (migrado)
 *   otro sCveSello               → ElementoEmpalmeSubterrâneoG  (pendiente migración)
 */

import React, { useState } from 'react';
import { ElementoEmpalmeG }  from './ElementoEmpalmeG';
import { ElementoSeccionG }  from './ElementoSeccionG';
import { ElementoNodoG }     from './ElementoNodoG';
import { ElementoEmpalmeGUI }  from './ElementoEmpalmeG';
import { ElementoSeccionGUI }  from './ElementoSeccionG';
import { ElementoNodoGUI }     from './ElementoNodoG';
import type { EntidadEmpalme } from './ElementoEmpalmeG';
import type { EntidadSeccion } from './ElementoSeccionG';
import type { EntidadNodo }    from './ElementoNodoG';

// =============================================================================
// TIPOS — discriminated union que reemplaza is_kind_of?() de Magik
// =============================================================================

/** Magik: splice_closure */
export interface EntidadSpliceClosure extends EntidadEmpalme {
  entityType: 'splice_closure';
  tipoEmp   : string;             // user!_tipo_emp — discrimina subtipo empalme
}

/** Magik: sheath */
export interface EntidadSheath extends EntidadSeccion {
  entityType: 'sheath';
}

/** Magik: building */
export interface EntidadBuilding extends EntidadNodo {
  entityType: 'building';
}

/** Unión discriminada de todos los tipos de entidad del tramo */
export type EntidadTramo =
  | EntidadSpliceClosure
  | EntidadSheath
  | EntidadBuilding;

/** Interfaz común de todos los elementos tramo (c_elemento_entidad_g) */
export interface ElementoTramo {
  sNombreSimbol: string;
  sDescripcion : string;
  nLongGrafica : number;
  configurarElementos(...args: unknown[]): void;
}

// =============================================================================
// STUBS — clases aún no migradas
// Se sustituirán cuando se migren los ficheros correspondientes.
// =============================================================================

/** Stub: c_elemento_empalme_derivacion_g — pendiente de migración */
class ElementoEmpalmeDerivacionG extends ElementoEmpalmeG {
  // Magik: se instancia cuando sCveSello="ET" y tipo_emp="DERIVACION"
  constructor(entidad: EntidadEmpalme) {
    super(entidad);
    this.sNombreSimbol = 'empalme_derivacion';   // diferencia visual futura
  }
}

/** Stub: c_elemento_empalme_subterraneo_g — pendiente de migración */
class ElementoEmpalmeSubterrâneoG extends ElementoEmpalmeG {
  // Magik: se instancia cuando sCveSello != "ET"
  constructor(entidad: EntidadEmpalme) {
    super(entidad);
    this.sNombreSimbol = 'empalme_subterraneo';  // diferencia visual futura
  }
}

// =============================================================================
// CLASE PRINCIPAL — Factory
// =============================================================================

export class CreadorElementoTramoG {

  // Magik: {:sNombre_grafico, _unset, :writable, :private}
  #sNombreGrafico: string | null = null;

  // Magik: {:sCveSello, _unset, :writable, :private}
  #sCveSello: string;

  // ---------------------------------------------------------------------------
  // new(RsCveSello)
  // Magik: _self.sCveSello << RsCveSello; _return _clone
  // ---------------------------------------------------------------------------
  constructor(cveSello: string) {
    this.#sCveSello = cveSello;
  }

  get sNombreGrafico(): string | null { return this.#sNombreGrafico; }
  set sNombreGrafico(v: string | null) { this.#sNombreGrafico = v; }

  // ---------------------------------------------------------------------------
  // Crea_Elemento_Tramo(RoElemento)
  // Magik:
  //   _if RoElemento.is_kind_of?(splice_closure) → crea_elemento_empalme
  //   _if RoElemento.is_kind_of?(sheath)         → c_elemento_seccion_g.new
  //   _if RoElemento.is_kind_of?(building)        → c_elemento_nodo_g.new
  //   oElemento_Tramo.configurar_elementos()
  //
  // is_kind_of? → discriminated union (entityType)
  // ---------------------------------------------------------------------------
  creaElementoTramo(entidad: EntidadTramo): ElementoTramo {
    let elemento: ElementoTramo;

    switch (entidad.entityType) {
      case 'splice_closure':
        // Magik: RoElemento.is_kind_of?(splice_closure)
        elemento = this.creaElementoEmpalme(entidad, this.#sCveSello);
        break;

      case 'sheath':
        // Magik: RoElemento.is_kind_of?(sheath)
        elemento = this.creaElementoSeccion(entidad);
        break;

      case 'building':
        // Magik: RoElemento.is_kind_of?(building)
        elemento = this.creaElementoNodo(entidad);
        break;
    }

    // Magik: oElemento_Tramo.configurar_elementos()
    if (entidad.entityType === 'building') {
      (elemento as ElementoNodoG).configurarElementos(entidad);
    } else {
      elemento.configurarElementos();
    }

    return elemento;
  }

  // ---------------------------------------------------------------------------
  // crea_elemento_empalme(RoElemento, PsCveSello)
  // Magik:
  //   LsTipoEmp << RoElemento.user!_tipo_emp
  //   _if PsCveSello = "ET"
  //   _then
  //     _if LsTipoEmp = "DERIVACION" → c_elemento_empalme_derivacion_g.new
  //     _else                        → c_elemento_empalme_g.new
  //   _else → c_elemento_empalme_subterraneo_g.new
  // ---------------------------------------------------------------------------
  creaElementoEmpalme(
    entidad  : EntidadSpliceClosure,
    cveSello : string,
  ): ElementoEmpalmeG {
    if (cveSello === 'ET') {
      if (entidad.tipoEmp === 'DERIVACION') {
        // Magik: c_elemento_empalme_derivacion_g.new(RoElemento)
        return new ElementoEmpalmeDerivacionG(entidad);
      }
      // Magik: c_elemento_empalme_g.new(RoElemento)
      return new ElementoEmpalmeG(entidad);
    }

    // Magik: c_elemento_empalme_subterraneo_g.new(RoElemento)
    return new ElementoEmpalmeSubterrâneoG(entidad);
  }

  // ---------------------------------------------------------------------------
  // crea_elemento_seccion(RoElemento)
  // Magik: _return c_elemento_seccion_g.new(RoElemento)
  // ---------------------------------------------------------------------------
  creaElementoSeccion(entidad: EntidadSheath): ElementoSeccionG {
    return new ElementoSeccionG(entidad);
  }

  // ---------------------------------------------------------------------------
  // crea_elemento_nodo(RoElemento)
  // Magik: _return c_elemento_nodo_g.new(RoElemento)
  // ---------------------------------------------------------------------------
  creaElementoNodo(entidad: EntidadBuilding): ElementoNodoG {
    return new ElementoNodoG(entidad);
  }
}

// =============================================================================
// COMPONENTE REACT  —  demo del factory
// Muestra cómo el factory crea el elemento correcto según entityType.
// =============================================================================

const ENTIDADES_DEMO: EntidadTramo[] = [
  {
    entityType: 'splice_closure',
    numEmpalme: 42,
    tipoEmp   : 'LINEA',           // sCveSello="ET", tipo normal → ElementoEmpalmeG
  },
  {
    entityType: 'splice_closure',
    numEmpalme: 88,
    tipoEmp   : 'DERIVACION',      // sCveSello="ET", derivacion → ElementoEmpalmeDerivacionG
  },
  {
    entityType: 'sheath',
    calculatedFiberLength: 1523.456789012,
  },
  {
    entityType: 'building',
    nomNodo: 'NODO-MAD-01',
    tipo   : 'EDFA-17dBm',
  },
];

function renderElemento(elem: ElementoTramo, entidad: EntidadTramo) {
  switch (entidad.entityType) {
    case 'splice_closure':
      return <ElementoEmpalmeGUI entidad={entidad} width={80} height={80} />;
    case 'sheath':
      return <ElementoSeccionGUI entidad={entidad} width={180} height={40} />;
    case 'building':
      return <ElementoNodoGUI entidad={entidad} width={160} height={80} />;
  }
}

export function CreadorElementoTramoGUI() {
  const [cveSello, setCveSello] = useState<'ET' | 'PL'>('ET');

  const factory  = new CreadorElementoTramoG(cveSello);
  const elementos = ENTIDADES_DEMO.map(e => ({
    entidad: e,
    elemento: factory.creaElementoTramo(e),
  }));

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_creador_elemento_tramo_g — Factory</h3>

      <div style={s.control}>
        <label style={{ fontSize: 12 }}>
          sCveSello:{' '}
          <select
            value={cveSello}
            onChange={e => setCveSello(e.target.value as 'ET' | 'PL')}
            style={{ marginLeft: 6 }}
          >
            <option value="ET">ET — Estudio Transmisión</option>
            <option value="PL">PL — Planos (subterráneo)</option>
          </select>
        </label>
        <small style={{ color: '#888', marginLeft: 12 }}>
          Cambia el selector para ver qué subtipo de empalme crea el factory.
        </small>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['entityType', 'sCveSello', 'Clase instanciada', 'sNombreSimbol', 'Vista'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elementos.map(({ entidad, elemento }, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f8f8f8' : '#fff' }}>
              <td style={s.td}><code>{entidad.entityType}</code></td>
              <td style={{ ...s.td, textAlign: 'center' }}>{cveSello}</td>
              <td style={s.td}><code>{elemento.constructor.name}</code></td>
              <td style={s.td}><code>{elemento.sNombreSimbol}</code></td>
              <td style={{ ...s.td, verticalAlign: 'middle' }}>
                {renderElemento(elemento, entidad)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  control: { display: 'flex', alignItems: 'center', padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde' },
  table  : { width: '100%', borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '6px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '6px 10px', borderBottom: '1px solid #eee', fontSize: 12, verticalAlign: 'top' },
};

export default CreadorElementoTramoGUI;
