import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box, Button, Card, CardContent, CardHeader,
  Chip, Divider, Grid, Paper, Stack, TextField, Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { CGuiEditaSelloResumenProyecto } from '../models/CGuiEditaSelloResumenProyecto'

const INITIAL_TEXTO = 'SE REALIZARA LA CONSTRUCCION DE CANALIZACION\nSUBTERRANEA PARA CABLES DE FIBRA OPTICA\nCON TUBERIA DE PVC TIPO CONDUIT'

export function CGuiEditaSelloResumenProyectoShowcase() {
  const [selloTexto,  setSelloTexto]  = useState(INITIAL_TEXTO)
  const [isOpen,      setIsOpen]      = useState(false)
  const [contenido,   setContenido]   = useState(INITIAL_TEXTO)
  const [lastAction,  setLastAction]  = useState<string | null>(null)
  const [noteLog,     setNoteLog]     = useState<Array<{ who: string; what: string }>>([])

  const guiRef = useRef<CGuiEditaSelloResumenProyecto | null>(null)

  const gui = useMemo(() => {
    const g = new CGuiEditaSelloResumenProyecto()
    g.onEscribirAlSello(texto => {
      setSelloTexto(texto)
      setLastAction(`escribirTextoAlSello() → "${texto.slice(0, 40)}..."`)
    })
    guiRef.current = g
    return g
  }, [])

  const handleAbrirVentana = useCallback(() => {
    gui.abrirVentana(selloTexto)
    setContenido(gui.contenido)
    setIsOpen(true)
    setLastAction('abrirVentana() → ventana activada, texto cargado del sello')
    setNoteLog(prev => [...prev, { who: 'oBoton_abre', what: 'ventana_abierta' }])
  }, [gui, selloTexto])

  const handleEscribir = useCallback(() => {
    gui.setContenido(contenido)
    gui.escribirTextoAlSello()
    setContenido(gui.contenido)
    setIsOpen(false)
    setNoteLog(prev => [...prev, { who: 'oBoton_escribe', what: 'sello_actualizado' }])
  }, [gui, contenido])

  const handleSalir = useCallback(() => {
    gui.salir()
    setIsOpen(false)
    setLastAction('salir() → oMarco.deactivate()')
    setNoteLog(prev => [...prev, { who: 'oBoton_salir', what: 'ventana_desactivada' }])
  }, [gui])

  const handleNoteChange = () => {
    const result = gui.noteChange('layout_manager', 'refresh')
    setLastAction(`noteChange() → [${String(result[0])}, ${String(result[1])}]`)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CGuiEditaSelloResumenProyecto
        <Chip label="Fase 4 · MODERADO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_gui_edita_sello_resumen_proyecto.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Extiende <code>:model</code> · Ventana 550×500 · Botones: "Escribe Texto al Sello" / "Cancelar"
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: dialog + controls ── */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            {/* Trigger */}
            <Card variant="outlined">
              <CardHeader
                title="abre_ventana()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Activa el marco y carga el texto del sello en oVentana"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleAbrirVentana}
                  disabled={isOpen}
                  size="small"
                >
                  Personalización del Sello
                </Button>
              </CardContent>
            </Card>

            {/* Dialog simulation */}
            {isOpen && (
              <Paper
                variant="outlined"
                sx={{
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {/* Titlebar */}
                <Box sx={{
                  bgcolor: 'primary.main', color: 'white',
                  px: 1.5, py: 0.75,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                    Personalización del Sello  [550 × 500]
                  </Typography>
                  <Chip label="oMarco.activate()" size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 9 }} />
                </Box>

                <Box sx={{ p: 1.5 }}>
                  {/* text_window 33 rows × 110 cols */}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    oVentana — <code>text_window.new(33, 110)</code>
                  </Typography>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    size="small"
                    value={contenido}
                    onChange={e => setContenido(e.target.value)}
                    slotProps={{
                      htmlInput: { style: { fontFamily: 'monospace', fontSize: 11 } },
                    }}
                    sx={{ mb: 1.5 }}
                    helperText="Contenido editable del sello · se convierte a MAYÚSCULAS al escribir"
                  />

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={handleEscribir}
                    >
                      Escribe Texto al Sello
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={handleSalir}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            )}

            {/* Extras */}
            <Card variant="outlined">
              <CardHeader
                title="Métodos adicionales"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  <Button variant="outlined" size="small" onClick={handleNoteChange}>
                    noteChange('layout_manager', 'refresh')
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    obtenSello() → stub (depende de Smallworld layout · Fase 5)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: sello preview + state ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>

            {/* Sello preview */}
            <Card variant="outlined">
              <CardHeader
                title="Sello: tbl_resumen_proyecto — celda (2,1)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="contenido_sello → LoSello.contenido_sello tras escribirTextoAlSello()"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                {/* Sello frame */}
                <Box sx={{ border: '2px solid #37474f', borderRadius: 0.5, overflow: 'hidden' }}>
                  {/* Header row */}
                  <Box sx={{
                    bgcolor: '#37474f', color: 'white',
                    px: 1, py: 0.5,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 10 }}>
                      RESUMEN DEL PROYECTO
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.7 }}>
                      c_resumen_proyecto
                    </Typography>
                  </Box>

                  {/* Content cell (2,1) */}
                  <Box sx={{
                    bgcolor: '#f5f5f5',
                    minHeight: 80,
                    p: 1.5,
                    borderBottom: '1px solid #e0e0e0',
                  }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      oCeldas.Celda(2,1).oElemento.sTexto
                    </Typography>
                    <Typography sx={{
                      fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
                      whiteSpace: 'pre-wrap', color: '#1a237e',
                    }}>
                      {selloTexto || '(vacío)'}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box sx={{ bgcolor: '#eceff1', px: 1, py: 0.5 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 9, color: '#546e7a' }}>
                      .LoLayout_Manager.action(:layout_view_refresh).execute_action()
                    </Typography>
                  </Box>
                </Box>

                {lastAction && (
                  <Alert severity="info" sx={{ mt: 1.5, fontSize: 11, py: 0 }}>
                    {lastAction}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* State inspector */}
            <Card variant="outlined">
              <CardHeader
                title="Estado del modelo"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Slots de c_gui_edita_sello_resumen_proyecto"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{
                  fontFamily: 'monospace', fontSize: 11,
                  bgcolor: 'action.hover', p: 1, borderRadius: 1,
                  display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 12px',
                }}>
                  <Typography variant="caption" color="text.secondary">isOpen</Typography>
                  <Typography variant="caption" sx={{ color: isOpen ? '#2e7d32' : '#c62828', fontFamily: 'monospace' }}>
                    {String(isOpen)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">contenido</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    "{contenido.slice(0, 40)}{contenido.length > 40 ? '…' : ''}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">selloTexto</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    "{selloTexto.slice(0, 40)}{selloTexto.length > 40 ? '…' : ''}"
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* note_change log */}
            {noteLog.length > 0 && (
              <Card variant="outlined">
                <CardHeader
                  title="note_change log"
                  titleTypographyProps={{ variant: 'subtitle2' }}
                  subheader="Patrón observer — {who, what}"
                  subheaderTypographyProps={{ variant: 'caption' }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={0.5}>
                    {noteLog.slice(-5).map((entry, i) => (
                      <Box key={i} sx={{
                        fontFamily: 'monospace', fontSize: 10,
                        bgcolor: 'action.hover', px: 1, py: 0.25, borderRadius: 0.5,
                      }}>
                        <span style={{ color: '#6a1b9a' }}>{entry.who}</span>
                        {' → '}
                        <span style={{ color: '#1565c0' }}>{entry.what}</span>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Class hierarchy */}
            <Card variant="outlined">
              <CardContent sx={{ pb: '12px !important' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label=":model" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                  <Typography variant="caption" color="text.secondary">→</Typography>
                  <Chip label="CGuiEditaSelloResumenProyecto" size="small" color="warning" sx={{ fontFamily: 'monospace' }} />
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    frame 550×500 · text_window 33×110 · obtenSello() stub (Fase 5)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
