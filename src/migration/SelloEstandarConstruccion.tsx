/**
 * SelloEstandarConstruccion.tsx
 * Migración de c_sello_estandar_construccion.magik
 *
 * Sello de plano para proyectos de construcción de red.
 * Hereda de c_sello_estandar_base (aquí modelado como estado + props).
 * Muestra 3 tablas: tbl_Ctl_Dto | tbl_CP_Ruta_Nse | tbl_del_mpo
 */

import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a los slots y property_list del original
// ---------------------------------------------------------------------------

/** Equivale a los :allowed_keys del defined_attributes */
export interface AtributosConstruccion {
  blanco_negro  : 'SI' | 'NO';         // :enum_bool → 'SI'/'NO'
  emprerazon    : string;               // clave numérica como string ('1'|'2'|'3')
  fecha         : string;
  colonia       : string;
  municipio     : string;
  codigo_postal : string;
  ruta          : string;
}

/** Equivale a .pl_datos (property_list) */
interface PlDatos {
  nombre_ctl : string;
  tipo_ctl   : string;
  cve_ctl    : string;
  distrito   : string;
  cp         : string;
  ruta       : string;
  nse        : string;
  del_mpo    : string;
  colonia    : string;
  fecha      : string;
}

/** Mock de o_proyecto — fuente de datos del proyecto GIS */
interface OProyecto {
  nombre_central : string;
  tipo_central   : string;
  cve_central    : string;
  distrito       : ODistrito;
}

/** Mock de o_distrito — fuente de datos del distrito GIS */
interface ODistrito {
  user_distrito                  : string;
  numero_ruta                    : string;
  dto_nse_predominante           : string;
  nombre_delegacion_municipio    : string;
  codigo_postal                  : string;
  nombre_colonia                 : string;
}

// ---------------------------------------------------------------------------
// enum_tipo_razon_social — equivalente al hash_table[1..3]
// ---------------------------------------------------------------------------
// Magik: .oTipoEmpresaRazonS[3] = "TELEFONOS|DE MEXICO|S.A.B de C.V."
const ENUM_TIPO_RAZON_SOCIAL: Record<string, string> = {
  '3': 'TELEFONOS|DE MEXICO|S.A.B de C.V.',
  '1': 'RED NACIONAL| ÚLTIMA MILLA|S.A.P.I. DE C.V',
  '2': 'RED  ÚLTIMA|MILLA DEL NOROESTE|S.A.P.I. DE C.V',
};

// Clave para identificar empresa en llena_datos_celdas
const EMPRESA_KEYS: Record<string, string> = {
  '3': 'TELMEX',
  '1': 'RNUM',
  '2': 'RUMN',
};

// ---------------------------------------------------------------------------
// Mock de datos GIS — reemplaza .o_proyecto y .o_distrito en producción
// ---------------------------------------------------------------------------
const MOCK_PROYECTO: OProyecto = {
  nombre_central : 'CENTRAL NORTE',
  tipo_central   : 'CU',
  cve_central    : 'CTL-001',
  distrito       : {
    user_distrito                : 'DISTRITO NORTE',
    numero_ruta                  : 'RC-2024-042',
    dto_nse_predominante         : 'C+',
    nombre_delegacion_municipio  : 'GUSTAVO A. MADERO',
    codigo_postal                : '07000',
    nombre_colonia               : 'TEPITO',
  },
};

// ---------------------------------------------------------------------------
// Helpers — equivalentes a los métodos vacíos sobreescritos en subclases
// ---------------------------------------------------------------------------

/** Magik: _method c_sello_estandar_construccion.codigo_postal → "" */
function defaultCodigoPostal(): string { return ''; }

/** Magik: _method c_sello_estandar_construccion.colonia → "" */
function defaultColonia(): string { return ''; }

/** Magik: _method c_sello_estandar_construccion.ruta → "" */
function defaultRuta(): string { return ''; }

// ---------------------------------------------------------------------------
// obten_registros — rellena pl_datos desde proyecto/distrito o atributos usuario
// Magik: _method c_sello_estandar_construccion.obten_registros()
// ---------------------------------------------------------------------------
async function obtenRegistros(
  attrs  : AtributosConstruccion,
  proyecto: OProyecto,
): Promise<PlDatos> {
  const dto = proyecto.distrito;

  // Prioridad: atributo de usuario > dato del distrito (mismo patrón para todos)
  const ruta    = attrs.ruta.trim().length > 0
    ? attrs.ruta.toUpperCase()
    : dto.numero_ruta || defaultRuta();

  const del_mpo = attrs.municipio.trim().length > 0
    ? attrs.municipio.toUpperCase()
    : dto.nombre_delegacion_municipio;

  const cp      = attrs.codigo_postal.trim().length > 0
    ? attrs.codigo_postal.toUpperCase()
    : dto.codigo_postal || defaultCodigoPostal();

  const colonia = attrs.colonia.trim().length > 0
    ? attrs.colonia.toUpperCase()
    : dto.nombre_colonia || defaultColonia();

  const fecha   = attrs.fecha.trim().length > 0
    ? attrs.fecha.toUpperCase()
    : '';

  return {
    nombre_ctl : proyecto.nombre_central,
    tipo_ctl   : proyecto.tipo_central,
    cve_ctl    : proyecto.cve_central,
    distrito   : dto.user_distrito,
    cp,
    ruta,
    nse        : dto.dto_nse_predominante,
    del_mpo,
    colonia,
    fecha,
  };
}

// ---------------------------------------------------------------------------
// llena_datos_celdas — lógica de empresa por patrón de nombre
// Magik: _method c_sello_estandar_construccion.llena_datos_celdas()
// ---------------------------------------------------------------------------
function resolveEmpresa(emprerazonKey: string): {
  lineas      : string[];   // txts — resultado de split_by("|")
  codigoEmpresa: string;    // "TELMEX" | "RNUM" | "RUMN"
  fontSize    : number;     // tamaño de fuente según empresa (35 o 23)
} | null {
  const raw = ENUM_TIPO_RAZON_SOCIAL[emprerazonKey];
  if (!raw) return null;

  const upper = raw.toUpperCase();
  const lineas = raw.split('|');                   // Magik: split_by("|")
  const codigoEmpresa = EMPRESA_KEYS[emprerazonKey] ?? '';

  // Magik: .matches?("*TELEFONOS*") → 35, resto → 23
  const fontSize = upper.includes('TELEFONOS') ? 35 : 23;

  return { lineas, codigoEmpresa, fontSize };
}

// ---------------------------------------------------------------------------
// Subcomponentes de tabla — equivalen a configura_tabla + etiqueta_celdas
// ---------------------------------------------------------------------------

/** tbl_Ctl_Dto: 2 filas × 1 col → ren {7,8}, col {70} */
function TblCtlDto({ datos }: { datos: PlDatos }) {
  const nombre_ctl = datos.tipo_ctl + ' - ' + datos.nombre_ctl;
  // Magik: si nombre_ctl.size > 11 → fontSize 30, else → 60
  const fSize = datos.nombre_ctl.length > 11 ? 30 : 60;

  return (
    <table style={ts.table}>
      <colgroup><col style={{ width: 70 }} /></colgroup>
      <tbody>
        {/* fila 1: distrito — tamaño 75 */}
        <tr style={{ height: 8 }}>
          <td style={{ ...ts.cell, fontSize: 9, fontWeight: 'bold' }}>
            {datos.distrito}
          </td>
        </tr>
        {/* fila 2: tipo_ctl + nombre_ctl — tamaño variable */}
        <tr style={{ height: 7 }}>
          <td style={{ ...ts.cell, fontSize: Math.min(fSize / 6, 11) }}>
            {nombre_ctl}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** tbl_CP_Ruta_Nse: 2 filas × 3 cols → ren {5,10}, col {15,15,15} */
function TblCpRutaNse({ datos }: { datos: PlDatos }) {
  return (
    <table style={ts.table}>
      <colgroup>
        <col style={{ width: 15 }} /><col style={{ width: 15 }} /><col style={{ width: 15 }} />
      </colgroup>
      <tbody>
        {/* fila 1: cabeceras — etiqueta_celdas */}
        <tr style={{ height: 5 }}>
          <td style={ts.headerCell}>C.P.</td>
          <td style={ts.headerCell}>RUTA</td>
          <td style={ts.headerCell}>NSE PRED</td>
        </tr>
        {/* fila 2: datos — llena_datos_celdas */}
        <tr style={{ height: 10 }}>
          <td style={ts.dataCell}>{datos.cp}</td>
          <td style={ts.dataCell}>{datos.ruta}</td>
          <td style={ts.dataCell}>{datos.nse}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** tbl_del_mpo: 2 filas × 2 cols → ren {7.5,7.5}, col {45,45}
 *  Sin bordes (bDibuja_bordes? = false, bDibuja_Columnas_Internas? = false) */
function TblDelMpo({ datos }: { datos: PlDatos }) {
  return (
    <table style={{ ...ts.table, borderCollapse: 'collapse' }}>
      <colgroup>
        <col style={{ width: 45 }} /><col style={{ width: 45 }} />
      </colgroup>
      <tbody>
        {/* fila 1: etiquetas top_left — etiqueta_celdas */}
        <tr style={{ height: 7 }}>
          <td style={ts.labelCell}> COLONIA:</td>
          <td style={{ ...ts.dataCell, border: 'none', textAlign: 'left' }}>{dados => dados}</td>
        </tr>
        {/* fila 2: delegación */}
        <tr style={{ height: 7 }}>
          <td style={ts.labelCell}> DELEGACION O MPO.:</td>
          <td style={{ ...ts.dataCell, border: 'none', textAlign: 'left' }}>{datos.del_mpo}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** tbl_del_mpo corregido — datos pasados correctamente */
function TblDelMpoFixed({ datos }: { datos: PlDatos }) {
  return (
    <table style={{ ...ts.table, borderCollapse: 'collapse' }}>
      <colgroup>
        <col style={{ width: 90 }} /><col style={{ width: 120 }} />
      </colgroup>
      <tbody>
        <tr style={{ height: 20 }}>
          <td style={ts.labelCell}> COLONIA:</td>
          <td style={{ ...ts.dataCell, border: 'none', textAlign: 'left' }}>{datos.colonia}</td>
        </tr>
        <tr style={{ height: 20 }}>
          <td style={ts.labelCell}> DELEGACION O MPO.:</td>
          <td style={{ ...ts.dataCell, border: 'none', textAlign: 'left' }}>{datos.del_mpo}</td>
        </tr>
      </tbody>
    </table>
  );
}

/** tbl_compania: 3 filas × 1 col — nombre empresa partido en líneas */
function TblCompania({ lineas, fontSize }: { lineas: string[]; fontSize: number }) {
  return (
    <table style={{ ...ts.table, minWidth: 100 }}>
      <tbody>
        {lineas.map((l, i) => (
          <tr key={i}>
            <td style={{ ...ts.dataCell, fontSize: Math.min(fontSize / 4, 11) }}>
              {l}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — SelloEstandarConstruccion
// ---------------------------------------------------------------------------
interface Props {
  /** Proyecto GIS; si omitido usa mock */
  proyecto?: OProyecto;
}

export function SelloEstandarConstruccionUI({ proyecto = MOCK_PROYECTO }: Props) {
  // Equivale a los slots :oTipoEmpresaRazonS, :valorEmpresaRazonS y .pl_datos
  const [attrs, setAttrs] = useState<AtributosConstruccion>({
    blanco_negro  : 'NO',
    emprerazon    : '3',  // default: TELMEX
    fecha         : '',
    colonia       : '',
    municipio     : '',
    codigo_postal : '',
    ruta          : '',
  });

  const [datos, setDatos]         = useState<PlDatos | null>(null);
  const [loading, setLoading]     = useState(false);

  // obten_registros — se dispara al cambiar atributos (simula configura_tabla → obten_registros)
  useEffect(() => {
    setLoading(true);
    obtenRegistros(attrs, proyecto).then(d => {
      setDatos(d);
      setLoading(false);
    });
  }, [attrs, proyecto]);

  const empresa = attrs.emprerazon ? resolveEmpresa(attrs.emprerazon) : null;

  // ── Formulario de atributos (defined_attributes) ──
  const handleChange = (key: keyof AtributosConstruccion) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setAttrs(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 8 }}>

      {/* ── Formulario de atributos ── */}
      <fieldset style={{ marginBottom: 12, padding: 8, borderRadius: 4 }}>
        <legend style={{ fontWeight: 'bold', fontSize: 11 }}>
          Atributos del sello (defined_attributes)
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>

          <label style={fs.label}>
            Blanco/Negro (enum_bool)
            <select value={attrs.blanco_negro} onChange={handleChange('blanco_negro')} style={fs.input}>
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </label>

          {/* enum_tipo_razon_social */}
          <label style={fs.label}>
            Empresa (enum_tipo_razon_social)
            <select value={attrs.emprerazon} onChange={handleChange('emprerazon')} style={fs.input}>
              <option value="">— ninguna —</option>
              {Object.entries(ENUM_TIPO_RAZON_SOCIAL).map(([k, v]) => (
                <option key={k} value={k}>{v.replace(/\|/g, ' ')}</option>
              ))}
            </select>
          </label>

          <label style={fs.label}>
            Fecha
            <input value={attrs.fecha} onChange={handleChange('fecha')} style={fs.input} />
          </label>

          <label style={fs.label}>
            Colonia (vacío → distrito)
            <input value={attrs.colonia} onChange={handleChange('colonia')} style={fs.input}
              placeholder={proyecto.distrito.nombre_colonia} />
          </label>

          <label style={fs.label}>
            Municipio/Delegación (vacío → distrito)
            <input value={attrs.municipio} onChange={handleChange('municipio')} style={fs.input}
              placeholder={proyecto.distrito.nombre_delegacion_municipio} />
          </label>

          <label style={fs.label}>
            Código Postal (vacío → distrito)
            <input value={attrs.codigo_postal} onChange={handleChange('codigo_postal')} style={fs.input}
              placeholder={proyecto.distrito.codigo_postal} />
          </label>

          <label style={fs.label}>
            Ruta (vacío → distrito)
            <input value={attrs.ruta} onChange={handleChange('ruta')} style={fs.input}
              placeholder={proyecto.distrito.numero_ruta} />
          </label>

        </div>
      </fieldset>

      {/* ── Sello renderizado ── */}
      {loading && <p style={{ color: '#888' }}>Cargando datos...</p>}

      {datos && (
        <div>
          <p style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>
            Sello generado — 3 tablas: tbl_Ctl_Dto + tbl_CP_Ruta_Nse + tbl_del_mpo
            {datos.fecha ? ` · Fecha: ${datos.fecha}` : ''}
          </p>

          {/* Layout horizontal — configura_tabla posiciona por coordenadas X acumuladas */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid #333', width: 'fit-content' }}>

            {/* tbl_Ctl_Dto — 2 filas × 1 col */}
            <div style={{ borderRight: '1px solid #555', minWidth: 150 }}>
              <div style={{ background: '#2E4057', color: '#fff', fontSize: 9, padding: '2px 4px' }}>
                CTL / DISTRITO
              </div>
              <TblCtlDto datos={datos} />
            </div>

            {/* tbl_CP_Ruta_Nse — 2 filas × 3 cols */}
            <div style={{ borderRight: '1px solid #555' }}>
              <div style={{ background: '#2E4057', color: '#fff', fontSize: 9, padding: '2px 4px' }}>
                CP / RUTA / NSE
              </div>
              <TblCpRutaNse datos={datos} />
            </div>

            {/* tbl_del_mpo — 2 filas × 2 cols, sin bordes internos */}
            <div style={{ borderRight: '1px solid #555' }}>
              <div style={{ background: '#2E4057', color: '#fff', fontSize: 9, padding: '2px 4px' }}>
                COLONIA / DELEGACIÓN
              </div>
              <TblDelMpoFixed datos={datos} />
            </div>

            {/* tbl_compania — empresa en 3 líneas si aplica */}
            {empresa && (
              <div>
                <div style={{ background: '#2E4057', color: '#fff', fontSize: 9, padding: '2px 4px' }}>
                  COMPAÑÍA ({empresa.codigoEmpresa})
                </div>
                <TblCompania lineas={empresa.lineas} fontSize={empresa.fontSize} />
              </div>
            )}
          </div>

          {/* Tabla de diagnóstico — pl_datos completo */}
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>
              pl_datos (property_list interna)
            </summary>
            <table style={{ ...ts.table, marginTop: 6, width: 'auto' }}>
              <tbody>
                {(Object.entries(datos) as [string, string][]).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ ...ts.headerCell, whiteSpace: 'nowrap' }}>{k}</td>
                    <td style={ts.dataCell}>{v || <em style={{ color: '#aaa' }}>(vacío)</em>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const ts: Record<string, React.CSSProperties> = {
  table     : { borderCollapse: 'collapse', width: '100%' },
  cell      : { border: '1px solid #aaa', padding: '2px 4px', verticalAlign: 'middle' },
  headerCell: { border: '1px solid #aaa', padding: '2px 4px', background: '#e8edf2',
                fontWeight: 'bold', textAlign: 'center', fontSize: 10 },
  dataCell  : { border: '1px solid #aaa', padding: '2px 4px', fontSize: 10 },
  labelCell : { border: '1px solid #aaa', padding: '2px 4px', fontSize: 10,
                fontWeight: 'bold', textAlign: 'left', whiteSpace: 'nowrap' },
};

const fs: Record<string, React.CSSProperties> = {
  label: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11, color: '#444' },
  input: { padding: '2px 6px', fontSize: 12, border: '1px solid #bbb', borderRadius: 3 },
};

export default SelloEstandarConstruccionUI;
