import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloEstandarBaseFo,
  COLOR_PROY_CTL,
  type SelloEstandarBaseFoConfig,
} from '../models/CSelloEstandarBaseFo'

// =============================================================================
// LAYOUT SCHEMATIC
// =============================================================================

function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

const COLOR_PROY_HEX = rgbToHex(COLOR_PROY_CTL)

interface TableCell {
  label:    string
  colSpan?: number
  color?:   string
  fontSize?: number
  italic?:  boolean
  rotated?: boolean
}

function SchematicCell({ cell, w, h }: { cell: TableCell; w: number; h: number }) {
  return (
    <Box sx={{
      width: w, height: h,
      border: '1px solid #555',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', px: 0.3,
      bgcolor: cell.color ? `${cell.color}18` : undefined,
    }}>
      <Typography sx={{
        fontSize: cell.fontSize ?? 8,
        color: cell.color ?? '#333',
        fontFamily: 'monospace',
        fontStyle: cell.italic ? 'italic' : undefined,
        writingMode: cell.rotated ? 'vertical-rl' : undefined,
        transform: cell.rotated ? 'rotate(180deg)' : undefined,
        lineHeight: 1.1,
        textAlign: 'center',
        whiteSpace: 'pre-line',
      }}>
        {cell.label}
      </Typography>
    </Box>
  )
}

function SelloSchematic({ config }: { config: SelloEstandarBaseFoConfig }) {
  const s = useMemo(() => new CSelloEstandarBaseFo(config), [config])

  const SCALE = 0.55
  const H_ROW = 5 * SCALE   // mm → px
  const H_BIG = 15 * SCALE
  const H_UBIC = 124 * SCALE // visible height of ubicacion strip (274-150)

  const W_UBIC  = 15  * SCALE
  const W_COMP  = 25  * SCALE
  const W_FEC1  = 15  * SCALE
  const W_FEC2  = 20  * SCALE
  const W_ESC   = 22  * SCALE
  const W_PROY  = 100 * SCALE
  const W_SIG   = 60  * SCALE
  const W_DEL   = 45  * SCALE

  const [l1, l2, l3] = s.companiaLineas()
  const compLabel = s.razonSocial.trim()
    ? `${l1}\n${l2}\n${l3}`
    : 'RED NACIONAL\nÚLTIMA\nMILLA'

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0 }}>

        {/* MAIN BLOCK (oy - 124) */}
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>

          {/* tbl_ubicacion — tall rotated strip */}
          <Box sx={{
            width: W_UBIC, height: H_UBIC,
            border: '1px dashed #aaa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#f5f5f5',
          }}>
            <Typography sx={{
              fontSize: 7, color: '#777', fontFamily: 'monospace',
              writingMode: 'vertical-rl', transform: 'rotate(180deg)',
              textAlign: 'center', whiteSpace: 'pre',
            }}>
              {s.ubicacionPlano || 'ubicacion_plano\n(Fase 5)'}
            </Typography>
          </Box>

          {/* tbl_compania */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {compLabel.split('\n').map((line, i) => (
              <SchematicCell key={i}
                cell={{ label: line, fontSize: s.razonSocial.toUpperCase().includes('TELEFONOS') ? 9 : 7 }}
                w={W_COMP} h={H_ROW}
              />
            ))}
          </Box>

          {/* tbl_FecDibRev */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {[
              ['FECHA',  s.fecha.toUpperCase()  || '—'],
              ['DIBUJO', s.proyectaEmpresa.toUpperCase() || '—'],
              ['REVISO', s.revisaEmpresa.toUpperCase()   || s.companiaAbrev()],
            ].map(([h, v], i) => (
              <Box key={i} sx={{ display: 'flex' }}>
                <SchematicCell cell={{ label: h, fontSize: 7 }} w={W_FEC1} h={H_ROW} />
                <SchematicCell cell={{ label: v, fontSize: 7 }} w={W_FEC2} h={H_ROW} />
              </Box>
            ))}
          </Box>

          {/* tbl_escala */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <SchematicCell cell={{ label: 'ESCALA', fontSize: 7 }}
              w={W_ESC} h={H_ROW} />
            <SchematicCell cell={{ label: s.escalaManual || '—', fontSize: 8 }}
              w={W_ESC} h={H_ROW * 2} />
          </Box>

          {/* tbl_proy_ctl */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <SchematicCell
              cell={{ label: `${s.nombre || 'NOMBRE'}\nNCO-${s.loNombreNco || '…'}(${s.loNcoSiglas || '…'})`, color: COLOR_PROY_HEX, fontSize: 7 }}
              w={W_PROY} h={H_ROW * 1.5}
            />
            <SchematicCell
              cell={{ label: `CTL-${s.nombreCtl || '…'}(${s.loNcoSiglas || '…'})`, color: COLOR_PROY_HEX, fontSize: 7 }}
              w={W_PROY} h={H_ROW * 1.5}
            />
          </Box>

          {/* tbl_siglas */}
          <SchematicCell
            cell={{ label: `NCO - ${s.loNcoSiglas || '…'}`, color: COLOR_PROY_HEX, fontSize: 9 }}
            w={W_SIG} h={H_BIG}
          />

          {/* 100mm gap (no table) */}
          <Box sx={{ width: 100 * SCALE, bgcolor: '#fafafa', border: '1px dashed #ddd',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 7, color: '#bbb', fontFamily: 'monospace' }}>
              100mm gap
            </Typography>
          </Box>

          {/* tbl_del_mpo — no borders */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {[
              [' ESTADO:', s.estado || '—'],
              [' CODIGO POSTAL:', s.codigoPostal || '—'],
              [' COLONIA:', s.colonia || '—'],
              [' DELEGACION O MPO.:', s.municipio || '—'],
            ].map(([label, val], i) => (
              <Box key={i} sx={{ display: 'flex' }}>
                <Box sx={{ width: W_DEL, height: H_ROW, px: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: '#555' }}>{label}</Typography>
                </Box>
                <Box sx={{ width: W_DEL, height: H_ROW, px: 0.5, display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 'bold' }}>{val}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Escala visual ≈ {(SCALE * 100).toFixed(0)}% · tbl_del_mpo no tiene bordes (bDibuja_Columnas/Renglones_Internos = false + hide all borders)
      </Typography>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

const RAZON_SOCIAL_OPTIONS = [
  { value: '', label: '(default — RED NACIONAL)' },
  { value: 'TELEFONOS|DE MEXICO|S.A.B de C.V.', label: 'TELEFONOS DE MEXICO (TELMEX)' },
  { value: 'RED|NACIONAL|ULTIMA MILLA',           label: 'RED NACIONAL ULTIMA MILLA (RNUM)' },
  { value: 'RED|ULTIMA MILLA|DEL NOROESTE',       label: 'RED ULTIMA MILLA DEL NOROESTE (RUMN)' },
]

const NOMBRE_OPTIONS = [
  { value: 'RUTA DE CABLES',              label: 'RUTA DE CABLES' },
  { value: 'ESQUEMATICO DE PRINCIPALES',  label: 'ESQUEMATICO DE PRINCIPALES' },
  { value: 'PLANO DE DETALLES',           label: 'PLANO DE DETALLES' },
]

export function CSelloEstandarBaseFoShowcase() {
  const [razonSocial,     setRazonSocial]     = useState('')
  const [nombre,          setNombre]          = useState('RUTA DE CABLES')
  const [fecha,           setFecha]           = useState('')
  const [proyectaEmpresa, setProyectaEmpresa] = useState('')
  const [revisaEmpresa,   setRevisaEmpresa]   = useState('')
  const [escalaManual,    setEscalaManual]    = useState('')
  const [estado,          setEstado]          = useState('')
  const [municipio,       setMunicipio]       = useState('')
  const [colonia,         setColonia]         = useState('')
  const [codigoPostal,    setCodigoPostal]    = useState('')
  const [loNombreNco,     setLoNombreNco]     = useState('')
  const [loNcoSiglas,     setLoNcoSiglas]     = useState('')
  const [nombreCtl,       setNombreCtl]       = useState('')
  const [ubicacionPlano,  setUbicacionPlano]  = useState('')

  const config = useMemo<SelloEstandarBaseFoConfig>(() => ({
    razonSocial, nombre, fecha, proyectaEmpresa, revisaEmpresa,
    escalaManual, estado, municipio, colonia, codigoPostal,
    loNombreNco, loNcoSiglas, nombreCtl,
    ubicacionPlano,
  }), [razonSocial, nombre, fecha, proyectaEmpresa, revisaEmpresa,
       escalaManual, estado, municipio, colonia, codigoPostal,
       loNombreNco, loNcoSiglas, nombreCtl, ubicacionPlano])

  const sello = useMemo(() => new CSelloEstandarBaseFo(config), [config])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_estandar_base_fo
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="subclassable" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_sello_estandar_base_fo.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Company */}
            <Card variant="outlined">
              <CardHeader
                title="Empresa / Compañía"
                subheader="tbl_compania + tbl_FecDibRev(3,2)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    select label="razon_social" value={razonSocial}
                    onChange={e => setRazonSocial(e.target.value)}
                    size="small" fullWidth
                    helperText={razonSocial ? `Abrev: ${sello.companiaAbrev()} · font: ${sello.companiaFontSize()}pt` : 'Vacío → RED NACIONAL default'}
                  >
                    {RAZON_SOCIAL_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>

                  {razonSocial.trim().length > 0 && (
                    <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                      <Box sx={{ color: 'text.secondary', mb: 0.5 }}>Líneas en tbl_compania:</Box>
                      {sello.companiaLineas().map((l, i) => (
                        <Box key={i}>{i + 1}. {l}</Box>
                      ))}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Plan type */}
            <Card variant="outlined">
              <CardHeader
                title="Tipo de plano"
                subheader="tbl_proy_ctl — nombre + NCO"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    select label="nombre" value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    size="small" fullWidth
                    helperText="enumTipoNombre: 1=RUTA, 2=ESQUEMÁTICO, 3=DETALLES"
                  >
                    {NOMBRE_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="lonombrenco" value={loNombreNco} onChange={e => setLoNombreNco(e.target.value)}
                    size="small" fullWidth helperText="Nombre largo NCO" />
                  <TextField label="loncosiglas" value={loNcoSiglas} onChange={e => setLoNcoSiglas(e.target.value)}
                    size="small" fullWidth helperText="Siglas NCO (tbl_proy_ctl + tbl_siglas)" />
                  <TextField label="nombre_ctl" value={nombreCtl} onChange={e => setNombreCtl(e.target.value)}
                    size="small" fullWidth helperText="Nombre central (CTL-…)" />
                </Stack>
              </CardContent>
            </Card>

            {/* Date / drawn-by */}
            <Card variant="outlined">
              <CardHeader
                title="Fechas y responsables"
                subheader="tbl_FecDibRev col 2"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="fecha"            value={fecha}           onChange={e => setFecha(e.target.value)}           size="small" fullWidth />
                  <TextField label="proyecta_empresa" value={proyectaEmpresa} onChange={e => setProyectaEmpresa(e.target.value)} size="small" fullWidth />
                  <TextField label="revisa_empresa"   value={revisaEmpresa}   onChange={e => setRevisaEmpresa(e.target.value)}   size="small" fullWidth />
                  <TextField label="escala_manual"    value={escalaManual}    onChange={e => setEscalaManual(e.target.value)}    size="small" fullWidth helperText="tbl_escala row 2 (Magik: attributes[:escala])" />
                </Stack>
              </CardContent>
            </Card>

            {/* Municipality */}
            <Card variant="outlined">
              <CardHeader
                title="Delegación / Municipio"
                subheader="tbl_del_mpo col 2 (todos los bordes ocultos)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="estado"        value={estado}       onChange={e => setEstado(e.target.value)}      size="small" fullWidth />
                  <TextField label="codigo_postal" value={codigoPostal} onChange={e => setCodigoPostal(e.target.value)} size="small" fullWidth />
                  <TextField label="colonia"       value={colonia}      onChange={e => setColonia(e.target.value)}     size="small" fullWidth />
                  <TextField label="municipio"     value={municipio}    onChange={e => setMunicipio(e.target.value)}   size="small" fullWidth helperText="DELEGACION O MPO." />
                </Stack>
              </CardContent>
            </Card>

            {/* Ubicacion */}
            <Card variant="outlined">
              <CardHeader
                title="Ubicación del plano"
                subheader="tbl_ubicacion — rotado 90° (Fase 5: GIS)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  label="ubicacion_plano" value={ubicacionPlano}
                  onChange={e => setUbicacionPlano(e.target.value)}
                  size="small" fullWidth multiline rows={2}
                  helperText="En GIS se ensambla de división/área/central/enlace/idplano"
                />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Sello renderizado"
                subheader="7 tablas · dimensiones en mm · sin factor de escala"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <SelloSchematic config={config} />
              </CardContent>
            </Card>

            {/* Table layout reference */}
            <Card variant="outlined">
              <CardHeader title="Dimensiones de las tablas" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Renglones', 'Columnas', 'ox', 'oy', 'Nota'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold', fontSize: 11 }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_ubicacion',  '1 × 274mm',      '1 × 15mm',     '0',    '0',     'sin bordes · texto rot.90°'],
                      ['tbl_compania',   '3 × 5mm',        '1 × 25mm',     '+15',  '−124',  'sin rengl. internos'],
                      ['tbl_FecDibRev',  '3 × 5mm',        '15mm + 20mm',  '+40',  '−124',  '—'],
                      ['tbl_escala',     '5mm + 10mm',     '1 × 22mm',     '+75',  '−124',  '—'],
                      ['tbl_proy_ctl',   '2 × 7.5mm',      '1 × 100mm',    '+97',  '−124',  'sin rengl. internos · color púrpura'],
                      ['tbl_siglas',     '1 × 15mm',       '1 × 60mm',     '+197', '−124',  'color púrpura'],
                      ['(gap 100mm)',    '—',               '—',            '+257', '—',     'gap explícito'],
                      ['tbl_del_mpo',   '4 × 5mm',        '2 × 45mm',     '+357', '+26',   'TODOS los bordes ocultos'],
                    ].map((row, i) => (
                      <Box component="tr" key={i} sx={{
                        borderBottom: '1px solid', borderColor: 'divider',
                        bgcolor: row[0] === '(gap 100mm)' ? '#f5f5f5' : undefined,
                      }}>
                        {row.map((cell, j) => (
                          <Box component="td" key={j} sx={{
                            p: '3px 8px',
                            color: j === 0 ? 'primary.main' : j >= 3 ? 'text.secondary' : undefined,
                            fontStyle: row[0] === '(gap 100mm)' ? 'italic' : undefined,
                          }}>
                            {cell}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="caption" color="text.secondary" component="p">
                  oy base = −124mm: derivado de ln_desp_y − 150 donde ln_desp_y = 274mm (altura de tbl_ubicacion).
                  tbl_del_mpo sube 26mm: oy − (274 − 300) = oy + 26.
                </Typography>
              </CardContent>
            </Card>

            {/* Company logic */}
            <Card variant="outlined">
              <CardHeader title="Lógica de compañía" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  <Box sx={{ mb: 1 }}>
                    <strong>companiaLineas()</strong> — split razon_social por "|"
                    → 3 líneas en tbl_compania (rows 1–3)
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <strong>companiaAbrev()</strong> → tbl_FecDibRev(3,2)
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
                    {[
                      ['razon_social contiene', 'Abrev.', 'Font size'],
                      ['TELEFONOS',             'TELMEX', '35pt'],
                      ['NACIONAL',              'RNUM',   '23pt'],
                      ['NOROESTE',              'RUMN',   '23pt'],
                      ['(vacío)',               '—',      '32pt (default)'],
                    ].map((r, i) => r.map((c, j) => (
                      <Box key={`${i}${j}`} sx={{
                        fontWeight: i === 0 ? 'bold' : undefined,
                        color: i === 0 ? 'text.secondary' : j === 1 ? 'primary.main' : undefined,
                      }}>{c}</Box>
                    )))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
