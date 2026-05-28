import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Slider from '@mui/material/Slider'
import {
  calcularTotal,
  numFilas,
  filaLayout,
  COL_WIDTH,
  ROW_HEIGHT,
  NUM_COLS,
  TOTAL_WIDTH,
  TABLE_NAME,
  COL_HEADERS,
  CELL_COLORS,
  CSelloAumentosSecundarios,
  type DatosAumento,
} from '../models/CSelloAumentosSecundarios'

// ─── Table SVG ────────────────────────────────────────────────────────────────

const SCALE   = 4.2   // px per mm
const CW      = COL_WIDTH  * SCALE   // px per column
const RH      = ROW_HEIGHT * SCALE   // px per row
const TW      = TOTAL_WIDTH * SCALE  // total width px
const STROKE  = '#444'
const HEADER_BG  = '#e8eaf6'
const TITLE_BG   = '#283593'
const TITLE_TEXT = '#ffffff'

interface TablePreviewProps {
  redDirecta:   boolean
  nombreDto:    string
  datos:        DatosAumento
}

function TablePreview({ redDirecta, nombreDto, datos }: TablePreviewProps) {
  const filas    = numFilas(redDirecta)
  const layout   = filaLayout(redDirecta)
  const total    = calcularTotal(datos)
  const totalH   = filas * RH

  function HLine({ y }: { y: number }) {
    return <line x1={0} y1={y} x2={TW} y2={y} stroke={STROKE} strokeWidth={0.8} />
  }
  function VLine({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
    return <line x1={x} y1={y1} x2={x} y2={y2} stroke={STROKE} strokeWidth={0.8} />
  }

  function Cell({
    col, row, text, bg = 'white', color = '#222', fontSize = 6, bold = false,
  }: {
    col: number; row: number; text: string
    bg?: string; color?: string; fontSize?: number; bold?: boolean
  }) {
    const x  = (col - 1) * CW
    const y  = (row - 1) * RH
    const cx = x + CW / 2
    const cy = y + RH / 2 + 0.5
    return (
      <>
        <rect x={x} y={y} width={CW} height={RH} fill={bg} />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={fontSize} fontWeight={bold ? 'bold' : 'normal'}
          fontFamily="Arial, sans-serif" fill={color}
        >
          {text}
        </text>
      </>
    )
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg
        width={TW + 2}
        height={totalH + 2}
        style={{ display: 'block' }}
      >
        <g transform="translate(1,1)">
          {/* Background */}
          <rect x={0} y={0} width={TW} height={totalH} fill="white" stroke={STROKE} strokeWidth={0.8} />

          {/* RED DIRECTA row — full width, merged (no internal verticals) */}
          {redDirecta && (
            <>
              <rect x={0} y={0} width={TW} height={RH} fill={TITLE_BG} />
              <text
                x={TW / 2} y={RH / 2 + 0.5}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fontWeight="bold" fontFamily="Arial, sans-serif" fill={TITLE_TEXT}
              >
                RED DIRECTA
              </text>
              <HLine y={RH} />
            </>
          )}

          {/* Header row */}
          {COL_HEADERS.map((h, i) => (
            <Cell key={h} col={i + 1} row={layout.filaTitulo}
              text={h} bg={HEADER_BG} fontSize={5.5} bold />
          ))}
          <HLine y={layout.filaTitulo * RH} />

          {/* Value row */}
          {[
            { text: nombreDto,                   color: '#222'             },
            { text: String(datos.existente),     color: CELL_COLORS.existente   },
            { text: String(datos.proyectado),    color: CELL_COLORS.proyectado  },
            { text: String(datos.largoPlayzo),   color: CELL_COLORS.largoPlayzo },
            { text: String(total),               color: CELL_COLORS.total       },
          ].map(({ text, color }, i) => (
            <Cell key={i} col={i + 1} row={layout.filaValor}
              text={text} color={color} fontSize={6.5} bold={i > 0} />
          ))}

          {/* Grid lines */}
          <HLine y={totalH} />
          <VLine x={0}      y1={0} y2={totalH} />
          <VLine x={TW}     y1={0} y2={totalH} />
          {[1, 2, 3, 4].map(i => (
            <VLine key={i} x={i * CW}
              y1={redDirecta ? RH : 0}   // internal verticals start below RED DIRECTA row
              y2={totalH}
            />
          ))}
        </g>
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}
        sx={{ fontFamily: 'monospace', fontSize: 10 }}>
        {TABLE_NAME} · {NUM_COLS} cols × {COL_WIDTH} mm · {filas} rows × {ROW_HEIGHT} mm
        · {TW.toFixed(0)} × {totalH.toFixed(0)} px
      </Typography>
    </Box>
  )
}

// ─── Number input row ─────────────────────────────────────────────────────────

function NumField({
  label, value, color, onChange,
}: { label: string; value: number; color: string; onChange: (v: number) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <TextField
        label={label} type="number" value={value} size="small"
        sx={{ width: 130 }}
        inputProps={{ min: 0 }}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      />
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CSelloAumentosSecundariosShowcase() {
  const [redDirecta,  setRedDirecta]  = useState(false)
  const [nombreDto,   setNombreDto]   = useState('DTO-123')
  const [datos, setDatos] = useState<DatosAumento>({
    existente:   240,
    proyectado:  48,
    largoPlayzo: 0,
  })
  const [scale, setScale] = useState(4.2)

  const total   = calcularTotal(datos)
  const filas   = numFilas(redDirecta)
  const layout  = filaLayout(redDirecta)

  function setField(k: keyof DatosAumento, v: number) {
    setDatos(prev => ({ ...prev, [k]: v }))
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CSelloAumentosSecundarios</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Sello aumento de red secundaria · extends layout_element
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <FormControlLabel
          control={<Switch checked={redDirecta} onChange={e => setRedDirecta(e.target.checked)} />}
          label={<Typography variant="body2">red_directa? (distrito.rwo.es_red_directa?)</Typography>}
          sx={{ display: 'block', mb: 1.5 }}
        />

        <TextField
          label="nombre distrito (GIS stub)"
          value={nombreDto} size="small" fullWidth sx={{ mb: 1.5 }}
          helperText="distrito.rwo.user!_distrito"
          onChange={e => setNombreDto(e.target.value || 'DTO-123')}
        />

        <Typography variant="subtitle2" gutterBottom>obtener_numero_pares() — stub</Typography>
        <NumField label="existente"   value={datos.existente}   color={CELL_COLORS.existente}   onChange={v => setField('existente',   v)} />
        <NumField label="proyectado"  value={datos.proyectado}  color={CELL_COLORS.proyectado}  onChange={v => setField('proyectado',  v)} />
        <NumField label="largoPlayzo" value={datos.largoPlayzo} color={CELL_COLORS.largoPlayzo} onChange={v => setField('largoPlayzo', v)} />

        <Box sx={{ bgcolor: '#fffde7', p: 1, borderRadius: 1, mt: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            calcularTotal → {total}<br />
            (proyectado={datos.proyectado} + existente={datos.existente} + largoPlayzo={datos.largoPlayzo})
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>numFilas / filaLayout</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            numFilas({String(redDirecta)}) = {filas}<br />
            filaLayout → filaTitulo={layout.filaTitulo}, filaValor={layout.filaValor}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Geometría</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', mb: 1 }}>
          <tbody>
            {[
              ['Cols', `${NUM_COLS} × ${COL_WIDTH} mm = ${TOTAL_WIDTH} mm`],
              ['Row height', `${ROW_HEIGHT} mm`],
              ['Normal rows', '2'],
              ['Red directa rows', '3'],
              ['Row-1 borders', 'right/internal hidden → merged cell'],
            ].map(([k, v]) => (
              <tr key={k}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontWeight: 'bold', fontSize: 10.5 }}>{k}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{v}</Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Escala preview ({scale.toFixed(1)} px/mm)
        </Typography>
        <Slider min={2} max={8} step={0.2} value={scale}
          onChange={(_, v) => setScale(v as number)} size="small" />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Instancia</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          ALLOWED_ON_MENU = {String(CSelloAumentosSecundarios.ALLOWED_ON_MENU)}<br />
          id_distrito: string | undefined<br />
          (defined_attributes → layout_attribute_definition)
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 320 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vista previa — {TABLE_NAME}
          {redDirecta && <Chip label="RED DIRECTA" size="small" sx={{ ml: 1, bgcolor: '#283593', color: '#fff', fontSize: 10 }} />}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          {redDirecta
            ? 'Fila 1: "RED DIRECTA" (celda fusionada) → fila 2: títulos → fila 3: valores'
            : 'Fila 1: títulos de columna → fila 2: valores del distrito'}
        </Typography>

        <TablePreview
          key={`${redDirecta}-${scale}`}
          redDirecta={redDirecta}
          nombreDto={nombreDto}
          datos={datos}
        />

        <Divider sx={{ my: 2 }} />

        {/* Color coding reference */}
        <Typography variant="subtitle2" gutterBottom>Colores de celdas (llena_celdas)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', mb: 2 }}>
          <thead>
            <tr>
              {['Col', 'Campo', 'Color', 'Valor actual'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['1', 'DTO.',     '#222',                          nombreDto],
              ['2', 'CONECT.',  CELL_COLORS.existente,           String(datos.existente)],
              ['3', 'AUMENTO',  CELL_COLORS.proyectado,          String(datos.proyectado)],
              ['4', 'L. PLAZO', CELL_COLORS.largoPlayzo,         String(datos.largoPlayzo)],
              ['5', 'TOTAL',    CELL_COLORS.total,               String(total)],
            ].map(([col, campo, color, val]) => (
              <tr key={col}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>{col}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>{campo}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color, border: '1px solid #ccc', flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{color}</Typography>
                  </Box>
                </Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', color }}>{val}</Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Method flow */}
        <Typography variant="subtitle2" gutterBottom>Flujo de inicialización</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 10.5, width: '100%' }}>
          <thead>
            <tr>
              {['Método', 'Llama a', 'Estado'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['post_initialisation()',  'inicializa([0,0])',              'Fase 5'],
              ['inicializa(coord)',       'crearSelloSecundario + llenarCeldas', 'Fase 5'],
              ['crearSelloSecundario()', 'oTablas.crea_tabla(…)',           'Fase 5'],
              ['llenarCeldas()',         'obtener_numero_pares() GIS',      'Fase 5'],
              ['drawContentOn(window)', 'oTablas.Despliega(window)',        'Fase 5'],
            ].map(([m, calls, estado]) => (
              <tr key={m}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{m}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{calls}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>
                  <Chip label={estado} size="small" color="warning" sx={{ fontSize: 9, height: 16 }} />
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Pure functions */}
        <Typography variant="subtitle2" gutterBottom>Funciones puras</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            calcularTotal({'{'}existente:{datos.existente}, proyectado:{datos.proyectado}, largoPlayzo:{datos.largoPlayzo}{'}'}) = {total}<br />
            numFilas(false) = {numFilas(false)} · numFilas(true) = {numFilas(true)}<br />
            filaLayout(false) → {'{'}filaTitulo:1, filaValor:2{'}'}<br />
            filaLayout(true)  → {'{'}filaTitulo:2, filaValor:3{'}'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
