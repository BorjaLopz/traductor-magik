import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Slider, Stack, TextField, Typography,
} from '@mui/material'
import { CElementoNodoG } from '../models/CElementoNodoG'
import type { NodoRecord } from '../models/CElementoNodoG'
import type { BoundingBox } from '../models/CElementoEntidadG'

const DEFAULTS: NodoRecord = {
  'user!_tipo':     'EDFA',
  'user!_nom_nodo': 'NDO-CEDO-001',
}

const DEFAULT_AREA: BoundingBox = { xmin: 0, ymin: 0, xmax: 100, ymax: 40 }

export function CElementoNodoGShowcase() {
  const [record, setRecord]       = useState<NodoRecord>(DEFAULTS)
  const [contactX, setContactX]   = useState(0)
  const [contactY, setContactY]   = useState(20)
  const [areaH, setAreaH]         = useState(40)
  const [scale, setScale]         = useState(3.5)

  const nodo = useMemo(() => {
    const n = new CElementoNodoG(record)
    n.configurarElementos()
    const area: BoundingBox = { xmin: 0, ymin: 0, xmax: n.nLongGrafica, ymax: areaH }
    n.setAreaAndLayout(area)
    return n
  }, [record, areaH])

  const reposArea = useMemo(
    () => nodo.placeAt({ x: contactX, y: contactY }, DEFAULT_AREA),
    [nodo, contactX, contactY],
  )

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CElementoNodoG
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="error" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/Utilerias/c_elemento_nodo_g.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Extiende <code>CElementoEntidadG</code> · Símbolo EDFA · 3 etiquetas verticalmente distribuidas
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: controls ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="NodoRecord (entidad GIS)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Simula el objeto dataset Smallworld"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="user!_nom_nodo"
                    value={record['user!_nom_nodo']}
                    onChange={e => setRecord(r => ({ ...r, 'user!_nom_nodo': e.target.value }))}
                    size="small" fullWidth
                    helperText="→ Etiqueta_1 (parte superior)"
                  />
                  <TextField
                    label="user!_tipo"
                    value={record['user!_tipo']}
                    onChange={e => setRecord(r => ({ ...r, 'user!_tipo': e.target.value }))}
                    size="small" fullWidth
                    helperText="→ sDescripcion → Etiqueta_3 (parte inferior)"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Área y layout"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="dfn_ubicacion_elementos_internos"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Altura área: {areaH} mm
                    </Typography>
                    <Slider min={20} max={80} step={5} value={areaH}
                      onChange={(_, v) => setAreaH(v as number)} size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Escala: {scale} px/mm
                    </Typography>
                    <Slider min={1.5} max={6} step={0.25} value={scale}
                      onChange={(_, v) => setScale(v as number)} size="small" />
                  </Box>
                  <EtiquetaPosTable nodo={nodo} areaH={areaH} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="reposicionar_Area()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Nuevo bbox relativo a oPtoContacto"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="ptoContacto.x" type="number" size="small"
                      value={contactX} onChange={e => setContactX(Number(e.target.value))}
                      sx={{ flex: 1 }} />
                    <TextField label="ptoContacto.y" type="number" size="small"
                      value={contactY} onChange={e => setContactY(Number(e.target.value))}
                      sx={{ flex: 1 }} />
                  </Box>
                  <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    <div>xmin: {reposArea.xmin.toFixed(1)}</div>
                    <div>ymin: {reposArea.ymin.toFixed(1)}</div>
                    <div>xmax: {reposArea.xmax.toFixed(1)}</div>
                    <div>ymax: {reposArea.ymax.toFixed(1)}</div>
                    <Divider sx={{ my: 0.5 }} />
                    <div>nLongGrafica: {nodo.nLongGrafica} mm</div>
                    <div>sNombreSimbolo: {nodo.sNombreSimbolo}</div>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: SVG element view ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Representación gráfica del nodo"
              subheader="3 etiquetas posicionadas por dfn_ubicacion_elementos_internos · símbolo EDFA en el centro"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto' }}>
                <NodoSvg nodo={nodo} areaH={areaH} scale={scale} />
              </Box>
            </CardContent>
          </Card>

          {/* Hierarchy */}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip label="CElementoEntidadG<T>" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Chip label="CElementoNodoG" size="small" color="error" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">
                  sNombreSimbolo=<code>edfa</code> · nLongGrafica=<code>100</code> ·
                  Etiquetas en rows 1/9/17 de 20
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

// ─── SVG visual ──────────────────────────────────────────────────────────────

const ROWS = CElementoNodoG.NUM_RENGLONES

function NodoSvg({ nodo, areaH, scale }: { nodo: CElementoNodoG; areaH: number; scale: number }) {
  const W  = nodo.nLongGrafica
  const H  = areaH
  const pw = W * scale
  const ph = H * scale
  const pad = 16

  // Vertical center of each element in SVG coords (y ↓)
  // effective margin = stored_value * 10 (Magik setter × 10 convention)
  function yCenterOf(nombre: string): number | undefined {
    const el = nodo.oElementos.get(nombre)
    if (!el || el.nMargenSup === undefined || el.nMargenInf === undefined) return undefined
    const topMm    = el.nMargenSup * 10
    const botMm    = el.nMargenInf * 10
    const bandMm   = H - topMm - botMm
    const centerMm = topMm + bandMm / 2
    return pad + (centerMm / H) * ph
  }

  // Fallback position from row number for non-configured elements
  function yFromRow(row: number): number {
    return pad + (row / ROWS) * ph
  }

  const etiquetas: Array<{ nombre: string; color: string }> = [
    { nombre: 'Etiqueta_1', color: '#1565c0' },
    { nombre: 'Etiqueta_2', color: '#6a1b9a' },
    { nombre: 'Etiqueta_3', color: '#c62828' },
  ]

  return (
    <svg width={pw + pad * 2} height={ph + pad * 2}
      style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 4 }}>

      {/* Bounding box */}
      <rect x={pad} y={pad} width={pw} height={ph}
        fill="#fff" stroke="#555" strokeWidth={1.5} strokeDasharray="none" />

      {/* Row guides (faint) */}
      {Array.from({ length: ROWS - 1 }, (_, i) => i + 1).map(r => (
        <line key={r}
          x1={pad} y1={pad + (r / ROWS) * ph}
          x2={pad + pw} y2={pad + (r / ROWS) * ph}
          stroke="#e8e8e8" strokeWidth={0.5} />
      ))}

      {/* Symbol — center of element */}
      <circle cx={pad + pw / 2} cy={pad + ph / 2}
        r={Math.min(pw, ph) * 0.15}
        fill="#fff3e0" stroke="#e65100" strokeWidth={1.5} />
      <text x={pad + pw / 2} y={pad + ph / 2}
        fontSize={Math.min(10, ph * 0.18)} fontFamily="monospace"
        textAnchor="middle" dominantBaseline="middle" fill="#e65100" fontWeight={700}>
        {nodo.sNombreSimbolo.toUpperCase()}
      </text>

      {/* Label markers */}
      {etiquetas.map(({ nombre, color }) => {
        const el    = nodo.oElementos.get(nombre)
        const row   = nodo.posEtiqueta(nombre) ?? 0
        const yFb   = yFromRow(row)
        const yC    = yCenterOf(nombre) ?? yFb
        const label = el?.sTexto ?? nombre

        return (
          <g key={nombre}>
            {/* band highlight */}
            {el?.nMargenSup !== undefined && el?.nMargenInf !== undefined && (() => {
              const topMm  = el.nMargenSup! * 10
              const botMm  = el.nMargenInf! * 10
              const y1 = pad + (topMm / H) * ph
              const y2 = pad + ((H - botMm) / H) * ph
              return (
                <rect x={pad} y={y1} width={pw} height={y2 - y1}
                  fill={color} fillOpacity={0.06} />
              )
            })()}
            {/* center line */}
            <line x1={pad} y1={yC} x2={pad + pw} y2={yC}
              stroke={color} strokeWidth={1} strokeDasharray="4 2" />
            {/* label text */}
            <rect x={pad + 4} y={yC - 8} width={label.length * 6 + 8} height={16}
              fill="white" rx={2} />
            <text x={pad + 8} y={yC} fontSize={10} fontFamily="sans-serif"
              dominantBaseline="middle" fill={color} fontWeight={600}>
              {label}
            </text>
            {/* row badge */}
            <text x={pad + pw - 4} y={yC} fontSize={9} fontFamily="monospace"
              textAnchor="end" dominantBaseline="middle" fill={color} opacity={0.6}>
              row {row}
            </text>
          </g>
        )
      })}

      {/* Axis labels */}
      <text x={pad + pw / 2} y={pad - 5} fontSize={9} fontFamily="monospace"
        textAnchor="middle" fill="#888">
        {nodo.nLongGrafica} mm
      </text>
      <text x={pad - 4} y={pad + ph / 2} fontSize={9} fontFamily="monospace"
        textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90, ${pad - 4}, ${pad + ph / 2})`} fill="#888">
        {areaH} mm
      </text>
    </svg>
  )
}

// ─── Etiqueta positions table ─────────────────────────────────────────────────

function EtiquetaPosTable({ nodo, areaH }: { nodo: CElementoNodoG; areaH: number }) {
  const rows = [
    { nombre: 'Etiqueta_1', row: 1,  color: '#1565c0' },
    { nombre: 'Etiqueta_2', row: 9,  color: '#6a1b9a' },
    { nombre: 'Etiqueta_3', row: 17, color: '#c62828' },
  ]
  const altRen = areaH / CElementoNodoG.NUM_RENGLONES

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '2px 8px', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">etiqueta</Typography>
        <Typography variant="caption" color="text.secondary">row</Typography>
        <Typography variant="caption" color="text.secondary">↑ margen</Typography>
        <Typography variant="caption" color="text.secondary">↓ margen</Typography>
        {rows.map(({ nombre, row, color }) => {
          const renInf = CElementoNodoG.NUM_RENGLONES - 2 - row
          const mSup   = (altRen * (row   / 10) * 10).toFixed(1)
          const mInf   = (altRen * (renInf / 10) * 10).toFixed(1)
          return [
            <Typography key={`n-${nombre}`} variant="caption" sx={{ color, fontWeight: 700 }}>{nombre.replace('Etiqueta_', 'E')}</Typography>,
            <Typography key={`r-${nombre}`} variant="caption" color="text.secondary">{row}/{CElementoNodoG.NUM_RENGLONES}</Typography>,
            <Typography key={`s-${nombre}`} variant="caption" sx={{ color }}>{mSup} mm</Typography>,
            <Typography key={`i-${nombre}`} variant="caption" sx={{ color }}>{mInf} mm</Typography>,
          ]
        })}
      </Box>
    </Box>
  )
}
