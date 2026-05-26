import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, Slider,
  Stack, Typography,
} from '@mui/material'
import { CSimbologiaPlanoConstruccion } from '../models/CSimbologiaPlanoConstruccion'

export function CSimbologiaPlanoConstruccionShowcase() {
  const sello = useMemo(() => new CSimbologiaPlanoConstruccion(), [])
  const [scale, setScale] = useState<number>(2)

  const tabla = sello.tabla!

  // Render SVG escalado mm → px
  const pad = 6
  const W = tabla.colWidths[0] * scale + pad * 2
  const H = (tabla.rowHeights[0] + tabla.rowHeights[1]) * scale + pad * 2

  // Coords de cada celda
  const y0 = pad
  const y1 = pad + tabla.rowHeights[0] * scale
  const cellH = [tabla.rowHeights[0] * scale, tabla.rowHeights[1] * scale]
  const cellY = [y0, y1]
  const cellX = pad
  const cellW = tabla.colWidths[0] * scale

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_simbologia_plano_construccion
        <Chip label="Fase 1 · SIMPLE · score 4" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends c_base_sello" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_simbologia_plano_construccion.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Estructura */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title=":tbl_simbologia"
              subheader="o_tablas.crea_tabla(2, 1, :tbl_simbologia)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  <div>rows           = {tabla.rows}</div>
                  <div>cols           = {tabla.cols}</div>
                  <div>rowHeights[1]  = {tabla.rowHeights[0]} mm</div>
                  <div>rowHeights[2]  = {tabla.rowHeights[1]} mm</div>
                  <div>colWidths[1]   = {tabla.colWidths[0]} mm</div>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  <div>Celda (2,1).bordes_celda.bBorde_Sup? = {String(tabla.bordes[1][0].sup)}</div>
                  <div style={{ color: '#666' }}>→ visualmente se une con la celda (1,1).</div>
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Contenido por celda
                  </Typography>
                  <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, mt: 0.5, '& td': { p: 0.5, borderBottom: '1px solid', borderColor: 'divider' } }}>
                    <tbody>
                      {tabla.cells.map((row, ri) =>
                        row.map((c, ci) => (
                          <tr key={`${ri}-${ci}`}>
                            <Box component="td" sx={{ color: 'text.secondary', width: 60 }}>({ri + 1},{ci + 1})</Box>
                            <Box component="td">
                              {c?.tipo === 'texto'   && <>texto: "<strong>{c.texto}</strong>" · t={c.tamanio}</>}
                              {c?.tipo === 'simbolo' && <>simbolo: "<strong>{c.nombreGrafico}</strong>"</>}
                              {!c && <span style={{ color: '#bbb' }}>(vacío)</span>}
                            </Box>
                          </tr>
                        )),
                      )}
                    </tbody>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Render SVG */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Render"
              subheader="Escala mm → px"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  escala = {scale} px/mm
                </Typography>
                <Slider min={1} max={4} step={0.25} value={scale} onChange={(_, v) => setScale(v as number)} size="small" />
              </Box>

              <Box sx={{ overflowX: 'auto' }}>
                <svg width={W} height={H} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4 }}>
                  {/* Renglón 1 — TITULO */}
                  <rect x={cellX} y={cellY[0]} width={cellW} height={cellH[0]} fill="#fafafa" stroke="none" />
                  {/* Bordes celda (1,1) — todos */}
                  <rect x={cellX} y={cellY[0]} width={cellW} height={cellH[0]} fill="none" stroke="#333" strokeWidth={1} />

                  {/* Renglón 2 — SIMBOLO */}
                  <rect x={cellX} y={cellY[1]} width={cellW} height={cellH[1]} fill="#fafafa" stroke="none" />
                  {/* Borde inferior + izq + der celda (2,1) — superior OFF */}
                  <line x1={cellX}          y1={cellY[1] + cellH[1]} x2={cellX + cellW} y2={cellY[1] + cellH[1]} stroke="#333" strokeWidth={1} />
                  <line x1={cellX}          y1={cellY[1]}            x2={cellX}         y2={cellY[1] + cellH[1]} stroke="#333" strokeWidth={1} />
                  <line x1={cellX + cellW}  y1={cellY[1]}            x2={cellX + cellW} y2={cellY[1] + cellH[1]} stroke="#333" strokeWidth={1} />

                  {/* Contenido celda (1,1) — texto SIMBOLOGIA */}
                  <text
                    x={cellX + cellW / 2}
                    y={cellY[0] + cellH[0] / 2}
                    fontFamily="sans-serif"
                    fontSize={Math.max(8, 30 * 0.4 * (scale / 2))}
                    fill="#222"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    SIMBOLOGIA
                  </text>

                  {/* Contenido celda (2,1) — placeholder símbolo */}
                  <rect
                    x={cellX + cellW / 2 - 30 * scale / 2}
                    y={cellY[1] + cellH[1] / 2 - 30 * scale / 2}
                    width={30 * scale}
                    height={30 * scale}
                    fill="#e3f2fd"
                    stroke="#1565c0"
                    strokeWidth={1.5}
                  />
                  <text
                    x={cellX + cellW / 2}
                    y={cellY[1] + cellH[1] / 2 + 22 * scale}
                    fontFamily="monospace"
                    fontSize={10}
                    fill="#1565c0"
                    textAnchor="middle"
                  >
                    simbologia_plano_construccion
                  </text>
                </svg>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Borde superior de (2,1) desactivado → línea media ausente entre título y símbolo.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
