/**
 * Migración de: viewport_layout_mixin.magik  (_package sw)
 * Método:  viewport_layout_mixin.connect_to_viewport_on_page
 * Autor original: ahernan / rbsaldan  —  SIGC11 / 2005-2007
 *
 * Mixin de layout para elementos que se conectan a un viewport de plano.
 * Este fichero modela la interfaz del mixin y su método de conexión guardada.
 *
 * NOTA: a_layout_page se recibe como parámetro pero NO se usa en el cuerpo
 * del método original — se mantiene en la firma por fidelidad al API Magik.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: viewport — objeto del Layout Designer al que se conecta el elemento */
export interface Viewport {
  id  : number;
  name: string;
}

/** Magik: a_layout_page — página activa del Layout Designer (no usada en el método) */
export interface LayoutPage {
  id  : number;
  name: string;
}

/**
 * Magik: viewport_layout_mixin
 * Interfaz que deben implementar los elementos de layout conectables a viewport.
 * Corresponde a los slots viewport_id y viewport del mixin de Smallworld.
 */
export interface IViewportLayoutMixin {
  /** Magik: _self.viewport_id — id del viewport asignado (_unset o > 0 si conectado) */
  viewportId: number | null;

  /** Magik: _self.viewport — referencia al viewport asignado */
  viewport  : Viewport | null;
}

// =============================================================================
// CLASE MIXIN
// =============================================================================

export class ViewportLayoutMixin implements IViewportLayoutMixin {

  viewportId: number | null = null;   // Magik: {:viewport_id, _unset}
  viewport  : Viewport | null = null; // Magik: {:viewport, _unset}

  // ---------------------------------------------------------------------------
  // connect_to_viewport_on_page(a_layout_page, PoVp)
  //
  // Magik:
  //   _if ( id << _self.viewport_id ) _isnt _unset _andif ( id > 0 )
  //   _then _return _endif          ← ya conectado, no hacer nada
  //
  //   _if PoVp _isnt _unset
  //   _then _self.viewport << PoVp  ← conectar
  //   _endif
  //
  // a_layout_page: recibido pero no utilizado (fidelidad al API original).
  // ---------------------------------------------------------------------------
  connectToViewportOnPage(
    _layoutPage: LayoutPage | null,   // a_layout_page — no usado en el cuerpo
    viewport   : Viewport    | null,  // PoVp
  ): void {
    // Guard: ya conectado (_self.viewport_id _isnt _unset _andif id > 0)
    const id = this.viewportId;
    if (id !== null && id !== undefined && id > 0) return;

    // Conectar si se proporcionó un viewport (_if PoVp _isnt _unset)
    if (viewport !== null && viewport !== undefined) {
      this.viewport   = viewport;
      this.viewportId = viewport.id;   // sincroniza viewport_id al conectar
    }
  }
}

// =============================================================================
// COMPONENTE REACT  —  demo del mixin
// Muestra una lista de elementos de layout y permite conectarlos a un viewport.
// =============================================================================

interface ElementoLayout extends IViewportLayoutMixin {
  nombre: string;
  instancia: ViewportLayoutMixin;
}

const VIEWPORTS_DISPONIBLES: Viewport[] = [
  { id: 1, name: 'VP-Norte' },
  { id: 2, name: 'VP-Sur'   },
  { id: 3, name: 'VP-Centro'},
];

const PAGE_ACTIVA: LayoutPage = { id: 10, name: 'Página A3 - Plano Red' };

export function ViewportLayoutMixinUI() {
  const [elementos, setElementos] = useState<ElementoLayout[]>(() => [
    { nombre: 'Elemento Empalme A',   viewportId: null, viewport: null, instancia: new ViewportLayoutMixin() },
    { nombre: 'Elemento Sección B',   viewportId: 2,    viewport: VIEWPORTS_DISPONIBLES[1], instancia: (() => { const m = new ViewportLayoutMixin(); m.viewportId = 2; m.viewport = VIEWPORTS_DISPONIBLES[1]; return m; })() },
    { nombre: 'Elemento Nodo C',      viewportId: null, viewport: null, instancia: new ViewportLayoutMixin() },
    { nombre: 'Elemento Empalme D',   viewportId: 0,    viewport: null, instancia: (() => { const m = new ViewportLayoutMixin(); m.viewportId = 0; return m; })() },
  ]);

  const [vpSeleccionado, setVpSeleccionado] = useState<number>(1);

  const conectar = (idx: number) => {
    const vp = VIEWPORTS_DISPONIBLES.find(v => v.id === vpSeleccionado) ?? null;
    const inst = elementos[idx].instancia;
    inst.connectToViewportOnPage(PAGE_ACTIVA, vp);

    setElementos(prev => prev.map((e, i) =>
      i === idx
        ? { ...e, viewportId: inst.viewportId, viewport: inst.viewport }
        : e
    ));
  };

  const resetear = (idx: number) => {
    elementos[idx].instancia.viewportId = null;
    elementos[idx].instancia.viewport   = null;
    setElementos(prev => prev.map((e, i) =>
      i === idx ? { ...e, viewportId: null, viewport: null } : e
    ));
  };

  const yaConectado = (e: ElementoLayout) =>
    e.viewportId !== null && e.viewportId !== undefined && e.viewportId > 0;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>viewport_layout_mixin.connect_to_viewport_on_page</h3>
      <p style={s.meta}>
        Página activa: <strong>{PAGE_ACTIVA.name}</strong> (parámetro recibido pero no usado).
      </p>

      <div style={s.control}>
        <label style={{ fontSize: 12 }}>
          Viewport destino:{' '}
          <select
            value={vpSeleccionado}
            onChange={e => setVpSeleccionado(Number(e.target.value))}
            style={{ marginLeft: 6 }}
          >
            {VIEWPORTS_DISPONIBLES.map(vp => (
              <option key={vp.id} value={vp.id}>{vp.name}</option>
            ))}
          </select>
        </label>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['Elemento', 'viewport_id', 'viewport', 'Estado', 'Acción'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elementos.map((e, i) => (
            <tr key={i} style={{ background: yaConectado(e) ? '#e8f5e9' : i % 2 === 0 ? '#f8f8f8' : '#fff' }}>
              <td style={s.td}>{e.nombre}</td>
              <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>
                {e.viewportId ?? '_unset'}
              </td>
              <td style={s.td}>{e.viewport?.name ?? '—'}</td>
              <td style={{ ...s.td, textAlign: 'center' }}>
                {yaConectado(e)
                  ? <span style={{ color: '#2e7d32' }}>✔ Conectado</span>
                  : <span style={{ color: '#888' }}>Sin conectar</span>}
              </td>
              <td style={s.td}>
                <button
                  style={{ ...s.btn, opacity: yaConectado(e) ? 0.4 : 1 }}
                  onClick={() => conectar(i)}
                  title={yaConectado(e) ? 'Ya conectado — guard activo' : 'Conectar'}
                >
                  Conectar
                </button>
                {' '}
                <button style={{ ...s.btn, background: '#888' }} onClick={() => resetear(i)}>
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Los elementos con <code>viewport_id &gt; 0</code> ignoran la llamada (guard activo).
        Los que tienen <code>viewport_id = 0</code> o <code>_unset</code> se conectan.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde' },
  table  : { width: '100%', borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '6px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '6px 10px', borderBottom: '1px solid #eee', fontSize: 12 },
  btn    : { padding: '3px 10px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 11 },
};

export default ViewportLayoutMixinUI;
