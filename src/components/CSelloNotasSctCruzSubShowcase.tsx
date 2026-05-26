import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  FormControl, Grid, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  CSelloNotasSctCruzSub,
  TABLE_CONFIG_CRUZ_SUB,
  type SelloNotasSctConfig,
} from '../models/CSelloNotasSctCruzSub'
import {
  ENUM_TIPO_CABLE,
  ENUM_TIPO_PROC,
  ENUM_TIPO_INST,
  TABLE_CONFIG_BASE,
} from '../models/CSelloNotasSct'

const DEFAULTS: SelloNotasSctConfig = {
  estado:       'JALISCO',
  tipoCable:    ENUM_TIPO_CABLE[1],
  procedimiento: ENUM_TIPO_PROC[1],
  instalacion:  ENUM_TIPO_INST[1],
}

// Notas que pertenecen al padre vs. al hijo, para colorear el diff
const NOTAS_BASE_COUNT = 4

function contarNotas(texto: string): number {
  return (texto.match(/^\s+\d+\.-/gm) ?? []).length
}

export function CSelloNotasSctCruzSubShowcase() {
  const [config, setConfig] = useState<SelloNotasSctConfig>(DEFAULTS)

  const sello = useMemo(() => new CSelloNotasSctCruzSub(config), [config])

  const textoCompleto = useMemo(() => sello.buildTexto(), [sello])

  const totalNotas = contarNotas(textoCompleto)

  const update = (key: keyof SelloNotasSctConfig) =>
    (value: string) => setConfig(prev => ({ ...prev, [key]: value }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CSelloNotasSctCruzSub
        <Chip label="Fase 5 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip
          label={`allowedOnMenu = ${CSelloNotasSctCruzSub.allowedOnMenu}`}
          size="small"
          sx={{ ml: 1 }}
          variant="outlined"
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_sello_notas_sct_cruz_sub.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Sello de notas SCT para cruzamientos subterráneos. Hereda notas 1-4 de{' '}
        <code>CSelloNotasSct</code> y añade notas 5-13 específicas del procedimiento.
        Sobrescribe las dimensiones de la tabla (fila 2: 55 → 210 mm).
      </Typography>

      <Grid container spacing={3}>

        {/* Atributos editables */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Atributos del sello (defined_attributes)"
              subheader="Variables dinámicas interpoladas en el texto"
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
                  helperText="Se aplica .toUpperCase() — nota 3, 5"
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
              </Stack>

              {/* Tabla de configuración: padre vs hijo */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  <strong>prvCrea_Cfg_Tbl_Notas_Grales</strong> — override de dimensiones (mm)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>propiedad</TableCell>
                      <TableCell>padre</TableCell>
                      <TableCell>hijo (este)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>fila 1 (título)</TableCell>
                      <TableCell>{TABLE_CONFIG_BASE.rowTitle} mm</TableCell>
                      <TableCell>{TABLE_CONFIG_CRUZ_SUB.rowTitle} mm</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>fila 2 (texto)</TableCell>
                      <TableCell>{TABLE_CONFIG_BASE.rowText} mm</TableCell>
                      <TableCell><strong>{TABLE_CONFIG_CRUZ_SUB.rowText} mm ↑</strong></TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>col 1 (ancho)</TableCell>
                      <TableCell>{TABLE_CONFIG_BASE.colWidth} mm</TableCell>
                      <TableCell><strong>{TABLE_CONFIG_CRUZ_SUB.colWidth} mm ↑</strong></TableCell>
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
                  <Chip
                    label={`1-${NOTAS_BASE_COUNT} padre`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                  <Chip
                    label={`5-13 hijo`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              }
              subheader="Magik: sTexto de la celda (2,1) de tbl_notas_grales"
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
                  maxHeight: 560,
                  overflowY: 'auto',
                  m: 0,
                }}
              >
                {textoCompleto.split('\n').map((line, i) => {
                  const isExtra = /^\s+(([5-9]|1[0-3])\.-|1[0-3]\.)/.test(line)
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
                      {line || ' '}
                    </Box>
                  )
                })}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Azul = notas 5-13 añadidas por <code>CSelloNotasSctCruzSub.buildTexto()</code> ·
                Negro = notas 1-4 heredadas del padre vía <code>super.buildTexto()</code>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Jerarquía de herencia */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="Jerarquía Magik → TypeScript"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label="layout_element (GIS)" variant="outlined" size="small" />
                <Typography variant="caption">→</Typography>
                <Chip label="CSelloNotasSct" color="default" size="small"
                  sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">
                  notas 1-4 · tabla 55 mm · enums tipoCable/tipoProc/tipoInst
                </Typography>
                <Typography variant="caption">→</Typography>
                <Chip label="CSelloNotasSctCruzSub" color="primary" size="small"
                  sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">
                  notas 5-13 · tabla 210 mm · sin slots propios
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
