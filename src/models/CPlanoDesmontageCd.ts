// Source: adiciones_layout/source/planos/c_plano_desmontaje_cd.magik
// Plan generator for "desmontaje de caja de distribución" (CD dismount plan).
// Extends layout_element + viewport_layout_mixin (Magik multiple inheritance).
// Orchestrates three elements on a layout page: marco (frame), sello (stamp),
// and mapa (viewport). All GIS / Layout Designer calls → Fase 5.

// ─── Bounding box type ────────────────────────────────────────────────────────

export interface BBox {
  x0: number; y0: number
  x1: number; y1: number
}

export function bboxWidth(b: BBox):  number { return b.x1 - b.x0 }
export function bboxHeight(b: BBox): number { return b.y1 - b.y0 }

// ─── Layout element positions ─────────────────────────────────────────────────
// All values in layout-designer coordinate units.

export const BOUNDS_MARCO  = { x0: 0,    y0: 0,   x1: 1,    y1: 1    } satisfies BBox  // placeholder; Largo=3, Alto=1 overrides
export const BOUNDS_SELLO  = { x0: 420,  y0: 0,   x1: 3600, y1: 2920 } satisfies BBox
export const BOUNDS_MAPA   = { x0: 2540, y0: 270, x1: 6600, y1: 2920 } satisfies BBox

// Marco configuration (c_marco slots set after creation)
export const MARCO_LARGO = 3   // modules wide
export const MARCO_ALTO  = 1   // modules tall

// Page coordinate space extents (union of all elements)
export const PAGE_WIDTH  = 6600
export const PAGE_HEIGHT = 2920

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: mapa — viewport scale calculation.
//   If |viewAngle| > 0.1° → use map view's own view_scale directly.
//   Else → fit scale = min(viewW/expandedVpW, viewH/expandedVpH) × unitFactor
//   where expanded = viewport bounds enlarged 10% (new_enlarging(0.10)).
export function calcularEscalaVista(
  viewWidth:      number,
  viewHeight:     number,
  viewportWidth:  number,
  viewportHeight: number,
  viewAngle:      number,   // degrees
  mapViewScale:   number,   // fallback when rotated
  unitFactor      = 1.0,    // app_cs.unit_factor, default 1
): number {
  if (Math.abs(viewAngle) > 0.1) return mapViewScale
  const expandedW = viewportWidth  * 1.1   // new_enlarging(0.10) ≈ +10%
  const expandedH = viewportHeight * 1.1
  return Math.min(viewWidth / expandedW, viewHeight / expandedH) * unitFactor
}

// Mapa step: resolves which display style name to use.
// Magik: display_styles loop — finds item whose scale_id matches current style.
// Falls back to first style in list if no match.
export function resolveDisplayStyle(
  displayStyles: Array<{ name: string; scaleId: string }>,
  currentStyleName: string,
): string {
  const match = displayStyles.find(s => s.scaleId === currentStyleName)
  return match ? match.name : (displayStyles[0]?.name ?? '')
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoDesmontageCd {
  static readonly ALLOWED_ON_MENU = false

  // Slot: PNI application handle — Fase 5
  app: unknown = undefined

  // Magik: new() + init() — D2: merged into constructor
  constructor() {
    // .app << smallworld_product.pni_application()  — Fase 5
  }

  // Magik: defined_attributes — adds viewport_attribute_definition from mixin. Fase 5.
  // (viewport_layout_mixin provides viewport attribute definitions)

  // Magik: genera_plano — gets layout designer, clears current page,
  // then calls marco(), sello(), mapa() in sequence. Fase 5.
  generaPlano(): void {
    // 1. plugin(:layout_plugin).start_layout_designer()
    // 2. LoDoc.current_page
    // 3. if page.elements.size > 0 → page.elements.empty()
    // 4. this.marco(page)
    // 5. this.sello(page)
    // 6. this.mapa(page)
  }

  // Magik: marco — adds c_marco(Largo=3, Alto=1) to page. Fase 5.
  marco(_page: unknown): void {
    // c_marco.new_with(:bounds, BOUNDS_MARCO)
    // .Largo = MARCO_LARGO; .Alto = MARCO_ALTO
    // .set_fill_colour(undefined)
    // page.add_element(marco)
  }

  // Magik: sello — adds c_sello_proyecto_canalizacion to page. Fase 5.
  sello(_page: unknown): void {
    // c_sello_proyecto_canalizacion.new_with(:bounds, BOUNDS_SELLO)
    // .Inicializa()
    // page.add_element(sello)
  }

  // Magik: mapa — adds viewport_layout to page, copies current map view params.
  // If viewport.mapped? = false: sets centre, view_scale (via calcularEscalaVista),
  // view_angle, ace_name, display_style, projection, coordinate_system. Fase 5.
  mapa(_page: unknown): void {
    // viewport_layout.new_with(:bounds, BOUNDS_MAPA)
    // if not mapped: copy view params from current_map_view
    //   scale = calcularEscalaVista(...)
    //   display_style = resolveDisplayStyle(...)
    // page.add_element(viewport)
  }
}
