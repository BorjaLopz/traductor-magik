// =============================================================================
// MIGRACIÓN: c_arbol_tba  →  CArbolTba.tsx
// Jerarquía Magik: c_arbol_tba (:model)
// Fuente: planos_fo/source/montaje_tba/gui/c_arbol_tba.magik
// =============================================================================
//
// Selector de TBA (terminal de fibra óptica) con árbol checkeable.
// Diálogo: tree_item + 3 botones (Generar Plano / Ir a TBA / Salir).
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos (D5 — XxxRecord para campos user!_*)
// ---------------------------------------------------------------------------

export interface TbaRecord {
  'user!_identificador': string;
  'user!_tipo': string;
  'user!_fibras_opticas': string | undefined;
  'user!_ubicacion': string;
  'user!_proyecto'?: string;
  spec_id: string;
  construction_status?: string;
}

export interface BuildingRecord {
  mit_building_structure: {
    box: unknown;
  };
}

export interface TbaDisplayItem {
  elemento: TbaRecord;
  valor: string;
  check: boolean;
  estatus?: string;
}

// ---------------------------------------------------------------------------
// Helpers de transformación (D6 — métodos string Magik → JS)
// ---------------------------------------------------------------------------

function formatTbaLabel(tba: TbaRecord): string {
  const id = tba['user!_identificador'] ?? '';
  const tipo = tba['user!_tipo'] ?? '';
  const spec = tba.spec_id ?? '';
  const fibras = tba['user!_fibras_opticas'] ?? '';
  const ubicacion = tba['user!_ubicacion'] ?? '';
  return `IDENTFICADOR: ${id}  |  TIPO: ${tipo}  |  ESPECIFICACION: ${spec}  |  FIBRAS OPTICAS: ${fibras}  |  UBICACION: ${ubicacion}`;
}

function createDisplayItem(tba: TbaRecord, checked = false): TbaDisplayItem {
  return {
    elemento: tba,
    valor: formatTbaLabel(tba),
    check: checked,
  };
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CArbolTba {
  // Slots Magik: {:list, _unset, :writable}, {:tree_item, _unset, :writable}, {:oTba, _unset, :writable}
  // D1: prefijo _, D3: no readonly porque tienen setter en Magik
  private _list: TbaDisplayItem[] = [];

  get list(): TbaDisplayItem[] { return this._list; }
  set list(value: TbaDisplayItem[]) { this._list = value; }

  // ── activados() ───────────────────────────────────────────────────────
  // Magik: filtra .list por dt.value[:check] !== _unset && dt.value[:check]
  get activados(): TbaRecord[] {
    return this._list
      .filter(dt => dt.check)
      .map(dt => dt.elemento);
  }

  // ── llenaArbol() ──────────────────────────────────────────────────────
  // Magik: obtiene TBAs del diseño activo, construye display_tree
  llenaArbol(tbas: TbaRecord[]): TbaDisplayItem[] {
    const items = tbas.map(tba => createDisplayItem(tba, false));
    this._list = items;
    return items;
  }

  // ── generaPlanoMontajeTba() ───────────────────────────────────────────
  // Magik: valida (1 TBA), crea engine, genera plano
  tbaSeleccionado(): TbaRecord {
    const seleccionados = this.activados;
    if (seleccionados.length === 0) {
      throw new Error('No se ha seleccionado un TBA');
    }
    if (seleccionados.length > 1) {
      throw new Error('Debe seleccionar solo un TBA');
    }
    return seleccionados[0];
  }

  // ── obtenerTbasDiseno() ───────────────────────────────────────────────
  // Magik: query espacial completa (stub — sin backend GIS)
  async obtenerTbasDiseno(): Promise<TbaRecord[]> {
    return MOCK_TBAS;
  }
}

// =============================================================================
// Mock data
// =============================================================================

const MOCK_TBAS: TbaRecord[] = [
  {
    'user!_identificador': 'TBA-001-MT',
    'user!_tipo': 'v2',
    'user!_fibras_opticas': '48',
    'user!_ubicacion': 'Av. Reforma 245, Col. Juárez',
    spec_id: 'FO-48H',
    construction_status: 'PROYECTADO',
  },
  {
    'user!_identificador': 'TBA-002-MT',
    'user!_tipo': 'v1',
    'user!_fibras_opticas': '24',
    'user!_ubicacion': 'Calle Liverpool 58, Col. Roma Norte',
    spec_id: 'FO-24H',
    construction_status: 'PROYECTADO',
  },
  {
    'user!_identificador': 'TBA-003-MT',
    'user!_tipo': 'GUT',
    'user!_fibras_opticas': '12',
    'user!_ubicacion': 'Eje Central 300, Col. Centro',
    spec_id: 'FO-12H',
    construction_status: 'PROYECTADO',
  },
  {
    'user!_identificador': 'TBA-004-MT',
    'user!_tipo': 'v2',
    'user!_fibras_opticas': '96',
    'user!_ubicacion': 'Insurgentes Sur 1200, Col. Del Valle',
    spec_id: 'FO-96H',
    construction_status: 'EXISTENTE',
  },
  {
    'user!_identificador': 'TBA-005-MT',
    'user!_tipo': 'v2',
    'user!_fibras_opticas': '48',
    'user!_ubicacion': 'Av. Universidad 1500, Col. Narvarte',
    spec_id: 'FO-48H',
    construction_status: 'PROYECTADO',
  },
];

// =============================================================================
// Componente React — CArbolTbaUI
// =============================================================================

const SX = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 700,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: {
    color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1,
  } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '180px 1fr', gap: 4,
    fontSize: 11, padding: '2px 0',
  } as React.CSSProperties,
  k: { color: '#89dceb' } as React.CSSProperties,
  v: { color: '#a6e3a1' } as React.CSSProperties,
  vMuted: { color: '#fab387' } as React.CSSProperties,
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  treeItem: {
    padding: '6px 8px', borderRadius: 4, cursor: 'pointer',
    display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11,
    borderLeft: '3px solid transparent',
  } as React.CSSProperties,
  treeItemSelected: {
    background: '#313244',
    borderLeft: '3px solid #89b4fa',
  } as React.CSSProperties,
  checkbox: {
    width: 14, height: 14, cursor: 'pointer', marginTop: 2,
  },
  badge: (status: string) => ({
    padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 'bold',
    background: status === 'PROYECTADO' ? '#1e3a2e' : '#3a2e1e',
    color: status === 'PROYECTADO' ? '#a6e3a1' : '#fab387',
  }) as React.CSSProperties,
  btn: {
    padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
  } as React.CSSProperties,
  table: { fontSize: 10, width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
  th: { padding: '2px 6px', color: '#585b70', textAlign: 'left' } as React.CSSProperties,
  td: { padding: '2px 6px' } as React.CSSProperties,
};

function TbaRow({
  item, checked, onToggle, onSelect, selected,
}: {
  item: TbaDisplayItem;
  checked: boolean;
  onToggle: () => void;
  onSelect: () => void;
  selected: boolean;
}) {
  const tba = item.elemento;
  return (
    <div
      style={{
        ...SX.treeItem,
        ...(selected ? SX.treeItemSelected : {}),
      }}
      onClick={onSelect}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => { e.stopPropagation(); onToggle(); }}
        style={SX.checkbox}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ color: '#a6e3a1', fontWeight: 'bold' }}>
            {tba['user!_identificador']}
          </span>
          <span style={{ color: '#585b70' }}>|</span>
          <span style={{ color: '#89dceb' }}>{tba['user!_tipo']}</span>
          <span style={SX.badge(tba.construction_status ?? '')}>
            {tba.construction_status ?? '—'}
          </span>
        </div>
        <div style={{ color: '#6c7086', fontSize: 10, marginTop: 2 }}>
          {tba['user!_ubicacion']} · {tba.spec_id} · {tba['user!_fibras_opticas']} FO
        </div>
      </div>
    </div>
  );
}

export function CArbolTbaUI() {
  const [items, setItems] = useState<TbaDisplayItem[]>(() =>
    MOCK_TBAS.map(tba => createDisplayItem(tba))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const arbol = useMemo(() => new CArbolTba(), []);

  const activados = useMemo(() => items.filter(i => i.check), [items]);

  const handleToggle = useCallback((id: string) => {
    setItems(prev => prev.map(it =>
      it.elemento['user!_identificador'] === id
        ? { ...it, check: !it.check }
        : it
    ));
    setLastError(null);
  }, []);

  const handleGenerarPlano = useCallback(() => {
    setLastError(null);
    setLastResult(null);
    try {
      arbol.list = items;
      const tba = arbol.tbaSeleccionado();
      setLastResult(`✓ genera_plano_montaje_tba() — Plano generado para ${tba['user!_identificador']}`);
    } catch (e) {
      setLastError(`✗ ${(e as Error).message}`);
    }
  }, [arbol, items]);

  const handleIrATba = useCallback(() => {
    setLastError(null);
    setLastResult(null);
    try {
      arbol.list = items;
      const tba = arbol.tbaSeleccionado();
      setLastResult(`✓ ir_a_tba() — Navegando a ${tba['user!_identificador']} (${tba['user!_ubicacion']})`);
    } catch (e) {
      setLastError(`✗ ${(e as Error).message}`);
    }
  }, [arbol, items]);

  const handleCancelar = useCallback(() => {
    setLastResult('Diálogo cerrado (cancelar() → quit())');
    setSelectedId(null);
  }, []);

  const handleRecargar = useCallback(async () => {
    const tbas = await arbol.obtenerTbasDiseno();
    const newItems = arbol.llenaArbol(tbas);
    setItems(newItems);
    setLastResult('✓ llena_arbol() — Árbol actualizado desde el diseño activo');
  }, [arbol]);

  const selectedItem = useMemo(
    () => items.find(i => i.elemento['user!_identificador'] === selectedId) ?? null,
    [items, selectedId]
  );

  return (
    <div style={SX.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CArbolTba</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          selector TBA · tree_item + button_item · Fase 4 — UI
        </span>
        <a
          href="#"
          style={{ float: 'right', color: '#585b70', fontSize: 10 }}
          onClick={e => { e.preventDefault(); handleRecargar(); }}
        >
          ↻ recargar datos mock
        </a>
      </div>

      {/* Slots del modelo (D1) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Slots (D1 — prefijo _)</div>
          <div style={SX.row}><span style={SX.k}>_list</span><span style={SX.v}>{items.length} items</span></div>
          <div style={SX.row}><span style={SX.k}>activados</span><span style={SX.vMuted}>{activados.length} seleccionados</span></div>
        </div>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Métodos llamables</div>
          <div style={SX.row}><span style={SX.k}>llenaArbol()</span><span style={SX.v}>puebla tree</span></div>
          <div style={SX.row}><span style={SX.k}>generaPlanoMontajeTba()</span><span style={SX.v}>valida + engine</span></div>
          <div style={SX.row}><span style={SX.k}>irATba()</span><span style={SX.v}>navega</span></div>
        </div>
      </div>

      {/* Árbol — llena_arbol() */}
      <div style={SX.card}>
        <div style={SX.title}>
          llena_arbol() ← obtener_tbas_diseno() — display_tree + styled_string
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={SX.empty}>No hay TBAs en el diseño activo</div>
          ) : (
            items.map(it => (
              <TbaRow
                key={it.elemento['user!_identificador']}
                item={it}
                checked={it.check}
                onToggle={() => handleToggle(it.elemento['user!_identificador'])}
                onSelect={() => setSelectedId(it.elemento['user!_identificador'])}
                selected={selectedId === it.elemento['user!_identificador']}
              />
            ))
          )}
        </div>
      </div>

      {/* Botones — activate_in(p_frame) */}
      <div style={SX.card}>
        <div style={SX.title}>activate_in(p_frame) — button_items</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleGenerarPlano} style={{ ...SX.btn, background: '#89b4fa', color: '#1e1e2e' }}>
            Generar Plano Montaje TBA
          </button>
          <button onClick={handleIrATba} style={{ ...SX.btn, background: '#a6e3a1', color: '#1e1e2e' }}>
            Ir a TBA
          </button>
          <button onClick={handleCancelar} style={{ ...SX.btn, background: '#45475a', color: '#cdd6f4' }}>
            Salir
          </button>
        </div>
      </div>

      {/* Feedback */}
      {lastResult && (
        <div style={{ ...SX.card, borderLeft: '3px solid #a6e3a1' }}>
          <div style={{ color: '#a6e3a1', fontSize: 11 }}>{lastResult}</div>
        </div>
      )}
      {lastError && (
        <div style={{ ...SX.card, borderLeft: '3px solid #f38ba8' }}>
          <div style={{ color: '#f38ba8', fontSize: 11 }}>{lastError}</div>
        </div>
      )}

      {/* Inspector — selected() */}
      {selectedItem && (
        <div style={SX.card}>
          <div style={SX.title}>selected(p_selection) — detalle del TBA</div>
          {(['user!_identificador', 'user!_tipo', 'spec_id', 'user!_fibras_opticas', 'user!_ubicacion', 'construction_status'] as const).map(k => (
            <div key={k} style={SX.row}>
              <span style={SX.k}>{k}</span>
              <span style={selectedItem.elemento[k] ? SX.v : SX.empty}>
                {selectedItem.elemento[k] ?? '— (_unset)'}
              </span>
            </div>
          ))}
          <div style={{ ...SX.row, marginTop: 4 }}>
            <span style={SX.k}>styled_string.valor</span>
            <span style={{ color: '#6c7086', fontSize: 10 }}>{selectedItem.valor}</span>
          </div>
        </div>
      )}

      {/* Equivalencias Magik → TS */}
      <div style={SX.card}>
        <div style={SX.title}>Equivalencias aplicadas</div>
        <table style={SX.table}>
          <thead>
            <tr><th style={SX.th}>Magik</th><th style={SX.th}>→</th><th style={SX.th}>TypeScript</th></tr>
          </thead>
          <tbody>
            {[
              ['tree_item', 'div + checkbox custom'],
              ['button_item', '<button> MUI Button (simulado)'],
              ['display_tree + styled_string', 'TbaDisplayItem { elemento, valor, check, estatus }'],
              ['property_list.new_with(...)', 'objeto literal { elemento, valor, check }'],
              ['rope.new()', 'Array / []'],
              ['fast_elements()', 'for...of / .filter() / .map()'],
              ['condition.raise', 'throw new Error()'],
              ['_unset', 'undefined'],
              ['predicate.within (spatial)', 'stub (mock data)'],
              ['_clone.init() → new()', 'constructor (D2)'],
            ].map(([magik, ts]) => (
              <tr key={magik}>
                <td style={{ ...SX.td, color: '#f9e2af' }}>{magik}</td>
                <td style={{ ...SX.td, color: '#585b70' }}>→</td>
                <td style={{ ...SX.td, color: '#89dceb' }}>{ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
