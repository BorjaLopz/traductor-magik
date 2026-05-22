// =============================================================================
// MIGRACIÓN: c_catalogo_de_placas_plugin  →  CCatalogoDeplacasPlugin.tsx
// Jerarquía Magik: c_catalogo_de_placas_plugin  extends  :plugin
// Autor original:  lgranados, 09/12/2010 (Sigma Tao Software)
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

// Los 7 tipos de placa generables (genera_placa_*() en Magik)
export type TipoPlaca =
  | 'principales'
  | 'secundarios'
  | 'troncal_zonal'
  | 'rda_rof'
  | 'troncal'
  | 'larga_distancia'
  | 'banda_ancha';

// bounding_box.new(a, b, c, d) — 4 coordenadas del área en el plano (unidades mm)
export interface BoundingBox {
  a: number; // arg1: varía por tipo (posición y-offset de la placa en el plano)
  b: number; // arg2: fijo = 900
  c: number; // arg3: fijo = 450
  d: number; // arg4: fijo = 1250
}

// Elemento añadido a la página del layout (LoPage.add_element(LoSello))
export interface PageElement {
  tipo:      TipoPlaca;
  clase:     string;          // nombre de la c_placa_* equivalente
  label:     string;
  bounds:    BoundingBox;
  addedAt:   number;          // timestamp
}

// Mock de la página de layout (LoLayoutManager.current_page)
export interface LayoutPage {
  elements: PageElement[];
}

// Estado de acciones habilitadas (sw_action.enabled?)
export type ActionState = Record<TipoPlaca, boolean>;

// ---------------------------------------------------------------------------
// Configuración estática de placas
// ---------------------------------------------------------------------------
// Cada entrada = una c_placa_*.new_with(:bounds, bounding_box.new(...))
export const PLACA_CONFIGS: Record<TipoPlaca, {
  clase: string; label: string; bounds: BoundingBox; descripcion: string;
}> = {
  principales: {
    clase: 'c_placa_principales',
    label: 'Placa Principales',
    bounds: { a: 750, b: 900, c: 450, d: 1250 },
    descripcion: 'Red principal (backbone)',
  },
  secundarios: {
    clase: 'c_placa_secundarios',
    label: 'Placa Secundarios',
    bounds: { a: 600, b: 900, c: 450, d: 1250 },
    descripcion: 'Red secundaria de distribución',
  },
  troncal_zonal: {
    clase: 'c_placa_troncal_zonal',
    label: 'Placa Troncal Zonal',
    bounds: { a: 500, b: 900, c: 450, d: 1250 },
    descripcion: 'Troncal por zona geográfica',
  },
  rda_rof: {
    clase: 'c_placa_rda_rof',
    label: 'Placa RDA/ROF',
    bounds: { a: 400, b: 900, c: 450, d: 1250 },
    descripcion: 'Red de Acceso / Red Óptica de Feeder',
  },
  troncal: {
    clase: 'c_placa_troncal',
    label: 'Placa Troncal',
    bounds: { a: 300, b: 900, c: 450, d: 1250 },
    descripcion: 'Red troncal interurbana',
  },
  larga_distancia: {
    clase: 'c_placa_larga_distancia',
    label: 'Placa Larga Distancia',
    bounds: { a: 200, b: 900, c: 450, d: 1250 },
    descripcion: 'Enlace de larga distancia',
  },
  banda_ancha: {
    clase: 'c_placa_banda_ancha',
    label: 'Placa Banda Ancha',
    bounds: { a: 100, b: 900, c: 450, d: 1250 },
    descripcion: 'Red de banda ancha',
  },
};

export const TIPOS_PLACA = Object.keys(PLACA_CONFIGS) as TipoPlaca[];

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_catalogo_de_placas_plugin (extends :plugin).
 * Gestiona 8 sw_action para generar placas GIS en el layout designer.
 * obtienePagina() obtiene la página activa del motor de layout.
 * Los métodos genera_placa_*() crean el elemento con su bounding_box y lo
 * añaden a la página.
 */
export class CCatalogoDeplacasPlugin {
  // Estado habilitado/deshabilitado de las 7 acciones de generación
  // (sw_action.enabled? — gestionado por manage_actions)
  actions: ActionState = {
    principales:    true,
    secundarios:    true,
    troncal_zonal:  true,
    rda_rof:        true,
    troncal:        true,
    larga_distancia: true,
    banda_ancha:    true,
  };

  // Mock de la página de layout activa (LoLayoutManager.current_page)
  private _page: LayoutPage = { elements: [] };

  // ── initActions() ─────────────────────────────────────────────────────────
  // Magik: init_actions() → _self.add_action(sw_action.new(...)) × 8
  // Registra:
  //   :catalogo_de_placas          → sin action_message (abre diálogo)
  //   :genera_placa_principales    → genera_placa_principales()
  //   :genera_placa_secundarios    → genera_placa_secundarios()
  //   :genera_placa_troncal_zonal  → genera_placa_troncal_zonal()
  //   :genera_placa_rda_rof        → genera_placa_rda_rof()
  //   :genera_placa_troncal        → genera_placa_troncal()
  //   :genera_placa_larga_distancia→ genera_placa_larga_distancia()
  //   :genera_placa_banda_ancha    → genera_placa_banda_ancha()
  initActions(): void {
    // Todas las acciones se inicializan en enabled?=true
    TIPOS_PLACA.forEach(tipo => {
      this.actions[tipo] = true;
    });
  }

  // ── manageActions(activar?) ───────────────────────────────────────────────
  // Magik: manage_actions(_optional PbActivar?) → .action(:xxx).enabled? << PbActivar?
  // Controla las 7 acciones de generación (catalogo_de_placas no está en la lista).
  manageActions(activar: boolean = true): void {
    TIPOS_PLACA.forEach(tipo => {
      this.actions[tipo] = activar;
    });
  }

  // ── obtienePagina() ───────────────────────────────────────────────────────
  // Magik: obtiene_pagina() → layout_plugin → layout_designer →
  //        layout_manager → current_page
  // En TS: devuelve la página mock interna.
  obtienePagina(): LayoutPage {
    return this._page;
  }

  // ── genera_placa_principales() ────────────────────────────────────────────
  // Magik: c_placa_principales.new_with(:bounds, bounding_box.new(750,900,450,1250))
  generaPlacaPrincipales(): PageElement {
    return this._generaPlaca('principales');
  }

  // ── genera_placa_secundarios() ────────────────────────────────────────────
  generaPlacaSecundarios(): PageElement {
    return this._generaPlaca('secundarios');
  }

  // ── genera_placa_troncal_zonal() ──────────────────────────────────────────
  generaPlacaTroncalZonal(): PageElement {
    return this._generaPlaca('troncal_zonal');
  }

  // ── genera_placa_rda_rof() ────────────────────────────────────────────────
  generaPlacaRdaRof(): PageElement {
    return this._generaPlaca('rda_rof');
  }

  // ── genera_placa_troncal() ────────────────────────────────────────────────
  generaPlacaTroncal(): PageElement {
    return this._generaPlaca('troncal');
  }

  // ── genera_placa_larga_distancia() ────────────────────────────────────────
  generaPlacaLargaDistancia(): PageElement {
    return this._generaPlaca('larga_distancia');
  }

  // ── genera_placa_banda_ancha() ────────────────────────────────────────────
  generaPlacaBandaAncha(): PageElement {
    return this._generaPlaca('banda_ancha');
  }

  // ── _generaPlaca(tipo) ────────────────────────────────────────────────────
  // Factoriza el patrón común: obtiene_pagina() + new_with(:bounds, bb) + add_element
  private _generaPlaca(tipo: TipoPlaca): PageElement {
    const cfg  = PLACA_CONFIGS[tipo];
    const page = this.obtienePagina();
    const elem: PageElement = {
      tipo,
      clase   : cfg.clase,
      label   : cfg.label,
      bounds  : cfg.bounds,
      addedAt : Date.now(),
    };
    page.elements.push(elem); // LoPage.add_element(LoSello)
    return elem;
  }

  // ── resetPagina() ─────────────────────────────────────────────────────────
  resetPagina(): void {
    this._page = { elements: [] };
  }

  getPage(): LayoutPage {
    return this._page;
  }
}

// =============================================================================
// Componente React — CCatalogoDeplacasPluginUI
// =============================================================================

// Paleta de colores por tipo de placa
const PLACA_COLORS: Record<TipoPlaca, string> = {
  principales:    '#cba6f7',
  secundarios:    '#89b4fa',
  troncal_zonal:  '#94e2d5',
  rda_rof:        '#a6e3a1',
  troncal:        '#f9e2af',
  larga_distancia:'#fab387',
  banda_ancha:    '#f38ba8',
};

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, maxWidth: 900,
  },
  header: { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 14 },
  actionCard: {
    background: '#313244', borderRadius: 6, padding: 10,
    border: '1px solid #45475a', display: 'flex', flexDirection: 'column' as const, gap: 4,
  },
  btnGenera: {
    border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginTop: 4,
  },
  btnDisabled: {
    border: 'none', borderRadius: 4, padding: '4px 10px',
    fontFamily: 'monospace', fontSize: 11, background: '#45475a', color: '#585b70',
    cursor: 'not-allowed', marginTop: 4,
  },
  catalogoBtn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#cba6f7', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12,
    fontWeight: 'bold', marginRight: 8,
  },
  toggleOn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  },
  toggleOff: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#f38ba8', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  },
  page: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 12, minHeight: 80, marginTop: 14,
  },
  pageTitle: { color: '#89dceb', fontSize: 11, marginBottom: 8 },
  elemRow: {
    display: 'flex', gap: 8, alignItems: 'center',
    padding: '4px 0', borderBottom: '1px solid #313244',
  },
  badge: { borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 'bold' },
  bbLabel: { color: '#585b70', fontSize: 10 },
  msg: {
    background: '#313244', border: '1px solid #45475a', borderRadius: 4,
    padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11,
  },
};

export function CCatalogoDeplacasPluginUI() {
  const [instancia]  = useState(() => { const p = new CCatalogoDeplacasPlugin(); p.initActions(); return p; });
  const [actions, setActions] = useState<ActionState>({ ...instancia.actions });
  const [pageElems, setPageElems] = useState<PageElement[]>([]);
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [msg, setMsg] = useState('');

  // manage_actions(activar)
  function handleManage(activar: boolean) {
    instancia.manageActions(activar);
    setActions({ ...instancia.actions });
    setMsg(`manageActions(${activar}) → ${TIPOS_PLACA.length} acciones ${activar ? 'habilitadas' : 'deshabilitadas'}`);
  }

  // genera_placa_*(tipo) — wrapper genérico
  function handleGenera(tipo: TipoPlaca) {
    if (!actions[tipo]) return;
    const methodMap: Record<TipoPlaca, () => PageElement> = {
      principales    : () => instancia.generaPlacaPrincipales(),
      secundarios    : () => instancia.generaPlacaSecundarios(),
      troncal_zonal  : () => instancia.generaPlacaTroncalZonal(),
      rda_rof        : () => instancia.generaPlacaRdaRof(),
      troncal        : () => instancia.generaPlacaTroncal(),
      larga_distancia: () => instancia.generaPlacaLargaDistancia(),
      banda_ancha    : () => instancia.generaPlacaBandaAncha(),
    };
    const elem = methodMap[tipo]();
    setPageElems([...instancia.getPage().elements]);
    setMsg(`${elem.clase}.new_with(:bounds, bb(${elem.bounds.a},${elem.bounds.b},${elem.bounds.c},${elem.bounds.d})) → LoPage.add_element()`);
  }

  function handleResetPagina() {
    instancia.resetPagina();
    setPageElems([]);
    setMsg('Página de layout reiniciada.');
  }

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CCatalogoDeplacasPlugin
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          plugin → 8 sw_action → genera placas GIS en el layout designer
        </span>
      </div>

      {/* Controles globales */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {/* :catalogo_de_placas (sin action_message → abre diálogo) */}
        <button onClick={() => { setCatalogoOpen(!catalogoOpen); setMsg('catalogo_de_placas → abre diálogo de catálogo'); }}
          style={ui.catalogoBtn}>
          Catálogo de Placas
        </button>
        <button onClick={() => handleManage(true)}  style={ui.toggleOn}>
          manage_actions(true)
        </button>
        <button onClick={() => handleManage(false)} style={ui.toggleOff}>
          manage_actions(false)
        </button>
        <button onClick={handleResetPagina}
          style={{ ...ui.toggleOff, background: '#45475a', color: '#cdd6f4' }}>
          Reset página
        </button>
      </div>

      {/* Diálogo de catálogo (modal simplificado) */}
      {catalogoOpen && (
        <div style={{
          background: '#313244', border: '1px solid #89b4fa', borderRadius: 6,
          padding: 12, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#89b4fa', fontWeight: 'bold' }}>Catálogo de Placas</span>
            <button onClick={() => setCatalogoOpen(false)}
              style={{ background: 'none', border: 'none', color: '#f38ba8', cursor: 'pointer', fontSize: 13 }}>
              ✕
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
            {TIPOS_PLACA.map(tipo => {
              const cfg = PLACA_CONFIGS[tipo];
              return (
                <div key={tipo} style={{
                  background: '#1e1e2e', borderRadius: 4, padding: 8,
                  borderLeft: `3px solid ${PLACA_COLORS[tipo]}`,
                }}>
                  <div style={{ color: PLACA_COLORS[tipo], fontWeight: 'bold', fontSize: 11 }}>
                    {cfg.label}
                  </div>
                  <div style={{ color: '#585b70', fontSize: 10, marginTop: 2 }}>{cfg.descripcion}</div>
                  <div style={{ color: '#45475a', fontSize: 10, marginTop: 2 }}>{cfg.clase}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje de estado */}
      {msg && <div style={ui.msg}>{msg}</div>}

      {/* Grid de acciones de generación */}
      <div style={{ color: '#89dceb', fontSize: 11, marginBottom: 6 }}>
        Acciones de generación ({TIPOS_PLACA.filter(t => actions[t]).length}/{TIPOS_PLACA.length} habilitadas):
      </div>
      <div style={ui.grid}>
        {TIPOS_PLACA.map(tipo => {
          const cfg      = PLACA_CONFIGS[tipo];
          const enabled  = actions[tipo];
          const color    = PLACA_COLORS[tipo];
          const { a, b, c, d } = cfg.bounds;
          return (
            <div key={tipo} style={{
              ...ui.actionCard,
              borderLeft: `3px solid ${enabled ? color : '#45475a'}`,
              opacity: enabled ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: enabled ? color : '#585b70', fontWeight: 'bold', fontSize: 11 }}>
                  {cfg.label}
                </span>
                <span style={{
                  ...ui.badge,
                  background: enabled ? color : '#45475a',
                  color: enabled ? '#1e1e2e' : '#585b70',
                }}>
                  {enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div style={{ color: '#585b70', fontSize: 10 }}>{cfg.descripcion}</div>
              <div style={ui.bbLabel}>
                bb({a},{b},{c},{d})
              </div>
              <button
                onClick={() => handleGenera(tipo)}
                disabled={!enabled}
                style={enabled
                  ? { ...ui.btnGenera, background: color, color: '#1e1e2e' }
                  : ui.btnDisabled
                }
              >
                genera_placa_{tipo}()
              </button>
            </div>
          );
        })}
      </div>

      {/* Página de layout (LoPage — current_page mock) */}
      <div style={ui.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={ui.pageTitle}>
            LayoutPage (current_page) — {pageElems.length} elemento{pageElems.length !== 1 ? 's' : ''}
          </span>
        </div>
        {pageElems.length === 0 && (
          <div style={{ color: '#45475a', fontSize: 11 }}>Sin elementos. Genera alguna placa.</div>
        )}
        {pageElems.map((elem, i) => (
          <div key={i} style={ui.elemRow}>
            <span style={{
              ...ui.badge,
              background: PLACA_COLORS[elem.tipo],
              color: '#1e1e2e',
            }}>
              {i + 1}
            </span>
            <span style={{ color: PLACA_COLORS[elem.tipo], fontWeight: 'bold', minWidth: 180 }}>
              {elem.clase}
            </span>
            <span style={ui.bbLabel}>
              bounds({elem.bounds.a},{elem.bounds.b},{elem.bounds.c},{elem.bounds.d})
            </span>
            <span style={{ color: '#45475a', fontSize: 10, marginLeft: 'auto' }}>
              +{Math.round((Date.now() - elem.addedAt) / 1000)}s ago
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
