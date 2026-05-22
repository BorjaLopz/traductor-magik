/**
 * Migración de: c_elemento_seccion_g.magik
 * Clase Magik:  c_elemento_seccion_g  —  SIGC11 / dsanchez / 2005
 * Hereda de:    c_elemento_entidad_g
 *
 * Elemento gráfico de diagrama (croquis) que representa una sección de fibra
 * óptica con su longitud calculada.
 * NO es un objeto de mapa — vive en un viewport de impresión/croquis.
 *
 * Diferencias respecto a c_elemento_empalme_g:
 *   - Símbolo:      "seccion" (línea simple, no rombo)
 *   - Descripción:  calculated_fiber_length con 11 dígitos de precisión
 *   - nLong_Grafica: 100 (vs 20 del empalme)
 *   - Posición etiqueta en collEtiquetas: 5 (vs 14)
 *     → nMargenSup = altRen * (5/10)
 *     → nMargenInf = altRen * (13/10)   (20 - 2 - 5 = 13)
 */

import React from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: entidad GIS con slot calculated_fiber_length */
export interface EntidadSeccion {
  calculatedFiberLength: number;   // calculated_fiber_length (metros)
}

/** Magik: c_texto_grafico */
export interface TextoGrafico {
  texto     : string;
  tamanio   : number;
  nMargenSup: number;
  nMargenInf: number;
}

/** Magik: c_simbolo_grafico */
export interface SimboloGrafico {
  nombre: string;
}

export interface ElementosGraficos {
  Etiqueta_1: TextoGrafico;
  Simbolo_1 : SimboloGrafico;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const N_RENGLONES    = 20;   // Magik: divisor fijo de 20 filas
const POS_ETIQUETA_1 = 5;    // Magik: _self.collEtiquetas[:Etiqueta_1] << 5

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ElementoSeccionG {

  sNombreSimbol: string = '';
  sDescripcion : string = '';
  nLongGrafica : number = 0;

  oElementos: Partial<ElementosGraficos> = {};
  oArea = { xMin: 0, xMax: 100, yMin: 0, yMax: 20 };

  // ---------------------------------------------------------------------------
  // new(RoObjeto)
  // Magik:
  //   _super.new(RoObjeto)
  //   _self.sNombre_Simbolo  << "seccion"
  //   !print_float_precision! << 11         ← precisión 11 dígitos
  //   _self.sDescripcion     << _self.oEntidad.calculated_fiber_length
  //                                            .as_float.write_string
  //   _self.nLong_Grafica    << 100
  // ---------------------------------------------------------------------------
  constructor(entidad: EntidadSeccion) {
    this.sNombreSimbol = 'seccion';

    // !print_float_precision! << 11 → toPrecision(11) en JS
    // as_float.write_string → convierte el número a cadena con esa precisión
    this.sDescripcion = entidad.calculatedFiberLength.toPrecision(11);

    this.nLongGrafica = 100;                                  // nLong_Grafica << 100
  }

  // ---------------------------------------------------------------------------
  // prvCrea_elementos_internos()  [private]
  // Magik:
  //   LoLbl << c_texto_grafico.new("seccion")
  //   LoLbl.nTamanio << 15
  //   _self.collEtiquetas[:Etiqueta_1] << 5
  //   _self.oElementos.Agregar_elemento(LoLbl, :Etiqueta_1)
  //
  //   LoSim << c_simbolo_grafico.new(_self.sNombre_simbolo)
  //   _self.oElementos.Agregar_elemento(LoSim, :Simbolo_1)
  // ---------------------------------------------------------------------------
  private prvCreaElementosInternos(): void {
    const etiqueta1: TextoGrafico = {
      texto     : 'seccion',   // texto inicial; se sobreescribe en configurarElementos
      tamanio   : 15,          // nTamanio << 15  (más pequeño que el empalme: 25)
      nMargenSup: 0,
      nMargenInf: 0,
    };

    const simbolo1: SimboloGrafico = {
      nombre: this.sNombreSimbol,   // "seccion"
    };

    this.oElementos = { Etiqueta_1: etiqueta1, Simbolo_1: simbolo1 };
  }

  // ---------------------------------------------------------------------------
  // dfn_ubicacion_elementos_internos()
  // Magik:
  //   LnNumRenSup = pos_etiqueta(:Etiqueta_1)       → 5
  //   LnNumRenInf = 20 - 2 - pos_etiqueta(...)      → 13
  //   LnAltEnMM   = oArea.YMax - oArea.YMin
  //   LnAltRen    = LnAltEnMM / 20
  //   nMargen_Sup = LnAltRen * (5  / 10)
  //   nMargen_Inf = LnAltRen * (13 / 10)
  // ---------------------------------------------------------------------------
  private dfnUbicacionElementosInternos(): void {
    const altEnMM    = this.oArea.yMax - this.oArea.yMin;
    const altRen     = altEnMM / N_RENGLONES;

    const nRenSupLbl = POS_ETIQUETA_1;                        // 5
    const nRenInfLbl = N_RENGLONES - 2 - POS_ETIQUETA_1;     // 20 - 2 - 5 = 13

    if (this.oElementos.Etiqueta_1) {
      this.oElementos.Etiqueta_1.nMargenSup = altRen * (nRenSupLbl / 10);
      this.oElementos.Etiqueta_1.nMargenInf = altRen * (nRenInfLbl / 10);
    }
  }

  // ---------------------------------------------------------------------------
  // configurar_elementos()
  // Magik:
  //   _self.prvCrea_elementos_internos()
  //   LoLbl << _self.oElementos.obten_elemento(:Etiqueta_1)
  //   LoLbl.sTexto << _self.sDescripcion
  // ---------------------------------------------------------------------------
  configurarElementos(): void {
    this.prvCreaElementosInternos();
    this.dfnUbicacionElementosInternos();

    if (this.oElementos.Etiqueta_1) {
      // obten_elemento(:Etiqueta_1).sTexto << sDescripcion
      this.oElementos.Etiqueta_1.texto = this.sDescripcion;
    }
  }

  getElemento<K extends keyof ElementosGraficos>(key: K): ElementosGraficos[K] | undefined {
    return this.oElementos[key] as ElementosGraficos[K] | undefined;
  }
}

// =============================================================================
// COMPONENTE REACT  —  renderiza el elemento en SVG
// Una sección se representa como línea horizontal con la longitud de fibra
// anotada encima (a diferencia del empalme que usa rombo central).
// =============================================================================

interface Props {
  entidad  : EntidadSeccion;
  width   ?: number;
  height  ?: number;
}

export function ElementoSeccionGUI({ entidad, width = 160, height = 40 }: Props) {
  const elem = new ElementoSeccionG(entidad);
  elem.oArea = { xMin: 0, xMax: width, yMin: 0, yMax: height };
  elem.configurarElementos();

  const lbl    = elem.getElemento('Etiqueta_1');
  const rowH   = height / N_RENGLONES;
  // Posición Y de la etiqueta: margenSup desde arriba
  const lblY   = (lbl?.nMargenSup ?? 0) + rowH * 0.5;
  // Línea del símbolo: centrada verticalmente en la zona inferior
  const lineY  = height * 0.72;
  const pad    = 8;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: '1px solid #ccc', borderRadius: 3, background: '#fff' }}
      aria-label={`Sección fibra ${elem.sDescripcion} m`}
    >
      {/* ── Simbolo_1: "seccion"
           Magik: c_simbolo_grafico.new("seccion")
           Representación: línea horizontal con terminadores verticales */}
      <line
        x1={pad}        y1={lineY}
        x2={width - pad} y2={lineY}
        stroke="#333" strokeWidth={2}
      />
      {/* Terminadores izquierdo y derecho */}
      <line x1={pad}         y1={lineY - 5} x2={pad}         y2={lineY + 5} stroke="#333" strokeWidth={1.5} />
      <line x1={width - pad} y1={lineY - 5} x2={width - pad} y2={lineY + 5} stroke="#333" strokeWidth={1.5} />

      {/* ── Etiqueta_1: longitud de fibra calculada
           Magik: c_texto_grafico, nTamanio=15, texto=sDescripcion
           Posición: nMargenSup calculado desde collEtiquetas[5] */}
      <text
        x={width / 2}
        y={Math.max(lblY, 10)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(lbl?.tamanio ?? 15, 10)}
        fill="#222"
        fontFamily="monospace"
      >
        {lbl?.texto ?? elem.sDescripcion} m
      </text>
    </svg>
  );
}

export default ElementoSeccionGUI;
