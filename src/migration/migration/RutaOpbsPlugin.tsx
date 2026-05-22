/**
 * Migración de: ruta_opbs_plugin.magik
 * Clase Magik:  ruta_opbs_plugin  —  SIGC11 / egomez / 2002
 *
 * Plugin de gestión de diálogo c_opbs.
 * Patrón Magik: plugin con dos slots de contexto (ruta activa + opb activo)
 * y un action que abre/reabre el diálogo c_opbs.
 *
 * En TS:
 *   - Slots → campos privados de clase
 *   - init_actions  → no necesario en React (botón declarado en JSX)
 *   - guiRutaOpb    → toggleDialog(): cierra+recrea si ya abierto, abre si no
 *   - c_opbs        → abstraído como COpbsService (aún no migrado)
 *   - activate_relative_to → posición fija vía CSS (top: 390, left: 250)
 */

import React, { useState, useCallback } from 'react';

// =============================================================================
// TIPOS — contexto GIS (serán las interfaces reales cuando se migren esas clases)
// =============================================================================

/** Magik: oCurrentRuta — ruta de cobre activa en el editor */
export interface RutaCo {
  id    : string | number;
  numero: string;
}

/** Magik: oCurrentOpb — OPB activo seleccionado */
export interface Opb {
  id     : string | number;
  nombre : string;
}

// =============================================================================
// INTERFAZ COpbsService
// Abstrae user:c_opbs.new_dialog() — implementar cuando se migre c_opbs.
// =============================================================================

export interface COpbsService {
  /** Magik: user:c_opbs.new_dialog(top_frame) */
  openDialog(ruta: RutaCo | null, opb: Opb | null): void;
  /** Magik: d.close() */
  closeDialog(): void;
  /** Magik: _self.dialogs.empty() */
  clearCache(): void;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class RutaOpbsPlugin {

  // Magik: {:oCurrentRuta, _unset, :readable, :private}
  #oCurrentRuta : RutaCo | null = null;

  // Magik: {:oCurrentOpb, _unset, :readable, :private}
  #oCurrentOpb  : Opb | null = null;

  readonly #cOpbs: COpbsService;

  // Estado del diálogo activo — equivale a _self.dialogs cache en Magik
  #dialogOpen: boolean = false;

  constructor(cOpbsService: COpbsService) {
    this.#cOpbs = cOpbsService;
  }

  get currentRuta(): RutaCo | null { return this.#oCurrentRuta; }
  get currentOpb (): Opb    | null { return this.#oCurrentOpb;  }

  setCurrentRuta(ruta: RutaCo | null): void { this.#oCurrentRuta = ruta; }
  setCurrentOpb (opb : Opb    | null): void { this.#oCurrentOpb  = opb;  }

  // ---------------------------------------------------------------------------
  // init_actions()
  // Magik: _self.add_action(sw_action.new(:gui_ruta_opb, :action_message, :guiRutaOpb|()|))
  //
  // En React no se registran acciones en tiempo de init — el botón declara
  // el handler directamente en JSX. Método mantenido por paridad de API.
  // ---------------------------------------------------------------------------
  initActions(): void {
    // En Magik: registra gui_ruta_opb como acción del framework GUI.
    // En React: acción expuesta via toggleDialog() — conectar al botón en JSX.
  }

  // ---------------------------------------------------------------------------
  // guiRutaOpb()
  // Magik:
  //   _if (d << _self.get_dialog(name)) _is _unset
  //   _then  d << user:c_opbs.new_dialog(top_frame); _self.cache_dialog(name, d)
  //   _else  d.close(); _self.dialogs.empty()
  //          d << user:c_opbs.new_dialog(top_frame); _self.cache_dialog(name, d)
  //   _endif
  //   d.activate_relative_to("SIGC 11", top_frame, 250, 390)
  //   >> d
  //
  // Patrón: siempre cierra la instancia anterior y crea una nueva.
  // Equivale a un "toggle con reset de estado".
  // ---------------------------------------------------------------------------
  toggleDialog(): void {
    if (this.#dialogOpen) {
      // d.close() + _self.dialogs.empty()
      this.#cOpbs.closeDialog();
      this.#cOpbs.clearCache();
      this.#dialogOpen = false;
    }

    // user:c_opbs.new_dialog(top_frame) + cache_dialog + activate_relative_to
    this.#cOpbs.openDialog(this.#oCurrentRuta, this.#oCurrentOpb);
    this.#dialogOpen = true;
  }
}

// =============================================================================
// COMPONENTE REACT  —  equivale al action gui_ruta_opb + diálogo flotante
// =============================================================================

interface Props {
  cOpbsService : COpbsService;
  initialRuta ?: RutaCo | null;
  initialOpb  ?: Opb    | null;
}

export function RutaOpbsPluginUI({ cOpbsService, initialRuta = null, initialOpb = null }: Props) {

  const [plugin] = useState(() => {
    const p = new RutaOpbsPlugin(cOpbsService);
    p.setCurrentRuta(initialRuta);
    p.setCurrentOpb(initialOpb);
    p.initActions();
    return p;
  });

  // Estado local para reflejar si el diálogo está abierto (para UI del botón)
  const [dialogVisible, setDialogVisible] = useState(false);

  // Magik: guiRutaOpb() → toggle + reopen
  const handleGuiRutaOpb = useCallback(() => {
    plugin.toggleDialog();
    // toggleDialog siempre termina con diálogo abierto (cierra+reabre si estaba abierto)
    setDialogVisible(true);
  }, [plugin]);

  return (
    <div style={s.wrapper}>
      {/* Botón equivalente al action :gui_ruta_opb */}
      <button style={s.btn} onClick={handleGuiRutaOpb}>
        Gestionar OPBs de Ruta
      </button>

      {/* Contexto actual — slots oCurrentRuta / oCurrentOpb */}
      <div style={s.context}>
        <span>Ruta: <strong>{plugin.currentRuta?.numero ?? '—'}</strong></span>
        <span style={{ marginLeft: 16 }}>OPB: <strong>{plugin.currentOpb?.nombre ?? '—'}</strong></span>
      </div>

      {/* Placeholder c_opbs — sustituir por <COpbsDialog /> cuando esté migrado */}
      {dialogVisible && (
        <div style={s.dialogShell}>
          {/* Magik: activate_relative_to("SIGC 11", top_frame, 250, 390) */}
          <div style={s.dialog}>
            <div style={s.dialogHeader}>
              <span>c_opbs — OPBs de Ruta</span>
              <button style={s.close} onClick={() => {
                cOpbsService.closeDialog();
                setDialogVisible(false);
              }}>✕</button>
            </div>
            <div style={s.dialogBody}>
              {/* TODO: sustituir por <COpbsUI /> cuando se migre c_opbs.magik */}
              <p style={{ color: '#888', fontSize: 12 }}>
                [c_opbs — pendiente de migración]
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper     : { display: 'flex', flexDirection: 'column', gap: 8, width: 400, fontFamily: 'sans-serif', fontSize: 13 },
  btn         : { padding: '6px 14px', cursor: 'pointer', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4 },
  context     : { fontSize: 12, color: '#555', padding: '4px 0' },
  dialogShell : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 100 },
  // activate_relative_to("SIGC 11", top_frame, 250, 390) → left:250, top:390
  dialog      : { position: 'absolute', left: 250, top: 390, width: 380, background: '#fff', border: '1px solid #bbb', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  dialogHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#2E4057', color: '#fff', borderRadius: '6px 6px 0 0', fontSize: 13 },
  close       : { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 },
  dialogBody  : { padding: 16, minHeight: 80 },
};

export default RutaOpbsPluginUI;
