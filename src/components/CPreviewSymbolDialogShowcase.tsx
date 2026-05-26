import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid,
  List, ListItemButton, ListItemText, Stack, Typography,
} from '@mui/material'
import {
  CANVAS_BOUNDS,
  CANVAS_SIZE,
  CPreviewSymbolDialog,
  mockSymbolStyleService,
  type LayoutContext,
  type LayoutPage,
  type SymbolDefinition,
  type SymbolLayout,
} from '../models/CPreviewSymbolDialog'

// =============================================================================
// MOCK LAYOUT PAGE
// =============================================================================

function makePage(): LayoutPage {
  return {
    bounds: { xmin: 0, ymin: 0, xmax: 3000, ymax: 2000 },
    symbolElements: [],
    addElement(s) { this.symbolElements.push(s) },
  }
}

// =============================================================================
// DRAW
// =============================================================================

function drawSample(canvas: HTMLCanvasElement, sym: SymbolDefinition): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const bx = CANVAS_BOUNDS.xmin
  const by = CANVAS_BOUNDS.ymin
  const bw = CANVAS_BOUNDS.xmax - CANVAS_BOUNDS.xmin
  const bh = CANVAS_BOUNDS.ymax - CANVAS_BOUNDS.ymin
  // Draw frame of canvas_bounds
  ctx.strokeStyle = '#ddd'
  ctx.setLineDash([3, 3])
  ctx.strokeRect(bx, by, bw, bh)
  ctx.setLineDash([])

  const cx = bx + bw / 2
  const cy = by + bh / 2
  const r  = sym.size * 3   // scale up for visibility

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(1, -1)             // :flipped? _true del original (Y-flip)

  ctx.fillStyle   = sym.fillColor
  ctx.strokeStyle = sym.strokeColor
  ctx.lineWidth   = 2
  ctx.beginPath()

  switch (sym.shape) {
    case 'circle':   ctx.arc(0, 0, r, 0, Math.PI * 2); break
    case 'square':   ctx.rect(-r, -r, r * 2, r * 2); break
    case 'triangle': {
      const h = r * Math.sqrt(3)
      ctx.moveTo(0, -r); ctx.lineTo(h / 2, r / 2); ctx.lineTo(-h / 2, r / 2); ctx.closePath()
      break
    }
    case 'diamond':
      ctx.moveTo(0, -r * 1.2); ctx.lineTo(r, 0); ctx.lineTo(0, r * 1.2); ctx.lineTo(-r, 0); ctx.closePath()
      break
    case 'star': {
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2
        const rr = i % 2 === 0 ? r : r * 0.45
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      break
    }
    case 'cross': {
      const arm = r * 0.35
      ctx.rect(-r, -arm, r * 2, arm * 2)
      ctx.rect(-arm, -r, arm * 2, r * 2)
      break
    }
  }
  ctx.fill(); ctx.stroke()
  ctx.restore()
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CPreviewSymbolDialogShowcase() {
  const [page] = useState<LayoutPage>(makePage())
  const layout: LayoutContext = useMemo(() => ({
    currentPage: () => page,
    refreshView: () => {/* noop */},
  }), [page])

  const dialog = useMemo(() => new CPreviewSymbolDialog(mockSymbolStyleService, layout), [layout])

  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [inserted, setInserted] = useState<SymbolLayout[]>([])
  const [status, setStatus] = useState<string>('')

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!selected) return
    const sym = dialog.treeItemSelect(selected)
    if (sym) drawSample(canvas, sym)
  }, [selected, dialog])

  const onSelect = (name: string) => {
    setSelected(name)
    setStatus('')
  }

  const onOk = () => {
    const r = dialog.ok()
    if (r.ok) {
      setInserted([...page.symbolElements])
      setStatus(`✓ Insertado "${r.symbol.name}" en (${Math.round((r.symbol.bounds.xmin + r.symbol.bounds.xmax) / 2)}, ${Math.round((r.symbol.bounds.ymin + r.symbol.bounds.ymax) / 2)})`)
    } else {
      setStatus(`✗ ${r.reason}`)
    }
  }

  const onSalir = () => {
    dialog.wmClose()
    setSelected(undefined)
    setStatus('wm_close: sNombreSimbolo limpiado')
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_preview_symbol_dialog
        <Chip label="Fase 2 · COMPLEJO · score 8" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label={`canvas_size = ${CANVAS_SIZE}`} size="small" variant="outlined" sx={{ ml: 1, fontFamily: 'monospace' }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_preview_symbol_dialog.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Tree de símbolos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="ordered_symbol_names"
              subheader={`display_trees → ${dialog.availableSymbolNames().length} símbolos`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ p: 0 }}>
              <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {dialog.availableSymbolNames().map(name => (
                  <ListItemButton
                    key={name}
                    selected={selected === name}
                    onClick={() => onSelect(name)}
                    sx={{ pl: 2 }}
                  >
                    <ListItemText
                      primary={<Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>{name}</Box>}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview canvas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="preview_canvas"
              subheader={`canvas_bounds = bbox(${CANVAS_BOUNDS.xmin.toFixed(1)},${CANVAS_BOUNDS.ymin.toFixed(1)},${CANVAS_BOUNDS.xmax.toFixed(1)},${CANVAS_BOUNDS.ymax.toFixed(1)})`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  style={{ background: '#fafafa', border: '1px solid #ccc', borderRadius: 4 }}
                />
                <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, width: '100%' }}>
                  sNombreSimbolo = "{dialog.sNombreSimbolo}"<br />
                  ok_button.enabled? = {String(dialog.okEnabled)}
                </Box>
                {selected && !dialog.drawPreview(selected) && (
                  <Alert severity="warning" sx={{ fontSize: 11, width: '100%' }}>
                    sym.actual_geoms _is _unset → no se dibuja preview.
                  </Alert>
                )}
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={onOk} disabled={!dialog.okEnabled}>
                    Insertar
                  </Button>
                  <Button variant="outlined" size="small" onClick={onSalir}>Salir</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Página activa + insertados */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="current_page"
              subheader={`${inserted.length} symbol_layout insertados`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {status && (
                <Box sx={{ p: 1, bgcolor: status.startsWith('✓') ? '#e8f5e9' : '#ffebee', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, mb: 1.5 }}>
                  {status}
                </Box>
              )}
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                lógica de posicionamiento (ok())
              </Typography>
              <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                • bbox(0,0,600,600)<br />
                • 1ª inserción → centro de page.bounds<br />
                • siguientes → desplazada +width del último<br />
              </Box>

              <Box sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
                {inserted.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">Página vacía.</Typography>
                ) : (
                  inserted.map((s, i) => (
                    <Box key={i} sx={{ p: 0.5, mb: 0.5, bgcolor: 'action.hover', borderRadius: 0.5, fontFamily: 'monospace', fontSize: 11 }}>
                      [{i + 1}] {s.name} · centre ({Math.round((s.bounds.xmin + s.bounds.xmax) / 2)}, {Math.round((s.bounds.ymin + s.bounds.ymax) / 2)})
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
