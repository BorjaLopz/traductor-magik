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
  type PlacaFosc350cAttribs,
  CPlacaFosc350c,
} from '../models/CPlacaFosc350c'

// ─── FOSC 350C symbol placeholder ────────────────────────────────────────────
// Represents a fiber optic splice closure (cierre de empalme de fibra óptica).
// In production this is read from sigc_style_view / symbol_bundle_table.

function Fosc350cShape({ color }: { color: string }) {
  return (
    <g>
      {/* outer closure body */}
      <ellipse cx={0} cy={0} rx={42} ry={22} fill="#eceff1" stroke={color} strokeWidth={1.8} />
      {/* inner splice tray area */}
      <ellipse cx={0} cy={0} rx={28} ry={13} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
      {/* fiber entry ports — left side */}
      <rect x={-50} y={-4} width={10} height={3} rx={1} fill={color} opacity={0.9} />
      <rect x={-50} y={1}  width={10} height={3} rx={1} fill={color} opacity={0.9} />
      {/* fiber entry ports — right side */}
      <rect x={40}  y={-4} width={10} height={3} rx={1} fill={color} opacity={0.9} />
      <rect x={40}  y={1}  width={10} height={3} rx={1} fill={color} opacity={0.9} />
      {/* splice points inside */}
      {[-12, -4, 4, 12].map((x, i) => (
        <circle key={i} cx={x} cy={0} r={2.5} fill={color} opacity={0.55} />
      ))}
      {/* label */}
      <text y={34} textAnchor="middle" fontSize={7} fill={color} fontFamily="Arial" fontWeight="bold">
        FOSC 350C
      </text>
    </g>
  )
}

// ─── Preview SVG ──────────────────────────────────────────────────────────────

interface PreviewProps {
  attribs: PlacaFosc350cAttribs
  size:    number
}

function SymbolPreview({ attribs, size }: PreviewProps) {
  const cx    = size / 2
  const cy    = size / 2
  const color = attribs.colour ? rgbToCss(attribs.colour) : '#0277bd'
  const transform = buildDrawTransform(cx, cy, attribs.angle, attribs.flip, attribs.mirror)
  const drawAngleDeg = (degreesToDrawAngle(attribs.angle) * 180) / Math.PI

  return (
    <Box>
      <svg
        width={size} height={size}
        style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block', borderRadius: 4 }}
      >
        {/* bounding box reference */}
        <rect
          x={cx - 55} y={cy - 30}
          width={110} height={60}
          fill="none" stroke="#e0e0e0" strokeWidth={1} strokeDasharray="3 2"
        />
        {/* axes */}
        <line x1={cx - 65} y1={cy} x2={cx + 65} y2={cy} stroke="#f0f0f0" strokeWidth={0.8} />
        <line x1={cx} y1={cy - 65} x2={cx} y2={cy + 65} stroke="#f0f0f0" strokeWidth={0.8} />

        <g transform={transform}>
          <Fosc350cShape color={color} />
        </g>

        {attribs.angle !== 0 && (
          <text x={cx + 60} y={cy - 8} fontSize={9} fill="#ff9800" fontFamily="Arial">
            {drawAngleDeg.toFixed(1)}°
          </text>
        )}
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}
        sx={{ fontFamily: 'monospace', fontSize: 10, wordBreak: 'break-all' }}>
        {transform}
      </Typography>
    </Box>
  )
}

// ─── Color channel slider ─────────────────────────────────────────────────────

function ColorSlider({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ width: 14, flexShrink: 0 }}>{label}</Typography>
      <Slider min={0} max={1} step={0.01} value={value}
        onChange={(_, v) => onChange(v as number)} sx={{ flex: 1 }} size="small" />
      <Typography variant="caption" sx={{ width: 32, textAlign: 'right', fontFamily: 'monospace' }}>
        {value.toFixed(2)}
      </Typography>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CPlacaFosc350cShowcase() {
  const [attribs, setAttribs] = useState<PlacaFosc350cAttribs>({ ...DEFAULT_ATTRIBS })
  const [useColor, setUseColor] = useState(false)
  const [previewSize, setPreviewSize] = useState(240)

  const set = <K extends keyof PlacaFosc350cAttribs>(k: K, v: PlacaFosc350cAttribs[K]) =>
    setAttribs(prev => ({ ...prev, [k]: v }))

  const rgb          = attribs.colour ?? [0.01, 0.467, 0.741]   // #0277bd
  const scaled       = scaleColorVector(rgb)
  const drawAngleRad = degreesToDrawAngle(attribs.angle)
  const drawAngleDeg = (drawAngleRad * 180) / Math.PI
  const inst         = new CPlacaFosc350c()

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlacaFosc350c</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Placa FOSC 350C — cierre de empalme de fibra óptica · extends symbol_layout
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>Atributos</Typography>

        <TextField
          label='name (default: "placa_fosc 350c")'
          value={attribs.name} size="small" fullWidth sx={{ mb: 1.5 }}
          helperText="Nombre del símbolo en symbol_bundle_table"
          onChange={e => set('name', e.target.value || 'placa_fosc 350c')}
        />

        <TextField
          label="angle (grados, default: 0.0)"
          type="number" value={attribs.angle} size="small" fullWidth sx={{ mb: 0.5 }}
          onChange={e => set('angle', parseFloat(e.target.value) || 0)}
        />
        <Slider
          min={-180} max={180} step={1} value={attribs.angle}
          onChange={(_, v) => set('angle', v as number)}
          marks={[{ value: -180, label: '-180°' }, { value: 0, label: '0°' }, { value: 180, label: '180°' }]}
          sx={{ mb: 1.5 }}
        />

        <FormControlLabel
          control={<Switch checked={attribs.flip}   onChange={e => set('flip',   e.target.checked)} />}
          label="flip — Girar (voltear vertical)"
          sx={{ display: 'block', mb: 0.5 }}
        />
        <FormControlLabel
          control={<Switch checked={attribs.mirror} onChange={e => set('mirror', e.target.checked)} />}
          label="mirror — Espejo (horizontal)"
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
          draw_angle     = −({attribs.angle.toFixed(1)} × π/180)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {drawAngleRad.toFixed(4)} rad<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= {drawAngleDeg.toFixed(2)}°
        </Box>

        {useColor && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>scaled_rgb_vector(100.0)</Typography>
            <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#e8f5e9', p: 1, borderRadius: 1 }}>
              colour (0–1):&nbsp;&nbsp; [{rgb.map(v => v.toFixed(3)).join(', ')}]<br />
              scaled (0–100): [{scaled.map(v => v.toFixed(1)).join(', ')}]
            </Box>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2">Instancia</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          ALLOWED_ON_MENU = {String(CPlacaFosc350c.ALLOWED_ON_MENU)}<br />
          symbolNames() = [] (GIS stub)
        </Typography>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary">Tamaño preview</Typography>
        <Slider min={140} max={420} step={20} value={previewSize}
          onChange={(_, v) => setPreviewSize(v as number)} />
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 280 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vista previa — FOSC 350C (placeholder geométrico)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          En producción, draw_sample lee el símbolo <code>"{attribs.name}"</code> de
          sigc_style_view / symbol_bundle_table. La transformación aplicada es idéntica
          a la que usa Magik.
        </Typography>

        <SymbolPreview attribs={attribs} size={previewSize} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Relación con COcupacionDeVias
        </Typography>
        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 1, fontSize: 12, mb: 2 }}>
          <Typography variant="body2">
            Ambas clases extienden <code>symbol_layout</code> y tienen
            <strong> draw_content_on</strong> y <strong>symbol_names</strong> idénticos.
            Única diferencia en Magik:
          </Typography>
          <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, mt: 1, width: '100%' }}>
            <thead>
              <tr>
                {['','c_ocupacion_de_vias','c_placa_fosc350c'].map(h => (
                  <Box component="th" key={h}
                    sx={{ border: '1px solid #90caf9', px: 1, py: 0.3, background: '#bbdefb', textAlign: 'left' }}>
                    {h}
                  </Box>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['name default', '"ocupacion"', '"placa_fosc 350c"'],
                ['flip label', '"Rotar"', '"Girar"'],
                ['draw_content_on', 'idéntico', 'idéntico'],
                ['symbol_names', 'idéntico', 'idéntico'],
              ].map(([attr, a, b]) => (
                <tr key={attr}>
                  <Box component="td" sx={{ border:'1px solid #e3f2fd', px:1, py:0.3, fontWeight:'bold' }}>{attr}</Box>
                  <Box component="td" sx={{ border:'1px solid #e3f2fd', px:1, py:0.3, fontFamily:'monospace' }}>{a}</Box>
                  <Box component="td" sx={{ border:'1px solid #e3f2fd', px:1, py:0.3, fontFamily:'monospace', bgcolor:'#fffde7' }}>{b}</Box>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        <Typography variant="subtitle2" gutterBottom>Atributos del símbolo</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Atributo', 'Tipo', 'Default', 'Valor actual'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['name',   'string',  '"placa_fosc 350c"', String(attribs.name)],
              ['colour', 'colour',  'unset',             attribs.colour ? rgbToCss(attribs.colour) : '(sin color)'],
              ['angle',  'float',   '0.0',               `${attribs.angle}°  →  ${drawAngleDeg.toFixed(2)}° (draw)`],
              ['flip',   'boolean', 'false',             String(attribs.flip)],
              ['mirror', 'boolean', 'false',             String(attribs.mirror)],
            ].map(([attr, type, def, cur]) => (
              <tr key={attr}>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', fontWeight:'bold' }}>{attr}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, color:'#7b1fa2' }}>{type}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace' }}>{def}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', bgcolor:'#fffde7' }}>{cur}</Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Utilidades compartidas (re-exportadas de COcupacionDeVias)</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          degreesToDrawAngle({attribs.angle}) = {drawAngleRad.toFixed(4)} rad<br />
          {useColor
            ? `scaleColorVector([${rgb.map(v=>v.toFixed(2)).join(',')}]) = [${scaled.map(v=>v.toFixed(1)).join(',')}]`
            : 'scaleColorVector([r,g,b]) — sólo activo cuando colour ≠ unset'
          }<br />
          buildDrawTransform(cx, cy, {attribs.angle}, {String(attribs.flip)}, {String(attribs.mirror)})
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          Misma lógica que COcupacionDeVias — re-exportada, no duplicada.
        </Typography>
      </Box>
    </Box>
  )
}
