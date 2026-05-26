// =============================================================================
// MIGRACIÓN: c_elemento_empalme_g  →  CElementoEmpalmeG.tsx
// Jerarquía Magik: c_elemento_empalme_g → c_elemento_entidad_g
// Fuente: adiciones_layout/source/Sellos/Utilerias/Tramo/c_elemento_empalme_g.magik
// Autor original: dsanchez · 31-03-2005
// =============================================================================
//
// Elemento gráfico de empalme de cobre. Contiene una etiqueta (Etiqueta_1)
// con la descripción "ER-{num}" y un símbolo "empalme de cobre".
// Clase base de c_elemento_empalme_derivacion_g.
//
// GIS omitido: el constructor recibe numEmpalme directamente en lugar de
// leer user!_num_empalme de la entidad GIS.
// En dfn_ubicacion_elementos_internos los márgenes del Simbolo_1 se dejan en
// 0 porque el Magik original sólo calcula LnNumRenSup/LnNumrenInf para el
// símbolo pero no los asigna (bug heredado del fuente).
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TextoGrafico {
  texto:      string;
  tamanio:    number;
  alineacion: string;
  margenSup:  number;
  margenInf:  number;
}

interface SimboloGrafico {
  nombre:    string;
  margenSup: number;
  margenInf: number;
}

export interface Punto2D { x: number; y: number; }

export interface BBox {
  xMin: number; yMin: number;
  xMax: number; yMax: number;
}

// ---------------------------------------------------------------------------
// Clase principal: c_elemento_empalme_g
// ---------------------------------------------------------------------------

export class CElementoEmpalmeG {
  protected _nombreSimbolo: string;
  protected _descripcion:   string;
  protected _nLongGrafica:  number;
  protected _collEtiquetas: Map<string, number>;
  private   _etiqueta1:     TextoGrafico;
  private   _simbolo1:      SimboloGrafico;

  // Magik: new(RoObjeto) — recibe numEmpalme en lugar de entidad GIS
  constructor(numEmpalme: string) {
    this._nombreSimbolo = 'empalme de cobre';
    this._descripcion   = `ER-${numEmpalme}`;
    this._nLongGrafica  = 20;
    this._collEtiquetas = new Map([['Etiqueta_1', 14]]);

    // Magik: Crea_elementos_internos — inicializa objetos gráficos
    this._etiqueta1 = { texto: 'ER', tamanio: 25, alineacion: 'centre_centre', margenSup: 0, margenInf: 0 };
    this._simbolo1  = { nombre: this._nombreSimbolo, margenSup: 0, margenInf: 0 };

    this.configurarElementos();
  }

  // Magik: configurar_elementos — llama Crea_elementos_internos + asigna texto
  configurarElementos(): void {
    this._etiqueta1.texto = this._descripcion;
  }

  // Magik: dfn_ubicacion_elementos_internos
  // Divide el área en 20 renglones y calcula márgenes de Etiqueta_1.
  // Nota: en el fuente original los márgenes de Simbolo_1 se calculan pero
  // nunca se asignan al objeto (LnNumRenSup/Inf locales sin LoSim.nMargen_*).
  dfnUbicacionElementosInternos(alturaArea: number): void {
    const ROWS   = 20;
    const altRen = alturaArea / ROWS;

    const pos1 = this._collEtiquetas.get('Etiqueta_1') ?? 14;
    this._etiqueta1.margenSup = altRen * (pos1 / 10);
    this._etiqueta1.margenInf = altRen * ((ROWS - 2 - pos1) / 10);

    // Simbolo_1: Magik calcula LnNumRenSup=1, LnNumrenInf=19 pero no asigna
    // → márgenes se dejan en 0 (comportamiento fiel al original)
  }

  // Magik: reposicionar_Area — heredado de c_elemento_entidad_g
  // Bbox cuadrado posicionado a la derecha del punto de contacto (centrado en Y)
  reposicionarArea(contacto: Punto2D): BBox {
    return {
      xMin: contacto.x,
      yMin: contacto.y - this._nLongGrafica / 2,
      xMax: contacto.x + this._nLongGrafica,
      yMax: contacto.y + this._nLongGrafica / 2,
    };
  }

  get descripcion():   string                   { return this._descripcion; }
  get nLongGrafica():  number                   { return this._nLongGrafica; }
  get nombreSimbolo(): string                   { return this._nombreSimbolo; }
  get etiqueta1():     Readonly<TextoGrafico>   { return this._etiqueta1; }
  get simbolo1():      Readonly<SimboloGrafico> { return this._simbolo1; }
}

// =============================================================================
// Componente React — CElementoEmpalmeGUI
// =============================================================================

const S = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 720,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 12, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '170px 1fr',
    gap: 4, padding: '2px 0', fontSize: 11,
  } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  label: { color: '#cba6f7', fontSize: 11, marginBottom: 2, display: 'block' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
};

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={S.row}>
      <span style={S.k}>{k}</span>
      <span style={S.v}>{String(v)}</span>
    </div>
  );
}

function AttribInput({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={S.label}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={S.input} />
    </div>
  );
}

// SVG del elemento: empalme de cobre (sin derivación)
function ElementoSVG({
  elem, alturaArea,
}: { elem: CElementoEmpalmeG; alturaArea: number }) {
  const SCALE = 5;
  const W     = elem.nLongGrafica * SCALE;   // 20 × 5 = 100px
  const H     = alturaArea * SCALE;
  const PAD   = 50;
  const svgW  = W + PAD + 40;
  const svgH  = H + 30;
  const cx    = PAD;
  const cy    = H / 2 + 10;

  const e1  = elem.etiqueta1;
  const e1y = 10 + e1.margenSup * SCALE;

  // Posición relativa de la etiqueta dentro del bbox
  const ROWS   = 20;
  const pos1   = 14;
  const pctTop = pos1 / ROWS;  // 70 %

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{ display: 'block', background: '#11111b', borderRadius: 6, marginTop: 8 }}
    >
      {/* Tramo entrante */}
      <line x1={10} y1={cy} x2={cx} y2={cy} stroke="#89dceb" strokeWidth={2} />
      <polygon
        points={`${cx},${cy} ${cx - 6},${cy - 4} ${cx - 6},${cy + 4}`}
        fill="#89dceb"
      />

      {/* Bounding box */}
      <rect
        x={cx} y={10} width={W} height={H}
        fill="none" stroke="#45475a" strokeWidth={1} strokeDasharray="4,2"
      />

      {/* Punto de contacto */}
      <circle cx={cx} cy={cy} r={4} fill="#f9e2af" />
      <text x={cx} y={cy - 8} fontSize={7} fill="#f9e2af" textAnchor="middle">pto_contacto</text>

      {/* Línea principal (tramo que pasa por el elemento) */}
      <line x1={cx} y1={cy} x2={cx + W + 28} y2={cy} stroke="#cba6f7" strokeWidth={2} />
      <polygon
        points={`${cx + W + 28},${cy} ${cx + W + 22},${cy - 4} ${cx + W + 22},${cy + 4}`}
        fill="#cba6f7"
      />

      {/* Símbolo: círculo de empalme en el centro del elemento */}
      <circle cx={cx + W / 2} cy={cy} r={7} fill="#313244" stroke="#fab387" strokeWidth={1.5} />
      <text x={cx + W / 2} y={cy + 3} fontSize={6} fill="#fab387" textAnchor="middle">emp</text>

      {/* Etiqueta 1 */}
      <text
        x={cx + W / 2}
        y={Math.max(18, 10 + pctTop * H - 2)}
        fontSize={Math.min(10, e1.tamanio * 0.42)}
        fill="#a6e3a1"
        textAnchor="middle"
        fontWeight="bold"
      >
        {e1.texto}
      </text>
      <text
        x={cx + W / 2}
        y={Math.max(26, 10 + pctTop * H + 8)}
        fontSize={7}
        fill="#6c7086"
        textAnchor="middle"
      >
        Etiqueta_1 · pos=14
      </text>

      {/* Línea indicador de margen */}
      {e1y > 10 && (
        <>
          <line
            x1={cx + W - 4} y1={10}
            x2={cx + W - 4} y2={Math.min(e1y, H + 10)}
            stroke="#585b70" strokeWidth={1} strokeDasharray="2,2"
          />
          <text x={cx + W + 2} y={Math.min(e1y + 3, H + 8)} fontSize={7} fill="#585b70">
            margenSup={e1.margenSup.toFixed(2)}
          </text>
        </>
      )}

      {/* Dimensiones */}
      <text x={cx + W / 2} y={H + 22} fontSize={8} fill="#585b70" textAnchor="middle">
        {elem.nLongGrafica} × {alturaArea} mm
      </text>
    </svg>
  );
}

export function CElementoEmpalmeGUI() {
  const [numEmpalme, setNumEmpalme] = useState('017');
  const [alturaArea, setAlturaArea] = useState('20');
  const [contactoX,  setContactoX]  = useState('80');
  const [contactoY,  setContactoY]  = useState('150');

  const altNum = parseFloat(alturaArea) || 20;
  const cxNum  = parseFloat(contactoX)  || 80;
  const cyNum  = parseFloat(contactoY)  || 150;

  const elem = useMemo(() => {
    const e = new CElementoEmpalmeG(numEmpalme);
    e.dfnUbicacionElementosInternos(altNum);
    return e;
  }, [numEmpalme, altNum]);

  const bbox = useMemo(
    () => elem.reposicionarArea({ x: cxNum, y: cyNum }),
    [elem, cxNum, cyNum],
  );

  const e1 = elem.etiqueta1;
  const s1 = elem.simbolo1;

  // Calcular LnNumRenSup/Inf que el Magik computa pero NO asigna al símbolo
  const ROWS        = 20;
  const altRen      = altNum / ROWS;
  const simNrenSup  = 5 - 4;   // = 1 (hardcoded en Magik)
  const simNrenInf  = 15 + 4;  // = 19 (hardcoded en Magik)
  const simMargenSupCalculado = altRen * (simNrenSup / 10);
  const simMargenInfCalculado = altRen * (simNrenInf / 10);

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CElementoEmpalmeG</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          empalme de cobre · base de CElementoEmpalmeDerivacionG
        </span>
      </div>

      {/* Jerarquía */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
          <span style={{ color: '#585b70', padding: '2px 8px', border: '1px solid #45475a', borderRadius: 4 }}>
            c_elemento_entidad_g
          </span>
          <span style={{ color: '#45475a' }}>→</span>
          <span style={{ color: '#cba6f7', padding: '2px 8px', border: '1px solid #cba6f7', borderRadius: 4, fontWeight: 'bold' }}>
            c_elemento_empalme_g
          </span>
          <span style={{ color: '#45475a' }}>→</span>
          <span style={{ color: '#585b70', padding: '2px 8px', border: '1px solid #45475a', borderRadius: 4 }}>
            c_elemento_empalme_derivacion_g
          </span>
        </div>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo */}
        <div>
          <div style={S.card}>
            <div style={S.title}>new(numEmpalme)  ·  constructor</div>
            <AttribInput
              label="numEmpalme  (user!_num_empalme)"
              value={numEmpalme}
              onChange={setNumEmpalme}
            />
            <div style={{ marginTop: 8 }}>
              <KV k="sNombre_Simbolo" v={elem.nombreSimbolo} />
              <KV k="sDescripcion"    v={elem.descripcion} />
              <KV k="nLong_Grafica"   v={`${elem.nLongGrafica} mm`} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>dfn_ubicacion_elementos_internos(alturaArea)</div>
            <AttribInput
              label="alturaArea (mm)"
              value={alturaArea}
              onChange={setAlturaArea}
              type="number"
            />

            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 4 }}>Etiqueta_1 · collEtiquetas[pos]=14</div>
              <KV k="altRen = altArea/20"     v={`${altRen.toFixed(3)} mm`} />
              <KV k="margenSup = altRen×(14/10)" v={`${e1.margenSup.toFixed(3)} mm`} />
              <KV k="margenInf = altRen×(4/10)"  v={`${e1.margenInf.toFixed(3)} mm`} />
            </div>

            <div style={{ background: '#1e1e2e', borderRadius: 4, padding: 8, fontSize: 10 }}>
              <div style={{ color: '#fab387', marginBottom: 4 }}>Simbolo_1 — bug en fuente Magik</div>
              <div style={{ color: '#585b70', lineHeight: 1.6 }}>
                El código calcula LnNumRenSup=1 y LnNumrenInf=19 pero nunca
                los asigna a <code>LoSim.nMargen_*</code> → márgenes = 0.
              </div>
              <div style={{ marginTop: 6 }}>
                <KV k="LnNumRenSup calculado" v={simNrenSup} />
                <KV k="LnNumRenInf calculado" v={simNrenInf} />
                <KV k="margenSup si asignado" v={`${simMargenSupCalculado.toFixed(3)} mm (no aplicado)`} />
                <KV k="margenInf si asignado" v={`${simMargenInfCalculado.toFixed(3)} mm (no aplicado)`} />
                <KV k="margenSup real"         v={`${s1.margenSup} mm`} />
                <KV k="margenInf real"         v={`${s1.margenInf} mm`} />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>reposicionar_Area(contacto)  →  BoundingBox</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <AttribInput label="contacto.X" value={contactoX} onChange={setContactoX} type="number" />
              <AttribInput label="contacto.Y" value={contactoY} onChange={setContactoY} type="number" />
            </div>
            <KV k="xMin = contacto.X + 0"       v={bbox.xMin.toFixed(1)} />
            <KV k="yMin = contacto.Y − nLong/2"  v={bbox.yMin.toFixed(1)} />
            <KV k="xMax = contacto.X + nLong"    v={bbox.xMax.toFixed(1)} />
            <KV k="yMax = contacto.Y + nLong/2"  v={bbox.yMax.toFixed(1)} />
            <div style={{ marginTop: 4, fontSize: 10, color: '#585b70' }}>
              {(bbox.xMax - bbox.xMin).toFixed(1)} × {(bbox.yMax - bbox.yMin).toFixed(1)} mm
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div>
          <div style={S.card}>
            <div style={S.title}>Despliega() — vista del elemento</div>
            <ElementoSVG elem={elem} alturaArea={altNum} />
            <div style={{ marginTop: 8, fontSize: 10, color: '#585b70' }}>
              Púrpura = tramo · Naranja = símbolo empalme · Amarillo = pto_contacto · Verde = Etiqueta_1
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>estado de elementos internos (oElementos)</div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 3 }}>
                Etiqueta_1  ·  c_texto_grafico.new("ER")
              </div>
              <KV k="texto"      v={e1.texto} />
              <KV k="tamanio"    v={e1.tamanio} />
              <KV k="alineacion" v={e1.alineacion} />
              <KV k="margenSup"  v={`${e1.margenSup.toFixed(3)} mm`} />
              <KV k="margenInf"  v={`${e1.margenInf.toFixed(3)} mm`} />
            </div>

            <div>
              <div style={{ color: '#fab387', fontSize: 10, marginBottom: 3 }}>
                Simbolo_1  ·  c_simbolo_grafico.new("empalme de cobre")
              </div>
              <KV k="nombre"    v={s1.nombre} />
              <KV k="margenSup" v={`${s1.margenSup} mm  ← no asignado (bug fuente)`} />
              <KV k="margenInf" v={`${s1.margenInf} mm  ← no asignado (bug fuente)`} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>diferencias vs c_elemento_empalme_derivacion_g</div>
            <div style={{ fontSize: 10, color: '#585b70', lineHeight: 1.7 }}>
              <div><span style={{ color: '#f38ba8' }}>−</span> slot <code>sNombre_derivada</code></div>
              <div><span style={{ color: '#f38ba8' }}>−</span> Etiqueta_2 (nombre de la derivación)</div>
              <div><span style={{ color: '#f38ba8' }}>−</span> nLong_Grafica = 20  (derivacion = 40)</div>
              <div><span style={{ color: '#f38ba8' }}>−</span> sNombre_Simbolo = "empalme de cobre"  (derivacion = "empalme_derivacion")</div>
              <div><span style={{ color: '#f38ba8' }}>−</span> sDescripcion = "ER-xxx"  (derivacion = "ED-xxx")</div>
              <div><span style={{ color: '#f38ba8' }}>−</span> Simbolo_1 sin ratios 300/552 en dfn_ubicacion</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
