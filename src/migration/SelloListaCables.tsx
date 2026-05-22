/**
 * Migración de: c_sello_lista_cables.magik
 * Clase Magik:  c_sello_lista_cables  —  package user
 * Hereda:       c_base_sello_fibra  →  CBaseSelloFibraLayout (TablaEncGeoreferencia.tsx)
 *
 * Sello de plano "Lista de cables a proyectar".
 * Genera 3 tablas posicionadas verticalmente:
 *
 *   tbl_titulo     (1×1, 20×100 mm) — "CANTIDAD DE CABLE A PROYECTAR"
 *   tbl_subtitulos (1×3, 20×[33,33,34]) — Capacidad | Tipo | Longitud
 *   tbl_contenido  (N×3, 10×[33,33,34]) — datos por cable desde c_distrito
 *
 * N = cables.length (mínimo 1 renglón si DistritoOptico es null).
 */

import React, { useState } from 'react';

import {
  CBaseSelloFibraLayout,
  type Coord2D,
  type TableLayout,
  type CellBorderConfig,
} from './TablaEncGeoreferencia';

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Magik: property_list con claves :capacidad, :tipo, :longitud
 * Cada elemento de la colección devuelta por c_distrito.obten_cables_secundarios_agrupados()
 */
export interface CableData {
  capacidad: string;   // datos[:capacidad]
  tipo:      string;   // datos[:tipo]
  longitud:  number;   // datos[:longitud]  → write_string_normal(1) ≡ toFixed(1)
}

/**
 * Magik: c_distrito (clase global)
 * Abstrae c_distrito.obten_cables_secundarios_agrupados(DistritoOptico).
 */
export interface DistritoService {
  obtenCablesSecundariosAgrupados(distritoOptico: number): CableData[];
}

/** Magik: layout_attribute_definition — descriptor de atributo editable */
export interface AttributeDefinition {
  name:         string;
  type:         string;
  description:  string;
  defaultValue: unknown;
}

// =============================================================================
// MOCK DistritoService — sustituye a c_distrito en demos/tests
// =============================================================================

const CABLES_MOCK: Record<number, CableData[]> = {
  1: [
    { capacidad: 'FOE-24', tipo: 'Fibra Óptica', longitud: 1250.5 },
    { capacidad: 'FOE-12', tipo: 'Fibra Óptica', longitud:  825.3 },
    { capacidad: 'CU-2',   tipo: 'Cobre',        longitud:  500.0 },
  ],
  2: [
    { capacidad: 'FOE-48', tipo: 'Fibra Óptica', longitud: 2100.0 },
    { capacidad: 'FOE-24', tipo: 'Fibra Óptica', longitud:  980.5 },
  ],
  3: [
    { capacidad: 'FOE-96', tipo: 'Fibra Óptica', longitud: 3500.8 },
    { capacidad: 'FOE-48', tipo: 'Fibra Óptica', longitud: 1800.2 },
    { capacidad: 'FOE-24', tipo: 'Fibra Óptica', longitud:  750.0 },
    { capacidad: 'CU-4',   tipo: 'Cobre',        longitud:  320.5 },
  ],
};

export const mockDistritoService: DistritoService = {
  obtenCablesSecundariosAgrupados: (id) => CABLES_MOCK[id] ?? [],
};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CSelloListaCables extends CBaseSelloFibraLayout {

  /** Magik: atributo DistritoOptico (integer, :default_value _unset) */
  private distritoOptico: number | null;

  /** Servicio que provee los datos de cables — abstrae c_distrito */
  private service: DistritoService;

  /** Cache de cables recuperados en configuraTablal(), usado por llenaDatatosCeldas() */
  private cables: CableData[] = [];

  constructor(
    distritoOptico: number | null  = null,
    service:        DistritoService = mockDistritoService,
  ) {
    super();
    this.distritoOptico = distritoOptico;
    this.service        = service;
  }

  /**
   * Magik: c_sello_lista_cables.defined_attributes
   *
   *   LcollAtributos << rope.new_from(_super.defined_attributes)
   *   LcollAtributos.add(layout_attribute_definition.new(:DistritoOptico, :integer,
   *     :description, "Distrito Optico", :default_value, _unset, ...))
   *   _return LcollAtributos
   */
  static definedAttributes(): AttributeDefinition[] {
    return [
      // _super.defined_attributes — atributos de c_base_sello_fibra (no listados individualmente)
      {
        name:         'DistritoOptico',
        type:         'integer',
        description:  'Distrito Optico',
        defaultValue: null,   // :default_value, _unset
      },
    ];
  }

  /**
   * Magik: c_sello_lista_cables.configura_tabla()
   *
   * 1. tbl_titulo    (1×1): rowH=[20], colW=[100]
   *    → origen = oCoordInicio
   *
   * 2. tbl_subtitulos (1×3): rowH=[20], colW=[33,33,34]
   *    → origen.y = inicio.y − longitud_total_renglones({:tbl_titulo})
   *
   * 3. Recupera LoCables para determinar LoTotRenglones
   *    _if LoCables.size > 1 → LoTotRenglones = cables.size  else → 1
   *
   * 4. tbl_contenido (N×3): rowH=[10…10], colW=[33,33,34]
   *    → origen.y = inicio.y − (renglones_tbl_titulo + renglones_tbl_subtitulos)
   *    Nota: el primer `elemento(1).nlongitud << 20` queda sobrescrito por el loop
   *    que pone 10 a TODOS los renglones → todos son 10 mm.
   */
  configuraTablal(): void {
    const COLOR_NEGRO: [number, number, number] = [0, 0, 0];
    const orig = this.oCoordInicio;

    // ── tbl_titulo ────────────────────────────────────────────────────────────
    // crea_tabla(1,1,:tbl_titulo) — ren:[20], col:[100]
    this.crearTabla(1, 1, 'tbl_titulo', [20], [100]);
    this.setTableLayout('tbl_titulo', { ...orig }, COLOR_NEGRO);

    // ── tbl_subtitulos ────────────────────────────────────────────────────────
    // crea_tabla(1,3,:tbl_subtitulos) — ren:[20], col:[33,33,34]
    // ln_desp_y << longitud_total_renglones({:tbl_titulo})  = 20
    this.crearTabla(1, 3, 'tbl_subtitulos', [20], [33, 33, 34]);
    const despY1 = this.longitudTotalRenglones(['tbl_titulo']);        // 20
    this.setTableLayout('tbl_subtitulos',
      { x: orig.x, y: orig.y - despY1 },
      COLOR_NEGRO,
    );

    // ── LoCables — determina número de renglones de tbl_contenido ─────────────
    // _if _self.DistritoOptico _isnt _unset → LoCables = c_distrito.obten_cables_...(id)
    // _if LoCables.size > 1 → LoTotRenglones = LoCables.size  else → 1
    this.cables = this.distritoOptico !== null
      ? this.service.obtenCablesSecundariosAgrupados(this.distritoOptico)
      : [];
    const totRenglones = this.cables.length > 1 ? this.cables.length : 1;

    // ── tbl_contenido ─────────────────────────────────────────────────────────
    // crea_tabla(N,3,:tbl_contenido) — ren:[10…] (todos 10mm), col:[33,33,34]
    // El loop `_for ren _over range(1,N)` sobrescribe el 20 inicial → todos 10
    const rowHeights = Array<number>(totRenglones).fill(10);
    this.crearTabla(totRenglones, 3, 'tbl_contenido', rowHeights, [33, 33, 34]);
    const despY2 = despY1 + this.longitudTotalRenglones(['tbl_subtitulos']); // 20+20=40
    this.setTableLayout('tbl_contenido',
      { x: orig.x, y: orig.y - despY2 },
      COLOR_NEGRO,
    );
  }

  /**
   * Magik: c_sello_lista_cables.etiqueta_celdas()
   *
   *   asigna_texto_celda(:tbl_Titulo,1,1,"CANTIDAD DE CABLE A PROYECTAR",40)
   *   asigna_texto_celda(:tbl_subtitulos,1,1,"CAPACIDAD",25,:centre_centre,...)
   *   asigna_texto_celda(:tbl_subtitulos,1,2,"TIPO DE CABLE",25,:centre_centre,...)
   *   asigna_texto_celda(:tbl_subtitulos,1,3,"LONGITUD (MTS.)",25,:centre_centre,...)
   */
  etiquetaCeldas(): void {
    const C = 'centre_centre';

    // tbl_titulo — sin alineación explícita en el Magik
    this.asignarTextoEnCelda('tbl_titulo',     1, 1, 'CANTIDAD DE CABLE A PROYECTAR', 40, 'default');

    // tbl_subtitulos — :centre_centre
    this.asignarTextoEnCelda('tbl_subtitulos', 1, 1, 'CAPACIDAD',       25, C);
    this.asignarTextoEnCelda('tbl_subtitulos', 1, 2, 'TIPO DE CABLE',   25, C);
    this.asignarTextoEnCelda('tbl_subtitulos', 1, 3, 'LONGITUD (MTS.)', 25, C);
  }

  /**
   * Magik: c_sello_lista_cables.llena_datos_celdas()
   *
   *   _global dato; dato << 0
   *   lpl_datos << c_distrito.obten_cables_secundarios_agrupados(_self.DistritoOptico)
   *   _for datos _over lpl_datos.fast_elements()
   *     cont +<< 1
   *     asigna_texto_celda(:tbl_contenido, cont, 1, datos[:capacidad], ...)
   *     asigna_texto_celda(:tbl_contenido, cont, 2, datos[:tipo], ...)
   *     asigna_texto_celda(:tbl_contenido, cont, 3,
   *       datos[:longitud].write_string_normal(1), ...)   ← toFixed(1) en TS
   *     _if datos[:longitud] > 1000 → dato << datos[:longitud]
   *
   * Retorna el equivalente a la variable _global `dato`:
   *   último valor de longitud > 1000 encontrado (0 si ninguno supera 1000).
   */
  llenaDatatosCeldas(): number {
    const C = 'centre_centre';
    // _global dato << 0
    let dato = 0;

    // Reutiliza this.cables recuperados en configuraTablal()
    this.cables.forEach((cable, i) => {
      const cont = i + 1;   // cont +<< 1 (base 1 en Magik)

      this.asignarTextoEnCelda('tbl_contenido', cont, 1, cable.capacidad,           25, C);
      this.asignarTextoEnCelda('tbl_contenido', cont, 2, cable.tipo,                25, C);
      // datos[:longitud].write_string_normal(1) → toFixed(1)
      this.asignarTextoEnCelda('tbl_contenido', cont, 3, cable.longitud.toFixed(1), 25, C);

      // _if datos[:longitud] > 1000 → dato << datos[:longitud]
      if (cable.longitud > 1000) dato = cable.longitud;
    });

    return dato;
  }

  /**
   * Punto de entrada: configura → etiqueta → llena datos.
   * Devuelve tablas, layouts, celdas y el valor del _global `dato`.
   */
  buildSello(origen: Coord2D): {
    tables:       ReturnType<CBaseSelloFibraLayout['buildLayout']>['tables'];
    tableLayouts: ReturnType<CBaseSelloFibraLayout['buildLayout']>['tableLayouts'];
    cells:        ReturnType<CBaseSelloFibraLayout['buildLayout']>['cells'];
    cellBorders:  ReturnType<CBaseSelloFibraLayout['buildLayout']>['cellBorders'];
    dato:         number;
    cables:       CableData[];
  } {
    this.oCoordInicio = origen;
    this.configuraTablal();        // crea tablas + carga cables[]
    this.etiquetaCeldas();         // etiquetas estáticas
    const dato = this.llenaDatatosCeldas();  // datos dinámicos

    return {
      tables:       this.tables,
      tableLayouts: this.tableLayouts,
      cells:        this.cells,
      cellBorders:  this.cellBorders,
      dato,
      cables:       this.cables,
    };
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

const DISTRITOS = [
  { id: null, label: '— sin distrito —' },
  { id: 1,    label: 'Distrito 1 (3 cables)' },
  { id: 2,    label: 'Distrito 2 (2 cables)' },
  { id: 3,    label: 'Distrito 3 (4 cables)' },
];

export function SelloListaCablesUI() {
  const [distritoId, setDistritoId] = useState<number | null>(null);
  const [result, setResult] = useState<ReturnType<CSelloListaCables['buildSello']> | null>(null);

  const generar = () => {
    const inst = new CSelloListaCables(distritoId, mockDistritoService);
    setResult(inst.buildSello({ x: 0, y: 0 }));
  };

  const SCALE = 3.8;   // mm → px

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_lista_cables — Lista de cables a proyectar</h3>

      {/* Controles */}
      <div style={s.controls}>
        <div style={s.row}>
          <label style={s.lbl}>DistritoOptico (integer)</label>
          <select style={s.sel} value={String(distritoId)}
            onChange={e => { setDistritoId(e.target.value === 'null' ? null : +e.target.value); setResult(null); }}>
            {DISTRITOS.map(d => (
              <option key={String(d.id)} value={String(d.id)}>{d.label}</option>
            ))}
          </select>
        </div>
        <button style={s.btn} onClick={generar}>buildSello()</button>
      </div>

      {result && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>

          {/* Vista esquemática proporcional */}
          <div>
            <p style={s.subtitle}>Layout proporcional (1 mm = {SCALE} px)</p>
            <div style={{ display: 'inline-block', border: '1px solid #ccc' }}>
              {/* tbl_titulo */}
              <div style={{
                width: 100 * SCALE, height: 20 * SCALE,
                border: '1px solid #000', background: '#2E4057',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>
                  CANTIDAD DE CABLE A PROYECTAR
                </span>
              </div>

              {/* tbl_subtitulos */}
              <div style={{ display: 'flex' }}>
                {[
                  { w: 33, label: 'CAPACIDAD'       },
                  { w: 33, label: 'TIPO DE CABLE'   },
                  { w: 34, label: 'LONGITUD (MTS.)' },
                ].map(col => (
                  <div key={col.label} style={{
                    width: col.w * SCALE, height: 20 * SCALE,
                    border: '1px solid #000', background: '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}>
                    <span style={{ fontSize: 7, fontWeight: 'bold', textAlign: 'center' }}>{col.label}</span>
                  </div>
                ))}
              </div>

              {/* tbl_contenido */}
              {result.cables.length > 0
                ? result.cables.map((c, ri) => (
                    <div key={ri} style={{ display: 'flex' }}>
                      {[c.capacidad, c.tipo, c.longitud.toFixed(1)].map((val, ci) => (
                        <div key={ci} style={{
                          width: [33, 33, 34][ci] * SCALE, height: 10 * SCALE,
                          border: '1px solid #ccc',
                          background: c.longitud > 1000 ? '#fff3cd' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxSizing: 'border-box',
                        }}>
                          <span style={{ fontSize: 7 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  ))
                : (
                    <div style={{ display: 'flex' }}>
                      {[33, 33, 34].map((w, ci) => (
                        <div key={ci} style={{
                          width: w * SCALE, height: 10 * SCALE,
                          border: '1px solid #ccc', background: '#fafafa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxSizing: 'border-box',
                        }}>
                          <span style={{ fontSize: 7, color: '#ccc' }}>—</span>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
            <p style={s.meta}>
              100 mm × {40 + Math.max(1, result.cables.length) * 10} mm total
              {' | '}renglones contenido: {Math.max(1, result.cables.length)}
            </p>
            {result.dato > 0 && (
              <p style={{ ...s.meta, color: '#c00', fontWeight: 'bold' }}>
                _global dato = {result.dato.toFixed(1)} m (longitud &gt; 1000)
              </p>
            )}
          </div>

          {/* Tabla de configuración de tablas */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={s.subtitle}>Configuración de tablas</p>
            <table style={s.table}>
              <thead>
                <tr>{['id','rows×cols','rowHeights','colWidths','origen'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {['tbl_titulo','tbl_subtitulos','tbl_contenido'].map(tid => {
                  const tbl    = result.tables.get(tid);
                  const layout = result.tableLayouts.get(tid);
                  if (!tbl || !layout) return null;
                  return (
                    <tr key={tid}>
                      <td style={s.td}><code style={{ fontSize: 10 }}>{tid}</code></td>
                      <td style={{ ...s.td, textAlign:'center' as const }}>{tbl.rows}×{tbl.cols}</td>
                      <td style={s.td}><code>[{tbl.rowHeights.join(',')}]</code></td>
                      <td style={s.td}><code>[{tbl.colWidths.join(',')}]</code></td>
                      <td style={s.td}>
                        <code>({layout.origen.x},{layout.origen.y})</code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Datos de cables */}
            {result.cables.length > 0 && (
              <>
                <p style={{ ...s.subtitle, marginTop: 10 }}>
                  llena_datos_celdas() — {result.cables.length} cables
                </p>
                <table style={s.table}>
                  <thead>
                    <tr>{['capacidad','tipo','longitud (1 dec.)','> 1000 m'].map(h =>
                      <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.cables.map((c, i) => (
                      <tr key={i} style={{ background: c.longitud > 1000 ? '#fff3cd' : undefined }}>
                        <td style={s.td}><code>{c.capacidad}</code></td>
                        <td style={s.td}>{c.tipo}</td>
                        <td style={{ ...s.td, textAlign:'right' as const }}>
                          {c.longitud.toFixed(1)}
                        </td>
                        <td style={{ ...s.td, textAlign:'center' as const }}>
                          {c.longitud > 1000 ? '✓ → dato' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:700, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta     : { margin:'4px 0 0', fontSize:10, color:'#888' },
  controls : { display:'flex', flexDirection:'column', gap:8 },
  row      : { display:'flex', alignItems:'center', gap:8 },
  lbl      : { minWidth:180, fontSize:11, color:'#555' },
  sel      : { padding:'3px 8px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  btn      : { alignSelf:'flex-start', padding:'6px 16px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'4px 6px', textAlign:'left' as const, fontSize:10 },
  td       : { padding:'3px 6px', borderBottom:'1px solid #eee', fontSize:11 },
};

export default SelloListaCablesUI;
