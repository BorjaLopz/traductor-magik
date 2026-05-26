// Source: adiciones_layout/source/c_pep_dcs.magik
//
// Variante de c_pep — sólo añade los detalles de Referencias DCS:
//   1. DESMONTAJE     ← oProyecto.referencia_desmontaje
//   2. CANALIZACION   ← oProyecto.referencia_canalizacion
//   3. SECUNDARIO     ← oProyecto.referencia_secundarios
//
// allowed_on_menu? = _false → no aparece en el menú de planos.

export interface ProyectoConReferencias {
  existe:                  boolean;
  referenciaDesmontaje:    string;
  referenciaCanalizacion:  string;
  referenciaSecundarios:   string;
}

// Stub mínimo de c_pep (clase padre) — sólo lo necesario para el sub-sello DCS.
export class CPepBase {
  nNumero_Renglones: number = 0;
  oProyecto: ProyectoConReferencias;

  constructor(proyecto: ProyectoConReferencias) {
    this.oProyecto = proyecto;
  }
}

export class CPepDcs extends CPepBase {
  // Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
  static readonly allowedOnMenu: boolean = false;

  // Magik: c_pep_dcs.dfn_Detalle_Titulo_Referencias
  dfnDetalleTituloReferencias(): Record<number, string> {
    this.nNumero_Renglones = 3;
    return {
      1: 'DESMONTAJE',
      2: 'CANALIZACION',
      3: 'SECUNDARIO',
    };
  }

  // Magik: c_pep_dcs.dfn_Detalle_Valores_Referencias
  dfnDetalleValoresReferencias(): Record<number, string> {
    if (this.oProyecto.existe) {
      return {
        1: this.oProyecto.referenciaDesmontaje,
        2: this.oProyecto.referenciaCanalizacion,
        3: this.oProyecto.referenciaSecundarios,
      };
    }
    return { 1: '', 2: '', 3: '' };
  }
}
