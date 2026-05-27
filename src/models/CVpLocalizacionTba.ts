// Source: planos_fo/source/montaje_tba/factory/c_vp_localizacion_tba.magik
// (defines class c_vp_localizacion_tba)
// Viewport layout for TBA (Terminal de Banda Ancha) location croquis.
// Extends viewport_layout (GIS — not yet migrated).
// LoGeom / LoGeomTxt: property_list constants mapping collection name → geometry field.
// agregar_estructuras: fetches structure geometry + circle(r=6000) + annotation geoms.
// geometry_set_for_render: super + agregarEstructuras() composed into composite_geometry_set.
// initialise_for_page: fixed ACE/style/scale, no pattern matching.
// Note: tamanio is inherited from viewport_layout (not defined locally).

// Maps collection name → geometry field name (for geometry extraction)
export const LO_GEOM: ReadonlyMap<string, string> = new Map([
  ['user!_building',         'boundary'],
  ['building',               'location'],
  ['mit_terminal_enclosure', 'location'],
  ['user!_eje_calle',        'user!_anotacion'],
  ['underground_route',      'route'],
  ['user!_manzana',          'user!_limite'],
])

// Maps collection name → annotation geometry field name
export const LO_GEOM_TXT: ReadonlyMap<string, string> = new Map([
  ['mit_terminal_enclosure', 'annotation_2'],
  ['user!_building',         'annotation_1'],
])

// Collections filtered in geometry_set_for_render (.select(:collection, ...))
export const COLECCIONES_GEO: readonly string[] = [
  'user!_eje_calle',
  'user!_building',
  'building',
  'mit_terminal_enclosure',
  'user!_tba_anotacion',
  'user!_manzana',
]

export class CVpLocalizacionTba {
  // Slot (writable, public)
  oEstructura: unknown = undefined

  // define_shared_constant (immutable)
  static readonly ALLOWED_ON_MENU = false
  static readonly TITULO = 'Croquis de Localización de la Terminal de Banda Ancha'

  // viewport_layout fields (GIS parent — Fase 5)
  bounds               = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
  aceName:               string = ''
  styleSystemCategory:   string = ''
  viewScale:             number = 1
  displayStyle:          string = ''

  // Sets fixed ACE/style config; view_scale=2500 (TBA croquis scale)
  initialiseForPage(page: unknown): void {
    this.aceName             = 'CENT_PLANOS'
    this.styleSystemCategory = 'plano'
    this.viewScale           = 2500
    this.displayStyle        = '5 000 - 10 000'
    this.agregarTitulo(page)
  }

  // Fase 5: builds geometry_set with:
  //   - structure_geometry() of oEstructura
  //   - circle(coord, 6000) if structure responds to :coord
  //   - annotation geometry via LO_GEOM_TXT[collection.name]
  //   - extra geometry via LO_GEOM[collection.name]
  agregarEstructuras(): unknown {
    // if oEstructura is unset, init from this.elementosBdGis.an_element()
    // loest.add(estructura.structure_geometry())
    // if responds_to?(:coord) → loest.add(circle.new(geo.coord, 6000))
    // loest.add(LoGeomTxt[collection.name] geometry)
    // loest.add(LoGeom[collection.name] geometry)
    return undefined
  }

  // Fase 5: !current_coordinate_system! << _unset
  //         super.geometry_set_for_render filtered to COLECCIONES_GEO
  //         + agregarEstructuras() (with style from super result)
  //         → composite_geometry_set.new_with(filtered, estructuras)
  get geometrySetForRender(): unknown {
    return undefined
  }

  // Fase 5: delegates entirely to super — no additional content rendered
  drawContentOn(_windows: unknown): void { /* super.draw_content_on(windows) */ }

  // Creates c_titulo_de_plano in 100-unit strip immediately below bounds.ymin
  // bounds: { xmin, ymin: this.bounds.ymin−100, xmax, ymax: this.bounds.ymin }
  // font: bold, fontSize=tamanio (inherited), text=TITULO, wrap=false, centre/centre, left_right
  agregarTitulo(_page: unknown): void {
    // Fase 5: new CTituloDePlano({
    //   bounds:          { xmin: this.bounds.xmin, ymin: this.bounds.ymin - 100,
    //                      xmax: this.bounds.xmax, ymax: this.bounds.ymin },
    //   fontName:        'bold',
    //   fontSize:        this.tamanio,  // inherited from viewport_layout
    //   text:            CVpLocalizacionTba.TITULO,
    //   wrap:            false,
    //   alignHorizontal: 'centre',
    //   alignVertical:   'centre',
    //   orientation:     'left_right',
    // })
    // _page.add_element(titulo)
  }
}
