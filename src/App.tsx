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
// [26] c_plano_desmontaje_cd
import { PlanoDesmontajeCdUI }                    from './migration/PlanoDesmontajeCd';
// [27] polyline_layout
import { PolylineLayoutUI }                       from './migration/migration/PolylineLayout';
// [28] c_simbologia_ocupacion_de_ductos
import { SimbologiaOcupacionDeDuctosUI }          from './migration/migration/SimbologiaOcupacionDeDuctos';
// [29] c_pep_dcs
import { PepDcsUI }                               from './migration/migration/PepDcs';
// [30] c_sello_notas_sct_cruz_sub
import { SelloNotasSctCruzSubUI }                 from './migration/migration/SelloNotasSctCruzSub';
// [31] symbol_layout
import { SymbolLayoutUI }                         from './migration/migration/SymbolLayout';
// [32] c_traductor
import { TraductorUI }                            from './migration/migration/Traductor';
// [33] c_circulo_grafico
import { CirculoGraficoUI }                       from './migration/migration/CirculoGrafico';
// [34] c_placa_fosc350c
import { PlacaFosc350cUI }                        from './migration/migration/PlacaFosc350c';
// [35] c_ocupacion_de_vias
import { OcupacionDeViasUI }                      from './migration/migration/OcupacionDeVias';
// [36] cuadro_de_notas_plugin
import { CuadroDeNotasPluginUI }                  from './migration/migration/CuadroDeNotasPlugin';
// [37] c_detalles_layout
import { DetallesLayoutUI }                       from './migration/migration/DetallesLayout';
// [38] c_simbolo_longitud_trazo_gazas
import { SimboloLongitudTrazoGazasUI }            from './migration/migration/SimboloLongitudTrazoGazas';
// [39] c_margen_layout
import { MargenLayoutUI }                         from './migration/migration/MargenLayout';
// [40] c_simbologia_plano_construccion
import { SimbologiaPlanoConstruccionUI }          from './migration/migration/SimbologiaPlanoConstruccion';
// [41] c_elementos_tramo_g
import { ElementosTramoGUI }                      from './migration/migration/ElementosTramoG';
// [42] c_dibuja
import { DibujaUI }                               from './migration/migration/Dibuja';
// [43] c_plano_e
import { PlanoEUI }                               from './migration/migration/PlanoE';
// [44] c_elemento_empalme_subterraneo_g
import { ElementoEmpalmeSubterraneoGUI }          from './migration/migration/ElementoEmpalmeSubterraneoG';
// [45] c_celdas_grafico
import { CeldasGraficoUI }                        from './migration/migration/CeldasGrafico';
// [46] c_linea_grafico
import { LineaGraficoUI }                         from './migration/migration/LineaGrafico';
// [47] c_vp_ubicacion_cedo
import { VpUbicacionCedoUI }                      from './migration/migration/VpUbicacionCedo';
// [48] c_tbl_cfg_mixin
import { TblCfgMixinUI }                          from './migration/migration/TblCfgMixin';
// [49] c_area_telmex
import { AreaTelmexUI }                              from './migration/AreaTelmex';
// [50] c_Corte_Geografico
import { CorteGeograficoUI }                         from './migration/CorteGeografico';
// [51] c_elemento_empalme_derivacion_g
import { ElementoEmpalmeDerivacionGUI }              from './migration/ElementoEmpalmeDerivacionG';
// [52] c_plano_ruta_de_cables
import { PlanoRutaDeCablesUI }                       from './migration/PlanoRutaDeCables';
// [53] c_sello_correspondencias
import { SelloCorrespondenciasUI }                   from './migration/SelloCorrespondencias';
// [54] c_sello_estandar
import { SelloEstandarUI }                           from './migration/SelloEstandar';
// [55] c_sello_estandar_base
import { SelloEstandarBaseUI }                       from './migration/SelloEstandarBase';
// [56] c_sello_lista_cables
import { SelloListaCablesUI }                        from './migration/SelloListaCables';
// [57] c_sello_notas_sct_cruz_aereo
import { SelloNotasSctCruzAereoUI }                  from './migration/SelloNotasSctCruzAereo';
// [58] c_sello_notas_sct_inst_puente_tn
import { SelloNotasSctInstPuenteTnUI }               from './migration/SelloNotasSctInstPuenteTn';
// [59] c_sello_notas_sct_marg_aereo
import { SelloNotasSctMargAereoUI }                  from './migration/SelloNotasSctMargAereo';
// [60] c_servicios_estilos
import { ServiciosEstilosUI }                        from './migration/ServiciosEstilos';
// [61] c_simbologia_plano_construccion_fo
import { SimbologiaPlanoContruccionFoUI }            from './migration/SimbologiaPlanoContruccionFo';
// [62] c_simbologia_plano_reubicacion_exist_proy
import { SimbologiaPlanoReubicacionExistProyUI }     from './migration/SimbologiaPlanoReubicacionExistProy';
// [63] c_style_symbol_open_dialog
import { StyleSymbolOpenDialogUI }                   from './migration/StyleSymbolOpenDialog';
// [64] c_tabla_enc_georeferencia
import { TablaEncGeoreferenciaUI }                   from './migration/TablaEncGeoreferencia';
// [65] c_tachado_grafico
import { TachadoGraficoUI }                          from './migration/TachadoGrafico';
// [66] c_tipo_geom
import { TipoGeomUI }                                from './migration/TipoGeom';
// [67] c_Traductor (alias — TraductorUI ya importado desde migration/migration/)
import { TraductorUI as TraductorBaseUI }            from './migration/Traductor';
// [68] c_traza_trail
import { TrazaTrailUI }                              from './migration/TrazaTrail';
// [69] c_vp_cobre
import { VpCobreUI }                                 from './migration/VpCobre';
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
// [27] Demo — polyline_layout
// =============================================================================
function DemoPolylineLayout() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>polyline_layout</h3>
      <p style={s.meta}>Atributos base de polilinea: coordenadas y estilo.</p>
      <PolylineLayoutUI />
    </section>
  );
}

// =============================================================================
// [28] Demo — c_simbologia_ocupacion_de_ductos
// =============================================================================
function DemoSimbologiaOcupacionDeDuctos() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_simbologia_ocupacion_de_ductos</h3>
      <p style={s.meta}>Tabla 1x1 con simbolo "ocupacion_de_ductos".</p>
      <SimbologiaOcupacionDeDuctosUI />
    </section>
  );
}

// =============================================================================
// [29] Demo — c_pep_dcs
// =============================================================================
function DemoPepDcs() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_pep_dcs</h3>
      <p style={s.meta}>Tabla PEP: titulos y valores de referencia.</p>
      <PepDcsUI />
    </section>
  );
}

// =============================================================================
// [30] Demo — c_sello_notas_sct_cruz_sub
// =============================================================================
function DemoSelloNotasSctCruzSub() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_sello_notas_sct_cruz_sub</h3>
      <p style={s.meta}>Notas generales para cruce subterraneo.</p>
      <SelloNotasSctCruzSubUI />
    </section>
  );
}

// =============================================================================
// [31] Demo — symbol_layout
// =============================================================================
function DemoSymbolLayout() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>symbol_layout</h3>
      <p style={s.meta}>Listado de simbolos y muestra con color/rotacion.</p>
      <SymbolLayoutUI />
    </section>
  );
}

// =============================================================================
// [32] Demo — c_traductor
// =============================================================================
function DemoTraductor() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_traductor</h3>
      <p style={s.meta}>Traductor de claves para planos y PEP.</p>
      <TraductorUI />
    </section>
  );
}

// =============================================================================
// [33] Demo — c_circulo_grafico
// =============================================================================
function DemoCirculoGrafico() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_circulo_grafico</h3>
      <p style={s.meta}>Circulo centrado con radio escalado.</p>
      <CirculoGraficoUI />
    </section>
  );
}

// =============================================================================
// [34] Demo — c_placa_fosc350c
// =============================================================================
function DemoPlacaFosc350c() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_placa_fosc350c</h3>
      <p style={s.meta}>Simbolo con color y transformaciones.</p>
      <PlacaFosc350cUI />
    </section>
  );
}

// =============================================================================
// [35] Demo — c_ocupacion_de_vias
// =============================================================================
function DemoOcupacionDeVias() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_ocupacion_de_vias</h3>
      <p style={s.meta}>Simbolo con color y transformaciones.</p>
      <OcupacionDeViasUI />
    </section>
  );
}

// =============================================================================
// [36] Demo — cuadro_de_notas_plugin
// =============================================================================
function DemoCuadroDeNotasPlugin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>cuadro_de_notas_plugin</h3>
      <p style={s.meta}>Plugin para abrir el cuadro de notas.</p>
      <CuadroDeNotasPluginUI />
    </section>
  );
}

// =============================================================================
// [37] Demo — c_detalles_layout
// =============================================================================
function DemoDetallesLayout() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_detalles_layout</h3>
      <p style={s.meta}>Textos de copyright del plano de detalle.</p>
      <DetallesLayoutUI />
    </section>
  );
}

// =============================================================================
// [38] Demo — c_simbolo_longitud_trazo_gazas
// =============================================================================
function DemoSimboloLongitudTrazoGazas() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_simbolo_longitud_trazo_gazas</h3>
      <p style={s.meta}>Simbolo con color y transformaciones.</p>
      <SimboloLongitudTrazoGazasUI />
    </section>
  );
}

// =============================================================================
// [39] Demo — c_margen_layout
// =============================================================================
function DemoMargenLayout() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_margen_layout</h3>
      <p style={s.meta}>Margen del layout con segmentos guia.</p>
      <MargenLayoutUI />
    </section>
  );
}

// =============================================================================
// [40] Demo — c_simbologia_plano_construccion
// =============================================================================
function DemoSimbologiaPlanoConstruccion() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_simbologia_plano_construccion</h3>
      <p style={s.meta}>Cuadro de simbologia del plano de construccion.</p>
      <SimbologiaPlanoConstruccionUI />
    </section>
  );
}

// =============================================================================
// [41] Demo — c_elementos_tramo_g
// =============================================================================
function DemoElementosTramoG() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elementos_tramo_g</h3>
      <p style={s.meta}>Resumen de longitud y elementos habilitados.</p>
      <ElementosTramoGUI />
    </section>
  );
}

// =============================================================================
// [42] Demo — c_dibuja
// =============================================================================
function DemoDibuja() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_dibuja</h3>
      <p style={s.meta}>Dibujo de trazos con traslacion y rotacion.</p>
      <DibujaUI />
    </section>
  );
}

// =============================================================================
// [43] Demo — c_plano_e
// =============================================================================
function DemoPlanoE() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_plano_e</h3>
      <p style={s.meta}>Entidad de plano: proyecto, nombre, tipo y comentario.</p>
      <PlanoEUI />
    </section>
  );
}

// =============================================================================
// [44] Demo — c_elemento_empalme_subterraneo_g
// =============================================================================
function DemoElementoEmpalmeSubterraneoG() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elemento_empalme_subterraneo_g</h3>
      <p style={s.meta}>Empalme subterraneo con margenes internos.</p>
      <ElementoEmpalmeSubterraneoGUI />
    </section>
  );
}

// =============================================================================
// [45] Demo — c_celdas_grafico
// =============================================================================
function DemoCeldasGrafico() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_celdas_grafico</h3>
      <p style={s.meta}>Celda con bordes opcionales dibujados sobre el area.</p>
      <CeldasGraficoUI />
    </section>
  );
}

// =============================================================================
// [46] Demo — c_linea_grafico
// =============================================================================
function DemoLineaGrafico() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_linea_grafico</h3>
      <p style={s.meta}>Linea entre dos puntos proporcionales del area (OL + Turf).</p>
      <LineaGraficoUI />
    </section>
  );
}

// =============================================================================
// [47] Demo — c_vp_ubicacion_cedo
// =============================================================================
function DemoVpUbicacionCedo() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_vp_ubicacion_cedo</h3>
      <p style={s.meta}>Viewport DETALLE DE CANALIZACION (filtro + titulo).</p>
      <VpUbicacionCedoUI />
    </section>
  );
}

// =============================================================================
// [48] Demo — c_tbl_cfg_mixin
// =============================================================================
function DemoTblCfgMixin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_tbl_cfg_mixin</h3>
      <p style={s.meta}>Configuracion de bordes de tabla (titulo / detalle).</p>
      <TblCfgMixinUI />
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

  // =============================================================================
  // [23] Demo inline — c_sello_estandar_ctl
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoSelloEstandarCtl() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sello_estandar_ctl</h3>
  //       <p style={s.meta}>
  //         Sello estandar CTL — tbl_CeldaA (70mm, 2 filas) + tbl_CeldaB (45mm, 1 fila).
  //         draw_content_on empuja atributos a celdas. lee_datos_BdeD() async.
  //         IDs proyecto: GDL, MTY, MEX, TIJ
  //       </p>
  //       <SelloEstandarCtlUI />
  //     </section>
  //   );
  // }

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
  // ── [24] c_vp_croquis_proy_can — anterior último componente migrado ────────

  // =============================================================================
  // [25] Demo inline — c_sello_aumentos_secundarios
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoSelloAumentosSecundarios() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sello_aumentos_secundarios</h3>
  //       <p style={s.meta}>
  //         Sello de aumento de red secundaria. Tabla 5 cols x 2-3 filas.
  //         IDs disponibles: D01 · D02 (sin red directa) · D03
  //       </p>
  //       <SelloAumentosSecundariosUI />
  //     </section>
  //   );
  // }

  {
    id         : '25-sello-aumentos-secundarios',
    label      : '[25] c_sello_aumentos_secundarios',
    description: 'Sello aumento red secundaria por distrito — tabla 5 cols x 2 filas (3 si red directa). Cabeceras: DTO./CONECT./AUMENTO/L.PLAZO/TOTAL. Colores: verde/rojo/naranja.',
    render     : () => <SelloAumentosSecundariosUI />,
  },
  // ── [25] c_sello_aumentos_secundarios — anterior último componente migrado ──

  // =============================================================================
  // [26] Demo inline — c_plano_desmontaje_cd
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoPlanoDesmontajeCd() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_plano_desmontaje_cd</h3>
  //       <p style={s.meta}>
  //         Orquestador del plano de Desmontaje de Caja de Distribucion.
  //         Pulsa "genera_plano()" para componer marco + sello + viewport.
  //       </p>
  //       <PlanoDesmontajeCdUI />
  //     </section>
  //   );
  // }

  {
    id         : '26-plano-desmontaje-cd',
    label      : '[26] c_plano_desmontaje_cd',
    description: 'Plano desmontaje Caja Distribución — genera_plano() compone marco(3×1) + sello_proyecto_canalizacion + viewport_layout. Escala por ratio bounds o view_scale si ángulo > 0.1°.',
    render     : () => <PlanoDesmontajeCdUI />,
  },
  {
    id         : '27-polyline-layout',
    label      : '[27] polyline_layout',
    description: 'Atributos base de polilinea: coordenadas y estilo.',
    render     : () => <DemoPolylineLayout />,
  },
  {
    id         : '28-simbologia-ocupacion-ductos',
    label      : '[28] c_simbologia_ocupacion_de_ductos',
    description: 'Tabla 1x1 con simbolo ocupacion_de_ductos.',
    render     : () => <DemoSimbologiaOcupacionDeDuctos />,
  },
  {
    id         : '29-pep-dcs',
    label      : '[29] c_pep_dcs',
    description: 'Tabla PEP con titulos y valores de referencia.',
    render     : () => <DemoPepDcs />,
  },
  {
    id         : '30-sello-notas-sct-cruz-sub',
    label      : '[30] c_sello_notas_sct_cruz_sub',
    description: 'Notas generales para cruce subterraneo.',
    render     : () => <DemoSelloNotasSctCruzSub />,
  },
  {
    id         : '31-symbol-layout',
    label      : '[31] symbol_layout',
    description: 'Listado de simbolos y muestra con color/rotacion.',
    render     : () => <DemoSymbolLayout />,
  },
  {
    id         : '32-traductor',
    label      : '[32] c_traductor',
    description: 'Traduccion de claves para planos y PEP.',
    render     : () => <DemoTraductor />,
  },
  {
    id         : '33-circulo-grafico',
    label      : '[33] c_circulo_grafico',
    description: 'Circulo centrado con radio escalado.',
    render     : () => <DemoCirculoGrafico />,
  },
  {
    id         : '34-placa-fosc350c',
    label      : '[34] c_placa_fosc350c',
    description: 'Simbolo con color y transformaciones.',
    render     : () => <DemoPlacaFosc350c />,
  },
  {
    id         : '35-ocupacion-de-vias',
    label      : '[35] c_ocupacion_de_vias',
    description: 'Simbolo con color y transformaciones.',
    render     : () => <DemoOcupacionDeVias />,
  },
  {
    id         : '36-cuadro-notas-plugin',
    label      : '[36] cuadro_de_notas_plugin',
    description: 'Plugin para abrir el cuadro de notas.',
    render     : () => <DemoCuadroDeNotasPlugin />,
  },
  {
    id         : '37-detalles-layout',
    label      : '[37] c_detalles_layout',
    description: 'Textos de copyright del plano de detalle.',
    render     : () => <DemoDetallesLayout />,
  },
  {
    id         : '38-simbolo-longitud-trazo-gazas',
    label      : '[38] c_simbolo_longitud_trazo_gazas',
    description: 'Simbolo con color y transformaciones.',
    render     : () => <DemoSimboloLongitudTrazoGazas />,
  },
  {
    id         : '39-margen-layout',
    label      : '[39] c_margen_layout',
    description: 'Margen del layout con segmentos guia.',
    render     : () => <DemoMargenLayout />,
  },
  {
    id         : '40-simbologia-plano-construccion',
    label      : '[40] c_simbologia_plano_construccion',
    description: 'Cuadro de simbologia del plano de construccion.',
    render     : () => <DemoSimbologiaPlanoConstruccion />,
  },
  {
    id         : '41-elementos-tramo-g',
    label      : '[41] c_elementos_tramo_g',
    description: 'Resumen de longitud y elementos habilitados.',
    render     : () => <DemoElementosTramoG />,
  },
  {
    id         : '42-dibuja',
    label      : '[42] c_dibuja',
    description: 'Dibujo de trazos con traslacion y rotacion.',
    render     : () => <DemoDibuja />,
  },
  {
    id         : '43-plano-e',
    label      : '[43] c_plano_e',
    description: 'Entidad de plano: proyecto, nombre, tipo y comentario.',
    render     : () => <DemoPlanoE />,
  },
  {
    id         : '44-empalme-subterraneo',
    label      : '[44] c_elemento_empalme_subterraneo_g',
    description: 'Empalme subterraneo con margenes internos.',
    render     : () => <DemoElementoEmpalmeSubterraneoG />,
  },
  {
    id         : '45-celdas-grafico',
    label      : '[45] c_celdas_grafico',
    description: 'Celda con bordes opcionales dibujados sobre el area.',
    render     : () => <DemoCeldasGrafico />,
  },
  {
    id         : '46-linea-grafico',
    label      : '[46] c_linea_grafico',
    description: 'Linea entre dos puntos proporcionales del area (OL + Turf).',
    render     : () => <DemoLineaGrafico />,
  },
  {
    id         : '47-vp-ubicacion-cedo',
    label      : '[47] c_vp_ubicacion_cedo',
    description: 'Viewport DETALLE DE CANALIZACION (filtro + titulo).',
    render     : () => <DemoVpUbicacionCedo />,
  },
  {
    id         : '48-tbl-cfg-mixin',
    label      : '[48] c_tbl_cfg_mixin',
    description: 'Configuracion de bordes de tabla (titulo / detalle).',
    render     : () => <DemoTblCfgMixin />,
  },
  {
    id         : '49-area-telmex',
    label      : '[49] c_area_telmex',
    description: 'Área de cobertura Telmex — polígono configurable con atributos de área y municipio.',
    render     : () => <AreaTelmexUI />,
  },
  {
    id         : '50-corte-geografico',
    label      : '[50] c_Corte_Geografico',
    description: 'Corte geográfico — OL v10 + Turf.js: buffer 0.5km sobre ruta, filtra capas por booleanDisjoint, dibuja colonia/lote/distrito.',
    render     : () => <CorteGeograficoUI />,
  },
  {
    id         : '51-elemento-empalme-derivacion',
    label      : '[51] c_elemento_empalme_derivacion_g',
    description: 'SVG: empalme con derivación — símbolo línea+rombo+bifurcación, etiqueta ER-NNN.',
    render     : () => <ElementoEmpalmeDerivacionGUI />,
  },
  {
    id         : '52-plano-ruta-cables',
    label      : '[52] c_plano_ruta_de_cables',
    description: 'Plano de ruta de cables — orquestador layout: marco + sello + viewports de ruta.',
    render     : () => <PlanoRutaDeCablesUI />,
  },
  {
    id         : '53-sello-correspondencias',
    label      : '[53] c_sello_correspondencias',
    description: 'Correspondencias ópticas — tbl_titulo(1×1,110mm) + tbl_subtitulos(1×2,55+55mm) + tbl_contenido(N×7). Max 40 filas.',
    render     : () => <SelloCorrespondenciasUI />,
  },
  {
    id         : '54-sello-estandar',
    label      : '[54] c_sello_estandar',
    description: 'Sello estándar de plano — tablas título/proyecto/datos con llenado async desde servicio GIS.',
    render     : () => <SelloEstandarUI />,
  },
  {
    id         : '55-sello-estandar-base',
    label      : '[55] c_sello_estandar_base',
    description: 'Sello estándar base — hereda c_base_sello_cobre, 4 tablas, DESP_Y=-124mm. FALC: sinBordes en tbl_ubicacion.',
    render     : () => <SelloEstandarBaseUI />,
  },
  {
    id         : '56-sello-lista-cables',
    label      : '[56] c_sello_lista_cables',
    description: 'Lista de cables — tabla dinámica N filas × columnas de tipo/capacidad/longitud.',
    render     : () => <SelloListaCablesUI />,
  },
  {
    id         : '57-sello-notas-sct-cruz-aereo',
    label      : '[57] c_sello_notas_sct_cruz_aereo',
    description: 'Notas SCT cruce aéreo — tabla notas estáticas para instalación en cruce aéreo.',
    render     : () => <SelloNotasSctCruzAereoUI />,
  },
  {
    id         : '58-sello-notas-sct-inst-puente-tn',
    label      : '[58] c_sello_notas_sct_inst_puente_tn',
    description: 'Notas SCT instalación puente TN — variante túnel/nodo de tabla notas instalación lateral.',
    render     : () => <SelloNotasSctInstPuenteTnUI />,
  },
  {
    id         : '59-sello-notas-sct-marg-aereo',
    label      : '[59] c_sello_notas_sct_marg_aereo',
    description: 'Notas SCT instalación marginal aérea — tabla notas para tendido marginal en poste.',
    render     : () => <SelloNotasSctMargAereoUI />,
  },
  {
    id         : '60-servicios-estilos',
    label      : '[60] c_servicios_estilos',
    description: 'Catálogo de estilos GIS — mapeo símbolo→estilo para entidades del dataset.',
    render     : () => <ServiciosEstilosUI />,
  },
  {
    id         : '61-simbologia-plano-fo',
    label      : '[61] c_simbologia_plano_construccion_fo',
    description: 'Simbología plano construcción FO — leyenda de símbolos fibra óptica con categorías.',
    render     : () => <SimbologiaPlanoContruccionFoUI />,
  },
  {
    id         : '62-simbologia-reubicacion-exist',
    label      : '[62] c_simbologia_plano_reubicacion_exist_proy',
    description: 'Simbología reubicación existente/proyectado — leyenda dual: elementos a reubicar vs nuevos.',
    render     : () => <SimbologiaPlanoReubicacionExistProyUI />,
  },
  {
    id         : '63-style-symbol-dialog',
    label      : '[63] c_style_symbol_open_dialog',
    description: 'Diálogo selección de símbolo de estilo — abre editor de símbolo GIS para entidad activa.',
    render     : () => <StyleSymbolOpenDialogUI />,
  },
  {
    id         : '64-tabla-enc-georeferencia',
    label      : '[64] c_tabla_enc_georeferencia',
    description: 'Tabla encabezado georreferencia — coordenadas UTM del área del plano en tabla estándar.',
    render     : () => <TablaEncGeoreferenciaUI />,
  },
  {
    id         : '65-tachado-grafico',
    label      : '[65] c_tachado_grafico',
    description: 'Tachado gráfico — overlay SVG de línea diagonal para marcar elementos eliminados.',
    render     : () => <TachadoGraficoUI />,
  },
  {
    id         : '66-tipo-geom',
    label      : '[66] c_tipo_geom',
    description: 'Tipo de geometría — discriminador point/line/polygon para features del dataset GIS.',
    render     : () => <TipoGeomUI />,
  },
  {
    id         : '67-traductor-base',
    label      : '[67] c_Traductor (base)',
    description: 'Traductor de códigos GIS — 7 métodos lookup: tipoSuperficie/tipoCentral/tipoPlano/tipoCaseta/mes/metodoPep/nombreAtributoPep.',
    render     : () => <TraductorBaseUI />,
  },
  {
    id         : '68-traza-trail',
    label      : '[68] c_traza_trail',
    description: 'Traza trail — captura y visualiza la polilínea activa del mapa con coordenadas en tiempo real.',
    render     : () => <TrazaTrailUI />,
  },
  {
    id         : '69-vp-cobre',
    label      : '[69] c_vp_cobre',
    description: 'Viewport red de cobre — dibuja rutas/distritos de la red de cobre activa con filtros por estado.',
    render     : () => <VpCobreUI />,
  },
  // ── PROXIMA MIGRACION: agregar entrada aqui ─────────────────────────────────
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
