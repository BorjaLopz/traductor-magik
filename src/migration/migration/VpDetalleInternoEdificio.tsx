/**
 * Migracion de: c_vp_detalle_interno_edificio.magik
 * Clase Magik:  c_vp_detalle_interno_edificio
 * Metodos:      initialise_for_page, geometry_set_for_render, draw_content_on, agregar_titulo
 *
 * Intencion:
 *   Configurar el viewport, obtener geometrias y agregar un titulo
 *   "DETALLE DE EDIFICIO" al layout.
 */

import React, { useEffect, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface LayoutPage {
  bounds: Bounds;
  elements: Array<{ name: string; bounds: Bounds }>;
  addElement(element: LayoutTextElement): void;
}

export interface LayoutTextElement {
  bounds: Bounds;
  text: string;
  fontName: string;
  fontSize: number;
  alignHorizontal: 'centre' | 'left' | 'right';
  alignVertical: 'centre' | 'top' | 'bottom';
}

export interface GeometrySet {
  id: string;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class VpDetalleInternoEdificio {
  oResulSet: GeometrySet[] | null = null;
  aceName: string = '';
  titulo: string = '';
  tamanio: number = 8;
  bounds: Bounds = { xmin: 0, xmax: 0, ymin: 0, ymax: 0 };

  // Magik: initialise_for_page(a_layout_page)
  async initialiseForPage(page: LayoutPage): Promise<void> {
    this.aceName = 'mit_floor_internal';
    await this.agregarTitulo(page);
  }

  // Magik: geometry_set_for_render
  async geometrySetForRender(superSet: GeometrySet[] = []): Promise<GeometrySet[]> {
    // Magik: _dynamic !current_coordinate_system! << _unset
    this.oResulSet = [...superSet];
    return this.oResulSet;
  }

  // Magik: draw_content_on(windows)
  async drawContentOn(): Promise<void> {
    // En Magik solo llama a _super.draw_content_on(windows)
  }

  // Magik: agregar_titulo(PoPage)
  async agregarTitulo(page: LayoutPage): Promise<void> {
    const titleBounds: Bounds = {
      xmin: this.bounds.xmin,
      xmax: this.bounds.xmax,
      ymin: this.bounds.ymin - 100,
      ymax: this.bounds.ymin,
    };

    const element: LayoutTextElement = {
      bounds: titleBounds,
      text: 'DETALLE DE EDIFICIO',
      fontName: 'bold',
      fontSize: this.tamanio,
      alignHorizontal: 'centre',
      alignVertical: 'centre',
    };

    page.addElement(element);
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function VpDetalleInternoEdificioUI() {
  const [elements, setElements] = useState<LayoutTextElement[]>([]);

  const page = useMemo<LayoutPage>(() => ({
    bounds: { xmin: 0, ymin: 0, xmax: 1000, ymax: 800 },
    elements: [],
    addElement: (el: LayoutTextElement) => {
      page.elements.push(el);
    },
  }), []);

  useEffect(() => {
    let mounted = true;
    const vp = new VpDetalleInternoEdificio();
    vp.bounds = page.bounds;

    vp.initialiseForPage(page).then(() => {
      if (mounted) setElements([...page.elements]);
    });

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_vp_detalle_interno_edificio</div>
      {elements.length === 0 ? (
        <div style={s.meta}>Sin elementos de titulo.</div>
      ) : (
        <div style={s.list}>
          {elements.map((el, idx) => (
            <div key={idx} style={s.item}>
              <div style={s.text}>{el.text}</div>
              <div style={s.meta}>Bounds: ({el.bounds.xmin}, {el.bounds.ymin}) - ({el.bounds.xmax}, {el.bounds.ymax})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 11, color: '#777' },
  list   : { display: 'flex', flexDirection: 'column', gap: 8 },
  item   : { padding: 8, border: '1px solid #eee', borderRadius: 6 },
  text   : { fontSize: 12, color: '#333' },
};

export default VpDetalleInternoEdificioUI;
