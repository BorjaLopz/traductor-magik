import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid, MenuItem,
  Stack, TextField, Typography, Alert,
} from '@mui/material'
import {
  CCentralE,
  type CentralLookupService,
  type CentralRecord,
  type LimiteRecord,
} from '../models/CCentralE'

// =============================================================================
// MOCK SERVICE — sustituye predicate.eq(:user!_siglas, sSiglas).an_element()
// =============================================================================

const CENTRALES: CentralRecord[] = [
  { 'user!_siglas': 'MEX', 'user!_tipo': 'CENTRAL_MAESTRA', 'user!_nom_nodo': 'CIUDAD DE MEXICO',  'user!_localidad': 'CDMX'        },
  { 'user!_siglas': 'GDL', 'user!_tipo': 'CENTRAL_TANDEM',  'user!_nom_nodo': 'GUADALAJARA',       'user!_localidad': 'GUADALAJARA' },
  { 'user!_siglas': 'MTY', 'user!_tipo': 'CENTRAL_MAESTRA', 'user!_nom_nodo': 'MONTERREY',         'user!_localidad': 'MONTERREY'   },
  { 'user!_siglas': 'PUE', 'user!_tipo': 'CENTRAL_LOCAL',   'user!_nom_nodo': 'PUEBLA',            'user!_localidad': 'PUEBLA'      },
  { 'user!_siglas': 'XOC', 'user!_tipo': 'NODO',            'user!_nom_nodo': 'XOCHIMILCO',        'user!_localidad': 'XOCHIMILCO'  },
]

const LIMITES: LimiteRecord[] = [
  { 'user!_central': 'MEX', municipio: 'CUAUHTEMOC'      },
  { 'user!_central': 'GDL', municipio: 'GUADALAJARA'     },
  { 'user!_central': 'MTY', municipio: 'MONTERREY'       },
  { 'user!_central': 'PUE', municipio: 'PUEBLA DE ZARAGOZA' },
  // XOC sin límite → demuestra fallback a valor por defecto
]

const mockService: CentralLookupService = {
  findCentralBySiglas: s => CENTRALES.find(c => c['user!_siglas'] === s),
  findLimiteBySiglas:  s => LIMITES.find  (l => l['user!_central'] === s),
}

const SUGERENCIAS = [...CENTRALES.map(c => c['user!_siglas']), 'INEXISTENTE']

// =============================================================================
// COMPONENTE
// =============================================================================

export function CCentralEShowcase() {
  const [siglas, setSiglas]                 = useState<string>('MEX')
  const [valorPorDefecto, setValorDefecto]  = useState<string>(' ')

  const central = useMemo(() => {
    const c = new CCentralE(mockService, valorPorDefecto)
    if (siglas) c.siglas = siglas
    return c
  }, [siglas, valorPorDefecto])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_central_e
        <Chip label="Fase 1 · SIMPLE · score 10" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_central_e.magik</code> — package <code>user</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        version: <code>{CCentralE.version()}</code>
      </Typography>

      <Grid container spacing={3}>
        {/* Inputs */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="siglas << RsValor"
              subheader="Asignar dispara prvLeer_Central_BdD (2 selects)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="sSiglas"
                  value={siglas}
                  onChange={e => setSiglas(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="MEX/GDL/MTY/PUE tienen central+límite; XOC sin límite; INEXISTENTE sin nada"
                >
                  {SUGERENCIAS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>

                <TextField
                  label="oValorPorDefecto"
                  value={valorPorDefecto}
                  onChange={e => setValorDefecto(e.target.value)}
                  size="small"
                  fullWidth
                  helperText='Original: " " (espacio). Cambia para visualizar fallbacks.'
                />

                <Divider />

                <Stack direction="row" spacing={1}>
                  <Chip
                    label={central.existeNodo ? 'existe_nodo? ✓' : 'existe_nodo? ✗'}
                    size="small"
                    color={central.existeNodo ? 'success' : 'default'}
                    variant={central.existeNodo ? 'filled' : 'outlined'}
                  />
                  <Chip
                    label={central.existeLimite ? 'existe_limite? ✓' : 'existe_limite? ✗'}
                    size="small"
                    color={central.existeLimite ? 'success' : 'default'}
                    variant={central.existeLimite ? 'filled' : 'outlined'}
                  />
                </Stack>

                {!central.existeNodo && (
                  <Alert severity="info" sx={{ fontSize: 12 }}>
                    Sin oCtl → tipo/nombre/localidad devuelven oValorPorDefecto.
                  </Alert>
                )}
                {!central.existeLimite && (
                  <Alert severity="info" sx={{ fontSize: 12 }}>
                    Sin oLimite → municipio_delegacion devuelve oValorPorDefecto.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Outputs */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Getters expuestos"
              subheader=".tipo · .nombre · .localidad · .municipio_delegacion"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <GetterRow label=".siglas"               value={central.siglas} />
                <GetterRow label=".tipo"                 value={central.tipo}                fallback={!central.existeNodo} />
                <GetterRow label=".nombre"               value={central.nombre}              fallback={!central.existeNodo} />
                <GetterRow label=".localidad"            value={central.localidad}           fallback={!central.existeNodo} />
                <GetterRow label=".municipio_delegacion" value={central.municipioDelegacion} fallback={!central.existeLimite} />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">Registros crudos</Typography>
              <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                <div>oCtl    = {central.oCtl    ? JSON.stringify(central.oCtl)    : '_unset'}</div>
                <div>oLimite = {central.oLimite ? JSON.stringify(central.oLimite) : '_unset'}</div>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function GetterRow({ label, value, fallback }: { label: string; value: string; fallback?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
      <Box sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main', minWidth: 180 }}>{label}</Box>
      <Box sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: fallback ? 400 : 700, color: fallback ? 'text.disabled' : 'text.primary' }}>
        {value === ' ' ? '" "' : value}
      </Box>
      {fallback && <Chip label="oValorPorDefecto" size="small" variant="outlined" sx={{ fontSize: 10 }} />}
    </Box>
  )
}
