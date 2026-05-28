// Source: adiciones_layout/source/Sellos/c_inventario_dto.magik
// Genera la tabla Resumen de Inventarios para un distrito

import { CTablas } from './CTablas'

export type NseKey =
  | 'RESIDENCIAL A' | 'RESIDENCIAL B' | 'RESIDENCIAL C'
  | 'RESIDENCIAL D' | 'RESIDENCIAL E'
  | 'COMERCIAL 1a.' | 'COMERCIAL 2a.' | 'COMERCIAL 3a.'
  | 'INDUSTRIAL PESADA' | 'INDUSTRIAL MEDIANA' | 'INDUSTRIAL LIGERA';

export type NseMap = Partial<Record<NseKey | 'LOTE BALDÍO', string>>;

export const NSE_STAMP_ORDER: readonly NseKey[] = [
  'RESIDENCIAL A', 'RESIDENCIAL B', 'RESIDENCIAL C', 'RESIDENCIAL D', 'RESIDENCIAL E',
  'COMERCIAL 1a.', 'COMERCIAL 2a.', 'COMERCIAL 3a.',
  'INDUSTRIAL PESADA', 'INDUSTRIAL MEDIANA', 'INDUSTRIAL LIGERA',
];

export const ROW_LABELS: Readonly<Record<NseKey, string>> = {
  'RESIDENCIAL A': 'A', 'RESIDENCIAL B': 'B', 'RESIDENCIAL C': 'C',
  'RESIDENCIAL D': 'D', 'RESIDENCIAL E': 'E',
  'COMERCIAL 1a.': '1a.', 'COMERCIAL 2a.': '2a.', 'COMERCIAL 3a.': '3a.',
  'INDUSTRIAL PESADA': 'P', 'INDUSTRIAL MEDIANA': 'M', 'INDUSTRIAL LIGERA': 'L',
};

// tbl_Totales: cells that use c_tachado_grafico (not yet migrated) — keyed as "ren,col"
export const TACHADO_TOTALES = new Set<string>([
  '1,2', '1,4', '1,5', '1,6',  // row PUBLICOS  — only col 3 (LINEAS) has data
  '2,3', '2,4', '2,5', '2,6',  // row BALDIOS   — only col 2 (VIV.LOC) has data
]);

export type InventarioRow = [string, string, string, string, string];

export interface InventarioDtoData {
  siglasCtlDto: string;
  rows: Record<NseKey, InventarioRow>;
  publicos: string;
  baldios: string;
  total: InventarioRow;
  aumentoSec: string;
  aumentoPrinc: string;
}

export class CInventarioDto {
  private _siglasCtlDto: string;
  readonly oTablas: CTablas;
  private _data: InventarioDtoData;

  constructor(siglasCtlDto: string = '') {
    this._siglasCtlDto = siglasCtlDto;
    this._data = CInventarioDto._emptyData(siglasCtlDto);
    this.oTablas = new CTablas();
    this._buildLayout({ x: 0, y: 0 });
    this._populateStaticCells();
    this._syncDataCells();
  }

  // ─── Layout (Magik: prvCreaCfgTablas) ─────────────────────────────────────

  private _buildLayout(coord: { x: number; y: number }): void {
    this._buildSeccion1(coord);
    this._buildSeccion2(coord);
    this._buildSeccion3(coord);
  }

  private _buildSeccion1(coord: { x: number; y: number }): void {
    const titulo = this.oTablas.creaTabla(2, 1, 'tbl_Titulo');
    titulo.setCoordenadaOrigen(coord);
    titulo.setBordesExternos(false);
    titulo.setColumnasInternas(false);
    titulo.setRenglonesInternos(false);
    titulo.oRenglones[0].nLongitud = 8;
    titulo.oRenglones[1].nLongitud = 5;
    titulo.oColumnas[0].nLongitud  = 78.5;

    const desY = this.oTablas.longitudTotalRenglones(['tbl_Titulo']);
    const enc  = this.oTablas.creaTabla(1, 6, 'tbl_Encabezado');
    enc.setCoordenadaOrigen({ x: coord.x, y: coord.y - desY });
    enc.oRenglones[0].nLongitud = 5;
    enc.oColumnas[0].nLongitud  = 16;
    for (let c = 1; c < 6; c++) enc.oColumnas[c].nLongitud = 12.5;
  }

  private _buildSeccion2(coord: { x: number; y: number }): void {
    const desY = this.oTablas.longitudTotalRenglones(['tbl_Titulo', 'tbl_Encabezado']);

    const tipo = this.oTablas.creaTabla(3, 1, 'tbl_Tipo_inventario');
    tipo.setCoordenadaOrigen({ x: coord.x, y: coord.y - desY });
    tipo.oRenglones[0].nLongitud = 27.5;
    tipo.oRenglones[1].nLongitud = 16.5;
    tipo.oRenglones[2].nLongitud = 16.5;
    tipo.oColumnas[0].nLongitud  = 5;

    const desX = this.oTablas.longitudTotalColumnas(['tbl_Tipo_inventario']);
    const res  = this.oTablas.creaTabla(11, 6, 'tbl_Resultados');
    res.setCoordenadaOrigen({ x: coord.x + desX, y: coord.y - desY });
    for (let r = 0; r < 11; r++) res.oRenglones[r].nLongitud = 5.5;
    res.oColumnas[0].nLongitud = 11;
    for (let c = 1; c < 6; c++) res.oColumnas[c].nLongitud = 12.5;
  }

  private _buildSeccion3(coord: { x: number; y: number }): void {
    const desY3 = this.oTablas.longitudTotalRenglones(['tbl_Titulo', 'tbl_Encabezado', 'tbl_Tipo_inventario']);

    const tot = this.oTablas.creaTabla(3, 6, 'tbl_Totales');
    tot.setCoordenadaOrigen({ x: coord.x, y: coord.y - desY3 });
    for (let r = 0; r < 3; r++) tot.oRenglones[r].nLongitud = 5;
    tot.oColumnas[0].nLongitud = 16;
    for (let c = 1; c < 6; c++) tot.oColumnas[c].nLongitud = 12.5;

    const desY4 = this.oTablas.longitudTotalRenglones(['tbl_Titulo', 'tbl_Encabezado', 'tbl_Tipo_inventario', 'tbl_Totales']);
    const aum  = this.oTablas.creaTabla(2, 3, 'tbl_Aumentos');
    aum.setCoordenadaOrigen({ x: coord.x, y: coord.y - desY4 });
    aum.setBordesExternos(false);
    aum.setColumnasInternas(false);
    aum.setRenglonesInternos(false);
    // Bottom borders as underlines for the value cells
    aum.celda(1, 2).bordes.inf = true;
    aum.celda(1, 3).bordes.inf = true;
    aum.celda(2, 2).bordes.inf = true;
    aum.celda(2, 3).bordes.inf = true;
    for (let r = 0; r < 2; r++) aum.oRenglones[r].nLongitud = 10;
    aum.oColumnas[0].nLongitud = 28.5;
    aum.oColumnas[1].nLongitud = 12.5;
    aum.oColumnas[2].nLongitud = 37.5;
  }

  // ─── Static cell labels (Magik: prvCrea_Asigna_Obj_A_Celdas_Seccion*) ─────

  private _populateStaticCells(): void {
    this.oTablas.elemento('tbl_Titulo')!.celda(2, 1).texto = 'INVENTARIO';

    const enc = this.oTablas.elemento('tbl_Encabezado')!;
    enc.celda(1, 2).texto = 'VIV.LOC.';
    enc.celda(1, 3).texto = 'LINEAS';
    enc.celda(1, 4).texto = 'CONST.';
    enc.celda(1, 5).texto = 'F.PEN';
    enc.celda(1, 6).texto = 'TOT.SAT';

    const tipo = this.oTablas.elemento('tbl_Tipo_inventario')!;
    tipo.celda(1, 1).texto = 'RESIDENCIAL';
    tipo.celda(2, 1).texto = 'COMERCIAL';
    tipo.celda(3, 1).texto = 'INDUSTRIAL';

    const res = this.oTablas.elemento('tbl_Resultados')!;
    ['A', 'B', 'C', 'D', 'E', '1a.', '2a.', '3a.', 'P', 'M', 'L'].forEach((lbl, i) => {
      res.celda(i + 1, 1).texto = lbl;
    });

    const tot = this.oTablas.elemento('tbl_Totales')!;
    tot.celda(1, 1).texto = 'PUBLICOS';
    tot.celda(2, 1).texto = 'BALDIOS';
    tot.celda(3, 1).texto = 'TOTAL';

    const aum = this.oTablas.elemento('tbl_Aumentos')!;
    aum.celda(1, 1).texto = 'AUMENTO SEC.';
    aum.celda(2, 1).texto = 'AUMENTO PRINC.';
  }

  private _syncDataCells(): void {
    const titulo = this.oTablas.elemento('tbl_Titulo');
    if (titulo) titulo.celda(1, 1).texto = this._siglasCtlDto || undefined;

    const res = this.oTablas.elemento('tbl_Resultados');
    if (res) {
      NSE_STAMP_ORDER.forEach((key, i) => {
        const row = this._data.rows[key];
        for (let c = 0; c < 5; c++) res.celda(i + 1, c + 2).texto = row[c] || undefined;
      });
    }

    const tot = this.oTablas.elemento('tbl_Totales');
    if (tot) {
      tot.celda(1, 3).texto = this._data.publicos || undefined;
      tot.celda(2, 2).texto = this._data.baldios || undefined;
      this._data.total.forEach((v, i) => { tot.celda(3, i + 2).texto = v || undefined; });
    }

    const aum = this.oTablas.elemento('tbl_Aumentos');
    if (aum) {
      aum.celda(1, 3).texto = this._data.aumentoSec || undefined;
      aum.celda(2, 3).texto = this._data.aumentoPrinc || undefined;
    }
  }

  // ─── Setters ──────────────────────────────────────────────────────────────

  setSiglasCtlDto(v: string): void {
    this._siglasCtlDto = v;
    this._data.siglasCtlDto = v;
    const t = this.oTablas.elemento('tbl_Titulo');
    if (t) t.celda(1, 1).texto = v || undefined;
  }

  // Magik: collRes_A / collRes_B / … / collInd_L
  setRow(key: NseKey, row: InventarioRow): void {
    if (row.length !== 5) throw new Error('Row debe tener exactamente 5 elementos');
    this._data.rows[key] = row;
    const idx = NSE_STAMP_ORDER.indexOf(key);
    const res = this.oTablas.elemento('tbl_Resultados');
    if (res && idx >= 0) {
      for (let c = 0; c < 5; c++) res.celda(idx + 1, c + 2).texto = row[c] || undefined;
    }
  }

  setPublicos(v: string): void {
    this._data.publicos = v;
    this.oTablas.elemento('tbl_Totales')?.celda(1, 3) &&
      (this.oTablas.elemento('tbl_Totales')!.celda(1, 3).texto = v || undefined);
  }

  setBaldios(v: string): void {
    this._data.baldios = v;
    const tot = this.oTablas.elemento('tbl_Totales');
    if (tot) tot.celda(2, 2).texto = v || undefined;
  }

  setTotal(valores: InventarioRow): void {
    this._data.total = valores;
    const tot = this.oTablas.elemento('tbl_Totales');
    if (tot) valores.forEach((v, i) => { tot.celda(3, i + 2).texto = v || undefined; });
  }

  setAumentoSec(v: string): void {
    this._data.aumentoSec = v;
    this.oTablas.elemento('tbl_Aumentos')?.celda(1, 3) &&
      (this.oTablas.elemento('tbl_Aumentos')!.celda(1, 3).texto = v || undefined);
  }

  setAumentoPrinc(v: string): void {
    this._data.aumentoPrinc = v;
    this.oTablas.elemento('tbl_Aumentos')?.celda(2, 3) &&
      (this.oTablas.elemento('tbl_Aumentos')!.celda(2, 3).texto = v || undefined);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get siglasCtlDto(): string { return this._siglasCtlDto; }
  get data(): Readonly<InventarioDtoData> { return this._data; }

  // Magik: prvOrdena_DeAcuerdo_Sello — reorders an NseMap into the stamp row order
  sortByStampOrder(map: NseMap): string[] {
    return NSE_STAMP_ORDER.map(k => map[k] ?? '');
  }

  // Magik: inicializa_vectores_datos — resets all data cells to empty defaults
  inicializaVectoresDatos(): void {
    this._data = CInventarioDto._emptyData(this._siglasCtlDto);
    this._syncDataCells();
  }

  // ─── Static ───────────────────────────────────────────────────────────────

  private static _emptyData(siglas: string): InventarioDtoData {
    const emptyRow: InventarioRow = ['', '', '', '', ''];
    return {
      siglasCtlDto: siglas,
      rows: Object.fromEntries(
        NSE_STAMP_ORDER.map(k => [k, [...emptyRow] as InventarioRow]),
      ) as Record<NseKey, InventarioRow>,
      publicos:     '0',
      baldios:      '0',
      total:        ['0', '0', '0', '0', '0'],
      aumentoSec:   '0+0=0',
      aumentoPrinc: '0+100=100',
    };
  }
}
