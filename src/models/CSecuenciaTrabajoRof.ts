// Source: planos_fo/source/detalles_construccion/sellos/c_secuencia_trabajo_rof.magik
// ROF variant of CSecuenciaTrabajo. Same table structure (tbl_secuencia_trabajo,
// 2 rows × 1 col, 207 mm wide) but with:
//   - Row 2 default height: 80 mm (vs 150 mm in base)
//   - 8-step ROF template using LoAnillo ("__ __") + LoDistancia ("1297.0")
//   - Own class-level contenidoSello / varObjeto shared variables (separate from base)
// allowed_on_menu? = false.

import {
  CSecuenciaTrabajo,
  TABLA_SECUENCIA_TRABAJO,
  type SecuenciaTrabajoConfig,
} from './CSecuenciaTrabajo'

// ─── ROF layout constants ─────────────────────────────────────────────────────

export const TABLA_SECUENCIA_TRABAJO_ROF = {
  ...TABLA_SECUENCIA_TRABAJO,
  alturaFilaContenidoDefault: 80, // mm — row 2 (Magik: nlongitud << 80)
} as const

// ─── Config interface ─────────────────────────────────────────────────────────

export interface SecuenciaTrabajoRofConfig extends SecuenciaTrabajoConfig {
  anilloNombre?:     string  // LoAnillo — default "__ __" (Fase 5: from GIS project)
  distanciaInicial?: string  // LoDistancia — default "1297.0" (Fase 5: from GIS project)
}

// ─── Default template ─────────────────────────────────────────────────────────

// Builds the 8-step ROF template that Inicializa() sets as textoSello.
// anilloNombre: ring identifier; distanciaInicial: first segment distance in MTS.
// Steps 5 and 6 are identical in the source — preserved as-is.
export function buildContenidoDefaultRof(
  anilloNombre:     string = '__ __',
  distanciaInicial: string = '1297.0',
): string {
  const a = anilloNombre
  const d = distanciaInicial
  return (
    '\n' +
    '  1.  ANTES DE INICIAR ESTOS TRABAJOS, VERIFICAR QUE ESTEN CONCLUIDAS LAS OBRAS COMPLEMENTARIAS\n' +
    `      DEL ANILLO ${a} DE FIBRA OPTICA PARA ATENDER LOS CLIENTES A ATENDER \n` +
    `  2.  INMERSIONAR ${d} MTS DESDE BDFOAD HASTA EL POZO DEL EMPALME AB\n` +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AA Y EN POZO PARA MANTENIMIENTO\n' +
    '  3.  INMERSIONAR 1929.0 MTS DESDE EL POZO DEL EMPALME AB AL POZO DEL EMPALME AD \n' +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AC Y EN POZO PARA MANTENIMIENTO\n' +
    '  4.  INMERSIONAR 1783.0 MTS DESDE EL POZO DEL EMPALME AD AL POZO DEL EMPALME RECTO \n' +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AE Y EN POZO PARA MANTENIMIENTO\n' +
    '  5.  INMERSIONAR 1783.0 MTS DESDE EL POZO DEL EMPALME RECTO AL POZO DEL EMPALME AK\n' +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AE Y EN POZO PARA MANTENIMIENTO\n' +
    '  6.  INMERSIONAR 1783.0 MTS DESDE EL POZO DEL EMPALME RECTO AL POZO DEL EMPALME AK\n' +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AE Y EN POZO PARA MANTENIMIENTO\n' +
    '  7.  INMERSIONAR 1631.0 MTS DESDE EL POZO DEL EMPALME AK HASTA EL BDFOAD 2 DE LA CENTRAL GU\n' +
    '      DEJANDO GAZA DE 7.0 EN POZO PARA EMPALME AE Y EN POZO PARA MANTENIMIENTO\n' +
    '  8.  DEJAR LAS PANTALLAS CONTINUAS EN LOS CIERRES. Y CERRAR EMPALME PERMANENTE.\n' +
    '      INSTALAR PLACAS DE IDENTIFICACION EN TODOS LOS CABLES AFECTADOS\n' +
    '      REALIZAR PRUEBA DE PROTOCOLO #9 A CADA UNA DE LAS F.O. QUE SE PROYECTAN.\n'
  )
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSecuenciaTrabajoRof extends CSecuenciaTrabajo {
  static override readonly allowedOnMenu = false

  // Own class-level shared variables — separate from CSecuenciaTrabajo's statics.
  static contenidoSello: string | undefined = undefined
  static varObjeto:      unknown            = undefined

  constructor(config?: SecuenciaTrabajoRofConfig) {
    // Pre-resolve the ROF default template before super() builds the base one.
    const resolved: SecuenciaTrabajoConfig = {
      ...config,
      textoSello: config?.textoSello ?? buildContenidoDefaultRof(
        config?.anilloNombre,
        config?.distanciaInicial,
      ),
    }
    super(resolved)
  }

  // Dispatches to this class's own contenidoSello (not CSecuenciaTrabajo's).
  protected override get classContenidoSello(): string | undefined {
    return CSecuenciaTrabajoRof.contenidoSello
  }

  // Row 2 default: 80 mm (Magik: nlongitud << 80).
  protected override get defaultRowHeight(): number {
    return TABLA_SECUENCIA_TRABAJO_ROF.alturaFilaContenidoDefault
  }
}
