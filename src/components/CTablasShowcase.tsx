import { useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid,
  IconButton, MenuItem, Slider, Stack, TextField, Typography,
} from '@mui/material'
import { CTablas } from '../models/CTablas'
import type { Celda } from '../models/CTabla'

export function CTablasShowcase() {
  // Construcción demo: 3 sub-tablas apiladas en Y
  const c = useMemo(() => {
    const tablas = new CTablas('layout_demo')
    const titulo = tablas.creaTabla(1, 1, 'tbl_titulo')
    titulo.setCoordenadaOrigen({ x: 0, y: 100 })
    titulo.oRenglones[0].nLongitud = 8
    titulo.oColumnas[0].nLongitud = 80
    titulo.celda(1, 1).texto = 'RESUMEN'

    const subtitulo = tablas.creaTabla(1, 3, 'tbl_subtitulo')
    subtitulo.setCoordenadaOrigen({ x: 0, y: 92 })
    subtitulo.oRenglones[0].nLongitud = 5
    subtitulo.oColumnas[0].nLongitud = 30
    subtitulo.oColumnas[1].nLongitud = 25
    subtitulo.oColumnas[2].nLongitud = 25
    subtitulo.celda(1, 1).texto = 'CONCEPTO'
    subtitulo.celda(1, 2).texto = 'EXISTENTE'
    subtitulo.celda(1, 3).texto = 'PROYECTADO'

    const detalle = tablas.creaTabla(4, 3, 'tbl_detalle')
    detalle.setCoordenadaOrigen({ x: 0, y: 87 })
    for (let r = 0; r < 4; r++) detalle.oRenglones[r].nLongitud = 7
    detalle.oColumnas[0].nLongitud = 30
    detalle.oColumnas[1].nLongitud = 25
    detalle.oColumnas[2].nLongitud = 25
    return tablas
  }, [])

  const [scale, setScale] = useState<number>(3)
  const [newRens, setNewRens] = useState(2)
  const [newCols, setNewCols] = useState(2)
  const [newNombre, setNewNombre] = useState('tbl_extra')

  const [, bump] = useState(0)
  const re = () => bump(t => t + 1)

  const onCrear = () => {
    if (c.collTablas.has(newNombre)) return
    const t = c.creaTabla(newRens, newCols, newNombre)
    // Posiciona debajo de las existentes
    const area = c.areaTotal()
    if (area) t.setCoordenadaOrigen({ x: area.xmin, y: area.ymin - 2 })
    setNewNombre(`tbl_${c.nTotalTablas + 1}`)
    re()
  }

  const onEliminar = (nombre: string) => {
    c.collTablas.delete(nombre)
    c.nTotalTablas -= 1
    re()
  }

  const area = c.areaTotal()
  const longCol = c.longitudTotalColumnas(['tbl_titulo', 'tbl_subtitulo', 'tbl_detalle'])
  const longRen = c.longitudTotalRenglones(['tbl_titulo', 'tbl_subtitulo', 'tbl_detalle'])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tablas
        <Chip label="Fase 2 · MODERADO · score 19" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_tablas.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Coleccion */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="collTablas"
              subheader={`nTotalTablas = ${c.totalElementos()}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1}>
                {[...c.collTablas.entries()].map(([nombre, t]) => (
                  <Box key={nombre} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>
                      <div><strong>{nombre}</strong></div>
                      <Box sx={{ fontSize: 10, color: 'text.secondary' }}>
                        {t.totalRenglones}×{t.totalColumnas} · origin=({t.oCoordenadaOrigen.x},{t.oCoordenadaOrigen.y})
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => onEliminar(nombre)}>✕</IconButton>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">crea_tabla(rens, cols, nombre)</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <TextField type="number" label="rens" value={newRens} onChange={e => setNewRens(Math.max(1, Number(e.target.value) || 1))} size="small" sx={{ width: 70 }} />
                <TextField type="number" label="cols" value={newCols} onChange={e => setNewCols(Math.max(1, Number(e.target.value) || 1))} size="small" sx={{ width: 70 }} />
                <TextField label="nombre" value={newNombre} onChange={e => setNewNombre(e.target.value)} size="small" sx={{ flex: 1 }} />
              </Stack>
              <Button variant="contained" size="small" onClick={onCrear} sx={{ mt: 1 }}>+ crea_tabla()</Button>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                area_total = {area ? `bbox(${area.xmin}, ${area.ymin}, ${area.xmax}, ${area.ymax})` : '_unset'}<br />
                Longitud_total_Columnas = {longCol} mm<br />
                Longitud_total_Renglones = {longRen} mm
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Render */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Despliega"
              subheader="Itera collTablas y dibuja cada una en sus coordenadas"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">escala = {scale} px/mm</Typography>
                <Slider min={1.5} max={6} step={0.25} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <TablasSvg c={c} scale={scale} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function TablasSvg({ c, scale }: { c: CTablas; scale: number }) {
  const area = c.areaTotal()
  if (!area) return <Box sx={{ fontSize: 12, color: 'text.disabled' }}>Sin tablas</Box>
  const pad = 12
  const W = (area.xmax - area.xmin) * scale + pad * 2
  const H = (area.ymax - area.ymin) * scale + pad * 2
  const sx = (x: number) => (x - area.xmin) * scale + pad
  const sy = (y: number) => (area.ymax - y) * scale + pad

  return (
    <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4 }}>
      {[...c.collTablas.entries()].map(([nombre, t]) => (
        <g key={nombre}>
          {t.oCeldas.flatMap(row =>
            row.map(cell => {
              const b = t.bboxCelda(cell.nRen, cell.nCol)
              const x = sx(b.xmin), y = sy(b.ymax)
              const w = (b.xmax - b.xmin) * scale, h = (b.ymax - b.ymin) * scale
              const stroke = `rgb(${cell.bordes.colorLinea.map(v => Math.round(v <= 1 ? v * 255 : v)).join(',')})`
              return (
                <g key={`${nombre}-${cell.nRen}-${cell.nCol}`}>
                  <rect x={x} y={y} width={w} height={h} fill="#fafafa" stroke="none" />
                  {cell.bordes.sup && <line x1={x} y1={y} x2={x + w} y2={y} stroke={stroke} strokeWidth={1.5} />}
                  {cell.bordes.inf && <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={stroke} strokeWidth={1.5} />}
                  {cell.bordes.izq && <line x1={x} y1={y} x2={x} y2={y + h} stroke={stroke} strokeWidth={1.5} />}
                  {cell.bordes.der && <line x1={x + w} y1={y} x2={x + w} y2={y + h} stroke={stroke} strokeWidth={1.5} />}
                  {renderText(cell, x + w / 2, y + h / 2)}
                </g>
              )
            }),
          )}
          {/* etiqueta del nombre de la sub-tabla */}
          <text
            x={sx(t.oCoordenadaOrigen.x) - 2}
            y={sy(t.oCoordenadaOrigen.y) - 4}
            fontSize={9}
            fontFamily="monospace"
            fill="#888"
          >
            {nombre}
          </text>
        </g>
      ))}
    </svg>
  )
}

function renderText(cell: Celda, cx: number, cy: number) {
  if (cell.texto) {
    return (
      <text x={cx} y={cy} fontSize={10} fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle" fill="#222">
        {cell.texto}
      </text>
    )
  }
  return (
    <text x={cx} y={cy} fontSize={9} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle" fill="#bbb">
      ({cell.nRen},{cell.nCol})
    </text>
  )
}

void MenuItem
