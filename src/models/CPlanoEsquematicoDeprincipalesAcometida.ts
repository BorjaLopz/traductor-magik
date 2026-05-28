// Source: planos_fo/source/ruta_cables/factory/c_plano_esquematico_de_principales_acometida.magik
// Acometida variant of the "Plano Esquemático de Principales" factory.
// Extends CFactoryPlanos (sibling of CPlanoEsquematicoDeprincipales, NOT subclass of it).
// Key differences vs the base variant:
//   - cables_esquema_sigp() returns TWO collections (geoms + GIS records), filtered by :centre_line
//   - genera_plano() buffers geometries by 10 units and drives layout_series at 1:10 scale
//   - add_sellos() places only ONE sello (c_sello_estandar_base_fo, absolute bounds)
//   - add_viewport_principal() uses absolute bounds; does NOT call map_viewport_on_map_view
//   - activa_Layout_series() resets series, sets scale 1:10, plano_esquematico_ftth?=true
// All layout / GIS operations → Fase 5.

import { CFactoryPlanos } from './CFactoryPlanos'
import {
  MARCO_CONFIG,
  NORTE_OFFSET,
  TITULO_OFFSET,
  type BastidorRecord,
  type BastidorCableData,
  buildBastidorCableData,
  creaTitulo,
} from './CPlanoEsquematicoDeprincipales'

// Re-export shared items so the showcase can import from one place
export { MARCO_CONFIG, NORTE_OFFSET, TITULO_OFFSET, creaTitulo, buildBastidorCableData }
export type { BastidorRecord, BastidorCableData }

// ─── Acometida-specific layout constants ──────────────────────────────────────

// add_sellos(): only one sello — absolute bounds
export const SELLO_ACOMETIDA = {
  nombre: 'c_sello_estandar_base_fo',
  bounds: { x0: 267, y0: 279, x1: 3837, y1: 3019 },
} as const

// add_viewport_principal(): fixed absolute bounds
export const VIEWPORT_ACOMETIDA = {
  bounds: { x0: 2346, y0: 826, x1: 8749, y1: 5716 },
  sTipoPlano: 'DIAGRAMA_ESQUEMA_PRINCIPALES',  // note: no "DE" vs the base variant
  name: 'mapa',
} as const

// activa_Layout_series(): scale and behaviour differ from base variant
export const SERIES_CONFIG_ACOMETIDA = {
  scale:               10,           // 1:10 (base variant used 1:1800)
  tilingMethod:        'fewer'       as const,
  angleAreaAutomatic:  true,         // base variant sets this to false
  propertyKey:         'plano_esquematico_ftth?',
  bufferDistance:      10,           // gs.buffer(10)
} as const

// ─── Geometry result from cables_esquema_sigp() ───────────────────────────────

export interface CablesEsquemaResult {
  cablesEsquema: unknown[]   // visible geometry elements (app_type=:centre_line, sheath)
  cablesGis:     unknown[]   // corresponding GIS sheath source records
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

// Magik: genera_plano flow — collects cable geoms, buffers by 10, drives layout series
export function describePlanFlow(): string[] {
  return [
    '1. inicia_layout()',
    '2. oPage.layout_document.user!_tipo_plano ← :esquema_principales',
    '3. loMapa.current_map.trail.clear()',
    '4. add_marco() + addNorte() + add_sellos() + add_viewport_principal()',
    '5. (cablesEsquema, cablesGis) ← cables_esquema_sigp()',
    `6. gs.buffer(${SERIES_CONFIG_ACOMETIDA.bufferDistance}) → oBuffer`,
    '7. loMapa.current_map.set_trail_from_geometry(oBuffer)',
    `8. activa_Layout_series(oBuffer) → scale 1:${SERIES_CONFIG_ACOMETIDA.scale}`,
  ]
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoEsquematicoDeprincipalesAcometida extends CFactoryPlanos {
  protected _oEngine:     unknown = undefined
  protected _oBufferRuta: unknown = undefined
  oMarco:                 unknown = undefined

  constructor(oEngine?: unknown) {
    super()
    this._oEngine = oEngine
  }

  // Magik: cables_esquema_sigp() — dual return: geom elements + GIS records.
  // Filters visible geometry on :gs!schematic ace where source=:sheath AND app_type=:centre_line.
  // Fase 5.
  cablesEsquemaSigp(): CablesEsquemaResult {
    return { cablesEsquema: [], cablesGis: [] } /* Fase 5 */
  }

  // Magik: genera_plano — init layout, add elements, buffer cables by 10, drive series. Fase 5.
  generaPlano(_cable?: unknown, _enlace?: unknown): void {
    // See describePlanFlow() for the complete sequence
  }

  // Magik: activa_Layout_series(PoBuffer) — layout series at 1:10, resets first. Fase 5.
  activaLayoutSeries(_buffer: unknown): void { /* Fase 5 */ }

  // Magik: add_marco() — c_marco(0,0,1,1), largo=4, alto=2. Identical to base variant. Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddNorte() — c_norte at page top-left. Identical to base variant. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_sellos() — only c_sello_estandar_base_fo at absolute bounds. Fase 5.
  addSellos(): void { /* Fase 5 */ }

  // Magik: add_viewport_principal() — absolute bounds; no map_viewport_on_map_view call. Fase 5.
  addViewportPrincipal(): void { /* Fase 5 */ }

  // Magik: AddParticulares() — empty subclass hook
  addParticulares(): void { /* intentionally empty */ }

  // Magik: crea_titulo — same title string as base variant
  creaTitulo(centralNombre = ''): string { return creaTitulo(centralNombre) }

  // Magik: AddTitulo(PoMarco) — same offset as base variant. Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: busca_bastidores() — equality_set of mit_bay from visible geometry. Fase 5.
  buscaBastidores(): BastidorRecord[] { return [] /* Fase 5 */ }

  // Magik: add_sello_tabla_equivalencias_x_cable() — same logic as base variant. Fase 5.
  addSelloTablaEquivalenciasXCable(): void { /* Fase 5 */ }

  // Magik: agrega_simbolo(nombre, bounds) — symbol_layout added to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }
}
