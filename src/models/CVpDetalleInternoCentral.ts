// Source: planos_fo/source/detalles_construccion/factory/c_vp_detalle_interno_central.magik
// Viewport layout for internal detail views of central buildings.
// Extends viewport_layout (GIS — not yet migrated).
// Renders internal building geometry with a title rendered below the viewport bounds.
// Shared constant tamanio=7 (title font size).
// Shared variables titulo (text) and window (GIS render target).
// initialiseForPage() is the only method with pure logic — all others are Fase 5.

export type AceName =
  | 'isometrico'
  | 'vista_frontal'
  | 'vista_de_planta'
  | 'splice_closure_view'
  | 'mit_floor_internal'

export interface VpBounds {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  centre: { x: number; y: number }
}

export class CVpDetalleInternoCentral {
  // Slot (writable, public)
  oResulSet: unknown = undefined

  // define_shared_constant
  static readonly ALLOWED_ON_MENU = false
  static readonly TAMANIO = 7  // title font point size

  // define_shared_variable (class-level mutable state, shared across instances)
  static titulo: string = ''
  static window: unknown = undefined

  // viewport_layout fields (GIS parent — Fase 5)
  name:         string | undefined = undefined
  bounds:       VpBounds = { xmin: 0, ymin: 0, xmax: 0, ymax: 0, centre: { x: 0, y: 0 } }
  aceName:      AceName = 'mit_floor_internal'
  displayStyle: string = 'Auto'
  viewScale:    number = 1

  // Fase 5: navigates map to first CWDM splice closure, maps viewport on map view
  actualizarDatos(): void { /* TODO(GIS) */ }

  // Creates c_titulo_de_plano at (xmin, ymin−300)..(xmax, ymin−100) and adds to page
  // Font: bold, fontSize=TAMANIO, text=titulo, centre/centre, left_right orientation
  agregarTitulo(_page: unknown): void {
    // Fase 5: new CTituloDePlano({
    //   bounds:           { xmin: this.bounds.xmin, ymin: this.bounds.ymin - 300,
    //                       xmax: this.bounds.xmax,  ymax: this.bounds.ymin - 100 },
    //   fontName:         'bold',
    //   fontSize:         CVpDetalleInternoCentral.TAMANIO,
    //   text:             CVpDetalleInternoCentral.titulo,
    //   wrap:             false,
    //   alignHorizontal:  'centre',
    //   alignVertical:    'centre',
    //   orientation:      'left_right',
    // })
    // _page.add_element(titulo)
  }

  // Fase 5: super.draw_content_on(windows) + draws this.name uppercase split-by-newline
  // Style: Arial 210pt, bold, underlined, black, bottom_centre, step=120 units per line
  drawContentOn(_windows: unknown): void { /* TODO(GIS) */ }

  // Getter: calls super.geometry_set_for_render, stores result in oResulSet
  get geometrySetForRender(): unknown {
    // Fase 5: this.oResulSet = super.geometry_set_for_render (clears !current_coordinate_system!)
    return this.oResulSet
  }

  // Sets aceName / displayStyle / viewScale based on name pattern matching (pure logic)
  initialiseForPage(_page: unknown): void {
    const lower = this.name?.toLowerCase() ?? ''
    if      (lower.includes('isometrico'))       { this.aceName = 'isometrico';          this.displayStyle = 'Auto' }
    else if (lower.includes('vista frontal'))     { this.aceName = 'vista_frontal';       this.displayStyle = 'Auto' }
    else if (lower.includes('vista de planta'))   { this.aceName = 'vista_de_planta';     this.displayStyle = 'Auto' }
    else if (lower.endsWith('cwdm'))              { this.aceName = 'splice_closure_view'; this.displayStyle = 'Auto'; this.viewScale = 12500 }
    else                                          { this.aceName = 'mit_floor_internal' }
  }

  // Fase 5: returns splice_closures where user!_marc_cierre_emp="FIST" AND spec_id="CIERRE FIST"
  // from the currently visible geometry set in the active map view
  obtenerEmpalmesConCWDMs(): unknown[] { return [] }
}
