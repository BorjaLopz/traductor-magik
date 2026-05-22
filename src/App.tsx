import React, { useEffect, useState } from 'react';
import * as turf from '@turf/turf';

// ─── Imports de componentes migrados ──────────────────────────────────────────
// [01] c_arbol_distritos_para_ruta
import { ArbolDistritosUI }        from './migration/ArbolDistritosParaRuta';
import { mockGisService }          from './migration/mockGisService';
// [02] c_seccionamiento
import Seccionamiento              from './migration/Seccionamiento';
import type { Vista }              from './migration/Seccionamiento';
// [03] ruta_opbs_plugin
import RutaOpbsPluginUI            from './migration/RutaOpbsPlugin';
import type { COpbsService }       from './migration/RutaOpbsPlugin';
// [04] c_sectores
import { SectoresUI }              from './migration/Sectores';
// [05] c_elemento_empalme_g
import { ElementoEmpalmeGUI }      from './migration/ElementoEmpalmeG';
// [06] c_elemento_seccion_g
import { ElementoSeccionGUI }      from './migration/ElementoSeccionG';
// [07] c_elemento_nodo_g
import { ElementoNodoGUI }         from './migration/ElementoNodoG';
// [08] c_creador_elemento_tramo_g
import { CreadorElementoTramoGUI } from './migration/CreadorElementoTramoG';
// [09] viewport_layout_mixin
import { ViewportLayoutMixinUI }   from './migration/ViewportLayoutMixin';
// [10] c_texto_linea_grafico
import { TextoLineaGraficoUI }     from './migration/TextoLineaGrafico';
// [11] layout_plot_engine.centraliza_launch
import { LayoutPlotEngineUI }      from './migration/LayoutPlotEngine';
// [12] c_titulo_de_plano
import { TituloDePlanoUI }         from './migration/TituloDePlano';
// [13] c_sello_simbologia_diagrama_empalmes
import { SelloSimbologiaDiagramaEmpallesUI } from './migration/SelloSimbologiaDiagramaEmpalmes';
// [14] c_sello_notas_sct_inst_puente
import { SelloNotasSctInstPuenteUI } from './migration/SelloNotasSctInstPuente';
// [15] c_sello_notas_sct_marg_sub
import { SelloNotasSctMargSubUI } from './migration/SelloNotasSctMargSub';
// [16] c_sello_simbologia_red_sec
import { SelloSimbologiaRedSecUI } from './migration/SelloSimbologiaRedSec';
// [17] c_sello_capacidad_cable
import { SelloCapacidadCableUI }   from './migration/SelloCapacidadCable';
// [18] c_simbologia_plano_reubicacion_terminales
import { SimbologiaPlanoReubicacionTerminalesUI } from './migration/SimbologiaPlanoReubicacionTerminales';
// [19] c_vp_detalle_interno_edificio
import { VpDetalleInternoEdificioUI }             from './migration/VpDetalleInternoEdificio';
// [20] c_sello_competencia_telmex
import { SelloCompetenciaTelmexUI }               from './migration/SelloCompetenciaTelmex';
// [21] c_imagen_bmp
import { CImagenBmpUI }                           from './migration/CImagenBmp';
// [22] c_croquis
import { CCroquisUI }                             from './migration/CCroquis';
// [23] c_sello_estandar_ctl
import { SelloEstandarCtlUI }                     from './migration/SelloEstandarCtl';
// [24] c_vp_croquis_proy_can
import { VpCroquisProyCanUI }                     from './migration/VpCroquisProyCan';
// [25] c_sello_aumentos_secundarios
import { SelloAumentosSecundariosUI }             from './migration/SelloAumentosSecundarios';
// [26] c_fila
import { CFilaUI }                               from './migration/CFila';
// [27] c_tabla_georeferencia
import { CTablaGeoreferenciaUI }                 from './migration/CTablaGeoreferencia';
// [28] c_cfg_bloque_titdet_editable_mixin
import { CfgBloqueTitdetEditableMixinUI }        from './migration/CfgBloqueTitdetEditableMixin';
// NOTA: al añadir una nueva migración, agregar su import aquí y una entrada en DEMO_ITEMS.

// =============================================================================
// [01] Demo — c_arbol_distritos_para_ruta
// =============================================================================
function DemoArbolDistritos() {
  const [visible, setVisible] = useState(true);
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_arbol_distritos_para_ruta</h3>
      {visible ? (
        <ArbolDistritosUI gisService={mockGisService} onClose={() => setVisible(false)} />
      ) : (
        <div>
          <p style={s.meta}>Componente cerrado.</p>
          <button onClick={() => setVisible(true)}>Reabrir</button>
        </div>
      )}
    </section>
  );
}

// =============================================================================
// [02] Demo — c_seccionamiento
// =============================================================================
const LINE_PRUEBA = turf.lineString([
  [440000, 4474000],
  [440120, 4474050],
  [440280, 4474020],
  [440450, 4474080],
  [440600, 4474010],
]);
const SEC_PARAMS = {
  nEscala     : 500,
  nMinModulos : 1,
  nMaxModulos : 5,
  nDefModAncho: 0.297,
  nDefModAlto : 0.210,
};
const rad2deg  = (r: number) => ((r * 180) / Math.PI).toFixed(1) + '°';
const coordStr = (coords: number[][]) =>
  coords.map(([x, y]) => `(${Math.round(x)}, ${Math.round(y)})`).join(' → ');

function DemoSeccionamiento() {
  const [vistas, setVistas] = useState<Vista[]>([]);

  useEffect(() => {
    const sec = new Seccionamiento(
      SEC_PARAMS.nEscala, SEC_PARAMS.nMinModulos, SEC_PARAMS.nMaxModulos,
      SEC_PARAMS.nDefModAncho, SEC_PARAMS.nDefModAlto,
    );
    sec.doSeccionamiento(LINE_PRUEBA);
    setVistas(sec.getSeccionamiento());
  }, []);

  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_seccionamiento</h3>
      <p style={s.meta}>
        Escala 1:{SEC_PARAMS.nEscala} · módulo {SEC_PARAMS.nDefModAncho * SEC_PARAMS.nEscala} ×{' '}
        {SEC_PARAMS.nDefModAlto * SEC_PARAMS.nEscala} m ·{' '}
        min {SEC_PARAMS.nMinModulos} / max {SEC_PARAMS.nMaxModulos} módulos
      </p>
      <p style={s.meta}>Línea prueba: {coordStr(LINE_PRUEBA.geometry.coordinates)}</p>
      {vistas.length === 0 ? (
        <p style={s.meta}>Sin vistas (línea demasiado corta o parámetros fuera de rango).</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['Vista', 'Módulos', 'Ángulo', 'Coords geom (inicio → fin)', 'Área bbox (primer punto)'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vistas.map((v, i) => {
              const geomCoords = v.geom.geometry.coordinates;
              const areaCoords = v.area.geometry.coordinates[0];
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f8f8' : '#fff' }}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{v.modulos}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{rad2deg(v.angulo)}</td>
                  <td style={s.td}>
                    ({Math.round(geomCoords[0][0])}, {Math.round(geomCoords[0][1])}) →{' '}
                    ({Math.round(geomCoords[geomCoords.length - 1][0])},{' '}
                     {Math.round(geomCoords[geomCoords.length - 1][1])})
                  </td>
                  <td style={s.td}>
                    ({Math.round(areaCoords[0][0])}, {Math.round(areaCoords[0][1])})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

// =============================================================================
// [03] Demo — ruta_opbs_plugin
// =============================================================================
const mockCOpbsService: COpbsService = {
  openDialog : (ruta, opb) => console.log('[COpbs] openDialog', ruta?.numero, opb?.nombre),
  closeDialog: ()          => console.log('[COpbs] closeDialog'),
  clearCache : ()          => console.log('[COpbs] clearCache'),
};

function DemoRutaOpbsPlugin() {
  const [visible, setVisible] = useState(true);
  return (
    <section style={s.section}>
      <h3 style={s.h3}>ruta_opbs_plugin</h3>
      {visible ? (
        <RutaOpbsPluginUI
          cOpbsService={mockCOpbsService}
          initialRuta={{ id: 'RC-001', numero: 'RC-2024-001' }}
          initialOpb={null}
        />
      ) : (
        <div>
          <p style={{ color: '#888', fontSize: 12 }}>Plugin cerrado.</p>
          <button onClick={() => setVisible(true)}>Reabrir</button>
        </div>
      )}
    </section>
  );
}

// =============================================================================
// [05] Demo — c_elemento_empalme_g
// =============================================================================
function DemoElementoEmpalme() {
  const empalmes = [{ numEmpalme: 42 }, { numEmpalme: 103 }, { numEmpalme: 7 }];
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elemento_empalme_g</h3>
      <p style={s.meta}>Elemento de diagrama (croquis). Símbolo: línea + rombo. Etiqueta: ER-NNN.</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        {empalmes.map(e => (
          <div key={e.numEmpalme} style={{ textAlign: 'center' }}>
            <ElementoEmpalmeGUI entidad={e} width={80} height={80} />
            <small style={s.meta}>ER-{e.numEmpalme}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// [06] Demo — c_elemento_seccion_g
// =============================================================================
function DemoElementoSeccion() {
  const secciones = [
    { calculatedFiberLength: 1523.456789012 },
    { calculatedFiberLength: 87.5           },
    { calculatedFiberLength: 4200.0         },
  ];
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elemento_seccion_g</h3>
      <p style={s.meta}>Elemento de diagrama (croquis). Símbolo: línea con terminadores. Etiqueta: longitud de fibra (11 dígitos).</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {secciones.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ElementoSeccionGUI entidad={e} width={200} height={40} />
            <small style={s.meta}>{e.calculatedFiberLength} m</small>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// [07] Demo — c_elemento_nodo_g
// =============================================================================
function DemoElementoNodo() {
  const nodos = [
    { nomNodo: 'NODO-MAD-01', tipo: 'EDFA-17dBm' },
    { nomNodo: 'NODO-BCN-03', tipo: 'RAMAN-AMP'  },
    { nomNodo: 'NODO-SEV-07', tipo: 'EDFA-23dBm' },
  ];
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elemento_nodo_g</h3>
      <p style={s.meta}>Elemento de diagrama (croquis). Símbolo: EDFA (círculo + triángulo). 3 etiquetas: nombre nodo (top) · D.O. fijo (mid) · tipo (bot).</p>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
        {nodos.map((n, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <ElementoNodoGUI entidad={n} width={160} height={80} />
            <small style={s.meta}>{n.nomNodo}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// [27] Demo — c_tabla_georeferencia
// =============================================================================
/*
function DemoTablaGeoreferencia_PREV() {
  // Comentado para referencia — ver DemoTablaGeoreferencia activo abajo
}
*/
function DemoTablaGeoreferencia() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_tabla_georeferencia</h3>
      <CTablaGeoreferenciaUI />
    </section>
  );
}

// =============================================================================
// [28] Demo — c_cfg_bloque_titdet_editable_mixin
// =============================================================================
function DemoCfgBloqueTitdetEditableMixin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_cfg_bloque_titdet_editable_mixin</h3>
      <CfgBloqueTitdetEditableMixinUI />
    </section>
  );
}

// =============================================================================
// REGISTRO DE MIGRACIONES
// Al añadir una nueva migración: agregar entrada aquí + import arriba.
// =============================================================================
type DemoItem = {
  id         : string;
  label      : string;
  description: string;
  render     : () => React.ReactNode;
};

const DEMO_ITEMS: DemoItem[] = [
  {
    id         : '01-arbol-distritos',
    label      : '[01] c_arbol_distritos_para_ruta',
    description: 'Árbol de distritos con checkbox + botones Agregar / Desagregar / Agregar del mapa.',
    render     : () => <DemoArbolDistritos />,
  },
  {
    id         : '02-seccionamiento',
    label      : '[02] c_seccionamiento',
    description: 'Divide una LineString en viewports/vistas según tamaño mínimo de módulos.',
    render     : () => <DemoSeccionamiento />,
  },
  {
    id         : '03-ruta-opbs',
    label      : '[03] ruta_opbs_plugin',
    description: 'Plugin ciclo de vida del diálogo c_opbs — cierra+recrea si ya abierto.',
    render     : () => <DemoRutaOpbsPlugin />,
  },
  {
    id         : '04-sectores',
    label      : '[04] c_sectores',
    description: 'Chaining de segmentos: une extremos coincidentes en cadenas continuas.',
    render     : () => <SectoresUI />,
  },
  {
    id         : '05-elemento-empalme',
    label      : '[05] c_elemento_empalme_g',
    description: 'SVG: empalme de cobre — línea + rombo + etiqueta ER-NNN.',
    render     : () => <DemoElementoEmpalme />,
  },
  {
    id         : '06-elemento-seccion',
    label      : '[06] c_elemento_seccion_g',
    description: 'SVG: sección de fibra óptica — |---| + longitud calculada (11 dígitos).',
    render     : () => <DemoElementoSeccion />,
  },
  {
    id         : '07-elemento-nodo',
    label      : '[07] c_elemento_nodo_g',
    description: 'SVG: nodo EDFA — 3 etiquetas (nomNodo / D.O. / tipo) + símbolo círculo+triángulo.',
    render     : () => <DemoElementoNodo />,
  },
  {
    id         : '08-creador-tramo',
    label      : '[08] c_creador_elemento_tramo_g',
    description: 'Factory: crea empalme/sección/nodo según entityType (discriminated union).',
    render     : () => <CreadorElementoTramoGUI />,
  },
  {
    id         : '09-viewport-mixin',
    label      : '[09] viewport_layout_mixin',
    description: 'Mixin de conexión a viewport — guard id>0 evita reconexión.',
    render     : () => <ViewportLayoutMixinUI />,
  },
  {
    id         : '10-texto-linea',
    label      : '[10] c_texto_linea_grafico',
    description: 'Extiende c_texto_grafico: texto + línea horizontal al pie del bbox.',
    render     : () => <TextoLineaGraficoUI />,
  },
  {
    id         : '11-plot-engine',
    label      : '[11] layout_plot_engine.centraliza_launch',
    description: 'Lanzador background con guard de instancia única + UI de interrupción.',
    render     : () => <LayoutPlotEngineUI />,
  },
  {
    id         : '12-titulo-plano',
    label      : '[12] c_titulo_de_plano',
    description: 'Título de plano auto-posicionado en esquina inferior-derecha del contenedor.',
    render     : () => <TituloDePlanoUI />,
  },
  {
    id         : '13-sello-simbologia',
    label      : '[13] c_sello_simbologia_diagrama_empalmes',
    description: 'Cuadro de simbología de diagrama de empalmes — tbl_titulo (8×65) + tbl_contenido (110×65).',
    render     : () => <SelloSimbologiaDiagramaEmpallesUI />,
  },
  {
    id         : '14-sello-notas-sct-puente',
    label      : '[14] c_sello_notas_sct_inst_puente',
    description: 'Notas SCT instalación lateral en puente — tabla 2×1 (10mm+170mm, 165mm ancho), notas 1-11.',
    render     : () => <SelloNotasSctInstPuenteUI />,
  },
  {
    id         : '15-sello-notas-sct-marg-sub',
    label      : '[15] c_sello_notas_sct_marg_sub',
    description: 'Notas SCT instalación marginal subterránea — tabla 2×1 (10mm+265mm, 170mm ancho), notas 1-15.',
    render     : () => <SelloNotasSctMargSubUI />,
  },
  {
    id         : '16-sello-simbologia-red-sec',
    label      : '[16] c_sello_simbologia_red_sec',
    description: 'Simbología red secundaria FO — 3 tablas: título (8×130) + cabecera 3 columnas (8×60+35+35) + contenido (110×130).',
    render     : () => <SelloSimbologiaRedSecUI />,
  },
  // ── [16] c_sello_simbologia_red_sec — anterior último componente migrado ─
  {
    id         : '17-sello-capacidad-cable',
    label      : '[17] c_sello_capacidad_cable',
    description: 'Cuadro de capacidad de cable — tbl_titulo (2×1, 12×44u) + tbl_contenido (18×2, 108×44u). 18 tipos: A→10PS. … Z→FIBRAS OPTICAS.',
    render     : () => <SelloCapacidadCableUI />,
  },
  // ── [17] c_sello_capacidad_cable — anterior último componente migrado ────
  {
    id         : '18-simbologia-reubicacion-terminales',
    label      : '[18] c_simbologia_plano_reubicacion_terminales',
    description: 'Símbolo configurable: name/colour/angle/flip/mirror. Catálogo SVG inline (5 símbolos). Halo blanco vía SVG filter feMorphology.',
    render     : () => <SimbologiaPlanoReubicacionTerminalesUI />,
  },
  // ── [18] c_simbologia_plano_reubicacion_terminales — anterior último ─────
  {
    id         : '19-vp-detalle-interno-edificio',
    label      : '[19] c_vp_detalle_interno_edificio',
    description: 'Viewport planta TBA — ACE :mit_floor_internal, oResulSet GeoJSON, barra de título 100u debajo (c_titulo_de_plano). draw_content_on delega a _super.',
    render     : () => <VpDetalleInternoEdificioUI />,
  },
  // ── [19] c_vp_detalle_interno_edificio — anterior último componente ──────
  {
    id         : '20-sello-competencia-telmex',
    label      : '[20] c_sello_competencia_telmex',
    description: 'Competencia telefónica por edificio — 10 filas × 3 cols {10,27,7}u. Tabla abierta. Async llena_datos_celdas() → mock BD GIS (IDs: 101, 202, 303).',
    render     : () => <SelloCompetenciaTelmexUI />,
  },
  // ── [20] c_sello_competencia_telmex — anterior último componente ─────────
  {
    id         : '21-imagen-bmp',
    label      : '[21] c_imagen_bmp',
    description: 'Contenedor BMP — wrappea bitmap_layout con flip H/V + fit. new() y new_from() con conversión de márgenes /10. Despliega() asigna oArea a bounds.',
    render     : () => <CImagenBmpUI />,
  },
  // ── [21] c_imagen_bmp — anterior último componente ───────────────────────
  {
    id         : '22-croquis',
    label      : '[22] c_croquis',
    description: 'Croquis de localización — ordenamiento() encadena tramos, dibujaTrazo() buffer Turf.js, croquisProyecCanaliz() genera viewport+norte+título en layout.',
    render     : () => <CCroquisUI />,
  },
  // ── [22] c_croquis — anterior último componente ──────────────────────────
  {
    id         : '23-sello-estandar-ctl',
    label      : '[23] c_sello_estandar_ctl',
    description: 'Sello CTL — tbl_CeldaA(70×15mm,2f) + tbl_CeldaB(45×15mm,1f). draw_content_on empuja atributos→celdas. lee_datos_BdeD() async desde oProyecto mock.',
    render     : () => <SelloEstandarCtlUI />,
  },
  // ── [23] c_sello_estandar_ctl — anterior último componente ───────────────
  {
    id         : '24-vp-croquis-proy-can',
    label      : '[24] c_vp_croquis_proy_can',
    description: 'Viewport croquis canalización — objetos_visibles() filtra 6 tipos con predicados Turf.js (buffer 500m). Título "CROQUIS DE LOCALIZACION" en rgb(175,175,93).',
    render     : () => <VpCroquisProyCanUI />,
  },
  // ── [24] c_vp_croquis_proy_can — anterior último componente ─────────────
  {
    id         : '25-sello-aumentos-secundarios',
    label      : '[25] c_sello_aumentos_secundarios',
    description: 'Sello de aumento de red secundaria — tabla 2×5 (sin red directa) ó 3×5 (con RED DIRECTA). Colores: verde/rojo/naranja. Async inicializaConGis() → mock BD GIS (D-01…D-04).',
    render     : () => <SelloAumentosSecundariosUI />,
  },
  // ── [25] c_sello_aumentos_secundarios — anterior último componente ───────
  {
    id         : '26-c-fila',
    label      : '[26] c_fila',
    description: 'Modelo de fila de tabla — nLongitud setter valida ≥0 y almacena ×10 (mm→décimas de mm). serial_slots() ÷10 al serializar. new_from_serial / init_with / perform_private.',
    render     : () => <CFilaUI />,
  },
  // ── [26] c_fila — anterior último componente migrado ────────────────────
  {
    id         : '27-tabla-georeferencia',
    label      : '[27] c_tabla_georeferencia',
    description: 'Sello georreferencia terminales ópticas: tbl_datos (N×3: nombre/estado/dist) + tbl_coord (N×2×3: X/Y|GEO|UTM). Zonas UTM 11–16. Filtra por LiteralTerminal.',
    render     : () => <DemoTablaGeoreferencia />,
  },
  // ── [27] c_tabla_georeferencia — anterior último componente migrado ──────
  {
    id         : '28-cfg-bloque-titdet-editable',
    label      : '[28] c_cfg_bloque_titdet_editable_mixin',
    description: 'Mixin de bordes: cfg_tbl_titulo (6×3, contorno "a modo") + cfg_tbl_detalle (8×N, caja cols 3-6 + col-5 editable). Vista SVG before/after.',
    render     : () => <DemoCfgBloqueTitdetEditableMixin />,
  },
  // ── PRÓXIMA MIGRACIÓN: agregar entrada aquí ──────────────────────────────
];

// =============================================================================
// App
// =============================================================================
function App() {
  // Por defecto muestra la migración más reciente
  const [activeId, setActiveId] = useState(DEMO_ITEMS[DEMO_ITEMS.length - 1].id);
  const active = DEMO_ITEMS.find(item => item.id === activeId) ?? DEMO_ITEMS[DEMO_ITEMS.length - 1];

  return (
    <div style={s.root}>
      <h2 style={s.title}>Test — Migración Magik → TypeScript</h2>

      <div style={s.menuBar}>
        <label htmlFor="demo-select" style={s.menuLabel}>Componente:</label>
        <select
          id="demo-select"
          value={activeId}
          onChange={e => setActiveId(e.target.value)}
          style={s.select}
        >
          {DEMO_ITEMS.map(item => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <span style={s.menuHint}>{active.description}</span>
      </div>

      <div style={s.demoArea}>
        {active.render()}
      </div>
    </div>
  );
}

export default App;

// =============================================================================
// Estilos
// =============================================================================
const s: Record<string, React.CSSProperties> = {
  root    : { padding: 24, fontFamily: 'sans-serif', fontSize: 13 },
  title   : { marginBottom: 16, fontSize: 18 },
  menuBar : { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: '#f0f4f8', borderRadius: 6, border: '1px solid #dde' },
  menuLabel: { fontSize: 12, color: '#555', fontWeight: 'bold' },
  select  : { padding: '5px 10px', borderRadius: 5, border: '1px solid #b0bec5', fontSize: 13, minWidth: 320 },
  menuHint: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  demoArea: { minHeight: 200 },
  section : { marginBottom: 0, border: '1px solid #ddd', borderRadius: 6, padding: 16 },
  h3      : { margin: '0 0 8px', fontSize: 15, fontWeight: 'bold' },
  meta    : { color: '#666', fontSize: 12, margin: '4px 0' },
  table   : { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
  th      : { background: '#2E4057', color: '#fff', padding: '6px 10px', textAlign: 'left', fontSize: 12 },
  td      : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 12 },
};
