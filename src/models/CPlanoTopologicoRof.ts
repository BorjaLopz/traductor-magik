// Source: planos_fo/source/detalles_construccion/factory/c_plano_topologico_rof.magik
// ROF topological plan factory. Extends CFactoryDetalles (NOT CFactoryPlanos directly).
// Unrelated to the adiciones_layout CPlanoTopologico (copper conduit map).
//
// Key ROF-specific behaviour:
//   - genera_plano(elemento, enlace, empalmes):
//       sets gen_planos.o_enlace → _super.genera_plano(elemento, enlace)
//       → AddSellosDetalles() [ROF method, distinct from base AddSellosPlanoDetalles()]
//       → layout_view_home_view action
//   - AddSellosDetalles(): 4 sellos (2 conditional) + AddNorte + add_viewport_principal
//   - AddNorte(): 1000-wide (same as ROF Principales and TBA)
//   - add_viewport_principal(): absolute bounds, scale 1:10000, uses geoms.bounds for mapping
//   - crea_titulo(): overrides base — programa+cable+"PLANO TOPOLOGICO"+NCO+titleCtls+fecha
//     (nearly identical to CPlanoEsquematicoDeprincipalesRof.crea_titulo but with TOPOLOGICO)
//   - No overrides of AddSellosPlanoDetalles() — that base hook stays empty

import { CFactoryDetalles, type DetallesEngine } from './CFactoryDetalles'
import {
  type CentralRofRecord,
  buildTitleCtls,
} from './CPlanoEsquematicoDeprincipalesRof'

export { buildTitleCtls }
export type { CentralRofRecord, DetallesEngine }

// ─── Layout constants ─────────────────────────────────────────────────────────

// AddNorte(): 1000-wide top-left — same dimensions as ROF Principales and TBA variants
export const NORTE_TOPOLOGICO_ROF = {
  dx0FromXmin:  0,
  dy0FromYmax: -1500,
  dx1FromXmin:  1000,
  dy1FromYmax:  0,
} as const

// AddSellosDetalles(): 4 elements; first is conditional on o_ruta_sigp[:oclientestelcel]
export const SELLOS_DETALLES_ROF = [
  { nombre: 'c_cuadro_resumen_usuarios_telcel', conditional: true,  bounds: { x0: 580,  y0: 4421, x1: 2630, y1: 4961 } },
  { nombre: 'simbologia_anillo_rof',            conditional: false, bounds: { x0: 330,  y0: 5480, x1: 1933, y1: 7305 } },
  { nombre: 'c_sello_fibra_optica_rof',         conditional: false, bounds: { x0: 429,  y0: 429,  x1: 2529, y1: 2429 } },
  { nombre: 'c_sello_estandar_base_fo',         conditional: false, bounds: { x0: 267,  y0: 279,  x1: 3837, y1: 3019 } },
] as const

// add_viewport_principal(): absolute bounds; uses gen_planos.generar_geometrias_plano_rof()
// for map_viewport_on_map_view (NOT current_view_bounds — distinct from other variants)
export const VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF = {
  bounds:       { x0: 2922, y0: 1300, x1: 14700, y1: 7945 },
  viewScale:    10000,
  displayStyle: '2 250 - 3 000 p ruta',   // Magik: :|2 250 - 3 000 p ruta|
  sTipoPlano:   'PLANO_TOPOLOGICO',
} as const

// ─── Title data ───────────────────────────────────────────────────────────────

// Overrides CFactoryDetalles.crea_titulo(). Same structure as ROF Principales
// except the fixed line reads "PLANO TOPOLOGICO" instead of "PLANO ESQUEMATICO".
export interface TituloTopologicoRofData {
  programa:    string   // prj.user!_programa + " " + prj.user!_programa_anyo
  cableNombre: string   // gen_planos.o_ruta_sigp[:ocables].an_element().name
  ncoNombre:   string   // project.user!_central.building.datos_nco[0]
  ncoSiglas:   string   // project.user!_central.building.datos_nco[1]
  titleCtls:   string   // buildTitleCtls(centrales)
  fecha:       string   // prj.fecha_proyecto
}

export function creaTituloTopologicoRof(data: TituloTopologicoRofData): string {
  return (
    `PROGRAMA ${data.programa}\n` +
    `${data.cableNombre}\n` +
    `PLANO TOPOLOGICO\n` +
    `NCO ${data.ncoNombre}(${data.ncoSiglas})\n` +
    `${data.titleCtls}` +
    `${data.fecha}`
  ).toUpperCase()
}

// ─── Flow description ─────────────────────────────────────────────────────────

export function describePlanFlowTopologicoRof(): string[] {
  return [
    '1. gen_planos.o_enlace ← PEnlace',
    '2. _super.genera_plano(PoElemento, PEnlace)  ← CFactoryDetalles:',
    '     .oCable = PoElemento',
    '     _super._super.genera_plano(PEnlace)  (CFactoryPlanos)',
    '     AddSellosPlanoDetalles()  [empty hook]',
    '     oPage.user!_tipo_plano ← :detalles_construccion',
    '3. AddSellosDetalles()  ← ROF-specific:',
    '     [?] c_cuadro_resumen_usuarios_telcel',
    '     simbologia_anillo_rof (symbol)',
    '     c_sello_fibra_optica_rof',
    '     c_sello_estandar_base_fo',
    '     AddNorte()  [1000-wide]',
    '     add_viewport_principal()  [scale 1:10000]',
    '4. layout_manager → :layout_view_home_view',
  ]
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoTopologicoRof extends CFactoryDetalles {
  // No additional slots — uses oEngine, oCable, oPafManager from CFactoryDetalles

  constructor(oEngine?: DetallesEngine) {
    super(oEngine)
  }

  // Magik: genera_plano(PoElemento, PEnlace, PoEmpalmes) — ROF orchestration. Fase 5.
  generaPlano(_elemento?: unknown, _enlace?: unknown, _empalmes?: unknown[]): void {
    // See describePlanFlowTopologicoRof()
  }

  // Magik: AddSellosDetalles() — ROF-specific; called by genera_plano (not by super). Fase 5.
  // Note: this is NOT the same as AddSellosPlanoDetalles() in the base class.
  addSellosDetalles(): void { /* Fase 5 */ }

  // Magik: AddNorte() — 1000-wide north indicator at page top-left. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_viewport_principal() — absolute bounds; maps to generar_geometrias_plano_rof(). Fase 5.
  addViewportPrincipal(): void { /* Fase 5 */ }

  // Magik: crea_titulo — overrides base; no geo fields, uses titleCtls+fecha. Use creaTituloTopologicoRof(). Fase 5.
  creaTituloTopologicoRof(data?: TituloTopologicoRofData): string {
    return data ? creaTituloTopologicoRof(data) : ''
  }
}
