/**
 * Migracion de: c_elemento_empalme_subterraneo_g.magik
 * Clase Magik:  c_elemento_empalme_subterraneo_g
 * Metodos:      new, prvGenera_Nombre_Empalme, dfn_ubicacion_elementos_internos,
 *               Crea_elementos_internos, reposicionar_Area
 *
 * Intencion:
 *   Configurar un empalme subterraneo y calcular su nombre y layout interno.
 */

import React, { useEffect, useMemo, useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface EmpalmeEntidad {
  numEmpalme: number | string;
  tipoEmp: string;
}

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface InternalLayout {
  etiqueta: {
    margenSup: number;
    margenInf: number;
    texto: string;
  };
  simbolo: {
    margenSup: number;
    margenInf: number;
    margenIzq: number;
    margenDer: number;
    nombre: string;
  };
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ElementoEmpalmeSubterraneoG {
  sNombreSimbolo: string = 'empalme_subterraneo';
  sDescripcion: string = '';
  nLongGrafica: number = 100;
  oEntidad: EmpalmeEntidad;
  oArea: Bounds;

  constructor(entidad: EmpalmeEntidad, area: Bounds) {
    this.oEntidad = entidad;
    this.oArea = area;
    this.sDescripcion = this.prvGeneraNombreEmpalme();
  }

  // Magik: new(RoObjeto)
  static create(entidad: EmpalmeEntidad, area: Bounds): ElementoEmpalmeSubterraneoG {
    return new ElementoEmpalmeSubterraneoG(entidad, area);
  }

  // Magik: prvGenera_Nombre_Empalme()
  prvGeneraNombreEmpalme(): string {
    const nombre = String(this.oEntidad.numEmpalme ?? '');
    const tipo = this.oEntidad.tipoEmp ?? '';

    if (tipo === 'RECTO') return `ER-${nombre}`;
    if (tipo === 'DERIVACION') return `ED-${nombre}`;
    if (tipo === 'EN DISTRIBUIDOR') return `DI-${nombre}`;
    if (tipo === 'LINEA') return `LI-${nombre}`;
    if (tipo === 'NINGUNO') return `NN-${nombre}`;

    return `#${tipo}`;
  }

  // Magik: dfn_ubicacion_elementos_internos()
  dfnUbicacionElementosInternos(): InternalLayout {
    const lnNumRenDiv = 20;
    const lnAltEnMM = this.oArea.ymax - this.oArea.ymin;
    const lnAltRen = lnAltEnMM / lnNumRenDiv;

    const posEtiqueta = 17; // Magik: collEtiquetas[:Etiqueta_1] << 17
    const lnNumRenSup = posEtiqueta;
    const lnNumRenInf = lnNumRenDiv - 2 - posEtiqueta;

    const etiqueta = {
      margenSup: lnAltRen * (lnNumRenSup / 10),
      margenInf: lnAltRen * (lnNumRenInf / 10),
      texto: this.sDescripcion,
    };

    const lvSup = (63 / 300) * this.nLongGrafica;
    const lvLat = (1 / 4) * this.nLongGrafica;

    const simbolo = {
      margenSup: lvSup / 10,
      margenInf: (lvSup * -1) / 10,
      margenIzq: (lvLat * -1) / 10,
      margenDer: lvLat / 10,
      nombre: this.sNombreSimbolo,
    };

    return { etiqueta, simbolo };
  }

  // Magik: Crea_elementos_internos()
  creaElementosInternos(): InternalLayout {
    return this.dfnUbicacionElementosInternos();
  }

  // Magik: reposicionar_Area(RoArea)
  reposicionarArea(area: Bounds, ptoContacto: { x: number; y: number }): Bounds {
    const alturaArea = area.ymax - area.ymin;

    const xInf = ptoContacto.x;
    const yInf = ptoContacto.y - this.nLongGrafica / 2;
    const xSup = ptoContacto.x + this.nLongGrafica;
    const ySup = ptoContacto.y + this.nLongGrafica / 2;

    return { xmin: xInf, xmax: xSup, ymin: yInf, ymax: ySup };
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function ElementoEmpalmeSubterraneoGUI() {
  const entidad = useMemo<EmpalmeEntidad>(() => ({ numEmpalme: 42, tipoEmp: 'RECTO' }), []);
  const area = useMemo<Bounds>(() => ({ xmin: 0, ymin: 0, xmax: 100, ymax: 40 }), []);

  const [layout, setLayout] = useState<InternalLayout | null>(null);

  useEffect(() => {
    const el = ElementoEmpalmeSubterraneoG.create(entidad, area);
    setLayout(el.creaElementosInternos());
  }, [entidad, area]);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_elemento_empalme_subterraneo_g</div>
      <div style={s.meta}>Descripcion: {layout?.etiqueta.texto ?? ''}</div>
      <div style={s.meta}>Etiqueta margen sup/inf: {layout?.etiqueta.margenSup.toFixed(1)} / {layout?.etiqueta.margenInf.toFixed(1)}</div>
      <div style={s.meta}>Simbolo margen (sup/inf/izq/der): {layout?.simbolo.margenSup.toFixed(1)} / {layout?.simbolo.margenInf.toFixed(1)} / {layout?.simbolo.margenIzq.toFixed(1)} / {layout?.simbolo.margenDer.toFixed(1)}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#555' },
};

export default ElementoEmpalmeSubterraneoGUI;
