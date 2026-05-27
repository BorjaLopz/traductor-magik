// Source: planos_fo/source/ruta_cables/sellos/c_sello_estandar_base_fo_acometida.magik
// Variant of c_sello_estandar_base_fo for acometida (FTTH drop) plans.
// Magik: extends c_base_sello_fibra (sibling of CSelloEstandarBaseFo).
// TypeScript: extends CSelloEstandarBaseFo — layout is identical (7 tables, same dims).
//
// Key differences vs base:
//   • allowed_on_menu? = false
//   • tbl_proy_ctl(1,1) = "CTL-nombre_ctl(siglas_ctl)"   [purple, font 50]  ← no NCO prefix
//   • tbl_proy_ctl(2,1) = usuario name                   [red,    font 50, bold]
//   • tbl_siglas(1,1)   = "REFERENCIA SISA\n<ref>"       [purple, font 55, bold]
//   • Extra GIS methods: tiraMarginal(), datosCliente(), pess()
//   • Extra attribute: datos_cliente (string, unused in rendering)

import { CSelloEstandarBaseFo, COLOR_PROY_CTL } from './CSelloEstandarBaseFo'
import type { SelloEstandarBaseFoConfig }        from './CSelloEstandarBaseFo'

// ─── Color ────────────────────────────────────────────────────────────────────

// Red used for usuario row: rgb(255,0,0)
export const COLOR_USUARIO: [number, number, number] = [1.0, 0.0, 0.0]

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SelloEstandarBaseFoAcometidaConfig extends SelloEstandarBaseFoConfig {
  datosCliente?:   string  // Magik attribute :datos_cliente (defined but unused in rendering)
  usuario?:        string  // pl_datos[:usuario] — client name from GIS access_point/building (Fase 5)
  referenciaSisa?: string  // pl_datos[:referencia_sisa] — from swg_dsn_admin_engine (Fase 5)
}

// ─── Class ────────────────────────────────────────────────────────────────────

export class CSelloEstandarBaseFoAcometida extends CSelloEstandarBaseFo {
  // Extra attribute (Magik defined_attributes)
  datosCliente:   string = ''

  // GIS-populated fields exposed for showcase
  usuario:        string = ''  // from datosCliente() → pl_datos[:usuario]
  referenciaSisa: string = ''  // from obtenRegistros() → pl_datos[:referencia_sisa]

  constructor(config?: SelloEstandarBaseFoAcometidaConfig) {
    super(config)
    if (config?.datosCliente   !== undefined) this.datosCliente   = config.datosCliente
    if (config?.usuario        !== undefined) this.usuario        = config.usuario
    if (config?.referenciaSisa !== undefined) this.referenciaSisa = config.referenciaSisa
  }

  // Magik: llena_datos_celdas — overrides base; same FecDibRev/del_mpo/compania logic,
  // but tbl_proy_ctl and tbl_siglas have acometida-specific content.
  override llenarDatosCeldas(): void {
    // tbl_FecDibRev column 2
    this.asignarTextoCelda('tbl_FecDibRev', 1, 2, this.fecha.toUpperCase(),           30, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 2, 2, this.proyectaEmpresa.toUpperCase(), 30, undefined)
    this.asignarTextoCelda('tbl_FecDibRev', 3, 2, this.revisaEmpresa.toUpperCase(),   30, undefined)

    // tbl_del_mpo column 2
    this.asignarTextoCelda('tbl_del_mpo', 1, 2, this.estado,       35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 2, 2, this.codigoPostal, 35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 3, 2, this.colonia,      35, 'top_left')
    this.asignarTextoCelda('tbl_del_mpo', 4, 2, this.municipio,    35, 'top_left')

    // tbl_proy_ctl — acometida variant: CTL only (row 1) + usuario in red (row 2)
    const ctlText = `CTL-${this.nombreCtl}(${this.siglasCtl})`
    this.asignarTextoCelda('tbl_proy_ctl', 1, 1, ctlText,      50, 'centre_centre', 0, COLOR_PROY_CTL)
    this.asignarTextoCelda('tbl_proy_ctl', 2, 1, this.usuario, 50, 'centre_centre', 0, COLOR_USUARIO)
    // Magik also sets sEstilo = "Bold" on row 2 — Fase 5 (CTextoGrafico.style not modelled yet)

    // tbl_siglas — acometida variant: REFERENCIA SISA (not "NCO - siglas")
    const sisaText = `REFERENCIA SISA\n${this.referenciaSisa}`
    this.asignarTextoCelda('tbl_siglas', 1, 1, sisaText, 55, 'top_centre', 0, COLOR_PROY_CTL)
    // Magik also sets sEstilo = "Bold" — Fase 5

    // tbl_escala row 2
    this.asignarTextoCelda('tbl_escala', 2, 1, this.escalaManual, 55, undefined)

    // tbl_ubicacion — rotated 90° (Magik: pl_datos[:tira_marginal]; showcase: ubicacionPlano)
    this.asignarTextoCelda('tbl_ubicacion', 1, 1, this.ubicacionPlano, 45, 'bottom_left', 90)

    // Company block — same logic as base class
    if (this.razonSocial.trim().length > 0) {
      const [l1, l2, l3] = this.companiaLineas()
      const fs = this.companiaFontSize()
      this.asignarTextoCelda('tbl_compania', 1, 1, l1, fs, undefined)
      this.asignarTextoCelda('tbl_compania', 2, 1, l2, fs, undefined)
      this.asignarTextoCelda('tbl_compania', 3, 1, l3, fs, undefined)
      this.asignarTextoCelda('tbl_FecDibRev', 3, 2, this.companiaAbrev(), 30, undefined)
    }
  }

  // Magik: tira_marginal — builds location string from GIS project fields. Fase 5.
  tiraMarginal(): string { return this.ubicacionPlano }

  // Magik: datos_cliente — populates pl_datos[:usuario] from access_point/building/radio_base. Fase 5.
  datosClienteGis(): void { /* Fase 5 */ }

  // Magik: pess — populates pl_datos[:pess] from cable upstream connector. Fase 5.
  pess(): void { /* Fase 5 */ }

  // Magik: obten_registros — calls tiraMarginal + datos_cliente + pess. Fase 5.
  override obtenRegistros(): void { /* Fase 5 */ }
}
