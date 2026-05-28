import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  FormControlLabel, Grid, MenuItem, Select,
  Slider, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CTituloDelPlano, DEFAULT_ATTRIBS } from '../models/CTituloDelPlano'
import type { BoundingBox, TituloAttribs } from '../models/CTituloDelPlano'

// SVG viewport width in px
const SVG_W = 560
const SVG_H = 360
const PAD   = 20  // SVG inner margin

function toSvg(
  v: number,
  axis: 'x' | 'y',
  container: BoundingBox,
  scale: number,
): number {
  if (axis === 'x') return PAD + (v - container.xmin) * scale
  // y-flip: Smallworld y increases upward, SVG y increases downward
  return PAD + (container.ymax - v) * scale
}

export function CTituloDelPlanoShowcase() {
  const PAD_UNITS = CTituloDelPlano.PADDING  // 400

  // Container bbox controls (in layout units; 1 unit ≈ 0.1 mm)
  const [cW, setCW] = useState(3000)   // container width
  const [cH, setCH] = useState(2000)   // container height

  // Title box size controls
  const [tW, setTW] = useState(800)
  const [tH, setTH] = useState(300)

  // textbox_layout attributes (subset relevant to display)
  const [attribs, setAttribs] = useState<TituloAttribs>({ ...DEFAULT_ATTRIBS })

  const container: BoundingBox = { xmin: 0, ymin: 0, xmax: cW, ymax: cH }

  const titulo = useMemo(() => {
    const t = new CTituloDelPlano()
    t.bounds            = { xmin: 0, ymin: 0, xmax: tW, ymax: tH }
    t.attribs           = { ...attribs }
    t.oBoundContenedor  = container
    return t
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cW, cH, tW, tH, attribs])

  const drawn = titulo.computeDrawBounds()

  // SVG scale: fit container into viewport
  const scaleX = (SVG_W - PAD * 2) / cW
  const scaleY = (SVG_H - PAD * 2) / cH
  const scale  = Math.min(scaleX, scaleY)

  const sx = (v: number) => toSvg(v, 'x', container, scale)
  const sy = (v: number) => toSvg(v, 'y', container, scale)

  const svgW = PAD * 2 + cW * scale
  const svgH = PAD * 2 + cH * scale

  const setAttr = <K extends keyof TituloAttribs>(k: K, v: TituloAttribs[K]) =>
    setAttribs(prev => ({ ...prev, [k]: v }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CTituloDelPlano
        <Chip label="Fase 5 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="error" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_titulo_de_plano.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Extiende <code>textbox_layout</code> · Posiciona el bloque de título en la esquina inferior-derecha
        del contenedor · padding = 400 u (≈ 40 mm)
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: controls ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="oBoundContenedor"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Bounding box del plano contenedor"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ancho (xmax): {cW} u = {(cW * 0.1).toFixed(0)} mm
                    </Typography>
                    <Slider min={1000} max={5000} step={100} value={cW}
                      onChange={(_, v) => setCW(v as number)} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Alto (ymax): {cH} u = {(cH * 0.1).toFixed(0)} mm
                    </Typography>
                    <Slider min={800} max={4000} step={100} value={cH}
                      onChange={(_, v) => setCH(v as number)} size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="self.bounds (título)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Dimensiones del cuadro de título"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ancho: {tW} u = {(tW * 0.1).toFixed(0)} mm
                    </Typography>
                    <Slider min={200} max={2000} step={50} value={tW}
                      onChange={(_, v) => setTW(v as number)} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Alto: {tH} u = {(tH * 0.1).toFixed(0)} mm
                    </Typography>
                    <Slider min={100} max={800} step={50} value={tH}
                      onChange={(_, v) => setTH(v as number)} size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="textbox_layout attribs"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Heredados de textbox_layout (rendering → Fase 5)"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <TextField
                    label="text"
                    value={attribs.text}
                    onChange={e => setAttr('text', e.target.value)}
                    size="small" fullWidth multiline rows={2}
                    helperText="Texto mostrado en el bloque de título"
                  />
                  <TextField
                    label="sEscala"
                    value={titulo.sEscala ?? ''}
                    onChange={e => { titulo.sEscala = e.target.value || undefined }}
                    size="small" fullWidth
                    helperText="Slot adicional: escala del plano"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">alignH</Typography>
                      <Select
                        value={attribs.alignH} size="small" fullWidth
                        onChange={e => setAttr('alignH', e.target.value as TituloAttribs['alignH'])}>
                        <MenuItem value="left">left</MenuItem>
                        <MenuItem value="center">center</MenuItem>
                        <MenuItem value="right">right</MenuItem>
                      </Select>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">alignV</Typography>
                      <Select
                        value={attribs.alignV} size="small" fullWidth
                        onChange={e => setAttr('alignV', e.target.value as TituloAttribs['alignV'])}>
                        <MenuItem value="top">top</MenuItem>
                        <MenuItem value="middle">middle</MenuItem>
                        <MenuItem value="bottom">bottom</MenuItem>
                      </Select>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      fontSize: {attribs.fontSize}
                    </Typography>
                    <Slider min={1} max={72} step={0.5} value={attribs.fontSize}
                      onChange={(_, v) => setAttr('fontSize', v as number)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={attribs.wrap} size="small"
                        onChange={e => setAttr('wrap', e.target.checked)} />}
                      label={<Typography variant="caption">wrap</Typography>}
                    />
                    <FormControlLabel
                      control={<Switch checked={attribs.clip} size="small"
                        onChange={e => setAttr('clip', e.target.checked)} />}
                      label={<Typography variant="caption">clip</Typography>}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: SVG + formula ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="draw_content_on — computeDrawBounds()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Reposiciona self.bounds en la esquina inferior-derecha del contenedor"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <svg width={svgW} height={svgH}
                    style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>

                    {/* Container bbox */}
                    <rect
                      x={sx(container.xmin)} y={sy(container.ymax)}
                      width={(container.xmax - container.xmin) * scale}
                      height={(container.ymax - container.ymin) * scale}
                      fill="#e3f2fd" stroke="#1565c0" strokeWidth={1.5} strokeDasharray="6 3"
                    />
                    <text x={sx(container.xmin) + 4} y={sy(container.ymax) + 12}
                      fontSize={9} fontFamily="monospace" fill="#1565c0">
                      oBoundContenedor ({cW}×{cH} u)
                    </text>

                    {/* Corner marker — lower-right with padding */}
                    {(() => {
                      const px = sx(container.xmax - PAD_UNITS)
                      const py = sy(container.ymin + PAD_UNITS)
                      return (
                        <g>
                          <line x1={px} y1={sy(container.ymax)} x2={px} y2={sy(container.ymin)}
                            stroke="#ef9a9a" strokeWidth={1} strokeDasharray="3 2" />
                          <line x1={sx(container.xmin)} y1={py} x2={sx(container.xmax)} y2={py}
                            stroke="#ef9a9a" strokeWidth={1} strokeDasharray="3 2" />
                          <text x={px + 2} y={sy(container.ymax) + 10}
                            fontSize={8} fontFamily="monospace" fill="#c62828">
                            xmax-{PAD_UNITS}
                          </text>
                          <text x={sx(container.xmin) + 2} y={py - 3}
                            fontSize={8} fontFamily="monospace" fill="#c62828">
                            ymin+{PAD_UNITS}
                          </text>
                        </g>
                      )
                    })()}

                    {/* Drawn title bbox */}
                    <rect
                      x={sx(drawn.xmin)} y={sy(drawn.ymax)}
                      width={(drawn.xmax - drawn.xmin) * scale}
                      height={(drawn.ymax - drawn.ymin) * scale}
                      fill="#fff9c4" stroke="#f57f17" strokeWidth={2}
                    />

                    {/* Title text preview */}
                    <foreignObject
                      x={sx(drawn.xmin) + 3} y={sy(drawn.ymax) + 3}
                      width={Math.max(1, (drawn.xmax - drawn.xmin) * scale - 6)}
                      height={Math.max(1, (drawn.ymax - drawn.ymin) * scale - 6)}>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: Math.min(11, (drawn.ymax - drawn.ymin) * scale * 0.25),
                          fontWeight: 600,
                          color: '#37474f',
                          overflow: 'hidden',
                          textAlign: attribs.alignH,
                          padding: 1,
                          lineHeight: 1.2,
                          whiteSpace: attribs.wrap ? 'pre-wrap' : 'nowrap',
                        }}>
                        {attribs.text}
                      </div>
                    </foreignObject>

                    {/* Title bbox label */}
                    <text x={sx(drawn.xmin) + 2} y={sy(drawn.ymin) + 10}
                      fontSize={8} fontFamily="monospace" fill="#e65100" fontWeight={700}>
                      título ({tW}×{tH} u)
                    </text>

                    {/* Dimension annotation */}
                    <text x={sx(container.xmax) - 2} y={sy(container.ymin) - 4}
                      fontSize={9} fontFamily="monospace" fill="#888" textAnchor="end">
                      {(cW * 0.1).toFixed(0)} mm × {(cH * 0.1).toFixed(0)} mm
                    </text>

                  </svg>
                </Box>
              </CardContent>
            </Card>

            {/* Formula panel */}
            <Card variant="outlined">
              <CardHeader
                title="Fórmula de posicionamiento"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="draw_content_on → LoBound (layout units)"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{
                  fontFamily: 'monospace', fontSize: 11,
                  bgcolor: 'action.hover', p: 1.5, borderRadius: 1,
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px',
                }}>
                  {[
                    ['xmin', `${cW} − ${PAD_UNITS} − ${tW}`, drawn.xmin],
                    ['ymin', `0 + ${PAD_UNITS}`, drawn.ymin],
                    ['xmax', `${cW} − ${PAD_UNITS}`, drawn.xmax],
                    ['ymax', `0 + ${PAD_UNITS} + ${tH}`, drawn.ymax],
                  ].map(([label, formula, result]) => (
                    <Box key={String(label)} sx={{
                      bgcolor: 'white', border: '1px solid', borderColor: 'divider',
                      borderRadius: 0.5, px: 1, py: 0.5,
                    }}>
                      <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700 }}>
                        {label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mx: 0.5 }}>
                        = {formula} =
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 700 }}>
                        {Number(result)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({(Number(result) * 0.1).toFixed(1)} mm)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Class info */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label="textbox_layout" size="small" variant="outlined"
                    sx={{ fontFamily: 'monospace' }} />
                  <Typography variant="caption" color="text.secondary">→</Typography>
                  <Chip label="CTituloDelPlano" size="small" color="error"
                    sx={{ fontFamily: 'monospace' }} />
                  <Typography variant="caption" color="text.secondary">
                    PADDING=<code>400</code> ·
                    allowed_on_menu=<code>false</code> ·
                    activate_on_insert=<code>false</code> ·
                    rendering → Fase 5
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
