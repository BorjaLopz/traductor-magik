/**
 * CSelloReconcentracion.tsx
 * Migración de c_sello_reconcentracion.magik  (Sigma Tao / Traza: Planos, vnguzman 2006)
 *
 * Jerarquía Magik: c_sello_reconcentracion extends :c_base_sello_cobre
 * Propósito: sello "TABLA DE BAJANTES" — matriz de conteos UC por tipo de trabajo
 * y tipo de cable. 11 filas × 8 columnas, 4 secciones (Precableado / Reconcentración /
 * Reconexión / Rehabilitación), datos obtenidos de bajantes GIS filtrados por distrito.
 */

import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Constantes de etiquetas — equivalen a .LsvEtiquetas[1..4] (simple_vector)
// Magik: .LsvEtiquetas[N] = simple_vector.new_with(...)
// ---------------------------------------------------------------------------

/** Grupo 1 — Precableado — columna de datos: col 2 (1-based) */
const ETIQUETAS_G1 = ['CALEAE', 'CACLAE', 'CALEFA', 'CACLFA', 'CALEED', 'CACLED', 'CALESU', 'CACLSU'] as const;

/** Grupo 2 — Reconcentración — columna de datos: col 4 (1-based) */
const ETIQUETAS_G2 = ['CARSAE', 'CARSFA', 'CARSED', 'CARSSU', 'CARCAE', 'CARCFA', 'CARCED', 'CARCSU'] as const;

/** Grupo 3 — Reconexión — columna de datos: col 6 (1-based) — solo 2 etiquetas */
const ETIQUETAS_G3 = ['CAA014', 'CAS014'] as const;

/** Grupo 4 — Rehabilitación — columna de datos: col 8 (1-based) */
const ETIQUETAS_G4 = ['CARLAE', 'DADLAE', 'CARLED', 'DADLED', 'CARLFA', 'DADLFA', 'CARLSU', 'DADLSU'] as const;

const SECCIONES: { nombre: string; etiquetas: readonly string[]; maxRows: number }[] = [
  { nombre: 'Precableado',     etiquetas: ETIQUETAS_G1, maxRows: 8 },
  { nombre: 'Reconcentración', etiquetas: ETIQUETAS_G2, maxRows: 8 },
  { nombre: 'Reconexión',      etiquetas: ETIQUETAS_G3, maxRows: 2 },
  { nombre: 'Rehabilitación',  etiquetas: ETIQUETAS_G4, maxRows: 8 },
];

// ---------------------------------------------------------------------------
// Tipos — equivalentes a la colección que devuelve ucs()
// ---------------------------------------------------------------------------

/** Un elemento UC — Magik: clave[0]=tipo, valor[:cantidad]=number */
export interface UCItem {
  tipo    : string;   // LoLlave[1].write_string  — e.g. 'CALEAE'
  cantidad: number;   // LoElemento[:cantidad]
}

// ---------------------------------------------------------------------------
// Mock GIS — simula gis_program_manager.cached_dataset(:gis)
// filtrado por distrito + c_administrador_costeo.get_elementos()
// ---------------------------------------------------------------------------

/** Mock de bajantes + costeo por distrito */
const MOCK_UCS: UCItem[] = [
  // Grupo 1 — Precableado
  { tipo: 'CALEAE', cantidad: 12 }, { tipo: 'CACLAE', cantidad:  5 },
  { tipo: 'CALEFA', cantidad:  8 }, { tipo: 'CACLFA', cantidad:  3 },
  { tipo: 'CALEED', cantidad:  7 }, { tipo: 'CACLED', cantidad:  2 },
  { tipo: 'CALESU', cantidad: 15 }, { tipo: 'CACLSU', cantidad:  0 },
  // Grupo 2 — Reconcentración
  { tipo: 'CARSAE', cantidad:  4 }, { tipo: 'CARSFA', cantidad:  6 },
  { tipo: 'CARSED', cantidad:  1 }, { tipo: 'CARSSU', cantidad:  9 },
  { tipo: 'CARCAE', cantidad: 11 }, { tipo: 'CARCFA', cantidad:  3 },
  { tipo: 'CARCED', cantidad:  0 }, { tipo: 'CARCSU', cantidad:  7 },
  // Grupo 3 — Reconexión (solo 2)
  { tipo: 'CAA014', cantidad: 20 }, { tipo: 'CAS014', cantidad: 14 },
  // Grupo 4 — Rehabilitación
  { tipo: 'CARLAE', cantidad:  5 }, { tipo: 'DADLAE', cantidad:  2 },
  { tipo: 'CARLED', cantidad:  8 }, { tipo: 'DADLED', cantidad:  3 },
  { tipo: 'CARLFA', cantidad:  6 }, { tipo: 'DADLFA', cantidad:  1 },
  { tipo: 'CARLSU', cantidad:  9 }, { tipo: 'DADLSU', cantidad:  4 },
];

// ---------------------------------------------------------------------------
// ucs() — equivalente al método Magik
// Magik: filtra bajantes por active_scheme.user!_distrito,
//        luego c_administrador_costeo.get_elementos() devuelve (LocollUcs, LocollFaltas)
// ---------------------------------------------------------------------------
async function fetchUcs(_distrito: string): Promise<UCItem[]> {
  // Simula latencia de red / BD GIS
  await new Promise(r => setTimeout(r, 200));
  // Magik: LocollUcs.add_all(LocollFaltas) → retorna unión de UCs y faltas
  return MOCK_UCS;
}

// ---------------------------------------------------------------------------
// llena_datos_celdas — agrupa UCs en la matriz de conteos
// Magik: LcollTotalUcs[N][M] = suma de cantidad donde LsvEtiquetas[N] incluye tipo
//        Si el acumulador es _unset → asigna, else → suma (+<<)
// ---------------------------------------------------------------------------
function buildDataMatrix(ucs: UCItem[]): Record<string, number> {
  // clave: "grupoIdx_rowIdx" → valor acumulado
  const acc: Record<string, number> = {};

  for (const uc of ucs) {
    for (let g = 0; g < 4; g++) {
      const idx = SECCIONES[g].etiquetas.indexOf(uc.tipo as never);
      if (idx !== -1) {
        const key = `${g}_${idx}`;
        // Magik: _if LcollTotalUcs[N][M] _is _unset → asigna, else → suma
        acc[key] = (acc[key] ?? 0) + uc.cantidad;
        break;
      }
    }
  }
  return acc;
}

// ---------------------------------------------------------------------------
// configura_tabla — estructura dimensional
// Magik: crea_tabla(11, 8, :tbl_reconcentracion)
//   Row 1: nLongitud=10mm; rows 2-11: nLongitud=5mm
//   Cols 1-8: nLongitud=13mm
//   Bordes ocultos:
//     Fila 1, cols 1-7: bBorde_Der? = false  → título visualmente fusionado
//     Fila 2, cols impares (1,3,5,7): bBorde_Der? = false → sección span 2 cols
// ---------------------------------------------------------------------------

/** Determina si la celda [fi][ci] tiene borde derecho visible */
function hasBorderRight(fi: number, ci: number, numCols: number): boolean {
  if (ci === numCols - 1) return false; // última col nunca tiene borde der
  if (fi === 0) return false;           // fila 1: todos ocultos excepto último
  if (fi === 1 && ci % 2 === 0) return false; // fila 2: cols impares (0-based par) ocultos
  return true;
}

// ---------------------------------------------------------------------------
// Subcomponente de celda
// ---------------------------------------------------------------------------
const SCALE = 3.5; // px por mm
const ROW_HEIGHTS = [10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]; // mm — fila 1: 10, resto: 5
const COL_WIDTH   = 13; // mm

function CeldaTabla({
  fi, ci, text, isData, borderRight,
}: {
  fi: number; ci: number; text: string;
  isData: boolean; borderRight: boolean;
}) {
  const h = ROW_HEIGHTS[fi] * SCALE;
  const w = COL_WIDTH * SCALE;

  return (
    <td style={{
      height       : h,
      width        : w,
      minWidth     : w,
      maxWidth     : w,
      padding      : '1px 2px',
      verticalAlign: 'middle',
      textAlign    : 'center',
      overflow     : 'hidden',
      whiteSpace   : 'nowrap',
      fontSize     : fi === 0 ? 10 : 8,
      fontWeight   : fi <= 1 ? 'bold' : 'normal',
      color        : isData ? '#f9e2af' : '#cdd6f4',
      background   : fi === 0 ? '#2a2d3e' : fi === 1 ? '#1e2133' : fi === 2 ? '#232535' : 'transparent',
      borderRight  : borderRight ? '1px solid #45475a' : 'none',
      borderBottom : '1px solid #45475a',
    }}>
      {text || (isData && fi > 2 ? '0' : '')}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — CSelloReconcentracion
// ---------------------------------------------------------------------------
export function CSelloReconcentracionUI() {
  const [distrito,   setDistrito]   = useState('NORTE');
  const [dataMatrix, setDataMatrix] = useState<Record<string, number>>({});
  const [loading,    setLoading]    = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [totalUcs,   setTotalUcs]   = useState(0);

  // draw_content_on / inicializa equivalente — carga UCs y construye matriz
  async function cargar() {
    setLoading(true);
    // Magik: ucs() → bajantes filtrados por distrito + costeo
    const ucs = await fetchUcs(distrito);
    const matrix = buildDataMatrix(ucs);
    setDataMatrix(matrix);
    setTotalUcs(ucs.reduce((s, u) => s + u.cantidad, 0));
    setLoaded(true);
    setLoading(false);
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Construye el texto de cada celda [fi][ci] (0-based)
  function cellText(fi: number, ci: number): string {
    // Fila 0 — título
    if (fi === 0) {
      // Magik: LoCeldas.Celda(1,4).oElemento = c_texto_grafico.new("TABLA DE BAJANTES")
      return ci === 3 ? 'TABLA DE BAJANTES' : '';
    }

    // Fila 1 — cabeceras de sección (cols impares 0-based = 0,2,4,6)
    if (fi === 1) {
      // Magik: LoCeldas.Celda(2, 2*LnN-1).oElemento = c_texto_grafico.new(LsValor)
      // LnN=1→ci=0, LnN=2→ci=2, LnN=3→ci=4, LnN=4→ci=6
      if (ci % 2 === 0) return SECCIONES[ci / 2]?.nombre ?? '';
      return '';
    }

    // Fila 2 — sub-cabeceras "UC" / "Total"
    if (fi === 2) {
      // Magik: Celda(3, 2*LnPos-1)="UC", Celda(3, 2*LnPos)="Total" para LnPos=1..4
      if (ci % 2 === 0) return 'UC';
      return 'Total';
    }

    // Filas 3-10 — datos
    const rowIdx = fi - 3; // 0-based dentro de la sección (0..7)

    // Columnas impares (0,2,4,6) → etiqueta del tipo
    if (ci % 2 === 0) {
      const grupoIdx = ci / 2; // 0..3
      return SECCIONES[grupoIdx]?.etiquetas[rowIdx] ?? '';
    }

    // Columnas pares (1,3,5,7) → dato de conteo
    // Magik: LoCeldas.Celda(3+LnM, 2*LnN).oElemento = c_texto_grafico.new(LsNumero)
    const grupoIdx = (ci - 1) / 2; // 0..3
    const key      = `${grupoIdx}_${rowIdx}`;
    if (!loaded) return '…';
    return String(dataMatrix[key] ?? 0);
  }

  function isDataCell(fi: number, ci: number): boolean {
    return fi >= 3 && ci % 2 === 1; // cols de datos (0-based par = impar 1-based)
  }

  const NUM_ROWS = 11;
  const NUM_COLS = 8;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e', color: '#cdd6f4', padding: 16, borderRadius: 8 }}>
      {/* Cabecera */}
      <div style={{ borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CSelloReconcentracion</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          :c_base_sello_cobre → sello "TABLA DE BAJANTES" — {NUM_ROWS}f × {NUM_COLS}c
        </span>
      </div>

      {/* Control de distrito */}
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ fontSize: 11, color: '#585b70' }}>
          Distrito activo (swg_dsn_admin_engine.active_scheme.user!_distrito):
        </label>
        <input
          value={distrito}
          onChange={e => setDistrito(e.target.value)}
          style={{ background: '#313244', border: '1px solid #45475a', color: '#cdd6f4',
                   borderRadius: 4, padding: '3px 8px', fontSize: 12, fontFamily: 'monospace', width: 120 }}
        />
        <button
          onClick={cargar}
          disabled={loading}
          style={{ padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                   background: loading ? '#313244' : '#a6e3a1', color: '#1e1e2e',
                   fontFamily: 'monospace', fontSize: 11 }}>
          {loading ? 'cargando…' : 'ucs() + llena_datos_celdas()'}
        </button>
        {loaded && (
          <span style={{ fontSize: 11, color: '#a6e3a1' }}>
            {MOCK_UCS.length} UCs · total cant: {totalUcs}
          </span>
        )}
      </div>

      {/* Leyenda de bordes */}
      <div style={{ fontSize: 10, color: '#585b70', marginBottom: 8 }}>
        Fila 1: bordes der ocultos → título fusionado (cols 1-7).
        {' '}Fila 2: bordes der ocultos en cols impares → sección abarca 2 cols.
      </div>

      {/* Tabla principal — tbl_reconcentracion */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          border         : '1px solid #45475a',
          tableLayout    : 'fixed',
          width          : NUM_COLS * COL_WIDTH * SCALE,
        }}>
          <colgroup>
            {Array.from({ length: NUM_COLS }, (_, ci) => (
              <col key={ci} style={{ width: COL_WIDTH * SCALE }} />
            ))}
          </colgroup>
          <tbody>
            {Array.from({ length: NUM_ROWS }, (_, fi) => (
              <tr key={fi}>
                {Array.from({ length: NUM_COLS }, (_, ci) => (
                  <CeldaTabla
                    key={ci}
                    fi={fi} ci={ci}
                    text={cellText(fi, ci)}
                    isData={isDataCell(fi, ci)}
                    borderRight={hasBorderRight(fi, ci, NUM_COLS)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de diagnóstico — matriz de datos */}
      {loaded && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: '#585b70' }}>
            LcollTotalUcs — matriz de conteos por grupo
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 8 }}>
            {SECCIONES.map((sec, g) => (
              <div key={g}>
                <div style={{ fontSize: 10, color: '#89dceb', marginBottom: 4, fontWeight: 'bold' }}>
                  G{g+1}: {sec.nombre}
                </div>
                {sec.etiquetas.map((et, m) => (
                  <div key={m} style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: '#585b70' }}>{et}</span>
                    <span style={{ color: '#f9e2af' }}>{dataMatrix[`${g}_${m}`] ?? 0}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Dimensiones */}
      <div style={{ marginTop: 10, fontSize: 10, color: '#585b70' }}>
        Dimensiones: fila-1={ROW_HEIGHTS[0]}mm · filas-2..11={ROW_HEIGHTS[1]}mm × 8cols={COL_WIDTH}mm cada una
        {' '}→ {ROW_HEIGHTS[0] + 10 * ROW_HEIGHTS[1]}mm alto × {NUM_COLS * COL_WIDTH}mm ancho
      </div>
    </div>
  );
}

export default CSelloReconcentracionUI;
