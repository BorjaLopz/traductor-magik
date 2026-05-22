/**
 * Migración de: c_tachado_grafico.magik
 * Clase Magik:  c_tachado_grafico  —  Sigma Tao / dsanchez / 2004-12-06
 * Hereda:       c_elemento_grafico
 *
 * Dibuja una rejilla (tachado) dentro de un área (bounding box):
 *   - Líneas verticales   cada `spacing` unidades (X de Xmin+step a Xmax)
 *   - Líneas horizontales cada `spacing` unidades (Y de Ymin+step a Ymax)
 * Color negro, grosor 2 (fijo en el original).
 *
 * NOTA: El primer _loop del Magik tiene el comentario "líneas horizontales"
 * pero en realidad dibuja líneas VERTICALES (X constante, Y varía).
 * El segundo _loop dibuja correctamente las horizontales. Se respeta la
 * intención real del código, no el comentario erróneo.
 */

import React, { useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Área de dibujo — equivale al slot oArea de c_elemento_grafico. */
export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

/**
 * Estilo de línea.
 * Magik: line_style.new_with_properties(:foreground_colour, colour.called("black"), :width, 2)
 */
export interface LineStyle {
  color: string;
  width: number;
}

/** Un segmento de línea [x1, y1, x2, y2] en coordenadas del área. */
export type Segment = [number, number, number, number];

/** Resultado de despliega(): rejilla dividida en verticales + horizontales. */
export interface GridSegments {
  vertical:   Segment[];
  horizontal: Segment[];
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CTachadoGrafico {

  // {:sNombre_Grafico, _unset} — slot privado de la clase Magik
  private sNombreGrafico: string | null = null;

  // Heredados de c_elemento_grafico (oArea + oVentana)
  private oArea:      BoundingBox;
  private lineStyle:  LineStyle;
  private spacing:    number;

  constructor(
    oArea:     BoundingBox,
    spacing:   number    = 10,
    lineStyle: LineStyle = { color: 'black', width: 2 },
  ) {
    this.oArea     = oArea;
    this.spacing   = spacing;
    this.lineStyle = lineStyle;
  }

  /**
   * Magik: c_tachado_grafico.Despliega()
   *
   * Genera los segmentos de la rejilla sin dibujar directamente.
   * En Magik: oVentana.draw_line_transform(LoEstiloLinea, LoCoordenada)
   * En TS:    devuelve GridSegments → el renderizador SVG/Canvas los pinta.
   *
   * Loop 1 — líneas VERTICALES (X fijo, Y de Ymin a Ymax):
   *   Magik: LnX << oArea.Xmin → LnX + 10 → draw (LnX,Ymin)-(LnX,Ymax)
   *   TS:    vertical.push([lnX, ymin, lnX, ymax])
   *
   * Loop 2 — líneas HORIZONTALES (Y fija, X de Xmin a Xmax):
   *   Magik: LnY << oArea.Ymin → LnY + 10 → draw (Xmin,LnY)-(Xmax,LnY)
   *   TS:    horizontal.push([xmin, lnY, xmax, lnY])
   */
  despliega(): GridSegments {
    const { xmin, ymin, xmax, ymax } = this.oArea;
    const vertical:   Segment[] = [];
    const horizontal: Segment[] = [];

    // Loop 1: líneas verticales (comentadas erróneamente como "horizontales" en el .magik)
    // LnX empieza en Xmin y se incrementa ANTES de dibujar → primera línea en Xmin+spacing
    let lnX = xmin;
    while (true) {
      lnX += this.spacing;                          // LnX << LnX + 10
      if (lnX > xmax) break;                        // _if LnX > oArea.XMax → _leave
      vertical.push([lnX, ymin, lnX, ymax]);        // coord[1]=(LnX,Ymin) coord[2]=(LnX,Ymax)
    }

    // Loop 2: líneas horizontales
    // LnY empieza en Ymin y se incrementa ANTES de dibujar → primera línea en Ymin+spacing
    let lnY = ymin;
    while (true) {
      lnY += this.spacing;                          // LnY << LnY + 10
      if (lnY > ymax) break;                        // _if LnY > oArea.YMax → _leave
      horizontal.push([xmin, lnY, xmax, lnY]);      // coord[1]=(Xmin,LnY) coord[2]=(Xmax,LnY)
    }

    return { vertical, horizontal };
  }

  // Getters / setters (equivalen a los accesores de slot en Magik)
  getArea():      BoundingBox { return this.oArea;      }
  getLineStyle(): LineStyle   { return this.lineStyle;  }
  getSpacing():   number      { return this.spacing;    }
  setArea(a: BoundingBox):    void { this.oArea    = a; }
  setSpacing(s: number):      void { this.spacing  = s; }
  getNombreGrafico():         string | null { return this.sNombreGrafico; }
  setNombreGrafico(n: string): void { this.sNombreGrafico = n; }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// BoundingBox + spacing inputs → rejilla SVG en tiempo real.
// =============================================================================

const DEMO_AREA: BoundingBox = { xmin: 0, ymin: 0, xmax: 100, ymax: 80 };
const SVG_W = 400;
const SVG_H = 320;
const PAD   = 20;

export function TachadoGraficoUI() {
  const [area,    setArea]    = useState<BoundingBox>(DEMO_AREA);
  const [spacing, setSpacing] = useState<number>(10);
  const [color,   setColor]   = useState<string>('#000000');
  const [width,   setWidth]   = useState<number>(1);

  // Generar rejilla
  const grid = useMemo(() => {
    const c = new CTachadoGrafico(area, spacing, { color, width });
    return c.despliega();
  }, [area, spacing, color, width]);

  // Normalización al viewport SVG
  const rangeX = area.xmax - area.xmin || 1;
  const rangeY = area.ymax - area.ymin || 1;
  const drawW  = SVG_W - 2 * PAD;
  const drawH  = SVG_H - 2 * PAD;

  const toSvgX = (x: number) => PAD + ((x - area.xmin) / rangeX) * drawW;
  // Y invertida: GIS Y-arriba → SVG Y-abajo
  const toSvgY = (y: number) => PAD + ((area.ymax - y) / rangeY) * drawH;

  const segToProps = ([x1, y1, x2, y2]: Segment) => ({
    x1: toSvgX(x1), y1: toSvgY(y1),
    x2: toSvgX(x2), y2: toSvgY(y2),
  });

  const totalLines = grid.vertical.length + grid.horizontal.length;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_tachado_grafico — Rejilla (Despliega)</h3>

      {/* Controles BoundingBox */}
      <div style={s.controls}>
        <fieldset style={s.fieldset}>
          <legend style={s.legend}>oArea (BoundingBox)</legend>
          <div style={s.grid4}>
            {(['xmin','ymin','xmax','ymax'] as const).map(k => (
              <div key={k} style={s.inputRow}>
                <label style={s.lbl}>{k}</label>
                <input
                  style={s.inp}
                  type="number"
                  value={area[k]}
                  onChange={e => setArea(v => ({ ...v, [k]: +e.target.value }))}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset style={s.fieldset}>
          <legend style={s.legend}>line_style + spacing</legend>
          <div style={s.inputRow}>
            <label style={s.lbl}>spacing (u.)</label>
            <input style={s.inp} type="number" min={1} value={spacing}
              onChange={e => setSpacing(Math.max(1, +e.target.value))} />
          </div>
          <div style={s.inputRow}>
            <label style={s.lbl}>color</label>
            <input style={{ ...s.inp, width: 50, padding: 2 }} type="color" value={color}
              onChange={e => setColor(e.target.value)} />
          </div>
          <div style={s.inputRow}>
            <label style={s.lbl}>width (px)</label>
            <input style={s.inp} type="number" min={1} max={5} value={width}
              onChange={e => setWidth(+e.target.value)} />
          </div>
        </fieldset>
      </div>

      {/* Contador de líneas */}
      <div style={s.stats}>
        <span style={s.tag}>Verticales: <strong>{grid.vertical.length}</strong></span>
        <span style={s.tag}>Horizontales: <strong>{grid.horizontal.length}</strong></span>
        <span style={s.tag}>Total segmentos: <strong>{totalLines}</strong></span>
        <span style={s.tag}>Paso: <strong>{spacing} u.</strong></span>
      </div>

      {/* Previsualización SVG */}
      <svg
        width={SVG_W} height={SVG_H}
        style={{ border: '1px solid #ddd', borderRadius: 4, background: '#fff', display: 'block' }}
      >
        {/* Bounding box del área */}
        <rect
          x={toSvgX(area.xmin)} y={toSvgY(area.ymax)}
          width={drawW} height={drawH}
          fill="none" stroke="#aaa" strokeWidth={1} strokeDasharray="4,3"
        />

        {/* Líneas verticales — Magik: primer _loop */}
        {grid.vertical.map((seg, i) => (
          <line key={`v${i}`} {...segToProps(seg)}
            stroke={color} strokeWidth={width} opacity={0.7} />
        ))}

        {/* Líneas horizontales — Magik: segundo _loop */}
        {grid.horizontal.map((seg, i) => (
          <line key={`h${i}`} {...segToProps(seg)}
            stroke={color} strokeWidth={width} opacity={0.7} />
        ))}

        {/* Etiquetas de esquinas */}
        {[
          { x: area.xmin, y: area.ymin, lbl: `(${area.xmin},${area.ymin})`, dx: 4,  dy: -4 },
          { x: area.xmax, y: area.ymax, lbl: `(${area.xmax},${area.ymax})`, dx: -4, dy: 10 },
        ].map(({ x, y, lbl, dx, dy }) => (
          <text key={lbl}
            x={toSvgX(x) + dx} y={toSvgY(y) + dy}
            fontSize={9} fill="#888">{lbl}</text>
        ))}
      </svg>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:460, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  controls : { display:'flex', gap:12, flexWrap:'wrap' as const },
  fieldset : { border:'1px solid #ddd', borderRadius:4, padding:'8px 12px', margin:0, flex:1, minWidth:160 },
  legend   : { fontSize:11, color:'#666', padding:'0 4px' },
  grid4    : { display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 },
  inputRow : { display:'flex', alignItems:'center', gap:6, marginBottom:4 },
  lbl      : { minWidth:75, color:'#555', fontSize:11 },
  inp      : { width:70, padding:'3px 5px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  stats    : { display:'flex', gap:8, flexWrap:'wrap' as const },
  tag      : { background:'#e8f0fe', padding:'3px 9px', borderRadius:10, fontSize:11 },
};

export default TachadoGraficoUI;
