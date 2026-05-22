import React, { useMemo, useState } from 'react';

// ─── Core types ───────────────────────────────────────────────────────────────

// Magik: property_list { collection_name → id } per element
export type ElementRef = Record<string, number>;

// Simplified GIS record (replaces Smallworld DB object)
export interface GisRecord {
  id:               number;
  sourceCollection: string;   // Magik: obj.source_collection.name
  location:         { x: number; y: number };
  label?:           string;
}

interface Pt   { x: number; y: number; }
interface BBox { xmin: number; ymin: number; xmax: number; ymax: number; }

// Simplified affine transform (Smallworld uses full 3×3 matrix)
export interface AffineTransform { scaleX: number; scaleY: number; tx: number; ty: number; }

export interface LayoutViewport {
  bounds:    BBox;
  transform: AffineTransform;   // Magik: viewport.transform → GIS-to-page
}

// ─── Shared attributes ────────────────────────────────────────────────────────

// Magik: layout_element.define_shared_constant(:defined_attributes, rope.new_with(...))
export interface LayoutElementAttribs {
  outlineStyle:         { color: string; width: number } | null;  // composite_line_style.new(line_style)
  fillStyle:            { color: string } | null;                  // fill_style.new_solid(:white)
  shadowStyle:          { color: string } | null;                  // _unset
  locked:               boolean;                                   // _false
  elementosBdGis:       ElementRef[] | null;                       // _unset
  elementosBdLb:        ElementRef[] | null;                       // _unset
  elementosModificados: ElementRef[] | null;                       // _unset
  cedos:                unknown;                                    // _unset
  agregarCedos:         boolean;                                   // _true
}

export const DEFAULT_ATTRIBS: Readonly<LayoutElementAttribs> = {
  outlineStyle:         { color: 'black', width: 1 },
  fillStyle:            { color: 'white' },
  shadowStyle:          null,
  locked:               false,
  elementosBdGis:       null,
  elementosBdLb:        null,
  elementosModificados: null,
  cedos:                null,
  agregarCedos:         true,
};

// ─── Indicador types ──────────────────────────────────────────────────────────

export interface IndicadorParams {
  registro:       GisRecord;
  viewport:       LayoutViewport;
  conLinea:       boolean;
  conPunta:       boolean;     // NOTE: always overridden to false in Magik source
  lineaAbajo:     boolean;
  ancho:          number;
  alto:           number;
  distXP:         number;
  distYP:         number;
  tomaEncuentaVP: boolean;    // NOTE: always overridden to true in Magik source
}

export interface IndicadorResult {
  coordVp:           Pt;       // GIS point in page/viewport coords
  coordP2:           Pt;       // style box center (indicator endpoint)
  styleBox:          BBox;
  derecho:           boolean;  // Magik: LoDibujo.derecho — style box right of GIS point
  conPuntaActivo:    boolean;  // always false: Magik overrides PbConPunta? at end
  usaViewportActivo: boolean;  // always true:  Magik overrides PbTomaEncuentaVP? at end
}

// ─── Geometry helper ──────────────────────────────────────────────────────────

// Magik: coordinate.transformed(transform.new().scalexy/rotate...)
function applyAffine(pt: Pt, tf: AffineTransform): Pt {
  return { x: pt.x * tf.scaleX + tf.tx, y: pt.y * tf.scaleY + tf.ty };
}

// ─── LayoutElement base class ─────────────────────────────────────────────────

// Magik: layout_element (base class for all GIS plano layout elements)
export class LayoutElement {
  attribs: LayoutElementAttribs = { ...DEFAULT_ATTRIBS };

  // ── Element-ref serialization ─────────────────────────────────────────────

  // Magik: guardar_elementos_bd_gis(PoElementos)
  // Converts records → [{collection: id}] refs and stores in elementosBdGis
  guardarElementosBdGis(records: GisRecord[]): void {
    this.attribs.elementosBdGis = records.map(r => ({ [r.sourceCollection]: r.id }));
  }

  // Magik: guardar_elementos_bd_landbase(PoElementos)
  guardarElementosBdLandbase(records: GisRecord[]): void {
    this.attribs.elementosBdLb = records.map(r => ({ [r.sourceCollection]: r.id }));
  }

  // Magik: guardar_elementos_visibles(PoElementos)
  guardarElementosVisibles(records: GisRecord[]): void {
    this.attribs.elementosModificados = records.map(r => ({ [r.sourceCollection]: r.id }));
  }

  // ── Element-ref resolution ────────────────────────────────────────────────

  // Magik: obtener_elementos_bd_gis() → mit_manager.modelit_dataset
  obtenerElementosBdGis(dataset: Map<string, Map<number, GisRecord>>): GisRecord[] {
    return this._resolve(this.attribs.elementosBdGis, dataset);
  }

  // Magik: obtener_elementos_bd_landbase() → gis_program_manager.cached_dataset(:landbase)
  obtenerElementosBdLandbase(dataset: Map<string, Map<number, GisRecord>>): GisRecord[] {
    return this._resolve(this.attribs.elementosBdLb, dataset);
  }

  // Magik: obtener_elementos_visibles() → mit_manager.modelit_dataset
  obtenerElementosVisibles(dataset: Map<string, Map<number, GisRecord>>): GisRecord[] {
    return this._resolve(this.attribs.elementosModificados, dataset);
  }

  // Shared resolution: ElementRef[] + dataset → GisRecord[]
  private _resolve(
    refs: ElementRef[] | null,
    dataset: Map<string, Map<number, GisRecord>>,
  ): GisRecord[] {
    if (!refs?.length) return [];
    return refs.flatMap(ref =>
      Object.entries(ref).flatMap(([col, id]) => {
        const r = dataset.get(col)?.get(id);
        return r ? [r] : [];
      })
    );
  }

  // ── Coordinate transform ───────────────────────────────────────────────────

  // Magik: TransformaCoordenada(PoAreaDibujo, PoCoordenada, PfEscala, PoSegTransformacion)
  // isCanvas = PoAreaDibujo.is_kind_of?(canvas) → true when printing/exporting (SVG, PDF, plotter)
  transformaCoordenada(
    isCanvas: boolean,
    coord: Pt,
    escala: number,
    segTransform?: AffineTransform,
  ): Pt {
    // Magik: canvas → PoCoordenada.transformed(transform.new().scalexy(e, e))
    let pt: Pt = isCanvas ? { x: coord.x * escala, y: coord.y * escala } : { ...coord };
    // Magik: if PoSegTransformacion _isnt _unset → apply second transform (viewport.transform)
    if (segTransform) pt = applyAffine(pt, segTransform);
    return pt;
  }

  // ── Indicadores ────────────────────────────────────────────────────────────

  // Magik: indicadores(PoAreaDibujo, PoRegistro, PyCampoGeom, RoViewport, ...)
  // Creates a c_style_y_viewport_layout element on the layout page.
  // In TS: returns computed render data instead of mutating the page.
  calcIndicador(p: IndicadorParams): IndicadorResult {
    // Magik: LoCoordPozoVp = TransformaCoordenada(area, registro.coord, 0.1, vp.transform)
    const coordVp = this.transformaCoordenada(false, p.registro.location, 0.1, p.viewport.transform);

    // Magik: if PbConLinea? → compute endpoint; else reuse GIS point coords
    let coordP2: Pt;
    if (p.conLinea) {
      const { xmin, ymin, ymax } = p.viewport.bounds;
      // Magik: lineaAbajo → coordinate(xmin+distXP, ymin−distYP)
      //        else      → coordinate(xmin+distXP, ymax+distYP)
      coordP2 = p.lineaAbajo
        ? { x: xmin + p.distXP, y: ymin - p.distYP }
        : { x: xmin + p.distXP, y: ymax + p.distYP };
    } else {
      coordP2 = { ...coordVp };
    }

    // Magik: LoAreaEstilo = bounding_box.new(0,0,ancho,alto); LoAreaEstilo.centre = coordP2
    const styleBox: BBox = {
      xmin: coordP2.x - p.ancho / 2,  ymin: coordP2.y - p.alto / 2,
      xmax: coordP2.x + p.ancho / 2,  ymax: coordP2.y + p.alto / 2,
    };

    return {
      coordVp,
      coordP2,
      styleBox,
      derecho: coordP2.x >= coordVp.x,   // Magik: LoDibujo.derecho
      // BUG MAGIK: con_punta set conditionally, then ALWAYS overridden to "No"
      conPuntaActivo: false,
      // BUG MAGIK: usa_viewport set conditionally, then ALWAYS overridden to "Si"
      usaViewportActivo: true,
    };
  }
}

// ─── SVG helpers ──────────────────────────────────────────────────────────────

// Arrowhead path at `tip` pointing toward `toward`
function arrowPath(tip: Pt, toward: Pt, size = 9): string {
  const dx = toward.x - tip.x, dy = toward.y - tip.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return '';
  const ux = dx / len, uy = dy / len;
  const b1 = { x: tip.x - ux * size + uy * (size / 2), y: tip.y - uy * size - ux * (size / 2) };
  const b2 = { x: tip.x - ux * size - uy * (size / 2), y: tip.y - uy * size + ux * (size / 2) };
  return `M${tip.x.toFixed(1)},${tip.y.toFixed(1)} L${b1.x.toFixed(1)},${b1.y.toFixed(1)} L${b2.x.toFixed(1)},${b2.y.toFixed(1)} Z`;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RECORDS: GisRecord[] = [
  { id: 1, sourceCollection: 'duct_section', location: { x: 130, y: 135 }, label: 'DS-001' },
  { id: 2, sourceCollection: 'cable',        location: { x: 210, y: 150 }, label: 'CAB-007' },
  { id: 3, sourceCollection: 'joint',        location: { x: 265, y: 120 }, label: 'JNT-003' },
];

const MOCK_VIEWPORT: LayoutViewport = {
  bounds:    { xmin: 60, ymin: 80, xmax: 340, ymax: 195 },
  // Identity transform: GIS coords ≈ SVG page coords in this demo
  transform: { scaleX: 1, scaleY: 1, tx: 0, ty: 0 },
};

function buildDataset(records: GisRecord[]): Map<string, Map<number, GisRecord>> {
  const ds = new Map<string, Map<number, GisRecord>>();
  for (const r of records) {
    if (!ds.has(r.sourceCollection)) ds.set(r.sourceCollection, new Map());
    ds.get(r.sourceCollection)!.set(r.id, r);
  }
  return ds;
}

const MOCK_DATASET = buildDataset(MOCK_RECORDS);

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root:    { fontFamily: 'monospace', padding: '12px 16px' } as React.CSSProperties,
  row:     { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' } as React.CSSProperties,
  label:   { fontWeight: 'bold', color: '#444', fontSize: 12, minWidth: 90 } as React.CSSProperties,
  section: { marginBottom: 16 } as React.CSSProperties,
  h4:      { fontSize: 12, fontWeight: 'bold', color: '#1a3a5c', marginBottom: 6, borderBottom: '1px solid #dde' } as React.CSSProperties,
  code:    { background: '#f0f0f0', padding: '1px 4px', borderRadius: 3, fontSize: 11 } as React.CSSProperties,
  badge:   (c: string): React.CSSProperties => ({ background: c, color: '#fff', padding: '1px 6px', borderRadius: 8, fontSize: 10 }),
};

// ─── UI Component ─────────────────────────────────────────────────────────────

export function LayoutElementUI() {
  const [conLinea,    setConLinea]    = useState(true);
  const [conPunta,    setConPunta]    = useState(true);  // "intended" param (always overridden)
  const [lineaAbajo,  setLineaAbajo]  = useState(false);
  const [distXP,      setDistXP]      = useState(100);
  const [distYP,      setDistYP]      = useState(35);
  const [ancho,       setAncho]       = useState(80);
  const [alto,        setAlto]        = useState(18);
  const [recIdx,      setRecIdx]      = useState(0);
  const [storeTarget, setStoreTarget] = useState<'gis' | 'lb' | 'mod'>('gis');
  const [le]                          = useState(() => new LayoutElement());
  const [storedRefs,  setStoredRefs]  = useState<ElementRef[] | null>(null);
  const [retrieved,   setRetrieved]   = useState<GisRecord[]>([]);

  const result = useMemo<IndicadorResult>(() => {
    const inst = new LayoutElement();
    return inst.calcIndicador({
      registro: MOCK_RECORDS[recIdx],
      viewport: MOCK_VIEWPORT,
      conLinea, conPunta, lineaAbajo,
      ancho, alto, distXP, distYP,
      tomaEncuentaVP: true,
    });
  }, [recIdx, conLinea, conPunta, lineaAbajo, ancho, alto, distXP, distYP]);

  const { coordVp, coordP2, styleBox, derecho } = result;

  // Guardar/obtener demo
  function doGuardar() {
    if (storeTarget === 'gis')  le.guardarElementosBdGis(MOCK_RECORDS);
    if (storeTarget === 'lb')   le.guardarElementosBdLandbase(MOCK_RECORDS);
    if (storeTarget === 'mod')  le.guardarElementosVisibles(MOCK_RECORDS);
    const refs = storeTarget === 'gis'  ? le.attribs.elementosBdGis
               : storeTarget === 'lb'   ? le.attribs.elementosBdLb
               :                          le.attribs.elementosModificados;
    setStoredRefs(refs);
    setRetrieved([]);
  }

  function doObtener() {
    const recs = storeTarget === 'gis'  ? le.obtenerElementosBdGis(MOCK_DATASET)
               : storeTarget === 'lb'   ? le.obtenerElementosBdLandbase(MOCK_DATASET)
               :                          le.obtenerElementosVisibles(MOCK_DATASET);
    setRetrieved(recs);
  }

  // Transform demo
  const coordCanvas   = useMemo(() => {
    const inst = new LayoutElement();
    return inst.transformaCoordenada(true,  { x: 1000, y: 2000 }, 0.1, MOCK_VIEWPORT.transform);
  }, []);
  const coordViewport = useMemo(() => {
    const inst = new LayoutElement();
    return inst.transformaCoordenada(false, { x: 1000, y: 2000 }, 0.1, MOCK_VIEWPORT.transform);
  }, []);

  const RECORD_COLORS = ['#e53935', '#1e88e5', '#43a047'];
  const vp = MOCK_VIEWPORT.bounds;

  return (
    <div style={S.root}>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── Left column: controls ──────────────────────────────────────────── */}
        <div style={{ minWidth: 200, maxWidth: 240 }}>

          <div style={S.section}>
            <div style={S.h4}>Registro GIS</div>
            {MOCK_RECORDS.map((r, i) => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, cursor: 'pointer', fontSize: 12 }}>
                <input type="radio" checked={recIdx === i} onChange={() => setRecIdx(i)} />
                <span style={S.badge(RECORD_COLORS[i])}>●</span>
                <span>{r.label} <span style={{ color: '#888' }}>({r.sourceCollection})</span></span>
              </label>
            ))}
          </div>

          <div style={S.section}>
            <div style={S.h4}>Parámetros indicadores()</div>
            {([
              ['conLinea',   conLinea,   setConLinea],
              ['conPunta*',  conPunta,   setConPunta],
              ['lineaAbajo', lineaAbajo, setLineaAbajo],
            ] as [string, boolean, (v: boolean) => void][]).map(([lbl, val, set]) => (
              <label key={lbl} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, fontSize: 12 }}>
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                <span style={{ color: lbl.endsWith('*') ? '#e53935' : '#222' }}>{lbl}</span>
              </label>
            ))}
            {([
              ['distXP', distXP, setDistXP, 10, 250],
              ['distYP', distYP, setDistYP, 5,  80],
              ['ancho',  ancho,  setAncho,  20, 160],
              ['alto',   alto,   setAlto,   8,  50],
            ] as [string, number, (v: number) => void, number, number][]).map(([lbl, val, set, min, max]) => (
              <div key={lbl} style={{ ...S.row, marginBottom: 4 }}>
                <span style={{ ...S.label, minWidth: 55 }}>{lbl}</span>
                <input type="range" min={min} max={max} value={val}
                  onChange={e => set(Number(e.target.value))} style={{ width: 90 }} />
                <span style={{ fontSize: 11, minWidth: 28 }}>{val}</span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#c00', marginTop: 4 }}>
              * conPunta siempre se sobreescribe a <em>false</em> en el Magik original
            </div>
          </div>
        </div>

        {/* ── Center: SVG indicadores visualization ──────────────────────────── */}
        <div>
          <div style={S.h4}>Vista: indicadores() — Layout Page</div>
          <svg width={400} height={280} style={{ background: '#e8e8e8', borderRadius: 4, display: 'block', border: '1px solid #bbb' }}>
            {/* Page background */}
            <rect x={10} y={10} width={380} height={260} fill="#f8f8f8" stroke="#aaa" strokeWidth={1} />
            <text x={14} y={22} style={{ fontSize: 9, fill: '#aaa' }}>LAYOUT PAGE</text>

            {/* Viewport rectangle — Magik: RoViewport.bounds */}
            <rect x={vp.xmin} y={vp.ymin} width={vp.xmax - vp.xmin} height={vp.ymax - vp.ymin}
              fill="white" stroke="#555" strokeWidth={1.5} />
            <text x={vp.xmin + 3} y={vp.ymin + 10} style={{ fontSize: 8, fill: '#888' }}>VIEWPORT</text>

            {/* GIS records (dots) — Magik: PoRegistro.perform(PyCampoGeom).coord */}
            {MOCK_RECORDS.map((r, i) => (
              <g key={r.id}>
                <circle cx={r.location.x} cy={r.location.y} r={i === recIdx ? 6 : 4}
                  fill={RECORD_COLORS[i]} stroke={i === recIdx ? '#111' : 'none'} strokeWidth={1.5} />
                <text x={r.location.x + 8} y={r.location.y + 4} style={{ fontSize: 9, fill: RECORD_COLORS[i] }}>
                  {r.label}
                </text>
              </g>
            ))}

            {/* Indicator line — Magik: conLinea → line from GIS point to coordP2 */}
            {conLinea && (
              <line x1={coordVp.x} y1={coordVp.y} x2={coordP2.x} y2={coordP2.y}
                stroke="#333" strokeWidth={1.5} strokeDasharray="4,2" />
            )}

            {/* Arrowhead at GIS point — conPunta param (Magik always overrides to false) */}
            {conPunta && conLinea && (
              <path d={arrowPath(coordVp, coordP2)} fill="#e53935" opacity={0.5} />
            )}

            {/* Style box — Magik: c_style_y_viewport_layout, bounding_box centrado en coordP2 */}
            <rect
              x={styleBox.xmin} y={styleBox.ymin}
              width={styleBox.xmax - styleBox.xmin}
              height={styleBox.ymax - styleBox.ymin}
              fill="#fff9c4" stroke="#f9a825" strokeWidth={1.5}
              strokeDasharray={conLinea ? 'none' : '3,2'}
            />
            <text x={coordP2.x} y={coordP2.y + 4} textAnchor="middle" style={{ fontSize: 8, fill: '#555' }}>
              {derecho ? '→ derecho' : '← izquierdo'}
            </text>

            {/* Viewport bounds labels */}
            <text x={vp.xmin - 2} y={vp.ymin - 3} textAnchor="end" style={{ fontSize: 8, fill: '#888' }}>ymax</text>
            <text x={vp.xmin - 2} y={vp.ymax + 3} textAnchor="end" dominantBaseline="hanging" style={{ fontSize: 8, fill: '#888' }}>ymin</text>
            <text x={vp.xmin + distXP} y={vp.ymin - 1} textAnchor="middle" style={{ fontSize: 8, fill: '#f9a825' }}>
              xmin+{distXP}
            </text>
          </svg>

          {/* Result summary */}
          <div style={{ marginTop: 6, fontSize: 11, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              ['coordVp',  `(${coordVp.x.toFixed(0)}, ${coordVp.y.toFixed(0)})`],
              ['coordP2',  `(${coordP2.x.toFixed(0)}, ${coordP2.y.toFixed(0)})`],
              ['derecho',  String(derecho)],
              ['con_punta (Magik)', 'false ⚠️'],
            ].map(([k, v]) => (
              <span key={k} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 3 }}>
                <b>{k}:</b> {v}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column: guardar/obtener + transform ──────────────────────── */}
        <div style={{ minWidth: 220, maxWidth: 270 }}>

          <div style={S.section}>
            <div style={S.h4}>guardar / obtener</div>
            <div style={{ ...S.row, marginBottom: 6 }}>
              <span style={{ ...S.label, minWidth: 50 }}>Store:</span>
              {(['gis', 'lb', 'mod'] as const).map(t => (
                <label key={t} style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
                  <input type="radio" checked={storeTarget === t} onChange={() => setStoreTarget(t)} />
                  {t}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button onClick={doGuardar} style={{ padding: '3px 10px', fontSize: 11, cursor: 'pointer', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 4 }}>
                guardar
              </button>
              <button onClick={doObtener} disabled={!storedRefs} style={{ padding: '3px 10px', fontSize: 11, cursor: 'pointer', background: storedRefs ? '#2e7d32' : '#ccc', color: '#fff', border: 'none', borderRadius: 4 }}>
                obtener
              </button>
            </div>
            {storedRefs && (
              <div style={{ fontSize: 10, marginBottom: 6 }}>
                <div style={{ color: '#555', marginBottom: 2 }}>Refs guardadas (elementosBd{storeTarget === 'gis' ? 'Gis' : storeTarget === 'lb' ? 'Lb' : 'Modificados'}):</div>
                {storedRefs.map((ref, i) => (
                  <div key={i} style={{ background: '#f0f4f8', padding: '2px 6px', borderRadius: 3, marginBottom: 2 }}>
                    {Object.entries(ref).map(([k, v]) => `${k} → ${v}`).join(', ')}
                  </div>
                ))}
              </div>
            )}
            {retrieved.length > 0 && (
              <div style={{ fontSize: 10 }}>
                <div style={{ color: '#2e7d32', marginBottom: 2 }}>Registros recuperados:</div>
                {retrieved.map(r => (
                  <div key={r.id} style={{ background: '#f1f8f1', padding: '2px 6px', borderRadius: 3, marginBottom: 2 }}>
                    [{r.sourceCollection}] id={r.id} — {r.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.section}>
            <div style={S.h4}>transformaCoordenada()</div>
            <div style={{ fontSize: 11 }}>
              <div style={{ marginBottom: 4, color: '#555' }}>Input GIS: (1000, 2000), escala=0.1</div>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '3px 8px 3px 0', color: '#555' }}>canvas=true</td>
                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>
                      ({coordCanvas.x.toFixed(0)}, {coordCanvas.y.toFixed(0)})
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '3px 8px 3px 0', color: '#555' }}>canvas=false</td>
                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>
                      ({coordViewport.x.toFixed(0)}, {coordViewport.y.toFixed(0)})
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 4, color: '#888', lineHeight: 1.4 }}>
                canvas=true: aplica escala×0.1 (print/plotter/SVG export).<br />
                canvas=false: pass-through + solo transform del viewport.
              </div>
            </div>
          </div>

          <div style={S.section}>
            <div style={S.h4}>Atributos compartidos</div>
            <table style={{ fontSize: 10, borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {([
                  ['outlineStyle',         'composite_line_style'],
                  ['fillStyle',            'fill_style.new_solid(:white)'],
                  ['shadowStyle',          '_unset'],
                  ['locked',               '_false'],
                  ['elementosBdGis',       '_unset'],
                  ['elementosBdLb',        '_unset'],
                  ['elementosModificados', '_unset'],
                  ['cedos',                '_unset'],
                  ['agregarCedos',         '_true'],
                ] as [string,string][]).map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '2px 8px 2px 0', color: '#1a3a5c', whiteSpace: 'nowrap' }}>{k}</td>
                    <td style={{ padding: '2px 0', color: '#555' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
