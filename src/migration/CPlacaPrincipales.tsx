/**
 * CPlacaPrincipales.tsx
 * Migración de c_placa_principales.magik  (Sigma Tao / lgranados, 13-Dic-2010)
 *
 * Jerarquía Magik: c_placa_principales extends :c_base_sello_fibra
 * Propósito: placa de identificación para planos de red de fibra de principales.
 * 6 tablas posicionadas: tbl_1/2/3 = marco+logo, tbl_4/5/6 = filas de datos.
 * 8 atributos capturables: sgl_ctl, cable, capacidad, calibre, cuenta, indicador,
 * fecha, constructor.
 */

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a defined_attributes / layout_attribute_definition
// ---------------------------------------------------------------------------

/** 8 atributos Magik → interfaz TypeScript */
export interface PlacaPrincipalesAtributos {
  sgl_ctl    : string;  // "SIGLAS CENTRAL"
  cable      : string;  // "CABLE"
  capacidad  : string;  // "CAPACIDAD"
  calibre    : string;  // "CALIBRE"
  cuenta     : string;  // "CUENTA"
  indicador  : string;  // "INDICADOR"
  fecha      : string;  // "FECHA"
  constructor: string;  // "CONSTRUCTOR"
}

// ---------------------------------------------------------------------------
// Estructura de tablas — equivale a configura_tabla()
// Magik: crea_tabla(filas, cols, nombre) + nLongitud por fila/col
// ---------------------------------------------------------------------------

interface TablaConfig {
  nombre   : string;
  filas    : number;
  cols     : number;
  alturas  : number[];   // mm por fila
  anchos   : number[];   // mm por col
  // Celdas con bordes izq/inf/sup ocultos — Magik: bBorde_Izq/Inf/Sup? = false
  bordeOculto?: Set<string>; // "fi,ci" → sin borde izq+inf+sup
  // Posición relativa a coord_inicio (en unidades de layout)
  offsetX  : number;
  offsetY  : number;
}

/** configura_tabla() — dimensiones y posiciones de las 6 tablas */
const TABLAS: TablaConfig[] = [
  // tbl_1: marco exterior 1×1, 130×50mm
  {
    nombre: 'tbl_1', filas: 1, cols: 1,
    alturas: [50], anchos: [130],
    offsetX: 0, offsetY: 0,
  },
  // tbl_2: área interior 1×1, 120×40mm — offset (+50, -50)
  {
    nombre: 'tbl_2', filas: 1, cols: 1,
    alturas: [40], anchos: [120],
    offsetX: 50, offsetY: -50,
  },
  // tbl_3: área logo 1×1, 26×40mm — mismo offset que tbl_2
  {
    nombre: 'tbl_3', filas: 1, cols: 1,
    alturas: [40], anchos: [26],
    offsetX: 50, offsetY: -50,
  },
  // tbl_4: fila de datos 1×6, 7.5mm × 6×15mm — offset (+330, -110)
  // Bordes izq/inf/sup ocultos en celdas (1,1),(1,3),(1,5) → visual "label|valor"
  {
    nombre: 'tbl_4', filas: 1, cols: 6,
    alturas: [7.5], anchos: [15, 15, 15, 15, 15, 15],
    bordeOculto: new Set(['0,0', '0,2', '0,4']),  // (1,1),(1,3),(1,5) en 0-based
    offsetX: 330, offsetY: -110,
  },
  // tbl_5: fila de datos 1×6, 7.5mm × 6×15mm — offset (+330, -215)
  {
    nombre: 'tbl_5', filas: 1, cols: 6,
    alturas: [7.5], anchos: [15, 15, 15, 15, 15, 15],
    bordeOculto: new Set(['0,0', '0,2', '0,4']),
    offsetX: 330, offsetY: -215,
  },
  // tbl_6: fila de datos 1×4, 7.5mm × 4×22.5mm — offset (+330, -310)
  {
    nombre: 'tbl_6', filas: 1, cols: 4,
    alturas: [7.5], anchos: [22.5, 22.5, 22.5, 22.5],
    bordeOculto: new Set(['0,0', '0,2']),          // (1,1),(1,3) en 0-based
    offsetX: 330, offsetY: -310,
  },
];

// ---------------------------------------------------------------------------
// Etiquetas fijas — equivalen a etiqueta_celdas()
// Magik: asigna_texto_celda + asigna_simbolo_celda
// ---------------------------------------------------------------------------

// Mapeo: tablaNombre → fila 0-based → col 0-based → texto etiqueta
const ETIQUETAS: Record<string, Record<number, Record<number, string>>> = {
  // tbl_3: logo (asigna_simbolo_celda → se renderiza como "★")
  tbl_3: { 0: { 0: '★' } },
  // tbl_4: "SIGLAS\nCENTRAL" | _ | "CABLE" | _ | "CAPACIDAD" | _
  // Magik: Celda(1,1)→col0, Celda(1,3)→col2, Celda(1,5)→col4
  tbl_4: { 0: { 0: 'SIGLAS\nCENTRAL', 2: 'CABLE', 4: 'CAPACIDAD' } },
  // tbl_5: "CALIBRE" | _ | "CUENTA" | _ | "INDICADOR" | _
  tbl_5: { 0: { 0: 'CALIBRE', 2: 'CUENTA', 4: 'INDICADOR' } },
  // tbl_6: "FECHA" | _ | "CONSTRUCTOR" | _
  tbl_6: { 0: { 0: 'FECHA', 2: 'CONSTRUCTOR' } },
};

// ---------------------------------------------------------------------------
// Colores — set_fill_colour(colour.new_rgb(0.82, 0.91, 1))
// ---------------------------------------------------------------------------
const FILL_COLOR = 'rgb(209, 232, 255)'; // 0.82×255≈209, 0.91×255≈232, 1×255=255

// ---------------------------------------------------------------------------
// Subcomponente — renderiza una tabla del layout
// ---------------------------------------------------------------------------
const SCALE = 1.8; // px por mm

function TablaLayout({
  tabla,
  valores,
}: {
  tabla  : TablaConfig;
  valores: Record<string, string>; // "tablaNombre:fi,ci" → valor dinámico
}) {
  const etiqTabla = ETIQUETAS[tabla.nombre] ?? {};

  return (
    <div style={{
      position : 'absolute',
      left     : tabla.offsetX * SCALE,
      top      : Math.abs(tabla.offsetY) * SCALE,
    }}>
      <div style={{ fontSize: 8, color: '#585b70', marginBottom: 1 }}>
        :{tabla.nombre}
      </div>
      <table style={{
        borderCollapse: 'collapse',
        tableLayout   : 'fixed',
        background    : FILL_COLOR,
        border        : '1px solid #4a7ab5',
      }}>
        <colgroup>
          {tabla.anchos.map((w, ci) => (
            <col key={ci} style={{ width: w * SCALE }} />
          ))}
        </colgroup>
        <tbody>
          {Array.from({ length: tabla.filas }, (_, fi) => (
            <tr key={fi}>
              {Array.from({ length: tabla.cols }, (_, ci) => {
                const key        = `${fi},${ci}`;
                const oculto     = tabla.bordeOculto?.has(key) ?? false;
                const etiqueta   = etiqTabla[fi]?.[ci] ?? '';
                const valorKey   = `${tabla.nombre}:${fi},${ci}`;
                const valorDin   = valores[valorKey] ?? '';
                const isDinCell  = !!valorDin || (!etiqueta && ci % 2 === 1 && tabla.cols > 1);
                const isLogoCell = tabla.nombre === 'tbl_3';

                return (
                  <td key={ci} style={{
                    height        : tabla.alturas[fi] * SCALE,
                    width         : tabla.anchos[ci] * SCALE,
                    padding       : '1px 3px',
                    verticalAlign : 'middle',
                    textAlign     : etiqueta && etiqueta.includes('\n') ? 'left' : 'center',
                    fontSize      : tabla.nombre === 'tbl_1' || tabla.nombre === 'tbl_2' ? 9 : 8,
                    fontWeight    : etiqueta && !isDinCell ? 'bold' : 'normal',
                    // Bordes — bBorde_Izq/Inf/Sup? = false → ocultos
                    borderLeft    : oculto ? 'none' : '1px solid #4a7ab5',
                    borderBottom  : oculto ? 'none' : '1px solid #4a7ab5',
                    borderTop     : oculto ? 'none' : '1px solid #4a7ab5',
                    borderRight   : '1px solid #4a7ab5',
                    whiteSpace    : 'pre-line',
                    color         : isDinCell ? '#1a3a6b' : '#2c5f99',
                    background    : isDinCell ? 'rgba(255,255,255,0.6)' : 'transparent',
                  }}>
                    {isLogoCell
                      ? <span style={{ fontSize: 16 }}>★</span>
                      : etiqueta || valorDin || (isDinCell ? <span style={{ color: '#aac4e0' }}>—</span> : '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — CPlacaPrincipales
// ---------------------------------------------------------------------------
const ATTRS_DEFAULT: PlacaPrincipalesAtributos = {
  sgl_ctl    : 'MEX-01',
  cable      : 'FO-12',
  capacidad  : '144 F',
  calibre    : 'G.652D',
  cuenta     : '001-042',
  indicador  : 'A1',
  fecha      : '2024-12',
  constructor: 'SIGMA TAO',
};

// Mapeo atributo → tabla:fi,ci (columnas pares = datos dinámicos)
// llena_datos_dinamicos() → asigna_texto_celda(:tbl_X, 1, col_par, valor)
const ATTRS_MAP: Record<keyof PlacaPrincipalesAtributos, string> = {
  sgl_ctl    : 'tbl_4:0,1',
  cable      : 'tbl_4:0,3',
  capacidad  : 'tbl_4:0,5',
  calibre    : 'tbl_5:0,1',
  cuenta     : 'tbl_5:0,3',
  indicador  : 'tbl_5:0,5',
  fecha      : 'tbl_6:0,1',
  constructor: 'tbl_6:0,3',
};

const ATTRS_LABELS: Record<keyof PlacaPrincipalesAtributos, string> = {
  sgl_ctl    : 'SIGLAS CENTRAL',
  cable      : 'CABLE',
  capacidad  : 'CAPACIDAD',
  calibre    : 'CALIBRE',
  cuenta     : 'CUENTA',
  indicador  : 'INDICADOR',
  fecha      : 'FECHA',
  constructor: 'CONSTRUCTOR',
};

export function CPlacaPrincipalesUI() {
  const [attrs, setAttrs] = useState<PlacaPrincipalesAtributos>(ATTRS_DEFAULT);

  function handleChange(k: keyof PlacaPrincipalesAtributos, v: string) {
    setAttrs(prev => ({ ...prev, [k]: v }));
  }

  // Construye el mapa de valores dinámicos a partir de attrs
  // llena_datos_dinamicos() → asigna_texto_celda(:tbl_X, 1, col_par, _self.campo)
  const valores: Record<string, string> = {};
  for (const [k, cellKey] of Object.entries(ATTRS_MAP)) {
    valores[cellKey] = attrs[k as keyof PlacaPrincipalesAtributos];
  }

  // Bounding box del layout: máx X = max(offsetX + anchoTotal), máx Y = max(|offsetY| + alturaTotal)
  const maxX = Math.max(...TABLAS.map(t => t.offsetX + t.anchos.reduce((a,b) => a+b, 0)));
  const maxY = Math.max(...TABLAS.map(t => Math.abs(t.offsetY) + t.alturas.reduce((a,b) => a+b, 0)));

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CPlacaPrincipales</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          :c_base_sello_fibra → placa de identificación para planos de principales
        </span>
      </div>

      {/* Formulario — defined_attributes + llena_datos_dinamicos */}
      <fieldset style={{ marginBottom: 14, padding: 10, borderRadius: 4, border: '1px solid #cce0ff', background: '#f0f7ff' }}>
        <legend style={{ fontSize: 11, fontWeight: 'bold', color: '#2c5f99' }}>
          Atributos capturables (defined_attributes → llena_datos_dinamicos)
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {(Object.keys(ATTRS_LABELS) as (keyof PlacaPrincipalesAtributos)[]).map(k => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 }}>
              <span style={{ color: '#2c5f99', fontWeight: 'bold' }}>{ATTRS_LABELS[k]}</span>
              <input
                value={attrs[k]}
                onChange={e => handleChange(k, e.target.value)}
                style={{ padding: '3px 6px', border: '1px solid #99bde0', borderRadius: 3, fontSize: 12, background: '#fff', color: '#000' }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Vista previa de la placa — layout posicionado */}
      <div style={{ marginBottom: 8, fontSize: 11, color: '#555' }}>
        Vista previa (escala {SCALE}px/mm) — 6 tablas posicionadas con offsetX/Y del configura_tabla():
      </div>
      <div style={{
        position  : 'relative',
        width     : maxX * SCALE + 40,
        height    : maxY * SCALE + 40,
        background: '#e8f0fb',
        borderRadius: 6,
        border    : '1px solid #99bde0',
        overflow  : 'hidden',
      }}>
        {TABLAS.map(t => (
          <TablaLayout key={t.nombre} tabla={t} valores={valores} />
        ))}
      </div>

      {/* Tabla de coordenadas */}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
          Coordenadas y dimensiones de las 6 tablas (configura_tabla)
        </summary>
        <table style={{ borderCollapse: 'collapse', fontSize: 11, marginTop: 6, width: '100%' }}>
          <thead>
            <tr>
              {['Tabla', 'F×C', 'Alturas(mm)', 'Anchos(mm)', 'offsetX', 'offsetY', 'Bordes ocultos'].map(h => (
                <th key={h} style={{ background: '#2c5f99', color: '#fff', padding: '3px 6px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLAS.map((t, i) => (
              <tr key={t.nombre} style={{ background: i % 2 === 0 ? '#f0f7ff' : '#fff' }}>
                <td style={{ padding: '2px 6px', color: '#2c5f99', fontWeight: 'bold' }}>:{t.nombre}</td>
                <td style={{ padding: '2px 6px' }}>{t.filas}×{t.cols}</td>
                <td style={{ padding: '2px 6px', color: '#c05' }}>[{t.alturas.join(', ')}]</td>
                <td style={{ padding: '2px 6px', color: '#c05' }}>[{t.anchos.join(', ')}]</td>
                <td style={{ padding: '2px 6px' }}>{t.offsetX}</td>
                <td style={{ padding: '2px 6px' }}>{t.offsetY}</td>
                <td style={{ padding: '2px 6px', color: '#888', fontSize: 10 }}>
                  {t.bordeOculto ? [...t.bordeOculto].map(k => {
                    const [f, c] = k.split(',').map(Number);
                    return `(${f+1},${c+1})`;
                  }).join(' ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <div style={{ marginTop: 8, fontSize: 10, color: '#888' }}>
        set_fill_colour: rgb(0.82, 0.91, 1.0) → {FILL_COLOR}
      </div>
    </div>
  );
}

export default CPlacaPrincipalesUI;
