/**
 * Migración de: c_sello_notas_sct_inst_puente_tn.magik
 * Clase Magik:  c_sello_notas_sct_inst_puente_tn  —  package user
 * Hereda:       c_sello_notas_sct  (→ CSelloNotasSct en SelloNotasSctCruzAereo.tsx)
 *
 * Genera la sección "Notas Generales" del sello SCT para planos de
 * instalación lateral en puente con tubo negro (TN).
 *
 * Diferencias respecto a c_sello_notas_sct_cruz_aereo (clase hermana):
 *   - Fila 2: 160 mm (vs 110 mm)   ← más notas (5-11 vs 5-8)
 *   - Columna: 170 mm (vs 160 mm)
 *   - Notas específicas de puente: anclaje en resina epóxica, pintura
 *     anticorrosiva, señalamiento vial, responsabilidad TELMEX.
 */

import React, { useState } from 'react';

// Reutiliza la clase base y tipos definidos en la migración de la clase hermana
import {
  CSelloNotasSct,
  type TablaNotasConfig,
  type CeldaTexto,
  type Coord2D,
} from './SelloNotasSctCruzAereo';

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSelloNotasSctInstPuenteTn extends CSelloNotasSct {

  /**
   * Magik: c_sello_notas_sct_inst_puente_tn.prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)
   *
   *   LoTblTitulo << _self.oTablas.crea_tabla(2, 1, :tbl_notas_grales)
   *   LoTblTitulo.oCoordenada_Origen << RoCoord
   *   LoTblTitulo.oRenglones.elemento(1).nLongitud << 10
   *   LoTblTitulo.oRenglones.elemento(2).nLongitud << 160   ← 160 mm (≠ cruz_aereo:110)
   *   LoTblTitulo.oColumnas.elemento(1).nLongitud  << 170   ← 170 mm (≠ cruz_aereo:160)
   */
  prvCreaCfgTblNotasGrales(coord: Coord2D): TablaNotasConfig {
    const tabla: TablaNotasConfig = {
      id:         'tbl_notas_grales',
      rows:       2,
      cols:       1,
      rowHeights: [10, 160],    // renglón 1: 10 mm (título) | renglón 2: 160 mm (contenido)
      colWidths:  [170],        // columna única: 170 mm
      origen:     { ...coord },
    };
    this.tablas.push(tabla);
    return tabla;
  }

  /**
   * Magik: c_sello_notas_sct_inst_puente_tn.prvAsignaTexto()
   *
   * 1. _super.prvAsignaTexto()  ← notas genéricas SCT 1-4
   *
   * 2. Notas 5-11 específicas de instalación en puente con tubo negro:
   *
   *    Nota 5:  Verificación de ubicación de instalación lateral en puente
   *             con tubo negro y .s_tipo_cable en .s_estado
   *    Nota 6:  Sin interrumpir tránsito; superficie libre de obstáculos
   *    Nota 7:  Fijación con barrenanclas en resina epóxica;
   *             PROHIBIDAS las pistolas explosivas
   *    Nota 8:  Pintura anticorrosiva para protección del tubo
   *    Nota 9:  Conforme a especificaciones generales SCT y residencia
   *    Nota 10: Daños al pavimento/acotamiento/cuneta → reparación por TELMEX
   *    Nota 11: Señales preventivas/restrictivas/informativas según
   *             Manual de Dispositivos SCT 1986
   *
   * 3. Append a celda (2,1) de tbl_notas_grales.
   */
  prvAsignaTexto(): void {
    // _super.prvAsignaTexto() — notas genéricas 1-4 del padre
    const textoBase = this.prvAsignaTextoBase();

    // LsTexto — notas específicas de instalación en puente con tubo negro (5-11)
    let lsTexto = '\n';

    // Nota 5
    lsTexto += ` 5.- LA UBICACIÓN DE LA INSTALACIÓN LATERAL EN PUENTE CON TUBO NEGRO CON CABLE DE `;
    lsTexto += `${this.sTipoCable}\n`;
    lsTexto += ` INDICADA EN ESTE PROYECTO DEBERÁ SER VERIFICADA Y PRECISADA EN EL LUGAR POR LA RESIDENCIA\n`;
    lsTexto += ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.sEstado}.\n\n`;

    // Nota 6
    lsTexto += ` 6.- LA INSTALACIÓN DEL TUBO NEGRO CON CABLE DE ${this.sTipoCable} EN PUENTE, SE HARÁ \n`;
    lsTexto += ` SIN INTERRUMPIR EL TRÁNSITO, PARA LO CUAL DEBERÁ ESTAR LA SUPERFICIE DE RODAMIENTO LIBRE \n`;
    lsTexto += ` DE OBSTÁCULOS COMO SON PIEDRAS, ARENA, BASURA, HERRAMIENTA, ETC. \n\n`;

    // Nota 7
    lsTexto += ` 7.- LA INSTALACIÓN DEL TUBO NEGRO CON CABLE DE ${this.sTipoCable} QUE SE INDICA EN,\n`;
    lsTexto += ` ESTE PROYECTO, DEBERÁ FIJARSE EN LA SUBESTRUCTURA DEL PUENTE CON BARRENANCLAS AHOGADAS \n`;
    lsTexto += ` EN RESINA EPOXICA, QUEDANDO ABSOLUTAMENTE PROHIBIDO EL USO DE PISTOLAS EXPLOSIVAS.\n\n`;

    // Nota 8
    lsTexto += ` 8.- EN LA PROTECCION Y APARIENCIA DEL TUBO DEBERÁ USARSE PINTURA ANTICORROSIVA.\n\n`;

    // Nota 9
    lsTexto += ` 9.- TODOS LOS TRABAJOS DEBERÁN HACERSE DE ACUERDO CON LAS ESPECIFICACIONES GENERALES \n`;
    lsTexto += ` DE CONSTRUCCIÓN DE ESTA SECRETARÍA Y LAS INDICACIONES ADICIONALES DE LA RESIDENCIA GE-\n`;
    lsTexto += ` NERAL DE CONSERVACIÓN DE CARRETERAS EN ESA ENTIDAD. \n\n`;

    // Nota 10
    lsTexto += ` 10.- CUALQUIER DAÑO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SEÑALAMIENTO \n`;
    lsTexto += ` DEBERÁ SER REPARADO DE INMEDIATO POR CUENTA DE TELÉFONOS DE MÉXICO, S.A. DE C.V. DE \n`;
    lsTexto += ` ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS EN\n`;
    lsTexto += ` ESA ENTIDAD.\n\n`;

    // Nota 11
    lsTexto += ` 11.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A. \n`;
    lsTexto += ` DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES- \n`;
    lsTexto += ` RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE  CONSERVACIÓN DE CARRE- \n`;
    lsTexto += ` TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- \n`;
    lsTexto += ` EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICIÓN 1986.\n\n`;

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

/** Diferencias de dimensión vs la clase hermana cruz_aereo */
const DIFF_BADGE = (valor: number, ref: number) =>
  valor !== ref
    ? <span style={{ marginLeft: 6, fontSize: 9, background: '#fff3cd', padding: '1px 5px', borderRadius: 8 }}>
        ≠ cruz_aereo:{ref}
      </span>
    : null;

export function SelloNotasSctInstPuenteTnUI() {
  const [tipoCable, setTipoCable] = useState('FIBRA ÓPTICA');
  const [estado,    setEstado]    = useState('JALISCO');
  const [result,    setResult]    = useState<{
    tabla:  TablaNotasConfig;
    celdas: CeldaTexto[];
  } | null>(null);

  const generar = () => {
    const inst = new CSelloNotasSctInstPuenteTn(tipoCable, estado);
    setResult(inst.build({ x: 0, y: 0 }));
  };

  const SCALE = 2.0;   // 1mm → px (más comprimido porque la tabla es mayor)
  const tabla  = result?.tabla;
  const celda21 = result?.celdas.find(c => c.row === 2 && c.col === 1);

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_notas_sct_inst_puente_tn — Notas SCT instalación puente (TN)</h3>

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

          {/* Vista esquemática de la tabla */}
          <div>
            <p style={s.subtitle}>Estructura tabla — tbl_notas_grales</p>
            <div style={{ border: '1px solid #888', display: 'inline-block' }}>
              {/* Fila 1: título — 10mm × 170mm */}
              <div style={{
                width:  tabla.colWidths[0]  * SCALE,
                height: tabla.rowHeights[0] * SCALE,
                border: '1px solid #888', background: '#2E4057',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  NOTAS GENERALES  [fila 1 — {tabla.rowHeights[0]} mm]
                </span>
              </div>
              {/* Fila 2: contenido — 160mm × 170mm */}
              <div style={{
                width:  tabla.colWidths[0]  * SCALE,
                height: tabla.rowHeights[1] * SCALE,
                border: '1px solid #888', background: '#f0f7ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#888', fontSize: 9 }}>
                  celda (2,1) — {tabla.rowHeights[1]} mm  [notas 1–11]
                </span>
              </div>
            </div>
            <p style={s.meta}>{tabla.colWidths[0]} mm ancho × {tabla.rowHeights.reduce((a,b)=>a+b,0)} mm alto</p>

            {/* Comparativa con clase hermana */}
            <table style={{ ...s.table, marginTop: 8, fontSize: 10 }}>
              <thead>
                <tr>
                  {['Dimensión','inst_puente_tn','cruz_aereo'].map(h =>
                    <th key={h} style={{ ...s.th, fontSize: 10, padding:'3px 6px' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['rowHeights[1]', 160, 110],
                  ['colWidths[0]',  170, 160],
                  ['Notas',         '5-11', '5-8'],
                ].map(([dim, val, ref]) => (
                  <tr key={String(dim)}>
                    <td style={{ ...s.td, fontSize:10 }}>{dim}</td>
                    <td style={{ ...s.td, fontSize:10, fontWeight:'bold', color:'#2E4057' }}>
                      <code>{val}</code>
                    </td>
                    <td style={{ ...s.td, fontSize:10, color:'#888' }}><code>{ref}</code></td>
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
              <td style={s.td}>
                <code>[10, 160]</code>
                {DIFF_BADGE(tabla.rowHeights[1], 110)}
              </td>
              <td style={s.td}>
                <code>[170]</code>
                {DIFF_BADGE(tabla.colWidths[0], 160)}
              </td>
              <td style={s.td}><code>({tabla.origen.x}, {tabla.origen.y})</code></td>
            </tr>
          </tbody>
        </table>
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
  textBox  : { margin:0, fontSize:9.5, lineHeight:1.5, background:'#f8f8f8', border:'1px solid #ddd', borderRadius:3, padding:'8px 10px', overflowX:'auto' as const, whiteSpace:'pre-wrap' as const, maxHeight:320, overflowY:'auto' as const },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'5px 8px', textAlign:'left' as const, fontSize:11 },
  td       : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:11, verticalAlign:'middle' as const },
};

export default SelloNotasSctInstPuenteTnUI;
