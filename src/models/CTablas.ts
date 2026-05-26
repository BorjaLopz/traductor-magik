// Source: adiciones_layout/source/c_tablas.magik
//
// Colección de c_tabla indexada por nombre. Encapsula múltiples tablas que
// pertenecen al mismo layout y delega operaciones agregadas
// (area_total, Despliega, Longitud_total_*) a las instancias.

import { CTabla, type BoundingBox, type RGB } from './CTabla';

export class CTablas {
  oLayout:        string | undefined = undefined;   // layout id/handle
  nTotalTablas:   number = 0;
  collTablas:     Map<string, CTabla> = new Map();

  // Magik: c_tablas.new(RoLayout)
  constructor(roLayout: string | undefined = undefined) {
    this.oLayout = roLayout;
  }

  // Magik: c_tablas.crea_tabla(rens, cols, nombre, _optional color)
  creaTabla(rnNumRen: number, rnNumCol: number, rsNombre: string, psColorLinea?: RGB): CTabla {
    const t = new CTabla(rnNumRen, rnNumCol, psColorLinea);
    t.sNombre = rsNombre;
    this.collTablas.set(rsNombre, t);
    this.nTotalTablas += 1;
    return t;
  }

  // Magik: c_tablas.Elemento(nombre)
  elemento(rsNombre: string): CTabla | undefined {
    return this.collTablas.get(rsNombre);
  }

  // Magik: c_tablas.tablas — readonly view
  get tablas(): ReadonlyMap<string, CTabla> { return this.collTablas; }

  // Magik: c_tablas.Total_elementos
  totalElementos(): number { return this.nTotalTablas; }

  // Magik: c_tablas.area_total — bbox que envuelve todas las sub-tablas
  areaTotal(): BoundingBox | undefined {
    if (this.collTablas.size === 0) return undefined;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of this.collTablas.values()) {
      const a = t.calculaAreaTabla();
      if (a.xmin < minX) minX = a.xmin;
      if (a.ymin < minY) minY = a.ymin;
      if (a.xmax > maxX) maxX = a.xmax;
      if (a.ymax > maxY) maxY = a.ymax;
    }
    return { xmin: minX, ymin: minY, xmax: maxX, ymax: maxY };
  }

  // Magik: c_tablas.Longitud_total_Columnas(indice)
  longitudTotalColumnas(nombres: readonly string[]): number {
    let acc = 0;
    for (const n of nombres) {
      const t = this.collTablas.get(n);
      if (t) acc += t.oColumnas.reduce((a, c) => a + c.nLongitud, 0);
    }
    return acc;
  }

  // Magik: c_tablas.Longitud_total_Renglones(indice)
  longitudTotalRenglones(nombres: readonly string[]): number {
    let acc = 0;
    for (const n of nombres) {
      const t = this.collTablas.get(n);
      if (t) acc += t.oRenglones.reduce((a, r) => a + r.nLongitud, 0);
    }
    return acc;
  }

  // Magik: c_tablas.Despliega(ventana) — itera asignando oLayout y delegando
  // (en TS no dibuja — el cliente render itera .tablas)
  despliega(): CTabla[] {
    return [...this.collTablas.values()];
  }

  // Magik: c_tablas.AsignaLayout << layout
  asignaLayout(layout: string | undefined): void {
    this.oLayout = layout;
  }
}
