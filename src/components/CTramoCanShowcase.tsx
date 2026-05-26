import { useMemo } from 'react'
import {
  Box, Chip, Divider, Paper, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from '@mui/material'
import { CTramoCan } from '../models/CTramoCan'
import type {
  TramoCanRecord, DetTramoCanRecord, OeRecord, OeiRecord, OpbRecord, RutaRecord,
  CanalizacionRecord, ObraRecord, PozoRecord, StructureRecord,
} from '../models/CTramoCan'

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockDet: DetTramoCanRecord = {
  calles: 'AV. INSURGENTES SUR / MIGUEL ÁNGEL DE QUEVEDO',
  colonia_cp: 'COPILCO UNIVERSIDAD 04360',
  municipio: 'COYOACÁN',
  distritos: 'XIX, XX',
  'user!_num_tramo': 'T-045',
  'user!_proyectista': 'ING. RAMÍREZ',
  'user!_supervisor': 'ING. GARCÍA',
  poblacion: '12500',
}

const mockObra1: ObraRecord = { name: 'DUCTO_3x4', mit_conduits: { size: 3 } }
const mockObra2: ObraRecord = { name: 'DUCTO_2x4', mit_conduits: { size: 2 } }

const mockCans: CanalizacionRecord[] = [
  {
    measured_length: 150,
    obra_principal: mockObra1,
    'user!_ubicacion': 'BANQUETA',
    'user!_tipo_superficie': 'CONCRETO',
    calcular_obras_normalizadas_asociadas: (tipo) => tipo === 'proyectado' ? [mockObra1] : [],
    obtener_flexos_contenidos: () => ({ proyectado: [{}] }),
    connected_structures: () => [],
  },
  {
    measured_length: 80,
    obra_principal: mockObra2,
    'user!_ubicacion': 'ARROYO',
    'user!_tipo_superficie': 'ASFALTO',
    calcular_obras_normalizadas_asociadas: (tipo) => tipo === 'proyectado' ? [mockObra1, mockObra2] : [],
    obtener_flexos_contenidos: () => ({ proyectado: [{}] }),
    connected_structures: (): StructureRecord[] => [
      { source_collection: { name: 'mit_terminal_enclosure' } },
    ],
  },
]

const mockPozos: PozoRecord[] = [
  { construction_status: 'PROYECTADO', 'user!_ubicacion': 'BANQUETA', spec_id: 'PZO-1200', source_collection: { name: 'uub' } },
  { construction_status: 'PROYECTADO', 'user!_ubicacion': 'ARROYO',   spec_id: 'PZO-1500', source_collection: { name: 'uub' } },
  { construction_status: 'EXISTENTE',  'user!_ubicacion': 'BANQUETA', spec_id: 'PZO-1200', source_collection: { name: 'uub' } },
]

const mockTramo: TramoCanRecord = {
  obtener_canalizacion: () => [mockCans, mockPozos],
  'user!_det_t_can': mockDet,
}

const mockRuta: RutaRecord = { 'user!_numero': 'R-12' }
const mockOpb: OpbRecord = { 'user!_valor_opb': 'OPB-2024-001', 'user!_num_op': 'OP-001', 'user!_rutas': mockRuta }
const mockOei: OeiRecord = { 'user!_valor_oei': 'OEI-2024-007', 'user!_num_oei': 'OEI-007', 'user!_opb': mockOpb, 'user!_op_local': undefined }
const mockOe: OeRecord = { 'user!_valor_oe': 'OE-2024-045', 'user!_num_oe': 'OE-045', 'user!_oei': mockOei, 'user!_oei_local': undefined }

// ── Component ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: 600, color: '#546e7a', fontSize: 11, py: 0.5, width: 160 }}>{label}</TableCell>
      <TableCell sx={{ fontSize: 11, py: 0.5 }}>{value ?? '—'}</TableCell>
    </TableRow>
  )
}

export function CTramoCanShowcase() {
  const { tramo, resumen, pozosData, cajas } = useMemo(() => {
    const t = new CTramoCan()
    t.tramo = mockTramo
    t.asignarOe(mockOe)

    const longObra = t.calcularLongitudObra()
    const longCepa = t.calcularLongitudObraCepaHecha()
    t.calcularLongitudObraTubosAdic()
    t.calcularLongitudObraMtsVia()
    const res = t.generarResumenTotalTipoObra()

    return {
      tramo: t,
      resumen: res,
      longObra,
      longCepa,
      pozosData: t.numPozosProyPorTipo(),
      cajas: t.cajasDistribucion(),
    }
  }, [])

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Datos de tramo de canalización. Getters encadenados desde GIS record. Cálculos de longitud y resumen total.
      </Typography>

      {/* Identification */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>Identificación del tramo</Typography>
      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableBody>
            <InfoRow label="Núm. tramo"       value={tramo.numeroTramo} />
            <InfoRow label="Calles"            value={tramo.calles} />
            <InfoRow label="Colonia / CP"      value={tramo.colonia} />
            <InfoRow label="Delegación / Mpo"  value={tramo.delegacionMpo} />
            <InfoRow label="Distritos"         value={tramo.distritosAfectados} />
            <InfoRow label="Población"         value={tramo.poblacion} />
            <InfoRow label="Proyectista"       value={tramo.proyectista} />
            <InfoRow label="Supervisor"        value={tramo.supervisor} />
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* OE / OEI / OPB hierarchy */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>Jerarquía OE → OEI → OPB → Ruta</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'OE',   value: tramo.oe,       num: tramo.oeLo },
          { label: 'OEI',  value: tramo.oei,      num: tramo.oeiLo },
          { label: 'OPB',  value: tramo.opb,      num: tramo.opbLo },
          { label: 'Ruta', value: tramo.numeroRuta, num: undefined },
        ].map(({ label, value, num }) => (
          <Paper key={label} variant="outlined" sx={{ px: 1.5, py: 0.75, minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 11 }}>{value || '—'}</Typography>
            {num && <Typography variant="caption" color="text.secondary">{num}</Typography>}
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Summary table */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
        Resumen por tipo de obra — <code>generarResumenTotalTipoObra()</code>
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontSize: 11, fontFamily: 'monospace' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#263238' }}>
              {['Tipo obra', 'Total (m)', 'Cepa hecha (m)', 'Tubos adic (m)', 'Mts vía (m)'].map(h => (
                <TableCell key={h} sx={{ color: '#fff', fontSize: 10, fontFamily: 'monospace', py: 0.5 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...resumen.entries()].map(([tipo, cols]) => (
              <TableRow key={tipo} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                <TableCell sx={{ fontSize: 10, fontFamily: 'monospace', py: 0.5, fontWeight: 600 }}>{tipo}</TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.5 }}>{cols.get('OTROS_Total') ?? '—'}</TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.5 }}>{cols.get('OTROS_Cepa_Hecha') ?? '—'}</TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.5 }}>{cols.get('OTROS_Tubos_Adic') ?? '—'}</TableCell>
                <TableCell sx={{ fontSize: 10, py: 0.5 }}>{cols.get('OTROS_Mts_Via') ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Pozos & cajas */}
      <Stack direction="row" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
            Pozos proyectados — <code>numPozosProyPorTipo()</code>
          </Typography>
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#37474f' }}>
                  {['Ubicación', 'Tipo', 'Qty'].map(h => (
                    <TableCell key={h} sx={{ color: '#fff', fontSize: 10, py: 0.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...pozosData.entries()].flatMap(([ubi, tipos]) =>
                  [...tipos.entries()].map(([tipo, qty]) => (
                    <TableRow key={`${ubi}-${tipo}`}>
                      <TableCell sx={{ fontSize: 10, py: 0.5 }}>{ubi}</TableCell>
                      <TableCell sx={{ fontSize: 10, py: 0.5 }}>{tipo}</TableCell>
                      <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 600 }}>{qty}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
            Cajas de distribución — <code>cajasDistribucion()</code>
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            {cajas.length === 0
              ? <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>Sin cajas</Typography>
              : cajas.map((c, i) => (
                  <Chip key={i} label={c.source_collection.name} size="small" sx={{ m: 0.25, fontSize: 10 }} />
                ))
            }
          </Paper>
        </Box>
      </Stack>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`totalMetrosLineales: ${tramo.totalMetrosLineales || '0'} m`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label={`totalMetrosVia: ${tramo.totalMetrosVia || '0'} m`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label={`codigoPostal: ${tramo.codigoPostal}`} size="small" variant="outlined" sx={{ fontSize: 10, color: '#f57c00' }} />
      </Box>
    </Box>
  )
}
