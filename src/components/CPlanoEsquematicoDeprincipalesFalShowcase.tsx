import { useState } from 'react'
import { Alert, Box, Chip, Divider, TextField, Typography } from '@mui/material'
import { CPlanoEsquematicoDeprincipalesFal } from '../models/CPlanoEsquematicoDeprincipalesFal'
import {
  SELLOS_LAYOUT,
  VIEWPORT_OFFSET,
  MARCO_CONFIG,
} from '../models/CPlanoEsquematicoDeprincipales'
import { PAGE_SIZE } from '../models/CFactoryPlanos'

// ─── SVG (reuses same layout as base variant) ─────────────────────────────────

const SVG_W = 380
const SVG_H = SVG_W * (PAGE_SIZE.height / PAGE_SIZE.width)
const PW    = PAGE_SIZE.width
const PH    = PAGE_SIZE.height
const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)

const MARCO = { xmin: 0, ymin: 0, xmax: PW, ymax: PH }

const SELLO_COLORS: Record<string, string> = {
  'c_notas_constructor':           '#7b1fa2',
  'simbolos_planos_esquematico':   '#1565c0',
  'c_sello_estandar_base_fo':      '#2e7d32',
  'c_sello_ruta_cables_fo_sigp':   '#e65100',
  'c_resumen_del_proyecto':        '#ad1457',
  'c_resumen_distritos_ruta':      '#00695c',
  'c_tabla_equivalencias_x_cable': '#4527a0',
}

function resolvedBounds(entry: (typeof SELLOS_LAYOUT)[number]) {
  if (entry.absolute) return entry.bounds
  return {
    x0: MARCO.xmin + entry.bounds.x0,
    y0: MARCO.ymin + entry.bounds.y0,
    x1: MARCO.xmin + entry.bounds.x1,
    y1: MARCO.ymin + entry.bounds.y1,
  }
}

function PageDiagram({ titulo }: { titulo: string }) {
  const vpX0 = MARCO.xmin + VIEWPORT_OFFSET.dx0
  const vpY0 = MARCO.ymin + VIEWPORT_OFFSET.dy0
  const vpX1 = MARCO.xmax + VIEWPORT_OFFSET.dx1
  const vpY1 = MARCO.ymax + VIEWPORT_OFFSET.dy1

  return (
    <svg width={SVG_W} height={SVG_H}
      style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

      {/* Marco */}
      <rect x={sx(MARCO.xmin)} y={fy(MARCO.ymax)}
        width={sx(MARCO.xmax)} height={sy(MARCO.ymax)}
        fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
      <text x={2} y={9} fontSize={5.5} fontFamily="Arial" fill="#aaa">
        marco (largo={MARCO_CONFIG.largo}, alto={MARCO_CONFIG.alto}) — idéntico a base
      </text>

      {/* Viewport */}
      <rect x={sx(vpX0)} y={fy(vpY1)} width={sx(vpX1 - vpX0)} height={sy(vpY1 - vpY0)}
        fill="#fff9c4" fillOpacity={0.6} stroke="#f57f17" strokeWidth={1} />
      <text x={sx(vpX0) + sx((vpX1 - vpX0) / 2)} y={fy(vpY1) + sy((vpY1 - vpY0) / 2)}
        textAnchor="middle" fontSize={6} fontFamily="Arial" fill="#e65100">
        viewport principal
      </text>

      {/* Sellos */}
      {SELLOS_LAYOUT.map(entry => {
        const b     = resolvedBounds(entry)
        const color = SELLO_COLORS[entry.nombre] ?? '#555'
        return (
          <g key={entry.nombre}>
            <rect x={sx(b.x0)} y={fy(b.y1)} width={sx(b.x1 - b.x0)} height={sy(b.y1 - b.y0)}
              fill={color} fillOpacity={0.13} stroke={color} strokeWidth={0.7} />
            <text x={sx(b.x0) + sx((b.x1 - b.x0) / 2)} y={fy(b.y1) + Math.min(sy((b.y1 - b.y0) / 2), 8)}
              textAnchor="middle" fontSize={4.5} fontFamily="Arial" fill={color}>
              {entry.nombre.replace('c_', '')}
            </text>
          </g>
        )
      })}

      {/* Titulo strip */}
      <text x={SVG_W / 2} y={fy(MARCO.ymin) - 4}
        textAnchor="middle" fontSize={5} fontFamily="Arial" fill="#c62828">
        {titulo.split('\n')[0]}
      </text>

      <text x={SVG_W - 2} y={SVG_H - 2} fontSize={4.5} fontFamily="Arial" fill="#bbb" textAnchor="end">
        {PW}×{PH} u
      </text>
    </svg>
  )
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoEsquematicoDeprincipalesFalShowcase() {
  const [centralNombre, setCentralNombre] = useState('FAL_CENTRAL')

  const inst   = new CPlanoEsquematicoDeprincipalesFal()
  const titulo = inst.creaTitulo(centralNombre)

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoEsquematicoDeprincipalesFal</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Variante FAL · extiende CPlanoEsquematicoDeprincipales sin overrides
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="Copia exacta"        size="small" color="default" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Alert severity="info" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          El fuente Magik es <strong>idéntico</strong> a{' '}
          <code>c_plano_esquematico_de_principales</code>. Todos los métodos y
          bounds son iguales; sólo difiere el nombre de la clase.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>Jerarquía</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          CFactoryPlanos<br />
          └─ CPlanoEsquematicoDeprincipales<br />
          &nbsp;&nbsp;&nbsp;└─ <strong>CPlanoEsquematicoDeprincipalesFal</strong><br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(sin overrides)
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: 10 }}>
          En Magik ambas clases extienden <code>:c_factory_planos</code> directamente
          (son hermanas). En TypeScript modelamos la FAL como subclase de la base
          porque su código es idéntico — representa el estado actual sin perder la
          capacidad de añadir overrides FAL-específicos en el futuro.
        </Typography>

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

        <Typography variant="subtitle2" gutterBottom>Métodos heredados (todos Fase 5)</Typography>
        {[
          'cablesEsquemaSigp()',
          'generaPlano()',
          'addMarco()',
          'addNorte()',
          'addSellos()',
          'addViewportPrincipal()',
          'addParticulares()',
          'creaTitulo()',
          'addTitulo()',
          'buscaBastidores()',
          'addSelloTablaEquivalenciasXCable()',
          'agregarSimbolo()',
        ].map(m => (
          <Box key={m} sx={{ fontFamily: 'monospace', fontSize: 10, color: '#555', mb: 0.3 }}>
            {m} <Chip label="inherited" size="small" sx={{ fontSize: 8, height: 14, ml: 0.5 }} />
          </Box>
        ))}
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 340 }}>
        <Typography variant="subtitle2" gutterBottom>
          Layout idéntico al de la variante base
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Mismo viewport, mismos 6 sellos, mismo marco y Norte.
        </Typography>
        <PageDiagram titulo={titulo} />
      </Box>
    </Box>
  )
}
