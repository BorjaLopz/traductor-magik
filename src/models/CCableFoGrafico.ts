// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_cable_fo_grafico.magik

export type Direction = 'right' | 'left' | 'up' | 'down';

export interface CableMedido {
  value: number;
  unit: { Short_description: string };
}

export interface SpecRecord {
  'user!_clase': string;
  fiber_quantity: number | string;
}

export interface CableGraficoRecord {
  'user!_km_real_medido': CableMedido;
  spec_id: string | number;
  get_spec_record(): SpecRecord;
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
  direccion: Direction;
  estilo: TextStyleConfig;
  ubicacion: Coord;
}

export class CCableFoGrafico {
  private _sectors: Array<Array<Coord>>;
  private _anotacion: Anotacion;
  private _cable: CableGraficoRecord;
  private _color: string;
  private _inicio: boolean = false;

  constructor(cable: CableGraficoRecord, bounds: Bounds, direction: Direction, color?: string) {
    this._color = color ?? 'black';
    this._sectors = [];
    this._cable = cable;
    this._sectors.push(this._crearSector(bounds, direction));
    this._anotacion = this._crearAnotacion(bounds, direction);
  }

  get inicio(): boolean { return this._inicio; }
  set inicio(v: boolean) { this._inicio = v; }

  private _crearAnotacion(bounds: Bounds, direction: Direction): Anotacion {
    const longitud = this._cable['user!_km_real_medido'].value;
    const unidad = this._cable['user!_km_real_medido'].unit.Short_description;
    const texto = longitud.toFixed(2) + ' ' + unidad;

    const x = bounds.xmax - (bounds.xmax - bounds.xmin) / 2;
    const y = bounds.ymax - (bounds.ymax - bounds.ymin) / 2;

    let fontSize: number;
    if (direction === 'right' || direction === 'left') {
      fontSize = (bounds.ymax - bounds.ymin) / 2;
    } else {
      fontSize = ((bounds.xmax - bounds.xmin) / (bounds.ymax - bounds.ymin)) / 3;
    }

    return {
      texto,
      direccion: direction,
      estilo: { fontSize, color: this._color },
      ubicacion: [x, y],
    };
  }

  private _crearSector(bounds: Bounds, direction: Direction): Array<Coord> {
    const sector: Array<Coord> = [];

    if (direction === 'right') {
      const y = bounds.ymax - (bounds.ymax - bounds.ymin) / 2;
      sector.push([bounds.xmin, y]);
      sector.push([bounds.xmax, y]);
    } else if (direction === 'left') {
      const y = bounds.ymax - (bounds.ymax - bounds.ymin) / 2;
      sector.push([bounds.xmax, y]);
      sector.push([bounds.xmin, y]);
    } else if (direction === 'down') {
      const x = bounds.xmax - (bounds.xmax - bounds.xmin) / 2;
      sector.push([x, bounds.ymax]);
      sector.push([x, bounds.ymin]);
    } else {
      // up
      const x = bounds.xmax - (bounds.xmax - bounds.xmin) / 2;
      sector.push([x, bounds.ymin]);
      sector.push([x, bounds.ymax]);
    }

    return sector;
  }

  despliega(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this._color;
    ctx.lineWidth = 2;
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
    const { estilo, ubicacion, direccion, texto } = this._anotacion;
    const angle = direccion === 'right' || direccion === 'left' ? 0 : Math.PI / 2;
    this._drawText(ctx, estilo, ubicacion[0], ubicacion[1], texto, angle);
    this.dibujarAnotacionCabIntermedia(ctx);
  }

  dibujarAnotacionCabIniFin(ctx: CanvasRenderingContext2D): void {
    const { estilo, ubicacion } = this._anotacion;
    const spec = this._cable.get_spec_record();
    const clase = spec['user!_clase'];
    const cantidad = String(spec.fiber_quantity);
    const prefix = this._inicio ? 'Cable de salida: ' : 'Cable de llegada: ';
    const texto = prefix + cantidad + 'FO ' + clase;
    this._drawText(ctx, estilo, ubicacion[0], ubicacion[1] - 110, texto, 0);
  }

  dibujarAnotacionCabIntermedia(ctx: CanvasRenderingContext2D): void {
    const { estilo, ubicacion } = this._anotacion;
    const spec = this._cable.get_spec_record();
    const clase = spec['user!_clase'];
    const cantidad = String(spec.fiber_quantity);
    const texto = cantidad + 'FO ' + clase;
    this._drawText(ctx, estilo, ubicacion[0], ubicacion[1] - 15, texto, 0);
  }

  // fontSize from _crearAnotacion is in map units; clamp to readable px range for canvas.
  private _drawText(
    ctx: CanvasRenderingContext2D,
    estilo: TextStyleConfig,
    x: number,
    y: number,
    texto: string,
    angle: number,
  ): void {
    const px = Math.min(Math.max(9, Math.round(estilo.fontSize)), 16);
    ctx.save();
    ctx.fillStyle = estilo.color;
    ctx.font = `bold ${px}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(texto, 0, 0);
    ctx.restore();
  }

  getCable(): CableGraficoRecord {
    return this._cable;
  }
}
