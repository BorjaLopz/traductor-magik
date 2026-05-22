/**
 * Migracion de: polyline_layout.magik
 * Clase Magik:  polyline_layout
 * Metodo:       defined_attributes
 *
 * Intencion:
 *   Definir la lista de atributos editables para una polilinea de layout.
 *   En Magik se construye un rope con dos atributos: sectors y line_style.
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas [x, y] en proyeccion plana. */
export type Coord2D = [number, number];

/** Lista de coordenadas que representan la polilinea (Magik: sector_rope). */
export type SectorRope = Coord2D[];

/** Estilo basico de linea (equivalente al slot line_style en Magik). */
export interface LineStyle {
  strokeColor: string;
  strokeWidth: number;
  dash?: number[];
}

/** Definicion de atributo similar a layout_attribute_definition.new(...). */
export interface LayoutAttributeDefinition<T = unknown> {
  name: string;
  type: string;
  description: string;
  allowedOnPropertiesPage: boolean;
  defaultValue: T;
}

export interface PolylineLayoutInit {
  sectorRope?: SectorRope;
  lineStyle?: LineStyle;
}

const DEFAULT_LINE_STYLE: LineStyle = {
  strokeColor: '#2E4057',
  strokeWidth: 1,
};

// =============================================================================
// FUNCION PURA — equivalente a construir rope + layout_attribute_definition
// =============================================================================

export function buildPolylineDefinedAttributes(
  sectorRope: SectorRope,
  lineStyle: LineStyle,
): LayoutAttributeDefinition[] {
  const attribs: LayoutAttributeDefinition[] = []; // Magik: attribs << rope.new()

  attribs.push({
    name: 'sectors',
    type: 'sector_rope',
    description: 'Coordinates',
    allowedOnPropertiesPage: false,
    defaultValue: sectorRope,
  }); // Magik: layout_attribute_definition.new(:sectors, :sector_rope, ...)

  attribs.push({
    name: 'line_style',
    type: 'line_style',
    description: 'Style',
    allowedOnPropertiesPage: true,
    defaultValue: lineStyle,
  }); // Magik: layout_attribute_definition.new(:line_style, :line_style, ...)

  return attribs; // Magik: >> attribs
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class PolylineLayout {
  sectorRope: SectorRope;
  lineStyle: LineStyle;

  constructor(init: PolylineLayoutInit = {}) {
    this.sectorRope = init.sectorRope ?? [];
    this.lineStyle = init.lineStyle ?? { ...DEFAULT_LINE_STYLE };
  }

  // Magik: polyline_layout.defined_attributes
  async definedAttributes(): Promise<LayoutAttributeDefinition[]> {
    return buildPolylineDefinedAttributes(this.sectorRope, this.lineStyle);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de atributos definidos
// =============================================================================

export function PolylineLayoutUI() {
  const [attributes, setAttributes] = useState<LayoutAttributeDefinition[]>([]);

  useEffect(() => {
    let mounted = true;
    const layout = new PolylineLayout();

    layout.definedAttributes().then(result => {
      if (mounted) setAttributes(result);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>polyline_layout.defined_attributes</div>
      {attributes.length === 0 ? (
        <div style={s.meta}>Sin atributos definidos.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>name</th>
              <th style={s.th}>type</th>
              <th style={s.th}>description</th>
              <th style={s.th}>allowedOnPropertiesPage</th>
              <th style={s.th}>defaultValue</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map(attr => (
              <tr key={attr.name}>
                <td style={s.td}>{attr.name}</td>
                <td style={s.td}>{attr.type}</td>
                <td style={s.td}>{attr.description}</td>
                <td style={s.td}>{String(attr.allowedOnPropertiesPage)}</td>
                <td style={s.td}>
                  <pre style={s.pre}>{JSON.stringify(attr.defaultValue, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 10 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#666' },
  table  : { width: '100%', borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '6px 8px', textAlign: 'left', fontSize: 12 },
  td     : { borderBottom: '1px solid #eee', padding: '6px 8px', fontSize: 12, verticalAlign: 'top' },
  pre    : { margin: 0, fontSize: 11, whiteSpace: 'pre-wrap' },
};

export default PolylineLayoutUI;
