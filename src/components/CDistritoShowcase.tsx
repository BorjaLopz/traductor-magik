import { useMemo, useState } from 'react'
import {
  Alert, Box, Card, CardContent, CardHeader, Chip, Divider, Grid, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material'
import {
  CDistrito,
  DIVISOR_EQUIVALENCIA,
  NSES,
  armaCadenaCable,
  type CDistritoServices,
  type CableRecord,
  type DistritoRecord,
  type InventarioMap,
  type InventarioPorNse,
  type LoteRecord,
  type Nse,
  type ProyectoActivo,
} from '../models/CDistrito'

// =============================================================================
// MOCK
// =============================================================================

const INVENTARIO_DEMO: InventarioMap = {
  A: row( 50, 30, 5, 12,  6,  3,  20, 1, 0, 1),
  B: row(120, 80, 8, 22, 18,  7,  40, 4, 2, 3),
  C: row(220, 150, 10, 50, 33, 12,  60, 6, 4, 4),
  D: row(180, 110, 8, 38, 28, 10,  70, 8, 5, 3),
  E: row( 80, 35, 3, 12, 10,  5,  40, 3, 2, 1),
}
function row(viv: number, abon: number, mult: number, comp: number, inal: number, sol: number, sin: number, ltc: number, pslt: number, pubcomp: number): InventarioPorNse {
  return {
    viviendas:            viv,
    abonados:             abon,
    lineas_multiplicador: mult,
    lineas_competencia:   comp,
    lineas_inalambricas:  inal,
    solicitudes:          sol,
    viv_sin_servicio:     sin,
    ltc, pslt, publicos_comp: pubcomp,
  }
}

const LOTES_DEMO: LoteRecord[] = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: `B-${i}`, user_calificador: 'BALDIO' })),
  ...Array.from({ length: 3  }, (_, i) => ({ id: `E-${i}`, user_calificador: 'ESCUELA' })),
  ...Array.from({ length: 2  }, (_, i) => ({ id: `I-${i}`, user_calificador: 'IGLESIA' })),
  ...Array.from({ length: 88 }, (_, i) => ({ id: `H-${i}`, user_calificador: 'HABITACIONAL' })),
]

const DISTRITO: DistritoRecord = {
  id:            'D-17',
  user_distrito: '17 BENITO JUAREZ',
  user_limite:   { area: 1500 },
  factorPen: {
    A: 0.95, B: 0.85, C: 0.70, D: 0.55, E: 0.40,
    C1: 0.75, C2: 0.65, C3: 0.55,
    IL: 0.10, IM: 0.08, IP: 0.05,
  },
}

const PROYECTO: ProyectoActivo = { user_programa_anyo: '2025' }

const SERVICES: CDistritoServices = {
  resumenLotificacion: () => ({
    inventario:     INVENTARIO_DEMO,
    lotes:          LOTES_DEMO,
    nsePredominante: 'C',
  }),
  proyectoActivo: () => PROYECTO,
}

const CABLE_DEMO: CableRecord = {
  id: 'CAB-101',
  user_numero_cable: '101',
  spec_info: { fiber_quantity: 48, user_clase: 'SM-G657A1' },
  fibras_muertas: 6,
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CDistritoShowcase() {
  const dist = useMemo(() => {
    const d = new CDistrito(SERVICES)
    d.asignaDistrito(DISTRITO, true)
    return d
  }, [])

  const [nseFocus, setNseFocus] = useState<Nse>('C')
  const [cableMuertas, setCableMuertas] = useState<number>(6)

  const inv = dist.inventario[nseFocus]
  const factor = dist.factorPenNse()[nseFocus] ?? 0
  const lineas = dist.lineasSaturacion()

  const cable: CableRecord = { ...CABLE_DEMO, fibras_muertas: cableMuertas }
  const etiqueta = armaCadenaCable(cable, PROYECTO)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_distrito
        <Chip label="Fase 2 · MODERADO · score 86" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_distrito.magik</code> — package <code>user</code>
      </Typography>
      <Alert severity="info" sx={{ mt: 1, mb: 2, fontSize: 12 }}>
        El módulo original tiene ~2800 líneas (cortes de caja, cables conectados, mufas, etc.). Esta migración cubre el núcleo:
        inventario por NSE · saturación · conteos por calificador · etiqueta de cable. Los lookups GIS pesados van vía servicio inyectable.
      </Alert>

      <Grid container spacing={3}>
        {/* Distrito + NSE focus */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="Distrito"
              subheader={`objeto.user_distrito = "${dist.objeto?.user_distrito}"`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  <div>cantidad_lotes()       = {dist.cantidadLotes()}</div>
                  <div>numero_baldios()       = {dist.numeroBaldios()}</div>
                  <div>numero_escuelas()      = {dist.numeroEscuelas()}</div>
                  <div>numero_iglesias()      = {dist.numeroIglesias()}</div>
                  <div>dto_nse_predominante() = "{dist.dtoNsePredominante()}"</div>
                </Box>

                <Divider />

                <TextField
                  select label="NSE foco" size="small"
                  value={nseFocus}
                  onChange={e => setNseFocus(e.target.value as Nse)}
                  fullWidth
                >
                  {NSES.filter(n => dist.inventario[n]).map(n => (
                    <MenuItem key={n} value={n}>NSE {n}</MenuItem>
                  ))}
                </TextField>

                {inv && (
                  <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                    viviendas         = {inv.viviendas}<br />
                    abonados          = {inv.abonados}<br />
                    viv_sin_servicio  = {inv.viv_sin_servicio}<br />
                    factor_pen({nseFocus}) = {factor}<br />
                    <Divider sx={{ my: 0.5 }} />
                    lineas_sat({nseFocus}) ={' '}
                    <strong>{lineas[nseFocus] ?? 0}</strong><br />
                    <span style={{ color: '#666' }}>
                      = max(abon, viv_sin × factor + abon)
                    </span>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* lineas_saturacion table */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="lineas_saturacion() por NSE"
              subheader={`Total = ${lineas['Total']}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse', '& td, & th': { p: 0.5, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'left' } }}>
                <thead>
                  <tr>
                    <Box component="th">NSE</Box>
                    <Box component="th">viv</Box>
                    <Box component="th">abon</Box>
                    <Box component="th">sin_srv</Box>
                    <Box component="th">factor</Box>
                    <Box component="th" sx={{ textAlign: 'right !important' as unknown as 'right' }}>sat</Box>
                  </tr>
                </thead>
                <tbody>
                  {NSES.filter(n => dist.inventario[n]).map(n => {
                    const inv2 = dist.inventario[n]!
                    return (
                      <tr key={n} style={{ background: n === nseFocus ? '#fff3cd' : undefined }}>
                        <Box component="td"><strong>{n}</strong></Box>
                        <Box component="td">{inv2.viviendas}</Box>
                        <Box component="td">{inv2.abonados}</Box>
                        <Box component="td">{inv2.viv_sin_servicio}</Box>
                        <Box component="td">{dist.factorPenNse()[n]}</Box>
                        <Box component="td" sx={{ textAlign: 'right' }}>{lineas[n]}</Box>
                      </tr>
                    )
                  })}
                  <tr>
                    <Box component="td" colSpan={5} sx={{ fontWeight: 'bold' }}>Total (ceiling)</Box>
                    <Box component="td" sx={{ textAlign: 'right', fontWeight: 'bold' }}>{lineas['Total']}</Box>
                  </tr>
                </tbody>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* arma_cadena_cable + divisor_equivalencia */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="arma_cadena_cable + divisor_equivalencia"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="cable.fibras_muertas"
                  type="number"
                  value={cableMuertas}
                  onChange={e => setCableMuertas(Math.max(0, Number(e.target.value) || 0))}
                  size="small"
                  fullWidth
                />
                <Box sx={{ p: 1.5, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {etiqueta}
                </Box>

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  divisor_equivalencia (A..S → 1..16)
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, fontFamily: 'monospace', fontSize: 11 }}>
                  {Object.entries(DIVISOR_EQUIVALENCIA).map(([k, v]) => (
                    <Box key={k} sx={{ p: 0.5, bgcolor: 'action.hover', borderRadius: 0.5, textAlign: 'center' }}>
                      {k} → {v}
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                  Letras omitidas: I, N, Ñ, Q
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
