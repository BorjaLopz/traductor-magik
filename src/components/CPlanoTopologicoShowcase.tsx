import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'
import {
  LINE_STYLE_EXISTENTE,
  LINE_STYLE_RED_EXISTENTE,
  LINE_STYLE_PROYECTADA,
  TEXT_STYLE_CALLE,
  TEXT_STYLE_RESERVA,
  TEXT_STYLE_CABLE_EXISTENTE,
  TEXT_STYLE_CABLE_PROYECTADO,
  SELLO_X_U,
  SELLO_Y_U,
  SELLO_ANCHO_U,
  SELLO_ALTO_U,
  CHAR_WIDTH_U,
  getCableLabel,
  normalizeOrientation,
  textWidthU,
  lineStyleForStatus,
  lineStyleForReserva,
  textStyleForCable,
  type ConstructionStatus,
  type LineStyleDef,
  type TextStyleDef,
  CPlanoTopologico,
} from '../models/CPlanoTopologico'

// ─── Layout mockup SVG ────────────────────────────────────────────────────────

const PAGE_W = 2500   // layout units
const PAGE_H = 1800

interface MockCanaliz {
  id:     string
  points: [number, number][]
  status: ConstructionStatus
}

interface MockReserva {
  id:     string
  points: [number, number][]
  status: ConstructionStatus
  pares:  number
  endX:   number
  endY:   number
}

interface MockCalle {
  label: string
  x: number
  y: number
  angle: number
}

interface MockCaja {
  x: number
  y: number
  label: string
}

const MOCK_CANALIZ: MockCanaliz[] = [
  { id: 'TC-01', points: [[300,900],[700,900],[700,600],[1100,600]], status: 'EXISTENTE'  },
  { id: 'TC-02', points: [[300,900],[700,900],[700,1200],[1100,1200]], status: 'EXISTENTE' },
  { id: 'TC-03', points: [[1100,600],[1500,600],[1500,900]], status: 'OPERACION' },
  { id: 'TC-04', points: [[1100,600],[1100,300]], status: 'PROYECTADO' },
]

const MOCK_RESERVAS: MockReserva[] = [
  { id: 'R-01', points: [[700,900],[900,900]], status: 'EXISTENTE',  pares: 50, endX: 900, endY: 900 },
  { id: 'R-02', points: [[1100,600],[1100,750]], status: 'PROYECTADO', pares: 24, endX: 1100, endY: 750 },
]

const MOCK_CALLES: MockCalle[] = [
  { label: 'AV. INSURGENTES', x: 500, y: 850, angle: 0 },
  { label: 'CALLE REFORMA',   x: 300, y: 1100, angle: -15 },
]

const MOCK_CAJAS: MockCaja[] = [
  { x: 700,  y: 900,  label: 'DTO-1' },
  { x: 1100, y: 600,  label: 'DTO-2' },
  { x: 1500, y: 900,  label: 'DTO-3' },
]

function polylinePoints(pts: [number, number][], s: number): string {
  return pts.map(([x, y]) => `${x * s},${y * s}`).join(' ')
}

function hexToRgba(hex: string, a = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

interface PlanSvgProps { scale: number }

function PlanSvg({ scale }: PlanSvgProps) {
  const W = PAGE_W * scale
  const H = PAGE_H * scale
  const s = scale

  // Sello in layout units → scaled
  const sx = SELLO_X_U * s
  const sy = (PAGE_H - SELLO_Y_U - SELLO_ALTO_U) * s
  const sw = SELLO_ANCHO_U * s
  const sh = SELLO_ALTO_U * s

  return (
    <svg width={W} height={H} style={{ border: '1px solid #999', background: '#f8f8f8', display: 'block' }}>
      {/* page border */}
      <rect x={0} y={0} width={W} height={H} fill="white" stroke="#999" strokeWidth={1} />

      {/* calles — green text */}
      {MOCK_CALLES.map(c => (
        <text
          key={c.label}
          x={c.x * s} y={c.y * s}
          fontSize={TEXT_STYLE_CALLE.fontSize * s * 20}
          fill={TEXT_STYLE_CALLE.color}
          fontFamily="Arial"
          transform={`rotate(${c.angle},${c.x * s},${c.y * s})`}
          opacity={0.7}
        >
          {c.label}
        </text>
      ))}

      {/* canaliz lines — only EXISTENTE / OPERACION drawn */}
      {MOCK_CANALIZ.map(tc => {
        const style = lineStyleForStatus(tc.status)
        if (!style) return null
        return (
          <polyline
            key={tc.id}
            points={polylinePoints(tc.points, s)}
            fill="none"
            stroke={style.color}
            strokeWidth={style.width * s * 3}
          />
        )
      })}

      {/* reservas */}
      {MOCK_RESERVAS.map(r => {
        const style = lineStyleForReserva(r.status)
        return (
          <g key={r.id}>
            <polyline
              points={polylinePoints(r.points, s)}
              fill="none"
              stroke={style.color}
              strokeWidth={style.width * s * 3}
              strokeDasharray={r.status === 'PROYECTADO' ? `${4*s} ${2*s}` : undefined}
            />
            {/* symbol placeholder */}
            <circle cx={r.endX * s} cy={r.endY * s} r={8 * s} fill={hexToRgba(style.color, 0.3)} stroke={style.color} strokeWidth={s} />
            <text x={(r.endX + 15) * s} y={r.endY * s} fontSize={5 * s * 18} fill={TEXT_STYLE_RESERVA.color} fontFamily="Arial">
              {r.pares} PS
            </text>
          </g>
        )
      })}

      {/* cajas (distribution boxes) */}
      {MOCK_CAJAS.map(c => (
        <g key={c.label}>
          <rect x={(c.x - 12) * s} y={(c.y) * s} width={24 * s} height={30 * s} fill="#fff9c4" stroke="#888" strokeWidth={s * 0.5} />
          <text x={c.x * s} y={(c.y + 22) * s} textAnchor="middle" fontSize={5 * s * 16} fill="#555" fontFamily="Arial">
            {c.label}
          </text>
        </g>
      ))}

      {/* central symbol */}
      <rect x={260 * s} y={850 * s} width={40 * s} height={40 * s} fill="#e3f2fd" stroke="#1565c0" strokeWidth={s} />
      <text x={280 * s} y={(850 + 28) * s} textAnchor="middle" fontSize={5 * s * 16} fill="#1565c0" fontFamily="Arial" fontWeight="bold">CTL</text>

      {/* sello stamp */}
      <rect x={sx} y={sy} width={sw} height={sh} fill="#fffde7" stroke="#f9a825" strokeWidth={1.5} />
      <text x={sx + sw / 2} y={sy + sh / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(7, sh * 0.35)} fill="#795548" fontFamily="Arial">
        c_sello_estandar · Topologico · {(SELLO_X_U/10).toFixed(0)}mm,{(SELLO_Y_U/10).toFixed(0)}mm · {(SELLO_ANCHO_U/10).toFixed(0)}×{(SELLO_ALTO_U/10).toFixed(0)} mm
      </text>

      {/* legend label */}
      <text x={5} y={12 * s} fontSize={Math.max(6, 7 * s)} fill="#555" fontFamily="Arial">Mockup conceptual — escala libre</text>
    </svg>
  )
}

// ─── Style reference table ─────────────────────────────────────────────────────

interface StyleRowProps { name: string; style: LineStyleDef | TextStyleDef; type: 'line' | 'text' }

function StyleRow({ name, style, type }: StyleRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      {type === 'line' ? (
        <svg width={50} height={12}>
          <line x1={2} y1={6} x2={48} y2={6} stroke={(style as LineStyleDef).color} strokeWidth={(style as LineStyleDef).width * 2} />
        </svg>
      ) : (
        <Typography sx={{ color: (style as TextStyleDef).color, fontFamily: 'Arial', fontSize: (style as TextStyleDef).fontSize * 2, minWidth: 50 }}>
          Texto
        </Typography>
      )}
      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
        {name}
      </Typography>
      <Chip label={(style as LineStyleDef).color ?? (style as TextStyleDef).color} size="small"
        sx={{ bgcolor: (style as LineStyleDef).color ?? (style as TextStyleDef).color, color: '#fff', fontSize: 10, height: 18 }} />
      {'width' in style && (
        <Typography variant="caption" color="text.secondary">w={style.width}</Typography>
      )}
      {'fontSize' in style && (
        <Typography variant="caption" color="text.secondary">fs={style.fontSize}</Typography>
      )}
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CPlanoTopologicoShowcase() {
  const [specId,    setSpecId]    = useState('CABLE_50P(EXISTENTE)_2024')
  const [oriDeg,    setOriDeg]    = useState(100)
  const [planScale, setPlanScale] = useState(0.18)

  const label      = getCableLabel(specId)
  const oriRad     = (oriDeg * Math.PI) / 180
  const normRad    = normalizeOrientation(oriRad)
  const normDeg    = (normRad * 180) / Math.PI
  const textWidth  = textWidthU(label)

  const inst = new CPlanoTopologico()

  const statusOptions: ConstructionStatus[] = ['EXISTENTE', 'OPERACION', 'PROYECTADO', 'PLANEADO']

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoTopologico</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Genera plano topológico de canalizaciones · Extiende layout_element + viewport_layout_mixin
        </Typography>

        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="COMPLEJO" size="small" color="error" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2">Constantes de sello (layout units → mm)</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
          SELLO_X_U     = {SELLO_X_U}  ({SELLO_X_U/10} mm)<br />
          SELLO_Y_U     = {SELLO_Y_U}  ({SELLO_Y_U/10} mm)<br />
          SELLO_ANCHO_U = {SELLO_ANCHO_U}  ({SELLO_ANCHO_U/10} mm)<br />
          SELLO_ALTO_U  = {SELLO_ALTO_U}  ({SELLO_ALTO_U/10} mm)<br />
          CHAR_WIDTH_U  = {CHAR_WIDTH_U}
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>getCableLabel(specId)</Typography>
        <TextField
          label="spec_id" value={specId} size="small" fullWidth
          onChange={e => setSpecId(e.target.value)}
          helperText='Corta hasta el primer "("'
          sx={{ mb: 1 }}
        />
        <Box sx={{ fontFamily: 'monospace', fontSize: 12, bgcolor: '#e8f5e9', p: 1, borderRadius: 1, mb: 1 }}>
          getCableLabel("{specId}")<br />
          → "{label}"<br />
          textWidthU = {textWidth} units
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>normalizeOrientation(θ)</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Normaliza ángulo a (−90°, 90°] para que el texto no rote al revés
        </Typography>
        <Slider
          min={-180} max={180} step={1} value={oriDeg}
          onChange={(_, v) => setOriDeg(v as number)}
          marks={[{value:-90,label:'-90°'},{value:0,label:'0°'},{value:90,label:'90°'}]}
        />
        <Box sx={{ fontFamily: 'monospace', fontSize: 12, bgcolor: '#fff3e0', p: 1, borderRadius: 1, mb: 1 }}>
          entrada: {oriDeg.toFixed(1)}° ({oriRad.toFixed(3)} rad)<br />
          salida:  {normDeg.toFixed(1)}° ({normRad.toFixed(3)} rad)
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" gutterBottom>lineStyleForStatus / textStyleForCable</Typography>
        {statusOptions.map(s => {
          const ls = lineStyleForStatus(s)
          const ts = textStyleForCable(s)
          return (
            <Box key={s} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
              <Chip label={s} size="small" sx={{ fontSize: 10, height: 18, minWidth: 90 }} />
              {ls
                ? <svg width={30} height={10}><line x1={2} y1={5} x2={28} y2={5} stroke={ls.color} strokeWidth={ls.width * 2}/></svg>
                : <Typography variant="caption" color="text.secondary">sin línea</Typography>
              }
              {ts && <Typography variant="caption" sx={{ color: ts.color, fontWeight: 'bold', fontSize: ts.fontSize * 1.5 }}>cable</Typography>}
            </Box>
          )
        })}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2">lineStyleForReserva</Typography>
        {(['EXISTENTE', 'PROYECTADO'] as ConstructionStatus[]).map(s => {
          const style = lineStyleForReserva(s)
          return (
            <Box key={s} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
              <Chip label={s} size="small" sx={{ fontSize: 10, height: 18, minWidth: 90 }} />
              <svg width={40} height={12}>
                <line x1={2} y1={6} x2={38} y2={6}
                  stroke={style.color} strokeWidth={style.width * 2}
                  strokeDasharray={s === 'PROYECTADO' ? '6 3' : undefined}
                />
              </svg>
              <Typography variant="caption" color="text.secondary">{style.color}</Typography>
            </Box>
          )
        })}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2">buscarCablesEnTramo (pure)</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          inst.buscarCablesEnTramo(tramo)<br />
          → CableCobre[] (filtra cables con copperCable definido)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Retorna: {JSON.stringify(inst.buscarCablesEnTramo({
            sectors: null,
            rwo: {
              constructionStatus: 'EXISTENTE',
              annotation1: { stringBuffer: '' },
              cables: [
                { specId: 'X', constructionStatus: 'EXISTENTE', copperCable: { specId: 'C1', constructionStatus: 'EXISTENTE' } },
                { specId: 'Y', constructionStatus: 'PROYECTADO' },
              ]
            }
          }))}
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 400, overflow: 'auto' }}>
        <Typography variant="subtitle2" gutterBottom>
          Mockup conceptual del plano generado
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Zoom ({(planScale * 100).toFixed(0)}%)
        </Typography>
        <Slider min={0.08} max={0.4} step={0.01} value={planScale}
          onChange={(_, v) => setPlanScale(v as number)} sx={{ mb: 1, maxWidth: 300 }} />

        <PlanSvg scale={planScale} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Estilos de línea y texto</Typography>

        <Typography variant="caption" color="text.secondary" display="block">Líneas</Typography>
        <StyleRow name="LINE_STYLE_EXISTENTE"     style={LINE_STYLE_EXISTENTE}     type="line" />
        <StyleRow name="LINE_STYLE_RED_EXISTENTE" style={LINE_STYLE_RED_EXISTENTE} type="line" />
        <StyleRow name="LINE_STYLE_PROYECTADA"    style={LINE_STYLE_PROYECTADA}    type="line" />

        <Typography variant="caption" color="text.secondary" display="block" mt={1}>Textos</Typography>
        <StyleRow name="TEXT_STYLE_CALLE"            style={TEXT_STYLE_CALLE}            type="text" />
        <StyleRow name="TEXT_STYLE_RESERVA"          style={TEXT_STYLE_RESERVA}          type="text" />
        <StyleRow name="TEXT_STYLE_CABLE_EXISTENTE"  style={TEXT_STYLE_CABLE_EXISTENTE}  type="text" />
        <StyleRow name="TEXT_STYLE_CABLE_PROYECTADO" style={TEXT_STYLE_CABLE_PROYECTADO} type="text" />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Métodos del plano (resumen)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['Método','Fase','Descripción'].map(h => (
                <Box component="th" key={h} sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['generarPlano()', 5, 'Orquestador principal: sectores → dib_geom_layout'],
              ['dibGeomLayout()', 5, 'Dibuja líneas, cajas, central, calles, reservas, sello'],
              ['agregarSello()', 5, 'c_sello_estandar en (30,25)mm · 190×15 mm'],
              ['agregarReservas()', 5, 'Obtiene user!_reserva en trazo y las dibuja'],
              ['agregarCalles()', 5, 'Obtiene user!_eje_calle y pone texto verde'],
              ['agregarCajas()', 5, 'Symbol + c_dto_pronostico por cada caja'],
              ['agregarEstructura()', 5, 'Symbol "central" + siglas'],
              ['texlayoutDelTramo()', 5, 'annotation_1 + cables del tramo'],
              ['buscarCablesEnTramo()', '—', 'Pure: filtra copperCable del tramo'],
              ['getCableLabel()', '—', 'Pure: spec_id hasta primer "("'],
              ['normalizeOrientation()', '—', 'Pure: ángulo → (−π/2, π/2]'],
              ['obtenerTcanaliz()', 5, 'GIS selection de underground_route chains'],
              ['obtenerEstructurasTcanaliz()', 5, 'connected_structures() filtradas por tipo'],
            ].map(([m, f, d]) => (
              <tr key={String(m)}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{m}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, textAlign: 'center' }}>{f}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, color: '#555' }}>{d}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
