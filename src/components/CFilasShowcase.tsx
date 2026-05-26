import { useMemo, useState } from 'react'
import {
  Box, Chip, Divider, Paper, Slider, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import { CFilas } from '../models/CFilas'

// ── Component ─────────────────────────────────────────────────────────────────

export function CFilasShowcase() {
  const [count, setCount] = useState(6)
  const [overrides, setOverrides] = useState<Record<number, number>>({})

  const filas = useMemo(() => {
    const f = new CFilas(count)
    Object.entries(overrides).forEach(([n, v]) => {
      const idx = Number(n)
      if (idx >= 1 && idx <= count) f.elemento(idx).longitud = v
    })
    return f
  }, [count, overrides])

  const rows = useMemo(
    () => Array.from({ length: filas.totalFilas }, (_, i) => i + 1),
    [filas]
  )

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Colección de filas con longitudes independientes.
        Usada como dimensionamiento de renglones en tablas GIS (CTabla).
        Constructor crea N filas con longitud=10 (unidades internas).
      </Typography>

      {/* Controls */}
      <Stack direction="row" spacing={3} sx={{ mb: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total filas: {count}
          </Typography>
          <Slider
            value={count}
            min={1} max={12} step={1}
            onChange={(_, v) => { setCount(v as number); setOverrides({}) }}
            size="small"
          />
        </Box>
        <Box>
          <Chip label={`totalElementos: ${filas.totalElementos}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        </Box>
        <Box>
          <Chip label={`longitudTotal(): ${filas.longitudTotal()}`} size="small" sx={{ bgcolor: '#e3f2fd', fontSize: 10 }} />
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Row table */}
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#263238' }}>
              {['Fila n', 'longitud', 'iniciaElemento(n)', 'iniciaElemento(n+1)'].map(h => (
                <TableCell key={h} sx={{ color: '#fff', fontSize: 10, fontFamily: 'monospace', py: 0.5 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(n => {
              const fila = filas.elemento(n)
              const inicio = filas.iniciaElemento(n)
              const fin = filas.iniciaElemento(n + 1)
              return (
                <TableRow
                  key={n}
                  sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' }, cursor: 'pointer' }}
                  onClick={() =>
                    setOverrides(prev => ({ ...prev, [n]: (prev[n] ?? 1) + 1 }))
                  }
                >
                  <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 600, color: '#546e7a' }}>{n}</TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0.5 }}>{fila.longitud}</TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0.5, color: '#1565c0' }}>{inicio}</TableCell>
                  <TableCell sx={{ fontSize: 10, py: 0.5, color: '#2e7d32' }}>{fin}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Visual bar chart of row lengths */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Distribución de longitudes (click fila para incrementar)
      </Typography>
      <Stack spacing={0.5}>
        {rows.map(n => {
          const fila = filas.elemento(n)
          const maxLen = Math.max(...rows.map(i => filas.elemento(i).longitud), 1)
          const pct = (fila.longitud / maxLen) * 100
          return (
            <Stack key={n} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: 10, minWidth: 28, color: '#546e7a', fontFamily: 'monospace' }}>
                f{n}
              </Typography>
              <Box
                sx={{
                  height: 14,
                  width: `${pct}%`,
                  minWidth: 4,
                  bgcolor: overrides[n] ? '#1565c0' : '#90a4ae',
                  borderRadius: 1,
                  transition: 'width 0.2s',
                }}
              />
              <Typography sx={{ fontSize: 10, color: '#546e7a', fontFamily: 'monospace' }}>
                {fila.longitud}
              </Typography>
            </Stack>
          )
        })}
      </Stack>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="longitud setter: guarda v×10 (mm→unidades internas)" size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label="constructor new CFila(10): guarda 10 directo (sin ×10)" size="small" variant="outlined" sx={{ fontSize: 10, color: '#e65100' }} />
      </Box>
    </Box>
  )
}
