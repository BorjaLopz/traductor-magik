/**
 * Migracion de: c_elementos_tramo_g.magik
 * Clase Magik:  c_elementos_tramo_g
 * Metodos:      new, Longitud_Total, Despliega, nTotal_Elementos
 *
 * Intencion:
 *   Administrar una coleccion de elementos de tramo y calcular
 *   longitud total y cantidad de elementos habilitados.
 */

import React, { useMemo } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface ElementoTramo {
  id: string;
  bHabilitar: boolean;
  nLongGrafica: number;
  isEmpalme: boolean;
  despliega(): void;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class ElementosTramoG {
  sNombreGrafico: string | null = null;
  collElementos: ElementoTramo[] = [];

  // Magik: new()
  static create(): ElementosTramoG {
    return new ElementosTramoG();
  }

  // Magik: Longitud_Total()
  async longitudTotal(): Promise<number> {
    let total = 0;
    for (const el of this.collElementos) {
      if (!el.bHabilitar) continue;
      if (el.isEmpalme) continue; // Magik: is_kind_of?(c_elemento_empalme_g)
      total += el.nLongGrafica;
    }
    return total;
  }

  // Magik: Despliega()
  async despliega(): Promise<void> {
    for (const el of this.collElementos) {
      el.despliega();
    }
  }

  // Magik: nTotal_Elementos
  async totalElementos(): Promise<number> {
    let count = 0;
    for (const el of this.collElementos) {
      if (el.bHabilitar) count += 1;
    }
    return count;
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function ElementosTramoGUI() {
  const elementos = useMemo<ElementoTramo[]>(() => ([
    { id: 'e1', bHabilitar: true, nLongGrafica: 120, isEmpalme: false, despliega: () => {} },
    { id: 'e2', bHabilitar: true, nLongGrafica: 80, isEmpalme: true, despliega: () => {} },
    { id: 'e3', bHabilitar: false, nLongGrafica: 50, isEmpalme: false, despliega: () => {} },
    { id: 'e4', bHabilitar: true, nLongGrafica: 40, isEmpalme: false, despliega: () => {} },
  ]), []);

  const tramo = useMemo(() => {
    const t = ElementosTramoG.create();
    t.collElementos = elementos;
    return t;
  }, [elementos]);

  const total = elementos.filter(e => e.bHabilitar && !e.isEmpalme).reduce((acc, e) => acc + e.nLongGrafica, 0);
  const count = elementos.filter(e => e.bHabilitar).length;

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_elementos_tramo_g</div>
      <div style={s.meta}>Elementos habilitados: {count}</div>
      <div style={s.meta}>Longitud total (sin empalmes): {total}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#555' },
};

export default ElementosTramoGUI;
