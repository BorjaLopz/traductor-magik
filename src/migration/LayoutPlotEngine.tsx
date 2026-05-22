/**
 * Migración de: layout_plot_engine.centraliza_launch
 * Clase Magik:  layout_plot_engine  —  _package sw / bernardoa + team
 *
 * Lanzador de proceso de centralización de plano con guard de instancia única.
 *
 * Magik → TypeScript:
 *   .thread _isnt _unset → _return _false     guard: Promise !== null → return false
 *   enable_interrupt?.default(_false)          param opcional con default false
 *   frame.new / panel.new / label_item.new     callbacks de UI → estado React
 *   button_item(:kill||())                     AbortController + callback onKill
 *   f.position << pos / f.activate()           framePos en estado React (CSS fixed)
 *   plot_proc.fork_at(background_priority)     Promise.resolve().then(...)
 *   .thread.set_name("centralizado_planos")    nombre guardado en propiedad
 *   _return _true                              return true
 *
 * int!do_plot() es el trabajo real — sobreescribir en subclase.
 * El stub simula pasos con delays para la demo.
 */

import React, { useEffect, useRef, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: pixel_coordinate — posición en pantalla del frame de interrupción */
export interface PixelCoordinate {
  x: number;
  y: number;
}

/** Estado observable del motor — lo que el componente React necesita renderizar */
export interface PlotStatus {
  phase    : 'idle' | 'running' | 'done' | 'aborted' | 'error';
  label    : string;
  showFrame: boolean;
  frameTitle?: string;
  framePos  ?: PixelCoordinate;
}

// =============================================================================
// CLASE PRINCIPAL — layout_plot_engine  (método centralizaLaunch)
// =============================================================================

export class LayoutPlotEngine {

  // Magik: .thread slot — _unset en reposo, Promise cuando activo
  private thread          : Promise<void> | null = null;

  // Magik: .frame slot — referencia al frame de interrupción
  // TS: gestionado mediante callbacks de UI en lugar de objeto frame
  private abortController : AbortController | null = null;

  // Magik: .thread.set_name("centralizado_planos") — nombre del thread para monitoring
  readonly threadName = 'centralizado_planos';

  /** Callback de estado — conectar al setState del componente React */
  onStatusChange?: (status: PlotStatus) => void;

  // ---------------------------------------------------------------------------
  // centralizaLaunch(_optional enable_interrupt?, pos)
  //
  // Magik: devuelve _true si lanza correctamente, _false si ya hay thread activo.
  // TS:    devuelve boolean sincrónico (el trabajo corre en background Promise).
  // ---------------------------------------------------------------------------
  centralizaLaunch(
    enableInterrupt = false,          // Magik: enable_interrupt?.default(_false)
    pos            ?: PixelCoordinate, // Magik: pos — pixel_coordinate opcional
  ): boolean {

    // Magik: _if .thread _isnt _unset _then _return _false _endif
    if (this.thread !== null) return false;

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Magik: _if enable_interrupt? _then frame.new / panel.new / label_item.new ...
    // TS: notificar a la UI para que muestre el frame de interrupción
    if (enableInterrupt) {
      this.onStatusChange?.({
        phase    : 'running',
        label    : 'Inicializando...',   // Magik: write_string("Inicializando...")
        showFrame: true,
        frameTitle: 'Centralizando el plano',  // Magik: frame.new("Centralizando el plano")
        framePos : pos,                         // Magik: f.position << pos
      });
    } else {
      this.onStatusChange?.({
        phase    : 'running',
        label    : 'Procesando...',
        showFrame: false,
      });
    }

    // Magik: plot_proc << _proc(owner) owner.int!do_plot() _endproc
    //        .thread << plot_proc.fork_at(_thisthread.background_priority, _self)
    //        .thread.set_name("centralizado_planos")   (bernardoa 18/02/24)
    // TS: Promise diferida — equivalente a fork en background priority
    this.thread = Promise.resolve()
      .then(() => this.intDoPlot(signal))
      .then(() => {
        this.thread          = null;
        this.abortController = null;
        this.onStatusChange?.({ phase: 'done', label: 'Centralización completada.', showFrame: false });
      })
      .catch(err => {
        this.thread          = null;
        this.abortController = null;
        if ((err as DOMException)?.name === 'AbortError') {
          // Magik: kill||() → aborta el thread
          this.onStatusChange?.({ phase: 'aborted', label: 'Centralización interrumpida.', showFrame: false });
        } else {
          this.onStatusChange?.({ phase: 'error', label: `Error: ${(err as Error)?.message ?? err}`, showFrame: false });
        }
      });

    return true;  // Magik: >> _true
  }

  // ---------------------------------------------------------------------------
  // kill||()
  // Magik: método vinculado al botón "Interrumpir Centralización"
  // TS:    AbortController.abort() — propaga AbortError al intDoPlot
  // ---------------------------------------------------------------------------
  kill(): void {
    this.abortController?.abort();
  }

  get isRunning(): boolean {
    return this.thread !== null;
  }

  // ---------------------------------------------------------------------------
  // int!do_plot()  [internal — Magik convención :]
  // Magik: owner.int!do_plot() — trabajo real de centralización.
  // TS:    método protegido sobreescribible. Recibe AbortSignal para cancelación.
  //        Esta implementación simula pasos con delays (demo).
  // ---------------------------------------------------------------------------
  protected async intDoPlot(signal: AbortSignal): Promise<void> {
    const pasos = [
      'Inicializando motor de planos...',
      'Calculando viewports de centralización...',
      'Centralizando geometrías de tramos...',
      'Ajustando escala y orientación...',
      'Aplicando transformaciones al layout...',
      'Finalizando plano centralizado...',
    ];

    for (const paso of pasos) {
      if (signal.aborted) throw new DOMException('Interrumpido por usuario', 'AbortError');
      this.onStatusChange?.({
        phase    : 'running',
        label    : paso,
        showFrame: true,
        frameTitle: 'Centralizando el plano',
      });
      await new Promise<void>(res => setTimeout(res, 800));
    }
  }
}

// =============================================================================
// COMPONENTE REACT — demo del lanzador
// Muestra el guard, el frame de interrupción y el flujo de estados.
// =============================================================================

const STATUS_COLOR: Record<PlotStatus['phase'], string> = {
  idle   : '#888',
  running: '#1565c0',
  done   : '#2e7d32',
  aborted: '#e65100',
  error  : '#c62828',
};

export function LayoutPlotEngineUI() {
  const [status, setStatus]           = useState<PlotStatus>({ phase: 'idle', label: 'En reposo.', showFrame: false });
  const [enableInterrupt, setInterrupt] = useState(true);
  const [usePos, setUsePos]           = useState(false);
  const [launchResult, setLaunchResult] = useState<boolean | null>(null);

  // Motor guardado en ref para que no se recree en cada render
  const engineRef = useRef<LayoutPlotEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new LayoutPlotEngine();
  }
  const engine = engineRef.current;

  useEffect(() => {
    // Conectar callback de estado al setState de React
    engine.onStatusChange = setStatus;
    return () => { engine.onStatusChange = undefined; };
  }, [engine]);

  const handleLaunch = () => {
    // Magik: centralizaLaunch(_optional enable_interrupt?, pos)
    const pos: PixelCoordinate | undefined = usePos ? { x: 80, y: 120 } : undefined;
    const result = engine.centralizaLaunch(enableInterrupt, pos);
    setLaunchResult(result);
    if (!result) {
      // Magik: _return _false — ya hay thread activo
      setTimeout(() => setLaunchResult(null), 2000);
    }
  };

  const handleKill = () => {
    // Magik: button_item(:kill||()) → _self.kill()
    engine.kill();
  };

  return (
    <div style={s.frame}>
      <h3 style={s.title}>layout_plot_engine.centraliza_launch()</h3>
      <p style={s.meta}>
        Lanzador con guard de instancia única.
        <code> .thread _isnt _unset → _return _false</code>.
        Proceso en background — <code>Promise</code> ≡ <code>fork_at(background_priority)</code>.
      </p>

      {/* Controles de lanzamiento */}
      <div style={s.control}>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={enableInterrupt} onChange={e => setInterrupt(e.target.checked)} />
          <code>enable_interrupt?</code> — mostrar frame con botón Interrumpir
        </label>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 16 }}>
          <input type="checkbox" checked={usePos} onChange={e => setUsePos(e.target.checked)} />
          <code>pos</code> — fijar posición del frame (80, 120)
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          style={{ ...s.btn, opacity: status.phase === 'running' ? 0.5 : 1 }}
          onClick={handleLaunch}
          disabled={status.phase === 'running'}
        >
          Lanzar centraliza_launch()
        </button>
        {launchResult === false && (
          <span style={{ color: '#c62828', fontSize: 12, alignSelf: 'center' }}>
            → devuelve <code>_false</code> — thread ya activo (guard activado)
          </span>
        )}
        {launchResult === true && (
          <span style={{ color: '#2e7d32', fontSize: 12, alignSelf: 'center' }}>
            → devuelve <code>_true</code> — lanzado correctamente
          </span>
        )}
      </div>

      {/* Estado del motor */}
      <div style={{ ...s.statusBox, borderColor: STATUS_COLOR[status.phase] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#666' }}>
            thread: <code style={{ color: STATUS_COLOR[status.phase] }}>{engine.threadName}</code>
            {' · '}phase: <strong style={{ color: STATUS_COLOR[status.phase] }}>{status.phase}</strong>
          </span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: STATUS_COLOR[status.phase] }}>
          {status.label}
        </p>
        {status.phase === 'running' && (
          <div style={s.progressBar}>
            <div style={s.progressFill} />
          </div>
        )}
      </div>

      {/* Frame de interrupción — Magik: frame.new("Centralizando el plano") */}
      {status.showFrame && status.phase === 'running' && (
        <div
          style={{
            ...s.interruptFrame,
            ...(usePos && status.framePos
              ? { position: 'fixed', left: status.framePos.x, top: status.framePos.y }
              : { position: 'relative' }),
          }}
        >
          <div style={s.frameTitle}>
            {/* Magik: frame.new("Centralizando el plano") */}
            {status.frameTitle ?? 'Centralizando el plano'}
          </div>
          <div style={{ padding: '8px 12px' }}>
            {/* Magik: .label << label_item.new(p, "Inicializando...") */}
            <p style={{ margin: '0 0 8px', fontSize: 12 }}>{status.label}</p>
            {/* Magik: button_item.new(p, "Interrumpir Centralización", _self, :kill||()) */}
            <button style={{ ...s.btn, background: '#c62828' }} onClick={handleKill}>
              Interrumpir Centralización
            </button>
          </div>
        </div>
      )}

      <p style={{ ...s.meta, marginTop: 8 }}>
        <code>fork_at(background_priority)</code> →{' '}
        <code>Promise.resolve().then(() =&gt; intDoPlot(signal))</code>.
        Thread nombrado <code>"{engine.threadName}"</code> para monitorización.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame        : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title        : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta         : { color: '#666', fontSize: 12, margin: '2px 0' },
  control      : { display: 'flex', alignItems: 'center', padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap', gap: 8 },
  btn          : { padding: '4px 12px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 12 },
  statusBox    : { padding: '8px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' },
  progressBar  : { marginTop: 6, height: 4, background: '#e0e0e0', borderRadius: 2, overflow: 'hidden' },
  progressFill : { height: '100%', width: '60%', background: '#1565c0', borderRadius: 2, animation: 'progress-slide 1.2s ease-in-out infinite' },
  interruptFrame: { border: '2px solid #c62828', borderRadius: 4, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', width: 300, zIndex: 100 },
  frameTitle   : { background: '#2E4057', color: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 'bold', borderRadius: '2px 2px 0 0' },
};

export default LayoutPlotEngineUI;
