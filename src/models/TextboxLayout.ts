// Source: textbox_layout.magik (package sw — GE Smallworld built-in)
// Minimal TypeScript stub for the textbox_layout layout element.
// Provides text + typography attributes used by subclasses.
// Full GIS rendering (draw_content_on, wrap_lines) → Fase 5.

export class TextboxLayout {
  text:            string  = ''
  fontName:        string  = 'plain'
  fontSize:        number  = 6.0
  colour:          string  = '#000000'
  wrap:            boolean = true
  clip:            boolean = true
  alignHorizontal: string  = 'left'
  alignVertical:   string  = 'top'
  orientation:     string  = 'left_right'
  angle:           number  = 0
  textWidth:       number  = 1.0
  textAspect:      number  = 1.0

  drawContentOn(_window: unknown): void { /* Fase 5 */ }

  getForegroundLineColour(): string { return this.colour }

  // Magik: wrap_lines(window, string, style, delims, border_chars) → Fase 5.
  wrapLines(_window: unknown, _string: string): string[] { return [] }
}
