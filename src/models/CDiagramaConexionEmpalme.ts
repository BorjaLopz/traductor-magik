// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_diagrama_conexion_empalme.magik

export type Coord = [number, number];
export interface Bounds { xmin: number; xmax: number; ymin: number; ymax: number; }

export interface DrawingContext {
  drawPolyline(coords: Coord[], color: string, width: number, dashed?: boolean): void;
  drawCircleFilled(cx: number, cy: number, r: number, color: string): void;
  drawText(text: string, x: number, y: number, color: string, fontSize: number): void;
}

export interface FiberDef {
  leftColor: string;    // CSS color for left (llegada) segment
  rightColor?: string;  // CSS color for right (salida) segment if connected
  leftAnnot: string;
  rightAnnot?: string;
}

export interface FiberGroupDef {
  fibers: FiberDef[];
  bundleLabel: string;  // e.g. 'AZUL', 'ROJO'
}

export interface FiberLine {
  y: number;
  leftColor: string;
  rightColor?: string;
  leftAnnot: string;
  rightAnnot?: string;
  groupIndex: number;
}

function boundsToRect(b: Bounds): Coord[] {
  return [
    [b.xmin, b.ymin], [b.xmax, b.ymin],
    [b.xmax, b.ymax], [b.xmin, b.ymax],
    [b.xmin, b.ymin],
  ];
}

export class CDiagramaConexionEmpalme {
  static readonly LoTitulo = 'DIAGRAMA DE CONEXION';

  private readonly _bounds: Bounds;
  private readonly _groups: FiberGroupDef[];
  private readonly _empalmeColor: string;
  private readonly _cableColor: string;

  private readonly _fiberLines: FiberLine[];
  private readonly _empalme: Bounds;
  private readonly _tuboE: Bounds;
  private readonly _tuboS: Bounds;
  private readonly _cableE: Coord[];
  private readonly _cableS: Coord[];

  constructor(
    bounds: Bounds,
    groups: FiberGroupDef[],
    empalmeColor = '#4caf50',
    cableColor = '#4caf50',
  ) {
    this._bounds = bounds;
    this._groups = groups;
    this._empalmeColor = empalmeColor;
    this._cableColor = cableColor;

    this._fiberLines = this._calcularGrupos();
    this._empalme = this._ajustarEmpalme();
    const tubes = this._obtenerTubos();
    this._tuboE = tubes.tuboE;
    this._tuboS = tubes.tuboS;
    this._cableE = this._generarFormaCables(true);
    this._cableS = this._generarFormaCables(false);
  }

  // obtiene_color: maps GIS color codes to Spanish names
  static obtienesColor(cadena: string): string {
    if (cadena.includes('NAT')) return 'NATURAL';
    if (cadena.includes('AZU')) return 'AZUL';
    if (cadena.includes('AMA')) return 'AMARILLO';
    if (cadena.includes('ROJ')) return 'ROJO';
    if (cadena.includes('VER')) return 'VERDE';
    if (cadena.includes('NAR')) return 'NARANJA';
    if (cadena.includes('VIO')) return 'VIOLETA';
    if (cadena.includes('CAF')) return 'CAFE';
    if (cadena.includes('GRI')) return 'GRIS';
    if (cadena.includes('NEG')) return 'NEGRO';
    if (cadena.includes('ROS')) return 'ROSA';
    if (cadena.includes('BLA')) return 'BLANCO';
    return '';
  }

  // anotacion_linea: returns ' ' + first sorted fiber number from a pin group
  static anotacionLinea(fiberNumbers: string[]): string {
    if (fiberNumbers.length === 0) return ' ';
    const sorted = [...fiberNumbers].sort((a, b) => Number(a) - Number(b));
    return ' ' + sorted[0];
  }

  // calcular_grupos + crear_linea: distribute fiber lines within empalme Y range
  // Canvas Y-down: ymin=top, fiber lines go downward (increasing Y).
  // Magik: starts at bounds.ymax (GIS top) going down (Y decreasing). Translated to canvas.
  private _calcularGrupos(): FiberLine[] {
    const { ymin, ymax } = this._bounds;
    const height = ymax - ymin;
    const desY = height / 6;
    // empalmeH from initial empalme box: height - 2*desY - 60
    const empalmeH = height - 2 * desY - 60;

    const allFibers = this._groups.flatMap((g, gi) =>
      g.fibers.map(f => ({ fiber: f, groupIndex: gi }))
    );
    if (allFibers.length === 0) return [];

    const lodes = empalmeH / (allFibers.length + 1);
    const fibersPerGroup = this._groups[0]?.fibers.length ?? 1;
    const baseY = ymin + desY + 2;

    const lines: FiberLine[] = [];
    let poDist = lodes;
    let fiberInGroup = 0;

    for (const { fiber, groupIndex } of allFibers) {
      lines.push({
        y: baseY + poDist,
        leftColor: fiber.leftColor,
        rightColor: fiber.rightColor,
        leftAnnot: fiber.leftAnnot,
        rightAnnot: fiber.rightAnnot,
        groupIndex,
      });
      poDist += lodes;
      fiberInGroup++;
      if (fiberInGroup === fibersPerGroup) {
        poDist += 20; // gap between bundle groups
        fiberInGroup = 0;
      }
    }
    return lines;
  }

  // ajusta_empalme: tighten empalme Y bounds to actual fiber line positions ±60
  private _ajustarEmpalme(): Bounds {
    const { xmin, xmax, ymin, ymax } = this._bounds;
    const desX = (xmax - xmin) / 3;
    const exmin = xmin + desX + 90;
    const exmax = xmax - desX - 90;
    if (this._fiberLines.length === 0) {
      const desY = (ymax - ymin) / 6;
      return { xmin: exmin, xmax: exmax, ymin: ymin + desY + 30, ymax: ymax - desY - 30 };
    }
    const firstY = this._fiberLines[0].y;
    const lastY = this._fiberLines[this._fiberLines.length - 1].y;
    return { xmin: exmin, xmax: exmax, ymin: firstY - 60, ymax: lastY + 60 };
  }

  // obtiene_tubos: vertical rectangular tubes flanking the empalme
  private _obtenerTubos(): { tuboE: Bounds; tuboS: Bounds } {
    const { xmin, xmax } = this._bounds;
    const desX4 = (xmax - xmin) / 4;
    const firstY = this._fiberLines.length > 0 ? this._fiberLines[0].y : this._empalme.ymin + 60;
    const lastY = this._fiberLines.length > 0 ? this._fiberLines[this._fiberLines.length - 1].y : this._empalme.ymax - 60;
    return {
      tuboE: { xmin: xmin + 200, xmax: xmin + desX4 - 90, ymin: firstY - 100, ymax: lastY + 100 },
      tuboS: { xmin: xmax - desX4 + 90, xmax: xmax - 200, ymin: firstY - 100, ymax: lastY + 100 },
    };
  }

  // genera_forma_cables: sausage-shaped cable using Bresenham midpoint ellipse
  private _generarFormaCables(lado: boolean): Coord[] {
    const { xmin, xmax } = this._bounds;
    const desX4 = (xmax - xmin) / 4;
    const firstY = this._fiberLines.length > 0 ? this._fiberLines[0].y : this._empalme.ymin + 60;
    const lastY = this._fiberLines.length > 0 ? this._fiberLines[this._fiberLines.length - 1].y : this._empalme.ymax - 60;

    const bxmin = lado ? xmin + desX4 : xmax - desX4 - 50;
    const bxmax = lado ? xmin + desX4 + 50 : xmax - desX4;
    const coymin = firstY - 100;
    const coymax = lastY + 100;

    const xc = (bxmin + bxmax) / 2;
    const yc = (coymin + coymax) / 2;
    const rx = 110;
    const ry = (coymax - coymin) / 2;

    return this._bresenhamEllipse(xc, yc, rx, ry);
  }

  // crea_puntos: Bresenham midpoint ellipse algorithm, regions assembled clockwise
  private _bresenhamEllipse(xc: number, yc: number, rx: number, ry: number): Coord[] {
    if (ry <= 0) return [];
    const r1: Coord[] = [], r2: Coord[] = [], r3: Coord[] = [], r4: Coord[] = [];
    const add = (x: number, y: number) => {
      r1.push([xc + x, yc + y]);
      r4.push([xc - x, yc + y]);
      r2.push([xc + x, yc - y]);
      r3.push([xc - x, yc - y]);
    };

    const ry2 = ry * ry, rx2 = rx * rx;
    const dosRy2 = 2 * ry2, dosRx2 = 2 * rx2;
    let x = 0, y = ry;
    add(x, y);
    let p = Math.round(ry2 - rx2 * ry + 0.25 * rx2);
    let px = 0, py = dosRx2 * y;

    // Region 1: |slope| < 1
    while (px < py) {
      x++; px += dosRy2;
      if (p < 0) { p += ry2 + px; }
      else { y--; py -= dosRx2; p += ry2 + px - py; }
      add(x, y);
    }

    // Region 2: |slope| > 1
    p = Math.round(ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2);
    while (y > 0) {
      y--; py -= dosRx2;
      if (p > 0) { p += rx2 - py; }
      else { x++; px += dosRy2; p += rx2 - py + px; }
      add(x, y);
    }

    // Assemble: r1 forward, r2 backward, r3 forward, r4 backward (closed)
    const result: Coord[] = [...r1, ...[...r2].reverse(), ...r3, ...[...r4].reverse()];
    if (result.length > 0) result.push(result[0]);
    return result;
  }

  // draw_content_on: render empalme, tubes, cable shapes, fiber lines, group boxes
  drawOn(ctx: DrawingContext): void {
    const { xmin, xmax, ymin } = this._bounds;
    const halfW = (xmax - xmin) / 2;
    const fibersPerGroup = this._groups[0]?.fibers.length ?? 0;
    const lineSpacing = this._fiberLines.length > 1
      ? this._fiberLines[1].y - this._fiberLines[0].y
      : 20;
    const annFontSize = Math.max(6, lineSpacing * 0.5);

    // Empalme box (dashed in original)
    ctx.drawPolyline(boundsToRect(this._empalme), this._empalmeColor, 1, true);

    // Tubes
    ctx.drawPolyline(boundsToRect(this._tuboE), this._cableColor, 1);
    ctx.drawPolyline(boundsToRect(this._tuboS), this._cableColor, 1);

    // Cable shapes (Bresenham ellipses)
    ctx.drawPolyline(this._cableE, this._cableColor, 1);
    ctx.drawPolyline(this._cableS, this._cableColor, 1);

    // Fiber lines: left segment always, right segment if connected
    for (const line of this._fiberLines) {
      const { y, leftColor, rightColor, leftAnnot, rightAnnot } = line;
      ctx.drawPolyline([[xmin, y], [xmin + halfW, y]], leftColor, 1);
      ctx.drawText(leftAnnot, xmin + 15, y - 1, leftColor, annFontSize);
      if (rightColor !== undefined) {
        ctx.drawPolyline([[xmin + halfW, y], [xmax, y]], rightColor, 1);
        if (rightAnnot !== undefined) {
          ctx.drawText(rightAnnot, xmax - 80, y - 1, rightColor, annFontSize);
        }
        // connection dot at splice center
        const dotR = Math.max(1.5, lineSpacing / 7);
        ctx.drawCircleFilled(xmin + halfW, y, dotR, this._empalmeColor);
      }
    }

    // Group color boxes (dibuja_cable_horizontal)
    if (fibersPerGroup > 0) {
      for (let gi = 0; gi < this._groups.length; gi++) {
        const startIdx = gi * fibersPerGroup;
        const endIdx = Math.min(startIdx + fibersPerGroup - 1, this._fiberLines.length - 1);
        if (startIdx >= this._fiberLines.length) break;
        const topY = this._fiberLines[startIdx].y - 15;
        const botY = this._fiberLines[endIdx].y + 15;
        const label = this._groups[gi].bundleLabel;
        const labelFontSize = Math.max(5, (botY - topY) * 0.25);

        // Left group box: bounds.xmin+100 to empalme.xmin-100
        const lBox: Coord[] = [
          [xmin + 100, topY], [this._empalme.xmin - 100, topY],
          [this._empalme.xmin - 100, botY], [xmin + 100, botY],
          [xmin + 100, topY],
        ];
        ctx.drawPolyline(lBox, this._cableColor, 1);
        ctx.drawText(label, (xmin + 100 + this._empalme.xmin - 100) / 2, (topY + botY) / 2, this._cableColor, labelFontSize);

        // Right group box if any fiber in group is connected
        const hasRight = this._fiberLines.slice(startIdx, endIdx + 1).some(l => l.rightColor !== undefined);
        if (hasRight) {
          const rBox: Coord[] = [
            [this._empalme.xmax + 100, topY], [xmax - 100, topY],
            [xmax - 100, botY], [this._empalme.xmax + 100, botY],
            [this._empalme.xmax + 100, topY],
          ];
          ctx.drawPolyline(rBox, this._cableColor, 1);
          ctx.drawText(label, (this._empalme.xmax + 100 + xmax - 100) / 2, (topY + botY) / 2, this._cableColor, labelFontSize);
        }
      }
    }

    // Title (agregar_titulo, placed above diagram)
    ctx.drawText(CDiagramaConexionEmpalme.LoTitulo, xmin + halfW, ymin - 10, '#000000', 20);
  }

  get fiberLines(): readonly FiberLine[] { return this._fiberLines; }
  get empalme(): Bounds { return this._empalme; }
  get tuboE(): Bounds { return this._tuboE; }
  get tuboS(): Bounds { return this._tuboS; }
  get cableE(): readonly Coord[] { return this._cableE; }
  get cableS(): readonly Coord[] { return this._cableS; }
  get groups(): readonly FiberGroupDef[] { return this._groups; }
}
