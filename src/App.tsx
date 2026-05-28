import { useState } from 'react'
import {
  Box, Chip, CssBaseline, Divider, InputAdornment, List, ListItemButton,
  TextField, ThemeProvider, Tooltip, Typography, createTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { SHOWCASE_REGISTRY, type ShowcaseEntry } from './showcase-registry'

const theme = createTheme({ palette: { mode: 'light' } })

const FASE_COLOR: Record<ShowcaseEntry['fase'], string> = {
  1: '#2e7d32', 2: '#1565c0', 3: '#6a1b9a', 4: '#e65100', 5: '#c62828', 6: '#37474f',
}

const NIVEL_COLOR: Record<ShowcaseEntry['nivel'], 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  'SIMPLE':       'success',
  'MODERADO':     'info',
  'COMPLEJO':     'warning',
  'MUY COMPLEJO': 'error',
  'CRÍTICO':      'error',
}

const NIVEL_ORDER: Record<ShowcaseEntry['nivel'], number> = {
  'SIMPLE':       0,
  'MODERADO':     1,
  'COMPLEJO':     2,
  'MUY COMPLEJO': 3,
  'CRÍTICO':      4,
}

const SIDEBAR_WIDTH = 440

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(SHOWCASE_REGISTRY[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const selected = SHOWCASE_REGISTRY.find(e => e.id === selectedId)

  const filtered = query.trim()
    ? SHOWCASE_REGISTRY.filter(e =>
        e.label.toLowerCase().includes(query.toLowerCase()) ||
        e.id.toLowerCase().includes(query.toLowerCase())
      )
    : SHOWCASE_REGISTRY

  const byFase = filtered.reduce<Record<number, ShowcaseEntry[]>>((acc, entry) => {
    ;(acc[entry.fase] ??= []).push(entry)
    return acc
  }, {})
  Object.values(byFase).forEach(entries =>
    entries.sort((a, b) => NIVEL_ORDER[a.nivel] - NIVEL_ORDER[b.nivel])
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>

        {/* ── Sidebar ── */}
        <Box sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Magik → TSX
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} / {SHOWCASE_REGISTRY.length} componente{SHOWCASE_REGISTRY.length !== 1 ? 's' : ''}
            </Typography>
            <TextField
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar clase…"
              size="small"
              fullWidth
              sx={{ mt: 1.5 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {Object.keys(byFase).length === 0 ? (
              <Typography variant="caption" color="text.disabled" sx={{ p: 2, display: 'block' }}>
                Sin resultados para "{query}"
              </Typography>
            ) : (
              Object.entries(byFase).sort(([a], [b]) => Number(a) - Number(b)).map(([fase, entries]) => (
                <Box key={fase}>
                  <Typography variant="overline" sx={{
                    px: 2, pt: 1.5, pb: 0.5, display: 'block', fontSize: 10,
                    color: FASE_COLOR[Number(fase) as ShowcaseEntry['fase']],
                  }}>
                    Fase {fase}
                  </Typography>
                  <List dense disablePadding>
                    {entries.map(entry => (
                      <Tooltip key={entry.id} title={entry.magikSource} placement="right" arrow>
                        <ListItemButton
                          selected={selectedId === entry.id}
                          onClick={() => setSelectedId(entry.id)}
                          sx={{ pl: 2 }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {entry.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.nivel}
                            </Typography>
                          </Box>
                        </ListItemButton>
                      </Tooltip>
                    ))}
                  </List>
                  <Divider />
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* ── Main ── */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: 3 }}>
          {selected ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {selected.label}
                </Typography>
                <Chip
                  label={`Fase ${selected.fase}`}
                  size="small"
                  sx={{ bgcolor: FASE_COLOR[selected.fase], color: '#fff' }}
                />
                <Chip
                  label={selected.nivel}
                  size="small"
                  color={NIVEL_COLOR[selected.nivel]}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                {selected.magikSource}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {selected.element}
            </>
          ) : (
            <Typography color="text.secondary">Selecciona un componente en el sidebar.</Typography>
          )}
        </Box>

      </Box>
    </ThemeProvider>
  )
}
