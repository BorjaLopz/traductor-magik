import { useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, List, ListItem, ListItemText, Stack, Typography,
} from '@mui/material'
import { CuadroDeNotasPlugin } from '../models/CuadroDeNotasPlugin'

interface ActivationLog {
  step:         number
  reusedCache:  boolean
  maximizable:  boolean
  minimizable:  boolean
  resizable:    boolean
  message:      string
  cacheKeys:    string[]
}

export function CuadroDeNotasPluginShowcase() {
  // Instancia única por montaje — replica el ciclo de vida del plugin SW
  const plugin = useMemo(() => {
    const p = new CuadroDeNotasPlugin()
    p.initActions()
    return p
  }, [])

  const [log, setLog] = useState<ActivationLog[]>([])
  const [panel, setPanel] = useState<{ panel: string; tabLabel: string } | null>(null)

  const onActivate = () => {
    const d = plugin.activateDialog(`activación #${log.length + 1}`)
    const reused = !(d as { _justCreated?: boolean })._justCreated
    setLog(prev => [
      ...prev,
      {
        step:        prev.length + 1,
        reusedCache: reused,
        maximizable: d.maximizable,
        minimizable: d.minimizable,
        resizable:   d.resizable,
        message:     d.activationMessage ?? '',
        cacheKeys:   plugin.cachedDialogNames,
      },
    ])
  }

  const onBuildGui = () => {
    const { panel: p, framework } = plugin.buildGui('a_frame_demo', 'xml_element_demo')
    setPanel({ panel: p, tabLabel: framework.tabLabel })
  }

  const onReset = () => {
    // Recrear plugin reseteando cache (replica un nuevo arranque SW)
    setLog([])
    setPanel(null)
    // El useMemo no reinicia sin remount — emulamos limpiando cache via API
    plugin.cachedDialogNames.forEach(n => plugin['_dialogCache']?.delete?.(n))
    // Si no expuesto, simplemente vacía mapa interno con cast.
    const cache = (plugin as unknown as { _dialogCache: Map<string, unknown> })._dialogCache
    cache.clear()
  }

  const msgs = plugin.messages

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        cuadro_de_notas_plugin
        <Chip label="Fase 1 · SIMPLE · score 3" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="plugin" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/cuadro_de_notas_plugin.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* ── init_actions ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="init_actions()"
              subheader="sw_action.new(:activate_dialog_cuadro_notas, ...)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {plugin.actions.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Sin acciones registradas.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {plugin.actions.map(a => (
                    <ListItem key={a.id} disableGutters>
                      <ListItemText
                        primary={
                          <Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                            :{a.id}
                          </Box>
                        }
                        secondary={
                          <Stack spacing={0.25} sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>
                            <span>caption          = "{a.caption}"</span>
                            <span>short_help_text  = "{a.shortHelpText}"</span>
                            <span>image            = {`{:${a.image[0]}, :${a.image[1]}}`}</span>
                            <span>action_message   = :|{a.actionMessage}|</span>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── build_gui ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="build_gui(a_frame, _optional xml_element)"
              subheader="cuadro_de_notas_framework.new(message(:framework_title), a_frame)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Button variant="outlined" size="small" onClick={onBuildGui}>
                build_gui()
              </Button>
              {panel && (
                <Box sx={{ mt: 2, fontSize: 12, fontFamily: 'monospace' }}>
                  <Box>panel    = <code>{panel.panel}</code></Box>
                  <Box>tab_label = <code>"{panel.tabLabel}"</code></Box>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">
                messages
              </Typography>
              <Box sx={{ fontSize: 12, fontFamily: 'monospace', mt: 0.5 }}>
                <div>:caption          = "{msgs.caption}"</div>
                <div>:short_help_text  = "{msgs.shortHelpText}"</div>
                <div>:framework_title  = "{msgs.frameworkTitle}"</div>
                <div>:tab_title        = "{msgs.tabTitle}"</div>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ── activate_dialog ── */}
        <Grid size={12}>
          <Card variant="outlined">
            <CardHeader
              title="activate_dialog(_gather args)"
              subheader="get_dialog → si _unset crea + cache; setea maximizable=_false, minimizable=_true, resizable=_true; activate()"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button variant="contained" size="small" onClick={onActivate}>
                  activate_dialog()
                </Button>
                <Button variant="outlined" size="small" color="warning" onClick={onReset}>
                  reset cache
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Chip
                  label={`cache: ${plugin.cachedDialogNames.length === 0 ? '∅' : plugin.cachedDialogNames.join(', ')}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              {log.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Pulsa <code>activate_dialog()</code> para simular la 1ª llamada.
                </Typography>
              ) : (
                <Box component="table" sx={{ width: '100%', fontSize: 12, fontFamily: 'monospace', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['#', 'cache hit', 'maximizable?', 'minimizable?', 'resizable?', 'mensaje activate'].map(h => (
                        <Box component="th" key={h} sx={{ textAlign: 'left', py: 0.5, borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                          {h}
                        </Box>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {log.map(row => (
                      <tr key={row.step}>
                        <Box component="td" sx={{ py: 0.5 }}>{row.step}</Box>
                        <Box component="td" sx={{ py: 0.5, color: row.reusedCache ? 'success.main' : 'warning.main' }}>
                          {row.reusedCache ? 'reutiliza' : 'crea nuevo'}
                        </Box>
                        <Box component="td" sx={{ py: 0.5 }}>{String(row.maximizable)}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{String(row.minimizable)}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>{String(row.resizable)}</Box>
                        <Box component="td" sx={{ py: 0.5 }}>"{row.message}"</Box>
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
