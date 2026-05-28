// Source: adiciones_layout/source/Corte/c_Corte_Geografico.magik
// Geographic cut layout element. Draws a viewport mapped to the current map view,
// then renders the start element's route and surrounding landbase geometries
// (colonias, lots, districts) within a 500 000-unit buffer.
// Extends layout_element + layout_element_mixin + viewport_layout_mixin.
// All GIS/canvas calls → Fase 5.

// ─── Geometry layer descriptor ────────────────────────────────────────────────
// Mirrors c_Tipo_Geom instances used in Dibuja_Corte.

export interface GeomLayer {
  dataset:  string   // GIS dataset name, e.g. "landbase"
  tabla:    string   // collection name
  tipoGeom: string   // geometry field name
}

// Fixed set of layers drawn for the geographic cut.
export const CORTE_GEOMETRIAS: readonly GeomLayer[] = [
  { dataset: 'landbase', tabla: 'colonia',        tipoGeom: 'limite'                },
  { dataset: 'landbase', tabla: 'user!_lote',     tipoGeom: 'user!_lote_linea'      },
  { dataset: 'landbase', tabla: 'user!_distrito', tipoGeom: 'user!_limite_distrito' },
]

// ─── Viewport geometry ────────────────────────────────────────────────────────

export const VIEWPORT_BOUNDS = { x0: 200, y0: 200, x1: 1500, y1: 1500 } as const
export const VIEWPORT_NAME   = 'Viewport 1'
export const BUFFER_DISTANCIA = 500_000   // units — passed to dibuja_contenido_en_buffer

// ─── Route draw parameters ────────────────────────────────────────────────────
// Passed to dibuja_geometria_en_viewport for the oRwoArranque route.

export const RUTA_DRAW_PARAMS = {
  esRuta:          true,
  tipoGeom:        'route'  as const,
  estilo:          'linea'  as const,
  color:           'blue'   as const,
  grosor:          3,
  etiquetaActiva:  true,
  colorEtiqueta:   'blue'   as const,
  campoEtiqueta:   'spec_id' as const,
  tamanoEtiqueta:  8,
} as const

// ─── Defined attribute values ─────────────────────────────────────────────────

// Attribute Dibuja_Calles?: string, enum, default "Si", on properties page.
// Opciones() returns ["No", "Si"] for the combo box.
export const DIBUJA_CALLES_OPCIONES = ['No', 'Si'] as const
export type DibujaCallesValue = 'Si' | 'No'

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: Opciones() — returns the enum list for the Dibuja_Calles? combo.
export function opciones(): string[] {
  return [...DIBUJA_CALLES_OPCIONES]
}

// Magik: draw_content_on guard — only draw when Dibuja_Calles? = "Si".
export function debesDibujar(dibujaCalles: DibujaCallesValue): boolean {
  return dibujaCalles === 'Si'
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CCorteGeografico {
  // Slots
  oApp:          unknown = undefined   // PNI application — Fase 5
  oAppLayout:    unknown = undefined   // layout_designer plugin(:viewport_mapper)
  oRwoArranque:  unknown = undefined   // start GIS element (has .route geometry)
  oMapPlugin:    unknown = undefined   // plugin(:map_plugin)

  // Defined attribute — on properties page, enum Dibuja_Calles?
  dibujaCalles: DibujaCallesValue = 'Si'

  // Magik: depends_on?(another) → _super(viewport_layout_mixin).depends_on?(another)
  dependsOn(_another: unknown): boolean { return false /* Fase 5 */ }

  // Magik: initialise_for_page → connect_to_first_viewport_on_page. Fase 5.
  initialiseForPage(_page: unknown): void { /* Fase 5 */ }

  // Magik: Dibuja_Corte — creates viewport, maps current view, draws route and layers. Fase 5.
  dibujaCorte(_window: unknown): void {
    // 1. viewport_layout.new_with(:bounds, VIEWPORT_BOUNDS), no fill/outline
    // 2. layout_page.add_element(viewport)
    // 3. oMapPlugin.current_map_view; set ace_name = "OCULTOS"
    // 4. oAppLayout.plugin(:viewport_mapper).map_viewport_on_map_view(...)
    // 5. dibuja_geometria_en_viewport(window, oRwoArranque, VIEWPORT_NAME, ...) with RUTA_DRAW_PARAMS
    // 6. for each layer in CORTE_GEOMETRIAS:
    //      dibuja_contenido_en_buffer(window, VIEWPORT_NAME, oRwoArranque.route,
    //                                 true, BUFFER_DISTANCIA, layer.dataset, layer.tabla, layer.tipoGeom, :linea)
  }

  // Magik: draw_content_on — fires on view refresh; guards with Dibuja_Calles?. Fase 5.
  drawContentOn(_window: unknown): void {
    if (debesDibujar(this.dibujaCalles)) {
      this.dibujaCorte(_window)
    }
  }
}
