// Source: planos_fo/source/montaje_tba/gui/c_arbol_tba.magik
// GUI model for selecting TBAs in the active design.
// Builds a checkable tree of projected TBAs (V1, V2, GUT types).
// Drives "Generar Plano Montaje TBA" and "Ir a TBA" actions.
// Extends :model. GUI rendering → Fase 4. GIS spatial queries → Fase 5.

export interface TbaRecord {
  'user!_identificador': string | undefined
  'user!_tipo': string | undefined
  'user!_fibras_opticas': string | undefined
  'user!_ubicacion': string
  spec_id: string
  construction_status: string
}

export interface TbaTreeNode {
  elemento: TbaRecord
  valor:    string   // display label built from TBA fields (Magik styled_string)
  check:    boolean
}

// Magik: comentario string built inside llena_arbol()
export function buildTbaLabel(tba: TbaRecord): string {
  return (
    'IDENTFICADOR: '       + (tba['user!_identificador']  ?? '') +
    '  |  TIPO: '          + (tba['user!_tipo']           ?? '') +
    '  |  ESPECIFICACION: '+ tba.spec_id +
    '  |  FIBRAS OPTICAS: '+ (tba['user!_fibras_opticas'] ?? '') +
    '  |  UBICACION: '     +  tba['user!_ubicacion']
  )
}

export class CArbolTba {
  list:     TbaTreeNode[] = []
  treeItem: unknown = undefined   // framework tree_item widget — Fase 4
  oTba:     unknown = undefined

  // Magik: activados() — filters checked nodes and returns their TBA records
  activados(): TbaRecord[] {
    return this.list.filter(n => n.check).map(n => n.elemento)
  }

  // Magik: activate_in(p_frame) — builds dialog (rowcol + tree_item + buttons). Fase 4.
  activateIn(_frame: unknown): void { /* Fase 4 */ }

  // Magik: buscar_detalles_edificio() — predicate.within(:location, scheme_area) on user!_building. Fase 5.
  buscarDetallesEdificio(): unknown[] { return [] /* Fase 5 */ }

  // Magik: buscar_tbas_en_edificio() — finds TBAs inside buildings via predicate.within. Fase 5.
  buscarTbasEnEdificio(): TbaRecord[] { return [] /* Fase 5 */ }

  // Magik: cancelar() → _self.quit()
  cancelar(): void { /* close dialog — Fase 4 */ }

  // Magik: genera_plano_montaje_tba() — validates exactly one TBA selected, then generates plan
  generaPlanoMontajeTba(): void {
    const sel = this.activados()
    if (sel.length === 0) throw new Error('No se ha seleccionado un TBA')
    if (sel.length > 1)   throw new Error('Debe Seleccionar solo un TBA')
    // c_engine_montaje_tba.new().settba + c_plano_montaje_tba.new(eng).genera_plano() — Fase 5
  }

  // Magik: ir_a_tba() — validates selection and navigates GIS map to TBA
  irATba(): void {
    const sel = this.activados()
    if (sel.length === 0) throw new Error('No se ha seleccionado un TBA')
    if (sel.length > 1)   throw new Error('Debe Seleccionar solo un TBA')
    // pni_application().manager.goto_primary_context(tba) — Fase 5
  }

  // Magik: llena_arbol() — builds TbaTreeNode list from given TBA records
  llenaArbol(tbas: TbaRecord[]): TbaTreeNode[] {
    this.list = tbas.map(tba => ({
      elemento: tba,
      valor:    buildTbaLabel(tba),
      check:    false,
    }))
    return this.list
  }

  // Magik: obtener_tbas_diseno() — complex spatial query:
  //   predicate.within(:user!_ubicacion, scheme_area) for GUT TBAs +
  //   predicate.within(:location/:inside_location, LoArea) for CDs/registros tablero.
  //   Only returns TBAs with construction_status = "PROYECTADO". Fase 5.
  obtenerTbasDiseno(): TbaRecord[] { return [] /* Fase 5 */ }

  // Magik: selected(p_selection) → tree_item.refresh(). Fase 4.
  selected(_selection: unknown): void { /* Fase 4 */ }
}
