// Source: planos_fo/source/ruta_cables/factory/c_plano_esquematico_de_principales_rof.magik
// ROF (Red Óptica de Fibra) variant of the "Plano Esquemático de Principales" factory.
// Extends CFactoryPlanos directly (sibling of all other Principales variants).
//
// Key differences vs all siblings:
//   - add_sellos(): 7 ROF-specific sellos (2 conditional) — most of any variant
//   - add_viewport_principal(): marco-relative offsets (same dx/dy as base) + uses .oViewMapperPlugin field
//   - crea_titulo(): programa + cable + "PLANO ESQUEMATICO" + NCO + titleCtls + fecha
//   - AddTitulo(): marco-relative, different offsets than base
//   - cables_esquema_sigp(): returns SINGLE collection (GIS records only, no geometry, no :centre_line filter)
//   - genera_plano(): calls genp.publicalo(engine) — unique to ROF; no buffer, no layout series, no trail
//   - add_marco(): same 7×3 format as FTTH
//   - add_sello_tabla_equivalencias_x_cable() is commented out in Magik source

import { CFactoryPlanos } from './CFactoryPlanos'
import {
  type BastidorRecord,
  type BastidorCableData,
  buildBastidorCableData,
} from './CPlanoEsquematicoDeprincipales'

export { buildBastidorCableData }
export type { BastidorRecord, BastidorCableData }

// ─── Layout constants ─────────────────────────────────────────────────────────

// add_marco(): 7×3, identical to FTTH
export const MARCO_CONFIG_ROF = {
  bounds: { x0: 0, y0: 0, x1: 1, y1: 1 },
  largo: 7,
  alto:  3,
} as const

// add_viewport_principal(): marco-relative offsets. Same dx/dy numbers as base variant,
// but sTipoPlano string differs from base ("DIAGRAMA_ESQUEMATICO_PRINCIPALES").
export const VIEWPORT_OFFSET_ROF = {
  dx0:        3000,
  dy0:        500,
  dx1:       -750,
  dy1:       -750,
  sTipoPlano: 'DIAGRAMA_ESQUEMA_PRINCIPALES',
} as const

// AddTitulo(): marco-relative. Different offsets than base variant.
export const TITULO_OFFSET_ROF = {
  dxFromMax:  -2200,   // x0 = xmax - 2200
  dyFromMin:   400,    // y0 = ymin + 400
  dxToMax:    -200,    // x1 = xmax - 200
  dyToMax:    1200,    // y1 = ymin + 1200
} as const

// add_sellos(): 7 sellos, 2 conditional on gen_planos.o_ruta_sigp entries
export const SELLOS_ROF = [
  // conditional: only if o_ruta_sigp[:oclientestelcel] is set
  { nombre: 'c_cuadro_resumen_usuarios_telcel', conditional: true,  bounds: { x0: 352,  y0: 3140, x1: 2402, y1: 3680 } },
  { nombre: 'c_secuencia_trabajo_rof',          conditional: false, bounds: { x0: 462,  y0: 4771, x1: 2532, y1: 6351 } },
  { nombre: 'c_notas_constructor_rof',          conditional: false, bounds: { x0: 555,  y0: 3759, x1: 2355, y1: 4330 } },
  // symbol_layout element (not a sello instance)
  { nombre: 'simbologia_anillo_rof',            conditional: false, bounds: { x0: 450,  y0: 6517, x1: 2053, y1: 8342 } },
  { nombre: 'c_sello_fibra_optica_rof',         conditional: false, bounds: { x0: 429,  y0: 429,  x1: 2529, y1: 2429 } },
  { nombre: 'c_sello_estandar_base_fo',         conditional: false, bounds: { x0: 267,  y0: 279,  x1: 3837, y1: 3019 } },
  // conditional: only if o_ruta_sigp[:oresumen_del_proyecto_rof] is set
  { nombre: 'c_resumen_del_proyecto_rof',       conditional: true,  bounds: { x0: 4500, y0: 627,  x1: 5490, y1: 5687 } },
] as const

// ─── Title data ───────────────────────────────────────────────────────────────

// One entry from o_ruta_sigp[:oelementos_hash][:building]
export interface CentralRofRecord {
  'user!_nom_nodo': string
  'user!_siglas':   string
}

// Builds the multi-line CTLs block for the title:
// "NOM_NODO(SIGLAS)\n" per central in the route
export function buildTitleCtls(centrales: CentralRofRecord[]): string {
  return centrales.map(c => `${c['user!_nom_nodo']}(${c['user!_siglas']})`).join('\n') +
    (centrales.length > 0 ? '\n' : '')
}

export interface TituloRofData {
  programa:    string   // prj.user!_programa + " " + prj.user!_programa_anyo
  cableNombre: string   // gen_planos.o_ruta_sigp[:ocables].an_element().name
  ncoNombre:   string   // active_design.project.user!_central.building.datos_nco[0]
  ncoSiglas:   string   // active_design.project.user!_central.building.datos_nco[1]
  titleCtls:   string   // buildTitleCtls(centrales) — newline-separated list
  fecha:       string   // prj.fecha_proyecto
}

// Pure-function equivalent of crea_titulo() — returns UPPERCASE multiline string.
export function creaTituloRof(data: TituloRofData): string {
  return (
    `PROGRAMA ${data.programa}\n` +
    `${data.cableNombre}\n` +
    `PLANO ESQUEMATICO\n` +
    `NCO ${data.ncoNombre}(${data.ncoSiglas})\n` +
    `${data.titleCtls}` +
    `${data.fecha}`
  ).toUpperCase()
}

// ─── genera_plano flow (unique to ROF) ────────────────────────────────────────

// ROF genera_plano does NOT use buffer or layout series — it calls genp.publicalo() instead.
export function describePlanFlowRof(): string[] {
  return [
    '1. inicia_layout()',
    '2. if (cable): genp.o_enlace ← enlace',
    '3. genp.publicalo(oEngine)  ← único en ROF',
    '4. add_marco() + addNorte() + add_sellos() + add_viewport_principal()',
    '5. oPage.layout_document.user!_tipo_plano ← :esquema_principales',
    '   (sin buffer, sin layout series, sin trail)',
  ]
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoEsquematicoDeprincipalesRof extends CFactoryPlanos {
  protected _oEngine:     unknown = undefined
  protected _oBufferRuta: unknown = undefined
  oMarco:                 unknown = undefined

  constructor(oEngine?: unknown) {
    super()
    this._oEngine = oEngine
  }

  // Magik: cables_esquema_sigp() — single return: GIS sheath records only.
  // Unlike FTTH/Acometida: no dual return, no :centre_line filter. Fase 5.
  cablesEsquemaSigp(): unknown[] {
    return [] /* Fase 5 */
  }

  // Magik: genera_plano — calls genp.publicalo(engine); no buffer or layout series. Fase 5.
  generaPlano(_cable?: unknown, _enlace?: unknown): void {
    // See describePlanFlowRof() for the complete sequence
  }

  // Magik: add_marco() — largo=7, alto=3. Same as FTTH. Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddNorte() — same relative-to-page-top-left as base variant. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_sellos() — 7 ROF-specific sellos (2 conditional). Fase 5.
  addSellos(): void { /* Fase 5 */ }

  // Magik: add_viewport_principal() — marco-relative offsets; uses .oViewMapperPlugin field. Fase 5.
  addViewportPrincipal(): void { /* Fase 5 */ }

  // Magik: AddParticulares() — empty hook
  addParticulares(): void { /* intentionally empty */ }

  // Magik: crea_titulo — gen_planos + NCO + titleCtls + fecha. Use creaTituloRof(). Fase 5.
  creaTitulo(data?: TituloRofData): string {
    return data ? creaTituloRof(data) : ''
  }

  // Magik: AddTitulo(PoMarco) — marco-relative bounds (different offsets from base). Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: busca_bastidores() — equality_set from visible :mit_bay geometry. Same as base. Fase 5.
  buscaBastidores(): BastidorRecord[] { return [] /* Fase 5 */ }

  // Magik: add_sello_tabla_equivalencias_x_cable() — commented out in Magik source. Fase 5.
  addSelloTablaEquivalenciasXCable(): void { /* Fase 5 — disabled in Magik (commented out) */ }

  // Magik: agrega_simbolo(nombre, bounds) — symbol_layout added to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }
}
