// Source: planos_fo/source/ruta_cables/sellos/c_notas_constructor.magik
// Free-text sello that shows "NOTAS AL CONSTRUCTOR" on cable-route plans.
// Extends textbox_layout (Smallworld system class — no TypeScript base available).
// Implements SelloEditable so CGuiEditaSelloGenerico can read/write cell(2,1).
//
// Table layout (tbl_notas_const):
//   2 rows × 1 column
//   Row heights (mm): row1=9 (title), row2=50 (text — resizable at runtime)
//   Col width  (mm): col1=180
//
// Text content priority resolved by prvAsignaTexto() (called from etiquetarCeldas +
// drawContentOn):
//   1. GUI text_window.contents (Fase 4) — CGuiEditaSelloGenerico.oVentana, if set
//   2. textoSello attribute (XML round-trip persistence), if non-null
//   3. contenidoSello slot — uppercased + written to cell; also auto-sizes row2:
//        row2.longitud = (newline_count + 1) * 6 mm
//   4. largo attribute (> 0) → override row2 height
//      ancho attribute (> 0) → override col1 width
//
// Layout attributes (Magik define_attributes; plain fields here):
//   "Editar Sello..."  enum_method → abreInterfazGUI()   (Fase 4 UI trigger)
//   textoSello: string                                    (XML persistence)
//   largo: integer                                        (height override)
//   ancho: integer                                        (width override)
//
// abreInterfazGUI() → opens CGuiEditaSelloGenerico dialog.
//   On confirm, CGuiEditaSelloGenerico.escribirTextoAlSello() calls
//   this.setContenidoSello(uppercasedText), which sets contenidoSello.
//   Next drawContentOn() → prvAsignaTexto() picks it up via step 3.
//
// drawContentOn() — Fase 5: sets cell colours + bounds from o_tablas.area_total()
//   + o_tablas.Despliega(window, foreground_line_colour).
// definedAttributes() — Fase 5: GIS layout attribute introspection.
// inicializar() — Fase 0: this._tablas = new CTablas(this); bounds = area_total().

import type { ITablas } from './CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'
import { CGuiEditaSelloGenerico, type SelloEditable } from './CGuiEditaSelloGenerico'

// ─── Class ────────────────────────────────────────────────────────────────────

export class CNotasConstructor implements SelloEditable {
  // SelloEditable discriminator
  readonly selloKind = 'c_notas_constructor' as const

  // define_shared_constant
  static readonly ALLOWED_ON_MENU = false

  // Public writable slots (define_slot_access :writable, :public)
  bTablasCreadas: boolean = false
  oWindow:        unknown = undefined

  // Internal slots
  protected _tablas!:       ITablas               // Fase 0: new CTablas(this)
  protected _coordInicio:   [number, number] = [0, 0]
  varObjeto:                unknown = undefined
  contenidoSello:           string | undefined = undefined
  private _guiEditaSello:   CGuiEditaSelloGenerico | undefined = undefined

  // Layout attributes (persisted in XML; replace Magik define_attributes mechanism)
  textoSello: string | undefined = undefined
  largo:      number = 0
  ancho:      number = 0

  // ── SelloEditable ──────────────────────────────────────────────────────────

  // Magik: o_tablas.elemento(:tbl_notas_const).oCeldas.Celda(2,1).oElemento.sTexto
  getContenidoSello(): string {
    if (!this._tablas) return ''
    const celda = this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1)
    return (celda.elemento as CTextoGrafico | undefined)?.texto ?? ''
  }

  // Magik: sys!slot(:contenido_sello) = text  (caller already uppercased)
  setContenidoSello(text: string): void {
    this.contenidoSello = text
    if (!this._tablas) return
    const celda = this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1)
    if (celda.elemento) (celda.elemento as CTextoGrafico).texto = text
  }

  // ── Initialisation ─────────────────────────────────────────────────────────

  // Magik: inicializa(_optional RoCoord)
  inicializar(_coord?: [number, number]): void {
    this._coordInicio = [0, 0]
    // Fase 0: this._tablas = new CTablas(this)
    this.configurarTabla()
    // Fase 5: this.bounds = this._tablas.areaTotal()
    this.etiquetarCeldas()
    this.bTablasCreadas = true
  }

  // Magik: post_initialisation — called by layout framework after construction
  postInitialisation(): void {
    this.inicializar()
  }

  // ── Table layout ───────────────────────────────────────────────────────────

  // Magik: configura_tabla
  configurarTabla(): void {
    const tabla = this._tablas.crearTabla(2, 1, 'tbl_notas_const')
    tabla.coordenadaOrigen = this._coordInicio
    tabla.renglones.elemento(1).longitud = 9
    tabla.renglones.elemento(2).longitud = 50
    tabla.columnas.elemento(1).longitud  = 180
  }

  // Magik: etiqueta_celdas — sets default title + note text, then calls prvAsignaTexto()
  etiquetarCeldas(): void {
    const loTitulo = new CTextoGrafico('')
    loTitulo.texto = 'NOTAS AL CONSTRUCTOR'

    const msg =
      ' 1. EL CONSTRUCTOR DEBE RESPETAR LA VIA ASIGNADA PARA EL JALADO DE CABLES.\n' +
      ' 2. CUALQUIER ACLARACION O MODIFICACION (EN MEDIDAS, CAMBIOS DE CAPACIDADES, ETC.) A ESTE\n' +
      '    PROYECTO SE DEBE PEDIR LA AUTORIZACION DE INGENIERIA DE PROYECTOS.'

    const loTexto = new CTextoGrafico('')
    loTexto.tamanio    = 35
    loTexto.alineacion = 'top_left'
    loTexto.texto      = msg

    this._tablas.elemento('tbl_notas_const').celdas.celda(1, 1).elemento = loTitulo
    this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1).elemento = loTexto

    this.prvAsignaTexto()
  }

  // Magik: draw_content_on(window) — colour + bounds + render are Fase 5
  drawContentOn(_window: unknown): void {
    this.prvAsignaTexto()
    // Fase 5: this.bounds = this._tablas.areaTotal()
    // Fase 5: (cell(1,1).elemento as CTextoGrafico).color = this.colour
    // Fase 5: (cell(2,1).elemento as CTextoGrafico).color = this.colour
    // Fase 5: this._tablas.desplegar(window, this.getForegroundLineColour())
  }

  // ── Text content management ────────────────────────────────────────────────

  // Magik: prvAsignaTexto — resolves editable text with 4-priority cascade.
  prvAsignaTexto(): void {
    if (!this._tablas) return

    // Priority 1 — GUI text_window (Fase 4):
    //   this._guiEditaSello = new CGuiEditaSelloGenerico(this)
    //   if oVentana is set and has contents → uppercase + write to cell + textoSello

    // Priority 2 — XML attribute (textoSello restored from serialised layout)
    if (this.textoSello !== undefined) {
      const celda = this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1)
      if (celda.elemento) (celda.elemento as CTextoGrafico).texto = this.textoSello
    }

    // Priority 3 — contenidoSello slot (set by setContenidoSello / abreInterfazGUI flow)
    if (this.contenidoSello !== undefined && this.contenidoSello.length > 0) {
      const texto = this.contenidoSello.toUpperCase()
      const celda = this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1)
      if (celda.elemento) (celda.elemento as CTextoGrafico).texto = texto
      this.textoSello = texto

      // Auto-resize row 2: (newline_count + 1) * 6 mm
      const numLineas = (texto.match(/\n/g)?.length ?? 0) + 1
      this._tablas.elemento('tbl_notas_const').renglones.elemento(2).longitud = numLineas * 6
    }

    // Priority 4 — explicit attribute overrides
    if (this.largo > 0) {
      this._tablas.elemento('tbl_notas_const').renglones.elemento(2).longitud = this.largo
    }
    if (this.ancho > 0) {
      this._tablas.elemento('tbl_notas_const').columnas.elemento(1).longitud = this.ancho
    }
  }

  // Magik: abre_interfaz_GUI — opens the text editing dialog.
  // On confirm, CGuiEditaSelloGenerico calls setContenidoSello() back on this instance.
  abreInterfazGUI(): void {
    this._guiEditaSello = new CGuiEditaSelloGenerico(this)
    this._guiEditaSello.abrirVentana()
    // Fase 4: wire _guiEditaSello.onDeactivate(() => this.drawContentOn(this.oWindow))
  }

  // Magik: defined_attributes — GIS layout attribute introspection. Fase 5.
  definedAttributes(): unknown[] { return [] /* Fase 5 */ }
}
