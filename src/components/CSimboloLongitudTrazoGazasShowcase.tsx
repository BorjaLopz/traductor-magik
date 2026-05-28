import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Slider from '@mui/material/Slider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import bitmapUrl from '../assets/assets/c_simbolo_longitud_trazo_gazas.png'
import {
  DEFAULT_ATTRIBS,
  degreesToDrawAngle,
  scaleColorVector,
  rgbToCss,
  buildDrawTransform,
  type SimboloLongitudTrazoGazasAttribs,
  CSimboloLongitudTrazoGazas,
} from '../models/CSimboloLongitudTrazoGazas'

// ─── Symbol placeholder ───────────────────────────────────────────────────────
// "Longitud trazo gazas" = fiber loop length indicator in a splice diagram.
// A gaza is a fiber slack loop; this symbol marks the measured length of
// the loop trace between two splice points.

function LongitudGazasShape({ color }: { color: string }) {
  // Dimension line with fiber loop coil in the middle
  return (
    <g>
      {/* left tick */}
      <line x1={-44} y1={-10} x2={-44} y2={10} stroke={color} strokeWidth={1.5} />
      {/* right tick */}
      <line x1={44}  y1={-10} x2={44}  y2={10} stroke={color} strokeWidth={1.5} />
      {/* dimension line left segment */}
      <line x1={-44} y1={0} x2={-20} y2={0} stroke={color} strokeWidth={1.2} />
      {/* dimension line right segment */}
      <line x1={20}  y1={0} x2={44}  y2={0} stroke={color} strokeWidth={1.2} />
      {/* fiber loop / gaza coil */}
      <path
        d="M -20,0 C -16,-18 -8,-18 0,-8 C 8,2 16,-14 20,0"
        fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
      {/* arrowheads */}
      <polygon points="-44,0 -38,-3 -38,3" fill={color} />
      <polygon points="44,0 38,-3 38,3"  fill={color} />
      {/* length label */}
      <text y={22} textAnchor="middle" fontSize={6} fill={color} fontFamily="Arial">
        L. TRAZO GAZAS
      </text>
    </g>
  )
}

// ─── Preview SVG ──────────────────────────────────────────────────────────────

interface PreviewProps {
  attribs: SimboloLongitudTrazoGazasAttribs
  size:    number
}

function SymbolPreview({ attribs, size }: PreviewProps) {
  const cx        = size / 2
  const cy        = size / 2
  const color     = attribs.colour ? rgbToCss(attribs.colour) : '#1565c0'
  const transform = buildDrawTransform(cx, cy, attribs.angle, attribs.flip, attribs.mirror)
  const drawDeg   = (degreesToDrawAngle(attribs.angle) * 180) / Math.PI

  return (
    <Box>
      <svg
        width={size} height={size}
        style={{ border: '1px solid #ccc', background: '#fafafa', display: 'block', borderRadius: 4 }}
      >
        <rect x={cx - 52} y={cy - 18} width={104} height={36}
          fill="none" stroke="#e0e0e0" strokeWidth={1} strokeDasharray="3 2" />
        <line x1={cx - 62} y1={cy} x2={cx + 62} y2={cy} stroke="#f0f0f0" strokeWidth={0.8} />
        <line x1={cx} y1={cy - 62} x2={cx} y2={cy + 62} stroke="#f0f0f0" strokeWidth={0.8} />
        <g transform={transform}>
          <LongitudGazasShape color={color} />
        </g>
        {attribs.angle !== 0 && (
          <text x={cx + 58} y={cy - 10} fontSize={9} fill="#ff9800" fontFamily="Arial">
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

export function CSimboloLongitudTrazoGazasShowcase() {
  const [attribs, setAttribs] = useState<SimboloLongitudTrazoGazasAttribs>({ ...DEFAULT_ATTRIBS })
  const [useColor, setUseColor] = useState(false)
  const [previewSize, setPreviewSize] = useState(240)

  const set = <K extends keyof SimboloLongitudTrazoGazasAttribs>(
    k: K, v: SimboloLongitudTrazoGazasAttribs[K],
  ) => setAttribs(prev => ({ ...prev, [k]: v }))

  const rgb        = attribs.colour ?? [0.082, 0.396, 0.753]  // #1565c0
  const scaled     = scaleColorVector(rgb)
  const drawAngRad = degreesToDrawAngle(attribs.angle)
  const drawAngDeg = (drawAngRad * 180) / Math.PI

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CSimboloLongitudTrazoGazas</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Símbolo longitud trazo gazas · diagrama de empalmes · extends symbol_layout
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        {/* Bitmap original */}
        <Typography variant="subtitle2" gutterBottom>Bitmap original (resources/base/bitmaps)</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5,
          bgcolor: '#263238', p: 1.5, borderRadius: 1 }}>
          <img
            src={bitmapUrl}
            alt="c_simbolo_longitud_trazo_gazas"
            style={{ imageRendering: 'pixelated', width: 48, height: 48 }}
          />
          <Box>
            <Typography variant="caption" sx={{ color: '#b0bec5', fontFamily: 'monospace', fontSize: 10 }}>
              c_simbolo_longitud_trazo_gazas.png
            </Typography>
            <Typography variant="caption" sx={{ color: '#78909c', display: 'block', fontSize: 10 }}>
              Icono del layout element en el designer
            </Typography>
          </Box>
        </Box>

        <TextField
          label='name (default: "longitud trazo gazas")'
          value={attribs.name} size="small" fullWidth sx={{ mb: 1.5 }}
          helperText="Nombre del símbolo en symbol_bundle_table"
          onChange={e => set('name', e.target.value || 'longitud trazo gazas')}
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
          label='flip — "Flip"' sx={{ display: 'block', mb: 0.5 }} />
        <FormControlLabel
          control={<Switch checked={attribs.mirror} onChange={e => set('mirror', e.target.checked)} />}
          label='mirror — "Mirror"' sx={{ display: 'block', mb: 1.5 }} />

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
          Vista previa — longitud trazo gazas (placeholder geométrico)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Indicador de longitud de gaza (fiber slack loop) entre empalmes.<br />
          Símbolo real: <code>"{attribs.name}"</code> desde sigc_style_view.
        </Typography>

        <SymbolPreview attribs={attribs} size={previewSize} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Familia symbol_layout — cuatro clases</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Clase', 'name default', 'flip', 'mirror'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['COcupacionDeVias',                      '"ocupacion"',                   '"Rotar"', '"Espejo"'],
              ['CPlacaFosc350c',                        '"placa_fosc 350c"',             '"Girar"', '"Espejo"'],
              ['CSimbologiaPlanoReubicacionTerminales', '"simbologia_reubicacion_term"', '"Girar"', '"Espejo"'],
              ['CSimboloLongitudTrazoGazas',            '"longitud trazo gazas"',        '"Flip"',  '"Mirror"'],
            ].map(([cls, name, flip, mirror]) => (
              <tr key={cls}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace',
                  bgcolor: cls === 'CSimboloLongitudTrazoGazas' ? '#fffde7' : 'transparent',
                  fontSize: 10 }}>
                  {cls}
                </Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{name}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontSize: 10 }}>{flip}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontSize: 10 }}>{mirror}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          draw_content_on y symbol_names idénticos en las cuatro.
          Utilidades puras re-exportadas desde COcupacionDeVias.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Atributos</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Atributo', 'Tipo', 'Default', 'Descripción Magik', 'Valor actual'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['name',   'string',  '"longitud trazo gazas"', '"Longitud trazo gazas"', String(attribs.name)],
              ['colour', 'colour',  'unset',                  '"Cambiar color para el simbolo"', attribs.colour ? rgbToCss(attribs.colour) : '(sin color)'],
              ['angle',  'float',   '0.0',                    '"Angulo"',               `${attribs.angle}° → ${drawAngDeg.toFixed(2)}°`],
              ['flip',   'boolean', 'false',                  '"Flip"',                 String(attribs.flip)],
              ['mirror', 'boolean', 'false',                  '"Mirror"',               String(attribs.mirror)],
            ].map(([attr, type, def, desc, cur]) => (
              <tr key={attr}>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', fontWeight:'bold' }}>{attr}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, color:'#7b1fa2' }}>{type}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace' }}>{def}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, color:'#555', fontStyle:'italic' }}>{desc}</Box>
                <Box component="td" sx={{ border:'1px solid #eee', px:1, py:0.3, fontFamily:'monospace', bgcolor:'#fffde7' }}>{cur}</Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Instancia</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          ALLOWED_ON_MENU = {String(CSimboloLongitudTrazoGazas.ALLOWED_ON_MENU)}<br />
          symbolNames()   = [] (GIS stub — Fase 5)
        </Typography>
      </Box>
    </Box>
  )
}
