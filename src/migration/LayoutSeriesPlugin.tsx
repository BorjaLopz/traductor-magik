// =============================================================================
// MIGRACIÓN: layout_series_plugin → LayoutSeriesPlugin.tsx
// Fuente: adiciones_layout/source/layout_series_plugin.magik (1107 líneas)
// Patrón Magik: extensión de plugin PNI existente — no es def_slotted_exemplar.
//   Añade/redefine métodos sobre layout_series_plugin del framework GE Smallworld.
//   Se modela como clase standalone con static shared_variables.
// GIS omitido: smallworld_product.pni_application(), gis_program_manager,
//   swg_dsn_admin_engine, databus — todos stubados.
// =============================================================================

import React, { useState, useMemo } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TipoPlano =
  | 'plano_ruta'
  | 'plano_ruta_compa'
  | 'plano_acometida_cliente'
  | 'plano_esquematico_ftth'
  | 'plano_trayectoria'
  | 'plano_ruta_lar'
  | 'plano_ruta_lar_gral'
  | 'plano_ftth'
  | 'plano_secundario_falc'

export interface PlanoConfig {
  aceName: string
  displayStyle: string
  styleGroup: string
}

export interface BBox {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

export interface ElementoPagina {
  className: string
  bounds: BBox
  name?: string
  text?: string
}

export interface PropiedadesPlanoRuta {
  plano_ruta?: boolean
  plano_ruta_compa?: boolean
  plano_acometida_cliente?: boolean
  plano_esquematico_ftth?: boolean
  plano_ruta_lar?: boolean
  plano_ruta_lar_gral?: boolean
  plano_ftth?: boolean
  tipo_plano?: TipoPlano
  areas_ruta?: BBox[]
}

export interface PropiedadesPlanoTrayectoria {
  plano_trayectoria?: boolean
  plano_secundario_falc?: boolean
  tipo_plano?: TipoPlano
}

export interface EstructuraTrayecto {
  uub?: string[]   // pozos subterráneos
  pole?: string[]  // postes aéreos
}

// ─── Config XML stub ─────────────────────────────────────────────────────────
// En producción se lee de planos_config.xml vía simple_xml.
// Cada entrada: tipo_plano → { ace_name, display_style, style_group }

const PLANO_CONFIGS: Record<string, PlanoConfig> = {
  plano_ruta:              { aceName: 'gis_ruta',       displayStyle: 'ruta_fo',      styleGroup: 'PNI_RUTA'     },
  plano_ruta_compa:        { aceName: 'gis_compa',      displayStyle: 'compa_fo',     styleGroup: 'PNI_COMPA'    },
  plano_acometida_cliente: { aceName: 'gis_acometida',  displayStyle: 'acom_fo',      styleGroup: 'PNI_ACOM'     },
  plano_esquematico_ftth:  { aceName: 'gs!schematic',   displayStyle: 'ftth_esq',     styleGroup: 'PNI_FTTH'     },
  plano_trayectoria:       { aceName: 'gis_tray',       displayStyle: 'tray_fo',      styleGroup: 'PNI_TRAY'     },
  plano_ruta_lar:          { aceName: 'gis_lar',        displayStyle: 'lar_fo',       styleGroup: 'PNI_LAR'      },
  plano_ruta_lar_gral:     { aceName: 'gis_lar_gral',   displayStyle: 'lar_gral_fo',  styleGroup: 'PNI_LAR_GRAL' },
  plano_ftth:              { aceName: 'gis_ftth',       displayStyle: 'ftth_fo',      styleGroup: 'PNI_FTTH_R'   },
  plano_secundario_falc:   { aceName: 'gs!schematic',   displayStyle: 'falc_esq',     styleGroup: 'PNI_FALC'     },
}

// ─── Clase ───────────────────────────────────────────────────────────────────

export class LayoutSeriesPlugin {
  // Magik: layout_series_plugin.define_shared_constant(:databus_producer_data_types, …)
  static readonly DATABUS_PRODUCER_DATA_TYPES = ['post_render_sets'] as const

  // Magik: layout_series_plugin.define_shared_variable(…)
  static mismosCedoId: string | undefined = undefined
  static elementosPlanoTrayectoria: { elementos: ElementoPagina[]; sellos: ElementoPagina[] } = { elementos: [], sellos: [] }
  static elementosPlanoRuta:        { elementos: ElementoPagina[]; sellos: ElementoPagina[] } = { elementos: [], sellos: [] }
  static propiedadesPlanoRuta:            PropiedadesPlanoRuta       = {}
  static propiedadesPlanoTrayectoria:     PropiedadesPlanoTrayectoria = {}
  static propiedadesPlanoEsquematicoFtth: Record<string, unknown>    = {}

  private _pages: ElementoPagina[][]

  constructor(numPages = 1) {
    this._pages = Array.from({ length: numPages }, () => [])
  }

  get pages(): ElementoPagina[][] { return this._pages }

  // ── propiedades_plano ─────────────────────────────────────────────────────
  // Lee tipo de plano activo, limpia elementosPlanoRuta y devuelve PlanoConfig
  // desde XML. Además filtra los elementos de la página maestra según tipo.
  propiedadesPlano(aceName: string, displayStyle: string, styleGroup: string): PlanoConfig {
    LayoutSeriesPlugin.elementosPlanoRuta = { elementos: [], sellos: [] }

    const r  = LayoutSeriesPlugin.propiedadesPlanoRuta
    const t  = LayoutSeriesPlugin.propiedadesPlanoTrayectoria
    let tipo: string | undefined

    if (r.plano_ruta)              { tipo = 'plano_ruta'              }
    else if (r.plano_ruta_compa)   { tipo = 'plano_ruta_compa'        }
    else if (r.plano_acometida_cliente) { tipo = 'plano_acometida_cliente' }
    else if (r.plano_esquematico_ftth)  { tipo = 'plano_esquematico_ftth'  }
    else if (t.plano_trayectoria && t.tipo_plano) { tipo = t.tipo_plano }
    else if (r.plano_ruta_lar)          { tipo = 'plano_ruta_lar'         }
    else if (r.plano_ruta_lar_gral)     { tipo = 'plano_ruta_lar_gral'    }
    else if (r.plano_ftth && r.tipo_plano) { tipo = r.tipo_plano          }

    if (tipo) return this.obtenPropiedadesDesdeXml(tipo)
    return { aceName, displayStyle, styleGroup }
  }

  // ── obten_propiedades_desde_xml ───────────────────────────────────────────
  // Lee planos_config.xml. Stub: tabla en memoria.
  obtenPropiedadesDesdeXml(tipoPlano: string): PlanoConfig {
    return PLANO_CONFIGS[tipoPlano] ?? { aceName: 'gis', displayStyle: 'default', styleGroup: 'default' }
  }

  // ── actualizar_sectors ────────────────────────────────────────────────────
  // Asigna sectors_buffer a todos los viewports c_vp_ruta_de_cables_fo /
  // c_vp_comparticion_infra en el documento.
  actualizarSectors(sectors: unknown[]): void {
    (LayoutSeriesPlugin.elementosPlanoRuta as Record<string, unknown>)['sectors_buffer'] = sectors
  }

  sectorsBuffer(): unknown[] | undefined {
    return (LayoutSeriesPlugin.elementosPlanoRuta as Record<string, unknown>)['sectors_buffer'] as unknown[] | undefined
  }

  // ── add_as_producer ───────────────────────────────────────────────────────
  // Registra el plugin como productor databus para post_render_sets.
  // En web: no-op — Zustand store reemplaza el databus.
  addAsProducer(): void { /* stub */ }

  // ── agrega_simbolo ────────────────────────────────────────────────────────
  agregaSimbolo(page: ElementoPagina[], nombreSimbolo: string, bounds: BBox): void {
    page.push({ className: 'symbol_layout', name: nombreSimbolo, bounds })
  }

  // ── sw_databus_data_requested ─────────────────────────────────────────────
  swDatabusDataRequested(type: string): void {
    if (type !== 'post_render_sets') return
    const r = LayoutSeriesPlugin.propiedadesPlanoRuta
    if (r.plano_ruta && r.areas_ruta) {
      // Dibuja áreas de ruta en el mapa con line_style verde. Stub: no-op.
    }
  }

  // ── int!make_document ─────────────────────────────────────────────────────
  // Orquestador principal. Obtiene config de plano, actualiza vistas,
  // llama adds_sellos() para agregar sellos extra-página-maestra.
  intMakeDocument(): ElementoPagina[][] {
    this.propiedadesPlano('gis', 'default', 'default')
    // layout_series_engine.update_document(…) → stub: páginas ya inicializadas
    this.addsSellos()
    return this._pages
  }

  // ── adds_sellos ───────────────────────────────────────────────────────────
  // Dispatch según tipo de plano activo.
  addsSellos(): void {
    const r = LayoutSeriesPlugin.propiedadesPlanoRuta
    const t = LayoutSeriesPlugin.propiedadesPlanoTrayectoria

    if      (r.plano_ruta)             this.agregaParticulares()
    else if (r.plano_ruta_compa)       this.agregaParticularesRutaCompa()
    else if (r.plano_acometida_cliente) this.agregaParticularesAcometidaCliente()
    else if (r.plano_esquematico_ftth)  this.agregaParticularesEsquemaPral()
    else if (t.plano_trayectoria)       this.agregaParticularesToyectoria()
    else if (r.plano_ruta_lar || r.plano_ruta_lar_gral) this.agregaParticulalesLarguillos()
    else if (r.plano_ftth)              this.agregaParticularesPlanosFtth()
    else if (t.plano_secundario_falc)   this.agregaParticulareDiagEmpalmesFalc()
  }

  // ── agrega_particulares (plano_ruta) ──────────────────────────────────────
  private agregaParticulares(): void {
    for (const pag of this._pages) {
      pag.push({ className: 'c_notas_constructor',        bounds: { xMin: 1263, yMin: 3203, xMax: 3063, yMax: 3793 } })
      pag.push({ className: 'c_secuencia_trabajo',         bounds: { xMin: 2082, yMin: 6817, xMax: 3232, yMax: 8197 } })
      pag.push({ className: 'c_sello_ruta_cables_fo_sigp', bounds: { xMin:  416, yMin:  447, xMax: 1917, yMax: 2232 } })
      this.addPlacasIdentificacionCable(pag)
      pag.push({ className: 'c_cuadro_resumen_del_cable',  bounds: { xMin: 3413, yMin: 1104, xMax: 6203, yMax: 2404 } })
      pag.push({ className: 'c_resumen_del_proyecto',      bounds: { xMin: 1982, yMin: 3867, xMax: 3242, yMax: 6507 } })
    }
  }

  // ── agrega_particulares_ruta_compa ────────────────────────────────────────
  private agregaParticularesRutaCompa(): void {
    for (const pag of this._pages) this.addSellosRutaCompa(pag)
  }

  addSellosRutaCompa(pag: ElementoPagina[]): void {
    const estr: EstructuraTrayecto = { uub: ['pozo1'], pole: [] } // stub
    this.addSimbologiaCompa(pag, estr)
    this.addNotasCompa(pag, estr)
    pag.push({ className: 'c_sello_comp_resumen_tecnico', bounds: { xMin: 0, yMin: 0, xMax: 1000, yMax: 500 } })
  }

  addSimbologiaCompa(pag: ElementoPagina[], estr: EstructuraTrayecto): void {
    const pozos  = (estr.uub?.length  ?? 0) > 0
    const postes = (estr.pole?.length ?? 0) > 0
    const mixta  = pozos && postes

    if (!mixta) {
      if (postes) pag.push({ className: 'c_cuadro_simbologia_planos_compa', name: 'simbologia_planos_compa_postes', bounds: { xMin: 3200, yMin: 1800, xMax: 3200, yMax: 1800 } })
      if (pozos)  pag.push({ className: 'c_cuadro_simbologia_planos_compa', name: 'simbologia_planos_compa_pozos',  bounds: { xMin: 5200, yMin: 1800, xMax: 5200, yMax: 1800 } })
    } else {
      pag.push({ className: 'c_cuadro_simbologia_planos_compa', name: 'simbologia_planos_compa_postes', bounds: { xMin: 3200, yMin: 1800, xMax: 3200, yMax: 1800 } })
      pag.push({ className: 'c_cuadro_simbologia_planos_compa', name: 'simbologia_planos_compa_pozos',  bounds: { xMin: 5200, yMin: 1800, xMax: 5200, yMax: 1800 } })
    }
  }

  addNotasCompa(pag: ElementoPagina[], estr: EstructuraTrayecto): void {
    const pozos  = (estr.uub?.length  ?? 0) > 0
    const postes = (estr.pole?.length ?? 0) > 0
    const mixta  = pozos && postes

    const notaPostes = 'Nota: Los cables de los CS se instalan en lado arroyo y del lado contrario de los puntos de dispersión. Las excepciones se indican en el plano.'
    const notaPozos  = 'Nota: Los ductos de 100 mm se subdividen en 3 subductos, y los ductos de 80 mm se subdividen en 2 subductos.'

    if (!mixta) {
      if (postes) pag.push({ className: 'textbox_layout', text: notaPostes, bounds: { xMin: 0, yMin: 0,   xMax: 3000, yMax: 200 } })
      if (pozos)  pag.push({ className: 'textbox_layout', text: notaPozos,  bounds: { xMin: 0, yMin: 0,   xMax: 2500, yMax: 200 } })
    } else {
      pag.push({ className: 'textbox_layout', text: notaPostes, bounds: { xMin: 0, yMin: 0,   xMax: 3000, yMax: 200 } })
      pag.push({ className: 'textbox_layout', text: notaPozos,  bounds: { xMin: 0, yMin: 250, xMax: 2500, yMax: 450 } })
    }
  }

  // ── agrega_particulares_esquema_pral (plano_esquematico_ftth) ─────────────
  private agregaParticularesEsquemaPral(): void {
    for (const pag of this._pages) {
      pag.push({ className: 'c_sello_ruta_cables_fo_sigp', bounds: { xMin:  416, yMin:  447, xMax: 1917, yMax: 2232 } })
      pag.push({ className: 'c_notas_constructor',          bounds: { xMin: 1462, yMin:  684, xMax: 3262, yMax: 1274 } })
      this.agregaSimbolo(pag, 'simbologia_p_ruta', { xMin: 220, yMin: 4230, xMax: 1520, yMax: 5500 })
      pag.push({ className: 'c_resumen_del_proyecto',       bounds: { xMin: 1982, yMin: 3867, xMax: 3242, yMax: 6507 } })
      this.addSelloTablaEquivalenciasXCable(pag)
      pag.push({ className: 'c_cuadro_resumen_del_cable',   bounds: { xMin: 3413, yMin: 1104, xMax: 6203, yMax: 2404 } })
      pag.push({ className: 'c_cuadro_resumen_distrito',    bounds: { xMin: 3457, yMin: 2603, xMax: 4337, yMax: 2993 } })
      this.addPlacasIdentificacionCable(pag)
    }
  }

  // ── agrega_particulares_acometida_cliente ─────────────────────────────────
  // Cuerpo vacío en fuente original — lógica cliente pendiente.
  private agregaParticularesAcometidaCliente(): void { /* vacío en fuente */ }

  // ── stubs de tipos restantes ──────────────────────────────────────────────
  private agregaParticularesToyectoria(): void { /* stub: lógica en cambios_pni/ */ }
  private agregaParticulalesLarguillos(): void { /* stub: lógica en cambios_pni/ */ }
  private agregaParticularesPlanosFtth(): void { /* stub: lógica en cambios_pni/ */ }
  private agregaParticulareDiagEmpalmesFalc(): void { /* stub: accede a esquema_tab_plugin GIS */ }

  // ── add_sello_tabla_equivalencias_x_cable ─────────────────────────────────
  // Genera un sello por cada cable proyectado que sale de la central.
  // Stub: agrega un sello demo con bounds fijos del fuente.
  addSelloTablaEquivalenciasXCable(page: ElementoPagina[]): void {
    page.push({ className: 'c_tabla_equivalencias_x_cable', bounds: { xMin: 3556, yMin: 5735, xMax: 4546, yMax: 8395 } })
  }

  // ── add_placas_identificacion_cable ───────────────────────────────────────
  // Hasta 5 placas, separadas 300 unidades en X. Solo cables tipo :principal.
  addPlacasIdentificacionCable(page: ElementoPagina[]): void {
    const maxPlacas = 5
    for (let i = 0; i < maxPlacas; i++) {
      const desp = i * 300
      page.push({
        className: 'c_placa_identificacion_fo',
        bounds: { xMin: 3855 + desp, yMin: 3488, xMax: 5355 + desp, yMax: 3988 },
        name: `CABLE-P${String(i + 1).padStart(2, '0')}`,
      })
    }
  }

  // ── add_placas_identificacion_cable_rof ───────────────────────────────────
  // Variante ROF: separación 1500 unidades, filtro por cliente o central.
  addPlacasIdentificacionCableRof(page: ElementoPagina[]): void {
    const cablesDemo = ['ROF-CLT-01', 'ROF-CEN-02']
    cablesDemo.forEach((name, i) => {
      const desp = i * 1500
      page.push({ className: 'c_placa_acometida_rof', bounds: { xMin: 3955 + desp, yMin: 3488, xMax: 5455 + desp, yMax: 3988 }, name })
    })
  }

  // ── reset ─────────────────────────────────────────────────────────────────
  static reset(): void {
    LayoutSeriesPlugin.mismosCedoId               = undefined
    LayoutSeriesPlugin.elementosPlanoRuta         = { elementos: [], sellos: [] }
    LayoutSeriesPlugin.elementosPlanoTrayectoria  = { elementos: [], sellos: [] }
    LayoutSeriesPlugin.propiedadesPlanoRuta       = {}
    LayoutSeriesPlugin.propiedadesPlanoTrayectoria = {}
    LayoutSeriesPlugin.propiedadesPlanoEsquematicoFtth = {}
  }
}

// ─── Datos de dispatch para la UI ────────────────────────────────────────────

const DISPATCH_TABLE: {
  tipoPlano: TipoPlano
  label: string
  propsKey: 'ruta' | 'trayectoria'
  flag: string
  metodo: string
  sellos: string[]
}[] = [
  { tipoPlano: 'plano_ruta',              label: 'Ruta FO',            propsKey: 'ruta',         flag: 'plano_ruta',              metodo: 'agregaParticulares()',                sellos: ['c_notas_constructor','c_secuencia_trabajo','c_sello_ruta_cables_fo_sigp','c_cuadro_resumen_del_cable','c_resumen_del_proyecto','c_placa_identificacion_fo×5'] },
  { tipoPlano: 'plano_ruta_compa',        label: 'Ruta Compartición',  propsKey: 'ruta',         flag: 'plano_ruta_compa',        metodo: 'agregaParticularesRutaCompa()',        sellos: ['c_cuadro_simbologia_compa','textbox_layout (notas)','c_sello_comp_resumen_tecnico'] },
  { tipoPlano: 'plano_acometida_cliente', label: 'Acometida Cliente',  propsKey: 'ruta',         flag: 'plano_acometida_cliente', metodo: 'agregaParticularesAcometidaCliente()', sellos: ['(vacío en fuente)'] },
  { tipoPlano: 'plano_esquematico_ftth',  label: 'Esquemático FTTH',   propsKey: 'ruta',         flag: 'plano_esquematico_ftth',  metodo: 'agregaParticularesEsquemaPral()',      sellos: ['c_sello_ruta_cables_fo_sigp','c_notas_constructor','symbol_layout','c_resumen_del_proyecto','c_tabla_equivalencias_x_cable','c_cuadro_resumen_del_cable','c_cuadro_resumen_distrito','c_placa_identificacion_fo×5'] },
  { tipoPlano: 'plano_trayectoria',       label: 'Trayectoria',        propsKey: 'trayectoria',  flag: 'plano_trayectoria',       metodo: 'agregaParticularesToyectoria()',       sellos: ['(stub — cambios_pni/)'] },
  { tipoPlano: 'plano_ruta_lar',          label: 'Ruta LAR',           propsKey: 'ruta',         flag: 'plano_ruta_lar',          metodo: 'agregaParticulalesLarguillos()',       sellos: ['(stub — cambios_pni/)'] },
  { tipoPlano: 'plano_ruta_lar_gral',     label: 'Ruta LAR Gral',      propsKey: 'ruta',         flag: 'plano_ruta_lar_gral',     metodo: 'agregaParticulalesLarguillos()',       sellos: ['(stub — cambios_pni/)'] },
  { tipoPlano: 'plano_ftth',              label: 'FTTH',               propsKey: 'ruta',         flag: 'plano_ftth',              metodo: 'agregaParticularesPlanosFtth()',       sellos: ['(stub — cambios_pni/)'] },
  { tipoPlano: 'plano_secundario_falc',   label: 'Secundario FALC',    propsKey: 'trayectoria',  flag: 'plano_secundario_falc',   metodo: 'agregaParticulareDiagEmpalmesFalc()', sellos: ['(stub — accede a esquema_tab_plugin)'] },
]

// ─── Componente UI ────────────────────────────────────────────────────────────

const S = {
  root: { fontFamily: 'monospace', background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: 24 } as React.CSSProperties,
  h1: { fontSize: 18, fontWeight: 700, color: '#79c0ff', marginBottom: 4 } as React.CSSProperties,
  sub: { fontSize: 12, color: '#8b949e', marginBottom: 24 } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 } as React.CSSProperties,
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 16 } as React.CSSProperties,
  label: { fontSize: 11, color: '#8b949e', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 },
  btn: (active: boolean) => ({
    display: 'block', width: '100%', textAlign: 'left' as const, padding: '8px 12px',
    marginBottom: 4, borderRadius: 6, border: '1px solid',
    borderColor: active ? '#388bfd' : '#30363d',
    background: active ? '#1c2d4f' : '#21262d',
    color: active ? '#79c0ff' : '#e6edf3',
    cursor: 'pointer', fontSize: 12,
  }),
  runBtn: {
    padding: '8px 20px', borderRadius: 6, border: 'none',
    background: '#238636', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    marginTop: 12, width: '100%',
  } as React.CSSProperties,
  resetBtn: {
    padding: '6px 14px', borderRadius: 6, border: '1px solid #30363d',
    background: '#21262d', color: '#8b949e', cursor: 'pointer', fontSize: 12,
    marginTop: 8, width: '100%',
  } as React.CSSProperties,
  tag: (color: string) => ({
    display: 'inline-block', padding: '1px 6px', borderRadius: 4,
    background: color + '22', color, fontSize: 10, fontWeight: 600, marginRight: 4,
  }),
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } as React.CSSProperties,
  selloItem: { padding: '4px 8px', borderRadius: 4, background: '#21262d', fontSize: 11, marginBottom: 3, color: '#e6edf3' } as React.CSSProperties,
  dispatchRow: (active: boolean) => ({
    display: 'grid', gridTemplateColumns: '160px 200px 1fr',
    gap: 8, padding: '6px 10px', borderRadius: 6, marginBottom: 4,
    background: active ? '#1c2d4f' : '#161b22',
    border: `1px solid ${active ? '#388bfd' : '#30363d'}`,
    fontSize: 11,
  }),
  configChip: { padding: '2px 8px', borderRadius: 10, background: '#21262d', border: '1px solid #30363d', fontSize: 11, color: '#79c0ff' } as React.CSSProperties,
} as const

export function LayoutSeriesPluginUI() {
  const [selectedTipo, setSelectedTipo] = useState<TipoPlano>('plano_ruta')
  const [numPages, setNumPages] = useState(2)
  const [ran, setRan] = useState(false)
  const [pages, setPages] = useState<ElementoPagina[][]>([])

  const entry = DISPATCH_TABLE.find(d => d.tipoPlano === selectedTipo)!

  const config = useMemo(
    () => PLANO_CONFIGS[selectedTipo] ?? { aceName: 'gis', displayStyle: 'default', styleGroup: 'default' },
    [selectedTipo]
  )

  function runSimulation() {
    LayoutSeriesPlugin.reset()
    const r: PropiedadesPlanoRuta = {}
    const t: PropiedadesPlanoTrayectoria = {}

    if (entry.propsKey === 'ruta') {
      (r as Record<string, boolean | string>)[entry.flag] = true
      if (selectedTipo === 'plano_ftth') r.tipo_plano = 'plano_ftth'
    } else {
      (t as Record<string, boolean | string>)[entry.flag] = true
      if (selectedTipo === 'plano_trayectoria') t.tipo_plano = 'plano_trayectoria'
    }

    LayoutSeriesPlugin.propiedadesPlanoRuta        = r
    LayoutSeriesPlugin.propiedadesPlanoTrayectoria = t

    const plugin = new LayoutSeriesPlugin(numPages)
    const result = plugin.intMakeDocument()
    setPages(result.map(p => [...p]))
    setRan(true)
  }

  function reset() {
    LayoutSeriesPlugin.reset()
    setPages([])
    setRan(false)
  }

  return (
    <div style={S.root}>
      <div style={S.h1}>LayoutSeriesPlugin</div>
      <div style={S.sub}>
        Extensión PNI de layout_series_plugin · dispatch de 9 tipos de plano · cascada de sellos
      </div>

      <div style={S.grid}>
        {/* Panel izquierdo: selección */}
        <div>
          <div style={S.card}>
            <div style={S.label}>Tipo de plano</div>
            {DISPATCH_TABLE.map(d => (
              <button key={d.tipoPlano} style={S.btn(selectedTipo === d.tipoPlano)} onClick={() => { setSelectedTipo(d.tipoPlano); setRan(false) }}>
                <span style={S.tag(d.propsKey === 'ruta' ? '#3fb950' : '#d2a8ff')}>{d.propsKey}</span>
                {d.label}
              </button>
            ))}

            <div style={{ marginTop: 16, ...S.label }}>Páginas del documento</div>
            <div style={S.row}>
              {[1, 2, 3].map(n => (
                <button key={n} style={{ ...S.btn(numPages === n), width: 'auto', padding: '4px 14px' }} onClick={() => setNumPages(n)}>{n}</button>
              ))}
            </div>

            <button style={S.runBtn} onClick={runSimulation}>▶ intMakeDocument()</button>
            <button style={S.resetBtn} onClick={reset}>↺ Reset static state</button>
          </div>

          {/* Config XML */}
          <div style={{ ...S.card, marginTop: 12 }}>
            <div style={S.label}>Config desde XML — {selectedTipo}</div>
            <div style={S.row}><span style={S.configChip}>ace_name</span><span style={{ fontSize: 12 }}>{config.aceName}</span></div>
            <div style={S.row}><span style={S.configChip}>display_style</span><span style={{ fontSize: 12 }}>{config.displayStyle}</span></div>
            <div style={S.row}><span style={S.configChip}>style_group</span><span style={{ fontSize: 12 }}>{config.styleGroup}</span></div>
          </div>
        </div>

        {/* Panel derecho */}
        <div>
          {/* Tabla de dispatch */}
          <div style={S.card}>
            <div style={S.label}>Tabla de dispatch — adds_sellos()</div>
            <div style={{ marginBottom: 6, display: 'grid', gridTemplateColumns: '160px 200px 1fr', gap: 8, padding: '4px 10px', fontSize: 10, color: '#8b949e' }}>
              <span>Tipo plano</span><span>Método</span><span>Sellos agregados</span>
            </div>
            {DISPATCH_TABLE.map(d => (
              <div key={d.tipoPlano} style={S.dispatchRow(d.tipoPlano === selectedTipo)}>
                <span style={{ color: d.tipoPlano === selectedTipo ? '#79c0ff' : '#e6edf3' }}>{d.label}</span>
                <span style={{ color: '#f2cc60', fontFamily: 'monospace' }}>{d.metodo}</span>
                <span style={{ color: '#8b949e' }}>{d.sellos.join(' · ')}</span>
              </div>
            ))}
          </div>

          {/* Resultado de simulación */}
          {ran && (
            <div style={{ ...S.card, marginTop: 12 }}>
              <div style={S.label}>
                Resultado — {numPages} página{numPages > 1 ? 's' : ''} · tipo: {selectedTipo}
              </div>
              {pages.map((pag, pi) => (
                <div key={pi} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#f2cc60', marginBottom: 6 }}>
                    Página {pi + 1} — {pag.length} elemento{pag.length !== 1 ? 's' : ''}
                  </div>
                  {pag.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#8b949e', fontStyle: 'italic' }}>Sin sellos extra-página-maestra</div>
                  ) : (
                    pag.map((el, ei) => (
                      <div key={ei} style={S.selloItem}>
                        <span style={{ color: '#79c0ff' }}>{el.className}</span>
                        {el.name && <span style={{ color: '#3fb950', marginLeft: 8 }}>"{el.name}"</span>}
                        <span style={{ color: '#6e7681', marginLeft: 8 }}>
                          [{el.bounds.xMin},{el.bounds.yMin} → {el.bounds.xMax},{el.bounds.yMax}]
                        </span>
                        {el.text && <div style={{ color: '#8b949e', fontSize: 10, marginTop: 2, whiteSpace: 'pre-wrap' }}>{el.text.slice(0, 80)}{el.text.length > 80 ? '…' : ''}</div>}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Shared variables */}
          <div style={{ ...S.card, marginTop: 12 }}>
            <div style={S.label}>Static shared variables</div>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ color: '#8b949e' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 400 }}>Variable Magik</th>
                  <th style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 400 }}>Campo TypeScript</th>
                  <th style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 400 }}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['mismo_cedo_id',                  'mismosCedoId',                   'string | undefined'],
                  ['elementos_plano_trayectoria',     'elementosPlanoTrayectoria',       '{ elementos: ElementoPagina[]; sellos: ElementoPagina[] }'],
                  ['elementos_plano_ruta',            'elementosPlanoRuta',              '{ elementos: ElementoPagina[]; sellos: ElementoPagina[] }'],
                  ['propiedades_plano_ruta',          'propiedadesPlanoRuta',            'PropiedadesPlanoRuta'],
                  ['propiedades_plano_trayectoria',   'propiedadesPlanoTrayectoria',     'PropiedadesPlanoTrayectoria'],
                  ['propiedades_plano_esquematico_ftth','propiedadesPlanoEsquematicoFtth','Record<string, unknown>'],
                ].map(([magik, ts, tipo]) => (
                  <tr key={magik} style={{ borderTop: '1px solid #21262d' }}>
                    <td style={{ padding: '5px 0', color: '#f2cc60' }}>{magik}</td>
                    <td style={{ padding: '5px 8px', color: '#79c0ff' }}>{ts}</td>
                    <td style={{ padding: '5px 0', color: '#8b949e' }}>{tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
