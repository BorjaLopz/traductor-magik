// =============================================================================
// MIGRACIÓN: c_resumen_del_proyecto_rof  →  CResumenDelProyectoRof.tsx
// Jerarquía Magik: c_resumen_del_proyecto_rof  extends  :c_base_sello_fibra
// Fuente: adiciones_layout/source/Sellos/c_resumen_del_proyecto_rof.magik
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

// Cada elemento del resumen es una tripleta:
//   [0] = descripción (clave)
//   [1] = cantidad (numérica o string)
//   [2] = unidad de medida
// En Magik vienen como filas indexadas 1..3.
export type ResumenRow = [desc: string, cantidad: string | number, unidadMed: string];

export type TipoResumen = 'ELEM_RED' | 'ESTRUCTURAS' | undefined;

export interface AttributeDef {
  name: string;
  defaultValue: string | undefined;
  value: string | undefined;
}

export interface CeldaTabla {
  texto: string;
  align: 'left' | 'right' | 'center';
  color?: [number, number, number]; // RGB 0..1 (Magik colour) — _unset → sin color
  bordeSup: boolean;
  bordeDer: boolean;
  bordeIzq: boolean;
  bordeInf: boolean;
}

export interface TablaResumen {
  id: 'tbl_lista_materiales';
  rows: number;
  cols: 4;
  colWidths: [number, number, number, number]; // mm
  rowHeight: number;                            // mm (igual para todas)
  celdas: CeldaTabla[][];                       // [row][col], 1-indexed simulado con offset
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

// Magik: name.write_string.lowercase.trim_spaces().as_symbol()
function descToAttrName(desc: string): string {
  return String(desc).toLowerCase().trim();
}

// Magik: x.write_string.fill_up_with(%space, 10)  →  right-pad con espacios
function fillUpWith(s: string | number | undefined, n: number, ch: string = ' '): string {
  const base = s === undefined || s === null ? '' : String(s);
  if (base.length >= n) return base;
  return base + ch.repeat(n - base.length);
}

// Crea matriz de celdas vacías [rows × 4]
function newCeldas(rows: number): CeldaTabla[][] {
  const grid: CeldaTabla[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: CeldaTabla[] = [];
    for (let c = 0; c < 4; c++) {
      row.push({
        texto: '',
        align: 'left',
        bordeSup: true,
        bordeDer: true,
        bordeIzq: true,
        bordeInf: true,
      });
    }
    grid.push(row);
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Sello "Resumen del Proyecto" (lista de materiales) para planos de Fibra Óptica.
 * Genera una tabla 4 columnas (No | DESCRIPCION | CANTIDAD | UNIDAD MED.) cuyo
 * número de filas depende dinámicamente del contenido de LoElemResumen.
 *
 * Características portadas del Magik:
 *  - Atributos dinámicos: cada descripción crea un layout_attribute_definition
 *    cuyo valor (si está definido) sobrescribe la cantidad por defecto.
 *  - Color de línea rojo (1,0,0) para títulos y datos.
 *  - Bordes de la fila 1 (título) ocultos en sup/der/izq.
 *  - Anchos de columna: 6 / 120 / 30 / 20 mm. Altura de fila: 6 mm.
 */
export class CResumenDelProyectoRof {
  // ── Slots ─────────────────────────────────────────────────────────────────
  tipo: TipoResumen = undefined;            // Magik: :tipo (elem_red | estructuras)
  LoElemResumen: ResumenRow[] = [];         // Magik: :LoElemResumen (lista de tripletas)

  // Heredados del padre (c_base_sello_fibra) — simulados para la demo
  o_color_linea: [number, number, number] = [1.0, 0.0, 0.0];
  o_coord_inicio: [number, number] = [0, 0];

  // Atributos dinámicos (def_attribute en Magik) — clave = descToAttrName(desc)
  attributes: Record<string, AttributeDef> = {};

  // Tabla generada por configura_tabla()
  o_tablas: { tbl_lista_materiales?: TablaResumen } = {};

  // ── new_with(PoResumen) ───────────────────────────────────────────────────
  // Magik: c_resumen_del_proyecto_rof.new_with(PoResumen, _gather args)
  // Asigna LoElemResumen y delega en super.new_with(property_list…).
  static new_with(PoResumen: ResumenRow[]): CResumenDelProyectoRof {
    const inst = new CResumenDelProyectoRof();
    inst.LoElemResumen = PoResumen ?? [];
    return inst;
  }

  // ── defined_attributes / defined_attributes_dinamicos ─────────────────────
  // Magik: combina atributos del padre + uno por cada fila de LoElemResumen.
  defined_attributes(): AttributeDef[] {
    const base: AttributeDef[] = []; // c_base_sello_fibra.defined_attributes (no migrado aquí)
    return this.defined_attributes_dinamicos(base);
  }

  defined_attributes_dinamicos(attribs: AttributeDef[]): AttributeDef[] {
    for (const row of this.LoElemResumen) {
      const name = descToAttrName(row[0]);
      attribs.push({ name, defaultValue: undefined, value: undefined });
    }
    return attribs;
  }

  // ── define_attributes() ───────────────────────────────────────────────────
  // Magik: invocación a nivel de clase — materializa el diccionario this.attributes.
  define_attributes(): void {
    this.attributes = {};
    for (const def of this.defined_attributes()) {
      this.attributes[def.name] = { ...def };
    }
  }

  // ── configura_tabla() ─────────────────────────────────────────────────────
  // Magik: crea la c_tabla (2 + N filas × 4 cols), fija longitudes y oculta
  // bordes de las celdas de la fila 1 (título).
  configura_tabla(): void {
    this.o_color_linea = [1.0, 0.0, 0.0];

    const renglones_agregar = this.LoElemResumen.length;
    const totalRows = 2 + renglones_agregar;

    const tabla: TablaResumen = {
      id: 'tbl_lista_materiales',
      rows: totalRows,
      cols: 4,
      colWidths: [6, 120, 30, 20],
      rowHeight: 6,
      celdas: newCeldas(totalRows),
    };

    // Magik: oculta bordes sup/der/izq de la fila 1 (índices 1..4)
    for (let c = 0; c < 4; c++) {
      tabla.celdas[0][c].bordeSup = false;
      tabla.celdas[0][c].bordeDer = false;
      tabla.celdas[0][c].bordeIzq = false;
    }

    this.o_tablas.tbl_lista_materiales = tabla;
  }

  // ── asigna_celdas_a_colorear() ────────────────────────────────────────────
  // Magik: devuelve la lista de celdas que deben pintarse con o_color_linea.
  // Resultado: [tabla, row, col, color][] — fila 1 col 2 + todas las filas
  // de datos (3..N) en sus 4 columnas.
  asigna_celdas_a_colorear(): Array<['tbl_lista_materiales', number, number, [number, number, number]]> {
    const tabla = this.o_tablas.tbl_lista_materiales;
    if (!tabla) return [];

    const lst: Array<['tbl_lista_materiales', number, number, [number, number, number]]> = [];
    lst.push(['tbl_lista_materiales', 1, 2, this.o_color_linea]);

    for (let r = 3; r <= tabla.rows; r++) {
      lst.push(['tbl_lista_materiales', r, 1, this.o_color_linea]);
      lst.push(['tbl_lista_materiales', r, 2, this.o_color_linea]);
      lst.push(['tbl_lista_materiales', r, 3, this.o_color_linea]);
      lst.push(['tbl_lista_materiales', r, 4, this.o_color_linea]);
    }
    return lst;
  }

  // ── etiqueta_celdas() ─────────────────────────────────────────────────────
  // Magik: títulos fijos (fila 1 y 2) + delega filas de datos en etiqueta_celdas_desc().
  etiqueta_celdas(): void {
    this._asigna_texto_celda(1, 2, 'RESUMEN DEL PROYECTO', 35, 'center'); // Magik :centre_right ≈ centrado-derecha
    this._asigna_texto_celda(2, 1, 'No', 30, 'left');
    this._asigna_texto_celda(2, 2, 'DESCRIPCION', 30, 'left');
    this._asigna_texto_celda(2, 3, 'CANTIDAD', 30, 'left');
    this._asigna_texto_celda(2, 4, 'UNIDAD MED.', 30, 'left');

    this.etiqueta_celdas_desc();
  }

  // ── actualiza_datos() ─────────────────────────────────────────────────────
  // Magik: tras edición de atributos, recalcula la columna CANTIDAD.
  actualiza_datos(): void {
    this.etiqueta_celdas_desc();
  }

  // ── calcula_datos() ───────────────────────────────────────────────────────
  // Magik: devuelve property_list vacío (placeholder rellenado por info_sello_propiedades).
  calcula_datos(): Record<string, unknown> {
    const lo_valores: Record<string, unknown> = {};
    this.info_sello_propiedades(lo_valores);
    return lo_valores;
  }

  // ── llena_datos_celdas() ──────────────────────────────────────────────────
  // Magik: cuerpo vacío en el original.
  llena_datos_celdas(): void {
    // intencionalmente vacío
  }

  // ── etiqueta_celdas_desc() ────────────────────────────────────────────────
  // Magik: itera LoElemResumen, escribe fila a fila (idx, desc_uc, cantidad, unidadMed).
  // Si el atributo dinámico para esa descripción tiene valor, sobrescribe la cantidad.
  etiqueta_celdas_desc(): void {
    const tabla = this.o_tablas.tbl_lista_materiales;
    if (!tabla) return;

    let cont = 2; // arranca en fila 3 al primer incremento
    for (const row of this.LoElemResumen) {
      cont += 1;
      const [desc, cantidad, unidadMed] = row;
      const name = descToAttrName(desc);

      const desc_uc = String(desc).toUpperCase();           // Magik: write_string.uppercase

      if (tabla.rows >= cont) {
        this._asigna_texto_celda(cont, 1, String(cont - 2), 25, 'left');
        this._asigna_texto_celda(cont, 2, desc_uc, 25, 'left');                       // :centre_left ≈ left
        this._asigna_texto_celda(cont, 4, String(unidadMed ?? ''), 25, 'left');

        const override = this.attributes[name]?.value;
        const valor = override !== undefined && override !== null && override !== ''
          ? String(override)
          : (cantidad === undefined || cantidad === null ? '' : String(cantidad));

        this._asigna_texto_celda(cont, 3, fillUpWith(valor, 10), 25, 'left');
      }
    }
  }

  // ── info_sello_propiedades(lo_valores) ────────────────────────────────────
  // Magik: en el original devuelve lo_valores sin modificar (hook para subclases).
  info_sello_propiedades(lo_valores: Record<string, unknown>): Record<string, unknown> {
    return lo_valores;
  }

  // ── valor_propiedad(Propiedad, dato_actual) ───────────────────────────────
  // Magik: si el atributo dinámico tiene value no-vacío, lo devuelve; si no,
  // devuelve el dato_actual (o "" si _unset).
  valor_propiedad(propiedad: string, datoActual: string | undefined): string {
    const fallback = datoActual ?? '';
    const attr = this.attributes[propiedad];
    if (attr && attr.value !== undefined && attr.value !== null && String(attr.value).length > 0) {
      return String(attr.value);
    }
    return fallback;
  }

  // ── helper privado equivalente a asigna_texto_celda(...) del padre ────────
  private _asigna_texto_celda(
    row: number,
    col: number,
    texto: string,
    _tam: number,
    align: 'left' | 'right' | 'center',
  ): void {
    const tabla = this.o_tablas.tbl_lista_materiales;
    if (!tabla) return;
    if (row < 1 || row > tabla.rows) return;
    if (col < 1 || col > 4) return;
    const cell = tabla.celdas[row - 1][col - 1];
    cell.texto = texto;
    cell.align = align;
  }
}

// =============================================================================
// Componente React — CResumenDelProyectoRofUI
// =============================================================================

const uiStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 12,
  background: '#1e1e2e',
  color: '#cdd6f4',
  padding: 16,
  borderRadius: 8,
  minWidth: 760,
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  marginBottom: 16,
};

const cellBase: React.CSSProperties = {
  padding: '3px 8px',
  fontSize: 11,
  color: '#cdd6f4',
};

const thStyle: React.CSSProperties = {
  ...cellBase,
  background: '#313244',
  color: '#cba6f7',
  textAlign: 'left',
  border: '1px solid #45475a',
};

const titleCellStyle: React.CSSProperties = {
  ...cellBase,
  background: '#181825',
  color: '#f9e2af',
  fontWeight: 'bold',
  letterSpacing: 2,
  textAlign: 'center',
  borderBottom: '1px solid #585b70',
};

const btnBase: React.CSSProperties = {
  padding: '5px 14px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: 12,
  marginRight: 8,
};

// Mock de filas de ejemplo (formato: [desc, cantidad, unidadMed])
const MOCK_ROWS_ELEM_RED: ResumenRow[] = [
  ['Cable FO 144 hilos', 1200, 'm'],
  ['Caja empalme FOSC 450', 4, 'pza'],
  ['Distribuidor óptico 96 P', 1, 'pza'],
  ['Patch cord SC/APC 3m', 24, 'pza'],
  ['Adaptador SC/APC', 96, 'pza'],
];

const MOCK_ROWS_ESTRUCTURAS: ResumenRow[] = [
  ['Poste concreto 9m', 18, 'pza'],
  ['Retenida sencilla', 6, 'pza'],
  ['Pozo de visita tipo A', 3, 'pza'],
  ['Ducto PVC 110mm', 540, 'm'],
  ['Cinta señalización', 540, 'm'],
  ['Registro RDT', 8, 'pza'],
];

function rgbToCss(c: [number, number, number]): string {
  const [r, g, b] = c.map(x => Math.round(x * 255));
  return `rgb(${r},${g},${b})`;
}

export function CResumenDelProyectoRofUI() {
  const [tipo, setTipo] = useState<'ELEM_RED' | 'ESTRUCTURAS'>('ELEM_RED');
  const [instancia, setInstancia] = useState<CResumenDelProyectoRof | null>(null);
  const [, setTick] = useState(0); // forzar re-render tras mutar atributos
  const [msg, setMsg] = useState('');

  const tabla = instancia?.o_tablas.tbl_lista_materiales;
  const lineColor = instancia ? rgbToCss(instancia.o_color_linea) : '#f38ba8';

  // Lista de celdas a colorear (Set para lookup rápido)
  const coloredSet = useMemo(() => {
    if (!instancia) return new Set<string>();
    const lst = instancia.asigna_celdas_a_colorear();
    return new Set(lst.map(([, r, c]) => `${r}-${c}`));
  }, [instancia, tabla]);

  function handleInicializa() {
    const rows = tipo === 'ELEM_RED' ? MOCK_ROWS_ELEM_RED : MOCK_ROWS_ESTRUCTURAS;
    const inst = CResumenDelProyectoRof.new_with(rows);
    inst.tipo = tipo;
    inst.define_attributes();
    inst.configura_tabla();
    inst.etiqueta_celdas();
    setInstancia(inst);
    setMsg(`Tabla generada — ${rows.length} elementos · ${2 + rows.length} filas`);
  }

  function handleAttrChange(name: string, value: string) {
    if (!instancia) return;
    if (instancia.attributes[name]) {
      instancia.attributes[name].value = value === '' ? undefined : value;
      instancia.actualiza_datos();
      setTick(t => t + 1);
    }
  }

  function handleReset() {
    setInstancia(null);
    setMsg('');
  }

  return (
    <div style={uiStyle}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CResumenDelProyectoRof
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          c_base_sello_fibra → sello tabla "Resumen del Proyecto" (FO)
        </span>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <label style={{ color: '#89dceb', fontSize: 12 }}>tipo:</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as 'ELEM_RED' | 'ESTRUCTURAS')}
          style={{
            background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
            borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
          }}
        >
          <option value="ELEM_RED">ELEM_RED (elementos de red)</option>
          <option value="ESTRUCTURAS">ESTRUCTURAS</option>
        </select>

        <button
          onClick={handleInicializa}
          style={{ ...btnBase, background: '#a6e3a1', color: '#1e1e2e' }}
        >
          new_with() → configura_tabla() → etiqueta_celdas()
        </button>

        <button
          onClick={handleReset}
          disabled={!instancia}
          style={{
            ...btnBase,
            background: instancia ? '#f38ba8' : '#313244',
            color: instancia ? '#1e1e2e' : '#585b70',
          }}
        >
          reset
        </button>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          background: '#313244', border: '1px solid #45475a', borderRadius: 4,
          padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11,
        }}>
          {msg}
        </div>
      )}

      {/* Estado de slots */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'tipo', val: instancia?.tipo ?? '—' },
          { label: 'LoElemResumen.size', val: String(instancia?.LoElemResumen.length ?? 0) },
          { label: 'o_color_linea', val: instancia ? rgbToCss(instancia.o_color_linea) : '—' },
          { label: 'tabla.rows × cols', val: tabla ? `${tabla.rows} × ${tabla.cols}` : '—' },
        ].map(item => (
          <div key={item.label} style={{
            background: '#313244', borderRadius: 4, padding: '4px 10px', fontSize: 11,
          }}>
            <span style={{ color: '#585b70' }}>{item.label}: </span>
            <span style={{ color: '#a6e3a1' }}>{item.val}</span>
          </div>
        ))}
      </div>

      {!tabla && (
        <div style={{ color: '#585b70', fontSize: 12, textAlign: 'center', padding: 32 }}>
          Pulsa el botón para instanciar y configurar la tabla.
        </div>
      )}

      {/* Tabla generada */}
      {tabla && (
        <>
          <table style={tableStyle}>
            <colgroup>
              {tabla.colWidths.map((w, i) => (
                <col key={i} style={{ width: `${(w / tabla.colWidths.reduce((a, b) => a + b, 0)) * 100}%` }} />
              ))}
            </colgroup>
            <tbody>
              {tabla.celdas.map((row, ri) => {
                const rowNum = ri + 1;
                const isTitle = rowNum === 1;
                const isHeader = rowNum === 2;
                return (
                  <tr key={ri}>
                    {row.map((cel, ci) => {
                      const colNum = ci + 1;
                      const isColored = coloredSet.has(`${rowNum}-${colNum}`);
                      const baseStyle: React.CSSProperties = isTitle
                        ? titleCellStyle
                        : isHeader
                          ? thStyle
                          : { ...cellBase, border: '1px solid #45475a' };
                      const styleMerged: React.CSSProperties = {
                        ...baseStyle,
                        textAlign: cel.align,
                        color: isColored && !isTitle && !isHeader ? lineColor : baseStyle.color,
                        borderTop:   isTitle && !cel.bordeSup ? 'none' : baseStyle.border,
                        borderRight: isTitle && !cel.bordeDer ? 'none' : baseStyle.border,
                        borderLeft:  isTitle && !cel.bordeIzq ? 'none' : baseStyle.border,
                        borderBottom: isTitle && !cel.bordeInf ? 'none' : baseStyle.border,
                      };
                      return (
                        <td key={ci} style={styleMerged}>
                          {cel.texto || (isTitle || isHeader ? '' : <span style={{ color: '#45475a' }}>—</span>)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Override de atributos dinámicos */}
          <div style={{ marginTop: 8, borderTop: '1px solid #45475a', paddingTop: 10 }}>
            <div style={{ color: '#89dceb', fontSize: 12, marginBottom: 6 }}>
              Atributos dinámicos (override de cantidad por descripción):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {instancia && Object.entries(instancia.attributes).map(([name, def]) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#181825', padding: '4px 8px', borderRadius: 4,
                }}>
                  <span style={{ color: '#bac2de', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name}
                  </span>
                  <input
                    type="text"
                    value={def.value ?? ''}
                    onChange={e => handleAttrChange(name, e.target.value)}
                    placeholder="—"
                    style={{
                      background: 'transparent', border: '1px solid #45475a',
                      color: '#a6e3a1', fontFamily: 'monospace', fontSize: 11,
                      width: 110, padding: '2px 4px', borderRadius: 3, outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
