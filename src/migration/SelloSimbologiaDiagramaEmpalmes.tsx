/**
 * Migración de: c_sello_simbologia_diagrama_empalmes.magik
 * Clase Magik:  c_sello_simbologia_diagrama_empalmes  —  Sigma Tao / aalarcon / 2011
 * Hereda:       c_base_sello_fibra  (stub definido abajo — pendiente migración)
 *
 * Cuadro de simbología para planos de diagramas de empalmes.
 * Dos tablas apiladas:
 *   tbl_titulo   — 8×65 unidades — "SIMBOLOGIA" verde centrado
 *   tbl_contenido — 110×65 unidades — símbolo gráfico del diagrama
 *
 * configura_tabla() → calcula posición y dimensiones de cada tabla
 * etiqueta_celdas() → asigna texto + símbolo a las celdas
 *
 * BUG ORIGINAL PRESERVADO:
 *   LfDesplazaY = longitud_total_renglones({:tbl_titulo})
 *   LfDesplazaY = LfDesplazaY + longitud_total_renglones({:tbl_titulo})  ← :tbl_titulo dos veces
 *   Resultado: desplazaY = 2 × altura_titulo (crea un hueco entre título y contenido)
 *   Debería ser: tbl_titulo + tbl_contenido (acumulación progresiva).
 *
 * Conversión de coordenadas:
 *   Magik Y-up: origen baja con -LfDesplazaY  →  SVG Y-down: origen baja con +desplazaY
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: coordinate — posición 2D en unidades del sistema de layout */
export interface Coordenada { x: number; y: number; }

/** Color RGB en escala 0–1 — Magik: {R, G, B} */
export type ColorMagik = [number, number, number];

/** Datos de texto de una celda — Magik: asigna_texto_celda params */
export interface CeldaTexto {
  texto     : string;
  tamanio   : number;                          // Magik: nTamanio
  alineacion: 'centre_centre' | 'centre_left'; // Magik: :centre_centre / :centre_left
  rotacion  : number;                          // Magik: nRotacion (grados)
  color     : ColorMagik;                      // Magik: {R, G, B} 0-1
}

/** Datos de símbolo de una celda — Magik: asigna_simbolo_celda params */
export interface CeldaSimbolo {
  nombre : string;  // nombre del símbolo en el sistema Smallworld
  tamanio: number;
}

/** Tabla de layout — resultado de crea_tabla + asigna_medidas_tabla */
export interface TablaLayout {
  id       : string;
  renglones: number;   // Magik: :ren
  columnas : number;   // Magik: :col
  origen   : Coordenada;
  texto   ?: CeldaTexto;
  simbolo ?: CeldaSimbolo;
}

// =============================================================================
// UTILIDADES
// =============================================================================

/** Magik: {R, G, B} 0-1 → CSS rgb() */
function colorMagikToCSS([r, g, b]: ColorMagik): string {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// =============================================================================
// BASE — c_base_sello_fibra  (stub — pendiente migración)
// =============================================================================

/**
 * Stub para c_base_sello_fibra — pendiente de migrar su fichero .magik.
 * Aporta el sistema de tablas de layout y la coordenada de origen del sello.
 */
export class CBaseSelloFibra {
  // Magik: .o_coord_inicio — coordenada de origen del sello
  oCoordInicio: Coordenada = { x: 0, y: 0 };

  // Magik: .o_tablas — gestor de tablas de layout
  protected tablas: Map<string, TablaLayout> = new Map();

  // Magik: .o_tablas.crea_tabla(nFilas, nCols, :id)
  protected crearTabla(
    _nFilas: number, _nCols: number, id: string,
  ): TablaLayout {
    const t: TablaLayout = { id, renglones: 0, columnas: 0, origen: { x: 0, y: 0 } };
    this.tablas.set(id, t);
    return t;
  }

  // Magik: .o_tablas.longitud_total_renglones({:id, ...})
  // Devuelve la suma de alturas de las tablas indicadas (renglones × 1 unidad/renglón)
  protected longitudTotalRenglones(ids: string[]): number {
    return ids.reduce((acc, id) => acc + (this.tablas.get(id)?.renglones ?? 0), 0);
  }

  // Magik: _self.asigna_medidas_tabla(tabla, property_list)
  protected asignarMedidasTabla(
    tabla : TablaLayout,
    config: { renglones: number; columnas: number },
  ): void {
    tabla.renglones = config.renglones;
    tabla.columnas  = config.columnas;
  }

  // Magik: _self.asigna_texto_celda(:id, fila, col, texto, tamanio, :alineacion, rot, color)
  protected asignarTextoCelda(
    tablaId   : string,
    _fila     : number,
    _col      : number,
    texto     : string,
    tamanio   : number,
    alineacion: CeldaTexto['alineacion'],
    rotacion  : number,
    color     : ColorMagik,
  ): void {
    const t = this.tablas.get(tablaId);
    if (t) t.texto = { texto, tamanio, alineacion, rotacion, color };
  }

  // Magik: _self.asigna_simbolo_celda(:id, fila, col, nombre, tamanio)
  protected asignarSimboloCelda(
    tablaId : string,
    _fila   : number,
    _col    : number,
    nombre  : string,
    tamanio : number,
  ): void {
    const t = this.tablas.get(tablaId);
    if (t) t.simbolo = { nombre, tamanio };
  }
}

// =============================================================================
// CLASE PRINCIPAL — c_sello_simbologia_diagrama_empalmes
// =============================================================================

export class SelloSimbologiaDiagramaEmpalmes extends CBaseSelloFibra {

  // Dimensiones de layout (constantes del Magik original)
  static readonly REN_TITULO   = 8;    // :ren, {8}   — tbl_titulo
  static readonly REN_CONTENIDO = 110; // :ren, {110} — tbl_contenido
  static readonly COL           = 65;  // :col, {65}  — ambas tablas

  // ---------------------------------------------------------------------------
  // configura_tabla()
  //
  // Magik:
  //   LoTblTitulo   << property_list(:ren, {8},  :col, {65})
  //   LoTbl << .o_tablas.crea_tabla(1,1,:tbl_titulo)
  //   LoTbl.oCoordenada_Origen << .o_coord_inicio
  //   _self.asigna_medidas_tabla(LoTbl, LoTblTitulo)
  //
  //   LoTblContenido << property_list(:ren, {110}, :col, {65})
  //   LfDesplazaY << .o_tablas.longitud_total_renglones({:tbl_titulo})
  //   LfDesplazaY << LfDesplazaY + .o_tablas.longitud_total_renglones({:tbl_titulo})  ← BUG: ×2
  //   LoTbl << .o_tablas.crea_tabla(1,1,:tbl_contenido)
  //   LoTbl.oCoordenada_Origen << coordinate.new(.o_coord_inicio.x,
  //                                              .o_coord_inicio.y - LfDesplazaY)
  //   _self.asigna_medidas_tabla(LoTbl, LoTblContenido)
  // ---------------------------------------------------------------------------
  configurarTabla(): void {
    const { REN_TITULO, REN_CONTENIDO, COL } = SelloSimbologiaDiagramaEmpalmes;

    // tbl_titulo — en la coordenada de origen
    const tblTitulo = this.crearTabla(1, 1, 'tbl_titulo');
    tblTitulo.origen = { ...this.oCoordInicio };
    this.asignarMedidasTabla(tblTitulo, { renglones: REN_TITULO, columnas: COL });

    // LfDesplazaY = tbl_titulo + tbl_titulo  (×2, preservando bug del original)
    // Magik Y-up: .o_coord_inicio.y - LfDesplazaY → SVG Y-down: y + desplazaY
    const desplazaY =
      this.longitudTotalRenglones(['tbl_titulo']) +
      this.longitudTotalRenglones(['tbl_titulo']);  // BUG preservado: :tbl_titulo × 2

    const tblContenido = this.crearTabla(1, 1, 'tbl_contenido');
    tblContenido.origen = {
      x: this.oCoordInicio.x,
      y: this.oCoordInicio.y + desplazaY,  // Magik: y - desplazaY (Y-up) → SVG: y + (Y-down)
    };
    this.asignarMedidasTabla(tblContenido, { renglones: REN_CONTENIDO, columnas: COL });
  }

  // ---------------------------------------------------------------------------
  // etiqueta_celdas()
  //
  // Magik:
  //   _self.asigna_texto_celda(:tbl_titulo, 1, 1, "SIMBOLOGIA",
  //              30, :centre_centre, 0, {0.0, 0.2993, 0.0})
  //   _self.asigna_simbolo_celda(:tbl_contenido, 1, 1, "simbologia_diagrama_emp", 3)
  // ---------------------------------------------------------------------------
  etiquetarCeldas(): void {
    // Magik: 30 = tamaño fuente; :centre_centre = centrado; {0.0, 0.2993, 0.0} = verde oscuro
    this.asignarTextoCelda(
      'tbl_titulo', 1, 1,
      'SIMBOLOGIA',
      30,
      'centre_centre',
      0,
      [0.0, 0.2993, 0.0],  // RGB(0, 76, 0) — verde oscuro Magik
    );

    // Magik: "simbologia_diagrama_emp" = recurso gráfico del sistema Smallworld
    // TS: símbolo SVG inline representativo del diagrama de empalmes
    this.asignarSimboloCelda('tbl_contenido', 1, 1, 'simbologia_diagrama_emp', 3);
  }

  getTablaTitulo():    TablaLayout | undefined { return this.tablas.get('tbl_titulo');    }
  getTablaCOntenido(): TablaLayout | undefined { return this.tablas.get('tbl_contenido'); }
}

// =============================================================================
// SÍMBOLO SVG — simbologia_diagrama_emp
// Representación del recurso gráfico de Smallworld en SVG inline.
// Leyenda típica de un diagrama de empalmes de fibra óptica.
// =============================================================================

function SimboloSimbologiaDiagramaEmp({ width, height }: { width: number; height: number }) {
  const pad  = 8;
  const rowH = (height - pad * 2) / 6;
  const lineX1 = pad + 8;
  const lineX2 = lineX1 + 28;
  const lblX   = lineX2 + 8;
  const lblFS  = Math.max(7, rowH * 0.4);

  const entries: Array<{ y: number; render: React.ReactNode; label: string }> = [
    {
      y: pad + rowH * 0.5,
      label: 'Empalme de cobre',
      render: (
        <g>
          <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#333" strokeWidth={1.5} />
          <polygon
            points={`${lineX1 + 14},${-5} ${lineX1 + 20},0 ${lineX1 + 14},5 ${lineX1 + 8},0`}
            fill="white" stroke="#333" strokeWidth={1}
          />
        </g>
      ),
    },
    {
      y: pad + rowH * 1.5,
      label: 'Empalme derivación',
      render: (
        <g>
          <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#333" strokeWidth={1.5} />
          <polygon
            points={`${lineX1 + 14},${-5} ${lineX1 + 20},0 ${lineX1 + 14},5 ${lineX1 + 8},0`}
            fill="#ccc" stroke="#333" strokeWidth={1}
          />
          <line x1={lineX1 + 14} y1={0} x2={lineX1 + 14} y2={rowH * 0.8} stroke="#333" strokeWidth={1.2} />
        </g>
      ),
    },
    {
      y: pad + rowH * 2.5,
      label: 'Empalme subterráneo',
      render: (
        <g>
          <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#666" strokeWidth={1.5} strokeDasharray="4,2" />
          <circle cx={lineX1 + 14} cy={0} r={4} fill="white" stroke="#666" strokeWidth={1} />
        </g>
      ),
    },
    {
      y: pad + rowH * 3.5,
      label: 'Fibra activa',
      render: (
        <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#1565c0" strokeWidth={2} />
      ),
    },
    {
      y: pad + rowH * 4.5,
      label: 'Fibra de reserva',
      render: (
        <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#1565c0" strokeWidth={1} strokeDasharray="4,3" />
      ),
    },
    {
      y: pad + rowH * 5.5,
      label: 'Fibra cortada',
      render: (
        <g>
          <line x1={lineX1} y1={0} x2={lineX2} y2={0} stroke="#c62828" strokeWidth={1.5} />
          <line x1={lineX1 + 10} y1={-4} x2={lineX1 + 14} y2={4} stroke="#c62828" strokeWidth={1.5} />
          <line x1={lineX1 + 14} y1={-4} x2={lineX1 + 10} y2={4} stroke="#c62828" strokeWidth={1.5} />
        </g>
      ),
    },
  ];

  return (
    <g>
      {entries.map((entry, i) => (
        <g key={i} transform={`translate(0, ${entry.y})`}>
          {entry.render}
          <text x={lblX} y={lblFS * 0.35} fontSize={lblFS} fill="#333" fontFamily="sans-serif">
            {entry.label}
          </text>
        </g>
      ))}
    </g>
  );
}

// =============================================================================
// COMPONENTE REACT — demo del sello de simbología
// =============================================================================

const SCALE = 2.8;  // SVG px por unidad Magik

export function SelloSimbologiaDiagramaEmpallesUI() {
  const [oxStr, setOxStr] = useState('0');
  const [oyStr, setOyStr] = useState('0');
  const [mostrarBug, setMostrarBug] = useState(false);

  const ox = Number(oxStr) || 0;
  const oy = Number(oyStr) || 0;

  const sello = new SelloSimbologiaDiagramaEmpalmes();
  sello.oCoordInicio = { x: ox, y: oy };
  sello.configurarTabla();
  sello.etiquetarCeldas();

  const titulo    = sello.getTablaTitulo();
  const contenido = sello.getTablaCOntenido();

  if (!titulo || !contenido) return null;

  const { REN_TITULO, REN_CONTENIDO, COL } = SelloSimbologiaDiagramaEmpalmes;

  const tW = COL        * SCALE;
  const tH = REN_TITULO * SCALE;
  const cH = REN_CONTENIDO * SCALE;

  // Posiciones SVG (Y-down)
  const tY = titulo.origen.y    * SCALE;
  const cY = contenido.origen.y * SCALE;

  const gapY  = contenido.origen.y - titulo.origen.y - titulo.renglones;  // hueco en unidades
  const totalH = cY + cH + 4;
  const svgH   = Math.max(totalH + 10, 50);

  // Color título
  const titColor = titulo.texto ? colorMagikToCSS(titulo.texto.color) : '#006400';

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_simbologia_diagrama_empalmes</h3>
      <p style={s.meta}>
        Sello de simbología para planos de diagramas de empalmes.
        Dos tablas: título (<code>8×65 u.</code>) + contenido (<code>110×65 u.</code>).
      </p>

      {/* Controles */}
      <div style={s.control}>
        <label style={s.lbl}>
          oCoordInicio.x: <input type="number" value={oxStr} onChange={e => setOxStr(e.target.value)} style={s.input} />
        </label>
        <label style={s.lbl}>
          oCoordInicio.y: <input type="number" value={oyStr} onChange={e => setOyStr(e.target.value)} style={s.input} />
        </label>
        <label style={{ ...s.lbl, marginLeft: 12 }}>
          <input type="checkbox" checked={mostrarBug} onChange={e => setMostrarBug(e.target.checked)} />
          {' '}Mostrar detalle del bug LfDesplazaY
        </label>
      </div>

      {mostrarBug && (
        <div style={s.bugNote}>
          <strong>Bug preservado:</strong> <code>LfDesplazaY</code> suma dos veces <code>:tbl_titulo</code>.<br />
          <code>desplazaY = {REN_TITULO}u + {REN_TITULO}u = {REN_TITULO * 2}u</code> →
          hueco entre título y contenido = <code>{gapY}u</code> (igual que la altura del título).<br />
          Debería ser: <code>tbl_titulo ({REN_TITULO}u) + tbl_contenido ({REN_CONTENIDO}u)</code>.
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 4 }}>
        {/* SVG del sello */}
        <div>
          <svg
            width={tW + 4}
            height={svgH}
            style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}
          >
            {/* tbl_titulo */}
            <rect x={0} y={tY} width={tW} height={tH}
              fill="#f9fff9" stroke="#2E4057" strokeWidth={1} />
            {titulo.texto && (
              <text
                x={tW / 2}
                y={tY + tH / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, tH * 0.5)}
                fontWeight="bold"
                fill={titColor}
                fontFamily="sans-serif"
                letterSpacing={2}
              >
                {titulo.texto.texto}
              </text>
            )}

            {/* hueco (resultado del bug × 2) */}
            {mostrarBug && gapY > 0 && (
              <rect x={0} y={tY + tH} width={tW} height={gapY * SCALE}
                fill="#fff9c4" stroke="#f9a825" strokeWidth={0.5} strokeDasharray="3,2" />
            )}
            {mostrarBug && gapY > 0 && (
              <text x={tW / 2} y={tY + tH + (gapY * SCALE) / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill="#e65100">
                hueco = {gapY}u (×2 bug)
              </text>
            )}

            {/* tbl_contenido */}
            <rect x={0} y={cY} width={tW} height={cH}
              fill="#fafafa" stroke="#2E4057" strokeWidth={1} />
            {contenido.simbolo && (
              <SimboloSimbologiaDiagramaEmp width={tW} height={cH} />
            )}
            <text x={0} y={cY + 8} fontSize={7} fill="#bbb" fontFamily="monospace">
              {contenido.simbolo?.nombre}
            </text>
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG: {Math.round(tW)}×{Math.round(svgH)}px · escala {SCALE}px/u
          </small>
        </div>

        {/* Tabla de propiedades */}
        <div>
          <table style={s.table}>
            <thead>
              <tr>
                {['Tabla', 'Renglones', 'Columnas', 'Origen X', 'Origen Y'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f9fff9' }}>
                <td style={s.td}><code>tbl_titulo</code></td>
                <td style={{ ...s.td, textAlign: 'center' }}>{titulo.renglones}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{titulo.columnas}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{titulo.origen.x}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{titulo.origen.y}</td>
              </tr>
              <tr>
                <td style={s.td}><code>tbl_contenido</code></td>
                <td style={{ ...s.td, textAlign: 'center' }}>{contenido.renglones}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{contenido.columnas}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{contenido.origen.x}</td>
                <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{contenido.origen.y}</td>
              </tr>
            </tbody>
          </table>

          <table style={{ ...s.table, marginTop: 8 }}>
            <thead>
              <tr>
                {['Celda', 'Contenido', 'Tamaño', 'Alineación', 'Color CSS'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f9fff9' }}>
                <td style={s.td}><code>tbl_titulo [1,1]</code></td>
                <td style={{ ...s.td, fontWeight: 'bold', color: titColor }}>{titulo.texto?.texto}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{titulo.texto?.tamanio}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{titulo.texto?.alineacion}</td>
                <td style={s.td}>
                  <span style={{ background: titColor, color: '#fff', padding: '1px 6px', borderRadius: 2, fontSize: 11, fontFamily: 'monospace' }}>
                    {titColor}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={s.td}><code>tbl_contenido [1,1]</code></td>
                <td style={{ ...s.td, fontStyle: 'italic', color: '#666' }}>{contenido.simbolo?.nombre}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{contenido.simbolo?.tamanio}</td>
                <td style={{ ...s.td, color: '#aaa' }}>—</td>
                <td style={{ ...s.td, color: '#aaa' }}>símbolo SVG inline</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Color Magik <code>&#123;0.0, 0.2993, 0.0&#125;</code> →{' '}
        <code>{colorMagikToCSS([0.0, 0.2993, 0.0])}</code> (R×255, G×255, B×255).
        Símbolo <code>"simbologia_diagrama_emp"</code> = recurso gráfico Smallworld → SVG inline representativo.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title  : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta   : { color: '#666', fontSize: 12, margin: '2px 0' },
  control: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl    : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  input  : { width: 60, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  bugNote: { padding: '6px 10px', background: '#fff9c4', border: '1px solid #f9a825', borderRadius: 3, fontSize: 11, lineHeight: 1.6 },
  table  : { borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloSimbologiaDiagramaEmpallesUI;
