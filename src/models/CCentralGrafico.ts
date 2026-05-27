// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_central_grafico.magik

export interface CentralRecord {
  'user!_siglas': string | undefined;
}

export interface Bounds {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

type Coord = [number, number];

interface TextStyleConfig {
  fontSize: number;
  color: string;
}

interface Anotacion {
  texto: string;
  estilo: TextStyleConfig;
  ubicacion: Coord;
}

export class CCentralGrafico {
  private _sectors: Array<Array<Coord>>;
  private _anotacion: Anotacion;
  private _central: CentralRecord;
  private _color: string;

  constructor(central: CentralRecord, bounds: Bounds, color?: string) {
    this._color = color ?? 'black';
    this._sectors = [];
    this._central = central;

    this._sectors.push(this._crearSector(bounds));

    const [s1, s2, s3] = this._crearLineasInteriores(bounds);
    this._sectors.push(s1);
    this._sectors.push(s2);
    this._sectors.push(s3);

    this._anotacion = this._crearAnotacion(bounds);
  }

  private _crearAnotacion(bounds: Bounds): Anotacion {
    const siglas = this._central['user!_siglas'] ?? '';
    const texto = 'CTL-' + siglas;

    const fontSize = (bounds.xmax - bounds.xmin) / 3;

    const desplazaX = (bounds.xmax - bounds.xmin) / 2;
    const desplazaY = (bounds.ymax - bounds.ymin) / 2;

    return {
      texto,
      estilo: { fontSize, color: this._color },
      ubicacion: [bounds.xmin + desplazaX, bounds.ymin - desplazaY],
    };
  }

  // Returns 3 diagonal sectors that create a hatch pattern inside the box.
  private _crearLineasInteriores(bounds: Bounds): [Array<Coord>, Array<Coord>, Array<Coord>] {
    const rango = 2.5;
    const w = bounds.xmax - bounds.xmin;
    const h = bounds.ymax - bounds.ymin;

    const sec1: Array<Coord> = [
      [bounds.xmin, bounds.ymin],
      [bounds.xmax, bounds.ymax],
    ];
    const sec2: Array<Coord> = [
      [bounds.xmin, bounds.ymin + h / rango],
      [bounds.xmax - w / rango, bounds.ymax],
    ];
    const sec3: Array<Coord> = [
      [bounds.xmin + w / rango, bounds.ymin],
      [bounds.xmax, bounds.ymax - h / rango],
    ];

    return [sec1, sec2, sec3];
  }

  private _crearSector(bounds: Bounds): Array<Coord> {
    return [
      [bounds.xmin, bounds.ymin],
      [bounds.xmin, bounds.ymax],
      [bounds.xmax, bounds.ymax],
      [bounds.xmax, bounds.ymin],
      [bounds.xmin, bounds.ymin],
    ];
  }

  despliega(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this._color;
    ctx.lineWidth = 1;
    this._drawSectors(ctx);
    this.dibujarAnotacion(ctx);
  }

  private _drawSectors(ctx: CanvasRenderingContext2D): void {
    for (const sector of this._sectors) {
      if (sector.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(sector[0][0], sector[0][1]);
      for (const coord of sector.slice(1)) {
        ctx.lineTo(coord[0], coord[1]);
      }
      ctx.stroke();
    }
  }

  dibujarAnotacion(ctx: CanvasRenderingContext2D): void {
    const { estilo, ubicacion, texto } = this._anotacion;
    const px = Math.min(Math.max(9, Math.round(estilo.fontSize)), 16);
    ctx.save();
    ctx.fillStyle = estilo.color;
    ctx.font = `bold ${px}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(texto, ubicacion[0], ubicacion[1]);
    ctx.restore();
  }

  getCentral(): CentralRecord {
    return this._central;
  }

  getSectors(): Array<Array<Coord>> {
    return this._sectors;
  }
}
