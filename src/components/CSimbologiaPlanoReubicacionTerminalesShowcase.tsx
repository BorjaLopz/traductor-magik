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
  type SimbologiaReubicacionTerminalesAttribs,
  CSimbologiaPlanoReubicacionTerminales,
} from '../models/CSimbologiaPlanoReubicacionTerminales'

// ─── Symbol placeholder ───────────────────────────────────────────────────────
// Represents "simbología plano reubicación terminales":
// a copper terminal block being relocated — dashed origin + solid destination + arrow.

function ReubicacionTermShape({ color }: { color: string }) {
  return (
    <g>
      {/* origin terminal (dashed = existing to be removed) */}
      <rect x={-42} y={-14} width={28} height={28} rx={3}
        fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 2" opacity={0.6} />
      {/* terminal pairs inside origin */}
      {[-2, 4].map((y, i) => (
        <circle key={`o${i}`} cx={-28} cy={y} r={2.5} fill="none" stroke={color} strokeWidth={1} opacity={0.5} />
      ))}

      {/* relocation arrow */}
      <line x1={-12} y1={0} x2={10} y2={0} stroke={color} strokeWidth={1.8} markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>

      {/* destination terminal (solid = new position) */}
      <rect x={12} y={-14} width={28} height={28} rx={3}
        fill={`${color}18`} stroke={color} strokeWidth={1.8} />
      {/* terminal pairs inside destination */}
      {[-2, 4].map((y, i) => (
        <circle key={`d${i}`} cx={26} cy={y} r={2.5} fill={color} opacity={0.75} />
      ))}

      {/* label */}
      <text y={22} textAnchor="middle" fontSize={6} fill={color} fontFamily="Arial">
        REUB. TERM.
      </text>
    </g>
  )
}

// ─── Preview SVG ──────────────────────────────────────────────────────────────

interface PreviewProps {
  attribs: SimbologiaReubicacionTerminalesAttribs
  size:    number
}

function SymbolPreview({ attribs, size }: PreviewProps) {
  const cx        = size / 2
  const cy        = size / 2
  const color     = attribs.colour ? rgbToCss(attribs.colour) : '#6a1b9a'
  const transform = buildDrawTransform(cx, cy, attribs.angle, attribs.flip, attribs.mirror)
  const drawDeg   = (degreesToDrawAngle(attribs.angle) * 180) / Math.PI

  return (
    <Box>
      <svg
        width={size} height={size}
        style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block', borderRadius: 4 }}
      >
        <rect x={cx - 52} y={cy - 22} width={104} height={44}
          fill="none" stroke="#e0e0e0" strokeWidth={1} strokeDasharray="3 2" />
        <line x1={cx - 60} y1={cy} x2={cx + 60} y2={cy} stroke="#f0f0f0" strokeWidth={0.8} />
        <line x1={cx} y1={cy - 60} x2={cx} y2={cy + 60} stroke="#f0f0f0" strokeWidth={0.8} />
        <g transform={transform}>
          <ReubicacionTermShape color={color} />
        </g>
        {attribs.angle !== 0 && (
          <text x={cx + 55} y={cy - 8} fontSize={9} fill="#ff9800" fontFamily="Arial">
            {drawDeg.toFixed(1)}°
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

export function CSimbologiaPlanoReubicacionTerminalesShowcase() {
  const [attribs, setAttribs] = useState<SimbologiaReubicacionTerminalesAttribs>({ ...DEFAULT_ATTRIBS })
  const [useColor, setUseColor] = useState(false)
  const [previewSize, setPreviewSize] = useState(240)

  const set = <K extends keyof SimbologiaReubicacionTerminalesAttribs>(
    k: K, v: SimbologiaReubicacionTerminalesAttribs[K],
  ) => setAttribs(prev => ({ ...prev, [k]: v }))

  const rgb        = attribs.colour ?? [0.416, 0.106, 0.604]  // #6a1b9a
  const scaled     = scaleColorVector(rgb)
  const drawAngRad = degreesToDrawAngle(attribs.angle)
  const drawAngDeg = (drawAngRad * 180) / Math.PI

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CSimbologiaPlanoReubicacionTerminales</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Simbología de plano reubicación terminales · extends symbol_layout
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <TextField
          label='name (default: "simbologia_reubicacion_term")'
          value={attribs.name} size="small" fullWidth sx={{ mb: 1.5 }}
          helperText="Nombre del símbolo en symbol_bundle_table"
          onChange={e => set('name', e.target.value || 'simbologia_reubicacion_term')}
        />

        <TextField
          label="angle (grados)" type="number"
          value={attribs.angle} size="small" fullWidth sx={{ mb: 0.5 }}
          onChange={e => set('angle', parseFloat(e.target.value) || 0)}
        />
        <Slider min={-180} max={180} step={1} value={attribs.angle}
          onChange={(_, v) => set('angle', v as number)}
          marks={[{ value: -180, label: '-180°' }, { value: 0, label: '0°' }, { value: 180, label: '180°' }]}
          sx={{ mb: 1.5 }} />

        <FormControlLabel
          control={<Switch checked={attribs.flip}   onChange={e => set('flip',   e.target.checked)} />}
          label="flip — Girar" sx={{ display: 'block', mb: 0.5 }} />
        <FormControlLabel
          control={<Switch checked={attribs.mirror} onChange={e => set('mirror', e.target.checked)} />}
          label="mirror — Espejo" sx={{ display: 'block', mb: 1.5 }} />

        <FormControlLabel
          control={<Switch checked={useColor} onChange={e => {
            setUseColor(e.target.checked)
            set('colour', e.target.checked ? [...rgb] : undefined)
          }} />}
          label="colour override" sx={{ display: 'block', mb: 1 }} />

        {useColor && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
            <ColorSlider label="R" value={rgb[0]} onChange={v => set('colour', [v, rgb[1], rgb[2]])} />
            <ColorSlider label="G" value={rgb[1]} onChange={v => set('colour', [rgb[0], v, rgb[2]])} />
            <ColorSlider label="B" value={rgb[2]} onChange={v => set('colour', [rgb[0], rgb[1], v])} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: rgbToCss(rgb), border: '1px solid #ccc' }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{rgbToCss(rgb)}</Typography>
            </Box>
            <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 1 }}>
              scaled: [{scaled.map(v => v.toFixed(1)).join(', ')}]
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>
          degreesToDrawAngle({attribs.angle.toFixed(1)}°)<br />
          = {drawAngRad.toFixed(4)} rad ({drawAngDeg.toFixed(2)}°)
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary">Tamaño preview</Typography>
        <Slider min={140} max={420} step={20} value={previewSize}
          onChange={(_, v) => setPreviewSize(v as number)} />
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 280 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vista previa — simbología reubicación terminales (placeholder)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Terminal origen (punteado) → flecha → terminal destino (sólido).<br />
          Símbolo real: <code>"{attribs.name}"</code> desde sigc_style_view.
        </Typography>

        <SymbolPreview attribs={attribs} size={previewSize} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Familia symbol_layout — tres clases idénticas</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Clase', 'name default', 'flip label'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['COcupacionDeVias',                          '"ocupacion"',                    '"Rotar"'],
              ['CPlacaFosc350c',                           '"placa_fosc 350c"',              '"Girar"'],
              ['CSimbologiaPlanoReubicacionTerminales',     '"simbologia_reubicacion_term"',  '"Girar"'],
            ].map(([cls, name, flip]) => (
              <tr key={cls}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace',
                  bgcolor: cls === 'CSimbologiaPlanoReubicacionTerminales' ? '#fffde7' : 'transparent' }}>
                  {cls}
                </Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>{name}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>{flip}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          draw_content_on y symbol_names son byte-for-byte idénticos en las tres clases.
          Las utilidades puras viven en COcupacionDeVias y se re-exportan.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Atributos</Typography>
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
              ['name',   'string',  '"simbologia_reubicacion_term"', String(attribs.name)],
              ['colour', 'colour',  'unset',                         attribs.colour ? rgbToCss(attribs.colour) : '(sin color)'],
              ['angle',  'float',   '0.0',                           `${attribs.angle}°  →  ${drawAngDeg.toFixed(2)}° (draw)`],
              ['flip',   'boolean', 'false',                         String(attribs.flip)],
              ['mirror', 'boolean', 'false',                         String(attribs.mirror)],
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
        <Typography variant="subtitle2" gutterBottom>Instancia</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          ALLOWED_ON_MENU = {String(CSimbologiaPlanoReubicacionTerminales.ALLOWED_ON_MENU)}<br />
          symbolNames()   = [] (GIS stub — Fase 5)
        </Typography>
      </Box>
    </Box>
  )
}
