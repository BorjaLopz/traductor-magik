/**
 * Migracion de: c_traductor.magik
 * Clase Magik:  c_Traductor
 * Metodos:      Tipo_Superficie, Mes, Tipo_Central, metodo_pep,
 *               tipo_plano, tipo_caseta, nombre_atributo_pep
 *
 * Intencion:
 *   Traducir claves y descripciones a abreviaturas o nombres
 *   normalizados usados en planos y PEP.
 */

import React, { useEffect, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type StringMap = Record<string, string>;

export type TraductorCategoria =
  | 'tipoSuperficie'
  | 'mes'
  | 'tipoCentral'
  | 'metodoPep'
  | 'tipoPlano'
  | 'tipoCaseta'
  | 'nombreAtributoPep';

// =============================================================================
// MAPAS BASE
// =============================================================================

function buildTipoSuperficieMap(): StringMap {
  return {
    Acera: 'ACERA',
    Adoquin: 'ADOQ.',
    Arena: 'ARENA',
    Asfalto: 'ASFAL.',
    Azulejo: 'AZULE.',
    Carretera: 'CARRET.',
    Concreto: 'CONCR.',
    Desconocido: 'DESCO.',
    Empedrado: 'EMPED.',
    Lajas: 'LAJAS',
    Mosaico: 'MOSAI.',
    Otros: 'OTROS',
    'Pasto (Area Jardinada)': 'PASTO',
    Tepetate: 'TEPET.',
    'Tierra Limpia': 'TIERRA',
  };
}

function buildMesMap(formatoLargo: boolean): Record<number, string> {
  if (formatoLargo) {
    return {
      1: 'ENERO',
      2: 'FEBRERO',
      3: 'MARZO',
      4: 'ABRIL',
      5: 'MAYO',
      6: 'JUNIO',
      7: 'JULIO',
      8: 'AGOSTO',
      9: 'SEPTIEMBRE',
      10: 'OCTUBRE',
      11: 'NOVIEMBRE',
      12: 'DICIEMBRE',
    };
  }

  return {
    1: 'ENE',
    2: 'FEB',
    3: 'MAR',
    4: 'ABR',
    5: 'MAY',
    6: 'JUN',
    7: 'JUL',
    8: 'AGO',
    9: 'SEP',
    10: 'OCT',
    11: 'NOV',
    12: 'DIC',
  };
}

function buildTipoCentralMap(): StringMap {
  return {
    CENTRAL: 'CTL',
    CONTENEDOR: 'URL',
    URL: 'URL',
    GABINETE: 'NAM',
    NAM: 'NAM',
  };
}

function buildMetodoPepMap(): StringMap {
  return {
    pep_construccion_canalizacion: 'pep_cons_can',
    pep_construccion_principal: 'pep_cons_princ',
    pep_construccion_secundaria: 'pep_cons_sec',
    pep_desmontaje_canalizacion: 'pep_desm_can',
    pep_desmontaje_principal: 'pep_desm_princ',
    pep_desmontaje_secundaria: 'pep_desm_sec',
    pep_rehabilitacion_canalizacion: 'pep_reha_can',
    pep_rehabilitacion_principal: 'pep_reha_princ',
    pep_rehabilitacion_secundaria: 'pep_reha_sec',
    pep_reconcentracion_principal: 'pep_reco_princ',
    pep_reconcentracion_secundaria: 'pep_reco_sec',
  };
}

function buildTipoPlanoMap(): StringMap {
  return {
    fosa_cables: 'FOSA DE CABLES Y DG',
    division_distritos: 'DIVISION DE DISTRITOS',
    ashurado: 'ASHURADO',
    itinerario: 'ITINERARIO DE CANALIZACION',
    estudio_conjunto: 'ESTUDIO DE CONJUNTO',
    principales: 'ESQUEMATICO RED PRINCIPAL',
    ruta_cables: 'RUTA DE CABLES',
    ruta_cables_fo: 'RUTA DE CABLES',
  };
}

function buildTipoCasetaMap(): StringMap {
  return {
    'TELEFONO PUBLICO PONGA SU LINEA A TRABAJAR PSLT': 'PSLT',
    'TELEFONO PUBLICO TARJETA CHIP TPTC': 'TPTC',
    'TELEFONO PUBLICO LINEA TELEFONO COMPARTIDO LTC': 'LTC',
    'TELEFONO PUBLICO COMPETENCIA': 'OPERT',
  };
}

function buildNombreAtributoPepMap(): StringMap {
  return {
    PEPCanalizacionAligeradaFibraUT: 'user!_pep_ut_cana_ali',
    PEPCanalizacionEncofradaFibraUT: 'user!_pep_ut_cana_enc',
    PEPFibraAereaUT: 'user!_pep_ut_fib_ae',
    PEPFibraSubterraneaUT: 'user!_pep_ut_fib_sub',
    PEPCanalizacionAligeradaFibraZO: 'user!_pep_zo_cana_ali',
    PEPCanalizacionEncofradaFibraZO: 'user!_pep_zo_cana_enc',
    PEPFibraAereaZO: 'user!_pep_zo_fib_ae',
    PEPFibraSubterraneaZO: 'user!_pep_zo_fib_sub',
  };
}

function getValue(map: StringMap, key: string, fallback = ''): string {
  return map[key] ?? fallback;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class Traductor {
  private tablaSup?: StringMap;
  private tablaMesCorto?: Record<number, string>;
  private tablaMesLargo?: Record<number, string>;
  private tablaTipoCtl?: StringMap;
  private tablaMetPep?: StringMap;
  private tablaTipoPlano?: StringMap;
  private tablaCasetas?: StringMap;

  // Magik: Tipo_Superficie(PsTipo_Sup)
  async tipoSuperficie(tipo: string): Promise<string> {
    if (!this.tablaSup) this.tablaSup = buildTipoSuperficieMap();
    return getValue(this.tablaSup, tipo, '');
  }

  // Magik: Mes(PnNumeroMes, formato_largo?)
  async mes(numeroMes: number, formatoLargo = false): Promise<string> {
    if (formatoLargo) {
      if (!this.tablaMesLargo) this.tablaMesLargo = buildMesMap(true);
      return this.tablaMesLargo[numeroMes] ?? '';
    }

    if (!this.tablaMesCorto) this.tablaMesCorto = buildMesMap(false);
    return this.tablaMesCorto[numeroMes] ?? '';
  }

  // Magik: Tipo_Central(PsTipoCtl)
  async tipoCentral(tipo: string): Promise<string> {
    if (!this.tablaTipoCtl) this.tablaTipoCtl = buildTipoCentralMap();
    return getValue(this.tablaTipoCtl, tipo, 'CTL');
  }

  // Magik: metodo_pep(PsPEPSel)
  async metodoPep(selector: string): Promise<string> {
    if (!this.tablaMetPep) this.tablaMetPep = buildMetodoPepMap();
    return getValue(this.tablaMetPep, selector, '');
  }

  // Magik: tipo_plano(Id_Tipo_Plano)
  async tipoPlano(tipo: string): Promise<string> {
    if (!this.tablaTipoPlano) this.tablaTipoPlano = buildTipoPlanoMap();
    return getValue(this.tablaTipoPlano, tipo, '');
  }

  // Magik: tipo_caseta(p_descripcion)
  async tipoCaseta(descripcion: string): Promise<string> {
    if (!this.tablaCasetas) this.tablaCasetas = buildTipoCasetaMap();
    return getValue(this.tablaCasetas, descripcion, '');
  }

  // Magik: nombre_atributo_pep(psym_nombre_pep)
  async nombreAtributoPep(nombre: string): Promise<string> {
    const map = buildNombreAtributoPepMap();
    return getValue(map, nombre, '');
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

export function TraductorUI() {
  const traductor = useMemo(() => new Traductor(), []);
  const [categoria, setCategoria] = useState<TraductorCategoria>('tipoSuperficie');
  const [inputValue, setInputValue] = useState('');
  const [mesLargo, setMesLargo] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    let mounted = true;

    async function resolveOutput() {
      let value = '';

      if (categoria === 'mes') {
        const num = Number(inputValue);
        value = Number.isFinite(num) ? await traductor.mes(num, mesLargo) : '';
      } else if (categoria === 'tipoSuperficie') {
        value = await traductor.tipoSuperficie(inputValue);
      } else if (categoria === 'tipoCentral') {
        value = await traductor.tipoCentral(inputValue);
      } else if (categoria === 'metodoPep') {
        value = await traductor.metodoPep(inputValue);
      } else if (categoria === 'tipoPlano') {
        value = await traductor.tipoPlano(inputValue);
      } else if (categoria === 'tipoCaseta') {
        value = await traductor.tipoCaseta(inputValue);
      } else if (categoria === 'nombreAtributoPep') {
        value = await traductor.nombreAtributoPep(inputValue);
      }

      if (mounted) setOutput(value);
    }

    resolveOutput();

    return () => {
      mounted = false;
    };
  }, [traductor, categoria, inputValue, mesLargo]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_traductor</div>
      <div style={s.controls}>
        <label style={s.label}>
          Categoria
          <select value={categoria} onChange={e => setCategoria(e.target.value as TraductorCategoria)} style={s.select}>
            <option value="tipoSuperficie">tipo_superficie</option>
            <option value="mes">mes</option>
            <option value="tipoCentral">tipo_central</option>
            <option value="metodoPep">metodo_pep</option>
            <option value="tipoPlano">tipo_plano</option>
            <option value="tipoCaseta">tipo_caseta</option>
            <option value="nombreAtributoPep">nombre_atributo_pep</option>
          </select>
        </label>
        <label style={s.label}>
          Clave
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={categoria === 'mes' ? '1..12' : 'clave'}
            style={s.input}
          />
        </label>
        {categoria === 'mes' && (
          <label style={s.label}>
            <input type="checkbox" checked={mesLargo} onChange={e => setMesLargo(e.target.checked)} />
            Formato largo
          </label>
        )}
      </div>
      <div style={s.result}>Resultado: {output || '(vacio)'}</div>
      <div style={s.meta}>
        Ejemplo: tipo_superficie / Asfalto {'->'} ASFAL.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper : { display: 'flex', flexDirection: 'column', gap: 8 },
  title   : { fontSize: 13, fontWeight: 'bold' },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  label   : { fontSize: 12, color: '#333', display: 'flex', gap: 6, alignItems: 'center' },
  select  : { padding: '4px 6px', fontSize: 12 },
  input   : { padding: '4px 6px', fontSize: 12, width: 220 },
  result  : { fontSize: 12, color: '#444' },
  meta    : { fontSize: 11, color: '#777' },
};

export default TraductorUI;
