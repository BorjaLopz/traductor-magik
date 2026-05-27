import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Stack, Typography,
} from '@mui/material'
import { CVpLocalizacionCentral, COLECCIONES_GEO } from '../models/CVpLocalizacionCentral'

// ─── agregarTitulo bounds diagram ─────────────────────────────────────────────

function TituloPlacementDiagram() {
  const VP_H = 70, VP_W = 180
  const STRIP = 20  // scaled: 100 units
  return (
    <Box sx={{ position: 'relative', height: VP_H + STRIP + 24, width: VP_W + 60, ml: 2, mt: 1 }}>
      {/* viewport */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0,
        width: VP_W, height: VP_H,
        border: '2px solid #1565c0', bgcolor: '#e3f2fd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: '#1565c0' }}>viewport bounds</Typography>
      </Box>
      {/* ymin label */}
      <Box sx={{ position: 'absolute', top: VP_H - 9, left: VP_W + 6 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin</Typography>
      </Box>
      {/* title strip — immediately below ymin (no gap) */}
      <Box sx={{
        position: 'absolute', top: VP_H, left: 0,
        width: VP_W, height: STRIP,
        border: '1.5px dashed #e65100', bgcolor: '#fff3e0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: '#e65100' }}>
          "{CVpLocalizacionCentral.TITULO.slice(0, 28)}…" · bold · {CVpLocalizacionCentral.TAMANIO}pt
        </Typography>
      </Box>
      {/* ymin - 100 label */}
      <Box sx={{ position: 'absolute', top: VP_H + STRIP + 1, left: VP_W + 6 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin−100</Typography>
      </Box>
      {/* annotations */}
      <Box sx={{ position: 'absolute', top: VP_H + 4, left: -2 }}>
        <Typography sx={{ fontSize: 8, fontFamily: 'monospace', color: '#e65100' }}>◄ 100 u</Typography>
      </Box>
    </Box>
  )
}

// ─── Diff vs c_vp_detalle_interno_central ────────────────────────────────────

const DIFFS = [
  {
    aspect: 'titulo / tamanio',
    sibling: 'define_shared_variable (mutable)',
    self: 'define_shared_constant (immutable)',
  },
  {
    aspect: 'initialise_for_page',
    sibling: 'Pattern matching nombre → ace_name (5 ramas)',
    self: 'Valores fijos: "CENT_PLANOS" / "plano" / "3 000 - 5 000"',
  },
  {
    aspect: 'draw_content_on',
    sibling: 'super + texto multilinea Arial 210pt bold subrayado',
    self: 'Solo super.draw_content_on (sin render extra)',
  },
  {
    aspect: 'geometry_set_for_render',
    sibling: 'super sin filtro adicional',
    self: 'super + .select(user!_manzana, building, user!_eje_calle)',
  },
  {
    aspect: 'agregarTitulo bounds',
    sibling: 'ymin−300..ymin−100 (200 unidades)',
    self: 'ymin−100..ymin (100 unidades — inmediatamente debajo)',
  },
]

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CVpLocalizacionCentralShowcase() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_vp_localizacion_central
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends viewport_layout" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="GIS render" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/factory/c_localizacion_central.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Viewport de croquis de localización de central. Hermano de{' '}
        <code>c_vp_detalle_interno_central</code> — misma jerarquía <code>viewport_layout</code>,
        pero con configuración fija (sin pattern matching), título como constante inmutable y
        filtro de colecciones GIS específico para manzanas, edificios y ejes de calle.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: config + title diagram */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="initialise_for_page — configuración fija"
                subheader="Sin pattern matching — tres valores hardcoded"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      { prop: 'ace_name',              val: '"CENT_PLANOS"',       color: '#1565c0' },
                      { prop: 'style_system_category', val: ':plano',              color: '#2e7d32' },
                      { prop: 'display_style',         val: '"3 000 - 5 000"',    color: '#e65100' },
                      { prop: '→ agregar_titulo(page)', val: '(ver diagrama)',     color: '#6a1b9a' },
                    ].map(({ prop, val, color }) => (
                      <Box component="tr" key={prop} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '5px 8px', color: 'text.secondary', fontSize: 11 }}>{prop}</Box>
                        <Box component="td" sx={{ p: '5px 8px', color, fontWeight: 'bold' }}>{val}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="agregar_titulo — franja de 100 unidades"
                subheader="Inmediatamente debajo del viewport (ymin−100..ymin)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TituloPlacementDiagram />
                <Box component="table" sx={{ mt: 2, width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      ['bounds.ymax', 'this.bounds.ymin'],
                      ['bounds.ymin', 'this.bounds.ymin − 100'],
                      ['text',        `"${CVpLocalizacionCentral.TITULO}"`],
                      ['font_size',   `TAMANIO = ${CVpLocalizacionCentral.TAMANIO}`],
                      ['font_name',   '"bold"'],
                      ['wrap',        'false · centre/centre · left_right'],
                    ].map(([k, v]) => (
                      <Box component="tr" key={k} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', width: '35%' }}>{k}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{v}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: geometry filter + constants + diff */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="geometry_set_for_render — filtro de colecciones"
                subheader="super.geometry_set_for_render + .select(:collection, …)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {COLECCIONES_GEO.map(c => (
                    <Chip key={c} label={c} size="small" color="primary" variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary', mt: 1.5, lineHeight: 1.8 }}>
                  Filtra la geometría visible a tres colecciones GIS:<br />
                  • <strong>user!_manzana</strong> — manzanas urbanas<br />
                  • <strong>building</strong> — edificios (la central y vecinos)<br />
                  • <strong>user!_eje_calle</strong> — ejes de calles para el croquis
                </Typography>
                <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary', mt: 1 }}>
                  Antes de llamar a super limpia <code>!current_coordinate_system!</code> (dynamic var GIS).
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Constantes de clase"
                subheader="Todas define_shared_constant — inmutables (vs. shared_variable en c_vp_detalle_interno_central)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Magik', 'Valor', 'TypeScript'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { name: 'titulo',          val: '"Croquis de Localización…"', ts: 'static readonly TITULO' },
                      { name: 'tamanio',         val: '8',                          ts: 'static readonly TAMANIO' },
                      { name: 'allowed_on_menu?',val: 'false',                      ts: 'static readonly ALLOWED_ON_MENU' },
                    ].map(({ name, val, ts }) => (
                      <Box component="tr" key={name} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{val}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>{ts}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Diferencias vs c_vp_detalle_interno_central"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Aspecto', 'c_vp_detalle_interno_central', 'c_vp_localizacion_central'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold', fontSize: 10 }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {DIFFS.map(({ aspect, sibling, self }) => (
                      <Box component="tr" key={aspect} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold', color: 'text.secondary', fontSize: 10 }}>{aspect}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled', fontSize: 10 }}>{sibling}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'success.main', fontSize: 10 }}>{self}</Box>
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
