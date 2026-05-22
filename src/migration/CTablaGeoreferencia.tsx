/**
 * Migración: c_tabla_georeferencia.magik
 * Clase Magik: c_tabla_georeferencia — extiende c_base_sello_fibra
 *
 * Genera un sello de georreferencia de terminales ópticas de distribución.
 * Compuesto por dos tablas adyacentes:
 *   · tbl_datos  — N filas × 3 cols: nombre terminal / estado / distancia
 *   · tbl_coord  — N×2 filas × 3 cols: etiqueta X/Y | coord. geográfica | coord. UTM
 *
 * Métodos migrados:
 *   configura_tabla()                       → configuraTabla()
 *   coordenada_ubicacion_terminal(terminal) → coordenadaUbicacionTerminal(terminal)
 *   defined_attributes                      → DEFINED_ATTRIBUTES_GEOREF (constante)
 *   etiqueta_celdas()                       → etiquetaCeldas()  [privado]
 *   llena_datos_celdas()                    → async llenaDatosCeldas(...)
 *   obtener_informacion()                   → async obtenerInformacion()
 *   zona_utm                                → CTablaGeoreferencia.zonasUtm()
 *
 * Equivalencias clave:
 *   rope.new_with(0.2,0.6,0)               → lineColor: [0.2, 0.6, 0]  (verde)
 *   rope.new_with(0.4,0.2,0)               → labelColor: [0.4, 0.2, 0]  (marrón)
 *   .o_tablas.crea_tabla(f, c, :id)        → TableConfig { rows, cols, colWidths }
 *   .o_tablas.longitud_total_columnas(...)  → reduce suma de colWidths
 *   coordinate.new(x, y)                   → [x, y] : [number, number]
 *   range(1, N*2, 2)                       → Array.from 1,3,5... (impares hasta N*2)
 *   asigna_texto_celda(tbl,f,c,txt,sz,...) → celdas.get(tbl)?.set(`f-c`, CeldaTexto)
 *   c_coord_system_engine.get_coord_as_geograficas  → coordenada ya en WGS84 [lon,lat]
 *   get_transform_from_cs_to_cs("conic","utmN",:gis) → turf.toMercator (aprox. Web Mercator)
 *   _if a_geom.world.world_id <> 0 _andif ...building → terminal.enEdificio = true
 *   numbers_and_strings[1].last            → primer segmento alfanumérico, último carácter
 *   property_list.new()                    → {} (Record<string,string>)
 *   rope.new()  /  .add(elem)              → [] / .push(elem)
 */

import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';

// =============================================================================
// TIPOS — equivale a slots + property_list en Magik
// =============================================================================

/** Equivale a user!_terminal_fo */
export interface TerminalFO {
  id                  : string;
  /** user!_nombre */
  nombre              : string;
  /** user!_estado_terminal (valor enum visible) */
  estadoTerminal      : string;
  /** user!_dist_optica_emp_dist */
  distOpticaEmpDist   : number | null;
  /** user!_distancia_cal_emp_dist (valor display) */
  distanciaCalEmpDist : number | null;
  /** Geometría primaria — Magik: l_str.perform(l_str.primary_geometry) */
  coordenada          : [number, number];  // [lon, lat] WGS84
  /** Magik: l_str.inside_location — para terminales dentro de edificio */
  insideLocation      ?: [number, number];
  /** Magik: a_geom.world.owner.user!_building.location */
  buildingLocation    ?: [number, number];
  /** Magik: a_geom.world.world_id <> 0 && owner.user!_building _isnt _unset */
  enEdificio          ?: boolean;
}

/** Equivale a oCedo — proveedor de terminales desde el dataset GIS */
export interface CedoService {
  obtenTerminalesAtendidas(): TerminalFO[];
}

/** Equivale a oDtoOptico — elemento del landbase */
export interface DtoOptico {
  id    : string;
  nombre: string;
}

/** Una fila de datos calculada — Magik: LoRenglon property_list */
export interface FilaDatos {
  nombre   : string;   // [:nombre]
  estado   : string;   // [:estado]
  distancia: string;   // [:distancia]
  xGEO     : string;   // [:xGEO]
  yGEO     : string;   // [:yGEO]
  xUTM     : string;   // [:xUTM]
  yUTM     : string;   // [:yUTM]
}

/** Configuración de una tabla del sello — Magik: crea_tabla() */
export interface TableConfig {
  id         : string;
  rows       : number;
  cols       : number;
  colWidths  : number[];               // unidades del motor de planos
  rowHeight  : number;
  originX    : number;
  originY    : number;
  lineColor  : [number, number, number]; // RGB 0-1
}

/** Texto en una celda — Magik: asigna_texto_celda() */
interface CeldaTexto {
  texto  : string;
  tamanio: number;  // Magik: font size param (19 datos/etiqueta, 18 coords)
  color ?: string;  // CSS — marrón/verde según la paleta original
}

type CellKey = `${number}-${number}`;

/** Atributos de layout — Magik: defined_attributes */
export interface LayoutAttributes {
  LiteralTerminal: string | null; // :character, no en página de propiedades
  zona_utm       : string;        // :string, enum zona_utm, en página de propiedades
  zutm           : string;        // :string, zona almacenada internamente
}

// =============================================================================
// DEFINED_ATTRIBUTES — equivale a c_tabla_georeferencia.defined_attributes
// Magik: LcollAtributos << rope.new_from(_super.defined_attributes); add(...)
// =============================================================================

export const DEFINED_ATTRIBUTES_GEOREF = [
  {
    nombre       : 'LiteralTerminal',
    tipo         : 'character',
    descripcion  : 'Literal Terminal',
    default      : null,
    enPropiedades: false,   // Magik: :allowed_on_properties_page?, _false
    editor       : null,
  },
  {
    nombre       : 'zona_utm',
    tipo         : 'string',
    descripcion  : 'Zona UTM Lista',
    default      : '',
    enPropiedades: true,    // Magik: :allowed_on_properties_page?, _true
    metodoEnum   : 'zona_utm', // Magik: :enum_method, :zona_utm
    editor       : null,
  },
  {
    nombre       : 'zutm',
    tipo         : 'string',
    descripcion  : 'Zona UTM',
    default      : null,
    enPropiedades: false,
    editor       : null,
  },
] as const;

// =============================================================================
// ZONAS UTM — equivale a c_tabla_georeferencia.zona_utm
// Magik: rope.new_with("11","12","13","14","15","16")
// =============================================================================

export const ZONAS_UTM = ['11', '12', '13', '14', '15', '16'] as const;
export type ZonaUTM = (typeof ZONAS_UTM)[number];

// =============================================================================
// CLASE PRINCIPAL — c_tabla_georeferencia
// def_slotted_exemplar(:c_tabla_georeferencia, {...}, :c_base_sello_fibra)
// =============================================================================

export class CTablaGeoreferencia {

  // Magik: {:oDtoOptico, _unset, :writable}
  private oDtoOptico: DtoOptico | null = null;
  // Magik: {:oCedo, _unset, :writable}
  private oCedo: CedoService | null = null;
  // Magik: {:oRenglones, 1, :writable}  — default 1
  private oRenglones: number;
  // Magik: {:oDatosSello, _unset, :writable}
  private oDatosSello: FilaDatos[] = [];

  // Tablas configuradas por configuraTabla()
  public tblDatos: TableConfig | null = null;
  public tblCoord: TableConfig | null = null;

  // Celdas con texto — Magik: asigna_texto_celda maneja estas
  public celdas: Map<string, Map<CellKey, CeldaTexto>> = new Map();

  // Atributos de layout — Magik: defined_attributes
  public attributes: LayoutAttributes = {
    LiteralTerminal: null,
    zona_utm       : '',
    zutm           : '',
  };

  // Coordenada de inicio del sello — Magik: .o_coord_inicio
  private coordInicio: [number, number];

  constructor(
    renglones   : number,
    coordInicio : [number, number],
    cedo       ?: CedoService,
  ) {
    this.oRenglones  = renglones;
    this.coordInicio = coordInicio;
    this.oCedo       = cedo ?? null;
  }

  // ---------------------------------------------------------------------------
  // configura_tabla()
  //
  // Magik:
  //   lo_tabla << .o_tablas.crea_tabla(.oRenglones, 3, :tbl_datos)
  //   lo_tabla.oCoordenada_Origen << coordinate.new(coord_inicio.x, coord_inicio.y)
  //   _for nRen _over range(1,.oRenglones) → .orenglones.elemento(nRen).nlongitud << 6
  //   .ocolumnas.elemento(1..3).nlongitud << [8, 6, 11]
  //   lo_tabla.color_linea << rope.new_with(0.2, 0.6, 0)
  //
  //   ln_desp_x << .o_tablas.longitud_total_columnas({:tbl_datos})
  //   lo_tabla << .o_tablas.crea_tabla(.oRenglones*2, 3, :tbl_coord)
  //   ... columnas [3, 8, 14], rowHeight=3, originX += ln_desp_x
  //   _self.etiqueta_celdas()
  // ---------------------------------------------------------------------------
  configuraTabla(): void {
    // tbl_datos — N filas × 3 columnas
    const tblDatos: TableConfig = {
      id       : 'tbl_datos',
      rows     : this.oRenglones,
      cols     : 3,
      colWidths: [8, 6, 11],   // Magik: ocolumnas.elemento(1/2/3).nlongitud
      rowHeight: 6,             // Magik: orenglones.elemento(nRen).nlongitud << 6
      originX  : this.coordInicio[0],
      originY  : this.coordInicio[1],
      lineColor: [0.2, 0.6, 0], // Magik: rope.new_with(0.2,0.6,0) → verde
    };
    this.tblDatos = tblDatos;
    this.celdas.set('tbl_datos', new Map());

    // ln_desp_x — offset X para tbl_coord = suma de anchos de tbl_datos
    // Magik: .o_tablas.longitud_total_columnas({:tbl_datos})
    const desplX = tblDatos.colWidths.reduce((a, b) => a + b, 0); // = 25 u

    // tbl_coord — N×2 filas × 3 columnas, desplazada en X
    const tblCoord: TableConfig = {
      id       : 'tbl_coord',
      rows     : this.oRenglones * 2,
      cols     : 3,
      colWidths: [3, 8, 14],   // Magik: ocolumnas.elemento(1/2/3).nlongitud
      rowHeight: 3,             // Magik: orenglones.elemento(nRen).nlongitud << 3
      originX  : this.coordInicio[0] + desplX,
      originY  : this.coordInicio[1],
      lineColor: [0.2, 0.6, 0],
    };
    this.tblCoord = tblCoord;
    this.celdas.set('tbl_coord', new Map());

    // Rellena etiquetas X/Y en col 1 de tbl_coord
    this.etiquetaCeldas();
  }

  // ---------------------------------------------------------------------------
  // coordenada_ubicacion_terminal(PoTerminal)
  //
  // Magik:
  //   a_geom << l_str.perform(l_str.primary_geometry)
  //   _if a_geom _is _unset _andif l_str.responds_to?(:inside_location)
  //     a_geom << l_str.inside_location
  //   _if a_geom.world.world_id <> 0 _andif owner.user!_building _isnt _unset
  //     a_geom << a_geom.world.owner.user!_building.location
  //   _return a_geom.coord
  //
  // Resuelve la coordenada efectiva del terminal: primaria → inside → edificio.
  // ---------------------------------------------------------------------------
  coordenadaUbicacionTerminal(terminal: TerminalFO): [number, number] {
    let coord = terminal.coordenada;

    // _if a_geom _is _unset _andif l_str.responds_to?(:inside_location)
    if (!coord && terminal.insideLocation) {
      coord = terminal.insideLocation;
    }

    // _if a_geom.world.world_id <> 0 _andif owner.user!_building _isnt _unset
    // La terminal está en un mundo de edificio → usar la ubicación del edificio
    if (terminal.enEdificio && terminal.buildingLocation) {
      coord = terminal.buildingLocation;
    }

    return coord;
  }

  // ---------------------------------------------------------------------------
  // etiqueta_celdas()  [privado]
  //
  // Magik:
  //   _for iterRenglones _over range(1, .oRenglones*2, 2)
  //     asigna_texto_celda(:tbl_coord, iterRenglones,   1, "X", 19, ..., {0.4,0.2,0})
  //     asigna_texto_celda(:tbl_coord, iterRenglones+1, 1, "Y", 19, ..., {0.4,0.2,0})
  //
  // range(1, N, 2) en Magik itera 1,3,5,... hasta N — genera pares X/Y por renglón.
  // Color {0.4,0.2,0} ≈ marrón (#663300).
  // ---------------------------------------------------------------------------
  private etiquetaCeldas(): void {
    const map = this.celdas.get('tbl_coord')!;
    // Magik: range(1, .oRenglones*2, 2) → impares: 1, 3, 5, ...
    for (let r = 1; r <= this.oRenglones * 2; r += 2) {
      map.set(`${r}-1`   as CellKey, { texto: 'X', tamanio: 19, color: '#663300' }); // marrón
      map.set(`${r + 1}-1` as CellKey, { texto: 'Y', tamanio: 19, color: '#663300' });
    }
  }

  // ---------------------------------------------------------------------------
  // obtener_informacion()
  //
  // Magik:
  //   !current_coordinate_system! << _unset
  //   loTerminales << .oCedo.obten_terminales_atendidas()
  //   .oDatosSello << rope.new()
  //   _for iterTerminal _over loTerminales.elements()
  //     _if iterTerminal.user!_nombre.numbers_and_strings[1].last = LiteralTerminal
  //       LoRenglon << property_list.new()
  //       ... llena nombre/estado/distancia/xGEO/yGEO/xUTM/yUTM
  //       .oDatosSello.add(LoRenglon)
  //
  // Obtiene y transforma coordenadas de cada terminal que coincida con el literal.
  // ---------------------------------------------------------------------------
  async obtenerInformacion(): Promise<void> {
    if (!this.oCedo) return;

    const terminales = this.oCedo.obtenTerminalesAtendidas();
    this.oDatosSello = [];

    const literal = this.attributes.LiteralTerminal;

    for (const terminal of terminales) {
      // Magik: user!_nombre.numbers_and_strings[1].last
      // Primer segmento alfanumérico del nombre → su último carácter
      const primerSegmento = terminal.nombre.match(/[A-Za-z0-9]+/)?.[0] ?? '';
      const ultimoChar = primerSegmento.slice(-1).toUpperCase();

      if (literal !== null && ultimoChar !== literal.toUpperCase()) continue;

      const fila: FilaDatos = {
        nombre   : terminal.nombre,
        estado   : terminal.estadoTerminal,
        distancia: this.resolveDistancia(terminal),
        xGEO     : '',
        yGEO     : '',
        xUTM     : '',
        yUTM     : '',
      };

      // Coordenada real: considera geom primaria, inside_location y edificio
      const [lon, lat] = this.coordenadaUbicacionTerminal(terminal);

      // Magik: LoCs.get_coord_as_geograficas(LoCoordenada)
      // En TS la coordenada ya está en WGS84 → conversión directa a fixed string
      fila.xGEO = lon.toFixed(4).padStart(10);
      fila.yGEO = lat.toFixed(4).padStart(10);

      // Magik: _if LsUtm <> "" _andif LsUtm <> _unset
      //   LoTransf << LoCs.get_transform_from_cs_to_cs("conic","utm"+LsUtm,:gis)
      //   LoCoordUtm << LoCoordenada.transformed(LoTransf)
      // TS: turf.toMercator → Web Mercator como aproximación a UTM
      let zonaUtm = this.attributes.zutm;
      if (!zonaUtm) {
        // Magik: _self.attributes[:zutm].value << _self.attributes[:zona_utm].value
        zonaUtm = this.attributes.zona_utm;
        this.attributes.zutm = zonaUtm;
      }

      if (zonaUtm !== '') {
        const punto    = turf.point([lon, lat]);
        const mercator = turf.toMercator(punto);
        const [mx, my] = mercator.geometry.coordinates;
        fila.xUTM = mx.toFixed(2).padStart(10);
        fila.yUTM = my.toFixed(2).padStart(10);
      }

      this.oDatosSello.push(fila);
    }
  }

  /** Magik: _if distancia _is _unset → "0.0" _else display_value(...).write_string_normal(1) */
  private resolveDistancia(terminal: TerminalFO): string {
    if (terminal.distanciaCalEmpDist === null || terminal.distanciaCalEmpDist === undefined) {
      return '0.0';
    }
    return terminal.distanciaCalEmpDist.toFixed(1);
  }

  // ---------------------------------------------------------------------------
  // llena_datos_celdas()
  //
  // Magik:
  //   .oDtoOptico << _self.obtener_elementos_bd_landbase()[1]
  //   .oCedo      << _self.obtener_elementos_bd_gis()[1]
  //   _self.obtener_informacion()
  //   LoCont << 1
  //   _for iterRengDatos _over .oDatosSello.elements()
  //     asigna_texto_celda(:tbl_datos, LoCont, 1/2/3, nombre/estado/dist, ...)
  //     asigna_texto_celda(:tbl_coord, (LoCont-1)*2+1/2, 2/3, xGEO/yGEO/xUTM/yUTM, ...)
  //     LoCont +<< 1
  // ---------------------------------------------------------------------------
  async llenaDatosCeldas(
    elementosBdLb : DtoOptico[],
    elementosBdGis: CedoService[],
  ): Promise<FilaDatos[]> {
    // Magik: .oDtoOptico << obtener_elementos_bd_landbase()[1]
    if (elementosBdLb.length > 0) this.oDtoOptico = elementosBdLb[0];
    // Magik: .oCedo      << obtener_elementos_bd_gis()[1]
    if (elementosBdGis.length > 0) this.oCedo = elementosBdGis[0];

    await this.obtenerInformacion();

    // Rellena celdas de ambas tablas con los datos obtenidos
    const mapDatos = this.celdas.get('tbl_datos')!;
    const mapCoord = this.celdas.get('tbl_coord')!;

    this.oDatosSello.forEach((fila, idx) => {
      const cont = idx + 1; // Magik: LoCont empieza en 1
      const verde = '#2e7d32';

      // tbl_datos: nombre / estado / distancia
      mapDatos.set(`${cont}-1` as CellKey, { texto: fila.nombre,    tamanio: 21, color: verde });
      mapDatos.set(`${cont}-2` as CellKey, { texto: fila.estado,    tamanio: 21, color: verde });
      mapDatos.set(`${cont}-3` as CellKey, { texto: fila.distancia, tamanio: 21, color: verde });

      // tbl_coord filas de coordenadas — Magik: ((LoCont-1)*2)+1 / +2
      const rX = (cont - 1) * 2 + 1;  // fila X (impar)
      const rY = (cont - 1) * 2 + 2;  // fila Y (par)

      mapCoord.set(`${rX}-2` as CellKey, { texto: fila.xGEO, tamanio: 18, color: verde });
      mapCoord.set(`${rY}-2` as CellKey, { texto: fila.yGEO, tamanio: 18, color: verde });
      mapCoord.set(`${rX}-3` as CellKey, { texto: fila.xUTM, tamanio: 18, color: verde });
      mapCoord.set(`${rY}-3` as CellKey, { texto: fila.yUTM, tamanio: 18, color: verde });
    });

    return this.oDatosSello;
  }

  // ---------------------------------------------------------------------------
  // zona_utm  — devuelve el enum de zonas UTM disponibles
  // Magik: rope.new_with("11","12","13","14","15","16")
  // ---------------------------------------------------------------------------
  static zonasUtm(): string[] {
    return [...ZONAS_UTM];
  }

  // Getters de slots
  getDatosSello(): FilaDatos[]    { return this.oDatosSello; }
  getRenglones() : number         { return this.oRenglones; }
}

// =============================================================================
// MOCK DATA — simula BD GIS y Landbase de CTL México
// Sustituye: gis_program_manager.cached_dataset(:landbase/..) y oCedo.obten_terminales
// =============================================================================

/** Terminales con nombres cuyo primer segmento termina en "L" (TDSL) → LiteralTerminal="L" */
const MOCK_TERMINALES: TerminalFO[] = [
  {
    id                  : 'T-001',
    nombre              : 'TDSL-01',   // primer segmento "TDSL" → último char = "L"
    estadoTerminal      : 'ACTIVO',
    distOpticaEmpDist   : 125.5,
    distanciaCalEmpDist : 125.5,
    coordenada          : [-99.1332, 19.4326], // Ciudad de México (WGS84)
    enEdificio          : false,
  },
  {
    id                  : 'T-002',
    nombre              : 'TDSL-02',
    estadoTerminal      : 'EN CONSTRUCCION',
    distOpticaEmpDist   : null,
    distanciaCalEmpDist : null,
    coordenada          : [-99.1450, 19.4280],
    enEdificio          : true,
    buildingLocation    : [-99.1455, 19.4285], // coordenada del edificio anfitrión
  },
  {
    id                  : 'T-003',
    nombre              : 'TDSL-03',
    estadoTerminal      : 'FUERA DE SERVICIO',
    distOpticaEmpDist   : 304.2,
    distanciaCalEmpDist : 304.2,
    coordenada          : [-99.1200, 19.4400],
    enEdificio          : false,
  },
  {
    id                  : 'T-004',
    nombre              : 'TDSC-04',   // primer segmento "TDSC" → último char = "C" → no coincide con "L"
    estadoTerminal      : 'ACTIVO',
    distOpticaEmpDist   : 88.0,
    distanciaCalEmpDist : 88.0,
    coordenada          : [-99.1600, 19.4100],
    enEdificio          : false,
  },
];

export const mockCedoGeoreferencia: CedoService = {
  obtenTerminalesAtendidas: () => MOCK_TERMINALES,
};

export const mockDtoOpticoGeoreferencia: DtoOptico = {
  id    : 'DTO-001',
  nombre: 'CTO Óptico Central Tlalpan',
};

// =============================================================================
// COMPONENTE REACT — visualiza CTablaGeoreferencia
// Equivale a la representación gráfica de los dos sellos en el motor de planos
// =============================================================================

const SCALE = 8; // px por unidad del motor de planos (para la vista SVG)

export function CTablaGeoreferenciaUI() {
  const [renglones , setRenglones ] = useState(3);
  const [literal   , setLiteral   ] = useState('L');
  const [zonaUtm   , setZonaUtm   ] = useState('14');
  const [datos     , setDatos     ] = useState<FilaDatos[]>([]);
  const [tabla     , setTabla     ] = useState<CTablaGeoreferencia | null>(null);
  const [loading   , setLoading   ] = useState(false);

  const ejecutar = async (rens: number, lit: string, zona: string) => {
    setLoading(true);
    const t = new CTablaGeoreferencia(rens, [0, 0], mockCedoGeoreferencia);
    t.attributes.LiteralTerminal = lit || null;
    t.attributes.zona_utm        = zona;
    t.attributes.zutm            = '';
    t.configuraTabla();
    const filas = await t.llenaDatosCeldas(
      [mockDtoOpticoGeoreferencia],
      [mockCedoGeoreferencia],
    );
    setTabla(t);
    setDatos(filas);
    setLoading(false);
  };

  useEffect(() => { ejecutar(renglones, literal, zonaUtm); }, []);

  return (
    <div style={st.frame}>
      <h3 style={st.title}>c_tabla_georeferencia</h3>
      <p style={st.meta}>
        Sello de georreferencia de terminales ópticas.
        Dos tablas: <code>tbl_datos</code> (N×3: nombre/estado/dist) +{' '}
        <code>tbl_coord</code> (N×2×3: X/Y | GEO | UTM).
      </p>

      {/* ── Controles — equivale a los atributos de layout del sello ── */}
      <div style={st.control}>
        <span style={st.badge}>Atributos de layout</span>
        <label style={st.lbl}>
          Renglones (oRenglones):
          <input
            type="number" min={1} max={8} value={renglones}
            onChange={e => {
              const v = Math.max(1, Number(e.target.value));
              setRenglones(v);
              ejecutar(v, literal, zonaUtm);
            }}
            style={st.numInput}
          />
        </label>
        <label style={st.lbl}>
          LiteralTerminal:
          <input
            type="text" maxLength={1} value={literal}
            onChange={e => {
              const v = e.target.value.toUpperCase();
              setLiteral(v);
              ejecutar(renglones, v, zonaUtm);
            }}
            style={{ ...st.numInput, width: 28, textAlign: 'center' }}
            placeholder="—"
          />
        </label>
        <label style={st.lbl}>
          zona_utm:
          <select
            value={zonaUtm}
            onChange={e => {
              setZonaUtm(e.target.value);
              ejecutar(renglones, literal, e.target.value);
            }}
            style={st.select}
          >
            <option value="">— sin UTM —</option>
            {CTablaGeoreferencia.zonasUtm().map(z => (
              <option key={z} value={z}>Zona {z}</option>
            ))}
          </select>
        </label>
      </div>

      {/* ── Info de configuración de tablas (configura_tabla) ── */}
      {tabla?.tblDatos && tabla?.tblCoord && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
          <TableInfoBox title="tbl_datos" config={tabla.tblDatos} />
          <TableInfoBox title="tbl_coord" config={tabla.tblCoord} />
        </div>
      )}

      {loading && <p style={st.meta}>Cargando…</p>}

      {!loading && datos.length === 0 && (
        <p style={{ ...st.meta, color: '#c62828', marginTop: 8 }}>
          Sin terminales cuyo primer segmento de nombre termine en "{literal}".
          Prueba con <strong>L</strong> (TDSL) o vacío para ver todos.
        </p>
      )}

      {/* ── Vista SVG del layout de las dos tablas ── */}
      {!loading && tabla?.tblDatos && tabla?.tblCoord && datos.length > 0 && (
        <SelloSVG tabla={tabla} datos={datos} />
      )}

      {/* ── Tabla de datos resultante ── */}
      {!loading && datos.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th colSpan={3} style={{ ...st.th, background: '#2e5e2e', textAlign: 'center' }}>
                  tbl_datos
                </th>
                <th colSpan={4} style={{ ...st.th, background: '#1a3c5e', textAlign: 'center' }}>
                  tbl_coord
                </th>
              </tr>
              <tr>
                {['Nombre', 'Estado', 'Dist (m)', 'X GEO', 'Y GEO', 'X UTM', 'Y UTM'].map(h => (
                  <th key={h} style={st.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f6fff6' : '#fff' }}>
                  <td style={st.td}>{fila.nombre}</td>
                  <td style={st.td}>{fila.estado}</td>
                  <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{fila.distancia}</td>
                  <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{fila.xGEO.trim()}</td>
                  <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{fila.yGEO.trim()}</td>
                  <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{fila.xUTM.trim() || '—'}</td>
                  <td style={{ ...st.td, textAlign: 'right', fontFamily: 'monospace' }}>{fila.yUTM.trim() || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tabla de equivalencias Magik ↔ TypeScript ── */}
      <EquivalenciasTable />
    </div>
  );
}

// -----------------------------------------------------------------------------
// SVG del layout de sellos — equivale al renderizado de oTablas.Despliega(window)
// -----------------------------------------------------------------------------
function SelloSVG({ tabla, datos }: { tabla: CTablaGeoreferencia; datos: FilaDatos[] }) {
  const tblD = tabla.tblDatos!;
  const tblC = tabla.tblCoord!;
  const mapD = tabla.celdas.get('tbl_datos')!;
  const mapC = tabla.celdas.get('tbl_coord')!;

  // Dimensiones SVG
  const wDatos = tblD.colWidths.reduce((a, b) => a + b, 0) * SCALE;
  const wCoord = tblC.colWidths.reduce((a, b) => a + b, 0) * SCALE;
  const hDatos = tblD.rows * tblD.rowHeight * SCALE;
  const hCoord = tblC.rows * tblC.rowHeight * SCALE;
  const svgW   = wDatos + wCoord + 2;
  const svgH   = Math.max(hDatos, hCoord) + 2;

  // Colores de borde → CSS rgb desde lineColor [0-1]
  const toRgb = (c: [number,number,number]) =>
    `rgb(${c.map(v => Math.round(v * 255)).join(',')})`;

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ ...st.meta, marginBottom: 4 }}>
        Vista SVG del sello (escala {SCALE}px/u) — tbl_datos {wDatos/SCALE}u + tbl_coord {wCoord/SCALE}u
      </p>
      <svg width={svgW} height={svgH + 16} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 3 }}>
        {/* ── tbl_datos ─────────────────────────────────────────────────────── */}
        <g transform="translate(1,1)">
          {Array.from({ length: tblD.rows }, (_, ri) =>
            Array.from({ length: tblD.cols }, (_, ci) => {
              const fila = ri + 1;
              const col  = ci + 1;
              const xOff = tblD.colWidths.slice(0, ci).reduce((a, b) => a + b, 0) * SCALE;
              const yOff = ri * tblD.rowHeight * SCALE;
              const w    = tblD.colWidths[ci] * SCALE;
              const h    = tblD.rowHeight * SCALE;
              const cel  = mapD.get(`${fila}-${col}` as CellKey);
              return (
                <g key={`d-${ri}-${ci}`}>
                  <rect x={xOff} y={yOff} width={w} height={h}
                    fill={cel ? '#f0fff4' : '#fafafa'}
                    stroke={toRgb(tblD.lineColor)} strokeWidth={0.7} />
                  {cel && (
                    <text x={xOff + w / 2} y={yOff + h / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(6, h * 0.45)}
                      fill={cel.color ?? '#1a1a1a'}
                      fontFamily="sans-serif">
                      {cel.texto.trim()}
                    </text>
                  )}
                </g>
              );
            })
          )}
          {/* Borde exterior tbl_datos */}
          <rect x={0} y={0} width={wDatos} height={hDatos}
            fill="none" stroke={toRgb(tblD.lineColor)} strokeWidth={1.5} />
          {/* Etiqueta tabla */}
          <text x={wDatos / 2} y={hDatos + 12} textAnchor="middle"
            fontSize={9} fill="#555" fontFamily="sans-serif">tbl_datos</text>
        </g>

        {/* ── tbl_coord ─────────────────────────────────────────────────────── */}
        <g transform={`translate(${1 + wDatos},1)`}>
          {Array.from({ length: tblC.rows }, (_, ri) =>
            Array.from({ length: tblC.cols }, (_, ci) => {
              const fila = ri + 1;
              const col  = ci + 1;
              const xOff = tblC.colWidths.slice(0, ci).reduce((a, b) => a + b, 0) * SCALE;
              const yOff = ri * tblC.rowHeight * SCALE;
              const w    = tblC.colWidths[ci] * SCALE;
              const h    = tblC.rowHeight * SCALE;
              const cel  = mapC.get(`${fila}-${col}` as CellKey);
              const isXY = col === 1; // col 1 = etiquetas X/Y (etiqueta_celdas)
              return (
                <g key={`c-${ri}-${ci}`}>
                  <rect x={xOff} y={yOff} width={w} height={h}
                    fill={isXY ? '#fff8f0' : (cel ? '#f0fff4' : '#fafafa')}
                    stroke={toRgb(tblC.lineColor)} strokeWidth={0.7} />
                  {cel && (
                    <text x={xOff + w / 2} y={yOff + h / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={Math.max(5, h * 0.50)}
                      fill={cel.color ?? '#1a1a1a'}
                      fontWeight={isXY ? 'bold' : 'normal'}
                      fontFamily="monospace">
                      {cel.texto.trim()}
                    </text>
                  )}
                </g>
              );
            })
          )}
          {/* Borde exterior tbl_coord */}
          <rect x={0} y={0} width={wCoord} height={hCoord}
            fill="none" stroke={toRgb(tblC.lineColor)} strokeWidth={1.5} />
          <text x={wCoord / 2} y={hCoord + 12} textAnchor="middle"
            fontSize={9} fill="#555" fontFamily="sans-serif">tbl_coord</text>
        </g>
      </svg>
    </div>
  );
}

// Info compacta de la configuración de una tabla
function TableInfoBox({ title, config }: { title: string; config: TableConfig }) {
  const rgb = `rgb(${config.lineColor.map(v => Math.round(v * 255)).join(',')})`;
  return (
    <div style={{ border: `2px solid ${rgb}`, borderRadius: 4, padding: '6px 10px', minWidth: 170, fontSize: 11 }}>
      <strong>{title}</strong>
      <div style={{ color: '#555', marginTop: 3 }}>
        <div>{config.rows} filas × {config.cols} cols</div>
        <div>Anchos: [{config.colWidths.join(', ')}] u</div>
        <div>Alto fila: {config.rowHeight} u</div>
        <div>Origen: ({config.originX.toFixed(0)}, {config.originY.toFixed(0)})</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Color linea:
          <span style={{ display:'inline-block', width:10, height:10, background:rgb, border:'1px solid #999' }} />
          {rgb}
        </div>
      </div>
    </div>
  );
}

// Tabla de equivalencias Magik ↔ TypeScript
function EquivalenciasTable() {
  const rows = [
    { m: 'def_slotted_exemplar(..., :c_base_sello_fibra)', t: 'class CTablaGeoreferencia { ... }', n: 'Herencia → clase TypeScript' },
    { m: '.oRenglones (default 1)',                        t: 'private oRenglones: number = 1',    n: 'Slot con valor por defecto' },
    { m: 'crea_tabla(N, 3, :tbl_datos)',                   t: 'TableConfig { rows:N, colWidths:[8,6,11] }', n: 'Tabla de datos N×3' },
    { m: 'crea_tabla(N*2, 3, :tbl_coord)',                 t: 'TableConfig { rows:N*2, colWidths:[3,8,14] }', n: 'Tabla de coords N×2 filas' },
    { m: 'longitud_total_columnas({:tbl_datos})',          t: 'colWidths.reduce((a,b) => a+b, 0)',  n: 'Offset X para tbl_coord' },
    { m: 'range(1, N*2, 2)',                               t: 'for r=1; r<=N*2; r+=2',             n: 'Pares X/Y en etiqueta_celdas' },
    { m: 'rope.new_with(0.2,0.6,0) → verde',              t: "[0.2, 0.6, 0]  → '#2e7d32'",       n: 'Color de línea tabla' },
    { m: 'rope.new_with(0.4,0.2,0) → marrón',             t: "[0.4, 0.2, 0]  → '#663300'",       n: 'Color etiquetas X/Y' },
    { m: 'numbers_and_strings[1].last',                    t: 'nombre.match(/[A-Za-z0-9]+/)?.[0].slice(-1)', n: 'Filtro LiteralTerminal' },
    { m: 'a_geom.world.world_id <> 0 && ...building',     t: 'terminal.enEdificio && buildingLocation', n: 'Resolución coord. edificio' },
    { m: 'get_coord_as_geograficas(coord)',                t: 'coord ya en WGS84 [lon, lat]',      n: 'Conversión a geográficas' },
    { m: 'get_transform("conic","utm14",:gis)',            t: 'turf.toMercator(point)',             n: 'Proyección UTM (aprox. Mercator)' },
    { m: 'display_value(:distancia).write_string_normal(1)', t: 'toFixed(1)',                      n: 'Formato 1 decimal' },
    { m: 'as_fixed_string(10,4)',                          t: 'toFixed(4).padStart(10)',            n: 'Fixed string geográficas' },
    { m: 'as_fixed_string(10,2)',                          t: 'toFixed(2).padStart(10)',            n: 'Fixed string UTM' },
    { m: 'property_list.new() + add(LoRenglon)',           t: 'FilaDatos {} / oDatosSello.push()', n: 'Acumulador de filas' },
  ];
  return (
    <table style={{ ...st.table, marginTop: 16 }}>
      <thead>
        <tr>
          {['Magik', 'TypeScript', 'Notas'].map(h => <th key={h} style={st.th}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ m, t, n }, i) => (
          <tr key={m} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
            <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{m}</code></td>
            <td style={{ ...st.td, fontFamily: 'monospace', fontSize: 10 }}><code>{t}</code></td>
            <td style={{ ...st.td, color: '#555', fontSize: 11 }}>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// Estilos
// =============================================================================
const st: Record<string, React.CSSProperties> = {
  frame   : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title   : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta    : { color: '#666', fontSize: 12, margin: '2px 0' },
  control : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl     : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  numInput: { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3, width: 50 },
  select  : { padding: '2px 6px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 3 },
  btn     : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  badge   : { fontSize: 10, background: '#2E4057', color: '#fff', borderRadius: 3, padding: '2px 7px', fontFamily: 'monospace' },
  table   : { borderCollapse: 'collapse' as const, width: '100%' },
  th      : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left' as const, fontSize: 11 },
  td      : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default CTablaGeoreferenciaUI;
