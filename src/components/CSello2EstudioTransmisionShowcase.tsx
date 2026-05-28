import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material'
import {
  CSello2EstudioTransmision,
  TABLA_SELLO2_ET_UNO,
  TABLA_SELLO2_ET_DOS,
  type Sello2EstudioTransmisionConfig,
} from '../models/CSello2EstudioTransmision'

// =============================================================================
// SELLO TABLE PREVIEW
// =============================================================================

interface TableRow {
  label: string
  value: string
  gis?: boolean
}

function SelloTablePreview({
  title,
  rows,
  colWidths,
  colour,
}: {
  title?: string
  rows: TableRow[]
  colWidths: readonly [number, number]
  colour: string
}) {
  const totalW = colWidths[0] + colWidths[1]
  const scale = Math.min(340 / totalW, 3)

  return (
    <Box>
      {title && (
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 0.5, display: 'block' }}>
          {title}
        </Typography>
      )}
      <Box sx={{
        display: 'inline-block',
        border: `1.5px solid ${colour}`,
        fontFamily: 'monospace',
        fontSize: 10,
      }}>
        {rows.map((row, i) => (
          <Box key={i} sx={{
            display: 'flex',
            borderBottom: i < rows.length - 1 ? `1px solid ${colour}` : undefined,
          }}>
            <Box sx={{
              width: colWidths[0] * scale,
              px: 0.5,
              py: '2px',
              borderRight: `1px solid ${colour}`,
              fontWeight: 'bold',
              fontSize: 10,
              color: colour,
              whiteSpace: 'nowrap',
            }}>
              {row.label}
            </Box>
            <Box sx={{
              width: colWidths[1] * scale,
              px: 0.5,
              py: '2px',
              fontSize: 10,
              color: row.gis ? 'text.disabled' : colour,
              fontStyle: row.gis ? 'italic' : undefined,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {row.value || (row.gis ? '0 ★' : '—')}
            </Box>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {colWidths[0]} mm · {colWidths[1]} mm (escala 0.7)
      </Typography>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSello2EstudioTransmisionShowcase() {
  const [conectores,    setConectores]    = useState('2')
  const [configuracion, setConfiguracion] = useState('1625')
  const [aumento,       setAumento]       = useState('')
  const [atenuador,     setAtenuador]     = useState('')
  const [valMin,        setValMin]        = useState('1')
  const [colour,        setColour]        = useState('#000000')

  const config = useMemo<Sello2EstudioTransmisionConfig>(() => ({
    conectores,
    configuracion,
    aumento,
    atenuador,
    valMin,
  }), [conectores, configuracion, aumento, atenuador, valMin])

  const sello = useMemo(() => new CSello2EstudioTransmision(config), [config])
  const siNoOptions = useMemo(() => sello.siNo(), [sello])

  // tbl_tabla_uno rows
  const rowsUno: TableRow[] = [
    { label: 'NO. DE EMPALMES',   value: sello.getEmpalmes().length.toString(), gis: true },
    { label: 'NO. DE CONECTORES', value: sello.conectores },
    { label: 'CONFIGURACION',     value: sello.configuracion },
    { label: 'AUMENTO',           value: sello.aumento },
  ]

  // tbl_tabla_dos rows
  const rowsDos: TableRow[] = [
    { label: 'REQUIERE ATENUADOR', value: sello.atenuador },
    { label: 'VALOR MINIMO',       value: sello.valMin },
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello2_estudio_transmision
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello2_estudio_transmision.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* GIS-computed */}
            <Card variant="outlined" sx={{ borderColor: 'divider', opacity: 0.8 }}>
              <CardHeader
                title="NO. DE EMPALMES — GIS"
                subheader="getempalmes() filtra splice_closure de oEngine → Fase 5"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.disabled' }}>
                  Valor actual: <strong>0</strong> (oEngine = undefined)
                </Box>
              </CardContent>
            </Card>

            {/* User attributes */}
            <Card variant="outlined">
              <CardHeader
                title="Atributos del sello"
                subheader="defined_attributes — editables desde propiedades del layout"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="conectores"
                    value={conectores}
                    onChange={e => setConectores(e.target.value)}
                    size="small" fullWidth
                    helperText='default: "2"'
                  />
                  <TextField
                    label="configuracion"
                    value={configuracion}
                    onChange={e => setConfiguracion(e.target.value)}
                    size="small" fullWidth
                    helperText='default: "1625"'
                  />
                  <TextField
                    label="aumento"
                    value={aumento}
                    onChange={e => setAumento(e.target.value)}
                    size="small" fullWidth
                  />
                  <TextField
                    select
                    label="atenuador"
                    value={atenuador}
                    onChange={e => setAtenuador(e.target.value)}
                    size="small" fullWidth
                    helperText="enum_method: :si_no"
                  >
                    {Array.from(siNoOptions.entries()).map(([k, v]) => (
                      <MenuItem key={k} value={v}>{v || '(vacío)'}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="val_min"
                    value={valMin}
                    onChange={e => setValMin(e.target.value)}
                    size="small" fullWidth
                    helperText='default: "1"'
                  />
                  <TextField
                    label="colour"
                    type="color"
                    value={colour}
                    onChange={e => setColour(e.target.value)}
                    size="small" fullWidth
                  />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: sello preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Sello renderizado"
                subheader="tbl_tabla_uno (4×2) + tbl_tabla_dos (2×2) — 100 mm separación Y"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <SelloTablePreview
                      title={`${TABLA_SELLO2_ET_UNO.nombre}  (${TABLA_SELLO2_ET_UNO.alturasEscaladas[0]}mm × 4 filas)`}
                      rows={rowsUno}
                      colWidths={TABLA_SELLO2_ET_UNO.anchosEscalados}
                      colour={colour}
                    />
                  </Box>
                  <Box>
                    <SelloTablePreview
                      title={`${TABLA_SELLO2_ET_DOS.nombre}  (origen Y −100 mm)`}
                      rows={rowsDos}
                      colWidths={TABLA_SELLO2_ET_DOS.anchosEscalados}
                      colour={colour}
                    />
                  </Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    ★ NO. DE EMPALMES se rellena desde <code>oEngine.elements()</code> en Fase 5
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Estructura */}
            <Card variant="outlined">
              <CardHeader title="Estructura del sello" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Filas × Cols', 'Dim bruta', 'Escalada (×0.7)', 'Origen Y'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_tabla_uno', '4 × 2', '35+15 mm | 3mm/fila', '24.5+10.5 mm | 2.1mm/fila', 'coordInicio'],
                      ['tbl_tabla_dos', '2 × 2', '35+15 mm | 3mm/fila', '24.5+10.5 mm | 2.1mm/fila', 'coordInicio − 100 mm'],
                    ].map(([a, b, c, d, e], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                        {[a, b, c, d, e].map((v, j) => (
                          <Box component="td" key={j} sx={{ p: '3px 8px', fontWeight: j === 0 ? 'bold' : undefined, color: j === 0 ? 'primary.main' : undefined }}>{v}</Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Flujo de datos */}
            <Card variant="outlined">
              <CardHeader title="Flujo de datos por celda" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Celda', 'Contenido', 'Fuente', 'Método'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_tabla_uno (1,2)', 'empalmes count', 'oEngine.elements() [Fase 5]', 'llenarDatosCeldas'],
                      ['tbl_tabla_uno (2,2)', 'conectores', 'atributo XML / prop', 'llenarDatosDinamicos'],
                      ['tbl_tabla_uno (3,2)', 'configuracion', 'atributo XML / prop', 'llenarDatosDinamicos'],
                      ['tbl_tabla_uno (4,2)', 'aumento', 'atributo XML / prop', 'llenarDatosDinamicos'],
                      ['tbl_tabla_dos (1,2)', 'atenuador', 'enum si_no', 'llenarDatosDinamicos'],
                      ['tbl_tabla_dos (2,2)', 'val_min', 'atributo XML / prop', 'llenarDatosDinamicos'],
                    ].map(([a, b, c, d], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold', color: 'primary.main' }}>{a}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{b}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{c}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{d}</Box>
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
