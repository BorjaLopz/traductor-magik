/**
 * CPlacaSecundarios.tsx
 * Migración de c_placa_secundarios.magik  (Sigma Tao / lgranados, 13-Dic-2010)
 *
 * Jerarquía Magik: c_placa_secundarios extends :c_base_sello_fibra
 * Propósito: placa de identificación para planos de red de fibra de secundarios.
 *
 * Estructura idéntica a c_placa_principales (mismas 6 tablas y posiciones).
 * Diferencias respecto a c_placa_principales:
 *   - tbl_4 etiquetas: "DISTRITO" en lugar de "CAPACIDAD"
 *   - tbl_5 etiquetas: dos "CALIBRE" (calibre1 + calibre2) en lugar de CALIBRE+INDICADOR
 *   - tbl_5 col4 data: calibre2 (antes era indicador/cuenta)
 *   - Tamaño de fuente datos dinámicos: 22pt (antes 28pt)
 *   - Atributos: sgl_ctl, distrito, cable, calibre1, calibre2, cuenta, fecha, constructor
 */

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a defined_attributes
// ---------------------------------------------------------------------------

export interface PlacaSecundariosAtributos {
  sgl_ctl    : string;  // "SGL-CTL"
  distrito   : string;  // "DISTRITO"
  cable      : string;  // "CABLE"
  calibre1   : string;  // "CALIBRE" (primer calibre)
  calibre2   : string;  // "CALIBRE" (segundo calibre)
  cuenta     : string;  // "CUENTA"
  fecha      : string;  // "FECHA"
  constructor: string;  // "CONSTRUCTOR"
}

// ---------------------------------------------------------------------------
// Estructura de tablas — idéntica a c_placa_principales
// Magik: configura_tabla() — mismas dimensiones y posiciones
// ---------------------------------------------------------------------------

interface TablaConfig {
  nombre     : string;
  filas      : number;
  cols       : number;
  alturas    : number[];
  anchos     : number[];
  bordeOculto?: Set<string>; // "fi,ci" → bBorde_Izq/Inf/Sup? = false
  offsetX    : number;
  offsetY    : number;
}

const TABLAS: TablaConfig[] = [
  // tbl_1: marco exterior 1×1, 130×50mm — origen coord_inicio
  { nombre: 'tbl_1', filas: 1, cols: 1, alturas: [50], anchos: [130], offsetX: 0,   offsetY: 0    },
  // tbl_2: área interior 1×1, 120×40mm — offset (+50, -50)
  { nombre: 'tbl_2', filas: 1, cols: 1, alturas: [40], anchos: [120], offsetX: 50,  offsetY: -50  },
  // tbl_3: área logo 1×1, 26×40mm — offset (+50, -50)
  { nombre: 'tbl_3', filas: 1, cols: 1, alturas: [40], anchos: [26],  offsetX: 50,  offsetY: -50  },
  // tbl_4: fila 1×6, 7.5mm × 6×15mm — offset (+330, -110)
  // bBorde_Izq/Inf/Sup? = false en celdas (1,1),(1,3),(1,5) → 0-based: (0,0),(0,2),(0,4)
  {
    nombre: 'tbl_4', filas: 1, cols: 6,
    alturas: [7.5], anchos: [15, 15, 15, 15, 15, 15],
    bordeOculto: new Set(['0,0', '0,2', '0,4']),
    offsetX: 330, offsetY: -110,
  },
  // tbl_5: fila 1×6, 7.5mm × 6×15mm — offset (+330, -215)
  {
    nombre: 'tbl_5', filas: 1, cols: 6,
    alturas: [7.5], anchos: [15, 15, 15, 15, 15, 15],
    bordeOculto: new Set(['0,0', '0,2', '0,4']),
    offsetX: 330, offsetY: -215,
  },
  // tbl_6: fila 1×4, 7.5mm × 4×22.5mm — offset (+330, -310)
  {
    nombre: 'tbl_6', filas: 1, cols: 4,
    alturas: [7.5], anchos: [22.5, 22.5, 22.5, 22.5],
    bordeOculto: new Set(['0,0', '0,2']),
    offsetX: 330, offsetY: -310,
  },
];

// ---------------------------------------------------------------------------
// Etiquetas fijas — etiqueta_celdas()
// Diferencias vs c_placa_principales:
//   tbl_4 col2: "DISTRITO" (antes "CAPACIDAD")
//   tbl_5 col0: "CALIBRE", col2: "CALIBRE" (antes "CALIBRE" + "CUENTA")
//   tbl_5 col4: "CUENTA" (antes "INDICADOR")
// ---------------------------------------------------------------------------
const ETIQUETAS: Record<string, Record<number, Record<number, string>>> = {
  tbl_3: { 0: { 0: '★' } },
  // Magik: asigna_texto_celda(:tbl_4, 1,1,"SIGLAS\nCENTRAL") / (1,3,"DISTRITO") / (1,5,"CABLE")
  tbl_4: { 0: { 0: 'SIGLAS\nCENTRAL', 2: 'DISTRITO', 4: 'CABLE' } },
  // Magik: asigna_texto_celda(:tbl_5, 1,1,"CALIBRE") / (1,3,"CALIBRE") / (1,5,"CUENTA")
  // Nota: dos etiquetas "CALIBRE" distintas → calibre1 y calibre2
  tbl_5: { 0: { 0: 'CALIBRE', 2: 'CALIBRE', 4: 'CUENTA' } },
  tbl_6: { 0: { 0: 'FECHA', 2: 'CONSTRUCTOR' } },
};

// ---------------------------------------------------------------------------
// Color de fondo — idéntico a c_placa_principales
// Magik: set_fill_colour(colour.new_rgb(0.82, 0.91, 1))
// ---------------------------------------------------------------------------
const FILL_COLOR = 'rgb(209, 232, 255)';

// ---------------------------------------------------------------------------
// Subcomponente de tabla — mismo patrón que CPlacaPrincipales
// ---------------------------------------------------------------------------
const SCALE = 1.8;

function TablaLayout({
  tabla,
  valores,
}: {
  tabla  : TablaConfig;
  valores: Record<string, string>;
}) {
  const etiqTabla = ETIQUETAS[tabla.nombre] ?? {};

  return (
    <div style={{ position: 'absolute', left: tabla.offsetX * SCALE, top: Math.abs(tabla.offsetY) * SCALE }}>
      <div style={{ fontSize: 8, color: '#585b70', marginBottom: 1 }}>:{tabla.nombre}</div>
      <table style={{
        borderCollapse: 'collapse', tableLayout: 'fixed',
        background: FILL_COLOR, border: '1px solid #4a7ab5',
      }}>
        <colgroup>
          {tabla.anchos.map((w, ci) => <col key={ci} style={{ width: w * SCALE }} />)}
        </colgroup>
        <tbody>
          {Array.from({ length: tabla.filas }, (_, fi) => (
            <tr key={fi}>
              {Array.from({ length: tabla.cols }, (_, ci) => {
                const key      = `${fi},${ci}`;
                const oculto   = tabla.bordeOculto?.has(key) ?? false;
                const etiqueta = etiqTabla[fi]?.[ci] ?? '';
                const valorDin = valores[`${tabla.nombre}:${fi},${ci}`] ?? '';
                const isData   = !etiqueta && ci % 2 === 1 && tabla.cols > 1;
                const isLogo   = tabla.nombre === 'tbl_3';

                return (
                  <td key={ci} style={{
                    height       : tabla.alturas[fi] * SCALE,
                    width        : tabla.anchos[ci] * SCALE,
                    padding      : '1px 3px',
                    verticalAlign: 'middle',
                    textAlign    : etiqueta?.includes('\n') ? 'left' : 'center',
                    fontSize     : 8,
                    fontWeight   : etiqueta && !isData ? 'bold' : 'normal',
                    borderLeft   : oculto ? 'none' : '1px solid #4a7ab5',
                    borderBottom : oculto ? 'none' : '1px solid #4a7ab5',
                    borderTop    : oculto ? 'none' : '1px solid #4a7ab5',
                    borderRight  : '1px solid #4a7ab5',
                    whiteSpace   : 'pre-line',
                    color        : isData ? '#1a3a6b' : '#2c5f99',
                    background   : isData ? 'rgba(255,255,255,0.6)' : 'transparent',
                  }}>
                    {isLogo
                      ? <span style={{ fontSize: 16 }}>★</span>
                      : etiqueta || valorDin || (isData ? <span style={{ color: '#aac4e0' }}>—</span> : '')}
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
// Atributos por defecto (mock)
// ---------------------------------------------------------------------------
const ATTRS_DEFAULT: PlacaSecundariosAtributos = {
  sgl_ctl    : 'MEX-01',
  distrito   : 'D-042',
  cable      : 'FO-24',
  calibre1   : 'G.652D',
  calibre2   : 'G.657A',
  cuenta     : '002-017',
  fecha      : '2024-12',
  constructor: 'SIGMA TAO',
};

// Mapeo atributo → tabla:fi,ci — llena_datos_dinamicos()
// Magik: asigna_texto_celda(:tbl_X, 1, col_par, _self.campo, 22)
const ATTRS_MAP: Record<keyof PlacaSecundariosAtributos, string> = {
  sgl_ctl    : 'tbl_4:0,1',
  distrito   : 'tbl_4:0,3',
  cable      : 'tbl_4:0,5',
  calibre1   : 'tbl_5:0,1',
  calibre2   : 'tbl_5:0,3',
  cuenta     : 'tbl_5:0,5',
  fecha      : 'tbl_6:0,1',
  constructor: 'tbl_6:0,3',
};

const ATTRS_LABELS: Record<keyof PlacaSecundariosAtributos, string> = {
  sgl_ctl    : 'SGL-CTL',
  distrito   : 'DISTRITO',
  cable      : 'CABLE',
  calibre1   : 'CALIBRE 1',
  calibre2   : 'CALIBRE 2',
  cuenta     : 'CUENTA',
  fecha      : 'FECHA',
  constructor: 'CONSTRUCTOR',
};

// ---------------------------------------------------------------------------
// Componente principal — CPlacaSecundarios
// ---------------------------------------------------------------------------
export function CPlacaSecundariosUI() {
  const [attrs, setAttrs] = useState<PlacaSecundariosAtributos>(ATTRS_DEFAULT);

  function handleChange(k: keyof PlacaSecundariosAtributos, v: string) {
    setAttrs(prev => ({ ...prev, [k]: v }));
  }

  // llena_datos_dinamicos() → mapa valores para TablaLayout
  const valores: Record<string, string> = {};
  for (const [k, cellKey] of Object.entries(ATTRS_MAP)) {
    valores[cellKey] = attrs[k as keyof PlacaSecundariosAtributos];
  }

  const maxX = Math.max(...TABLAS.map(t => t.offsetX + t.anchos.reduce((a, b) => a + b, 0)));
  const maxY = Math.max(...TABLAS.map(t => Math.abs(t.offsetY) + t.alturas.reduce((a, b) => a + b, 0)));

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CPlacaSecundarios</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          :c_base_sello_fibra → placa de identificación para planos de secundarios
        </span>
      </div>

      {/* Diferencias respecto a CPlacaPrincipales */}
      <div style={{ marginBottom: 10, padding: '6px 10px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, fontSize: 11 }}>
        <strong>Δ vs c_placa_principales:</strong>
        {' '}tbl_4 col3→DISTRITO (antes CAPACIDAD) ·
        {' '}tbl_5: CALIBRE+CALIBRE+CUENTA (antes CALIBRE+CUENTA+INDICADOR) ·
        {' '}datos 22pt (antes 28pt)
      </div>

      {/* Formulario — defined_attributes */}
      <fieldset style={{ marginBottom: 14, padding: 10, borderRadius: 4, border: '1px solid #cce0ff', background: '#f0f7ff' }}>
        <legend style={{ fontSize: 11, fontWeight: 'bold', color: '#2c5f99' }}>
          Atributos capturables (defined_attributes → llena_datos_dinamicos)
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {(Object.keys(ATTRS_LABELS) as (keyof PlacaSecundariosAtributos)[]).map(k => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 11 }}>
              <span style={{ color: '#2c5f99', fontWeight: 'bold' }}>{ATTRS_LABELS[k]}</span>
              <input
                value={attrs[k]}
                onChange={e => handleChange(k, e.target.value)}
                style={{
                  padding: '3px 6px', border: '1px solid #99bde0',
                  borderRadius: 3, fontSize: 12, background: '#fff', color: '#000',
                }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Vista previa del layout */}
      <div style={{ marginBottom: 8, fontSize: 11, color: '#555' }}>
        Vista previa (escala {SCALE}px/mm) — 6 tablas posicionadas con offsetX/Y:
      </div>
      <div style={{
        position: 'relative',
        width   : maxX * SCALE + 40,
        height  : maxY * SCALE + 40,
        background: '#e8f0fb',
        borderRadius: 6,
        border  : '1px solid #99bde0',
        overflow: 'hidden',
      }}>
        {TABLAS.map(t => (
          <TablaLayout key={t.nombre} tabla={t} valores={valores} />
        ))}
      </div>

      {/* Tabla de dimensiones */}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
          Coordenadas y dimensiones (configura_tabla)
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
                  {t.bordeOculto
                    ? [...t.bordeOculto].map(k => {
                        const [f, c] = k.split(',').map(Number);
                        return `(${f+1},${c+1})`;
                      }).join(' ')
                    : '—'}
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

export default CPlacaSecundariosUI;
