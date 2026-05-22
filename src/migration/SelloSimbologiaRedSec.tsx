/**
 * Migración de: c_sello_simbologia_red_sec.magik
 * Clase Magik:  c_sello_simbologia_red_sec  —  Sigma Tao / lgranados / 2008
 * Hereda:       c_base_sello_fibra  (importado desde SelloSimbologiaDiagramaEmpalmes.tsx)
 *
 * Cuadro de simbología para planos de red secundaria de fibra óptica.
 * Tres tablas apiladas:
 *   tbl_titulo   — 1×1  (8 reng × 130 col)  — "SIMBOLOGIA DE LA RED SECUNDARIA"
 *   tbl_titulo2  — 1×3  (8 reng × 60+35+35) — cabecera tripartita DESCRIPCION/EXIST/PROYE
 *   tbl_contenido — 1×1 (110 reng × 130 col) — símbolo gráfico de la red secundaria
 *
 * configura_tabla():
 *   LfDesplazaY acumula correctamente: tbl_titulo → tbl_titulo2 → tbl_contenido (sin bug).
 *
 * etiqueta_celdas():
 *   Tres celdas en tbl_titulo2 (cols 1,2,3) — el stub base sólo almacena 1 texto/tabla,
 *   por eso se sobreescribe asignarTextoCelda() para manejar tbl_titulo2 con Map propio.
 *
 * Conversión de coordenadas:
 *   Magik Y-up: .o_coord_inicio.y - LfDesplazaY  →  SVG Y-down: y + desplazaY
 */

import React, { useState } from 'react';
import type { Coordenada, ColorMagik, CeldaTexto, TablaLayout } from './SelloSimbologiaDiagramaEmpalmes';
import { CBaseSelloFibra } from './SelloSimbologiaDiagramaEmpalmes';

// colorMagikToCSS no está exportada en el fichero base — se redefine localmente
function colorMagikToCSS([r, g, b]: ColorMagik): string {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

// =============================================================================
// CLASE PRINCIPAL — c_sello_simbologia_red_sec
// =============================================================================

export class SelloSimbologiaRedSec extends CBaseSelloFibra {

  // Dimensiones de layout (constantes del Magik original)
  static readonly REN_TITULO    =   8;   // :ren, {8}    — tbl_titulo
  static readonly REN_TITULO2   =   8;   // :ren, {8}    — tbl_titulo2
  static readonly REN_CONTENIDO = 110;   // :ren, {110}  — tbl_contenido
  static readonly COL_TOTAL     = 130;   // ancho total de todas las tablas
  // Magik: :col, {60, 35, 35} — anchos de las 3 columnas de tbl_titulo2
  static readonly COLS_TITULO2  = [60, 35, 35] as const;

  // tbl_titulo2 tiene 3 celdas independientes (col 1, 2, 3).
  // El stub base almacena un único CeldaTexto por tabla (ignora fila/col).
  // Se usa un Map propio para las 3 celdas de esta tabla.
  private celdas2: Map<number, CeldaTexto> = new Map();  // key = col (1-based)

  // ---------------------------------------------------------------------------
  // Override de asignarTextoCelda — intercepta tbl_titulo2 para multi-celda
  //
  // Magik:
  //   _self.asigna_texto_celda(:tbl_titulo2, 1, 1, "DESCRIPCION",  ...)
  //   _self.asigna_texto_celda(:tbl_titulo2, 1, 2, "RED EXISTENTE", ...)
  //   _self.asigna_texto_celda(:tbl_titulo2, 1, 3, "RED PROYECTADA",...)
  // ---------------------------------------------------------------------------
  protected override asignarTextoCelda(
    tablaId   : string,
    fila      : number,
    col       : number,
    texto     : string,
    tamanio   : number,
    alineacion: CeldaTexto['alineacion'],
    rotacion  : number,
    color     : ColorMagik,
  ): void {
    if (tablaId === 'tbl_titulo2') {
      // Guarda por columna en vez de sobreescribir un único campo
      this.celdas2.set(col, { texto, tamanio, alineacion, rotacion, color });
      return;
    }
    super.asignarTextoCelda(tablaId, fila, col, texto, tamanio, alineacion, rotacion, color);
  }

  // ---------------------------------------------------------------------------
  // configura_tabla()
  //
  // Magik:
  //   # tbl_titulo
  //   LoTblTitulo << property_list(:ren,{8}, :col,{130})
  //   LoTbl << .o_tablas.crea_tabla(1,1,:tbl_titulo)
  //   LoTbl.oCoordenada_Origen << .o_coord_inicio
  //   _self.asigna_medidas_tabla(LoTbl, LoTblTitulo)
  //
  //   # tbl_titulo2
  //   LoTblTitulo2 << property_list(:ren,{8}, :col,{60,35,35})
  //   LfDesplazaY << .o_tablas.longitud_total_renglones({:tbl_titulo})    ← 8
  //   LoTbl2 << .o_tablas.crea_tabla(1,3,:tbl_titulo2)
  //   LoTbl2.oCoordenada_Origen << coordinate.new(.o_coord_inicio.x,
  //                                .o_coord_inicio.y - LfDesplazaY)
  //   _self.asigna_medidas_tabla(LoTbl2, LoTblTitulo2)
  //
  //   # tbl_contenido
  //   LoTblContenido << property_list(:ren,{110}, :col,{130})
  //   LfDesplazaY << LfDesplazaY + .o_tablas.longitud_total_renglones({:tbl_titulo2})  ← 16
  //   LoTbl << .o_tablas.crea_tabla(1,1,:tbl_contenido)
  //   LoTbl.oCoordenada_Origen << coordinate.new(.o_coord_inicio.x,
  //                                .o_coord_inicio.y - LfDesplazaY)
  //   _self.asigna_medidas_tabla(LoTbl, LoTblContenido)
  // ---------------------------------------------------------------------------
  configurarTabla(): void {
    const { REN_TITULO, REN_TITULO2, REN_CONTENIDO, COL_TOTAL } = SelloSimbologiaRedSec;

    // tbl_titulo en la coordenada de origen
    const tblTitulo = this.crearTabla(1, 1, 'tbl_titulo');
    tblTitulo.origen = { ...this.oCoordInicio };
    this.asignarMedidasTabla(tblTitulo, { renglones: REN_TITULO, columnas: COL_TOTAL });

    // LfDesplazaY = altura de tbl_titulo (8 unidades)
    // Magik Y-up: y - desplazaY  →  SVG Y-down: y + desplazaY
    const desplazaY1 = this.longitudTotalRenglones(['tbl_titulo']);

    const tblTitulo2 = this.crearTabla(1, 3, 'tbl_titulo2');
    tblTitulo2.origen = {
      x: this.oCoordInicio.x,
      y: this.oCoordInicio.y + desplazaY1,
    };
    // columnas totales = 60+35+35 = 130; anchos individuales en COLS_TITULO2
    this.asignarMedidasTabla(tblTitulo2, { renglones: REN_TITULO2, columnas: COL_TOTAL });

    // LfDesplazaY += altura de tbl_titulo2 → total = 16 (acumulación correcta, sin bug)
    const desplazaY2 = desplazaY1 + this.longitudTotalRenglones(['tbl_titulo2']);

    const tblContenido = this.crearTabla(1, 1, 'tbl_contenido');
    tblContenido.origen = {
      x: this.oCoordInicio.x,
      y: this.oCoordInicio.y + desplazaY2,
    };
    this.asignarMedidasTabla(tblContenido, { renglones: REN_CONTENIDO, columnas: COL_TOTAL });
  }

  // ---------------------------------------------------------------------------
  // etiqueta_celdas()
  //
  // Magik:
  //   _self.asigna_texto_celda(:tbl_titulo, 1,1,"SIMBOLOGIA DE LA RED SECUNDARIA",
  //              30,:centre_centre,0,{0.0,0.2993,0.0})
  //   _self.asigna_texto_celda(:tbl_titulo2,1,1,"DESCRIPCION",
  //              20,:centre_centre,0,{0.0,0.2993,0.0})
  //   _self.asigna_texto_celda(:tbl_titulo2,1,2,"RED EXISTENTE",
  //              20,:centre_centre,0,{0.0,0.2993,0.0})
  //   _self.asigna_texto_celda(:tbl_titulo2,1,3,"RED PROYECTADA",
  //              20,:centre_centre,0,{0.0,0.2993,0.0})
  //   _self.asigna_simbolo_celda(:tbl_contenido,1,1,"simbologia_de_la_red_sec",3)
  // ---------------------------------------------------------------------------
  etiquetarCeldas(): void {
    const verde: ColorMagik = [0.0, 0.2993, 0.0];  // rgb(0,76,0) — verde oscuro Magik

    this.asignarTextoCelda(
      'tbl_titulo', 1, 1,
      'SIMBOLOGIA DE LA RED SECUNDARIA', 30, 'centre_centre', 0, verde,
    );

    // Las 3 siguientes van al Map propio celdas2 (override captura tbl_titulo2)
    this.asignarTextoCelda('tbl_titulo2', 1, 1, 'DESCRIPCION',    20, 'centre_centre', 0, verde);
    this.asignarTextoCelda('tbl_titulo2', 1, 2, 'RED EXISTENTE',  20, 'centre_centre', 0, verde);
    this.asignarTextoCelda('tbl_titulo2', 1, 3, 'RED PROYECTADA', 20, 'centre_centre', 0, verde);

    this.asignarSimboloCelda('tbl_contenido', 1, 1, 'simbologia_de_la_red_sec', 3);
  }

  getTablaTitulo():    TablaLayout | undefined { return this.tablas.get('tbl_titulo');    }
  getTablaTitulo2():   TablaLayout | undefined { return this.tablas.get('tbl_titulo2');   }
  getTablaContenido(): TablaLayout | undefined { return this.tablas.get('tbl_contenido'); }
  /** Celdas individuales de tbl_titulo2 (cols 1, 2, 3) */
  getCeldasTitulo2():  Map<number, CeldaTexto> { return this.celdas2; }
}

// =============================================================================
// SÍMBOLO SVG — simbologia_de_la_red_sec
// Representación del recurso gráfico de Smallworld en SVG inline.
// Leyenda de la red secundaria: 3 columnas (descripción / existente / proyectado).
// =============================================================================

interface RedSecEntry {
  label    : string;
  existente: React.ReactNode;
  proyectado: React.ReactNode;
}

function SimboloRedSec(
  { width, height, col1W, col2W, col3W }:
  { width: number; height: number; col1W: number; col2W: number; col3W: number },
) {
  const pad  = 6;
  const rows: RedSecEntry[] = [
    {
      label: 'CABLE SUBTERRÁNEO FO',
      existente : <line x1={4} y1={0} x2={col2W - 4} y2={0} stroke="#1a237e" strokeWidth={2} />,
      proyectado: <line x1={4} y1={0} x2={col3W - 4} y2={0} stroke="#1a237e" strokeWidth={2} strokeDasharray="5,3" />,
    },
    {
      label: 'CABLE AÉREO FO',
      existente : (
        <g>
          <line x1={4} y1={0} x2={col2W - 4} y2={0} stroke="#e65100" strokeWidth={1.5} />
          {[0.25, 0.5, 0.75].map(t => (
            <circle key={t} cx={4 + (col2W - 8) * t} cy={0} r={2.5}
              fill="white" stroke="#e65100" strokeWidth={1} />
          ))}
        </g>
      ),
      proyectado: (
        <g>
          <line x1={4} y1={0} x2={col3W - 4} y2={0} stroke="#e65100" strokeWidth={1.5} strokeDasharray="5,3" />
          {[0.35, 0.7].map(t => (
            <circle key={t} cx={4 + (col3W - 8) * t} cy={0} r={2.5}
              fill="white" stroke="#e65100" strokeWidth={1} />
          ))}
        </g>
      ),
    },
    {
      label: 'CONDUCTO PVC',
      existente : <line x1={4} y1={0} x2={col2W - 4} y2={0} stroke="#00838f" strokeWidth={3} />,
      proyectado: <line x1={4} y1={0} x2={col3W - 4} y2={0} stroke="#00838f" strokeWidth={3} strokeDasharray="5,3" />,
    },
    {
      label: 'CÁMARA DE EMPALME',
      existente : <rect x={(col2W - 10) / 2} y={-5} width={10} height={10}
                    fill="white" stroke="#4a148c" strokeWidth={1.5} />,
      proyectado: <rect x={(col3W - 10) / 2} y={-5} width={10} height={10}
                    fill="white" stroke="#4a148c" strokeWidth={1.5} strokeDasharray="3,2" />,
    },
    {
      label: 'EMPALME FO',
      existente : (
        <polygon
          points={`${col2W / 2},${-6} ${col2W / 2 + 7},0 ${col2W / 2},6 ${col2W / 2 - 7},0`}
          fill="white" stroke="#2e7d32" strokeWidth={1.5}
        />
      ),
      proyectado: (
        <polygon
          points={`${col3W / 2},${-6} ${col3W / 2 + 7},0 ${col3W / 2},6 ${col3W / 2 - 7},0`}
          fill="white" stroke="#2e7d32" strokeWidth={1.5} strokeDasharray="3,2"
        />
      ),
    },
    {
      label: 'NODO / ODF',
      existente : <circle cx={col2W / 2} cy={0} r={6}
                    fill="white" stroke="#b71c1c" strokeWidth={1.5} />,
      proyectado: <circle cx={col3W / 2} cy={0} r={6}
                    fill="white" stroke="#b71c1c" strokeWidth={1.5} strokeDasharray="3,2" />,
    },
  ];

  const rowH  = (height - pad * 2) / rows.length;
  const lbl   = { fs: Math.max(6, rowH * 0.38), fill: '#333' };
  const x2    = col1W;                    // start of col2
  const x3    = col1W + col2W;            // start of col3
  const divX2 = x2;
  const divX3 = x3;

  return (
    <g>
      {/* Divisiones de columnas */}
      <line x1={divX2} y1={0} x2={divX2} y2={height} stroke="#bbb" strokeWidth={0.5} />
      <line x1={divX3} y1={0} x2={divX3} y2={height} stroke="#bbb" strokeWidth={0.5} />

      {rows.map((r, i) => {
        const cy = pad + rowH * i + rowH / 2;
        return (
          <g key={i}>
            {/* Separador de filas */}
            {i > 0 && (
              <line x1={0} y1={pad + rowH * i} x2={width} y2={pad + rowH * i}
                stroke="#eee" strokeWidth={0.5} />
            )}
            {/* Col 1: descripción */}
            <text x={4} y={cy + lbl.fs * 0.35} fontSize={lbl.fs}
              fill={lbl.fill} fontFamily="sans-serif">
              {r.label}
            </text>
            {/* Col 2: red existente */}
            <g transform={`translate(${x2}, ${cy})`}>
              {r.existente}
            </g>
            {/* Col 3: red proyectada */}
            <g transform={`translate(${x3}, ${cy})`}>
              {r.proyectado}
            </g>
          </g>
        );
      })}
    </g>
  );
}

// =============================================================================
// COMPONENTE REACT — demo del sello de simbología de red secundaria
// =============================================================================

const SCALE = 2.0;  // SVG px por unidad Magik

export function SelloSimbologiaRedSecUI() {
  const [oxStr, setOxStr] = useState('0');
  const [oyStr, setOyStr] = useState('0');

  const ox = Number(oxStr) || 0;
  const oy = Number(oyStr) || 0;

  const sello = new SelloSimbologiaRedSec();
  sello.oCoordInicio = { x: ox, y: oy };
  sello.configurarTabla();
  sello.etiquetarCeldas();

  const titulo    = sello.getTablaTitulo();
  const titulo2   = sello.getTablaTitulo2();
  const contenido = sello.getTablaContenido();
  const celdas2   = sello.getCeldasTitulo2();

  if (!titulo || !titulo2 || !contenido) return null;

  const { REN_TITULO, REN_TITULO2, REN_CONTENIDO, COL_TOTAL, COLS_TITULO2 } = SelloSimbologiaRedSec;

  const totalW = COL_TOTAL * SCALE;
  const tH     = REN_TITULO    * SCALE;
  const t2H    = REN_TITULO2   * SCALE;
  const cH     = REN_CONTENIDO * SCALE;
  const svgH   = tH + t2H + cH + 4;

  // Posiciones Y (SVG Y-down, ya convertidas en configurarTabla)
  const tY  = titulo.origen.y    * SCALE;
  const t2Y = titulo2.origen.y   * SCALE;
  const cY  = contenido.origen.y * SCALE;

  const verde    = colorMagikToCSS([0.0, 0.2993, 0.0]);

  // Anchos de columnas de tbl_titulo2 en px
  const [cw1, cw2, cw3] = COLS_TITULO2.map(c => c * SCALE);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_simbologia_red_sec</h3>
      <p style={s.meta}>
        Sello de simbología — red secundaria FO.
        Tres tablas: título (<code>8×130 u.</code>) + cabecera 3 columnas (<code>8×60+35+35 u.</code>)
        + contenido (<code>110×130 u.</code>).
      </p>

      {/* Controles */}
      <div style={s.control}>
        <label style={s.lbl}>
          oCoordInicio.x:
          <input type="number" value={oxStr} onChange={e => setOxStr(e.target.value)} style={s.input} />
        </label>
        <label style={s.lbl}>
          oCoordInicio.y:
          <input type="number" value={oyStr} onChange={e => setOyStr(e.target.value)} style={s.input} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>

        {/* SVG del sello */}
        <div>
          <svg
            width={totalW + 2}
            height={svgH + 2}
            style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}
          >
            {/* tbl_titulo — 1×1, texto centrado verde */}
            <rect x={0} y={tY} width={totalW} height={tH}
              fill="#f9fff9" stroke="#2E4057" strokeWidth={1} />
            {titulo.texto && (
              <text
                x={totalW / 2} y={tY + tH / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={Math.max(8, tH * 0.5)} fontWeight="bold"
                fill={verde} fontFamily="sans-serif" letterSpacing={1}
              >
                {titulo.texto.texto}
              </text>
            )}

            {/* tbl_titulo2 — 1×3, tres celdas con anchos distintos */}
            <rect x={0} y={t2Y} width={totalW} height={t2H}
              fill="#f9fff9" stroke="#2E4057" strokeWidth={1} />
            {/* Col 1: DESCRIPCION */}
            <line x1={cw1}       y1={t2Y} x2={cw1}       y2={t2Y + t2H} stroke="#2E4057" strokeWidth={0.8} />
            <line x1={cw1 + cw2} y1={t2Y} x2={cw1 + cw2} y2={t2Y + t2H} stroke="#2E4057" strokeWidth={0.8} />
            {[1, 2, 3].map(col => {
              const cell = celdas2.get(col);
              const xOff = col === 1 ? 0 : col === 2 ? cw1 : cw1 + cw2;
              const cw   = col === 1 ? cw1 : cw2;
              return cell ? (
                <text key={col}
                  x={xOff + cw / 2} y={t2Y + t2H / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={Math.max(6, t2H * 0.42)} fontWeight="bold"
                  fill={verde} fontFamily="sans-serif"
                >
                  {cell.texto}
                </text>
              ) : null;
            })}

            {/* tbl_contenido — símbolo gráfico de la red secundaria */}
            <rect x={0} y={cY} width={totalW} height={cH}
              fill="#fafafa" stroke="#2E4057" strokeWidth={1} />
            <g transform={`translate(0, ${cY})`}>
              <SimboloRedSec
                width={totalW}
                height={cH}
                col1W={cw1}
                col2W={cw2}
                col3W={cw3}
              />
            </g>
            <text x={2} y={cY + 8} fontSize={6} fill="#ccc" fontFamily="monospace">
              {contenido.simbolo?.nombre}
            </text>
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG: {Math.round(totalW)}×{Math.round(svgH)}px · escala {SCALE}px/u
          </small>
        </div>

        {/* Tablas de propiedades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Layout de las 3 tablas */}
          <table style={s.table}>
            <thead>
              <tr>
                {['Tabla', 'Renglones', 'Columnas', 'Origen X', 'Origen Y'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'tbl_titulo',    t: titulo    },
                { id: 'tbl_titulo2',   t: titulo2   },
                { id: 'tbl_contenido', t: contenido },
              ].map(({ id, t }, i) => (
                <tr key={id} style={{ background: i % 2 === 0 ? '#f9fff9' : '#fff' }}>
                  <td style={s.td}><code>{id}</code></td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{t.renglones}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    {id === 'tbl_titulo2'
                      ? `${COLS_TITULO2[0]}+${COLS_TITULO2[1]}+${COLS_TITULO2[2]}`
                      : t.columnas}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{t.origen.x}</td>
                  <td style={{ ...s.td, textAlign: 'center', fontFamily: 'monospace' }}>{t.origen.y}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Celdas asignadas */}
          <table style={s.table}>
            <thead>
              <tr>
                {['Celda', 'Texto / Símbolo', 'Tam.', 'Color CSS'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* tbl_titulo [1,1] */}
              {titulo.texto && (
                <tr style={{ background: '#f9fff9' }}>
                  <td style={s.td}><code>tbl_titulo [1,1]</code></td>
                  <td style={{ ...s.td, fontWeight: 'bold', color: verde }}>{titulo.texto.texto}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{titulo.texto.tamanio}</td>
                  <td style={s.td}>
                    <span style={{ background: verde, color: '#fff', padding: '1px 6px', borderRadius: 2, fontSize: 10, fontFamily: 'monospace' }}>
                      {verde}
                    </span>
                  </td>
                </tr>
              )}
              {/* tbl_titulo2 celdas 1-3 */}
              {[1, 2, 3].map(col => {
                const cell = celdas2.get(col);
                return cell ? (
                  <tr key={col} style={{ background: col % 2 === 0 ? '#fff' : '#f9fff9' }}>
                    <td style={s.td}><code>tbl_titulo2 [1,{col}]</code></td>
                    <td style={{ ...s.td, color: verde }}>{cell.texto}</td>
                    <td style={{ ...s.td, textAlign: 'center' }}>{cell.tamanio}</td>
                    <td style={s.td}>
                      <span style={{ background: verde, color: '#fff', padding: '1px 6px', borderRadius: 2, fontSize: 10, fontFamily: 'monospace' }}>
                        {verde}
                      </span>
                    </td>
                  </tr>
                ) : null;
              })}
              {/* tbl_contenido [1,1] — símbolo */}
              {contenido.simbolo && (
                <tr>
                  <td style={s.td}><code>tbl_contenido [1,1]</code></td>
                  <td style={{ ...s.td, fontStyle: 'italic', color: '#666' }}>{contenido.simbolo.nombre}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>{contenido.simbolo.tamanio}</td>
                  <td style={{ ...s.td, color: '#aaa' }}>símbolo SVG inline</td>
                </tr>
              )}
            </tbody>
          </table>

          <p style={{ ...s.meta, maxWidth: 420 }}>
            Color Magik <code>&#123;0.0, 0.2993, 0.0&#125;</code> →{' '}
            <code>{verde}</code>.{' '}
            Símbolo <code>"simbologia_de_la_red_sec"</code> = recurso gráfico Smallworld → SVG inline.{' '}
            Acumulación <code>LfDesplazaY</code> correcta (sin bug): tbl_titulo ({REN_TITULO}u) +
            tbl_titulo2 ({REN_TITULO2}u) = {REN_TITULO + REN_TITULO2}u para tbl_contenido.
          </p>
        </div>
      </div>
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
  table  : { borderCollapse: 'collapse' },
  th     : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td     : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloSimbologiaRedSecUI;
