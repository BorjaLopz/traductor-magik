/**
 * Migracion de: c_dibuja.magik
 * Clase Magik:  c_dibuja
 * Metodos:      new, oVentana, oLayout, Dibuja
 *
 * Intencion:
 *   Dibujar graficos en una ventana a partir de una lista de trazos.
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

export interface Layout {
  bounds: Bounds;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface Trazo {
  fillStyle: string;
  lineStyle: string;
  points: DrawPoint[];
}

export interface Dibujado {
  fillStyle: string;
  lineStyle: string;
  points: DrawPoint[];
}

// =============================================================================
// HELPERS
// =============================================================================

function rotatePoints(points: DrawPoint[], angleRad: number): DrawPoint[] {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return points.map(p => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }));
}

function translatePoints(points: DrawPoint[], dx: number, dy: number): DrawPoint[] {
  return points.map(p => ({ x: p.x + dx, y: p.y + dy }));
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class Dibuja {
  oLayout: Layout | null = null;
  oVentana: string | null = null; // placeholder de window

  // Magik: new()
  static create(): Dibuja {
    return new Dibuja();
  }

  // Magik: oVentana << RoVentana
  async setVentana(ventana: string | null): Promise<void> {
    this.oVentana = ventana;
  }

  // Magik: oVentana (get)
  async getVentana(): Promise<string | null> {
    return this.oVentana;
  }

  // Magik: oLayout << RoLay
  async setLayout(layout: Layout | null): Promise<void> {
    this.oLayout = layout;
  }

  // Magik: oLayout (get)
  async getLayout(): Promise<Layout | null> {
    return this.oLayout;
  }

  // Magik: Dibuja(oGrafico)
  async dibuja(trazos: Trazo[]): Promise<Dibujado[]> {
    if (!this.oLayout) return [];

    const dx = this.oLayout.bounds.xmin;
    const dy = this.oLayout.bounds.ymax;
    const angle = 0; // Magik: LnAngle << 0

    return trazos.map(trazo => {
      const rotated = rotatePoints(trazo.points, angle);
      const translated = translatePoints(rotated, dx, dy);
      return {
        fillStyle: trazo.fillStyle,
        lineStyle: trazo.lineStyle,
        points: translated,
      };
    });
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function DibujaUI() {
  const [result, setResult] = useState<Dibujado[]>([]);

  const layout = useMemo<Layout>(() => ({
    bounds: { xmin: 0, ymin: 0, xmax: 400, ymax: 200 },
  }), []);

  const trazos = useMemo<Trazo[]>(() => ([
    {
      fillStyle: '#DCE6F1',
      lineStyle: '#2E4057',
      points: [
        { x: 20, y: -20 },
        { x: 120, y: -20 },
        { x: 120, y: -80 },
        { x: 20, y: -80 },
      ],
    },
  ]), []);

  useEffect(() => {
    let mounted = true;
    const d = Dibuja.create();
    d.setLayout(layout).then(() => d.dibuja(trazos)).then(draw => {
      if (mounted) setResult(draw);
    });

    return () => {
      mounted = false;
    };
  }, [layout, trazos]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_dibuja</div>
      <svg viewBox="0 0 400 200" width={260} height={140} style={s.preview}>
        {result.map((d, idx) => (
          <polygon
            key={idx}
            points={d.points.map(p => `${p.x},${p.y}`).join(' ')}
            fill={d.fillStyle}
            stroke={d.lineStyle}
            strokeWidth={2}
          />
        ))}
      </svg>
      <div style={s.meta}>Transformacion: rotacion 0 + traslacion (xmin, ymax).</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 11, color: '#777' },
  preview: { background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
};

export default DibujaUI;
