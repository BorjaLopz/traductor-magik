// =============================================================================
// MIGRACIÓN: c_sello_notas_adicionales_sct  →  CSelloNotasAdicionalesSct.tsx
// Jerarquía Magik: c_sello_notas_adicionales_sct  extends  :layout_element
// Autor original:  Viridiana Baltazar, 03-Enero-2006 (Sigma Tao / Traza: Planos)
// =============================================================================
// Diferencias clave respecto a CSelloNotaRestrictivaSct:
//   · Añade Tipo_Material (5 opciones) como tercer atributo
//   · Tabla: 50 mm (cuerpo) × 160 mm (ancho) — vs 40 mm × 145 mm en la Nota Restrictiva
//   · Texto: obligaciones de TELMEX + plano 'As Built' (en lugar del texto de permiso SCT)
//   · Dos variables de género: LsPrefijo (trabajo) + LsPrefijoMat (material)
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

// enum_tipo_material → 5 opciones (hash_table[1..5])
export type TipoMaterial =
  | 'POSTERIA'
  | 'FLEXODUCTO'
  | 'TUBO DE PVC'
  | 'TUBO NEGRO'
  | 'CANALETA';

// enum_tipo_trabajo → 7 opciones (mismas que c_sello_nota_restrictiva_sct)
export type TipoTrabajoNA =
  | 'CRUZAMIENTO AÉREO'
  | 'CRUZAMIENTO SUBTERRÁNEO'
  | 'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE'
  | 'INSTALACION LATERAL EN PUENTE'
  | 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO'
  | 'INSTALACION MARGINAL AÉREA'
  | 'INSTALACION MARGINAL SUBTERRÁNEA';

// enum_tipo_cable → 2 opciones
export type TipoCableNA = 'FIBRAS ÓPTICAS' | 'COBRE';

export interface CeldaNotas {
  texto: string;
  tamano: number;
  alineacion: 'top_left' | 'center';
}

// Tabla :tbl_notas_adic — 2 filas × 1 col
export interface TablaNotasAdicionales {
  nombre: string;       // 'tbl_notas_adic'
  alturaFila1: number;  // 10 mm
  alturaFila2: number;  // 50 mm  (10 mm más que la Nota Restrictiva)
  anchoCol:    number;  // 160 mm (15 mm más que la Nota Restrictiva)
  celda1_1: CeldaNotas; // título fijo
  celda2_1: CeldaNotas; // texto dinámico
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_sello_notas_adicionales_sct (extends :layout_element).
 * Genera el sello "NOTAS ADICIONALES SCT" para planos de permisos SCT.
 * El texto varía según Tipo_Trabajo, Tipo_Material y Tipo_Cable.
 * Dos variables de género:
 *   LsPrefijo    → concordancia con el tipo de trabajo (masculino/femenino)
 *   LsPrefijoMat → concordancia con el tipo de material (masculino/femenino)
 */
export class CSelloNotasAdicionalesSct {
  // ── Slots (def_slotted_exemplar) ──────────────────────────────────────────
  oTablas:         TablaNotasAdicionales | null = null;
  oCoordOrigen:    { x: number; y: number } = { x: 0, y: 0 };
  bTablas_creadas: boolean = false;
  oTipoMaterial:   Map<number, string> = new Map();
  oTipoTrabajo:    Map<number, string> = new Map();
  oTipoCable:      Map<number, string> = new Map();

  // Atributos de instancia (defined_attributes)
  Tipo_Material: TipoMaterial   | null = null;
  Tipo_Trabajo:  TipoTrabajoNA  | null = null;
  Tipo_Cable:    TipoCableNA    | null = null;

  // ── enum_tipo_material() ──────────────────────────────────────────────────
  // Magik: hash_table[1..5] — nuevo atributo no presente en CSelloNotaRestrictivaSct
  enumTipoMaterial(): Map<number, string> {
    this.oTipoMaterial = new Map([
      [1, 'POSTERIA'],
      [2, 'FLEXODUCTO'],
      [3, 'TUBO DE PVC'],
      [4, 'TUBO NEGRO'],
      [5, 'CANALETA'],
    ]);
    return this.oTipoMaterial;
  }

  // ── enum_tipo_trabajo() ───────────────────────────────────────────────────
  // Magik: hash_table[1..7] — mismos valores que CSelloNotaRestrictivaSct
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
    this._prvCreaCfgTabla(coord);
    this._prvLlenaCeldas();
    this.bTablas_creadas = true;
    return this;
  }

  // ── post_initialisation() ─────────────────────────────────────────────────
  postInitialisation(): void {
    this.inicializa({ x: 0, y: 0 });
  }

  // ── prvCrea_Cfg_Tabla(coord) ──────────────────────────────────────────────
  // Magik: crea_tabla(2, 1, :tbl_notas_adic)
  // Fila 1: 10 mm (título)   Fila 2: 50 mm (texto)   Col 1: 160 mm
  // DIFERENCIA: 50 mm vs 40 mm, 160 mm vs 145 mm en CSelloNotaRestrictivaSct
  private _prvCreaCfgTabla(coord: { x: number; y: number }): void {
    this.oTablas = {
      nombre     : 'tbl_notas_adic',
      alturaFila1: 10,
      alturaFila2: 50,  // 10 mm más que la Nota Restrictiva (40 mm)
      anchoCol   : 160, // 15 mm más que la Nota Restrictiva (145 mm)
      celda1_1: { texto: 'NOTAS ADICIONALES SCT', tamano: 50, alineacion: 'center' },
      celda2_1: { texto: '',                      tamano: 30, alineacion: 'top_left' },
    };
    this.oCoordOrigen = coord;
  }

  // ── prvLlena_Celdas() ─────────────────────────────────────────────────────
  // Magik: c_texto_grafico.new("NOTAS ADICIONALES SCT") tamaño 50
  //        c_texto_grafico.new("") tamaño 30, alineación top_left
  private _prvLlenaCeldas(): void {
    if (!this.oTablas) return;
    this.oTablas.celda1_1 = { texto: 'NOTAS ADICIONALES SCT', tamano: 50, alineacion: 'center' };
    this.oTablas.celda2_1 = { texto: '', tamano: 30, alineacion: 'top_left' };
    this.prvAsignaTexto();
  }

  // ── prvAsignaTexto() ──────────────────────────────────────────────────────
  // Magik: prvAsignaTexto() — construye texto legal con 2 variables de concordancia:
  //
  // LsPrefijo (" ESTA " si instalación lateral/marginal):
  //   INSTALACION LATERAL EN PUENTE / CON TUBO NEGRO
  //   INSTALACION MARGINAL AÉREA / SUBTERRÁNEA
  //
  // LsPrefijoMat (" INSTALADA LA " si material femenino):
  //   POSTERIA / CANALETA
  //   (los demás materiales → " INSTALADO EL " — masculino)
  prvAsignaTexto(): string {
    const trabajo  = (this.Tipo_Trabajo  ?? '').toUpperCase();
    const material = (this.Tipo_Material ?? '').toUpperCase();
    const cable    = (this.Tipo_Cable    ?? '').toUpperCase();

    // Valor por defecto masculino
    let LsPrefijo    = ' ESTE ';
    let LsPrefijoMat = ' INSTALADO EL ';

    // Condición 1: género femenino para el tipo de trabajo (instalaciones laterales/marginales)
    if (
      trabajo === 'INSTALACION LATERAL EN PUENTE' ||
      trabajo === 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO' ||
      trabajo === 'INSTALACION MARGINAL AÉREA' ||
      trabajo === 'INSTALACION MARGINAL SUBTERRÁNEA'
    ) {
      LsPrefijo = ' ESTA ';
    }

    // Condición 2: género femenino para materiales de nombre femenino en español
    if (material === 'POSTERIA' || material === 'CANALETA') {
      LsPrefijoMat = ' INSTALADA LA ';
    }

    // Armado del texto legal (character.newLine → \n)
    // Dos párrafos: obligación de programa de obra + obligación de plano 'As Built'
    const lines = [
      '',
      ` TELÉFONOS DE MÉXICO, S.A. DE C.V. DEBERÁ EXHIBIR EL PROGRAMA DE OBRA ANTES DE INICIAR`,
      ` LOS TRABAJOS PARA LA CONSTRUCCIÓN DE${LsPrefijo}${trabajo}`,
      ` CON CABLE DE ${cable} DENTRO DEL DERECHO DE VÍA, INCLUYENDO EL RETIRO`,
      ` DEL MATERIAL SOBRANTE Y PRODUCTO DE LA EXCAVACIÓN PARA${LsPrefijo}`,
      `${trabajo}.`,
      '',
      ` TELÉFONOS DE MÉXICO, S.A. DE C.V. SE HA COMPROMETIDO A ENTREGAR UNA VEZ TERMINADA`,
      ` LA OBRA EL PLANO 'AS BUILT' O PLANO DEFINITIVO, EN EL CUAL SE INDIQUE DONDE Y COMO`,
      ` FUE${LsPrefijoMat}${material} CON CABLE DE ${cable} DICHO PLANO DEBERA CONTENER`,
      ` LA SEÑALIZACIÓN QUE INDIQUE A QUÉ DISTANCIA SE ENCUENTRA EL CABLE DE ${cable}`,
      ` INSTALADO A PARTIR DEL LIMITE DEL DERECHO DE VIA O DEL EJE CENTRAL DE LA CARRETERA`,
    ];

    const texto = lines.join('\n');

    if (this.oTablas) {
      this.oTablas.celda2_1.texto = texto;
    }

    return texto;
  }

  // ── drawContentOn() ───────────────────────────────────────────────────────
  // Magik: draw_content_on(window) → prvAsignaTexto + bounds + Despliega
  drawContentOn(): TablaNotasAdicionales | null {
    this.prvAsignaTexto();
    return this.oTablas;
  }

  agregarLYM(_lym: unknown): void { /* stub */ }

  reset(): void {
    this.oTablas         = null;
    this.bTablas_creadas = false;
    this.Tipo_Material   = null;
    this.Tipo_Trabajo    = null;
    this.Tipo_Cable      = null;
  }
}

// =============================================================================
// Constantes de enumeración
// =============================================================================

export const TIPOS_MATERIAL: TipoMaterial[] = [
  'POSTERIA', 'FLEXODUCTO', 'TUBO DE PVC', 'TUBO NEGRO', 'CANALETA',
];

export const TIPOS_TRABAJO_NA: TipoTrabajoNA[] = [
  'CRUZAMIENTO AÉREO',
  'CRUZAMIENTO SUBTERRÁNEO',
  'CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE',
  'INSTALACION LATERAL EN PUENTE',
  'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO',
  'INSTALACION MARGINAL AÉREA',
  'INSTALACION MARGINAL SUBTERRÁNEA',
];

export const TIPOS_CABLE_NA: TipoCableNA[] = ['FIBRAS ÓPTICAS', 'COBRE'];

// Materiales con género femenino en español (condición LsPrefijoMat)
const MATERIALES_FEMENINOS = new Set<TipoMaterial>(['POSTERIA', 'CANALETA']);

// =============================================================================
// Componente React — CSelloNotasAdicionalesSctUI
// =============================================================================

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, maxWidth: 860,
  },
  header: { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
  label: { color: '#89dceb', marginRight: 6, display: 'inline-block', minWidth: 100 },
  select: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    marginRight: 12, marginBottom: 6,
  },
  row: { marginBottom: 8 },
  btn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace',
    fontSize: 12, marginRight: 8,
  },
  btnBlue: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#89b4fa', color: '#1e1e2e', fontFamily: 'monospace',
    fontSize: 12, marginRight: 8,
  },
  btnGray: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#313244', color: '#585b70', fontFamily: 'monospace', fontSize: 12,
  },
  msg: {
    background: '#313244', border: '1px solid #45475a', borderRadius: 4,
    padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11,
  },
  sello: {
    border: '2px solid #89b4fa', borderRadius: 4, marginTop: 14, overflow: 'hidden',
  },
  selloTitle: {
    background: '#313244', color: '#cba6f7', textAlign: 'center' as const,
    fontWeight: 'bold', fontSize: 13, padding: '6px 0', letterSpacing: 2,
    borderBottom: '1px solid #45475a',
  },
  selloBody: {
    background: '#181825', color: '#bac2de', padding: 12,
    whiteSpace: 'pre-wrap' as const, fontSize: 11, lineHeight: 1.6, minHeight: 180,
  },
  pill: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    fontSize: 10, marginLeft: 6, fontWeight: 'bold',
  },
  meta: { display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' as const },
  metaItem: { background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 },
};

export function CSelloNotasAdicionalesSctUI() {
  const [instancia]   = useState(() => new CSelloNotasAdicionalesSct());
  const [material, setMaterial] = useState<TipoMaterial>('FLEXODUCTO');
  const [trabajo,  setTrabajo]  = useState<TipoTrabajoNA>('CRUZAMIENTO AÉREO');
  const [cable,    setCable]    = useState<TipoCableNA>('FIBRAS ÓPTICAS');
  const [tabla,    setTabla]    = useState<TablaNotasAdicionales | null>(null);
  const [creado,   setCreado]   = useState(false);
  const [msg,      setMsg]      = useState('');

  function handleInicializa() {
    instancia.reset();
    instancia.Tipo_Material = material;
    instancia.Tipo_Trabajo  = trabajo;
    instancia.Tipo_Cable    = cable;
    instancia.inicializa({ x: 0, y: 0 });
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setCreado(true);
    setMsg('inicializa() ejecutado — bTablas_creadas: true');
  }

  function handleActualizaTexto() {
    if (!creado) return;
    instancia.Tipo_Material = material;
    instancia.Tipo_Trabajo  = trabajo;
    instancia.Tipo_Cable    = cable;
    instancia.prvAsignaTexto();
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setMsg('prvAsignaTexto() ejecutado — texto actualizado.');
  }

  const esFemenino    = MATERIALES_FEMENINOS.has(material);
  const esInstalacion = (
    trabajo === 'INSTALACION LATERAL EN PUENTE' ||
    trabajo === 'INSTALACION LATERAL EN PUENTE CON TUBO NEGRO' ||
    trabajo === 'INSTALACION MARGINAL AÉREA' ||
    trabajo === 'INSTALACION MARGINAL SUBTERRÁNEA'
  );

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CSelloNotasAdicionalesSct
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          layout_element → Notas Adicionales SCT (Planos GIS FO)
        </span>
      </div>

      {/* Selectores */}
      <div style={ui.row}>
        <label style={ui.label}>Tipo_Material:</label>
        <select value={material} onChange={e => setMaterial(e.target.value as TipoMaterial)} style={ui.select}>
          {TIPOS_MATERIAL.map(m => (
            <option key={m} value={m}>{m}{MATERIALES_FEMENINOS.has(m) ? ' ♀' : ' ♂'}</option>
          ))}
        </select>
        <span style={{
          ...ui.pill,
          background: esFemenino ? '#cba6f7' : '#89b4fa', color: '#1e1e2e',
        }}>
          {esFemenino ? 'INSTALADA LA' : 'INSTALADO EL'}
        </span>
      </div>

      <div style={ui.row}>
        <label style={ui.label}>Tipo_Trabajo:</label>
        <select value={trabajo} onChange={e => setTrabajo(e.target.value as TipoTrabajoNA)} style={ui.select}>
          {TIPOS_TRABAJO_NA.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{
          ...ui.pill,
          background: esInstalacion ? '#cba6f7' : '#89b4fa', color: '#1e1e2e',
        }}>
          {esInstalacion ? 'ESTA' : 'ESTE'}
        </span>
      </div>

      <div style={ui.row}>
        <label style={ui.label}>Tipo_Cable:</label>
        <select value={cable} onChange={e => setCable(e.target.value as TipoCableNA)} style={ui.select}>
          {TIPOS_CABLE_NA.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Botones */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleInicializa} style={ui.btn}>inicializa()</button>
        <button
          onClick={handleActualizaTexto}
          disabled={!creado}
          style={creado ? ui.btnBlue : ui.btnGray}
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

      {/* Pie con equivalencias */}
      {tabla && (
        <div style={{ marginTop: 10, fontSize: 10, color: '#585b70' }}>
          <span style={{ marginRight: 16 }}>
            celda(1,1) tamaño={tabla.celda1_1.tamano}pt  alin={tabla.celda1_1.alineacion}
          </span>
          <span>
            celda(2,1) tamaño={tabla.celda2_1.tamano}pt  alin={tabla.celda2_1.alineacion}
          </span>
        </div>
      )}
    </div>
  );
}
