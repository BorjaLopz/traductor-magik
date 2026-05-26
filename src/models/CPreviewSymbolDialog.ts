// Source: adiciones_layout/source/c_preview_symbol_dialog.magik
//
// Diálogo de previsualización de símbolos GIS. Selección desde una lista
// (sw_style_system_engine.ordered_symbol_names) + canvas de preview
// (gis_point_style → draw_sample). El botón OK inserta un symbol_layout
// en la página activa del Layout Designer (centro de página la primera vez,
// adyacente al último símbolo después).
//
// canvas_size = 210, canvas_bounds = bbox(0,0,210,210).enlarging(0.85)

export type SymbolShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'cross';

export interface SymbolDefinition {
  symbolName:     string;
  shape:          SymbolShape;
  fillColor:      string;
  strokeColor:    string;
  size:           number;
  hasActualGeoms: boolean;
}

export interface SymbolStyleService {
  orderedSymbolNames(): string[];
  getSymbol(name: string): SymbolDefinition | undefined;
}

export interface Coordinate { x: number; y: number }
export interface BoundingBox { xmin: number; ymin: number; xmax: number; ymax: number }

export interface SymbolLayout {
  name:     string;
  bounds:   BoundingBox;
  fillStyle:    undefined;
  outlineStyle: undefined;
}

export interface LayoutPage {
  bounds:           BoundingBox;
  symbolElements:   SymbolLayout[];
  addElement(s: SymbolLayout): void;
}

export interface LayoutContext {
  currentPage(): LayoutPage | undefined;
  // Magik: dialogs[:layout_designer].plugin(:layout_manager).action(:layout_view_refresh)
  refreshView(): void;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const CANVAS_SIZE = 210;

// Magik: bounding_box.new(0,0,210,210).new_enlarging(0.85)
//   new_enlarging(factor) reduce/expande la bbox manteniendo el centro.
export const CANVAS_BOUNDS: BoundingBox = (() => {
  const half  = CANVAS_SIZE / 2;
  const f     = 0.85;
  const halfF = half * f;
  return { xmin: half - halfF, ymin: half - halfF, xmax: half + halfF, ymax: half + halfF };
})();

// =============================================================================
// HELPERS DE INSERCIÓN
// =============================================================================

// Magik: lógica de posicionamiento del .ok()
//   1ª inserción → bbox centrado en pagina.bounds.centre
//   siguientes  → bbox centrado a la derecha del último symbol_layout
export function calculaBoundsInsercion(page: LayoutPage): BoundingBox {
  const size = 600;   // bbox(0,0,600,600) en el original
  const half = size / 2;
  const last = page.symbolElements[page.symbolElements.length - 1];

  let centre: Coordinate;
  if (last) {
    const lastCx    = (last.bounds.xmin + last.bounds.xmax) / 2;
    const lastWidth = last.bounds.xmax - last.bounds.xmin;
    const lastCy    = (last.bounds.ymin + last.bounds.ymax) / 2;
    centre = { x: lastCx + lastWidth, y: lastCy };
  } else {
    centre = {
      x: (page.bounds.xmin + page.bounds.xmax) / 2,
      y: (page.bounds.ymin + page.bounds.ymax) / 2,
    };
  }
  return {
    xmin: centre.x - half, ymin: centre.y - half,
    xmax: centre.x + half, ymax: centre.y + half,
  };
}

// =============================================================================
// MOCK SymbolStyleService
// =============================================================================

const MOCK_SYMBOLS: SymbolDefinition[] = [
  { symbolName: 'antena',          shape: 'star',     fillColor: '#6A1B9A', strokeColor: '#4A148C', size: 18, hasActualGeoms: true  },
  { symbolName: 'cámara',          shape: 'square',   fillColor: '#2E7D32', strokeColor: '#1B5E20', size: 14, hasActualGeoms: true  },
  { symbolName: 'cruce_vial',      shape: 'cross',    fillColor: '#C62828', strokeColor: '#B71C1C', size: 16, hasActualGeoms: true  },
  { symbolName: 'empalme',         shape: 'diamond',  fillColor: '#E65100', strokeColor: '#BF360C', size: 16, hasActualGeoms: true  },
  { symbolName: 'punto_nodo',      shape: 'circle',   fillColor: '#1565C0', strokeColor: '#0D47A1', size: 14, hasActualGeoms: true  },
  { symbolName: 'sin_geometria',   shape: 'circle',   fillColor: '#cccccc', strokeColor: '#999999', size: 14, hasActualGeoms: false },
  { symbolName: 'señal_rf',        shape: 'triangle', fillColor: '#F9A825', strokeColor: '#E65100', size: 16, hasActualGeoms: true  },
];

export const mockSymbolStyleService: SymbolStyleService = {
  orderedSymbolNames: () => [...MOCK_SYMBOLS].sort((a, b) => a.symbolName.localeCompare(b.symbolName)).map(s => s.symbolName),
  getSymbol:          (n) => MOCK_SYMBOLS.find(s => s.symbolName === n),
};

// =============================================================================
// CLASE
// =============================================================================

export class CPreviewSymbolDialog {
  static readonly canvasSize   = CANVAS_SIZE;
  static readonly canvasBounds = CANVAS_BOUNDS;

  sNombreSimbolo: string = '';
  ownerPlugin:    string | undefined = undefined;
  okEnabled:      boolean = false;

  private _service: SymbolStyleService;
  private _layout:  LayoutContext | undefined;

  constructor(service: SymbolStyleService = mockSymbolStyleService, layout?: LayoutContext) {
    this._service = service;
    this._layout  = layout;
  }

  // Magik: available_symbol_names
  availableSymbolNames(): string[] {
    return this._service.orderedSymbolNames();
  }

  // Magik: display_trees → lista de display_tree con name
  displayTrees(): { key: string; label: string }[] {
    return this.availableSymbolNames().map(n => ({ key: n, label: n }));
  }

  // Magik: draw_preview(symbol_name) — devuelve el símbolo a dibujar o undefined
  drawPreview(symbolName: string | undefined): SymbolDefinition | undefined {
    if (symbolName === undefined) return undefined;
    const sym = this._service.getSymbol(symbolName);
    if (!sym || !sym.hasActualGeoms) return undefined;
    return sym;
  }

  // Magik: tree_item_select(selection, by_user?)
  treeItemSelect(symbolName: string | undefined): SymbolDefinition | undefined {
    this.sNombreSimbolo = symbolName ?? '';
    this.okEnabled = symbolName !== undefined && symbolName !== '';
    return this.drawPreview(symbolName);
  }

  // Magik: ok() — inserta symbol_layout en la página
  ok(): { ok: false; reason: string } | { ok: true; symbol: SymbolLayout } {
    if (!this._layout) return { ok: false, reason: 'Layout Designer no disponible' };
    const page = this._layout.currentPage();
    if (!page) return { ok: false, reason: 'No hay página actual' };
    if (this.sNombreSimbolo === '') return { ok: false, reason: 'Sin símbolo seleccionado' };

    const bounds = calculaBoundsInsercion(page);
    const symbol: SymbolLayout = {
      name:         this.sNombreSimbolo,
      bounds,
      fillStyle:    undefined,
      outlineStyle: undefined,
    };
    page.addElement(symbol);
    this._layout.refreshView();
    return { ok: true, symbol };
  }

  // Magik: wm_close — limpia nombre
  wmClose(): true {
    this.sNombreSimbolo = '';
    this.okEnabled = false;
    return true;
  }
}
