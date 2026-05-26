// =============================================================================
// MIGRACIÓN: c_circulo_grafico  →  CCirculoGrafico.tsx
// Jerarquía Magik: c_circulo_grafico  extends  :c_elemento_grafico
// Fuente: adiciones_layout/source/Sellos/Utilerias/c_circulo_grafico.magik
// Empresa: Sigma Tao  ·  Autor: fdiaz  ·  09/12/2004
// =============================================================================
//
// Elemento gráfico que dibuja un círculo centrado en el oArea del elemento
// con estilo de línea negro grosor 2.
//
// Reutiliza el stub CElementoGrafico (+Area, VentanaDibujo) definido en
// CSimboloGrafico.tsx — cuando se migre el padre real, basta cambiar
// el import.
// =============================================================================

import React, { useMemo, useState } from 'react';
import {
  CElementoGrafico,
  type Area,
  type VentanaDibujo,
} from './CSimboloGrafico';

// ---------------------------------------------------------------------------
// Stub: line_style.new_with_properties(:foreground_colour, ..., :width, ...)
// ---------------------------------------------------------------------------

export interface LineStyle {
  foreground_colour: string; // colour.called("black") → 'black'
  width:             number;
}

export function newLineStyle(foreground_colour: string, width: number): LineStyle {
  return { foreground_colour, width };
}

// Descriptor de la llamada a oVentana.draw_circle_transform(...)
export interface DrawCircleCall {
  style:  LineStyle;
  cx:     number;
  cy:     number;
  radius: number;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_circulo_grafico (subclase de c_elemento_grafico).
 */
export class CCirculoGrafico extends CElementoGrafico {
  // ── Slots (todos :private :writable en Magik) ────────────────────────────
  private _sNombre_Grafico: string | undefined = undefined;
  private _nRadio:          number             = 10;

  // ── Magik: new() → _clone (sin parámetros) ──────────────────────────────
  constructor() {
    super();
  }

  // ── sNombre_Grafico ──────────────────────────────────────────────────────
  get sNombre_Grafico(): string | undefined { return this._sNombre_Grafico; }
  set sNombre_Grafico(v: string) { this._sNombre_Grafico = v; }

  // ── nRadio (getter) ──────────────────────────────────────────────────────
  get nRadio(): number { return this._nRadio; }

  // ── nRadio << RnValor (setter) ───────────────────────────────────────────
  // Magik: .nRadio << RnValor * 10
  // El setter MULTIPLICA por 10 — comportamiento conservado. Quien quiera
  // poner radio=10 debe pasar 1; para 50, pasar 5. (Cuirk del Magik.)
  set nRadio(rnValor: number) {
    this._nRadio = rnValor * 10;
  }

  // ── Despliega() ──────────────────────────────────────────────────────────
  // Magik:
  //   LnX << oArea.Xmin + (oArea.Xmax - oArea.Xmin)/2
  //   LnY << oArea.Ymin + (oArea.Ymax - oArea.Ymin)/2
  //   estilo << line_style.new_with_properties(:foreground_colour,
  //                                            colour.called("black"),
  //                                            :width, 2)
  //   oVentana.draw_circle_transform(estilo, x, y, nRadio)
  // En TS: devuelve un DrawCircleCall — la UI lo pinta en SVG.
  Despliega(): DrawCircleCall | undefined {
    if (this.oArea === undefined) return undefined;
    const a: Area = this.oArea;
    const cx = a.xmin + (a.xmax - a.xmin) / 2;
    const cy = a.ymin + (a.ymax - a.ymin) / 2;
    const style = newLineStyle('black', 2);

    // Magik: this.oVentana.draw_circle_transform(style, cx, cy, this._nRadio)
    // (oVentana es opaca aquí — el descriptor basta para la demo.)
    const _ventana: VentanaDibujo | undefined = this.oVentana;
    void _ventana; // referenciado para indicar que el método lo consumiría

    return { style, cx, cy, radius: this._nRadio };
  }
}

// =============================================================================
// Componente React — CCirculoGraficoUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 720,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 80, marginLeft: 4,
  } as React.CSSProperties,
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={styles.v}>{value}</span>
    </div>
  );
}

export function CCirculoGraficoUI() {
  const [areaSize, setAreaSize] = useState(100);
  const [radioIn,  setRadioIn]  = useState(3); // valor del usuario — setter lo *10

  const circulo = useMemo(() => {
    const c = new CCirculoGrafico();
    c.oArea = { xmin: 0, ymin: 0, xmax: areaSize, ymax: areaSize };
    c.oVentana = { id: 'demo-canvas' };
    c.nRadio = radioIn; // setter multiplica por 10
    return c;
  }, [areaSize, radioIn]);

  const draw = circulo.Despliega();

  // Render SVG del círculo dentro del oArea
  const svgSize = 220;
  const scale = areaSize > 0 ? svgSize / areaSize : 1;

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CCirculoGrafico</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          c_elemento_grafico → círculo centrado en oArea
        </span>
      </div>

      {/* Controles */}
      <div style={styles.card}>
        <div style={styles.title}>new() · slots editables</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={styles.k}>oArea (xmax=ymax):</span>
            <input
              type="number"
              value={areaSize}
              min={10}
              onChange={e => setAreaSize(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <label>
            <span style={styles.k}>nRadio &lt;&lt; valor:</span>
            <input
              type="number"
              value={radioIn}
              onChange={e => setRadioIn(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <span style={{ ...styles.k, color: '#fab387' }}>
            setter aplica ×10 → almacena {circulo.nRadio}
          </span>
        </div>
      </div>

      {/* Preview */}
      <div style={styles.card}>
        <div style={styles.title}>Despliega() → draw_circle_transform(style, x, y, radio)</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{
            width: svgSize, height: svgSize, background: '#11111b',
            border: '1px solid #45475a', borderRadius: 4,
          }}>
            {draw && (
              <svg width={svgSize} height={svgSize} viewBox={`0 0 ${areaSize} ${areaSize}`}>
                <rect
                  x={0} y={0} width={areaSize} height={areaSize}
                  fill="none" stroke="#45475a" strokeDasharray="2,2" strokeWidth={0.5}
                />
                <circle
                  cx={draw.cx} cy={draw.cy} r={draw.radius}
                  fill="none" stroke={draw.style.foreground_colour}
                  strokeWidth={draw.style.width / scale}
                />
                <line x1={draw.cx} y1={draw.cy - 2} x2={draw.cx} y2={draw.cy + 2} stroke="#f38ba8" strokeWidth={0.5} />
                <line x1={draw.cx - 2} y1={draw.cy} x2={draw.cx + 2} y2={draw.cy} stroke="#f38ba8" strokeWidth={0.5} />
              </svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Field label="oArea"               value={`[0,0]→[${areaSize},${areaSize}]`} />
            <Field label="centro (cx, cy)"      value={draw ? `${draw.cx}, ${draw.cy}` : '—'} />
            <Field label="radio almacenado"     value={circulo.nRadio} />
            <Field label="style.foreground"     value={draw?.style.foreground_colour ?? '—'} />
            <Field label="style.width"          value={draw?.style.width ?? '—'} />
            {draw && draw.radius > Math.min(areaSize, areaSize) / 2 && (
              <div style={{ color: '#f38ba8', fontSize: 11, marginTop: 6 }}>
                ⚠ radio &gt; area/2 — círculo recortado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quirk del setter */}
      <div style={styles.card}>
        <div style={styles.title}>
          Quirk del setter — .nRadio &lt;&lt; v almacena v × 10
        </div>
        <div style={{ fontSize: 11, color: '#bac2de' }}>
          El método <code>nRadio &lt;&lt; RnValor</code> del Magik aplica
          <code> RnValor * 10</code> antes de asignar al slot. Esta migración
          PRESERVA el comportamiento — no es bug introducido por la traducción.
          Si quieres almacenar radio = 50 debes pasar <code>5</code>.
        </div>
      </div>
    </div>
  );
}
