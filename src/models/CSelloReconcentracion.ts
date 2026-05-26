import { CBaseSelloCobre } from './CBaseSelloCobre'
import { CTextoGrafico } from '../gis/CTextoGrafico'

export interface UcItem {
  cantidad: number
}

// Key is a tuple where index 0 is the cable-type code (e.g. 'CALEAE')
type UcEntry = [string[], UcItem]

export class CSelloReconcentracion extends CBaseSelloCobre {
  private _etiquetas: string[][] = []

  protected override configurarTabla(): void {
    const nRenglones = 11
    const nColumnas = 8

    const tabla = this._tablas.crearTabla(nRenglones, nColumnas, 'tbl_reconcentracion')
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = 10
    for (let r = 2; r <= nRenglones; r++) {
      tabla.renglones.elemento(r).longitud = 5
    }

    for (let c = 1; c <= nColumnas; c++) {
      tabla.columnas.elemento(c).longitud = 13
    }

    // Hide right border on row 1 for all columns except last
    for (let pos = 1; pos <= nColumnas - 1; pos++) {
      const bordes = tabla.celdas.celda(1, pos).elementos.obtenerElemento('bordes_celda')
      bordes.bordeDer = false
    }

    // Hide right border on row 2 for odd columns
    for (let pos = 1; pos <= Math.floor(nColumnas / 2); pos++) {
      const bordes = tabla.celdas.celda(2, 2 * pos - 1).elementos.obtenerElemento('bordes_celda')
      bordes.bordeDer = false
    }
  }

  override etiquetarCeldas(): void {
    const celdas = this._tablas.elemento('tbl_reconcentracion').celdas

    const titulo = new CTextoGrafico('TABLA DE BAJANTES')
    titulo.tamanio = 40
    titulo.margenIzq = 13
    celdas.celda(1, 4).elemento = titulo

    // Row 2: group headers (Magik: keys_and_elements → 1-based n)
    const gruposHeader = ['Precableado', 'Reconcentración', 'Reconexión', 'Rehabilitación']
    gruposHeader.forEach((valor, idx) => {
      const n = idx + 1
      const texto = new CTextoGrafico(valor)
      texto.tamanio = 20
      texto.margenIzq = 13
      celdas.celda(2, 2 * n - 1).elemento = texto
    })

    // Row 3: UC / Total subheader repeated for each of 4 groups
    for (let pos = 1; pos <= 4; pos++) {
      const textoUc = new CTextoGrafico('UC')
      textoUc.tamanio = 20
      celdas.celda(3, 2 * pos - 1).elemento = textoUc

      const textoTotal = new CTextoGrafico('Total')
      textoTotal.tamanio = 20
      celdas.celda(3, 2 * pos).elemento = textoTotal
    }

    // Rows 4–11: category codes per group — stored in _etiquetas[0..3] for llenarDatosCeldas
    this._etiquetas[0] = ['CALEAE', 'CACLAE', 'CALEFA', 'CACLFA', 'CALEED', 'CACLED', 'CALESU', 'CACLSU']
    this._etiquetas[0].forEach((valor, idx) => {
      const texto = new CTextoGrafico(valor)
      texto.tamanio = 20
      celdas.celda(4 + idx, 1).elemento = texto
    })

    this._etiquetas[1] = ['CARSAE', 'CARSFA', 'CARSED', 'CARSSU', 'CARCAE', 'CARCFA', 'CARCED', 'CARCSU']
    this._etiquetas[1].forEach((valor, idx) => {
      const texto = new CTextoGrafico(valor)
      texto.tamanio = 20
      celdas.celda(4 + idx, 3).elemento = texto
    })

    this._etiquetas[2] = ['CAA014', 'CAS014']
    this._etiquetas[2].forEach((valor, idx) => {
      const texto = new CTextoGrafico(valor)
      texto.tamanio = 20
      celdas.celda(4 + idx, 5).elemento = texto
    })

    this._etiquetas[3] = ['CARLAE', 'DADLAE', 'CARLED', 'DADLED', 'CARLFA', 'DADLFA', 'CARLSU', 'DADLSU']
    this._etiquetas[3].forEach((valor, idx) => {
      const texto = new CTextoGrafico(valor)
      texto.tamanio = 20
      celdas.celda(4 + idx, 7).elemento = texto
    })
  }

  override llenarDatosCeldas(): void {
    const celdas = this._tablas.elemento('tbl_reconcentracion').celdas

    // totalUcs[groupIdx][rowIdx] accumulates UC quantities per code per group
    const totalUcs: (number | undefined)[][] = Array.from({ length: 4 }, () =>
      new Array<number | undefined>(8).fill(undefined)
    )

    for (const [llave, elemento] of this.ucs()) {
      const codigo = llave[0]
      for (let n = 0; n < 4; n++) {
        const idx = this._etiquetas[n].indexOf(codigo)
        if (idx !== -1) {
          const current = totalUcs[n][idx]
          totalUcs[n][idx] = current === undefined ? elemento.cantidad : current + elemento.cantidad
          break
        }
      }
    }

    for (let n = 0; n < 4; n++) {
      // Group 2 (index 2) only has 2 codes; others have 8
      const nColumnas = n !== 2 ? 8 : 2
      for (let m = 0; m < nColumnas; m++) {
        const val = totalUcs[n][m]
        const texto = new CTextoGrafico(val !== undefined ? Math.floor(val).toString() : '0')
        texto.tamanio = 20
        // Cell col: 2*(n+1) — even column holds the UC total value for that group
        celdas.celda(4 + m, 2 * (n + 1)).elemento = texto
      }
    }
  }

  // Queries active GIS district bajantes and aggregates UC elements via c_administrador_costeo.
  // Fase 5 TODO: inject GIS services (swgDsnAdminEngine, gisProgramManager, CAdministradorCosteo)
  ucs(): UcEntry[] {
    throw new Error('ucs(): requires GIS runtime — implement in Fase 5')
  }
}
