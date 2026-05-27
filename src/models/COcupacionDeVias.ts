// Source: adiciones_layout/source/c_ocupacion_de_vias.magik
// Layout symbol element for road/route occupation diagrams.
// Extends symbol_layout (GIS framework) — no TS base class needed.
// Renders a named symbol from the GIS style DB with optional color, angle, flip, mirror.
// All GIS symbol rendering → Fase 5.

// ─── Attributes ───────────────────────────────────────────────────────────────

export interface OcupacionDeViasAttribs {
  name:    string                         // symbol name, default "ocupacion"
  colour?: [number, number, number]       // RGB in 0–1 range; undefined = inherit from symbol
  angle:   number                         // degrees, default 0.0
  flip:    boolean                        // horizontal flip, default false
  mirror:  boolean                        // mirror, default false
}

export const DEFAULT_ATTRIBS: OcupacionDeViasAttribs = {
  name:   'ocupacion',
  angle:  0.0,
  flip:   false,
  mirror: false,
}

// ─── Pure utilities ───────────────────────────────────────────────────────────

// Magik: angle << - _self.angle.default(0.0).degrees_to_radians
// draw_sample receives the negated radian value, so clockwise degrees = CCW on screen.
export function degreesToDrawAngle(degrees: number): number {
  return -(degrees * Math.PI / 180)
}

// Magik: _self.colour.scaled_rgb_vector(100.0)
// Converts 0–1 RGB components to 0–100 range for Magik's colour system.
export function scaleColorVector(rgb: [number, number, number]): [number, number, number] {
  return [rgb[0] * 100, rgb[1] * 100, rgb[2] * 100]
}

// CSS helper for preview rendering.
export function rgbToCss(rgb: [number, number, number], alpha = 1): string {
  const [r, g, b] = rgb.map(v => Math.round(v * 255))
  return `rgba(${r},${g},${b},${alpha})`
}

// Builds the SVG transform string that draw_sample would apply.
export function buildDrawTransform(
  cx: number, cy: number,
  angle: number,
  flip: boolean,
  mirror: boolean,
): string {
  const rad    = degreesToDrawAngle(angle)
  const deg    = (rad * 180) / Math.PI
  const scaleX = mirror ? -1 : 1
  const scaleY = flip   ? -1 : 1
  return `translate(${cx},${cy}) rotate(${deg}) scale(${scaleX},${scaleY})`
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class COcupacionDeVias {
  static readonly ALLOWED_ON_MENU = false

  attribs: OcupacionDeViasAttribs = { ...DEFAULT_ATTRIBS }

  // Magik: draw_content_on(window) — GIS symbol DB lookup + draw_sample, Fase 5
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
