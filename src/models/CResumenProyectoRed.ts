// Source: planos_fo/source/ruta_cables/sellos/c_resumen_proyecto_red.magik
// Free-text sello for a construction project summary (RESUMEN DEL PROYECTO).
// Extends CBaseSelloFibra. Default content = 31-item construction checklist.
// Content editable at runtime via c_gui_edita_sello_generico (Fase 5).
//
// Table: tbl_resumen — 1 col × 2 rows
//   Row 1:  9 mm tall  — title ("RESUMEN DEL PROYECTO", no explicit size in Magik)
//   Row 2: 130 mm default — free text; tamanio=35, alineacion=top_left
//          dynamic height = lines × 6 mm (from contenidoSello)
//   Col 1: 150 mm default
//
// Content resolution priority in prvAsignaTexto():
//   1. contenidoSello (runtime override) → toUpperCase() → always wins
//   2. textoSello attribute (XML-persisted; attributes[:texto_sello])
//   3. CONTENIDO_DEFAULT template placed by etiquetarCeldas()
//
// Dimension overrides: attributes[:largo] → row 2 height; attributes[:ancho] → col 1 width.
// allowed_on_menu? = true (Smallworld shared constant).

import { CBaseSelloFibra } from './CBaseSelloFibra'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ─── Default content (31-item construction checklist) ─────────────────────────

// Verbatim from Magik etiqueta_celdas(). Typos ("INDENTIFICACION", "16,-", "HAS TA") preserved.
export const CONTENIDO_DEFAULT = [
  ' 1.-   LONGITUD TOTAL DEL TRAMO A CONSTRUIR___________________________MTS',
  ' 2.-  LONGITUD TOTAL DE LA RUTA________________________________________MTS',
  ' 3.-  CABLE DE 4 F.O. SFDTP-2YF______GAZA A ELABORAR___________________MTS',
  ' 4.-  CABLE DE 4 F.O. SaOTV _________GAZA A ELABORAR____________________MTS',
  ' 5.-  INTER.A EMPALME DERV. FOSC 450 BS_________________________________PZAS',
  ' 6.-  JGO. DE CHAROLA ADICIONAL PARA EMPALME FOSC 450BS________________PZA',
  ' 7.-  CIERRE EMP. RECTO HAS TA 36 F.O. FOSK 350 C______________________PZA',
  ' 8.-  CONEXIONES DE F.O. POR FUSION____________________________________PZA',
  ' 9.-  PROTOCOLO / 9 ACOMETIDAS_______________________________________PZA',
  '10.- PLACAS DE INDENTIFICACION______________________________________PZA',
  '11.- SOPORTE EN POZO________________________________________________PZA',
  '12.- INSTAL/TUBO POLIETILENO (FLEXODUCTO P/SUB.DE VIA)______________MTS',
  '13.- INTERV/CANAL SUB A POSTE_______________________________________PZA',
  '14.- SUMINISTRO Y COLOCACION DE CANALETAS PARA POSTE________________PZA',
  '15.- PROTECTOR DE NEOPRENO__________________________________________PZA',
  '16,- DESRRAMAR ARBOL________________________________________________PZA',
  '17.- PV. ENGRA. DE CABLE F.O C/CAPACIDAD____________________________MTS',
  '18.- CRUCERO PARA GUIA DE POSTE A POSTE_____________________________PZA',
  '19.- PV HILADO CAB. F.O. C/ CAPACIDAD_______________________________MTS',
  '20.- PV. SACAR GUIA CABLE DE F.O.___________________________________MTS',
  '21.- DESAGUAR POZO__________________________________________________PZA',
  '22.- PV. INSTAL/F.O. EN VIA OCUPADA_________________________________MTS',
  '23.- DESOLDAR TAPAS DE POZO EN FORMA CONTINUA_______________________ML',
  '24.- SOLDAR TAPAS DE POZO EN FORMA CONTINUA_________________________PZA',
  '25.- SUM. COLOC. TAPA POZO EXIST. CON SOLERA 1/4 x2_________________PZA',
  '26.- PVA. A FCES00 PIEZA DE SOLERA DE PROTECCION ADIC. EN PZO______ PZA',
  '27.- ETIQUETA DE IDENTIFICACION EN DFO_____________________________ PZA',
  '28.- ETIQUETA TIPO BANDERA PARA POSTE_______________________________PZA',
  '29.- PVA. ENTUBADO F.O. C/CAPACIDAD_________________________________MTS',
  '30.- TUBO RANURADO__________________________________________________PZA',
  '31.- INSTALACION EN ESCALERILLA EXISTENTE___________________________MTS',
].join('\n') + '\n'

// ─── Layout constants ─────────────────────────────────────────────────────────

export const TABLA_RESUMEN_PROYECTO_RED = {
  nombre:                    'tbl_resumen' as const,
  alturaFilaTitulo:          9,    // mm — row 1
  alturaFilaContenidoDefault: 130, // mm — row 2 before any override
  anchoColumnaDefault:       150,  // mm — col 1 before any override
  alturaLinea:               6,    // mm per content line for dynamic height
} as const

// ─── Config interface ─────────────────────────────────────────────────────────

export interface ResumenProyectoRedConfig {
  textoSello?:     string   // attributes[:texto_sello] — XML-persisted content
  contenidoSello?: string   // runtime override; wins over textoSello
  largo?:          number   // attributes[:largo] — row 2 height override in mm
  ancho?:          number   // attributes[:ancho] — col 1 width override in mm
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CResumenProyectoRed extends CBaseSelloFibra {
  static readonly allowedOnMenu = true  // Magik: allowed_on_menu? shared constant

  bTablaCreada:    boolean           = false
  textoSello:      string | undefined = undefined  // attributes[:texto_sello]
  contenidoSello:  string | undefined = undefined
  largo:           number             = 0          // attributes[:largo]
  ancho:           number             = 0          // attributes[:ancho]

  constructor(config?: ResumenProyectoRedConfig) {
    super()
    if (config) {
      this.textoSello    = config.textoSello
      this.contenidoSello = config.contenidoSello
      this.largo         = config.largo ?? 0
      this.ancho         = config.ancho ?? 0
    }
  }

  override configurarTabla(): void {
    const t = this._tablas.crearTabla(2, 1, TABLA_RESUMEN_PROYECTO_RED.nombre)
    t.coordenadaOrigen = this._coordInicio
    t.renglones.elemento(1).longitud = TABLA_RESUMEN_PROYECTO_RED.alturaFilaTitulo
    t.renglones.elemento(2).longitud = TABLA_RESUMEN_PROYECTO_RED.alturaFilaContenidoDefault
    t.columnas.elemento(1).longitud  = TABLA_RESUMEN_PROYECTO_RED.anchoColumnaDefault
  }

  override etiquetarCeldas(): void {
    const tab = this._tablas.elemento(TABLA_RESUMEN_PROYECTO_RED.nombre)

    // Row 1: title — no explicit tamanio in Magik (uses CTextoGrafico default)
    tab.celdas.celda(1, 1).elemento = new CTextoGrafico('RESUMEN DEL PROYECTO')

    // Row 2: default 31-item content
    const cuerpo = new CTextoGrafico(CONTENIDO_DEFAULT)
    cuerpo.tamanio   = 35
    cuerpo.alineacion = 'top_left'
    tab.celdas.celda(2, 1).elemento = cuerpo

    this.prvAsignaTexto()
  }

  override drawContentOn(window: unknown): void {
    this.prvAsignaTexto()
    // Fase 5: this._bounds = this._tablas.areaTotal()
    this._tablas.desplegar(window)
  }

  // Magik: prvAsignaTexto() — text priority + dimension overrides.
  // Fase 5: c_gui_edita_sello_generico window check omitted.
  private prvAsignaTexto(): void {
    const tab = this._tablas.elemento(TABLA_RESUMEN_PROYECTO_RED.nombre)

    // textoSello attribute (XML-persisted) overrides the default template
    if (this.textoSello) {
      const t = new CTextoGrafico(this.textoSello)
      t.tamanio    = 35
      t.alineacion = 'top_left'
      tab.celdas.celda(2, 1).elemento = t
    }

    // contenidoSello always wins (uppercase), and recalculates row height
    if (this.contenidoSello) {
      const upper = this.contenidoSello.toUpperCase()
      this.textoSello = upper
      const t = new CTextoGrafico(upper)
      t.tamanio    = 35
      t.alineacion = 'top_left'
      tab.celdas.celda(2, 1).elemento = t

      const lines = this.contenidoSello.split('\n').length
      tab.renglones.elemento(2).longitud = lines * TABLA_RESUMEN_PROYECTO_RED.alturaLinea
    }

    // Attribute dimension overrides (win over auto-height from contenidoSello)
    if (this.largo > 0) tab.renglones.elemento(2).longitud = this.largo
    if (this.ancho > 0) tab.columnas.elemento(1).longitud  = this.ancho
  }

  // ─── Pure helpers (no _tablas required) ────────────────────────────────────

  resolvedText(): string {
    if (this.contenidoSello) return this.contenidoSello.toUpperCase()
    if (this.textoSello)     return this.textoSello
    return CONTENIDO_DEFAULT
  }

  computedRowHeight(): number {
    if (this.largo > 0) return this.largo
    if (this.contenidoSello) {
      return this.contenidoSello.split('\n').length * TABLA_RESUMEN_PROYECTO_RED.alturaLinea
    }
    return TABLA_RESUMEN_PROYECTO_RED.alturaFilaContenidoDefault
  }

  computedColWidth(): number {
    return this.ancho > 0 ? this.ancho : TABLA_RESUMEN_PROYECTO_RED.anchoColumnaDefault
  }

  // Magik: abre_interfaz_GUI — opens c_gui_edita_sello_generico window. Fase 5.
  abreInterfazGui(): void { /* Fase 5 */ }
}
