/**
 * CTablaCablesProy.tsx
 * Migración de tabla_cables_proy.magik
 *
 * Tabla que lista cables de cobre agrupados por spec_id con su capacidad,
 * tipo, calibre y cantidad total (metros). Simula búsqueda en el viewport GIS.
 * Hereda de layout_element en Magik; aquí es un componente React funcional.
 */

import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a los RWO de Smallworld Physical Network Inventory
// ---------------------------------------------------------------------------

interface EspecCable {
  size : number;   // capacidad: tamaño de la especificación (pares)
  type : string;   // tipo de cable (Aéreo / Subterráneo)
  gauge: string;   // calibre (AWG-XX)
}

interface CableRwo {
  spec_id             : string;
  rwo_type            : 'copper_cable' | string;
  construction_status : string;
  measured_length?    : number;    // Magik: measured_length
  calculated_length?  : number;    // Magik: calculated_length (fallback)
  spec_info           : EspecCable;
}

/** Equivale a grupos[spec_id] = vector.new(2): [1]=spec_info, [2]=total_length */
interface GrupoCable {
  spec_info    : EspecCable;
  total_length : number;
}

// ---------------------------------------------------------------------------
// Constantes compartidas — define_shared_constant
// ---------------------------------------------------------------------------

// Magik: :campos → simple_vector de claves de columna (orden de render)
const CAMPOS = ['capacidad', 'tipo', 'calibre', 'cantidad'] as const;
type Campo = typeof CAMPOS[number];

// Magik: :datos_columna → property_list { campo: [label, ancho_dmm, :accessor] }
// Anchos px proporcionales a dmm originales (÷2): 200→100, 250→125, 150→75, 300→150
const DATOS_COLUMNA: Record<Campo, { label: string; width: number }> = {
  capacidad : { label: 'Capacidad',      width: 100 },
  tipo      : { label: 'Tipo',           width: 125 },
  calibre   : { label: 'Calibre',        width: 75  },
  cantidad  : { label: 'Cantidad (mts)', width: 150 },
};

// Magik: :altura_cabecera = 70dmm → 35px, :altura_fila = 50dmm → 25px
const ALTURA_CABECERA = 35;
const ALTURA_FILA     = 25;

// ---------------------------------------------------------------------------
// Accessors — métodos individuales tabla_cables_proy.campo(vec)
// Magik vec[1]=spec_info, vec[2]=total_length  →  TypeScript GrupoCable
// ---------------------------------------------------------------------------

// Magik: vec[1].size.write_string + " Ps."
function capacidad(g: GrupoCable): string { return `${g.spec_info.size} Ps.`; }

// Magik: vec[1].type
function tipo(g: GrupoCable): string { return g.spec_info.type; }

// Magik: vec[1].gauge
function calibre(g: GrupoCable): string { return g.spec_info.gauge; }

// Magik: float_format.new(:float_decimal_places,2).format(vec[2])
function cantidad(g: GrupoCable): string { return g.total_length.toFixed(2); }

const ACCESSORS: Record<Campo, (g: GrupoCable) => string> = {
  capacidad, tipo, calibre, cantidad,
};

// ---------------------------------------------------------------------------
// Mock GIS — simula world.geometry_set() del viewport de layout_page
// ---------------------------------------------------------------------------
const MOCK_CABLES: CableRwo[] = [
  { spec_id: 'CA-050', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    measured_length: 88.0,   spec_info: { size: 50,  type: 'Aéreo',        gauge: 'AWG-26' } },
  { spec_id: 'CA-050', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    calculated_length: 112.25, spec_info: { size: 50,  type: 'Aéreo',      gauge: 'AWG-26' } },
  { spec_id: 'CA-100', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    measured_length: 245.5,  spec_info: { size: 100, type: 'Aéreo',        gauge: 'AWG-19' } },
  { spec_id: 'CA-100', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    measured_length: 180.3,  spec_info: { size: 100, type: 'Aéreo',        gauge: 'AWG-19' } },
  { spec_id: 'CA-100', rwo_type: 'copper_cable', construction_status: 'PROYECTO',
    measured_length: 90.0,   spec_info: { size: 100, type: 'Aéreo',        gauge: 'AWG-19' } },
  { spec_id: 'CA-200', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    calculated_length: 320.0, spec_info: { size: 200, type: 'Subterráneo', gauge: 'AWG-24' } },
  { spec_id: 'CA-400', rwo_type: 'copper_cable', construction_status: 'EXISTENTE',
    measured_length: 512.75, spec_info: { size: 400, type: 'Subterráneo',  gauge: 'AWG-22' } },
  { spec_id: 'FO-001', rwo_type: 'fiber_cable',  construction_status: 'EXISTENTE',
    measured_length: 100.0,  spec_info: { size: 0,   type: '',             gauge: '' } },
];

// ---------------------------------------------------------------------------
// buscar_elementos — Magik: itera geometry_set, filtra copper_cable EXISTENTE
// Nota: el código original filtra construction_status="EXISTENTE" aunque
//       la clase se describe como "cables proyectados" (aparente inconsistencia en el original).
// ---------------------------------------------------------------------------
async function buscarElementos(): Promise<CableRwo[]> {
  await new Promise(r => setTimeout(r, 100)); // simula latencia GIS

  // Magik: _for geom,sty _over gset.elements_with_sts()
  //          _if geom.rwo_type _is :copper_cable _and rwo.construction_status = "EXISTENTE"
  const filtrados = MOCK_CABLES
    .filter(c => c.rwo_type === 'copper_cable' && c.construction_status === 'EXISTENTE')
    .sort((a, b) => a.spec_id.localeCompare(b.spec_id)); // Magik: sort_by(:spec_id)

  return filtrados;
}

// ---------------------------------------------------------------------------
// agrupar_elementos — Magik: hash_table agrupada por spec_id.as_symbol()
// ---------------------------------------------------------------------------
async function agruparElementos(): Promise<Map<string, GrupoCable> | null> {
  const elementos = await buscarElementos();
  if (elementos.length === 0) return null;

  // Magik: grupos << hash_table.new()
  const grupos = new Map<string, GrupoCable>();

  for (const cable of elementos) {
    // Magik: dis << measured_length.as_float else calculated_length.as_float
    const dis = cable.measured_length ?? cable.calculated_length ?? 0;
    const key = cable.spec_id;

    if (!grupos.has(key)) {
      // Magik: grupos[spec_id][1] << cable.spec_info
      grupos.set(key, { spec_info: cable.spec_info, total_length: 0 });
    }
    // Magik: grupos[spec_id][2] << grupos[spec_id][2].default(0.0) + dis
    grupos.get(key)!.total_length += dis;
  }

  return grupos;
}

// ---------------------------------------------------------------------------
// Componente principal — CTablaCablesProyUI
// Equivale a draw_content_on(window): title, cabeceras, filas de datos
// ---------------------------------------------------------------------------
export function CTablaCablesProyUI() {
  const [grupos,  setGrupos]  = useState<Map<string, GrupoCable> | null>(null);
  const [loading, setLoading] = useState(false);

  async function cargar() {
    setLoading(true);
    setGrupos(await agruparElementos());
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []); // eslint-disable-line

  const anchoTotal = CAMPOS.reduce((s, c) => s + DATOS_COLUMNA[c].width, 0);
  const entries    = grupos ? [...grupos.entries()] : [];

  const tdStyle: React.CSSProperties = {
    border: '1px solid #333', textAlign: 'center',
    fontSize: 11, padding: '1px 4px',
    color: '#cc0000', fontWeight: 'bold',
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera informativa */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CTablaCablesProy</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          tabla_cables_proy · copper_cable EXISTENTE · agrupado por spec_id
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
        <button onClick={cargar} disabled={loading}
          style={{ padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                   background: loading ? '#ccc' : '#8b0000', color: '#fff', fontSize: 11 }}>
          {loading ? 'buscando…' : 'buscar_elementos() + agrupar_elementos()'}
        </button>
      </div>

      {!loading && grupos === null && (
        <div style={{ color: '#888', fontSize: 11 }}>
          Sin elementos — viewport vacío o sin cables copper_cable EXISTENTE.
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          {/* Magik: draw_vtext_transform "CABLE PROYECTADO A INSTALAR:" en rojo/bold centrado */}
          <div style={{
            width: anchoTotal, textAlign: 'center',
            height: ALTURA_CABECERA, lineHeight: `${ALTURA_CABECERA}px`,
            fontWeight: 'bold', color: '#cc0000', fontSize: 13, letterSpacing: 1,
            border: '1px solid #333', borderBottom: 'none', background: '#fff8f8',
          }}>
            CABLE PROYECTADO A INSTALAR:
          </div>

          {/* Magik: draw_content_on → cabeceras + separadores de columna */}
          <table style={{ borderCollapse: 'collapse', width: anchoTotal, tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ height: ALTURA_CABECERA, background: '#f5f5f5' }}>
                {CAMPOS.map(campo => (
                  <th key={campo} style={{
                    width: DATOS_COLUMNA[campo].width,
                    border: '1px solid #333', fontSize: 11,
                    textAlign: 'center', padding: '2px 4px', fontWeight: 'bold',
                  }}>
                    {DATOS_COLUMNA[campo].label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Magik: _for elemento _over elementos.elements() → fila por spec_id */}
            <tbody>
              {entries.map(([specId, grupo], i) => (
                <tr key={specId} style={{ height: ALTURA_FILA, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  {CAMPOS.map(campo => (
                    <td key={campo} style={tdStyle}>
                      {ACCESSORS[campo](grupo)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 6, fontSize: 10, color: '#666' }}>
            {entries.length} grupos · ancho: {anchoTotal}px
          </div>
        </div>
      )}

      {/* Diagnóstico: contenido de la hash_table */}
      {grupos && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
            grupos (hash_table) — {entries.length} spec_ids
          </summary>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4, overflow: 'auto' }}>
            {JSON.stringify(
              Object.fromEntries(entries.map(([k, v]) => [k, {
                size : v.spec_info.size,
                type : v.spec_info.type,
                gauge: v.spec_info.gauge,
                total_length: v.total_length,
              }])),
              null, 2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}

export default CTablaCablesProyUI;
