// Source: planos_fo/source/montaje_tba/factory/c_cable_fo.magik

export interface FiberOwnerRecord {
  'user!_cuenta': string | undefined;
}

export interface PinRecord {
  bundle_number: string;
  fiber_number: number;
  fiber_owner_record: FiberOwnerRecord | undefined;
}

export interface SheathRecord {
  obtenerPines(n?: number): Array<PinRecord>;
  mit_sheath_pins: { size: number };
}

export interface FibraFO {
  description: string;
  fiber: PinRecord;
}

export interface GrupoFO {
  description: string | undefined;
  numero: string | undefined;
  fibras: Array<FibraFO>;
}

export class CCableFo {
  private _sheath: SheathRecord;
  private _grupos: Array<GrupoFO>;
  private _fibras: Array<PinRecord>;

  constructor(cable: SheathRecord, extremo?: boolean) {
    this._sheath = cable;
    this._fibras = extremo
      ? this._sheath.obtenerPines(this._sheath.mit_sheath_pins.size)
      : this._sheath.obtenerPines();
    this._grupos = this._crearGrupos();
  }

  private _crearGrupos(): Array<GrupoFO> {
    const grupos: Array<GrupoFO> = [];
    let numGrupo = '1';
    let grupo: GrupoFO = { description: undefined, numero: undefined, fibras: [] };

    for (const e of this._fibras) {
      if (e.bundle_number !== numGrupo) {
        grupo.description = this._descripcionGrupo(grupo);
        grupo.numero = numGrupo;
        grupos.push(grupo);
        numGrupo = e.bundle_number;
        grupo = { description: undefined, numero: undefined, fibras: [] };
        grupo.fibras.push({ description: this.descripcionFibra(e), fiber: e });
      } else {
        grupo.fibras.push({ description: this.descripcionFibra(e), fiber: e });
      }
    }

    grupo.description = this._descripcionGrupo(grupo);
    grupo.numero = numGrupo;
    grupos.push(grupo);

    return grupos;
  }

  descripcionFibra(pin: PinRecord): string {
    let description = `FO No.${pin.fiber_number}`;
    const rec = pin.fiber_owner_record;
    if (rec !== undefined) {
      description += ` = ${rec['user!_cuenta'] ?? ''}`;
    }
    return description;
  }

  private _descripcionGrupo(grupo: GrupoFO): string {
    const atts: Array<FiberOwnerRecord> = [];
    let descripcion = `${grupo.fibras.length} F.O. `;

    for (const f of grupo.fibras) {
      const rec = f.fiber.fiber_owner_record;
      if (rec !== undefined) {
        atts.push(rec);
      }
    }

    const collAtt = atts.filter(r => r['user!_cuenta'] !== undefined);

    if (collAtt.length === 1) {
      descripcion += collAtt[0]['user!_cuenta'] ?? '';
    } else if (collAtt.length > 1) {
      descripcion += `${collAtt[0]['user!_cuenta'] ?? ''}-${collAtt[collAtt.length - 1]['user!_cuenta'] ?? ''}`;
    }

    return descripcion;
  }

  getGrupos(): Array<GrupoFO> {
    return this._grupos;
  }

  getGrupoFibra(pin: PinRecord): GrupoFO | undefined {
    if (!this._fibras.includes(pin)) return undefined;
    return this._grupos.find(g => g.numero === pin.bundle_number);
  }

  getSheath(pin: PinRecord): SheathRecord | undefined {
    if (this._fibras.includes(pin)) return this._sheath;
    return undefined;
  }
}
