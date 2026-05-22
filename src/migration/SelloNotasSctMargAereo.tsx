/**
 * Migración de: c_sello_notas_sct_marg_aereo.magik
 * Clase Magik:  c_sello_notas_sct_marg_aereo  —  package user
 * Hereda:       c_sello_notas_sct  →  CSelloNotasSct (SelloNotasSctCruzAereo.tsx)
 *
 * Genera la sección "Notas Generales" del sello SCT para planos de
 * instalación marginal aérea con postes a lo largo de carretera.
 *
 * Diferencias de dimensión vs hermanas:
 *   rowHeights[1]: 120 mm  (cruz_aereo:110 | puente_tn:160)
 *   colWidths[0]:  160 mm  (= cruz_aereo   | puente_tn:170)
 * Notas específicas 5-8 sobre instalación marginal aérea con postes.
 */

import React, { useState } from 'react';

import {
  CSelloNotasSct,
  type TablaNotasConfig,
  type CeldaTexto,
  type Coord2D,
} from './SelloNotasSctCruzAereo';

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSelloNotasSctMargAereo extends CSelloNotasSct {

  /**
   * Magik: c_sello_notas_sct_marg_aereo.prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)
   *
   *   crea_tabla(2, 1, :tbl_notas_grales)
   *   oRenglones.elemento(1).nLongitud << 10
   *   oRenglones.elemento(2).nLongitud << 120   ← 120 mm (≠ cruz_aereo:110 / puente_tn:160)
   *   oColumnas.elemento(1).nLongitud  << 160   ← 160 mm (= cruz_aereo, ≠ puente_tn:170)
   */
  prvCreaCfgTblNotasGrales(coord: Coord2D): TablaNotasConfig {
    const tabla: TablaNotasConfig = {
      id:         'tbl_notas_grales',
      rows:       2,
      cols:       1,
      rowHeights: [10, 120],   // renglón 1: 10 mm título | renglón 2: 120 mm contenido
      colWidths:  [160],       // columna única: 160 mm
      origen:     { ...coord },
    };
    this.tablas.push(tabla);
    return tabla;
  }

  /**
   * Magik: c_sello_notas_sct_marg_aereo.prvAsignaTexto()
   *
   * 1. _super.prvAsignaTexto()  ← notas genéricas SCT 1-4
   *
   * 2. Notas 5-8 — instalación marginal aérea con postes:
   *
   *    Nota 5: Verificación de ubicación de instalación marginal aérea
   *            con .s_tipo_cable en .s_estado
   *    Nota 6: Instalación conforme a residencia + recomendaciones
   *            derivadas de inspecciones en campo
   *    Nota 7: Franja paralela al eje del camino ≤ 2.50 m desde
   *            el límite del derecho de vía
   *    Nota 8: Cruzamientos subterráneos/aéreos derivados de esta
   *            instalación deben solicitarse por separado con plano
   *
   * 3. Append a celda (2,1) de tbl_notas_grales.
   */
  prvAsignaTexto(): void {
    // _super.prvAsignaTexto() — notas genéricas 1-4
    const textoBase = this.prvAsignaTextoBase();

    // LsTexto — notas 5-8 para instalación marginal aérea con postes
    let lsTexto = '\n';

    // Nota 5 — verificación de ubicación
    lsTexto += ` 5.- LA UBICACIÓN DE LA INSTALACIÓN MARGINAL AÉREA CON CABLE DE ${this.sTipoCable} \n`;
    lsTexto += ` INDICADO EN ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA\n`;
    lsTexto += ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.sEstado}.\n\n`;

    // Nota 6 — conformidad con residencia + inspecciones en campo
    lsTexto += ` 6.- LA INSTALACIÓN MARGINAL AÉREA CON POSTES Y CABLE DE ${this.sTipoCable} QUE SE \n`;
    lsTexto += ` INDICA EN ESTE PROYECTO DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES DE LA \n`;
    lsTexto += ` RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS, ASÍ COMO LAS RECOMENDACIONES \n`;
    lsTexto += ` QUE SEAN DERIVADAS DE LAS INSPECCIONES EN CAMPO.\n\n`;

    // Nota 7 — franja paralela ≤ 2.50 m del derecho de vía
    lsTexto += ` 7.- LA INSTALACIÓN MARGINAL AÉREA CON POSTES Y CABLE DE ${this.sTipoCable} QUE SE \n`;
    lsTexto += ` INDICA EN ESTE PROYECTO DENTRO DEL ÁREA DEL DERECHO DE VÍA, DEBERÁ EFECTUARSE EN \n`;
    lsTexto += ` UNA FRANJA PARALELA AL EJE DEL CAMINO CON UN ANCHO NO MAYOR DE 2.50 M. MEDIDOS A \n`;
    lsTexto += ` PARTIR DEL LIMITE DEL DERECHO DE VÍA. \n\n`;

    // Nota 8 — cruzamientos derivados deben solicitarse por separado
    lsTexto += ` 8.- LOS CRUZAMIENTOS SUBTERRÁNEOS Y/O AÉREOS CON CABLE ${this.sTipoCable},\n`;
    lsTexto += ` QUE SE PRETENDAN EFECTUAR DERIVADOS DE ESTA INSTALACIÓN MARGINAL AÉREA DEBERÁN \n`;
    lsTexto += ` SOLICITARSE POR SEPARADO, PRESENTANDO PLANO DETALLADO DEL PROYECTO DEL CRUZAMIENTO. `;

    // oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
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
// =============================================================================

const CABLES_EJEMPLO = ['FIBRA ÓPTICA', 'COBRE', 'COAXIAL', 'PAR TRENZADO'];
const ESTADOS_EJEMPLO = [
  'JALISCO', 'NUEVO LEÓN', 'VERACRUZ', 'PUEBLA', 'GUANAJUATO',
  'CHIHUAHUA', 'SONORA', 'OAXACA', 'MICHOACÁN', 'TAMAULIPAS',
];

/** Tabla comparativa de la familia c_sello_notas_sct_* */
const FAMILIA: { clase: string; fila2: number; col: number; notas: string }[] = [
  { clase: 'cruz_aereo',     fila2: 110, col: 160, notas: '5-8'  },
  { clase: 'inst_puente_tn', fila2: 160, col: 170, notas: '5-11' },
  { clase: 'marg_aereo',     fila2: 120, col: 160, notas: '5-8'  },
];

export function SelloNotasSctMargAereoUI() {
  const [tipoCable, setTipoCable] = useState('FIBRA ÓPTICA');
  const [estado,    setEstado]    = useState('JALISCO');
  const [result,    setResult]    = useState<{
    tabla:  TablaNotasConfig;
    celdas: CeldaTexto[];
  } | null>(null);

  const generar = () => {
    const inst = new CSelloNotasSctMargAereo(tipoCable, estado);
    setResult(inst.build({ x: 0, y: 0 }));
  };

  const SCALE = 2.4;
  const tabla   = result?.tabla;
  const celda21 = result?.celdas.find(c => c.row === 2 && c.col === 1);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_notas_sct_marg_aereo — Notas SCT instalación marginal aérea</h3>

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
        <button style={s.btn} onClick={generar}>Generar sello (build)</button>
      </div>

      {result && tabla && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

          {/* Vista esquemática */}
          <div>
            <p style={s.subtitle}>Estructura tabla — tbl_notas_grales</p>
            <div style={{ border: '1px solid #888', display: 'inline-block' }}>
              <div style={{
                width: tabla.colWidths[0] * SCALE, height: tabla.rowHeights[0] * SCALE,
                border: '1px solid #888', background: '#2E4057',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  NOTAS GENERALES  [{tabla.rowHeights[0]} mm]
                </span>
              </div>
              <div style={{
                width: tabla.colWidths[0] * SCALE, height: tabla.rowHeights[1] * SCALE,
                border: '1px solid #888', background: '#f0f7ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#888', fontSize: 9 }}>
                  celda (2,1) — {tabla.rowHeights[1]} mm  [notas 1–8]
                </span>
              </div>
            </div>
            <p style={s.meta}>{tabla.colWidths[0]} mm × {tabla.rowHeights.reduce((a,b)=>a+b,0)} mm</p>

            {/* Tabla comparativa familia */}
            <p style={{ ...s.subtitle, marginTop: 8 }}>Familia c_sello_notas_sct_*</p>
            <table style={{ ...s.table, fontSize: 10 }}>
              <thead>
                <tr>{['Clase','fila2 (mm)','col (mm)','Notas'].map(h =>
                  <th key={h} style={{ ...s.th, fontSize: 10, padding: '3px 6px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {FAMILIA.map(f => (
                  <tr key={f.clase} style={{
                    background: f.clase === 'marg_aereo' ? '#e8f5e9' : undefined,
                    fontWeight: f.clase === 'marg_aereo' ? 'bold'     : undefined,
                  }}>
                    <td style={{ ...s.td, fontSize: 10 }}>
                      {f.clase === 'marg_aereo' ? '▶ ' : ''}{f.clase}
                    </td>
                    <td style={{ ...s.td, fontSize: 10, textAlign: 'center' as const }}>
                      <code>{f.fila2}</code>
                    </td>
                    <td style={{ ...s.td, fontSize: 10, textAlign: 'center' as const }}>
                      <code>{f.col}</code>
                    </td>
                    <td style={{ ...s.td, fontSize: 10, textAlign: 'center' as const }}>
                      {f.notas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Texto generado */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <p style={s.subtitle}>Contenido celda (2,1) — sTexto acumulado</p>
            <pre style={s.textBox}>{celda21?.texto ?? '—'}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:620, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  controls : { display:'flex', flexDirection:'column', gap:8 },
  inputRow : { display:'flex', alignItems:'center', gap:8 },
  lbl      : { minWidth:220, fontSize:11, color:'#555' },
  sel      : { padding:'3px 8px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  btn      : { alignSelf:'flex-start', padding:'6px 16px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta     : { margin:'4px 0 0', fontSize:10, color:'#888' },
  textBox  : { margin:0, fontSize:9.5, lineHeight:1.5, background:'#f8f8f8', border:'1px solid #ddd', borderRadius:3, padding:'8px 10px', whiteSpace:'pre-wrap' as const, maxHeight:300, overflowY:'auto' as const },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'5px 8px', textAlign:'left' as const, fontSize:11 },
  td       : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default SelloNotasSctMargAereoUI;
