// Source: adiciones_layout/source/Sellos/c_sello_fibra_optica_rof.magik
// Sello "ROF" (Red de O.F.) de fibra óptica. Extends c_base_sello_fibra.
// 11 tables absolutely positioned inside a 210×200 mm outer frame.
// Default empresa: ULTIMA_MILLA (differs from Acometida which defaults to TELMEX).
// GIS data fill (obtenRegistros / llenarDatosCeldas) → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'
import type { CeldaColorFibra } from './CBaseSelloFibra'

// ─── Enums ────────────────────────────────────────────────────────────────────
// ROF enum ordering: ULTIMA_MILLA=1, ULTIMA_MILLA_N=2, TELMEX=3 (inverse of Acometida)

export type EmpresaRevisora    = 'ULTIMA_MILLA' | 'ULTIMA_MILLA_N' | 'TELMEX'
export type EmpresaProyectista = 'IMTSA'        | 'BKTEL'          | 'GSP'

export const ENUM_EMPRESAR: readonly EmpresaRevisora[]    = ['ULTIMA_MILLA', 'ULTIMA_MILLA_N', 'TELMEX']
export const ENUM_EMPRESAP: readonly EmpresaProyectista[] = ['IMTSA', 'BKTEL', 'GSP']

// ─── Attribute interface ──────────────────────────────────────────────────────
// Note: ref_sisa is commented out in defined_attributes — omitted here.

export interface SelloFibraRofAttribs {
  blancoNegro:      'SI' | 'NO'
  empreviso?:       EmpresaRevisora
  empreproy?:       EmpresaProyectista
  sot?:             string
  direccionSot?:    string
  telefono?:        string
  responsableArea?: string
  enlace?:          string
  anillo?:          string
  pess?:            string
  estado?:          string
  ciudad?:          string
  colonia?:         string    // default: ""
  codigoPostal?:    string    // default: ""
  municipio?:       string
  central?:         string
  pep?:             string
  opb?:             string
  oei?:             string
  oePep?:           string
  oeRef?:           string
  poblacion?:       string
  escala?:          string
  noPlano?:         string
}

export const DEFAULT_ATTRIBS: SelloFibraRofAttribs = { blancoNegro: 'NO' }

// ─── Table layout (mm, Y increases downward) ──────────────────────────────────
// Magik coords use ×10 factor (0.1mm units) → divided by 10 → mm.
// Key differences from Acometida:
//   - tbl_division/poblacion start at posX=17.5 (not 45) and have wider cols (135 not 80)
//   - tbl_coordenadas is new (labels commented out in source — renders as empty row)
//   - tbl_Operacion posY=134 (not 127), tbl_PlanoNum/EscalaRuta posY=165 (not 160)

export interface TableDef {
  posX:             number
  posY:             number
  rows:             number
  cols:             number
  rowLens:          number[]
  colLens:          number[]
  drawColInternal?: boolean
}

export const TABLE_LAYOUT: Record<string, TableDef> = {
  tbl_MarcoSello:   { posX: 0,    posY: 0,     rows: 1, cols: 1, rowLens: [0, 200],              colLens: [0, 210] },
  tbl_Empresa:      { posX: 17.5, posY: 3.5,   rows: 1, cols: 2, rowLens: [0, 30],               colLens: [0, 25, 150],               drawColInternal: false },
  tbl_division:     { posX: 17.5, posY: 38.5,  rows: 4, cols: 2, rowLens: [0, 7, 7, 7, 7],       colLens: [0, 40, 135],               drawColInternal: false },
  tbl_Proyecto:     { posX: 17.5, posY: 68.5,  rows: 1, cols: 1, rowLens: [0, 10],               colLens: [0, 175] },
  tbl_enlace:       { posX: 17.5, posY: 81.5,  rows: 1, cols: 6, rowLens: [0, 7],                colLens: [0, 15, 50, 15, 65, 15, 15], drawColInternal: false },
  tbl_poblacion:    { posX: 17.5, posY: 90.5,  rows: 5, cols: 2, rowLens: [0, 7, 7, 7, 7, 7],   colLens: [0, 40, 135],               drawColInternal: false },
  tbl_coordenadas:  { posX: 17.5, posY: 126,   rows: 1, cols: 6, rowLens: [0, 7],                colLens: [0, 15, 60, 14, 34, 18, 34], drawColInternal: false },
  tbl_Operacion:    { posX: 45,   posY: 134,   rows: 3, cols: 4, rowLens: [0, 10, 10, 10],       colLens: [0, 15, 40, 25, 40],        drawColInternal: false },
  tbl_PlanoNum:     { posX: 6,    posY: 165,   rows: 1, cols: 3, rowLens: [0, 10],               colLens: [0, 30, 33.5, 33.5],        drawColInternal: false },
  tbl_EscalaRuta:   { posX: 109,  posY: 165,   rows: 1, cols: 4, rowLens: [0, 10],               colLens: [0, 20, 35, 20, 22],        drawColInternal: false },
  tbl_Aprobo:       { posX: 6,    posY: 176.5, rows: 2, cols: 4, rowLens: [0, 10, 10],           colLens: [0, 50, 50, 50, 50],        drawColInternal: false },
}

export const SELLO_WIDTH_MM  = 210
export const SELLO_HEIGHT_MM = 200

// ─── Static cell labels ───────────────────────────────────────────────────────

export const LABELS_DIVISION  = ['SOT', 'DIRECCION', 'TELEFONO', 'RESPONSABLE'] as const
export const LABELS_POBLACION = ['ESTADO', 'CIUDAD', 'COLONIA Y C.P..', 'DEL. O MPIO.', 'CENTRAL'] as const
export const LABELS_ENLACE    = ['ENLACE', 'ANILLO', 'PES'] as const       // at cols 1, 3, 5
export const LABELS_OPERL     = ['PEP', 'OPB', 'OE'] as const              // col 1
export const LABELS_OPERR     = ['', 'OEI', 'OE'] as const                 // col 3; row 1 blank (REF.SISA commented out)
export const LABELS_APROBO    = ['PROYECTO', 'SUPERVISO'] as const

// ─── Colored cells (o_color_linea = red) ─────────────────────────────────────
// Note: (1,4) is commented out in source — only 5 colored cells (vs 6 in Acometida)

export const COLORED_CELLS: [string, number, number][] = [
  ['tbl_Operacion', 1, 2],
  ['tbl_Operacion', 2, 2], ['tbl_Operacion', 2, 4],
  ['tbl_Operacion', 3, 2], ['tbl_Operacion', 3, 4],
]

// ─── Company logo / name resolution ──────────────────────────────────────────
// Default is ULTIMA_MILLA (opposite of Acometida which defaults to TELMEX).

export interface EmpresaInfo { logo: string; nombre: string }

export function resolveEmpresaRof(empreviso?: EmpresaRevisora): EmpresaInfo {
  switch (empreviso) {
    case 'TELMEX':
      return { logo: 'logo_telmex_ep',      nombre: 'TELEFONOS DE MEXICO S.A DE C.V.' }
    case 'ULTIMA_MILLA_N':
      return { logo: 'logo_ultima_milla_n', nombre: 'RED ULTIMA MILLA DEL NOROESTE' }
    default:
      return { logo: 'logo_ultima_milla',   nombre: 'RED NACIONAL ULTIMA MILLA' }
  }
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloFibraOpticaRof extends CBaseSelloFibra {
  static readonly ALLOWED_ON_MENU   = false
  static readonly O_COLOR_LINEA: [number, number, number] = [1.0, 0.0, 0.0]

  // GIS entity refs — Fase 5
  oTramo?:    unknown
  oProyecto?: unknown
  oArea?:     unknown
  sTipoPlano?: string
  valorEmpreviso?: string

  override asignarCeldasAColorear(): CeldaColorFibra[] {
    return COLORED_CELLS.map(([t, r, c]) => [t, r, c, CSelloFibraOpticaRof.O_COLOR_LINEA])
  }

  enumTipoEmpresaR(): Map<number, EmpresaRevisora>    { return new Map([[1,'ULTIMA_MILLA'],[2,'ULTIMA_MILLA_N'],[3,'TELMEX']]) }
  enumTipoEmpresaP(): Map<number, EmpresaProyectista> { return new Map([[1,'IMTSA'],[2,'BKTEL'],[3,'GSP']]) }

  valorPropiedad(key: string, fallback: string): string {
    const v = this._attributes.get(key)?.value
    return v && v.length > 0 ? v : fallback
  }

  static fechaElaboracion(): string {
    const now   = new Date()
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
    return `${meses[now.getMonth()]}/${now.getFullYear()}`
  }

  tramosEnRuta(): string { return '' }

  override configurarTabla(): void { /* geometry encoded in TABLE_LAYOUT */ }
  override etiquetarCeldas(): void { /* Fase 5 */ }

  llenarDatosCeldas(): void { /* Fase 5 */ }
}
