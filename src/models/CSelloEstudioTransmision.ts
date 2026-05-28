// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello_estudio_transmision.magik
// Full transmission-study sello. Extends c_base_sello_fibra (allowed_on_menu = false).
// Layout is fully dynamic: all table dimensions scale with bounds and empalme count.
//
// 5 tables:
//   tbl_general       : 1×1  rows=[alto]         cols=[largo]                at coordInicio
//   tbl_primera_parte : 1×3  rows=[alto*0.2]     cols=[30%,50%,20% of largo] at coordInicio
//   tbl_estudio_num   : CTblLineaHorizontal 1×5  at (ox+largo*8, oy-alto*2/2.3)  — Fase 5 type
//   tbl_segunda_parte : 4×1  rows=[3%,7.5%,3%,30% of alto×2] cols=[largo]  at (ox, oy-alto*2)
//   tbl_tercera_parte : 5×6  rows=5×4mm cols=[10%,15%,10%,15%,1%,49% of largo] at (ox, oy-1450)
//
// Layout factors:
//   alto  = (height) / 10
//   largo = width/10 + empalmes + 30        when empalmes ≤ 10
//         = width*(empalmes/100)+empalmes+30 when empalmes > 10

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EstudioTransmisionBounds {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export interface EstudioTransmisionLayoutFactors {
  largo:    number
  alto:     number
  empalmes: number
}

// Data assembled by obtenerDatos() + infoSelloPropiedades()
export interface EstudioTransmisionValues {
  enlace:        string
  cable:         string
  longitud:      string
  vobo1:         string
  nombre1:       string
  firma1:        string
  fecha1:        string
  vobo2:         string
  nombre2:       string
  firma2:        string
  fecha2:        string
  observaciones: string
  notas:         string
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SelloEstudioTransmisionConfig {
  bounds?:        EstudioTransmisionBounds
  empreviso?:     string  // enum: 'TELMEX' | 'ULTIMA_MILLA' | 'ULTIMA_MILLA_N'
  estudioNum?:    string
  notas?:         string
  vobo1?:         string
  nombre1?:       string
  firma1?:        string
  fecha1?:        string
  vobo2?:         string
  nombre2?:       string
  firma2?:        string
  fecha2?:        string
  observaciones?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SELLO_ET_DEFAULTS = {
  bounds:        { xmin: 0, ymin: 0, xmax: 1200, ymax: 600 } as EstudioTransmisionBounds,
  notasDefault:  'OBSERVACIONES: SE CONSIDERAN DOS CONECTORES POR CENTRAL',
  // tbl_tercera_parte is anchored at oy - 1450 (fixed, not from bounds)
  yCTerceraParte: -1450,
} as const

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloEstudioTransmision extends CBaseSelloFibra {
  // Magik: oEngine — GIS route object (Fase 5)
  private _engine: unknown = undefined
  // Magik: pseudo-slot grafico — c_estudio_transmision_grafico (Fase 5)
  grafico: unknown = undefined

  bounds: EstudioTransmisionBounds = { ...SELLO_ET_DEFAULTS.bounds }

  // ── Attributes ────────────────────────────────────────────────────────────

  empreviso:     string = ''
  estudioNum:    string = ''
  notas:         string = SELLO_ET_DEFAULTS.notasDefault
  vobo1:         string = ''
  nombre1:       string = ''
  firma1:        string = ''
  fecha1:        string = ''
  vobo2:         string = ''
  nombre2:       string = ''
  firma2:        string = ''
  fecha2:        string = ''
  observaciones: string = ''

  constructor(config?: SelloEstudioTransmisionConfig) {
    super()
    if (config?.bounds        !== undefined) this.bounds        = config.bounds
    if (config?.empreviso     !== undefined) this.empreviso     = config.empreviso
    if (config?.estudioNum    !== undefined) this.estudioNum    = config.estudioNum
    if (config?.notas         !== undefined) this.notas         = config.notas
    if (config?.vobo1         !== undefined) this.vobo1         = config.vobo1
    if (config?.nombre1       !== undefined) this.nombre1       = config.nombre1
    if (config?.firma1        !== undefined) this.firma1        = config.firma1
    if (config?.fecha1        !== undefined) this.fecha1        = config.fecha1
    if (config?.vobo2         !== undefined) this.vobo2         = config.vobo2
    if (config?.nombre2       !== undefined) this.nombre2       = config.nombre2
    if (config?.firma2        !== undefined) this.firma2        = config.firma2
    if (config?.fecha2        !== undefined) this.fecha2        = config.fecha2
    if (config?.observaciones !== undefined) this.observaciones = config.observaciones
  }

  get engine(): unknown      { return this._engine }
  set engine(v: unknown)     { this._engine = v; this.guardarElementosBdGis() }

  // Magik: enum_tipo_empresar
  enumTipoEmpresar(): Map<number, string> {
    return new Map([
      [1, 'TELMEX'],
      [2, 'ULTIMA_MILLA'],
      [3, 'ULTIMA_MILLA_N'],
    ])
  }

  // Magik: logo symbol name derived from empreviso attribute
  logoSymbolName(): string {
    if (!this.empreviso.trim()) return 'logo_ultima_milla'
    const sym = `logo_${this.empreviso.toUpperCase()}`
    if (sym.toUpperCase().includes('TELMEX')) return sym + '_EP'
    return sym
  }

  // Pure helper — all table sizes derive from this.
  computeLayoutFactors(mockEmpalmes?: number): EstudioTransmisionLayoutFactors {
    const empalmes = mockEmpalmes ?? this.totalEmpalmes()
    const width  = this.bounds.xmax - this.bounds.xmin
    const height = this.bounds.ymax - this.bounds.ymin
    const alto   = height / 10

    let largo: number
    if (empalmes > 0 && empalmes > 10) {
      largo = width * (empalmes / 100) + empalmes + 30
    } else {
      largo = width / 10 + empalmes + 30
    }
    return { largo, alto, empalmes }
  }

  // Magik: configura_tabla
  override configurarTabla(): void {
    const { largo, alto } = this.computeLayoutFactors()
    const [ox, oy] = this._coordInicio

    // tbl_general: 1×1 — outer container
    const tblGen = this._tablas.crearTabla(1, 1, 'tbl_general')
    tblGen.coordenadaOrigen = [ox, oy]
    tblGen.renglones.elemento(1).longitud = alto
    tblGen.columnas.elemento(1).longitud  = largo

    // tbl_primera_parte: 1×3 — logo | title | study-number area
    const tblPrim = this._tablas.crearTabla(1, 3, 'tbl_primera_parte')
    tblPrim.coordenadaOrigen = [ox, oy]
    tblPrim.renglones.elemento(1).longitud = alto * 0.2
    tblPrim.columnas.elemento(1).longitud  = largo * 0.3
    tblPrim.columnas.elemento(2).longitud  = largo * 0.5
    tblPrim.columnas.elemento(3).longitud  = largo * 0.2

    // tbl_estudio_num: CTblLineaHorizontal — 1×5, at ox+largo*8, oy-alto*2/2.3
    // Modelled as plain 1×2 table (label + value); CTblLineaHorizontal is Fase 5 type
    const tblEstudio = this._tablas.crearTabla(1, 2, 'tbl_estudio_num')
    tblEstudio.coordenadaOrigen = [ox + largo * 8, oy - (alto * 2 / 2.3)]
    tblEstudio.renglones.elemento(1).longitud = alto * 0.2
    tblEstudio.columnas.elemento(1).longitud  = largo * 0.1
    tblEstudio.columnas.elemento(2).longitud  = largo * 0.1

    // tbl_segunda_parte: 4×1 — tramo name / cable / longitud / grafico
    const tblSeg = this._tablas.crearTabla(4, 1, 'tbl_segunda_parte')
    tblSeg.coordenadaOrigen = [ox, oy - alto * 2]
    tblSeg.renglones.elemento(1).longitud = alto * 0.03
    tblSeg.renglones.elemento(2).longitud = alto * 0.03 * 2.5
    tblSeg.renglones.elemento(3).longitud = alto * 0.03
    tblSeg.renglones.elemento(4).longitud = alto * 0.3
    tblSeg.columnas.elemento(1).longitud  = largo
    this.ocultarBordesCeldas(tblSeg, {
      borderInf: [[1,1],[2,1],[3,1],[4,1]],
      borderSup: [[1,1],[2,1],[3,1],[4,1]],
    })

    // tbl_tercera_parte: 5×6 — approval blocks + observations + notes
    // Fixed y-offset at oy - 1450 (not bounds-derived)
    const anchot        = largo * 0.10
    const anchov        = largo * 0.15
    const anchoespacio  = largo * 0.01
    const anchoobs      = largo * 0.49

    const tblTerc = this._tablas.crearTabla(5, 6, 'tbl_tercera_parte')
    tblTerc.coordenadaOrigen = [ox, oy - 1450]
    for (let r = 1; r <= 5; r++) tblTerc.renglones.elemento(r).longitud = 4
    tblTerc.columnas.elemento(1).longitud = anchot
    tblTerc.columnas.elemento(2).longitud = anchov
    tblTerc.columnas.elemento(3).longitud = anchot
    tblTerc.columnas.elemento(4).longitud = anchov
    tblTerc.columnas.elemento(5).longitud = anchoespacio
    tblTerc.columnas.elemento(6).longitud = anchoobs

    this.ocultarBordesCeldas(tblTerc, {
      borderSupInf: [[1,1],[1,2],[1,3],[1,4],[2,1],[2,3],[3,1],[3,3],[4,1],[4,3],[1,5],[2,5],[3,5],[4,5],[1,6]],
      borderDerIzq: [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5],[2,2],[2,3],[2,4],[3,2],[3,3],[3,4],[4,2],[4,3],[4,4],[5,2],[5,3],[5,4]],
      borderDer:    [[2,1],[3,1],[4,1],[5,1]],
    })
  }

  // Magik: etiqueta_celdas
  override etiquetarCeldas(): void {
    this.asignarTextoCelda('tbl_primera_parte', 1, 2, 'ESTUDIO DE TRANSMISION F.O', 80, 'centre_centre')

    this.asignarTextoCelda('tbl_estudio_num', 1, 1, ' EST. NO.', 30, undefined)
    // tbl_estudio_num col 2: value set in llenarDatosDinamicos

    this.asignarTextoCelda('tbl_segunda_parte', 1, 1, 'Nombre del tramo',          35, undefined)
    this.asignarTextoCelda('tbl_segunda_parte', 2, 1, 'Numero de fibras y tipo',    35, undefined)
    this.asignarTextoCelda('tbl_segunda_parte', 3, 1, 'LONGITUD TOTAL DEL ENLACE: ',35, undefined)

    this.asignarTextoCelda('tbl_tercera_parte', 1, 1, 'OBSERVACIONES: SE CONSIDERAN DOS CONECTORES POR CENTRAL', 35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 2, 1, 'Vo. Bo.:',  35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 3, 1, 'NOMBRE:',   35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 4, 1, 'FIRMA:',    35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 5, 1, 'FECHA',     35, 'centre_left')

    this.asignarTextoCelda('tbl_tercera_parte', 2, 3, 'Vo. Bo.:',  35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 3, 3, 'NOMBRE:',   35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 4, 3, 'FIRMA:',    35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 5, 3, 'FECHA',     35, 'centre_left')

    this.asignarTextoCelda('tbl_tercera_parte', 2, 6, 'OBSERVACIONES', 35, 'centre_left')
  }

  // Magik: llena_datos_celdas
  override llenarDatosCeldas(): void {
    const valores = this.infoSelloPropiedades(this.obtenerDatos())

    // Logo symbol (empreviso attribute)
    // Magik: asigna_simbolo_celda — Fase 5 for actual symbol; uses empreviso to pick logo
    if (this.empreviso.trim()) {
      this.asignarSimboloCelda('tbl_primera_parte', 1, 1, this.logoSymbolName(), 5)
    }

    this.asignarTextoCelda('tbl_segunda_parte', 1, 1, valores.enlace,   25, undefined)
    this.asignarTextoCelda('tbl_segunda_parte', 2, 1, valores.cable,    25, undefined)
    this.asignarTextoCelda('tbl_segunda_parte', 3, 1, valores.longitud, 30, undefined)

    this.asignarTextoCelda('tbl_tercera_parte', 2, 2, valores.vobo1,   35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 3, 2, valores.nombre1, 35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 4, 2, valores.firma1,  35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 5, 2, valores.fecha1,  35, 'centre_left')

    this.asignarTextoCelda('tbl_tercera_parte', 2, 4, valores.vobo2,   35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 3, 4, valores.nombre2, 35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 4, 4, valores.firma2,  35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 5, 4, valores.fecha2,  35, 'centre_left')

    this.asignarTextoCelda('tbl_tercera_parte', 3, 6, valores.observaciones, 35, 'centre_left')
    this.asignarTextoCelda('tbl_tercera_parte', 1, 1, valores.notas,         35, 'centre_left')

    // grafico assigned to tbl_segunda_parte(4,1) — Fase 5
  }

  // Magik: llena_datos_dinamicos — assigns estudio_num and updates grafico
  protected override llenarDatosDinamicos(): void {
    this.asignarTextoCelda('tbl_estudio_num', 1, 2, this.estudioNum, 45, 'centre_centre')
    // Fase 5: grafico.setEngine + xml-origin reattach
  }

  // Magik: obtener_datos — assembles valores property_list (GIS for enlace/cable/longitud)
  obtenerDatos(): EstudioTransmisionValues {
    return {
      enlace:        '',   // Fase 5: active_scheme.project.name
      cable:         '',   // Fase 5: getCablesSalida()
      longitud:      `${this.getDistanciaRuta().toFixed(3)} km`,
      vobo1: '', nombre1: '', firma1: '', fecha1: '',
      vobo2: '', nombre2: '', firma2: '', fecha2: '',
      observaciones: '',
      notas:         SELLO_ET_DEFAULTS.notasDefault,
    }
  }

  // Magik: info_sello_propiedades — applies attribute overrides to valores
  infoSelloPropiedades(v: EstudioTransmisionValues): EstudioTransmisionValues {
    return {
      ...v,
      vobo1:         this.valorPropiedad('vobo1',         v.vobo1),
      nombre1:       this.valorPropiedad('nombre1',       v.nombre1),
      firma1:        this.valorPropiedad('firma1',        v.firma1),
      fecha1:        this.valorPropiedad('fecha1',        v.fecha1),
      vobo2:         this.valorPropiedad('vobo2',         v.vobo2),
      nombre2:       this.valorPropiedad('nombre2',       v.nombre2),
      firma2:        this.valorPropiedad('firma2',        v.firma2),
      fecha2:        this.valorPropiedad('fecha2',        v.fecha2),
      observaciones: this.valorPropiedad('observaciones', v.observaciones),
      notas:         this.valorPropiedad('notas',         v.notas),
    }
  }

  // Magik: valor_propiedad — attribute override; returns attribute if non-empty
  valorPropiedad(attr: keyof CSelloEstudioTransmision, fallback: string): string {
    const val = fallback === undefined ? '' : fallback
    const override = this[attr]
    if (typeof override === 'string' && override.trim().length > 0) return override
    return val
  }

  // Magik: total_empalmes — counts splice_closure in oEngine. Fase 5 → 0.
  totalEmpalmes(): number { return 0 }

  // Magik: getdistanciaruta — sums sheath km_real_medido. Fase 5 → 0.
  getDistanciaRuta(): number { return 0 }

  // Magik: getcablessalida — pipe-separated sheath spec_ids. Fase 5 → ''.
  getCablesSalida(): string { return '' }

  // GIS stubs (Fase 5)
  guardarElementosBdGis(): void  { /* Fase 5 */ }
  obtenerElementosBdGis(): void  { /* Fase 5 */ }
  postInitialisation(): void     { this.obtenerElementosBdGis() }

  // Magik: tamanio_tbl_notas / tamanio_tbl_observaciones — dynamic row resize. Fase 5.
  tamanoTblNotas(): void         { /* Fase 5 */ }
  tamanoTblObservaciones(): void { /* Fase 5 */ }
}
