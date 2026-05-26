// Source: adiciones_layout/source/Sellos/c_cfg_bloque_titdet_editable_mixin.magik
// Mixin que configura los bordes de celdas en las tablas de título y detalle
// de un bloque editable. Sin estado propio — puro comportamiento.
// def_mixin de Magik → función mixin de TypeScript.

export type Lado = 'superior' | 'inferior' | 'izquierda' | 'derecha';
export const LADOS: Lado[] = ['superior', 'inferior', 'izquierda', 'derecha'];

// ─── Interfaz de tabla ───────────────────────────────────────────────────────

export interface TablaBordes {
  readonly totalColumnas: number;
  readonly totalRenglones: number;
  setBordeCelda(ren: number, col: number, lado: Lado, activo: boolean): void;
  getBordeCelda(ren: number, col: number, lado: Lado): boolean;
}

// Implementación concreta utilizada en el showcase y en tests
export class TablaBordesImpl implements TablaBordes {
  readonly totalRenglones: number;
  readonly totalColumnas: number;
  private readonly _bordes = new Map<string, boolean>();

  constructor(totalRenglones: number, totalColumnas: number, valorInicial = true) {
    this.totalRenglones = totalRenglones;
    this.totalColumnas  = totalColumnas;
    this.reset(valorInicial);
  }

  setBordeCelda(ren: number, col: number, lado: Lado, activo: boolean): void {
    this._bordes.set(`${ren},${col},${lado}`, activo);
  }

  getBordeCelda(ren: number, col: number, lado: Lado): boolean {
    return this._bordes.get(`${ren},${col},${lado}`) ?? false;
  }

  reset(valor = true): void {
    for (let r = 1; r <= this.totalRenglones; r++) {
      for (let c = 1; c <= this.totalColumnas; c++) {
        for (const lado of LADOS) {
          this._bordes.set(`${r},${c},${lado}`, valor);
        }
      }
    }
  }
}

// ─── Mixin factory (equivale a def_mixin de Magik) ───────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export function CCfgBloqueTitdetEditableMixin<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) { super(...args); }

    // Magik: cfg_tbl_titulo
    // Desactiva bordes sup/inf en columnas externas y aplica patrones de contorno.
    cfgTblTitulo(pTbl: TablaBordes): void {
      const totCols = pTbl.totalColumnas;
      const cols = [1, 2, totCols - 1, totCols];
      this.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols);
      this.apagaBordesAModoEnContornoSup(pTbl);
      this.apagaBordesAModoEnContornoInf(pTbl);
    }

    // Magik: cfg_tbl_detalle
    // Limpia interior, reconstruye bordes exteriores y activa líneas editables en col 5.
    cfgTblDetalle(pTbl: TablaBordes): void {
      const totCols = pTbl.totalColumnas;
      const colsExt = [1, 2, totCols - 1, totCols];
      this.apagaBordesInfSupDeTodosRensEnCols(pTbl, colsExt);
      const colsInt = [3, 4, 5, 6];
      this.apagaTodosLosBordesDeTodosRensEnCols(pTbl, colsInt);
      this.prendeBordesDeDetalle(pTbl, colsInt);
      this.prendeLineasDeCeldasEditables(pTbl, [5]);
    }

    // Magik: apaga_bordes_inf_sup_de_todos_rens_en_cols
    apagaBordesInfSupDeTodosRensEnCols(pTbl: TablaBordes, pCols: number[]): void {
      for (let ren = 1; ren <= pTbl.totalRenglones; ren++) {
        for (const col of pCols) {
          pTbl.setBordeCelda(ren, col, 'superior', false);
          pTbl.setBordeCelda(ren, col, 'inferior', false);
        }
      }
    }

    // Magik: apaga_bordes_a_modo_en_contorno_sup — patrón fijo en fila 1, cols 1-5
    apagaBordesAModoEnContornoSup(pTbl: TablaBordes): void {
      pTbl.setBordeCelda(1, 1, 'superior',  false);
      pTbl.setBordeCelda(1, 2, 'superior',  false);
      pTbl.setBordeCelda(1, 2, 'derecha',   false);
      pTbl.setBordeCelda(1, 3, 'superior',  false);
      pTbl.setBordeCelda(1, 4, 'superior',  false);
      pTbl.setBordeCelda(1, 4, 'izquierda', false);
      pTbl.setBordeCelda(1, 5, 'superior',  false);
    }

    // Magik: apaga_bordes_a_modo_en_contorno_inf — patrón fijo en fila 3, col 3
    apagaBordesAModoEnContornoInf(pTbl: TablaBordes): void {
      pTbl.setBordeCelda(3, 3, 'inferior',  false);
      pTbl.setBordeCelda(3, 3, 'izquierda', false);
      pTbl.setBordeCelda(3, 3, 'derecha',   false);
    }

    // Magik: apaga_todos_los_bordes_de_todos_rens_en_cols
    apagaTodosLosBordesDeTodosRensEnCols(pTbl: TablaBordes, pCols: number[]): void {
      for (let ren = 1; ren <= pTbl.totalRenglones; ren++) {
        for (const col of pCols) {
          for (const lado of LADOS) {
            pTbl.setBordeCelda(ren, col, lado, false);
          }
        }
      }
    }

    // Magik: prende_bordes_de_detalle — bordes exteriores del rectángulo de columnas
    // Fila 1 → superior, fila N → inferior, col izq → izquierda, col der → derecha
    prendeBordesDeDetalle(pTbl: TablaBordes, pCols: number[]): void {
      const totRens = pTbl.totalRenglones;
      const colIzq  = pCols[0];
      const colDer  = pCols[pCols.length - 1];
      for (const col of pCols) {
        pTbl.setBordeCelda(1,       col, 'superior', true);
        pTbl.setBordeCelda(totRens, col, 'inferior', true);
      }
      for (let ren = 1; ren <= totRens; ren++) {
        pTbl.setBordeCelda(ren, colIzq, 'izquierda', true);
        pTbl.setBordeCelda(ren, colDer, 'derecha',   true);
      }
    }

    // Magik: prende_lineas_de_celdas_editables
    // Activa borde inferior en filas interiores (2 .. totRens-1) de las cols dadas.
    prendeLineasDeCeldasEditables(pTbl: TablaBordes, pCols: number[]): void {
      const totRens = pTbl.totalRenglones;
      for (let ren = 2; ren <= totRens - 1; ren++) {
        for (const col of pCols) {
          pTbl.setBordeCelda(ren, col, 'inferior', true);
        }
      }
    }
  };
}

// ─── Clase concreta para uso standalone ──────────────────────────────────────

export class CCfgBloqueTitdetEditable extends CCfgBloqueTitdetEditableMixin(class {}) {}
