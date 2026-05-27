// =============================================================================
// MIGRACIÓN: c_resumen_materiales → CResumenMateriales.tsx
// Fuente: adiciones_layout/source/Sellos/c_resumen_materiales.magik
// Herencia Magik: :layout_element (no implementada — standalone)
//
// Genera tabla de "Resumen de Materiales" para planos de canalizaciones.
// Estructura: 5 secciones apiladas verticalmente.
//   - Zona Urbana (13 ítems) — siempre
//   - Zona Suburbana (21 ítems) — siempre
//   - Tramo/Plano (11 ítems) — siempre (título cambia según sTipo)
//   - Derivaciones (8 ítems) — solo si sTipo ≠ "SEMBRADO"
//   - Permisos (15 ítems) — solo si sTipo ≠ "SEMBRADO"
//
// Cantidades: inicialmente vacías. Se asignan externamente vía
//   cantidadesZonaUrbana(), cantidadesZonaSubUrbana(), etc.
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TipoResumen = 'SEMBRADO' | 'TRAMO'

export interface SeccionMateriales {
  id: string
  titulo: string
  subtitulo?: string
  items: string[]
  cantidades: string[]
}

// ─── Constantes de descripción ────────────────────────────────────────────────

const DESCRIP_ZONA_URBANA: string[] = [
  'B.D.F.O.',
  'DISTRIB. OPTICO',
  'ECALERILLA P/F. O.',
  'DUCT. SDV. 35 .5 MM',
  'TAPA PARA S. D. V.',
  'SOPORTES P/CAB.FO',
  'CABLE FO. TM-',
  'CAB. FO. TM- DER.',
  'PLACAS DE IDENTIF.',
  'CIERR. RECT. P/ FO.',
  'CIERR. DERIV. P/ FO',
  'GAZAS A ELABORAR',
  'EMP. FVS. MOD 6 FO.',
]

const DESCRIP_ZONA_SUBURBANA: string[] = [
  'DUCTO DE P. ENTERR.',
  'DUCT. ENTERR DERIV.',
  'DUCT. POL. ADICIONAL',
  'POZO CONICO ENTERR',
  "ENCOF. F'C=150KG/CM",
  "TUB.HINC. '' DE 0",
  "TUB. ADOS '' DE 0",
  "TUB. DIRECC. '' DE 0",
  'CANALETA DE 90x90',
  'RUP.Y REP. CUNETA',
  'CINT. NYLON AMARR. G',
  'CABLA FO. TM-',
  'CAB. FO.TM- DER.',
  'PLACAS DE IDENTIF.',
  'CIERR. RECT. P/',
  'CIERR. DERIV. P/ FO',
  'ATERRIZAJE EMPALME',
  'GAZAS A ELABORAR',
  'EMP. FUS. MOD 6 FO.',
  'POSTE DE SEÑALAM.',
  'DISPOSIT. PROTEC.',
]

const DESCRIP_TRAMO: string[] = [
  '',
  'ESCALERILLA EXIST.',
  'ESCALERILLA PROY.',
  'S.D.V. EXISTENTE',
  'S.D.V. PROYECTADA',
  'CANALIZ. EXIST. T. 45',
  'CANALIZ. PROYECTADA',
  'REFORZAM. CANALIZ.',
  'ENTERRADA',
  'TOTAL DIST. REAL',
  'TOT. CAB. FO.TM-',
]

const DESCRIP_DERIVACIONES: string[] = [
  'S.D.V. EXISTENTE',
  'S.D.V. PROYECTADA',
  'CANALIZ. EXIST. T. 45.',
  'CANALIZ. PROYECTADA',
  'REFORZAM. CANALIZ.',
  'ENTERRADA',
  'TOTAL DIST. REAL',
  'TOT. CAB. FO.TM-',
]

const DESCRIP_PERMISOS: string[] = [
  'INST. MARG. AUTOP.',
  'INST. MARG. FEDERAL',
  'INST. MARG. ESTATAL',
  'INST. MARG. FFCC',
  'INST. MARG. CNA',
  'INST. MARG. PEMEX',
  'PERMISO MUNICIPAL',
  'CRUZ. F.F.C.C',
  'CRUZ. PEMEX',
  'CRUZ. CARRETERA',
  'CRUZ. ALCANTARILLA',
  'CRUZ. PUENTE',
  'CRUZ. CNA',
  '',
  '',
]

// ─── Clase ───────────────────────────────────────────────────────────────────

export class CResumenMateriales {
  static readonly ALLOWED_ON_MENU = false
  static readonly SEMBRADO = 'SEMBRADO'

  // Dimensiones de las tablas (unidades de layout, en mm aprox.)
  readonly nNumRenZonaUrbana    = 13
  readonly nNumRenZonaSubUrbana = 21
  readonly nNumRenTramo         = 11
  readonly nNumRenDerivaciones  =  8
  readonly nNumRenPermisos      = 15

  private readonly _nAnchoDescrip = 30  // ancho columna descripcion
  private readonly _nAnchoCant    = 20  // ancho columna cantidad
  private readonly _nAltoTit      =  5  // alto renglon de titulo
  private readonly _nAltoDescrip  =  3  // alto renglon encabezado
  private readonly _nAltoRen      =  2  // alto renglones de detalle

  private _sTipo: string

  // Colecciones de cantidades — externamente asignadas
  collCantZonaUrbana:    string[]
  collCantZonaSubUrbana: string[]
  collCantTramo:         string[]
  collCantDerivaciones:  string[]
  collCantPermisos:      string[]

  constructor(sTipo = CResumenMateriales.SEMBRADO) {
    this._sTipo = sTipo
    this.collCantZonaUrbana    = Array(this.nNumRenZonaUrbana).fill('')
    this.collCantZonaSubUrbana = Array(this.nNumRenZonaSubUrbana).fill('')
    this.collCantTramo         = Array(this.nNumRenTramo).fill('')
    this.collCantDerivaciones  = Array(this.nNumRenDerivaciones).fill('')
    this.collCantPermisos      = Array(this.nNumRenPermisos).fill('')
  }

  get sTipo(): string { return this._sTipo }
  set sTipo(v: string) { this._sTipo = v }
  get isSembrado(): boolean { return this._sTipo === CResumenMateriales.SEMBRADO }

  // Dimensiones (read-only — set solo en constructor)
  get nAnchoDescrip(): number { return this._nAnchoDescrip }
  get nAnchoCant(): number { return this._nAnchoCant }
  get nAltoTit(): number { return this._nAltoTit }
  get nAltoDescrip(): number { return this._nAltoDescrip }
  get nAltoRen(): number { return this._nAltoRen }

  // ── Inicializa descripciones ──────────────────────────────────────────────

  inicializaDescripZonaUrbana(): string[] { return [...DESCRIP_ZONA_URBANA] }
  inicializaDescripSubUrbanas(): string[] { return [...DESCRIP_ZONA_SUBURBANA] }
  inicializaDescripTramo(): string[]      { return [...DESCRIP_TRAMO] }
  inicializaDescripDerivaciones(): string[] { return [...DESCRIP_DERIVACIONES] }
  inicializaDescripPermisos(): string[]   { return [...DESCRIP_PERMISOS] }

  // ── Cantidades externas ───────────────────────────────────────────────────
  // Equivalentes a Cantidades_ZonaUrbana(), etc.

  cantidadesZonaUrbana(vals: string[]): void {
    this.collCantZonaUrbana = vals.slice(0, this.nNumRenZonaUrbana)
  }
  cantidadesZonaSubUrbana(vals: string[]): void {
    this.collCantZonaSubUrbana = vals.slice(0, this.nNumRenZonaSubUrbana)
  }
  cantidadesTramo(vals: string[]): void {
    this.collCantTramo = vals.slice(0, this.nNumRenTramo)
  }
  cantidadesDerivaciones(vals: string[]): void {
    this.collCantDerivaciones = vals.slice(0, this.nNumRenDerivaciones)
  }
  cantidadesPermisos(vals: string[]): void {
    this.collCantPermisos = vals.slice(0, this.nNumRenPermisos)
  }

  // ── getSecciones ──────────────────────────────────────────────────────────
  // Construye las secciones activas según sTipo.
  // sTipo == "SEMBRADO" → 3 secciones; cualquier otro valor → 5 secciones.
  getSecciones(): SeccionMateriales[] {
    const secciones: SeccionMateriales[] = [
      {
        id: 'zona_urbana',
        titulo: 'RESUMEN DE MATERIALES',
        subtitulo: 'EN LA ZONA URBANA',
        items: this.inicializaDescripZonaUrbana(),
        cantidades: [...this.collCantZonaUrbana],
      },
      {
        id: 'zona_suburbana',
        titulo: 'RESUMEN DE MATERIALES',
        subtitulo: 'EN LA ZONA SUBURBANA',
        items: this.inicializaDescripSubUrbanas(),
        cantidades: [...this.collCantZonaSubUrbana],
      },
      {
        id: 'tramo',
        titulo: this.isSembrado ? 'RESUMEN DEL PLANO' : 'RESUMEN DEL TRAMO',
        items: this.inicializaDescripTramo(),
        cantidades: [...this.collCantTramo],
      },
    ]
    if (!this.isSembrado) {
      secciones.push({
        id: 'derivaciones',
        titulo: 'RESUMEN DERIVACIONES',
        items: this.inicializaDescripDerivaciones(),
        cantidades: [...this.collCantDerivaciones],
      })
      secciones.push({
        id: 'permisos',
        titulo: 'RESUMEN DE PERMISOS',
        items: this.inicializaDescripPermisos(),
        cantidades: [...this.collCantPermisos],
      })
    }
    return secciones
  }

  // ── altura total ──────────────────────────────────────────────────────────
  // Suma de alturas de todas las tablas activas (en mm aprox.)
  alturaTotal(): number {
    const seccs = this.isSembrado ? 3 : 5
    const renCuerpo = [
      this.nNumRenZonaUrbana,
      this.nNumRenZonaSubUrbana,
      this.nNumRenTramo,
      ...(this.isSembrado ? [] : [this.nNumRenDerivaciones, this.nNumRenPermisos]),
    ].slice(0, seccs)

    return renCuerpo.reduce((acc, n) => {
      // titulo (2 filas de nAltoTit/2) + encabezado (nAltoDescrip) + n filas (nAltoRen)
      return acc + this._nAltoTit + this._nAltoDescrip + n * this._nAltoRen
    }, 0)
  }
}

// ─── Componente UI ────────────────────────────────────────────────────────────

const COLORES_SECCION: Record<string, string> = {
  zona_urbana:   '#1c2d4f',
  zona_suburbana:'#1a2e1a',
  tramo:         '#2d1a1a',
  derivaciones:  '#2d2a10',
  permisos:      '#1a1a2d',
}

const COLOR_TITULO: Record<string, string> = {
  zona_urbana:   '#79c0ff',
  zona_suburbana:'#56d364',
  tramo:         '#f47067',
  derivaciones:  '#e3b341',
  permisos:      '#d2a8ff',
}

export function CResumenMaterialesUI() {
  const [sTipo, setSTipo] = useState<string>('SEMBRADO')

  // Cantidades por sección: mapa sectionId → string[]
  const [cantidades, setCantidades] = useState<Record<string, string[]>>({
    zona_urbana:    Array(13).fill(''),
    zona_suburbana: Array(21).fill(''),
    tramo:          Array(11).fill(''),
    derivaciones:   Array(8).fill(''),
    permisos:       Array(15).fill(''),
  })

  const sello = useMemo(() => {
    const s = new CResumenMateriales(sTipo)
    s.cantidadesZonaUrbana(cantidades.zona_urbana)
    s.cantidadesZonaSubUrbana(cantidades.zona_suburbana)
    s.cantidadesTramo(cantidades.tramo)
    s.cantidadesDerivaciones(cantidades.derivaciones)
    s.cantidadesPermisos(cantidades.permisos)
    return s
  }, [sTipo, cantidades])

  const secciones = useMemo(() => sello.getSecciones(), [sello])

  const setCant = useCallback(
    (seccionId: string, idx: number, val: string) => {
      setCantidades(prev => {
        const arr = [...(prev[seccionId] ?? [])]
        arr[idx] = val
        return { ...prev, [seccionId]: arr }
      })
    },
    []
  )

  const cargarEjemplo = useCallback(() => {
    setCantidades({
      zona_urbana:    ['2', '4', '6', '120 m', '120', '50', '1 km', '0.3 km', '8', '3', '1', '12', '2'],
      zona_suburbana: ['500 m', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0.8 km', '0', '4', '2', '1', '0', '8', '1', '0', '0'],
      tramo:          ['', '0.4 km', '0.6 km', '0.2 km', '0.8 km', '120 m', '480 m', '60 m', '200 m', '1.28 km', '1.28 km'],
      derivaciones:   ['0.1 km', '0.2 km', '30 m', '70 m', '20 m', '50 m', '0.32 km', '0.32 km'],
      permisos:       ['2', '1', '1', '0', '0', '0', '3', '0', '0', '2', '1', '1', '0', '', ''],
    })
  }, [])

  const limpiar = useCallback(() => {
    setCantidades({
      zona_urbana:    Array(13).fill(''),
      zona_suburbana: Array(21).fill(''),
      tramo:          Array(11).fill(''),
      derivaciones:   Array(8).fill(''),
      permisos:       Array(15).fill(''),
    })
  }, [])

  // ── Estilos ────────────────────────────────────────────────────────────────

  const cs: React.CSSProperties = { fontFamily: 'monospace', background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: 20 }
  const card: React.CSSProperties = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 14 }
  const sectionLabelStyle: React.CSSProperties = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }
  const btn = (color: string): React.CSSProperties => ({ padding: '6px 16px', borderRadius: 6, border: 'none', background: color, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 })

  // Tabla visual de una sección
  const TablaSec = ({ sec }: { sec: SeccionMateriales }) => {
    const color  = COLOR_TITULO[sec.id] ?? '#79c0ff'
    const bgHead = COLORES_SECCION[sec.id] ?? '#161b22'
    const bdr    = '1px solid #30363d'

    return (
      <div style={{ marginBottom: 2, border: bdr, borderRadius: 4, overflow: 'hidden' }}>
        {/* Título */}
        <div style={{ background: bgHead, padding: '4px 8px', borderBottom: bdr }}>
          <div style={{ fontSize: 11, fontWeight: 700, color, textAlign: 'center' }}>{sec.titulo}</div>
          {sec.subtitulo && <div style={{ fontSize: 10, color, textAlign: 'center', opacity: 0.8 }}>{sec.subtitulo}</div>}
        </div>
        {/* Encabezado */}
        <div style={{ display: 'flex', background: '#21262d', borderBottom: bdr }}>
          <div style={{ flex: 3, padding: '2px 6px', fontSize: 10, color: '#8b949e', borderRight: bdr }}>DESCRIPCION</div>
          <div style={{ flex: 1, padding: '2px 6px', fontSize: 10, color: '#8b949e', textAlign: 'center' }}>CANTIDAD</div>
        </div>
        {/* Filas */}
        {sec.items.map((desc, i) => (
          <div key={i} style={{ display: 'flex', borderBottom: i < sec.items.length - 1 ? bdr : undefined, minHeight: 22 }}>
            <div style={{ flex: 3, padding: '2px 6px', fontSize: 11, color: '#e6edf3', borderRight: bdr, display: 'flex', alignItems: 'center' }}>
              {desc}
            </div>
            <div style={{ flex: 1, padding: '1px 2px', display: 'flex', alignItems: 'center' }}>
              <input
                value={sec.cantidades[i] ?? ''}
                onChange={e => setCant(sec.id, i, e.target.value)}
                style={{
                  width: '100%', background: sec.cantidades[i] ? '#1a3a1a' : 'transparent',
                  border: 'none', color: sec.cantidades[i] ? '#56d364' : '#6e7681',
                  fontSize: 11, textAlign: 'center', padding: '1px 2px', outline: 'none',
                  fontFamily: 'monospace',
                }}
                placeholder="-"
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={cs}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#79c0ff', marginBottom: 4 }}>CResumenMateriales</div>
      <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 20 }}>
        Resumen de materiales para planos de canalizaciones · 5 secciones · modo SEMBRADO/TRAMO
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>

        {/* Panel izquierdo: controles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div style={card}>
            <div style={sectionLabelStyle}>Modo (atributo sTipo)</div>
            {['SEMBRADO', 'TRAMO'].map(t => (
              <button
                key={t}
                onClick={() => setSTipo(t)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px',
                  marginBottom: 4, borderRadius: 6, border: '1px solid',
                  borderColor: sTipo === t ? '#388bfd' : '#30363d',
                  background: sTipo === t ? '#1c2d4f' : '#21262d',
                  color: sTipo === t ? '#79c0ff' : '#e6edf3',
                  cursor: 'pointer', fontSize: 12,
                }}
              >
                {t}
                {t === 'SEMBRADO' && <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 8 }}>3 secciones</span>}
                {t === 'TRAMO' && <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 8 }}>5 secciones</span>}
              </button>
            ))}
            <div style={{ marginTop: 8, fontSize: 11, color: '#8b949e', lineHeight: 1.5 }}>
              sTipo ≠ "SEMBRADO" activa<br/>Derivaciones + Permisos
            </div>
          </div>

          <div style={card}>
            <div style={sectionLabelStyle}>Secciones activas</div>
            {secciones.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_TITULO[s.id] ?? '#79c0ff', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#e6edf3' }}>{s.titulo}</span>
                <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 'auto' }}>{s.items.length} ítems</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={sectionLabelStyle}>Dimensiones (mm)</div>
            {[
              ['nAnchoDescrip', sello.nAnchoDescrip],
              ['nAnchoCant',    sello.nAnchoCant],
              ['nAltoTit',      sello.nAltoTit],
              ['nAltoDescrip',  sello.nAltoDescrip],
              ['nAltoRen',      sello.nAltoRen],
              ['alturaTotal()', sello.alturaTotal()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
                <span style={{ color: '#8b949e' }}>{k}</span>
                <span style={{ color: '#79c0ff' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btn('#238636')} onClick={cargarEjemplo}>Ejemplo</button>
            <button style={{ ...btn('#21262d'), border: '1px solid #30363d' }} onClick={limpiar}>Limpiar</button>
          </div>
        </div>

        {/* Panel derecho: tabla visual */}
        <div>
          <div style={card}>
            <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>
              Vista del sello — modo: <span style={{ color: sTipo === 'SEMBRADO' ? '#79c0ff' : '#f47067' }}>{sTipo}</span>
              {' '}· {secciones.length} sección{secciones.length !== 1 ? 'es' : ''}
              {' '}· altura total: {sello.alturaTotal()} mm
            </div>
            <div style={{ maxWidth: 520 }}>
              {secciones.map(sec => <TablaSec key={sec.id} sec={sec} />)}
            </div>
          </div>

          {/* Tabla de estructura */}
          <div style={{ ...card, marginTop: 12 }}>
            <div style={sectionLabelStyle}>Estructura de tablas (prvCreaCfgTablas)</div>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Sección</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Tabla título</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Tabla cuerpo</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Filas cuerpo</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Condición</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Zona Urbana',   'tbl_TitZonaUrbana (2 ren)',    'tbl_ZonaUrbana (14 ren)',     '13+1', 'siempre'],
                  ['Zona Suburbana','tbl_TitZonaSubUrbana (2 ren)', 'tbl_ZonaSubUrbana (22 ren)', '21+1', 'siempre'],
                  ['Tramo/Plano',   'tbl_TitTramo (1 ren)',         'tbl_Tramo (12 ren)',           '11+1', 'siempre'],
                  ['Derivaciones',  'tbl_TitDerivaciones (1 ren)',  'tbl_Derivaciones (9 ren)',      '8+1',  'sTipo ≠ SEMBRADO'],
                  ['Permisos',      'tbl_titPermisos (1 ren)',      'tbl_Permisos (16 ren)',        '15+1', 'sTipo ≠ SEMBRADO'],
                ].map(([sec, tit, cuerpo, filas, cond]) => (
                  <tr key={sec} style={{ borderTop: '1px solid #21262d', opacity: (cond === 'sTipo ≠ SEMBRADO' && sTipo === 'SEMBRADO') ? 0.35 : 1 }}>
                    <td style={{ padding: '4px 8px', color: '#e6edf3' }}>{sec}</td>
                    <td style={{ padding: '4px 8px', color: '#f2cc60', fontSize: 10 }}>{tit}</td>
                    <td style={{ padding: '4px 8px', color: '#f2cc60', fontSize: 10 }}>{cuerpo}</td>
                    <td style={{ padding: '4px 8px', color: '#79c0ff' }}>{filas}</td>
                    <td style={{ padding: '4px 8px', color: cond === 'siempre' ? '#56d364' : '#e3b341', fontSize: 10 }}>{cond}</td>
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
