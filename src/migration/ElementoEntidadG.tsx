/**
 * Migration: c_elemento_entidad_g.magik → ElementoEntidadG.tsx
 *
 * Clase base abstracta para elementos gráficos de entidad.
 * Cada subclase representa un objeto de negocio (tramo, empalme, nodo…)
 * como un conjunto de hijos gráficos dentro de un bounding box.
 *
 * Magik → TypeScript:
 *   def_slotted_exemplar   → abstract class con propiedades tipadas
 *   _abstract _method      → abstract method
 *   hash_table             → Map<string, number>
 *   coordinate.new(0,0)    → { x:0, y:0 }
 *   bounding_box           → interfaz BoundingBox
 *   c_elementos            → clase ElementosContainer
 */

import React, { useState, useCallback } from 'react';

// ── Tipos primitivos ──────────────────────────────────────────────────────────

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Coordenada {
  x: number;
  y: number;
}

export interface DescriptorEtiqueta {
  sTexto     : string;
  sAlineacion: 'left' | 'center' | 'right';
}

// ── ElementosContainer  (equivale a c_elementos en Magik) ────────────────────

export class ElementosContainer {
  oArea   : BoundingBox | null = null;
  oVentana: unknown            = null;

  private items = new Map<string, DescriptorEtiqueta>();

  /** Magik: oElementos.obten_elemento(key) */
  obtenerElemento(key: string): DescriptorEtiqueta {
    if (!this.items.has(key)) {
      this.items.set(key, { sTexto: '', sAlineacion: 'left' });
    }
    return this.items.get(key)!;
  }

  getItems(): ReadonlyMap<string, DescriptorEtiqueta> {
    return this.items;
  }

  /** Magik: oElementos.despliega() */
  despliega(
    cb?: (items: ReadonlyMap<string, DescriptorEtiqueta>, area: BoundingBox | null) => void,
  ): void {
    cb?.(this.items, this.oArea);
  }
}

// ── Clase abstracta base ──────────────────────────────────────────────────────

export abstract class CElementoEntidadG<TEntidad = unknown> {

  // Slots públicos (define_slot_access :public)
  oArea      : BoundingBox | null    = null;
  oVentana   : unknown               = null;
  oElementos : ElementosContainer    = new ElementosContainer();

  // Slots privados (define_slot_access :private) — expuestos via getters/setters
  protected oEntidad     : TEntidad | null = null;
  private _sNombreSimbolo: string | null   = null;
  private _sDescripcion  : string | null   = null;
  private _oPtoContacto  : Coordenada      = { x: 0, y: 0 };
  private _nLongGrafica  : number          = 0;
  private _bHabilitar    : boolean         = true;
  private _collEtiquetas : Map<string, number> = new Map();

  constructor(entidad: TEntidad | null = null) {
    // Magik: new(RoObjeto) — inicializa slots
    this.oElementos    = new ElementosContainer();
    this.oEntidad      = entidad;
    this._bHabilitar   = true;
    this._oPtoContacto = { x: 0, y: 0 };
    this._collEtiquetas = new Map();
  }

  // ── Métodos abstractos (Magik: _abstract _method) ────────────────────────

  abstract creaElementosInternos(): void;
  abstract dfnUbicacionElementosInternos(): void;
  abstract configurarElementos(): void;

  // ── nLong_grafica getter/setter ───────────────────────────────────────────

  get nLongGrafica(): number               { return this._nLongGrafica; }
  set nLongGrafica(v: number)              { this._nLongGrafica = v; }

  // ── oPto_Contacto getter/setter ───────────────────────────────────────────

  get oPtoContacto(): Coordenada           { return this._oPtoContacto; }
  set oPtoContacto(v: Coordenada)          { this._oPtoContacto = v; }

  // ── bHabilitar getter/setter ──────────────────────────────────────────────

  get bHabilitar(): boolean                { return this._bHabilitar; }
  set bHabilitar(v: boolean)               { this._bHabilitar = v; }

  // ── sNombreSimbolo / sDescripcion ─────────────────────────────────────────

  get sNombreSimbolo(): string | null      { return this._sNombreSimbolo; }
  set sNombreSimbolo(v: string | null)     { this._sNombreSimbolo = v; }

  get sDescripcion(): string | null        { return this._sDescripcion; }
  set sDescripcion(v: string | null)       { this._sDescripcion = v; }

  // ── pos_etiqueta(key) getter/setter ───────────────────────────────────────
  // Magik: _self.collEtiquetas[PsEtiqueta] << PnValor

  setPosEtiqueta(key: string, value: number): void {
    this._collEtiquetas.set(key, value);
  }
  getPosEtiqueta(key: string): number | undefined {
    return this._collEtiquetas.get(key);
  }

  // ── Helpers de etiquetas ──────────────────────────────────────────────────

  /** Magik: asigna_valor_etiqueta(PsEtiqueta) << PsValor */
  asignaValorEtiqueta(key: string, value: string): void {
    this.oElementos.obtenerElemento(key).sTexto = value;
  }

  /** Magik: obten_valor_etiqueta(PsEtiqueta) */
  obtenValorEtiqueta(key: string): string {
    return this.oElementos.obtenerElemento(key).sTexto;
  }

  /** Magik: asigna_alineacion_etiqueta(PsEtiqueta) << PsValor */
  asignaAlineacionEtiqueta(key: string, value: 'left' | 'center' | 'right'): void {
    this.oElementos.obtenerElemento(key).sAlineacion = value;
  }

  /** Magik: obten_alineacion_etiqueta(PsEtiqueta) */
  obtenAlineacionEtiqueta(key: string): 'left' | 'center' | 'right' {
    return this.oElementos.obtenerElemento(key).sAlineacion;
  }

  // ── reposicionar_Area ─────────────────────────────────────────────────────
  /**
   * Magik:
   *   LnAlturaArea = RoArea.YMax - RoArea.YMin
   *   return bounding_box.new(
   *     oPto_Contacto.X,            oPto_Contacto.Y - altura/2,
   *     oPto_Contacto.X + nLong,    oPto_Contacto.Y + altura/2
   *   )
   *
   * El elemento queda anclado por la izquierda al punto de contacto
   * y centrado verticalmente en torno a él.
   */
  reposicionarArea(area: BoundingBox): BoundingBox {
    const altura = area.maxY - area.minY;
    const halfH  = altura / 2;
    return {
      minX: this._oPtoContacto.x,
      minY: this._oPtoContacto.y - halfH,
      maxX: this._oPtoContacto.x + this._nLongGrafica,
      maxY: this._oPtoContacto.y + halfH,
    };
  }

  // ── despliega ─────────────────────────────────────────────────────────────
  /**
   * Magik:
   *   oElementos.oArea    << reposicionar_Area(oArea)
   *   oElementos.oVentana << oVentana
   *   dfn_ubicacion_elementos_internos()
   *   oElementos.despliega()
   */
  despliega(
    cb?: (items: ReadonlyMap<string, DescriptorEtiqueta>, area: BoundingBox | null) => void,
  ): void {
    if (!this.oArea) return;
    this.oElementos.oArea    = this.reposicionarArea(this.oArea);
    this.oElementos.oVentana = this.oVentana;
    this.dfnUbicacionElementosInternos();
    this.oElementos.despliega(cb);
  }
}

// ── Subclase demo concreta ────────────────────────────────────────────────────

interface EntidadDemo {
  nombre  : string;
  longitud: number;
}

class CElementoEntidadDemo extends CElementoEntidadG<EntidadDemo> {

  configurarElementos(): void {
    if (!this.oEntidad) return;
    this.nLongGrafica = this.oEntidad.longitud;
    this.asignaValorEtiqueta('Etiqueta_1', this.oEntidad.nombre);
    this.asignaAlineacionEtiqueta('Etiqueta_1', 'center');
    this.asignaValorEtiqueta('Simbolo_1', '────────────────');
    this.asignaAlineacionEtiqueta('Simbolo_1', 'center');
  }

  creaElementosInternos(): void {
    // Etiqueta en la parte superior del bbox, línea en el centro
    this.asignaValorEtiqueta('Etiqueta_1', this.oEntidad?.nombre ?? '');
    this.asignaValorEtiqueta('Simbolo_1', '────────────────');
  }

  dfnUbicacionElementosInternos(): void {
    if (!this.oElementos.oArea) return;
    const { minY, maxY } = this.oElementos.oArea;
    const midY = (minY + maxY) / 2;
    const h    = maxY - minY;
    // Etiqueta en el cuarto superior, símbolo en la línea media
    this.setPosEtiqueta('Etiqueta_1', midY + h * 0.25);
    this.setPosEtiqueta('Simbolo_1',  midY);
  }
}

// ── Estado de resultado para la UI ────────────────────────────────────────────

interface RenderState {
  area  : BoundingBox;
  items : Array<{ key: string; texto: string; alineacion: string; posY?: number }>;
}

// ── Componente React ──────────────────────────────────────────────────────────

export function ElementoEntidadGUI() {
  const [nombre,   setNombre]   = useState('Elemento Demo');
  const [longitud, setLongitud] = useState(220);
  const [altura,   setAltura]   = useState(60);
  const [ptoX,     setPtoX]     = useState(60);
  const [ptoY,     setPtoY]     = useState(140);
  const [habilitar, setHabilitar] = useState(true);
  const [result,   setResult]   = useState<RenderState | null>(null);

  const ejecutar = useCallback(() => {
    const elem = new CElementoEntidadDemo({ nombre, longitud });
    elem.oArea        = { minX: 0, minY: 0, maxX: longitud, maxY: altura };
    elem.oPtoContacto = { x: ptoX, y: ptoY };
    elem.bHabilitar   = habilitar;

    elem.configurarElementos();
    elem.creaElementosInternos();

    elem.despliega((items, area) => {
      if (!area) return;
      const rows = Array.from(items.entries()).map(([key, desc]) => ({
        key,
        texto     : desc.sTexto,
        alineacion: desc.sAlineacion,
        posY      : elem.getPosEtiqueta(key),
      }));
      setResult({ area, items: rows });
    });
  }, [nombre, longitud, altura, ptoX, ptoY, habilitar]);

  // Dimensiones del canvas SVG
  const SVG_W  = 480;
  const SVG_H  = 300;
  const MARGIN = 30;

  // Escala para encajar todo en el SVG
  const maxX    = ptoX + longitud + 40;
  const scaleX  = (x: number) => MARGIN + (x / maxX) * (SVG_W - 2 * MARGIN);
  const scaleY  = (y: number) => MARGIN + (y / SVG_H) * (SVG_H - 2 * MARGIN);

  return (
    <div style={st.root}>

      {/* Panel de controles */}
      <div style={st.panel}>
        <Field label="Nombre" type="text" value={nombre}
          onChange={v => setNombre(v as string)} />
        <Field label="nLong_grafica" type="number" value={longitud} min={20} max={400}
          onChange={v => setLongitud(Number(v))} />
        <Field label="Altura área" type="number" value={altura} min={10} max={200}
          onChange={v => setAltura(Number(v))} />
        <Field label="oPtoContacto.X" type="number" value={ptoX} min={0} max={300}
          onChange={v => setPtoX(Number(v))} />
        <Field label="oPtoContacto.Y" type="number" value={ptoY} min={10} max={280}
          onChange={v => setPtoY(Number(v))} />
        <label style={st.checkLabel}>
          <input type="checkbox" checked={habilitar}
            onChange={e => setHabilitar(e.target.checked)} />
          &nbsp;bHabilitar
        </label>
        <button style={st.btn} onClick={ejecutar}>despliega()</button>
      </div>

      {/* Canvas SVG — muestra reposicionarArea() */}
      <svg width={SVG_W} height={SVG_H} style={st.svg}>
        {/* Línea de referencia del punto de contacto */}
        <line x1={0} y1={scaleY(ptoY)} x2={SVG_W} y2={scaleY(ptoY)}
          stroke="#e74c3c" strokeWidth={1} strokeDasharray="5 4" />
        <text x={4} y={scaleY(ptoY) - 4} fontSize={9} fill="#e74c3c">
          oPtoContacto.Y = {ptoY}
        </text>

        {/* Punto de contacto */}
        <circle cx={scaleX(ptoX)} cy={scaleY(ptoY)} r={5} fill="#e74c3c" />
        <text x={scaleX(ptoX) + 7} y={scaleY(ptoY) - 7} fontSize={9} fill="#e74c3c">
          ({ptoX}, {ptoY})
        </text>

        {/* BoundingBox repositioned */}
        {result && (() => {
          const rx = scaleX(result.area.minX);
          const ry = scaleY(result.area.minY);
          const rw = scaleX(result.area.maxX) - rx;
          const rh = scaleY(result.area.maxY) - ry;
          const midY = ry + rh / 2;
          return (
            <>
              <rect x={rx} y={ry} width={rw} height={rh}
                fill="rgba(74,144,217,0.15)" stroke="#2E4057" strokeWidth={1.5} />
              {/* Línea símbolo */}
              <line x1={rx} y1={midY} x2={rx + rw} y2={midY}
                stroke="#2E4057" strokeWidth={2} />
              {/* Etiqueta nombre */}
              <text x={rx + rw / 2} y={ry + 15}
                fontSize={11} fill="#333" textAnchor="middle">
                {nombre}
              </text>
              {/* Cota longitud */}
              <line x1={rx} y1={SVG_H - 14} x2={rx + rw} y2={SVG_H - 14}
                stroke="#888" strokeWidth={1} />
              <text x={rx + rw / 2} y={SVG_H - 4}
                fontSize={9} fill="#888" textAnchor="middle">
                nLong_grafica = {longitud}
              </text>
              {/* Coordenadas bbox */}
              <text x={rx + 2} y={ry - 3} fontSize={8} fill="#555">
                ({Math.round(result.area.minX)}, {Math.round(result.area.minY)})
              </text>
              <text x={rx + rw - 2} y={ry + rh + 10}
                fontSize={8} fill="#555" textAnchor="end">
                ({Math.round(result.area.maxX)}, {Math.round(result.area.maxY)})
              </text>
            </>
          );
        })()}
      </svg>

      {/* Tabla de oElementos */}
      {result && (
        <div style={st.tableWrap}>
          <strong style={{ fontSize: 11 }}>
            oElementos — {result.items.length} elementos
          </strong>
          <table style={st.tbl}>
            <thead>
              <tr>
                {['Clave', 'sTexto', 'sAlineacion', 'pos_etiqueta'].map(h => (
                  <th key={h} style={st.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.items.map(row => (
                <tr key={row.key}>
                  <td style={st.td}><code>{row.key}</code></td>
                  <td style={st.td}>{row.texto}</td>
                  <td style={st.td}>{row.alineacion}</td>
                  <td style={st.td}>{row.posY !== undefined ? Math.round(row.posY) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!result && (
        <p style={{ color: '#999', fontSize: 12, marginTop: 10 }}>
          Pulsa <strong>despliega()</strong> para calcular y visualizar el bbox repositioned.
        </p>
      )}
    </div>
  );
}

// ── Helper de campo ───────────────────────────────────────────────────────────

function Field({
  label, type, value, min, max, onChange,
}: {
  label: string;
  type: 'text' | 'number';
  value: string | number;
  min?: number;
  max?: number;
  onChange: (v: string | number) => void;
}) {
  return (
    <label style={st.fieldLabel}>
      <span style={st.fieldName}>{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(type === 'number' ? e.target.value : e.target.value)}
        style={st.input}
      />
    </label>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root      : { fontFamily: 'sans-serif', fontSize: 13 },
  panel     : { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14, alignItems: 'center' },
  fieldLabel: { display: 'flex', flexDirection: 'column', gap: 2 },
  fieldName : { fontSize: 10, color: '#666', fontWeight: 'bold' },
  input     : { padding: '3px 6px', border: '1px solid #bbb', borderRadius: 4, fontSize: 12, width: 110 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 },
  btn       : { padding: '6px 16px', background: '#2E4057', color: '#fff', border: 'none',
                borderRadius: 4, cursor: 'pointer', fontSize: 12, alignSelf: 'flex-end' },
  svg       : { border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', display: 'block' },
  tableWrap : { marginTop: 12 },
  tbl       : { width: '100%', borderCollapse: 'collapse', marginTop: 6 },
  th        : { background: '#2E4057', color: '#fff', padding: '4px 10px', fontSize: 11, textAlign: 'left' },
  td        : { padding: '4px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};
