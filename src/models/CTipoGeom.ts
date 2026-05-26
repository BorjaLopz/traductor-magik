// Source: adiciones_layout/source/c_Tipo_Geom.magik
//
// DTO trivial — guarda la relación (dataset, tabla, tipo_geometría) que
// utiliza el corte geográfico para saber qué elementos pintar.
// 3 slots writable: oDataset, oTabla, oTipo_geom.

export type TipoGeometria = 'point' | 'line' | 'area' | 'text' | 'raster';

export class CTipoGeom {
  oDataset:   string;
  oTabla:     string;
  oTipo_geom: TipoGeometria | string;

  // Magik: c_Tipo_Geom.new(PoDataset, PoTabla, PoTipo_geom) → _clone.init(...)
  constructor(poDataset: string, poTabla: string, poTipoGeom: TipoGeometria | string) {
    this.oDataset   = poDataset;
    this.oTabla     = poTabla;
    this.oTipo_geom = poTipoGeom;
  }
}
