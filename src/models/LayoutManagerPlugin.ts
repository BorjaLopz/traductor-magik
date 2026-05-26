// Source: adiciones_layout/source/layout_manager_plugin.magik
//
// Plugin SW principal del Layout Designer. Registra ~20 acciones, mantiene
// estado de habilitación basado en (current_document, módulo admin_solicitud,
// diseño activo) y expone operaciones sobre planos (save, plot, centralizar,
// publicar a web, actualizar sellos, exportar shape, zoom_to).
//
// La transcripción cubre la API pública + predicados de habilitación + flujo
// de save_layout y actualiza_sellos. Operaciones que requieren GIS real
// (plot_system, layout_plot_engine, exportar shape) quedan como hooks vía
// LayoutManagerServices.

// =============================================================================
// CONSTANTES Y PROPIEDADES
// =============================================================================

export const DRIVE  = 'c:';
export const FILTRO = '*.pdf';

// =============================================================================
// TIPOS
// =============================================================================

export interface SwActionDef {
  id:             string;
  enabled:        boolean;
  helpId?:        number;
  actionMessage?: string;
  toolbarControl?: string;
  image?:         [string, string];
  items?:         string[];
  value?:         boolean | string;
}

export interface LayoutElement {
  className: string;
  attributes: Record<string, { value: unknown } | undefined>;
  window?:   unknown;
  respondsTo(msg: string): boolean;
  actualizaDatos?(): void;
  diujaLineaEntrePozos?(): void;
  isKindOf(kind: string): boolean;
}

export interface LayoutPage {
  elements: LayoutElement[];
}

export interface LayoutDocument {
  filename?:    string;
  currentPage:  LayoutPage;
  pages:        LayoutPage[];
  attributes:   Record<string, unknown>;
  getAttribute(name: string): unknown;
  guardarPlano(): boolean;       // user!_guardar_plano
}

export interface DesignAdminEngine {
  activeDesign: ActiveDesign | undefined;
}

export interface ActiveDesign {
  status:     'Conciliado' | 'Construcción' | 'Existente' | string;
  tipoDiseno: 'principal' | 'secundaria' | string;
}

export interface AdminSolicitudPlugin {
  dialogIsOpen: (name: string) => boolean;
  estructurasFaltantes: { className: string; id: string }[];
}

export interface LayoutManagerServices {
  currentDocument(): LayoutDocument | undefined;
  admin():           AdminSolicitudPlugin | undefined;
  design():          DesignAdminEngine;
  templateNames():   string[];
  // Acciones externalizables (mock-friendly)
  abrirCentralizarPlanos(): string | undefined;
  exportaShapeDesdePlano(): void;
  exportaShapeDesdeVista(): void;
  publicaArchivoAWeb():     'ok' | 'sin_repositorio' | 'sin_limites' | 'sin_conectividad';
  showAlert(msg: string):  void;
}

// =============================================================================
// PLUGIN
// =============================================================================

export interface SaveResult { ok: boolean; via: 'guardar_plano' | 'save_as' | 'no_layout' }
export interface ActualizaSellosResult { tocados: number; pages: number }

export class LayoutManagerPlugin {
  // Pseudo-slots y propiedad masters?
  barraDesp:  string | undefined = undefined;     // progress_indicator_dialog
  gtrail:     unknown            = undefined;
  masters:    boolean            = true;

  private readonly _actions: Map<string, SwActionDef> = new Map();
  private readonly _svc: LayoutManagerServices;

  constructor(services: LayoutManagerServices) {
    this._svc = services;
    this.initActions();
    this.checkActions();
  }

  // Magik: init_actions — registra todas las acciones del plugin
  initActions(): void {
    const reg = (a: SwActionDef) => this._actions.set(a.id, a);
    const enabled = (id: string, message: string) =>
      reg({ id, enabled: true, actionMessage: message });

    // File / Page
    enabled('new',         'new_layout()');
    enabled('new_existing','new_existing()');
    enabled('open',        'open_layout()');
    enabled('save',        'save_layout()');
    enabled('save_as',     'save_as_layout()');
    enabled('close',       'close_layout()');
    enabled('exit',        'close()');
    enabled('page_setup',  'page_setup()');
    enabled('properties',  'properties()');
    enabled('plot',        'plot_layout()');
    enabled('plot_setup',  'plot_setup_layout()');

    // Selección y vista
    reg({ id: 'layout_selection', enabled: true, toolbarControl: 'image_radio_set' });
    reg({ id: 'preview',          enabled: true, toolbarControl: 'image_toggle_item', value: true });

    // Templates
    reg({
      id: 'select_template',
      enabled: true,
      toolbarControl: 'combo_box_item',
      items: this._svc.templateNames(),
    });

    // Custom
    enabled('custom_properties', 'activate_custom_properties_dialog()');
    enabled('quick_pdf',         'pdf_plot()');
    enabled('plano_etiqueta_2pozos_action', 'plano_etiqueta_2pozos()');
    enabled('zoom_to_action',    'zoom_to()');
    enabled('actualiza_sellos',  'actualiza_sellos()');
    enabled('exporta_shapefile_desde_plano', 'exporta_shapefile_desde_plano()');
    enabled('exporta_shapefile_desde_vista', 'exporta_shapefile_desde_vista()');
    enabled('publica_a_web',     'publica_a_web()');
    enabled('centralizar_plano', 'centralizar_plano()');
  }

  // Magik: check_actions — recomputa enabled? por estado actual
  checkActions(): void {
    const doc            = this._svc.currentDocument();
    const haveLayout     = doc !== undefined;
    const haveFilename   = !!doc?.filename;
    const publicarOk     = this.publicarPlanoAWeb();
    const centralizarOk  = this.habilitaCentralizarPlano();

    this.setEnabled('save',        haveLayout);
    this.setEnabled('save_as',     haveLayout);
    this.setEnabled('close',       haveLayout);
    this.setEnabled('page_setup',  haveLayout);
    this.setEnabled('properties',  haveLayout);
    this.setEnabled('plot',        haveLayout);
    this.setEnabled('publica_a_web',     haveLayout && publicarOk);
    this.setEnabled('centralizar_plano', centralizarOk);

    const select = this._actions.get('select_template');
    if (select) select.items = this._svc.templateNames();

    void haveFilename;   // referenciado por save_layout, no por check_actions
  }

  action(id: string): SwActionDef | undefined { return this._actions.get(id); }
  get actions(): SwActionDef[] { return [...this._actions.values()]; }

  private setEnabled(id: string, enabled: boolean): void {
    const a = this._actions.get(id);
    if (a) a.enabled = enabled;
  }

  // Magik: save_layout
  saveLayout(): SaveResult {
    const layout = this._svc.currentDocument();
    if (!layout) {
      this._svc.showAlert('No hay un layout actual.');
      return { ok: false, via: 'no_layout' };
    }
    if (layout.filename !== undefined) {
      const ok = layout.guardarPlano();
      return { ok, via: 'guardar_plano' };
    }
    // Sin filename: si hay user!_tipo_plano definido, usar guardar_plano; si no, save_as
    const tipo = layout.getAttribute('tipo_plano') ?? layout.attributes['tipo_plano'];
    if (tipo !== undefined) {
      const ok = layout.guardarPlano();
      return { ok, via: 'guardar_plano' };
    }
    return { ok: true, via: 'save_as' };
  }

  // Magik: actualiza_sellos
  actualizaSellos(): ActualizaSellosResult {
    const doc = this._svc.currentDocument();
    if (!doc) return { tocados: 0, pages: 0 };
    let tocados = 0;
    for (const page of doc.pages) {
      for (const el of page.elements) {
        if (!el.isKindOf('layout_element')) continue;
        if (!el.respondsTo('actualiza_datos()')) continue;
        if (el.window === undefined) continue;
        el.actualizaDatos?.();
        tocados += 1;
      }
    }
    return { tocados, pages: doc.pages.length };
  }

  // Magik: publicar_plano_a_web? — busca attribute publicarAweb en page elements
  publicarPlanoAWeb(): boolean {
    const doc = this._svc.currentDocument();
    if (!doc) return false;
    for (const el of doc.currentPage.elements) {
      if (!el.respondsTo('ace_name')) continue;
      const attr = el.attributes['publicarAweb'];
      if (attr !== undefined) return Boolean(attr.value);
    }
    return false;
  }

  // Magik: verifica_publicar_a_web — sólo sincroniza el flag
  verificaPublicarAWeb(): void {
    this.setEnabled('publica_a_web', this.publicarPlanoAWeb());
  }

  // Magik: habilita_centralizar_plano?  (ver árbol de decisión en el original)
  habilitaCentralizarPlano(): boolean {
    const admin   = this._svc.admin();
    const design  = this._svc.design().activeDesign;
    const moduloActivo = admin !== undefined && admin.dialogIsOpen('admin_solicitud_gui');
    const disenoActivo = design !== undefined;

    if (moduloActivo && !disenoActivo) {
      // Si tenemos faltantes de tipo extdb_adhoc_record → false
      const faltantes = admin!.estructurasFaltantes.filter(e => e.className === 'extdb_adhoc_record');
      return faltantes.length === 0;
    }

    // Si no aplica la rama de comparticion, exige documento actual
    if (!this._svc.currentDocument()) return false;

    if (disenoActivo) {
      const e = design.status;
      if (e === 'Conciliado' || e === 'Construcción') return true;
      if (design.tipoDiseno === 'secundaria' && e === 'Existente') return true;
    }
    return false;
  }

  // Magik: centralizar_plano → abrir_centralizar_plano
  centralizarPlano(): void {
    const r = this._svc.abrirCentralizarPlanos();
    this._svc.showAlert(r ?? 'Existe un error con el centralizado de planos, favor de reportarlo con su administrador.');
  }

  // Magik: obten_info_plano — primer elemento que responde :ace_name
  obtenInfoPlano(): Record<string, { value: unknown } | undefined> | undefined {
    const doc = this._svc.currentDocument();
    if (!doc) return undefined;
    for (const el of doc.currentPage.elements) {
      if (el.respondsTo('ace_name')) return el.attributes;
    }
    return undefined;
  }

  // Magik: obten_viewport_ep — primer elemento con :ace_name
  obtenViewportEp(): LayoutElement | undefined {
    const doc = this._svc.currentDocument();
    if (!doc) return undefined;
    return doc.currentPage.elements.find(el => el.respondsTo('ace_name'));
  }

  // Magik: plano_etiqueta_2pozos — busca c_geom_set_layout y dispara dibujo
  planoEtiqueta2Pozos(): 'ok' | 'no_geom_set' | 'no_layout_designer' {
    const doc = this._svc.currentDocument();
    if (!doc) return 'no_layout_designer';
    const estilo = doc.currentPage.elements.find(el => el.isKindOf('c_geom_set_layout'));
    if (!estilo) return 'no_geom_set';
    estilo.diujaLineaEntrePozos?.();
    return 'ok';
  }

  // Magik: publica_a_web — versión simplificada (delega flujo al service)
  publicaAWeb(): string {
    if (!this._svc.currentDocument()) return 'Sin documento';
    const r = this._svc.publicaArchivoAWeb();
    switch (r) {
      case 'sin_repositorio': return 'Error: No Existe Repositorio para publicar archivos a SIGC11WEB';
      case 'sin_limites':     return 'Error: No existen Límites de NCO publicados';
      case 'sin_conectividad':return 'Error: No se pudo publicar el archivo por falta de conectividad con el servidor.';
      case 'ok':              return 'Publicación a SIGC11WEB Finalizada Satisfactoriamente';
    }
  }
}
