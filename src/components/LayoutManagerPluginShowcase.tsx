import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography,
} from '@mui/material'
import {
  LayoutManagerPlugin,
  type ActiveDesign,
  type AdminSolicitudPlugin,
  type DesignAdminEngine,
  type LayoutDocument,
  type LayoutElement,
  type LayoutManagerServices,
} from '../models/LayoutManagerPlugin'

// =============================================================================
// MOCK STATE
// =============================================================================

interface MockState {
  haveDoc:           boolean
  haveFilename:      boolean
  tipoPlano:         boolean
  publicarAweb:      boolean
  adminPresente:     boolean
  adminDialogOpen:   boolean
  faltantesExtdb:    boolean
  diseñoActivo:      boolean
  estado:            ActiveDesign['status']
  tipoDiseno:        ActiveDesign['tipoDiseno']
}

const INITIAL: MockState = {
  haveDoc:          true,
  haveFilename:     false,
  tipoPlano:        true,
  publicarAweb:     true,
  adminPresente:    false,
  adminDialogOpen:  false,
  faltantesExtdb:   false,
  diseñoActivo:     true,
  estado:           'Conciliado',
  tipoDiseno:       'principal',
}

function buildServices(s: MockState, log: (m: string) => void): LayoutManagerServices {
  const elemento: LayoutElement = {
    className: 'c_geom_set_layout',
    attributes: {
      publicarAweb: s.publicarAweb ? { value: true } : undefined,
      ace_name:     { value: 'plano_demo' },
    },
    window:      'wnd',
    respondsTo:  (m) => m === 'ace_name' || m === 'actualiza_datos()',
    actualizaDatos: () => log('actualiza_datos() llamado en element'),
    diujaLineaEntrePozos: () => log('dibuja_linea_entre_pozos() invocado'),
    isKindOf:    (k) => k === 'c_geom_set_layout' || k === 'layout_element',
  }

  const doc: LayoutDocument | undefined = !s.haveDoc ? undefined : {
    filename:     s.haveFilename ? 'plano_demo.xml' : undefined,
    currentPage:  { elements: [elemento] },
    pages:        [{ elements: [elemento] }, { elements: [elemento] }],
    attributes:   s.tipoPlano ? { tipo_plano: 'ruta_cables' } : {},
    getAttribute: (n) => (s.tipoPlano && n === 'tipo_plano') ? 'ruta_cables' : undefined,
    guardarPlano: () => { log('user!_guardar_plano() ejecutado'); return true },
  }

  const admin: AdminSolicitudPlugin | undefined = s.adminPresente ? {
    dialogIsOpen: (name) => s.adminDialogOpen && name === 'admin_solicitud_gui',
    estructurasFaltantes: s.faltantesExtdb ? [{ className: 'extdb_adhoc_record', id: 'X-1' }] : [],
  } : undefined

  const design: DesignAdminEngine = {
    activeDesign: s.diseñoActivo ? { status: s.estado, tipoDiseno: s.tipoDiseno } : undefined,
  }

  return {
    currentDocument: () => doc,
    admin:           () => admin,
    design:          () => design,
    templateNames:   () => ['plano_construccion.xml', 'plano_ruta.xml', 'plano_principal.xml'],
    abrirCentralizarPlanos: () => 'Centralización iniciada · 12 planos en cola',
    exportaShapeDesdePlano: () => log('export shape (plano)'),
    exportaShapeDesdeVista: () => log('export shape (vista)'),
    publicaArchivoAWeb:     () => 'ok' as const,
    showAlert: (m) => log(`ALERT: ${m}`),
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LayoutManagerPluginShowcase() {
  const [state, setState] = useState<MockState>(INITIAL)
  const [log, setLog] = useState<string[]>([])

  const services = useMemo(
    () => buildServices(state, (m) => setLog(prev => [m, ...prev].slice(0, 20))),
    [state],
  )

  const plugin = useMemo(() => new LayoutManagerPlugin(services), [services])
  // Re-evaluar enabled cada vez
  plugin.checkActions()

  const flip = <K extends keyof MockState>(key: K) =>
    (v: MockState[K]) => setState(prev => ({ ...prev, [key]: v }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        layout_manager_plugin
        <Chip label="Fase 2 · COMPLEJO · score 48" size="small" sx={{ ml: 1.5 }} color="error" />
        <Chip label="plugin" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/layout_manager_plugin.magik</code> — package <code>sw</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Mock state */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Estado de runtime SW"
              subheader="Servicios inyectados al plugin"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={0.5} sx={{ fontSize: 12 }}>
                <BoolRow label="current_document presente"     value={state.haveDoc}        onChange={flip('haveDoc')} />
                <BoolRow label="documento.filename presente"   value={state.haveFilename}   onChange={flip('haveFilename')} />
                <BoolRow label="user!_tipo_plano definido"     value={state.tipoPlano}      onChange={flip('tipoPlano')} />
                <BoolRow label="elemento.publicarAweb = true"  value={state.publicarAweb}   onChange={flip('publicarAweb')} />
                <Divider sx={{ my: 1 }} />
                <BoolRow label="admin_solicitud plugin existe"  value={state.adminPresente}   onChange={flip('adminPresente')} />
                <BoolRow label="admin_solicitud_gui abierto"    value={state.adminDialogOpen} onChange={flip('adminDialogOpen')} />
                <BoolRow label="estructuras_faltantes extdb"    value={state.faltantesExtdb}  onChange={flip('faltantesExtdb')} />
                <Divider sx={{ my: 1 }} />
                <BoolRow label="diseno activo" value={state.diseñoActivo} onChange={flip('diseñoActivo')} />
                <TextField
                  select label="estado diseño" size="small"
                  value={state.estado}
                  onChange={e => setState(s => ({ ...s, estado: e.target.value as ActiveDesign['status'] }))}
                  disabled={!state.diseñoActivo}
                  fullWidth
                >
                  {['Conciliado', 'Construcción', 'Existente', 'Otro'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
                <TextField
                  select label="tipo_diseno" size="small"
                  value={state.tipoDiseno}
                  onChange={e => setState(s => ({ ...s, tipoDiseno: e.target.value as ActiveDesign['tipoDiseno'] }))}
                  disabled={!state.diseñoActivo}
                  fullWidth
                >
                  {['principal', 'secundaria'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions list */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Acciones registradas"
              subheader={`init_actions registró ${plugin.actions.length} acciones — check_actions recalcula enabled`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ maxHeight: 480, overflowY: 'auto' }}>
              <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse', '& td, & th': { p: 0.5, borderBottom: '1px solid', borderColor: 'divider' } }}>
                <thead>
                  <tr>
                    <Box component="th" sx={{ textAlign: 'left' }}>action</Box>
                    <Box component="th" sx={{ textAlign: 'left' }}>action_message</Box>
                    <Box component="th" sx={{ textAlign: 'center' }}>enabled?</Box>
                  </tr>
                </thead>
                <tbody>
                  {plugin.actions.map(a => (
                    <tr key={a.id}>
                      <Box component="td">:{a.id}</Box>
                      <Box component="td" sx={{ color: 'text.secondary' }}>{a.actionMessage ?? '—'}</Box>
                      <Box component="td" sx={{ textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={a.enabled ? '_true' : '_false'}
                          color={a.enabled ? 'success' : 'default'}
                          variant={a.enabled ? 'filled' : 'outlined'}
                          sx={{ fontSize: 10, height: 18 }}
                        />
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Predicados + ejecución */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardHeader
              title="Predicados / ejecutables"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Stack spacing={1}>
                <PredRow label="publicar_plano_a_web?"      value={plugin.publicarPlanoAWeb()} />
                <PredRow label="habilita_centralizar_plano?" value={plugin.habilitaCentralizarPlano()} />

                <Divider />

                <Button size="small" variant="contained" onClick={() => {
                  const r = plugin.saveLayout()
                  setLog(prev => [`save_layout → ${JSON.stringify(r)}`, ...prev].slice(0, 20))
                }}>save_layout()</Button>

                <Button size="small" variant="outlined" onClick={() => {
                  const r = plugin.actualizaSellos()
                  setLog(prev => [`actualiza_sellos → ${JSON.stringify(r)}`, ...prev].slice(0, 20))
                }}>actualiza_sellos()</Button>

                <Button size="small" variant="outlined" onClick={() => {
                  plugin.centralizarPlano()
                }}>centralizar_plano()</Button>

                <Button size="small" variant="outlined" onClick={() => {
                  const r = plugin.planoEtiqueta2Pozos()
                  setLog(prev => [`plano_etiqueta_2pozos → ${r}`, ...prev].slice(0, 20))
                }}>plano_etiqueta_2pozos()</Button>

                <Button size="small" variant="outlined" onClick={() => {
                  const r = plugin.publicaAWeb()
                  setLog(prev => [`publica_a_web → "${r}"`, ...prev].slice(0, 20))
                }}>publica_a_web()</Button>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="caption" color="text.secondary">log</Typography>
              <Box sx={{ mt: 0.5, p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 10, minHeight: 80, maxHeight: 160, overflowY: 'auto' }}>
                {log.length === 0 ? <em>—</em> : log.map((l, i) => <div key={i}>{l}</div>)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2, fontSize: 12 }}>
        Operaciones GIS reales (<code>plot_system</code>, <code>layout_plot_engine</code>, exportar shape, publicar archivo) se delegan al
        servicio inyectado <code>LayoutManagerServices</code> — el plugin sólo orquesta y enlaza acciones a métodos.
      </Alert>
    </Box>
  )
}

function BoolRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <FormControlLabel
      control={<Switch size="small" checked={value} onChange={e => onChange(e.target.checked)} />}
      label={<Box sx={{ fontSize: 11 }}>{label}</Box>}
      sx={{ m: 0 }}
    />
  )
}

function PredRow({ label, value }: { label: string; value: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ fontFamily: 'monospace', fontSize: 11, flex: 1 }}>{label}</Box>
      <Chip size="small" label={value ? '_true' : '_false'} color={value ? 'success' : 'default'} variant={value ? 'filled' : 'outlined'} />
    </Box>
  )
}
