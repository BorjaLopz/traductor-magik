import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, FormControlLabel, Grid,
  Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CPepDcs, type ProyectoConReferencias } from '../models/CPepDcs'

export function CPepDcsShowcase() {
  const [existe, setExiste] = useState<boolean>(true)
  const [refs, setRefs] = useState({
    desmontaje:    'RC-2025-001',
    canalizacion:  'CN-2025-014',
    secundarios:   'SC-2025-007',
  })

  const proyecto: ProyectoConReferencias = useMemo(() => ({
    existe,
    referenciaDesmontaje:    refs.desmontaje,
    referenciaCanalizacion:  refs.canalizacion,
    referenciaSecundarios:   refs.secundarios,
  }), [existe, refs])

  const pep = useMemo(() => new CPepDcs(proyecto), [proyecto])

  const titulos = pep.dfnDetalleTituloReferencias()
  const valores = pep.dfnDetalleValoresReferencias()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_pep_dcs
        <Chip label="Fase 1 · SIMPLE · score 2" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends c_pep" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip
          label={`allowed_on_menu? = ${String(CPepDcs.allowedOnMenu)}`}
          size="small"
          color="default"
          sx={{ ml: 1, fontFamily: 'monospace' }}
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_pep_dcs.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Proyecto */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="oProyecto"
              subheader=".existe? · .referencia_desmontaje · .referencia_canalizacion · .referencia_secundarios"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch checked={existe} onChange={e => setExiste(e.target.checked)} />}
                  label={`oProyecto.existe? = ${existe ? '_true' : '_false'}`}
                />

                <TextField
                  label=".referencia_desmontaje"
                  value={refs.desmontaje}
                  onChange={e => setRefs(r => ({ ...r, desmontaje: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={!existe}
                />
                <TextField
                  label=".referencia_canalizacion"
                  value={refs.canalizacion}
                  onChange={e => setRefs(r => ({ ...r, canalizacion: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={!existe}
                />
                <TextField
                  label=".referencia_secundarios"
                  value={refs.secundarios}
                  onChange={e => setRefs(r => ({ ...r, secundarios: e.target.value }))}
                  size="small"
                  fullWidth
                  disabled={!existe}
                />

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  nNumero_Renglones = {pep.nNumero_Renglones} (asignado por dfn_Detalle_Titulo_Referencias)
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla 3×2: títulos + valores */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sello Referencias DCS"
              subheader="Tabla generada (3 renglones × 2 columnas)"
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
                  fontSize: 13,
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    textAlign: 'left',
                  },
                }}
              >
                <thead>
                  <tr>
                    <Box component="th" sx={{ bgcolor: '#2E4057', color: '#fff', width: '50%' }}>
                      TÍTULO
                    </Box>
                    <Box component="th" sx={{ bgcolor: '#2E4057', color: '#fff' }}>
                      VALOR
                    </Box>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i}>
                      <Box component="td" sx={{ fontWeight: 700 }}>{titulos[i]}</Box>
                      <Box
                        component="td"
                        sx={{
                          color: valores[i] === '' ? 'text.disabled' : 'text.primary',
                          fontStyle: valores[i] === '' ? 'italic' : 'normal',
                        }}
                      >
                        {valores[i] === '' ? '(vacío)' : valores[i]}
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                {existe
                  ? 'oProyecto.existe? = _true → valores leídos del proyecto.'
                  : 'oProyecto.existe? = _false → valores forzados a "" (rama else).'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
