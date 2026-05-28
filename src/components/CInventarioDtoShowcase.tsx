import { useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Stack, TextField, Typography,
} from '@mui/material'
import {
  CInventarioDto,
  NSE_STAMP_ORDER, ROW_LABELS, TACHADO_TOTALES,
} from '../models/CInventarioDto'
import type { NseKey, InventarioRow, NseMap } from '../models/CInventarioDto'
import type { CTablas } from '../models/CTablas'
import type { Celda } from '../models/CTabla'

// ─── Sample data ─────────────────────────────────────────────────────────────

const SAMPLE_VIV: NseMap = {
  'RESIDENCIAL A': '1250', 'RESIDENCIAL B': '3420', 'RESIDENCIAL C': '890',
  'RESIDENCIAL D': '215',  'RESIDENCIAL E': '45',
  'COMERCIAL 1a.': '340',  'COMERCIAL 2a.': '210',  'COMERCIAL 3a.': '85',
  'INDUSTRIAL PESADA': '12', 'INDUSTRIAL MEDIANA': '35', 'INDUSTRIAL LIGERA': '78',
  'LOTE BALDÍO': '125',
}

const SAMPLE_LIN: NseMap = {
  'RESIDENCIAL A': '2500', 'RESIDENCIAL B': '6840', 'RESIDENCIAL C': '1780',
  'RESIDENCIAL D': '430',  'RESIDENCIAL E': '90',
  'COMERCIAL 1a.': '680',  'COMERCIAL 2a.': '420',  'COMERCIAL 3a.': '170',
  'INDUSTRIAL PESADA': '24', 'INDUSTRIAL MEDIANA': '70', 'INDUSTRIAL LIGERA': '156',
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CInventarioDtoShowcase() {
  const [siglas, setSiglas]           = useState('AA-01')
  const [aumentoSec, setAumentoSec]   = useState('320+80=400')
  const [aumentoPrinc, setAumentoPrinc] = useState('500+100=600')
  const [sampleOn, setSampleOn]       = useState(false)
  const [scale, setScale]             = useState(3.5)

  const inv = useMemo(() => {
    const dto = new CInventarioDto(siglas)
    dto.setAumentoSec(aumentoSec)
    dto.setAumentoPrinc(aumentoPrinc)
    if (sampleOn) {
      const vivOrdered = dto.sortByStampOrder(SAMPLE_VIV)
      const linOrdered = dto.sortByStampOrder(SAMPLE_LIN)
      ;(NSE_STAMP_ORDER as NseKey[]).forEach((key, i) => {
        dto.setRow(key, [vivOrdered[i], linOrdered[i], '', '', ''] as InventarioRow)
      })
      dto.setPublicos('0')
      dto.setBaldios(SAMPLE_VIV['LOTE BALDÍO'] ?? '0')
      dto.setTotal(['6580', '12164', '0', '0', '0'])
    }
    return dto
  }, [siglas, aumentoSec, aumentoPrinc, sampleOn])

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CInventarioDto
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_inventario_dto.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* ── Left: controls ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Parámetros"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="siglasCtlDto"
                    value={siglas}
                    onChange={e => setSiglas(e.target.value)}
                    size="small" fullWidth
                    helperText="tbl_Titulo celda(1,1)"
                  />
                  <TextField
                    label="Aumento Sec."
                    value={aumentoSec}
                    onChange={e => setAumentoSec(e.target.value)}
                    size="small" fullWidth
                  />
                  <TextField
                    label="Aumento Princ."
                    value={aumentoPrinc}
                    onChange={e => setAumentoPrinc(e.target.value)}
                    size="small" fullWidth
                  />
                  <Button
                    variant={sampleOn ? 'outlined' : 'contained'}
                    size="small"
                    onClick={() => setSampleOn(v => !v)}
                  >
                    {sampleOn ? 'Vaciar datos NSE' : 'Cargar datos ejemplo NSE'}
                  </Button>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Escala: {scale} px/mm
                    </Typography>
                    <input
                      type="range" min={2} max={6} step={0.25}
                      value={scale}
                      onChange={e => setScale(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="sortByStampOrder()"
                subheader="Magik: prvOrdena_DeAcuerdo_Sello"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 1 }}>
                  Reordena NseMap al orden canónico del sello (VIV.LOC.)
                </Typography>
                <Stack spacing={0.25}>
                  {(NSE_STAMP_ORDER as NseKey[]).map(key => (
                    <Box key={key} sx={{ display: 'flex', gap: 1, fontFamily: 'monospace', fontSize: 11 }}>
                      <Typography variant="caption" sx={{ minWidth: 28, fontWeight: 700, color: 'primary.main' }}>
                        {ROW_LABELS[key]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                        {sampleOn ? (SAMPLE_VIV[key] ?? '—') : '—'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ fontFamily: 'monospace', fontSize: 10, color: 'text.secondary' }}>
                  <div>LOTE BALDÍO → baldios: {sampleOn ? SAMPLE_VIV['LOTE BALDÍO'] : '0'}</div>
                  <div>tablas creadas: {inv.oTablas.nTotalTablas}</div>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: SVG sello ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sello: Resumen de Inventarios"
              subheader="draw_content_on → 6 sub-tablas CTablas"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto', overflowY: 'auto' }}>
                <InventarioSvg tablas={inv.oTablas} scale={scale} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

// ─── SVG render ──────────────────────────────────────────────────────────────

function InventarioSvg({ tablas, scale }: { tablas: CTablas; scale: number }) {
  const area = tablas.areaTotal()
  if (!area) return <Box sx={{ fontSize: 12, color: 'text.disabled' }}>Sin tablas</Box>

  const pad = 12
  const W = (area.xmax - area.xmin) * scale + pad * 2
  const H = (area.ymax - area.ymin) * scale + pad * 2
  const sx = (x: number) => (x - area.xmin) * scale + pad
  const sy = (y: number) => (area.ymax - y) * scale + pad

  return (
    <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4 }}>
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width={4} height={4}>
          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#bbb" strokeWidth={0.75} />
        </pattern>
      </defs>

      {[...tablas.collTablas.entries()].map(([nombre, t]) =>
        t.oCeldas.flatMap(row =>
          row.map(cell => {
            const b  = t.bboxCelda(cell.nRen, cell.nCol)
            const x  = sx(b.xmin), y = sy(b.ymax)
            const w  = (b.xmax - b.xmin) * scale
            const h  = (b.ymax - b.ymin) * scale
            const isTachado = nombre === 'tbl_Totales' &&
              TACHADO_TOTALES.has(`${cell.nRen},${cell.nCol}`)

            return (
              <g key={`${nombre}-${cell.nRen}-${cell.nCol}`}>
                <rect
                  x={x} y={y} width={w} height={h}
                  fill={isTachado ? 'url(#hatch)' : '#fafafa'}
                  stroke="none"
                />
                {cell.bordes.sup && <line x1={x}     y1={y}     x2={x + w} y2={y}     stroke="#333" strokeWidth={1} />}
                {cell.bordes.inf && <line x1={x}     y1={y + h} x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
                {cell.bordes.izq && <line x1={x}     y1={y}     x2={x}     y2={y + h} stroke="#333" strokeWidth={1} />}
                {cell.bordes.der && <line x1={x + w} y1={y}     x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
                {!isTachado && cell.texto && <CellText cell={cell} x={x} y={y} w={w} h={h} />}
              </g>
            )
          }),
        ),
      )}
    </svg>
  )
}

function CellText({ cell, x, y, w, h }: { cell: Celda; x: number; y: number; w: number; h: number }) {
  const cx = x + w / 2, cy = y + h / 2
  const fs = Math.min(9, h * 0.55)
  if (w < 18) {
    return (
      <text
        x={cx} y={cy} fontSize={fs} fontFamily="sans-serif"
        textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90,${cx},${cy})`} fill="#333"
      >
        {cell.texto}
      </text>
    )
  }
  return (
    <text
      x={cx} y={cy} fontSize={fs} fontFamily="sans-serif"
      textAnchor="middle" dominantBaseline="middle" fill="#333"
    >
      {cell.texto}
    </text>
  )
}
