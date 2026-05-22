import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
// Magik: defined_attributes — 18 atributos :string

export interface PlacaTroncalZonalData {
  // tbl_4
  tk:           string;
  ruta:         string;
  pep:          string;
  no_cable:     string;
  // tbl_5
  capacidad_ps: string;
  calibre:      string;
  tipo_cable:   string;
  no_p_rep:     string;
  // tbl_6 — Origen
  ctl_origen:      string;
  seccion_origen:  string;
  vertical_origen: string;
  strips_origen:   string;
  ind_origen:      string;
  // tbl_7 — Destino
  ctl_destino:      string;
  seccion_destino:  string;
  vertical_destino: string;
  strips_destino:   string;
  ind_destino:      string;
}

// ─── Cell definition ─────────────────────────────────────────────────────────
// Odd columns (isLabel=true) → cabecera, sin bordes izq/inf/sup (solo der)
// Even columns (isLabel=false) → datos, bordes completos

interface CellDef {
  widthMm:    number;
  isLabel:    boolean;
  labelText?: string;
  dataKey?:   keyof PlacaTroncalZonalData;
}

interface TblDef {
  id:    string;
  xMm:   number;  // offset X desde origen (mm)
  yMm:   number;  // offset Y positivo = hacia abajo (mm)
  hMm:   number;  // altura del renglón (mm)
  cells: CellDef[];
}

// ─── Table layout — Magik: configura_tabla() ─────────────────────────────────

const TBLS: readonly TblDef[] = [
  // tbl_4 at (285, 70): 1×8 cols=[7.5,15,7.5,15,7.5,15,15,15]mm
  {
    id: 'tbl_4', xMm: 285, yMm: 70, hMm: 7.5,
    cells: [
      { widthMm: 7.5,  isLabel: true,  labelText: 'TK'         },
      { widthMm: 15,   isLabel: false, dataKey:  'tk'          },
      { widthMm: 7.5,  isLabel: true,  labelText: 'RUTA'       },
      { widthMm: 15,   isLabel: false, dataKey:  'ruta'        },
      { widthMm: 7.5,  isLabel: true,  labelText: 'PEP'        },
      { widthMm: 15,   isLabel: false, dataKey:  'pep'         },
      { widthMm: 15,   isLabel: true,  labelText: 'NO.CABLE'   },
      { widthMm: 15,   isLabel: false, dataKey:  'no_cable'    },
    ],
  },
  // tbl_5 at (285, 165): 1×8 cols=[16,10.5,11,11,16,11,11,11]mm
  // NOTA: Magik original — llena_datos_dinamicos escribe tipo_cable→col2 y no_p_rep→col4
  // (sobreescribe capacidad_ps y calibre; cols 6 y 8 quedan vacías).
  // Aquí se corrige asignando los datos a las columnas pares correctas.
  {
    id: 'tbl_5', xMm: 285, yMm: 165, hMm: 7.5,
    cells: [
      { widthMm: 16,   isLabel: true,  labelText: 'CAP.PS'      },
      { widthMm: 10.5, isLabel: false, dataKey:  'capacidad_ps' },
      { widthMm: 11,   isLabel: true,  labelText: 'CALIBRE'     },
      { widthMm: 11,   isLabel: false, dataKey:  'calibre'      },
      { widthMm: 16,   isLabel: true,  labelText: 'TIPO CABLE'  },
      { widthMm: 11,   isLabel: false, dataKey:  'tipo_cable'   },
      { widthMm: 11,   isLabel: true,  labelText: 'NO.P.REP'    },
      { widthMm: 11,   isLabel: false, dataKey:  'no_p_rep'     },
    ],
  },
  // tbl_6 at (285, 260): 1×10 cols=[9.75×10]mm — Origen
  {
    id: 'tbl_6', xMm: 285, yMm: 260, hMm: 7.5,
    cells: [
      { widthMm: 9.75, isLabel: true,  labelText: 'CTL'      },
      { widthMm: 9.75, isLabel: false, dataKey:  'ctl_origen' },
      { widthMm: 9.75, isLabel: true,  labelText: 'SECCION'  },
      { widthMm: 9.75, isLabel: false, dataKey:  'seccion_origen' },
      { widthMm: 9.75, isLabel: true,  labelText: 'VERTICAL' },
      { widthMm: 9.75, isLabel: false, dataKey:  'vertical_origen' },
      { widthMm: 9.75, isLabel: true,  labelText: 'STRIPS'   },
      { widthMm: 9.75, isLabel: false, dataKey:  'strips_origen' },
      { widthMm: 9.75, isLabel: true,  labelText: 'IND.'     },
      { widthMm: 9.75, isLabel: false, dataKey:  'ind_origen' },
    ],
  },
  // tbl_7 at (285, 355): 1×10 cols=[9.75×10]mm — Destino
  {
    id: 'tbl_7', xMm: 285, yMm: 355, hMm: 7.5,
    cells: [
      { widthMm: 9.75, isLabel: true,  labelText: 'CTL'       },
      { widthMm: 9.75, isLabel: false, dataKey:  'ctl_destino' },
      { widthMm: 9.75, isLabel: true,  labelText: 'SECCION'   },
      { widthMm: 9.75, isLabel: false, dataKey:  'seccion_destino' },
      { widthMm: 9.75, isLabel: true,  labelText: 'VERTICAL'  },
      { widthMm: 9.75, isLabel: false, dataKey:  'vertical_destino' },
      { widthMm: 9.75, isLabel: true,  labelText: 'STRIPS'    },
      { widthMm: 9.75, isLabel: false, dataKey:  'strips_destino' },
      { widthMm: 9.75, isLabel: true,  labelText: 'IND.'      },
      { widthMm: 9.75, isLabel: false, dataKey:  'ind_destino' },
    ],
  },
];

// ─── SVG constants ────────────────────────────────────────────────────────────

const SC     = 1.3;                   // escala: mm → px
const FILL   = 'rgb(255,204,204)';    // Magik: colour.new_rgb(1, 0.80, 0.80)
const BD     = '#444';                // color de borde
const SVG_W  = Math.ceil((285 + 97.5) * SC) + 4;
const SVG_H  = Math.ceil((355 + 7.5)  * SC) + 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function xOffsets(cells: CellDef[], originXMm: number): number[] {
  const out: number[] = [];
  let x = originXMm * SC;
  for (const c of cells) {
    out.push(x);
    x += c.widthMm * SC;
  }
  return out;
}

// ─── SVG Preview ─────────────────────────────────────────────────────────────

function PlacaSvg({ data }: { data: PlacaTroncalZonalData }) {
  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      style={{ display: 'block', background: '#fff', border: '1px solid #aaa' }}
    >
      {/* tbl_1 — marco exterior: 130mm × 50mm, origen (0,0) */}
      <rect
        x={0} y={0} width={130 * SC} height={50 * SC}
        fill={FILL} stroke={BD} strokeWidth={1}
      />
      <text x={4} y={10} fontSize={6} fill="#666">tbl_1 (130×50mm)</text>

      {/* tbl_3 — área logo en (25,25): 26mm × 45mm */}
      <rect
        x={25 * SC} y={25 * SC} width={26 * SC} height={45 * SC}
        fill="#ddd" stroke={BD} strokeWidth={0.8}
      />
      <text
        x={(25 + 13) * SC} y={(25 + 25) * SC}
        fontSize={7} textAnchor="middle" fill="#777"
      >LOGO</text>

      {/* tbl_2 — marco interior en (25,25): 125mm × 45mm */}
      <rect
        x={25 * SC} y={25 * SC} width={125 * SC} height={45 * SC}
        fill="none" stroke={BD} strokeWidth={0.8}
      />
      <text x={27 * SC} y={(25 + 8) * SC} fontSize={5} fill="#aaa">
        tbl_2 (125×45mm)
      </text>

      {/* Indicador de espacio central (tablas del base class no migradas) */}
      <text
        x={(130 + (285 - 130) / 2) * SC}
        y={150 * SC}
        fontSize={7}
        textAnchor="middle"
        fill="#bbb"
      >
        ← c_base_sello_fibra →
      </text>

      {/* tbl_4 – tbl_7 — filas de datos */}
      {TBLS.map(tbl => {
        const xs  = xOffsets(tbl.cells, tbl.xMm);
        const y   = tbl.yMm * SC;
        const h   = tbl.hMm * SC;
        const totW = tbl.cells.reduce((s, c) => s + c.widthMm, 0) * SC;

        return (
          <g key={tbl.id}>
            {/* Fondo y borde exterior de la fila */}
            <rect
              x={tbl.xMm * SC} y={y}
              width={totW} height={h}
              fill="white" stroke={BD} strokeWidth={0.8}
            />

            {tbl.cells.map((cell, ci) => {
              const cx  = xs[ci];
              const cw  = cell.widthMm * SC;
              const txt = cell.isLabel
                ? (cell.labelText ?? '')
                : (cell.dataKey ? data[cell.dataKey] : '');

              return (
                <g key={ci}>
                  {cell.isLabel ? (
                    // Celda etiqueta: solo borde derecho visible
                    // Magik: bBorde_Izq=false, bBorde_Inf=false, bBorde_Sup=false
                    <>
                      <rect
                        x={cx} y={y} width={cw} height={h}
                        fill="#f0f0f0" stroke="none"
                      />
                      <line
                        x1={cx + cw} y1={y}
                        x2={cx + cw} y2={y + h}
                        stroke={BD} strokeWidth={0.8}
                      />
                    </>
                  ) : (
                    // Celda datos: bordes completos
                    <rect
                      x={cx} y={y} width={cw} height={h}
                      fill="white" stroke={BD} strokeWidth={0.8}
                    />
                  )}
                  <text
                    x={cx + cw / 2}
                    y={y + h * 0.65}
                    fontSize={cell.isLabel ? 4.5 : 6}
                    textAnchor="middle"
                    fontWeight={cell.isLabel ? '600' : 'normal'}
                    fill={cell.isLabel ? '#555' : '#000'}
                  >
                    {txt}
                  </text>
                </g>
              );
            })}

            {/* ID de tabla a la izquierda */}
            <text
              x={tbl.xMm * SC - 3}
              y={y + h * 0.65}
              fontSize={5}
              textAnchor="end"
              fill="#aaa"
            >
              {tbl.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Field group config ───────────────────────────────────────────────────────
// Magik: defined_attributes() + etiqueta_celdas() + llena_datos_dinamicos()

interface FieldGroup {
  title:  string;
  tblId:  string;
  fields: { label: string; key: keyof PlacaTroncalZonalData }[];
}

const FIELD_GROUPS: readonly FieldGroup[] = [
  {
    title: 'tbl_4 — Identificación de cable',
    tblId: 'tbl_4',
    fields: [
      { label: 'TK',          key: 'tk'       },
      { label: 'RUTA',        key: 'ruta'     },
      { label: 'PEP',         key: 'pep'      },
      { label: 'NO.DE CABLE', key: 'no_cable' },
    ],
  },
  {
    title: 'tbl_5 — Características del cable',
    tblId: 'tbl_5',
    fields: [
      { label: 'CAPACIDAD PS',  key: 'capacidad_ps' },
      { label: 'CALIBRE',       key: 'calibre'      },
      { label: 'TIPO DE CABLE', key: 'tipo_cable'   },
      { label: 'NO.P.REP',      key: 'no_p_rep'     },
    ],
  },
  {
    title: 'tbl_6 — Origen',
    tblId: 'tbl_6',
    fields: [
      { label: 'CTL',      key: 'ctl_origen'      },
      { label: 'SECCIÓN',  key: 'seccion_origen'  },
      { label: 'VERTICAL', key: 'vertical_origen' },
      { label: 'STRIPS',   key: 'strips_origen'   },
      { label: 'IND.',     key: 'ind_origen'       },
    ],
  },
  {
    title: 'tbl_7 — Destino',
    tblId: 'tbl_7',
    fields: [
      { label: 'CTL',      key: 'ctl_destino'      },
      { label: 'SECCIÓN',  key: 'seccion_destino'  },
      { label: 'VERTICAL', key: 'vertical_destino' },
      { label: 'STRIPS',   key: 'strips_destino'   },
      { label: 'IND.',     key: 'ind_destino'       },
    ],
  },
];

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULTS: PlacaTroncalZonalData = {
  tk: 'TK-01', ruta: 'RUTA-A', pep: 'PEP-1234', no_cable: 'CAB-001',
  capacidad_ps: '100P', calibre: '0.5', tipo_cable: 'FO', no_p_rep: 'R01',
  ctl_origen: 'CTL-1', seccion_origen: 'S01', vertical_origen: 'V1',
  strips_origen: 'ST1', ind_origen: 'A',
  ctl_destino: 'CTL-2', seccion_destino: 'S02', vertical_destino: 'V2',
  strips_destino: 'ST2', ind_destino: 'B',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const cs: Record<string, React.CSSProperties> = {
  wrap:    { fontFamily: 'monospace', fontSize: 12, padding: 16 },
  title:   { fontSize: 14, fontWeight: 700, marginBottom: 12 },
  layout:  { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' },
  form:    { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 280 },
  group:   { border: '1px solid #dee2e6', padding: 8, borderRadius: 4, background: '#f8f9fa' },
  gtitle:  { fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#333' },
  fields:  { display: 'flex', flexWrap: 'wrap', gap: '4px 8px' },
  fitem:   { display: 'flex', flexDirection: 'column', gap: 1 },
  label:   { fontSize: 10, color: '#555', fontWeight: 600 },
  input:   { fontSize: 11, width: 80, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 2 },
  preview: { flexShrink: 0, overflow: 'auto' },
  hint:    { fontSize: 10, color: '#888', marginBottom: 4 },
};

// ─── Main component ───────────────────────────────────────────────────────────

export function CPlacaTroncalZonalUI() {
  const [data, setData] = useState<PlacaTroncalZonalData>(DEFAULTS);

  function onChange(key: keyof PlacaTroncalZonalData, value: string) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div style={cs.wrap}>
      <div style={cs.title}>c_placa_troncal_zonal — Placa de Identificación Troncal Zonal</div>

      <div style={cs.layout}>
        {/* Formulario de atributos — Magik: defined_attributes() */}
        <div style={cs.form}>
          {FIELD_GROUPS.map(grp => (
            <div key={grp.tblId} style={cs.group}>
              <div style={cs.gtitle}>{grp.title}</div>
              <div style={cs.fields}>
                {grp.fields.map(f => (
                  <div key={f.key} style={cs.fitem}>
                    <span style={cs.label}>{f.label}</span>
                    <input
                      style={cs.input}
                      value={data[f.key]}
                      onChange={e => onChange(f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vista previa SVG — Magik: configura_tabla() + etiqueta_celdas() + llena_datos_dinamicos() */}
        <div style={cs.preview}>
          <div style={cs.hint}>
            Vista previa — escala 1.3 px/mm. Celda gris = etiqueta (sin bordes izq/inf/sup). Blanca = datos.
          </div>
          <PlacaSvg data={data} />
        </div>
      </div>
    </div>
  );
}

export default CPlacaTroncalZonalUI;
