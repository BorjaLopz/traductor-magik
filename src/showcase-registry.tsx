import type { ReactNode } from 'react'
import { CPlanoEShowcase } from './components/CPlanoEShowcase'
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
]
