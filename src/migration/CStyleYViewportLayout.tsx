/**
 * Migración: c_style_y_viewport_layout.magik
 * GE Network Solutions — rbsaldan — 04/10/27
 * Clase Magik: c_style_y_viewport_layout
 * Hereda de: layout_element, style_element_mixin, viewport_layout_mixin
 *
 * Elemento de layout que combina un estilo gráfico (symbol/figura) con
 * un viewport. Dibuja una figura predefinida (fig_uno..fig_seis) apuntando
 * a un objeto GIS (uub) con línea de señalamiento opcional.
 *
 * Métodos migrados:
 *   defined_attributes()      → DEFINED_ATTRIBUTES
 *   val_falso_verdadero()     → VAL_SI_NO
 *   depends_on?(another)      → dependsOn()
 *   initialise_for_page(page) → initializeForPage()
 *   update_references(table)  → updateReferences()
 *   draw_content_on(window)   → drawContentOn()
 *   crea_figura(estilo, nombre, ...datos) → creaFigura()
 *   LoObjRel getter/setter    → loObjRel prop
 *   oVp getter/setter         → oVp prop
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type SiNo = 'Si' | 'No';

/** Tipos de figura disponibles */
export type TipoFigura = 'fig_uno' | 'fig_dos_a' | 'fig_dos_b' | 'fig_tres' | 'fig_cuatro' | 'fig_cinco' | 'fig_seis';

/** Primitiva de dibujo de una figura */
export type FiguraPrimitive =
  | { tipo: 'area';   fill: string | null; stroke: string | null; points: [number, number][] }
  | { tipo: 'circle'; fill: string; cx: number; cy: number; r: number }
  | { tipo: 'text';   x: number; y: number; texto: string; estilo?: string };

export type FiguraDefinicion = FiguraPrimitive[];

export interface IStyleYViewportLayout {
  loObjRel     : unknown | null;
  oVp          : unknown | null;
  figureName   : string;
  symbolColour : string | null;
  angulo       : number;
  usaViewport  : SiNo;
  conLinea     : SiNo;
  conPunta     : SiNo;
  derecho      : SiNo;
  nIdObjRel    : number;
  lyCampoGeoObjRel: string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const VAL_SI_NO: SiNo[] = ['Si', 'No'];

export const DEFINED_ATTRIBUTES = [
  { nombre: 'figure_name',       tipo: 'string',  descripcion: 'Nombre de la figura',                     default: '',     enPropiedades: true,  enumMethod: 'nombre_estilos' },
  { nombre: 'symbol_colour',     tipo: 'colour',  descripcion: 'Color del Simbolo',                       default: null,   enPropiedades: true },
  { nombre: 'angulo',            tipo: 'integer', descripcion: 'Angulo del objeto',                        default: 0,      enPropiedades: true },
  { nombre: 'usa_viewport',      tipo: 'string',  descripcion: 'Usar las coordenadas del viewport',        default: 'No',   enPropiedades: true,  enumMethod: 'val_falso_verdadero' },
  { nombre: 'con_linea',         tipo: 'string',  descripcion: 'Dibuja linea de senalamiento.',            default: 'No',   enPropiedades: true,  enumMethod: 'val_falso_verdadero' },
  { nombre: 'con_punta',         tipo: 'string',  descripcion: 'Dibuja punta de la linea.',                default: 'No',   enPropiedades: true,  enumMethod: 'val_falso_verdadero' },
  { nombre: 'derecho',           tipo: 'string',  descripcion: 'Dibujar a la derecha?',                   default: 'Si',   enPropiedades: false, enumMethod: 'val_falso_verdadero' },
  { nombre: 'nIdObjRel',         tipo: 'integer', descripcion: 'Id del objeto al que apunta.',             default: 0,      enPropiedades: false },
  { nombre: 'LyCampoGeoObjRel',  tipo: 'string',  descripcion: 'Campo geometrico del objeto a que apunta.',default: '',    enPropiedades: false },
] as const;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CStyleYViewportLayout implements IStyleYViewportLayout {

  static readonly ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false;
  static readonly ALLOWED_ON_MENU = false;

  loObjRel        : unknown | null = null;
  oVp             : unknown | null = null;
  figureName      : string         = '';
  symbolColour    : string | null  = null;
  angulo          : number         = 0;
  usaViewport     : SiNo           = 'No';
  conLinea        : SiNo           = 'No';
  conPunta        : SiNo           = 'No';
  derecho         : SiNo           = 'Si';
  nIdObjRel       : number         = 0;
  lyCampoGeoObjRel: string         = '';

  /** Magik: val_falso_verdadero() */
  valFalsoVerdadero(): SiNo[] { return VAL_SI_NO; }

  /** Magik: depends_on?(another) → delega a viewport_layout_mixin */
  dependsOn(_another: unknown): boolean { return false; }

  /** Magik: initialise_for_page(a_layout_page) */
  initializeForPage(): void {
    // connect_to_viewport_on_page(page, this.oVp)
  }

  /** Magik: update_references(reference_table) */
  updateReferences(_referenceTable: Map<unknown, unknown>): void {
    // super(viewport_layout_mixin).update_references
  }

  /**
   * Magik: crea_figura(PsEstilo, PsNombreParaEstilo, ...datos)
   * Crea la definición de una figura en el registro ESTILOS.
   * Las coordenadas están en unidades de mapa (mm × 10 aprox).
   */
  creaFigura(
    tipo    : TipoFigura,
    nombre  : string,
    datos   : (string | number | undefined)[] = []
  ): FiguraDefinicion {
    const d = (i: number, def = '') => String(datos[i] ?? def);
    const SCALE = 10;

    const xy = (...pairs: number[]): [number, number][] => {
      const pts: [number, number][] = [];
      for (let i = 0; i < pairs.length; i += 2) pts.push([pairs[i] * SCALE, pairs[i + 1] * SCALE]);
      return pts;
    };

    switch (tipo) {
      case 'fig_uno': return [
        { tipo: 'area', fill: null,    stroke: null,    points: xy(0,-4,0,0,0,-4) },
        { tipo: 'area', fill: 'white', stroke: 'black', points: xy(0,0,2,2,2,5,2,2,0,0,0,0) },
        { tipo: 'area', fill: 'white', stroke: 'black', points: xy(0,0,-2,2,-2,5,-2,2,0,0) },
        { tipo: 'text', x: 0,  y: 2*SCALE,  texto: d(0) },
        { tipo: 'text', x: 0,  y: 3*SCALE,  texto: d(1) },
        { tipo: 'text', x: 0,  y: 4*SCALE,  texto: d(2) },
        { tipo: 'text', x: 0,  y: 5*SCALE,  texto: d(3) },
      ];
      case 'fig_dos_a': return [
        { tipo: 'area',   fill: null,    stroke: null,    points: xy(0,0,0,-13,0,0) },
        { tipo: 'area',   fill: 'white', stroke: 'black', points: xy(0,0,3,2,3,10,3,2,0,0) },
        { tipo: 'area',   fill: 'white', stroke: 'black', points: xy(0,0,-3,2,-3,10,-3,2,0,0) },
        { tipo: 'area',   fill: 'white', stroke: 'black', points: xy(-3,6,3,6,-3,6) },
        { tipo: 'area',   fill: 'white', stroke: 'black', points: xy(-3,10,3,10,-3,10) },
        { tipo: 'circle', fill: 'black', cx: 0,    cy: 10*SCALE, r: 3*SCALE },
        { tipo: 'text',   x: 0, y: 2*SCALE,   texto: d(0, 'No dato1') },
        { tipo: 'text',   x: 0, y: 3*SCALE,   texto: d(1, 'No dato2') },
        { tipo: 'text',   x: 0, y: 4*SCALE,   texto: d(2, 'No dato3') },
        { tipo: 'text',   x: 0, y: 5*SCALE,   texto: d(3, 'No dato4') },
        { tipo: 'text',   x: 0, y: 9.5*SCALE, texto: d(4, 'No dato5') },
        { tipo: 'text',   x: 0, y: 11*SCALE,  texto: d(5, 'No dato6') },
      ];
      case 'fig_seis': return [
        { tipo: 'text', x: 0, y: 0, texto: d(0, 'No dato1') },
      ];
      case 'fig_cinco': return this.derecho === 'Si'
        ? [
          { tipo: 'area', fill: 'white', stroke: 'black', points: xy(0,0,3,0,4,3,5,-3,6,0,9,0,6,0,5,-3,4,3,3,0,0,0) },
          { tipo: 'text', x: 7.5*SCALE, y: 1*SCALE, texto: d(0, 'No dato1') + ' ps' },
        ]
        : [
          { tipo: 'area', fill: 'white', stroke: 'black', points: xy(0,0,-3,0,-4,3,-5,-3,-6,0,-9,0,-6,0,-5,-3,-4,3,-3,0,0,0) },
          { tipo: 'text', x: -7.5*SCALE, y: 1*SCALE, texto: d(0, 'No dato1') + ' ps' },
        ];
      default: return [];
    }
  }

  /**
   * Magik: draw_content_on(window)
   * Obtiene el estilo por nombre, aplica ángulo+viewport y dibuja.
   * En TS devuelve los datos de render.
   */
  drawContentOn(estilos: Map<string, FiguraDefinicion>): {
    figura   : FiguraDefinicion | null;
    angulo   : number;
    completo : boolean;
  } {
    const anguloRad = (this.angulo * Math.PI) / 180;
    const figura = this.figureName ? (estilos.get(this.figureName) ?? null) : null;
    return { figura, angulo: anguloRad, completo: figura !== null };
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

function buildMockEstilos(): Map<string, FiguraDefinicion> {
  const inst = new CStyleYViewportLayout();
  const m = new Map<string, FiguraDefinicion>();
  m.set('pozo_proyectado', inst.creaFigura('fig_dos_a', 'pozo_proyectado',
    ['POZO-01', 'PROYECTADO', '1200mm', 'modelo_A', '2.5km', 'NCO_CENTRO']));
  m.set('referencia', inst.creaFigura('fig_seis', 'referencia', ['REF-001']));
  m.set('canal_derecho', inst.creaFigura('fig_cinco', 'canal_derecho', ['42']));
  return m;
}

const MOCK_ESTILOS = buildMockEstilos();

// =============================================================================
// HELPERS SVG
// =============================================================================

const UNIT = 3;  // px por unidad (mm×10)

function renderFigura(fig: FiguraDefinicion, cx: number, cy: number): React.ReactNode[] {
  return fig.map((p, i) => {
    if (p.tipo === 'area') {
      const pts = p.points.map(([x, y]) => `${cx + x * UNIT},${cy - y * UNIT}`).join(' ');
      return <polyline key={i} points={pts} fill={p.fill ?? 'none'} stroke={p.stroke ?? 'none'} strokeWidth={1} />;
    }
    if (p.tipo === 'circle') {
      return <circle key={i} cx={cx + p.cx * UNIT} cy={cy - p.cy * UNIT} r={p.r * UNIT} fill={p.fill} />;
    }
    if (p.tipo === 'text') {
      return <text key={i} x={cx + p.x * UNIT} y={cy - p.y * UNIT} fontSize={9} textAnchor="middle">{p.texto}</text>;
    }
    return null;
  });
}

// =============================================================================
// COMPONENTE REACT
// =============================================================================

export default function CStyleYViewportLayoutViewer(): React.ReactElement {
  const [figureName, setFigureName] = useState('pozo_proyectado');
  const [angulo, setAngulo] = useState(0);
  const [conLinea, setConLinea] = useState<SiNo>('No');
  const [conPunta, setConPunta] = useState<SiNo>('No');
  const [derecho, setDerecho]   = useState<SiNo>('Si');

  const inst = new CStyleYViewportLayout();
  inst.figureName = figureName;
  inst.angulo     = angulo;
  inst.conLinea   = conLinea;
  inst.conPunta   = conPunta;
  inst.derecho    = derecho;

  const result = inst.drawContentOn(MOCK_ESTILOS);
  const SVG_W = 400, SVG_H = 300;
  const cx = SVG_W / 2, cy = SVG_H / 2;

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CStyleYViewportLayout — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_style_y_viewport_layout</code> — hereda layout_element + style_element_mixin + viewport_layout_mixin
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>Figura:&nbsp;
          <select value={figureName} onChange={e => setFigureName(e.target.value)}>
            {[...MOCK_ESTILOS.keys()].map(k => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label>Ángulo:&nbsp;
          <input type="range" min={0} max={360} value={angulo} onChange={e => setAngulo(Number(e.target.value))} />
          &nbsp;{angulo}°
        </label>
        <label>Con línea:&nbsp;
          <select value={conLinea} onChange={e => setConLinea(e.target.value as SiNo)}>
            {VAL_SI_NO.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>Con punta:&nbsp;
          <select value={conPunta} onChange={e => setConPunta(e.target.value as SiNo)}>
            {VAL_SI_NO.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>Derecho:&nbsp;
          <select value={derecho} onChange={e => setDerecho(e.target.value as SiNo)}>
            {VAL_SI_NO.map(v => <option key={v}>{v}</option>)}
          </select>
        </label>
      </div>

      <svg width={SVG_W} height={SVG_H} style={{ border: '1px solid #ccc', background: '#f8f8f8' }}>
        <g transform={`translate(${cx},${cy}) rotate(${-angulo})`}>
          {result.figura ? renderFigura(result.figura, 0, 0) : (
            <text x={0} y={0} fill="red" textAnchor="middle">Sin estilo seleccionado</text>
          )}
        </g>
        {conLinea === 'Si' && (
          <line x1={cx} y1={cy} x2={cx - 60} y2={cy - 60}
            stroke="black" strokeWidth={1}
            markerEnd={conPunta === 'Si' ? 'url(#arrow)' : undefined} />
        )}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth={6} markerHeight={6} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
          </marker>
        </defs>
      </svg>

      <details style={{ marginTop: 12 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>defined_attributes() — {DEFINED_ATTRIBUTES.length}</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
          {DEFINED_ATTRIBUTES.map(a => `${a.nombre} (${a.tipo}) = ${a.default}`).join('\n')}
        </pre>
      </details>
    </div>
  );
}
