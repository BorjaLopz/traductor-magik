/**
 * Migración de: c_area_telmex.magik
 * Clase Magik:  c_area_telmex  —  package user
 * Autor orig.:  vbluna
 *
 * DAO (Data Access Object) para áreas Telmex del dataset GIS landbase.
 * Dado un nombre de área, recupera el objeto GIS correspondiente y expone
 * sus atributos administrativos: dirección, teléfono y responsable.
 *
 * Sin cálculos espaciales → no requiere Turf.js.
 * Sin interacción con mapa → no requiere OpenLayers.
 * Acceso a datos GIS → servicio asíncrono (LandbaseService).
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Magik: .objeto.user!_direccion / user!_telefono / user!_responsable
 * Campos de información administrativa asociados al área.
 */
export interface InfoAdmin {
  direccion:   string;   // user!_direccion
  telefono:    string;   // user!_telefono
  responsable: string;   // user!_responsable
}

/**
 * Magik: elemento de la colección user!_area del dataset landbase.
 * .infoadmin.an_element() → primer registro de InfoAdmin.
 */
export interface AreaGisRecord {
  nombre:    string;       // user!_nombre (clave de búsqueda)
  infoadmin: InfoAdmin;    // colección infoadmin → an_element() → primer elemento
}

/**
 * Abstracción de gis_program_manager.cached_dataset(:landbase).collection(:user!_area).
 * Permite sustituir el acceso real por mocks en tests y demos.
 */
export interface LandbaseService {
  /** select(predicate.eq(:user!_nombre, nombre)).an_element().infoadmin.an_element() */
  getAreaByNombre(nombre: string): Promise<AreaGisRecord | null>;
}

// =============================================================================
// MOCK — sustituye a gis_program_manager en demos/tests
// =============================================================================

const MOCK_AREAS: AreaGisRecord[] = [
  {
    nombre:    'AREA-NORTE',
    infoadmin: { direccion: 'Av. Insurgentes Norte 2453, Col. Vallejo, CDMX', telefono: '55-5328-0010', responsable: 'Juan García Torres' },
  },
  {
    nombre:    'AREA-SUR',
    infoadmin: { direccion: 'Calz. de Tlalpan 3700, Col. El Arenal, CDMX',    telefono: '55-5689-4501', responsable: 'María López Reyes' },
  },
  {
    nombre:    'AREA-ORIENTE',
    infoadmin: { direccion: 'Av. Zaragoza 1200, Col. Pantitlán, CDMX',         telefono: '55-5764-8820', responsable: 'Pedro Martínez Cruz' },
  },
  {
    nombre:    'AREA-PONIENTE',
    infoadmin: { direccion: 'Blvd. Adolfo López Mateos 2010, Col. Lomas, CDMX', telefono: '55-5258-1190', responsable: 'Ana Sánchez Vega' },
  },
];

export const mockLandbaseService: LandbaseService = {
  getAreaByNombre: async (nombre: string): Promise<AreaGisRecord | null> => {
    // Simula latencia de red / acceso a base de datos GIS
    await new Promise(r => setTimeout(r, 180));
    return MOCK_AREAS.find(a => a.nombre === nombre) ?? null;
  },
};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CAreaTelmex {

  /**
   * Magik: {:objeto, _unset, :writable}
   * Objeto GIS del área seleccionada (null si no se encontró o falló la consulta).
   */
  private objeto: AreaGisRecord | null = null;

  /** Constructor privado — usar CAreaTelmex.new() para instanciar */
  private constructor() {}

  /**
   * Magik: c_area_telmex.new(PsNombre) → _return _clone.init(PsNombre)
   *
   * Factory asíncrono: crea la instancia y ejecuta init().
   * En Magik _clone.init() era síncrono; aquí es async porque el acceso
   * al dataset GIS es una operación de red/IO.
   */
  static async new(nombre: string, service: LandbaseService): Promise<CAreaTelmex> {
    const inst = new CAreaTelmex();
    await inst.init(nombre, service);
    return inst;
  }

  /**
   * Magik: c_area_telmex.init(PsNombre)
   *
   *   _self.objeto_area(PsNombre)
   *   _return _self
   */
  private async init(nombre: string, service: LandbaseService): Promise<void> {
    await this.objetoArea(nombre, service);
  }

  /**
   * Magik: c_area_telmex.objeto_area(PsNombre)
   *
   *   _try
   *     LtbArea = gis_program_manager.cached_dataset(:landbase).collection(:user!_area)
   *     LoPred  = predicate.eq(:user!_nombre, PsNombre)
   *     .objeto = LtbArea.select(LoPred).an_element().infoadmin.an_element()
   *   _when does_not_understand
   *     write("Error al asignar el area")
   *   _endtry
   *
   * gis_program_manager.cached_dataset(:landbase).collection(:user!_area)
   *   → service.getAreaByNombre(nombre)
   *
   * predicate.eq(:user!_nombre, nombre) + select().an_element()
   *   → búsqueda por nombre en el servicio (equivalente al filter interno)
   *
   * .infoadmin.an_element()
   *   → la propiedad infoadmin del registro devuelto (primer elemento de la colección)
   *
   * _when does_not_understand → catch genérico (método no encontrado en null/undefined)
   */
  async objetoArea(nombre: string, service: LandbaseService): Promise<void> {
    try {
      // select(predicate.eq(:user!_nombre, nombre)).an_element().infoadmin.an_element()
      this.objeto = await service.getAreaByNombre(nombre);
    } catch {
      // _when does_not_understand → write("Error al asignar el area")
      console.error('Error al asignar el area');
      this.objeto = null;
    }
  }

  /**
   * Magik: c_area_telmex.direccion
   *
   *   _try
   *     _return .objeto.user!_direccion.write_string
   *   _when does_not_understand
   *     _return ""
   *
   * .write_string en Magik fuerza la conversión a string.
   * En TS se usa `?? ''` (nullish coalescing) para el fallback.
   * _when does_not_understand → catch (objeto null / campo inexistente)
   */
  get direccion(): string {
    try {
      return this.objeto?.infoadmin?.direccion ?? '';
    } catch {
      return '';
    }
  }

  /**
   * Magik: c_area_telmex.telefono
   *
   *   _try
   *     _return .objeto.user!_telefono.write_string
   *   _when does_not_understand
   *     _return ""
   */
  get telefono(): string {
    try {
      return this.objeto?.infoadmin?.telefono ?? '';
    } catch {
      return '';
    }
  }

  /**
   * Magik: c_area_telmex.responsable
   *
   *   _try
   *     _return .objeto.user!_responsable.write_string
   *   _when does_not_understand
   *     _return ""
   */
  get responsable(): string {
    try {
      return this.objeto?.infoadmin?.responsable ?? '';
    } catch {
      return '';
    }
  }

  /** Indica si el objeto GIS fue encontrado correctamente */
  get encontrado(): boolean {
    return this.objeto !== null;
  }

  /** Nombre del área cargada (para display) */
  get nombre(): string {
    return this.objeto?.nombre ?? '';
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

const NOMBRES_DISPONIBLES = MOCK_AREAS.map(a => a.nombre);

type EstadoCarga = 'idle' | 'loading' | 'ok' | 'error';

export function AreaTelmexUI() {
  const [nombre,   setNombre]   = useState('');
  const [area,     setArea]     = useState<CAreaTelmex | null>(null);
  const [estado,   setEstado]   = useState<EstadoCarga>('idle');

  const buscar = async (nombreBusqueda: string) => {
    if (!nombreBusqueda.trim()) return;
    setEstado('loading');
    setArea(null);
    try {
      // CAreaTelmex.new() ≡ _clone.init() asíncrono
      const inst = await CAreaTelmex.new(nombreBusqueda, mockLandbaseService);
      setArea(inst);
      setEstado(inst.encontrado ? 'ok' : 'error');
    } catch {
      setEstado('error');
    }
  };

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_area_telmex — DAO de área Telmex (landbase)</h3>

      {/* Selector de nombre */}
      <div style={s.controls}>
        <p style={s.subtitle}>Áreas disponibles (mock dataset :landbase / :user!_area)</p>
        <div style={s.btnRow}>
          {NOMBRES_DISPONIBLES.map(n => (
            <button key={n}
              style={{ ...s.btn, background: nombre === n ? '#2E4057' : '#f0f0f0',
                       color: nombre === n ? '#fff' : '#333' }}
              onClick={() => { setNombre(n); buscar(n); }}>
              {n}
            </button>
          ))}
        </div>

        <div style={s.row}>
          <label style={s.lbl}>PsNombre (nombre del área)</label>
          <input style={s.inp} type="text" value={nombre} placeholder="Ej: AREA-NORTE"
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar(nombre)} />
          <button style={s.btn} onClick={() => buscar(nombre)}>
            CAreaTelmex.new()
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {estado === 'loading' && (
        <div style={s.badge('#e8f0fe', '#1a73e8')}>
          Consultando dataset :landbase → select(predicate.eq(:user!_nombre, "{nombre}"))…
        </div>
      )}
      {estado === 'error' && (
        <div style={s.badge('#fdecea', '#c62828')}>
          _when does_not_understand → write("Error al asignar el area") — área no encontrada.
        </div>
      )}

      {/* Resultado */}
      {estado === 'ok' && area && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>

          {/* Tarjeta de datos */}
          <div style={s.card}>
            <p style={s.subtitle}>Propiedades del objeto GIS</p>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Getter TS', 'Campo Magik', 'Valor'].map(h =>
                    <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['area.nombre',      '.objeto.user!_nombre',      area.nombre],
                  ['area.direccion',   '.objeto.user!_direccion',   area.direccion],
                  ['area.telefono',    '.objeto.user!_telefono',    area.telefono],
                  ['area.responsable', '.objeto.user!_responsable', area.responsable],
                ].map(([ts, magik, val]) => (
                  <tr key={ts as string}>
                    <td style={s.td}><code style={{ fontSize: 11 }}>{ts}</code></td>
                    <td style={s.td}><code style={{ fontSize: 10, color: '#888' }}>{magik}</code></td>
                    <td style={s.td}>{val as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Traza de llamadas Magik → TS */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={s.subtitle}>Traza de llamadas Magik → TypeScript</p>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Paso', 'Magik', 'TypeScript'].map(h =>
                    <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1. Factory',    'c_area_telmex.new(nombre)',                    'await CAreaTelmex.new(nombre, svc)'],
                  ['2. Init',       '_self.objeto_area(nombre)',                    'await inst.init(nombre, svc)'],
                  ['3. Dataset',    'gis_program_manager\n.cached_dataset(:landbase)\n.collection(:user!_area)', 'service.getAreaByNombre(nombre)'],
                  ['4. Predicado',  'predicate.eq(:user!_nombre, nombre)\n+ select().an_element()',             'filter by nombre (interno en service)'],
                  ['5. InfoAdmin',  '.infoadmin.an_element()',                       'record.infoadmin (InfoAdmin)'],
                  ['6. Getter',     '.objeto.user!_direccion.write_string',          'area.direccion ?? ""'],
                ].map(([paso, magik, ts]) => (
                  <tr key={paso as string}>
                    <td style={{ ...s.td, whiteSpace: 'nowrap' as const }}>{paso}</td>
                    <td style={s.td}><code style={{ fontSize: 9, whiteSpace: 'pre' as const }}>{magik}</code></td>
                    <td style={s.td}><code style={{ fontSize: 10 }}>{ts}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Área sin encontrar con nombre inventado → muestra error correcto */}
      {estado === 'idle' && (
        <p style={s.meta}>
          Selecciona un área o escribe un nombre y pulsa Enter / CAreaTelmex.new()
        </p>
      )}
    </div>
  );
}

const s = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:780, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 } as React.CSSProperties,
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' } as React.CSSProperties,
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' } as React.CSSProperties,
  meta     : { margin:'4px 0 0', fontSize:11, color:'#aaa' } as React.CSSProperties,
  controls : { display:'flex', flexDirection:'column', gap:8 } as React.CSSProperties,
  btnRow   : { display:'flex', gap:6, flexWrap:'wrap' as const },
  row      : { display:'flex', alignItems:'center', gap:8 } as React.CSSProperties,
  lbl      : { minWidth:180, fontSize:11, color:'#555' } as React.CSSProperties,
  inp      : { flex:1, padding:'4px 8px', border:'1px solid #ccc', borderRadius:3, fontSize:12 } as React.CSSProperties,
  btn      : { padding:'4px 12px', background:'#2E4057', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12 } as React.CSSProperties,
  card     : { border:'1px solid #ddd', borderRadius:4, padding:12, flex:'0 0 auto', minWidth:320 } as React.CSSProperties,
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'4px 8px', textAlign:'left' as const, fontSize:11 } as React.CSSProperties,
  td       : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:12 } as React.CSSProperties,
  badge    : (bg: string, col: string) => ({ padding:'8px 12px', background:bg, color:col, borderRadius:4, fontSize:11, marginTop:4 } as React.CSSProperties),
};

export default AreaTelmexUI;
