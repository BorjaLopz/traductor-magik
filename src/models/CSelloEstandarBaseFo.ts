// Source: planos_fo/source/ruta_cables/sellos/c_sello_estandar_base_fo.magik
// Base sello for Ruta de Cables plans. Extends c_base_sello_fibra. Subclassable.
// 7 tables (all mm, no scale): tbl_ubicacion, tbl_compania, tbl_FecDibRev,
// tbl_escala, tbl_proy_ctl, tbl_siglas, tbl_del_mpo (all borders hidden).
// tbl_del_mpo offset = tbl_ubicacion cols (15) + tbl_compania(25) +
//   tbl_FecDibRev(35) + tbl_escala(22) + tbl_proy_ctl(100) + tbl_siglas(60) + 100 gap = 357

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelloEstandarBaseFoConfig {
  razonSocial?:      string  // display value from enumTipoRazonSocial
  nombre?:           string  // display value from enumTipoNombre
  fecha?:            string
  proyectaEmpresa?:  string
  revisaEmpresa?:    string
  escalaManual?:     string  // Magik: attributes[:escala] — user override (renamed: base class has escala() method)
  estado?:           string
  municipio?:        string
  colonia?:          string
  codigoPostal?:     string
  loNombreNco?:      string
  loNcoSiglas?:      string
  nombreCtl?:        string
  siglasCtl?:        string
  ubicacionPlano?:   string
}

// ─── Layout constants ─────────────────────────────────────────────────────────

export const TABLA_SELLOBASE_FO = {
  ubicacion:  { nombre: 'tbl_ubicacion', rows: [274],         cols: [15],     ox: 0,   oy: 0    },
  compania:   { nombre: 'tbl_compania',  rows: [5, 5, 5],     cols: [25],     ox: 15,  oy: -124 },
  fecDibRev:  { nombre: 'tbl_FecDibRev', rows: [5, 5, 5],    cols: [15, 20], ox: 40,  oy: -124 },
  escala:     { nombre: 'tbl_escala',    rows: [5, 10],       cols: [22],     ox: 75,  oy: -124 },
  proyCTL:    { nombre: 'tbl_proy_ctl',  rows: [7.5, 7.5],   cols: [100],    ox: 97,  oy: -124 },
  siglas:     { nombre: 'tbl_siglas',    rows: [15],          cols: [60],     ox: 197, oy: -124 },
  delMpo:     { nombre: 'tbl_del_mpo',   rows: [5, 5, 5, 5], cols: [45, 45], ox: 357, oy: 26   },
} as const

// Purple/magenta used for project and siglas cells: rgb(255, 66, 178) ≈ [1.0, 0.2593, 0.7]
export const COLOR_PROY_CTL: [number, number, number] = [1.0, 0.2593, 0.7]

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloEstandarBaseFo extends CBaseSelloFibra {
  // Magik: oTipoEmpresaRazonS, oTipoNombre — GIS enum objects (Fase 5)
  protected _tipoEmpresaRazonS: unknown = undefined
  protected _tipoNombre:        unknown = undefined

  // Magik: o_distrito, o_proyecto — GIS entities (Fase 5)
  protected _distrito: unknown = undefined
  protected _proyecto: unknown = undefined

  // Magik: pl_datos — property_list populated by obtenRegistros (Fase 5)
  protected _plDatos: Map<string, string> = new Map()

  // ── Attributes (layout_attribute_definition :string) ─────────────────────

  razonSocial:      string = ''
  nombre:           string = ''
  fecha:            string = ''
  proyectaEmpresa:  string = ''
  revisaEmpresa:    string = ''
  escalaManual:     string = ''  // Magik: attributes[:escala]
  estado:           string = ''
  municipio:        string = ''
  colonia:          string = ''
  codigoPostal:     string = ''
  loNombreNco:      string = ''
  loNcoSiglas:      string = ''
  nombreCtl:        string = ''
  siglasCtl:        string = ''
  ubicacionPlano:   string = ''

  constructor(config?: SelloEstandarBaseFoConfig) {
    super()
    if (config) {
      if (config.razonSocial     !== undefined) this.razonSocial     = config.razonSocial
      if (config.nombre          !== undefined) this.nombre          = config.nombre
      if (config.fecha           !== undefined) this.fecha           = config.fecha
      if (config.proyectaEmpresa !== undefined) this.proyectaEmpresa = config.proyectaEmpresa
      if (config.revisaEmpresa   !== undefined) this.revisaEmpresa   = config.revisaEmpresa
      if (config.escalaManual    !== undefined) this.escalaManual    = config.escalaManual
      if (config.estado          !== undefined) this.estado          = config.estado
      if (config.municipio       !== undefined) this.municipio       = config.municipio
      if (config.colonia         !== undefined) this.colonia         = config.colonia
      if (config.codigoPostal    !== undefined) this.codigoPostal    = config.codigoPostal
      if (config.loNombreNco     !== undefined) this.loNombreNco     = config.loNombreNco
      if (config.loNcoSiglas     !== undefined) this.loNcoSiglas     = config.loNcoSiglas
      if (config.nombreCtl       !== undefined) this.nombreCtl       = config.nombreCtl
      if (config.siglasCtl       !== undefined) this.siglasCtl       = config.siglasCtl
      if (config.ubicacionPlano  !== undefined) this.ubicacionPlano  = config.ubicacionPlano
    }
  }

  // Magik: enum_tipo_razon_social
  enumTipoRazonSocial(): Map<number, string> {
    return new Map([
      [3, 'TELEFONOS|DE MEXICO|S.A.B de C.V.'],
      [1, 'RED|NACIONAL|ULTIMA MILLA'],
      [2, 'RED|ULTIMA MILLA|DEL NOROESTE'],
    ])
  }

  // Magik: enum_tipo_nombre
  enumTipoNombre(): Map<number, string> {
    return new Map([
      [1, 'RUTA DE CABLES'],
      [2, 'ESQUEMATICO DE PRINCIPALES'],
      [3, 'PLANO DE DETALLES'],
    ])
  }

  // Magik: compania_lineas (derived from razon_social split by "|")
  companiaLineas(): [string, string, string] {
    const parts = this.razonSocial.split('|')
    return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? '']
  }

  // Magik: compania_abrev — abbreviation for tbl_FecDibRev(3,2)
  companiaAbrev(): string {
    const up = this.razonSocial.toUpperCase()
    if (up.includes('TELEFONOS')) return 'TELMEX'
    if (up.includes('NOROESTE'))  return 'RUMN'
    if (up.includes('NACIONAL'))  return 'RNUM'
    return 'TELMEX'
  }

  // Magik: compania font size — TELEFONOS uses 35, NACIONAL/NOROESTE use 23
  companiaFontSize(): number {
    const up = this.razonSocial.toUpperCase()
    if (up.includes('TELEFONOS')) return 35
    return 23
  }

  // Magik: tipo_nombre_plano — maps tipo_plano string to display label
  tipoNombrePlano(tipoplano?: string): string {
    if (tipoplano === 'detalles_construccion')  return 'PLANO DE DETALLES'
    if (tipoplano === 'esquema_principales')    return 'ESQUEMATICO DE PRINCIPALES'
    return 'RUTA DE CABLES'
  }

  // Magik: valor_propiedad — returns attribute value if non-empty, else datoActual
  valorPropiedad(propiedad: keyof CSelloEstandarBaseFo, datoActual: string): string {
    const v = this[propiedad]
    if (typeof v === 'string' && v.trim().length > 0) return v
    return datoActual
  }

  // Magik: info_sello_propiedades — applies attribute overrides into plDatos
  infoSelloPropiedades(plDatos: Map<string, string>): Map<string, string> {
    const out = new Map(plDatos)
    out.set('fecha',            this.valorPropiedad('fecha',           out.get('fecha')           ?? ''))
    out.set('escala',           this.valorPropiedad('escalaManual',    out.get('escala')          ?? ''))
    out.set('estado',           this.valorPropiedad('estado',          out.get('estado')          ?? ''))
    out.set('municipio',        this.valorPropiedad('municipio',       out.get('municipio')       ?? ''))
    out.set('colonia',          this.valorPropiedad('colonia',         out.get('colonia')         ?? ''))
    out.set('codigo_postal',    this.valorPropiedad('codigoPostal',    out.get('codigo_postal')   ?? ''))
    out.set('proyecta_empresa', this.valorPropiedad('proyectaEmpresa', out.get('proyecta_empresa')  ?? ''))
    out.set('revisa_empresa',   this.valorPropiedad('revisaEmpresa',   out.get('revisa_empresa')  ?? ''))
    out.set('lonombrenco',      this.valorPropiedad('loNombreNco',     out.get('lonombrenco')     ?? ''))
    out.set('loncosiglas',      this.valorPropiedad('loNcoSiglas',     out.get('loncosiglas')     ?? ''))
    out.set('nombre_ctl',       this.valorPropiedad('nombreCtl',       out.get('nombre_ctl')      ?? ''))
    out.set('siglas_ctl',       this.valorPropiedad('siglasCtl',       out.get('siglas_ctl')      ?? ''))
    out.set('nombre',           this.valorPropiedad('nombre',          out.get('nombre')          ?? ''))
    return out
  }

  // Magik: configura_tabla — 7 tables (dimensions in mm, no scale factor)
  override configurarTabla(): void {
    const [ox, oy] = this._coordInicio

    // tbl_ubicacion: 1×1 — tall left strip (bDibuja_bordes? = false)
    const tblUbic = this._tablas.crearTabla(1, 1, 'tbl_ubicacion')
    tblUbic.coordenadaOrigen = [ox, oy]
    tblUbic.renglones.elemento(1).longitud = 274
    tblUbic.columnas.elemento(1).longitud  = 15

    // tbl_compania: 3×1 — company name (bDibuja_Renglones_Internos? = false)
    // ox offset = 15 (tbl_ubicacion cols); oy = oy - (274 - 150) = oy - 124
    const tblComp = this._tablas.crearTabla(3, 1, 'tbl_compania')
    tblComp.coordenadaOrigen = [ox + 15, oy - 124]
    for (let r = 1; r <= 3; r++) tblComp.renglones.elemento(r).longitud = 5
    tblComp.columnas.elemento(1).longitud = 25

    // tbl_FecDibRev: 3×2 — date/drawn/revised
    // ox offset = 15+25 = 40
    const tblFec = this._tablas.crearTabla(3, 2, 'tbl_FecDibRev')
    tblFec.coordenadaOrigen = [ox + 40, oy - 124]
    for (let r = 1; r <= 3; r++) tblFec.renglones.elemento(r).longitud = 5
    tblFec.columnas.elemento(1).longitud = 15
    tblFec.columnas.elemento(2).longitud = 20

    // tbl_escala: 2×1 — scale label + value
    // ox offset = 15+25+35 = 75
    const tblEsc = this._tablas.crearTabla(2, 1, 'tbl_escala')
    tblEsc.coordenadaOrigen = [ox + 75, oy - 124]
    tblEsc.renglones.elemento(1).longitud = 5
    tblEsc.renglones.elemento(2).longitud = 10
    tblEsc.columnas.elemento(1).longitud  = 22

    // tbl_proy_ctl: 2×1 — project/CTL names (bDibuja_Renglones_Internos? = false)
    // ox offset = 15+25+35+22 = 97
    const tblProy = this._tablas.crearTabla(2, 1, 'tbl_proy_ctl')
    tblProy.coordenadaOrigen = [ox + 97, oy - 124]
    tblProy.renglones.elemento(1).longitud = 7.5
    tblProy.renglones.elemento(2).longitud = 7.5
    tblProy.columnas.elemento(1).longitud  = 100

    // tbl_siglas: 1×1 — NCO siglas (bDibuja_Renglones_Internos? = false)
    // ox offset = 15+25+35+22+100 = 197
    const tblSig = this._tablas.crearTabla(1, 1, 'tbl_siglas')
    tblSig.coordenadaOrigen = [ox + 197, oy - 124]
    tblSig.renglones.elemento(1).longitud = 15
    tblSig.columnas.elemento(1).longitud  = 60

    // tbl_del_mpo: 4×2 — municipality data; +100mm explicit gap after siglas
    // ox offset = 15+25+35+22+100+60+100 = 357
    // oy offset = oy - (274 - 300) = oy + 26
    const tblDelMpo = this._tablas.crearTabla(4, 2, 'tbl_del_mpo')
    tblDelMpo.coordenadaOrigen = [ox + 357, oy + 26]
    for (let r = 1; r <= 4; r++) tblDelMpo.renglones.elemento(r).longitud = 5
    tblDelMpo.columnas.elemento(1).longitud = 45
    tblDelMpo.columnas.elemento(2).longitud = 45
    // All 8 cells: hide every border (bDibuja_Columnas_Internas? = bDibuja_Renglones_Internos? = false)
    const allCells: [number, number][] = [
      [1,1],[1,2],[2,1],[2,2],[3,1],[3,2],[4,1],[4,2],
    ]
    this.ocultarBordesCeldas(tblDelMpo, {
      borderDerIzq: allCells,
      borderSupInf: allCells,
    })
  }

  // Magik: etiqueta_celdas — static labels
  override etiquetarCeldas(): void {
    // tbl_compania defaults (overridden by llenarDatosCeldas when razon_social set)
    this.asignarTextoCelda('tbl_compania', 1, 1, 'RED NACIONAL', 32, undefined)
    this.asignarTextoCelda('tbl_compania', 2, 1, 'ÚLTIMA',       32, undefined)
    this.asignarTextoCelda('tbl_compania', 3, 1, 'MILLA',        32, undefined)

    // tbl_FecDibRev column 1 headers
    this.asignarTextoCelda('tbl_FecDibRev', 1, 1, 'FECHA',  32, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 2, 1, 'DIBUJO', 32, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 3, 1, 'REVISO', 32, undefined)

    // tbl_escala row 1
    this.asignarTextoCelda('tbl_escala', 1, 1, 'ESCALA', 32, undefined)

    // tbl_del_mpo col 1 labels
    this.asignarTextoCelda('tbl_del_mpo', 1, 1, ' ESTADO:',             32, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 2, 1, ' CODIGO POSTAL:',      32, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 3, 1, ' COLONIA:',            32, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 4, 1, ' DELEGACION O MPO.:', 32, 'top_left')
  }

  // Magik: llena_datos_celdas — fills dynamic data from pl_datos + razon_social
  override llenarDatosCeldas(): void {
    // tbl_FecDibRev column 2 (GIS data via pl_datos; use attributes directly in showcase)
    this.asignarTextoCelda('tbl_FecDibRev', 1, 2, this.fecha.toUpperCase(),           30, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 2, 2, this.proyectaEmpresa.toUpperCase(), 30, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 3, 2, this.revisaEmpresa.toUpperCase(),   30, undefined)

    // tbl_del_mpo column 2
    this.asignarTextoCelda('tbl_del_mpo', 1, 2, this.estado,      35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 2, 2, this.codigoPostal,35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 3, 2, this.colonia,     35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 4, 2, this.municipio,   35, 'top_left')

    // tbl_proy_ctl — magenta/purple
    const proyText = `${this.nombre}\nNCO-${this.loNombreNco}(${this.loNcoSiglas})`
    const ctlText  = `CTL-${this.nombreCtl}(${this.loNcoSiglas})`
    this.asignarTextoCelda('tbl_proy_ctl', 1, 1, proyText, 35, 'centre_centre', 0, COLOR_PROY_CTL)
    this.asignarTextoCelda('tbl_proy_ctl', 2, 1, ctlText,  35, 'centre_centre', 0, COLOR_PROY_CTL)

    // tbl_siglas — magenta/purple
    this.asignarTextoCelda('tbl_siglas', 1, 1, `NCO - ${this.loNcoSiglas}`, 60, 'centre_centre', 0, COLOR_PROY_CTL)

    // tbl_escala row 2
    this.asignarTextoCelda('tbl_escala', 2, 1, this.escalaManual, 55, undefined)

    // tbl_ubicacion — location string, rotated 90°
    this.asignarTextoCelda('tbl_ubicacion', 1, 1, this.ubicacionPlano, 45, 'bottom_left', 90)

    // Company block: override tbl_compania + set abbreviation in tbl_FecDibRev(3,2)
    if (this.razonSocial.trim().length > 0) {
      const [l1, l2, l3] = this.companiaLineas()
      const fs = this.companiaFontSize()
      this.asignarTextoCelda('tbl_compania', 1, 1, l1, fs, undefined)
      this.asignarTextoCelda('tbl_compania', 2, 1, l2, fs, undefined)
      this.asignarTextoCelda('tbl_compania', 3, 1, l3, fs, undefined)
      this.asignarTextoCelda('tbl_FecDibRev', 3, 2, this.companiaAbrev(), 30, undefined)
    }
  }

  // Magik: llena_datos_dinamicos — empty body in source
  protected override llenarDatosDinamicos(): void { /* empty in source */ }

  // GIS stubs (Fase 5)
  obtenRegistros(): void        { /* Fase 5 */ }
  calculaDatosClienteRB(): void { /* Fase 5 */ }
  buscaBastidoresEnMapa(): void { /* Fase 5 */ }
  escalaDelMapa(): void         { /* Fase 5 */ }
  getPage(): void               { /* Fase 5 */ }
}
