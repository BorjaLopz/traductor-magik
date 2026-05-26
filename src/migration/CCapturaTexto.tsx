// =============================================================================
// MIGRACIÓN: c_captura_texto  →  CCapturaTexto.tsx
// Jerarquía Magik: c_captura_texto extends c_base_layout
// Fuente: adiciones_layout/source/Sellos/c_captura_texto.magik
// Autor: dsanchez  ·  15-Enero-2005
// =============================================================================
//
// Elemento de texto para sellos de plano. Envuelve una caja de texto
// con propiedades de orientación, alineación (vertical×horizontal),
// tamaño de fuente, estilo, color, ajuste de línea y recorte.
//
// En Magik todos los getters/setters delegan al objeto interno
// textbox_layout (.oCaja_Texto). Aquí se modelan directamente como
// campos de la clase, eliminando la dependencia GIS.
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type TextOrientation  = 'left_right' | 'top_bottom';
export type TextVAlign       = 'centre' | 'top' | 'bottom';
export type TextHAlign       = 'left' | 'centre' | 'right';
export type TextAlignment    = `${TextVAlign}_${TextHAlign}`;

export const VALID_ORIENTATIONS: readonly TextOrientation[] = ['left_right', 'top_bottom'];

export const VALID_ALIGNMENTS: readonly TextAlignment[] = [
  'centre_left', 'centre_centre', 'centre_right',
  'top_left',    'top_centre',    'top_right',
  'bottom_left', 'bottom_centre', 'bottom_right',
];

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CCapturaTexto {
  // ── Slots (todos :private :writable en Magik) ────────────────────────────
  private _texto:       string;
  private _orientacion: TextOrientation;
  private _alineacion:  TextAlignment;
  private _tamanio:     number;
  private _estilo:      string;
  private _color:       string;
  private _ajusteLinea: boolean;
  private _recorte:     boolean;

  // ── Magik: new(RsNombre) ─────────────────────────────────────────────────
  constructor(texto = '') {
    this._texto       = texto;
    this._orientacion = 'left_right';  // Magik: :left_right
    this._alineacion  = 'centre_left'; // Magik: :centre_left
    this._tamanio     = 10;            // Magik: nTamanio = 10
    this._estilo      = 'bold';        // Magik: font_name = "bold"
    this._color       = 'black';       // Magik: colour.called("black")
    this._ajusteLinea = false;         // Magik: bAjuste_Linea? = _false
    this._recorte     = false;         // Magik: bRecorte? = _false
  }

  // ── Magik: new_from(RoObjeto, _optional RsTexto) ─────────────────────────
  // Valida que el origen sea CCapturaTexto; copia todas las propiedades.
  // Los márgenes (/10) vienen del parent c_base_layout — no se modelan aquí.
  static newFrom(origen: CCapturaTexto, texto?: string): CCapturaTexto {
    if (!(origen instanceof CCapturaTexto)) {
      throw new Error('El objeto que se proporcionó no es de tipo CCapturaTexto'); // Magik: condition.raise(:warning)
    }
    const c = new CCapturaTexto(texto ?? origen._texto);
    c._orientacion = origen._orientacion;
    c._alineacion  = origen._alineacion;
    c._tamanio     = origen._tamanio;
    c._estilo      = origen._estilo;
    c._color       = origen._color;
    c._ajusteLinea = origen._ajusteLinea;
    c._recorte     = origen._recorte;
    return c;
  }

  // ── sTexto getter / setter ────────────────────────────────────────────────
  get texto(): string { return this._texto; }
  set texto(val: string) { this._texto = val; }

  // ── sOrientacion — Magik valida :left_right | :top_bottom ─────────────────
  get orientacion(): TextOrientation { return this._orientacion; }
  set orientacion(val: TextOrientation) {
    if (!VALID_ORIENTATIONS.includes(val)) {
      throw new Error(`Error al asignar la Orientación: "${val}"`); // Magik: condition.raise(:warning)
    }
    this._orientacion = val;
  }

  // ── sAlineacion — Magik escanea la cadena buscando '_' para separar ────────
  // vertical (centre/top/bottom) + horizontal (left/centre/right)
  get alineacion(): TextAlignment { return this._alineacion; }
  set alineacion(val: TextAlignment) {
    if (!VALID_ALIGNMENTS.includes(val)) {
      throw new Error(`Error al asignar la alineación: "${val}"`); // Magik: condition.raise(:warning)
    }
    this._alineacion = val;
  }

  // Partes individuales derivadas del split (Magik: LsAlinVert / LsAlinHor)
  get alineacionVertical(): TextVAlign   { return this._alineacion.split('_')[0] as TextVAlign; }
  get alineacionHorizontal(): TextHAlign { return this._alineacion.split('_')[1] as TextHAlign; }

  // ── nTamanio — Magik valida > 0 ───────────────────────────────────────────
  get tamanio(): number { return this._tamanio; }
  set tamanio(val: number) {
    if (val <= 0) throw new Error('Debe ser un número positivo.'); // Magik: condition.raise(:warning)
    this._tamanio = val;
  }

  // ── sEstilo (font_name en Magik) ──────────────────────────────────────────
  get estilo(): string { return this._estilo; }
  set estilo(val: string) { this._estilo = val; }

  // ── sColor (colour.called(name) en Magik) ─────────────────────────────────
  get color(): string { return this._color; }
  set color(val: string) { this._color = val; }

  // ── bAjuste_Linea? (oCaja_Texto.wrap) ────────────────────────────────────
  get ajusteLinea(): boolean { return this._ajusteLinea; }
  set ajusteLinea(val: boolean) { this._ajusteLinea = val; }

  // ── bRecorte? (oCaja_Texto.clip) ─────────────────────────────────────────
  get recorte(): boolean { return this._recorte; }
  set recorte(val: boolean) { this._recorte = val; }

  // ── Obten_Elemento_captura — devuelve snapshot del objeto interno ──────────
  obtenElementoCaptura(): Readonly<{
    texto: string; orientacion: TextOrientation; alineacion: TextAlignment;
    tamanio: number; estilo: string; color: string;
    ajusteLinea: boolean; recorte: boolean;
  }> {
    return {
      texto:       this._texto,
      orientacion: this._orientacion,
      alineacion:  this._alineacion,
      tamanio:     this._tamanio,
      estilo:      this._estilo,
      color:       this._color,
      ajusteLinea: this._ajusteLinea,
      recorte:     this._recorte,
    };
  }

  // ── CSS helpers (no existe en Magik — útil para el showcase) ─────────────
  toCssText(): React.CSSProperties {
    const hMap: Record<TextHAlign, string> = { left: 'flex-start', centre: 'center', right: 'flex-end' };
    const vMap: Record<TextVAlign,  string> = { top: 'flex-start', centre: 'center', bottom: 'flex-end' };
    return {
      display:        'flex',
      justifyContent: hMap[this.alineacionHorizontal],
      alignItems:     vMap[this.alineacionVertical],
      writingMode:    this._orientacion === 'top_bottom' ? 'vertical-rl' : 'horizontal-tb',
      fontSize:       this._tamanio * 1.5,
      fontFamily:     this._estilo === 'bold' ? 'sans-serif' : this._estilo,
      fontWeight:     this._estilo === 'bold' ? 'bold' : 'normal',
      fontStyle:      this._estilo === 'italic' ? 'italic' : 'normal',
      color:          this._color,
      whiteSpace:     this._ajusteLinea ? 'normal' : 'nowrap',
      overflowWrap:   this._ajusteLinea ? 'break-word' : 'normal',
      overflow:       this._recorte ? 'hidden' : 'visible',
    };
  }
}

// =============================================================================
// Componente React — CCapturaTextoUI
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
  row:   { display: 'grid', gridTemplateColumns: '170px 1fr', gap: 4, padding: '2px 0', fontSize: 11 } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  vErr:  { color: '#f38ba8' } as React.CSSProperties,
  label: { color: '#cba6f7', fontSize: 11, marginBottom: 2, display: 'block' } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  inputErr: {
    border: '1px solid #f38ba8',
  } as React.CSSProperties,
  select: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
    width: '100%',
  } as React.CSSProperties,
  toggle: (on: boolean): React.CSSProperties => ({
    padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 11,
    background: on ? '#a6e3a1' : '#313244', color: on ? '#1e1e2e' : '#bac2de',
  }),
  preview: (css: React.CSSProperties): React.CSSProperties => ({
    ...css,
    width: '100%', height: 120,
    background: '#11111b', border: '1px solid #45475a', borderRadius: 6,
    padding: 8, boxSizing: 'border-box' as const,
  }),
  chip: (color: string): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 8px', borderRadius: 10,
    background: '#313244', color, fontSize: 10, marginRight: 4,
  }),
};

function Field({ label, value, err }: { label: string; value: React.ReactNode; err?: boolean }) {
  return (
    <div style={S.row}>
      <span style={S.k}>{label}</span>
      <span style={err ? S.vErr : S.v}>{value}</span>
    </div>
  );
}

const ESTILOS = ['bold', 'normal', 'italic', 'Arial', 'Helvetica', 'Courier'];
const COLORES = ['black', 'white', 'red', 'blue', 'green', 'gray', 'orange', 'purple'];

export function CCapturaTextoUI() {
  const [texto,       setTexto]       = useState('DESCRIPCION');
  const [orientacion, setOrientacion] = useState<TextOrientation>('left_right');
  const [alineacion,  setAlineacion]  = useState<TextAlignment>('centre_left');
  const [tamanio,     setTamanioRaw]  = useState('10');
  const [estilo,      setEstilo]      = useState('bold');
  const [color,       setColor]       = useState('black');
  const [ajusteLinea, setAjusteLinea] = useState(false);
  const [recorte,     setRecorte]     = useState(false);

  const tamanioNum  = parseInt(tamanio, 10);
  const tamanioErr  = isNaN(tamanioNum) || tamanioNum <= 0;

  // Instancia del modelo
  const ct = useMemo(() => {
    const obj = new CCapturaTexto(texto);
    obj.orientacion = orientacion;
    obj.alineacion  = alineacion;
    if (!tamanioErr) obj.tamanio = tamanioNum;
    obj.estilo      = estilo;
    obj.color       = color;
    obj.ajusteLinea = ajusteLinea;
    obj.recorte     = recorte;
    return obj;
  }, [texto, orientacion, alineacion, tamanioErr, tamanioNum, estilo, color, ajusteLinea, recorte]);

  // Copia con newFrom — usa texto alternativo
  const [textoAlt, setTextoAlt] = useState('COPIA');
  const ctCopy = useMemo(
    () => CCapturaTexto.newFrom(ct, textoAlt || undefined),
    [ct, textoAlt],
  );

  const snapshot = ct.obtenElementoCaptura();
  const cssText  = ct.toCssText();

  return (
    <div style={S.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CCapturaTexto</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          elemento de texto para sello · wraps textbox_layout
        </span>
      </div>

      <div style={S.grid2}>

        {/* Panel izquierdo: controles */}
        <div>
          <div style={S.card}>
            <div style={S.title}>new(RsNombre)  ·  propiedades</div>

            <label style={S.label}>texto</label>
            <input
              value={texto}
              onChange={e => setTexto(e.target.value)}
              style={S.input}
            />

            <div style={{ marginTop: 8 }}>
              <label style={S.label}>sOrientacion</label>
              <select
                value={orientacion}
                onChange={e => setOrientacion(e.target.value as TextOrientation)}
                style={S.select}
              >
                {VALID_ORIENTATIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={S.label}>sAlineacion</label>
              <select
                value={alineacion}
                onChange={e => setAlineacion(e.target.value as TextAlignment)}
                style={S.select}
              >
                {VALID_ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={S.label}>nTamanio (Font_Size)</label>
                <input
                  type="number"
                  value={tamanio}
                  onChange={e => setTamanioRaw(e.target.value)}
                  style={{ ...S.input, ...(tamanioErr ? S.inputErr : {}) }}
                />
                {tamanioErr && (
                  <span style={{ ...S.vErr, fontSize: 10 }}>Debe ser un número positivo.</span>
                )}
              </div>
              <div>
                <label style={S.label}>sEstilo (font_name)</label>
                <select
                  value={estilo}
                  onChange={e => setEstilo(e.target.value)}
                  style={S.select}
                >
                  {ESTILOS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={S.label}>sColor (colour.called(...))</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {COLORES.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      ...S.toggle(color === c),
                      ...(color === c ? { outline: `2px solid ${c === 'white' ? '#cdd6f4' : c}` } : {}),
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
              <div>
                <label style={S.label}>bAjuste_Linea? (wrap)</label>
                <button style={S.toggle(ajusteLinea)} onClick={() => setAjusteLinea(v => !v)}>
                  {ajusteLinea ? 'true' : 'false'}
                </button>
              </div>
              <div>
                <label style={S.label}>bRecorte? (clip)</label>
                <button style={S.toggle(recorte)} onClick={() => setRecorte(v => !v)}>
                  {recorte ? 'true' : 'false'}
                </button>
              </div>
            </div>
          </div>

          {/* newFrom */}
          <div style={S.card}>
            <div style={S.title}>new_from(origen, _optional RsTexto)</div>
            <label style={S.label}>texto alternativo (vacío = copia el original)</label>
            <input
              value={textoAlt}
              onChange={e => setTextoAlt(e.target.value)}
              style={S.input}
            />
            <div style={{ marginTop: 8 }}>
              <Field label="copia.texto"       value={ctCopy.texto} />
              <Field label="copia.orientacion" value={ctCopy.orientacion} />
              <Field label="copia.alineacion"  value={ctCopy.alineacion} />
              <Field label="copia.tamanio"     value={ctCopy.tamanio} />
              <Field label="copia.estilo"      value={ctCopy.estilo} />
              <Field label="copy === original" value={String(ctCopy === ct)} />
            </div>
          </div>
        </div>

        {/* Panel derecho: estado + preview */}
        <div>
          {/* Preview visual */}
          <div style={S.card}>
            <div style={S.title}>Despliega() — preview CSS</div>
            <div style={S.preview(cssText)}>
              {texto || <span style={{ color: '#585b70' }}>(texto vacío)</span>}
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: '#585b70' }}>
              El área real la asigna <code>Despliega()</code> con{' '}
              <code>oCaja_texto.bounds &lt;&lt; oArea</code>
            </div>
          </div>

          {/* obtenElementoCaptura */}
          <div style={S.card}>
            <div style={S.title}>obtenElementoCaptura() — snapshot del objeto interno</div>
            <Field label="texto"       value={snapshot.texto} />
            <Field label="orientacion" value={snapshot.orientacion} />
            <Field
              label="alineacion"
              value={
                <>
                  <span style={S.v}>{snapshot.alineacion}</span>
                  {' '}
                  <span style={S.chip('#89dceb')}>↑ vertical: {ct.alineacionVertical}</span>
                  <span style={S.chip('#cba6f7')}>→ horizontal: {ct.alineacionHorizontal}</span>
                </>
              }
            />
            <Field label="tamanio"     value={tamanioErr ? <span style={S.vErr}>inválido</span> : snapshot.tamanio} err={tamanioErr} />
            <Field label="estilo"      value={snapshot.estilo} />
            <Field label="color"       value={<span style={{ color: snapshot.color }}>{snapshot.color}</span>} />
            <Field label="ajusteLinea" value={String(snapshot.ajusteLinea)} />
            <Field label="recorte"     value={String(snapshot.recorte)} />
          </div>

          {/* Validaciones */}
          <div style={S.card}>
            <div style={S.title}>validaciones Magik → TS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              {VALID_ALIGNMENTS.map(a => (
                <span key={a} style={S.chip(a === alineacion ? '#a6e3a1' : '#585b70')}>
                  {a}
                </span>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#585b70', marginTop: 4 }}>
              Verde = alineación activa · Setter lanza Error si el valor no está en la lista.
              tamanio = 0 o negativo → Error "Debe ser un número positivo."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
