import { useState } from 'react'
import {
  Alert, Box, Chip, Divider, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material'
import {
  type TituloFtthData,
  creaTituloFtth,
  MARCO_CONFIG_FTTH,
  TITULO_BOUNDS_FTTH,
  SELLO_FTTH,
  VIEWPORT_FTTH,
  SERIES_CONFIG_FTTH,
} from '../models/CPlanoEsquematicoDeprincipalesFtth'

// ─── SVG page diagram ──────────────────────────────────────────────────────────
// FTTH uses a 7×3 marco format. Coordinates extend to x≈15200, y≈8500.

const SVG_W = 480
const PW    = 16000   // estimated FTTH page width (viewport extends to 15189)
const PH    = 8700    // slightly taller than max y=8435
const SVG_H = SVG_W * (PH / PW)

const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)

function PageDiagram({ titulo }: { titulo: string }) {
  const vp = VIEWPORT_FTTH.bounds
  const sl = SELLO_FTTH.bounds
  const tt = TITULO_BOUNDS_FTTH

  return (
    <svg width={SVG_W} height={SVG_H}
      style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

      {/* Page outline */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H}
        fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
      <text x={2} y={8} fontSize={4.5} fontFamily="Arial" fill="#aaa">
        marco largo={MARCO_CONFIG_FTTH.largo}, alto={MARCO_CONFIG_FTTH.alto} · coords to {PW}×{PH}
      </text>

      {/* Viewport principal */}
      <rect x={sx(vp.x0)} y={fy(vp.y1)} width={sx(vp.x1 - vp.x0)} height={sy(vp.y1 - vp.y0)}
        fill="#fff9c4" fillOpacity={0.6} stroke="#f57f17" strokeWidth={1} />
      <text x={sx(vp.x0) + sx((vp.x1 - vp.x0) / 2)} y={fy(vp.y1) + sy((vp.y1 - vp.y0) / 2)}
        textAnchor="middle" fontSize={5.5} fontFamily="Arial" fill="#e65100">
        viewport principal
      </text>
      <text x={sx(vp.x0) + sx((vp.x1 - vp.x0) / 2)} y={fy(vp.y1) + sy((vp.y1 - vp.y0) / 2) + 7}
        textAnchor="middle" fontSize={4} fontFamily="Arial" fill="#bf360c">
        {VIEWPORT_FTTH.sTipoPlano}
      </text>

      {/* Sello c_sello_estandar_base_fo */}
      <rect x={sx(sl.x0)} y={fy(sl.y1)} width={sx(sl.x1 - sl.x0)} height={sy(sl.y1 - sl.y0)}
        fill="#2e7d32" fillOpacity={0.13} stroke="#2e7d32" strokeWidth={0.7} />
      <text x={sx(sl.x0) + sx((sl.x1 - sl.x0) / 2)} y={fy(sl.y1) + sy((sl.y1 - sl.y0) / 2)}
        textAnchor="middle" fontSize={4} fontFamily="Arial" fill="#2e7d32">
        sello_estandar_base_fo
      </text>

      {/* Titulo box (absolute, right strip) */}
      <rect x={sx(tt.x0)} y={fy(tt.y1)} width={sx(tt.x1 - tt.x0)} height={sy(tt.y1 - tt.y0)}
        fill="#c62828" fillOpacity={0.12} stroke="#c62828" strokeWidth={0.7} />
      <text x={sx(tt.x0) + sx((tt.x1 - tt.x0) / 2)} y={fy(tt.y1) + sy((tt.y1 - tt.y0) / 2)}
        textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill="#c62828">
        titulo (abs)
      </text>

      {/* Norte indicator */}
      <rect x={sx(0)} y={fy(PH)} width={sx(4000)} height={sy(1500)}
        fill="#1565c0" fillOpacity={0.10} stroke="#1565c0" strokeWidth={0.6} />
      <text x={sx(2000)} y={fy(PH) + sy(750)}
        textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill="#1565c0">
        norte
      </text>

      {/* Titulo strip label */}
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
  { feature: 'marco largo/alto', base: '4 / 2', fal: '4 / 2 (heredado)', acometida: '4 / 2 (heredado)', ftth: '7 / 3 ← ÚNICO' },
  { feature: 'AddTitulo bounds', base: 'relativo al marco', fal: 'heredado', acometida: 'relativo al marco', ftth: 'absoluto (12892,459…)' },
  { feature: 'crea_titulo fuente', base: 'central nombre', fal: 'heredado', acometida: 'central nombre', ftth: 'gen_planos plugin (8 campos)' },
  { feature: 'num. sellos', base: '6 sellos', fal: '6 (heredados)', acometida: '1 (absoluto)', ftth: '1 (idéntico a acometida)' },
  { feature: 'viewport bounds', base: 'relativo (offsets)', fal: 'heredado', acometida: 'absoluto (2346…8749)', ftth: 'absoluto (5225…15189)' },
  { feature: 'map_viewport_on_map_view', base: 'no', fal: 'no', acometida: 'no', ftth: 'sí ← ÚNICO' },
  { feature: 'view_scale en series', base: '1:1800', fal: '1:1800', acometida: '1:10', ftth: 'ninguna (comentada)' },
  { feature: 'busca_bastidores', base: 'geometría visible', fal: 'heredado', acometida: 'geometría visible', ftth: 'busca_en_conectividad ← ÚNICO' },
]

// ─── Default form data ────────────────────────────────────────────────────────

const DEFAULT_DATA: TituloFtthData = {
  cableNombre:    'CAB-FTTH-001',
  programa:       'FTTH 2024',
  subprograma:    'Ruta Centro-Norte',
  ncoNombre:      'Nodo Central Oriente',
  ncoSiglas:      'NCO',
  estado:         'Ciudad de México',
  municipio:      'Cuauhtémoc',
  numTrayectoria: 'T-001',
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoEsquematicoDeprincipalesFtthShowcase() {
  const [data, setData] = useState<TituloFtthData>(DEFAULT_DATA)
  const titulo = creaTituloFtth(data)

  const set = (field: keyof TituloFtthData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoEsquematicoDeprincipalesFtth</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Variante FTTH · 4 diferencias únicas vs hermanos
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="4 diferencias"       size="small" color="warning" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Alert severity="warning" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          <strong>4 diferencias únicas</strong> vs todos los demás hermanos:{' '}
          marco 7×3, título desde <code>gen_planos</code>, viewport más ancho,
          y <code>map_viewport_on_map_view</code> activado.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>Jerarquía</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          CFactoryPlanos<br />
          ├─ CPlanoEsquematicoDeprincipales<br />
          │&nbsp;&nbsp;&nbsp;└─ CPlanoEsquematicoDeprincipalesFal<br />
          ├─ CPlanoEsquematicoDeprincipalesAcometida<br />
          └─ <strong>CPlanoEsquematicoDeprincipalesFtth</strong>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: 10 }}>
          En Magik los cuatro extienden <code>:c_factory_planos</code> directamente.
          En TypeScript se modelan de la misma manera.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          crea_titulo() — 8 campos del plugin gen_planos
        </Typography>

        {(
          [
            ['cableNombre',    'Cable nombre'],
            ['programa',       'Programa (+ año)'],
            ['subprograma',    'Subprograma (job_title)'],
            ['ncoNombre',      'NCO nombre'],
            ['ncoSiglas',      'NCO siglas'],
            ['estado',         'Estado'],
            ['municipio',      'Municipio'],
            ['numTrayectoria', 'Num. trayectoria'],
          ] as [keyof TituloFtthData, string][]
        ).map(([field, label]) => (
          <TextField key={field} size="small" fullWidth label={label}
            value={data[field]} onChange={set(field)} sx={{ mb: 0.75 }} />
        ))}

        <Box sx={{ bgcolor: '#fce4ec', border: '1px solid #e57373', p: 1, borderRadius: 1, mt: 0.5, mb: 1.5 }}>
          <Typography variant="caption"
            sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 9.5, lineHeight: 1.5 }}>
            {titulo}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Constantes de layout</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: 9, mb: 1 }}>
          MARCO largo={MARCO_CONFIG_FTTH.largo}, alto={MARCO_CONFIG_FTTH.alto}<br />
          SELLO {SELLO_FTTH.bounds.x0},{SELLO_FTTH.bounds.y0}→{SELLO_FTTH.bounds.x1},{SELLO_FTTH.bounds.y1}<br />
          VP {VIEWPORT_FTTH.bounds.x0},{VIEWPORT_FTTH.bounds.y0}→{VIEWPORT_FTTH.bounds.x1},{VIEWPORT_FTTH.bounds.y1}<br />
          TITULO {TITULO_BOUNDS_FTTH.x0},{TITULO_BOUNDS_FTTH.y0}→{TITULO_BOUNDS_FTTH.x1},{TITULO_BOUNDS_FTTH.y1}<br />
          SERIES buffer={SERIES_CONFIG_FTTH.bufferDistance} · sin escala
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 360 }}>
        <Typography variant="subtitle2" gutterBottom>
          Diagrama de página — formato 7×3 (más ancho que los otros)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          El viewport ocupa casi todo el ancho; sello y título son tiras laterales.
        </Typography>
        <PageDiagram titulo={titulo} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Comparativa con los otros 3 hermanos
        </Typography>
        <Table size="small" sx={{ fontSize: 10 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Feature</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Base</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>FAL</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5 }}>Acometida</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 10, py: 0.5, bgcolor: '#fff3e0' }}>FTTH</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DIFF_ROWS.map(row => (
              <TableRow key={row.feature}>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, fontWeight: 600 }}>{row.feature}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{row.base}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{row.fal}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#666' }}>{row.acometida}</TableCell>
                <TableCell sx={{
                  fontSize: 9.5, py: 0.4,
                  bgcolor: row.ftth.includes('←') ? '#fff8e1' : undefined,
                  fontWeight: row.ftth.includes('←') ? 700 : undefined,
                  color: row.ftth.includes('←') ? '#e65100' : undefined,
                }}>{row.ftth}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}
