// Source: adiciones_layout/source/Sellos/Utilerias/c_elemento_nodo_g.magik
// Elemento gráfico para un nodo de red (EDFA).
// Extends CElementoEntidadG — 3 etiquetas de texto + 1 símbolo.

import { CElementoEntidadG } from './CElementoEntidadG'
import type { BoundingBox } from './CElementoEntidadG'

export interface NodoRecord {
  'user!_tipo':     string;
  'user!_nom_nodo': string;
}

export class CElementoNodoG extends CElementoEntidadG<NodoRecord> {
  // Nº de renglones en que se divide el área para posicionar etiquetas
  static readonly NUM_RENGLONES = 20;

  constructor(entidad: NodoRecord) {
    super(entidad);
    this._sNombreSimbolo = 'edfa';
    this._sDescripcion   = entidad['user!_tipo'];
    this._nLongGrafica   = 100;
  }

  // Magik: configurar_elementos — crea internos y asigna valores de entidad
  configurarElementos(): void {
    this._crearElementosInternos();

    const e1 = this._oElementos.get('Etiqueta_1');
    if (e1) e1.sTexto = this._entidad['user!_nom_nodo'];

    const e3 = this._oElementos.get('Etiqueta_3');
    if (e3) e3.sTexto = this._sDescripcion;
  }

  // Magik: prvCrea_elementos_internos
  private _crearElementosInternos(): void {
    this._oElementos.set('Etiqueta_1', {
      tipo: 'texto',
      sTexto: 'Nom nodo',
      sAlineacion: 'centre_left',
      nTamanio: 30,
    });
    this._collEtiquetas.set('Etiqueta_1', 1);

    this._oElementos.set('Etiqueta_2', {
      tipo: 'texto',
      sTexto: 'D. O.',
      nTamanio: 35,
    });
    this._collEtiquetas.set('Etiqueta_2', 9);

    this._oElementos.set('Etiqueta_3', {
      tipo: 'texto',
      sTexto: 'ET',
      sAlineacion: 'centre_left',
      nTamanio: 35,
    });
    this._collEtiquetas.set('Etiqueta_3', 17);

    this._oElementos.set('Simbolo_1', {
      tipo: 'simbolo',
      sTexto: this._sNombreSimbolo,
    });
  }

  // Magik: dfn_ubicacion_elementos_internos
  // The /10 factor matches the Magik nMargen setter which multiplies by 10 internally.
  // Effective margin in mm = LnAltRen * posRow.
  dfnUbicacionElementosInternos(): void {
    if (!this.oArea) return;

    const rows    = CElementoNodoG.NUM_RENGLONES;
    const altMm   = this.oArea.ymax - this.oArea.ymin;
    const altRen  = altMm / rows;

    for (const nombre of ['Etiqueta_1', 'Etiqueta_2', 'Etiqueta_3']) {
      const pos       = this._collEtiquetas.get(nombre) ?? 0;
      const renSup    = pos;
      const renInf    = rows - 2 - pos;
      const el        = this._oElementos.get(nombre);
      if (el) {
        el.nMargenSup = altRen * (renSup / 10);
        el.nMargenInf = altRen * (renInf / 10);
      }
    }
    // Simbolo_1: Magik computes renSup=1, renInf=19 but never assigns margins (omission in source)
  }

  // Returns the effective top margin in mm for a label (accounts for × 10 stored internally)
  etiquetaTopMm(nombre: string, areaBbox: BoundingBox): number {
    const el   = this._oElementos.get(nombre);
    const rows = CElementoNodoG.NUM_RENGLONES;
    const pos  = this._collEtiquetas.get(nombre) ?? 0;
    const altMm = areaBbox.ymax - areaBbox.ymin;
    if (el?.nMargenSup !== undefined) return el.nMargenSup * 10;
    // fallback: derive from row position
    return (altMm / rows) * pos;
  }

  // Convenience: sets the external bounding box and recomputes internal layout
  setAreaAndLayout(area: BoundingBox): void {
    this.oArea = area;
    this.dfnUbicacionElementosInternos();
  }

  // Returns the repositioned bounding box from a new contact point
  placeAt(ptoContacto: { x: number; y: number }, areaBbox: BoundingBox): BoundingBox {
    this._oPtoContacto = ptoContacto;
    return this.reposicionarArea(areaBbox);
  }
}
