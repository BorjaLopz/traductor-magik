import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid,
  InputAdornment, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSello3EstudioTransmision,
  TABLA_SELLO3_ET,
  type Sello3EstudioTransmisionConfig,
} from '../models/CSello3EstudioTransmision'

// =============================================================================
// SELLO TABLE PREVIEW
// =============================================================================

interface RowDef {
  label: string
  value: string
  computed?: boolean
  derived?: boolean  // filled by llenarDatosCeldas (not llenarDatosDinamicos)
}

function SelloTablePreview({ rows, colWidths, colour }: {
  rows: RowDef[]
  colWidths: readonly [number, number]
  colour: string
}) {
  const totalW = colWidths[0] + colWidths[1]
  const scale  = Math.min(480 / totalW, 3)

  return (
    <Box>
      <Box sx={{ display: 'inline-block', border: `1.5px solid ${colour}`, fontFamily: 'monospace' }}>
        {rows.map((row, i) => (
          <Box key={i} sx={{
            display: 'flex',
            borderBottom: i < rows.length - 1 ? `1px solid ${colour}` : undefined,
            background: row.computed ? '#fffde7' : undefined,
          }}>
            <Box sx={{
              width: colWidths[0] * scale,
              px: 0.5, py: '2px',
              borderRight: `1px solid ${colour}`,
              fontWeight: 'bold',
              fontSize: 10,
              color: colour,
              whiteSpace: 'nowrap',
            }}>
              {`${i + 1}. ${row.label}`}
            </Box>
            <Box sx={{
              width: colWidths[1] * scale,
              px: 0.5, py: '2px',
              fontSize: 10,
              color: row.computed ? '#f57f17' : colour,
              fontWeight: row.computed ? 'bold' : undefined,
              textAlign: 'right',
              whiteSpace: 'nowrap',
            }}>
              {row.value}
            </Box>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: {colWidths[0]} mm · Col 2: {colWidths[1]} mm · {rows.length} filas de {3 * 0.7} mm c/u
      </Typography>
    </Box>
  )
}

// =============================================================================
// FLOAT INPUT
// =============================================================================

function FloatField({ label, value, onChange, helperText, unit = 'dB' }: {
  label: string
  value: number
  onChange: (v: number) => void
  helperText?: string
  unit?: string
}) {
  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      size="small"
      fullWidth
      helperText={helperText}
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        },
      }}
      sx={{ '& input': { textAlign: 'right' } }}
    />
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSello3EstudioTransmisionShowcase() {
  const [potencia,             setPotencia]             = useState(0.0)
  const [sensibilidad,         setSensibilidad]         = useState(0.0)
  const [maxPotencia,          setMaxPotencia]          = useState(0.0)
  const [atenuacionCable,      setAtenuacionCable]      = useState(0.0)
  const [atenuacionEnFibra,    setAtenuacionEnFibra]    = useState(0.0)
  const [perdidaPorEmpalmes,   setPerdidaPorEmpalmes]   = useState(0.0)
  const [perdidaPorConectores, setPerdidaPorConectores] = useState(0.0)
  const [margenRespaldo,       setMargenRespaldo]       = useState(0.0)
  const [colour,               setColour]               = useState('#000000')

  const config = useMemo<Sello3EstudioTransmisionConfig>(() => ({
    potencia, sensibilidad, maxPotencia, atenuacionCable,
    atenuacionEnFibra, perdidaPorEmpalmes, perdidaPorConectores, margenRespaldo,
  }), [potencia, sensibilidad, maxPotencia, atenuacionCable,
       atenuacionEnFibra, perdidaPorEmpalmes, perdidaPorConectores, margenRespaldo])

  const sello = useMemo(() => new CSello3EstudioTransmision(config), [config])

  const fmt = (v: number): string => v === 0 ? '0.0' : v.toFixed(2)

  const rows: RowDef[] = [
    { label: 'POTENCIA DE SALIDA DEL EMISOR',         value: fmt(sello.potencia) },
    { label: 'SENSIBILIDAD DEL RECEPTOR',             value: fmt(sello.sensibilidad) },
    { label: 'MAXIMA POTENCIA DE ENTRADA PERMISIBLE', value: fmt(sello.maxPotencia) },
    { label: 'ATENUACION PERMISIBLE EN EL CABLE',     value: fmt(sello.atenuacionCable) },
    { label: 'ATENUACION EN LA FIBRA',                value: fmt(sello.atenuacionEnFibra),    derived: true },
    { label: 'PERDIDA POR EMPALMES',                  value: fmt(sello.perdidaPorEmpalmes),   derived: true },
    { label: 'PERDIDA POR CONECTORES',                value: fmt(sello.perdidaPorConectores), derived: true },
    { label: 'MARGEN DE RESPALDO PARA MANTENIMIENTO', value: fmt(sello.margenRespaldo),       derived: true },
    { label: 'ATENUACION TOTAL',                      value: fmt(sello.atenuacionTotal),      computed: true },
    { label: 'MARGEN RESERVA ADICIONAL',              value: fmt(sello.margenReservaAdicional), computed: true },
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello3_estudio_transmision
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello3_estudio_transmision.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Dynamic inputs (llenarDatosDinamicos) */}
            <Card variant="outlined">
              <CardHeader
                title="Parámetros del sistema (filas 1–4)"
                subheader="llenarDatosDinamicos — aplicados en drawContentOn"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <FloatField label="potencia"        value={potencia}        onChange={setPotencia}
                    helperText="Potencia de salida del emisor" unit="dBm" />
                  <FloatField label="sensibilidad"    value={sensibilidad}    onChange={setSensibilidad}
                    helperText="Sensibilidad receptor" unit="dBm" />
                  <FloatField label="max_potencia"    value={maxPotencia}     onChange={setMaxPotencia}
                    helperText="Máxima potencia de entrada permisible" unit="dBm" />
                  <FloatField label="atenuacion_cable" value={atenuacionCable} onChange={setAtenuacionCable}
                    helperText="Atenuación permisible en el cable" />
                </Stack>
              </CardContent>
            </Card>

            {/* Static-source inputs (llenarDatosCeldas) */}
            <Card variant="outlined">
              <CardHeader
                title="Pérdidas de enlace (filas 5–8)"
                subheader="llenarDatosCeldas — aplicados en actualizarDatos"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <FloatField label="atenuacion_en_fibra"     value={atenuacionEnFibra}    onChange={setAtenuacionEnFibra}
                    helperText="Atenuación en la fibra" />
                  <FloatField label="perdida_por_empalmes"    value={perdidaPorEmpalmes}   onChange={setPerdidaPorEmpalmes}
                    helperText="Pérdida por empalmes" />
                  <FloatField label="perdida_por_conectores"  value={perdidaPorConectores} onChange={setPerdidaPorConectores}
                    helperText="Pérdida por conectores" />
                  <FloatField label="margen_respaldo"         value={margenRespaldo}       onChange={setMargenRespaldo}
                    helperText="Margen de respaldo para mantenimiento" />
                </Stack>
              </CardContent>
            </Card>

            {/* Computed summary */}
            <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
              <CardHeader title="Valores calculados" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2.2 }}>
                  <Box>
                    <strong>ATENUACION TOTAL</strong>
                    <Box component="span" sx={{ float: 'right', color: 'warning.main', fontWeight: 'bold' }}>
                      {fmt(sello.atenuacionTotal)} dB
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: 10, color: 'text.secondary', mb: 1 }}>
                    = {fmt(atenuacionEnFibra)} + {fmt(perdidaPorEmpalmes)} + {fmt(perdidaPorConectores)}
                  </Box>
                  <Box>
                    <strong>MARGEN RESERVA ADICIONAL</strong>
                    <Box component="span" sx={{ float: 'right', color: 'warning.main', fontWeight: 'bold' }}>
                      {fmt(sello.margenReservaAdicional)} dB
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: 10, color: 'text.secondary' }}>
                    = margen_respaldo (fila 8)
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <TextField
              label="colour"
              type="color"
              value={colour}
              onChange={e => setColour(e.target.value)}
              size="small"
              fullWidth
            />

          </Stack>
        </Grid>

        {/* RIGHT: preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Sello renderizado"
                subheader={`tbl_tabla_unica — 10 filas × 2 cols · ${TABLA_SELLO3_ET.anchosEscalados[0]}+${TABLA_SELLO3_ET.anchosEscalados[1]} mm`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <SelloTablePreview
                  rows={rows}
                  colWidths={TABLA_SELLO3_ET.anchosEscalados}
                  colour={colour}
                />
                <Box sx={{ mt: 1 }}>
                  <Chip size="small" label="fondo amarillo = fila calculada" sx={{ mr: 1, bgcolor: '#fffde7', fontSize: 10 }} />
                  <Chip size="small" label="valor naranja = derivado" sx={{ color: '#f57f17', fontSize: 10 }} variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Estructura */}
            <Card variant="outlined">
              <CardHeader title="Estructura de la tabla" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  <Box sx={{ mb: 1 }}>
                    <strong>tbl_tabla_unica</strong> — 10 renglones × 2 columnas · escala 0.7
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
                    {[
                      ['Dimensión', 'Magik', 'Escalado'],
                      ['Altura fila', '3 mm', '2.1 mm'],
                      ['Ancho col 1', '65 mm', '45.5 mm'],
                      ['Ancho col 2', '25 mm', '17.5 mm'],
                      ['Ancho total', '90 mm', '63 mm'],
                      ['Alto total',  '30 mm', '21 mm'],
                    ].map(([a, b, c], i) => (
                      <>
                        <Box key={`a${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : undefined }}>{a}</Box>
                        <Box key={`b${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : undefined }}>{b}</Box>
                        <Box key={`c${i}`} sx={{ fontWeight: i === 0 ? 'bold' : undefined, color: i === 0 ? 'text.secondary' : 'primary.main' }}>{c}</Box>
                      </>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Fila', 'Atributo Magik', 'TypeScript', 'Método', 'Tipo'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['1', 'potencia',              'potencia',             'llenarDatosDinamicos', ':float'],
                      ['2', 'sensibilidad',           'sensibilidad',         'llenarDatosDinamicos', ':float'],
                      ['3', 'max_potencia',           'maxPotencia',          'llenarDatosDinamicos', ':float'],
                      ['4', 'atenuacion_cable',       'atenuacionCable',      'llenarDatosDinamicos', ':float'],
                      ['5', 'atenuacion_en_fibra',    'atenuacionEnFibra',    'llenarDatosCeldas',    ':float'],
                      ['6', 'perdida_por_empalmes',   'perdidaPorEmpalmes',   'llenarDatosCeldas',    ':float'],
                      ['7', 'perdida_por_conectores', 'perdidaPorConectores', 'llenarDatosCeldas',    ':float'],
                      ['8', 'margen_respaldo',        'margenRespaldo',       'llenarDatosCeldas',    ':float'],
                      ['9', '(suma 5+6+7)',           'atenuacionTotal',      'llenarDatosCeldas',    'computed'],
                      ['10','(= fila 8)',             'margenReservaAdicional','llenarDatosCeldas',   'computed'],
                    ].map(([f, a, b, c, d], i) => (
                      <Box component="tr" key={i} sx={{
                        borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 },
                        bgcolor: i >= 8 ? '#fffde7' : undefined,
                      }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold' }}>{f}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{a}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{b}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{c}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{d}</Box>
                      </Box>
                    ))}
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
