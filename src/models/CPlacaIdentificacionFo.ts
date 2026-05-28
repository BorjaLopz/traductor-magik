// Source: planos_fo/source/detalles_construccion/sellos/c_placa_identificacion_fo.magik
// Identification plaque sello for FO construction detail plans.
// Extends CBaseSelloFibra. Shows logo, central, route, cable, capacity, pozo,
// account, and two sets of rack coordinates (endpoint A + endpoint B).
//
// Table layout (7 tables, all coords relative to _coordInicio = [x, y]):
//   tbl_1: 1×1   origin=(x,    y     ) row=50mm  col=150mm
//   tbl_2: 1×1   origin=(x+25, y−25  ) row=45mm  col=145mm
//   tbl_3: 2×1   origin=(x+25, y−25  ) rows=(15,30)mm  col=26mm
//              borders: cell(1,1) hide-inf; cell(2,1) hide-inf+sup
//   tbl_4: 1×8   origin=(x+330,y−70  ) row=7.5mm  cols1-4=10.5mm  cols5-8=18mm
//              cells (1,1),(1,3),(1,5),(1,7): hide left+top+bottom
//   tbl_5: 1×4   origin=(x+330,y−165 ) row=7.5mm  col1-2=9.5mm  col3=20mm  col4=70mm
//              cells (1,1),(1,3): hide left+top+bottom
//   tbl_6: 1×12  origin=(x+330,y−260 ) row=7.5mm  all cols=9.5mm
//              cells (1,1),(1,3),(1,5),(1,7),(1,9),(1,11): hide left+top+bottom
//   tbl_7: 1×12  origin=(x+330,y−355 ) row=7.5mm  all cols=9.5mm
//              cells (1,1),(1,3),(1,5),(1,7),(1,9),(1,11): hide left+top+bottom
//
// colocarSimbolo(): resolves logo from "empreviso" attribute:
//   "logo_" + value.toUpperCase() + ("_EP" if contains "TELMEX") → asignarSimboloCelda(tbl_3,2,1)
//   Default: "logo_ultima_milla"
//
// llenarDatosCeldas():
//   Fase 5: central ← activeDesign.project.user!_central + cable from gen_planos plugin
//   Concrete: if sBastidor set → reads ctl/numero/pozo/capacidad/nombre_cuenta/piso/sala/fila/bast/dist/posicion
//   Concrete: each field overridden by matching layout attribute (via valorPropiedad)
//   Concrete: fills even-numbered data columns in tbl_4/5/6/7 with uppercase red text
//   NOTE source bugs: num_cable/capacidad_cable/cuentas declared but unused;
//     num_de_cable/capacidad/cuenta/dist used without declaration.
//
// postInitialisation() — Fase 5: registers gen_planos.cables_activados_fo in elementos_bd_gis.
// definedAttributes()  — Fase 5: GIS layout attribute introspection.

import { CBaseSelloFibra } from './CBaseSelloFibra'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ─── Domain types ─────────────────────────────────────────────────────────────

// Property-list passed as PocableInfo in new_with(); keyed access in llena_datos_celdas
export interface BastidorInfo {
  ctl:           string
  numero:        string
  pozo:          string
  capacidad:     string
  nombre_cuenta: string
  piso:          string
  sala:          string
  fila:          string
  bast:          string
  dist:          string
  posicion:      string
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlacaIdentificacionFo extends CBaseSelloFibra {
  static readonly ALLOWED_ON_MENU = false

  // Writable slots — endpoint 1
  sPiso:     string | undefined = undefined
  sSala:     string | undefined = undefined
  sFila:     string | undefined = undefined
  sBastidor: BastidorInfo | undefined = undefined
  sPosbast:  string | undefined = undefined

  // Writable slots — endpoint 2
  sPiso2:     string | undefined = undefined
  sSala2:     string | undefined = undefined
  sFila2:     string | undefined = undefined
  sBastidor2: string | undefined = undefined
  sPosbast2:  string | undefined = undefined

  // Internal lookup + resolved logo name
  oTipoEmpresaR: Map<number, string> | undefined = undefined
  valorEmpreviso: string | undefined = undefined

  // Layout attributes (mirrors Magik define_attributes; keyed by attribute name)
  // Keys: empreviso, central, ruta, n_cable, capacidad, n_pozo, cuenta,
  //       piso, sala, fila, bastidor, dfo, pos,
  //       piso_2, sala2, fila2, bastidor2, dfo2, pos2
  readonly attributes: Record<string, string | undefined> = {}

  // ── Factory (Magik: new_with(bb, _optional PocableInfo)) ──────────────────

  static newWith(_bounds: unknown, bastidorInfo?: BastidorInfo): CPlacaIdentificacionFo {
    const inst = new CPlacaIdentificacionFo()
    if (bastidorInfo !== undefined) inst.sBastidor = bastidorInfo
    return inst
  }

  // ── Enum for empreviso attribute ───────────────────────────────────────────

  // Magik: enum_tipo_empresar — populates oTipoEmpresaR and returns it
  enumTipoEmpresaR(): Map<number, string> {
    this.oTipoEmpresaR = new Map([
      [1, 'ULTIMA_MILLA_R'],
      [2, 'ULTIMA_MILLA_NR'],
      [3, 'TELMEX'],
    ])
    return this.oTipoEmpresaR
  }

  // ── Logo placement ─────────────────────────────────────────────────────────

  // Magik: colocar_simbolo — resolves logo symbol from empreviso attribute
  colocarSimbolo(): void {
    const empreviso = this.attributes['empreviso']
    if (empreviso !== undefined && empreviso.length > 0) {
      this.valorEmpreviso = 'logo_' + empreviso.toUpperCase()
      if (this.valorEmpreviso.toUpperCase().includes('TELMEX')) {
        this.valorEmpreviso += '_EP'
      }
      this.asignarSimboloCelda('tbl_3', 2, 1, this.valorEmpreviso, 1)
    } else {
      this.asignarSimboloCelda('tbl_3', 2, 1, 'logo_ultima_milla', 1)
    }
  }

  // ── Slot reset ─────────────────────────────────────────────────────────────

  // Magik: reinicia_slots
  reiniciarSlots(): void {
    this.sPiso     = undefined
    this.sSala     = undefined
    this.sFila     = undefined
    this.sBastidor = undefined
    this.sPosbast  = undefined
    this.sPiso2    = undefined
    this.sSala2    = undefined
    this.sFila2    = undefined
    this.sBastidor2 = undefined
    this.sPosbast2 = undefined
  }

  // ── Table layout ───────────────────────────────────────────────────────────

  // Magik: configura_tabla — builds tbl_1 through tbl_7
  override configurarTabla(): void {
    const [x, y] = this._coordInicio

    // tbl_1 — outer frame
    const tbl1 = this._tablas.crearTabla(1, 1, 'tbl_1')
    tbl1.coordenadaOrigen = [x, y]
    tbl1.renglones.elemento(1).longitud = 50
    tbl1.columnas.elemento(1).longitud  = 150

    // tbl_2 — inner frame
    const tbl2 = this._tablas.crearTabla(1, 1, 'tbl_2')
    tbl2.coordenadaOrigen = [x + 25, y - 25]
    tbl2.renglones.elemento(1).longitud = 45
    tbl2.columnas.elemento(1).longitud  = 145

    // tbl_3 — logo / RNUM column (2 rows)
    const tbl3 = this._tablas.crearTabla(2, 1, 'tbl_3')
    tbl3.coordenadaOrigen = [x + 25, y - 25]
    tbl3.renglones.elemento(1).longitud = 15
    tbl3.renglones.elemento(2).longitud = 30
    tbl3.columnas.elemento(1).longitud  = 26
    this.ocultarBordesCeldas(tbl3, {
      borderInf:    [[1, 1]],
      borderSupInf: [[2, 1]],
    })

    // tbl_4 — SGL/CTL | RUTA | CABLE | CAPACIDAD header row (8 cols)
    const tbl4 = this._tablas.crearTabla(1, 8, 'tbl_4')
    tbl4.coordenadaOrigen = [x + 330, y - 70]
    tbl4.renglones.elemento(1).longitud = 7.5
    for (let c = 1; c <= 4; c++) tbl4.columnas.elemento(c).longitud = 10.5
    for (let c = 5; c <= 8; c++) tbl4.columnas.elemento(c).longitud = 18
    this.ocultarBordesCeldas(tbl4, {
      borderIzq:    [[1, 1], [1, 3], [1, 5], [1, 7]],
      borderSupInf: [[1, 1], [1, 3], [1, 5], [1, 7]],
    })

    // tbl_5 — POZO | CUENTA header row (4 cols)
    const tbl5 = this._tablas.crearTabla(1, 4, 'tbl_5')
    tbl5.coordenadaOrigen = [x + 330, y - 165]
    tbl5.renglones.elemento(1).longitud = 7.5
    tbl5.columnas.elemento(1).longitud  = 9.5
    tbl5.columnas.elemento(2).longitud  = 9.5
    tbl5.columnas.elemento(3).longitud  = 20
    tbl5.columnas.elemento(4).longitud  = 70
    this.ocultarBordesCeldas(tbl5, {
      borderIzq:    [[1, 1], [1, 3]],
      borderSupInf: [[1, 1], [1, 3]],
    })

    // tbl_6 — PISO|SALA|FILA|BAST|DFO|POS endpoint-A (12 cols)
    const tbl6 = this._tablas.crearTabla(1, 12, 'tbl_6')
    tbl6.coordenadaOrigen = [x + 330, y - 260]
    tbl6.renglones.elemento(1).longitud = 7.5
    for (let c = 1; c <= 12; c++) tbl6.columnas.elemento(c).longitud = 9.5
    this.ocultarBordesCeldas(tbl6, {
      borderIzq:    [[1, 1], [1, 3], [1, 5], [1, 7], [1, 9], [1, 11]],
      borderSupInf: [[1, 1], [1, 3], [1, 5], [1, 7], [1, 9], [1, 11]],
    })

    // tbl_7 — PISO|SALA|FILA|BAST|DFO|POS endpoint-B (12 cols)
    const tbl7 = this._tablas.crearTabla(1, 12, 'tbl_7')
    tbl7.coordenadaOrigen = [x + 330, y - 355]
    tbl7.renglones.elemento(1).longitud = 7.5
    for (let c = 1; c <= 12; c++) tbl7.columnas.elemento(c).longitud = 9.5
    this.ocultarBordesCeldas(tbl7, {
      borderIzq:    [[1, 1], [1, 3], [1, 5], [1, 7], [1, 9], [1, 11]],
      borderSupInf: [[1, 1], [1, 3], [1, 5], [1, 7], [1, 9], [1, 11]],
    })
  }

  // Magik: etiqueta_celdas — assigns static labels; calls colocarSimbolo() for tbl_3 logo
  override etiquetarCeldas(): void {
    const T = 30  // normalised text size (galvanj 28/ago/12)

    // tbl_3 — route number label + logo
    this.asignarTextoCelda('tbl_3', 1, 1, 'RNUM', 45, 'bottom_centre', 0)
    ;(this._tablas.elemento('tbl_3').celdas.celda(1, 1).elemento as CTextoGrafico).estilo = 'Bold'
    this.colocarSimbolo()

    // tbl_4 — column headers (odd cols = labels, even cols = data placeholders)
    const texto1 = 'SGL\nCTL'
    const texto2 = 'NO.DE\nCABLE'
    this.asignarTextoCelda('tbl_4', 1, 1, texto1,      T, 'top_left', 0)
    this.asignarTextoCelda('tbl_4', 1, 3, 'RUTA',      T, undefined,  0)
    this.asignarTextoCelda('tbl_4', 1, 5, texto2,      T, 'top_left', 3)
    this.asignarTextoCelda('tbl_4', 1, 7, 'CAPACIDAD', T, undefined,  0)

    // tbl_5
    const texto3 = 'NO.\nPOZO'
    this.asignarTextoCelda('tbl_5', 1, 1, texto3,    T, 'top_left', 0)
    this.asignarTextoCelda('tbl_5', 1, 3, 'CUENTA',  T, undefined,  0)

    // tbl_6 — endpoint-A rack coordinates
    this.asignarTextoCelda('tbl_6', 1,  1, 'PISO', T, undefined, 0)
    this.asignarTextoCelda('tbl_6', 1,  3, 'SALA', T, undefined, 0)
    this.asignarTextoCelda('tbl_6', 1,  5, 'FILA', T, undefined, 0)
    this.asignarTextoCelda('tbl_6', 1,  7, 'BAST', T, undefined, 0)
    this.asignarTextoCelda('tbl_6', 1,  9, 'DFO',  T, undefined, 0)
    this.asignarTextoCelda('tbl_6', 1, 11, 'POS',  T, undefined, 0)

    // tbl_7 — endpoint-B rack coordinates
    this.asignarTextoCelda('tbl_7', 1,  1, 'PISO', T, undefined, 0)
    this.asignarTextoCelda('tbl_7', 1,  3, 'SALA', T, undefined, 0)
    this.asignarTextoCelda('tbl_7', 1,  5, 'FILA', T, undefined, 0)
    this.asignarTextoCelda('tbl_7', 1,  7, 'BAST', T, undefined, 0)
    this.asignarTextoCelda('tbl_7', 1,  9, 'DFO',  T, undefined, 0)
    this.asignarTextoCelda('tbl_7', 1, 11, 'POS',  T, undefined, 0)
  }

  // ── Dynamic data ───────────────────────────────────────────────────────────

  // Magik: llena_datos_dinamicos — called from drawContentOn via llenarDatosDinamicos hook
  protected override llenarDatosDinamicos(): void {
    this.colocarSimbolo()
    this.llenarDatosCeldas()
  }

  // Magik: llena_datos_celdas
  override llenarDatosCeldas(): void {
    const T = 30
    const red: [number, number, number] = [1.0, 0.0, 0.0]

    // Initialize all values to empty string
    let central   = ''
    let ruta      = ''
    let numDeCable = ''
    let nPozo     = ''
    let capacidad = ''
    let cuenta    = ''
    let piso      = '', sala   = '', fila   = '', bastidor = '', dist = '', pos  = ''
    let piso2     = '', sala2  = '', fila2  = '', bastidor2 = '', bast2 = '', pos2 = ''

    // Fase 5: central ← swg_dsn_admin_engine.active_scheme.project.user!_central.user!_central
    //         Locable ← elementos_bd_gis || gen_planos.cables_activados_fo → guardar_elementos_bd_gis

    if (this.sBastidor !== undefined) {
      central    = this.sBastidor.ctl
      ruta       = this.sBastidor.numero
      numDeCable = this.sBastidor.numero
      nPozo      = this.sBastidor.pozo
      capacidad  = this.sBastidor.capacidad
      cuenta     = this.sBastidor.nombre_cuenta
      piso       = this.sBastidor.piso
      sala       = this.sBastidor.sala
      fila       = this.sBastidor.fila
      bastidor   = this.sBastidor.bast
      dist       = this.sBastidor.dist
      pos        = this.sBastidor.posicion
    }

    // Apply layout attribute overrides
    central   = this.valorPropiedad('central',   central)
    ruta      = this.valorPropiedad('ruta',       ruta)
    const nCable = this.valorPropiedad('n_cable', numDeCable)
    nPozo     = this.valorPropiedad('n_pozo',     nPozo)
    capacidad = this.valorPropiedad('capacidad',  capacidad)
    cuenta    = this.valorPropiedad('cuenta',     cuenta)
    piso      = this.valorPropiedad('piso',       piso)
    sala      = this.valorPropiedad('sala',       sala)
    fila      = this.valorPropiedad('fila',       fila)
    bastidor  = this.valorPropiedad('bastidor',   bastidor)
    dist      = this.valorPropiedad('dfo',        dist)
    pos       = this.valorPropiedad('pos',        pos)
    // endpoint-B defaults mirror endpoint-A (same as Magik source)
    piso2     = this.valorPropiedad('piso_2',    piso)
    sala2     = this.valorPropiedad('sala2',     sala)
    fila2     = this.valorPropiedad('fila2',     fila)
    bastidor2 = this.valorPropiedad('bastidor2', bastidor)
    bast2     = this.valorPropiedad('dfo2',      dist)
    pos2      = this.valorPropiedad('pos2',      pos)

    this.asignarTextoCelda('tbl_4', 1,  2, central.toUpperCase(),    T, undefined, 0, red)
    this.asignarTextoCelda('tbl_5', 1,  2, nPozo.toUpperCase(),      T, undefined, 0, red)
    this.asignarTextoCelda('tbl_4', 1,  4, ruta.toUpperCase(),       T, undefined, 0, red)
    this.asignarTextoCelda('tbl_4', 1,  6, nCable.toUpperCase(),     T, undefined, 0, red)
    this.asignarTextoCelda('tbl_4', 1,  8, capacidad.toUpperCase(),  T, undefined, 0, red)
    this.asignarTextoCelda('tbl_5', 1,  4, cuenta.toUpperCase(),     T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1,  2, piso.toUpperCase(),       T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1,  4, sala.toUpperCase(),       T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1,  6, fila.toUpperCase(),       T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1,  8, bastidor.toUpperCase(),   T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1, 10, dist.toUpperCase(),       T, undefined, 0, red)
    this.asignarTextoCelda('tbl_6', 1, 12, pos.toUpperCase(),        T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1,  2, piso2.toUpperCase(),      T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1,  4, sala2.toUpperCase(),      T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1,  6, fila2.toUpperCase(),      T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1,  8, bastidor2.toUpperCase(),  T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1, 10, bast2.toUpperCase(),      T, undefined, 0, red)
    this.asignarTextoCelda('tbl_7', 1, 12, pos2.toUpperCase(),       T, undefined, 0, red)
  }

  // Magik: valor_propiedad(Propiedad, dato_actual)
  // Returns the layout attribute value if non-empty, otherwise dato_actual.
  valorPropiedad(propiedad: string, datoActual: string): string {
    const val = this.attributes[propiedad]
    return (val !== undefined && val.length > 0) ? val : datoActual
  }

  // ── GIS stubs (Fase 5) ─────────────────────────────────────────────────────

  // Magik: post_initialisation — registers gen_planos.cables_activados_fo in elementos_bd_gis
  postInitialisation(): void { /* Fase 5 */ }

  // Magik: defined_attributes — GIS layout attribute introspection (Fase 5)
  definedAttributes(): unknown[] { return [] /* Fase 5 */ }
}
