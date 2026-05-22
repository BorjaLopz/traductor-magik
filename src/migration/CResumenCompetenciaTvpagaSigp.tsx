import React, { useMemo, useState } from 'react';
import * as turf from '@turf/turf';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventarioVivienda {
  servicio:       'TELEFONO' | 'TV' | 'INTERNET';
  producto:       string;
  tipo_servicio?: string;
  empresa?:       string;
  cantidad:       number;
}

export interface Vivienda {
  id:         string;
  location:   turf.Feature<turf.Point>;  // Magik: LoVivienda.location
  inventario: InventarioVivienda[];      // Magik: user!_inventario_viviendas
}

// Magik: .oDtoOptico.inventario_datos_sin_ubicacion — contadores sin geometría asociada
export interface DatosSinUbicacion {
  ganancia_comercial:           number;   // :|GANANCIA COMERCIAL|
  clientes_existentes_datos_sd: number;   // :|CLIENTES EXISTENTES DE DATOS SIN DOMICILIO|
  solicitudes_p_s_d:            number;   // :|SOLICITUDES PENDIENTES SIN DOMICILIO|
  solicitudes:                  number;   // :|SOLICITUDES| — sobreescribe el loop de viviendas
  lineas_cobre:                 number;   // :|LINEAS COBRE| — tracking interno, no mostrado
  infinitum:                    number;   // :|INFINITUM| (bug original: [:INFINITUM] uppercase)
}

// Magik: lo_valores — 15 contadores (defined_attributes: :integer, :default_value, 0)
export interface ValoresSigp {
  baldio:                       number;   // LoDis.numero_baldios
  tv_satelital:                 number;
  tv_cable:                     number;
  opertel:                      number;   // lineas_competencia_cobre renombrado
  opertel_inalambrica:          number;   // lineas_competencia_inalambricas renombrado
  lineas_inalambricas:          number;
  telefono_publico_competencia: number;
  lineas_ladatel:               number;   // LoDis.telefonos_publicos[TPTC] — casetas
  tv_dish:                      number;
  lineas_ftth:                  number;   // fibra_telmex renombrado
  infinitum:                    number;   // clientes_existentes_datos
  solicitudes:                  number;
  ganancia_comercial:           number;
  clientes_existentes_datos_sd: number;
  solicitudes_p_s_d:            number;
}

// Magik: attributes[Propiedad].value > 0 → override manual del usuario
export type ValoresSigpOverrides = Partial<ValoresSigp>;

// ─── Table row config ─────────────────────────────────────────────────────────
// Magik: etiqueta_celdas() + llena_datos_celdas()
// Diferencia vs [86]: cols [11,30,9] = SIMBOLO|DESCRIPCION|CANT (vs [11,9,30] en [86])

interface FilaContenido {
  row:      number;
  simbolo:  string;
  desc:     string;
  valorKey: keyof ValoresSigp;
}

const FILAS_CONTENIDO: readonly FilaContenido[] = [
  { row:  1, simbolo: 'p_predio_deshabitado',    desc: 'PREDIO BALDIO',                                     valorKey: 'baldio' },
  { row:  2, simbolo: 'p_tv_satelital',          desc: 'TELEVISION SATELITAL',                              valorKey: 'tv_satelital' },
  { row:  3, simbolo: 'p_tv_por_cable',          desc: 'SERVICIO DE CABLE',                                 valorKey: 'tv_cable' },
  { row:  4, simbolo: 'p_operteles',             desc: 'OPERTEL',                                           valorKey: 'opertel' },
  { row:  5, simbolo: 'p_operteles_inalambrica', desc: 'INALAMBRICA OPERTELES',                             valorKey: 'opertel_inalambrica' },
  { row:  6, simbolo: 'p_telmex_inalambrica',    desc: 'INALAMBRICA CONS/SOLIC',                            valorKey: 'lineas_inalambricas' },
  { row:  7, simbolo: 'p_telpub_compet',         desc: 'TEL/PUB COMPET.',                                   valorKey: 'telefono_publico_competencia' },
  { row:  8, simbolo: 'p_caseta_con_solic',      desc: 'CASETA CONS/SOLIC',                                 valorKey: 'lineas_ladatel' },
  { row:  9, simbolo: 'p_tv_dish',               desc: 'TELEVISION SATELITAL DISH',                         valorKey: 'tv_dish' },
  { row: 10, simbolo: 'p_fo_telmex',             desc: 'LINEAS FTTH EXISTENTES\nCONCESIONARIO SOLICITANTE', valorKey: 'lineas_ftth' },
  { row: 11, simbolo: 'p_datos',                 desc: 'CLIENTES EXISTENTES DE DATOS',                      valorKey: 'infinitum' },
  { row: 12, simbolo: 'p_solicitudes_p',         desc: 'SOLICITUDES PENDIENTES',                            valorKey: 'solicitudes' },
  { row: 13, simbolo: 'p_ganancia',              desc: 'GANANCIA COMERCIAL',                                valorKey: 'ganancia_comercial' },
  { row: 14, simbolo: 'p_datos_sin_dom',         desc: 'CLIENTES EXISTENTES DE DATOS\nSIN DOMICILIO',       valorKey: 'clientes_existentes_datos_sd' },
  { row: 15, simbolo: 'p_solic_sin_dom',         desc: 'SOLICITUDES PENDIENTES\nSIN DOMICILIO',             valorKey: 'solicitudes_p_s_d' },
];

// Magik: :ren = {6×12,7,6×2}, :col = {11,30,9} — diferencia clave vs [86]: DESCRIPCION+CANT invertidos
const ALTURAS_MM: readonly number[] = [6,6,6,6,6,6,6,6,6,6,6,6,7,6,6];
const ANCHOS_MM:  readonly number[] = [11, 30, 9];
const MM_PX = 4;
const TOTAL_W = ANCHOS_MM.reduce((a, b) => a + b, 0) * MM_PX; // 200px
const COL_W   = ANCHOS_MM.map(mm => mm * MM_PX);              // [44, 120, 36]

// ─── Core logic ───────────────────────────────────────────────────────────────

/**
 * Magik: calcula_datos()
 *
 * Pipeline de tres fases:
 * 1. Loop de viviendas dentro del límite (predicate.interacts → Turf.js)
 * 2. Merge con inventario_datos_sin_ubicacion (reemplaza solicitudes e infinitum)
 * 3. info_sello_propiedades → valor_propiedad: overrides manuales > 0
 */
export function calculaDatos(
  viviendas:    Vivienda[],
  limite:       turf.Feature<turf.Polygon> | null,
  lineasLadatel: number,        // Magik: LoDis.telefonos_publicos[TPTC]
  baldio:        number,         // Magik: LoDis.numero_baldios
  datos:         DatosSinUbicacion,
  overrides:     ValoresSigpOverrides = {},
): ValoresSigp {
  const v: ValoresSigp = {
    baldio,
    tv_satelital: 0, tv_cable: 0,
    opertel: 0, opertel_inalambrica: 0,
    lineas_inalambricas: 0,
    telefono_publico_competencia: 0,
    lineas_ladatel: lineasLadatel,
    tv_dish: 0, lineas_ftth: 0, infinitum: 0, solicitudes: 0,
    ganancia_comercial: 0,
    clientes_existentes_datos_sd: 0,
    solicitudes_p_s_d: 0,
  };

  if (limite) {
    // Magik: LoSelViviendas = LoTabVivienda.select(predicate.interacts(:location, LoPsa))
    for (const w of viviendas.filter(w => turf.booleanPointInPolygon(w.location, limite))) {
      for (const inv of w.inventario) {
        const n = inv.cantidad ?? 0;

        if (inv.servicio === 'TELEFONO') {
          switch (inv.producto) {
            case 'LINEAS INALAMBRICAS':             v.lineas_inalambricas            += n; break;
            case 'LINEAS COMPETENCIA COBRE':        v.opertel                        += n; break;
            case 'LINEAS COMPETENCIA INALAMBRICAS': v.opertel_inalambrica            += n; break;
            case 'TELEFONO PUBLICO COMPETENCIA':    v.telefono_publico_competencia   += n; break;
            case 'TELMEX LINEAS FIBRA':             v.lineas_ftth                    += n; break;
            case 'SOLICITUDES':                     v.solicitudes                    += n; break;
            // COMPETENCIA LINEAS FIBRA: comentada en el original (no se acumula)
          }
        } else if (inv.servicio === 'TV') {
          // Magik (12/08/10 lunal): DISH separado de SATELITAL; CABLE suma todos los operadores
          if (inv.tipo_servicio === 'SATELITAL' && inv.empresa !== 'DISH') v.tv_satelital += n;
          if (inv.empresa === 'DISH')                                       v.tv_dish      += n;
          if (inv.tipo_servicio === 'CABLE')                                v.tv_cable     += n;
          if      (inv.producto === 'TELMEX LINEAS FIBRA')      v.lineas_ftth += n;
        } else if (inv.servicio === 'INTERNET') {
          if (inv.producto === 'INFINITUM')           v.infinitum   += n;
          if (inv.producto === 'TELMEX LINEAS FIBRA') v.lineas_ftth += n;
        }
      }
    }
  }

  // Magik: datos = .oDtoOptico.inventario_datos_sin_ubicacion
  // Las claves comentadas en el original (#) no sobreescriben el loop.
  // Las activas reemplazan COMPLETAMENTE el valor calculado.
  v.ganancia_comercial           = datos.ganancia_comercial;
  v.clientes_existentes_datos_sd = datos.clientes_existentes_datos_sd;
  v.solicitudes_p_s_d            = datos.solicitudes_p_s_d;
  v.solicitudes                  = datos.solicitudes;   // overrides vivienda-loop
  v.infinitum                    = datos.infinitum;     // Magik bug: [:INFINITUM] uppercase → corregido

  // Magik: info_sello_propiedades() / valor_propiedad()
  return aplicarOverrides(v, overrides);
}

/**
 * Magik: valor_propiedad(Propiedad, dato_actual) + info_sello_propiedades(lo_valores)
 * Si _self.attributes[prop].value > 0 → usa ese valor en lugar del calculado.
 */
export function aplicarOverrides(calculado: ValoresSigp, ov: ValoresSigpOverrides): ValoresSigp {
  const r = { ...calculado };
  for (const k of Object.keys(ov) as (keyof ValoresSigp)[]) {
    const val = ov[k];
    if (val !== undefined && val > 0) r[k] = val;
  }
  return r;
}

// ─── Constante documentada del Magik ─────────────────────────────────────────
// Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
export const ALLOWED_ON_MENU = false;

// ─── Mock data ────────────────────────────────────────────────────────────────

export const LIMITE_MOCK = turf.polygon([[
  [-99.142, 19.437], [-99.130, 19.437],
  [-99.130, 19.428], [-99.142, 19.428],
  [-99.142, 19.437],
]]);

export const MOCK_VIVIENDAS: Vivienda[] = [
  {
    id: 'viv-001', location: turf.point([-99.136, 19.433]),
    inventario: [
      { servicio: 'TV',       producto: 'SKY HD',      tipo_servicio: 'SATELITAL', empresa: 'SKY', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS INALAMBRICAS', cantidad: 2 },
      { servicio: 'INTERNET', producto: 'INFINITUM', cantidad: 1 },
    ],
  },
  {
    id: 'viv-002', location: turf.point([-99.139, 19.430]),
    inventario: [
      { servicio: 'TV',       producto: 'DISH',        tipo_servicio: 'SATELITAL', empresa: 'DISH', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS COMPETENCIA COBRE', cantidad: 1 },
    ],
  },
  {
    id: 'viv-003', location: turf.point([-99.133, 19.435]),
    inventario: [
      { servicio: 'TV',       producto: 'IZZI',        tipo_servicio: 'CABLE', empresa: 'IZZI', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'LINEAS COMPETENCIA INALAMBRICAS', cantidad: 3 },
      { servicio: 'TELEFONO', producto: 'SOLICITUDES', cantidad: 2 },
    ],
  },
  {
    id: 'viv-004', location: turf.point([-99.140, 19.434]),
    inventario: [
      { servicio: 'TELEFONO', producto: 'TELEFONO PUBLICO COMPETENCIA', cantidad: 1 },
      { servicio: 'INTERNET', producto: 'TELMEX LINEAS FIBRA', cantidad: 2 },
    ],
  },
  {
    id: 'viv-005', location: turf.point([-99.135, 19.431]),
    inventario: [
      { servicio: 'TV',       producto: 'TELMEX LINEAS FIBRA', cantidad: 1 },
      { servicio: 'TELEFONO', producto: 'TELMEX LINEAS FIBRA', cantidad: 1 },
    ],
  },
  // fuera del límite — excluidas
  {
    id: 'viv-ext-001', location: turf.point([-99.150, 19.445]),
    inventario: [{ servicio: 'TV', producto: 'SKY HD', tipo_servicio: 'SATELITAL', empresa: 'SKY', cantidad: 99 }],
  },
  {
    id: 'viv-ext-002', location: turf.point([-99.125, 19.425]),
    inventario: [{ servicio: 'TELEFONO', producto: 'LINEAS COMPETENCIA COBRE', cantidad: 99 }],
  },
];

// Magik: .oDtoOptico.inventario_datos_sin_ubicacion — datos del distrito sin geometría
export const MOCK_DATOS_SIN_UB: DatosSinUbicacion = {
  ganancia_comercial:           5,
  clientes_existentes_datos_sd: 3,
  solicitudes_p_s_d:            2,
  solicitudes:                  8,   // sobreescribe la acumulación del loop
  lineas_cobre:                 12,  // tracking interno
  infinitum:                    15,  // sobreescribe el loop
};

// ─── Symbol colors ────────────────────────────────────────────────────────────

const SIMBOLO_COLOR: Record<string, string> = {
  p_predio_deshabitado:    '#9e9e9e',
  p_tv_satelital:          '#ff9800',
  p_tv_por_cable:          '#9c27b0',
  p_operteles:             '#f44336',
  p_operteles_inalambrica: '#ff5722',
  p_telmex_inalambrica:    '#2196f3',
  p_telpub_compet:         '#795548',
  p_caseta_con_solic:      '#8bc34a',
  p_tv_dish:               '#e91e63',
  p_fo_telmex:             '#3f51b5',
  p_datos:                 '#03a9f4',
  p_solicitudes_p:         '#ffc107',
  p_ganancia:              '#009688',
  p_datos_sin_dom:         '#607d8b',
  p_solic_sin_dom:         '#78909c',
};

function SimboloCell({ nombre }: { nombre: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div
        title={nombre}
        style={{
          width: 10, height: 10, borderRadius: '50%',
          background: SIMBOLO_COLOR[nombre] ?? '#aaa',
          border: '1px solid rgba(0,0,0,0.2)', flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── Mini-mapa SVG ────────────────────────────────────────────────────────────

const BBOX_LNG = [-99.155, -99.118] as const;
const BBOX_LAT = [19.419,  19.452 ] as const;
const SVG_W = 240, SVG_H = 130;

function lngToX(lng: number) {
  return ((lng - BBOX_LNG[0]) / (BBOX_LNG[1] - BBOX_LNG[0])) * SVG_W;
}
function latToY(lat: number) {
  return SVG_H - ((lat - BBOX_LAT[0]) / (BBOX_LAT[1] - BBOX_LAT[0])) * SVG_H;
}

function MiniMapa({ limite, viviendas }: {
  limite:    turf.Feature<turf.Polygon> | null;
  viviendas: Vivienda[];
}) {
  const pts = limite
    ? limite.geometry.coordinates[0]
        .map(([lng, lat]) => `${lngToX(lng)},${latToY(lat)}`).join(' ')
    : '';
  return (
    <svg width={SVG_W} height={SVG_H} style={{ display: 'block', background: '#f0f4f8', borderRadius: 4 }}>
      {limite && <polygon points={pts} fill="rgba(33,150,243,0.12)" stroke="#2196f3" strokeWidth={1.5} />}
      {viviendas.map(v => {
        const [lng, lat] = v.location.geometry.coordinates;
        const ins = limite ? turf.booleanPointInPolygon(v.location, limite) : false;
        return (
          <circle key={v.id} cx={lngToX(lng)} cy={latToY(lat)} r={5}
            fill={ins ? '#4caf50' : '#e53935'} stroke="#fff" strokeWidth={1} opacity={0.9}>
            <title>{v.id} — {ins ? 'DENTRO' : 'FUERA'}</title>
          </circle>
        );
      })}
      <circle cx={8} cy={9}  r={4} fill="#4caf50" stroke="#fff" strokeWidth={1} />
      <text   x={15} y={13} fontSize={8} fill="#333">dentro</text>
      <circle cx={8} cy={21} r={4} fill="#e53935" stroke="#fff" strokeWidth={1} />
      <text   x={15} y={25} fontSize={8} fill="#333">fuera</text>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const NEGRO = '#000';
const VERDE = 'rgb(0,76,0)';  // Magik: {0,0.2993,0}

const cs: Record<string, React.CSSProperties> = {
  wrap:     { fontFamily: 'monospace', fontSize: 12, padding: 16 },
  title:    { fontSize: 14, fontWeight: 700, marginBottom: 10 },
  layout:   { display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' },
  controls: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 },
  panel:    { border: '1px solid #dee2e6', borderRadius: 4, padding: 8, background: '#f8f9fa' },
  ptitle:   { fontSize: 11, fontWeight: 700, marginBottom: 6 },
  row:      { display: 'flex', gap: 8, flexWrap: 'wrap' },
  fitem:    { display: 'flex', flexDirection: 'column', gap: 1 },
  lbl:      { fontSize: 10, color: '#555' },
  inp:      { width: 70, fontSize: 11, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 2 },
  inpWide:  { width: 100, fontSize: 11, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 2 },
  sello:    { display: 'inline-block', border: '1px solid #444' },
  tdHdr:    { border: '1px solid #555', padding: '0 3px', textAlign: 'center' as const, fontWeight: 700, color: NEGRO, verticalAlign: 'middle' as const },
  tdSym:    { border: '1px solid #555', padding: 0, textAlign: 'center' as const, verticalAlign: 'middle' as const },
  tdDesc:   { border: '1px solid #555', padding: '0 3px', textAlign: 'center' as const, color: VERDE, verticalAlign: 'middle' as const, whiteSpace: 'pre-line' as const },
  tdCant:   { border: '1px solid #555', padding: '0 2px', textAlign: 'center' as const, color: VERDE, verticalAlign: 'middle' as const },
  stats:    { marginTop: 10, background: '#f8f9fa', border: '1px solid #dee2e6', padding: 8, borderRadius: 4, fontSize: 11 },
  grid3:    { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px 10px', marginTop: 4 },
  ovSource: { fontSize: 10, color: '#888', fontStyle: 'italic' },
};

// ─── Número de campo editable ─────────────────────────────────────────────────

function NumField({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={cs.fitem}>
      <span style={cs.lbl}>{label}</span>
      <input type="number" min={0} style={cs.inp}
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

// ─── Panel de overrides (info_sello_propiedades) ──────────────────────────────

const OVERRIDE_LABELS: { key: keyof ValoresSigp; label: string }[] = [
  { key: 'baldio',                       label: 'PREDIO BALDIO' },
  { key: 'tv_satelital',                 label: 'TV SATELITAL' },
  { key: 'tv_cable',                     label: 'TV CABLE' },
  { key: 'opertel',                      label: 'OPERTEL' },
  { key: 'opertel_inalambrica',          label: 'OP. INALAMB' },
  { key: 'lineas_inalambricas',          label: 'INALAMB. C/S' },
  { key: 'telefono_publico_competencia', label: 'TEL PUB COMP' },
  { key: 'lineas_ladatel',               label: 'CASETA C/S' },
  { key: 'tv_dish',                      label: 'TV DISH' },
  { key: 'lineas_ftth',                  label: 'FTTH' },
  { key: 'infinitum',                    label: 'CL.DATOS' },
  { key: 'solicitudes',                  label: 'SOLICITUDES' },
  { key: 'ganancia_comercial',           label: 'GANANCIA' },
  { key: 'clientes_existentes_datos_sd', label: 'DATOS S/D' },
  { key: 'solicitudes_p_s_d',            label: 'SOLIC. S/D' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function CResumenCompetenciaTvpagaSigpUI() {
  const [useLimite,  setUseLimite]  = useState(true);
  const [baldio,     setBaldio]     = useState(4);    // LoDis.numero_baldios
  const [ladatel,    setLadatel]    = useState(3);    // LoDis.telefonos_publicos[TPTC]
  const [showOv,     setShowOv]     = useState(false);

  // Magik: .oDtoOptico.inventario_datos_sin_ubicacion
  const [datos, setDatos] = useState<DatosSinUbicacion>({ ...MOCK_DATOS_SIN_UB });

  // Magik: _self.attributes[Propiedad].value → overrides manuales
  const [overrides, setOverrides] = useState<ValoresSigpOverrides>({});

  const limite = useLimite ? LIMITE_MOCK : null;

  // Magik: llena_datos_celdas() → calcula_datos()
  const valores = useMemo(
    () => calculaDatos(MOCK_VIVIENDAS, limite, ladatel, baldio, datos, overrides),
    [limite, ladatel, baldio, datos, overrides],
  );

  const vivDentro = MOCK_VIVIENDAS.filter(w =>
    limite ? turf.booleanPointInPolygon(w.location, limite) : false,
  );

  function setDato(key: keyof DatosSinUbicacion, val: number) {
    setDatos(prev => ({ ...prev, [key]: val }));
  }
  function setOverride(key: keyof ValoresSigp, val: number) {
    setOverrides(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div style={cs.wrap}>
      <div style={cs.title}>
        c_resumen_competencia_tvpaga_sigp
        <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 8, color: '#888' }}>
          [allowed_on_menu = false]
        </span>
      </div>

      <div style={cs.layout}>
        {/* ── Controles ─────────────────────────────────────────── */}
        <div style={cs.controls}>

          {/* Límite + distrito */}
          <div style={cs.panel}>
            <div style={cs.ptitle}>Límite óptico / c_distrito</div>
            <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              <input type="checkbox" checked={useLimite}
                onChange={e => setUseLimite(e.target.checked)} />
              {' '}Polígono límite activo
              {useLimite && <span style={{ color: '#555' }}> ({vivDentro.length}/{MOCK_VIVIENDAS.length} viv.)</span>}
            </label>
            <div style={cs.row}>
              <NumField label="Baldíos (LoDis)" value={baldio} onChange={setBaldio} />
              <NumField label="Casetas TPTC"    value={ladatel} onChange={setLadatel} />
            </div>
          </div>

          {/* Datos sin ubicación */}
          <div style={cs.panel}>
            <div style={cs.ptitle}>inventario_datos_sin_ubicacion</div>
            <div style={cs.row}>
              <NumField label="Ganancia com." value={datos.ganancia_comercial}
                onChange={v => setDato('ganancia_comercial', v)} />
              <NumField label="Datos S/D" value={datos.clientes_existentes_datos_sd}
                onChange={v => setDato('clientes_existentes_datos_sd', v)} />
              <NumField label="Solic. S/D" value={datos.solicitudes_p_s_d}
                onChange={v => setDato('solicitudes_p_s_d', v)} />
              <NumField label="Solicitudes*" value={datos.solicitudes}
                onChange={v => setDato('solicitudes', v)} />
              <NumField label="Infinitum*" value={datos.infinitum}
                onChange={v => setDato('infinitum', v)} />
            </div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
              * sobreescribe el total del loop de viviendas
            </div>
          </div>

          {/* Overrides de atributos — info_sello_propiedades */}
          <div style={cs.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={cs.ptitle}>Overrides (valor_propiedad)</div>
              <button style={{ fontSize: 10, padding: '1px 6px' }}
                onClick={() => setShowOv(v => !v)}>
                {showOv ? '▲' : '▼'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: showOv ? 6 : 0 }}>
              Si valor &gt; 0 → sobreescribe el calculado
            </div>
            {showOv && (
              <div style={cs.row}>
                {OVERRIDE_LABELS.map(({ key, label }) => (
                  <div key={key} style={cs.fitem}>
                    <span style={cs.lbl}>{label}</span>
                    <input type="number" min={0} style={cs.inp}
                      value={overrides[key] ?? 0}
                      onChange={e => setOverride(key, Number(e.target.value))} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mini-mapa */}
          <MiniMapa limite={limite} viviendas={MOCK_VIVIENDAS} />
        </div>

        {/* ── Sello — 3 tablas apiladas ─────────────────────────── */}
        <div>
          <div style={cs.sello}>
            {/* tbl_titulo — 1×1, 6mm × 50mm, texto negro (color: {0,0,0}) */}
            <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
              <tbody>
                <tr>
                  <td style={{ ...cs.tdHdr, width: TOTAL_W, height: 6 * MM_PX, fontSize: 13 }}>
                    SIMBOLOGIA
                  </td>
                </tr>
              </tbody>
            </table>

            {/* tbl_titulo2 — 1×3, 6mm × [11,30,9]mm */}
            <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
              <colgroup>
                {COL_W.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <tbody>
                <tr style={{ height: 6 * MM_PX }}>
                  <td style={cs.tdHdr}>SIMBOLO</td>
                  <td style={cs.tdHdr}>DESCRIPCION</td>
                  <td style={cs.tdHdr}>CANT</td>
                </tr>
              </tbody>
            </table>

            {/* tbl_contenido — 15×3 */}
            <table style={{ borderCollapse: 'collapse', width: TOTAL_W }}>
              <colgroup>
                {COL_W.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <tbody>
                {FILAS_CONTENIDO.map((fila, idx) => {
                  const h   = ALTURAS_MM[idx] * MM_PX;
                  const val = valores[fila.valorKey];
                  const ovKey = fila.valorKey;
                  const isOverridden = (overrides[ovKey] ?? 0) > 0;
                  return (
                    <tr key={fila.row} style={{ height: h }}>
                      <td style={{ ...cs.tdSym, height: h }}>
                        <SimboloCell nombre={fila.simbolo} />
                      </td>
                      <td style={{ ...cs.tdDesc, height: h }}>
                        {fila.desc}
                      </td>
                      <td style={{
                        ...cs.tdCant, height: h,
                        fontWeight: isOverridden ? 700 : 'normal',
                        background: isOverridden ? '#fff9c4' : 'white',
                      }}>
                        {val}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Panel de valores */}
          <div style={cs.stats}>
            <strong>calcula_datos() — resultados</strong>
            <div style={cs.grid3}>
              {(Object.entries(valores) as [keyof ValoresSigp, number][]).map(([k, v]) => {
                const isOv = (overrides[k] ?? 0) > 0;
                return (
                  <div key={k}>
                    <span style={{ color: '#666' }}>{k}: </span>
                    <span style={{ fontWeight: v > 0 ? 700 : 400, color: isOv ? '#856404' : (v > 0 ? '#155724' : '#999') }}>
                      {v}
                    </span>
                    {isOv && <span style={cs.ovSource}> (override)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CResumenCompetenciaTvpagaSigpUI;
