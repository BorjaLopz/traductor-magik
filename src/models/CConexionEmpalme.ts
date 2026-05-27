// Source: planos_fo/source/montaje_tba/factory/c_conexion_empalme.magik
// Fase 6 — CRÍTICO. Extends layout_element; full GIS connectivity traversal + Bresenham ellipse.

// ─── Domain types ────────────────────────────────────────────────────────────

export interface Bounds {
  xmin: number; xmax: number; ymin: number; ymax: number;
}

export type Coord = [number, number];

export interface FiberOwnerRecord {
  'user!_cuenta': string | undefined;
  'user!_estado': string | undefined;
}

export interface FiberPin {
  kind: 'fiber';
  fiber_number: number;
  fiber_owner_record: FiberOwnerRecord | undefined;
  connected_object(): ConnectedObject | undefined;
}

export interface PseudoFiberPin {
  kind: 'pseudo_fiber';
  fiber_number: number;
  fiber_owner_record: FiberOwnerRecord | undefined;
  connected_items: { an_element(): ConnectedObject | undefined };
}

export type AnyPin = FiberPin | PseudoFiberPin;

export interface ConnectedObject {
  owner: CableLike;
}

export interface CableLike {
  construction_status: string;
  spec_id: string;
  obtener_pines(n?: number): AnyPin[];
  mit_sheath_pins: { size: number };
}

export interface EmpalmeRecord {
  construction_status: string;
  'user!_tipo_emp': string;
}

// ─── Drawing context (replaces Smallworld window) ────────────────────────────

export interface DrawingContext {
  drawPolyline(coords: Coord[], color: string, width: number, dashed?: boolean): void;
  drawFilledArea(coords: Coord[], strokeColor: string, width: number): void;
  drawCircleFilled(cx: number, cy: number, r: number, fillColor: string): void;
  drawText(text: string, x: number, y: number, color: string, fontSize: number, angleDeg?: number): void;
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface LineFormat {
  anota_1: string;
  color_1: string;
  anota_2: string | undefined;
  color_2: string | undefined;
}

export interface LineSegment {
  coords: Coord[];
  annotation: string;
}

export interface LineGroupEntry {
  seg1: LineSegment;
  seg2: LineSegment | undefined;
  firstCoord: Coord;
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CConexionEmpalme {
  // shared constants
  static readonly allowed_on_menu = false;
  static readonly LoGrados = 0;
  static readonly LoTipoLetra = 'Times_New_Roman';
  static readonly LoTitulo = 'DIAGRAMA UNIFILAR DE F.O. BANDA ANCHA T.B.A';

  // shared variables (class-level state, like Magik define_shared_variable)
  static diagrama_creado = false;
  static ubicacion_plano: Bounds | false = false;

  // slots (public, per original :writable/:public)
  oCableTba: CableLike;
  oEmpalme: EmpalmeRecord;
  oCable_FO_tba: CableLike | undefined;
  oCable_FO_llegada: CableLike | undefined;
  oCable_FO_salida: CableLike | undefined;
  oLineasGrupo: LineGroupEntry[] = [];
  oFibrasCTba: unknown;
  oTexto_llegada: string | undefined;
  oTexto_salida: string | undefined;
  oArea: Bounds | undefined;
  oCableE: Coord[] | undefined;
  oCableS: Coord[] | undefined;

  // layout element state (replaces _super fields)
  private _bounds: Bounds;
  private _tamanioTexto: number;

  // temporary quadrant accumulators for ellipse (ropero1-4)
  private _ropero1: Coord[] = [];
  private _ropero2: Coord[] = [];
  private _ropero3: Coord[] = [];
  private _ropero4: Coord[] = [];

  constructor(
    cableTba: CableLike,
    empalme: EmpalmeRecord,
    bounds: Bounds,
    tamanioTexto = 50,
  ) {
    this.oCableTba = cableTba;
    this.oEmpalme = empalme;
    this._bounds = bounds;
    this._tamanioTexto = tamanioTexto;
  }

  get bounds(): Bounds { return this._bounds; }
  get tamanio(): number { return this._tamanioTexto; }
  get tamanioTexto(): number { return this._tamanioTexto; }

  // ── cable_llegada ────────────────────────────────────────────────────────
  // Traverses TBA cable connectivity to find the incoming (llegada) cable.
  cableLlegada(): CableLike | undefined {
    const pin = this.oCableTba.obtener_pines()[0];
    if (!pin) return undefined;
    const conn = this._pinConnection(pin);
    if (conn) {
      this.oCable_FO_llegada = conn.owner;
      return conn.owner;
    }
    return undefined;
  }

  private _pinConnection(pin: AnyPin): ConnectedObject | undefined {
    if (pin.kind === 'fiber') return pin.connected_object();
    return pin.connected_items.an_element();
  }

  // ── anotacion_linea ──────────────────────────────────────────────────────
  // Builds "Fo. N=CUENTA ESTADO" annotation string from a set of fiber pins.
  anotacionLinea(pins: AnyPin[]): string {
    let anotacion = 'Fo. ';
    const fibras: string[] = [];
    const cuentas: string[] = [];
    const estados: string[] = [];

    for (const e of pins) {
      fibras.push(String(e.fiber_number));
      const att = e.fiber_owner_record;
      if (att !== undefined) {
        const cta = att['user!_cuenta'];
        cuentas.push(cta !== undefined ? String(cta) : ' ');
        const est = att['user!_estado'];
        if (est !== undefined) estados.push(est);
        else if (cta === undefined) estados.push(' ');
      }
    }

    fibras.sort();
    cuentas.sort();
    estados.sort();

    if (fibras.length === 1) {
      anotacion += fibras[0] + '=';
    } else if (fibras.length > 1) {
      anotacion += fibras[0] + '-' + fibras[fibras.length - 1] + '=';
    }

    if (cuentas.length === 1) {
      anotacion += cuentas[0];
    } else if (cuentas.length > 1) {
      anotacion += cuentas[0] + '-' + cuentas[cuentas.length - 1];
    }

    if (estados.length === 1) {
      anotacion += ' ' + estados[0];
    }

    return anotacion;
  }

  // ── format_linea ─────────────────────────────────────────────────────────
  // Determines color and annotation for a set of pins based on connectivity.
  formatLinea(pins: AnyPin[]): LineFormat {
    let connectedObj: ConnectedObject | undefined;
    if (pins.length > 0) {
      connectedObj = this._pinConnection(pins[0]);
    }

    if (connectedObj && connectedObj.owner === this.oCableTba) {
      return {
        anota_1: this.anotacionLinea(pins),
        color_1: 'green',
        anota_2: 'TBA ' + this.anotacionLinea([pins[0]]),
        color_2: 'red',
      };
    } else if (connectedObj) {
      return {
        anota_1: this.anotacionLinea(pins),
        color_1: 'green',
        anota_2: this.anotacionLinea(pins),
        color_2: 'green',
      };
    } else {
      return {
        anota_1: this.anotacionLinea(pins),
        color_1: 'green',
        anota_2: undefined,
        color_2: undefined,
      };
    }
  }

  // ── calcular_cuadro ──────────────────────────────────────────────────────
  // Computes the central splice box bounds (inset + fixed 90-unit margins).
  calcularCuadro(): Bounds {
    const desX = (this._bounds.xmax - this._bounds.xmin) / 3;
    const desY = (this._bounds.ymax - this._bounds.ymin) / 6;
    // buffer(1) expands by 1 unit in each direction
    this.oArea = {
      xmin: this._bounds.xmin + desX + 90 - 1,
      ymin: this._bounds.ymin + desY - 1,
      xmax: this._bounds.xmax - desX - 90 + 1,
      ymax: this._bounds.ymax - desY + 1,
    };
    return this.oArea;
  }

  // ── obtener_lineas ───────────────────────────────────────────────────────
  // Traverses cable llegada pins and groups them into fiber lines by destination.
  // Returns [rawPinGroups, formattedLineFormats].
  obtenerLineas(): [AnyPin[][], LineFormat[]] {
    const lineas: AnyPin[][] = [];
    const lineasNew: LineFormat[] = [];
    let lineasLargo: AnyPin[] = [];

    const cable = this.cableLlegada();
    if (!cable) return [[], []];

    const pines = cable.obtener_pines(cable.mit_sheath_pins.size);

    for (const pin of pines) {
      const conn = this._pinConnection(pin);
      if (conn) {
        if (conn.owner === this.oCableTba) {
          if (lineasLargo.length > 0) {
            lineas.push(lineasLargo);
            lineasNew.push(this.formatLinea(lineasLargo));
            lineasLargo = [];
          }
          lineas.push([pin]);
          lineasNew.push(this.formatLinea([pin]));
        } else {
          this.oCable_FO_salida = conn.owner;
          lineasLargo.push(pin);
        }
      } else {
        if (lineasLargo.length > 0) {
          lineas.push(lineasLargo);
          lineasNew.push(this.formatLinea(lineasLargo));
          lineasLargo = [];
        }
        lineas.push([pin]);
        lineasNew.push(this.formatLinea([pin]));
      }
    }

    if (lineasLargo.length > 0) {
      lineas.push(lineasLargo);
      lineasNew.push(this.formatLinea(lineasLargo));
    }

    return [lineas, lineasNew];
  }

  // ── crear_linea ──────────────────────────────────────────────────────────
  // Builds line geometry for one fiber group based on its vertical distance offset and format.
  crearLinea(poDist: number, format: LineFormat): LineGroupEntry {
    const ini: Coord = [this._bounds.xmin, this._bounds.ymax];
    const desX = (this._bounds.xmax - this._bounds.xmin) / 2;
    const desY = (this._bounds.ymax - this._bounds.ymin) / 6;
    const y = ini[1] - (desY + 2);
    const lineY = y - poDist;

    const start: Coord = [ini[0], lineY];
    const mid: Coord = [ini[0] + desX, lineY];

    let seg1Coords: Coord[];
    let seg2: LineSegment | undefined;

    if (format.color_2 !== undefined) {
      // Two-segment line: llegada → empalme → TBA
      seg1Coords = [start, mid];
      const end: Coord = [this._bounds.xmax, lineY];
      seg2 = { coords: [mid, end], annotation: format.anota_2 ?? '' };
    } else {
      const anota = format.anota_1;
      if (anota.endsWith('M') || anota.endsWith(' 0')) {
        // Dead / null fiber — T-cap termination
        const cap1: Coord = [mid[0], mid[1] + 8];
        const cap2: Coord = [mid[0], mid[1] - 8];
        seg1Coords = [start, mid, cap1, cap2];
      } else if (anota.endsWith('R')) {
        // Reserved fiber — zigzag symbol
        const z0: Coord = [mid[0], mid[1]];
        const z1: Coord = [mid[0] + 10, mid[1] + 25];
        const z2: Coord = [mid[0] + 25, mid[1] - 25];
        const z3: Coord = [mid[0] + 40, mid[1]];
        seg1Coords = [start, z0, z1, z2, z3, z3]; // z3 repeated (original ends same coord)
      } else {
        // Assigned — same T-cap as dead
        const cap1: Coord = [mid[0], mid[1] + 8];
        const cap2: Coord = [mid[0], mid[1] - 8];
        seg1Coords = [start, mid, cap1, cap2];
      }
    }

    return {
      seg1: { coords: seg1Coords, annotation: format.anota_1 },
      seg2,
      firstCoord: start,
    };
  }

  // ── calcular_grupos ──────────────────────────────────────────────────────
  calcularGrupos(): void {
    if (!this.oArea) this.calcularCuadro();
    const area = this.oArea!;
    this.oLineasGrupo = [];
    const [lineas, formats] = this.obtenerLineas();
    const lodes = (area.ymax - area.ymin) / (lineas.length + 1);
    let lodes2 = lodes;

    for (let i = 0; i < lineas.length; i++) {
      this.oLineasGrupo.push(this.crearLinea(lodes2, formats[i]));
      lodes2 += lodes;
    }
  }

  // ── genera_forma_cables ──────────────────────────────────────────────────
  // Bresenham midpoint ellipse algorithm — generates ellipse outline coordinates.
  generaFormaCables(xc: number, yc: number, rx: number, ry: number): Coord[] {
    this._ropero1 = [];
    this._ropero2 = [];
    this._ropero3 = [];
    this._ropero4 = [];

    const Ry2 = ry * ry;
    const Rx2 = rx * rx;
    const dosRy2 = 2 * Ry2;
    const dosRx2 = 2 * Rx2;

    let x = 0;
    let y = ry;
    this._creaPuntos(xc, yc, x, y);

    let p = Math.round(Ry2 - Rx2 * ry + 0.25 * Rx2);
    let px = 0;
    let py = dosRx2 * y;

    // Region 1: |slope| < 1
    while (px < py) {
      x += 1;
      px += dosRy2;
      if (p < 0) {
        p += Ry2 + px;
      } else {
        y -= 1;
        py -= dosRx2;
        p += Ry2 + px - py;
      }
      this._creaPuntos(xc, yc, x, y);
    }

    // Region 2: |slope| > 1
    p = Math.round(Ry2 * (x + 0.5) * (x + 0.5)) + Rx2 * (y - 1) * (y - 1) - Rx2 * Ry2;
    while (y > 0) {
      y -= 1;
      py -= dosRx2;
      if (p > 0) {
        p += Rx2 - py;
      } else {
        x += 1;
        px += dosRy2;
        p += Rx2 - py + px;
      }
      this._creaPuntos(xc, yc, x, y);
    }

    // Assemble continuous ellipse: ropero1 → ropero2 reversed → ropero3 → ropero4 reversed
    const result: Coord[] = [
      ...this._ropero1,
      ...[...this._ropero2].reverse(),
      ...this._ropero3,
      ...[...this._ropero4].reverse(),
    ];

    return result;
  }

  private _creaPuntos(xc: number, yc: number, x: number, y: number): void {
    this._ropero1.push([xc + x, yc + y]);
    this._ropero4.push([xc - x, yc + y]);
    this._ropero2.push([xc + x, yc - y]);
    this._ropero3.push([xc - x, yc - y]);
  }

  // ── drawContentOn ────────────────────────────────────────────────────────
  // Main render. Equivalent to draw_content_on(windows).
  drawContentOn(ctx: DrawingContext): void {
    const area = this.calcularCuadro();
    this.calcularGrupos();

    // Draw splice box
    const spliceBounds = area;
    const spliceColor = this.oEmpalme.construction_status === 'PROYECTADO' ? 'red' : 'green';
    const spliceWidth = this.oEmpalme.construction_status === 'PROYECTADO' ? 3 : 2;
    ctx.drawPolyline([
      [spliceBounds.xmin, spliceBounds.ymin],
      [spliceBounds.xmax, spliceBounds.ymin],
      [spliceBounds.xmax, spliceBounds.ymax],
      [spliceBounds.xmin, spliceBounds.ymax],
      [spliceBounds.xmin, spliceBounds.ymin],
    ], spliceColor, spliceWidth, true);

    // Draw fiber group lines
    const llegada = this.cableLlegada();
    const lineColor = llegada?.construction_status === 'PROYECTADO' ? 'red' : 'green';
    const lineWidth = llegada?.construction_status === 'PROYECTADO' ? 3 : 2;

    for (const lin of this.oLineasGrupo) {
      ctx.drawPolyline(lin.seg1.coords, lineColor, lineWidth);
      const textoS = lin.seg2 ? lin.seg2.annotation : '';
      this._colocaAnotacionCllegada(ctx, lin.seg1.annotation, textoS, lin.firstCoord);
      if (lin.seg2) {
        ctx.drawPolyline(lin.seg2.coords, lineColor, lineWidth);
      }
    }

    this._colocaAnotacionCables(ctx);
    this._representaCableL(ctx);
    this._obtieneAnotacionTbaFinal(ctx);

    // Title
    const fs = Math.min(Math.max(9, this._tamanioTexto), 20);
    const titulo = CConexionEmpalme.LoTitulo.toUpperCase();
    ctx.drawText(titulo, (this._bounds.xmin + this._bounds.xmax) / 2, this._bounds.ymax + 75, 'black', fs);
  }

  private _colocaAnotacionCables(ctx: DrawingContext): void {
    const llegada = this.cableLlegada();
    const arrived = llegada?.construction_status === 'PROYECTADO';
    const color = arrived ? 'red' : 'green';
    const fs = Math.max(8, this._tamanioTexto - 10);

    // Cable llegada label
    const txtLlegada = llegada ? 'Cable F.O. ' + llegada.spec_id : ' ';
    ctx.drawText(txtLlegada, this._bounds.xmin + 50, this._bounds.ymax - 80, color, fs);

    // Cable salida label
    const txtSalida = this.oCable_FO_salida ? 'Cable F.O. ' + this.oCable_FO_salida.spec_id : '';
    const centerX = (this._bounds.xmin + this._bounds.xmax) / 2;
    ctx.drawText(txtSalida, centerX, this._bounds.ymax - 80, color, fs);

    // TBA cable label
    const tbaCon = this.oCableTba.construction_status === 'PROYECTADO';
    const tbaColor = tbaCon ? 'red' : 'green';
    ctx.drawText('Cable F.O. ' + this.oCableTba.spec_id, centerX, this._bounds.ymin + 50, tbaColor, fs);

    // Empalme type
    const empColor = this.oEmpalme.construction_status === 'PROYECTADO' ? 'red' : 'green';
    ctx.drawText(this.oEmpalme['user!_tipo_emp'], centerX - 100, this.oArea!.ymax + 20, empColor, fs);
  }

  private _colocaAnotacionCllegada(
    ctx: DrawingContext,
    textoL: string,
    textoS: string,
    coord: Coord,
  ): void {
    const llegada = this.cableLlegada();
    const color = llegada?.construction_status === 'PROYECTADO' ? 'red' : 'green';
    const fs = Math.max(7, this._tamanioTexto - 20);
    const desX = (this._bounds.xmax - this._bounds.xmin) / 2;

    // Draw TBA circle marker if text starts with "TBA"
    if (textoS.startsWith('TBA')) {
      const tbaCon = this.oCableTba.construction_status === 'PROYECTADO';
      const tbaColor = tbaCon ? 'red' : 'green';
      ctx.drawCircleFilled(coord[0] + desX, coord[1], 15, tbaColor);
    }

    // Filter out null-state suffix "\0" from llegada text
    const textoLN = textoL.endsWith(' 0') ? textoL.slice(0, -2) : textoL;
    ctx.drawText(textoLN, coord[0] + 100, coord[1] + 5, color, fs);

    // Salida text (skip M/0/R/A states — they have special line endings already)
    if (textoS && !textoS.startsWith('TBA')) {
      const skip = textoS.endsWith('M') || textoS.endsWith(' 0') ||
                   textoS.endsWith('R') || textoS.endsWith('A');
      if (!skip) {
        const sX = this._bounds.xmax - 500;
        ctx.drawText(textoS, sX, coord[1] + 5, color, fs);
      }
    }
  }

  private _representaCableL(ctx: DrawingContext): void {
    if (this.oLineasGrupo.length === 0) return;
    const first = this.oLineasGrupo[0].firstCoord;
    const last = this.oLineasGrupo[this.oLineasGrupo.length - 1].firstCoord;
    const distenY = Math.abs(first[1] - last[1]);
    const xcen = this.oArea!.xmin - 100;
    const ycen = last[1] + distenY / 2;

    this.oCableE = this.generaFormaCables(xcen, ycen, 100, distenY / 2 + 20);

    const llegada = this.cableLlegada();
    const color = llegada?.construction_status === 'PROYECTADO' ? 'red' : 'green';
    const width = llegada?.construction_status === 'PROYECTADO' ? 3 : 2;
    ctx.drawFilledArea(this.oCableE, color, width);

    // Pointer line from bounds.xmin + 350 → ellipse center
    ctx.drawPolyline([
      [this._bounds.xmin + 350, this._bounds.ymax - 80],
      [xcen, first[1] + 20],
    ], color, width);
  }

  private _obtieneAnotacionTbaFinal(ctx: DrawingContext): void {
    const tbaLines = this.oLineasGrupo.filter(g => g.seg2?.annotation.startsWith('TBA'));
    if (tbaLines.length < 2) return;

    const co1 = tbaLines[0].seg2!.coords[tbaLines[0].seg2!.coords.length - 1];
    const co2 = tbaLines[tbaLines.length - 1].seg2!.coords[tbaLines[tbaLines.length - 1].seg2!.coords.length - 1];
    const distenY = Math.abs(co1[1] - co2[1]);
    const xcen = this.oArea!.xmax + 100;
    const ycen = co2[1] + distenY / 2;

    this.oCableS = this.generaFormaCables(xcen, ycen, 60, distenY / 2 + 30);

    const tbaCon = this.oCableTba.construction_status === 'PROYECTADO';
    const color = tbaCon ? 'red' : 'green';
    const width = tbaCon ? 3 : 2;
    ctx.drawFilledArea(this.oCableS, color, width);

    ctx.drawPolyline([
      [xcen, co2[1] - 30],
      [xcen, this._bounds.ymin + 90],
    ], color, width);

    const fs = Math.max(8, this._tamanioTexto - 20);
    ctx.drawText('A TERMINAL DE BANDA ANCHA.', xcen + 100, co1[1] - 300, '#cc00cc', fs, 90);
  }
}
