// =============================================================================
// MIGRACIÓN: c_proyecto_red  →  CProyectoRed.tsx
// Jerarquía Magik: c_proyecto_red (clase raíz, sin parent)
// Fuente: adiciones_layout/source/Sellos/Entidad/c_proyecto_red.magik
// Empresa: Sigma Tao  ·  Autor: dsanchez  ·  27/10/2004
// =============================================================================
//
// Modelo de dominio "Proyecto de Red" para planos GIS (PNI).
// Lee del active_scheme de swg_dsn_admin_engine y agrega:
//   · collProyecto  (:design_admin :swg_dsn_project)
//   · collScheme    (:design_admin :swg_dsn_scheme)
//   · collCentral   (:catalogos   :user!_cat_nodos_cm)
//   · oDto          (CDistritoE, creado en init siempre)
//   · oCtl / oPlano / oTramo_fo  (lazy)
//
// Expone +30 getters que devuelven strings de proyecto/scheme/central con
// fallback al sValor_Defecto si no hay scheme activo.
// =============================================================================

import React, { useMemo, useState } from 'react';
import { CDistritoE, type MockLandbaseDB } from './CDistritoE';

// ---------------------------------------------------------------------------
// Tipos (D5 — XxxRecord para campos user!_*)
// ---------------------------------------------------------------------------

export interface SchemeRecord {
  id:                            number;
  'user!_distrito':              string;
  'user!_colonia':               string;
  'user!_calles':                string;
  'user!_dtos_afectados':        string;
  'user!_aprobo':                string;
  'user!_numero_ruta':           string;
  'user!_ref_desmontaje':        string;
  'user!_ref_reconcentracion':   string;
  'user!_ref_canalizacion':      string;
  'user!_ref_principales':       string;
  'user!_ref_secundarios':       string;
  'user!_cp':                    string | undefined;
  swg_dsn_project_id:            number;
}

// :user!_central en el record de proyecto es un objeto :user!_cat_nodos_cm
export interface CentralCatRecord {
  'user!_siglas':   string;
  'user!_central':  string;
  'user!_nom_nodo': string;
}

export interface ProjectRecord {
  id:                             number;
  name:                           string;
  'user!_direccion_divisional':   string;
  'user!_direccion':              string;
  'user!_telefono_responsable':   string;
  'user!_responsable':            string;
  'user!_loc_pr':                 string;
  'user!_municipio':              string;
  'user!_supervisor':             string;
  'user!_Programa':               string;
  'user!_est':                    string | undefined;
  'user!_empresa_proyecto':       string | undefined;
  'user!_empresa_revisora':       string | undefined;
  'user!_oficina_constructora':   string | undefined;
  'user!_subdireccion':           string;
  'user!_gerencia':               string;
  'user!_fecha_entrega':          string;       // formato dd/mm/yyyy
  'user!_central':                CentralCatRecord | undefined;
}

export interface PlanoRecord {
  id:               number;
  'user!_nombre':   string;
  'user!_tipo':     string;
  'user!_observ':   string | undefined;
}

// Active scheme (mockea swg_dsn_admin_engine.active_scheme)
export interface ActiveSchemeRef {
  id: number;
}

// Mock combinado de las 3 BDs Smallworld que toca esta clase
export interface MockProyectoDB {
  active_scheme:   ActiveSchemeRef | undefined;
  schemes:         SchemeRecord[];
  projects:        ProjectRecord[];
  centrals:        CentralCatRecord[];     // :catalogos :user!_cat_nodos_cm
  planos:          PlanoRecord[];          // :design_admin :user!_plano
  landbase:        MockLandbaseDB;         // para el CDistritoE anidado
}

// ---------------------------------------------------------------------------
// Stubs ligeros para Central() y Plano() (lazy)
// ---------------------------------------------------------------------------

export interface CentralLite {
  siglas: string;
}

export interface PlanoLite {
  id:      number;
  nombre:  string;
  tipo:    string;
  observ:  string | undefined;
}

// Magik: c_Tramo_fo_e — modelado mínimo (suficiente para obten_tramo)
export class CTramoFoE {
  sNum_Ruta:  string = '';
  sNum_Tramo: string = '';

  asigna_num_tramo(numRuta: string, numTramo: string): void {
    this.sNum_Ruta  = numRuta;
    this.sNum_Tramo = numTramo;
  }
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const VALOR_DEFECTO = '';
const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'] as const;

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_proyecto_red. Cada getter sigue la receta Magik:
 *   1. LbTodoBien = prvValida_proyecto()
 *   2. Si OK → devuelve campo.write_string del record correspondiente
 *   3. Si no → devuelve sValor_Defecto ('')
 */
export class CProyectoRed {
  // ── Slots fijos (define_slot_access ... :public) ─────────────────────────
  yTabla = ':user!_proyecto_red';
  yBdD   = ':design_admin';

  // ── Slots de colecciones (rellenados por prvLeer_Proyecto_BdD) ───────────
  collScheme:   SchemeRecord[]    | undefined = undefined;
  collProyecto: ProjectRecord[]   | undefined = undefined;
  collCentral:  CentralCatRecord[]| undefined = undefined;

  // ── oDto (PUBLIC en Magik) ───────────────────────────────────────────────
  oDto: CDistritoE | undefined = undefined;

  // ── Slots privados (lazy) ────────────────────────────────────────────────
  private _oCtl:      CentralLite | undefined = undefined;
  private _oPlano:    PlanoLite   | undefined = undefined;
  private _oScheme:   ActiveSchemeRef | undefined = undefined;
  private _oTramo_fo: CTramoFoE | undefined = undefined;
  private readonly _sValor_Defecto = VALOR_DEFECTO;

  constructor(private readonly _db: MockProyectoDB) {
    // Magik new() asigna .oDto << _unset y _return _clone.
    // En TS los slots ya están a undefined desde la declaración.
  }

  // ── version() ────────────────────────────────────────────────────────────
  static version(): string {
    return 'version 1.0.0.8 27/04/05 17:30 ';
  }

  // ── sValor_Defecto (getter público para fallback uniforme) ───────────────
  get sValor_defecto(): string { return this._sValor_Defecto; }

  // ── identificador_proyecto(RsValor) ──────────────────────────────────────
  identificador_proyecto(valor: string): void {
    this.oDto = undefined;
    this._prvLeer_Proyecto_BdD(valor);
  }

  // ── prvLeer_Proyecto_BdD(id_proyecto, id_schema?) ───────────────────────
  // Magik: lee active_scheme, predicados sobre schemes/projects/centrals,
  // crea CDistritoE siempre (dentro o fuera del bloque if scheme).
  private _prvLeer_Proyecto_BdD(_idProyecto: string, _idSchema?: string): void {
    this._oScheme = this._db.active_scheme;
    let distrito: string | undefined;

    if (this._oScheme !== undefined) {
      const idScheme = this._oScheme.id;

      // predicate.eq(:id, idScheme) sobre swg_dsn_scheme
      this.collScheme = this._db.schemes.filter(s => s.id === idScheme);

      const scheme = this.collScheme[0];
      if (scheme !== undefined) {
        // predicate.eq(:id, scheme.swg_dsn_project_id) sobre swg_dsn_project
        this.collProyecto = this._db.projects.filter(p => p.id === scheme.swg_dsn_project_id);

        const proyecto = this.collProyecto[0];
        if (proyecto !== undefined && proyecto['user!_central']) {
          // predicate.eq(:user!_siglas, central) sobre :user!_cat_nodos_cm
          const cve = proyecto['user!_central']['user!_siglas'];
          this.collCentral = this._db.centrals.filter(c => c['user!_siglas'] === cve);
        } else {
          this.collCentral = [];
        }

        distrito = String(scheme['user!_distrito']);
      }
    }

    // CDistritoE se crea siempre (con o sin scheme activo)
    this.oDto = new CDistritoE(this._db.landbase);
    if (distrito !== undefined) {
      this.oDto.distrito = distrito;
    }
  }

  // ── prvValida_proyecto() ────────────────────────────────────────────────
  private _prvValida_proyecto(): boolean {
    return this._oScheme !== undefined;
  }

  // Helper común: si valida → fn(); si no → sValor_defecto. Reemplaza la
  // receta `_local LbTodoBien << _self.prvValida_proyecto(); _if Lb... _then`
  // que aparece +25 veces en el Magik original.
  private _fromProyecto<K extends keyof ProjectRecord>(key: K, fallback?: string): string {
    if (!this._prvValida_proyecto()) return this._sValor_Defecto;
    const rec = this.collProyecto?.[0];
    const val = rec?.[key];
    if (val === undefined) return fallback ?? this._sValor_Defecto;
    return String(val);
  }

  private _fromScheme<K extends keyof SchemeRecord>(key: K, fallback?: string): string {
    if (!this._prvValida_proyecto()) return this._sValor_Defecto;
    const rec = this.collScheme?.[0];
    const val = rec?.[key];
    if (val === undefined) return fallback ?? this._sValor_Defecto;
    return String(val);
  }

  // ── Getters de PROYECTO (collProyecto) ───────────────────────────────────
  direccion_divisional():  string { return this._fromProyecto('user!_direccion_divisional'); }
  direccion():             string { return this._fromProyecto('user!_direccion'); }
  tel_responsable():       string { return this._fromProyecto('user!_telefono_responsable'); }
  responsable():           string { return this._fromProyecto('user!_responsable'); }
  localidad():             string { return this._fromProyecto('user!_loc_pr'); }
  municipio_delegacion():  string { return this._fromProyecto('user!_municipio'); }
  supervisor():            string { return this._fromProyecto('user!_supervisor'); }
  programa():              string { return this._fromProyecto('user!_Programa'); }
  subdireccion():          string { return this._fromProyecto('user!_subdireccion'); }
  gerencia():              string { return this._fromProyecto('user!_gerencia'); }
  fecha_aprobacion():      string { return this._fromProyecto('user!_fecha_entrega'); }
  nombre_proyecto():       string {
    if (!this._prvValida_proyecto()) return this._sValor_Defecto;
    return String(this.collProyecto?.[0]?.name ?? this._sValor_Defecto);
  }
  empresa_proyecto():      string { return this._fromProyecto('user!_empresa_proyecto',     '_OFI CONSTR_'); }
  empresa_constructora():  string { return this._fromProyecto('user!_empresa_revisora',     '_EMP CONSTR_'); }
  oficina_constructora():  string { return this._fromProyecto('user!_oficina_constructora', '_OFI CONSTR_'); }
  estado():                string { return this._fromProyecto('user!_est',                  '_EDO_'); }

  // ── cve_central / central (cruzan collProyecto.user!_central → CentralCat)
  cve_central(): string {
    if (!this._prvValida_proyecto()) return this._sValor_Defecto;
    const proy = this.collProyecto?.[0];
    if (proy?.['user!_central'] === undefined) return '_ABC_';
    return String(proy['user!_central']['user!_central']);
  }

  central(): string {
    if (!this._prvValida_proyecto()) return this._sValor_Defecto;
    const proy = this.collProyecto?.[0];
    if (proy?.['user!_central'] === undefined) return '_NOMBRE_';
    return String(proy['user!_central']['user!_nom_nodo']);
  }

  // Bug del Magik: pep/oei/oe devuelven sValor_defecto en ambas ramas
  // (el código real está comentado). Se preserva el comportamiento.
  pep(): string { return this._sValor_Defecto; }
  oei(): string { return this._sValor_Defecto; }
  oe():  string { return this._sValor_Defecto; }

  // ── Getters de SCHEME (collScheme) ───────────────────────────────────────
  colonia():                  string { return this._fromScheme('user!_colonia'); }
  calles():                   string { return this._fromScheme('user!_calles'); }
  dtos_afectados():           string { return this._fromScheme('user!_dtos_afectados'); }
  opb():                      string { return this._sValor_Defecto; } // comentado en Magik
  aprobo():                   string { return this._fromScheme('user!_aprobo'); }
  referencia_desmontaje():    string { return this._fromScheme('user!_ref_desmontaje'); }
  referencia_reconcentracion(): string { return this._fromScheme('user!_ref_reconcentracion'); }
  referencia_canalizacion():  string { return this._fromScheme('user!_ref_canalizacion'); }
  referencia_principales():   string { return this._fromScheme('user!_ref_principales'); }
  referencia_secundarios():   string { return this._fromScheme('user!_ref_secundarios'); }
  distrito():                 string { return this._fromScheme('user!_distrito'); }
  numero_ruta():              string { return this._fromScheme('user!_numero_ruta'); }
  cve_distrito():             string { return this._fromScheme('user!_distrito'); }
  reviso():                   string { return this._fromScheme('user!_aprobo'); }
  cp():                       string { return this._fromScheme('user!_cp', '_123_'); }

  // ── NSE_predominante — delega en oDto ────────────────────────────────────
  NSE_predominante(): string {
    if (!this._prvValida_proyecto() || !this.oDto) return this._sValor_Defecto;
    return this.oDto.obten_inicial_NSE(this.oDto.sNSE_Predominante);
  }

  // ── existe? ──────────────────────────────────────────────────────────────
  existe(): boolean {
    if (!this._prvValida_proyecto()) return false;
    return (this.collProyecto?.length ?? 0) > 0;
  }

  // ── obten_tramo(PsCve_tramo, PsCve_ruta?) ────────────────────────────────
  obten_tramo(cveTramo: string, cveRuta?: string): CTramoFoE | undefined {
    if (this._oTramo_fo === undefined) {
      this._oTramo_fo = new CTramoFoE();
    }
    const t = this._oTramo_fo;
    if (t.sNum_Ruta !== cveRuta || t.sNum_Tramo !== cveTramo) {
      const lsCveRuta = cveRuta === undefined ? this.numero_ruta() : cveRuta;
      // Magik: write("Se tomó el número de ruta del diseño/parámetro")
      t.asigna_num_tramo(lsCveRuta, cveTramo);
    }
    return t;
  }

  // ── mes_anio(RsFecha) ────────────────────────────────────────────────────
  // Magik: "dd/mm/yyyy" → "MMM/yy"  (subseq 1-indexed: posiciones 4 y 9 → mes/año)
  mes_anio(fecha: string | undefined): string {
    if (fecha === undefined || fecha === this._sValor_Defecto) return this._sValor_Defecto;
    if (fecha.length !== 10) {
      throw new Error(`Fecha incorrecta. ${fecha}`);
    }
    // Magik subseq(4,2) → start=4 → en JS substring(3, 5) (1-indexed → 0-indexed -1)
    const mesStr = fecha.substring(3, 5);
    const anioStr = fecha.substring(8, 10);
    const mesNum = Number(mesStr);
    if (Number.isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      throw new Error(`Fecha incorrecta. ${fecha}`);
    }
    return `${MESES[mesNum - 1]}/${anioStr}`;
  }

  // ── Central() — lazy ─────────────────────────────────────────────────────
  Central(): CentralLite | undefined {
    if (this._oCtl === undefined) {
      const proy = this.collProyecto?.[0];
      const siglas = proy?.['user!_central']?.['user!_central'];
      if (siglas !== undefined) {
        this._oCtl = { siglas: String(siglas) };
      }
    }
    return this._oCtl;
  }

  // ── Plano(IdPlano) — lazy ────────────────────────────────────────────────
  Plano(idPlano: number): PlanoLite | undefined {
    if (this._oPlano === undefined) {
      const rec = this._db.planos.find(p => p.id === idPlano);
      if (rec) {
        this._oPlano = {
          id:     rec.id,
          nombre: rec['user!_nombre'],
          tipo:   rec['user!_tipo'],
          observ: rec['user!_observ'],
        };
      }
    }
    return this._oPlano;
  }

  // ── Getters de inspección (no en Magik) ──────────────────────────────────
  get oScheme(): ActiveSchemeRef | undefined { return this._oScheme; }
  get oTramo_fo(): CTramoFoE | undefined { return this._oTramo_fo; }
}

// =============================================================================
// Mock dataset — replica las 3 BDs Smallworld que toca esta clase
// =============================================================================

const MOCK_DB: MockProyectoDB = {
  active_scheme: { id: 1001 },
  schemes: [
    {
      id: 1001,
      'user!_distrito':            'DTO-001',
      'user!_colonia':             'Roma Norte',
      'user!_calles':              'Orizaba / Álvaro Obregón',
      'user!_dtos_afectados':      'DTO-001, DTO-002',
      'user!_aprobo':              'Ing. M. López',
      'user!_numero_ruta':         'RT-097',
      'user!_ref_desmontaje':      'RD-12',
      'user!_ref_reconcentracion': 'RC-08',
      'user!_ref_canalizacion':    'CN-44',
      'user!_ref_principales':     'PR-31',
      'user!_ref_secundarios':     'SC-17',
      'user!_cp':                  '06700',
      swg_dsn_project_id:          5001,
    },
    {
      id: 1002,
      'user!_distrito':            'DTO-002',
      'user!_colonia':             'Polanco',
      'user!_calles':              'Masaryk / Anatole France',
      'user!_dtos_afectados':      'DTO-002',
      'user!_aprobo':              'Ing. A. Sánchez',
      'user!_numero_ruta':         'RT-110',
      'user!_ref_desmontaje':      'RD-21',
      'user!_ref_reconcentracion': 'RC-09',
      'user!_ref_canalizacion':    'CN-55',
      'user!_ref_principales':     'PR-40',
      'user!_ref_secundarios':     'SC-20',
      'user!_cp':                  undefined, // forzará el fallback '_123_'
      swg_dsn_project_id:          5002,
    },
  ],
  projects: [
    {
      id: 5001,
      name:                          'CAN0001 — Roma Norte FO',
      'user!_direccion_divisional':  'Dirección Divisional Metro CDMX',
      'user!_direccion':             'Av. Insurgentes Sur 1234',
      'user!_telefono_responsable':  '55-1234-5678',
      'user!_responsable':           'Ing. C. Hernández',
      'user!_loc_pr':                'Ciudad de México',
      'user!_municipio':             'Cuauhtémoc',
      'user!_supervisor':            'Ing. R. García',
      'user!_Programa':              'PNI 2026',
      'user!_est':                   'CDMX',
      'user!_empresa_proyecto':      'Telmex Construcciones',
      'user!_empresa_revisora':      'Sigma Tao',
      'user!_oficina_constructora':  'Of. Constr. Centro',
      'user!_subdireccion':          'Subdirección Metropolitana',
      'user!_gerencia':              'Gerencia Operativa CDMX',
      'user!_fecha_entrega':         '15/03/2026',
      'user!_central':               { 'user!_siglas': 'ROM', 'user!_central': 'ROM', 'user!_nom_nodo': 'Central Roma' },
    },
    {
      id: 5002,
      name:                          'CAN0002 — Polanco Backbone',
      'user!_direccion_divisional':  'Dirección Divisional Metro CDMX',
      'user!_direccion':             'Av. Presidente Masaryk 500',
      'user!_telefono_responsable':  '55-9876-5432',
      'user!_responsable':           'Ing. L. Pérez',
      'user!_loc_pr':                'Ciudad de México',
      'user!_municipio':             'Miguel Hidalgo',
      'user!_supervisor':            'Ing. P. Torres',
      'user!_Programa':              'PNI 2026',
      'user!_est':                   undefined,             // forzará '_EDO_'
      'user!_empresa_proyecto':      undefined,             // forzará '_OFI CONSTR_'
      'user!_empresa_revisora':      undefined,             // forzará '_EMP CONSTR_'
      'user!_oficina_constructora':  undefined,
      'user!_subdireccion':          'Subdirección Metropolitana',
      'user!_gerencia':              'Gerencia Operativa CDMX',
      'user!_fecha_entrega':         '22/06/2026',
      'user!_central':               undefined,             // forzará '_ABC_' / '_NOMBRE_'
    },
  ],
  centrals: [
    { 'user!_siglas': 'ROM', 'user!_central': 'ROM', 'user!_nom_nodo': 'Central Roma' },
    { 'user!_siglas': 'PLZ', 'user!_central': 'PLZ', 'user!_nom_nodo': 'Central Polanco' },
  ],
  planos: [
    { id: 9001, 'user!_nombre': 'Plano FCYDG Roma', 'user!_tipo': 'CONSTRUCCION', 'user!_observ': 'Revisión 2' },
    { id: 9002, 'user!_nombre': 'Plano Backbone',   'user!_tipo': 'TOPOLOGICO',   'user!_observ': undefined },
  ],
  landbase: {
    distritos: [
      { 'user!_distrito': 'DTO-001', 'user!_limite': 'POLY-001' },
      { 'user!_distrito': 'DTO-002', 'user!_limite': 'POLY-002' },
    ],
    lotes: [
      {
        'user!_lote': 'L-101', 'user!_distrito_ref': 'DTO-001', 'user!_limite': 'POLY-001',
        'user!_detalle_lotes': [
          { 'user!_nivel_socio': 'RESIDENCIAL B', 'user!_cantidad_servicios': 2 },
          { 'user!_nivel_socio': 'COMERCIAL 1ª.', 'user!_cantidad_servicios': 3 },
        ],
      },
      {
        'user!_lote': 'L-201', 'user!_distrito_ref': 'DTO-002', 'user!_limite': 'POLY-002',
        'user!_detalle_lotes': [
          { 'user!_nivel_socio': 'INDUSTRIAL LIGERA', 'user!_cantidad_servicios': 4 },
        ],
      },
    ],
  },
};

// =============================================================================
// Componente React — CProyectoRedUI
// =============================================================================

const styles = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 760,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  cardTitle: { color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1 } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '210px 1fr', gap: 4, fontSize: 11, padding: '2px 0' } as React.CSSProperties,
  k:   { color: '#89dceb' } as React.CSSProperties,
  v:   { color: '#a6e3a1' } as React.CSSProperties,
  vmuted: { color: '#fab387' } as React.CSSProperties,
  btn: {
    padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 6, marginBottom: 4,
  } as React.CSSProperties,
  pill: (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '1px 8px', borderRadius: 10, fontSize: 10,
    background: ok ? '#a6e3a1' : '#f38ba8', color: '#1e1e2e', marginLeft: 6,
  }),
  input: {
    background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
    borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12,
    marginLeft: 4, width: 110,
  } as React.CSSProperties,
};

type SchemeChoice = number | 'none';

const FALLBACK_HINTS = new Set(['_ABC_', '_NOMBRE_', '_EDO_', '_OFI CONSTR_', '_EMP CONSTR_', '_123_']);

function Field({ label, value }: { label: string; value: string }) {
  const isFallback = FALLBACK_HINTS.has(value);
  const isEmpty    = value === '';
  return (
    <div style={styles.row}>
      <span style={styles.k}>{label}</span>
      <span style={isFallback ? styles.vmuted : (isEmpty ? { color: '#585b70' } : styles.v)}>
        {isEmpty ? '— (sValor_Defecto)' : value}
      </span>
    </div>
  );
}

export function CProyectoRedUI() {
  const [schemeId, setSchemeId] = useState<SchemeChoice>(1001);
  const [tramoIn,  setTramoIn]  = useState({ cveTramo: 'TR-01', cveRuta: '' });
  const [fechaIn,  setFechaIn]  = useState('15/03/2026');
  const [planoId,  setPlanoId]  = useState<number>(9001);

  const proy = useMemo(() => {
    const db: MockProyectoDB = {
      ...MOCK_DB,
      active_scheme: schemeId === 'none' ? undefined : { id: schemeId as number },
    };
    const p = new CProyectoRed(db);
    p.identificador_proyecto('CAN0001');
    return p;
  }, [schemeId]);

  const existe = proy.existe();
  const tramo  = proy.obten_tramo(tramoIn.cveTramo, tramoIn.cveRuta || undefined);
  const plano  = proy.Plano(planoId);
  const ctl    = proy.Central();

  let mesAnio: string;
  try   { mesAnio = proy.mes_anio(fechaIn); }
  catch (e) { mesAnio = `ERROR: ${(e as Error).message}`; }

  return (
    <div style={styles.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CProyectoRed</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          modelo dominio proyecto · scheme + project + central + distrito
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 10 }}>
          ({CProyectoRed.version().trim()})
        </span>
      </div>

      {/* Selector de active_scheme */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>swg_dsn_admin_engine.active_scheme</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[1001, 1002, 'none' as const].map(id => (
            <button
              key={String(id)}
              onClick={() => setSchemeId(id)}
              style={{
                ...styles.btn,
                background: schemeId === id ? '#89b4fa' : '#313244',
                color: schemeId === id ? '#1e1e2e' : '#bac2de',
              }}
            >
              {id === 'none' ? 'unset (sin scheme)' : `scheme #${id}`}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, marginTop: 4 }}>
          <span style={styles.k}>prvValida_proyecto():</span>
          <span style={styles.pill(proy.oScheme !== undefined)}>
            {proy.oScheme !== undefined ? 'OK' : 'falla → todos los getters devuelven sValor_Defecto'}
          </span>
          <span style={{ ...styles.k, marginLeft: 12 }}>existe?:</span>
          <span style={styles.pill(existe)}>{existe ? 'existe' : 'no existe'}</span>
        </div>
      </div>

      {/* Datos de Proyecto */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>collProyecto (swg_dsn_project)</div>
        <Field label="nombre_proyecto"        value={proy.nombre_proyecto()} />
        <Field label="direccion_divisional"   value={proy.direccion_divisional()} />
        <Field label="direccion"              value={proy.direccion()} />
        <Field label="responsable"            value={proy.responsable()} />
        <Field label="tel_responsable"        value={proy.tel_responsable()} />
        <Field label="supervisor"             value={proy.supervisor()} />
        <Field label="localidad"              value={proy.localidad()} />
        <Field label="municipio_delegacion"   value={proy.municipio_delegacion()} />
        <Field label="estado"                 value={proy.estado()} />
        <Field label="subdireccion"           value={proy.subdireccion()} />
        <Field label="gerencia"               value={proy.gerencia()} />
        <Field label="programa"               value={proy.programa()} />
        <Field label="empresa_proyecto"       value={proy.empresa_proyecto()} />
        <Field label="empresa_constructora"   value={proy.empresa_constructora()} />
        <Field label="oficina_constructora"   value={proy.oficina_constructora()} />
        <Field label="fecha_aprobacion"       value={proy.fecha_aprobacion()} />
        <Field label="cve_central"            value={proy.cve_central()} />
        <Field label="central"                value={proy.central()} />
        <Field label="pep / oei / oe"         value={`${proy.pep()} | ${proy.oei()} | ${proy.oe()} (comentados en Magik)`} />
      </div>

      {/* Datos de Scheme */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>collScheme (swg_dsn_scheme)</div>
        <Field label="colonia"                    value={proy.colonia()} />
        <Field label="calles"                     value={proy.calles()} />
        <Field label="cp"                         value={proy.cp()} />
        <Field label="distrito / cve_distrito"    value={`${proy.distrito()} / ${proy.cve_distrito()}`} />
        <Field label="dtos_afectados"             value={proy.dtos_afectados()} />
        <Field label="aprobo / reviso"            value={`${proy.aprobo()} / ${proy.reviso()}`} />
        <Field label="numero_ruta"                value={proy.numero_ruta()} />
        <Field label="referencia_desmontaje"      value={proy.referencia_desmontaje()} />
        <Field label="referencia_reconcentracion" value={proy.referencia_reconcentracion()} />
        <Field label="referencia_canalizacion"    value={proy.referencia_canalizacion()} />
        <Field label="referencia_principales"     value={proy.referencia_principales()} />
        <Field label="referencia_secundarios"     value={proy.referencia_secundarios()} />
        <Field label="opb"                        value={proy.opb() || '— (sValor_Defecto)'} />
      </div>

      {/* CDistritoE anidado */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>oDto: CDistritoE  ·  NSE_predominante()</div>
        <Field label="oDto.distrito"           value={proy.oDto?.distrito ?? '—'} />
        <Field label="oDto.existe"             value={String(proy.oDto?.existe ?? false)} />
        <Field label="oDto.sNSE_Predominante"  value={proy.oDto?.sNSE_Predominante ?? '—'} />
        <Field label="oDto.sTotal_Viviendas"   value={proy.oDto?.sTotal_Viviendas ?? '—'} />
        <Field label="oDto.sTotal_Lineas"      value={proy.oDto?.sTotal_Lineas ?? '—'} />
        <Field label="NSE_predominante()"      value={proy.NSE_predominante()} />
      </div>

      {/* Central() / Plano() lazy */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>lazy: Central() · Plano(id)</div>
        <Field label="Central().siglas"        value={ctl?.siglas ?? '—'} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '6px 0' }}>
          <span style={styles.k}>Plano(id):</span>
          {MOCK_DB.planos.map(p => (
            <button
              key={p.id}
              onClick={() => setPlanoId(p.id)}
              style={{
                ...styles.btn,
                background: planoId === p.id ? '#89b4fa' : '#313244',
                color: planoId === p.id ? '#1e1e2e' : '#bac2de',
              }}
            >
              #{p.id}
            </button>
          ))}
        </div>
        <Field label="Plano.nombre"            value={plano?.nombre ?? '—'} />
        <Field label="Plano.tipo"              value={plano?.tipo   ?? '—'} />
        <Field label="Plano.observ"            value={plano?.observ ?? '— (unset)'} />
      </div>

      {/* obten_tramo */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>obten_tramo(cveTramo, cveRuta?) · CTramoFoE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={styles.k}>cveTramo:</span>
          <input
            style={styles.input}
            value={tramoIn.cveTramo}
            onChange={e => setTramoIn(s => ({ ...s, cveTramo: e.target.value }))}
          />
          <span style={{ ...styles.k, marginLeft: 12 }}>cveRuta (opcional):</span>
          <input
            style={styles.input}
            value={tramoIn.cveRuta}
            onChange={e => setTramoIn(s => ({ ...s, cveRuta: e.target.value }))}
            placeholder={`(usa scheme.numero_ruta=${proy.numero_ruta()})`}
          />
        </div>
        <Field label="tramo.sNum_Ruta"  value={tramo?.sNum_Ruta  ?? '—'} />
        <Field label="tramo.sNum_Tramo" value={tramo?.sNum_Tramo ?? '—'} />
      </div>

      {/* mes_anio */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>mes_anio(RsFecha) — "dd/mm/yyyy" → "MMM/yy"</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={styles.k}>RsFecha:</span>
          <input
            style={styles.input}
            value={fechaIn}
            onChange={e => setFechaIn(e.target.value)}
          />
          {['15/03/2026','22/06/2026','01/12/2025','bad-date'].map(d => (
            <button
              key={d}
              onClick={() => setFechaIn(d)}
              style={{ ...styles.btn, background: '#313244', color: '#bac2de' }}
            >
              {d}
            </button>
          ))}
        </div>
        <Field label="resultado" value={mesAnio} />
      </div>
    </div>
  );
}
