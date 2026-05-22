/**
 * Migracion de: cuadro_de_notas_plugin.magik
 * Clase Magik:  cuadro_de_notas_plugin
 * Metodos:      init_actions, build_gui, activate_dialog
 *
 * Intencion:
 *   Registrar la accion del plugin y activar el dialogo "cuadro de notas".
 */

import React, { useCallback, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface DialogDescriptor {
  name: string;
  title: string;
  tabLabel: string;
  maximizable: boolean;
  minimizable: boolean;
  resizable: boolean;
  message: string;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CuadroDeNotasPlugin {
  private dialogCache: Map<string, DialogDescriptor> = new Map();

  // Magik: init_actions()
  async initActions(): Promise<void> {
    // En Magik registra la accion :activate_dialog_cuadro_notas con metadata.
    // En React, la accion se expone via activateDialog().
  }

  // Magik: build_gui(a_frame, xml_element)
  async buildGui(): Promise<DialogDescriptor> {
    const dialog: DialogDescriptor = {
      name: 'cuadro_de_notas',
      title: 'Cuadro de notas',
      tabLabel: 'Cuadro de notas',
      maximizable: false,
      minimizable: true,
      resizable: true,
      message: 'un mensaje',
    };

    return dialog;
  }

  // Magik: activate_dialog(_gather args)
  async activateDialog(): Promise<DialogDescriptor> {
    const name = 'cuadro_de_notas';
    let dialog = this.dialogCache.get(name);

    if (!dialog) {
      dialog = await this.buildGui();
      this.dialogCache.set(name, dialog);
    }

    return dialog;
  }
}

// =============================================================================
// COMPONENTE REACT — demo del dialogo
// =============================================================================

export function CuadroDeNotasPluginUI() {
  const [dialog, setDialog] = useState<DialogDescriptor | null>(null);
  const plugin = useMemo(() => new CuadroDeNotasPlugin(), []);

  const handleOpen = useCallback(async () => {
    await plugin.initActions();
    const d = await plugin.activateDialog();
    setDialog(d);
  }, [plugin]);

  return (
    <div style={s.wrapper}>
      <button style={s.btn} onClick={handleOpen}>Abrir cuadro de notas</button>
      {dialog && (
        <div style={s.dialogShell}>
          <div style={s.dialog}>
            <div style={s.dialogHeader}> {dialog.title} </div>
            <div style={s.dialogBody}>
              <div style={s.meta}>Tab: {dialog.tabLabel}</div>
              <div style={s.meta}>Maximizable: {String(dialog.maximizable)}</div>
              <div style={s.meta}>Minimizable: {String(dialog.minimizable)}</div>
              <div style={s.meta}>Resizable: {String(dialog.resizable)}</div>
              <div style={s.message}>Mensaje: {dialog.message}</div>
              <button style={s.close} onClick={() => setDialog(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 8 },
  btn: { padding: '6px 14px', cursor: 'pointer', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4, width: 220 },
  dialogShell: { position: 'relative', paddingTop: 10 },
  dialog: { border: '1px solid #bbb', borderRadius: 6, background: '#fff', width: 360 },
  dialogHeader: { padding: '8px 12px', background: '#2E4057', color: '#fff', fontSize: 13, borderRadius: '6px 6px 0 0' },
  dialogBody: { padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  meta: { fontSize: 12, color: '#555' },
  message: { fontSize: 12, color: '#333' },
  close: { marginTop: 8, alignSelf: 'flex-start' },
};

export default CuadroDeNotasPluginUI;
