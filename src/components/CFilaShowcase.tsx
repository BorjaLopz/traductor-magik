import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Stack, TextField, Typography,
} from '@mui/material'
import { CFila } from '../models/CFila'

interface HistoryEntry {
  step:        number
  via:         'new' | 'setter'
  input:       number
  storedAfter: number
  serialAfter: number
  error?:      string
}

export function CFilaShowcase() {
  const [newArg, setNewArg]   = useState<string>('5')
  const [setVal, setSetVal]   = useState<string>('5')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [error, setError]     = useState<string | null>(null)

  // Instancia viva — replica el ciclo Magik (constructor + setter posterior)
  const fila = useMemo(() => new CFila(0), [])

  // Re-render bump
  const [tick, bump] = useState(0)
  void tick

  const resetWithNew = () => {
    setError(null)
    const v = Number(newArg)
    if (!Number.isFinite(v)) { setError('argumento new() no numérico'); return }
    // Magik new() asigna directo. Replicamos via property privada (cast).
    ;(fila as unknown as { _nLongitud: number })._nLongitud = v
    bump(t => t + 1)
    setHistory(prev => [
      ...prev,
      {
        step:        prev.length + 1,
        via:         'new',
        input:       v,
        storedAfter: fila.nLongitud,
        serialAfter: fila.serialSlots().values[0],
      },
    ])
  }

  const applySetter = () => {
    setError(null)
    const v = Number(setVal)
    if (!Number.isFinite(v)) { setError('valor setter no numérico'); return }
    try {
      fila.nLongitud = v
      bump(t => t + 1)
      setHistory(prev => [
        ...prev,
        {
          step:        prev.length + 1,
          via:         'setter',
          input:       v,
          storedAfter: fila.nLongitud,
          serialAfter: fila.serialSlots().values[0],
        },
      ])
    } catch (e) {
      const msg = (e as Error).message
      setError(msg)
      setHistory(prev => [
        ...prev,
        {
          step:        prev.length + 1,
          via:         'setter',
          input:       v,
          storedAfter: fila.nLongitud,
          serialAfter: fila.serialSlots().values[0],
          error:       msg,
        },
      ])
    }
  }

  const onReset = () => {
    setHistory([])
    setError(null)
    ;(fila as unknown as { _nLongitud: number })._nLongitud = 0
    bump(t => t + 1)
  }

  const serial = fila.serialSlots()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_fila
        <Chip label="Fase 1 · SIMPLE · score 7" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_fila.magik</code> — package <code>user</code>
      </Typography>

      <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
        Asimetría heredada: el <code>setter .nLongitud &lt;&lt; val</code> multiplica por 10 antes de almacenar,
        pero el constructor <code>new(R)</code> guarda <code>R</code> directo. <code>serial_slots</code> divide
        siempre por 10. Resultado: una instancia creada con <code>new(5)</code> serializa como <code>0.5</code>.
      </Alert>

      <Grid container spacing={3}>
        {/* Controles */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Operaciones"
              subheader="new(R) vs .nLongitud << val"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField
                    label="new(R)"
                    value={newArg}
                    onChange={e => setNewArg(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" size="small" onClick={resetWithNew}>
                    new()
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField
                    label=".nLongitud &lt;&lt; val"
                    value={setVal}
                    onChange={e => setSetVal(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button variant="contained" size="small" onClick={applySetter}>
                    setter
                  </Button>
                </Stack>

                {error && <Alert severity="error" sx={{ fontSize: 12 }}>{error}</Alert>}

                <Divider />

                <Button size="small" color="warning" onClick={onReset}>
                  Reset historial + estado
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado actual */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardHeader
              title="Estado actual"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                <div>.nLongitud      = <strong>{fila.nLongitud}</strong></div>
                <div>serialSlots()   = <strong>{serial.values[0]}</strong></div>
                <div style={{ color: '#666', fontSize: 11, marginTop: 6 }}>
                  serial.keys = [{serial.keys.map(k => `"${k}"`).join(', ')}]
                </div>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Historial */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Historial"
              subheader={`${history.length} operación${history.length === 1 ? '' : 'es'}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ maxHeight: 280, overflowY: 'auto' }}>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Sin operaciones todavía.
                </Typography>
              ) : (
                <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['#', 'vía', 'in', 'stored', 'serial'].map(h => (
                        <Box component="th" key={h} sx={{ textAlign: 'left', py: 0.5, borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                          {h}
                        </Box>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.step} style={h.error ? { color: '#c62828' } : undefined}>
                        <Box component="td" sx={{ py: 0.5 }}>{h.step}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{h.via}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{h.input}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{h.error ? '—' : h.storedAfter}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{h.error ? '—' : h.serialAfter}</Box>
                      </tr>
                    ))}
                  </tbody>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
