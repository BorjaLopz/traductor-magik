import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Chip, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import { CArbolTba, buildTbaLabel, type TbaRecord, type TbaTreeNode } from '../models/CArbolTba'

// Mock TBA records — simulates obtener_tbas_diseno() returning projected TBAs
const MOCK_TBAS: TbaRecord[] = [
  {
    'user!_identificador': 'TBA-001',
    'user!_tipo':          'V1',
    'user!_fibras_opticas': '24',
    'user!_ubicacion':     'Av. Reforma 123',
    spec_id:               'SP-2024-001',
    construction_status:   'PROYECTADO',
  },
  {
    'user!_identificador': 'TBA-002',
    'user!_tipo':          'V2',
    'user!_fibras_opticas': '48',
    'user!_ubicacion':     'Calle Juárez 456',
    spec_id:               'SP-2024-002',
    construction_status:   'PROYECTADO',
  },
  {
    'user!_identificador': 'TBA-003',
    'user!_tipo':          'GUT',
    'user!_fibras_opticas': '12',
    'user!_ubicacion':     'Plaza Central Edificio A',
    spec_id:               'SP-2024-003',
    construction_status:   'PROYECTADO',
  },
]

const TIPO_COLOR: Record<string, 'default' | 'primary' | 'secondary' | 'success'> = {
  V1:  'primary',
  V2:  'secondary',
  GUT: 'success',
}

export function CArbolTbaShowcase() {
  const [nodes, setNodes] = useState<TbaTreeNode[]>(() =>
    new CArbolTba().llenaArbol(MOCK_TBAS)
  )
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const model = useMemo(() => new CArbolTba(), [])

  function toggleCheck(i: number) {
    setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, check: !n.check } : n))
    setMsg(null)
  }

  function syncModel() {
    model.list = nodes
  }

  function handleGenerar() {
    syncModel()
    try {
      model.generaPlanoMontajeTba()
      const sel = model.activados()
      setMsg({ type: 'success', text: `Plano generado para TBA: ${sel[0]['user!_identificador']} (Fase 5)` })
    } catch (e: unknown) {
      setMsg({ type: 'error', text: (e as Error).message })
    }
  }

  function handleIrATba() {
    syncModel()
    try {
      model.irATba()
      const sel = model.activados()
      setMsg({ type: 'success', text: `Navegando a TBA: ${sel[0]['user!_identificador']} — goto_primary_context (Fase 5)` })
    } catch (e: unknown) {
      setMsg({ type: 'error', text: (e as Error).message })
    }
  }

  function handleCancelar() {
    setMsg({ type: 'success', text: 'cancelar() → quit() — diálogo cerrado' })
  }

  const activados = nodes.filter(n => n.check)

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 270, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CArbolTba</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Selector de TBAs del diseño activo · extiende :model
        </Typography>
        <Chip label="Fase 4 — GUI" size="small" color="warning" sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="Fase 5 — GIS" size="small" color="error"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="MODERADO"     size="small" color="info"    sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Slots</Typography>
        {([
          ['list',      'TbaTreeNode[]', 'Nodos del árbol'],
          ['tree_item', 'unknown',       'Widget tree_item — Fase 4'],
          ['oTba',      'unknown',       'TBA activo'],
        ] as const).map(([s, t, d]) => (
          <Box key={s} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s}</Typography>
            <Typography variant="caption" color="text.secondary"> : {t} — {d}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>activados()</Typography>
        <Box sx={{
          bgcolor:     activados.length > 0 ? '#e8f5e9' : '#f5f5f5',
          border:      '1px solid',
          borderColor: activados.length > 0 ? '#4caf50' : '#ddd',
          p: 1, borderRadius: 1, mb: 1.5,
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            {activados.length === 0
              ? 'Sin selección'
              : activados.map(n => n.elemento['user!_identificador']).join(', ')}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            {activados.length} seleccionado(s)
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Acciones (activate_in)</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" size="small" fullWidth onClick={handleGenerar}>
            Generar Plano Montaje TBA
          </Button>
          <Button variant="outlined" size="small" fullWidth onClick={handleIrATba}>
            Ir a TBA
          </Button>
          <Button variant="outlined" size="small" fullWidth color="error" onClick={handleCancelar}>
            Salir
          </Button>
        </Box>

        {msg && (
          <Alert severity={msg.type} sx={{ mt: 1.5, fontSize: 11 }}>
            {msg.text}
          </Alert>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Métodos (Fase 4 / 5)</Typography>
        {([
          ['activateIn()',              'activate_in()',              '4'],
          ['buscarDetallesEdificio()',  'buscar_detalles_edificio()', '5'],
          ['buscarTbasEnEdificio()',    'buscar_tbas_en_edificio()',  '5'],
          ['obtenerTbasDiseno()',       'obtener_tbas_diseno()',      '5'],
          ['selected()',               'selected()',                 '4'],
        ] as const).map(([ts, magik, fase]) => (
          <Box key={ts} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{ts}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}> ← {magik} </Typography>
            <Chip label={`F${fase}`} size="small"
              color={fase === '4' ? 'warning' : 'error'}
              sx={{ fontSize: 9, height: 14, ml: 0.5 }} />
          </Box>
        ))}
      </Box>

      {/* ── Right panel — tree ── */}
      <Box sx={{ flex: 1, minWidth: 380 }}>
        <Typography variant="subtitle2" gutterBottom>
          llena_arbol() — TBAs proyectados ({MOCK_TBAS.length} registros mock)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Selecciona exactamente un TBA para activar las acciones. Checkbox = styled_string toggle.
        </Typography>

        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">check</TableCell>
              <TableCell>identificador</TableCell>
              <TableCell>tipo</TableCell>
              <TableCell>spec_id</TableCell>
              <TableCell>fibras</TableCell>
              <TableCell>ubicación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nodes.map((node, i) => (
              <TableRow key={i} hover selected={node.check}
                onClick={() => toggleCheck(i)} sx={{ cursor: 'pointer' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={node.check}
                    size="small"
                    onChange={() => toggleCheck(i)}
                    onClick={e => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {node.elemento['user!_identificador']}
                </TableCell>
                <TableCell>
                  <Chip
                    label={node.elemento['user!_tipo'] ?? '—'}
                    size="small"
                    color={TIPO_COLOR[node.elemento['user!_tipo'] ?? ''] ?? 'default'}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {node.elemento.spec_id}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {node.elemento['user!_fibras_opticas']}
                </TableCell>
                <TableCell sx={{ fontSize: 11 }}>
                  {node.elemento['user!_ubicacion']}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          valor — styled_string en Magik (toggle + check + estatus)
        </Typography>
        {nodes.map((node, i) => (
          <Box key={i} sx={{
            fontFamily:  'monospace',
            fontSize:    10,
            mb:          0.5,
            p:           0.75,
            bgcolor:     node.check ? '#e8f5e9' : '#fafafa',
            border:      '1px solid',
            borderColor: node.check ? '#4caf50' : '#eee',
            borderRadius: 1,
            color:       node.check ? '#1b5e20' : '#555',
            wordBreak:   'break-word',
          }}>
            {buildTbaLabel(node.elemento)}
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>obtener_tbas_diseno() — lógica (Fase 5)</Typography>
        <Box sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082', p: 1.5, borderRadius: 1, fontSize: 11 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`1. Obtiene scheme_area del diseño activo
2. Busca user!_tba_anotacion dentro del área (GUT TBAs)
3. Si dto.user!_limite_edificio es unset:
     → busca en mit_terminal_enclosure (CD)
   Sino:
     → busca en user!_registro_tablero (edificio)
4. Para cada CD/Registro: agrega tba si construction_status = "PROYECTADO"
5. Para GUT: agrega si user!_tipo = "GUT" y status = "PROYECTADO"`}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
