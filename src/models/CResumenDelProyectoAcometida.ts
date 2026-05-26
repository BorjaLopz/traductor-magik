import { CResumenDelProyecto } from './CResumenDelProyecto'
import type { ResumenItem } from './CResumenDelProyecto'

export type { ResumenItem }

const NOMBRE_TABLA = 'tbl_lista_materiales'
const AZUL: [number, number, number] = [0.0, 0.0, 1.0]

export class CResumenDelProyectoAcometida extends CResumenDelProyecto {
  constructor(loElemResumen: ResumenItem[]) {
    super(loElemResumen)
  }

  // Row 1 colors cols 2+3+4 (vs base which only colors col 2)
  override asignarCeldasAColorear(): [string, number, number, [number, number, number]][] {
    const renTbl = this._loElemResumen.length + 2
    const lst: [string, number, number, [number, number, number]][] = [
      [NOMBRE_TABLA, 1, 2, AZUL],
      [NOMBRE_TABLA, 1, 3, AZUL],
      [NOMBRE_TABLA, 1, 4, AZUL],
    ]
    for (let row = 3; row <= renTbl; row++) {
      for (let col = 1; col <= 4; col++) {
        lst.push([NOMBRE_TABLA, row, col, AZUL])
      }
    }
    return lst
  }

  // "RESUMEN DE PROYECTO" (sin "DEL"); cols 1,3 from GIS enlace — stubbed
  override etiquetarCeldas(): void {
    this.asignarTextoCelda(NOMBRE_TABLA, 1, 2, 'RESUMEN DE PROYECTO', 35, 'centre_right', 0, AZUL)
    // TODO(GIS): cols 1,3 → swg_dsn_admin_engine.active_design.project.user!_enlaces.txt_nom_enlace
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 1, 'No',          30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 2, 'DESCRIPCION', 30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 3, 'MATERIAL',    30, undefined)
    this.asignarTextoCelda(NOMBRE_TABLA, 2, 4, 'TOTAL',       30, undefined)
    this.llenarDatosCeldas()
  }
}
