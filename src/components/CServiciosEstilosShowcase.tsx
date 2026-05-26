import { useMemo, useState } from 'react'
import {
  Alert, Box, Card, CardContent, CardHeader, Chip, Divider, Grid,
  MenuItem, Stack, TextField, Typography,
} from '@mui/material'
import {
  CServiciosEstilos,
  type RwoEst,
  type ActualTextStyle,
} from '../models/CServiciosEstilos'

type RwoChoice = 'gis_text_style' | 'rwo_style' | 'otro_no_text'
type EstadoChoice = 'PROYECTADO' | 'EXISTENTE' | 'unset'

const BASE_STYLE: ActualTextStyle = {
  font:   'plain',
  colour: 'black',
  xscale: 10,
  yscale: 10,
}

export function CServiciosEstilosShowcase() {
  const servicio = useMemo(() => CServiciosEstilos.singleton(), [])
  const [rwoChoice, setRwoChoice] = useState<RwoChoice>('gis_text_style')
  const [estado, setEstado]       = useState<EstadoChoice>('PROYECTADO')
  const [baseXScale, setBaseXScale] = useState<number>(10)

  const baseStyle: ActualTextStyle = { ...BASE_STYLE, xscale: baseXScale, yscale: baseXScale }

  const rwo: RwoEst = useMemo(() => {
    if (rwoChoice === 'gis_text_style') {
      return { className: 'gis_text_style', actualTextStyles: { left_right: baseStyle } }
    }
    if (rwoChoice === 'rwo_style') {
      return { className: 'rwo_style', actualTextStyle: baseStyle }
    }
    return { className: 'unsupported_kind' }
  }, [rwoChoice, baseStyle])

  const pConstruccion = estado === 'unset' ? undefined : estado

  const result = servicio.obtenerEstiloBlancoYNegroTxt(rwo, pConstruccion)
  const isPassthrough = rwoChoice === 'otro_no_text'

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_servicios_estilos
        <Chip label="Fase 1 · SIMPLE · score 12" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="singleton" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_servicios_estilos.magik</code> — package <code>user</code>
      </Typography>

      <Alert severity="info" sx={{ mt: 1, mb: 2 }} icon={false}>
        <strong>Reglas:</strong> PROYECTADO → <code>bold + red + escala × 1.10 truncada</code> ·
        unset → <code>plain + black</code> · otro valor → <code>plain + green</code>. ·
        Si <code>class_name</code> no es texto, se devuelve el input sin transformar.
      </Alert>

      <Grid container spacing={3}>
        {/* Inputs */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="obtener_estilo_blanco_y_negro_txt(PoRwo_est, Pc_construccion)"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="PoRwo_est.class_name"
                  value={rwoChoice}
                  onChange={e => setRwoChoice(e.target.value as RwoChoice)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="gis_text_style">:gis_text_style → actual_text_styles[:left_right]</MenuItem>
                  <MenuItem value="rwo_style">:rwo_style → actual_text_style</MenuItem>
                  <MenuItem value="otro_no_text">otro (no text) → passthrough</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Pc_construccion"
                  value={estado}
                  onChange={e => setEstado(e.target.value as EstadoChoice)}
                  size="small"
                  fullWidth
                  disabled={isPassthrough}
                >
                  <MenuItem value="PROYECTADO">PROYECTADO</MenuItem>
                  <MenuItem value="EXISTENTE">EXISTENTE (otro valor)</MenuItem>
                  <MenuItem value="unset">_unset (no se pasa)</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  label="baseStyle.xscale = yscale"
                  value={baseXScale}
                  onChange={e => setBaseXScale(Math.max(0, Number(e.target.value) || 0))}
                  size="small"
                  fullWidth
                  disabled={isPassthrough}
                />

                <Divider />

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  baseStyle = {`{ font: "${baseStyle.font}", colour: "${baseStyle.colour}", xscale: ${baseStyle.xscale}, yscale: ${baseStyle.yscale} }`}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Result + preview */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Resultado"
              subheader={isPassthrough ? 'passthrough — devuelve input sin transformar' : 'copy_with_properties(font, xscale, yscale, colour)'}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {isPassthrough ? (
                <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  → {JSON.stringify(result)}
                </Box>
              ) : (
                <>
                  <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                    {JSON.stringify(result, null, 2)}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Preview
                  </Typography>
                  <PreviewStyle style={result as ActualTextStyle} />
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                Singleton activo: {String(CServiciosEstilos.singleton() === servicio)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function PreviewStyle({ style }: { style: ActualTextStyle }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, textAlign: 'center', bgcolor: '#fff' }}>
      <Box
        component="span"
        sx={{
          fontWeight: style.font === 'bold' ? 700 : 400,
          color:      style.colour,
          transform:  `scale(${style.xscale / 10}, ${style.yscale / 10})`,
          display:    'inline-block',
          fontSize:   16,
          fontFamily: 'monospace',
        }}
      >
        ESTILO TEXTO
      </Box>
      <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
        font={style.font} · colour={style.colour} · xscale={style.xscale} · yscale={style.yscale}
      </Box>
    </Box>
  )
}
