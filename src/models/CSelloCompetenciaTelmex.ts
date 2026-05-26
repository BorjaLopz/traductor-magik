import { CBaseSelloFibra } from './CBaseSelloFibra'

export interface CompetenciaData {
  predDeshabitado: string
  tvSatelital:     string
  tvCable:         string
  operteles:       string
  opertelesInalam: string
  telmexInalam:    string
  telPubCompet:    string
  casetaLadafon:   string
  casetaLadatel:   string
  solicitud:       string
  idEdificio?:     number
}

export const COMPETENCIA_DEFAULT: CompetenciaData = {
  predDeshabitado: '',
  tvSatelital:     '',
  tvCable:         '',
  operteles:       '',
  opertelesInalam: '',
  telmexInalam:    '',
  telPubCompet:    '',
  casetaLadafon:   '',
  casetaLadatel:   '',
  solicitud:       '',
}

const T = 'tbl_contenido'
const NEGRO:      [number, number, number] = [0,      0,      0     ]
const AZUL_DARK:  [number, number, number] = [0.0598, 0.0598, 0.409 ]
const AZUL:       [number, number, number] = [0,      0,      1     ]
const VERDE_DARK: [number, number, number] = [0,      0.2953, 0     ]

const LABELS: [string, [number, number, number]][] = [
  ['PREDIO DESHABITADO',    NEGRO     ],
  ['TELEVISION SATELITAL',  NEGRO     ],
  ['TELEVISION/CABLE',      NEGRO     ],
  ['OPERTELES',             AZUL_DARK ],
  ['INALAMBRICA OPERTELES', AZUL_DARK ],
  ['INALAMBRICA TELMEX',    NEGRO     ],
  ['TEL/PUB COMPET.',       AZUL      ],
  ['CASETA LADAFON',        NEGRO     ],
  ['CASETA LADATEL',        VERDE_DARK],
  ['SOLICITUD',             NEGRO     ],
]

const SYMBOL_NAMES = [
  'p_predio_deshabitado',
  'p_tv_satelital',
  'p_tv_por_cable',
  'p_operteles',
  'p_operteles_inalambrica',
  'p_telmex_inalambrica',
  'p_telpub_compet',
  'p_caseta_ladafon',
  'p_caseta_ladatel',
  'p_solicitud',
]

export class CSelloCompetenciaTelmex extends CBaseSelloFibra {
  private _data: CompetenciaData

  constructor(data: CompetenciaData = COMPETENCIA_DEFAULT) {
    super()
    this._data = { ...data }
  }

  protected override configurarTabla(): void {
    const tabla = this._tablas.crearTabla(10, 3, T)
    tabla.coordenadaOrigen = this._coordInicio

    for (let r = 1; r <= 10; r++) tabla.renglones.elemento(r).longitud = 6
    tabla.columnas.elemento(1).longitud = 10
    tabla.columnas.elemento(2).longitud = 27
    tabla.columnas.elemento(3).longitud = 7

    const allRows10 = Array.from({ length: 10 }, (_, i) => [i + 1, 2] as [number, number])
    const col1Rows  = Array.from({ length: 10 }, (_, i) => [i + 1, 1] as [number, number])
    const rows1to9  = [
      ...Array.from({ length: 9 }, (_, i) => [i + 1, 1] as [number, number]),
      ...Array.from({ length: 9 }, (_, i) => [i + 1, 2] as [number, number]),
      ...Array.from({ length: 9 }, (_, i) => [i + 1, 3] as [number, number]),
    ]

    this.ocultarBordesCeldas(tabla, {
      borderDerIzq: allRows10,
      borderDer:    col1Rows,
      borderInf:    rows1to9,
    })
  }

  override etiquetarCeldas(): void {
    for (let row = 1; row <= 10; row++) {
      // Col 1: symbol placeholder (GIS symbol — stub in showcase)
      this.asignarSimboloCelda(T, row, 1, SYMBOL_NAMES[row - 1]!, 1)

      // Col 2: label with color
      const [label, color] = LABELS[row - 1]!
      this.asignarTextoCelda(T, row, 2, label, 20, 'centre_centre', 0, color)
    }
    this.llenarDatosCeldas()
  }

  override llenarDatosCeldas(): void {
    // TODO(GIS): fetch from gis_program_manager.cached_dataset(:gis)[:user!_building][idEdificio]
    const values = [
      this._data.predDeshabitado,
      this._data.tvSatelital,
      this._data.tvCable,
      this._data.operteles,
      this._data.opertelesInalam,
      this._data.telmexInalam,
      this._data.telPubCompet,
      this._data.casetaLadafon,
      this._data.casetaLadatel,
      this._data.solicitud,
    ]
    for (let row = 1; row <= 10; row++) {
      this.asignarTextoCelda(T, row, 3, values[row - 1] ?? '', 20, 'centre_centre', 0, NEGRO)
    }
  }

  setData(data: Partial<CompetenciaData>): void {
    this._data = { ...this._data, ...data }
  }
}
