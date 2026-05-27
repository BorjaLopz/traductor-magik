import { useState } from 'react'
import {
  Alert, Box, Chip, Divider, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material'
import {
  type TituloRofData,
  type CentralRofRecord,
  creaTituloRof,
  buildTitleCtls,
  MARCO_CONFIG_ROF,
  VIEWPORT_OFFSET_ROF,
  TITULO_OFFSET_ROF,
  SELLOS_ROF,
  describePlanFlowRof,
} from '../models/CPlanoEsquematicoDeprincipalesRof'

// ─── SVG page diagram ──────────────────────────────────────────────────────────
// ROF uses 7×3 marco. Same coordinate space as FTTH.

const SVG_W = 480
const PW    = 16000
const PH    = 8700
const SVG_H = SVG_W * (PH / PW)

const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)

const SELLO_COLORS: Record<string, string> = {
  'c_cuadro_resumen_usuarios_telcel': '#6a1b9a',
  'c_secuencia_trabajo_rof':          '#1565c0',
  'c_notas_constructor_rof':          '#7b1fa2',
  'simbologia_anillo_rof':            '#00838f',
  'c_sello_fibra_optica_rof':         '#2e7d32',
  'c_sello_estandar_base_fo':         '#558b2f',
  'c_resumen_del_proyecto_rof':       '#ad1457',
}

function PageDiagram({ titulo }: { titulo: string }) {
  // Viewport: marco-relative offsets applied to (0, 0, PW, PH)
  const vpX0 = 0  + VIEWPORT_OFFSET_ROF.dx0
  const vpY0 = 0  + VIEWPORT_OFFSET_ROF.dy0
  const vpX1 = PW + VIEWPORT_OFFSET_ROF.dx1
  const vpY1 = PH + VIEWPORT_OFFSET_ROF.dy1

  // Titulo: marco-relative
  const ttX0 = PW + TITULO_OFFSET_ROF.dxFromMax
  const ttY0 = 0  + TITULO_OFFSET_ROF.dyFromMin
  const ttX1 = PW + TITULO_OFFSET_ROF.dxToMax
  const ttY1 = 0  + TITULO_OFFSET_ROF.dyToMax

  return (
    <svg width={SVG_W} height={SVG_H}
      style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

      {/* Page outline */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H}
        fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
      <text x={2} y={8} fontSize={4.5} fontFamily="Arial" fill="#aaa">
        marco largo={MARCO_CONFIG_ROF.largo}, alto={MARCO_CONFIG_ROF.alto} · {PW}×{PH} est.
      </text>

      {/* Viewport principal */}
      <rect x={sx(vpX0)} y={fy(vpY1)} width={sx(vpX1 - vpX0)} height={sy(vpY1 - vpY0)}
        fill="#fff9c4" fillOpacity={0.5} stroke="#f57f17" strokeWidth={1} />
      <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2)}
        textAnchor="middle" fontSize={5.5} fontFamily="Arial" fill="#e65100">
        viewport principal
      </text>
      <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2) + 7}
        textAnchor="middle" fontSize={3.8} fontFamily="Arial" fill="#bf360c">
        {VIEWPORT_OFFSET_ROF.sTipoPlano}
      </text>

      {/* Sellos */}
      {SELLOS_ROF.map(entry => {
        const b     = entry.bounds
        const color = SELLO_COLORS[entry.nombre] ?? '#555'
        return (
          <g key={entry.nombre}>
            <rect x={sx(b.x0)} y={fy(b.y1)} width={sx(b.x1 - b.x0)} height={sy(b.y1 - b.y0)}
              fill={color} fillOpacity={0.15} stroke={color} strokeWidth={entry.conditional ? 0.5 : 0.8}
              strokeDasharray={entry.conditional ? '2 1' : undefined} />
            <text x={sx(b.x0) + sx((b.x1 - b.x0) / 2)}
              y={fy(b.y1) + Math.min(sy((b.y1 - b.y0) / 2), 9)}
              textAnchor="middle" fontSize={3.8} fontFamily="Arial" fill={color}>
              {entry.nombre.replace(/^c_/, '')}
              {entry.conditional ? ' [?]' : ''}
            </text>
          </g>
        )
      })}

      {/* Titulo */}
      <rect x={sx(ttX0)} y={fy(ttY1)} width={sx(ttX1 - ttX0)} height={sy(ttY1 - ttY0)}
        fill="#c62828" fillOpacity={0.12} stroke="#c62828" strokeWidth={0.7} />
      <text x={sx(ttX0) + sx((ttX1 - ttX0) / 2)} y={fy(ttY1) + sy((ttY1 - ttY0) / 2)}
        textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill="#c62828">
        titulo (rel)
      </text>

      {/* Norte */}
      <rect x={sx(0)} y={fy(PH)} width={sx(4000)} height={sy(1500)}
        fill="#1565c0" fillOpacity={0.10} stroke="#1565c0" strokeWidth={0.6} />
      <text x={sx(2000)} y={fy(PH) + sy(750)}
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

// ─── Diff table ───────────────────────────────────────────────────────────────

const DIFF_ROWS = [
  { feature: 'marco largo/alto',          base: '4 / 2',                   ftth: '7 / 3',                     rof: '7 / 3 (igual a FTTH)' },
  { feature: 'num. sellos',               base: '6 sellos',                ftth: '1 (abs)',                   rof: '7 ROF-específicos (2 cond.) ←' },
  { feature: 'AddTitulo bounds',          base: 'rel. a marco (xmax-2800)', ftth: 'absoluto (12892,459…)',      rof: 'rel. a marco (xmax-2200) ←' },
  { feature: 'crea_titulo campos',        base: 'central nombre',          ftth: '8 campos GIS',              rof: 'programa+cable+NCO+ctls+fecha ←' },
  { feature: 'viewport bounds',           base: 'rel. offsets (+3000)',     ftth: 'absoluto (5225…15189)',      rof: 'rel. offsets (+3000) igual base ←' },
  { feature: 'map_viewport_on_map_view',  base: 'no',                       ftth: 'sí (local var)',            rof: 'sí (.oViewMapperPlugin field) ←' },
  { feature: 'genera_plano: publicalo',   base: 'no',                       ftth: 'no',                        rof: 'sí — ÚNICO en todos ←' },
  { feature: 'activa_Layout_series',      base: 'sí (1:1800)',              ftth: 'sí (sin escala)',           rof: 'no ←' },
  { feature: 'cables_esquema_sigp return',base: 'n/a',                     ftth: 'dual (geom + GIS)',         rof: 'single (GIS records) ←' },
  { feature: 'tabla equivalencias',       base: 'sí',                      ftth: 'sí',                        rof: 'comentada ←' },
]

// ─── Default form data ────────────────────────────────────────────────────────

const DEFAULT_CENTRALES: CentralRofRecord[] = [
  { 'user!_nom_nodo': 'Nodo Central Oriente', 'user!_siglas': 'NCO' },
  { 'user!_nom_nodo': 'Nodo Central Norte',   'user!_siglas': 'NCN' },
]

const DEFAULT_DATA: TituloRofData = {
  programa:    'FTTH 2024',
  cableNombre: 'CAB-ROF-001',
  ncoNombre:   'Nodo Central Oriente',
  ncoSiglas:   'NCO',
  titleCtls:   buildTitleCtls(DEFAULT_CENTRALES),
  fecha:       '2024-03-15',
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoEsquematicoDeprincipalesRofShowcase() {
  const [data, setData] = useState<TituloRofData>(DEFAULT_DATA)
  const titulo = creaTituloRof(data)
  const flow   = describePlanFlowRof()

  const set = (field: keyof TituloRofData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoEsquematicoDeprincipalesRof</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Variante ROF · publicalo único · 7 sellos · sin layout series
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="5 diferencias"       size="small" color="warning" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Alert severity="warning" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          <strong>Único en todos los hermanos:</strong> llama{' '}
          <code>genp.publicalo(engine)</code> en vez de buffer + layout series.
          También es el único con 7 sellos y retorno simple en{' '}
          <code>cables_esquema_sigp()</code>.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>Jerarquía</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          CFactoryPlanos<br />
          ├─ CPlanoEsquematicoDeprincipales<br />
          │&nbsp;&nbsp;&nbsp;└─ CPlanoEsquematicoDeprincipalesFal<br />
          ├─ CPlanoEsquematicoDeprincipalesAcometida<br />
          ├─ CPlanoEsquematicoDeprincipalesFtth<br />
          └─ <strong>CPlanoEsquematicoDeprincipalesRof</strong>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>genera_plano() — flujo único</Typography>
        <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #ffe0b2', p: 1, borderRadius: 1, mb: 1.5 }}>
          {flow.map((step, i) => (
            <Typography key={i} variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: 9.5, lineHeight: 1.5,
                fontWeight: step.includes('publicalo') ? 700 : undefined,
                color: step.includes('publicalo') ? '#e65100' : undefined }}>
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
          ] as [keyof TituloRofData, string][]
        ).map(([field, label]) => (
          <TextField key={field} size="small" fullWidth label={label}
            value={data[field]} onChange={set(field)} sx={{ mb: 0.75 }} />
        ))}

        <TextField size="small" fullWidth label="titleCtls (nom_nodo(siglas)\\n por central)"
          multiline rows={3}
          value={data.titleCtls} onChange={set('titleCtls')} sx={{ mb: 0.75 }} />

        <Box sx={{ bgcolor: '#fce4ec', border: '1px solid #e57373', p: 1, borderRadius: 1, mt: 0.5, mb: 1.5 }}>
          <Typography variant="caption"
            sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 9.5, lineHeight: 1.5 }}>
            {titulo}
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 360 }}>
        <Typography variant="subtitle2" gutterBottom>
          Diagrama de página — formato 7×3 con 7 sellos en franja izquierda
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Dashed = sello condicional. El viewport usa offsets relativos al marco (igual que base).
        </Typography>
        <PageDiagram titulo={titulo} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Sellos ROF ({SELLOS_ROF.length} total · {SELLOS_ROF.filter(s => s.conditional).length} condicionales)
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Sello</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Bounds (x0,y0→x1,y1)</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Cond.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SELLOS_ROF.map(s => (
              <TableRow key={s.nombre}>
                <TableCell sx={{ fontSize: 9.5, py: 0.3, fontFamily: 'monospace' }}>
                  {s.nombre.replace(/^c_/, '')}
                </TableCell>
                <TableCell sx={{ fontSize: 9, py: 0.3, color: '#555' }}>
                  {s.bounds.x0},{s.bounds.y0}→{s.bounds.x1},{s.bounds.y1}
                </TableCell>
                <TableCell sx={{ fontSize: 9, py: 0.3 }}>
                  {s.conditional ? <Chip label="si" size="small" color="warning" sx={{ height: 14, fontSize: 8 }} /> : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="subtitle2" gutterBottom>Comparativa ROF vs hermanos FTTH y Base</Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Feature</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Base</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>FTTH</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5, bgcolor: '#fff3e0' }}>ROF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DIFF_ROWS.map(row => (
              <TableRow key={row.feature}>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, fontWeight: 600 }}>{row.feature}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{row.base}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{row.ftth}</TableCell>
                <TableCell sx={{
                  fontSize: 9.5, py: 0.4,
                  bgcolor: row.rof.endsWith('←') ? '#fff8e1' : undefined,
                  fontWeight: row.rof.endsWith('←') ? 700 : undefined,
                  color: row.rof.endsWith('←') ? '#e65100' : undefined,
                }}>{row.rof}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
