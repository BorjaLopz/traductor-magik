// Source: adiciones_layout/source/c_guarda_objetos_vp.magik

// Tipos de objeto GIS permitidos en operaciones de viewport
export const OBJETOS: readonly string[] = [
  'mit_terminal_enclosure', 'building', 'splice_closure', 'uub',
  'underground_route', 'copper_terminal', 'pole', 'user!_tba_anotacion',
  'mit_presentation_object', 'aerial_route', 'copper_splice', 'figure_eight',
  'user!_registro_tablero', 'sheath', 'access_point', 'copper_cable',
  'user!_building', 'user!_eje_calle', 'building_geoms', 'underground_route_geoms',
  'aerial_route_geoms', 'uub_geoms', 'pole_geoms', 'splice_closure_geoms',
  'sheath_geoms', 'mit_terminal_enclosure_geoms', 'access_point_geoms',
  'figure_eight_geoms', 'copper_terminal_geoms', 'copper_splice_geoms',
  'copper_cable_geoms', 'user!_eje_calle_esquema', 'structure_annotation',
  'user!_reserva', 'user!_bajante', 'anchor', 'user!_empalme_distribucion',
  'user!_anotacion_reserva_fo', 'user!_terminal_fo', 'user!_ont_anotacion',
  'user!_distrito_optico', 'user!_empalme_distribucion_geoms',
  'user!_anotacion_reserva_fo_geoms', 'user!_terminal_fo_geoms',
];

// Objeto GIS del dataset Smallworld con colección y identificador
export interface GisObject {
  sourceCollection: string;    // Magik: source_collection.name
  id: string | number;         // Magik: obj.id
}

// Elemento de un result-set de viewport que puede tener un RWO asociado
export interface ResultSetElement {
  rwo?: GisObject & { rwoId?: string | number }; // rwo_id.unique_id cuando no hay .id
}

// Entrada en el resultado de generaLista / generaListaGsfr: [tipo, id, rot, hor, ver]
export type ObjectEntry = [type: string, id: string | number, rot: number, hor: number, ver: number];

export interface GisListResult {
  gazas?: ObjectEntry[];
  canalizaciones?: ObjectEntry[];
  aerea?: ObjectEntry[];
  pozos?: ObjectEntry[];
  centrales?: ObjectEntry[];
  postes?: ObjectEntry[];
}

// Resultado de generaListaGsfr: Map con claves "{tipo}_sim", "{tipo}_ano", "uub_ano_tipo"
export type GsfrResult = Map<string, ObjectEntry[]>;

export class CGuardaObjetosVp {
  private _oElementos: GisObject[] = [];
  private _oEstructuras: GisObject[] = [];
  private _oCanalizacion: GisObject[] = [];
  private _oResulSet: ResultSetElement[] = [];

  constructor() {}

  get elementos(): GisObject[]                { return this._oElementos; }
  set elementos(v: GisObject[])               { this._oElementos = v; }

  get canalizacion(): GisObject[]             { return this._oCanalizacion; }
  set canalizacion(v: GisObject[])            { this._oCanalizacion = v; }

  get estructuras(): GisObject[]              { return this._oEstructuras; }
  set estructuras(v: GisObject[])             { this._oEstructuras = v; }

  get oResulSet(): ResultSetElement[]         { return this._oResulSet; }
  set oResulSet(v: ResultSetElement[])        { this._oResulSet = v; }

  // Magik: genera_lista — agrupa elementos/canalizacion/estructuras por tipo de colección
  generaLista(): GisListResult {
    const result: GisListResult = {};

    // figure_eight de elementos
    const gazas: ObjectEntry[] = [];
    for (const obj of this._oElementos) {
      if (obj.sourceCollection === 'figure_eight') {
        gazas.push(['figure_eight', obj.id, 1.0, 1.0, 1.0]);
      }
    }
    if (gazas.length > 0) result.gazas = gazas;

    // underground_route y aerial_route de canalizacion
    const canalizaciones: ObjectEntry[] = [];
    const aerea: ObjectEntry[] = [];
    for (const obj of this._oCanalizacion) {
      if (obj.sourceCollection === 'underground_route') {
        canalizaciones.push(['underground_route', obj.id, 1.0, 1.0, 1.0]);
      } else if (obj.sourceCollection === 'aerial_route') {
        aerea.push(['aerial_route', obj.id, 1.0, 1.0, 1.0]);
      }
    }
    if (canalizaciones.length > 0) result.canalizaciones = canalizaciones;
    if (aerea.length > 0)          result.aerea = aerea;

    // uub, pole, building de estructuras
    const pozos: ObjectEntry[]     = [];
    const postes: ObjectEntry[]    = [];
    const centrales: ObjectEntry[] = [];
    for (const obj of this._oEstructuras) {
      if (obj.sourceCollection === 'uub') {
        pozos.push(['uub', obj.id, 1.0, 1.0, 1.0]);
      } else if (obj.sourceCollection === 'pole') {
        postes.push(['pole', obj.id, 1.0, 1.0, 1.0]);
      } else if (obj.sourceCollection === 'building') {
        centrales.push(['building', obj.id, 1.0, 1.0, 1.0]);
      }
    }
    if (pozos.length > 0)     result.pozos = pozos;
    if (centrales.length > 0) result.centrales = centrales;
    if (postes.length > 0)    result.postes = postes;

    return result;
  }

  // Magik: genera_lista_gsfr — construye hash_table con entradas _sim/_ano por tipo de objeto
  generaListaGsfr(): GsfrResult {
    const ht: GsfrResult = new Map();

    // Recopilar RWOs válidos del result-set y filtrar por OBJETOS permitidos
    const rwos: GisObject[] = [];
    for (const elem of this._oResulSet) {
      if (elem.rwo !== undefined) {
        rwos.push(elem.rwo);
      }
    }
    const filtrados = rwos.filter(obj => OBJETOS.includes(obj.sourceCollection));

    for (const obj of filtrados) {
      const tipo = obj.sourceCollection;
      const id = obj.id ?? (obj as any).rwoId ?? '';
      const entry: ObjectEntry = [tipo, id, 1.0, 1.0, 1.0];

      const keySim = `${tipo}_sim`;
      const keyAno = `${tipo}_ano`;

      if (!ht.has(keySim)) ht.set(keySim, []);
      if (!ht.has(keyAno)) ht.set(keyAno, []);

      ht.get(keySim)!.push([...entry]);
      ht.get(keyAno)!.push([...entry]);

      // Para pozos (uub) se genera también la clave _ano_tipo para configurar tipo de pozo
      if (tipo === 'uub') {
        const keyAnoTipo = `${tipo}_ano_tipo`;
        if (!ht.has(keyAnoTipo)) ht.set(keyAnoTipo, []);
        ht.get(keyAnoTipo)!.push([...entry]);
      }
    }

    return ht;
  }
}
