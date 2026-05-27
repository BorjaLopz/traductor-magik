// Source: planos_fo/source/ruta_cables/factory/c_plano_esquematico_de_principales_ftth.magik
// FTTH variant of the "Plano Esquemático de Principales" factory.
// Extends CFactoryPlanos directly (sibling of the base, FAL, and Acometida variants).
//
// Key differences vs all siblings:
//   - add_marco(): largo=7, alto=3 (all others use 4×2)
//   - crea_titulo(): pulls title data from gen_planos plugin (cable, programa, NCO, geo coords)
//   - AddTitulo(): uses ABSOLUTE bounds (12892,459,15135,1325) — not marco-relative
//   - add_sellos(): same ONE sello as acometida (c_sello_estandar_base_fo, absolute)
//   - add_viewport_principal(): absolute bounds (5225,325,15189,8435); DOES call map_viewport_on_map_view
//   - activa_Layout_series(): same as acometida but view_scale is commented out (no scale set)
//   - busca_bastidores(): uses gen_planos.busca_en_conectividad(mit_bay), not visible geometry

import { CFactoryPlanos } from './CFactoryPlanos'
import {
  type BastidorRecord,
  type BastidorCableData,
  buildBastidorCableData,
} from './CPlanoEsquematicoDeprincipales'

export { buildBastidorCableData }
export type { BastidorRecord, BastidorCableData }

// ─── FTTH-specific layout constants ──────────────────────────────────────────

// add_marco(): 7×3 format — wider than all other variants (4×2)
export const MARCO_CONFIG_FTTH = {
  bounds: { x0: 0, y0: 0, x1: 1, y1: 1 },
  largo: 7,
  alto:  3,
} as const

// AddTitulo(): absolute page coordinates — independent of marco
export const TITULO_BOUNDS_FTTH = { x0: 12892, y0: 459, x1: 15135, y1: 1325 } as const

// add_sellos(): identical to acometida — one sello at absolute bounds
export const SELLO_FTTH = {
  nombre: 'c_sello_estandar_base_fo',
  bounds: { x0: 267, y0: 279, x1: 3837, y1: 3019 },
} as const

// add_viewport_principal(): absolute bounds; wider than acometida's (2346→5225 left edge)
export const VIEWPORT_FTTH = {
  bounds:      { x0: 5225, y0: 325, x1: 15189, y1: 8435 },
  sTipoPlano:  'DIAGRAMA_ESQUEMA_PRINCIPALES',
  name:        'mapa',
} as const

// activa_Layout_series(): same as acometida but view_scale intentionally absent
// (the `l_series.action(:view_scale).set_value(100, _true)` line is commented out in Magik)
export const SERIES_CONFIG_FTTH = {
  tilingMethod:        'fewer' as const,
  angleAreaAutomatic:  true,
  propertyKey:         'plano_esquematico_ftth?',
  bufferDistance:      10,
} as const

// ─── Title data ───────────────────────────────────────────────────────────────

// crea_titulo() assembles data from several GIS objects via the gen_planos plugin.
export interface TituloFtthData {
  cableNombre:    string   // gen_planos.o_ruta_sigp[:ocables].an_element().name
  programa:       string   // prj.user!_programa + " " + prj.user!_programa_anyo
  subprograma:    string   // prj.job_title
  ncoNombre:      string   // nodo.datos_nco[0]
  ncoSiglas:      string   // nodo.datos_nco[1]
  estado:         string   // nodo.location.coordinate.estado_txt()
  municipio:      string   // nodo.location.coordinate.municipio_txt()
  numTrayectoria: string   // nodo.location.coordinate.trayectoria_txt
}

// Pure-function equivalent of crea_titulo() — returns UPPERCASE multiline string.
export function creaTituloFtth(data: TituloFtthData): string {
  return (
    `PROGRAMA ${data.programa}\n` +
    `NCO ${data.ncoNombre}(${data.ncoSiglas})\n` +
    `TRAYECTORIA ${data.numTrayectoria}\n` +
    `ESQUEMATICO DE PRINCIPALES \n` +
    `${data.cableNombre}\n` +
    `${data.subprograma}\n` +
    `${data.municipio},${data.estado}`
  ).toUpperCase()
}

// ─── Geometry result from cables_esquema_sigp() ───────────────────────────────

export interface CablesEsquemaResult {
  cablesEsquema: unknown[]   // visible geom elements (app_type=:centre_line, source=:sheath)
  cablesGis:     unknown[]   // corresponding GIS sheath source records
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoEsquematicoDeprincipalesFtth extends CFactoryPlanos {
  protected _oEngine:     unknown = undefined
  protected _oBufferRuta: unknown = undefined
  oMarco:                 unknown = undefined

  constructor(oEngine?: unknown) {
    super()
    this._oEngine = oEngine
  }

  // Magik: cables_esquema_sigp() — dual return: geom elements + GIS records.
  // Same filter as acometida: source=:sheath AND app_type=:centre_line. Fase 5.
  cablesEsquemaSigp(): CablesEsquemaResult {
    return { cablesEsquema: [], cablesGis: [] } /* Fase 5 */
  }

  // Magik: genera_plano — same buffer-10 + layout series flow as acometida. Fase 5.
  generaPlano(_cable?: unknown, _enlace?: unknown): void { /* Fase 5 */ }

  // Magik: activa_Layout_series(PoBuffer) — same as acometida but NO explicit view_scale. Fase 5.
  activaLayoutSeries(_buffer: unknown): void { /* Fase 5 */ }

  // Magik: add_marco() — largo=7, alto=3 (DIFFERS from all other variants). Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddNorte() — same relative-to-page-top-left as base variant. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_sellos() — sets user!_tipo_plano then adds one sello. Same as acometida. Fase 5.
  addSellos(): void { /* Fase 5 */ }

  // Magik: add_viewport_principal() — absolute bounds; calls map_viewport_on_map_view. Fase 5.
  addViewportPrincipal(): void { /* Fase 5 */ }

  // Magik: crea_titulo — GIS-driven multiline title (gen_planos plugin). Use creaTituloFtth(). Fase 5.
  creaTitulo(data?: TituloFtthData): string {
    return data ? creaTituloFtth(data) : ''
  }

  // Magik: AddTitulo(PoMarco) — absolute bounds (12892,459,15135,1325). Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: busca_bastidores() — gen_planos.busca_en_conectividad(mit_bay). Fase 5.
  buscaBastidores(): BastidorRecord[] { return [] /* Fase 5 */ }

  // Magik: add_sello_tabla_equivalencias_x_cable() — same logic as siblings. Fase 5.
  addSelloTablaEquivalenciasXCable(): void { /* Fase 5 */ }

  // Magik: agrega_simbolo(nombre, bounds) — symbol_layout added to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }
}
