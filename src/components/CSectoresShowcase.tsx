import { useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid,
  IconButton, MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import { CSectores, type Coordinate, type SectorRope } from '../models/CSectores'

interface Preset {
  label: string
  rope:  SectorRope
}

// Cada sector = polilínea de 2+ coords. Algunos presets fuerzan cadenas
// (extremos coincidentes) y otros dejan tramos sueltos.
const PRESETS: Preset[] = [
  {
    label: 'cadena lineal A→B→C→D',
    rope: [
      [[0, 0], [10, 0]],
      [[10, 0], [20, 5]],
      [[20, 5], [30, 5]],
      [[30, 5], [40, 0]],
    ],
  },
  {
    label: 'desordenada (mismo destino)',
    rope: [
      [[20, 5], [30, 5]],
      [[0, 0], [10, 0]],
      [[30, 5], [40, 0]],
      [[10, 0], [20, 5]],
    ],
  },
  {
    label: '2 cadenas separadas',
    rope: [
      [[0, 0], [10, 0]],
      [[10, 0], [20, 0]],
      [[50, 50], [60, 50]],
      [[60, 50], [70, 60]],
    ],
  },
  {
    label: 'cadena reversa (last↔last)',
    rope: [
      [[0, 0], [10, 5]],
      [[20, 10], [10, 5]],
      [[20, 10], [30, 15]],
    ],
  },
]

export function CSectoresShowcase() {
  const sectores = useMemo(() => new CSectores(), [])
  const [presetIdx, setPresetIdx] = useState<number>(0)
  const [rope,      setRope]      = useState<SectorRope>(PRESETS[0].rope.map(s => s.slice()))

  const result = useMemo(() => sectores.armaSector(rope), [rope, sectores])

  const updateCoord = (segIdx: number, pIdx: number, axis: 0 | 1, v: number) => {
    setRope(prev => prev.map((seg, i) => {
      if (i !== segIdx) return seg
      return seg.map((p, j) => {
        if (j !== pIdx) return p
        const np: Coordinate = axis === 0 ? [v, p[1]] : [p[0], v]
        return np
      })
    }))
  }

  const addSegment = () => {
    setRope(prev => [...prev, [[0, 0], [10, 10]]])
  }

  const removeSegment = (i: number) => {
    setRope(prev => prev.filter((_, j) => j !== i))
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sectores
        <Chip label="Fase 2 · COMPLEJO · score 4" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends layout_element + viewport_layout_mixin" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_sectores.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Input */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sector rope (entrada)"
              subheader="arma_sector encadena por coincidencia de extremos"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="preset"
                  value={presetIdx}
                  onChange={e => {
                    const i = Number(e.target.value)
                    setPresetIdx(i)
                    setRope(PRESETS[i].rope.map(s => s.slice()))
                  }}
                  size="small"
                  fullWidth
                >
                  {PRESETS.map((p, i) => <MenuItem key={i} value={i}>{p.label}</MenuItem>)}
                </TextField>

                <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                  {rope.map((seg, i) => (
                    <Box key={i} sx={{ p: 1, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', flex: 1 }}>
                          sector[{i}] — {seg.length} coords
                        </Box>
                        <IconButton size="small" onClick={() => removeSegment(i)}>✕</IconButton>
                      </Box>
                      {seg.map((p, j) => (
                        <Stack key={j} direction="row" spacing={1} sx={{ mb: 0.5 }}>
                          <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', width: 40 }}>p{j}</Box>
                          <TextField
                            type="number"
                            value={p[0]}
                            onChange={e => updateCoord(i, j, 0, Number(e.target.value) || 0)}
                            size="small"
                            sx={{ width: 80 }}
                          />
                          <TextField
                            type="number"
                            value={p[1]}
                            onChange={e => updateCoord(i, j, 1, Number(e.target.value) || 0)}
                            size="small"
                            sx={{ width: 80 }}
                          />
                        </Stack>
                      ))}
                    </Box>
                  ))}
                </Box>

                <Button size="small" variant="outlined" onClick={addSegment}>+ sector</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="arma_sector(rope) → cadenas"
              subheader={`Resultado: ${result.length} cadena${result.length === 1 ? '' : 's'}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <ChainsSvg rope={rope} chains={result} />

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                {result.map((chain, i) => (
                  <Box key={i} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                    <strong>cadena #{i + 1}</strong> · {chain.length} coords ·{' '}
                    {chain.map(p => `(${p[0]},${p[1]})`).join(' → ')}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function ChainsSvg({ rope, chains }: { rope: SectorRope; chains: SectorRope }) {
  // Calcular bounds
  const all = [...rope.flat(), ...chains.flat()]
  if (all.length === 0) return <Box sx={{ fontSize: 12, color: 'text.disabled' }}>Sin datos</Box>
  let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity
  for (const [x, y] of all) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y) }
  const pad = 20
  const W = 480, H = 220
  const scale = Math.min(
    (W - 2 * pad) / Math.max(1, maxX - minX),
    (H - 2 * pad) / Math.max(1, maxY - minY),
  )
  const sx = (x: number) => (x - minX) * scale + pad
  const sy = (y: number) => H - ((y - minY) * scale + pad)

  const COLORS = ['#1565c0', '#e65100', '#2e7d32', '#6a1b9a', '#c62828', '#f9a825']

  return (
    <svg width={W} height={H} style={{ border: '1px solid #ddd', borderRadius: 4, background: '#fff' }}>
      {/* Input segments (gris claro punteado) */}
      {rope.map((seg, i) => (
        <polyline
          key={`in-${i}`}
          fill="none"
          stroke="#bbb"
          strokeWidth={1}
          strokeDasharray="3 2"
          points={seg.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ')}
        />
      ))}
      {/* Output chains */}
      {chains.map((chain, i) => (
        <g key={`c-${i}`}>
          <polyline
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={chain.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ')}
          />
          {chain.map((p, j) => (
            <circle key={j} cx={sx(p[0])} cy={sy(p[1])} r={4} fill={COLORS[i % COLORS.length]} />
          ))}
        </g>
      ))}
    </svg>
  )
}
