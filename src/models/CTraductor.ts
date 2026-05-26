// Source: adiciones_layout/source/c_traductor.magik
//
// Traductor de claves usado por planos / PEP. 7 lookups con default fallback.
// Singleton lógico: cada método cachea la tabla en su slot la primera vez
// (excepto Mes — el original la reconstruye en cada llamada, conservado tal cual).

const TIPO_SUPERFICIE: Record<string, string> = {
  'Acera':                  'ACERA',
  'Adoquin':                'ADOQ.',
  'Arena':                  'ARENA',
  'Asfalto':                'ASFAL.',
  'Azulejo':                'AZULE.',
  'Carretera':              'CARRET.',
  'Concreto':               'CONCR.',
  'Desconocido':            'DESCO.',
  'Empedrado':              'EMPED.',
  'Lajas':                  'LAJAS',
  'Mosaico':                'MOSAI.',
  'Otros':                  'OTROS',
  'Pasto (Area Jardinada)': 'PASTO',
  'Tepetate':               'TEPET.',
  'Tierra Limpia':          'TIERRA',
};

const TIPO_CENTRAL: Record<string, string> = {
  CENTRAL:    'CTL',
  CONTENEDOR: 'URL',
  URL:        'URL',
  GABINETE:   'NAM',
  NAM:        'NAM',
};

const METODO_PEP: Record<string, string> = {
  pep_construccion_canalizacion:   'pep_cons_can',
  pep_construccion_principal:      'pep_cons_princ',
  pep_construccion_secundaria:     'pep_cons_sec',
  pep_desmontaje_canalizacion:     'pep_desm_can',
  pep_desmontaje_principal:        'pep_desm_princ',
  pep_desmontaje_secundaria:       'pep_desm_sec',
  pep_rehabilitacion_canalizacion: 'pep_reha_can',
  pep_rehabilitacion_principal:    'pep_reha_princ',
  pep_rehabilitacion_secundaria:   'pep_reha_sec',
  pep_reconcentracion_principal:   'pep_reco_princ',
  pep_reconcentracion_secundaria:  'pep_reco_sec',
};

const TIPO_PLANO: Record<string, string> = {
  fosa_cables:        'FOSA DE CABLES Y DG',
  division_distritos: 'DIVISION DE DISTRITOS',
  ashurado:           'ASHURADO',
  itinerario:         'ITINERARIO DE CANALIZACION',
  estudio_conjunto:   'ESTUDIO DE CONJUNTO',
  principales:        'ESQUEMATICO RED PRINCIPAL',
  ruta_cables:        'RUTA DE CABLES',
  ruta_cables_fo:     'RUTA DE CABLES',
};

const TIPO_CASETA: Record<string, string> = {
  'TELEFONO PUBLICO PONGA SU LINEA A TRABAJAR PSLT': 'PSLT',
  'TELEFONO PUBLICO TARJETA CHIP TPTC':              'TPTC',
  'TELEFONO PUBLICO LINEA TELEFONO COMPARTIDO LTC':  'LTC',
  'TELEFONO PUBLICO COMPETENCIA':                    'OPERT',
};

const NOMBRE_ATRIBUTO_PEP: Record<string, string> = {
  PEPCanalizacionAligeradaFibraUT: 'user!_pep_ut_cana_ali',
  PEPCanalizacionEncofradaFibraUT: 'user!_pep_ut_cana_enc',
  PEPFibraAereaUT:                 'user!_pep_ut_fib_ae',
  PEPFibraSubterraneaUT:           'user!_pep_ut_fib_sub',
  PEPCanalizacionAligeradaFibraZO: 'user!_pep_zo_cana_ali',
  PEPCanalizacionEncofradaFibraZO: 'user!_pep_zo_cana_enc',
  PEPFibraAereaZO:                 'user!_pep_zo_fib_ae',
  PEPFibraSubterraneaZO:           'user!_pep_zo_fib_sub',
};

const MES_CORTO = [
  '', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
] as const;

const MES_LARGO = [
  '', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export class CTraductor {
  // Magik: c_Traductor.Tipo_Superficie(PsTipo_Sup) — default ""
  tipoSuperficie(psTipoSup: string): string {
    return TIPO_SUPERFICIE[psTipoSup] ?? '';
  }

  // Magik: c_Traductor.Mes(PnNumeroMes, _optional formato_largo?)
  // NB: el original reconstruye la tabla en cada llamada — equivalente a leer un array.
  mes(pnNumeroMes: number, formatoLargo: boolean = false): string {
    if (pnNumeroMes < 1 || pnNumeroMes > 12) return '';
    return formatoLargo ? MES_LARGO[pnNumeroMes] : MES_CORTO[pnNumeroMes];
  }

  // Magik: c_Traductor.Tipo_Central(PsTipoCtl) — default "CTL"
  tipoCentral(psTipoCtl: string): string {
    return TIPO_CENTRAL[psTipoCtl] ?? 'CTL';
  }

  // Magik: c_Traductor.metodo_pep(PsPEPSel) — sin default (undefined si no existe)
  metodoPep(psPepSel: string): string | undefined {
    return METODO_PEP[psPepSel];
  }

  // Magik: c_traductor.tipo_plano(Id_Tipo_Plano) — default ""
  tipoPlano(idTipoPlano: string): string {
    return TIPO_PLANO[idTipoPlano] ?? '';
  }

  // Magik: c_Traductor.tipo_caseta(p_descripcion) — default ""
  tipoCaseta(pDescripcion: string): string {
    return TIPO_CASETA[pDescripcion] ?? '';
  }

  // Magik: c_traductor.nombre_atributo_pep(psym_nombre_pep)
  nombreAtributoPep(psymNombrePep: string): string | undefined {
    return NOMBRE_ATRIBUTO_PEP[psymNombrePep];
  }
}

// Exporta las tablas para introspección del showcase
export const TRADUCTOR_TABLAS = {
  tipoSuperficie:     TIPO_SUPERFICIE,
  tipoCentral:        TIPO_CENTRAL,
  metodoPep:          METODO_PEP,
  tipoPlano:          TIPO_PLANO,
  tipoCaseta:         TIPO_CASETA,
  nombreAtributoPep:  NOMBRE_ATRIBUTO_PEP,
};
