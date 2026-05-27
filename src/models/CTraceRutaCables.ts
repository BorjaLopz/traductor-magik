// Source: planos_fo/source/ruta_cables/engine/c_trace_ruta_cables.magik
// GIS trace engine for FO route cables.
// Wraps mit_low_level_trace_engine to collect structures, canalization,
// cables, and elements (figure_eight, splice_closure) along a cable route.
// No parent class — standalone object in Magik.
// All execution paths are Fase 5: depends on mit_low_level_trace_engine and GIS network topology.

export const TIPOS_ELEMENTOS = ['figure_eight', 'splice_closure'] as const
export type TipoElemento = typeof TIPOS_ELEMENTOS[number]

export interface ResultadoTraza {
  readonly estructuras:  unknown[]
  readonly canalizacion: unknown[]
  readonly elementos:    unknown[]
}

export class CTraceRutaCables {
  // Fase 5: initialized as mit_low_level_trace_engine instance
  private _lowEngine:    unknown   = undefined
  private _estructuras:  unknown[] = []
  private _canalizacion: unknown[] = []
  private _cables:       unknown[] = []
  private _elementos:    unknown[] = []
  private _basInicio:    unknown   = undefined
  private _basFinal:     unknown[] = []

  constructor() {
    // Fase 5: this._lowEngine = new MitLowLevelTraceEngine()
  }

  // Main entry point. Runs trace_out from nodo and collects all route objects.
  // Returns (estructuras, canalizacion, elementos) or undefined on trace error.
  obtenerEstructuras(nodo: unknown): ResultadoTraza | undefined {
    if (this._lowEngine === undefined) return undefined  // TODO(GIS): initialize in constructor
    // Fase 5: const links = this._lowEngine.trace_out(Set.of(nodo))
    const links: unknown[] = []  // stub — replaced by trace_out result in Fase 5
    this._cables      = []
    this._basInicio   = this.bastidorInicial(nodo)
    this._basFinal    = []
    this._canalizacion = []
    const { estructuras, elementos } = this._estructurasPorLink(links)
    this._estructuras = estructuras
    this._elementos   = elementos
    return { estructuras: this._estructuras, canalizacion: this._canalizacion, elementos: this._elementos }
  }

  // Returns bay at route start: pin.sheath_pin.strw_connect_point.owner
  bastidorInicial(_pin: unknown): unknown {
    // Fase 5: return _pin.sheath_pin.strw_connect_point?.owner ?? undefined
    return undefined
  }

  // Iterates all links; calls estructurasEnNodo for each endpoint and deviceEnLink for each link
  private _estructurasPorLink(links: unknown[]): { estructuras: unknown[]; elementos: unknown[] } {
    const estructuras: unknown[] = []
    const elementos:   unknown[] = []
    for (const link of links) {
      this._estructurasEnNodo(undefined, estructuras, elementos)  // Fase 5: link.in_node
      this._estructurasEnNodo(undefined, estructuras, elementos)  // Fase 5: link.out_node
      this._deviceEnLink(link, estructuras, elementos)
    }
    return { estructuras, elementos }
  }

  // For fiber/pseudo-fiber pins: separates underground_route → canalizacion,
  // other structures → estructuras; adds annotations and cable owner
  private _estructurasEnNodo(
    _nodo:        unknown,
    _estructuras: unknown[],
    _elementos:   unknown[],
  ): void {
    // Fase 5: if _nodo instanceof MitFiberPin || _nodo instanceof MitPseudoFiberPin:
    //   for (const st of _nodo.owner.structures)
    //     if st instanceof UndergroundRoute → this._canalizacion.push(st)
    //     else                              → _estructuras.push(st)
    //   for (const ann of _nodo.owner.structure_annotations) _elementos.push(ann)
    //   this._cables.push(_nodo.owner)
  }

  // Gets top-level device (building → estructuras, figure_eight/splice_closure → elementos)
  // and low-level device (mit_rme_port → _basFinal)
  private _deviceEnLink(
    _link:        unknown,
    _estructuras: unknown[],
    _elementos:   unknown[],
  ): void {
    // Fase 5: const top = _link.get_top_level_device()
    //   if top?.is_structure?.() → _estructuras.push(top)
    //   else                     → this._agregaElemento(top, _elementos)
    // const low = _link.get_low_level_device_for_low_level()
    //   if low instanceof MitRmePort && low.rme_bay_owner() !== this._basInicio:
    //     this._basFinal.push(low.rme_bay_owner())
    this._agregaElemento(undefined, _elementos)
  }

  // Adds element only if its source_collection.name is in TIPOS_ELEMENTOS
  private _agregaElemento(_top: unknown, _elementos: unknown[]): void {
    // Fase 5: if (TIPOS_ELEMENTOS.includes(_top.source_collection.name)) _elementos.push(_top)
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  get cables():        unknown[] { return this._cables }
  get rmeInicio():     unknown   { return this._basInicio }
  get rmeFinal():      unknown[] { return this._basFinal }
  get estructuras():   unknown[] { return this._estructuras }
  get canalizacion():  unknown[] { return this._canalizacion }
  get elementosRuta(): unknown[] { return this._elementos }
}
