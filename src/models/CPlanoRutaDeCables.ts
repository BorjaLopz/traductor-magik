// Source: adiciones_layout/source/c_plano_ruta_de_cables.magik
//
// Plano "Ruta de Cables". Extiende layout_element + viewport_layout_mixin.
// La mayor parte del método genera_plano() está comentada en el original
// (en desarrollo en el momento de creación), por lo que su transcripción
// se limita al esqueleto + atributos definidos.
//
// allowed_on_menu? = _false → no aparece en el menú de planos.

// Stub de smallworld_product.pni_application() — representa el handle GIS.
export interface PniApplication {
  name:    string;
  plugins: Record<string, unknown>;
}

const DEFAULT_APP: PniApplication = {
  name:    'pni_application',
  plugins: {},
};

// Atributo definido por viewport_layout_mixin — define_attributes() lo añade
// al final del rope que devuelve defined_attributes.
export interface LayoutAttributeDefinition {
  name:        string;
  type:        'string' | 'number' | 'boolean' | 'reference';
  source:      'super' | 'viewport';
}

// Stub: atributos heredados del layout_element padre (resumen mínimo).
const SUPER_ATTRIBUTES: LayoutAttributeDefinition[] = [
  { name: 'outline',         type: 'reference', source: 'super' },
  { name: 'fill',            type: 'reference', source: 'super' },
  { name: 'shadow',          type: 'boolean',   source: 'super' },
  { name: 'locked',          type: 'boolean',   source: 'super' },
];

// Atributo expuesto por viewport_layout_mixin.
const VIEWPORT_ATTRIBUTE_DEFINITION: LayoutAttributeDefinition = {
  name:   'viewport',
  type:   'reference',
  source: 'viewport',
};

export class CPlanoRutaDeCables {
  // Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
  static readonly allowedOnMenu: boolean = false;
  static readonly tipoPlano: string = 'ruta_cables';

  app: PniApplication;

  // Magik: c_plano_ruta_de_cables.new() → _clone.init()
  constructor(app: PniApplication = DEFAULT_APP) {
    this.app = app;   // .app << smallworld_product.pni_application()
  }

  // Magik: defined_attributes — _super.defined_attributes + viewport_attribute_definition
  definedAttributes(): LayoutAttributeDefinition[] {
    const attribs = [...SUPER_ATTRIBUTES];
    attribs.push(VIEWPORT_ATTRIBUTE_DEFINITION);
    return attribs;
  }

  // Magik: genera_plano — el método completo está comentado en el original.
  // Devolvemos placeholder describiendo la intención del autor.
  generaPlano(): { ok: false; reason: string } {
    return { ok: false, reason: 'Esta opción se encuentra en desarrollo' };
  }
}
