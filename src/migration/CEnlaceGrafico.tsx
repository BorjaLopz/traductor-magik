// =============================================================================
// MIGRACIÓN: c_enlace_grafico  →  CEnlaceGrafico.tsx
// Jerarquía Magik: c_enlace_grafico (:c_elemento_grafico)
// Fuente: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_enlace_grafico.magik
// =============================================================================
//
// Clase base para diagramas de enlace (estudio_transmision, diagrama_empalmes).
// Calcula bounding boxes para cables y geometrías puntuales en 4 direcciones.
// Subclases sobreescriben dibujar_elementos_graficos() y elementos_enlace().
// =============================================================================

import React, { useMemo, useState } from 'react';
import { type BBox, CElementoGrafico } from './CElementoGrafico';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Direccion = 'right' | 'left' | 'down' | 'up';
// Nota: fuente Magik usa el typo ':rigth' para :right — corregido en migración

export type Coordinate = [number, number];

export interface ElementoBounds {
  largo: number;
  ancho: number;
}

export interface RouteElement {
  objeto: unknown; // sheath u otro objeto GIS
  tipo?: string;
}

export interface BoundsCableResult {
  nextCoord: Coordinate;
  bb: BBox;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CEnlaceGrafico extends CElementoGrafico {
  // D1: prefijo _, D3: no readonly (todos :writable en Magik)
  private _oElementos: unknown[];
  private _oBElemento: ElementoBounds | undefined;
  private _oCoordIni: Coordinate | undefined;
  private _oEngine: RouteElement[];
  private _oColor: string;

  // Shared constants
  static readonly AnchoMaximo = 61;
  static readonly LargoMaximo = 61;

  // D2: new + init → constructor
  constructor(oEngine: RouteElement[], oColor?: string) {
    super();
    this._oEngine = oEngine;
    this._oElementos = [];
    this._oColor = oColor ?? 'black';
  }

  get oElementos(): unknown[] { return this._oElementos; }
  set oElementos(v: unknown[]) { this._oElementos = v; }

  get oBElemento(): ElementoBounds | undefined { return this._oBElemento; }
  set oBElemento(v: ElementoBounds | undefined) { this._oBElemento = v; }

  get oCoordIni(): Coordinate | undefined { return this._oCoordIni; }
  set oCoordIni(v: Coordinate | undefined) { this._oCoordIni = v; }

  get oEngine(): RouteElement[] { return this._oEngine; }
  set oEngine(v: RouteElement[]) { this._oEngine = v; }

  get oColor(): string { return this._oColor; }
  set oColor(v: string) { this._oColor = v; }

  // ── calcular_dimensiones() ───────────────────────────────────────────────
  // Magik: calcula largo/ancho del elemento proporcional al área y nº de elementos
  calcularDimensiones(): void {
    const area = this.oArea;
    if (!area) return;

    const LoFactor = 2;
    const loLargo = area.xMax - area.xMin;

    const [_elementos, loEmpalmes] = this.elementosEnlace();
    const locables = this.getCables();
    const divisor = loEmpalmes.length * LoFactor + locables.length * LoFactor;
    const loMedida = divisor > 0 ? loLargo / divisor : loLargo;

    this._oBElemento = { ancho: loMedida, largo: loMedida };

    void _elementos;
  }

  // ── coordenada_inicio() ──────────────────────────────────────────────────
  // Magik: inicio = 1/6 desde xmin, mitad vertical
  coordenadaInicio(): Coordinate {
    const area = this.oArea;
    if (!area) { this._oCoordIni = [0, 0]; return [0, 0]; }

    const loX = area.xMin + (area.xMax - area.xMin) / 6;
    const loY = area.yMax - (area.yMax - area.yMin) / 2;

    this._oCoordIni = [loX, loY];
    return this._oCoordIni;
  }

  // ── dimensiones() ────────────────────────────────────────────────────────
  // Magik: retorna largo/ancho acotados por LargoMaximo / AnchoMaximo
  dimensiones(): [number, number] {
    let loLargo = CEnlaceGrafico.LargoMaximo;
    let loAncho = CEnlaceGrafico.AnchoMaximo;

    this.calcularDimensiones();
    const be = this._oBElemento;
    if (!be) return [loLargo, loAncho];

    if (loLargo > be.largo) loLargo = be.largo;
    if (loAncho > be.ancho) loAncho = be.ancho;

    return [loLargo, loAncho];
  }

  // ── bounds_cable(PoCoord, PoDireccion) ───────────────────────────────────
  // Magik: bounding box para cable según dirección + siguiente coordenada
  // Nota: :c_estudio_transmision_grafico y :c_diagrama_empalmes_grafico añaden 20 al largo
  boundsCable(
    coord: Coordinate,
    direccion: Direccion,
    isEstudioOrDiagrama = false,
  ): BoundsCableResult {
    this.calcularDimensiones();
    const be = this._oBElemento!;
    let loLargo = be.largo;
    let loAncho = be.ancho;

    if (isEstudioOrDiagrama) loLargo += 20;
    if (loAncho > CEnlaceGrafico.AnchoMaximo) loAncho = CEnlaceGrafico.AnchoMaximo;

    const [x, y] = coord;
    let bb: BBox;
    let nextCoord: Coordinate;

    if (direccion === 'right') {
      bb = { xMin: x, yMin: y - loAncho / 2, xMax: x + loLargo * 2, yMax: y + loAncho / 2 };
      nextCoord = [bb.xMax, y];
    } else if (direccion === 'left') {
      bb = { xMin: x - loLargo * 2, yMin: y - loAncho / 2, xMax: x, yMax: y + loAncho / 2 };
      nextCoord = [bb.xMin, y];
    } else if (direccion === 'down') {
      bb = { xMin: x - loAncho / 2, yMin: y - loLargo * 2, xMax: x + loAncho / 2, yMax: y };
      nextCoord = [x, bb.yMin];
    } else { // up
      bb = { xMin: x - loAncho / 2, yMin: y, xMax: x + loAncho / 2, yMax: y + loLargo * 2 };
      nextCoord = [x, bb.yMax];
    }

    return { nextCoord, bb };
  }

  // ── bounds_puntual(PoCoord) ───────────────────────────────────────────────
  // Magik: bounding box centrado en el punto (geometría puntual genérica)
  boundsPuntual(coord: Coordinate): BoundsCableResult {
    const [loLargo, loAncho] = this.dimensiones();
    const [x, y] = coord;
    const bb: BBox = {
      xMin: x - loAncho / 2,
      yMin: y - loLargo / 2,
      xMax: x + loAncho / 2,
      yMax: y + loLargo / 2,
    };
    return { nextCoord: coord, bb };
  }

  // ── bounds_puntual_edificio(PoCoord) ─────────────────────────────────────
  // Magik: bounding box para edificio — alineado a la izquierda, se extiende a la derecha
  boundsPuntualEdificio(coord: Coordinate): BoundsCableResult {
    const [loLargo, loAncho] = this.dimensiones();
    const [x, y] = coord;
    const bb: BBox = {
      xMin: x,
      yMin: y - loAncho / 2,
      xMax: x + loLargo,
      yMax: y + loAncho / 2,
    };
    return { nextCoord: [bb.xMax, y], bb };
  }

  // ── despliega() ──────────────────────────────────────────────────────────
  // Magik: llama dibujar_elementos_graficos()
  override despliega(): void {
    this.dibujarElementosGraficos();
  }

  // ── dibujar_elementos_graficos() — template method, subclases sobreescriben
  dibujarElementosGraficos(): void { /* override en subclases */ }

  // ── elementos_enlace() — template method, subclases sobreescriben ─────────
  // Retorna [elementos, empalmes]
  elementosEnlace(): [unknown[], unknown[]] { return [[], []]; }

  // ── getcables() ───────────────────────────────────────────────────────────
  // Magik: filtra oEngine por tipo sheath (cable de fibra)
  getCables(): RouteElement[] {
    return this._oEngine.filter(ele => ele.tipo === 'sheath');
  }
}

// =============================================================================
// Mock data
// =============================================================================

const MOCK_ENGINE: RouteElement[] = [
  { tipo: 'sheath',  objeto: { id: 'CAB-001', fibras: 24 } },
  { tipo: 'sheath',  objeto: { id: 'CAB-002', fibras: 48 } },
  { tipo: 'empalme', objeto: { id: 'EMP-001' } },
  { tipo: 'empalme', objeto: { id: 'EMP-002' } },
  { tipo: 'empalme', objeto: { id: 'EMP-003' } },
  { tipo: 'central', objeto: { id: 'CEN-001' } },
];

const MOCK_AREA: BBox = { xMin: 0, yMin: 0, xMax: 300, yMax: 120 };

// =============================================================================
// Componente React — CEnlaceGraficoUI
// =============================================================================

const SX = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 700,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: {
    color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1,
  } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '230px 1fr', gap: 4,
    fontSize: 11, padding: '2px 0',
  } as React.CSSProperties,
  k:    { color: '#89dceb' } as React.CSSProperties,
  v:    { color: '#a6e3a1' } as React.CSSProperties,
  vMut: { color: '#fab387' } as React.CSSProperties,
  empty:{ color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  badge: (active: boolean) => ({
    display: 'inline-block', padding: '1px 6px', borderRadius: 3,
    fontSize: 10, fontWeight: 'bold',
    background: active ? '#1e3a2e' : '#3a2e1e',
    color: active ? '#a6e3a1' : '#f38ba8',
  }) as React.CSSProperties,
  table: { fontSize: 10, width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
  th: { padding: '2px 6px', color: '#585b70', textAlign: 'left' } as React.CSSProperties,
  td: { padding: '2px 6px' } as React.CSSProperties,
  btn: (active: boolean) => ({
    padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold',
    background: active ? '#89b4fa' : '#313244',
    color: active ? '#1e1e2e' : '#cdd6f4',
    marginRight: 4,
  }) as React.CSSProperties,
};

function KV({ k, v, mut }: { k: string; v: React.ReactNode; mut?: boolean }) {
  return (
    <div style={SX.row}>
      <span style={SX.k}>{k}</span>
      <span style={mut ? SX.vMut : SX.v}>{v}</span>
    </div>
  );
}

function fmtBBox(bb: BBox): string {
  return `xMin=${bb.xMin.toFixed(1)} yMin=${bb.yMin.toFixed(1)} xMax=${bb.xMax.toFixed(1)} yMax=${bb.yMax.toFixed(1)}`;
}

function fmtCoord(c: Coordinate): string {
  return `[${c[0].toFixed(1)}, ${c[1].toFixed(1)}]`;
}

// SVG canvas para visualizar bounds sobre el área
function BoundsSVG({
  area, bbCable, bbPuntual, bbEdificio, coordIni, coordCable, coordPuntualEd, direccion,
}: {
  area: BBox;
  bbCable: BBox;
  bbPuntual: BBox;
  bbEdificio: BBox;
  coordIni: Coordinate;
  coordCable: Coordinate;
  coordPuntualEd: Coordinate;
  direccion: Direccion;
}) {
  const PAD = 16;
  const W = area.xMax - area.xMin;
  const H = area.yMax - area.yMin;
  const svgW = W + PAD * 2;
  const svgH = H + PAD * 2;

  function toSvg(x: number, y: number): [number, number] {
    // invert Y (SVG Y grows downward, coordinates grow upward)
    return [x - area.xMin + PAD, H - (y - area.yMin) + PAD];
  }
  function rectFromBBox(bb: BBox, stroke: string, fill: string, label: string) {
    const [x1, y1] = toSvg(bb.xMin, bb.yMax); // top-left in SVG
    const [x2, y2] = toSvg(bb.xMax, bb.yMin); // bottom-right in SVG
    const rw = x2 - x1, rh = y2 - y1;
    if (rw <= 0 || rh <= 0) return null;
    return (
      <g key={label}>
        <rect x={x1} y={y1} width={rw} height={rh}
          fill={fill} stroke={stroke} strokeWidth={1.5} />
        <text x={x1 + 3} y={y1 + 10} fontSize={7} fill={stroke}>{label}</text>
      </g>
    );
  }
  function dot(c: Coordinate, color: string, lbl: string) {
    const [cx, cy] = toSvg(c[0], c[1]);
    return (
      <g key={lbl}>
        <circle cx={cx} cy={cy} r={3} fill={color} />
        <text x={cx + 5} y={cy + 4} fontSize={7} fill={color}>{lbl}</text>
      </g>
    );
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display: 'block', background: '#11111b', borderRadius: 6 }}
    >
      {/* Área contenedora */}
      <rect x={PAD} y={PAD} width={W} height={H}
        fill="none" stroke="#45475a" strokeWidth={1} strokeDasharray="5,3" />
      <text x={PAD + 2} y={PAD + 10} fontSize={7} fill="#45475a">oArea</text>

      {/* Bounds cable */}
      {rectFromBBox(bbCable, '#89b4fa', '#89b4fa18', `cable(${direccion})`)}
      {/* Bounds puntual */}
      {rectFromBBox(bbPuntual, '#a6e3a1', '#a6e3a118', 'puntual')}
      {/* Bounds edificio */}
      {rectFromBBox(bbEdificio, '#fab387', '#fab38718', 'edificio')}

      {/* Coordenadas */}
      {dot(coordIni, '#cba6f7', 'ini')}
      {dot(coordCable, '#89b4fa', 'next(cable)')}
      {dot(coordPuntualEd, '#fab387', 'next(edif)')}
    </svg>
  );
}

export function CEnlaceGraficoUI() {
  const [direccion, setDireccion] = useState<Direccion>('right');
  const [isEstudio, setIsEstudio] = useState(false);
  const [coordX, setCoordX] = useState('150');
  const [coordY, setCoordY] = useState('60');

  const {
    enlace, cables, dimensiones, coordIni,
    bbCable, coordCable,
    bbPuntual,
    bbEdificio, coordEdificio,
    be,
  } = useMemo(() => {
    const e = new CEnlaceGrafico(MOCK_ENGINE, '#000000');
    e.oArea = { ...MOCK_AREA };

    // Simular elementos_enlace retornando empalmes
    const empalmes = MOCK_ENGINE.filter(el => el.tipo === 'empalme');
    const cables_ = e.getCables();
    // Override elementosEnlace para que calcularDimensiones use los mocks
    e.elementosEnlace = () => [[], empalmes];

    const dim = e.dimensiones();
    const ci = e.coordenadaInicio();

    const coord: Coordinate = [parseFloat(coordX) || 150, parseFloat(coordY) || 60];
    const cable = e.boundsCable(coord, direccion, isEstudio);
    const puntual = e.boundsPuntual(coord);
    const edificio = e.boundsPuntualEdificio(coord);

    return {
      enlace: e,
      cables: cables_,
      dimensiones: dim,
      coordIni: ci,
      bbCable: cable.bb,
      coordCable: cable.nextCoord,
      bbPuntual: puntual.bb,
      bbEdificio: edificio.bb,
      coordEdificio: edificio.nextCoord,
      be: e.oBElemento,
    };
  }, [direccion, isEstudio, coordX, coordY]);

  return (
    <div style={SX.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CEnlaceGrafico</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          clase base enlace · bounding boxes · Fase 5 — GIS
        </span>
        <span style={{ float: 'right', color: '#585b70', fontSize: 10 }}>
          extiende CElementoGrafico
        </span>
      </div>

      {/* Constantes + Slots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Shared constants</div>
          <KV k="AnchoMaximo" v={String(CEnlaceGrafico.AnchoMaximo)} />
          <KV k="LargoMaximo" v={String(CEnlaceGrafico.LargoMaximo)} />
        </div>
        <div style={{ ...SX.card, flex: 2 }}>
          <div style={SX.title}>Slots (D1 — prefijo _)</div>
          <KV k="_oEngine.length" v={String(MOCK_ENGINE.length)} />
          <KV k="_oColor"         v={enlace.oColor} />
          <KV k="_oBElemento.largo" v={be ? be.largo.toFixed(2) : '— (calcular_dimensiones no llamado)'} />
          <KV k="_oBElemento.ancho" v={be ? be.ancho.toFixed(2) : '—'} />
          <KV k="_oCoordIni"     v={enlace.oCoordIni ? fmtCoord(enlace.oCoordIni) : '—'} />
        </div>
      </div>

      {/* calcular_dimensiones + dimensiones */}
      <div style={SX.card}>
        <div style={SX.title}>
          calcular_dimensiones() → dimensiones() — area={fmtBBox(MOCK_AREA)}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <KV k="cables (sheath)" v={String(cables.length)} />
            <KV k="empalmes" v={String(MOCK_ENGINE.filter(e => e.tipo === 'empalme').length)} />
            <KV k="divisor (empalmes×2 + cables×2)" v={String(MOCK_ENGINE.filter(e => e.tipo === 'empalme').length * 2 + cables.length * 2)} />
            <KV k="loMedida = largo/divisor" v={be ? be.largo.toFixed(2) : '—'} mut />
          </div>
          <div style={{ flex: 1 }}>
            <KV k="dimensiones()[0] largo" v={dimensiones[0].toFixed(2)} />
            <KV k="dimensiones()[1] ancho" v={dimensiones[1].toFixed(2)} />
            <KV k="acotado por LargoMaximo" v={String(dimensiones[0] < CEnlaceGrafico.LargoMaximo)} />
            <KV k="acotado por AnchoMaximo" v={String(dimensiones[1] < CEnlaceGrafico.AnchoMaximo)} />
          </div>
          <div style={{ flex: 1 }}>
            <KV k="coordenada_inicio().x" v={coordIni[0].toFixed(2)} />
            <KV k="coordenada_inicio().y" v={coordIni[1].toFixed(2)} />
            <div style={{ color: '#585b70', fontSize: 10, marginTop: 4 }}>
              x = xMin + (xMax−xMin)/6 = {MOCK_AREA.xMin} + {((MOCK_AREA.xMax - MOCK_AREA.xMin) / 6).toFixed(1)}<br />
              y = yMax − (yMax−yMin)/2 = {MOCK_AREA.yMax} − {((MOCK_AREA.yMax - MOCK_AREA.yMin) / 2).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* bounds_cable — interactivo */}
      <div style={SX.card}>
        <div style={SX.title}>bounds_cable(coord, dirección) — interactivo</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
          <div>
            <span style={{ color: '#585b70', fontSize: 10, marginRight: 6 }}>Dirección:</span>
            {(['right', 'left', 'down', 'up'] as Direccion[]).map(d => (
              <button key={d} onClick={() => setDireccion(d)} style={SX.btn(direccion === d)}>{d}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: '#585b70', fontSize: 10 }}>coord:</span>
            <input
              type="number" value={coordX}
              onChange={e => setCoordX(e.target.value)}
              style={{ width: 55, background: '#313244', color: '#cdd6f4', border: '1px solid #45475a', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', fontSize: 11 }}
            />
            <input
              type="number" value={coordY}
              onChange={e => setCoordY(e.target.value)}
              style={{ width: 55, background: '#313244', color: '#cdd6f4', border: '1px solid #45475a', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', fontSize: 11 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox" id="estudio" checked={isEstudio}
              onChange={e => setIsEstudio(e.target.checked)}
            />
            <label htmlFor="estudio" style={{ color: '#585b70', fontSize: 10 }}>
              isEstudioOrDiagrama (+20 largo)
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#89b4fa', fontSize: 10, marginBottom: 4 }}>
              bounds_cable ({direccion})
            </div>
            <KV k="bb.xMin" v={bbCable.xMin.toFixed(1)} />
            <KV k="bb.yMin" v={bbCable.yMin.toFixed(1)} />
            <KV k="bb.xMax" v={bbCable.xMax.toFixed(1)} />
            <KV k="bb.yMax" v={bbCable.yMax.toFixed(1)} />
            <KV k="nextCoord" v={fmtCoord(coordCable)} mut />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 4 }}>bounds_puntual</div>
            <KV k="bb" v={fmtBBox(bbPuntual)} />
            <div style={{ color: '#fab387', fontSize: 10, margin: '8px 0 4px' }}>bounds_puntual_edificio</div>
            <KV k="bb" v={fmtBBox(bbEdificio)} />
            <KV k="nextCoord" v={fmtCoord(coordEdificio)} mut />
          </div>
        </div>
      </div>

      {/* SVG visual */}
      <div style={SX.card}>
        <div style={SX.title}>Visualización — bounds sobre oArea</div>
        <BoundsSVG
          area={MOCK_AREA}
          bbCable={bbCable}
          bbPuntual={bbPuntual}
          bbEdificio={bbEdificio}
          coordIni={coordIni}
          coordCable={coordCable}
          coordPuntualEd={coordEdificio}
          direccion={direccion}
        />
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 10, flexWrap: 'wrap' }}>
          {[
            ['#89b4fa', `cable(${direccion})`],
            ['#a6e3a1', 'puntual'],
            ['#fab387', 'edificio'],
            ['#cba6f7', '● coordIni'],
            ['#89b4fa', '● next(cable)'],
            ['#fab387', '● next(edif)'],
          ].map(([c, l]) => (
            <span key={l} style={{ color: c }}>{l}</span>
          ))}
        </div>
      </div>

      {/* getcables */}
      <div style={SX.card}>
        <div style={SX.title}>getCables() — filtra oEngine por tipo sheath</div>
        {MOCK_ENGINE.map((ele, i) => (
          <div key={i} style={{
            ...SX.row,
            borderBottom: '1px solid #313244', padding: '3px 0',
          }}>
            <span style={ele.tipo === 'sheath' ? SX.v : SX.empty}>
              {ele.tipo === 'sheath' ? '✓ sheath' : `— ${ele.tipo}`}
            </span>
            <span style={{ color: '#585b70' }}>
              {JSON.stringify((ele.objeto as Record<string, unknown>)?.id ?? '')}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 6, color: '#a6e3a1', fontSize: 10 }}>
          {cables.length} cables filtrados de {MOCK_ENGINE.length} elementos
        </div>
      </div>

      {/* Template methods */}
      <div style={SX.card}>
        <div style={SX.title}>Template methods — override en subclases</div>
        <div style={{ fontSize: 10, color: '#585b70', lineHeight: 1.8 }}>
          <div>
            <code style={{ color: '#89dceb' }}>dibujarElementosGraficos()</code>
            {' '}← Magik{' '}
            <code style={{ color: '#f9e2af' }}>dibujar_elementos_graficos()</code>
            : vacío en base, subclases dibujan en canvas OL
          </div>
          <div>
            <code style={{ color: '#89dceb' }}>elementosEnlace()</code>
            {' '}← Magik{' '}
            <code style={{ color: '#f9e2af' }}>elementos_enlace()</code>
            : retorna [elementos, empalmes]; alimenta calcular_dimensiones()
          </div>
        </div>
      </div>

      {/* Equivalencias */}
      <div style={SX.card}>
        <div style={SX.title}>Equivalencias aplicadas</div>
        <table style={SX.table}>
          <thead>
            <tr><th style={SX.th}>Magik</th><th style={SX.th}>→</th><th style={SX.th}>TypeScript</th></tr>
          </thead>
          <tbody>
            {[
              ['def_slotted_exemplar(:c_enlace_grafico, ..., :c_elemento_grafico)', 'class CEnlaceGrafico extends CElementoGrafico'],
              ['new(PoEngine, _optional PoColor) + init()', 'constructor(oEngine, oColor?) — D2'],
              ['.oEngine slot setEngine <<', 'set oEngine(v) — setter TS'],
              ['property_list.new() para oBElemento', '{ largo: number; ancho: number }'],
              ['bounding_box.new(xmin,ymin,xmax,ymax)', 'BBox { xMin yMin xMax yMax }'],
              ['coordinate.new(x,y)', 'Coordinate → [number, number]'],
              ['rope.new() / .add()', 'Array<RouteElement> / push()'],
              ['colour.called(:black)', "'black' (string CSS)"],
              [':rigth (typo fuente)', "'right' — corregido en migración"],
              ['_or (condicional lógico)', '|| en TypeScript'],
              ['elementos_enlace() + getcables() → cálculo divisor', 'misma lógica, arrays TS'],
              ['class_name _is :c_estudio_transmision_grafico', 'param isEstudioOrDiagrama: boolean'],
              ['_unset', 'undefined'],
            ].map(([magik, ts]) => (
              <tr key={magik}>
                <td style={{ ...SX.td, color: '#f9e2af' }}>{magik}</td>
                <td style={{ ...SX.td, color: '#585b70' }}>→</td>
                <td style={{ ...SX.td, color: '#89dceb' }}>{ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
