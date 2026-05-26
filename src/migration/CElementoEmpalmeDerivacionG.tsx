// =============================================================================
// MIGRACIÓN: c_elemento_empalme_derivacion_g  →  CElementoEmpalmeDerivacionG.tsx
// Jerarquía Magik: c_elemento_empalme_derivacion_g → c_elemento_empalme_g → c_elemento_entidad_g
// Fuente: adiciones_layout/source/Sellos/Utilerias/Tramo/c_elemento_empalme_derivacion_g.magik
// Autor original: dsanchez · 31-03-2005
// =============================================================================
//
// Elemento gráfico de empalme con derivación. Extiende c_elemento_empalme_g
// añadiendo un segundo slot (sNombre_derivada) y una segunda etiqueta.
// El área (bounding_box) es un cuadrado de nLong_Grafica × nLong_Grafica
// posicionado a la derecha del punto de contacto con el tramo.
//
// GIS omitido: el constructor recibe los datos directamente en lugar de
// leerlos de user!_num_empalme / user!_nom_deriva.
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos internos (modelan c_texto_grafico y c_simbolo_grafico simplificados)
// ---------------------------------------------------------------------------

interface TextoGrafico {
  texto:     string;
  tamanio:   number;
  alineacion: string;
  margenSup: number;
  margenInf: number;
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
// Clase base: c_elemento_empalme_g
// ---------------------------------------------------------------------------

class CElementoEmpalmeG {
  protected _nombreSimbolo: string;
  protected _descripcion:   string;
  protected _nLongGrafica:  number;
  protected _collEtiquetas: Map<string, number>;
  protected _etiqueta1:     TextoGrafico;
  protected _simbolo1:      SimboloGrafico;

  constructor(numEmpalme: string) {
    this._nombreSimbolo  = 'empalme de cobre';
    this._descripcion    = `ER-${numEmpalme}`;
    this._nLongGrafica   = 20;
    this._collEtiquetas  = new Map([['Etiqueta_1', 14]]);
    this._etiqueta1      = { texto: 'ER', tamanio: 25, alineacion: 'centre_centre', margenSup: 0, margenInf: 0 };
    this._simbolo1       = { nombre: 'empalme de cobre', margenSup: 0, margenInf: 0 };
  }

  // Magik: configurar_elementos — Etiqueta_1.sTexto = sDescripcion
  configurarElementos(): void {
    this._etiqueta1.texto = this._descripcion;
  }

  // Magik: dfn_ubicacion_elementos_internos — divide altura en 20 renglones
  dfnUbicacionElementosInternos(alturaArea: number): void {
    const ROWS    = 20;
    const altRen  = alturaArea / ROWS;
    const pos1    = this._collEtiquetas.get('Etiqueta_1') ?? 14;
    this._etiqueta1.margenSup = altRen * (pos1 / 10);
    this._etiqueta1.margenInf = altRen * ((ROWS - 2 - pos1) / 10);
  }

  // Magik: reposicionar_Area — bbox cuadrado anclado en punto de contacto (izq-centro)
  reposicionarArea(contacto: Punto2D): BBox {
    return {
      xMin: contacto.x,
      yMin: contacto.y - this._nLongGrafica / 2,
      xMax: contacto.x + this._nLongGrafica,
      yMax: contacto.y + this._nLongGrafica / 2,
    };
  }

  get descripcion():   string              { return this._descripcion; }
  get nLongGrafica():  number              { return this._nLongGrafica; }
  get etiqueta1():     Readonly<TextoGrafico>  { return this._etiqueta1; }
  get simbolo1():      Readonly<SimboloGrafico> { return this._simbolo1; }
}

// ---------------------------------------------------------------------------
// Clase derivada: c_elemento_empalme_derivacion_g
// ---------------------------------------------------------------------------

export class CElementoEmpalmeDerivacionG extends CElementoEmpalmeG {
  private _nombreDerivada: string;
  private _etiqueta2:      TextoGrafico;

  // Magik: new(RoObjeto) → recibe numEmpalme y nomDeriva en lugar de entidad GIS
  constructor(numEmpalme: string, nomDeriva: string) {
    super(numEmpalme);
    this._nombreSimbolo  = 'empalme_derivacion';
    this._descripcion    = `ED-${numEmpalme}`;
    this._nLongGrafica   = 40;
    this._nombreDerivada = nomDeriva;
    this._collEtiquetas.set('Etiqueta_2', 19);
    this._etiqueta2 = { texto: 'Localidad', tamanio: 30, alineacion: 'centre_centre', margenSup: 0, margenInf: 0 };
    this._simbolo1.nombre = 'empalme_derivacion';
    this.configurarElementos();
  }

  // Magik: configurar_elementos — super + Etiqueta_2.sTexto = sNombre_derivada
  override configurarElementos(): void {
    super.configurarElementos();
    this._etiqueta2.texto = this._nombreDerivada;
  }

  // Magik: dfn_ubicacion_elementos_internos — Etiq1, Etiq2 + Simbolo1 con ratio 300/552
  override dfnUbicacionElementosInternos(alturaArea: number): void {
    const ROWS   = 20;
    const altRen = alturaArea / ROWS;

    const pos1 = this._collEtiquetas.get('Etiqueta_1') ?? 14;
    this._etiqueta1.margenSup = altRen * (pos1 / 10);
    this._etiqueta1.margenInf = altRen * ((ROWS - 2 - pos1) / 10);

    const pos2 = this._collEtiquetas.get('Etiqueta_2') ?? 19;
    this._etiqueta2.margenSup = altRen * (pos2 / 10);
    this._etiqueta2.margenInf = altRen * ((ROWS - 2 - pos2) / 10);

    // El 552 es la altura aprox del símbolo con ancho 300; 150+80 = offset punta flecha
    const alturaSimb = (300 / 552) * this._nLongGrafica;
    const lv         = ((150 + 80) / 552) * alturaSimb;
    this._simbolo1.margenSup = lv / 10;
    this._simbolo1.margenInf = -(lv / 10);
  }

  get nombreDerivada(): string { return this._nombreDerivada; }
  set nombreDerivada(val: string) {
    this._nombreDerivada  = val;
    this._etiqueta2.texto = val;
  }

  get etiqueta2(): Readonly<TextoGrafico> { return this._etiqueta2; }
}

// =============================================================================
// Componente React — CElementoEmpalmeDerivacionGUI
// =============================================================================

const S = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 740,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 12, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '160px 1fr', gap: 4, padding: '2px 0', fontSize: 11 } as React.CSSProperties,
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

// SVG que representa el elemento gráfico dentro de su bounding box
function ElementoSVG({
  elem, alturaArea,
}: { elem: CElementoEmpalmeDerivacionG; alturaArea: number }) {
  // Escala: 1 unidad Magik = 4px para visualización
  const SCALE  = 4;
  const W      = elem.nLongGrafica * SCALE;  // 40 * 4 = 160px
  const H      = alturaArea * SCALE;
  const PAD    = 40;  // padding izq para mostrar el tramo entrante
  const svgW   = W + PAD + 30;
  const svgH   = H + 20;
  const cx     = PAD;          // left edge = contact point
  const cy     = H / 2 + 10;  // vertical center

  const e1 = elem.etiqueta1;
  const e2 = elem.etiqueta2;
  const s1 = elem.simbolo1;

  // Posición Y de cada etiqueta: margenSup relativo a top del bbox
  const e1y = 10 + e1.margenSup * SCALE;
  const e2y = 10 + e2.margenSup * SCALE;

  // Símbolo: bifurcación a ~60% del ancho
  const junctionX = cx + W * 0.6;
  const arrowTipY  = cy + s1.margenSup * SCALE;

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{ display: 'block', background: '#11111b', borderRadius: 6, marginTop: 8 }}
    >
      {/* Tramo entrante (izq → contact point) */}
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
      <text x={cx - 4} y={cy - 7} fontSize={8} fill="#f9e2af" textAnchor="middle">
        pto_contacto
      </text>

      {/* Línea principal (tramo que atraviesa el elemento) */}
      <line x1={cx} y1={cy} x2={cx + W + 20} y2={cy} stroke="#cba6f7" strokeWidth={2} />
      {/* Flecha derecha */}
      <polygon
        points={`${cx + W + 20},${cy} ${cx + W + 14},${cy - 4} ${cx + W + 14},${cy + 4}`}
        fill="#cba6f7"
      />

      {/* Punto de bifurcación */}
      <circle cx={junctionX} cy={cy} r={5} fill="#f38ba8" />

      {/* Rama derivación (baja desde la bifurcación) */}
      <line x1={junctionX} y1={cy} x2={junctionX} y2={H + 8} stroke="#f38ba8" strokeWidth={2} strokeDasharray="3,2" />
      <polygon
        points={`${junctionX},${H + 8} ${junctionX - 4},${H + 2} ${junctionX + 4},${H + 2}`}
        fill="#f38ba8"
      />

      {/* Símbolo margen indicator */}
      <line
        x1={junctionX + 8} y1={arrowTipY}
        x2={junctionX + 8} y2={cy}
        stroke="#fab387" strokeWidth={1} strokeDasharray="2,2"
      />
      <text x={junctionX + 12} y={arrowTipY + 4} fontSize={8} fill="#fab387">
        margenSup={s1.margenSup.toFixed(2)}
      </text>

      {/* Etiqueta 1 (descripcion "ED-xxx") */}
      <text
        x={cx + W / 2} y={Math.max(16, e1y + 4)}
        fontSize={Math.min(11, e1.tamanio * 0.4)}
        fill="#a6e3a1"
        textAnchor="middle"
        fontWeight="bold"
      >
        {e1.texto}
      </text>
      <text x={cx + W / 2} y={Math.max(24, e1y + 13)} fontSize={7} fill="#6c7086" textAnchor="middle">
        Etiqueta_1 · pos={elem['_collEtiquetas' as never] ? '14' : '14'}
      </text>

      {/* Etiqueta 2 (nombre derivada) */}
      <text
        x={cx + W / 2} y={Math.min(H + 6, e2y + 4)}
        fontSize={Math.min(10, e2.tamanio * 0.35)}
        fill="#89dceb"
        textAnchor="middle"
      >
        {e2.texto}
      </text>
      <text x={cx + W / 2} y={Math.min(H + 6, e2y + 13)} fontSize={7} fill="#6c7086" textAnchor="middle">
        Etiqueta_2 · pos=19
      </text>

      {/* Dimensiones */}
      <text x={cx + W / 2} y={H + 18} fontSize={8} fill="#585b70" textAnchor="middle">
        {elem.nLongGrafica} × {alturaArea} mm
      </text>
    </svg>
  );
}

const DEFAULTS = {
  numEmpalme:  '042',
  nomDeriva:   'NORTE-B',
  alturaArea:  '40',
  contactoX:   '100',
  contactoY:   '200',
};

export function CElementoEmpalmeDerivacionGUI() {
  const [numEmpalme,  setNumEmpalme]  = useState(DEFAULTS.numEmpalme);
  const [nomDeriva,   setNomDeriva]   = useState(DEFAULTS.nomDeriva);
  const [alturaArea,  setAlturaArea]  = useState(DEFAULTS.alturaArea);
  const [contactoX,   setContactoX]   = useState(DEFAULTS.contactoX);
  const [contactoY,   setContactoY]   = useState(DEFAULTS.contactoY);

  const altNum  = parseFloat(alturaArea)  || 40;
  const cxNum   = parseFloat(contactoX)   || 100;
  const cyNum   = parseFloat(contactoY)   || 200;

  const elem = useMemo(() => {
    const e = new CElementoEmpalmeDerivacionG(numEmpalme, nomDeriva);
    e.dfnUbicacionElementosInternos(altNum);
    return e;
  }, [numEmpalme, nomDeriva, altNum]);

  const bbox = useMemo(
    () => elem.reposicionarArea({ x: cxNum, y: cyNum }),
    [elem, cxNum, cyNum],
  );

  const e1 = elem.etiqueta1;
  const e2 = elem.etiqueta2;
  const s1 = elem.simbolo1;

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CElementoEmpalmeDerivacionG</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          empalme con derivación · extiende c_elemento_empalme_g → c_elemento_entidad_g
        </span>
      </div>

      {/* Jerarquía */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
          <span style={{ color: '#585b70', padding: '2px 8px', border: '1px solid #45475a', borderRadius: 4 }}>c_elemento_entidad_g</span>
          <span style={{ color: '#45475a' }}>→</span>
          <span style={{ color: '#6c7086', padding: '2px 8px', border: '1px solid #45475a', borderRadius: 4 }}>c_elemento_empalme_g</span>
          <span style={{ color: '#45475a' }}>→</span>
          <span style={{ color: '#cba6f7', padding: '2px 8px', border: '1px solid #cba6f7', borderRadius: 4, fontWeight: 'bold' }}>c_elemento_empalme_derivacion_g</span>
          <span style={{ color: '#585b70', marginLeft: 4, fontSize: 10 }}>+sNombre_derivada · +Etiqueta_2</span>
        </div>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo: controles */}
        <div>
          <div style={S.card}>
            <div style={S.title}>new(numEmpalme, nomDeriva)  ·  constructor</div>
            <AttribInput label="numEmpalme  (user!_num_empalme)" value={numEmpalme} onChange={setNumEmpalme} />
            <AttribInput label="nomDeriva   (user!_nom_deriva)"  value={nomDeriva}  onChange={setNomDeriva}  />
          </div>

          <div style={S.card}>
            <div style={S.title}>dfn_ubicacion_elementos_internos(alturaArea)</div>
            <AttribInput label="alturaArea (mm)"  value={alturaArea} onChange={setAlturaArea} type="number" />
            <div style={{ marginTop: 8 }}>
              <KV k="nLong_Grafica"      v={`${elem.nLongGrafica} mm`} />
              <KV k="sNombre_Simbolo"    v={s1.nombre} />
              <KV k="sDescripcion"       v={elem.descripcion} />
              <KV k="sNombre_derivada"   v={elem.nombreDerivada} />
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>reposicionar_Area(contacto)  →  BoundingBox</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <AttribInput label="contacto.X" value={contactoX} onChange={setContactoX} type="number" />
              <AttribInput label="contacto.Y" value={contactoY} onChange={setContactoY} type="number" />
            </div>
            <KV k="xMin" v={bbox.xMin.toFixed(1)} />
            <KV k="yMin" v={bbox.yMin.toFixed(1)} />
            <KV k="xMax" v={bbox.xMax.toFixed(1)} />
            <KV k="yMax" v={bbox.yMax.toFixed(1)} />
            <div style={{ marginTop: 4, fontSize: 10, color: '#585b70' }}>
              width = {(bbox.xMax - bbox.xMin).toFixed(1)} · height = {(bbox.yMax - bbox.yMin).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Panel derecho: SVG + estado */}
        <div>
          <div style={S.card}>
            <div style={S.title}>Despliega() — vista del elemento</div>
            <ElementoSVG elem={elem} alturaArea={altNum} />
            <div style={{ marginTop: 8, fontSize: 10, color: '#585b70' }}>
              Azul = tramo principal · Rojo = bifurcación (derivación) · Amarillo = pto_contacto
            </div>
          </div>

          <div style={S.card}>
            <div style={S.title}>elementos internos (oElementos)</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 2 }}>Etiqueta_1 · collEtiquetas=14</div>
              <KV k="texto"     v={e1.texto} />
              <KV k="tamanio"   v={e1.tamanio} />
              <KV k="alineacion" v={e1.alineacion} />
              <KV k="margenSup" v={`${e1.margenSup.toFixed(3)} mm`} />
              <KV k="margenInf" v={`${e1.margenInf.toFixed(3)} mm`} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#89dceb', fontSize: 10, marginBottom: 2 }}>Etiqueta_2 · collEtiquetas=19  (+nuevo en derivacion_g)</div>
              <KV k="texto"     v={e2.texto} />
              <KV k="tamanio"   v={e2.tamanio} />
              <KV k="alineacion" v={e2.alineacion} />
              <KV k="margenSup" v={`${e2.margenSup.toFixed(3)} mm`} />
              <KV k="margenInf" v={`${e2.margenInf.toFixed(3)} mm`} />
            </div>

            <div>
              <div style={{ color: '#fab387', fontSize: 10, marginBottom: 2 }}>Simbolo_1 · "empalme_derivacion"</div>
              <KV k="nombre"    v={s1.nombre} />
              <KV k="margenSup" v={`${s1.margenSup.toFixed(3)} mm`} />
              <KV k="margenInf" v={`${s1.margenInf.toFixed(3)} mm`} />
              <div style={{ fontSize: 9, color: '#585b70', marginTop: 4 }}>
                alturaSimb = (300/552) × nLong = {((300 / 552) * elem.nLongGrafica).toFixed(2)} ·
                LV = (230/552) × alturaSimb = {(((150 + 80) / 552) * (300 / 552) * elem.nLongGrafica).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
