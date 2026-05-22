/**
 * Migración de: c_plano_ruta_de_cables.magik
 * Clase Magik:  c_plano_ruta_de_cables  —  SIGTAO SOFTWARE / vnguzman / 2006-05-18
 * Hereda:       layout_element, viewport_layout_mixin
 *
 * Compositor de la página de plano "Ruta de cables".
 * Inicializa la aplicación GIS (.app) y ensamble la página con:
 *   CMarco + CPep + CSelloEstandarCtlEdo.
 *
 * NOTA IMPORTANTE: el cuerpo de genera_plano() está completamente comentado
 * en el Magik original. La implementación TS reconstruye la intención a partir
 * de ese código comentado, preservando tipos, coordenadas y nombres de elementos.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS — equivalencias de Smallworld
// =============================================================================

/**
 * Magik: bounding_box.new(x1, y1, x2, y2)
 * Caja delimitadora en unidades de plano (250 u.p. = 1 pulgada según LnPulgada).
 */
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const bbox = (x1: number, y1: number, x2: number, y2: number): BoundingBox =>
  ({ x1, y1, x2, y2 });

export const bboxW = (b: BoundingBox) => b.x2 - b.x1;
export const bboxH = (b: BoundingBox) => b.y2 - b.y1;

/** Magik: layout_attribute_definition */
export interface AttributeDefinition {
  name:        string;
  type:        string;
  description: string;
}

/** Base común para elementos de página de layout. */
export interface LayoutElement {
  type:   string;
  bounds: BoundingBox;
}

/** Magik: layout_page — colección de elementos */
export interface LayoutPage {
  elements: LayoutElement[];
}

/** Magik: layout_document */
export interface LayoutDocument {
  name:          string;
  userTipoPlano: string;    // LoDoc.user!_tipo_plano << :ruta_cables
  currentPage:   LayoutPage;
}

// =============================================================================
// STUBS DE ELEMENTOS DE PÁGINA
// =============================================================================

/**
 * Magik: c_marco.new_with(:bounds, bounding_box.new(0,0,1,1))
 *   .Largo << 6   .Alto << 3   .set_fill_colour(_unset)
 * Marco/borde del plano. Largo/Alto en alguna unidad (probablemente pulgadas).
 */
export interface CMarcoConfig extends LayoutElement {
  type:      'marco';
  largo:     number;         // .Largo << 6
  alto:      number;         // .Alto  << 3
  fillColor: string | null;  // .set_fill_colour(_unset) → sin relleno
}

/**
 * Magik: c_pep.new_with(:bounds, bounding_box.new(450,500,450+880,500+910))
 * Sello PEP (Plano de Expansión de Planta). Tamaño 880×910 u.p.
 */
export interface CPepConfig extends LayoutElement {
  type: 'pep';
}

/**
 * Magik: c_sello_estandar_ctl_edo.new_with(:bounds, bounding_box.new(250,250,3000,2990))
 * Sello estándar Control de Estado — variante de [10] c_sello_estandar.
 * Tamaño: 2750×2740 u.p. (≈ 11×10.96 pulgadas con LnPulgada=250).
 */
export interface CSelloEstandarCtlEdoConfig extends LayoutElement {
  type: 'sello_estandar_ctl_edo';
}

// =============================================================================
// SERVICIO DE APLICACIÓN — abstrae smallworld_product.pni_application()
// =============================================================================

export interface AppService {
  name: string;
}

export const defaultAppService: AppService = { name: 'pni_application' };

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CPlanoRutaDeCables {

  /** Magik: slot .app << smallworld_product.pni_application() */
  private app: AppService;

  /**
   * Magik: c_plano_ruta_de_cables.init()
   *   .app << smallworld_product.pni_application()
   *   >> _self
   *
   * El patrón _clone.init() de Magik separa creación (new) de inicialización (init).
   * En TS ambas se unifican en el constructor estándar.
   */
  constructor(app: AppService = defaultAppService) {
    this.app = app;
  }

  /**
   * Magik: c_plano_ruta_de_cables.new()  →  >> _clone.init()
   * Factory estático — conserva la semántica del new() de Magik.
   */
  static new(app?: AppService): CPlanoRutaDeCables {
    return new CPlanoRutaDeCables(app);
  }

  /**
   * Magik: c_plano_ruta_de_cables.defined_attributes
   *
   *   attribs << rope.new_from(_super.defined_attributes)
   *   attribs.add(_self.viewport_attribute_definition)
   *   >> attribs
   *
   * _super.defined_attributes  → atributos de layout_element (bounds, visible…)
   * viewport_attribute_definition → vincula el elemento con una vista GIS del mapa
   *   (viewport_layout_mixin añade este atributo para zoom/encuadre automático)
   */
  static definedAttributes(): AttributeDefinition[] {
    return [
      // _super.defined_attributes — layout_element base attributes
      { name: 'bounds',   type: 'bounding_box', description: 'Límites del elemento en el plano' },
      { name: 'visible',  type: 'boolean',      description: 'Visibilidad del elemento'         },
      // viewport_layout_mixin.viewport_attribute_definition
      { name: 'viewport', type: 'viewport',     description: 'Vista GIS vinculada al plano'     },
    ];
  }

  /**
   * Magik: c_plano_ruta_de_cables.genera_plano()
   *
   * NOTA: El cuerpo completo está comentado en el Magik original.
   * Se reconstruye la intención desde el código comentado:
   *
   *   // LoLayoutDesigner << .app.plugin(:layout_plugin).start_layout_designer()
   *   // LoLayoutManager  << LoLayoutDesigner.plugin(:layout_manager)
   *   // LoDoc            << LoLayoutManager.current_document
   *   // LoPagina         << LoDoc.current_page
   *   // _if LoPagina.elements.size > 0 → LoPagina.elements.empty()
   *   // LoDoc.name             << "Plano ruta de cables"
   *   // LoDoc.user!_tipo_plano << :ruta_cables
   *
   *   // LoMarco = c_marco.new_with(:bounds, bounding_box.new(0,0,1,1))
   *   //   .Largo << 6  .Alto << 3  .set_fill_colour(_unset)
   *   // LoPagina.add_element(LoMarco)
   *
   *   // LoSelloPep = c_pep.new_with(:bounds, bounding_box.new(450,500,450+880,500+910))
   *   // LoPagina.add_element(LoSelloPep)
   *
   *   // LnPulgada = 250   ← factor: 250 u.p. = 1 pulgada
   *   // LoSelloEstandar = c_sello_estandar_ctl_edo.new_with(:bounds,
   *   //   bounding_box.new(250,250,3000,2990))
   *   // LoPagina.add_element(LoSelloEstandar)
   */
  generaPlano(): LayoutDocument {
    const page: LayoutPage = { elements: [] };

    // ── Marco ─────────────────────────────────────────────────────────────────
    // c_marco.new_with(:bounds, bounding_box.new(0,0,1,1))
    // .Largo << 6  .Alto << 3  .set_fill_colour(_unset)
    // bounds(0,0,1,1) es placeholder; el tamaño real lo definen Largo y Alto
    const marco: CMarcoConfig = {
      type:      'marco',
      bounds:    bbox(0, 0, 1, 1),
      largo:     6,
      alto:      3,
      fillColor: null,   // set_fill_colour(_unset) → sin relleno
    };
    page.elements.push(marco);

    // ── Sello PEP ─────────────────────────────────────────────────────────────
    // c_pep.new_with(:bounds, bounding_box.new(450, 500, 450+880, 500+910))
    const pep: CPepConfig = {
      type:   'pep',
      bounds: bbox(450, 500, 450 + 880, 500 + 910),   // → (450,500,1330,1410)
    };
    page.elements.push(pep);

    // ── Sello Estándar CTL-EDO ────────────────────────────────────────────────
    // LnPulgada = 250  (250 unidades de plano = 1 pulgada)
    // c_sello_estandar_ctl_edo.new_with(:bounds, bounding_box.new(250,250,3000,2990))
    const selloEstandar: CSelloEstandarCtlEdoConfig = {
      type:   'sello_estandar_ctl_edo',
      bounds: bbox(250, 250, 3000, 2990),
    };
    page.elements.push(selloEstandar);

    // LoDoc.name << "Plano ruta de cables"
    // LoDoc.user!_tipo_plano << :ruta_cables
    return {
      name:          'Plano ruta de cables',
      userTipoPlano: 'ruta_cables',
      currentPage:   page,
    };
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

/** Paleta visual por tipo de elemento */
const ELEMENT_STYLE: Record<string, { fill: string; stroke: string; label: string }> = {
  marco:                 { fill: 'none',    stroke: '#2E4057', label: 'Marco'         },
  pep:                   { fill: '#E8F4FD', stroke: '#1565C0', label: 'Sello PEP'     },
  sello_estandar_ctl_edo:{ fill: '#E8F5E9', stroke: '#2E7D32', label: 'Sello CTL-EDO' },
};

/** Factor de conversión: 250 u.p. = 1 pulgada */
const LN_PULGADA = 250;

export function PlanoRutaDeCablesUI() {
  const [doc, setDoc] = useState<LayoutDocument | null>(null);

  const generar = () => {
    const inst = CPlanoRutaDeCables.new();
    setDoc(inst.generaPlano());
  };

  const attrDefs = CPlanoRutaDeCables.definedAttributes();

  // Escala para la vista previa: ajusta todo el contenido (0..3000 × 0..2990)
  // a un viewport de 420 × 418 px
  const MAX_U = 3200;
  const VP_PX = 420;
  const SCALE = VP_PX / MAX_U;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_plano_ruta_de_cables — Compositor de plano</h3>

      <button style={s.btn} onClick={generar}>genera_plano()</button>

      {doc && (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>

          {/* Vista previa del layout */}
          <div>
            <p style={s.subtitle}>Layout preview — "{doc.name}"</p>
            <svg
              width={VP_PX} height={VP_PX}
              style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block' }}
            >
              {doc.currentPage.elements.map((el, i) => {
                const es = ELEMENT_STYLE[el.type] ?? { fill: '#eee', stroke: '#999', label: el.type };

                // Marco usa Largo/Alto en lugar de bounds
                if (el.type === 'marco') {
                  const m = el as CMarcoConfig;
                  // Largo=6 pulgadas, Alto=3 pulgadas → en u.p.
                  const wUp = m.largo * LN_PULGADA;   // 1500 u.p.
                  const hUp = m.alto  * LN_PULGADA;   // 750 u.p.
                  return (
                    <g key={i}>
                      <rect
                        x={0} y={0}
                        width={wUp * SCALE} height={hUp * SCALE}
                        fill={es.fill} stroke={es.stroke} strokeWidth={1.5}
                        strokeDasharray="6,3"
                      />
                      <text x={4} y={12} fontSize={9} fill={es.stroke}>
                        {es.label} {m.largo}"×{m.alto}" ({wUp}×{hUp} u.p.)
                      </text>
                    </g>
                  );
                }

                const x = el.bounds.x1 * SCALE;
                const y = el.bounds.y1 * SCALE;
                const w = bboxW(el.bounds) * SCALE;
                const h = bboxH(el.bounds) * SCALE;
                return (
                  <g key={i}>
                    <rect
                      x={x} y={y} width={w} height={h}
                      fill={es.fill} stroke={es.stroke} strokeWidth={1.5}
                    />
                    <text x={x + 4} y={y + 12} fontSize={9} fill={es.stroke} fontWeight="bold">
                      {es.label}
                    </text>
                    <text x={x + 4} y={y + 23} fontSize={8} fill="#888">
                      ({el.bounds.x1},{el.bounds.y1})→({el.bounds.x2},{el.bounds.y2})
                    </text>
                    <text x={x + 4} y={y + 34} fontSize={8} fill="#888">
                      {bboxW(el.bounds)}×{bboxH(el.bounds)} u.p.
                      {' '}(≈{(bboxW(el.bounds)/LN_PULGADA).toFixed(1)}"×{(bboxH(el.bounds)/LN_PULGADA).toFixed(1)}")
                    </text>
                  </g>
                );
              })}

              {/* Regla: LnPulgada */}
              <line x1={4} y1={VP_PX - 8} x2={4 + LN_PULGADA * SCALE} y2={VP_PX - 8}
                stroke="#888" strokeWidth={1} />
              <text x={4} y={VP_PX - 11} fontSize={8} fill="#888">
                1" = {LN_PULGADA} u.p.
              </text>
            </svg>
            <p style={s.meta}>
              tipo_plano: <code>{doc.userTipoPlano}</code>
              {' | '}app: <code>{defaultAppService.name}</code>
              {' | '}{doc.currentPage.elements.length} elementos
            </p>
          </div>

          {/* Tabla de elementos */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={s.subtitle}>Elementos de página</p>
            <table style={s.table}>
              <thead>
                <tr>{['#','type','bounds (u.p.)','tamaño','extras'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {doc.currentPage.elements.map((el, i) => {
                  const m = el as CMarcoConfig;
                  const boundsStr = el.type === 'marco'
                    ? 'bbox(0,0,1,1)*'
                    : `(${el.bounds.x1},${el.bounds.y1})→(${el.bounds.x2},${el.bounds.y2})`;
                  const size = el.type === 'marco'
                    ? `${m.largo * LN_PULGADA}×${m.alto * LN_PULGADA}`
                    : `${bboxW(el.bounds)}×${bboxH(el.bounds)}`;
                  const extras = el.type === 'marco'
                    ? `Largo=${m.largo}" Alto=${m.alto}" fill=${m.fillColor ?? '_unset'}`
                    : el.type === 'pep'
                    ? `PEP stamp`
                    : `CTL-EDO stamp [10]`;
                  return (
                    <tr key={i}>
                      <td style={s.td}>{i + 1}</td>
                      <td style={s.td}><code style={{ fontSize: 10 }}>{el.type}</code></td>
                      <td style={{ ...s.td, fontSize: 10 }}>{boundsStr}</td>
                      <td style={{ ...s.td, fontSize: 10 }}>{size}</td>
                      <td style={{ ...s.td, fontSize: 10, color: '#555' }}>{extras}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ ...s.meta, marginTop: 4 }}>* bounds(0,0,1,1) es placeholder; tamaño real = Largo×Alto</p>

            {/* defined_attributes */}
            <p style={{ ...s.subtitle, marginTop: 12 }}>defined_attributes</p>
            <table style={s.table}>
              <thead>
                <tr>{['name','type','description'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {attrDefs.map(d => (
                  <tr key={d.name}>
                    <td style={s.td}><code>{d.name}</code></td>
                    <td style={{ ...s.td, color: '#2E4057' }}><code>{d.type}</code></td>
                    <td style={{ ...s.td, fontSize: 10, color: '#555' }}>{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota sobre el código comentado */}
      {!doc && (
        <div style={s.note}>
          <strong>Nota:</strong> el cuerpo de <code>genera_plano()</code> está completamente
          comentado en el Magik original. Pulsa el botón para ver la implementación
          reconstruida a partir del código comentado.
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame   : { display:'flex', flexDirection:'column', gap:12, width:720, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title   : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle: { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta    : { margin:'4px 0 0', fontSize:10, color:'#888' },
  btn     : { alignSelf:'flex-start', padding:'6px 16px', background:'#2E4057', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' },
  table   : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th      : { background:'#2E4057', color:'#fff', padding:'4px 6px', textAlign:'left' as const, fontSize:10 },
  td      : { padding:'3px 6px', borderBottom:'1px solid #eee', fontSize:11 },
  note    : { background:'#fff3cd', border:'1px solid #ffc107', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#555' },
};

export default PlanoRutaDeCablesUI;
