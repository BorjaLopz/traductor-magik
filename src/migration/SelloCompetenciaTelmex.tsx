/**
 * Migración: c_sello_competencia_telmex.magik
 * Empresa:   Sigma Tao — lgranados — 18-agosto-2008
 * Clase Magik: c_sello_competencia_telmex — extiende c_base_sello_fibra
 *
 * Cuadro de competencia telefónica por edificio para planos de FO.
 * Una tabla: tbl_contenido — 10 filas × 3 cols {10,27,7}u.
 *   Col 1: icono SVG (p_xxx)
 *   Col 2: descripción en color
 *   Col 3: contador (dato de inventario del edificio)
 *
 * Métodos migrados:
 *   defined_attributes()    → DEFINED_ATTRIBUTES (constante estática)
 *   configura_tabla()       → configurarTabla()
 *   etiqueta_celdas()       → etiquetarCeldas()
 *   llena_datos_celdas()    → async llena_datos_celdas(service)
 *
 * Equivalencias:
 *   c_base_sello_fibra                   → CBaseSelloFibra (importado)
 *   gis_program_manager.cached_dataset   → IGisDataService (interface + mock)
 *   user!_building.obtener_inventario_detallado() → BuildingInventory (mock async)
 *   oculta_bordes_celdas                 → tabla sin líneas internas (ver nota)
 *
 * Nota de bordes (oculta_bordes_celdas):
 *   :borde_der col1 (filas 1-10)    → sin borde derecho en col1
 *   :borde_der_izq col2 (filas 1-10) → sin bordes laterales en col2 → cols 1+2 "fundidos"
 *   :borde_inf filas 1-9 (cols 1-3)  → sin líneas horizontales internas
 *   Resultado visual: tabla abierta, solo borde exterior visible.
 *
 * Nota campos comentados en llena_datos_celdas (no cargados de BD en original):
 *   pred_deshabitado, tv_satelital, tv_cable, solicitud
 */

import React, { useState } from 'react';
import type { ColorMagik, CeldaTexto, CeldaSimbolo } from './SelloSimbologiaDiagramaEmpalmes';
import { CBaseSelloFibra } from './SelloSimbologiaDiagramaEmpalmes';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: layout_attribute_definition slots del sello */
export interface AtributosSello {
  predDeshabitado : string;        // :pred_deshabitado
  tvSatelital     : string;        // :tv_satelital
  tvCable         : string;        // :tv_cable
  operteles       : string;        // :operteles
  opertelesInalam : string;        // :operteles_inalam
  telmexInalam    : string;        // :telmex_inalam
  telPubCompet    : string;        // :tel_pub_compet
  casetaLadafon   : string;        // :caseta_ladafon
  casetaLadatel   : string;        // :caseta_ladatel
  solicitud       : string;        // :solicitud
  idEdificio      : number | null; // :idEdificio, :integer, _unset
}

/** Magik: user!_building.obtener_inventario_detallado() → campos de colecciones GIS */
export interface BuildingInventory {
  linea_comp_cu  : string;  // user!_linea_comp_cu  → operteles
  linea_comp_inal: string;  // user!_linea_comp_inal → opertelesInalam
  linea_inal     : string;  // user!_linea_inal      → telmexInalam
  tel_pub_comp   : string;  // user!_tel_pub_comp    → telPubCompet
  linea_lf       : string;  // user!_linea_lf        → casetaLadafon
  linea_pslt     : string;  // user!_linea_pslt      → casetaLadatel
}

/** Magik: gis_program_manager.cached_dataset(:gis).collections[:user!_building] */
export interface IGisDataService {
  fetchBuildingInventory(idEdificio: number): Promise<BuildingInventory | null>;
}

type CellKey = `${number}-${number}`;

// =============================================================================
// CONSTANTES DE LAYOUT
// =============================================================================

// Magik: :ren,{6,6,...×10}  :col,{10,27,7}
const CONT_ROWS = Array<number>(10).fill(6);    // 10 × 6u = 60u total
const CONT_COLS = [10, 27, 7];                  // col1=10u | col2=27u | col3=7u = 44u total
const CONT_H    = CONT_ROWS.reduce((a, b) => a + b, 0); // 60u
const TABLE_W   = CONT_COLS.reduce((a, b) => a + b, 0); // 44u

// =============================================================================
// DATOS DE FILAS — tabla de etiquetas + símbolos
// Driving data para etiqueta_celdas() + SVG rendering
// =============================================================================

interface FilaDef {
  simbolo    : string;           // nombre del símbolo Magik
  descripcion: string;           // texto col2
  color      : ColorMagik;       // {R,G,B} 0-1
  atributo   : keyof AtributosSello;
}

// Magik: etiqueta_celdas() — asigna_simbolo_celda + asigna_texto_celda por fila
const FILAS: FilaDef[] = [
  { simbolo: 'p_predio_deshabitado',    descripcion: 'PREDIO DESHABITADO',    color: [0,0,0],                  atributo: 'predDeshabitado'  },
  { simbolo: 'p_tv_satelital',          descripcion: 'TELEVISION SATELITAL',  color: [0,0,0],                  atributo: 'tvSatelital'      },
  { simbolo: 'p_tv_por_cable',          descripcion: 'TELEVISION/CABLE',       color: [0,0,0],                  atributo: 'tvCable'          },
  { simbolo: 'p_operteles',             descripcion: 'OPERTELES',              color: [0.05981,0.05981,0.4090], atributo: 'operteles'        },
  { simbolo: 'p_operteles_inalambrica', descripcion: 'INALAMBRICA OPERTELES', color: [0.05981,0.05981,0.4090], atributo: 'opertelesInalam'  },
  { simbolo: 'p_telmex_inalambrica',    descripcion: 'INALAMBRICA TELMEX',    color: [0,0,0],                  atributo: 'telmexInalam'     },
  { simbolo: 'p_telpub_compet',         descripcion: 'TEL/PUB COMPET.',        color: [0,0,1],                  atributo: 'telPubCompet'     },
  { simbolo: 'p_caseta_ladafon',        descripcion: 'CASETA LADAFON',         color: [0,0,0],                  atributo: 'casetaLadafon'    },
  { simbolo: 'p_caseta_ladatel',        descripcion: 'CASETA LADATEL',         color: [0,0.2953,0],             atributo: 'casetaLadatel'    },
  { simbolo: 'p_solicitud',             descripcion: 'SOLICITUD',              color: [0,0,0],                  atributo: 'solicitud'        },
];

// Magik: {R,G,B} 0-1 → CSS rgb()
function magikColor([r, g, b]: ColorMagik): string {
  return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;
}

// =============================================================================
// ICONOS SVG — catálogo de símbolos (reemplaza recursos de Smallworld)
// Cada función dibuja en (cx, cy) con radio r (aprox mitad del alto de fila).
// =============================================================================

type IconFn = (cx: number, cy: number, r: number) => React.ReactNode;

const ICONOS: Record<string, IconFn> = {
  // Casa + X (predio sin habitante)
  'p_predio_deshabitado': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <polygon points={`${cx},${cy-r*0.95} ${cx-r*0.8},${cy-r*0.1} ${cx+r*0.8},${cy-r*0.1}`} />
      <rect x={cx-r*0.55} y={cy-r*0.1} width={r*1.1} height={r*0.9} />
      <line x1={cx-r*0.4} y1={cy-r*0.1} x2={cx+r*0.4} y2={cy+r*0.8} strokeWidth={0.7} />
      <line x1={cx+r*0.4} y1={cy-r*0.1} x2={cx-r*0.4} y2={cy+r*0.8} strokeWidth={0.7} />
    </g>
  ),
  // Antena parabólica (arco + mástil)
  'p_tv_satelital': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.9}>
      <path d={`M${cx-r*0.8},${cy+r*0.5} Q${cx},${cy-r*0.6} ${cx+r*0.8},${cy+r*0.5}`} />
      <line x1={cx} y1={cy-r*0.6} x2={cx} y2={cy+r*0.9} />
      <circle cx={cx} cy={cy-r*0.6} r={r*0.15} fill="#444" />
    </g>
  ),
  // Pantalla TV + antena
  'p_tv_por_cable': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <rect x={cx-r*0.7} y={cy-r*0.4} width={r*1.4} height={r*1.1} rx={r*0.1} />
      <line x1={cx-r*0.2} y1={cy-r*0.4} x2={cx-r*0.5} y2={cy-r*0.9} />
      <line x1={cx+r*0.2} y1={cy-r*0.4} x2={cx+r*0.5} y2={cy-r*0.9} />
    </g>
  ),
  // Auricular telefónico
  'p_operteles': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={1}>
      <path d={`M${cx-r*0.5},${cy-r*0.5} Q${cx-r*0.6},${cy} ${cx-r*0.2},${cy+r*0.5}`} />
      <path d={`M${cx+r*0.5},${cy-r*0.5} Q${cx+r*0.6},${cy} ${cx+r*0.2},${cy+r*0.5}`} />
      <path d={`M${cx-r*0.5},${cy-r*0.5} Q${cx},${cy-r*1.1} ${cx+r*0.5},${cy-r*0.5}`} />
      <path d={`M${cx-r*0.2},${cy+r*0.5} Q${cx},${cy+r*0.8} ${cx+r*0.2},${cy+r*0.5}`} />
    </g>
  ),
  // Auricular + ondas inalámbricas
  'p_operteles_inalambrica': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <path d={`M${cx-r*0.75},${cy-r*0.3} Q${cx-r*0.8},${cy+r*0.2} ${cx-r*0.4},${cy+r*0.65}`} />
      <path d={`M${cx+r*0.1},${cy-r*0.3} Q${cx+r*0.05},${cy+r*0.2} ${cx-r*0.2},${cy+r*0.65}`} />
      <path d={`M${cx-r*0.75},${cy-r*0.3} Q${cx-r*0.35},${cy-r*0.85} ${cx+r*0.1},${cy-r*0.3}`} />
      <path d={`M${cx-r*0.4},${cy+r*0.65} Q${cx-r*0.3},${cy+r*0.85} ${cx-r*0.2},${cy+r*0.65}`} />
      <path d={`M${cx+r*0.4},${cy-r*0.7} Q${cx+r*0.7},${cy-r*0.4} ${cx+r*0.4},${cy-r*0.1}`} strokeWidth={0.7} />
      <path d={`M${cx+r*0.55},${cy-r*0.85} Q${cx+r*0.9},${cy-r*0.4} ${cx+r*0.55},${cy+r*0.05}`} strokeWidth={0.6} />
    </g>
  ),
  // Auricular + símbolo T
  'p_telmex_inalambrica': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <path d={`M${cx-r*0.7},${cy-r*0.1} Q${cx-r*0.75},${cy+r*0.4} ${cx-r*0.35},${cy+r*0.85}`} />
      <path d={`M${cx+r*0.05},${cy-r*0.1} Q${cx},${cy+r*0.4} ${cx-r*0.15},${cy+r*0.85}`} />
      <path d={`M${cx-r*0.7},${cy-r*0.1} Q${cx-r*0.3},${cy-r*0.65} ${cx+r*0.05},${cy-r*0.1}`} />
      <path d={`M${cx-r*0.35},${cy+r*0.85} Q${cx-r*0.25},${cy+r*1.0} ${cx-r*0.15},${cy+r*0.85}`} />
      <line x1={cx+r*0.3}  y1={cy-r*0.9} x2={cx+r*0.8}  y2={cy-r*0.9} strokeWidth={1} />
      <line x1={cx+r*0.55} y1={cy-r*0.9} x2={cx+r*0.55} y2={cy+r*0.1} strokeWidth={1} />
    </g>
  ),
  // Cabina telefónica pública
  'p_telpub_compet': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <rect x={cx-r*0.6} y={cy-r*0.9} width={r*1.2} height={r*1.8} />
      <line x1={cx-r*0.6} y1={cy-r*0.5} x2={cx+r*0.6} y2={cy-r*0.5} />
      <circle cx={cx} cy={cy+r*0.2} r={r*0.2} />
      <line x1={cx} y1={cy-r*0.5} x2={cx} y2={cy-r*0.85} strokeWidth={0.6} />
    </g>
  ),
  // Caseta Ladafon
  'p_caseta_ladafon': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <rect x={cx-r*0.65} y={cy-r*0.85} width={r*1.3} height={r*1.7} />
      <line x1={cx-r*0.65} y1={cy-r*0.45} x2={cx+r*0.65} y2={cy-r*0.45} />
      <text x={cx} y={cy+r*0.5} textAnchor="middle" fontSize={r*0.65}
        fill="#444" fontFamily="monospace" fontWeight="bold" stroke="none">LF</text>
    </g>
  ),
  // Caseta Ladatel
  'p_caseta_ladatel': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <rect x={cx-r*0.65} y={cy-r*0.85} width={r*1.3} height={r*1.7} />
      <line x1={cx-r*0.65} y1={cy-r*0.45} x2={cx+r*0.65} y2={cy-r*0.45} />
      <text x={cx} y={cy+r*0.5} textAnchor="middle" fontSize={r*0.65}
        fill="#444" fontFamily="monospace" fontWeight="bold" stroke="none">LT</text>
    </g>
  ),
  // Documento / solicitud
  'p_solicitud': (cx, cy, r) => (
    <g stroke="#444" fill="none" strokeWidth={0.8}>
      <path d={`M${cx-r*0.6},${cy-r*0.9} L${cx+r*0.3},${cy-r*0.9} L${cx+r*0.6},${cy-r*0.6} L${cx+r*0.6},${cy+r*0.9} L${cx-r*0.6},${cy+r*0.9} Z`} />
      <polyline points={`${cx+r*0.3},${cy-r*0.9} ${cx+r*0.3},${cy-r*0.6} ${cx+r*0.6},${cy-r*0.6}`} />
      {([-0.25, 0.1, 0.45] as number[]).map(dy => (
        <line key={dy} x1={cx-r*0.38} y1={cy+r*dy} x2={cx+r*0.38} y2={cy+r*dy} strokeWidth={0.6} />
      ))}
    </g>
  ),
};

// =============================================================================
// MOCK GIS SERVICE — reemplaza gis_program_manager.cached_dataset(:gis)
// =============================================================================

const MOCK_DB: Record<number, BuildingInventory> = {
  101: { linea_comp_cu: '12', linea_comp_inal: '5',  linea_inal: '3',  tel_pub_comp: '2', linea_lf: '8',  linea_pslt: '6'  },
  202: { linea_comp_cu: '0',  linea_comp_inal: '1',  linea_inal: '0',  tel_pub_comp: '0', linea_lf: '2',  linea_pslt: '0'  },
  303: { linea_comp_cu: '47', linea_comp_inal: '12', linea_inal: '9',  tel_pub_comp: '5', linea_lf: '15', linea_pslt: '11' },
};

export const mockGisServiceTelmex: IGisDataService = {
  fetchBuildingInventory: async (id) => {
    await new Promise(r => setTimeout(r, 400));  // simula latencia BD
    return MOCK_DB[id] ?? null;
  },
};

// =============================================================================
// CLASE — c_sello_competencia_telmex
// =============================================================================

export class SelloCompetenciaTelmex extends CBaseSelloFibra {

  // Magik: defined_attributes() — 11 atributos del sello
  static readonly DEFINED_ATTRIBUTES = [
    { nombre: 'pred_deshabitado',  descripcion: 'Predio Deshabitado',           tipo: 'string'  },
    { nombre: 'tv_satelital',      descripcion: 'Television Satelital',          tipo: 'string'  },
    { nombre: 'tv_cable',          descripcion: 'Television por Cable',           tipo: 'string'  },
    { nombre: 'operteles',         descripcion: 'Operteles',                      tipo: 'string'  },
    { nombre: 'operteles_inalam',  descripcion: 'Operteles inalambrico',          tipo: 'string'  },
    { nombre: 'telmex_inalam',     descripcion: 'Telmex Inalambrico',             tipo: 'string'  },
    { nombre: 'tel_pub_compet',    descripcion: 'Telefonia Publica Competencia',  tipo: 'string'  },
    { nombre: 'caseta_ladafon',    descripcion: 'Caseta Ladafon',                 tipo: 'string'  },
    { nombre: 'caseta_ladatel',    descripcion: 'Caseta LadaTel',                 tipo: 'string'  },
    { nombre: 'solicitud',         descripcion: 'Solicitud.',                     tipo: 'string'  },
    { nombre: 'idEdificio',        descripcion: 'id del edificio',                tipo: 'integer' },
  ];

  // Slots del sello — Magik: layout_attribute_definition → defaults a ""
  atributos: AtributosSello = {
    predDeshabitado: '',
    tvSatelital    : '',
    tvCable        : '',
    operteles      : '',
    opertelesInalam: '',
    telmexInalam   : '',
    telPubCompet   : '',
    casetaLadafon  : '',
    casetaLadatel  : '',
    solicitud      : '',
    idEdificio     : null,
  };

  // Per-cell text map — override necesario; CBaseSelloFibra solo guarda 1 texto/tabla
  private cellTexts: Map<string, Map<CellKey, CeldaTexto>> = new Map();
  // Per-cell symbol map
  private cellSymbols: Map<string, Map<CellKey, CeldaSimbolo>> = new Map();

  protected override asignarTextoCelda(
    tablaId: string, fila: number, col: number,
    texto: string, tamanio: number,
    alineacion: CeldaTexto['alineacion'], rotacion: number, color: ColorMagik,
  ): void {
    if (!this.cellTexts.has(tablaId)) this.cellTexts.set(tablaId, new Map());
    this.cellTexts.get(tablaId)!.set(`${fila}-${col}` as CellKey, { texto, tamanio, alineacion, rotacion, color });
  }

  protected override asignarSimboloCelda(
    tablaId: string, fila: number, col: number,
    nombre: string, tamanio: number,
  ): void {
    if (!this.cellSymbols.has(tablaId)) this.cellSymbols.set(tablaId, new Map());
    this.cellSymbols.get(tablaId)!.set(`${fila}-${col}` as CellKey, { nombre, tamanio });
  }

  getCeldaTexto(tablaId: string, fila: number, col: number): CeldaTexto | undefined {
    return this.cellTexts.get(tablaId)?.get(`${fila}-${col}` as CellKey);
  }

  getCeldaSimbolo(tablaId: string, fila: number, col: number): CeldaSimbolo | undefined {
    return this.cellSymbols.get(tablaId)?.get(`${fila}-${col}` as CellKey);
  }

  // ---------------------------------------------------------------------------
  // configura_tabla()
  //
  // Magik:
  //   LoTblContenido << property_list(:ren,{6×10}, :col,{10,27,7})
  //   LoTbl << .o_tablas.crea_tabla(10,3,:tbl_contenido)
  //   LoTbl.ocoordenada_origen << .o_coord_inicio
  //   _self.asigna_medidas_tabla(LoTbl, LoTblContenido)
  //   oculta_bordes_celdas → sin bordes interiores (tabla "abierta")
  // ---------------------------------------------------------------------------
  configurarTabla(): void {
    const tbl = this.crearTabla(10, 3, 'tbl_contenido');
    tbl.origen = { ...this.oCoordInicio };
    this.asignarMedidasTabla(tbl, { renglones: CONT_H, columnas: TABLE_W });
    // oculta_bordes_celdas:
    //   :borde_der col1 + :borde_der_izq col2 → no separadores verticales internos
    //   :borde_inf filas 1-9 → no líneas horizontales internas
    // En SVG: tabla abierta, solo borde exterior + separador antes de col3
  }

  // ---------------------------------------------------------------------------
  // etiqueta_celdas()
  //
  // Magik: asigna_simbolo_celda + asigna_texto_celda por cada fila
  // ---------------------------------------------------------------------------
  etiquetarCeldas(): void {
    FILAS.forEach((fila, i) => {
      const row = i + 1;
      this.asignarSimboloCelda('tbl_contenido', row, 1, fila.simbolo, 1);
      this.asignarTextoCelda('tbl_contenido', row, 2, fila.descripcion, 20, 'centre_centre', 0, fila.color);
      const val = this.atributos[fila.atributo];
      this.asignarTextoCelda('tbl_contenido', row, 3, String(val ?? ''), 20, 'centre_centre', 0, [0,0,0]);
    });
  }

  // ---------------------------------------------------------------------------
  // llena_datos_celdas()  — async (Magik: síncrono, accede a BD GIS)
  //
  // Magik:
  //   LcollTabUserBuilding << gis_program_manager.cached_dataset(:gis).collections[:user!_building]
  //   _if _self.idEdificio _isnt _unset _then
  //     LoUserBuilding << LcollTabUserBuilding.at(_self.idEdificio)
  //     _if LoUserBuilding _isnt _unset _then
  //       LcollInventDet << LoUserBuilding.obtener_inventario_detallado()
  //       _self.operteles      << LcollInventDet[:user!_linea_comp_cu].write_string
  //       ...
  //     _endif
  //   _endif
  //   _self.asigna_texto_celda(:tbl_contenido, ...) — actualiza col 3
  //
  // Campos NO cargados (comentados en original):
  //   pred_deshabitado, tv_satelital, tv_cable, solicitud
  // ---------------------------------------------------------------------------
  async llena_datos_celdas(service: IGisDataService): Promise<void> {
    if (this.atributos.idEdificio === null) return;

    const inv = await service.fetchBuildingInventory(this.atributos.idEdificio);
    if (!inv) return;

    // Magik: _self.operteles << LcollInventDet[:user!_linea_comp_cu].write_string
    this.atributos.operteles        = inv.linea_comp_cu;
    this.atributos.opertelesInalam  = inv.linea_comp_inal;
    this.atributos.telmexInalam     = inv.linea_inal;
    this.atributos.telPubCompet     = inv.tel_pub_comp;
    this.atributos.casetaLadafon    = inv.linea_lf;
    this.atributos.casetaLadatel    = inv.linea_pslt;
    // pred_deshabitado, tv_satelital, tv_cable, solicitud → comentados en original

    // Magik: actualiza col 3 con valores obtenidos
    this.etiquetarCeldas();
  }
}

// =============================================================================
// COMPONENTE REACT — demo del sello de competencia Telmex
// =============================================================================

const SCALE = 4; // SVG px por unidad Magik

export function SelloCompetenciaTelmexUI() {
  const [idStr,    setIdStr   ] = useState('101');
  const [loading,  setLoading ] = useState(false);
  const [error,    setError   ] = useState<string | null>(null);
  const [attrs,    setAttrs   ] = useState<AtributosSello>({
    predDeshabitado: '', tvSatelital: '', tvCable: '',
    operteles: '', opertelesInalam: '', telmexInalam: '',
    telPubCompet: '', casetaLadafon: '', casetaLadatel: '',
    solicitud: '', idEdificio: null,
  });

  const handleCargar = async () => {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) { setError('ID no válido'); return; }
    setLoading(true); setError(null);

    const sello = new SelloCompetenciaTelmex();
    sello.atributos = { ...attrs, idEdificio: id };
    await sello.llena_datos_celdas(mockGisServiceTelmex);
    setAttrs({ ...sello.atributos });
    setLoading(false);

    if (Object.values(sello.atributos).every(v => v === '' || v === null)) {
      setError(`Edificio ${id} no encontrado en BD mock. Prueba: 101, 202, 303`);
    }
  };

  // Instanciar con atributos actuales para renderizar
  const sello = new SelloCompetenciaTelmex();
  sello.atributos = { ...attrs };
  sello.configurarTabla();
  sello.etiquetarCeldas();

  const rowH  = CONT_ROWS[0] * SCALE;              // 24px
  const col1W = CONT_COLS[0] * SCALE;              // 40px
  const col2W = CONT_COLS[1] * SCALE;              // 108px
  const col3W = CONT_COLS[2] * SCALE;              // 28px
  const svgW  = TABLE_W * SCALE;                   // 176px
  const svgH  = CONT_H  * SCALE;                   // 240px
  const iconR = rowH * 0.36;                        // radio base del icono ≈ 8.6px

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_sello_competencia_telmex</h3>
      <p style={s.meta}>
        Cuadro de competencia telefónica — 10 filas × 3 cols ({'{'}10,27,7{'}'} u.).
        Tabla abierta: sin líneas internas (<code>oculta_bordes_celdas</code>).
      </p>

      {/* ── Controles ── */}
      <div style={s.control}>
        <label style={s.lbl}>
          id Edificio:
          <input
            type="number" value={idStr}
            onChange={e => setIdStr(e.target.value)}
            style={s.numInput}
            placeholder="101"
          />
        </label>
        <button onClick={handleCargar} disabled={loading} style={s.btn}>
          {loading ? 'Cargando…' : 'Cargar datos (llena_datos_celdas)'}
        </button>
        <span style={s.hint}>IDs disponibles: 101 · 202 · 303</span>
        {error && <span style={{ ...s.hint, color: '#c62828' }}>{error}</span>}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8, alignItems: 'flex-start' }}>

        {/* ── SVG de la tabla ── */}
        <div>
          <svg
            width={svgW + 2} height={svgH + 2}
            style={{ border: '1px solid #bbb', background: '#fff', borderRadius: 2 }}
          >
            {/* Fondo alterno de filas */}
            {FILAS.map((_, ri) => (
              <rect key={`bg-${ri}`}
                x={0} y={ri * rowH} width={svgW} height={rowH}
                fill={ri % 2 === 0 ? '#fafafa' : '#fff'}
              />
            ))}

            {/* Borde exterior — resultado de oculta_bordes_celdas (solo exterior visible) */}
            <rect x={0} y={0} width={svgW} height={svgH}
              fill="none" stroke="#455a64" strokeWidth={1.2} />

            {/* Separador antes de col3 (col2 borde_der_izq → sin borde; col3 aparece separada) */}
            <line x1={col1W + col2W} y1={0} x2={col1W + col2W} y2={svgH}
              stroke="#90a4ae" strokeWidth={0.6} />

            {/* Contenido por fila */}
            {FILAS.map((fila, ri) => {
              const rowY  = ri * rowH;
              const icoCx = col1W / 2;
              const icoCy = rowY + rowH / 2;
              const txtCy = rowY + rowH / 2;
              const col   = sello.getCeldaTexto('tbl_contenido', ri + 1, 2);
              const cnt   = sello.getCeldaTexto('tbl_contenido', ri + 1, 3);
              const color = col ? magikColor(col.color) : '#000';
              const icono = ICONOS[fila.simbolo];

              return (
                <g key={fila.simbolo}>
                  {/* Col 1 — icono SVG (p_xxx) */}
                  {icono?.(icoCx, icoCy, iconR)}

                  {/* Col 2 — descripción con color */}
                  <text
                    x={col1W + col2W / 2} y={txtCy}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(7, rowH * 0.42)}
                    fill={color} fontFamily="sans-serif" fontWeight="bold"
                  >
                    {col?.texto ?? fila.descripcion}
                  </text>

                  {/* Col 3 — contador */}
                  <text
                    x={col1W + col2W + col3W / 2} y={txtCy}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={Math.max(7, rowH * 0.42)}
                    fill="#000" fontFamily="monospace"
                  >
                    {cnt?.texto ?? ''}
                  </text>
                </g>
              );
            })}
          </svg>
          <small style={{ ...s.meta, display: 'block', marginTop: 2 }}>
            SVG {svgW}×{svgH}px · escala {SCALE}px/u ·
            cols {col1W}+{col2W}+{col3W}px
          </small>
        </div>

        {/* ── Tabla de atributos ── */}
        <div>
          <table style={s.table}>
            <thead>
              <tr>
                {['Atributo Magik', 'Descripción', 'Valor actual', 'Fuente BD'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS.map(({ atributo, descripcion }, i) => {
                const magikNombre = SelloCompetenciaTelmex.DEFINED_ATTRIBUTES[i]?.nombre ?? atributo;
                const val = attrs[atributo] ?? '';
                const fuente = ['operteles','opertelesInalam','telmexInalam','telPubCompet','casetaLadafon','casetaLadatel'].includes(atributo)
                  ? 'obtener_inventario_detallado()'
                  : '— comentado en original';
                return (
                  <tr key={atributo} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#fff' }}>
                    <td style={{ ...s.td, fontFamily: 'monospace' }}><code>:{magikNombre}</code></td>
                    <td style={{ ...s.td, fontSize: 11, color: '#555' }}>{descripcion}</td>
                    <td style={{ ...s.td, fontWeight: 'bold', minWidth: 40 }}>{val || <span style={{ color: '#bbb' }}>""</span>}</td>
                    <td style={{ ...s.td, fontSize: 10, color: '#888' }}>{fuente}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f0f4f8' }}>
                <td style={{ ...s.td, fontFamily: 'monospace' }}><code>:idEdificio</code></td>
                <td style={{ ...s.td, fontSize: 11, color: '#555' }}>id del edificio</td>
                <td style={{ ...s.td, fontWeight: 'bold' }}>{attrs.idEdificio ?? <span style={{ color: '#bbb' }}>_unset</span>}</td>
                <td style={{ ...s.td, fontSize: 10, color: '#888' }}>user!_building.at(id)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ ...s.meta, marginTop: 8 }}>
        Colores Magik: negro <code>&#123;0,0,0&#125;</code> · azul oscuro <code>&#123;0.05981,0.05981,0.4090&#125;</code>
        → <span style={{ background: 'rgb(15,15,104)', color: '#fff', padding: '0 4px', borderRadius: 2, fontSize: 11 }}>rgb(15,15,104)</span> ·
        azul puro <code>&#123;0,0,1&#125;</code> ·
        verde <code>&#123;0,0.2953,0&#125;</code>
        → <span style={{ background: 'rgb(0,75,0)', color: '#fff', padding: '0 4px', borderRadius: 2, fontSize: 11 }}>rgb(0,75,0)</span>.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame   : { display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif', fontSize: 13 },
  title   : { margin: '0 0 4px', fontSize: 14, fontWeight: 'bold' },
  meta    : { color: '#666', fontSize: 12, margin: '2px 0' },
  control : { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0f4f8', borderRadius: 4, border: '1px solid #dde', flexWrap: 'wrap' },
  lbl     : { fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
  numInput: { width: 65, padding: '2px 4px', fontSize: 11, border: '1px solid #b0bec5', borderRadius: 2 },
  btn     : { padding: '4px 12px', fontSize: 11, borderRadius: 3, border: '1px solid #1565c0', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  hint    : { fontSize: 11, color: '#666', fontStyle: 'italic' },
  table   : { borderCollapse: 'collapse' },
  th      : { background: '#2E4057', color: '#fff', padding: '5px 10px', textAlign: 'left', fontSize: 11 },
  td      : { padding: '5px 10px', borderBottom: '1px solid #eee', fontSize: 11 },
};

export default SelloCompetenciaTelmexUI;
