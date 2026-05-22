/**
 * CSelloDistDeTerACd.tsx
 * Migration: c_sello_dist_de_ter_a_cd.magik → TypeScript/React
 * Hereda de: c_base_sello_fibra
 *
 * Sello de Layout Designer que muestra la distancia de cada terminal
 * de un edificio (o distrito óptico) a la Central Distribuidora (C.D.).
 * La cuadrícula 17×5 usa letras de fila (A-S, sin I/N/Q) y números de
 * columna (1-5); cada celda muestra la distancia en km con 3 decimales.
 */

import React, { useState, useCallback } from 'react';

// ── UbicaCoord ────────────────────────────────────────────────────────────────
// define_shared_constant(:UbicaCoord, hash_table.new_with(...)) +
// CompletaSharedVariable()  →  generado programáticamente
//
// Magik: coordinate(x, y) = coordinate(col, row)
//   col: 2-6  (posiciones 1-5 en tbl_contenido, tras la col de etiquetas)
//   row: 2-17 (posiciones A-S en tbl_contenido, tras la fila de cabeceras)

export interface GridPos { col: number; row: number; }

// Letras de fila usadas (se omiten I, N, Q — igual que en el Magik original)
const ROW_LETTERS = ['A','B','C','D','E','F','G','H','J','K','L','M','O','P','R','S'];
const COL_NUMBERS = ['1','2','3','4','5'];

export const UBICA_COORD: Readonly<Record<string, GridPos>> = (() => {
  const map: Record<string, GridPos> = {};
  ROW_LETTERS.forEach((letter, li) => {
    for (let n = 1; n <= 5; n++) {
      // coordinate(n+1, li+2) — misma fórmula que hash_table.new_with + CompletaSharedVariable
      map[`${letter}${n}`] = { col: n + 1, row: li + 2 };
    }
  });
  return map;
})();

// ── configurarTabla() ─────────────────────────────────────────────────────────
// Equivale a configura_tabla() + asigna_medidas_tabla()

export interface TablaLayout {
  id        : string;
  filas     : number;
  columnas  : number;
  rowHeights: number[];  // mm por rengón
  colWidths : number[];  // mm por columna
}

export function configurarTabla(): [TablaLayout, TablaLayout] {
  // tbl_titulo: 1×1, renglon=5mm, columna=40mm
  const titulo: TablaLayout = {
    id: 'tbl_titulo', filas: 1, columnas: 1,
    rowHeights: [5], colWidths: [40],
  };

  // tbl_contenido: 17×6
  // ren = {5,5,...5}×17   col = {5,7,7,7,7,7}
  const contenido: TablaLayout = {
    id: 'tbl_contenido', filas: 17, columnas: 6,
    rowHeights: Array<number>(17).fill(5),
    colWidths: [5, 7, 7, 7, 7, 7],
  };

  return [titulo, contenido];
}

// ── defined_attributes ────────────────────────────────────────────────────────
// idEdificio: integer, allowed_on_properties_page? = false

export interface SelloAtribs {
  idEdificio: number | null;
}

// ── Mock GIS data ─────────────────────────────────────────────────────────────
// Sustituye: gis_program_manager.cached_dataset(:gis).collections[:user!_building]
//            gis_program_manager.cached_dataset(:landbase).collections[:user!_distrito_optico]

interface MockTerminal {
  id    : string;  // user!_cuenta → canonical symbol (ej. 'A1')
  distCd: number;  // user!_distancia_cd en km
}

interface MockBuilding {
  id       : number;
  nombre   : string;
  terminals: MockTerminal[];
}

interface MockDistrict {
  id         : number;
  nombre     : string;
  buildingIds: number[];  // edificios contenidos (predicate.inside)
}

const MOCK_BUILDINGS: MockBuilding[] = [
  {
    id: 1001, nombre: 'EDIFICIO CENTRO NORTE',
    terminals: [
      { id:'A1', distCd:1.234 }, { id:'A2', distCd:1.456 }, { id:'A3', distCd:1.789 },
      { id:'B1', distCd:2.123 }, { id:'B3', distCd:2.567 }, { id:'B5', distCd:2.891 },
      { id:'C2', distCd:3.345 }, { id:'C4', distCd:3.678 },
      { id:'D1', distCd:4.234 }, { id:'D3', distCd:4.567 }, { id:'D5', distCd:4.890 },
      { id:'E2', distCd:5.123 }, { id:'E4', distCd:5.456 },
    ],
  },
  {
    id: 1002, nombre: 'EDIFICIO SUR PONIENTE',
    terminals: [
      { id:'F1', distCd:6.234 }, { id:'F3', distCd:6.567 }, { id:'F5', distCd:6.890 },
      { id:'G2', distCd:7.345 }, { id:'G4', distCd:7.678 },
      { id:'H1', distCd:8.123 }, { id:'H2', distCd:8.456 }, { id:'H5', distCd:8.789 },
      { id:'J3', distCd:9.234 }, { id:'J5', distCd:9.567 },
    ],
  },
  {
    id: 1003, nombre: 'EDIFICIO ORIENTE',
    terminals: [
      { id:'K1', distCd:10.234 }, { id:'K3', distCd:10.567 }, { id:'K5', distCd:10.890 },
      { id:'L2', distCd:11.345 }, { id:'L4', distCd:11.678 },
      { id:'M1', distCd:12.234 }, { id:'M3', distCd:12.789 },
      { id:'O2', distCd:13.456 }, { id:'O4', distCd:13.890 },
      { id:'P1', distCd:14.123 }, { id:'P5', distCd:14.567 },
      { id:'R3', distCd:15.678 },
      { id:'S1', distCd:16.234 }, { id:'S3', distCd:16.567 }, { id:'S5', distCd:16.890 },
    ],
  },
];

const MOCK_DISTRICTS: MockDistrict[] = [
  { id: 5001, nombre: 'DISTRITO OPTICO NORTE', buildingIds: [1001, 1002] },
  { id: 5002, nombre: 'DISTRITO OPTICO SUR',   buildingIds: [1002, 1003] },
];

// ── FiltrarTerminalesConDist() ────────────────────────────────────────────────
// Equivale a FiltrarTerminalesConDist(PcollCajaORegDist)
// Devuelve hash_table: terminal_id → distancia formateada

export type TerminalDistMap = Record<string, string>;

function filtrarTerminalesConDist(terminals: MockTerminal[]): TerminalDistMap {
  const result: TerminalDistMap = {};
  for (const t of terminals) {
    const key = t.id.toUpperCase().trim();
    // Solo incluir si existe posición en UbicaCoord (como _if LyId <> :no_dato)
    if (key && UBICA_COORD[key]) {
      // LfDistanciaACd.as_fixed_string(10, 3).trim_spaces()
      result[key] = t.distCd.toFixed(3);
    }
  }
  return result;
}

// ── llenarDatosCeldas() ───────────────────────────────────────────────────────
// Equivale a llena_datos_celdas() con sus dos rutas de búsqueda

export async function llenarDatosCeldas(
  idEdificio: number,
): Promise<TerminalDistMap> {
  await new Promise(r => setTimeout(r, 300));  // latencia GIS simulada

  // Ruta 1: LcollTabUserBuilding.at(idEdificio) — búsqueda directa por edificio
  const building = MOCK_BUILDINGS.find(b => b.id === idEdificio);
  if (building) {
    // LoSpatialContext → LcollRegistros → FiltrarTerminalesConDist
    return filtrarTerminalesConDist(building.terminals);
  }

  // Ruta 2: user!_distrito_optico.at(idEdificio) + predicate.inside(:boundary)
  // Busca todos los edificios dentro del límite del distrito
  const district = MOCK_DISTRICTS.find(d => d.id === idEdificio);
  if (district) {
    const combined: TerminalDistMap = {};
    for (const bId of district.buildingIds) {
      const b = MOCK_BUILDINGS.find(x => x.id === bId);
      if (!b) continue;
      const partial = filtrarTerminalesConDist(b.terminals);
      Object.assign(combined, partial);
    }
    return combined;
  }

  return {};
}

// ── buildGrid() ───────────────────────────────────────────────────────────────
// Construye la matriz 17×6 (cabeceras + datos) a partir del TerminalDistMap

function buildGrid(distances: TerminalDistMap): string[][] {
  const grid: string[][] = Array.from({ length: 17 }, () => Array<string>(6).fill(''));

  // Fila 0: cabeceras de columna (etiqueta_celdas tbl_contenido fila 1)
  grid[0] = ['', ...COL_NUMBERS];

  // Col 0: etiquetas de fila A-S (etiqueta_celdas tbl_contenido col 1)
  ROW_LETTERS.forEach((lbl, i) => { grid[i + 1][0] = lbl; });

  // Datos: asigna_texto_celda(:tbl_contenido, LoRenglon, LoColumna, LsDato, ...)
  for (const [key, dist] of Object.entries(distances)) {
    const pos = UBICA_COORD[key];
    if (!pos) continue;
    const gridRow = pos.row - 1;  // tbl_contenido row 2-17 → array index 1-16
    const gridCol = pos.col - 1;  // tbl_contenido col 2-6  → array index 1-5
    if (gridRow >= 1 && gridRow <= 16 && gridCol >= 1 && gridCol <= 5) {
      grid[gridRow][gridCol] = dist;
    }
  }

  return grid;
}

// ── Componente React ──────────────────────────────────────────────────────────

// colour.new_rgb(0, 0.2993, 0) → R=0 G=76 B=0
const GREEN = 'rgb(0,76,0)';
// colour.new_rgb(1, 0, 0) → rojo para valores de distancia
const RED = 'rgb(180,0,0)';

// Anchos px proporcionales a colWidths [5,7,7,7,7,7] mm (×4)
const COL_PX = [20, 52, 52, 52, 52, 52];

export function CSelloDistDeTerACdUI() {
  const [inputId,   setInputId]   = useState('');
  const [distances, setDistances] = useState<TerminalDistMap>({});
  const [status,    setStatus]    = useState('');
  const [loading,   setLoading]   = useState(false);

  const cargar = useCallback(async () => {
    const id = parseInt(inputId, 10);
    if (isNaN(id) || id <= 0) { setStatus('ID inválido.'); return; }
    setLoading(true);
    setStatus('Consultando GIS…');
    try {
      const result = await llenarDatosCeldas(id);
      setDistances(result);
      const n = Object.keys(result).length;
      setStatus(n > 0
        ? `${n} terminal${n !== 1 ? 'es' : ''} cargada${n !== 1 ? 's' : ''}.`
        : 'Sin terminales para ese ID.');
    } catch {
      setStatus('Error al consultar GIS.');
    }
    setLoading(false);
  }, [inputId]);

  const grid = buildGrid(distances);

  return (
    <div style={st.root}>

      {/* Controles — llena_datos_celdas(idEdificio) */}
      <div style={st.controls}>
        <label style={st.field}>
          <span style={st.fieldLabel}>idEdificio</span>
          <input
            type="number"
            value={inputId}
            onChange={e => setInputId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cargar()}
            placeholder="1001–1003  /  5001–5002"
            style={st.inp}
          />
        </label>
        <button onClick={cargar} disabled={loading} style={st.btn}>
          {loading ? 'Cargando…' : 'llena_datos_celdas()'}
        </button>
        <span style={st.status}>{status}</span>
      </div>

      {/* Sello — tbl_titulo + tbl_contenido */}
      <div style={st.sello}>

        {/* tbl_titulo: "DISTANCIA DE TERMINAL A C.D." */}
        <div style={{ ...st.titulo, color: GREEN }}>
          DISTANCIA DE TERMINAL A C.D.
        </div>

        {/* tbl_contenido: 17 renglones × 6 columnas */}
        <table style={st.tbl}>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isHeader  = ri === 0 || ci === 0;
                  const hasValue  = !isHeader && cell !== '';
                  return (
                    <td key={ci} style={{
                      ...st.td,
                      width   : COL_PX[ci],
                      minWidth: COL_PX[ci],
                      color   : isHeader ? GREEN : hasValue ? RED : '#ccc',
                      fontWeight: isHeader ? 'bold' : 'normal',
                      background: hasValue ? 'rgba(200,0,0,0.05)' : 'transparent',
                      fontSize: isHeader ? 10 : 9,
                    }}>
                      {cell || (isHeader ? '' : '·')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UbicaCoord — muestra el mapeo de coordenadas */}
      <details style={st.details}>
        <summary style={st.summary}>
          UbicaCoord — {Object.keys(UBICA_COORD).length} posiciones
          (hash_table.new_with + CompletaSharedVariable)
        </summary>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:6 }}>
          {Object.entries(UBICA_COORD).map(([k, v]) => (
            <code key={k} style={st.badge}>{k}→({v.col},{v.row})</code>
          ))}
        </div>
      </details>

      {/* Mock GIS — referencia de IDs disponibles */}
      <details style={st.details}>
        <summary style={st.summary}>Mock GIS — edificios y distritos disponibles</summary>
        <table style={st.dbgTbl}>
          <thead>
            <tr>
              {['ID', 'Tipo', 'Nombre', 'Terminales / Edificios'].map(h => (
                <th key={h} style={st.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_BUILDINGS.map(b => (
              <tr key={b.id}>
                <td style={st.td2}><code>{b.id}</code></td>
                <td style={st.td2}>Edificio</td>
                <td style={st.td2}>{b.nombre}</td>
                <td style={st.td2}>{b.terminals.map(t => t.id).join(' ')}</td>
              </tr>
            ))}
            {MOCK_DISTRICTS.map(d => (
              <tr key={d.id} style={{ background:'#f5f5f5' }}>
                <td style={st.td2}><code>{d.id}</code></td>
                <td style={st.td2}>Distrito</td>
                <td style={st.td2}>{d.nombre}</td>
                <td style={st.td2}>edifs: {d.buildingIds.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root     : { fontFamily:'sans-serif', fontSize:12 },
  controls : { display:'flex', alignItems:'flex-end', flexWrap:'wrap', gap:12,
               marginBottom:14, padding:'8px 12px',
               background:'#f8f9fb', border:'1px solid #dde', borderRadius:6 },
  field    : { display:'flex', flexDirection:'column', gap:3 },
  fieldLabel:{ fontSize:10, fontWeight:'bold', color:'#555', textTransform:'uppercase' },
  inp      : { padding:'4px 8px', border:'1px solid #bbb', borderRadius:4,
               fontSize:12, width:180 },
  btn      : { padding:'5px 14px', background:'#2E4057', color:'#fff',
               border:'none', borderRadius:4, cursor:'pointer', fontSize:12 },
  status   : { fontSize:11, color:'#555', paddingBottom:4 },
  sello    : { display:'inline-block', border:'2px solid #555',
               background:'#fff', marginBottom:12 },
  titulo   : { padding:'3px 8px', borderBottom:'1px solid #555',
               fontWeight:'bold', fontSize:10, textAlign:'center',
               letterSpacing:0.3, background:'#fff' },
  tbl      : { borderCollapse:'collapse', tableLayout:'fixed' },
  td       : { border:'1px solid #aaa', padding:'1px 3px',
               textAlign:'center', height:17,
               fontFamily:'monospace', whiteSpace:'nowrap' },
  details  : { marginTop:10 },
  summary  : { cursor:'pointer', fontSize:11, fontWeight:'bold', color:'#2E4057' },
  badge    : { fontSize:8, background:'#eef', padding:'1px 4px',
               borderRadius:3, color:'#336', fontFamily:'monospace' },
  dbgTbl   : { width:'100%', borderCollapse:'collapse', marginTop:6 },
  th       : { background:'#2E4057', color:'#fff', padding:'3px 8px',
               fontSize:11, textAlign:'left' },
  td2      : { padding:'3px 8px', borderBottom:'1px solid #eee', fontSize:11 },
};
