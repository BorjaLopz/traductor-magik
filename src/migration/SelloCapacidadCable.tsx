/**
 * Migración: c_sello_capacidad_cable.magik
 * Clase Magik:  c_sello_capacidad_cable — extiende c_base_sello_fibra
 *
 * Cuadro de capacidad de cable para planos de red.
 * Dos tablas apiladas:
 *   tbl_titulo    — 2 filas {6,6}u × 1 col {44}u  — "CUADRO" + "PARA CAPACIDAD DE CABLE"
 *   tbl_contenido — 18 filas {6}u  × 2 cols {7,37}u — código letra → capacidad PS.
 *
 * configura_tabla()  → posición y dimensiones de cada tabla
 * etiqueta_celdas()  → texto verde en cada celda individual (18 filas × 2 cols)
 *
 * Bordes ocultos en tbl_titulo celda [1,1]:
 *   :borde_sup     → sin borde superior fila 1
 *   :borde_der_izq → sin bordes laterales fila 1
 *
 * Conversión de coordenadas:
 *   Magik Y-up: y − LfDesplazaY  →  SVG Y-down: y + desplazaY
 *   LfDesplazaY = longitud_total_renglones({:tbl_titulo}) = 12u  (sin bug: solo 1 llamada)
 */

import React, { useState } from 'react';
import type { ColorMagik, CeldaTexto } from './SelloSimbologiaDiagramaEmpalmes';
import { CBaseSelloFibra } from './SelloSimbologiaDiagramaEmpalmes';

// =============================================================================
// CONSTANTES DE LAYOUT — extraídas de los property_list del original
// =============================================================================

// Magik: :ren, {6,6} → tbl_titulo (2 filas)
const TITULO_ROWS = [6, 6];
// Magik: :ren, {6,6,...×18} → tbl_contenido (18 filas × 6u)
const CONT_ROWS   = Array<number>(18).fill(6);
// Magik: :col, {44} y :col, {7,37} → ambas tablas tienen 44u de ancho
const TITULO_COLS = [44];
const CONT_COLS   = [7, 37];

const TITULO_H = TITULO_ROWS.reduce((a, b) => a + b, 0); // 12u
const CONT_H   = CONT_ROWS.reduce((a, b) => a + b, 0);   // 108u
const TABLE_W  = TITULO_COLS[0];                          // 44u

// Magik: {0, 0.2993, 0} → RGB(0, 76, 0)
const COLOR_VERDE: ColorMagik = [0, 0.2993, 0];
const CSS_VERDE = `rgb(0, ${Math.round(0.2993 * 255)}, 0)`;

// =============================================================================
// DATOS DE CONTENIDO
// Magik: etiqueta_celdas() — asigna_texto_celda(:tbl_contenido, fila, 1/2, ...)
// =============================================================================

const DATOS_CAPACIDAD: Array<{ codigo: string; descripcion: string }> = [
  { codigo: 'A', descripcion: '10 PS.'          },
  { codigo: 'B', descripcion: '20 PS.'          },
  { codigo: 'C', descripcion: '30 PS.'          },
  { codigo: 'D', descripcion: '50 PS.'          },
  { codigo: 'E', descripcion: '70 PS.'          },
  { codigo: 'F', descripcion: '100 PS.'         },
  { codigo: 'G', descripcion: '150 PS.'         },
  { codigo: 'H', descripcion: '200 PS.'         },
  { codigo: 'I', descripcion: '300 PS.'         },
  { codigo: 'J', descripcion: '600 PS.'         },
  { codigo: 'K', descripcion: '900 PS.'         },
  { codigo: 'L', descripcion: '1200 PS.'        },
  { codigo: 'M', descripcion: '1800 PS.'        },
  { codigo: 'N', descripcion: '2400 PS.'        },
  { codigo: 'T', descripcion: 'TRONCALES.'      },
  { codigo: 'V', descripcion: 'VIDEO.'          },
  { codigo: 'X', descripcion: 'CABLES COAXIALES'},
  { codigo: 'Z', descripcion: 'FIBRAS OPTICAS'  },
];

// =============================================================================
// TIPOS
// =============================================================================

type CellKey = `${number}-${number}`;

// =============================================================================
// CLASE — c_sello_capacidad_cable
// =============================================================================

export class SelloCapacidadCable extends CBaseSelloFibra {

  // CBaseSelloFibra guarda solo el último texto por tabla — aquí necesitamos por celda.
  private celdas: Map<string, Map<CellKey, CeldaTexto>> = new Map();

  // Override: almacenar texto por (tablaId, fila, col) en lugar de solo por tabla.
  protected override asignarTextoCelda(
    tablaId   : string,
    fila      : number,
    col       : number,
    texto     : string,
    tamanio   : number,
    alineacion: CeldaTexto['alineacion'],
    rotacion  : number,
    color     : ColorMagik,
  ): void {
    if (!this.celdas.has(tablaId)) this.celdas.set(tablaId, new Map());
    this.celdas.get(tablaId)!.set(`${fila}-${col}` as CellKey, { texto, tamanio, alineacion, rotacion, color });
  }

  getCelda(tablaId: string, fila: number, col: number): CeldaTexto | undefined {
    return this.celdas.get(tablaId)?.get(`${fila}-${col}` as CellKey);
  }

  // ---------------------------------------------------------------------------
  // configura_tabla()
  //
  // Magik:
  //   LoTblTitulo << property_list(:ren,{6,6}, :col,{44})
  //   LoTbl << .o_tablas.crea_tabla(2,1,:tbl_titulo)
  //   LoTbl.ocoordenada_origen << .o_coord_inicio
  //   _self.asigna_medidas_tabla(LoTbl, LoTblTitulo)
  //   [ocultar :borde_sup y :borde_der_izq de celda (1,1)]
  //
  //   LoTblContenido << property_list(:ren,{6×18}, :col,{7,37})
  //   LfDesplazaY << .o_tablas.longitud_total_renglones({:tbl_titulo})  → 12u
  //   LoTbl << .o_tablas.crea_tabla(18,2,:tbl_contenido)
  //   LoTbl.ocoordenada_origen << coordinate.new(x, y - LfDesplazaY)
  //   _self.asigna_medidas_tabla(LoTbl, LoTblContenido)
  // ---------------------------------------------------------------------------
  configurarTabla(): void {
    // tbl_titulo — 2 filas × 1 col, anclada en oCoordInicio
    const tblTitulo = this.crearTabla(2, 1, 'tbl_titulo');
    tblTitulo.origen = { ...this.oCoordInicio };
    this.asignarMedidasTabla(tblTitulo, { renglones: TITULO_H, columnas: TABLE_W });

    // LfDesplazaY = 12u (solo una llamada, sin bug)
    const desplazaY = this.longitudTotalRenglones(['tbl_titulo']);

    // tbl_contenido — justo debajo del título
    const tblContenido = this.crearTabla(18, 2, 'tbl_contenido');
    tblContenido.origen = {
      x: this.oCoordInicio.x,
      y: this.oCoordInicio.y + desplazaY, // Magik: y − desplazaY (Y-up) → SVG: y + (Y-down)
    };
    this.asignarMedidasTabla(tblContenido, { renglones: CONT_H, columnas: TABLE_W });
  }

  // ---------------------------------------------------------------------------
  // etiqueta_celdas()
  //
  // Magik:
  //   _self.asigna_texto_celda(:tbl_titulo,    1, 1, "CUADRO",                  27, :centre_centre, 0, {0,0.2993,0})
  //   _self.asigna_texto_celda(:tbl_titulo,    2, 1, "PARA CAPACIDAD DE CABLE", 27, :centre_centre, 0, {0,0.2993,0})
  //   _self.asigna_texto_celda(:tbl_contenido, 1..18, 1, codigo,                25, :centre_centre, 0, {0,0.2993,0})
  //   _self.asigna_texto_celda(:tbl_contenido, 1..18, 2, descripcion,           25, :centre_centre, 0, {0,0.2993,0})
  // ---------------------------------------------------------------------------
  etiquetarCeldas(): void {
    const v = COLOR_VERDE;

    this.asignarTextoCelda('tbl_titulo', 1, 1, 'CUADRO',                  27, 'centre_centre', 0, v);
    this.asignarTextoCelda('tbl_titulo', 2, 1, 'PARA CAPACIDAD DE CABLE', 27, 'centre_centre', 0, v);

    DATOS_CAPACIDAD.forEach(({ codigo, descripcion }, i) => {
      const fila = i + 1;
      this.asignarTextoCelda('tbl_contenido', fila, 1, codigo,      25, 'centre_centre', 0, v);
      this.asignarTextoCelda('tbl_contenido', fila, 2, descripcion, 25, 'centre_centre', 0, v);
    });
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello de capacidad de cable
// =============================================================================

const SCALE = 4; // SVG px por unidad Magik

export function SelloCapacidadCableUI() {
  const [oxStr, setOxStr] = useState('0');
  const [oyStr, setOyStr] = useState('0');

  const ox = Number(oxStr) || 0;
  const oy = Number(oyStr) || 0;

  const sello = new SelloCapacidadCable();
  sello.oCoordInicio = { x: ox, y: oy };
  sello.configurarTabla();
  sello.etiquetarCeldas();

  const tituloYpx   = oy * SCALE;
  const contenidoYpx = (oy + TITULO_H) * SCALE;
  const rowH         = CONT_ROWS[0] * SCALE;  // 24px por fila de contenido
  const colW         = CONT_COLS.map(w => w * SCALE); // [28, 148]
  const svgW         = TABLE_W * SCALE;
  const svgH         = (oy + TITULO_H + CONT_H) * SCALE + 4;

  // Acumula alturas de filas del título para posicionamiento Y
  const tituloAccY = TITULO_ROWS.reduce<number[]>((acc, _, i) =>
    [...acc, acc[i] + TITULO_ROWS[i] * SCALE], [tituloYpx],
  );

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_capacidad_cable</h3>
      <p style={s.meta}>
        Cuadro de capacidad de cable —{' '}
        tbl_titulo (<code>2×1, {TITULO_H}×{TABLE_W}u.</code>) +{' '}
        tbl_contenido (<code>18×2, {CONT_H}×{TABLE_W}u.</code>).
        Texto verde <code>&#123;0, 0.2993, 0&#125;</code>.
      </p>

      <div style={s.control}>
        <label style={s.lbl}>
          oCoordInicio.x:
          <input type="number" value={oxStr} onChange={e => setOxStr(e.target.value)} style={s.input} />
        </label>
        <label style={s.lbl}>
          oCoordInicio.y:
          <input type="number" value={oyStr} onChange={e => setOyStr(e.target.value)} style={s.input} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>

        {/* ── SVG del sello ── */}
        <div>
          <svg
            width={svgW + 4}
            height={svgH}
            style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}
          >
            {/* tbl_titulo — 2 filas × 1 col */}
            {TITULO_ROWS.map((rowHu, ri) => {
              const rowYpx = tituloAccY[ri];
              const rowHpx = rowHu * SCALE;
              const cell   = sello.getCelda('tbl_titulo', ri + 1, 1);
              // Celda [1,1]: sin borde superior ni laterales (Magik: oculta_bordes_celdas)
              const hideTop  = ri === 0;
              const hideSide = ri === 0;
              return (
                <g key={`tit-${ri}`}>
                  <rect x={0} y={rowYpx} width={svgW} height={rowHpx} fill="#f9fff9" stroke="none" />
                  {!hideTop  && <line x1={0} y1={rowYpx} x2={svgW} y2={rowYpx} stroke="#2E4057" strokeWidth={0.8} />}
                  {!hideSide && <line x1={0} y1={rowYpx} x2={0} y2={rowYpx + rowHpx} stroke="#2E4057" strokeWidth={0.8} />}
                  {!hideSide && <line x1={svgW} y1={rowYpx} x2={svgW} y2={rowYpx + rowHpx} stroke="#2E4057" strokeWidth={0.8} />}
                  <line x1={0} y1={rowYpx + rowHpx} x2={svgW} y2={rowYpx + rowHpx} stroke="#2E4057" strokeWidth={0.8} />
                  {cell && (
                    <text
                      x={svgW / 2} y={rowYpx + rowHpx / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(7, rowHpx * 0.55)}
                      fontWeight="bold" fill={CSS_VERDE} fontFamily="sans-serif" letterSpacing={1}
                    >
                      {cell.texto}
                    </text>
                  )}
                </g>
              );
            })}

            {/* tbl_contenido — 18 filas × 2 cols */}
            {DATOS_CAPACIDAD.map((_d, ri) => {
              const rowYpx = contenidoYpx + ri * rowH;
              const bg     = ri % 2 === 0 ? '#f9fff9' : '#fff';
              const c1     = sello.getCelda('tbl_contenido', ri + 1, 1);
              const c2     = sello.getCelda('tbl_contenido', ri + 1, 2);
              return (
                <g key={`cont-${ri}`}>
                  {/* Col 1 — código letra */}
                  <rect x={0}        y={rowYpx} width={colW[0]} height={rowH} fill={bg} stroke="#2E4057" strokeWidth={0.5} />
                  {c1 && (
                    <text
                      x={colW[0] / 2} y={rowYpx + rowH / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(6, rowH * 0.5)}
                      fontWeight="bold" fill={CSS_VERDE} fontFamily="sans-serif"
                    >
                      {c1.texto}
                    </text>
                  )}
                  {/* Col 2 — descripción capacidad */}
                  <rect x={colW[0]} y={rowYpx} width={colW[1]} height={rowH} fill={bg} stroke="#2E4057" strokeWidth={0.5} />
                  {c2 && (
                    <text
                      x={colW[0] + colW[1] / 2} y={rowYpx + rowH / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(6, rowH * 0.5)}
                      fill={CSS_VERDE} fontFamily="sans-serif"
                    >
                      {c2.texto}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG: {svgW}×{svgH}px · escala {SCALE}px/u
          </small>
        </div>

        {/* ── Tablas de propiedades ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <table style={s.table}>
            <thead>
              <tr>
                {['Tabla', 'Filas', 'Cols', 'Ancho', 'Alto', 'Origen X', 'Origen Y'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f9fff9' }}>
                <td style={s.td}><code>tbl_titulo</code></td>
                <td style={{ ...s.td, textAlign: 'center' }}>2</td>
                <td style={{ ...s.td, textAlign: 'center' }}>1</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{TABLE_W}u</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{TITULO_H}u</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{ox}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{oy}</td>
              </tr>
              <tr>
                <td style={s.td}><code>tbl_contenido</code></td>
                <td style={{ ...s.td, textAlign: 'center' }}>18</td>
                <td style={{ ...s.td, textAlign: 'center' }}>2</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{TABLE_W}u</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{CONT_H}u</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{ox}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{oy + TITULO_H}</td>
              </tr>
            </tbody>
          </table>

          <table style={s.table}>
            <thead>
              <tr>
                {['Código', 'Capacidad', 'Fuente Magik'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATOS_CAPACIDAD.map(({ codigo, descripcion }, i) => (
                <tr key={codigo} style={{ background: i % 2 === 0 ? '#f9fff9' : '#fff' }}>
                  <td style={{ ...s.td, fontWeight: 'bold', color: CSS_VERDE, textAlign: 'center' }}>{codigo}</td>
                  <td style={{ ...s.td, color: CSS_VERDE }}>{descripcion}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10, color: '#888' }}>
                    {`asigna_texto_celda(:tbl_contenido, ${i + 1}, 1/2)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Color Magik <code>&#123;0, 0.2993, 0&#125;</code> →{' '}
        <span style={{ background: CSS_VERDE, color: '#fff', padding: '1px 6px', borderRadius: 2, fontFamily: 'monospace', fontSize: 11 }}>
          {CSS_VERDE}
        </span>.{' '}
        Bordes ocultos tbl_titulo [1,1]: <code>:borde_sup</code> + <code>:borde_der_izq</code>.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl    : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  input  : { width: 60, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  table  : { borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloCapacidadCableUI;
