/**
 * Migración: c_lista_materiales_cables.magik
 * Clase Magik: c_lista_materiales_cables
 * Hereda de: c_base_sello_fibra
 *
 * Sello de layout para proyectos FO que muestra la lista de materiales de
 * cables proyectados (sheaths PROYECTADO, no principales).
 * Agrupa por (collection|spec_id), ordena con strings_with_numbers.
 *
 * Métodos migrados:
 *   new_with(Ptipo, …)            → constructor con tipo
 *   configura_tabla()             → configuraTablaDef()
 *   consultar_Lista_materiales()  → consultarListaMateriales()
 *   elementos_de_proyecto()       → elementosDeProyecto()
 *   etiqueta_celdas()             → etiquetaCeldas()
 *   llena_datos_celdas()          → llenaDatosCeldas()
 *   keys_Order(ht)                → keysOrder()
 *   asigna_celdas_a_colorear()    → asignaCeldasAColorear()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export type TipoLista = 'red' | 'estructuras';

export interface MaterialEntry {
  /** Magik: source_collection.external_name + "|" + spec_id */
  key          : string;
  /** Magik: mspec.fiber_quantity + " F.O." */
  capacidad    : string;
  /** Magik: mspec.user!_clase */
  tipoCable    : string;
  /** Metros totales (user!_long_opt o calculated_fiber_length) */
  longitud     : number;
  /** Número de registros en el grupo */
  cantidad     : number;
}

export interface Celda {
  texto    : string;
  tamanio  : number;
  alineacion?: string;
  esHeader?: boolean;
}

export interface TablaLayout {
  renglones : number;
  columnas  : number;
  celdas    : Map<string, Celda>;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CListaMaterialesCables {

  tipo      : TipoLista = 'red';
  ht        : Map<string, MaterialEntry[]> = new Map();
  principales: Set<string> = new Set();  /** keys de cables principales */

  private tabla: TablaLayout | null = null;
  private readonly ROJO = 'rgb(255,0,0)';

  constructor(tipo: TipoLista = 'red') {
    this.tipo = tipo;
  }

  // --------------------------------------------------------------------------
  // keysOrder — Magik: keys_Order(Loelementos)
  // Ordena las claves del hash_table con comparador strings_with_numbers
  // (primero numérico, luego alfanumérico).
  // --------------------------------------------------------------------------

  keysOrder(ht: Map<string, unknown>): string[] {
    return [...ht.keys()].sort((a, b) => {
      // strings_with_numbers: compara segmentos numéricos como números
      const splitNum = (s: string) => s.split(/(\d+)/).map((p, i) =>
        i % 2 === 0 ? p : Number(p)
      );
      const partsA = splitNum(a);
      const partsB = splitNum(b);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const pa = partsA[i] ?? '', pb = partsB[i] ?? '';
        if (pa === pb) continue;
        if (typeof pa === 'number' && typeof pb === 'number') return pa - pb;
        return String(pa).localeCompare(String(pb));
      }
      return 0;
    });
  }

  // --------------------------------------------------------------------------
  // consultarListaMateriales — Magik: consultar_Lista_materiales()
  // Filtra sheaths PROYECTADO, excluye principales, agrupa por (collection|spec_id).
  // En TS: recibe un array de registros GIS ya resueltos.
  // --------------------------------------------------------------------------

  /**
   * @param sheaths Array de sheaths PROYECTADO del diseño
   * @param principalesKeys Set de keys de cables que son "principales" (upstream CEDO)
   */
  consultarListaMateriales(
    sheaths: Array<{
      key          : string;   /** "{collection}|{spec_id}" */
      capacidad    : string;
      tipoCable    : string;
      longitud     : number;
      esPrincipal  : boolean;
    }>
  ): { ht: Map<string, MaterialEntry[]>; principales: Set<string> } {
    const ht = new Map<string, MaterialEntry[]>();
    const principales = new Set<string>();

    for (const s of sheaths) {
      if (s.esPrincipal) {
        principales.add(s.key);
        continue;
      }
      if (!ht.has(s.key)) ht.set(s.key, []);
      const existing = ht.get(s.key)!;
      existing.push({
        key:       s.key,
        capacidad: s.capacidad,
        tipoCable: s.tipoCable,
        longitud:  s.longitud,
        cantidad:  0,
      });
    }

    // Consolida por grupo
    ht.forEach((entries, key) => {
      const total = entries.reduce((acc, e) => acc + e.longitud, 0);
      ht.set(key, [{
        key,
        capacidad: entries[0].capacidad,
        tipoCable: entries[0].tipoCable,
        longitud:  Math.round(total * 100) / 100,
        cantidad:  entries.length,
      }]);
    });

    this.ht          = ht;
    this.principales = principales;
    return { ht, principales };
  }

  // --------------------------------------------------------------------------
  // configuraTablaDef — Magik: configura_tabla()
  // Tabla dinámica: 2 renglones de header + N renglones de datos.
  // Columnas: No(6mm), CAPACIDAD(12mm), TIPO(35mm), LONGITUD(20mm)
  // --------------------------------------------------------------------------

  configuraTablaDef(): TablaLayout {
    const nDatos  = this.ht.size;
    const nRengs  = 2 + nDatos;
    this.tabla = {
      renglones: nRengs,
      columnas:  4,
      celdas:    new Map<string, Celda>(),
    };
    return this.tabla;
  }

  // --------------------------------------------------------------------------
  // etiquetaCeldas — Magik: etiqueta_celdas()
  // --------------------------------------------------------------------------

  etiquetaCeldas(): void {
    if (!this.tabla) return;
    const set = (r: number, c: number, texto: string, tamanio: number, esHeader = false) => {
      this.tabla!.celdas.set(`${r},${c}`, { texto, tamanio, esHeader });
    };
    // Renglon 1: header principal (abarca col 3)
    set(1, 3, 'CANTIDAD DE CABLE A PROYECTAR', 30, true);
    // Renglon 2: sub-headers
    set(2, 1, 'No',             20);
    set(2, 2, 'CAPACIDAD',      20);
    set(2, 3, 'TIPO DE CABLE',  20);
    set(2, 4, 'LONGITUD(mts)',  20);
  }

  // --------------------------------------------------------------------------
  // llenaDatosCeldas — Magik: llena_datos_celdas()
  // Rellena los renglones 3+ con los datos ordenados del ht.
  // --------------------------------------------------------------------------

  llenaDatosCeldas(): void {
    if (!this.tabla) return;
    const keys = this.keysOrder(this.ht as Map<string, unknown>);
    let cont = 2;
    for (const key of keys) {
      cont++;
      if (cont > this.tabla.renglones) break;
      const entries = this.ht.get(key);
      if (!entries?.length) continue;
      const e = entries[0];
      const set = (r: number, c: number, texto: string) =>
        this.tabla!.celdas.set(`${r},${c}`, { texto, tamanio: 18 });
      set(cont, 1, String(cont - 2));
      set(cont, 2, e.capacidad);
      set(cont, 3, e.tipoCable);
      set(cont, 4, e.longitud.toFixed(2));
    }
  }

  // --------------------------------------------------------------------------
  // asignaCeldasAColorear — Magik: asigna_celdas_a_colorear()
  // Header (1,3) + todas las filas de datos col 1-4 en rojo.
  // --------------------------------------------------------------------------

  asignaCeldasAColorear(): Array<{ r: number; c: number; color: string }> {
    const result: Array<{ r: number; c: number; color: string }> = [
      { r: 1, c: 3, color: this.ROJO },
    ];
    const nRengs = this.tabla?.renglones ?? 2;
    for (let r = 3; r <= nRengs; r++) {
      for (let c = 1; c <= 4; c++) {
        result.push({ r, c, color: this.ROJO });
      }
    }
    return result;
  }

  // --------------------------------------------------------------------------
  // drawContentOn
  // --------------------------------------------------------------------------

  drawContentOn(datos?: Array<Parameters<CListaMaterialesCables['consultarListaMateriales']>[0][0]>): TablaLayout {
    if (datos) this.consultarListaMateriales(datos);
    if (!this.tabla) this.configuraTablaDef();
    this.etiquetaCeldas();
    this.llenaDatosCeldas();
    return this.tabla!;
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_SHEATHS = [
  { key: 'sheath|48FO',  capacidad: '48 F.O.',  tipoCable: 'G.657.A1',  longitud: 250.50, esPrincipal: false },
  { key: 'sheath|96FO',  capacidad: '96 F.O.',  tipoCable: 'G.652.D',   longitud: 180.00, esPrincipal: false },
  { key: 'sheath|24FO',  capacidad: '24 F.O.',  tipoCable: 'G.657.A1',  longitud:  95.25, esPrincipal: false },
  { key: 'sheath|48FO',  capacidad: '48 F.O.',  tipoCable: 'G.657.A1',  longitud: 130.00, esPrincipal: false },
  { key: 'sheath|144FO', capacidad: '144 F.O.', tipoCable: 'G.652.D',   longitud:  60.00, esPrincipal: true  },
];

// =============================================================================
// COMPONENTE REACT
// =============================================================================

export default function CListaMaterialesCablesViewer(): React.ReactElement {
  const [tabla, setTabla] = useState<TablaLayout | null>(null);

  const run = () => {
    const inst = new CListaMaterialesCables('red');
    setTabla(inst.drawContentOn(MOCK_SHEATHS));
  };

  const COLS = ['No', 'CAPACIDAD', 'TIPO', 'LONGITUD(m)'];

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CListaMaterialesCables — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_lista_materiales_cables</code> — extends c_base_sello_fibra
      </p>
      <p style={{ fontSize: 12 }}>
        Mock: {MOCK_SHEATHS.length} sheaths ({MOCK_SHEATHS.filter(s => s.esPrincipal).length} principales excluidos)
      </p>

      <button onClick={run}>draw_content_on()</button>

      {tabla && (
        <div style={{ marginTop: 16 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th colSpan={4} style={{ border: '1px solid #999', padding: '4px 8px', background: '#ffeeee', color: 'red' }}>
                  CANTIDAD DE CABLE A PROYECTAR
                </th>
              </tr>
              <tr>
                {COLS.map(h => (
                  <th key={h} style={{ border: '1px solid #999', padding: '4px 8px', background: '#f5f5f5' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: tabla.renglones - 2 }, (_, ri) => {
                const r = ri + 3;
                return (
                  <tr key={r} style={{ background: ri % 2 === 0 ? '#fff8f8' : '#fff' }}>
                    {[1, 2, 3, 4].map(c => (
                      <td key={c} style={{ border: '1px solid #ccc', padding: '2px 8px', color: 'red' }}>
                        {tabla.celdas.get(`${r},${c}`)?.texto ?? ''}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: '#666' }}>Tabla: {tabla.renglones} renglones × {tabla.columnas} columnas</p>
        </div>
      )}
    </div>
  );
}
