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

  // Magik: inicia_layout() — starts layout designer, grabs page + viewport_mapper. Fase 5.
  iniciaLayout(): void { /* Fase 5 */ }

  // Magik: GetMapView(PoGeom) — goto geom on map, return current_map_view. Fase 5.
  getMapView(_geom: unknown): unknown { return undefined /* Fase 5 */ }

  // Magik: genera_plano(PEnlace) — inicia_layout + AddElementos_comunes. Fase 5.
  generaPlano(_enlace?: unknown): void { /* Fase 5 */ }

  // Magik: AddElementos_comunes — AddMarco + AddTitulo + AddSellos. Fase 5.
  addElementosComunes(_enlace?: unknown): void { /* Fase 5 */ }

  // Magik: AddSellos — hook for subclasses (base is empty)
  addSellos(_enlace?: unknown): void { /* empty hook */ }

  // Magik: agrega_simbolo — creates symbol_layout and adds to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }

  // Magik: AddMarco — c_marco 7×3 modules, no fill. Returns marco. Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddTitulo(PoMarco) — c_titulo_de_plano centred in marco. Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: crea_titulo — returns "Titulo" (overridden in subclasses)
  creaTitulo(): string { return 'Titulo' }

  // Magik: asigna_pagina_y_viewport — sets oPage + oViewMapperPlugin. Fase 5.
  asignaPaginaYViewport(_page: unknown, _viewport: unknown): void { /* Fase 5 */ }

  // Magik: AddViewport — c_vp_ruta_de_cables_fo + map_viewport_on_map_view. Fase 5.
  addViewport(_buffer: unknown, _estructuras: unknown, _canalizacion: unknown, _elementos: unknown): void { /* Fase 5 */ }

  // Magik: activa_series — drives layout_series_plugin for trail-based series. Fase 5.
  activaSeries(_buffer: unknown): void { /* Fase 5 */ }
}
