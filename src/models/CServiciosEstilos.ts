// Source: adiciones_layout/source/c_servicios_estilos.magik
//
// Singleton de servicios de estilo. Obtiene un text_style B/N (font + colour
// + escala) según el estado de construcción de un objeto GIS.
//
// Resolución de PoRwo_est:
//   :gis_text_style → actual_text_styles[:left_right]
//   :rwo_style      → actual_text_style
//   otro            → devuelve PoRwo_est sin tocar
//
// Reglas de pintado por Pc_construccion:
//   "PROYECTADO" → bold + red    + escala × 1.10 (truncada)
//   _unset       → plain + black + escala original
//   otro valor   → plain + green + escala original

export type RwoClassName = 'gis_text_style' | 'rwo_style' | string;

export interface ActualTextStyle {
  font:   string;
  colour: string;
  xscale: number;
  yscale: number;
}

export interface RwoEst {
  className:        RwoClassName;
  actualTextStyles?: { left_right: ActualTextStyle };  // :gis_text_style
  actualTextStyle?:  ActualTextStyle;                  // :rwo_style
}

export type EstadoConstruccion = 'PROYECTADO' | string | undefined;

// Magik: colour.copy_with_properties — produce nuevo estilo derivado
function copyWithProperties(
  base:    ActualTextStyle,
  patch:   Partial<ActualTextStyle>,
): ActualTextStyle {
  return { ...base, ...patch };
}

export class CServiciosEstilos {
  // Magik: define_shared_variable(:singleton, _unset, :private)
  private static _singleton: CServiciosEstilos | undefined;

  private constructor() { /* Magik: init() vacío */ }

  // Magik: c_servicios_estilos.new() → _clone.init()
  static new(): CServiciosEstilos {
    return new CServiciosEstilos();
  }

  // Magik: c_servicios_estilos.singleton — lazy
  static singleton(): CServiciosEstilos {
    if (CServiciosEstilos._singleton === undefined) {
      CServiciosEstilos._singleton = CServiciosEstilos.new();
    }
    return CServiciosEstilos._singleton;
  }

  // Magik: obtener_estilo_blanco_y_negro_txt(PoRwo_est, _optional Pc_construccion)
  obtenerEstiloBlancoYNegroTxt(
    poRwoEst:        RwoEst | ActualTextStyle,
    pcConstruccion?: EstadoConstruccion,
  ): ActualTextStyle | RwoEst {
    let loEstilo: ActualTextStyle | undefined;

    if ('className' in poRwoEst) {
      if (poRwoEst.className === 'gis_text_style') {
        loEstilo = poRwoEst.actualTextStyles?.left_right;
      } else if (poRwoEst.className === 'rwo_style') {
        loEstilo = poRwoEst.actualTextStyle;
      } else {
        return poRwoEst;
      }
    }

    if (loEstilo === undefined) return poRwoEst as RwoEst;

    let loFont:    string;
    let loColor:   string;
    let loEscalaX: number;
    let loEscalaY: number;

    if (pcConstruccion === 'PROYECTADO') {
      loFont    = 'bold';
      loColor   = 'red';
      // Magik: LoEstilo.xscale + (LoEstilo.xscale * 0.10).truncated  (typo original: usa xscale en ambos)
      const delta = Math.trunc(loEstilo.xscale * 0.10);
      loEscalaX = loEstilo.xscale + delta;
      loEscalaY = loEstilo.yscale + delta;
    } else {
      loFont    = 'plain';
      loColor   = pcConstruccion === undefined ? 'black' : 'green';
      loEscalaX = loEstilo.xscale;
      loEscalaY = loEstilo.yscale;
    }

    return copyWithProperties(loEstilo, {
      font:   loFont,
      yscale: loEscalaY,
      xscale: loEscalaX,
      colour: loColor,
    });
  }

  // Magik: obtiener_estilo_blanco_y_negro_linea — vacío en el original
  obtenerEstiloBlancoYNegroLinea(_rwoEst: RwoEst): undefined {
    return undefined;
  }
}
