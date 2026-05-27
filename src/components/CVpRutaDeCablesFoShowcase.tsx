import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Stack, Typography,
} from '@mui/material'
import {
  CVpRutaDeCablesFo,
  COLECCIONES_BASE, LO_GEOM, LO_GEOM_TXT, MES_ANNO,
  LONGITUD_DEFAULT, RANGO_EMPALME, RANGO_GASA,
} from '../models/CVpRutaDeCablesFo'

// ─── Render pipeline steps ────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { step: '1', color: '#1565c0', label: '!current_coordinate_system! << _unset' },
  { step: '2', color: '#1565c0', label: 'if fijar_configuracion="Si" → return cached oResulSet' },
  { step: '3', color: '#2e7d32', label: 'if oResulSet _is _unset → oBuffer.buffer(tamanio_buffer)' },
  { step: '4', color: '#2e7d32', label: 'super.geometry_set_for_render → LcollGeometrias' },
  { step: '5', color: '#e65100', label: 'NuevoBuffer = oBuffer.intersection(rotated_world_bounds)' },
  { step: '6', color: '#e65100', label: 'LcollResulSet = LcollGeometrias.select(:interacting_with, NuevoBuffer)' },
  { step: '7', color: '#6a1b9a', label: 'oResulSet = geometry_set_for_bufferGeo(LcollResulSet, NuevoBuffer)' },
  { step: '8', color: '#6a1b9a', label: 'if new document → guardar_visualizacion per element' },
  { step: '9', color: '#455a64', label: 'fijar_configuracion = "Si" (cache for next render)' },
]

const FILTRA_STEPS = [
  { pct: '0%',   color: '#1565c0', label: 'select :collection, COLECCIONES_BASE (manzana, ferrocarril, building…)' },
  { pct: '→',    color: '#1565c0', label: 'add structure_annotation geoms from cable.structure_annotations (user!_linea, user!_anotacion)' },
  { pct: '40%',  color: '#2e7d32', label: 'agregar_canalizacion() → route geom + leader + LoGeomTxt annotations' },
  { pct: '60%',  color: '#2e7d32', label: 'agregar_estructuras() → structure_geometry or chain+text (crucero/anchor)' },
  { pct: '80%',  color: '#e65100', label: 'agregar_elementos() → LoGeom + LoGeomTxt per element' },
  { pct: '80%',  color: '#e65100', label: 'agregar_perfiles(canalizaciones.rwo_set()) → MIT underground profiles' },
  { pct: '100%', color: '#6a1b9a', label: 'composite_geometry_set(perfiles, canal, base, estructuras, elementos, struct_annotations)' },
]

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CVpRutaDeCablesFoShowcase() {
  const inst = new CVpRutaDeCablesFo()
  inst.initialiseForPage(undefined)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_vp_ruta_de_cables_fo
        <Chip label="Fase 5 · MUY COMPLEJO" size="small" sx={{ ml: 1.5 }} color="error" />
        <Chip label="extends viewport_layout" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="GIS render · progress bar" size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/factory/c_vp_ruta_de_cables_fo.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Viewport principal del plano de ruta FTTH. 8 slots, 26 métodos. Pipeline completo:{' '}
        buffer → intersección → composite_geometry_set con 5 sub-colecciones.
        Cachéa el resultado en <code>oResulSet</code> una vez que <code>fijar_configuracion="Si"</code>.
        LoGeom y LoGeomTxt mapean colección → <em>array</em> de campos geométricos (vs. campo único en localizacion).
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: slots + config + attributes */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Slots públicos (8)"
                subheader="Todos writable/public — inicialmente _unset"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                  {[
                    { name: 'oBuffer',       desc: 'route buffer (pseudo_area)' },
                    { name: 'oEstructuras',  desc: 'network structures' },
                    { name: 'oCanalizacion', desc: 'conduit / route elements' },
                    { name: 'oElementos',    desc: 'network elements' },
                    { name: 'oWindows',      desc: 'canvas windows' },
                    { name: 'oMarco',        desc: 'layout frame' },
                    { name: 'barra',         desc: 'progress bar dialog' },
                    { name: 'oResulSet',     desc: 'cached geometry result' },
                  ].map(({ name, desc }) => (
                    <Box key={name} sx={{
                      border: '1px solid', borderColor: 'divider', borderRadius: 1,
                      px: 1, py: 0.4, fontFamily: 'monospace', fontSize: 10,
                    }}>
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{name}</Box>
                      <Box component="span" sx={{ color: 'text.secondary', ml: 0.75 }}>{desc}</Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="initialise_for_page — configuración fija"
                subheader="+ guardar_elementos_bd_gis (Fase 5)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      { prop: 'ace_name',              val: '"002 - P Ruta FTTH"',  color: '#1565c0' },
                      { prop: 'style_system_category', val: ':|P Ruta FTTH|',       color: '#2e7d32' },
                      { prop: 'display_style',         val: '"2 250 - 3 000"',      color: '#e65100' },
                    ].map(({ prop, val, color }) => (
                      <Box component="tr" key={prop} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '5px 8px', color: 'text.secondary', fontSize: 11 }}>{prop}</Box>
                        <Box component="td" sx={{ p: '5px 8px', color, fontWeight: 'bold' }}>{val}</Box>
                      </Box>
                    ))}
                    <Box component="tr">
                      <Box component="td" colSpan={2} sx={{ p: '5px 8px', color: 'text.disabled', fontSize: 10, fontStyle: 'italic' }}>
                        → guardar_elementos_bd_gis(&#123;oEstructuras, oCanalizacion, oElementos&#125;)
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Layout attributes (defined_attributes)"
                subheader="Registrados con define_attributes()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Atributo', 'Tipo', 'Default', 'UI'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { name: 'tamanio_buffer',     type: ':integer', def: `${LONGITUD_DEFAULT}`, ui: 'no' },
                      { name: 'fijar_configuracion', type: ':string',  def: '"No"',               ui: 'Si/No enum' },
                      { name: 'redibujar',           type: ':string',  def: '"Si"',               ui: 'Si/No enum' },
                    ].map(({ name, type, def, ui }) => (
                      <Box component="tr" key={name} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{type}</Box>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold' }}>{def}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: ui === 'no' ? 'text.disabled' : 'success.main', fontSize: 10 }}>{ui}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ mt: 1.5, p: 1, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary' }}>
                    val_falso_verdadero() → {JSON.stringify(inst.valFalsoVerdadero())}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Constantes adicionales"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      { name: 'ALTO',             val: `${CVpRutaDeCablesFo.ALTO}`,       note: 'shared_constant' },
                      { name: 'LARGO',            val: `${CVpRutaDeCablesFo.LARGO}`,      note: 'shared_constant' },
                      { name: 'LONGITUD_DEFAULT', val: `${LONGITUD_DEFAULT}`,             note: 'buffer threshold' },
                      { name: 'RANGO_EMPALME',    val: `+${RANGO_EMPALME}`,              note: 'splice_closure Y step' },
                      { name: 'RANGO_GASA',       val: `${RANGO_GASA}`,                  note: 'figure_eight Y step' },
                      { name: 'dataVpCopy',       val: 'shared_variable (_unset)',        note: 'copy flow state' },
                    ].map(({ name, val, note }) => (
                      <Box component="tr" key={name} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold' }}>{val}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled', fontSize: 10 }}>{note}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: pipeline + filtra_objetos + escribe_titulo */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="geometry_set_for_render — pipeline completo"
                subheader="9 pasos con cache y guarda de visualización"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {PIPELINE_STEPS.map(({ step, color, label }) => (
                    <Box key={step} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: '50%', bgcolor: color,
                        color: '#fff', flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 'bold', mt: '1px',
                      }}>{step}</Box>
                      <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="filtra_objetos — pipeline con progress bar"
                subheader="Construye composite_geometry_set con 6 fuentes"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  {FILTRA_STEPS.map(({ pct, color, label }, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{
                        minWidth: 36, fontFamily: 'monospace', fontSize: 9,
                        color, fontWeight: 'bold', mt: '2px', textAlign: 'right', flexShrink: 0,
                      }}>{pct}</Box>
                      <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary', width: '100%', mb: 0.5 }}>
                    COLECCIONES_BASE (.select(:collection, …)):
                  </Typography>
                  {COLECCIONES_BASE.map(c => (
                    <Chip key={c} label={c} size="small" variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: 10 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="escribe_titulo_de_viewport — especificación"
                subheader="Igual a draw_content_on de c_vp_detalle_interno_central (mismo patrón)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="tbody">
                    {[
                      ['Guard',          'skip if name = "mapa"'],
                      ['Fuente',         'Arial · 210pt · bold + underline'],
                      ['Color',          'black'],
                      ['Justificación',  'bottom_centre'],
                      ['Texto',          'this.name.uppercase.split_by(newline)'],
                      ['Inicio Y',       'this.bounds.ymin'],
                      ['Desplazamiento', 'LoCoordY −= 120 por cada línea'],
                      ['Inicio X',       'this.bounds.centre.x'],
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

          </Stack>
        </Grid>

      </Grid>

      {/* Full-width row: LoGeom + LoGeomTxt + MES_ANNO */}
      <Grid container spacing={3} sx={{ mt: 0 }}>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="LoGeom — geometrías por colección"
              subheader="define_shared_constant — valores como array (vs. string único en localizacion_tba)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                    {['Colección', 'Campos geométricos'].map(h => (
                      <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {Array.from(LO_GEOM.entries()).map(([col, fields]) => (
                    <Box component="tr" key={col} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', verticalAlign: 'top' }}>{col}</Box>
                      <Box component="td" sx={{ p: '3px 6px' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                          {fields.map(f => (
                            <Chip key={f} label={f} size="small" color="success" variant="outlined"
                              sx={{ fontFamily: 'monospace', fontSize: 10, height: 20 }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardHeader
                title="LoGeomTxt — anotaciones por colección"
                subheader="define_shared_constant — array de campos de anotación"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Colección', 'Campos de anotación'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {Array.from(LO_GEOM_TXT.entries()).map(([col, fields]) => (
                      <Box component="tr" key={col} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', verticalAlign: 'top' }}>{col}</Box>
                        <Box component="td" sx={{ p: '3px 6px' }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                            {fields.map(f => (
                              <Chip key={f} label={f} size="small" color="warning" variant="outlined"
                                sx={{ fontFamily: 'monospace', fontSize: 10, height: 20 }} />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="MES_ANNO — nombres de meses"
                subheader="define_shared_constant (public) — rope de {número, nombre}"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {Array.from(MES_ANNO.entries()).map(([n, name]) => (
                    <Box key={n} sx={{
                      border: '1px solid', borderColor: 'divider', borderRadius: 1,
                      px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10,
                    }}>
                      <Box component="span" sx={{ color: 'text.secondary' }}>{n}·</Box>
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold', ml: 0.5 }}>{name}</Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
