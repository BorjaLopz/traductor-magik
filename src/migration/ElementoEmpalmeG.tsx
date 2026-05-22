/**
 * Migración de: c_elemento_empalme_g.magik
 * Clase Magik:  c_elemento_empalme_g  —  SIGC11 / dsanchez / 2005
 * Hereda de:    c_elemento_entidad_g
 *
 * Elemento gráfico de diagrama (croquis) que representa un empalme de cobre.
 * NO es un objeto de mapa — vive en un viewport de layout (impresión/croquis).
 * Equivale a un componente SVG posicionado dentro de un bounding box.
 *
 * Layout interno: el área se divide en 20 filas.
 *   - Etiqueta_1 ("ER-NNN") → posición calculada desde collEtiquetas[14]
 *   - Simbolo_1  (línea + rombo) → ocupa filas centrales (1..19 de 20)
 */

import React from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: entidad GIS con slot user!_num_empalme */
export interface EntidadEmpalme {
  numEmpalme: number | string;   // user!_num_empalme
}

/** Magik: c_texto_grafico — etiqueta de texto dentro del elemento */
export interface TextoGrafico {
  texto     : string;
  tamanio   : number;              // nTamanio (unidades de diagrama)
  alineacion: 'centre_centre' | 'left_centre' | 'right_centre';
  nMargenSup: number;              // en unidades de fila
  nMargenInf: number;
}

/** Magik: c_simbolo_grafico — símbolo visual del elemento */
export interface SimboloGrafico {
  nombre: string;                  // sNombre_Simbolo
}

/** Magik: colección oElementos — elementos internos del componente gráfico */
export interface ElementosGraficos {
  Etiqueta_1: TextoGrafico;
  Simbolo_1 : SimboloGrafico;
}

/**
 * Config base: slots de c_elemento_entidad_g que este hijo inicializa.
 * Magik: sNombre_Simbolo, sDescripcion, nLong_Grafica
 */
export interface ConfigElementoBase {
  sNombreSimbol: string;
  sDescripcion : string;
  nLongGrafica : number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const N_RENGLONES = 20;            // Magik: LnNumRenDiv = 20

// posición de Etiqueta_1 en collEtiquetas → base para cálculo de márgenes
// Magik: _self.collEtiquetas[:Etiqueta_1] << 14
const POS_ETIQUETA_1 = 14;

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ElementoEmpalmeG {

  // Slots propios (del padre c_elemento_entidad_g)
  sNombreSimbol: string = '';
  sDescripcion : string = '';
  nLongGrafica : number = 0;

  // Colección de elementos gráficos internos
  // Magik: _self.oElementos
  oElementos: Partial<ElementosGraficos> = {};

  // Bounding box del elemento (en unidades de diagrama)
  // Magik: _self.oArea → {xMin, xMax, yMin, yMax}
  oArea = { xMin: 0, xMax: 20, yMin: 0, yMax: 20 };

  // ---------------------------------------------------------------------------
  // new(RoObjeto)
  // Magik:
  //   _super.new(RoObjeto)
  //   _self.sNombre_Simbolo << "empalme de cobre"
  //   _self.sDescripcion    << "ER-" + _self.oEntidad.user!_num_empalme.write_string
  //   _self.nLong_Grafica   << 20
  //   _return _clone
  // ---------------------------------------------------------------------------
  constructor(entidad: EntidadEmpalme) {
    this.sNombreSimbol = 'empalme de cobre';                     // sNombre_Simbolo
    this.sDescripcion  = `ER-${entidad.numEmpalme}`;             // "ER-" + num_empalme.write_string
    this.nLongGrafica  = 20;                                     // nLong_Grafica << 20
  }

  // ---------------------------------------------------------------------------
  // Crea_elementos_internos()  [private]
  // Magik:
  //   LoLbl1 << c_texto_grafico.new("ER")
  //   LoLbl1.nTamanio << 25
  //   LoLbl1.sAlineacion << :centre_centre
  //   _self.collEtiquetas[:Etiqueta_1] << 14
  //   _self.oElementos.Agregar_elemento(LoLbl1, :Etiqueta_1)
  //
  //   LoSim << c_simbolo_grafico.new(_self.sNombre_Simbolo)
  //   _self.oElementos.Agregar_elemento(LoSim, :Simbolo_1)
  // ---------------------------------------------------------------------------
  private creaElementosInternos(): void {
    const etiqueta1: TextoGrafico = {
      texto     : 'ER',
      tamanio   : 25,
      alineacion: 'centre_centre',
      nMargenSup: 0,
      nMargenInf: 0,
    };

    const simbolo1: SimboloGrafico = {
      nombre: this.sNombreSimbol,               // "empalme de cobre"
    };

    this.oElementos = {
      Etiqueta_1: etiqueta1,
      Simbolo_1 : simbolo1,
    };
  }

  // ---------------------------------------------------------------------------
  // dfn_ubicacion_elementos_internos()
  // Magik:
  //   LnNumRenDiv = 20
  //   LnAltEnMM   = oArea.YMax - oArea.YMin
  //   LnAltRen    = LnAltEnMM / 20
  //
  //   -- Etiqueta 1 --
  //   LnNumRenSup = pos_etiqueta(:Etiqueta_1)   → 14
  //   LnNumRenInf = 20 - 2 - 14                → 4
  //   nMargenSup  = LnAltRen * (14/10)
  //   nMargenInf  = LnAltRen * (4/10)
  //
  //   -- Simbolo 1 --
  //   LnNumRenSup = 5 - 4  → 1
  //   LnNumRenInf = 15 + 4 → 19
  // ---------------------------------------------------------------------------
  private dfnUbicacionElementosInternos(): void {
    const altEnMM = this.oArea.yMax - this.oArea.yMin;           // YMax - YMin
    const altRen  = altEnMM / N_RENGLONES;                       // altura de 1 fila

    // -- Etiqueta 1 --
    const nRenSupLbl = POS_ETIQUETA_1;                           // pos_etiqueta(:Etiqueta_1)
    const nRenInfLbl = N_RENGLONES - 2 - POS_ETIQUETA_1;        // 20 - 2 - 14 = 4

    if (this.oElementos.Etiqueta_1) {
      this.oElementos.Etiqueta_1.nMargenSup = altRen * (nRenSupLbl / 10);
      this.oElementos.Etiqueta_1.nMargenInf = altRen * (nRenInfLbl / 10);
    }

    // -- Simbolo 1 --
    // Magik: LnNumRenSup = 5-4=1, LnNumRenInf = 15+4=19
    // (márgenes del símbolo no se asignan en el Magik original — método incompleto)
    // Los valores quedan calculados pero el Magik no hace .nMargenSup = ... para el símbolo
  }

  // ---------------------------------------------------------------------------
  // configurar_elementos()
  // Magik:
  //   _self.Crea_elementos_internos()
  //   LoLbl << _self.oElementos.obten_elemento(:Etiqueta_1)
  //   LoLbl.sTexto << _self.sDescripcion
  // ---------------------------------------------------------------------------
  configurarElementos(): void {
    this.creaElementosInternos();                                // Crea_elementos_internos()
    this.dfnUbicacionElementosInternos();                       // layout de posiciones

    // obten_elemento(:Etiqueta_1) → actualiza texto con la descripción real
    if (this.oElementos.Etiqueta_1) {
      this.oElementos.Etiqueta_1.texto = this.sDescripcion;     // sTexto << sDescripcion
    }
  }

  // Acceso de lectura a elementos (Magik: oElementos.obten_elemento)
  getElemento<K extends keyof ElementosGraficos>(key: K): ElementosGraficos[K] | undefined {
    return this.oElementos[key] as ElementosGraficos[K] | undefined;
  }
}

// =============================================================================
// COMPONENTE REACT  —  renderiza el elemento de diagrama en SVG
// Equivale a activate_in / despliega en el viewport de layout
// =============================================================================

interface Props {
  entidad   : EntidadEmpalme;
  width    ?: number;    // ancho del bounding box en px (Magik: oArea.XMax - oArea.XMin)
  height   ?: number;    // alto  del bounding box en px (Magik: oArea.YMax - oArea.YMin)
}

export function ElementoEmpalmeGUI({ entidad, width = 80, height = 80 }: Props) {
  const elem = new ElementoEmpalmeG(entidad);
  elem.oArea = { xMin: 0, xMax: width, yMin: 0, yMax: height };
  elem.configurarElementos();

  const lbl = elem.getElemento('Etiqueta_1');

  // Layout: 20 filas sobre la altura total
  const rowH      = height / N_RENGLONES;
  const margenSup = lbl?.nMargenSup ?? 0;
  const margenInf = lbl?.nMargenInf ?? 0;

  // Área del símbolo: filas 1..19 → top: rowH*1, bottom: rowH*19
  const simTop    = rowH * 1;
  const simBottom = rowH * 19;
  const simMidY   = (simTop + simBottom) / 2;
  const cx        = width / 2;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: '1px solid #ccc', borderRadius: 3, background: '#fff' }}
      aria-label={`Empalme ${elem.sDescripcion}`}
    >
      {/* ── Simbolo_1: "empalme de cobre"
           Magik: c_simbolo_grafico.new("empalme de cobre")
           Representación: línea horizontal + rombo central */}
      <line
        x1={4}        y1={simMidY}
        x2={width - 4} y2={simMidY}
        stroke="#555" strokeWidth={1.5}
      />
      {/* Rombo (símbolo estándar de empalme en planos de telecomunicaciones) */}
      <polygon
        points={`${cx},${simMidY - 6} ${cx + 8},${simMidY} ${cx},${simMidY + 6} ${cx - 8},${simMidY}`}
        fill="#e8e8e8" stroke="#555" strokeWidth={1}
      />

      {/* ── Etiqueta_1: texto descriptivo
           Magik: c_texto_grafico, nTamanio=25, sAlineacion=:centre_centre
           Posición: margenSup calculado desde pos_etiqueta(14) */}
      <text
        x={cx}
        y={margenSup + rowH}          /* top del área de etiqueta */
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(lbl?.tamanio ?? 25, 11)}
        fill="#222"
        fontFamily="sans-serif"
      >
        {lbl?.texto ?? elem.sDescripcion}
      </text>
    </svg>
  );
}

export default ElementoEmpalmeGUI;
