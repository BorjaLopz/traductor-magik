import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, InputAdornment, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloGenerico,
  SELLO_GENERICO_DEFAULTS,
  type SelloGenericoConfig,
} from '../models/CSelloGenerico'

// =============================================================================
// DYNAMIC HEIGHT EXPLAINER
// =============================================================================

function HeightFormula({ sello }: { sello: CSelloGenerico }) {
  const lines = (sello.contenidoSello.match(/\n/g) ?? []).length
  const h     = sello.computeRowContentHeight()

  let branch: string
  let formula: string
  if (sello.largo > 0) {
    branch  = 'Override manual (atributo largo)'
    formula = `largo = ${sello.largo} mm`
  } else if (lines > SELLO_GENERICO_DEFAULTS.maxLinesFull &&
             lines <= SELLO_GENERICO_DEFAULTS.maxLinesExpand) {
    branch  = `Expansión (${lines} líneas > ${SELLO_GENERICO_DEFAULTS.maxLinesFull})`
    formula = `(${lines} − ${SELLO_GENERICO_DEFAULTS.maxLinesFull}) × 2 + 110 = ${h} mm`
  } else {
    branch  = `Compacto (${lines} líneas ≤ ${SELLO_GENERICO_DEFAULTS.maxLinesFull})`
    formula = `70 mm fijo`
  }

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4px 16px' }}>
        {[
          ['Líneas de texto',   `${lines}`],
          ['Rama activa',       branch],
          ['Fórmula',           formula],
          ['Altura fila 2',     `${h} mm`],
          ['Ancho col 1',       `${sello.computeColWidth()} mm`],
        ].map(([k, v], i) => (
          <>
            <Box key={`k${i}`} sx={{ color: 'text.secondary' }}>{k}</Box>
            <Box key={`v${i}`} sx={{ color: 'primary.main', fontWeight: 'bold' }}>{v}</Box>
          </>
        ))}
      </Box>
    </Box>
  )
}

// =============================================================================
// TABLE PREVIEW
// =============================================================================

function SelloPreview({ sello }: { sello: CSelloGenerico }) {
  const colW = sello.computeColWidth()
  const rowH = sello.computeRowContentHeight()
  const SCALE = Math.min(480 / colW, 2.5)

  const W  = colW * SCALE
  const H1 = SELLO_GENERICO_DEFAULTS.rowTitleHeight   * SCALE
  const H2 = Math.min(rowH * SCALE, 300)  // cap visual height

  return (
    <Box>
      <Box sx={{ display: 'inline-block', border: '1.5px solid #555', fontFamily: 'monospace', minWidth: 120 }}>
        {/* Row 1: title */}
        <Box sx={{
          width: W, height: H1,
          borderBottom: '1px solid #555',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: '#e3f2fd', px: 1,
          overflow: 'hidden',
        }}>
          <Typography sx={{ fontSize: Math.min(11, H1 * 0.7), fontWeight: 'bold', fontFamily: 'monospace' }}>
            {sello.tituloSello.toUpperCase() || '(título vacío)'}
          </Typography>
        </Box>

        {/* Row 2: content */}
        <Box sx={{
          width: W, height: H2,
          bgcolor: '#fafafa',
          px: 0.5, pt: 0.3,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <Typography sx={{
            fontSize: 9, fontFamily: 'monospace', lineHeight: 1.4,
            whiteSpace: 'pre-wrap', color: '#333',
          }}>
            {sello.contenidoSello.toUpperCase() || ''}
          </Typography>
          {rowH * SCALE > 300 && (
            <Box sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 20, bgcolor: 'rgba(250,250,250,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 8, color: '#999' }}>
                ↕ altura real: {rowH} mm (vista recortada)
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: {colW} mm · Fila 1: {SELLO_GENERICO_DEFAULTS.rowTitleHeight} mm ·
        Fila 2: {rowH} mm{rowH * SCALE > 300 ? ' (vista recortada)' : ''}
      </Typography>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSelloGenericoShowcase() {
  const [tituloSello,    setTituloSello]    = useState('')
  const [contenidoSello, setContenidoSello] = useState('')
  const [largo,          setLargo]          = useState(0)
  const [ancho,          setAncho]          = useState(0)

  const config = useMemo<SelloGenericoConfig>(() => ({
    tituloSello:    tituloSello    || undefined,
    contenidoSello: contenidoSello || undefined,
    largo:          largo          || undefined,
    ancho:          ancho          || undefined,
  }), [tituloSello, contenidoSello, largo, ancho])

  const sello = useMemo(() => new CSelloGenerico(config), [config])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_generico
        <Chip label="Fase 2 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends layout_element" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="allowed_on_menu" size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_sello_generico.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Sello de texto libre editable. Una tabla 2×1: fila 1 = título fijo, fila 2 = contenido libre.
        La altura de la fila 2 se recalcula en cada render según el número de saltos de línea del contenido.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Content inputs */}
            <Card variant="outlined">
              <CardHeader
                title="Contenido del sello"
                subheader="tbl_sello_generico — 2 celdas"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="titulo_sello"
                    value={tituloSello}
                    onChange={e => setTituloSello(e.target.value)}
                    size="small" fullWidth
                    placeholder={SELLO_GENERICO_DEFAULTS.tituloSello}
                    helperText={`Celda(1,1) · default: "${SELLO_GENERICO_DEFAULTS.tituloSello}"`}
                  />
                  <TextField
                    label="contenido_sello"
                    value={contenidoSello}
                    onChange={e => setContenidoSello(e.target.value)}
                    size="small" fullWidth
                    multiline rows={8}
                    helperText={`Celda(2,1) · ${(contenidoSello.match(/\n/g) ?? []).length} saltos de línea`}
                    placeholder="Escribe el contenido del sello…"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Dimension overrides */}
            <Card variant="outlined">
              <CardHeader
                title="Dimensiones (atributos enteros)"
                subheader="Anulan los valores calculados automáticamente"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="largo"
                    type="number"
                    value={largo || ''}
                    onChange={e => setLargo(Number(e.target.value) || 0)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText={largo > 0
                      ? `Override activo → fila 2 = ${largo} mm`
                      : `0 = automático (${sello.computeRowContentHeight()} mm ahora)`}
                  />
                  <TextField
                    label="ancho"
                    type="number"
                    value={ancho || ''}
                    onChange={e => setAncho(Number(e.target.value) || 0)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                    helperText={ancho > 0
                      ? `Override activo → col 1 = ${ancho} mm`
                      : `0 = default (${SELLO_GENERICO_DEFAULTS.colWidth} mm)`}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Dynamic height explanation */}
            <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
              <CardHeader
                title="Altura calculada (fila 2)"
                subheader="prvAsignaTexto — lógica de redimensionado"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <HeightFormula sello={sello} />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: preview */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Sello renderizado"
                subheader="tbl_sello_generico — 2 renglones × 1 columna"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <SelloPreview sello={sello} />
              </CardContent>
            </Card>

            {/* Structure reference */}
            <Card variant="outlined">
              <CardHeader title="Estructura de la tabla" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Celda', 'Contenido', 'Font', 'Dim. default', 'Override'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['(1,1)', 'titulo_sello.uppercase', '35', `fila=8mm, col=${SELLO_GENERICO_DEFAULTS.colWidth}mm`, '—'],
                      ['(2,1)', 'contenido_sello.uppercase · top_left', '35', 'fila=dinámica, col=110mm', 'largo / ancho'],
                    ].map((row, i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        {row.map((cell, j) => (
                          <Box component="td" key={j} sx={{ p: '3px 8px', color: j === 0 ? 'primary.main' : undefined }}>{cell}</Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  <Box sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                    Lógica de altura de fila 2 (prvAsignaTexto):
                  </Box>
                  {[
                    ['largo > 0',            `→ altura = largo  (override)`],
                    ['líneas > 21 y ≤ 150',  `→ (líneas − 21) × 2 + 110 mm`],
                    ['líneas ≤ 21',           `→ 70 mm  (compacto)`],
                  ].map(([cond, result]) => (
                    <Box key={cond} sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                      <Box sx={{ color: 'primary.main', minWidth: 160 }}>{cond}</Box>
                      <Box sx={{ color: 'text.secondary' }}>{result}</Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="caption" color="text.secondary">
                  <strong>GUI Fase 5:</strong> en Magik el contenido se edita con <code>c_gui_edita_sello_generico</code>
                  (ventana emergente). El atributo <code>texto_sello</code> persiste el contenido en el XML del plano.
                  El slot <code>contenido_sello</code> tiene prioridad sobre <code>texto_sello</code> cuando ambos están presentes.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
