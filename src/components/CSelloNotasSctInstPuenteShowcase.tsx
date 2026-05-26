import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  FormControl, Grid, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  CSelloNotasSctInstPuente,
  TABLE_CONFIG_INST_PUENTE,
  type SelloNotasSctConfig,
} from '../models/CSelloNotasSctInstPuente'
import {
  ENUM_TIPO_CABLE,
  ENUM_TIPO_PROC,
  ENUM_TIPO_INST,
  TABLE_CONFIG_BASE,
} from '../models/CSelloNotasSct'
import { TABLE_CONFIG_CRUZ_SUB } from '../models/CSelloNotasSctCruzSub'

const DEFAULTS: SelloNotasSctConfig = {
  estado:        'JALISCO',
  tipoCable:     ENUM_TIPO_CABLE[1],
  procedimiento: ENUM_TIPO_PROC[1],
  instalacion:   ENUM_TIPO_INST[1],
}

export function CSelloNotasSctInstPuenteShowcase() {
  const [config, setConfig] = useState<SelloNotasSctConfig>(DEFAULTS)

  const sello         = useMemo(() => new CSelloNotasSctInstPuente(config), [config])
  const textoCompleto = useMemo(() => sello.buildTexto(), [sello])

  const totalNotas = (textoCompleto.match(/^\s+\d+\.-/gm) ?? []).length

  const update = (key: keyof SelloNotasSctConfig) =>
    (value: string) => setConfig(prev => ({ ...prev, [key]: value }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CSelloNotasSctInstPuente
        <Chip label="Fase 5 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip
          label={`allowedOnMenu = ${CSelloNotasSctInstPuente.allowedOnMenu}`}
          size="small"
          sx={{ ml: 1 }}
          variant="outlined"
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_sello_notas_sct_inst_puente.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Sello de notas SCT para instalación lateral en puente. Hereda notas 1-4 de{' '}
        <code>CSelloNotasSct</code> y añade notas 5-11 específicas.
        Fila de texto: 55 → 170 mm (menos alto que <code>CruzSub</code> porque son menos notas).
      </Typography>

      <Grid container spacing={3}>

        {/* Atributos editables */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Atributos del sello (defined_attributes)"
              subheader="Variables dinámicas del padre — solo estado y tipoCable se usan en notas 5-11"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="estado"
                  value={config.estado}
                  onChange={e => update('estado')(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Usado en nota 5 · .toUpperCase()"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>tipo_cable</InputLabel>
                  <Select
                    value={config.tipoCable}
                    label="tipo_cable"
                    onChange={e => update('tipoCable')(e.target.value)}
                  >
                    {Object.entries(ENUM_TIPO_CABLE).map(([k, v]) => (
                      <MenuItem key={k} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>procedimiento</InputLabel>
                  <Select
                    value={config.procedimiento}
                    label="procedimiento"
                    onChange={e => update('procedimiento')(e.target.value)}
                  >
                    {Object.entries(ENUM_TIPO_PROC).map(([k, v]) => (
                      <MenuItem key={k} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>instalacion</InputLabel>
                  <Select
                    value={config.instalacion}
                    label="instalacion"
                    onChange={e => update('instalacion')(e.target.value)}
                  >
                    {Object.entries(ENUM_TIPO_INST).map(([k, v]) => (
                      <MenuItem key={k} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Chip
                  label="procedimiento e instalacion no se usan en las notas 5-11"
                  size="small"
                  variant="outlined"
                  color="warning"
                  sx={{ fontSize: 10, whiteSpace: 'normal', height: 'auto', py: 0.5 }}
                />
              </Stack>

              {/* Tabla de config: comparativa de las tres subclases */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  <strong>prvCrea_Cfg_Tbl_Notas_Grales</strong> — comparativa de subclases (mm)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>fila 2 (texto)</TableCell>
                      <TableCell>col 1</TableCell>
                      <TableCell>notas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{TABLE_CONFIG_BASE.rowText} mm</TableCell>
                      <TableCell>{TABLE_CONFIG_BASE.colWidth} mm</TableCell>
                      <TableCell>
                        <Chip label="base (1-4)" size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'success.light' }}>
                      <TableCell><strong>{TABLE_CONFIG_INST_PUENTE.rowText} mm ←</strong></TableCell>
                      <TableCell>{TABLE_CONFIG_INST_PUENTE.colWidth} mm</TableCell>
                      <TableCell>
                        <Chip label="inst_puente (1-11)" size="small" color="success" sx={{ fontSize: 10 }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{TABLE_CONFIG_CRUZ_SUB.rowText} mm</TableCell>
                      <TableCell>{TABLE_CONFIG_CRUZ_SUB.colWidth} mm</TableCell>
                      <TableCell>
                        <Chip label="cruz_sub (1-13)" size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Texto generado */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>buildTexto() — {totalNotas} notas generadas</span>
                  <Chip label="1-4 padre"  size="small" color="default" variant="outlined" />
                  <Chip label="5-11 hijo"  size="small" color="primary" variant="outlined" />
                </Stack>
              }
              subheader="Magik: sTexto +=  en celda (2,1) de tbl_notas_grales"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1.5,
                  maxHeight: 520,
                  overflowY: 'auto',
                  m: 0,
                }}
              >
                {textoCompleto.split('\n').map((line, i) => {
                  const isExtra = /^\s+(([5-9]|1[01])\.-|1[01]\.)/.test(line)
                  return (
                    <Box
                      key={i}
                      component="span"
                      sx={{
                        display: 'block',
                        color: isExtra ? 'primary.main' : 'text.primary',
                        fontWeight: isExtra && /^\s+\d+\.-/.test(line) ? 700 : 400,
                      }}
                    >
                      {line || ' '}
                    </Box>
                  )
                })}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Azul = notas 5-11 de <code>CSelloNotasSctInstPuente.buildTexto()</code> ·
                Negro = notas 1-4 heredadas vía <code>super.buildTexto()</code>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Jerarquía */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="Familia CSelloNotasSct — subclases por tipo de permiso SCT"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label="CSelloNotasSct" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Chip label="CruzSub"      size="small" variant="outlined" color="default" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                <Typography variant="caption" color="text.secondary">1-13 · 210 mm</Typography>
                <Typography variant="caption">·</Typography>
                <Chip label="InstPuente"   size="small" color="primary"  sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                <Typography variant="caption" color="text.secondary">1-11 · 170 mm</Typography>
                <Typography variant="caption">·</Typography>
                <Chip label="MargAereo…"  size="small" variant="outlined" color="default" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                <Typography variant="caption" color="text.secondary">otras subclases SCT</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
