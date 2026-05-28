// Source: planos_fo/source/detalles_construccion/factory/c_factory_detalles.magik
// Base factory for all "detalles de construcción" plan types.
// Extends CFactoryPlanos (which handles page setup, AddMarco, AddTitulo, AddSellos base).
//
// Adds three slots over CFactoryPlanos: oEngine, oCable (public), oPafManager.
// genera_plano() flow: sets oCable → _super.genera_plano(enlace) → AddSellosPlanoDetalles() → tipo_plano
// Contains complex viewport factories: AddRmeBay, AddSalaTx, AddBackRmeBay, AddIsometrico,
// AddVistaPerfil, and the generic AddViewport() which handles both radio-base and normal routes.
// All GIS / layout operations → Fase 5.

import { CFactoryPlanos } from './CFactoryPlanos'

// ─── Engine interface ─────────────────────────────────────────────────────────

export interface DetallesEngine {
  getRmeInicio():   unknown | undefined
  getRmeFinal():    unknown[]
  getEdificio(_rme: unknown): unknown | undefined
  getTba?():        unknown | undefined
  sys_slot(_name: string): unknown
}

// ─── Title data (base crea_titulo) ────────────────────────────────────────────

// Matches c_factory_detalles.crea_titulo():
//   "PROGRAMA …\nNCO …(…)\nTRAYECTORIA …\nPLANO DE DETALLES CENTRAL \ncable\nsubprograma\nmun,est"
export interface TituloDetallesData {
  programa:       string   // prj.user!_programa + " " + prj.user!_programa_anyo
  ncoNombre:      string   // nodo.datos_nco[0]
  ncoSiglas:      string   // nodo.datos_nco[1]
  numTrayectoria: string   // nodo.location.coordinate.trayectoria_txt
  cableNombre:    string   // gen_planos.o_ruta_sigp[:ocables].an_element().name
  subprograma:    string   // prj.job_title
  municipio:      string   // nodo.location.coordinate.municipio_txt()
  estado:         string   // nodo.location.coordinate.estado_txt()
}

export function creaTituloDetalles(data: TituloDetallesData): string {
  return (
    `PROGRAMA ${data.programa}\n` +
    `NCO ${data.ncoNombre}(${data.ncoSiglas})\n` +
    `TRAYECTORIA ${data.numTrayectoria}\n` +
    `PLANO DE DETALLES CENTRAL \n` +
    `${data.cableNombre}\n` +
    `${data.subprograma}\n` +
    `${data.municipio},${data.estado}`
  ).toUpperCase()
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CFactoryDetalles extends CFactoryPlanos {
  protected _oEngine:     DetallesEngine | undefined = undefined
  oCable:                 unknown                    = undefined
  protected _oPafManager: unknown                    = undefined

  constructor(oEngine?: DetallesEngine) {
    super()
    this._oEngine = oEngine
    // _oPafManager ← smallworld_product.pni_application().manager (Fase 5)
  }

  // Magik: genera_plano(PoCable, PEnlace) — sets oCable, calls super + AddSellosPlanoDetalles. Fase 5.
  // Flow: .oCable = PoCable → _super.genera_plano(PEnlace) → AddSellosPlanoDetalles() → tipo_plano
  override generaPlano(_cable?: unknown, _enlace?: unknown): void { /* Fase 5 */ }

  // Magik: AddSellosPlanoDetalles() — empty hook; subclasses override to add their sellos.
  addSellosPlanoDetalles(): void { /* intentionally empty — hook for subclasses */ }

  // Magik: AddDetalleCentralOrigen() — orchestrates 6 viewport methods for the origin central. Fase 5.
  addDetalleCentralOrigen(): void { /* Fase 5 */ }

  // Magik: AddLocalizacionOrigen() — c_vp_croquis viewport via AddViewport(). Fase 5.
  addLocalizacionOrigen(): void { /* Fase 5 */ }

  // Magik: AddSalaTx() — viewport at xmax-[9900→7200], ymax-[2500→500]. Fase 5.
  addSalaTx(): void { /* Fase 5 */ }

  // Magik: AddRmeBay() — viewport at xmax-[7100→6100], ymax-[2500→500]. Fase 5.
  addRmeBay(): void { /* Fase 5 */ }

  // Magik: AddBackRmeBay() — viewport at xmax-[6100→5100], ymax-[2500→500]. Fase 5.
  addBackRmeBay(): void { /* Fase 5 */ }

  // Magik: AddIsometrico() — viewport at xmax-[5100→3100], ymax-[2500→500]. Fase 5.
  addIsometrico(): void { /* Fase 5 */ }

  // Magik: AddVistaPerfil() — viewport at xmax-[3100→1100], ymax-[2500→500]. Fase 5.
  addVistaPerfil(): void { /* Fase 5 */ }

  // Magik: AddViewport(page, tipoVp, limite, mapper, x1, y1, w, h, building?)
  // Coords (x1,y1,w,h) are in cm-units — multiplied by 100 internally before bounding_box.
  // Example call from addLocalizacionOrigen: (page, :c_vp_croquis, unset, mapper, 8,60,25,23, building)
  //   → bounds = (page.xmin+800, page.ymin+6000, page.xmin+3300, page.ymin+8300)
  // Three dispatch paths: radio_base() / lienzo_plano enlace / standard croquis with building. Fase 5.
  // Different Magik signature than CFactoryPlanos.addViewport — rest params keep both compatible.
  override addViewport(..._args: unknown[]): void { /* Fase 5 */ }

  // Magik: add_sello_tabla_equivalencias_x_cable()
  // For each bastidor from gen_planos.obtener_bastidores():
  //   → iterates signal_cable_pins() → sheath (construction_status == "proyectado")
  //   → builds datos: { LoCable, rme, LoCableObjeto, Central, num_de_grupos, numero_fibras,
  //                     capacidad_cable, piso, sala, fila, bastidor }
  //   → raises :information if num_de_grupos==0 or numero_fibras==0
  //   → else creates CTabulaEquivalenciasXCable at bounds(3556+dx, 5735, 4546+dx, 8395), dx+=1000
  // Fase 5.
  addSelloTablaEquivalenciasXCable(): void { /* Fase 5 */ }

  // Magik: AddDiagramaEmpalmesConexion(empalmes) — c_diagrama_conexion_empalme or c_diagrama_unifilar_ruta. Fase 5.
  addDiagramaEmpalmesConexion(_empalmes: unknown[]): void { /* Fase 5 */ }

  // Magik: bastidor_final(enlace) — finds the final bastidor matching the enlace. Fase 5.
  bastidorFinal(_enlace: unknown): unknown { return undefined /* Fase 5 */ }

  // Magik: crea_titulo — pulls NCO + geo data from GIS. Overridden by subclasses. Fase 5.
  creaTituloDetalles(_data?: TituloDetallesData): string {
    return _data ? creaTituloDetalles(_data) : ''
  }

  // Magik: obtener_transform() — translates route geometry set to origin at scale 0.1. Fase 5.
  obtenerTransform(): unknown { return undefined /* Fase 5 */ }

  // Magik: radio_base() — returns GME building if cable connects to GME bastidor. Fase 5.
  radioBase(): unknown { return undefined /* Fase 5 */ }

  // Magik: buscar_gme() — traverses connectivity to find GME bastidor. Fase 5.
  buscarGme(): unknown { return undefined /* Fase 5 */ }

  // Magik: calles_faltantes_en_croquis(location) — selects up to 3 user!_eje_calle within 10 000-unit buffer. Fase 5.
  callesFaltantesEnCroquis(_location: unknown): Map<string, unknown> { return new Map() }

  // Magik: calles_radiobase(rb_location) — calls callesFaltantesEnCroquis, then for each street
  // calls calle.make_annotation() if dataset is in write mode. Fase 5.
  callesRadiobase(_rbLocation: unknown): void { /* Fase 5 */ }

  // Magik: crear_croquis() — inserts a user!_lienzo_plano record for the route. Fase 5.
  crearCroquis(): unknown { return undefined /* Fase 5 */ }

  // Magik: dibujar_enlace(lienzo) — draws route + centrals on croquis canvas. Fase 5.
  dibujarEnlace(_lienzo: unknown): void { /* Fase 5 */ }

  // Magik: generar_calles(htCalles, transform) — places text annotations for streets. Fase 5.
  generarCalles(_calles: Map<string, unknown>, _transform: unknown): void { /* Fase 5 */ }

  // Magik: generar_central(ctl, transform) — places central symbol + siglas text. Fase 5.
  generarCentral(_ctl: unknown, _transform: unknown): void { /* Fase 5 */ }

  // Magik: gme_asociado_a_radiobase(bastidor) — counts rows in user!_radio_base_mit_bays. Fase 5.
  gmeAsociadoARadiobase(_bastidor: unknown): number { return 0 /* Fase 5 */ }
}
