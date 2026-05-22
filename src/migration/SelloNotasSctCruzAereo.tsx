/**
 * Migración de: c_sello_notas_sct_cruz_aereo.magik
 * Clase Magik:  c_sello_notas_sct_cruz_aereo  —  package user
 * Hereda:       c_sello_notas_sct
 *
 * Genera la sección de "Notas Generales" del sello SCT para planos de
 * cruzamiento aéreo de cable. Define la tabla de notas (2 filas × 1 col)
 * y construye el texto reglamentario de las notas 5-8 con valores
 * dinámicos: tipo de cable y estado.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Coordenada de origen de la tabla en u.m. del plano. */
export interface Coord2D { x: number; y: number; }

/**
 * Configuración de tabla de notas SCT.
 * Magik: oTablas.crea_tabla(rows, cols, :id)
 *         oRenglones.elemento(n).nLongitud
 *         oColumnas.elemento(n).nLongitud
 */
export interface TablaNotasConfig {
  id:          string;
  rows:        number;
  cols:        number;
  rowHeights:  number[];   // oRenglones[n].nLongitud — en mm
  colWidths:   number[];   // oColumnas[n].nLongitud  — en mm
  origen:      Coord2D;
}

/** Contenido de celda acumulado en el sello. */
export interface CeldaTexto {
  tableId: string;
  row:     number;
  col:     number;
  texto:   string;
}

// =============================================================================
// CLASE BASE STUB — c_sello_notas_sct
// Abstrae el comportamiento heredado (prvAsignaTexto del padre)
// =============================================================================

export abstract class CSelloNotasSct {

  /** Magik: .s_tipo_cable — slot del padre con el tipo de cable */
  protected sTipoCable: string;

  /** Magik: .s_estado — slot del padre con el estado de la república */
  protected sEstado: string;

  protected celdas: CeldaTexto[] = [];
  protected tablas: TablaNotasConfig[] = [];

  constructor(tipoCable: string, estado: string) {
    this.sTipoCable = tipoCable;
    this.sEstado    = estado;
  }

  /**
   * Magik: _super.prvAsignaTexto()
   * Texto base que el padre asigna (notas 1-4 genéricas SCT).
   * Stub en TS — se implementará cuando se migre c_sello_notas_sct.
   */
  protected prvAsignaTextoBase(): string {
    return (
      ' 1.- LOS TRABAJOS DEBERÁN EFECTUARSE DE ACUERDO A LAS ESPECIFICACIONES\n' +
      ' GENERALES DE CONSTRUCCIÓN DE CARRETERAS DE LA S.C.T.\n\n' +
      ' 2.- EL CONTRATISTA SERÁ RESPONSABLE DE OBTENER LOS PERMISOS Y\n' +
      ' LICENCIAS NECESARIOS PARA LA EJECUCIÓN DE LOS TRABAJOS.\n\n' +
      ' 3.- TODOS LOS MATERIALES A UTILIZAR DEBERÁN SER NUEVOS Y DE\n' +
      ' PRIMERA CALIDAD.\n\n' +
      ' 4.- LOS TRABAJOS DEBERÁN REALIZARSE SIN INTERRUMPIR EL TRÁFICO\n' +
      ' VEHICULAR EN LA CARRETERA.\n\n'
    );
  }

  abstract prvCreaCfgTblNotasGrales(coord: Coord2D): TablaNotasConfig;
  abstract prvAsignaTexto(): void;

  /** Ejecuta el ciclo completo: crea tabla → asigna texto. */
  build(coord: Coord2D): { tabla: TablaNotasConfig; celdas: CeldaTexto[] } {
    const tabla = this.prvCreaCfgTblNotasGrales(coord);
    this.prvAsignaTexto();
    return { tabla, celdas: this.celdas };
  }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSelloNotasSctCruzAereo extends CSelloNotasSct {

  /**
   * Magik: c_sello_notas_sct_cruz_aereo.prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)
   *
   *   LoTblTitulo << _self.oTablas.crea_tabla(2, 1, :tbl_notas_grales)
   *   LoTblTitulo.oCoordenada_Origen << RoCoord
   *   LoTblTitulo.oRenglones.elemento(1).nLongitud << 10    ← fila título
   *   LoTblTitulo.oRenglones.elemento(2).nLongitud << 110   ← fila contenido
   *   LoTblTitulo.oColumnas.elemento(1).nLongitud  << 160   ← única columna
   */
  prvCreaCfgTblNotasGrales(coord: Coord2D): TablaNotasConfig {
    const tabla: TablaNotasConfig = {
      id:         'tbl_notas_grales',
      rows:       2,
      cols:       1,
      rowHeights: [10, 110],    // renglón 1: 10mm (título), renglón 2: 110mm (notas)
      colWidths:  [160],        // columna única: 160mm
      origen:     { ...coord },
    };
    this.tablas.push(tabla);
    return tabla;
  }

  /**
   * Magik: c_sello_notas_sct_cruz_aereo.prvAsignaTexto()
   *
   * 1. _super.prvAsignaTexto()  ← notas genéricas SCT (1-4)
   *
   * 2. Construye LsTexto con las notas 5-8 para cruzamiento aéreo:
   *
   *    Nota 5: verificación de ubicación del cruzamiento aéreo por
   *            residencia de conservación en .s_estado
   *    Nota 6: cruzamiento con postes según indicaciones de la residencia
   *    Nota 7: gálibo mínimo entre rasante y .s_tipo_cable ≥ 8.00 m
   *    Nota 8: postes fuera del derecho de vía o en franja ≤ 2.50 m
   *
   * 3. _self.oTablas.elemento(:tbl_notas_grales)
   *      .oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
   *    → Appends el texto a la celda (2,1) de tbl_notas_grales.
   */
  prvAsignaTexto(): void {
    // _super.prvAsignaTexto() — notas genéricas del padre (1-4)
    const textoBase = this.prvAsignaTextoBase();

    // LsTexto — notas específicas de cruzamiento aéreo (5-8)
    // Magik: character.newLine ≡ '\n'  |  LsTexto +<< ... ≡ concatenación
    let lsTexto = '\n';
    lsTexto += ` 5.- LA UBICACIÓN DEL CRUZAMIENTO AÉREO CON CABLE DE ${this.sTipoCable} INDICADO EN \n`;
    lsTexto += ' ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR, POR LA RESIDENCIA GENERAL \n';
    lsTexto += ` DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.sEstado}\n\n`;

    lsTexto += ' 6.- EL CRUZAMIENTO AÉREO CON POSTES, DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES DE \n';
    lsTexto += ' LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS. \n\n';

    lsTexto += ` 7.- EL GÁLIBO O DISTANCIA LIBRE EXISTENTE ENTRE LA RASANTE DE LA CARRETERA Y EL CABLE DE \n`;
    lsTexto += ` ${this.sTipoCable}, DEBERÁ SER NO MENOR DE 8.00 M. \n\n`;

    lsTexto += ' 8.- LA COLOCACIÓN DE LOS  POSTES DEBERÁN SER FUERA DEL ÁREA DEL DERECHO DE VÍA O DENTRO \n';
    lsTexto += ' DE UNA FRANJA NO MAYOR DE 2.50 M. DE ANCHO EN AMBOS LADOS DE LA CARRETERA, MEDIDOS A \n';
    lsTexto += ' PARTIR DEL LIMITE DEL DERECHO DE VÍA. \n';

    // oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
    // Celda (2,1): fila 2 (contenido), columna 1
    this.celdas.push({
      tableId: 'tbl_notas_grales',
      row:     2,
      col:     1,
      texto:   textoBase + lsTexto,
    });
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Inputs: tipoCable + estado → genera y previsualiza el sello de notas SCT.
// =============================================================================

const CABLES_EJEMPLO = ['FIBRA ÓPTICA', 'COBRE', 'COAXIAL', 'PAR TRENZADO'];
const ESTADOS_EJEMPLO = [
  'JALISCO', 'NUEVO LEÓN', 'VERACRUZ', 'PUEBLA', 'GUANAJUATO',
  'CHIHUAHUA', 'SONORA', 'OAXACA', 'MICHOACÁN', 'TAMAULIPAS',
];

export function SelloNotasSctCruzAereoUI() {
  const [tipoCable, setTipoCable] = useState('FIBRA ÓPTICA');
  const [estado,    setEstado]    = useState('JALISCO');
  const [result,    setResult]    = useState<{
    tabla:  TablaNotasConfig;
    celdas: CeldaTexto[];
  } | null>(null);

  const generar = () => {
    const inst = new CSelloNotasSctCruzAereo(tipoCable, estado);
    setResult(inst.build({ x: 0, y: 0 }));
  };

  // Escala visual: 1 mm → px (comprimido para caber en pantalla)
  const SCALE = 2.8;
  const tabla = result?.tabla;
  const celda21 = result?.celdas.find(c => c.row === 2 && c.col === 1);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_notas_sct_cruz_aereo — Notas SCT cruzamiento aéreo</h3>

      {/* Controles */}
      <div style={s.controls}>
        <div style={s.inputRow}>
          <label style={s.lbl}>Tipo de cable (.s_tipo_cable)</label>
          <select style={s.sel} value={tipoCable}
            onChange={e => { setTipoCable(e.target.value); setResult(null); }}>
            {CABLES_EJEMPLO.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={s.inputRow}>
          <label style={s.lbl}>Estado (.s_estado)</label>
          <select style={s.sel} value={estado}
            onChange={e => { setEstado(e.target.value); setResult(null); }}>
            {ESTADOS_EJEMPLO.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <button style={s.btn} onClick={generar}>
          Generar sello (build)
        </button>
      </div>

      {result && tabla && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

          {/* Vista esquemática de la tabla (proporciones reales) */}
          <div>
            <p style={s.subtitle}>Estructura tabla — tbl_notas_grales</p>
            <div style={{ border: '1px solid #888', display: 'inline-block' }}>
              {/* Fila 1: título — 10mm × 160mm */}
              <div style={{
                width:  tabla.colWidths[0]  * SCALE,
                height: tabla.rowHeights[0] * SCALE,
                border: '1px solid #888',
                background: '#2E4057',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  NOTAS GENERALES  [fila 1 — {tabla.rowHeights[0]} mm]
                </span>
              </div>
              {/* Fila 2: contenido — 110mm × 160mm */}
              <div style={{
                width:  tabla.colWidths[0]  * SCALE,
                height: tabla.rowHeights[1] * SCALE,
                border: '1px solid #888',
                background: '#f0f7ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#888', fontSize: 9 }}>
                  celda (2,1) — {tabla.rowHeights[1]} mm
                </span>
              </div>
            </div>
            {/* Medidas */}
            <p style={s.meta}>
              {tabla.colWidths[0]} mm ancho × {tabla.rowHeights.reduce((a,b)=>a+b,0)} mm alto
            </p>
          </div>

          {/* Texto completo generado */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={s.subtitle}>
              Contenido celda (2,1) — sTexto acumulado
            </p>
            <pre style={s.textBox}>
              {celda21?.texto ?? '—'}
            </pre>
          </div>
        </div>
      )}

      {/* Tabla de configuración */}
      {result && tabla && (
        <table style={s.table}>
          <thead>
            <tr>{['id','rows','cols','rowHeights (mm)','colWidths (mm)','origen'].map(h =>
              <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}><code>{tabla.id}</code></td>
              <td style={s.td}>{tabla.rows}</td>
              <td style={s.td}>{tabla.cols}</td>
              <td style={s.td}><code>{JSON.stringify(tabla.rowHeights)}</code></td>
              <td style={s.td}><code>{JSON.stringify(tabla.colWidths)}</code></td>
              <td style={s.td}><code>({tabla.origen.x}, {tabla.origen.y})</code></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:600, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  controls : { display:'flex', flexDirection:'column', gap:8 },
  inputRow : { display:'flex', alignItems:'center', gap:8 },
  lbl      : { minWidth:220, fontSize:11, color:'#555' },
  sel      : { padding:'3px 8px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  btn      : { alignSelf:'flex-start', padding:'6px 16px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta     : { margin:'4px 0 0', fontSize:10, color:'#888' },
  textBox  : { margin:0, fontSize:9.5, lineHeight:1.5, background:'#f8f8f8', border:'1px solid #ddd', borderRadius:3, padding:'8px 10px', overflowX:'auto' as const, whiteSpace:'pre-wrap' as const, maxHeight:280, overflowY:'auto' as const },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'5px 8px', textAlign:'left' as const, fontSize:11 },
  td       : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default SelloNotasSctCruzAereoUI;
