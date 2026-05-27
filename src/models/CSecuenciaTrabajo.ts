// Source: planos_fo/source/detalles_construccion/sellos/c_secuencia_trabajo.magik
// Sello for the 12-step fibre construction work sequence (SECUENCIA DE TRABAJO).
// Extends textbox_layout (NOT c_base_sello_fibra). Manages its own oTablas slot.
//
// Table: tbl_secuencia_trabajo — 1 col × 2 rows
//   Row 1:  8 mm   — title "SECUENCIA DE TRABAJO" (tamanio=54)
//   Row 2: 150 mm default — content text (tamanio=36, alineacion=top_left)
//   Col 1: 207 mm
//
// Content resolution in prvAsignaTexto():
//   1. textoSello (instance) → applied first
//   2. varObjeto.oventana (GUI, Fase 5) → overrides textoSello if populated
//   3. contenidoSello (class-level shared variable) → does NOT override text
//      but DOES control dynamic row height:
//        newlines ∈ (45,60]: height = (lines–40)×2 + 120 mm
//        newlines ≤ 40:      height = 110 mm
//   4. largo attribute → overrides row 2 height
//   5. ancho attribute → overrides col 1 width
//
// contenidoSello and varObjeto are Magik shared variables (class-level).
// allowed_on_menu? = false.
// Inicializa() builds default textoSello from GIS (LoCentral) — Fase 5.
// Use buildContenidoDefault(centralNombre) to produce the static template.

import { TextboxLayout } from './TextboxLayout'
import type { ITabla, ITablas } from './CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

export type { ITabla, ITablas }

// ─── Default template ─────────────────────────────────────────────────────────

// Builds the 12-step work-sequence template that Inicializa() sets as textoSello.
// centralNombre comes from GIS: swg_dsn_admin_engine.active_scheme.project.user!_central.
// Source has broken encoding "DA�OS" → corrected to DAÑADOS.
// Typo "ESXISTE" preserved from original.
export function buildContenidoDefault(centralNombre: string = ''): string {
  const c = centralNombre
  return (
    '\n' +
    '  1.  ANTES DE INICIAR ESTOS TRABAJOS VERIFICAR QUE ESTEN CONCLUIDOS LOS TRABAJOS\n' +
    `  COMPLEMENTARIOS DE INFRAESTRUCTURA NECESARIA EN LA CTL  ${c}\n` +
    '\n' +
    '  2.  SUBDIVIDIR TRAMOS INDICADOS EN LA RUTA\n' +
    '  3.  ACONDICIONAR LOS POZOS PARA RAQUEO DE FO PROYECTADA COMO SE MENCIONA EN EL\n' +
    '  PLANO DE RUTA DE CABLES\n' +
    '  4.  COLOCAR SOPORTES EN LOS POZOS:  \n' +
    '  PARA SUJECION DE GASAS\n' +
    '  5.  COLOCAR   SOPORTES EN LOS POZOS DE PASO:  \n' +
    '  DONDE SE ENCUENTRA DAÑADOS, SATURADOS O NO ESXISTE FO\n' +
    `  6.  SE DEJARAN   MTS EN BASTIDOR PARA REALIZAR REMATE EN LA CTL  ${c}\n` +
    `  7.  JALAR   MTS DE CABLE   DESDE EL BDFO DE LA CTL  ${c}, HASTA LA VENTANA\n` +
    '  DE LA FOSA DE CABLES \n' +
    '  8.  JALAR Y SUJETAR   MTS DE CABLE   DESDE LA VENTANA DE LA FOSA DE\n' +
    '  CABLES HASTA EL EMPALME DE DERIVACION UBICADO EN EL POZO NO. \n' +
    '  9.  JALAR Y SUJETAR   MTS DE CABLE    DESDE EL POZO NO.  HASTA EL\n' +
    '  EMPALME DE DERIVACION   UBICADO EN EL POZO NO.  \n' +
    '  10.  REALIZAR EMPALMES DE DERIVACION Y EMPALMES TERMINAL DE ACUERDO AL PLANO,___DE___,___DE\n' +
    '  ___ Y ___DE___ EN POZOS MARCADOS CON ET Y E\n' +
    '  11.  ANTES DE PROCEDER A ELABORAR LAS PLACAS DE IDENTIFICACION EL CONTRATISTA DEBERA DE\n' +
    '  RECTIFICAR O RATIFICAR LOS KILOMETROS DE F.O. NUMERO DE EMPALMES COMO QUEDARON\n' +
    '  REALMENTE DESPUES DE LA CONSTRUCCION.\n' +
    '  12.  COLOCAR   PLACAS DE IDENTIFICACION EN EL CABLE OPTICO COMO SE INDICA A CONTINUACION:\n' +
    `   A.- COLOCAR UNA PLACA EN LA PARTE FRONTAL DEL BDFO DE LA CTL -  ${c}\n` +
    `   B.- COLOCAR UNA PLACA EN LA PARTE POSTERIOR DEL BDFO DE LA CTL -  ${c}\n` +
    '   C.- COLOCAR UNA PLACA EN EL CABLE OPTICO CADA 5.0 mts. DESDE LA VENTANA DE LA FOSA DE\n' +
    `    CABLES, HASTA EL BDFO DE LA CTL -  ${c}\n` +
    '   D.- COLOCAR UNA PLACA EN TODOS LOS POZOS DE LA RUTA\n' +
    '   E.- COLOCAR UNA PLACA ADICIONAL SOBRE EL CABLE EN LOS POZOS DONDE HAY GASAS.\n' +
    '   F.- COLOCAR DOS PLACAS ADICIONALES SOBRE EL CABLE EN LOS POZOS CON EMPALME DE DERIVACION\n'
  )
}

// ─── Layout constants ─────────────────────────────────────────────────────────

export const TABLA_SECUENCIA_TRABAJO = {
  nombre:                    'tbl_secuencia_trabajo' as const,
  alturaFilaTitulo:          8,    // mm — row 1
  alturaFilaContenidoDefault: 150, // mm — row 2 default
  anchoColumnaDefault:       207,  // mm — col 1 default
  tamanioTitulo:             54,   // CTextoGrafico size for row 1
  tamanioContenido:          36,   // CTextoGrafico size for row 2
} as const

// ─── Config interface ─────────────────────────────────────────────────────────

export interface SecuenciaTrabajoConfig {
  textoSello?:   string   // text content; defaults to buildContenidoDefault(centralNombre)
  centralNombre?: string  // fills GIS placeholder in template (Fase 5: from active_scheme)
  largo?:        number   // attributes[:largo] — row 2 height override in mm
  ancho?:        number   // attributes[:ancho] — col 1 width override in mm
  fontSize?:     number   // textbox_layout font_size (default 35 set by Inicializa)
  colour?:       string   // textbox_layout colour
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSecuenciaTrabajo extends TextboxLayout {
  static readonly allowedOnMenu = false  // Magik: allowed_on_menu? shared constant

  // Magik shared variables (class-level — shared across all instances)
  static contenidoSello: string | undefined = undefined
  static varObjeto:      unknown            = undefined

  oTablas:        ITablas | undefined = undefined
  oCoordOrigen:   [number, number]    = [0, 0]
  oWindow:        unknown             = undefined
  bTablaCreada:   boolean             = false

  textoSello:     string | undefined  = undefined
  largo:          number              = 0
  ancho:          number              = 0

  constructor(config?: SecuenciaTrabajoConfig) {
    super()
    if (config) {
      this.largo  = config.largo  ?? 0
      this.ancho  = config.ancho  ?? 0
      this.fontSize = config.fontSize ?? 35   // Magik: Inicializa sets font_size = 35
      if (config.colour) this.colour = config.colour

      // Build default textoSello from template if not explicitly provided
      this.textoSello = config.textoSello
        ?? buildContenidoDefault(config.centralNombre ?? '')
    } else {
      this.fontSize = 35
      this.textoSello = buildContenidoDefault()
    }
  }

  // Magik: prvCrea_Cfg_Tbl_Notas_Grales(RoCoord) — table structure setup.
  protected prvCreaCfgTblNotasGrales(coord: [number, number] = [0, 0]): void {
    if (!this.oTablas) return
    const t = this.oTablas.crearTabla(2, 1, TABLA_SECUENCIA_TRABAJO.nombre)
    t.coordenadaOrigen = coord
    t.renglones.elemento(1).longitud = TABLA_SECUENCIA_TRABAJO.alturaFilaTitulo
    t.renglones.elemento(2).longitud = TABLA_SECUENCIA_TRABAJO.alturaFilaContenidoDefault
    t.columnas.elemento(1).longitud  = TABLA_SECUENCIA_TRABAJO.anchoColumnaDefault
  }

  // Magik: prvLlena_Celdas() — places CTextoGrafico objects in cells.
  protected prvLlenaCeldas(): void {
    if (!this.oTablas) return
    const tab = this.oTablas.elemento(TABLA_SECUENCIA_TRABAJO.nombre)

    const titulo = new CTextoGrafico('SECUENCIA DE TRABAJO')
    titulo.tamanio = TABLA_SECUENCIA_TRABAJO.tamanioTitulo

    const desc = new CTextoGrafico('')
    desc.tamanio   = TABLA_SECUENCIA_TRABAJO.tamanioContenido
    desc.alineacion = 'top_left'

    tab.celdas.celda(1, 1).elemento = titulo
    tab.celdas.celda(2, 1).elemento = desc

    this.prvAsignaTexto()
  }

  // Virtual hooks for subclass dispatch (ROF variant overrides these).
  protected get classContenidoSello(): string | undefined { return CSecuenciaTrabajo.contenidoSello }
  protected get defaultRowHeight(): number { return TABLA_SECUENCIA_TRABAJO.alturaFilaContenidoDefault }

  // Magik: prvAsignaTexto() — text content + dynamic dimensions.
  // Fase 5: varObjeto (c_gui_edita_sello_sec_trab) GUI check omitted.
  prvAsignaTexto(): void {
    if (!this.oTablas) return
    const tab = this.oTablas.elemento(TABLA_SECUENCIA_TRABAJO.nombre)

    // Apply textoSello attribute (set by Inicializa / XML load)
    if (this.textoSello) {
      const t = new CTextoGrafico(this.textoSello)
      t.tamanio    = TABLA_SECUENCIA_TRABAJO.tamanioContenido
      t.alineacion = 'top_left'
      tab.celdas.celda(2, 1).elemento = t
    }

    // contenidoSello (class-level) controls dynamic row height
    const cs = this.classContenidoSello
    if (cs && cs.length > 0) {
      const newlineCount = (cs.match(/\n/g) ?? []).length
      const lineCount    = newlineCount + 1
      if (newlineCount > 45 && newlineCount <= 60) {
        tab.renglones.elemento(2).longitud = (lineCount - 40) * 2 + 120
      } else if (newlineCount <= 40) {
        tab.renglones.elemento(2).longitud = 110
      }
    }

    if (this.largo > 0) tab.renglones.elemento(2).longitud = this.largo
    if (this.ancho  > 0) tab.columnas.elemento(1).longitud  = this.ancho
  }

  override drawContentOn(window: unknown): void {
    if (!this.oTablas) return
    this.prvAsignaTexto()
    this.oWindow = window
    // Fase 5: this._bounds = this.oTablas.areaTotal()

    const tab = this.oTablas.elemento(TABLA_SECUENCIA_TRABAJO.nombre)
    const c1  = tab.celdas.celda(1, 1).elemento as CTextoGrafico | undefined
    const c2  = tab.celdas.celda(2, 1).elemento as CTextoGrafico | undefined
    if (c2) c2.tamanio = this.fontSize
    if (c1) c1.color   = this.colour
    if (c2) c2.color   = this.colour

    this.oTablas.desplegar(window)
  }

  // ─── Pure helpers (no oTablas required) ────────────────────────────────────

  resolvedText(): string {
    return this.textoSello ?? buildContenidoDefault()
  }

  computedRowHeight(): number {
    if (this.largo > 0) return this.largo
    const cs = this.classContenidoSello
    if (cs && cs.length > 0) {
      const nl = (cs.match(/\n/g) ?? []).length
      if (nl > 45 && nl <= 60) return (nl + 1 - 40) * 2 + 120
      if (nl <= 40)             return 110
    }
    return this.defaultRowHeight
  }

  computedColWidth(): number {
    return this.ancho > 0 ? this.ancho : TABLA_SECUENCIA_TRABAJO.anchoColumnaDefault
  }

  // Magik: Agrega_LYM(RoLym) — delegates to oTablas. Fase 5.
  agregaLYM(_lym: unknown): void { /* Fase 5 */ }

  // Magik: abre_interfaz_GUI — opens c_gui_edita_sello_sec_trab. Fase 5.
  abreInterfazGui(): void { /* Fase 5 */ }

  // Magik: envia_mensage_error — opens Smallworld GUI frame. Fase 5.
  enviaMensajeError(): void { /* Fase 5 */ }
}
