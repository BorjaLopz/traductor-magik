import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Checkbox, Chip,
  Divider, Grid, Stack, Typography,
} from '@mui/material'
import {
  CArbolCablesFoCedo,
  type CableFoRecord,
  type CablesFoCedoService,
  type CedoRecord,
  type DistritoRecord,
  type TreeNode,
} from '../models/CArbolCablesFoCedo'

// =============================================================================
// MOCK SERVICE
// =============================================================================

const DISTRITO: DistritoRecord = {
  id: 'D-01', user_distrito: '17 BENITO JUAREZ', construction_status: 'PROYECTADO',
}

const CEDOS: CedoRecord[] = [
  { id: 'C-A', user_identificacion: 'CEDO-XOLA',     construction_status: 'EXISTENTE'  },
  { id: 'C-B', user_identificacion: 'CEDO-INSURGENTES', construction_status: 'PROYECTADO' },
]

const CABLES_BY_CEDO: Record<string, CableFoRecord[]> = {
  'C-A': [
    { id: 'CAB-001', user_numero_cable: '101', trace_description: 'FO-12FBR-MM', construction_status: 'EXISTENTE',  sourceCollection: 'sheath' },
    { id: 'CAB-002', user_numero_cable: '102', trace_description: 'FO-24FBR-SM', construction_status: 'EXISTENTE',  sourceCollection: 'sheath' },
    { id: 'CAB-003', user_numero_cable: undefined, trace_description: 'FO-48FBR-SM', construction_status: 'PROYECTADO', sourceCollection: 'sheath' },
  ],
  'C-B': [
    { id: 'CAB-101', user_numero_cable: '201', trace_description: 'FO-96FBR-SM', construction_status: 'PROYECTADO', sourceCollection: 'sheath' },
    { id: 'CAB-102', user_numero_cable: '202', trace_description: 'FO-72FBR-SM', construction_status: 'PROYECTADO', sourceCollection: 'sheath' },
  ],
}

function makeService(activo: boolean): CablesFoCedoService {
  return {
    activeDistrito: () => activo ? DISTRITO : undefined,
    cedosDelDistrito: () => CEDOS,
    cablesDelCedo: (c) => CABLES_BY_CEDO[c.id] ?? [],
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CArbolCablesFoCedoShowcase() {
  const [disenoActivo, setDisenoActivo] = useState(true)
  const [result, setResult] = useState<string>('')
  const [, bump] = useState(0)
  const re = () => bump(t => t + 1)

  const arbol = useMemo(() => {
    const a = new CArbolCablesFoCedo(makeService(disenoActivo))
    a.llenaArbol()
    return a
  }, [disenoActivo])

  const onCheck = (node: TreeNode, v: boolean) => {
    arbol.valorCambiado(node, v)
    re()
  }

  const onGenerar = () => {
    const r = arbol.generaPlanoCable()
    setResult(`${r.ok ? '✓' : '✗'} ${r.msg}${r.cable ? ` (${r.cable.id})` : ''}`)
  }

  const onCancelar = () => {
    setResult('Cancelado por el usuario (quit)')
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_arbol_cables_fo_cedo
        <Chip label="Fase 2 · COMPLEJO · score 10" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends model · tree_item" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_arbol_cables_fo_cedo.magik</code> — package <code>user</code>
      </Typography>
      <Alert severity="info" sx={{ mt: 1, mb: 2, fontSize: 12 }}>
        Diálogo para seleccionar <strong>un único</strong> cable FO con el que generar un plano de diagrama de empalmes.
        Estructura: Distrito → Cedo → Cable. Estilo: <span style={{ color: '#2e7d32' }}>EXISTENTE verde</span> · <span style={{ color: '#c62828' }}>PROYECTADO rojo</span>.
      </Alert>

      <Grid container spacing={3}>
        {/* Tree */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Árbol de cables"
              subheader={`activeDistrito? = ${disenoActivo ? '_true' : '_false'} · llena_arbol → ${arbol.list.length} raíces`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                <Chip
                  label={disenoActivo ? 'diseño activo' : 'sin diseño activo'}
                  size="small"
                  color={disenoActivo ? 'success' : 'default'}
                  onClick={() => setDisenoActivo(v => !v)}
                />
              </Stack>

              {arbol.list.length === 0 ? (
                <Box sx={{ p: 2, bgcolor: '#fff3cd', color: '#664d03', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  El cedo cedo no existe o el diseño no es de fibra óptica
                </Box>
              ) : (
                <Box>
                  {arbol.list.map(root => <NodeRow key={root.id} node={root} depth={0} onCheck={onCheck} />)}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={onGenerar}>
                  Generar Plano de Cable Seleccionado
                </Button>
                <Button size="small" variant="outlined" onClick={onCancelar}>Salir</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Estado interno"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  cable_seleccionado = {arbol.cableSeleccionado ? `"${arbol.cableSeleccionado.id}"` : '_unset'}
                </Box>

                <Typography variant="caption" color="text.secondary">activados() — sheaths checked</Typography>
                <Box sx={{ p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 10, minHeight: 50 }}>
                  {arbol.activados().length === 0 ? <em>—</em> : arbol.activados().map(c => <div key={c.id}>{c.id} · {c.trace_description}</div>)}
                </Box>

                {result && (
                  <Box sx={{ p: 1.5, bgcolor: result.startsWith('✓') ? '#e8f5e9' : '#ffebee', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                    {result}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function NodeRow({ node, depth, onCheck }: { node: TreeNode; depth: number; onCheck: (n: TreeNode, v: boolean) => void }) {
  const color = node.style === 'red' ? '#c62828' : node.style === 'green_bold' ? '#1b5e20' : '#2e7d32'
  const bold  = node.style === 'green_bold' || node.kind !== 'cable'
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: depth * 2.5, py: 0.25 }}>
        {node.kind === 'cable' && (
          <Checkbox
            size="small"
            checked={!!node.checked}
            onChange={e => onCheck(node, e.target.checked)}
            sx={{ p: 0.5 }}
          />
        )}
        {node.kind !== 'cable' && (
          <Box sx={{ width: 16, color: 'text.disabled', fontSize: 14 }}>
            {node.children.length > 0 ? '▸' : '·'}
          </Box>
        )}
        <Box sx={{ fontFamily: 'monospace', fontSize: 12, color, fontWeight: bold ? 700 : 400 }}>
          {node.label}
        </Box>
      </Box>
      {node.children.map(c => <NodeRow key={c.id} node={c} depth={depth + 1} onCheck={onCheck} />)}
    </Box>
  )
}
