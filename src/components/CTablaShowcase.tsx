import { useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider, FormControlLabel,
  Grid, Slider, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CTabla, type BordeLado, type Celda } from '../models/CTabla'

interface SelectedCell { ren: number; col: number }

const LADOS: BordeLado[] = ['izquierda', 'derecha', 'superior', 'inferior']

export function CTablaShowcase() {
  const [rens, setRens] = useState<number>(3)
  const [cols, setCols] = useState<number>(4)
  const [externos,  setExternos]  = useState<boolean>(true)
  const [interCols, setInterCols] = useState<boolean>(true)
  const [interRens, setInterRens] = useState<boolean>(true)
  const [scale, setScale] = useState<number>(3)
  const [selected, setSelected] = useState<SelectedCell>({ ren: 1, col: 1 })

  const tabla = useMemo(() => {
    const t = new CTabla(rens, cols)
    t.sNombre = `tabla_${rens}x${cols}`
    t.setBordesExternos(externos)
    t.setColumnasInternas(interCols)
    t.setRenglonesInternos(interRens)
    return t
  }, [rens, cols, externos, interCols, interRens])

  const [, bump] = useState(0)
  const re = () => bump(t => t + 1)

  const toggleBordeIndividual = (lado: BordeLado, v: boolean) => {
    tabla.activaBordeCelda(selected.ren, selected.col, lado, v)
    re()
  }

  const setColumnaLongitud = (c: number, mm: number) => {
    tabla.oColumnas[c - 1].nLongitud = Math.max(1, mm)
    re()
  }
  const setRenglonLongitud = (r: number, mm: number) => {
    tabla.oRenglones[r - 1].nLongitud = Math.max(1, mm)
    re()
  }
  const setTexto = (c: Celda, v: string) => {
    c.texto = v
    re()
  }

  const bbox = tabla.calculaAreaTabla()
  const pad  = 12
  const W    = (bbox.xmax - bbox.xmin) * scale + pad * 2
  const H    = (bbox.ymax - bbox.ymin) * scale + pad * 2
  const sx = (x: number) => (x - bbox.xmin) * scale + pad
  const sy = (y: number) => (bbox.ymax - y) * scale + pad

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla
        <Chip label="Fase 2 · MODERADO · score 33" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_Tabla.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Dim + flags */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="new(rens, cols)"
              subheader={`${tabla.totalRenglones} × ${tabla.totalColumnas} · "${tabla.sNombre}"`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <TextField type="number" label="nRenglones" value={rens} onChange={e => setRens(Math.max(1, Number(e.target.value) || 1))} size="small" fullWidth />
                  <TextField type="number" label="nColumnas"  value={cols} onChange={e => setCols(Math.max(1, Number(e.target.value) || 1))} size="small" fullWidth />
                </Stack>

                <FormControlLabel control={<Switch size="small" checked={externos}  onChange={e => setExternos(e.target.checked)} />}  label="bDibuja_bordes? (externos)" />
                <FormControlLabel control={<Switch size="small" checked={interCols} onChange={e => setInterCols(e.target.checked)} />} label="bDibuja_columnas_internas?" />
                <FormControlLabel control={<Switch size="small" checked={interRens} onChange={e => setInterRens(e.target.checked)} />} label="bDibuja_renglones_internos?" />

                <Divider />

                <Typography variant="caption" color="text.secondary">longitudes columnas (mm)</Typography>
                {tabla.oColumnas.map((c, i) => (
                  <TextField
                    key={`col-${i}`}
                    label={`col[${i + 1}]`}
                    type="number"
                    value={c.nLongitud}
                    onChange={e => setColumnaLongitud(i + 1, Number(e.target.value) || 1)}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                ))}
                <Typography variant="caption" color="text.secondary">longitudes renglones (mm)</Typography>
                {tabla.oRenglones.map((r, i) => (
                  <TextField
                    key={`ren-${i}`}
                    label={`ren[${i + 1}]`}
                    type="number"
                    value={r.nLongitud}
                    onChange={e => setRenglonLongitud(i + 1, Number(e.target.value) || 1)}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Despliega"
              subheader={`bbox = ${(bbox.xmax - bbox.xmin).toFixed(0)} × ${(bbox.ymax - bbox.ymin).toFixed(0)} mm`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">escala = {scale} px/mm</Typography>
                <Slider min={1} max={6} step={0.5} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4 }}>
                  {tabla.oCeldas.flatMap(row =>
                    row.map(c => {
                      const b = tabla.bboxCelda(c.nRen, c.nCol)
                      const x = sx(b.xmin), y = sy(b.ymax)
                      const w = (b.xmax - b.xmin) * scale, h = (b.ymax - b.ymin) * scale
                      const isSel = selected.ren === c.nRen && selected.col === c.nCol
                      const strokeColor = `rgb(${c.bordes.colorLinea.map(v => Math.round(v <= 1 ? v * 255 : v)).join(',')})`
                      return (
                        <g key={`${c.nRen}-${c.nCol}`} onClick={() => setSelected({ ren: c.nRen, col: c.nCol })} style={{ cursor: 'pointer' }}>
                          <rect x={x} y={y} width={w} height={h} fill={isSel ? '#fff3cd' : '#fafafa'} stroke="none" />
                          {c.bordes.sup && <line x1={x}     y1={y}     x2={x + w} y2={y}     stroke={strokeColor} strokeWidth={1.5} />}
                          {c.bordes.inf && <line x1={x}     y1={y + h} x2={x + w} y2={y + h} stroke={strokeColor} strokeWidth={1.5} />}
                          {c.bordes.izq && <line x1={x}     y1={y}     x2={x}     y2={y + h} stroke={strokeColor} strokeWidth={1.5} />}
                          {c.bordes.der && <line x1={x + w} y1={y}     x2={x + w} y2={y + h} stroke={strokeColor} strokeWidth={1.5} />}
                          {c.texto && (
                            <text x={x + w / 2} y={y + h / 2} fontSize={10} fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle" fill="#222">
                              {c.texto}
                            </text>
                          )}
                          {!c.texto && (
                            <text x={x + w / 2} y={y + h / 2} fontSize={9} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle" fill="#bbb">
                              ({c.nRen},{c.nCol})
                            </text>
                          )}
                        </g>
                      )
                    }),
                  )}
                </svg>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Click una celda para editarla.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Celda seleccionada */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardHeader
              title={`celda(${selected.ren}, ${selected.col})`}
              subheader="activa_borde_celda(ren,col,lado) << activo — sincroniza adyacente"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <TextField
                  label="texto"
                  size="small"
                  value={tabla.celda(selected.ren, selected.col).texto ?? ''}
                  onChange={e => setTexto(tabla.celda(selected.ren, selected.col), e.target.value)}
                  fullWidth
                />

                <Divider />

                {LADOS.map(l => (
                  <FormControlLabel
                    key={l}
                    control={
                      <Switch
                        size="small"
                        checked={getLado(tabla.celda(selected.ren, selected.col), l)}
                        onChange={e => toggleBordeIndividual(l, e.target.checked)}
                      />
                    }
                    label={<Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>:{l}</Box>}
                    sx={{ m: 0 }}
                  />
                ))}

                <Divider />

                <Button size="small" variant="outlined" onClick={() => { tabla.setColorLinea([255, 0, 0]); re() }}>color rojo</Button>
                <Button size="small" variant="outlined" onClick={() => { tabla.setColorLinea([0, 0, 0]); re() }}>color negro</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function getLado(c: Celda, lado: BordeLado): boolean {
  switch (lado) {
    case 'izquierda': return c.bordes.izq
    case 'derecha':   return c.bordes.der
    case 'superior':  return c.bordes.sup
    case 'inferior':  return c.bordes.inf
  }
}
