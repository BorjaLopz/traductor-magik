/**
 * Migración de: linea_perpendicular.magik
 * Clase Magik:  c_traza_trail  —  GE Network Solutions / jtlelo / 2006-02-28
 *
 * Utilidad de red física: dado un segmento P1-P2, calcula la línea
 * perpendicular (transversal) que pasa por P2, con radio fijo 18 000 u.m.
 * o ángulo personalizable. También genera el símbolo de tierra eléctrica
 * a partir de un bounding box.
 *
 * NOTA DE PROYECCIÓN:
 *   Las coordenadas son planas (proyectadas, ej. UTM).
 *   radio = 18 000 unidades del sistema de referencia nativo del mapa.
 */

import React, { useState } from 'react';
import OLFeature from 'ol/Feature';
import { LineString as OLLineString } from 'ol/geom';
import VectorSource from 'ol/source/Vector';

// =============================================================================
// TIPOS
// =============================================================================

/** Par de coordenadas en proyección nativa del dataset. */
export type Point2D = { x: number; y: number };

/** Bounding box para dibujar el símbolo de tierra. */
export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

// =============================================================================
// INTERFAZ GisService
// Abstrae smallworld_product.pni_application().plugin(:map_plugin).current_map
// =============================================================================

export interface TrazaTrailGisService {
  /** Magik: mapa.set_trail_from_geometry(mt.as_pseudo_geometry) */
  setTrailFromGeometry(coords: [number, number][]): void;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CTrazaTrail {

  // ── Slots Magik ─────────────────────────────────────────────────────────────
  private xup:       number = 0;
  private yup:       number = 0;
  private xdown:     number = 0;
  private ydown:     number = 0;
  private radio:     number = 18000;   // .radio << 18000
  private sangulo:   number = 0;       // .sangulo — ángulo P1-P2 en radianes
  private puntoUp:   Point2D | null = null;
  private puntoDown: Point2D | null = null;
  private transversal: [number, number][] = [];

  // OL: capa de trail para set_trail_from_geometry
  readonly trailSource: VectorSource = new VectorSource();

  private gis: TrazaTrailGisService | null = null;

  constructor(gisService?: TrazaTrailGisService) {
    this.gis = gisService ?? null;
  }

  // ---------------------------------------------------------------------------
  // mangulo(p1, p2)
  // Magik: _local lin << construction_line.new_with_coords(p1, p2)
  //        _return lin.angle  ← ángulo en radianes
  //
  // TS: Math.atan2(dy, dx) — idéntico a .angle para coordenadas proyectadas.
  // ---------------------------------------------------------------------------
  mangulo(p1: Point2D, p2: Point2D): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  // ---------------------------------------------------------------------------
  // linea(p1, p2, piAngulo?)
  // Magik: c_traza_trail.linea(p1, p2, _optional PiAngulo)
  //
  // .radio   << 18000
  // .sangulo << _self.mangulo(p1, p2)
  // vangulo  << .sangulo + 90° (o PiAngulo si se pasa)
  //
  // #arriba:  xup   = p2.x - radio·cos(vangulo)
  //           yup   = p2.y - radio·sin(vangulo)
  // #abajo:   xdown = p2.x + radio·cos(vangulo)
  //           ydown = p2.y + radio·sin(vangulo)
  // ---------------------------------------------------------------------------
  linea(p1: Point2D, p2: Point2D, piAngulo?: number): void {
    this.radio   = 18000;
    this.sangulo = this.mangulo(p1, p2);

    // Magik: _if PiAngulo _is _unset → +90.degrees_to_radians
    const vangulo = piAngulo === undefined
      ? this.sangulo + Math.PI / 2
      : this.sangulo + (piAngulo * Math.PI / 180);

    // #arriba ─────────────────────────────────────────────────────────────────
    this.xup    = p2.x - this.radio * Math.cos(vangulo);
    this.yup    = p2.y - this.radio * Math.sin(vangulo);
    this.puntoUp = { x: this.xup, y: this.yup };

    // #abajo ──────────────────────────────────────────────────────────────────
    this.xdown    = p2.x + this.radio * Math.cos(vangulo);
    this.ydown    = p2.y + this.radio * Math.sin(vangulo);
    this.puntoDown = { x: this.xdown, y: this.ydown };

    // ####DEVUELVE LA LINEA TRANSVERSAL
    // Magik: aux_tri.add_coordinate(.punto_up) + add_coordinate(.punto_down)
    //        .transversal << aux_tri.sectors
    this.transversal = [
      [this.xup,   this.yup],
      [this.xdown, this.ydown],
    ];

    this.trazarTrail();
  }

  // ---------------------------------------------------------------------------
  // trazarTrail()
  // Magik: c_traza_trail.trazar_trail
  //
  //   mt.add_coordinate(.punto_down)
  //   c2 << .punto_down + coordinate(6000, -6000)   ← offset constante
  //   mapa.set_trail_from_geometry(mt.as_pseudo_geometry)
  //
  // TS: OL Feature(LineString) añadida a trailSource.
  //     GisService.setTrailFromGeometry si está inyectado.
  // ---------------------------------------------------------------------------
  trazarTrail(): void {
    if (!this.puntoDown) return;

    // c2 << .punto_down + coordinate(6000, -6000)
    const c2: [number, number] = [
      this.puntoDown.x + 6000,
      this.puntoDown.y - 6000,
    ];

    const coords: [number, number][] = [
      [this.puntoDown.x, this.puntoDown.y],
      c2,
    ];

    // OL: equivale a map_trail.new(mapa) + set_trail_from_geometry
    const feature = new OLFeature({ geometry: new OLLineString(coords) });
    this.trailSource.clear();
    this.trailSource.addFeature(feature);

    this.gis?.setTrailFromGeometry(coords);
  }

  // ---------------------------------------------------------------------------
  // dibujarTierra(bbox)
  // Magik: c_traza_trail.dibujar_tierra(limite, window)
  //
  //   longitud = ca.distance_to(cb)       ← distancia horizontal xmin→xmax
  //   incX     = longitud / 16            ← 16 tramos
  //   incY     = 300                      ← descenso diagonal (constante)
  //
  //   _loop (16 iter):
  //     ca = (xmin+offset, ymin-300)      ← punto alto
  //     cb = (xmin+offset+incX, ymin)     ← punto bajo
  //     → segmento diagonal
  //
  //   sr2 = línea horizontal xmin→xmax a ymin
  //
  //   Magik: LoWin1.paint(_true, sr, line_style.new(colour_black, 2))
  //   TS:    devuelve coordenadas; el renderizado lo hace el componente SVG.
  // ---------------------------------------------------------------------------
  dibujarTierra(bbox: BoundingBox): {
    diagonales: [Point2D, Point2D][];
    baseline:   [Point2D, Point2D];
  } {
    const longitud = bbox.xmax - bbox.xmin;   // ca.distance_to(cb) eje X
    const incX     = longitud / 16;            // LoIncX << LoLongitud/16
    const incY     = 300;                      // LoCorIncY << 300

    const diagonales: [Point2D, Point2D][] = [];
    let offsetX = 0;

    // _loop hasta cubrir toda la longitud
    while (offsetX < longitud) {
      const ca: Point2D = { x: bbox.xmin + offsetX,        y: bbox.ymin - incY };
      offsetX += incX;
      const cb: Point2D = { x: bbox.xmin + offsetX,        y: bbox.ymin };
      diagonales.push([ca, cb]);
    }

    // sr2: línea base horizontal (sector simple xmin→xmax)
    const baseline: [Point2D, Point2D] = [
      { x: bbox.xmin, y: bbox.ymin },
      { x: bbox.xmax, y: bbox.ymin },
    ];

    return { diagonales, baseline };
  }

  // Getters (equivalentes a leer los slots Magik desde fuera)
  getPuntoUp():     Point2D | null         { return this.puntoUp;    }
  getPuntoDown():   Point2D | null         { return this.puntoDown;  }
  getTransversal(): [number, number][]     { return this.transversal; }
  getSangulo():     number                 { return this.sangulo;    }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Muestra: inputs P1/P2, ángulo override, canvas SVG + tabla de resultados.
// =============================================================================

const DEMO_P1: Point2D = { x: 440000, y: 4474000 };
const DEMO_P2: Point2D = { x: 440200, y: 4474200 };

export function TrazaTrailUI() {
  const [p1, setP1]         = useState<Point2D>(DEMO_P1);
  const [p2, setP2]         = useState<Point2D>(DEMO_P2);
  const [piAngulo, setPiA]  = useState<string>('');
  const [result, setResult] = useState<{
    sangulo:     number;
    puntoUp:     Point2D;
    puntoDown:   Point2D;
    transversal: [number, number][];
  } | null>(null);

  const ejecutar = () => {
    const c   = new CTrazaTrail();
    const ang = piAngulo !== '' ? parseFloat(piAngulo) : undefined;
    c.linea(p1, p2, ang);
    setResult({
      sangulo    : c.getSangulo(),
      puntoUp    : c.getPuntoUp()!,
      puntoDown  : c.getPuntoDown()!,
      transversal: c.getTransversal(),
    });
  };

  // Normalización a viewport SVG 400×240
  const SVG_W = 400, SVG_H = 240, PAD = 28;
  const allPts = [p1, p2, ...(result ? [result.puntoUp, result.puntoDown] : [])];
  const xs = allPts.map(p => p.x), ys = allPts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rX = maxX - minX || 1, rY = maxY - minY || 1;
  const toSvg = (p: Point2D) => ({
    x: PAD + ((p.x - minX) / rX) * (SVG_W - 2 * PAD),
    y: SVG_H - PAD - ((p.y - minY) / rY) * (SVG_H - 2 * PAD),
  });

  const sP1  = toSvg(p1);
  const sP2  = toSvg(p2);
  const sUp   = result ? toSvg(result.puntoUp)   : null;
  const sDown = result ? toSvg(result.puntoDown) : null;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_traza_trail — Línea perpendicular</h3>

      {/* Inputs P1 / P2 */}
      {(['P1', 'P2'] as const).map(label => {
        const pt   = label === 'P1' ? p1 : p2;
        const setP = label === 'P1' ? setP1 : setP2;
        return (
          <div key={label} style={s.row}>
            <span style={s.lbl}>{label}</span>
            {(['x', 'y'] as const).map(ax => (
              <React.Fragment key={ax}>
                <label style={s.axLbl}>{ax}</label>
                <input
                  style={s.inp}
                  type="number"
                  value={pt[ax]}
                  onChange={e => setP(v => ({ ...v, [ax]: +e.target.value }))}
                />
              </React.Fragment>
            ))}
          </div>
        );
      })}

      {/* Ángulo override */}
      <div style={s.row}>
        <span style={s.lbl}>Ángulo override (°)</span>
        <input
          style={s.inp}
          type="number"
          placeholder="vacío = 90°"
          value={piAngulo}
          onChange={e => setPiA(e.target.value)}
        />
      </div>

      <button style={s.btn} onClick={ejecutar}>Calcular perpendicular</button>

      {/* SVG canvas */}
      {result && (
        <>
          <svg
            width={SVG_W} height={SVG_H}
            style={{ border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', marginTop: 8 }}
          >
            {/* Línea base P1–P2 */}
            <line x1={sP1.x} y1={sP1.y} x2={sP2.x} y2={sP2.y}
              stroke="#2E4057" strokeWidth={2} />

            {/* Perpendicular UP–DOWN */}
            {sUp && sDown && (
              <line x1={sUp.x} y1={sUp.y} x2={sDown.x} y2={sDown.y}
                stroke="#E63946" strokeWidth={2} strokeDasharray="6,3" />
            )}

            {/* Punto central (P2) donde se forma la perpendicular */}
            <circle cx={sP2.x} cy={sP2.y} r={4} fill="#2E4057" />

            {/* Etiquetas */}
            {[
              { p: sP1,   lbl: 'P1',   col: '#2E4057' },
              { p: sP2,   lbl: 'P2',   col: '#2E4057' },
              sUp   ? { p: sUp,   lbl: 'UP',   col: '#E63946' } : null,
              sDown ? { p: sDown, lbl: 'DOWN', col: '#E63946' } : null,
            ].filter(Boolean).map((item, i) => (
              <g key={i}>
                <circle cx={(item as any).p.x} cy={(item as any).p.y} r={4}
                  fill={(item as any).col} />
                <text x={(item as any).p.x + 6} y={(item as any).p.y - 5}
                  fontSize={10} fill={(item as any).col}>{(item as any).lbl}</text>
              </g>
            ))}
          </svg>

          {/* Tabla de resultados */}
          <table style={s.table}>
            <tbody>
              <tr>
                <td style={s.td}>Ángulo P1-P2 (rad)</td>
                <td style={s.td}><code>{result.sangulo.toFixed(6)}</code></td>
              </tr>
              <tr>
                <td style={s.td}>Ángulo P1-P2 (°)</td>
                <td style={s.td}><code>{(result.sangulo * 180 / Math.PI).toFixed(2)}°</code></td>
              </tr>
              <tr>
                <td style={s.td}>punto_up</td>
                <td style={s.td}>
                  <code>({result.puntoUp.x.toFixed(2)}, {result.puntoUp.y.toFixed(2)})</code>
                </td>
              </tr>
              <tr>
                <td style={s.td}>punto_down</td>
                <td style={s.td}>
                  <code>({result.puntoDown.x.toFixed(2)}, {result.puntoDown.y.toFixed(2)})</code>
                </td>
              </tr>
              <tr>
                <td style={s.td}>radio (u.m.)</td>
                <td style={s.td}><code>18 000</code></td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame : { display: 'flex', flexDirection: 'column', gap: 10, width: 440, border: '1px solid #bbb', borderRadius: 6, padding: 16, fontFamily: 'sans-serif', fontSize: 13 },
  title : { margin: '0 0 6px', fontSize: 14, fontWeight: 'bold' },
  row   : { display: 'flex', alignItems: 'center', gap: 8 },
  lbl   : { minWidth: 140, color: '#555' },
  axLbl : { color: '#888', fontSize: 11 },
  inp   : { width: 100, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 },
  btn   : { alignSelf: 'flex-start', padding: '6px 16px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  table : { width: '100%', borderCollapse: 'collapse', marginTop: 8 },
  td    : { padding: '4px 8px', borderBottom: '1px solid #eee', fontSize: 12 },
};

export default TrazaTrailUI;
