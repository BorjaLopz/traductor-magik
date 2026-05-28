import { useState } from 'react'
import {
  Box, Chip, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  creaTitulo,
  buildBastidorCableData,
  describePlanFlow,
  NORTE_OFFSET,
  TITULO_OFFSET,
  SELLO_ACOMETIDA,
  VIEWPORT_ACOMETIDA,
  SERIES_CONFIG_ACOMETIDA,
  type BastidorRecord,
} from '../models/CPlanoEsquematicoDeprincipalesAcometida'
import { PAGE_SIZE } from '../models/CFactoryPlanos'
import { type CableRecord } from '../models/CPlanoEsquematicoDeprincipales'

const PW = PAGE_SIZE.width
const PH = PAGE_SIZE.height

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const SVG_W = 420
const SVG_H = SVG_W * (PH / PW)
const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)   // flip y (Magik y=0 bottom, SVG y=0 top)

const MARCO = { xmin: 0, ymin: 0, xmax: PW, ymax: PH }

function PageDiagram({ centralNombre }: { centralNombre: string }) {
  const titulo = creaTitulo(centralNombre || 'CTL_NOMBRE')

  // Norte
  const nX0 = MARCO.xmin + NORTE_OFFSET.dx0
  const nY0 = MARCO.ymax + NORTE_OFFSET.dy0
  const nX1 = MARCO.xmin + NORTE_OFFSET.dx1
  const nY1 = MARCO.ymax + NORTE_OFFSET.dy1

  // Viewport (absolute)
  const { x0: vpX0, y0: vpY0, x1: vpX1, y1: vpY1 } = VIEWPORT_ACOMETIDA.bounds

  // Titulo (marco-relative, same as base)
  const titX0 = MARCO.xmax + TITULO_OFFSET.dxFromMax
  const titY0 = MARCO.ymin + TITULO_OFFSET.dyFromMin
  const titX1 = MARCO.xmax + TITULO_OFFSET.dxToMax
  const titY1 = MARCO.ymin + TITULO_OFFSET.dyToMax

  // Single sello
  const { x0: sX0, y0: sY0, x1: sX1, y1: sY1 } = SELLO_ACOMETIDA.bounds

  return (
    <Box>
      <svg width={SVG_W} height={SVG_H}
        style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>

        {/* Page background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

        {/* Marco outline */}
        <rect x={sx(MARCO.xmin)} y={fy(MARCO.ymax)}
          width={sx(MARCO.xmax - MARCO.xmin)} height={sy(MARCO.ymax - MARCO.ymin)}
          fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
        <text x={2} y={10} fontSize={6} fontFamily="Arial" fill="#aaa">
          marco (largo=4, alto=2)
        </text>

        {/* Norte */}
        <rect x={sx(nX0)} y={fy(nY1)} width={sx(nX1 - nX0)} height={sy(nY1 - nY0)}
          fill="#e3f2fd" fillOpacity={0.7} stroke="#1565c0" strokeWidth={0.8} />
        <text x={sx(nX0) + 2} y={fy(nY1) + 8} fontSize={5.5} fontFamily="Arial" fill="#1565c0">
          Norte
        </text>

        {/* Viewport principal (absolute, acometida) */}
        <rect x={sx(vpX0)} y={fy(vpY1)} width={sx(vpX1 - vpX0)} height={sy(vpY1 - vpY0)}
          fill="#fff9c4" fillOpacity={0.7} stroke="#f57f17" strokeWidth={1.2} />
        <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2)}
          textAnchor="middle" fontSize={6} fontFamily="Arial" fill="#e65100">
          viewport principal
        </text>
        <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2) + 9}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#888">
          {VIEWPORT_ACOMETIDA.sTipoPlano}
        </text>
        <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2) + 17}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#999">
          name="{VIEWPORT_ACOMETIDA.name}"
        </text>

        {/* Single sello */}
        <rect x={sx(sX0)} y={fy(sY1)} width={sx(sX1 - sX0)} height={sy(sY1 - sY0)}
          fill="#2e7d32" fillOpacity={0.15} stroke="#2e7d32" strokeWidth={0.8} />
        <text x={sx(sX0) + sx((sX1 - sX0) / 2)} y={fy(sY1) + Math.min(sy((sY1 - sY0) / 2), 10)}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#2e7d32">
          sello_estandar_base_fo
        </text>

        {/* Titulo */}
        <rect x={sx(titX0)} y={fy(titY1)} width={sx(titX1 - titX0)} height={sy(titY1 - titY0)}
          fill="#fce4ec" fillOpacity={0.7} stroke="#c62828" strokeWidth={0.8} />
        <text x={sx(titX0) + sx((titX1 - titX0) / 2)} y={fy(titY1) + 8}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#c62828">
          {titulo.split('\n')[0]}
        </text>

        {/* Page annotation */}
        <text x={SVG_W - 2} y={SVG_H - 2} fontSize={5} fontFamily="Arial" fill="#aaa" textAnchor="end">
          {PW} × {PH} u
        </text>
      </svg>
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', fontSize: 10 }}>
        Vista conceptual · acometida: 1 sello + viewport absoluto (sin map_viewport_on_map_view)
      </Typography>
    </Box>
  )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CABLE: CableRecord = {
  getGrupos: () => [
    { fibras: new Array(12).fill(null) },
    { fibras: new Array(12).fill(null) },
  ],
}
const MOCK_BASTIDOR: BastidorRecord = {
  'user!_central':         'CENTRAL REFORMA',
  obtenerConexionDeCables: () => ({ keys: { anElement: () => MOCK_CABLE } }),
  obtenerNumeroDePiso:     () => '2',
  obtenerTipoSala:         () => 'SALA B',
  obtenerFila:             () => 'F-03',
  obtenerPosBastidor:      () => 'B-07',
}

// ─── Diff table: acometida vs base variant ────────────────────────────────────

const DIFF_ROWS = [
  {
    aspecto:    'cables_esquema_sigp()',
    base:       'Retorna 1 valor: PoCable (sheath)',
    acometida:  'Retorna 2 valores: (cablesEsquema, cablesGis)\nFiltro extra: app_type = :centre_line',
  },
  {
    aspecto:    'add_sellos()',
    base:       '6 sellos + tabla equiv.\n(mix absolutos/relativos a marco)',
    acometida:  '1 sello: c_sello_estandar_base_fo\n(267,279)→(3837,3019) absoluto',
  },
  {
    aspecto:    'add_viewport_principal()',
    base:       'Relativo a oMarco + map_viewport_on_map_view()\nsTipoPlano: DIAGRAMA_ESQUEMATICO_PRINCIPALES',
    acometida:  'Absoluto: (2346,826)→(8749,5716)\nSIN map_viewport_on_map_view\nsTipoPlano: DIAGRAMA_ESQUEMA_PRINCIPALES\nname="mapa"',
  },
  {
    aspecto:    'genera_plano()',
    base:       'genp.publicalo(oEngine)\nbuffer: N/A',
    acometida:  'trail.clear() + gs.buffer(10)\nset_trail_from_geometry(buffer)',
  },
  {
    aspecto:    'activa_Layout_series()',
    base:       'scale 1:1800\nangle_area_automatic=false\nplano_ruta?=true',
    acometida:  'reset() primero\nscale 1:10\nangle_area_automatic=true\nplano_esquematico_ftth?=true',
  },
  {
    aspecto:    'AddTitulo / crea_titulo',
    base:       'Idéntico',
    acometida:  'Idéntico (mismos offsets y texto)',
  },
  {
    aspecto:    'add_marco / AddNorte',
    base:       'Idéntico',
    acometida:  'Idéntico (largo=4, alto=2)',
  },
] as const

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoEsquematicoDeprincipalesAcometidaShowcase() {
  const [centralNombre, setCentralNombre] = useState('REFORMA')

  const bastidorData = buildBastidorCableData(MOCK_BASTIDOR, MOCK_CABLE)
  const titulo        = creaTitulo(centralNombre || 'CTL_NOMBRE')
  const planFlow      = describePlanFlow()

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 290, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoEsquematicoDeprincipalesAcometida</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Variante acometida · extiende CFactoryPlanos · hermana de CPlanoEsquematicoDeprincipales
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Slots</Typography>
        {([
          ['_oEngine',     'unknown', 'Engine de ruta (privado)'],
          ['_oBufferRuta', 'unknown', 'Buffer gs.buffer(10) (privado)'],
          ['oMarco',       'unknown', 'c_marco del plano'],
        ] as const).map(([s, t, d]) => (
          <Box key={s} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s}</Typography>
            <Typography variant="caption" color="text.secondary"> : {t} — {d}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>crea_titulo()</Typography>
        <TextField size="small" fullWidth label="Nombre central"
          value={centralNombre} onChange={e => setCentralNombre(e.target.value)}
          sx={{ mb: 1 }} />
        <Box sx={{ bgcolor: '#fce4ec', border: '1px solid #e57373', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 10 }}>
            {titulo}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>activa_Layout_series — config</Typography>
        <Box sx={{ bgcolor: '#e8eaf6', border: '1px solid #7986cb', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          scale: 1:{SERIES_CONFIG_ACOMETIDA.scale}<br />
          tilingMethod: "{SERIES_CONFIG_ACOMETIDA.tilingMethod}"<br />
          angleAreaAutomatic: {String(SERIES_CONFIG_ACOMETIDA.angleAreaAutomatic)}<br />
          propertyKey: "{SERIES_CONFIG_ACOMETIDA.propertyKey}"<br />
          bufferDistance: {SERIES_CONFIG_ACOMETIDA.bufferDistance} u (gs.buffer)
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>genera_plano() — flujo</Typography>
        <Box sx={{ bgcolor: '#f3e5f5', border: '1px solid #ce93d8', p: 1, borderRadius: 1 }}>
          {planFlow.map((step, i) => (
            <Typography key={i} variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: 10, mb: 0.3 }}>
              {step}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 380 }}>
        <Typography variant="subtitle2" gutterBottom>Diagrama de layout</Typography>
        <PageDiagram centralNombre={centralNombre} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Diferencias vs CPlanoEsquematicoDeprincipales (base)
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              {['Aspecto', 'Base', 'Acometida'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 'bold', fontSize: 11, bgcolor: '#f5f5f5' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {DIFF_ROWS.map(row => (
              <TableRow key={row.aspecto}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold', verticalAlign: 'top', color: '#555' }}>
                  {row.aspecto}
                </TableCell>
                <TableCell sx={{ fontSize: 10, verticalAlign: 'top', color: '#888', whiteSpace: 'pre-wrap' }}>
                  {row.base}
                </TableCell>
                <TableCell sx={{ fontSize: 10, verticalAlign: 'top', fontWeight: row.acometida !== 'Idéntico (mismos offsets y texto)' && row.acometida !== 'Idéntico (largo=4, alto=2)' ? 'bold' : 'normal', whiteSpace: 'pre-wrap', color: row.acometida.startsWith('Idéntico') ? '#888' : '#1b5e20' }}>
                  {row.acometida}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>add_sellos() — un único sello</Typography>
        <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #4caf50', p: 1.5, borderRadius: 1, mb: 2, fontFamily: 'monospace', fontSize: 11 }}>
          nombre: {SELLO_ACOMETIDA.nombre}<br />
          bounds: ({SELLO_ACOMETIDA.bounds.x0},{SELLO_ACOMETIDA.bounds.y0})→({SELLO_ACOMETIDA.bounds.x1},{SELLO_ACOMETIDA.bounds.y1})<br />
          tipo: <Chip label="absoluta" size="small" sx={{ fontSize: 9, height: 16 }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>buildBastidorCableData() (compartida con base)</Typography>
        {bastidorData ? (
          <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #4caf50', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
            {Object.entries(bastidorData).filter(([k]) => k !== 'loCable' && k !== 'rme').map(([k, v]) => (
              <Box key={k}><span style={{ color: '#888' }}>{k}: </span><b>{String(v)}</b></Box>
            ))}
            <Box sx={{ mt: 0.5, color: '#4527a0', fontSize: 10 }}>
              capacidadCable = {bastidorData.numDeGrupos} × {bastidorData.numeroFibras} = {bastidorData.capacidadCable}
            </Box>
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #fb8c00', p: 1, borderRadius: 1 }}>
            null — raises :information
          </Box>
        )}
      </Box>
    </Box>
  )
}
