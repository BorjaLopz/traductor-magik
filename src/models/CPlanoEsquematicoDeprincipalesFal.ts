// Source: planos_fo/source/ruta_cables/factory/c_plano_esquematico_de_principales_fal.magik
// FAL (Fibra Óptica Acceso Local) variant of the "Plano Esquemático de Principales" factory.
//
// The Magik source is IDENTICAL to c_plano_esquematico_de_principales — every method,
// every bound, every constant is copied verbatim; only the class name differs.
// This variant exists as a named hook for future FAL-specific customisation.
//
// In TypeScript we extend CPlanoEsquematicoDeprincipales with no overrides,
// which faithfully represents the Magik state while leaving the door open for
// FAL-specific methods without changing the class hierarchy.

import { CPlanoEsquematicoDeprincipales } from './CPlanoEsquematicoDeprincipales'

export class CPlanoEsquematicoDeprincipalesFal extends CPlanoEsquematicoDeprincipales {
  // No overrides — identical to parent at this time.
}
