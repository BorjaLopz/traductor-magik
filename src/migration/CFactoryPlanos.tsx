// =============================================================================
// MIGRACIÓN: c_factory_planos  →  CFactoryPlanos.tsx
// Jerarquía Magik: c_factory_planos  (sin clase padre explícita)
// Autor original:  rraragon, 08/07/29 (GE Network Solutions / Smallworld PNI)
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

// Elemento genérico en la página de layout (add_element)
export type PageElementType = 'marco' | 'titulo' | 'sello';

export interface PageElement {
  type:   PageElementType;
  clase:  string;           // nombre de la c_* que genera el elemento
  bounds: BoundingBox;
  meta?:  Record<string, unknown>; // propiedades adicionales
}

// Mock de la página de layout (LoLayoutManager.current_page)
// Dimensiones: set_paper_size(12400, 8400) → 124 cm × 84 cm (en 1/100 mm)
export interface LayoutPage {
  paperWidth:  number;    // 12400
  paperHeight: number;    // 8400
  elements:    PageElement[];
}

// Mock del viewport mapper plugin
export interface ViewMapperPlugin {
  name: 'viewport_mapper';
}

// Mock del map_view (GetMapView)
export interface MockMapView {
  name: string;
  centeredOn: { x: number; y: number } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePage(): LayoutPage {
  return { paperWidth: 12400, paperHeight: 8400, elements: [] };
}

function makeViewport(): ViewMapperPlugin {
  return { name: 'viewport_mapper' };
}

function bb(xmin: number, ymin: number, xmax: number, ymax: number): BoundingBox {
  return { xmin, ymin, xmax, ymax };
}

// ---------------------------------------------------------------------------
// Clase principal — CFactoryPlanos
// ---------------------------------------------------------------------------

/**
 * Migración de c_factory_planos.
 * Clase base (factory) para la generación de planos de layout GIS.
 * generaPlano() orquesta: iniciaLayout() → addElementosComunes() →
 *   addMarco() + addTitulo() + addSellos()
 * creaTitulo() y generaPlano() están pensados para ser subclaseados.
 */
export class CFactoryPlanos {
  // Slots privados (def_slotted_exemplar)
  protected oPage:              LayoutPage    | null = null;
  protected oViewMapperPlugin:  ViewMapperPlugin | null = null;

  // ── new() / init() ────────────────────────────────────────────────────────
  // Magik: new() → _clone.init() → _return _self
  static create(): CFactoryPlanos {
    return new CFactoryPlanos()._init();
  }

  protected _init(): this {
    // inicialización base; las subclases pueden extender
    return this;
  }

  // ── iniciaLayout() ────────────────────────────────────────────────────────
  // Magik: inicia_layout()
  //   layout_plugin → start_layout_designer → layout_manager → current_page
  //   Valida que la página esté vacía (if LoPage.empty?.not → user_error)
  //   Configura tamaño: set_paper_size(12400, 8400)  → 124 cm × 84 cm
  //   Retorna (LoPage, LoViewMapperPlugin)
  iniciaLayout(): { page: LayoutPage; viewport: ViewMapperPlugin } | { error: string } {
    const page = makePage(); // mock de current_page
    // Validación: si la página ya tiene elementos → error (equivale a LoPage.empty?.not)
    if (this.oPage !== null && this.oPage.elements.length > 0) {
      return {
        error:
          'El diseñador de planos ya tiene uno activo.\n' +
          'Favor de cerrarlo antes de generar otro plano.',
      };
    }
    // set_paper_size(12400, 8400) → ya está en makePage()
    const viewport = makeViewport();
    return { page, viewport };
  }

  // ── getMapView(geom?) ─────────────────────────────────────────────────────
  // Magik: GetMapView(PoGeom)
  //   map_plugin.current_map_view → si geom → goto(geom) → vuelve a pedir
  getMapView(geom?: { x: number; y: number } | null): MockMapView {
    if (geom != null) {
      // Equivale a: LoMapView.goto(PoGeom) + LoMapPlugin.current_map_view
      return { name: 'current_map_view', centeredOn: geom };
    }
    return { name: 'current_map_view', centeredOn: null };
  }

  // ── generaPlano() ─────────────────────────────────────────────────────────
  // Magik: genera_plano() → inicia_layout() + AddElementos_comunes()
  // Pensado para ser subclaseado (override para añadir elementos adicionales).
  generaPlano(): { ok: boolean; message: string } {
    const result = this.iniciaLayout();
    if ('error' in result) {
      return { ok: false, message: result.error };
    }
    this.oPage             = result.page;
    this.oViewMapperPlugin = result.viewport;
    this.addElementosComunes();
    return {
      ok      : true,
      message : `Plano generado — ${this.oPage.elements.length} elemento(s) en página.`,
    };
  }

  // ── addElementosComunes() ─────────────────────────────────────────────────
  // Magik: AddElementos_comunes()
  //   if .oPage _isnt _unset → AddMarco() → AddTitulo(marco) → AddSellos()
  addElementosComunes(): void {
    if (this.oPage == null) return;
    const marco = this.addMarco();
    this.addTitulo(marco);
    this.addSellos();
  }

  // ── addMarco() ────────────────────────────────────────────────────────────
  // Magik: AddMarco()
  //   c_marco.new_with(:bounds, bb(0,0,1,1))
  //   .Largo = 6 / .Alto = 3 / .set_fill_colour(_unset)
  //   oPage.add_element(LoMarco)
  // El marco actúa como contenedor del plano completo.
  // Para cálculos de posición de los hijos (Titulo, Sellos), sus bounds
  // representan el área total de la página.
  addMarco(): PageElement {
    const marco: PageElement = {
      type  : 'marco',
      clase : 'c_marco',
      bounds: bb(0, 0, 12400, 8400), // ocupa la página entera en el mock
      meta  : { largo: 6, alto: 3, fillColor: null },
    };
    this.oPage!.elements.push(marco);
    return marco;
  }

  // ── addTitulo(marco) ──────────────────────────────────────────────────────
  // Magik: AddTitulo(PoMarco)
  //   LoBB = bb(marco.xmax-2200, marco.ymin+200, marco.xmax-200, marco.ymin+600)
  //   c_titulo_de_plano.new_with(:bounds, LoBB, :font_name,"bold", :font_size,8,
  //     :text, creaTitulo(), :wrap,false, :align_h,:centre, :align_v,:centre,
  //     :orientation,:left_right)
  addTitulo(marco: PageElement): PageElement {
    const { xmax, ymin } = marco.bounds;
    const tituloBB = bb(xmax - 2200, ymin + 200, xmax - 200, ymin + 600);
    const titulo: PageElement = {
      type  : 'titulo',
      clase : 'c_titulo_de_plano',
      bounds: tituloBB,
      meta  : {
        text           : this.creaTitulo(),
        fontName       : 'bold',
        fontSize       : 8,
        fillStyle      : null,
        outlineStyle   : null,
        wrap           : false,
        alignHorizontal: 'centre',
        alignVertical  : 'centre',
        orientation    : 'left_right',
      },
    };
    this.oPage!.elements.push(titulo);
    return titulo;
  }

  // ── addSellos() ───────────────────────────────────────────────────────────
  // Magik: AddSellos()
  //   c_sello_ruta_cables_fo.new_with(:bounds, bb(450,400,2100,3000))
  //   c_generador_sellos → genera_sello(page, c_sello_estandar_base_fo, bb(285,400,2100,3000))
  //   c_generador_sellos → genera_sello(page, c_notas_constructor,      bb(450,400,2100,5000))
  addSellos(): PageElement[] {
    const sellos: PageElement[] = [
      {
        type  : 'sello',
        clase : 'c_sello_ruta_cables_fo',
        bounds: bb(450, 400, 2100, 3000),
      },
      {
        type  : 'sello',
        clase : 'c_sello_estandar_base_fo',
        bounds: bb(285, 400, 2100, 3000),
      },
      {
        type  : 'sello',
        clase : 'c_notas_constructor',
        bounds: bb(450, 400, 2100, 5000),
      },
    ];
    sellos.forEach(s => this.oPage!.elements.push(s));
    return sellos;
  }

  // ── creaTitulo() ──────────────────────────────────────────────────────────
  // Magik: crea_titulo → _return "Titulo"
  // Método base diseñado para ser subclaseado por cada tipo de plano.
  creaTitulo(): string {
    return 'Titulo';
  }

  // ── asignaPaginaYViewport(page, viewport) ─────────────────────────────────
  // Magik: asigna_pagina_y_viewport(Popagina, Poviewport)
  // Permite asignar la página y el viewport desde una clase externa.
  asignaPaginaYViewport(page: LayoutPage, viewport: ViewMapperPlugin): void {
    this.oPage             = page;
    this.oViewMapperPlugin = viewport;
  }

  // ── reset() ───────────────────────────────────────────────────────────────
  reset(): void {
    this.oPage             = null;
    this.oViewMapperPlugin = null;
  }

  getPage(): LayoutPage | null      { return this.oPage; }
  getViewport(): ViewMapperPlugin | null { return this.oViewMapperPlugin; }
}

// =============================================================================
// Componente React — CFactoryPlanosUI
// =============================================================================

// Paleta por tipo de elemento
const ELEM_COLORS: Record<PageElementType, string> = {
  marco  : '#45475a',
  titulo : '#cba6f7',
  sello  : '#89b4fa',
};

const ELEM_STROKE: Record<PageElementType, string> = {
  marco  : '#585b70',
  titulo : '#b4befe',
  sello  : '#74c7ec',
};

const SELLO_COLORS: Record<string, string> = {
  c_sello_ruta_cables_fo  : '#a6e3a1',
  c_sello_estandar_base_fo: '#f9e2af',
  c_notas_constructor     : '#fab387',
};

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, maxWidth: 900,
  },
  header: { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
  btn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 8, marginBottom: 8,
  },
  msg: {
    background: '#313244', border: '1px solid #45475a', borderRadius: 4,
    padding: '6px 10px', marginBottom: 10, fontSize: 11, whiteSpace: 'pre-wrap' as const,
  },
  pageCanvas: {
    background: '#f5f5f0', borderRadius: 4, border: '2px solid #45475a',
    display: 'block', overflow: 'hidden',
  },
  legend: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginTop: 10 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 },
  dot: { width: 10, height: 10, borderRadius: 2 },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: 10 },
  th: { background: '#313244', border: '1px solid #45475a', padding: '4px 8px', color: '#cba6f7', fontSize: 11, textAlign: 'left' as const },
  td: { border: '1px solid #45475a', padding: '3px 8px', fontSize: 11 },
};

// Escala la página para visualización SVG
const SCALE = 0.042; // 12400 × 0.042 ≈ 520px

export function CFactoryPlanosUI() {
  const [instancia]      = useState(() => CFactoryPlanos.create());
  const [pageElements, setPageElements] = useState<PageElement[]>([]);
  const [hasPage, setHasPage]           = useState(false);
  const [mapView, setMapView]           = useState<MockMapView | null>(null);
  const [msg, setMsg]                   = useState('');
  const [msgOk, setMsgOk]               = useState(true);

  const PW = instancia.getPage()?.paperWidth  ?? 12400;
  const PH = instancia.getPage()?.paperHeight ?? 8400;

  function setStatus(text: string, ok = true) {
    setMsg(text);
    setMsgOk(ok);
  }

  function handleGeneraPlano() {
    const result = instancia.generaPlano();
    if (!result.ok) {
      setStatus(result.message, false);
      return;
    }
    setPageElements([...(instancia.getPage()?.elements ?? [])]);
    setHasPage(true);
    setStatus(result.message);
  }

  function handleReset() {
    instancia.reset();
    setPageElements([]);
    setHasPage(false);
    setMapView(null);
    setStatus('Página reiniciada.');
  }

  function handleGetMapView() {
    const mv = instancia.getMapView({ x: 500, y: 400 });
    setMapView(mv);
    setStatus(`getMapView() → ${mv.name}, centeredOn: (${mv.centeredOn?.x},${mv.centeredOn?.y})`);
  }

  function handleAsigna() {
    const page = { paperWidth: 12400, paperHeight: 8400, elements: [] };
    const vp   = { name: 'viewport_mapper' as const };
    instancia.asignaPaginaYViewport(page, vp);
    setHasPage(true);
    setStatus('asignaPaginaYViewport() ejecutado — oPage y oViewMapperPlugin asignados.');
  }

  const svgW = Math.round(PW * SCALE);
  const svgH = Math.round(PH * SCALE);

  // flip-Y: Smallworld usa y↑, SVG usa y↓ → ysvg = PH - ymax
  function toSvg(bounds: BoundingBox) {
    const x = Math.round(bounds.xmin * SCALE);
    const y = Math.round((PH - bounds.ymax) * SCALE);
    const w = Math.round((bounds.xmax - bounds.xmin) * SCALE);
    const h = Math.round((bounds.ymax - bounds.ymin) * SCALE);
    return { x, y, w, h };
  }

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CFactoryPlanos
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          factory base — genera planos de layout GIS (124 cm × 84 cm)
        </span>
      </div>

      {/* Controles */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleGeneraPlano}
          style={{ ...ui.btn, background: '#a6e3a1', color: '#1e1e2e' }}>
          generaPlano()
        </button>
        <button onClick={handleGetMapView}
          style={{ ...ui.btn, background: '#89b4fa', color: '#1e1e2e' }}>
          getMapView(500,400)
        </button>
        <button onClick={handleAsigna}
          style={{ ...ui.btn, background: '#f9e2af', color: '#1e1e2e' }}>
          asignaPaginaYViewport()
        </button>
        <button onClick={handleReset}
          style={{ ...ui.btn, background: '#45475a', color: '#cdd6f4' }}>
          reset()
        </button>
      </div>

      {/* Estado */}
      {msg && (
        <div style={{ ...ui.msg, color: msgOk ? '#a6e3a1' : '#f38ba8',
                      borderColor: msgOk ? '#a6e3a1' : '#f38ba8' }}>
          {msg}
        </div>
      )}

      {/* Metadatos */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        {[
          { k: 'paperSize',  v: `${PW} × ${PH}  (124 cm × 84 cm)` },
          { k: 'oPage',      v: hasPage ? 'LayoutPage activa' : 'null' },
          { k: 'elements',   v: String(pageElements.length) },
          { k: 'oViewMapper',v: hasPage ? 'viewport_mapper' : 'null' },
        ].map(item => (
          <div key={item.k} style={{ background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 }}>
            <span style={{ color: '#585b70' }}>{item.k}: </span>
            <span style={{ color: '#a6e3a1' }}>{item.v}</span>
          </div>
        ))}
        {mapView && (
          <div style={{ background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 }}>
            <span style={{ color: '#585b70' }}>mapView: </span>
            <span style={{ color: '#94e2d5' }}>
              centeredOn ({mapView.centeredOn?.x},{mapView.centeredOn?.y})
            </span>
          </div>
        )}
      </div>

      {/* SVG — visualización de la página de layout */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          width={svgW}
          height={svgH}
          style={{ ...ui.pageCanvas, width: svgW, height: svgH }}
        >
          {/* Fondo de la página */}
          <rect x={0} y={0} width={svgW} height={svgH} fill="#f8f8f6" stroke="#ccc" />

          {/* Elementos añadidos */}
          {pageElements.map((elem, i) => {
            const { x, y, w, h } = toSvg(elem.bounds);
            const fill = elem.type === 'sello'
              ? (SELLO_COLORS[elem.clase] ?? '#89b4fa') + '55'
              : ELEM_COLORS[elem.type] + '44';
            const stroke = elem.type === 'sello'
              ? (SELLO_COLORS[elem.clase] ?? '#89b4fa')
              : ELEM_STROKE[elem.type];
            const labelY = y + Math.min(12, h / 2);
            return (
              <g key={i}>
                <rect
                  x={x} y={y} width={Math.max(w, 2)} height={Math.max(h, 2)}
                  fill={fill} stroke={stroke} strokeWidth={1}
                />
                {w > 20 && h > 8 && (
                  <text
                    x={x + 3} y={labelY}
                    fontSize={8} fill={stroke}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {elem.clase}
                  </text>
                )}
                {elem.type === 'titulo' && elem.meta?.text && w > 40 && (
                  <text
                    x={x + w / 2} y={y + h / 2 + 3}
                    fontSize={10} fill="#1e1e2e"
                    textAnchor="middle"
                    style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                  >
                    {String(elem.meta.text)}
                  </text>
                )}
              </g>
            );
          })}

          {!hasPage && (
            <text
              x={svgW / 2} y={svgH / 2}
              fontSize={12} fill="#aaa"
              textAnchor="middle"
              style={{ fontFamily: 'monospace' }}
            >
              Página vacía — pulsa generaPlano()
            </text>
          )}
        </svg>
      </div>

      {/* Leyenda */}
      {pageElements.length > 0 && (
        <div style={ui.legend}>
          {Object.entries({ ...ELEM_COLORS, ...SELLO_COLORS }).map(([k, v]) => (
            <div key={k} style={ui.legendItem}>
              <div style={{ ...ui.dot, background: v }} />
              <span style={{ color: '#cdd6f4' }}>{k}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de elementos */}
      {pageElements.length > 0 && (
        <table style={ui.table}>
          <thead>
            <tr>
              <th style={ui.th}>#</th>
              <th style={ui.th}>type</th>
              <th style={ui.th}>clase</th>
              <th style={ui.th}>bounds  (xmin,ymin,xmax,ymax)</th>
              <th style={ui.th}>meta</th>
            </tr>
          </thead>
          <tbody>
            {pageElements.map((elem, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#1e1e2e' : '#181825' }}>
                <td style={ui.td}>{i + 1}</td>
                <td style={{ ...ui.td, color: ELEM_COLORS[elem.type] }}>{elem.type}</td>
                <td style={{ ...ui.td, color: ELEM_STROKE[elem.type] }}>{elem.clase}</td>
                <td style={{ ...ui.td, color: '#585b70' }}>
                  ({elem.bounds.xmin},{elem.bounds.ymin},{elem.bounds.xmax},{elem.bounds.ymax})
                </td>
                <td style={{ ...ui.td, color: '#a6e3a1', fontSize: 10 }}>
                  {elem.meta ? JSON.stringify(elem.meta).slice(0, 60) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
