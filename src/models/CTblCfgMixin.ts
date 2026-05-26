export type LadoBorde = 'superior' | 'inferior' | 'derecha' | 'izquierda'

export interface ITablaBordes {
  activarBordeCelda(ren: number, col: number, lado: LadoBorde, valor: boolean): void
  readonly columnas: { readonly totalElementos: number }
  readonly renglones: { readonly totalElementos: number }
}

export class CTblCfgMixin {
  cfgTblTitulo(pTbl: ITablaBordes): void {
    const totCols = pTbl.columnas.totalElementos
    const cols = [1, 2, totCols - 1, totCols]
    this.apagaBordesInfSupDeTodosRensEnCols(pTbl, cols)
    this.apagaBordesAModoEnContornoSup(pTbl)
    this.apagaBordesAModoEnContornoInf(pTbl)
  }

  cfgTblDetalle(pTbl: ITablaBordes): void {
    const totCols = pTbl.columnas.totalElementos
    const outerCols = [1, 2, totCols - 1, totCols]
    this.apagaBordesInfSupDeTodosRensEnCols(pTbl, outerCols)
    const innerCols = [3, 4, 5, 6]
    this.apagaTodosLosBordesDeTodosRensEnCols(pTbl, innerCols)
    this.prendeBordesDeDetalle(pTbl, innerCols)
    this.prendeLineasDeCeldasEditables(pTbl, [5])
  }

  apagaBordesInfSupDeTodosRensEnCols(pTbl: ITablaBordes, pCols: number[]): void {
    const totRens = pTbl.renglones.totalElementos
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        pTbl.activarBordeCelda(ren, col, 'superior', false)
        pTbl.activarBordeCelda(ren, col, 'inferior', false)
      }
    }
  }

  apagaBordesAModoEnContornoSup(pTbl: ITablaBordes): void {
    pTbl.activarBordeCelda(1, 1, 'superior',  false)
    pTbl.activarBordeCelda(1, 2, 'superior',  false)
    pTbl.activarBordeCelda(1, 2, 'derecha',   false)
    pTbl.activarBordeCelda(1, 3, 'superior',  false)
    pTbl.activarBordeCelda(1, 4, 'superior',  false)
    pTbl.activarBordeCelda(1, 4, 'izquierda', false)
    pTbl.activarBordeCelda(1, 5, 'superior',  false)
  }

  apagaBordesAModoEnContornoInf(pTbl: ITablaBordes): void {
    pTbl.activarBordeCelda(3, 3, 'inferior',  false)
    pTbl.activarBordeCelda(3, 3, 'izquierda', false)
    pTbl.activarBordeCelda(3, 3, 'derecha',   false)
  }

  apagaTodosLosBordesDeTodosRensEnCols(pTbl: ITablaBordes, pCols: number[]): void {
    const totRens = pTbl.renglones.totalElementos
    for (let ren = 1; ren <= totRens; ren++) {
      for (const col of pCols) {
        pTbl.activarBordeCelda(ren, col, 'superior',  false)
        pTbl.activarBordeCelda(ren, col, 'inferior',  false)
        pTbl.activarBordeCelda(ren, col, 'derecha',   false)
        pTbl.activarBordeCelda(ren, col, 'izquierda', false)
      }
    }
  }

  prendeBordesDeDetalle(pTbl: ITablaBordes, pCols: number[]): void {
    const totRens = pTbl.renglones.totalElementos
    for (const col of pCols) {
      pTbl.activarBordeCelda(1,       col, 'superior', true)
      pTbl.activarBordeCelda(totRens, col, 'inferior', true)
    }
    const colIzq = pCols[0]
    const colDer = pCols[pCols.length - 1]
    for (let ren = 1; ren <= totRens; ren++) {
      pTbl.activarBordeCelda(ren, colIzq, 'izquierda', true)
      pTbl.activarBordeCelda(ren, colDer, 'derecha',   true)
    }
  }

  prendeLineasDeCeldasEditables(pTbl: ITablaBordes, pCols: number[]): void {
    const totRens = pTbl.renglones.totalElementos
    for (let ren = 2; ren <= totRens - 1; ren++) {
      for (const col of pCols) {
        pTbl.activarBordeCelda(ren, col, 'inferior', true)
      }
    }
  }
}
