// =============================================================================
// MIGRACIÓN: c_sello_notas_sct_marg_aereo  →  CSelloNotasSctMargAereo.tsx
// Jerarquía Magik: c_sello_notas_sct_marg_aereo  extends  :c_sello_notas_sct
// Fuente: adiciones_layout/source/Sellos/c_sello_notas_sct_marg_aereo.magik
// =============================================================================
//
// Sello SCT especializado en notas para "Instalación Marginal Aérea" con
// postes y cable de FO/cobre. Subclase final que:
//   · Configura `:tbl_notas_grales` (2×1, alturas 10/120 mm, ancho 160 mm).
//   · Añade las notas 5–8 al texto del padre, parametrizadas con
//     .s_tipo_cable y .s_estado.
//
// Reusa el stub CSelloNotasSct + tipo Coord de CSelloNotasSctCruzSubPte.tsx.
// =============================================================================

import React, { useMemo, useState } from 'react';
import { CSelloNotasSct, type Coord } from './CSelloNotasSctCruzSubPte';

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CSelloNotasSctMargAereo extends CSelloNotasSct {
  // Magik: define_shared_constant :allowed_on_menu? = _false
  static readonly allowed_on_menu = false;

  // ── prvCrea_Cfg_Tbl_Notas_Grales(RoCoord) ───────────────────────────────
  // Magik: tabla 2×1, alturas 10/120 mm, ancho col 160 mm.
  prvCrea_Cfg_Tbl_Notas_Grales(roCoord: Coord): void {
    const t = this.oTablas.crea_tabla(2, 1, 'tbl_notas_grales');
    t.oCoordenada_Origen = roCoord;
    t.oRenglones.elemento(1).nLongitud = 10;
    t.oRenglones.elemento(2).nLongitud = 120;
    t.oColumnas.elemento(1).nLongitud  = 160;
  }

  // ── prvAsignaTexto() — override ──────────────────────────────────────────
  // Magik: _super.prvAsignaTexto() + concatena (con +<<) las notas 5–8
  // sobre instalación marginal aérea con postes y cable.
  override prvAsignaTexto(): void {
    super.prvAsignaTexto();

    const NL = '\n';
    let LsTexto = NL;
    LsTexto += ` 5.- LA UBICACIÓN DE LA INSTALACIÓN MARGINAL AÉREA CON CABLE DE ${this.s_tipo_cable}`;
    LsTexto += NL;
    LsTexto += ' INDICADO EN ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA';
    LsTexto += NL;
    LsTexto += ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${this.s_estado}.`;
    LsTexto += NL + NL;
    LsTexto += ` 6.- LA INSTALACIÓN MARGINAL AÉREA CON POSTES Y CABLE DE ${this.s_tipo_cable} QUE SE `;
    LsTexto += NL;
    LsTexto += ' INDICA EN ESTE PROYECTO DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES DE LA ';
    LsTexto += NL;
    LsTexto += ' RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS, ASÍ COMO LAS RECOMENDACIONES ';
    LsTexto += NL;
    LsTexto += ' QUE SEAN DERIVADAS DE LAS INSPECCIONES EN CAMPO.';
    LsTexto += NL + NL;
    LsTexto += ` 7.- LA INSTALACIÓN MARGINAL AÉREA CON POSTES Y CABLE DE ${this.s_tipo_cable} QUE SE `;
    LsTexto += NL;
    LsTexto += ' INDICA EN ESTE PROYECTO DENTRO DEL ÁREA DEL DERECHO DE VÍA, DEBERÁ EFECTUARSE EN ';
    LsTexto += NL;
    LsTexto += ' UNA FRANJA PARALELA AL EJE DEL CAMINO CON UN ANCHO NO MAYOR DE 2.50 M. MEDIDOS A ';
    LsTexto += NL;
    LsTexto += ' PARTIR DEL LIMITE DEL DERECHO DE VÍA. ';
    LsTexto += NL + NL;
    LsTexto += ` 8.- LOS CRUZAMIENTOS SUBTERRÁNEOS Y/O AÉREOS CON CABLE ${this.s_tipo_cable},`;
    LsTexto += NL;
    LsTexto += ' QUE SE PRETENDAN EFECTUAR DERIVADOS DE ESTA INSTALACIÓN MARGINAL AÉREA DEBERÁN ';
    LsTexto += NL;
    LsTexto += ' SOLICITARSE POR SEPARADO, PRESENTANDO PLANO DETALLADO DEL PROYECTO DEL CRUZAMIENTO. ';

    const cel = this.oTablas.elemento('tbl_notas_grales')?.oCeldas.Celda(2, 1);
    if (cel) {
      cel.oElemento.sTexto += LsTexto; // Magik: +<<
    }
  }
}

// =============================================================================
// Componente React — CSelloNotasSctMargAereoUI
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
  preTable: { width: '100%', borderCollapse: 'collapse' as const, marginTop: 8 },
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

const CABLES_PRESET  = ['FIBRA OPTICA', 'COBRE 200 PARES', 'COBRE 600 PARES', 'FIBRA OPTICA 144H'] as const;
const ESTADOS_PRESET = ['JALISCO', 'NUEVO LEÓN', 'CIUDAD DE MÉXICO', 'PUEBLA', 'YUCATÁN'] as const;

export function CSelloNotasSctMargAereoUI() {
  const [tipoCable, setTipoCable] = useState<string>('FIBRA OPTICA');
  const [estado,    setEstado]    = useState<string>('JALISCO');
  const [coordX,    setCoordX]    = useState(20);
  const [coordY,    setCoordY]    = useState(50);

  const sello = useMemo(() => {
    const s = new CSelloNotasSctMargAereo();
    s.s_tipo_cable = tipoCable;
    s.s_estado     = estado;
    s.prvCrea_Cfg_Tbl_Notas_Grales({ x: coordX, y: coordY });
    s.prvAsignaTexto();
    return s;
  }, [tipoCable, estado, coordX, coordY]);

  const tabla = sello.oTablas.elemento('tbl_notas_grales');
  const texto = tabla?.oCeldas.Celda(2, 1).oElemento.sTexto ?? '';

  return (
    <div style={styles.wrap}>
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CSelloNotasSctMargAereo
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          c_sello_notas_sct → notas SCT instalación marginal aérea
        </span>
      </div>

      {/* Parámetros */}
      <div style={styles.card}>
        <div style={styles.title}>parámetros heredados — s_tipo_cable / s_estado</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <span style={{ ...styles.k, alignSelf: 'center' }}>s_tipo_cable:</span>
          {CABLES_PRESET.map(c => (
            <button
              key={c}
              onClick={() => setTipoCable(c)}
              style={{
                padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 11, marginBottom: 4,
                background: tipoCable === c ? '#89b4fa' : '#313244',
                color:      tipoCable === c ? '#1e1e2e' : '#bac2de',
              }}
            >
              {c}
            </button>
          ))}
          <input
            value={tipoCable}
            onChange={e => setTipoCable(e.target.value)}
            style={styles.textInput}
            placeholder="custom"
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ ...styles.k, alignSelf: 'center' }}>s_estado:</span>
          {ESTADOS_PRESET.map(e => (
            <button
              key={e}
              onClick={() => setEstado(e)}
              style={{
                padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontFamily: 'monospace', fontSize: 11, marginBottom: 4,
                background: estado === e ? '#a6e3a1' : '#313244',
                color:      estado === e ? '#1e1e2e' : '#bac2de',
              }}
            >
              {e}
            </button>
          ))}
          <input
            value={estado}
            onChange={e => setEstado(e.target.value)}
            style={styles.textInput}
            placeholder="custom"
          />
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

      {/* Config tabla */}
      <div style={styles.card}>
        <div style={styles.title}>tbl_notas_grales — configuración (mm)</div>
        <Field label="oCoordenada_Origen" value={`(${tabla?.oCoordenada_Origen.x}, ${tabla?.oCoordenada_Origen.y})`} />
        <Field label="renglones (alto)"   value={`R1=${tabla?.oRenglones.elemento(1).nLongitud} mm  ·  R2=${tabla?.oRenglones.elemento(2).nLongitud} mm`} />
        <Field label="columnas (ancho)"   value={`C1=${tabla?.oColumnas.elemento(1).nLongitud} mm`} />
        <Field label="texto"              value={`${texto.length} chars · ${texto.split('\n').length} líneas`} />
        <Field label="allowed_on_menu?"   value={String(CSelloNotasSctMargAereo.allowed_on_menu)} />
      </div>

      {/* Comparativa familia SCT */}
      <div style={styles.card}>
        <div style={styles.title}>familia SCT — comparativa de variantes</div>
        <Field label="alturas tabla"  value="10 / 120 mm" />
        <Field label="ancho columna"  value="160 mm" />
        <Field label="notas añadidas" value="5–8 (4 notas)" />
        <Field label="dominio"        value="Instalación marginal aérea con postes" />
        <div style={{ fontSize: 10, color: '#585b70', marginTop: 6 }}>
          cruz_sub_pte: 10/150/165 · 6 notas  ·  inst_puente_tn: 10/160/170 · 7 notas
        </div>
      </div>

      {/* Render tabla */}
      <div style={styles.card}>
        <div style={styles.title}>render — celda (2,1).oElemento.sTexto</div>
        <table style={styles.preTable}>
          <tbody>
            <tr style={{ height: 30 }}>
              <td style={{ ...styles.td, background: '#313244', color: '#cba6f7', textAlign: 'center', fontWeight: 'bold' }}>
                NOTAS GENERALES — INSTALACIÓN MARGINAL AÉREA (cabecera 10 mm)
              </td>
            </tr>
            <tr>
              <td style={{ ...styles.td, background: '#11111b', verticalAlign: 'top' }}>
                <pre style={{
                  margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: 'monospace', fontSize: 10, color: '#bac2de',
                  maxHeight: 420, overflowY: 'auto',
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
