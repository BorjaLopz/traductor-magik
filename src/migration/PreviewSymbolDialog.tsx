/**
 * Migration: c_preview_symbol_dialog.magik → PreviewSymbolDialog.tsx
 *
 * Dialog for browsing, previewing, and inserting GIS point symbols
 * into the active layout-designer page.
 *
 * Magik concepts replaced:
 *   canvas widget              → HTML5 <canvas> via useRef
 *   tree_item                  → scrollable <div> list
 *   button_item (enabled?)     → <button disabled={!selected}>
 *   sw_style_system_engine     → MOCK_SYMBOL_NAMES array
 *   gis_program_manager.style_view.collection(:sw_gis!gis_point_style) → drawSymbolPreview()
 *   bounding_box               → BoundingBox interface
 *   LoPagina.add_element()     → pageElements React state
 *   databus.make_data_available → onInsert callback prop
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SymbolLayoutItem {
  bounds      : BoundingBox;
  name        : string;
  fillStyle?  : string;
  outlineStyle?: string;
}

// ── Constants (= Magik define_shared_constant) ────────────────────────────────

// c_preview_symbol_dialog.canvas_size = 210
const CANVAS_SIZE = 210;

// Symbol size in layout-page units (Magik: bounding_box.new(0,0,600,600))
const SYMBOL_BOUNDS_SIZE = 600;

// ── Mock data (= sw_style_system_engine.ordered_symbol_names()) ───────────────

const MOCK_SYMBOL_NAMES: string[] = [
  'SW_CIRCLE',
  'SW_SQUARE',
  'SW_TRIANGLE',
  'SW_DIAMOND',
  'SW_STAR',
  'SW_CROSS',
  'SW_ARROW_UP',
  'SW_ARROW_DOWN',
  'POLE_WOOD',
  'POLE_CONCRETE',
  'MANHOLE',
  'HANDHOLE',
  'SPLICE_CLOSURE',
  'TERMINAL_BLOCK',
  'CABLE_END',
  'JUNCTION_BOX',
];

// ── Canvas preview (replaces sym.draw_sample on Magik canvas) ─────────────────

function drawSymbolPreview(ctx: CanvasRenderingContext2D, symbolName: string): void {
  const size = CANVAS_SIZE;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.28;

  ctx.strokeStyle = '#2E4057';
  ctx.fillStyle   = '#4A90D9';
  ctx.lineWidth   = 2;
  ctx.beginPath();

  const n = symbolName.toUpperCase();

  if (n.includes('CIRCLE') || n.includes('MANHOLE') || n.includes('SPLICE')) {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('SQUARE') || n.includes('JUNCTION')) {
    ctx.rect(cx - r, cy - r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('TRIANGLE') || n.includes('TERMINAL')) {
    ctx.moveTo(cx,        cy - r);
    ctx.lineTo(cx + r,    cy + r);
    ctx.lineTo(cx - r,    cy + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('DIAMOND') || n.includes('HANDHOLE')) {
    ctx.moveTo(cx,     cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx,     cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('STAR')) {
    const outer = r;
    const inner = r * 0.4;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const rad   = i % 2 === 0 ? outer : inner;
      if (i === 0) ctx.moveTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle));
      else         ctx.lineTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('CROSS')) {
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.stroke();

  } else if (n.includes('ARROW_UP')) {
    ctx.moveTo(cx,         cy - r);
    ctx.lineTo(cx + r * 0.6, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.6, cy + r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('ARROW_DOWN')) {
    ctx.moveTo(cx,            cy + r);
    ctx.lineTo(cx + r * 0.6,  cy - r * 0.5);
    ctx.lineTo(cx - r * 0.6,  cy - r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (n.includes('POLE')) {
    // vertical mast + crossarm
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.moveTo(cx - r * 0.5, cy - r * 0.4);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.4);
    ctx.stroke();

  } else {
    // default: pentagon
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      else         ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Symbol name label at bottom of preview area
  ctx.fillStyle  = '#333';
  ctx.font       = '10px sans-serif';
  ctx.textAlign  = 'center';
  ctx.fillText(symbolName, cx, size - 8);
}

// ── Helper: compute next insertion bounds ─────────────────────────────────────

function nextBounds(elements: SymbolLayoutItem[]): BoundingBox {
  const half = SYMBOL_BOUNDS_SIZE / 2;

  if (elements.length === 0) {
    // First symbol → centre of mock page (10000×10000 units)
    // Magik: LoBound.centre << LoPagina.bounds.centre
    return { minX: 5000 - half, minY: 5000 - half, maxX: 5000 + half, maxY: 5000 + half };
  }

  // Subsequent symbols → offset right of last symbol
  // Magik: LoBound.centre << coordinate(LoUltimoSim.bounds.centre.x + LoUltimoSim.bounds.width, ...)
  const last   = elements[elements.length - 1];
  const lastCx = (last.bounds.minX + last.bounds.maxX) / 2;
  const lastCy = (last.bounds.minY + last.bounds.maxY) / 2;
  const width  = last.bounds.maxX - last.bounds.minX;
  return {
    minX: lastCx + width - half,
    minY: lastCy - half,
    maxX: lastCx + width + half,
    maxY: lastCy + half,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PreviewSymbolDialogProps {
  /** Replaces sw_style_system_engine.ordered_symbol_names() */
  symbolNames?: string[];
  /** Replaces databus.make_data_available + LoPagina.add_element */
  onInsert?: (symbolName: string, layout: SymbolLayoutItem) => void;
  /** Replaces _self.close() in wm_close */
  onClose?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PreviewSymbolDialogUI({
  symbolNames = MOCK_SYMBOL_NAMES,
  onInsert,
  onClose,
}: PreviewSymbolDialogProps) {
  const canvasRef                           = useRef<HTMLCanvasElement>(null);
  // .sNombreSimbolo (writable public slot)
  const [selectedName, setSelectedName]     = useState<string | null>(null);
  // Simulates LoPagina.all_elements_of(symbol_layout)
  const [pageElements, setPageElements]     = useState<SymbolLayoutItem[]>([]);
  const [statusMsg, setStatusMsg]           = useState('');

  // draw_preview: re-draws whenever selection changes
  // Magik: _self.draw_preview(symbol_name)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (selectedName) {
      drawSymbolPreview(ctx, selectedName);
    } else {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }, [selectedName]);

  // tree_item_select callback
  // Magik: .sNombreSimbolo << symbol_name  +  .ok_button.enabled? << _not selection.empty?
  const handleSelect = useCallback((name: string) => {
    setSelectedName(name);
    // Equivalent to: .owner_plugin.databus.make_data_available(:symbol_name, {...})
    console.log('[PreviewSymbolDialog] symbol_name =', name);
  }, []);

  // ok() — insert symbol_layout into page
  const handleOk = useCallback(() => {
    if (!selectedName) return;

    const bounds     = nextBounds(pageElements);
    const newSymbol: SymbolLayoutItem = {
      bounds,
      name        : selectedName,
      fillStyle   : undefined,
      outlineStyle: undefined,
    };

    // LoPagina.add_element(LoSimbolo) + layout_view_refresh
    setPageElements(prev => [...prev, newSymbol]);

    const cx = Math.round((bounds.minX + bounds.maxX) / 2);
    const cy = Math.round((bounds.minY + bounds.maxY) / 2);
    setStatusMsg(`"${selectedName}" insertado en (${cx}, ${cy})`);

    // databus equivalent: notify parent
    onInsert?.(selectedName, newSymbol);
  }, [selectedName, pageElements, onInsert]);

  // wm_close() — .sNombreSimbolo << ""  +  _self.close()
  const handleClose = useCallback(() => {
    setSelectedName(null);
    setStatusMsg('Diálogo cerrado.');
    onClose?.();
  }, [onClose]);

  // on_activation: refresh symbol list (here just re-render)
  // Magik: _self.changed(:display_trees, :renew)

  return (
    <div style={st.root}>
      <div style={st.body}>

        {/* preview_canvas — Magik: canvas.new(..., canvas_size, canvas_size) */}
        <div style={st.canvasCol}>
          <div style={st.colLabel}>Vista previa</div>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={st.canvas}
          />
        </div>

        {/* tree_item — Magik: tree_item.new(..., :aspect, :display_trees) */}
        <div style={st.listCol}>
          <div style={st.colLabel}>Símbolos disponibles</div>
          <div style={st.list}>
            {symbolNames.map(name => (
              <div
                key={name}
                style={{ ...st.item, ...(name === selectedName ? st.itemSel : {}) }}
                onClick={() => handleSelect(name)}
              >
                {name}
              </div>
            ))}
          </div>

          {/* button_item "Insertar" — enabled? depends on selection */}
          <div style={st.btnRow}>
            <button
              onClick={handleOk}
              disabled={!selectedName}
              style={{ ...st.btn, ...(!selectedName ? st.btnDis : st.btnOk) }}
            >
              Insertar
            </button>
            {/* button_item "Salir" */}
            <button onClick={handleClose} style={st.btn}>
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Layout page state — simulates LoPagina.all_elements_of(symbol_layout) */}
      {pageElements.length > 0 && (
        <div style={st.log}>
          <strong>Página — {pageElements.length} símbolo{pageElements.length > 1 ? 's' : ''} insertado{pageElements.length > 1 ? 's' : ''}:</strong>
          <ul style={st.logList}>
            {pageElements.map((el, i) => {
              const cx = Math.round((el.bounds.minX + el.bounds.maxX) / 2);
              const cy = Math.round((el.bounds.minY + el.bounds.maxY) / 2);
              return (
                <li key={i}>
                  [{i + 1}] <strong>{el.name}</strong> — centro ({cx}, {cy})
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {statusMsg && <div style={st.status}>{statusMsg}</div>}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  root    : { fontFamily: 'sans-serif', fontSize: 13 },
  body    : { display: 'flex', gap: 16, alignItems: 'flex-start' },
  canvasCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  listCol  : { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 },
  colLabel : { fontSize: 11, color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  canvas  : { border: '1px solid #bbb', borderRadius: 4, background: '#f9f9f9', display: 'block' },
  list    : { border: '1px solid #ccc', borderRadius: 4, height: 190, overflowY: 'auto', background: '#fff' },
  item    : { padding: '4px 10px', cursor: 'pointer', fontSize: 12, userSelect: 'none' },
  itemSel : { background: '#2E4057', color: '#fff' },
  btnRow  : { display: 'flex', gap: 8 },
  btn     : { padding: '5px 18px', borderRadius: 4, border: '1px solid #aaa', cursor: 'pointer', fontSize: 12 },
  btnOk   : { background: '#2E4057', color: '#fff', borderColor: '#2E4057' },
  btnDis  : { background: '#eee', color: '#999', cursor: 'not-allowed' },
  log     : { marginTop: 12, padding: 10, background: '#f0f4f8', borderRadius: 4, fontSize: 12 },
  logList : { margin: '4px 0', paddingLeft: 18 },
  status  : { marginTop: 8, color: '#2E4057', fontSize: 12, fontStyle: 'italic' },
};
