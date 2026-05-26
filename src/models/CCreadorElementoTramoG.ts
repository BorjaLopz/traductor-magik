// Source: adiciones_layout/source/c_creador_elemento_tramo_g.magik
//
// Factory de c_elemento_tramo_g. Discrimina por is_kind_of?:
//
//   splice_closure → empalme
//                     sCveSello = "ET":
//                       user!_tipo_emp = "DERIVACION" → c_elemento_empalme_derivacion_g
//                       otro                         → c_elemento_empalme_g
//                     sCveSello ≠ "ET"               → c_elemento_empalme_subterraneo_g
//   sheath         → c_elemento_seccion_g
//   building       → c_elemento_nodo_g
//
// Tras crear el objeto se invoca .configurar_elementos().

// =============================================================================
// TIPOS DE ENTRADA (registros GIS abstractos)
// =============================================================================

export type GisKind = 'splice_closure' | 'sheath' | 'building';

export interface SpliceClosureRecord {
  kind:              'splice_closure';
  id:                string;
  'user!_tipo_emp':  'DERIVACION' | 'PRINCIPAL' | string;
}

export interface SheathRecord {
  kind: 'sheath';
  id:   string;
  longitud?: number;
}

export interface BuildingRecord {
  kind: 'building';
  id:   string;
  nombre?: string;
}

export type GisRecord = SpliceClosureRecord | SheathRecord | BuildingRecord;

// =============================================================================
// TIPOS DE SALIDA (elementos gráficos del tramo)
// =============================================================================

export type ElementoTramoKind =
  | 'empalme'
  | 'empalme_derivacion'
  | 'empalme_subterraneo'
  | 'seccion'
  | 'nodo';

export interface IElementoTramoG {
  kind:      ElementoTramoKind;
  sourceId:  string;
  configurado: boolean;
  configurarElementos(): void;
}

// Implementaciones equivalentes a c_elemento_empalme_g, etc.
abstract class ElementoTramoBase implements IElementoTramoG {
  abstract kind: ElementoTramoKind;
  sourceId:    string;
  configurado: boolean = false;

  constructor(rec: GisRecord) { this.sourceId = rec.id; }

  configurarElementos(): void { this.configurado = true; }
}

export class CElementoEmpalmeG extends ElementoTramoBase {
  kind: ElementoTramoKind = 'empalme';
}

export class CElementoEmpalmeDerivacionG extends ElementoTramoBase {
  kind: ElementoTramoKind = 'empalme_derivacion';
}

export class CElementoEmpalmeSubterraneoG extends ElementoTramoBase {
  kind: ElementoTramoKind = 'empalme_subterraneo';
}

export class CElementoSeccionG extends ElementoTramoBase {
  kind: ElementoTramoKind = 'seccion';
}

export class CElementoNodoG extends ElementoTramoBase {
  kind: ElementoTramoKind = 'nodo';
}

// =============================================================================
// FACTORY
// =============================================================================

export class CCreadorElementoTramoG {
  private _sNombreGrafico: string | undefined;
  private _sCveSello:      string;

  constructor(rsCveSello: string) {
    this._sCveSello = rsCveSello;
  }

  get sCveSello(): string                  { return this._sCveSello; }
  get sNombreGrafico(): string | undefined { return this._sNombreGrafico; }

  set sNombreGrafico(v: string | undefined) { this._sNombreGrafico = v; }

  // Magik: Crea_Elemento_Tramo(RoElemento)
  creaElementoTramo(roElemento: GisRecord): IElementoTramoG {
    let elem: IElementoTramoG;

    // is_kind_of? cascade — el original usa 3 _if sucesivos (no _elif).
    if (roElemento.kind === 'splice_closure') {
      elem = this.creaElementoEmpalme(roElemento, this._sCveSello);
    } else if (roElemento.kind === 'sheath') {
      elem = new CElementoSeccionG(roElemento);
    } else if (roElemento.kind === 'building') {
      elem = new CElementoNodoG(roElemento);
    } else {
      // Magik: si no encaja en ningún is_kind_of? → oElemento_Tramo queda _unset
      // y la siguiente llamada a configurar_elementos() levantaba does_not_understand.
      // En TS lanzamos para fallar explícito.
      throw new Error(`Tipo GIS no soportado: ${(roElemento as { kind: string }).kind}`);
    }

    elem.configurarElementos();
    return elem;
  }

  // Magik: crea_elemento_empalme(RoElemento, PsCveSello)
  creaElementoEmpalme(rec: SpliceClosureRecord, psCveSello: string): IElementoTramoG {
    if (psCveSello === 'ET') {
      // Estudio de Transmisión
      if (rec['user!_tipo_emp'] === 'DERIVACION') {
        return new CElementoEmpalmeDerivacionG(rec);
      }
      return new CElementoEmpalmeG(rec);
    }
    return new CElementoEmpalmeSubterraneoG(rec);
  }

  // Magik: crea_elemento_seccion(RoElemento) — atajo directo
  creaElementoSeccion(rec: SheathRecord): CElementoSeccionG {
    return new CElementoSeccionG(rec);
  }

  // Magik: crea_elemento_nodo(RoElemento) — atajo directo
  creaElementoNodo(rec: BuildingRecord): CElementoNodoG {
    return new CElementoNodoG(rec);
  }
}
