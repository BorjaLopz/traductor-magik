// Source: planos_fo/source/detalles_construccion/factory/c_localizacion_central.magik
// (defines class c_vp_localizacion_central)
// Viewport layout for the central location overview (croquis de localización).
// Extends viewport_layout (GIS — not yet migrated).
// All constants are define_shared_constant (immutable, unlike c_vp_detalle_interno_central).
// initialiseForPage sets fixed ACE/style values — no pattern matching.
// geometrySetForRender filters GIS geometry to three collections only.
// draw_content_on delegates entirely to super (no custom rendering).
// agregarTitulo places a 100-unit title strip immediately below viewport ymin.

export const COLECCIONES_GEO: readonly string[] = [
  'user!_manzana',   // city blocks
  'building',        // buildings
  'user!_eje_calle', // street axes
]

export class CVpLocalizacionCentral {
  // Slot (writable, public)
  oResulSet: unknown = undefined

  // define_shared_constant (immutable — unlike the shared_variables in c_vp_detalle_interno_central)
  static readonly TITULO         = 'Croquis de Localización de la Central'
  static readonly TAMANIO        = 8
  static readonly ALLOWED_ON_MENU = false

  // viewport_layout fields (GIS parent — Fase 5)
  bounds               = { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }
  aceName:               string = ''
  styleSystemCategory:   string = ''
  displayStyle:          string = ''

  // Sets fixed ACE config and delegates title creation — no pattern matching
  initialiseForPage(page: unknown): void {
    this.aceName             = 'CENT_PLANOS'
    this.styleSystemCategory = 'plano'
    this.displayStyle        = '3 000 - 5 000'
    this.agregarTitulo(page)
  }

  // Fase 5: super.geometry_set_for_render filtered to COLECCIONES_GEO
  // Clears !current_coordinate_system! before calling super (GIS dynamic var)
  get geometrySetForRender(): unknown {
    // Fase 5: this.oResulSet = super.geometry_set_for_render
    //           .select(:collection, COLECCIONES_GEO)
    return this.oResulSet
  }

  // Fase 5: delegates entirely to super — no additional content rendered
  drawContentOn(_windows: unknown): void { /* super.draw_content_on(windows) */ }

  // Creates c_titulo_de_plano in a 100-unit strip immediately below bounds.ymin
  // bounds: { xmin, ymin: this.bounds.ymin−100, xmax, ymax: this.bounds.ymin }
  // font: bold, fontSize=TAMANIO, text=TITULO, wrap=false, centre/centre, left_right
  agregarTitulo(_page: unknown): void {
    // Fase 5: new CTituloDePlano({
    //   bounds:          { xmin: this.bounds.xmin, ymin: this.bounds.ymin - 100,
    //                      xmax: this.bounds.xmax,  ymax: this.bounds.ymin },
    //   fontName:        'bold',
    //   fontSize:        CVpLocalizacionCentral.TAMANIO,
    //   text:            CVpLocalizacionCentral.TITULO,
    //   wrap:            false,
    //   alignHorizontal: 'centre',
    //   alignVertical:   'centre',
    //   orientation:     'left_right',
    // })
    // _page.add_element(titulo)
  }
}
