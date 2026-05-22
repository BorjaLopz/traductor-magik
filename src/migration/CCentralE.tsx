// ================================================================================
//  MIGRACIÓN: c_central_e.magik → CCentralE.tsx
//  Clase origen : c_central_e (def_slotted_exemplar)
//  Autor orig.  : dsanchez — 20/12/2005, bvelazquez — 21/12/2005
// ================================================================================
//
//  Entidad de dominio: representa los datos de una central (exchange/nodo).
//  Resuelve siglas → registros de BD (gis.building + landbase.user!_central).
//
//  Sin geometría espacial — solo lookups por predicado en mock GIS DB.
//  Patrón: setter de siglas dispara lectura async; getters tipo/nombre/
//  localidad/municipio devuelven valores del registro resuelto o el
//  valor por defecto si no se encontró.
//
// ================================================================================

import React, { useMemo, useState } from 'react';

// ─── Tipos de registros BD (mock GIS service) ─────────────────────────────────

// Registro de gis.building (nodo/central)
export interface CtlRow {
  'user!_siglas':    string;
  'user!_tipo':      string;
  'user!_nom_nodo':  string;
  'user!_localidad': string;
}

// Registro de landbase.user!_central (límite)
export interface LimiteRow {
  'user!_central': string;
  municipio:       string;
}

// Servicio GIS — equivalente a smallworld_product.pni_application().database
export interface ICentralGisService {
  // collection(:gis, :building).select(predicate.eq(:user!_siglas, X)).an_element()
  selectCtlBySiglas(siglas: string): Promise<CtlRow | undefined>;
  // collection(:landbase, :user!_central).select(predicate.eq(:user!_central, X)).an_element()
  selectLimiteBySiglas(siglas: string): Promise<LimiteRow | undefined>;
}

// ─── Mock catálogo (sustituible por el servicio real) ─────────────────────────

const MOCK_CTLS: CtlRow[] = [
  { 'user!_siglas': 'MEX01', 'user!_tipo': 'CENTRAL',     'user!_nom_nodo': 'MEXICO CENTRO',  'user!_localidad': 'CDMX' },
  { 'user!_siglas': 'MEX02', 'user!_tipo': 'NODO',        'user!_nom_nodo': 'MEXICO NORTE',   'user!_localidad': 'CDMX' },
  { 'user!_siglas': 'GDL01', 'user!_tipo': 'CENTRAL',     'user!_nom_nodo': 'GUADALAJARA',    'user!_localidad': 'GDL' },
  { 'user!_siglas': 'MTY01', 'user!_tipo': 'NODO EDFA',   'user!_nom_nodo': 'MONTERREY SUR',  'user!_localidad': 'MTY' },
];

const MOCK_LIMITES: LimiteRow[] = [
  { 'user!_central': 'MEX01', municipio: 'CUAUHTEMOC' },
  { 'user!_central': 'MEX02', municipio: 'GUSTAVO A. MADERO' },
  { 'user!_central': 'GDL01', municipio: 'GUADALAJARA' },
  { 'user!_central': 'MTY01', municipio: 'MONTERREY' },
];

export const mockCentralGisService: ICentralGisService = {
  async selectCtlBySiglas(siglas) {
    await new Promise(r => setTimeout(r, 80));   // simula latencia BD
    return MOCK_CTLS.find(c => c['user!_siglas'] === siglas);
  },
  async selectLimiteBySiglas(siglas) {
    await new Promise(r => setTimeout(r, 60));
    return MOCK_LIMITES.find(l => l['user!_central'] === siglas);
  },
};

// ─── CCentralE ────────────────────────────────────────────────────────────────

export class CCentralE {
  // Slots — define_slot_access(:writable, :private)
  private _sSiglas:          string | undefined;
  private _oCtl:             CtlRow | undefined;
  private _oLimite:          LimiteRow | undefined;
  private _oValorPorDefecto: string = ' ';   // default " "

  // Servicio GIS inyectado — equivalente a smallworld_product.pni_application()
  private readonly gis: ICentralGisService;

  // ── version() ───────────────────────────────────────────────────────────
  static version(): string { return 'version 1.00.00.00 20/12/05 12:30 '; }

  // ── new() ───────────────────────────────────────────────────────────────
  // _self.sSiglas << _unset
  // _return _clone
  constructor(gis: ICentralGisService = mockCentralGisService) {
    this.gis      = gis;
    this._sSiglas = undefined;        // _unset
    this._oCtl    = undefined;
    this._oLimite = undefined;
  }

  // ── existe_nodo?  →  _return _self.oCtl _isnt _unset ───────────────────
  existe_nodo(): boolean { return this._oCtl !== undefined; }

  // ── existe_limite?  →  _return _self.oLimite _isnt _unset ──────────────
  existe_limite(): boolean { return this._oLimite !== undefined; }

  // ── siglas getter  →  _return .sSiglas.write_string ────────────────────
  get siglas(): string {
    return this._sSiglas !== undefined ? String(this._sSiglas) : this._oValorPorDefecto;
  }

  // ── siglas << RsValor  →  setter + prvLeer_Central_BdD() ───────────────
  //
  //   .sSiglas << RsValor
  //   _self.prvLeer_Central_BdD()
  //
  // Magik es síncrono; aquí setSiglas es async porque la BD lo es en web.
  // Para mantener el contrato del setter (sin await), exponemos también
  // setSiglasSync que asigna sin disparar la lectura.
  async setSiglas(RsValor: string): Promise<void> {
    this._sSiglas = RsValor;
    await this._prvLeer_Central_BdD();
  }

  // ── tipo  →  oCtl.user!_tipo.write_string  /  default ──────────────────
  tipo(): string {
    return this.existe_nodo()
      ? String(this._oCtl!['user!_tipo'])
      : this._oValorPorDefecto;
  }

  // ── nombre  →  oCtl.user!_nom_nodo.write_string  /  default ────────────
  nombre(): string {
    return this.existe_nodo()
      ? String(this._oCtl!['user!_nom_nodo'])
      : this._oValorPorDefecto;
  }

  // ── localidad  →  oCtl.user!_localidad.write_string  /  default ────────
  localidad(): string {
    return this.existe_nodo()
      ? String(this._oCtl!['user!_localidad'])
      : this._oValorPorDefecto;
  }

  // ── municipio_delegacion  →  oLimite.municipio.write_string / default ──
  municipio_delegacion(): string {
    return this.existe_limite()
      ? String(this._oLimite!.municipio)
      : this._oValorPorDefecto;
  }

  // ── oValorPorDefecto setter (writable :private en Magik) ───────────────
  setValorPorDefecto(v: string): void { this._oValorPorDefecto = v; }

  // Acceso de solo lectura a los registros resueltos (útil para depuración)
  get oCtl():    CtlRow    | undefined { return this._oCtl; }
  get oLimite(): LimiteRow | undefined { return this._oLimite; }

  // ── prvLeer_Central_BdD() — :private ───────────────────────────────────
  //
  //   LoPAF        << smallworld_product.pni_application()
  //   LoLimite_BD  << LoPAF.database.collection(:landbase, :user!_central)
  //   LoPred_Limite<< predicate.eq(:user!_central, _self.sSiglas)
  //   _self.oLimite << LoLimite_BD.select(LoPred_Limite).an_element()
  //
  //   LoCtl_BD     << LoPAF.database.collection(:gis, :building)
  //   LoPred_Ctl   << predicate.eq(:user!_siglas, _self.sSiglas)
  //   _self.oCtl   << LoCtl_BD.select(LoPred_Ctl).an_element()
  //
  // Async en web — las dos lecturas se paralelizan con Promise.all (en Magik
  // eran secuenciales pero independientes, no hay dependencia entre ellas).
  private async _prvLeer_Central_BdD(): Promise<void> {
    if (this._sSiglas === undefined) {
      this._oLimite = undefined;
      this._oCtl    = undefined;
      return;
    }
    const [limite, ctl] = await Promise.all([
      this.gis.selectLimiteBySiglas(this._sSiglas),
      this.gis.selectCtlBySiglas(this._sSiglas),
    ]);
    this._oLimite = limite;
    this._oCtl    = ctl;
  }
}

// ================================================================================
//  UI de demo — CCentralEUI
// ================================================================================

const s = {
  wrap:  { fontFamily: 'monospace', fontSize: 13, padding: 16,
           background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8 } as React.CSSProperties,
  box:   { background: '#313244', padding: '10px 14px', borderRadius: 6,
           marginBottom: 12 } as React.CSSProperties,
  label: { color: '#a6e3a1', fontWeight: 700, marginBottom: 6,
           display: 'block', fontSize: 12 } as React.CSSProperties,
  row:   { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 },
  btn:   { padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
           background: '#89b4fa', color: '#1e1e2e',
           fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  btnGhost: { padding: '5px 12px', borderRadius: 4, border: '1px solid #45475a',
              cursor: 'pointer', background: 'transparent', color: '#cdd6f4',
              fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties,
  input: { background: '#45475a', color: '#cdd6f4', border: 'none', borderRadius: 4,
           padding: '3px 8px', fontFamily: 'monospace', fontSize: 12,
           width: 120 } as React.CSSProperties,
  code:  { background: '#181825', padding: '8px 12px', borderRadius: 4,
           fontSize: 11, color: '#cba6f7', display: 'block',
           marginBottom: 4, whiteSpace: 'pre-wrap' as const },
  th:    { padding: '4px 12px', color: '#89b4fa',
           borderBottom: '1px solid #45475a', textAlign: 'left' } as React.CSSProperties,
  td:    { padding: '4px 12px', color: '#f9e2af',
           borderBottom: '1px solid #313244' } as React.CSSProperties,
  tag:   (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    background: ok ? '#1e3a2a' : '#45263a', color: ok ? '#a6e3a1' : '#f38ba8',
    fontSize: 11, marginRight: 6,
  }),
};

export function CCentralEUI() {
  const central = useMemo(() => new CCentralE(), []);
  const [siglas, setSiglas] = useState('MEX01');
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  void tick;

  const pushLog = (msg: string) =>
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  // siglas << RsValor + prvLeer_Central_BdD (async)
  const handleAsignar = async () => {
    setLoading(true);
    pushLog(`siglas << "${siglas}" → prvLeer_Central_BdD()`);
    await central.setSiglas(siglas);
    pushLog(`existe_nodo?=${central.existe_nodo()}  existe_limite?=${central.existe_limite()}`);
    setLoading(false);
    setTick(t => t + 1);
  };

  const handleReset = () => {
    // re-crear instancia (equivale a new())
    (central as { _sSiglas: undefined })._sSiglas = undefined;
    (central as { _oCtl:    undefined })._oCtl    = undefined;
    (central as { _oLimite: undefined })._oLimite = undefined;
    pushLog('new() → estado reiniciado');
    setTick(t => t + 1);
  };

  return (
    <div style={s.wrap}>

      {/* ── version ── */}
      <div style={s.box}>
        <span style={s.label}>c_central_e.version()</span>
        <code style={s.code}>{CCentralE.version()}</code>
      </div>

      {/* ── siglas << valor (trigger BD) ── */}
      <div style={s.box}>
        <span style={s.label}>siglas {'<<'} RsValor  →  prvLeer_Central_BdD()</span>
        <div style={s.row}>
          <label style={{ fontSize: 12 }}>
            siglas:{' '}
            <input value={siglas} onChange={e => setSiglas(e.target.value.toUpperCase())}
              style={s.input} disabled={loading} />
          </label>
          <button style={s.btn} onClick={handleAsignar} disabled={loading}>
            {loading ? 'leyendo BD…' : 'asignar siglas'}
          </button>
          <button style={s.btnGhost} onClick={handleReset} disabled={loading}>
            new() reset
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#6c7086' }}>
          Catálogo mock: {MOCK_CTLS.map(c => c['user!_siglas']).join(', ')}
        </div>
      </div>

      {/* ── existe_nodo? / existe_limite? ── */}
      <div style={s.box}>
        <span style={s.label}>predicados de existencia</span>
        <span style={s.tag(central.existe_nodo())}>
          existe_nodo? {central.existe_nodo() ? '_true' : '_false'}
        </span>
        <span style={s.tag(central.existe_limite())}>
          existe_limite? {central.existe_limite() ? '_true' : '_false'}
        </span>
      </div>

      {/* ── Getters de datos derivados ── */}
      <div style={s.box}>
        <span style={s.label}>getters — c_central_e.{'{tipo,nombre,localidad,municipio_delegacion}'}</span>
        <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
          <thead>
            <tr>
              <th style={s.th}>método</th>
              <th style={s.th}>fuente Magik</th>
              <th style={s.th}>valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>siglas</td>
              <td style={s.td}>.sSiglas.write_string</td>
              <td style={s.td}>{central.siglas}</td>
            </tr>
            <tr>
              <td style={s.td}>tipo</td>
              <td style={s.td}>.oCtl.user!_tipo</td>
              <td style={s.td}>{central.tipo()}</td>
            </tr>
            <tr>
              <td style={s.td}>nombre</td>
              <td style={s.td}>.oCtl.user!_nom_nodo</td>
              <td style={s.td}>{central.nombre()}</td>
            </tr>
            <tr>
              <td style={s.td}>localidad</td>
              <td style={s.td}>.oCtl.user!_localidad</td>
              <td style={s.td}>{central.localidad()}</td>
            </tr>
            <tr>
              <td style={s.td}>municipio_delegacion</td>
              <td style={s.td}>.oLimite.municipio</td>
              <td style={s.td}>{central.municipio_delegacion()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Registros BD resueltos (raw) ── */}
      <div style={s.box}>
        <span style={s.label}>registros BD resueltos (raw)</span>
        <code style={s.code}>
{`oCtl    = ${JSON.stringify(central.oCtl    ?? null, null, 2)}
oLimite = ${JSON.stringify(central.oLimite ?? null, null, 2)}`}
        </code>
      </div>

      {/* ── log ── */}
      {log.length > 0 && (
        <div style={s.box}>
          <span style={s.label}>log</span>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: '#a6adc8' }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
