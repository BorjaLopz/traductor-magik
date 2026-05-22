/**
 * Migración de: style_symbol_open_dialog.magik
 * Clase Magik:  style_symbol_open_dialog  —  package sw
 *
 * Método draw_preview: limpia el canvas de previsualización y, si se
 * proporcionó un nombre de símbolo, lo busca en la tabla de estilos de
 * puntos GIS (gis_point_style), lo realiza (carga sus geometrías) y dibuja
 * una muestra con rotate=0, flipped=true, mirror=false.
 *
 * NOTA: Las geometrías reales de Smallworld (gis_point_style) no existen en
 * TS. Se representan mediante SymbolDefinition con forma + colores + tamaño.
 * La tabla de estilos se abstrae en SymbolStyleService.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Formas de símbolo soportadas — equivalen a los gis_point_style de Smallworld. */
export type SymbolShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'cross';

/**
 * Definición de un símbolo de punto GIS.
 * Magik: registro de la colección :sw_gis!gis_point_style.
 *   sym.symbol_name  → symbolName
 *   sym.actual_geoms → hasActualGeoms  (_unset cuando el símbolo no cargó)
 */
export interface SymbolDefinition {
  symbolName:     string;
  shape:          SymbolShape;
  fillColor:      string;
  strokeColor:    string;
  size:           number;
  hasActualGeoms: boolean;   // sym.actual_geoms _isnt _unset
}

/** Parámetros de dibujo pasados a draw_sample en Magik. */
export interface DrawSampleParams {
  rotate:   number;   // :rotate   → 0.0 en el original
  flipped:  boolean;  // :flipped? → _true  (Y invertida: coordenadas GIS → pantalla)
  mirror:   boolean;  // :mirror?  → _false
}

// =============================================================================
// INTERFAZ SymbolStyleService
// Abstrae la doble fuente del Magik:
//   .owner.sigc_style_view.collection(:sw_gis!gis_point_style)  ← proyecto
//   gis_program_manager.style_view.collection(...)               ← global
// =============================================================================

export interface SymbolStyleService {
  /**
   * Magik: point_style_table.new_detached_record()
   *         sym.symbol_name << symbol_name
   *         sym.realise(_unset, _unset)
   *
   * TS: resuelve el símbolo por nombre y devuelve su definición o undefined.
   */
  getSymbol(symbolName: string): SymbolDefinition | undefined;

  /** Lista de nombres disponibles — para el selector del demo. */
  listSymbolNames(): string[];
}

// =============================================================================
// MOCK SymbolStyleService — sustituye a gis_program_manager.style_view
// =============================================================================

const MOCK_SYMBOLS: SymbolDefinition[] = [
  { symbolName: 'PUNTO_NODO',      shape: 'circle',   fillColor: '#1565C0', strokeColor: '#0D47A1', size: 14, hasActualGeoms: true  },
  { symbolName: 'EMPALME',         shape: 'diamond',  fillColor: '#E65100', strokeColor: '#BF360C', size: 16, hasActualGeoms: true  },
  { symbolName: 'CÁMARA',          shape: 'square',   fillColor: '#2E7D32', strokeColor: '#1B5E20', size: 14, hasActualGeoms: true  },
  { symbolName: 'SEÑAL_RF',        shape: 'triangle', fillColor: '#F9A825', strokeColor: '#E65100', size: 16, hasActualGeoms: true  },
  { symbolName: 'ANTENA',          shape: 'star',     fillColor: '#6A1B9A', strokeColor: '#4A148C', size: 18, hasActualGeoms: true  },
  { symbolName: 'CRUCE_VIAL',      shape: 'cross',    fillColor: '#C62828', strokeColor: '#B71C1C', size: 16, hasActualGeoms: true  },
  { symbolName: 'SIN_GEOMETRIA',   shape: 'circle',   fillColor: '#ccc',   strokeColor: '#999',   size: 14, hasActualGeoms: false },
];

export const mockSymbolStyleService: SymbolStyleService = {
  getSymbol: (name) => MOCK_SYMBOLS.find(s => s.symbolName === name),
  listSymbolNames: () => MOCK_SYMBOLS.map(s => s.symbolName),
};

// =============================================================================
// FUNCIÓN DRAW — equivale a sym.draw_sample(canvas, bounds, params)
// =============================================================================

/**
 * Magik: sym.draw_sample(.preview_canvas, _self.canvas_bounds,
 *            :rotate, 0.0,
 *            :flipped?, _true,
 *            :mirror?, _false )
 *
 * TS: dibuja la forma sobre el contexto Canvas con las mismas opciones.
 *
 * flipped=true → aplica scale(1,-1) para invertir Y
 *                (GIS coords: Y crece hacia arriba; Canvas: Y crece hacia abajo)
 * mirror=false → sin transformación horizontal adicional
 * rotate       → rotación en radianes
 */
export function drawSample(
  ctx    : CanvasRenderingContext2D,
  bounds : { width: number; height: number },
  sym    : SymbolDefinition,
  params : DrawSampleParams,
): void {
  const { width, height } = bounds;
  const cx = width  / 2;
  const cy = height / 2;
  const r  = sym.size / 2;

  ctx.save();

  // Trasladar al centro del canvas
  ctx.translate(cx, cy);

  // :rotate — rotación (0.0 en el original Magik)
  if (params.rotate !== 0) ctx.rotate(params.rotate);

  // :flipped? _true → invertir eje Y (coords GIS → coords pantalla)
  if (params.flipped)  ctx.scale(1, -1);

  // :mirror? _false → sin inversión horizontal (no se aplica en el original)
  if (params.mirror)   ctx.scale(-1, 1);

  ctx.fillStyle   = sym.fillColor;
  ctx.strokeStyle = sym.strokeColor;
  ctx.lineWidth   = 2;

  ctx.beginPath();

  switch (sym.shape) {
    case 'circle':
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;

    case 'square':
      ctx.rect(-r, -r, sym.size, sym.size);
      break;

    case 'triangle': {
      // Triángulo equilátero apuntando hacia arriba (en coord GIS → abajo en pantalla con flip)
      const h = r * Math.sqrt(3);
      ctx.moveTo(0,  -r);
      ctx.lineTo( h / 2,  r / 2);
      ctx.lineTo(-h / 2,  r / 2);
      ctx.closePath();
      break;
    }

    case 'diamond':
      ctx.moveTo( 0, -r * 1.2);
      ctx.lineTo( r, 0);
      ctx.lineTo( 0,  r * 1.2);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      break;

    case 'star': {
      // Estrella de 5 puntas
      const outerR = r;
      const innerR = r * 0.45;
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerR : innerR;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }

    case 'cross': {
      const arm = r * 0.35;
      ctx.rect(-r,    -arm, sym.size, arm * 2);
      ctx.rect(-arm,  -r,   arm * 2,  sym.size);
      break;
    }
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class StyleSymbolOpenDialog {

  // .preview_canvas → referencia al HTMLCanvasElement
  private previewCanvas: HTMLCanvasElement | null = null;

  // Abstracción de la tabla de estilos GIS (gis_program_manager.style_view o sigc_style_view)
  private service: SymbolStyleService;

  // Parámetros fijos del método Magik original
  private readonly drawParams: DrawSampleParams = {
    rotate:  0.0,   // :rotate  0.0
    flipped: true,  // :flipped? _true
    mirror:  false, // :mirror?  _false
  };

  constructor(service: SymbolStyleService = mockSymbolStyleService) {
    this.service = service;
  }

  /** Conecta el HTMLCanvasElement (equivale a .preview_canvas en Magik). */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.previewCanvas = canvas;
  }

  /**
   * Magik: style_symbol_open_dialog.draw_preview(symbol_name)
   *
   * 1. .preview_canvas.clear()
   * 2. _if symbol_name _isnt _unset
   * 3.   point_style_table << ... .collection(:sw_gis!gis_point_style)
   * 4.   sym << point_style_table.new_detached_record()
   * 5.   sym.symbol_name << symbol_name
   * 6.   sym.realise(_unset, _unset)
   * 7.   _if sym.actual_geoms _isnt _unset → sym.draw_sample(...)
   */
  drawPreview(symbolName: string | null): void {
    if (!this.previewCanvas) return;

    const ctx    = this.previewCanvas.getContext('2d');
    if (!ctx) return;
    const bounds = { width: this.previewCanvas.width, height: this.previewCanvas.height };

    // 1. .preview_canvas.clear()
    ctx.clearRect(0, 0, bounds.width, bounds.height);

    // 2. _if symbol_name _isnt _unset
    if (symbolName === null || symbolName === undefined) return;

    // 3-6. point_style_table.new_detached_record() + sym.symbol_name + sym.realise()
    //      → service.getSymbol abstrae los 3 pasos
    const sym = this.service.getSymbol(symbolName);

    // 7. _if sym.actual_geoms _isnt _unset
    if (!sym || !sym.hasActualGeoms) return;

    // sym.draw_sample(.preview_canvas, canvas_bounds, :rotate 0.0, :flipped? _true, :mirror? _false)
    drawSample(ctx, bounds, sym, this.drawParams);
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// Selector de nombre de símbolo → preview en canvas + ficha de propiedades.
// =============================================================================

interface Props {
  service?: SymbolStyleService;
  canvasSize?: number;
}

export function StyleSymbolOpenDialogUI({
  service   = mockSymbolStyleService,
  canvasSize = 120,
}: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const dialogRef  = useRef<StyleSymbolOpenDialog | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [symDef,   setSymDef]   = useState<SymbolDefinition | null>(null);

  // Inicializar clase al montar (equivale a new_with del Smallworld)
  useEffect(() => {
    dialogRef.current = new StyleSymbolOpenDialog(service);
    if (canvasRef.current) {
      dialogRef.current.setCanvas(canvasRef.current);
    }
    // Limpiar canvas en mount (preview_canvas.clear())
    dialogRef.current.drawPreview(null);
  }, [service]);

  // draw_preview cada vez que cambia el símbolo seleccionado
  const handleSelect = useCallback((name: string) => {
    setSelected(name);
    setSymDef(name ? (service.getSymbol(name) ?? null) : null);
    dialogRef.current?.drawPreview(name || null);
  }, [service]);

  const names = service.listSymbolNames();

  return (
    <div style={s.frame}>
      <h3 style={s.title}>style_symbol_open_dialog — Preview de símbolo GIS</h3>

      <div style={s.body}>
        {/* Selector de symbol_name */}
        <div style={s.left}>
          <p style={s.lbl}>symbol_name</p>
          <div style={s.list}>
            {names.map(name => (
              <div
                key={name}
                style={{ ...s.item, background: selected === name ? '#2E4057' : '#f5f5f5', color: selected === name ? '#fff' : '#333' }}
                onClick={() => handleSelect(name)}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Preview canvas — equivale a .preview_canvas */}
        <div style={s.right}>
          <p style={s.lbl}>preview_canvas</p>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={s.canvas}
          />

          {/* Ficha del símbolo (propiedades del registro gis_point_style) */}
          {symDef && (
            <table style={s.table}>
              <tbody>
                {[
                  ['symbol_name',    symDef.symbolName],
                  ['shape',          symDef.shape],
                  ['fillColor',      symDef.fillColor],
                  ['strokeColor',    symDef.strokeColor],
                  ['size',           symDef.size],
                  ['actual_geoms',   symDef.hasActualGeoms ? '✓ definidas' : '✗ _unset'],
                ].map(([k, v]) => (
                  <tr key={String(k)}>
                    <td style={s.td}>{k}</td>
                    <td style={s.td}>
                      {k === 'fillColor' || k === 'strokeColor'
                        ? <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:12, height:12, background: String(v), border:'1px solid #ccc', display:'inline-block' }} />
                            <code>{v}</code>
                          </span>
                        : <code>{v}</code>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!selected && (
            <p style={s.hint}>Selecciona un símbolo para ver el preview.</p>
          )}
        </div>
      </div>

      {/* Parámetros draw_sample fijos del original Magik */}
      <div style={s.params}>
        <strong>Parámetros draw_sample (fijos en Magik):</strong>
        <span style={s.tag}>rotate: 0.0</span>
        <span style={s.tag}>flipped: true</span>
        <span style={s.tag}>mirror: false</span>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame  : { display:'flex', flexDirection:'column', gap:12, width:520, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title  : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  body   : { display:'flex', gap:16 },
  left   : { display:'flex', flexDirection:'column', gap:4, minWidth:170 },
  right  : { display:'flex', flexDirection:'column', gap:8, flex:1 },
  lbl    : { margin:0, fontSize:11, color:'#888', fontWeight:'bold' },
  list   : { display:'flex', flexDirection:'column', gap:2 },
  item   : { padding:'5px 10px', borderRadius:3, cursor:'pointer', fontSize:12, userSelect:'none' as const },
  canvas : { border:'2px solid #ddd', borderRadius:4, background:'#fafafa', display:'block' },
  table  : { width:'100%', borderCollapse:'collapse' as const },
  td     : { padding:'3px 8px', borderBottom:'1px solid #eee', fontSize:11 },
  hint   : { color:'#aaa', fontSize:11, margin:0 },
  params : { display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' as const, background:'#fff3cd', padding:'6px 10px', borderRadius:4, fontSize:11 },
  tag    : { background:'#2E4057', color:'#fff', padding:'2px 7px', borderRadius:10, fontSize:11 },
};

export default StyleSymbolOpenDialogUI;
