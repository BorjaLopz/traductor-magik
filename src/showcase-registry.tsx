import type { ReactNode } from 'react'
import { CPlanoEShowcase } from './components/CPlanoEShowcase'
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
]
