import { useEffect, useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, FormControlLabel,
  Grid, IconButton, Stack, TextField, Typography, Alert,
} from '@mui/material'
import { CCeldas, type BordeLado } from '../models/CCeldas'

interface CellState {
  texto:   string
  bordes:  Record<BordeLado, boolean>
}

const LADOS: BordeLado[] = ['izquierda', 'derecha', 'superior', 'inferior']

export function CCeldasShowcase() {
  const [nRen, setNRen] = useState<number>(3)
  const [nCol, setNCol] = useState<number>(4)
  const [selected, setSelected] = useState<{ ren: number; col: number } | null>({ ren: 1, col: 1 })
  const [query, setQuery] = useState<{ ren: string; col: string }>({ ren: '1', col: '1' })
  const [error, setError] = useState<string | null>(null)

  // Recrea la instancia cuando cambian dimensiones (Magik: c_celdas.new(R,C))
  const celdas = useMemo(() => new CCeldas(nRen, nCol), [nRen, nCol])

  // Snapshot del estado visible — fuerza re-render al mutar
  const [tick, setTick] = useState(0)
  const bump = () => setTick(t => t + 1)

  useEffect(() => {
    setSelected({ ren: 1, col: 1 })
    setError(null)
    bump()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celdas])

  const snapshot: CellState[][] = []
  celdas.forEach(c => {
    if (!snapshot[c.nRen - 1]) snapshot[c.nRen - 1] = []
    snapshot[c.nRen - 1][c.nCol - 1] = {
      texto:  c.texto ?? '',
      bordes: {
        izquierda: !!c.bordeOf('izquierda'),
        derecha:   !!c.bordeOf('derecha'),
        superior:  !!c.bordeOf('superior'),
        inferior:  !!c.bordeOf('inferior'),
      },
    }
  })
  // referenciar tick para que el effect re-corra
  void tick

  const onCelda = () => {
    setError(null)
    const r = Number(query.ren), c = Number(query.col)
    if (!Number.isFinite(r) || !Number.isFinite(c)) { setError('Ren/Col inválidos'); return }
    try {
      celdas.celda(r, c)
      setSelected({ ren: r, col: c })
    } catch (e) {
      setError((e as Error).message)
      setSelected(null)
    }
  }

  const onTextChange = (texto: string) => {
    if (!selected) return
    celdas.celda(selected.ren, selected.col).texto = texto
    bump()
  }

  const onBorderToggle = (lado: BordeLado, val: boolean) => {
    if (!selected) return
    celdas.celda(selected.ren, selected.col).setBorde(lado, val)
    bump()
  }

  const cellOf = (ren: number, col: number) => snapshot[ren - 1]?.[col - 1]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_celdas
        <Chip label="Fase 1 · SIMPLE · score 8" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_celdas.magik</code> + <code>c_celda.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Controles dimensiones + acceso celda */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="new(RnRen, RnCol)"
              subheader="Matriz NxM — pos = nNumCol * (ren-1) + col"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="nNumRen"
                    type="number"
                    value={nRen}
                    onChange={e => setNRen(Math.max(1, Number(e.target.value) || 1))}
                    size="small"
                    slotProps={{ htmlInput: { min: 1, max: 12 } }}
                  />
                  <TextField
                    label="nNumCol"
                    type="number"
                    value={nCol}
                    onChange={e => setNCol(Math.max(1, Number(e.target.value) || 1))}
                    size="small"
                    slotProps={{ htmlInput: { min: 1, max: 12 } }}
                  />
                </Stack>

                <Box>
                  <Typography variant="caption" color="text.secondary">celda(RnRen, RnCol) — validación bounds</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <TextField
                      label="ren"
                      value={query.ren}
                      onChange={e => setQuery({ ...query, ren: e.target.value })}
                      size="small"
                      sx={{ width: 80 }}
                    />
                    <TextField
                      label="col"
                      value={query.col}
                      onChange={e => setQuery({ ...query, col: e.target.value })}
                      size="small"
                      sx={{ width: 80 }}
                    />
                    <Button variant="outlined" size="small" onClick={onCelda}>celda()</Button>
                  </Stack>
                </Box>

                {error && <Alert severity="warning" sx={{ fontSize: 12 }}>{error}</Alert>}

                {selected && (
                  <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontSize: 12, fontFamily: 'monospace' }}>
                    <div>selected.nRen = {selected.ren}</div>
                    <div>selected.nCol = {selected.col}</div>
                    <div>pos (lineal) = {nCol * (selected.ren - 1) + selected.col}</div>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Editor de celda seleccionada */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="c_celda — texto y bordes"
              subheader=".texto / .bordes(lado) << val"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {selected ? (
                <Stack spacing={1.5}>
                  <TextField
                    label="oElemento.sTexto"
                    value={cellOf(selected.ren, selected.col)?.texto ?? ''}
                    onChange={e => onTextChange(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Typography variant="caption" color="text.secondary">
                    oElementos.obten_elemento(:bordes_celda)
                  </Typography>
                  {LADOS.map(l => (
                    <FormControlLabel
                      key={l}
                      control={
                        <Checkbox
                          size="small"
                          checked={!!cellOf(selected.ren, selected.col)?.bordes[l]}
                          onChange={e => onBorderToggle(l, e.target.checked)}
                        />
                      }
                      label={<Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>:{l}</Box>}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  Selecciona una celda en la rejilla o usa <code>celda(ren, col)</code>.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Visualización rejilla */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title={`collCeldas — ${nRen} × ${nCol} (${nRen * nCol} celdas)`}
              subheader="Click para seleccionar"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${nCol}, 60px)`,
                gridTemplateRows:    `repeat(${nRen}, 50px)`,
                gap: 0,
              }}>
                {Array.from({ length: nRen }, (_, r) =>
                  Array.from({ length: nCol }, (_, c) => {
                    const ren = r + 1, col = c + 1
                    const cell = cellOf(ren, col)
                    const isSel = selected?.ren === ren && selected?.col === col
                    const b = cell?.bordes
                    return (
                      <Box
                        key={`${ren}-${col}`}
                        onClick={() => { setSelected({ ren, col }); setQuery({ ren: String(ren), col: String(col) }); setError(null) }}
                        sx={{
                          width: 60, height: 50,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontFamily: 'monospace',
                          cursor: 'pointer',
                          bgcolor: isSel ? 'primary.light' : 'background.paper',
                          color:   isSel ? 'primary.contrastText' : 'text.primary',
                          borderTop:    b?.superior ? '2px solid #333' : '1px dashed #ddd',
                          borderBottom: b?.inferior ? '2px solid #333' : '1px dashed #ddd',
                          borderLeft:   b?.izquierda ? '2px solid #333' : '1px dashed #ddd',
                          borderRight:  b?.derecha  ? '2px solid #333' : '1px dashed #ddd',
                          boxSizing: 'border-box',
                          textAlign: 'center',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                        title={`(${ren},${col})`}
                      >
                        {cell?.texto || <span style={{ color: '#bbb' }}>({ren},{col})</span>}
                      </Box>
                    )
                  })
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Borde sólido = activo · discontinuo = inactivo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

// IconButton no usado pero kept para shake-tree: marcar exportable.
void IconButton
