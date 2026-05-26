// Source: adiciones_layout/source/c_central_e.magik
//
// Representa los datos de una central GIS (PNI Smallworld). Lookup contra dos
// colecciones:
//   :gis      / :building       — registros de central/nodo  (oCtl)
//   :landbase / :user!_central  — límites de central        (oLimite)
//
// Predicado de búsqueda: predicate.eq(:user!_siglas, sSiglas) / :user!_central.
//
// Cuando una propiedad se consulta sin que exista el registro, se devuelve
// oValorPorDefecto (" " en el original).

export interface CentralRecord {
  'user!_siglas':    string;
  'user!_tipo':      string;
  'user!_nom_nodo':  string;
  'user!_localidad': string;
}

export interface LimiteRecord {
  'user!_central': string;
  municipio:       string;
}

// Abstrae LoPAF.database.collection(...).select(predicate.eq(...)).an_element()
export interface CentralLookupService {
  findCentralBySiglas(siglas: string): CentralRecord | undefined;
  findLimiteBySiglas (siglas: string): LimiteRecord  | undefined;
}

const DEFAULT_VALUE = ' ';

export class CCentralE {
  // Campos privados — define_slot_access ... :writable, :private
  private _sSiglas:           string | undefined;
  private _oCtl:              CentralRecord | undefined;
  private _oLimite:           LimiteRecord  | undefined;
  private _oValorPorDefecto:  string;

  private readonly _service: CentralLookupService;

  // Magik: c_central_e.new() — sólo inicializa sSiglas a unset
  constructor(service: CentralLookupService, valorPorDefecto: string = DEFAULT_VALUE) {
    this._sSiglas          = undefined;
    this._oCtl             = undefined;
    this._oLimite          = undefined;
    this._oValorPorDefecto = valorPorDefecto;
    this._service          = service;
  }

  // Magik: c_central_e.version()
  static version(): string {
    return 'version 1.00.00.00 20/12/05 12:30 ';
  }

  // Magik: c_central_e.siglas << RsValor → almacena + prvLeer_Central_BdD
  set siglas(rsValor: string) {
    this._sSiglas = rsValor;
    this.prvLeerCentralBdD();
  }

  // Magik: c_central_e.siglas → .sSiglas.write_string
  get siglas(): string {
    return this._sSiglas ?? this._oValorPorDefecto;
  }

  // Magik: existe_nodo? / existe_limite?
  get existeNodo():   boolean { return this._oCtl    !== undefined; }
  get existeLimite(): boolean { return this._oLimite !== undefined; }

  // Magik: tipo / nombre / localidad — proxy a oCtl con fallback
  get tipo():      string { return this.existeNodo ? this._oCtl!['user!_tipo']      : this._oValorPorDefecto; }
  get nombre():    string { return this.existeNodo ? this._oCtl!['user!_nom_nodo']  : this._oValorPorDefecto; }
  get localidad(): string { return this.existeNodo ? this._oCtl!['user!_localidad'] : this._oValorPorDefecto; }

  // Magik: municipio_delegacion — proxy a oLimite con fallback
  get municipioDelegacion(): string {
    return this.existeLimite ? this._oLimite!.municipio : this._oValorPorDefecto;
  }

  // Acceso a registros crudos — útil para debugging desde el showcase
  get oCtl():    CentralRecord | undefined { return this._oCtl; }
  get oLimite(): LimiteRecord  | undefined { return this._oLimite; }
  get valorPorDefecto(): string { return this._oValorPorDefecto; }

  // Magik: prvLeer_Central_BdD — dos selects independientes
  private prvLeerCentralBdD(): void {
    if (this._sSiglas === undefined) {
      this._oCtl    = undefined;
      this._oLimite = undefined;
      return;
    }
    this._oLimite = this._service.findLimiteBySiglas (this._sSiglas);
    this._oCtl    = this._service.findCentralBySiglas(this._sSiglas);
  }
}
