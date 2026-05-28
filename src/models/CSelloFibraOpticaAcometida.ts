// Source: adiciones_layout/source/c_sello_fibra_optica_acometida.magik
// Sello "Acometida" de fibra óptica. Extends c_base_sello_fibra.
// 10 tables absolutely positioned inside a 210×200 mm outer frame.
// GIS data fill (obten_registros / llena_datos_celdas) → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'
import type { CeldaColorFibra } from './CBaseSelloFibra'

// ─── Enums ────────────────────────────────────────────────────────────────────

export type EmpresaRevisora    = 'TELMEX' | 'ULTIMA_MILLA' | 'ULTIMA_MILLA_N'
export type EmpresaProyectista = 'IMTSA'  | 'BKTEL'        | 'GSP'

export const ENUM_EMPRESAR: readonly EmpresaRevisora[]    = ['TELMEX', 'ULTIMA_MILLA', 'ULTIMA_MILLA_N']
export const ENUM_EMPRESAP: readonly EmpresaProyectista[] = ['IMTSA', 'BKTEL', 'GSP']

// ─── Attribute interface (25 layout_attribute_definition entries) ─────────────

export interface SelloFibraAcometidaAttribs {
  blancoNegro:      'SI' | 'NO'
  sot?:             string
  direccionSot?:    string
  telefono?:        string
  responsableArea?: string
  enlace?:          string
  anillo?:          string
  pess?:            string
  usuario?:         string
  direccionUser?:   string
  coloniaCp?:       string
  municipio?:       string
  central?:         string
  pep?:             string
  opb?:             string
  oei?:             string
  oePep?:           string
  oeRef?:           string
  refSisa?:         string
  empreviso?:       EmpresaRevisora
  empreproy?:       EmpresaProyectista
  poblacion?:       string
  codigoPostal?:    string
  escala?:          string
  plano?:           string
}

export const DEFAULT_ATTRIBS: SelloFibraAcometidaAttribs = { blancoNegro: 'NO' }

// ─── Table layout (mm, Y increases downward) ──────────────────────────────────
// Source coordinates use ×10 factor (0.1 mm units) converted here to mm.

export interface TableDef {
  posX:             number      // mm from origin
  posY:             number      // mm from origin (downward)
  rows:             number
  cols:             number
  rowLens:          number[]    // 1-indexed; [0] unused
  colLens:          number[]    // 1-indexed; [0] unused
  drawColInternal?: boolean
}

export const TABLE_LAYOUT: Record<string, TableDef> = {
  tbl_MarcoSello:  { posX: 0,     posY: 0,      rows: 1, cols: 1, rowLens: [0, 200],              colLens: [0, 210] },
  tbl_Empresa:     { posX: 17.5,  posY: 3.5,    rows: 1, cols: 2, rowLens: [0, 30],               colLens: [0, 25, 150],           drawColInternal: false },
  tbl_division:    { posX: 45,    posY: 38.5,   rows: 4, cols: 2, rowLens: [0, 7, 7, 7, 7],       colLens: [0, 40, 80],            drawColInternal: false },
  tbl_Proyecto:    { posX: 17.5,  posY: 68.5,   rows: 1, cols: 1, rowLens: [0, 10],               colLens: [0, 175] },
  tbl_enlace:      { posX: 17.5,  posY: 81.5,   rows: 1, cols: 6, rowLens: [0, 7],                colLens: [0, 15, 50, 15, 50, 15, 30], drawColInternal: false },
  tbl_poblacion:   { posX: 45,    posY: 90.5,   rows: 5, cols: 2, rowLens: [0, 7, 7, 7, 7, 7],   colLens: [0, 40, 80],            drawColInternal: false },
  tbl_Operacion:   { posX: 45,    posY: 127,    rows: 3, cols: 4, rowLens: [0, 10, 10, 10],       colLens: [0, 15, 40, 25, 40],    drawColInternal: false },
  tbl_PlanoNum:    { posX: 6,     posY: 160,    rows: 1, cols: 3, rowLens: [0, 10],               colLens: [0, 30, 33.5, 33.5],    drawColInternal: false },
  tbl_EscalaRuta:  { posX: 109,   posY: 160,    rows: 1, cols: 4, rowLens: [0, 10],               colLens: [0, 20, 35, 20, 20],    drawColInternal: false },
  tbl_Aprobo:      { posX: 6,     posY: 175.5,  rows: 2, cols: 4, rowLens: [0, 10, 10],           colLens: [0, 50, 50, 50, 50],    drawColInternal: false },
}

export const SELLO_WIDTH_MM  = 210
export const SELLO_HEIGHT_MM = 200

// ─── Static cell labels ───────────────────────────────────────────────────────

export const LABELS_DIVISION  = ['SOT', 'DIRECCION', 'TELEFONO', 'RESPONSABLE'] as const
export const LABELS_POBLACION = ['USUARIO', 'DIRECCION', 'COLONIA Y C.P..', 'DEL. O MPIO.', 'CENTRAL'] as const
export const LABELS_ENLACE    = ['ENLACE', 'ANILLO', 'PESS'] as const      // at cols 1, 3, 5
export const LABELS_OPERL     = ['PEP', 'OPB', 'OE'] as const              // col 1
export const LABELS_OPERR     = ['REF. SISA', 'OEI', 'OE'] as const        // col 3
export const LABELS_APROBO    = ['PROYECTO', 'SUPERVISO'] as const

// ─── Colored cells (o_color_linea = red) ─────────────────────────────────────

export const COLORED_CELLS: [string, number, number][] = [
  ['tbl_Operacion', 1, 2], ['tbl_Operacion', 1, 4],
  ['tbl_Operacion', 2, 2], ['tbl_Operacion', 2, 4],
  ['tbl_Operacion', 3, 2], ['tbl_Operacion', 3, 4],
]

// ─── Company logo resolution ──────────────────────────────────────────────────

export interface EmpresaInfo { logo: string; nombre: string }

export function resolveEmpresa(empreviso?: EmpresaRevisora): EmpresaInfo {
  switch (empreviso) {
    case 'ULTIMA_MILLA':
      return { logo: 'logo_ultima_milla',   nombre: 'RED NACIONAL ULTIMA MILLA S.A. DE C.V.' }
    case 'ULTIMA_MILLA_N':
      return { logo: 'logo_ultima_milla_n', nombre: 'RED ULTIMA MILLA DEL NOROESTE S.A. DE C.V.' }
    default:
      return { logo: 'logo_telmex_ep',      nombre: 'TELEFONOS DE MEXICO S.A. DE C.V.' }
  }
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloFibraOpticaAcometida extends CBaseSelloFibra {
  static readonly ALLOWED_ON_MENU   = false
  static readonly O_COLOR_LINEA: [number, number, number] = [1.0, 0.0, 0.0]

  // GIS entity refs — Fase 5
  oTramo?:   unknown
  oProyecto?: unknown
  oArea?:    unknown
  sTipoPlano?: string

  override asignarCeldasAColorear(): CeldaColorFibra[] {
    return COLORED_CELLS.map(([t, r, c]) => [t, r, c, CSelloFibraOpticaAcometida.O_COLOR_LINEA])
  }

  enumTipoEmpresaR(): Map<number, EmpresaRevisora>    { return new Map([[1,'TELMEX'],[2,'ULTIMA_MILLA'],[3,'ULTIMA_MILLA_N']]) }
  enumTipoEmpresaP(): Map<number, EmpresaProyectista> { return new Map([[1,'IMTSA'],[2,'BKTEL'],[3,'GSP']]) }

  // Magik: valor_propiedad — attribute value with fallback
  valorPropiedad(key: string, fallback: string): string {
    const v = this._attributes.get(key)?.value
    return v && v.length > 0 ? v : fallback
  }

  // Magik: fecha_elaboracion — MMM/YYYY using c_traductor month names
  static fechaElaboracion(): string {
    const now   = new Date()
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
    return `${meses[now.getMonth()]}/${now.getFullYear()}`
  }

  // Magik: tramos_en_ruta — GIS stub
  tramosEnRuta(): string { return '' }

  // Magik: configura_tabla — all geometry in TABLE_LAYOUT; rendering → Fase 5
  override configurarTabla(): void { /* geometry encoded in TABLE_LAYOUT */ }

  // Magik: etiqueta_celdas — static labels; company logo from empreviso attribute
  override etiquetarCeldas(): void { /* Fase 5 */ }

  // Magik: llena_datos_celdas — fills dynamic GIS data; Fase 5
  llenaDatosCeldas(): void { /* Fase 5 */ }
}
