import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, FormControlLabel, Grid,
  Slider, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CSimbologiaOcupacionDeDuctos } from '../models/CSimbologiaOcupacionDeDuctos'

export function CSimbologiaOcupacionDeDuctosShowcase() {
  const [coordX, setCoordX] = useState<number>(0)
  const [coordY, setCoordY] = useState<number>(0)
  const [scale,  setScale]  = useState<number>(3)
  const [showBordes, setShowBordes] = useState<boolean>(true)  // toggle visual sólo

  const sello = useMemo(
    () => new CSimbologiaOcupacionDeDuctos({ x: coordX, y: coordY }),
    [coordX, coordY],
  )

  const t = sello.tabla!
  const pad = 8
  const cellW = t.colWidths[0] * scale
  const cellH = t.rowHeights[0] * scale
  const W = cellW + pad * 2
  const H = cellH + pad * 2

  const celda = t.cells[0][0]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_simbologia_ocupacion_de_ductos
        <Chip label="Fase 1 · SIMPLE · score 2" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip
          label={`allowed_on_menu? = ${String(CSimbologiaOcupacionDeDuctos.allowedOnMenu)}`}
          size="small"
          variant="outlined"
          sx={{ ml: 1, fontFamily: 'monospace' }}
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_simbologia_ocupacion_de_ductos.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Estructura */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title=":tbl_contenido"
              subheader="property_list(:ren {37}, :col {74}) — sin bordes"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  <div>rows           = {t.rows}</div>
                  <div>cols           = {t.cols}</div>
                  <div>rowHeights[1]  = {t.rowHeights[0]} mm</div>
                  <div>colWidths[1]   = {t.colWidths[0]} mm</div>
                  <div>oCoordenadaOrigen = ({t.oCoordenadaOrigen.x}, {t.oCoordenadaOrigen.y}) mm</div>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  Celda (1,1) bordes = {`{ sup:${t.bordes[0][0].sup}, inf:${t.bordes[0][0].inf}, izq:${t.bordes[0][0].izq}, der:${t.bordes[0][0].der} }`}<br />
                  <span style={{ color: '#666' }}>→ todos en false: oculta_bordes_celdas</span>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  Celda (1,1).oElemento = simbolo "{celda?.tipo === 'simbolo' ? celda.nombreGrafico : '_unset'}" · escala = {celda?.tipo === 'simbolo' ? celda.escala : '—'}
                </Box>

                <Stack direction="row" spacing={1}>
                  <TextField
                    label="o_coord_inicio.x (mm)"
                    type="number"
                    value={coordX}
                    onChange={e => setCoordX(Number(e.target.value) || 0)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="o_coord_inicio.y (mm)"
                    type="number"
                    value={coordY}
                    onChange={e => setCoordY(Number(e.target.value) || 0)}
                    size="small"
                    fullWidth
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Render"
              subheader="37 × 74 mm escalado"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">escala = {scale} px/mm</Typography>
                  <Slider min={1} max={6} step={0.5} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
                </Box>
                <FormControlLabel
                  control={<Switch checked={showBordes} onChange={e => setShowBordes(e.target.checked)} />}
                  label="Mostrar bordes (sólo guía visual — el sello los oculta)"
                />

                <Box sx={{ overflowX: 'auto' }}>
                  <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: 4 }}>
                    <rect
                      x={pad} y={pad} width={cellW} height={cellH}
                      fill="#fafafa"
                      stroke={showBordes ? '#bbb' : 'none'}
                      strokeDasharray={showBordes ? '4 3' : undefined}
                    />
                    {/* Símbolo placeholder — caja escala 3 */}
                    {celda?.tipo === 'simbolo' && (
                      <>
                        <rect
                          x={pad + cellW / 2 - 15 * celda.escala * scale / 3}
                          y={pad + cellH / 2 - 15 * celda.escala * scale / 3}
                          width={30 * celda.escala * scale / 3}
                          height={30 * celda.escala * scale / 3}
                          fill="#fff3e0"
                          stroke="#e65100"
                          strokeWidth={2}
                        />
                        <circle
                          cx={pad + cellW / 2}
                          cy={pad + cellH / 2}
                          r={6 * celda.escala * scale / 3}
                          fill="#e65100"
                        />
                        <text
                          x={pad + cellW / 2}
                          y={pad + cellH - 6}
                          fontFamily="monospace"
                          fontSize={11}
                          fill="#e65100"
                          textAnchor="middle"
                        >
                          {celda.nombreGrafico} · scale={celda.escala}
                        </text>
                      </>
                    )}
                  </svg>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
