/**
 * Migración de: tipo_geometrias.magik  /  c_Tipo_Geom.magik
 * Clase Magik:  c_Tipo_Geom  —  Sigma Tao / jesalaza / 2004-11-19
 *
 * Value Object / DTO que almacena la relación entre:
 *   oDataset   → el dataset (base de datos Smallworld) al que se accede
 *   oTabla     → la tabla dentro del dataset que se consulta
 *   oTipo_geom → el tipo de geometría que contiene esa tabla (para el corte geográfico)
 *
 * El patrón Magik _clone.init(...) se traduce directamente al constructor TS.
 * No hay lógica espacial — es un tipo de dato puro.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Tipos de geometría típicos en un dataset GIS Smallworld.
 * Magik: oTipo_geom — string libre en el original; aquí tipado con union.
 */
export type TipoGeometria =
  | 'point'
  | 'chain'
  | 'area'
  | 'text'
  | 'raster'
  | 'collection'
  | string;   // acepta cualquier string para compatibilidad con datos reales

/**
 * Interfaz de datos pura — equivale a los tres slots de c_Tipo_Geom.
 * Útil para serializar / pasar por props sin instanciar la clase.
 */
export interface TipoGeomData {
  dataset:   string;          // oDataset — slot :writable
  tabla:     string;          // oTabla   — slot :writable
  tipoGeom:  TipoGeometria;   // oTipo_geom — slot :writable
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CTipoGeom implements TipoGeomData {

  /**
   * Magik: slot {:oDataset, "", :writable}
   * Dataset al que se accederá para la consulta del corte geográfico.
   */
  dataset:  string;

  /**
   * Magik: slot {:oTabla, "", :writable}
   * Tabla del dataset cuya geometría se pintará en el corte geográfico.
   */
  tabla:    string;

  /**
   * Magik: slot {:oTipo_geom, "", :writable}
   * Tipo de geometría que contiene la tabla (point, chain, area, ...).
   */
  tipoGeom: TipoGeometria;

  /**
   * Magik: c_Tipo_Geom.new(PoDataset, PoTabla, PoTipo_geom)
   *         >> _clone.init(PoDataset, PoTabla, PoTipo_geom)
   *
   * _private c_Tipo_Geom.init(PoDataset, PoTabla, PoTipo_geom)
   *   .oDataset << PoDataset
   *   .oTabla   << PoTabla
   *   .oTipo_geom << PoTipo_geom
   *   >> _self
   *
   * En TS: new() + init() del patrón Magik (_clone + asignación de slots)
   * se condensan en el constructor estándar.
   */
  constructor(dataset: string, tabla: string, tipoGeom: TipoGeometria) {
    this.dataset  = dataset;
    this.tabla    = tabla;
    this.tipoGeom = tipoGeom;
  }

  /** Serializa la instancia a un objeto plano (útil para JSON / APIs). */
  toData(): TipoGeomData {
    return { dataset: this.dataset, tabla: this.tabla, tipoGeom: this.tipoGeom };
  }

  /** Crea una copia (equivale al _clone del patrón Magik). */
  clone(): CTipoGeom {
    return new CTipoGeom(this.dataset, this.tabla, this.tipoGeom);
  }

  toString(): string {
    return `${this.dataset} / ${this.tabla} [${this.tipoGeom}]`;
  }
}

// =============================================================================
// FUNCIÓN FACTORY PURA — atajo funcional
// =============================================================================

/** Equivale a c_Tipo_Geom.new(dataset, tabla, tipoGeom) en Magik. */
export function createTipoGeom(
  dataset:  string,
  tabla:    string,
  tipoGeom: TipoGeometria,
): CTipoGeom {
  return new CTipoGeom(dataset, tabla, tipoGeom);
}

// =============================================================================
// DATOS DE EJEMPLO — típicos en un proyecto PNI Smallworld
// Representan el tipo de configuración que usa c_Tipo_Geom en producción
// =============================================================================

export const TIPO_GEOM_EJEMPLOS: TipoGeomData[] = [
  { dataset: 'gis_dataset',  tabla: 'ug_structure',        tipoGeom: 'point'      },
  { dataset: 'gis_dataset',  tabla: 'ug_conduit_section',  tipoGeom: 'chain'      },
  { dataset: 'gis_dataset',  tabla: 'ug_conduit_route',    tipoGeom: 'chain'      },
  { dataset: 'gis_dataset',  tabla: 'building_site',       tipoGeom: 'area'       },
  { dataset: 'gis_dataset',  tabla: 'label',               tipoGeom: 'text'       },
  { dataset: 'gis_dataset',  tabla: 'land_parcel',         tipoGeom: 'area'       },
];

const TIPOS_DISPONIBLES: TipoGeometria[] = ['point','chain','area','text','raster','collection'];

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Formulario para crear instancias CTipoGeom + lista acumulada.
// =============================================================================

const ICON: Record<string, string> = {
  point: '●', chain: '━', area: '▬', text: 'T', raster: '▦', collection: '◈',
};

export function TipoGeomUI() {
  const [dataset,  setDataset]  = useState('gis_dataset');
  const [tabla,    setTabla]    = useState('');
  const [tipoGeom, setTipoGeom] = useState<TipoGeometria>('point');
  const [lista,    setLista]    = useState<CTipoGeom[]>(
    TIPO_GEOM_EJEMPLOS.map(d => new CTipoGeom(d.dataset, d.tabla, d.tipoGeom))
  );
  const [selected, setSelected] = useState<number | null>(null);

  const agregar = () => {
    if (!tabla.trim()) return;
    // c_Tipo_Geom.new(PoDataset, PoTabla, PoTipo_geom)
    const instancia = createTipoGeom(dataset.trim(), tabla.trim(), tipoGeom);
    setLista(prev => [...prev, instancia]);
    setTabla('');
    setSelected(lista.length);   // seleccionar la recién creada
  };

  const eliminar = (idx: number) => {
    setLista(prev => prev.filter((_, i) => i !== idx));
    setSelected(null);
  };

  const sel = selected !== null ? lista[selected] : null;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_Tipo_Geom — Relación tabla ↔ tipo de geometría</h3>

      <div style={s.body}>

        {/* Formulario de creación — new(PoDataset, PoTabla, PoTipo_geom) */}
        <div style={s.formBlock}>
          <p style={s.legend}>new(PoDataset, PoTabla, PoTipo_geom)</p>

          <div style={s.inputRow}>
            <label style={s.lbl}>PoDataset</label>
            <input style={s.inp} value={dataset}
              onChange={e => setDataset(e.target.value)} />
          </div>
          <div style={s.inputRow}>
            <label style={s.lbl}>PoTabla</label>
            <input style={s.inp} placeholder="ej. ug_structure"
              value={tabla} onChange={e => setTabla(e.target.value)} />
          </div>
          <div style={s.inputRow}>
            <label style={s.lbl}>PoTipo_geom</label>
            <select style={s.sel} value={tipoGeom}
              onChange={e => setTipoGeom(e.target.value as TipoGeometria)}>
              {TIPOS_DISPONIBLES.map(t => (
                <option key={t} value={t}>{ICON[t] ?? '?'} {t}</option>
              ))}
            </select>
          </div>

          <button style={s.btn} onClick={agregar}>
            + Crear instancia
          </button>
        </div>

        {/* Lista de instancias */}
        <div style={s.listBlock}>
          <p style={s.legend}>Instancias CTipoGeom ({lista.length})</p>
          <div style={s.list}>
            {lista.map((item, i) => (
              <div
                key={i}
                style={{ ...s.item, background: selected === i ? '#2E4057' : '#f5f5f5',
                                    color:      selected === i ? '#fff'     : '#333' }}
                onClick={() => setSelected(i)}
              >
                <span style={s.geomBadge}>{ICON[item.tipoGeom] ?? '?'}</span>
                <span style={s.itemText}>{item.tabla}</span>
                <button
                  style={{ ...s.delBtn, color: selected === i ? '#adf' : '#c00' }}
                  onClick={e => { e.stopPropagation(); eliminar(i); }}
                  title="Eliminar"
                >×</button>
              </div>
            ))}
            {lista.length === 0 && (
              <p style={{ color: '#aaa', fontSize: 11, margin: 4 }}>Sin instancias.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detalle de la instancia seleccionada */}
      {sel && (
        <div style={s.detail}>
          <strong>Detalle CTipoGeom</strong>
          <table style={s.table}>
            <tbody>
              {[
                ['Clase TS',   'CTipoGeom'],
                ['oDataset',   sel.dataset],
                ['oTabla',     sel.tabla],
                ['oTipo_geom', sel.tipoGeom],
                ['toString()', sel.toString()],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td style={s.td}>{k}</td>
                  <td style={s.td}><code>{v}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame     : { display:'flex', flexDirection:'column', gap:12, width:520, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title     : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  body      : { display:'flex', gap:16 },
  formBlock : { display:'flex', flexDirection:'column', gap:6, minWidth:200 },
  listBlock : { display:'flex', flexDirection:'column', gap:4, flex:1 },
  legend    : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  inputRow  : { display:'flex', alignItems:'center', gap:6 },
  lbl       : { minWidth:90, fontSize:11, color:'#555' },
  inp       : { flex:1, padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  sel       : { flex:1, padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  btn       : { marginTop:4, padding:'6px 14px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontSize:12 },
  list      : { display:'flex', flexDirection:'column', gap:2, maxHeight:220, overflowY:'auto' as const },
  item      : { display:'flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:3, cursor:'pointer', userSelect:'none' as const },
  geomBadge : { fontSize:14, minWidth:18 },
  itemText  : { flex:1, fontSize:12 },
  delBtn    : { background:'transparent', border:'none', cursor:'pointer', fontSize:14, fontWeight:'bold', padding:'0 2px' },
  detail    : { background:'#f0f4f8', border:'1px solid #d0dae4', borderRadius:4, padding:10 },
  table     : { width:'100%', borderCollapse:'collapse' as const, marginTop:6 },
  td        : { padding:'3px 8px', borderBottom:'1px solid #dde', fontSize:11 },
};

export default TipoGeomUI;
