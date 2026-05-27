// Source: planos_fo/source/ruta_cables/factory/c_plano_esquematico_de_principales.magik
// Factory for "Plano Esquemático de Principales" plans.
// Extends CFactoryPlanos. Overrides marco (4×2), title, sellos, and viewport.
// All layout / GIS operations → Fase 5.

import { CFactoryPlanos, PAGE_SIZE } from './CFactoryPlanos'

// ─── Engine / domain types ────────────────────────────────────────────────────

export interface BastidorRecord {
  'user!_central': string | undefined
  obtenerConexionDeCables(): { keys: { anElement(): CableRecord | undefined } }
  obtenerNumeroDePiso(): string | undefined
  obtenerTipoSala():    string | undefined
  obtenerFila():        string | undefined
  obtenerPosBastidor(): string | undefined
}

export interface CableRecord {
  getGrupos(): Array<{ fibras: unknown[] }>
}

export interface BastidorCableData {
  loCable:         CableRecord
  rme:             BastidorRecord
  central:         string | undefined
  numDeGrupos:     number
  numeroFibras:    number
  capacidadCable:  number
  piso:            string | undefined
  sala:            string | undefined
  fila:            string | undefined
  bastidor:        string | undefined
}

// ─── Layout constants ─────────────────────────────────────────────────────────

export const MARCO_CONFIG = {
  bounds: { x0: 0, y0: 0, x1: 1, y1: 1 },
  largo: 4,
  alto:  2,
} as const

// Norte: top-left corner of page, 4000 wide × 1500 tall
export const NORTE_OFFSET = { dx0: 0, dy0: -1500, dx1: 4000, dy1: 0 } as const

// Titulo position relative to marco (override of parent defaults)
export const TITULO_OFFSET = {
  dxFromMax: -2800, dyFromMin: 200,
  dxToMax:   -200,  dyToMax:   600,
} as const

// Sello positions — mix of absolute and marco-relative
export const SELLOS_LAYOUT = [
  {
    nombre:   'c_notas_constructor',
    absolute: true,
    bounds:   { x0: 555,  y0: 3759, x1: 2355, y1: 4330 },
  },
  {
    nombre:   'simbolos_planos_esquematico',
    absolute: false,
    bounds:   { x0: 220,  y0: 4230, x1: 1520, y1: 5500 },
  },
  {
    nombre:   'c_sello_estandar_base_fo',
    absolute: false,
    bounds:   { x0: 55,   y0: 400,  x1: 2000, y1: 3000 },
  },
  {
    nombre:   'c_sello_ruta_cables_fo_sigp',
    absolute: false,
    bounds:   { x0: 450,  y0: 1000, x1: 2100, y1: 1600 },
  },
  {
    nombre:   'c_resumen_del_proyecto',
    absolute: true,
    bounds:   { x0: 4500, y0: 627,  x1: 5490, y1: 5687 },
  },
  {
    nombre:   'c_resumen_distritos_ruta',
    absolute: true,
    bounds:   { x0: 450,  y0: 3100, x1: 2100, y1: 4500 },
  },
  {
    nombre:   'c_tabla_equivalencias_x_cable',
    absolute: true,
    bounds:   { x0: 2500, y0: 627,  x1: 3490, y1: 5687 },
  },
] as const

// Viewport principal: relative to marco bounds
export const VIEWPORT_OFFSET = {
  dx0: 3000, dy0: 500, dx1: -750, dy1: -750,
  sTipoPlano: 'DIAGRAMA_ESQUEMATICO_PRINCIPALES',
} as const

// ─── Pure helpers ─────────────────────────────────────────────────────────────

// Magik: crea_titulo — builds plan title from central name
export function creaTitulo(centralNombre: string): string {
  return `PLANO ESQUEMATICO  DE PRINCIPALES\n CTL - ${centralNombre}`
}

// Magik: add_sello_tabla_equivalencias_x_cable — aggregates data from bastidor
export function buildBastidorCableData(
  bastidor: BastidorRecord,
  cable: CableRecord,
): BastidorCableData | null {
  const grupos = cable.getGrupos()
  const numDeGrupos = grupos.length
  let numeroFibras = 0

  for (let i = 0; i < numDeGrupos; i++) {
    if (grupos[i].fibras.length > 0) {
      numeroFibras = grupos[i].fibras.length
      break
    }
  }

  if (numDeGrupos === 0 || numeroFibras === 0) return null  // raises :information in Magik

  return {
    loCable:        cable,
    rme:            bastidor,
    central:        bastidor['user!_central'],
    numDeGrupos,
    numeroFibras,
    capacidadCable: numDeGrupos * numeroFibras,
    piso:           bastidor.obtenerNumeroDePiso(),
    sala:           bastidor.obtenerTipoSala(),
    fila:           bastidor.obtenerFila(),
    bastidor:       bastidor.obtenerPosBastidor(),
  }
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoEsquematicoDeprincipales extends CFactoryPlanos {
  // _oEngine / _oBufferRuta are private Magik slots (separate from parent's oBuffer)
  protected _oEngine:     unknown = undefined
  protected _oBufferRuta: unknown = undefined
  oMarco:                 unknown = undefined

  constructor(oEngine?: unknown) {
    super()
    this._oEngine = oEngine
  }

  // Magik: cables_esquema_sigp() — gets visible geometry on :gs!schematic ace,
  // filters sheath source records. Fase 5.
  cablesEsquemaSigp(): unknown[] { return [] /* Fase 5 */ }

  // Magik: genera_plano(PoCable, Penlace) — orchestrates full plan generation. Fase 5.
  generaPlano(_cable?: unknown, _enlace?: unknown): void {
    // 1. inicia_layout()
    // 2. genp.publicalo(oEngine)
    // 3. add_marco()
    // 4. AddNorte()
    // 5. add_sellos()
    // 6. add_viewport_principal()
    // 7. oPage.layout_document.user!_tipo_plano = :esquema_principales
  }

  // Magik: add_marco() — c_marco(0,0,1,1), largo=4, alto=2, no fill. Fase 5.
  addMarco(): unknown { return undefined /* Fase 5 */ }

  // Magik: AddNorte() — c_norte at page top-left. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_sellos() — adds 6 sellos + tabla equivalencias. Fase 5.
  addSellos(): void { /* Fase 5 */ }

  // Magik: add_viewport_principal() — c_viewport_layout_sigc mapped to current view. Fase 5.
  addViewportPrincipal(): void { /* Fase 5 */ }

  // Magik: AddParticulares() — empty subclass hook
  addParticulares(): void { /* intentionally empty */ }

  // Magik: crea_titulo — overrides parent with plan-specific title
  creaTitulo(centralNombre = ''): string {
    return creaTitulo(centralNombre)
  }

  // Magik: AddTitulo(PoMarco) — places title near marco top-right. Fase 5.
  addTitulo(_marco: unknown): void { /* Fase 5 */ }

  // Magik: busca_bastidores() — equality_set of mit_bay from visible geometry. Fase 5.
  buscaBastidores(): BastidorRecord[] { return [] /* Fase 5 */ }

  // Magik: add_sello_tabla_equivalencias_x_cable() — one sello per bastidor. Fase 5.
  addSelloTablaEquivalenciasXCable(): void { /* Fase 5 */ }

  // Magik: agrega_simbolo(nombre, bounds) — symbol_layout added to page. Fase 5.
  agregarSimbolo(_nombre: string, _bounds: unknown): void { /* Fase 5 */ }
}

// ─── Page size re-export ──────────────────────────────────────────────────────
export { PAGE_SIZE }
