import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Stack, Typography,
} from '@mui/material'
import { TIPOS_ELEMENTOS } from '../models/CTraceRutaCables'

// ─── Data flow diagram ────────────────────────────────────────────────────────

function FlowNode({
  label, sub, color = '#e3f2fd', border = '#1565c0',
}: { label: string; sub?: string; color?: string; border?: string }) {
  return (
    <Box sx={{
      border: `1.5px solid ${border}`,
      borderRadius: 1,
      bgcolor: color,
      px: 1.5, py: 0.5,
      display: 'inline-flex', flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Typography sx={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>{sub}</Typography>}
    </Box>
  )
}

function Arrow({ label }: { label?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 0.3 }}>
      {label && <Typography sx={{ fontSize: 9, fontFamily: 'monospace', color: 'text.secondary' }}>{label}</Typography>}
      <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1 }}>↓</Typography>
    </Box>
  )
}

function FlowDiagram() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>

      {/* Entry */}
      <FlowNode label="obtenerEstructuras(nodo)" sub="main entry point" color="#e3f2fd" border="#1565c0" />
      <Arrow />

      {/* Two parallel branches */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

        {/* Branch 1: bastidorInicial */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FlowNode label="bastidorInicial(nodo)" sub="pin → sheath_pin → strw_connect_point → owner" color="#f3e5f5" border="#6a1b9a" />
          <Arrow label="→ _basInicio" />
          <FlowNode label="_basInicio" sub="bay start" color="#fce4ec" border="#880e4f" />
        </Box>

        {/* Branch 2: trace engine */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FlowNode label="oLowEngine.trace_out(nodo)" sub="mit_low_level_trace_engine [GIS]" color="#fff3e0" border="#e65100" />
          <Arrow label="→ links[]" />
          <FlowNode label="_estructurasPorLink(links)" sub="private" color="#e8f5e9" border="#2e7d32" />
          <Arrow />
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            {/* per-node */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FlowNode label="_estructurasEnNodo" sub="in_node + out_node" color="#f9fbe7" border="#558b2f" />
              <Arrow />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <FlowNode label="_cables[]" sub="pin.owner" color="#fafafa" border="#aaa" />
                <FlowNode label="_estructuras[]" sub="non-underground" color="#fafafa" border="#aaa" />
                <FlowNode label="_canalizacion[]" sub="underground_route" color="#fafafa" border="#aaa" />
                <FlowNode label="_elementos[]" sub="structure_annotations" color="#fafafa" border="#aaa" />
              </Box>
            </Box>
            {/* per-link */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FlowNode label="_deviceEnLink" sub="per link" color="#f9fbe7" border="#558b2f" />
              <Arrow />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <FlowNode label="_estructuras[]" sub="top_level if is_structure?" color="#fafafa" border="#aaa" />
                <FlowNode label="_elementos[]" sub="figure_eight / splice_closure" color="#fafafa" border="#aaa" />
                <FlowNode label="_basFinal[]" sub="mit_rme_port → rme_bay_owner" color="#fafafa" border="#aaa" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Arrow label="returns" />
      <FlowNode
        label="ResultadoTraza"
        sub="{ estructuras[], canalizacion[], elementos[] }"
        color="#e8eaf6" border="#283593"
      />
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

const METHODS = [
  {
    name: 'obtenerEstructuras(nodo)',
    vis: 'public',
    returns: 'ResultadoTraza | undefined',
    desc: 'Entry point: runs trace_out y llama estructurasPorLink. Devuelve (estructuras, canalizacion, elementos) o undefined si la traza falla.',
  },
  {
    name: 'bastidorInicial(pin)',
    vis: 'public',
    returns: 'unknown (bay)',
    desc: 'Navega pin → sheath_pin → strw_connect_point → owner para obtener el bastidor de inicio.',
  },
  {
    name: '_estructurasPorLink(links)',
    vis: 'private',
    returns: '{ estructuras[], elementos[] }',
    desc: 'Para cada link llama estructurasEnNodo (in_node y out_node) y deviceEnLink.',
  },
  {
    name: '_estructurasEnNodo(nodo, …)',
    vis: 'private',
    returns: 'void',
    desc: 'Si el nodo es mit_fiber_pin / mit_pseudo_fiber_pin: añade estructuras, cables, anotaciones y canalizaciones del owner.',
  },
  {
    name: '_deviceEnLink(link, …)',
    vis: 'private',
    returns: 'void',
    desc: 'get_top_level_device → estructura o elemento. get_low_level_device → mit_rme_port → basFinal.',
  },
  {
    name: '_agregaElemento(top, …)',
    vis: 'private',
    returns: 'void',
    desc: 'Solo añade a elementos si source_collection.name ∈ TIPOS_ELEMENTOS.',
  },
]

const GETTERS = [
  { name: 'cables',       slot: 'oCables',       type: 'unknown[]', desc: 'Cables atravesados en la ruta' },
  { name: 'rmeInicio',    slot: 'oBasInicio',    type: 'unknown',   desc: 'Bastidor de inicio del cable' },
  { name: 'rmeFinal',     slot: 'oBasFinal',     type: 'unknown[]', desc: 'Bastidores de llegada (RME port → bay)' },
  { name: 'estructuras',  slot: 'oEstructuras',  type: 'unknown[]', desc: 'Estructuras físicas (buildings, etc.)' },
  { name: 'canalizacion', slot: 'oCanalizacion', type: 'unknown[]', desc: 'Rutas underground_route' },
  { name: 'elementosRuta',slot: 'oElementos',    type: 'unknown[]', desc: 'Empalmes y gasas (figure_eight, splice_closure)' },
]

export function CTraceRutaCablesShowcase() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_trace_ruta_cables
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="sin clase padre" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="motor de traza GIS" size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/engine/c_trace_ruta_cables.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Motor de traza de red FO. Envuelve <code>mit_low_level_trace_engine</code> para recorrer la topología
        de red desde un nodo inicial y recolectar estructuras físicas, cables, canalización y elementos
        (empalmes/gasas) a lo largo de la ruta. Sin clase padre. Toda la lógica es Fase 5 (GIS).
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: flow diagram */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Flujo de llamadas"
              subheader="obtenerEstructuras() como punto de entrada único"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ overflowX: 'auto' }}>
              <FlowDiagram />
            </CardContent>
          </Card>
        </Grid>

        {/* Right: methods + getters + constant */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Métodos"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Método', 'Vis.', 'Retorna', 'Descripción'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {METHODS.map(({ name, vis, returns, desc }) => (
                      <Box component="tr" key={name} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main', whiteSpace: 'nowrap' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>
                          <Chip
                            label={vis}
                            size="small"
                            color={vis === 'public' ? 'success' : 'default'}
                            sx={{ fontSize: 9, height: 16 }}
                          />
                        </Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', whiteSpace: 'nowrap', fontSize: 10 }}>{returns}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>{desc}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Slots → Getters TypeScript"
                subheader="7 slots privados en Magik → campos privados + getters"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Magik slot', 'getter TS', 'Tipo', 'Contenido'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {GETTERS.map(({ slot, name, type, desc }) => (
                      <Box component="tr" key={slot} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '2px 8px', color: 'text.disabled' }}>{slot}</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: 'text.secondary' }}>{type}</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: 'text.secondary', fontSize: 10 }}>{desc}</Box>
                      </Box>
                    ))}
                    <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff3e0' }}>
                      <Box component="td" sx={{ p: '2px 8px', color: 'text.disabled' }}>oLowEngine</Box>
                      <Box component="td" sx={{ p: '2px 8px', color: 'text.disabled', fontStyle: 'italic' }}>— (sin getter)</Box>
                      <Box component="td" sx={{ p: '2px 8px', color: 'text.secondary' }}>unknown</Box>
                      <Box component="td" sx={{ p: '2px 8px', color: 'warning.main', fontSize: 10 }}>mit_low_level_trace_engine [GIS]</Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="TIPOS_ELEMENTOS (shared constant)"
                subheader="Filtro para deviceEnLink → _elementos"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  {TIPOS_ELEMENTOS.map(t => (
                    <Chip key={t} label={t} size="small" color="error" variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary', mt: 1 }}>
                  Solo los elementos cuyo <code>source_collection.name</code> sea uno de estos tipos
                  se agregan a <code>_elementos</code> vía <code>_agregaElemento()</code>.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
