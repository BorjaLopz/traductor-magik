// Source: adiciones_layout/source/Sellos/Utilerias/c_elemento_entidad_g.magik
// Clase base abstracta para elementos gráficos de entidad.
// Rendering completo → Fase 5 (Canvas 2D / OpenLayers).

import type { BoundingBox, Coordinate } from './CTabla'

export type { BoundingBox, Coordinate }

// Lightweight substitute for c_texto_grafico / c_simbolo_grafico (Fase 5 pending)
export interface ElementoInterno {
  tipo: 'texto' | 'simbolo';
  sTexto?: string;
  sAlineacion?: string;
  nTamanio?: number;
  nMargenSup?: number;   // margin value passed to Magik setter (× 10 internally)
  nMargenInf?: number;
}

export abstract class CElementoEntidadG<TEntidad> {
  oArea?: BoundingBox;

  protected _entidad:        TEntidad;
  protected _sNombreSimbolo  = '';
  protected _sDescripcion    = '';
  protected _oPtoContacto:   Coordinate = { x: 0, y: 0 };
  protected _nLongGrafica    = 0;
  protected _bHabilitar      = true;
  protected _collEtiquetas   = new Map<string, number>();  // nombre → row position
  protected _oElementos      = new Map<string, ElementoInterno>();

  constructor(entidad: TEntidad) {
    this._entidad = entidad;
  }

  // ─── Getters / Setters ────────────────────────────────────────────────────

  get entidad():        TEntidad   { return this._entidad; }
  get sNombreSimbolo(): string     { return this._sNombreSimbolo; }
  set sNombreSimbolo(v: string)    { this._sNombreSimbolo = v; }
  get sDescripcion():   string     { return this._sDescripcion; }
  set sDescripcion(v: string)      { this._sDescripcion = v; }
  get nLongGrafica():   number     { return this._nLongGrafica; }
  set nLongGrafica(v: number)      { this._nLongGrafica = v; }
  get oPtoContacto():   Coordinate { return this._oPtoContacto; }
  set oPtoContacto(v: Coordinate)  { this._oPtoContacto = v; }
  get bHabilitar():     boolean    { return this._bHabilitar; }
  set bHabilitar(v: boolean)       { this._bHabilitar = v; }

  get oElementos(): ReadonlyMap<string, ElementoInterno> { return this._oElementos; }

  // Magik: pos_etiqueta(nombre) / pos_etiqueta(nombre) << valor
  posEtiqueta(nombre: string): number | undefined { return this._collEtiquetas.get(nombre); }
  setPosEtiqueta(nombre: string, pos: number): void { this._collEtiquetas.set(nombre, pos); }

  // Magik: asigna_valor_etiqueta / obten_valor_etiqueta
  asignaValorEtiqueta(nombre: string, valor: string): void {
    const el = this._oElementos.get(nombre);
    if (el) el.sTexto = valor;
  }
  obtenValorEtiqueta(nombre: string): string | undefined {
    return this._oElementos.get(nombre)?.sTexto;
  }

  // Magik: reposicionar_Area — new bbox positioned at oPtoContacto
  reposicionarArea(area: BoundingBox): BoundingBox {
    const h = area.ymax - area.ymin;
    return {
      xmin: this._oPtoContacto.x,
      ymin: this._oPtoContacto.y - h / 2,
      xmax: this._oPtoContacto.x + this._nLongGrafica,
      ymax: this._oPtoContacto.y + h / 2,
    };
  }

  // ─── Abstract ─────────────────────────────────────────────────────────────

  abstract configurarElementos(): void;
  abstract dfnUbicacionElementosInternos(): void;
}
