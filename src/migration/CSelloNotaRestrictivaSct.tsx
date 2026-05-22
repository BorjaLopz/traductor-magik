// =============================================================================
// MIGRACIÓN: c_sello_nota_restrictiva_sct  →  CSelloNotaRestrictivaSct.tsx
// Jerarquía Magik: c_sello_nota_restrictiva_sct  extends  :layout_element
// Autor original:  Viridiana Baltazar, 03-Enero-2006 (Sigma Tao / Traza: Planos)
// =============================================================================
// Nota: el código Magik original tiene problemas de codificación en tildes y
// caracteres especiales (p.ej. "A REO" → "AÉREO"). Se reconstruyen aquí con
// los textos correctos en UTF-8.
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

// enum_tipo_trabajo → 7 opciones (hash_table[1..7])
export type TipoTrabajo =
  | 'CRUZAMIENTO AÉREO'
  | 'CRUZAMIENTO SUBTERRÁNEO'
  | 'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE'
  | 'INSTALACION LATERAL EN PUENTE'
  | 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO'
  | 'INSTALACION MARGINAL AÉREA'
  | 'INSTALACION MARGINAL SUBTERRÁNEA';

// enum_tipo_cable → 2 opciones (hash_table[1..2])
export type TipoCable = 'FIBRAS ÓPTICAS' | 'COBRE';

export interface CeldaNota {
  texto: string;
  tamano: number;          // nTamanio (puntos tipográficos mock)
  alineacion: 'top_left' | 'center';
}

export interface TablaNota {
  nombre: string;          // :tbl_nota_rest
  alturaFila1: number;     // oRenglones.elemento(1).nLongitud = 10 mm
  alturaFila2: number;     // oRenglones.elemento(2).nLongitud = 40 mm
  anchoCol: number;        // oColumnas.elemento(1).nLongitud  = 145 mm
  celda1_1: CeldaNota;     // fila 1: título fijo
  celda2_1: CeldaNota;     // fila 2: texto dinámico (prvAsignaTexto)
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_sello_nota_restrictiva_sct (extends :layout_element).
 * Genera el sello "NOTA RESTRICTIVA SCT" para planos de permisos de la SCT.
 * La nota varía según el tipo de trabajo y tipo de cable seleccionados.
 */
export class CSelloNotaRestrictivaSct {
  // ── Slots (def_slotted_exemplar) ──────────────────────────────────────────
  oTablas:         TablaNota | null = null;
  oCoordOrigen:    { x: number; y: number } = { x: 0, y: 0 };
  bTablas_creadas: boolean = false;
  oTipoMaterial:   Map<number, string> = new Map(); // reservado
  oTipoTrabajo:    Map<number, string> = new Map();
  oTipoCable:      Map<number, string> = new Map();

  // Atributos de instancia (defined_attributes → Tipo_Trabajo, Tipo_Cable)
  Tipo_Trabajo: TipoTrabajo | null = null;
  Tipo_Cable:   TipoCable   | null = null;

  // ── enum_tipo_trabajo() ───────────────────────────────────────────────────
  // Magik: hash_table[1..7] con los tipos de trabajo permitidos.
  enumTipoTrabajo(): Map<number, string> {
    this.oTipoTrabajo = new Map([
      [1, 'CRUZAMIENTO AÉREO'],
      [2, 'CRUZAMIENTO SUBTERRÁNEO'],
      [3, 'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE'],
      [4, 'INSTALACION LATERAL EN PUENTE'],
      [5, 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO'],
      [6, 'INSTALACION MARGINAL AÉREA'],
      [7, 'INSTALACION MARGINAL SUBTERRÁNEA'],
    ]);
    return this.oTipoTrabajo;
  }

  // ── enum_tipo_cable() ─────────────────────────────────────────────────────
  // Magik: hash_table[1..2]
  enumTipoCable(): Map<number, string> {
    this.oTipoCable = new Map([
      [1, 'FIBRAS ÓPTICAS'],
      [2, 'COBRE'],
    ]);
    return this.oTipoCable;
  }

  // ── inicializa(coord?) ────────────────────────────────────────────────────
  // Magik: Inicializa(_optional RoCoord)
  // Flujo: oTablas = c_tablas.new() → prvCrea_Cfg_Tabla → bounds → prvLlena_Celdas
  inicializa(coord: { x: number; y: number } = { x: 0, y: 0 }): this {
    this.oCoordOrigen = coord;
    // c_tablas.new(_self) → objeto contenedor de tablas
    this._prvCreaCfgTabla(coord);
    // prvLlena_Celdas + prvAsignaTexto
    this._prvLlenaCeldas();
    this.bTablas_creadas = true;
    return this;
  }

  // ── post_initialisation() → inicializa(0,0) ───────────────────────────────
  postInitialisation(): void {
    this.inicializa({ x: 0, y: 0 });
  }

  // ── prvCrea_Cfg_Tabla(coord) ──────────────────────────────────────────────
  // Magik: crea_tabla(2, 1, :tbl_nota_rest) con dimensiones en mm.
  // Fila 1: 10 mm (título)  Fila 2: 40 mm (texto)  Col 1: 145 mm
  private _prvCreaCfgTabla(coord: { x: number; y: number }): void {
    this.oTablas = {
      nombre    : 'tbl_nota_rest',
      alturaFila1: 10,
      alturaFila2: 40,
      anchoCol   : 145,
      celda1_1: { texto: 'NOTA RESTRICTIVA SCT', tamano: 50, alineacion: 'center' },
      celda2_1: { texto: '',                     tamano: 30, alineacion: 'top_left' },
    };
    // coord registrada (equivale a LoTblTitulo.oCoordenada_Origen << RoCoord)
    this.oCoordOrigen = coord;
  }

  // ── prvLlena_Celdas() ─────────────────────────────────────────────────────
  // Magik: crea c_texto_grafico para título (tamaño 50) y descripción (tamaño 30,
  // alineación top_left), luego llama prvAsignaTexto().
  private _prvLlenaCeldas(): void {
    if (!this.oTablas) return;
    // celda(1,1) → título fijo — c_texto_grafico.new("NOTA RESTRICTIVA SCT")
    this.oTablas.celda1_1 = { texto: 'NOTA RESTRICTIVA SCT', tamano: 50, alineacion: 'center' };
    // celda(2,1) → descripción dinámica — se rellena en prvAsignaTexto
    this.oTablas.celda2_1 = { texto: '', tamano: 30, alineacion: 'top_left' };
    this.prvAsignaTexto();
  }

  // ── prvAsignaTexto() ──────────────────────────────────────────────────────
  // Magik: construye el texto legal dinámico según Tipo_Trabajo y Tipo_Cable.
  // Tres variables de texto varían según el tipo de trabajo:
  //   LsEstructura : "DE LA CARRETERA" | "DEL PUENTE"
  //   LsPrefijo    : " ESTE " | " ESTA "
  //   LsTrabajo    : "DE LA INSTALACIÓN" | "DEL CRUZAMIENTO"
  prvAsignaTexto(): string {
    const trabajo = (this.Tipo_Trabajo ?? '').toUpperCase();
    const cable   = (this.Tipo_Cable   ?? '').toUpperCase();

    // Valores por defecto
    let LsEstructura = 'DE LA CARRETERA';
    let LsTrabajo    = 'DE LA INSTALACIÓN';
    let LsPrefijo    = ' ESTE ';

    // Condición 1: estructura → "DEL PUENTE" para cruzamientos/instalaciones en puente
    if (
      trabajo === 'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE' ||
      trabajo === 'INSTALACION LATERAL EN PUENTE' ||
      trabajo === 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO'
    ) {
      LsEstructura = 'DEL PUENTE';
    }

    // Condición 2: prefijo femenino "ESTA" para instalaciones laterales/marginales
    if (
      trabajo === 'INSTALACION LATERAL EN PUENTE' ||
      trabajo === 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO' ||
      trabajo === 'INSTALACION MARGINAL AÉREA' ||
      trabajo === 'INSTALACION MARGINAL SUBTERRÁNEA'
    ) {
      LsPrefijo = ' ESTA ';
    }

    // Condición 3: "DEL CRUZAMIENTO" para todos los tipos de cruzamiento
    if (
      trabajo === 'CRUZAMIENTO AÉREO' ||
      trabajo === 'CRUZAMIENTO SUBTERRÁNEO' ||
      trabajo === 'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE'
    ) {
      LsTrabajo = 'DEL CRUZAMIENTO';
    }

    // Armado del texto (character.newLine → \n)
    // Se respetan los saltos y sangría del original para fidelidad tipográfica
    const lines = [
      '',
      `${LsPrefijo}${trabajo}, CON CABLE DE ${cable}`,
      ` SERA CON CARÁCTER 'PROVISIONAL', YA QUE LA SCT EN UN FUTURO PUEDE EFECTUAR DIVER-`,
      ` SAS OBRAS DENTRO DEL DERECHO DE VÍA TALES COMO REPARACIÓN, RECONSTRUCCIÓN,`,
      ` AMPLIACIÓN, MODERNIZACIÓN, ETC. ${LsEstructura} Y EL RETIRO O REUBICACIÓN`,
      ` ${LsTrabajo} DEBERÁ EFECTUARSE EN UN PLAZO NO MAYOR DE 45 DÍAS NATURALES,`,
      ` A PARTIR DE QUE EL PERMISIONARIO RECIBA LA NOTIFICACIÓN DE LA SECRETARIA Y LOS`,
      ` GASTOS QUE SE ORIGINEN SERÁN POR CUENTA Y RIESGO DE TELÉFONOS DE MÉXICO, S.A.`,
      ` DE C.V.`,
    ];

    const texto = lines.join('\n');

    // Asigna a celda(2,1).oElemento.sTexto
    if (this.oTablas) {
      this.oTablas.celda2_1.texto = texto;
    }

    return texto;
  }

  // ── agregar_LYM(lym) ──────────────────────────────────────────────────────
  // Magik: Agrega_LYM(RoLym) → delega a oTablas
  agregarLYM(_lym: unknown): void {
    // stub: en producción delegaría al motor de layout
  }

  // ── drawContentOn() ───────────────────────────────────────────────────────
  // Magik: draw_content_on(window) → prvAsignaTexto + bounds + Despliega
  drawContentOn(): TablaNota | null {
    this.prvAsignaTexto();
    return this.oTablas;
  }

  // ── reset() ───────────────────────────────────────────────────────────────
  reset(): void {
    this.oTablas         = null;
    this.bTablas_creadas = false;
    this.Tipo_Trabajo    = null;
    this.Tipo_Cable      = null;
  }
}

// =============================================================================
// Constantes de enumeración (para el componente React)
// =============================================================================

export const TIPOS_TRABAJO: TipoTrabajo[] = [
  'CRUZAMIENTO AÉREO',
  'CRUZAMIENTO SUBTERRÁNEO',
  'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE',
  'INSTALACION LATERAL EN PUENTE',
  'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO',
  'INSTALACION MARGINAL AÉREA',
  'INSTALACION MARGINAL SUBTERRÁNEA',
];

export const TIPOS_CABLE: TipoCable[] = ['FIBRAS ÓPTICAS', 'COBRE'];

// =============================================================================
// Componente React — CSelloNotaRestrictivaSctUI
// =============================================================================

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily : 'monospace',
    fontSize   : 12,
    background : '#1e1e2e',
    color      : '#cdd6f4',
    padding    : 16,
    borderRadius: 8,
    maxWidth   : 800,
  },
  header: {
    borderBottom: '1px solid #45475a',
    paddingBottom: 8,
    marginBottom: 12,
  },
  label: { color: '#89dceb', marginRight: 6 },
  select: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    marginRight: 12,
  },
  btn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12,
    marginRight: 8,
  },
  btnGray: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#313244', color: '#585b70', fontFamily: 'monospace', fontSize: 12,
  },
  sello: {
    border: '2px solid #89b4fa',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  selloTitle: {
    background: '#313244',
    color: '#cba6f7',
    textAlign: 'center' as const,
    fontWeight: 'bold',
    fontSize: 13,
    padding: '6px 0',
    letterSpacing: 2,
    borderBottom: '1px solid #45475a',
  },
  selloBody: {
    background: '#181825',
    color: '#bac2de',
    padding: 12,
    whiteSpace: 'pre-wrap' as const,
    fontSize: 11,
    lineHeight: 1.6,
    minHeight: 140,
  },
  pill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 10,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  msg: {
    background: '#313244', border: '1px solid #45475a', borderRadius: 4,
    padding: '4px 10px', marginTop: 10, color: '#f9e2af', fontSize: 11,
  },
  meta: {
    display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' as const,
  },
  metaItem: {
    background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11,
  },
};

export function CSelloNotaRestrictivaSctUI() {
  const [instancia]    = useState(() => new CSelloNotaRestrictivaSct());
  const [trabajo, setTrabajo] = useState<TipoTrabajo>('CRUZAMIENTO AÉREO');
  const [cable,   setCable]   = useState<TipoCable>('FIBRAS ÓPTICAS');
  const [tabla,   setTabla]   = useState<TablaNota | null>(null);
  const [creado,  setCreado]  = useState(false);
  const [msg,     setMsg]     = useState('');

  function handleInicializa() {
    instancia.reset();
    instancia.Tipo_Trabajo = trabajo;
    instancia.Tipo_Cable   = cable;
    instancia.inicializa({ x: 0, y: 0 });
    // clona la tabla para triggear re-render
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setCreado(true);
    setMsg(`inicializa() ejecutado — bTablas_creadas: true`);
  }

  function handleActualizaTexto() {
    if (!creado) return;
    instancia.Tipo_Trabajo = trabajo;
    instancia.Tipo_Cable   = cable;
    instancia.prvAsignaTexto();
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setMsg('prvAsignaTexto() ejecutado — texto actualizado.');
  }

  // Detecta si la nota usa "DEL PUENTE" o "DEL CRUZAMIENTO" para badge
  const esPuente = tabla && (
    tabla.celda2_1.texto.includes('DEL PUENTE')
  );
  const esCruce = tabla && (
    tabla.celda2_1.texto.includes('DEL CRUZAMIENTO')
  );

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CSelloNotaRestrictivaSct
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          layout_element → Nota Restrictiva SCT (Planos GIS FO)
        </span>
      </div>

      {/* Controles */}
      <div style={{ marginBottom: 10 }}>
        <label style={ui.label}>Tipo_Trabajo:</label>
        <select
          value={trabajo}
          onChange={e => setTrabajo(e.target.value as TipoTrabajo)}
          style={ui.select}
        >
          {TIPOS_TRABAJO.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={ui.label}>Tipo_Cable:</label>
        <select
          value={cable}
          onChange={e => setCable(e.target.value as TipoCable)}
          style={ui.select}
        >
          {TIPOS_CABLE.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <button onClick={handleInicializa} style={ui.btn}>inicializa()</button>
        <button
          onClick={handleActualizaTexto}
          disabled={!creado}
          style={creado ? { ...ui.btn, background: '#89b4fa' } : ui.btnGray}
        >
          prvAsignaTexto()
        </button>
      </div>

      {/* Mensaje */}
      {msg && <div style={ui.msg}>{msg}</div>}

      {/* Metadatos de la tabla */}
      {tabla && (
        <div style={ui.meta}>
          {[
            { k: 'nombre',    v: tabla.nombre },
            { k: 'alturaF1',  v: `${tabla.alturaFila1} mm` },
            { k: 'alturaF2',  v: `${tabla.alturaFila2} mm` },
            { k: 'anchoCol',  v: `${tabla.anchoCol} mm` },
            { k: 'bTablas',   v: String(creado) },
          ].map(item => (
            <div key={item.k} style={ui.metaItem}>
              <span style={{ color: '#585b70' }}>{item.k}: </span>
              <span style={{ color: '#a6e3a1' }}>{item.v}</span>
            </div>
          ))}
          {esPuente && (
            <span style={{ ...ui.pill, background: '#fab387', color: '#1e1e2e' }}>
              PUENTE
            </span>
          )}
          {esCruce && (
            <span style={{ ...ui.pill, background: '#89b4fa', color: '#1e1e2e' }}>
              CRUZAMIENTO
            </span>
          )}
        </div>
      )}

      {/* Sello visual */}
      {!tabla && (
        <div style={{ color: '#585b70', textAlign: 'center', padding: 32, fontSize: 12 }}>
          Pulsa inicializa() para generar la nota.
        </div>
      )}

      {tabla && (
        <div style={ui.sello}>
          {/* celda(1,1) → título */}
          <div style={ui.selloTitle}>{tabla.celda1_1.texto}</div>
          {/* celda(2,1) → texto dinámico */}
          <div style={ui.selloBody}>{tabla.celda2_1.texto}</div>
        </div>
      )}

      {/* Tabla de equivalencias */}
      {tabla && (
        <div style={{ marginTop: 14, fontSize: 10, color: '#585b70' }}>
          <span style={{ marginRight: 16 }}>celda(1,1) tamaño={tabla.celda1_1.tamano}pt  alin={tabla.celda1_1.alineacion}</span>
          <span>celda(2,1) tamaño={tabla.celda2_1.tamano}pt  alin={tabla.celda2_1.alineacion}</span>
        </div>
      )}
    </div>
  );
}
