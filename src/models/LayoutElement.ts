// Source: adiciones_layout/source/layout_element.magik
//
// Extensión de la clase base layout_element (:sw). Define 9 atributos
// compartidos y añade serializadores / deserializadores entre objetos GIS
// y referencias {collection → id}.
//
// Métodos cubiertos:
//   - guardar_elementos_bd_gis / _landbase / _visibles    → GisRecord[]  → ElementRef[]
//   - obtener_elementos_bd_gis / _landbase / _visibles    → ElementRef[] → GisRecord[]
//   - TransformaCoordenada(area, coord, escala, segunda)  → coord transformada
//   - indicadores(...)                                    → construye c_style_y_viewport_layout
//
// La parte de indicadores se condensa en un helper que devuelve la config
// del estilo (no se dibuja en este modelo; el plano lo añadiría al page).

// =============================================================================
// ATRIBUTOS DEFINIDOS (define_shared_constant :defined_attributes)
// =============================================================================

export type AttributeType =
  | 'line_style'
  | 'fill_style'
  | 'boolean'
  | 'unset';

export interface LayoutAttributeSpec {
  name:                       string;
  type:                       AttributeType;
  description:                string;
  defaultValue:               unknown;
  allowedOnPropertiesPage?:   boolean;   // omitido = true
}

export const LAYOUT_ELEMENT_DEFINED_ATTRIBUTES: LayoutAttributeSpec[] = [
  { name: 'outline_style',          type: 'line_style', description: 'Renders the outline of the element',                 defaultValue: 'composite_line_style(line_style)' },
  { name: 'fill_style',             type: 'fill_style', description: 'When defined renders given style as background fill style', defaultValue: 'fill_style(colour=white)' },
  { name: 'shadow_style',           type: 'fill_style', description: 'Render a bottom right shadow',                       defaultValue: undefined },
  { name: 'locked',                 type: 'boolean',    description: 'Object locked or not',                               defaultValue: false, allowedOnPropertiesPage: false },
  { name: 'elementos_bd_gis',       type: 'unset',      description: 'Elementos Gis',                                      defaultValue: undefined, allowedOnPropertiesPage: false },
  { name: 'elementos_bd_lb',        type: 'unset',      description: 'Elementos Landbase',                                 defaultValue: undefined, allowedOnPropertiesPage: false },
  { name: 'elementos_modificados',  type: 'unset',      description: 'Elementos Modificados Plano',                        defaultValue: undefined, allowedOnPropertiesPage: false },
  { name: 'cedos',                  type: 'unset',      description: 'Cedos del plano',                                    defaultValue: undefined, allowedOnPropertiesPage: false },
  { name: 'agregar_cedos',          type: 'boolean',    description: 'Bandera que indica agregar cedos',                   defaultValue: true,      allowedOnPropertiesPage: false },
];

// =============================================================================
// TIPOS GIS
// =============================================================================

export interface GisRecord {
  id:               string;
  source_collection: string;
  // datos arbitrarios — sólo necesitamos id + collection para serializar
}

// Magik: cada elemento_bd es property_list { collection → id }
export type ElementRef = Record<string, string>;

export interface DatasetCollection {
  at(id: string): GisRecord | undefined;
}

export interface Dataset {
  collection(name: string): DatasetCollection | undefined;
}

// =============================================================================
// TRANSFORM / COORD
// =============================================================================

export interface Coordinate { x: number; y: number }
export interface BoundingBox { xmin: number; ymin: number; xmax: number; ymax: number; centre?: Coordinate }

export interface Transform {
  // Magik: transform — composición simple
  scaleX: number;
  scaleY: number;
  // Otras propiedades omitidas (rotación, traslación) — fuera del scope
}

export function transformScale(scaleX: number, scaleY: number): Transform {
  return { scaleX, scaleY };
}

export function applyTransform(c: Coordinate, t: Transform): Coordinate {
  return { x: c.x * t.scaleX, y: c.y * t.scaleY };
}

// =============================================================================
// IDENTIFICADORES DE CANVAS
// =============================================================================

export type AreaDibujoKind = 'canvas' | 'page' | 'other';
export interface AreaDibujo { kind: AreaDibujoKind }

// =============================================================================
// PARAMS de indicadores (c_style_y_viewport_layout)
// =============================================================================

export interface ViewportLike {
  transform: Transform;
  bounds:    BoundingBox;
}

export interface IndicadoresParams {
  poAreaDibujo:       AreaDibujo;
  poRegistro:         GisRecord & { coord: Coordinate };
  pyCampoGeom:        string;
  roViewport:         ViewportLike;
  pbTomaEnCuentaVP:   boolean;
  pbConLinea:         boolean;
  pbConPunta:         boolean;
  pnAncho:            number;
  pnAlto:             number;
  pnDistXp:           number;
  pnDistYp:           number;
  pbLineaAbajo:       boolean;
  paDiseno:           unknown[];
}

export interface StyleYViewportLayoutConfig {
  bounds:        BoundingBox;
  outlineStyle:  undefined;
  fillStyle:     undefined;
  usaViewport:   'Si' | 'No';
  conLinea:      'Si' | 'No';
  conPunta:      'Si' | 'No';
  derecho:       'Si' | 'No';
  loObjRel:      GisRecord;
  nIdObjRel:     string;
  lyCampoGeoObjRel: string;
  oVp:           ViewportLike;
  diseno:        unknown[];
}

// =============================================================================
// CLASE
// =============================================================================

export class LayoutElement {
  // Atributos (alineados con LAYOUT_ELEMENT_DEFINED_ATTRIBUTES)
  outline_style:        unknown   = 'composite_line_style(line_style)';
  fill_style:           unknown   = 'fill_style(colour=white)';
  shadow_style:         unknown   = undefined;
  locked:               boolean   = false;
  elementos_bd_gis:     ElementRef[] | undefined = undefined;
  elementos_bd_lb:      ElementRef[] | undefined = undefined;
  elementos_modificados: ElementRef[] | undefined = undefined;
  cedos:                unknown   = undefined;
  agregar_cedos:        boolean   = true;

  // Magik: define_shared_constant(:defined_attributes, ..., :public)
  static readonly definedAttributes: readonly LayoutAttributeSpec[] = LAYOUT_ELEMENT_DEFINED_ATTRIBUTES;

  // ─── Serializadores ─ rope[GisRecord] → ElementRef[] ─────────────────────
  private static serializa(records: readonly GisRecord[]): ElementRef[] {
    return records.map(r => ({ [r.source_collection]: r.id }));
  }

  guardarElementosBdGis(records: readonly GisRecord[]): void {
    this.elementos_bd_gis = LayoutElement.serializa(records);
  }
  guardarElementosBdLandbase(records: readonly GisRecord[]): void {
    this.elementos_bd_lb = LayoutElement.serializa(records);
  }
  guardarElementosVisibles(records: readonly GisRecord[]): void {
    this.elementos_modificados = LayoutElement.serializa(records);
  }

  // ─── Deserializadores ─ ElementRef[] → GisRecord[] ───────────────────────
  private static deserializa(refs: ElementRef[] | undefined, dataset: Dataset): GisRecord[] {
    if (!refs || refs.length === 0) return [];
    const out: GisRecord[] = [];
    for (const ref of refs) {
      for (const [collName, id] of Object.entries(ref)) {
        const coll = dataset.collection(collName);
        const rec  = coll?.at(id);
        if (rec) out.push(rec);
      }
    }
    return out;
  }

  obtenerElementosBdGis(modelitDataset: Dataset): GisRecord[] {
    return LayoutElement.deserializa(this.elementos_bd_gis, modelitDataset);
  }
  obtenerElementosBdLandbase(landbaseDataset: Dataset): GisRecord[] {
    return LayoutElement.deserializa(this.elementos_bd_lb, landbaseDataset);
  }
  obtenerElementosVisibles(modelitDataset: Dataset): GisRecord[] {
    return LayoutElement.deserializa(this.elementos_modificados, modelitDataset);
  }

  // Magik: TransformaCoordenada(area, coord, escala, segunda?)
  transformaCoordenada(
    area:             AreaDibujo,
    coord:            Coordinate,
    escala:           number,
    segundaTransform: Transform | undefined,
  ): Coordinate {
    let c = coord;
    if (area.kind === 'canvas') {
      c = applyTransform(c, transformScale(escala, escala));
    }
    if (segundaTransform !== undefined) {
      c = applyTransform(c, segundaTransform);
    }
    return c;
  }

  // Magik: indicadores(...) — construye la config del c_style_y_viewport_layout
  // sin añadirlo a una page (eso quedaría a cargo del cliente).
  //
  // BUG documentado del original: al final del método se sobrescribe
  //   con_punta << "No"  y  usa_viewport << "Si"  incondicionalmente.
  // Se respeta para fidelidad funcional.
  indicadores(p: IndicadoresParams): StyleYViewportLayoutConfig {
    const transGisVp = p.roViewport.transform;
    const areaVp     = p.roViewport.bounds;

    const coordPozoGis = p.poRegistro.coord;
    const coordPozoVp  = this.transformaCoordenada(p.poAreaDibujo, coordPozoGis, 0.1, transGisVp);

    let coordP2: Coordinate;
    if (p.pbConLinea) {
      coordP2 = p.pbLineaAbajo
        ? { x: areaVp.xmin + p.pnDistXp, y: areaVp.ymin - p.pnDistYp }
        : { x: areaVp.xmin + p.pnDistXp, y: areaVp.ymax + p.pnDistYp };
    } else {
      coordP2 = coordPozoVp;
    }

    // bounding_box.new(0,0, ancho, alto) → centrado en coordP2
    const halfW = p.pnAncho / 2;
    const halfH = p.pnAlto  / 2;
    const bounds: BoundingBox = {
      xmin: coordP2.x - halfW,
      ymin: coordP2.y - halfH,
      xmax: coordP2.x + halfW,
      ymax: coordP2.y + halfH,
      centre: coordP2,
    };

    const cfg: StyleYViewportLayoutConfig = {
      bounds,
      outlineStyle: undefined,
      fillStyle:    undefined,
      usaViewport:  p.pbTomaEnCuentaVP ? 'Si' : 'No',
      conLinea:     p.pbConLinea       ? 'Si' : 'No',
      conPunta:     p.pbConPunta       ? 'Si' : 'No',
      derecho:      coordP2.x >= coordPozoVp.x ? 'Si' : 'No',
      loObjRel:     p.poRegistro,
      nIdObjRel:    p.poRegistro.id,
      lyCampoGeoObjRel: p.pyCampoGeom,
      oVp:          p.roViewport,
      diseno:       p.paDiseno,
    };

    // BUG del original (líneas 231-232): sobreescribir incondicionalmente
    cfg.conPunta    = 'No';
    cfg.usaViewport = 'Si';

    return cfg;
  }
}
