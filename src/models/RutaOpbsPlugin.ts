// Source: adiciones_layout/source/ruta_opbs_plugin.magik
//
// Plugin SW que abre el diálogo c_opbs. Comportamiento de ciclo de vida
// DISTINTO al patrón habitual: si el diálogo ya estaba cacheado, lo CIERRA,
// vacía .dialogs y crea uno NUEVO. Posiciona el diálogo con offset (250, 390)
// relativo al top frame.
//
// 2 slots readable: oCurrentRuta, oCurrentOpb (no se asignan en el plugin
// — los rellena el diálogo).

export interface RutaRecord {
  id:     string;
  numero: string;
}

export interface OpbRecord {
  id:     string;
  nombre: string;
}

export interface SwActionDef {
  id:             string;          // :gui_ruta_opb
  enabled:        boolean;
  actionMessage:  string;          // :|guiRutaOpb()|
}

export interface ActivateRelative {
  reference:  string;             // "SIGC 11"
  topFrame:   string;
  xOffset:    number;             // 250
  yOffset:    number;             // 390
}

export interface OpbsDialog {
  id:         string;             // :c_opbs
  topFrame:   string;
  activated:  boolean;
  closed:     boolean;
  position?:  ActivateRelative;
  close(): void;
  activateRelativeTo(reference: string, topFrame: string, x: number, y: number): void;
}

// Magik: user:c_opbs.new_dialog(top_frame)
export function newOpbsDialog(topFrame: string): OpbsDialog {
  const d: OpbsDialog = {
    id:        'c_opbs',
    topFrame,
    activated: false,
    closed:    false,
    close() { this.closed = true; this.activated = false; },
    activateRelativeTo(reference, tf, x, y) {
      this.activated = true;
      this.position  = { reference, topFrame: tf, xOffset: x, yOffset: y };
    },
  };
  return d;
}

interface ActivationLog {
  step:    number;
  action:  'created' | 'closed+recreated';
  dialog:  OpbsDialog;
}

export class RutaOpbsPlugin {
  readonly topFrame = 'top_frame_sigc';

  // Magik: oCurrentRuta / oCurrentOpb — :readable, :private. Asignados por el diálogo.
  private _oCurrentRuta: RutaRecord | undefined;
  private _oCurrentOpb:  OpbRecord  | undefined;

  private readonly _actions: SwActionDef[] = [];
  private readonly _dialogs: Map<string, OpbsDialog> = new Map();
  private readonly _log: ActivationLog[] = [];

  // Magik: ruta_opbs_plugin.init_actions
  initActions(): void {
    this._actions.push({
      id:            'gui_ruta_opb',
      enabled:       true,
      actionMessage: 'guiRutaOpb()',
    });
  }

  // Magik: ruta_opbs_plugin.guiRutaOpb
  // OJO: la lógica del original es CERRAR+VACIAR+CREAR cuando ya existía.
  guiRutaOpb(): OpbsDialog {
    const name = 'c_opbs';
    const cached = this._dialogs.get(name);

    if (cached === undefined) {
      const d = newOpbsDialog(this.topFrame);
      this._dialogs.set(name, d);
      this._log.push({ step: this._log.length + 1, action: 'created', dialog: d });
      d.activateRelativeTo('SIGC 11', this.topFrame, 250, 390);
      return d;
    }

    // Magik: d.close(); _self.dialogs.empty(); d << user:c_opbs.new_dialog(...); cache_dialog(name, d)
    cached.close();
    this._dialogs.clear();
    const fresh = newOpbsDialog(this.topFrame);
    this._dialogs.set(name, fresh);
    this._log.push({ step: this._log.length + 1, action: 'closed+recreated', dialog: fresh });
    fresh.activateRelativeTo('SIGC 11', this.topFrame, 250, 390);
    return fresh;
  }

  // Setters expuestos para simular asignación desde el diálogo
  setCurrentRuta(r: RutaRecord | undefined): void { this._oCurrentRuta = r; }
  setCurrentOpb(o: OpbRecord  | undefined): void { this._oCurrentOpb  = o; }

  get oCurrentRuta(): RutaRecord | undefined { return this._oCurrentRuta; }
  get oCurrentOpb():  OpbRecord  | undefined { return this._oCurrentOpb;  }

  get actions():  readonly SwActionDef[]    { return this._actions; }
  get dialogs():  ReadonlyMap<string, OpbsDialog> { return this._dialogs; }
  get log():      readonly ActivationLog[]  { return this._log; }
}
