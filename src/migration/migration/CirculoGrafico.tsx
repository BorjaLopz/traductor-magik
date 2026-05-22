/**
 * Migracion de: c_circulo_grafico.magik
 * Clase Magik:  c_circulo_grafico
 * Metodos:      new, Despliega, nRadio << RnValor
 *
 * Intencion:
 *   Calcular el centro del area y dibujar un circulo con un estilo de linea.
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

export interface LineStyle {
  color: string;
  width: number;
}

export interface CircleRender {
  cx: number;
  cy: number;
  radius: number;
  style: LineStyle;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CirculoGrafico {
  sNombreGrafico: string | null = null;
  nRadio: number = 10;
  oArea: Bounds;

  constructor(area: Bounds) {
    this.oArea = area;
  }

  // Magik: new() -> _clone
  static create(area: Bounds): CirculoGrafico {
    return new CirculoGrafico(area);
  }

  // Magik: nRadio << RnValor (multiplica por 10)
  async setRadio(valor: number): Promise<void> {
    this.nRadio = valor * 10;
  }

  // Magik: Despliega()
  async despliega(): Promise<CircleRender> {
    const cx = this.oArea.xmin + (this.oArea.xmax - this.oArea.xmin) / 2;
    const cy = this.oArea.ymin + (this.oArea.ymax - this.oArea.ymin) / 2;

    const style: LineStyle = {
      color: '#000000',
      width: 2,
    }; // Magik: line_style.new_with_properties(:foreground_colour, black, :width, 2)

    return { cx, cy, radius: this.nRadio, style };
  }
}

// =============================================================================
// COMPONENTE REACT — demo del circulo
// =============================================================================

export function CirculoGraficoUI() {
  const [radioBase, setRadioBase] = useState(10);
  const [render, setRender] = useState<CircleRender | null>(null);

  const area = useMemo<Bounds>(() => ({ xmin: 0, xmax: 100, ymin: 0, ymax: 100 }), []);

  useEffect(() => {
    let mounted = true;
    const grafico = CirculoGrafico.create(area);

    grafico.setRadio(radioBase).then(() => {
      return grafico.despliega();
    }).then(result => {
      if (mounted) setRender(result);
    });

    return () => {
      mounted = false;
    };
  }, [area, radioBase]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_circulo_grafico</div>
      <label style={s.label}>
        Radio base
        <input
          type="number"
          value={radioBase}
          onChange={e => setRadioBase(Number(e.target.value))}
          style={s.input}
        />
      </label>
      <svg viewBox="0 0 100 100" width={160} height={160} style={s.preview}>
        {render && (
          <circle
            cx={render.cx}
            cy={render.cy}
            r={render.radius}
            fill="none"
            stroke={render.style.color}
            strokeWidth={render.style.width}
          />
        )}
      </svg>
      <div style={s.meta}>Radio real = base x 10 (Magik)</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  label  : { fontSize: 12, color: '#333', display: 'flex', gap: 6, alignItems: 'center' },
  input  : { padding: '4px 6px', fontSize: 12, width: 100 },
  preview: { background: '#f7f7f7', borderRadius: 6, border: '1px solid #ddd' },
  meta   : { fontSize: 11, color: '#777' },
};

export default CirculoGraficoUI;
