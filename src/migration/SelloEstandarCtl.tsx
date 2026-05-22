/**
 * Migración: c_sello_estandar_ctl.magik
 * Sigma Tao — dsanchez / Alejandro Díaz — 01-Enero-2005
 * Clase Magik: c_sello_estandar_ctl — extiende c_sello_estandar_base
 *
 * Sello estándar para planos de Centrales Telefónicas (CTL).
 * Añade dos tablas a la derecha de las tablas base del sello estándar:
 *   tbl_CeldaA (70mm × 15mm, 2 filas): Población + Nombre de central
 *   tbl_CeldaB (45mm × 15mm, 1 fila):  Siglas/clave de central
 *
 * Métodos migrados:
 *   defined_attributes()                     → DEFINED_ATTRIBUTES (constante estática)
 *   draw_content_on(window)                  → drawContentOn()
 *   prvCrea_Cfg_Tablas(RoCoord)              → crearCfgTablas(origen)
 *   prvCrea_Cfg_Tbl_NomPob_NomCtl_CveCtl    → crearCfgTblNomPobNomCtlCveCtl(origen)
 *   prvLlena_Celdas()                        → llenarCeldas()
 *   prvLlena_Tbl_NomPob_NomCtl_CveCtl()     → llenarTblNomPobNomCtlCveCtl()
 *   Poblacion_tbl getter/setter              → poblacionTbl getter/setter
 *   Nombre_central_tbl getter/setter         → nombreCentralTbl getter/setter
 *   Siglas_central_tbl getter/setter         → siglasCentralTbl getter/setter
 *   lee_datos_BdeD()                         → async leeDatosBdeD(service, id)
 *
 * Equivalencias clave:
 *   c_sello_estandar_base              → SelloEstandarBase (stub)
 *   oTablas.crea_tabla(f,c,:id)        → tablas.set(id, TablaCtl)
 *   oTablas.Longitud_total_Columnas    → suma de anchos de tablas previas
 *   oCeldas.Celda(f,c).oElemento.sTexto → celdas.get('f-c')
 *   c_texto_grafico.new("POBLACION")   → CeldaCtl { texto: 'POBLACION', tamanio: 35 }
 *   bDibuja_Columnas_Internas? = _false → sin bordes internos de columna
 *   bDibuja_Renglones_Internos? = _false → sin bordes internos de fila
 *   oProyecto.existe? → proyecto !== null
 *   oProyecto.localidad / central / cve_central → ProyectoGis interface + mock
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Configuración de una tabla en el sello */
export interface TablaCtl {
  id          : string;
  colWidths   : number[];   // mm — array de anchos de columna
  rowHeights  : number[];   // mm — array de altos de fila
  origen      : { x: number; y: number };
  lineasInternas: boolean;  // Magik: bDibuja_Columnas/Renglones_Internos?
}

/** Celda con texto gráfico — Magik: c_texto_grafico */
export interface CeldaCtl {
  texto  : string;
  tamanio: number;          // Magik: c_texto_grafico.nTamanio
}

/** Magik: oProyecto — objeto de proyecto con datos de la central */
export interface ProyectoGis {
  existe    : boolean;      // Magik: oProyecto.existe?
  localidad : string;       // Magik: oProyecto.localidad
  central   : string;       // Magik: oProyecto.central
  cveCentral: string;       // Magik: oProyecto.cve_central
}

/** Servicio de acceso a proyectos — reemplaza oProyecto de Smallworld */
export interface IProyectoService {
  fetchProyecto(id: string): Promise<ProyectoGis | null>;
}

type CellKey = `${number}-${number}`;

// =============================================================================
// ATRIBUTOS DEFINIDOS — defined_attributes()
// =============================================================================

export const DEFINED_ATTRIBUTES_CTL = [
  {
    nombre    : 'Localidad',
    tipo      : 'string',
    descripcion: 'Población',
    default   : '',
    enPropiedades: true,   // Magik: :allowed_on_properties_page?, _true
  },
  {
    nombre    : 'Nombre_Central',
    tipo      : 'string',
    descripcion: 'Nombre de la central',
    default   : '',
    enPropiedades: true,
  },
  {
    nombre    : 'Siglas_Central',
    tipo      : 'string',
    descripcion: 'Siglas de la central',
    default   : '',
    enPropiedades: true,
  },
];

// =============================================================================
// DIMENSIONES DE LAS TABLAS CTL (en mm)
// =============================================================================

// tbl_CeldaA: 2 renglones × 1 columna
const CELDA_A_ROW_HEIGHTS = [7, 8];   // mm — LoTblA.oRenglones.elemento(1/2).nLongitud
const CELDA_A_COL_WIDTHS  = [70];     // mm — LoTblA.oColumnas.elemento(1).nLongitud

// tbl_CeldaB: 1 renglón × 1 columna
const CELDA_B_ROW_HEIGHTS = [15];     // mm — LoTblB.oRenglones.elemento(1).nLongitud
const CELDA_B_COL_WIDTHS  = [45];     // mm — LoTblB.oColumnas.elemento(1).nLongitud

// =============================================================================
// STUB — c_sello_estandar_base (tablas base del sello estándar)
// En producción: tbl_compania, tbl_FecDibRev, tbl_Escala con su contenido real.
// Aquí se modelan como stubs con dimensiones representativas.
// =============================================================================

const BASE_STUBS = [
  { id: 'tbl_compania',  colW: 40, rowH: [10, 5],     label: 'COMPAÑÍA'       },
  { id: 'tbl_FecDibRev', colW: 50, rowH: [5, 5, 5],   label: 'FECHA / REV.'  },
  { id: 'tbl_Escala',    colW: 30, rowH: [7, 8],       label: 'ESCALA'        },
];

// Ancho total de las tablas base — Magik: Longitud_total_Columnas({:tbl_compania,...})
const BASE_TOTAL_WIDTH = BASE_STUBS.reduce((acc, t) => acc + t.colW, 0); // 120mm

// =============================================================================
// MOCK DB — oProyecto (varios proyectos de ejemplo)
// =============================================================================

const MOCK_PROYECTOS: Record<string, ProyectoGis> = {
  GDL: { existe: true, localidad: 'GUADALAJARA',       central: 'CENTRAL NORTE',  cveCentral: 'GDL-N' },
  MTY: { existe: true, localidad: 'MONTERREY',          central: 'CENTRAL SUR',    cveCentral: 'MTY-S' },
  MEX: { existe: true, localidad: 'CIUDAD DE MÉXICO',   central: 'CENTRAL CENTRO', cveCentral: 'MEX-C' },
  TIJ: { existe: true, localidad: 'TIJUANA',            central: 'CENTRAL OESTE',  cveCentral: 'TIJ-O' },
};

export const mockProyectoService: IProyectoService = {
  fetchProyecto: async (id) => {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_PROYECTOS[id.toUpperCase()] ?? null;
  },
};

// =============================================================================
// CLASE BASE STUB — c_sello_estandar_base
// =============================================================================

export class SelloEstandarBase {

  // Magik: oTablas — gestor de tablas del sello
  protected tablas: Map<string, TablaCtl> = new Map();
  // Magik: oCeldas.Celda(f,c).oElemento.sTexto — contenido de cada celda
  protected celdas: Map<string, Map<CellKey, CeldaCtl>> = new Map();

  // Magik: _super.prvCrea_Cfg_Tablas(RoCoord) — crea tablas base
  protected superCrearCfgTablas(origen: { x: number; y: number }): void {
    let xOffset = origen.x;
    for (const stub of BASE_STUBS) {
      const maxRowH = Math.max(...stub.rowH);
      this.tablas.set(stub.id, {
        id: stub.id, colWidths: [stub.colW],
        rowHeights: stub.rowH, origen: { x: xOffset, y: origen.y },
        lineasInternas: true,
      });
      xOffset += stub.colW;
    }
  }

  // Magik: _super.prvLlena_celdas() — llena celdas base con contenido por defecto
  protected superLlenarCeldas(): void {
    for (const stub of BASE_STUBS) {
      if (!this.celdas.has(stub.id)) this.celdas.set(stub.id, new Map());
      const map = this.celdas.get(stub.id)!;
      stub.rowH.forEach((_, ri) => {
        const key = `${ri + 1}-1` as CellKey;
        map.set(key, { texto: ri === 0 ? stub.label : '', tamanio: 30 });
      });
    }
  }

  // Magik: oTablas.Longitud_total_Columnas({:id,...}) → suma de anchos de columna
  protected longitudTotalColumnas(ids: string[]): number {
    return ids.reduce((acc, id) => {
      const tbl = this.tablas.get(id);
      return acc + (tbl ? tbl.colWidths.reduce((a, b) => a + b, 0) : 0);
    }, 0);
  }

  // Acceso a celda: oTablas.elemento(:id).oCeldas.Celda(f,c).oElemento.sTexto
  protected getCelda(tablaId: string, fila: number, col: number): CeldaCtl | undefined {
    return this.celdas.get(tablaId)?.get(`${fila}-${col}` as CellKey);
  }

  protected setCeldaTexto(tablaId: string, fila: number, col: number, texto: string): void {
    if (!this.celdas.has(tablaId)) this.celdas.set(tablaId, new Map());
    const existing = this.celdas.get(tablaId)!.get(`${fila}-${col}` as CellKey);
    this.celdas.get(tablaId)!.set(`${fila}-${col}` as CellKey, {
      texto, tamanio: existing?.tamanio ?? 30,
    });
  }

  protected superDrawContentOn(): void { /* renderizado base — delegado a SVG */ }
  protected superLeeDatosBdeD(): void  { /* carga de datos base — delegado */ }
}

// =============================================================================
// CLASE PRINCIPAL — c_sello_estandar_ctl
// =============================================================================

export class SelloEstandarCtl extends SelloEstandarBase {

  // Magik: define_shared_constant(:allowed_on_menu?,_false,:public)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: atributos de layout (defined_attributes)
  localidad    : string = '';   // :Localidad
  nombreCentral: string = '';   // :Nombre_Central
  siglasCentral: string = '';   // :Siglas_Central

  // ---------------------------------------------------------------------------
  // prvCrea_Cfg_Tablas(RoCoord)
  //
  // Magik:
  //   _super.prvCrea_Cfg_Tablas(RoCoord)          → crea tablas base
  //   LnLong << Longitud_total_Columnas({:tbl_compania, :tbl_FecDibRev, :tbl_Escala})
  //   LoCoord << coordinate.new(RoCoord.x + LnLong, RoCoord.y)
  //   _self.prvCrea_Cfg_Tbl_NomPob_NomCtl_CveCtl(LoCoord)
  // ---------------------------------------------------------------------------
  crearCfgTablas(origen = { x: 0, y: 0 }): void {
    this.superCrearCfgTablas(origen);

    // Calcular offset X para posicionar las tablas CTL
    const offset = this.longitudTotalColumnas(['tbl_compania', 'tbl_FecDibRev', 'tbl_Escala']);
    const coordCtl = { x: origen.x + offset, y: origen.y };

    this.crearCfgTblNomPobNomCtlCveCtl(coordCtl);
  }

  // ---------------------------------------------------------------------------
  // prvCrea_Cfg_Tbl_NomPob_NomCtl_CveCtl(RoCoord)
  //
  // tbl_CeldaA: 2 renglones × 1 col, sin líneas internas
  //   Renglón 1: 7mm  → Población
  //   Renglón 2: 8mm  → Nombre central
  //   Columna 1: 70mm
  //
  // tbl_CeldaB: 1 renglón × 1 col, sin líneas internas
  //   Renglón 1: 15mm → Siglas central
  //   Columna 1: 45mm
  //   Origen: (RoCoord.x + ancho_CeldaA, RoCoord.y)
  // ---------------------------------------------------------------------------
  crearCfgTblNomPobNomCtlCveCtl(coord: { x: number; y: number }): void {
    // tbl_CeldaA
    this.tablas.set('tbl_CeldaA', {
      id          : 'tbl_CeldaA',
      colWidths   : [...CELDA_A_COL_WIDTHS],  // [70]
      rowHeights  : [...CELDA_A_ROW_HEIGHTS], // [7, 8]
      origen      : { ...coord },
      lineasInternas: false,  // Magik: bDibuja_Columnas_Internas? = _false
    });

    // tbl_CeldaB — desplazada al lado de tbl_CeldaA
    const celdaAWidth = this.longitudTotalColumnas(['tbl_CeldaA']);  // 70mm
    this.tablas.set('tbl_CeldaB', {
      id          : 'tbl_CeldaB',
      colWidths   : [...CELDA_B_COL_WIDTHS],  // [45]
      rowHeights  : [...CELDA_B_ROW_HEIGHTS], // [15]
      origen      : { x: coord.x + celdaAWidth, y: coord.y },
      lineasInternas: false,
    });
  }

  // ---------------------------------------------------------------------------
  // prvLlena_Celdas() → prvLlena_Tbl_NomPob_NomCtl_CveCtl()
  //
  // Magik:
  //   _super.prvLlena_celdas()
  //   LoPob    << c_texto_grafico.new("POBLACION"); LoPob.nTamanio << 35
  //   LoNomCtl << c_texto_grafico.new("CENTRAL");   LoNomCtl.nTamanio << 35
  //   LoCveCtl << c_texto_grafico.new("Cve Ctl");   LoCveCtl.nTamanio << 35
  //   tbl_CeldaA, Celda(1,1) = LoPob
  //   tbl_CeldaA, Celda(2,1) = LoNomCtl
  //   tbl_CeldaB, Celda(1,1) = LoCveCtl
  // ---------------------------------------------------------------------------
  llenarCeldas(): void {
    this.superLlenarCeldas();
    this.llenarTblNomPobNomCtlCveCtl();
  }

  private llenarTblNomPobNomCtlCveCtl(): void {
    // Magik: c_texto_grafico.new("POBLACION") — texto por defecto/placeholder
    if (!this.celdas.has('tbl_CeldaA')) this.celdas.set('tbl_CeldaA', new Map());
    if (!this.celdas.has('tbl_CeldaB')) this.celdas.set('tbl_CeldaB', new Map());

    this.celdas.get('tbl_CeldaA')!.set('1-1', { texto: 'POBLACION', tamanio: 35 });
    this.celdas.get('tbl_CeldaA')!.set('2-1', { texto: 'CENTRAL',   tamanio: 35 });
    this.celdas.get('tbl_CeldaB')!.set('1-1', { texto: 'Cve Ctl',   tamanio: 35 });
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(window)
  //
  // Magik:
  //   _self.poblacion_tbl       <<  _self.localidad
  //   _self.Nombre_central_tbl  <<  _self.nombre_central
  //   _self.siglas_central_tbl  <<  _self.siglas_central
  //   _super.draw_content_on(window)
  // ---------------------------------------------------------------------------
  drawContentOn(): void {
    // Reemplaza los textos placeholder con los atributos actuales
    this.poblacionTbl     = this.localidad      || 'POBLACION';
    this.nombreCentralTbl = this.nombreCentral  || 'CENTRAL';
    this.siglasCentralTbl = this.siglasCentral  || 'Cve Ctl';
    this.superDrawContentOn();
  }

  // ---------------------------------------------------------------------------
  // Poblacion_tbl getter/setter
  // Magik: oTablas.elemento(:tbl_CeldaA).oCeldas.Celda(1,1).oElemento.sTexto
  // ---------------------------------------------------------------------------
  get poblacionTbl(): string {
    return this.getCelda('tbl_CeldaA', 1, 1)?.texto ?? '';
  }
  set poblacionTbl(valor: string) {
    this.setCeldaTexto('tbl_CeldaA', 1, 1, valor);
  }

  // ---------------------------------------------------------------------------
  // Nombre_central_tbl getter/setter → Celda(2,1)
  // ---------------------------------------------------------------------------
  get nombreCentralTbl(): string {
    return this.getCelda('tbl_CeldaA', 2, 1)?.texto ?? '';
  }
  set nombreCentralTbl(valor: string) {
    this.setCeldaTexto('tbl_CeldaA', 2, 1, valor);
  }

  // ---------------------------------------------------------------------------
  // Siglas_central_tbl getter/setter → tbl_CeldaB, Celda(1,1)
  // ---------------------------------------------------------------------------
  get siglasCentralTbl(): string {
    return this.getCelda('tbl_CeldaB', 1, 1)?.texto ?? '';
  }
  set siglasCentralTbl(valor: string) {
    this.setCeldaTexto('tbl_CeldaB', 1, 1, valor);
  }

  // ---------------------------------------------------------------------------
  // lee_datos_BdeD() — async (Magik: síncrono, accede a oProyecto de Smallworld)
  //
  // Magik:
  //   _super.lee_datos_BdeD()
  //   _if _self.oProyecto.existe?
  //   _then
  //     _self.localidad      << _self.oProyecto.localidad
  //     _self.nombre_central << _self.oProyecto.central
  //     _self.siglas_central << _self.oProyecto.cve_central
  //   _endif
  // ---------------------------------------------------------------------------
  async leeDatosBdeD(service: IProyectoService, idProyecto: string): Promise<void> {
    this.superLeeDatosBdeD();

    const proyecto = await service.fetchProyecto(idProyecto);
    // Magik: _if _self.oProyecto.existe?
    if (!proyecto?.existe) return;

    this.localidad     = proyecto.localidad;    // oProyecto.localidad
    this.nombreCentral = proyecto.central;      // oProyecto.central
    this.siglasCentral = proyecto.cveCentral;   // oProyecto.cve_central
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello estándar CTL
// =============================================================================

const SCALE = 2; // SVG px por mm

export function SelloEstandarCtlUI() {
  const [localidad,      setLocalidad     ] = useState('');
  const [nombreCentral,  setNombreCentral ] = useState('');
  const [siglasCentral,  setSiglasCentral ] = useState('');
  const [idProyecto,     setIdProyecto    ] = useState('GDL');
  const [loading,        setLoading       ] = useState(false);
  const [error,          setError         ] = useState<string | null>(null);
  const [modoManual,     setModoManual    ] = useState(false);

  const sello = new SelloEstandarCtl();
  sello.localidad     = localidad;
  sello.nombreCentral = nombreCentral;
  sello.siglasCentral = siglasCentral;
  sello.crearCfgTablas({ x: 0, y: 0 });
  sello.llenarCeldas();
  sello.drawContentOn();  // empuja atributos → celdas

  const handleCargar = async () => {
    setLoading(true); setError(null);
    const s = new SelloEstandarCtl();
    await s.leeDatosBdeD(mockProyectoService, idProyecto);
    if (!s.localidad && !s.nombreCentral) {
      setError(`Proyecto "${idProyecto}" no encontrado. Prueba: GDL, MTY, MEX, TIJ`);
    } else {
      setLocalidad(s.localidad);
      setNombreCentral(s.nombreCentral);
      setSiglasCentral(s.siglasCentral);
    }
    setLoading(false);
  };

  // Total ancho SVG
  const svgW = (BASE_TOTAL_WIDTH + CELDA_A_COL_WIDTHS[0] + CELDA_B_COL_WIDTHS[0]) * SCALE;
  const svgH = 15 * SCALE;  // altura máxima CTL (7+8 = 15mm)

  // Altura de las tablas base (tomamos el max de sus rowHeights)
  const baseMaxH = Math.max(...BASE_STUBS.flatMap(t => t.rowH));

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_estandar_ctl</h3>
      <p style={s.meta}>
        Sello estándar para planos de CTL. Añade tbl_CeldaA (70mm×15mm) + tbl_CeldaB (45mm×15mm)
        a las tablas base. Atributos: <code>Localidad</code>, <code>Nombre_Central</code>, <code>Siglas_Central</code>.
      </p>

      {/* ── Controles de carga ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          <input type="checkbox" checked={modoManual} onChange={e => setModoManual(e.target.checked)} />
          {' '}Modo manual
        </label>

        {!modoManual ? (
          <>
            <label style={s.lbl}>
              ID Proyecto:
              <select value={idProyecto} onChange={e => setIdProyecto(e.target.value)} style={s.select}>
                {Object.keys(MOCK_PROYECTOS).map(k => (
                  <option key={k} value={k}>{k} — {MOCK_PROYECTOS[k].localidad}</option>
                ))}
              </select>
            </label>
            <button onClick={handleCargar} disabled={loading} style={s.btn}>
              {loading ? 'Cargando…' : 'lee_datos_BdeD()'}
            </button>
            {error && <span style={{ ...s.hint, color: '#c62828' }}>{error}</span>}
          </>
        ) : (
          <>
            <label style={s.lbl}>
              Localidad:
              <input type="text" value={localidad}
                onChange={e => setLocalidad(e.target.value)} style={s.textInput} placeholder="POBLACION" />
            </label>
            <label style={s.lbl}>
              Nombre central:
              <input type="text" value={nombreCentral}
                onChange={e => setNombreCentral(e.target.value)} style={{ ...s.textInput, width: 180 }} placeholder="CENTRAL" />
            </label>
            <label style={s.lbl}>
              Siglas:
              <input type="text" value={siglasCentral}
                onChange={e => setSiglasCentral(e.target.value)} style={{ ...s.textInput, width: 80 }} placeholder="Cve Ctl" />
            </label>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── SVG del sello completo ── */}
        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
            Sello completo — escala {SCALE}px/mm
          </div>
          <svg
            width={svgW + 2} height={svgH + 2}
            style={{ border: '1px solid #90a4ae', borderRadius: 2, background: '#fff' }}
          >
            {/* ── Tablas base (stubs) ── */}
            {(() => {
              let x = 0;
              return BASE_STUBS.map(stub => {
                const w  = stub.colW * SCALE;
                const el = (
                  <g key={stub.id}>
                    <rect x={x} y={0} width={w} height={svgH}
                      fill="#f5f5f5" stroke="#455a64" strokeWidth={0.8} />
                    <text x={x + w/2} y={svgH/2} textAnchor="middle" dominantBaseline="middle"
                      fontSize={6} fill="#78909c" fontFamily="sans-serif" fontStyle="italic">
                      {stub.label}
                    </text>
                    <text x={x + 3} y={7} fontSize={5} fill="#bbb" fontFamily="monospace">
                      {stub.id}
                    </text>
                  </g>
                );
                x += w;
                return el;
              });
            })()}

            {/* ── tbl_CeldaA — 2 renglones × 1 col ── */}
            {(() => {
              const tbl  = sello.getCelda ? undefined : undefined;  // access via instance
              const xOff = BASE_TOTAL_WIDTH * SCALE;
              const r1h  = CELDA_A_ROW_HEIGHTS[0] * SCALE;  // 14px
              const r2h  = CELDA_A_ROW_HEIGHTS[1] * SCALE;  // 16px
              const cW   = CELDA_A_COL_WIDTHS[0] * SCALE;   // 140px
              const cel1 = sello.poblacionTbl    || 'POBLACION';
              const cel2 = sello.nombreCentralTbl || 'CENTRAL';
              const isDefault1 = !sello.localidad;
              const isDefault2 = !sello.nombreCentral;
              return (
                <g>
                  {/* Borde exterior */}
                  <rect x={xOff} y={0} width={cW} height={r1h + r2h}
                    fill="#fff" stroke="#455a64" strokeWidth={1} />
                  {/* Fila 1 */}
                  <rect x={xOff} y={0} width={cW} height={r1h}
                    fill={isDefault1 ? '#fafafa' : '#e8f5e9'} />
                  <text x={xOff + cW/2} y={r1h/2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(7, r1h * 0.55)}
                    fill={isDefault1 ? '#aaa' : '#1b5e20'}
                    fontWeight={isDefault1 ? 'normal' : 'bold'}
                    fontFamily="sans-serif">
                    {cel1}
                  </text>
                  {/* Separador fila 1/2 — sin línea (bDibuja_Renglones_Internos=false) → no se dibuja */}
                  {/* Fila 2 */}
                  <rect x={xOff} y={r1h} width={cW} height={r2h}
                    fill={isDefault2 ? '#fafafa' : '#e8f5e9'} />
                  <text x={xOff + cW/2} y={r1h + r2h/2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(7, r2h * 0.5)}
                    fill={isDefault2 ? '#aaa' : '#1b5e20'}
                    fontWeight={isDefault2 ? 'normal' : 'bold'}
                    fontFamily="sans-serif">
                    {cel2}
                  </text>
                  {/* Label de tabla */}
                  <text x={xOff + 2} y={6} fontSize={5} fill="#bbb" fontFamily="monospace">tbl_CeldaA</text>
                </g>
              );
            })()}

            {/* ── tbl_CeldaB — 1 renglón × 1 col ── */}
            {(() => {
              const xOff = (BASE_TOTAL_WIDTH + CELDA_A_COL_WIDTHS[0]) * SCALE;
              const h    = CELDA_B_ROW_HEIGHTS[0] * SCALE;  // 30px
              const w    = CELDA_B_COL_WIDTHS[0] * SCALE;   // 90px
              const cel  = sello.siglasCentralTbl || 'Cve Ctl';
              const isDef = !sello.siglasCentral;
              return (
                <g>
                  <rect x={xOff} y={0} width={w} height={h}
                    fill={isDef ? '#fafafa' : '#e3f2fd'} stroke="#455a64" strokeWidth={1} />
                  <text x={xOff + w/2} y={h/2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(8, h * 0.4)}
                    fill={isDef ? '#aaa' : '#0d47a1'}
                    fontWeight={isDef ? 'normal' : 'bold'}
                    fontFamily="monospace" letterSpacing={1}>
                    {cel}
                  </text>
                  <text x={xOff + 2} y={6} fontSize={5} fill="#bbb" fontFamily="monospace">tbl_CeldaB</text>
                </g>
              );
            })()}
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG {svgW}×{svgH}px · tablas base (stub): {BASE_TOTAL_WIDTH}mm · tbl_CeldaA: 70mm · tbl_CeldaB: 45mm
          </small>
        </div>

        {/* ── Tabla de propiedades ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          <table style={s.table}>
            <thead>
              <tr>{['Atributo Magik', 'Descripción', 'Valor actual', 'Celda destino'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                { nombre: 'Localidad',      desc: 'Población',               val: localidad      || '""', celda: 'tbl_CeldaA, Celda(1,1)' },
                { nombre: 'Nombre_Central', desc: 'Nombre de la central',    val: nombreCentral  || '""', celda: 'tbl_CeldaA, Celda(2,1)' },
                { nombre: 'Siglas_Central', desc: 'Siglas de la central',    val: siglasCentral  || '""', celda: 'tbl_CeldaB, Celda(1,1)' },
              ].map(({ nombre, desc, val, celda }, i) => (
                <tr key={nombre} style={{ background: i%2===0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}><code>:{nombre}</code></td>
                  <td style={{ ...s.td, color: '#555', fontSize: 11 }}>{desc}</td>
                  <td style={{ ...s.td, fontWeight: 'bold' }}>{val}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10, color: '#666' }}>{celda}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table style={s.table}>
            <thead>
              <tr>{['Tabla', 'Dims (mm)', 'Líneas internas', 'Origen X', 'Método Magik'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                { id: 'tbl_CeldaA', dims: '70×15 (7+8)', lineas: false, x: BASE_TOTAL_WIDTH, m: 'prvCrea_Cfg_Tbl_NomPob...' },
                { id: 'tbl_CeldaB', dims: '45×15',       lineas: false, x: BASE_TOTAL_WIDTH + 70, m: 'prvCrea_Cfg_Tbl_NomPob...' },
              ].map(({ id, dims, lineas, x, m }, i) => (
                <tr key={id} style={{ background: i%2===0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}><code>:{id}</code></td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{dims}</td>
                  <td style={{ ...s.td, textAlign: 'center', color: lineas ? '#2e7d32' : '#c62828' }}>{lineas ? 'sí' : 'no (_false)'}</td>
                  <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{x}mm</td>
                  <td style={{ ...s.td, fontSize: 10, color: '#777' }}>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>draw_content_on</code> empuja atributos → celdas antes de llamar <code>_super</code>.
        <code>lee_datos_BdeD</code> lee de <code>oProyecto.existe?</code> → mock IDs: GDL, MTY, MEX, TIJ.
        Tablas base (<code>tbl_compania</code>, <code>tbl_FecDibRev</code>, <code>tbl_Escala</code>) como stub.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  textInput: { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3, width: 140 },
  select   : { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  btn      : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  hint     : { fontSize: 11, color: '#666', fontStyle: 'italic' },
  table    : { borderCollapse: 'collapse' },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloEstandarCtlUI;
