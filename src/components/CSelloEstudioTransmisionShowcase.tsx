import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, InputAdornment, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloEstudioTransmision,
  SELLO_ET_DEFAULTS,
  type SelloEstudioTransmisionConfig,
} from '../models/CSelloEstudioTransmision'

// =============================================================================
// LAYOUT FACTORS DISPLAY
// =============================================================================

function LayoutFactorsCard({ sello }: { sello: CSelloEstudioTransmision }) {
  const f = sello.computeLayoutFactors()
  const rows: [string, string, string][] = [
    ['largo',    'width/10 + empalmes + 30  (empalmes ≤ 10)', `${f.largo.toFixed(1)} mm`],
    ['alto',     'height / 10',                                `${f.alto.toFixed(1)} mm`],
    ['empalmes', 'totalEmpalmes() — Fase 5',                   `${f.empalmes}`],
    ['tbl_general',       '1×1',                              `${f.largo.toFixed(0)} × ${f.alto.toFixed(0)} mm`],
    ['tbl_primera_parte', '1×3 (30%/50%/20%)',                `${(f.largo*0.3).toFixed(0)} | ${(f.largo*0.5).toFixed(0)} | ${(f.largo*0.2).toFixed(0)} mm`],
    ['tbl_segunda_parte', '4×1 rows (3%/7.5%/3%/30%)',        `${(f.alto*0.03).toFixed(1)} / ${(f.alto*0.075).toFixed(1)} / ${(f.alto*0.03).toFixed(1)} / ${(f.alto*0.3).toFixed(1)} mm`],
    ['tbl_tercera_parte', '5×6 rows=5×4mm',                   `offset fijo oy−1450`],
    ['tbl_tercera_parte cols', '10%/15%/10%/15%/1%/49%',      `${(f.largo*0.1).toFixed(0)} / ${(f.largo*0.15).toFixed(0)} / … / ${(f.largo*0.49).toFixed(0)} mm`],
  ]
  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '3px 12px' }}>
        {[['Variable', 'Fórmula', 'Valor'], ...rows].map(([a, b, c], i) => (
          <>
            <Box key={`a${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : 'primary.main' }}>{a}</Box>
            <Box key={`b${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : undefined, fontSize: i > 0 ? 10 : undefined }}>{b}</Box>
            <Box key={`c${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : 'success.main' }}>{c}</Box>
          </>
        ))}
      </Box>
    </Box>
  )
}

// =============================================================================
// SCHEMATIC — visual representation of sello structure
// =============================================================================

function SelloSchematic({ sello }: { sello: CSelloEstudioTransmision }) {
  const f = sello.computeLayoutFactors()
  const SCALE = Math.min(420 / f.largo, 1.2)
  const W  = f.largo * SCALE
  const H1 = f.alto * 0.2 * SCALE  // primera_parte height
  const H2 = f.alto * 0.3 * SCALE  // segunda_parte rows 1-3 summed

  const valores = sello.infoSelloPropiedades(sello.obtenerDatos())

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'inline-block', border: '1.5px solid #555', fontFamily: 'monospace' }}>

        {/* tbl_primera_parte */}
        <Box sx={{ display: 'flex', height: H1, borderBottom: '1px solid #555' }}>
          <Box sx={{ width: W * 0.3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #555' }}>
            <Typography sx={{ fontSize: 8, color: '#1565c0' }}>{sello.logoSymbolName()}</Typography>
          </Box>
          <Box sx={{ width: W * 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #555' }}>
            <Typography sx={{ fontSize: 9, fontWeight: 'bold' }}>ESTUDIO DE TRANSMISION F.O</Typography>
          </Box>
          <Box sx={{ width: W * 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0.3 }}>
            <Typography sx={{ fontSize: 7, color: '#777' }}>EST. NO.</Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 'bold' }}>{sello.estudioNum || '—'}</Typography>
          </Box>
        </Box>

        {/* tbl_segunda_parte rows 1-3 */}
        {[
          ['Nombre del tramo', valores.enlace || '(GIS Fase 5)'],
          ['Numero de fibras y tipo', valores.cable || '(GIS Fase 5)'],
          [`LONGITUD TOTAL DEL ENLACE:`, valores.longitud],
        ].map(([label, value], i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center',
            height: Math.max(14, H2 * [0.1, 0.25, 0.1][i]),
            borderBottom: '1px solid #bbb', px: 0.5,
          }}>
            <Typography sx={{ fontSize: 8, color: '#555', mr: 0.5 }}>{label}</Typography>
            <Typography sx={{ fontSize: 8, fontWeight: 'bold' }}>{value}</Typography>
          </Box>
        ))}

        {/* tbl_segunda_parte row 4 — grafico placeholder */}
        <Box sx={{ height: 24, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #555' }}>
          <Typography sx={{ fontSize: 8, color: '#aaa', fontStyle: 'italic' }}>
            c_estudio_transmision_grafico (Fase 5)
          </Typography>
        </Box>

        {/* tbl_tercera_parte — approval blocks */}
        <Box sx={{ borderTop: '1px dashed #999', bgcolor: '#fafafa' }}>
          {/* Row 1: notas (col 1, spans implied) */}
          <Box sx={{ px: 0.5, py: 0.3, borderBottom: '1px solid #ddd' }}>
            <Typography sx={{ fontSize: 7 }}>{valores.notas}</Typography>
          </Box>
          {/* Rows 2-5: approval blocks */}
          <Box sx={{ display: 'flex' }}>
            {/* Block 1 */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #ddd' }}>
              {[
                ['Vo. Bo.:', valores.vobo1],
                ['NOMBRE:', valores.nombre1],
                ['FIRMA:',  valores.firma1],
                ['FECHA',   valores.fecha1],
              ].map(([lbl, val], i) => (
                <Box key={i} sx={{ display: 'flex', height: 10, px: 0.3, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <Typography sx={{ fontSize: 6.5, color: '#777', mr: 0.3, minWidth: 28 }}>{lbl}</Typography>
                  <Typography sx={{ fontSize: 6.5, fontWeight: 'bold' }}>{val || '—'}</Typography>
                </Box>
              ))}
            </Box>
            {/* Block 2 */}
            <Box sx={{ flex: '0 0 25%', borderRight: '1px solid #ddd' }}>
              {[
                ['Vo. Bo.:', valores.vobo2],
                ['NOMBRE:', valores.nombre2],
                ['FIRMA:',  valores.firma2],
                ['FECHA',   valores.fecha2],
              ].map(([lbl, val], i) => (
                <Box key={i} sx={{ display: 'flex', height: 10, px: 0.3, alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <Typography sx={{ fontSize: 6.5, color: '#777', mr: 0.3, minWidth: 28 }}>{lbl}</Typography>
                  <Typography sx={{ fontSize: 6.5, fontWeight: 'bold' }}>{val || '—'}</Typography>
                </Box>
              ))}
            </Box>
            {/* Spacer col 5 */}
            <Box sx={{ flex: '0 0 2%', borderRight: '1px solid #ddd' }} />
            {/* Observations col 6 */}
            <Box sx={{ flex: 1, px: 0.5, py: 0.3 }}>
              <Typography sx={{ fontSize: 6.5, color: '#777' }}>OBSERVACIONES</Typography>
              <Typography sx={{ fontSize: 6.5 }}>{valores.observaciones || '—'}</Typography>
            </Box>
          </Box>
        </Box>

      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Escala visual proporcional · ancho={W.toFixed(0)}px (largo={f.largo.toFixed(0)}mm)
      </Typography>
    </Box>
  )
}

// =============================================================================
// APPROVAL BLOCK INPUT
// =============================================================================

function AprobacionCard({ title, prefix, values, onChange }: {
  title:    string
  prefix:   '1' | '2'
  values:   { vobo: string; nombre: string; firma: string; fecha: string }
  onChange: (field: string, val: string) => void
}) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        subheader={`tbl_tercera_parte cols ${prefix === '1' ? '2' : '4'} · infoSelloPropiedades`}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.5}>
          <TextField label={`vobo${prefix}`}   value={values.vobo}   onChange={e => onChange(`vobo${prefix}`,   e.target.value)} size="small" fullWidth />
          <TextField label={`nombre${prefix}`} value={values.nombre} onChange={e => onChange(`nombre${prefix}`, e.target.value)} size="small" fullWidth />
          <TextField label={`firma${prefix}`}  value={values.firma}  onChange={e => onChange(`firma${prefix}`,  e.target.value)} size="small" fullWidth />
          <TextField label={`fecha${prefix}`}  value={values.fecha}  onChange={e => onChange(`fecha${prefix}`,  e.target.value)} size="small" fullWidth />
        </Stack>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

const EMPREVISO_OPTIONS = [
  { value: '',              label: '(default — logo_ultima_milla)' },
  { value: 'TELMEX',        label: 'TELMEX → logo_TELMEX_EP' },
  { value: 'ULTIMA_MILLA',  label: 'ULTIMA_MILLA → logo_ULTIMA_MILLA' },
  { value: 'ULTIMA_MILLA_N',label: 'ULTIMA_MILLA_N → logo_ULTIMA_MILLA_N' },
]

export function CSelloEstudioTransmisionShowcase() {
  const [xmax,          setXmax]          = useState(SELLO_ET_DEFAULTS.bounds.xmax)
  const [ymax,          setYmax]          = useState(SELLO_ET_DEFAULTS.bounds.ymax)
  const [empreviso,     setEmpreviso]     = useState('')
  const [estudioNum,    setEstudioNum]    = useState('')
  const [notas,         setNotas]         = useState('')
  const [vobo1,         setVobo1]         = useState('')
  const [nombre1,       setNombre1]       = useState('')
  const [firma1,        setFirma1]        = useState('')
  const [fecha1,        setFecha1]        = useState('')
  const [vobo2,         setVobo2]         = useState('')
  const [nombre2,       setNombre2]       = useState('')
  const [firma2,        setFirma2]        = useState('')
  const [fecha2,        setFecha2]        = useState('')
  const [observaciones, setObservaciones] = useState('')

  const handleAprobacion = (field: string, val: string) => {
    const setters: Record<string, (v: string) => void> = {
      vobo1: setVobo1, nombre1: setNombre1, firma1: setFirma1, fecha1: setFecha1,
      vobo2: setVobo2, nombre2: setNombre2, firma2: setFirma2, fecha2: setFecha2,
    }
    setters[field]?.(val)
  }

  const config = useMemo<SelloEstudioTransmisionConfig>(() => ({
    bounds: { xmin: 0, ymin: 0, xmax, ymax },
    empreviso, estudioNum, notas: notas || undefined,
    vobo1, nombre1, firma1, fecha1,
    vobo2, nombre2, firma2, fecha2,
    observaciones: observaciones || undefined,
  }), [xmax, ymax, empreviso, estudioNum, notas,
       vobo1, nombre1, firma1, fecha1,
       vobo2, nombre2, firma2, fecha2, observaciones])

  const sello = useMemo(() => new CSelloEstudioTransmision(config), [config])
  const f = sello.computeLayoutFactors()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_estudio_transmision
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello_estudio_transmision.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Bounds → layout factors */}
            <Card variant="outlined">
              <CardHeader
                title="Bounds → factores de layout"
                subheader="largo y alto se calculan de bounds + empalmes"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="bounds.xmax" type="number" value={xmax}
                    onChange={e => setXmax(Number(e.target.value))}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText={`largo = ${f.largo.toFixed(1)} mm (empalmes=0, ≤10 branch)`}
                  />
                  <TextField
                    label="bounds.ymax" type="number" value={ymax}
                    onChange={e => setYmax(Number(e.target.value))}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText={`alto = ${f.alto.toFixed(1)} mm`}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Header */}
            <Card variant="outlined">
              <CardHeader
                title="Encabezado"
                subheader="tbl_primera_parte + tbl_estudio_num"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    select label="empreviso" value={empreviso}
                    onChange={e => setEmpreviso(e.target.value)}
                    size="small" fullWidth
                    helperText={`→ ${sello.logoSymbolName()}`}
                  >
                    {EMPREVISO_OPTIONS.map(o => (
                      <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="estudio_num" value={estudioNum} onChange={e => setEstudioNum(e.target.value)}
                    size="small" fullWidth helperText="llenarDatosDinamicos → tbl_estudio_num(1,2)" />
                </Stack>
              </CardContent>
            </Card>

            {/* Approval block 1 */}
            <AprobacionCard
              title="Bloque aprobación 1"
              prefix="1"
              values={{ vobo: vobo1, nombre: nombre1, firma: firma1, fecha: fecha1 }}
              onChange={handleAprobacion}
            />

            {/* Approval block 2 */}
            <AprobacionCard
              title="Bloque aprobación 2"
              prefix="2"
              values={{ vobo: vobo2, nombre: nombre2, firma: firma2, fecha: fecha2 }}
              onChange={handleAprobacion}
            />

            {/* Notes / observations */}
            <Card variant="outlined">
              <CardHeader
                title="Notas y observaciones"
                subheader="tbl_tercera_parte cols 1 y 6"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="notas" value={notas}
                    onChange={e => setNotas(e.target.value)}
                    size="small" fullWidth multiline rows={3}
                    helperText={`tbl_tercera_parte(1,1) · default: "${SELLO_ET_DEFAULTS.notasDefault}"`}
                    placeholder={SELLO_ET_DEFAULTS.notasDefault}
                  />
                  <TextField
                    label="observaciones" value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    size="small" fullWidth multiline rows={3}
                    helperText="tbl_tercera_parte(3,6)"
                  />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* Visual schematic */}
            <Card variant="outlined">
              <CardHeader
                title="Sello renderizado"
                subheader="5 tablas · layout dinámico desde bounds"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <SelloSchematic sello={sello} />
              </CardContent>
            </Card>

            {/* Layout factors */}
            <Card variant="outlined">
              <CardHeader title="Factores de layout calculados"
                titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <LayoutFactorsCard sello={sello} />
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  <strong>Rama empalmes &gt; 10:</strong> largo = width × (empalmes/100) + empalmes + 30
                  (el ancho crece con la cantidad de empalmes para dar espacio al grafico GIS).
                </Typography>
              </CardContent>
            </Card>

            {/* Table structure */}
            <Card variant="outlined">
              <CardHeader title="Estructura de tablas" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Filas × Cols', 'Origen Y', 'Nota'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_general',       '1×1',   'oy',        'contenedor general'],
                      ['tbl_primera_parte', '1×3',   'oy',        'logo|título|estudio (30%/50%/20%)'],
                      ['tbl_estudio_num',   '1×2*',  'oy−alto*2/2.3', '*CTblLineaHorizontal — Fase 5 type'],
                      ['tbl_segunda_parte', '4×1',   'oy−alto×2',  'tramo/cable/longitud/grafico'],
                      ['tbl_tercera_parte', '5×6',   'oy−1450',   'notas+firmas+observaciones (fijo)'],
                    ].map(([name, dim, y, note], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{dim}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{y}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>{note}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  * <code>CTblLineaHorizontal</code> es un tipo de tabla especializado no modeled aún; se modela como 1×2 regular.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
