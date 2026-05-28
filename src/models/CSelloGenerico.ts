// Source: planos_fo/source/ruta_cables/sellos/c_sello_generico.magik
// Editable free-text sello. Extends layout_element (not c_base_sello_fibra).
// TypeScript: extends CBaseSello — same infrastructure, simplest shape.
//
// One table: tbl_sello_generico — 2×1
//   Row 1: 8mm  — titulo_sello (title, font 35)
//   Row 2: dynamic (default 50mm; capped/expanded by line count or `largo` override)
//   Col 1: 110mm default (overridden by `ancho` attribute)
//
// Dynamic row-2 height (prvAsignaTexto):
//   lines > 21 and ≤ 150 → (lines - 21) × 2 + 110
//   lines ≤ 21            → 70
//   largo > 0             → largo  (hard override, wins over line-count logic)
//   ancho > 0             → col-1 width = ancho

import { CBaseSello } from './CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SelloGenericoConfig {
  tituloSello?:   string  // Magik: attributes[:titulo_sello], default notas_grales
  contenidoSello?: string // Magik: slot contenido_sello / attributes[:texto_sello]
  largo?:         number  // integer: row-2 height override (mm)
  ancho?:         number  // integer: col-1 width override (mm)
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SELLO_GENERICO_DEFAULTS = {
  tituloSello:      'NOTAS GENERALES',  // Magik: message(:notas_grales)
  rowTitleHeight:   8,     // row 1 (mm)
  rowContentDefault: 50,   // initial value set in prvCrea_Cfg_Tbl_Notas_Grales (mm)
  rowContentCompact: 70,   // ≤21 newlines (mm)
  colWidth:         110,   // col 1 default (mm)
  maxLinesFull:     21,    // lines ≤ this → 70mm
  maxLinesExpand:   150,   // lines > this → clamp (source uses ≤ 150 check)
  lineExtraPerLine:  2,    // mm per extra line beyond 21
  lineBaseExtra:    110,   // mm base for extra-line formula
} as const

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloGenerico extends CBaseSello {
  // Attributes
  tituloSello:    string = SELLO_GENERICO_DEFAULTS.tituloSello
  contenidoSello: string = ''   // Magik: slot contenido_sello (also persisted as texto_sello)
  largo:          number = 0    // integer attribute — row-2 height override
  ancho:          number = 0    // integer attribute — col-1 width override

  constructor(config?: SelloGenericoConfig) {
    super()
    if (config?.tituloSello    !== undefined) this.tituloSello    = config.tituloSello
    if (config?.contenidoSello !== undefined) this.contenidoSello = config.contenidoSello
    if (config?.largo          !== undefined) this.largo          = config.largo
    if (config?.ancho          !== undefined) this.ancho          = config.ancho
  }

  // Magik: prvAsignaTexto row-2 height formula
  computeRowContentHeight(): number {
    if (this.largo > 0) return this.largo
    const lines = (this.contenidoSello.match(/\n/g) ?? []).length
    if (lines > SELLO_GENERICO_DEFAULTS.maxLinesFull &&
        lines <= SELLO_GENERICO_DEFAULTS.maxLinesExpand) {
      const extra = lines - SELLO_GENERICO_DEFAULTS.maxLinesFull
      return extra * SELLO_GENERICO_DEFAULTS.lineExtraPerLine +
             SELLO_GENERICO_DEFAULTS.lineBaseExtra
    }
    return SELLO_GENERICO_DEFAULTS.rowContentCompact
  }

  computeColWidth(): number {
    return this.ancho > 0 ? this.ancho : SELLO_GENERICO_DEFAULTS.colWidth
  }

  // Magik: prvCrea_Cfg_Tbl_Notas_Grales + prvLlena_Celdas
  override configurarTabla(): void {
    const [ox, oy] = this._coordInicio
    const tbl = this._tablas.crearTabla(2, 1, 'tbl_sello_generico')
    tbl.coordenadaOrigen = [ox, oy]
    tbl.renglones.elemento(1).longitud = SELLO_GENERICO_DEFAULTS.rowTitleHeight
    tbl.renglones.elemento(2).longitud = SELLO_GENERICO_DEFAULTS.rowContentDefault
    tbl.columnas.elemento(1).longitud  = SELLO_GENERICO_DEFAULTS.colWidth
  }

  override etiquetarCeldas(): void { /* labels set dynamically in prvLlena_Celdas */ }

  // Magik: prvLlena_Celdas + prvAsignaTexto combined
  override llenarDatosCeldas(): void {
    const tbl = this._tablas.elemento('tbl_sello_generico')

    const elTitulo = new CTextoGrafico(this.tituloSello.toUpperCase() || '')
    elTitulo.tamanio = 35
    tbl.celdas.celda(1, 1).elemento = elTitulo

    const elContenido = new CTextoGrafico(this.contenidoSello.toUpperCase())
    elContenido.tamanio    = 35
    elContenido.alineacion = 'top_left'
    tbl.celdas.celda(2, 1).elemento = elContenido

    // Apply dynamic dimensions
    tbl.renglones.elemento(2).longitud = this.computeRowContentHeight()
    tbl.columnas.elemento(1).longitud  = this.computeColWidth()
  }

  protected override llenarDatosDinamicos(): void { /* no dynamic slot in source */ }
}
