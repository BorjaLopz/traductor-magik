// =============================================================================
// MIGRACIÓN: viewport_layout_mixin  →  ViewportLayoutMixin.tsx
// Jerarquía Magik: mixin (no es clase con slots — añade métodos al consumidor)
// Fuente: adiciones_layout/source/viewport_layout_mixin.magik
// GE Network Solutions  ·  Autor: ahernan  ·  05/02/2007
// =============================================================================
//
// Mixin de un solo método (connect_to_viewport_on_page). El consumidor
// debe exponer dos slots: `viewport_id: number | undefined` (read) y
// `viewport: Viewport | undefined` (write).
//
// El método conecta self al viewport recibido SOLO si self no estaba
// ya conectado a uno previamente (viewport_id undefined o <= 0). Si ya
// hay conexión válida (id > 0), el método sale sin hacer nada.
//
// En TS se implementa como mixin function `applyViewportLayoutMixin` —
// el patrón estándar TypeScript para mixins. También se exporta
// `connect_to_viewport_on_page` como helper standalone para usar sin
// composición.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

// Magik: el viewport real es un objeto complejo de Smallworld. Stub mínimo.
export interface Viewport {
  id:    number;
  name?: string;
}

// Magik: a_layout_page → instancia de layout_page. Stub mínimo.
export interface LayoutPage {
  id:    string;
  name?: string;
}

// Interfaz que cualquier clase consumidora del mixin debe cumplir.
export interface ViewportConsumer {
  viewport_id: number | undefined; // read (slot ya presente en el padre)
  viewport:    Viewport | undefined; // write
}

// Constructor genérico para el mixin (patrón TS estándar).
type Constructor<T = object> = new (...args: never[]) => T;

// ---------------------------------------------------------------------------
// Helper standalone — equivale al método del mixin sin composición
// ---------------------------------------------------------------------------

/**
 * connect_to_viewport_on_page(a_layout_page, PoVp)
 *
 * Magik:
 *   _if (id << _self.viewport_id) _isnt _unset _andif (id > 0)
 *   _then _return
 *   _endif
 *   _if PoVp _isnt _unset _then _self.viewport << PoVp _endif
 *
 * En TS: misma lógica, sobre cualquier objeto `self` que cumpla
 * ViewportConsumer. El primer parámetro a_layout_page no se consume en
 * el cuerpo del Magik original — se conserva en la firma por fidelidad.
 *
 * @returns true si se conectó, false si ya estaba conectado (no-op).
 */
export function connect_to_viewport_on_page<T extends ViewportConsumer>(
  self:           T,
  _a_layout_page: LayoutPage,
  PoVp:           Viewport | undefined,
): boolean {
  // Solo conectar si no ha sido ya conectado.
  const id = self.viewport_id;
  if (id !== undefined && id > 0) return false;

  // Conectar self al viewport PoVp.
  if (PoVp !== undefined) {
    self.viewport = PoVp;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Mixin function — añade el método como instance method
// ---------------------------------------------------------------------------

/**
 * Aplica el mixin viewport_layout_mixin sobre una clase base. La base
 * debe cumplir ViewportConsumer (tener viewport_id y viewport).
 *
 * Uso:
 *   class MiLayoutElement extends applyViewportLayoutMixin(BaseClass) {
 *     viewport_id: number | undefined = undefined;
 *     viewport:    Viewport | undefined = undefined;
 *   }
 */
export function applyViewportLayoutMixin<TBase extends Constructor<ViewportConsumer>>(Base: TBase) {
  return class extends Base {
    connect_to_viewport_on_page(a_layout_page: LayoutPage, PoVp: Viewport | undefined): boolean {
      return connect_to_viewport_on_page(this, a_layout_page, PoVp);
    }
  };
}

// ---------------------------------------------------------------------------
// Ejemplo de uso — clase mínima que consume el mixin
// ---------------------------------------------------------------------------

// Base abstracta que cumple ViewportConsumer
class LayoutElementBase implements ViewportConsumer {
  viewport_id: number | undefined  = undefined;
  viewport:    Viewport | undefined = undefined;
  name:        string;

  constructor(name: string) {
    this.name = name;
  }
}

// Subclase con el mixin aplicado
export class ExampleLayoutElement extends applyViewportLayoutMixin(LayoutElementBase) {
  // hereda connect_to_viewport_on_page
}

// =============================================================================
// Componente React — ViewportLayoutMixinUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '210px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  vmuted:{ color: '#fab387' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  pill: (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 8px', borderRadius: 10, fontSize: 10,
    background: ok ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e', marginLeft: 6,
  }),
  pre: {
    background: '#11111b', color: '#bac2de', padding: 10, borderRadius: 4,
    fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap' as const,
    border: '1px solid #45475a', marginTop: 8,
  },
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={styles.v}>{value}</span>
    </div>
  );
}

// Viewports disponibles para conectar
const VIEWPORTS: Viewport[] = [
  { id: 101, name: 'VP_PRINCIPAL' },
  { id: 202, name: 'VP_CROQUIS' },
  { id: 303, name: 'VP_DETALLE' },
];

const PAGE: LayoutPage = { id: 'PAGE_1', name: 'Página 1' };

// Caso de prueba: elemento con viewport_id preexistente vs sin él
interface CasoEnum {
  id:           string;
  label:        string;
  initialVpId:  number | undefined;
}

const CASOS: CasoEnum[] = [
  { id: 'sin-conexion',  label: 'Sin conexión previa (viewport_id = undefined)', initialVpId: undefined },
  { id: 'id-cero',       label: 'viewport_id = 0  (la rama _andif id > 0 no aplica)', initialVpId: 0 },
  { id: 'id-negativo',   label: 'viewport_id = -1 (id <= 0 → sí permite conectar)',  initialVpId: -1 },
  { id: 'ya-conectado',  label: 'Ya conectado (viewport_id = 101)',                  initialVpId: 101 },
];

export function ViewportLayoutMixinUI() {
  const [casoId,  setCasoId]  = useState<string>('sin-conexion');
  const [vpIdx,   setVpIdx]   = useState<number>(0); // índice en VIEWPORTS o -1 para undefined
  const [log,     setLog]     = useState<string[]>([]);
  const [tick,    setTick]    = useState(0);

  const caso = CASOS.find(c => c.id === casoId)!;

  const elemento = useMemo(() => {
    const e = new ExampleLayoutElement('elem_demo');
    e.viewport_id = caso.initialVpId;
    if (caso.initialVpId !== undefined && caso.initialVpId > 0) {
      // simular conexión previa
      e.viewport = VIEWPORTS.find(v => v.id === caso.initialVpId) ?? null!;
    }
    return e;
  }, [casoId, caso.initialVpId]);

  const pushLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));

  const doConnect = () => {
    const vp = vpIdx === -1 ? undefined : VIEWPORTS[vpIdx];
    const conecto = elemento.connect_to_viewport_on_page(PAGE, vp);
    pushLog(
      conecto
        ? `connect → OK (viewport = ${vp?.name}, id=${vp?.id})`
        : `connect → NO-OP (${
            elemento.viewport_id !== undefined && elemento.viewport_id > 0
              ? `ya conectado con id=${elemento.viewport_id}`
              : 'PoVp era undefined'
          })`,
    );
    setTick(t => t + 1);
  };

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          ViewportLayoutMixin
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          mixin de 1 método · connect_to_viewport_on_page
        </span>
      </div>

      {/* Caso inicial */}
      <div style={styles.card}>
        <div style={styles.title}>caso inicial — estado de self.viewport_id</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {CASOS.map(c => (
            <button
              key={c.id}
              onClick={() => { setCasoId(c.id); setLog([]); }}
              style={{
                ...styles.btn,
                background: casoId === c.id ? '#89b4fa' : '#313244',
                color:      casoId === c.id ? '#1e1e2e' : '#bac2de',
                fontSize: 10,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport a conectar (PoVp) */}
      <div style={styles.card}>
        <div style={styles.title}>argumento PoVp (viewport a conectar)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {VIEWPORTS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setVpIdx(i)}
              style={{
                ...styles.btn,
                background: vpIdx === i ? '#a6e3a1' : '#313244',
                color:      vpIdx === i ? '#1e1e2e' : '#bac2de',
              }}
            >
              {v.name} (id={v.id})
            </button>
          ))}
          <button
            onClick={() => setVpIdx(-1)}
            style={{
              ...styles.btn,
              background: vpIdx === -1 ? '#f38ba8' : '#313244',
              color:      vpIdx === -1 ? '#1e1e2e' : '#bac2de',
            }}
          >
            unset (PoVp = undefined)
          </button>
        </div>
      </div>

      {/* Estado actual */}
      <div style={styles.card}>
        <div style={styles.title}>
          estado de ExampleLayoutElement
          <span style={styles.pill(elemento.viewport_id !== undefined && elemento.viewport_id > 0)}>
            {elemento.viewport_id !== undefined && elemento.viewport_id > 0 ? 'CONECTADO' : 'SIN CONEXIÓN'}
          </span>
        </div>
        <Field label="elemento.name"        value={elemento.name} />
        <Field label="elemento.viewport_id" value={String(elemento.viewport_id ?? 'undefined')} />
        <Field
          label="elemento.viewport"
          value={elemento.viewport ? `${elemento.viewport.name} (id=${elemento.viewport.id})` : '— (undefined)'}
        />
      </div>

      {/* Acción */}
      <div style={styles.card}>
        <div style={styles.title}>connect_to_viewport_on_page(page, PoVp)</div>
        <button
          onClick={doConnect}
          style={{ ...styles.btn, background: '#cba6f7', color: '#1e1e2e' }}
        >
          ejecutar
        </button>
        <span style={{ marginLeft: 8, fontSize: 11, color: '#bac2de' }}>
          page = <code>{PAGE.id}</code>  ·  PoVp = {vpIdx === -1 ? 'undefined' : VIEWPORTS[vpIdx].name}
        </span>
        <div style={styles.pre}>
          {`if (self.viewport_id !== undefined && self.viewport_id > 0) return false;
if (PoVp !== undefined) { self.viewport = PoVp; return true; }
return false;`}
        </div>
      </div>

      {/* Log */}
      <div style={styles.card}>
        <div style={styles.title}>log de ejecuciones</div>
        {log.length === 0 ? (
          <div style={{ color: '#585b70', fontSize: 11 }}>— (pulsa ejecutar)</div>
        ) : (
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.includes('NO-OP') ? '#f38ba8' : '#a6e3a1', fontSize: 11 }}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalle del helper */}
      <div style={styles.card}>
        <div style={styles.title}>uso alternativo — helper standalone</div>
        <div style={styles.pre}>
          {`import { connect_to_viewport_on_page } from './ViewportLayoutMixin';

const ok = connect_to_viewport_on_page(self, page, vp);
// equivalente a self.connect_to_viewport_on_page(page, vp) si self
// está compuesto con applyViewportLayoutMixin.`}
        </div>
      </div>
    </div>
  );
}
