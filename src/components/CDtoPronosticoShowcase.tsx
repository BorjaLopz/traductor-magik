import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid, Slider,
  Stack, TextField, Typography,
} from '@mui/material'
import {
  CDtoPronostico,
  type SubTabla,
  type TextoGrafico,
} from '../models/CDtoPronostico'

interface CapturaEdit { tabla: string; ren: number; col: number; etiqueta: string }

const CAPTURAS_EDITABLES: CapturaEdit[] = [
  { tabla: 'tbl_Titulo',      ren: 1, col: 2, etiqueta: 'DTO. ramal'       },
  { tabla: 'tbl_Titulo',      ren: 2, col: 2, etiqueta: 'D.A O.C. mts'     },
  { tabla: 'tbl_pares',       ren: 1, col: 2, etiqueta: 'P.PRINC.'         },
  { tabla: 'tbl_pares',       ren: 2, col: 2, etiqueta: 'P.SEC'            },
  { tabla: 'tbl_pares',       ren: 3, col: 2, etiqueta: 'ABNS. EXIST.'     },
  { tabla: 'tbl_pronosticos', ren: 1, col: 2, etiqueta: 'N · col2'         },
  { tabla: 'tbl_pronosticos', ren: 1, col: 3, etiqueta: 'N · col3'         },
  { tabla: 'tbl_pronosticos', ren: 2, col: 2, etiqueta: 'N+1 · col2'       },
  { tabla: 'tbl_pronosticos', ren: 2, col: 3, etiqueta: 'N+1 · col3'       },
  { tabla: 'tbl_pronosticos', ren: 3, col: 2, etiqueta: 'SAT. · col2'      },
  { tabla: 'tbl_pronosticos', ren: 3, col: 3, etiqueta: 'SAT. · col3'      },
]

export function CDtoPronosticoShowcase() {
  const sello = useMemo(() => {
    const s = new CDtoPronostico()
    s.inicializa()
    return s
  }, [])

  const [scale, setScale] = useState<number>(4)
  const [, bump] = useState(0)
  const re = () => bump(t => t + 1)

  const onEdit = (edit: CapturaEdit, valor: string) => {
    sello.setCaptura(edit.tabla, edit.ren, edit.col, valor)
    re()
  }

  const valOf = (e: CapturaEdit): string => {
    const t = sello.tabla(e.tabla)
    const c = t?.cells[e.ren - 1]?.[e.col - 1]
    return c?.texto ?? ''
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_dto_pronostico
        <Chip label="Fase 2 · COMPLEJO · score 7" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends layout_element" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip
          label={`allowed_on_menu? = ${String(CDtoPronostico.allowedOnMenu)}`}
          size="small"
          variant="outlined"
          sx={{ ml: 1, fontFamily: 'monospace' }}
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_dto_pronostico.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Editor de capturas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Capturas editables (c_Captura_Texto)"
              subheader="3 sub-tablas: tbl_Titulo · tbl_pares · tbl_pronosticos"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ maxHeight: 480, overflowY: 'auto' }}>
              <Stack spacing={1}>
                {CAPTURAS_EDITABLES.map((e, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 130, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                      {e.tabla}({e.ren},{e.col})
                    </Box>
                    <TextField
                      value={valOf(e)}
                      onChange={ev => onEdit(e, ev.target.value)}
                      size="small"
                      placeholder={e.etiqueta}
                      fullWidth
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render SVG */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Render"
              subheader={`bTablas_Creadas = ${String(sello.bTablasCreadas)} · ${sello.tablas.length} sub-tablas`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">escala = {scale} px/mm</Typography>
                <Slider min={2} max={8} step={0.5} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <SelloSvg sello={sello} scale={scale} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                area_total() = {JSON.stringify(sello.areaTotal())} mm
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function SelloSvg({ sello, scale }: { sello: CDtoPronostico; scale: number }) {
  const area = sello.areaTotal()
  const pad = 8
  const W = area.w * scale + pad * 2
  const H = area.h * scale + pad * 2
  const toSvgY = (yMm: number) => (area.y + area.h - yMm) * scale + pad

  return (
    <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4 }}>
      {sello.tablas.map(t => <SubTablaSvg key={t.nombre} t={t} scale={scale} originX={area.x} toSvgY={toSvgY} pad={pad} />)}
    </svg>
  )
}

function SubTablaSvg({ t, scale, originX, toSvgY, pad }: {
  t: SubTabla; scale: number; originX: number; toSvgY: (y: number) => number; pad: number
}) {
  const items: React.ReactElement[] = []

  let yMm = t.oCoordenadaOrigen.y
  for (let r = 0; r < t.rows; r++) {
    let xMm = t.oCoordenadaOrigen.x
    const rowH = t.rowHeights[r]
    for (let c = 0; c < t.cols; c++) {
      const colW = t.colWidths[c]
      const x = (xMm - originX) * scale + pad
      const y = toSvgY(yMm)
      const w = colW * scale
      const h = rowH * scale

      const bord = t.bordes[r][c]
      const isOuterTop  = r === 0
      const isOuterBot  = r === t.rows - 1
      const isOuterLeft  = c === 0
      const isOuterRight = c === t.cols - 1

      const drawTop    = bord.sup || (t.dibujaBordes && isOuterTop)    || (t.dibujaRenglonesInternos && !isOuterTop)
      const drawBottom = bord.inf || (t.dibujaBordes && isOuterBot)    || (t.dibujaRenglonesInternos && !isOuterBot)
      const drawLeft   = bord.izq || (t.dibujaBordes && isOuterLeft)   || (t.dibujaColumnasInternas && !isOuterLeft)
      const drawRight  = bord.der || (t.dibujaBordes && isOuterRight)  || (t.dibujaColumnasInternas && !isOuterRight)

      items.push(
        <g key={`${t.nombre}-${r}-${c}`}>
          <rect x={x} y={y} width={w} height={h} fill="#fafafa" stroke="none" />
          {drawTop    && <line x1={x}     y1={y}     x2={x + w} y2={y}     stroke="#333" strokeWidth={1} />}
          {drawBottom && <line x1={x}     y1={y + h} x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
          {drawLeft   && <line x1={x}     y1={y}     x2={x}     y2={y + h} stroke="#333" strokeWidth={1} />}
          {drawRight  && <line x1={x + w} y1={y}     x2={x + w} y2={y + h} stroke="#333" strokeWidth={1} />}
          <CellContent cell={t.cells[r][c]} x={x} y={y} w={w} h={h} />
        </g>,
      )
      xMm += colW
    }
    yMm -= rowH
  }
  return <>{items}</>
}

function CellContent({ cell, x, y, w, h }: { cell: TextoGrafico | undefined; x: number; y: number; w: number; h: number }) {
  if (!cell) return null
  const anchor = cell.alineacion === 'centre_left' ? 'start' : cell.alineacion === 'centre_right' ? 'end' : 'middle'
  const tx = anchor === 'start' ? x + 2 : anchor === 'end' ? x + w - 2 : x + w / 2
  const fontPx = Math.max(6, cell.tamanio * 0.45)
  return (
    <text
      x={tx}
      y={y + h / 2}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontFamily={cell.tipo === 'captura' ? 'monospace' : 'sans-serif'}
      fontSize={fontPx}
      fill={cell.tipo === 'captura' ? '#1565c0' : '#222'}
      fontWeight={cell.tipo === 'texto' ? 'bold' : 'normal'}
    >
      {cell.texto}
    </text>
  )
}
