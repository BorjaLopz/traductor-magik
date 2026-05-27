// Source: adiciones_layout/source/c_placa_fosc350c.magik
// Layout symbol for FOSC 350C (fiber optic splice closure) plaques.
// Extends symbol_layout — identical GIS rendering pattern to c_ocupacion_de_vias.
// Only behavioural difference: default symbol name is "placa_fosc 350c".
// All GIS symbol rendering → Fase 5.

// Re-export shared symbol_layout utilities from COcupacionDeVias
// (both classes use the exact same draw_content_on / symbol_names pattern).
export {
  degreesToDrawAngle,
  scaleColorVector,
  rgbToCss,
  buildDrawTransform,
} from './COcupacionDeVias'

// ─── Attributes ───────────────────────────────────────────────────────────────

export interface PlacaFosc350cAttribs {
  name:    string                         // symbol name, default "placa_fosc 350c"
  colour?: [number, number, number]       // RGB 0–1; undefined = inherit from symbol
  angle:   number                         // degrees, default 0.0
  flip:    boolean                        // "Girar" — vertical flip, default false
  mirror:  boolean                        // "Espejo" — horizontal mirror, default false
}

export const DEFAULT_ATTRIBS: PlacaFosc350cAttribs = {
  name:   'placa_fosc 350c',
  angle:  0.0,
  flip:   false,
  mirror: false,
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlacaFosc350c {
  static readonly ALLOWED_ON_MENU = false

  attribs: PlacaFosc350cAttribs = { ...DEFAULT_ATTRIBS }

  // Magik: draw_content_on(window) — GIS symbol DB lookup + draw_sample, Fase 5
  // Identical to COcupacionDeVias.drawContentOn; differs only in default symbol name.
  drawContentOn(_window: unknown): void {
    // Fase 5:
    //  1. outline_style = white line
    //  2. get sigc_style_view or fallback to style_view
    //  3. validate name present
    //  4. new_detached_record(sw_gis!gis_point_style)
    //  5. if colour: col_vec = colour.scaled_rgb_vector(100.0)
    //  6. sym.symbol_name = name; sym.realise(nil, col_vec)
    //  7. sym.draw_sample(window, bounds, rotate: -angle_rad, flipped?: flip, mirror?: mirror)
  }

  // Magik: symbol_names — sorted list from symbol_bundle_table, Fase 5
  symbolNames(): string[] { return [] }
}
