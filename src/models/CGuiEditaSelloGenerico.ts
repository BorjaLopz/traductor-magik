// Source: planos_fo/source/ruta_cables/sellos/c_gui_edita_sello_generico.magik
// Dialog model for editing the free-text content of any sello that exposes a
// text cell (c_notas_constructor, c_sello_generico, or any other with :tbl_resumen).
// Extends :model (Smallworld MVC) → pure state class; React drives the view in Fase 4.
//
// Interaction flow:
//   1. new(sello) → builds UI frame + text_window (33×110) + 2 buttons.
//   2. abrirVentana() → sets title/size, activates frame, loads sello text into widget.
//   3. User edits text in the text_window.
//   4. escribirTextoAlSello() → uppercases widget text, writes to sello slot,
//      triggers layout refresh, closes dialog.
//   5. salir() / "Cancelar" button → closes dialog without saving.
//
// Fase 4 — init() UI structure:
//   frame "Text window"  (title="Personalizacion del Sello", width=550, height=500)
//   └── panel
//       ├── text_window (33 rows × 110 chars, editable=true)
//       ├── start_row × 2
//       ├── button "Escribe Texto al Sello"  → escribirTextoAlSello()
//       ├── button "Cancelar"               → salir()
//       └── start_row × 2
//
// Sello text cell paths (escribe_texto_sello_a_ventana dispatch):
//   c_notas_constructor → o_tablas.elemento(:tbl_notas_const).oCeldas.Celda(2,1).oElemento.sTexto
//   c_sello_generico    → oTablas .elemento(:tbl_sello_generico).oCeldas.Celda(2,1).oElemento.sTexto
//   else                → o_Tablas.elemento(:tbl_resumen).oCeldas.Celda(2,1).oElemento.sTexto
// (The three different accessor spellings are a bug in the source; normalised through SelloEditable.)

// ─── Sello abstraction ───────────────────────────────────────────────────────

// Any sello the dialog can edit must implement this interface.
// selloKind maps to the class_name check done in escribe_texto_sello_a_ventana.
export interface SelloEditable {
  readonly selloKind: 'c_notas_constructor' | 'c_sello_generico' | string
  // Fase 5: reads cell(2,1).oElemento.sTexto via the appropriate table accessor
  getContenidoSello(): string
  // Fase 5: sys!slot(:contenido_sello) = text  (caller passes already-uppercased text)
  setContenidoSello(text: string): void
}

// ─── Dialog dimensions (from abre_ventana + init) ────────────────────────────

export const DIALOG_WIDTH  = 550
export const DIALOG_HEIGHT = 500
export const DIALOG_TITLE  = 'Personalizacion del Sello'

export const TEXT_WINDOW_ROWS = 33
export const TEXT_WINDOW_COLS = 110

// ─── Model class ─────────────────────────────────────────────────────────────

export class CGuiEditaSelloGenerico {
  // Layout infrastructure slots (Fase 5 — Smallworld layout plugin chain)
  // All made :writable, :public via define_slot_access in source.
  loLayoutDesigner:  unknown = undefined
  loLayoutManager:   unknown = undefined
  loDocumentManager: unknown = undefined
  loCurrentDoc:      unknown = undefined
  loCurrentPage1:    unknown = undefined
  oAplicacion:       unknown = undefined

  // UI widget slots (Fase 4 — Smallworld widget references)
  oVentana:     unknown = undefined   // text_window (33 rows × 110 chars)
  oMarco:       unknown = undefined   // frame
  oPanel:       unknown = undefined   // panel  (:writable, :public)
  oBotonEscribe: unknown = undefined  // (:writable, :public)
  oBotonSalir:   unknown = undefined  // (:writable, :public)

  // Self-reference slot — Magik sets .edita_sello_sec_trab_aux << _self
  // in both init() and abre_ventana() so external code can reach this model.
  editaSelloSecTrabAux: CGuiEditaSelloGenerico

  // The sello being edited — private (no define_slot_access in source)
  private _loSello: SelloEditable

  // Reactive state used by the React layer
  private _contenido: string  = ''
  private _isOpen:    boolean = false

  // Callbacks wired by the React layer
  private _onRefreshLayout?: () => void   // layout_manager.action(:layout_view_refresh)
  private _onDeactivate?:    () => void   // oMarco.deactivate()

  constructor(sello: SelloEditable) {
    this._loSello           = sello
    this.editaSelloSecTrabAux = this
    // Fase 4: frame.new("Text window") → panel → text_window(33,110) → buttons
    // Fase 5: pni_application → layout_plugin → layout_designer → layout_manager
  }

  // ── Callbacks (wired by React layer) ─────────────────────────────────────────

  onRefreshLayout(cb: () => void): void { this._onRefreshLayout = cb }
  onDeactivate(cb:    () => void): void { this._onDeactivate    = cb }

  // ── State accessors ──────────────────────────────────────────────────────────

  get contenido():  string  { return this._contenido }
  get isOpen():     boolean { return this._isOpen }

  setContenido(text: string): void { this._contenido = text }

  // ── Methods ──────────────────────────────────────────────────────────────────

  // Magik: abre_ventana — activates the frame (title, 550×500), loads sello text,
  // sets editaSelloSecTrabAux = self, returns self.
  abrirVentana(): this {
    this._isOpen = true
    // Fase 4: oMarco.title = DIALOG_TITLE; oMarco.width = 550; oMarco.height = 500; oMarco.activate()
    this.escribirTextoSelloAVentana()
    this.editaSelloSecTrabAux = this
    return this
  }

  // Magik: escribe_texto_sello_a_ventana — reads cell(2,1).sTexto from the sello's
  // table and populates oVentana.contents.
  // Guard: LoSello and oVentana must be non-null.
  // Dispatch by selloKind (see file header for the three table-path variants).
  escribirTextoSelloAVentana(): void {
    this._contenido = this._loSello.getContenidoSello()
    // Fase 4: oVentana.contents = this._contenido
  }

  // Magik: escribe_texto_al_sello — uppercases widget text, commits to sello slot,
  // triggers layout_view_refresh action, then deactivates the frame.
  escribirTextoAlSello(): void {
    const texto = this._contenido.toUpperCase()
    this._loSello.setContenidoSello(texto)
    // Fase 5: LoLayout_Manager.action(:layout_view_refresh).execute_action()
    this._onRefreshLayout?.()
    this.salir()
  }

  // Magik: salir — oMarco.deactivate()
  salir(): void {
    this._isOpen = false
    // Fase 4: oMarco.deactivate()
    this._onDeactivate?.()
  }

  // Magik: note_change(who, what) — Smallworld observer notification, returns {who, what}
  noteChange(who: unknown, what: unknown): [unknown, unknown] {
    return [who, what]
  }

  // Magik: obten_sello(Potipo_sello) — traverses layout designer's page elements
  // looking for an element whose class_name matches tipoSello (string comparison).
  // Path: layout_plugin → layout_designer → document_manager → current_document
  //       → pages[1] → elements → find(class_name === tipoSello)
  // Returns undefined if not found. Fase 5.
  obtenSello(_tipoSello: string): undefined {
    return undefined /* Fase 5 */
  }

  // Magik: show_edit_controls() — intentionally empty (_return with no value)
  showEditControls(): void { /* intentionally empty in source */ }
}
