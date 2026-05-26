// =============================================================================
// MIGRACIÓN: c_sello_notas_sct_cruz_sub_pte  →  CSelloNotasSctCruzSubPte.tsx
// Jerarquía Magik: c_sello_notas_sct_cruz_sub_pte  extends  :c_sello_notas_sct
// Fuente: adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_sub_pte.magik
// =============================================================================
//
// Sello especializado en notas SCT para "Cruzamiento Subterráneo bajo Puente".
// Hereda de c_sello_notas_sct (clase padre — no migrada) y aporta:
//   · prvCrea_Cfg_Tbl_Notas_Grales(coord)  — configura tabla 2×1, alturas
//     10/150 mm, ancho col 165 mm.
//   · prvAsignaTexto()                     — añade las notas 5–10 al texto
//     del padre, parametrizadas con .s_tipo_cable y .s_estado.
//
// El padre c_sello_notas_sct se stubbea aquí con los slots/tablas mínimos
// que la subclase necesita. Cuando se migre el padre real, sustituir
// el stub por su import.
// =============================================================================

import React, { useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos & stubs del padre c_sello_notas_sct
// ---------------------------------------------------------------------------

export interface Coord {
  x: number;
  y: number;
}

// Stub: c_celdas_grafico bajo el :elemento → oElemento.sTexto
export interface CeldaContenido {
  oElemento: { sTexto: string };
}

export interface RowOrCol {
  nLongitud: number;
}

export interface TablaSello {
  id:               string;
  oCoordenada_Origen: Coord;
  oRenglones:       { elemento(n: number): RowOrCol };
  oColumnas:        { elemento(n: number): RowOrCol };
  oCeldas:          { Celda(row: number, col: number): CeldaContenido };
  // Datos crudos para la UI
  _renglones:       RowOrCol[];
  _columnas:        RowOrCol[];
  _celdas:          CeldaContenido[][];
}

export interface TablasCollection {
  crea_tabla(rows: number, cols: number, id: string): TablaSello;
  elemento(id: string): TablaSello | undefined;
  all(): TablaSello[];
}

// Implementación mínima de la colección de tablas
function newTablasCollection(): TablasCollection {
  const map = new Map<string, TablaSello>();
  return {
    crea_tabla(rows, cols, id) {
      const _renglones: RowOrCol[] = Array.from({ length: rows }, () => ({ nLongitud: 0 }));
      const _columnas:  RowOrCol[] = Array.from({ length: cols }, () => ({ nLongitud: 0 }));
      const _celdas:    CeldaContenido[][] =
        Array.from({ length: rows }, () =>
          Array.from({ length: cols }, () => ({ oElemento: { sTexto: '' } })),
        );
      const t: TablaSello = {
        id,
        oCoordenada_Origen: { x: 0, y: 0 },
        oRenglones: { elemento: (n: number) => _renglones[n - 1] }, // Magik es 1-indexed
        oColumnas:  { elemento: (n: number) => _columnas[n - 1] },
        oCeldas:    { Celda: (r: number, c: number) => _celdas[r - 1][c - 1] },
        _renglones, _columnas, _celdas,
      };
      map.set(id, t);
      return t;
    },
    elemento(id) { return map.get(id); },
    all()        { return Array.from(map.values()); },
  };
}

// Stub del padre — slots de datos + tabla.
export class CSelloNotasSct {
  s_tipo_cable: string = 'FIBRA OPTICA';
  s_estado:     string = 'JALISCO';
  oTablas:      TablasCollection = newTablasCollection();

  // Magik: prvAsignaTexto() base — el padre escribiría notas 1..4 en la
  // celda. Stub: arranca con un encabezado y notas 1..4 mínimas para
  // demostrar que la subclase concatena con +<< sobre el existente.
  prvAsignaTexto(): void {
    const t = this.oTablas.elemento('tbl_notas_grales');
    if (!t) return;
    const txt =
      ' NOTAS GENERALES — CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE (SCT)\n\n' +
      ` 1.- EL CABLE DE ${this.s_tipo_cable} SE INSTALARÁ CONFORME A LA NORMATIVA SCT.\n\n` +
      ' 2.- LOS TRABAJOS SE REALIZARÁN BAJO SUPERVISIÓN DE LA RESIDENCIA GENERAL.\n\n' +
      ` 3.- PARA EL ESTADO DE ${this.s_estado} APLICAN LAS DISPOSICIONES ESPECÍFICAS.\n\n` +
      ' 4.- TODOS LOS PERMISOS REQUERIDOS DEBERÁN GESTIONARSE PREVIAMENTE.';
    t.oCeldas.Celda(2, 1).oElemento.sTexto = txt;
  }
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_sello_notas_sct_cruz_sub_pte. Subclase final que añade
 * notas 5–10 al texto del padre y configura la tabla notas grales.
 */
export class CSelloNotasSctCruzSubPte extends CSelloNotasSct {
  // Magik: define_shared_constant :allowed_on_menu? = _false
  static readonly allowed_on_menu = false;

  // ── prvCrea_Cfg_Tbl_Notas_Grales(RoCoord) ───────────────────────────────
  // Magik: crea_tabla(2, 1, :tbl_notas_grales)
  //        + oCoordenada_Origen << coord
  //        + renglones[1].nLongitud = 10  (cabecera)
  //        + renglones[2].nLongitud = 150 (cuerpo)
  //        + columnas[1].nLongitud  = 165
  prvCrea_Cfg_Tbl_Notas_Grales(roCoord: Coord): void {
    const t = this.oTablas.crea_tabla(2, 1, 'tbl_notas_grales');
    t.oCoordenada_Origen = roCoord;
    t.oRenglones.elemento(1).nLongitud = 10;
    t.oRenglones.elemento(2).nLongitud = 150;
    t.oColumnas.elemento(1).nLongitud  = 165;
  }

  // ── prvAsignaTexto() — override ──────────────────────────────────────────
  // Magik: _super.prvAsignaTexto() + concatena (con +<<) las notas 5–10.
  // Magik utiliza character.newLine; en TS = '\n'.
  override prvAsignaTexto(): void {
    super.prvAsignaTexto();

    const NL = '\n';
    let LsTexto = NL;
    LsTexto += ` 5.- LA UBICACIÓN DEL CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE CON CABLE DE ${this.s_tipo_cable}`;
    LsTexto += NL;
    LsTexto += ' INDICADO EN ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA';
    LsTexto += NL;
    LsTexto += ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.s_estado}.`;
    LsTexto += NL + NL;
    LsTexto += ` 6.- EL CRUZAMIENTO SUBTERRÁNEO BAJO PUENTE CON CABLE DE ${this.s_tipo_cable} DEBERA EFEC-`;
    LsTexto += NL;
    LsTexto += ' TUARSE POR EL PROCEDIMIENTO A CIELO ABIERTO, HINCADO O TUNELEO DIRECCIONAL.';
    LsTexto += NL + NL;
    LsTexto += ' 7.- DENTRO DEL DERECHO DE VÍA, LA DISTANCIA ENTRE LA PARTE NATURAL DEL TERRENO DE LA PAR-';
    LsTexto += NL;
    LsTexto += ` TE MAS BAJA DE LA SECCIÓN DEL CAMINO, SOBRE EL CABLE DE ${this.s_tipo_cable} SERÁ DE 1.5m`;
    LsTexto += NL;
    LsTexto += ' Y NO MENOR DE 2.00 M. A PARTIR DEL FONDO DE LAS CUNETAS.';
    LsTexto += NL + NL;
    LsTexto += ' 8.- LOS POZOS DE VISITA SE UBICARAN FUERA DEL ÁREA DEL DERECHO DE VÍA O DENTRO DE UNA';
    LsTexto += NL;
    LsTexto += ' FRANJA NO MAYOR DE 2.50 M. DE ANCHO EN AMBOS LADOS DE LA CARRETERA, MEDIDOS A PARTIR';
    LsTexto += NL;
    LsTexto += ' DEL LIMITE DEL DERECHO DE VÍA.';
    LsTexto += NL + NL;
    LsTexto += ' 9.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A.';
    LsTexto += NL;
    LsTexto += ' DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES-';
    LsTexto += NL;
    LsTexto += ' RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE  CONSERVACIÓN DE CARRE-';
    LsTexto += NL;
    LsTexto += ' TERAS, CON BASE A LO ESTABLECIDO EN EL "MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN-';
    LsTexto += NL;
    LsTexto += ' EN CALLES Y CARRETERAS" EDITADO POR LA SCT EDICIÓN 1986.';
    LsTexto += NL + NL;
    LsTexto += ' 10.- UNA VEZ TERMINADOS LOS TRABAJOS DE ESTA OBRA, DEBERÁN RETIRARSE FUERA DE LOS LIMITES';
    LsTexto += NL;
    LsTexto += ' DEL DERECHO DE VÍA TODOS LOS MATERIALES SOBRANTES DE LA EXCAVACIÓN Y LOS DE  CONSTRUCCIÓN';
    LsTexto += NL;
    LsTexto += ' DE LA OBRA INCLUYENDO EL SEÑALAMIENTO DE MODO QUE LA CARRETERA Y LA ZONA DEL DERECHO DE -';
    LsTexto += NL;
    LsTexto += ' VÍA QUEDEN EN SUS CONDICIONES ORIGINALES.';

    const cel = this.oTablas.elemento('tbl_notas_grales')?.oCeldas.Celda(2, 1);
    if (cel) {
      // Magik: oElemento.sTexto +<< LsTexto  (concatenación, no asignación)
      cel.oElemento.sTexto += LsTexto;
    }
  }
}

// =============================================================================
// Componente React — CSelloNotasSctCruzSubPteUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row:   { display: 'grid', gridTemplateColumns: '210px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:     { color: '#89dceb' } as React.CSSProperties,
  v:     { color: '#a6e3a1' } as React.CSSProperties,
  textInput: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    width: 220, marginLeft: 4,
  } as React.CSSProperties,
  preTable: {
    width: '100%', borderCollapse: 'collapse' as const, marginTop: 8,
  },
  th: {
    background: '#313244', color: '#cba6f7', textAlign: 'left' as const,
    padding: '4px 8px', border: '1px solid #45475a', fontSize: 11,
  },
  td: { border: '1px solid #45475a', padding: '6px 10px', fontSize: 11 },
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={styles.v}>{value}</span>
    </div>
  );
}

export function CSelloNotasSctCruzSubPteUI() {
  const [tipoCable, setTipoCable] = useState('FIBRA OPTICA');
  const [estado,    setEstado]    = useState('JALISCO');
  const [coordX,    setCoordX]    = useState(20);
  const [coordY,    setCoordY]    = useState(50);

  const sello = useMemo(() => {
    const s = new CSelloNotasSctCruzSubPte();
    s.s_tipo_cable = tipoCable;
    s.s_estado     = estado;
    s.prvCrea_Cfg_Tbl_Notas_Grales({ x: coordX, y: coordY });
    s.prvAsignaTexto();
    return s;
  }, [tipoCable, estado, coordX, coordY]);

  const tabla   = sello.oTablas.elemento('tbl_notas_grales');
  const texto   = tabla?.oCeldas.Celda(2, 1).oElemento.sTexto ?? '';
  const numChars = texto.length;
  const numLines = texto.split('\n').length;

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CSelloNotasSctCruzSubPte
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          c_sello_notas_sct → notas SCT cruzamiento subterráneo bajo puente
        </span>
      </div>

      {/* Parámetros */}
      <div style={styles.card}>
        <div style={styles.title}>parámetros heredados — s_tipo_cable / s_estado</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={styles.k}>s_tipo_cable:</span>
            <input
              value={tipoCable}
              onChange={e => setTipoCable(e.target.value)}
              style={styles.textInput}
            />
          </label>
          <label>
            <span style={styles.k}>s_estado:</span>
            <input
              value={estado}
              onChange={e => setEstado(e.target.value)}
              style={styles.textInput}
            />
          </label>
        </div>
      </div>

      {/* Coordenada */}
      <div style={styles.card}>
        <div style={styles.title}>prvCrea_Cfg_Tbl_Notas_Grales(RoCoord)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <label>
            <span style={styles.k}>coord.x:</span>
            <input
              type="number" value={coordX}
              onChange={e => setCoordX(Number(e.target.value))}
              style={{ ...styles.textInput, width: 80 }}
            />
          </label>
          <label>
            <span style={styles.k}>coord.y:</span>
            <input
              type="number" value={coordY}
              onChange={e => setCoordY(Number(e.target.value))}
              style={{ ...styles.textInput, width: 80 }}
            />
          </label>
        </div>
      </div>

      {/* Configuración tabla */}
      <div style={styles.card}>
        <div style={styles.title}>tbl_notas_grales — configuración (mm)</div>
        <Field label="oCoordenada_Origen" value={`(${tabla?.oCoordenada_Origen.x}, ${tabla?.oCoordenada_Origen.y})`} />
        <Field label="renglones (alto)" value={`R1=${tabla?.oRenglones.elemento(1).nLongitud} mm  ·  R2=${tabla?.oRenglones.elemento(2).nLongitud} mm`} />
        <Field label="columnas (ancho)" value={`C1=${tabla?.oColumnas.elemento(1).nLongitud} mm`} />
        <Field label="texto" value={`${numChars} chars · ${numLines} líneas`} />
        <Field label="allowed_on_menu?" value={String(CSelloNotasSctCruzSubPte.allowed_on_menu)} />
      </div>

      {/* Render visual de la tabla */}
      <div style={styles.card}>
        <div style={styles.title}>render — celda (2,1).oElemento.sTexto</div>
        <table style={styles.preTable}>
          <tbody>
            <tr style={{ height: 30 }}>
              <td style={{ ...styles.td, background: '#313244', color: '#cba6f7', textAlign: 'center', fontWeight: 'bold' }}>
                NOTAS GENERALES (cabecera — alto 10 mm)
              </td>
            </tr>
            <tr>
              <td style={{ ...styles.td, background: '#11111b', verticalAlign: 'top' }}>
                <pre style={{
                  margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: 'monospace', fontSize: 10, color: '#bac2de',
                  maxHeight: 400, overflowY: 'auto',
                }}>
                  {texto || '— (sin texto generado)'}
                </pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
