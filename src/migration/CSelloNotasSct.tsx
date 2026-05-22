// =============================================================================
// MIGRACIÓN: c_sello_notas_sct  →  CSelloNotasSct.tsx
// Jerarquía Magik: c_sello_notas_sct  extends  :layout_element
// Autor original:  Viridiana Baltazar, 03-Enero-2006 (Sigma Tao / Traza: Planos)
// =============================================================================
// Diferencias clave respecto a CSelloNotaRestrictivaSct / CSelloNotasAdicionalesSct:
//   · 4 atributos: estado (texto libre, sin enum) + tipo_cable + procedimiento + instalacion
//   · Texto: 4 notas numeradas fijas — solo "estado" es dinámico (nota 3)
//   · tipo_cable, procedimiento e instalacion se leen en prvAsignaTexto pero
//     NO se insertan en el texto (slots reservados para subclases)
//   · Tabla: 55 mm × 155 mm (la más alta de los 3 sellos SCT)
//   · Sin variables de concordancia de género
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

// enum_tipo_cable → 2 opciones
export type TipoCableSCTN = 'FIBRAS ÓPTICAS' | 'COBRE';

// enum_tipo_proc → 2 opciones
export type TipoProcedimiento = 'HINCADO' | 'TUBO DIRECCIONAL';

// enum_tipo_inst → 2 opciones (encoding original: "SUBTERR NEA" → "SUBTERRÁNEA")
export type TipoInstalacion = 'SUBTERRÁNEA' | 'CANALIZADA';

export interface CeldaNotasSct {
  texto: string;
  tamano: number;
  alineacion: 'top_left' | 'center';
}

// Tabla :tbl_notas_grales — 2 filas × 1 col
export interface TablaNotasSct {
  nombre:      string;   // 'tbl_notas_grales'
  alturaFila1: number;   // 10 mm
  alturaFila2: number;   // 55 mm (la mayor de los 3 sellos SCT)
  anchoCol:    number;   // 155 mm
  celda1_1:    CeldaNotasSct; // título fijo
  celda2_1:    CeldaNotasSct; // 4 notas numeradas (solo nota 3 es dinámica)
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_sello_notas_sct (extends :layout_element).
 * Genera el sello "NOTAS SCT" para planos de permisos SCT.
 * Contiene 4 notas numeradas fijas; solo la nota 3 usa el atributo "estado"
 * (nombre del estado de México donde se realizan los trabajos).
 * Los atributos tipo_cable, procedimiento e instalacion se almacenan pero
 * no se insertan en el texto — reservados para uso por subclases.
 */
export class CSelloNotasSct {
  // ── Slots (def_slotted_exemplar) ──────────────────────────────────────────
  oTablas:         TablaNotasSct | null = null;
  oCoordOrigen:    { x: number; y: number } = { x: 0, y: 0 };
  bTablas_creadas: boolean = false;
  oTipoCable:      Map<number, string> = new Map();
  oTipoProc:       Map<number, string> = new Map();

  // Slots de valores de atributos (leídos en prvAsignaTexto)
  s_estado:        string = '';  // .uppercase en Magik
  s_tipo_cable:    string = '';
  s_procedimiento: string = '';
  s_instalacion:   string = '';

  // Atributos de instancia (defined_attributes)
  // "estado" es texto libre (sin enum_method) — el único que aparece en el texto
  estado:        string             = '';
  tipo_cable:    TipoCableSCTN      | null = null;
  procedimiento: TipoProcedimiento  | null = null;
  instalacion:   TipoInstalacion    | null = null;

  // ── enum_tipo_inst() ──────────────────────────────────────────────────────
  // Magik: hash_table[1..2] — local, no almacenado en slot
  enumTipoInst(): Map<number, string> {
    return new Map([
      [1, 'SUBTERRÁNEA'],
      [2, 'CANALIZADA'],
    ]);
  }

  // ── enum_tipo_cable() ─────────────────────────────────────────────────────
  enumTipoCable(): Map<number, string> {
    this.oTipoCable = new Map([
      [1, 'FIBRAS ÓPTICAS'],
      [2, 'COBRE'],
    ]);
    return this.oTipoCable;
  }

  // ── enum_tipo_proc() ──────────────────────────────────────────────────────
  enumTipoProc(): Map<number, string> {
    this.oTipoProc = new Map([
      [1, 'HINCADO'],
      [2, 'TUBO DIRECCIONAL'],
    ]);
    return this.oTipoProc;
  }

  // ── inicializa(coord?) ────────────────────────────────────────────────────
  // Magik: Inicializa(_optional RoCoord)
  // Flujo: c_tablas.new() → prvCrea_Cfg_Tbl_Notas_Grales → bounds → prvLlena_Celdas
  inicializa(coord: { x: number; y: number } = { x: 0, y: 0 }): this {
    this.oCoordOrigen = coord;
    this._prvCreaCfgTblNotasGrales(coord);
    this._prvLlenaCeldas();
    this.bTablas_creadas = true;
    return this;
  }

  // ── post_initialisation() ─────────────────────────────────────────────────
  postInitialisation(): void {
    this.inicializa({ x: 0, y: 0 });
  }

  // ── prvCrea_Cfg_Tbl_Notas_Grales(coord) ───────────────────────────────────
  // Magik: crea_tabla(2, 1, :tbl_notas_grales)
  // Fila 1: 10 mm   Fila 2: 55 mm   Col 1: 155 mm
  // DIFERENCIA: 55 mm es la altura más grande de los 3 sellos SCT
  //   (Restrictiva=40mm, Adicionales=50mm, NotasSCT=55mm)
  private _prvCreaCfgTblNotasGrales(coord: { x: number; y: number }): void {
    this.oTablas = {
      nombre     : 'tbl_notas_grales',
      alturaFila1: 10,
      alturaFila2: 55,
      anchoCol   : 155,
      celda1_1: { texto: 'NOTAS SCT', tamano: 50, alineacion: 'center' },
      celda2_1: { texto: '',          tamano: 30, alineacion: 'top_left' },
    };
    this.oCoordOrigen = coord;
  }

  // ── prvLlena_Celdas() ─────────────────────────────────────────────────────
  // Magik: c_texto_grafico.new("NOTAS SCT") tamaño 50
  //        c_texto_grafico.new("") tamaño 30, top_left
  private _prvLlenaCeldas(): void {
    if (!this.oTablas) return;
    this.oTablas.celda1_1 = { texto: 'NOTAS SCT', tamano: 50, alineacion: 'center' };
    this.oTablas.celda2_1 = { texto: '', tamano: 30, alineacion: 'top_left' };
    this.prvAsignaTexto();
  }

  // ── prvAsignaTexto() ──────────────────────────────────────────────────────
  // Magik: prvAsignaTexto()
  // Lee los 4 atributos del elemento → almacena en slots s_*
  // Solo s_estado (uppercase) aparece en el texto (nota 3).
  // s_tipo_cable, s_procedimiento, s_instalacion: almacenados pero no usados
  // en el texto de esta clase base (reservados para subclases).
  //
  // Texto: 4 notas numeradas legales para permisos SCT.
  // Nota 3 es la única dinámica: incluye el nombre del estado.
  prvAsignaTexto(): string {
    // Equivale a: _self.attributes[:estado].value.write_string.uppercase
    this.s_estado        = (this.estado       ?? '').toUpperCase();
    this.s_tipo_cable    = (this.tipo_cable    ?? '').toString();
    this.s_procedimiento = (this.procedimiento ?? '').toString();
    this.s_instalacion   = (this.instalacion   ?? '').toString();

    // 4 notas numeradas (character.newLine → \n)
    const lines = [
      '',
      ` 1.- TODAS LAS DIMENSIONES ESTÁN EN METROS, EXCEPTO LAS INDICADAS EN OTRA UNIDAD.`,
      '',
      ` 2.- PARA CUALQUIER MODIFICACIÓN A ESTE PROYECTO, TELÉFONOS DE MÉXICO, S.A. DE C.V. DEBERÁ`,
      ` COMUNICAR Y SOLICITAR A ESTA SECRETARIA LA REVISIÓN Y DICTAMEN CORRESPONDIENTE.`,
      '',
      // Nota 3: única nota dinámica — inserta el nombre del estado
      ` 3.- TELÉFONOS DE MÉXICO, S.A. DE C.V. INFORMARA POR ESCRITO A LA RESIDENCIA GENERAL DE`,
      ` CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.s_estado} LA FECHA DE`,
      ` INICIACIÓN DE LOS TRABAJOS CON DIEZ DÍAS DE ANTICIPACIÓN, PREVIA SUPERVISIÓN DE LA ZONA.`,
      '',
      ` 4.- LOS TRABAJOS DEBERÁN INICIARSE A MAS TARDAR 30 DÍAS NATURALES DESPUÉS DE OTORGADO EL`,
      ` PERMISO POR LA SECRETARIA Y CONCLUIRSE EN UN PLAZO NO MAYOR DE 180 DÍAS NATURALES A`,
      ` PARTIR DE SU INICIO.`,
      '',
    ];

    const texto = lines.join('\n');

    if (this.oTablas) {
      this.oTablas.celda2_1.texto = texto;
    }

    return texto;
  }

  // ── drawContentOn() ───────────────────────────────────────────────────────
  drawContentOn(): TablaNotasSct | null {
    this.prvAsignaTexto();
    return this.oTablas;
  }

  agregarLYM(_lym: unknown): void { /* stub */ }

  reset(): void {
    this.oTablas         = null;
    this.bTablas_creadas = false;
    this.estado          = '';
    this.tipo_cable      = null;
    this.procedimiento   = null;
    this.instalacion     = null;
    this.s_estado        = '';
    this.s_tipo_cable    = '';
    this.s_procedimiento = '';
    this.s_instalacion   = '';
  }
}

// =============================================================================
// Constantes de enumeración
// =============================================================================

export const TIPOS_CABLE_SCTNS: TipoCableSCTN[]        = ['FIBRAS ÓPTICAS', 'COBRE'];
export const TIPOS_PROCEDIMIENTO: TipoProcedimiento[]  = ['HINCADO', 'TUBO DIRECCIONAL'];
export const TIPOS_INSTALACION: TipoInstalacion[]      = ['SUBTERRÁNEA', 'CANALIZADA'];

// Estados de México (valor del atributo libre "estado")
const ESTADOS_MEXICO = [
  'AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE',
  'CHIAPAS', 'CHIHUAHUA', 'CIUDAD DE MÉXICO', 'COAHUILA', 'COLIMA',
  'DURANGO', 'GUANAJUATO', 'GUERRERO', 'HIDALGO', 'JALISCO',
  'ESTADO DE MÉXICO', 'MICHOACÁN', 'MORELOS', 'NAYARIT', 'NUEVO LEÓN',
  'OAXACA', 'PUEBLA', 'QUERÉTARO', 'QUINTANA ROO', 'SAN LUIS POTOSÍ',
  'SINALOA', 'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA',
  'VERACRUZ', 'YUCATÁN', 'ZACATECAS',
];

// =============================================================================
// Componente React — CSelloNotasSctUI
// =============================================================================

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, maxWidth: 860,
  },
  header: { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
  row: { marginBottom: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: 6 },
  label: { color: '#89dceb', minWidth: 110, display: 'inline-block' },
  select: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
  },
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 220,
  },
  note: {
    background: '#313244', borderRadius: 4, padding: '2px 8px',
    fontSize: 10, color: '#585b70', marginLeft: 4,
  },
  btn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  },
  btnBlue: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#89b4fa', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
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
    whiteSpace: 'pre-wrap' as const, fontSize: 11, lineHeight: 1.6, minHeight: 200,
  },
  meta: { display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' as const },
  metaItem: { background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 },
  pill: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    fontSize: 10, fontWeight: 'bold', marginLeft: 4,
  },
};

// Resalta el nombre del estado en el texto (nota 3)
function TextoConEstadoResaltado({ texto, estado }: { texto: string; estado: string }) {
  if (!estado || !texto.includes(estado)) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{texto}</span>;
  }
  const parts = texto.split(estado);
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span style={{ background: '#f9e2af', color: '#1e1e2e', borderRadius: 2, padding: '0 2px' }}>
              {estado}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

export function CSelloNotasSctUI() {
  const [instancia]  = useState(() => new CSelloNotasSct());
  const [estado,     setEstado]     = useState('');
  const [estadoInput,setEstadoInput]= useState('');
  const [tipoCable,  setTipoCable]  = useState<TipoCableSCTN>('FIBRAS ÓPTICAS');
  const [proc,       setProc]       = useState<TipoProcedimiento>('HINCADO');
  const [inst,       setInst]       = useState<TipoInstalacion>('SUBTERRÁNEA');
  const [tabla,      setTabla]      = useState<TablaNotasSct | null>(null);
  const [creado,     setCreado]     = useState(false);
  const [msg,        setMsg]        = useState('');

  function handleInicializa() {
    instancia.reset();
    instancia.estado        = estado || estadoInput;
    instancia.tipo_cable    = tipoCable;
    instancia.procedimiento = proc;
    instancia.instalacion   = inst;
    instancia.inicializa({ x: 0, y: 0 });
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setCreado(true);
    setMsg(`inicializa() ejecutado — estado: "${instancia.s_estado}" — bTablas_creadas: true`);
  }

  function handleActualizaTexto() {
    if (!creado) return;
    instancia.estado        = estado || estadoInput;
    instancia.tipo_cable    = tipoCable;
    instancia.procedimiento = proc;
    instancia.instalacion   = inst;
    instancia.prvAsignaTexto();
    setTabla(JSON.parse(JSON.stringify(instancia.oTablas)));
    setMsg(`prvAsignaTexto() — s_estado: "${instancia.s_estado}"`);
  }

  const estadoFinal = (estado || estadoInput).toUpperCase();

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CSelloNotasSct
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          layout_element → Notas SCT (Planos GIS FO) — 4 notas numeradas
        </span>
      </div>

      {/* Atributo "estado" — texto libre (sin enum) */}
      <div style={ui.row}>
        <span style={ui.label}>estado:</span>
        <select
          value={estado}
          onChange={e => { setEstado(e.target.value); setEstadoInput(''); }}
          style={ui.select}
        >
          <option value="">-- seleccionar estado --</option>
          {ESTADOS_MEXICO.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span style={{ color: '#585b70', fontSize: 11 }}>o escribir:</span>
        <input
          type="text"
          value={estadoInput}
          onChange={e => { setEstadoInput(e.target.value.toUpperCase()); setEstado(''); }}
          placeholder="NOMBRE DEL ESTADO"
          style={ui.input}
        />
        <span style={ui.note}>texto libre — sin enum</span>
      </div>

      {/* tipo_cable */}
      <div style={ui.row}>
        <span style={ui.label}>tipo_cable:</span>
        <select value={tipoCable} onChange={e => setTipoCable(e.target.value as TipoCableSCTN)} style={ui.select}>
          {TIPOS_CABLE_SCTNS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ ...ui.pill, background: '#45475a', color: '#585b70' }}>
          no aparece en texto
        </span>
      </div>

      {/* procedimiento */}
      <div style={ui.row}>
        <span style={ui.label}>procedimiento:</span>
        <select value={proc} onChange={e => setProc(e.target.value as TipoProcedimiento)} style={ui.select}>
          {TIPOS_PROCEDIMIENTO.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span style={{ ...ui.pill, background: '#45475a', color: '#585b70' }}>
          no aparece en texto
        </span>
      </div>

      {/* instalacion */}
      <div style={ui.row}>
        <span style={ui.label}>instalacion:</span>
        <select value={inst} onChange={e => setInst(e.target.value as TipoInstalacion)} style={ui.select}>
          {TIPOS_INSTALACION.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <span style={{ ...ui.pill, background: '#45475a', color: '#585b70' }}>
          no aparece en texto
        </span>
      </div>

      {/* Botones */}
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        <button onClick={handleInicializa} style={ui.btn}>inicializa()</button>
        <button onClick={handleActualizaTexto} disabled={!creado}
          style={creado ? ui.btnBlue : ui.btnGray}>
          prvAsignaTexto()
        </button>
      </div>

      {/* Mensaje */}
      {msg && <div style={ui.msg}>{msg}</div>}

      {/* Metadatos */}
      {tabla && (
        <div style={ui.meta}>
          {[
            { k: 'nombre',   v: tabla.nombre },
            { k: 'alturaF1', v: `${tabla.alturaFila1} mm` },
            { k: 'alturaF2', v: `${tabla.alturaFila2} mm` },
            { k: 'anchoCol', v: `${tabla.anchoCol} mm` },
            { k: 'bTablas',  v: String(creado) },
            { k: 's_estado', v: instancia.s_estado || '(vacío)' },
          ].map(item => (
            <div key={item.k} style={ui.metaItem}>
              <span style={{ color: '#585b70' }}>{item.k}: </span>
              <span style={{ color: item.k === 's_estado' ? '#f9e2af' : '#a6e3a1' }}>
                {item.v}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sello visual */}
      {!tabla && (
        <div style={{ color: '#585b70', textAlign: 'center', padding: 32, fontSize: 12 }}>
          Pulsa inicializa() para generar las notas.
        </div>
      )}

      {tabla && (
        <div style={ui.sello}>
          <div style={ui.selloTitle}>{tabla.celda1_1.texto}</div>
          <div style={ui.selloBody}>
            <TextoConEstadoResaltado
              texto={tabla.celda2_1.texto}
              estado={estadoFinal}
            />
          </div>
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
