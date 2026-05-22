/**
 * Migración: c_gui_edita_sello_resumen_proyecto.magik
 * Sigmtao Software s.a. de c.v.
 * Clase Magik: c_gui_edita_sello_resumen_proyecto — extends :model
 *
 * Diálogo GUI para editar el contenido textual del "Sello Resumen del Proyecto"
 * en el motor de planos Smallworld. Permite al usuario modificar el texto del
 * sello directamente desde una ventana de edición y escribirlo de vuelta al plano.
 *
 * Métodos migrados:
 *   new()                           → constructor()
 *   init()                          → init()  [llamado desde constructor]
 *   abre_ventana()                  → abreVentana()
 *   escribe_texto_sello_a_ventana() → escribeTextoSelloAVentana()
 *   escribe_texto_al_sello()        → escribeTextoAlSello()
 *   obten_sello(Potipo_sello)       → obtenSello(tipoSello)
 *   show_edit_controls()            → showEditControls()  [stub]
 *   note_change(who, what)          → noteChange(who, what)
 *   salir()                         → salir()
 *
 * Equivalencias clave:
 *   frame.new("Text window")        → dialogConfig { title, width, height, open }
 *   panel.new(oMarco)               → <div> contenedor del modal
 *   text_window.new(panel, 33, 110, ..., :editable?, _true) → <textarea rows=33>
 *   button_item.new(panel, "...", _self, :method) → <button onClick={handler}>
 *   .oVentana.contents << value     → setTextoVentana(value)
 *   .oVentana.contents              → textoVentana (estado React)
 *   .oMarco.activate()              → setDialogOpen(true)
 *   .oMarco.deactivate()            → setDialogOpen(false)
 *   .LoSello.contenido_sello << .oVentana.contents.uppercase → sello.contenidoSello = text.toUpperCase()
 *   .LoLayout_Manager.action(:layout_view_refresh).execute_action() → triggerRefresh()
 *   define_shared_variable(:edita_sello_resumen_proy_aux) → static editaSelloResumenProyAux
 *   _for elemento _over .LoCurrentPage1.elements() → MOCK_PAGE.find(el => el.className === tipo)
 *   .oTablas.elemento(:tbl_resumen_proyecto).oCeldas.Celda(2,1).oElemento.sTexto
 *     → sello.tablas.get('tbl_resumen_proyecto')?.celdas.get('2-1')?.sTexto
 */

import React, { useState, useCallback, useRef } from 'react';

// =============================================================================
// TIPOS — modelo del sello y del layout
// =============================================================================

/** Celda individual del sello — Magik: oCeldas.Celda(f,c).oElemento */
export interface CeldaSello {
  fila  : number;
  col   : number;
  sTexto: string;   // .oElemento.sTexto
}

/** Tabla del sello — Magik: oTablas.elemento(:id) */
export interface TablaSello {
  id    : string;
  celdas: Map<string, CeldaSello>;  // key = "fila-col"
}

/** Sello Resumen del Proyecto — elemento del layout de tipo c_resumen_proyecto */
export interface SelloResumenProyecto {
  tipo           : string;             // .class_name → 'c_resumen_proyecto'
  tablas         : Map<string, TablaSello>;
  contenidoSello : string;             // .contenido_sello (texto editable)
}

/** Elemento genérico de una página de layout */
export interface LayoutElement {
  className: string;                   // Magik: elemento.class_name.write_string
  sello    ?: SelloResumenProyecto;    // sólo los elementos de tipo sello lo tienen
}

/** Configuración del marco/frame — Magik: frame.new() + title/width/height */
export interface FrameConfig {
  title : string;
  width : number;   // Magik: .oMarco.width  << 550
  height: number;   // Magik: .oMarco.height << 500
  open  : boolean;  // Magik: .oMarco.activate() / deactivate()
}

/** Entrada en el log de note_change */
export interface ChangeLogEntry {
  who  : string;
  what : unknown;
  ts   : string;
}

// =============================================================================
// MOCK DE LA PÁGINA DEL LAYOUT
// Equivale a: .LoCurrentPage1.sys!slot(:elements)
// La página contiene varios elementos; uno de ellos es c_resumen_proyecto.
// =============================================================================

function crearMockPage(): LayoutElement[] {
  return [
    { className: 'c_titulo_de_plano' },
    { className: 'c_marco_estandar' },
    {
      className: 'c_resumen_proyecto',
      sello: {
        tipo          : 'c_resumen_proyecto',
        contenidoSello: 'PROYECTO RED DE FIBRA ÓPTICA\nCDMX NORTE\nFASE 1 - 2024',
        tablas: new Map([
          ['tbl_resumen_proyecto', {
            id    : 'tbl_resumen_proyecto',
            celdas: new Map([
              // Magik: oCeldas.Celda(2,1).oElemento.sTexto
              ['2-1', { fila: 2, col: 1, sTexto: 'PROYECTO RED DE FIBRA ÓPTICA\nCDMX NORTE\nFASE 1 - 2024' }],
            ]),
          }],
        ]),
      },
    },
    { className: 'c_viewport_principal' },
    { className: 'c_sello_estandar_ctl' },
  ];
}

// =============================================================================
// CLASE PRINCIPAL — c_gui_edita_sello_resumen_proyecto  extends :model
// =============================================================================

export class CGuiEditaSelloResumenProyecto {

  // Magik: {:oMarco, _unset} — configuración del frame/ventana
  private oMarco: FrameConfig = { title: 'Text window', width: 550, height: 500, open: false };

  // Magik: {:oVentana, _unset} — contenido del text_window
  private oVentana: string = '';

  // Magik: {:LoSello, _unset} — referencia al sello actualmente editado
  loSello: SelloResumenProyecto | null = null;

  // Magik: {:LoCurrentPage1, _unset} — página actual del documento
  private loCurrentPage1: LayoutElement[];

  // Magik: define_shared_variable(:edita_sello_resumen_proy_aux, _unset, :public)
  // Variable de clase compartida — patrón singleton para la instancia activa
  static editaSelloResumenProyAux: CGuiEditaSelloResumenProyecto | null = null;

  // Log de cambios para note_change()
  readonly changeLog: ChangeLogEntry[] = [];

  // Callback para notificar a la UI que el estado cambió (no existe en Magik)
  private onStateChange?: () => void;

  // ---------------------------------------------------------------------------
  // new() → constructor() + init()
  // Magik: _return _clone.init()
  // ---------------------------------------------------------------------------
  constructor(onStateChange?: () => void) {
    this.loCurrentPage1 = crearMockPage();
    this.onStateChange  = onStateChange;
    this.init();
  }

  // ---------------------------------------------------------------------------
  // init()
  // Magik:
  //   .oMarco << frame.new("Text window")
  //   .oPanel << panel.new(.oMarco)
  //   .oVentana << text_window.new(.oPanel, 33, 110, agent, :editable?, _true)
  //   .oBoton_escribe << button_item.new(...)
  //   .oBoton_salir << button_item.new(...)
  //   .oAplicacion << smallworld_product.pni_application()
  //   .LoLayout_Designer << .oAplicacion.plugin(:layout_plugin).layout_designer
  //   .LoLayout_Manager << .LoLayout_Designer.plugin(:layout_manager)
  //   _self.edita_sello_resumen_proy_aux << _self
  // Los widgets GUI se convierten en estado React; los plugins se simulan con mocks.
  // ---------------------------------------------------------------------------
  init(): this {
    this.oMarco   = { title: 'Text window', width: 550, height: 500, open: false };
    this.oVentana = '';
    // Magik: _self.edita_sello_resumen_proy_aux << _self
    CGuiEditaSelloResumenProyecto.editaSelloResumenProyAux = this;
    return this;
  }

  // ---------------------------------------------------------------------------
  // abre_ventana()
  // Magik:
  //   .oMarco.title  << "Personalizacion del Sello"
  //   .oMarco.width  << 550
  //   .oMarco.height << 500
  //   .oMarco.activate()
  //   _self.escribe_texto_sello_a_ventana()
  //   _self.edita_sello_resumen_proy_aux << _self
  // ---------------------------------------------------------------------------
  abreVentana(): void {
    if (!this.oMarco) return;
    this.oMarco = { title: 'Personalización del Sello', width: 550, height: 500, open: true };
    this.escribeTextoSelloAVentana();
    // Magik: _self.edita_sello_resumen_proy_aux << _self
    CGuiEditaSelloResumenProyecto.editaSelloResumenProyAux = this;
    this.onStateChange?.();
  }

  // ---------------------------------------------------------------------------
  // escribe_texto_sello_a_ventana()
  // Magik:
  //   _if .LoSello _isnt _unset _andif .oVentana _isnt _unset
  //     .oVentana.contents << .LoSello.oTablas.elemento(:tbl_resumen_proyecto)
  //                            .oCeldas.Celda(2,1).oElemento.sTexto
  // Lee el texto de la celda (2,1) de tbl_resumen_proyecto y lo carga en el editor.
  // ---------------------------------------------------------------------------
  escribeTextoSelloAVentana(): void {
    if (!this.loSello) return;
    // Magik: .oTablas.elemento(:tbl_resumen_proyecto).oCeldas.Celda(2,1).oElemento.sTexto
    const tabla = this.loSello.tablas.get('tbl_resumen_proyecto');
    const celda = tabla?.celdas.get('2-1');
    if (celda) {
      // Magik: .oVentana.contents << sTexto
      this.oVentana = celda.sTexto;
      this.onStateChange?.();
    }
  }

  // ---------------------------------------------------------------------------
  // escribe_texto_al_sello()
  // Magik:
  //   LoTexto << .oVentana.contents
  //   .LoSello.contenido_sello << .oVentana.contents.uppercase
  //   .LoLayout_Manager.action(:layout_view_refresh).execute_action()
  // Escribe el texto del editor (en MAYÚSCULAS) de vuelta al sello y refresca la vista.
  // ---------------------------------------------------------------------------
  escribeTextoAlSello(): void {
    if (!this.loSello) return;
    const textoMayusculas = this.oVentana.toUpperCase();

    // Magik: .LoSello.contenido_sello << .oVentana.contents.uppercase
    this.loSello.contenidoSello = textoMayusculas;

    // Actualiza también la celda de la tabla para mantener coherencia
    const tabla = this.loSello.tablas.get('tbl_resumen_proyecto');
    const celda = tabla?.celdas.get('2-1');
    if (celda) celda.sTexto = textoMayusculas;

    // Magik: .LoLayout_Manager.action(:layout_view_refresh).execute_action()
    this.noteChange('layout_manager', 'layout_view_refresh');
    this.onStateChange?.();
  }

  // ---------------------------------------------------------------------------
  // obten_sello(Potipo_sello)
  // Magik:
  //   .LoLayout_Designer << pni_application().plugin(:layout_plugin).start_layout_designer()
  //   .LoDocumentManager << .LoLayout_Designer.sys!slot(:components)[:document_manager]
  //   .LoCurrentDoc << .LoDocumentManager.current_document.sys!slot(:document)
  //   .LoCurrentPage1 << .LoCurrentDoc.sys!slot(:pages)[1]
  //   _for elemento _over .LoCurrentPage1.sys!slot(:elements).fast_elements()
  //     _if elemento.class_name.write_string = Potipo_sello.write_string
  //       _return elemento
  // Itera los elementos de la página y devuelve el primero cuya clase coincida.
  // ---------------------------------------------------------------------------
  obtenSello(tipoSello: string): SelloResumenProyecto | null {
    // Magik: _for elemento _over page.elements() — busca por class_name
    const elemento = this.loCurrentPage1.find(
      el => el.className === tipoSello,
    );
    return elemento?.sello ?? null;
  }

  // ---------------------------------------------------------------------------
  // salir()
  // Magik: _self.oMarco.deactivate()
  // ---------------------------------------------------------------------------
  salir(): void {
    this.oMarco = { ...this.oMarco, open: false };
    this.onStateChange?.();
  }

  // ---------------------------------------------------------------------------
  // note_change(who, what)
  // Magik: _return {who, what}
  // ---------------------------------------------------------------------------
  noteChange(who: string, what: unknown): [string, unknown] {
    this.changeLog.push({ who, what, ts: new Date().toLocaleTimeString() });
    this.onStateChange?.();
    return [who, what];
  }

  // ---------------------------------------------------------------------------
  // show_edit_controls()
  // Magik: _return  (stub vacío)
  // ---------------------------------------------------------------------------
  showEditControls(): void {
    // stub — equivalente al _return vacío en Magik
  }

  // Getters/setters para que la UI acceda al estado
  get dialogOpen(): boolean  { return this.oMarco.open; }
  get dialogTitle(): string  { return this.oMarco.title; }
  get textoVentana(): string { return this.oVentana; }
  set textoVentana(v: string) { this.oVentana = v; }
  getPageElements(): LayoutElement[] { return this.loCurrentPage1; }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo de CGuiEditaSelloResumenProyecto
// =============================================================================

export function CGuiEditaSelloResumenProyectoUI() {
  // Fuerza re-render cada vez que el modelo cambia
  const [rev, setRev] = useState(0);
  const refresh = useCallback(() => setRev(r => r + 1), []);

  // Instancia del modelo — equivale a c_gui_edita_sello_resumen_proyecto.new()
  const modelRef = useRef(new CGuiEditaSelloResumenProyecto(refresh));
  const model    = modelRef.current;

  // Estado local del textarea (sincronizado con model.textoVentana)
  const [localText, setLocalText] = useState('');

  // ── Abrir editor ──────────────────────────────────────────────────────────
  const handleAbreVentana = () => {
    // Magik: obten_sello(:c_resumen_proyecto) + abre_ventana()
    const sello = model.obtenSello('c_resumen_proyecto');
    if (sello) {
      model.loSello = sello;
      model.abreVentana();
      setLocalText(model.textoVentana);
    }
  };

  // ── Escribe texto al sello ────────────────────────────────────────────────
  const handleEscribeTexto = () => {
    model.textoVentana = localText;
    model.escribeTextoAlSello();
  };

  // ── Cancelar / salir ──────────────────────────────────────────────────────
  const handleSalir = () => {
    model.salir();
  };

  // Sello actual (para el preview del layout)
  const selloActual = model.loSello
    ?? model.getPageElements().find(e => e.className === 'c_resumen_proyecto')?.sello
    ?? null;

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_gui_edita_sello_resumen_proyecto</h3>
      <p style={st.meta}>
        Diálogo GUI para editar el texto del "Sello Resumen del Proyecto" en el
        motor de planos Smallworld. Permite leer el texto del sello, editarlo
        y escribirlo de vuelta (en mayúsculas) con refresco de la vista de layout.
      </p>

      {/* ── Preview del layout — equivale a la vista del motor de planos ── */}
      <div style={{ marginTop: 8 }}>
        <p style={{ ...st.meta, fontWeight: 'bold', marginBottom: 4 }}>
          Vista del Layout (LoCurrentPage1.elements)
        </p>
        <div style={st.layoutPreview}>
          {model.getPageElements().map((el, i) => {
            const isResumen = el.className === 'c_resumen_proyecto';
            return (
              <div
                key={i}
                style={{
                  ...st.layoutElement,
                  background   : isResumen ? '#e8f5e9' : '#f5f5f5',
                  borderColor  : isResumen ? '#2e7d32' : '#ccc',
                  fontWeight   : isResumen ? 'bold'   : 'normal',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 10 }}>
                  {el.className}
                </span>
                {isResumen && selloActual && (
                  <div style={{ marginTop: 4, fontSize: 10, color: '#2e7d32', fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                    {selloActual.contenidoSello}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={handleAbreVentana}
          style={{ ...st.btn, marginTop: 8 }}
        >
          abre_ventana() — Editar sello
        </button>
      </div>

      {/* ── Modal dialog — equivale a frame.new() + panel + text_window ── */}
      {model.dialogOpen && (
        <div style={st.overlay}>
          <div style={{ ...st.modal, width: 550 }}>

            {/* Título — Magik: .oMarco.title << "Personalización del Sello" */}
            <div style={st.modalHeader}>
              <span style={{ fontWeight: 'bold', fontSize: 13 }}>
                {model.dialogTitle}
              </span>
              <span style={{ fontSize: 10, color: '#888', marginLeft: 8 }}>
                550×500px (Magik: .oMarco.width/height)
              </span>
            </div>

            {/* text_window.new(panel, 33, 110, agent, :editable?, _true) */}
            <div style={{ padding: '10px 12px' }}>
              <label style={st.lbl}>
                Texto del sello (text_window 33×110, editable):
              </label>
              <textarea
                rows={8}
                style={st.textarea}
                value={localText}
                onChange={e => setLocalText(e.target.value)}
                placeholder="Contenido del sello resumen..."
              />
              <p style={{ ...st.meta, marginTop: 4 }}>
                Al guardar el texto se convierte a MAYÚSCULAS
                (<code>.uppercase</code> en Magik).
              </p>
            </div>

            {/* Botones — button_item.new() */}
            <div style={st.modalFooter}>
              {/* Magik: button_item.new(panel, "Escribe Texto al Sello", _self, :escribe_texto_al_sello) */}
              <button onClick={handleEscribeTexto} style={st.btn}>
                Escribe Texto al Sello
              </button>
              {/* Magik: button_item.new(panel, "Cancelar", _self, :salir) */}
              <button
                onClick={handleSalir}
                style={{ ...st.btn, background: '#607d8b', borderColor: '#607d8b' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shared variable — define_shared_variable(:edita_sello_resumen_proy_aux) ── */}
      <div style={{ ...st.control, marginTop: 12 }}>
        <span style={st.badge}>edita_sello_resumen_proy_aux (shared)</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#555' }}>
          {CGuiEditaSelloResumenProyecto.editaSelloResumenProyAux
            ? 'instancia activa asignada'
            : '_unset'}
        </span>
      </div>

      {/* ── Log de note_change ── */}
      {model.changeLog.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p style={{ ...st.meta, fontWeight: 'bold', marginBottom: 4 }}>
            note_change(who, what) — log de cambios
          </p>
          <table style={st.table}>
            <thead>
              <tr>
                {['Hora', 'who', 'what'].map(h => (
                  <th key={h} style={st.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...model.changeLog].reverse().slice(0, 6).map((e, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                  <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}>{e.ts}</td>
                  <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 11 }}>{e.who}</td>
                  <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 11 }}>{String(e.what)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tabla de equivalencias ── */}
      <EquivalenciasTable />
    </div>
  );
}

// Tabla de equivalencias Magik ↔ TypeScript
function EquivalenciasTable() {
  const rows = [
    { m: 'def_slotted_exemplar(..., :model)',               t: 'class CGuiEditaSelloResumenProyecto',           n: 'Clase React model' },
    { m: 'frame.new("Text window")',                        t: 'FrameConfig { title, width, height, open }',   n: 'Config del marco' },
    { m: 'panel.new(oMarco)',                               t: '<div> modal container',                        n: 'Panel → div' },
    { m: 'text_window.new(panel, 33, 110, agent, :editable?, _true)', t: '<textarea rows={8}>',               n: 'Editor de texto' },
    { m: 'button_item.new(panel, "...", _self, :method)',  t: '<button onClick={handler}>',                   n: 'Botón de acción' },
    { m: '.oMarco.activate()',                              t: 'setDialogOpen(true) → modal visible',          n: 'Abrir ventana' },
    { m: '.oMarco.deactivate()',                            t: 'setDialogOpen(false) → modal oculto',          n: 'Cerrar ventana' },
    { m: '.oVentana.contents << value',                     t: 'model.textoVentana = value',                   n: 'Setter text_window' },
    { m: '.oVentana.contents',                              t: 'model.textoVentana (getter)',                  n: 'Getter text_window' },
    { m: '.oVentana.contents.uppercase',                    t: '.toUpperCase()',                               n: 'Magik uppercase' },
    { m: '.LoSello.contenido_sello << valor',               t: 'sello.contenidoSello = valor',                 n: 'Escribir al sello' },
    { m: '.LoLayout_Manager.action(:layout_view_refresh).execute_action()', t: 'noteChange + refresh()',       n: 'Refresh layout' },
    { m: 'define_shared_variable(:edita_sello_resumen_proy_aux)', t: 'static editaSelloResumenProyAux',        n: 'Variable de clase' },
    { m: '_for el _over page.elements() → if el.class_name = tipo', t: 'page.find(el => el.className === tipo)', n: 'Buscar sello' },
    { m: '.oTablas.elemento(:tbl).oCeldas.Celda(2,1).oElemento.sTexto', t: "tablas.get('tbl')?.celdas.get('2-1')?.sTexto", n: 'Acceso a celda' },
    { m: 'note_change(who,what) → _return {who,what}',     t: 'noteChange(who,what): [string,unknown]',       n: 'Notificación cambio' },
  ];
  return (
    <table style={{ ...st.table, marginTop: 14 }}>
      <thead>
        <tr>{['Magik', 'TypeScript', 'Notas'].map(h => <th key={h} style={st.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map(({ m, t, n }, i) => (
          <tr key={m} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
            <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{m}</code></td>
            <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{t}</code></td>
            <td style={{ ...st.td, color: '#555', fontSize: 11 }}>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame        : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title        : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta         : { color: '#666', fontSize: 12, margin: '2px 0' },
  control      : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl          : { fontSize: 11, display: 'block', marginBottom: 4, color: '#555' },
  btn          : { padding: '5px 14px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  badge        : { fontSize: 10, background: '#2E4057', color: '#fff', borderRadius: 3, padding: '2px 7px', fontFamily: 'monospace' },
  table        : { borderCollapse: 'collapse' as const, width: '100%' },
  th           : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' as const, fontSize: 11 },
  td           : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
  // Layout preview
  layoutPreview: { display: 'flex', flexDirection: 'column', gap: 4, padding: 8, background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 4, maxWidth: 420 },
  layoutElement: { padding: '5px 10px', border: '1px solid', borderRadius: 3, fontSize: 11 },
  // Modal
  overlay      : { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal        : { background: '#fff', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', minWidth: 360 },
  modalHeader  : { padding: '10px 14px', background: '#2E4057', color: '#fff', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center' },
  modalFooter  : { padding: '10px 12px', display: 'flex', gap: 10, borderTop: '1px solid #eee', justifyContent: 'flex-end' },
  textarea     : { width: '100%', resize: 'vertical' as const, fontFamily: 'monospace', fontSize: 12, padding: 6, border: '1px solid #b0bec5', borderRadius: 3, boxSizing: 'border-box' as const },
};

export default CGuiEditaSelloResumenProyectoUI;
