/**
 * Migracion de: c_tbl_cfg_mixin.magik
 * Mixin Magik:  c_tbl_cfg_mixin
 * Metodos:      cfg_tbl_titulo, cfg_tbl_detalle,
 *               apaga_bordes_inf_sup_de_todos_rens_en_cols,
 *               apaga_bordes_a_modo_en_contorno_sup,
 *               apaga_bordes_a_modo_en_contorno_inf,
 *               apaga_todos_los_bordes_de_todos_rens_en_cols,
 *               prende_bordes_de_detalle,
 *               prende_lineas_de_celdas_editables
 *
 * Intencion:
 *   Mixin de configuracion de bordes para tablas de plotting. No hace calculo
 *   espacial ni interactua con el mapa: opera sobre una tabla logica con
 *   renglones x columnas donde cada celda tiene 4 bordes (sup/inf/izq/der).
 *
 *   Dos preconfiguraciones:
 *     - cfg_tbl_titulo  -> apaga bordes inf/sup en cols extremas + contornos
 *     - cfg_tbl_detalle -> apaga extremos, prende contorno de detalle en
 *                          cols 3..6 y prende lineas inferiores en col 5
 *                          (celdas editables)
 *
 *   Migrado como clase TS estatica (mixin sin estado). Demo renderiza la
 *   tabla con bordes en HTML.
 */

import React, { useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type LadoBorde = 'superior' | 'inferior' | 'izquierda' | 'derecha';

export interface CeldaBordes {
  superior: boolean;
  inferior: boolean;
  izquierda: boolean;
  derecha: boolean;
}

// Magik: pTbl con orenglones / oColumnas y activa_borde_celda(ren, col, lado) << bool
export class Tabla {
  // Magik: indexacion 1-based -> mantenemos 1-based en la API publica
  orenglones: { totalElementos: number };
  oColumnas:  { totalElementos: number };
  private celdas: CeldaBordes[][];   // celdas[ren-1][col-1]

  constructor(totRens: number, totCols: number, allTrue = true) {
    this.orenglones = { totalElementos: totRens };
    this.oColumnas  = { totalElementos: totCols };
    this.celdas = Array.from({ length: totRens }, () =>
      Array.from({ length: totCols }, () => ({
        superior:  allTrue,
        inferior:  allTrue,
        izquierda: allTrue,
        derecha:   allTrue,
      })),
    );
  }

  // Magik: pTbl.activa_borde_celda(ren, col, lado) << valor
  activaBordeCelda(ren: number, col: number, lado: LadoBorde, valor: boolean): void {
    const fila = this.celdas[ren - 1];
    if (!fila) return;
    const celda = fila[col - 1];
    if (!celda) return;
    celda[lado] = valor;
  }

  // Lectura para el render
  getBordes(ren: number, col: number): CeldaBordes | null {
    return this.celdas[ren - 1]?.[col - 1] ?? null;
  }

  clone(): Tabla {
    const t = new Tabla(this.orenglones.totalElementos, this.oColumnas.totalElementos, false);
    for (let r = 1; r <= this.orenglones.totalElementos; r++) {
      for (let c = 1; c <= this.oColumnas.totalElementos; c++) {
        const src = this.getBordes(r, c)!;
        t.activaBordeCelda(r, c, 'superior',  src.superior);
        t.activaBordeCelda(r, c, 'inferior',  src.inferior);
        t.activaBordeCelda(r, c, 'izquierda', src.izquierda);
        t.activaBordeCelda(r, c, 'derecha',   src.derecha);
      }
    }
    return t;
  }
}

// Magik: range(1, N) inclusive
function rangeInclusive(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}

// =============================================================================
// MIXIN — c_tbl_cfg_mixin
// =============================================================================

export class TblCfgMixin {
  // -------------------------------------------------------------------------
  // Magik: cfg_tbl_titulo(pTbl)
  // -------------------------------------------------------------------------
  static async cfgTblTitulo(pTbl: Tabla): Promise<void> {
    const totCols = pTbl.oColumnas.totalElementos;
    const cols = [1, 2, totCols - 1, totCols];
    TblCfgMixin.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols);
    TblCfgMixin.apagaBordesAModoEnContornoSup(pTbl);
    TblCfgMixin.apagaBordesAModoEnContornoInf(pTbl);
  }

  // -------------------------------------------------------------------------
  // Magik: cfg_tbl_detalle(pTbl)
  // -------------------------------------------------------------------------
  static async cfgTblDetalle(pTbl: Tabla): Promise<void> {
    const totCols = pTbl.oColumnas.totalElementos;
    let cols = [1, 2, totCols - 1, totCols];
    TblCfgMixin.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols);

    cols = [3, 4, 5, 6];
    TblCfgMixin.apagaTodosLosBordesDeTodosRensEnCols(pTbl, cols);

    TblCfgMixin.prendeBordesDeDetalle(pTbl, cols);

    cols = [5];
    TblCfgMixin.prendeLineasDeCeldasEditables(pTbl, cols);
  }

  // -------------------------------------------------------------------------
  // Magik: apaga_bordes_inf_sup_de_todos_rens_en_cols(pTbl, pCols)
  // -------------------------------------------------------------------------
  static apagaBordesInfSupDeTodosRensEnCols(pTbl: Tabla, pCols: number[]): void {
    const totRens = pTbl.orenglones.totalElementos;
    for (const ren of rangeInclusive(1, totRens)) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'superior', false);
        pTbl.activaBordeCelda(ren, col, 'inferior', false);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Magik: apaga_bordes_a_modo_en_contorno_sup(pTbl)
  // -------------------------------------------------------------------------
  static apagaBordesAModoEnContornoSup(pTbl: Tabla): void {
    pTbl.activaBordeCelda(1, 1, 'superior',  false);
    pTbl.activaBordeCelda(1, 2, 'superior',  false);
    pTbl.activaBordeCelda(1, 2, 'derecha',   false);
    pTbl.activaBordeCelda(1, 3, 'superior',  false);
    pTbl.activaBordeCelda(1, 4, 'superior',  false);
    pTbl.activaBordeCelda(1, 4, 'izquierda', false);
    pTbl.activaBordeCelda(1, 5, 'superior',  false);
  }

  // -------------------------------------------------------------------------
  // Magik: apaga_bordes_a_modo_en_contorno_inf(pTbl)
  // -------------------------------------------------------------------------
  static apagaBordesAModoEnContornoInf(pTbl: Tabla): void {
    pTbl.activaBordeCelda(3, 3, 'inferior',  false);
    pTbl.activaBordeCelda(3, 3, 'izquierda', false);
    pTbl.activaBordeCelda(3, 3, 'derecha',   false);
  }

  // -------------------------------------------------------------------------
  // Magik: apaga_todos_los_bordes_de_todos_rens_en_cols(pTbl, pCols)
  // -------------------------------------------------------------------------
  static apagaTodosLosBordesDeTodosRensEnCols(pTbl: Tabla, pCols: number[]): void {
    const totRens = pTbl.orenglones.totalElementos;
    for (const ren of rangeInclusive(1, totRens)) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'superior',  false);
        pTbl.activaBordeCelda(ren, col, 'inferior',  false);
        pTbl.activaBordeCelda(ren, col, 'derecha',   false);
        pTbl.activaBordeCelda(ren, col, 'izquierda', false);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Magik: prende_bordes_de_detalle(pTbl, pCols)
  // Prende borde superior en ren=1, inferior en ultimo ren, izquierdo en
  // primera col y derecho en ultima col del rango.
  // -------------------------------------------------------------------------
  static prendeBordesDeDetalle(pTbl: Tabla, pCols: number[]): void {
    const totRens = pTbl.orenglones.totalElementos;
    const ren = 1;
    const renUlt = totRens;

    for (const col of pCols) {
      pTbl.activaBordeCelda(ren,    col, 'superior', true);
      pTbl.activaBordeCelda(renUlt, col, 'inferior', true);
    }

    // Magik: pCols[1] / pCols[pCols.size] — 1-based
    const colIzq = pCols[0];
    const colDer = pCols[pCols.length - 1];

    for (const r of rangeInclusive(1, totRens)) {
      pTbl.activaBordeCelda(r, colIzq, 'izquierda', true);
      pTbl.activaBordeCelda(r, colDer, 'derecha',   true);
    }
  }

  // -------------------------------------------------------------------------
  // Magik: prende_lineas_de_celdas_editables(pTbl, pCols)
  // Prende borde inferior en filas 2..totRens-1 (interiores).
  // -------------------------------------------------------------------------
  static prendeLineasDeCeldasEditables(pTbl: Tabla, pCols: number[]): void {
    const totRens = pTbl.orenglones.totalElementos;
    for (const ren of rangeInclusive(2, totRens - 1)) {
      for (const col of pCols) {
        pTbl.activaBordeCelda(ren, col, 'inferior', true);
      }
    }
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

type Modo = 'titulo' | 'detalle' | 'inicial';

const ROWS = 5;
const COLS = 8;

export function TblCfgMixinUI() {
  const [modo, setModo] = useState<Modo>('titulo');

  const tabla = useMemo(() => {
    const t = new Tabla(ROWS, COLS, true);
    if (modo === 'titulo')  TblCfgMixin.cfgTblTitulo(t);
    if (modo === 'detalle') TblCfgMixin.cfgTblDetalle(t);
    return t;
  }, [modo]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_tbl_cfg_mixin</div>

      <label style={s.label}>
        Configuracion
        <select value={modo} onChange={e => setModo(e.target.value as Modo)} style={s.input}>
          <option value="inicial">Inicial (todos los bordes)</option>
          <option value="titulo">cfg_tbl_titulo</option>
          <option value="detalle">cfg_tbl_detalle</option>
        </select>
      </label>

      <table style={s.tabla}>
        <tbody>
          {rangeInclusive(1, ROWS).map(r => (
            <tr key={r}>
              {rangeInclusive(1, COLS).map(c => {
                const b = tabla.getBordes(r, c)!;
                const celdaStyle: React.CSSProperties = {
                  width: 48,
                  height: 36,
                  background: r === 1 ? '#eef3fb' : (r === ROWS ? '#f7f7f7' : '#fff'),
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#555',
                  borderTop:    b.superior  ? '2px solid #222' : '2px solid transparent',
                  borderBottom: b.inferior  ? '2px solid #222' : '2px solid transparent',
                  borderLeft:   b.izquierda ? '2px solid #222' : '2px solid transparent',
                  borderRight:  b.derecha   ? '2px solid #222' : '2px solid transparent',
                };
                return <td key={c} style={celdaStyle}>{r},{c}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={s.meta}>
        Tabla {ROWS} renglones x {COLS} cols. Bordes activos en negro.
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  label  : { fontSize: 12, color: '#333', display: 'flex', gap: 6, alignItems: 'center' },
  input  : { padding: '4px 6px', fontSize: 12 },
  tabla  : { borderCollapse: 'separate', borderSpacing: 0, marginTop: 8 },
  meta   : { fontSize: 11, color: '#777' },
};

export default TblCfgMixinUI;
