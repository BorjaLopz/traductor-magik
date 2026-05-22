/**
 * CListaMaterialesEsquema.tsx
 * Migración de c_lista_materiales_esquema.magik (Sigma Tao / Sellos)
 *
 * Jerarquía Magik: c_lista_materiales_esquema extends :c_base_sello_fibra
 * Propósito: sello de layout "Lista de Materiales" que escanea el
 *   esquemático activo del mapa (ACE matcha "*esquema*"), filtra elementos
 *   con construction_status="PROYECTADO" y los agrupa por
 *   source_collection.name, construyendo una tabla 4 columnas:
 *     [No, DESCRIPCION, UNIDAD, CANTIDAD].
 *
 *   tipo = :red          → lista los elementos owner (cable / conexión / vías…)
 *   tipo = :estructuras  → lista las estructuras embebidas en cada owner
 *
 * Reglas de unidades:
 *   - primary_geometry = :route        → "metros" (suma de measured_length).
 *     Si la colección es :sheath y measured_length<=0 → usa
 *     calculated_fiber_length.
 *   - resto                            → "pzas".
 *
 * Reglas de descripción:
 *   - :sheath                          → desc_mat = external_name + clase + fiber_qty.
 *   - tipo_conexion presente           → desc_mat = user!_tipo_conexion.
 *   - :underground_route|:figure_eight|:user!_terminal_fo|:uub
 *                                      → desc_mat = key.split("|")[2 ó 1]
 *                                        desc_uc  = external_name.
 *   - resto                            → desc_mat = external_name.
 *
 * Mapeo Magik → TypeScript:
 *   - hash_table.new() / property_list  → Map<string, Set<GisItem>> ó Record.
 *   - equality_set.new()                → Set<GisItem> (deduplica owner).
 *   - sorted_collection figure_order_proc(:strings_with_numbers)
 *                                       → naturalSort comparator.
 *   - source_collection.name            → item.collectionName.
 *   - measured_length.value_in(:m)      → item.measuredLengthM.
 *   - smallworld_product.pni_application().plugin(:map_plugin).current_map_view.get_selectable_geometry_set()
 *                                       → GisService.getSelectableGeometry().
 *   - asigna_texto_celda(tbl, r, c, ...) → Cell { row, col, text, fontSize }.
 */

import React, { useEffect, useMemo, useState } from 'react';

// ───────────────────────────────────────────────────────────────────────────
// TIPOS — equivalentes a slots del original
// ───────────────────────────────────────────────────────────────────────────

export type TipoSello = 'red' | 'estructuras';

/** Equivale a un objeto GIS (rwo + owner Magik). */
export interface GisItem {
  id                    : string;
  collectionName        : string;             // source_collection.name (símbolo Magik)
  collectionExternalName: string;             // source_collection.external_name
  constructionStatus    : 'PROYECTADO' | 'CONSTRUIDO' | 'OTRO';
  primaryGeometry       : 'route' | 'point' | 'area' | null;
  isStructure           : boolean;
  specId?               : string;             // owner.spec_id
  measuredLengthM?      : number;             // measured_length.value_in(:m)
  calculatedFiberLengthM?: number;
  tipoConexion?         : string;             // user!_tipo_conexion
  tipoObraCo?           : string;             // user!_tipo_obra_co
  sheathClase?          : string;             // mspec.user!_clase
  sheathFiberQty?       : number;             // mspec.fiber_quantity
  /** structures embebidas — equivalente a owner.structures Magik. */
  structures?           : GisItem[];
  /** mit_internal_connections embebidas. */
  internalConnections?  : Array<{ tipoConexion: string; constructionStatus: string }>;
}

/** Resultado del scan del mapa — equality_sets agrupados por key. */
export interface ScanResult {
  estructuras: Map<string, Set<GisItem>>;
  elementos  : Map<string, Set<GisItem>>;
}

/** Servicio GIS mockeable — abstrae current_map_view. */
export interface GisService {
  /** Magik: mv.ace_name.lowercase.matches?("*esquema*") */
  aceName              : string;
  /** Magik: mv.get_selectable_geometry_set() */
  getSelectableGeometry: () => Promise<GisItem[]>;
}

/** Celda de la tabla — equivalente a asigna_texto_celda(tbl, ren, col, ...). */
export interface Cell {
  row     : number;
  col     : number;
  text    : string;
  fontSize: number;
}

/** Tabla configurada — tbl_lista_materiales. */
export interface Tabla {
  filas      : number;
  cols       : number;
  alturas    : number[]; // lo_tabla.orenglones[i].nlongitud (mm)
  anchos     : number[]; // lo_tabla.ocolumnas[i].nlongitud (mm)
  bordeOculto: Set<string>; // "fi,ci" → bBorde_*? = false
  celdas     : Cell[];
}

// ───────────────────────────────────────────────────────────────────────────
// CLASE PRINCIPAL — CListaMaterialesEsquema
// def_slotted_exemplar(:c_lista_materiales_esquema, {:tipo}, :c_base_sello_fibra)
// ───────────────────────────────────────────────────────────────────────────
export class CListaMaterialesEsquema {
  tipo  : TipoSello;
  tabla : Tabla | null = null;
  scan  : ScanResult   = { estructuras: new Map(), elementos: new Map() };

  constructor(tipo: TipoSello) {
    this.tipo = tipo;
  }

  // ─── select_from_map() ─────────────────────────────────────────────────
  // Recorre la selección activa del mapa esquemático, filtra PROYECTADO
  // y agrupa structures / elementos por key = collectionName + "|" + extra.
  async selectFromMap(gis: GisService): Promise<ScanResult> {
    const out: ScanResult = { estructuras: new Map(), elementos: new Map() };
    if (!/esquema/i.test(gis.aceName)) return out;

    const geoms = await gis.getSelectableGeometry();

    for (const owner of geoms) {
      if (owner.constructionStatus !== 'PROYECTADO') continue;

      // ── structures de este owner (PROYECTADO) ──────────────────────
      for (const str of owner.structures ?? []) {
        if (str.constructionStatus !== 'PROYECTADO') continue;
        const key = buildKey(str);
        addToBucket(out.estructuras, key, str);
      }

      // ── elementos del owner — sólo si NO es estructura ─────────────
      if (!owner.isStructure) {
        const key = buildKeyOwner(owner);
        addToBucket(out.elementos, key, owner);

        // mit_internal_connections "FUSION" PROYECTADO.
        for (const c of owner.internalConnections ?? []) {
          if (c.tipoConexion.toUpperCase() === 'FUSION' && c.constructionStatus === 'PROYECTADO') {
            addToBucket(out.elementos, 'mit_internal_connection|', {
              id            : `fusion-${out.elementos.get('mit_internal_connection|')?.size ?? 0}`,
              collectionName: 'mit_internal_connection',
              collectionExternalName: 'Fusión',
              constructionStatus    : 'PROYECTADO',
              primaryGeometry       : null,
              isStructure           : false,
              tipoConexion          : c.tipoConexion,
            });
          }
        }
      }
    }
    this.scan = out;
    return out;
  }

  // ─── elementos_de_proyecto() ───────────────────────────────────────────
  // Selecciona el bucket de scan según tipo. Devuelve (planoLista, ht).
  elementosDeProyecto(): { planoLista: GisItem[]; ht: Map<string, Set<GisItem>> } {
    const ht = this.tipo === 'red' ? this.scan.elementos : this.scan.estructuras;
    const planoLista: GisItem[] = [];
    for (const set of ht.values()) {
      for (const v of set) planoLista.push(v);
    }
    return { planoLista, ht };
  }

  // ─── obten_lista_materiales() ──────────────────────────────────────────
  obtenListaMateriales(): { planoLista: GisItem[]; ht: Map<string, Set<GisItem>> } {
    return this.elementosDeProyecto();
  }

  // ─── keys_Order(ht) ────────────────────────────────────────────────────
  // sorted_collection.figure_order_proc(:strings_with_numbers) → naturalSort.
  static keysOrder(ht: Map<string, Set<GisItem>>): string[] {
    return [...ht.keys()].sort(naturalCompare);
  }

  // ─── configura_tabla() ─────────────────────────────────────────────────
  // Crea tabla 2+N filas × 4 cols. Oculta bordes de la fila 1 (título).
  configuraTabla(): Tabla {
    const { ht } = this.obtenListaMateriales();
    const renglones = 2 + ht.size;

    const tabla: Tabla = {
      filas      : renglones,
      cols       : 4,
      alturas    : Array(renglones).fill(6),  // nlongitud 6 mm
      anchos     : [6, 60, 35, 20],            // col widths Magik
      bordeOculto: new Set(['1,1', '1,2', '1,3', '1,4']),
      celdas     : [],
    };
    this.tabla = tabla;
    return tabla;
  }

  // ─── etiqueta_celdas() ─────────────────────────────────────────────────
  // Magik: título fila 1 col 2 (fontSize 30) + cabecera fila 2 (fontSize 20).
  etiquetaCeldas(): Cell[] {
    if (!this.tabla) this.configuraTabla();
    const titulo = this.tipo === 'red'
      ? 'LISTA DE MATERIALES DE ELEMENTOS DE RED'
      : 'LISTA DE MATERIALES ESTRUCTURAS';

    const cells: Cell[] = [
      { row: 1, col: 2, text: titulo,        fontSize: 30 },
      { row: 2, col: 1, text: 'No',          fontSize: 20 },
      { row: 2, col: 2, text: 'DESCRIPCION', fontSize: 20 },
      { row: 2, col: 3, text: 'UNIDAD',      fontSize: 20 },
      { row: 2, col: 4, text: 'CANTIDAD',    fontSize: 20 },
    ];
    this.tabla!.celdas.push(...cells);
    return cells;
  }

  // ─── llena_datos_celdas() ──────────────────────────────────────────────
  // Recorre ht en orden natural y emite filas con (No, desc_uc, unidad, cantidad).
  llenaDatosCeldas(): Cell[] {
    if (!this.tabla) this.configuraTabla();
    const { ht } = this.obtenListaMateriales();
    const cells: Cell[] = [];

    let cont = 2;
    const keysOrden = CListaMaterialesEsquema.keysOrder(ht);
    for (const key of keysOrden) {
      const values  = [...ht.get(key)!];
      const sample  = values[0];

      cont += 1;
      // Material — equivalente a property_list Magik.
      let cantidad : string = String(values.length);
      let descUnidad: string = 'pzas';
      let descMat   : string = '';
      let descUc    : string = '';

      // Regla :route — sumar measured_length / calculated_fiber_length.
      if (sample.primaryGeometry === 'route') {
        descUnidad = 'metros';
        let total = 0;
        for (const r of values) {
          let lon = r.measuredLengthM ?? 0;
          if (r.collectionName === 'sheath' && lon <= 0) lon = r.calculatedFiberLengthM ?? 0;
          total += lon;
        }
        cantidad = total.toFixed(2);
      }

      // Reglas de descripción.
      if (sample.collectionName === 'sheath') {
        descMat = `${sample.collectionExternalName} ${sample.sheathClase ?? ''} ${sample.sheathFiberQty ?? ''}`.trim();
        descUc  = '';
      } else if (sample.tipoConexion) {
        descMat = sample.tipoConexion;
      } else if (['underground_route', 'figure_eight', 'user!_terminal_fo', 'uub'].includes(sample.collectionName)) {
        const parts = key.split('|');
        descMat = (parts.length > 2 ? parts[2] : parts[1]) ?? '';
        descUc  = sample.collectionExternalName;
      } else {
        descMat = sample.collectionExternalName;
      }
      if (!descMat) descMat = sample.collectionExternalName;

      // Magik: material[:desc_uc] +<< %space + material[:desc_mat]
      descUc = `${descUc} ${descMat}`.trim();

      // Sólo emite si el renglón cabe en la tabla actual.
      if (this.tabla!.filas >= cont) {
        const numFila = cont - 2;
        cells.push(
          { row: cont, col: 1, text: String(numFila), fontSize: 18 },
          { row: cont, col: 2, text: descUc,           fontSize: 18 },
          { row: cont, col: 3, text: descUnidad,       fontSize: 18 },
          { row: cont, col: 4, text: cantidad,         fontSize: 18 },
        );
      }
    }
    this.tabla!.celdas.push(...cells);
    return cells;
  }

  // ─── actualiza_datos() ─────────────────────────────────────────────────
  // Magik: llena_datos_celdas() + draw_content_on(.window).
  async actualizaDatos(gis: GisService): Promise<Tabla> {
    await this.selectFromMap(gis);
    this.configuraTabla();
    this.etiquetaCeldas();
    this.llenaDatosCeldas();
    return this.tabla!;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function buildKey(s: GisItem): string {
  if (s.collectionName === 'underground_route') return `underground_route|${s.tipoObraCo ?? ''}`;
  if (s.collectionName === 'uub')               return `uub|${s.specId ?? ''}`;
  return `${s.collectionName}|`;
}

function buildKeyOwner(o: GisItem): string {
  if (o.specId)                                  return `${o.collectionName}|${o.specId}`;
  if (o.collectionExternalName === 'figure_eight') {
    const m = `${o.sheathClase ?? ''} ${o.sheathFiberQty ?? ''} metros`;
    return `${o.collectionName}|${o.collectionExternalName} ${m}`;
  }
  return `${o.collectionName}|`;
}

function addToBucket(map: Map<string, Set<GisItem>>, key: string, item: GisItem) {
  let bucket = map.get(key);
  if (!bucket) { bucket = new Set(); map.set(key, bucket); }
  bucket.add(item);
}

// figure_order_proc(:strings_with_numbers) — ordena "item2" < "item10".
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// ───────────────────────────────────────────────────────────────────────────
// Mock GisService — equivalente a current_map_view.get_selectable_geometry_set
// ───────────────────────────────────────────────────────────────────────────
export const mockGisService: GisService = {
  aceName: 'esquema_principales',
  async getSelectableGeometry() {
    // Datos sintéticos representativos del esquemático.
    return [
      {
        id: 'cable-1', collectionName: 'sheath', collectionExternalName: 'CABLE FO',
        constructionStatus: 'PROYECTADO', primaryGeometry: 'route', isStructure: false,
        measuredLengthM: 150.3, sheathClase: 'monomodo', sheathFiberQty: 48,
        structures: [
          { id: 's-1', collectionName: 'underground_route', collectionExternalName: 'Canalización', constructionStatus: 'PROYECTADO', primaryGeometry: 'route', isStructure: true, tipoObraCo: 'POSTERIA', measuredLengthM: 25.0 },
          { id: 's-2', collectionName: 'uub', collectionExternalName: 'Caja',         constructionStatus: 'PROYECTADO', primaryGeometry: 'point', isStructure: true, specId: 'UUB-12' },
        ],
      } as GisItem,
      {
        id: 'cable-2', collectionName: 'sheath', collectionExternalName: 'CABLE FO',
        constructionStatus: 'PROYECTADO', primaryGeometry: 'route', isStructure: false,
        measuredLengthM: -1, calculatedFiberLengthM: 80.5, sheathClase: 'monomodo', sheathFiberQty: 48,
      } as GisItem,
      {
        id: 'fig-1', collectionName: 'figure_eight', collectionExternalName: 'figure_eight',
        constructionStatus: 'PROYECTADO', primaryGeometry: 'route', isStructure: false,
        measuredLengthM: 40.2, sheathClase: 'multimodo', sheathFiberQty: 24,
      } as GisItem,
      {
        id: 'conn-1', collectionName: 'mit_internal_connection', collectionExternalName: 'Conexión interna',
        constructionStatus: 'PROYECTADO', primaryGeometry: null, isStructure: false,
        tipoConexion: 'FUSION', internalConnections: [
          { tipoConexion: 'FUSION', constructionStatus: 'PROYECTADO' },
          { tipoConexion: 'FUSION', constructionStatus: 'PROYECTADO' },
        ],
      } as GisItem,
      {
        id: 'term-1', collectionName: 'user!_terminal_fo', collectionExternalName: 'Terminal FO',
        constructionStatus: 'PROYECTADO', primaryGeometry: 'point', isStructure: false, specId: 'TFO-3',
      } as GisItem,
    ];
  },
};

// ───────────────────────────────────────────────────────────────────────────
// UI React — render tabular del sello (HTML, no OL, porque es un sello)
// ───────────────────────────────────────────────────────────────────────────
export function CListaMaterialesEsquemaUI() {
  const [tipo,    setTipo]    = useState<TipoSello>('red');
  const [tabla,   setTabla]   = useState<Tabla | null>(null);
  const [loading, setLoading] = useState(false);
  const [aceName, setAceName] = useState('esquema_principales');

  // Recarga async cuando cambia tipo o aceName.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const gis: GisService = { ...mockGisService, aceName };
    const sello = new CListaMaterialesEsquema(tipo);
    sello.actualizaDatos(gis).then(t => {
      if (!cancelled) { setTabla(t); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [tipo, aceName]);

  // Reconstruye matriz desde celdas planas — Magik: lo_tabla.oceldas.celda(r,c).
  const matriz = useMemo<string[][]>(() => {
    if (!tabla) return [];
    const m: string[][] = Array.from({ length: tabla.filas }, () => Array(tabla.cols).fill(''));
    for (const c of tabla.celdas) {
      if (c.row >= 1 && c.row <= tabla.filas && c.col >= 1 && c.col <= tabla.cols) {
        m[c.row - 1][c.col - 1] = c.text;
      }
    }
    return m;
  }, [tabla]);

  return (
    <div>
      <p style={uiStyles.meta}>
        Sello "Lista de Materiales" — escanea selección activa del esquemático,
        filtra <code>construction_status="PROYECTADO"</code> y agrupa por
        <code> source_collection.name</code>. Async via mock GisService.
      </p>
      <div style={uiStyles.controls}>
        <label>
          Tipo:&nbsp;
          <select value={tipo} onChange={e => setTipo(e.target.value as TipoSello)} style={uiStyles.input}>
            <option value="red">red (elementos)</option>
            <option value="estructuras">estructuras</option>
          </select>
        </label>
        <label>
          ace_name:&nbsp;
          <input type="text" value={aceName} onChange={e => setAceName(e.target.value)} style={{ ...uiStyles.input, width: 220 }} />
        </label>
        {loading && <span style={uiStyles.meta}>cargando…</span>}
      </div>

      {tabla && (
        <div style={uiStyles.info}>
          <span>filas: {tabla.filas}</span>
          <span>cols: {tabla.cols}</span>
          <span>celdas: {tabla.celdas.length}</span>
          <span>bordes ocultos (fila 1): {tabla.bordeOculto.size}</span>
        </div>
      )}

      {!tabla || matriz.length === 0 ? (
        <p style={uiStyles.meta}>Sin datos (ace_name no matchea "*esquema*" o selección vacía).</p>
      ) : (
        <table style={uiStyles.table}>
          <tbody>
            {matriz.map((fila, r) => (
              <tr key={r}>
                {fila.map((celda, c) => {
                  const esTitulo  = r === 0 && c === 1;
                  const esCab     = r === 1;
                  const bordeOff  = tabla?.bordeOculto.has(`${r + 1},${c + 1}`);
                  return (
                    <td key={c} style={{
                      ...uiStyles.td,
                      width        : tabla!.anchos[c] * 4,   // mm → px (×4 para preview)
                      height       : tabla!.alturas[r] * 4,
                      fontSize     : esTitulo ? 16 : esCab ? 12 : 11,
                      fontWeight   : esTitulo || esCab ? 'bold' : 'normal',
                      textAlign    : c === 1 ? 'left' : 'center',
                      borderTop    : bordeOff ? 'none' : '1px solid #888',
                      borderBottom : '1px solid #888',
                      borderLeft   : bordeOff ? 'none' : '1px solid #888',
                      borderRight  : bordeOff ? 'none' : '1px solid #888',
                      background   : esTitulo ? '#fffde7' : esCab ? '#eceff1' : '#fff',
                    }}>{celda}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const uiStyles: Record<string, React.CSSProperties> = {
  meta    : { color: '#666', fontSize: 12, margin: '4px 0 12px' },
  controls: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  input   : { padding: '3px 6px', border: '1px solid #b0bec5', borderRadius: 4, fontSize: 12 },
  info    : { display: 'flex', gap: 18, fontSize: 11, color: '#444', margin: '4px 0 10px' },
  table   : { borderCollapse: 'collapse', marginTop: 8 },
  td      : { padding: '4px 8px', verticalAlign: 'middle' },
};

export default CListaMaterialesEsquema;
