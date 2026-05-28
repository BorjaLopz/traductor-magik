// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_enlace_grafico.magik
// Base class for link graphic renderers (estudio transmisión, diagrama empalmes).
// Extends c_elemento_grafico.
// Manages engine (route elements), color, per-element bounds, and draw origin.
// Subclasses override dibujarElementosGraficos() and elementosEnlace().

import { CElementoGrafico } from './CElementoGrafico'

// [x, y] coordinate — maps to Magik coordinate
export type Coord2D = [number, number]

// Bounding box — maps to Magik bounding_box
export interface BoundingBox {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

// Direction of cable layout — Magik uses :rigth (typo), corrected to 'right' here
export type Direction = 'right' | 'left' | 'down' | 'up'

// One element in the engine rope: { objeto, direccion }
export interface EnlaceElement {
  objeto:    unknown    // GIS object — sheath | splice_closure | building | user!_building (Fase 5)
  direccion: Direction
}

// Computed per-element dimensions (property_list :ancho + :largo)
export interface ElementoBounds {
  ancho: number
  largo: number
}

export class CEnlaceGrafico extends CElementoGrafico {
  static readonly ANCHO_MAXIMO = 61
  static readonly LARGO_MAXIMO = 61

  protected _elementos: EnlaceElement[] = []
  protected _bElemento: ElementoBounds  = { ancho: 0, largo: 0 }
  protected _coordIni:  Coord2D         = [0, 0]
  protected _engine:    EnlaceElement[] = []
  protected _color:     string          = 'black'   // colour.called(:black)

  constructor(engine: EnlaceElement[], color?: string) {
    super()
    this._engine   = engine
    this._elementos = []
    if (color !== undefined) this._color = color
  }

  set setEngine(engine: EnlaceElement[]) {
    this._engine = engine
  }

  // Subclasses that need +20 largo in boundsCable override this (avoid parent knowing subclass names)
  protected get largoExtra(): number { return 0 }

  // Returns [largo, ancho] capped at LARGO_MAXIMO / ANCHO_MAXIMO
  dimensiones(): [number, number] {
    let largo = CEnlaceGrafico.LARGO_MAXIMO
    let ancho = CEnlaceGrafico.ANCHO_MAXIMO
    this.calcularDimensiones()
    if (largo > this._bElemento.largo) largo = this._bElemento.largo
    if (ancho > this._bElemento.ancho) ancho = this._bElemento.ancho
    return [largo, ancho]
  }

  // Computes _bElemento from area size, empalme count and cable count
  calcularDimensiones(): void {
    const factor = 2
    const area = this._area as BoundingBox | undefined
    if (!area) return
    const largo = area.xmax - area.xmin
    const [, empalmes] = this.elementosEnlace()
    const cables = this.getCables()
    const medida = largo / (empalmes.length * factor + cables.length * factor)
    this._bElemento = { ancho: medida, largo: medida }
  }

  // Starting draw coordinate: 1/6 from xmin, vertically centred
  coordenadaInicio(): Coord2D {
    const area = this._area as BoundingBox | undefined
    if (!area) return [0, 0]
    const x = area.xmin + (area.xmax - area.xmin) / 6
    const y = area.ymax - (area.ymax - area.ymin) / 2
    this._coordIni = [x, y]
    return this._coordIni
  }

  // Bounding box for a cable (sheath) element; advances coord along the direction
  boundsCable(coord: Coord2D, direccion: Direction): [Coord2D, BoundingBox] {
    this.calcularDimensiones()
    let largo = this._bElemento.largo + this.largoExtra
    let ancho = this._bElemento.ancho

    if (ancho > CEnlaceGrafico.ANCHO_MAXIMO) ancho = CEnlaceGrafico.ANCHO_MAXIMO

    const [cx, cy] = coord
    let bb: BoundingBox
    let next: Coord2D

    if (direccion === 'right') {
      bb   = { xmin: cx,          ymin: cy - ancho/2, xmax: cx + largo*2, ymax: cy + ancho/2 }
      next = [bb.xmax, cy]
    } else if (direccion === 'left') {
      bb   = { xmin: cx - largo*2, ymin: cy - ancho/2, xmax: cx,          ymax: cy + ancho/2 }
      next = [bb.xmin, cy]
    } else if (direccion === 'down') {
      bb   = { xmin: cx - ancho/2, ymin: cy - largo*2, xmax: cx + ancho/2, ymax: cy }
      next = [cx, bb.ymin]
    } else { // up
      bb   = { xmin: cx - ancho/2, ymin: cy,           xmax: cx + ancho/2, ymax: cy + largo*2 }
      next = [cx, bb.ymax]
    }
    return [next, bb]
  }

  // Bounding box for a point element (splice_closure); coord stays the same
  boundsPuntual(coord: Coord2D): [Coord2D, BoundingBox] {
    const [largo, ancho] = this.dimensiones()
    const [cx, cy] = coord
    const bb: BoundingBox = {
      xmin: cx - ancho/2,
      ymin: cy - largo/2,
      xmax: cx + ancho/2,
      ymax: cy + largo/2,
    }
    return [coord, bb]
  }

  // Bounding box for a building point element; advances coord to xmax
  boundsPuntualEdificio(coord: Coord2D): [Coord2D, BoundingBox] {
    const [largo, ancho] = this.dimensiones()
    const [cx, cy] = coord
    const bb: BoundingBox = {
      xmin: cx,
      ymin: cy - ancho/2,
      xmax: cx + largo,
      ymax: cy + ancho/2,
    }
    return [[bb.xmax, cy], bb]
  }

  // Returns engine elements where objeto is a sheath cable (Fase 5: real GIS type check)
  getCables(): EnlaceElement[] {
    return this._engine.filter(ele => (ele.objeto as any)?.__gisType === 'sheath')
  }

  // Entry point — calls dibujarElementosGraficos()
  despliega(): void {
    this.dibujarElementosGraficos()
  }

  // Overridden by subclasses to render their specific element set
  dibujarElementosGraficos(): void { /* base: no-op */ }

  // Overridden by subclasses — returns [allElements, empalmes]
  elementosEnlace(): [EnlaceElement[], EnlaceElement[]] {
    return [this._engine, []]
  }
}
