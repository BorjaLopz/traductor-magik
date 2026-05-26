import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, List, ListItem, ListItemText, Stack, TextField, Typography,
} from '@mui/material'
import { RutaOpbsPlugin } from '../models/RutaOpbsPlugin'

export function RutaOpbsPluginShowcase() {
  const plugin = useMemo(() => {
    const p = new RutaOpbsPlugin()
    p.initActions()
    return p
  }, [])

  const [, bump] = useState(0)
  const re = () => bump(t => t + 1)

  const [rutaId, setRutaId]     = useState('RC-001')
  const [rutaNum, setRutaNum]   = useState('RC-2025-001')
  const [opbId, setOpbId]       = useState('OPB-A')
  const [opbName, setOpbName]   = useState('CEDO XOLA')

  const onActivate = () => { plugin.guiRutaOpb(); re() }
  const onAssignCurrent = () => {
    plugin.setCurrentRuta({ id: rutaId, numero: rutaNum })
    plugin.setCurrentOpb ({ id: opbId,  nombre: opbName })
    re()
  }
  const onClear = () => { plugin.setCurrentRuta(undefined); plugin.setCurrentOpb(undefined); re() }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ruta_opbs_plugin
        <Chip label="Fase 1 · SIMPLE · score 2" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="plugin" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/ruta_opbs_plugin.magik</code> — package <code>sw</code>
      </Typography>

      <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
        Lifecycle no-estándar: <code>guiRutaOpb</code> en cache-hit hace <code>d.close()</code> + <code>dialogs.empty()</code> + <strong>recrea</strong> uno nuevo. Distinto de <code>cuadro_de_notas_plugin</code> que reutiliza.
      </Alert>

      <Grid container spacing={3}>
        {/* Acciones */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="init_actions / guiRutaOpb"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  Actions registradas: {plugin.actions.length === 0 ? '—' : plugin.actions.map(a => `:${a.id}`).join(', ')}
                </Box>

                <Button variant="contained" size="small" onClick={onActivate}>
                  guiRutaOpb()
                </Button>

                <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  dialogs.size = {plugin.dialogs.size}
                  {plugin.dialogs.size > 0 && (
                    <>
                      {[...plugin.dialogs.entries()].map(([k, d]) => (
                        <div key={k}>
                          :{k} → activated={String(d.activated)} · closed={String(d.closed)} · pos=({d.position?.xOffset},{d.position?.yOffset})
                        </div>
                      ))}
                    </>
                  )}
                </Box>

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  Historial (cache-hit → closed+recreated)
                </Typography>
                {plugin.log.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">Sin activaciones.</Typography>
                ) : (
                  <List dense disablePadding sx={{ maxHeight: 220, overflowY: 'auto' }}>
                    {plugin.log.map(entry => (
                      <ListItem key={entry.step} disableGutters>
                        <ListItemText
                          primary={
                            <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                              #{entry.step} · <Chip
                                label={entry.action}
                                size="small"
                                color={entry.action === 'closed+recreated' ? 'warning' : 'success'}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                              activate_relative_to("SIGC 11", top_frame, {entry.dialog.position?.xOffset}, {entry.dialog.position?.yOffset})
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Slots oCurrentRuta / oCurrentOpb */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="oCurrentRuta / oCurrentOpb"
              subheader="readable, private — asignados por el diálogo cliente"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <TextField label="ruta.id"     value={rutaId}  onChange={e => setRutaId(e.target.value)}  size="small" fullWidth />
                  <TextField label="ruta.numero" value={rutaNum} onChange={e => setRutaNum(e.target.value)} size="small" fullWidth />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <TextField label="opb.id"     value={opbId}   onChange={e => setOpbId(e.target.value)}   size="small" fullWidth />
                  <TextField label="opb.nombre" value={opbName} onChange={e => setOpbName(e.target.value)} size="small" fullWidth />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={onAssignCurrent}>Asignar</Button>
                  <Button variant="outlined" size="small" color="warning" onClick={onClear}>Limpiar (_unset)</Button>
                </Stack>

                <Divider />

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  <div>.oCurrentRuta = {plugin.oCurrentRuta ? `{ id="${plugin.oCurrentRuta.id}", numero="${plugin.oCurrentRuta.numero}" }` : '_unset'}</div>
                  <div>.oCurrentOpb  = {plugin.oCurrentOpb  ? `{ id="${plugin.oCurrentOpb.id}", nombre="${plugin.oCurrentOpb.nombre}" }`  : '_unset'}</div>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
