// =============================================================================
// MIGRACIÓN: c_seccionamiento  →  CSeccionamiento.tsx
// Fuente: adiciones_layout/source/c_seccionamiento.magik  (_package sw)
//         editores/source/c_seccionamiento.magik           (_package user)
// =============================================================================
//
// Algoritmo de seccionamiento geométrico. Divide una polilínea en segmentos
// donde cada uno cabe dentro de un rectángulo de `modulos × defModAncho × escala`
// de ancho y `defModAlto × escala` de alto, orientado según el ángulo del
// segmento (cuerda inicio→fin).
//
// Sin parent class declarado en el fuente → modelado como clase standalone.
// GIS omitido: sector = Coord[], bounding_box = polígono de 4 esquinas,
// transform.rotate → cálculo de esquinas rotadas puro.
//
// Vista = { area: polygon, segment: Coord[], angle: radians, modulos: count }
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Coord  = [number, number];
export type Sector = Coord[];   // Magik: sector (polilínea)

export interface Vista {
  area:    Coord[];  // 4 esquinas del rectángulo rotado (Magik: bounding_box transformado)
  segment: Sector;  // segmento de geometría
  angle:   number;  // radianes
  modulos: number;  // módulos usados
}

// ---------------------------------------------------------------------------
// Utilidades geométricas (reemplaza sector / bounding_box / transform de Magik)
// ---------------------------------------------------------------------------

function dist(a: Coord, b: Coord): number {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
}

function lineLength(s: Sector): number {
  let len = 0;
  for (let i = 1; i < s.length; i++) len += dist(s[i - 1], s[i]);
  return len;
}

// Magik: sector_rope.mid_point — punto a mitad de longitud acumulada
function midPoint(s: Sector): Coord {
  const total  = lineLength(s);
  const target = total / 2;
  let traveled = 0;
  for (let i = 1; i < s.length; i++) {
    const d = dist(s[i - 1], s[i]);
    if (traveled + d >= target) {
      const t = (target - traveled) / d;
      return [
        s[i - 1][0] + t * (s[i][0] - s[i - 1][0]),
        s[i - 1][1] + t * (s[i][1] - s[i - 1][1]),
      ];
    }
    traveled += d;
  }
  return s[s.length - 1];
}

// Magik: sector.cut_to_length — retorna [primera_parte, resto]
function cutToLength(s: Sector, len: number): [Sector, Sector] {
  if (len <= 0) return [[s[0]], [...s]];
  const total = lineLength(s);
  if (len >= total) return [[...s], [s[s.length - 1]]];
  let traveled = 0;
  for (let i = 1; i < s.length; i++) {
    const d = dist(s[i - 1], s[i]);
    if (traveled + d >= len) {
      const t = (len - traveled) / d;
      const cut: Coord = [
        s[i - 1][0] + t * (s[i][0] - s[i - 1][0]),
        s[i - 1][1] + t * (s[i][1] - s[i - 1][1]),
      ];
      return [[...s.slice(0, i), cut], [cut, ...s.slice(i)]];
    }
    traveled += d;
  }
  return [[...s], [s[s.length - 1]]];
}

// Magik: angle_at_coordinate — ángulo de la cuerda inicio→fin (radianes)
function chordAngle(first: Coord, last: Coord): number {
  return Math.atan2(last[1] - first[1], last[0] - first[0]);
}

function rotatePoint(p: Coord, center: Coord, angle: number): Coord {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = p[0] - center[0], dy = p[1] - center[1];
  return [center[0] + dx * cos - dy * sin, center[1] + dx * sin + dy * cos];
}

// Magik: bounding_box.new(0,0,w,h) centrado en centro y rotado
function makeRotatedBox(
  modulos: number, modAncho: number, modAlto: number,
  escala: number, centro: Coord, angleRad: number,
): Coord[] {
  const w = modulos * modAncho * escala;
  const h = modAlto * escala;
  const corners: Coord[] = [
    [-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2],
  ];
  return corners.map(([cx, cy]) =>
    rotatePoint([centro[0] + cx, centro[1] + cy], centro, angleRad),
  );
}

// Ray-casting para punto en polígono
function pointInPolygon(p: Coord, poly: Coord[]): boolean {
  let inside = false;
  const x = p[0], y = p[1];
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

// Magik: sectors.within?(area) — todos los puntos del sector dentro del polígono
function sectorWithin(s: Sector, poly: Coord[]): boolean {
  return s.every(p => pointInPolygon(p, poly));
}

function segmentsIntersect(a1: Coord, a2: Coord, b1: Coord, b2: Coord): boolean {
  const d1x = a2[0] - a1[0], d1y = a2[1] - a1[1];
  const d2x = b2[0] - b1[0], d2y = b2[1] - b1[1];
  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return false;
  const t = ((b1[0] - a1[0]) * d2y - (b1[1] - a1[1]) * d2x) / cross;
  const u = ((b1[0] - a1[0]) * d1y - (b1[1] - a1[1]) * d1x) / cross;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// Magik: overlaps?(area) — algún punto fuera o algún segmento cruza el polígono
function sectorOverlapsPoly(s: Sector, poly: Coord[]): boolean {
  for (const p of s) if (!pointInPolygon(p, poly)) return true;
  for (let i = 1; i < s.length; i++) {
    for (let j = 0, k = poly.length - 1; j < poly.length; k = j++) {
      if (segmentsIntersect(s[i - 1], s[i], poly[k], poly[j])) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Clase principal: c_seccionamiento
// ---------------------------------------------------------------------------

export class CSeccionamiento {
  private _geometria:   Sector | undefined;
  private _collVistas:  Vista[];
  readonly nEscala:      number;
  readonly nMinModulos:  number;
  readonly nMaxModulos:  number;
  readonly nDefModAncho: number;
  readonly nDefModAlto:  number;

  // Magik: new(_optional escala, minModulos, maxModulos, defModAncho, defModAlto)
  constructor(
    escala     = 0,
    minModulos = 0,
    maxModulos = 0,
    defModAncho = 0,
    defModAlto  = 0,
  ) {
    this._geometria   = undefined;
    this._collVistas  = [];
    this.nEscala      = escala;
    this.nMinModulos  = minModulos;
    this.nMaxModulos  = maxModulos;
    this.nDefModAncho = defModAncho;
    this.nDefModAlto  = defModAlto;
  }

  get geometria(): Sector | undefined { return this._geometria; }
  set geometria(g: Sector | undefined) { this._geometria = g; }
  get vistas(): readonly Vista[]       { return this._collVistas; }

  // Magik: get_area — rectángulo de modulos×modAncho×escala, centrado en centro, rotado angleDeg
  getArea(modulos: number, centro?: Coord, angleDeg = 0): Coord[] {
    return makeRotatedBox(
      modulos, this.nDefModAncho, this.nDefModAlto, this.nEscala,
      centro ?? [0, 0], angleDeg * (Math.PI / 180),
    );
  }

  // Magik: get_area_reducida — búsqueda binaria descendente del mínimo de módulos
  getAreaReducida(geom: Sector, centro: Coord, angleRad: number, modulos: number): [Coord[], number] {
    if (modulos <= 1) {
      return [this.getArea(1, centro, angleRad * (180 / Math.PI)), 1];
    }
    const area = this.getArea(modulos, centro, angleRad * (180 / Math.PI));
    if (sectorWithin(geom, area)) {
      return this.getAreaReducida(geom, centro, angleRad, modulos - 1);
    }
    const bigger = this.getArea(modulos + 1, centro, angleRad * (180 / Math.PI));
    return [bigger, modulos + 1];
  }

  // Magik: get_linea_maxima_ajustada — encuentra el segmento más largo que cabe en el área
  getLineaMaximaAjustada(geom: Sector, modulos: number, _depth = 0): [Sector, Coord[], Coord, number] {
    if (_depth > 60 || geom.length < 2) {
      return [geom, this.getArea(modulos, geom[0]), geom[0], 0];
    }

    // Cuerda: recta de primer a último coord
    const straightLength = dist(geom[0], geom[geom.length - 1]);
    const angle = straightLength > 1e-10
      ? chordAngle(geom[0], geom[geom.length - 1])
      : 0;

    // Centro = midpoint de la geometría ORIGINAL (no de la cuerda)
    const centro = midPoint(geom);
    const area   = this.getArea(modulos, centro, angle * (180 / Math.PI));

    if (sectorOverlapsPoly(geom, area)) {
      const modW  = this.nDefModAncho * this.nEscala;
      const cutLen = straightLength >= modW
        ? straightLength - modW
        : straightLength / 2;
      if (cutLen < 1e-6) return [geom, area, centro, angle];
      const [shorter] = cutToLength(geom, cutLen);
      if (shorter.length < 2) return [geom, area, centro, angle];
      return this.getLineaMaximaAjustada(shorter, modulos, _depth + 1);
    }
    return [geom, area, centro, angle];
  }

  // Magik: do_seccionamiento — divide recursivamente la geometría en vistas
  doSeccionamiento(geom: Sector): void {
    if (!geom || geom.length < 2) return;

    const [geom1, , centro, angle] = this.getLineaMaximaAjustada(geom, this.nMaxModulos);
    const [area, modulos]           = this.getAreaReducida(geom1, centro, angle, this.nMaxModulos);

    this._collVistas.push({ area, segment: geom1, angle, modulos });

    const len1    = lineLength(geom1);
    const lenOrig = lineLength(geom);
    if (len1 >= lenOrig - 1e-6) return;

    const [, remainder] = cutToLength(geom, len1);
    if (remainder.length >= 2 && lineLength(remainder) > 1e-6) {
      this.doSeccionamiento(remainder);
    }
  }

  // Reinicia las vistas y ejecuta el seccionamiento sobre la geometría almacenada
  ejecutar(): void {
    this._collVistas = [];
    if (this._geometria) this.doSeccionamiento(this._geometria);
  }
}

// =============================================================================
// Componente React — CSeccionamientoUI
// =============================================================================

const S = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 780,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a',
    borderRadius: 6, padding: 12, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12 } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '150px 1fr',
    gap: 4, padding: '2px 0', fontSize: 11,
  } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  label: { color: '#cba6f7', fontSize: 11, marginBottom: 2, display: 'block' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

const COLORS = ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#74c7ec', '#cba6f7', '#eba0ac', '#89dceb'];

const PRESETS: Record<string, Sector> = {
  'Recta': [[40, 130], [560, 130]],
  'L-shape': [[40, 80], [320, 80], [320, 220]],
  'Zigzag': [[40, 200], [140, 80], [260, 200], [380, 80], [500, 200], [560, 150]],
  'S-curva': [[40, 210], [130, 210], [250, 80], [370, 80], [490, 210], [560, 210]],
};

function coordsToPath(coords: Coord[]): string {
  if (coords.length === 0) return '';
  return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ');
}

function polygonPoints(poly: Coord[]): string {
  return poly.map(c => `${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(' ');
}

function NumInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={S.label}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={S.row}>
      <span style={S.k}>{k}</span>
      <span style={S.v}>{String(v)}</span>
    </div>
  );
}

export function CSeccionamientoUI() {
  const [preset,      setPreset]      = useState('Zigzag');
  const [escala,      setEscala]      = useState('1');
  const [minModulos,  setMinModulos]  = useState('1');
  const [maxModulos,  setMaxModulos]  = useState('5');
  const [defModAncho, setDefModAncho] = useState('130');
  const [defModAlto,  setDefModAlto]  = useState('70');
  const [hoveredIdx,  setHoveredIdx]  = useState<number | null>(null);

  const geom = PRESETS[preset] ?? PRESETS['Zigzag'];

  const vistas = useMemo(() => {
    const s = new CSeccionamiento(
      parseFloat(escala)      || 1,
      parseFloat(minModulos)  || 1,
      parseFloat(maxModulos)  || 5,
      parseFloat(defModAncho) || 130,
      parseFloat(defModAlto)  || 70,
    );
    s.geometria = geom;
    s.ejecutar();
    return s.vistas;
  }, [geom, escala, minModulos, maxModulos, defModAncho, defModAlto]);

  const angleDeg = useCallback((rad: number) => (rad * 180 / Math.PI).toFixed(1), []);

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CSeccionamiento</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          divide polilínea en secciones que caben en rectángulos rotados · _package sw / user
        </span>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo: parámetros */}
        <div>
          <div style={S.card}>
            <div style={S.title}>new(escala, min, max, modAncho, modAlto)</div>
            <NumInput label="nEscala"      value={escala}      onChange={setEscala} />
            <NumInput label="nMinModulos"  value={minModulos}  onChange={setMinModulos} />
            <NumInput label="nMaxModulos"  value={maxModulos}  onChange={setMaxModulos} />
            <NumInput label="nDefModAncho" value={defModAncho} onChange={setDefModAncho} />
            <NumInput label="nDefModAlto"  value={defModAlto}  onChange={setDefModAlto} />
            <div style={{ marginTop: 6, fontSize: 10, color: '#585b70' }}>
              Área máxima: {(parseFloat(maxModulos)||5) * (parseFloat(defModAncho)||130) * (parseFloat(escala)||1)}
              {' '}× {(parseFloat(defModAlto)||70) * (parseFloat(escala)||1)} px
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>geometría de prueba</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {Object.keys(PRESETS).map(k => (
                <button
                  key={k}
                  onClick={() => setPreset(k)}
                  style={{
                    padding: '3px 10px', borderRadius: 4, border: 'none',
                    cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
                    background: preset === k ? '#cba6f7' : '#313244',
                    color: preset === k ? '#1e1e2e' : '#bac2de',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>collVistas — {vistas.length} sección{vistas.length !== 1 ? 'es' : ''}</div>
            {vistas.length === 0 ? (
              <div style={{ color: '#585b70', fontSize: 10 }}>
                Sin secciones. Revisa los parámetros (nMaxModulos=0 o geometría vacía).
              </div>
            ) : (
              vistas.map((v, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    marginBottom: 8, padding: 6, borderRadius: 4,
                    border: `1px solid ${hoveredIdx === i ? COLORS[i % COLORS.length] : '#313244'}`,
                    cursor: 'default', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ color: COLORS[i % COLORS.length], fontSize: 10, marginBottom: 3, fontWeight: 'bold' }}>
                    ▪ Sección {i + 1}
                  </div>
                  <KV k="modulos"      v={v.modulos} />
                  <KV k="angle (deg)"  v={angleDeg(v.angle)} />
                  <KV k="seg length"   v={`${lineLength(v.segment).toFixed(1)} px`} />
                  <KV k="area width"   v={`${(v.modulos * (parseFloat(defModAncho)||130) * (parseFloat(escala)||1)).toFixed(0)} px`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel derecho: SVG */}
        <div>
          <div style={S.card}>
            <div style={S.title}>do_seccionamiento()  ·  visualización</div>
            <svg
              width="100%"
              viewBox="0 0 600 300"
              style={{ display: 'block', background: '#11111b', borderRadius: 6 }}
            >
              {/* Áreas (bounding boxes rotados) */}
              {vistas.map((v, i) => (
                <polygon
                  key={`area-${i}`}
                  points={polygonPoints(v.area)}
                  fill={`${COLORS[i % COLORS.length]}18`}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={hoveredIdx === i ? 2 : 1}
                  strokeDasharray="5,3"
                  opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.35}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'default' }}
                />
              ))}

              {/* Geometría original */}
              <path
                d={coordsToPath(geom)}
                fill="none"
                stroke="#45475a"
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />

              {/* Segmentos de cada sección */}
              {vistas.map((v, i) => (
                <path
                  key={`seg-${i}`}
                  d={coordsToPath(v.segment)}
                  fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={hoveredIdx === i ? 3 : 2}
                  opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.4}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}

              {/* Nodos de la polilínea original */}
              {geom.map((c, i) => (
                <circle key={`node-${i}`} cx={c[0]} cy={c[1]} r={3} fill="#585b70" />
              ))}

              {/* Labels de secciones */}
              {vistas.map((v, i) => {
                const cx = v.area.reduce((s, c) => s + c[0], 0) / 4;
                const cy = v.area.reduce((s, c) => s + c[1], 0) / 4;
                return (
                  <text
                    key={`lbl-${i}`}
                    x={cx} y={cy}
                    fontSize={10}
                    fill={COLORS[i % COLORS.length]}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                    opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.3}
                  >
                    {i + 1}
                  </text>
                );
              })}
            </svg>
            <div style={{ marginTop: 8, fontSize: 10, color: '#585b70' }}>
              Gris punteado = polilínea original · Colores = segmentos de cada sección ·
              Rectángulos = áreas rotadas · Hover en sección para resaltar
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>flujo del algoritmo</div>
            <div style={{ fontSize: 10, color: '#6c7086', lineHeight: 1.8 }}>
              <div><span style={{ color: '#89dceb' }}>1.</span> <code>doSeccionamiento(geom)</code> →</div>
              <div style={{ paddingLeft: 12 }}><code>getLineaMaximaAjustada</code>: cuerda inicio→fin, ángulo, centro=midpoint(geom)</div>
              <div style={{ paddingLeft: 12 }}>Si geom.overlaps(área) → acortar cuerda en <code>-defModAncho×escala</code> y recursar</div>
              <div><span style={{ color: '#89dceb' }}>2.</span> <code>getAreaReducida</code> →</div>
              <div style={{ paddingLeft: 12 }}>Si geom.within(área) → probar <code>modulos-1</code> (descenso)</div>
              <div style={{ paddingLeft: 12 }}>Si no cabe → <code>modulos+1</code></div>
              <div><span style={{ color: '#89dceb' }}>3.</span> Guardar <code>{'{ area, segment, angle, modulos }'}</code> en collVistas</div>
              <div><span style={{ color: '#89dceb' }}>4.</span> Cortar el resto de la geometría y recursar desde el punto de corte</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
