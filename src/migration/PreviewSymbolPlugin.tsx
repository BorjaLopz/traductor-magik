// =============================================================================
// MIGRACIÓN: preview_symbol_plugin  →  PreviewSymbolPlugin.tsx
// Jerarquía Magik: preview_symbol_plugin  extends  :plugin
// Fuente: adiciones_layout/source/preview_symbol_plugin.magik
// =============================================================================
//
// Plugin que aloja el diálogo c_preview_symbol_dialog y expone 4 acciones
// sobre la BD :sigc_style_view:
//   · activate_preview_symbol   → abrir/mostrar el diálogo de preview
//   · open_style_sigc_app       → arrancar :sigc_style_symbol_editor
//   · merge_style_sigc_view     → merge() de la view (requiere escritura)
//   · post_style_sigc_view      → post()  de la view (requiere escritura)
//
// Las 3 últimas se habilitan solo cuando la view es writable Y current_writer
// == "yourself" — lógica de manage_actions().
//
// Notas de migración:
//   · gis_program_manager.databases[:sigc_style_view] → mock StyleViewMock.
//   · :databus_producer_data_types {:symbol_name} → callback prop emitter.
//   · sw_action.new(...) → ActionDef { id, label, image, enabled, description }.
//   · _try ... _when error _endtry → try/catch con throw new Error(...).
//   · Diálogo modal embebido auto-contenido (catálogo SVG, sin dependencias).
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ViewMode = 'write' | 'readonly';

// Equivale a gis_program_manager.databases[:sigc_style_view]
export interface StyleViewMock {
  name: 'sigc_style_view';
  mode: ViewMode;
  writable: boolean;
  current_writer: string | undefined; // _unset → undefined
}

// Magik: sw_action.new(:id, :engine, :image, :action_message)
export interface ActionDef {
  id: ActionId;
  label: string;
  image: string;          // descriptor de icono "module:nombre"
  enabled: boolean;
  description?: string;
}

export type ActionId =
  | 'activate_preview_symbol'
  | 'open_style_sigc_app'
  | 'merge_style_sigc_view'
  | 'post_style_sigc_view';

// Magik :databus_producer_data_types {:symbol_name}
export const DATABUS_PRODUCER_DATA_TYPES = ['symbol_name'] as const;

// ---------------------------------------------------------------------------
// Mensajes (resources/es_mx/messages/preview_symbol_plugin.msg)
// ---------------------------------------------------------------------------

const MESSAGES = {
  frame_title:        'Preview Símbolo',
  tab_title:          'Símbolo',
  msg_db_updated:     'La base de datos de dibujos se ha actualizado',
  err_no_merge:       'No ha sido posible consolidar la base de datos de dibujos',
  err_no_post:        'No ha sido posible propagar la base de datos de dibujos',
  err_try_later:      'Intente más tarde',
  err_db_mode_prefix: 'La base de datos de dibujos esta en modo',
} as const;

// Magik: gis_program_manager.authorisation_view.current_user.name
function getCurrentUser(): string {
  return 'yourself';
}

// ---------------------------------------------------------------------------
// Catálogo de símbolos del diálogo embebido (mock de sw_gis!gis_point_style)
// ---------------------------------------------------------------------------

const CATALOG_SYMBOLS = [
  'gis_point_circle', 'gis_point_square', 'gis_point_triangle',
  'gis_point_diamond', 'gis_point_cross',  'gis_point_arrow',
  'gis_point_star',   'gis_point_terminal','gis_point_hexagon',
] as const;

type CatalogSymbol = typeof CATALOG_SYMBOLS[number];

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de preview_symbol_plugin (subclase de :plugin).
 * Expone estado y acciones. La GUI se delega en PreviewSymbolPluginUI.
 */
export class PreviewSymbolPlugin {
  // ── Slot ─────────────────────────────────────────────────────────────────
  sigc_style_view: StyleViewMock | undefined = undefined;

  // ── def_property (Magik) ─────────────────────────────────────────────────
  x_offset: number = 0;
  y_offset: number = 0;

  // Estado de acciones (resultado de init_actions + manage_actions)
  private _actions: Record<ActionId, ActionDef> = {
    activate_preview_symbol: {
      id: 'activate_preview_symbol',
      label: 'activate_preview_symbol',
      image: 'activate:adiciones_layout',
      enabled: true, // siempre disponible
      description: 'Mostrar la interfaz de preview de símbolo',
    },
    open_style_sigc_app: {
      id: 'open_style_sigc_app',
      label: 'open_sigc_style_symbol_app',
      image: 'app_dibujos:adiciones_layout',
      enabled: false,
      description: 'Arrancar :sigc_style_symbol_editor',
    },
    merge_style_sigc_view: {
      id: 'merge_style_sigc_view',
      label: 'merge_style_sigc_view',
      image: 'merge:version_management_plugin',
      enabled: false,
      description: 'Consolidar cambios en la BD de símbolos',
    },
    post_style_sigc_view: {
      id: 'post_style_sigc_view',
      label: 'post_style_sigc_view',
      image: 'post:version_management_plugin',
      enabled: false,
      description: 'Propagar cambios a la BD de símbolos',
    },
  };

  private _dialogOpen = false;

  // ── init(name, framework) ────────────────────────────────────────────────
  // Magik: super.init + obtiene/abre :sigc_style_view → devuelve self.
  init(_name?: string, _framework?: unknown, styleView?: StyleViewMock): this {
    if (styleView) {
      this.sigc_style_view = styleView;
    } else if (this.sigc_style_view === undefined) {
      // Magik: .sigc_style_view << user:abre_style_sigc()
      this.sigc_style_view = {
        name: 'sigc_style_view',
        mode: 'write',
        writable: true,
        current_writer: 'yourself',
      };
    }
    this.init_actions();
    this.manage_actions();
    return this;
  }

  // ── init_actions() ───────────────────────────────────────────────────────
  // Magik: registra 4 sw_action. En TS las acciones se declaran en el campo
  // _actions; este método se mantiene como hook idempotente.
  init_actions(): void {
    // no-op — registro estático
  }

  // ── manage_actions() ─────────────────────────────────────────────────────
  // Magik: habilita merge/post/open_app solo si writable & writer=="yourself".
  manage_actions(): void {
    const view = this.sigc_style_view;
    const enabled =
      view !== undefined &&
      view.writable &&
      view.current_writer === 'yourself';

    this._actions.open_style_sigc_app.enabled   = enabled;
    this._actions.merge_style_sigc_view.enabled = enabled;
    this._actions.post_style_sigc_view.enabled  = enabled;
  }

  // ── post_activation() ────────────────────────────────────────────────────
  post_activation(): void {
    this.manage_actions();
  }

  action(id: ActionId): ActionDef { return this._actions[id]; }
  actions(): ActionDef[] { return Object.values(this._actions); }

  // ── activate_preview_symbol() ────────────────────────────────────────────
  // Magik: lazy-create + cache + activate_relative_to(...).
  activate_preview_symbol(): { dialogId: 'c_preview_symbol_dialog'; x: number; y: number } {
    this._dialogOpen = true;
    return {
      dialogId: 'c_preview_symbol_dialog',
      x: this.x_offset,
      y: this.y_offset,
    };
  }

  isDialogOpen(): boolean { return this._dialogOpen; }
  closeDialog(): void { this._dialogOpen = false; }

  // ── build_gui(container) ─────────────────────────────────────────────────
  // Magik: construye GUI embebida del diálogo. En TS devuelve el tab label.
  build_gui(): { tabLabel: string } {
    return { tabLabel: MESSAGES.tab_title };
  }

  // ── open_sigc_style_symbol_app() ─────────────────────────────────────────
  // Magik: arranca o reinicia :sigc_style_symbol_editor.
  open_sigc_style_symbol_app(appAlreadyStarted = false):
    { app: 'sigc_style_symbol_editor'; restart: boolean }
  {
    return { app: 'sigc_style_symbol_editor', restart: appAlreadyStarted };
  }

  // ── merge_style_sigc_view() ──────────────────────────────────────────────
  merge_style_sigc_view(): { ok: true; message: string } {
    return this._writeOp('merge');
  }

  // ── post_style_sigc_view() ───────────────────────────────────────────────
  post_style_sigc_view(): { ok: true; message: string } {
    return this._writeOp('post');
  }

  // ── show_message(msg) ────────────────────────────────────────────────────
  // Magik: _self.show_message(...) — hook que la UI puede observar.
  show_message(msg: string): string { return msg; }

  // Implementación común de merge/post — lanza Error si no se cumple la
  // precondición (writable + mode=write). Imita condition.raise(:user_error,...).
  private _writeOp(kind: 'merge' | 'post'): { ok: true; message: string } {
    const view = this.sigc_style_view;
    const modo = view?.mode === 'readonly' ? 'Solo lectura' : 'escritura';
    const writerLine = view?.current_writer
      ? `El usuario ${view.current_writer} se encuentra en escritura`
      : '';
    const errPrefix = kind === 'merge' ? MESSAGES.err_no_merge : MESSAGES.err_no_post;

    if (!view || !view.writable || view.mode !== 'write') {
      throw new Error(
        `${errPrefix}\n${MESSAGES.err_db_mode_prefix} ${modo}\n${writerLine}`.trim(),
      );
    }

    // Magik: .sigc_style_view.merge() / .post() — mock libera al escritor.
    view.current_writer = undefined;
    this.manage_actions();
    return { ok: true, message: this.show_message(MESSAGES.msg_db_updated) };
  }
}

// =============================================================================
// Componente React — PreviewSymbolPluginUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace',
    fontSize: 12,
    background: '#1e1e2e',
    color: '#cdd6f4',
    padding: 16,
    borderRadius: 8,
    minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825',
    border: '1px solid #45475a',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  } as React.CSSProperties,
  cardTitle: {
    color: '#f9e2af',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  } as React.CSSProperties,
  label: { color: '#89dceb', fontSize: 11, marginRight: 6 } as React.CSSProperties,
  value: { color: '#a6e3a1', fontSize: 11 } as React.CSSProperties,
  btn: {
    padding: '5px 12px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  } as React.CSSProperties,
  select: {
    background: '#313244',
    color: '#cdd6f4',
    border: '1px solid #45475a',
    borderRadius: 4,
    padding: '3px 6px',
    fontFamily: 'monospace',
    fontSize: 12,
    marginLeft: 4,
  } as React.CSSProperties,
  numberInput: {
    background: '#313244',
    color: '#cdd6f4',
    border: '1px solid #45475a',
    borderRadius: 4,
    padding: '3px 6px',
    fontFamily: 'monospace',
    fontSize: 12,
    width: 60,
    marginLeft: 4,
  } as React.CSSProperties,
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modalBox: {
    background: '#181825',
    border: '1px solid #45475a',
    borderRadius: 8,
    padding: 20,
    width: 560,
    maxHeight: '80vh',
    overflow: 'auto',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  } as React.CSSProperties,
};

const dot = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: color,
  marginRight: 6,
  verticalAlign: 'middle',
});

function ActionButton({
  action,
  onClick,
}: {
  action: ActionDef;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!action.enabled}
      title={action.description}
      style={{
        ...styles.btn,
        background: action.enabled ? '#89b4fa' : '#313244',
        color: action.enabled ? '#1e1e2e' : '#585b70',
        cursor: action.enabled ? 'pointer' : 'not-allowed',
      }}
    >
      <span style={dot(action.enabled ? '#a6e3a1' : '#f38ba8')} />
      {action.label}
    </button>
  );
}

function SymbolCell({
  name,
  selected,
  onClick,
}: {
  name: CatalogSymbol;
  selected: boolean;
  onClick: () => void;
}) {
  const stroke = selected ? '#89b4fa' : '#a6adc8';
  const bg     = selected ? '#1e3a5a' : '#11111b';
  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: `1px solid ${selected ? '#89b4fa' : '#45475a'}`,
        borderRadius: 6,
        padding: 8,
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <svg width={36} height={36} viewBox="-18 -18 36 36">
        {name.includes('circle')   && <circle r={12} fill="none" stroke={stroke} strokeWidth={2} />}
        {name.includes('square')   && <rect x={-10} y={-10} width={20} height={20} fill="none" stroke={stroke} strokeWidth={2} />}
        {name.includes('triangle') && <polygon points="0,-13 11,8 -11,8" fill="none" stroke={stroke} strokeWidth={2} />}
        {name.includes('diamond')  && <polygon points="0,-13 13,0 0,13 -13,0" fill="none" stroke={stroke} strokeWidth={2} />}
        {name.includes('cross')    && (
          <>
            <line x1={-12} y1={0} x2={12} y2={0} stroke={stroke} strokeWidth={2} />
            <line x1={0} y1={-12} x2={0} y2={12} stroke={stroke} strokeWidth={2} />
          </>
        )}
        {name.includes('arrow')    && <polygon points="0,-13 13,8 0,2 -13,8" fill={stroke} />}
        {name.includes('star')     && <polygon points="0,-13 3,-4 12,-4 5,2 8,12 0,6 -8,12 -5,2 -12,-4 -3,-4" fill={stroke} />}
        {name.includes('terminal') && (
          <>
            <circle r={11} fill="none" stroke={stroke} strokeWidth={2} />
            <line x1={-7} y1={-7} x2={7} y2={7} stroke={stroke} strokeWidth={2} />
            <line x1={7} y1={-7} x2={-7} y2={7} stroke={stroke} strokeWidth={2} />
          </>
        )}
        {name.includes('hexagon')  && <polygon points="0,-13 11,-6 11,6 0,13 -11,6 -11,-6" fill="none" stroke={stroke} strokeWidth={2} />}
      </svg>
      <div style={{ fontSize: 9, color: '#6c7086', marginTop: 2 }}>
        {name.replace('gis_point_', '')}
      </div>
    </div>
  );
}

export function PreviewSymbolPluginUI() {
  const [plugin] = useState(() => new PreviewSymbolPlugin().init());
  const [, setTick] = useState(0);
  const force = useCallback(() => setTick(t => t + 1), []);

  const [log, setLog] = useState<string[]>([]);
  const [emittedSymbol, setEmittedSymbol] = useState<CatalogSymbol | null>(null);
  const [selectedSym, setSelectedSym] = useState<CatalogSymbol>('gis_point_circle');

  const view = plugin.sigc_style_view;
  const actions = plugin.actions();
  const dialogOpen = plugin.isDialogOpen();

  const pushLog = useCallback((msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 24));
  }, []);

  // Controles de la view simulada
  const setMode = (mode: ViewMode) => {
    if (!plugin.sigc_style_view) return;
    plugin.sigc_style_view.mode = mode;
    plugin.sigc_style_view.writable = mode === 'write';
    plugin.manage_actions();
    pushLog(`view.mode = ${mode}  ·  writable = ${mode === 'write'}`);
    force();
  };

  const setCurrentWriter = (writer: 'yourself' | 'other_user' | 'unset') => {
    if (!plugin.sigc_style_view) return;
    plugin.sigc_style_view.current_writer = writer === 'unset' ? undefined : writer;
    plugin.manage_actions();
    pushLog(`current_writer = ${writer}`);
    force();
  };

  const setOffset = (axis: 'x' | 'y', n: number) => {
    if (axis === 'x') plugin.x_offset = n;
    else plugin.y_offset = n;
    force();
  };

  // Dispatcher de acciones (sw_action.action_message)
  const dispatch = (id: ActionId) => {
    try {
      switch (id) {
        case 'activate_preview_symbol': {
          const r = plugin.activate_preview_symbol();
          pushLog(`activate_preview_symbol → ${r.dialogId} @(${r.x},${r.y})`);
          break;
        }
        case 'open_style_sigc_app': {
          const r = plugin.open_sigc_style_symbol_app();
          pushLog(`open_sigc_style_symbol_app → ${r.app} (restart=${r.restart})`);
          break;
        }
        case 'merge_style_sigc_view': {
          const r = plugin.merge_style_sigc_view();
          pushLog(`merge → OK: ${r.message}`);
          break;
        }
        case 'post_style_sigc_view': {
          const r = plugin.post_style_sigc_view();
          pushLog(`post → OK: ${r.message}`);
          break;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pushLog(`ERROR ${id}: ${msg.split('\n')[0]}`);
    }
    force();
  };

  const tabLabel = useMemo(() => plugin.build_gui().tabLabel, [plugin]);

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          PreviewSymbolPlugin
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          :plugin → orquesta c_preview_symbol_dialog + acciones sigc_style_view
        </span>
      </div>

      {/* Estado de la view */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          gis_program_manager.databases[:sigc_style_view]
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 8 }}>
          <span><span style={styles.label}>mode:</span><span style={styles.value}>{view?.mode ?? '—'}</span></span>
          <span><span style={styles.label}>writable:</span><span style={styles.value}>{String(view?.writable ?? false)}</span></span>
          <span><span style={styles.label}>current_writer:</span><span style={styles.value}>{view?.current_writer ?? 'unset'}</span></span>
          <span><span style={styles.label}>current_user:</span><span style={styles.value}>{getCurrentUser()}</span></span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setMode('write')}             style={{ ...styles.btn, background: '#a6e3a1', color: '#1e1e2e' }}>mode=write</button>
          <button onClick={() => setMode('readonly')}          style={{ ...styles.btn, background: '#f38ba8', color: '#1e1e2e' }}>mode=readonly</button>
          <button onClick={() => setCurrentWriter('yourself')} style={{ ...styles.btn, background: '#89b4fa', color: '#1e1e2e' }}>writer=yourself</button>
          <button onClick={() => setCurrentWriter('other_user')} style={{ ...styles.btn, background: '#fab387', color: '#1e1e2e' }}>writer=other_user</button>
          <button onClick={() => setCurrentWriter('unset')}    style={{ ...styles.btn, background: '#585b70', color: '#cdd6f4' }}>writer=unset</button>
        </div>
      </div>

      {/* Propiedades x_offset / y_offset */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          def_property — x_offset / y_offset (posición del diálogo)
        </div>
        <label style={styles.label}>
          x_offset:
          <input
            type="number"
            value={plugin.x_offset}
            onChange={e => setOffset('x', Number(e.target.value))}
            style={styles.numberInput}
          />
        </label>
        <label style={{ ...styles.label, marginLeft: 16 }}>
          y_offset:
          <input
            type="number"
            value={plugin.y_offset}
            onChange={e => setOffset('y', Number(e.target.value))}
            style={styles.numberInput}
          />
        </label>
        <span style={{ ...styles.label, marginLeft: 16 }}>
          build_gui() tab:
        </span>
        <span style={styles.value}>{tabLabel}</span>
      </div>

      {/* Acciones del plugin */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          init_actions() → 4 sw_action  ·  manage_actions() recalcula enabled?
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {actions.map(a => (
            <ActionButton key={a.id} action={a} onClick={() => dispatch(a.id)} />
          ))}
        </div>
        <div style={{ marginTop: 8, color: '#585b70', fontSize: 10 }}>
          databus producer = {DATABUS_PRODUCER_DATA_TYPES.join(', ')}
        </div>
      </div>

      {/* Salida databus consumer */}
      {emittedSymbol && (
        <div style={{ ...styles.card, borderColor: '#a6e3a1' }}>
          <span style={styles.value}>
            databus consumer recibió :symbol_name = <strong>{emittedSymbol}</strong>
          </span>
        </div>
      )}

      {/* Log */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Log de acciones</div>
        {log.length === 0 ? (
          <div style={{ color: '#585b70', fontSize: 11 }}>—</div>
        ) : (
          <div style={{ maxHeight: 160, overflowY: 'auto' }}>
            {log.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.includes('ERROR') ? '#f38ba8' : '#bac2de',
                  fontSize: 11,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo modal (c_preview_symbol_dialog embebido) */}
      {dialogOpen && (
        <div style={styles.modal} onClick={() => { plugin.closeDialog(); force(); }}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: '#cba6f7', fontWeight: 'bold' }}>
                {MESSAGES.frame_title}
                <span style={{ color: '#585b70', fontWeight: 'normal', marginLeft: 8 }}>
                  tab: {tabLabel}  ·  @({plugin.x_offset},{plugin.y_offset})
                </span>
              </span>
              <button
                onClick={() => { plugin.closeDialog(); pushLog('dialog closed'); force(); }}
                style={{ ...styles.btn, background: '#f38ba8', color: '#1e1e2e', marginRight: 0 }}
              >
                cerrar
              </button>
            </div>

            <div style={styles.cardTitle}>
              Catálogo sw_gis!gis_point_style — databus: symbol_name
            </div>
            <div style={styles.grid}>
              {CATALOG_SYMBOLS.map(sym => (
                <SymbolCell
                  key={sym}
                  name={sym}
                  selected={selectedSym === sym}
                  onClick={() => setSelectedSym(sym)}
                />
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '6px 10px', background: '#11111b', borderRadius: 4 }}>
              <span style={styles.label}>symbol_name a publicar:</span>
              <span style={styles.value}>{selectedSym}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => {
                  setEmittedSymbol(selectedSym);
                  pushLog(`databus.make_data_available(:symbol_name, ${selectedSym})`);
                  plugin.closeDialog();
                  force();
                }}
                style={{ ...styles.btn, background: '#a6e3a1', color: '#1e1e2e' }}
              >
                Insertar (databus emit)
              </button>
              <button
                onClick={() => { plugin.closeDialog(); pushLog('dialog closed'); force(); }}
                style={{ ...styles.btn, background: '#585b70', color: '#cdd6f4' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
