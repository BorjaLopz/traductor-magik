// ================================================================================
//  MIGRACIÓN: preview_symbol_plugin.magik → PreviewSymbolPlugin.tsx
//  Clase origen : preview_symbol_plugin  (extends :plugin)
//  Autor orig.  : — (sin fecha)
// ================================================================================

import React, { useState, useEffect, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

/** :write | :readonly — .mode en Magik */
type ViewMode = 'write' | 'readonly';

/** Mock de gis_program_manager.databases[:sigc_style_view] */
export interface SigcStyleView {
  writable: boolean;           // .writable?
  mode: ViewMode;              // .mode → :write | :readonly
  currentWriter: string | null; // gis_program_manager.databases[:sigc_style_view].current_writer
  merge(): void;               // .merge() — consolida cambios (merge_style_sigc_view)
  post(): void;                // .post() — propaga cambios (post_style_sigc_view)
}

/** Estado enabled/disabled de las 4 sw_action registradas en init_actions() */
interface ActionState {
  openStyleSigcApp:   boolean;  // :open_style_sigc_app
  mergeStyleSigcView: boolean;  // :merge_style_sigc_view
  postStyleSigcView:  boolean;  // :post_style_sigc_view
}

// ─── Mock factory ─────────────────────────────────────────────────────────────

function createMockSigcStyleView(writer: string | null): SigcStyleView {
  return {
    writable: writer !== null,
    mode: 'write',
    currentWriter: writer,
    merge() { /* no-op mock */ },
    post()  { /* no-op mock */ },
  };
}

// ─── PreviewSymbolPlugin ──────────────────────────────────────────────────────

export class PreviewSymbolPlugin {
  // Slot: .sigc_style_view — cargado en init()
  private _sigcStyleView: SigcStyleView | null = null;

  // def_property :x_offset / :y_offset — desplazamiento del diálogo
  xOffset: number = 0;
  yOffset: number = 0;

  // databus_producer_data_types → { :symbol_name }
  static readonly databusProsumerDataTypes = ['symbol_name'] as const;

  // Estado interno de acciones (sw_action.enabled?)
  actions: ActionState = {
    openStyleSigcApp:   false,
    mergeStyleSigcView: false,
    postStyleSigcView:  false,
  };

  private _dialogOpen: boolean = false;
  private _statusMessage: string = '';
  private _onStateChange?: () => void;

  constructor(onStateChange?: () => void) {
    this._onStateChange = onStateChange;
  }

  // ── init(name, framework) ─────────────────────────────────────────────────
  // Carga sigc_style_view desde gis_program_manager.databases o vía abre_style_sigc()
  init(_name = 'preview_symbol_plugin'): this {
    const dbView = this._getDbStyleView();
    // gis_program_manager.databases[:sigc_style_view] _is _unset ?
    this._sigcStyleView = dbView ?? this._abreStyleSigc();
    return this;
  }

  get sigcStyleView(): SigcStyleView | null { return this._sigcStyleView; }

  // Permite reemplazar la vista mock desde la UI
  setSigcStyleView(v: SigcStyleView): void {
    this._sigcStyleView = v;
    this._notify();
  }

  // ── activate_preview_symbol() ─────────────────────────────────────────────
  // Obtiene/crea c_preview_symbol_dialog y llama activate_relative_to()
  activatePreviewSymbol(): void {
    this._dialogOpen = true;
    this._notify();
  }

  get dialogOpen(): boolean { return this._dialogOpen; }

  closeDialog(): void {
    this._dialogOpen = false;
    this._notify();
  }

  // ── post_activation() ────────────────────────────────────────────────────
  // Llamado tras activar el plugin; gestiona el estado de las acciones
  postActivation(): void {
    this.manageActions();
  }

  // ── manage_actions() ─────────────────────────────────────────────────────
  // Habilita acciones si: sigcStyleView != null && writable? && writer = "yourself"
  manageActions(): void {
    const v = this._sigcStyleView;
    const canWrite =
      v !== null &&
      v.writable &&
      v.currentWriter === 'yourself'; // current_writer = "yourself" en Magik

    this.actions = {
      openStyleSigcApp:   canWrite,
      mergeStyleSigcView: canWrite,
      postStyleSigcView:  canWrite,
    };
    this._notify();
  }

  // ── merge_style_sigc_view() ───────────────────────────────────────────────
  // Consolida cambios en la BD de símbolos sigc
  // _try → try/catch; condition.raise(:user_error) → devuelve mensaje de error
  mergeStyleSigcView(): string {
    const v = this._sigcStyleView;
    const modeLabel  = v?.mode === 'readonly' ? 'Solo lectura' : 'escritura';
    const writerMsg  = v?.currentWriter
      ? `El usuario ${v.currentWriter} se encuentra en escritura` : '';

    try {
      if (v !== null && v.writable && v.mode === 'write') {
        v.merge();
        return this._setStatus('La base de datos de dibujos se ha actualizado');
      }
      throw new Error('no_write');
    } catch {
      return this._setStatus(
        ['No ha sido posible consolidar la base de datos de dibujos',
         `La base de datos de dibujos esta en modo ${modeLabel}`,
         writerMsg].filter(Boolean).join('\n'),
        true
      );
    }
  }

  // ── post_style_sigc_view() ────────────────────────────────────────────────
  // Propaga cambios en la BD de símbolos sigc
  postStyleSigcView(): string {
    const v = this._sigcStyleView;
    const modeLabel  = v?.mode === 'readonly' ? 'Solo lectura' : 'escritura';
    const writerMsg  = v?.currentWriter
      ? `El usuario ${v.currentWriter} se encuentra en escritura` : '';

    try {
      if (v !== null && v.writable && v.mode === 'write') {
        v.post();
        return this._setStatus('La base de datos de dibujos se ha actualizado');
      }
      throw new Error('no_write');
    } catch {
      return this._setStatus(
        ['No ha sido posible propagar la base de datos de dibujos',
         `La base de datos de dibujos esta en modo ${modeLabel}`,
         writerMsg].filter(Boolean).join('\n'),
        true
      );
    }
  }

  // ── open_sigc_style_symbol_app() ──────────────────────────────────────────
  // smallworld_product.application_definition(:sigc_style_symbol_editor).start/restart
  openSigcStyleSymbolApp(): string {
    return this._setStatus('[Mock] sigc_style_symbol_editor: aplicación iniciada/reiniciada');
  }

  get statusMessage(): string { return this._statusMessage; }
  get statusIsError(): boolean {
    return this._statusMessage.startsWith('No ha sido posible');
  }

  clearStatus(): void { this._statusMessage = ''; this._notify(); }

  // ── privados ──────────────────────────────────────────────────────────────

  // gis_program_manager.databases[:sigc_style_view]
  private _getDbStyleView(): SigcStyleView | null {
    return createMockSigcStyleView('yourself');
  }

  // user:abre_style_sigc() — fallback cuando el DB no está registrado
  private _abreStyleSigc(): SigcStyleView {
    return createMockSigcStyleView('yourself');
  }

  private _setStatus(msg: string, _isError = false): string {
    this._statusMessage = msg;
    this._notify();
    return msg;
  }

  private _notify(): void { this._onStateChange?.(); }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = {
  wrap:   { fontFamily: 'monospace', fontSize: 13, padding: 16,
            background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  box:    { background: '#313244', padding: '10px 14px', borderRadius: 6,
            marginBottom: 12 } as React.CSSProperties,
  label:  { color: '#a6e3a1', fontWeight: 700, marginBottom: 6,
            display: 'block', fontSize: 12 } as React.CSSProperties,
  row:    { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 },
  btn: (enabled: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 4, border: 'none',
    cursor: enabled ? 'pointer' : 'not-allowed', fontFamily: 'monospace', fontSize: 12,
    background: enabled ? '#89b4fa' : '#45475a',
    color: enabled ? '#1e1e2e' : '#6c7086',
  }),
  badge: (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 7px', borderRadius: 10, fontSize: 10,
    background: ok ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e', marginLeft: 6,
  }),
  msg: (err: boolean): React.CSSProperties => ({
    background: err ? '#45263a' : '#1e3a2a',
    border: `1px solid ${err ? '#f38ba8' : '#a6e3a1'}`,
    color: err ? '#f38ba8' : '#a6e3a1',
    padding: '6px 12px', borderRadius: 4, whiteSpace: 'pre-wrap',
  }),
  modal:    { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: '#313244', borderRadius: 8, padding: 24, width: 540,
              maxHeight: '80vh', overflow: 'auto' } as React.CSSProperties,
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 } as React.CSSProperties,
  select:   { background: '#45475a', color: '#cdd6f4', border: 'none',
              borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace' } as React.CSSProperties,
  input:    { background: '#45475a', color: '#cdd6f4', border: 'none',
              borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', width: 110 } as React.CSSProperties,
};

// ─── Mini SVG para el catálogo de símbolos en el diálogo ─────────────────────

const CATALOG_SYMBOLS = [
  'gis_point_circle', 'gis_point_square', 'gis_point_triangle',
  'gis_point_diamond', 'gis_point_cross',  'gis_point_arrow',
  'gis_point_star',   'gis_point_terminal','gis_point_hexagon',
];

function SymbolCell({ name, selected, onClick }: {
  name: string; selected: boolean; onClick: () => void;
}) {
  const c = selected ? '#89b4fa' : '#a6adc8';
  const bg = selected ? '#1e3a5a' : '#181825';
  return (
    <div onClick={onClick}
      style={{ background: bg, border: `1px solid ${selected ? '#89b4fa' : '#45475a'}`,
               borderRadius: 6, padding: 8, textAlign: 'center', cursor: 'pointer' }}>
      <svg width={36} height={36} viewBox="-18 -18 36 36">
        {name.includes('circle')   && <circle r="12" fill="none" stroke={c} strokeWidth="2"/>}
        {name.includes('square')   && <rect x="-10" y="-10" width="20" height="20" fill="none" stroke={c} strokeWidth="2"/>}
        {name.includes('triangle') && <polygon points="0,-13 11,8 -11,8" fill="none" stroke={c} strokeWidth="2"/>}
        {name.includes('diamond')  && <polygon points="0,-13 13,0 0,13 -13,0" fill="none" stroke={c} strokeWidth="2"/>}
        {name.includes('cross')    && <><line x1="-12" y1="0" x2="12" y2="0" stroke={c} strokeWidth="2"/><line x1="0" y1="-12" x2="0" y2="12" stroke={c} strokeWidth="2"/></>}
        {name.includes('arrow')    && <polygon points="0,-13 13,8 0,2 -13,8" fill={c}/>}
        {name.includes('star')     && <polygon points="0,-13 3,-4 12,-4 5,2 8,12 0,6 -8,12 -5,2 -12,-4 -3,-4" fill={c}/>}
        {name.includes('terminal') && <><circle r="11" fill="none" stroke={c} strokeWidth="2"/><line x1="-7" y1="-7" x2="7" y2="7" stroke={c} strokeWidth="2"/><line x1="7" y1="-7" x2="-7" y2="7" stroke={c} strokeWidth="2"/></>}
        {name.includes('hexagon')  && <polygon points="0,-13 11,-6 11,6 0,13 -11,6 -11,-6" fill="none" stroke={c} strokeWidth="2"/>}
      </svg>
      <div style={{ fontSize: 9, color: '#6c7086', marginTop: 2 }}>{name.replace('gis_point_', '')}</div>
    </div>
  );
}

// ─── Componente principal UI ──────────────────────────────────────────────────

export function PreviewSymbolPluginUI() {
  const [tick, setTick] = useState(0);
  const plugin = useMemo(() => {
    const p = new PreviewSymbolPlugin(() => setTick(n => n + 1));
    p.init();
    p.postActivation(); // → manage_actions()
    return p;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controles de la vista mock
  const [viewMode,     setViewMode]     = useState<ViewMode>('write');
  const [isWritable,   setIsWritable]   = useState(true);
  const [writerInput,  setWriterInput]  = useState('yourself');
  const [selectedSym,  setSelectedSym]  = useState('gis_point_circle');

  // Sincroniza estado mock → plugin cuando cambian los controles
  useEffect(() => {
    const v = plugin.sigcStyleView;
    if (!v) return;
    (v as any).mode          = viewMode;
    (v as any).writable      = isWritable;
    (v as any).currentWriter = writerInput.trim() || null;
    plugin.manageActions();
  }, [viewMode, isWritable, writerInput, plugin, tick]);

  const { actions } = plugin;

  return (
    <div style={s.wrap}>

      {/* ── sigc_style_view: controles del estado mock ── */}
      <div style={s.box}>
        <span style={s.label}>sigc_style_view — estado de la vista de estilos GIS</span>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 12 }}>
            .mode:{' '}
            <select value={viewMode} onChange={e => setViewMode(e.target.value as ViewMode)} style={s.select}>
              <option value="write">:write</option>
              <option value="readonly">:readonly</option>
            </select>
          </label>
          <label style={{ fontSize: 12 }}>
            <input type="checkbox" checked={isWritable} onChange={e => setIsWritable(e.target.checked)} />{' '}
            .writable?
          </label>
          <label style={{ fontSize: 12 }}>
            current_writer:{' '}
            <input value={writerInput} onChange={e => setWriterInput(e.target.value)} style={s.input} />
          </label>
        </div>
        <div style={{ fontSize: 11, color: '#6c7086', marginTop: 6 }}>
          Condición <b>manage_actions</b>: writable &amp;&amp; mode=write &amp;&amp; current_writer="yourself"
          {' → '}<b style={{ color: actions.openStyleSigcApp ? '#a6e3a1' : '#f38ba8' }}>
            {actions.openStyleSigcApp ? 'acciones HABILITADAS' : 'acciones DESHABILITADAS'}
          </b>
        </div>
      </div>

      {/* ── init_actions() — los 4 sw_action ── */}
      <div style={s.box}>
        <span style={s.label}>init_actions() — sw_action registradas</span>
        <div style={s.row}>
          {/* :activate_preview_symbol — siempre habilitada */}
          <button style={s.btn(true)} onClick={() => plugin.activatePreviewSymbol()}>
            activate_preview_symbol
          </button>

          {/* :open_style_sigc_app */}
          <button style={s.btn(actions.openStyleSigcApp)}
            disabled={!actions.openStyleSigcApp}
            onClick={() => plugin.openSigcStyleSymbolApp()}>
            open_sigc_style_symbol_app
            <span style={s.badge(actions.openStyleSigcApp)}>
              {actions.openStyleSigcApp ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* :merge_style_sigc_view */}
          <button style={s.btn(actions.mergeStyleSigcView)}
            disabled={!actions.mergeStyleSigcView}
            onClick={() => plugin.mergeStyleSigcView()}>
            merge_style_sigc_view
            <span style={s.badge(actions.mergeStyleSigcView)}>
              {actions.mergeStyleSigcView ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* :post_style_sigc_view */}
          <button style={s.btn(actions.postStyleSigcView)}
            disabled={!actions.postStyleSigcView}
            onClick={() => plugin.postStyleSigcView()}>
            post_style_sigc_view
            <span style={s.badge(actions.postStyleSigcView)}>
              {actions.postStyleSigcView ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Propiedades del plugin ── */}
      <div style={s.box}>
        <span style={s.label}>def_property — x_offset / y_offset (posición del diálogo)</span>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <label>
            x_offset:{' '}
            <input type="number" value={plugin.xOffset}
              onChange={e => { plugin.xOffset = Number(e.target.value); setTick(n => n + 1); }}
              style={{ ...s.input, width: 60 }} />
          </label>
          <label>
            y_offset:{' '}
            <input type="number" value={plugin.yOffset}
              onChange={e => { plugin.yOffset = Number(e.target.value); setTick(n => n + 1); }}
              style={{ ...s.input, width: 60 }} />
          </label>
        </div>
      </div>

      {/* ── show_message / condition.raise ── */}
      {plugin.statusMessage && (
        <div style={{ marginBottom: 12 }}>
          <span style={s.label}>show_message / condition.raise(:user_error)</span>
          <div style={s.msg(plugin.statusIsError)}>{plugin.statusMessage}</div>
          <button style={{ ...s.btn(true), marginTop: 4 }} onClick={() => plugin.clearStatus()}>
            Cerrar
          </button>
        </div>
      )}

      {/* ── Modal: c_preview_symbol_dialog ── */}
      {plugin.dialogOpen && (
        <div style={s.modal} onClick={() => plugin.closeDialog()}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h4 style={{ margin: '0 0 4px', color: '#89b4fa', fontSize: 15 }}>
              c_preview_symbol_dialog
            </h4>
            <p style={{ fontSize: 11, color: '#6c7086', margin: '0 0 14px' }}>
              activate_relative_to(frame_title, top_frame,
              x_offset={plugin.xOffset}, y_offset={plugin.yOffset})
            </p>

            {/* build_embedded_gui: catálogo de símbolos */}
            <span style={s.label}>Catálogo sw_gis!gis_point_style — databus: symbol_name</span>
            <div style={s.grid}>
              {CATALOG_SYMBOLS.map(sym => (
                <SymbolCell key={sym} name={sym} selected={selectedSym === sym}
                  onClick={() => setSelectedSym(sym)} />
              ))}
            </div>

            <div style={{ ...s.box, margin: '12px 0 0' }}>
              <b style={{ fontSize: 12 }}>symbol_name publicado en databus:</b>{' '}
              <span style={{ color: '#f9e2af' }}>{selectedSym}</span>
            </div>

            <div style={{ ...s.row, marginTop: 12 }}>
              <button style={s.btn(true)} onClick={() => plugin.closeDialog()}>Cerrar diálogo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
