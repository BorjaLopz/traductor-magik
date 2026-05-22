/**
 * CPlacaLargaDistancia.tsx
 * Migration: c_placa_larga_distancia.magik → TypeScript/React
 * Autor original: lgranados — Sigma Tao — 14/Dic/2010
 * Hereda de: c_base_sello_fibra
 *
 * Métodos migrados:
 *   configura_tabla()        → configurarTabla()  (incluye etiqueta_celdas)
 *   llena_datos_celdas()     → llenarDatosCeldas() [stub vacío, igual que original]
 *   defined_attributes       → interfaz PlacaAtribs
 *   llena_datos_dinamicos()  → llenarDatosDinamicos(tablas, atribs)
 */

import React, { useState } from 'react';

// ── defined_attributes ────────────────────────────────────────────────────────

export interface PlacaAtribs {
  ruta    : string;  // layout_attribute_definition.new(:ruta,    :string)
  long    : string;  // layout_attribute_definition.new(:long,    :string)
  pozo    : string;  // layout_attribute_definition.new(:pozo,    :string)
  empalme : string;  // layout_attribute_definition.new(:empalme, :string)
}

export const DEFAULT_PLACA: PlacaAtribs = {
  ruta: '', long: '', pozo: '', empalme: '',
};

// ── Tipos de configuración de tabla ───────────────────────────────────────────

export interface BordeCelda {
  izq: boolean; der: boolean; sup: boolean; inf: boolean;
}

export interface CeldaConfig {
  fila       : number;
  col        : number;
  texto?     : string;
  simbolo?   : string;
  tamLetra?  : number;
  alineacion?: string;
  bordes     : BordeCelda;
}

export interface TablaConfig {
  id        : string;
  xMm       : number;   // offset X desde o_coord_inicio (mm)
  yMm       : number;   // offset Y en screen-coords y-down (mm)
  anchoMm   : number;
  altoMm    : number;
  filas     : number;
  columnas  : number;
  colWidths?: number[]; // mm por columna
  celdas    : CeldaConfig[];
}

// ── Constantes de borde (reutilizadas en SVG y configurarTabla) ───────────────

const B_ALL  : BordeCelda = { izq:true,  der:true,  sup:true,  inf:true  };
const B_NONE : BordeCelda = { izq:false, der:false, sup:false, inf:false };
// tbl_5/6 cols 1 y 3: bBorde_Izq=false, bBorde_Inf=false, bBorde_Sup=false
const B_LABEL: BordeCelda = { izq:false, der:true,  sup:false, inf:false };

// ── configurarTabla() + etiqueta_celdas() ─────────────────────────────────────

export function configurarTabla(): TablaConfig[] {
  return [
    // tbl_1: marco principal izquierdo. 1×1, (0,0), 130×50 mm
    { id:'tbl_1', xMm:0,   yMm:0,   anchoMm:130, altoMm:50,  filas:1, columnas:1,
      celdas:[{ fila:1, col:1, bordes:B_ALL }] },

    // tbl_2: sección central. 1×1, (50, 50), 120×40 mm
    // coordinate.new(.o_coord_inicio.x+50, .o_coord_inicio.y-50) → screen y+50
    { id:'tbl_2', xMm:50,  yMm:50,  anchoMm:120, altoMm:40,  filas:1, columnas:1,
      celdas:[{ fila:1, col:1, bordes:B_ALL }] },

    // tbl_3: celda logo. 1×1, mismo origen que tbl_2, 26×40 mm
    // asigna_simbolo_celda(:tbl_3, 1, 1, "logo_sellos")
    { id:'tbl_3', xMm:50,  yMm:50,  anchoMm:26,  altoMm:40,  filas:1, columnas:1,
      celdas:[{ fila:1, col:1, simbolo:'logo_sellos', bordes:B_ALL }] },

    // tbl_4: texto advertencia. 1×1, (330, 70), 90×15 mm, sin bordes
    // asigna_texto_celda(:tbl_4,1,1, texto1, 36, :top_centre)
    { id:'tbl_4', xMm:330, yMm:70,  anchoMm:90,  altoMm:15,  filas:1, columnas:1,
      celdas:[{
        fila:1, col:1,
        texto     :'PRECAUCION\nCABLE DE FIBRA OPTICA\nLARGA DISTANCIA',
        tamLetra  :36, alineacion:'top_centre', bordes:B_NONE,
      }] },

    // tbl_5: fila RUTA/LONG. 1×4, (330, 240), 90×7.5 mm, cols 22.5 mm c/u
    // ocultar celdas (1,1) y (1,3): bBorde_Izq/Inf/Sup = false
    { id:'tbl_5', xMm:330, yMm:240, anchoMm:90,  altoMm:7.5, filas:1, columnas:4,
      colWidths:[22.5, 22.5, 22.5, 22.5],
      celdas:[
        { fila:1, col:1, texto:'RUTA',  tamLetra:28, bordes:B_LABEL },
        { fila:1, col:2,                              bordes:B_ALL   },
        { fila:1, col:3, texto:'LONG.', tamLetra:28, bordes:B_LABEL },
        { fila:1, col:4,                              bordes:B_ALL   },
      ] },

    // tbl_6: fila POZO/EMPALME. 1×4, (330, 340), 90×7.5 mm, cols 22.5 mm c/u
    { id:'tbl_6', xMm:330, yMm:340, anchoMm:90,  altoMm:7.5, filas:1, columnas:4,
      colWidths:[22.5, 22.5, 22.5, 22.5],
      celdas:[
        { fila:1, col:1, texto:'POZO',    tamLetra:28, bordes:B_LABEL },
        { fila:1, col:2,                               bordes:B_ALL   },
        { fila:1, col:3, texto:'EMPALME', tamLetra:28, bordes:B_LABEL },
        { fila:1, col:4,                               bordes:B_ALL   },
      ] },
  ];
}

// ── llena_datos_celdas() ──────────────────────────────────────────────────────
// Stub vacío en la clase Magik original — sobreescribible por subclases.
export function llenarDatosCeldas(_tablas: TablaConfig[]): void { /* vacío por diseño */ }

// ── llena_datos_dinamicos() ───────────────────────────────────────────────────
// Inyecta atribs en las celdas de valor (col 2 y 4) de tbl_5 y tbl_6.
export function llenarDatosDinamicos(
  tablas: TablaConfig[],
  atribs: PlacaAtribs,
): TablaConfig[] {
  return tablas.map(tbl => {
    if (tbl.id !== 'tbl_5' && tbl.id !== 'tbl_6') return tbl;
    const isT5 = tbl.id === 'tbl_5';
    return {
      ...tbl,
      celdas: tbl.celdas.map(c => {
        if (c.fila === 1 && c.col === 2)
          return { ...c, texto: isT5 ? atribs.ruta    : atribs.pozo    };
        if (c.fila === 1 && c.col === 4)
          return { ...c, texto: isT5 ? atribs.long    : atribs.empalme };
        return c;
      }),
    };
  });
}

// ── SVG — dimensiones de visualización ───────────────────────────────────────

// set_fill_colour(colour.new_rgb(1, 0.83, 0.75)) → R=255 G=212 B=191
const FILL   = 'rgb(255,212,191)';
const STROKE = '#444';
const LW     = 1.5;

const PW     = 580;
const PH     = 190;
const LOGO_W = 80;
const WARN_W = 270;
const DATA_X = LOGO_W + WARN_W;
const DATA_W = PW - DATA_X;
const TOP_H  = 120;
const ROW_H  = (PH - TOP_H) / 2;
const COL_W  = DATA_W / 4;

// ── SVG Celda ─────────────────────────────────────────────────────────────────

function CeldaSVG({ x, y, w, h, celda }: {
  x: number; y: number; w: number; h: number; celda: CeldaConfig;
}) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const lines = celda.texto?.split('\n') ?? [];

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={FILL} />
      {celda.bordes.sup && <line x1={x}   y1={y}   x2={x+w} y2={y}   stroke={STROKE} strokeWidth={LW}/>}
      {celda.bordes.inf && <line x1={x}   y1={y+h} x2={x+w} y2={y+h} stroke={STROKE} strokeWidth={LW}/>}
      {celda.bordes.izq && <line x1={x}   y1={y}   x2={x}   y2={y+h} stroke={STROKE} strokeWidth={LW}/>}
      {celda.bordes.der && <line x1={x+w} y1={y}   x2={x+w} y2={y+h} stroke={STROKE} strokeWidth={LW}/>}

      {celda.simbolo && (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={22} fill="#aaa">⚠</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8}
                fill="#888" fontFamily="sans-serif" fontStyle="italic">
            {celda.simbolo}
          </text>
        </>
      )}

      {!celda.simbolo && lines.map((ln, i) => (
        <text key={i}
          x={cx}
          y={cy - (lines.length - 1) * 7 + i * 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={i === 0 ? 13 : 10}
          fontWeight={i === 0 ? 'bold' : 'normal'}
          fontFamily="sans-serif"
          fill={i === 0 ? '#c00' : '#222'}>
          {ln}
        </text>
      ))}
    </g>
  );
}

// ── PlacaSVG ──────────────────────────────────────────────────────────────────

function PlacaSVG({ atribs }: { atribs: PlacaAtribs }) {
  const logoCelda: CeldaConfig = { fila:1, col:1, simbolo:'logo_sellos', bordes:B_ALL };

  const warnCelda: CeldaConfig = {
    fila:1, col:1,
    texto:'PRECAUCION\nCABLE DE FIBRA OPTICA\nLARGA DISTANCIA',
    tamLetra:36, alineacion:'top_centre', bordes:B_NONE,
  };

  const row1: CeldaConfig[] = [
    { fila:1, col:1, texto:'RUTA',       tamLetra:28, bordes:B_LABEL },
    { fila:1, col:2, texto:atribs.ruta,               bordes:B_ALL   },
    { fila:1, col:3, texto:'LONG.',      tamLetra:28, bordes:B_LABEL },
    { fila:1, col:4, texto:atribs.long,               bordes:B_ALL   },
  ];

  const row2: CeldaConfig[] = [
    { fila:1, col:1, texto:'POZO',           tamLetra:28, bordes:B_LABEL },
    { fila:1, col:2, texto:atribs.pozo,                   bordes:B_ALL   },
    { fila:1, col:3, texto:'EMPALME',        tamLetra:28, bordes:B_LABEL },
    { fila:1, col:4, texto:atribs.empalme,               bordes:B_ALL    },
  ];

  return (
    <svg width={PW} height={PH} style={{ display:'block', border:`${LW}px solid ${STROKE}` }}>
      <rect x={0} y={0} width={PW} height={PH} fill={FILL} />

      {/* tbl_3: logo */}
      <CeldaSVG x={0} y={0} w={LOGO_W} h={TOP_H} celda={logoCelda} />

      {/* tbl_4: advertencia (sin bordes propios) */}
      <CeldaSVG x={LOGO_W} y={0} w={WARN_W} h={TOP_H} celda={warnCelda} />

      {/* separadores */}
      <line x1={LOGO_W} y1={0}     x2={LOGO_W} y2={TOP_H} stroke={STROKE} strokeWidth={LW}/>
      <line x1={DATA_X} y1={0}     x2={DATA_X} y2={PH}    stroke={STROKE} strokeWidth={LW}/>
      <line x1={0}      y1={TOP_H} x2={PW}     y2={TOP_H} stroke={STROKE} strokeWidth={LW}/>

      {/* tbl_5: RUTA / LONG. */}
      {row1.map((c, i) => (
        <CeldaSVG key={`r1-${i}`}
          x={DATA_X + i * COL_W} y={TOP_H}
          w={COL_W} h={ROW_H} celda={c} />
      ))}

      {/* tbl_6: POZO / EMPALME */}
      {row2.map((c, i) => (
        <CeldaSVG key={`r2-${i}`}
          x={DATA_X + i * COL_W} y={TOP_H + ROW_H}
          w={COL_W} h={ROW_H} celda={c} />
      ))}

      {/* badge: nombre de tabla en zona datos */}
      <text x={DATA_X + 4} y={TOP_H + 10} fontSize={8} fill="#888" fontFamily="sans-serif">
        tbl_5
      </text>
      <text x={DATA_X + 4} y={TOP_H + ROW_H + 10} fontSize={8} fill="#888" fontFamily="sans-serif">
        tbl_6
      </text>
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function CPlacaLargaDistanciaUI() {
  const [atribs, setAtribs] = useState<PlacaAtribs>(DEFAULT_PLACA);

  function setAtrib<K extends keyof PlacaAtribs>(key: K, val: string) {
    setAtribs(prev => ({ ...prev, [key]: val }));
  }

  const tablasConDatos = llenarDatosDinamicos(configurarTabla(), atribs);

  const fields: { key: keyof PlacaAtribs; label: string }[] = [
    { key:'ruta',    label:'RUTA'    },
    { key:'long',    label:'LONG.'   },
    { key:'pozo',    label:'POZO'    },
    { key:'empalme', label:'EMPALME' },
  ];

  return (
    <div style={st.root}>
      <PlacaSVG atribs={atribs} />

      {/* llena_datos_dinamicos() — controles de los 4 atributos */}
      <div style={st.controls}>
        <strong style={st.ctrlTitle}>llena_datos_dinamicos()</strong>
        <div style={st.fields}>
          {fields.map(({ key, label }) => (
            <label key={key} style={st.field}>
              <span style={st.fieldLabel}>{label}</span>
              <input
                type="text"
                value={atribs[key]}
                placeholder={`Valor ${label}…`}
                onChange={e => setAtrib(key, e.target.value)}
                style={st.inp}
              />
            </label>
          ))}
        </div>
      </div>

      {/* configurarTabla() — tabla de debug */}
      <details style={st.details}>
        <summary style={st.summary}>configurarTabla() — 6 tablas</summary>
        <table style={st.tbl}>
          <thead>
            <tr>
              {['id','x (mm)','y (mm)','ancho','alto','f×c','celdas'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tablasConDatos.map(t => (
              <tr key={t.id}>
                <td style={st.td}><code>{t.id}</code></td>
                <td style={st.td}>{t.xMm}</td>
                <td style={st.td}>{t.yMm}</td>
                <td style={st.td}>{t.anchoMm}</td>
                <td style={st.td}>{t.altoMm}</td>
                <td style={st.td}>{t.filas}×{t.columnas}</td>
                <td style={st.td}>
                  {t.celdas.map(c =>
                    `(${c.fila},${c.col})${
                      c.texto   ? ':"' + c.texto.replace(/\n/g,'↵').slice(0,18) + '"'
                    : c.simbolo ? ':⚠' + c.simbolo
                    : ''}`
                  ).join('  ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root      : { fontFamily:'sans-serif', fontSize:12 },
  controls  : { marginTop:12, padding:'10px 14px',
                background:'#f8f9fb', border:'1px solid #dde', borderRadius:6 },
  ctrlTitle : { display:'block', fontSize:11, fontWeight:'bold',
                color:'#2E4057', marginBottom:8 },
  fields    : { display:'flex', flexWrap:'wrap', gap:14 },
  field     : { display:'flex', flexDirection:'column', gap:3 },
  fieldLabel: { fontSize:10, fontWeight:'bold', color:'#555',
                textTransform:'uppercase' },
  inp       : { padding:'4px 8px', border:'1px solid #bbb',
                borderRadius:4, fontSize:12, width:140 },
  details   : { marginTop:12 },
  summary   : { cursor:'pointer', fontSize:11, fontWeight:'bold',
                color:'#2E4057' },
  tbl       : { width:'100%', borderCollapse:'collapse', marginTop:6 },
  th        : { background:'#2E4057', color:'#fff', padding:'4px 10px',
                fontSize:11, textAlign:'left' },
  td        : { padding:'4px 10px', borderBottom:'1px solid #eee', fontSize:11 },
};
