// ── GIS dataset record types (D5) ────────────────────────────────────────────

export interface DetTramoCanRecord {
  calles: string
  colonia_cp: string
  municipio: string
  distritos: string
  'user!_num_tramo': string
  'user!_proyectista': string
  'user!_supervisor': string
  poblacion: string
}

export interface ObraRecord {
  name: string
  mit_conduits: { readonly size: number }
}

export interface CanalizacionRecord {
  measured_length: number | undefined
  obra_principal: ObraRecord | undefined
  'user!_ubicacion': string
  'user!_tipo_superficie': string
  calcular_obras_normalizadas_asociadas(tipo: string): ObraRecord[]
  obtener_flexos_contenidos(): Record<string, unknown[]>
  connected_structures(): StructureRecord[]
}

export interface StructureRecord {
  source_collection: { name: string }
}

export interface PozoRecord {
  construction_status: string
  'user!_ubicacion': string
  spec_id: string
  source_collection: { name: string }
}

export interface OeRecord {
  'user!_valor_oe': string
  'user!_num_oe': string | undefined
  'user!_oei': OeiRecord | undefined
  'user!_oei_local': OeiRecord | undefined
}

export interface OeiRecord {
  'user!_valor_oei': string
  'user!_num_oei': string | undefined
  'user!_opb': OpbRecord | undefined
  'user!_op_local': OpbRecord | undefined
}

export interface OpbRecord {
  'user!_valor_opb': string
  'user!_num_op': string | undefined
  'user!_rutas': RutaRecord | undefined
}

export interface RutaRecord {
  'user!_numero': string
}

export interface TramoCanRecord {
  obtener_canalizacion(): [CanalizacionRecord[], PozoRecord[]]
  'user!_det_t_can': DetTramoCanRecord | undefined
}

export type DualKeyTable<V = number> = Map<string, Map<string, V>>

function dualSet<V>(table: DualKeyTable<V>, k1: string, k2: string, value: V): void {
  if (!table.has(k1)) table.set(k1, new Map())
  table.get(k1)!.set(k2, value)
}

function dualGet<V>(table: DualKeyTable<V>, k1: string, k2: string): V | undefined {
  return table.get(k1)?.get(k2)
}

export class CTramoCan {
  private _objeto: TramoCanRecord | undefined
  private _canalizacion: CanalizacionRecord[] = []
  private _pozos: PozoRecord[] = []
  private _oe: OeRecord | undefined
  private _oei: OeiRecord | undefined
  private _opb: OpbRecord | undefined
  private _ruta: RutaRecord | undefined
  private _longObraSup: DualKeyTable = new Map()
  private _longObra: Map<string, number> = new Map()
  private _longObraCepa: Map<string, number> = new Map()
  private _longObraTubos: Map<string, number> = new Map()
  private _longObraMtsVia: Map<string, number> = new Map()

  constructor() {}

  set tramo(pTramo: TramoCanRecord) {
    try {
      this._objeto = pTramo
      const [can, pozos] = pTramo.obtener_canalizacion()
      this._canalizacion = can
      this._pozos = pozos
    } catch {
      console.warn('Error al asignar el tramo')
    }
  }

  asignarOe(roe: OeRecord): void {
    try {
      this._oe = roe
      this._oei = roe['user!_oei']
      this._opb = this._oei?.['user!_opb']
      this._ruta = this._opb?.['user!_rutas']
    } catch {
      console.warn('Error al asignar oe')
    }
  }

  asignarOeLo(roe: OeRecord): void {
    try {
      this._oe = roe
      this._oei = roe['user!_oei_local']
      this._opb = this._oei?.['user!_op_local']
    } catch {
      console.warn('Error al asignar oe')
    }
  }

  get canalizacion(): CanalizacionRecord[] { return this._canalizacion }
  get ruta(): RutaRecord | undefined { return this._ruta }

  get oe(): string { try { return this._oe?.['user!_valor_oe'] ?? '' } catch { return '' } }
  get oeLo(): string | undefined { try { return this._oe?.['user!_num_oe'] } catch { return undefined } }
  get oei(): string { try { return this._oei?.['user!_valor_oei'] ?? '' } catch { return '' } }
  get oeiLo(): string | undefined { try { return this._oei?.['user!_num_oei'] } catch { return undefined } }
  get opb(): string { try { return this._opb?.['user!_valor_opb'] ?? '' } catch { return '' } }
  get opbLo(): string | undefined { try { return this._opb?.['user!_num_op'] } catch { return undefined } }
  get numeroRuta(): string { try { return this._ruta?.['user!_numero'] ?? '' } catch { return '' } }
  get numeroTramo(): string { try { return this._objeto?.['user!_det_t_can']?.['user!_num_tramo'] ?? '' } catch { return '' } }
  get calles(): string { try { return this._objeto?.['user!_det_t_can']?.calles ?? '' } catch { return '' } }
  get colonia(): string { try { return this._objeto?.['user!_det_t_can']?.colonia_cp ?? '' } catch { return '' } }
  get delegacionMpo(): string { try { return this._objeto?.['user!_det_t_can']?.municipio ?? '' } catch { return '' } }
  get distritosAfectados(): string { try { return this._objeto?.['user!_det_t_can']?.distritos ?? '' } catch { return '' } }
  get poblacion(): string { try { return this._objeto?.['user!_det_t_can']?.poblacion ?? '' } catch { return '' } }
  get proyectista(): string { try { return this._objeto?.['user!_det_t_can']?.['user!_proyectista'] ?? '' } catch { return '' } }
  get supervisor(): string { try { return this._objeto?.['user!_det_t_can']?.['user!_supervisor'] ?? '' } catch { return '' } }
  get codigoPostal(): string { return 'PENDIENTE' }
  get totalMetrosLineales(): string { try { return (this._longObra.get('Total') ?? '').toString() } catch { return '' } }
  get totalMetrosVia(): string { try { return (this._longObraMtsVia.get('Total') ?? '').toString() } catch { return '' } }

  get pozos(): PozoRecord[] {
    this._pozos = this._pozos.filter(p => p.source_collection.name === 'uub')
    return this._pozos
  }

  get pozosProyectados(): PozoRecord[] {
    return this.pozos.filter(p => p.construction_status === 'PROYECTADO')
  }

  cajasDistribucion(): StructureRecord[] {
    const cajas = new Set<StructureRecord>()
    for (const can of this._canalizacion) {
      for (const struct of can.connected_structures()) {
        if (struct.source_collection.name === 'mit_terminal_enclosure') cajas.add(struct)
      }
    }
    return [...cajas]
  }

  canalizacionConObraProyectada(): Set<CanalizacionRecord> {
    const result = new Set<CanalizacionRecord>()
    for (const can of this._canalizacion) {
      if (can.calcular_obras_normalizadas_asociadas('proyectado').length > 0) result.add(can)
    }
    return result
  }

  obrasProyectadas(): Set<ObraRecord> {
    const result = new Set<ObraRecord>()
    for (const can of this._canalizacion) {
      for (const obra of can.calcular_obras_normalizadas_asociadas('proyectado')) result.add(obra)
    }
    return result
  }

  esObraProyectada(pObra: ObraRecord): boolean {
    for (const obra of this.obrasProyectadas()) {
      if (obra === pObra) return true
    }
    return false
  }

  tiposObraProyectadas(): Map<string, number> {
    const result = new Map<string, number>()
    for (const can of this._canalizacion) {
      for (const obra of can.calcular_obras_normalizadas_asociadas('proyectado')) {
        result.set(obra.name, obra.mit_conduits.size)
      }
    }
    return result
  }

  tiposSuperficieCanObraProy(): DualKeyTable<string> {
    const result = new Map<string, Map<string, string>>()
    for (const can of this.canalizacionConObraProyectada()) {
      const ubicacion = can['user!_ubicacion']
      const tipoSup = can['user!_tipo_superficie']
      if (!result.has(ubicacion)) result.set(ubicacion, new Map())
      result.get(ubicacion)!.set(tipoSup, '')
    }
    const otros = 'OTROS'
    if (!result.has(otros)) result.set(otros, new Map())
    result.get(otros)!.set('Total', '')
    result.get(otros)!.set('Cepa_Hecha', '')
    result.get(otros)!.set('Tubos_Adic', '')
    result.get(otros)!.set('Mts_Via', '')
    return result
  }

  numPozosProyPorTipo(): DualKeyTable {
    const result: DualKeyTable = new Map()
    for (const pozo of this.pozosProyectados) {
      const ubicacion = pozo['user!_ubicacion']
      const tipo = pozo.spec_id
      dualSet(result, ubicacion, tipo, (dualGet(result, ubicacion, tipo) ?? 0) + 1)
    }
    return result
  }

  calcularLongitudObra(): Map<string, number> {
    const result = new Map<string, number>()
    for (const can of this._canalizacion) {
      const longCan = can.measured_length ?? 0
      for (const obra of can.calcular_obras_normalizadas_asociadas('proyectado')) {
        if (can.obra_principal === obra) {
          result.set(obra.name, (result.get(obra.name) ?? 0) + longCan)
          result.set('Total', (result.get('Total') ?? 0) + longCan)
        }
      }
    }
    this._longObra = result
    return result
  }

  calcularLongitudObraCepaHecha(): Map<string, number> {
    const result = new Map<string, number>()
    for (const can of this._canalizacion) {
      const longCan = can.measured_length ?? 0
      for (const obra of can.calcular_obras_normalizadas_asociadas('proyectado')) {
        if (can.obra_principal !== obra) {
          result.set(obra.name, (result.get(obra.name) ?? 0) + longCan)
        }
      }
    }
    this._longObraCepa = result
    return result
  }

  calcularLongitudObraSuperficie(): DualKeyTable {
    const result: DualKeyTable = new Map()
    for (const can of this._canalizacion) {
      const ubiSup = `${can['user!_ubicacion']}_${can['user!_tipo_superficie']}`
      const longCan = can.measured_length ?? 0
      for (const obra of can.calcular_obras_normalizadas_asociadas('proyectado')) {
        if (can.obra_principal === obra) {
          const current = dualGet(result, obra.name, ubiSup) ?? 0
          dualSet(result, obra.name, ubiSup, current + longCan)
        }
      }
    }
    this._longObraSup = result
    return result
  }

  calcularLongitudObraTubosAdic(): Map<string, number> {
    const result = new Map<string, number>()
    for (const can of this._canalizacion) {
      const longCan = can.measured_length ?? 0
      const obraPrinc = can.obra_principal
      const proyectados = can.obtener_flexos_contenidos()['proyectado'] ?? []
      for (const _tubo of proyectados) {
        if (obraPrinc && this.esObraProyectada(obraPrinc)) {
          result.set(obraPrinc.name, (result.get(obraPrinc.name) ?? 0) + longCan)
        }
      }
    }
    this._longObraTubos = result
    return result
  }

  calcularLongitudObraMtsVia(): Map<string, number> {
    const result = new Map<string, number>()
    for (const [tipoObra, numTubos] of this.tiposObraProyectadas().entries()) {
      const longObra = this._longObra.get(tipoObra)
      if (longObra !== undefined) result.set(tipoObra, (result.get(tipoObra) ?? 0) + longObra * numTubos)
      const longCepa = this._longObraCepa.get(tipoObra)
      if (longCepa !== undefined) result.set(tipoObra, (result.get(tipoObra) ?? 0) + longCepa * numTubos)
      const longTubos = this._longObraTubos.get(tipoObra)
      if (longTubos !== undefined) result.set(tipoObra, (result.get(tipoObra) ?? 0) + longTubos)
      result.set('Total', (result.get('Total') ?? 0) + (result.get(tipoObra) ?? 0))
    }
    this._longObraMtsVia = result
    return result
  }

  generarResumenTotalTipoObra(): DualKeyTable {
    this.calcularLongitudObraSuperficie()
    this.calcularLongitudObra()
    this.calcularLongitudObraCepaHecha()
    this.calcularLongitudObraTubosAdic()
    this.calcularLongitudObraMtsVia()

    const result: DualKeyTable = new Map(
      [...this._longObraSup.entries()].map(([k, v]) => [k, new Map(v)])
    )
    for (const [key, long] of this._longObra.entries()) dualSet(result, key, 'OTROS_Total', long)
    for (const [key, long] of this._longObraCepa.entries()) dualSet(result, key, 'OTROS_Cepa_Hecha', long)
    for (const [key, long] of this._longObraTubos.entries()) dualSet(result, key, 'OTROS_Tubos_Adic', long)
    for (const [key, long] of this._longObraMtsVia.entries()) dualSet(result, key, 'OTROS_Mts_Via', long)
    return result
  }
}
