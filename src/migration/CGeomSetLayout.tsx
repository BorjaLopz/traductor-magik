/**
 * Migración: c_geom_set_layout.magik
 * Clase Magik: c_geom_set_layout
 * Hereda de: layout_element, viewport_layout_mixin
 *
 * Elemento de layout que inicializa una página completa de plano GIS según el
 * tipo (DISTRITOS/ASHURADO/CANALIZACION/ITINERARIO/RUTA_CABLES/
 * Plano_desmontaje_CD/CONSTRUCCION/BAJANTES/ESTUDIO_CONJUNTO).
 * Agrega marco, viewport, norte y sello correspondiente a cada tipo de plano.
 *
 * Métodos migrados:
 *   defined_attributes()          → DEFINED_ATTRIBUTES
 *   initialise_for_page(page)     → initializeForPage(config)
 *   agrega_nombre_plano(marco)    → agregaNombrePlano(tipoPlano, nombrePlano)
 *   dibuja_linea_entre_pozos()    → dibujaLineaEntrePozos(p1, p2, kmLabel)
 *   pon_indicadores(…)            → ponIndicadores(records, viewport)
 *   draw_content_on(window)       → drawContentOn() (delega a super)
 *   depends_on?(another)          → dependsOn()
 *   update_references(table)      → updateReferences()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type TipoPlano =
  | 'DISTRITOS'
  | 'ASHURADO'
  | 'CANALIZACION'
  | 'ITINERARIO'
  | 'RUTA_CABLES'
  | 'Plano_desmontaje_CD'
  | 'Physical NI User'
  | 'CONSTRUCCION'
  | 'BAJANTES'
  | 'ESTUDIO_CONJUNTO'
  | string;

export interface Bounds { xmin: number; ymin: number; xmax: number; ymax: number; }

export interface LayoutPageElement {
  type: string;
  bounds: Bounds;
  props: Record<string, unknown>;
}

/** Resultado de initializeForPage — describe los elementos a crear en la página */
export interface PageLayout {
  tipoPlano: TipoPlano;
  nombrePlano: string;
  marco: { modulosAncho: number; modulosAlto: number };
  viewport: { bounds: Bounds; aceNamed: string; displayStyle: string; styleCategory: string };
  norte: { tamano: 'A' | 'B'; visible: boolean };
  sello: { tipo: string; bounds: Bounds } | null;
  extra: LayoutPageElement[];
  tipoPlanoCatalog: string;
}

export interface IndicadorPozo {
  id: string;
  numPozo: string | number;
  modeloPozo: string;
  constructionStatus: 'PROYECTADO' | 'EXISTENTE';
  coordX: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const DEFINED_ATTRIBUTES = [
  { nombre: 'nIdRegistro',   tipo: 'integer', description: 'Identificador del Objeto',         default: 0,    enPropiedades: false },
  { nombre: 'sIdRegistro',   tipo: 'string',  description: 'Identificadores de objetos',        default: '0',  enPropiedades: false },
  { nombre: 'sNombreAce',    tipo: 'string',  description: 'Nombre del Ace',                   default: '0',  enPropiedades: false },
  { nombre: 'sNombrePlano',  tipo: 'string',  description: 'Nombre del Plano',                 default: '0',  enPropiedades: false },
  { nombre: 'nMargenVp',     tipo: 'integer', description: 'Margen del Viewport',              default: 0,    enPropiedades: false },
  { nombre: 'modulos_ancho', tipo: 'integer', description: 'Modulos Ancho',                    default: 1,    enPropiedades: false },
  { nombre: 'modulos_alto',  tipo: 'string',  description: 'Modulos Alto',                     default: '1',  enPropiedades: false },
  { nombre: 'bIndicadores',  tipo: 'boolean', description: 'Indicadores de pozo',              default: false,enPropiedades: false },
  { nombre: 'bInventaDto',   tipo: 'boolean', description: 'Inventario distrito',              default: false,enPropiedades: false },
  { nombre: 'sIdProyecto',   tipo: 'string',  description: 'Identificador del proyecto.',      default: false,enPropiedades: false },
  { nombre: 'sTipoPlano',    tipo: 'string',  description: 'Tipo de Plano',                   default: '',   enPropiedades: true  },
] as const;

// Mapeo de sTipoPlano → tipo_plano catalog string
const TIPO_PLANO_CATALOG: Record<TipoPlano, string> = {
  'DISTRITOS':           'division_distritos',
  'ASHURADO':            'ashurado',
  'CANALIZACION':        'inventario_canalizacion',
  'ITINERARIO':          '',
  'RUTA_CABLES':         'ruta_cables',
  'Plano_desmontaje_CD': '',
  'Physical NI User':    '',
  'CONSTRUCCION':        'construccion',
  'BAJANTES':            'bajantes',
  'ESTUDIO_CONJUNTO':    'estudio_conjunto',
};

// Mapeo de tipo → sello
const TIPO_SELLO: Record<TipoPlano, string> = {
  'DISTRITOS':           'c_sello_estandar_ctl_edo',
  'ASHURADO':            'c_sello_estandar_ctl_edo',
  'CANALIZACION':        'c_sello_estandar_ctl_edo',
  'ITINERARIO':          'c_sello_estandar_ctl_edo',
  'RUTA_CABLES':         'c_sello_estandar_ctl_edo',
  'Plano_desmontaje_CD': 'c_sello_proyecto_canalizacion',
  'Physical NI User':    'c_sello_estandar_ctl_edo',
  'CONSTRUCCION':        'c_sello_estandar_construccion',
  'BAJANTES':            'c_sello_estandar_ctl_edo',
  'ESTUDIO_CONJUNTO':    'c_sello_estandar_ctl_edo',
};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export interface ICGeomSetLayout {
  oApp               : unknown | null;
  oAppLayoutDesigner : unknown | null;
  oRegistro          : unknown | null;
  nIdRegistro        : number;
  sIdRegistro        : string;
  sNombreAce         : string;
  sNombrePlano       : string;
  nMargenVp          : number;
  modulosAncho       : number;
  modulosAlto        : number;
  bIndicadores       : boolean;
  bInventaDto        : boolean;
  sIdProyecto        : string;
  sTipoPlano         : TipoPlano;
}

export class CGeomSetLayout implements ICGeomSetLayout {

  static readonly ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false;
  static readonly ALLOWED_ON_MENU = false;

  oApp               : unknown | null = null;
  oAppLayoutDesigner : unknown | null = null;
  oRegistro          : unknown | null = null;

  nIdRegistro  : number    = 0;
  sIdRegistro  : string    = '';
  sNombreAce   : string    = '';
  sNombrePlano : string    = '';
  nMargenVp    : number    = 0;
  modulosAncho : number    = 1;
  modulosAlto  : number    = 1;
  bIndicadores : boolean   = false;
  bInventaDto  : boolean   = false;
  sIdProyecto  : string    = 'RBS-123';
  sTipoPlano   : TipoPlano = '';

  /** Magik: depends_on?(another) → delega a viewport_layout_mixin */
  dependsOn(_another: unknown): boolean { return false; }

  /** Magik: update_references(reference_table) → delega a super */
  updateReferences(_referenceTable: Map<unknown, unknown>): void { /* super */ }

  /**
   * Magik: agrega_nombre_plano(LoMarco)
   * Retorna la config del título según tipo de plano.
   */
  agregaNombrePlano(pageBounds: Bounds): {
    tipo: 'c_titulo_de_plano' | 'textbox_layout';
    texto: string;
    angulo: number;
    bounds: Bounds;
  } {
    if (this.sTipoPlano === 'Plano_desmontaje_CD') {
      return {
        tipo: 'textbox_layout',
        texto: this.sNombrePlano,
        angulo: 90,
        bounds: { xmin: 100, ymin: 300, xmax: 600, ymax: 400 },
      };
    }
    const w = this.sTipoPlano === 'PLANO_DE_RUTA' ? 2000 : 3000;
    return {
      tipo: 'c_titulo_de_plano',
      texto: this.sNombrePlano,
      angulo: 0,
      bounds: { xmin: pageBounds.xmin + 50, ymin: pageBounds.ymin + 50, xmax: pageBounds.xmax, ymax: pageBounds.ymax },
    };
    void w;
  }

  /**
   * Magik: dibuja_linea_entre_pozos()
   * Calcula la línea entre dos indicadores de pozo seleccionados.
   * El label es la diferencia absoluta de km topográfico.
   */
  dibujaLineaEntrePozos(
    p1: { centre: { x: number; y: number }; kmTopo: number },
    p2: { centre: { x: number; y: number }; kmTopo: number },
  ): { coords: [{ x: number; y: number }, { x: number; y: number }]; label: string } | null {
    // Ordenar por X (o por Y si X iguales)
    let c1 = p1.centre, c2 = p2.centre;
    if (Math.round(c1.x) === Math.round(c2.x)) {
      if (c1.y < c2.y) [c1, c2] = [c2, c1];
    }
    const label = Math.abs(p1.kmTopo - p2.kmTopo).toFixed(3);
    return { coords: [c1, c2], label };
  }

  /**
   * Magik: pon_indicadores(PoAreaDibujo, PoRec1, …)
   * Ubica indicadores de pozo espacialmente dentro del viewport,
   * ordenados por coordenada X, separados equidistantemente.
   */
  ponIndicadores(
    records: IndicadorPozo[],
    viewportBounds: Bounds,
  ): Array<{ x: number; y: number; numPozo: string | number; status: string; figTipo: 'fig_dos_b' }> {
    const sorted = [...records].sort((a, b) => a.coordX - b.coordX);
    const width = viewportBounds.xmax - viewportBounds.xmin;
    const step = sorted.length > 0 ? width / sorted.length : 0;
    return sorted.map((rec, i) => ({
      x: viewportBounds.xmin + step * i + step / 2,
      y: viewportBounds.ymin + 600,
      numPozo: rec.numPozo,
      status: rec.constructionStatus,
      figTipo: 'fig_dos_b' as const,
    }));
  }

  /**
   * Magik: initialise_for_page(a_layout_page)
   * Construye la descripción de la página según sTipoPlano.
   * En Magik: accede a .oApp, viewport_mapper, swg_dsn_admin_engine.
   * En TS: retorna un objeto PageLayout para renderizado React.
   */
  initializeForPage(pageBounds: Bounds): PageLayout {
    const tipo = this.sTipoPlano;
    const norteTamano: 'A' | 'B' =
      ['CONSTRUCCION', 'BAJANTES', 'Physical NI User'].includes(tipo) ? 'B' : 'A';
    const norteVisible = tipo !== 'Plano_desmontaje_CD';

    const vpBounds: Bounds = {
      xmin: pageBounds.xmin + this.nMargenVp - 100,
      ymin: pageBounds.ymin + this.nMargenVp - 300,
      xmax: pageBounds.xmax - this.nMargenVp + 400,
      ymax: pageBounds.ymax - this.nMargenVp + 300,
    };

    const styleCategories: Record<TipoPlano, string> = {
      'DISTRITOS':           'plano',
      'ASHURADO':            'plano',
      'CANALIZACION':        'plano',
      'ITINERARIO':          'plano',
      'RUTA_CABLES':         'plano',
      'Plano_desmontaje_CD': 'Plano_desmo_cd',
      'Physical NI User':    '',
      'CONSTRUCCION':        'P Construccion FTTH',
      'BAJANTES':            'plano_dtos',
      'ESTUDIO_CONJUNTO':    'Estudio_Conjunto',
    };

    const selloType = TIPO_SELLO[tipo] ?? 'c_sello_estandar_ctl_edo';
    const sello: PageLayout['sello'] = {
      tipo: selloType,
      bounds: {
        xmin: pageBounds.xmin + 50,
        ymin: pageBounds.ymin + 50,
        xmax: pageBounds.xmin + 50 + 2950,
        ymax: pageBounds.ymin + 50 + 2740,
      },
    };

    // Extra elements por tipo (leyenda, tabla de equivalencias, c_pep…)
    const extra: LayoutPageElement[] = [];
    if (['CANALIZACION', 'ESTUDIO_CONJUNTO'].includes(tipo)) {
      extra.push({
        type: 'c_legend_layout_sigc',
        bounds: { xmin: pageBounds.xmin + 300, ymin: pageBounds.ymin + 300, xmax: pageBounds.xmin + 1300, ymax: pageBounds.ymin + 1300 },
        props: {},
      });
    }
    if (tipo === 'CANALIZACION') {
      extra.push({
        type: 'c_sello_capacidad_cable',
        bounds: { xmin: pageBounds.xmin + 300, ymin: pageBounds.ymin + 2800, xmax: pageBounds.xmin + 1300, ymax: pageBounds.ymin + 1300 },
        props: {},
      });
    }
    if (tipo === 'RUTA_CABLES') {
      extra.push({ type: 'c_pep', bounds: { xmin: 450, ymin: 500, xmax: 450 + 880, ymax: 500 + 910 }, props: {} });
    }
    if (tipo === 'ASHURADO') {
      extra.push({ type: 'symbol_layout', bounds: { xmin: pageBounds.xmin + 300, ymin: pageBounds.ymin + 300, xmax: pageBounds.xmax - 11000, ymax: pageBounds.ymax - 7700 }, props: { name: 'leyenda_ashurado' } });
    }

    return {
      tipoPlano: tipo,
      nombrePlano: this.sNombrePlano,
      marco: { modulosAncho: this.modulosAncho, modulosAlto: this.modulosAlto },
      viewport: {
        bounds: tipo === 'Plano_desmontaje_CD'
          ? { xmin: 2540, ymin: 270, xmax: pageBounds.xmax - 270, ymax: pageBounds.ymax - 270 }
          : vpBounds,
        aceNamed: this.sNombreAce || 'CENTRALES',
        displayStyle: tipo === 'CONSTRUCCION' ? '1 750 - 2 000' : '20 000 - 50 000',
        styleCategory: styleCategories[tipo] ?? 'plano',
      },
      norte: { tamano: norteTamano, visible: norteVisible },
      sello,
      extra,
      tipoPlanoCatalog: TIPO_PLANO_CATALOG[tipo] ?? '',
    };
  }

  /** Magik: draw_content_on(window) — llama a super; body 99% comentado en Magik */
  drawContentOn(): void { /* super */ }
}

// =============================================================================
// COMPONENTE REACT
// =============================================================================

const TIPO_PLANO_OPTIONS: TipoPlano[] = [
  'DISTRITOS', 'ASHURADO', 'CANALIZACION', 'ITINERARIO', 'RUTA_CABLES',
  'Plano_desmontaje_CD', 'Physical NI User', 'CONSTRUCCION', 'BAJANTES', 'ESTUDIO_CONJUNTO',
];

const PAGE: Bounds = { xmin: 0, ymin: 0, xmax: 29700, ymax: 21000 }; // A3 en décimas de mm

export default function CGeomSetLayoutViewer(): React.ReactElement {
  const [tipoPlano, setTipoPlano] = useState<TipoPlano>('DISTRITOS');
  const [nombrePlano, setNombrePlano] = useState('PLANO DEMO');
  const [nMargen, setNMargen] = useState(500);
  const [result, setResult] = useState<PageLayout | null>(null);

  const run = () => {
    const inst = new CGeomSetLayout();
    inst.sTipoPlano  = tipoPlano;
    inst.sNombrePlano = nombrePlano;
    inst.nMargenVp   = nMargen;
    setResult(inst.initializeForPage(PAGE));
  };

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CGeomSetLayout — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_geom_set_layout</code> — hereda layout_element + viewport_layout_mixin
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>Tipo plano:&nbsp;
          <select value={tipoPlano} onChange={e => setTipoPlano(e.target.value as TipoPlano)}>
            {TIPO_PLANO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Nombre plano:&nbsp;
          <input value={nombrePlano} onChange={e => setNombrePlano(e.target.value)} style={{ width: 160 }} />
        </label>
        <label>Margen VP:&nbsp;
          <input type="number" value={nMargen} onChange={e => setNMargen(Number(e.target.value))} style={{ width: 80 }} />
        </label>
        <button onClick={run}>initializeForPage()</button>
      </div>

      {result && (
        <div style={{ background: '#f0f4f8', padding: 10, borderRadius: 4, fontSize: 12 }}>
          <div><strong>Tipo:</strong> {result.tipoPlano} → catalog: <em>{result.tipoPlanoCatalog || '(none)'}</em></div>
          <div><strong>Marco:</strong> {result.marco.modulosAncho}×{result.marco.modulosAlto}</div>
          <div><strong>Viewport:</strong> ace={result.viewport.aceNamed} | style={result.viewport.displayStyle} | cat={result.viewport.styleCategory}</div>
          <div><strong>Norte:</strong> tamano={result.norte.tamano} | visible={String(result.norte.visible)}</div>
          <div><strong>Sello:</strong> {result.sello?.tipo ?? '(none)'}</div>
          {result.extra.length > 0 && (
            <div><strong>Extra:</strong> {result.extra.map(e => e.type).join(', ')}</div>
          )}
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>defined_attributes() — {DEFINED_ATTRIBUTES.length}</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
          {DEFINED_ATTRIBUTES.map(a => `${a.nombre} (${a.tipo}) = ${a.default}`).join('\n')}
        </pre>
      </details>
    </div>
  );
}
