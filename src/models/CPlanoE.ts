// Source: adiciones_layout/source/Sellos/Entidad/c_plano_e.magik

export interface PlanoRecord {
  'user!_proyecto': string;
  'user!_nombre': string;
  'user!_tipo': string;
  'user!_comentario': string | undefined;
}

export class CPlanoE {
  private readonly _proyecto: string;
  private readonly _nombre: string;
  private readonly _tipo: string;
  private readonly _comentario: string | undefined;

  constructor(poPlano: PlanoRecord) {
    this._proyecto   = poPlano['user!_proyecto'];
    this._nombre     = poPlano['user!_nombre'];
    this._tipo       = poPlano['user!_tipo'];
    this._comentario = poPlano['user!_comentario'];
  }

  get proyecto(): string             { return this._proyecto; }
  get nombre(): string               { return this._nombre; }
  get tipo(): string                 { return this._tipo.toUpperCase(); } // Magik: .sTipo.uppercase
  get comentario(): string | undefined { return this._comentario; }
}
