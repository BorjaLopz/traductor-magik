// Source: planos_fo/source/montaje_tba/engine/c_plano_montaje_tba.magik
// Factory for "Plano de Montaje de TBA" plans.
// Extends CFactoryPlanos. Unrelated to the "Principales" family.
//
// Structural differences vs Principales variants:
//   - Calls _super.genera_plano() (Principales call inicia_layout() directly)
//   - Two viewports: VP Localizacion + VP Ubicacion, side by side near page top
//   - AddConexionEmpalme() — unique to this class
//   - AddParticulares() is a real method (not empty hook); calls AddNorte + AddConexionEmpalme
//   - crea_titulo() does NOT call .uppercase — returns mixed case
//   - Norte is narrower: 1000 wide (others are 4000 wide)
//   - oPafManager slot: application manager for viewport context navigation
//   - c_generador_sellos singleton used for most sello creation

import { CFactoryPlanos } from './CFactoryPlanos'

// ─── Engine interface ─────────────────────────────────────────────────────────

// All engine methods are GIS-backed — Fase 5 stubs in the class
export interface TbaEngine {
  cableConectadoTba():              unknown | undefined
  empalmeTba():                     unknown | undefined
  irLocalizacionTba():              unknown | undefined
  obtenerEstructuraLocalizacion():  unknown | undefined
  irUbicacionTba():                 unknown | undefined
  tbaEnGis:                         boolean
  getTba():                         { 'user!_identificador': string | undefined }
  anotacionTba():                   unknown | undefined
  gasas():                          unknown[]
}

// ─── Layout constants ─────────────────────────────────────────────────────────

// AddMarco(): 4×2, same as base Principales variant
export const MARCO_CONFIG_TBA = {
  bounds: { x0: 0, y0: 0, x1: 1, y1: 1 },
  largo: 4,
  alto:  2,
} as const

// AddNorte(): top-left, but only 1000 wide (vs 4000 in Principales variants)
export const NORTE_TBA = {
  dx0FromXmin: 0,
  dy0FromYmax: -1500,
  dx1FromXmin: 1000,
  dy1FromYmax: 0,
} as const

// AddSellos(): two direct sellos + generador_sellos for the rest
export const SELLOS_TBA = [
  // Direct add (not via c_generador_sellos)
  { nombre: 'c_sello_ruta_cables_fo',   bounds: { x0: 450,  y0: 400,  x1: 2100, y1: 3000 } },
  // Via c_generador_sellos.obten_instancia().genera_sello()
  { nombre: 'c_sello_estandar_base_fo', bounds: { x0: 285,  y0: 400,  x1: 2100, y1: 3000 } },
  { nombre: 'c_notas_constructor',      bounds: { x0: 2350, y0: 1500, x1: 2350, y1: 1500 } },
] as const

// AddParticulares(): five elements via c_generador_sellos
// Note: several have zero-size bounds (x0=x1, y0=y1) — positional anchors in original
export const PARTICULARES_TBA = [
  { nombre: 'c_datos_de_red',              bounds: { x0: 1500, y0: 250,  x1: 3150, y1: 4250 } },
  { nombre: 'c_cuadro_simbologia_planos_fo', bounds: { x0: 450, y0: 1250, x1: 2100, y1: 4250 } },
  { nombre: 'c_notas_considerar',          bounds: { x0: 2350, y0: 1160, x1: 2350, y1: 1160 } },
  { nombre: 'c_tabla_ps_telealim',         bounds: { x0: 6850, y0: 5650, x1: 6850, y1: 5650 } },
  { nombre: 'c_lista_materiales',          bounds: { x0: 3300, y0: 4250, x1: 3300, y1: 4250 } },
] as const

// AddConexionEmpalme(): top area, right of the two viewports; conditional on engine data
export const CONEXION_EMPALME_TBA = {
  dx0FromXmin:  4600,
  dy0FromYmax: -450,    // y0 = ymax - 450  (normalized ymax of the box)
  dx1FromXmin:  6400,
  dy1FromYmax: -1650,   // y1 = ymax - 1650 (normalized ymin of the box)
} as const

// AddViewportLocalizacion(): top strip, left position
export const VIEWPORT_LOCALIZACION_TBA = {
  dx0FromXmin:  700,
  dy0FromYmax: -300,    // normalized ymax of box
  dx1FromXmin:  2500,
  dy1FromYmax: -1500,   // normalized ymin of box
  mapEnlarging: 1.5,
} as const

// AddViewportUbicacion(): top strip, centre position; ACE name depends on tba_en_gis?
export const VIEWPORT_UBICACION_TBA = {
  dx0FromXmin:  2600,
  dy0FromYmax: -300,
  dx1FromXmin:  4400,
  dy1FromYmax: -1500,
  mapEnlarging:        1.5,
  aceNameGis:          'CENT_PLANOS',
  aceNameNonGis:       'mit_floor_internal',
  styleSystemCategory: 'plano',
  displayStyle:        '250 - 1 000',
} as const

// ─── Title data ───────────────────────────────────────────────────────────────

export interface TituloMontajeTbaData {
  tbaIdentificador: string   // engine.getTba().user!_identificador
  programaTipo:     string   // project.user!_programa_tipo
  centralSiglas:    string   // project.user!_central.user!_central
  centralNombre:    string   // project.user!_central.user!_nombre
}

// Pure-function equivalent of crea_titulo().
// NOTE: the Magik source does NOT call .uppercase — this returns mixed case.
export function creaTituloMontajeTba(data: TituloMontajeTbaData): string {
  return (
    `PLANO MONTAJE DE TBA\n` +
    `${data.tbaIdentificador}\n` +
    `${data.programaTipo}\n` +
    `${data.centralSiglas} - ${data.centralNombre}`
  )
}

// ─── genera_plano flow ────────────────────────────────────────────────────────

export function describePlanFlowTba(): string[] {
  return [
    '1. _super.genera_plano()  ← calls CFactoryPlanos (AddMarco + AddTitulo + AddSellos)',
    '2. AddViewportLocalizacion()  [conditional on engine.irLocalizacionTba()]',
    '3. AddViewportUbicacion()     [conditional on engine.irUbicacionTba()]',
    '4. AddParticulares()  → generador_sellos (×5) + AddNorte() + AddConexionEmpalme()',
    '5. oViewMapperPlugin.layout_manager → :layout_view_refresh',
    '6. oPage.layout_document.user!_tipo_plano ← :montaje_tba',
  ]
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoMontajeTba extends CFactoryPlanos {
  protected _oEngine:     TbaEngine | undefined = undefined
  protected _oPafManager: unknown               = undefined

  constructor(oEngine?: TbaEngine) {
    super()
    this._oEngine = oEngine
    // _oPafManager ← smallworld_product.pni_application().manager (Fase 5)
  }

  // Magik: AddMarco() — returns marco object; does NOT call AddTitulo (handled by super). Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddNorte() — 1000 wide (narrower than Principales variants). Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: AddSellos() — c_sello_ruta_cables_fo + generador_sellos (estandar_base_fo + notas). Fase 5.
  addSellos(): void { /* Fase 5 */ }

  // Magik: AddParticulares() — 5 generador_sellos items + AddNorte + AddConexionEmpalme. Fase 5.
  addParticulares(): void { /* Fase 5 */ }

  // Magik: AddConexionEmpalme() — conditional on cable+empalme from engine. Fase 5.
  addConexionEmpalme(): void { /* Fase 5 */ }

  // Magik: AddViewportLocalizacion() — conditional on engine.irLocalizacionTba(). Fase 5.
  addViewportLocalizacion(): void { /* Fase 5 */ }

  // Magik: AddViewportUbicacion() — conditional on engine.irUbicacionTba(); ACE varies on tba_en_gis. Fase 5.
  addViewportUbicacion(): void { /* Fase 5 */ }

  // Magik: agregar_elementos() — rope of anotacion + empalme + gasas from engine. Fase 5.
  agregarElementos(): unknown[] { return [] /* Fase 5 */ }

  // Magik: crea_titulo — mixed case (no .uppercase). Use creaTituloMontajeTba(). Fase 5.
  creaTitulo(data?: TituloMontajeTbaData): string {
    return data ? creaTituloMontajeTba(data) : ''
  }

  // Magik: genera_plano() — calls _super.genera_plano() first, then adds TBA-specific elements. Fase 5.
  override generaPlano(): void {
    // See describePlanFlowTba() for the complete sequence
  }
}
