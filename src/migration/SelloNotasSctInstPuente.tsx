/**
 * Migración de: c_sello_notas_sct_inst_puente.magik
 * Clase Magik:  c_sello_notas_sct_inst_puente  —  _package user
 * Hereda:       c_sello_notas_sct  (stub definido abajo — pendiente migración)
 *
 * Sello de notas SCT para instalación lateral de cable en puente.
 *
 * Métodos transcritos:
 *   prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)  → crea tabla 2×1 (10mm título + 170mm notas, 165mm ancho)
 *   prvAsignaTexto()                        → _super notas 1-4 + notas 5-11 de instalación en puente
 *
 * Magik → TypeScript:
 *   character.newLine                                       '\n'
 *   LsTexto +<< "texto"                                    texto += 'texto'
 *   .s_tipo_cable / .s_estado                              sTipoCable / sEstado (slots propiedades)
 *   oTablas.crearTabla(2,1,:id)                            gestorTablas.crearTabla(2,1,'id')
 *   LoTblTitulo.oRenglones.elemento(N).nLongitud << mm     tabla.renglones[N-1].longitud = mm
 *   LoTblTitulo.oColumnas.elemento(1).nLongitud << mm      tabla.columnas[0].longitud = mm
 *   oTablas.elemento(:id).oCeldas.Celda(2,1).oElemento.sTexto +<< texto
 *                                                          celda('id',2,1).sTexto += texto
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface Coordenada { x: number; y: number; }

/** Magik: oRenglones.elemento(N).nLongitud — longitud en mm */
export interface RenglonLayout { longitud: number; }

/** Magik: oColumnas.elemento(N).nLongitud — longitud en mm */
export interface ColumnaLayout { longitud: number; }

/** Magik: oCeldas.Celda(f,c).oElemento */
export interface CeldaNota { sTexto: string; }

/** Magik: tabla creada por oTablas.crea_tabla */
export interface TablaNota {
  id       : string;
  renglones: RenglonLayout[];
  columnas : ColumnaLayout[];
  celdas   : Map<string, CeldaNota>;   // key: "fila,col" (1-indexed)
  origen   : Coordenada;
}

// =============================================================================
// GESTOR DE TABLAS — models .o_tablas / oTablas de Magik
// =============================================================================

class GestorTablas {
  private tablas: Map<string, TablaNota> = new Map();

  // Magik: .oTablas.crea_tabla(nFilas, nCols, :id)
  crearTabla(nFilas: number, nCols: number, id: string): TablaNota {
    const t: TablaNota = {
      id,
      renglones: Array.from({ length: nFilas }, () => ({ longitud: 0 })),
      columnas : Array.from({ length: nCols  }, () => ({ longitud: 0 })),
      celdas   : new Map(),
      origen   : { x: 0, y: 0 },
    };
    for (let f = 1; f <= nFilas; f++) {
      for (let c = 1; c <= nCols; c++) {
        t.celdas.set(`${f},${c}`, { sTexto: '' });
      }
    }
    this.tablas.set(id, t);
    return t;
  }

  // Magik: .oTablas.elemento(:id)
  elemento(id: string): TablaNota | undefined { return this.tablas.get(id); }

  // Acceso directo a celda — Magik: .oCeldas.Celda(fila, col).oElemento
  celda(tablaId: string, fila: number, col: number): CeldaNota | undefined {
    return this.tablas.get(tablaId)?.celdas.get(`${fila},${col}`);
  }
}

// =============================================================================
// BASE — c_sello_notas_sct  (stub — pendiente migración)
// =============================================================================

/**
 * Stub para c_sello_notas_sct.
 * Aporta gestorTablas, slots sTipoCable/sEstado, y las notas 1-4 del plano general SCT.
 */
export class SelloNotasSct {
  oTablas    : GestorTablas = new GestorTablas();
  sTipoCable : string       = '';   // Magik: .s_tipo_cable
  sEstado    : string       = '';   // Magik: .s_estado

  // Magik: _super.prvAsignaTexto() — notas 1-4 de la clase padre
  // En el plano SCT estándar, las notas 1-4 cubren condiciones generales de la obra.
  prvAsignarTexto(): void {
    const celda = this.oTablas.celda('tbl_notas_grales', 2, 1);
    if (!celda) return;
    const n = '\n';
    celda.sTexto +=
      ` 1.- TODOS LOS MATERIALES Y MANO DE OBRA SERÁN DE PRIMERA CALIDAD Y DEBERÁN CUMPLIR CON` + n +
      ` LAS ESPECIFICACIONES VIGENTES DE LA SECRETARÍA DE COMUNICACIONES Y TRANSPORTES.` + n + n +
      ` 2.- EL CONTRATISTA DEBERÁ OBTENER LOS PERMISOS NECESARIOS ANTE LAS AUTORIDADES COMPETENTES` + n +
      ` ANTES DE INICIAR LOS TRABAJOS.` + n + n +
      ` 3.- LA SEÑALIZACIÓN DE LA ZONA DE TRABAJO ESTARÁ DE ACUERDO CON LAS NORMAS SCT VIGENTES.` + n + n +
      ` 4.- EL CONTRATISTA SERÁ RESPONSABLE DE CUALQUIER DAÑO O PERJUICIO QUE OCASIONE A TERCEROS` + n +
      ` DURANTE LA EJECUCIÓN DE LOS TRABAJOS.` + n + n;
  }
}

// =============================================================================
// CLASE PRINCIPAL — c_sello_notas_sct_inst_puente
// =============================================================================

export class SelloNotasSctInstPuente extends SelloNotasSct {

  // ---------------------------------------------------------------------------
  // prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)  [private]
  //
  // Magik:
  //   LoTblTitulo << _self.oTablas.crea_tabla(2,1,:tbl_notas_grales)
  //   LoTblTitulo.oCoordenada_Origen << RoCoord
  //   LoTblTitulo.oRenglones.elemento(1).nLongitud << 10   ← título: 10mm
  //   LoTblTitulo.oRenglones.elemento(2).nLongitud << 170  ← notas:  170mm
  //   LoTblTitulo.oColumnas.elemento(1).nLongitud  << 165  ← ancho:  165mm
  // ---------------------------------------------------------------------------
  private prvCrearCfgTblNotasGrales(coord: Coordenada): void {
    const tbl = this.oTablas.crearTabla(2, 1, 'tbl_notas_grales');

    // Magik: LoTblTitulo.oCoordenada_Origen << RoCoord
    tbl.origen = { ...coord };

    // Magik: .oRenglones.elemento(N).nLongitud — longitud de cada renglón en mm
    tbl.renglones[0].longitud = 10;    // fila 1: franja de título
    tbl.renglones[1].longitud = 170;   // fila 2: área de notas

    // Magik: .oColumnas.elemento(1).nLongitud — ancho de la columna en mm
    tbl.columnas[0].longitud  = 165;
  }

  // Método público para inicializar la tabla con una coordenada de origen
  inicializarTabla(coord: Coordenada = { x: 0, y: 0 }): void {
    this.prvCrearCfgTblNotasGrales(coord);
  }

  // ---------------------------------------------------------------------------
  // prvAsignaTexto()
  //
  // Magik:
  //   _super.prvAsignaTexto()                          ← notas 1-4 heredadas
  //   LsTexto << character.newLine                      ← inicio del bloque
  //   LsTexto +<< " 5.-..." + .s_tipo_cable ...        ← concatenación de notas
  //   ... notas 6 a 11 ...
  //   oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
  // ---------------------------------------------------------------------------
  prvAsignarTexto(): void {
    // Magik: _super.prvAsignaTexto() — agrega notas 1-4
    super.prvAsignarTexto();

    const n  = '\n';  // Magik: character.newLine
    const tc = this.sTipoCable;
    const st = this.sEstado;

    // Magik: LsTexto << character.newLine + concatenaciones de notas 5-11
    const texto =
      n +
      ` 5.- LA UBICACIÓN DE LA INSTALACIÓN LATERAL EN PUENTE CON CABLE DE ${tc}` + n +
      ` INDICADA EN ESTE PROYECTO DEBERÁ SER VERIFICADA Y PRECISADA EN EL LUGAR POR LA RESIDENCIA` + n +
      ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${st}.` + n + n +
      ` 6.- LA INSTALACIÓN CON CABLE DE ${tc} EN PUENTE, SE HARÁ SIN INTERRUMPIR ` + n +
      ` EL TRÁNSITO, PARA LO CUAL DEBERÁ ESTAR LA SUPERFICIE DE RODAMIENTO LIBRE DE OBSTÁCULOS- ` + n +
      ` COMO SON PIEDRAS, ARENA, BASURA, HERRAMIENTA, ETC. ` + n +
      ` CARPETA ASFALTICA EVITANDO SU ROMPIMIENTO.` + n + n +
      ` 7.- LA INSTALACIÓN DE LA CANALETA CON CABLE DE ${tc} QUE SE INDICA EN,` + n +
      ` ESTE PROYECTO, DEBERÁ FIJARSE EN LA SUBESTRUCTURA DEL PUENTE CON BARRENANCLAS AHOGADAS ` + n +
      ` EN RESINA EPOXICA, QUEDANDO ABSOLUTAMENTE PROHIBIDO EL USO DE PISTOLAS EXPLOSIVAS.` + n + n +
      ` 8.- EN LA PROTECCION Y APARIENCIA DE LA CANALETA DEBERÁ USARSE PINTURA ANTICORROSIVA.` + n + n +
      ` 9.- TODOS LOS TRABAJOS DEBERÁN HACERSE DE ACUERDO CON LAS ESPECIFICACIONES GENERALES ` + n +
      ` DE CONSTRUCCIÓN DE ESTA SECRETARÍA Y LAS INDICACIONES ADICIONALES DE LA RESIDENCIA GE-` + n +
      ` NERAL DE CONSERVACIÓN DE CARRETERAS EN ESA ENTIDAD. ` + n + n +
      ` 10.- CUALQUIER DAÑO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SEÑALAMIENTO ` + n +
      ` DEBERÁ SER REPARADO DE INMEDIATO POR CUENTA DE TELÉFONOS DE MÉXICO, S.A. DE C.V. DE ` + n +
      ` ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS EN` + n +
      ` ESA ENTIDAD.` + n + n +
      ` 11.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A. ` + n +
      ` DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES- ` + n +
      ` RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE  CONSERVACIÓN DE CARRE- ` + n +
      ` TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- ` + n +
      ` EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICIÓN 1986.` + n + n;

    // Magik: oTablas.elemento(:tbl_notas_grales).oCeldas.Celda(2,1).oElemento.sTexto +<< LsTexto
    const celda = this.oTablas.celda('tbl_notas_grales', 2, 1);
    if (celda) celda.sTexto += texto;
  }

  /** Ejecuta el flujo completo: tabla + asignación de texto */
  generar(coord: Coordenada = { x: 0, y: 0 }): void {
    this.inicializarTabla(coord);
    this.prvAsignarTexto();
  }

  /** Devuelve el texto completo de las notas (celda 2,1) */
  getTextoNotas(): string {
    return this.oTablas.celda('tbl_notas_grales', 2, 1)?.sTexto ?? '';
  }

  /** Devuelve la tabla completa para inspección */
  getTablaNota(): TablaNota | undefined {
    return this.oTablas.elemento('tbl_notas_grales');
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello de notas SCT para instalación en puente
// =============================================================================

const TIPOS_CABLE = ['FIBRA ÓPTICA', 'CABLE DE COBRE', 'CABLE COAXIAL', 'CABLE ADSS'];
const ESTADOS_MX  = ['JALISCO', 'VERACRUZ', 'MICHOACÁN', 'OAXACA', 'CHIHUAHUA', 'SONORA'];

export function SelloNotasSctInstPuenteUI() {
  const [tipoCable, setTipoCable] = useState('FIBRA ÓPTICA');
  const [estado,    setEstado]    = useState('JALISCO');
  const [coordX,    setCoordX]    = useState(0);
  const [coordY,    setCoordY]    = useState(0);
  const [mostrarSuper, setMostrarSuper] = useState(false);

  // Instanciar y ejecutar flujo completo
  const sello = new SelloNotasSctInstPuente();
  sello.sTipoCable = tipoCable;
  sello.sEstado    = estado;
  sello.generar({ x: coordX, y: coordY });

  const tabla    = sello.getTablaNota();
  const textoRaw = sello.getTextoNotas();

  // Separar notas super (1-4) de notas propias (5-11) para la UI
  const idxNota5 = textoRaw.indexOf(' 5.-');
  const textoSuper  = idxNota5 >= 0 ? textoRaw.slice(0, idxNota5)  : textoRaw;
  const textoPuente = idxNota5 >= 0 ? textoRaw.slice(idxNota5)     : '';

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_notas_sct_inst_puente.prvAsignaTexto()</h3>
      <p style={s.meta}>
        Notas SCT para instalación lateral de cable en puente.
        Hereda notas 1-4 de <code>c_sello_notas_sct</code> · añade notas 5-11.
      </p>

      {/* Controles */}
      <div style={s.controls}>
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

        {/* Diagrama de tabla */}
        {tabla && (
          <div>
            <p style={{ ...s.meta, marginBottom: 4 }}><strong>Layout tbl_notas_grales</strong></p>
            <svg width={90} height={210} style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}>
              {/* Fila 1 — título */}
              <rect x={0} y={0} width={88} height={20} fill="#e8f0fe" stroke="#2E4057" strokeWidth={1} />
              <text x={44} y={14} textAnchor="middle" fontSize={8} fill="#2E4057" fontFamily="monospace">
                fila 1 — 10mm
              </text>
              {/* Fila 2 — notas */}
              <rect x={0} y={20} width={88} height={185} fill="#fafafa" stroke="#2E4057" strokeWidth={1} />
              <text x={44} y={115} textAnchor="middle" fontSize={8} fill="#666" fontFamily="monospace">
                fila 2 — 170mm
              </text>
              <text x={44} y={126} textAnchor="middle" fontSize={7} fill="#999" fontFamily="monospace">
                (notas 1-11)
              </text>
              {/* Dimensión col */}
              <text x={44} y={208} textAnchor="middle" fontSize={7} fill="#888">
                165mm
              </text>
            </svg>
            <p style={{ ...s.meta, marginTop: 2, fontSize: 10, textAlign: 'center' }}>
              Origen: ({tabla.origen.x}, {tabla.origen.y})
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
            {/* Franja título */}
            <div style={s.docTitleStrip}>NOTAS GENERALES</div>

            {/* Notas 1-4 (super) */}
            {mostrarSuper && (
              <pre style={{ ...s.docText, color: '#888', borderBottom: '1px dashed #ccc', marginBottom: 0 }}>
                <span style={s.superBadge}>_super.prvAsignaTexto() — notas 1-4</span>
                {textoSuper}
              </pre>
            )}

            {/* Notas 5-11 (esta clase) */}
            <pre style={s.docText}>
              {!mostrarSuper && (
                <span style={s.superBadge}>_super →  notas 1-4  (ocultas)</span>
              )}
              <span style={s.puenteBadge}>c_sello_notas_sct_inst_puente — notas 5-11</span>
              {textoPuente}
            </pre>
          </div>

          <p style={{ ...s.meta, marginTop: 4 }}>
            Texto total: <code>{textoRaw.length}</code> caracteres ·{' '}
            Notas 1-4 (super): <code>{textoSuper.length}</code> ·{' '}
            Notas 5-11 (puente): <code>{textoPuente.length}</code>
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
  puenteBadge : { display: 'block', background: '#e8f5e9', color: '#2e7d32', fontSize: 9, padding: '1px 4px', marginBottom: 4, borderRadius: 2, fontFamily: 'sans-serif' },
};

export default SelloNotasSctInstPuenteUI;
