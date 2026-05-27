import { useState } from 'react'
import {
  Box, Chip, Divider, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  creaTitulo,
  buildBastidorCableData,
  MARCO_CONFIG,
  SELLOS_LAYOUT,
  VIEWPORT_OFFSET,
  NORTE_OFFSET,
  TITULO_OFFSET,
  PAGE_SIZE,
  type BastidorRecord,
  type CableRecord,
  type BastidorCableData,
} from '../models/CPlanoEsquematicoDeprincipales'

// ─── SVG page diagram ─────────────────────────────────────────────────────────

const SVG_W = 420
const SVG_H = SVG_W * (PAGE_SIZE.height / PAGE_SIZE.width)
const sx = (x: number) => (x / PAGE_SIZE.width)  * SVG_W
const sy = (y: number) => (y / PAGE_SIZE.height) * SVG_H
// Magik y=0 is bottom; SVG y=0 is top — flip
const fy = (y: number) => SVG_H - sy(y)

// Marco actual dimensions derived from (0,0,1,1) + Largo/Alto modules
// In Magik c_marco sets real bounds internally; for display we approximate
// the full page as the marco footprint since it spans the layout area.
// From add_viewport_principal we see oMarco.xmax referenced → treat marco as ~page-wide.
// The constant bounds (0,0,1,1) are init placeholders; c_marco.Largo/Alto expand it.
// We approximate: marco occupies full page for display purposes.
const MARCO = { xmin: 0, ymin: 0, xmax: PAGE_SIZE.width, ymax: PAGE_SIZE.height }

function resolvedBounds(entry: (typeof SELLOS_LAYOUT)[number]) {
  if (entry.absolute) return entry.bounds
  return {
    x0: MARCO.xmin + entry.bounds.x0,
    y0: MARCO.ymin + entry.bounds.y0,
    x1: MARCO.xmin + entry.bounds.x1,
    y1: MARCO.ymin + entry.bounds.y1,
  }
}

const SELLO_COLORS: Record<string, string> = {
  'c_notas_constructor':           '#7b1fa2',
  'simbolos_planos_esquematico':   '#1565c0',
  'c_sello_estandar_base_fo':      '#2e7d32',
  'c_sello_ruta_cables_fo_sigp':   '#e65100',
  'c_resumen_del_proyecto':        '#ad1457',
  'c_resumen_distritos_ruta':      '#00695c',
  'c_tabla_equivalencias_x_cable': '#4527a0',
}

function PageDiagram({ centralNombre }: { centralNombre: string }) {
  // Norte
  const norteY0 = MARCO.ymax + NORTE_OFFSET.dy0
  const norteY1 = MARCO.ymax + NORTE_OFFSET.dy1
  const norteX0 = MARCO.xmin + NORTE_OFFSET.dx0
  const norteX1 = MARCO.xmin + NORTE_OFFSET.dx1

  // Viewport principal
  const vpX0 = MARCO.xmin + VIEWPORT_OFFSET.dx0
  const vpY0 = MARCO.ymin + VIEWPORT_OFFSET.dy0
  const vpX1 = MARCO.xmax + VIEWPORT_OFFSET.dx1
  const vpY1 = MARCO.ymax + VIEWPORT_OFFSET.dy1

  // Titulo relative to marco
  const titX0 = MARCO.xmax + TITULO_OFFSET.dxFromMax
  const titY0 = MARCO.ymin + TITULO_OFFSET.dyFromMin
  const titX1 = MARCO.xmax + TITULO_OFFSET.dxToMax
  const titY1 = MARCO.ymin + TITULO_OFFSET.dyToMax

  const titulo = creaTitulo(centralNombre || 'CTL_NOMBRE')

  return (
    <Box>
      <svg width={SVG_W} height={SVG_H}
        style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>

        {/* Page background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

        {/* Marco outline */}
        <rect
          x={sx(MARCO.xmin)} y={fy(MARCO.ymax)}
          width={sx(MARCO.xmax - MARCO.xmin)} height={sy(MARCO.ymax - MARCO.ymin)}
          fill="none" stroke="#999" strokeWidth={1} strokeDasharray="4 2"
        />
        <text x={2} y={10} fontSize={6} fontFamily="Arial" fill="#aaa">
          marco (largo=4, alto=2)
        </text>

        {/* Norte */}
        <rect
          x={sx(norteX0)} y={fy(norteY1)}
          width={sx(norteX1 - norteX0)} height={sy(norteY1 - norteY0)}
          fill="#e3f2fd" fillOpacity={0.7} stroke="#1565c0" strokeWidth={0.8}
        />
        <text x={sx(norteX0) + 2} y={fy(norteY1) + 8} fontSize={5.5} fontFamily="Arial" fill="#1565c0">
          Norte
        </text>

        {/* Viewport principal */}
        <rect
          x={sx(vpX0)} y={fy(vpY1)}
          width={sx(vpX1 - vpX0)} height={sy(vpY1 - vpY0)}
          fill="#fff9c4" fillOpacity={0.6} stroke="#f57f17" strokeWidth={1}
        />
        <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2)}
          textAnchor="middle" fontSize={6} fontFamily="Arial" fill="#e65100">
          viewport principal
        </text>
        <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2) + 9}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#888">
          {VIEWPORT_OFFSET.sTipoPlano}
        </text>

        {/* Sellos */}
        {SELLOS_LAYOUT.map((entry) => {
          const b = resolvedBounds(entry)
          const color = SELLO_COLORS[entry.nombre] ?? '#555'
          const x = sx(b.x0)
          const y = fy(b.y1)
          const w = sx(b.x1 - b.x0)
          const h = sy(b.y1 - b.y0)
          return (
            <g key={entry.nombre}>
              <rect x={x} y={y} width={w} height={h}
                fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.8} />
              <text x={x + w / 2} y={y + Math.min(h / 2, 8)}
                textAnchor="middle" fontSize={5} fontFamily="Arial" fill={color}>
                {entry.nombre.replace('c_', '')}
              </text>
            </g>
          )
        })}

        {/* Titulo */}
        <rect
          x={sx(titX0)} y={fy(titY1)}
          width={sx(titX1 - titX0)} height={sy(titY1 - titY0)}
          fill="#fce4ec" fillOpacity={0.7} stroke="#c62828" strokeWidth={0.8}
        />
        <text x={sx(titX0) + sx((titX1 - titX0) / 2)} y={fy(titY1) + 8}
          textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#c62828">
          {titulo.split('\n')[0]}
        </text>

        {/* Page size annotation */}
        <text x={SVG_W - 2} y={SVG_H - 2} fontSize={5} fontFamily="Arial" fill="#aaa" textAnchor="end">
          {PAGE_SIZE.width} × {PAGE_SIZE.height} u (84×124cm)
        </text>
      </svg>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', fontSize: 10 }}>
        Vista conceptual del layout · proporciones reales
      </Typography>
    </Box>
  )
}

// ─── Mock bastidor for add_sello_tabla_equivalencias_x_cable demo ─────────────

const MOCK_CABLE: CableRecord = {
  getGrupos: () => [
    { fibras: new Array(12).fill(null) },
    { fibras: new Array(12).fill(null) },
  ],
}

const MOCK_BASTIDOR: BastidorRecord = {
  'user!_central':           'CENTRAL XOLA',
  obtenerConexionDeCables:   () => ({ keys: { anElement: () => MOCK_CABLE } }),
  obtenerNumeroDePiso:       () => '3',
  obtenerTipoSala:           () => 'SALA PRINCIPAL',
  obtenerFila:               () => 'F-01',
  obtenerPosBastidor:        () => 'B-12',
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoEsquematicoDeprincipalesShowcase() {
  const [centralNombre, setCentralNombre] = useState('XOLA')

  const bastidorData: BastidorCableData | null = buildBastidorCableData(MOCK_BASTIDOR, MOCK_CABLE)
  const titulo = creaTitulo(centralNombre || 'CTL_NOMBRE')

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoEsquematicoDeprincipales</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Plano Esquemático de Principales · extiende CFactoryPlanos
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error" sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"  sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Slots propios</Typography>
        {([
          ['_oEngine', 'unknown', 'Engine para la ruta (privado)'],
          ['_oBuffer', 'unknown', 'Buffer de la ruta (privado)'],
          ['oMarco',   'unknown', 'c_marco del plano'],
        ] as const).map(([s, t, d]) => (
          <Box key={s} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s}</Typography>
            <Typography variant="caption" color="text.secondary"> : {t} — {d}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>crea_titulo()</Typography>
        <TextField
          size="small" fullWidth label="Nombre central"
          value={centralNombre}
          onChange={e => setCentralNombre(e.target.value)}
          sx={{ mb: 1, fontFamily: 'monospace' }}
        />
        <Box sx={{ bgcolor: '#fce4ec', border: '1px solid #e57373', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 10 }}>
            {titulo}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Marco (add_marco)</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          bounds: ({MARCO_CONFIG.bounds.x0},{MARCO_CONFIG.bounds.y0})→({MARCO_CONFIG.bounds.x1},{MARCO_CONFIG.bounds.y1})<br />
          Largo: {MARCO_CONFIG.largo} · Alto: {MARCO_CONFIG.alto}<br />
          fill: none
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Viewport principal</Typography>
        <Box sx={{ bgcolor: '#fff9c4', border: '1px solid #f9a825', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          dx0: +{VIEWPORT_OFFSET.dx0} · dy0: +{VIEWPORT_OFFSET.dy0}<br />
          dx1: {VIEWPORT_OFFSET.dx1} · dy1: {VIEWPORT_OFFSET.dy1}<br />
          sTipoPlano: "{VIEWPORT_OFFSET.sTipoPlano}"<br />
          trail: false · selection: false
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Métodos (Fase 5)</Typography>
        {([
          ['cablesEsquemaSigp()',             'cables_esquema_sigp()'],
          ['generaPlano()',                   'genera_plano()'],
          ['addMarco()',                      'add_marco()'],
          ['addNorte()',                      'AddNorte()'],
          ['addSellos()',                     'add_sellos()'],
          ['addViewportPrincipal()',          'add_viewport_principal()'],
          ['addTitulo()',                     'AddTitulo()'],
          ['buscaBastidores()',               'busca_bastidores()'],
          ['addSelloTablaEquivalenciasXCable()', 'add_sello_tabla_equiv...()'],
        ] as const).map(([ts, magik]) => (
          <Box key={ts} sx={{ mb: 0.3 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{ts}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}> ← {magik}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 360 }}>
        <Typography variant="subtitle2" gutterBottom>Diagrama de layout (proporcional)</Typography>
        <PageDiagram centralNombre={centralNombre} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>add_sellos() — elementos del plano</Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              {['Elemento', 'Posición', 'Relativo a'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 'bold', fontSize: 11 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {SELLOS_LAYOUT.map(entry => {
              const color = SELLO_COLORS[entry.nombre] ?? '#555'
              return (
                <TableRow key={entry.nombre}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 10, color }}>
                    {entry.nombre}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                    ({entry.bounds.x0},{entry.bounds.y0})→({entry.bounds.x1},{entry.bounds.y1})
                  </TableCell>
                  <TableCell sx={{ fontSize: 10 }}>
                    <Chip
                      label={entry.absolute ? 'absoluta' : 'oMarco'}
                      size="small"
                      color={entry.absolute ? 'default' : 'primary'}
                      sx={{ fontSize: 9, height: 16 }}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          buildBastidorCableData() — add_sello_tabla_equivalencias_x_cable
        </Typography>
        {bastidorData ? (
          <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #4caf50', p: 1.5, borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
            {Object.entries(bastidorData).filter(([k]) => k !== 'loCable' && k !== 'rme').map(([k, v]) => (
              <Box key={k}>
                <span style={{ color: '#888' }}>{k}: </span>
                <b>{String(v)}</b>
              </Box>
            ))}
            <Box sx={{ mt: 0.5, color: '#4527a0', fontSize: 10 }}>
              capacidadCable = {bastidorData.numDeGrupos} grupos × {bastidorData.numeroFibras} fibras = {bastidorData.capacidadCable}
            </Box>
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#fff3e0', border: '1px solid #fb8c00', p: 1, borderRadius: 1, fontSize: 11 }}>
            null — raises :information (grupos=0 o fibras=0)
          </Box>
        )}
      </Box>
    </Box>
  )
}
