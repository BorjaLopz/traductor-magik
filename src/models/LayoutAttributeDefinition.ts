// Source: adiciones_layout/source/layout_attribute_definition.magik
//
// Extensión SW de la clase layout_attribute_definition (package :sw):
// añade un setter para la propiedad :allowed_on_properties_page? — controla
// si el atributo aparece en la ventana de propiedades del layout_element.

export type LayoutAttributeType = 'string' | 'number' | 'boolean' | 'reference';

export class LayoutAttributeDefinition {
  readonly name: string;
  readonly type: LayoutAttributeType;
  // Magik: .properties — property_list/hash_table accesible por key
  readonly properties: Map<string, unknown> = new Map();

  constructor(name: string, type: LayoutAttributeType) {
    this.name = name;
    this.type = type;
  }

  // Magik: layout_attribute_definition.allowed_on_properties_page? << value
  // >> .properties[:allowed_on_properties_page?] << value
  set allowedOnPropertiesPage(value: boolean) {
    this.properties.set('allowed_on_properties_page?', value);
  }

  get allowedOnPropertiesPage(): boolean {
    return (this.properties.get('allowed_on_properties_page?') as boolean | undefined) ?? false;
  }
}
