// Source: planos_fo/source/ruta_cables/factory/c_factory_planos.magik
// Base factory class for all layout plan generators.
// Owns the layout page, layout manager, and viewport mapper plugin.
// All interactions with the layout designer → Fase 5.

export const PAGE_SIZE = { width: 12400, height: 8400 } as const  // 84cm × 124cm

export interface PageBounds {
  xmin: number; ymin: number; xmax: number; ymax: number
}

export class CFactoryPlanos {
  protected _oPage:             unknown = undefined
  protected _oBuffer:           unknown = undefined
  protected _oLayoutManager:    unknown = undefined
  protected _oViewMapperPlugin: unknown = undefined

  // Magik: inicia_layout() — starts layout_plugin.start_layout_designer(), pulls
  // layout_manager + viewport_mapper from dialogs[:layout_designer].
  // Raises :user_error if current page is non-empty (one plan at a time).
  // Sets paper size to 12400×8400 (124cm wide × 84cm tall). Fase 5.
  iniciaLayout(): void { /* Fase 5 */ }

  // Magik: GetMapView(PoGeom) — if geom defined, calls map_view.goto(geom) then re-fetches
  // current_map_view; if unset, returns current_map_view unchanged. Fase 5.
  getMapView(_geom: unknown): unknown { return undefined /* Fase 5 */ }

  // Magik: genera_plano(PEnlace) — inicia_layout + AddElementos_comunes. Fase 5.
  generaPlano(_enlace?: unknown): void { /* Fase 5 */ }

  // Magik: AddElementos_comunes — AddMarco + AddTitulo + AddSellos. Fase 5.
  addElementosComunes(_enlace?: unknown): void { /* Fase 5 */ }

  // Magik: AddSellos — hook for subclasses (base is empty)
  addSellos(_enlace?: unknown): void { /* empty hook */ }

  // Magik: agrega_simbolo — creates symbol_layout and adds to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }

  // Magik: AddMarco — new CMarco at bounds(0,0,1,1), Largo=7, Alto=3, fill=unset. Returns marco. Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddTitulo(PoMarco) — CTituloDePlano at:
  //   bounds: (marco.xmax-2200, marco.ymin+400, marco.xmax-200, marco.ymin+1200)
  //   font_name="bold", font_size=8, fill=unset, outline=unset
  //   wrap=false, align_horizontal=:centre, align_vertical=:centre, orientation=:left_right
  // Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: crea_titulo — returns "Titulo" (overridden in subclasses)
  creaTitulo(): string { return 'Titulo' }

  // Magik: asigna_pagina_y_viewport — sets oPage + oViewMapperPlugin. Fase 5.
  asignaPaginaYViewport(_page: unknown, _viewport: unknown): void { /* Fase 5 */ }

  // Magik: AddViewport(buffer, estructuras, canalizacion, elementos) — guard: oPage is layout_page.
  //   bounds: (page.xmax-10000, page.ymax-7000, page.xmax-500, page.ymax-500)
  //   Creates CVpRutaDeCablesFo with buffer+estructuras+canalizacion+elementos,
  //   outline=unset, fill=unset, trail=false, selection=false, post_render=false.
  //   Sets viewport.tamanio_buffer=this.longitud_buffer, name="mapa", fijar_configuracion="Si".
  //   Sets layout_document.user!_tipo_plano=:ruta_cables_fo.
  //   map_viewport_on_map_view call is commented out in source (pending). Fase 5.
  addViewport(_buffer: unknown, _estructuras: unknown, _canalizacion: unknown, _elementos: unknown): void { /* Fase 5 */ }

  // Magik: activa_series(PoBuffer) — full layout_series_plugin setup:
  //   1. Sets map trail from PoBuffer geometry and reverses it.
  //   2. Starts layout_designer, sets busy=true.
  //   3. Calls asigna_pagina_y_viewport(l_series.master_series_page(), viewport_mapper).
  //   4. Sets propiedades_plano_ruta = { plano_ruta?: true, areas_ruta: [PoBuffer] }.
  //   5. Actions: data_source=:current_trail, angle_area_automatic=false,
  //      tiling_method=:fewer, view_scale=1800.
  //   6. Calls set_master_series_page() + create_and_edit_series().
  //   7. Adds self as dependent of l_series. Fase 5.
  activaSeries(_buffer: unknown): void { /* Fase 5 */ }
}
