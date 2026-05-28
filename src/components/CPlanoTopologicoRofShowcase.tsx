import { useState } from 'react'
import {
  Alert, Box, Chip, Divider, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material'
import {
  type TituloTopologicoRofData,
  type CentralRofRecord,
  creaTituloTopologicoRof,
  buildTitleCtls,
  describePlanFlowTopologicoRof,
  NORTE_TOPOLOGICO_ROF,
  SELLOS_DETALLES_ROF,
  VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF,
} from '../models/CPlanoTopologicoRof'

// ─── SVG page diagram ──────────────────────────────────────────────────────────
// Page coordinate space estimated from viewport max: ~15000×8500

const SVG_W = 480
const PW    = 16000
const PH    = 8500
const SVG_H = SVG_W * (PH / PW)

const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)

const SELLO_COLORS: Record<string, string> = {
  'c_cuadro_resumen_usuarios_telcel': '#6a1b9a',
  'simbologia_anillo_rof':            '#00838f',
  'c_sello_fibra_optica_rof':         '#2e7d32',
  'c_sello_estandar_base_fo':         '#558b2f',
}

function PageDiagram({ titulo }: { titulo: string }) {
  const vp = VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.bounds

  // Norte: page-relative top-left
  const norteX0 = 0  + NORTE_TOPOLOGICO_ROF.dx0FromXmin
  const norteY0 = PH + NORTE_TOPOLOGICO_ROF.dy0FromYmax
  const norteX1 = 0  + NORTE_TOPOLOGICO_ROF.dx1FromXmin
  const norteY1 = PH + NORTE_TOPOLOGICO_ROF.dy1FromYmax

  return (
    <svg width={SVG_W} height={SVG_H}
      style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

      {/* Page outline */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H}
        fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
      <text x={2} y={8} fontSize={4.5} fontFamily="Arial" fill="#aaa">
        est. {PW}×{PH} · viewport scale 1:{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.viewScale}
      </text>

      {/* Viewport principal */}
      <rect x={sx(vp.x0)} y={fy(vp.y1)} width={sx(vp.x1 - vp.x0)} height={sy(vp.y1 - vp.y0)}
        fill="#fff9c4" fillOpacity={0.55} stroke="#f57f17" strokeWidth={1} />
      <text x={sx(vp.x0) + sx((vp.x1 - vp.x0) / 2)} y={fy(vp.y1) + sy((vp.y1 - vp.y0) / 2) - 4}
        textAnchor="middle" fontSize={5.5} fontFamily="Arial" fill="#e65100">
        viewport principal
      </text>
      <text x={sx(vp.x0) + sx((vp.x1 - vp.x0) / 2)} y={fy(vp.y1) + sy((vp.y1 - vp.y0) / 2) + 4}
        textAnchor="middle" fontSize={4} fontFamily="Arial" fill="#bf360c">
        {VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.sTipoPlano}
      </text>
      <text x={sx(vp.x0) + sx((vp.x1 - vp.x0) / 2)} y={fy(vp.y1) + sy((vp.y1 - vp.y0) / 2) + 10}
        textAnchor="middle" fontSize={3.8} fontFamily="Arial" fill="#bf360c">
        1:{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.viewScale} · geoms.bounds
      </text>

      {/* Sellos */}
      {SELLOS_DETALLES_ROF.map(s => {
        const b     = s.bounds
        const color = SELLO_COLORS[s.nombre] ?? '#555'
        return (
          <g key={s.nombre}>
            <rect x={sx(b.x0)} y={fy(b.y1)} width={sx(b.x1 - b.x0)} height={sy(b.y1 - b.y0)}
              fill={color} fillOpacity={0.15} stroke={color} strokeWidth={s.conditional ? 0.5 : 0.8}
              strokeDasharray={s.conditional ? '2 1' : undefined} />
            <text x={sx(b.x0) + sx((b.x1 - b.x0) / 2)}
              y={fy(b.y1) + Math.min(sy((b.y1 - b.y0) / 2), 9)}
              textAnchor="middle" fontSize={3.8} fontFamily="Arial" fill={color}>
              {s.nombre.replace(/^c_/, '')}{s.conditional ? ' [?]' : ''}
            </text>
          </g>
        )
      })}

      {/* Norte — narrow 1000-wide */}
      <rect x={sx(norteX0)} y={fy(norteY1)} width={sx(norteX1 - norteX0)} height={sy(norteY1 - norteY0)}
        fill="#1565c0" fillOpacity={0.15} stroke="#1565c0" strokeWidth={0.7} />
      <text x={sx(norteX0) + sx((norteX1 - norteX0) / 2)} y={fy(norteY1) + sy((norteY1 - norteY0) / 2)}
        textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill="#1565c0">
        norte
      </text>

      {/* Title preview */}
      <text x={SVG_W / 2} y={fy(0) - 3}
        textAnchor="middle" fontSize={4.5} fontFamily="Arial" fill="#c62828">
        {titulo.split('\n')[0]}
      </text>
      <text x={SVG_W - 2} y={SVG_H - 2} fontSize={4} fontFamily="Arial" fill="#bbb" textAnchor="end">
        est. {PW}×{PH} u
      </text>
    </svg>
  )
}

// ─── Default form data ────────────────────────────────────────────────────────

const DEFAULT_CENTRALES: CentralRofRecord[] = [
  { 'user!_nom_nodo': 'Nodo Central Oriente', 'user!_siglas': 'NCO' },
]

const DEFAULT_DATA: TituloTopologicoRofData = {
  programa:    'FTTH 2024',
  cableNombre: 'CAB-ROF-TOP-001',
  ncoNombre:   'Nodo Central Oriente',
  ncoSiglas:   'NCO',
  titleCtls:   buildTitleCtls(DEFAULT_CENTRALES),
  fecha:       '2024-03-15',
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoTopologicoRofShowcase() {
  const [data, setData] = useState<TituloTopologicoRofData>(DEFAULT_DATA)
  const titulo = creaTituloTopologicoRof(data)
  const flow   = describePlanFlowTopologicoRof()

  const set = (field: keyof TituloTopologicoRofData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoTopologicoRof</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Plano topológico ROF · familia detalles_construccion
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="CFactoryDetalles"    size="small" color="default" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Alert severity="warning" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          <strong>Importante:</strong> distinto de <code>CPlanoTopologico</code> (adiciones_layout,
          cobre). Este extiende <code>CFactoryDetalles</code> y genera planos topológicos ROF
          con viewport a escala 1:10000.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>Jerarquía</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          CFactoryPlanos<br />
          └─ CFactoryDetalles<br />
          &nbsp;&nbsp;&nbsp;├─ (otros planos detalles)<br />
          &nbsp;&nbsp;&nbsp;└─ <strong>CPlanoTopologicoRof</strong>
        </Box>

        <Alert severity="info" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          <code>AddSellosDetalles()</code> (ROF, llamado desde <code>genera_plano</code>) ≠
          <code>AddSellosPlanoDetalles()</code> (base, empty hook). Son dos métodos distintos —
          el ROF llama ambos: el empty hook vía super y el suyo propio.
        </Alert>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>genera_plano() — flujo completo</Typography>
        <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #a5d6a7', p: 1, borderRadius: 1, mb: 1.5 }}>
          {flow.map((step, i) => (
            <Typography key={i} variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: 9, lineHeight: 1.55,
                fontWeight: step.includes('AddSellosDetalles') || step.includes('layout_view') ? 700 : undefined,
                color: step.includes('AddSellosDetalles') ? '#1b5e20' :
                  step.includes('layout_view') ? '#e65100' : undefined }}>
              {step}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>crea_titulo() — 6 campos</Typography>
        {(
          [
            ['programa',    'Programa (+ año)'],
            ['cableNombre', 'Cable nombre'],
            ['ncoNombre',   'NCO nombre'],
            ['ncoSiglas',   'NCO siglas'],
            ['fecha',       'Fecha proyecto'],
          ] as [keyof TituloTopologicoRofData, string][]
        ).map(([field, label]) => (
          <TextField key={field} size="small" fullWidth label={label}
            value={data[field]} onChange={set(field)} sx={{ mb: 0.75 }} />
        ))}
        <TextField size="small" fullWidth label="titleCtls (nom_nodo(siglas)\\n)"
          multiline rows={2}
          value={data.titleCtls} onChange={set('titleCtls')} sx={{ mb: 0.75 }} />

        <Box sx={{ bgcolor: '#fce4ec', border: '1px solid #e57373', p: 1, borderRadius: 1, mt: 0.5 }}>
          <Typography variant="caption"
            sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 9.5, lineHeight: 1.5 }}>
            {titulo}
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 360 }}>
        <Typography variant="subtitle2" gutterBottom>
          Diagrama de página — viewport ancho 1:10000
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Dashed = condicional. Viewport mapeado con <code>geoms.bounds</code> (vs <code>current_view_bounds</code>).
        </Typography>
        <PageDiagram titulo={titulo} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Sellos y viewport — parámetros clave
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Elemento</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Bounds</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SELLOS_DETALLES_ROF.map(s => (
              <TableRow key={s.nombre}>
                <TableCell sx={{ fontSize: 9.5, py: 0.3, fontFamily: 'monospace' }}>
                  {s.nombre.replace(/^c_/, '')}
                </TableCell>
                <TableCell sx={{ fontSize: 9, py: 0.3, color: '#555' }}>
                  {s.bounds.x0},{s.bounds.y0}→{s.bounds.x1},{s.bounds.y1}
                </TableCell>
                <TableCell sx={{ fontSize: 9, py: 0.3 }}>
                  {s.conditional ? <Chip label="condicional" size="small" color="warning" sx={{ height: 14, fontSize: 8 }} /> : '—'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontSize: 9.5, py: 0.3, fontFamily: 'monospace', fontWeight: 700 }}>
                viewport_principal
              </TableCell>
              <TableCell sx={{ fontSize: 9, py: 0.3, color: '#555' }}>
                {VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.bounds.x0},{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.bounds.y0}
                →{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.bounds.x1},{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.bounds.y1}
              </TableCell>
              <TableCell sx={{ fontSize: 9, py: 0.3, color: '#e65100' }}>
                1:{VIEWPORT_PRINCIPAL_TOPOLOGICO_ROF.viewScale} · geoms.bounds
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Typography variant="subtitle2" gutterBottom>
          Comparativa crea_titulo() vs CFactoryDetalles base
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Campo</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>CFactoryDetalles (base)</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5, bgcolor: '#fff3e0' }}>CPlanoTopologicoRof (ROF)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['línea fija',     '"PLANO DE DETALLES CENTRAL"',  '"PLANO TOPOLOGICO" ←'],
              ['NCO orden',      '2ª línea (antes del cable)',    '4ª línea (después del cable) ←'],
              ['geo fields',     'estado, municipio, trayectoria','no — sustituidos por titleCtls ←'],
              ['titleCtls',      'no',                            'sí (centrales de la ruta) ←'],
              ['fecha proyecto', 'no',                            'sí ←'],
              ['.uppercase()',   'sí',                            'sí (igual)'],
            ].map(([field, base, rof]) => (
              <TableRow key={field}>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, fontWeight: 600 }}>{field}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{base}</TableCell>
                <TableCell sx={{
                  fontSize: 9.5, py: 0.4,
                  bgcolor: rof.endsWith('←') ? '#fff8e1' : undefined,
                  fontWeight: rof.endsWith('←') ? 700 : undefined,
                  color: rof.endsWith('←') ? '#e65100' : undefined,
                }}>{rof}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
