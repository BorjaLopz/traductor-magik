/**
 * SelloPieDiagEmp.tsx
 * Migración de c_sello_pie_diag_emp.magik
 *
 * Sello de pie para diagrama de empalmes.
 * Hereda de c_sello_estandar_ctl_edo (modelado aquí como props + estado).
 * Tabla extra: tbl_colonia_cp (2f×2c, sin bordes).
 * Método clave: delegacion_municipio() → queries espaciales con Turf.js.
 */

import React, { useEffect, useState, useCallback } from 'react';
import * as turf from '@turf/turf';
import type { Feature, Polygon, Point } from 'geojson';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a los slots heredados y property_list del original
// ---------------------------------------------------------------------------

/** Tipos de diseño — Magik: swg_dsn_admin_engine.active_design.tipo_diseno */
export type TipoDiseno = 'principales' | 'trabajo' | 'enlace' | 'secundaria';

/** Equivale a .pl_datos (property_list) extendida desde c_sello_estandar_ctl_edo */
interface PlDatos {
  clave_ctl      : string;
  nombre_central : string;
  numero_distrito: string;
  colonia        : string;
  cp             : string;
  delegacion_mpo : string;
}

/** Edificio (building) en GIS — tiene location (Point) */
interface Building {
  id      : string;
  location: Feature<Point>;
}

/** Caja de Distribución — :mit_terminal_enclosure */
interface CajaDistribucion {
  id      : string;
  location: Feature<Point>;
}

/** Municipio — :user!_municipio — tiene limite (Polygon) */
interface Municipio {
  id              : string;
  user_nombre_telmex: string;
  user_estado     : string;
  user_limite     : Feature<Polygon>;
}

/** Central — tiene limite (Polygon) que define su área de cobertura */
interface Central {
  clave_ctl      : string;
  nombre_central : string;
  numero_distrito: string;
  user_limite    : Feature<Polygon>;
}

/** Diseño activo — Magik: swg_dsn_admin_engine.active_design */
interface ActiveDesign {
  tipo_diseno: TipoDiseno;
  project    : { central: Central };
}

// ---------------------------------------------------------------------------
// Mock de datos GIS — reemplaza mit_manager y gis_program_manager
// ---------------------------------------------------------------------------

// Área límite de la central (polígono en coordenadas EPSG:4326 simuladas)
const CENTRAL_LIMITE: Feature<Polygon> = turf.polygon([[
  [-99.150, 19.430],
  [-99.130, 19.430],
  [-99.130, 19.450],
  [-99.150, 19.450],
  [-99.150, 19.430],
]]);

// Edificios (building) — Magik: LoV.collection(:building)
const MOCK_BUILDINGS: Building[] = [
  { id: 'B-01', location: turf.point([-99.140, 19.440]) }, // dentro del límite central
  { id: 'B-02', location: turf.point([-99.200, 19.500]) }, // fuera
];

// Cajas de Distribución — Magik: LoV.collection(:mit_terminal_enclosure)
const MOCK_CDS: CajaDistribucion[] = [
  { id: 'CD-01', location: turf.point([-99.142, 19.438]) }, // dentro del límite central
  { id: 'CD-02', location: turf.point([-99.300, 19.600]) }, // fuera
];

// Municipios — Magik: cached_dataset(:landbase).collection(:user!_municipio)
const MOCK_MUNICIPIOS: Municipio[] = [
  {
    id                : 'MUN-GAM',
    user_nombre_telmex: 'GUSTAVO A. MADERO',
    user_estado       : 'CDMX',
    user_limite       : turf.polygon([[
      [-99.160, 19.420],
      [-99.120, 19.420],
      [-99.120, 19.460],
      [-99.160, 19.460],
      [-99.160, 19.420],
    ]]),
  },
  {
    id                : 'MUN-IZT',
    user_nombre_telmex: 'IZTAPALAPA',
    user_estado       : 'CDMX',
    user_limite       : turf.polygon([[
      [-99.080, 19.350],
      [-99.040, 19.350],
      [-99.040, 19.390],
      [-99.080, 19.390],
      [-99.080, 19.350],
    ]]),
  },
];

// Datos base de la central y el distrito
const MOCK_CENTRAL: Central = {
  clave_ctl      : 'NOR-01',
  nombre_central : 'CENTRAL NORTE',
  numero_distrito: 'D-042',
  user_limite    : CENTRAL_LIMITE,
};

// ---------------------------------------------------------------------------
// delegacion_municipio — query espacial con Turf.js
// Magik: predicate.within(:location, LoArea)  → turf.booleanWithin(point, polygon)
//        predicate.interacts(:user!_limite, location) → turf.booleanIntersects(poly, point)
// ---------------------------------------------------------------------------
async function delegacionMunicipio(
  design    : ActiveDesign,
  buildings : Building[],
  cds       : CajaDistribucion[],
  municipios: Municipio[],
): Promise<string> {
  const centralLimite = design.project.central.user_limite;
  const tipo          = design.tipo_diseno;

  // Helper: primer elemento cuyo Point está dentro del área de la central
  // Magik: tabla.select(predicate.within(:location, LoArea)).an_element()
  function elementoWithin<T extends { location: Feature<Point> }>(
    coleccion: T[],
  ): T | undefined {
    return coleccion.find(el =>
      turf.booleanWithin(el.location, centralLimite),  // predicate.within
    );
  }

  // Helper: municipio cuyo limite intersecta con el point dado
  // Magik: LoTabMun.select(predicate.interacts(:user!_limite, location))
  function municipioQueInteracta(point: Feature<Point>): Municipio | undefined {
    const matches = municipios.filter(m =>
      turf.booleanIntersects(m.user_limite, point),    // predicate.interacts
    );
    // Magik: _if LoSel.size = 1 → solo si hay exactamente 1 resultado
    return matches.length === 1 ? matches[0] : undefined;
  }

  if (
    tipo === 'principales' ||
    tipo === 'trabajo'     ||
    tipo === 'enlace'
  ) {
    // Magik: rama :principales/:trabajo/:enlace
    // Busca edificio (building) dentro del límite de la central
    const nodo = elementoWithin(buildings);
    if (!nodo) return '(sin edificio en límite central)';

    const mun = municipioQueInteracta(nodo.location);
    if (!mun) return '(municipio no encontrado)';

    // Magik: LoMun.user!_nombre_telmex + ", " + LoMun.user!_estado
    return `${mun.user_nombre_telmex}, ${mun.user_estado}`;
  }

  if (tipo === 'secundaria') {
    // Magik: rama :secundaria — busca CD primero
    const cd = elementoWithin(cds);

    if (cd) {
      // CD encontrada — busca municipio por su location
      const mun = municipioQueInteracta(cd.location);
      if (!mun) return '(municipio de CD no encontrado)';
      // Magik: Lomunicipio << LoMun.user!_nombre_telmex + "," + LoMun.user!_estado
      return `${mun.user_nombre_telmex},${mun.user_estado}`;
    } else {
      // Magik: fallback — si no hay CD, usa building (igual que rama :principales)
      const nodo = elementoWithin(buildings);
      if (!nodo) return '(sin CD ni edificio en límite central)';
      const mun = municipioQueInteracta(nodo.location);
      if (!mun) return '(municipio fallback no encontrado)';
      return `${mun.user_nombre_telmex}, ${mun.user_estado}`;
    }
  }

  return '(tipo de diseño no reconocido)';
}

// ---------------------------------------------------------------------------
// obten_registros — rellena pl_datos desde o_distrito
// Magik: .pl_datos[:colonia] << .o_distrito.nombre_colonia
//        .pl_datos[:cp]      << .o_distrito.codigo_postal
// ---------------------------------------------------------------------------
interface ODistritoMock {
  nombre_colonia: string;
  codigo_postal : string;
}

const MOCK_DISTRITO: ODistritoMock = {
  nombre_colonia: 'LINDAVISTA',
  codigo_postal : '07300',
};

async function obtenRegistros(
  central : Central,
  distrito: ODistritoMock,
): Promise<PlDatos> {
  return {
    clave_ctl      : central.clave_ctl,
    nombre_central : central.nombre_central,
    numero_distrito: central.numero_distrito,
    // Magik: _super.obten_registros() + .pl_datos[:colonia/.cp] desde o_distrito
    colonia        : distrito.nombre_colonia,
    cp             : distrito.codigo_postal,
    delegacion_mpo : '',   // se llena por separado con delegacion_municipio()
  };
}

// ---------------------------------------------------------------------------
// valor_casilla_central
// Magik: _return .pl_datos[:clave_ctl] + " - " + .o_proyecto.numero_distrito
// ---------------------------------------------------------------------------
function valorCasillaCentral(datos: PlDatos): string {
  return `${datos.clave_ctl} - ${datos.numero_distrito}`;
}

// ---------------------------------------------------------------------------
// Subcomponente tabla — tbl_colonia_cp
// Magik: configura_tabla → 2f×2c, ren {5,5}, col {22,45}
//        bDibuja_bordes? = false, bDibuja_Columnas_Internas? = false
//        bDibuja_Renglones_Internos? = false
// ---------------------------------------------------------------------------
function TblColoniaCp({ datos }: { datos: PlDatos }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <colgroup>
        <col style={{ width: 88  }} />  {/* col 22u */}
        <col style={{ width: 180 }} />  {/* col 45u */}
      </colgroup>
      <tbody>
        {/* fila 1: etiqueta_celdas → "COLONIA: " + dato colonia */}
        <tr style={{ height: 20 }}>
          {/* Magik: asigna_texto_celda(:tbl_colonia_cp,1,1,"COLONIA: ",35,:top_left,1) */}
          <td style={ts.labelCell}>COLONIA:</td>
          <td style={ts.dataCell}>{datos.colonia || <em style={{ color: '#aaa' }}>(vacío)</em>}</td>
        </tr>
        {/* fila 2: etiqueta_celdas → "C.P.: " + dato cp */}
        <tr style={{ height: 20 }}>
          {/* Magik: asigna_texto_celda(:tbl_colonia_cp,2,1,"C.P.: ",35,:top_left,1) */}
          <td style={ts.labelCell}>C.P.:</td>
          <td style={ts.dataCell}>{datos.cp || <em style={{ color: '#aaa' }}>(vacío)</em>}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Subcomponente — resumen del diseño activo + casilla central
// ---------------------------------------------------------------------------
function ResumenSello({ datos, delegacion }: { datos: PlDatos; delegacion: string }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 8 }}>
      <thead>
        <tr>
          <th style={ts.headerCell}>Campo</th>
          <th style={ts.headerCell}>Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={ts.labelCell}>Casilla central (valor_casilla_central)</td>
          {/* Magik: .pl_datos[:clave_ctl] + " - " + .o_proyecto.numero_distrito */}
          <td style={ts.dataCell}>{valorCasillaCentral(datos)}</td>
        </tr>
        <tr>
          <td style={ts.labelCell}>Delegación / Municipio (delegacion_municipio)</td>
          <td style={ts.dataCell}>{delegacion || <em style={{ color: '#aaa' }}>calculando…</em>}</td>
        </tr>
        <tr>
          <td style={ts.labelCell}>Colonia (o_distrito.nombre_colonia)</td>
          <td style={ts.dataCell}>{datos.colonia}</td>
        </tr>
        <tr>
          <td style={ts.labelCell}>Código Postal (o_distrito.codigo_postal)</td>
          <td style={ts.dataCell}>{datos.cp}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — SelloPieDiagEmp
// ---------------------------------------------------------------------------
export function SelloPieDiagEmpUI() {
  const [tipoDiseno, setTipoDiseno] = useState<TipoDiseno>('principales');
  const [datos,      setDatos]      = useState<PlDatos | null>(null);
  const [delegacion, setDelegacion] = useState<string>('');
  const [loading,    setLoading]    = useState(false);
  const [log,        setLog]        = useState<string[]>([]);

  const run = useCallback(async () => {
    setLoading(true);
    setLog([]);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    // obten_registros — pl_datos desde central + distrito
    const pl = await obtenRegistros(MOCK_CENTRAL, MOCK_DISTRITO);
    setDatos(pl);
    addLog(`obten_registros() → colonia="${pl.colonia}", cp="${pl.cp}"`);

    // delegacion_municipio — query espacial
    const design: ActiveDesign = {
      tipo_diseno: tipoDiseno,
      project    : { central: MOCK_CENTRAL },
    };
    addLog(`delegacion_municipio() → tipo_diseno="${tipoDiseno}"`);

    const mpo = await delegacionMunicipio(design, MOCK_BUILDINGS, MOCK_CDS, MOCK_MUNICIPIOS);
    setDelegacion(mpo);
    addLog(`delegacion_municipio() → "${mpo}"`);
    addLog(`valor_casilla_central() → "${valorCasillaCentral(pl)}"`);

    setLoading(false);
  }, [tipoDiseno]);

  useEffect(() => { run(); }, [run]);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 8 }}>

      {/* ── Selector de tipo_diseno — rama del delegacion_municipio() ── */}
      <fieldset style={{ marginBottom: 12, padding: 8, borderRadius: 4 }}>
        <legend style={{ fontWeight: 'bold', fontSize: 11 }}>
          Diseño activo (swg_dsn_admin_engine.active_design.tipo_diseno)
        </legend>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(['principales', 'trabajo', 'enlace', 'secundaria'] as TipoDiseno[]).map(t => (
            <label key={t} style={{ fontSize: 12, cursor: 'pointer' }}>
              <input
                type="radio"
                name="tipo_diseno"
                value={t}
                checked={tipoDiseno === t}
                onChange={() => setTipoDiseno(t)}
                style={{ marginRight: 4 }}
              />
              :{t}
            </label>
          ))}
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#666' }}>
          :principales/:trabajo/:enlace → busca building dentro central → municipio.
          {' '}:secundaria → busca CD → si no hay, fallback a building.
        </p>
      </fieldset>

      {loading && <p style={{ color: '#888' }}>Ejecutando queries espaciales…</p>}

      {datos && !loading && (
        <>
          {/* ── Sello visual: tbl_colonia_cp ── */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ background: '#2E4057', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: '3px 3px 0 0' }}>
              tbl_colonia_cp — 2f × 2c (col 22+45u) · sin bordes
            </div>
            <div style={{ border: '1px solid #aaa', borderTop: 'none', padding: 4 }}>
              <TblColoniaCp datos={datos} />
            </div>
          </div>

          {/* ── Resumen completo del sello ── */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ background: '#445566', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: '3px 3px 0 0' }}>
              Sello completo — campos heredados de c_sello_estandar_ctl_edo
            </div>
            <div style={{ border: '1px solid #aaa', borderTop: 'none', padding: 4 }}>
              <ResumenSello datos={datos} delegacion={delegacion} />
            </div>
          </div>

          {/* ── Log de ejecución ── */}
          <details open>
            <summary style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>
              Traza de ejecución (obten_registros + delegacion_municipio)
            </summary>
            <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 11, borderRadius: 4, marginTop: 4 }}>
              {log.join('\n')}
            </pre>
          </details>

          {/* ── Datos GIS mock ── */}
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>
              Datos GIS mock (buildings, CDs, municipios)
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 6 }}>
              <div>
                <strong style={{ fontSize: 11 }}>Buildings</strong>
                {MOCK_BUILDINGS.map(b => (
                  <p key={b.id} style={{ fontSize: 10, margin: '2px 0' }}>
                    {b.id}: [{b.location.geometry.coordinates.map(c => c.toFixed(3)).join(', ')}]
                    {turf.booleanWithin(b.location, CENTRAL_LIMITE)
                      ? ' ✓ dentro central' : ' ✗ fuera'}
                  </p>
                ))}
              </div>
              <div>
                <strong style={{ fontSize: 11 }}>CDs (mit_terminal_enclosure)</strong>
                {MOCK_CDS.map(cd => (
                  <p key={cd.id} style={{ fontSize: 10, margin: '2px 0' }}>
                    {cd.id}: [{cd.location.geometry.coordinates.map(c => c.toFixed(3)).join(', ')}]
                    {turf.booleanWithin(cd.location, CENTRAL_LIMITE)
                      ? ' ✓ dentro central' : ' ✗ fuera'}
                  </p>
                ))}
              </div>
              <div>
                <strong style={{ fontSize: 11 }}>Municipios</strong>
                {MOCK_MUNICIPIOS.map(m => (
                  <p key={m.id} style={{ fontSize: 10, margin: '2px 0' }}>
                    {m.user_nombre_telmex}, {m.user_estado}
                  </p>
                ))}
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
}

export default SelloPieDiagEmpUI;

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const ts: Record<string, React.CSSProperties> = {
  headerCell: {
    background : '#2E4057', color: '#fff',
    padding    : '3px 6px', textAlign: 'left', fontSize: 10, fontWeight: 'bold',
  },
  labelCell : {
    padding    : '3px 6px', fontSize: 10, fontWeight: 'bold',
    whiteSpace : 'nowrap', verticalAlign: 'top',
  },
  dataCell  : {
    padding    : '3px 6px', fontSize: 10, verticalAlign: 'top',
  },
};
