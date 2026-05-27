import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid,
  InputAdornment, Stack, TextField, Typography,
} from '@mui/material'
import {
  CResumenProyectoRed,
  CONTENIDO_DEFAULT,
  TABLA_RESUMEN_PROYECTO_RED,
  type ResumenProyectoRedConfig,
} from '../models/CResumenProyectoRed'

// =============================================================================
// SELLO PREVIEW
// =============================================================================

function SelloPreview({ text, rowHeight, colWidth }: {
  text: string
  rowHeight: number
  colWidth: number
}) {
  // Scale to fit display: 150 mm → ~500px
  const scale = 500 / TABLA_RESUMEN_PROYECTO_RED.anchoColumnaDefault
  const displayW = colWidth * scale
  const titleH = TABLA_RESUMEN_PROYECTO_RED.alturaFilaTitulo * scale

  return (
    <Box>
      <Box sx={{
        width: displayW,
        maxWidth: '100%',
        border: '2px solid #37474f',
        fontFamily: 'monospace',
        overflow: 'hidden',
      }}>
        {/* Row 1: title */}
        <Box sx={{
          height: titleH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#cfd8dc',
          borderBottom: '1px solid #37474f',
          fontWeight: 'bold',
          fontSize: 11,
          letterSpacing: 0.5,
        }}>
          RESUMEN DEL PROYECTO
        </Box>

        {/* Row 2: content */}
        <Box sx={{
          p: '6px 8px',
          fontSize: 9,
          whiteSpace: 'pre',
          overflow: 'auto',
          maxHeight: 360,
          background: '#fafafa',
          lineHeight: 1.5,
        }}>
          {text}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: {colWidth} mm · Fila 1: {TABLA_RESUMEN_PROYECTO_RED.alturaFilaTitulo} mm ·
        Fila 2: {rowHeight} mm
      </Typography>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CResumenProyectoRedShowcase() {
  const [contenido, setContenido]   = useState('')
  const [largoStr,  setLargoStr]    = useState('')
  const [anchoStr,  setAnchoStr]    = useState('')

  const config = useMemo<ResumenProyectoRedConfig>(() => ({
    contenidoSello: contenido.trim() || undefined,
    largo: Number(largoStr) || 0,
    ancho: Number(anchoStr) || 0,
  }), [contenido, largoStr, anchoStr])

  const sello = useMemo(() => new CResumenProyectoRed(config), [config])

  const displayText = sello.resolvedText()
  const rowHeight   = sello.computedRowHeight()
  const colWidth    = sello.computedColWidth()
  const lineCount   = displayText.split('\n').filter(l => l.length > 0).length
  const autoHeight  = lineCount * TABLA_RESUMEN_PROYECTO_RED.alturaLinea

  const isDefault    = !config.contenidoSello
  const largoOverride = (config.largo ?? 0) > 0
  const anchoOverride = (config.ancho ?? 0) > 0

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_resumen_proyecto_red
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="allowed_on_menu?" size="small" variant="outlined" sx={{ ml: 1 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_resumen_proyecto_red.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: controls + info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Content editor */}
            <Card variant="outlined">
              <CardHeader
                title="contenidoSello"
                subheader="Vacío → plantilla por defecto (31 ítems)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  multiline
                  rows={8}
                  placeholder={CONTENIDO_DEFAULT.slice(0, 120) + '…'}
                  value={contenido}
                  onChange={e => setContenido(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Se convierte a mayúsculas. prvAsignaTexto() lo aplica y recalcula la altura."
                />
              </CardContent>
            </Card>

            {/* Dimension overrides */}
            <Card variant="outlined">
              <CardHeader
                title="Sobreescritura de dimensiones"
                subheader="attributes[:largo] y [:ancho] — simulan XML-load"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="largo (attributes[:largo])"
                    type="number"
                    value={largoStr}
                    onChange={e => setLargoStr(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText="Sobrescribe altura fila 2. 0 = sin override"
                  />
                  <TextField
                    label="ancho (attributes[:ancho])"
                    type="number"
                    value={anchoStr}
                    onChange={e => setAnchoStr(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText="Sobrescribe ancho columna 1. 0 = sin override"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Computed state */}
            <Card variant="outlined">
              <CardHeader title="Estado computado" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 2.2 }}>
                  <Box>
                    contenido:{' '}
                    <Chip
                      label={isDefault ? 'CONTENIDO_DEFAULT' : 'contenidoSello'}
                      size="small"
                      color={isDefault ? 'default' : 'primary'}
                    />
                  </Box>
                  <Box>líneas visibles: <strong>{lineCount}</strong></Box>
                  <Box>altura auto: {autoHeight} mm (líneas × {TABLA_RESUMEN_PROYECTO_RED.alturaLinea})</Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Box>
                    altura fila 2:{' '}
                    <strong>{rowHeight} mm</strong>
                    {largoOverride && <Chip label="override largo" size="small" color="warning" sx={{ ml: 1 }} />}
                  </Box>
                  <Box>
                    ancho col 1:{' '}
                    <strong>{colWidth} mm</strong>
                    {anchoOverride && <Chip label="override ancho" size="small" color="warning" sx={{ ml: 1 }} />}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Priority diagram */}
            <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
              <CardHeader title="Prioridad de texto — prvAsignaTexto()" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 10, lineHeight: 2 }}>
                  <Box sx={{ color: 'text.secondary' }}>1. etiquetarCeldas() → CONTENIDO_DEFAULT</Box>
                  <Box sx={{ color: 'text.secondary' }}>2. textoSello ≠ null → sobreescribe celda</Box>
                  <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>3. contenidoSello ≠ null → SIEMPRE gana</Box>
                  <Box sx={{ color: 'warning.dark' }}>   → toUpperCase() + altura dinámica</Box>
                  <Box sx={{ color: 'text.secondary', mt: 0.5 }}>+ largo › 0 → sobreescribe altura</Box>
                  <Box sx={{ color: 'text.secondary' }}>+ ancho › 0 → sobreescribe ancho</Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Fase 5: integración c_gui_edita_sello_generico omitida.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: sello preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sello renderizado"
              subheader={`tbl_resumen — 2 filas × 1 col · ${colWidth} mm × (${TABLA_RESUMEN_PROYECTO_RED.alturaFilaTitulo} + ${rowHeight}) mm`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <SelloPreview text={displayText} rowHeight={rowHeight} colWidth={colWidth} />
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
