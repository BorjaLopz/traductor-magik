// Source: adiciones_layout/source/Sellos/Entidad/c_tramo_fo_e.magik
// Modelo de tramo de fibra óptica. Recorre la cadena
//   nodo_origen → seccion → empalme → seccion → ... → nodo_destino
// y expone num_empalmes, long_tramo y collObjetos.
//
// asigna_num_tramo() y prvObten_BD_Datos_Nodos() (GIS) se reemplazan por
// initFromData(), que acepta los datos ya resueltos.

// ─── Tipos discriminados ────────────────────────────────────────────────────

export interface NodoRecord {
  tipo: 'nodo';
  clli: string;
  nombre?: string;
}

export interface EmpalmeRecord {
  tipo: 'empalme';
  id: string;
  seccionSalida?: SeccionRecord;  // salida del empalme; undefined = empalme terminal
}

export interface SeccionRecord {
  tipo: 'seccion';
  numRuta: string;
  numTramo: string;
  longitudFibra: number;
  intersectaNodoOrigen?: boolean; // true = sección inicial (reemplaza filtro spatial)
  empalmesSalida: EmpalmeRecord[]; // reemplaza getEmpalmes(2)
}

export interface TramoRecord {
  numRuta: string;
  numTramo: string;
  nomRuta?: string;
  nomTramo?: string;
}

export type TramoElemento = NodoRecord | SeccionRecord | EmpalmeRecord;

// ─── Clase ──────────────────────────────────────────────────────────────────

export class CTramoFoE {
  private _collObjetos: TramoElemento[] | undefined;
  private _sNumRuta: string | undefined;
  private _sNumTramo: string | undefined;
  private _nNumEmpalmes: number | undefined;
  private _nLongTramo: number | undefined;
  private _oTramo: TramoRecord | undefined;
  private _collSecciones: SeccionRecord[] | undefined;
  private _oNodoOrigen: NodoRecord | undefined;
  private _oNodoDestino: NodoRecord | undefined;
  private _sValorDefecto: string;

  constructor() {
    this._sValorDefecto = 'vacio';
  }

  // oTramo es public writable en Magik
  get oTramo(): TramoRecord | undefined { return this._oTramo; }
  set oTramo(v: TramoRecord | undefined) { this._oTramo = v; }

  get sValorDefecto(): string { return this._sValorDefecto; }
  set sValorDefecto(v: string) { this._sValorDefecto = v; }

  // ─── Reemplaza asigna_num_tramo + prvObten_BD_Datos_Nodos ────────────────

  initFromData(
    tramo: TramoRecord,
    secciones: SeccionRecord[],
    nodoOrigen?: NodoRecord,
    nodoDestino?: NodoRecord,
  ): void {
    this._sNumRuta      = tramo.numRuta;
    this._sNumTramo     = tramo.numTramo;
    this._oTramo        = tramo;
    this._collSecciones = secciones;
    this._oNodoOrigen   = nodoOrigen;
    this._oNodoDestino  = nodoDestino;
    this._collObjetos   = undefined; // fuerza regeneración
    this.prvGeneraListaObjetos();
  }

  // ─── Getters públicos con guardia ────────────────────────────────────────

  get sNumRuta(): string  { return this._sNumRuta ?? ''; }
  get sNumTramo(): string { return this._sNumTramo ?? ''; }

  get numEmpalmes(): number | string {
    if (this.prvValidaTramo() && this._nNumEmpalmes !== undefined) return this._nNumEmpalmes;
    return this._sValorDefecto;
  }

  get longTramo(): number | string {
    if (this.prvValidaTramo() && this._nLongTramo !== undefined) return this._nLongTramo;
    return this._sValorDefecto;
  }

  get nombreRuta(): string {
    return this.prvValidaTramo() ? (this._oTramo?.nomRuta ?? '') : this._sValorDefecto;
  }

  get nombre(): string {
    return this.prvValidaTramo() ? (this._oTramo?.nomTramo ?? '') : this._sValorDefecto;
  }

  get nodoOrigen(): NodoRecord | string {
    if (!this.prvValidaTramo()) return this._sValorDefecto;
    return this._oNodoOrigen ?? this._sValorDefecto;
  }

  get nodoDestino(): NodoRecord | string {
    if (!this.prvValidaTramo()) return this._sValorDefecto;
    return this._oNodoDestino ?? this._sValorDefecto;
  }

  // Magik: obten_elementos_tramo — lazy: regenera si collObjetos es _unset
  get obtenElementosTramo(): TramoElemento[] | string {
    if (!this.prvValidaTramo()) return this._sValorDefecto;
    if (!this._collObjetos) this.prvGeneraListaObjetos();
    return this._collObjetos ?? this._sValorDefecto;
  }

  // Magik: existe? — delegado a prvValida_tramo
  existe(): boolean {
    return this.prvValidaTramo();
  }

  // ─── Privados ────────────────────────────────────────────────────────────

  private prvValidaTramo(): boolean {
    return this._oTramo !== undefined;
  }

  // Magik: prvObten_Seccion_Inicial — filtra por intersectaNodoOrigen en lugar de spatial predicate
  private prvObtenSeccionInicial(): SeccionRecord | undefined {
    if (!this._oNodoOrigen) return undefined;
    const candidatas = (this._collSecciones ?? []).filter(s => s.intersectaNodoOrigen);
    if (candidatas.length !== 1) return undefined;
    return candidatas[0];
  }

  private prvVerificaExistenciaMinimaTramo(): boolean {
    return (
      this._oNodoOrigen  !== undefined &&
      this._oNodoDestino !== undefined &&
      this.prvObtenSeccionInicial() !== undefined
    );
  }

  // Magik: prvGenera_Lista_objetos
  // Recorre: nodo_origen → sec_inicial → [empalme → sec → ...]* → nodo_destino
  // Longitud: acumula las secciones DESPUÉS del primer empalme (no la inicial).
  private prvGeneraListaObjetos(): void {
    this._collObjetos  = [];
    this._nNumEmpalmes = 0;
    let longTramo = 0;

    if (!this.prvVerificaExistenciaMinimaTramo()) return;

    this._collObjetos.push(this._oNodoOrigen!);

    let sec: SeccionRecord | undefined = this.prvObtenSeccionInicial();
    this._collObjetos.push(sec!);

    while (sec) {
      const empalmes = sec.empalmesSalida;
      if (empalmes.length === 0) break;

      const empalme = empalmes[0];
      this._collObjetos.push(empalme);
      this._nNumEmpalmes++;

      const secSalida = empalme.seccionSalida;
      if (secSalida) {
        sec = secSalida;
        longTramo += sec.longitudFibra; // Magik: calculated_fiber_length.as_float
        this._collObjetos.push(sec);
      } else {
        sec = undefined;
      }
    }

    this._collObjetos.push(this._oNodoDestino!);
    this._nLongTramo = longTramo;
  }
}
