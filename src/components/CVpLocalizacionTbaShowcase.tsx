import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Stack, Typography,
} from '@mui/material'
import { CVpLocalizacionTba, COLECCIONES_GEO, LO_GEOM, LO_GEOM_TXT } from '../models/CVpLocalizacionTba'

// ─── agregar_titulo bounds diagram ────────────────────────────────────────────

function TituloPlacementDiagram() {
  const VP_H = 70, VP_W = 180
  const STRIP = 20  // scaled: 100 units
  return (
    <Box sx={{ position: 'relative', height: VP_H + STRIP + 24, width: VP_W + 60, ml: 2, mt: 1 }}>
      <Box sx={{
        position: 'absolute', top: 0, left: 0,
        width: VP_W, height: VP_H,
        border: '2px solid #1565c0', bgcolor: '#e3f2fd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: '#1565c0' }}>viewport bounds</Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: VP_H - 9, left: VP_W + 6 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin</Typography>
      </Box>
      <Box sx={{
        position: 'absolute', top: VP_H, left: 0,
        width: VP_W, height: STRIP,
        border: '1.5px dashed #e65100', bgcolor: '#fff3e0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: '#e65100' }}>
          "{CVpLocalizacionTba.TITULO.slice(0, 26)}…" · bold · tamanio (inherited)
        </Typography>
      </Box>
      <Box sx={{ position: 'absolute', top: VP_H + STRIP + 1, left: VP_W + 6 }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>ymin−100</Typography>
      </Box>
    </Box>
  )
}

// ─── agregar_estructuras flow ─────────────────────────────────────────────────

const ESTRUCTURAS_STEPS = [
  { step: '1', label: 'if oEstructura _is _unset → init from elementos_bd_gis.an_element()', color: '#e65100' },
  { step: '2', label: 'estructura.structure_geometry() → add to geometry_set',               color: '#1565c0' },
  { step: '3', label: 'if geo.responds_to?(:coord) → add circle(coord, r=6000)',             color: '#2e7d32' },
  { step: '4', label: 'LoGeomTxt[collection.name] → add annotation geometry',                color: '#6a1b9a' },
  { step: '5', label: 'LoGeom[collection.name] → add extra geometry',                        color: '#6a1b9a' },
  { step: '→', label: 'return geometry_set (with style from super result)',                   color: '#455a64' },
]

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CVpLocalizacionTbaShowcase() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_vp_localizacion_tba
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends viewport_layout" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="GIS render" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/montaje_tba/factory/c_vp_localizacion_tba.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Viewport de croquis de localización de TBA (Terminal de Banda Ancha). Similar a{' '}
        <code>c_vp_localizacion_central</code> pero con slot <code>oEstructura</code>,
        método <code>agregar_estructuras()</code> que añade circle(r=6000), y geometría
        compuesta (composite_geometry_set) de colecciones filtradas + estructuras.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: config + title diagram + estructura flow */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="initialise_for_page — configuración fija"
                subheader="Sin pattern matching — cuatro valores hardcoded"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      { prop: 'ace_name',               val: '"CENT_PLANOS"',       color: '#1565c0' },
                      { prop: 'style_system_category',  val: ':plano',              color: '#2e7d32' },
                      { prop: 'view_scale',              val: '2500',               color: '#c62828' },
                      { prop: 'display_style',           val: '"5 000 - 10 000"',   color: '#e65100' },
                      { prop: '→ agregar_titulo(page)',  val: '(ver diagrama)',      color: '#6a1b9a' },
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
                      ['text',        `"${CVpLocalizacionTba.TITULO}"`],
                      ['font_size',   'tamanio (inherited from viewport_layout)'],
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

            <Card variant="outlined">
              <CardHeader
                title="agregar_estructuras — flujo GIS"
                subheader="Construye geometry_set con estructura + círculo + anotaciones"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {ESTRUCTURAS_STEPS.map(({ step, label, color }) => (
                    <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: '50%',
                        bgcolor: color, color: '#fff', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 'bold', mt: '2px',
                      }}>{step}</Box>
                      <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 1.5, p: 1, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #a5d6a7' }}>
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: '#2e7d32' }}>
                    Diferencia clave: añade <strong>circle.new(geo.coord, 6000)</strong> para marcar visualmente
                    la ubicación exacta del TBA en el mapa de localización.
                  </Typography>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: LoGeom + LoGeomTxt + geometry filter */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="LoGeom — geometrías por colección"
                subheader="define_shared_constant (property_list) — geometry field name per collection"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Colección (key)', 'Geometría (value)'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {Array.from(LO_GEOM.entries()).map(([col, geom]) => (
                      <Box component="tr" key={col} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{col}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: '#2e7d32', fontWeight: 'bold' }}>{geom}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="LoGeomTxt — anotaciones por colección"
                subheader="define_shared_constant (property_list) — annotation geometry field per collection"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Colección (key)', 'Anotación (value)'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {Array.from(LO_GEOM_TXT.entries()).map(([col, ann]) => (
                      <Box component="tr" key={col} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{col}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: '#6a1b9a', fontWeight: 'bold' }}>{ann}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="geometry_set_for_render — colecciones + composite"
                subheader="super filtrado + estructuras → composite_geometry_set"
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
                <Box sx={{ mt: 1.5, p: 1, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffe0b2' }}>
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: '#e65100', lineHeight: 1.8 }}>
                    1. !current_coordinate_system! &lt;&lt; _unset<br />
                    2. LcollGeometrias &lt;&lt; super.geometry_set_for_render<br />
                    3. loestructuras &lt;&lt; agregar_estructuras() — con style de LcollGeometrias<br />
                    4. LoResultSet &lt;&lt; LcollGeometrias.select(:collection, [...])<br />
                    5. → composite_geometry_set.new_with(LoResultSet, loestructuras)
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Diferencias vs c_vp_localizacion_central"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Aspecto', 'c_vp_localizacion_central', 'c_vp_localizacion_tba'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold', fontSize: 10 }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { aspect: 'oEstructura slot',      other: 'sin slot',              self: 'oEstructura (writable, public)' },
                      { aspect: 'view_scale',             other: '(no fijado)',           self: '2500' },
                      { aspect: 'display_style',          other: '"3 000 - 5 000"',       self: '"5 000 - 10 000"' },
                      { aspect: 'LoGeom / LoGeomTxt',     other: 'sin constantes geom',   self: '2 property_lists de mapeo' },
                      { aspect: 'agregar_estructuras',    other: 'no existe',             self: 'geom + circle(r=6000)' },
                      { aspect: 'geometry_set_for_render',other: 'filtered set',          self: 'composite_geometry_set' },
                      { aspect: 'tamanio',                other: 'define_shared_constant = 8', self: 'inherited (no local)' },
                    ].map(({ aspect, other, self }) => (
                      <Box component="tr" key={aspect} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold', color: 'text.secondary', fontSize: 10 }}>{aspect}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled', fontSize: 10 }}>{other}</Box>
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
