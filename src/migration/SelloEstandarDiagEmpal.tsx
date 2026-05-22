/**
 * Migration: c_sello_estandar_diag_empal.magik → SelloEstandarDiagEmpal.tsx
 *
 * Sello estándar para diagramas de empalme.
 * Hereda de c_sello_estandar_base y añade:
 *   - tbl_CeldaA (2×1, 70mm): Población (fila 1, 7mm) + Nombre Central (fila 2, 8mm)
 *   - tbl_CeldaB (1×1, 45mm): Clave Distrito (fila 1, 15mm)
 *
 * Magik → TypeScript:
 *   defined_attributes            → interface AtributosSello con 3 campos nuevos
 *   draw_content_on(window)       → función drawContentOn() que actualiza estado
 *   prvCrea_Cfg_Tablas            → función createTableConfig() con posiciones
 *   prvCrea_Cfg_Tbl_NomPob…       → función createTblCeldaAB()
 *   prvLlena_Tbl_NomPob…          → función fillTblCeldaAB()
 *   Poblacion_tbl getter/setter   → campo poblacionTbl en estado
 *   Nombre_central_tbl getter/setter → campo nombreCentralTbl en estado
 *   Siglas_distrito_tbl getter/setter → campo siglasDtoTbl en estado
 *   lee_datos_BdeD()              → función async leeDatosBdD() con mock de proyecto
 */

import React, { useState, useCallback } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** defined_attributes: los 3 atributos propios de este sello */
interface AtributosBase {
  nombrePlano   : string;
  fechaDibujo   : string;
  revisado      : string;
  escala        : string;
  nombreEmpresa : string;
}

interface AtributosSello extends AtributosBase {
  localidad      : string;  // :Localidad — "Población"
  nombreCentral  : string;  // :Nombre_Central
  siglasDist     : string;  // :Siglas_Distrito
}

/** Celda de una tabla interna del sello */
interface Celda {
  texto   : string;
  tamLetra: number;  // nTamanio (Magik: 35)
}

/** Configuración de tabla (tbl_CeldaA / tbl_CeldaB) */
interface ConfigTabla {
  id         : string;
  anchoMm    : number;
  filas      : Array<{ altoMm: number; celda: Celda }>;
}

/** Estado completo del sello renderizado */
interface EstadoSello {
  atributos: AtributosSello;
  tblCeldaA: ConfigTabla;
  tblCeldaB: ConfigTabla;
}

// ── Mock de proyectos (= oProyecto.existe? + campos) ─────────────────────────

interface ProyectoMock {
  localidad   : string;
  central     : string;
  cveDistrito : string;
  nombrePlano : string;
  fecha       : string;
  revisado    : string;
  escala      : string;
}

const PROYECTOS_MOCK: Record<string, ProyectoMock> = {
  'PRY-001': {
    localidad  : 'GUADALAJARA',
    central    : 'CENTRAL GUADALAJARA NORTE',
    cveDistrito: 'GDL-N',
    nombrePlano: 'DIAGRAMA DE EMPALME ZONA NORTE',
    fecha      : '2005-02-07',
    revisado   : 'DSB',
    escala     : '1:500',
  },
  'PRY-002': {
    localidad  : 'MONTERREY',
    central    : 'CENTRAL MTY CENTRO',
    cveDistrito: 'MTY-C',
    nombrePlano: 'DIAGRAMA DE EMPALME CENTRO',
    fecha      : '2005-03-15',
    revisado   : 'FAD',
    escala     : '1:1000',
  },
  'PRY-003': {
    localidad  : 'MEXICO DF',
    central    : 'CENTRAL BUENAVISTA',
    cveDistrito: 'MEX-BV',
    nombrePlano: 'DIAGRAMA DE EMPALME BUENAVISTA',
    fecha      : '2005-04-20',
    revisado   : 'DSB',
    escala     : '1:750',
  },
};

// ── Lógica de negocio ─────────────────────────────────────────────────────────

/**
 * prvCrea_Cfg_Tbl_NomPob_NomCtl_CveDto — configura las dos tablas nuevas.
 * Magik: tbl_CeldaA (2 renglones × 1 col, 7+8mm alto, 70mm ancho)
 *        tbl_CeldaB (1 renglón  × 1 col, 15mm  alto, 45mm ancho)
 */
function crearConfigTablas(): { tblCeldaA: ConfigTabla; tblCeldaB: ConfigTabla } {
  const tblCeldaA: ConfigTabla = {
    id     : 'tbl_CeldaA',
    anchoMm: 70,
    filas  : [
      { altoMm: 7,  celda: { texto: 'POBLACION', tamLetra: 35 } },
      { altoMm: 8,  celda: { texto: 'CENTRAL',   tamLetra: 35 } },
    ],
  };

  const tblCeldaB: ConfigTabla = {
    id     : 'tbl_CeldaB',
    anchoMm: 45,
    filas  : [
      { altoMm: 15, celda: { texto: 'Cve Dto', tamLetra: 35 } },
    ],
  };

  return { tblCeldaA, tblCeldaB };
}

/**
 * draw_content_on(window) — asigna atributos a las celdas de las tablas.
 * Magik: _self.poblacion_tbl << _self.localidad
 *        _self.nombre_central_tbl << _self.nombre_central
 *        _self.siglas_distrito_tbl << _self.siglas_distrito
 */
function drawContentOn(
  atributos : AtributosSello,
  tblCeldaA : ConfigTabla,
  tblCeldaB : ConfigTabla,
): { tblCeldaA: ConfigTabla; tblCeldaB: ConfigTabla } {
  return {
    tblCeldaA: {
      ...tblCeldaA,
      filas: [
        { ...tblCeldaA.filas[0], celda: { ...tblCeldaA.filas[0].celda, texto: atributos.localidad     || 'POBLACION'  } },
        { ...tblCeldaA.filas[1], celda: { ...tblCeldaA.filas[1].celda, texto: atributos.nombreCentral || 'CENTRAL'    } },
      ],
    },
    tblCeldaB: {
      ...tblCeldaB,
      filas: [
        { ...tblCeldaB.filas[0], celda: { ...tblCeldaB.filas[0].celda, texto: atributos.siglasDist    || 'Cve Dto'    } },
      ],
    },
  };
}

/**
 * lee_datos_BdeD() — lee datos del proyecto mock.
 * Magik: _super.lee_datos_BdeD() + oProyecto.localidad / .central / .cve_distrito
 */
async function leeDatosBdD(idProyecto: string): Promise<AtributosSello | null> {
  await new Promise(r => setTimeout(r, 250)); // simula latencia GIS
  const pry = PROYECTOS_MOCK[idProyecto];
  if (!pry) return null;
  return {
    nombrePlano  : pry.nombrePlano,
    fechaDibujo  : pry.fecha,
    revisado     : pry.revisado,
    escala       : pry.escala,
    nombreEmpresa: 'TELMEX',
    localidad    : pry.localidad,
    nombreCentral: pry.central,
    siglasDist   : pry.cveDistrito,
  };
}

// ── Componente React ──────────────────────────────────────────────────────────

const ATRIBUTOS_VACIOS: AtributosSello = {
  nombrePlano: '', fechaDibujo: '', revisado: '', escala: '', nombreEmpresa: 'TELMEX',
  localidad: '', nombreCentral: '', siglasDist: '',
};

export function SelloEstandarDiagEmpalUI() {
  const { tblCeldaA: initA, tblCeldaB: initB } = crearConfigTablas();

  const [atribs, setAtribs]     = useState<AtributosSello>(ATRIBUTOS_VACIOS);
  const [tblA,   setTblA]       = useState<ConfigTabla>(initA);
  const [tblB,   setTblB]       = useState<ConfigTabla>(initB);
  const [proyId, setProyId]     = useState('PRY-001');
  const [cargando, setCargando] = useState(false);
  const [msg,    setMsg]        = useState('');

  /** Carga del proyecto mock → lee_datos_BdeD() */
  const cargarProyecto = useCallback(async () => {
    setCargando(true);
    setMsg('');
    const datos = await leeDatosBdD(proyId);
    if (!datos) {
      setMsg(`Proyecto "${proyId}" no encontrado.`);
      setCargando(false);
      return;
    }
    const { tblCeldaA: a, tblCeldaB: b } = crearConfigTablas();
    const { tblCeldaA: ra, tblCeldaB: rb } = drawContentOn(datos, a, b);
    setAtribs(datos);
    setTblA(ra);
    setTblB(rb);
    setMsg(`Datos cargados para "${proyId}".`);
    setCargando(false);
  }, [proyId]);

  /** Edición manual de atributos → draw_content_on */
  const actualizarCampo = useCallback(
    (campo: keyof AtributosSello, valor: string) => {
      setAtribs(prev => {
        const updated = { ...prev, [campo]: valor };
        const { tblCeldaA: ra, tblCeldaB: rb } = drawContentOn(updated, tblA, tblB);
        setTblA(ra);
        setTblB(rb);
        return updated;
      });
    },
    [tblA, tblB],
  );

  // Escala visual: 1mm → 3px
  const mm = (v: number) => v * 3;

  return (
    <div style={st.root}>

      {/* Panel de carga de proyecto */}
      <div style={st.panel}>
        <label style={st.lbl}>
          Proyecto:
          <select value={proyId} onChange={e => setProyId(e.target.value)} style={st.sel}>
            {Object.keys(PROYECTOS_MOCK).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <button style={st.btn} onClick={cargarProyecto} disabled={cargando}>
          {cargando ? 'Cargando…' : 'lee_datos_BdeD()'}
        </button>
        {msg && <span style={st.msg}>{msg}</span>}
      </div>

      {/* Edición manual de atributos */}
      <div style={st.grid}>
        {(
          [
            ['localidad',     'Localidad (Población)'],
            ['nombreCentral', 'Nombre Central'],
            ['siglasDist',    'Siglas Distrito'],
            ['nombrePlano',   'Nombre Plano'],
            ['fechaDibujo',   'Fecha'],
            ['revisado',      'Revisado'],
            ['escala',        'Escala'],
          ] as [keyof AtributosSello, string][]
        ).map(([campo, etiqueta]) => (
          <label key={campo} style={st.campo}>
            <span style={st.campoNombre}>{etiqueta}</span>
            <input
              value={atribs[campo]}
              onChange={e => actualizarCampo(campo, e.target.value)}
              style={st.input}
            />
          </label>
        ))}
      </div>

      {/* Visualización del sello */}
      <div style={st.selloWrap}>
        <div style={st.selloLabel}>draw_content_on() — sello renderizado</div>

        <div style={{ display: 'flex', border: '1.5px solid #2E4057' }}>

          {/* Tablas base heredadas de c_sello_estandar_base */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* tbl_compania */}
            <TablaBase
              id="tbl_compania"
              anchoMm={40}
              filas={[{ altoMm: 15, texto: atribs.nombreEmpresa || 'TELMEX' }]}
              mm={mm}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* tbl_FecDibRev */}
            <TablaBase
              id="tbl_FecDibRev"
              anchoMm={30}
              filas={[
                { altoMm: 7,  texto: atribs.fechaDibujo || 'FECHA' },
                { altoMm: 8,  texto: atribs.revisado    || 'REVISÓ' },
              ]}
              mm={mm}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* tbl_Escala */}
            <TablaBase
              id="tbl_Escala"
              anchoMm={25}
              filas={[{ altoMm: 15, texto: atribs.escala || 'ESCALA' }]}
              mm={mm}
            />
          </div>

          {/* tbl_CeldaA — nueva en esta subclase */}
          <div style={{ display: 'flex', flexDirection: 'column',
                        width: mm(tblA.anchoMm), borderLeft: '1.5px solid #2E4057' }}>
            <div style={st.tablaBadge}>{tblA.id}</div>
            {tblA.filas.map((fila, i) => (
              <CeldaVista
                key={i}
                texto={fila.celda.texto}
                altoMm={fila.altoMm}
                anchoMm={tblA.anchoMm}
                tamLetra={fila.celda.tamLetra}
                mm={mm}
                highlight
              />
            ))}
          </div>

          {/* tbl_CeldaB — nueva en esta subclase */}
          <div style={{ display: 'flex', flexDirection: 'column',
                        width: mm(tblB.anchoMm), borderLeft: '1.5px solid #2E4057' }}>
            <div style={st.tablaBadge}>{tblB.id}</div>
            {tblB.filas.map((fila, i) => (
              <CeldaVista
                key={i}
                texto={fila.celda.texto}
                altoMm={fila.altoMm}
                anchoMm={tblB.anchoMm}
                tamLetra={fila.celda.tamLetra}
                mm={mm}
                highlight
              />
            ))}
          </div>
        </div>

        {/* Nombre de plano debajo */}
        <div style={st.nombrePlano}>
          {atribs.nombrePlano || 'NOMBRE DEL PLANO'}
        </div>
      </div>

      {/* Tabla de estado interno */}
      <div style={st.tablaEstado}>
        <strong style={{ fontSize: 11 }}>Estado interno (getter/setter)</strong>
        <table style={st.tbl}>
          <thead>
            <tr>
              {['Getter Magik', 'Valor actual', 'Tabla / Celda'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['poblacion_tbl',      tblA.filas[0]?.celda.texto, 'tbl_CeldaA → Celda(1,1)'],
              ['nombre_central_tbl', tblA.filas[1]?.celda.texto, 'tbl_CeldaA → Celda(2,1)'],
              ['siglas_distrito_tbl',tblB.filas[0]?.celda.texto, 'tbl_CeldaB → Celda(1,1)'],
            ].map(([getter, valor, desc]) => (
              <tr key={getter}>
                <td style={st.td}><code>{getter}</code></td>
                <td style={st.td}><strong>{valor}</strong></td>
                <td style={st.td}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Subcomponentes visuales ───────────────────────────────────────────────────

function TablaBase({
  id, anchoMm, filas, mm,
}: {
  id: string;
  anchoMm: number;
  filas: Array<{ altoMm: number; texto: string }>;
  mm: (v: number) => number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column',
                  width: mm(anchoMm), borderRight: '1px solid #ccc' }}>
      <div style={stBase.badge}>{id}</div>
      {filas.map((f, i) => (
        <div key={i} style={{
          height     : mm(f.altoMm),
          width      : mm(anchoMm),
          display    : 'flex',
          alignItems : 'center',
          justifyContent: 'center',
          borderBottom: i < filas.length - 1 ? '1px solid #ccc' : 'none',
          fontSize   : 9,
          color      : '#444',
          overflow   : 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace : 'nowrap',
          padding    : '0 2px',
        }}>
          {f.texto}
        </div>
      ))}
    </div>
  );
}

function CeldaVista({
  texto, altoMm, anchoMm, tamLetra, mm, highlight,
}: {
  texto: string;
  altoMm: number;
  anchoMm: number;
  tamLetra: number;
  mm: (v: number) => number;
  highlight?: boolean;
}) {
  return (
    <div style={{
      height        : mm(altoMm),
      width         : mm(anchoMm),
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
      background    : highlight ? 'rgba(74,144,217,0.10)' : 'transparent',
      borderBottom  : '1px solid #bbb',
      fontSize      : Math.max(8, tamLetra * 0.22),
      fontWeight    : 'bold',
      color         : '#2E4057',
      overflow      : 'hidden',
      textOverflow  : 'ellipsis',
      whiteSpace    : 'nowrap',
      padding       : '0 3px',
    }}>
      {texto}
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root       : { fontFamily: 'sans-serif', fontSize: 13 },
  panel      : { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  lbl        : { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 },
  sel        : { padding: '3px 8px', borderRadius: 4, border: '1px solid #bbb', fontSize: 12 },
  btn        : { padding: '5px 14px', background: '#2E4057', color: '#fff', border: 'none',
                 borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  msg        : { fontSize: 11, color: '#2E4057', fontStyle: 'italic' },
  grid       : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                 gap: 8, marginBottom: 16 },
  campo      : { display: 'flex', flexDirection: 'column', gap: 2 },
  campoNombre: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  input      : { padding: '3px 6px', border: '1px solid #bbb', borderRadius: 4, fontSize: 12 },
  selloWrap  : { marginBottom: 14 },
  selloLabel : { fontSize: 10, color: '#888', marginBottom: 4, fontStyle: 'italic' },
  tablaBadge : { fontSize: 8, color: '#2E4057', background: 'rgba(74,144,217,0.15)',
                 padding: '1px 3px', textAlign: 'center' as const },
  nombrePlano: { marginTop: 4, fontSize: 11, color: '#333', fontStyle: 'italic',
                 borderTop: '1px solid #ddd', paddingTop: 4 },
  tablaEstado: { marginTop: 12 },
  tbl        : { width: '100%', borderCollapse: 'collapse', marginTop: 6 },
  th         : { background: '#2E4057', color: '#fff', padding: '4px 10px',
                 fontSize: 11, textAlign: 'left' as const },
  td         : { padding: '4px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

const stBase: Record<string, React.CSSProperties> = {
  badge: { fontSize: 8, color: '#888', background: '#f0f0f0', padding: '1px 3px',
           textAlign: 'center' as const },
};
