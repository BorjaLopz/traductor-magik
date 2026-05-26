// Source: adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_sub.magik
// Sello de notas SCT específico para cruzamientos subterráneos (notas 1-13).
// Hereda notas 1-4 del padre y añade notas 5-13 propias del cruzamiento.

import {
  CSelloNotasSct,
  type SelloNotasSctConfig,
  type TableConfig,
} from './CSelloNotasSct';

// Magik: override de prvCrea_Cfg_Tbl_Notas_Grales — fila 2 más alta (210 vs 55 mm)
// para acomodar las 13 notas en lugar de las 4 del padre
export const TABLE_CONFIG_CRUZ_SUB: TableConfig = {
  rowTitle: 10,
  rowText:  210,
  colWidth: 165,
};

export class CSelloNotasSctCruzSub extends CSelloNotasSct {
  static override readonly allowedOnMenu = false;

  override get tableConfig(): TableConfig {
    return TABLE_CONFIG_CRUZ_SUB;
  }

  // Magik: prvAsignaTexto — llama a super luego concatena notas 5-13
  override buildTexto(): string {
    const base = super.buildTexto();
    const c = this._tipoCable;
    const e = this._estado;
    const p = this._procedimiento;

    const extra = [
      ` 5.- LA UBICACIÓN DEL CRUZAMIENTO SUBTERRÁNEO CON CABLE DE ${c}\n` +
      ` INDICADO EN ESTE PROYECTO DEBERÁ SER VERIFICADO Y PRECISADO EN EL LUGAR POR LA RESIDENCIA\n` +
      ` GENERAL DE CONSERVACIÓN DE CARRETERAS EN EL ESTADO DE ${e}.`,

      ` 6.- EL CRUZAMIENTO SUBTERRÁNEO CON CABLE DE ${c} SE HARÁ POR EL \n` +
      ` PROCEDIMIENTO DE '${p}', PARA LO CUAL SE REQUIERE ENCAMISAR \n` +
      ` EL CABLE CON EL FIN DE PROTEGER LAS FIBRAS ÓPTICAS O COBRE Y PRINCIPALMENTE LA \n` +
      ` CARPETA ASFALTICA EVITANDO SU ROMPIMIENTO.`,

      ` 7.- AL EFECTUAR EL CRUZAMIENTO POR EL PROCEDIMIENTO DE '${p}',\n` +
      ` SE EVITARÁ INTERRUMPIR EL TRÁNSITO Y MOLESTIAS AL USUARIO DE ESTA VÍA.`,

      ` 8.- DENTRO DEL DERECHO DE VÍA, LA DISTANCIA ENTRE LA PARTE MAS BAJA DEL TERRENO\n` +
      ` NATURAL O LA PARTE MAS BAJA DE LA SECCIÓN DEL CAMINO, SOBRE LA CAMISA O CABLE DE \n` +
      `${c} SERÁ DE 1.50 M. COMO MÍNIMO EN LOS TRAMOS CON/SIN TERRAPLÉN Y \n` +
      ` NO MENOR DE 2.00 M. A PARTIR DEL FONDO DE LAS CUNETAS.`,

      ` 9.- EL CRUZAMIENTO SUBTERRÁNEO CON CABLE DE ${c} QUE SE INDICA EN \n` +
      ` ESTE PROYECTO, DEBERÁ EFECTUARSE CONFORME A LAS INDICACIONES ADICIONALES DE LA \n` +
      ` RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS, ASÍ COMO LAS RECOMENDACIONES \n` +
      ` QUE SE DERIVEN DE LAS INSPECCIONES EN CAMPO.`,

      ` 10.- LOS POZOS DE VISITA SE UBICARAN FUERA DEL ÁREA DEL DERECHO DE VÍA O DENTRO DE UNA\n` +
      ` FRANJA NO MAYOR DE 2.50 M. DE ANCHO EN AMBOS LADOS DE LA CARRETERA, MEDIDOS A PARTIR \n` +
      ` DEL LIMITE DEL DERECHO DE VÍA.`,

      ` 11.- CUALQUIER DAÑO QUE SE OCASIONE AL PAVIMENTO, ACOTAMIENTO, CUNETA Y/O SEÑALAMIENTO \n` +
      ` DEBERÁ SER REPARADO DE INMEDIATO POR CUENTA DE TELÉFONOS DE MÉXICO, S.A. DE C.V. DE \n` +
      ` ACUERDO A LAS INDICACIONES DE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRETERAS EN\n` +
      ` ESA ENTIDAD.`,

      ` 12.- PARA EVITAR ACCIDENTES DURANTE LA CONSTRUCCIÓN DE LA OBRA TELÉFONOS DE MÉXICO, S.A. \n` +
      ` DE C.V. COLOCARA Y CONSERVARA PERMANENTEMENTE EN EL CAMINO LAS SEÑALES PREVENTIVAS, RES- \n` +
      ` RESTRICTIVAS E INFORMATIVAS QUE INDIQUE LA RESIDENCIA GENERAL DE CONSERVACIÓN DE CARRE- \n` +
      ` TERAS, CON BASE A LO ESTABLECIDO EN EL 'MANUAL DE DISPOSITIVOS PARA EL CONTROL DEL TRAN- \n` +
      ` EN CALLES Y CARRETERAS' EDITADO POR LA SCT EDICIÓN 1986.`,

      ` 13.- UNA VEZ TERMINADOS LOS TRABAJOS DE ESTA OBRA, DEBERÁN RETIRARSE FUERA DE LOS LIMITES\n` +
      ` DEL DERECHO DE VÍA TODOS LOS MATERIALES SOBRANTES DE LA EXCAVACIÓN Y LOS DE CONSTRUCCIÓN\n` +
      ` DE LA OBRA INCLUYENDO EL SEÑALAMIENTO DE MODO QUE LA CARRETERA Y LA ZONA DEL DERECHO DE -\n` +
      ` VÍA QUEDEN EN SUS CONDICIONES ORIGINALES.`,
    ].join('\n\n');

    return base + '\n\n' + extra;
  }
}

export type { SelloNotasSctConfig };
