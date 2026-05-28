// Source: adiciones_layout/source/planos/c_simbolo_longitud_trazo_gazas.magik
// Layout symbol for "longitud trazo gazas" — fiber loop length indicator
// used in splice diagram plans (diagrama de empalmes).
// Extends symbol_layout — same GIS rendering pattern as COcupacionDeVias,
// CPlacaFosc350c and CSimbologiaPlanoReubicacionTerminales.
// Differences: default name "longitud trazo gazas"; flip/mirror labels in English.
// All GIS symbol rendering → Fase 5.

// Re-export shared symbol_layout utilities.
export {
  degreesToDrawAngle,
  scaleColorVector,
  rgbToCss,
  buildDrawTransform,
} from './COcupacionDeVias'

// ─── Attributes ───────────────────────────────────────────────────────────────

export interface SimboloLongitudTrazoGazasAttribs {
  name:    string                    // symbol name, default "longitud trazo gazas"
  colour?: [number, number, number]  // RGB 0–1; undefined = inherit from symbol
  angle:   number                    // degrees, default 0.0
  flip:    boolean                   // "Flip", default false
  mirror:  boolean                   // "Mirror", default false
}

export const DEFAULT_ATTRIBS: SimboloLongitudTrazoGazasAttribs = {
  name:   'longitud trazo gazas',
  angle:  0.0,
  flip:   false,
  mirror: false,
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSimboloLongitudTrazoGazas {
  static readonly ALLOWED_ON_MENU = false

  attribs: SimboloLongitudTrazoGazasAttribs = { ...DEFAULT_ATTRIBS }

  // Magik: draw_content_on(window) — GIS symbol DB lookup + draw_sample, Fase 5
  drawContentOn(_window: unknown): void {
    // Fase 5 — identical pattern to COcupacionDeVias family:
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
