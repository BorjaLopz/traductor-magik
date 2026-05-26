import type { ReactNode } from 'react'
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
  }
]
