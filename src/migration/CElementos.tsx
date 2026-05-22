// ================================================================================
//  MIGRACIÓN: c_elementos.magik → CElementos.tsx
//  Clase origen : c_elementos  (def_slotted_exemplar)
//  Autor orig.  : fdiaz — 28/10/2004, 23/12/2004
// ================================================================================
//
//  Contenedor de elementos gráficos del motor de plotting de Smallworld.
//  Mantiene la colección de c_elemento_grafico indexada por nombre, junto con
//  la ventana (canvas) y el área (bounding_box) sobre la que se renderizan.
//
//  Spatial: oArea (bounding_box Magik) → Turf.js bbox / GeoJSON Polygon.
//  Render : oVentana → ol/source/Vector (cada elemento dibuja sus features).
//
// ================================================================================

import React, { useEffect, useMemo, useState } from 'react';
import * as turf from '@turf/turf';
import type { Feature, Polygon } from 'geojson';
import VectorSource from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import { fromExtent } from 'ol/geom/Polygon';

// ─── Tipos: bbox + interfaz elemento gráfico ──────────────────────────────────

// bounding_box Magik → bbox Turf [minX, minY, maxX, maxY]
export type BBox = [number, number, number, number];

// Equivalente a sw:window canvas — se reemplaza por ol/source/Vector real
export type OlCanvas = VectorSource;

// Contrato mínimo que c_elemento_grafico expone hacia c_elementos
// (los hijos reales — c_linea_grafico, c_texto_grafico, etc. — implementarán esto)
export interface IElementoGrafico {
  oVentana?: OlCanvas;
  oArea?:    BBox;
  Actualiza_Area_Elemento(): void;     // recalcula geometría según oArea
  Despliega(): void | Promise<void>;   // dibuja en oVentana
}

// Tipos de serialización (serial_slots / new_from_serial)
export interface CElementosSerialData {
  nTotal_Elementos: number;
  collElementos:    Map<string, IElementoGrafico>;
  oArea:            BBox | undefined;
}

// ─── CElementos ───────────────────────────────────────────────────────────────

export class CElementos {
  // Slots — define_slot_access(:writable[, :private])
  private _nTotal_Elementos: number;
  private _collElementos:    Map<string, IElementoGrafico>;
  private _oVentana:         OlCanvas | undefined;   // :writable público
  private _oArea:            BBox | undefined;      // :writable :private

  // ── new() ───────────────────────────────────────────────────────────────
  // _self.nTotal_Elementos << 0
  // _self.collElementos << hash_table.new()
  // _return _clone → new CElementos()
  constructor() {
    this._nTotal_Elementos = 0;
    this._collElementos    = new Map();
    this._oVentana         = undefined;
    this._oArea            = undefined;
  }

  // ── define_slot_access — getters/setters ────────────────────────────────

  get nTotal_Elementos(): number { return this._nTotal_Elementos; }
  set nTotal_Elementos(v: number) { this._nTotal_Elementos = v; }

  get collElementos(): Map<string, IElementoGrafico> { return this._collElementos; }
  // collElementos << valor
  set collElementos(v: Map<string, IElementoGrafico>) { this._collElementos = v; }

  // oVentana :writable público — canvas/ol source
  get oVentana(): OlCanvas | undefined { return this._oVentana; }
  set oVentana(v: OlCanvas | undefined) { this._oVentana = v; }

  // oArea :writable :private — accesible solo desde _self en Magik
  // En TS lo exponemos vía método dedicado (mantiene la intención de encapsulación)
  setOArea(area: BBox | undefined): void { this._oArea = area; }
  protected get oArea(): BBox | undefined { return this._oArea; }

  // ── Agregar_elemento(RoElemento, RsNombre) ──────────────────────────────
  // _self.collElementos[RsNombre] << RoElemento
  // _self.nTotal_Elementos << _self.nTotal_Elementos + 1
  Agregar_elemento(RoElemento: IElementoGrafico, RsNombre: string): void {
    this._collElementos.set(RsNombre, RoElemento);
    this._nTotal_Elementos += 1;
  }

  // ── obten_elemento(RsNombre) ────────────────────────────────────────────
  // >> _self.collElementos[RsNombre]
  obten_elemento(RsNombre: string): IElementoGrafico | undefined {
    return this._collElementos.get(RsNombre);
  }

  // ── Despliega() ─────────────────────────────────────────────────────────
  // _for LoElemento _over _self.collElementos.fast_elements()
  // _loop
  //   LoElemento.oVentana << _self.oVentana
  //   LoElemento.oArea    << _self.oArea
  //   LoElemento.Actualiza_Area_Elemento()
  //   LoElemento.Despliega()
  // _endloop
  //
  // Asíncrono: cada Despliega() del hijo puede ser sync o async (Promise<void>).
  async Despliega(): Promise<void> {
    for (const LoElemento of this._collElementos.values()) {
      LoElemento.oVentana = this._oVentana;
      LoElemento.oArea    = this._oArea;
      LoElemento.Actualiza_Area_Elemento();
      await Promise.resolve(LoElemento.Despliega());
    }
  }

  // ── init_with(props) ────────────────────────────────────────────────────
  // _try _with cond / _self.perform_private(key.with_chevron, value)
  // _when does_not_understand _endtry → keys desconocidos se ignoran
  initWith(props: Partial<CElementosSerialData>): this {
    if (props.nTotal_Elementos !== undefined) this._nTotal_Elementos = props.nTotal_Elementos;
    if (props.collElementos    !== undefined) this._collElementos    = props.collElementos;
    if (props.oArea            !== undefined) this._oArea            = props.oArea;
    return this;
  }

  // ── new_from_serial(keys, xml_values) ───────────────────────────────────
  // props << property_list.new()
  // _for nr, key _over keys.fast_keys_and_elements() _loop
  //   props[key] << xml_values[nr]
  // _endloop
  // _return _clone.init_with(props)
  static fromSerial(keys: string[], xmlValues: unknown[]): CElementos {
    const props: Record<string, unknown> = {};
    keys.forEach((key, i) => { props[key] = xmlValues[i]; });
    return new CElementos().initWith(props as Partial<CElementosSerialData>);
  }

  // ── serial_slots() ──────────────────────────────────────────────────────
  // keys   << rope.new_with(:nTotal_Elementos, :collElementos, :oArea)
  // values << rope.new_with(.nTotal_Elementos, .collElementos, .oArea)
  // _return keys, values
  serialSlots(): { keys: string[]; values: unknown[] } {
    return {
      keys:   ['nTotal_Elementos', 'collElementos', 'oArea'],
      values: [this._nTotal_Elementos, this._collElementos, this._oArea],
    };
  }

  // ── serial_structure ────────────────────────────────────────────────────
  // >> :slotted
  static serialStructure(): 'slotted' { return 'slotted'; }

  // ── Helpers espaciales (no en magik original) ───────────────────────────
  // Equivalente Turf de oArea como GeoJSON Polygon (útil para chequeos).
  oAreaAsPolygon(): Feature<Polygon> | null {
    if (!this._oArea) return null;
    return turf.bboxPolygon(this._oArea) as Feature<Polygon>;
  }

  // Equivalente OL: añade el rectángulo del oArea al VectorSource para verlo.
  drawOAreaToCanvas(): void {
    if (!this._oVentana || !this._oArea) return;
    const poly = fromExtent(this._oArea);                // ol/geom/Polygon
    this._oVentana.addFeature(new OlFeature({ geometry: poly, kind: 'oArea' }));
  }
}

// ================================================================================
//  Stub: elemento gráfico de demo (implementa IElementoGrafico)
// ================================================================================

export class DemoElementoGrafico implements IElementoGrafico {
  readonly nombre: string;
  oVentana?: OlCanvas;
  oArea?:    BBox;
  bbox?:     BBox;          // resultado tras Actualiza_Area_Elemento()
  desplegado = false;

  constructor(nombre: string) { this.nombre = nombre; }

  // En el magik real, cada hijo recalcula su geometría según el oArea recibido.
  // Aquí: copiamos el oArea como bbox propio (caso trivial).
  Actualiza_Area_Elemento(): void { this.bbox = this.oArea; }

  Despliega(): void {
    this.desplegado = true;
    if (this.oVentana && this.bbox) {
      // Dibuja el bbox del elemento en el canvas OL
      this.oVentana.addFeature(new OlFeature({
        geometry: fromExtent(this.bbox),
        kind:     'elemento',
        nombre:   this.nombre,
      }));
    }
  }
}

// ================================================================================
//  UI de demo — CElementosUI
// ================================================================================

const s = {
  wrap:  { fontFamily: 'monospace', fontSize: 13, padding: 16,
           background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  box:   { background: '#313244', padding: '10px 14px', borderRadius: 6,
           marginBottom: 12 } as React.CSSProperties,
  label: { color: '#a6e3a1', fontWeight: 700, marginBottom: 6,
           display: 'block', fontSize: 12 } as React.CSSProperties,
  row:   { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 },
  btn:   { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
           background: '#89b4fa', color: '#1e1e2e',
           fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  btnDanger: { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
               background: '#f38ba8', color: '#1e1e2e',
               fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  input: { background: '#45475a', color: '#cdd6f4', border: 'none', borderRadius: 4,
           padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
           width: 110 } as React.CSSProperties,
  code:  { background: '#181825', padding: '8px 12px', borderRadius: 4,
           fontSize: 11, color: '#cba6f7', display: 'block',
           marginBottom: 4 } as React.CSSProperties,
  th:    { padding: '4px 12px', color: '#89b4fa',
           borderBottom: '1px solid #45475a', textAlign: 'left' } as React.CSSProperties,
  td:    { padding: '4px 12px', color: '#f9e2af',
           borderBottom: '1px solid #313244' } as React.CSSProperties,
};

export function CElementosUI() {
  // Singleton de demo — un contenedor c_elementos para toda la vista
  const cont = useMemo(() => new CElementos(), []);

  const [tick, setTick]         = useState(0);           // fuerza re-render
  const [nombre, setNombre]     = useState('elem_01');
  const [areaTxt, setAreaTxt]   = useState('0,0,100,80'); // bbox csv
  const [log, setLog]           = useState<string[]>([]);
  const [polyGeo, setPolyGeo]   = useState<Feature<Polygon> | null>(null);

  // Canvas (ol/source/Vector) creado una vez — equivalente a oVentana
  const ventana = useMemo(() => new VectorSource(), []);
  useEffect(() => { cont.oVentana = ventana; }, [cont, ventana]);

  const parseBBox = (txt: string): BBox | null => {
    const p = txt.split(',').map(Number);
    if (p.length !== 4 || p.some(isNaN)) return null;
    return [p[0], p[1], p[2], p[3]];
  };

  const pushLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));

  // ── Agregar_elemento(elem, nombre) ──
  const handleAgregar = () => {
    if (!nombre.trim()) return;
    cont.Agregar_elemento(new DemoElementoGrafico(nombre.trim()), nombre.trim());
    pushLog(`Agregar_elemento("${nombre}") → nTotal=${cont.nTotal_Elementos}`);
    setTick(t => t + 1);
  };

  // ── obten_elemento(nombre) ──
  const handleObten = () => {
    const e = cont.obten_elemento(nombre.trim());
    pushLog(e ? `obten_elemento("${nombre}") → ${(e as DemoElementoGrafico).nombre}`
              : `obten_elemento("${nombre}") → undefined`);
  };

  // ── oArea << bbox; Despliega() ──
  const handleDespliega = async () => {
    const bbox = parseBBox(areaTxt);
    if (!bbox) { pushLog('oArea inválido'); return; }
    cont.setOArea(bbox);
    ventana.clear();
    cont.drawOAreaToCanvas();             // dibuja oArea como rectángulo de referencia
    await cont.Despliega();               // propaga a cada hijo + invoca su Despliega()
    setPolyGeo(cont.oAreaAsPolygon());    // turf bboxPolygon — visualización GeoJSON
    pushLog(`Despliega() → ${cont.nTotal_Elementos} elementos en ol/source/Vector`);
    setTick(t => t + 1);
  };

  // ── serial_slots / fromSerial — demo de redondeo ──
  const handleSerialize = () => {
    const { keys, values } = cont.serialSlots();
    pushLog(`serial_slots() → keys=[${keys.join(', ')}]`);
    const clone = CElementos.fromSerial(keys, values);
    pushLog(`fromSerial() → clon nTotal=${clone.nTotal_Elementos}`);
  };

  const elementos = Array.from(cont.collElementos.entries());
  // (tick referenciado para refrescar el render al mutar el contenedor mutable)
  void tick;

  return (
    <div style={s.wrap}>

      {/* ── new() — estado del contenedor ───────────────────────────────── */}
      <div style={s.box}>
        <span style={s.label}>new() — instancia c_elementos</span>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: '#a6e3a1' }}>nTotal_Elementos:</span>{' '}
          <span style={{ color: '#f9e2af' }}>{cont.nTotal_Elementos}</span>{'  '}
          <span style={{ color: '#a6e3a1' }}>collElementos:</span>{' '}
          <span style={{ color: '#cba6f7' }}>Map({elementos.length})</span>{'  '}
          <span style={{ color: '#a6e3a1' }}>oVentana:</span>{' '}
          <span style={{ color: '#cba6f7' }}>VectorSource({ventana.getFeatures().length} feats)</span>
        </div>
      </div>

      {/* ── Agregar_elemento / obten_elemento ───────────────────────────── */}
      <div style={s.box}>
        <span style={s.label}>Agregar_elemento(RoElemento, RsNombre)</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            nombre:{' '}
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={s.input} />
          </label>
          <button style={s.btn} onClick={handleAgregar}>Agregar_elemento</button>
          <button style={s.btn} onClick={handleObten}>obten_elemento</button>
        </div>
        <code style={s.code}>
          collElementos["{nombre}"] {'<<'} DemoElementoGrafico.new("{nombre}"); nTotal++
        </code>
      </div>

      {/* ── oArea + Despliega() ──────────────────────────────────────────── */}
      <div style={s.box}>
        <span style={s.label}>oArea {'<<'} bbox  /  Despliega()</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            oArea (minX,minY,maxX,maxY):{' '}
            <input value={areaTxt} onChange={e => setAreaTxt(e.target.value)}
              style={{ ...s.input, width: 160 }} />
          </label>
          <button style={s.btn} onClick={handleDespliega}>Despliega()</button>
          <button style={s.btnDanger} onClick={() => { ventana.clear(); setPolyGeo(null); setTick(t => t + 1); }}>
            limpiar canvas
          </button>
        </div>
        <code style={s.code}>
          _for elem _over collElementos.fast_elements() {'→'} elem.oVentana={'<<'}_self.oVentana;
          {' '}elem.oArea={'<<'}_self.oArea; elem.Actualiza_Area_Elemento(); elem.Despliega()
        </code>
        {polyGeo && (
          <div style={{ fontSize: 11, color: '#6c7086', marginTop: 4 }}>
            Turf bboxPolygon (GeoJSON): {polyGeo.geometry.coordinates[0].length - 1} vértices
            {' · '}canvas OL: <span style={{ color: '#cba6f7' }}>
              {ventana.getFeatures().length} features
            </span>
          </div>
        )}
      </div>

      {/* ── Tabla collElementos ──────────────────────────────────────────── */}
      <div style={s.box}>
        <span style={s.label}>collElementos — {elementos.length} entradas</span>
        {elementos.length === 0 ? (
          <div style={{ fontSize: 11, color: '#6c7086' }}>(vacío — usa Agregar_elemento)</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <thead>
              <tr>
                <th style={s.th}>nombre (key)</th>
                <th style={s.th}>bbox propio</th>
                <th style={s.th}>desplegado?</th>
              </tr>
            </thead>
            <tbody>
              {elementos.map(([k, v]) => {
                const e = v as DemoElementoGrafico;
                return (
                  <tr key={k}>
                    <td style={s.td}>{k}</td>
                    <td style={s.td}>{e.bbox ? `[${e.bbox.join(', ')}]` : '—'}</td>
                    <td style={s.td}>{e.desplegado ? '✓' : '✗'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Serialización ────────────────────────────────────────────────── */}
      <div style={s.box}>
        <span style={s.label}>serial_slots / new_from_serial</span>
        <button style={s.btn} onClick={handleSerialize}>serializar + fromSerial</button>
        <div style={{ fontSize: 11, color: '#6c7086', marginTop: 6 }}>
          serial_structure = <span style={{ color: '#cba6f7' }}>
            '{CElementos.serialStructure()}'
          </span>
        </div>
      </div>

      {/* ── Log de actividad ─────────────────────────────────────────────── */}
      {log.length > 0 && (
        <div style={s.box}>
          <span style={s.label}>log</span>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a6adc8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
