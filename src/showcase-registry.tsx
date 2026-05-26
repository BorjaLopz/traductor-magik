import type { ReactNode } from 'react'
import { CPlanoEShowcase } from './components/CPlanoEShowcase'
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
    element: <CPlanoEShowcase />,
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
]
