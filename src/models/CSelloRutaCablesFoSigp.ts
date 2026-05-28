// Source: planos_fo/source/ruta_cables/sellos/c_sello_ruta_cables_fo_sigp.magik
// SIGP variant of the Ruta de Cables FO title block. Extends c_base_sello_fibra directly.
// 4 tables: tbl_4 (header/jalado), tbl_inf_adm_1 (PEP/VoBo),
//           tbl_inf_adm_2 (logo/proyecto/programa), tbl_inf_adm_3 (7×6 detail grid).
// All 18 attributes use valor_propiedad pattern: attribute override > GIS computed value.
// 9 cells are colored red via asignarCeldasAColorear override.

import { CBaseSelloFibra, type CeldaColorFibra } from './CBaseSelloFibra'

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SelloRutaCablesFoSigpConfig {
  empproyecto?: string   // Magik: attributes[:empproyecto] enum empresap
  jaladocable?: string
  pep?:         string
  vobo?:        string
  proyecto?:    string
  programa?:    string
  numcable?:    string
  supervisor?:  string
  siglas?:      string
  fecha?:       string
  constOpb?:    string   // Magik: const_opb — construcción OPB ref
  constOei?:    string
  constOe?:     string
  desmOpb?:     string   // Magik: desm_opb — desmontaje OPB ref
  desmOei?:     string
  desmOe?:      string
  distritos?:   string
  hoja?:        string   // default: "PLANO 2 DE 3"
}

// ─── Row/col size constants ───────────────────────────────────────────────────

const TBL4_ROWS    = [15, 15, 12, 10, 30]
const TBL4_COLS    = [150]
const TBL1_ROWS    = [10, 10]
const TBL1_COLS    = [22.5, 52.5, 75]
const TBL2_ROWS    = [6, 10.5]
const TBL2_COLS    = [22.5, 52.5, 37.5, 37.5]
const TBL3_ROWS    = [7.5, 7.5, 7.5, 7.5, 7.5, 15, 7.5]
const TBL3_COLS    = [22.5, 22.5, 30, 10.5, 27, 37.5]

const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0)

// Accumulated y-offsets (mm): tbl_inf_adm_N starts at oy - offset
const Y_ADM1 = sum(TBL4_ROWS)                           // 82
const Y_ADM2 = Y_ADM1 + sum(TBL1_ROWS)                 // 102
const Y_ADM3 = Y_ADM2 + sum(TBL2_ROWS)                 // 118.5

const COLOR_RED: [number, number, number] = [1.0, 0.0, 0.0]

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloRutaCablesFoSigp extends CBaseSelloFibra {
  // Magik slots — GIS catalog caches
  private _oTipoEmpresaR: Map<number, string> | undefined = undefined
  private _oTipoEmpresaP: Map<number, string> | undefined = undefined
  private _valorEmpproyecto: string = ''

  // Attributes (Magik: defined_attributes)
  empproyecto: string = ''
  jaladocable: string = ''
  pep:         string = ''
  vobo:        string = ''
  proyecto:    string = ''
  programa:    string = ''
  numcable:    string = ''
  supervisor:  string = ''
  siglas:      string = ''
  fecha:       string = ''
  constOpb:    string = ''
  constOei:    string = ''
  constOe:     string = ''
  desmOpb:     string = ''
  desmOei:     string = ''
  desmOe:      string = ''
  distritos:   string = ''
  hoja:        string = 'PLANO 2 DE 3'  // Magik: default_value

  constructor(config?: SelloRutaCablesFoSigpConfig) {
    super()
    if (config?.empproyecto !== undefined) this.empproyecto = config.empproyecto
    if (config?.jaladocable !== undefined) this.jaladocable = config.jaladocable
    if (config?.pep         !== undefined) this.pep         = config.pep
    if (config?.vobo        !== undefined) this.vobo        = config.vobo
    if (config?.proyecto    !== undefined) this.proyecto    = config.proyecto
    if (config?.programa    !== undefined) this.programa    = config.programa
    if (config?.numcable    !== undefined) this.numcable    = config.numcable
    if (config?.supervisor  !== undefined) this.supervisor  = config.supervisor
    if (config?.siglas      !== undefined) this.siglas      = config.siglas
    if (config?.fecha       !== undefined) this.fecha       = config.fecha
    if (config?.constOpb    !== undefined) this.constOpb    = config.constOpb
    if (config?.constOei    !== undefined) this.constOei    = config.constOei
    if (config?.constOe     !== undefined) this.constOe     = config.constOe
    if (config?.desmOpb     !== undefined) this.desmOpb     = config.desmOpb
    if (config?.desmOei     !== undefined) this.desmOei     = config.desmOei
    if (config?.desmOe      !== undefined) this.desmOe      = config.desmOe
    if (config?.distritos   !== undefined) this.distritos   = config.distritos
    if (config?.hoja        !== undefined) this.hoja        = config.hoja
  }

  // Magik: enum_tipo_empresar
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

  // Magik: enum_tipo_empresap
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

  // Derived logo symbol name for tbl_inf_adm_2(2,1)
  logoProyecta(): string {
    if (!this.empproyecto) return ''  // fallback: GIS project.user!_empresa_proyecto (Fase 5)
    return `logo_${this.empproyecto.toUpperCase()}`
  }

  // Magik: valor_propiedad — attribute override wins over GIS value
  valorPropiedad(attrValue: string, gisValue: string): string {
    if (attrValue.trim().length > 0) return attrValue.toUpperCase()
    return gisValue
  }

  // Magik: asigna_celdas_a_colorear — 9 cells colored red
  override asignarCeldasAColorear(): CeldaColorFibra[] {
    return [
      ['tbl_4',         1, 1, COLOR_RED],
      ['tbl_inf_adm_1', 1, 2, COLOR_RED],
      ['tbl_inf_adm_3', 2, 1, COLOR_RED],
      ['tbl_inf_adm_3', 2, 5, COLOR_RED],
      ['tbl_inf_adm_3', 3, 5, COLOR_RED],
      ['tbl_inf_adm_3', 4, 5, COLOR_RED],
      ['tbl_inf_adm_3', 2, 6, COLOR_RED],
      ['tbl_inf_adm_3', 3, 6, COLOR_RED],
      ['tbl_inf_adm_3', 4, 6, COLOR_RED],
    ]
  }

  // Magik: configura_tabla — 4 tables
  override configurarTabla(): void {
    const [ox, oy] = this._coordInicio

    // tbl_4: 5×1 — main header + jalado de cable
    const tbl4 = this._tablas.crearTabla(TBL4_ROWS.length, TBL4_COLS.length, 'tbl_4')
    tbl4.coordenadaOrigen = [ox + 1, oy]
    TBL4_ROWS.forEach((h, i) => tbl4.renglones.elemento(i + 1).longitud = h)
    tbl4.columnas.elemento(1).longitud = TBL4_COLS[0]
    this.ocultarBordesCeldas(tbl4, { borderSupInf: [[4, 1]] })

    // tbl_inf_adm_1: 2×3 — PEP + VoBo
    const tbl1 = this._tablas.crearTabla(TBL1_ROWS.length, TBL1_COLS.length, 'tbl_inf_adm_1')
    tbl1.coordenadaOrigen = [ox, oy - Y_ADM1]
    TBL1_ROWS.forEach((h, i) => tbl1.renglones.elemento(i + 1).longitud = h)
    TBL1_COLS.forEach((w, i) => tbl1.columnas.elemento(i + 1).longitud  = w)
    this.ocultarBordesCeldas(tbl1, {
      borderDer:    [[1,1],[2,1]],
      borderSupInf: [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3]],
    })

    // tbl_inf_adm_2: 2×4 — logo + proyecto + programa
    const tbl2 = this._tablas.crearTabla(TBL2_ROWS.length, TBL2_COLS.length, 'tbl_inf_adm_2')
    tbl2.coordenadaOrigen = [ox, oy - Y_ADM2]
    TBL2_ROWS.forEach((h, i) => tbl2.renglones.elemento(i + 1).longitud = h)
    TBL2_COLS.forEach((w, i) => tbl2.columnas.elemento(i + 1).longitud  = w)
    this.ocultarBordesCeldas(tbl2, {
      borderDerIzq: [[1,3],[2,3]],
      borderInf:    [[1,2],[2,3],[1,3],[1,4]],
    })

    // tbl_inf_adm_3: 7×6 — detail grid (cable, supervisor, siglas, fecha, OPB/OEI/OE, distritos, hoja)
    const tbl3 = this._tablas.crearTabla(TBL3_ROWS.length, TBL3_COLS.length, 'tbl_inf_adm_3')
    tbl3.coordenadaOrigen = [ox, oy - Y_ADM3]
    TBL3_ROWS.forEach((h, i) => tbl3.renglones.elemento(i + 1).longitud = h)
    TBL3_COLS.forEach((w, i) => tbl3.columnas.elemento(i + 1).longitud  = w)
    this.ocultarBordesCeldas(tbl3, {
      borderDer: [
        [3,1],[4,1],[5,1],[5,2],[5,3],[5,4],[5,5],
        [6,1],[6,2],[6,3],[6,4],[6,5],
        [7,1],[7,2],[7,3],[7,4],[7,6],
      ],
      borderDerIzq: [[1,2],[2,2],[7,1],[7,5],[7,6]],
      borderSupInf: [
        [1,2],[1,3],
        [5,2],[5,3],[5,4],[5,5],
        [7,1],[7,2],[7,3],[7,4],[7,5],[7,6],
      ],
      borderInf: [[5,1],[5,6]],
    })
  }

  // Magik: etiqueta_celdas — all GIS-driven; static labels listed here for reference (Fase 5)
  override etiquetarCeldas(): void {
    // tbl_4(1,1):          "RED PRINCIPAL DE FIBRA OPTICA" [67pt, red, bold]
    // tbl_4(2,1):          str_ctl                          [45pt, bold, GIS]
    // tbl_4(3,1):          str_nco                          [37pt, GIS]
    // tbl_4(4,1):          "JALADO DE CABLE DE:"            [30pt, :centre_left]
    // tbl_inf_adm_1(1,1):  "PEPS:"                          [45pt, :centre_left, bold]
    // tbl_inf_adm_1(1,3):  "VoBo RNUM"                      [30pt, :centre_centre]
    // tbl_inf_adm_2(1,1):  "REALIZO:"                       [22pt, :centre_centre]
    // tbl_inf_adm_2(1,2):  "PROYECTO:"                      [22pt, :centre_left]
    // tbl_inf_adm_2(1,3):  "PROGRAMA"                       [22pt, :centre_left]
    // tbl_inf_adm_3(1,1):  "No.DE CABLE"                    [22pt, :centre_centre]
    // tbl_inf_adm_3(1,2):  "SUPERVISO:"                     [22pt, :centre_centre]
    // tbl_inf_adm_3(1,5):  "CONSTRUCCION"                   [30pt, :centre_centre]
    // tbl_inf_adm_3(1,6):  "DESMONTAJE"                     [30pt, :centre_centre]
    // tbl_inf_adm_3(2,4):  "OPB:"                           [22pt, :centre_left]
    // tbl_inf_adm_3(3,4):  "OEI:"                           [22pt, :centre_left]
    // tbl_inf_adm_3(4,4):  "OE:"                            [22pt, :centre_left]
    // tbl_inf_adm_3(3,1):  "SIGLAS"                         [22pt, :centre_left, angulo 10]
    // tbl_inf_adm_3(3,3):  "FECHA"                          [22pt, :centre_centre]
    // tbl_inf_adm_3(5,1):  "DISTRITOS AFECTADOS"            [22pt, :centre_left]
    // tbl_inf_adm_3(7,6):  "PLANO 2 DE 3"                   [22pt, :centre_left]
    // tbl_inf_adm_2(2,1):  logo_empresa                     [GIS: proy.user!_empresa_proyecto]
  }

  // Magik: llena_datos_celdas — GIS data + attribute overrides
  override llenarDatosCeldas(): void {
    // All GIS-computed values are Fase 5. Attribute overrides applied directly:
    const datos = this.infoSelloPropiedades({
      programa:   '',  // GIS: Fase 5
      pep:        '',
      vobo:       '',
      proyecto:   '',
      supervisor: '',
      constOpb:   '',
      constOei:   '',
      constOe:    '',
      desmOpb:    '',
      desmOei:    '',
      desmOe:     '',
      fecha:      '',
      siglas:     '',
      jaladocable:'',
      numcable:   '',
      distritos:  '',
      hoja:       'PLANO 2 DE 3',
    })

    // Logo: empproyecto attribute → override GIS empresa_proyecto
    const logoP = this.logoProyecta()
    if (logoP) {
      this._valorEmpproyecto = logoP
      this.asignarSimboloCelda('tbl_inf_adm_2', 2, 1, this._valorEmpproyecto, 1)
    }

    // Data cells (attribute-override values)
    if (datos.programa)    this.asignarTextoCelda('tbl_inf_adm_2', 2, 3, datos.programa,    30, 'centre_left')
    if (datos.numcable)    this.asignarTextoCelda('tbl_inf_adm_3', 2, 1, datos.numcable,    22, 'centre_centre', 0, COLOR_RED)
    if (datos.distritos)   this.asignarTextoCelda('tbl_inf_adm_3', 6, 1, datos.distritos,   22, 'top_left',      0, COLOR_RED)
    if (datos.desmOpb)     this.asignarTextoCelda('tbl_inf_adm_3', 2, 6, datos.desmOpb,     30, 'centre_centre', 0, COLOR_RED)
    if (datos.desmOei)     this.asignarTextoCelda('tbl_inf_adm_3', 3, 6, datos.desmOei,     30, 'centre_centre', 0, COLOR_RED)
    if (datos.desmOe)      this.asignarTextoCelda('tbl_inf_adm_3', 4, 6, datos.desmOe,      30, 'centre_centre', 0, COLOR_RED)
    if (datos.pep)         this.asignarTextoCelda('tbl_inf_adm_1', 1, 2, datos.pep,         45, 'centre_centre', 0, COLOR_RED)
    if (datos.vobo)        this.asignarTextoCelda('tbl_inf_adm_1', 2, 3, datos.vobo,        30, 'centre_centre')
    if (datos.proyecto)    this.asignarTextoCelda('tbl_inf_adm_2', 2, 2, datos.proyecto,    30, 'centre_left')
    if (datos.supervisor)  this.asignarTextoCelda('tbl_inf_adm_3', 2, 2, datos.supervisor,  30, 'centre_left')
    if (datos.siglas)      this.asignarTextoCelda('tbl_inf_adm_3', 4, 1, datos.siglas,      22, 'centre_left', 10)
    if (datos.fecha)       this.asignarTextoCelda('tbl_inf_adm_3', 4, 3, datos.fecha,       22, 'centre_centre')
    if (datos.constOpb)    this.asignarTextoCelda('tbl_inf_adm_3', 2, 5, datos.constOpb,    30, 'centre_centre', 0, COLOR_RED)
    if (datos.constOei)    this.asignarTextoCelda('tbl_inf_adm_3', 3, 5, datos.constOei,    30, 'centre_centre', 0, COLOR_RED)
    if (datos.constOe)     this.asignarTextoCelda('tbl_inf_adm_3', 4, 5, datos.constOe,     30, 'centre_centre', 0, COLOR_RED)
    if (datos.hoja)        this.asignarTextoCelda('tbl_inf_adm_3', 7, 6, datos.hoja,        22, 'centre_left')
    if (datos.jaladocable) this.asignarTextoCelda('tbl_4',         4, 1, datos.jaladocable, 30, 'top_left')
  }

  // Magik: info_sello_propiedades — applies attribute overrides to the GIS-computed datos map
  infoSelloPropiedades(datos: Record<string, string>): Record<string, string> {
    const apply = (key: string, attrVal: string): void => {
      datos[key] = this.valorPropiedad(attrVal, datos[key] ?? '')
    }
    apply('programa',   this.programa)
    apply('jaladocable',this.jaladocable)
    apply('numcable',   this.numcable)
    apply('distritos',  this.distritos)
    apply('hoja',       this.hoja)
    apply('desm_opb',   this.desmOpb)
    apply('desm_oei',   this.desmOei)
    apply('desm_oe',    this.desmOe)
    apply('pep',        this.pep)
    apply('vobo',       this.vobo)
    apply('proyecto',   this.proyecto)
    apply('supervisor', this.supervisor)
    apply('siglas',     this.siglas)
    apply('fecha',      this.fecha)
    apply('const_opb',  this.constOpb)
    apply('const_oei',  this.constOei)
    apply('const_oe',   this.constOe)
    // mirror snake_case keys to camelCase for llenarDatosCeldas consumers
    datos.desmOpb  = datos['desm_opb']  ?? datos.desmOpb  ?? ''
    datos.desmOei  = datos['desm_oei']  ?? datos.desmOei  ?? ''
    datos.desmOe   = datos['desm_oe']   ?? datos.desmOe   ?? ''
    datos.constOpb = datos['const_opb'] ?? datos.constOpb ?? ''
    datos.constOei = datos['const_oei'] ?? datos.constOei ?? ''
    datos.constOe  = datos['const_oe']  ?? datos.constOe  ?? ''
    return datos
  }

  // Magik: calcula_informacion — all GIS reads (Fase 5)
  calcularInformacion(): Record<string, string> {
    return {}  // Fase 5: reads from swg_dsn_admin_engine, c_proyecto, etc.
  }

  override obtenerRegistros(): unknown { return undefined }

  // Magik: busca_objeto — GIS map view query (Fase 5)
  buscarObjeto(_name: string): void { /* Fase 5 */ }
}
