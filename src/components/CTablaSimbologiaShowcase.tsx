import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, Slider, Stack, Switch,
  TextField, Typography, FormControlLabel,
} from '@mui/material'
import { CTablaSimbologia, LISTA_DEMO, type SimbologiaRow, type SubTabla, type TextoGrafico, type SimboloGrafico } from '../models/CTablaSimbologia'

// =============================================================================
// RENDERER SVG — dibuja las 4 sub-tablas en sus dimensiones reales (mm)
// =============================================================================

interface RenderProps {
  tabla:  CTablaSimbologia
  scale:  number             // px por mm
}

function dimensionesGlobales(tablas: SubTabla[]): { x: number; y: number; w: number; h: number } {
  let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity
  for (const t of tablas) {
    const totalW = t.colWidths.reduce((a, b) => a + b, 0)
    const totalH = t.rowHeights.reduce((a, b) => a + b, 0)
    // origen.y es esquina superior izquierda en convención GIS (Y crece hacia arriba)
    minX = Math.min(minX, t.origen.x)
    maxX = Math.max(maxX, t.origen.x + totalW)
    minY = Math.min(minY, t.origen.y - totalH)
    maxY = Math.max(maxY, t.origen.y)
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

function TablaSvg({ tabla, scale }: RenderProps) {
  const tablas = tabla.despliega()
  const box = dimensionesGlobales(tablas)
  const pad = 4

  // Y-flip: convertir coords GIS (Y-up) a SVG (Y-down).
  const toSvgY = (yMm: number) => (box.y + box.h - yMm) * scale + pad

  return (
    <svg
      width={box.w * scale + pad * 2}
      height={box.h * scale + pad * 2}
      style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4 }}
    >
      {tablas.map(t => <SubTablaSvg key={t.nombre} t={t} scale={scale} originX={box.x} toSvgY={toSvgY} pad={pad} />)}
    </svg>
  )
}

function SubTablaSvg({ t, scale, originX, toSvgY, pad }: {
  t:        SubTabla
  scale:    number
  originX:  number
  toSvgY:   (yMm: number) => number
  pad:      number
}) {
  const cells: React.ReactElement[] = []

  let yMm = t.origen.y
  for (let r = 0; r < t.rows; r++) {
    let xMm = t.origen.x
    const rowH = t.rowHeights[r]

    for (let c = 0; c < t.cols; c++) {
      const colW = t.colWidths[c]
      const x   = (xMm - originX) * scale + pad
      const y   = toSvgY(yMm)
      const w   = colW * scale
      const h   = rowH * scale

      // Decidir bordes según flags
      const drawTop    = r === 0 || t.dibujaRenglonesInternos
      const drawBottom = r === t.rows - 1 || t.dibujaRenglonesInternos
      const drawLeft   = c === 0 || t.dibujaColumnasInternas
      const drawRight  = c === t.cols - 1 || t.dibujaColumnasInternas

      cells.push(
        <g key={`${t.nombre}-${r}-${c}`}>
          <rect x={x} y={y} width={w} height={h} fill="#fafafa" stroke="none" />
          {drawTop    && <line x1={x}     y1={y}     x2={x + w} y2={y}     stroke="#333" strokeWidth={1} />}
          {drawBottom && <line x1={x}     y1={y + h} x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
          {drawLeft   && <line x1={x}     y1={y}     x2={x}     y2={y + h} stroke="#333" strokeWidth={1} />}
          {drawRight  && <line x1={x + w} y1={y}     x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
          <CellContent cell={t.cells[r]?.[c]} x={x} y={y} w={w} h={h} scale={scale} />
        </g>,
      )

      xMm += colW
    }
    yMm -= rowH
  }
  return <>{cells}</>
}

function CellContent({ cell, x, y, w, h, scale }: {
  cell:  TextoGrafico | SimboloGrafico | undefined
  x: number; y: number; w: number; h: number; scale: number
}) {
  if (!cell) return null
  if ('texto' in cell) {
    const anchor = cell.alineacion === 'centre_left' ? 'start' : cell.alineacion === 'centre_right' ? 'end' : 'middle'
    const tx = anchor === 'start' ? x + cell.margenIzq * scale + 2 : anchor === 'end' ? x + w - 2 : x + w / 2
    const fontPx = Math.max(6, cell.tamanio * 0.45)   // tamaño Magik en "puntos" — escalado a SVG
    return (
      <text
        x={tx}
        y={y + h / 2}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontFamily="sans-serif"
        fontSize={fontPx}
        fill="#222"
      >
        {cell.texto}
      </text>
    )
  }
  // SimboloGrafico — mostrar el nombre como caption pequeño
  const isBlank = cell.nombreGrafico.trim() === ''
  return (
    <text
      x={x + w / 2}
      y={y + h / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="monospace"
      fontSize={Math.max(5, 4 * scale * 0.35)}
      fill={isBlank ? '#bbb' : '#1565c0'}
      fontStyle={isBlank ? 'italic' : 'normal'}
    >
      {isBlank ? '∅' : cell.nombreGrafico}
    </text>
  )
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CTablaSimbologiaShowcase() {
  const [scale, setScale] = useState<number>(3)
  const [origenX, setOrigenX] = useState<number>(0)
  const [origenY, setOrigenY] = useState<number>(100)
  const [useDemo, setUseDemo] = useState<boolean>(true)
  const [customRows, setCustomRows] = useState<SimbologiaRow[]>([
    ['POZO PROYECTO',     'POZO TIPO A',  'POZO TIPO A-P'],
    ['REGISTRO LAYOUT',   'REGISTRO STD', 'REGISTRO STD P'],
    ['ARQUETA',           'ARQUETA ALT',  ' '],
  ])

  const elementos = useDemo ? LISTA_DEMO : customRows

  const tabla = useMemo(
    () => new CTablaSimbologia('layout_demo', { x: origenX, y: origenY }, elementos),
    [origenX, origenY, elementos],
  )

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla_simbologia
        <Chip label="Fase 1 · SIMPLE · score 13" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_tabla_simbologia.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Controles + datos */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Inputs"
              subheader="RoLayout · RoCoord · RcollElementos"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">scale (px / mm) — {scale}</Typography>
                  <Slider min={1.5} max={6} step={0.5} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
                </Box>

                <Stack direction="row" spacing={1}>
                  <TextField
                    label="oCoordOrigen.x (mm)"
                    type="number"
                    value={origenX}
                    onChange={e => setOrigenX(Number(e.target.value))}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="oCoordOrigen.y (mm)"
                    type="number"
                    value={origenY}
                    onChange={e => setOrigenY(Number(e.target.value))}
                    size="small"
                    fullWidth
                  />
                </Stack>

                <FormControlLabel
                  control={<Switch checked={useDemo} onChange={e => setUseDemo(e.target.checked)} />}
                  label={useDemo ? 'Llena_Lista() — 11 elementos por defecto' : 'Lista custom (editable)'}
                />

                {!useDemo && (
                  <Stack spacing={1}>
                    {customRows.map((row, i) => (
                      <Stack key={i} direction="row" spacing={0.5}>
                        {row.map((cell, j) => (
                          <TextField
                            key={j}
                            value={cell}
                            onChange={e => {
                              const nr = [...customRows]
                              const nc = [...nr[i]] as [string, string, string]
                              nc[j] = e.target.value
                              nr[i] = nc as SimbologiaRow
                              setCustomRows(nr)
                            }}
                            size="small"
                            placeholder={['elemento','existente','proyectado'][j]}
                          />
                        ))}
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Typography variant="caption" color="text.secondary">
                  Sub-tablas: {tabla.despliega().map(t => t.nombre).join(' · ')}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render SVG */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Despliega()"
              subheader="Render de las 4 sub-tablas a escala — Y-flip GIS → SVG"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ overflowX: 'auto' }}>
              <TablaSvg tabla={tabla} scale={scale} />

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                tbl_SimSimbologia: <code>bDibuja_Columnas_Internas? = true</code>, <code>bDibuja_Renglones_Internos? = false</code> — los símbolos se separan en columnas pero comparten renglón visual.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
