import type { ReactNode } from 'react'
import { CPlanoEShowcase } from './components/CPlanoEShowcase'

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
]
