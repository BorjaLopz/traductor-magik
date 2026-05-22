import React, { useMemo, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
// Magik: define_shared_constant(:allowed_on_menu?, _false)
export const ALLOWED_ON_MENU = false;
// Magik: define_shared_constant(:activate_properties_dialog_on_insert?, _false)
export const ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false;

export type TamanoNorte = 'A' | 'B' | 'C';
interface Pt { x: number; y: number; }

// ─── Geometry helpers ─────────────────────────────────────────────────────────

// Magik: construir_arco(PnRadio, PoCentro, PnAngIni, PnAngFin) → sector
// Builds arc as sequence of points at 1° intervals
function construirArco(
  radio: number, cx: number, cy: number,
  angIni: number, angFin: number,
): Pt[] {
  const pts: Pt[] = [];
  for (let ang = angIni; ang <= angFin; ang++) {
    const r = ang * (Math.PI / 180);
    pts.push({ x: cx + radio * Math.cos(r), y: cy + radio * Math.sin(r) });
  }
  return pts;
}

// Returns next point by adding (dx,dy) to last point in array
function nxt(pts: Pt[], dx: number, dy: number): Pt {
  const { x, y } = pts[pts.length - 1];
  return { x: x + dx, y: y + dy };
}

// ─── Geometry definition ──────────────────────────────────────────────────────

export interface NorteGeometry {
  arrow:   Pt[];        // closed polygon (Magik: sector 0, all sizes)
  leftH?:  [Pt, Pt];   // left horizontal line (sizes A, B — Magik: sector 1, weight 5)
  rightH?: [Pt, Pt];   // right horizontal line (sizes A, B — Magik: sector 2, weight 5)
  arcs:    Pt[][];      // dashed circle: 4 × 50° arc segments (sizes A, B)
  viewBox: string;      // SVG viewBox string (Y-flipped from GIS)
  boundW:  number;      // Magik: bounding_box.new(0,0,W,H) width
  boundH:  number;      // Magik: bounding_box height
}

// Magik: construir_norte(PoSecRop, PsTamano) → (LcollSectores, LoBound)
// All coordinates in GIS units, Y increases upward, centered at (cx, cy).
export function construirNorte(cx: number, cy: number, tamano: TamanoNorte): NorteGeometry {
  if (tamano === 'A') {
    const a: Pt[] = [{ x: cx + 5, y: cy }];
    a.push(nxt(a, 0,   460));
    a.push(nxt(a, -30, -230));
    a.push(nxt(a, 20,  -15));
    a.push(nxt(a, 0,   -670));
    a.push(nxt(a, 30,  -15));
    a.push(nxt(a, 0,   240));
    a.push(nxt(a, -20, 10));
    a.push(a[0]);
    return {
      arrow: a,
      leftH:  [{ x: cx - 15, y: cy }, { x: cx - 90, y: cy }],
      rightH: [{ x: cx + 15, y: cy }, { x: cx + 90, y: cy }],
      arcs: [
        construirArco(65, cx, cy, 20,  70),
        construirArco(65, cx, cy, 110, 160),
        construirArco(65, cx, cy, 200, 250),
        construirArco(65, cx, cy, 290, 340),
      ],
      viewBox: '-100 -475 200 960',
      boundW: 60, boundH: 960,
    };
  }
  if (tamano === 'B') {
    const a: Pt[] = [{ x: cx + 5, y: cy }];
    a.push(nxt(a, 0,   320));
    a.push(nxt(a, -25, -170));
    a.push(nxt(a, 15,  -15));
    a.push(nxt(a, 0,   -470));
    a.push(nxt(a, 30,  -15));
    a.push(nxt(a, 0,   170));
    a.push(nxt(a, -20, 10));
    a.push(a[0]);
    return {
      arrow: a,
      leftH:  [{ x: cx - 15, y: cy }, { x: cx - 75, y: cy }],
      rightH: [{ x: cx + 15, y: cy }, { x: cx + 75, y: cy }],
      arcs: [
        construirArco(45, cx, cy, 20,  70),
        construirArco(45, cx, cy, 110, 160),
        construirArco(45, cx, cy, 200, 250),
        construirArco(45, cx, cy, 290, 340),
      ],
      viewBox: '-82 -358 164 720',
      boundW: 60, boundH: 710,
    };
  }
  // Size C — arrow only, no horizontal lines, no circle arcs
  const a: Pt[] = [{ x: cx + 2.5, y: cy }];
  a.push(nxt(a, 0,   230));
  a.push(nxt(a, -20, -116));
  a.push(nxt(a, 10,  -10));
  a.push(nxt(a, 0,   -330));
  a.push(nxt(a, 20,  -10));
  a.push(nxt(a, 0,   120));
  a.push(nxt(a, -10, 10));
  a.push(a[0]);
  return {
    arrow: a,
    arcs: [],
    viewBox: '-30 -245 60 490',
    boundW: 50, boundH: 500,
  };
}

// ─── CNorte class ─────────────────────────────────────────────────────────────

// Magik: def_slotted_exemplar(:c_norte,
//   {{:limites, _unset, :writable, :public}, {:oFlag, _false, :writable, :private}},
//   {:layout_element, :viewport_layout_mixin})
export class CNorte {
  // Magik: .limites — bounding box of the containing plano page
  limites: { xmin: number; ymin: number; xmax: number; ymax: number } | null = null;
  tamano: TamanoNorte = 'A';
  private oFlag = false; // Magik: .oFlag

  // Magik: initialise_for_page(a_layout_page)
  initialiseForPage(): void {
    this.oFlag = false;
    // Magik: _self.outline_style<<_unset / _self.set_fill_colour(_unset)
  }

  // Magik: tamano_norte() → rope['A','B','C']
  static tamanoValues(): TamanoNorte[] { return ['A', 'B', 'C']; }

  // Magik: depends_on?(another) → _super(viewport_layout_mixin).depends_on?(another)
  dependsOn(_another: unknown): boolean { return false; }

  // Magik: draw_content_on(window) — repositions, rotates, draws all sectors
  // Returns geometry + rotation angle for the renderer.
  // Placement (top-left of limites + 400 u. margin) is left to the caller.
  buildRenderData(viewAngleDeg = 0): { geo: NorteGeometry; rotateDeg: number } {
    // Magik: LcollSectores.transformed(rotate_about(bounds.centre, -view_angle.degrees_to_radians))
    return { geo: construirNorte(0, 0, this.tamano), rotateDeg: -viewAngleDeg };
  }
}

// ─── SVG helper ───────────────────────────────────────────────────────────────

// GIS Y-up → SVG Y-down: negate y component
function svgPts(pts: Pt[]): string {
  return pts.map(({ x, y }) => `${x.toFixed(1)},${(-y).toFixed(1)}`).join(' ');
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root:  { fontFamily: 'monospace', padding: '12px 16px' } as React.CSSProperties,
  row:   { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' } as React.CSSProperties,
  label: { fontWeight: 'bold', color: '#444', fontSize: 12 } as React.CSSProperties,
  btn:   (active: boolean): React.CSSProperties => ({
    padding: '3px 14px', cursor: 'pointer', border: '1px solid #1a3a5c',
    borderRadius: 4, fontSize: 12,
    background: active ? '#1a3a5c' : '#eef',
    color:      active ? '#fff'    : '#222',
    fontWeight: active ? 'bold'    : 'normal',
  }),
  card:  { border: '1px solid #bbb', borderRadius: 6, background: '#f4f4f4', padding: '12px 20px' } as React.CSSProperties,
  info:  { fontSize: 12, color: '#333', maxWidth: 320 } as React.CSSProperties,
  note:  { marginTop: 10, padding: 8, background: '#eef3f8', borderRadius: 4, lineHeight: 1.5, fontSize: 11 } as React.CSSProperties,
};

// ─── React UI ─────────────────────────────────────────────────────────────────

export function CNorteUI() {
  const [tamano, setTamano]     = useState<TamanoNorte>('A');
  const [rotation, setRotation] = useState(0);

  const geo = useMemo(() => construirNorte(0, 0, tamano), [tamano]);

  return (
    <div style={S.root}>

      {/* Controls */}
      <div style={S.row}>
        <span style={S.label}>Tamaño:</span>
        {(['A', 'B', 'C'] as TamanoNorte[]).map(t => (
          <button key={t} onClick={() => setTamano(t)} style={S.btn(tamano === t)}>{t}</button>
        ))}
        <span style={{ ...S.label, marginLeft: 10 }}>Ángulo viewport:</span>
        <input type="range" min={0} max={359} value={rotation}
          onChange={e => setRotation(Number(e.target.value))} style={{ width: 130 }} />
        <span style={{ minWidth: 36, fontSize: 12 }}>{rotation}°</span>
        <button onClick={() => setRotation(0)}
          style={{ padding: '3px 10px', background: '#f0f0f0', border: '1px solid #aaa', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          ↺
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* SVG north-arrow preview */}
        <div style={S.card}>
          <svg
            viewBox={geo.viewBox}
            style={{ display: 'block', width: 'auto', height: 280, background: '#fff' }}
          >
            {/* Magik: LcollSectores.transformed(rotate_about(centre, -view_angle)) */}
            <g transform={`rotate(${rotation})`}>

              {/* Arrow — Magik: sector 0, all sizes. line_style(black, 2). */}
              {/* Rendered filled for visual fidelity (closed sector shape). */}
              <polygon points={svgPts(geo.arrow)} fill="black" stroke="black" strokeWidth={2} />

              {/* Left horizontal line — Magik: sectors[2], weight 5 (sizes A, B only) */}
              {geo.leftH && (
                <line x1={geo.leftH[0].x}  y1={-geo.leftH[0].y}
                      x2={geo.leftH[1].x}  y2={-geo.leftH[1].y}
                      stroke="black" strokeWidth={5} />
              )}

              {/* Right horizontal line — Magik: sectors[3], weight 5 (sizes A, B only) */}
              {geo.rightH && (
                <line x1={geo.rightH[0].x} y1={-geo.rightH[0].y}
                      x2={geo.rightH[1].x} y2={-geo.rightH[1].y}
                      stroke="black" strokeWidth={5} />
              )}

              {/* Dashed circle — Magik: 4 × construir_arco (50° each, 40° gap), weight 2 */}
              {geo.arcs.map((arc, i) => (
                <polyline key={i} points={svgPts(arc)} fill="none" stroke="black" strokeWidth={2} />
              ))}
            </g>
          </svg>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#888', marginTop: 4 }}>
            Tamaño {tamano} · {geo.boundW}×{geo.boundH} u · {rotation}°
          </div>
        </div>

        {/* Info panel */}
        <div style={S.info}>
          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#1a3a5c', marginBottom: 8 }}>
            c_norte — Símbolo de Norte GIS
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <tbody>
              {([
                ['allowed_on_menu?',  'false'],
                ['Jerarquía',         'layout_element + viewport_layout_mixin'],
                ['.limites',          'bounding_box del plano (posicionamiento)'],
                ['.oFlag',            'false · reset en initialise_for_page()'],
                ['Tamaño activo',     tamano],
                ['Bound (u.)',        `${geo.boundW} × ${geo.boundH}`],
                ['Radio arcos',       tamano === 'C' ? '—' : `${tamano === 'A' ? 65 : 45} · 4 × 50°`],
                ['Líneas horiz.',     tamano === 'C' ? '—' : `±${tamano === 'A' ? 90 : 75} u · stroke 5`],
              ] as [string,string][]).map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px 10px 4px 0', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{k}</td>
                  <td style={{ padding: '4px 0', color: k === 'allowed_on_menu?' ? '#c00' : '#222' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={S.note}>
            <strong>Posicionamiento (draw_content_on):</strong><br />
            Si <code>.limites</code> está definido, el símbolo se ubica en la esquina
            superior-izquierda del plano con margen de 400 u. (≈ 4 cm):<br />
            <code>xmin+400, ymax−400−height</code><br />
            Rotación = <code>−view_angle</code> del viewport activo
            (mantiene "arriba = Norte" independiente de la orientación del mapa).
          </div>
        </div>
      </div>
    </div>
  );
}
