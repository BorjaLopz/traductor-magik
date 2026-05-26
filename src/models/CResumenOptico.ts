// Source: adiciones_layout/source/c_resumen_optico.magik
//
// Sello "RESUMEN ÓPTICO" — extiende c_base_sello_fibra. Compone 4 sub-tablas:
//
//   tbl_titulo_nco  1×2 · ren {6}        · col {50, 26}                · NCO + Distrito
//   tbl_titulo      1×1 · ren {6}        · col {76}                    · "RESUMEN OPTICO"
//   tbl_contenido   N×12 · ren {6, 4..4} · col {8,4,4,4,4,4,4,4,4,13,8,15}
//   tbl_total       1×1 · ren {6}        · col {76}                    · totalServicios
//
// Por divisor del CEDO se construye un renglón con 8 columnas (terminales),
// totales, número de fibra principal y capacidad total. Estado de construcción
// por terminal ("E" verde / "P" rojo).

// =============================================================================
// CONSTANTES
// =============================================================================

export const DIVISOR_EQUIVALENCIA: Record<string, number> = {
  A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,
  G: 7,  H: 8,  J: 9,  K: 10, L: 11, M: 12,
  O: 13, P: 14, R: 15, S: 16,
};

export const HEADER_LABELS = [
  'TER', '1', '2', '3', '4', '5', '6', '7', '8',
  'Total de Clientes\na Atender',
  'No.Fibra\nPrincipal',
  'Capacidad de\nServicios en divisor',
] as const;

export const COL_WIDTHS_CONTENIDO: readonly number[] = [8, 4, 4, 4, 4, 4, 4, 4, 4, 13, 8, 15];

export type EdoConstruccion = 'E' | 'P';

// =============================================================================
// TIPOS
// =============================================================================

export interface RenglonDivisor {
  terminal:        string;        // "FO" + divisor.name
  cells:           [string, string, string, string, string, string, string, string];   // cols 1..8
  edoConstr:       [EdoConstruccion, EdoConstruccion, EdoConstruccion, EdoConstruccion, EdoConstruccion, EdoConstruccion, EdoConstruccion, EdoConstruccion];
  serv:            number;        // Total clientes a atender
  fib:             string;        // No. Fibra Principal
  tot:             number;        // output_ports.size × 8
}

export interface CedoRecord {
  id:        string;
  nombre:    string;
  divisores: DivisorRecord[];
}

export interface DivisorRecord {
  name:        string;
  outputPorts: number;          // size — usado para tot
  // Cargas por terminal (1..8). undefined = R (reserva)
  cargas:      (number | undefined)[];
  // Estado por terminal (1..8)
  estados:     EdoConstruccion[];
  // Cable principal — número de fibra (cuenta)
  cuentaPrincipal: string;
}

export interface ContextoResumen {
  ncoSiglas:    string;
  ncoNombre:    string;
  distrito:     string;
}

// =============================================================================
// CÁLCULOS PUROS
// =============================================================================

// Magik: calcula_datos_celdas — construye un renglón por divisor del CEDO.
//   Las terminales sin carga quedan como "R" (reserva).
//   Las que tienen carga muestran el valor; el estado_construccion ("E"/"P") marca color.
export function calculaDatosCelda(divisor: DivisorRecord): RenglonDivisor {
  const cells = ['R','R','R','R','R','R','R','R'] as RenglonDivisor['cells'];
  const edoConstr = ['P','P','P','P','P','P','P','P'] as RenglonDivisor['edoConstr'];
  let serv = 0;

  for (let i = 0; i < 8; i++) {
    const c = divisor.cargas[i];
    if (c !== undefined) {
      cells[i] = String(c);
      serv += c;
    }
    if (divisor.estados[i]) edoConstr[i] = divisor.estados[i];
  }

  return {
    terminal:  `FO${divisor.name}`,
    cells,
    edoConstr,
    serv,
    fib:       divisor.cuentaPrincipal,
    tot:       divisor.outputPorts * 8,
  };
}

// Magik: etiqueta de NCO en cabecera
export function etiquetaNco(ctx: ContextoResumen): { ncoTitulo: string; dtoTitulo: string } {
  return {
    ncoTitulo: `NCO ${ctx.ncoSiglas} (${ctx.ncoNombre})`.toUpperCase(),
    dtoTitulo: `DTO: ${ctx.distrito}`,
  };
}

// =============================================================================
// CLASE
// =============================================================================

export class CResumenOptico {
  static readonly DIVISOR_EQUIVALENCIA = DIVISOR_EQUIVALENCIA;

  oCedo:    CedoRecord | undefined = undefined;
  oRenglones: number = 1;                                  // = divisores.size, default 1
  oDatos:   RenglonDivisor[] = [];
  contexto: ContextoResumen = { ncoSiglas: '', ncoNombre: '', distrito: '' };

  setCedo(c: CedoRecord): void {
    this.oCedo = c;
    this.oRenglones = c.divisores.length;
  }

  setContexto(ctx: ContextoResumen): void {
    this.contexto = ctx;
  }

  // Magik: dimensiona_tabla — rope con tamaños de renglones [6, 4, 4, ...]
  dimensionaTabla(): number[] {
    const out = [6];
    for (let i = 1; i <= this.oRenglones; i++) out.push(4);
    return out;
  }

  // Magik: calcula_datos_celdas
  calculaDatosCeldas(): RenglonDivisor[] {
    if (!this.oCedo) { this.oDatos = []; return this.oDatos; }
    const sorted = [...this.oCedo.divisores].sort((a, b) => a.name <= b.name ? -1 : 1);
    this.oDatos  = sorted.map(d => calculaDatosCelda(d));
    return this.oDatos;
  }

  // Total combinado para tbl_total
  totalServicios(): number {
    return this.oDatos.reduce((acc, r) => acc + r.serv, 0);
  }

  totalCapacidad(): number {
    return this.oDatos.reduce((acc, r) => acc + r.tot, 0);
  }
}
