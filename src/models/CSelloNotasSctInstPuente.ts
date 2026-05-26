// Source: adiciones_layout/source/Sellos/c_sello_notas_sct_inst_puente.magik
// Sello de notas SCT para instalación lateral en puente (notas 1-11).
// Hereda notas 1-4 del padre y añade notas 5-11 específicas de puente.

import {
  CSelloNotasSct,
  type SelloNotasSctConfig,
  type TableConfig,
} from './CSelloNotasSct';

// Magik: override de prvCrea_Cfg_Tbl_Notas_Grales — fila 2 = 170 mm (base: 55 mm)
export const TABLE_CONFIG_INST_PUENTE: TableConfig = {
  rowTitle: 10,
  rowText:  170,
  colWidth: 165,
};

export class CSelloNotasSctInstPuente extends CSelloNotasSct {
  static override readonly allowedOnMenu = false;

  override get tableConfig(): TableConfig {
    return TABLE_CONFIG_INST_PUENTE;
  }

  // Magik: prvAsignaTexto — llama a super luego concatena notas 5-11 de instalación en puente
  override buildTexto(): string {
    const base = super.buildTexto();
    const c = this._tipoCable;
    const e = this._estado;

    const extra = [
      ` 5.- LA UBICACIÓN DE LA INSTALACIÓN LATERAL EN PUENTE CON CABLE DE ${c}\n` +
      ` INDICADA EN ESTE PROYECTO DEBERÁ SER VERIFICADA Y PRECISADA EN EL LUGAR POR LA RESIDENCIA\n` +
      ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${e}.`,

      ` 6.- LA INSTALACIÓN CON CABLE DE ${c} EN PUENTE, SE HARÁ SIN INTERRUMPIR \n` +
      ` EL TRÁNSITO, PARA LO CUAL DEBERÁ ESTAR LA SUPERFICIE DE RODAMIENTO LIBRE DE OBSTÁCULOS- \n` +
      ` COMO SON PIEDRAS, ARENA, BASURA, HERRAMIENTA, ETC. \n` +
      ` CARPETA ASFALTICA EVITANDO SU ROMPIMIENTO.`,

      ` 7.- LA INSTALACIÓN DE LA CANALETA CON CABLE DE ${c} QUE SE INDICA EN,\n` +
      ` ESTE PROYECTO, DEBERÁ FIJARSE EN LA SUBESTRUCTURA DEL PUENTE CON BARRENANCLAS AHOGADAS \n` +
      ` EN RESINA EPOXICA, QUEDANDO ABSOLUTAMENTE PROHIBIDO EL USO DE PISTOLAS EXPLOSIVAS.`,

      ` 8.- EN LA PROTECCION Y APARIENCIA DE LA CANALETA DEBERÁ USARSE PINTURA ANTICORROSIVA.`,

      ` 9.- TODOS LOS TRABAJOS DEBERÁN HACERSE DE ACUERDO CON LAS ESPECIFICACIONES GENERALES \n` +
      ` DE CONSTRUCCIÓN DE ESTA SECRETARÍA Y LAS INDICACIONES ADICIONALES DE LA RESIDENCIA GE-\n` +
      ` NERAL DE CONSERVACIÓN DE CARRETERAS EN ESA ENTIDAD. `,

      ` 10.- CUALQUIER DAÑO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SEÑALAMIENTO \n` +
      ` DEBERÁ SER REPARADO DE INMEDIATO POR CUENTA DE TELÉFONOS DE MÉXICO, S.A. DE C.V. DE \n` +
      ` ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS EN\n` +
      ` ESA ENTIDAD.`,

      ` 11.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A. \n` +
      ` DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES- \n` +
      ` RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRE- \n` +
      ` TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- \n` +
      ` EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICIÓN 1986.`,
    ].join('\n\n');

    return base + '\n\n' + extra;
  }
}

export type { SelloNotasSctConfig };
