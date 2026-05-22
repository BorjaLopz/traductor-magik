/**
 * Migración de: c_titulo_de_plano.magik
 * GE Network Solutions / rbsaldan / 2018
 * Hereda: textbox_layout (stub definido abajo — pendiente migración)
 *
 * Caja de título de plano con auto-posicionamiento en esquina inferior-derecha
 * del bounding box contenedor (oBoundContenedor).
 *
 * Métodos transcritos:
 *   oBoundContenedor<< setter  → is_kind_of?(bounding_box) → asigna o _unset
 *   draw_content_on(window)    → recalcula self.bounds relativo al contenedor,
 *                                luego llama _super.draw_content_on(window)
 *
 * Conversión de coordenadas:
 *   Magik Y-up:   yMin = borde inferior.  c.yMin + 400 = 400u sobre borde inf.
 *   SVG  Y-down:  yMax = borde inferior.  c.yMax - 400 = 400u sobre borde inf.
 *   Fórmula Magik → SVG:
 *     new_yMin = c.yMin + 400         →  new_yMin = c.yMax - OFFSET - h
 *     new_yMax = c.yMin + 400 + h     →  new_yMax = c.yMax - OFFSET
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: bounding_box — xMin/yMin/xMax/yMax en unidades del sistema de layout */
export interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;  // SVG: borde superior (Y-down)
  yMax: number;  // SVG: borde inferior
}

/** Magik: is_kind_of?(bounding_box) — validación en el setter */
function isBoundingBox(v: unknown): v is BoundingBox {
  if (v === null || v === undefined || typeof v !== 'object') return false;
  const b = v as Record<string, unknown>;
  return (
    typeof b.xMin === 'number' && typeof b.xMax === 'number' &&
    typeof b.yMin === 'number' && typeof b.yMax === 'number'
  );
}

// =============================================================================
// BASE — textbox_layout (stub — pendiente migración)
// =============================================================================

/**
 * Stub para textbox_layout — pendiente de migrar su fichero .magik.
 * Aporta bounds propios y renderizado de texto base.
 */
export class TextboxLayout {
  titulo: string       = 'Título del Plano';

  // Magik: _self.bounds — bounding box propio del elemento textbox
  bounds: BoundingBox  = { xMin: 0, xMax: 1000, yMin: 0, yMax: 400 };

  // Magik: _super.draw_content_on(window) — renderiza texto en self.bounds
  drawContentOn(): void { /* sobreescrito en subclase */ }

  protected renderContent(): React.ReactNode {
    const { xMin, xMax, yMin, yMax } = this.bounds;
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const h  = yMax - yMin;
    return (
      <g>
        <text x={cx} y={cy - h * 0.08} textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.max(8, h * 0.28)} fontWeight="bold" fill="#1a237e" fontFamily="sans-serif">
          {this.titulo}
        </text>
      </g>
    );
  }
}

// =============================================================================
// CLASE PRINCIPAL — c_titulo_de_plano
// =============================================================================

export class TituloDePlano extends TextboxLayout {

  // Magik: 400 hardcodeado en ambos ejes en draw_content_on
  static readonly OFFSET = 400;

  // Magik: {:oBoundContenedor, _unset, :writable, :private}
  private _oBoundContenedor: BoundingBox | null = null;

  // Magik: {:sEscala, _unset, :writable}
  sEscala: string | null = null;

  get oBoundContenedor(): BoundingBox | null { return this._oBoundContenedor; }

  // ---------------------------------------------------------------------------
  // oBoundContenedor<<PoBoundingBox
  //
  // Magik:
  //   write("PoBoundingBox---", PoBoundingBox.ap(:cor))
  //   _if PoBoundingBox.is_kind_of?(bounding_box) _then
  //       .oBoundContenedor << PoBoundingBox
  //   _else
  //       .oBoundContenedor << _unset
  //   _endif
  // ---------------------------------------------------------------------------
  set oBoundContenedor(bb: BoundingBox | null) {
    // Magik: write("PoBoundingBox---", PoBoundingBox.ap(:cor))
    console.log('PoBoundingBox---', bb);

    // Magik: is_kind_of?(bounding_box) → asigna; sino → _unset
    this._oBoundContenedor = isBoundingBox(bb) ? bb : null;
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(window)
  //
  // Magik:
  //   _if .oBoundContenedor _isnt _unset _then
  //     LoBound << bounding_box.new(
  //       c.xmax - 400 - _self.bounds.width,   ← xMin
  //       c.ymin + 400,                        ← yMin  (Y-up: sobre borde inferior)
  //       c.xmax - 400,                        ← xMax
  //       c.ymin + 400 + _self.bounds.height   ← yMax
  //     )
  //     _self.bounds << LoBound
  //   _endif
  //   _super.draw_content_on(window)
  //
  // SVG Y-down equivalente (c.yMax = borde inferior en SVG):
  //   yMin = c.yMax - OFFSET - h
  //   yMax = c.yMax - OFFSET
  // ---------------------------------------------------------------------------
  drawContentOn(): void {
    if (this._oBoundContenedor !== null) {
      const c = this._oBoundContenedor;
      const w = this.bounds.xMax - this.bounds.xMin;  // conserva ancho de self
      const h = this.bounds.yMax - this.bounds.yMin;  // conserva alto de self

      // Magik (Y-up):  xMin = c.xMax-400-w,  yMin = c.yMin+400
      // SVG  (Y-down): xMin = c.xMax-400-w,  yMin = c.yMax-400-h
      this.bounds = {
        xMin: c.xMax - TituloDePlano.OFFSET - w,
        yMin: c.yMax - TituloDePlano.OFFSET - h,
        xMax: c.xMax - TituloDePlano.OFFSET,
        yMax: c.yMax - TituloDePlano.OFFSET,
      };
    }
    // Magik: _super.draw_content_on(window) — renderiza texto en self.bounds
    super.drawContentOn();
  }

  /** Devuelve JSX para renderizar en SVG — equivale al resultado de _super.draw_content_on */
  renderSvg(): React.ReactNode {
    return (
      <g>
        <rect
          x={this.bounds.xMin}       y={this.bounds.yMin}
          width={this.bounds.xMax - this.bounds.xMin}
          height={this.bounds.yMax - this.bounds.yMin}
          fill="#e3f2fd" stroke="#1565c0" strokeWidth={2}
        />
        {this.renderContent()}
        {this.sEscala && (
          <text
            x={(this.bounds.xMin + this.bounds.xMax) / 2}
            y={this.bounds.yMax - (this.bounds.yMax - this.bounds.yMin) * 0.15}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={Math.max(7, (this.bounds.yMax - this.bounds.yMin) * 0.18)}
            fill="#1565c0" fontFamily="sans-serif"
          >
            Escala {this.sEscala}
          </text>
        )}
      </g>
    );
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Visualiza el auto-posicionamiento del título dentro del contenedor.
// =============================================================================

const CANVAS_W = 640;
const CANVAS_H = 420;

export function TituloDePlanoUI() {
  const [cW, setCW]      = useState(4000);   // ancho contenedor (unidades layout)
  const [cH, setCH]      = useState(2800);   // alto contenedor
  const [tW, setTW]      = useState(1000);   // ancho título (self.bounds)
  const [tH, setTH]      = useState(400);    // alto título
  const [titulo, setTitulo] = useState('Plano Red Óptica — Madrid Norte');
  const [escala, setEscala] = useState('1:500');
  const [setterInvalido, setSetterInvalido] = useState(false);

  // Escala uniforme para caber en el canvas
  const scale   = Math.min(CANVAS_W / cW, CANVAS_H / cH) * 0.92;
  const offsetX = (CANVAS_W - cW * scale) / 2;
  const offsetY = (CANVAS_H - cH * scale) / 2;

  const sx = (v: number) => offsetX + v * scale;
  const sy = (v: number) => offsetY + v * scale;
  const sw = (v: number) => v * scale;

  // Instanciar y ejecutar drawContentOn
  const engine = new TituloDePlano();
  engine.titulo  = titulo;
  engine.sEscala = escala;
  engine.bounds  = { xMin: 0, xMax: tW, yMin: 0, yMax: tH };

  const container: BoundingBox = { xMin: 0, xMax: cW, yMin: 0, yMax: cH };

  if (setterInvalido) {
    engine.oBoundContenedor = null;  // setter recibe null → _unset
  } else {
    engine.oBoundContenedor = container;  // is_kind_of?(bounding_box) → ok
  }

  engine.drawContentOn();
  const tb = engine.bounds;

  const cabe = !setterInvalido &&
    tb.xMin >= 0 && tb.yMin >= 0 && tb.xMax <= cW && tb.yMax <= cH;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_titulo_de_plano.draw_content_on()</h3>
      <p style={s.meta}>
        Auto-posiciona título en esquina inferior-derecha del contenedor.
        Offset hardcodeado: <code>400 u.</code> en ambos ejes.
      </p>

      {/* Controles */}
      <div style={s.controls}>
        <div style={s.col}>
          <strong style={{ fontSize: 11 }}>Contenedor</strong>
          <label style={s.lbl}>
            Ancho: <input type="range" min={2000} max={6000} step={100} value={cW} onChange={e => setCW(+e.target.value)} style={{ width: 90 }} />
            <code style={{ minWidth: 42 }}>{cW} u.</code>
          </label>
          <label style={s.lbl}>
            Alto: <input type="range" min={1500} max={4000} step={100} value={cH} onChange={e => setCH(+e.target.value)} style={{ width: 90 }} />
            <code style={{ minWidth: 42 }}>{cH} u.</code>
          </label>
        </div>
        <div style={s.col}>
          <strong style={{ fontSize: 11 }}>self.bounds (título)</strong>
          <label style={s.lbl}>
            Ancho: <input type="range" min={400} max={2000} step={50} value={tW} onChange={e => setTW(+e.target.value)} style={{ width: 90 }} />
            <code style={{ minWidth: 42 }}>{tW} u.</code>
          </label>
          <label style={s.lbl}>
            Alto: <input type="range" min={150} max={800} step={25} value={tH} onChange={e => setTH(+e.target.value)} style={{ width: 90 }} />
            <code style={{ minWidth: 42 }}>{tH} u.</code>
          </label>
        </div>
        <div style={s.col}>
          <strong style={{ fontSize: 11 }}>Contenido</strong>
          <label style={s.lbl}>Título: <input value={titulo} onChange={e => setTitulo(e.target.value)} style={{ fontSize: 11, width: 180 }} /></label>
          <label style={s.lbl}>Escala: <input value={escala} onChange={e => setEscala(e.target.value)} style={{ fontSize: 11, width: 70 }} /></label>
          <label style={{ ...s.lbl, marginTop: 4 }}>
            <input type="checkbox" checked={setterInvalido} onChange={e => setSetterInvalido(e.target.checked)} />
            {' '}setter inválido → <code>_unset</code>
          </label>
        </div>
      </div>

      {/* SVG */}
      <svg width={CANVAS_W} height={CANVAS_H}
        style={{ border: '1px solid #bbb', background: '#f9f9f9', borderRadius: 3 }}>

        {/* Contenedor */}
        <rect x={sx(0)} y={sy(0)} width={sw(cW)} height={sw(cH)}
          fill="#fff" stroke="#2E4057" strokeWidth={1.5} />
        <text x={sx(10)} y={sy(10) + 12} fontSize={10} fill="#2E4057">
          oBoundContenedor ({cW} × {cH} u.)
        </text>

        {cabe && (
          <>
            {/* Título renderizado */}
            <rect x={sx(tb.xMin)} y={sy(tb.yMin)} width={sw(tb.xMax - tb.xMin)} height={sw(tb.yMax - tb.yMin)}
              fill="#e3f2fd" stroke="#1565c0" strokeWidth={1.5} />
            <text x={sx((tb.xMin + tb.xMax) / 2)} y={sy((tb.yMin + tb.yMax) / 2) - sw(tH)*0.08}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.max(7, sw(tH) * 0.25)} fontWeight="bold" fill="#1a237e">
              {titulo}
            </text>
            {escala && (
              <text x={sx((tb.xMin + tb.xMax) / 2)} y={sy(tb.yMax) - sw(tH)*0.12}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.max(6, sw(tH) * 0.18)} fill="#1565c0">
                Escala {escala}
              </text>
            )}

            {/* Anotación offset H */}
            <line x1={sx(tb.xMax)} y1={sy(tb.yMin + tH/2)} x2={sx(cW)} y2={sy(tb.yMin + tH/2)}
              stroke="#e65100" strokeWidth={1} strokeDasharray="3,2" />
            <text x={sx(tb.xMax) + 3} y={sy(tb.yMin + tH/2) - 3} fontSize={9} fill="#e65100">
              OFFSET={TituloDePlano.OFFSET}u
            </text>

            {/* Anotación offset V */}
            <line x1={sx(tb.xMin + tW/2)} y1={sy(tb.yMax)} x2={sx(tb.xMin + tW/2)} y2={sy(cH)}
              stroke="#e65100" strokeWidth={1} strokeDasharray="3,2" />
            <text x={sx(tb.xMin + tW/2) + 2} y={sy(tb.yMax) + 11} fontSize={9} fill="#e65100">
              OFFSET={TituloDePlano.OFFSET}u
            </text>
          </>
        )}

        {!cabe && !setterInvalido && (
          <text x={CANVAS_W/2} y={CANVAS_H/2} textAnchor="middle" fontSize={12} fill="#c62828">
            ⚠ Título fuera del contenedor — reducir título o aumentar contenedor
          </text>
        )}

        {setterInvalido && (
          <text x={CANVAS_W/2} y={CANVAS_H/2} textAnchor="middle" fontSize={12} fill="#888">
            oBoundContenedor = _unset — self.bounds sin recalcular
          </text>
        )}
      </svg>

      {/* Bounds resultantes */}
      <div style={s.info}>
        <code style={{ fontSize: 11 }}>
          self.bounds = &#123;{' '}
          xMin:{Math.round(tb.xMin)}, yMin:{Math.round(tb.yMin)},{' '}
          xMax:{Math.round(tb.xMax)}, yMax:{Math.round(tb.yMax)}{' '}
          &#125;
        </code>
        {!cabe && !setterInvalido && (
          <span style={{ color: '#c62828', marginLeft: 8, fontSize: 11 }}>⚠ Fuera del contenedor</span>
        )}
        {setterInvalido && (
          <span style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>sin repositionamiento (contenedor _unset)</span>
        )}
      </div>

      <p style={{ ...s.meta, marginTop: 4 }}>
        Magik Y-up: <code>yMin = c.yMin + 400</code> · SVG Y-down:{' '}
        <code>yMin = c.yMax − 400 − h</code>.
        Posición final: esquina inferior-derecha del contenedor.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame   : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title   : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta    : { color: '#666', fontSize: 12, margin: '2px 0' },
  controls: { display: 'flex', gap: 20, padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  col     : { display: 'flex', flexDirection: 'column', gap: 4 },
  lbl     : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  info    : { padding: '6px 10px', background: '#e8f0fe', borderRadius: 3, border: '1px solid #c5cae9', fontSize: 12 },
};

export default TituloDePlanoUI;
