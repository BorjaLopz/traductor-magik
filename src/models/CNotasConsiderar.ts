// Source: planos_fo/source/montaje_tba/sellos/c_notas_considerar.magik
// Sello that renders the "NOTAS A CONSIDERAR" block for TBA installation plans.
// Extends CBaseSelloFibra (no additional slots). Fully static — no GIS data.
//
// Table layout (tbl_notas_considerar):
//   9 rows × 2 columns
//   Row heights (mm): 7, 6, 8, 5, 5, 8, 8, 14, 5
//   Col widths  (mm): col1=8, col2=95
//   Border hiding on (1,1) and (1,2): right + left + top hidden

import { CBaseSelloFibra } from './CBaseSelloFibra'

export class CNotasConsiderar extends CBaseSelloFibra {
  override configurarTabla(): void {
    const tabla = this._tablas.crearTabla(9, 2, 'tbl_notas_considerar')
    tabla.coordenadaOrigen = this._coordInicio

    tabla.renglones.elemento(1).longitud = 7
    tabla.renglones.elemento(2).longitud = 6
    tabla.renglones.elemento(3).longitud = 8
    tabla.renglones.elemento(4).longitud = 5
    tabla.renglones.elemento(5).longitud = 5
    tabla.renglones.elemento(6).longitud = 8
    tabla.renglones.elemento(7).longitud = 8
    tabla.renglones.elemento(8).longitud = 14
    tabla.renglones.elemento(9).longitud = 5

    tabla.columnas.elemento(1).longitud = 8
    tabla.columnas.elemento(2).longitud = 95

    this.ocultarBordesCeldas(tabla, {
      borderDerIzq: [[1, 1], [1, 2]],
      borderSup:    [[1, 1], [1, 2]],
    })
  }

  override etiquetarCeldas(): void {
    const t = 'tbl_notas_considerar'

    const texto1 =
      'ANTES DE INICIAR ESTOS TRABAJOS, VERIFICAR QUE ESTEN CONCLUIDOS LOS\n' +
      'TRABAJOS DE INSTALACION DE LA FIBRA OPTICA PRAL. CON PREPARACION DE GASA\n' +
      'EN EL POZO DE DTO. DE CAJA DE DISTRIBUCION IDENFICACION PRS0021'

    const texto2 =
      'LA INSTALACION DE LA TERMINAL DE BANDA ANCHA (TBA) DEBERA INSTALARSE A 4.0 MTS.\n' +
      'DE NIVEL DE PISO TERMINADO A BASE DE LA TERMINAL DE BANDA ANCHA (TBA).'

    const texto3 =
      'LA INSTALACION DE EL CONVERTIDOR DE MEDIOS (MC), DEBERA INSTALARSE A 3.5 MTS.\n' +
      'DE NIVEL DE PISO TERMINADO A BASE DE CONVERTIDOR DE MEDIOS (MC)'

    const texto4 =
      'LAS CONEXIONES QUE SALEN DE EL EQUIPO DE CONVERTIDOR DE MEDIOS Y LA TERMINAL\n' +
      'DE BANDA ANCHA Y ENTRAN A EL CIERRE Tyco SALE CON CONECTOR TIPO CHAMP\n' +
      'MACHO DE FABRICA'

    const texto5 =
      'LA CONEXION QUE SE HARA DEL POSTE (CIERRE Tyco) A EL POZO DE LA CD, AL IGUAL QUE\n' +
      'EL CABLE DE 20PS PARA TELEALIMENTAR LOS EQUIPOS 8TBA Y MC), LLEVARA CONECTORES\n' +
      'CHAMP HEMBRA EN SU TERMINACION, CON 30 MTS. DE LONGITUD.'

    const texto6 =
      'EL CONSTRUCTOR DEBE REALIZAR LA MEDICION DE TIERRA FISICA (SI EXISTE) PARA VERIFICAR\n' +
      'QUE SE ENCUENTREN EN EL RANGO ESTABLECIDO POR NORMA (<=25 ohms).\n' +
      'EN CASO DE QUE EL VALOR DE TIERRA NO CUMPLA, EL CONSTRUCTOR DEBE REALIZAR LOS\n' +
      'AJUSTES NECESARIOS DE ACUERDO A LA NORMATIVIDAD DE TIERRAS PARA QUE SE TENGA UN\n' +
      'VALOR DE TIERRA FISICA <=25 ohms.'

    const texto7 =
      'SI NO EXISTE EL SISTEMA DE TIERRA FISICA EL CONSTRUCTOR DEBE INSTALAR UN SISTEMA\n' +
      'DE TIERRA FISICA DE ACUERDO A NORMA QUE CUMPLA EL VALOR REQUERIDO.'

    this.asignarTextoCelda(t, 1, 2, 'NOTAS A CONSIDERAR', 30, undefined)
    this.asignarTextoCelda(t, 2, 1, 'NO',          20, undefined)
    this.asignarTextoCelda(t, 2, 2, 'OBSERVACION', 20, undefined)
    this.asignarTextoCelda(t, 3, 1, '1',     18, undefined)
    this.asignarTextoCelda(t, 3, 2, texto1,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 4, 1, '2',     18, undefined)
    this.asignarTextoCelda(t, 4, 2, texto2,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 5, 1, '3',     18, undefined)
    this.asignarTextoCelda(t, 5, 2, texto3,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 6, 1, '4',     18, undefined)
    this.asignarTextoCelda(t, 6, 2, texto4,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 7, 1, '5',     18, undefined)
    this.asignarTextoCelda(t, 7, 2, texto5,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 8, 1, '6',     18, undefined)
    this.asignarTextoCelda(t, 8, 2, texto6,  18, 'top_left', 3)
    this.asignarTextoCelda(t, 9, 1, '7',     18, undefined)
    this.asignarTextoCelda(t, 9, 2, texto7,  18, 'top_left', 3)
  }
}
