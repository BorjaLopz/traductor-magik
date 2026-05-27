import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import {
  formatLongitud,
  calcTotRenglones,
  esLongitudLarga,
  alturaTotal,
  ROW_TITULO,
  ROW_SUBTITULOS,
  ROW_CONTENIDO,
  COL_TITULO,
  COL_WIDTHS_3,
  TBL_TITULO,
  TBL_SUBTITULOS,
  TBL_CONTENIDO,
  SUBTITULO_HEADERS,
  type CableItem,
} from '../models/CSelloListaCables'

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE   = 2.6          // px per mm
const TW      = COL_TITULO * SCALE
const CW      = COL_WIDTHS_3.map(w => w * SCALE) as [number, number, number]

const STROKE   = '#444'
const BG_TITLE = '#1a237e'
const BG_SUB   = '#e8eaf6'
const BG_ODD   = '#fafafa'
const BG_EVEN  = '#ffffff'
const BG_LONG  = '#fff3e0'   // highlight row when longitud > 1000

// ─── Stamp SVG ────────────────────────────────────────────────────────────────

interface StampProps { cables: CableItem[] }

function StampSvg({ cables }: StampProps) {
  const nRows = calcTotRenglones(cables.length)
  const rTit  = ROW_TITULO     * SCALE
  const rSub  = ROW_SUBTITULOS * SCALE
  const rCont = ROW_CONTENIDO  * SCALE
  const totalH = (alturaTotal(cables.length)) * SCALE

  const xs = [0, CW[0], CW[0] + CW[1], TW]

  function hline(y: number) {
    return <line key={`h${y}`} x1={0} y1={y} x2={TW} y2={y} stroke={STROKE} strokeWidth={0.7} />
  }
  function vlines(y1: number, y2: number) {
    return [1, 2].map(i => (
      <line key={`v${i}-${y1}`} x1={xs[i]} y1={y1} x2={xs[i]} y2={y2} stroke={STROKE} strokeWidth={0.7} />
    ))
  }
  function cell(x: number, y: number, w: number, h: number, text: string, opts: {
    bg?: string; color?: string; fs?: number; bold?: boolean; anchor?: 'middle' | 'start'
  } = {}) {
    const { bg = 'white', color = '#222', fs = 5.5, bold = false, anchor = 'middle' } = opts
    const cx = anchor === 'middle' ? x + w / 2 : x + 2.5
    const cy = y + h / 2 + 0.8
    return (
      <g key={`cell-${x}-${y}`}>
        <rect x={x} y={y} width={w} height={h} fill={bg} />
        <text x={cx} y={cy} textAnchor={anchor} dominantBaseline="middle"
          fontSize={fs} fontWeight={bold ? 'bold' : 'normal'} fontFamily="Arial, sans-serif" fill={color}>
          {text.length > Math.floor(w / (fs * 0.56)) + 1
            ? text.slice(0, Math.floor(w / (fs * 0.56))) + '…'
            : text}
        </text>
      </g>
    )
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <svg width={TW + 2} height={totalH + 2} style={{ display: 'block' }}>
        <g transform="translate(1,1)">
          {/* Outer border */}
          <rect x={0} y={0} width={TW} height={totalH} fill="white" stroke={STROKE} strokeWidth={0.9} />

          {/* tbl_titulo */}
          {cell(0, 0, TW, rTit, 'CANTIDAD DE CABLE A PROYECTAR',
            { bg: BG_TITLE, color: '#fff', fs: 7, bold: true })}
          {hline(rTit)}

          {/* tbl_subtitulos */}
          {SUBTITULO_HEADERS.map((h, i) =>
            cell(xs[i], rTit, CW[i], rSub, h, { bg: BG_SUB, fs: 5.5, bold: true })
          )}
          {hline(rTit + rSub)}
          {vlines(rTit, rTit + rSub)}

          {/* tbl_contenido */}
          {Array.from({ length: nRows }, (_, idx) => {
            const y    = rTit + rSub + idx * rCont
            const cab  = cables[idx]
            const bg   = cab && esLongitudLarga(cab.longitud) ? BG_LONG
              : idx % 2 === 0 ? BG_ODD : BG_EVEN
            return (
              <g key={`row${idx}`}>
                {cab
                  ? <>
                      {cell(xs[0], y, CW[0], rCont, String(cab.capacidad), { bg, fs: 5.5 })}
                      {cell(xs[1], y, CW[1], rCont, cab.tipo,               { bg, fs: 5.5, anchor: 'start' })}
                      {cell(xs[2], y, CW[2], rCont, formatLongitud(cab.longitud), { bg, fs: 5.5 })}
                    </>
                  : <>
                      {cell(xs[0], y, CW[0], rCont, '', { bg: BG_ODD })}
                      {cell(xs[1], y, CW[1], rCont, '', { bg: BG_ODD })}
                      {cell(xs[2], y, CW[2], rCont, '', { bg: BG_ODD })}
                    </>
                }
                {hline(y + rCont)}
                {vlines(y, y + rCont)}
              </g>
            )
          })}

          {/* Left/right borders */}
          <line x1={0}  y1={0} x2={0}  y2={totalH} stroke={STROKE} strokeWidth={0.9} />
          <line x1={TW} y1={0} x2={TW} y2={totalH} stroke={STROKE} strokeWidth={0.9} />
        </g>
      </svg>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}
        sx={{ fontFamily: 'monospace', fontSize: 10 }}>
        {TBL_TITULO}/{TBL_SUBTITULOS}/{TBL_CONTENIDO}
        · {COL_TITULO} mm wide · {alturaTotal(cables.length)} mm tall
        · {nRows} data rows
        {cables.some(c => esLongitudLarga(c.longitud)) && ' · naranja = longitud > 1000 m'}
      </Typography>
    </Box>
  )
}

// ─── Cable row editor ─────────────────────────────────────────────────────────

function CableEditor({
  cables, onChange,
}: { cables: CableItem[]; onChange: (c: CableItem[]) => void }) {
  function update(i: number, k: keyof CableItem, v: string) {
    const next = cables.map((c, j) =>
      j === i ? { ...c, [k]: k === 'longitud' ? parseFloat(v) || 0 : v } : c
    )
    onChange(next)
  }
  function add() {
    onChange([...cables, { capacidad: '12', tipo: 'CABLE FO AEREO', longitud: 100 }])
  }
  function remove(i: number) {
    onChange(cables.filter((_, j) => j !== i))
  }

  return (
    <Box>
      {cables.map((c, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.75, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ width: 16, flexShrink: 0, color: '#888' }}>{i + 1}</Typography>
          <TextField label="capacidad" value={c.capacidad} size="small" sx={{ width: 80 }}
            onChange={e => update(i, 'capacidad', e.target.value)} />
          <TextField label="tipo" value={c.tipo} size="small" sx={{ width: 150 }}
            onChange={e => update(i, 'tipo', e.target.value)} />
          <TextField label="longitud" type="number" value={c.longitud} size="small" sx={{ width: 100 }}
            onChange={e => update(i, 'longitud', e.target.value)} />
          {esLongitudLarga(c.longitud) && (
            <Chip label="> 1000 m" size="small" color="warning" sx={{ fontSize: 9, height: 18 }} />
          )}
          <IconButton size="small" onClick={() => remove(i)} sx={{ color: '#e57373', ml: 'auto' }}>
            <Typography variant="caption">✕</Typography>
          </IconButton>
        </Box>
      ))}
      <Button size="small" variant="outlined" onClick={add} sx={{ mt: 0.5 }}>+ cable</Button>
    </Box>
  )
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_CABLES: CableItem[] = [
  { capacidad: '12',  tipo: 'CABLE FO AEREO HOLGADO',       longitud: 348.5  },
  { capacidad: '24',  tipo: 'CABLE FO AEREO HOLGADO',       longitud: 1250.0 },
  { capacidad: '48',  tipo: 'CABLE FO SUBTERRANEO HOLGADO', longitud: 720.3  },
  { capacidad: '96',  tipo: 'CABLE FO SUBTERRANEO HOLGADO', longitud: 90.0   },
]

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CSelloListaCablesShowcase() {
  const [cables, setCables] = useState<CableItem[]>(DEFAULT_CABLES)

  const nRows    = calcTotRenglones(cables.length)
  const totalH   = alturaTotal(cables.length)
  const largos   = cables.filter(c => esLongitudLarga(c.longitud))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 290, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CSelloListaCables</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Sello lista de cables a proyectar · extends CBaseSelloFibra
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="SIMPLE" size="small" color="success" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          Cables (stub de c_distrito.obten_cables_secundarios_agrupados)
        </Typography>
        <CableEditor cables={cables} onChange={setCables} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Medidas calculadas</Typography>
        <Box sx={{ bgcolor: '#fffde7', p: 1, borderRadius: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            cables.length  = {cables.length}<br />
            calcTotRenglones({cables.length}) = {nRows}<br />
            alturaTotal({cables.length}) = {totalH} mm<br />
            cablesLargos (&gt;1000 m) = {largos.length}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Geometría tablas</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 10.5, width: '100%', mb: 1 }}>
          <thead>
            <tr>
              {['Tabla', 'Filas', 'Cols × mm', 'Alto mm'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 0.75, py: 0.3, background: '#f5f5f5', textAlign: 'left', fontSize: 10 }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [TBL_TITULO,     '1',     `1 × ${COL_TITULO}`,                  String(ROW_TITULO)],
              [TBL_SUBTITULOS, '1',     `3 × [${COL_WIDTHS_3.join(',')}]`,     String(ROW_SUBTITULOS)],
              [TBL_CONTENIDO,  String(nRows), `3 × [${COL_WIDTHS_3.join(',')}]`, `${nRows}×${ROW_CONTENIDO}=${nRows*ROW_CONTENIDO}`],
            ].map(([tbl, rows, cols, h]) => (
              <tr key={tbl}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, fontFamily: 'monospace', fontSize: 9.5 }}>{tbl}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, textAlign: 'center' }}>{rows}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, fontFamily: 'monospace', fontSize: 9.5 }}>{cols}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, fontFamily: 'monospace' }}>{h}</Box>
              </tr>
            ))}
            <tr>
              <Box component="td" colSpan={3}
                sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, fontWeight: 'bold', fontSize: 10 }}>Total</Box>
              <Box component="td"
                sx={{ border: '1px solid #eee', px: 0.75, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>{totalH}</Box>
            </tr>
          </tbody>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Atributo definido</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10.5, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
          DistritoOptico: integer | undefined<br />
          (layout_attribute_definition,<br />
          {'  '}allowed_on_properties_page? = false)
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 320 }}>
        <Typography variant="subtitle2" gutterBottom>Vista previa</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Stamp con {nRows} fila{nRows !== 1 ? 's' : ''} de contenido · ancho fijo 100 mm.
          Fondo naranja = longitud &gt; 1000 m (<code>_global dato</code>).
        </Typography>

        <StampSvg cables={cables} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Funciones puras</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            formatLongitud — write_string_normal(1)
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>
            {[0, 1.0, 348.5, 1000.0, 1250.123].map(v => (
              <div key={v}>formatLongitud({v}) → "{formatLongitud(v)}"</div>
            ))}
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            calcTotRenglones — max(n, 1)
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>
            {[0, 1, 2, 5].map(n => (
              <div key={n}>calcTotRenglones({n}) → {calcTotRenglones(n)}</div>
            ))}
          </Box>
        </Box>

        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            esLongitudLarga — longitud &gt; 1000 (_global dato)
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: 11, mt: 0.5 }}>
            {[500, 1000, 1000.1, 1250].map(v => (
              <div key={v}>esLongitudLarga({v}) → {String(esLongitudLarga(v))}</div>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Magik: _global dato se actualiza con el último valor &gt; 1000 encontrado.
            En TS modelado como predicado puro; el caller gestiona el estado.
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Cabeceras fijas (etiqueta_celdas)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              {['Tabla', 'Fila', 'Col', 'Texto', 'Size'].map(h => (
                <Box component="th" key={h}
                  sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [TBL_TITULO,     '1', '1', 'CANTIDAD DE CABLE A PROYECTAR', '40'],
              [TBL_SUBTITULOS, '1', '1', 'CAPACIDAD',                     '25'],
              [TBL_SUBTITULOS, '1', '2', 'TIPO DE CABLE',                 '25'],
              [TBL_SUBTITULOS, '1', '3', 'LONGITUD (MTS.)',                '25'],
            ].map(([tbl, row, col, text, size]) => (
              <tr key={`${tbl}-${row}-${col}`}>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 9.5 }}>{tbl}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, textAlign: 'center' }}>{row}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, textAlign: 'center' }}>{col}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{text}</Box>
                <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, textAlign: 'center' }}>{size}</Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
