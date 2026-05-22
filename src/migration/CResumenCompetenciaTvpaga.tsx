import React, { useMemo, useState } from 'react';
import * as turf from '@turf/turf';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

// OL note: en producción, location sería un ol/Feature<ol/geom/Point>.
// Aquí usamos GeoJSON/Turf para el filtrado espacial.
export interface InventarioVivienda {
  servicio:       'TELEFONO' | 'TV' | 'INTERNET';
  producto:       string;            // nombre del producto/línea
  tipo_servicio?: string;            // TV: 'SATELITAL' | 'CABLE'
  empresa?:       string;            // TV: 'DISH' | 'SKY' | ...
  cantidad:       number;            // Magik: inv.user!_cantidad
}

export interface Vivienda {
  id:        string;
  // Magik: LoVivienda.location — geometría punto
  location:  turf.Feature<turf.Point>;
  // Magik: LoVivienda.user!_inventario_viviendas
  inventario: InventarioVivienda[];
}

export interface LimiteOptico {
  id:     string;
  nombre: string;
  // Magik: .oDtoOptico.user!_limite — polígono del área óptica
  limite: turf.Feature<turf.Polygon>;
}

export interface ValoresCompetencia {
  tv_satelital:                   number;
  tv_dish:                        number;
  tv_cable:                       number;
  lineas_inalambricas:            number;
  lineas_ladafon:                 number;
  lineas_ladatel:                 number;
  infinitum:                      number;
  lineas_cobre:                   number;
  lineas_pslt:                    number;
  solicitudes:                    number;
  lineas_competencia_cobre:       number;
  lineas_competencia_inalambrica: number;
  telefono_publico_competencia:   number;
  fibra_telmex:                   number;
  fibra_competencia:              number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de filas del sello — Magik: etiqueta_celdas()
// ─────────────────────────────────────────────────────────────────────────────

interface FilaContenido {
  row:      number;
  simbolo:  string;                             // asigna_simbolo_celda col=1
  tipo:     string;                             // asigna_texto_celda col=3
  valorKey: keyof ValoresCompetencia | null;    // asigna_texto_celda col=2
}

const FILAS_CONTENIDO: readonly FilaContenido[] = [
  { row:  1, simbolo: 'p_predio_deshabitado',    tipo: 'PREDIO DESHABITADO',                            valorKey: null },
  { row:  2, simbolo: 'p_tv_satelital',          tipo: 'TELEVISION SATELITAL',                          valorKey: 'tv_satelital' },
  { row:  3, simbolo: 'p_tv_dish',               tipo: 'TELEVISION SATELITAL (DISH)',                   valorKey: 'tv_dish' },
  { row:  4, simbolo: 'p_tv_por_cable',          tipo: 'TELEVISION/CABLE',                              valorKey: 'tv_cable' },
  { row:  5, simbolo: 'p_operteles',             tipo: 'OPERTELES',                                     valorKey: 'lineas_competencia_cobre' },
  { row:  6, simbolo: 'p_operteles_inalambrica', tipo: 'INALAMBRICA OPERTELES',                         valorKey: 'lineas_competencia_inalambrica' },
  { row:  7, simbolo: 'p_telmex_inalambrica',    tipo: 'INALAMBRICA TELMEX',                            valorKey: 'lineas_inalambricas' },
  { row:  8, simbolo: 'p_telpub_compet',         tipo: 'TEL/PUB COMPET.',                               valorKey: 'telefono_publico_competencia' },
  { row:  9, simbolo: 'p_caseta_ladafon',        tipo: 'CASETA LADAFON',                                valorKey: 'lineas_ladafon' },
  { row: 10, simbolo: 'p_caseta_ladatel',        tipo: 'CASETA LADATEL',                                valorKey: 'lineas_ladatel' },
  { row: 11, simbolo: 'p_solicitud',             tipo: 'SOLICITUD',                                     valorKey: 'solicitudes' },
  { row: 12, simbolo: 'p_telmex_inf',            tipo: 'INFINITUM',                                     valorKey: 'infinitum' },
  { row: 13, simbolo: 'p_telefono_pslt',         tipo: 'LINEA DE TELEFONO DE TIPO\nRESIDENCIAL (PSLT)', valorKey: 'lineas_pslt' },
  { row: 14, simbolo: 'p_fo_telmex',             tipo: 'FIBRA TELMEX',                                  valorKey: 'fibra_telmex' },
  { row: 15, simbolo: 'p_fo_competencia',        tipo: 'FIBRA COMPETENCIA',                             valorKey: 'fibra_competencia' },
] as const;

// Magik: LoTblContenido = property_list.new_with_properties(:ren, {6,6,...,7,6,6}, :col, {11,9,30})
const ALTURAS_MM: readonly number[] = [6,6,6,6,6,6,6,6,6,6,6,6,7,6,6];
const ANCHOS_MM:  readonly number[] = [11, 9, 30]; // total = 50mm
const MM_PX = 4;                                   // factor de escala para visualización

// ─────────────────────────────────────────────────────────────────────────────
// calcula_datos — lógica de negocio pura (sin React)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Magik: c_resumen_competencia_tvpaga.calcula_datos()
 *
 * 1. Filtra viviendas dentro del límite óptico con Turf.js.
 *    Equivale a: LoTabVivienda.select(predicate.interacts(:location, LoPsa))
 *    OL: vectorSource.getFeaturesInExtent(extent) con ol/extent
 *
 * 2. Itera el inventario de cada vivienda y acumula contadores
 *    por servicio (TELEFONO / TV / INTERNET) y producto.
 */
export function calculaDatos(
  viviendas:    Vivienda[],
  limite:       turf.Feature<turf.Polygon> | null,
  lineasLadatel = 0,  // Magik: LoDis.telefonos_publicos[:|TPTC|]
): ValoresCompetencia {
  const v: ValoresCompetencia = {
    tv_satelital: 0, tv_dish: 0, tv_cable: 0,
    lineas_inalambricas: 0, lineas_ladafon: 0,
    lineas_ladatel,
    infinitum: 0, lineas_cobre: 0, lineas_pslt: 0, solicitudes: 0,
    lineas_competencia_cobre: 0, lineas_competencia_inalambrica: 0,
    telefono_publico_competencia: 0, fibra_telmex: 0, fibra_competencia: 0,
  };

  if (!limite) return v;

  // Magik: LoSelViviendas = LoTabVivienda.select(predicate.interacts(:location, LoPsa))
  const enLimite = viviendas.filter(w =>
    turf.booleanPointInPolygon(w.location, limite),
  );

  for (const vivienda of enLimite) {
    // Magik: _for inv _over LoVivienda.user!_inventario_viviendas.fast_elements()
    for (const inv of vivienda.inventario) {
      const n = inv.cantidad ?? 0;

      if (inv.servicio === 'TELEFONO') {
        switch (inv.producto) {
          case 'LINEAS INALAMBRICAS':             v.lineas_inalambricas            += n; break;
          case 'LINEAS LADAFON':                  v.lineas_ladafon                 += n; break;
          case 'LINEAS COBRE':                    v.lineas_cobre                   += n; break;
          case 'LINEAS PSLT':                     v.lineas_pslt                    += n; break;
          case 'SOLICITUDES':                     v.solicitudes                    += n; break;
          case 'LINEAS COMPETENCIA COBRE':        v.lineas_competencia_cobre       += n; break;
          case 'LINEAS COMPETENCIA INALAMBRICAS': v.lineas_competencia_inalambrica += n; break;
          case 'TELEFONO PUBLICO COMPETENCIA':    v.telefono_publico_competencia   += n; break;
          case 'TELMEX LINEAS FIBRA':             v.fibra_telmex                   += n; break;
          case 'COMPETENCIA LINEAS FIBRA':        v.fibra_competencia              += n; break;
        }

      } else if (inv.servicio === 'TV') {
        // Magik (12/08/10 lunal): DISH se separa de SATELITAL; CABLE suma todos los cableros
        // Tres _if independientes — un mismo item puede incrementar varios contadores
        if (inv.tipo_servicio === 'SATELITAL' && inv.empresa !== 'DISH') v.tv_satelital += n;
        if (inv.empresa === 'DISH')                                       v.tv_dish      += n;
        if (inv.tipo_servicio === 'CABLE')                                v.tv_cable     += n;
        // fibra desde TV — _if/_elif excluyentes
        if      (inv.producto === 'TELMEX LINEAS FIBRA')      v.fibra_telmex      += n;
        else if (inv.producto === 'COMPETENCIA LINEAS FIBRA') v.fibra_competencia += n;

      } else if (inv.servicio === 'INTERNET') {
        switch (inv.producto) {
          case 'INFINITUM':                v.infinitum         += n; break;
          case 'TELMEX LINEAS FIBRA':      v.fibra_telmex      += n; break;
          case 'COMPETENCIA LINEAS FIBRA': v.fibra_competencia += n; break;
        }
      }
    }
  }

  return v;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos mock
// ─────────────────────────────────────────────────────────────────────────────

// Magik: .oDtoOptico.user!_limite — polígono del distrito óptico
export const LIMITE_MOCK: LimiteOptico = {
  id:     'limite-zona-norte',
  nombre: 'Zona Norte — Distrito Centro (CDMX)',
  limite: turf.polygon([[
    [-99.142, 19.437], [-99.130, 19.437],
    [-99.130, 19.428], [-99.142, 19.428],
    [-99.142, 19.437],
  ]]),
};

// Magik: user!_vivienda GIS collection — 6 dentro del límite, 2 fuera
export const MOCK_VIVIENDAS: Vivienda[] = [
  {
    id: 'viv-001',
    location: turf.point([-99.136, 19.433]),
    inventario: [
      { servicio: 'TV',       producto: 'SKY HD',         tipo_servicio: 'SATELITAL', empresa: 'SKY',  cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS COBRE',                                                 cantidad: 1 },
      { servicio: 'INTERNET', producto: 'INFINITUM',                                                    cantidad: 1 },
    ],
  },
  {
    id: 'viv-002',
    location: turf.point([-99.139, 19.430]),
    inventario: [
      { servicio: 'TV',       producto: 'DISH BASICO',    tipo_servicio: 'SATELITAL', empresa: 'DISH', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS INALAMBRICAS',                                          cantidad: 2 },
    ],
  },
  {
    id: 'viv-003',
    location: turf.point([-99.133, 19.435]),
    inventario: [
      { servicio: 'TV',       producto: 'IZZI CABLE',     tipo_servicio: 'CABLE',     empresa: 'IZZI', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS COMPETENCIA COBRE',                                     cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'SOLICITUDES',                                                  cantidad: 1 },
    ],
  },
  {
    id: 'viv-004',
    location: turf.point([-99.140, 19.434]),
    inventario: [
      { servicio: 'TELEFONO', producto: 'LINEAS PSLT',                                                  cantidad: 1 },
      { servicio: 'INTERNET', producto: 'TELMEX LINEAS FIBRA',                                          cantidad: 1 },
    ],
  },
  {
    id: 'viv-005',
    location: turf.point([-99.135, 19.431]),
    inventario: [
      { servicio: 'TV',       producto: 'TELMEX LINEAS FIBRA',                                          cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'TELEFONO PUBLICO COMPETENCIA',                                 cantidad: 2 },
      { servicio: 'TELEFONO', producto: 'LINEAS COMPETENCIA INALAMBRICAS',                              cantidad: 3 },
    ],
  },
  {
    id: 'viv-006',
    location: turf.point([-99.138, 19.432]),
    inventario: [
      { servicio: 'TELEFONO', producto: 'LINEAS LADAFON',                                               cantidad: 1 },
      { servicio: 'INTERNET', producto: 'COMPETENCIA LINEAS FIBRA',                                     cantidad: 1 },
    ],
  },
  // ── Fuera del límite — excluidas por turf.booleanPointInPolygon ──────────────
  {
    id: 'viv-ext-001',
    location: turf.point([-99.150, 19.445]),
    inventario: [
      { servicio: 'TV',       producto: 'SKY HD', tipo_servicio: 'SATELITAL', empresa: 'SKY', cantidad: 99 },
      { servicio: 'INTERNET', producto: 'INFINITUM',                                           cantidad: 99 },
    ],
  },
  {
    id: 'viv-ext-002',
    location: turf.point([-99.125, 19.425]),
    inventario: [
      { servicio: 'TELEFONO', producto: 'LINEAS COBRE', cantidad: 99 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Colores placeholder para símbolos GIS (p_xxx = point styles del framework)
// ─────────────────────────────────────────────────────────────────────────────

const SIMBOLO_COLOR: Record<string, string> = {
  p_predio_deshabitado:    '#9e9e9e',
  p_tv_satelital:          '#ff9800',
  p_tv_dish:               '#e91e63',
  p_tv_por_cable:          '#9c27b0',
  p_operteles:             '#f44336',
  p_operteles_inalambrica: '#ff5722',
  p_telmex_inalambrica:    '#2196f3',
  p_telpub_compet:         '#795548',
  p_caseta_ladafon:        '#4caf50',
  p_caseta_ladatel:        '#8bc34a',
  p_solicitud:             '#ffc107',
  p_telmex_inf:            '#03a9f4',
  p_telefono_pslt:         '#607d8b',
  p_fo_telmex:             '#3f51b5',
  p_fo_competencia:        '#e53935',
};

function SimboloCell({ nombre }: { nombre: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div
        title={nombre}
        style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: SIMBOLO_COLOR[nombre] ?? '#aaa',
          border: '1px solid rgba(0,0,0,0.25)',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini-mapa SVG — visualiza el límite y las viviendas (dentro/fuera)
// En producción: ol/Map + ol/VectorSource + ol/layer/Vector
// ─────────────────────────────────────────────────────────────────────────────

const BBOX_LNG = [-99.155, -99.118] as const;
const BBOX_LAT = [19.419,  19.452 ] as const;
const SVG_W = 260;
const SVG_H = 140;

function lngToX(lng: number) {
  return ((lng - BBOX_LNG[0]) / (BBOX_LNG[1] - BBOX_LNG[0])) * SVG_W;
}
function latToY(lat: number) {
  return SVG_H - ((lat - BBOX_LAT[0]) / (BBOX_LAT[1] - BBOX_LAT[0])) * SVG_H;
}

function MiniMapa({
  viviendas,
  limite,
}: {
  viviendas: Vivienda[];
  limite:    turf.Feature<turf.Polygon> | null;
}) {
  const limitePts = limite
    ? limite.geometry.coordinates[0]
        .map(([lng, lat]) => `${lngToX(lng)},${latToY(lat)}`)
        .join(' ')
    : '';

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', background: '#f0f4f8', borderRadius: 4 }}
    >
      {/* OL: new Feature({ geometry: new Polygon(coords) }) en VectorSource */}
      {limite && (
        <polygon
          points={limitePts}
          fill="rgba(33,150,243,0.12)"
          stroke="#2196f3"
          strokeWidth={1.5}
        />
      )}
      {/* OL: new Feature({ geometry: new Point([lng,lat]) }) */}
      {viviendas.map(v => {
        const [lng, lat] = v.location.geometry.coordinates;
        const inside = limite ? turf.booleanPointInPolygon(v.location, limite) : false;
        return (
          <circle
            key={v.id}
            cx={lngToX(lng)}
            cy={latToY(lat)}
            r={5}
            fill={inside ? '#4caf50' : '#e53935'}
            stroke="#fff"
            strokeWidth={1}
            opacity={0.9}
          >
            <title>{v.id} — {inside ? 'DENTRO' : 'FUERA'}</title>
          </circle>
        );
      })}
      <circle cx={8}  cy={9}  r={4} fill="#4caf50" stroke="#fff" strokeWidth={1} />
      <text   x={15} y={13}  fontSize={8} fill="#333">dentro del límite</text>
      <circle cx={8}  cy={21} r={4} fill="#e53935" stroke="#fff" strokeWidth={1} />
      <text   x={15} y={25}  fontSize={8} fill="#333">fuera del límite</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────────────────────

// Magik: {0.0, 0.2993, 0.0} → RGB(0, 76, 0)
const VERDE = 'rgb(0, 76, 0)';

const TOTAL_W = ANCHOS_MM.reduce((a, b) => a + b, 0) * MM_PX; // 200px
const COL_W   = ANCHOS_MM.map(mm => mm * MM_PX);               // [44, 36, 120]

const cs: Record<string, React.CSSProperties> = {
  wrap:       { fontFamily: 'monospace', fontSize: 12, padding: 16 },
  title:      { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  controls:   { marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 4 },
  sello:      { display: 'inline-block', border: '1px solid #444' },
  tdHeader:   { border: '1px solid #555', padding: '0 3px', textAlign: 'center' as const, fontWeight: 700, color: VERDE, verticalAlign: 'middle' as const },
  tdSym:      { border: '1px solid #555', padding: 0, textAlign: 'center' as const, verticalAlign: 'middle' as const },
  tdLineas:   { border: '1px solid #555', padding: '0 2px', textAlign: 'center' as const, verticalAlign: 'middle' as const },
  tdTipo:     { border: '1px solid #555', padding: '0 3px', textAlign: 'center' as const, color: VERDE, verticalAlign: 'middle' as const, whiteSpace: 'pre-line' as const },
  stats:      { marginTop: 12, background: '#f8f9fa', border: '1px solid #dee2e6', padding: 8, borderRadius: 4, fontSize: 11 },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px 12px', marginTop: 4 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente React principal
// ─────────────────────────────────────────────────────────────────────────────

export function CResumenCompetenciaTvpagaUI() {
  const [useLimite, setUseLimite] = useState(true);
  // Magik: LoDis.telefonos_publicos[:|TPTC|] — viene de c_distrito
  const [ladatel, setLadatel] = useState(3);

  const limite = useLimite ? LIMITE_MOCK.limite : null;

  // Magik: llena_datos_celdas() → calcula_datos()
  const valores = useMemo(
    () => calculaDatos(MOCK_VIVIENDAS, limite, ladatel),
    [limite, ladatel],
  );

  const vivDentro = useMemo(
    () => MOCK_VIVIENDAS.filter(w =>
      limite ? turf.booleanPointInPolygon(w.location, limite) : false,
    ),
    [limite],
  );

  return (
    <div style={cs.wrap}>
      <div style={cs.title}>c_resumen_competencia_tvpaga</div>

      {/* Controles — simulan .oDtoOptico y c_distrito */}
      <div style={cs.controls}>
        <label style={{ fontSize: 11 }}>
          <input
            type="checkbox"
            checked={useLimite}
            onChange={e => setUseLimite(e.target.checked)}
          />
          {' '}Límite óptico: <strong>{LIMITE_MOCK.nombre}</strong>
          {useLimite && (
            <span style={{ color: '#555' }}>
              {' '}— {vivDentro.length}/{MOCK_VIVIENDAS.length} viviendas dentro
            </span>
          )}
        </label>
        <label style={{ fontSize: 11 }}>
          {'Líneas Ladatel (c_distrito → TPTC): '}
          <input
            type="number"
            min={0}
            value={ladatel}
            onChange={e => setLadatel(Number(e.target.value))}
            style={{ width: 60, fontSize: 11 }}
          />
        </label>
      </div>

      {/* Mini-mapa OL-like */}
      <MiniMapa viviendas={MOCK_VIVIENDAS} limite={limite} />

      {/* ── Sello — 3 tablas apiladas verticalmente (configura_tabla) ───────── */}
      <div style={{ marginTop: 12 }}>
        <div style={cs.sello}>

          {/* tbl_titulo — 1×1, 6mm × 50mm */}
          <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
            <tbody>
              <tr>
                <td style={{ ...cs.tdHeader, width: TOTAL_W, height: 6 * MM_PX, fontSize: 13 }}>
                  LINEAS COMP. Y T.V. DE PAGA
                </td>
              </tr>
            </tbody>
          </table>

          {/* tbl_titulo2 — 1×3, 6mm × [11,9,30]mm */}
          <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
            <colgroup>
              {COL_W.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <tbody>
              <tr style={{ height: 6 * MM_PX }}>
                <td style={cs.tdHeader}>SIMBOLO</td>
                <td style={cs.tdHeader}>LINEAS</td>
                <td style={cs.tdHeader}>TIPO</td>
              </tr>
            </tbody>
          </table>

          {/* tbl_contenido — 15×3, alturas variables */}
          <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
            <colgroup>
              {COL_W.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <tbody>
              {FILAS_CONTENIDO.map((fila, idx) => {
                const h       = ALTURAS_MM[idx] * MM_PX;
                const lineas  = fila.valorKey !== null ? valores[fila.valorKey] : '';
                return (
                  <tr key={fila.row} style={{ height: h }}>
                    <td style={{ ...cs.tdSym,    height: h }}>
                      <SimboloCell nombre={fila.simbolo} />
                    </td>
                    <td style={{ ...cs.tdLineas, height: h }}>
                      {lineas !== '' ? lineas : ''}
                    </td>
                    <td style={{ ...cs.tdTipo,   height: h }}>
                      {fila.tipo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </div>

      {/* Panel de valores calculados */}
      <div style={cs.stats}>
        <strong>Valores calculados — calcula_datos()</strong>
        <div style={cs.statsGrid}>
          {(Object.entries(valores) as [keyof ValoresCompetencia, number][]).map(([k, val]) => (
            <div key={k}>
              <span style={{ color: '#666' }}>{k}:</span>{' '}
              <span style={{ fontWeight: val > 0 ? 700 : 400, color: val > 0 ? '#155724' : '#999' }}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CResumenCompetenciaTvpagaUI;
