// Source: adiciones_layout/source/planos/c_plano_topologico.magik
// Generates "Plano Topológico" (topological conduit map) on a layout page.
// Extends layout_element + viewport_layout_mixin (both GIS framework mixins).
// Orchestrates: underground routes, reservations, street names, distribution
// boxes (c_dto_pronostico), central symbols, and a c_sello_estandar stamp.
// All GIS rendering methods → Fase 5.

// ─── Domain types ─────────────────────────────────────────────────────────────

export type ConstructionStatus = 'OPERACION' | 'EXISTENTE' | 'PROYECTADO' | 'PLANEADO'
export type GeomKind           = 'chain' | 'point' | 'text'

export interface Coord2D { x: number; y: number }

export interface CableCobre {
  specId:             string
  constructionStatus: ConstructionStatus
}

export interface CableGIS {
  specId:             string
  constructionStatus: ConstructionStatus
  copperCable?:       CableCobre
}

export interface TramoGIS {
  sectors:  unknown   // sector_rope — GIS
  rwo: {
    constructionStatus: ConstructionStatus
    annotation1:        { stringBuffer: string }
    cables:             Iterable<CableGIS>
  }
}

export interface ReservaGIS {
  constructionStatus: ConstructionStatus
  route:              { sectors: unknown }
  locationSymb:       unknown
  'user!_cantidad_pares': number | undefined
}

export interface CalleGIS {
  'user!_nombre_calle'?: string
  'user!_anotacion'?:    unknown
}

// ─── Layout constants (layout units; 1 mm = 10 units) ─────────────────────────

export const SELLO_ALTO_U  = 150   // 15 mm
export const SELLO_ANCHO_U = 1900  // 190 mm
export const SELLO_X_U     = 300   // 30 mm
export const SELLO_Y_U     = 250   // 25 mm
// Sello bbox: (300, 250) → (2200, 400)  ≡  (30, 25, 220, 40) mm

export const SELLO_IDENTIFICADOR = 'Topologico'

// ─── Line styles ──────────────────────────────────────────────────────────────

export interface LineStyleDef { color: string; width: number }

export const LINE_STYLE_EXISTENTE:     LineStyleDef = { color: '#008080', width: 2 }   // teal — canalizacion existente
export const LINE_STYLE_RED_EXISTENTE: LineStyleDef = { color: '#4DBB52', width: 2 }   // green — reserva existente
export const LINE_STYLE_PROYECTADA:    LineStyleDef = { color: '#FF0000', width: 4 }   // red — reserva proyectada

// ─── Text styles ──────────────────────────────────────────────────────────────

export interface TextStyleDef { color: string; fontSize: number }

export const TEXT_STYLE_CALLE:            TextStyleDef = { color: '#24CC2D', fontSize: 5 }  // bright green
export const TEXT_STYLE_RESERVA:          TextStyleDef = { color: '#FF0000', fontSize: 5 }  // red
export const TEXT_STYLE_CABLE_EXISTENTE:  TextStyleDef = { color: '#008000', fontSize: 6 }  // dark green
export const TEXT_STYLE_CABLE_PROYECTADO: TextStyleDef = { color: '#FF0000', fontSize: 8 }  // red

// ─── Pure utility functions ───────────────────────────────────────────────────

// Magik: cable.spec_id.slice(1, cable.spec_id.index_of('(', 1)-1)
// Extracts the cable type prefix before the first '(' in spec_id.
// Magik slice is 1-indexed; translated to JS 0-indexed slice.
export function getCableLabel(specId: string): string {
  const idx = specId.indexOf('(')
  return idx > 0 ? specId.slice(0, idx).trim() : specId
}

// Magik: normalize orientation to range (-π/2, π/2] so text never renders upside-down.
export function normalizeOrientation(radians: number): number {
  const HALF_PI = Math.PI / 2
  if (radians > HALF_PI)  return radians - Math.PI
  if (radians < -HALF_PI) return radians + Math.PI
  return radians
}

// Text bounding box width heuristic: each character ~37 units wide (from Magik source).
export const CHAR_WIDTH_U = 37

// Computes text bbox width in layout units.
export function textWidthU(text: string): number {
  return text.length * CHAR_WIDTH_U
}

// Resolves line style for a given construction status (canalizacion tramo).
export function lineStyleForStatus(status: ConstructionStatus): LineStyleDef | null {
  if (status === 'OPERACION' || status === 'EXISTENTE') return LINE_STYLE_EXISTENTE
  return null  // solo dibuja existentes/operación
}

// Resolves line style for a reservation.
export function lineStyleForReserva(status: ConstructionStatus): LineStyleDef {
  if (status === 'OPERACION' || status === 'EXISTENTE') return LINE_STYLE_RED_EXISTENTE
  return LINE_STYLE_PROYECTADA
}

// Resolves text style for a cable by construction status.
export function textStyleForCable(status: ConstructionStatus): TextStyleDef | null {
  if (status === 'EXISTENTE')  return TEXT_STYLE_CABLE_EXISTENTE
  if (status === 'PROYECTADO') return TEXT_STYLE_CABLE_PROYECTADO
  return null
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CPlanoTopologico {
  static readonly ACTIVATE_PROPERTIES_DIALOG_ON_INSERT = false
  static readonly ALLOWED_ON_MENU = false

  vpNombre?: string

  // Magik: genera_plano() — GIS orchestrator, Fase 5
  generarPlano(): void { /* Fase 5: c_sectores.dibuja_trazo + dib_geom_layout */ }

  // Magik: dib_geom_layout(elementos, pagina) — Fase 5
  dibGeomLayout(_elementos: unknown, _pagina: unknown): void { /* Fase 5 */ }

  // Magik: agrega_sello(pagina) — creates c_sello_estandar at SELLO_* coords
  agregarSello(_pagina: unknown): void { /* Fase 5 */ }

  // Magik: agrega_reservas — Fase 5
  agregarReservas(_pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: dibuja_reservas — Fase 5
  dibujarReservas(_pagina: unknown, _vpTrans: unknown, _reservas: unknown): void { /* Fase 5 */ }

  // Magik: agregar_apuntador_reserva — Fase 5
  agregarApuntadorReserva(_pagina: unknown, _vpTrans: unknown, _reserva: ReservaGIS): void { /* Fase 5 */ }

  // Magik: agregar_calles — Fase 5
  agregarCalles(_pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: obtener_y_agregar_texto_calles — Fase 5
  obtenerYAgregarTextoCalles(_pagina: unknown, _vpTrans: unknown, _calles: CalleGIS[]): void { /* Fase 5 */ }

  // Magik: obtener_objetos_en_trazo(db, tabla, campo) — GIS select by trail, Fase 5
  obtenerObjetosEnTrazo(_db: string, _tabla: string, _campo: string): unknown[] { return [] }

  // Magik: agregar_estructura(central, pagina, vpTrans) — Fase 5
  agregarEstructura(_central: unknown, _pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: agrega_texto(elem, pagina, vpTrans) — places siglas text, Fase 5
  agregarTexto(_elem: unknown, _pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: agregar_cajas(cajas, pagina, vpTrans) — places c_dto_pronostico, Fase 5
  agregarCajas(_cajas: unknown[], _pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: agrega_texto_dto(elem, pagina, vpTrans) — places nombre_distrito text, Fase 5
  agregarTextoDtos(_elem: unknown, _pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: texlayout_del_tramo(elem, pagina, vpTrans) — Fase 5
  texlayoutDelTramo(_elem: TramoGIS, _pagina: unknown, _vpTrans: unknown): void { /* Fase 5 */ }

  // Magik: agregar_texto_cables(elem, pagina, loc, ori) — Fase 5
  agregarTextoCables(_elem: TramoGIS, _pagina: unknown, _loc: Coord2D, _ori: number): void { /* Fase 5 */ }

  // Pure: busca_cables_en_tramo — filters copper cables from tramo
  buscarCablesEnTramo(tramo: TramoGIS): CableCobre[] {
    const result: CableCobre[] = []
    for (const cable of tramo.rwo.cables) {
      if (cable.copperCable !== undefined) result.push(cable.copperCable)
    }
    return result
  }

  // Magik: obtener_coordenada_y_orientacion(elem, vpTrans) — normalized coord+angle, Fase 5
  obtenerCoordenadaYOrientacion(_elem: unknown, _vpTrans: unknown): [Coord2D, number] {
    return [{ x: 0, y: 0 }, 0]
  }

  // Magik: agrega_viewport(pagina) — creates auxiliary viewport, Fase 5
  agregarViewport(_pagina: unknown): unknown { return undefined }

  // Magik: abrir_hoja — returns current layout page, Fase 5
  abrirHoja(): unknown { return undefined }

  // Magik: obtener_tcanaliz_selecion(objeto) — GIS selection, Fase 5
  obtenerTcanaliz(_objeto: string): unknown[] { return [] }

  // Magik: obtener_estructuras_tcanaliz(canaliz, elemento) — connected structures, Fase 5
  obtenerEstructurasTcanaliz(_canaliz: unknown[], _elemento: string): unknown[] { return [] }

  // Magik: genera_plano_respaldo — backup/legacy version of genera_plano, Fase 5
  generarPlanoRespaldo(): void { /* Fase 5 */ }
}
