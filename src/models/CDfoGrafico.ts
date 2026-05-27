// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_dfo_grafico.magik

export type Coord = [number, number];
export interface Bounds { xmin: number; xmax: number; ymin: number; ymax: number; }
export type Direction = 'up' | 'down';

export interface DfoLike {
  all_rme_port_components(): { size: number };
  obtenerlenguajecomun(): string;
  owner: { owner: { obtenernumerodepiso(): string; obtenertiposala(): string } };
}

export interface DrawingContext {
  drawPolyline(coords: Coord[], color: string, width: number): void;
  drawCircleFilled(cx: number, cy: number, r: number, color: string): void;
  drawText(text: string, x: number, y: number, color: string, fontSize: number): void;
}

interface Anotacion {
  texto: string;
  fontSize: number;
  ubicacion: Coord;
}

interface Puerto {
  texto: string;
  fontSize: number;
  ubicacion: Coord;
}

interface Terminal {
  texto: string;
  fontSize: number;
  ubicacion: Coord;
  anota: Coord;
  radio: number;
}

export class CDfoGrafico {
  private readonly _sectors: Coord[][];
  private readonly _anotacion: Anotacion;
  private readonly _puertos: Puerto[];
  private readonly _terminal: Terminal;
  private readonly _dfo: DfoLike;
  private readonly _color: string;

  constructor(dfo: DfoLike, bounds: Bounds, direction: Direction, no: number, color = '#000000') {
    this._color = color;
    this._dfo = dfo;
    this._puertos = [];
    this._sectors = [];

    this._sectors.push(this._crearSector(bounds));

    for (const l of this._crearLineasInteriores(bounds)) {
      this._sectors.push(l);
    }

    this._terminal = this._crearTerminal(bounds, direction, no);

    for (const l of this._crearLineasTerminal(bounds, direction)) {
      this._sectors.push(l);
    }

    this._anotacion = this._crearAnotacion(bounds);
  }

  private _crearSector(bounds: Bounds): Coord[] {
    const { xmin, xmax, ymin, ymax } = bounds;
    return [[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin], [xmin, ymin]];
  }

  private _crearAnotacion(bounds: Bounds): Anotacion {
    const { xmin, xmax, ymin, ymax } = bounds;
    const fontSize = (xmax - xmin) / 15;
    const despX = (xmax - xmin) / 2;
    const despY = (ymax - ymin) / 2;
    return {
      texto: '',
      fontSize,
      ubicacion: [xmin + despX - 100, ymin + despY * 2.4],
    };
  }

  private _crearLineasInteriores(bounds: Bounds): Coord[][] {
    const { xmin, xmax, ymin, ymax } = bounds;
    const result: Coord[][] = [];
    const nPorts = this._dfo.all_rme_port_components().size;
    if (nPorts <= 0) return result;

    const lx1 = (xmax - xmin) / 10;
    const lx2 = (xmax - xmin) / 2.5;
    const nLines = Math.round(nPorts / 4 + 1);
    const loY = (ymax - ymin) / (nLines * 8);
    const loXTitulo = (xmax - xmin) / 4;
    const loAncho = (ymax - ymin) / nLines;
    let loInicio = ymax - loAncho;

    let fontSize = (ymax - ymin) / (nLines * 1.5);
    if (nPorts === 96) fontSize = (ymax - ymin) / (nLines * 1.2);

    this._puertos.push({ texto: 'A', fontSize, ubicacion: [xmin + loXTitulo, loInicio + loY] });
    this._puertos.push({ texto: 'B', fontSize, ubicacion: [xmin + 3 * loXTitulo, loInicio + loY] });

    let loPto = 1;
    let loPtoSig = Math.floor(nPorts / 2) + 1;

    for (let i = 1; i <= nLines; i++) {
      result.push([[xmin, loInicio], [xmax, loInicio]]);

      if (i > 1) {
        this._puertos.push({ texto: String(loPto), fontSize, ubicacion: [xmin + lx1, loInicio + loY] });
        loPto++;
        this._puertos.push({ texto: String(loPto), fontSize, ubicacion: [xmin + lx2, loInicio + loY] });
        loPto++;
        this._puertos.push({ texto: String(loPtoSig), fontSize, ubicacion: [xmin + lx2 + 2 * lx1, loInicio + loY] });
        loPtoSig++;
        this._puertos.push({ texto: String(loPtoSig), fontSize, ubicacion: [xmin + lx2 * 2 + lx1, loInicio + loY] });
        loPtoSig++;
      }

      loInicio -= loAncho;
    }

    const cx = xmin + (xmax - xmin) / 2;
    result.push([[cx, ymax], [cx, ymin]]);

    return result;
  }

  private _crearTerminal(bounds: Bounds, direction: Direction, no: number): Terminal {
    const { xmin, xmax, ymin, ymax } = bounds;
    const h = ymax - ymin;
    const loX = xmin + (xmax - xmin) / 2;
    let loY: number;
    let anotaY: number;

    if (direction === 'up') {
      loY = ymin - h / 3;
      anotaY = loY + 20;
    } else {
      loY = ymax + h / 3;
      anotaY = loY - 60;
    }

    return {
      texto: `ET ${no}`,
      fontSize: 40,
      ubicacion: [loX, loY],
      anota: [loX, anotaY],
      radio: (xmax - xmin) / 30,
    };
  }

  private _crearLineasTerminal(bounds: Bounds, direction: Direction): Coord[][] {
    const { xmin, xmax, ymin, ymax } = bounds;
    const coordT = this._terminal.ubicacion;
    const espacio = (xmax - xmin) / 9;
    const lx1 = xmin - espacio;
    const lx2 = xmax + espacio;
    let loY: number;
    let loYInicio: number;

    if (direction === 'up') {
      loY = ymin;
      loYInicio = coordT[1] - espacio * 6.05;
    } else {
      loY = ymax;
      loYInicio = coordT[1] + espacio * 6.05;
    }

    return [
      [coordT, [lx1, loY]],
      [coordT, [lx2, loY]],
      [[lx1, ymin], [lx1, ymax]],
      [[lx2, ymin], [lx2, ymax]],
      [coordT, [coordT[0], loYInicio]],
    ];
  }

  drawOn(ctx: DrawingContext): void {
    for (const sec of this._sectors) {
      ctx.drawPolyline(sec, this._color, 2);
    }
    this._dibujarPuertos(ctx);
    this._dibujarTerminal(ctx);
    this._dibujarAnotacion(ctx);
  }

  private _dibujarAnotacion(ctx: DrawingContext): void {
    const { ubicacion, fontSize } = this._anotacion;
    ctx.drawText(`DFO : ${this._dfo.obtenerlenguajecomun()}`, ubicacion[0], ubicacion[1], this._color, fontSize);
    ctx.drawText(`Piso : ${this._dfo.owner.owner.obtenernumerodepiso()}`, ubicacion[0], ubicacion[1] - 50, this._color, fontSize);
    ctx.drawText(`Sala : ${this._dfo.owner.owner.obtenertiposala()}`, ubicacion[0], ubicacion[1] - 100, this._color, fontSize);
  }

  private _dibujarPuertos(ctx: DrawingContext): void {
    if (this._puertos.length <= 2) return;
    for (const p of this._puertos) {
      ctx.drawText(p.texto, p.ubicacion[0], p.ubicacion[1], this._color, p.fontSize);
    }
  }

  private _dibujarTerminal(ctx: DrawingContext): void {
    const { ubicacion, anota, radio, texto, fontSize } = this._terminal;
    ctx.drawCircleFilled(ubicacion[0], ubicacion[1], radio, this._color);
    ctx.drawText(texto, anota[0], anota[1], this._color, fontSize);
  }

  get sectors(): Coord[][] { return this._sectors; }
  get puertos(): Puerto[] { return this._puertos; }
  get terminal(): Terminal { return this._terminal; }
  get anotacion(): Anotacion { return this._anotacion; }
}
