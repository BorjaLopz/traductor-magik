// =============================================================================
// MIGRACIÓN: c_celda  →  CCelda.tsx
// Jerarquía Magik: c_celda (clase raíz, sin parent)
// Fuente: adiciones_layout/source/Sellos/Utilerias/c_celda.magik
// Autor: dsanchez  ·  04/11/2004    (texto/bordes: des_david 22/07/22)
// =============================================================================
//
// Modelo de "Celda" de una tabla de sello. Contiene posición (renglón/columna),
// un elemento principal (oElemento, típicamente c_texto_grafico) y dos
// colecciones de elementos: oElementos (visibles, incl. bordes_celda) y
// oElementos_captura (capa de captura/editable).
//
// Define API de bordes (izquierda/derecha/superior/inferior) y de texto, más
// helpers de serialización (init_with / new_from_serial / serial_slots /
// serial_structure).
//
// Dependencias del Magik (no migradas en showcase — se stubbean):
//   c_elementos          → CElementos        (Map<symbol, elemento>)
//   c_celdas_grafico     → CeldasGraficoBordes (objeto :bordes_celda)
//   c_texto_grafico      → TextoGrafico      ({ sTexto })
//   c_elemento_grafico   → ElementoGrafico   (union/base)
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

// Magik: símbolos de lado del borde
export type LadoBorde = 'izquierda' | 'derecha' | 'superior' | 'inferior';

// Stub: c_celdas_grafico cuando se almacena bajo :bordes_celda
export interface CeldasGraficoBordes {
  bBorde_izq: boolean;
  bBorde_der: boolean;
  bBorde_sup: boolean;
  bBorde_inf: boolean;
}

// Stub: c_texto_grafico — el Magik lo almacena en .oElemento y la celda
// expone .texto a través de su slot sTexto.
export interface TextoGrafico {
  kind: 'texto_grafico';
  sTexto: string;
}

// Magik: el slot oElemento puede albergar cualquier c_elemento_grafico.
// Aquí se modela como unión extensible. La celda solo conoce su sTexto
// (resto opaco para la migración mínima).
export type ElementoGrafico = TextoGrafico | { kind: 'otro'; sTexto?: string };

// Stub mínimo de c_elementos: una colección clave→elemento.
export class CElementos {
  private _items = new Map<string, ElementoGrafico | CeldasGraficoBordes>();

  // Magik: c_elementos.Agregar_Elemento(elem, sym)
  Agregar_Elemento(elem: ElementoGrafico | CeldasGraficoBordes, sym: string): void {
    this._items.set(sym, elem);
  }

  // Magik: .obten_elemento(:sym)
  obten_elemento<T = ElementoGrafico | CeldasGraficoBordes>(sym: string): T | undefined {
    return this._items.get(sym) as T | undefined;
  }

  // helper de inspección — no en Magik
  entries(): Array<[string, ElementoGrafico | CeldasGraficoBordes]> {
    return Array.from(this._items.entries());
  }
}

// Factory por defecto del subobjeto :bordes_celda (todos los bordes ON)
function newBordesCelda(): CeldasGraficoBordes {
  return { bBorde_izq: true, bBorde_der: true, bBorde_sup: true, bBorde_inf: true };
}

// Props para init_with / new_from_serial
export interface CCeldaProps {
  nRen?:               number;
  nCol?:               number;
  oElemento?:          ElementoGrafico;
  oElementos?:         CElementos;
  oElementos_captura?: CElementos;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_celda. Constructor toma (renglón, columna) y monta los
 * dos contenedores oElementos / oElementos_captura más el sub-objeto
 * :bordes_celda dentro del primero.
 */
export class CCelda {
  // ── Slots (todos :private :writable en Magik) ────────────────────────────
  private _nRen:               number | undefined        = undefined;
  private _nCol:               number | undefined        = undefined;
  private _oElemento:          ElementoGrafico | undefined = undefined;
  private _oElementos:         CElementos | undefined    = undefined;
  private _oElementos_captura: CElementos | undefined    = undefined;

  // ── Magik: new(RnRen, RnCol) ─────────────────────────────────────────────
  // En TS: ctor estándar. Crea oElementos / oElementos_captura y añade el
  // sub-objeto :bordes_celda (c_celdas_grafico) dentro del primero.
  constructor(rnRen: number, rnCol: number) {
    this._oElementos         = new CElementos();
    this._oElementos_captura = new CElementos();
    this._oElementos.Agregar_Elemento(newBordesCelda(), 'bordes_celda');
    this._nRen = rnRen;
    this._nCol = rnCol;
  }

  // ── Getter/setter del slot nRen ──────────────────────────────────────────
  get nRen(): number | undefined { return this._nRen; }
  set nRen(v: number) { this._nRen = v; }

  // ── Getter/setter del slot nCol ──────────────────────────────────────────
  get nCol(): number | undefined { return this._nCol; }
  set nCol(v: number) { this._nCol = v; }

  // ── oElemento — Magik: setter ignora _unset (sin warning) ────────────────
  get oElemento(): ElementoGrafico | undefined { return this._oElemento; }
  set oElemento(v: ElementoGrafico | undefined) {
    if (v !== undefined) this._oElemento = v;
  }

  // ── oElementos — Magik: setter lanza warning si _unset ───────────────────
  get oElementos(): CElementos | undefined { return this._oElementos; }
  set oElementos(v: CElementos | undefined) {
    if (v !== undefined) this._oElementos = v;
    else throw new Error('El objeto símbolo esta vacío.'); // Magik :warning
  }

  // ── oElementos_captura — idéntica regla ──────────────────────────────────
  get oElementos_captura(): CElementos | undefined { return this._oElementos_captura; }
  set oElementos_captura(v: CElementos | undefined) {
    if (v !== undefined) this._oElementos_captura = v;
    else throw new Error('El objeto símbolo esta vacío.');
  }

  // ── texto (getter) ───────────────────────────────────────────────────────
  // Magik: si .oElemento _is _unset → _unset; si no → .oElemento.sTexto
  get texto(): string | undefined {
    if (this._oElemento === undefined) return undefined;
    return this._oElemento.sTexto;
  }

  // ── texto << pVal (setter) ───────────────────────────────────────────────
  // Magik: si .oElemento _is _unset → crea c_texto_grafico.new(pVal);
  // en otro caso pone .oElemento.sTexto << pVal.
  set texto(pVal: string) {
    if (this._oElemento === undefined) {
      this._oElemento = { kind: 'texto_grafico', sTexto: pVal };
    } else {
      this._oElemento.sTexto = pVal;
    }
  }

  // ── bordes() — devuelve el sub-objeto :bordes_celda ──────────────────────
  bordes(): CeldasGraficoBordes | undefined;
  // ── bordes(lado) — true/false del borde indicado ────────────────────────
  bordes(lado: LadoBorde): boolean;
  bordes(lado?: LadoBorde): CeldasGraficoBordes | boolean | undefined {
    const bord = this._oElementos?.obten_elemento<CeldasGraficoBordes>('bordes_celda');
    if (lado === undefined) return bord;
    if (bord === undefined) return false;
    switch (lado) {
      case 'izquierda': return bord.bBorde_izq;
      case 'derecha':   return bord.bBorde_der;
      case 'superior':  return bord.bBorde_sup;
      case 'inferior':  return bord.bBorde_inf;
    }
  }

  // ── bordes(lado) << pVal — activa/desactiva el borde ────────────────────
  // Magik usa la misma signatura `bordes(p) << val`; en TS expongo
  // setBorde(lado, val) para tipar sin ambigüedad.
  setBorde(lado: LadoBorde, val: boolean): void {
    const bord = this._oElementos?.obten_elemento<CeldasGraficoBordes>('bordes_celda');
    if (!bord) return;
    switch (lado) {
      case 'izquierda': bord.bBorde_izq = val; break;
      case 'derecha':   bord.bBorde_der = val; break;
      case 'superior':  bord.bBorde_sup = val; break;
      case 'inferior':  bord.bBorde_inf = val; break;
    }
  }

  // ── init_with(props) ─────────────────────────────────────────────────────
  // Magik: itera props.fast_keys_and_elements() y llama
  // _self.perform_private(key.with_chevron, value) con try/does_not_understand.
  // En TS: aplica cada clave reconocida (silently ignora las demás).
  init_with(props: CCeldaProps): this {
    if (props.nRen               !== undefined) this._nRen               = props.nRen;
    if (props.nCol               !== undefined) this._nCol               = props.nCol;
    if (props.oElemento          !== undefined) this._oElemento          = props.oElemento;
    if (props.oElementos         !== undefined) this._oElementos         = props.oElementos;
    if (props.oElementos_captura !== undefined) this._oElementos_captura = props.oElementos_captura;
    return this;
  }

  // ── new_from_serial(keys, xml_values) [static] ───────────────────────────
  // Magik: empareja keys con xml_values y reconstruye vía init_with.
  static new_from_serial(
    keys: ReadonlyArray<keyof CCeldaProps>,
    xml_values: ReadonlyArray<CCeldaProps[keyof CCeldaProps]>,
  ): CCelda {
    const props: CCeldaProps = {};
    keys.forEach((k, i) => { (props as Record<string, unknown>)[k as string] = xml_values[i]; });
    // _clone.init_with(props) — clon en blanco sin pasar por ctor con (ren,col)
    const c = Object.create(CCelda.prototype) as CCelda;
    // inicializar slots por defecto antes de init_with
    (c as unknown as { _oElementos: CElementos })._oElementos = new CElementos();
    (c as unknown as { _oElementos_captura: CElementos })._oElementos_captura = new CElementos();
    return c.init_with(props);
  }

  // ── serial_slots() ───────────────────────────────────────────────────────
  // Magik: devuelve dos rope (keys, values) en multi-return.
  serial_slots(): { keys: ReadonlyArray<keyof CCeldaProps>; values: ReadonlyArray<unknown> } {
    const keys: (keyof CCeldaProps)[] =
      ['nRen', 'nCol', 'oElemento', 'oElementos', 'oElementos_captura'];
    const values = [this._nRen, this._nCol, this._oElemento, this._oElementos, this._oElementos_captura];
    return { keys, values };
  }

  // ── serial_structure ─────────────────────────────────────────────────────
  serial_structure(): 'slotted' { return 'slotted'; }
}

// =============================================================================
// Componente React — CCeldaUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 700,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '180px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  btn:   {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 60, marginLeft: 4,
  } as React.CSSProperties,
  textInput: {
    background: '#313244', color: '#a6e3a1', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 220, marginLeft: 4,
  } as React.CSSProperties,
};

const LADOS: LadoBorde[] = ['superior', 'derecha', 'inferior', 'izquierda'];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={styles.v}>{value}</span>
    </div>
  );
}

// Visual de celda con bordes vivos según el estado del modelo
function CeldaPreview({ celda }: { celda: CCelda }) {
  const b = celda.bordes() ?? { bBorde_izq: false, bBorde_der: false, bBorde_sup: false, bBorde_inf: false };
  const borderColor = '#cba6f7';
  return (
    <div style={{
      width: 220, height: 90,
      borderTop:    b.bBorde_sup ? `2px solid ${borderColor}` : '2px dashed #45475a',
      borderRight:  b.bBorde_der ? `2px solid ${borderColor}` : '2px dashed #45475a',
      borderBottom: b.bBorde_inf ? `2px solid ${borderColor}` : '2px dashed #45475a',
      borderLeft:   b.bBorde_izq ? `2px solid ${borderColor}` : '2px dashed #45475a',
      borderRadius: 4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#11111b', color: '#cdd6f4', fontFamily: 'monospace',
      fontSize: 13, position: 'relative',
    }}>
      <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 9, color: '#585b70' }}>
        [{celda.nRen ?? '-'},{celda.nCol ?? '-'}]
      </span>
      {celda.texto !== undefined ? celda.texto : <span style={{ color: '#585b70' }}>(sin texto)</span>}
    </div>
  );
}

export function CCeldaUI() {
  const [renIn, setRenIn] = useState(2);
  const [colIn, setColIn] = useState(3);
  const [texto, setTexto] = useState('DESCRIPCION');
  const [tick, setTick]   = useState(0);

  // Recrear celda cuando cambian renIn/colIn (simula new(ren, col))
  const celda = useMemo(() => {
    const c = new CCelda(renIn, colIn);
    c.texto = texto;
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renIn, colIn]);

  // Cambios en `texto` van por setter del modelo (re-render manual)
  const handleTextoChange = (v: string) => {
    setTexto(v);
    celda.texto = v;
    setTick(t => t + 1);
  };

  const toggleBorde = (lado: LadoBorde) => {
    celda.setBorde(lado, !celda.bordes(lado));
    setTick(t => t + 1);
  };

  // Demostración de serialización round-trip
  const { keys, values } = celda.serial_slots();
  const clonado = useMemo(() => {
    return CCelda.new_from_serial(
      keys as readonly (keyof CCeldaProps)[],
      values as ReadonlyArray<CCeldaProps[keyof CCeldaProps]>,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, renIn, colIn]);

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CCelda</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          utilería de tabla de sello · ren/col + oElemento + bordes
        </span>
      </div>

      {/* Constructor */}
      <div style={styles.card}>
        <div style={styles.title}>new(RnRen, RnCol)  ·  texto &lt;&lt; pVal</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <label>
            <span style={styles.k}>nRen:</span>
            <input
              type="number"
              value={renIn}
              onChange={e => setRenIn(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <label>
            <span style={styles.k}>nCol:</span>
            <input
              type="number"
              value={colIn}
              onChange={e => setColIn(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <label>
            <span style={styles.k}>texto:</span>
            <input
              value={texto}
              onChange={e => handleTextoChange(e.target.value)}
              style={styles.textInput}
            />
          </label>
        </div>
      </div>

      {/* Estado del modelo */}
      <div style={styles.card}>
        <div style={styles.title}>estado de la celda</div>
        <Field label="nRen"               value={celda.nRen ?? '—'} />
        <Field label="nCol"               value={celda.nCol ?? '—'} />
        <Field label="oElemento.kind"     value={celda.oElemento?.kind ?? '—'} />
        <Field label="texto (getter)"     value={celda.texto ?? '— (oElemento unset)'} />
        <Field label="oElementos.size"    value={celda.oElementos?.entries().length ?? 0} />
        <Field label="oElementos_captura.size" value={celda.oElementos_captura?.entries().length ?? 0} />
        <Field label="serial_structure()" value={celda.serial_structure()} />
      </div>

      {/* Bordes */}
      <div style={styles.card}>
        <div style={styles.title}>bordes(lado)  ·  setBorde(lado, val)</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <CeldaPreview celda={celda} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LADOS.map(l => {
              const on = celda.bordes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleBorde(l)}
                  style={{
                    ...styles.btn,
                    background: on ? '#a6e3a1' : '#313244',
                    color:      on ? '#1e1e2e' : '#bac2de',
                  }}
                >
                  {l.padEnd(10)} {on ? 'ON' : 'OFF'}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: '#585b70', maxWidth: 220 }}>
            Los flags <code>bBorde_izq / der / sup / inf</code> viven en el
            sub-objeto <code>:bordes_celda</code> dentro de
            <code> oElementos</code>. El UI los pinta como línea continua /
            punteada para visualizar el toggle.
          </div>
        </div>
      </div>

      {/* Serialización round-trip */}
      <div style={styles.card}>
        <div style={styles.title}>serial_slots() → new_from_serial(...) (round-trip)</div>
        <Field label="keys"   value={(keys as readonly string[]).join(', ')} />
        <Field
          label="values[nRen,nCol]"
          value={`${String(values[0])}, ${String(values[1])}`}
        />
        <Field
          label="clonado.nRen / nCol / texto"
          value={`${clonado.nRen} / ${clonado.nCol} / ${clonado.texto ?? '—'}`}
        />
        <Field label="clonado === celda" value={String(clonado === celda)} />
      </div>
    </div>
  );
}
