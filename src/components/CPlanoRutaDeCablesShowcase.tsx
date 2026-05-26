import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Stack, Typography,
} from '@mui/material'
import { CPlanoRutaDeCables } from '../models/CPlanoRutaDeCables'

export function CPlanoRutaDeCablesShowcase() {
  const plano = useMemo(() => new CPlanoRutaDeCables(), [])
  const [resultado, setResultado] = useState<string>('')

  const attrs = plano.definedAttributes()

  const onGenerar = () => {
    const r = plano.generaPlano()
    setResultado(r.ok ? 'OK' : `⚠ ${r.reason}`)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_plano_ruta_de_cables
        <Chip label="Fase 1 · SIMPLE · score 8" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip
          label={`allowed_on_menu? = ${CPlanoRutaDeCables.allowedOnMenu}`}
          size="small"
          variant="outlined"
          sx={{ ml: 1, fontFamily: 'monospace' }}
        />
        <Chip
          label={`tipo_plano = :${CPlanoRutaDeCables.tipoPlano}`}
          size="small"
          variant="outlined"
          sx={{ ml: 1, fontFamily: 'monospace' }}
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_plano_ruta_de_cables.magik</code> — package <code>user</code>
      </Typography>

      <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
        El método <code>genera_plano</code> del original tiene <strong>todas las líneas comentadas</strong> (estaba en desarrollo
        cuando se escribió). La transcripción respeta CLAUDE.md (ignorar código comentado) y deja el cuerpo
        como placeholder que devuelve <code>"Esta opción se encuentra en desarrollo"</code>.
      </Alert>

      <Grid container spacing={3}>
        {/* defined_attributes */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="defined_attributes"
              subheader="_super.defined_attributes + viewport_attribute_definition"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  '& th, & td': { p: 0.75, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'left' },
                }}
              >
                <thead>
                  <tr>
                    <Box component="th" sx={{ color: 'text.secondary' }}>name</Box>
                    <Box component="th" sx={{ color: 'text.secondary' }}>type</Box>
                    <Box component="th" sx={{ color: 'text.secondary' }}>source</Box>
                  </tr>
                </thead>
                <tbody>
                  {attrs.map((a, i) => (
                    <tr key={i}>
                      <Box component="td">{a.name}</Box>
                      <Box component="td" sx={{ color: 'primary.main' }}>{a.type}</Box>
                      <Box component="td">
                        <Chip
                          label={a.source}
                          size="small"
                          color={a.source === 'viewport' ? 'secondary' : 'default'}
                          variant={a.source === 'viewport' ? 'filled' : 'outlined'}
                          sx={{ fontFamily: 'monospace', fontSize: 11 }}
                        />
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* genera_plano */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="genera_plano()"
              subheader="Placeholder — código original comentado"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="caption" color="text.secondary">
                  Intención del autor (según código comentado del .magik):
                </Typography>
                <Box component="ol" sx={{ m: 0, pl: 2.5, fontSize: 12 }}>
                  <li>app.plugin(:layout_plugin).start_layout_designer()</li>
                  <li>LayoutManager.current_document.current_page</li>
                  <li>doc.name = "Plano ruta de cables", user!_tipo_plano = :ruta_cables</li>
                  <li>Añade c_marco (6×3), c_pep, c_sello_estandar_ctl_edo</li>
                </Box>

                <Divider />

                <Button variant="contained" size="small" onClick={onGenerar}>
                  generaPlano()
                </Button>
                {resultado && (
                  <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                    {resultado}
                  </Box>
                )}

                <Divider />

                <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                  .app.name    = "{plano.app.name}"<br />
                  .app.plugins = {`{}`}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
