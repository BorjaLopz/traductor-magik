// ================================================================================
//  MIGRACIÓN: c_arbol_cables_fo_cedo.magik → CArbolCablesFoCedo.tsx
//  Clase origen : c_arbol_cables_fo_cedo  (extends :model)
//  Autor orig.  : — (sin fecha indicada)
// ================================================================================

import React, { useState, useMemo, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ConstructionStatus = 'EXISTENTE' | 'PROYECTADO';

export interface CableItem {
  id: string;
  numeroCable: string | null;    // user!_numero_cable (_unset en Magik)
  traceDescription: string;      // trace_description
  constructionStatus: ConstructionStatus;
  sourceName: 'sheath' | 'other'; // source_collection.name → :sheath
}

export interface CedoItem {
  id: string;
  identificacion: string;        // user!_identificacion
  constructionStatus: ConstructionStatus;
  cables: CableItem[];
}

export interface DistritoItem {
  id: string;
  nombreDistrito: string;        // user!_distrito
  constructionStatus: ConstructionStatus;
  cedos: CedoItem[];
}

// display_tree equivalente — nodo del árbol con tipo y estado de expansión
interface TreeNode {
  type: 'distrito' | 'cedo' | 'cable';
  id: string;
  label: string;
  status: ConstructionStatus;
  checked?: boolean;            // :toggle :check en styled_string de cables
  data: CableItem | CedoItem | DistritoItem;
  children?: TreeNode[];
  expanded: boolean;
}

// ─── Mock de datos GIS (swg_dsn_admin_engine / active_design / proyecto) ────

export const MOCK_DISTRITO: DistritoItem = {
  id: 'dto-01',
  nombreDistrito: '01',
  constructionStatus: 'EXISTENTE',
  cedos: [
    {
      id: 'cedo-A',
      identificacion: 'CEDO-A-001',
      constructionStatus: 'EXISTENTE',
      cables: [
        { id: 'cab-001', numeroCable: '001', traceDescription: 'Central → CEDO-A (tramo Norte)',  constructionStatus: 'EXISTENTE',  sourceName: 'sheath' },
        { id: 'cab-002', numeroCable: '002', traceDescription: 'Central → CEDO-A (tramo Sur)',    constructionStatus: 'PROYECTADO', sourceName: 'sheath' },
        { id: 'cab-003', numeroCable: null,  traceDescription: 'CEDO-A → Derivación Este',        constructionStatus: 'EXISTENTE',  sourceName: 'sheath' },
      ],
    },
    {
      id: 'cedo-B',
      identificacion: 'CEDO-B-002',
      constructionStatus: 'PROYECTADO',
      cables: [
        { id: 'cab-004', numeroCable: '004', traceDescription: 'Central → CEDO-B (principal)',   constructionStatus: 'PROYECTADO', sourceName: 'sheath' },
        { id: 'cab-005', numeroCable: '005', traceDescription: 'CEDO-B → Ramal Oeste',           constructionStatus: 'EXISTENTE',  sourceName: 'sheath' },
      ],
    },
    {
      id: 'cedo-C',
      identificacion: 'CEDO-C-003',
      constructionStatus: 'EXISTENTE',
      cables: [
        { id: 'cab-006', numeroCable: '006', traceDescription: 'Central → CEDO-C (64FO)',        constructionStatus: 'EXISTENTE',  sourceName: 'sheath' },
        { id: 'cab-007', numeroCable: null,  traceDescription: 'CEDO-C → Extensión Norte',       constructionStatus: 'PROYECTADO', sourceName: 'sheath' },
      ],
    },
  ],
};

// ─── CArbolCablesFoCedo ───────────────────────────────────────────────────────

export class CArbolCablesFoCedo {
  // def_slotted_exemplar: .list / .tree_item
  list: TreeNode[] = [];

  // define_pseudo_slot: cable_seleccionado / empalme_seleccionado
  cableSeleccionado: CableItem | null = null;
  empalmeSeleccionado: CableItem[] = [];       // rope.new() vacío por defecto

  private _onStateChange?: () => void;

  constructor(onStateChange?: () => void) {
    this._onStateChange = onStateChange;
  }

  // ── llena_arbol() ─────────────────────────────────────────────────────────
  // .list << _self.cables_central() ; >> .list
  llenaArbol(distrito?: DistritoItem): TreeNode[] {
    this.list = this.cablesCentral(distrito ?? MOCK_DISTRITO);
    return this.list;
  }

  // ── cables_central() ──────────────────────────────────────────────────────
  // Construye nodo raíz Distrito; hijos via llena_cedos()
  // equality_property_list → Map<CedoItem, CableItem[]>
  cablesCentral(distrito: DistritoItem): TreeNode[] {
    const cedosMap = new Map<CedoItem, CableItem[]>();
    for (const cedo of distrito.cedos) {
      // iterCedo.get_downstream_cables() → cedo.cables (mock)
      cedosMap.set(cedo, cedo.cables);
    }

    const text  = `Distrito ${distrito.nombreDistrito}`;
    const node: TreeNode = {
      type    : 'distrito',
      id      : distrito.id,
      label   : text,
      status  : distrito.constructionStatus,
      data    : distrito,
      expanded: true,
      children: this.llenaCedos(cedosMap),
    };
    return [node];
  }

  // ── llena_cedos(p_cedos_distrito) ─────────────────────────────────────────
  // _for l_key, l_elem _over l_cedos_distrito.keys_and_elements()
  llenaCedos(cedosDistrito: Map<CedoItem, CableItem[]>): TreeNode[] {
    const list: TreeNode[] = [];
    for (const [cedo, cables] of cedosDistrito) {
      const text = `Cedo: ${cedo.identificacion}`;
      list.push({
        type    : 'cedo',
        id      : cedo.id,
        label   : text,
        status  : cedo.constructionStatus,
        data    : cedo,
        expanded: false,
        children: this.llenaCables(cables),
      });
    }
    return list;
  }

  // ── llena_cables(p_cables) ────────────────────────────────────────────────
  // styled_string con :toggle :check → checkbox React
  // numeroCable _is _unset → null en TS
  llenaCables(cables: CableItem[]): TreeNode[] {
    return cables.map(cab => {
      const label = cab.numeroCable !== null
        ? ` Num. Cable ${cab.numeroCable}  ${cab.traceDescription}   ${cab.constructionStatus}`
        : `${cab.traceDescription}   ${cab.constructionStatus}   NUMERO DE CABLE  `;
      return {
        type    : 'cable' as const,
        id      : cab.id,
        label,
        status  : cab.constructionStatus,
        checked : false,
        data    : cab,
        expanded: false,
      };
    });
  }

  // ── activados() ───────────────────────────────────────────────────────────
  // dt.value[:check] _andif dt.value[:elemento].source_collection.name = :sheath
  activados(nodes: TreeNode[]): CableItem[] {
    const result: CableItem[] = [];
    const walk = (ns: TreeNode[]) => {
      for (const n of ns) {
        if (n.type === 'cable' && n.checked &&
            (n.data as CableItem).sourceName === 'sheath') {
          result.push(n.data as CableItem);
        }
        if (n.children) walk(n.children);
      }
    };
    walk(nodes);
    return result;
  }

  // ── genera_plano_cable() ──────────────────────────────────────────────────
  // condition.raise(:user_error) → devuelve { ok: false, message }
  // c_engine_ruta_cables.new() + c_plano_diagrama_de_empalmes.new() → mock
  generaPlanoCable(nodes: TreeNode[]): { ok: boolean; message: string; cable?: CableItem } {
    const activados = this.activados(nodes);
    if (activados.length === 0) {
      return { ok: false, message: 'No se ha seleccionado Cable de FO' };
    }
    if (activados.length > 1) {
      return { ok: false, message: 'Debe Seleccionar solo un Cable de FO' };
    }
    this.cableSeleccionado = activados[0];
    return {
      ok     : true,
      message: `[Mock] Plano generado para: ${activados[0].traceDescription}`,
      cable  : activados[0],
    };
  }

  // ── valor_cambiado(p_tree, p_value_id, p_new_value, ...) ─────────────────
  // p_tree.key.source_collection.name _is :sheath _andif p_new_value _is _true
  valorCambiado(cable: CableItem, checked: boolean): void {
    if (cable.sourceName === 'sheath' && checked) {
      this.cableSeleccionado = cable;
    }
    this._onStateChange?.();
  }

  // ── cancelar() / selected() ───────────────────────────────────────────────
  // _self.quit() → cierra la ventana
  cancelar(): void { this._onStateChange?.(); }
  selected(): void { /* tree_item.refresh() — el re-render de React es suficiente */ }
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = {
  wrap:   { fontFamily: 'monospace', fontSize: 12, padding: 16,
            background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  header: { background: '#313244', padding: '8px 12px', borderRadius: 4,
            marginBottom: 10, fontSize: 10, color: '#89b4fa', fontWeight: 700,
            textTransform: 'uppercase' as const, letterSpacing: 0.4 } as React.CSSProperties,
  tree:   { background: '#181825', borderRadius: 6, padding: '8px 4px',
            marginBottom: 10, maxHeight: 340, overflowY: 'auto' as const,
            border: '1px solid #313244' } as React.CSSProperties,
  node: (depth: number): React.CSSProperties => ({
    paddingLeft: depth * 20 + 4, paddingTop: 3, paddingBottom: 3,
    display: 'flex', alignItems: 'center', gap: 5,
  }),
  btnExpand: { background: 'none', border: 'none', color: '#6c7086',
               cursor: 'pointer', fontFamily: 'monospace', fontSize: 11,
               width: 14, padding: 0 } as React.CSSProperties,
  badge: (status: ConstructionStatus): React.CSSProperties => ({
    fontSize: 8, padding: '1px 5px', borderRadius: 8, fontWeight: 700,
    background: status === 'EXISTENTE' ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e',
    whiteSpace: 'nowrap' as const,
  }),
  row:  { display: 'flex', gap: 8, justifyContent: 'flex-end',
          marginTop: 8 } as React.CSSProperties,
  btn:  (primary: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: primary ? '#89b4fa' : '#45475a',
    color: primary ? '#1e1e2e' : '#cdd6f4', fontFamily: 'monospace', fontSize: 12,
  }),
  errBox: { background: '#45263a', border: '1px solid #f38ba8',
            color: '#f38ba8', padding: '6px 12px', borderRadius: 4,
            marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' as const } as React.CSSProperties,
  okBox:  { background: '#1e3a2a', border: '1px solid #a6e3a1',
            color: '#a6e3a1', padding: '6px 12px', borderRadius: 4,
            marginTop: 8, fontSize: 12 } as React.CSSProperties,
  info:   { fontSize: 11, color: '#6c7086', marginBottom: 6 } as React.CSSProperties,
};

function labelColor(status: ConstructionStatus): string {
  return status === 'EXISTENTE' ? '#a6e3a1' : '#f38ba8';
}

function typeIcon(type: TreeNode['type']): string {
  return type === 'distrito' ? '▣' : type === 'cedo' ? '◈' : '○';
}

// ─── Nodo del árbol (recursivo) ───────────────────────────────────────────────

interface NodeProps {
  node: TreeNode;
  depth: number;
  onExpand: (id: string) => void;
  onCheck: (id: string) => void;
}

function NodeView({ node, depth, onExpand, onCheck }: NodeProps) {
  const hasChildren = !!node.children?.length;
  return (
    <>
      <div style={s.node(depth)}>
        <button style={s.btnExpand}
          onClick={() => hasChildren && onExpand(node.id)}>
          {hasChildren ? (node.expanded ? '▾' : '▸') : ' '}
        </button>

        {node.type === 'cable' && (
          <input type="checkbox" checked={node.checked ?? false}
            onChange={() => onCheck(node.id)}
            style={{ cursor: 'pointer' }} />
        )}

        <span style={{ fontSize: 11 }}>{typeIcon(node.type)}</span>
        <span style={{ color: labelColor(node.status), flex: 1, fontSize: 11 }}>
          {node.label}
        </span>
        <span style={s.badge(node.status)}>{node.status}</span>
      </div>

      {node.expanded && node.children?.map(child => (
        <NodeView key={child.id} node={child} depth={depth + 1}
          onExpand={onExpand} onCheck={onCheck} />
      ))}
    </>
  );
}

// ─── Componente principal UI ──────────────────────────────────────────────────

export function CArbolCablesFoCedoUI() {
  const [nodes, setNodes]   = useState<TreeNode[]>([]);
  const [msg, setMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [closed, setClosed] = useState(false);

  const model = useMemo(() => new CArbolCablesFoCedo(), []);

  // Carga inicial (activate_in → llena_arbol → cables_central)
  React.useEffect(() => {
    setNodes(model.llenaArbol());
  }, [model]);

  // toggle expand/collapse
  const onExpand = useCallback((id: string) => {
    const walk = (ns: TreeNode[]): TreeNode[] =>
      ns.map(n => n.id === id
        ? { ...n, expanded: !n.expanded }
        : { ...n, children: n.children ? walk(n.children) : n.children }
      );
    setNodes(prev => walk(prev));
    setMsg(null);
  }, []);

  // toggle checkbox — valor_cambiado()
  const onCheck = useCallback((id: string) => {
    const walk = (ns: TreeNode[]): TreeNode[] =>
      ns.map(n => {
        if (n.id === id && n.type === 'cable') {
          const next = !n.checked;
          model.valorCambiado(n.data as CableItem, next);
          return { ...n, checked: next };
        }
        return { ...n, children: n.children ? walk(n.children) : n.children };
      });
    setNodes(prev => walk(prev));
    setMsg(null);
  }, [model]);

  // genera_plano_cable()
  const onGenerarPlano = useCallback(() => {
    const res = model.generaPlanoCable(nodes);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) setTimeout(() => setClosed(true), 2000);
  }, [model, nodes]);

  // cancelar()
  const onCancelar = useCallback(() => setClosed(true), []);

  const activadosCount = useMemo(() => model.activados(nodes).length, [model, nodes]);

  if (closed) {
    return (
      <div style={s.wrap}>
        <div style={{ color: '#6c7086', fontSize: 12, marginBottom: 8 }}>
          Diálogo cerrado — _self.quit()
        </div>
        <button style={s.btn(true)}
          onClick={() => { setClosed(false); setMsg(null); setNodes(model.llenaArbol()); }}>
          Reabrir
        </button>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      {/* p_frame.title — equivalente a activate_in() */}
      <div style={s.header}>
        Seleccionar cable de fibra óptica para plano de diagrama de empalmes
      </div>

      {/* tree_item — árbol Distrito → CEDO → Cable */}
      <div style={s.tree}>
        {nodes.map(n => (
          <NodeView key={n.id} node={n} depth={0}
            onExpand={onExpand} onCheck={onCheck} />
        ))}
      </div>

      {/* activados() — contador */}
      <div style={s.info}>
        Cables marcados:{' '}
        <b style={{ color: activadosCount === 1 ? '#a6e3a1' : activadosCount > 1 ? '#f38ba8' : '#cdd6f4' }}>
          {activadosCount}
        </b>
        {activadosCount !== 1 && (
          <span style={{ color: '#f9e2af', marginLeft: 6 }}>(requiere exactamente 1)</span>
        )}
        {' '}| ▣ Distrito  ◈ CEDO  ○ Cable (checkbox)
      </div>

      {/* mensajes — show_message / condition.raise(:user_error) */}
      {msg && <div style={msg.ok ? s.okBox : s.errBox}>{msg.text}</div>}

      {/* button_box — Generar Plano + Salir */}
      <div style={s.row}>
        <button style={s.btn(true)} onClick={onGenerarPlano}>
          Generar Plano de Cable Seleccionado
        </button>
        <button style={s.btn(false)} onClick={onCancelar}>
          Salir
        </button>
      </div>
    </div>
  );
}
