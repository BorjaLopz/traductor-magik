// =============================================================================
// MIGRACIÓN: c_plano_detalles_acometida  →  CPlanoDetallesAcometida.tsx
// Jerarquía Magik: c_factory_detalles → c_factory_planos
// Fuente: planos_fo/source/detalles_construccion/factory/c_plano_detalles_acometida.magik
// =============================================================================
//
// Factory de planos de detalles de acometida FTTH.
// Genera una página de layout con múltiples viewports GIS, sellos,
// diagramas, y elementos de planimetría (norte, isométrico, etc).
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos GIS (Fase 5 — stubs de Smallworld primitives)
// ---------------------------------------------------------------------------

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

export function bb(xmin: number, ymin: number, xmax: number, ymax: number): BoundingBox {
  return { xmin, ymin, xmax, ymax };
}

export interface Page {
  bounds: BoundingBox;
  elements: unknown[];
  addElement(el: unknown): void;
}

export interface EngineRoute {
  getRutas(): unknown[];
  getCWDM(): unknown;
  getRmeInicio(): unknown;
}

export interface LinkData {
  oenlace?: {
    'user!_cliente'?: {
      'user!_building'?: unknown;
    };
  };
}

export interface ClientData {
  usuario: string;
  colonia: string;
  codigo_postal: string;
  municipio: string;
  central: string;
  direccion_user: string;
}

// ---------------------------------------------------------------------------
// Clase base: c_factory_detalles
// ---------------------------------------------------------------------------

export class CFactoryDetalles {
  protected _oEngine: EngineRoute | null = null;
  protected _oCable: unknown = null;
  protected _oPafManager: unknown = null;
  protected _oPage: Page | null = null;
  protected _oViewMapperPlugin: unknown = null;

  constructor(oEngine?: EngineRoute) {
    if (oEngine) {
      this._oEngine = oEngine;
    }
  }

  get oEngine(): EngineRoute | null { return this._oEngine; }
  get oPage(): Page | null { return this._oPage; }
  get oPafManager(): unknown { return this._oPafManager; }
  get oViewMapperPlugin(): unknown { return this._oViewMapperPlugin; }
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export interface PlanoDetallesAcometidaRecord {
  cable: string;
  enlaceId: string;
  cliente: string;
  central: string;
}

export class CPlanoDetallesAcometida extends CFactoryDetalles {
  // ── genera_plano(PoCable, PoEmpalmes) ──────────────────────────────────
  generaPlano(cable: unknown, _empalmes?: unknown[]): void {
    this._oCable = cable;
    this.addSellosDetalles();
  }

  // ── AddSellosDetalles() ────────────────────────────────────────────────
  addSellosDetalles(): void {
    this.addEstudioTransmision();
    this.addIsometricoDestino();
    this.addConexionEmpalme();
    this.addRutaDeCables();
    this.addNorte();
  }

  // ── AddEstudioTransmision() ────────────────────────────────────────────
  addEstudioTransmision(): PageElement[] {
    const elements: PageElement[] = [];
    const ruta = this._mockRoute();
    if (!ruta) return elements;

    elements.push({
      id: 'estudio-transmision-1',
      type: 'sello',
      label: 'Estudio Transmisión 1',
      bounds: bb(3950, 5100, 5600, 5900),
      color: '#89b4fa',
    });
    elements.push({
      id: 'estudio-transmision-2',
      type: 'sello',
      label: 'Estudio Transmisión 2',
      bounds: bb(5250, 4650, 7100, 5325),
      color: '#89b4fa',
    });
    elements.push({
      id: 'estudio-transmision-3',
      type: 'sello',
      label: 'Estudio Transmisión 3',
      bounds: bb(3950, 4400, 5600, 5400),
      color: '#89b4fa',
    });
    return elements;
  }

  // ── add_placas_identificacion_cable() ──────────────────────────────────
  addPlacasIdentificacionCable(): PageElement[] {
    return [{
      id: 'placa-1',
      type: 'sello',
      label: 'Placa Identificación Cable',
      bounds: bb(3955, 3488, 5455, 3988),
      color: '#f9e2af',
    }];
  }

  // ── AddIsometricoDestino() ─────────────────────────────────────────────
  addIsometricoDestino(): PageElement {
    return {
      id: 'isometrico-destino',
      type: 'viewport',
      label: 'Vista Isométrica Cliente Destino',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#cba6f7',
    };
  }

  // ── AddVistaPerfilDestino() ────────────────────────────────────────────
  addVistaPerfilDestino(): PageElement {
    return {
      id: 'vista-perfil-destino',
      type: 'viewport',
      label: 'Vista Frontal Cliente Destino',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#f5c2e7',
    };
  }

  // ── AddBackRmeBayDestino() ─────────────────────────────────────────────
  addBackRmeBayDestino(): PageElement {
    return {
      id: 'back-rme-destino',
      type: 'viewport',
      label: 'Detalle Bastidor - Vista Posterior',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#fab387',
    };
  }

  // ── AddRmeBayDestino() ─────────────────────────────────────────────────
  addRmeBayDestino(): PageElement {
    return {
      id: 'rme-bay-destino',
      type: 'viewport',
      label: 'Detalle Bastidor - Vista Frontal',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#fab387',
    };
  }

  // ── AddSalaTxDestino() ─────────────────────────────────────────────────
  addSalaTxDestino(): PageElement {
    return {
      id: 'sala-tx-destino',
      type: 'viewport',
      label: 'Vista Sala Transmisión Destino',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#94e2d5',
    };
  }

  // ── AddBackRmeBayGeneral() ─────────────────────────────────────────────
  addBackRmeBayGeneral(): PageElement {
    return {
      id: 'back-rme-general',
      type: 'viewport',
      label: 'Vista Posterior Bastidor General',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#fab387',
    };
  }

  // ── AddCWDMConnectionDiagram() ─────────────────────────────────────────
  addCWDMConnectionDiagram(): PageElement {
    return {
      id: 'cwdm-diagram',
      type: 'viewport',
      label: 'Detalle de CWDM - Conexiones',
      bounds: bb(13108, 6317, 15108, 8317),
      color: '#89dceb',
    };
  }

  // ── AddConexionEmpalme() ───────────────────────────────────────────────
  addConexionEmpalme(): PageElement {
    return {
      id: 'conexion-empalme',
      type: 'viewport',
      label: 'Diagrama de Conexiones Empalme',
      bounds: bb(11911, 2645, 14933, 5629),
      color: '#74c7ec',
    };
  }

  // ── AddEsquematico() ───────────────────────────────────────────────────
  addEsquematico(): PageElement {
    return {
      id: 'esquematico',
      type: 'viewport',
      label: 'Diagrama Esquemático de Empalmes',
      bounds: bb(9586, 3294, 15077, 8403),
      color: '#a6e3a1',
    };
  }

  // ── AddRutaDeCables() ──────────────────────────────────────────────────
  addRutaDeCables(): PageElement {
    return {
      id: 'ruta-cables',
      type: 'viewport',
      label: 'Ruta de Cables FO',
      bounds: bb(2674, 3284, 9443, 8393),
      color: '#89b4fa',
    };
  }

  // ── AddNorte() ─────────────────────────────────────────────────────────
  addNorte(): PageElement {
    return {
      id: 'norte',
      type: 'north',
      label: 'Norte',
      bounds: bb(2138, 7311, 2198, 8271),
      color: '#f38ba8',
    };
  }

  // ── crea_titulo() ──────────────────────────────────────────────────────
  creaTitulo(data: {
    programa?: string;
    cliente?: string;
    refSisa?: string;
    cable?: string;
    central?: string;
    ctlSiglas?: string;
  }): string {
    const now = new Date();
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    const fecha = `${mes}/${anio}`;

    return [
      `PROGRAMA ${(data.programa ?? '—').toUpperCase()}`,
      `CLIENTE ${data.cliente ?? '—'}`,
      `REFERENCIA SISA: ${data.refSisa ?? '—'}`,
      'PLANO RUTA DE CABLES',
      `${data.cable ?? '—'}`,
      `CTL - ${data.central ?? '—'} (${data.ctlSiglas ?? '—'})`,
      fecha,
    ].join('\n');
  }

  // ── obtener_ruta_acometida() ───────────────────────────────────────────
  obtenerRutaAcometida(_building: unknown): unknown {
    return null; // stub — sin backend GIS
  }

  // ── Mock helpers ───────────────────────────────────────────────────────
  private _mockRoute(): unknown {
    return { id: 'ruta-acometida-mock' };
  }
}

// =============================================================================
// Tipos para el UI del layout
// =============================================================================

export interface PageElement {
  id: string;
  type: 'sello' | 'viewport' | 'north' | 'title';
  label: string;
  bounds: BoundingBox;
  color: string;
  children?: PageElement[];
}

// =============================================================================
// Mock layout — página de plano 1:1
// =============================================================================

const PAGE_W = 16000;
const PAGE_H = 10000;

function buildMockLayout(): PageElement[] {
  const factory = new CPlanoDetallesAcometida();
  return [
    { id: 'titulo', type: 'title', label: 'PLANO DETALLES ACOMETIDA', bounds: bb(200, 200, 3800, 800), color: '#cba6f7' },
    ...factory.addEstudioTransmision(),
    { id: 'resumen-proyecto', type: 'sello', label: 'Resumen Proyecto Acometida', bounds: bb(630, 3101, 1990, 4541), color: '#f9e2af' },
    { id: 'sello-fo-acometida', type: 'sello', label: 'Sello FO Acometida', bounds: bb(429, 429, 2529, 2429), color: '#a6e3a1' },
    { id: 'sello-estandar-base', type: 'sello', label: 'Sello Estándar Base FO', bounds: bb(267, 279, 3837, 3019), color: '#89dceb' },
    { id: 'secuencia-trabajo', type: 'sello', label: 'Secuencia de Trabajo', bounds: bb(462, 4771, 2532, 6351), color: '#74c7ec' },
    { id: 'notas-constructor', type: 'sello', label: 'Notas Constructor', bounds: bb(3474, 2362, 5274, 2952), color: '#94e2d5' },
    { id: 'simbolo-acometida', type: 'sello', label: 'Simb. Acometida Cliente', bounds: bb(450, 6517, 2053, 8342), color: '#f5c2e7' },
    { id: 'simbolo-soportes', type: 'sello', label: 'Det. Soportes Pozo', bounds: bb(5496, 626, 7507, 1875), color: '#f5c2e7' },
    { id: 'simbolo-empalme', type: 'sello', label: 'Det. Colocación Empalme', bounds: bb(3495, 831, 4733, 1885), color: '#f5c2e7' },
    { id: 'simbolo-charola', type: 'sello', label: 'Det. Charola', bounds: bb(7914, 878, 9152, 1932), color: '#f5c2e7' },
    { id: 'simbolo-ocupacion', type: 'sello', label: 'Ocupación Ductos', bounds: bb(5589, 2359, 6496, 3107), color: '#f5c2e7' },
    { id: 'roseta', type: 'sello', label: 'Roseta 4 Puertos', bounds: bb(11227, 896, 12465, 1950), color: '#f5c2e7' },
    { id: 'montaje-cables', type: 'sello', label: 'Montaje Cables FO', bounds: bb(9229, 1349, 9938, 1933), color: '#f5c2e7' },
    { id: 'tapa-subd', type: 'sello', label: 'Tapa SUBD', bounds: bb(10040, 1371, 10621, 1931), color: '#f5c2e7' },
    { id: 'tapon-av-flex', type: 'sello', label: 'Tapón AV Flex', bounds: bb(9221, 799, 9918, 1319), color: '#f5c2e7' },
    factory.addNorte(),
    factory.addIsometricoDestino(),
    factory.addConexionEmpalme(),
    factory.addEsquematico(),
    factory.addRutaDeCables(),
    ...factory.addPlacasIdentificacionCable(),
  ];
}

// =============================================================================
// Componente React — CPlanoDetallesAcometidaUI
// =============================================================================

const SX = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: {
    color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1,
  } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '200px 1fr', gap: 4,
    fontSize: 11, padding: '2px 0',
  } as React.CSSProperties,
  k: { color: '#89dceb' } as React.CSSProperties,
  v: { color: '#a6e3a1' } as React.CSSProperties,
  vMuted: { color: '#fab387' } as React.CSSProperties,
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  btn: {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
};

export function CPlanoDetallesAcometidaUI() {
  const [elements] = useState<PageElement[]>(() => buildMockLayout());
  const [highlight, setHighlight] = useState<string | null>(null);
  const [visible, setVisible] = useState<Set<string>>(() => new Set(elements.map(e => e.id)));

  const toggleVisible = useCallback((id: string) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const scale = 0.055;

  const toScreen = useCallback((b: BoundingBox) => ({
    left:   b.xmin * scale,
    top:    (PAGE_H - b.ymax) * scale,
    width:  (b.xmax - b.xmin) * scale,
    height: (b.ymax - b.ymin) * scale,
  }), []);

  const grouped = useMemo(() => {
    const sellos = elements.filter(e => e.type === 'sello');
    const viewports = elements.filter(e => e.type === 'viewport');
    const north = elements.filter(e => e.type === 'north');
    const titles = elements.filter(e => e.type === 'title');
    return { sellos, viewports, north, titles };
  }, [elements]);

  return (
    <div style={SX.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CPlanoDetallesAcometida</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          factory planos detalles acometida · Fase 5 — GIS Layout
        </span>
      </div>

      {/* Info de la clase */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Jerarquía (Magik)</div>
          <div style={{ fontSize: 11, lineHeight: '1.6' }}>
            <span style={SX.v}>c_plano_detalles_acometida</span>
            <span style={{ color: '#585b70' }}> → </span>
            <span style={SX.k}>c_factory_detalles</span>
            <span style={{ color: '#585b70' }}> → </span>
            <span style={SX.k}>c_factory_planos</span>
          </div>
        </div>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Elementos en página</div>
          <div style={SX.row}><span style={SX.k}>Sellos</span><span style={SX.v}>{grouped.sellos.length}</span></div>
          <div style={SX.row}><span style={SX.k}>Viewports</span><span style={SX.v}>{grouped.viewports.length}</span></div>
          <div style={SX.row}><span style={SX.k}>Norte</span><span style={SX.v}>{grouped.north.length}</span></div>
          <div style={SX.row}><span style={SX.k}>Total</span><span style={SX.vMuted}>{elements.length}</span></div>
        </div>
      </div>

      {/* Leyenda + controles */}
      <div style={SX.card}>
        <div style={SX.title}>Leyenda — tipos de elemento</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
          {[
            { label: 'Sello', color: '#f5c2e7' },
            { label: 'Viewport', color: '#89b4fa' },
            { label: 'Norte', color: '#f38ba8' },
            { label: 'Título', color: '#cba6f7' },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, background: t.color, borderRadius: 2 }} />
              <span style={{ color: '#bac2de' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plano — vista 1:1 simulada */}
      <div style={SX.card}>
        <div style={SX.title}>Layout del plano — genera_plano() + AddSellosDetalles()</div>
        <div style={{
          position: 'relative', width: PAGE_W * scale, height: PAGE_H * scale,
          background: '#11111b', border: '2px solid #45475a', borderRadius: 4,
          overflow: 'hidden', margin: '0 auto',
        }}>
          {elements.filter(e => visible.has(e.id)).map(el => {
            const pos = toScreen(el.bounds);
            const isHighlighted = highlight === el.id;
            return (
              <div
                key={el.id}
                title={`${el.label}\n[${el.type}] ${el.bounds.xmin},${el.bounds.ymin} → ${el.bounds.xmax},${el.bounds.ymax}`}
                style={{
                  position: 'absolute',
                  left: pos.left, top: pos.top,
                  width: pos.width, height: pos.height,
                  background: el.color,
                  opacity: isHighlighted ? 0.9 : 0.35,
                  border: isHighlighted ? `2px solid #cdd6f4` : '1px solid transparent',
                  borderRadius: 2,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, color: '#1e1e2e', fontWeight: 'bold',
                  textAlign: 'center', overflow: 'hidden',
                  padding: 1, boxSizing: 'border-box',
                  transition: 'opacity 0.15s, border 0.15s',
                  zIndex: isHighlighted ? 10 : 1,
                }}
                onMouseEnter={() => setHighlight(el.id)}
                onMouseLeave={() => setHighlight(null)}
                onClick={() => toggleVisible(el.id)}
              >
                {pos.width > 40 && pos.height > 14 ? el.label : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspector */}
      {highlight && (() => {
        const el = elements.find(e => e.id === highlight);
        if (!el) return null;
        return (
          <div style={{ ...SX.card, borderLeft: `3px solid ${el.color}` }}>
            <div style={SX.title}>🔍 {el.label}</div>
            <div style={SX.row}><span style={SX.k}>Tipo</span><span style={SX.v}>{el.type}</span></div>
            <div style={SX.row}><span style={SX.k}>ID</span><span style={SX.vMuted}>{el.id}</span></div>
            <div style={SX.row}><span style={SX.k}>Bounds</span><span style={SX.v}>
              x:{el.bounds.xmin}–{el.bounds.xmax} y:{el.bounds.ymin}–{el.bounds.ymax}
            </span></div>
            <div style={{ ...SX.row, marginTop: 4 }}>
              <span style={SX.k}>Método Magik</span>
              <span style={SX.vMuted}>
                {METHOD_MAP[el.id] ?? '—'}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Métodos */}
      <div style={SX.card}>
        <div style={SX.title}>Métodos migrados (23 total)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 4, fontSize: 10 }}>
          {Object.entries(METHOD_MAP).map(([id, method]) => (
            <div
              key={id}
              style={{
                padding: '3px 6px', background: '#313244', borderRadius: 4,
                cursor: 'pointer', color: highlight === id ? '#f9e2af' : '#bac2de',
              }}
              onMouseEnter={() => setHighlight(id)}
              onMouseLeave={() => setHighlight(null)}
              onClick={() => {
                const el = document.getElementById(`el-${id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              {method}
            </div>
          ))}
        </div>
      </div>

      {/* Equivalencias */}
      <div style={SX.card}>
        <div style={SX.title}>Equivalencias Magik → TS aplicadas</div>
        <table style={{ fontSize: 10, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#585b70' }}>
              <td style={{ padding: '2px 6px' }}>Magik</td>
              <td style={{ padding: '2px 6px' }}>→</td>
              <td style={{ padding: '2px 6px' }}>TypeScript</td>
            </tr>
          </thead>
          <tbody>
            {[
              ['bounding_box.new(x1,y1,x2,y2)', 'bb(x1,y1,x2,y2) → { xmin,ymin,xmax,ymax }'],
              ['_super.genera_plano()', 'super.generaPlano()'],
              ['_self.AddSellosDetalles()', 'this.addSellosDetalles()'],
              ['smallworld_product.pni_application()', 'AppContext (stub)'],
              ['mit_manager.modelit_dataset', 'DatasetService (stub)'],
              ['_if x _isnt _unset', 'if (x !== undefined)'],
              ['property_list.new()', 'objeto literal {}'],
              ['rope.new()', '[]'],
              ['colour.called(:red)', '#f38ba8 como string CSS'],
              ['predicate.within', 'stub (sin backend GIS)'],
              ['oPage.add_element(el)', 'elements.push(el)'],
              ['_over ... fast_elements()', 'for...of / .filter()'],
              ['_new_with(:key, val)', 'newWith({ key: val })'],
              ['_clone.init()', 'constructor (D2)'],
            ].map(([m, ts]) => (
              <tr key={m}>
                <td style={{ padding: '2px 6px', color: '#f9e2af' }}>{m}</td>
                <td style={{ padding: '2px 6px', color: '#585b70' }}>→</td>
                <td style={{ padding: '2px 6px', color: '#89dceb' }}>{ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const METHOD_MAP: Record<string, string> = {
  'titulo':                         'crea_titulo()',
  'estudio-transmision-1':          'AddEstudioTransmision()',
  'estudio-transmision-2':          'AddEstudioTransmision()',
  'estudio-transmision-3':          'AddEstudioTransmision()',
  'resumen-proyecto':               'addSellosDetalles() → c_resumen_del_proyecto_acometida',
  'sello-fo-acometida':             'addSellosDetalles() → c_sello_fibra_optica_acometida',
  'sello-estandar-base':            'addSellosDetalles() → c_sello_estandar_base_fo_acometida',
  'secuencia-trabajo':              'addSellosDetalles() → c_secuencia_trabajo',
  'notas-constructor':              'addSellosDetalles() → c_notas_constructor',
  'simbolo-acometida':              'agrega_simbolo("acometida_cliente")',
  'simbolo-soportes':               'agrega_simbolo("detalle_soportes_en_pozo")',
  'simbolo-empalme':                'agrega_simbolo("detalle_coloca_empalme")',
  'simbolo-charola':                'agrega_simbolo("detalle_de_charola")',
  'simbolo-ocupacion':              'agrega_simbolo("ocupacion_de_ductos")',
  'roseta':                         'agrega_simbolo("roseta_4_puertos")',
  'montaje-cables':                 'agrega_simbolo("montaje_cables_fo")',
  'tapa-subd':                      'agrega_simbolo("tapa_para_subd")',
  'tapon-av-flex':                  'agrega_simbolo("tapon_av_flex")',
  'tubo-polietileno':               'agrega_simbolo("tubo_de_polietileno")',
  'placa-1':                        'add_placas_identificacion_cable()',
  'isometrico-destino':             'AddIsometricoDestino()',
  'conexion-empalme':               'AddConexionEmpalme()',
  'esquematico':                    'AddEsquematico()',
  'ruta-cables':                    'AddRutadeCables()',
  'norte':                          'AddNorte()',
};
