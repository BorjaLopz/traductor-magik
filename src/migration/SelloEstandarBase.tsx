/**
 * Migración de: c_sello_estandar_base.magik
 * Clase Magik:  c_sello_estandar_base — hereda c_base_sello_cobre
 *
 * Sello base de plano de cobre: 4 tablas horizontales (ubicación · compañía ·
 * fecha/dibujo/revisó · escala). Proporciona la estructura y datos comunes a
 * todos los sellos estándar derivados.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Equivale al property_list .pl_datos de la clase */
export interface PlDatos {
  fecha:               string;   // .o_proyecto.mes_anio
  proyectaEmpresa:     string;   // .o_proyecto.proyecta_empresa
  revisaEmpresa:       string;   // .o_proyecto.revisa_empresa
  ubicacion:           string;   // .o_proyecto.ubicacion
  delegacionMunicipio: string;   // .o_proyecto.Delegacion_Municipio
  colonia:             string;   // .o_proyecto.colonia
  nombrePlano:         string;   // _self.nombre_plano()
}

/** Abstrae swg_dsn_admin_engine + .o_proyecto */
export interface SelloEstandarBaseService {
  obtenerDatosProyecto(): Promise<PlDatos>;
  /** _self.tipo_plano() */
  obtenerTipoPlano(): Promise<string>;
  /** _self.escala() — solo si tipo_plano no es principales/diagrama_empalmes */
  obtenerEscala(): Promise<string>;
  /** swg_dsn_admin_engine.active_scheme.project.name.matches?("*FALC*") */
  esProyectoFalc(): Promise<boolean>;
}

/** Resultado de llenaDatosCeldas() — datos para pintar las celdas dinámicas */
export interface CellData {
  nombrePlano:     string;   // ubicacion + nombre_plano, wrapped, uppercase
  fecha:           string;
  proyectaEmpresa: string;
  revisaEmpresa:   string;
  escala:          string;
}

/** Definición de una tabla (equivale a crea_tabla + asigna_medidas_tabla) */
export interface TableDef {
  id:                     string;
  filas:                  number[];   // alturas de renglon en mm
  columnas:               number[];   // anchos de columna en mm
  x:                      number;     // origen X relativo al inicio
  y:                      number;     // origen Y relativo al inicio
  sinBordes?:             boolean;    // oculta los 4 bordes (caso FALC)
  sinRenglonesInternos?:  boolean;    // bDibuja_Renglones_Internos? = _false
}

/** Layout completo de las 4 tablas */
export interface TableLayout {
  tblUbicacion: TableDef;
  tblCompania:  TableDef;
  tblFecDibRev: TableDef;
  tblEscala:    TableDef;
}

// =============================================================================
// MOCK SERVICE
// =============================================================================

export const mockSelloEstandarBaseService: SelloEstandarBaseService = {
  async obtenerDatosProyecto() {
    return {
      fecha:               'MAY/2025',
      proyectaEmpresa:     'ING. A. ALARCÓN',
      revisaEmpresa:       'ING. R. HERNÁNDEZ',
      ubicacion:           'COL. VALLEJO / ALCALDÍA GUSTAVO A. MADERO',
      delegacionMunicipio: 'GUSTAVO A. MADERO',
      colonia:             'VALLEJO',
      nombrePlano:         'RED SECUNDARIA FO ZONA NORTE',
    };
  },
  async obtenerTipoPlano() { return 'ruta_cables'; },
  async obtenerEscala()    { return '1:2000'; },
  async esProyectoFalc()   { return false; },
};

// =============================================================================
// CLASE PRINCIPAL
// Magik: def_slotted_exemplar(:c_sello_estandar_base, {pl_datos}, :c_base_sello_cobre)
// =============================================================================

// Anchos/altos base de las 4 tablas (mm) — de asigna_medidas_tabla en Magik
const W_UBIC = 15;   // tbl_ubicacion  col width
const W_COMP = 25;   // tbl_compania   col width
const W_FDR1 = 15;   // tbl_FecDibRev  col 1
const W_FDR2 = 20;   // tbl_FecDibRev  col 2
const H_UBIC = 274;  // tbl_ubicacion  row height

// Offset Y para las tablas derechas: -(longitud_total_renglones(tbl_ubicacion) - 150)
const DESP_Y = -(H_UBIC - 150);   // = -124 mm

// Tipos de plano que usan "F/E" como escala
const TIPOS_FUERA_ESCALA = new Set(['principales', 'diagrama_empalmes']);

export class CSelloEstandarBase {

  // Magik: {:pl_datos, _unset, :writable}
  private plDatos:    PlDatos | null = null;
  private sTipoPlano: string         = '';

  // ── configura_tabla ──────────────────────────────────────────────────────────
  // Magik: crea 4 tablas con crea_tabla() + asigna_medidas_tabla().
  // Calcula posiciones acumulando anchos de tablas previas.
  configurarTabla(esFalc: boolean): TableLayout {
    return {
      tblUbicacion: {
        id:         'tbl_ubicacion',
        filas:      [H_UBIC],              // pl_ubicacion[:ren] = {274}
        columnas:   [W_UBIC],             // pl_ubicacion[:col] = {15}
        x: 0,
        y: 0,
        // Magik: si *FALC* → ocultar los 4 bordes de la celda
        sinBordes:  esFalc,
      },
      tblCompania: {
        id:         'tbl_compania',
        filas:      [5, 5, 5],             // pl_compania[:ren] = {5,5,5}
        columnas:   [W_COMP],             // pl_compania[:col] = {25}
        x: W_UBIC,                        // ln_desp_x = longitud_total_columnas({:tbl_ubicacion})
        y: DESP_Y,
        sinRenglonesInternos: true,       // bDibuja_Renglones_Internos? << _false
      },
      tblFecDibRev: {
        id:         'tbl_FecDibRev',
        filas:      [5, 5, 5],             // pl_fec_div_rev[:ren] = {5,5,5}
        columnas:   [W_FDR1, W_FDR2],    // pl_fec_div_rev[:col] = {15,20}
        x: W_UBIC + W_COMP,              // acumula anchos previos
        y: DESP_Y,
      },
      tblEscala: {
        id:         'tbl_escala',
        filas:      [5, 10],              // pl_escala[:ren] = {5,10}
        columnas:   [W_UBIC],            // pl_escala[:col] = {15}
        x: W_UBIC + W_COMP + W_FDR1 + W_FDR2,
        y: DESP_Y,
      },
    };
  }

  // ── etiqueta_celdas ──────────────────────────────────────────────────────────
  // Magik: asigna_texto_celda con textos estáticos de cabecera
  etiquetarCeldas() {
    return {
      compania:  ['RED NACIONAL', ' LTIMA MILLA', 'S.A.P.I. DE C.V.'],  // filas 1-3 col 1
      fecDibRev: ['FECHA', 'DIBUJO', 'REVISO'],                           // filas 1-3 col 1
      escala:    'ESCALA',                                                  // fila 1 col 1
    };
  }

  // ── Lógica de word-wrap de nombre de plano ───────────────────────────────────
  // Magik: split_by(" / "), acumula segmentos, inserta %newline solo una vez
  // si la línea acumulada supera 170 caracteres.
  private envuelveNombrePlano(nombrePlano: string): string {
    const segmentos  = nombrePlano.split(' / ');
    let   resultado  = '';
    let   saltoHecho = false;   // saltolinea? << _false

    for (const segmento of segmentos) {
      // Insertar salto solo la primera vez que supere 170 chars
      if ((resultado.length + segmento.length + 1) > 170 && !saltoHecho) {
        resultado  += '\n';
        saltoHecho  = true;
      }
      // Magik: _if ubicacion2.size > 2 _then "+= ' / '+seg" _else "+= seg"
      resultado += resultado.length > 2 ? ` / ${segmento}` : segmento;
    }
    return resultado;
  }

  // ── obten_registros ──────────────────────────────────────────────────────────
  // Magik: obtiene tipo_plano y rellena .pl_datos desde .o_proyecto
  async obtenerRegistros(service: SelloEstandarBaseService): Promise<void> {
    this.sTipoPlano = await service.obtenerTipoPlano();
    this.plDatos    = await service.obtenerDatosProyecto();
  }

  // ── llena_datos_celdas ───────────────────────────────────────────────────────
  // Magik: construye ls_nombre_plano, lo envuelve, asigna a celdas dinámicas.
  // La celda de ubicacion se rota 90°.
  llenaDatosCeldas(): Omit<CellData, 'escala'> | null {
    if (!this.plDatos) return null;

    // Magik: ubicacion + " / " + %newline + nombre_plano → split_by → rebuild
    const base = `${this.plDatos.ubicacion} / \n${this.plDatos.nombrePlano}`;
    const nombrePlano = this.envuelveNombrePlano(base).toUpperCase();

    return {
      nombrePlano,                              // celda tbl_ubicacion(1,1) + giro 90°
      fecha:           this.plDatos.fecha,      // tbl_FecDibRev(1,2)
      proyectaEmpresa: this.plDatos.proyectaEmpresa,  // tbl_FecDibRev(2,2)
      revisaEmpresa:   this.plDatos.revisaEmpresa,    // tbl_FecDibRev(3,2)
    };
  }

  // ── llena_datos_dinamicos ────────────────────────────────────────────────────
  // Magik: si tipo_plano es :principales o :diagrama_empalmes → "F/E" (fuera escala)
  async llenaDatosDinamicos(service: SelloEstandarBaseService): Promise<string> {
    if (TIPOS_FUERA_ESCALA.has(this.sTipoPlano)) return 'F/E';
    return service.obtenerEscala();
  }

  // ── Pipeline completo ────────────────────────────────────────────────────────
  async generarSello(service: SelloEstandarBaseService): Promise<{
    layout:   TableLayout;
    labels:   ReturnType<CSelloEstandarBase['etiquetarCeldas']>;
    cellData: CellData;
    esFalc:   boolean;
  }> {
    const esFalc = await service.esProyectoFalc();
    await this.obtenerRegistros(service);

    const layout   = this.configurarTabla(esFalc);
    const labels   = this.etiquetarCeldas();
    const partial  = this.llenaDatosCeldas()!;
    const escala   = await this.llenaDatosDinamicos(service);

    return { layout, labels, cellData: { ...partial, escala }, esFalc };
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

const PX = 3.2;   // factor mm → px para visualización

function TableBlock({ def, children, style }: {
  def:      TableDef;
  children?: React.ReactNode;
  style?:   React.CSSProperties;
}) {
  const w = def.columnas.reduce((a, b) => a + b, 0) * PX;
  const h = def.filas.reduce((a, b) => a + b, 0) * PX;
  return (
    <div style={{
      position:  'absolute',
      left:      def.x * PX,
      top:       Math.abs(def.y) * PX,   // y negativo en Magik → offset hacia abajo
      width:     w,
      height:    h,
      border:    def.sinBordes ? 'none' : '1px solid #333',
      boxSizing: 'border-box',
      overflow:  'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SelloEstandarBaseUI({ service = mockSelloEstandarBaseService }: {
  service?: SelloEstandarBaseService;
}) {
  const [result,  setResult]  = useState<Awaited<ReturnType<CSelloEstandarBase['generarSello']>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const generar = async () => {
    setLoading(true);
    setError(null);
    try {
      const sello = new CSelloEstandarBase();
      setResult(await sello.generarSello(service));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const r = result;

  // Ancho total de las 4 tablas: 15+25+35+15 = 90 mm
  const totalW = (W_UBIC + W_COMP + W_FDR1 + W_FDR2 + W_UBIC) * PX;
  // Altura visual: altura de tbl_ubicacion
  const totalH = H_UBIC * PX;

  return (
    <div style={s.wrap}>
      <h3 style={s.h3}>c_sello_estandar_base</h3>

      <button style={s.btn} onClick={generar} disabled={loading}>
        {loading ? 'Generando…' : 'Generar sello'}
      </button>
      {error && <p style={s.err}>{error}</p>}

      {r && (
        <>
          {/* Visualización del sello */}
          <div style={{ ...s.canvas, width: totalW, height: totalH }}>

            {/* tbl_ubicacion — texto rotado 90° */}
            <TableBlock def={r.layout.tblUbicacion} style={{ background: r.esFalc ? '#fff8e1' : '#fff' }}>
              <div style={s.ubicCell}>
                <span style={s.ubicText}>{r.cellData.nombrePlano}</span>
              </div>
            </TableBlock>

            {/* tbl_compania — sin líneas internas */}
            <TableBlock def={r.layout.tblCompania} style={{ background: '#f0f4ff' }}>
              {r.labels.compania.map((txt, i) => (
                <div key={i} style={{
                  ...s.cell,
                  height:     r.layout.tblCompania.filas[i] * PX,
                  borderBottom: i < 2 && !r.layout.tblCompania.sinRenglonesInternos
                    ? '1px solid #ccc' : 'none',
                  fontWeight: 'bold',
                  fontSize:   9,
                }}>{txt}</div>
              ))}
            </TableBlock>

            {/* tbl_FecDibRev — 3 filas × 2 cols */}
            <TableBlock def={r.layout.tblFecDibRev}>
              {r.labels.fecDibRev.map((lbl, i) => (
                <div key={i} style={{ display: 'flex', height: r.layout.tblFecDibRev.filas[i] * PX }}>
                  <div style={{ ...s.cell, width: W_FDR1 * PX, borderRight: '1px solid #ccc', fontSize: 9 }}>{lbl}</div>
                  <div style={{ ...s.cell, width: W_FDR2 * PX, fontSize: 9, color: '#0969da' }}>
                    {i === 0 ? r.cellData.fecha
                     : i === 1 ? r.cellData.proyectaEmpresa
                     : r.cellData.revisaEmpresa}
                  </div>
                </div>
              ))}
            </TableBlock>

            {/* tbl_escala — 2 filas */}
            <TableBlock def={r.layout.tblEscala} style={{ background: '#f9f9f9' }}>
              <div style={{ ...s.cell, height: r.layout.tblEscala.filas[0] * PX, fontSize: 9 }}>
                {r.labels.escala}
              </div>
              <div style={{ ...s.cell, height: r.layout.tblEscala.filas[1] * PX, fontSize: 11,
                            fontWeight: 'bold', color: '#0969da' }}>
                {r.cellData.escala}
              </div>
            </TableBlock>

          </div>

          {/* Tabla de datos calculados */}
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Campo</th>
                <th style={s.th}>Valor calculado</th>
                <th style={s.th}>Método Magik</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Nombre plano (wrapped)', r.cellData.nombrePlano.replace('\n','↵'), 'llena_datos_celdas()'],
                ['Fecha',            r.cellData.fecha,            'pl_datos[:fecha]'],
                ['Proyecta empresa', r.cellData.proyectaEmpresa,  'pl_datos[:proyecta_empresa]'],
                ['Revisa empresa',   r.cellData.revisaEmpresa,    'pl_datos[:revisa_empresa]'],
                ['Escala',           r.cellData.escala,           'llena_datos_dinamicos()'],
                ['Es proyecto FALC', String(r.esFalc),            'project.name.matches?("*FALC*")'],
              ].map(([campo, val, magik]) => (
                <tr key={campo}>
                  <td style={s.td}>{campo}</td>
                  <td style={{ ...s.td, fontWeight: 'bold' }}>{val}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{magik}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap     : { fontFamily: 'sans-serif', fontSize: 13 },
  h3       : { margin: '0 0 12px', fontSize: 14, fontWeight: 'bold' },
  btn      : { padding: '5px 16px', background: '#2E4057', color: '#fff',
               border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 16 },
  err      : { color: '#c00', fontSize: 12 },
  canvas   : { position: 'relative', border: '2px solid #333', marginBottom: 20,
               background: '#fff', overflow: 'visible' },
  ubicCell : { width: '100%', height: '100%', display: 'flex',
               alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ubicText : { writingMode: 'vertical-rl', transform: 'rotate(180deg)',
               fontSize: 8, textAlign: 'center', whiteSpace: 'pre', lineHeight: 1.2 },
  cell     : { display: 'flex', alignItems: 'center', justifyContent: 'center',
               padding: '0 2px', textAlign: 'center', fontSize: 10, lineHeight: 1.2 },
  tbl      : { borderCollapse: 'collapse', width: '100%', fontSize: 12 },
  th       : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' },
  td       : { border: '1px solid #ddd', padding: '4px 10px' },
};

export default SelloEstandarBaseUI;
