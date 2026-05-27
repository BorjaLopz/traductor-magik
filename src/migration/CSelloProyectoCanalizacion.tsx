// =============================================================================
// MIGRACIÓN: c_sello_proyecto_canalizacion → CSelloProyectoCanalizacion.tsx
// Fuente: adiciones_layout/source/Sellos/c_sello_proyecto_canalizacion.magik
// Herencia Magik: c_base_sello_fibra (no implementada aquí — standalone)
// Sello de página de plano de canalizaciones: 12 sub-tablas, datos de proyecto,
// información de tramo, empresa revisora y referencias (desmontaje/PEPs).
// GIS omitido: swg_dsn_admin_engine, c_tramo_can, c_area_telmex, c_vp_plano_proy_can.
// =============================================================================

import React, { useState, useMemo } from 'react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type TipoEmpresaRevisa = 'TELMEX' | 'ULTIMA_MILLA' | 'ULTIMA_MILLA_N'

export type TipoPlanoCanalizacion = 'canalizacion' | 'microcanalizacion' | 'desmontaje_cd'

export type JobTypeCobre = 'Cobre' | 'Fibra_local'

export interface SelloProyectoCanalizacionAttribs {
  empreviso?: TipoEmpresaRevisa
  poblacion?: string
  municipio?: string
  colonia?: string
  codigo_postal?: string
  calles?: string
  dtos_afectados?: string
  pep?: string
  telefono?: string
  dir_area?: string
  responsable_area?: string
  desmontaje?: string
  principal?: string
  reconcentracion?: string
  secundarios?: string
  ruta?: string
  opb?: string
  oei?: string
  oe?: string
}

export interface ProyectoStub {
  nombre: string
  divisionTelmex: string
  areaTelmex: string
  nombreCentral: string
  cveCentral: string
  supervisor: string
  anioPrograma: string
  programaTipo: string
  fechaEntrega: string
  vb: string
  jobType: JobTypeCobre
  esFALC: boolean
  area: string
}

export interface DatosRegistros {
  division: { division: string; area: string; direccion: string; telefono: string; responsable: string }
  poblacion: { poblacion: string; del_mpo: string; colonia: string; calles: string; central: string; dtos_afectados: string; pep: string }
  proyectista: { anio_prog: string; supervisor: string; fecha_entrega: string; fecha_elab: string }
  referencia: { desmontaje: string; reconcentracion: string; secundarios: string; principal: string }
  num_tramo: string
  tot_tramos: string
  ruta: string
  opb: string
  oei: string
  oe: string
}

// ─── Clase ───────────────────────────────────────────────────────────────────

export class CSelloProyectoCanalizacion {
  static readonly ALLOWED_ON_MENU = false

  // color_linea = {1.0, 0.0, 0.0} en Magik — rojo para celdas de referencia
  readonly colorLinea: [number, number, number] = [1.0, 0.0, 0.0]

  private readonly _attribs: SelloProyectoCanalizacionAttribs
  private readonly _proyecto: ProyectoStub
  private _sTipoPlano: TipoPlanoCanalizacion

  constructor(
    proyecto: ProyectoStub,
    attribs: SelloProyectoCanalizacionAttribs = {},
    tipoPlano: TipoPlanoCanalizacion = 'canalizacion',
  ) {
    this._proyecto = proyecto
    this._attribs  = attribs
    this._sTipoPlano = tipoPlano
  }

  // ── enum_tipo_empresar ────────────────────────────────────────────────────
  enumTipoEmpresaR(): Record<number, TipoEmpresaRevisa> {
    return { 1: 'TELMEX', 2: 'ULTIMA_MILLA', 3: 'ULTIMA_MILLA_N' }
  }

  // ── fecha_elaboracion ─────────────────────────────────────────────────────
  fechaElaboracion(): string {
    const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
    const now = new Date()
    return `${MESES[now.getMonth()]}-${now.getFullYear()}`
  }

  // ── escala (stub) ─────────────────────────────────────────────────────────
  escala(): string {
    return '1:5 000' // stub — en producción lee view_scale del mapa activo
  }

  // ── tipo_de_plano (stub) ──────────────────────────────────────────────────
  tipoDePlano(): TipoPlanoCanalizacion {
    return this._sTipoPlano
  }

  // ── tramos_en_ruta (stub) ─────────────────────────────────────────────────
  tramosEnRuta(): string {
    return '3' // stub — en producción lee o_tramo.ruta.get_tramos().size
  }

  // ── getEmpresaInfo ─────────────────────────────────────────────────────────
  // Combina etiqueta_celdas + llena_datos_celdas (empresa):
  //   1. Si empreviso atributo tiene valor → logo por propiedad
  //   2. Si no → logo por área de proyecto
  getEmpresaInfo(): { simbolo: string; nombre: string } {
    const emp = this._attribs.empreviso
    if (emp) {
      if (emp === 'TELMEX')       return { simbolo: 'logo_telmex_ep',    nombre: 'TELEFONOS DE MEXICO S.A DE C.V.' }
      if (emp === 'ULTIMA_MILLA') return { simbolo: 'logo_ultima_milla', nombre: 'RED NACIONAL ÚLTIMA MILLA, S.A.P.I. DE C.V' }
      if (emp === 'ULTIMA_MILLA_N') return { simbolo: 'logo_ultima_milla_n', nombre: 'RED ÚLTIMA MILLA DEL NOROESTE, S.A.P.I. DE C.V' }
    }
    const area = this._proyecto.area.toUpperCase()
    if (area === 'MEXICALI' || area === 'TIJUANA-ENSENADA') {
      return { simbolo: 'logo_ultima_milla_n', nombre: 'RED ULTIMA MILLA DEL NOROESTE S.A. DE C.V.' }
    }
    return { simbolo: 'logo_telmex_ep', nombre: 'TELEFONOS DE MEXICO S.A. DE C.V.' }
  }

  // ── obten_registros ────────────────────────────────────────────────────────
  obtenRegistros(): DatosRegistros {
    const a = this._attribs
    const p = this._proyecto

    const safe = (v?: string) => (v && v.trim().length > 0 ? v.toUpperCase() : '')
    const safeOr = (v?: string, def = ' ') => (v && v.trim().length > 0 ? v.toUpperCase() : def)

    const coloniaCP = [a.colonia, a.codigo_postal].filter(Boolean).map(s => s!.toUpperCase()).join(' ')

    return {
      division: {
        division:    p.divisionTelmex,
        area:        p.areaTelmex,
        direccion:   safeOr(a.dir_area),
        telefono:    safeOr(a.telefono),
        responsable: safeOr(a.responsable_area),
      },
      poblacion: {
        poblacion:       safeOr(a.poblacion),
        del_mpo:         safeOr(a.municipio),
        colonia:         coloniaCP,
        calles:          safe(a.calles),
        central:         `${p.nombreCentral} - ${p.cveCentral}`,
        dtos_afectados:  safe(a.dtos_afectados),
        pep:             safe(a.pep),
      },
      proyectista: {
        anio_prog:     `${p.programaTipo} - ${p.anioPrograma}`,
        supervisor:    p.supervisor,
        fecha_entrega: p.fechaEntrega,
        fecha_elab:    this.fechaElaboracion(),
      },
      referencia: {
        desmontaje:    safe(a.desmontaje),
        reconcentracion: safe(a.reconcentracion),
        secundarios:   safe(a.secundarios),
        principal:     safe(a.principal),
      },
      num_tramo: '1',
      tot_tramos: this.tramosEnRuta(),
      ruta:  safe(a.ruta),
      opb:   safe(a.opb),
      oei:   safe(a.oei),
      oe:    safe(a.oe),
    }
  }

  // ── asigna_celdas_a_colorear ───────────────────────────────────────────────
  // Filas 1, 3, 5 de tbl_Operacion (columna 2) reciben color de línea.
  celdasAColorear(): Array<{ tabla: string; ren: number; col: number; color: string }> {
    const [r, g, b] = this.colorLinea
    const css = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`
    return [
      { tabla: 'tbl_Operacion', ren: 1, col: 2, color: css },
      { tabla: 'tbl_Operacion', ren: 1, col: 4, color: css },
      { tabla: 'tbl_Operacion', ren: 1, col: 6, color: css },
    ]
  }

  // ── getTituloProyecto ──────────────────────────────────────────────────────
  getTituloProyecto(): string {
    return this._sTipoPlano === 'microcanalizacion'
      ? 'PROYECTO DE MICROCANALIZACION'
      : 'PROYECTO DE CANALIZACION'
  }

  // ── getEscalaLabel ─────────────────────────────────────────────────────────
  getEscalaLabel(): string {
    return this._proyecto.esFALC ? 'TRAYECT' : 'RUTA'
  }

  // ── getPoblacionLabel5 ─────────────────────────────────────────────────────
  // Fila 5 de tbl_poblacion: NCO (proyectos FALC) o CENTRAL (resto)
  getPoblacionLabel5(): string {
    return this._proyecto.esFALC ? 'NCO' : 'CENTRAL'
  }

  // ── serialSlots ───────────────────────────────────────────────────────────
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['o_tramo', 'o_proyecto', 'o_area', 's_tipo_plano', 'col_tablas'],
      values: [null,       this._proyecto, null,  this._sTipoPlano, {}],
    }
  }
}

// ─── Helpers para la UI ───────────────────────────────────────────────────────

const PROYECTO_DEFAULT: ProyectoStub = {
  nombre: 'PRY-2024-CDMX-001',
  divisionTelmex: 'CENTRO',
  areaTelmex: 'CDMX',
  nombreCentral: 'CENTRO',
  cveCentral: 'CEN-01',
  supervisor: 'INGENIERÍA CIVIL',
  anioPrograma: '2024',
  programaTipo: 'INVERSION',
  fechaEntrega: '2024-12-31',
  vb: 'ING. MARTINEZ',
  jobType: 'Cobre',
  esFALC: false,
  area: 'CDMX',
}

const ATTRIBS_DEFAULT: SelloProyectoCanalizacionAttribs = {
  empreviso: 'TELMEX',
  poblacion: 'Ciudad de México',
  municipio: 'Cuauhtémoc',
  colonia: 'Centro',
  codigo_postal: '06000',
  calles: 'Av. Juárez / Eje Central',
  dtos_afectados: 'DTR-01, DTR-02',
  pep: 'E-0001.8.2.0.0002',
  telefono: '55-1234-5678',
  dir_area: 'COORDINACION DE INFRAESTRUCTURA',
  responsable_area: 'ING. LOPEZ HERNANDEZ',
  desmontaje: 'PEP-DES-001',
  principal: 'PEP-PRI-002',
  reconcentracion: 'PEP-REC-003',
  secundarios: 'PEP-SEC-004',
  ruta: 'RUTA-CDM-01',
  opb: 'OPB-0042',
  oei: 'OEI-0123',
  oe: 'OE-0007',
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = {
  root: { fontFamily: 'monospace', background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: 20 } as React.CSSProperties,
  h1:   { fontSize: 18, fontWeight: 700, color: '#79c0ff', marginBottom: 4 } as React.CSSProperties,
  sub:  { fontSize: 12, color: '#8b949e', marginBottom: 20 } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 } as React.CSSProperties,
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 14 } as React.CSSProperties,
  section: { marginBottom: 14 } as React.CSSProperties,
  sectionTitle: { fontSize: 10, color: '#8b949e', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 6 },
  row: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 } as React.CSSProperties,
  label: { fontSize: 11, color: '#8b949e', minWidth: 120 } as React.CSSProperties,
  input: { flex: 1, background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', padding: '3px 7px', fontSize: 11 } as React.CSSProperties,
  select: { flex: 1, background: '#21262d', border: '1px solid #30363d', borderRadius: 4, color: '#e6edf3', padding: '3px 7px', fontSize: 11 } as React.CSSProperties,
  checkbox: { marginRight: 4 } as React.CSSProperties,
  sello: { background: '#fff', color: '#000', fontSize: 9, border: '2px solid #000', display: 'inline-block', userSelect: 'none' as const } as React.CSSProperties,
  tblRow: { display: 'flex', borderBottom: '1px solid #555' } as React.CSSProperties,
  tblCell: (w: number, h: number, highlight?: boolean) => ({
    width: w, minHeight: h, borderRight: '1px solid #555',
    padding: '1px 3px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center',
    fontSize: 8, lineHeight: 1.2, background: highlight ? '#ffe0e0' : 'transparent',
  }),
  cellLabel: { color: '#888', fontSize: 7, textTransform: 'uppercase' as const },
  cellValue: { color: '#000', fontWeight: 600 as const, wordBreak: 'break-word' as const },
  logoBox: (color: string) => ({ background: color, width: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#fff', fontWeight: 700, textAlign: 'center' as const, padding: 2 }),
} as const

// ─── Componente sello visual ──────────────────────────────────────────────────
// Escala: ~1.6px por unidad de layout. Marco = 210×265 u. → 336×424px aprox.

function SelloVisual({ sello, datos }: { sello: CSelloProyectoCanalizacion; datos: DatosRegistros }) {
  const empresa = sello.getEmpresaInfo()
  const tituloProyecto = sello.getTituloProyecto()
  const escalaLabel = sello.getEscalaLabel()
  const labelCentral = sello.getPoblacionLabel5()

  const TOTAL_W = 338 // 210 u × 1.61
  const bordado = '1px solid #000'

  const LogoBox = ({ simbolo }: { simbolo: string }) => {
    const color = simbolo.includes('ultima_milla_n') ? '#1a237e' : simbolo.includes('ultima_milla') ? '#0d47a1' : '#b71c1c'
    const label = simbolo.includes('ultima_milla_n') ? 'UM\nNOROESTE' : simbolo.includes('ultima_milla') ? 'ÙLTIMA\nMILLA' : 'TELMEX'
    return <div style={{ ...S.logoBox(color), width: 42, minHeight: 26 }}>{label.split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>
  }

  const Td = ({ w, bold, grey, red, children }: { w: number; bold?: boolean; grey?: boolean; red?: boolean; children?: React.ReactNode }) => (
    <div style={{ ...S.tblCell(w, 0), background: red ? '#ffe0e0' : grey ? '#f0f0f0' : 'transparent', fontWeight: bold ? 700 : 400, borderRight: bordado, flexShrink: 0 }}>
      {children}
    </div>
  )

  const Row = ({ h, children }: { h: number; children: React.ReactNode }) => (
    <div style={{ display: 'flex', minHeight: h, borderBottom: bordado }}>{children}</div>
  )

  const LabelRow = ({ label, value, w1, w2 }: { label: string; value: string; w1: number; w2: number }) => (
    <Row h={13}>
      <Td w={w1} grey><span style={S.cellLabel}>{label}</span></Td>
      <Td w={w2}><span style={S.cellValue}>{value}</span></Td>
    </Row>
  )

  return (
    <div style={{ ...S.sello, width: TOTAL_W, border: '2px solid #000' }}>

      {/* tbl_Empresa: logo + nombre empresa */}
      <Row h={28}>
        <Td w={42}><LogoBox simbolo={empresa.simbolo} /></Td>
        <Td w={TOTAL_W - 44} bold><div style={{ fontSize: 10, fontWeight: 700, padding: 4 }}>{empresa.nombre}</div></Td>
      </Row>

      {/* tbl_division: 5 filas con etiqueta + valor */}
      {[
        ['DIR. DIVISIONAL', datos.division.division, 64, TOTAL_W - 66],
        ['ÁREA',            datos.division.area,      64, TOTAL_W - 66],
        ['DIRECCION',       datos.division.direccion, 64, TOTAL_W - 66],
        ['TELEFONO',        datos.division.telefono,  64, TOTAL_W - 66],
        ['RESPONSABLE',     datos.division.responsable, 64, TOTAL_W - 66],
      ].map(([lbl, val, w1, w2]) => (
        <LabelRow key={lbl as string} label={lbl as string} value={val as string} w1={w1 as number} w2={w2 as number} />
      ))}

      {/* tbl_Proyecto: título tipo plano */}
      <Row h={16}>
        <Td w={TOTAL_W - 2} bold><div style={{ textAlign: 'center', fontWeight: 700, fontSize: 9 }}>{tituloProyecto}</div></Td>
      </Row>

      {/* tbl_poblacion: 7 filas */}
      {[
        ['POBLACION',       datos.poblacion.poblacion],
        ['DELEGACION O MPO.', datos.poblacion.del_mpo],
        ['COLONIA Y C.P.', datos.poblacion.colonia],
        ['CALLES',          datos.poblacion.calles],
        [labelCentral,      datos.poblacion.central],
        ['DTOS. AFECT.',    datos.poblacion.dtos_afectados],
        ['PEP',             datos.poblacion.pep],
      ].map(([lbl, val]) => (
        <LabelRow key={lbl as string} label={lbl as string} value={val as string} w1={64} w2={TOTAL_W - 66} />
      ))}

      {/* tbl_PlanoNum (3 cols) + tbl_EscalaRuta (4 cols) en una sola fila */}
      <Row h={16}>
        <Td w={46} grey><span style={S.cellLabel}>PLANO No.</span></Td>
        <Td w={30}><span style={S.cellValue}>{datos.num_tramo}</span></Td>
        <Td w={20} grey><span style={S.cellLabel}>DE</span></Td>
        <Td w={30}><span style={S.cellValue}>{datos.tot_tramos}</span></Td>
        <Td w={30} grey><span style={S.cellLabel}>ESCALA</span></Td>
        <Td w={40}><span style={S.cellValue}>{sello.escala()}</span></Td>
        <Td w={30} grey><span style={S.cellLabel}>{escalaLabel}</span></Td>
        <Td w={TOTAL_W - 228}><span style={S.cellValue}>{datos.ruta}</span></Td>
      </Row>

      {/* tbl_proyectista (4 filas, mitad izq) + tbl_referencia (4 filas, mitad der) */}
      {[
        { etiq: 'PROYECTO',      val: datos.proyectista.anio_prog, ref_etiq: 'DESMONTAJE',     ref_val: datos.referencia.desmontaje },
        { etiq: 'SUPERVISO',     val: datos.proyectista.supervisor, ref_etiq: 'RECONCENTRACION', ref_val: datos.referencia.reconcentracion },
        { etiq: 'FECHA',         val: datos.proyectista.fecha_elab, ref_etiq: 'SECUNDARIOS',    ref_val: datos.referencia.secundarios },
        { etiq: 'PROGRAMA',      val: datos.proyectista.fecha_entrega, ref_etiq: 'PRINCIPALES', ref_val: datos.referencia.principal },
      ].map((r, i) => (
        <Row key={i} h={13}>
          <Td w={46} grey><span style={S.cellLabel}>{r.etiq}</span></Td>
          <Td w={110}><span style={S.cellValue}>{r.val}</span></Td>
          {i === 0 && <Td w={TOTAL_W - 160} grey><div style={{ textAlign: 'center', fontWeight: 700, fontSize: 8, color: '#c00' }}>REFERENCIAS</div></Td>}
          {i > 0 && <>
            <Td w={58} grey><span style={S.cellLabel}>{r.ref_etiq}</span></Td>
            <Td w={TOTAL_W - 216} red><span style={{ ...S.cellValue, color: '#c00' }}>{r.ref_val}</span></Td>
          </>}
        </Row>
      ))}

      {/* tbl_Aprobo + tbl_Operacion */}
      <Row h={16}>
        <Td w={40} grey><span style={S.cellLabel}>APROBO</span></Td>
        <Td w={92}><span style={S.cellValue}>{datos.proyectista.supervisor}</span></Td>
        <Td w={46} grey><span style={S.cellLabel}>OPERACION</span></Td>
        <Td w={25}><span style={{ ...S.cellValue, color: '#c00' }}>{datos.opb}</span></Td>
        <Td w={20} grey><span style={S.cellLabel}>OEI</span></Td>
        <Td w={25}><span style={{ ...S.cellValue, color: '#c00' }}>{datos.oei}</span></Td>
        <Td w={16} grey><span style={S.cellLabel}>OE</span></Td>
        <Td w={TOTAL_W - 266}><span style={{ ...S.cellValue, color: '#c00' }}>{datos.oe}</span></Td>
      </Row>

      {/* tbl_simbologia + tbl_const_can */}
      <Row h={50}>
        <div style={{ width: 98, borderRight: bordado, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#555', flexShrink: 0 }}>
          [simbolos_canalizacion]
        </div>
        <div style={{ flex: 1, padding: 3, fontSize: 7, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [c_construccion_canalizacion — tabla de especificaciones de ductos]
        </div>
      </Row>

    </div>
  )
}

// ─── Componente UI principal ───────────────────────────────────────────────────

export function CSelloProyectoCanalizacionUI() {
  const [attribs, setAttribs] = useState<SelloProyectoCanalizacionAttribs>(ATTRIBS_DEFAULT)
  const [proyecto, setProyecto] = useState<ProyectoStub>(PROYECTO_DEFAULT)
  const [tipoPlano, setTipoPlano] = useState<TipoPlanoCanalizacion>('canalizacion')

  const sello = useMemo(
    () => new CSelloProyectoCanalizacion(proyecto, attribs, tipoPlano),
    [attribs, proyecto, tipoPlano]
  )
  const datos = useMemo(() => sello.obtenRegistros(), [sello])

  const setA = (k: keyof SelloProyectoCanalizacionAttribs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAttribs(prev => ({ ...prev, [k]: e.target.value || undefined }))
  const setP = (k: keyof ProyectoStub) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v: unknown = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setProyecto(prev => ({ ...prev, [k]: v }))
  }

  const Field = ({ label, k }: { label: string; k: keyof SelloProyectoCanalizacionAttribs }) => (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <input style={S.input} value={attribs[k] ?? ''} onChange={setA(k)} />
    </div>
  )

  return (
    <div style={S.root}>
      <div style={S.h1}>CSelloProyectoCanalizacion</div>
      <div style={S.sub}>
        Sello de plano de canalizaciones · 12 sub-tablas · empresa/proyecto/tramo/referencias
      </div>

      <div style={S.grid}>
        {/* Panel izquierdo: formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div style={S.card}>
            <div style={S.sectionTitle}>Tipo de plano</div>
            <select style={{ ...S.select, width: '100%' }} value={tipoPlano} onChange={e => setTipoPlano(e.target.value as TipoPlanoCanalizacion)}>
              <option value="canalizacion">canalizacion</option>
              <option value="microcanalizacion">microcanalizacion</option>
              <option value="desmontaje_cd">desmontaje_cd</option>
            </select>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Atributo: Empresa</div>
            <div style={S.row}>
              <span style={S.label}>empreviso</span>
              <select style={S.select} value={attribs.empreviso ?? ''} onChange={setA('empreviso')}>
                <option value="">— (por proyecto)</option>
                <option value="TELMEX">TELMEX</option>
                <option value="ULTIMA_MILLA">ULTIMA_MILLA</option>
                <option value="ULTIMA_MILLA_N">ULTIMA_MILLA_N</option>
              </select>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Atributos: Localización</div>
            {([
              ['Población',     'poblacion'],
              ['Municipio',     'municipio'],
              ['Colonia',       'colonia'],
              ['Código Postal', 'codigo_postal'],
              ['Calles',        'calles'],
              ['Dtos. Afect.',  'dtos_afectados'],
              ['PEP',           'pep'],
            ] as [string, keyof SelloProyectoCanalizacionAttribs][]).map(([l, k]) => (
              <Field key={k} label={l} k={k} />
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Atributos: División</div>
            {([
              ['Teléfono',        'telefono'],
              ['Dir. Área',       'dir_area'],
              ['Responsable',     'responsable_area'],
            ] as [string, keyof SelloProyectoCanalizacionAttribs][]).map(([l, k]) => (
              <Field key={k} label={l} k={k} />
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Atributos: Referencias</div>
            {([
              ['Desmontaje',     'desmontaje'],
              ['Principal',      'principal'],
              ['Reconcentración','reconcentracion'],
              ['Secundarios',    'secundarios'],
            ] as [string, keyof SelloProyectoCanalizacionAttribs][]).map(([l, k]) => (
              <Field key={k} label={l} k={k} />
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Atributos: Operación</div>
            {([
              ['Ruta',  'ruta'],
              ['OPB',   'opb'],
              ['OEI',   'oei'],
              ['OE',    'oe'],
            ] as [string, keyof SelloProyectoCanalizacionAttribs][]).map(([l, k]) => (
              <Field key={k} label={l} k={k} />
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Proyecto (stub GIS)</div>
            {([
              ['División',    'divisionTelmex'],
              ['Área',        'areaTelmex'],
              ['Central',     'nombreCentral'],
              ['Cve. Central','cveCentral'],
              ['Supervisor',  'supervisor'],
              ['Año programa','anioPrograma'],
            ] as [string, keyof ProyectoStub][]).map(([l, k]) => (
              <div key={k} style={S.row}>
                <span style={S.label}>{l}</span>
                <input style={S.input} value={String(proyecto[k])} onChange={setP(k)} />
              </div>
            ))}
            <div style={S.row}>
              <span style={S.label}>Job type</span>
              <select style={S.select} value={proyecto.jobType} onChange={setP('jobType')}>
                <option value="Cobre">Cobre</option>
                <option value="Fibra_local">Fibra_local</option>
              </select>
            </div>
            <div style={S.row}>
              <span style={S.label}>¿Es proyecto FALC?</span>
              <input type="checkbox" style={S.checkbox} checked={proyecto.esFALC}
                onChange={e => setProyecto(prev => ({ ...prev, esFALC: e.target.checked }))} />
            </div>
          </div>
        </div>

        {/* Panel derecho: sello visual */}
        <div>
          <div style={S.card}>
            <div style={S.sectionTitle}>
              Vista del sello — escala aproximada (~1.6px/unidad layout)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <SelloVisual sello={sello} datos={datos} />
            </div>
          </div>

          {/* Tabla de sub-tablas del configura_tabla */}
          <div style={{ ...S.card, marginTop: 12 }}>
            <div style={S.sectionTitle}>Sub-tablas de configura_tabla()</div>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ color: '#8b949e', borderBottom: '1px solid #30363d' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Dimensiones</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 400 }}>Etiquetas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['tbl_MarcoSello',    'crea_tabla 1×1',         '265h × 210w',          'marco general'],
                  ['tbl_Empresa',       'crea_tabla 1×2',         '30h, cols 25+150',     'logo + nombre'],
                  ['tbl_division',      'c_tbl_Linea_Horizontal', '5 filas, 25h, w=120',  'DIR.DIV, ÁREA, DIR, TEL, RESP'],
                  ['tbl_Proyecto',      'crea_tabla 1×1',         '10h × 175w',           'título tipo plano'],
                  ['tbl_poblacion',     'c_tbl_Linea_Horizontal', '7 filas, 40h, w=120',  'POB, MPO, COL+CP, CALLES, CTL, DTOS, PEP'],
                  ['tbl_PlanoNum',      'crea_tabla 1×3',         '10h, cols 30+33.5+33.5','PLANO No., DE, hoja'],
                  ['tbl_EscalaRuta',    'crea_tabla 1×4',         '10h, cols 20+35+20+20','ESCALA, valor, RUTA/TRAYECT, valor'],
                  ['tbl_proyectista',   'c_tbl_Linea_Horizontal', '4 filas, 25h, w=97',   'PROYECTO, SUPERVISO, FECHA, PROGRAMA'],
                  ['tbl_referencia',    'c_tbl_Linea_Horizontal', '4 filas, 19h, w=95',   'DESMONTAJE, RECON, SECUNDARIOS, PRINCIPALES (celdas rojas)'],
                  ['tbl_Aprobo',        'crea_tabla 1×2',         '10h, cols 25+72',       'APROBO, valor'],
                  ['tbl_Operacion',     'crea_tabla 1×6',         '10h, cols 35+10+15+10+15+10','OPERACION, OPB, OEI, OE (cols 2,4,6 coloreadas)'],
                  ['tbl_simbologia',    'crea_tabla 1×1',         '85h × 60w',             'simbolos_canalizacion'],
                  ['tbl_const_can',     'c_construccion_canalizacion','85h × restante',   'especificaciones de ductos'],
                ].map(([nom, tipo, dim, etiq]) => (
                  <tr key={nom} style={{ borderTop: '1px solid #21262d' }}>
                    <td style={{ padding: '4px 8px', color: '#79c0ff' }}>{nom}</td>
                    <td style={{ padding: '4px 8px', color: '#f2cc60' }}>{tipo}</td>
                    <td style={{ padding: '4px 8px', color: '#8b949e' }}>{dim}</td>
                    <td style={{ padding: '4px 8px', color: '#e6edf3', fontSize: 10 }}>{etiq}</td>
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
