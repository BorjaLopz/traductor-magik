// ================================================================================
//  MIGRACIÓN: c_cfg_bloque_titdet_editable_mixin.magik → CCfgBloqueTitdetEditableMixin.tsx
//  Mixin origen : c_cfg_bloque_titdet_editable_mixin (def_mixin)
//  Autor orig.  : des_david — 22/07/2026, 22/07/2027
// ================================================================================
//
//  Mixin de configuración de bordes para tablas del motor de plotting Smallworld.
//  Aplica patrones de bordes sobre dos tipos de tabla:
//
//    · cfg_tbl_titulo(pTbl)   — Tabla 3×5 título, contorno "a modo" (esquinas
//                                vacías arriba+abajo, celda central (3,3) abierta)
//    · cfg_tbl_detalle(pTbl)  — Tabla N×N detalle: marco rectangular sobre cols
//                                {3,4,5,6} + líneas horizontales internas en col 5
//                                (celdas editables del bloque título/detalle)
//
//  Operaciones primitivas:
//    · activa_borde_celda(ren, col, :lado) << bool  →  4 bordes por celda
//
//  Sin geometría espacial — pura manipulación de matriz lógica de bordes.
//  Render visual SVG en la UI demo.
//
// ================================================================================

import React, { useMemo, useState } from 'react';

// ─── Tipos: bordes de celda ──────────────────────────────────────────────────

// Magik: :superior :inferior :izquierda :derecha
export type BorderSide = 'superior' | 'inferior' | 'izquierda' | 'derecha';

export interface CellBorders {
  superior:  boolean;
  inferior:  boolean;
  izquierda: boolean;
  derecha:   boolean;
}

const ALL_ON: CellBorders = { superior: true, inferior: true, izquierda: true, derecha: true };

// ─── Tabla — equivalente a pTbl (objeto tabla del motor de plotting) ─────────

export class TablaBordes {
  readonly total_renglones: number;
  readonly total_columnas:  number;
  // grid: matriz [ren-1][col-1] → CellBorders (1-based en API, 0-based interno)
  private grid: CellBorders[][];

  constructor(total_renglones: number, total_columnas: number) {
    this.total_renglones = total_renglones;
    this.total_columnas  = total_columnas;
    this.grid = Array.from({ length: total_renglones }, () =>
      Array.from({ length: total_columnas }, () => ({ ...ALL_ON }))
    );
  }

  // Magik: pTbl.activa_borde_celda(ren, col, :lado) << val
  // Acceso 1-based como en Magik. Mutación in-place.
  activa_borde_celda(ren: number, col: number, lado: BorderSide, val: boolean): void {
    if (ren < 1 || ren > this.total_renglones) return;
    if (col < 1 || col > this.total_columnas)  return;
    this.grid[ren - 1][col - 1][lado] = val;
  }

  // Lectura — útil para render UI
  borde(ren: number, col: number, lado: BorderSide): boolean {
    return this.grid[ren - 1]?.[col - 1]?.[lado] ?? false;
  }

  // Clon profundo (para snapshots before/after sin mutar el original)
  clone(): TablaBordes {
    const t = new TablaBordes(this.total_renglones, this.total_columnas);
    t.grid  = this.grid.map(row => row.map(c => ({ ...c })));
    return t;
  }
}

// ─── Mixin como funciones puras ───────────────────────────────────────────────
//
//  Magik def_mixin se compone en otras clases. En TS lo expresamos como un
//  objeto-namespace de funciones puras que reciben pTbl. Se puede mezclar a
//  cualquier clase mediante composición sin necesidad de herencia múltiple.
//
//  Cada método del .magik se preserva 1:1 con nombre snake_case Magik para
//  trazabilidad directa con el código original.
//
// =============================================================================

export const CCfgBloqueTitdetEditableMixin = {

  // ── cfg_tbl_titulo(pTbl) ───────────────────────────────────────────────
  //   totCols << pTbl.total_columnas
  //   cols    << {1, 2, totCols-1, totCols}
  //   _self.apaga_bordes_inf_sup_de_todos_rens_en_cols(tbl, cols)
  //   _self.apaga_bordes_a_modo_en_contorno_sup(tbl)
  //   _self.apaga_bordes_a_modo_en_contorno_inf(tbl)
  cfg_tbl_titulo(pTbl: TablaBordes): void {
    const totCols = pTbl.total_columnas;
    const cols    = [1, 2, totCols - 1, totCols];
    this.apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols);
    this.apaga_bordes_a_modo_en_contorno_sup(pTbl);
    this.apaga_bordes_a_modo_en_contorno_inf(pTbl);
  },

  // ── cfg_tbl_detalle(pTbl) ──────────────────────────────────────────────
  //   totCols << pTbl.total_columnas
  //   cols << {1, 2, totCols-1, totCols}
  //   _self.apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols)
  //   cols << {3, 4, 5, 6}
  //   _self.apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, cols)
  //   _self.prende_bordes_de_detalle(pTbl, cols)
  //   cols << {5}
  //   _self.prende_lineas_de_celdas_editables(pTbl, cols)
  cfg_tbl_detalle(pTbl: TablaBordes): void {
    const totCols = pTbl.total_columnas;
    let cols: number[] = [1, 2, totCols - 1, totCols];
    this.apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols);

    cols = [3, 4, 5, 6];
    this.apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, cols);
    this.prende_bordes_de_detalle(pTbl, cols);

    cols = [5];
    this.prende_lineas_de_celdas_editables(pTbl, cols);
  },

  // ── apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, pCols) ───────────
  //   totRens << pTbl.total_renglones
  //   _for ren _over range(1, totRens) _loop
  //     _for col _over pCols.fast_elements() _loop
  //       pTbl.activa_borde_celda(ren, col, :superior) << _false
  //       pTbl.activa_borde_celda(ren, col, :inferior) << _false
  //     _endloop
  //   _endloop
  apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl: TablaBordes, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        pTbl.activa_borde_celda(ren, col, 'superior', false);
        pTbl.activa_borde_celda(ren, col, 'inferior', false);
      }
    }
  },

  // ── apaga_bordes_a_modo_en_contorno_sup(pTbl) ─────────────────────────
  //   ren << 1; col << 1; pTbl.activa_borde_celda(ren,col,:superior) << _false
  //   ren << 1; col << 2; ...:superior _false; ...:derecha _false
  //   ren << 1; col << 3; ...:superior _false
  //   ren << 1; col << 4; ...:superior _false; ...:izquierda _false
  //   ren << 1; col << 5; ...:superior _false
  //
  // Esquina superior "a modo": cubierta abierta en el primer renglón con
  // pseudo-hendiduras laterales en las celdas (1,2) y (1,4).
  apaga_bordes_a_modo_en_contorno_sup(pTbl: TablaBordes): void {
    pTbl.activa_borde_celda(1, 1, 'superior', false);
    pTbl.activa_borde_celda(1, 2, 'superior', false);
    pTbl.activa_borde_celda(1, 2, 'derecha',  false);
    pTbl.activa_borde_celda(1, 3, 'superior', false);
    pTbl.activa_borde_celda(1, 4, 'superior', false);
    pTbl.activa_borde_celda(1, 4, 'izquierda', false);
    pTbl.activa_borde_celda(1, 5, 'superior', false);
  },

  // ── apaga_bordes_a_modo_en_contorno_inf(pTbl) ─────────────────────────
  //   ren << 3; col << 3
  //   pTbl.activa_borde_celda(ren,col,:inferior)  << _false
  //   pTbl.activa_borde_celda(ren,col,:izquierda) << _false
  //   pTbl.activa_borde_celda(ren,col,:derecha)   << _false
  //
  // Celda (3,3) — abre el centro inferior (queda solo el borde superior).
  apaga_bordes_a_modo_en_contorno_inf(pTbl: TablaBordes): void {
    pTbl.activa_borde_celda(3, 3, 'inferior',  false);
    pTbl.activa_borde_celda(3, 3, 'izquierda', false);
    pTbl.activa_borde_celda(3, 3, 'derecha',   false);
  },

  // ── apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, pCols) ─────────
  //   totRens << pTbl.total_renglones
  //   _for ren _over range(1, totRens) _loop
  //     _for col _over pCols.fast_elements() _loop
  //       :superior _false; :inferior _false; :derecha _false; :izquierda _false
  //     _endloop
  //   _endloop
  apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl: TablaBordes, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    const sides: BorderSide[] = ['superior', 'inferior', 'izquierda', 'derecha'];
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        for (const lado of sides) {
          pTbl.activa_borde_celda(ren, col, lado, false);
        }
      }
    }
  },

  // ── prende_bordes_de_detalle(pTbl, pCols) ─────────────────────────────
  //   totRens << pTbl.total_renglones
  //   ren << 1; renUlt << totRens
  //   _for col _over pCols.fast_elements() _loop
  //     pTbl.activa_borde_celda(ren,    col, :superior) << _true
  //     pTbl.activa_borde_celda(renUlt, col, :inferior) << _true
  //   _endloop
  //   colIzq << pCols[1];  colDer << pCols[pCols.size]
  //   _for ren _over range(1, totRens) _loop
  //     pTbl.activa_borde_celda(ren, colIzq, :izquierda) << _true
  //     pTbl.activa_borde_celda(ren, colDer, :derecha)   << _true
  //   _endloop
  //
  // Dibuja rectángulo perimetral sobre el grupo pCols: superior en fila 1,
  // inferior en fila renUlt, izquierdo en pCols[0], derecho en último pCols.
  // Magik usa 1-indexing → pCols[1]=primer elem; pCols[pCols.size]=último.
  // TS 0-indexed → pCols[0] / pCols[pCols.length-1].
  prende_bordes_de_detalle(pTbl: TablaBordes, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    const ren     = 1;
    const renUlt  = totRens;
    for (const col of pCols) {
      pTbl.activa_borde_celda(ren,    col, 'superior', true);
      pTbl.activa_borde_celda(renUlt, col, 'inferior', true);
    }
    const colIzq = pCols[0];
    const colDer = pCols[pCols.length - 1];
    for (let r = 1; r <= totRens; r++) {
      pTbl.activa_borde_celda(r, colIzq, 'izquierda', true);
      pTbl.activa_borde_celda(r, colDer, 'derecha',   true);
    }
  },

  // ── prende_lineas_de_celdas_editables(pTbl, pCols) ────────────────────
  //   totRens << pTbl.total_renglones
  //   _for ren _over range(2, totRens-1) _loop
  //     _for col _over pCols.fast_elements() _loop
  //       pTbl.activa_borde_celda(ren, col, :inferior) << _true
  //     _endloop
  //   _endloop
  //
  // Líneas horizontales entre celdas internas (filas 2..N-1) sobre las
  // columnas marcadas como editables ({5} en cfg_tbl_detalle).
  prende_lineas_de_celdas_editables(pTbl: TablaBordes, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    for (let ren = 2; ren <= totRens - 1; ren++) {
      for (const col of pCols) {
        pTbl.activa_borde_celda(ren, col, 'inferior', true);
      }
    }
  },
};

// ================================================================================
//  UI demo — render SVG de la tabla con bordes interactivos
// ================================================================================

const s = {
  wrap:  { fontFamily: 'monospace', fontSize: 13, padding: 16,
           background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  box:   { background: '#313244', padding: '10px 14px', borderRadius: 6,
           marginBottom: 12 } as React.CSSProperties,
  label: { color: '#a6e3a1', fontWeight: 700, marginBottom: 6,
           display: 'block', fontSize: 12 } as React.CSSProperties,
  row:   { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8,
           alignItems: 'center' },
  btn:   { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
           background: '#89b4fa', color: '#1e1e2e',
           fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  btnAlt: { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
            background: '#f9e2af', color: '#1e1e2e',
            fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  btnGhost: { padding: '5px 12px', borderRadius: 4, border: '1px solid #45475a',
              cursor: 'pointer', background: 'transparent', color: '#cdd6f4',
              fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  input: { background: '#45475a', color: '#cdd6f4', border: 'none', borderRadius: 4,
           padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
           width: 70 } as React.CSSProperties,
  code:  { background: '#181825', padding: '8px 12px', borderRadius: 4,
           fontSize: 11, color: '#cba6f7', display: 'block',
           marginBottom: 4, whiteSpace: 'pre-wrap' as const },
};

// Render SVG de la tabla mostrando los 4 bordes de cada celda
function TablaSVG({ tabla, cellSize = 48 }: { tabla: TablaBordes; cellSize?: number }) {
  const w = tabla.total_columnas * cellSize;
  const h = tabla.total_renglones * cellSize;
  const lines: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  for (let ren = 1; ren <= tabla.total_renglones; ren++) {
    for (let col = 1; col <= tabla.total_columnas; col++) {
      const x0 = (col - 1) * cellSize, y0 = (ren - 1) * cellSize;
      const x1 = col * cellSize,       y1 = ren * cellSize;
      const draw = (lado: BorderSide, x1p: number, y1p: number, x2p: number, y2p: number) => {
        if (tabla.borde(ren, col, lado)) {
          lines.push(<line key={`${ren}-${col}-${lado}`}
            x1={x1p} y1={y1p} x2={x2p} y2={y2p}
            stroke="#cdd6f4" strokeWidth={2} />);
        }
      };
      draw('superior',  x0, y0, x1, y0);
      draw('inferior',  x0, y1, x1, y1);
      draw('izquierda', x0, y0, x0, y1);
      draw('derecha',   x1, y0, x1, y1);

      labels.push(<text key={`lbl-${ren}-${col}`}
        x={x0 + cellSize / 2} y={y0 + cellSize / 2 + 4}
        textAnchor="middle" fontSize={10} fill="#6c7086">
        {ren},{col}
      </text>);
    }
  }

  return (
    <svg width={w + 2} height={h + 2}
      style={{ background: '#181825', borderRadius: 4 }}>
      <g transform="translate(1,1)">{labels}{lines}</g>
    </svg>
  );
}

type Modo = 'titulo' | 'detalle';

export function CCfgBloqueTitdetEditableMixinUI() {
  const [rens, setRens] = useState(3);   // 3 filas por defecto (cfg_tbl_titulo usa (3,3))
  const [cols, setCols] = useState(5);   // 5 cols por defecto (cfg_tbl_titulo usa cols 1..5)
  const [modo, setModo] = useState<Modo>('titulo');
  const [tick, setTick] = useState(0);
  const [log, setLog]   = useState<string[]>([]);

  // Tablas pre/post para visualizar antes y después
  const tablas = useMemo(() => {
    const before = new TablaBordes(rens, cols);
    const after  = before.clone();
    if (modo === 'titulo')  CCfgBloqueTitdetEditableMixin.cfg_tbl_titulo(after);
    if (modo === 'detalle') CCfgBloqueTitdetEditableMixin.cfg_tbl_detalle(after);
    return { before, after };
  }, [rens, cols, modo, tick]);

  const pushLog = (m: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${m}`, ...prev].slice(0, 10));

  const handleApplyTitulo = () => {
    setModo('titulo');
    setTick(t => t + 1);
    pushLog(`cfg_tbl_titulo(pTbl) — tabla ${rens}×${cols}`);
  };

  const handleApplyDetalle = () => {
    setModo('detalle');
    setTick(t => t + 1);
    pushLog(`cfg_tbl_detalle(pTbl) — tabla ${rens}×${cols}`);
  };

  return (
    <div style={s.wrap}>

      {/* ── Dimensiones de tabla ── */}
      <div style={s.box}>
        <span style={s.label}>pTbl — dimensiones de la tabla</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            total_renglones:{' '}
            <input type="number" min={3} max={8} value={rens}
              onChange={e => setRens(Number(e.target.value))} style={s.input} />
          </label>
          <label style={{ fontSize: 12 }}>
            total_columnas:{' '}
            <input type="number" min={5} max={10} value={cols}
              onChange={e => setCols(Number(e.target.value))} style={s.input} />
          </label>
          <span style={{ fontSize: 11, color: '#6c7086' }}>
            (titulo asume 3 filas y 5 cols; detalle usa cols 3-6)
          </span>
        </div>
      </div>

      {/* ── Aplicar configuración ── */}
      <div style={s.box}>
        <span style={s.label}>aplicar configuración del mixin</span>
        <div style={s.row}>
          <button style={s.btn} onClick={handleApplyTitulo}>cfg_tbl_titulo</button>
          <button style={s.btnAlt} onClick={handleApplyDetalle}>cfg_tbl_detalle</button>
          <button style={s.btnGhost} onClick={() => { setModo('titulo'); setRens(3); setCols(5); setTick(0); }}>
            reset
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#6c7086' }}>
          modo activo: <span style={{ color: '#cba6f7' }}>{modo}</span>
        </div>
      </div>

      {/* ── Visualización before/after ── */}
      <div style={s.box}>
        <span style={s.label}>before / after — SVG render de bordes</span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6c7086', marginBottom: 4 }}>
              before (todos los bordes ON)
            </div>
            <TablaSVG tabla={tablas.before} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6c7086', marginBottom: 4 }}>
              after — <span style={{ color: '#a6e3a1' }}>cfg_tbl_{modo}(pTbl)</span>
            </div>
            <TablaSVG tabla={tablas.after} />
          </div>
        </div>
      </div>

      {/* ── Pseudocódigo ── */}
      <div style={s.box}>
        <span style={s.label}>flujo Magik aplicado</span>
        <code style={s.code}>
{modo === 'titulo'
? `cfg_tbl_titulo(pTbl):
  cols ← {1, 2, totCols-1, totCols}
  apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols)
  apaga_bordes_a_modo_en_contorno_sup(pTbl)
  apaga_bordes_a_modo_en_contorno_inf(pTbl)
`
: `cfg_tbl_detalle(pTbl):
  cols ← {1, 2, totCols-1, totCols}
  apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols)
  cols ← {3, 4, 5, 6}
  apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, cols)
  prende_bordes_de_detalle(pTbl, cols)
  cols ← {5}
  prende_lineas_de_celdas_editables(pTbl, cols)
`}
        </code>
      </div>

      {/* ── Log ── */}
      {log.length > 0 && (
        <div style={s.box}>
          <span style={s.label}>log</span>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a6adc8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
