/**
 * Migración de: c_simbologia_plano_construccion_fo.magik
 * Clase Magik:  c_simbologia_plano_construccion_fo  —  GE Network Solutions / rmrosale / 2011-05-30
 * Hereda:       c_base_sello_fibra
 *
 * Configura y etiqueta el bloque de simbología de la red secundaria de fibra
 * óptica (FO) en un plano de construcción.
 *
 * CÓDIGO COMENTADO en el .magik original:
 *   - tbl_titulo  (1×1): cabecera "SIMBOLOGIA DE LA RED SECUNDARIA"
 *   - tbl_titulo2 (1×3): sub-cabeceras DESCRIPCION / RED EXISTENTE / RED PROYECTADA
 * CÓDIGO ACTIVO:
 *   - tbl_contenido (1×1): celda de símbolo "simbologia_de_la_red_sec_fo" escala 3
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Configuración de tabla — property_list.new_with_properties(:ren, :col) */
export interface TableConfig {
  id:          string;
  rows:        number;
  cols:        number;
  rowHeights:  number[];   // :ren — alturas de filas en u.m.
  colWidths:   number[];   // :col — anchos de columnas en u.m.
}

/** Contenido de una celda: texto o símbolo GIS. */
export type CellContent =
  | { type: 'text';   text: string; fontSize: number; align: string }
  | { type: 'symbol'; symbolName: string; scale: number };

/** Clave de celda: "tableId:fila:columna" */
type CellKey = string;

// =============================================================================
// CLASE BASE STUB — c_base_sello_fibra
// Abstrae o_tablas, asigna_medidas_tabla, asigna_texto_celda, asigna_simbolo_celda
// =============================================================================

export abstract class CBaseSelloFibra {

  /** Magik: .o_tablas — mapa de tablas configuradas */
  protected tables = new Map<string, TableConfig>();

  /** Magik: contenidos de celdas por clave "id:fila:col" */
  protected cells  = new Map<CellKey, CellContent>();

  /**
   * Magik: .o_tablas.crea_tabla(rows, cols, :id) + asigna_medidas_tabla(tbl, config)
   * TS:    crea y registra la configuración de tabla.
   */
  protected crearTabla(
    rows:       number,
    cols:       number,
    id:         string,
    rowHeights: number[],
    colWidths:  number[],
  ): TableConfig {
    const t: TableConfig = { id, rows, cols, rowHeights, colWidths };
    this.tables.set(id, t);
    return t;
  }

  /**
   * Magik: _self.asigna_texto_celda(tableId, fila, col, texto, fontSize, align, 0, {color})
   * TS:    registra contenido de tipo text en la celda.
   */
  protected asignarTextoEnCelda(
    tableId:  string,
    row:      number,
    col:      number,
    text:     string,
    fontSize: number,
    align:    string,
  ): void {
    this.cells.set(`${tableId}:${row}:${col}`, { type: 'text', text, fontSize, align });
  }

  /**
   * Magik: _self.asigna_simbolo_celda(tableId, fila, col, symbolName, scale)
   * TS:    registra contenido de tipo symbol en la celda.
   */
  protected asignarSimboloEnCelda(
    tableId:    string,
    row:        number,
    col:        number,
    symbolName: string,
    scale:      number,
  ): void {
    this.cells.set(`${tableId}:${row}:${col}`, { type: 'symbol', symbolName, scale });
  }

  abstract configuraTablal(): void;
  abstract etiquetaCeldas(): void;

  /** Ejecuta configura → etiqueta y devuelve el estado resultante. */
  build(): { tables: Map<string, TableConfig>; cells: Map<CellKey, CellContent> } {
    this.configuraTablal();
    this.etiquetaCeldas();
    return { tables: this.tables, cells: this.cells };
  }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSimbologiaPlanoContruccionFo extends CBaseSelloFibra {

  /**
   * Magik: c_simbologia_plano_construccion_fo.configura_tabla()
   *
   * CÓDIGO COMENTADO (ref. histórica — no activo):
   *   tbl_titulo  → 1×1, ren:{8},  col:{130}
   *   tbl_titulo2 → 1×3, ren:{8},  col:{60,35,35}
   *
   * CÓDIGO ACTIVO:
   *   LoTblContenido << property_list.new_with_properties(:ren,{150},:col,{130})
   *   LoTbl << .o_tablas.crea_tabla(1, 1, :tbl_contenido)
   *   _self.asigna_medidas_tabla(LoTbl, LoTblContenido)
   */
  configuraTablal(): void {
    /* ── CÓDIGO COMENTADO (preservado como referencia histórica) ────────────
    // tbl_titulo: 1×1, 8u alto × 130u ancho
    // this.crearTabla(1, 1, 'tbl_titulo', [8], [130]);

    // tbl_titulo2: 1×3, 8u alto × [60,35,35]u ancho
    // this.crearTabla(1, 3, 'tbl_titulo2', [8], [60, 35, 35]);
    ─────────────────────────────────────────────────────────────────────── */

    // Contenido: 1×1, 150u alto × 130u ancho
    this.crearTabla(1, 1, 'tbl_contenido', [150], [130]);
  }

  /**
   * Magik: c_simbologia_plano_construccion_fo.etiqueta_celdas()
   *
   * CÓDIGO COMENTADO (ref. histórica — no activo):
   *   asigna_texto_celda(:tbl_titulo,  1,1, "SIMBOLOGIA DE LA RED SECUNDARIA",30,:centre_centre)
   *   asigna_texto_celda(:tbl_titulo2, 1,1, "DESCRIPCION",    20,:centre_centre)
   *   asigna_texto_celda(:tbl_titulo2, 1,2, "RED EXISTENTE",  20,:centre_centre)
   *   asigna_texto_celda(:tbl_titulo2, 1,3, "RED PROYECTADA", 20,:centre_centre)
   *
   * CÓDIGO ACTIVO:
   *   _self.asigna_simbolo_celda(:tbl_contenido, 1, 1, "simbologia_de_la_red_sec_fo", 3)
   */
  etiquetaCeldas(): void {
    /* ── CÓDIGO COMENTADO (preservado como referencia histórica) ────────────
    // this.asignarTextoEnCelda('tbl_titulo',  1, 1, 'SIMBOLOGIA DE LA RED SECUNDARIA', 30, 'centre_centre');
    // this.asignarTextoEnCelda('tbl_titulo2', 1, 1, 'DESCRIPCION',    20, 'centre_centre');
    // this.asignarTextoEnCelda('tbl_titulo2', 1, 2, 'RED EXISTENTE',  20, 'centre_centre');
    // this.asignarTextoEnCelda('tbl_titulo2', 1, 3, 'RED PROYECTADA', 20, 'centre_centre');
    ─────────────────────────────────────────────────────────────────────── */

    // Símbolo principal de simbología FO en tbl_contenido[1][1], escala 3
    this.asignarSimboloEnCelda('tbl_contenido', 1, 1, 'simbologia_de_la_red_sec_fo', 3);
  }
}

// =============================================================================
// SÍMBOLO MOCK — "simbologia_de_la_red_sec_fo"
// Representa la leyenda típica de una red secundaria FO (fibra óptica).
// En producción este símbolo se cargaría desde la tabla gis_point_style.
// =============================================================================

/** Entradas de la leyenda de red secundaria FO. */
const FO_LEYENDA = [
  { color: '#FF8C00', dash: '',    label: 'Cable FO existente 12 FO'    },
  { color: '#FF8C00', dash: '6,3', label: 'Cable FO proyectado 12 FO'   },
  { color: '#1565C0', dash: '',    label: 'Cable FO existente 24 FO'    },
  { color: '#1565C0', dash: '6,3', label: 'Cable FO proyectado 24 FO'   },
  { color: '#2E7D32', dash: '',    label: 'Cable FO existente 48 FO'    },
  { color: '#2E7D32', dash: '6,3', label: 'Cable FO proyectado 48 FO'   },
  { color: '#6A1B9A', dash: '',    label: 'Tubería de protección'        },
  { color: '#000',   dash: '',    label: 'Cámara de empalme'            },
];

function SymboliogiaFoSvg({ width = 300, height = 220 }: { width?: number; height?: number }) {
  const rowH  = (height - 24) / FO_LEYENDA.length;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <text x={width / 2} y={14} fontSize={9} fill="#444"
        textAnchor="middle" fontWeight="bold">
        simbologia_de_la_red_sec_fo
      </text>
      {FO_LEYENDA.map((entry, i) => {
        const y = 24 + i * rowH + rowH / 2;
        return (
          <g key={i}>
            {/* Línea de símbolo */}
            <line
              x1={8} y1={y} x2={52} y2={y}
              stroke={entry.color} strokeWidth={2.5}
              strokeDasharray={entry.dash || undefined}
            />
            {/* Punto de inicio */}
            <circle cx={8} cy={y} r={3} fill={entry.color} />
            {/* Punto de fin */}
            <circle cx={52} cy={y} r={3} fill={entry.color} />
            {/* Etiqueta */}
            <text x={60} y={y + 4} fontSize={8.5} fill="#333">
              {entry.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Muestra la estructura del sello (tablas + celdas) y el símbolo FO.
// =============================================================================

export function SimbologiaPlanoContruccionFoUI() {
  const [showCommented, setShowCommented] = useState(false);

  // Instanciar y construir el sello
  const sello = new CSimbologiaPlanoContruccionFo();
  const { tables, cells } = sello.build();

  // Escala visual: 1 u.m. → N px
  const SCALE = 1.8;

  // Tablas activas en la instancia
  const activeTables = Array.from(tables.values());

  // Tablas comentadas (ref. histórica)
  const commentedTables: TableConfig[] = [
    { id: 'tbl_titulo',  rows: 1, cols: 1, rowHeights: [8],  colWidths: [130] },
    { id: 'tbl_titulo2', rows: 1, cols: 3, rowHeights: [8],  colWidths: [60, 35, 35] },
  ];
  const commentedCells = new Map<CellKey, CellContent>([
    ['tbl_titulo:1:1',  { type: 'text', text: 'SIMBOLOGIA DE LA RED SECUNDARIA', fontSize: 30, align: 'centre_centre' }],
    ['tbl_titulo2:1:1', { type: 'text', text: 'DESCRIPCION',    fontSize: 20, align: 'centre_centre' }],
    ['tbl_titulo2:1:2', { type: 'text', text: 'RED EXISTENTE',  fontSize: 20, align: 'centre_centre' }],
    ['tbl_titulo2:1:3', { type: 'text', text: 'RED PROYECTADA', fontSize: 20, align: 'centre_centre' }],
  ]);

  const renderCell = (tableId: string, row: number, col: number, w: number, h: number,
    cellMap: Map<CellKey, CellContent>) => {
    const content = cellMap.get(`${tableId}:${row}:${col}`);
    const pw = w * SCALE, ph = h * SCALE;
    return (
      <div key={`${tableId}:${row}:${col}`}
        style={{ width: pw, height: ph, border: '1px solid #888', boxSizing: 'border-box',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 background: content?.type === 'symbol' ? '#f0f7ff' : '#fff',
                 overflow: 'hidden', position: 'relative' }}>
        {content?.type === 'text' && (
          <span style={{ fontSize: Math.max(6, content.fontSize * 0.25), textAlign: 'center',
                         color: '#2E4057', fontWeight: 'bold', padding: 2 }}>
            {content.text}
          </span>
        )}
        {content?.type === 'symbol' && (
          <SymboliogiaFoSvg width={pw - 4} height={ph - 4} />
        )}
        {!content && (
          <span style={{ fontSize: 9, color: '#ccc' }}>—</span>
        )}
        {/* Coordenada celda */}
        <span style={{ position: 'absolute', top: 2, left: 3, fontSize: 7, color: '#aaa' }}>
          [{row},{col}]
        </span>
      </div>
    );
  };

  const renderTable = (tbl: TableConfig, cellMap: Map<CellKey, CellContent>, commented = false) => {
    return (
      <div key={tbl.id} style={{ marginBottom: 4 }}>
        {/* Cabecera de tabla */}
        <div style={{ fontSize: 10, color: commented ? '#c00' : '#2E4057',
                      fontWeight: 'bold', marginBottom: 2 }}>
          {commented ? '// ' : ''}{tbl.id}
          <span style={{ fontWeight: 'normal', color: '#888', marginLeft: 8 }}>
            {tbl.rows}×{tbl.cols} — ren:{JSON.stringify(tbl.rowHeights)} col:{JSON.stringify(tbl.colWidths)}
          </span>
        </div>
        {/* Filas y celdas */}
        {Array.from({ length: tbl.rows }, (_, ri) => (
          <div key={ri} style={{ display: 'flex' }}>
            {Array.from({ length: tbl.cols }, (_, ci) => (
              renderCell(tbl.id, ri + 1, ci + 1, tbl.colWidths[ci], tbl.rowHeights[ri], cellMap)
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_simbologia_plano_construccion_fo</h3>

      <label style={s.toggle}>
        <input type="checkbox" checked={showCommented}
          onChange={e => setShowCommented(e.target.checked)} />
        <span> Mostrar código comentado (tbl_titulo + tbl_titulo2)</span>
      </label>

      {/* Vista previa del sello */}
      <div style={s.preview}>
        {/* Tablas comentadas (solo si se activa el toggle) */}
        {showCommented && (
          <div style={s.commentedBlock}>
            <span style={s.commentedBadge}>// código comentado en el .magik original</span>
            {commentedTables.map(t => renderTable(t, commentedCells, true))}
          </div>
        )}

        {/* Tablas activas */}
        <div>
          <span style={s.activeBadge}>código activo</span>
          {activeTables.map(t => renderTable(t, cells))}
        </div>
      </div>

      {/* Resumen de configuración */}
      <table style={s.table}>
        <thead>
          <tr>
            {['Tabla', 'Estado', 'Dimensiones', 'Celda [1,1]'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ...commentedTables.map(t => ({
              id: t.id, estado: '// comentado',
              dim: `${t.rowHeights[0]}×${t.colWidths.reduce((a,b)=>a+b,0)} u.m.`,
              celda: commentedCells.get(`${t.id}:1:1`),
            })),
            ...activeTables.map(t => ({
              id: t.id, estado: '✅ activo',
              dim: `${t.rowHeights[0]}×${t.colWidths.reduce((a,b)=>a+b,0)} u.m.`,
              celda: cells.get(`${t.id}:1:1`),
            })),
          ].map(row => (
            <tr key={row.id}>
              <td style={s.td}><code>{row.id}</code></td>
              <td style={{ ...s.td, color: row.estado.startsWith('//') ? '#c00' : '#2a7' }}>
                {row.estado}
              </td>
              <td style={s.td}>{row.dim}</td>
              <td style={s.td}>
                <code style={{ fontSize: 10 }}>
                  {row.celda?.type === 'text'
                    ? `"${(row.celda as any).text.substring(0,20)}…" fs:${(row.celda as any).fontSize}`
                    : row.celda?.type === 'symbol'
                    ? `⬡ ${(row.celda as any).symbolName} ×${(row.celda as any).scale}`
                    : '—'}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame         : { display:'flex', flexDirection:'column', gap:12, width:560, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title         : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  toggle        : { display:'flex', alignItems:'center', gap:6, fontSize:12, cursor:'pointer' },
  preview       : { display:'flex', flexDirection:'column', gap:8, background:'#fafafa', border:'1px solid #eee', borderRadius:4, padding:12 },
  commentedBlock: { borderLeft:'3px solid #f66', paddingLeft:8, opacity:0.75 },
  commentedBadge: { fontSize:10, color:'#c00', fontStyle:'italic', display:'block', marginBottom:4 },
  activeBadge   : { fontSize:10, color:'#2a7', fontWeight:'bold', display:'block', marginBottom:4 },
  table         : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th            : { background:'#2E4057', color:'#fff', padding:'5px 8px', textAlign:'left' as const, fontSize:11 },
  td            : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default SimbologiaPlanoContruccionFoUI;
