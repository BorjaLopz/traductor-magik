// Source: planos_fo/source/montaje_tba/sellos/c_lista_materiales.magik
// Sello that renders a materials list for a TBA (or generic) construction project.
// Extends CBaseSelloFibra (no additional slots).
//
// Table layout (tbl_lista_materiales):
//   Rows: 2 header rows + 1 row per material group (sized by obtenListaMateriales at build time)
//   Cols: 4
//   All row heights: 6 mm
//   Col widths (mm): col1=6, col2=60, col3=35, col4=20
//   Border hiding on row 1, cols 1-4: top + right + left hidden
//
// Cell labels (etiquetarCeldas):
//   (1,2) "LISTA DE MATERIALES"  — size 30
//   (2,1) "No"                    — size 20
//   (2,2) "DESCRIPCION"           — size 20
//   (2,3) "UNIDAD"                — size 20
//   (2,4) "CANTIDAD"              — size 20
//
// llenarDatosCeldas() — Fase 5:
//   1. obtenListaMateriales() → (elements[], Map<key, GisObject[]>)
//   2. If table has only 1 total table, reconfigures + re-labels.
//   3. For each group in the map, resolves desc/unit/quantity via GIS type dispatch:
//        sheath       → spec_record.user!_clase + fiber_quantity (unit = metres, measured length)
//        optical_splitter / user!_terminal_fo / figure_eight → key.split("|")[2]
//        mit_internal_connection → "Terminales de FO,Empalmes y CEDOS" (unit = "Fusiones en ")
//        spec_id      → spec_id string
//        user!_tipo_conexion → tipo_conexion string
//        underground_route → key.split("|")[2]
//      Writes (cont,1)=rowNumber (cont,2)=desc (cont,3)=unit (cont,4)=quantity
//      Skips rows beyond the table's actual row count (ren_tbl guard).
//
// Data methods (all Fase 5 — require active GIS design + plugin gen_planos):
//   consultarListaMateriales(type, groupField) → groups PROYECTADO objects by
//       source_collection.name + "|" + spec_id_or_field, special case for figure_eight.
//   elementosDeProyecto() → branches on active_design.tipo_diseno:
//       :secundaria → elementosEnSecundariosAgrupados() + mit_internal_connection fusions
//       else        → consultarListaMateriales for :ocables, :oelementos, :obasinicio,
//                     :obasfinal, :oestructuras, :ocanalizacion
//   elementosEnPrincipales() / elementosEnPrincipalesFalc() → OEI/segment/connectivity traversal
//   elementosEnSecundarios() / elementosEnSecundariosFalc() → CEDO → splitter → port connectivity
//   elementosEnSecundariosAgrupados() → elementosEnSecundarios() grouped by same key as consultarListaMateriales
//     NOTE: source bug — PoCriterioGrupo is referenced but not declared; always behaves as _unset.
//   obtenListaMateriales() → delegates to elementosDeProyecto()

import { CBaseSelloFibra } from './CBaseSelloFibra'

// ─── Class ────────────────────────────────────────────────────────────────────

export class CListaMateriales extends CBaseSelloFibra {
  // No additional slots beyond CBaseSelloFibra.

  // Magik: configura_tabla — builds tbl_lista_materiales.
  // Row count comes from obtenListaMateriales(); defaults to 2 until Fase 5 is wired.
  override configurarTabla(): void {
    const [, ht] = this.obtenListaMateriales()
    const numFilas = 2 + ht.size

    const tabla = this._tablas.crearTabla(numFilas, 4, 'tbl_lista_materiales')
    tabla.coordenadaOrigen = this._coordInicio

    for (let n = 1; n <= numFilas; n++) {
      tabla.renglones.elemento(n).longitud = 6
    }

    tabla.columnas.elemento(1).longitud = 6
    tabla.columnas.elemento(2).longitud = 60
    tabla.columnas.elemento(3).longitud = 35
    tabla.columnas.elemento(4).longitud = 20

    this.ocultarBordesCeldas(tabla, {
      borderSup:    [[1, 1], [1, 2], [1, 3], [1, 4]],
      borderDerIzq: [[1, 1], [1, 2], [1, 3], [1, 4]],
    })
  }

  // Magik: etiqueta_celdas
  override etiquetarCeldas(): void {
    const t = 'tbl_lista_materiales'
    this.asignarTextoCelda(t, 1, 2, 'LISTA DE MATERIALES', 30, undefined)
    this.asignarTextoCelda(t, 2, 1, 'No',          20, undefined)
    this.asignarTextoCelda(t, 2, 2, 'DESCRIPCION', 20, undefined)
    this.asignarTextoCelda(t, 2, 3, 'UNIDAD',      20, undefined)
    this.asignarTextoCelda(t, 2, 4, 'CANTIDAD',    20, undefined)
  }

  // Magik: llena_datos_celdas — Fase 5 (see file header for full dispatch logic)
  override llenarDatosCeldas(): void { /* Fase 5 */ }

  // ── GIS data methods (Fase 5) ──────────────────────────────────────────────

  // Magik: consultar_Lista_materiales(PoType, PoCriterioGrupo)
  // Groups PROYECTADO GIS objects from gen_planos.obtener_registros_de(PoType)
  // into a Map keyed by "source_collection.name|spec_id_or_campo".
  // Special case: figure_eight key includes sheath spec (clase + fiber_quantity + "metros").
  consultarListaMateriales(
    _poType: string,
    _poCriterioGrupo: string | undefined,
  ): Map<string, unknown[]> {
    return new Map() /* Fase 5 */
  }

  // Magik: elementos_de_enlace — c_ctrl_seleccionador_objs_red_fo_tba / c_ctrl_seleccionador_objs_red_fo
  elementosDeEnlace(): unknown[] { return [] /* Fase 5 */ }

  // Magik: elementos_de_proyecto — branches on active_design.tipo_diseno.
  // Returns tuple: [flat element list, grouped Map<key, GisObject[]>].
  elementosDeProyecto(): [unknown[], Map<string, unknown[]>] {
    return [[], new Map()] /* Fase 5 */
  }

  // Magik: elementos_en_principales — c_ctrl_seleccionador_objs_red_fo.Elementos_red_fo
  elementosEnPrincipales(): unknown[] { return [] /* Fase 5 */ }

  // Magik: elementos_en_principales_falc — OEI → segment → structure_point → related_items
  // or CEDO → splitter → port → c_path_connectivity traversal.
  elementosEnPrincipalesFalc(): unknown[] { return [] /* Fase 5 */ }

  // Magik: elementos_en_secundarios — CEDO → splitter → port → c_path_connectivity
  // build_tree_network_base + build_tree_structure_network_base traversal.
  elementosEnSecundarios(): unknown[] { return [] /* Fase 5 */ }

  // Magik: elementos_en_secundarios_agrupados — elementosEnSecundarios() grouped by key.
  // Source bug: PoCriterioGrupo is referenced but undeclared → always behaves as undefined.
  elementosEnSecundariosAgrupados(): Map<string, unknown[]> {
    return new Map() /* Fase 5 */
  }

  // Magik: elementos_en_secundarios_falc — same connectivity pattern as elementosEnSecundarios
  // but guarded by LoOei existence and LoOei.user!_oe_locals.size > 0.
  elementosEnSecundariosFalc(): unknown[] { return [] /* Fase 5 */ }

  // Magik: obten_lista_materiales — delegates to elementosDeProyecto()
  obtenListaMateriales(): [unknown[], Map<string, unknown[]>] {
    return this.elementosDeProyecto()
  }
}
