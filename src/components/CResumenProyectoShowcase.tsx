import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  Divider, Grid, Slider, Stack, TextField, Typography,
} from '@mui/material'
import {
  CResumenProyecto,
  TBL_RESUMEN, TBL_LISTA, TBL_SIMBOLOGIA_TIT,
  TBL_SIMBOLOGIA_COL1, TBL_SIMBOLOGIA_COL2, TBL_SIMBOLOGIA_COL3,
  SIMBOLOGIA_COL1, SIMBOLOGIA_COL2, SIMBOLOGIA_COL3,
  TABLE_WIDTH,
} from '../models/CResumenProyecto'
import type { SimbologiaEntry } from '../models/CResumenProyecto'

// ─── SVG helpers ──────────────────────────────────────────────────────────────

const sumLens = (lens: readonly number[]) => lens.slice(1).reduce((a, b) => a + b, 0)

// Draws one table section: rows stacked top→bottom
function TableSection({
  rowLens, colLens, scale, yOffset, xOffset,
  fill, stroke, rowContent, colWidths,
}: {
  rowLens:    readonly number[]
  colLens:    readonly number[]
  scale:      number
  yOffset:    number
  xOffset:    number
  fill:       string
  stroke:     string
  rowContent?: (row: number, col: number) => string
  colWidths:  number[]
}) {
  const rows = rowLens.slice(1)
  const cols = colLens.slice(1)

  const elements: React.ReactNode[] = []
  let y = yOffset

  rows.forEach((rh, ri) => {
    let x = xOffset
    cols.forEach((cw, ci) => {
      const px = x * scale
      const py = y * scale
      const pw = cw * scale
      const ph = rh * scale
      elements.push(
        <rect key={`r${ri}c${ci}`} x={px} y={py} width={pw} height={ph}
          fill={fill} stroke={stroke} strokeWidth={0.5} />,
      )
      const text = rowContent?.(ri + 1, ci + 1)
      if (text) {
        elements.push(
          <text key={`t${ri}c${ci}`} x={px + pw * 0.5} y={py + ph * 0.5}
            fontSize={Math.min(8, ph * 0.55)} fontFamily="monospace"
            textAnchor="middle" dominantBaseline="middle"
            fill="#1a237e" clipPath={undefined}>
            {text.split('\n')[0]}
          </text>,
        )
      }
      x += cw
    })
    y += rh
  })

  return <g>{elements}</g>
}

// ─── Simbologia mini-table ─────────────────────────────────────────────────────

function SimbTable({
  entries, title, rowLens, yOff, xOff, scale, color,
}: {
  entries:  readonly SimbologiaEntry[]
  title:    string
  rowLens:  readonly number[]
  yOff:     number
  xOff:     number
  scale:    number
  color:    string
}) {
  const rows = rowLens.slice(1)
  const SIMB_W = 22
  const LABL_W = 30

  const els: React.ReactNode[] = []
  let y = yOff

  rows.forEach((rh, ri) => {
    const entry    = entries[ri]
    const py  = y * scale
    const ph  = rh * scale
    const px1 = xOff * scale
    const pw1 = SIMB_W * scale
    const px2 = (xOff + SIMB_W) * scale
    const pw2 = LABL_W * scale

    // Symbol cell
    els.push(
      <rect key={`s${ri}a`} x={px1} y={py} width={pw1} height={ph}
        fill="#e8eaf6" stroke={color} strokeWidth={0.5} />,
      <text key={`s${ri}al`} x={px1 + pw1 / 2} y={py + ph / 2}
        fontSize={Math.min(6, ph * 0.4)} fontFamily="monospace"
        textAnchor="middle" dominantBaseline="middle" fill="#3949ab">
        {entry?.simbolo.slice(0, 8) ?? ''}
      </text>,
    )
    // Label cell
    const lines = (entry?.etiqueta ?? '').split('\n')
    els.push(
      <rect key={`s${ri}b`} x={px2} y={py} width={pw2} height={ph}
        fill="#fff8e1" stroke={color} strokeWidth={0.5} />,
    )
    lines.forEach((ln, li) => {
      const lineH = ph / Math.max(lines.length, 1)
      els.push(
        <text key={`s${ri}bl${li}`}
          x={px2 + 3}
          y={py + li * lineH + lineH / 2}
          fontSize={Math.min(6.5, lineH * 0.55)}
          fontFamily="monospace"
          dominantBaseline="middle"
          fill="#37474f">
          {ln}
        </text>,
      )
    })

    y += rh
  })

  // Column title badge
  els.push(
    <text key="title" x={(xOff + SIMB_W / 2) * scale} y={yOff * scale - 3}
      fontSize={7} fontFamily="monospace" textAnchor="middle" fill={color} fontWeight={700}>
      {title}
    </text>,
  )

  return <g>{els}</g>
}

// ─── Showcase ────────────────────────────────────────────────────────────────

const DEFAULT_VALUES = Array<string>(48).fill('')

export function CResumenProyectoShowcase() {
  const [scale, setScale]       = useState(1.8)   // px/mm
  const [valores, setValores]   = useState<string[]>(DEFAULT_VALUES)
  const [contenido, setContenido] = useState('RESUMEN DEL PROYECTO')

  const sello = useMemo(() => {
    const s = new CResumenProyecto()
    s.inicializa()
    s.contenidoSello = contenido
    valores.forEach((v, i) => { if (v) s.asignaValorLista(i + 1, v) })
    return s
  }, [contenido, valores])

  const setValor = (idx: number, v: string) =>
    setValores(prev => { const n = [...prev]; n[idx] = v; return n })

  // Layout geometry (mm, y increases downward for SVG)
  const headerH  = sumLens(TBL_RESUMEN.rowLens)        //  11
  const listH    = sumLens(TBL_LISTA.rowLens)           // 158.4
  const simbTitH = sumLens(TBL_SIMBOLOGIA_TIT.rowLens) //   9
  const simb1H   = sumLens(TBL_SIMBOLOGIA_COL1.rowLens) // 83
  const simb2H   = sumLens(TBL_SIMBOLOGIA_COL2.rowLens) // 81
  const simb3H   = sumLens(TBL_SIMBOLOGIA_COL3.rowLens) // 72

  const yList    = headerH
  const ySimTit  = yList + listH
  const ySimCols = ySimTit + simbTitH
  const simbColW = 52  // 22 + 30 per column

  const totalH   = ySimCols + Math.max(simb1H, simb2H, simb3H)
  const totalW   = TABLE_WIDTH

  const svgW     = totalW  * scale + 40
  const svgH     = totalH  * scale + 40
  const PAD      = 20

  // List rows content
  const listRowContent = (row: number, col: number): string => {
    if (col === 1) return `${row}.-`
    if (col === 2) {
      const label = sello.lista[row - 1]?.etiqueta ?? ''
      return label.length > 28 ? label.slice(0, 28) + '…' : label
    }
    if (col === 3) return sello.lista[row - 1]?.valor ?? ''
    return ''
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CResumenProyecto
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="error" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_resumen_proyecto.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Extiende <code>layout_element</code> · 6 tablas · 48 ítems lista · 19 símbolos en 3 columnas ·
        Alto total: <strong>{CResumenProyecto.totalHeightMm.toFixed(1)} mm</strong>
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: controls ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Contenido del sello"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_Resumen (1,1) — editado por CGuiEditaSelloResumenProyecto"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 1 }}>
                <TextField
                  value={contenido}
                  onChange={e => setContenido(e.target.value)}
                  size="small" fullWidth
                  slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontSize: 11 } } }}
                  helperText="→ .contenidoSello (se convierte a MAYÚSCULAS)"
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Valores captura (tbl_Lista col 3)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="c_captura_texto por renglón — primer 8 ítems"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 1 }}>
                <Stack spacing={1}>
                  {sello.lista.slice(0, 8).map((item, i) => (
                    <TextField
                      key={i}
                      label={`${i + 1}.- ${item.etiqueta.slice(0, 18)}…`}
                      value={valores[i]}
                      onChange={e => setValor(i, e.target.value)}
                      size="small" fullWidth
                      slotProps={{ htmlInput: { style: { fontSize: 10, fontFamily: 'monospace' } } }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Escala SVG"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {scale.toFixed(1)} px/mm — total {svgW.toFixed(0)}×{svgH.toFixed(0)} px
                </Typography>
                <Slider min={1} max={4} step={0.1} value={scale}
                  onChange={(_, v) => setScale(v as number)} size="small" />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Dimensiones de tablas"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                  {[
                    ['tbl_Resumen',          '1×1',  '156×11 mm',        '#e3f2fd'],
                    ['tbl_Lista',            '48×3', '156×158.4 mm',     '#f3e5f5'],
                    ['tbl_Simbologia_Tit',   '1×1',  '156×9 mm',         '#e8f5e9'],
                    ['tbl_Simbologia_Col1',  '7×2',  '52×83 mm',         '#fff3e0'],
                    ['tbl_Simbologia_Col2',  '6×2',  '52×81 mm',         '#fce4ec'],
                    ['tbl_Simbologia_Col3',  '6×2',  '52×72 mm',         '#f3e5f5'],
                  ].map(([name, dim, size, bg]) => (
                    <Box key={name} sx={{ display: 'flex', gap: 1, mb: 0.25, alignItems: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: bg, border: '1px solid #ccc', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, minWidth: 140 }}>{name}</Typography>
                      <Typography variant="caption" color="text.secondary">{dim} · {size}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: SVG ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sello completo — draw_content_on"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader={`${TABLE_WIDTH} mm ancho · ${CResumenProyecto.totalHeightMm.toFixed(1)} mm alto · bordes ocultos · rendering → Fase 5`}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 620 }}>
                <svg width={svgW} height={svgH}
                  style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 4 }}>

                  {/* ── tbl_Resumen ── */}
                  <rect
                    x={PAD} y={PAD}
                    width={TABLE_WIDTH * scale}
                    height={headerH * scale}
                    fill="#e3f2fd" stroke="#1565c0" strokeWidth={1}
                  />
                  <text
                    x={PAD + (TABLE_WIDTH * scale) / 2}
                    y={PAD + (headerH * scale) / 2}
                    fontSize={Math.min(12, headerH * scale * 0.5)}
                    fontFamily="monospace" fontWeight={700}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#0d47a1">
                    {sello.contenidoSello}
                  </text>
                  <text x={PAD + 2} y={PAD + headerH * scale - 2}
                    fontSize={7} fontFamily="monospace" fill="#90a4ae">
                    tbl_Resumen 1×1 · {TABLE_WIDTH}×{headerH} mm
                  </text>

                  {/* ── tbl_Lista ── */}
                  <TableSection
                    rowLens={TBL_LISTA.rowLens}
                    colLens={TBL_LISTA.colLens}
                    scale={scale}
                    yOffset={yList + PAD / scale}
                    xOffset={PAD / scale}
                    fill="#f8f4fe"
                    stroke="#9c27b0"
                    rowContent={listRowContent}
                    colWidths={[10, 121, 25]}
                  />
                  <text x={PAD + 2} y={(yList + PAD / scale + listH) * scale - 2}
                    fontSize={7} fontFamily="monospace" fill="#90a4ae">
                    tbl_Lista 48×3 · cols [10|121|25] mm · renglón 3.3 mm
                  </text>

                  {/* ── tbl_Simbologia_Tit ── */}
                  <rect
                    x={PAD} y={(ySimTit + PAD / scale) * scale}
                    width={TABLE_WIDTH * scale}
                    height={simbTitH * scale}
                    fill="#e8f5e9" stroke="#2e7d32" strokeWidth={1}
                  />
                  <text
                    x={PAD + (TABLE_WIDTH * scale) / 2}
                    y={(ySimTit + PAD / scale) * scale + (simbTitH * scale) / 2}
                    fontSize={Math.min(9, simbTitH * scale * 0.5)}
                    fontFamily="monospace"
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#1b5e20" opacity={0.5}>
                    SIMBOLOGIA (comentada en fuente)
                  </text>

                  {/* ── Simbología columnas ── */}
                  <SimbTable
                    entries={SIMBOLOGIA_COL1}
                    title="Col1 (proyectados)"
                    rowLens={TBL_SIMBOLOGIA_COL1.rowLens}
                    yOff={ySimCols + PAD / scale}
                    xOff={PAD / scale}
                    scale={scale}
                    color="#e65100"
                  />
                  <SimbTable
                    entries={SIMBOLOGIA_COL2}
                    title="Col2 (existentes)"
                    rowLens={TBL_SIMBOLOGIA_COL2.rowLens}
                    yOff={ySimCols + PAD / scale}
                    xOff={PAD / scale + simbColW}
                    scale={scale}
                    color="#1565c0"
                  />
                  <SimbTable
                    entries={SIMBOLOGIA_COL3}
                    title="Col3 (gazas/terrenos)"
                    rowLens={TBL_SIMBOLOGIA_COL3.rowLens}
                    yOff={ySimCols + PAD / scale}
                    xOff={PAD / scale + simbColW * 2}
                    scale={scale}
                    color="#6a1b9a"
                  />

                </svg>
              </Box>
            </CardContent>
          </Card>

          {/* Symbol legend */}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardHeader
              title="Simbología — 19 entradas (3 columnas × ~6-7)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader="c_simbolo_grafico + c_texto_grafico · rendering → Fase 5"
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={1}>
                {[
                  { title: 'Col1 — Proyectados', entries: SIMBOLOGIA_COL1, color: '#e65100' },
                  { title: 'Col2 — Existentes',  entries: SIMBOLOGIA_COL2, color: '#1565c0' },
                  { title: 'Col3 — Otros',        entries: SIMBOLOGIA_COL3, color: '#6a1b9a' },
                ].map(({ title, entries, color }) => (
                  <Grid key={title} size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" sx={{ color, fontWeight: 700, display: 'block', mb: 0.5 }}>
                      {title}
                    </Typography>
                    {entries.map((e, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.25, alignItems: 'flex-start' }}>
                        <Chip
                          label={e.simbolo.slice(0, 10)}
                          size="small"
                          sx={{ fontSize: 8, height: 16, bgcolor: '#f5f5f5', fontFamily: 'monospace', flexShrink: 0 }}
                        />
                        <Typography variant="caption" sx={{ fontSize: 9, lineHeight: 1.3 }}>
                          {e.etiqueta.replace('\n', ' ')}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label="layout_element" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Chip label="CResumenProyecto" size="small" color="error" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">
                  6 tablas · allowed_on_menu=<code>false</code> · draw_content_on → Fase 5
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
