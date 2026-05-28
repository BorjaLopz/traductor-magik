import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloEstandarBaseFoAcometida,
  COLOR_USUARIO,
  type SelloEstandarBaseFoAcometidaConfig,
} from '../models/CSelloEstandarBaseFoAcometida'
import { COLOR_PROY_CTL } from '../models/CSelloEstandarBaseFo'

// =============================================================================
// HELPERS
// =============================================================================

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

const COLOR_PROY_HEX    = rgbToHex(COLOR_PROY_CTL)
const COLOR_USUARIO_HEX = rgbToHex(COLOR_USUARIO)

const RAZON_SOCIAL_OPTIONS = [
  { value: '', label: '(default — RED NACIONAL)' },
  { value: 'TELEFONOS|DE MEXICO|S.A.B de C.V.', label: 'TELEFONOS DE MEXICO (TELMEX)' },
  { value: 'RED|NACIONAL|ULTIMA MILLA',           label: 'RED NACIONAL ULTIMA MILLA (RNUM)' },
  { value: 'RED|ULTIMA MILLA|DEL NOROESTE',       label: 'RED ULTIMA MILLA DEL NOROESTE (RUMN)' },
]

// =============================================================================
// CELL PREVIEWS — tbl_proy_ctl & tbl_siglas
// =============================================================================

function CellBox({ text, color, fontSize = 9, bold }: {
  text:      string
  color:     string
  fontSize?: number
  bold?:     boolean
}) {
  return (
    <Box sx={{
      border: `1px solid ${color}`,
      bgcolor: `${color}12`,
      px: 1, py: 0.5,
      fontFamily: 'monospace',
      fontSize,
      color,
      fontWeight: bold ? 'bold' : undefined,
      whiteSpace: 'pre-line',
      minHeight: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
    }}>
      {text || <Box component="span" sx={{ opacity: 0.4 }}>(vacío)</Box>}
    </Box>
  )
}

// =============================================================================
// DIFF TABLE — base vs acometida
// =============================================================================

function DiffTable() {
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
      <Box component="thead">
        <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
          {['Celda', 'c_sello_estandar_base_fo', 'c_sello_estandar_base_fo_acometida'].map(h => (
            <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold', fontSize: 11 }}>{h}</Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {[
          [
            'tbl_proy_ctl(1,1)',
            'nombre + "\\nNCO-"+lonombrenco+"("+loncosiglas+")"  [purple, 35pt]',
            '"CTL-"+nombre_ctl+"("+siglas_ctl+")"  [purple, 50pt]',
          ],
          [
            'tbl_proy_ctl(2,1)',
            '"CTL-"+nombre_ctl+"("+loncosiglas+")"  [purple, 35pt]',
            'usuario  [RED #ff0000, 50pt, bold]',
          ],
          [
            'tbl_siglas(1,1)',
            '"NCO - "+loncosiglas  [purple, 60pt]',
            '"REFERENCIA SISA\\n"+referencia_sisa  [purple, 55pt, bold]',
          ],
          [
            'tbl_ubicacion(1,1)',
            'ubicacion2 (GIS assembled)  [rot 90°]',
            'pl_datos[:tira_marginal] via tiraMarginal()  [rot 90°]',
          ],
          [
            'GIS extras',
            'obtenRegistros() — básico',
            '+ tiraMarginal() + datosCliente() + pess()',
          ],
          [
            'allowed_on_menu?',
            '_true',
            '_false',
          ],
        ].map(([cell, base, acometida], i) => (
          <Box component="tr" key={i} sx={{
            borderBottom: '1px solid', borderColor: 'divider',
            '&:last-child': { border: 0 },
            bgcolor: i % 2 === 0 ? undefined : '#fafafa',
          }}>
            <Box component="td" sx={{ p: '4px 8px', fontWeight: 'bold', color: 'primary.main', whiteSpace: 'nowrap' }}>{cell}</Box>
            <Box component="td" sx={{ p: '4px 8px', color: 'text.secondary', fontSize: 10 }}>{base}</Box>
            <Box component="td" sx={{ p: '4px 8px', color: 'success.main',   fontSize: 10 }}>{acometida}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSelloEstandarBaseFoAcometidaShowcase() {
  const [razonSocial,     setRazonSocial]     = useState('')
  const [fecha,           setFecha]           = useState('')
  const [proyectaEmpresa, setProyectaEmpresa] = useState('')
  const [revisaEmpresa,   setRevisaEmpresa]   = useState('')
  const [escalaManual,    setEscalaManual]    = useState('')
  const [estado,          setEstado]          = useState('')
  const [municipio,       setMunicipio]       = useState('')
  const [colonia,         setColonia]         = useState('')
  const [codigoPostal,    setCodigoPostal]    = useState('')
  const [nombreCtl,       setNombreCtl]       = useState('')
  const [siglasCtl,       setSiglasCtl]       = useState('')
  const [usuario,         setUsuario]         = useState('')
  const [referenciaSisa,  setReferenciaSisa]  = useState('')
  const [ubicacionPlano,  setUbicacionPlano]  = useState('')

  const config = useMemo<SelloEstandarBaseFoAcometidaConfig>(() => ({
    razonSocial, fecha, proyectaEmpresa, revisaEmpresa, escalaManual,
    estado, municipio, colonia, codigoPostal,
    nombreCtl, siglasCtl,
    usuario, referenciaSisa, ubicacionPlano,
  }), [razonSocial, fecha, proyectaEmpresa, revisaEmpresa, escalaManual,
       estado, municipio, colonia, codigoPostal,
       nombreCtl, siglasCtl, usuario, referenciaSisa, ubicacionPlano])

  const sello = useMemo(() => new CSelloEstandarBaseFoAcometida(config), [config])

  const ctlText  = `CTL-${sello.nombreCtl || '…'}(${sello.siglasCtl || '…'})`
  const sisaText = `REFERENCIA SISA\n${sello.referenciaSisa || '—'}`

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_estandar_base_fo_acometida
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends CSelloEstandarBaseFo (TS)" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_sello_estandar_base_fo_acometida.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p" sx={{ mt: 0.5 }}>
        Magik: sibling de <code>c_sello_estandar_base_fo</code> (ambos extienden <code>c_base_sello_fibra</code>).
        TypeScript: subclase de <code>CSelloEstandarBaseFo</code> — layout idéntico, solo difiere <code>llenarDatosCeldas()</code>.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Empresa */}
            <Card variant="outlined">
              <CardHeader
                title="Empresa"
                subheader="tbl_compania + tbl_FecDibRev — mismo que base"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    select label="razon_social" value={razonSocial}
                    onChange={e => setRazonSocial(e.target.value)}
                    size="small" fullWidth
                    helperText={razonSocial ? `${sello.companiaAbrev()} · font ${sello.companiaFontSize()}pt` : 'Vacío → RED NACIONAL default'}
                  >
                    {RAZON_SOCIAL_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="fecha"            value={fecha}           onChange={e => setFecha(e.target.value)}           size="small" fullWidth />
                  <TextField label="proyecta_empresa" value={proyectaEmpresa} onChange={e => setProyectaEmpresa(e.target.value)} size="small" fullWidth />
                  <TextField label="revisa_empresa"   value={revisaEmpresa}   onChange={e => setRevisaEmpresa(e.target.value)}   size="small" fullWidth />
                  <TextField label="escala_manual"    value={escalaManual}    onChange={e => setEscalaManual(e.target.value)}    size="small" fullWidth helperText="Magik: attributes[:escala]" />
                </Stack>
              </CardContent>
            </Card>

            {/* CTL — diferente del base */}
            <Card variant="outlined" sx={{ borderColor: 'success.light' }}>
              <CardHeader
                title="CTL — acometida (diferente del base)"
                subheader="tbl_proy_ctl: solo CTL en fila 1 (no NCO)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="nombre_ctl" value={nombreCtl} onChange={e => setNombreCtl(e.target.value)}
                    size="small" fullWidth helperText={`→ tbl_proy_ctl(1,1): CTL-${nombreCtl || '…'}(${siglasCtl || '…'})`} />
                  <TextField label="siglas_ctl" value={siglasCtl} onChange={e => setSiglasCtl(e.target.value)}
                    size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

            {/* Usuario — diferente del base */}
            <Card variant="outlined" sx={{ borderColor: 'error.light' }}>
              <CardHeader
                title="Usuario / cliente (diferente del base)"
                subheader="tbl_proy_ctl(2,1) — color rojo · bold · Fase 5: datos_cliente()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField label="usuario" value={usuario} onChange={e => setUsuario(e.target.value)}
                  size="small" fullWidth
                  helperText="GIS: access_point → building.name / radio_base.nom_radio_base"
                />
              </CardContent>
            </Card>

            {/* SISA — diferente del base */}
            <Card variant="outlined" sx={{ borderColor: 'success.light' }}>
              <CardHeader
                title="Referencia SISA (diferente del base)"
                subheader="tbl_siglas(1,1): «REFERENCIA SISA\n<ref>» en vez de NCO siglas"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField label="referencia_sisa" value={referenciaSisa} onChange={e => setReferenciaSisa(e.target.value)}
                  size="small" fullWidth
                  helperText="GIS: active_design.project.user!_pep_reha_cana"
                />
              </CardContent>
            </Card>

            {/* Municipio */}
            <Card variant="outlined">
              <CardHeader
                title="Delegación / Municipio"
                subheader="tbl_del_mpo — igual que base"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="estado"        value={estado}       onChange={e => setEstado(e.target.value)}       size="small" fullWidth />
                  <TextField label="codigo_postal" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} size="small" fullWidth />
                  <TextField label="colonia"       value={colonia}      onChange={e => setColonia(e.target.value)}      size="small" fullWidth />
                  <TextField label="municipio"     value={municipio}    onChange={e => setMunicipio(e.target.value)}    size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Ubicación del plano" subheader="tbl_ubicacion rot 90° (Fase 5: tiraMarginal)"
                titleTypographyProps={{ variant: 'subtitle2' }} subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent sx={{ pt: 0 }}>
                <TextField label="ubicacion_plano" value={ubicacionPlano} onChange={e => setUbicacionPlano(e.target.value)}
                  size="small" fullWidth multiline rows={2} />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* tbl_proy_ctl + tbl_siglas preview */}
            <Card variant="outlined">
              <CardHeader
                title="Celdas que difieren del base"
                subheader="tbl_proy_ctl (2 filas × 100mm) + tbl_siglas (1 fila × 60mm)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {/* tbl_proy_ctl */}
                  <Box sx={{ flex: '2 1 200px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontFamily: 'monospace' }}>
                      tbl_proy_ctl — 2×1, 100mm
                    </Typography>
                    <CellBox text={ctlText}       color={COLOR_PROY_HEX}    fontSize={10} />
                    <CellBox text={sello.usuario} color={COLOR_USUARIO_HEX} fontSize={10} bold />
                  </Box>

                  {/* tbl_siglas */}
                  <Box sx={{ flex: '1 1 160px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontFamily: 'monospace' }}>
                      tbl_siglas — 1×1, 60mm
                    </Typography>
                    <CellBox text={sisaText} color={COLOR_PROY_HEX} fontSize={9} bold />
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5 }}>
                  <Chip size="small" label="púrpura = [1.0, 0.2593, 0.7]"
                    sx={{ bgcolor: `${COLOR_PROY_HEX}22`, color: COLOR_PROY_HEX, mr: 1, fontSize: 10 }} />
                  <Chip size="small" label="rojo = [1.0, 0.0, 0.0] + Bold"
                    sx={{ bgcolor: `${COLOR_USUARIO_HEX}15`, color: COLOR_USUARIO_HEX, fontSize: 10 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Diff table */}
            <Card variant="outlined">
              <CardHeader title="Diferencias vs c_sello_estandar_base_fo"
                titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <DiffTable />
              </CardContent>
            </Card>

            {/* GIS extras */}
            <Card variant="outlined">
              <CardHeader title="Métodos GIS adicionales (Fase 5)"
                titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {[
                    ['tiraMarginal()', 'Ensambla string "division / area / central / enlace / idplano" desde GIS (max 110 chars/línea). Rellena pl_datos[:tira_marginal].'],
                    ['datosCliente()', 'Busca access_point → inside_location → building/radio_base. Rellena pl_datos[:usuario] con nombre del cliente.'],
                    ['pess()',         'Busca cable upstream connector. Rellena pl_datos[:pess] = cable.name + "PES " + connector.nombre_empalme.'],
                    ['obtenRegistros()', 'Llama a tiraMarginal() + datosCliente() + pess() además de los datos GIS base.'],
                  ].map(([name, desc]) => (
                    <Box key={name} sx={{ mb: 1.5 }}>
                      <Box sx={{ color: 'primary.main', fontWeight: 'bold', mb: 0.3 }}>{name}</Box>
                      <Box sx={{ color: 'text.secondary', fontSize: 10, pl: 1.5 }}>{desc}</Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="caption" color="text.secondary">
                  La tabla <strong>tbl_siglas</strong> en el base muestra "NCO - loncosiglas".
                  En acometida muestra "REFERENCIA SISA" + ref SISA del proyecto (número PEP/reha_cana).
                  El campo <strong>pess</strong> (pl_datos[:pess]) se calcula pero no se muestra en ninguna celda actualmente.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
