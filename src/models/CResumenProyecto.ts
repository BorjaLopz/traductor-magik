// Source: adiciones_layout/source/c_resumen_proyecto.magik
// "Resumen del Proyecto" sello — extends layout_element.
// 6 tables, 48-item materials list, 19-entry 3-column symbol legend.
// Total height ≈ 261 mm (matches the "Alto: 26 cm" comment in the source).
// draw_content_on → Fase 5 (Canvas 2D / OpenLayers).

export interface SimbologiaEntry {
  simbolo:  string;   // Smallworld symbol name — rendered Fase 5
  etiqueta: string;   // display label; '\n' marks line breaks
}

export interface ListaItem {
  etiqueta: string;   // description text (dot-padded in layout)
  valor:    string;   // capture-text value (col 3, editable via GIS)
}

// ─── Table layout constants (mm) ─────────────────────────────────────────────

export const TABLE_WIDTH     = 156   // all tables share this total width
export const SIMB_COL_WIDTH  = 52    // 22 (symbol) + 30 (label) per column

export interface TableRowCol {
  rowLens: readonly number[];  // [0, h1, h2, ...] — index 0 unused
  colLens: readonly number[];  // [0, w1, w2, ...] — index 0 unused
}

export const TBL_RESUMEN: TableRowCol = {
  rowLens: [0, 11],
  colLens: [0, 156],
}

export const TBL_LISTA: TableRowCol = {
  rowLens: [0, ...Array<number>(48).fill(3.3)],
  colLens: [0, 10, 121, 25],
}

export const TBL_SIMBOLOGIA_TIT: TableRowCol = {
  rowLens: [0, 9],
  colLens: [0, 156],
}

// Total row heights: Col1 = 83 mm, Col2 = 81 mm, Col3 = 72 mm
export const TBL_SIMBOLOGIA_COL1: TableRowCol = {
  rowLens: [0, 12, 16, 7, 12, 10, 13, 13],
  colLens: [0, 22, 30],
}

export const TBL_SIMBOLOGIA_COL2: TableRowCol = {
  rowLens: [0, 15, 12, 15, 15, 12, 12],
  colLens: [0, 22, 30],
}

export const TBL_SIMBOLOGIA_COL3: TableRowCol = {
  rowLens: [0, 14, 10, 10, 12, 13, 13],
  colLens: [0, 22, 30],
}

// ─── Static content ───────────────────────────────────────────────────────────

export const LISTA_ETIQUETAS: readonly string[] = [
  'LONGITUD TOTAL DEL TRAMO',
  'DERIVACIONES',
  'TOMAS DE TIERRA',
  'CABLE DE 24 F.O TM-13',
  'CABLE DE 18 F.O TM-11',
  'FLEXODUCTO DE ALTA DENSIDAD',
  'POZOS CONICOS PREFABRICADOS',
  'CIERRES PARA EMPALME RECTO ENTRE 37 Y 108 F.O. STEWING',
  'CIERRES PARA EMPALME CON DERIVACION 1E/2S ENTRE 37 Y 108 F.O.',
  'CIERRES PARA EMPALME CON DERIVACION 1E/3S ENTRE 37 Y 108 F.O.',
  'BASTIDORES CERRADOS PARA F.O.',
  'DISTRIBUIDOR OPTICO DE 36 F.O. D.C.',
  'CONEXIONES DE FIBRA OPTICA POR FUSION MOD. 6 F.O.',
  'PLACAS DE IDENTIFICACION.',
  'SEMBRADO BAJO CUENTA.',
  'METROS CUBICOS DE CONCRETO 150 KM/CM2.',
  'POSTES DE SEÑALAMIENTO DE TRAYECTORIA.',
  'CANALETA ADOSADA APUENTES.',
  'DEMOLICION Y REPOSICION DE CUNETA',
  'DEMOLICION Y REPOSICION DE ASFALTO',
  'DEMOLICION Y REPOSICION DE ADOQUIN',
  "TUBO DE FIERRO GALVANIZADO 4'' CED.40.",
  'TUBO DE POLIETILENO DE BAJA DENSIDAD 35.5MM.',
  'PRUEBA DE CABLE DE 24 F.O. EN BODEGA',
  'PRUEBA DE CABLE DE 18 F.O. EN BODEGA',
  'EMPALMES',
  'POZOS EN CANALIZACION EXISTENTE',
  'CANALIZACION 2H4',
  'CANALIZACION 3H4',
  'CANALIZACION 5H4',
  'CANALIZACION 7H4',
  'CANALIZACION 3H8',
  'CANALIZACION 4H8',
  'CANALIZACION A09',
  'CANALIZACION A12',
  'POZO L2T',
  'POZO L3T',
  'POZO L4T',
  'POZO L6T',
  'POZO M1C',
  'POZO M2T',
  'POZO C1C',
  'POZO C1T',
  'ESCALERILLA PROYECTADA',
  'DISTANCIA CANALIZACION PROYECTADA',
  'DISTANCIA CANALIZACION EXISTENTE',
  'REFORZAMIENTO DE CANALIZACION',
  'TAPAS PARA SUBDIVICION',
]

export const SIMBOLOGIA_COL1: readonly SimbologiaEntry[] = [
  { simbolo: 'empalme_terminal_p',        etiqueta: 'EMPALME TERMINAL\nPROYECTADO' },
  { simbolo: 'empalme_recto_p',           etiqueta: 'EMPALME RECTO PROYECTADO' },
  { simbolo: 'empalme_derivacion_p',      etiqueta: 'EMPALME DERIVACION\nPROYECTADO' },
  { simbolo: 'canalizacion_pe',           etiqueta: 'CANALIZACION Y POZO\nEXISTENTE' },
  { simbolo: 'canalizacion_ppp',          etiqueta: 'CANALIZACION Y POZO\nPROYECTADO EN PVC' },
  { simbolo: 'fibra optica existente e',  etiqueta: 'F.O. EXISTENTE\n(ENTERRADA)' },
  { simbolo: 'fibra optica proyectada e', etiqueta: 'F.O. PROYECTADA\n(ENTERRADA)' },
]

export const SIMBOLOGIA_COL2: readonly SimbologiaEntry[] = [
  { simbolo: 'empalme_terminal_e',    etiqueta: 'EMPALME TERMINAL\nEXISTENTE' },
  { simbolo: 'empalme_recto_e',       etiqueta: 'EMPALME RECTO EXISTENTE' },
  { simbolo: 'empalme_derivacion_e',  etiqueta: 'EMPALME DERIVACION\nEXISTENTE' },
  { simbolo: 'pozo_cp',               etiqueta: 'POZO CONICO PROYECTADO Y\nCONEXION A TIERRA PROY.' },
  { simbolo: 'poste de telmex 1',     etiqueta: 'POSTE DE MADERA\nTELMEX' },
  { simbolo: 'poste de telmex ld',    etiqueta: 'POSTE DE L.D.\nTELMEX' },
]

export const SIMBOLOGIA_COL3: readonly SimbologiaEntry[] = [
  { simbolo: 'gaza de 15',            etiqueta: 'GAZA DE 15.0 MTS.\nPROYECTADA' },
  { simbolo: 'arado_terreno_ab',      etiqueta: 'ARADO TERRENO A' },
  { simbolo: 'gaza de 15 e',          etiqueta: 'GAZA DE 15.0 MTS.\nEXISTENTE' },
  { simbolo: 'rueda_terreno_tipo_c',  etiqueta: 'RUEDA TERRENO C' },
  { simbolo: 'limite de dv',          etiqueta: 'LIMITE DE DERECHO DE VIA\nS.C.T.' },
  { simbolo: 'carretera',             etiqueta: 'CARRETERA' },
]

// ─── Class ────────────────────────────────────────────────────────────────────

export class CResumenProyecto {
  static readonly ALLOWED_ON_MENU = false

  private _bTablaCreada  = false
  // Set by CGuiEditaSelloResumenProyecto after editing tbl_Resumen cell (1,1)
  private _contenidoSello = 'RESUMEN DEL PROYECTO'

  readonly lista: ListaItem[] = LISTA_ETIQUETAS.map(e => ({ etiqueta: e, valor: '' }))

  get bTablaCreada():   boolean { return this._bTablaCreada }
  get contenidoSello(): string  { return this._contenidoSello }
  set contenidoSello(v: string) { this._contenidoSello = v.toUpperCase() }

  // Magik: inicializa — creates tables and fills static content
  inicializa(): void {
    this._bTablaCreada = true
  }

  // Magik: draw_content_on — rendering deferred to Fase 5
  drawContentOn(_window: unknown): void {
    if (!this._bTablaCreada) this.inicializa()
  }

  // Magik: AsignaCelda2 — updates the capture-text value in col 3 of tbl_Lista
  asignaValorLista(renglon: number, valor: string): void {
    const item = this.lista[renglon - 1]
    if (item) item.valor = valor
  }

  // Magik: prvLlenaEtiquetas dot-leader padding logic (LsTexto.size → 75 chars)
  static buildDotLeader(texto: string, totalLen = 75): string {
    return texto + '.'.repeat(Math.max(1, totalLen - texto.length))
  }

  // Total sello height in mm (sum of all table row heights)
  static get totalHeightMm(): number {
    const sum = (lens: readonly number[]) => lens.slice(1).reduce((a, b) => a + b, 0)
    return (
      sum(TBL_RESUMEN.rowLens) +
      sum(TBL_LISTA.rowLens) +
      sum(TBL_SIMBOLOGIA_TIT.rowLens) +
      Math.max(
        sum(TBL_SIMBOLOGIA_COL1.rowLens),
        sum(TBL_SIMBOLOGIA_COL2.rowLens),
        sum(TBL_SIMBOLOGIA_COL3.rowLens),
      )
    )
  }
}
