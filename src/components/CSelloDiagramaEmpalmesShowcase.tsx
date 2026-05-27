import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, Grid,
  InputAdornment, Stack, TextField, Tooltip, Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  CSelloDiagramaEmpalmes,
  type DiagramaEmpalmesBounds,
} from '../models/CSelloDiagramaEmpalmes'

// =============================================================================
// LAYOUT SCHEMATIC
// =============================================================================

function LayoutSchematic({ x, y, colour }: {
  x: number   // lnDivisionX in mm
  y: number   // lnDivisionY in mm
  colour: string
}) {
  // Total width = 12x, total height = 7y (top) + 2y (bottom)
  const totalW = 12 * x
  const totalH = 9 * y
  const scale  = Math.min(460 / totalW, 200 / totalH, 1.5)

  const sw = (v: number) => v * scale
  const sh = (v: number) => v * scale

  const colBorder = `1.5px solid ${colour}`
  const noTxt: React.CSSProperties = {
    fontSize: 9, fontFamily: 'monospace', color: colour,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
  }

  return (
    <Box>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0 }}>
        {/* Row 1: dfo_origen | titulo_notas | dfo_destino */}
        <Box sx={{ display: 'flex' }}>

          {/* tbl_dfo_origen — 2x wide, 7y tall */}
          <Box sx={{
            width: sw(2 * x), height: sh(7 * y),
            border: colBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#e3f2fd', fontSize: 8, fontFamily: 'monospace', color: 'primary.main',
            textAlign: 'center', lineHeight: 1.3,
          }}>
            DFO<br/>ORIGEN
          </Box>

          {/* tbl_titulo_notas — 8x wide, split into 3 rows */}
          <Box sx={{ width: sw(8 * x), display: 'flex', flexDirection: 'column', borderTop: colBorder, borderRight: colBorder }}>
            {/* row 1: 1y — title */}
            <Box sx={{ height: sh(y), borderBottom: colBorder, ...noTxt, px: 0.5, bgcolor: '#e8eaf6', fontWeight: 'bold' }}>
              DIAGRAMA GENERAL DE EMPALMES
            </Box>
            {/* row 2: 5.5y — legend */}
            <Box sx={{ height: sh(5.5 * y), borderBottom: colBorder, ...noTxt, px: 0.5, flexDirection: 'column', gap: 0, alignItems: 'flex-start', justifyContent: 'flex-start', pt: 0.5, fontSize: 8 }}>
              <Box>ET - EMPALME TERMINAL</Box>
              <Box>ER - EMPALME RECTO</Box>
              <Box>ED - EMPALME DE DERIVACION</Box>
            </Box>
            {/* row 3: 0.5y — length */}
            <Box sx={{ height: sh(0.5 * y), ...noTxt, px: 0.5, color: 'text.secondary', fontSize: 8, justifyContent: 'flex-start' }}>
              LONGITUD : 0.00 Mts. ★
            </Box>
          </Box>

          {/* tbl_dfo_destino — 2x wide, 7y tall */}
          <Box sx={{
            width: sw(2 * x), height: sh(7 * y),
            border: colBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#e3f2fd', fontSize: 8, fontFamily: 'monospace', color: 'primary.main',
            textAlign: 'center', lineHeight: 1.3,
          }}>
            DFO<br/>DESTINO
          </Box>

        </Box>

        {/* Row 2: tbl_trayectoria — 1x | 10x (diagram) | 1x */}
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: sw(x), height: sh(2 * y), border: colBorder, bgcolor: '#f5f5f5' }} />
          <Box sx={{
            width: sw(10 * x), height: sh(2 * y),
            border: colBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#fff8e1', fontSize: 9, fontFamily: 'monospace', color: 'text.secondary',
          }}>
            c_diagrama_empalmes_grafico [Fase 5]
          </Box>
          <Box sx={{ width: sw(x), height: sh(2 * y), border: colBorder, bgcolor: '#f5f5f5' }} />
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Escala visual · x={x.toFixed(1)} mm · y={y.toFixed(1)} mm
        · ancho total={( 12 * x).toFixed(1)} mm · alto total={(9 * y).toFixed(1)} mm
      </Typography>
    </Box>
  )
}

// =============================================================================
// MAIN SHOWCASE
// =============================================================================

export function CSelloDiagramaEmpalmesShowcase() {
  const [boundsW,      setBoundsW]      = useState(600)   // xmax - xmin in mm
  const [boundsH,      setBoundsH]      = useState(210)   // ymax - ymin in mm
  const [mockEmpalmes, setMockEmpalmes] = useState(5)
  const [colour,       setColour]       = useState('#000000')

  const bounds = useMemo<DiagramaEmpalmesBounds>(() => ({
    xmin: 0, ymin: 0, xmax: boundsW, ymax: boundsH,
  }), [boundsW, boundsH])

  const sello = useMemo(() => new CSelloDiagramaEmpalmes({ bounds }), [bounds])

  const { lnDivisionX, lnDivisionY, empalmes } =
    sello.computeLayoutFactors(mockEmpalmes)

  const fmt = (v: number) => v.toFixed(2)

  const isHighEmpalmes = mockEmpalmes > 10

  // Table dimensions summary
  const dims = [
    { name: 'tbl_dfo_origen',   shape: '1×1', rows: `7y = ${fmt(7 * lnDivisionY)}`, cols: `2x = ${fmt(2 * lnDivisionX)}` },
    { name: 'tbl_titulo_notas', shape: '3×1', rows: `y + 5.5y + 0.5y = ${fmt(7 * lnDivisionY)}`, cols: `8x = ${fmt(8 * lnDivisionX)}` },
    { name: 'tbl_dfo_destino',  shape: '1×1', rows: `7y = ${fmt(7 * lnDivisionY)}`, cols: `2x = ${fmt(2 * lnDivisionX)}` },
    { name: 'tbl_trayectoria',  shape: '1×3', rows: `2y = ${fmt(2 * lnDivisionY)}`, cols: `x + 10x + x = ${fmt(12 * lnDivisionX)}` },
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_diagrama_empalmes
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/estudio_transmision/c_sello_diagrama_empalmes.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Bounds */}
            <Card variant="outlined">
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Bounding box (bounds)
                    <Tooltip title="En Magik: _self.bounds.xmax - _self.bounds.xmin / ymax - ymin. Determina los factores de escala lnDivisionX y lnDivisionY. En el showcase se usan width y height simplificados.">
                      <InfoOutlinedIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                }
                subheader="Dimensiones del layout en mm"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Ancho (xmax − xmin)"
                    type="number"
                    value={boundsW}
                    onChange={e => setBoundsW(Number(e.target.value) || 600)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                  />
                  <TextField
                    label="Alto (ymax − ymin)"
                    type="number"
                    value={boundsH}
                    onChange={e => setBoundsH(Number(e.target.value) || 210)}
                    size="small" fullWidth
                    slotProps={{ input: { endAdornment: <InputAdornment position="end">mm</InputAdornment> } }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Mock empalmes */}
            <Card variant="outlined" sx={{ borderColor: isHighEmpalmes ? 'warning.light' : undefined }}>
              <CardHeader
                title="total_empalmes() — mock"
                subheader="GIS: cuenta splice_closure en oEngine → Fase 5"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  label="Nº de empalmes (mock)"
                  type="number"
                  value={mockEmpalmes}
                  onChange={e => setMockEmpalmes(Math.max(0, Number(e.target.value) || 0))}
                  size="small" fullWidth
                  helperText={isHighEmpalmes
                    ? `> 10 → lnDivisionX = ${empalmes}×3+15 = ${lnDivisionX} (bounds ignorados)`
                    : `≤ 10 → lnDivisionX = width/60 + ${empalmes} + 15`}
                />
                {isHighEmpalmes && (
                  <Chip
                    label="Rama > 10: bounds ignorados"
                    size="small" color="warning" sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Computed factors */}
            <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
              <CardHeader title="Factores calculados" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2.5 }}>
                  <Box>
                    lnDivisionX:
                    <Box component="span" sx={{ float: 'right', color: 'primary.main', fontWeight: 'bold' }}>
                      {lnDivisionX.toFixed(2)} mm
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    lnDivisionY:
                    <Box component="span" sx={{ float: 'right', color: 'primary.main', fontWeight: 'bold' }}>
                      {lnDivisionY.toFixed(2)} mm
                    </Box>
                  </Box>
                  <Divider />
                  <Box>
                    Ancho total (12x):
                    <Box component="span" sx={{ float: 'right' }}>
                      {(12 * lnDivisionX).toFixed(2)} mm
                    </Box>
                  </Box>
                  <Box>
                    Alto total (9y):
                    <Box component="span" sx={{ float: 'right' }}>
                      {(9 * lnDivisionY).toFixed(2)} mm
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <TextField
              label="colour"
              type="color"
              value={colour}
              onChange={e => setColour(e.target.value)}
              size="small" fullWidth
            />

          </Stack>
        </Grid>

        {/* RIGHT: preview + tables */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* Schematic */}
            <Card variant="outlined">
              <CardHeader
                title="Layout esquemático"
                subheader="4 tablas con dimensiones dinámicas · ★ LONGITUD desde oEngine (Fase 5)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <LayoutSchematic x={lnDivisionX} y={lnDivisionY} colour={colour} />
              </CardContent>
            </Card>

            {/* Table dimensions */}
            <Card variant="outlined">
              <CardHeader title="Dimensiones de tablas" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Shape', 'Altura(s)', 'Ancho(s)', 'Origen Y'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {dims.map(({ name, shape, rows, cols }, i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold', color: 'primary.main' }}>{name}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{shape}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{rows}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{cols}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{i === 3 ? `−7y = −${(7 * lnDivisionY).toFixed(1)}` : '0'}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Algorithm */}
            <Card variant="outlined">
              <CardHeader title="Algoritmo lnDivisionX" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8 }}>
                  <Box sx={{ color: 'text.secondary', mb: 0.5 }}>// Magik: configura_tabla()</Box>
                  <Box>lnDivisionX ← (xmax − xmin) / (6×10)
                    <Box component="span" sx={{ color: 'text.disabled' }}> = {(boundsW / 60).toFixed(2)}</Box>
                  </Box>
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ color: isHighEmpalmes ? 'text.disabled' : 'success.main' }}>
                      else (empalmes ≤ 10): lnDivisionX += empalmes + 15
                      {!isHighEmpalmes && ` → ${lnDivisionX.toFixed(2)}`}
                    </Box>
                    <Box sx={{ color: isHighEmpalmes ? 'warning.main' : 'text.disabled' }}>
                      if (empalmes &gt; 10): lnDivisionX = empalmes×2; += empalmes+15 → empalmes×3+15
                      {isHighEmpalmes && ` = ${lnDivisionX.toFixed(2)}`}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box>lnDivisionY ← (ymax − ymin) / (3×10)
                    <Box component="span" sx={{ color: 'text.disabled' }}> = {lnDivisionY.toFixed(2)}</Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Nota: <code>pl_tbl_trayectoria</code> se declara pero no se usa — la tabla de trayectoria
                  reutiliza <code>pl_tbl_dfo</code> (después de ser reasignado). Comportamiento del source preservado.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
