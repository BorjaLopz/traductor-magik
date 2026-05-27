// Source: planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_cliente_grafico.magik

export interface ClienteRelatedRecord {
  txt_nom_cliente: string | undefined;
}

export interface ClienteRecord {
  name: string | undefined;
  'user!_clientes': { an_element(): ClienteRelatedRecord | undefined };
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
  nomTexto: string;
  estilo: TextStyleConfig;
  ubicacion: Coord;
  nomUbica: Coord;
}

export class CClienteGrafico {
  private _sectors: Array<Array<Coord>>;
  private _anotacion: Anotacion;
  private _cliente: ClienteRecord;
  private _color: string;

  constructor(cliente: ClienteRecord, bounds: Bounds, color?: string) {
    this._color = color ?? 'black';
    this._sectors = [];
    this._cliente = cliente;

    this._sectors.push(this._crearSector(bounds));
    this._sectors.push(this._crearLineasInteriores(bounds));
    this._anotacion = this._crearAnotacion(bounds);
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

  private _crearLineasInteriores(bounds: Bounds): Array<Coord> {
    return [
      [bounds.xmin, bounds.ymin],
      [bounds.xmax, bounds.ymax],
    ];
  }

  private _crearAnotacion(bounds: Bounds): Anotacion {
    const cli = this._cliente['user!_clientes'].an_element();
    const nomCliente = cli?.txt_nom_cliente ?? '';
    const texto = this._cliente.name ?? '';

    const fontSize = (bounds.xmax - bounds.xmin) / 3;
    const desplazaX = (bounds.xmax - bounds.xmin) / 2;
    const desplazaY = (bounds.ymax - bounds.ymin) / 2;

    const ubicacion: Coord = [bounds.xmin + desplazaX, bounds.ymin - desplazaY];
    const nomUbica: Coord = [ubicacion[0] + desplazaX, ubicacion[1] - desplazaY];

    return {
      texto,
      nomTexto: nomCliente,
      estilo: { fontSize, color: this._color },
      ubicacion,
      nomUbica,
    };
  }

  dibujarAnotacion(ctx: CanvasRenderingContext2D): void {
    const { estilo, ubicacion, nomUbica, texto, nomTexto } = this._anotacion;
    const px = Math.min(Math.max(9, Math.round(estilo.fontSize)), 16);
    ctx.save();
    ctx.fillStyle = estilo.color;
    ctx.font = `bold ${px}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(texto, ubicacion[0], ubicacion[1]);
    if (nomTexto) ctx.fillText(nomTexto, nomUbica[0], nomUbica[1]);
    ctx.restore();
  }

  despliega(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this._color;
    ctx.lineWidth = 1;
    for (const sector of this._sectors) {
      if (sector.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(sector[0][0], sector[0][1]);
      for (const coord of sector.slice(1)) {
        ctx.lineTo(coord[0], coord[1]);
      }
      ctx.stroke();
    }
    this.dibujarAnotacion(ctx);
  }

  getCliente(): ClienteRecord {
    return this._cliente;
  }

  getSectors(): Array<Array<Coord>> {
    return this._sectors;
  }
}
