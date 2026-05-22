/**
 * Migración: c_sello_aumentos_secundarios.magik
 * Ten Sails Consulting — Elena Sainero — Noviembre 2005
 * Clase Magik: c_sello_aumentos_secundarios — extiende layout_element
 *
 * Genera un sello (layout_element) con los datos de aumento de red
 * secundaria en cada distrito. Muestra una tabla de 2 ó 3 filas × 5
 * columnas: DTO. | CONECT. | AUMENTO | L. PLAZO | TOTAL.
 * Si el distrito tiene red directa, añade una fila 1 "RED DIRECTA".
 *
 * Métodos migrados:
 *   post_initialisation()                  → constructor (llama inicializa)
 *   Inicializa(RoCoord)                    → inicializa(coord)  /  inicializaConGis(...)
 *   crea_sello_secundario(RoCoord, bool)   → crearSelloSecundario(coord, redDirecta)
 *   llena_celdas(bool)                     → llenarCeldas(redDirecta)
 *   draw_content_on(window)                → drawContentOn()
 *   defined_attributes()                   → DEFINED_ATTRIBUTES_SELLO_AUM (constante)
 *
 * Equivalencias clave:
 *   colour.called("white")                  → fillColor: '#ffffff'
 *   oTablas.crea_tabla(f,c,:tbl_aumento)    → tablas.set('tbl_aumento', TablaAumento{…})
 *   oRenglones.elemento(n).nLongitud = 4    → altoFila: 4  (mm)
 *   oColumnas.elemento(n).nLongitud  = 15   → anchoColumna: 15  (mm) × 5 cols
 *   bDibuja_Columnas/Renglones_Internos?=_true → lineasInternas: true
 *   bDibuja_renglones_internos_dcha?(1,_false) → sinBordeDerFila1: true
 *   c_texto_grafico.new(str).ntamanio = N   → CeldaTexto { texto, tamanio: N }
 *   .scolor = "green"/"red"/"orange"        → color CSS en la celda
 *   oCeldas.Celda(f,c).oElemento            → celdas.get('tbl_aumento')!.get(`f-c`)
 *   distrito.rwo.obtener_numero_pares()     → distrito.obtenerPares() → NumeroPares
 *   oTablas.Despliega(window)               → drawContentOn() + renderizado SVG
 *   oTablas.area_total()                    → getBounds()
 *   gis_program_manager.cached_dataset(…)  → IMockGisService.fetchDistrito(id)
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Hash devuelto por obtener_numero_pares() en Magik */
export interface NumeroPares {
  existente  : number;   // pares existentes   → color verde en el sello
  proyectado : number;   // pares de aumento   → color rojo
  largoPlazo : number;   // pares largo plazo  → color naranja
}

/** Objeto de distrito GIS — Magik: rwo del distrito */
export interface DistritoGis {
  id           : string;
  nombre       : string;
  esRedDirecta : boolean;          // Magik: es_red_directa?
  obtenerPares : () => NumeroPares;// Magik: obtener_numero_pares()
}

/** Texto gráfico — Magik: c_texto_grafico */
export interface CeldaTexto {
  texto   : string;
  tamanio : number;    // Magik: ntamanio
  color  ?: string;    // Magik: scolor
}

/** Configuración de la tabla de aumento */
export interface TablaAumento {
  id                : string;
  numFilas          : number;      // 2 sin red directa, 3 con red directa
  numColumnas       : number;      // siempre 5
  altoFila          : number;      // mm — Magik: oRenglones.elemento(n).nLongitud = 4
  anchoColumna      : number;      // mm — Magik: oColumnas.elemento(n).nLongitud  = 15
  origen            : { x: number; y: number };
  lineasInternas    : boolean;     // Magik: bDibuja_Columnas/Renglones_Internos?
  sinBordeDerFila1 ?: boolean;     // Magik: bDibuja_renglones_internos_dcha?(1,_false)
}

type CellKey = `${number}-${number}`;

// =============================================================================
// ATRIBUTOS DEFINIDOS — c_sello_aumentos_secundarios.defined_attributes()
// =============================================================================

export const DEFINED_ATTRIBUTES_SELLO_AUM = [
  {
    nombre       : 'id_distrito',
    tipo         : 'string',
    descripcion  : 'Identificador Distrito',
    default      : null,             // Magik: _unset
    enPropiedades: true,             // Magik: :allowed_on_properties_page?, _true
  },
];

// =============================================================================
// DIMENSIONES FIJAS de la tabla (en mm)
// Magik: oRenglones.elemento(n).nLongitud = 4 y oColumnas.elemento(n).nLongitud = 15
// =============================================================================

const COL_WIDTH  = 15;   // mm — todas las columnas iguales
const ROW_HEIGHT =  4;   // mm — todos los renglones iguales

// =============================================================================
// MOCK GIS — distritos de ejemplo
// Sustituye: gis_program_manager.cached_dataset(:landbase)
//             .collections[:user!_distrito].at(id)
// =============================================================================

const MOCK_DISTRITOS: Record<string, DistritoGis> = {
  'D-01': {
    id: 'D-01', nombre: 'NORTE',
    esRedDirecta : true,
    obtenerPares : () => ({ existente: 120, proyectado: 45,  largoPlazo: 30 }),
  },
  'D-02': {
    id: 'D-02', nombre: 'SUR',
    esRedDirecta : false,
    obtenerPares : () => ({ existente: 87,  proyectado: 60,  largoPlazo: 15 }),
  },
  'D-03': {
    id: 'D-03', nombre: 'CENTRO',
    esRedDirecta : true,
    obtenerPares : () => ({ existente: 200, proyectado: 110, largoPlazo: 50 }),
  },
  'D-04': {
    id: 'D-04', nombre: 'ORIENTE',
    esRedDirecta : false,
    obtenerPares : () => ({ existente: 55,  proyectado: 22,  largoPlazo: 8  }),
  },
};

export interface IMockGisDistritoService {
  fetchDistrito(id: string): Promise<DistritoGis | null>;
}

/** Simula el acceso a gis_program_manager.cached_dataset(:landbase) */
export const mockGisDistritoService: IMockGisDistritoService = {
  fetchDistrito: async (id) => {
    await new Promise(r => setTimeout(r, 250));
    return MOCK_DISTRITOS[id] ?? null;
  },
};

// =============================================================================
// CLASE PRINCIPAL — c_sello_aumentos_secundarios
// =============================================================================

export class SelloAumentosSecundarios {

  // Magik: define_shared_constant(:allowed_on_menu?, _false, :public)
  static readonly ALLOWED_ON_MENU = false;

  // Magik: slots del exemplar
  idDistrito : string | null = null;              // :id_distrito (defined_attribute)
  distrito   : DistritoGis | null = null;         // :distrito
  origen     : { x: number; y: number } = { x: 0, y: 0 }; // :oCoordOrigen
  fillColor  : string = '#ffffff';                // Magik: colour.called("white")

  // Magik: :oTablas — gestor de tablas del sello
  tablas : Map<string, TablaAumento> = new Map();
  celdas : Map<string, Map<CellKey, CeldaTexto>> = new Map();

  // ---------------------------------------------------------------------------
  // post_initialisation()
  // Magik: _self.inicializa(coordinate.new(0,0))
  // ---------------------------------------------------------------------------
  constructor() {
    this.inicializa({ x: 0, y: 0 });
  }

  // ---------------------------------------------------------------------------
  // Inicializa(RoCoord) — inicialización base sin acceso GIS
  // Magik: _self.set_fill_colour(colour.called("white"))
  //        _if RoCoord _is _unset _then RoCoord << coordinate.new(0,0) _endif
  //        _self.oCoordOrigen << RoCoord
  // ---------------------------------------------------------------------------
  inicializa(coord: { x: number; y: number } = { x: 0, y: 0 }): void {
    this.fillColor = '#ffffff';
    this.origen    = coord;
  }

  // ---------------------------------------------------------------------------
  // Inicializa(RoCoord) — versión async con acceso al dataset GIS
  //
  // Magik (síncrono):
  //   _if _self.id_distrito _isnt _unset
  //     reg_distrito << dataset.collections[:user!_distrito].at(id)
  //     .distrito << reg_distrito.user!_limite
  //     red_directa? << .distrito.rwo.es_red_directa?
  //   _else
  //     _self.id_distrito << .distrito.rwo.id
  //     red_directa? << .distrito.rwo.es_red_directa?
  //   _endif
  //   _self.crea_sello_secundario(RoCoord, red_directa?)
  //   LoArea << _self.oTablas.area_total()
  //   _self.bounds << LoArea
  //   _self.llena_Celdas(red_directa?)
  // ---------------------------------------------------------------------------
  async inicializaConGis(
    coord  : { x: number; y: number },
    service: IMockGisDistritoService,
  ): Promise<void> {
    this.inicializa(coord);

    // Carga el distrito desde GIS si se conoce id_distrito
    if (this.idDistrito) {
      const reg = await service.fetchDistrito(this.idDistrito);
      if (reg) this.distrito = reg;
    } else if (this.distrito) {
      // Caso inverso: tenemos el distrito, extraemos su id
      this.idDistrito = this.distrito.id;
    }

    if (!this.distrito) return;

    const redDirecta = this.distrito.esRedDirecta;

    this.crearSelloSecundario(coord, redDirecta);
    // Magik: LoArea << _self.oTablas.area_total() → bounds
    // TS: getBounds() calcula el área desde la configuración de tablas
    this.llenarCeldas(redDirecta);
  }

  // ---------------------------------------------------------------------------
  // crea_sello_secundario(RoCoord, red_directa?)
  //
  // Magik:
  //   _if red_directa? _then num_filas = 3 _else num_filas = 2 _endif
  //   LoTblAumento << oTablas.crea_tabla(num_filas, 5, :tbl_aumento)
  //   LoTblAumento.oCoordenada_Origen << RoCoord
  //   LoTblAumento.bDibuja_Columnas_Internas? = _true
  //   LoTblAumento.bDibuja_Renglones_Internos? = _true
  //   Renglones 1,2[,3].nLongitud = 4
  //   Columnas 1-5.nLongitud = 15
  //   _if red_directa?: bDibuja_renglones_internos_dcha?(1, _false)
  // ---------------------------------------------------------------------------
  crearSelloSecundario(
    coord     : { x: number; y: number },
    redDirecta: boolean,
  ): void {
    const numFilas = redDirecta ? 3 : 2;   // Magik: num_filas

    this.tablas.set('tbl_aumento', {
      id               : 'tbl_aumento',
      numFilas,
      numColumnas      : 5,
      altoFila         : ROW_HEIGHT,        // 4mm por renglón
      anchoColumna     : COL_WIDTH,         // 15mm por columna
      origen           : { ...coord },
      lineasInternas   : true,              // bDibuja_Columnas/Renglones_Internos? = _true
      sinBordeDerFila1 : redDirecta,        // bDibuja_renglones_internos_dcha?(1,_false)
    });

    if (!this.celdas.has('tbl_aumento')) {
      this.celdas.set('tbl_aumento', new Map());
    }
  }

  // ---------------------------------------------------------------------------
  // llena_celdas(red_directa?)
  //
  // Magik:
  //   _if red_directa?
  //     t0 = c_texto_grafico.new("RED DIRECTA"); t0.ntamanio=30
  //     oCeldas.Celda(1,3).oElemento << t0
  //     fila_tit=2 ; fila_valor=3
  //   _else
  //     fila_tit=1 ; fila_valor=2
  //   _endif
  //
  //   t1..t5 = "DTO." "CONECT." "AUMENTO" "L. PLAZO" "TOTAL" (ntamanio=20)
  //   resp << .distrito.rwo.obtener_numero_pares()
  //   ParExist.scolor="green" / ParProy.scolor="red" / ParLP.scolor="orange"
  //   Total = resp[:proyectado] + resp[:existente] + resp[:largo_plazo]
  // ---------------------------------------------------------------------------
  llenarCeldas(redDirecta: boolean): void {
    if (!this.distrito) return;
    const map = this.celdas.get('tbl_aumento')!;

    let filaTit  : number;
    let filaValor: number;

    if (redDirecta) {
      // Magik: oCeldas.Celda(1,3).oElemento << c_texto_grafico.new("RED DIRECTA")
      map.set('1-3', { texto: 'RED DIRECTA', tamanio: 30 });
      filaTit   = 2;
      filaValor = 3;
    } else {
      filaTit   = 1;
      filaValor = 2;
    }

    // Cabeceras — Magik: t1..t5 c_texto_grafico.new("DTO."), etc. ntamanio=20
    const cabeceras: Array<[number, string]> = [
      [1, 'DTO.'], [2, 'CONECT.'], [3, 'AUMENTO'], [4, 'L. PLAZO'], [5, 'TOTAL'],
    ];
    for (const [col, texto] of cabeceras) {
      map.set(`${filaTit}-${col}` as CellKey, { texto, tamanio: 20 });
    }

    // Valores — Magik: resp << .distrito.rwo.obtener_numero_pares()
    const resp  = this.distrito.obtenerPares();
    const total = resp.proyectado + resp.existente + resp.largoPlazo;

    // Magik: NomDistrito.nTamanio=30 (sin color)
    map.set(`${filaValor}-1` as CellKey, { texto: this.distrito.nombre,    tamanio: 30 });
    // Magik: ParExist.scolor="green"
    map.set(`${filaValor}-2` as CellKey, { texto: String(resp.existente),  tamanio: 30, color: 'green'  });
    // Magik: ParProy.scolor="red"
    map.set(`${filaValor}-3` as CellKey, { texto: String(resp.proyectado), tamanio: 30, color: 'red'    });
    // Magik: ParLP.scolor="orange"
    map.set(`${filaValor}-4` as CellKey, { texto: String(resp.largoPlazo), tamanio: 30, color: 'orange' });
    // Magik: ParTotal = proyectado + existente + largo_plazo (sin color)
    map.set(`${filaValor}-5` as CellKey, { texto: String(total),           tamanio: 30 });
  }

  // ---------------------------------------------------------------------------
  // draw_content_on(window)
  // Magik: _self.oWindow << window ; _self.oTablas.Despliega(window)
  // TS: devuelve la estructura interna para que el componente React la renderice
  // ---------------------------------------------------------------------------
  drawContentOn(): {
    tablas: Map<string, TablaAumento>;
    celdas: Map<string, Map<CellKey, CeldaTexto>>;
  } {
    return { tablas: this.tablas, celdas: this.celdas };
  }

  // Magik: oTablas.area_total() → _self.bounds << LoArea
  getBounds(): { width: number; height: number } {
    const tbl = this.tablas.get('tbl_aumento');
    if (!tbl) return { width: 0, height: 0 };
    return {
      width : tbl.numColumnas * tbl.anchoColumna,
      height: tbl.numFilas    * tbl.altoFila,
    };
  }

  /** Acceso directo a una celda — helper interno */
  getCelda(tablaId: string, fila: number, col: number): CeldaTexto | undefined {
    return this.celdas.get(tablaId)?.get(`${fila}-${col}` as CellKey);
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello de aumentos de red secundaria
// Equivale al renderizado que hace oTablas.Despliega(window) en Magik
// =============================================================================

const SCALE = 7;   // px por mm — la tabla es pequeña, se amplía para la UI

export function SelloAumentosSecundariosUI() {
  const [idDistrito, setIdDistrito] = useState('D-01');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [sello, setSello]           = useState<SelloAumentosSecundarios | null>(null);

  const handleCargar = async () => {
    setLoading(true); setError(null);
    const s = new SelloAumentosSecundarios();
    s.idDistrito = idDistrito;
    await s.inicializaConGis({ x: 0, y: 0 }, mockGisDistritoService);
    if (!s.distrito) {
      setError(`Distrito "${idDistrito}" no encontrado. Prueba: D-01, D-02, D-03, D-04`);
    } else {
      setSello(s);
    }
    setLoading(false);
  };

  const tbl  = sello?.tablas.get('tbl_aumento');
  const dist = sello?.distrito;

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_sello_aumentos_secundarios</h3>
      <p style={st.meta}>
        Sello de aumento de red secundaria por distrito. Tabla 2×5 (sin red directa) ó 3×5 (con red directa).
        Columnas: DTO. | CONECT. | AUMENTO | L. PLAZO | TOTAL. Valores en color: verde / rojo / naranja.
      </p>

      {/* ── Controles de carga ── */}
      <div style={st.control}>
        <label style={st.lbl}>
          Distrito:
          <select value={idDistrito} onChange={e => setIdDistrito(e.target.value)} style={st.select}>
            {Object.entries(MOCK_DISTRITOS).map(([k, d]) => (
              <option key={k} value={k}>
                {k} — {d.nombre} {d.esRedDirecta ? '(RED DIRECTA)' : ''}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleCargar} disabled={loading} style={st.btn}>
          {loading ? 'Cargando…' : 'Inicializa()'}
        </button>
        {error && <span style={{ ...st.hint, color: '#c62828' }}>{error}</span>}
      </div>

      {/* ── SVG del sello — equivale a oTablas.Despliega(window) ── */}
      {tbl && dist && (() => {
        const map        = sello!.celdas.get('tbl_aumento')!;
        const svgW       = tbl.numColumnas * tbl.anchoColumna * SCALE;
        const svgH       = tbl.numFilas    * tbl.altoFila    * SCALE;
        const colW       = tbl.anchoColumna * SCALE;
        const rowH       = tbl.altoFila    * SCALE;
        const redDirect  = dist.esRedDirecta;
        const filaTit    = redDirect ? 2 : 1;
        const filaValor  = redDirect ? 3 : 2;

        return (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
              Sello — escala {SCALE}px/mm ·{' '}
              {tbl.numFilas} filas × {tbl.numColumnas} cols ·{' '}
              {tbl.numColumnas * tbl.anchoColumna}×{tbl.numFilas * tbl.altoFila} mm
            </div>

            <svg width={svgW + 2} height={svgH + 2}
              style={{ border: '1px solid #455a64', background: '#fff', borderRadius: 2 }}>

              {/* ── Celdas ── */}
              {Array.from({ length: tbl.numFilas }, (_, ri) =>
                Array.from({ length: tbl.numColumnas }, (_, ci) => {
                  const fila = ri + 1;
                  const col  = ci + 1;
                  const cel  = map.get(`${fila}-${col}` as CellKey);
                  const x    = ci * colW;
                  const y    = ri * rowH;

                  // Fila RED DIRECTA: sólo col 3 tiene texto, el resto vacío
                  const isRedDirCell  = redDirect && fila === 1 && col === 3;
                  const isRedDirEmpty = redDirect && fila === 1 && col !== 3;

                  // Color de fondo por tipo de fila
                  let bg = '#fff';
                  if (fila === 1 && redDirect)  bg = '#fce4ec';  // fila RED DIRECTA
                  else if (fila === filaTit)     bg = '#e3f2fd';  // fila cabecera
                  // fila de valores: blanco

                  const textColor  = cel?.color ?? '#1a1a1a';
                  const fontSize   = Math.max(7, rowH * 0.38);
                  const isBold     = fila === filaTit || isRedDirCell;

                  return (
                    <g key={`${fila}-${col}`}>
                      <rect
                        x={x} y={y} width={colW} height={rowH}
                        fill={bg} stroke="#78909c" strokeWidth={0.6}
                      />
                      {cel && !isRedDirEmpty && (
                        <text
                          x={x + colW / 2} y={y + rowH / 2}
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize={isRedDirCell ? fontSize * 1.15 : fontSize}
                          fill={textColor}
                          fontWeight={isBold ? 'bold' : 'normal'}
                          fontFamily="sans-serif"
                        >
                          {cel.texto}
                        </text>
                      )}
                    </g>
                  );
                })
              )}

              {/* Borde exterior reforzado — Magik: fill_colour blanco con borde */}
              <rect x={0} y={0} width={svgW} height={svgH}
                fill="none" stroke="#455a64" strokeWidth={1.5} />
            </svg>

            {/* ── Tabla de valores — equivale a los slots del sello ── */}
            <table style={{ ...st.table, marginTop: 12 }}>
              <thead>
                <tr>
                  {['Slot / campo Magik', 'Descripción', 'Valor', 'Color texto'].map(h => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const resp  = dist.obtenerPares();
                  const total = resp.existente + resp.proyectado + resp.largoPlazo;
                  return [
                    { campo: 'NomDistrito (.distrito.rwo.id)',            desc: 'Nombre del distrito',   val: dist.nombre,          color: undefined  },
                    { campo: 'resp[:existente]  → ParExist.scolor=green', desc: 'Pares existentes',      val: String(resp.existente),  color: 'green'  },
                    { campo: 'resp[:proyectado] → ParProy.scolor=red',    desc: 'Pares de aumento',      val: String(resp.proyectado), color: 'red'    },
                    { campo: 'resp[:largo_plazo]→ ParLP.scolor=orange',   desc: 'Pares a largo plazo',   val: String(resp.largoPlazo), color: 'orange' },
                    { campo: 'proy + exist + LP → ParTotal',              desc: 'Total (sin color)',      val: String(total),           color: undefined },
                    { campo: '.distrito.rwo.es_red_directa?',             desc: 'Filas de tabla',        val: redDirect ? '_true → 3 filas' : '_false → 2 filas', color: undefined },
                  ].map(({ campo, desc, val, color }, i) => (
                    <tr key={campo} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                      <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{campo}</code></td>
                      <td style={{ ...st.td, color: '#555', fontSize: 11 }}>{desc}</td>
                      <td style={{ ...st.td, color: color ?? '#1a1a1a', fontWeight: color ? 'bold' : 'normal' }}>{val}</td>
                      <td style={{ ...st.td, fontSize: 10 }}>
                        {color
                          ? <span style={{ background: color, color: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>{color}</span>
                          : <span style={{ color: '#aaa' }}>—</span>}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>

            <p style={{ ...st.meta, marginTop: 6 }}>
              Tabla <code>tbl_aumento</code>:{' '}
              {tbl.numColumnas} col × {tbl.anchoColumna}mm + {tbl.numFilas} fil × {tbl.altoFila}mm ={' '}
              {tbl.numColumnas * tbl.anchoColumna}×{tbl.numFilas * tbl.altoFila} mm.
              {redDirect && (
                <> Fila 1 = "RED DIRECTA" (col 3), sin borde derecho interno{' '}
                  (<code>bDibuja_renglones_internos_dcha?(1,_false)</code>).</>
              )}
            </p>
          </div>
        );
      })()}

      {!sello && !loading && (
        <p style={{ ...st.meta, marginTop: 8, fontStyle: 'italic' }}>
          Selecciona un distrito y pulsa <strong>Inicializa()</strong> para generar el sello.
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl    : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  select : { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  btn    : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  hint   : { fontSize: 11, color: '#666', fontStyle: 'italic' },
  table  : { borderCollapse: 'collapse' as const },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' as const, fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloAumentosSecundariosUI;
