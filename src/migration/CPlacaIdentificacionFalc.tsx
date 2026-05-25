/**
 * Migración: c_placa_identificacion_falc.magik
 * Clase Magik: c_placa_identificacion_falc
 * Hereda de: layout_element
 *
 * Placa de identificación para planos FALC (fibra local). Muestra:
 * logo empresa, central, distrito, cable, calibre, calibre2, cuenta,
 * fecha y constructor. Los datos vienen del diseño activo o de atributos
 * editables del elemento de layout.
 *
 * Métodos migrados:
 *   defined_attributes()    → DEFINED_ATTRIBUTES
 *   enum_tipo_empresar()    → ENUM_TIPO_EMPRESAR
 *   Inicializa(coord?)      → inicializa()
 *   prvCrea_Tablas(coord)   → crearTablas()
 *   prvLlena_Celdas()       → llenarCeldas()
 *   llena_datos_celdas()    → llenarDatosCeldas()
 *   prvAsignaTexto()        → asignarTexto()
 *   valor_propiedad(p, d)   → valorPropiedad()
 *   draw_content_on(window) → drawContentOn()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type TipoEmpresaR = 'TELMEX' | 'ULTIMA_MILLA' | 'ULTIMA_MILLA_N';

export interface PlacaData {
  central      : string;
  distrito     : string;
  cable        : string;
  calibre      : string;
  calibre2     : string;
  cuenta       : string;
  fecha        : string;
  constructor_ : string;
  empreviso    : TipoEmpresaR | '';
}

export interface CeldaPlaca {
  label?  : string;   /** etiqueta estática */
  valor?  : string;   /** dato editable */
  esLogo? : boolean;
}

/** Representación de las 6 tablas de la placa */
export interface PlacaLayout {
  tbl1 : { ancho: 130; alto: 40 };
  tbl2 : { ancho: 120; alto: 30 };
  tbl3 : { logo: string };
  tbl4 : { central: CeldaPlaca; distrito: CeldaPlaca; cable: CeldaPlaca };
  tbl5 : { calibre: CeldaPlaca; calibre2: CeldaPlaca; cuenta: CeldaPlaca };
  tbl6 : { fecha: CeldaPlaca; constructor_: CeldaPlaca };
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Magik: enum_tipo_empresar() */
export const ENUM_TIPO_EMPRESAR: Record<number, TipoEmpresaR> = {
  1: 'TELMEX',
  2: 'ULTIMA_MILLA',
  3: 'ULTIMA_MILLA_N',
};

export const DEFINED_ATTRIBUTES = [
  { nombre: 'empreviso',   tipo: 'string', description: 'Empresa que revisa', enumMethod: 'enum_tipo_empresar', default: '' },
  { nombre: 'central',     tipo: 'string', description: 'CENTRAL',     default: '' },
  { nombre: 'distrito',    tipo: 'string', description: 'DISTRITO',    default: '' },
  { nombre: 'cable',       tipo: 'string', description: 'CABLE',       default: '' },
  { nombre: 'calibre',     tipo: 'string', description: 'CALIBRE',     default: '' },
  { nombre: 'calibre2',    tipo: 'string', description: 'CALIBRE',     default: '' },
  { nombre: 'cuenta',      tipo: 'string', description: 'CUENTA',      default: '' },
  { nombre: 'fecha',       tipo: 'string', description: 'FECHA',       default: '' },
  { nombre: 'constructor', tipo: 'string', description: 'CONSTRUCTOR', default: '' },
] as const;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CPlacaIdentificacionFalc {

  static readonly ALLOWED_ON_MENU = false;

  oTipoEmpresaR  : Record<number, TipoEmpresaR> = { ...ENUM_TIPO_EMPRESAR };
  valorEmpreviso : string | null = null;
  bTablasCreadas = false;

  /** Editable attributes */
  attributes: Record<string, string> = {
    empreviso: '', central: '', distrito: '', cable: '',
    calibre: '', calibre2: '', cuenta: '', fecha: '', constructor: '',
  };

  /** Slots para datos resueltos */
  sCable      : string = '';
  sCalibre    : string = '';
  sCalibre2   : string = '';
  sCuenta     : string = '';
  sConstructor: string = '';

  // --------------------------------------------------------------------------
  // valorPropiedad — Magik: valor_propiedad(propiedad, dato_actual)
  // --------------------------------------------------------------------------

  valorPropiedad(propiedad: string, datoActual: string): string {
    const val = this.attributes[propiedad];
    return (val && val.length > 0) ? val : datoActual;
  }

  // --------------------------------------------------------------------------
  // crearTablas — Magik: prvCrea_Tablas(RoCoord)
  // Retorna la estructura de dimensiones de las 6 tablas.
  // --------------------------------------------------------------------------

  crearTablas(): PlacaLayout {
    // tbl_1: 1×1, 40×130 mm (contenedora)
    // tbl_2: 1×1, 30×120 mm
    // tbl_3: 2×1, 29mm×26mm (logo)
    // tbl_4: 1×6, CENTRAL/DISTRITO/CABLE (etiqueta col 1,3,5 | dato col 2,4,6)
    //   col widths: 12/18/12/18/12/18 mm
    // tbl_5: 1×6, CALIBRE/CALIBRE2/CUENTA
    //   col widths: 12/18/12/18/12/18 mm
    // tbl_6: 1×4, FECHA/CONSTRUCTOR
    //   col widths: 14/28/20/28 mm
    return {
      tbl1: { ancho: 130, alto: 40 },
      tbl2: { ancho: 120, alto: 30 },
      tbl3: { logo: 'logo_telmex_ep' },
      tbl4: {
        central:  { label: 'SIGLAS\nCENTRAL', valor: '' },
        distrito: { label: 'DISTRITO',         valor: '' },
        cable:    { label: 'CABLE',            valor: '' },
      },
      tbl5: {
        calibre:  { label: 'CALIBRE',  valor: '' },
        calibre2: { label: 'CALIBRE',  valor: '' },
        cuenta:   { label: 'CUENTA',   valor: '' },
      },
      tbl6: {
        fecha:       { label: 'FECHA',       valor: '' },
        constructor_:{ label: 'CONSTRUCTOR', valor: '' },
      },
    };
  }

  // --------------------------------------------------------------------------
  // asignarTexto — Magik: prvAsignaTexto()
  // Toma los valores de attributes y los aplica al layout.
  // --------------------------------------------------------------------------

  asignarTexto(layout: PlacaLayout): void {
    layout.tbl4.central.valor   = this.attributes.central;
    layout.tbl4.distrito.valor  = this.attributes.distrito;
    layout.tbl4.cable.valor     = this.attributes.cable;
    layout.tbl5.calibre.valor   = this.attributes.calibre;
    layout.tbl5.calibre2.valor  = this.attributes.calibre2;
    layout.tbl5.cuenta.valor    = this.attributes.cuenta;
    layout.tbl6.fecha.valor     = this.attributes.fecha;
    layout.tbl6.constructor_.valor = this.attributes.constructor;

    // Logo empresa según empreviso
    if (this.attributes.empreviso) {
      let logoKey = `logo_${this.attributes.empreviso.toUpperCase()}`;
      if (logoKey.includes('TELMEX')) logoKey += '_EP';
      this.valorEmpreviso = logoKey;
      layout.tbl3.logo = logoKey;
    }
  }

  // --------------------------------------------------------------------------
  // llenarDatosCeldas — Magik: llena_datos_celdas()
  // Obtiene datos del diseño GIS activo y aplica valor_propiedad.
  // En TS: recibe datos ya resueltos del contexto GIS.
  // --------------------------------------------------------------------------

  /**
   * @param datos  Datos resueltos desde GIS (cable.spec, proyecto, etc.)
   */
  llenarDatosCeldas(datos: PlacaData, layout: PlacaLayout): void {
    this.attributes.central     = this.valorPropiedad('central',     datos.central);
    this.attributes.distrito    = this.valorPropiedad('distrito',    datos.distrito);
    this.attributes.cable       = this.valorPropiedad('cable',       datos.cable);
    this.attributes.calibre     = this.valorPropiedad('calibre',     datos.calibre);
    this.attributes.calibre2    = this.valorPropiedad('calibre2',    datos.calibre2);
    this.attributes.cuenta      = this.valorPropiedad('cuenta',      datos.cuenta);
    this.attributes.fecha       = this.valorPropiedad('fecha',       datos.fecha);
    this.attributes.constructor = this.valorPropiedad('constructor', datos.constructor_);

    this.asignarTexto(layout);
  }

  // --------------------------------------------------------------------------
  // drawContentOn — Magik: draw_content_on(window)
  // --------------------------------------------------------------------------

  drawContentOn(datos?: PlacaData): PlacaLayout {
    const layout = this.crearTablas();
    if (datos) this.llenarDatosCeldas(datos, layout);
    else this.asignarTexto(layout);
    this.bTablasCreadas = true;
    return layout;
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_DATOS: PlacaData = {
  central     : 'CTL-NORTE',
  distrito    : 'DTO-CENTRO',
  cable       : 'G.657.A1',
  calibre     : '48 FO-2M',
  calibre2    : '96 FO-0M',
  cuenta      : 'CTA-001',
  fecha       : '2024-05-01',
  constructor_: 'CONSTRUCTORA XYZ',
  empreviso   : 'TELMEX',
};

// =============================================================================
// COMPONENTE REACT
// =============================================================================

export default function CPlacaIdentificacionFalcViewer(): React.ReactElement {
  const [datos, setDatos] = useState<PlacaData>({ ...MOCK_DATOS });
  const [layout, setLayout] = useState<PlacaLayout | null>(null);

  const run = () => {
    const inst = new CPlacaIdentificacionFalc();
    inst.attributes.empreviso = datos.empreviso;
    setLayout(inst.drawContentOn(datos));
  };

  const FIELD_MAP: { key: keyof PlacaData; label: string }[] = [
    { key: 'central',     label: 'Central' },
    { key: 'distrito',    label: 'Distrito' },
    { key: 'cable',       label: 'Cable (tipo)' },
    { key: 'calibre',     label: 'Calibre' },
    { key: 'calibre2',    label: 'Calibre 2' },
    { key: 'cuenta',      label: 'Cuenta' },
    { key: 'fecha',       label: 'Fecha' },
    { key: 'constructor_',label: 'Constructor' },
    { key: 'empreviso',   label: 'Empresa revisa' },
  ];

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CPlacaIdentificacionFalc — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_placa_identificacion_falc</code> — extends layout_element (FALC)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, marginBottom: 12 }}>
        {FIELD_MAP.map(({ key, label }) => (
          <label key={key}>{label}:&nbsp;
            {key === 'empreviso' ? (
              <select value={datos[key]} onChange={e => setDatos(d => ({ ...d, [key]: e.target.value }))}>
                <option value="">—</option>
                {Object.values(ENUM_TIPO_EMPRESAR).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : (
              <input value={datos[key] as string} onChange={e => setDatos(d => ({ ...d, [key]: e.target.value }))}
                style={{ width: 160 }} />
            )}
          </label>
        ))}
      </div>

      <button onClick={run}>draw_content_on()</button>

      {layout && (
        <div style={{ marginTop: 16, border: '2px solid #666', display: 'inline-block' }}>
          {/* tbl_3: logo */}
          <div style={{ background: '#e8e8ff', padding: '4px 8px', borderBottom: '1px solid #ccc', fontSize: 11 }}>
            LOGO: <strong>{layout.tbl3.logo}</strong>
          </div>
          {/* tbl_4: CENTRAL / DISTRITO / CABLE */}
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <tbody>
              <tr>
                {(['central', 'distrito', 'cable'] as const).map(k => (
                  <React.Fragment key={k}>
                    <td style={{ border: '1px solid #ccc', padding: '2px 6px', fontWeight: 'bold', background: '#f5f5f5' }}>
                      {layout.tbl4[k].label}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '2px 12px' }}>
                      {layout.tbl4[k].valor}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>
          {/* tbl_5: CALIBRE / CALIBRE2 / CUENTA */}
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <tbody>
              <tr>
                {(['calibre', 'calibre2', 'cuenta'] as const).map(k => (
                  <React.Fragment key={k}>
                    <td style={{ border: '1px solid #ccc', padding: '2px 6px', fontWeight: 'bold', background: '#f5f5f5' }}>
                      {layout.tbl5[k].label}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '2px 12px' }}>
                      {layout.tbl5[k].valor}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>
          {/* tbl_6: FECHA / CONSTRUCTOR */}
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <tbody>
              <tr>
                {(['fecha', 'constructor_'] as const).map(k => (
                  <React.Fragment key={k}>
                    <td style={{ border: '1px solid #ccc', padding: '2px 6px', fontWeight: 'bold', background: '#f5f5f5' }}>
                      {layout.tbl6[k].label}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '2px 12px' }}>
                      {layout.tbl6[k].valor}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>enum_tipo_empresar()</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
          {Object.entries(ENUM_TIPO_EMPRESAR).map(([k, v]) => `${k}: ${v}`).join('\n')}
        </pre>
      </details>
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>defined_attributes() — {DEFINED_ATTRIBUTES.length}</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
          {DEFINED_ATTRIBUTES.map(a => `${a.nombre} (${a.tipo})`).join('\n')}
        </pre>
      </details>
    </div>
  );
}
