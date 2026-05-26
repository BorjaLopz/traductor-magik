// Source: adiciones_layout/source/cuadro_de_notas_plugin.magik
//
// Plugin SW que registra una acción :activate_dialog_cuadro_notas, construye
// el panel GUI mediante cuadro_de_notas_framework y cachea el diálogo entre
// activaciones (idempotente: si ya existe en cache, lo reutiliza).

export interface SwActionDef {
  id:             string;                 // :activate_dialog_cuadro_notas
  caption:        string;                 // _self.message(:caption)
  shortHelpText:  string;                 // _self.message(:short_help_text)
  image:          [string, string];       // {:cuadro_de_notas, _self.module_name}
  actionMessage:  string;                 // :|activate_dialog()|
}

export interface CuadroDeNotasFrameworkOpts {
  guiDefinitionModuleName:    string;     // :sigc_11_9_1_iteracion_2
  guiDefinitionFileName:      string;     // "gui.xml"
  configDefinitionModuleName: string;     // :sigc_11_9_1_iteracion_2
  configDefinitionFileName:   string;     // "config.xml"
}

// Magik: cuadro_de_notas_framework
export interface CuadroDeNotasFramework {
  title:        string;
  tabLabel:     string;
  maximizable:  boolean;
  minimizable:  boolean;
  resizable:    boolean;
  activated:    boolean;
  activationMessage?: string;
  buildGui(frame: string, xmlElement?: string): string; // devuelve a_panel
  activate(topFrame: string, message: string): void;
}

export interface Messages {
  caption:         string;
  shortHelpText:   string;
  frameworkTitle:  string;
  tabTitle:        string;
}

const DEFAULT_MESSAGES: Messages = {
  caption:        'Cuadro de notas',
  shortHelpText:  'Abrir cuadro de notas del plano',
  frameworkTitle: 'Cuadro de Notas',
  tabTitle:       'Notas',
};

const FRAMEWORK_OPTS: CuadroDeNotasFrameworkOpts = {
  guiDefinitionModuleName:    'sigc_11_9_1_iteracion_2',
  guiDefinitionFileName:      'gui.xml',
  configDefinitionModuleName: 'sigc_11_9_1_iteracion_2',
  configDefinitionFileName:   'config.xml',
};

// Magik: cuadro_de_notas_framework.new(...) — fábrica mock para el demo.
export function createCuadroDeNotasFramework(
  title: string,
  opts:  CuadroDeNotasFrameworkOpts = FRAMEWORK_OPTS,
): CuadroDeNotasFramework {
  const fw: CuadroDeNotasFramework = {
    title,
    tabLabel:    '',
    maximizable: true,
    minimizable: true,
    resizable:   true,
    activated:   false,
    buildGui(frame, xmlElement) {
      return `panel(${frame},${xmlElement ?? '_unset'},mod=${opts.guiDefinitionModuleName},gui=${opts.guiDefinitionFileName})`;
    },
    activate(_topFrame, message) {
      this.activated = true;
      this.activationMessage = message;
    },
  };
  return fw;
}

export class CuadroDeNotasPlugin {
  readonly moduleName = 'adiciones_layout';
  readonly topFrame   = 'top_frame_main';

  private readonly _actions: SwActionDef[] = [];
  private readonly _dialogCache: Map<string, CuadroDeNotasFramework> = new Map();
  private readonly _messages: Messages;

  constructor(messages: Messages = DEFAULT_MESSAGES) {
    this._messages = messages;
  }

  // Magik: cuadro_de_notas_plugin.init_actions
  initActions(): void {
    this.addAction({
      id:            'activate_dialog_cuadro_notas',
      caption:       this._messages.caption,
      shortHelpText: this._messages.shortHelpText,
      image:         ['cuadro_de_notas', this.moduleName],
      actionMessage: 'activate_dialog()',
    });
  }

  // Magik: cuadro_de_notas_plugin.build_gui(a_frame, _optional xml_element)
  buildGui(aFrame: string, xmlElement?: string): { panel: string; framework: CuadroDeNotasFramework } {
    const d = createCuadroDeNotasFramework(this._messages.frameworkTitle);
    const panel = d.buildGui(aFrame, xmlElement);
    d.tabLabel = this._messages.tabTitle;
    return { panel, framework: d };
  }

  // Magik: cuadro_de_notas_plugin.activate_dialog(_gather args)
  // Cache idempotente: 1ª llamada crea, llamadas siguientes reutilizan.
  activateDialog(activationMessage = 'un mensaje'): CuadroDeNotasFramework {
    const name = 'cuadro_de_notas';

    let d = this._dialogCache.get(name);
    let created = false;
    if (d === undefined) {
      d = createCuadroDeNotasFramework(this._messages.frameworkTitle, FRAMEWORK_OPTS);
      this._dialogCache.set(name, d);
      created = true;
    }

    d.maximizable = false;
    d.minimizable = true;
    d.resizable   = true;

    d.activate(this.topFrame, activationMessage);

    // Exponer flag de creación en propiedad efímera (no en el original)
    (d as CuadroDeNotasFramework & { _justCreated?: boolean })._justCreated = created;

    return d;
  }

  // Magik: _self.add_action(sw_action.new(...))
  private addAction(a: SwActionDef): void {
    this._actions.push(a);
  }

  // Magik: _self.get_dialog(name)
  getDialog(name: string): CuadroDeNotasFramework | undefined {
    return this._dialogCache.get(name);
  }

  // Magik: _self.cache_dialog(name, d)  — usado internamente, expuesto para tests.
  cacheDialog(name: string, d: CuadroDeNotasFramework): void {
    this._dialogCache.set(name, d);
  }

  // Helpers para introspección desde el showcase
  get actions(): readonly SwActionDef[] { return this._actions; }
  get cachedDialogNames(): string[]     { return [...this._dialogCache.keys()]; }
  get messages(): Messages              { return this._messages; }
}
