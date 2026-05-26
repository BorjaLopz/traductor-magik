import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, Stack, TextField, Typography,
} from '@mui/material'
import {
  CResumenOptico,
  HEADER_LABELS,
  type CedoRecord,
  type DivisorRecord,
  type ContextoResumen,
} from '../models/CResumenOptico'

// =============================================================================
// MOCK
// =============================================================================

function makeDivisor(name: string, ports: number, cargas: (number | undefined)[], estados: ('E'|'P')[], cuentaPrincipal: string): DivisorRecord {
  const padded = Array(8).fill(undefined) as (number | undefined)[]
  cargas.forEach((c, i) => { if (i < 8) padded[i] = c })
  const padE = Array(8).fill('P') as ('E'|'P')[]
  estados.forEach((e, i) => { if (i < 8) padE[i] = e })
  return { name, outputPorts: ports, cargas: padded, estados: padE, cuentaPrincipal }
}

const CEDO_DEMO: CedoRecord = {
  id: 'C-A',
  nombre: 'CEDO-XOLA',
  divisores: [
    makeDivisor('A', 8, [8, 8, 16, undefined, undefined, undefined, undefined, undefined], ['E','E','P','P','P','P','P','P'], '21'),
    makeDivisor('B', 8, [16, 8, undefined, 8, undefined, undefined, undefined, undefined], ['E','E','P','E','P','P','P','P'], '22'),
    makeDivisor('C', 8, [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], ['P','P','P','P','P','P','P','P'], '23'),
    makeDivisor('D', 8, [8, 8, 8, 8, 8, 8, 8, 8], ['E','E','E','E','E','E','E','E'], '24'),
  ],
}

const CTX_DEMO: ContextoResumen = {
  ncoSiglas:  'MEX',
  ncoNombre:  'CIUDAD DE MEXICO',
  distrito:   '17 BENITO JUAREZ',
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CResumenOpticoShowcase() {
  const sello = useMemo(() => {
    const s = new CResumenOptico()
    s.setCedo(CEDO_DEMO)
    s.setContexto(CTX_DEMO)
    s.calculaDatosCeldas()
    return s
  }, [])

  const [ncoSiglas, setNcoSiglas] = useState(CTX_DEMO.ncoSiglas)
  const [distrito,  setDistrito]  = useState(CTX_DEMO.distrito)

  const ncoTit = `NCO ${ncoSiglas} (${CTX_DEMO.ncoNombre})`.toUpperCase()
  const dtoTit = `DTO: ${distrito}`

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_resumen_optico
        <Chip label="Fase 2 · COMPLEJO · score 13" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_resumen_optico.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader title="Contexto" titleTypographyProps={{ variant: 'subtitle2' }} />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="NCO siglas" value={ncoSiglas} onChange={e => setNcoSiglas(e.target.value)} size="small" fullWidth />
                <TextField label="Distrito"   value={distrito}  onChange={e => setDistrito(e.target.value)}  size="small" fullWidth />
                <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  oCedo.id        = "{sello.oCedo?.id}"<br />
                  oCedo.nombre    = "{sello.oCedo?.nombre}"<br />
                  oRenglones      = {sello.oRenglones}<br />
                  total_servicios = {sello.totalServicios()}<br />
                  total_capacidad = {sello.totalCapacidad()}
                </Box>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                  dimensionaTabla() = [{sello.dimensionaTabla().join(', ')}]
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sello visual */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader title="Sello renderizado" subheader="4 sub-tablas apiladas verticalmente" titleTypographyProps={{ variant: 'subtitle2' }} subheaderTypographyProps={{ variant: 'caption' }} />
            <CardContent>
              {/* tbl_titulo_nco */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '50fr 26fr', border: '2px solid #2e7d32', borderBottom: 'none' }}>
                <Box sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', color: '#c2185b' /* :LoColorNco aproximado */, fontSize: 13 }}>
                  {ncoTit}
                </Box>
                <Box sx={{ p: 1, textAlign: 'center', fontWeight: 'bold', color: '#bf9000' /* :LoColorOro aproximado */, fontSize: 13, borderLeft: '2px solid #2e7d32' }}>
                  {dtoTit}
                </Box>
              </Box>

              {/* tbl_titulo */}
              <Box sx={{ border: '2px solid #2e7d32', borderBottom: 'none', textAlign: 'center', p: 1, fontWeight: 'bold', fontSize: 22, color: '#2e7d32' }}>
                RESUMEN OPTICO
              </Box>

              {/* tbl_contenido */}
              <Box sx={{ border: '2px solid #2e7d32', display: 'grid', gridTemplateColumns: '8fr 4fr 4fr 4fr 4fr 4fr 4fr 4fr 4fr 13fr 8fr 15fr', fontFamily: 'monospace', fontSize: 11 }}>
                {HEADER_LABELS.map((h, i) => (
                  <Box key={i} sx={{ p: 0.5, textAlign: 'center', fontWeight: 'bold', color: '#2e7d32', borderRight: '1px solid #2e7d32', borderBottom: '2px solid #2e7d32', whiteSpace: 'pre-line' }}>
                    {h}
                  </Box>
                ))}
                {sello.oDatos.map((row, ri) => (
                  <>
                    <Box key={`t-${ri}`} sx={{ p: 0.5, textAlign: 'center', color: '#2e7d32', borderRight: '1px solid #2e7d32', borderBottom: '1px solid #2e7d32', fontWeight: 'bold' }}>
                      {row.terminal}
                    </Box>
                    {row.cells.map((c, ci) => (
                      <Box key={`c-${ri}-${ci}`} sx={{ p: 0.5, textAlign: 'center', color: row.edoConstr[ci] === 'E' ? '#2e7d32' : '#c62828', borderRight: '1px solid #2e7d32', borderBottom: '1px solid #2e7d32' }}>
                        {c}
                      </Box>
                    ))}
                    <Box key={`s-${ri}`} sx={{ p: 0.5, textAlign: 'center', color: '#c62828', borderRight: '1px solid #2e7d32', borderBottom: '1px solid #2e7d32' }}>{row.serv}</Box>
                    <Box key={`f-${ri}`} sx={{ p: 0.5, textAlign: 'center', color: '#c62828', borderRight: '1px solid #2e7d32', borderBottom: '1px solid #2e7d32' }}>{row.fib}</Box>
                    <Box key={`to-${ri}`} sx={{ p: 0.5, textAlign: 'center', color: '#c62828', borderBottom: '1px solid #2e7d32' }}>{row.tot}</Box>
                  </>
                ))}
              </Box>

              {/* tbl_total */}
              <Box sx={{ border: '2px solid #2e7d32', borderTop: 'none', p: 1, color: '#c62828', fontWeight: 'bold', fontSize: 13 }}>
                Total de servicios Opticos a atender {sello.totalServicios()}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Columnas 1..8 = terminales. Verde = EXISTENTE · Rojo = PROYECTADO o totales.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
