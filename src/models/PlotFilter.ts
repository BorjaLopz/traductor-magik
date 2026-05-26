// Source: adiciones_layout/source/plot_filter.magik
//
// Genera flags devmode para windcplot.exe a partir del diálogo Win32
// STDDLG_PRINTSETUP. Si la impresora destino coincide con la PDF de
// c_centraliza_planos (servidor cache o nombre directo) → fuerza un
// preset (orientation 2, paperSize 161, dpi 600, etc.). Si no, itera
// los pares dm* con dmDeviceName ← wDevice (workaround 32-char Win32).

export type DevmodeValue = string | number | undefined;

export interface PrintSetupDialog {
  valueNames: string[];                          // dlg.value_names.fast_elements()
  values: Record<string, DevmodeValue>;          // dlg.get_value(name)
}

export interface CentralizaPlanosConfig {
  servidorCache: string;                         // cp.servidor_cache
  hostName:      string;                         // system.host_name
  impresoraPdf:  string;                         // cp.impresorapdf
  impresora:     string;                         // cp.impresora
  tamanoPapel:   [number, number];               // cp.tamano_papel → (ancho, alto)
}

export type SavedDevmodeSettings = string | undefined; // .properties[:saved_devmode_settings]

export interface DevmodeSettingsArgs {
  dialog:           PrintSetupDialog;
  config:           CentralizaPlanosConfig;
  currentPrinter:   string;                      // _self.printer.write_string
  useSavedSettings?: boolean;                    // _optional saved_settings? (default true)
  savedSettings?:   SavedDevmodeSettings;
}

// Magik: plot_filter.configura_impresora_para_centralizar_plano(dlg, opts_stream, impresora, ancho, alto)
export function configurePrinterForCentralizedPlot(
  dlg:       PrintSetupDialog,
  impresora: string,
  ancho:     number,
  alto:      number,
): string {
  const out: string[] = [];

  for (const name of dlg.valueNames) {
    if (!name.startsWith('dm')) continue;        // name.matches?("dm*")

    let v: DevmodeValue;
    switch (name) {
      case 'dmDeviceName':   v = impresora; break;
      case 'dmOrientation':  v = 2;         break;
      case 'dmPaperSize':    v = 161;       break;
      case 'dmPaperLength':  v = ancho;     break;
      case 'dmPaperWidth':   v = alto;      break;
      case 'dmScale':        v = 100;       break;
      case 'dmCopies':       v = 1;         break;
      case 'dmPrintQuality': v = 600;       break;
      case 'dmColor':        v = 2;         break;
      case 'dmYResolution':  v = 600;       break;
      default:               v = dlg.values[name];
    }

    if (v === undefined || v === null) continue; // v _isnt _unset

    // v.class_name _is :char16_vector → quote
    const quoted = typeof v === 'string' ? `"${v}"` : String(v);
    out.push(` -f ${name}=${quoted}`);
  }

  return out.join('');
}

// Magik: plot_filter.default_windcplot_options  →  "-k win32 -d 1"
export function defaultWindcplotOptions(): string {
  return '-k win32 -d 1';
}

// Magik: plot_filter.devmode_settings(_optional saved_settings?)
export function devmodeSettings(args: DevmodeSettingsArgs): string {
  const {
    dialog,
    config,
    currentPrinter,
    useSavedSettings = true,
    savedSettings,
  } = args;

  if (useSavedSettings && savedSettings !== undefined) {
    return savedSettings;
  }

  const up = (s: string) => s.toUpperCase();
  const printerU = up(currentPrinter);

  const isServerCache =
    up(config.servidorCache) === up(config.hostName) &&
    up(config.impresoraPdf)  === printerU;

  const isImpresoraCentraliza = printerU === up(config.impresora);

  if (isServerCache || isImpresoraCentraliza) {
    const [ancho, alto] = config.tamanoPapel;
    return configurePrinterForCentralizedPlot(dialog, currentPrinter, ancho, alto);
  }

  const out: string[] = [];
  for (const name of dialog.valueNames) {
    if (!name.startsWith('dm')) continue;

    // dmDeviceName limitado a 32 chars → wDevice contiene el string completo
    const v: DevmodeValue =
      name === 'dmDeviceName' ? dialog.values['wDevice'] : dialog.values[name];

    if (v === undefined || v === null) continue;

    const quoted = typeof v === 'string' ? `"${v}"` : String(v);
    out.push(` -f ${name}=${quoted}`);
  }

  return out.join('');
}
