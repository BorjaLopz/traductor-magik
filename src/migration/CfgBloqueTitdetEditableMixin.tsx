/**
 * Migración: c_cfg_bloque_titdet_editable_mixin.magik
 * des_david — 22/07/26 / 22/07/27
 * Clase Magik: c_cfg_bloque_titdet_editable_mixin  (def_mixin)
 *
 * Mixin de configuración de bordes de celdas para tablas del motor de planos
 * Smallworld. Gestiona la visibilidad de los 4 bordes de cada celda
 * (superior/inferior/izquierda/derecha) sobre dos tipos de tabla:
 *   · tbl_titulo  — tabla de cabecera con contorno "a modo" (esquinas vacías)
 *   · tbl_detalle — tabla de detalle con grupo de cols editables enmarcado
 *
 * Métodos migrados:
 *   cfg_tbl_titulo(pTbl)                              → cfgTblTitulo(pTbl)
 *   cfg_tbl_detalle(pTbl)                             → cfgTblDetalle(pTbl)
 *   apaga_bordes_inf_sup_de_todos_rens_en_cols(t,c)   → apagaBordesInfSupDeTodosRensEnCols(t,c)
 *   apaga_bordes_a_modo_en_contorno_sup(pTbl)         → apagaBordesAModoEnContornoSup(pTbl)
 *   apaga_bordes_a_modo_en_contorno_inf(pTbl)         → apagaBordesAModoEnContornoInf(pTbl)
 *   apaga_todos_los_bordes_de_todos_rens_en_cols(t,c) → apagaTodosLosBordesDeTodosRensEnCols(t,c)
 *   prende_bordes_de_detalle(pTbl, pCols)             → prendeBordesDeDetalle(pTbl, pCols)
 *   prende_lineas_de_celdas_editables(pTbl, pCols)    → prendeLineasDeCeldasEditables(pTbl, pCols)
 *
 * Equivalencias clave:
 *   def_mixin(:c_cfg_...)                         → class CfgBloqueTitdetEditableMixin
 *   pTbl.total_renglones / total_columnas         → pTbl.totalRows / totalCols
 *   pTbl.activa_borde_celda(r,c,:lado) << val     → pTbl.activaBordeCelda(r,c,lado,val)
 *   :superior/:inferior/:izquierda/:derecha        → 'superior'/'inferior'/'izquierda'/'derecha'
 *   {1, 2, totCols-1, totCols}  (vector Magik)    → number[]  (array JS)
 *   _for x _over pCols.fast_elements()            → for (const col of pCols)
 *   _for ren _over range(1, totRens)              → for (let ren=1; ren<=totRens; ren++)
 *   range(2, totRens-1)                           → for (let ren=2; ren<=totRens-1; ren++)
 *   pCols[1] (1-indexed Magik)                    → pCols[0] (0-indexed JS)
 *   pCols[pCols.size] (1-indexed Magik)           → pCols[pCols.length-1]
 */

import React, { useState, useMemo } from 'react';

// =============================================================================
// TIPOS — modelo de bordes de celda
// =============================================================================

/** Estado de los 4 bordes de una celda — Magik: :superior :inferior :izquierda :derecha */
export interface CellBorders {
  superior : boolean;
  inferior : boolean;
  izquierda: boolean;
  derecha  : boolean;
}

/** Identificador de un lado de borde */
export type BorderSide = keyof CellBorders;

type CellKey = `${number}-${number}`;

// =============================================================================
// TABLA — equivale a pTbl en Magik (objeto tabla del motor de planos)
// Mantiene el estado de bordes de todas sus celdas.
// =============================================================================

export class TableLayout {
  readonly totalRows: number;
  readonly totalCols: number;
  private cells: Map<CellKey, CellBorders>;

  /** allBordersOn=true → todos los bordes visibles (estado inicial) */
  constructor(rows: number, cols: number, allBordersOn = true) {
    this.totalRows = rows;
    this.totalCols = cols;
    this.cells = new Map();
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        this.cells.set(`${r}-${c}`, {
          superior : allBordersOn,
          inferior : allBordersOn,
          izquierda: allBordersOn,
          derecha  : allBordersOn,
        });
      }
    }
  }

  /** Magik: pTbl.activa_borde_celda(ren, col, :lado) << valor */
  activaBordeCelda(ren: number, col: number, lado: BorderSide, valor: boolean): void {
    const key: CellKey = `${ren}-${col}`;
    const cell = this.cells.get(key);
    if (cell) cell[lado] = valor;
  }

  /** Devuelve el estado de bordes de una celda */
  getBorderState(ren: number, col: number): CellBorders | undefined {
    return this.cells.get(`${ren}-${col}`);
  }

  /** Magik: pTbl.total_renglones */
  get total_renglones(): number { return this.totalRows; }
  /** Magik: pTbl.total_columnas */
  get total_columnas(): number { return this.totalCols; }

  /** Cuenta bordes activos — útil para comparación before/after */
  countActiveBorders(): number {
    let n = 0;
    this.cells.forEach(b => {
      if (b.superior)  n++;
      if (b.inferior)  n++;
      if (b.izquierda) n++;
      if (b.derecha)   n++;
    });
    return n;
  }
}

// =============================================================================
// CLASE PRINCIPAL — c_cfg_bloque_titdet_editable_mixin
// def_mixin(:c_cfg_bloque_titdet_editable_mixin)
// =============================================================================

export class CfgBloqueTitdetEditableMixin {

  // ---------------------------------------------------------------------------
  // cfg_tbl_titulo(pTbl)
  //
  // Magik:
  //   tbl << pTbl
  //   totCols << pTbl.total_columnas
  //   cols << {1, 2, totCols-1, totCols}
  //   _self.apaga_bordes_inf_sup_de_todos_rens_en_cols(tbl, cols)
  //   _self.apaga_bordes_a_modo_en_contorno_sup(tbl)
  //   _self.apaga_bordes_a_modo_en_contorno_inf(tbl)
  //
  // Configura la tabla de título: apaga los bordes sup/inf de las cols
  // externas y aplica el patrón "a modo" en los contornos superior e inferior.
  // ---------------------------------------------------------------------------
  cfgTblTitulo(pTbl: TableLayout): void {
    const totCols = pTbl.total_columnas;
    // Magik: cols << {1, 2, totCols-1, totCols} — cols del marco exterior
    const cols = [1, 2, totCols - 1, totCols];
    this.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols);
    this.apagaBordesAModoEnContornoSup(pTbl);
    this.apagaBordesAModoEnContornoInf(pTbl);
  }

  // ---------------------------------------------------------------------------
  // cfg_tbl_detalle(pTbl)
  //
  // Magik:
  //   totCols << pTbl.total_columnas
  //   cols << {1, 2, totCols-1, totCols}
  //   _self.apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, cols)
  //   cols << {3, 4, 5, 6}
  //   _self.apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, cols)
  //   _self.prende_bordes_de_detalle(pTbl, cols)
  //   cols << {5}
  //   _self.prende_lineas_de_celdas_editables(pTbl, cols)
  //
  // Configura la tabla de detalle:
  //   1) Cols externas (1,2,N-1,N): quita sup/inf
  //   2) Cols de detalle (3-6): borra todos los bordes, luego dibuja la caja
  //   3) Col editable (5): añade líneas horizontales internas
  // ---------------------------------------------------------------------------
  cfgTblDetalle(pTbl: TableLayout): void {
    const totCols = pTbl.total_columnas;
    // Cols externas — quitar bordes superior e inferior
    let cols = [1, 2, totCols - 1, totCols];
    this.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols);
    // Cols de detalle — borrar todo y re-dibujar caja exterior
    cols = [3, 4, 5, 6];
    this.apagaTodosLosBordesDeTodosRensEnCols(pTbl, cols);
    this.prendeBordesDeDetalle(pTbl, cols);
    // Col editable — añadir líneas horizontales en filas interiores
    cols = [5];
    this.prendeLineasDeCeldasEditables(pTbl, cols);
  }

  // ---------------------------------------------------------------------------
  // apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, pCols)
  //
  // Magik:
  //   totRens << pTbl.total_renglones
  //   _for ren _over range(1, totRens)
  //     _for col _over pCols.fast_elements()
  //       pTbl.activa_borde_celda(ren, col, :superior) << _false
  //       pTbl.activa_borde_celda(ren, col, :inferior) << _false
  // ---------------------------------------------------------------------------
  apagaBordesInfSupDeTodosRensEnCols(pTbl: TableLayout, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'superior', false);
        pTbl.activaBordeCelda(ren, col, 'inferior', false);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // apaga_bordes_a_modo_en_contorno_sup(pTbl)
  //
  // Magik (hardcoded fila 1, cols 1-5):
  //   (1,1): superior=false
  //   (1,2): superior=false, derecha=false
  //   (1,3): superior=false
  //   (1,4): superior=false, izquierda=false
  //   (1,5): superior=false
  //
  // Crea un patrón de apertura en la esquina superior — cols 2-4 forman un
  // "hueco" visual porque derecha de col-2 e izquierda de col-4 se apagan.
  // ---------------------------------------------------------------------------
  apagaBordesAModoEnContornoSup(pTbl: TableLayout): void {
    pTbl.activaBordeCelda(1, 1, 'superior', false);
    pTbl.activaBordeCelda(1, 2, 'superior', false);
    pTbl.activaBordeCelda(1, 2, 'derecha',  false);   // hueco izquierdo
    pTbl.activaBordeCelda(1, 3, 'superior', false);
    pTbl.activaBordeCelda(1, 4, 'superior', false);
    pTbl.activaBordeCelda(1, 4, 'izquierda', false);  // hueco derecho
    pTbl.activaBordeCelda(1, 5, 'superior', false);
  }

  // ---------------------------------------------------------------------------
  // apaga_bordes_a_modo_en_contorno_inf(pTbl)
  //
  // Magik (hardcoded fila 3, col 3):
  //   (3,3): inferior=false, izquierda=false, derecha=false
  //
  // Elimina los tres bordes de la celda central inferior, creando una apertura
  // en el contorno inferior de la tabla de título.
  // ---------------------------------------------------------------------------
  apagaBordesAModoEnContornoInf(pTbl: TableLayout): void {
    pTbl.activaBordeCelda(3, 3, 'inferior',  false);
    pTbl.activaBordeCelda(3, 3, 'izquierda', false);
    pTbl.activaBordeCelda(3, 3, 'derecha',   false);
  }

  // ---------------------------------------------------------------------------
  // apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, pCols)
  //
  // Magik:
  //   _for ren _over range(1, totRens)
  //     _for col _over pCols.fast_elements()
  //       activa_borde_celda(ren, col, :superior/:inferior/:derecha/:izquierda) << _false
  // ---------------------------------------------------------------------------
  apagaTodosLosBordesDeTodosRensEnCols(pTbl: TableLayout, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'superior',  false);
        pTbl.activaBordeCelda(ren, col, 'inferior',  false);
        pTbl.activaBordeCelda(ren, col, 'derecha',   false);
        pTbl.activaBordeCelda(ren, col, 'izquierda', false);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // prende_bordes_de_detalle(pTbl, pCols)
  //
  // Magik:
  //   ren=1 ; renUlt=totRens
  //   _for col _over pCols.fast_elements()
  //     activa_borde_celda(ren, col, :superior) << _true      ← borde superior grupo
  //     activa_borde_celda(renUlt, col, :inferior) << _true   ← borde inferior grupo
  //   colIzq << pCols[1]        (1-indexed Magik → JS: pCols[0])
  //   colDer << pCols[pCols.size] (1-indexed Magik → JS: pCols[pCols.length-1])
  //   _for ren _over range(1, totRens)
  //     activa_borde_celda(ren, colIzq, :izquierda) << _true  ← borde izq. grupo
  //     activa_borde_celda(ren, colDer, :derecha)   << _true  ← borde der. grupo
  //
  // Dibuja un rectángulo (caja) alrededor del grupo de columnas de detalle.
  // ---------------------------------------------------------------------------
  prendeBordesDeDetalle(pTbl: TableLayout, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    const renUlt  = totRens;

    // Borde superior (fila 1) e inferior (fila N) de todas las cols del grupo
    for (const col of pCols) {
      pTbl.activaBordeCelda(1,      col, 'superior', true);
      pTbl.activaBordeCelda(renUlt, col, 'inferior', true);
    }

    // Borde izquierdo y derecho del grupo — en todas las filas
    const colIzq = pCols[0];                 // Magik: pCols[1] (1-indexed)
    const colDer = pCols[pCols.length - 1];  // Magik: pCols[pCols.size]
    for (let ren = 1; ren <= totRens; ren++) {
      pTbl.activaBordeCelda(ren, colIzq, 'izquierda', true);
      pTbl.activaBordeCelda(ren, colDer, 'derecha',   true);
    }
  }

  // ---------------------------------------------------------------------------
  // prende_lineas_de_celdas_editables(pTbl, pCols)
  //
  // Magik:
  //   totRens << pTbl.total_renglones
  //   _for ren _over range(2, totRens-1)    ← excluye primera y última fila
  //     _for col _over pCols.fast_elements()
  //       activa_borde_celda(ren, col, :inferior) << _true
  //
  // Activa el borde inferior de las filas internas (2 a N-1) en pCols.
  // Estas líneas horizontales indican celdas donde el usuario puede escribir.
  // ---------------------------------------------------------------------------
  prendeLineasDeCeldasEditables(pTbl: TableLayout, pCols: number[]): void {
    const totRens = pTbl.total_renglones;
    // Magik: range(2, totRens-1) — filas interiores, sin primera ni última
    for (let ren = 2; ren <= totRens - 1; ren++) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'inferior', true);
      }
    }
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo del mixin
// Muestra el antes/después del patrón de bordes aplicado por cada método
// =============================================================================

// Número de columnas fijas por tipo de tabla
const COLS_TITULO  = 6;  // contornoSup/Inf son hardcoded para esta dimensión
const COLS_DETALLE = 8;  // cols externas {1,2,7,8} + grupo detalle {3,4,5,6}

type TipoTabla = 'titulo' | 'detalle';

export function CfgBloqueTitdetEditableMixinUI() {
  const [tipo    , setTipo    ] = useState<TipoTabla>('titulo');
  const [numRows , setNumRows ] = useState(3);

  const numCols = tipo === 'titulo' ? COLS_TITULO : COLS_DETALLE;
  // Para la tabla de titulo, la fila 3 está hardcodeada → fijamos en 3
  const rows    = tipo === 'titulo' ? 3 : numRows;

  // Before: tabla con todos los bordes activos
  const tblBefore = useMemo(
    () => new TableLayout(rows, numCols, true),
    [rows, numCols],
  );

  // After: tabla con los bordes configurados por el mixin
  const tblAfter = useMemo(() => {
    const tbl   = new TableLayout(rows, numCols, true);
    const mixin = new CfgBloqueTitdetEditableMixin();
    if (tipo === 'titulo') mixin.cfgTblTitulo(tbl);
    else                   mixin.cfgTblDetalle(tbl);
    return tbl;
  }, [tipo, rows, numCols]);

  const totalBefore = tblBefore.countActiveBorders();
  const totalAfter  = tblAfter.countActiveBorders();
  const apagados    = totalBefore - totalAfter;

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_cfg_bloque_titdet_editable_mixin</h3>
      <p style={st.meta}>
        Mixin de configuración de bordes para tablas del motor de planos.
        Antes/después de aplicar <code>cfg_tbl_titulo</code> /{' '}
        <code>cfg_tbl_detalle</code>. Bordes activos (solid) vs. inactivos (punteado).
      </p>

      {/* ── Controles ── */}
      <div style={st.control}>
        <span style={st.badge}>Tipo tabla</span>
        {(['titulo', 'detalle'] as TipoTabla[]).map(t => (
          <button
            key={t}
            onClick={() => { setTipo(t); if (t === 'titulo') setNumRows(3); }}
            style={{
              ...st.btn,
              background   : tipo === t ? '#1565c0' : '#fff',
              color        : tipo === t ? '#fff'    : '#1565c0',
              borderColor  : '#1565c0',
            }}
          >
            cfg_tbl_{t}
          </button>
        ))}
        {tipo === 'detalle' && (
          <label style={st.lbl}>
            Renglones:
            <input
              type="number" min={3} max={8} value={numRows}
              onChange={e => setNumRows(Math.max(3, Math.min(8, Number(e.target.value))))}
              style={st.numInput}
            />
            <span style={{ ...st.meta, marginLeft: 4 }}>(mín 3)</span>
          </label>
        )}
      </div>

      {/* ── Estadísticas de bordes ── */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:4 }}>
        <StatChip label="Bordes antes"   value={totalBefore} color="#455a64" />
        <StatChip label="Bordes después" value={totalAfter}  color="#2e7d32" />
        <StatChip label="Apagados"       value={apagados}    color="#c62828" />
        <StatChip label="Tabla"          value={`${rows}×${numCols}`} color="#6a1b9a" />
      </div>

      {/* ── Vistas before / after ── */}
      <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginTop:12 }}>
        <TableGridSVG grid={tblBefore} title="ANTES — todos los bordes activos"  accent="#c62828" />
        <TableGridSVG grid={tblAfter}  title={`DESPUÉS — cfg_tbl_${tipo}() aplicado`} accent="#1565c0" />
      </div>

      {/* ── Leyenda de zonas (solo para detalle) ── */}
      {tipo === 'detalle' && <DetalleZonasLegend numCols={numCols} />}

      {/* ── Secuencia de llamadas aplicadas ── */}
      <MethodCallTrace tipo={tipo} numCols={numCols} numRows={rows} />

      {/* ── Tabla de equivalencias ── */}
      <EquivalenciasTable />
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTES UI
// =============================================================================

// Chip de estadística
function StatChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
      <span style={{ color:'#555' }}>{label}:</span>
      <span style={{ fontWeight:'bold', color, fontFamily:'monospace', fontSize:13 }}>{value}</span>
    </div>
  );
}

// Leyenda de zonas de la tabla de detalle
function DetalleZonasLegend({ numCols }: { numCols: number }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8, fontSize:11 }}>
      <span style={{ background:'#e3f2fd', border:'1px solid #90caf9', padding:'2px 8px', borderRadius:3 }}>
        Cols 1,2,{numCols-1},{numCols} — marco exterior (sup/inf off)
      </span>
      <span style={{ background:'#f3e5f5', border:'1px solid #ce93d8', padding:'2px 8px', borderRadius:3 }}>
        Cols 3–6 — grupo detalle (caja, todos off → caja on)
      </span>
      <span style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', padding:'2px 8px', borderRadius:3 }}>
        Col 5 — editable (líneas horizontales internas on)
      </span>
    </div>
  );
}

// Traza de llamadas al mixin según el tipo de tabla
function MethodCallTrace({ tipo, numCols, numRows }: { tipo: TipoTabla; numCols: number; numRows: number }) {
  const calls = tipo === 'titulo'
    ? [
        { method: 'cfgTblTitulo(tbl)', desc: `Orquestador — cols externas {1,2,${numCols-1},${numCols}}` },
        { method: `apagaBordesInfSupDeTodosRensEnCols(tbl, [1,2,${numCols-1},${numCols}])`, desc: `${numRows} filas × 4 cols → sup/inf=false` },
        { method: 'apagaBordesAModoEnContornoSup(tbl)',  desc: 'Fila 1 cols 1-5: sup=false; col2.der=false; col4.izq=false' },
        { method: 'apagaBordesAModoEnContornoInf(tbl)',  desc: 'Fila 3 col 3: inf/izq/der=false' },
      ]
    : [
        { method: 'cfgTblDetalle(tbl)', desc: `Orquestador — cols externas {1,2,${numCols-1},${numCols}} + grupo {3,4,5,6}` },
        { method: `apagaBordesInfSupDeTodosRensEnCols(tbl, [1,2,${numCols-1},${numCols}])`, desc: `${numRows} filas × 4 cols → sup/inf=false` },
        { method: 'apagaTodosLosBordesDeTodosRensEnCols(tbl, [3,4,5,6])',  desc: `${numRows} filas × 4 cols → todos=false` },
        { method: 'prendeBordesDeDetalle(tbl, [3,4,5,6])',    desc: `Caja exterior: sup(f1)/inf(f${numRows})/izq(col3)/der(col6)=true` },
        { method: 'prendeLineasDeCeldasEditables(tbl, [5])',  desc: `Filas 2…${numRows-1} col5: inf=true` },
      ];

  return (
    <div style={{ marginTop:14 }}>
      <p style={{ ...st.meta, fontWeight:'bold', marginBottom:4 }}>Secuencia de llamadas:</p>
      <ol style={{ margin:0, paddingLeft:20 }}>
        {calls.map((c, i) => (
          <li key={i} style={{ fontSize:11, marginBottom:4 }}>
            <code style={{ fontSize:10, background:'#f0f4f8', padding:'1px 5px', borderRadius:2 }}>{c.method}</code>
            {' '}<span style={{ color:'#555' }}>→ {c.desc}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Tabla de equivalencias Magik ↔ TypeScript
function EquivalenciasTable() {
  const rows = [
    { m: 'def_mixin(:c_cfg_bloque_titdet_editable_mixin)',   t: 'class CfgBloqueTitdetEditableMixin',         n: 'Mixin → clase TS ordinaria' },
    { m: 'pTbl.total_renglones',                             t: 'pTbl.totalRows / total_renglones (getter)',  n: 'Número de filas' },
    { m: 'pTbl.total_columnas',                              t: 'pTbl.totalCols / total_columnas (getter)',   n: 'Número de columnas' },
    { m: 'activa_borde_celda(r,c,:superior) << _false',      t: "activaBordeCelda(r,c,'superior',false)",    n: 'Apagar borde top' },
    { m: 'activa_borde_celda(r,c,:inferior) << _true',       t: "activaBordeCelda(r,c,'inferior',true)",     n: 'Encender borde bottom' },
    { m: 'activa_borde_celda(r,c,:derecha)  << _false',      t: "activaBordeCelda(r,c,'derecha',false)",     n: 'Apagar borde right' },
    { m: 'activa_borde_celda(r,c,:izquierda)<< _false',      t: "activaBordeCelda(r,c,'izquierda',false)",   n: 'Apagar borde left' },
    { m: '{1, 2, totCols-1, totCols}',                       t: '[1, 2, totCols-1, totCols]',                n: 'Vector Magik → array JS' },
    { m: '_for x _over pCols.fast_elements()',               t: 'for (const col of pCols)',                  n: 'Iteración sobre colección' },
    { m: '_for ren _over range(1, totRens)',                  t: 'for (let ren=1; ren<=totRens; ren++)',      n: 'Rango inclusivo Magik → loop JS' },
    { m: 'range(2, totRens-1)',                              t: 'for (let ren=2; ren<=totRens-1; ren++)',    n: 'Filas interiores (excluye 1 y N)' },
    { m: 'pCols[1]  (1-indexed)',                            t: 'pCols[0]  (0-indexed)',                     n: 'Índice Magik empieza en 1' },
    { m: 'pCols[pCols.size]',                                t: 'pCols[pCols.length-1]',                     n: 'Último elemento' },
  ];
  return (
    <table style={{ ...st.table, marginTop:16 }}>
      <thead>
        <tr>{['Magik','TypeScript','Notas'].map(h=><th key={h} style={st.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(({ m, t, n }, i) => (
          <tr key={m} style={{ background: i%2===0?'#f8f9fa':'#fff' }}>
            <td style={{ ...st.td, fontFamily:'monospace', fontSize:10 }}><code>{m}</code></td>
            <td style={{ ...st.td, fontFamily:'monospace', fontSize:10 }}><code>{t}</code></td>
            <td style={{ ...st.td, color:'#555', fontSize:11 }}>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// SVG RENDERER — visualiza el estado de bordes de una TableLayout
// Bordes activos: línea sólida oscura. Inactivos: línea punteada gris.
// =============================================================================

const CELL_W = 48;
const CELL_H = 26;

function TableGridSVG({ grid, title, accent }: { grid: TableLayout; title: string; accent: string }) {
  const svgW = grid.totalCols * CELL_W + 2;
  const svgH = grid.totalRows * CELL_H + 2;

  // Separa líneas activas de inactivas para dibujar inactivas primero (debajo)
  const activeLines  : Array<[number,number,number,number]> = [];
  const inactiveLines: Array<[number,number,number,number]> = [];

  for (let ri = 0; ri < grid.totalRows; ri++) {
    for (let ci = 0; ci < grid.totalCols; ci++) {
      const ren = ri + 1;
      const col = ci + 1;
      const b   = grid.getBorderState(ren, col);
      if (!b) continue;

      const x0 = ci * CELL_W + 1;
      const y0 = ri * CELL_H + 1;
      const x1 = x0 + CELL_W;
      const y1 = y0 + CELL_H;

      const push = (active: boolean, lx1: number, ly1: number, lx2: number, ly2: number) =>
        (active ? activeLines : inactiveLines).push([lx1, ly1, lx2, ly2]);

      push(b.superior,  x0, y0, x1, y0);
      push(b.inferior,  x0, y1, x1, y1);
      push(b.izquierda, x0, y0, x0, y1);
      push(b.derecha,   x1, y0, x1, y1);
    }
  }

  return (
    <div>
      <p style={{ fontSize:10, color: accent, fontWeight:'bold', marginBottom:4 }}>{title}</p>
      <svg width={svgW} height={svgH}
        style={{ background:'#fafafa', border:`1.5px solid ${accent}`, borderRadius:3 }}>

        {/* Fondos de celda */}
        {Array.from({ length: grid.totalRows }, (_, ri) =>
          Array.from({ length: grid.totalCols }, (_, ci) => (
            <rect key={`bg-${ri}-${ci}`}
              x={ci*CELL_W+1} y={ri*CELL_H+1}
              width={CELL_W} height={CELL_H}
              fill="#fff" />
          ))
        )}

        {/* Etiquetas de celda r,c */}
        {Array.from({ length: grid.totalRows }, (_, ri) =>
          Array.from({ length: grid.totalCols }, (_, ci) => (
            <text key={`lbl-${ri}-${ci}`}
              x={ci*CELL_W+1+CELL_W/2}
              y={ri*CELL_H+1+CELL_H/2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={7} fill="#ccc" fontFamily="monospace">
              {ri+1},{ci+1}
            </text>
          ))
        )}

        {/* Bordes inactivos (punteados, debajo) */}
        {inactiveLines.map(([x1,y1,x2,y2], i) => (
          <line key={`off-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#ddd" strokeWidth={0.6} strokeDasharray="2,2" />
        ))}

        {/* Bordes activos (sólidos, encima) */}
        {activeLines.map(([x1,y1,x2,y2], i) => (
          <line key={`on-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#1a1a1a" strokeWidth={1.8} />
        ))}
      </svg>

      {/* Leyenda */}
      <div style={{ display:'flex', gap:10, marginTop:3, fontSize:9, color:'#888' }}>
        <span>─── activo</span>
        <span style={{ borderBottom:'1px dashed #bbb' }}>- - - inactivo</span>
      </div>
    </div>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame   : { display:'flex', flexDirection:'column', gap:10, fontFamily:'sans-serif', fontSize:13 },
  title   : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  meta    : { color:'#666', fontSize:12, margin:'2px 0' },
  control : { display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#f0f4f8', borderRadius:4, border:'1px solid #dde', flexWrap:'wrap' },
  lbl     : { fontSize:11, display:'flex', alignItems:'center', gap:4 },
  numInput: { padding:'2px 6px', fontSize:11, border:'1px solid #b0bec5', borderRadius:3, width:48 },
  btn     : { padding:'4px 12px', fontSize:11, borderRadius:3, cursor:'pointer', fontFamily:'monospace' },
  badge   : { fontSize:10, background:'#2E4057', color:'#fff', borderRadius:3, padding:'2px 7px', fontFamily:'monospace' },
  table   : { borderCollapse:'collapse' as const, width:'100%' },
  th      : { background:'#2E4057', color:'#fff', padding:'5px 10px', textAlign:'left' as const, fontSize:11 },
  td      : { padding:'5px 10px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default CfgBloqueTitdetEditableMixinUI;
