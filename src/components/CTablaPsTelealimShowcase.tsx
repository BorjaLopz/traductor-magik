import {
  Box, Card, CardContent, CardHeader, Chip, Grid, Typography,
} from '@mui/material'

// ─── Rendered table preview ──────────────────────────────────────────────────

const SCALE = 3.2  // px per mm
const C1 = 50 * SCALE
const C2 = 12 * SCALE
const C3 = 12 * SCALE
const RH = 7 * SCALE   // all rows: 7mm

function TablaPsTelealimPreview() {
  return (
    <Box>
      <Box sx={{
        display: 'inline-block',
        border: '1.5px solid #555',
        fontFamily: 'monospace',
      }}>
        {/* Row 1: merged header (no internal borders in cols 1 & 2) */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #555' }}>
          <Box sx={{ width: C1, height: RH, display: 'flex', alignItems: 'center', pl: 0.5, bgcolor: '#e3f2fd' }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>
              PARES PRINCIPALES DE TELEALIMENTACION
            </Typography>
          </Box>
          {/* borderDer hidden on col1 and col2 → cells visually merged */}
          <Box sx={{ width: C2, height: RH, bgcolor: '#e3f2fd' }} />
          <Box sx={{ width: C3, height: RH, bgcolor: '#e3f2fd', borderLeft: '1px solid #555' }} />
        </Box>

        {/* Row 2: column headers */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #555' }}>
          <Box sx={{ width: C1, height: RH, borderRight: '1px solid #555', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', pl: 0.5 }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>
              TERMINAL DE BANDA ANCHA
            </Typography>
          </Box>
          <Box sx={{ width: C2, height: RH, borderRight: '1px solid #555', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>STRIP</Typography>
          </Box>
          <Box sx={{ width: C3, height: RH, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold' }}>PAR</Typography>
          </Box>
        </Box>

        {/* Rows 3-22: empty data rows */}
        {Array.from({ length: 20 }, (_, i) => (
          <Box key={i} sx={{
            display: 'flex',
            borderBottom: i < 19 ? '1px solid #eee' : 'none',
          }}>
            <Box sx={{ width: C1, height: RH, borderRight: '1px solid #ddd', bgcolor: i % 2 === 0 ? '#fafafa' : '#fff' }} />
            <Box sx={{ width: C2, height: RH, borderRight: '1px solid #ddd', bgcolor: i % 2 === 0 ? '#fafafa' : '#fff' }} />
            <Box sx={{ width: C3, height: RH, bgcolor: i % 2 === 0 ? '#fafafa' : '#fff' }} />
          </Box>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Col 1: 50 mm · Col 2: 12 mm · Col 3: 12 mm · Todos los renglones: 7 mm · Escala {SCALE}×
      </Typography>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CTablaPsTelealimShowcase() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla_ps_telealim
        <Chip label="Fase 2 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="100% estático" size="small" color="info" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/montaje_tba/sellos/c_tabla_ps_telealim.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Tabla de pares principales de telealimentación para planos de montaje TBA.
        Sin slots, sin atributos, sin lectura GIS — solo <code>configura_tabla()</code> y{' '}
        <code>etiqueta_celdas()</code>. Tabla 22×3: fila 1 = título fusionado, fila 2 = encabezados
        de columna, filas 3-22 = 20 renglones de datos (llenados por el motor de planos).
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Vista previa del sello"
              subheader={`tbl_ps_teleal — 22 renglones × 3 cols · escala ${SCALE}×`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <TablaPsTelealimPreview />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardHeader
                  title="Estructura de la tabla"
                  titleTypographyProps={{ variant: 'subtitle2' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                        {['Renglon(es)', 'Alto', 'Col 1 (50mm)', 'Col 2 (12mm)', 'Col 3 (12mm)', 'Notas'].map(h => (
                          <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#e3f2fd' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>1</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>7 mm</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>"PARES PRINCIPALES…"</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled' }}>— (border oculto)</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled' }}>— (border oculto)</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>
                          30pt · centre_left · 6° · borderDer(1,1)=false · borderDer(1,2)=false
                        </Box>
                      </Box>
                      <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#e8f5e9' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>2</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>7 mm</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>"TERMINAL DE BANDA ANCHA"</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>"STRIP"</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>"PAR"</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>20pt · sin alineación</Box>
                      </Box>
                      <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>3-22</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>7 mm</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled' }}>(vacío)</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled' }}>(vacío)</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled' }}>(vacío)</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'warning.main', fontSize: 10 }}>
                          20 renglones de datos · llenados por motor externo
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1.5, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                    Total: 74 mm ancho × 154 mm alto (22 × 7mm)
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardHeader
                  title="Bordes ocultos"
                  titleTypographyProps={{ variant: 'subtitle2' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                        {['Celda', 'Borde', 'Efecto visual'].map(h => (
                          <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {[
                        { cell: '(1, 1)', border: 'borderDer', effect: 'Elimina separación col1↔col2 en fila 1' },
                        { cell: '(1, 2)', border: 'borderDer', effect: 'Elimina separación col2↔col3 en fila 1 → título fusionado' },
                      ].map(({ cell, border, effect }) => (
                        <Box component="tr" key={cell} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{cell}</Box>
                          <Box component="td" sx={{ p: '3px 8px', color: 'error.main' }}>{border} = false</Box>
                          <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary' }}>{effect}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Grid>

      </Grid>
    </Box>
  )
}
