// GIS layout table infrastructure interfaces (Fase 0 — placeholder until CTabla/CTablas are finalised)
export interface IBordesElemento {
  bordeDer: boolean
  bordeIzq: boolean
  bordeSup?: boolean
  bordeInf?: boolean
}

export interface IElementos {
  obtenerElemento(tipo: string): IBordesElemento
}

export interface ICelda {
  elemento: unknown
  elementos: IElementos
}

export interface ICeldas {
  celda(renglon: number, columna: number): ICelda
}

export interface ITabla {
  coordenadaOrigen: [number, number]
  renglones: { elemento(n: number): { longitud: number } }
  columnas: { elemento(n: number): { longitud: number } }
  celdas: ICeldas
}

export interface ITablas {
  crearTabla(renglones: number, columnas: number, nombre: string): ITabla
  elemento(nombre: string): ITabla
  desplegar(window: unknown): void
}

export abstract class CBaseSello {
  protected _tablas!: ITablas
  protected _window: unknown
  protected _coordInicio: [number, number] = [0, 0]
  protected _colorLinea: unknown
  protected _origenXml = false
  protected _viewportPrincipal: unknown

  inicializar(properties: unknown[]): void {
    if (properties.length === 1) {
      this._coordInicio = [0, 0]
      // Fase 0 TODO: this._tablas = new CTablas(this)
      this.configurarTabla()
      this.etiquetarCeldas()
    } else {
      this._origenXml = true
    }
  }

  get tablas(): ITablas { return this._tablas }
  set tablas(value: ITablas) { this._tablas = value }

  actualizarDatos(): void {
    this.llenarDatosCeldas()
    this.drawContentOn(this._window)
  }

  drawContentOn(window: unknown): void {
    this._window = window
    this.llenarDatosDinamicos()
    this._tablas.desplegar(window)
  }

  protected configurarTabla(): void {
    const tabla = this._tablas.crearTabla(1, 1, 'tabla')
    tabla.coordenadaOrigen = this._coordInicio
    tabla.renglones.elemento(1).longitud = 10
    tabla.columnas.elemento(1).longitud = 10
  }

  etiquetarCeldas(): void {}
  llenarDatosCeldas(): void {}
  protected llenarDatosDinamicos(): void {}
}
