import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid,
  InputAdornment, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  CSecuenciaTrabajo,
  TABLA_SECUENCIA_TRABAJO,
  type SecuenciaTrabajoConfig,
} from '../models/CSecuenciaTrabajo'

// =============================================================================
// SELLO PREVIEW
// =============================================================================

function SelloPreview({ title, text, rowHeight, colWidth, colour }: {
  title: string
  text: string
  rowHeight: number
  colWidth: number
  colour: string
}) {
  const scale = Math.min(460 / colWidth, 1)
  const displayW = colWidth * scale

  return (
    <Box>
      <Box sx={{
        width: displayW,
        maxWidth: '100%',
        border: `2px solid ${colour}`,
        fontFamily: 'monospace',
      }}>
        {/* Row 1: title (tamanio=54) */}
        <Box sx={{
          height: TABLA_SECUENCIA_TRABAJO.alturaFilaTitulo * scale * 2,
          minHeight: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e8eaf6',
          borderBottom: `1px solid ${colour}`,
          fontWeight: 'bold',
          fontSize: 12,
          letterSpacing: 1,
          color: colour,
        }}>
          {title}
        </Box>

        {/* Row 2: content (tamanio=36, top_left) */}
        <Box sx={{
          p: '6px 8px',
          fontSize: 9,
          whiteSpace: 'pre',
          overflow: 'auto',
          maxHeight: Math.min(rowHeight * scale * 2, 400),
          minHeight: 60,
          background: '#fafafa',
          lineHeight: 1.6,
          color: colour,
        }}>
          {text}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: {colWidth} mm · Fila 1: {TABLA_SECUENCIA_TRABAJO.alturaFilaTitulo} mm ·
        Fila 2: {rowHeight} mm
      </Typography>
    </Box>
  )
}

// =============================================================================
// HEIGHT ALGORITHM EXPLAINER
// =============================================================================

function HeightExplainer({ contenidoSello }: { contenidoSello: string }) {
  const nl = (contenidoSello.match(/\n/g) ?? []).length
  const lines = nl + 1

  let rule = '(sin contenidoSello → 150 mm por defecto)'
  let height: number = TABLA_SECUENCIA_TRABAJO.alturaFilaContenidoDefault
  if (contenidoSello.length > 0) {
    if (nl > 45 && nl <= 60) {
      height = (lines - 40) * 2 + 120
      rule = `(${nl} newlines ∈ (45,60] → (${lines}−40)×2+120 = ${height} mm)`
    } else if (nl <= 40) {
      height = 110
      rule = `(${nl} newlines ≤ 40 → fijo 110 mm)`
    } else {
      rule = `(${nl} newlines > 60 → sin cambio, 150 mm default)`
    }
  }

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 10, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
      <Box>newlines: <strong>{nl}</strong> · lines: <strong>{lines}</strong></Box>
      <Box>altura fila 2: <strong>{height} mm</strong> {rule}</Box>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSecuenciaTrabajoShowcase() {
  const [centralNombre, setCentralNombre] = useState('XOLA')
  const [customText,    setCustomText]    = useState('')
  const [contenidoSello, setContenidoSello] = useState('')
  const [largoStr,      setLargoStr]      = useState('')
  const [anchoStr,      setAnchoStr]      = useState('')
  const [colour,        setColour]        = useState('#000000')

  const config = useMemo<SecuenciaTrabajoConfig>(() => ({
    textoSello:    customText.trim() || undefined,
    centralNombre: centralNombre.trim() || undefined,
    largo:         Number(largoStr) || 0,
    ancho:         Number(anchoStr) || 0,
    colour,
  }), [customText, centralNombre, largoStr, anchoStr, colour])

  const sello = useMemo(() => {
    // contenidoSello is a Magik shared variable (class-level)
    CSecuenciaTrabajo.contenidoSello = contenidoSello.trim() || undefined
    return new CSecuenciaTrabajo(config)
  }, [config, contenidoSello])

  const displayText = sello.resolvedText()
  const rowHeight   = sello.computedRowHeight()
  const colWidth    = sello.computedColWidth()
  const largoOverride = (config.largo ?? 0) > 0
  const anchoOverride = (config.ancho ?? 0) > 0

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_secuencia_trabajo
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends textbox_layout" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="allowed_on_menu? = false" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/c_secuencia_trabajo.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* GIS placeholder */}
            <Card variant="outlined">
              <CardHeader
                title="LoCentral — parámetro GIS"
                subheader="Inicializa() lee de active_scheme.project → Fase 5"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  label="centralNombre"
                  value={centralNombre}
                  onChange={e => setCentralNombre(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Aparece en pasos 1, 6, 7, A, B, C del template"
                />
              </CardContent>
            </Card>

            {/* Text override */}
            <Card variant="outlined">
              <CardHeader
                title="textoSello"
                subheader="Vacío = plantilla buildContenidoDefault(central)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  multiline
                  rows={5}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Reemplaza la plantilla. Equivale a attributes[:texto_sello] del XML."
                />
              </CardContent>
            </Card>

            {/* contenidoSello (class-level) */}
            <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    contenidoSello
                    <Tooltip title="Variable compartida de clase (Magik: define_shared_variable). Controla la altura dinámica de la fila 2 pero NO sobrescribe el texto.">
                      <InfoOutlinedIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                }
                subheader="Variable de clase — afecta a todas las instancias"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  multiline
                  rows={3}
                  value={contenidoSello}
                  onChange={e => setContenidoSello(e.target.value)}
                  fullWidth
                  size="small"
                />
                <HeightExplainer contenidoSello={contenidoSello} />
              </CardContent>
            </Card>

            {/* Dimension overrides */}
            <Card variant="outlined">
              <CardHeader title="Dimensiones" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="largo — row 2 height override"
                    type="number"
                    value={largoStr}
                    onChange={e => setLargoStr(e.target.value)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                  />
                  <TextField
                    label="ancho — col 1 width override"
                    type="number"
                    value={anchoStr}
                    onChange={e => setAnchoStr(e.target.value)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                  />
                  <TextField
                    label="colour (textbox_layout)"
                    type="color"
                    value={colour}
                    onChange={e => setColour(e.target.value)}
                    size="small" fullWidth
                    helperText="draw_content_on aplica el color a ambas celdas"
                  />
                </Stack>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 1, lineHeight: 2 }}>
                  <Box>fila 2: <strong>{rowHeight} mm</strong>{largoOverride && <Chip label="override" size="small" color="warning" sx={{ ml: 1 }} />}</Box>
                  <Box>col 1: <strong>{colWidth} mm</strong>{anchoOverride && <Chip label="override" size="small" color="warning" sx={{ ml: 1 }} />}</Box>
                </Box>
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
                subheader={`tbl_secuencia_trabajo — 2 filas × 1 col · ${colWidth} × (${TABLA_SECUENCIA_TRABAJO.alturaFilaTitulo}+${rowHeight}) mm`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <SelloPreview
                  title="SECUENCIA DE TRABAJO"
                  text={displayText}
                  rowHeight={rowHeight}
                  colWidth={colWidth}
                  colour={colour}
                />
              </CardContent>
            </Card>

            {/* Structural notes */}
            <Card variant="outlined">
              <CardHeader title="Diferencias clave vs c_base_sello_fibra" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Aspecto', 'c_secuencia_trabajo', 'c_base_sello_fibra'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['Hereda de', 'textbox_layout', 'c_base_sello'],
                      ['oTablas', 'slot propio (writable)', 'hereda _tablas'],
                      ['contenido_sello', 'shared variable (clase)', 'no aplica'],
                      ['varObjeto', 'shared variable (clase)', 'no aplica'],
                      ['allowed_on_menu?', 'false', 'true (típico)'],
                      ['font_size / colour', 'de textbox_layout attrs', 'no aplica'],
                      ['Inicializa()', 'método propio', 'inicializar(props[])'],
                      ['draw_content_on()', 'aplica font+color a celdas', 'configurarColorSello()'],
                    ].map(([a, b, c], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold' }}>{a}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{b}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{c}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Plantilla generada por <code>buildContenidoDefault(centralNombre)</code> — reproduce el texto que
                  Magik construye en <code>Inicializa()</code> con datos GIS de <code>LoCentral</code> (Fase 5).
                  Pasos con cifras vacías (MTS, soportes, pozos) se rellenan en campo por el contratista.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
