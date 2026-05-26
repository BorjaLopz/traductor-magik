// =============================================================================
// MIGRACIÓN: c_fibras_por_distrito_falc  →  CFibrasPorDistritoFalc.tsx
// Jerarquía Magik: c_fibras_por_distrito_falc extends c_base_sello_fibra
// Fuente: adiciones_layout/source/c_fibras_por_distrito_falc.magik
// =============================================================================
//
// Sello de plano que muestra fibras ópticas por distrito (FALC).
// Compone cinco tablas de layout (tbl_contenedora, tbl_1, tbl_2, tbl_2_1,
// tbl_3) y 13 atributos editables. GIS omitido: obtenRegistros() devuelve
// los atributos almacenados en lugar de consultar el dataset.
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface FibrasPorDistritoAttribs {
  idcedo:     string;
  fibras:     string | undefined;
  nco:        string | undefined;
  nipp:       string | undefined;
  cve_dto:    string | undefined;
  viv:        string | undefined;
  no_fibras:  string;
  dist_a_nco: string | undefined;
  distrito:   string | undefined;
  dist_a_oc:  string | undefined;
  siglas_oc:  string | undefined;
  cuentas:    string | undefined;
  recalcular: boolean;
}

interface CellContent {
  text:     string;
  color:    string;
  fontSize: number;
  align:    string | undefined;
}

type RGB = [number, number, number];

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CFibrasPorDistritoFalc {
  private _attribs: FibrasPorDistritoAttribs;
  private _cells: Map<string, CellContent>;

  constructor(attribs?: Partial<FibrasPorDistritoAttribs>) {
    this._attribs = {
      idcedo:     '0',
      fibras:     undefined,
      nco:        undefined,
      nipp:       undefined,
      cve_dto:    undefined,
      viv:        undefined,
      no_fibras:  '',
      dist_a_nco: undefined,
      distrito:   undefined,
      dist_a_oc:  undefined,
      siglas_oc:  undefined,
      cuentas:    undefined,
      recalcular: true,
      ...attribs,
    };
    this._cells = new Map();
  }

  get attributes(): FibrasPorDistritoAttribs { return this._attribs; }

  // Magik: asigna_texto_celda — convierte colour.new_rgb / colour.new_from_hex a CSS
  asignaTextoCelda(
    tabla: string, reng: number, col: number, texto: string,
    fontSize: number, align?: string,
    _margen?: unknown, color?: RGB, colorHex?: string,
  ): void {
    let css = 'black';
    if (colorHex) {
      css = `#${colorHex}`;
    } else if (color) {
      css = `rgb(${color.map(c => Math.round(c * 255)).join(',')})`;
    }
    this._cells.set(`${tabla}:${reng}:${col}`, { text: texto, color: css, fontSize, align });
  }

  // Magik: etiqueta_celdas — cabeceras DTOS / VIV / FIBRAS en azul
  etiquetaCeldas(): void {
    const AZUL: RGB = [0, 0, 1];
    this.asignaTextoCelda('tbl_2_1', 1, 1, 'DTOS:',   7, undefined, undefined, AZUL);
    this.asignaTextoCelda('tbl_2_1', 3, 1, 'VIV:',    7, undefined, undefined, AZUL);
    this.asignaTextoCelda('tbl_2_1', 5, 1, 'FIBRAS:', 7, undefined, undefined, AZUL);
  }

  // Magik: llena_datos_celdas_properties — llena celdas desde atributos almacenados
  llenaDatosCeldasProperties(): void {
    const a = this._attribs;
    const ROJO: RGB = [1, 0, 0];
    const AZUL: RGB = [0, 0, 1];

    const fibras          = a.fibras     ?? '';
    const ncoLabel        = `NCO_${a.nco ?? ''}`;
    const titulo          = `FIBRAS (${fibras})\n${ncoLabel}\nNIPP ${a.nipp ?? ''}`;
    const distNco         = `${a.dist_a_nco ?? ''} A NCO_${a.nco ?? ''}`;
    const distOc          = `${a.dist_a_oc  ?? ''} A O.C. ${a.siglas_oc ?? ''}`;
    const fibrasAsignadas = `F.O.${a.cuentas ?? ''}`;

    this.asignaTextoCelda('tbl_1',   1, 1, titulo,            14, 'top_centre', undefined, ROJO);
    this.asignaTextoCelda('tbl_2_1', 1, 3, a.cve_dto   ?? '', 10, undefined,   undefined, AZUL);
    this.asignaTextoCelda('tbl_2_1', 3, 3, a.viv       ?? '', 10, undefined,   undefined, AZUL);
    this.asignaTextoCelda('tbl_2_1', 5, 3, a.no_fibras,       10, undefined,   undefined, AZUL);
    this.asignaTextoCelda('tbl_3',   1, 1, distNco,           10, undefined,   undefined, undefined, 'BBBB20');
    this.asignaTextoCelda('tbl_3',   2, 1, a.distrito  ?? '', 16, undefined,   undefined, undefined, 'DAA520');
    this.asignaTextoCelda('tbl_3',   3, 1, distOc,           12, undefined,   undefined, undefined, 'BBBB20');
    this.asignaTextoCelda('tbl_3',   4, 1, fibrasAsignadas,   14, undefined,   undefined, undefined, '4C9526');
  }

  getCell(tabla: string, reng: number, col: number): CellContent | undefined {
    return this._cells.get(`${tabla}:${reng}:${col}`);
  }

  // Magik: siglas_nco — getter de siglas del proyecto activo (GIS omitido)
  get siglasNco(): string { return this._attribs.nco ?? ''; }

  // Magik: obten_registros — en GIS consultaría dataset :gis; aquí devuelve attribs
  obtenRegistros(): Record<string, string> {
    const a = this._attribs;
    return {
      fibras:     a.fibras     ?? ' ',
      nco:        a.nco        ?? ' ',
      nipp:       a.nipp       ?? ' ',
      cve_dto:    a.cve_dto    ?? ' ',
      viv:        a.viv        ?? ' ',
      no_fibras:  a.no_fibras,
      dist_a_nco: a.dist_a_nco ?? ' ',
      distrito:   a.distrito   ?? ' ',
      dist_a_oc:  a.dist_a_oc  ?? ' ',
      siglas_oc:  a.siglas_oc  ?? ' ',
      cuentas:    a.cuentas    ?? ' ',
    };
  }

  // Magik: draw_content_on(window) — renderiza el sello
  drawContentOn(): void {
    this._cells.clear();
    this.etiquetaCeldas();
    this.llenaDatosCeldasProperties();
  }
}

// =============================================================================
// Componente React — CFibrasPorDistritoFalcUI
// =============================================================================

const S = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 12, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '140px 1fr', gap: 4, padding: '2px 0', fontSize: 11 } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  label: { color: '#cba6f7', fontSize: 11, marginBottom: 2, display: 'block' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={S.row}>
      <span style={S.k}>{label}</span>
      <span style={S.v}>{value}</span>
    </div>
  );
}

function AttribInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={S.label}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

// Sello visual basado en la estructura de tablas de configura_tabla()
function SelloPreview({ sello }: { sello: CFibrasPorDistritoFalc }) {
  const cell = (tabla: string, r: number, c: number) => sello.getCell(tabla, r, c);

  const tbl1   = cell('tbl_1',   1, 1);
  const h1     = cell('tbl_2_1', 1, 1);
  const v1     = cell('tbl_2_1', 1, 3);
  const h3     = cell('tbl_2_1', 3, 1);
  const v3     = cell('tbl_2_1', 3, 3);
  const h5     = cell('tbl_2_1', 5, 1);
  const v5     = cell('tbl_2_1', 5, 3);
  const t3r1   = cell('tbl_3',   1, 1);
  const t3r2   = cell('tbl_3',   2, 1);
  const t3r3   = cell('tbl_3',   3, 1);
  const t3r4   = cell('tbl_3',   4, 1);

  const selloBox: React.CSSProperties = {
    border: '2px solid #89dceb', borderRadius: 4, overflow: 'hidden',
    background: '#11111b', width: '100%',
  };
  const tblRow: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 8px 1fr',
    borderBottom: '1px solid #313244',
  };
  const sep: React.CSSProperties = {
    borderLeft: '1px solid #45475a', borderRight: '1px solid #45475a',
  };

  function CellText({ c, pad = 8 }: { c: CellContent | undefined; pad?: number }) {
    if (!c) return <span style={{ color: '#585b70' }}>(vacío)</span>;
    return (
      <span style={{
        color: c.color, fontSize: Math.max(9, c.fontSize * 1.1),
        whiteSpace: 'pre-line', lineHeight: 1.4,
        textAlign: c.align?.includes('centre') ? 'center' : 'left',
        display: 'block', padding: pad,
      }}>
        {c.text || <span style={{ color: '#585b70' }}>(vacío)</span>}
      </span>
    );
  }

  return (
    <div style={selloBox}>
      {/* tbl_1: título */}
      <div style={{ borderBottom: '2px solid #45475a', padding: 0 }}>
        <CellText c={tbl1} pad={10} />
      </div>

      {/* tbl_2 + tbl_2_1: datos DTOS / VIV / FIBRAS */}
      <div style={{ borderBottom: '2px solid #c00020', borderTop: '1px solid #c00020' }}>
        <div style={{ ...tblRow, borderBottom: '1px solid #313244' }}>
          <CellText c={h1} />
          <div style={sep} />
          <CellText c={v1} />
        </div>
        <div style={{ height: 4 }} />
        <div style={{ ...tblRow, borderBottom: '1px solid #313244' }}>
          <CellText c={h3} />
          <div style={sep} />
          <CellText c={v3} />
        </div>
        <div style={{ height: 4 }} />
        <div style={{ ...tblRow }}>
          <CellText c={h5} />
          <div style={sep} />
          <CellText c={v5} />
        </div>
      </div>

      {/* tbl_3: 4 filas de datos */}
      {[t3r1, t3r2, t3r3, t3r4].map((c, i) => (
        <div key={i} style={{ borderBottom: i < 3 ? '1px solid #313244' : 'none' }}>
          <CellText c={c} pad={6} />
        </div>
      ))}
    </div>
  );
}

const DEFAULT_ATTRIBS: FibrasPorDistritoAttribs = {
  idcedo:     'CEDO-001',
  fibras:     '96',
  nco:        'NCORE',
  nipp:       '12345',
  cve_dto:    'DTO-01',
  viv:        '320',
  no_fibras:  '5',
  dist_a_nco: '1.2km',
  distrito:   'DISTRITO NORTE',
  dist_a_oc:  '3.5km',
  siglas_oc:  'OC_NTE',
  cuentas:    '48',
  recalcular: true,
};

export function CFibrasPorDistritoFalcUI() {
  const [a, setA] = useState<FibrasPorDistritoAttribs>(DEFAULT_ATTRIBS);

  const set = (k: keyof FibrasPorDistritoAttribs) => (v: string) =>
    setA(prev => ({ ...prev, [k]: v || undefined }));

  const sello = useMemo(() => {
    const s = new CFibrasPorDistritoFalc(a);
    s.drawContentOn();
    return s;
  }, [a]);

  const datos = sello.obtenRegistros();

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CFibrasPorDistritoFalc</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          sello de fibras por distrito · extiende c_base_sello_fibra
        </span>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo: atributos editables */}
        <div>
          <div style={S.card}>
            <div style={S.title}>defined_attributes  ·  13 atributos de layout</div>
            <AttribInput label="idcedo"     value={a.idcedo}          onChange={v => setA(p => ({ ...p, idcedo: v }))} />
            <AttribInput label="fibras"     value={a.fibras     ?? ''} onChange={set('fibras')} />
            <AttribInput label="nco"        value={a.nco        ?? ''} onChange={set('nco')} />
            <AttribInput label="nipp"       value={a.nipp       ?? ''} onChange={set('nipp')} />
            <AttribInput label="cve_dto"    value={a.cve_dto    ?? ''} onChange={set('cve_dto')} />
            <AttribInput label="viv"        value={a.viv        ?? ''} onChange={set('viv')} />
            <AttribInput label="no_fibras"  value={a.no_fibras}        onChange={v => setA(p => ({ ...p, no_fibras: v }))} />
            <AttribInput label="dist_a_nco" value={a.dist_a_nco ?? ''} onChange={set('dist_a_nco')} />
            <AttribInput label="distrito"   value={a.distrito   ?? ''} onChange={set('distrito')} />
            <AttribInput label="dist_a_oc"  value={a.dist_a_oc  ?? ''} onChange={set('dist_a_oc')} />
            <AttribInput label="siglas_oc"  value={a.siglas_oc  ?? ''} onChange={set('siglas_oc')} />
            <AttribInput label="cuentas"    value={a.cuentas    ?? ''} onChange={set('cuentas')} />
            <div style={{ marginTop: 4 }}>
              <label style={S.label}>recalcular</label>
              <button
                onClick={() => setA(p => ({ ...p, recalcular: !p.recalcular }))}
                style={{
                  padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: 11,
                  background: a.recalcular ? '#a6e3a1' : '#313244',
                  color: a.recalcular ? '#1e1e2e' : '#bac2de',
                }}
              >
                {String(a.recalcular)}
              </button>
            </div>
          </div>

          {/* obtenRegistros() */}
          <div style={S.card}>
            <div style={S.title}>obtenRegistros() → property_list  <span style={{ color: '#585b70', fontWeight: 'normal' }}>(GIS omitido)</span></div>
            {Object.entries(datos).map(([k, v]) => (
              <Field key={k} label={k} value={v} />
            ))}
          </div>
        </div>

        {/* Panel derecho: sello visual */}
        <div>
          <div style={S.card}>
            <div style={S.title}>draw_content_on()  ·  vista del sello</div>
            <div style={{ fontSize: 10, color: '#585b70', marginBottom: 8 }}>
              Estructura: tbl_1 (título) · tbl_2+tbl_2_1 (DTOS/VIV/FIBRAS) · tbl_3 (4 filas de distancias)
            </div>
            <SelloPreview sello={sello} />
          </div>

          <div style={S.card}>
            <div style={S.title}>tabla de celdas renderizadas</div>
            {[
              ['tbl_1',   1, 1, 'título (rojo, top_centre)'],
              ['tbl_2_1', 1, 1, 'header DTOS (azul)'],
              ['tbl_2_1', 1, 3, 'valor DTOS (azul)'],
              ['tbl_2_1', 3, 1, 'header VIV (azul)'],
              ['tbl_2_1', 3, 3, 'valor VIV (azul)'],
              ['tbl_2_1', 5, 1, 'header FIBRAS (azul)'],
              ['tbl_2_1', 5, 3, 'valor FIBRAS (azul)'],
              ['tbl_3',   1, 1, 'dist_a_nco (#BBBB20)'],
              ['tbl_3',   2, 1, 'distrito (#DAA520)'],
              ['tbl_3',   3, 1, 'dist_a_oc (#BBBB20)'],
              ['tbl_3',   4, 1, 'cuentas (#4C9526)'],
            ].map(([t, r, c, desc]) => {
              const cell = sello.getCell(t as string, r as number, c as number);
              return (
                <div key={`${t}:${r}:${c}`} style={{ ...S.row, gridTemplateColumns: '180px 1fr', marginBottom: 2 }}>
                  <span style={{ color: '#89dceb', fontSize: 10 }}>{desc}</span>
                  <span style={{ color: cell?.color ?? '#585b70', fontSize: 10, whiteSpace: 'pre' }}>
                    {cell?.text?.replace(/\n/g, '↵') ?? '(vacío)'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
