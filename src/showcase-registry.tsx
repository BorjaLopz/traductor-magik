import type { ReactNode } from 'react'
import { CCuadroResumenDelCableShowcase } from './components/CCuadroResumenDelCableShowcase'
import { CGuardaObjetosVpShowcase } from './components/CGuardaObjetosVpShowcase'
import { CSelloNotasSctCruzSubShowcase } from './components/CSelloNotasSctCruzSubShowcase'
import { CSelloNotasSctInstPuenteShowcase } from './components/CSelloNotasSctInstPuenteShowcase'
import { CSelloNotasSctMargSubShowcase } from './components/CSelloNotasSctMargSubShowcase'
import { CElementosTrGShowcase } from './components/CElementosTrGShowcase'
import { CProyectoShowcase } from './components/CProyectoShowcase'
import { CTramoFoEShowcase } from './components/CTramoFoEShowcase'
import { CCfgBloqueTitdetEditableMixinShowcase } from './components/CCfgBloqueTitdetEditableMixinShowcase'
import { CPepShowcase } from './components/CPepShowcase'
import { CPlanoEUI } from './migration/CPlanoE'
import { CResumenDelProyectoRofUI } from './migration/CResumenDelProyectoRof'
import { PreviewSymbolPluginUI } from './migration/PreviewSymbolPlugin'
import { CDistritoEUI } from './migration/CDistritoE'
import { CProyectoRedUI } from './migration/CProyectoRed'
import { CCeldaUI } from './migration/CCelda'
import { CSimboloGraficoUI } from './migration/CSimboloGrafico'
import { CAreaTelmexUI } from './migration/CAreaTelmex'
import { CCirculoGraficoUI } from './migration/CCirculoGrafico'
import { CSelloEstandarUI } from './migration/CSelloEstandar'
import { CSelloNotasSctCruzSubPteUI } from './migration/CSelloNotasSctCruzSubPte'
import { CSelloNotasSctInstPuenteTnUI } from './migration/CSelloNotasSctInstPuenteTn'
import { CSelloNotasSctMargAereoUI } from './migration/CSelloNotasSctMargAereo'
import { ViewportLayoutMixinUI } from './migration/ViewportLayoutMixin'
import { CSelloReconcentracionShowcase } from './components/CSelloReconcentracionShowcase'
import { CTramoCanShowcase } from './components/CTramoCanShowcase'
import { CFilasShowcase } from './components/CFilasShowcase'
import { CCuadroResumenDistritoShowcase } from './components/CCuadroResumenDistritoShowcase'
import { CCuadroResumenUsuariosTelcelShowcase } from './components/CCuadroResumenUsuariosTelcelShowcase'
import { CResumenDelProyectoShowcase } from './components/CResumenDelProyectoShowcase'
import { CResumenDelProyectoAcometidaShowcase } from './components/CResumenDelProyectoAcometidaShowcase'
import { CTblCfgMixinShowcase } from './components/CTblCfgMixinShowcase'
import { CSelloCompetenciaTelmexShowcase } from './components/CSelloCompetenciaTelmexShowcase'
import { CSelloNotasSctCruzAereoShowcase } from './components/CSelloNotasSctCruzAereoShowcase'
import { PlotFilterShowcase } from './components/PlotFilterShowcase'
import { CuadroDeNotasPluginShowcase } from './components/CuadroDeNotasPluginShowcase'
import { CTablaSimbologiaShowcase } from './components/CTablaSimbologiaShowcase'
import { CCeldasShowcase } from './components/CCeldasShowcase'
import { CElementosShowcase } from './components/CElementosShowcase'
import { CFilaShowcase } from './components/CFilaShowcase'
import { CTipoGeomShowcase } from './components/CTipoGeomShowcase'
import { CCentralEShowcase } from './components/CCentralEShowcase'
import { CCreadorElementoTramoGShowcase } from './components/CCreadorElementoTramoGShowcase'
import { CTraductorShowcase } from './components/CTraductorShowcase'
import { CPepDcsShowcase } from './components/CPepDcsShowcase'
import { CPlanoRutaDeCablesShowcase } from './components/CPlanoRutaDeCablesShowcase'
import { CSimbologiaPlanoConstruccionShowcase } from './components/CSimbologiaPlanoConstruccionShowcase'
import { LayoutAttributeDefinitionShowcase } from './components/LayoutAttributeDefinitionShowcase'
import { CServiciosEstilosShowcase } from './components/CServiciosEstilosShowcase'
import { CSimbologiaOcupacionDeDuctosShowcase } from './components/CSimbologiaOcupacionDeDuctosShowcase'
import { RutaOpbsPluginShowcase } from './components/RutaOpbsPluginShowcase'
import { CDtoPronosticoShowcase } from './components/CDtoPronosticoShowcase'
import { LayoutManagerPluginShowcase } from './components/LayoutManagerPluginShowcase'
import { CSectoresShowcase } from './components/CSectoresShowcase'
import { LayoutElementShowcase } from './components/LayoutElementShowcase'
import { CArbolCablesFoCedoShowcase } from './components/CArbolCablesFoCedoShowcase'
import { CDistritoShowcase } from './components/CDistritoShowcase'
import { CResumenOpticoShowcase } from './components/CResumenOpticoShowcase'
import { CPreviewSymbolDialogShowcase } from './components/CPreviewSymbolDialogShowcase'
import { CTablaShowcase } from './components/CTablaShowcase'
import { CTablasShowcase } from './components/CTablasShowcase'
import { CCapturaTextoUI } from './migration/CCapturaTexto'

export interface ShowcaseEntry {
  id: string
  label: string
  fase: 1 | 2 | 3 | 4 | 5 | 6
  nivel: 'SIMPLE' | 'MODERADO' | 'COMPLEJO' | 'MUY COMPLEJO' | 'CRÍTICO'
  magikSource: string
  element: ReactNode
}

// ─── AÑADIR COMPONENTES AQUÍ ────────────────────────────────────────────────
// 1. Importar el showcase component arriba
// 2. Añadir entrada al array siguiendo el mismo shape
// ────────────────────────────────────────────────────────────────────────────
export const SHOWCASE_REGISTRY: ShowcaseEntry[] = [
  {
    id: 'CPlanoE',
    label: 'CPlanoE',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_plano_e.magik',
    element: <CPlanoEUI />,
  },
  {
    id: 'CResumenDelProyectoRof',
    label: 'CResumenDelProyectoRof',
    fase: 4,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/c_resumen_del_proyecto_rof.magik',
    element: <CResumenDelProyectoRofUI />,
  },
  {
    id: 'PreviewSymbolPlugin',
    label: 'PreviewSymbolPlugin',
    fase: 4,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/preview_symbol_plugin.magik',
    element: <PreviewSymbolPluginUI />,
  },
  {
    id: 'CSelloReconcentracion',
    label: 'CSelloReconcentracion',
    fase: 1,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_reconcentracion.magik',
    element: <CSelloReconcentracionShowcase />,
  },
  {
    id: 'CTramoCan',
    label: 'CTramoCan',
    fase: 1,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Construccion/c_tramo_can.magik',
    element: <CTramoCanShowcase />,
  },
  {
    id: 'CFilas',
    label: 'CFilas / CFila',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/Utilerias/c_filas.magik',
    element: <CFilasShowcase />,
  },
  {
    id: 'CCuadroResumenUsuariosTelcel',
    label: 'CCuadroResumenUsuariosTelcel',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/c_cuadro_resumen_usuarios_telcel.magik',
    element: <CCuadroResumenUsuariosTelcelShowcase />,
  },
  {
    id: 'CCuadroResumenDistrito',
    label: 'CCuadroResumenDistrito',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/c_cuadro_resumen_distrito.magik',
    element: <CCuadroResumenDistritoShowcase />,
  },
  {
    id: 'CResumenDelProyecto',
    label: 'CResumenDelProyecto',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_resumen_del_proyecto.magik',
    element: <CResumenDelProyectoShowcase />,
  },
  {
    id: 'CSelloCompetenciaTelmex',
    label: 'CSelloCompetenciaTelmex',
    fase: 5,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/planos/plano_construccion_interno/c_sello_competencia_telmex.magik',
    element: <CSelloCompetenciaTelmexShowcase />,
  },
  {
    id: 'CTblCfgMixin',
    label: 'CTblCfgMixin',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_tbl_cfg_mixin.magik',
    element: <CTblCfgMixinShowcase />,
  },
  {
    id: 'CResumenDelProyectoAcometida',
    label: 'CResumenDelProyectoAcometida',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_resumen_del_proyecto_acometida.magik',
    element: <CResumenDelProyectoAcometidaShowcase />,
  },
  {
    id: 'CSelloNotasSctCruzAereo',
    label: 'CSelloNotasSctCruzAereo',
    fase: 2,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_aereo.magik',
    element: <CSelloNotasSctCruzAereoShowcase />,
  },
  {
    id: 'CDistritoE',
    label: 'CDistritoE',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_distrito_e.magik',
    element: <CDistritoEUI />,
  },
  {
    id: 'CProyectoRed',
    label: 'CProyectoRed',
    fase: 1,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_proyecto_red.magik',
    element: <CProyectoRedUI />,
  },
  {
    id: 'CCelda',
    label: 'CCelda',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/Utilerias/c_celda.magik',
    element: <CCeldaUI />,
  },
  {
    id: 'CSimboloGrafico',
    label: 'CSimboloGrafico',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/Utilerias/c_simbolo_grafico.magik',
    element: <CSimboloGraficoUI />,
  },
  {
    id: 'CAreaTelmex',
    label: 'CAreaTelmex',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_area_telmex.magik',
    element: <CAreaTelmexUI />,
  },
  {
    id: 'CCirculoGrafico',
    label: 'CCirculoGrafico',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/Utilerias/c_circulo_grafico.magik',
    element: <CCirculoGraficoUI />,
  },
  {
    id: 'CSelloEstandar',
    label: 'CSelloEstandar',
    fase: 4,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_estandar.magik',
    element: <CSelloEstandarUI />,
  },
  {
    id: 'CSelloNotasSctCruzSubPte',
    label: 'CSelloNotasSctCruzSubPte',
    fase: 4,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_sub_pte.magik',
    element: <CSelloNotasSctCruzSubPteUI />,
  },
  {
    id: 'CSelloNotasSctInstPuenteTn',
    label: 'CSelloNotasSctInstPuenteTn',
    fase: 4,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_inst_puente_tn.magik',
    element: <CSelloNotasSctInstPuenteTnUI />,
  },
  {
    id: 'CSelloNotasSctMargAereo',
    label: 'CSelloNotasSctMargAereo',
    fase: 4,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_marg_aereo.magik',
    element: <CSelloNotasSctMargAereoUI />,
  },
  {
    id: 'ViewportLayoutMixin',
    label: 'ViewportLayoutMixin',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/viewport_layout_mixin.magik',
    element: <ViewportLayoutMixinUI />,
  },
  {
    id: 'PlotFilter',
    label: 'plot_filter',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/plot_filter.magik',
    element: <PlotFilterShowcase />,
  },
  {
    id: 'CuadroDeNotasPlugin',
    label: 'cuadro_de_notas_plugin',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/cuadro_de_notas_plugin.magik',
    element: <CuadroDeNotasPluginShowcase />,
  },
  {
    id: 'CTablaSimbologia',
    label: 'c_tabla_simbologia',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_tabla_simbologia.magik',
    element: <CTablaSimbologiaShowcase />,
  },
  {
    id: 'CCeldas',
    label: 'c_celdas',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_celdas.magik',
    element: <CCeldasShowcase />,
  },
  {
    id: 'CElementos',
    label: 'c_elementos',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_elementos.magik',
    element: <CElementosShowcase />,
  },
  {
    id: 'CFila',
    label: 'c_fila',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_fila.magik',
    element: <CFilaShowcase />,
  },
  {
    id: 'CTipoGeom',
    label: 'c_Tipo_Geom',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_Tipo_Geom.magik',
    element: <CTipoGeomShowcase />,
  },
  {
    id: 'CCentralE',
    label: 'c_central_e',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_central_e.magik',
    element: <CCentralEShowcase />,
  },
  {
    id: 'CCreadorElementoTramoG',
    label: 'c_creador_elemento_tramo_g',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_creador_elemento_tramo_g.magik',
    element: <CCreadorElementoTramoGShowcase />,
  },
  {
    id: 'CTraductor',
    label: 'c_Traductor',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_traductor.magik',
    element: <CTraductorShowcase />,
  },
  {
    id: 'CPepDcs',
    label: 'c_pep_dcs',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_pep_dcs.magik',
    element: <CPepDcsShowcase />,
  },
  {
    id: 'CPlanoRutaDeCables',
    label: 'c_plano_ruta_de_cables',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_plano_ruta_de_cables.magik',
    element: <CPlanoRutaDeCablesShowcase />,
  },
  {
    id: 'CSimbologiaPlanoConstruccion',
    label: 'c_simbologia_plano_construccion',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_simbologia_plano_construccion.magik',
    element: <CSimbologiaPlanoConstruccionShowcase />,
  },
  {
    id: 'LayoutAttributeDefinition',
    label: 'layout_attribute_definition',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/layout_attribute_definition.magik',
    element: <LayoutAttributeDefinitionShowcase />,
  },
  {
    id: 'CServiciosEstilos',
    label: 'c_servicios_estilos',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_servicios_estilos.magik',
    element: <CServiciosEstilosShowcase />,
  },
  {
    id: 'CSimbologiaOcupacionDeDuctos',
    label: 'c_simbologia_ocupacion_de_ductos',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/c_simbologia_ocupacion_de_ductos.magik',
    element: <CSimbologiaOcupacionDeDuctosShowcase />,
  },
  {
    id: 'RutaOpbsPlugin',
    label: 'ruta_opbs_plugin',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/ruta_opbs_plugin.magik',
    element: <RutaOpbsPluginShowcase />,
  },
  {
    id: 'CDtoPronostico',
    label: 'c_dto_pronostico',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/c_dto_pronostico.magik',
    element: <CDtoPronosticoShowcase />,
  },
  {
    id: 'LayoutManagerPlugin',
    label: 'layout_manager_plugin',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/layout_manager_plugin.magik',
    element: <LayoutManagerPluginShowcase />,
  },
  {
    id: 'CSectores',
    label: 'c_sectores',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/c_sectores.magik',
    element: <CSectoresShowcase />,
  },
  {
    id: 'LayoutElement',
    label: 'layout_element',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/layout_element.magik',
    element: <LayoutElementShowcase />,
  },
  {
    id: 'CArbolCablesFoCedo',
    label: 'c_arbol_cables_fo_cedo',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/c_arbol_cables_fo_cedo.magik',
    element: <CArbolCablesFoCedoShowcase />,
  },
  {
    id: 'CDistrito',
    label: 'c_distrito',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/c_distrito.magik',
    element: <CDistritoShowcase />,
  },
  {
    id: 'CResumenOptico',
    label: 'c_resumen_optico',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/c_resumen_optico.magik',
    element: <CResumenOpticoShowcase />,
  },
  {
    id: 'CPreviewSymbolDialog',
    label: 'c_preview_symbol_dialog',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/c_preview_symbol_dialog.magik',
    element: <CPreviewSymbolDialogShowcase />,
  },
  {
    id: 'CTabla',
    label: 'c_tabla',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/c_Tabla.magik',
    element: <CTablaShowcase />,
  },
  {
    id: 'CTablas',
    label: 'c_tablas',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/c_tablas.magik',
    element: <CTablasShowcase />,
  },
  {
    id: 'CCuadroResumenDelCable',
    label: 'CCuadroResumenDelCable',
    fase: 5,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Sellos/c_cuadro_resumen_del_cable.magik',
    element: <CCuadroResumenDelCableShowcase />,
  },
  {
    id: 'CGuardaObjetosVp',
    label: 'CGuardaObjetosVp',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/c_guarda_objetos_vp.magik',
    element: <CGuardaObjetosVpShowcase />,
  },
  {
    id: 'CSelloNotasSctCruzSub',
    label: 'CSelloNotasSctCruzSub',
    fase: 5,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_sub.magik',
    element: <CSelloNotasSctCruzSubShowcase />,
  },
  {
    id: 'CSelloNotasSctInstPuente',
    label: 'CSelloNotasSctInstPuente',
    fase: 5,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_inst_puente.magik',
    element: <CSelloNotasSctInstPuenteShowcase />,
  },
  {
    id: 'CSelloNotasSctMargSub',
    label: 'CSelloNotasSctMargSub',
    fase: 5,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_sello_notas_sct_marg_sub.magik',
    element: <CSelloNotasSctMargSubShowcase />,
  },
  {
    id: 'CElementosTrG',
    label: 'CElementosTrG',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/Utilerias/Tramo/c_elementos_tramo_g.magik',
    element: <CElementosTrGShowcase />,
  },
  {
    id: 'CProyecto',
    label: 'CProyecto',
    fase: 2,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_proyecto.magik',
    element: <CProyectoShowcase />,
  },
  {
    id: 'CTramoFoE',
    label: 'CTramoFoE',
    fase: 1,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/Entidad/c_tramo_fo_e.magik',
    element: <CTramoFoEShowcase />,
  },
  {
    id: 'CCfgBloqueTitdetEditableMixin',
    label: 'CCfgBloqueTitdetEditableMixin',
    fase: 1,
    nivel: 'SIMPLE',
    magikSource: 'adiciones_layout/source/Sellos/c_cfg_bloque_titdet_editable_mixin.magik',
    element: <CCfgBloqueTitdetEditableMixinShowcase />,
  },
  {
    id: 'CPep',
    label: 'CPep',
    fase: 5,
    nivel: 'COMPLEJO',
    magikSource: 'adiciones_layout/source/Sellos/c_pep.magik',
    element: <CPepShowcase />,
  },
  {
    id: 'CCapturaTexto',
    label: 'CCapturaTexto',
    fase: 2,
    nivel: 'MODERADO',
    magikSource: 'adiciones_layout/source/Sellos/c_captura_texto.magik',
    element: <CCapturaTextoUI />,
  },
]
