// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello_diagrama_empalmes.magik
// Sello for the general splice diagram (DIAGRAMA GENERAL DE EMPALMES).
// Extends c_base_sello_fibra. One extra slot: oEngine (GIS route).
// One pseudo-slot: grafico (c_diagrama_empalmes_grafico, Fase 5).
//
// Layout is fully dynamic — 4 tables whose dimensions depend on bounds and empalme count:
//
//   lnDivisionX = (width/60) + empalmes + 15     when empalmes ≤ 10
//               = empalmes*3 + 15                 when empalmes > 10
//   lnDivisionY = height / 30
//
//   tbl_dfo_origen   : 1×1  rows=[7y]               cols=[2x]       at (0, 0)
//   tbl_titulo_notas : 3×1  rows=[y, 5.5y, 0.5y]    cols=[8x]       at (2x, 0)
//   tbl_dfo_destino  : 1×1  rows=[7y]               cols=[2x]       at (10x, 0)
//   tbl_trayectoria  : 1×3  rows=[2y]               cols=[x,10x,x]  at (0, -7y)
//
// Border overrides:
//   tbl_titulo_notas  — bottom borders hidden on (1,1) and (2,1)
//   tbl_trayectoria   — right borders hidden on (1,1) and (1,2)
//
// llenarDatosCeldas: fills row 3 of tbl_titulo_notas with route length + attaches grafico (Fase 5).
// llenarDatosDinamicos: updates grafico.engine (Fase 5).
// All GIS-dependent methods (totalEmpalmes, getDistanciaRuta, guardar/obtener) are Fase 5 stubs.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiagramaEmpalmesBounds {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export interface DiagramaEmpallesLayoutFactors {
  lnDivisionX: number
  lnDivisionY: number
  empalmes:    number
}

// ─── Config interface ─────────────────────────────────────────────────────────

export interface SelloDiagramaEmpalmesConfig {
  bounds?: DiagramaEmpalmesBounds  // bounding box that drives table dimensions
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloDiagramaEmpalmes extends CBaseSelloFibra {
  private _engine: unknown = undefined  // Magik: oEngine — GIS route object (Fase 5)
  grafico: unknown = undefined          // Magik: pseudo-slot — c_diagrama_empalmes_grafico (Fase 5)

  // Bounding box that drives all table dimensions. Magik: _self.bounds (from layout_element).
  bounds: DiagramaEmpalmesBounds = { xmin: 0, ymin: 0, xmax: 600, ymax: 210 }

  constructor(config?: SelloDiagramaEmpalmesConfig) {
    super()
    if (config?.bounds) this.bounds = config.bounds
  }

  get engine(): unknown      { return this._engine }
  set engine(value: unknown) { this._engine = value; this.guardarElementosBdGis() }

  // Magik: total_empalmes — counts splice_closure elements in oEngine. Fase 5 → 0.
  totalEmpalmes(): number { return 0 }

  // Magik: getdistanciaruta — sums user!_km_real_medido of sheath objects. Fase 5 → 0.
  getDistanciaRuta(): number { return 0 }

  // Magik: obtener_datos — formats distance as "X.XX Mts.".
  obtenerDatos(): { longitud: string } {
    return { longitud: `${this.getDistanciaRuta().toFixed(2)} Mts.` }
  }

  // Pure helper: compute layout division factors given a mock empalme count.
  // When mockEmpalmes is undefined, falls back to totalEmpalmes() (GIS, Fase 5).
  computeLayoutFactors(mockEmpalmes?: number): DiagramaEmpallesLayoutFactors {
    const empalmes  = mockEmpalmes ?? this.totalEmpalmes()
    const width     = this.bounds.xmax - this.bounds.xmin
    const height    = this.bounds.ymax - this.bounds.ymin
    const lnDivisionY = height / 30

    // Magik: if empalmes > 0 andif empalmes > 10 → equivalent to empalmes > 10
    let lnDivisionX: number
    if (empalmes > 10) {
      lnDivisionX = empalmes * 3 + 15
    } else {
      lnDivisionX = width / 60 + empalmes + 15
    }

    return { lnDivisionX, lnDivisionY, empalmes }
  }

  // Magik: configura_tabla — creates 4 tables with dynamic dimensions.
  override configurarTabla(): void {
    const { lnDivisionX: x, lnDivisionY: y } = this.computeLayoutFactors()
    const [ox, oy] = this._coordInicio

    // tbl_dfo_origen: 1 row × 1 col — left DFO symbol
    const tblOrigen = this._tablas.crearTabla(1, 1, 'tbl_dfo_origen')
    tblOrigen.coordenadaOrigen = [ox, oy]
    tblOrigen.renglones.elemento(1).longitud = 7 * y
    tblOrigen.columnas.elemento(1).longitud  = 2 * x

    // tbl_titulo_notas: 3 rows × 1 col — title, legend notes, route length
    const tblTitulo = this._tablas.crearTabla(3, 1, 'tbl_titulo_notas')
    tblTitulo.coordenadaOrigen = [ox + 2 * x, oy]
    tblTitulo.renglones.elemento(1).longitud = y
    tblTitulo.renglones.elemento(2).longitud = 5.5 * y
    tblTitulo.renglones.elemento(3).longitud = 0.5 * y
    tblTitulo.columnas.elemento(1).longitud  = 8 * x
    // Magik: oculta borde_inf on (1,1) and (2,1)
    this.ocultarBordesCeldas(tblTitulo, { borderInf: [[1, 1], [2, 1]] })

    // tbl_dfo_destino: 1 row × 1 col — right DFO symbol
    const tblDestino = this._tablas.crearTabla(1, 1, 'tbl_dfo_destino')
    tblDestino.coordenadaOrigen = [ox + 10 * x, oy]
    tblDestino.renglones.elemento(1).longitud = 7 * y
    tblDestino.columnas.elemento(1).longitud  = 2 * x

    // tbl_trayectoria: 1 row × 3 cols — route trajectory diagram
    const tblTray = this._tablas.crearTabla(1, 3, 'tbl_trayectoria')
    tblTray.coordenadaOrigen = [ox, oy - 7 * y]
    tblTray.renglones.elemento(1).longitud = 2 * y
    tblTray.columnas.elemento(1).longitud  = x
    tblTray.columnas.elemento(2).longitud  = 10 * x
    tblTray.columnas.elemento(3).longitud  = x
    // Magik: oculta borde_der on (1,1) and (1,2)
    this.ocultarBordesCeldas(tblTray, { borderDer: [[1, 1], [1, 2]] })
  }

  // Magik: etiqueta_celdas — title and legend notes.
  override etiquetarCeldas(): void {
    this.asignarTextoCelda('tbl_titulo_notas', 1, 1,
      'DIAGRAMA GENERAL DE EMPALMES', 70, undefined)
    this.asignarTextoCelda('tbl_titulo_notas', 2, 1,
      'ET - EMPALME TERMINAL\nER - EMPALME RECTO\nED - EMPALME DE DERIVACION', 40, undefined)
  }

  // Magik: llena_datos_celdas — route length label + grafico assignment.
  override llenarDatosCeldas(): void {
    const { longitud } = this.obtenerDatos()
    this.asignarTextoCelda('tbl_titulo_notas', 3, 1, `LONGITUD : ${longitud}`, 35, undefined)
    // Fase 5: this.grafico = new CDiagramaEmpalmeGrafico(this._engine)
    //         tbl_trayectoria(1,2).elemento = this.grafico
  }

  // Magik: llena_datos_dinamicos — updates or creates grafico from oEngine. Fase 5.
  protected override llenarDatosDinamicos(): void { /* Fase 5 */ }

  // Magik: guardar_elementos_bd_gis — serialises engine elements to elementos_bd_gis. Fase 5.
  guardarElementosBdGis(): void { /* Fase 5 */ }

  // Magik: obtener_elementos_bd_gis — rehydrates oEngine from stored GIS refs. Fase 5.
  obtenerElementosBdGis(): void { /* Fase 5 */ }
}
