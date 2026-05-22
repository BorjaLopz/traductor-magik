/**
 * Migración: c_sello_aumentos_secundarios.magik
 * Empresa:   Ten Sails Consulting — Elena Sainero — Noviembre 2005
 * Clase Magik: c_sello_aumentos_secundarios — extiende layout_element
 *
 * Genera un sello (cuadro de leyenda de plano) con los datos de aumento
 * de red secundaria por distrito, para el Plano de Estudio de Conjunto.
 *
 * Métodos migrados:
 *   post_initialisation()      → postInicializacion()
 *   inicializa(RoCoord)        → async inicializa(coord, service)
 *   crea_sello_secundario()    → crearSelloSecundario()
 *   llena_celdas()             → llenarCeldas()
 *   draw_content_on(window)    → getTabla() + render SVG en UI
 *
 * Equivalencias clave:
 *   gis_program_manager.cached_dataset(:landbase) → IGisDistritoService (mock async)
 *   coordinate.new(x,y)                           → Coord { x, y }
 *   c_texto_grafico.new(str)                       → CeldaTexto { texto, tamanio, color }
 *   oTablas.crea_tabla(nFilas, nCols, :id)         → crearSelloSecundario() → Tabla
 *   oTablas.area_total()                           → calculado desde filasAlto + colsAncho
 *   LoTbl.bDibuja_renglones_internos_dcha?(n,_false) → sinBordeDchaPorFila: Set<number>
 */

import React, { useState } from 'react';

// ─── Tipos base ────────────────────────────────────────────────────────────────

/** Magik: coordinate.new(x, y) */
export interface Coord { x: number; y: number; }

/** Magik: .distrito.rwo.obtener_numero_pares() */
export interface NumeroPares {
  existente   : number;
  proyectado  : number;
  largo_plazo : number;
}

/** Magik: registro de colección :user!_distrito */
export interface RegistroDistrito {
  id           : string;
  nombre       : string;    // user!_distrito.write_string
  esRedDirecta : boolean;   // es_red_directa?
  pares        : NumeroPares;
}

/** Magik: gis_program_manager.cached_dataset(:landbase).collections[:user!_distrito] */
export interface IGisDistritoService {
  fetchDistrito(idDistrito: string): Promise<RegistroDistrito | null>;
}

// ─── Tipos internos de tabla ───────────────────────────────────────────────────

/** Magik: c_texto_grafico */
interface CeldaTexto {
  texto   : string;
  tamanio : number;  // ntamanio Magik (20 = cabecera, 30 = valor)
  color   : string;  // scolor → CSS string
}

type CeldaKey = `${number}-${number}`;

/** Magik: tabla interna de oTablas — creada por crea_tabla(nFilas, nCols, :id) */
interface Tabla {
  id                  : string;
  numFilas            : number;
  numCols             : number;
  origen              : Coord;
  filasAlto           : number[];     // nLongitud por fila (u Magik)
  colsAncho           : number[];     // nLongitud por columna (u Magik)
  celdas              : Map<CeldaKey, CeldaTexto>;
  sinBordeDchaPorFila : Set<number>;  // bDibuja_renglones_internos_dcha?(fila, _false)
}

// ─── Constantes de layout ──────────────────────────────────────────────────────

// Magik: LoTblAumento.oRenglones.elemento(n).nLongitud << 4
const ROW_H = 4;   // altura de fila en unidades Magik

// Magik: LoTblAumento.oColumnas.elemento(n).nLongitud << 15  (cols 1-5)
const COL_W = 15;  // ancho de columna en unidades Magik

const NUM_COLS = 5;

// ─── Mock GIS Service ──────────────────────────────────────────────────────────

// Magik: gis_program_manager.cached_dataset(:landbase).collections[:user!_distrito].at(id)
const MOCK_DISTRITOS: Record<string, RegistroDistrito> = {
  'D01': {
    id: 'D01', nombre: 'DISTRITO 01 NORTE',
    esRedDirecta: true,
    pares: { existente: 1200, proyectado: 450, largo_plazo: 300 },
  },
  'D02': {
    id: 'D02', nombre: 'DISTRITO 02 SUR',
    esRedDirecta: false,
    pares: { existente: 850, proyectado: 220, largo_plazo: 180 },
  },
  'D03': {
    id: 'D03', nombre: 'DISTRITO 03 CENTRO',
    esRedDirecta: true,
    pares: { existente: 3400, proyectado: 780, largo_plazo: 560 },
  },
};

export const mockGisDistritoService: IGisDistritoService = {
  fetchDistrito: async (id) => {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_DISTRITOS[id] ?? null;
  },
};

// ─── Clase principal ───────────────────────────────────────────────────────────

export class SelloAumentosSecundarios {

  // Magik: slots del def_slotted_exemplar
  idDistrito   : string | null = null;  // layout_attribute_definition :id_distrito
  oCoordOrigen : Coord         = { x: 0, y: 0 };

  private tabla    : Tabla | null             = null;
  private distrito : RegistroDistrito | null  = null;

  /**
   * post_initialisation()
   * Magik llama esto tras new(). Delega a inicializa con coord (0,0).
   */
  async postInicializacion(): Promise<void> {
    await this.inicializa({ x: 0, y: 0 });
  }

  /**
   * inicializa(RoCoord)
   * Carga el distrito desde GIS, crea la tabla y rellena las celdas.
   *
   * Magik:
   *   reg_distrito << gis_program_manager.cached_dataset(:landbase)
   *                    .collections[:user!_distrito].at(_self.id_distrito)
   *   .distrito << reg_distrito.user!_limite
   *   red_directa? << .distrito.rwo.es_red_directa?
   *   _self.crea_sello_secundario(RoCoord, red_directa?)
   *   LoArea << _self.oTablas.area_total()
   *   _self.bounds << LoArea
   *   _self.llena_Celdas(red_directa?)
   */
  async inicializa(coord: Coord, service?: IGisDistritoService): Promise<void> {
    this.oCoordOrigen = coord;

    // Retorno temprano si no hay ID ni servicio (equivale al _return del Magik)
    if (!service || !this.idDistrito) return;

    const reg = await service.fetchDistrito(this.idDistrito);
    if (!reg) return;
    this.distrito = reg;

    const redDirecta = reg.esRedDirecta;

    this.crearSelloSecundario(coord, redDirecta);
    this.llenarCeldas(redDirecta);
  }

  /**
   * crea_sello_secundario(RoCoord, red_directa?)
   *
   * Magik:
   *   num_filas << red_directa? ? 3 : 2
   *   LoTblAumento << oTablas.crea_tabla(num_filas, 5, :tbl_aumento)
   *   LoTblAumento.oCoordenada_Origen << RoCoord
   *   LoTblAumento.bDibuja_Columnas_Internas? << _true
   *   LoTblAumento.bDibuja_Renglones_Internos? << _true
   *   oRenglones.elemento(n).nLongitud << 4    (todas las filas)
   *   oColumnas.elemento(n).nLongitud  << 15   (todas las columnas)
   *   _if red_directa? → bDibuja_renglones_internos_dcha?(1, _false)
   */
  crearSelloSecundario(coord: Coord, redDirecta: boolean): void {
    const numFilas = redDirecta ? 3 : 2;

    const sinBordeDchaPorFila = new Set<number>();
    if (redDirecta) {
      // Magik: LoTblAumento.bDibuja_renglones_internos_dcha?(1, _false)
      // Fila 1 (RED DIRECTA) no muestra separadores verticales internos
      sinBordeDchaPorFila.add(1);
    }

    this.tabla = {
      id                  : 'tbl_aumento',
      numFilas,
      numCols             : NUM_COLS,
      origen              : { ...coord },
      filasAlto           : Array<number>(numFilas).fill(ROW_H),
      colsAncho           : Array<number>(NUM_COLS).fill(COL_W),
      celdas              : new Map(),
      sinBordeDchaPorFila,
    };
  }

  /**
   * llena_celdas(red_directa?)
   *
   * Magik (extracto clave):
   *   _if red_directa? →
   *     t0 = c_texto_grafico.new("RED DIRECTA"), t0.ntamanio << 30
   *     celda(1,3).oElemento << t0
   *     fila_tit = 2 / fila_valor = 3
   *   _else →
   *     fila_tit = 1 / fila_valor = 2
   *
   *   t1..t5 = c_texto_grafico("DTO.","CONECT.","AUMENTO","L. PLAZO","TOTAL"), ntamanio=20
   *   resp = .distrito.rwo.obtener_numero_pares()
   *   ParExist.scolor = "green" / ParProy.scolor = "red" / ParLP.scolor = "orange"
   *   NomDistrito/ParExist/ParProy/ParLP/ParTotal.nTamanio = 30
   */
  llenarCeldas(redDirecta: boolean): void {
    if (!this.tabla || !this.distrito) return;

    const filaTit   = redDirecta ? 2 : 1;
    const filaValor = redDirecta ? 3 : 2;

    // Magik: c_texto_grafico.new("RED DIRECTA"), ntamanio << 30
    if (redDirecta) {
      this.setCelda(1, 3, { texto: 'RED DIRECTA', tamanio: 30, color: '#000' });
    }

    // Cabeceras: t1..t5, ntamanio = 20
    const headers = ['DTO.', 'CONECT.', 'AUMENTO', 'L. PLAZO', 'TOTAL'];
    headers.forEach((h, i) => {
      this.setCelda(filaTit, i + 1, { texto: h, tamanio: 20, color: '#000' });
    });

    // Valores de pares: resp = .distrito.rwo.obtener_numero_pares()
    const { existente, proyectado, largo_plazo } = this.distrito.pares;
    const total = proyectado + existente + largo_plazo;

    const valores: CeldaTexto[] = [
      { texto: this.distrito.nombre,  tamanio: 30, color: '#000'   }, // NomDistrito
      { texto: String(existente),     tamanio: 30, color: 'green'  }, // ParExist
      { texto: String(proyectado),    tamanio: 30, color: 'red'    }, // ParProy
      { texto: String(largo_plazo),   tamanio: 30, color: 'orange' }, // ParLP
      { texto: String(total),         tamanio: 30, color: '#000'   }, // ParTotal
    ];
    valores.forEach((v, i) => {
      this.setCelda(filaValor, i + 1, v);
    });
  }

  // ─── Utilidades internas ─────────────────────────────────────────────────────

  private setCelda(fila: number, col: number, celda: CeldaTexto): void {
    this.tabla?.celdas.set(`${fila}-${col}` as CeldaKey, celda);
  }

  getCelda(fila: number, col: number): CeldaTexto | undefined {
    return this.tabla?.celdas.get(`${fila}-${col}` as CeldaKey);
  }

  getTabla()    : Tabla | null            { return this.tabla;    }
  getDistrito() : RegistroDistrito | null { return this.distrito; }

  /** Magik: oTablas.area_total() → ancho × alto total en unidades Magik */
  getAreaTotal(): { ancho: number; alto: number } | null {
    if (!this.tabla) return null;
    const ancho = this.tabla.colsAncho.reduce((a, b) => a + b, 0);
    const alto  = this.tabla.filasAlto.reduce((a, b) => a + b, 0);
    return { ancho, alto };
  }
}

// ─── Componente React de demostración ─────────────────────────────────────────

const SCALE = 6; // px por unidad Magik (para visualizar en pantalla)

export function SelloAumentosSecundariosUI() {
  const [idStr,   setIdStr  ] = useState('D01');
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState<string | null>(null);
  const [sello,   setSello  ] = useState<SelloAumentosSecundarios | null>(null);

  // Magik: _self.inicializa(RoCoord) — desencadenado por acción del usuario
  const handleCargar = async () => {
    const s = new SelloAumentosSecundarios();
    s.idDistrito = idStr.trim();
    setLoading(true); setError(null);

    await s.inicializa({ x: 0, y: 0 }, mockGisDistritoService);

    if (!s.getDistrito()) {
      setError(`Distrito "${idStr}" no encontrado. Prueba: D01, D02, D03`);
    }
    setSello(s);
    setLoading(false);
  };

  const tabla = sello?.getTabla();
  const dist  = sello?.getDistrito();
  const area  = sello?.getAreaTotal();

  const svgW = (area?.ancho ?? 0) * SCALE;
  const svgH = (area?.alto  ?? 0) * SCALE;

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_sello_aumentos_secundarios</h3>
      <p style={st.meta}>
        Sello de aumento de red secundaria por distrito — Plano de Estudio de Conjunto.
        Tabla {NUM_COLS} cols × (2 filas normal / 3 filas red directa) · {COL_W}u×{ROW_H}u por celda.
      </p>

      {/* ── Controles ─────────────────────────────────────────────────────── */}
      <div style={st.control}>
        <label style={st.lbl}>
          id Distrito:
          <input
            type="text" value={idStr}
            onChange={e => setIdStr(e.target.value)}
            style={st.textInput}
            placeholder="D01"
          />
        </label>
        <button onClick={handleCargar} disabled={loading} style={st.btn}>
          {loading ? 'Cargando…' : 'Cargar (inicializa)'}
        </button>
        <span style={st.hint}>IDs disponibles: D01 · D02 (sin red directa) · D03</span>
        {error && <span style={{ ...st.hint, color: '#c62828' }}>{error}</span>}
      </div>

      {/* ── Info del distrito ─────────────────────────────────────────────── */}
      {dist && (
        <p style={{ ...st.meta, marginTop: 6 }}>
          <strong>{dist.nombre}</strong> ·{' '}
          {dist.esRedDirecta
            ? <span style={{ color: '#1565c0', fontWeight: 'bold' }}>Red Directa: SÍ (3 filas)</span>
            : <span style={{ color: '#555' }}>Red Directa: NO (2 filas)</span>
          } · Área total: {area?.ancho}u × {area?.alto}u
        </p>
      )}

      {/* ── SVG del sello — equivale a draw_content_on(window) ────────────── */}
      {tabla && sello && (
        <div style={{ marginTop: 10 }}>
          <svg
            width={svgW + 2} height={svgH + 2}
            style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2, display: 'block' }}
          >
            {/* Borde exterior de la tabla */}
            <rect x={0} y={0} width={svgW} height={svgH}
              fill="none" stroke="#455a64" strokeWidth={1.5} />

            {/* Líneas horizontales entre filas */}
            {(() => {
              let y = 0;
              return tabla.filasAlto.slice(0, -1).map((h, i) => {
                y += h * SCALE;
                return <line key={`row-${i}`} x1={0} y1={y} x2={svgW} y2={y}
                  stroke="#90a4ae" strokeWidth={0.8} />;
              });
            })()}

            {/* Líneas verticales entre columnas — respeta sinBordeDchaPorFila */}
            {(() => {
              const lines: React.ReactNode[] = [];
              let xCum = 0;
              tabla.colsAncho.slice(0, -1).forEach((w, ci) => {
                xCum += w * SCALE;
                const x = xCum;
                let yStart = 0;
                tabla.filasAlto.forEach((fh, fi) => {
                  const rowIdx = fi + 1;
                  // Magik: bDibuja_renglones_internos_dcha?(1, _false)
                  if (!tabla.sinBordeDchaPorFila.has(rowIdx)) {
                    lines.push(
                      <line key={`col-${ci}-${fi}`}
                        x1={x} y1={yStart} x2={x} y2={yStart + fh * SCALE}
                        stroke="#90a4ae" strokeWidth={0.8} />
                    );
                  }
                  yStart += fh * SCALE;
                });
              });
              return lines;
            })()}

            {/* Contenido de celdas — Magik: oCeldas.Celda(f,c).oElemento */}
            {(() => {
              const nodes: React.ReactNode[] = [];
              let yOff = 0;
              tabla.filasAlto.forEach((fh, fi) => {
                let xOff = 0;
                const fila = fi + 1;
                tabla.colsAncho.forEach((cw, ci) => {
                  const col  = ci + 1;
                  const celd = sello.getCelda(fila, col);
                  const cx   = xOff + (cw * SCALE) / 2;
                  const cy   = yOff + (fh * SCALE) / 2;

                  // Fondo de cabecera (tamanio 20 = títulos de columna)
                  if (celd?.tamanio === 20) {
                    nodes.push(
                      <rect key={`bg-${fila}-${col}`}
                        x={xOff} y={yOff} width={cw * SCALE} height={fh * SCALE}
                        fill="#e8eaf6" />
                    );
                  }

                  if (celd) {
                    // Escala proporcional: ntamanio Magik → px SVG
                    const fontSize = Math.max(6, (fh * SCALE) * (celd.tamanio / 120));
                    nodes.push(
                      <text key={`txt-${fila}-${col}`}
                        x={cx} y={cy}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={fontSize}
                        fill={celd.color}
                        fontFamily="sans-serif"
                        fontWeight={celd.tamanio >= 30 ? 'bold' : 'normal'}
                      >
                        {celd.texto}
                      </text>
                    );
                  }
                  xOff += cw * SCALE;
                });
                yOff += fh * SCALE;
              });
              return nodes;
            })()}
          </svg>
          <small style={{ ...st.meta, display: 'block', marginTop: 4 }}>
            SVG {svgW}×{svgH}px · escala {SCALE}px/u ·
            {tabla.numFilas} filas × {tabla.numCols} cols ·
            col: {COL_W}u · fila: {ROW_H}u
          </small>
        </div>
      )}

      {/* ── Tabla de atributos Magik ─────────────────────────────────────── */}
      {dist && (
        <table style={{ ...st.table, marginTop: 12 }}>
          <thead>
            <tr>
              {['Campo Magik', 'Slot / método', 'Valor'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [':id_distrito',        'layout_attribute_definition',              dist.id],
              ['distrito.write_string','user!_distrito.write_string',             dist.nombre],
              ['es_red_directa?',     '.distrito.rwo.es_red_directa?',            String(dist.esRedDirecta)],
              ['resp[:existente]',    'obtener_numero_pares()[:existente]',       String(dist.pares.existente)],
              ['resp[:proyectado]',   'obtener_numero_pares()[:proyectado]',      String(dist.pares.proyectado)],
              ['resp[:largo_plazo]',  'obtener_numero_pares()[:largo_plazo]',     String(dist.pares.largo_plazo)],
              ['total',               'proyectado + existente + largo_plazo',     String(dist.pares.existente + dist.pares.proyectado + dist.pares.largo_plazo)],
            ].map(([campo, slot, valor], i) => (
              <tr key={campo} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                <td style={{ ...st.td, fontFamily: 'monospace' }}><code>{campo}</code></td>
                <td style={{ ...st.td, fontSize: 11, color: '#555' }}>{slot}</td>
                <td style={{ ...st.td, fontWeight: 'bold' }}>{valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  frame    : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title    : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta     : { color: '#666', fontSize: 12, margin: '2px 0' },
  control  : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl      : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  textInput: { width: 65, padding: '2px 4px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 2 },
  btn      : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  hint     : { fontSize: 11, color: '#666', fontStyle: 'italic' },
  table    : { borderCollapse: 'collapse' as const },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' as const, fontSize: 11 },
  td       : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloAumentosSecundariosUI;
