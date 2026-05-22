/**
 * Migración de: c_Traductor.magik
 * Clase Magik:  c_Traductor — Sigma Tao / VBL (Viridiana Baltazar Luna) / 13-Feb-2006
 *               Modificado: VBL / 17-Feb-2006
 *
 * Utilidad de traducción/abreviación: convierte claves internas del GIS a textos
 * de plano (meses, superficies, centrales, tipos de plano, casetas, PEP).
 * No realiza cálculos espaciales ni interactúa con el mapa.
 */

import React, { useState } from 'react';

// =============================================================================
// CLASE PRINCIPAL
// Magik: def_slotted_exemplar(:c_Traductor, { 6 slots writable })
// =============================================================================

export class CTraductor {

  // Slots Magik → propiedades privadas de instancia (lazy-initialized)
  private tablaSup:       Map<string, string> | null = null;  // {:oTabla_Sup}
  private tablaMes:       Map<number, string> | null = null;  // {:oTabla_Mes}
  private tablaTipoCtl:   Map<string, string> | null = null;  // {:oTabla_TipoCtl}
  private tablaMetPep:    Map<string, string> | null = null;  // {:oTabla_Met_PEP}
  private tablaTipoPlano: Map<string, string> | null = null;  // {:oTabla_Tipo_Plano}
  private tablaCasetas:   Map<string, string> | null = null;  // {:oTabla_Casetas}

  // ── Tipo_Superficie ──────────────────────────────────────────────────────────
  // Magik: lazy-init hash_table con default_value "" → ?? ''
  // Símbolos Magik :|Acera| etc. → string keys
  tipoSuperficie(tipoSup: string): string {
    if (this.tablaSup === null) {
      this.tablaSup = new Map([
        ['Acera',                 'ACERA'],
        ['Adoquin',               'ADOQ.'],
        ['Arena',                 'ARENA'],
        ['Asfalto',               'ASFAL.'],
        ['Azulejo',               'AZULE.'],
        ['Carretera',             'CARRET.'],
        ['Concreto',              'CONCR.'],
        ['Desconocido',           'DESCO.'],
        ['Empedrado',             'EMPED.'],
        ['Lajas',                 'LAJAS'],
        ['Mosaico',               'MOSAI.'],
        ['Otros',                 'OTROS'],
        ['Pasto (Area Jardinada)', 'PASTO'],
        ['Tepetate',              'TEPET.'],
        ['Tierra Limpia',         'TIERRA'],
      ]);
    }
    return this.tablaSup.get(tipoSup) ?? '';
  }

  // ── Mes ──────────────────────────────────────────────────────────────────────
  // NOTA: Magik NO tiene check "_if _is _unset" → reconstruye tabla cada llamada.
  // Comportamiento intencional: permite cambiar formatoLargo entre llamadas.
  mes(numeroMes: number, formatoLargo = false): string {
    const nombres = formatoLargo
      ? ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO',
         'JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
      : ['ENE','FEB','MAR','ABR','MAY','JUN',
         'JUL','AGO','SEP','OCT','NOV','DIC'];

    // Siempre reconstruye — fiel al original Magik
    this.tablaMes = new Map(nombres.map((n, i) => [i + 1, n]));
    return this.tablaMes.get(numeroMes) ?? '';
  }

  // ── Tipo_Central ─────────────────────────────────────────────────────────────
  // Magik: default_value "CTL" → ?? 'CTL'
  tipoCentral(tipoCtl: string): string {
    if (this.tablaTipoCtl === null) {
      this.tablaTipoCtl = new Map([
        ['CENTRAL',    'CTL'],
        ['CONTENEDOR', 'URL'],
        ['URL',        'URL'],
        ['GABINETE',   'NAM'],
        ['NAM',        'NAM'],
      ]);
    }
    return this.tablaTipoCtl.get(tipoCtl) ?? 'CTL';
  }

  // ── metodo_pep ───────────────────────────────────────────────────────────────
  // Magik: sin default_value → undefined si clave no existe
  metodoPep(pepSel: string): string | undefined {
    if (this.tablaMetPep === null) {
      this.tablaMetPep = new Map([
        ['pep_construccion_canalizacion',   'pep_cons_can'],
        ['pep_construccion_principal',      'pep_cons_princ'],
        ['pep_construccion_secundaria',     'pep_cons_sec'],
        ['pep_desmontaje_canalizacion',     'pep_desm_can'],
        ['pep_desmontaje_principal',        'pep_desm_princ'],
        ['pep_desmontaje_secundaria',       'pep_desm_sec'],
        ['pep_rehabilitacion_canalizacion', 'pep_reha_can'],
        ['pep_rehabilitacion_principal',    'pep_reha_princ'],
        ['pep_rehabilitacion_secundaria',   'pep_reha_sec'],
        ['pep_reconcentracion_principal',   'pep_reco_princ'],
        ['pep_reconcentracion_secundaria',  'pep_reco_sec'],
      ]);
    }
    return this.tablaMetPep.get(pepSel);
  }

  // ── tipo_plano ───────────────────────────────────────────────────────────────
  // Magik: default_value "" → ?? ''
  tipoPlano(idTipoPlano: string): string {
    if (this.tablaTipoPlano === null) {
      this.tablaTipoPlano = new Map([
        ['fosa_cables',        'FOSA DE CABLES Y DG'],
        ['division_distritos', 'DIVISION DE DISTRITOS'],
        ['ashurado',           'ASHURADO'],
        ['itinerario',         'ITINERARIO DE CANALIZACION'],
        ['estudio_conjunto',   'ESTUDIO DE CONJUNTO'],
        ['principales',        'ESQUEMATICO RED PRINCIPAL'],
        ['ruta_cables',        'RUTA DE CABLES'],
        ['ruta_cables_fo',     'RUTA DE CABLES'],
      ]);
    }
    return this.tablaTipoPlano.get(idTipoPlano) ?? '';
  }

  // ── tipo_caseta ──────────────────────────────────────────────────────────────
  // Magik: claves con :|texto largo| (símbolos con espacios) → string keys
  tipoCaseta(descripcion: string): string {
    if (this.tablaCasetas === null) {
      this.tablaCasetas = new Map([
        ['TELEFONO PUBLICO PONGA SU LINEA A TRABAJAR PSLT', 'PSLT'],
        ['TELEFONO PUBLICO TARJETA CHIP TPTC',              'TPTC'],
        ['TELEFONO PUBLICO LINEA TELEFONO COMPARTIDO LTC',  'LTC'],
        ['TELEFONO PUBLICO COMPETENCIA',                    'OPERT'],
      ]);
    }
    return this.tablaCasetas.get(descripcion) ?? '';
  }

  // ── nombre_atributo_pep ──────────────────────────────────────────────────────
  // NOTA: Magik crea hash_table LOCAL cada llamada (sin lazy-init ni slot).
  // Se replica exactamente: nueva Map por invocación.
  nombreAtributoPep(nombrePep: string): string | undefined {
    const tabla = new Map([
      ['PEPCanalizacionAligeradaFibraUT', 'user!_pep_ut_cana_ali'],
      ['PEPCanalizacionEncofradaFibraUT', 'user!_pep_ut_cana_enc'],
      ['PEPFibraAereaUT',                 'user!_pep_ut_fib_ae'],
      ['PEPFibraSubterraneaUT',           'user!_pep_ut_fib_sub'],
      ['PEPCanalizacionAligeradaFibraZO', 'user!_pep_zo_cana_ali'],
      ['PEPCanalizacionEncofradaFibraZO', 'user!_pep_zo_cana_enc'],
      ['PEPFibraAereaZO',                 'user!_pep_zo_fib_ae'],
      ['PEPFibraSubterraneaZO',           'user!_pep_zo_fib_sub'],
    ]);
    return tabla.get(nombrePep);
  }
}

// =============================================================================
// TIPOS INTERNOS PARA EL DEMO
// =============================================================================

type Method =
  | 'superficie'
  | 'mes'
  | 'central'
  | 'pep'
  | 'plano'
  | 'caseta'
  | 'atributoPep';

interface MethodDef {
  label:  string;
  values: (string | number)[];
}

const OPTIONS: Record<Method, MethodDef> = {
  superficie: {
    label: 'Tipo Superficie',
    values: [
      'Acera','Adoquin','Arena','Asfalto','Azulejo','Carretera','Concreto',
      'Desconocido','Empedrado','Lajas','Mosaico','Otros',
      'Pasto (Area Jardinada)','Tepetate','Tierra Limpia',
    ],
  },
  mes: {
    label: 'Mes (número)',
    values: [1,2,3,4,5,6,7,8,9,10,11,12],
  },
  central: {
    label: 'Tipo Central',
    values: ['CENTRAL','CONTENEDOR','URL','GABINETE','NAM','DESCONOCIDO'],
  },
  pep: {
    label: 'Método PEP',
    values: [
      'pep_construccion_canalizacion','pep_construccion_principal','pep_construccion_secundaria',
      'pep_desmontaje_canalizacion','pep_desmontaje_principal','pep_desmontaje_secundaria',
      'pep_rehabilitacion_canalizacion','pep_rehabilitacion_principal','pep_rehabilitacion_secundaria',
      'pep_reconcentracion_principal','pep_reconcentracion_secundaria',
    ],
  },
  plano: {
    label: 'Tipo Plano',
    values: [
      'fosa_cables','division_distritos','ashurado','itinerario',
      'estudio_conjunto','principales','ruta_cables','ruta_cables_fo',
    ],
  },
  caseta: {
    label: 'Tipo Caseta',
    values: [
      'TELEFONO PUBLICO PONGA SU LINEA A TRABAJAR PSLT',
      'TELEFONO PUBLICO TARJETA CHIP TPTC',
      'TELEFONO PUBLICO LINEA TELEFONO COMPARTIDO LTC',
      'TELEFONO PUBLICO COMPETENCIA',
    ],
  },
  atributoPep: {
    label: 'Nombre Atributo PEP',
    values: [
      'PEPCanalizacionAligeradaFibraUT','PEPCanalizacionEncofradaFibraUT',
      'PEPFibraAereaUT','PEPFibraSubterraneaUT',
      'PEPCanalizacionAligeradaFibraZO','PEPCanalizacionEncofradaFibraZO',
      'PEPFibraAereaZO','PEPFibraSubterraneaZO',
    ],
  },
};

const traductor = new CTraductor();

function resolver(method: Method, value: string | number, formatoLargo: boolean): string {
  switch (method) {
    case 'superficie':  return traductor.tipoSuperficie(value as string);
    case 'mes':         return traductor.mes(value as number, formatoLargo);
    case 'central':     return traductor.tipoCentral(value as string);
    case 'pep':         return traductor.metodoPep(value as string) ?? '(sin clave)';
    case 'plano':       return traductor.tipoPlano(value as string);
    case 'caseta':      return traductor.tipoCaseta(value as string);
    case 'atributoPep': return traductor.nombreAtributoPep(value as string) ?? '(sin clave)';
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

export function TraductorUI() {
  const [method,       setMethod]       = useState<Method>('superficie');
  const [value,        setValue]        = useState<string>('Acera');
  const [formatoLargo, setFormatoLargo] = useState(false);
  const [result,       setResult]       = useState<string | null>(null);

  const opts = OPTIONS[method];

  const handleMethodChange = (m: Method) => {
    setMethod(m);
    setValue(String(OPTIONS[m].values[0]));
    setResult(null);
  };

  const traducir = () => {
    const v = method === 'mes' ? Number(value) : value;
    setResult(resolver(method, v, formatoLargo));
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.h3}>c_Traductor</h3>

      <div style={s.row}>
        <label style={s.lbl}>Método</label>
        <select
          style={s.sel}
          value={method}
          onChange={e => handleMethodChange(e.target.value as Method)}
        >
          {(Object.keys(OPTIONS) as Method[]).map(k => (
            <option key={k} value={k}>{OPTIONS[k].label}</option>
          ))}
        </select>
      </div>

      <div style={s.row}>
        <label style={s.lbl}>Valor de entrada</label>
        <select
          style={{ ...s.sel, maxWidth: 420 }}
          value={value}
          onChange={e => setValue(e.target.value)}
        >
          {opts.values.map(v => (
            <option key={String(v)} value={String(v)}>{String(v)}</option>
          ))}
        </select>
      </div>

      {method === 'mes' && (
        <div style={s.row}>
          <label style={s.lbl}>Formato largo</label>
          <input
            type="checkbox"
            checked={formatoLargo}
            onChange={e => setFormatoLargo(e.target.checked)}
          />
          <span style={{ fontSize: 12, color: '#666' }}>
            {formatoLargo ? 'ENERO…DICIEMBRE' : 'ENE…DIC'}
          </span>
        </div>
      )}

      <button style={s.btn} onClick={traducir}>Traducir</button>

      {result !== null && (
        <div style={s.result}>
          <span style={s.arrow}>→</span>
          <code style={s.code}>
            {result || '(cadena vacía — default_value "")'}
          </code>
        </div>
      )}

      {/* Tablas completas de referencia */}
      <details style={{ marginTop: 24 }}>
        <summary style={s.summary}>Ver todas las tablas de traducción</summary>
        <div style={s.tablesGrid}>
          {(Object.keys(OPTIONS) as Method[]).map(m => (
            <table key={m} style={s.tbl}>
              <thead>
                <tr><th colSpan={2} style={s.thHead}>{OPTIONS[m].label}</th></tr>
                <tr>
                  <th style={s.th}>Entrada (Magik)</th>
                  <th style={s.th}>Salida</th>
                </tr>
              </thead>
              <tbody>
                {OPTIONS[m].values.map(v => {
                  const input = m === 'mes' ? Number(v) : String(v);
                  const out   = resolver(m, input, false);
                  return (
                    <tr key={String(v)}>
                      <td style={{ ...s.td, fontSize: 10, maxWidth: 220 }}>{String(v)}</td>
                      <td style={{ ...s.td, fontWeight: 'bold', color: out ? '#1a1a1a' : '#aaa' }}>
                        {out || '""'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
        </div>
      </details>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap      : { fontFamily: 'sans-serif', fontSize: 13 },
  h3        : { margin: '0 0 14px', fontSize: 14, fontWeight: 'bold' },
  row       : { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  lbl       : { width: 130, color: '#555', flexShrink: 0 },
  sel       : { padding: '4px 8px', fontSize: 12, border: '1px solid #ccc', borderRadius: 3, minWidth: 200 },
  btn       : { marginTop: 6, padding: '5px 16px', background: '#2E4057', color: '#fff',
                border: 'none', borderRadius: 4, cursor: 'pointer' },
  result    : { display: 'flex', alignItems: 'center', gap: 10, marginTop: 14,
                padding: '8px 14px', background: '#f0f7ff', borderRadius: 4, border: '1px solid #c8e0ff' },
  arrow     : { fontSize: 18, color: '#0969da' },
  code      : { fontSize: 14, color: '#1a1a1a' },
  summary   : { cursor: 'pointer', color: '#0969da', fontSize: 12 },
  tablesGrid: { display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  tbl       : { borderCollapse: 'collapse', fontSize: 11, minWidth: 200 },
  thHead    : { background: '#2E4057', color: '#fff', padding: '4px 8px', textAlign: 'left' },
  th        : { background: '#4a6080', color: '#fff', padding: '3px 8px', textAlign: 'left' },
  td        : { border: '1px solid #ddd', padding: '3px 8px' },
};

export default TraductorUI;
