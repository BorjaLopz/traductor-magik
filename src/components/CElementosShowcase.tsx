import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  FormControlLabel, Grid, IconButton, List, ListItem, ListItemText,
  MenuItem, Slider, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CElementos, type IElementoGrafico, type BoundingBox } from '../models/CElementos'

// =============================================================================
// ELEMENTOS GRÁFICOS DE EJEMPLO (concretizan IElementoGrafico)
// =============================================================================

abstract class ElementoBase implements IElementoGrafico {
  oVentana?: CanvasRenderingContext2D
  oArea?:    BoundingBox

  // Magik: Actualiza_Area_Elemento — por defecto inset de 4px
  protected innerArea(): BoundingBox | undefined {
    if (!this.oArea) return undefined
    const m = 4
    return { x: this.oArea.x + m, y: this.oArea.y + m, w: this.oArea.w - 2 * m, h: this.oArea.h - 2 * m }
  }

  // updateds en subclase si lo necesitan
  actualizaAreaElemento(): void { /* default no-op */ }
  abstract despliega(): void
}

export class ElementoTexto extends ElementoBase {
  sTexto:   string
  nTamanio: number
  color:    string
  constructor(sTexto: string, nTamanio = 14, color = '#1565c0') {
    super()
    this.sTexto = sTexto; this.nTamanio = nTamanio; this.color = color
  }
  despliega(): void {
    const a = this.innerArea(); const ctx = this.oVentana
    if (!ctx || !a) return
    ctx.fillStyle    = this.color
    ctx.font         = `${this.nTamanio}px sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign    = 'center'
    ctx.fillText(this.sTexto, a.x + a.w / 2, a.y + a.h / 2)
  }
}

export class ElementoRect extends ElementoBase {
  fill:   string
  stroke: string
  constructor(fill = '#e3f2fd', stroke = '#1565c0') {
    super(); this.fill = fill; this.stroke = stroke
  }
  despliega(): void {
    const a = this.innerArea(); const ctx = this.oVentana
    if (!ctx || !a) return
    ctx.fillStyle   = this.fill
    ctx.strokeStyle = this.stroke
    ctx.lineWidth   = 2
    ctx.fillRect  (a.x, a.y, a.w, a.h)
    ctx.strokeRect(a.x, a.y, a.w, a.h)
  }
}

export class ElementoCirculo extends ElementoBase {
  fill:   string
  stroke: string
  constructor(fill = '#fff3e0', stroke = '#e65100') {
    super(); this.fill = fill; this.stroke = stroke
  }
  despliega(): void {
    const a = this.innerArea(); const ctx = this.oVentana
    if (!ctx || !a) return
    const cx = a.x + a.w / 2, cy = a.y + a.h / 2, r = Math.min(a.w, a.h) / 2
    ctx.fillStyle   = this.fill
    ctx.strokeStyle = this.stroke
    ctx.lineWidth   = 2
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
}

export class ElementoDiagonal extends ElementoBase {
  stroke: string
  constructor(stroke = '#c62828') { super(); this.stroke = stroke }
  despliega(): void {
    const a = this.innerArea(); const ctx = this.oVentana
    if (!ctx || !a) return
    ctx.strokeStyle = this.stroke
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(a.x,         a.y)
    ctx.lineTo(a.x + a.w,   a.y + a.h)
    ctx.moveTo(a.x + a.w,   a.y)
    ctx.lineTo(a.x,         a.y + a.h)
    ctx.stroke()
  }
}

type Kind = 'texto' | 'rect' | 'circulo' | 'diagonal'

function newElemento(kind: Kind, label: string): IElementoGrafico {
  switch (kind) {
    case 'texto':    return new ElementoTexto(label || 'TEXTO')
    case 'rect':     return new ElementoRect()
    case 'circulo':  return new ElementoCirculo()
    case 'diagonal': return new ElementoDiagonal()
  }
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface EntryDef {
  nombre:  string
  kind:    Kind
  label:   string         // sólo aplica a ElementoTexto
}

const INITIAL: EntryDef[] = [
  { nombre: 'fondo',    kind: 'rect',     label: '' },
  { nombre: 'titulo',   kind: 'texto',    label: 'CELDA' },
  { nombre: 'icono',    kind: 'circulo',  label: '' },
  { nombre: 'tachado',  kind: 'diagonal', label: '' },
]

const W = 360, H = 240

export function CElementosShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [entries, setEntries] = useState<EntryDef[]>(INITIAL)
  const [areaInset, setAreaInset] = useState<number>(20)
  const [propagar, setPropagar]   = useState<boolean>(true)
  const [draftName,  setDraftName]  = useState<string>('')
  const [draftKind,  setDraftKind]  = useState<Kind>('texto')
  const [draftLabel, setDraftLabel] = useState<string>('NUEVO')

  // Recrea CElementos cada vez que cambian entries — replica c_elementos.new()
  const elementos = useMemo(() => {
    const c = new CElementos()
    for (const e of entries) {
      c.agregarElemento(newElemento(e.kind, e.label), e.nombre)
    }
    return c
  }, [entries])

  // Despliega → render canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, W, H)

    if (propagar) {
      elementos.oVentana = ctx
      elementos.oArea = { x: areaInset, y: areaInset, w: W - 2 * areaInset, h: H - 2 * areaInset }
      elementos.despliega()

      // marca del área asignada
      ctx.strokeStyle = '#bbb'
      ctx.lineWidth   = 1
      ctx.setLineDash([3, 3])
      const a = elementos.oArea
      ctx.strokeRect(a.x, a.y, a.w, a.h)
      ctx.setLineDash([])
    } else {
      // Demuestra que sin propagar oVentana/oArea, los elementos no dibujan.
      ctx.fillStyle = '#999'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('oVentana/oArea sin propagar → Despliega no-op', W / 2, H / 2)
    }
  }, [elementos, areaInset, propagar])

  const addEntry = () => {
    if (!draftName.trim()) return
    setEntries(prev => [...prev, { nombre: draftName.trim(), kind: draftKind, label: draftLabel }])
    setDraftName('')
  }

  const removeEntry = (n: string) => {
    setEntries(prev => prev.filter(e => e.nombre !== n))
  }

  const obten = (nombre: string) => {
    const e = elementos.obtenElemento(nombre)
    return e ? e.constructor.name : 'undefined'
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_elementos
        <Chip label="Fase 1 · SIMPLE · score 13" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_elementos.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Lista + alta */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Agregar_elemento(RoElemento, RsNombre)"
              subheader={`nTotal_Elementos = ${elementos.nTotalElementos}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1}>
                <List dense disablePadding>
                  {entries.map(e => (
                    <ListItem
                      key={e.nombre}
                      disableGutters
                      secondaryAction={
                        <IconButton size="small" onClick={() => removeEntry(e.nombre)}>✕</IconButton>
                      }
                    >
                      <ListItemText
                        primary={<Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>:{e.nombre}</Box>}
                        secondary={
                          <Box sx={{ fontSize: 11, color: 'text.secondary' }}>
                            {e.kind}{e.kind === 'texto' && ` — "${e.label}"`} · obten_elemento → <code>{obten(e.nombre)}</code>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider />

                <Stack direction="row" spacing={1}>
                  <TextField
                    label="RsNombre"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    select
                    label="kind"
                    value={draftKind}
                    onChange={e => setDraftKind(e.target.value as Kind)}
                    size="small"
                    sx={{ width: 110 }}
                  >
                    <MenuItem value="texto">texto</MenuItem>
                    <MenuItem value="rect">rect</MenuItem>
                    <MenuItem value="circulo">circulo</MenuItem>
                    <MenuItem value="diagonal">diagonal</MenuItem>
                  </TextField>
                  {draftKind === 'texto' && (
                    <TextField
                      label="sTexto"
                      value={draftLabel}
                      onChange={e => setDraftLabel(e.target.value)}
                      size="small"
                      sx={{ width: 110 }}
                    />
                  )}
                  <Button variant="contained" size="small" onClick={addEntry}>+</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas + controles oVentana/oArea */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Despliega() — propaga oVentana/oArea + itera"
              subheader="LoElemento.oVentana << ctx · LoElemento.oArea << area · Actualiza_Area_Elemento · Despliega"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch checked={propagar} onChange={e => setPropagar(e.target.checked)} />}
                  label={propagar ? 'oVentana/oArea propagados (normal)' : 'sin propagar (demo no-op)'}
                />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    oArea inset = {areaInset}px (canvas {W}×{H})
                  </Typography>
                  <Slider min={0} max={60} step={2} value={areaInset} onChange={(_, v) => setAreaInset(v as number)} size="small" />
                </Box>

                <Box>
                  <canvas
                    ref={canvasRef}
                    width={W}
                    height={H}
                    style={{ border: '1px solid #ddd', borderRadius: 4, background: '#fff', display: 'block' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Línea discontinua = oArea — todos los elementos pintan en este recuadro.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
