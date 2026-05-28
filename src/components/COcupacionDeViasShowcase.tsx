import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import {
  DEFAULT_ATTRIBS,
  degreesToDrawAngle,
  scaleColorVector,
  rgbToCss,
  buildDrawTransform,
  type OcupacionDeViasAttribs,
  COcupacionDeVias,
} from '../models/COcupacionDeVias'

// ─── Symbol placeholder ───────────────────────────────────────────────────────
// Simplified road cross-section representing "ocupacion de vias".
// In production this would be fetched from sigc_style_view / symbol_bundle_table.

function SymbolShape({ color }: { color: string }) {
  return (
    <g>
      {/* road surface */}
      <rect x={-40} y={-15} width={80} height={30} rx={3} fill="#d0d0d0" stroke={color} strokeWidth={1.5} />
      {/* conduit ducts */}
      <rect x={-28} y={-8} width={14} height={14} rx={2} fill={color} opacity={0.85} />
      <rect x={-7}  y={-8} width={14} height={14} rx={2} fill={color} opacity={0.65} />
      <rect x={14}  y={-8} width={14} height={14} rx={2} fill={color} opacity={0.45} />
      {/* center line */}
      <line x1={-40} y1={0} x2={-30} y2={0} stroke="#fff" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={30}  y1={0} x2={40}  y2={0} stroke="#fff" strokeWidth={1.5} strokeDasharray="4 3" />
    </g>
  )
}

// ─── Preview SVG ─────────────────────────────────────────────────────────────

interface PreviewProps {
  attribs: OcupacionDeViasAttribs
  size:    number
}

function SymbolPreview({ attribs, size }: PreviewProps) {
  const cx = size / 2
  const cy = size / 2
  const color = attribs.colour ? rgbToCss(attribs.colour) : '#2196f3'
  const transform = buildDrawTransform(cx, cy, attribs.angle, attribs.flip, attribs.mirror)

  const drawAngleRad = degreesToDrawAngle(attribs.angle)
  const drawAngleDeg = (drawAngleRad * 180) / Math.PI

  return (
    <Box>
      <svg
        width={size} height={size}
        style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block', borderRadius: 4 }}
      >
        {/* bounding box reference */}
        <rect
          x={cx - 50} y={cy - 20}
          width={100} height={40}
          fill="none" stroke="#ddd" strokeWidth={1} strokeDasharray="3 2"
        />
        {/* axis markers */}
        <line x1={cx - 55} y1={cy} x2={cx + 55} y2={cy} stroke="#eee" strokeWidth={0.5} />
        <line x1={cx} y1={cy - 55} x2={cx} y2={cy + 55} stroke="#eee" strokeWidth={0.5} />

        {/* the symbol with transforms applied */}
        <g transform={transform}>
          <SymbolShape color={color} />
        </g>

        {/* angle arc indicator */}
        {attribs.angle !== 0 && (
          <path
            d={`M ${cx + 30} ${cy} A 30 30 0 0 ${drawAngleDeg > 0 ? 0 : 1} ${
              cx + 30 * Math.cos(drawAngleRad)
            } ${cy + 30 * Math.sin(drawAngleRad)}`}
            fill="none" stroke="#ff9800" strokeWidth={1} strokeDasharray="3 2"
          />
        )}
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        transform: {transform}
      </Typography>
    </Box>
  )
}

// ─── Color picker row ─────────────────────────────────────────────────────────

function ColorSlider({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ width: 14, flexShrink: 0 }}>{label}</Typography>
      <Slider min={0} max={1} step={0.01} value={value} onChange={(_, v) => onChange(v as number)}
        sx={{ flex: 1 }} size="small" />
      <Typography variant="caption" sx={{ width: 32, textAlign: 'right', fontFamily: 'monospace' }}>
        {value.toFixed(2)}
      </Typography>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function COcupacionDeViasShowcase() {
  const [attribs, setAttribs] = useState<OcupacionDeViasAttribs>({ ...DEFAULT_ATTRIBS })
  const [useColor, setUseColor] = useState(false)
  const [previewSize, setPreviewSize] = useState(220)

  const set = <K extends keyof OcupacionDeViasAttribs>(k: K, v: OcupacionDeViasAttribs[K]) =>
    setAttribs(prev => ({ ...prev, [k]: v }))

  const rgb = attribs.colour ?? [0.129, 0.588, 0.953]  // #2196f3
  const scaled = scaleColorVector(rgb)
  const drawAngleRad = degreesToDrawAngle(attribs.angle)
  const drawAngleDeg = (drawAngleRad * 180) / Math.PI

  const inst = new COcupacionDeVias()

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>COcupacionDeVias</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Símbolo de ocupación de vías · extends symbol_layout
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>Atributos</Typography>

        <TextField
          label="name (default: 'ocupacion')"
          value={attribs.name} size="small" fullWidth sx={{ mb: 1.5 }}
          helperText="Nombre del símbolo en symbol_bundle_table"
          onChange={e => set('name', e.target.value || 'ocupacion')}
        />

        <TextField
          label="angle (grados, default: 0.0)"
          type="number" value={attribs.angle} size="small" fullWidth sx={{ mb: 0.5 }}
          onChange={e => set('angle', parseFloat(e.target.value) || 0)}
        />
        <Slider
          min={-180} max={180} step={1} value={attribs.angle}
          onChange={(_, v) => set('angle', v as number)}
          sx={{ mb: 1.5 }}
          marks={[{value:-180,label:'-180°'},{value:0,label:'0°'},{value:180,label:'180°'}]}
        />

        <FormControlLabel
          control={<Switch checked={attribs.flip} onChange={e => set('flip', e.target.checked)} />}
          label="flip (voltear vertical)"
          sx={{ display: 'block', mb: 0.5 }}
        />
        <FormControlLabel
          control={<Switch checked={attribs.mirror} onChange={e => set('mirror', e.target.checked)} />}
          label="mirror (espejo horizontal)"
          sx={{ display: 'block', mb: 1.5 }}
        />

        <FormControlLabel
          control={<Switch checked={useColor} onChange={e => {
            setUseColor(e.target.checked)
            set('colour', e.target.checked ? [...rgb] : undefined)
          }} />}
          label="colour (override color)"
          sx={{ display: 'block', mb: 1 }}
        />

        {useColor && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
            <ColorSlider label="R" value={rgb[0]} onChange={v => set('colour', [v, rgb[1], rgb[2]])} />
            <ColorSlider label="G" value={rgb[1]} onChange={v => set('colour', [rgb[0], v, rgb[2]])} />
            <ColorSlider label="B" value={rgb[2]} onChange={v => set('colour', [rgb[0], rgb[1], v])} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: rgbToCss(rgb), border: '1px solid #ccc' }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{rgbToCss(rgb)}</Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>Conversión de ángulo</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#fff3e0', p: 1, borderRadius: 1, mb: 1 }}>
          angle (input)  = {attribs.angle.toFixed(1)}°<br />
          draw_angle     = −angle_deg → rad<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {drawAngleRad.toFixed(4)} rad<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {drawAngleDeg.toFixed(2)}°
        </Box>
        <Typography variant="caption" color="text.secondary">
          Magik: <code>-(angle.degrees_to_radians)</code> — negado para que ángulo positivo = rotación horaria
        </Typography>

        {useColor && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>scaled_rgb_vector(100.0)</Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#e8f5e9', p: 1, borderRadius: 1 }}>
              colour (0–1): [{rgb.map(v => v.toFixed(3)).join(', ')}]<br />
              scaled (0–100): [{scaled.map(v => v.toFixed(1)).join(', ')}]
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Magik pasa float_vec[3] con rango 0–100 a <code>sym.realise(nil, col_vec)</code>
            </Typography>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2">Instancia</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          ALLOWED_ON_MENU = {String(COcupacionDeVias.ALLOWED_ON_MENU)}<br />
          symbolNames() = {JSON.stringify(inst.symbolNames())} (GIS stub)
        </Typography>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary">Tamaño preview</Typography>
        <Slider min={120} max={400} step={20} value={previewSize}
          onChange={(_, v) => setPreviewSize(v as number)} />
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 280 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vista previa del símbolo (placeholder geométrico)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          En producción, draw_sample lee el símbolo "{attribs.name}" de sigc_style_view / symbol_bundle_table.
          La transformación aplicada aquí es idéntica a la que usa Magik.
        </Typography>

        <SymbolPreview attribs={attribs} size={previewSize} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Flujo de draw_content_on</Typography>
        <Box component="ol" sx={{ fontSize: 12, pl: 2, lineHeight: 2 }}>
          <li><code>outline_style ← line_style(white)</code></li>
          <li>Obtiene DB: <code>sigc_style_view</code> o fallback a <code>style_view</code></li>
          <li>Si <code>name</code> vacío → <code>draw_incomplete</code> ← sale</li>
          <li><code>sym ← sw_gis!gis_point_style.new_detached_record()</code></li>
          <li>Si <code>colour</code> definido → <code>col_vec ← colour.scaled_rgb_vector(100.0)</code></li>
          <li><code>sym.symbol_name ← name; sym.realise(nil, col_vec)</code></li>
          <li>Si <code>sym.actual_geoms</code> nulo → <code>draw_incomplete("unknown_symbol")</code> ← sale</li>
          <li><code>sym.draw_sample(window, bounds, rotate: −angle_rad, flipped?: flip, mirror?: mirror)</code></li>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Definición de atributos</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Atributo','Tipo','Default','Enum','Valor actual'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['name',   'string',  '"ocupacion"', 'symbol_names()', String(attribs.name)],
              ['colour', 'colour',  'unset',        '—',              attribs.colour ? rgbToCss(attribs.colour) : '(sin color)'],
              ['angle',  'float',   '0.0',          '—',              `${attribs.angle}°`],
              ['flip',   'boolean', 'false',        '—',              String(attribs.flip)],
              ['mirror', 'boolean', 'false',        '—',              String(attribs.mirror)],
            ].map(([attr, type, def, en, cur]) => (
              <tr key={attr}>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', fontWeight:'bold' }}>{attr}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, color:'#7b1fa2' }}>{type}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace' }}>{def}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, color:'#555' }}>{en}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', bgcolor:'#fffde7' }}>{cur}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
