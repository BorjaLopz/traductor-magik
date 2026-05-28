// Source: planos_fo/source/detalles_construccion/gui/c_gui_direccion_empalmes.magik
// Dialog model for assigning a travel direction (left/right/up/down) to each
// splice_closure, sheath, or mit_slot on a link before generating a construction detail plan.
// Extends :model (Smallworld MVC) → pure state class; React drives the view in Fase 4.
//
// Interaction flow:
//   1. Caller sets oObjetos ({ objeto, direccion }[]) + oEngine + oPagina.
//   2. toggleList() builds DisplayRow[] from oObjetos for the 7-column tree widget.
//   3. User selects one direction per row via radio toggles (or fixed :value for mit_slot).
//   4. setDireccionRow() keeps model in sync as the user changes radio selections.
//   5. aceptar(): rebuilds rSeleccion from lista, writes directions back into
//      oEngine.getengine() by object identity (===), triggers refresh + quit().
//
// Fase 4 — activate_in(frame) UI structure:
//   rowcol (row_resize_values={100,0}, resizable x+y)
//   └── tree_item  aspect=:toggle_list  width=400  mode=:none  grid_lines?=true
//       headings:   Izquierda | Derecha | Arriba | Abajo | Número | Tipo | Edo. Construccion
//       alignments: centre    | centre  | centre | centre| right  | right| right
//       styled_string per row:
//         cols 1-2: :radio_toggle (or :value for mit_slot — non-interactive direction)
//         cols 3-4: :radio_toggle
//         cols 5-6: :value
//         col  7:   edoStyle :value  (green=EXISTENTE, red_fancy=PROYECTADO, black=other)
//       :red_fancy style → { color: red, bold: false, font: 'fancy' size 12 }
//   └── button_box (right-aligned, top_spacing=2)
//       ├── "Aceptar" → aceptar()
//       └── "Cerrar"  → quit()

// ─── Direction ────────────────────────────────────────────────────────────────

// Magik source uses :rigth (typo for :right) — corrected to 'right' here
export type Direction = 'right' | 'left' | 'up' | 'down'

// ─── GIS object stub (Fase 5) ────────────────────────────────────────────────

export type GisKind = 'sheath' | 'splice_closure' | 'mit_slot'

export interface GisObject {
  readonly __gisKind: GisKind
  // sheath fields
  readonly specId?:              string
  readonly userNumeroCable?:     string | number
  // splice_closure fields
  readonly userTipoEmp?:         string
  readonly userNumEmpalme?:      string | number
  // mit_slot fields
  readonly description?:         string
  readonly userLadoEnBastidor?:  string | number
  // common
  readonly constructionStatus:   string
}

// ─── Data structures ─────────────────────────────────────────────────────────

// One item in oObjetos and in oEngine.getengine()
export interface EnlaceItem {
  objeto:    GisObject
  direccion: Direction
}

// 8-element row vector (0-indexed) produced by asSimpleVector.
// Mirrors Magik 1-indexed simple_vector used by the tree_item aspect.
//   [0]=isLeft  [1]=isRight  [2]=isUp  [3]=isDown
//   [4]=num     [5]=tipo     [6]=edo   [7]=objeto
export type RowVector = [
  boolean,         // [0] Izquierda   ← Magik value[1]
  boolean,         // [1] Derecha     ← Magik value[2]
  boolean,         // [2] Arriba      ← Magik value[3]
  boolean,         // [3] Abajo       ← Magik value[4]
  string | number, // [4] Número      ← Magik value[5]
  string,          // [5] Tipo        ← Magik value[6]
  string,          // [6] Edo.Const.  ← Magik value[7]
  GisObject,       // [7] objeto      ← Magik value[8]
]

// Construction-status colour token (maps to Magik styled_string colour symbols)
export type EdoStyle = 'green' | 'red_fancy' | 'black'

// A row ready for the tree widget — wraps item + computed vector
export interface DisplayRow {
  item:      EnlaceItem  // original pl passed to display_tree.new()
  values:    RowVector   // mutable; setDireccionRow() updates [0..3] on user interaction
  isMitSlot: boolean     // true → cols 1-2 use :value (non-interactive), not :radio_toggle
  edoStyle:  EdoStyle    // colour token for column 7
}

// Result of creaPropertyList — one confirmed direction assignment
export interface SelectionItem {
  direccion: Direction
  objeto:    GisObject
}

// Engine — oEngine.getengine() returns a mutable list that aceptar() writes back into
export interface DireccionEngine {
  getengine(): EnlaceItem[]
}

// ─── Column metadata (from activate_in) ──────────────────────────────────────

export const COLUMN_HEADINGS = [
  'Izquierda', 'Derecha', 'Arriba', 'Abajo', 'Número', 'Tipo', 'Edo. Construccion',
] as const

export const COLUMN_ALIGNMENTS = [
  'centre', 'centre', 'centre', 'centre', 'right', 'right', 'right',
] as const

// ─── Pure helpers ─────────────────────────────────────────────────────────────

// Magik: as_simple_vector(poDir, poObj)
// Derives num + tipo from GIS kind, encodes direction as booleans in positions 0-3.
export function asSimpleVector(dir: Direction, obj: GisObject): RowVector {
  let num:  string | number = ''
  let tipo: string          = ''

  switch (obj.__gisKind) {
    case 'sheath':
      tipo = obj.specId          ?? ''
      num  = obj.userNumeroCable ?? ''
      break
    case 'splice_closure':
      tipo = obj.userTipoEmp     ?? ''
      num  = obj.userNumEmpalme  ?? ''
      break
    case 'mit_slot':
      tipo = obj.description         ?? ''
      num  = obj.userLadoEnBastidor  ?? ''
      break
  }

  return [
    dir === 'left',
    dir === 'right',
    dir === 'up',
    dir === 'down',
    num,
    tipo,
    obj.constructionStatus,
    obj,
  ]
}

// Magik: crea_property_list(poDir, poObj) → { direccion, objeto }
export function creaPropertyList(dir: Direction, obj: GisObject): SelectionItem {
  return { direccion: dir, objeto: obj }
}

function resolveEdoStyle(status: string): EdoStyle {
  if (status === 'EXISTENTE')  return 'green'
  if (status === 'PROYECTADO') return 'red_fancy'
  return 'black'
}

// ─── Model class ─────────────────────────────────────────────────────────────

export class CGuiDireccionEmpalmes {
  // Public slots (:writable, :public in Magik)
  oObjetos:   EnlaceItem[]               = []
  lista:      DisplayRow[]               = []
  rSeleccion: SelectionItem[]            = []
  oEngine:    DireccionEngine | undefined = undefined
  oPagina:    unknown                     = undefined

  // Callbacks wired by the React layer (replaces Smallworld frame + quit)
  private _onQuit?:    () => void
  private _onRefresh?: () => void

  // ── Accessor methods ────────────────────────────────────────────────────────

  get listaEmpalmes(): EnlaceItem[]           { return this.oObjetos }
  set listaEmpalmes(v: EnlaceItem[])          { this.oObjetos = v }

  get engine(): DireccionEngine | undefined   { return this.oEngine }
  set engine(v: DireccionEngine | undefined)  { this.oEngine = v }

  get pagina(): unknown   { return this.oPagina }
  set pagina(v: unknown)  { this.oPagina = v }

  // Magik: GetEmpalmesActualizado() — returns rSeleccion after aceptar()
  getEmpalmesActualizado(): SelectionItem[] { return this.rSeleccion }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  // Magik: titulo() — dialog window title (encoding fixed: "direcci?n" → "dirección")
  titulo(): string { return 'Selecciona dirección de empalmes' }

  onQuit(cb: () => void):    void { this._onQuit    = cb }
  onRefresh(cb: () => void): void { this._onRefresh = cb }

  // Magik: refrescar() — calls tree_item.refresh() if mounted
  refrescar(): void { this._onRefresh?.() }

  // Magik: _self.quit() — closes the dialog frame
  quit(): void { this._onQuit?.() }

  // ── Data preparation ─────────────────────────────────────────────────────────

  // Magik: toggle_list (tree_item aspect) — builds DisplayRow[] from oObjetos.
  // Filters to splice_closure | sheath | mit_slot only.
  // Sets this.lista and returns the rows (both consumed by the tree widget).
  toggleList(): DisplayRow[] {
    const rows: DisplayRow[] = []

    for (const pl of this.oObjetos) {
      const { objeto, direccion } = pl
      const kind = objeto.__gisKind

      if (kind !== 'sheath' && kind !== 'splice_closure' && kind !== 'mit_slot') continue

      rows.push({
        item:      pl,
        values:    asSimpleVector(direccion, objeto),
        isMitSlot: kind === 'mit_slot',
        edoStyle:  resolveEdoStyle(objeto.constructionStatus),
      })
    }

    this.lista = rows
    return rows
  }

  // Updates the direction boolean flags on a single row — call this from the React layer
  // when the user clicks a radio toggle (mirrors Magik tree_item in-place mutation of value[]).
  setDireccionRow(rowIndex: number, dir: Direction): void {
    const row = this.lista[rowIndex]
    if (!row) return
    row.values[0] = dir === 'left'
    row.values[1] = dir === 'right'
    row.values[2] = dir === 'up'
    row.values[3] = dir === 'down'
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  // Magik: Aceptar()
  // 1. Clear rSeleccion.
  // 2. For each row in lista: read values[0..3] to determine selected direction;
  //    build SelectionItem from values[7] (objeto).
  // 3. For each selItem: find matching item in oEngine.getengine() by object
  //    identity (===) and update its direccion.
  // 4. Trigger layout refresh (Fase 5: pagina.framework → layout_manager →
  //    current_layout_view.action(:refresh).execute_action()).
  // 5. quit().
  aceptar(): void {
    this.rSeleccion = []

    for (const row of this.lista) {
      const v = row.values
      let dir: Direction | undefined

      if      (v[0]) dir = 'left'
      else if (v[1]) dir = 'right'
      else if (v[2]) dir = 'up'
      else if (v[3]) dir = 'down'

      if (dir !== undefined) {
        this.rSeleccion.push(creaPropertyList(dir, v[7]))
      }
    }

    if (this.oEngine) {
      const engineItems = this.oEngine.getengine()
      for (const sel of this.rSeleccion) {
        const match = engineItems.find(e => e.objeto === sel.objeto)
        if (match) match.direccion = sel.direccion
      }
    }

    // Fase 5: pagina.framework.component(:layout_manager)
    //           .current_layout_view.action(:refresh).execute_action()
    this.refrescar()
    this.quit()
  }
}
