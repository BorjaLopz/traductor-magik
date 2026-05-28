// Source: adiciones_layout/source/Sellos/c_gui_edita_sello_resumen_proyecto.magik
// Dialog model for editing the text content of a c_resumen_proyecto sello.
// Extends :model (Smallworld GUI MVC) → pure state class here; React drives the view.

export class CGuiEditaSelloResumenProyecto {
  private _isOpen       = false;
  private _contenido    = '';
  private _selloTexto   = '';   // last text committed to the sello

  private _onEscribirAlSello?: (texto: string) => void;

  // Magik: abre_ventana — activates window and loads current sello text
  abrirVentana(textoActual: string): void {
    this._contenido = textoActual;
    this._isOpen    = true;
  }

  // Magik: escribe_texto_sello_a_ventana — reads from sello cell into the text window
  escribirTextoSelloAVentana(textoDelSello: string): void {
    this._contenido = textoDelSello;
  }

  // Magik: escribe_texto_al_sello — uppercases window text and commits to sello
  escribirTextoAlSello(): void {
    const upper      = this._contenido.toUpperCase();
    this._contenido  = upper;
    this._selloTexto = upper;
    this._onEscribirAlSello?.(upper);
  }

  // Magik: salir — deactivates the frame
  salir(): void {
    this._isOpen = false;
  }

  // Magik: note_change — observer pattern; returns {who, what}
  noteChange(who: unknown, what: unknown): [unknown, unknown] {
    return [who, what];
  }

  // Magik: obten_sello — traverses Smallworld layout doc to find a sello element by class.
  // Depends on Smallworld layout infrastructure → stub for Fase 5.
  obtenSello(_tipoSello: string): undefined {
    return undefined;
  }

  setContenido(texto: string): void { this._contenido = texto; }

  onEscribirAlSello(cb: (texto: string) => void): void {
    this._onEscribirAlSello = cb;
  }

  get isOpen():     boolean { return this._isOpen; }
  get contenido():  string  { return this._contenido; }
  get selloTexto(): string  { return this._selloTexto; }
}
