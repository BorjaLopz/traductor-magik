// Source: adiciones_layout/source/Sellos/c_lista_materiales_esquema_red.magik
// Extends c_lista_materiales_esquema_red (c_base_sello_fibra).
// Same table geometry and tipo slot as CListaMaterialesEsquema but with
// more detailed desc_mat resolution logic in llena_datos_celdas and
// richer key-building strategy in select_from_map (structures vs elementos,
// fusion counting). All GIS methods → Fase 5.

import { CBaseSelloFibra } from './CBaseSelloFibra'

// Re-export shared utilities — table geometry, tipo type, base pure functions.
export {
  titleForTipo,
  keysOrder,
  descFromKey,
  formatCantidadMetros,
  resolveUnidad,
  buildSheathDesc,
  COL_WIDTHS,
  ROW_HEIGHT,
  TABLE_NAME,
  HIDDEN_BORDERS_ROW1,
  type TipoLista,
  type MaterialItem,
} from './CListaMaterialesEsquema'

// ─── Collection name literals ─────────────────────────────────────────────────

export type EstructuraCollName =
  | 'underground_route'   // key uses tipo_obra_co
  | 'uub'                 // key uses spec_id
  | string                // generic → key = name + "|"

export type ElementoCollName =
  | 'figure_eight'        // key uses external_name + clase + fiber_qty + "metros"
  | 'mit_internal_connection'
  | string                // has spec_id → key = name + "|" + spec_id

// ─── Pure key builders ────────────────────────────────────────────────────────

// Magik: select_from_map — estructuras branch.
// underground_route uses tipo_obra_co; uub uses spec_id; others get bare "|".
export function buildEstructuraKey(
  collName: string,
  tipoObraCo?: string,
  specId?: string,
): string {
  if (collName === 'underground_route') return `${collName}|${tipoObraCo ?? ''}`
  if (collName === 'uub')               return `${collName}|${specId ?? ''}`
  return `${collName}|`
}

// Magik: select_from_map — elementos (non-structure) branch.
// Non-figure_eight with spec_id uses spec_id; figure_eight uses a compound
// label built from the cable spec; all others get bare "|".
export function buildElementoKey(
  collName: string,
  specId?: string,
  figureEightLabel?: string,
): string {
  if (collName === 'figure_eight' && figureEightLabel !== undefined)
    return `${collName}|${figureEightLabel}`
  if (collName !== 'figure_eight' && specId !== undefined)
    return `${collName}|${specId}`
  return `${collName}|`
}

// Magik: select_from_map figure_eight branch —
//   mspec.user!_clase + " " + mspec.fiber_quantity + " " + "metros"
// Combined with external_name to form the figure_eight key label.
export function buildFigureEightLabel(
  externalName: string,
  clase: string,
  fiberQty: number,
): string {
  return `${externalName} ${clase} ${fiberQty} metros`
}

// Magik: llena_datos_celdas — post-process desc_mat.
// Prepends external_name when desc is empty (branch never set it) or when
// the collection's external_name is "CEDO" (special display prefix rule).
export function applyExternalNamePrefix(descMat: string, externalName: string): string {
  if (!descMat || externalName === 'CEDO') {
    return `${externalName} ${descMat}`.trim()
  }
  return descMat
}

// ─── Desc resolution kind ─────────────────────────────────────────────────────
// Mirrors the if/elif/else chain in llena_datos_celdas.
// Used by the showcase to make the logic interactive.

export type DescKind =
  | 'sheath'       // collection.name === 'sheath'
  | 'specId'       // responds_to spec_id (and not sheath)
  | 'tipoConex'    // responds_to user!_tipo_conexion
  | 'keyParts'     // underground_route | figure_eight | user!_terminal_fo | uub
  | 'extName'      // fallback

export const KEY_PARTS_COLLECTIONS = [
  'underground_route',
  'figure_eight',
  'user!_terminal_fo',
  'uub',
] as const

// Resolves which desc branch applies for a given collection + capabilities.
export function resolveDescKind(
  collName: string,
  hasSpecId:       boolean,
  hasTipoConexion: boolean,
): DescKind {
  if (collName === 'sheath')                              return 'sheath'
  if (hasSpecId)                                          return 'specId'
  if (hasTipoConexion)                                    return 'tipoConex'
  if ((KEY_PARTS_COLLECTIONS as readonly string[]).includes(collName)) return 'keyParts'
  return 'extName'
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CListaMaterialesEsquemaRed extends CBaseSelloFibra {
  tipo: import('./CListaMaterialesEsquema').TipoLista = 'red'

  // Magik: new_with(Ptipo, *args) — factory with tipo preset
  static newWith(tipo: import('./CListaMaterialesEsquema').TipoLista): CListaMaterialesEsquemaRed {
    const inst = new CListaMaterialesEsquemaRed()
    inst.tipo  = tipo
    return inst
  }

  // Magik: configura_tabla — identical geometry to CListaMaterialesEsquema, Fase 5
  override configurarTabla(): void {
    // Dynamic: rows = 2 + ht.size; cols [6,60,35,20] mm; row 1 borders hidden.
  }

  // Magik: etiqueta_celdas — identical to CListaMaterialesEsquema
  override etiquetarCeldas(): void {
    // Row 1 col 2: titleForTipo(tipo); row 2: No|DESCRIPCION|UNIDAD|CANTIDAD
  }

  // Magik: actualiza_datos — Fase 5
  actualizarDatos(): void { /* Fase 5 */ }

  // Magik: llena_datos_celdas — more detailed than base; desc_mat has 5 branches:
  //   sheath → buildSheathDesc; spec_id → spec_id; user!_tipo_conexion → tipo_conexion;
  //   underground_route|figure_eight|user!_terminal_fo|uub → descFromKey(key);
  //   else → external_name. Then applyExternalNamePrefix for CEDO/empty fix.
  llenarDatosCeldas(): void { /* Fase 5 */ }

  // Magik: obten_lista_materiales → elementos_de_proyecto, Fase 5
  obtenerListaMateriales(): { items: unknown[]; ht: Map<string, unknown[]> } {
    return { items: [], ht: new Map() }
  }

  // Magik: elementos_de_proyecto — dispatches by tipo (red→LoElementos, estructuras→LOestructuras)
  elementosDeProyecto(): { all: unknown[]; ht: Map<string, unknown[]> } {
    return { all: [], ht: new Map() }
  }

  // Magik: select_from_map — GIS: iterates selectable geometries on ace "*esquema*",
  // filters PROYECTADO owners. Builds estructuras (underground_route/uub/generic keys)
  // and elementos (spec_id/figure_eight/generic keys) maps.
  // Also counts mit_internal_connections where tipo_conexion="FUSION" and PROYECTADO.
  // Fase 5.
  selectFromMap(): { estructuras: Map<string, unknown[]>; elementos: Map<string, unknown[]> } {
    return { estructuras: new Map(), elementos: new Map() }
  }
}
