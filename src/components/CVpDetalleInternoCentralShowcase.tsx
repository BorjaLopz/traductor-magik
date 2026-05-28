import { useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Stack, TextField, Typography,
} from '@mui/material'
import { CVpDetalleInternoCentral, type AceName } from '../models/CVpDetalleInternoCentral'

// ─── initialiseForPage demo ───────────────────────────────────────────────────

const ACE_COLOR: Record<AceName, string> = {
  isometrico:          '#e3f2fd',
  vista_frontal:       '#e8f5e9',
  vista_de_planta:     '#fff3e0',
  splice_closure_view: '#fce4ec',
  mit_floor_internal:  '#f3e5f5',
}
const ACE_BORDER: Record<AceName, string> = {
  isometrico:          '#1565c0',
  vista_frontal:       '#2e7d32',
  vista_de_planta:     '#e65100',
  splice_closure_view: '#c62828',
  mit_floor_internal:  '#6a1b9a',
}

function resolveAce(name: string): { ace: AceName; scale?: number } {
  const vp = new CVpDetalleInternoCentral()
  vp.name = name
  vp.initialiseForPage(undefined)
  return { ace: vp.aceName, scale: vp.viewScale !== 1 ? vp.viewScale : undefined }
}

function AceChip({ ace }: { ace: AceName }) {
  return (
    <Box sx={{
      display: 'inline-block',
      px: 1, py: 0.3,
      bgcolor: ACE_COLOR[ace],
      border: `1.5px solid ${ACE_BORDER[ace]}`,
      borderRadius: 1,
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: 'bold',
    }}>
      :{ace}
    </Box>
  )
}

// ─── agregarTitulo bounds diagram ─────────────────────────────────────────────

function TituloPlacementDiagram() {
  const VP_H = 60, VP_W = 160
  const GAP1 = 12   // scaled: 100 units
  const GAP2 = 24   // scaled: additional 200 units (total 300)
  return (
    <Box sx={{ position: 'relative', height: VP_H + GAP1 + GAP2 + 20, width: VP_W + 40, ml: 2, mt: 1 }}>
      {/* viewport */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0,
        width: VP_W, height: VP_H,
        border: '2px solid #1565c0', bgcolor: '#e3f2fd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: '#1565c0' }}>viewport bounds</Typography>
      </Box>
      {/* ymin label */}
      <Box sx={{ position: 'absolute', top: VP_H - 8, left: VP_W + 4 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin</Typography>
      </Box>
      {/* gap arrow ymin - 100 */}
      <Box sx={{ position: 'absolute', top: VP_H, left: VP_W / 2 - 1, width: 2, height: GAP1, bgcolor: '#aaa' }} />
      <Box sx={{ position: 'absolute', top: VP_H + 1, left: VP_W + 4 }}>
        <Typography sx={{ fontSize: 8, fontFamily: 'monospace', color: '#888' }}>−100</Typography>
      </Box>
      {/* title box */}
      <Box sx={{
        position: 'absolute', top: VP_H + GAP1, left: 0,
        width: VP_W, height: GAP2,
        border: '1.5px dashed #e65100', bgcolor: '#fff3e0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: '#e65100' }}>
          c_titulo_de_plano (titulo, bold, {CVpDetalleInternoCentral.TAMANIO}pt)
        </Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: VP_H + GAP1 + GAP2 + 1, left: VP_W + 4 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin−300</Typography>
      </Box>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CVpDetalleInternoCentralShowcase() {
  const [vpName, setVpName] = useState('Central Peralvillo CWDM')
  const { ace, scale } = resolveAce(vpName)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_vp_detalle_interno_central
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends viewport_layout" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="GIS render" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/factory/c_vp_detalle_interno_central.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Viewport de layout para vistas internas de central (isométrica, frontal, planta, CWDM).
        Extiende <code>viewport_layout</code> (GIS). La lógica pura está en{' '}
        <code>initialise_for_page()</code> — asigna <code>ace_name</code> por patrón del nombre.
        El resto es Fase 5: GIS map navigation, canvas drawing y geometry sets.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: interactive initialiseForPage + agregarTitulo diagram */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="initialise_for_page — mapeo nombre → ace_name"
                subheader="Única lógica pura de la clase (pattern matching sobre this.name)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TextField
                  fullWidth size="small" label="viewport name (this.name)"
                  value={vpName} onChange={e => setVpName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 11, fontFamily: 'monospace' }}>ace_name →</Typography>
                  <AceChip ace={ace} />
                  {scale !== undefined && (
                    <Chip label={`view_scale = ${scale}`} size="small" color="warning" sx={{ fontFamily: 'monospace', fontSize: 10 }} />
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Reglas (en orden):
                  </Typography>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace', mt: 0.5 }}>
                    <Box component="tbody">
                      {[
                        { pattern: 'includes("isometrico")',     ace: 'isometrico' as AceName,          extra: '' },
                        { pattern: 'includes("vista frontal")',   ace: 'vista_frontal' as AceName,       extra: '' },
                        { pattern: 'includes("vista de planta")', ace: 'vista_de_planta' as AceName,     extra: '' },
                        { pattern: 'endsWith("cwdm")',            ace: 'splice_closure_view' as AceName, extra: '+ view_scale=12500' },
                        { pattern: 'else / sin nombre',           ace: 'mit_floor_internal' as AceName,  extra: '' },
                      ].map(({ pattern, ace: a, extra }) => (
                        <Box component="tr" key={a}
                          sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: a === ace ? ACE_COLOR[a] : 'transparent' }}>
                          <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{pattern}</Box>
                          <Box component="td" sx={{ p: '3px 8px' }}><AceChip ace={a} /></Box>
                          <Box component="td" sx={{ p: '3px 8px', color: 'warning.main', fontSize: 10 }}>{extra}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="agregar_titulo — posición del título"
                subheader="Crea c_titulo_de_plano con bounds debajo del viewport"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TituloPlacementDiagram />
                <Box component="table" sx={{ mt: 2, width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      ['bounds.ymax', 'this.bounds.ymin − 100'],
                      ['bounds.ymin', 'this.bounds.ymin − 300'],
                      ['bounds.xmin/xmax', 'igual que self.bounds'],
                      ['font_name', '"bold"'],
                      ['font_size', `TAMANIO = ${CVpDetalleInternoCentral.TAMANIO}`],
                      ['text', 'CVpDetalleInternoCentral.titulo (shared var)'],
                      ['wrap', 'false'],
                      ['align', 'centre / centre'],
                      ['orientation', 'left_right'],
                    ].map(([k, v]) => (
                      <Box component="tr" key={k} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', width: '40%' }}>{k}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{v}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: method reference + draw spec + CWDM filter */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="draw_content_on — especificación de texto"
                subheader="Renderiza this.name en mayúsculas, línea a línea, 120 unidades de desplazamiento"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      ['Fuente',        'Arial'],
                      ['Tamaño',        '210 pt (LoSize)'],
                      ['Estilo',        'bold + underline'],
                      ['Color',         'black'],
                      ['Justificación', 'bottom_centre'],
                      ['Texto',         'this.name.uppercase.split_by(newline)'],
                      ['Desplazamiento','LoCoordY -= 120 por cada línea'],
                      ['Inicio Y',      'this.bounds.ymin'],
                      ['Inicio X',      'this.bounds.centre.x'],
                      ['fontSize arg',  '10 (draw_vtext_transform param)'],
                    ].map(([k, v]) => (
                      <Box component="tr" key={k} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', width: '38%' }}>{k}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{v}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="obtenerEmpalmesConCWDMs — filtro GIS"
                subheader="Fase 5 — opera sobre el visible geometry set del mapa activo"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {[
                      { step: '1', label: 'map_view.get_visible_geometry_set().rwo_set()', color: '#1565c0' },
                      { step: '2', label: 'filter: rwo_type = :splice_closure_geoms', color: '#2e7d32' },
                      { step: '3', label: 'filter owner: rwo_type = :splice_closure', color: '#2e7d32' },
                      { step: '4', label: 'filter: user!_marc_cierre_emp = "FIST"',   color: '#e65100' },
                      { step: '5', label: 'filter: spec_id = "CIERRE FIST"',          color: '#e65100' },
                      { step: '→', label: 'equality_set de splice_closures CWDM',     color: '#6a1b9a' },
                    ].map(({ step, label, color }) => (
                      <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 20, height: 20, borderRadius: '50%',
                          bgcolor: color, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 'bold', flexShrink: 0,
                        }}>{step}</Box>
                        <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Constantes y variables compartidas"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Nombre', 'Tipo Magik', 'Valor', 'TypeScript'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { name: 'allowed_on_menu?', kind: 'shared_constant', val: 'false',  ts: 'static readonly ALLOWED_ON_MENU' },
                      { name: 'tamanio',           kind: 'shared_constant', val: '7',     ts: 'static readonly TAMANIO' },
                      { name: 'titulo',            kind: 'shared_variable', val: '""',    ts: 'static titulo: string' },
                      { name: 'window',            kind: 'shared_variable', val: '_unset',ts: 'static window: unknown' },
                    ].map(({ name, kind, val, ts }) => (
                      <Box component="tr" key={name} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: kind === 'shared_constant' ? 'success.main' : 'warning.main', fontSize: 10 }}>{kind}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{val}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>{ts}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
