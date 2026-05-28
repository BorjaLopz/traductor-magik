import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import {
  calcularEscalaVista,
  resolveDisplayStyle,
  bboxWidth,
  bboxHeight,
  BOUNDS_SELLO,
  BOUNDS_MAPA,
  MARCO_LARGO,
  MARCO_ALTO,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  CPlanoDesmontageCd,
} from '../models/CPlanoDesmontageCd'

// ─── Page layout SVG ──────────────────────────────────────────────────────────

const PREVIEW_W = 520
const SCALE     = PREVIEW_W / PAGE_WIDTH
const PH        = PAGE_HEIGHT * SCALE

function PageLayout() {
  const sx = (x: number) => x * SCALE
  const sy = (y: number) => (PAGE_HEIGHT - y) * SCALE   // flip Y (layout: Y grows up)

  // Marco: full page border (Largo=3 módulos wide, Alto=1 tall — spans full page)
  const mX = sx(0); const mY = sy(PAGE_HEIGHT); const mW = sx(PAGE_WIDTH); const mH = PH

  // Sello
  const sX = sx(BOUNDS_SELLO.x0)
  const sY = sy(BOUNDS_SELLO.y1)
  const sW = bboxWidth(BOUNDS_SELLO)  * SCALE
  const sH = bboxHeight(BOUNDS_SELLO) * SCALE

  // Mapa
  const vpX = sx(BOUNDS_MAPA.x0)
  const vpY = sy(BOUNDS_MAPA.y1)
  const vpW = bboxWidth(BOUNDS_MAPA)  * SCALE
  const vpH = bboxHeight(BOUNDS_MAPA) * SCALE

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg width={PREVIEW_W + 2} height={PH + 2} style={{ display: 'block' }}>
        <g transform="translate(1,1)">
          {/* Page background */}
          <rect x={0} y={0} width={PREVIEW_W} height={PH} fill="#f9f9f9" stroke="#bbb" strokeWidth={1} />

          {/* Marco — full page border, no fill */}
          <rect x={mX} y={mY} width={mW} height={mH}
            fill="none" stroke="#555" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={4} y={10} fontSize={7} fill="#555" fontFamily="Arial">
            c_marco (Largo={MARCO_LARGO}, Alto={MARCO_ALTO})
          </text>

          {/* Sello */}
          <rect x={sX} y={sY} width={sW} height={sH} fill="#e8eaf6" fillOpacity={0.7} stroke="#3949ab" strokeWidth={1} />
          <text x={sX + sW / 2} y={sY + sH / 2 - 5} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#3949ab" fontFamily="Arial">
            sello
          </text>
          <text x={sX + sW / 2} y={sY + sH / 2 + 6} textAnchor="middle" fontSize={6.5} fill="#5c6bc0" fontFamily="Arial">
            c_sello_proyecto_canalizacion
          </text>
          <text x={sX + sW / 2} y={sY + sH / 2 + 15} textAnchor="middle" fontSize={6} fill="#7986cb" fontFamily="Arial">
            ({BOUNDS_SELLO.x0},{BOUNDS_SELLO.y0})→({BOUNDS_SELLO.x1},{BOUNDS_SELLO.y1})
          </text>

          {/* Mapa */}
          <rect x={vpX} y={vpY} width={vpW} height={vpH} fill="#e8f5e9" fillOpacity={0.7} stroke="#2e7d32" strokeWidth={1} />
          <text x={vpX + vpW / 2} y={vpY + vpH / 2 - 5} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#2e7d32" fontFamily="Arial">
            mapa
          </text>
          <text x={vpX + vpW / 2} y={vpY + vpH / 2 + 6} textAnchor="middle" fontSize={6.5} fill="#388e3c" fontFamily="Arial">
            viewport_layout
          </text>
          <text x={vpX + vpW / 2} y={vpY + vpH / 2 + 15} textAnchor="middle" fontSize={6} fill="#43a047" fontFamily="Arial">
            ({BOUNDS_MAPA.x0},{BOUNDS_MAPA.y0})→({BOUNDS_MAPA.x1},{BOUNDS_MAPA.y1})
          </text>

          {/* Overlap indicator */}
          {(() => {
            const ox  = sx(BOUNDS_MAPA.x0)
            const ow  = sx(BOUNDS_SELLO.x1) - ox
            const oy  = sy(BOUNDS_SELLO.y1)
            const oh  = (bboxHeight(BOUNDS_SELLO) - (BOUNDS_MAPA.y0 - BOUNDS_SELLO.y0)) * SCALE
            if (ow > 0) return (
              <rect x={ox} y={oy} width={ow} height={oh}
                fill="none" stroke="#ff9800" strokeWidth={0.8} strokeDasharray="3 2" />
            )
            return null
          })()}
        </g>
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}
        sx={{ fontFamily: 'monospace', fontSize: 10 }}>
        Espacio de coordenadas del layout: {PAGE_WIDTH} × {PAGE_HEIGHT} u
        · escala preview: ×{SCALE.toFixed(4)}
      </Typography>
    </Box>
  )
}

// ─── Scale calculator demo ────────────────────────────────────────────────────

const SAMPLE_STYLES = [
  { name: 'Urbano_1:500',   scaleId: 'URBANO_500'   },
  { name: 'Urbano_1:1000',  scaleId: 'URBANO_1000'  },
  { name: 'Rural_1:2000',   scaleId: 'RURAL_2000'   },
]

function ScaleDemo() {
  const [viewW,       setViewW]       = useState(1200)
  const [viewH,       setViewH]       = useState(800)
  const [viewAngle,   setViewAngle]   = useState(0)
  const [mapScale,    setMapScale]    = useState(500)
  const [unitFactor,  setUnitFactor]  = useState(1.0)
  const [styleName,   setStyleName]   = useState('URBANO_500')

  const vpW = bboxWidth(BOUNDS_MAPA)
  const vpH = bboxHeight(BOUNDS_MAPA)

  const result = calcularEscalaVista(viewW, viewH, vpW, vpH, viewAngle, mapScale, unitFactor)
  const usedAngleBranch = Math.abs(viewAngle) > 0.1
  const dsResult = resolveDisplayStyle(SAMPLE_STYLES, styleName)

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>calcularEscalaVista</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Magik: <code>mapa()</code> — escala del viewport basada en la vista de mapa actual
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">viewBounds width</Typography>
          <TextField type="number" value={viewW} size="small" fullWidth sx={{ mt: 0.5 }}
            onChange={e => setViewW(Number(e.target.value) || 1)} />
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">viewBounds height</Typography>
          <TextField type="number" value={viewH} size="small" fullWidth sx={{ mt: 0.5 }}
            onChange={e => setViewH(Number(e.target.value) || 1)} />
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">mapViewScale (fallback)</Typography>
          <TextField type="number" value={mapScale} size="small" fullWidth sx={{ mt: 0.5 }}
            onChange={e => setMapScale(Number(e.target.value) || 1)} />
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="caption" color="text.secondary">unitFactor (app_cs)</Typography>
          <TextField type="number" value={unitFactor} size="small" fullWidth sx={{ mt: 0.5 }}
            inputProps={{ step: 0.1 }}
            onChange={e => setUnitFactor(Number(e.target.value) || 1)} />
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary">
        viewAngle (grados) — umbral ±0.1° para rama "rotado"
      </Typography>
      <Slider min={-180} max={180} step={0.5} value={viewAngle}
        onChange={(_, v) => setViewAngle(v as number)}
        marks={[{ value: -90, label: '-90°' }, { value: 0, label: '0°' }, { value: 90, label: '90°' }]}
        sx={{ mb: 1 }} />

      <Box sx={{
        bgcolor: usedAngleBranch ? '#fff3e0' : '#e8f5e9',
        border: '1px solid',
        borderColor: usedAngleBranch ? '#ff9800' : '#4caf50',
        p: 1.5, borderRadius: 1, mb: 1.5,
      }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {usedAngleBranch
            ? `|viewAngle|=${Math.abs(viewAngle).toFixed(1)}° > 0.1° → usar mapViewScale directamente`
            : `|viewAngle|=${Math.abs(viewAngle).toFixed(1)}° ≤ 0.1° → calcular fit scale`}
        </Typography>
        {!usedAngleBranch && (
          <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5, color: '#333' }}>
            expandedVpW = {vpW} × 1.1 = {(vpW * 1.1).toFixed(0)}<br />
            expandedVpH = {vpH} × 1.1 = {(vpH * 1.1).toFixed(0)}<br />
            min({viewW}/{(vpW * 1.1).toFixed(0)}, {viewH}/{(vpH * 1.1).toFixed(0)})<br />
            {'  '}= min({(viewW / (vpW * 1.1)).toFixed(4)}, {(viewH / (vpH * 1.1)).toFixed(4)})<br />
            {'  '}× unitFactor({unitFactor}) = <b>{result.toFixed(4)}</b>
          </Box>
        )}
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
          calcularEscalaVista(…) = <b>{result.toFixed(4)}</b>
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" gutterBottom>resolveDisplayStyle</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Busca el nombre de estilo cuyo <code>scaleId</code> coincide con el estilo activo.
        Fallback: primer elemento de la lista.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end', mb: 1 }}>
        <TextField
          label="currentStyleName" value={styleName} size="small"
          helperText="scaleId del estilo activo"
          onChange={e => setStyleName(e.target.value)}
        />
      </Box>
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          displayStyles = {JSON.stringify(SAMPLE_STYLES.map(s => s.scaleId))}<br />
          resolveDisplayStyle(…, "{styleName}") → "{dsResult}"
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CPlanoDesmontageCdShowcase() {
  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoDesmontageCd</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Plano de desmontaje de caja de distribución<br />
          extends layout_element + viewport_layout_mixin
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Elementos del plano</Typography>
        {[
          { name: 'marco',  class: 'c_marco',                        color: '#555',   desc: `Largo=${MARCO_LARGO}, Alto=${MARCO_ALTO}, sin relleno` },
          { name: 'sello',  class: 'c_sello_proyecto_canalizacion',   color: '#3949ab', desc: `(${BOUNDS_SELLO.x0},${BOUNDS_SELLO.y0})→(${BOUNDS_SELLO.x1},${BOUNDS_SELLO.y1})` },
          { name: 'mapa',   class: 'viewport_layout',                 color: '#2e7d32', desc: `(${BOUNDS_MAPA.x0},${BOUNDS_MAPA.y0})→(${BOUNDS_MAPA.x1},${BOUNDS_MAPA.y1})` },
        ].map(el => (
          <Box key={el.name} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, borderLeft: `3px solid ${el.color}` }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: el.color }}>{el.name}</Typography>
            <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{el.class}</Typography>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>{el.desc}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Geometría viewport</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            width:  {bboxWidth(BOUNDS_MAPA)} u<br />
            height: {bboxHeight(BOUNDS_MAPA)} u<br />
            expanded ×1.1:<br />
            {'  '}W = {(bboxWidth(BOUNDS_MAPA) * 1.1).toFixed(0)} u<br />
            {'  '}H = {(bboxHeight(BOUNDS_MAPA) * 1.1).toFixed(0)} u
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>genera_plano — flujo</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
          {['plugin(:layout_plugin)', 'start_layout_designer()', 'current_page', 'page.elements.empty()', 'marco(page)', 'sello(page)', 'mapa(page)'].map((step, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#888', width: 14 }}>{i + 1}.</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{step}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Instancia</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          ALLOWED_ON_MENU = {String(CPlanoDesmontageCd.ALLOWED_ON_MENU)}<br />
          app: unknown (PNI app handle)<br />
          defined_attributes → viewport_attribute_definition
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 340 }}>
        <Typography variant="subtitle2" gutterBottom>Vista previa — layout del plano</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Posiciones relativas de los tres elementos en el espacio de coordenadas del Layout Designer.
          La franja naranja punteada indica la zona de solapamiento entre sello y mapa.
        </Typography>

        <PageLayout />

        <Divider sx={{ my: 2 }} />

        <ScaleDemo />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Métodos GIS (Fase 5)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Método TS', 'Magik equivalente', 'Descripción'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['constructor()',  'new() + init()',    'D2: merged; sets app = pni_application()'],
              ['generaPlano()',  'genera_plano()',    'Orchestrates marco+sello+mapa on current page'],
              ['marco(page)',    'marco(LoPagina)',   'c_marco Largo=3, Alto=1, no fill'],
              ['sello(page)',    'sello(LoPagina)',   'c_sello_proyecto_canalizacion.Inicializa()'],
              ['mapa(page)',     'mapa(LoPagina)',    'viewport_layout with copied map view params'],
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
      </Box>
    </Box>
  )
}
