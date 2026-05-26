import { CElementoGrafico } from '../models/CElementoGrafico'

export class CTextoGrafico extends CElementoGrafico {
  private _texto: string
  private _orientacion: string | undefined
  private _alineacion: string | undefined
  private _tamanio: number = 0
  private _estilo: string | undefined
  private _color: string | undefined
  private _subrayado: boolean | undefined
  private _grados: number | undefined

  constructor(texto: string) {
    super()
    this._texto = texto
  }

  get texto(): string              { return this._texto }
  set texto(v: string)             { this._texto = v }

  get tamanio(): number            { return this._tamanio }
  set tamanio(v: number)           { this._tamanio = v }

  get orientacion(): string | undefined   { return this._orientacion }
  set orientacion(v: string | undefined)  { this._orientacion = v }

  get alineacion(): string | undefined    { return this._alineacion }
  set alineacion(v: string | undefined)   { this._alineacion = v }

  get estilo(): string | undefined        { return this._estilo }
  set estilo(v: string | undefined)       { this._estilo = v }

  get color(): string | undefined         { return this._color }
  set color(v: string | undefined)        { this._color = v }

  get subrayado(): boolean | undefined    { return this._subrayado }
  set subrayado(v: boolean | undefined)   { this._subrayado = v }

  get grados(): number | undefined        { return this._grados }
  set grados(v: number | undefined)       { this._grados = v }
}
