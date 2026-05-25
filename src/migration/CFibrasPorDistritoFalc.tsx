/**
 * Migración: c_fibras_por_distrito_falc.magik
 * Clase Magik: c_fibras_por_distrito_falc
 * Hereda de: c_base_sello_fibra
 *
 * Sello de layout para planos FALC que muestra información de fibras ópticas
 * por distrito: CEDO, viviendas, fibras, NCO, NIPP, distancias.
 *
 * Métodos migrados:
 *   defined_attributes()            → DEFINED_ATTRIBUTES
 *   configura_tabla()               → configuraTablaDef()
 *   asigna_texto_celda(…, hex)      → asignaTextoCelda()
 *   etiqueta_celdas()               → etiquetaCeldas()
 *   llena_datos_celdas()            → llenaDatosCeldas()
 *   llena_datos_celdas_properties() → llenaDatosCeldasProperties()
 *   obten_registros()               → obtenRegistros()
 *   obten_registros_caja()          → obtenRegistrosCaja()
 *   draw_content_on(window)         → drawContentOn()
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface TextoCelda {
  texto: string;
  tamanio: number;
  alineacion?: string;
  margen?: number;
  /** CSS rgb() string */
  color?: string;
}

export type TablaId = 'tbl_contenedora' | 'tbl_1' | 'tbl_2' | 'tbl_2_1' | 'tbl_3';

export interface Celda {
  renglon: number;
  columna: number;
  contenido: TextoCelda | null;
}

export interface TablaLayout {
  id: TablaId;
  renglones: number;
  columnas: number;
  celdas: Map<string, Celda>;
}

/** Datos de negocio que pueblan el sello */
export interface DatosFibrasDistrito {
  fibras       : string;
  nco          : string;
  nipp         : string;
  cveDto       : string;  /** siglas_distrito / DTOS */
  viv          : string;  /** total viviendas del dog */
  noFibras     : string;  /** número de fibras requeridas */
  distANco     : string;
  distrito     : string;
  distAOc      : string;
  siglasOc     : string;
  cuentas      : string;  /** fibras asignadas */
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const DEFINED_ATTRIBUTES = [
  { nombre: 'idcedo',      tipo: 'string',  description: 'CEDO',                    default: '0' },
  { nombre: 'fibras',      tipo: 'string',  description: 'FIBRAS',                  default: '' },
  { nombre: 'nco',         tipo: 'string',  description: 'NCO',                     default: '' },
  { nombre: 'nipp',        tipo: 'string',  description: 'NIPP',                    default: '' },
  { nombre: 'cve_dto',     tipo: 'string',  description: 'CLAVE DTO',               default: '' },
  { nombre: 'viv',         tipo: 'string',  description: 'VIV',                     default: '' },
  { nombre: 'no_fibras',   tipo: 'string',  description: 'NUMERO DE FIBRAS',        default: '' },
  { nombre: 'dist_a_nco',  tipo: 'string',  description: 'DISTANCIA A NCO',         default: '' },
  { nombre: 'distrito',    tipo: 'string',  description: 'DISTRITO',                default: '' },
  { nombre: 'dist_a_oc',   tipo: 'string',  description: 'DISTANCIA A OC',          default: '' },
  { nombre: 'siglas_oc',   tipo: 'string',  description: 'SIGLAS OC',               default: '' },
  { nombre: 'cuentas',     tipo: 'string',  description: 'CUENTAS',                 default: '' },
  { nombre: 'recalcular',  tipo: 'boolean', description: 'Recalcular los valores',  default: true, enPropiedades: false },
] as const;

// =============================================================================
// HELPERS
// =============================================================================

/** Magik: colour.new_from_hex("RRGGBB") → CSS `#RRGGBB` */
function hexToColor(hex: string): string {
  return `#${hex}`;
}

/** Magik: colour.new_rgb([r,g,b]) (0-1 floats) → CSS `rgb()` */
function rgbToColor(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

const AZUL = rgbToColor(0, 0, 1);
const ROJO = rgbToColor(1, 0, 0);

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CFibrasPorDistritoFalc {

  /** Attributes (redefinable) */
  attributes: Record<string, string> = {
    idcedo: '', fibras: '', nco: '', nipp: '', cve_dto: '', viv: '',
    no_fibras: '', dist_a_nco: '', distrito: '', dist_a_oc: '', siglas_oc: '', cuentas: '',
  };

  recalcular = true;

  private tablas = new Map<TablaId, TablaLayout>();

  // --------------------------------------------------------------------------
  // configuraTablaDef — Magik: configura_tabla()
  // --------------------------------------------------------------------------

  /** Define la estructura de las 5 tablas del sello. */
  configuraTablaDef(): Map<TablaId, TablaLayout> {
    const make = (id: TablaId, r: number, c: number): TablaLayout => ({
      id, renglones: r, columnas: c,
      celdas: new Map<string, Celda>(),
    });

    this.tablas.set('tbl_contenedora', make('tbl_contenedora', 1, 1));
    this.tablas.set('tbl_1',    make('tbl_1', 1, 1));    // 5×22 mm — título principal
    this.tablas.set('tbl_2',    make('tbl_2', 1, 1));    // 10×22 mm — línea color
    this.tablas.set('tbl_2_1',  make('tbl_2_1', 5, 3));  // encabezados DTOS/VIV/FIBRAS
    this.tablas.set('tbl_3',    make('tbl_3', 4, 1));    // 4 renglones — distancias y dto
    return this.tablas;
  }

  // --------------------------------------------------------------------------
  // asignaTextoCelda — Magik: asigna_texto_celda(…, ps_color_hex?)
  // Extiende el método base añadiendo soporte para hex RRGGBB.
  // --------------------------------------------------------------------------

  asignaTextoCelda(
    tabla   : TablaId,
    renglon : number,
    columna : number,
    texto   : string,
    tamanio : number,
    alineacion?: string,
    margen?: number,
    colorRgb?: [number, number, number],
    colorHex?: string,
  ): void {
    const tbl = this.tablas.get(tabla);
    if (!tbl) return;
    const key = `${renglon},${columna}`;
    const color = colorHex
      ? hexToColor(colorHex)
      : colorRgb
        ? rgbToColor(...colorRgb)
        : undefined;
    tbl.celdas.set(key, {
      renglon, columna,
      contenido: { texto, tamanio, alineacion, margen, color },
    });
  }

  // --------------------------------------------------------------------------
  // etiquetaCeldas — Magik: etiqueta_celdas()
  // --------------------------------------------------------------------------

  /** Coloca los encabezados DTOS/VIV/FIBRAS en azul. */
  etiquetaCeldas(): void {
    this.asignaTextoCelda('tbl_2_1', 1, 1, 'DTOS:',   7, undefined, undefined, [0, 0, 1]);
    this.asignaTextoCelda('tbl_2_1', 3, 1, 'VIV:',    7, undefined, undefined, [0, 0, 1]);
    this.asignaTextoCelda('tbl_2_1', 5, 1, 'FIBRAS:', 7, undefined, undefined, [0, 0, 1]);
  }

  // --------------------------------------------------------------------------
  // llenaDatosCeldas — Magik: llena_datos_celdas()
  // Usa obtenRegistros() para obtener datos desde GIS (lookup real).
  // --------------------------------------------------------------------------

  llenaDatosCeldas(datos: DatosFibrasDistrito): void {
    const titulo = `FIBRAS (${datos.fibras})\nNCO_${datos.nco}\nNIPP ${datos.nipp}`;
    this.asignaTextoCelda('tbl_1',   1, 1, titulo,                                     14, 'top_centre', undefined, [1, 0, 0]);
    this.asignaTextoCelda('tbl_2_1', 1, 3, datos.cveDto,                               10, undefined, undefined, [0, 0, 1]);
    this.asignaTextoCelda('tbl_2_1', 3, 3, datos.viv,                                  10, undefined, undefined, [0, 0, 1]);
    this.asignaTextoCelda('tbl_2_1', 5, 3, datos.noFibras,                             10, undefined, undefined, [0, 0, 1]);
    this.asignaTextoCelda('tbl_3',   1, 1, `${datos.distANco} A NCO_${datos.nco}`,     10, undefined, undefined, undefined, 'BBBB20');
    this.asignaTextoCelda('tbl_3',   2, 1, datos.distrito,                             16, undefined, undefined, undefined, 'DAA520');
    this.asignaTextoCelda('tbl_3',   3, 1, `${datos.distAOc} A O.C. ${datos.siglasOc}`,12, undefined, undefined, undefined, 'BBBB20');
    this.asignaTextoCelda('tbl_3',   4, 1, `F.O.${datos.cuentas}`,                    14, undefined, undefined, undefined, '4C9526');
  }

  // --------------------------------------------------------------------------
  // llenaDatosCeldasProperties — Magik: llena_datos_celdas_properties()
  // Sello editable: toma valores de this.attributes (ya editados por el usuario).
  // --------------------------------------------------------------------------

  llenaDatosCeldasProperties(): void {
    const a = this.attributes;
    const datos: DatosFibrasDistrito = {
      fibras: a.fibras, nco: a.nco, nipp: a.nipp, cveDto: a.cve_dto,
      viv: a.viv, noFibras: a.no_fibras, distANco: a.dist_a_nco,
      distrito: a.distrito, distAOc: a.dist_a_oc, siglasOc: a.siglas_oc, cuentas: a.cuentas,
    };
    this.llenaDatosCeldas(datos);
  }

  // --------------------------------------------------------------------------
  // obtenRegistros — Magik: obten_registros()
  // En Magik: busca CEDO en GIS, calcula desde datos_dog.
  // En TS: recibe los datos ya resueltos.
  // --------------------------------------------------------------------------

  /**
   * Calcula NUMERO_DE_FIBRAS desde suma de viviendas del DOG.
   * Fórmula Magik: VIVIENDAS / 64, mínimo 2.
   */
  calcularNumFibras(totalViviendas: number): number {
    const n = Math.floor(totalViviendas / 64);
    return Math.max(n, 2);
  }

  /**
   * Magik: obten_registros() — lookup completo desde GIS.
   * En TS: acepta datos ya resueltos y los almacena en attributes.
   */
  obtenRegistros(datos: DatosFibrasDistrito): DatosFibrasDistrito {
    this.attributes.fibras      = datos.fibras;
    this.attributes.nco         = datos.nco;
    this.attributes.nipp        = datos.nipp;
    this.attributes.cve_dto     = datos.cveDto;
    this.attributes.viv         = datos.viv;
    this.attributes.no_fibras   = datos.noFibras;
    this.attributes.dist_a_nco  = datos.distANco;
    this.attributes.siglas_oc   = datos.siglasOc;
    this.attributes.distrito    = datos.distrito;
    this.attributes.dist_a_oc   = datos.distAOc;
    this.attributes.cuentas     = datos.cuentas;
    return datos;
  }

  // --------------------------------------------------------------------------
  // drawContentOn — Magik: draw_content_on(window)
  // --------------------------------------------------------------------------

  /**
   * configura_color_sello → llena_datos_celdas_properties → super → Despliega
   * En TS: retorna el estado completo de las tablas para renderizado React.
   */
  drawContentOn(datos?: DatosFibrasDistrito): Map<TablaId, TablaLayout> {
    if (!this.tablas.size) this.configuraTablaDef();
    this.etiquetaCeldas();
    if (datos) this.obtenRegistros(datos);
    this.llenaDatosCeldasProperties();
    return this.tablas;
  }
}

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_DATOS: DatosFibrasDistrito = {
  fibras:     '48',
  nco:        'NCO_CENTRO',
  nipp:       'NIPP-001',
  cveDto:     'DTO-123',
  viv:        '384',
  noFibras:   '6',
  distANco:   '1.2 km',
  distrito:   'DISTRITO CENTRO',
  distAOc:    '3.5 km',
  siglasOc:   'OC-MEX',
  cuentas:    '24',
};

// =============================================================================
// COMPONENTE REACT
// =============================================================================

const TABLE_DIMS: { id: TablaId; label: string; rows: number; cols: number }[] = [
  { id: 'tbl_1',    label: 'tbl_1 — Título (FIBRAS/NCO/NIPP)', rows: 1, cols: 1 },
  { id: 'tbl_2_1', label: 'tbl_2_1 — Encabezados DTOS/VIV/FIBRAS', rows: 5, cols: 3 },
  { id: 'tbl_3',   label: 'tbl_3 — Distancias y Distrito', rows: 4, cols: 1 },
];

export default function CFibrasPorDistritoFalcViewer(): React.ReactElement {
  const [datos, setDatos] = useState<DatosFibrasDistrito>({ ...MOCK_DATOS });
  const [tablas, setTablas] = useState<Map<TablaId, TablaLayout> | null>(null);

  const run = () => {
    const inst = new CFibrasPorDistritoFalc();
    setTablas(inst.drawContentOn(datos));
  };

  const cell = (tablas: Map<TablaId, TablaLayout>, id: TablaId, r: number, c: number) =>
    tablas.get(id)?.celdas.get(`${r},${c}`)?.contenido;

  return (
    <div style={{ fontFamily: 'monospace', padding: 16 }}>
      <h2>CFibrasPorDistritoFalc — Migración</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Magik: <code>c_fibras_por_distrito_falc</code> — extends c_base_sello_fibra
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12 }}>
        {(Object.keys(MOCK_DATOS) as (keyof DatosFibrasDistrito)[]).map(k => (
          <label key={k}>{k}:&nbsp;
            <input value={datos[k]} onChange={e => setDatos(d => ({ ...d, [k]: e.target.value }))}
              style={{ width: 120 }} />
          </label>
        ))}
      </div>

      <button onClick={run}>draw_content_on()</button>

      {tablas && (
        <div style={{ marginTop: 16 }}>
          {TABLE_DIMS.map(({ id, label, rows, cols }) => (
            <div key={id} style={{ marginBottom: 16 }}>
              <strong>{label}</strong>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, marginTop: 4 }}>
                <tbody>
                  {Array.from({ length: rows }, (_, ri) => (
                    <tr key={ri}>
                      {Array.from({ length: cols }, (_, ci) => {
                        const c = cell(tablas, id, ri + 1, ci + 1);
                        return (
                          <td key={ci} style={{
                            border: '1px solid #ccc', padding: '2px 6px',
                            color: c?.color, fontWeight: ri === 0 ? 'bold' : 'normal',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {c?.texto ?? ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <details style={{ marginTop: 12 }}>
        <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>defined_attributes() — {DEFINED_ATTRIBUTES.length}</summary>
        <pre style={{ fontSize: 11, background: '#f0f0f0', padding: 8 }}>
          {DEFINED_ATTRIBUTES.map(a => `${a.nombre} (${a.tipo}) = ${a.default}`).join('\n')}
        </pre>
      </details>
    </div>
  );
}

// Re-export colors for potential use in c_base_sello_fibra integration
export { AZUL, ROJO, hexToColor, rgbToColor };
