// Source: adiciones_layout/source/Sellos/Entidad/c_proyecto.magik
// Fachada de datos del proyecto activo. Accede al diseño activo (DisenioRecord)
// y expone getters para nombre, central, responsables, PEPs, etc.
// Los métodos geográficos usan datos inyectados en oNodo en lugar de consultas GIS.
// Los métodos GIS (cables_del_proyecto, busca_objeto, jalado_de_cables) son stubs.

// ─── Tipos de registros GIS ──────────────────────────────────────────────────

export interface CentralRecord {
  central?: string;
  nombre?: string;
  area?: string;
  division?: string;
}

export interface PepRecord {
  clave: string;
  catalogoPep?: { tipoTrabajo?: string };
}

export interface OeRecord {
  numOe: string;
  pep?: PepRecord;
  tramoCobre?: boolean;
  segmentoLocals?: unknown[];
  oeiLocal?: { numOei: string; opLocal?: { numOp: string } };
}

export interface OeiRecord {
  tipoOei: string;
  valorOei: string;
  oeLocals?: OeRecord[];
}

export interface OpbRecord {
  numOp?: string;
  oeis?: OeiRecord[];
  rutas?: { numero: string };
}

export interface DistritoRecord {
  numDto?: string;
  oei?: OeiRecord[];
}

export interface ProyectoRecord {
  name: string;
  planningStart?: { month: number; year: number };
  central?: CentralRecord;
  fechaEntrega?: string;
  empresaProyecto?: string;
  empresaRevisora?: string;
  supervisor?: string;
  vb?: string;
  proyectistaProyecto?: string;
  programa?: string;
  programaAnyo?: number;
  programaTipo?: string;
  pepConsCanal?: string;
  pepConsPpal?: string;
  pepConsSecu?: string;
  pepDesmCanal?: string;
  pepDesmPpal?: string;
  pepDesmSecu?: string;
  pepRecoPpal?: string;
  pepRecoSecu?: string;
  pepRehaCanal?: string;
  pepRehaPpal?: string;
  pepRehaSecu?: string;
}

export interface DisenioRecord {
  name: string;
  tipoDiseno?: string;
  tipoProyecto?: string;
  proyecto?: ProyectoRecord;
  distrito?: DistritoRecord;
  distritoOptico?: DistritoRecord;
  inventario?: string;
  superviso?: string;    // "user!_superviso" — typo preservado del fuente Magik
  vobo?: string;
  proyectista?: string;
  oeLocals?: OeRecord[];
  oeiLocals?: OeiRecord[];
}

export interface NodoRecord {
  siglas?: string;
  tipoNodo?: string;
  datosNco?: [string, string];
  estado?: string;
  ciudad?: string;
  delegacionMunicipio?: string;
  colonia?: string;
  codigoPostal?: string;
  poblacion?: string;
}

export interface PepInfoEntry { pep: string; opb: string; oei: string; oe: string; }

export interface PepsPorTipo {
  construccion: { fibra: PepInfoEntry[]; cobre: PepInfoEntry[]; canal: PepInfoEntry[] };
  desmontaje:   { fibra: PepInfoEntry[]; cobre: PepInfoEntry[]; canal: PepInfoEntry[] };
}

// ─── Clase principal ─────────────────────────────────────────────────────────

export class CProyecto {
  private _oNodo: NodoRecord | undefined;
  private readonly _disenioActivo: DisenioRecord;

  private static readonly MESES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ];

  constructor(disenio: DisenioRecord) {
    this._disenioActivo = disenio;
  }

  // Slot o_nodo (writable) — inyectado en lugar de consultarse del GIS
  get oNodo(): NodoRecord | undefined { return this._oNodo; }
  set oNodo(value: NodoRecord | undefined) { this._oNodo = value; }

  // Magik: swg_dsn_admin_engine.active_scheme
  get disenioActivo(): DisenioRecord { return this._disenioActivo; }

  // Magik: _self.Disenio_Activo.project
  get proyectoActivo(): ProyectoRecord { return this._disenioActivo.proyecto ?? { name: '' }; }

  // ─── Getters de proyecto ─────────────────────────────────────────────────

  get nombre(): string { return this.proyectoActivo.name; }
  get cveCentral(): string { return this.proyectoActivo.central?.central ?? ''; }
  get nombreCentral(): string { return this.proyectoActivo.central?.nombre ?? ''; }
  get areaTelmex(): string { return this.proyectoActivo.central?.area ?? ''; }
  get divisionTelmex(): string { return this.proyectoActivo.central?.division ?? ''; }
  get fechaEntrega(): string { return this.proyectoActivo.fechaEntrega ?? ''; }
  get empresaProyecto(): string { return this.proyectoActivo.empresaProyecto ?? ''; }
  get empresaRevisora(): string { return this.proyectoActivo.empresaRevisora ?? ''; }
  get supervisor(): string { return this.proyectoActivo.supervisor ?? ''; }
  get supervisorTelmex(): string { return this.proyectoActivo.vb ?? ''; }
  get proyectistaProyecto(): string { return this.proyectoActivo.proyectistaProyecto ?? ''; }
  get programa(): string { return this.proyectoActivo.programa ?? ''; }
  get anioPrograma(): string { return this.proyectoActivo.programaAnyo?.toString() ?? ''; }
  get tipoOperacion(): string { return this.proyectoActivo.programaTipo ?? ''; }

  // ─── Getters de diseño ───────────────────────────────────────────────────

  get proyectistaDisenio(): string { return this._disenioActivo.proyectista ?? ''; }
  get supervisorDisenio(): string { return this._disenioActivo.superviso ?? ''; }
  get supervisorTelmexDisenio(): string { return this._disenioActivo.vobo ?? ''; }
  get realizoInventario(): string { return this._disenioActivo.inventario ?? ''; }
  get numeroDistrito(): string { return this._disenioActivo.distrito?.numDto ?? ''; }

  // Magik: prefiere distrito_optico sobre distrito
  get distrito(): DistritoRecord | undefined {
    return this._disenioActivo.distritoOptico ?? this._disenioActivo.distrito;
  }

  // ─── Getters geográficos (del nodo inyectado) ────────────────────────────

  get estado(): string { return this._oNodo?.estado ?? ''; }
  get ciudad(): string { return (this._oNodo?.ciudad ?? '').toUpperCase(); }
  get delegacionMunicipio(): string { return this._oNodo?.delegacionMunicipio ?? ''; }
  get colonia(): string { return this._oNodo?.colonia ?? ''; }
  get cpPral(): string { return this._oNodo?.codigoPostal ?? ''; }
  get poblacion(): string { return this._oNodo?.poblacion ?? ''; }
  get tipoCentral(): string { return this._oNodo?.tipoNodo ?? 'CTL'; }
  nco(): [string | undefined, string | undefined] {
    return this._oNodo?.datosNco ?? [undefined, undefined];
  }

  // ─── Mes-Año (MM-AAAA) ───────────────────────────────────────────────────

  get mesAnio(): string {
    try {
      const ps = this.proyectoActivo.planningStart;
      if (!ps) return '';
      const mes = CProyecto.MESES[(ps.month - 1) % 12] ?? '';
      return `${mes}-${ps.year}`;
    } catch { return ''; }
  }

  // ─── Ubicación compuesta ─────────────────────────────────────────────────

  // Magik: division_telmex + "  /  " + area_telmex + "  /  " + nombre_central + " / " + diseño.name
  get ubicacion(): string {
    try {
      const d = this._disenioActivo;
      const c = this.proyectoActivo.central;
      return `${c?.division ?? ''}  /  ${c?.area ?? ''}  /  ${c?.nombre ?? ''} / ${d.name}`;
    } catch { return 'División/Área/Central/'; }
  }

  // ─── PEPs simples ────────────────────────────────────────────────────────

  get pepConsCan(): string { return this.proyectoActivo.pepConsCanal ?? ''; }
  get pepConsPrinc(): string { return this.proyectoActivo.pepConsPpal ?? ''; }
  get pepDesmCan(): string { return this.proyectoActivo.pepDesmCanal ?? ''; }
  get pepDesmPrinc(): string { return this.proyectoActivo.pepDesmPpal ?? ''; }
  get pepRecoPrinc(): string { return this.proyectoActivo.pepRecoPpal ?? ''; }
  get pepRecoSec(): string { return this.proyectoActivo.pepRecoSecu ?? ''; }
  get pepRehaCan(): string { return this.proyectoActivo.pepRehaCanal ?? ''; }
  get pepRehaPrinc(): string { return this.proyectoActivo.pepRehaPpal ?? ''; }

  // ─── PEPs con lógica FALC ────────────────────────────────────────────────

  // Magik: si diseño=secundaria AND proyecto.name matches "FALC*" AND hay oeiLocals,
  // busca OE sin tramo_cobre, sin segmentos, con tipo_trabajo=tipoTrabajo.
  // Si no cumple condición FALC, cae al campo del proyecto.
  private pepFalcSec(tipoTrabajo: string, fallback: string | undefined): string {
    try {
      const d = this._disenioActivo;
      if (
        d.tipoDiseno === 'secundaria' &&
        d.proyecto?.name.startsWith('FALC') &&
        d.oeiLocals?.length
      ) {
        for (const oe of d.oeiLocals[0].oeLocals ?? []) {
          if (
            !oe.tramoCobre &&
            !(oe.segmentoLocals?.length) &&
            oe.pep?.catalogoPep?.tipoTrabajo === tipoTrabajo
          ) {
            return oe.pep.clave;
          }
        }
      }
      return fallback ?? '';
    } catch { return ''; }
  }

  get pepConsSec(): string { return this.pepFalcSec('CONSTRUCCION',   this.proyectoActivo.pepConsSecu); }
  get pepDesmSec(): string { return this.pepFalcSec('DESMONTAJE',     this.proyectoActivo.pepDesmSecu); }
  get pepRehaSec(): string { return this.pepFalcSec('REHABILITACION', this.proyectoActivo.pepRehaSecu); }

  // ─── Número de ruta ──────────────────────────────────────────────────────

  numeroRuta(opb: OpbRecord): string {
    return opb.rutas?.numero ?? '';
  }

  // ─── OEI / OEs ───────────────────────────────────────────────────────────

  oei(opb: OpbRecord, tipoOei: string): [OeiRecord | undefined, string] {
    for (const o of opb.oeis ?? []) {
      if (o.tipoOei === tipoOei) return [o, o.valorOei];
    }
    return [undefined, ''];
  }

  oes(oei: OeiRecord): [Record<number, OeRecord>, string] {
    const coll: Record<number, OeRecord> = {};
    let lsOes = '';
    let idx = 1;
    for (const oe of oei.oeLocals ?? []) {
      coll[idx] = oe;
      lsOes = idx === 1 ? oe.numOe : `${lsOes} ,${oe.numOe}`;
      idx++;
    }
    return [coll, lsOes];
  }

  // ─── obten_peps_por_tipo ─────────────────────────────────────────────────

  // Magik: agrupa oeLocals del diseño por rubro (D/B=construcción, J=desmontaje)
  // y tipo (fibra/cobre según tipoProyecto del diseño).
  obtenPepsPorTipo(): PepsPorTipo {
    const result: PepsPorTipo = {
      construccion: { fibra: [], cobre: [], canal: [] },
      desmontaje:   { fibra: [], cobre: [], canal: [] },
    };
    for (const oe of this._disenioActivo.oeLocals ?? []) {
      const [pep, tipoPep] = this.obtenPepDeOe(oe);
      if (!pep || !tipoPep) continue;
      const entry: PepInfoEntry = {
        pep,
        opb: oe.oeiLocal?.opLocal?.numOp ?? '',
        oei: oe.oeiLocal?.numOei ?? '',
        oe:  oe.numOe,
      };
      const primer = pep.charAt(0).toUpperCase();
      if (primer === 'D' || primer === 'B') result.construccion[tipoPep].push(entry);
      else if (primer === 'J')              result.desmontaje[tipoPep].push(entry);
    }
    return result;
  }

  private obtenPepDeOe(oe: OeRecord): [string, 'fibra' | 'cobre' | ''] {
    if (!oe.pep) return ['', ''];
    const tipo = this._disenioActivo.tipoProyecto?.toLowerCase() ?? '';
    return [oe.pep.clave, tipo.startsWith('fibra') ? 'fibra' : 'cobre'];
  }

  // ─── oe_reg_scheme ───────────────────────────────────────────────────────

  oeRegScheme(pTipo: 'CONSTRUCCION' | 'DESMONTAJE' | 'RECONCENTRACION'): OeRecord | undefined {
    const map: Record<string, string> = {
      D: 'CONSTRUCCION', B: 'CONSTRUCCION', J: 'DESMONTAJE', Y: 'RECONCENTRACION',
    };
    for (const oe of this._disenioActivo.oeLocals ?? []) {
      if (map[oe.pep?.clave.charAt(0).toUpperCase() ?? ''] === pTipo) return oe;
    }
    return undefined;
  }

  // ─── GIS stubs ───────────────────────────────────────────────────────────
  // Requieren map_view / gis_program_manager — no disponibles fuera del entorno Smallworld.
  cablesDelProyecto(): unknown[] { return []; }
  buscarObjeto(_name: string): unknown[] { return []; }
  cablesEsquema(): unknown[] { return []; }
  cablePrincipal(): unknown[] { return []; }
  jalaDeCables(): string[] { return []; }
  distritosAfectados(): string { return ''; }
}
