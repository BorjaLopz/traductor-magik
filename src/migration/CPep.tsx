/**
 * Migración: c_pep.magik
 * Clase Magik: c_pep
 * Hereda de: c_base_sello_cobre
 *
 * Sello de layout que muestra datos del PEP (Plan de Ejecución del Proyecto):
 * OPB, OEI, OEs, PEP, referencias (desmontaje/canalización/principal/reconcentración),
 * proyecto (proyectista, supervisor, supervisor Telmex) y ruta.
 *
 * Métodos migrados:
 *   defined_attributes()         → DEFINED_ATTRIBUTES
 *   enum_tipo_empresar()         → ENUM_TIPO_EMPRESAR
 *   configura_tabla()            → configuraTablaDef()
 *   etiqueta_celdas()            → etiquetaCeldas()
 *   llena_datos_celdas()         → llenaDatosCeldas()
 *   llena_datos_dinamicos()      → llenaDatosDinamicos()
 *   asigna_celdas_a_colorear()   → asignaCeldasAColorear()
 *   obten_registros()            → obtenRegistros()
 *   info_sello_propiedades()     → infoSelloPropiedades()
 *   valor_propiedad()            → valorPropiedad()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type TablaId =
  | 'tbl_OPB'
  | 'tbl_PEP'
  | 'tbl_Referencias_Titulo'
  | 'tbl_Referencias_Detalle'
  | 'tbl_Proyecto'
  | 'tbl_Ruta';

export type TipoEmpresaR = 'RNUM' | 'RNUMN' | 'TELMEX';

export interface Celda {
  texto    : string;
  tamanio  : number;
  alineacion?: string;
  margen?  : number;
  negrita? : boolean;
}

export interface TablaLayout {
  id       : TablaId;
  renglones: number;
  columnas : number;
  celdas   : Map<string, Celda>;
}

/** Datos de negocio que pueblan el sello */
export interface DatosPep {
  opb               : string;
  oei               : string;
  oe                : string;
  oeReco            : string;
  oeDesm            : string;
  oeCanal           : string;
  pep               : string;
  desmontaje        : string;
  canalizacion      : string;
  principal         : string;
  reconcentracion   : string;
  proyectista       : string;
  supervisor        : string;
  supervisorTelmex  : string;
  ruta              : string;
  programaProyecto  : string;
  ot                : string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Magik: enum_tipo_empresar() */
export const ENUM_TIPO_EMPRESAR: Record<number, TipoEmpresaR> = {
  1: 'RNUM',
  2: 'RNUMN',
  3: 'TELMEX',
};

/** Color verde de línea {0.0, 0.8, 0.3} */
const O_COLOR_LINEA = 'rgb(0,204,77)';

export const DEFINED_ATTRIBUTES = [
  { nombre: 'empreviso',         tipo: 'string',  description: 'Empresa que revisa',   enumMethod: 'enum_tipo_empresar', default: '' },
  { nombre: 'desmontaje',        tipo: 'string',  description: 'desmontaje',            default: '' },
  { nombre: 'canalizacion',      tipo: 'string',  description: 'canalizacion',          default: '' },
  { nombre: 'principal',         tipo: 'string',  description: 'principal',             default: '' },
  { nombre: 'reconcentracion',   tipo: 'string',  description: 'reconcentracion',       default: '' },
  { nombre: 'pep',               tipo: 'string',  description: 'PEP',                   default: '' },
  { nombre: 'opb',               tipo: 'string',  description: 'opb',                   default: '' },
  { nombre: 'oei',               tipo: 'string',  description: 'OEI',                   default: '' },
  { nombre: 'oe',                tipo: 'string',  description: 'OE',                    default: '' },
  { nombre: 'programa_proyecto', tipo: 'string',  description: 'programa',              default: '' },
  { nombre: 'ot',                tipo: 'string',  description: 'ot',                    default: '' },
] as const;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CPep {

  oTipoEmpresaR  : Record<number, TipoEmpresaR> = { ...ENUM_TIPO_EMPRESAR };
  valorEmpreviso : string | null = null;

  /** Editable attributes (overrides de properties dialog) */
  attributes: Record<string, string> = {
    empreviso: '', desmontaje: '', canalizacion: '', principal: '',
    reconcentracion: '', pep: '', opb: '', oei: '', oe: '',
    programa_proyecto: '', ot: '',
  };

  private tablas = new Map<TablaId, TablaLayout>();

  // --------------------------------------------------------------------------
  // configuraTablaDef — Magik: configura_tabla()
  // --------------------------------------------------------------------------

  configuraTablaDef(): Map<TablaId, TablaLayout> {
    const make = (id: TablaId, r: number, c: number): TablaLayout => ({
      id, renglones: r, columnas: c,
      celdas: new Map<string, Celda>(),
    });
    this.tablas.set('tbl_OPB',               make('tbl_OPB', 7, 3));            // 7×3, col 26/26/26 mm
    this.tablas.set('tbl_PEP',               make('tbl_PEP', 1, 2));            // 1×2, col 26/52 mm
    this.tablas.set('tbl_Referencias_Titulo',make('tbl_Referencias_Titulo', 1, 1)); // 1×1, col 78 mm
    this.tablas.set('tbl_Referencias_Detalle',make('tbl_Referencias_Detalle', 4, 2)); // 4×2, col 39/39 mm
    this.tablas.set('tbl_Proyecto',          make('tbl_Proyecto', 3, 3));        // 3×3, col 26/26/26 mm
    this.tablas.set('tbl_Ruta',              make('tbl_Ruta', 1, 3));            // 1×3, col 26/26/26 mm
    return this.tablas;
  }

  private set(tabla: TablaId, r: number, c: number, celda: Partial<Celda> & { texto: string }): void {
    this.tablas.get(tabla)?.celdas.set(`${r},${c}`, {
      tamanio: 30, ...celda,
    });
  }

  // --------------------------------------------------------------------------
  // etiquetaCeldas — Magik: etiqueta_celdas()
  // --------------------------------------------------------------------------

  etiquetaCeldas(): void {
    this.set('tbl_OPB', 1, 1, { texto: 'OPB',  tamanio: 30, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_OPB', 2, 1, { texto: 'OEI',  tamanio: 30, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_OPB', 3, 1, { texto: 'OEs',  tamanio: 30, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_OPB', 6, 1, { texto: 'PROG:', tamanio: 30, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_OPB', 7, 1, { texto: 'OT:',  tamanio: 30, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_PEP', 1, 1, { texto: 'PEP',  tamanio: 40, alineacion: 'centre_left', margen: 2 });
    this.set('tbl_Referencias_Titulo', 1, 1, { texto: 'REFERENCIAS', tamanio: 30 });
    ['DESMONTAJE', 'CANALIZACION', 'PRINCIPAL', 'RECONCENTRACION'].forEach((s, i) =>
      this.set('tbl_Referencias_Detalle', i + 1, 1, { texto: s, tamanio: 30, alineacion: 'centre_left' })
    );
    ['PROYECTO', 'SUPERVISO', 'RNUM'].forEach((s, i) =>
      this.set('tbl_Proyecto', 1, i + 1, { texto: s, tamanio: 30 })
    );
    this.set('tbl_Ruta', 1, 1, { texto: 'RUTA: ', tamanio: 30 });
  }

  // --------------------------------------------------------------------------
  // valorPropiedad — Magik: valor_propiedad(propiedad, dato_actual)
  // Si el atributo tiene valor no vacío, lo usa; sino usa dato_actual.
  // --------------------------------------------------------------------------

  valorPropiedad(propiedad: string, datoActual: string): string {
    const val = this.attributes[propiedad];
    return (val && val.length > 0) ? val.toUpperCase() : datoActual;
  }

  // --------------------------------------------------------------------------
  // infoSelloPropiedades — Magik: info_sello_propiedades(pl_datos)
  // Permite overrides desde propiedades editables del sello.
  // --------------------------------------------------------------------------

  infoSelloPropiedades(datos: DatosPep): DatosPep {
    return {
      ...datos,
      opb:             this.valorPropiedad('opb',             datos.opb),
      oei:             this.valorPropiedad('oei',             datos.oei),
      oe:              this.valorPropiedad('oe',              datos.oe),
      programaProyecto:this.valorPropiedad('programa_proyecto', datos.programaProyecto),
      ot:              this.valorPropiedad('ot',              datos.ot),
      pep:             this.valorPropiedad('pep',             datos.pep),
      canalizacion:    this.valorPropiedad('canalizacion',    datos.canalizacion),
      desmontaje:      this.valorPropiedad('desmontaje',      datos.desmontaje),
      reconcentracion: this.valorPropiedad('reconcentracion', datos.reconcentracion),
      principal:       this.valorPropiedad('principal',       datos.principal),
    };
  }

  // --------------------------------------------------------------------------
  // obtenRegistros — Magik: obten_registros()
  // En Magik: accede a swg_dsn_admin_engine, o_distrito, o_proyecto.
  // En TS: recibe datos ya resueltos y aplica overrides de propiedades.
  // --------------------------------------------------------------------------

  obtenRegistros(datos: DatosPep): DatosPep {
    return this.infoSelloPropiedades(datos);
  }

  // --------------------------------------------------------------------------
  // llenaDatosCeldas — Magik: llena_datos_celdas()
  // --------------------------------------------------------------------------

  llenaDatosCeldas(datos: DatosPep): void {
    // Ruta: puede venir de trayectoria FO o de o_proyecto.numero_ruta
    this.set('tbl_Ruta', 1, 1, { texto: `RUTA: ${datos.ruta}`, tamanio: 30, negrita: true });

    this.set('tbl_PEP', 1, 2, { texto: datos.pep, tamanio: 40, negrita: true });

    this.set('tbl_OPB', 1, 2, { texto: datos.opb,  tamanio: 30, negrita: true });
    this.set('tbl_OPB', 2, 2, { texto: datos.oei,  tamanio: 30, negrita: true });
    this.set('tbl_OPB', 3, 2, { texto: datos.oe,   tamanio: 30, negrita: true });
    this.set('tbl_OPB', 4, 2, { texto: datos.oeReco, tamanio: 30, negrita: true });
    this.set('tbl_OPB', 5, 2, { texto: datos.oeDesm, tamanio: 30, negrita: true });
    this.set('tbl_OPB', 6, 2, { texto: datos.programaProyecto, tamanio: 30, negrita: true });
    this.set('tbl_OPB', 7, 2, { texto: datos.ot,   tamanio: 30, negrita: true });

    this.set('tbl_Referencias_Detalle', 1, 2, { texto: datos.desmontaje,     tamanio: 30, negrita: true });
    this.set('tbl_Referencias_Detalle', 2, 2, { texto: datos.canalizacion,   tamanio: 30, negrita: true });
    this.set('tbl_Referencias_Detalle', 3, 2, { texto: datos.principal,      tamanio: 30, negrita: true });
    this.set('tbl_Referencias_Detalle', 4, 2, { texto: datos.reconcentracion,tamanio: 30, negrita: true });

    this.set('tbl_Proyecto', 2, 1, { texto: datos.proyectista.replace(/ /g, '\n'),      tamanio: 30 });
    this.set('tbl_Proyecto', 2, 2, { texto: datos.supervisor.replace(/ /g, '\n'),       tamanio: 30 });
    this.set('tbl_Proyecto', 2, 3, { texto: datos.supervisorTelmex.replace(/ /g, '\n'), tamanio: 30 });

    // empreviso override (label en col RNUM)
    if (this.attributes.empreviso) {
      this.set('tbl_Proyecto', 1, 3, { texto: this.attributes.empreviso.toUpperCase(), tamanio: 30 });
      this.valorEmpreviso = this.attributes.empreviso.toUpperCase();
    }
  }

  // --------------------------------------------------------------------------
  // llenaDatosDinamicos — Magik: llena_datos_dinamicos()
  // Paginación dinámica: "PLANO: N" / "DE: N"
  // --------------------------------------------------------------------------

  llenaDatosDinamicos(nPlano: number, nTotal: number): void {
    this.set('tbl_Ruta', 1, 2, { texto: `PLANO: ${nPlano}`, tamanio: 30 });
    this.set('tbl_Ruta', 1, 3, { texto: `DE: ${nTotal}`,    tamanio: 30 });
  }

  // --------------------------------------------------------------------------
  // asignaCeldasAColorear — Magik: asigna_celdas_a_colorear()
  // Retorna las celdas que deben pintarse con o_color_linea (verde).
  // --------------------------------------------------------------------------

  asignaCeldasAColorear(): Array<{ tabla: TablaId; r: number; c: number; color: string }> {
    const color = O_COLOR_LINEA;
    return [
      { tabla: 'tbl_PEP',               r: 1, c: 2, color },
      { tabla: 'tbl_OPB',               r: 1, c: 2, color },
      { tabla: 'tbl_OPB',               r: 2, c: 2, color },
      { tabla: 'tbl_OPB',               r: 3, c: 2, color },
      { tabla: 'tbl_OPB',               r: 4, c: 2, color },
      { tabla: 'tbl_OPB',               r: 5, c: 2, color },
      { tabla: 'tbl_OPB',               r: 6, c: 2, color },
      { tabla: 'tbl_OPB',               r: 7, c: 2, color },
      { tabla: 'tbl_Referencias_Detalle',r: 1, c: 2, color },
      { tabla: 'tbl_Referencias_Detalle',r: 2, c: 2, color },
      { tabla: 'tbl_Referencias_Detalle',r: 3, c: 2, color },
      { tabla: 'tbl_Referencias_Detalle',r: 4, c: 2, color },
      { tabla: 'tbl_Ruta',              r: 1, c: 1, color },
      { tabla: 'tbl_Proyecto',          r: 2, c: 1, color },
      { tabla: 'tbl_Proyecto',          r: 2, c: 2, color },
      { tabla: 'tbl_Proyecto',          r: 2, c: 3, color },
    ];
  }

  // --------------------------------------------------------------------------
  // drawContentOn
  // --------------------------------------------------------------------------

  drawContentOn(datos: DatosPep): Map<TablaId, TablaLayout> {
    if (!this.tablas.size) this.configuraTablaDef();
    this.etiquetaCeldas();
    const datosFinales = this.obtenRegistros(datos);
    this.llenaDatosCeldas(datosFinales);
    return this.tablas;
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_DATOS: DatosPep = {
  opb:             'OPB-001-MXC',
  oei:             'OEI-002',
  oe:              'OE-CONST-003',
  oeReco:          'OE-RECO-004',
  oeDesm:          'OE-DESM-005',
  oeCanal:         'OE-CANAL-006',
  pep:             'PEP-MXC-2024-001',
  desmontaje:      'REF-DESM-001',
  canalizacion:    'REF-CANAL-001',
  principal:       'REF-PRINC-001',
  reconcentracion: 'REF-RECO-001',
  proyectista:     'JUAN PEREZ GARCIA',
  supervisor:      'MARIA LOPEZ RUIZ',
  supervisorTelmex:'CARLOS MENDEZ',
  ruta:            'RT-001',
  programaProyecto:'PROG-2024',
  ot:              'OT-12345',
};

// =============================================================================
// COMPONENTE REACT
// =============================================================================

const TABLE_DEFS: { id: TablaId; label: string; rows: number; cols: number }[] = [
  { id: 'tbl_OPB',               label: 'OPB (7×3)',          rows: 7, cols: 3 },
  { id: 'tbl_PEP',               label: 'PEP (1×2)',          rows: 1, cols: 2 },
  { id: 'tbl_Referencias_Titulo',label: 'Referencias Título', rows: 1, cols: 1 },
  { id: 'tbl_Referencias_Detalle',label: 'Referencias Det (4×2)', rows: 4, cols: 2 },
  { id: 'tbl_Proyecto',          label: 'Proyecto (3×3)',     rows: 3, cols: 3 },
  { id: 'tbl_Ruta',              label: 'Ruta (1×3)',         rows: 1, cols: 3 },
];

export default function CPepViewer(): React.ReactElement {
  const [datos, setDatos] = useState<DatosPep>({ ...MOCK_DATOS });
  const [tablas, setTablas] = useState<Map<TablaId, TablaLayout> | null>(null);
  const [nPlano, setNPlano] = useState(1);
  const [nTotal, setNTotal] = useState(3);

  const run = () => {
    const inst = new CPep();
    const t = inst.drawContentOn(datos);
    inst.llenaDatosDinamicos(nPlano, nTotal);
    setTablas(new Map(t));
  };

  const cell = (id: TablaId, r: number, c: number) =>
    tablas?.get(id)?.celdas.get(`${r},${c}`);

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CPep — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_pep</code> — extends c_base_sello_cobre
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, marginBottom: 12 }}>
        {(Object.keys(MOCK_DATOS) as (keyof DatosPep)[]).map(k => (
          <label key={k}>{k}:&nbsp;
            <input value={datos[k]} onChange={e => setDatos(d => ({ ...d, [k]: e.target.value }))}
              style={{ width: 150 }} />
          </label>
        ))}
        <label>Plano:&nbsp;<input type="number" value={nPlano} onChange={e => setNPlano(+e.target.value)} style={{ width: 50 }} /></label>
        <label>De:&nbsp;<input type="number" value={nTotal} onChange={e => setNTotal(+e.target.value)} style={{ width: 50 }} /></label>
      </div>

      <button onClick={run}>draw_content_on()</button>

      {tablas && (
        <div style={{ marginTop: 16 }}>
          {TABLE_DEFS.map(({ id, label, rows, cols }) => (
            <div key={id} style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 12 }}>{label}</strong>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, marginTop: 2 }}>
                <tbody>
                  {Array.from({ length: rows }, (_, ri) => (
                    <tr key={ri}>
                      {Array.from({ length: cols }, (_, ci) => {
                        const c = cell(id, ri + 1, ci + 1);
                        return (
                          <td key={ci} style={{
                            border: '1px solid #999', padding: '2px 6px',
                            whiteSpace: 'pre-wrap',
                            fontWeight: c?.negrita ? 'bold' : 'normal',
                            backgroundColor: c?.negrita ? O_COLOR_LINEA + '22' : undefined,
                          }}>
                            {c?.texto ?? ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <details style={{ marginTop: 12 }}>
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
