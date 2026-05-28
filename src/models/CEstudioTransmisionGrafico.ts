// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_estudio_transmision_grafico.magik
// Graphic renderer for a transmission-study link.
// Extends CEnlaceGrafico; overrides dibujarElementosGraficos() and elementosEnlace().
//
// dibujarElementosGraficos: iterates engine elements, dispatches to:
//   CCableFoGrafico    (sheath)
//   CEmpalmeForGrafico (splice_closure)
//   CCentralGrafico    (sw:building)
//   CClienteGrafico    (user!_building)
// elementosEnlace: partitions engine into [all, splice_closures_only]

import {
  CEnlaceGrafico,
  type Coord2D,
  type BoundingBox,
  type EnlaceElement,
} from './CEnlaceGrafico'

// Fase 5: replace with real Smallworld GIS type resolution
type GisType = 'sheath' | 'splice_closure' | 'building' | 'user!_building'
function gisType(obj: unknown): GisType | undefined {
  return (obj as any)?.__gisType as GisType | undefined
}

// Minimal interface expected from each graphic builder
interface IGraphicElement {
  despliega(ventana: unknown): void
}

export class CEstudioTransmisionGrafico extends CEnlaceGrafico {
  // Adds 20 to largo in boundsCable — see c_enlace_grafico.bounds_cable class_name check
  protected override get largoExtra(): number { return 20 }

  // Iterates engine elements and renders each with its appropriate graphic builder
  override dibujarElementosGraficos(): void {
    let coord: Coord2D = this.coordenadaInicio()
    const [loElemEnlace] = this.elementosEnlace()

    for (const ele of loElemEnlace) {
      let loGrafico: IGraphicElement | undefined
      let bb: BoundingBox

      switch (gisType(ele.objeto)) {
        case 'sheath':
          ;[coord, bb] = this.boundsCable(coord, ele.direccion)
          // Fase 5: loGrafico = new CCableFoGrafico(ele.objeto, bb, ele.direccion, this._color)
          break

        case 'splice_closure':
          ;[coord, bb] = this.boundsPuntual(coord)
          // Fase 5: loGrafico = new CEmpalmeForGrafico(ele.objeto, bb, ele.direccion, this._color)
          break

        case 'building':
          ;[coord, bb] = this.boundsPuntualEdificio(coord)
          // Fase 5: loGrafico = new CCentralGrafico(ele.objeto, bb, this._color)
          break

        case 'user!_building':
          ;[coord, bb] = this.boundsPuntualEdificio(coord)
          // Fase 5: loGrafico = new CClienteGrafico(ele.objeto, bb, this._color)
          break
      }

      loGrafico?.despliega(this._ventana)
    }
  }

  // Partitions engine into [all, splice_closures_only]
  override elementosEnlace(): [EnlaceElement[], EnlaceElement[]] {
    const loEmpalmes = this._engine.filter(
      ele => gisType(ele.objeto) === 'splice_closure',
    )
    return [this._engine, loEmpalmes]
  }
}
