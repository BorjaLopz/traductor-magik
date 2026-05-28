import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import {
  opciones,
  debesDibujar,
  CORTE_GEOMETRIAS,
  VIEWPORT_BOUNDS,
  VIEWPORT_NAME,
  BUFFER_DISTANCIA,
  RUTA_DRAW_PARAMS,
  CCorteGeografico,
  type DibujaCallesValue,
} from '../models/CCorteGeografico'

// ─── Diagram SVG ──────────────────────────────────────────────────────────────
// Shows the layout page with viewport and buffer zones drawn conceptually.

const PAGE_W  = 1700
const PAGE_H  = 1700
const SVG_W   = 360
const SVG_H   = 360
const SX      = (x: number) => (x / PAGE_W) * SVG_W
const SY      = (y: number) => (y / PAGE_H) * SVG_H   // y=0 at top in SVG

// Buffer circle radius in page units — scaled for display only
const BUFFER_R_DISPLAY = (BUFFER_DISTANCIA / PAGE_W) * SVG_W * 0.004

interface DiagramProps { dibujaCalles: DibujaCallesValue }

function CorteGeograficoDiagram({ dibujaCalles }: DiagramProps) {
  const vpX = SX(VIEWPORT_BOUNDS.x0)
  const vpY = SY(VIEWPORT_BOUNDS.y0)
  const vpW = SX(VIEWPORT_BOUNDS.x1 - VIEWPORT_BOUNDS.x0)
  const vpH = SY(VIEWPORT_BOUNDS.y1 - VIEWPORT_BOUNDS.y0)

  // Simulate the "start element" route as a horizontal line across the viewport centre
  const routeY = vpY + vpH * 0.5
  const active  = debesDibujar(dibujaCalles)

  // Layer colours matching what gets drawn
  const LAYER_COLORS = ['#7b1fa2', '#1565c0', '#2e7d32'] as const

  return (
    <Box>
      <svg width={SVG_W} height={SVG_H}
        style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#f5f5f5' }}>

        {/* Page background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#fafafa" />

        {active ? (
          <>
            {/* Buffer zones (conceptual) */}
            {CORTE_GEOMETRIAS.map((_layer, i) => (
              <circle key={i}
                cx={vpX + vpW / 2} cy={routeY}
                r={BUFFER_R_DISPLAY * 1.4 * (3 - i)}
                fill="none"
                stroke={LAYER_COLORS[i]} strokeWidth={0.6} strokeDasharray="3 2" opacity={0.5}
              />
            ))}

            {/* Viewport box */}
            <rect x={vpX} y={vpY} width={vpW} height={vpH}
              fill="#e3f2fd" fillOpacity={0.5} stroke="#1565c0" strokeWidth={1.2} />
            <text x={vpX + vpW / 2} y={vpY + 9} textAnchor="middle" fontSize={6.5}
              fontFamily="Arial" fill="#1565c0" fontWeight="bold">{VIEWPORT_NAME}</text>
            <text x={vpX + vpW / 2} y={vpY + 17} textAnchor="middle" fontSize={5.5}
              fontFamily="Arial" fill="#555">
              ace_name="OCULTOS"
            </text>

            {/* oRwoArranque route */}
            <line x1={vpX + 8} y1={routeY} x2={vpX + vpW - 8} y2={routeY}
              stroke={RUTA_DRAW_PARAMS.color} strokeWidth={2} />
            <circle cx={vpX + vpW / 2} cy={routeY} r={3} fill={RUTA_DRAW_PARAMS.color} />
            <text x={vpX + vpW / 2} y={routeY - 6} textAnchor="middle" fontSize={5.5}
              fontFamily="Arial" fill={RUTA_DRAW_PARAMS.color} fontWeight="bold">
              oRwoArranque.route (spec_id)
            </text>

            {/* Layer labels */}
            {CORTE_GEOMETRIAS.map((layer, i) => (
              <text key={i}
                x={vpX + vpW + 4} y={vpY + 20 + i * 16}
                fontSize={5.5} fontFamily="Arial" fill={LAYER_COLORS[i]}>
                ⬡ {layer.tabla}
              </text>
            ))}

            {/* Buffer label */}
            <text x={vpX + vpW / 2} y={vpY + vpH - 6} textAnchor="middle"
              fontSize={5.5} fontFamily="Arial" fill="#888">
              buffer: {BUFFER_DISTANCIA.toLocaleString()} u
            </text>
          </>
        ) : (
          /* Not drawing */
          <>
            <rect x={vpX} y={vpY} width={vpW} height={vpH}
              fill="#eeeeee" stroke="#aaa" strokeWidth={1} strokeDasharray="4 3" />
            <text x={vpX + vpW / 2} y={vpY + vpH / 2} textAnchor="middle"
              dominantBaseline="middle" fontSize={7} fontFamily="Arial" fill="#aaa">
              Dibuja_Calles? = "No"
            </text>
            <text x={vpX + vpW / 2} y={vpY + vpH / 2 + 12} textAnchor="middle"
              fontSize={6} fontFamily="Arial" fill="#bbb">
              draw_content_on → no-op
            </text>
          </>
        )}

        {/* Viewport bounds annotation */}
        <text x={2} y={SVG_H - 2} fontSize={5} fontFamily="Arial" fill="#aaa">
          ({VIEWPORT_BOUNDS.x0},{VIEWPORT_BOUNDS.y0})→({VIEWPORT_BOUNDS.x1},{VIEWPORT_BOUNDS.y1})
        </text>
      </svg>
      <Typography variant="caption" color="text.secondary"
        sx={{ display: 'block', fontFamily: 'monospace', fontSize: 10, mt: 0.5 }}>
        Página layout: {PAGE_W}×{PAGE_H} u · viewport: {VIEWPORT_BOUNDS.x1 - VIEWPORT_BOUNDS.x0}×{VIEWPORT_BOUNDS.y1 - VIEWPORT_BOUNDS.y0} u
      </Typography>
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CCorteGeograficoShowcase() {
  const [dibujaCalles, setDibujaCalles] = useState<DibujaCallesValue>('Si')

  const inst    = new CCorteGeografico()
  const opcs    = opciones()
  const activo  = debesDibujar(dibujaCalles)

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 290, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CCorteGeografico</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Corte geográfico · layout_element + layout_element_mixin + viewport_layout_mixin
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          Dibuja_Calles? (atributo — properties page)
        </Typography>
        <ToggleButtonGroup
          value={dibujaCalles} exclusive size="small" sx={{ mb: 1 }}
          onChange={(_, v) => { if (v) setDibujaCalles(v) }}
        >
          {opcs.map(o => (
            <ToggleButton key={o} value={o}>{o}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{
          bgcolor: activo ? '#e8f5e9' : '#fce4ec',
          border: '1px solid', borderColor: activo ? '#4caf50' : '#e57373',
          p: 1, borderRadius: 1, mb: 1.5,
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            debesDibujar("{dibujaCalles}") = <b>{String(activo)}</b><br />
            draw_content_on → {activo ? 'dibujaCorte(window)' : 'no-op'}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Slots</Typography>
        {[
          ['oApp',         'PNI application handle'],
          ['oAppLayout',   'plugin(:viewport_mapper) del layout designer'],
          ['oRwoArranque', 'GIS element con .route geometry'],
          ['oMapPlugin',   'plugin(:map_plugin) — vista de mapa'],
        ].map(([slot, desc]) => (
          <Box key={slot} sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{slot}</Typography>
            <Typography variant="caption" color="text.secondary"> — {desc}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Viewport</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            bounds: ({VIEWPORT_BOUNDS.x0},{VIEWPORT_BOUNDS.y0})→({VIEWPORT_BOUNDS.x1},{VIEWPORT_BOUNDS.y1})<br />
            name:   "{VIEWPORT_NAME}"<br />
            fill:   none · outline: none<br />
            ace_name → "OCULTOS" (oculta el ACE)<br />
            buffer: {BUFFER_DISTANCIA.toLocaleString()} u
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Ruta (dibuja_geometria_en_viewport)</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          {Object.entries(RUTA_DRAW_PARAMS).map(([k, v]) => (
            <Box key={k} sx={{ fontFamily: 'monospace', fontSize: 10 }}>
              <span style={{ color: '#888' }}>{k}:</span> {String(v)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 340 }}>
        <Typography variant="subtitle2" gutterBottom>Diagrama conceptual</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          El viewport se mapea sobre el mapa actual. El corte dibuja la ruta de arranque
          y las tres capas del landbase dentro del buffer.
        </Typography>

        <CorteGeograficoDiagram dibujaCalles={dibujaCalles} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Capas de landbase — CORTE_GEOMETRIAS
        </Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', mb: 2 }}>
          <thead>
            <tr>
              {['#', 'dataset', 'tabla', 'tipoGeom', 'Buffer'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {CORTE_GEOMETRIAS.map((layer, i) => (
              <tr key={i}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold', color: ['#7b1fa2','#1565c0','#2e7d32'][i] }}>{i + 1}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{layer.dataset}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{layer.tabla}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{layer.tipoGeom}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{BUFFER_DISTANCIA.toLocaleString()} u, :linea</Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Métodos GIS (Fase 5)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', mb: 2 }}>
          <thead>
            <tr>
              {['Método TS', 'Magik', 'Descripción'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['dependsOn()',       'depends_on?()',           'Delegates to viewport_layout_mixin super'],
              ['initialiseForPage()','initialise_for_page()',  'connect_to_first_viewport_on_page'],
              ['dibujaCorte()',     'Dibuja_Corte()',          'Creates viewport, maps view, draws layers'],
              ['drawContentOn()',   'draw_content_on()',       'Guard: debesDibujar → dibujaCorte'],
            ].map(([ts, magik, desc]) => (
              <tr key={ts}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{ts}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{magik}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontSize: 10 }}>
                  {desc}
                  <Chip label="Fase 5" size="small" color="warning" sx={{ ml: 0.5, fontSize: 9, height: 16 }} />
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Atributos definidos</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Atributo', 'Tipo', 'Default', 'Properties page', 'Enum'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>
                Dibuja_Calles?
              </Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, color: '#7b1fa2' }}>string</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>"Si"</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>✓ true</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>
                opciones() → {JSON.stringify(inst.dibujaCalles === 'Si' ? opciones() : opciones())}
              </Box>
            </tr>
            <tr>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>
                viewport_attribute_definition
              </Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, color: '#7b1fa2' }}>mixin</Box>
              <Box component="td" colSpan={3} sx={{ border: '1px solid #eee', px: 1, py: 0.3, color: '#888' }}>
                From viewport_layout_mixin — Fase 5
              </Box>
            </tr>
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
