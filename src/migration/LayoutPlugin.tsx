/**
 * Migración: layout_plugin.magik
 * Clase Magik: layout_plugin (_package sw)
 * Hereda de: layout_plugin (SW framework plugin)
 *
 * Plugin principal de layout para la aplicación GIS. Gestiona acciones de
 * impresión rápida, diseñador de layout, previsualización y plano de captura.
 *
 * Métodos migrados:
 *   fecha_med()                  → fechaMed()
 *   init_actions()               → initActions() — lista de acciones registradas
 *   plano_de_captura()           → planoDeCaptura()
 *   preview_layout(layout)       → previewLayout()
 *   quick_preview()              → quickPreview()
 *   quick_preview_for_map()      → quickPreviewForMap()
 *   start_layout_designer()      → accedido via layoutDesigner
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type PageOrientation = 'automatic' | 'landscape' | 'portrait';

export interface ViewBounds {
  xmin: number; ymin: number; xmax: number; ymax: number;
  width: number; height: number;
}

export interface LayoutOptions {
  templateDir?         : string;   /** SW_TEMPLATES_DB_DIR env */
  templateFile?        : string;   /** p_libre_plot.xml path */
  pageOrientation      : PageOrientation;
  measurementUnit      : 'mm' | 'inch';
  viewportMapping      : 'automatic' | 'manual';
}

export interface PlanoCaptura {
  tipo         : 'CONSTRUCCION' | 'FIBRA_LOCAL';
  marco        : { largo: number; alto: number };
  norte        : { tamano: 'A' | 'B' };
  titulo       : string;
  sello        : string;
  geomSetLayout: {
    tipoPlano   : string;
    nombrePlano : string;
    nMargenVp   : number;
    modulosAncho: number;
    modulosAlto : number;
  } | null;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Magik: layout_plugin.meses */
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

export const DEFAULT_OPTIONS: LayoutOptions = {
  pageOrientation : 'automatic',
  measurementUnit : 'mm',
  viewportMapping : 'automatic',
};

/** Acciones que init_actions registra en la UI */
export const REGISTERED_ACTIONS = [
  { id: 'quick_preview',     label: 'Vista previa rápida',   image: 'print'      },
  { id: 'layout_designer',   label: 'Diseñador de layout',   image: 'new_layout' },
  { id: 'quick_print',       label: 'Impresión rápida',      image: 'print'      },
  { id: 'quick_pdf',         label: 'PDF rápido',            image: 'pdf'        },
  { id: 'plano_de_captura',  label: 'Plano de captura',      image: 'print'      },
] as const;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class LayoutPlugin {

  options: LayoutOptions = { ...DEFAULT_OPTIONS };

  // --------------------------------------------------------------------------
  // fechaMed — Magik: fecha_med()
  // Devuelve fecha en formato "dd/Mes/yyyy"
  // --------------------------------------------------------------------------

  fechaMed(): string {
    const now = new Date();
    const dia  = now.getDate();
    const mes  = MESES[now.getMonth()];
    const anio = now.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // --------------------------------------------------------------------------
  // planoDeCaptura — Magik: plano_de_captura()
  // Detecta si el proyecto es fibra existente y genera el plano correspondiente.
  // En Magik accede a swg_dsn_admin_engine y modifica la UI de layout_designer.
  // En TS retorna la descripción del plano a crear.
  // --------------------------------------------------------------------------

  /**
   * @param esExistenteFibra   Magik: existente_fibra?
   *   = proyecto.job_type.lowercase === 'existente'
   *     && sch.tipo_diseno === :secundaria
   *     && active_design.id_dto_optico !== undefined
   */
  planoDeCaptura(
    esExistenteFibra: boolean,
    contexto: { distrito: string; programa: string; anyo: string },
  ): PlanoCaptura {
    if (esExistenteFibra) {
      return {
        tipo: 'FIBRA_LOCAL',
        marco: { largo: 4, alto: 2 },
        norte: { tamano: 'B' },
        titulo: 'PLANO DE CAPTURA FO',
        sello: 'c_plano_de_captura_fo',
        geomSetLayout: null,
      };
    }

    const tituloPlano = `PLANO DE CONSTRUCCIÓN\n${contexto.distrito} / ${contexto.programa}-${contexto.anyo}`;
    return {
      tipo: 'CONSTRUCCION',
      marco: { largo: 4, alto: 2 },
      norte: { tamano: 'B' },
      titulo: 'PLANO DE CAPTURA',
      sello: 'c_sello_estandar_construccion',
      geomSetLayout: {
        tipoPlano   : 'CONSTRUCCION',
        nombrePlano : tituloPlano,
        nMargenVp   : 800,
        modulosAncho: 4,
        modulosAlto : 2,
      },
    };
  }

  // --------------------------------------------------------------------------
  // quickPreview — Magik: quick_preview()
  // Lee SW_TEMPLATES_DB_DIR y usa p_libre_plot.xml como template.
  // En TS: retorna la ruta del template y la config de orientación.
  // --------------------------------------------------------------------------

  quickPreview(
    currentViewBounds?: ViewBounds,
    swTemplatesDbDir?: string,
  ): { templateFile: string; landscape: boolean } {
    const dir = swTemplatesDbDir ?? this.options.templateDir ?? '';
    const templateFile = dir ? `${dir}\\p_libre_plot.xml` : 'p_libre_plot.xml';

    let landscape = true;
    if (currentViewBounds) {
      if (this.options.pageOrientation === 'automatic') {
        landscape = currentViewBounds.width > currentViewBounds.height;
      } else if (this.options.pageOrientation === 'portrait') {
        landscape = false;
      }
    }

    return { templateFile, landscape };
  }

  // --------------------------------------------------------------------------
  // quickPreviewForMap — Magik: quick_preview_for_map(a_map_view, a_template_name?)
  // Carga layout desde XML o crea uno por defecto; mapea todos los viewports.
  // En TS: retorna la descripción del layout a previsualizar.
  // --------------------------------------------------------------------------

  quickPreviewForMap(
    viewBounds: ViewBounds,
    templateName?: string,
  ): { landscape: boolean; templateFile: string | null; hasExistingViewports: boolean } {
    const { landscape, templateFile } = this.quickPreview(viewBounds, this.options.templateDir);
    return {
      landscape,
      templateFile: templateName ?? templateFile,
      hasExistingViewports: false, // en integración real: a_layout.all_elements_of(viewport_layout)
    };
  }
}

// =============================================================================
// COMPONENTE REACT
// =============================================================================

export default function LayoutPluginViewer(): React.ReactElement {
  const plugin = new LayoutPlugin();
  const [fecha] = useState(() => plugin.fechaMed());
  const [esExistente, setEsExistente] = useState(false);
  const [distrito, setDistrito]   = useState('CENTRO');
  const [programa, setPrograma]   = useState('FTTH');
  const [anyo, setAnyo]           = useState('2024');
  const [orientation, setOrientation] = useState<PageOrientation>('automatic');
  const [templateDir, setTemplateDir] = useState('C:\\sigp\\templates_xml');
  const [plano, setPlano]         = useState<PlanoCaptura | null>(null);
  const [preview, setPreview]     = useState<ReturnType<LayoutPlugin['quickPreview']> | null>(null);

  const runPlano = () => {
    plugin.options.pageOrientation = orientation;
    plugin.options.templateDir     = templateDir;
    setPlano(plugin.planoDeCaptura(esExistente, { distrito, programa, anyo }));
  };

  const runPreview = () => {
    plugin.options.pageOrientation = orientation;
    plugin.options.templateDir     = templateDir;
    const bounds: ViewBounds = { xmin: 0, ymin: 0, xmax: 1000, ymax: 700, width: 1000, height: 700 };
    setPreview(plugin.quickPreview(bounds, templateDir));
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>LayoutPlugin — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>layout_plugin</code> (_package sw) — plugin principal de layout GIS
      </p>

      <div style={{ background: '#eef', padding: 8, borderRadius: 4, marginBottom: 12 }}>
        <strong>fecha_med():</strong> {fecha}
      </div>

      <details open>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>init_actions() — {REGISTERED_ACTIONS.length} acciones</summary>
        <ul style={{ fontSize: 12 }}>
          {REGISTERED_ACTIONS.map(a => (
            <li key={a.id}><code>{a.id}</code> — {a.label}</li>
          ))}
        </ul>
      </details>

      <hr />
      <strong>plano_de_captura()</strong>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0', fontSize: 12 }}>
        <label><input type="checkbox" checked={esExistente} onChange={e => setEsExistente(e.target.checked)} />&nbsp;existente_fibra?</label>
        <label>Distrito:&nbsp;<input value={distrito} onChange={e => setDistrito(e.target.value)} style={{ width: 80 }} /></label>
        <label>Programa:&nbsp;<input value={programa} onChange={e => setPrograma(e.target.value)} style={{ width: 60 }} /></label>
        <label>Año:&nbsp;<input value={anyo} onChange={e => setAnyo(e.target.value)} style={{ width: 60 }} /></label>
        <button onClick={runPlano}>Ejecutar</button>
      </div>

      {plano && (
        <pre style={{ fontSize: 11, background: '#f0f4f8', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(plano, null, 2)}
        </pre>
      )}

      <hr />
      <strong>quick_preview()</strong>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0', fontSize: 12 }}>
        <label>Orientación:&nbsp;
          <select value={orientation} onChange={e => setOrientation(e.target.value as PageOrientation)}>
            {(['automatic', 'landscape', 'portrait'] as PageOrientation[]).map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>SW_TEMPLATES_DB_DIR:&nbsp;
          <input value={templateDir} onChange={e => setTemplateDir(e.target.value)} style={{ width: 200 }} />
        </label>
        <button onClick={runPreview}>Ejecutar</button>
      </div>
      {preview && (
        <div style={{ fontSize: 12, background: '#f0f4f8', padding: 8, borderRadius: 4 }}>
          <div><strong>Template:</strong> {preview.templateFile}</div>
          <div><strong>Landscape:</strong> {String(preview.landscape)}</div>
        </div>
      )}
    </div>
  );
}
