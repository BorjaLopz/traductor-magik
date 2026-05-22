import React, { useEffect, useState } from 'react';
import * as turf from '@turf/turf';

// ─── Imports de componentes migrados ──────────────────────────────────────────
// [01] c_arbol_distritos_para_ruta
import { ArbolDistritosUI } from './migration/ArbolDistritosParaRuta';
import { mockGisService } from './migration/mockGisService';
// [02] c_seccionamiento
import Seccionamiento from './migration/Seccionamiento';
import type { Vista } from './migration/Seccionamiento';
// [03] ruta_opbs_plugin
import RutaOpbsPluginUI from './migration/RutaOpbsPlugin';
import type { COpbsService } from './migration/RutaOpbsPlugin';
// [04] c_sectores
import { SectoresUI } from './migration/Sectores';
// [05] c_elemento_empalme_g
import { ElementoEmpalmeGUI } from './migration/ElementoEmpalmeG';
// [06] c_elemento_seccion_g
import { ElementoSeccionGUI } from './migration/ElementoSeccionG';
// [07] c_elemento_nodo_g
import { ElementoNodoGUI } from './migration/ElementoNodoG';
// [08] c_creador_elemento_tramo_g
import { CreadorElementoTramoGUI } from './migration/CreadorElementoTramoG';
// [09] viewport_layout_mixin
import { ViewportLayoutMixinUI } from './migration/ViewportLayoutMixin';
// [10] c_texto_linea_grafico
import { TextoLineaGraficoUI } from './migration/TextoLineaGrafico';
// [11] layout_plot_engine.centraliza_launch
import { LayoutPlotEngineUI } from './migration/LayoutPlotEngine';
// [12] c_titulo_de_plano
import { TituloDePlanoUI } from './migration/TituloDePlano';
// [13] c_sello_simbologia_diagrama_empalmes
import { SelloSimbologiaDiagramaEmpallesUI } from './migration/SelloSimbologiaDiagramaEmpalmes';
// [14] c_sello_notas_sct_inst_puente
import { SelloNotasSctInstPuenteUI } from './migration/SelloNotasSctInstPuente';
// [15] c_sello_notas_sct_marg_sub
import { SelloNotasSctMargSubUI } from './migration/SelloNotasSctMargSub';
// [16] c_sello_simbologia_red_sec
import { SelloSimbologiaRedSecUI } from './migration/SelloSimbologiaRedSec';
// [17] c_sello_capacidad_cable
import { SelloCapacidadCableUI } from './migration/SelloCapacidadCable';
// [18] c_simbologia_plano_reubicacion_terminales
import { SimbologiaPlanoReubicacionTerminalesUI } from './migration/SimbologiaPlanoReubicacionTerminales';
// [19] c_vp_detalle_interno_edificio
import { VpDetalleInternoEdificioUI } from './migration/VpDetalleInternoEdificio';
// [20] c_sello_competencia_telmex
import { SelloCompetenciaTelmexUI } from './migration/SelloCompetenciaTelmex';
// [21] c_imagen_bmp
import { CImagenBmpUI } from './migration/CImagenBmp';
// [22] c_croquis
import { CCroquisUI } from './migration/CCroquis';
// [23] c_sello_estandar_ctl
import { SelloEstandarCtlUI } from './migration/SelloEstandarCtl';
// [24] c_vp_croquis_proy_can
import { VpCroquisProyCanUI } from './migration/VpCroquisProyCan';
// [25] c_sello_aumentos_secundarios
import { SelloAumentosSecundariosUI } from './migration/SelloAumentosSecundarios';
// [26] c_fila
import { CFilaUI } from './migration/CFila';
// [27] c_tabla_georeferencia
import { CTablaGeoreferenciaUI } from './migration/CTablaGeoreferencia';
// [28] c_cfg_bloque_titdet_editable_mixin
import { CfgBloqueTitdetEditableMixinUI } from './migration/CfgBloqueTitdetEditableMixin';
// [26] c_plano_desmontaje_cd
import { PlanoDesmontajeCdUI } from './migration/PlanoDesmontajeCd';
// [27] c_sello_estandar_construccion
import { SelloEstandarConstruccionUI } from './migration/SelloEstandarConstruccion';
// [28] c_sello_pie_diag_emp
import { SelloPieDiagEmpUI } from './migration/SelloPieDiagEmp';
// [27] polyline_layout
import { PolylineLayoutUI } from './migration/migration/PolylineLayout';
// [28] c_simbologia_ocupacion_de_ductos
import { SimbologiaOcupacionDeDuctosUI } from './migration/migration/SimbologiaOcupacionDeDuctos';
// [29] c_pep_dcs
import { PepDcsUI } from './migration/migration/PepDcs';
// [30] c_sello_notas_sct_cruz_sub
import { SelloNotasSctCruzSubUI } from './migration/migration/SelloNotasSctCruzSub';
// [31] symbol_layout
import { SymbolLayoutUI } from './migration/migration/SymbolLayout';
// [32] c_traductor
import { TraductorUI } from './migration/migration/Traductor';
// [33] c_circulo_grafico
import { CirculoGraficoUI } from './migration/migration/CirculoGrafico';
// [34] c_placa_fosc350c
import { PlacaFosc350cUI } from './migration/migration/PlacaFosc350c';
// [35] c_ocupacion_de_vias
import { OcupacionDeViasUI } from './migration/migration/OcupacionDeVias';
// [36] cuadro_de_notas_plugin
import { CuadroDeNotasPluginUI } from './migration/migration/CuadroDeNotasPlugin';
// [37] c_detalles_layout
import { DetallesLayoutUI } from './migration/migration/DetallesLayout';
// [38] c_simbolo_longitud_trazo_gazas
import { SimboloLongitudTrazoGazasUI } from './migration/migration/SimboloLongitudTrazoGazas';
// [39] c_margen_layout
import { MargenLayoutUI } from './migration/migration/MargenLayout';
// [40] c_simbologia_plano_construccion
import { SimbologiaPlanoConstruccionUI } from './migration/migration/SimbologiaPlanoConstruccion';
// [41] c_elementos_tramo_g
import { ElementosTramoGUI } from './migration/migration/ElementosTramoG';
// [42] c_dibuja
import { DibujaUI } from './migration/migration/Dibuja';
// [43] c_plano_e
import { PlanoEUI } from './migration/migration/PlanoE';
// [44] c_elemento_empalme_subterraneo_g
import { ElementoEmpalmeSubterraneoGUI } from './migration/migration/ElementoEmpalmeSubterraneoG';
// [45] c_celdas_grafico
import { CeldasGraficoUI } from './migration/migration/CeldasGrafico';
// [46] c_linea_grafico
import { LineaGraficoUI } from './migration/migration/LineaGrafico';
// [47] c_vp_ubicacion_cedo
import { VpUbicacionCedoUI } from './migration/migration/VpUbicacionCedo';
// [48] c_tbl_cfg_mixin
import { TblCfgMixinUI } from './migration/migration/TblCfgMixin';
// [49] c_area_telmex
import { AreaTelmexUI } from './migration/AreaTelmex';
// [50] c_Corte_Geografico
import { CorteGeograficoUI } from './migration/CorteGeografico';
// [51] c_elemento_empalme_derivacion_g
import { ElementoEmpalmeDerivacionGUI } from './migration/ElementoEmpalmeDerivacionG';
// [52] c_plano_ruta_de_cables
import { PlanoRutaDeCablesUI } from './migration/PlanoRutaDeCables';
// [53] c_sello_correspondencias
import { SelloCorrespondenciasUI } from './migration/SelloCorrespondencias';
// [54] c_sello_estandar
import { SelloEstandarUI } from './migration/SelloEstandar';
// [55] c_sello_estandar_base
import { SelloEstandarBaseUI } from './migration/SelloEstandarBase';
// [56] c_sello_lista_cables
import { SelloListaCablesUI } from './migration/SelloListaCables';
// [57] c_sello_notas_sct_cruz_aereo
import { SelloNotasSctCruzAereoUI } from './migration/SelloNotasSctCruzAereo';
// [58] c_sello_notas_sct_inst_puente_tn
import { SelloNotasSctInstPuenteTnUI } from './migration/SelloNotasSctInstPuenteTn';
// [59] c_sello_notas_sct_marg_aereo
import { SelloNotasSctMargAereoUI } from './migration/SelloNotasSctMargAereo';
// [60] c_servicios_estilos
import { ServiciosEstilosUI } from './migration/ServiciosEstilos';
// [61] c_simbologia_plano_construccion_fo
import { SimbologiaPlanoContruccionFoUI } from './migration/SimbologiaPlanoContruccionFo';
// [62] c_simbologia_plano_reubicacion_exist_proy
import { SimbologiaPlanoReubicacionExistProyUI } from './migration/SimbologiaPlanoReubicacionExistProy';
// [63] c_style_symbol_open_dialog
import { StyleSymbolOpenDialogUI } from './migration/StyleSymbolOpenDialog';
// [64] c_tabla_enc_georeferencia
import { TablaEncGeoreferenciaUI } from './migration/TablaEncGeoreferencia';
// [65] c_tachado_grafico
import { TachadoGraficoUI } from './migration/TachadoGrafico';
// [66] c_tipo_geom
import { TipoGeomUI } from './migration/TipoGeom';
// [67] c_Traductor (alias — TraductorUI ya importado desde migration/migration/)
import { TraductorUI as TraductorBaseUI } from './migration/Traductor';
// [68] c_traza_trail
import { TrazaTrailUI } from './migration/TrazaTrail';
// [69] c_vp_cobre
import { VpCobreUI } from './migration/VpCobre';
// [70] c_simbolo_grafico
import { CSimboloGraficoUI } from './migration/CSimboloGrafico';
// [71] c_gui_edita_sello_resumen_proyecto
import { CGuiEditaSelloResumenProyectoUI } from './migration/CGuiEditaSelloResumenProyecto';
// [72] preview_symbol_plugin
import { PreviewSymbolPluginUI } from './migration/PreviewSymbolPlugin';
// [73] c_celdas
import { CCeldasUI } from './migration/CCeldas';
// [77] c_arbol_cables_fo_cedo
import { CArbolCablesFoCedoUI } from './migration/CArbolCablesFoCedo';
// [78] c_resumen_materiales
import { CResumenMaterialesUI } from './migration/CResumenMateriales';
// [79] c_sello_nota_restrictiva_sct
import { CSelloNotaRestrictivaSctUI } from './migration/CSelloNotaRestrictivaSct';
// [80] c_catalogo_de_placas_plugin
import { CCatalogoDeplacasPluginUI } from './migration/CCatalogoDeplacasPlugin';
// [81] c_factory_planos
import { CFactoryPlanosUI } from './migration/CFactoryPlanos';
// [82] c_sello_notas_adicionales_sct
import { CSelloNotasAdicionalesSctUI } from './migration/CSelloNotasAdicionalesSct';
// [83] c_sello_notas_sct
import { CSelloNotasSctUI } from './migration/CSelloNotasSct';
// [84] c_dto_pronostico
import { CDtoPronosticoUI } from './migration/CDtoPronostico';
// [88] c_sello_reconcentracion
import { CSelloReconcentracionUI } from './migration/CSelloReconcentracion';
// [89] c_placa_principales
import { CPlacaPrincipalesUI } from './migration/CPlacaPrincipales';
// [90] c_placa_secundarios
import { CPlacaSecundariosUI } from './migration/CPlacaSecundarios';
// [91] c_resumen_optico
import { CResumenOpticoUI } from './migration/CResumenOptico';
// [92] tabla_cables_proy
import { CTablaCablesProyUI } from './migration/CTablaCablesProy';
// [93] c_lista_materiales_esquema_red
import { CListaMaterialesEsquemaRedUI } from './migration/CListaMaterialesEsquemaRed';
// [94] c_vp_plano_proy_can
import { CVpPlanoProjCanUI } from './migration/CVpPlanoProjCan';
import { CElementosUI } from './migration/CElementos';
import { CFilasUI } from './migration/CFilas';
import { CCentralEUI } from './migration/CCentralE';
import { CCfgBloqueTitdetEditableMixinUI } from './migration/CCfgBloqueTitdetEditableMixin';
// [85] textbox_layout
import { TextboxLayoutUI } from './migration/TextboxLayout';
// [86] c_placa_larga_distancia
import { CPlacaLargaDistanciaUI } from './migration/CPlacaLargaDistancia';
// [87] c_sello_dist_de_ter_a_cd
import { CSelloDistDeTerACdUI } from './migration/CSelloDistDeTerACd';
// [88] c_leyenda_ashurado
import { CLeyendaAshuradoUI } from './migration/CLeyendaAshurado';
// [85] marco_layout
import { MarcoLayoutUI } from './migration/MarcoLayout';
// [86] c_sembrado_layout
import { CSembradoLayoutUI } from './migration/CSembradoLayout';
// [87] style_element_mixin
import { StyleElementMixinUI } from './migration/StyleElementMixin';
// [88] c_plano_principales
import { CPlanoPrincipalesUI } from './migration/CPlanoPrincipales';
// [89] c_lista_materiales_esquema
import { CListaMaterialesEsquemaUI } from './migration/CListaMaterialesEsquema';
// [90] c_vp_croquis_edificio
import { CVpCroquisEdificioUI } from './migration/CVpCroquisEdificio';
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
  nEscala: 500,
  nMinModulos: 1,
  nMaxModulos: 5,
  nDefModAncho: 0.297,
  nDefModAlto: 0.210,
};
const rad2deg = (r: number) => ((r * 180) / Math.PI).toFixed(1) + '°';
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
  openDialog: (ruta, opb) => console.log('[COpbs] openDialog', ruta?.numero, opb?.nombre),
  closeDialog: () => console.log('[COpbs] closeDialog'),
  clearCache: () => console.log('[COpbs] clearCache'),
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
    { calculatedFiberLength: 87.5 },
    { calculatedFiberLength: 4200.0 },
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
    { nomNodo: 'NODO-BCN-03', tipo: 'RAMAN-AMP' },
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
// [29] Demo — c_simbolo_grafico
// =============================================================================
function DemoCSimboloGrafico() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_simbolo_grafico</h3>
      <CSimboloGraficoUI />
    </section>
  );
}

// ── [29] c_simbolo_grafico — anterior último componente ──────────────────────
function DemoPreviewSymbolPlugin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>preview_symbol_plugin</h3>
      <PreviewSymbolPluginUI />
    </section>
  );
}

// ── [31] preview_symbol_plugin — anterior último componente ──────────────────
// Demo anterior — comentado para llevar control histórico de migraciones.
// Se mantiene activo en DEMO_ITEMS para poder seleccionarlo desde el dropdown.
function DemoCCeldas() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_celdas</h3>
      <CCeldasUI />
    </section>
  );
}

// ── [76] c_celdas — anterior último componente ────────────────────────────────
function DemoCArbolCablesFoCedo() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_arbol_cables_fo_cedo</h3>
      <CArbolCablesFoCedoUI />
    </section>
  );
}

// ── [83] c_sello_notas_sct ───────────────────────────────────────────────────
function DemoCSelloNotasSct() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_sello_notas_sct</h3>
      <CSelloNotasSctUI />
    </section>
  );
}

// ── [82] c_sello_notas_adicionales_sct ───────────────────────────────────────
function DemoCSelloNotasAdicionalesSct() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_sello_notas_adicionales_sct</h3>
      <CSelloNotasAdicionalesSctUI />
    </section>
  );
}

// ── [81] c_factory_planos ─────────────────────────────────────────────────────
function DemoCFactoryPlanos() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_factory_planos</h3>
      <CFactoryPlanosUI />
    </section>
  );
}

// ── [80] c_catalogo_de_placas_plugin ─────────────────────────────────────────
function DemoCCatalogoDeplacasPlugin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_catalogo_de_placas_plugin</h3>
      <CCatalogoDeplacasPluginUI />
    </section>
  );
}

// ── [79] c_sello_nota_restrictiva_sct ────────────────────────────────────────
function DemoCSelloNotaRestrictivaSct() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_sello_nota_restrictiva_sct</h3>
      <CSelloNotaRestrictivaSctUI />
    </section>
  );
}

// ── [78] c_resumen_materiales ─────────────────────────────────────────────────
function DemoCResumenMateriales() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_resumen_materiales</h3>
      <CResumenMaterialesUI />
    </section>
  );
}

// ── [76] c_celdas — anterior último componente ───────────────────────────────
// Demo anterior — comentado para llevar control histórico de migraciones.
// Se mantiene activo en DEMO_ITEMS para poder seleccionarlo desde el dropdown.
function DemoCElementos() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_elementos</h3>
      <CElementosUI />
    </section>
  );
}

// ── [77] c_elementos — anterior último componente ────────────────────────────
// Demo anterior — comentado para llevar control histórico de migraciones.
// Se mantiene activo en DEMO_ITEMS para poder seleccionarlo desde el dropdown.
function DemoCFilas() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_filas</h3>
      <CFilasUI />
    </section>
  );
}

// ── [78] c_filas — anterior último componente ────────────────────────────────
// Demo anterior — comentado para llevar control histórico de migraciones.
// Se mantiene activo en DEMO_ITEMS para poder seleccionarlo desde el dropdown.
function DemoCCentralE() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_central_e</h3>
      <CCentralEUI />
    </section>
  );
}

// ── [79] c_central_e — anterior último componente ────────────────────────────
function DemoCCfgBloqueTitdetEditableMixin() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_cfg_bloque_titdet_editable_mixin</h3>
      <CCfgBloqueTitdetEditableMixinUI />
    </section>
  );
}

// ── [30] c_gui_edita_sello_resumen_proyecto — anterior último componente ──────
function DemoCGuiEditaSelloResumenProyecto() {
  return (
    <section style={s.section}>
      <h3 style={s.h3}>c_gui_edita_sello_resumen_proyecto</h3>
      <CGuiEditaSelloResumenProyectoUI />
    </section>
  );
}

// =============================================================================
// REGISTRO DE MIGRACIONES
// Al añadir una nueva migración: agregar entrada aquí + import arriba.
// =============================================================================
type DemoItem = {
  id: string;
  label: string;
  description: string;
  render: () => React.ReactNode;
};

const DEMO_ITEMS: DemoItem[] = [

  // ── LOGICA pura — sin OL ───────────────────────────────────────────────────
  {
    id: '01-ruta-opbs',
    label: '[01] ruta_opbs_plugin',
    description: 'Plugin ciclo de vida del diálogo c_opbs — cierra+recrea si ya abierto.',
    render: () => <DemoRutaOpbsPlugin />,
  },
  {
    id: '02-seccionamiento',
    label: '[02] c_seccionamiento',
    description: 'Divide una LineString en viewports/vistas según tamaño mínimo de módulos.',
    render: () => <DemoSeccionamiento />,
  },
  {
    id: '03-arbol-distritos',
    label: '[03] c_arbol_distritos_para_ruta',
    description: 'Árbol de distritos con checkbox + botones Agregar / Desagregar / Agregar del mapa.',
    render: () => <DemoArbolDistritos />,
  },

  // ── MIXTO — lógica + algo OL ───────────────────────────────────────────────
  {
    id: '04-sectores',
    label: '[04] c_sectores',
    description: 'Chaining de segmentos: une extremos coincidentes en cadenas continuas.',
    render: () => <SectoresUI />,
  },
  {
    id: '05-elemento-empalme-g',
    label: '[05] c_elemento_empalme_g',
    description: 'SVG: empalme de cobre — línea + rombo + etiqueta ER-NNN.',
    render: () => <DemoElementoEmpalme />,
  },
  {
    id: '06-elemento-seccion-g',
    label: '[06] c_elemento_seccion_g',
    description: 'SVG: sección de fibra óptica — |---| + longitud calculada (11 dígitos).',
    render: () => <DemoElementoSeccion />,
  },
  {
    id: '07-elemento-nodo-g',
    label: '[07] c_elemento_nodo_g',
    description: 'SVG: nodo EDFA — 3 etiquetas (nomNodo / D.O. / tipo) + símbolo círculo+triángulo.',
    render: () => <DemoElementoNodo />,
  },
  {
    id: '08-creador-elemento-tramo-g',
    label: '[08] c_creador_elemento_tramo_g',
    description: 'Factory: crea empalme/sección/nodo según entityType (discriminated union).',
    render: () => <CreadorElementoTramoGUI />,
  },
  {
    id: '09-traza-trail',
    label: '[09] c_traza_trail',
    description: 'Traza trail — captura y visualiza la polilínea activa del mapa con coordenadas en tiempo real.',
    render: () => <TrazaTrailUI />,
  },

  // ── LAYOUT simple ──────────────────────────────────────────────────────────
  {
    id: '10-polyline-layout',
    label: '[10] polyline_layout',
    description: 'Atributos base de polilinea: coordenadas y estilo.',
    render: () => <DemoPolylineLayout />,
  },
  {
    id: '11-viewport-layout-mixin',
    label: '[11] viewport_layout_mixin',
    description: 'Mixin de conexión a viewport — guard id>0 evita reconexión.',
    render: () => <ViewportLayoutMixinUI />,
  },
  {
    id: '12-sello-estandar',
    label: '[12] c_sello_estandar',
    description: 'Sello estándar de plano — tablas título/proyecto/datos con llenado async desde servicio GIS.',
    render: () => <SelloEstandarUI />,
  },
  {
    id: '13-texto-linea-grafico',
    label: '[13] c_texto_linea_grafico',
    description: 'Extiende c_texto_grafico: texto + línea horizontal al pie del bbox.',
    render: () => <TextoLineaGraficoUI />,
  },
  {
    id: '14-style-symbol-open-dialog',
    label: '[14] c_style_symbol_open_dialog',
    description: 'Diálogo selección de símbolo de estilo — abre editor de símbolo GIS para entidad activa.',
    render: () => <StyleSymbolOpenDialogUI />,
  },
  {
    id: '15-layout-plot-engine',
    label: '[15] layout_plot_engine',
    description: 'Lanzador background con guard de instancia única + UI de interrupción.',
    render: () => <LayoutPlotEngineUI />,
  },
  {
    id: '16-tachado-grafico',
    label: '[16] c_tachado_grafico',
    description: 'Tachado gráfico — overlay SVG de línea diagonal para marcar elementos eliminados.',
    render: () => <TachadoGraficoUI />,
  },
  {
    id: '17-titulo-de-plano',
    label: '[17] c_titulo_de_plano',
    description: 'Título de plano auto-posicionado en esquina inferior-derecha del contenedor.',
    render: () => <TituloDePlanoUI />,
  },
  {
    id: '18-tipo-geom',
    label: '[18] c_tipo_geom',
    description: 'Tipo de geometría — discriminador point/line/polygon para features del dataset GIS.',
    render: () => <TipoGeomUI />,
  },
  {
    id: '19-simbologia-ocupacion-ductos',
    label: '[19] c_simbologia_ocupacion_de_ductos',
    description: 'Tabla 1x1 con simbolo ocupacion_de_ductos.',
    render: () => <DemoSimbologiaOcupacionDeDuctos />,
  },
  {
    id: '20-simbologia-plano-construccion-fo',
    label: '[20] c_simbologia_plano_construccion_fo',
    description: 'Simbología plano construcción FO — leyenda de símbolos fibra óptica con categorías.',
    render: () => <SimbologiaPlanoContruccionFoUI />,
  },
  {
    id: '21-sello-simbologia-diagrama-empalmes',
    label: '[21] c_sello_simbologia_diagrama_empalmes',
    description: 'Cuadro de simbología de diagrama de empalmes — tbl_titulo (8×65) + tbl_contenido (110×65).',
    render: () => <SelloSimbologiaDiagramaEmpallesUI />,
  },
  {
    id: '22-pep-dcs',
    label: '[22] c_pep_dcs',
    description: 'Tabla PEP con titulos y valores de referencia.',
    render: () => <DemoPepDcs />,
  },
  {
    id: '23-sello-notas-sct-cruz-aereo',
    label: '[23] c_sello_notas_sct_cruz_aereo',
    description: 'Notas SCT cruce aéreo — tabla notas estáticas para instalación en cruce aéreo.',
    render: () => <SelloNotasSctCruzAereoUI />,
  },
  {
    id: '24-sello-notas-sct-cruz-sub',
    label: '[24] c_sello_notas_sct_cruz_sub',
    description: 'Notas generales para cruce subterraneo.',
    render: () => <DemoSelloNotasSctCruzSub />,
  },
  {
    id: '25-sello-notas-sct-inst-puente',
    label: '[25] c_sello_notas_sct_inst_puente',
    description: 'Notas SCT instalación lateral en puente — tabla 2×1 (10mm+170mm, 165mm ancho), notas 1-11.',
    render: () => <SelloNotasSctInstPuenteUI />,
  },
  {
    id: '26-sello-notas-sct-inst-puente-tn',
    label: '[26] c_sello_notas_sct_inst_puente_tn',
    description: 'Notas SCT instalación puente TN — variante túnel/nodo de tabla notas instalación lateral.',
    render: () => <SelloNotasSctInstPuenteTnUI />,
  },
  {
    id: '27-sello-notas-sct-marg-aereo',
    label: '[27] c_sello_notas_sct_marg_aereo',
    description: 'Notas SCT instalación marginal aérea — tabla notas para tendido marginal en poste.',
    render: () => <SelloNotasSctMargAereoUI />,
  },
  {
    id: '28-sello-notas-sct-marg-sub',
    label: '[28] c_sello_notas_sct_marg_sub',
    description: 'Notas SCT instalación marginal subterránea — tabla 2×1 (10mm+265mm, 170mm ancho), notas 1-15.',
    render: () => <SelloNotasSctMargSubUI />,
  },
  {
    id: '29-traductor',
    label: '[29] c_traductor',
    description: 'Traduccion de claves para planos y PEP.',
    render: () => <DemoTraductor />,
  },
  {
    id: '30-sello-simbologia-red-sec',
    label: '[30] c_sello_simbologia_red_sec',
    description: 'Simbología red secundaria FO — 3 tablas: título (8×130) + cabecera 3 columnas (8×60+35+35) + contenido (110×130).',
    render: () => <SelloSimbologiaRedSecUI />,
  },
  {
    id: '31-symbol-layout',
    label: '[31] symbol_layout',
    description: 'Listado de simbolos y muestra con color/rotacion.',
    render: () => <DemoSymbolLayout />,
  },
  {
    id: '32-tabla-enc-georeferencia',
    label: '[32] c_tabla_enc_georeferencia',
    description: 'Tabla encabezado georreferencia — coordenadas UTM del área del plano en tabla estándar.',
    render: () => <TablaEncGeoreferenciaUI />,
  },
  {
    id: '33-sello-capacidad-cable',
    label: '[33] c_sello_capacidad_cable',
    description: 'Cuadro de capacidad de cable — tbl_titulo (2×1, 12×44u) + tbl_contenido (18×2, 108×44u). 18 tipos: A→10PS. … Z→FIBRAS OPTICAS.',
    render: () => <SelloCapacidadCableUI />,
  },
  {
    id: '34-circulo-grafico',
    label: '[34] c_circulo_grafico',
    description: 'Circulo centrado con radio escalado.',
    render: () => <DemoCirculoGrafico />,
  },
  {
    id: '35-detalles-layout',
    label: '[35] c_detalles_layout',
    description: 'Textos de copyright del plano de detalle.',
    render: () => <DemoDetallesLayout />,
  },
  {
    id: '36-cuadro-notas-plugin',
    label: '[36] cuadro_de_notas_plugin',
    description: 'Plugin para abrir el cuadro de notas.',
    render: () => <DemoCuadroDeNotasPlugin />,
  },
  {
    id: '37-ocupacion-de-vias',
    label: '[37] c_ocupacion_de_vias',
    description: 'Simbolo con color y transformaciones.',
    render: () => <DemoOcupacionDeVias />,
  },
  {
    id: '38-placa-fosc350c',
    label: '[38] c_placa_fosc350c',
    description: 'Simbolo con color y transformaciones.',
    render: () => <DemoPlacaFosc350c />,
  },
  {
    id: '39-simbologia-reubicacion-exist-proy',
    label: '[39] c_simbologia_plano_reubicacion_exist_proy',
    description: 'Simbología reubicación existente/proyectado — leyenda dual: elementos a reubicar vs nuevos.',
    render: () => <SimbologiaPlanoReubicacionExistProyUI />,
  },
  {
    id: '40-simbologia-reubicacion-terminales',
    label: '[40] c_simbologia_plano_reubicacion_terminales',
    description: 'Símbolo configurable: name/colour/angle/flip/mirror. Catálogo SVG inline (5 símbolos). Halo blanco vía SVG filter feMorphology.',
    render: () => <SimbologiaPlanoReubicacionTerminalesUI />,
  },
  {
    id: '41-simbolo-longitud-trazo-gazas',
    label: '[41] c_simbolo_longitud_trazo_gazas',
    description: 'Simbolo con color y transformaciones.',
    render: () => <DemoSimboloLongitudTrazoGazas />,
  },
  {
    id: '42-margen-layout',
    label: '[42] c_margen_layout',
    description: 'Margen del layout con segmentos guia.',
    render: () => <DemoMargenLayout />,
  },
  {
    id: '43-plano-ruta-cables',
    label: '[43] c_plano_ruta_de_cables',
    description: 'Plano de ruta de cables — orquestador layout: marco + sello + viewports de ruta.',
    render: () => <PlanoRutaDeCablesUI />,
  },
  {
    id: '44-simbologia-plano-construccion',
    label: '[44] c_simbologia_plano_construccion',
    description: 'Cuadro de simbologia del plano de construccion.',
    render: () => <DemoSimbologiaPlanoConstruccion />,
  },
  {
    id: '45-vp-detalle-interno-edificio',
    label: '[45] c_vp_detalle_interno_edificio',
    description: 'Viewport planta TBA — ACE :mit_floor_internal, oResulSet GeoJSON, barra de título 100u debajo (c_titulo_de_plano). draw_content_on delega a _super.',
    render: () => <VpDetalleInternoEdificioUI />,
  },
  {
    id: '46-elementos-tramo-g',
    label: '[46] c_elementos_tramo_g',
    description: 'Resumen de longitud y elementos habilitados.',
    render: () => <DemoElementosTramoG />,
  },
  {
    id: '47-sello-lista-cables',
    label: '[47] c_sello_lista_cables',
    description: 'Lista de cables — tabla dinámica N filas × columnas de tipo/capacidad/longitud.',
    render: () => <SelloListaCablesUI />,
  },
  {
    id: '48-sello-competencia-telmex',
    label: '[48] c_sello_competencia_telmex',
    description: 'Competencia telefónica por edificio — 10 filas × 3 cols {10,27,7}u. Tabla abierta. Async llena_datos_celdas() → mock BD GIS (IDs: 101, 202, 303).',
    render: () => <SelloCompetenciaTelmexUI />,
  },
  {
    id: '49-servicios-estilos',
    label: '[49] c_servicios_estilos',
    description: 'Catálogo de estilos GIS — mapeo símbolo→estilo para entidades del dataset.',
    render: () => <ServiciosEstilosUI />,
  },
  {
    id: '50-imagen-bmp',
    label: '[50] c_imagen_bmp',
    description: 'Contenedor BMP — wrappea bitmap_layout con flip H/V + fit. new() y new_from() con conversión de márgenes /10. Despliega() asigna oArea a bounds.',
    render: () => <CImagenBmpUI />,
  },
  {
    id: '51-vp-cobre',
    label: '[51] c_vp_cobre',
    description: 'Viewport red de cobre — dibuja rutas/distritos de la red de cobre activa con filtros por estado.',
    render: () => <VpCobreUI />,
  },
  {
    id: '52-croquis',
    label: '[52] c_croquis',
    description: 'Croquis de localización — ordenamiento() encadena tramos, dibujaTrazo() buffer Turf.js, croquisProyecCanaliz() genera viewport+norte+título en layout.',
    render: () => <CCroquisUI />,
  },
  {
    id: '53-elemento-empalme-derivacion-g',
    label: '[53] c_elemento_empalme_derivacion_g',
    description: 'SVG: empalme con derivación — símbolo línea+rombo+bifurcación, etiqueta ER-NNN.',
    render: () => <ElementoEmpalmeDerivacionGUI />,
  },
  {
    id: '54-elemento-empalme-subterraneo-g',
    label: '[54] c_elemento_empalme_subterraneo_g',
    description: 'Empalme subterraneo con margenes internos.',
    render: () => <DemoElementoEmpalmeSubterraneoG />,
  },
  {
    id: '55-plano-e',
    label: '[55] c_plano_e',
    description: 'Entidad de plano: proyecto, nombre, tipo y comentario.',
    render: () => <DemoPlanoE />,
  },
  {
    id: '56-dibuja',
    label: '[56] c_dibuja',
    description: 'Dibujo de trazos con traslacion y rotacion.',
    render: () => <DemoDibuja />,
  },
  {
    id: '57-sello-estandar-ctl',
    label: '[57] c_sello_estandar_ctl',
    description: 'Sello CTL — tbl_CeldaA(70×15mm,2f) + tbl_CeldaB(45×15mm,1f). draw_content_on empuja atributos→celdas. lee_datos_BdeD() async desde oProyecto mock.',
    render: () => <SelloEstandarCtlUI />,
  },
  {
    id: '58-area-telmex',
    label: '[58] c_area_telmex',
    description: 'Área de cobertura Telmex — polígono configurable con atributos de área y municipio.',
    render: () => <AreaTelmexUI />,
  },
  {
    id: '59-sello-aumentos-secundarios',
    label: '[59] c_sello_aumentos_secundarios',
    description: 'Sello de aumento de red secundaria — tabla 2×5 (sin red directa) ó 3×5 (con RED DIRECTA). Colores: verde/rojo/naranja. Async inicializaConGis() → mock BD GIS (D-01…D-04).',
    render: () => <SelloAumentosSecundariosUI />,
  },
  {
    id: '60-vp-croquis-proy-can',
    label: '[60] c_vp_croquis_proy_can',
    description: 'Viewport croquis canalización — objetos_visibles() filtra 6 tipos con predicados Turf.js (buffer 500m). Título "CROQUIS DE LOCALIZACION" en rgb(175,175,93).',
    render: () => <VpCroquisProyCanUI />,
  },
  {
    id: '61-sello-correspondencias',
    label: '[61] c_sello_correspondencias',
    description: 'Correspondencias ópticas — tbl_titulo(1×1,110mm) + tbl_subtitulos(1×2,55+55mm) + tbl_contenido(N×7). Max 40 filas.',
    render: () => <SelloCorrespondenciasUI />,
  },
  {
    id: '62-celdas-grafico',
    label: '[62] c_celdas_grafico',
    description: 'Celda con bordes opcionales dibujados sobre el area.',
    render: () => <DemoCeldasGrafico />,
  },
  {
    id: '63-fila',
    label: '[63] c_fila',
    description: 'Modelo de fila de tabla — nLongitud setter valida ≥0 y almacena ×10 (mm→décimas de mm). serial_slots() ÷10 al serializar. new_from_serial / init_with / perform_private.',
    render: () => <CFilaUI />,
  },
  {
    id: '64-linea-grafico',
    label: '[64] c_linea_grafico',
    description: 'Linea entre dos puntos proporcionales del area (OL + Turf).',
    render: () => <DemoLineaGrafico />,
  },
  {
    id: '65-traductor-base',
    label: '[65] c_Traductor',
    description: 'Traductor de códigos GIS — 7 métodos lookup: tipoSuperficie/tipoCentral/tipoPlano/tipoCaseta/mes/metodoPep/nombreAtributoPep.',
    render: () => <TraductorBaseUI />,
  },
  {
    id: '66-plano-desmontaje-cd',
    label: '[66] c_plano_desmontaje_cd',
    description: 'Plano desmontaje Caja Distribución — genera_plano() compone marco(3×1) + sello_proyecto_canalizacion + viewport_layout. Escala por ratio bounds o view_scale si ángulo > 0.1°.',
    render: () => <PlanoDesmontajeCdUI />,
  },

  // =============================================================================
  // [27] Demo inline — c_sello_estandar_construccion
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoSelloEstandarConstruccion() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sello_estandar_construccion</h3>
  //       <p style={s.meta}>
  //         Sello estándar de construcción. 3 tablas: tbl_Ctl_Dto + tbl_CP_Ruta_Nse + tbl_del_mpo.
  //         Override usuario vs. distrito para: colonia, municipio, cp, ruta.
  //         Split empresa por "|" → 3 líneas (TELMEX/RNUM/RUMN).
  //       </p>
  //       <SelloEstandarConstruccionUI />
  //     </section>
  //   );
  // }

  {
    id: '27-sello-estandar-construccion',
    label: '[27] c_sello_estandar_construccion',
    description: 'Sello construcción — tbl_Ctl_Dto(2f×1c) + tbl_CP_Ruta_Nse(2f×3c) + tbl_del_mpo(2f×2c,sin bordes). Override attrs usuario > distrito. Split empresa por "|" → TELMEX/RNUM/RUMN.',
    render: () => <SelloEstandarConstruccionUI />,
  },
  // ── [27] c_sello_estandar_construccion — anterior último componente migrado ──

  // =============================================================================
  // [28] Demo inline — c_sello_pie_diag_emp
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoSelloPieDiagEmp() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sello_pie_diag_emp</h3>
  //       <p style={s.meta}>
  //         Sello pie diagrama empalmes. tbl_colonia_cp (2f×2c, sin bordes).
  //         delegacion_municipio(): Turf.js booleanWithin + booleanIntersects.
  //         Ramas: :principales/:trabajo/:enlace → building; :secundaria → CD o fallback.
  //       </p>
  //       <SelloPieDiagEmpUI />
  //     </section>
  //   );
  // }

  {
    id: '28-sello-pie-diag-emp',
    label: '[28] c_sello_pie_diag_emp',
    description: 'Sello pie diagrama empalmes — tbl_colonia_cp(2f×2c,sin bordes). delegacion_municipio() → Turf booleanWithin+booleanIntersects. Ramas: :principales/:trabajo/:enlace→building; :secundaria→CD o fallback.',
    render: () => <SelloPieDiagEmpUI />,
  },
  {
    id: '67-vp-ubicacion-cedo',
    label: '[67] c_vp_ubicacion_cedo',
    description: 'Viewport DETALLE DE CANALIZACION (filtro + titulo).',
    render: () => <DemoVpUbicacionCedo />,
  },
  {
    id: '68-tabla-georeferencia',
    label: '[68] c_tabla_georeferencia',
    description: 'Sello georreferencia terminales ópticas: tbl_datos (N×3: nombre/estado/dist) + tbl_coord (N×2×3: X/Y|GEO|UTM). Zonas UTM 11–16. Filtra por LiteralTerminal.',
    render: () => <DemoTablaGeoreferencia />,
  },
  {
    id: '69-sello-estandar-base',
    label: '[69] c_sello_estandar_base',
    description: 'Sello estándar base — hereda c_base_sello_cobre, 4 tablas, DESP_Y=-124mm. FALC: sinBordes en tbl_ubicacion.',
    render: () => <SelloEstandarBaseUI />,
  },
  {
    id: '70-cfg-bloque-titdet-editable-mixin',
    label: '[70] c_cfg_bloque_titdet_editable_mixin',
    description: 'Mixin de bordes: cfg_tbl_titulo (6×3, contorno "a modo") + cfg_tbl_detalle (8×N, caja cols 3-6 + col-5 editable). Vista SVG before/after.',
    render: () => <DemoCfgBloqueTitdetEditableMixin />,
  },
  {
    id: '71-tbl-cfg-mixin',
    label: '[71] c_tbl_cfg_mixin',
    description: 'Configuracion de bordes de tabla (titulo / detalle).',
    render: () => <DemoTblCfgMixin />,
  },
  {
    id: '72-corte-geografico',
    label: '[72] c_Corte_Geografico',
    description: 'Corte geográfico — OL v10 + Turf.js: buffer 0.5km sobre ruta, filtra capas por booleanDisjoint, dibuja colonia/lote/distrito.',
    render: () => <CorteGeograficoUI />,
  },
  {
    id: '73-simbolo-grafico',
    label: '[73] c_simbolo_grafico',
    description: 'Símbolo puntual GIS: catálogo sw_gis!gis_point_style (8 símbolos), :rotate/:flipped?/:mirror? → SVG transform. new() / new_from() / init_with() / serialSlots().',
    render: () => <DemoCSimboloGrafico />,
  },
  {
    id: '74-gui-edita-sello-resumen-proyecto',
    label: '[74] c_gui_edita_sello_resumen_proyecto',
    description: 'GUI editor de sello resumen proyecto: frame→modal, text_window→textarea, escribeTextoSelloAVentana()/escribeTextoAlSello() con .toUpperCase(), obtenSello() por className.',
    render: () => <DemoCGuiEditaSelloResumenProyecto />,
  },
  {
    id: '75-preview-symbol-plugin',
    label: '[75] preview_symbol_plugin',
    description: 'Plugin GIS de vista previa de símbolos: sigc_style_view (merge/post), manage_actions() habilita/deshabilita sw_actions según writable?+mode, c_preview_symbol_dialog con catálogo y databus :symbol_name.',
    render: () => <DemoPreviewSymbolPlugin />,
  },
  {
    id: '76-c-celdas',
    label: '[76] c_celdas',
    description: 'Contenedor de cuadrícula 2D: new(RnRen,RnCol) llena collCeldas con Map<pos,CCelda>; celda(ren,col) accede por índice lineal nNumCol*(ren−1)+col; serial_slots/new_from_serial; validación > 0 en setters.',
    render: () => <DemoCCeldas />,
  },
  {
    id: '84-c-elementos',
    label: '[84] c_elementos',
    description: 'Contenedor de c_elemento_grafico: Agregar_elemento(elem,nombre)+nTotal_Elementos++, obten_elemento(nombre), Despliega() async propaga oVentana(ol/source/Vector) + oArea(bbox Turf) a cada hijo y dispara Actualiza_Area_Elemento()+Despliega(). Serialización slotted.',
    render: () => <DemoCElementos />,
  },
  {
    id: '85-c-filas',
    label: '[85] c_filas',
    description: 'Contenedor 1D de c_fila: new(N) crea N CFila(10), elemento(i) acceso 1-based, Inicia_Elemento(N) acumula offset Y (suma 1..N-1), Longitud_Total() suma alturas, setter nTotal_Filas valida >0, serial_slots con echo nLong/10. Bug AND→OR original replicado.',
    render: () => <DemoCFilas />,
  },
  {
    id: '86-c-central-e',
    label: '[86] c_central_e',
    description: 'Entidad central/nodo: setSiglas(s) async dispara doble lookup BD GIS paralelo (Promise.all) → oCtl (gis.building) + oLimite (landbase.user!_central). Getters tipo/nombre/localidad/municipio_delegacion con fallback a oValorPorDefecto.',
    render: () => <DemoCCentralE />,
  },
  {
    id: '87-c-cfg-bloque-titdet-editable-mixin-v2',
    label: '[87] c_cfg_bloque_titdet_editable_mixin (v2)',
    description: 'Mixin de bordes (variante prefijo C, snake_case 1:1): cfg_tbl_titulo (3×5 contorno "a modo" + celda (3,3) abierta) y cfg_tbl_detalle (marco rectangular cols {3..6} + líneas internas en col {5}). 8 métodos. Render SVG dual before/after.',
    render: () => <DemoCCfgBloqueTitdetEditableMixin />,
  },

  // ── [76] c_celdas — anterior último componente ───────────────────────────────
  {
    id: '77-arbol-cables-fo-cedo',
    label: '[77] c_arbol_cables_fo_cedo',
    description: 'Árbol GIS FO: Distrito → CEDO → Cables con checkbox. activados() filtra source=sheath; generaPlanoCable() valida exactamente 1 seleccionado; valor_cambiado() actualiza cable_seleccionado.',
    render: () => <DemoCArbolCablesFoCedo />,
  },
  // ── [78] c_resumen_materiales ─────────────────────────────────────────────────
  {
    id: '78-resumen-materiales',
    label: '[78] c_resumen_materiales',
    description: 'Tabla layout GIS FO: 5 secciones (ZonaUrbana 13, ZonaSubUrbana 21, Tramo 11, Derivaciones 8, Permisos 15). sTipo=SEMBRADO omite las 2 últimas. inicializa()→prvCreaCfgTablas()→prvLlenaCeldas(). Cantidades_Xxx() inyecta valores.',
    render: () => <DemoCResumenMateriales />,
  },
  // ── [79] c_sello_nota_restrictiva_sct ────────────────────────────────────────
  {
    id: '79-sello-nota-restrictiva-sct',
    label: '[79] c_sello_nota_restrictiva_sct',
    description: 'Sello layout GIS: Nota Restrictiva SCT. 3 variables dinámicas (LsEstructura/LsPrefijo/LsTrabajo) según Tipo_Trabajo×Tipo_Cable. prvAsignaTexto() ensambla texto legal. Tabla 2×1: 10mm título + 40mm cuerpo × 145mm ancho.',
    render: () => <DemoCSelloNotaRestrictivaSct />,
  },
  // ── [80] c_catalogo_de_placas_plugin ─────────────────────────────────────────
  {
    id: '80-catalogo-de-placas-plugin',
    label: '[80] c_catalogo_de_placas_plugin',
    description: 'Plugin GIS: 8 sw_action (1 catálogo + 7 genera_placa_*). manageActions(bool) habilita/deshabilita las 7 acciones. cada genera_placa_*() → obtiene_pagina() + c_placa_*.new_with(:bounds, bounding_box) + page.add_element().',
    render: () => <DemoCCatalogoDeplacasPlugin />,
  },
  // ── [81] c_factory_planos ─────────────────────────────────────────────────────
  {
    id: '81-factory-planos',
    label: '[81] c_factory_planos',
    description: 'Clase base factory para planos de layout GIS. generaPlano()→iniciaLayout()+addElementosComunes(). Valida página vacía antes de crear. Añade marco (124×84cm), título posicionado relativo al marco, y 3 sellos (ruta_cables_fo, estandar_base_fo, notas_constructor). creaTitulo() diseñado para subclasearse.',
    render: () => <DemoCFactoryPlanos />,
  },
  // ── [82] c_sello_notas_adicionales_sct ───────────────────────────────────────
  {
    id: '82-sello-notas-adicionales-sct',
    label: '[82] c_sello_notas_adicionales_sct',
    description: 'Sello layout GIS: Notas Adicionales SCT. 3 atributos (Material×Trabajo×Cable). 2 variables de concordancia de género: LsPrefijo (trabajo) + LsPrefijoMat (material: POSTERIA/CANALETA → femenino). Tabla 2×1: 10mm título + 50mm cuerpo × 160mm ancho.',
    render: () => <DemoCSelloNotasAdicionalesSct />,
  },
  // ── [83] c_sello_notas_sct ───────────────────────────────────────────────────
  {
    id: '83-sello-notas-sct',
    label: '[83] c_sello_notas_sct',
    description: 'Sello layout GIS: Notas SCT. 4 atributos: estado (texto libre sin enum), tipo_cable, procedimiento, instalacion. Solo "estado" (uppercase) aparece en el texto — 4 notas numeradas fijas, nota 3 dinámica. Tabla 2×1: 10mm título + 55mm cuerpo × 155mm ancho.',
    render: () => <DemoCSelloNotasSct />,
  },
  // ── [83] c_sello_notas_sct — anterior último componente migrado ─────────────

  // =============================================================================
  // [84] Demo inline — c_dto_pronostico
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCDtoPronostico() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_dto_pronostico</h3>
  //       <p style={s.meta}>
  //         Sello layout "Resumen de materiales" — 3 sub-tablas apiladas verticalmente.
  //         tbl_Titulo(2×2,10mm) + tbl_pares(3×2,9mm) + tbl_pronosticos(3×3,9mm).
  //         Guard lazy bTablas_creadas. Celdas c_Captura_Texto editables.
  //       </p>
  //       <CDtoPronosticoUI />
  //     </section>
  //   );
  // }

  {
    id: '84-cdto-pronostico',
    label: '[84] c_dto_pronostico',
    description: 'Sello layout "Resumen de materiales" (red pares cobre) — tbl_Titulo(2×2,sin bordes,borde-inf celda1,2) + tbl_pares(3×2,bordes ext+rens) + tbl_pronosticos(3×3,todos bordes). Guard lazy bTablas_creadas en drawContentOn().',
    render: () => <CDtoPronosticoUI />,
  },
  // ── [84] c_dto_pronostico — anterior último componente migrado ──────────────

  // =============================================================================
  // [88] Demo inline — c_sello_reconcentracion
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCSelloReconcentracion() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sello_reconcentracion</h3>
  //       <p style={s.meta}>
  //         Sello "TABLA DE BAJANTES" — 11f×8c, 4 secciones, conteos UC por tipo.
  //         ucs() → filtro por distrito + costeo. llena_datos_celdas() → LcollTotalUcs.
  //         Bordes ocultos: fila 1 título fusionado, fila 2 secciones span 2 cols.
  //       </p>
  //       <CSelloReconcentracionUI />
  //     </section>
  //   );
  // }

  {
    id: '88-sello-reconcentracion',
    label: '[88] c_sello_reconcentracion',
    description: 'Sello TABLA DE BAJANTES (red cobre) — 11f×8c(13mm). Fila1 título fusionado (bBorde_Der?=false cols 1-7). 4 secciones: Precableado/Reconcentración/Reconexión(2 tipos)/Rehabilitación. ucs()→fetchUcs async→buildDataMatrix LcollTotalUcs[4][8].',
    render: () => <CSelloReconcentracionUI />,
  },
  // ── [88] c_sello_reconcentracion — anterior último componente migrado ────────

  // =============================================================================
  // [89] Demo inline — c_placa_principales
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCPlacaPrincipales() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_placa_principales</h3>
  //       <p style={s.meta}>
  //         Placa de identificación para principales — 6 tablas posicionadas.
  //         tbl_1/2/3 marco+logo. tbl_4/5/6: filas label|valor (bordes izq/inf/sup ocultos).
  //         8 atributos: sgl_ctl, cable, capacidad, calibre, cuenta, indicador, fecha, constructor.
  //         Fondo rgb(0.82,0.91,1) azul claro.
  //       </p>
  //       <CPlacaPrincipalesUI />
  //     </section>
  //   );
  // }

  {
    id: '89-placa-principales',
    label: '[89] c_placa_principales',
    description: 'Placa id principales (fibra) — 6 tablas posicionadas: tbl_1(130×50) marco + tbl_3 logo + tbl_4/5(1×6,7.5mm) + tbl_6(1×4,7.5mm). Bordes bBorde_Izq/Inf/Sup?=false en cols label→visual label|valor. Fondo rgb(209,232,255).',
    render: () => <CPlacaPrincipalesUI />,
  },
  // ── [89] c_placa_principales — anterior último componente migrado ────────────

  // =============================================================================
  // [90] Demo inline — c_placa_secundarios
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCPlacaSecundarios() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_placa_secundarios</h3>
  //       <p style={s.meta}>
  //         Placa de identificación para secundarios — layout idéntico a c_placa_principales.
  //         Diferencias: DISTRITO (no CAPACIDAD), dos CALIBRE (calibre1+calibre2), datos 22pt.
  //         8 atributos: sgl_ctl, distrito, cable, calibre1, calibre2, cuenta, fecha, constructor.
  //       </p>
  //       <CPlacaSecundariosUI />
  //     </section>
  //   );
  // }

  {
    id: '90-placa-secundarios',
    label: '[90] c_placa_secundarios',
    description: 'Placa id secundarios (fibra) — layout idéntico a [89]. Δ: tbl_4 col3→DISTRITO, tbl_5→CALIBRE+CALIBRE+CUENTA (dos calibres), datos 22pt. Atributos: sgl_ctl/distrito/cable/calibre1/calibre2/cuenta/fecha/constructor.',
    render: () => <CPlacaSecundariosUI />,
  },
  // =============================================================================
  // [91] Demo — c_resumen_optico
  // =============================================================================
  // function DemoCResumenOptico() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_resumen_optico</h3>
  //       <p style={s.desc}>
  //         Sello RESUMEN ÓPTICO para planos de CEDO. Recorre divisores → terminales →
  //         acumula carga por puerto (1-8). SENCILLA: cargaReal+=carga. DOBLE: 1ª→"8", 2ª→(carga-8).
  //         Verde=EXISTENTE, rojo=PROYECTO. 4 tablas: tbl_titulo_nco, tbl_titulo, tbl_contenido, tbl_total.
  //       </p>
  //       <CResumenOpticoUI />
  //     </section>
  //   );
  // }
  {
    id: '91-resumen-optico',
    label: '[91] c_resumen_optico',
    description: 'Sello RESUMEN ÓPTICO para CEDO. Recorre divisores→terminales, acumula carga/puerto. SENCILLA: suma directa. DOBLE: 1ª→8, 2ª→(carga-8). Verde=EXISTENTE, rojo=PROYECTO. DIVISOR_EQUIVALENCIA A-S→1-16.',
    render: () => <CResumenOpticoUI />,
  },
  // =============================================================================
  // [92] Demo — tabla_cables_proy
  // =============================================================================
  // function DemoCTablaCablesProy() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>tabla_cables_proy</h3>
  //       <p style={s.desc}>
  //         Tabla de layout que lista copper_cable EXISTENTE agrupados por spec_id.
  //         Columnas: Capacidad (size+" Ps."), Tipo, Calibre, Cantidad (mts, 2 decimales).
  //         buscar_elementos() filtra geometry_set del viewport. agrupar_elementos() acumula
  //         measured_length ?? calculated_length por spec_id en hash_table.
  //       </p>
  //       <CTablaCablesProyUI />
  //     </section>
  //   );
  // }
  {
    id: '92-tabla-cables-proy',
    label: '[92] tabla_cables_proy',
    description: 'Tabla copper_cable EXISTENTE agrupados por spec_id. Columnas: Capacidad/Tipo/Calibre/Cantidad(mts). buscar_elementos() filtra viewport GIS. agrupar_elementos() acumula longitud medida o calculada.',
    render: () => <CTablaCablesProyUI />,
  },
  // =============================================================================
  // [93] Demo — c_lista_materiales_esquema_red
  // =============================================================================
  // function DemoCListaMaterialesEsquemaRed() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_lista_materiales_esquema_red</h3>
  //       <p style={s.desc}>
  //         Sello lista de materiales para esquemáticos fibra óptica. Slot .tipo = :red/:estructuras.
  //         selectFromMap() filtra PROYECTADO del ACE esquema. 5 prioridades de descripción:
  //         sheath+spec → cables; spec_id → CEDOs; tipo_conexion → fusiones;
  //         key split → ductos/terminales; fallback external_name. Metros acumula, pzas cuenta.
  //       </p>
  //       <CListaMaterialesEsquemaRedUI />
  //     </section>
  //   );
  // }
  {
    id: '93-lista-materiales-esquema-red',
    label: '[93] c_lista_materiales_esquema_red',
    description: 'Sello LISTA DE MATERIALES para esquemático fibra óptica. Slot .tipo (:red/:estructuras). PROYECTADO del ACE. Agrupa por clave collection|spec. 5 prioridades de descripción. Metros acumulados o pzas contadas.',
    render: () => <CListaMaterialesEsquemaRedUI />,
  },
  // =============================================================================
  // [94] Demo — c_vp_plano_proy_can
  // =============================================================================
  // function DemoCVpPlanoProjCan() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_vp_plano_proy_can</h3>
  //       <p style={s.desc}>
  //         Viewport de layout para planos de canalización de cobre. Secciona la ruta
  //         (c_seccionamiento 1:200, A4) con turf.lineSliceAlong. Marcas Z de continuación
  //         (bracket 3 segmentos, letras A/B/C) con turf.bearing+destination. Línea U
  //         entre pozos. objetos_visibles filtra por bbox de sección.
  //       </p>
  //       <CVpPlanoProjCanUI />
  //     </section>
  //   );
  // }
  {
    id: '94-vp-plano-proy-can',
    label: '[94] c_vp_plano_proy_can',
    description: 'Viewport layout planos canalización cobre. Secciona ruta (40m/plano). Marcas Z continuación con letras A/B/C (bracket 3 segmentos, turf.destination). Línea U entre pozos. objetos_visibles por bbox.',
    render: () => <CVpPlanoProjCanUI />,
  },
  {
    id: '85-textbox-layout',
    label: '[85] textbox_layout',
    description: '11 atributos configurables (text/fontName/fontSize/colour/wrap/clip/alignH/alignV/orientation/angle/textWidth/textAspect) + wrap_lines(): ajuste de líneas greedy horizontal (left_right) y vertical (top_bottom) con margen border_chars y clipping.',
    render: () => (
      <section style={s.section}>
        <h3 style={s.h3}>textbox_layout</h3>
        <p style={s.meta}>
          11 atributos: text / fontName / fontSize / colour / wrap / clip / alignH / alignV /
          orientation / angle / textWidth / textAspect.{' '}
          wrap_lines() divide el texto en líneas respetando el bbox con clipping opcional.
        </p>
        {/* Invocación directa de referencia (sin menú selector):
        // <TextboxLayoutUI />
        */}
        <TextboxLayoutUI />
      </section>
    ),
  },
  {
    id: '86-c-placa-larga-distancia',
    label: '[86] c_placa_larga_distancia',
    description: 'Placa de identificación de cable de fibra óptica larga distancia — 6 tablas (tbl_1–6), fondo salmon rgb(255,212,191), logo + "PRECAUCION/CABLE DE FIBRA OPTICA/LARGA DISTANCIA" sin bordes, filas RUTA/LONG./POZO/EMPALME con bordes selectivos. 4 atributos dinámicos.',
    render: () => (
      <section style={s.section}>
        <h3 style={s.h3}>c_placa_larga_distancia</h3>
        <p style={s.meta}>
          Hereda de c_base_sello_fibra. configura_tabla() crea 6 tablas con posición absoluta
          en el sheet (mm). llena_datos_dinamicos() inyecta ruta / long / pozo / empalme.
        </p>
        {/* Invocación directa de referencia (sin menú selector):
        // <CPlacaLargaDistanciaUI />
        */}
        <CPlacaLargaDistanciaUI />
      </section>
    ),
  },
  {
    id: '87-c-sello-dist-de-ter-a-cd',
    label: '[87] c_sello_dist_de_ter_a_cd',
    description: 'Sello 17×5 de distancias terminal→C.D. UbicaCoord mapea IDs (A1–S5) a posición en tbl_contenido. llena_datos_celdas(): ruta 1=edificio directo, ruta 2=distrito óptico con predicate.inside. FiltrarTerminalesConDist extrae user!_cuenta + user!_distancia_cd.',
    render: () => (
      <section style={s.section}>
        <h3 style={s.h3}>c_sello_dist_de_ter_a_cd</h3>
        <p style={s.meta}>
          Introduce un ID de edificio (1001–1003) o distrito óptico (5001–5002)
          y pulsa el botón para cargar las distancias de las terminales de cobre a la C.D.
        </p>
        {/* Invocación directa de referencia (sin menú selector):
        // <CSelloDistDeTerACdUI />
        */}
        <CSelloDistDeTerACdUI />
      </section>
    ),
  },
  {
    id: '88-c-leyenda-ashurado',
    label: '[88] c_leyenda_ashurado',
    description: 'Leyenda de ashurado (layout_element): 3 cuadros con patrones diagonales. cont=1→reticulado (/ rojo + \\ verde), cont=2→/ rojo, cont=3→\\ verde. step=size/6. Atributo :Tamano (A/B/C). Canvas 2D con mapeo Magik y↑ → Canvas y↓.',
    render: () => (
      <section style={s.section}>
        <h3 style={s.h3}>c_leyenda_ashurado</h3>
        <p style={s.meta}>
          construir_leyenda() dibuja 3 variantes de ashurado en Canvas 2D.
          Selecciona el tamaño con los botones de radio.
        </p>
        {/* Invocación directa de referencia (sin menú selector):
        // <CLeyendaAshuradoUI />
        */}
        <CLeyendaAshuradoUI />
      </section>
    ),
  },
  // ── [84] c_dto_pronostico — anterior último componente migrado ──────────────

  // =============================================================================
  // [85] Demo inline — marco_layout
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoMarcoLayout() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>marco_layout</h3>
  //       <p style={s.meta}>
  //         Marco del plano — dos modos: NORMAL (num_mod × altura × modulo) o
  //         CONFIG PLANO (Distritos/Itinerario/Construccion/Empalmes/Topologico).
  //         Render OpenLayers v10 con ticks azules/rojos + esquinas_plano.
  //       </p>
  //       <MarcoLayoutUI />
  //     </section>
  //   );
  // }

  {
    id: '85-marco-layout',
    label: '[85] marco_layout',
    description: 'Marco perimetral de plano — modo NORMAL (num_mod*modulo_width × altura*modulo_height + sello) o CONFIG PLANO (Distritos1..Topologico3) con anchos/altos fijos + ticks azules/rojos + esquinas_plano. Render OL v10 + Turf.',
    render: () => <MarcoLayoutUI />,
  },
  // ── [85] marco_layout — anterior último componente migrado ──────────────────

  // =============================================================================
  // [86] Demo inline — c_sembrado_layout
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCSembradoLayout() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_sembrado_layout</h3>
  //       <p style={s.meta}>
  //         Plantilla de plano de detalle "sembrado". Se monta sobre marco_layout:
  //         hereda bounds, compone referencias verticales + copyright + rejillas
  //         de fibra óptica / obra civil + viewport "Larguillo" (50000:1).
  //         view_angle calculado con turf.bearing(last→first) del cable.
  //       </p>
  //       <CSembradoLayoutUI />
  //     </section>
  //   );
  // }

  {
    id: '86-c-sembrado-layout',
    label: '[86] c_sembrado_layout',
    description: 'Plantilla layout "sembrado" — busca_elemento("marco_layout"), hereda bounds. Compone: 2 refs verticales (izq/der) + copyright TELMEX + cuadro escala + rejillas fibra óptica/obra civil + viewport "Larguillo" (ace_name CENTRALES, scale 50000, view_angle=turf.bearing(last→first)).',
    render: () => <CSembradoLayoutUI />,
  },
  // ── [86] c_sembrado_layout — anterior último componente migrado ─────────────

  // =============================================================================
  // [87] Demo inline — style_element_mixin
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoStyleElementMixin() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>style_element_mixin</h3>
  //       <p style={s.meta}>
  //         Mixin Magik: dibuja un estilo (area/circle/text) rotado + escalado
  //         al bbox del elemento, con línea opcional al objeto GIS, doblez
  //         alrededor del viewport y punta de flecha opcional.
  //       </p>
  //       <StyleElementMixinUI />
  //     </section>
  //   );
  // }

  {
    id: '87-style-element-mixin',
    label: '[87] style_element_mixin',
    description: 'Mixin Magik: calcula_bound+draw_style — figuras (:area/:circle/:text) rotadas+escaladas al self_bounds, línea opcional a objeto GIS con doblez frente al viewport, punta opcional (obten_pto_separado+obten_pto_intersect). Render OL v10.',
    render: () => <StyleElementMixinUI />,
  },
  // ── [87] style_element_mixin — anterior último componente migrado ───────────

  // =============================================================================
  // [88] Demo inline — c_plano_principales
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCPlanoPrincipales() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_plano_principales</h3>
  //       <p style={s.meta}>
  //         Genera plano "Red Principal" 24"×36" (9144×6096). Marco 6×3 módulos
  //         carta (Carta_X=2160, Carta_Y=2790) con marcas de doblez +
  //         esquinas L + escala uniforme 1.009345. Viewport principal
  //         mapeado a CMV 1.2M×1M. Título azul "PRINCIPALES" 25pt.
  //       </p>
  //       <CPlanoPrincipalesUI />
  //     </section>
  //   );
  // }

  {
    id: '88-c-plano-principales',
    label: '[88] c_plano_principales',
    description: 'Plano "Red Principal" 24"×36" — genera_plano() orquesta abrir_hoja(9144×6096)+agrega_viewport+configura_plano. genera_marco(T3=6×3 Carta_X×Carta_Y) con marcas doblez X/Y + 4 esquinas L + transform.scale(1.009345). Título PRINCIPALES #3025B8.',
    render: () => <CPlanoPrincipalesUI />,
  },
  // ── [88] c_plano_principales — anterior último componente migrado ───────────

  // =============================================================================
  // [89] Demo inline — c_lista_materiales_esquema
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCListaMaterialesEsquema() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_lista_materiales_esquema</h3>
  //       <p style={s.meta}>
  //         Sello "Lista de Materiales" — async scan de current_map_view
  //         (ace_name ~ "*esquema*"), filtra PROYECTADO, agrupa por
  //         source_collection.name. Tabla 4 cols (No/DESCRIPCION/UNIDAD/CANTIDAD).
  //         Reglas: route → metros (sheath fallback calculated_fiber_length);
  //         resto → pzas. desc_mat según collectionName.
  //       </p>
  //       <CListaMaterialesEsquemaUI />
  //     </section>
  //   );
  // }

  {
    id: '89-c-lista-materiales-esquema',
    label: '[89] c_lista_materiales_esquema',
    description: 'Sello layout "Lista de Materiales" — scan async del esquemático activo, filtra construction_status=PROYECTADO, agrupa por source_collection.name. Tabla 2+N×4 (No/DESC/UNIDAD/CANTIDAD). tipo :red|:estructuras. Reglas route→metros, sheath fallback calculated_fiber_length. natural sort.',
    render: () => <CListaMaterialesEsquemaUI />,
  },
  // ── [89] c_lista_materiales_esquema — anterior último componente migrado ────

  // =============================================================================
  // [90] Demo inline — c_vp_croquis_edificio
  // Versión comentada como referencia de invocación directa sin menú selector.
  // La versión activa está integrada en el entry de DEMO_ITEMS más abajo.
  // =============================================================================
  // function DemoCVpCroquisEdificio() {
  //   return (
  //     <section style={s.section}>
  //       <h3 style={s.h3}>c_vp_croquis_edificio</h3>
  //       <p style={s.meta}>
  //         Viewport croquis edificio — contorno dashed + geometrías GIS
  //         (19 colecciones) + símbolo norte 3 tamaños × 4 ubicaciones,
  //         rotado por −view_angle. Boundary del edificio target con
  //         turf.buffer(6) en rojo dashed. Etiqueta inferior #AFAF5D.
  //       </p>
  //       <CVpCroquisEdificioUI />
  //     </section>
  //   );
  // }

  {
    id: '90-c-vp-croquis-edificio',
    label: '[90] c_vp_croquis_edificio',
    description: 'Viewport croquis edificio — contorno dashed + filtro 19 colecciones GIS + símbolo NORTE 3 tamaños A/B/C (flecha+lineas+arcos discretizados 1°) × 4 ubicaciones, rotado por −view_angle. Boundary edificio target turf.buffer(6) rojo dashed. Etiqueta bold 50pt #AFAF5D.',
    render: () => <CVpCroquisEdificioUI />,
  },
  // ── PROXIMA MIGRACION: agregar entrada aqui ─────────────────────────────────
];

// =============================================================================
// App
// =============================================================================
function App() {
  const [activeId, setActiveId] = useState(DEMO_ITEMS[DEMO_ITEMS.length - 1].id);
  const [query, setQuery] = useState('');

  // Filtra por label o description (case-insensitive)
  const filtered = query.trim() === ''
    ? DEMO_ITEMS
    : DEMO_ITEMS.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
    );

  // Si el activo queda fuera del filtro, usa el primero visible
  const visibleIds = new Set(filtered.map(i => i.id));
  const resolvedId = visibleIds.has(activeId) ? activeId : (filtered[0]?.id ?? activeId);
  const active = DEMO_ITEMS.find(item => item.id === resolvedId) ?? DEMO_ITEMS[DEMO_ITEMS.length - 1];

  return (
    <div style={s.root}>
      <h2 style={s.title}>Test — Migración Magik → TypeScript</h2>

      <div style={s.menuBar}>
        {/* Buscador — filtra label y description en tiempo real */}
        <input
          type="search"
          placeholder="Buscar componente…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={s.searchInput}
          aria-label="Buscar componente"
        />
        <span style={s.searchCount}>
          {filtered.length}/{DEMO_ITEMS.length}
        </span>

        <label htmlFor="demo-select" style={s.menuLabel}>Componente:</label>
        <select
          id="demo-select"
          value={resolvedId}
          onChange={e => setActiveId(e.target.value)}
          style={s.select}
          size={1}
        >
          {filtered.length === 0
            ? <option disabled value="">Sin resultados</option>
            : filtered.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))
          }
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
  root: { padding: 24, fontFamily: 'sans-serif', fontSize: 13 },
  title: { marginBottom: 16, fontSize: 18 },
  menuBar: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: '#f0f4f8', borderRadius: 6, border: '1px solid #dde' },
  menuLabel: { fontSize: 12, color: '#555', fontWeight: 'bold' },
  select: { padding: '5px 10px', borderRadius: 5, border: '1px solid #b0bec5', fontSize: 13, minWidth: 320 },
  menuHint: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  searchInput: { padding: '5px 10px', borderRadius: 5, border: '1px solid #b0bec5', fontSize: 13, minWidth: 200 },
  searchCount: { fontSize: 11, color: '#888', whiteSpace: 'nowrap' as const },
  demoArea: { minHeight: 200 },
  section: { marginBottom: 0, border: '1px solid #ddd', borderRadius: 6, padding: 16 },
  h3: { margin: '0 0 8px', fontSize: 15, fontWeight: 'bold' },
  meta: { color: '#666', fontSize: 12, margin: '4px 0' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
  th: { background: '#2E4057', color: '#fff', padding: '6px 10px', textAlign: 'left', fontSize: 12 },
  td: { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 12 },
};
