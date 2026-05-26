import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  FormControl, Grid, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  CSelloNotasSctMargSub,
  TABLE_CONFIG_MARG_SUB,
  type SelloNotasSctConfig,
} from '../models/CSelloNotasSctMargSub'
import { ENUM_TIPO_CABLE, ENUM_TIPO_PROC, ENUM_TIPO_INST, TABLE_CONFIG_BASE } from '../models/CSelloNotasSct'
import { TABLE_CONFIG_INST_PUENTE } from '../models/CSelloNotasSctInstPuente'
import { TABLE_CONFIG_CRUZ_SUB } from '../models/CSelloNotasSctCruzSub'

const DEFAULTS: SelloNotasSctConfig = {
  estado:        'JALISCO',
  tipoCable:     ENUM_TIPO_CABLE[1],
  procedimiento: ENUM_TIPO_PROC[1],
  instalacion:   ENUM_TIPO_INST[1],
}

// Familia completa ordenada por altura de tabla
const FAMILIA = [
  { label: 'base (padre)',   config: TABLE_CONFIG_BASE,         notas: '1-4',  color: 'default' as const },
  { label: 'InstPuente',    config: TABLE_CONFIG_INST_PUENTE,  notas: '1-11', color: 'default' as const },
  { label: 'CruzSub',       config: TABLE_CONFIG_CRUZ_SUB,     notas: '1-13', color: 'default' as const },
  { label: 'MargSub (este)',config: TABLE_CONFIG_MARG_SUB,     notas: '1-15', color: 'primary' as const },
]

export function CSelloNotasSctMargSubShowcase() {
  const [config, setConfig] = useState<SelloNotasSctConfig>(DEFAULTS)

  const sello         = useMemo(() => new CSelloNotasSctMargSub(config), [config])
  const textoCompleto = useMemo(() => sello.buildTexto(), [sello])
  const totalNotas    = (textoCompleto.match(/^\s+\d+\.-/gm) ?? []).length

  const update = (key: keyof SelloNotasSctConfig) =>
    (value: string) => setConfig(prev => ({ ...prev, [key]: value }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CSelloNotasSctMargSub
        <Chip label="Fase 5 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip
          label={`allowedOnMenu = ${CSelloNotasSctMargSub.allowedOnMenu}`}
          size="small"
          sx={{ ml: 1 }}
          variant="outlined"
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_sello_notas_sct_marg_sub.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Sello de notas SCT para instalación marginal subterránea — la variante más extensa de la familia
        (notas 1-15, tabla 265 mm). Única subclase que usa{' '}
        <code>tipoCable</code>, <code>estado</code> <strong>e</strong> <code>instalacion</code>{' '}
        en las notas adicionales.
      </Typography>

      <Grid container spacing={3}>

        {/* Atributos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Atributos del sello"
              subheader="tipoCable, estado e instalacion se usan en notas 5-15"
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

                <Chip
                  label="procedimiento no se usa en las notas 5-15"
                  size="small"
                  variant="outlined"
                  color="warning"
                  sx={{ fontSize: 10, whiteSpace: 'normal', height: 'auto', py: 0.5 }}
                />
              </Stack>

              {/* Tabla comparativa familia completa */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  <strong>Familia CSelloNotasSct</strong> — progresión de altura por variante
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>variante</TableCell>
                      <TableCell>fila 2</TableCell>
                      <TableCell>col 1</TableCell>
                      <TableCell>notas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {FAMILIA.map(f => (
                      <TableRow
                        key={f.label}
                        sx={f.color === 'primary' ? { backgroundColor: 'primary.light' } : undefined}
                      >
                        <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                          {f.color === 'primary' ? <strong>{f.label}</strong> : f.label}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11 }}>
                          {f.color === 'primary'
                            ? <strong>{f.config.rowText} mm</strong>
                            : `${f.config.rowText} mm`}
                        </TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{f.config.colWidth} mm</TableCell>
                        <TableCell>
                          <Chip
                            label={f.notas}
                            size="small"
                            color={f.color}
                            variant={f.color === 'primary' ? 'filled' : 'outlined'}
                            sx={{ fontSize: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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
                  <Chip label="5-15 hijo"  size="small" color="primary" variant="outlined" />
                </Stack>
              }
              subheader="Magik: sTexto += en celda (2,1) de tbl_notas_grales"
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
                  maxHeight: 580,
                  overflowY: 'auto',
                  m: 0,
                }}
              >
                {textoCompleto.split('\n').map((line, i) => {
                  const isExtra = /^\s+([5-9]|1[0-5])\.-/.test(line)
                  const isHeader = /^\s+\d+\.-/.test(line)
                  return (
                    <Box
                      key={i}
                      component="span"
                      sx={{
                        display: 'block',
                        color: isExtra ? 'primary.main' : 'text.primary',
                        fontWeight: isExtra && isHeader ? 700 : 400,
                      }}
                    >
                      {line || ' '}
                    </Box>
                  )
                })}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Azul = notas 5-15 de <code>CSelloNotasSctMargSub.buildTexto()</code> ·
                Negro = notas 1-4 heredadas vía <code>super.buildTexto()</code>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
