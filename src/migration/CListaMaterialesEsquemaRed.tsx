/**
 * CListaMaterialesEsquemaRed.tsx
 * Migración de c_lista_materiales_esquema_red.magik
 *
 * Sello "LISTA DE MATERIALES" para esquemáticos de red de fibra óptica.
 * Hereda de :c_base_sello_fibra. Slot :tipo → 'red' | 'estructuras'.
 *
 * Flujo:
 *   selectFromMap()       → geometrías PROYECTADO del ACE "esquema"
 *   elementosDeProyecto() → selecciona ht según .tipo
 *   keysOrder()           → sort natural alfanumérico
 *   llenaDatosCeldas()    → filas: No | DESCRIPCION | UNIDAD | CANTIDAD
 */

import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type TipoLista = 'red' | 'estructuras';

interface EspecCable {
  clase          : string;
  fiber_quantity : number;
}

interface ElementoRed {
  id                  : string;
  source_collection   : string;   // :sheath, :cedo, :underground_route, :uub, …
  external_name       : string;
  construction_status : string;
  primary_geometry    : 'route' | 'point';
  is_structure        : boolean;
  spec_id?            : string;
  tipo_conexion?      : string;   // user!_tipo_conexion
  tipo_obra?          : string;   // para underground_route
  spec_record?        : EspecCable;
  km_real_medido?     : number;   // user!_km_real_medido — activa uso de long_opt
  long_opt?           : number;   // user!_long_opt en metros
  calculated_length?  : number;
  sum_of_slack_lengths?: number;
  measured_length?    : number;
}

interface FilaMaterial {
  numero      : number;
  descripcion : string;
  unidad      : string;
  cantidad    : string;
}

// ---------------------------------------------------------------------------
// Constantes de layout — equivalentes a define_shared_constant
// col1=6mm, col2=60mm, col3=35mm, col4=20mm  (×5px/mm)
// ---------------------------------------------------------------------------
const COL_WIDTHS = { no: 30, descripcion: 300, unidad: 175, cantidad: 100 };
const ALTURA_FILA = 28; // 6mm × ~4.7px/mm ≈ 28px (Magik: 6dmm por fila)

// ---------------------------------------------------------------------------
// Mock GIS — simula mv.get_selectable_geometry_set() en ACE esquemático
// Todos construction_status='PROYECTADO' (EXISTENTE se filtraría)
// ---------------------------------------------------------------------------
const MOCK_RED: ElementoRed[] = [
  // Sheaths (cables fibra óptica) — primary_geometry=route
  { id:'SH-001', source_collection:'sheath', external_name:'Cable FO Aéreo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:false,
    spec_record:{clase:'ADSS', fiber_quantity:24}, km_real_medido:1, long_opt:350.0 },
  { id:'SH-002', source_collection:'sheath', external_name:'Cable FO Aéreo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:false,
    spec_record:{clase:'ADSS', fiber_quantity:24}, calculated_length:280.0, sum_of_slack_lengths:15.0 },
  { id:'SH-003', source_collection:'sheath', external_name:'Cable FO Subterráneo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:false,
    spec_record:{clase:'SMF-28', fiber_quantity:48}, km_real_medido:1, long_opt:210.0 },
  // CEDOs — spec_id → clave con spec_id
  { id:'CEDO-001', source_collection:'cedo', external_name:'CEDO',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, spec_id:'CEDO-4F' },
  { id:'CEDO-002', source_collection:'cedo', external_name:'CEDO',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, spec_id:'CEDO-4F' },
  // Terminales FO — clave split_by("|")[2] = descripción
  { id:'TFO-001', source_collection:'user!_terminal_fo', external_name:'Terminal FO',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false },
  { id:'TFO-002', source_collection:'user!_terminal_fo', external_name:'Terminal FO',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false },
  { id:'TFO-003', source_collection:'user!_terminal_fo', external_name:'Terminal FO',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false },
  // Fusiones (mit_internal_connection) — tipo_conexion = 'FUSION'
  { id:'MIT-001', source_collection:'mit_internal_connection', external_name:'Fusión',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, tipo_conexion:'FUSION' },
  { id:'MIT-002', source_collection:'mit_internal_connection', external_name:'Fusión',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, tipo_conexion:'FUSION' },
  { id:'MIT-003', source_collection:'mit_internal_connection', external_name:'Fusión',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, tipo_conexion:'FUSION' },
  { id:'MIT-004', source_collection:'mit_internal_connection', external_name:'Fusión',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:false, tipo_conexion:'FUSION' },
];

const MOCK_ESTRUCTURAS: ElementoRed[] = [
  // Ductos (underground_route) — agrupan por tipo_obra
  { id:'UR-001', source_collection:'underground_route', external_name:'Ducto subterráneo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:true,
    tipo_obra:'PERFORACION', measured_length:125.0 },
  { id:'UR-002', source_collection:'underground_route', external_name:'Ducto subterráneo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:true,
    tipo_obra:'PERFORACION', measured_length:95.5 },
  { id:'UR-003', source_collection:'underground_route', external_name:'Ducto subterráneo',
    construction_status:'PROYECTADO', primary_geometry:'route', is_structure:true,
    tipo_obra:'ZANJA', measured_length:210.0 },
  // UUB — agrupan por spec_id
  { id:'UUB-001', source_collection:'uub', external_name:'UUB',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:true, spec_id:'UUB-4V' },
  { id:'UUB-002', source_collection:'uub', external_name:'UUB',
    construction_status:'PROYECTADO', primary_geometry:'point', is_structure:true, spec_id:'UUB-4V' },
];

// ---------------------------------------------------------------------------
// selectFromMap — Magik: itera geoms del ACE "esquema", filtra PROYECTADO
// Devuelve [estructuras, elementos] como Map<clave, ElementoRed[]>
// ---------------------------------------------------------------------------
function selectFromMap(): [Map<string, ElementoRed[]>, Map<string, ElementoRed[]>] {
  const estructuras = new Map<string, ElementoRed[]>();
  const elementos   = new Map<string, ElementoRed[]>();

  function addUnique(m: Map<string, ElementoRed[]>, key: string, item: ElementoRed) {
    if (!m.has(key)) m.set(key, []);
    if (!m.get(key)!.find(e => e.id === item.id)) m.get(key)!.push(item);
  }

  // Magik: _for itergeo → filtrar construction_status = "PROYECTADO"
  const todos = [...MOCK_RED, ...MOCK_ESTRUCTURAS]
    .filter(e => e.construction_status === 'PROYECTADO');

  for (const owner of todos) {
    if (owner.is_structure) {
      // Magik: underground_route|tipo_obra, uub|spec_id, otros|
      let key: string;
      if (owner.source_collection === 'underground_route') {
        key = `${owner.source_collection}|${owner.tipo_obra ?? ''}`;
      } else if (owner.source_collection === 'uub') {
        key = `${owner.source_collection}|${owner.spec_id ?? ''}`;
      } else {
        key = `${owner.source_collection}|`;
      }
      addUnique(estructuras, key, owner);
    } else {
      // Magik: owner.responds_to?(:spec_id) → collection|spec_id, else collection|
      const key = owner.spec_id
        ? `${owner.source_collection}|${owner.spec_id}`
        : `${owner.source_collection}|`;
      addUnique(elementos, key, owner);
    }
  }

  return [estructuras, elementos];
}

// ---------------------------------------------------------------------------
// elementosDeProyecto — Magik: selecciona ht según .tipo, aplana en rope
// ---------------------------------------------------------------------------
function elementosDeProyecto(
  tipo: TipoLista,
): [ElementoRed[], Map<string, ElementoRed[]>] {
  const [estructuras, elementos] = selectFromMap();
  const ht = tipo === 'red' ? elementos : estructuras;

  // Magik: genera LoElementosall aplanando ht.keys_and_elements()
  const all: ElementoRed[] = [];
  for (const items of ht.values()) all.push(...items);

  return [all, ht];
}

// ---------------------------------------------------------------------------
// keysOrder — Magik: sorted_collection.new(_unset, strings_with_numbers proc)
// TypeScript: localeCompare con numeric:true
// ---------------------------------------------------------------------------
function keysOrder(ht: Map<string, ElementoRed[]>): string[] {
  return [...ht.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}

// ---------------------------------------------------------------------------
// resolveDescripcion — prioridad de llena_datos_celdas()
// 1) sheath+spec_record  2) spec_id  3) tipo_conexion
// 4) colecciones con clave compuesta  5) external_name
// ---------------------------------------------------------------------------
const COLECCIONES_KEY_SPLIT = [
  'underground_route', 'figure_eight', 'user!_terminal_fo', 'uub',
];

function resolveDescripcion(key: string, item: ElementoRed): string {
  let desc = '';

  if (item.source_collection === 'sheath' && item.spec_record) {
    // Magik: external_name + spec.clase + " " + spec.fiber_quantity
    desc = `${item.external_name} ${item.spec_record.clase} ${item.spec_record.fiber_quantity}`;
  } else if (item.spec_id) {
    // Magik: IterObject.responds_to?(:spec_id) → spec_id.write_string
    desc = item.spec_id;
  } else if (item.tipo_conexion) {
    // Magik: responds_to?(:user!_tipo_conexion) → tipo_conexion.write_string
    desc = item.tipo_conexion;
  } else if (COLECCIONES_KEY_SPLIT.includes(item.source_collection)) {
    // Magik: Iterkey.write_string.split_by("|")[2] — parte tras "|" (1-based → índice 1)
    desc = key.split('|')[1] ?? '';
  } else {
    desc = item.external_name;
  }

  // Magik: _if desc_mat _is _unset _orif external_name = "CEDO" → prepend external_name
  if (!desc || item.external_name === 'CEDO') {
    desc = `${item.external_name} ${desc}`.trim();
  }

  return desc || item.external_name;
}

// ---------------------------------------------------------------------------
// resolveUnidadCantidad — "metros" para route, "pzas" para point
// ---------------------------------------------------------------------------
function resolveUnidadCantidad(items: ElementoRed[]): { unidad: string; cantidad: string } {
  const sample = items[0];

  if (sample.primary_geometry !== 'route') {
    return { unidad: 'pzas', cantidad: String(items.length) };
  }

  let total = 0;
  for (const rec of items) {
    let longitud = 0;
    if (rec.source_collection === 'sheath') {
      // Magik: km_real_medido _isnt _unset → long_opt.value_in(:m)
      if (rec.km_real_medido !== undefined && rec.long_opt !== undefined) {
        longitud = rec.long_opt;
      }
      // Magik: _if Longitud <= 0 → calculated_length + sum_of_slack_lengths
      if (longitud <= 0) {
        longitud = (rec.calculated_length ?? 0) + (rec.sum_of_slack_lengths ?? 0);
      }
    } else {
      // Magik: record.measured_length.value_in(:m)
      longitud = rec.measured_length ?? 0;
    }
    total += longitud;
  }

  return { unidad: 'metros', cantidad: total.toFixed(2) };
}

// ---------------------------------------------------------------------------
// llenaDatosCeldas — construye filas a partir del hash_table
// Magik: itera keys_o (ordenadas), asigna_texto_celda por fila
// ---------------------------------------------------------------------------
async function llenaDatosCeldas(tipo: TipoLista): Promise<FilaMaterial[]> {
  await new Promise(r => setTimeout(r, 80));

  const [, ht] = elementosDeProyecto(tipo);
  if (ht.size === 0) return [];

  return keysOrder(ht).map((key, i) => {
    const items   = ht.get(key)!;
    const desc    = resolveDescripcion(key, items[0]);
    const { unidad, cantidad } = resolveUnidadCantidad(items);
    return { numero: i + 1, descripcion: desc, unidad, cantidad };
  });
}

// ---------------------------------------------------------------------------
// Componente principal — CListaMaterialesEsquemaRedUI
// Equivale a configura_tabla + etiqueta_celdas + llena_datos_celdas
// ---------------------------------------------------------------------------
export function CListaMaterialesEsquemaRedUI() {
  const [tipo,    setTipo]    = useState<TipoLista>('red');
  const [filas,   setFilas]   = useState<FilaMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  async function cargar(t: TipoLista) {
    setLoading(true);
    setFilas(await llenaDatosCeldas(t));
    setLoading(false);
  }

  useEffect(() => { cargar(tipo); }, [tipo]); // eslint-disable-line

  // Magik: etiqueta_celdas — título según .tipo
  const titulo = tipo === 'red'
    ? 'LISTA DE MATERIALES DE ELEMENTOS DE RED'
    : 'LISTA DE MATERIALES ESTRUCTURAS';

  const anchoTotal = COL_WIDTHS.no + COL_WIDTHS.descripcion + COL_WIDTHS.unidad + COL_WIDTHS.cantidad;

  const thStyle: React.CSSProperties = {
    border: '1px solid #333', padding: '3px 4px',
    textAlign: 'center', fontSize: 10, fontWeight: 'bold', background: '#f0f0f0',
  };
  const tdStyle: React.CSSProperties = {
    border: '1px solid #333', padding: '2px 4px', fontSize: 10, height: ALTURA_FILA,
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera informativa */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CListaMaterialesEsquemaRed</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          :c_base_sello_fibra · .tipo · elementos PROYECTADOS del esquemático
        </span>
      </div>

      {/* Toggle .tipo — Magik: .tipo = :red | :estructuras */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        {(['red', 'estructuras'] as TipoLista[]).map(t => (
          <button key={t} onClick={() => setTipo(t)} disabled={loading}
            style={{
              padding: '4px 14px', borderRadius: 4, border: '1px solid #888',
              cursor: 'pointer', fontSize: 11,
              background: tipo === t ? '#2a5a8e' : '#f5f5f5',
              color: tipo === t ? '#fff' : '#333',
              fontWeight: tipo === t ? 'bold' : 'normal',
            }}>
            .tipo = :{t}
          </button>
        ))}
        <span style={{ fontSize: 10, color: '#777' }}>
          {loading ? 'calculando…' : `${filas.length} grupos`}
        </span>
      </div>

      {/* Tabla — Magik: tbl_lista_materiales (2+renglones filas, 4 cols) */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: anchoTotal, tableLayout: 'fixed' }}>
          <thead>
            {/* Fila 1 — Magik: asigna_texto_celda(tbl,1,2,titulo,30)
                Celdas col1..4 tienen borde Sup/Der/Izq oculto → col1 vacía, título en col2-4 */}
            <tr>
              <td style={{ width: COL_WIDTHS.no, border: 'none' }} />
              <td colSpan={3} style={{
                width: COL_WIDTHS.descripcion + COL_WIDTHS.unidad + COL_WIDTHS.cantidad,
                border: '1px solid #333', borderTop: 'none',
                textAlign: 'center', fontWeight: 'bold', fontSize: 11,
                padding: '4px 6px', letterSpacing: 0.5,
              }}>
                {titulo}
              </td>
            </tr>
            {/* Fila 2 — Magik: etiqueta_celdas → No | DESCRIPCION | UNIDAD | CANTIDAD */}
            <tr style={{ height: ALTURA_FILA }}>
              <th style={{ ...thStyle, width: COL_WIDTHS.no }}>No</th>
              <th style={{ ...thStyle, width: COL_WIDTHS.descripcion, textAlign: 'left' }}>DESCRIPCION</th>
              <th style={{ ...thStyle, width: COL_WIDTHS.unidad }}>UNIDAD</th>
              <th style={{ ...thStyle, width: COL_WIDTHS.cantidad }}>CANTIDAD</th>
            </tr>
          </thead>

          {/* Filas 3+ — Magik: llena_datos_celdas() por cada key ordenado */}
          <tbody>
            {!loading && filas.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#888' }}>
                  Sin elementos PROYECTADOS en el esquemático.
                </td>
              </tr>
            )}
            {filas.map((fila, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                {/* col1: cont-2 (número de ítem) */}
                <td style={{ ...tdStyle, textAlign: 'center' }}>{fila.numero}</td>
                {/* col2: desc_uc — cadena de descripción resuelta */}
                <td style={{ ...tdStyle }}>{fila.descripcion}</td>
                {/* col3: unidad — metros o pzas */}
                <td style={{ ...tdStyle, textAlign: 'center' }}>{fila.unidad}</td>
                {/* col4: cantidad — longitud acumulada o count */}
                <td style={{ ...tdStyle, textAlign: 'right' }}>{fila.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diagnóstico: hash_table resultante */}
      {filas.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
            hash_table (obten_lista_materiales) — {filas.length} grupos · .tipo = :{tipo}
          </summary>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4, overflow: 'auto' }}>
            {JSON.stringify(filas, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default CListaMaterialesEsquemaRedUI;
