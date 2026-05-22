/**
 * Migracion de: c_margen_layout.magik
 * Clase Magik:  c_margen_layout
 * Metodos:      defined_attributes, initialise_for_page, draw_content_on, margen
 *
 * Intencion:
 *   Dibujar el margen del layout con 4 segmentos dentro del bounds.
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
  elements: { name: string; bounds: Bounds }[];
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function findElement(page: LayoutPage | null, name: string): boolean {
  if (!page) return false;
  return page.elements.some(el => el.name === name);
}

function buildMarginSegments(bounds: Bounds): Segment[] {
  const p1 = { x: bounds.xmin + 250, y: bounds.ymin + 100 };
  const p2 = { x: bounds.xmin + 250, y: bounds.ymax - 250 };
  const p3 = { x: bounds.xmax - 100, y: bounds.ymin + 100 };
  const p4 = { x: bounds.xmax - 100, y: bounds.ymax - 250 };

  return [
    { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y },
    { x1: p1.x, y1: p1.y, x2: p3.x, y2: p3.y },
    { x1: p3.x, y1: p3.y, x2: p4.x, y2: p4.y },
    { x1: p2.x, y1: p2.y, x2: p4.x, y2: p4.y },
  ];
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class MargenLayout {
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
  }

  // Magik: draw_content_on(window)
  async drawContentOn(): Promise<Segment[]> {
    if (!this.layoutPage) return [];
    const hasMarco = findElement(this.layoutPage, 'marco_layout');
    if (!hasMarco) return [];

    return this.margen();
  }

  // Magik: margen(PoWindow)
  async margen(): Promise<Segment[]> {
    if (!this.layoutPage) return [];
    return buildMarginSegments(this.layoutPage.bounds);
  }
}

// =============================================================================
// COMPONENTE REACT — demo de margen
// =============================================================================

export function MargenLayoutUI() {
  const [segments, setSegments] = useState<Segment[]>([]);

  const page = useMemo<LayoutPage>(() => ({
    bounds: { xmin: 0, ymin: 0, xmax: 1000, ymax: 3000 },
    elements: [{ name: 'marco_layout', bounds: { xmin: 0, ymin: 0, xmax: 1000, ymax: 3000 } }],
  }), []);

  useEffect(() => {
    let mounted = true;
    const layout = new MargenLayout(page);

    layout.initialiseForPage(page).then(() => layout.drawContentOn()).then(result => {
      if (mounted) setSegments(result);
    });

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_margen_layout</div>
      <svg viewBox="0 0 1000 3000" width={220} height={220} style={s.preview}>
        {segments.map((seg, idx) => (
          <line
            key={idx}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke="#000"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div style={s.meta}>4 segmentos dibujados dentro del bounds.</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 11, color: '#777' },
  preview: { background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
};

export default MargenLayoutUI;
