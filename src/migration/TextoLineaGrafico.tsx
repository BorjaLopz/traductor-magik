/**
 * Migración de: c_texto_linea_grafico.magik
 * Clase Magik:  c_texto_linea_grafico  —  Sigma Tao SIGC11 / dsanchez / 2004
 * Hereda:       c_texto_grafico  (stub definido abajo — pendiente migración)
 *
 * Elemento de texto con línea horizontal al pie de su bounding box (oArea).
 *
 * Magik Despliega():
 *   1. _super.Despliega()                                 → renderiza texto
 *   2. line_style(color=black, width=2)
 *   3. coords[1] = (xMin+1, yMin+10)  ← yMin en Y-up Magik = borde inferior
 *   4. coords[2] = (xMax-10, yMin+10)
 *   5. oVentana.draw_line_transform(style, coords)        → dibuja línea
 *
 * Conversión de coordenadas:
 *   Magik usa Y-up (GIS estándar):  yMin = borde INFERIOR del bbox.
 *   SVG  usa Y-down:                yMax = borde INFERIOR del bbox.
 *   → Magik (xMin+1, yMin+10)  ≡  SVG (xMin+1, yMax-10)
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: oArea — bounding box del elemento en coordenadas SVG (Y-down) */
export interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;  // SVG: borde superior (Y-down)
  yMax: number;  // SVG: borde inferior
}

// =============================================================================
// BASE — c_texto_grafico  (stub — pendiente migración)
// =============================================================================

/**
 * Stub para c_texto_grafico — pendiente de migrar su fichero .magik.
 * Aporta campos de texto y renderizado SVG base.
 * Magik: def_slotted_exemplar(:c_texto_grafico, {...}, :c_elemento_entidad_g)
 */
export class TextoGrafico {
  texto     : string       = '';
  nTamanio  : number       = 30;     // Magik: nTamanio — factor de tamaño de fuente
  nMargenSup: number       = 0;      // margen superior dentro del bbox
  nMargenInf: number       = 0;      // margen inferior dentro del bbox
  oArea     : BoundingBox | null = null;

  /**
   * Magik: c_texto_grafico.Despliega()
   * Renderiza el texto centrado horizontalmente en oArea.
   * TS: devuelve JSX <text> — equivale al dibujo en oVentana de Magik.
   */
  desplega(area: BoundingBox): React.ReactNode {
    const cx = (area.xMin + area.xMax) / 2;
    // Centro vertical del área útil (entre márgenes)
    const usable = (area.yMax - area.yMin) - this.nMargenSup - this.nMargenInf;
    const cy     = area.yMin + this.nMargenSup + usable / 2;
    const fs     = Math.max(8, this.nTamanio * 0.35);
    return (
      <text
        x={cx}
        y={cy + fs * 0.35}
        textAnchor="middle"
        fontSize={fs}
        fill="black"
        fontFamily="sans-serif"
      >
        {this.texto}
      </text>
    );
  }
}

// =============================================================================
// CLASE PRINCIPAL — c_texto_linea_grafico
// =============================================================================

/**
 * Magik: c_texto_linea_grafico  extends  c_texto_grafico
 *
 * Sobreescribe Despliega() para añadir una línea horizontal
 * al pie del bounding box.
 *
 * Márgenes hardcodeados en el Magik original:
 *   LnMargIzq = 1   → distancia desde xMin al inicio de la línea
 *   LnMargDer = 10  → retranqueo desde xMax al fin   de la línea
 *   LnMargInf = 10  → distancia desde el borde inferior (Magik yMin / SVG yMax)
 */
export class TextoLineaGrafico extends TextoGrafico {

  // Magik: _Local LnMargIzq << 1 / LnMargDer << 10 / LnMargInf << 10
  private static readonly MARG_IZQ   = 1;
  private static readonly MARG_DER   = 10;
  private static readonly MARG_INF   = 10;
  private static readonly LINE_WIDTH = 2;   // Magik: :width, 2

  /**
   * Magik: c_texto_linea_grafico.Despliega()
   *
   * Paso 1 — _super.Despliega()
   *   TS: super.desplega(area)  → <text> centrado en bbox
   *
   * Paso 2 — draw_line_transform(line_style(black, w=2), coords_vector)
   *   coords[1] = (xMin+1,  yMin+10)  Magik Y-up
   *   coords[2] = (xMax-10, yMin+10)  Magik Y-up
   *   TS SVG Y-down: lineY = yMax - MARG_INF
   */
  desplega(area: BoundingBox): React.ReactNode {
    const { xMin, xMax, yMax } = area;

    // Magik: oArea.Ymin + LnMargInf  →  SVG: yMax - MARG_INF  (Y-down vs Y-up)
    const lineY = yMax - TextoLineaGrafico.MARG_INF;

    return (
      <>
        {/* _super.Despliega() — texto heredado de c_texto_grafico */}
        {super.desplega(area)}

        {/* draw_line_transform — línea negra, grosor 2, al pie del bbox */}
        <line
          x1={xMin + TextoLineaGrafico.MARG_IZQ}
          y1={lineY}
          x2={xMax - TextoLineaGrafico.MARG_DER}
          y2={lineY}
          stroke="black"
          strokeWidth={TextoLineaGrafico.LINE_WIDTH}
        />
      </>
    );
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// Muestra celdas con TextoLineaGrafico renderizado como SVG.
// =============================================================================

const CELDAS_DEMO: Array<{ texto: string; ancho: number; alto: number }> = [
  { texto: 'Circuito Norte',                        ancho: 220, alto: 50 },
  { texto: 'Ramal MAD-01',                          ancho: 220, alto: 50 },
  { texto: 'Enlace BCN — Fibra Óptica',             ancho: 220, alto: 50 },
  { texto: 'Texto largo para probar el recorte',    ancho: 300, alto: 60 },
];

function renderCelda(texto: string, ancho: number, alto: number) {
  const elem = new TextoLineaGrafico();
  elem.texto    = texto;
  elem.nTamanio = 28;
  const area: BoundingBox = { xMin: 0, xMax: ancho, yMin: 0, yMax: alto };
  return elem.desplega(area);
}

export function TextoLineaGraficoUI() {
  const [textoCustom, setTextoCustom] = useState('Texto editable aquí');

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_texto_linea_grafico.Despliega()</h3>
      <p style={s.meta}>
        Extiende <code>c_texto_grafico</code>. Añade línea horizontal al pie de{' '}
        <code>oArea</code> (márgenes fijos: IZQ=1, DER=10, INF=10 · grosor=2).
      </p>

      {/* Input para texto personalizado */}
      <div style={s.control}>
        <label style={{ fontSize: 12 }}>
          Texto personalizado:{' '}
          <input
            value={textoCustom}
            onChange={e => setTextoCustom(e.target.value)}
            style={{ marginLeft: 6, padding: '2px 6px', fontSize: 12, width: 220 }}
          />
        </label>
        <small style={{ color: '#888', marginLeft: 12 }}>
          Modifica el texto de la celda editable (última fila).
        </small>
      </div>

      {/* Tabla de demo */}
      <table style={s.table}>
        <thead>
          <tr>
            {['Texto', 'Bbox (px)', 'lineY (SVG)', 'Renderizado'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CELDAS_DEMO.map((c, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f8f8f8' : '#fff' }}>
              <td style={s.td}><code>{c.texto}</code></td>
              <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>
                {c.ancho}×{c.alto}
              </td>
              <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>
                {c.alto - 10}
              </td>
              <td style={s.td}>
                <svg
                  width={c.ancho}
                  height={c.alto}
                  style={{ border: '1px solid #ccc', background: '#fafafa', borderRadius: 2, display: 'block' }}
                >
                  {renderCelda(c.texto, c.ancho, c.alto)}
                </svg>
              </td>
            </tr>
          ))}

          {/* Fila editable */}
          <tr style={{ background: '#e8f0fe' }}>
            <td style={s.td}><em>{textoCustom}</em></td>
            <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>280×50</td>
            <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>40</td>
            <td style={s.td}>
              <svg
                width={280}
                height={50}
                style={{ border: '1px dashed #2E4057', background: '#f0f4f8', borderRadius: 2, display: 'block' }}
              >
                {renderCelda(textoCustom, 280, 50)}
              </svg>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Línea dibujada en <code>y = yMax − 10</code>{' '}
        (equivalente Magik: <code>oArea.Ymin + LnMargInf</code> en sistema Y-up).
        Texto centrado en <code>oArea</code> por <code>_super.Despliega()</code>.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap', gap: 8 },
  table  : { width: '100%', borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '6px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '6px 10px', borderBottom: '1px solid #eee', fontSize: 12, verticalAlign: 'middle' },
};

export default TextoLineaGraficoUI;
