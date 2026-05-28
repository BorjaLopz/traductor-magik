// Source: adiciones_layout/source/c_simbologia_plano_reubicacion_terminales.magik
// Layout symbol for terminal relocation plan symbology.
// Extends symbol_layout — identical GIS rendering pattern to c_ocupacion_de_vias
// and c_placa_fosc350c. Only difference: default symbol name.
// All GIS symbol rendering → Fase 5.

// Re-export shared symbol_layout utilities (same pattern across all three classes).
export {
  degreesToDrawAngle,
  scaleColorVector,
  rgbToCss,
  buildDrawTransform,
} from './COcupacionDeVias'

// ─── Attributes ───────────────────────────────────────────────────────────────

export interface SimbologiaReubicacionTerminalesAttribs {
  name:    string                    // symbol name, default "simbologia_reubicacion_term"
  colour?: [number, number, number]  // RGB 0–1; undefined = inherit from symbol
  angle:   number                    // degrees, default 0.0
  flip:    boolean                   // "Girar", default false
  mirror:  boolean                   // "Espejo", default false
}

export const DEFAULT_ATTRIBS: SimbologiaReubicacionTerminalesAttribs = {
  name:   'simbologia_reubicacion_term',
  angle:  0.0,
  flip:   false,
  mirror: false,
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSimbologiaPlanoReubicacionTerminales {
  static readonly ALLOWED_ON_MENU = false

  attribs: SimbologiaReubicacionTerminalesAttribs = { ...DEFAULT_ATTRIBS }

  // Magik: draw_content_on(window) — GIS symbol DB lookup + draw_sample, Fase 5
  drawContentOn(_window: unknown): void {
    // Fase 5 — identical to COcupacionDeVias / CPlacaFosc350c:
    //  1. outline_style = white line
    //  2. get sigc_style_view or fallback style_view
    //  3. validate name present → draw_incomplete if empty
    //  4. new_detached_record(sw_gis!gis_point_style)
    //  5. if colour: col_vec = colour.scaled_rgb_vector(100.0)
    //  6. sym.symbol_name = name; sym.realise(nil, col_vec)
    //  7. sym.draw_sample(window, bounds, rotate: -angle_rad, flipped?: flip, mirror?: mirror)
  }

  // Magik: symbol_names — sorted list from symbol_bundle_table, Fase 5
  symbolNames(): string[] { return [] }
}
