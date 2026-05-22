/**
 * Migración de: c_tabla_enc_georeferencia.magik
 * Clase Magik:  c_tabla_enc_georeferencia  —  GE Network Solutions / dvalenci / 2026-05-11
 * Hereda:       c_base_sello_fibra  →  CBaseSelloFibra (SimbologiaPlanoContruccionFo.tsx)
 *
 * Genera el bloque de encabezado de georeferencia del sello, compuesto por
 * tres tablas posicionadas de forma relativa:
 *
 *   tbl_status      (3×2, [5,5,5] × [25,25] mm)  — cabecera con estados de terminal
 *   tbl_terminal    (1×3, [8] × [8,6,11] mm)      — bajo tbl_status, lado izquierdo
 *   tbl_georeferencia (2×2, [3,5] × [11,14] mm)   — bajo tbl_status, lado derecho
 */

import React, { useState } from 'react';

import {
  CBaseSelloFibra,
  type TableConfig,
  type CellContent,
} from './SimbologiaPlanoContruccionFo';

// =============================================================================
// TIPOS EXTENDIDOS — layout espacial del sello
// =============================================================================

export type Coord2D = { x: number; y: number };

/**
 * Magik: lo_tabla.oCoordenada_Origen + lo_tabla.color_linea
 * Añade posición y color de línea a la configuración de tabla.
 */
export interface TableLayout {
  origen:     Coord2D;
  colorLinea: [number, number, number];  // RGB normalizado [0..1]
}

/**
 * Magik: lo_celda.bBorde_Der? << _false
 * Marca que una celda no debe dibujar borde derecho.
 */
export interface CellBorderConfig {
  noBorderRight?: boolean;
}

// =============================================================================
// CLASE BASE INTERMEDIA — agrega layout/coordenadas a c_base_sello_fibra
// Extiende CBaseSelloFibra con lo que c_tabla_enc_georeferencia necesita:
// coordenada de origen, desplazamientos relativos, color de línea y bordes.
// =============================================================================

export abstract class CBaseSelloFibraLayout extends CBaseSelloFibra {

  /** Magik: .o_coord_inicio — punto de origen del sello en el plano */
  protected oCoordInicio: Coord2D = { x: 0, y: 0 };

  /** Magik: lo_tabla.oCoordenada_Origen + lo_tabla.color_linea */
  protected tableLayouts = new Map<string, TableLayout>();

  /** Magik: lo_celda.bBorde_Der? << _false */
  protected cellBorders  = new Map<string, CellBorderConfig>();

  /** Registra origen y color de línea de una tabla. */
  protected setTableLayout(
    id:         string,
    origen:     Coord2D,
    colorLinea: [number, number, number],
  ): void {
    this.tableLayouts.set(id, { origen, colorLinea });
  }

  /** Magik: lo_celda.bBorde_Der? << _false */
  protected setCeldaNoBorderRight(tableId: string, row: number, col: number): void {
    this.cellBorders.set(`${tableId}:${row}:${col}`, { noBorderRight: true });
  }

  /**
   * Magik: .o_tablas.longitud_total_renglones({:tbl_status, ...})
   * Suma las alturas de todos los renglones de las tablas indicadas.
   */
  protected longitudTotalRenglones(tableIds: string[]): number {
    return tableIds.reduce((sum, id) => {
      const t = this.tables.get(id);
      return sum + (t ? t.rowHeights.reduce((a, b) => a + b, 0) : 0);
    }, 0);
  }

  /**
   * Magik: .o_tablas.longitud_total_columnas({:tbl_terminal, ...})
   * Suma los anchos de todas las columnas de las tablas indicadas.
   */
  protected longitudTotalColumnas(tableIds: string[]): number {
    return tableIds.reduce((sum, id) => {
      const t = this.tables.get(id);
      return sum + (t ? t.colWidths.reduce((a, b) => a + b, 0) : 0);
    }, 0);
  }

  /**
   * Punto de entrada con coordenada de origen.
   * Magik: no hay build() explícito — el caller invoca configura_tabla() directamente.
   * En TS se centraliza aquí para garantizar el orden configura → etiqueta.
   */
  buildLayout(origen: Coord2D): {
    tables:       Map<string, TableConfig>;
    tableLayouts: Map<string, TableLayout>;
    cells:        Map<string, CellContent>;
    cellBorders:  Map<string, CellBorderConfig>;
  } {
    this.oCoordInicio = origen;
    this.configuraTablal();   // crea tablas y registra layout
    this.etiquetaCeldas();    // asigna textos
    return {
      tables:       this.tables,
      tableLayouts: this.tableLayouts,
      cells:        this.cells,
      cellBorders:  this.cellBorders,
    };
  }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CTablaEncGeoreferencia extends CBaseSelloFibraLayout {

  /**
   * Magik: c_tabla_enc_georeferencia.configura_tabla()
   *
   * Crea 3 tablas con posicionamiento relativo entre sí:
   *
   *   tbl_status        → origen directo (.o_coord_inicio)
   *   tbl_terminal      → (x, y - despY)   despY = altura total de tbl_status
   *   tbl_georeferencia → (x + despX, y - despY)  despX = ancho total de tbl_terminal
   *
   * Nota: en el Magik configura_tabla() llama a etiqueta_celdas() al final.
   * En TS se separa la responsabilidad: buildLayout() los orquesta en orden.
   */
  configuraTablal(): void {
    const COLOR_VERDE: [number, number, number] = [0.2, 0.6, 0];   // rope.new_with(0.2,0.6,0)
    const orig = this.oCoordInicio;

    // ── tbl_status ──────────────────────────────────────────────────────────
    // pl_cfg_tbl_status[:ren] << {5,5,5}  [:col] << {25,25}
    // crea_tabla(3, 2, :tbl_status)  →  oCoordenada_Origen << .o_coord_inicio
    this.crearTabla(3, 2, 'tbl_status', [5, 5, 5], [25, 25]);
    this.setTableLayout('tbl_status', { ...orig }, COLOR_VERDE);
    // celda(1,1).bBorde_Der? << _false  → cabecera visualmente fusionada
    this.setCeldaNoBorderRight('tbl_status', 1, 1);

    // ── tbl_terminal ────────────────────────────────────────────────────────
    // pl_cfg_tbl_terminal[:ren] << {8}  [:col] << {8,6,11}
    // ln_desp_y << .o_tablas.longitud_total_renglones({:tbl_status})  = 15
    // oCoordenada_Origen << coordinate.new(x, y - ln_desp_y)
    this.crearTabla(1, 3, 'tbl_terminal', [8], [8, 6, 11]);
    const despY = this.longitudTotalRenglones(['tbl_status']);      // 5+5+5 = 15 mm
    this.setTableLayout('tbl_terminal',
      { x: orig.x, y: orig.y - despY },
      COLOR_VERDE,
    );

    // ── tbl_georeferencia ───────────────────────────────────────────────────
    // pl_cfg_tbl_georeferencia[:ren] << {3,5}  [:col] << {11,14}
    // ln_desp_x << .o_tablas.longitud_total_columnas({:tbl_terminal})  = 25
    // oCoordenada_Origen << coordinate.new(x + ln_desp_x, y - ln_desp_y)
    this.crearTabla(2, 2, 'tbl_georeferencia', [3, 5], [11, 14]);
    const despX = this.longitudTotalColumnas(['tbl_terminal']);     // 8+6+11 = 25 mm
    this.setTableLayout('tbl_georeferencia',
      { x: orig.x + despX, y: orig.y - despY },
      COLOR_VERDE,
    );
    // celda(1,1).bBorde_Der? << _false  → "GEOREFERENCIA" visualmente fusionada
    this.setCeldaNoBorderRight('tbl_georeferencia', 1, 1);
  }

  /**
   * Magik: c_tabla_enc_georeferencia.etiqueta_celdas()
   *
   * _unset en alignment/span → 'default' en TS (sin alineación explícita).
   * :centre_centre → texto centrado horizontal y verticalmente.
   * El parámetro numérico (25, 12) en asigna_texto_celda es el ancho de span
   * en unidades Magik — se omite en TS ya que el fusionado visual se logra
   * con setCeldaNoBorderRight() en configuraTablal().
   */
  etiquetaCeldas(): void {
    const C = 'centre_centre';

    // ── tbl_status ──────────────────────────────────────────────────────────
    // asigna_texto_celda(:tbl_status, 1, 1, "STATUS TERMINAL", 20, :centre_centre, 25, LoColor)
    this.asignarTextoEnCelda('tbl_status', 1, 1, 'STATUS TERMINAL', 20, C);
    // asigna_texto_celda(:tbl_status, 2, 1, "C=CONECTADA", 20, _unset, _unset, LoColor)
    this.asignarTextoEnCelda('tbl_status', 2, 1, 'C=CONECTADA',  20, 'default');
    this.asignarTextoEnCelda('tbl_status', 2, 2, 'A=AUMENTO',    20, 'default');
    this.asignarTextoEnCelda('tbl_status', 3, 1, 'S=SUSTITUIDA', 20, 'default');
    this.asignarTextoEnCelda('tbl_status', 3, 2, 'R=RESERVA',    20, 'default');

    // ── tbl_terminal ────────────────────────────────────────────────────────
    this.asignarTextoEnCelda('tbl_terminal', 1, 1, 'TERMINAL', 15, 'default');
    this.asignarTextoEnCelda('tbl_terminal', 1, 2, 'STATUS',   15, 'default');
    // lo_etiq_terminal_1_3 << "DIST. A CEDO" + %newline + "(Mts)"
    this.asignarTextoEnCelda('tbl_terminal', 1, 3, 'DIST. A CEDO\n(Mts)', 15, 'default');

    // ── tbl_georeferencia ───────────────────────────────────────────────────
    // asigna_texto_celda(:tbl_georeferencia, 1, 1, "GEOREFERENCIA", 18, :centre_centre, 12, LoColor)
    this.asignarTextoEnCelda('tbl_georeferencia', 1, 1, 'GEOREFERENCIA', 18, C);
    this.asignarTextoEnCelda('tbl_georeferencia', 2, 1, 'GEO', 18, 'default');
    this.asignarTextoEnCelda('tbl_georeferencia', 2, 2, 'UTM', 18, 'default');
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

/** RGB [0..1] → CSS string */
const rgb01 = ([r, g, b]: [number, number, number]) =>
  `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;

/** Orden de renderizado de las tablas */
const TABLE_ORDER = ['tbl_status', 'tbl_terminal', 'tbl_georeferencia'] as const;

export function TablaEncGeoreferenciaUI() {
  const [origin, setOrigin] = useState<Coord2D>({ x: 0, y: 0 });
  const [result, setResult] = useState<ReturnType<CTablaEncGeoreferencia['buildLayout']> | null>(null);

  const generar = () => {
    const inst = new CTablaEncGeoreferencia();
    setResult(inst.buildLayout({ ...origin }));
  };

  // 1mm → SCALE px para la vista esquemática
  const SCALE = 5;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_tabla_enc_georeferencia — Encabezado sello georeferencia</h3>

      {/* Controles */}
      <div style={s.controls}>
        <div style={s.inputRow}>
          <label style={s.lbl}>Origen X (mm)</label>
          <input style={s.inp} type="number" value={origin.x}
            onChange={e => { setOrigin(o => ({ ...o, x: +e.target.value })); setResult(null); }} />
        </div>
        <div style={s.inputRow}>
          <label style={s.lbl}>Origen Y (mm)</label>
          <input style={s.inp} type="number" value={origin.y}
            onChange={e => { setOrigin(o => ({ ...o, y: +e.target.value })); setResult(null); }} />
        </div>
        <button style={s.btn} onClick={generar}>Generar sello (buildLayout)</button>
      </div>

      {result && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>

          {/* Vista esquemática proporcional */}
          <div>
            <p style={s.subtitle}>Layout proporcional (1 mm = {SCALE} px)</p>
            <div style={{ position: 'relative',
              width:  50 * SCALE,
              height: 23 * SCALE,
              border: '1px solid #ccc',
              background: '#fafafa',
            }}>
              {TABLE_ORDER.map(tid => {
                const tbl    = result.tables.get(tid)!;
                const layout = result.tableLayouts.get(tid)!;
                const color  = rgb01(layout.colorLinea);
                const xPx = (layout.origen.x - origin.x) * SCALE;
                const yPx = (origin.y - layout.origen.y) * SCALE;   // GIS Y→screen Y
                let colX = 0;
                return (
                  <div key={tid} style={{
                    position: 'absolute', left: xPx, top: yPx,
                    display: 'inline-block',
                  }}>
                    {Array.from({ length: tbl.rows }, (_, ri) => {
                      colX = 0;
                      return (
                        <div key={ri} style={{ display: 'flex' }}>
                          {Array.from({ length: tbl.cols }, (_, ci) => {
                            const w  = tbl.colWidths[ci]  * SCALE;
                            const h  = tbl.rowHeights[ri] * SCALE;
                            const key = `${tid}:${ri+1}:${ci+1}`;
                            const cell    = result.cells.get(key);
                            const border  = result.cellBorders.get(key);
                            const isCenter = (cell as any)?.align === 'centre_centre';
                            return (
                              <div key={ci} style={{
                                width: w, height: h, boxSizing: 'border-box',
                                borderTop:    `1px solid ${color}`,
                                borderLeft:   `1px solid ${color}`,
                                borderBottom: `1px solid ${color}`,
                                borderRight:  border?.noBorderRight ? 'none' : `1px solid ${color}`,
                                display: 'flex', alignItems: 'center',
                                justifyContent: isCenter ? 'center' : 'flex-start',
                                overflow: 'hidden', padding: '0 1px',
                              }}>
                                <span style={{
                                  fontSize: Math.max(5, ((cell as any)?.fontSize ?? 10) * 0.3),
                                  color: '#1a3a1a', textAlign: isCenter ? 'center' : 'left',
                                  whiteSpace: 'pre-line', lineHeight: 1.2,
                                }}>
                                  {(cell as any)?.text ?? ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <p style={s.meta}>Total: 50 mm ancho × 23 mm alto</p>
          </div>

          {/* Tabla de configuración */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={s.subtitle}>Configuración de tablas</p>
            <table style={s.table}>
              <thead>
                <tr>{['id','rows×cols','rowHeights','colWidths','origen (mm)'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {TABLE_ORDER.map(tid => {
                  const tbl    = result.tables.get(tid)!;
                  const layout = result.tableLayouts.get(tid)!;
                  return (
                    <tr key={tid}>
                      <td style={s.td}><code>{tid}</code></td>
                      <td style={{ ...s.td, textAlign: 'center' as const }}>
                        {tbl.rows}×{tbl.cols}
                      </td>
                      <td style={s.td}><code>[{tbl.rowHeights.join(',')}]</code></td>
                      <td style={s.td}><code>[{tbl.colWidths.join(',')}]</code></td>
                      <td style={s.td}>
                        <code>({layout.origen.x}, {layout.origen.y})</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Contenido de celdas */}
            <p style={{ ...s.subtitle, marginTop: 12 }}>Contenido de celdas</p>
            <table style={s.table}>
              <thead>
                <tr>{['celda','texto','fs','align','borde'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {TABLE_ORDER.flatMap(tid => {
                  const tbl = result.tables.get(tid)!;
                  return Array.from({ length: tbl.rows }, (_, ri) =>
                    Array.from({ length: tbl.cols }, (_, ci) => {
                      const key    = `${tid}:${ri+1}:${ci+1}`;
                      const cell   = result.cells.get(key) as any;
                      const border = result.cellBorders.get(key);
                      if (!cell) return null;
                      return (
                        <tr key={key}>
                          <td style={s.td}><code style={{ fontSize: 9 }}>{key}</code></td>
                          <td style={{ ...s.td, fontSize: 10 }}>
                            {cell.text?.replace(/\n/g, '↵')}
                          </td>
                          <td style={{ ...s.td, textAlign: 'center' as const }}>{cell.fontSize}</td>
                          <td style={{ ...s.td, fontSize: 10 }}>
                            {cell.align === 'centre_centre' ? '⊕ c/c' : '—'}
                          </td>
                          <td style={{ ...s.td, fontSize: 10, color: border?.noBorderRight ? '#c00' : '#888' }}>
                            {border?.noBorderRight ? 'no-right' : '—'}
                          </td>
                        </tr>
                      );
                    })
                  ).filter(Boolean);
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:700, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  controls : { display:'flex', flexDirection:'column', gap:8 },
  inputRow : { display:'flex', alignItems:'center', gap:8 },
  lbl      : { minWidth:120, fontSize:11, color:'#555' },
  inp      : { width:80, padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  btn      : { alignSelf:'flex-start', padding:'6px 16px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta     : { margin:'4px 0 0', fontSize:10, color:'#888' },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'4px 6px', textAlign:'left' as const, fontSize:10 },
  td       : { padding:'3px 6px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default TablaEncGeoreferenciaUI;
