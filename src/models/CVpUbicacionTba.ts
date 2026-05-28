// Source: planos_fo/source/montaje_tba/factory/c_vp_ubicacion_tba.magik
// (defines class c_vp_ubicacion_tba)
// Viewport layout for TBA (Terminal de Banda Ancha) location detail.
// Extends viewport_layout (GIS — not yet migrated).
// LoGeom / LoGeomTxt: property_list constants mapping collection name → geometry field.
// agregar_elementos: iterates oElementos, pulls geometry + annotation for each element.
// geometry_set_for_render: super filtered to COLECCIONES_GEO + agregarElementos() composed into composite_geometry_set.
// initialise_for_page: only adds title, no ACE/scale config.
// Note: tamanio is inherited from viewport_layout (not defined locally).

// Maps collection name → geometry field name (for geometry extraction)
export const LO_GEOM: ReadonlyMap<string, string> = new Map([
  ['user!_tba_anotacion', 'user!_ubicacion'],
  ['splice_closure',      'user!_posicion_interna'],
  ['figure_eight',        'user!_detalle'],
])

// Maps collection name → annotation geometry field name
export const LO_GEOM_TXT: ReadonlyMap<string, string> = new Map([
  ['user!_tba_anotacion', 'user!_anotacion'],
])

// Collections filtered in geometry_set_for_render (.select(:collection, ...))
export const COLECCIONES_GEO: readonly string[] = [
  'user!_manzana',
  'access_point',
  'mit_terminal_enclosure',
  'user!_eje_calle',
  'pole',
  'mit_presentation_object',
  'uub',
  'underground_route',
  'aerial_route',
  'user!_registro_tablero',
  'mit_room',
  'mit_floor',
  'mdu_route',
]

export class CVpUbicacionTba {
  // Slot (writable, public)
  oElementos: unknown = undefined

  // define_shared_constant (immutable)
  static readonly ALLOWED_ON_MENU = false
  static readonly TITULO = 'Ubicación de la Terminal de Banda Ancha'

  // viewport_layout fields (GIS parent — Fase 5)
  bounds = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
  tamanio: number = 0

  // Fase 5: iterates this.oElementos; for each element:
  //   geomField = LO_GEOM[el.source_collection.name] → el.perform(geomField) → add to set
  //   txtField  = LO_GEOM_TXT[el.source_collection.name] → el.perform(txtField) → add to set
  //   returns geometry_set
  agregarElementos(): unknown {
    // if oElementos is unset, init from this.elementosBdGis via obtenerElementosBdGis()
    // for each el of oElementos:
    //   const geomField = LO_GEOM.get(el.source_collection.name)
    //   if (geomField) loest.add(el.perform(geomField))
    //   const txtField = LO_GEOM_TXT.get(el.source_collection.name)
    //   if (txtField) loest.add(el.perform(txtField))
    return undefined
  }

  // Fase 5: !current_coordinate_system! << _unset
  //         super.geometry_set_for_render filtered to COLECCIONES_GEO
  //         + agregarElementos() (with style from super result)
  //         → composite_geometry_set.new_with(filtered, elementos)
  //         Saves visualization once (elementos_modificados guard via CGuardaObjetosVp)
  get geometrySetForRender(): unknown {
    return undefined
  }

  // Delegates entirely to super — no additional content rendered
  drawContentOn(_windows: unknown): void { /* super.draw_content_on(windows) */ }

  // Returns rope from super.defined_attributes
  get definedAttributes(): unknown {
    return undefined
  }

  // Creates c_titulo_de_plano in 100-unit strip immediately below bounds.ymin
  // bounds: { xmin, ymin: this.bounds.ymin−100, xmax, ymax: this.bounds.ymin }
  // font: bold, fontSize=tamanio (inherited), text=TITULO, wrap=false, centre/centre, left_right
  agregarTitulo(_page: unknown): void {
    // Fase 5: new CTituloDePlano({
    //   bounds:          { xmin: this.bounds.xmin, ymin: this.bounds.ymin - 100,
    //                      xmax: this.bounds.xmax, ymax: this.bounds.ymin },
    //   fontName:        'bold',
    //   fontSize:        this.tamanio,
    //   text:            CVpUbicacionTba.TITULO,
    //   wrap:            false,
    //   alignHorizontal: 'centre',
    //   alignVertical:   'centre',
    //   orientation:     'left_right',
    // })
    // _page.add_element(titulo)
  }

  // Sets title on the layout page
  initialiseForPage(page: unknown): void {
    this.agregarTitulo(page)
  }
}
