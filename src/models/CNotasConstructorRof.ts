// Source: planos_fo/source/ruta_cables/sellos/c_notas_constructor_rof.magik
// ROF variant of CNotasConstructor.
// In Magik both classes extend :textbox_layout directly (copy-paste duplication);
// here we extend CNotasConstructor since the only difference is the default note text.
//
// Overridden: etiquetarCeldas() — 3 notes instead of 2, with ROF-specific wording.
// Everything else (configurarTabla, prvAsignaTexto, drawContentOn, abreInterfazGUI,
// inicializar, postInitialisation, SelloEditable, attributes largo/ancho/textoSello)
// is inherited unchanged from CNotasConstructor.

import { CNotasConstructor } from './CNotasConstructor'
import { CTextoGrafico } from '../gis/CTextoGrafico'

export class CNotasConstructorRof extends CNotasConstructor {
  override etiquetarCeldas(): void {
    const loTitulo = new CTextoGrafico('')
    loTitulo.texto = 'NOTAS AL CONSTRUCTOR'

    const msg =
      ' 1. EL CONSTRUCTOR DEBE RESPETAR LA VIA ASIGNADA PARA EL JALADO DE LOS CABLES\n' +
      ' 2. CUALQUIER ACLARACION O MODIFICACION (EN MEDIDAS, CAMBIOS DE CAPACIDADES, ETC.)\n' +
      '    A ESTE PROYECTO SE DEBERA PEDIR LA AUTORIZACION DE INGENIERIA EN PROYECTOS.\n' +
      ' 3. EL CONSTRUCTOR DEBE DE RESPETAR LA UBICACION DE EMPALMES, ASI COMO DE LAS\n' +
      '    GAZAS PROYECTADAS, PARA LA UBICACION DE EMPALMES A FUTURO.\n'

    const loTexto = new CTextoGrafico('')
    loTexto.tamanio    = 35
    loTexto.alineacion = 'top_left'
    loTexto.texto      = msg

    this._tablas.elemento('tbl_notas_const').celdas.celda(1, 1).elemento = loTitulo
    this._tablas.elemento('tbl_notas_const').celdas.celda(2, 1).elemento = loTexto

    this.prvAsignaTexto()
  }
}
