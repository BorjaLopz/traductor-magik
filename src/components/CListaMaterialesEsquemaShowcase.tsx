import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import {
  titleForTipo,
  keysOrder,
  descFromKey,
  formatCantidadMetros,
  resolveUnidad,
  buildSheathDesc,
  CListaMaterialesEsquema,
  type TipoLista,
  type MaterialItem,
  COL_WIDTHS,
  ROW_HEIGHT,
  TABLE_NAME,
  HIDDEN_BORDERS_ROW1,
} from '../models/CListaMaterialesEsquema'

// ─── Table SVG ────────────────────────────────────────────────────────────────

const SCALE   = 3.8   // px per mm
const CW      = COL_WIDTHS.map(w => w * SCALE) as [number, number, number, number]
const RH      = ROW_HEIGHT * SCALE
const TW      = CW.reduce((a, b) => a + b, 0)
const STROKE  = '#333'
const HEADER_FILL = '#e8eaf6'
const TITLE_FILL  = '#c5cae9'
const ODD_FILL    = '#fafafa'
const EVEN_FILL   = '#ffffff'

interface TablePreviewProps {
  tipo:  TipoLista
  items: MaterialItem[]
}

function TablePreview({ tipo, items }: TablePreviewProps) {
  const title   = titleForTipo(tipo)
  const nRows   = 2 + items.length  // row1=title, row2=headers, rest=data
  const totalH  = nRows * RH

  // x positions of each column start
  const xs = [0, CW[0], CW[0]+CW[1], CW[0]+CW[1]+CW[2], TW]

  function Cell({
    x, y, w, h, text, fill, fontSize = 5.5, bold = false,
    textAnchor = 'middle' as 'start' | 'middle',
    hiddenBorders = [] as ('top'|'right'|'left')[],
  }) {
    const cx = x + w / 2
    const cy = y + h / 2 + 1.5
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={fill} stroke="none" />
        {/* borders — conditionally hide */}
        {!hiddenBorders.includes('top')    && <line x1={x}   y1={y}   x2={x+w} y2={y}   stroke={STROKE} strokeWidth={0.7} />}
        {!hiddenBorders.includes('left')   && <line x1={x}   y1={y}   x2={x}   y2={y+h} stroke={STROKE} strokeWidth={0.7} />}
        {                                       <line x1={x}   y1={y+h} x2={x+w} y2={y+h} stroke={STROKE} strokeWidth={0.7} />}
        {!hiddenBorders.includes('right')  && <line x1={x+w} y1={y}   x2={x+w} y2={y+h} stroke={STROKE} strokeWidth={0.7} />}
        {text && (
          <text
            x={textAnchor === 'middle' ? cx : x + 2}
            y={cy}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight={bold ? 'bold' : 'normal'}
            fontFamily="Arial, sans-serif"
            fill="#222"
          >
            {text.length > Math.floor(w / (fontSize * 0.55)) + 1
              ? text.slice(0, Math.floor(w / (fontSize * 0.55))) + '…'
              : text}
          </text>
        )}
      </g>
    )
  }

  // Row 1 — title: spans all 4 cols; top/right/left borders hidden
  const r1hidden: ('top'|'right'|'left')[] = ['top', 'right', 'left']

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg
        width={TW + 2}
        height={totalH + 2}
        style={{ display: 'block', border: '1px solid #bbb' }}
      >
        <g transform="translate(1,1)">
          {/* Row 1 — title cell spanning full width */}
          <rect x={0} y={0} width={TW} height={RH} fill={TITLE_FILL} stroke="none" />
          <line x1={0} y1={RH} x2={TW} y2={RH} stroke={STROKE} strokeWidth={0.7} />
          {/* inner col dividers hidden in row 1 per HIDDEN_BORDERS_ROW1 */}
          <text
            x={TW / 2} y={RH / 2 + 1.5}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={6} fontWeight="bold" fontFamily="Arial, sans-serif" fill="#1a237e"
          >
            {title}
          </text>

          {/* Row 2 — headers */}
          {(['No.', 'DESCRIPCION', 'UNIDAD', 'CANTIDAD'] as const).map((h, i) => (
            <Cell key={h}
              x={xs[i]} y={RH} w={CW[i]} h={RH}
              text={h} fill={HEADER_FILL}
              fontSize={5.5} bold
              textAnchor="middle"
              hiddenBorders={[]}
            />
          ))}

          {/* Data rows */}
          {items.map((item, idx) => {
            const y    = RH * (2 + idx)
            const fill = idx % 2 === 0 ? ODD_FILL : EVEN_FILL
            return (
              <g key={idx}>
                <Cell x={xs[0]} y={y} w={CW[0]} h={RH} text={String(item.no)}         fill={fill} fontSize={5} textAnchor="middle" hiddenBorders={[]} />
                <Cell x={xs[1]} y={y} w={CW[1]} h={RH} text={item.descripcion}         fill={fill} fontSize={5} textAnchor="start"  hiddenBorders={[]} />
                <Cell x={xs[2]} y={y} w={CW[2]} h={RH} text={item.unidad}              fill={fill} fontSize={5} textAnchor="middle" hiddenBorders={[]} />
                <Cell x={xs[3]} y={y} w={CW[3]} h={RH} text={item.cantidad}            fill={fill} fontSize={5} textAnchor="middle" hiddenBorders={[]} />
              </g>
            )
          })}
        </g>
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}
        sx={{ fontFamily: 'monospace', fontSize: 10 }}>
        {TABLE_NAME} — {TW.toFixed(0)} px ({COL_WIDTHS.join('+')} mm) × {(nRows * RH).toFixed(0)} px
        ({nRows} rows × {ROW_HEIGHT} mm) — HIDDEN_BORDERS_ROW1: {JSON.stringify(HIDDEN_BORDERS_ROW1)}
      </Typography>
    </Box>
  )
}

// ─── Pure function demos ──────────────────────────────────────────────────────

const SAMPLE_KEYS = [
  'item1',
  'item10',
  'item2|extra|MANGUERA FO 12 FIBRAS',
  'item9',
  'AAA|desc1',
  'item20|desc|CABLE AEREO',
]

const SHEATH_SAMPLES = [
  { externalName: 'MANGUERA FO ',  clase: 'A',  fiberQty: 12  },
  { externalName: 'CABLE FO ',     clase: 'B',  fiberQty: 48  },
  { externalName: 'TUBO HDPE ',    clase: '',   fiberQty: 0   },
]

function PureFunctionsPanel() {
  const [rawKey,    setRawKey]    = useState('item10|extra|CABLE AEREO 48F')
  const [cantidad,  setCantidad]  = useState(123.456)

  const sorted = keysOrder(SAMPLE_KEYS)

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Funciones puras</Typography>

      {/* titleForTipo */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>titleForTipo</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>
          <div>titleForTipo('red')         → "{titleForTipo('red')}"</div>
          <div>titleForTipo('estructuras') → "{titleForTipo('estructuras')}"</div>
        </Box>
      </Box>

      {/* keysOrder */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          keysOrder — natural sort (strings_with_numbers)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Entrada</Typography>
            {SAMPLE_KEYS.map((k, i) => (
              <Box key={i} sx={{ fontFamily: 'monospace', fontSize: 10 }}>{k}</Box>
            ))}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Ordenado</Typography>
            {sorted.map((k, i) => (
              <Box key={i} sx={{ fontFamily: 'monospace', fontSize: 10 }}>{k}</Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* descFromKey */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          descFromKey — split_by("|")
        </Typography>
        <TextField
          label="key" value={rawKey} size="small" fullWidth sx={{ my: 0.5 }}
          onChange={e => setRawKey(e.target.value)}
        />
        <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          parts = {JSON.stringify(rawKey.split('|'))}<br />
          descFromKey → "{descFromKey(rawKey)}"
        </Box>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10, mt: 0.5, color: '#555' }}>
          {SAMPLE_KEYS.slice(0, 4).map(k => (
            <div key={k}>descFromKey("{k}") → "{descFromKey(k)}"</div>
          ))}
        </Box>
      </Box>

      {/* formatCantidadMetros */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          formatCantidadMetros — as_fixed_string(5,2)
        </Typography>
        <TextField
          label="value" type="number" value={cantidad} size="small" fullWidth sx={{ my: 0.5 }}
          onChange={e => setCantidad(parseFloat(e.target.value) || 0)}
        />
        <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          formatCantidadMetros({cantidad}) → "{formatCantidadMetros(cantidad)}"
        </Box>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10, mt: 0.5, color: '#555' }}>
          {[1, 12.5, 999.99, 1234.5].map(v => (
            <div key={v}>formatCantidadMetros({v}) → "{formatCantidadMetros(v)}"</div>
          ))}
        </Box>
      </Box>

      {/* resolveUnidad + buildSheathDesc */}
      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          resolveUnidad · buildSheathDesc
        </Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>
          <div>resolveUnidad(true)  → "{resolveUnidad(true)}"</div>
          <div>resolveUnidad(false) → "{resolveUnidad(false)}"</div>
        </Box>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10, mt: 0.5, color: '#555' }}>
          {SHEATH_SAMPLES.map((s, i) => (
            <div key={i}>buildSheathDesc("{s.externalName}", "{s.clase}", {s.fiberQty})
              {' '}→ "{buildSheathDesc(s.externalName, s.clase, s.fiberQty)}"</div>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

// ─── Mock material editor ─────────────────────────────────────────────────────

const DEFAULT_ITEMS_RED: MaterialItem[] = [
  { no: 1, descripcion: 'MANGUERA FO A 12',  unidad: 'metros', cantidad: ' 45.50' },
  { no: 2, descripcion: 'MANGUERA FO B 24',  unidad: 'metros', cantidad: '123.00' },
  { no: 3, descripcion: 'CAJA EMPALME FTTH', unidad: 'pzas',   cantidad: '  4.00' },
  { no: 4, descripcion: 'POSTE 8M',          unidad: 'pzas',   cantidad: ' 12.00' },
]

const DEFAULT_ITEMS_ESTRUCTURAS: MaterialItem[] = [
  { no: 1, descripcion: 'TUBO HDPE 40mm', unidad: 'metros', cantidad: '200.00' },
  { no: 2, descripcion: 'CODO 90° 40mm',  unidad: 'pzas',   cantidad: '  8.00' },
  { no: 3, descripcion: 'CINTA DE AVISO', unidad: 'metros', cantidad: '150.00' },
]

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CListaMaterialesEsquemaShowcase() {
  const [tipo,  setTipo]  = useState<TipoLista>('red')
  const [items, setItems] = useState<MaterialItem[]>(DEFAULT_ITEMS_RED)

  function handleTipo(_: unknown, val: TipoLista | null) {
    if (!val) return
    setTipo(val)
    setItems(val === 'red' ? DEFAULT_ITEMS_RED : DEFAULT_ITEMS_ESTRUCTURAS)
  }

  function addRow() {
    setItems(prev => [
      ...prev,
      { no: prev.length + 1, descripcion: 'NUEVO MATERIAL', unidad: 'pzas', cantidad: '  1.00' },
    ])
  }

  function removeRow() {
    setItems(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  }

  const inst = CListaMaterialesEsquema.newWith(tipo)

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CListaMaterialesEsquema</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Lista de materiales para planos esquema · extends CBaseSelloFibra
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="MODERADO" size="small" color="info" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>tipo (slot)</Typography>
        <ToggleButtonGroup
          value={tipo} exclusive onChange={handleTipo} size="small" sx={{ mb: 1.5 }}
        >
          <ToggleButton value="red">red</ToggleButton>
          <ToggleButton value="estructuras">estructuras</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ bgcolor: '#fffde7', p: 1, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            inst.tipo = "{inst.tipo}"<br />
            titleForTipo → "{titleForTipo(tipo)}"
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button size="small" variant="outlined" onClick={addRow}>+ fila</Button>
          <Button size="small" variant="outlined" onClick={removeRow} disabled={items.length <= 1}>− fila</Button>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Geometría tabla</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', mb: 1.5 }}>
          <thead>
            <tr>
              {['Col', 'mm', 'px'].map(h => (
                <Box component="th" key={h} sx={{ border: '1px solid #ddd', px: 1, py: 0.3, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['No.', 'Descripción', 'Unidad', 'Cantidad'] as const).map((name, i) => (
              <tr key={name}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3 }}>{name}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>{COL_WIDTHS[i]}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>{CW[i].toFixed(1)}</Box>
              </tr>
            ))}
            <tr>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontWeight: 'bold' }}>Total</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>121</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>{TW.toFixed(1)}</Box>
            </tr>
          </tbody>
        </Box>
        <Typography variant="caption" color="text.secondary">
          ROW_HEIGHT = {ROW_HEIGHT} mm · todas las filas iguales<br />
          Filas dinámicas: 2 + ht.size (Fase 5)
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>factory newWith</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          CListaMaterialesEsquema<br />
          {'  '}.newWith('{tipo}').tipo<br />
          = "{inst.tipo}"
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 320 }}>
        <Typography variant="subtitle2" gutterBottom>
          Vista previa — {TABLE_NAME}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Filas={items.length} · tipo="{tipo}"
          · Fila 1: bordes top/right/left ocultos (HIDDEN_BORDERS_ROW1)
        </Typography>

        <TablePreview tipo={tipo} items={items} />

        <Divider sx={{ my: 2 }} />

        <PureFunctionsPanel />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>GIS stubs (Fase 5)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Método', 'Magik', 'Estado'].map(h => (
                <Box component="th" key={h} sx={{ border: '1px solid #ddd', px: 1, py: 0.3, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['configurarTabla()',      'configura_tabla',     'Fase 5 stub'],
              ['etiquetarCeldas()',      'etiqueta_celdas',     'Fase 5 stub'],
              ['actualizarDatos()',      'actualiza_datos',     'Fase 5 stub'],
              ['llenarDatosCeldas()',    'llena_datos_celdas',  'Fase 5 stub'],
              ['obtenerListaMateriales()','obten_lista_materiales','Fase 5 stub'],
              ['elementosDeProyecto()', 'elementos_de_proyecto','Fase 5 stub'],
              ['selectFromMap()',        'select_from_map',     'Fase 5 stub'],
            ].map(([ts, magik, estado]) => (
              <tr key={ts}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{ts}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10, color: '#555' }}>{magik}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontSize: 10 }}>
                  <Chip label={estado} size="small" color="warning" sx={{ fontSize: 9, height: 16 }} />
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
