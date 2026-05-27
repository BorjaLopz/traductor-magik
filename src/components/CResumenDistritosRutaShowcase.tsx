import { useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Grid, IconButton,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import {
  ETIQUETAS_COLUMNAS,
  TABLA_RESUMEN_DISTRITOS,
  type DistritoRutaRecord,
} from '../models/CResumenDistritosRuta'

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_DISTRITOS: DistritoRutaRecord[] = [
  { central: 'XOLA',    distrito: 'DTO-01', distancia_oc: '1.25', ruta: 'R-A', nse: 'A',   nipp: 'N-01', moda: '1', total_fibras: 96, fibras_asignadas: 48, reserva_grupo: 8,  reservas_generales: 4  },
  { central: 'XOLA',    distrito: 'DTO-02', distancia_oc: '2.80', ruta: 'R-B', nse: 'B',   nipp: 'N-02', moda: '2', total_fibras: 48, fibras_asignadas: 24, reserva_grupo: 4,  reservas_generales: 2  },
  { central: 'NARVARTE', distrito: 'DTO-03', distancia_oc: '4.10', ruta: 'R-C', nse: 'AB',  nipp: 'N-03', moda: '1', total_fibras: 144, fibras_asignadas: 72, reserva_grupo: 12, reservas_generales: 6 },
]

function makeEmptyDistrito(): DistritoRutaRecord {
  return { central: '', distrito: '', distancia_oc: '', ruta: '', nse: '', nipp: '', moda: '', total_fibras: 0, fibras_asignadas: 0, reserva_grupo: 0, reservas_generales: 0 }
}

// =============================================================================
// TABLE PREVIEW — CSS grid replica of the 11-column sello
// =============================================================================

const COL_TEMPLATE = '3fr 2.5fr 2fr 2fr 1.5fr 1.5fr 1.5fr 2fr 2fr 2fr 2fr'
const BORDER = '1px solid #455a64'
const HEADER_BG = '#eceff1'
const TITLE_BG = '#cfd8dc'
const DATA_BG = '#ffffff'
const DATA_EVEN_BG = '#f5f5f5'

function TablePreview({ distritos }: { distritos: DistritoRutaRecord[] }) {
  return (
    <Box sx={{ border: '2px solid #455a64', fontSize: 10, fontFamily: 'monospace', overflowX: 'auto' }}>
      {/* Row 1: title — borders hidden at top/left/right per Magik configura_tabla() */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: COL_TEMPLATE,
        background: TITLE_BG,
        borderBottom: BORDER,
      }}>
        {Array.from({ length: 11 }, (_, i) => (
          <Box key={i} sx={{
            p: '2px 4px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 11,
            // col index 5 (0-based) = col 6 (1-based) — title cell
            ...(i === 5 ? { color: '#1a237e' } : { color: 'transparent', userSelect: 'none' }),
          }}>
            {i === 5 ? 'RESUMEN DE DISTRITOS DE LA RUTA' : '·'}
          </Box>
        ))}
      </Box>

      {/* Row 2: column headers (multiline, 40 mm → taller) */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: COL_TEMPLATE,
        background: HEADER_BG,
        borderBottom: `2px solid #455a64`,
      }}>
        {ETIQUETAS_COLUMNAS.map(({ col, texto }) => (
          <Box key={col} sx={{
            p: '4px 2px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 9,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
            borderRight: col < 11 ? BORDER : 'none',
            minHeight: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {texto}
          </Box>
        ))}
      </Box>

      {/* Data rows */}
      {distritos.length === 0 && (
        <Box sx={{ p: 1, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic', fontSize: 10 }}>
          (sin distritos — agregar filas abajo)
        </Box>
      )}
      {distritos.map((dto, idx) => (
        <Box key={idx} sx={{
          display: 'grid',
          gridTemplateColumns: COL_TEMPLATE,
          background: idx % 2 === 0 ? DATA_BG : DATA_EVEN_BG,
          borderBottom: BORDER,
        }}>
          {[
            dto.central, dto.distrito, dto.distancia_oc, dto.ruta,
            dto.nse, dto.nipp, dto.moda,
            dto.total_fibras, dto.fibras_asignadas, dto.reserva_grupo, dto.reservas_generales,
          ].map((val, ci) => (
            <Box key={ci} sx={{
              p: '2px 4px',
              textAlign: 'center',
              borderRight: ci < 10 ? BORDER : 'none',
              minHeight: 18,
            }}>
              {String(val)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

// =============================================================================
// DISTRICT EDITOR ROW
// =============================================================================

function DistritoRow({
  dto, idx, onChange, onDelete,
}: {
  dto: DistritoRutaRecord
  idx: number
  onChange: (idx: number, field: keyof DistritoRutaRecord, val: string) => void
  onDelete: (idx: number) => void
}) {
  const fields: (keyof DistritoRutaRecord)[] = [
    'central', 'distrito', 'distancia_oc', 'ruta', 'nse', 'nipp', 'moda',
    'total_fibras', 'fibras_asignadas', 'reserva_grupo', 'reservas_generales',
  ]
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" sx={{ minWidth: 18, color: 'text.secondary' }}>{idx + 1}</Typography>
      {fields.map(f => (
        <TextField
          key={f}
          label={f}
          value={String(dto[f])}
          onChange={e => onChange(idx, f, e.target.value)}
          size="small"
          sx={{ minWidth: 60, flex: 1 }}
        />
      ))}
      <Tooltip title="Eliminar fila">
        <IconButton size="small" onClick={() => onDelete(idx)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CResumenDistritosRutaShowcase() {
  const [distritos, setDistritos] = useState<DistritoRutaRecord[]>(MOCK_DISTRITOS)

  const handleChange = (idx: number, field: keyof DistritoRutaRecord, val: string) => {
    setDistritos(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d))
  }

  const handleDelete = (idx: number) => {
    setDistritos(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAdd = () => {
    setDistritos(prev => [...prev, makeEmptyDistrito()])
  }

  const numRows = 2 + distritos.length
  const totalHeight = TABLA_RESUMEN_DISTRITOS.alturaFilaTitulo
    + TABLA_RESUMEN_DISTRITOS.alturaFilaHeader
    + distritos.length * TABLA_RESUMEN_DISTRITOS.alturaFilaDato
  const totalWidth = TABLA_RESUMEN_DISTRITOS.numColumnas * TABLA_RESUMEN_DISTRITOS.anchoColumna

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_resumen_distritos_ruta
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_resumen_distritos_ruta.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: info + editor */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Dimensiones */}
            <Card variant="outlined">
              <CardHeader title="Dimensiones (mm)" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 2 }}>
                  <Box>columnas: <strong>11 × 25 mm</strong> = {totalWidth} mm</Box>
                  <Box>fila 1 (título): <strong>{TABLA_RESUMEN_DISTRITOS.alturaFilaTitulo} mm</strong></Box>
                  <Box>fila 2 (cabecera): <strong>{TABLA_RESUMEN_DISTRITOS.alturaFilaHeader} mm</strong></Box>
                  <Box>filas 3+N (datos): <strong>{TABLA_RESUMEN_DISTRITOS.alturaFilaDato} mm</strong> c/u</Box>
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
                    filas totales: <strong>{numRows}</strong> ({distritos.length} distritos)
                  </Box>
                  <Box>altura total: <strong>{totalHeight} mm</strong></Box>
                </Box>
              </CardContent>
            </Card>

            {/* Border hiding */}
            <Card variant="outlined">
              <CardHeader title="Bordes ocultos — fila 1" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  configura_tabla() oculta <strong>borde superior, izquierdo y derecho</strong> en
                  todas las celdas de la fila 1 (cols 1–11). El título queda "flotando" visualmente
                  sobre el resto de la tabla.
                </Typography>
                <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: 10, color: 'text.secondary' }}>
                  ocultaSup / ocultaIzq / ocultaDer ← mismo conjunto &#123;1,1&#125;..&#123;1,11&#125;
                </Box>
              </CardContent>
            </Card>

            {/* obtenDistritos */}
            <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
              <CardHeader title="obtenDistritos() — Fase 5" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Llamado al inicio de <code>configurarTabla()</code>. Usa
                  {' '}<code>c_engine_ruta_cables.new()</code> + <code>smallworld_product.pni_application().plugin(:gen_planos)</code>.
                  Stub en showcase — los datos se pasan por constructor.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: table preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Tabla renderizada"
                subheader={`tbl_res_dtos_ruta — ${numRows} filas × 11 cols`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TablePreview distritos={distritos} />
              </CardContent>
            </Card>

            {/* District editor */}
            <Card variant="outlined">
              <CardHeader
                title="Editor de distritos"
                subheader="Modifica las filas de datos de la tabla"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
                action={
                  <Button size="small" startIcon={<AddIcon />} onClick={handleAdd} variant="outlined">
                    Agregar
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={1}>
                  {distritos.map((dto, idx) => (
                    <DistritoRow
                      key={idx}
                      dto={dto}
                      idx={idx}
                      onChange={handleChange}
                      onDelete={handleDelete}
                    />
                  ))}
                  {distritos.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Sin distritos. La tabla tendrá sólo 2 filas (título + cabecera).
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
