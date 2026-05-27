import { useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, InputAdornment,
  Stack, TextField, Typography,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { CAPACIDADES } from '../models/CTablaCapacidades'

// ─── Rendered table preview ───────────────────────────────────────────────────

function TablaSelloPreview({ filter }: { filter: string }) {
  const COL1_W = 6   // mm
  const COL2_W = 45  // mm
  const SCALE  = 3.5
  const W1 = COL1_W * SCALE
  const W2 = COL2_W * SCALE
  const H1 = 8 * SCALE   // header row
  const H2 = 5 * SCALE   // data rows

  const filtered = filter
    ? CAPACIDADES.filter(e =>
        e.letra.toLowerCase().includes(filter.toLowerCase()) ||
        e.descripcion.toLowerCase().includes(filter.toLowerCase()))
    : CAPACIDADES

  return (
    <Box>
      <Box sx={{
        display: 'inline-block',
        border: '1.5px solid #555',
        fontFamily: 'monospace',
        minWidth: W1 + W2,
      }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #555' }}>
          <Box sx={{
            width: W1, height: H1,
            borderRight: 'none',
            bgcolor: '#e3f2fd',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            pt: 0.3,
          }} />
          <Box sx={{
            width: W2, height: H1,
            borderLeft: 'none',
            bgcolor: '#e3f2fd',
            display: 'flex', alignItems: 'flex-start',
            px: 0.5, pt: 0.3,
          }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold', lineHeight: 1.3 }}>
              ABREVIATURAS{'\n'}PARA CAPACIDAD DE CABLE
            </Typography>
          </Box>
        </Box>

        {/* Data rows */}
        {filtered.map(({ letra, descripcion }) => (
          <Box key={letra} sx={{ display: 'flex', borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 'none' } }}>
            <Box sx={{
              width: W1, height: H2,
              borderRight: '1px solid #ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: '#fffde7',
            }}>
              <Typography sx={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}>
                {letra}
              </Typography>
            </Box>
            <Box sx={{
              width: W2, height: H2,
              display: 'flex', alignItems: 'center',
              px: 0.5,
              bgcolor: '#fafafa',
            }}>
              <Typography sx={{ fontSize: 9, fontFamily: 'monospace' }}>
                {descripcion}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: {COL1_W} mm · Col 2: {COL2_W} mm · Fila 1: 8 mm · Filas 2-22: 5 mm
        {filter && ` · Mostrando ${filtered.length} de ${CAPACIDADES.length}`}
      </Typography>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CTablaCapacidadesShowcase() {
  const [filter, setFilter] = useState('')

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla_capacidades
        <Chip label="Fase 2 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="100% estático" size="small" color="info" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_tabla_capacidades.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Tabla de abreviaturas para capacidades de cable en planos Ruta de Cables FO.
        Sin atributos, sin GIS — todo el contenido es estático y se establece en <code>etiqueta_celdas()</code>.
        Tabla 22×2: fila 1 = título, filas 2-22 = 21 pares letra↔descripción.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        <Grid size={{ xs: 12, md: 5 }}>
        {/* Rendered preview */}
        <Card variant="outlined">
          <CardHeader
            title="Vista previa del sello"
            subheader="tbl_capacidades — escala 3.5×"
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'caption' }}
            action={
              <TextField
                size="small"
                placeholder="Filtrar…"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                sx={{ width: 160 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined sx={{ fontSize: 16 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            }
          />
          <CardContent>
            <TablaSelloPreview filter={filter} />
          </CardContent>
        </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
        {/* Structure reference */}
        <Stack spacing={2}>

          <Card variant="outlined">
            <CardHeader
              title="Estructura de la tabla"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                    {['Renglon', 'Alto', 'Col 1 (6mm)', 'Col 2 (45mm)', 'Notas'].map(h => (
                      <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#e3f2fd' }}>
                    <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>1</Box>
                    <Box component="td" sx={{ p: '3px 8px' }}>8 mm</Box>
                    <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>— (bordeIzq oculto en col2)</Box>
                    <Box component="td" sx={{ p: '3px 8px' }}>"ABREVIATURAS\nPARA CAPACIDAD DE CABLE"</Box>
                    <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>30pt, top_left, ang 5°</Box>
                  </Box>
                  <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>2-22</Box>
                    <Box component="td" sx={{ p: '3px 8px' }}>5 mm</Box>
                    <Box component="td" sx={{ p: '3px 8px' }}>Letra (A…Z)</Box>
                    <Box component="td" sx={{ p: '3px 8px' }}>Descripción capacidad</Box>
                    <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>20pt · col1: centre_left, ang 2°</Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 1.5, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                Bordes ocultos: celda(1,1).borderDer · celda(1,2).borderIzq
                → el encabezado de la fila 1 visualmente fusiona las dos celdas.
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader
              title={`Datos estáticos — ${CAPACIDADES.length} entradas`}
              subheader="Letras que faltan en la secuencia: O, P, Q, U, Y"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                    {['Fila', 'Letra', 'Descripción'].map(h => (
                      <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {CAPACIDADES.map(({ letra, descripcion }, i) => (
                    <Box component="tr" key={letra} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box component="td" sx={{ p: '2px 8px', color: 'text.disabled' }}>{i + 2}</Box>
                      <Box component="td" sx={{ p: '2px 8px', color: 'primary.main', fontWeight: 'bold' }}>{letra}</Box>
                      <Box component="td" sx={{ p: '2px 8px' }}>{descripcion}</Box>
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
