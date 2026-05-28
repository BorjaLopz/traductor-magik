// Source: planos_fo/source/ruta_cables/sellos/c_sello_ruta_cables_fo.magik
// Main title block for Ruta de Cables FO plans. Extends c_base_sello_fibra.
// 11 tables: tbl_general, tbl_1–tbl_8, tbl_logo_imtsa, tbl_logo_telmex.
// tbl_8 (PEPs) is dynamically sized from GIS project data — Fase 5.
// ln_desp_y = 11 (tbl_1 row height) drives the x-offset for right-side tables.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SelloRutaCablesFoConfig {
  empreviso?:       string   // Magik: attributes[:empreviso]  enum empresar
  empproyecto?:     string   // Magik: attributes[:empproyecto] enum empresap
  blancoNegro?:     boolean  // Magik: attributes[:blanco_negro] "SI"|"NO"
  nombreEnlace?:    string
  cable?:           string
  titulo?:          string
  numeroDehoja?:    string
  totalHojas?:      string
  telefono?:        string
  dirArea?:         string
  responsableArea?: string
}

// ─── PEP GIS field-name constants ─────────────────────────────────────────────

export const TIPOS_PEPS_BA: readonly string[] = [
  'user!_pep_ba_rp_fo_peba',
  'user!_pep_ba_rs_fo_peba',
  'user!_pep_ba_ter_peba',
  'user!_pep_ba_pares_principales',
  'user!_pep_desm_rp_fo',
  'user!_pep_desm_itba',
  'user!_pep_desm_cana',
  'user!_pep_ba_can_alig_plex',
]

export const TIPOS_PEPS_FIBRA: readonly string[] = [
  'user!_pep_ut_cana_ali',
  'user!_pep_ut_cana_enc',
  'user!_pep_ut_fib_ae',
  'user!_pep_ut_fib_sub',
  'user!_pep_zo_cana_ali',
  'user!_pep_zo_cana_enc',
  'user!_pep_zo_fib_ae',
  'user!_pep_zo_fib_sub',
]

export const TIPOS_PEPS_FTTB: readonly string[] = [
  'user!_pep_cons_ppal',
  'user!_pep_desm_ppal',
  'user!_pep_ba_rp_fo_peba',
  'user!_pep_ba_rs_fo_peba',
  'user!_pep_desm_secu',
  'user!_pep_cons_secu',
  'user!_pep_cons_ccc',
  'user!_pep_desm_ccc',
  'user!_pep_desm_cana',
  'user!_pep_cons_cana',
  'user!_pep_desm_rp_fo',
  'user!_pep_desm_rs_fo',
  'user!_pep_ba_ter_peba',
  'user!_pep_desm_itba',
]

// ─── Layout constant ──────────────────────────────────────────────────────────

const LN_DESP_Y = 11  // tbl_1 row height (mm) — x-offset base for right-side tables

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloRutaCablesFo extends CBaseSelloFibra {
  // Magik slots — GIS catalog caches
  private _oTipoEmpresaR: Map<number, string> | undefined = undefined
  private _oTipoEmpresaP: Map<number, string> | undefined = undefined
  private _valorEmpreviso:   string = ''
  private _valorEmpproyecto: string = ''

  // Attributes (Magik: defined_attributes)
  empreviso:       string  = ''
  empproyecto:     string  = ''
  blancoNegro:     boolean = false  // Magik default "NO"
  nombreEnlace:    string  = ''
  cable:           string  = ''
  titulo:          string  = ''
  numeroDehoja:    string  = ''
  totalHojas:      string  = ''
  telefono:        string  = ''
  dirArea:         string  = ''
  responsableArea: string  = ''

  bounds = { xmin: 0, ymin: -250, xmax: 185, ymax: 0 }

  constructor(config?: SelloRutaCablesFoConfig) {
    super()
    if (config?.empreviso       !== undefined) this.empreviso       = config.empreviso
    if (config?.empproyecto     !== undefined) this.empproyecto     = config.empproyecto
    if (config?.blancoNegro     !== undefined) this.blancoNegro     = config.blancoNegro
    if (config?.nombreEnlace    !== undefined) this.nombreEnlace    = config.nombreEnlace
    if (config?.cable           !== undefined) this.cable           = config.cable
    if (config?.titulo          !== undefined) this.titulo          = config.titulo
    if (config?.numeroDehoja    !== undefined) this.numeroDehoja    = config.numeroDehoja
    if (config?.totalHojas      !== undefined) this.totalHojas      = config.totalHojas
    if (config?.telefono        !== undefined) this.telefono        = config.telefono
    if (config?.dirArea         !== undefined) this.dirArea         = config.dirArea
    if (config?.responsableArea !== undefined) this.responsableArea = config.responsableArea
  }

  // Magik: enum_tipo_empresar — hash for empresa que revisa
  enumTipoEmpresar(): Map<number, string> {
    if (!this._oTipoEmpresaR) {
      this._oTipoEmpresaR = new Map([
        [1, 'TELMEX'],
        [2, 'ULTIMA_MILLA'],
        [3, 'ULTIMA_MILLA_N'],
      ])
    }
    return this._oTipoEmpresaR
  }

  // Magik: enum_tipo_empresap — hash for empresa que proyecta
  enumTipoEmpresap(): Map<number, string> {
    if (!this._oTipoEmpresaP) {
      this._oTipoEmpresaP = new Map([
        [1, 'IMTSA'],
        [2, 'GSP'],
        [3, 'KBTEL'],
        [4, 'TELNOR'],
      ])
    }
    return this._oTipoEmpresaP
  }

  // Derived logo symbol name for tbl_logo_telmex (empresa que revisa)
  // Magik: llena_datos_celdas empreviso block
  logoRevisa(): string {
    if (!this.empreviso) return 'logo_telmex_ep'
    const base = `logo_${this.empreviso.toUpperCase()}`
    return base.toUpperCase().includes('TELMEX') ? `${base}_EP` : base
  }

  // Derived logo symbol name for tbl_logo_imtsa (empresa que proyecta)
  // Magik: llena_datos_celdas empproyecto block
  logoProyecta(): string {
    if (!this.empproyecto) return ''  // fallback: GIS project.user!_empresa_proyecto (Fase 5)
    return `logo_${this.empproyecto.toUpperCase()}`
  }

  // Magik: ajusta_marco_y_bounds — tbl_general row + bounds expansion for PEP rows
  ajustaMarcoYBounds(pTotRen: number): void {
    const tblGeneral = this._tablas.elemento('tbl_general')
    tblGeneral.renglones.elemento(1).longitud = 250 + (pTotRen - 10) * 8
    this.bounds = {
      ...this.bounds,
      ymax: this.bounds.ymax + (pTotRen - 10) * 80,
    }
  }

  // Pure version for showcase use (no _tablas access)
  computeFrameHeight(pTotRen: number): number {
    return 250 + (pTotRen - 10) * 8
  }

  // Magik: configura_tabla — all 11 tables
  override configurarTabla(): void {
    const [ox, oy] = this._coordInicio

    const tblGeneral = this._tablas.crearTabla(1, 1, 'tbl_general')
    tblGeneral.coordenadaOrigen = [ox, oy]
    tblGeneral.renglones.elemento(1).longitud = 250
    tblGeneral.columnas.elemento(1).longitud  = 185

    const tbl1 = this._tablas.crearTabla(1, 1, 'tbl_1')
    tbl1.coordenadaOrigen = [ox + 150, oy]
    tbl1.renglones.elemento(1).longitud = LN_DESP_Y
    tbl1.columnas.elemento(1).longitud  = 155
    this.ocultarBordesCeldas(tbl1, { borderDerIzq: [[1,1]], borderSupInf: [[1,1]] })

    const tbl2 = this._tablas.crearTabla(1, 1, 'tbl_2')
    tbl2.coordenadaOrigen = [ox + LN_DESP_Y, oy - LN_DESP_Y]
    tbl2.renglones.elemento(1).longitud = LN_DESP_Y
    tbl2.columnas.elemento(1).longitud  = 155

    const tbl3 = this._tablas.crearTabla(8, 2, 'tbl_3')
    tbl3.coordenadaOrigen = [ox + 380, oy - 220]
    for (let r = 1; r <= 8; r++) tbl3.renglones.elemento(r).longitud = 8
    tbl3.columnas.elemento(1).longitud = 51
    tbl3.columnas.elemento(2).longitud = 53
    this.ocultarBordesCeldas(tbl3, {
      borderDerIzq: [
        [1,1],[1,2],[2,1],[2,2],[3,1],[3,2],[4,1],[4,2],
        [5,1],[5,2],[6,1],[6,2],[7,1],[7,2],[8,1],[8,2],
      ],
      borderSupInf: [[1,1],[1,2],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1]],
    })

    const tblLogoImtsa = this._tablas.crearTabla(1, 1, 'tbl_logo_imtsa')
    tblLogoImtsa.coordenadaOrigen = [ox + LN_DESP_Y, oy - 940]
    tblLogoImtsa.renglones.elemento(1).longitud = 48
    tblLogoImtsa.columnas.elemento(1).longitud  = 51

    const tbl4 = this._tablas.crearTabla(8, 1, 'tbl_4')
    tbl4.coordenadaOrigen = [ox + LN_DESP_Y + 510, oy - 940]
    for (let r = 1; r <= 8; r++) tbl4.renglones.elemento(r).longitud = 8
    tbl4.columnas.elemento(1).longitud = 53
    this.ocultarBordesCeldas(tbl4, { borderInf: [[1,1],[3,1],[5,1]] })

    const tblLogoTelmex = this._tablas.crearTabla(2, 1, 'tbl_logo_telmex')
    tblLogoTelmex.coordenadaOrigen = [ox + LN_DESP_Y + 1040, oy - 940]
    tblLogoTelmex.renglones.elemento(1).longitud = 48
    tblLogoTelmex.columnas.elemento(1).longitud  = 51
    this.ocultarBordesCeldas(tblLogoTelmex, { borderInf: [[1,1]] })

    const tbl5 = this._tablas.crearTabla(2, 1, 'tbl_5')
    tbl5.coordenadaOrigen = [ox + LN_DESP_Y, oy - 1420]
    tbl5.renglones.elemento(1).longitud = 8
    tbl5.renglones.elemento(2).longitud = 8
    tbl5.columnas.elemento(1).longitud  = 51

    const tbl6 = this._tablas.crearTabla(2, 1, 'tbl_6')
    tbl6.coordenadaOrigen = [ox + LN_DESP_Y + 1040, oy - 1420]
    tbl6.renglones.elemento(1).longitud = 8
    tbl6.renglones.elemento(2).longitud = 8
    tbl6.columnas.elemento(1).longitud  = 51
    this.ocultarBordesCeldas(tbl6, { borderSup: [[1,1]] })

    const tbl7 = this._tablas.crearTabla(1, 5, 'tbl_7')
    tbl7.coordenadaOrigen = [ox + LN_DESP_Y, oy - 1580]
    tbl7.renglones.elemento(1).longitud = 8
    tbl7.columnas.elemento(1).longitud  = 95
    for (let c = 2; c <= 5; c++) tbl7.columnas.elemento(c).longitud = 15
    this.ocultarBordesCeldas(tbl7, { borderDer: [[1,1]], borderIzq: [[1,1]] })

    this.crearTablaPeps()
  }

  // Magik: crea_tabla_peps — GIS-driven; placeholder 10×5 until Fase 5
  crearTablaPeps(): void {
    const [ox, oy] = this._coordInicio
    const tbl8 = this._tablas.crearTabla(10, 5, 'tbl_8')
    tbl8.coordenadaOrigen = [ox + LN_DESP_Y, oy - 1660]
    for (let r = 1; r <= 10; r++) tbl8.renglones.elemento(r).longitud = 8
    for (let c = 1; c <= 5; c++) tbl8.columnas.elemento(c).longitud = 31
  }

  override etiquetarCeldas(): void { /* Fase 5: GIS project data + static labels */ }

  // Magik: llena_datos_celdas — all GIS reads are Fase 5; attribute overrides modelled here
  override llenarDatosCeldas(): void {
    if (this.nombreEnlace)    this.asignarTextoCelda('tbl_2', 1, 1, this.nombreEnlace,    50, undefined)
    if (this.cable)           this.asignarTextoCelda('tbl_5', 2, 1, this.cable,           30, undefined)
    if (this.titulo)          this.asignarTextoCelda('tbl_1', 1, 1, this.titulo,          70, undefined)
    if (this.numeroDehoja)    this.asignarTextoCelda('tbl_7', 1, 3, this.numeroDehoja,    30, undefined)
    if (this.totalHojas)      this.asignarTextoCelda('tbl_7', 1, 5, this.totalHojas,      30, undefined)
    if (this.responsableArea) this.asignarTextoCelda('tbl_3', 6, 2, this.responsableArea, 30, undefined)
    if (this.dirArea)         this.asignarTextoCelda('tbl_3', 7, 2, this.dirArea,         30, undefined)
    if (this.telefono)        this.asignarTextoCelda('tbl_3', 8, 2, this.telefono,        30, undefined)

    this._valorEmpreviso = this.logoRevisa()
    this.asignarSimboloCelda('tbl_logo_telmex', 1, 1, this._valorEmpreviso, 1)

    const logoP = this.logoProyecta()
    if (logoP) {
      this._valorEmpproyecto = logoP
      this.asignarSimboloCelda('tbl_logo_imtsa', 1, 1, this._valorEmpproyecto, 1)
    }
  }

  // Magik: llena_datos_dinamicos — simple attribute reads on re-render
  protected override llenarDatosDinamicos(): void {
    if (this.nombreEnlace) this.asignarTextoCelda('tbl_2', 1, 1, this.nombreEnlace, 50, undefined)
    if (this.numeroDehoja) this.asignarTextoCelda('tbl_7', 1, 3, this.numeroDehoja, 30, undefined)
    if (this.totalHojas)   this.asignarTextoCelda('tbl_7', 1, 5, this.totalHojas,   30, undefined)
    if (this.cable)        this.asignarTextoCelda('tbl_5', 2, 1, this.cable,        30, undefined)
    if (this.titulo)       this.asignarTextoCelda('tbl_1', 1, 1, this.titulo,       70, undefined)
  }

  // Fase 5 stubs
  llenarDatosPep():                       void { /* Fase 5 */ }
  filtrarCamposXProyecto():               void { /* Fase 5 */ }
  obtenerPepsYSuTipo():                   void { /* Fase 5 */ }
  obtenerIndice():                        void { /* Fase 5 */ }
  obtenerInformacionAdminPrincipales():   void { /* Fase 5 */ }
  obtenerInformacionAdminSecundario():    void { /* Fase 5 */ }
  obtenerTba():                           void { /* Fase 5 */ }
  llenarOpOeiOe():                        void { /* Fase 5 */ }
  verificaDatosTabla():                   void { /* Fase 5 */ }
  getTipoPlano():                         string { return '' }
  getPage():                              void { /* Fase 5 */ }
  datosParaLarguillos():                  void { /* Fase 5 */ }
  override obtenerRegistros():            unknown { return undefined }
}
