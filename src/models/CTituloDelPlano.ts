// Source: adiciones_layout/source/c_titulo_de_plano.magik
// Extends textbox_layout (Smallworld framework) — no TS base class (Fase 5 pending).
// Auto-positions a title block in the lower-right corner of a container bounding box:
//   xmax(self) = xmax(container) - PADDING
//   ymin(self) = ymin(container) + PADDING   (y increases upward in Smallworld)

import type { BoundingBox } from './CElementoEntidadG'
export type { BoundingBox }

export type AlignH      = 'left' | 'center' | 'right'
export type AlignV      = 'top'  | 'middle' | 'bottom'
export type Orientation = 'left_right' | 'top_bottom'

// textbox_layout defined_attributes — inherited defaults
export interface TituloAttribs {
  text:        string
  fontName:    string
  fontSize:    number      // 1.0–72.0
  colour:      string
  wrap:        boolean
  clip:        boolean
  alignH:      AlignH
  alignV:      AlignV
  orientation: Orientation
  angle:       number      // degrees
  textWidth:   number      // stroke width of font (1.0–72.0)
  textAspect:  number      // xy-aspect ratio (0.1–1.0)
}

export const DEFAULT_ATTRIBS: TituloAttribs = {
  text:        'Introduce tu texto aquí',
  fontName:    'plain',
  fontSize:    6.0,
  colour:      'black',
  wrap:        true,
  clip:        true,
  alignH:      'left',
  alignV:      'top',
  orientation: 'left_right',
  angle:       0.0,
  textWidth:   1.0,
  textAspect:  1.0,
}

export class CTituloDelPlano {
  // Magik shared constants
  static readonly ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false
  static readonly ALLOWED_ON_MENU = false

  // Distance from container edges in layout units (1 unit = 0.1 mm → 400 = 40 mm)
  static readonly PADDING = 400

  private _oBoundContenedor?: BoundingBox

  // Own textbox dimensions; width/height feed the positioning formula
  bounds: BoundingBox = { xmin: 0, ymin: 0, xmax: 800, ymax: 300 }

  attribs: TituloAttribs = { ...DEFAULT_ATTRIBS }

  sEscala?: string

  // Magik setter validates value is a bounding_box before assigning
  set oBoundContenedor(bbox: BoundingBox | undefined) {
    this._oBoundContenedor = bbox
  }
  get oBoundContenedor(): BoundingBox | undefined {
    return this._oBoundContenedor
  }

  // Magik: draw_content_on — recomputes self.bounds relative to oBoundContenedor,
  // then delegates actual rendering to super (textbox_layout → Fase 5).
  // Returns the repositioned bounding box without mutating this.bounds.
  computeDrawBounds(): BoundingBox {
    if (this._oBoundContenedor) {
      const w   = this.bounds.xmax - this.bounds.xmin
      const h   = this.bounds.ymax - this.bounds.ymin
      const pad = CTituloDelPlano.PADDING
      return {
        xmin: this._oBoundContenedor.xmax - pad - w,
        ymin: this._oBoundContenedor.ymin + pad,
        xmax: this._oBoundContenedor.xmax - pad,
        ymax: this._oBoundContenedor.ymin + pad + h,
      }
    }
    return { ...this.bounds }
  }

  // Magik: defined_attributes — super call only, no additions
  definedAttributes(): (keyof TituloAttribs)[] {
    return Object.keys(DEFAULT_ATTRIBS) as (keyof TituloAttribs)[]
  }
}
