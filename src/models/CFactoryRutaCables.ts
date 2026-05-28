// Source: planos_fo/source/ruta_cables/factory/c_factory_ruta_cables.magik
// Factory for "Ruta de Cables FO" plan generation.
// Extends CFactoryPlanos; adds oEngine + oPafManager slots.
//
// genera_plano() flow:
//   super.generaPlano() → collect primary_geometry (world_id=0) from o_ruta_sigp[:oestructuras]
//   → equality_geometry_set.buffer(longitud_buffer) → _oBuffer
//   → addViewport(buffer, estructuras, estructurasCanal, elementos)
//   → addSellosRuta()
//
// longitud_buffer: define_shared_variable (mutable class-level default = 2500, NOT readonly).
// crea_titulo: overrides parent; same GIS data pattern as CFactoryDetalles but line 4 = "RUTA DE CABLES ".

import { CFactoryPlanos } from './CFactoryPlanos'

// ─── Engine interface ─────────────────────────────────────────────────────────

export interface RutaCablesEngine {
  // Fase 5: Smallworld GIS route-traversal engine
  getRmeInicio():      unknown | undefined
  getRmeFinal():       unknown[]
  getCablesalida():    unknown[]
  obtenerGeometrias(): unknown[]
  recorrerRuta(_cable: unknown): void
}

// ─── Title data ───────────────────────────────────────────────────────────────

// Mirrors CFactoryDetalles.TituloDetallesData; line 4 differs ("RUTA DE CABLES " vs "PLANO DE DETALLES CENTRAL ")
export interface TituloRutaCablesData {
  programa:       string   // prj.user!_programa + " " + prj.user!_programa_anyo
  ncoNombre:      string   // nodo.datos_nco[0]
  ncoSiglas:      string   // nodo.datos_nco[1]
  numTrayectoria: string   // nodo.location.coordinate.trayectoria_txt
  cableNombre:    string   // gen_planos.o_ruta_sigp[:ocables].an_element().name
  subprograma:    string   // prj.job_title
  municipio:      string
  estado:         string
}

// Pure format function — call once GIS data is available in Fase 5
export function creaTituloRutaCables(data: TituloRutaCablesData): string {
  return (
    `PROGRAMA ${data.programa}\n` +
    `NCO ${data.ncoNombre}(${data.ncoSiglas})\n` +
    `TRAYECTORIA ${data.numTrayectoria}\n` +
    `RUTA DE CABLES \n` +
    `${data.cableNombre}\n` +
    `${data.subprograma}\n` +
    `${data.municipio},${data.estado}`
  ).toUpperCase()
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CFactoryRutaCables extends CFactoryPlanos {
  // define_shared_variable — mutable class-level default (not readonly)
  // Fase 5: addViewport reads this as viewport.tamanio_buffer
  static longitud_buffer: number = 2500

  protected _oEngine:     RutaCablesEngine | undefined = undefined
  protected _oPafManager: unknown                      = undefined

  constructor(oEngine?: RutaCablesEngine) {
    super()
    this._oEngine    = oEngine
    // _oPafManager ← smallworld_product.pni_application().manager (Fase 5)
  }

  // Magik: genera_plano(PoElemento) — note: PoElemento is declared but unused in source.
  // Flow:
  //   1. super.generaPlano() — no args (inicia_layout + addElementosComunes)
  //   2. Guard: genp.o_ruta_sigp is defined
  //   3. referencia = o_ruta_sigp[:oestructuras] if size > 0, else empty rope
  //   4. For each estructura: if responds_to(:primary_geometry) and geom.world.world_id === 0
  //      → add to equality_geometry_set gs
  //   5. _oBuffer = gs.buffer(longitud_buffer)
  //   6. addViewport(_oBuffer, [:oestructuras], [:oestructurasCanal], [:oelementos])
  //   7. addSellosRuta()
  // Fase 5: depends on GIS plugin genp.o_ruta_sigp.
  override generaPlano(_elemento?: unknown): void { /* Fase 5 */ }

  // Hook called at end of genera_plano(); currently only adds the north arrow.
  // Subclasses override to add their own sellos after calling super.addSellosRuta().
  addSellosRuta(): void {
    this.addNorte()
  }

  // Magik: AddNorte() — CNorte element at:
  //   bounds: (page.xmin, page.ymax-1500, page.xmin+1000, page.ymax)
  //   limites = unset. Added to oPage. Fase 5.
  addNorte(): void { /* Fase 5 */ }

  // Magik: add_placas_de_identificacion_cable() — body is commented out in source;
  // only line that runs is: bastini = engine.getRmeInicio(). Intentional no-op.
  addPlacasDeIdentificacionCable(): void { /* body commented out in source — intentional no-op */ }

  // Magik: bastidor_final_de_enlace(enlace) — iterates engine.getRmeFinal();
  // for each bastFin checks bastFin.enlaces_relacionados[i][0] === enlace.
  // Returns first match or undefined. Fase 5.
  bastidorFinalDeEnlace(_enlace: unknown): unknown { return undefined /* Fase 5 */ }

  // Magik: crear_buffer() — engine.obtener_geometrias().buffer(longitud_buffer).
  // Returns undefined if geometrias list is empty. Fase 5.
  crearBuffer(): unknown { return undefined /* Fase 5 */ }

  // Magik: obtener_areas_ruta() — for each [building, cables] in obtenerNodos():
  //   new engine instance → recorrer_ruta(cables) → obtener_geometrias()
  //   → geometry_set.buffer(100) → added to areas rope.
  // Returns array of buffered geometry areas. Fase 5.
  obtenerAreasRuta(): unknown[] { return [] /* Fase 5 */ }

  // Magik: obtener_nodos() — uses equality_property_list to group getCablesalida()
  // cables by building: cable → first_cable_section.mit_sheath_pins.an_element()
  // → gis_owner (responds_to :building) → gis_owner.building.
  // Returns Map<building, cable[]>. Fase 5.
  obtenerNodos(): Map<unknown, unknown[]> { return new Map() /* Fase 5 */ }

  // Overrides CFactoryPlanos.creaTitulo() — called by addTitulo() via polymorphism.
  // Returns empty string until GIS data is available; use creaTituloRutaCables(data) directly in Fase 5.
  override creaTitulo(): string { return '' /* Fase 5: use creaTituloRutaCables(data) */ }
}
