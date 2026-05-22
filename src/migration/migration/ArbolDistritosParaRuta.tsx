/**
 * Migración de: c_arbol_distritos_para_ruta.magik
 * Clase Magik:  c_arbol_distritos_para_ruta  —  SIGC11 / fmejia / 2009
 */

import React, { useEffect, useRef, useState } from 'react';
import * as turf from '@turf/turf';
import OLMap from 'ol/Map';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import type { Coordinate } from 'ol/coordinate';
import { GeoJSON as OLGeoJSON } from 'ol/format';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: mit_terminal_enclosure / user!_registro_tablero */
export interface Distrito {
  id: string | number;
  constructionStatus: string;            // elemento.construction_status
  nombreDistrito: string;            // elemento.user!_nombre_distrito
  rutaCo?: RutaCo;            // elemento.user!_ruta_co  (_unset → undefined)
  location?: [number, number];  // [x, y] — para goto en mapa
  sourceCollection: string;            // 'mit_terminal_enclosure' | 'user!_registro_tablero'
}

/** Magik: user!_ruta_co */
export interface RutaCo {
  id: string | number;
  numero: string;      // user!_numero.write_string
  mitTerminalEnclosures: Distrito[];  // .mit_terminal_enclosures (rope)
}

/** Magik: property_list.new_with(:elemento, :valor, :check, :estatus) */
export interface ValorNodoDistrito {
  elemento: Distrito;
  valor: string;
  check: boolean;
  estatus: string;
}

/** Magik: display_tree */
export interface NodoDistrito {
  key: Distrito;           // objeto GIS (para mapa)
  value: ValorNodoDistrito;
}

/** Magik: {geom, dist} de geometry_nearest */
export interface EstructuraCercana {
  feature: Feature<LineString>;
  distancia: number;
  rwo: Distrito;
}

// =============================================================================
// INTERFAZ GisService
// Sustituye llamadas a smallworld_product / mit_manager — implementar contra API REST.
// =============================================================================

export interface GisService {
  /** Magik: user!_ruta_co_editor_plugin.get_cajas_y_central(oSeleccion) */
  getCajasYCentral(e: EstructuraCercana): Promise<{ cajas: Distrito[]; central: Distrito[] }>;

  /** Magik: l_ed.current_object */
  getCurrentRuta(): Promise<RutaCo | null>;

  /** Magik: l_mapa.current_trail.first_coord */
  getCurrentTrailFirstCoord(): Promise<Coordinate | null>;

  /** Magik: mit_manager.modelit_dataset — features de underground_route + aerial_route */
  getRouteFeatures(): Promise<turf.FeatureCollection<turf.LineString>>;

  /** Magik: l_mapa.current_selection */
  getCurrentMapSelection(): Promise<Distrito | null>;

  /** Magik: l_ed.action(:update).execute_action() */
  saveRoute(ruta: RutaCo): Promise<void>;

  /** Magik: LoPaf.manager.highlight_rwo(rwo) */
  highlightFeature(distrito: Distrito): void;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ArbolDistritosParaRuta {

  // Magik: {:list, _unset, :writable}
  #list: NodoDistrito[] = [];

  // Magik: {:ruta, _unset, :writable}
  #ruta: RutaCo | null = null;

  // Magik: {:tree_item, _unset, :writable} — referencia al mapa OL
  #map: OLMap | null = null;

  readonly #gis: GisService;

  constructor(gisService: GisService) {
    this.#gis = gisService;
  }

  setMap(map: OLMap): void {
    this.#map = map;
  }

  // ---------------------------------------------------------------------------
  // activados()
  // Magik: _for dt _over .list / _if check _isnt _unset _andif check → RoHT.add
  // ---------------------------------------------------------------------------
  activados(): Distrito[] {
    const result: Distrito[] = [];                       // rope.new()

    for (const dt of this.#list) {                       // .list.fast_elements()
      if (dt.value.check != null && dt.value.check) {    // _isnt _unset _andif
        result.push(dt.value.elemento);                  // RoHT.add(:elemento)
      }
    }

    return result;                                       // >> RoHT
  }

  // ---------------------------------------------------------------------------
  // verifica_caja(elemento)
  // Magik: property_list.new_with(:elemento, :valor, :check _false, :estatus)
  // ---------------------------------------------------------------------------
  verificaCaja(elemento: Distrito): ValorNodoDistrito {
    const etiqueta = `Distrito ${elemento.constructionStatus} `;
    let estatus = ' Sin Asignar';
    const comentario = etiqueta + elemento.nombreDistrito;

    if (elemento.rutaCo != null) {                       // _isnt _unset
      estatus = ` Asignado a la Ruta: ${elemento.rutaCo.numero}`;
    }

    return { elemento, valor: comentario, check: false, estatus }; // property_list.new_with
  }

  // ---------------------------------------------------------------------------
  // llena_arbol()
  // Magik: obtener_datos() → verifica_caja() → display_tree.new() por cada caja
  // ---------------------------------------------------------------------------
  async llenaArbol(): Promise<NodoDistrito[]> {
    const { cajas } = await this.obtenerDatos();         // (central, cajas) << obtener_datos()

    const list: NodoDistrito[] = [];

    for (const caja of cajas) {                          // _for caja _over cajas
      const valor = this.verificaCaja(caja);
      list.push({ key: caja, value: valor });            // display_tree.new(caja, valor)
    }

    this.#list = list;                                   // .list << l_list
    return this.#list;
  }

  // ---------------------------------------------------------------------------
  // nearest_structure_route(coord, tolerance?)
  // Magik: dataset.geometry_nearest → Turf.js nearestPointOnLine
  // ---------------------------------------------------------------------------
  async nearestStructureRoute(
    coord: Coordinate,
    tolerance: number = 10,
  ): Promise<{ geom: Feature<LineString> | null; rwo: Distrito | null }> {

    const routeFC = await this.#gis.getRouteFeatures(); // mit_manager.modelit_dataset
    const punto = turf.point(coord as [number, number]);
    let minDist = Infinity;
    let nearestLine: turf.Feature<turf.LineString> | null = null;

    for (const feature of routeFC.features) {
      // geometry_nearest con :chain → nearestPointOnLine
      const snapped = turf.nearestPointOnLine(feature, punto, { units: 'meters' });
      const dist = snapped.properties?.dist ?? Infinity;

      if (dist < minDist && dist <= tolerance) {         // _andif dist _isnt _unset
        minDist = dist;
        nearestLine = feature;
      }
    }

    if (!nearestLine) return { geom: null, rwo: null };  // >> _unset, _unset

    const fmt = new OLGeoJSON();
    const olFeature = fmt.readFeature(nearestLine) as Feature<LineString>;
    const rwo = nearestLine.properties as unknown as Distrito;

    return { geom: olFeature, rwo };                     // >> the_geom[1], the_geom[2]
  }

  // ---------------------------------------------------------------------------
  // obtener_datos()
  // Magik: current_trail.first_coord → nearest_structure_route → get_cajas_y_central
  //        + merge mit_terminal_enclosures de la ruta
  // ---------------------------------------------------------------------------
  async obtenerDatos(): Promise<{ central: Distrito[]; cajas: Distrito[] }> {
    const ruta = await this.#gis.getCurrentRuta();      // l_ed.current_object
    this.#ruta = ruta;

    const coord = await this.#gis.getCurrentTrailFirstCoord(); // current_trail.first_coord

    let cajas: Distrito[] = [];
    let central: Distrito[] = [];

    if (coord != null) {                                 // _if oCoord _isnt _unset
      const { rwo } = await this.nearestStructureRoute(coord);

      if (ruta != null && rwo != null) {
        const res = await this.#gis.getCajasYCentral({ feature: null!, distancia: 0, rwo });
        cajas = res.cajas;
        central = res.central;
      }
    }

    // _for ca _over l_ruta.mit_terminal_enclosures / cajas.includes?(ca).not → add
    if (ruta != null) {
      for (const ca of ruta.mitTerminalEnclosures) {
        if (!cajas.some(c => c.id === ca.id)) cajas.push(ca);
      }
    }

    return { central, cajas };
  }

  // ---------------------------------------------------------------------------
  // agregar() — .ruta.mit_terminal_enclosures.add(caja) + save + refresh
  // ---------------------------------------------------------------------------
  async agregar(onRefresh: () => void): Promise<void> {
    this.validaEditor();
    for (const caja of this.activados()) {
      this.#ruta!.mitTerminalEnclosures.push(caja);
    }
    await this.#gis.saveRoute(this.#ruta!);
    onRefresh();
  }

  // ---------------------------------------------------------------------------
  // desagregar() — .ruta.mit_terminal_enclosures.remove(caja) + save + refresh
  // ---------------------------------------------------------------------------
  async desagregar(onRefresh: () => void): Promise<void> {
    this.validaEditor();
    for (const caja of this.activados()) {
      const idx = this.#ruta!.mitTerminalEnclosures.findIndex(c => c.id === caja.id);
      if (idx !== -1) this.#ruta!.mitTerminalEnclosures.splice(idx, 1); // .remove(caja)
    }
    await this.#gis.saveRoute(this.#ruta!);
    onRefresh();
  }

  // ---------------------------------------------------------------------------
  // agregar_manual()
  // Magik: valida tipo colección (:mit_terminal_enclosure | :user!_registro_tablero)
  // ---------------------------------------------------------------------------
  async agregarManual(onRefresh: () => void): Promise<void> {
    this.validaEditor();
    const sel = await this.#gis.getCurrentMapSelection();

    if (sel == null)
      throw new Error('No se ha seleccionado el Registro o Caja de distribución');

    if (!['mit_terminal_enclosure', 'user!_registro_tablero'].includes(sel.sourceCollection))
      throw new Error('Debe seleccionar un Registro o Caja de distribución');

    this.#ruta!.mitTerminalEnclosures.push(sel);
    await this.#gis.saveRoute(this.#ruta!);
    onRefresh();
  }

  // ---------------------------------------------------------------------------
  // selected(nodo)
  // Magik: bounding_box.new_centred(x, y, 5000) → OL view.fit() + highlight_rwo
  // ---------------------------------------------------------------------------
  selected(nodo: NodoDistrito | null): void {
    if (!nodo?.key.location || !this.#map) return;

    const [x, y] = nodo.key.location;
    const r = 5000;                                 // bounding_box radio = 5000m
    const extent = [x - r, y - r, x + r, y + r] as [number, number, number, number];

    this.#map.getView().fit(extent, { duration: 400 }); // LoVista.goto(bb)
    this.#gis.highlightFeature(nodo.key);               // highlight_rwo
  }

  // ---------------------------------------------------------------------------
  // valida_editor() — !abort!() → throw Error
  // ---------------------------------------------------------------------------
  validaEditor(): void {
    if (this.#ruta == null)
      throw new Error('El objeto actual del editor no pertenece a la Ruta de Cobre');
  }

  // ---------------------------------------------------------------------------
  // cancelar() — _self.quit() → callback onClose
  // ---------------------------------------------------------------------------
  cancelar(onClose: () => void): void {
    onClose();
  }

  get list(): NodoDistrito[] { return this.#list; }
  get ruta(): RutaCo | null { return this.#ruta; }
}

// =============================================================================
// COMPONENTE REACT  —  equivale a activate_in(p_frame)
// =============================================================================

interface Props {
  gisService: GisService;
  onClose: () => void;
}

export function ArbolDistritosUI({ gisService, onClose }: Props) {
  const ctrl = useRef(new ArbolDistritosParaRuta(gisService));
  const [nodos, setNodos] = useState<NodoDistrito[]>([]);
  const [seleccion, setSel] = useState<NodoDistrito | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // activate_in → llena_arbol() al montar
  useEffect(() => {
    ctrl.current.llenaArbol()
      .then(setNodos)
      .catch(e => setError(String(e)))
      .finally(() => setCargando(false));
  }, []);

  const refresh = () => ctrl.current.llenaArbol().then(setNodos);
  const run = (fn: () => Promise<void>) => fn().catch(e => setError(e.message));

  const toggleCheck = (idx: number) => {
    setNodos(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], value: { ...next[idx].value, check: !next[idx].value.check } };
      ctrl.current.list[idx].value.check = next[idx].value.check; // sync instancia
      return next;
    });
  };

  return (
    <div style={s.frame}>
      <h3 style={s.title}>Asignar Distritos a la Ruta</h3>

      <div style={s.tree}>
        {cargando && <p style={s.msg}>Cargando distritos…</p>}
        {error && <p style={{ ...s.msg, color: '#c00' }}>⚠ {error}</p>}
        {!cargando && !error && nodos.length === 0 && (
          <p style={s.msg}>Sin distritos disponibles.</p>
        )}
        {nodos.map((nodo, i) => (
          <label
            key={nodo.key.id}
            style={{ ...s.row, background: seleccion?.key.id === nodo.key.id ? '#d0e8ff' : '' }}
            onClick={() => { setSel(nodo); ctrl.current.selected(nodo); }}
          >
            <input
              type="checkbox"
              checked={nodo.value.check}
              onChange={() => toggleCheck(i)}
              onClick={e => e.stopPropagation()}
            />
            <span style={{ marginLeft: 6 }}>{nodo.value.valor}</span>
            <small style={s.status}>{nodo.value.estatus}</small>
          </label>
        ))}
      </div>

      <div style={s.buttons}>
        <button onClick={() => run(() => ctrl.current.agregar(refresh))}>
          Agregar Distritos Seleccionados
        </button>
        <button onClick={() => run(() => ctrl.current.desagregar(refresh))}>
          Desagregar Distritos Seleccionados
        </button>
        <button onClick={() => run(() => ctrl.current.agregarManual(refresh))}>
          Agregar Distrito del mapa
        </button>
        <button onClick={() => ctrl.current.cancelar(onClose)} style={s.btnSalir}>
          Salir
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame: { display: 'flex', flexDirection: 'column', width: 440, border: '1px solid #bbb', borderRadius: 6, padding: 14, fontFamily: 'sans-serif', fontSize: 13, gap: 8 },
  title: { margin: 0, fontSize: 14, fontWeight: 'bold' },
  tree: { flex: 1, overflowY: 'auto', minHeight: 180, maxHeight: 380, border: '1px solid #ddd', borderRadius: 4, padding: 4 },
  row: { display: 'flex', alignItems: 'center', padding: '3px 6px', cursor: 'pointer', borderRadius: 3, userSelect: 'none' },
  status: { marginLeft: 'auto', color: '#888', fontSize: 11 },
  msg: { padding: 8, color: '#555' },
  buttons: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  btnSalir: { background: '#eee' },
};

export default ArbolDistritosUI;
