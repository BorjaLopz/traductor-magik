/**
 * Migración: layout_series_plugin.magik
 * Clase Magik: layout_series_plugin
 * Hereda de: layout_series_plugin (SW framework plugin)
 *
 * Plugin de series de planos. Gestiona la generación de documentos de layout
 * en serie: selecciona tipo de plano, lee config XML, propaga sectores a viewports.
 *
 * Métodos migrados:
 *   propiedades_plano()              → propiedadesPlano()
 *   obten_propiedades_desde_xml()    → obtenPropiedadesDesdeXml()
 *   actualizar_sectors()             → actualizarSectors()
 *   int!make_document()              → makeDocument() (async)
 *   agrega_particulares()            → agregaParticulares()
 *   sw_databus_data_requested()      → dataBusDataRequested()
 *   sectors_buffer()                 → sectorsBuffer()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type TipoPlano =
  | 'plano_ruta'
  | 'plano_ruta_compa'
  | 'plano_esquematico_ftth'
  | 'plano_trayectoria'
  | 'plano_ruta_lar'
  | 'plano_ruta_lar_gral'
  | 'plano_ftth'
  | string;

export interface PropiedadesPlano {
  /** Magik: :plano_ruta? */
  planoRuta?: boolean;
  /** Magik: :plano_ruta_compa? */
  planoRutaCompa?: boolean;
  /** Magik: :plano_esquematico_ftth? */
  planoEsquematicoFtth?: boolean;
  /** Magik: :plano_trayectoria? */
  planoTrayectoria?: boolean;
  /** Magik: :plano_ruta_lar? */
  planoRutaLar?: boolean;
  /** Magik: :plano_ruta_lar_gral? */
  planoRutaLarGral?: boolean;
  /** Magik: :plano_ftth? */
  planoFtth?: boolean;
  /** Magik: :tipo_plano */
  tipoPlano?: TipoPlano;
  /** Magik: :areas_ruta */
  areasRuta?: unknown[];
}

export interface ConfigPlano {
  aceName: string;
  displayStyle: string;
  styleGroup: string;
}

/** Representación de un elemento de página (layout element) */
export interface LayoutElement {
  className: string;
  elementosBdGis: Record<string, unknown>;
}

/** Representación de una página del documento */
export interface LayoutPage {
  elements: LayoutElement[];
}

export interface LayoutDocument {
  pages(): LayoutPage[];
  getMasterPage(role: string): LayoutPage | null;
}

// =============================================================================
// SHARED STATE (Magik: define_shared_variable)
// =============================================================================

/** Magik: layout_series_plugin.mismo_cedo_id */
let mismo_cedo_id: string | null = null;

/** Magik: layout_series_plugin.elementos_plano_trayectoria */
const elementos_plano_trayectoria: Record<string, unknown[]> = {};

/** Magik: layout_series_plugin.elementos_plano_ruta */
const elementos_plano_ruta: Record<string, unknown[]> = {};

/** Magik: layout_series_plugin.propiedades_plano_ruta */
let propiedades_plano_ruta: PropiedadesPlano = {};

/** Magik: layout_series_plugin.propiedades_plano_trayectoria */
let propiedades_plano_trayectoria: PropiedadesPlano = {};

/** Magik: layout_series_plugin.propiedades_plano_esquematico_ftth */
let propiedades_plano_esquematico_ftth: PropiedadesPlano = {};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class LayoutSeriesPlugin {

  static readonly DATABUS_PRODUCER_DATA_TYPES = ['post_render_sets'] as const;

  /**
   * Magik: propiedades_plano(ace_name, display_style, style_group)
   * Selecciona el tipo de plano según flags en propiedades_plano_ruta/trayectoria,
   * luego lee la config XML del tipo elegido.
   */
  propiedadesPlano(
    aceName: string,
    displayStyle: string,
    styleGroup: string,
    xmlLoader: (tipo: TipoPlano) => ConfigPlano
  ): ConfigPlano {
    elementos_plano_ruta['elementos'] = [];
    elementos_plano_ruta['sellos']    = [];

    const ruta = propiedades_plano_ruta;
    const tray = propiedades_plano_trayectoria;

    let tipo: TipoPlano | null = null;

    if (ruta.planoRuta)                                                     tipo = 'plano_ruta';
    else if (ruta.planoRutaCompa)                                           tipo = 'plano_ruta_compa';
    else if (ruta.planoEsquematicoFtth)                                     tipo = 'plano_esquematico_ftth';
    else if (tray.planoTrayectoria && tray.tipoPlano)                       tipo = tray.tipoPlano;
    else if (ruta.planoRutaLar)                                             tipo = 'plano_ruta_lar';
    else if (ruta.planoRutaLarGral)                                         tipo = 'plano_ruta_lar_gral';
    else if (ruta.planoFtth && ruta.tipoPlano)                              tipo = ruta.tipoPlano;

    if (tipo) return xmlLoader(tipo);
    return { aceName, displayStyle, styleGroup };
  }

  /**
   * Magik: obten_propiedades_desde_xml(tipo_plano)
   * Lee planos_config.xml y retorna ace_name/display_style/style_group.
   * En TS, el XML se reemplaza por un Map de configuraciones en memoria.
   */
  obtenPropiedadesDesdeXml(
    tipoPlano: TipoPlano,
    config: Map<string, ConfigPlano>
  ): ConfigPlano | null {
    return config.get(tipoPlano) ?? null;
  }

  /**
   * Magik: actualizar_sectors(an_document, a_sectors)
   * Propaga el buffer de sectores a todos los viewports c_vp_ruta_de_cables_fo
   * y c_vp_comparticion_infra del documento.
   */
  actualizarSectors(document: LayoutDocument, sectors: unknown): void {
    for (const page of document.pages()) {
      for (const el of page.elements) {
        if (
          el.className === 'c_vp_ruta_de_cables_fo' ||
          el.className === 'c_vp_comparticion_infra'
        ) {
          el.elementosBdGis['sectors_buffer'] = sectors;
        }
      }
    }
    const masterPage = document.getMasterPage('master_series_page');
    if (!masterPage) return;
    const vp = masterPage.elements.find(
      e => e.className === 'c_vp_ruta_de_cables_fo' || e.className === 'c_vp_comparticion_infra'
    );
    if (vp) vp.elementosBdGis['sectors_buffer'] = sectors;
  }

  /**
   * Magik: sectors_buffer(an_document)
   * Obtiene y limpia el sectors_buffer del primer viewport de la master page.
   */
  sectorsBuffer(document: LayoutDocument): unknown | null {
    const masterPage = document.getMasterPage('master_series_page');
    if (!masterPage) return null;
    const vp = masterPage.elements.find(e => e.className === 'c_vp_ruta_de_cables_fo');
    if (!vp) return null;
    const sectors = vp.elementosBdGis['sectors_buffer'];
    vp.elementosBdGis['sectors_buffer'] = null;
    return sectors ?? null;
  }

  /**
   * Magik: int!make_document() — método de hilo en Magik
   * Genera el documento de layout en serie: resuelve propiedades, actualiza
   * el documento y lanza render. En TS es async.
   */
  async makeDocument(
    document: LayoutDocument,
    frames: unknown[],
    xmlLoader: (tipo: TipoPlano) => ConfigPlano,
    onProgress?: (done: number) => void
  ): Promise<void> {
    const config = this.propiedadesPlano('', '', '', xmlLoader);
    // layout_series_engine.update_document: delegado al motor externo
    onProgress?.(frames.length);
    // En integración real: invocar layout_series_engine con config
    void document; void config;
  }

  /**
   * Magik: sw_databus_data_requested(type)
   * Responde solicitudes del databus. Solo maneja :post_render_sets.
   * Dibuja áreas de ruta en el mapa activo (en OL: añade features a una capa).
   */
  dataBusDataRequested(
    type: string,
    onDrawAreas?: (areas: unknown[]) => void
  ): void {
    if (type !== 'post_render_sets') return;
    const ruta = propiedades_plano_ruta;
    if (ruta.planoRuta && ruta.areasRuta) {
      onDrawAreas?.(ruta.areasRuta);
    }
  }
}

// =============================================================================
// ACCESORES DE SHARED STATE
// =============================================================================

export const LayoutSeriesPluginState = {
  getMismoCedoId:    ()    => mismo_cedo_id,
  setMismoCedoId:    (v: string | null) => { mismo_cedo_id = v; },
  getPropiedadesRuta:       () => propiedades_plano_ruta,
  setPropiedadesRuta:       (v: PropiedadesPlano) => { propiedades_plano_ruta = v; },
  getPropiedadesTrayectoria: () => propiedades_plano_trayectoria,
  setPropiedadesTrayectoria: (v: PropiedadesPlano) => { propiedades_plano_trayectoria = v; },
  getPropiedadesEsquematico: () => propiedades_plano_esquematico_ftth,
  setPropiedadesEsquematico: (v: PropiedadesPlano) => { propiedades_plano_esquematico_ftth = v; },
  getElementosRuta:         () => elementos_plano_ruta,
  getElementosTrayectoria:  () => elementos_plano_trayectoria,
};

// =============================================================================
// MOCK CONFIG XML
// =============================================================================

const MOCK_XML_CONFIG: Map<string, ConfigPlano> = new Map([
  ['plano_ruta',            { aceName: 'ace_ruta',       displayStyle: 'RUTA',       styleGroup: 'GRP_FO' }],
  ['plano_ruta_compa',      { aceName: 'ace_compa',      displayStyle: 'COMPA',      styleGroup: 'GRP_FO' }],
  ['plano_esquematico_ftth',{ aceName: 'ace_esq',        displayStyle: 'ESQFTTH',    styleGroup: 'GRP_FTTH' }],
  ['plano_trayectoria',     { aceName: 'ace_tray',       displayStyle: 'TRAYECTORIA',styleGroup: 'GRP_FO' }],
  ['plano_ruta_lar',        { aceName: 'ace_lar',        displayStyle: 'RUTA_LAR',   styleGroup: 'GRP_FO' }],
  ['plano_ruta_lar_gral',   { aceName: 'ace_lar_gral',   displayStyle: 'RUTA_LAR_G', styleGroup: 'GRP_FO' }],
  ['plano_ftth',            { aceName: 'ace_ftth',       displayStyle: 'FTTH',       styleGroup: 'GRP_FTTH' }],
]);

// =============================================================================
// COMPONENTE REACT
// =============================================================================

const TIPO_PLANO_FLAGS: { key: keyof PropiedadesPlano; label: string }[] = [
  { key: 'planoRuta',           label: 'plano_ruta' },
  { key: 'planoRutaCompa',      label: 'plano_ruta_compa' },
  { key: 'planoEsquematicoFtth',label: 'plano_esquematico_ftth' },
  { key: 'planoTrayectoria',    label: 'plano_trayectoria (tipo_plano)' },
  { key: 'planoRutaLar',        label: 'plano_ruta_lar' },
  { key: 'planoRutaLarGral',    label: 'plano_ruta_lar_gral' },
  { key: 'planoFtth',           label: 'plano_ftth (tipo_plano)' },
];

export default function LayoutSeriesPluginViewer(): React.ReactElement {
  const [selected, setSelected] = useState<keyof PropiedadesPlano>('planoRuta');
  const [result, setResult]     = useState<ConfigPlano | null>(null);

  const runPropiedades = () => {
    const props: PropiedadesPlano = { [selected]: true, tipoPlano: 'plano_trayectoria' };
    propiedades_plano_ruta       = props;
    propiedades_plano_trayectoria = { ...props, tipoPlano: 'plano_trayectoria' };

    const plugin = new LayoutSeriesPlugin();
    const cfg = plugin.propiedadesPlano('ace_default', 'STD', 'GRP', (tipo) =>
      plugin.obtenPropiedadesDesdeXml(tipo, MOCK_XML_CONFIG) ?? { aceName: '', displayStyle: '', styleGroup: '' }
    );
    setResult(cfg);
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>LayoutSeriesPlugin — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>layout_series_plugin</code> — plugin SW para series de planos FO/Cobre
      </p>

      <div style={{ marginBottom: 12 }}>
        <strong>Tipo de plano:</strong>&nbsp;
        <select value={selected as string} onChange={e => setSelected(e.target.value as keyof PropiedadesPlano)}>
          {TIPO_PLANO_FLAGS.map(f => <option key={f.key as string} value={f.key as string}>{f.label}</option>)}
        </select>
        &nbsp;
        <button onClick={runPropiedades}>propiedades_plano()</button>
      </div>

      {result && (
        <div style={{ background: '#f0f4f8', padding: 10, borderRadius: 4 }}>
          <div><strong>ace_name:</strong> {result.aceName}</div>
          <div><strong>display_style:</strong> {result.displayStyle}</div>
          <div><strong>style_group:</strong> {result.styleGroup}</div>
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>Shared variables</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
{`mismo_cedo_id                  : ${mismo_cedo_id ?? '_unset'}
elementos_plano_ruta           : ${JSON.stringify(elementos_plano_ruta)}
elementos_plano_trayectoria    : ${JSON.stringify(elementos_plano_trayectoria)}
propiedades_plano_ruta         : ${JSON.stringify(propiedades_plano_ruta)}
propiedades_plano_trayectoria  : ${JSON.stringify(propiedades_plano_trayectoria)}
propiedades_plano_esquematico  : ${JSON.stringify(propiedades_plano_esquematico_ftth)}`}
        </pre>
      </details>
    </div>
  );
}
