/**
 * Migración de: c_elemento_nodo_g.magik
 * Clase Magik:  c_elemento_nodo_g  —  SIGC11 / dsanchez / 2005
 * Hereda de:    c_elemento_entidad_g
 *
 * Elemento gráfico de diagrama (croquis) que representa un nodo de red óptica
 * (EDFA — Erbium Doped Fiber Amplifier u otro tipo de nodo).
 *
 * A diferencia de empalme (1 etiqueta) y sección (1 etiqueta), este elemento
 * tiene 3 zonas verticales:
 *   Etiqueta_1 (pos=1,  arriba):  nombre del nodo  — user!_nom_nodo
 *   Etiqueta_2 (pos=9,  centro):  "D.O."           — texto fijo
 *   Etiqueta_3 (pos=17, abajo):   tipo de nodo     — user!_tipo
 *   Simbolo_1:                    símbolo "edfa"   — zona central
 *
 * Layout: bounding box dividido en 20 filas, igual que empalme y sección.
 */

import React from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Magik: entidad GIS con slots user!_nom_nodo y user!_tipo */
export interface EntidadNodo {
  nomNodo: string;   // user!_nom_nodo.write_string
  tipo   : string;   // user!_tipo.write_string
}

export interface TextoGrafico {
  texto     : string;
  tamanio   : number;
  alineacion: 'centre_left' | 'centre_centre' | 'right_centre';
  nMargenSup: number;
  nMargenInf: number;
}

export interface SimboloGrafico {
  nombre: string;
}

export interface ElementosGraficos {
  Etiqueta_1: TextoGrafico;
  Etiqueta_2: TextoGrafico;
  Etiqueta_3: TextoGrafico;
  Simbolo_1 : SimboloGrafico;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const N_RENGLONES = 20;

// Posiciones en collEtiquetas (base para cálculo de márgenes)
// Magik: _self.collEtiquetas[:Etiqueta_N] << POS
const POS: Record<'Etiqueta_1' | 'Etiqueta_2' | 'Etiqueta_3', number> = {
  Etiqueta_1: 1,
  Etiqueta_2: 9,
  Etiqueta_3: 17,
};

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ElementoNodoG {

  sNombreSimbol: string = '';
  sDescripcion : string = '';
  nLongGrafica : number = 0;

  oElementos: Partial<ElementosGraficos> = {};
  oArea = { xMin: 0, xMax: 100, yMin: 0, yMax: 60 };

  // ---------------------------------------------------------------------------
  // new(RoObjeto)
  // Magik:
  //   _super.new(RoObjeto)
  //   _self.sNombre_simbolo << "edfa"
  //   _self.sDescripcion    << _self.oEntidad.user!_tipo.write_string
  //   _self.nLong_Grafica   << 100
  // ---------------------------------------------------------------------------
  constructor(entidad: EntidadNodo) {
    this.sNombreSimbol = 'edfa';
    this.sDescripcion  = entidad.tipo;                 // user!_tipo.write_string
    this.nLongGrafica  = 100;
  }

  // ---------------------------------------------------------------------------
  // prvCrea_elementos_internos()  [private]
  // Magik:
  //   Etiqueta_1: c_texto_grafico.new("Nom nodo"), nTamanio=30, :centre_left, pos=1
  //   Etiqueta_2: c_texto_grafico.new("D. O."),    nTamanio=35,               pos=9
  //   Etiqueta_3: c_texto_grafico.new("ET"),       nTamanio=35, :centre_left, pos=17
  //   Simbolo_1:  c_simbolo_grafico.new("edfa")
  // ---------------------------------------------------------------------------
  private prvCreaElementosInternos(): void {
    this.oElementos = {
      Etiqueta_1: {
        texto     : 'Nom nodo',
        tamanio   : 30,
        alineacion: 'centre_left',
        nMargenSup: 0,
        nMargenInf: 0,
      },
      Etiqueta_2: {
        texto     : 'D. O.',
        tamanio   : 35,
        alineacion: 'centre_centre',
        nMargenSup: 0,
        nMargenInf: 0,
      },
      Etiqueta_3: {
        texto     : 'ET',
        tamanio   : 35,
        alineacion: 'centre_left',
        nMargenSup: 0,
        nMargenInf: 0,
      },
      Simbolo_1: {
        nombre: this.sNombreSimbol,   // "edfa"
      },
    };
  }

  // ---------------------------------------------------------------------------
  // dfn_ubicacion_elementos_internos()
  // Fórmula idéntica para las 3 etiquetas:
  //   nRenSup = pos_etiqueta(:EtiquetaN)
  //   nRenInf = 20 - 2 - pos_etiqueta(:EtiquetaN)
  //   altRen  = (yMax - yMin) / 20
  //   nMargenSup = altRen * (nRenSup / 10)
  //   nMargenInf = altRen * (nRenInf / 10)
  //
  // Resultados numéricos con las posiciones del fuente:
  //   Etiqueta_1 (pos=1):  sup=0.1·altRen  inf=1.7·altRen
  //   Etiqueta_2 (pos=9):  sup=0.9·altRen  inf=0.9·altRen
  //   Etiqueta_3 (pos=17): sup=1.7·altRen  inf=0.1·altRen
  //
  // Simbolo_1: LnNumRenSup=1, LnNumRenInf=19 (calculado pero sin asignar en Magik)
  // ---------------------------------------------------------------------------
  private dfnUbicacionElementosInternos(): void {
    const altEnMM = this.oArea.yMax - this.oArea.yMin;
    const altRen  = altEnMM / N_RENGLONES;

    const calcMargenes = (pos: number) => ({
      nMargenSup: altRen * (pos / 10),
      nMargenInf: altRen * ((N_RENGLONES - 2 - pos) / 10),
    });

    if (this.oElementos.Etiqueta_1) {
      Object.assign(this.oElementos.Etiqueta_1, calcMargenes(POS.Etiqueta_1));
    }
    if (this.oElementos.Etiqueta_2) {
      Object.assign(this.oElementos.Etiqueta_2, calcMargenes(POS.Etiqueta_2));
    }
    if (this.oElementos.Etiqueta_3) {
      Object.assign(this.oElementos.Etiqueta_3, calcMargenes(POS.Etiqueta_3));
    }
    // Simbolo_1: LnNumRenSup=5-4=1, LnNumRenInf=15+4=19 — calculado, no asignado (igual que empalme)
  }

  // ---------------------------------------------------------------------------
  // configurar_elementos()
  // Magik:
  //   _self.prvCrea_elementos_internos()
  //   oElementos.obten_elemento(:Etiqueta_1).sTexto << oEntidad.user!_nom_nodo
  //   oElementos.obten_elemento(:Etiqueta_3).sTexto << sDescripcion
  //
  // Etiqueta_2 ("D. O.") NO se actualiza → texto fijo del diseño del plano.
  // ---------------------------------------------------------------------------
  configurarElementos(entidad: EntidadNodo): void {
    this.prvCreaElementosInternos();
    this.dfnUbicacionElementosInternos();

    if (this.oElementos.Etiqueta_1) {
      this.oElementos.Etiqueta_1.texto = entidad.nomNodo;  // user!_nom_nodo.write_string
    }
    if (this.oElementos.Etiqueta_3) {
      this.oElementos.Etiqueta_3.texto = this.sDescripcion; // user!_tipo.write_string
    }
    // Etiqueta_2 mantiene "D. O." — texto fijo del plano, no se toca en el Magik
  }

  getElemento<K extends keyof ElementosGraficos>(key: K): ElementosGraficos[K] | undefined {
    return this.oElementos[key] as ElementosGraficos[K] | undefined;
  }
}

// =============================================================================
// COMPONENTE REACT
// Layout SVG: 3 bandas horizontales (nombre nodo | D.O. + símbolo EDFA | tipo)
// =============================================================================

interface Props {
  entidad : EntidadNodo;
  width  ?: number;
  height ?: number;
}

export function ElementoNodoGUI({ entidad, width = 160, height = 80 }: Props) {
  const elem = new ElementoNodoG(entidad);
  elem.oArea = { xMin: 0, xMax: width, yMin: 0, yMax: height };
  elem.configurarElementos(entidad);

  const lbl1 = elem.getElemento('Etiqueta_1');
  const lbl2 = elem.getElemento('Etiqueta_2');
  const lbl3 = elem.getElemento('Etiqueta_3');

  const rowH = height / N_RENGLONES;

  // Posición Y central de cada etiqueta: margenSup + media fila
  const y1 = (lbl1?.nMargenSup ?? 0) + rowH * 0.5;
  const y2 = (lbl2?.nMargenSup ?? 0) + rowH * 0.5;
  const y3 = (lbl3?.nMargenSup ?? 0) + rowH * 0.5;

  // Zona del símbolo EDFA: entre Etiqueta_1 y Etiqueta_3 (filas 3..16 aprox.)
  const simTop    = rowH * 3;
  const simBottom = rowH * 16;
  const simMidY   = (simTop + simBottom) / 2;
  const cx        = width / 2;
  const simR      = Math.min((simBottom - simTop) / 2 - 2, 12);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ border: '1px solid #aaa', borderRadius: 3, background: '#fff' }}
      aria-label={`Nodo ${entidad.nomNodo} (${entidad.tipo})`}
    >
      {/* Borde del elemento */}
      <rect x={1} y={1} width={width - 2} height={height - 2}
            fill="none" stroke="#ccc" strokeWidth={0.5} rx={2} />

      {/* ── Etiqueta_1: nombre del nodo — arriba, centre_left
           Magik: LoLbl1.sTexto << oEntidad.user!_nom_nodo */}
      <text
        x={6} y={Math.max(y1, 8)}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={Math.min((lbl1?.tamanio ?? 30) * 0.3, 9)}
        fontWeight="bold"
        fill="#222"
        fontFamily="sans-serif"
      >
        {lbl1?.texto}
      </text>

      {/* ── Simbolo_1: "edfa"
           Representación: círculo con triángulo (símbolo EDFA estándar) */}
      <circle cx={cx} cy={simMidY} r={simR}
              fill="#e8f4fd" stroke="#2E4057" strokeWidth={1.2} />
      <polygon
        points={`${cx - simR * 0.55},${simMidY - simR * 0.55}
                 ${cx - simR * 0.55},${simMidY + simR * 0.55}
                 ${cx + simR * 0.65},${simMidY}`}
        fill="#2E4057"
      />

      {/* ── Etiqueta_2: "D. O." — zona central, texto fijo
           Magik: no se actualiza en configurar_elementos → texto del diseño */}
      <text
        x={cx + simR + 4} y={Math.max(y2, simMidY)}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={Math.min((lbl2?.tamanio ?? 35) * 0.25, 8)}
        fill="#555"
        fontFamily="sans-serif"
      >
        {lbl2?.texto}
      </text>

      {/* ── Etiqueta_3: tipo de nodo — abajo, centre_left
           Magik: LoLbl.sTexto << _self.sDescripcion (user!_tipo) */}
      <text
        x={6} y={Math.min(y3, height - 5)}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={Math.min((lbl3?.tamanio ?? 35) * 0.25, 8)}
        fill="#444"
        fontFamily="sans-serif"
        fontStyle="italic"
      >
        {lbl3?.texto}
      </text>
    </svg>
  );
}

export default ElementoNodoGUI;
