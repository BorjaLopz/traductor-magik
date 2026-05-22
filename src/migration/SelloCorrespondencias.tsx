/**
 * Migración de: c_sello_correspondencias.magik
 * Clase Magik:  c_sello_correspondencias — Sigma Tao / aalarcon / 18-May-2011
 *               (12/03/21 rhernan): added multi-sello support after master_series clone
 *
 * Genera la "Tabla de Correspondencia" para planos de diagramas de empalmes FO.
 * Tres secciones apiladas: título → subtítulos (NCO / Distrito) → contenido (7 cols).
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Equivale al property_list devuelto por obten_datos_dist_optico */
export interface DistOpticoData {
  siglas_nco:      string;   // LoDistOptico.user!_siglas_nco
  nombre_distrito: string;   // LoDistOptico.user!_distrito
}

/** Una fila de correspondencia (campos del loop sobre PoDatosCorrespondencia) */
export interface CorrespondenciaRow {
  no_cable:  string;   // [:no_cable]
  fo_prin:   string;   // [:fo_prin]   — Fibra Asignada Principal
  divisor:   string;   // [:divisor]   — Divisor Óptico
  cable_sec: string;   // [:cable_sec] — Cable Secundario
  fo_sec:    string;   // [:fo_sec]    — Fibra Asignada Secundaria
  terminal:  string;   // [:terminal]
  puertos:   string;   // [:puertos]
}

/** Servicio externo para obtener datos (reemplaza acceso a mit_manager dataset) */
export interface SelloCorrespondenciasService {
  /** Magik: LoTablaCedo.at(id) → .distrito_optico → siglas/nombre */
  obtenerDatosDistOptico(idCedo: number): Promise<DistOpticoData>;
  /** Magik: c_distrito.obten_datos_correspondencia(idCedo) */
  obtenerCorrespondencias(idCedo: number): Promise<CorrespondenciaRow[]>;
}

// =============================================================================
// MOCK SERVICE
// =============================================================================

export const mockSelloCorrespondenciasService: SelloCorrespondenciasService = {
  async obtenerDatosDistOptico(_idCedo) {
    return {
      siglas_nco:      'NCO-SUR',
      nombre_distrito: 'DISTRITO VALLEJO',
    };
  },
  async obtenerCorrespondencias(_idCedo) {
    return Array.from({ length: 8 }, (_, i) => ({
      no_cable:  `C-${String(i + 1).padStart(3, '0')}`,
      fo_prin:   `FP-${i * 2 + 1}`,
      divisor:   `DO-${i + 1}`,
      cable_sec: `CS-${String(i + 1).padStart(3, '0')}-SEC`,
      fo_sec:    `FS-${i * 2 + 2}`,
      terminal:  `T-${i + 1}`,
      puertos:   `${(i % 4) + 1}`,
    }));
  },
};

// =============================================================================
// CLASE PRINCIPAL
// Magik: def_slotted_exemplar(:c_sello_correspondencias, {}, :c_base_sello_fibra)
// =============================================================================

const MAX_FILAS_CONTENIDO = 40; // Magik: _if cont <= 40

export class CSelloCorrespondencias {

  // shared_variables Magik → propiedades de instancia con defaults
  terminales:   unknown[] = [];    // .define_shared_variable(:Terminales, rope.new())
  numeroCiclos: number    = 1;     // .define_shared_variable(:numero_ciclos, 1)
  loNumeroMax:  number    = 1;     // .define_shared_variable(:LoNumero_max, 1)
  idCedo?:      number;

  // ── configura_tabla ──────────────────────────────────────────────────────────
  // Magik: crea tres tablas (tbl_titulo / tbl_subtitulos / tbl_contenido).
  // Aquí devuelve la config que el componente React usa para renderizar.
  configurarTabla(numeroRenglones?: number): TableLayout {
    // Magik: _if PoNumeroRenglones _isnt _unset _then LoTotRenglones << PoNumeroRenglones
    //        _elif ... = 0 _then LoTotRenglones << 1
    const totalFilas = (numeroRenglones !== undefined && numeroRenglones > 0)
      ? numeroRenglones
      : 1;

    return {
      titulo: {
        filas: 1,
        columnas: [{ longitud: 110 }],   // ocolumnas.elemento(1).nlongitud << 110
      },
      subtitulos: {
        filas: 1,
        columnas: [                       // 55 + 55
          { longitud: 55 },
          { longitud: 55 },
        ],
      },
      contenido: {
        // Primera fila: nlongitud = 20; resto: 10
        filas: totalFilas,
        alturaFilas: (fila: number) => fila === 0 ? 20 : 10,
        columnas: [                       // 12+12+12+32+16+16+10 = 110
          { longitud: 12 },
          { longitud: 12 },
          { longitud: 12 },
          { longitud: 32 },
          { longitud: 16 },
          { longitud: 16 },
          { longitud: 10 },
        ],
      },
    };
  }

  // ── etiqueta_celdas ──────────────────────────────────────────────────────────
  // Magik: asigna_texto_celda(tabla, fila, col, texto, tam, alineacion, rot, color)
  // Devuelve los textos estáticos de cabecera.
  etiquetarCeldas(): HeaderLabels {
    return {
      titulo: 'TABLA DE CORRESPONDENCIA',
      nco:    'NCO: ',
      distrito: 'DISTRITO: ',
      columnas: [
        'No. DE\nCABLE',
        'FIBRA\nASIGNADA\n(PRINCIPAL)',
        'DIVISOR\nÓPTICO',
        'CABLE SECUNDARIO',
        'FIBRA\nASIGNADA\n(SECUNDARIA)',
        'TERMINAL',
        'PUERTOS',
      ],
    };
  }

  // ── llena_datos_tabla_correspondencias ───────────────────────────────────────
  // Magik: itera PoDatosCorrespondencia, avanza .LoNumero_max, máx 40 filas.
  llenaDatos(
    distOptico:   DistOpticoData,
    datos:        CorrespondenciaRow[],
  ): FilledTableData {
    this.loNumeroMax = 1;   // reset para este sello
    const filas: CorrespondenciaRow[] = [];

    // Magik: _for dato _over 1.upto(PoDatosCorrespondencia.size)
    for (let i = 0; i < datos.length; i++) {
      if (filas.length >= MAX_FILAS_CONTENIDO) break;      // cont <= 40

      // Magik: _if _self.LoNumero_max <= PoDatosCorrespondencia.size
      if (this.loNumeroMax <= datos.length) {
        filas.push(datos[this.loNumeroMax - 1]);
        this.loNumeroMax += 1;                             // .LoNumero_max +<< 1
      }
    }

    return { distOptico, filas };
  }

  // ── obten_datos_dist_optico ──────────────────────────────────────────────────
  // Magik: mit_manager.modelit_dataset.collection(:user!_empalme_distribucion)
  //        .at(PoIdCedo) → .distrito_optico
  async obtenerDatosDistOptico(
    idCedo:  number,
    service: SelloCorrespondenciasService,
  ): Promise<DistOpticoData> {
    return service.obtenerDatosDistOptico(idCedo);
  }
}

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface ColDef   { longitud: number }
interface TableSection { filas: number; columnas: ColDef[] }
interface ContentSection extends TableSection { alturaFilas: (fila: number) => number }
interface TableLayout {
  titulo:     TableSection;
  subtitulos: TableSection;
  contenido:  ContentSection;
}
interface HeaderLabels {
  titulo:   string;
  nco:      string;
  distrito: string;
  columnas: string[];
}
interface FilledTableData {
  distOptico: DistOpticoData;
  filas:      CorrespondenciaRow[];
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

// Anchos de columna en % proporcional al total (12+12+12+32+16+16+10 = 110)
const COL_WIDTHS_PCT = [12, 12, 12, 32, 16, 16, 10].map(w => `${(w / 110) * 100}%`);

interface Props {
  service?: SelloCorrespondenciasService;
}

export function SelloCorrespondenciasUI({ service = mockSelloCorrespondenciasService }: Props) {

  const [idCedo,    setIdCedo]    = useState<number>(1);
  const [numFilas,  setNumFilas]  = useState<number>(8);
  const [data,      setData]      = useState<FilledTableData | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const sello = new CSelloCorrespondencias();
  const labels = sello.etiquetarCeldas();

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const distOptico = await service.obtenerDatosDistOptico(idCedo);
      const rawDatos   = await service.obtenerCorrespondencias(idCedo);
      const filled     = sello.llenaDatos(distOptico, rawDatos);
      setData(filled);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <h3 style={s.h3}>c_sello_correspondencias</h3>

      {/* Controles demo */}
      <div style={s.controls}>
        <label style={s.lbl}>ID CEDO</label>
        <input
          style={s.inp}
          type="number"
          value={idCedo}
          onChange={e => setIdCedo(+e.target.value)}
        />
        <label style={s.lbl}>Núm. renglones</label>
        <input
          style={s.inp}
          type="number"
          min={1}
          max={40}
          value={numFilas}
          onChange={e => setNumFilas(+e.target.value)}
        />
        <button style={s.btn} onClick={cargar} disabled={loading}>
          {loading ? 'Cargando…' : 'Generar tabla'}
        </button>
      </div>

      {error && <p style={s.err}>{error}</p>}

      {/* Tabla de correspondencias */}
      <div style={s.tableWrap}>

        {/* tbl_titulo */}
        <table style={s.tbl}>
          <tbody>
            <tr>
              <td style={{ ...s.tdTitulo }}>{labels.titulo}</td>
            </tr>
          </tbody>
        </table>

        {/* tbl_subtitulos */}
        <table style={s.tbl}>
          <tbody>
            <tr>
              <td style={{ ...s.tdSub, width: '50%' }}>
                {labels.nco}
                <strong>{data?.distOptico.siglas_nco ?? '—'}</strong>
              </td>
              <td style={{ ...s.tdSub, width: '50%' }}>
                {labels.distrito}
                <strong>{data?.distOptico.nombre_distrito ?? '—'}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* tbl_contenido */}
        <table style={s.tbl}>
          <colgroup>
            {COL_WIDTHS_PCT.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              {labels.columnas.map((col, i) => (
                <th key={i} style={s.th}>
                  {col.split('\n').map((line, j) => (
                    <React.Fragment key={j}>{line}{j < col.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.filas.map((fila, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                <td style={s.td}>{fila.no_cable}</td>
                <td style={s.td}>{fila.fo_prin}</td>
                <td style={s.td}>{fila.divisor}</td>
                <td style={s.td}>{fila.cable_sec}</td>
                <td style={s.td}>{fila.fo_sec}</td>
                <td style={s.td}>{fila.terminal}</td>
                <td style={s.td}>{fila.puertos}</td>
              </tr>
            ))}
            {(!data || data.filas.length === 0) && (
              <tr>
                <td colSpan={7} style={{ ...s.td, color: '#aaa', textAlign: 'center' }}>
                  Sin datos — pulsa "Generar tabla"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap     : { fontFamily: 'sans-serif', fontSize: 12 },
  h3       : { margin: '0 0 10px', fontSize: 14, fontWeight: 'bold' },
  controls : { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  lbl      : { color: '#555', fontSize: 12 },
  inp      : { width: 70, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 3 },
  btn      : { padding: '5px 14px', background: '#2E4057', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  err      : { color: '#c00', fontSize: 12 },
  tableWrap: { border: '1px solid #333', display: 'inline-block', minWidth: 640, width: '100%' },
  tbl      : { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  tdTitulo : { padding: '5px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: 13,
               background: '#2E4057', color: '#fff', borderBottom: '1px solid #333' },
  tdSub    : { padding: '4px 8px', borderBottom: '1px solid #333', borderRight: '1px solid #333', fontSize: 12 },
  th       : { padding: '4px 6px', background: '#4a6080', color: '#fff', textAlign: 'center',
               fontSize: 11, fontWeight: 'bold', border: '1px solid #333', verticalAlign: 'middle', lineHeight: 1.3 },
  td       : { padding: '3px 6px', border: '1px solid #ccc', fontSize: 11, textAlign: 'center' },
};

export default SelloCorrespondenciasUI;
