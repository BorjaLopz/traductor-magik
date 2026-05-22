/**
 * Migración de: c_sello_notas_sct_marg_sub.magik
 * Clase Magik:  c_sello_notas_sct_marg_sub  —  _package user
 * Hereda:       c_sello_notas_sct  (importado desde SelloNotasSctInstPuente.tsx)
 *
 * Sello de notas SCT para instalación marginal subterránea de cable en carretera.
 *
 * Nuevo slot respecto al padre:
 *   .s_instalacion  → sInstalacion (tipo de instalación marginal, p.ej. "SUBTERRÁNEA")
 *
 * Diferencias de layout vs c_sello_notas_sct_inst_puente:
 *   renglón 2 : 265mm  (vs 170mm en inst_puente)
 *   columna 1 : 170mm  (vs 165mm en inst_puente)
 *
 * Métodos transcritos:
 *   prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)  → tabla 2×1 (10mm+265mm, 170mm ancho)
 *   prvAsignaTexto()                        → _super notas 1-4 + notas 5-15 inst. marginal
 *
 * Magik → TypeScript:
 *   character.newLine            '\n'
 *   LsTexto +<< "..."            texto += '...'
 *   .s_instalacion               this.sInstalacion
 *   .s_tipo_cable                this.sTipoCable    (heredado de SelloNotasSct)
 *   .s_estado                    this.sEstado       (heredado de SelloNotasSct)
 *   _super.prvAsignaTexto()      super.prvAsignarTexto()
 *   oTablas.elemento(:id).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
 *                                celda('id',2,1).sTexto += texto
 */

import React, { useState } from 'react';
import type { Coordenada, TablaNota } from './SelloNotasSctInstPuente';
import { SelloNotasSct } from './SelloNotasSctInstPuente';

// =============================================================================
// CLASE PRINCIPAL — c_sello_notas_sct_marg_sub
// =============================================================================

export class SelloNotasSctMargSub extends SelloNotasSct {

  /** Magik: .s_instalacion — tipo de instalación marginal (p.ej. "SUBTERRÁNEA") */
  sInstalacion: string = '';

  // ---------------------------------------------------------------------------
  // prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)  [private]
  //
  // Magik:
  //   LoTblTitulo << _self.oTablas.crea_tabla(2,1,:tbl_notas_grales)
  //   LoTblTitulo.oCoordenada_Origen << RoCoord
  //   LoTblTitulo.oRenglones.elemento(1).nLongitud << 10   ← título:  10mm
  //   LoTblTitulo.oRenglones.elemento(2).nLongitud << 265  ← notas:  265mm
  //   LoTblTitulo.oColumnas.elemento(1).nLongitud  << 170  ← ancho:  170mm
  // ---------------------------------------------------------------------------
  private prvCrearCfgTblNotasGrales(coord: Coordenada): void {
    const tbl = this.oTablas.crearTabla(2, 1, 'tbl_notas_grales');

    // Magik: LoTblTitulo.oCoordenada_Origen << RoCoord
    tbl.origen = { ...coord };

    // Magik: .oRenglones.elemento(N).nLongitud
    tbl.renglones[0].longitud = 10;    // fila 1: franja título
    tbl.renglones[1].longitud = 265;   // fila 2: área de notas (265mm, más alta que inst_puente)

    // Magik: .oColumnas.elemento(1).nLongitud
    tbl.columnas[0].longitud  = 170;   // col 1: ancho (170mm, más ancho que inst_puente)
  }

  /** Expone prvCrearCfgTblNotasGrales como método público */
  inicializarTabla(coord: Coordenada = { x: 0, y: 0 }): void {
    this.prvCrearCfgTblNotasGrales(coord);
  }

  // ---------------------------------------------------------------------------
  // prvAsignaTexto()
  //
  // Magik:
  //   _super.prvAsignaTexto()          ← notas 1-4 heredadas
  //   LsTexto << character.newLine     ← inicia bloque propio
  //   LsTexto +<< " 5.-..."            ← notas 5-15 de instalación marginal
  //   _self.oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
  // ---------------------------------------------------------------------------
  prvAsignarTexto(): void {
    // Magik: _super.prvAsignaTexto() — agrega notas 1-4
    super.prvAsignarTexto();

    const n   = '\n';                    // Magik: character.newLine
    const ins = this.sInstalacion;       // Magik: .s_instalacion
    const tc  = this.sTipoCable;         // Magik: .s_tipo_cable  (heredado)
    const st  = this.sEstado;            // Magik: .s_estado       (heredado)

    // Magik: LsTexto << character.newLine + concatenaciones 5-15
    const texto =
      n +
      ` 5.- LA UBICACIÓN DE LA INSTALACIÓN MARGINAL ${ins} CON CABLE DE ` +
      tc + n +
      ` INDICADA EN ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA` + n +
      ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${st}.` + n + n +

      ` 6.- LA INSTALACIÓN MARGINAL ${ins} CON CABLE DE ${tc}` + n +
      ` QUE SE INDICA EN ESTE PROYECTO DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES ADICIONALES ` + n +
      ` DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS, ASÍ COMO LAS RECOMENDACIONES QUE ` + n +
      ` SEAN DERIVADAS DE LAS INSPECCIONES EN CAMPO.` + n + n +

      ` 7.- LA INSTALACIÓN MARGINAL ${ins} CON POSTES Y CABLE DE ` +
      tc + n +
      ` QUE SE INDICA EN ESTE PROYECTO DENTRO DEL ÁREA DEL DERECHO DE VÍA, DEBERÁ EFECTUARSE EN ` + n +
      ` UNA FRANJA PARALELA AL EJE DEL CAMINO CON UN ANCHO NO MAYOR DE 2.50 M. MEDIDOS A PARTIR ` + n +
      ` DEL LIMITE DEL DERECHO DE VÍA, SALVO EN LOS CASOS EN QUE LA PRESENCIA DE OBSTÁCULOS NA- ` + n +
      ` TURALES IMPIDAN CUMPLIR CON ESTA ESPECIFICACIÓN. ` + n + n +

      ` 8.- DENTRO DEL DERECHO DE VÍA, LA DISTANCIA ENTRE LA PARTE NATURAL DEL TERRENO O DE LA ` + n +
      ` PARTE MAS BAJA DE LA SECCIÓN DEL CAMINO, SOBRE EL CABLE DE ${tc}` +
      ` SERÁ DE 1.20 M. ` + n +
      ` COMO MÍNIMO Y 1.50 M.  A PARTIR DEL FONDO DE LAS CUNETAS.` + n + n +

      ` 9.- LAS CUNETAS QUE SEAN AFECTADAS POR LA EXCAVACIÓN DE LA ZANJA PARA LA COLOCACIÓN DEL ` + n +
      ` CABLE DE ${tc} SERÁN RECONSTRUIDAS Y ZAMPEADAS, AÚN EN EL CASO EN QUE NO ` + n +
      ` ESTEN ANTES DE SU AFECTACIÓN, PREVIAMENTE EL FILTRO AFECTADO DEBERÁ RESTITUIRSE CON LA ` + n +
      ` GRANULOMETRIA ORIGINAL O LA INDICADA POR LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRE-` + n +
      ` TERAS EN ESA ENTIDAD.` + n + n +

      ` 10.- EL RELLENO DE LA EXCAVACIÓN DEBERÁ HACERSE DE TAL MANERA QUE  EL TERRENO QUEDE EN ` + n +
      ` CONDICIONES SEMEJANTES A LAS ORIGINALES.` + n + n +

      ` 11.- CUALQUIER DAÑO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SEÑALAMIENTO, ` + n +
      ` DEBERÁ SER REPARADO DE INMEDIATO, POR CUENTA DE TELÉFONOS DE MÉXICO, S.A. DE C.V. DE A- ` + n +
      ` CUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS EN ESA ` + n +
      ` ENTIDAD.` + n + n +

      ` 12.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A.` + n +
      ` DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES-` + n +
      ` TRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS` + n +
      ` CON BASE EN LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRANSITO EN` + n +
      ` CALLES Y CARRETERAS' EDITADO POR LA SCT EDICIÓN 1986; CON EL FIN DE EVITAR ACCIDENTES --` + n +
      ` NOCTURNOS, SE INSTALARA Y CONSERVARA PERMANENTEMENTE DURANTE TODA LA NOCHE, EL SEÑALA --` + n +
      ` MIENTO LUMINOSO CONSISTENTE EN LAMPARAS DE DESTELLO Y OTROS DISPOSITIVOS LUMINOSOS.` + n + n +

      ` 13.- UNA VEZ TERMINADOS LOS TRABAJOS DE ESTA OBRA, DEBERÁN RETIRARSE FUERA DE LOS LIMITES` + n +
      ` DEL DERECHO DE VÍA, TODOS LOS MATERIALES SOBRANTES DE LA EXCAVACIÓN Y LOS DE CONSTRUCCIÓN` + n +
      ` DE LA OBRA, INCLUYENDO EL SEÑALAMIENTO DE MODO QUE LA CARRETERA Y LA ZONA DEL DERECHO DE ` + n +
      ` VÍA QUEDEN EN SUS CONDICIONES ORIGINALES.` + n + n +

      ` 14.- LOS CRUZAMIENTOS SUBTERRÁNEOS CON CABLE DE ${tc} QUE SE PRETENDAN E-` + n +
      ` FECTUAR DERIVADOS DE ESTA INSTALACIÓN MARGINAL ${ins}, DEBERÁN SOLI-` + n +
      ` CITARSE POR SEPARADO, PRESENTANDO PLANO DETALLADO DEL PROYECTO DE LOS CRUZAMIENTOS.` + n + n +

      ` 15.- LAS INSTALACIONES LATERALES CON CABLE DE ${tc} ADOSADAS A LOS PUENTES` + n +
      ` Y ALCANTARILLAS QUE TELÉFONOS DE MÉXICO, S.A. DE C.V. PRETENDA O REQUIERA ESTABLECER EN -` + n +
      ` EL TRAYECTO DE ESTA INSTALACIÓN MARGINAL ${ins}, DEBERÁN SOLICITARSE ` + n +
      ` POR SEPARADO, PRESENTANDO PLANO DETALLADO DE LA INSTALACIÓN.` + n + n;

    // Magik: oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
    const celda = this.oTablas.celda('tbl_notas_grales', 2, 1);
    if (celda) celda.sTexto += texto;
  }

  /** Flujo completo: inicializarTabla + prvAsignarTexto */
  generar(coord: Coordenada = { x: 0, y: 0 }): void {
    this.inicializarTabla(coord);
    this.prvAsignarTexto();
  }

  /** Texto completo de la celda (notas 1-15) */
  getTextoNotas(): string {
    return this.oTablas.celda('tbl_notas_grales', 2, 1)?.sTexto ?? '';
  }

  /** Tabla completa para inspección */
  getTablaNota(): TablaNota | undefined {
    return this.oTablas.elemento('tbl_notas_grales');
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello de notas SCT para instalación marginal
// =============================================================================

const TIPOS_INSTALACION = ['SUBTERRÁNEA', 'AÉREA', 'CONDUIT', 'DIRECTA ENTERRADA'];
const TIPOS_CABLE       = ['FIBRA ÓPTICA', 'CABLE DE COBRE', 'CABLE COAXIAL', 'CABLE ADSS'];
const ESTADOS_MX        = ['JALISCO', 'VERACRUZ', 'MICHOACÁN', 'OAXACA', 'CHIHUAHUA', 'SONORA'];

export function SelloNotasSctMargSubUI() {
  const [instalacion,   setInstalacion]   = useState('SUBTERRÁNEA');
  const [tipoCable,     setTipoCable]     = useState('FIBRA ÓPTICA');
  const [estado,        setEstado]        = useState('JALISCO');
  const [coordX,        setCoordX]        = useState(0);
  const [coordY,        setCoordY]        = useState(0);
  const [mostrarSuper,  setMostrarSuper]  = useState(false);

  const sello = new SelloNotasSctMargSub();
  sello.sInstalacion = instalacion;
  sello.sTipoCable   = tipoCable;
  sello.sEstado      = estado;
  sello.generar({ x: coordX, y: coordY });

  const tabla    = sello.getTablaNota();
  const textoRaw = sello.getTextoNotas();

  // Separar bloque _super (notas 1-4) del bloque propio (notas 5-15)
  const idxNota5    = textoRaw.indexOf(' 5.-');
  const textoSuper  = idxNota5 >= 0 ? textoRaw.slice(0, idxNota5) : textoRaw;
  const textoMargSub = idxNota5 >= 0 ? textoRaw.slice(idxNota5)   : '';

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_notas_sct_marg_sub.prvAsignaTexto()</h3>
      <p style={s.meta}>
        Notas SCT instalación marginal subterránea en carretera.
        Hereda notas 1-4 de <code>c_sello_notas_sct</code> · añade notas 5-15.
      </p>

      {/* Controles */}
      <div style={s.controls}>
        <label style={s.lbl}>
          <code>.s_instalacion:</code>
          <select value={instalacion} onChange={e => setInstalacion(e.target.value)} style={s.select}>
            {TIPOS_INSTALACION.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={s.lbl}>
          <code>.s_tipo_cable:</code>
          <select value={tipoCable} onChange={e => setTipoCable(e.target.value)} style={s.select}>
            {TIPOS_CABLE.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={s.lbl}>
          <code>.s_estado:</code>
          <select value={estado} onChange={e => setEstado(e.target.value)} style={s.select}>
            {ESTADOS_MX.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label style={s.lbl}>
          Origen X: <input type="number" value={coordX} onChange={e => setCoordX(+e.target.value)} style={s.input} />
          Y: <input type="number" value={coordY} onChange={e => setCoordY(+e.target.value)} style={s.input} />
        </label>
        <label style={s.lbl}>
          <input type="checkbox" checked={mostrarSuper} onChange={e => setMostrarSuper(e.target.checked)} />
          {' '}Mostrar notas 1-4 de <code>_super</code>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>

        {/* Diagrama de layout */}
        {tabla && (
          <div>
            <p style={{ ...s.meta, marginBottom: 4 }}><strong>Layout tbl_notas_grales</strong></p>
            <svg width={90} height={300} style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}>
              {/* Fila 1 — título: 10mm */}
              <rect x={0} y={0} width={88} height={16} fill="#e8f0fe" stroke="#2E4057" strokeWidth={1} />
              <text x={44} y={11} textAnchor="middle" fontSize={7} fill="#2E4057" fontFamily="monospace">
                fila 1 — 10mm
              </text>
              {/* Fila 2 — notas: 265mm (proporcionalmente más alta) */}
              <rect x={0} y={16} width={88} height={278} fill="#fafafa" stroke="#2E4057" strokeWidth={1} />
              <text x={44} y={152} textAnchor="middle" fontSize={8} fill="#666" fontFamily="monospace">
                fila 2 — 265mm
              </text>
              <text x={44} y={163} textAnchor="middle" fontSize={7} fill="#999" fontFamily="monospace">
                (notas 1-15)
              </text>
            </svg>
            {/* Dimensión columna */}
            <p style={{ ...s.meta, marginTop: 2, fontSize: 10, textAlign: 'center' }}>
              170mm · Origen: ({tabla.origen.x}, {tabla.origen.y})
            </p>
          </div>
        )}

        {/* Documento de notas */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 720 }}>
          <p style={{ ...s.meta, marginBottom: 4 }}>
            <strong>Celda [2,1] — contenido completo</strong>
            {' '}<span style={{ color: '#1565c0' }}>(<code>Celda(2,1).oElemento.sTexto</code>)</span>
          </p>

          <div style={s.docBox}>
            <div style={s.docTitleStrip}>NOTAS GENERALES</div>

            {/* Notas 1-4 (_super) */}
            {mostrarSuper && (
              <pre style={{ ...s.docText, color: '#888', borderBottom: '1px dashed #ccc', marginBottom: 0 }}>
                <span style={s.superBadge}>_super.prvAsignaTexto() — notas 1-4</span>
                {textoSuper}
              </pre>
            )}

            {/* Notas 5-15 (esta clase) */}
            <pre style={s.docText}>
              {!mostrarSuper && (
                <span style={s.superBadge}>_super →  notas 1-4  (ocultas)</span>
              )}
              <span style={s.margSubBadge}>c_sello_notas_sct_marg_sub — notas 5-15</span>
              {textoMargSub}
            </pre>
          </div>

          <p style={{ ...s.meta, marginTop: 4 }}>
            Texto total: <code>{textoRaw.length}</code> caracteres ·{' '}
            Notas 1-4 (super): <code>{textoSuper.length}</code> ·{' '}
            Notas 5-15 (marg_sub): <code>{textoMargSub.length}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame       : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title       : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta        : { color: '#666', fontSize: 12, margin: '2px 0' },
  controls    : { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl         : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  select      : { padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  input       : { width: 55, padding: '2px 4px', fontSize: 11, border: '1px solid #bbb', borderRadius: 2 },
  docBox      : { border: '1px solid #666', borderRadius: 2, overflow: 'hidden', background: '#fff' },
  docTitleStrip: { background: '#2E4057', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
  docText     : { margin: 0, padding: '8px 10px', fontSize: 10, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#222' },
  superBadge  : { display: 'block', background: '#e8f0fe', color: '#1565c0', fontSize: 9, padding: '1px 4px', marginBottom: 4, borderRadius: 2, fontFamily: 'sans-serif' },
  margSubBadge: { display: 'block', background: '#fff3e0', color: '#e65100', fontSize: 9, padding: '1px 4px', marginBottom: 4, borderRadius: 2, fontFamily: 'sans-serif' },
};

export default SelloNotasSctMargSubUI;
