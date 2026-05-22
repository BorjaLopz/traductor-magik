/**
 * Migracion de: c_detalles_layout.magik
 * Clase Magik:  c_detalles_layout
 * Metodos:      defined_attributes, initialise_for_page, draw_content_on
 *
 * Intencion:
 *   Ajustar el bounds al marco del layout y dibujar textos de copyright.
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

export interface LayoutElement {
  name: string;
  bounds: Bounds;
}

export interface LayoutPage {
  elements: LayoutElement[];
}

export interface TextDraw {
  text: string;
  box: Bounds;
  size: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function findElement(page: LayoutPage | null, name: string): LayoutElement | null {
  if (!page) return null;
  return page.elements.find(el => el.name === name) ?? null;
}

function buildCopyrightBoxes(bounds: Bounds): TextDraw[] {
  const baseX = bounds.xmax;
  const baseY1 = bounds.ymin + 550;
  const baseY2 = bounds.ymin + 600;

  const box1: Bounds = {
    xmin: baseX - 80,
    xmax: baseX,
    ymin: baseY1,
    ymax: baseY1 + 2200,
  };

  const box2: Bounds = {
    xmin: baseX - 20,
    xmax: baseX,
    ymin: baseY2,
    ymax: baseY2 + 2200,
  };

  return [
    {
      text: 'INFORMACION CONFIDENCIAL PROPIEDAD DE TELMEX, ',
      box: box1,
      size: 3,
    },
    {
      text: 'PROHIBIDA SU REPRODUCCION  PARCIAL O TOTAL.',
      box: box2,
      size: 3,
    },
  ];
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class DetallesLayout {
  bounds: Bounds | null = null;
  layoutPage: LayoutPage | null = null;

  constructor(page: LayoutPage | null = null) {
    this.layoutPage = page;
  }

  // Magik: defined_attributes
  async definedAttributes(base: unknown[] = []): Promise<unknown[]> {
    const attrs = [...base]; // Magik: rope.new_from(_super.defined_attributes)
    return attrs;
  }

  // Magik: initialise_for_page(a_layout_page)
  async initialiseForPage(page: LayoutPage): Promise<void> {
    this.layoutPage = page;
    const marco = findElement(page, 'marco_layout');
    if (marco) this.bounds = marco.bounds;
  }

  // Magik: draw_content_on(window)
  async drawContentOn(): Promise<TextDraw[]> {
    if (!this.layoutPage) return [];
    const marco = findElement(this.layoutPage, 'marco_layout');
    if (!marco) return [];

    this.bounds = marco.bounds;
    return buildCopyrightBoxes(marco.bounds);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de los textos
// =============================================================================

export function DetallesLayoutUI() {
  const [draws, setDraws] = useState<TextDraw[]>([]);

  const page = useMemo<LayoutPage>(() => ({
    elements: [
      { name: 'marco_layout', bounds: { xmin: 0, ymin: 0, xmax: 1000, ymax: 3000 } },
    ],
  }), []);

  useEffect(() => {
    let mounted = true;
    const layout = new DetallesLayout(page);

    layout.initialiseForPage(page).then(() => layout.drawContentOn()).then(result => {
      if (mounted) setDraws(result);
    });

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_detalles_layout</div>
      {draws.length === 0 ? (
        <div style={s.meta}>Sin textos de copyright.</div>
      ) : (
        <div style={s.list}>
          {draws.map((d, idx) => (
            <div key={idx} style={s.item}>
              <div style={s.text}>{d.text}</div>
              <div style={s.meta}>Caja: ({d.box.xmin}, {d.box.ymin}) - ({d.box.xmax}, {d.box.ymax})</div>
              <div style={s.meta}>Size: {d.size}</div>
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
  list   : { display: 'flex', flexDirection: 'column', gap: 8 },
  item   : { padding: 8, border: '1px solid #eee', borderRadius: 6 },
  text   : { fontSize: 12, color: '#333' },
  meta   : { fontSize: 11, color: '#777' },
};

export default DetallesLayoutUI;
