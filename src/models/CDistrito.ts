// Source: adiciones_layout/source/c_distrito.magik
//
// Modelo de distrito GIS. Encapsula:
//   - Asignación + extracción de inventario por NSE (viv, abonados, sat.)
//   - Cálculo de líneas a saturación = viv_sin_servicio × factor_pen + abonados
//   - Conteos por calificador (BALDIO/ESCUELA/IGLESIA)
//   - Helpers de etiquetado de cable FO
//   - divisor_equivalencia (A..S → 1..16, sin I, N, Ñ, Q)
//
// El módulo original tiene ~2800 líneas con muchas consultas GIS pesadas
// (mufas, terminales, cables conectados, etc). Aquí se cubre la API pura
// + un servicio inyectable para los lookups GIS.

// =============================================================================
// CONSTANTES
// =============================================================================

// Magik: define_shared_constant :divisor_equivalencia, property_list { A→1, B→2, ... }
export const DIVISOR_EQUIVALENCIA: Record<string, number> = {
  A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,
  G: 7,  H: 8,  J: 9,  K: 10, L: 11, M: 12,
  O: 13, P: 14, R: 15, S: 16,
};

export type Nse =
  | 'A'  | 'B'  | 'C'  | 'D'  | 'E'
  | 'C1' | 'C2' | 'C3'
  | 'IL' | 'IM' | 'IP';

export const NSES: Nse[] = ['A', 'B', 'C', 'D', 'E', 'C1', 'C2', 'C3', 'IL', 'IM', 'IP'];

// =============================================================================
// TIPOS
// =============================================================================

export type ConstructionStatus = 'EXISTENTE' | 'PROYECTADO';
export type Calificador        = 'BALDIO' | 'ESCUELA' | 'IGLESIA' | 'HABITACIONAL' | string;

export interface DistritoRecord {
  id:                  string;
  user_distrito:       string;
  user_limite:         { area: number };          // bounding_box stub
  factorPen?:          Partial<Record<Nse, number>>;
}

export interface LoteRecord {
  id:                string;
  user_calificador:  Calificador;
  // info por NSE — usado en get_resumen_lotificacion
}

export interface CableRecord {
  id:                 string;
  user_numero_cable:  string | undefined;
  spec_info:          { fiber_quantity: number; user_clase: string };
  fibras_muertas?:    number;
}

export interface ProyectoActivo {
  user_programa_anyo: string;        // ej: "2025" — se toma últimos N dígitos
}

// Inventario por NSE — los índices crudos del Magik (inventario[1..5][...])
export interface InventarioPorNse {
  viviendas:            number;
  abonados:             number;
  lineas_multiplicador: number;
  lineas_competencia:   number;
  lineas_inalambricas:  number;
  solicitudes:          number;
  viv_sin_servicio:     number;
  ltc:                  number;
  pslt:                 number;
  publicos_comp:        number;
}

export type InventarioMap     = Partial<Record<Nse, InventarioPorNse>>;
export type LineasSaturacion  = Partial<Record<Nse | 'Total', number>>;

// =============================================================================
// SERVICIO GIS (abstrae todas las consultas pesadas)
// =============================================================================

export interface CDistritoServices {
  // Magik: get_resumen_lotificacion → (inventario, lotes, nse_predominante)
  resumenLotificacion(distrito: DistritoRecord): {
    inventario:     InventarioMap;
    lotes:          LoteRecord[];
    nsePredominante: Nse;
  };
  proyectoActivo():     ProyectoActivo;
}

// =============================================================================
// HELPERS PUROS
// =============================================================================

// Magik: arma_cadena_cable — etiqueta multilínea con spec + año + (fibras muertas?)
export function armaCadenaCable(cable: CableRecord, proyecto: ProyectoActivo): string {
  const year = proyecto.user_programa_anyo.slice(-2);   // "(YY)"
  const spec = `${cable.spec_info.fiber_quantity}FO(${cable.spec_info.user_clase})`;
  const muertas = cable.fibras_muertas ?? 0;
  const fibras  = muertas > 0 ? `  (${muertas})` : '';
  return `${spec}\n (${year}) ${fibras}`;
}

// Magik: lineas_saturacion — Math.max(abonados, viv_sin_servicio × factor + abonados)
export function lineasSaturacion(
  inventario:  InventarioMap,
  factorPen:   Partial<Record<Nse, number>>,
): LineasSaturacion {
  const out: LineasSaturacion = {};
  let total = 0;

  for (const nse of NSES) {
    const inv = inventario[nse];
    if (!inv) continue;
    const factor    = factorPen[nse] ?? 0;
    const vivSinSrv = inv.viv_sin_servicio;
    const abonados  = inv.abonados;
    const calculado = vivSinSrv * factor + abonados;
    // Si abonados > calculado, usa abonados (Magik lo decide así)
    const v = abonados > calculado ? abonados : calculado;
    out[nse] = round2(v);
    total += v;
  }
  out['Total'] = Math.ceil(total);
  return out;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// Magik: numero_baldios / numero_escuelas / numero_iglesias — by user!_calificador
export function contarPorCalificador(lotes: readonly LoteRecord[], cali: Calificador): number {
  return lotes.filter(l => l.user_calificador === cali).length;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CDistrito {
  static readonly DIVISOR_EQUIVALENCIA = DIVISOR_EQUIVALENCIA;

  // Slots
  objeto:         DistritoRecord | undefined = undefined;
  inventario:     InventarioMap              = {};
  colViv_lin:     InventarioMap              = {};
  colTelPublicos: Record<string, { ltc: number; pslt: number; publicos_comp: number }> = {};
  colLotes:       LoteRecord[]               = [];
  colLinSat:      LineasSaturacion           = {};
  dtoNsePred:     Nse | ''                   = '';
  coloniaCd:      string | undefined         = undefined;

  private readonly _svc: CDistritoServices;

  // Magik: c_distrito.new() → init()
  constructor(svc: CDistritoServices) {
    this._svc = svc;
  }

  // Magik: asigna_distrito(p_distrito, _optional pb_lotes?)
  asignaDistrito(distrito: DistritoRecord, lotes: boolean = true): void {
    this.objeto = distrito;
    if (!lotes) return;

    const r = this._svc.resumenLotificacion(distrito);
    this.inventario  = r.inventario;
    this.colLotes    = r.lotes;
    this.dtoNsePred  = r.nsePredominante;

    // Derivar col_viv_lin y col_tel_publicos por NSE (Magik los expone separados)
    for (const nse of NSES) {
      const inv = this.inventario[nse];
      if (!inv) continue;
      this.colViv_lin[nse] = inv;
      this.colTelPublicos[nse] = {
        ltc:           inv.ltc,
        pslt:          inv.pslt,
        publicos_comp: inv.publicos_comp,
      };
    }
  }

  // Magik: factor_pen_nse — lee .objeto.user!_factor_pen.user!_nse_X
  factorPenNse(): Partial<Record<Nse, number>> {
    const fp = this.objeto?.factorPen ?? {};
    const out: Partial<Record<Nse, number>> = {};
    for (const nse of NSES) out[nse] = fp[nse] ?? 0;
    return out;
  }

  // Magik: lineas_saturacion
  lineasSaturacion(): LineasSaturacion {
    this.colLinSat = lineasSaturacion(this.inventario, this.factorPenNse());
    return this.colLinSat;
  }

  // Magik: numero_baldios / numero_escuelas / numero_iglesias
  numeroBaldios():  number { return contarPorCalificador(this.colLotes, 'BALDIO');   }
  numeroEscuelas(): number { return contarPorCalificador(this.colLotes, 'ESCUELA');  }
  numeroIglesias(): number { return contarPorCalificador(this.colLotes, 'IGLESIA');  }

  // Magik: cantidad_lotes
  cantidadLotes(): number { return this.colLotes.length; }

  // Magik: dto_nse_predominante
  dtoNsePredominante(): string { return this.dtoNsePred; }

  // Magik: arma_cadena_cable (delegado al helper puro)
  armaCadenaCable(cable: CableRecord): string {
    return armaCadenaCable(cable, this._svc.proyectoActivo());
  }
}
