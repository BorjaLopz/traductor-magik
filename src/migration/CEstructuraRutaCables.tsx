// =============================================================================
// MIGRACIÓN: c_estructura_ruta_cables  →  CEstructuraRutaCables.tsx
// Jerarquía Magik: c_estructura_ruta_cables (sin padre)
// Fuente: planos_fo/source/ruta_cables/engine/c_estructura_ruta_cables.magik
// =============================================================================
//
// Motor de travesía de red FO. Dado un conjunto de cables de entrada recorre
// aguas-abajo la conectividad y acumula: estructuras (postes, ductos, cruceros),
// canalizacion (underground_route), cables de la ruta y elementos
// (empalmes, gasas, llaves, reservas FO, TBAs).
//
// GIS stubs: mit_low_level_trace_engine, rwo_set, strw_connect_point y demás
// APIs de red Smallworld no existen en web — se modelan con interfaces + mock data.
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Enums y tipos de dominio
// ---------------------------------------------------------------------------

export type ElementoTipo =
  | 'figure_eight'
  | 'splice_closure'
  | 'structure_annotation'
  | 'user!_tba_anotacion'
  | 'user!_crucero'
  | 'user!_anotacion_reserva_fo'
  | 'user!_empalme_distribucion'
  | 'user!_terminal_fo'
  | 'anchor'
  | 'sheath'                  // cable de FO
  | 'underground_route'
  | 'aerial_route'
  | 'pole'
  | 'point_of_interest'
  | 'building'
  | 'mit_building_structure'
  | 'other';

export type TipoEnlace = 'rda' | 'troncal' | 'rof' | 'falc' | 'fttb' | 'tba';

export interface GisObject {
  id: string;
  tipo: ElementoTipo;
  description: string;
  primaryGeometry?: [number, number]; // stub — coordinate
  isStructure?: boolean;
}

export interface Anchor extends GisObject {
  tipo: 'anchor';
}

export interface Structure extends GisObject {
  kind: 'underground_route' | 'aerial_route' | 'pole' | 'point_of_interest' | 'other';
  anchors?: Anchor[];
  connectedObjects?: GisObject[]; // all_connected_objects()
}

export interface TbaAnnotation extends GisObject {
  tipo: 'user!_tba_anotacion';
}

export interface ReservaFo extends GisObject {
  tipo: 'user!_anotacion_reserva_fo';
}

export interface Empalme extends GisObject {
  tipo: 'splice_closure' | 'user!_empalme_distribucion';
  downstreamCables?: Cable[];
  downstreamCablesRedPrincipal?: Cable[];
}

export interface SheathPin {
  id: string;
  strwConnectPoint?: ConnectPoint;
  mitCable?: { actualCable: Cable };
  gisOwner?: GisObject;
}

export interface ConnectPoint {
  id: string;
  owner: GisObject;
  rwoType: 'strw_connect_point' | 'other';
}

export interface Cable extends GisObject {
  tipo: 'sheath';
  structures: Structure[];
  figureEights: GisObject[];        // figure_eight
  structureAnnotations: GisObject[]; // structure_annotation (llaves)
  reservasFo: ReservaFo[];
  downstreamConnector?: Empalme;
  tbaAnnotation?: TbaAnnotation;
  startPin?: SheathPin;
  endPin?: SheathPin;
}

export interface BastidorFinalEntry {
  bastidor: GisObject;
  cable: Cable;
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CEstructuraRutaCables {
  // D1: prefijo _
  private _oEstructuras: GisObject[] | undefined;
  private _oCanalizacion: GisObject[] | undefined;
  private _oCables: Cable[] | undefined;
  private _oElementos: GisObject[] | undefined;
  private _oBasInicio: GisObject | undefined;
  private _oBasFinal: GisObject[] | undefined;

  // Pseudo-slots (class-level en Magik → instance props en TS)
  includesTba: boolean = false;
  oBasFinalycable: Map<string, BastidorFinalEntry> = new Map();

  // Shared constant — tipos válidos de elemento para agrega_objeto
  static readonly TIPOS_ELEMENTOS: ReadonlySet<ElementoTipo> = new Set([
    'figure_eight',
    'splice_closure',
    'structure_annotation',
    'user!_tba_anotacion',
    'user!_crucero',
    'user!_anotacion_reserva_fo',
    'user!_empalme_distribucion',
    'user!_terminal_fo',
    'anchor',
  ]);

  // D2: new() + init() → constructor (init era trivial: _return _self)
  constructor() {
    // slots inician _unset → undefined
  }

  // Getters (accessores públicos de los slots privados)
  get cables(): Cable[] | undefined { return this._oCables; }
  get canalizacion(): GisObject[] | undefined { return this._oCanalizacion; }
  get elementosRuta(): GisObject[] | undefined { return this._oElementos; }
  get estructuras(): GisObject[] | undefined { return this._oEstructuras; }
  get rmeInicio(): GisObject | undefined { return this._oBasInicio; }
  get rmeFinal(): GisObject[] | undefined { return this._oBasFinal; }
  get rmeFinalycable(): Map<string, BastidorFinalEntry> { return this.oBasFinalycable; }

  // ── agrega_objeto(rope, objeto) — private ─────────────────────────────────
  // Magik: valida tipo_elemento o is_structure?, sin duplicados por igualdad
  private agregaObjeto(rope: GisObject[], objeto: GisObject | undefined): void {
    if (objeto === undefined) return;
    const esElementoValido = CEstructuraRutaCables.TIPOS_ELEMENTOS.has(objeto.tipo);
    const esEstructura = objeto.isStructure === true;
    if (!esElementoValido && !esEstructura) return;
    if (rope.some(o => o.id === objeto.id)) return; // includes_by_equality? → id equality
    rope.push(objeto);
  }

  // ── agregar_retenidas(PoEstructuras, str) ────────────────────────────────
  agregarRetenidas(estructuras: GisObject[], str: Structure): void {
    if (!str.anchors) return;
    for (const retenida of str.anchors) {
      this.agregaObjeto(estructuras, retenida);
    }
  }

  // ── agregar_estructuras(PoCable, PoEstructuras, PoCanalizacion) — private ─
  private agregarEstructuras(
    cable: Cable,
    estructuras: GisObject[],
    canalizacion: GisObject[],
  ): void {
    for (const st of cable.structures) {
      if (st.kind === 'underground_route') {
        this.agregaObjeto(canalizacion, st);
      } else if (st.kind === 'aerial_route') {
        // obtener_crucero_y_poste → stub (GIS connectivity sin backend)
        this.agregaObjeto(estructuras, st);
      } else if (st.kind === 'pole' || st.kind === 'point_of_interest') {
        this.agregarRetenidas(estructuras, st);
        this.agregaObjeto(estructuras, st);
      } else {
        this.agregaObjeto(estructuras, st);
      }
    }
    // Agregar building desde sheath pins
    if (cable.startPin) this.agregarCentralCliente(cable.startPin, estructuras);
    if (cable.endPin) this.agregarCentralCliente(cable.endPin, estructuras);
  }

  // ── agregar_central_cliente(sheathPin, estructuras) — private ─────────────
  // Magik: navega conectividad hasta encontrar building / user!_building del bastidor
  private agregarCentralCliente(pin: SheathPin, estructuras: GisObject[]): void {
    const conn = pin.strwConnectPoint ?? pin.mitCable?.actualCable.startPin?.strwConnectPoint;
    if (conn?.owner) {
      const owner = conn.owner;
      this.agregaObjeto(estructuras, owner);
      // Registrar bastidor final
      if (
        this._oBasInicio?.id !== owner.id &&
        !this._oBasFinal?.some(b => b.id === owner.id)
      ) {
        this._oBasFinal ??= [];
        this._oBasFinal.push(owner);
        if (pin.mitCable) {
          this.oBasFinalycable.set(owner.id, {
            bastidor: owner,
            cable: pin.mitCable.actualCable,
          });
        }
      }
    } else if (pin.gisOwner) {
      this.agregaObjeto(estructuras, pin.gisOwner);
    }
  }

  // ── agregar_elementos(PoCable, PoElementos) — private ────────────────────
  // Magik: empalmes, reservas FO, TBA (si includes_tba?), gasas, llaves
  private agregarElementos(cable: Cable, elementos: GisObject[]): void {
    // Empalme splice_closure
    if (cable.downstreamConnector?.tipo === 'splice_closure') {
      this.agregaObjeto(elementos, cable.downstreamConnector);
    }
    // Empalme de distribución
    if (cable.downstreamConnector?.tipo === 'user!_empalme_distribucion') {
      this.agregaObjeto(elementos, cable.downstreamConnector);
    }
    // Reservas FO
    for (const r of cable.reservasFo) {
      this.agregaObjeto(elementos, r);
    }
    // TBA (solo si includes_tba? es true)
    if (this.includesTba && cable.tbaAnnotation) {
      this.agregaObjeto(elementos, cable.tbaAnnotation);
    }
    // Gasas (figure_eight)
    for (const g of cable.figureEights) {
      this.agregaObjeto(elementos, g);
    }
    // Llaves (structure_annotation)
    for (const l of cable.structureAnnotations) {
      this.agregaObjeto(elementos, l);
    }
  }

  // ── agregar_downstream_cables(empalme, cablesProcesar) — private ──────────
  // Magik: obtiene cables aguas-abajo; si es empalme_distribucion → solo red principal
  private agregarDownstreamCables(empalme: Empalme, cablesProcesar: Cable[]): void {
    const cables =
      empalme.tipo === 'user!_empalme_distribucion'
        ? (empalme.downstreamCablesRedPrincipal ?? [])
        : (empalme.downstreamCables ?? []);
    for (const c of cables) {
      cablesProcesar.push(c);
    }
  }

  // ── depura_estructuras(PoEstructuras) ─────────────────────────────────────
  // Magik: filtra estructuras que tengan geometría primaria
  depuraEstructuras(estructuras: GisObject[]): GisObject[] {
    return estructuras.filter(st => st.primaryGeometry !== undefined);
  }

  // ── bastidor_inicial(PoCable) ─────────────────────────────────────────────
  // Magik: obtiene el bastidor (rack) inicial del cable via start_pin → strw_connect_point
  bastidorInicial(cable: Cable): GisObject | undefined {
    const pin = cable.startPin;
    if (!pin) return undefined;
    if (pin.strwConnectPoint) return pin.strwConnectPoint.owner;
    return undefined;
  }

  // ── recorrer_enlace(...) ──────────────────────────────────────────────────
  // Magik: procesa cables de la ruta → acumula estructuras/canalizacion/elementos
  // GIS trace (obtener_cables_y_trayectoria_cable) → stub retorna los cables de entrada
  recorrerEnlace(
    cablesProcesar: Cable[],
    cablesRuta: Cable[],
    estructuras: GisObject[],
    canalizacion: GisObject[],
    elementos: GisObject[],
  ): void {
    // obtener_cables_y_trayectoria_cable stub: usa los cables directamente
    for (const cable of cablesProcesar) {
      if (!cablesRuta.some(c => c.id === cable.id)) {
        cablesRuta.push(cable);
        this.agregarEstructuras(cable, estructuras, canalizacion);
        this.agregarElementos(cable, elementos);
        // Continuar aguas-abajo si hay empalme
        if (cable.downstreamConnector) {
          const siguiente: Cable[] = [];
          this.agregarDownstreamCables(cable.downstreamConnector, siguiente);
          if (siguiente.length > 0) {
            this.recorrerEnlace(siguiente, cablesRuta, estructuras, canalizacion, elementos);
          }
        }
      }
    }
    this._oEstructuras = estructuras;
    this._oCanalizacion = canalizacion;
    this._oCables = cablesRuta;
    this._oElementos = elementos;
  }

  // ── obtener_estructuras(PoCables) — método principal ─────────────────────
  // Magik: dado un conjunto de cables FO, recorre la ruta y llena los slots
  obtenerEstructuras(cables: Cable[]): {
    estructuras: GisObject[];
    canalizacion: GisObject[];
    elementos: GisObject[];
  } {
    const primerCable = cables[0];
    if (!primerCable || primerCable.tipo !== 'sheath') {
      return { estructuras: [], canalizacion: [], elementos: [] };
    }

    const cablesRuta: Cable[] = [];
    const estructuras: GisObject[] = [];
    const canalizacion: GisObject[] = [];
    const elementos: GisObject[] = [];

    for (const cable of cables) {
      const cablesProcesar: Cable[] = [cable];
      this._oBasInicio = this.bastidorInicial(cable);
      this._oBasFinal = [];
      this.oBasFinalycable = new Map();
      this.recorrerEnlace(cablesProcesar, cablesRuta, estructuras, canalizacion, elementos);
    }

    this._oEstructuras = estructuras;
    this._oCanalizacion = canalizacion;
    this._oCables = cablesRuta;
    this._oElementos = elementos;

    return { estructuras, canalizacion, elementos };
  }
}

// =============================================================================
// Mock data — red FO de 3 cables con estructuras variadas
// =============================================================================

function makeAnchor(id: string): Anchor {
  return { id, tipo: 'anchor', description: `Retenida ${id}`, primaryGeometry: [0, 0], isStructure: true };
}

const MOCK_EDIFICIO_ORIGEN: GisObject = {
  id: 'EDIF-CTL-001', tipo: 'building', description: 'Central Origen Telmex', primaryGeometry: [100, 200],
};
const MOCK_EDIFICIO_DESTINO: GisObject = {
  id: 'EDIF-CTL-002', tipo: 'building', description: 'Central Destino', primaryGeometry: [900, 200],
};

const MOCK_EMPALME_1: Empalme = {
  id: 'EMP-001', tipo: 'splice_closure', description: 'Empalme SC-001',
  primaryGeometry: [400, 200], isStructure: false,
  downstreamCables: [], // se llena abajo
};
const MOCK_EMPALME_DIST: Empalme = {
  id: 'EMP-DIST-001', tipo: 'user!_empalme_distribucion', description: 'CEDP-001',
  primaryGeometry: [700, 200], isStructure: false,
  downstreamCables: [],
  downstreamCablesRedPrincipal: [],
};

const MOCK_POSTE_1: Structure = {
  id: 'POSTE-001', tipo: 'pole' as ElementoTipo, description: 'Poste Madera P-001',
  kind: 'pole', primaryGeometry: [300, 200], isStructure: true,
  anchors: [makeAnchor('RET-001'), makeAnchor('RET-002')],
};
const MOCK_CRUCERO_1: GisObject = {
  id: 'CRUCERO-001', tipo: 'user!_crucero', description: 'Crucero CR-001',
  primaryGeometry: [250, 200], isStructure: false,
};
const MOCK_DUCTO_1: Structure = {
  id: 'DUCTO-001', tipo: 'underground_route' as ElementoTipo, description: 'Ducto Sub-001',
  kind: 'underground_route', primaryGeometry: [500, 200], isStructure: true,
};
const MOCK_AEREA_1: Structure = {
  id: 'AEREA-001', tipo: 'aerial_route' as ElementoTipo, description: 'Línea Aérea A-001',
  kind: 'aerial_route', primaryGeometry: [350, 200], isStructure: true,
};
const MOCK_GASA_1: GisObject = {
  id: 'GASA-001', tipo: 'figure_eight', description: 'Gasa G-001',
  primaryGeometry: [450, 200],
};
const MOCK_LLAVE_1: GisObject = {
  id: 'LLAVE-001', tipo: 'structure_annotation', description: 'Llave Anotación L-001',
  primaryGeometry: [380, 200],
};
const MOCK_RESERVA_1: ReservaFo = {
  id: 'RES-001', tipo: 'user!_anotacion_reserva_fo', description: 'Reserva FO R-001',
  primaryGeometry: [420, 200],
};
const MOCK_TBA_ANN: TbaAnnotation = {
  id: 'TBA-ANN-001', tipo: 'user!_tba_anotacion', description: 'Anotación TBA-001',
  primaryGeometry: [850, 200],
};

const MOCK_CABLE_1: Cable = {
  id: 'CAB-001', tipo: 'sheath', description: 'Cable FO 24H Tramo 1',
  structures: [MOCK_POSTE_1, MOCK_AEREA_1],
  figureEights: [MOCK_GASA_1],
  structureAnnotations: [MOCK_LLAVE_1],
  reservasFo: [MOCK_RESERVA_1],
  downstreamConnector: MOCK_EMPALME_1,
  startPin: {
    id: 'PIN-START-001',
    strwConnectPoint: { id: 'SCP-001', owner: MOCK_EDIFICIO_ORIGEN, rwoType: 'strw_connect_point' },
    mitCable: undefined,
  },
};
const MOCK_CABLE_2: Cable = {
  id: 'CAB-002', tipo: 'sheath', description: 'Cable FO 48H Tramo 2',
  structures: [MOCK_DUCTO_1],
  figureEights: [],
  structureAnnotations: [],
  reservasFo: [],
  downstreamConnector: MOCK_EMPALME_DIST,
};
const MOCK_CABLE_3: Cable = {
  id: 'CAB-003', tipo: 'sheath', description: 'Cable FO 24H Tramo 3',
  structures: [],
  figureEights: [],
  structureAnnotations: [],
  reservasFo: [],
  tbaAnnotation: MOCK_TBA_ANN,
  endPin: {
    id: 'PIN-END-003',
    strwConnectPoint: { id: 'SCP-002', owner: MOCK_EDIFICIO_DESTINO, rwoType: 'strw_connect_point' },
    mitCable: undefined,
  },
};

// Cablear la cadena empalme → cable siguiente
MOCK_EMPALME_1.downstreamCables = [MOCK_CABLE_2];
MOCK_EMPALME_DIST.downstreamCables = [MOCK_CABLE_3];
MOCK_EMPALME_DIST.downstreamCablesRedPrincipal = [MOCK_CABLE_3];

const MOCK_CABLES_ENTRADA: Cable[] = [MOCK_CABLE_1];

// =============================================================================
// Componente React — CEstructuraRutaCablesUI
// =============================================================================

const SX = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 720,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '220px 1fr', gap: 4,
    fontSize: 11, padding: '2px 0',
  } as React.CSSProperties,
  k: { color: '#89dceb' } as React.CSSProperties,
  v: { color: '#a6e3a1' } as React.CSSProperties,
  mut: { color: '#fab387' } as React.CSSProperties,
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  table: { fontSize: 10, width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
  th: { padding: '2px 6px', color: '#585b70', textAlign: 'left' } as React.CSSProperties,
  td: { padding: '2px 6px' } as React.CSSProperties,
  btn: {
    padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: 'inline-block', padding: '1px 6px', borderRadius: 3,
    fontSize: 10, fontWeight: 'bold',
    background: color + '22', color,
    marginRight: 4,
  }) as React.CSSProperties,
};

function KV({ k, v, mut }: { k: string; v: React.ReactNode; mut?: boolean }) {
  return (
    <div style={SX.row}>
      <span style={SX.k}>{k}</span>
      <span style={mut ? SX.mut : SX.v}>{v}</span>
    </div>
  );
}

const TIPO_COLORS: Partial<Record<ElementoTipo, string>> = {
  sheath: '#89b4fa',
  splice_closure: '#cba6f7',
  'user!_empalme_distribucion': '#b4befe',
  underground_route: '#f38ba8',
  aerial_route: '#fab387',
  pole: '#e2c084',
  'user!_crucero': '#f9e2af',
  figure_eight: '#a6e3a1',
  structure_annotation: '#94e2d5',
  'user!_anotacion_reserva_fo': '#89dceb',
  'user!_tba_anotacion': '#cba6f7',
  anchor: '#6c7086',
  building: '#a6e3a1',
};

function ObjBadge({ obj }: { obj: GisObject }) {
  const color = TIPO_COLORS[obj.tipo] ?? '#585b70';
  return (
    <div style={{
      padding: '3px 8px', borderRadius: 4, marginBottom: 3,
      background: color + '18', borderLeft: `3px solid ${color}`,
      fontSize: 10,
    }}>
      <span style={{ color, fontWeight: 'bold', marginRight: 6 }}>{obj.tipo}</span>
      <span style={{ color: '#cdd6f4' }}>{obj.id}</span>
      <span style={{ color: '#585b70', marginLeft: 6 }}>{obj.description}</span>
      {obj.primaryGeometry && (
        <span style={{ color: '#45475a', marginLeft: 8 }}>
          [{obj.primaryGeometry[0]}, {obj.primaryGeometry[1]}]
        </span>
      )}
    </div>
  );
}

// SVG red — visualiza los 3 cables, empalmes y bastidores
function RedSVG({ cables, resultado }: {
  cables: Cable[];
  resultado: ReturnType<CEstructuraRutaCables['obtenerEstructuras']> | null;
}) {
  const allCables = resultado
    ? [MOCK_CABLE_1, MOCK_CABLE_2, MOCK_CABLE_3]
    : [];
  const encontrados = new Set(allCables.map(c => c.id));
  const nodes: Array<{ id: string; x: number; label: string; color: string; tipo: string }> = [
    { id: 'EDIF-CTL-001', x: 30,  label: 'CTL-Orig', color: '#a6e3a1', tipo: 'building' },
    { id: 'CAB-001',       x: 160, label: 'CAB-001',  color: '#89b4fa', tipo: 'sheath' },
    { id: 'EMP-001',       x: 290, label: 'EMP-001',  color: '#cba6f7', tipo: 'splice_closure' },
    { id: 'CAB-002',       x: 390, label: 'CAB-002',  color: '#89b4fa', tipo: 'sheath' },
    { id: 'EMP-DIST-001',  x: 510, label: 'CEDP',     color: '#b4befe', tipo: 'user!_empalme_distribucion' },
    { id: 'CAB-003',       x: 610, label: 'CAB-003',  color: '#89b4fa', tipo: 'sheath' },
    { id: 'EDIF-CTL-002',  x: 730, label: 'CTL-Dest', color: '#a6e3a1', tipo: 'building' },
  ];
  const Y = 40;
  const SVG_H = 110;

  return (
    <svg width="100%" viewBox={`0 0 780 ${SVG_H}`}
      style={{ display: 'block', background: '#11111b', borderRadius: 6 }}>
      {/* Línea de conexión */}
      <line x1={30} y1={Y} x2={750} y2={Y} stroke="#45475a" strokeWidth={1.5} strokeDasharray="4,3" />

      {nodes.map((n, i) => {
        const isActive = resultado ? (encontrados.has(n.id) || n.tipo === 'building' || n.tipo === 'splice_closure' || n.tipo === 'user!_empalme_distribucion') : false;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={Y} r={14}
              fill={isActive ? n.color + '33' : '#1e1e2e'}
              stroke={isActive ? n.color : '#45475a'}
              strokeWidth={isActive ? 2 : 1} />
            <text x={n.x} y={Y + 4} fontSize={7} fill={isActive ? n.color : '#45475a'}
              textAnchor="middle">{n.tipo === 'sheath' ? '⌁' : n.tipo === 'building' ? '⊡' : '◆'}</text>
            <text x={n.x} y={Y + 24} fontSize={7} fill={isActive ? n.color : '#585b70'}
              textAnchor="middle">{n.label}</text>
          </g>
        );
      })}

      {/* Estructuras sobre el primer cable */}
      {resultado && (
        <>
          <text x={160} y={Y - 25} fontSize={7} fill="#fab387" textAnchor="middle">↑ poste+aérea</text>
          <text x={160} y={Y - 16} fontSize={7} fill="#a6e3a1" textAnchor="middle">gasa+llave+reserva</text>
          <text x={390} y={Y - 20} fontSize={7} fill="#f38ba8" textAnchor="middle">↑ ducto</text>
        </>
      )}

      {/* Leyenda */}
      {[
        { color: '#89b4fa', label: 'cable' },
        { color: '#cba6f7', label: 'empalme' },
        { color: '#a6e3a1', label: 'edificio/bastidor' },
        { color: '#fab387', label: 'estructura aérea' },
        { color: '#f38ba8', label: 'canalización' },
      ].map((item, i) => (
        <g key={item.label}>
          <circle cx={10 + i * 145} cy={SVG_H - 12} r={4} fill={item.color} />
          <text x={18 + i * 145} y={SVG_H - 8} fontSize={7} fill={item.color}>{item.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function CEstructuraRutaCablesUI() {
  const [includesTba, setIncludesTba] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<CEstructuraRutaCables['obtenerEstructuras']> | null>(null);
  const [engine, setEngine] = useState<CEstructuraRutaCables | null>(null);

  const handleObtenerEstructuras = useCallback(() => {
    const e = new CEstructuraRutaCables();
    e.includesTba = includesTba;
    const r = e.obtenerEstructuras(MOCK_CABLES_ENTRADA);
    setResultado(r);
    setEngine(e);
  }, [includesTba]);

  const handleReset = useCallback(() => {
    setResultado(null);
    setEngine(null);
  }, []);

  const agrega_objeto_demo = useMemo(() => {
    const e = new CEstructuraRutaCables();
    const rope: GisObject[] = [];
    e['agregaObjeto'](rope, MOCK_GASA_1);               // válido por tipos_elementos
    e['agregaObjeto'](rope, MOCK_GASA_1);               // duplicado → no añade
    e['agregaObjeto'](rope, MOCK_POSTE_1);              // válido por isStructure = true
    e['agregaObjeto'](rope, MOCK_EDIFICIO_ORIGEN);      // tipo 'building' → rechazado
    return rope;
  }, []);

  return (
    <div style={SX.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CEstructuraRutaCables</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          motor de travesía de red FO · Fase 2 — lógica de negocio
        </span>
      </div>

      {/* Slots + Pseudo-slots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Slots (D1 — prefijo _)</div>
          <KV k="_oEstructuras"  v={engine?._oEstructuras === undefined ? '— _unset' : `${engine.estructuras?.length} items`} />
          <KV k="_oCanalizacion" v={engine?.canalizacion === undefined ? '— _unset' : `${engine.canalizacion?.length} items`} />
          <KV k="_oCables"       v={engine?.cables === undefined ? '— _unset' : `${engine.cables?.length} cables`} />
          <KV k="_oElementos"    v={engine?.elementosRuta === undefined ? '— _unset' : `${engine.elementosRuta?.length} items`} />
          <KV k="_oBasInicio"    v={engine?.rmeInicio?.description ?? '— _unset'} />
          <KV k="_oBasFinal"     v={engine?.rmeFinal === undefined ? '— _unset' : `${engine.rmeFinal?.length} bastidores`} />
        </div>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Pseudo-slots + Constante</div>
          <div style={SX.row}>
            <span style={SX.k}>includes_tba?</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={includesTba}
                onChange={e => setIncludesTba(e.target.checked)} />
              <span style={includesTba ? SX.v : SX.empty}>{String(includesTba)}</span>
            </label>
          </div>
          <KV k="oBasFinalycable.size" v={String(engine?.rmeFinalycable.size ?? 0)} />
          <div style={{ marginTop: 6, color: '#585b70', fontSize: 10 }}>
            tipos_elementos ({CEstructuraRutaCables.TIPOS_ELEMENTOS.size}):
          </div>
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...CEstructuraRutaCables.TIPOS_ELEMENTOS].map(t => (
              <span key={t} style={SX.badge(TIPO_COLORS[t] ?? '#585b70')}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Diagrama de red */}
      <div style={SX.card}>
        <div style={SX.title}>Topología de red mock — 3 cables en serie</div>
        <RedSVG cables={MOCK_CABLES_ENTRADA} resultado={resultado} />
      </div>

      {/* agrega_objeto demo */}
      <div style={SX.card}>
        <div style={SX.title}>agrega_objeto(rope, objeto) — validación y deduplicación</div>
        <div style={{ color: '#585b70', fontSize: 10, marginBottom: 6 }}>
          Acepta: tipos_elementos ∪ isStructure=true. Rechaza duplicados (id equality) y tipos no válidos.
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          {[
            { obj: MOCK_GASA_1, intento: '1ª vez', ok: true, razon: 'tipo en tipos_elementos' },
            { obj: MOCK_GASA_1, intento: '2ª vez (dup)', ok: false, razon: 'id ya en rope' },
            { obj: MOCK_POSTE_1, intento: 'poste', ok: true, razon: 'isStructure = true' },
            { obj: MOCK_EDIFICIO_ORIGEN, intento: 'building', ok: false, razon: "tipo 'building' no en tipos_elementos" },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '4px 8px', borderRadius: 4, flex: '1 1 180px',
              background: item.ok ? '#1e3a2e' : '#3a1e1e',
              borderLeft: `3px solid ${item.ok ? '#a6e3a1' : '#f38ba8'}`,
            }}>
              <div style={{ color: item.ok ? '#a6e3a1' : '#f38ba8', fontWeight: 'bold' }}>
                {item.ok ? '✓ añadido' : '✗ rechazado'} — {item.intento}
              </div>
              <div style={{ color: '#585b70' }}>{item.obj.id} · {item.razon}</div>
            </div>
          ))}
        </div>
        <div style={{ color: '#585b70', fontSize: 10 }}>
          Resultado rope: {agrega_objeto_demo.map(o => o.id).join(', ')}
        </div>
      </div>

      {/* Control principal */}
      <div style={SX.card}>
        <div style={SX.title}>obtener_estructuras(cables) — método principal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            onClick={handleObtenerEstructuras}
            style={{ ...SX.btn, background: '#89b4fa', color: '#1e1e2e' }}
          >
            Ejecutar obtenerEstructuras()
          </button>
          <button
            onClick={handleReset}
            style={{ ...SX.btn, background: '#313244', color: '#cdd6f4' }}
          >
            Reset
          </button>
          <span style={{ color: '#585b70', fontSize: 10, alignSelf: 'center' }}>
            {resultado ? `→ procesó ${MOCK_CABLES_ENTRADA.length} cable(s) de entrada` : 'pendiente'}
          </span>
        </div>

        {resultado && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Cables */}
            <div>
              <div style={{ color: '#89b4fa', fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>
                _oCables ({engine?.cables?.length ?? 0})
              </div>
              {engine?.cables?.map(c => <ObjBadge key={c.id} obj={c} />) ?? null}
            </div>
            {/* Estructuras */}
            <div>
              <div style={{ color: '#fab387', fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>
                _oEstructuras ({resultado.estructuras.length})
              </div>
              {resultado.estructuras.map(e => <ObjBadge key={e.id} obj={e} />)}
            </div>
            {/* Canalizacion */}
            <div>
              <div style={{ color: '#f38ba8', fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>
                _oCanalizacion ({resultado.canalizacion.length})
              </div>
              {resultado.canalizacion.length === 0
                ? <span style={SX.empty}>vacío</span>
                : resultado.canalizacion.map(e => <ObjBadge key={e.id} obj={e} />)}
            </div>
            {/* Elementos */}
            <div>
              <div style={{ color: '#a6e3a1', fontSize: 10, marginBottom: 4, fontWeight: 'bold' }}>
                _oElementos ({resultado.elementos.length})
                {includesTba && <span style={{ color: '#cba6f7' }}> +TBA</span>}
              </div>
              {resultado.elementos.length === 0
                ? <span style={SX.empty}>vacío</span>
                : resultado.elementos.map(e => <ObjBadge key={e.id} obj={e} />)}
            </div>
          </div>
        )}
      </div>

      {/* Bastidores */}
      {engine && (
        <div style={SX.card}>
          <div style={SX.title}>rme_inicio / rme_final / rme_finalycable</div>
          <KV k="rme_inicio (oBasInicio)" v={engine.rmeInicio?.description ?? '— _unset'} />
          <KV k="rme_final (oBasFinal)" v={
            engine.rmeFinal?.map(b => b.id).join(', ') ?? '— _unset'
          } />
          <div style={{ marginTop: 6 }}>
            <div style={{ color: '#585b70', fontSize: 10, marginBottom: 4 }}>
              oBasFinalycable (hash_table → Map&lt;id, &#123;bastidor, cable&#125;&gt;):
            </div>
            {[...engine.rmeFinalycable.entries()].map(([id, entry]) => (
              <div key={id} style={SX.row}>
                <span style={SX.k}>{id}</span>
                <span style={SX.v}>{entry.bastidor.description}</span>
              </div>
            ))}
            {engine.rmeFinalycable.size === 0 && <span style={SX.empty}>vacío</span>}
          </div>
        </div>
      )}

      {/* depura_estructuras */}
      {resultado && (
        <div style={SX.card}>
          <div style={SX.title}>depura_estructuras() — filtra sin primary_geometry</div>
          {(() => {
            const e = new CEstructuraRutaCables();
            const depuradas = e.depuraEstructuras(resultado.estructuras);
            const sinGeom = resultado.estructuras.filter(st => st.primaryGeometry === undefined);
            return (
              <>
                <KV k="entrada" v={`${resultado.estructuras.length} estructuras`} />
                <KV k="sin geometría (filtradas)" v={`${sinGeom.length}`} mut />
                <KV k="depuradas" v={`${depuradas.length} → ${depuradas.map(s => s.id).join(', ')}`} />
              </>
            );
          })()}
        </div>
      )}

      {/* Equivalencias */}
      <div style={SX.card}>
        <div style={SX.title}>Equivalencias aplicadas</div>
        <table style={SX.table}>
          <thead>
            <tr><th style={SX.th}>Magik</th><th style={SX.th}>→</th><th style={SX.th}>TypeScript</th></tr>
          </thead>
          <tbody>
            {[
              ['define_pseudo_slot(:includes_tba?, _false)', 'includesTba: boolean = false (prop instancia)'],
              ['define_pseudo_slot(:oBasFinalycable, hash_table.new())', 'oBasFinalycable: Map<string, BastidorFinalEntry>'],
              ['define_shared_constant(:tipos_elementos, {...})', 'static readonly TIPOS_ELEMENTOS: ReadonlySet<ElementoTipo>'],
              ['new() + _private init() → trivial', 'constructor() — D2'],
              ['rope.new() / .add() / .add_last()', 'Array<T> / push()'],
              ['hash_table.new() / [key] <<', 'Map<K,V> / .set(key, val)'],
              ['PoRope.includes_by_equality?(obj)', 'rope.some(o => o.id === obj.id)'],
              ['_not rope.includes_by_equality?(obj)', '!rope.some(...)'],
              ['is_kind_of?(sheath)', "tipo === 'sheath'"],
              ['is_kind_of?(underground_route)', "kind === 'underground_route'"],
              ['PoCable.structures.elements()', 'for...of cable.structures'],
              ['_try _with LoError ... _when error', 'try { ... } catch (e) { ... }'],
              ['mit_low_level_trace_engine (GIS)', 'stub — recorrer_enlace() itera mock cables'],
              ['source_collection.name _is :splice_closure', "tipo === 'splice_closure'"],
              ['condition.raise / show()', 'throw new Error() / console.warn()'],
              ['_unset', 'undefined'],
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
