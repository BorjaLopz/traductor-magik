// Source: adiciones_layout/source/c_arbol_cables_fo_cedo.magik
//
// Diálogo en árbol para seleccionar un único cable de FO con el que generar
// el plano de diagrama de empalmes. Estructura:
//
//   Distrito (raíz)
//     └── Cedo (carpeta)
//           └── Cable FO (hoja con checkbox — selección única)
//
// Estilos por construction_status:
//   EXISTENTE  → verde
//   PROYECTADO → rojo

export type ConstructionStatus = 'EXISTENTE' | 'PROYECTADO';

export interface DistritoRecord {
  id:                  string;
  user_distrito:       string;
  construction_status: ConstructionStatus;
}

export interface CedoRecord {
  id:                  string;
  user_identificacion: string;
  construction_status: ConstructionStatus;
}

export interface CableFoRecord {
  id:                  string;
  user_numero_cable:   string | undefined;
  trace_description:   string;
  construction_status: ConstructionStatus;
  // Magik: l_cab.source_collection.name = :sheath — filtro de "activados"
  sourceCollection:    'sheath' | string;
}

// Magik: swg_dsn_admin_engine.active_design.user!_distrito_optico + .obten_cedos_contenidos
export interface CablesFoCedoService {
  activeDistrito(): DistritoRecord | undefined;
  // Para el distrito activo, devuelve los cedos contenidos
  cedosDelDistrito(distrito: DistritoRecord): CedoRecord[];
  // Para un cedo, los cables FO downstream
  cablesDelCedo(cedo: CedoRecord): CableFoRecord[];
}

// =============================================================================
// MODELO DE ÁRBOL
// =============================================================================

export type NodeKind = 'distrito' | 'cedo' | 'cable';

export interface TreeNode {
  kind:     NodeKind;
  id:       string;
  label:    string;
  style:    'red' | 'green' | 'green_bold';
  data:     DistritoRecord | CedoRecord | CableFoRecord;
  checked?: boolean;          // sólo aplica a 'cable'
  children: TreeNode[];
}

function styleOf(status: ConstructionStatus, bold = false): 'red' | 'green' | 'green_bold' {
  if (status === 'PROYECTADO') return 'red';
  return bold ? 'green_bold' : 'green';
}

// =============================================================================
// CLASE
// =============================================================================

export interface GeneraPlanoResult {
  ok:     boolean;
  msg:    string;
  cable?: CableFoRecord;
}

export class CArbolCablesFoCedo {
  // Magik: list (array de display_tree raíz)
  list: TreeNode[] = [];

  // Magik: pseudo-slots
  cableSeleccionado:    CableFoRecord | undefined = undefined;
  empalmeSeleccionado:  CableFoRecord[]           = [];

  private readonly _svc: CablesFoCedoService;

  constructor(service: CablesFoCedoService) {
    this._svc = service;
  }

  // Magik: llena_arbol — genera la jerarquía completa
  llenaArbol(): TreeNode[] {
    this.list = this.cablesCentral();
    return this.list;
  }

  // Magik: cables_central — construye sólo el nivel distrito
  cablesCentral(): TreeNode[] {
    const distrito = this._svc.activeDistrito();
    if (!distrito) return [];

    const cedos  = this._svc.cedosDelDistrito(distrito);
    const cedosT = this.llenaCedos(cedos);

    const root: TreeNode = {
      kind:     'distrito',
      id:       distrito.id,
      label:    `Distrito ${distrito.user_distrito}`,
      style:    styleOf(distrito.construction_status, true),
      data:     distrito,
      children: cedosT,
    };
    return [root];
  }

  // Magik: llena_cedos(p_cedos_distrito)
  llenaCedos(cedos: CedoRecord[]): TreeNode[] {
    return cedos.map(c => ({
      kind:     'cedo',
      id:       c.id,
      label:    `Cedo: ${c.user_identificacion}`,
      style:    styleOf(c.construction_status, true),
      data:     c,
      children: this.llenaCables(this._svc.cablesDelCedo(c)),
    }));
  }

  // Magik: llena_cables(p_cables)
  llenaCables(cables: CableFoRecord[]): TreeNode[] {
    return cables.map(cab => {
      const label = cab.user_numero_cable !== undefined
        ? ` Num. Cable ${cab.user_numero_cable}  ${cab.trace_description}   ${cab.construction_status}`
        : `${cab.trace_description}   ${cab.construction_status}   NUMERO DE CABLE  `;
      return {
        kind:     'cable',
        id:       cab.id,
        label,
        style:    styleOf(cab.construction_status, false),
        data:     cab,
        checked:  false,
        children: [],
      };
    });
  }

  // Magik: activados — recorre el árbol y devuelve cables checkados de :sheath
  activados(): CableFoRecord[] {
    const out: CableFoRecord[] = [];
    const walk = (n: TreeNode) => {
      if (n.kind === 'cable' && n.checked && (n.data as CableFoRecord).sourceCollection === 'sheath') {
        out.push(n.data as CableFoRecord);
      }
      for (const c of n.children) walk(c);
    };
    for (const root of this.list) walk(root);
    return out;
  }

  // Magik: valor_cambiado — al chequear un sheath, lo marca como cable_seleccionado
  valorCambiado(node: TreeNode, newValue: boolean): void {
    if (node.kind !== 'cable') return;
    const cab = node.data as CableFoRecord;
    if (cab.sourceCollection !== 'sheath') return;

    // Magik usa selección única — al activar uno, los demás se desactivan
    if (newValue) {
      const walk = (n: TreeNode) => {
        if (n.kind === 'cable') n.checked = (n.id === node.id);
        for (const c of n.children) walk(c);
      };
      for (const root of this.list) walk(root);
      this.cableSeleccionado = cab;
    } else {
      node.checked = false;
      this.cableSeleccionado = undefined;
    }
  }

  // Magik: genera_plano_cable — valida cantidad y devuelve resultado
  generaPlanoCable(): GeneraPlanoResult {
    const seleccion = this.activados();
    if (seleccion.length === 0) {
      return { ok: false, msg: 'No se ha seleccionado Cable de FO' };
    }
    if (seleccion.length > 1) {
      return { ok: false, msg: 'Debe Seleccionar solo un Cable de FO' };
    }
    const cable = seleccion[0];
    return { ok: true, msg: `Plano generado para cable ${cable.id}`, cable };
  }
}
