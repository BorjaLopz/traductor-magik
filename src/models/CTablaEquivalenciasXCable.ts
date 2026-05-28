// Source: planos_fo/source/ruta_cables/sellos/c_tabla_equivalencias_x_cable.magik
// Variant of CTablaEquivalencias where cable data is pre-injected via constructor
// instead of fetched from GIS at draw time.
// Key differences vs CTablaEquivalencias:
//   - 9 slots (LoCable, LoRme, LoCableObjeto, central, piso, sala, fila, bastidor, dims)
//   - llenaDatasCable() uses asignarTextoCelda() — not canvas draw_vtext_transform
//   - tbl_1 rows 1 & 3 get cable name / cable type (row 2 = static "TABLA DE EQUIVALENCIAS")
//   - tbl_3 gets CTL name at 40pt rotated 90°
//   - tbl_4 gets PISO/SALA/FILA/BASTIDOR in a single multiline cell
//   - tbl_6 gets "num\ncolor" combined in one cell per group

import { CTablaEquivalencias, COLORES_FIBRA } from './CTablaEquivalencias'

export interface DatosCableXCable {
  loCable?:       unknown
  loRme?:         unknown
  central?:       string   // nombre largo de central
  siglasCentral?: string   // user!_central (siglas)
  cableNo?:       string
  tipoCable?:     string   // Locable.spec_id
  piso?:          string
  sala?:          string
  fila?:          string
  bastidor?:      string
  numGrupos?:     number
  numeroFibras?:  number
}

export class CTablaEquivalenciasXCable extends CTablaEquivalencias {
  loCable:       unknown = undefined
  loRme:         unknown = undefined
  loCableObjeto: unknown = undefined

  central:       string = ''
  siglasCentral: string = ''
  cableNo:       string = ''
  tipoCable:     string = ''
  piso:          string = '---'
  sala:          string = '---'
  fila:          string = '---'
  bastidor:      string = '---'

  constructor(datos: DatosCableXCable = {}) {
    super()
    this.loCable       = datos.loCable
    this.loRme         = datos.loRme
    this.central       = datos.central       ?? ''
    this.siglasCentral = datos.siglasCentral ?? ''
    this.cableNo       = datos.cableNo       ?? ''
    this.tipoCable     = datos.tipoCable     ?? ''
    this.piso          = datos.piso          ?? '---'
    this.sala          = datos.sala          ?? '---'
    this.fila          = datos.fila          ?? '---'
    this.bastidor      = datos.bastidor      ?? '---'
    this.numGrupos     = datos.numGrupos     ?? 0
    this.numeroFibras  = datos.numeroFibras  ?? 0
  }

  get nomCable(): string {
    const sig = this.siglasCentral || '___'
    return `CABLE_${sig}_${this.cableNo}`
  }

  // Fills cells using asignarTextoCelda (not canvas drawing — same API as etiquetarCeldas)
  override llenaDatasCable(_window: unknown): void {
    const cap = this.capacidadCable
    if (cap <= 0) return

    // tbl_1: cable name (row 1) + static title already set by etiquetarCeldas (row 2) + type (row 3)
    this.asignarTextoCelda('tbl_1', 1, 1, this.nomCable,  30, undefined)
    this.asignarTextoCelda('tbl_1', 3, 1, this.tipoCable, 30, undefined)

    // tbl_3: central name, 40pt, rotated 90°
    this.asignarTextoCelda('tbl_3', 1, 1, this.central, 40, undefined, 90)

    // tbl_4: bastidor info in one multiline cell
    const bastInfo =
      `PISO:${this.piso}\nSALA:${this.sala}\nFILA:${this.fila}\nBASTIDOR:${this.bastidor}`
    this.asignarTextoCelda('tbl_4', 1, 1, bastInfo, 20, undefined)

    // tbl_5: cable number
    this.asignarTextoCelda('tbl_5', 1, 1, this.cableNo, 20, undefined)

    // tbl_6: one cell per group → "numGrupo\ncolorTubo"
    for (let g = 1; g <= this.numGrupos; g++) {
      const colorName = COLORES_FIBRA[(g - 1) % COLORES_FIBRA.length]
      this.asignarTextoCelda('tbl_6', g, 1, `${g}\n${colorName}`, 20, undefined)
    }

    // tbl_7: color of fiber at absolute position (cycles through COLORES_FIBRA per group)
    let pos = 0
    for (let g = 0; g < this.numGrupos; g++) {
      for (let f = 1; f <= this.numeroFibras; f++) {
        pos++
        this.asignarTextoCelda('tbl_7', pos, 1, COLORES_FIBRA[(f - 1) % COLORES_FIBRA.length], 20, undefined)
      }
    }

    // tbl_8: absolute fiber sequence (1..capacidadCable)
    for (let f = 1; f <= cap; f++) {
      this.asignarTextoCelda('tbl_8', f, 1, String(f), 20, undefined)
    }

    // tbl_9: fiber number within its group (resets per group)
    let reng = 0
    for (let g = 0; g < this.numGrupos; g++) {
      for (let f = 1; f <= this.numeroFibras; f++) {
        reng++
        this.asignarTextoCelda('tbl_9', reng, 1, String(f), 20, undefined)
      }
    }

    // tbl_10 distrito + tbl_11 cuenta: Fase 5 — from fiber_owner_record (GIS)
  }

  // Fase 5: returns (Locable, fo, loRme) from instance fields or GIS
  override obtenDatos(): [unknown, unknown] { return [this.loCable, this.loCableObjeto] }
}
