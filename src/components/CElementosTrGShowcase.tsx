import { useState, useMemo } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip,
  FormControlLabel, Grid, Stack, Switch,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material'
import { CElementosTrG, type CElementoGrafico } from '../models/CElementosTrG'

interface ElementoEntry extends CElementoGrafico {
  nombre: string
}

const DEFAULTS: ElementoEntry[] = [
  { nombre: 'elem_01', nLongGrafica: 120, esEmpalme: false, bHabilitar: true },
  { nombre: 'elem_02', nLongGrafica: 85,  esEmpalme: false, bHabilitar: true },
  { nombre: 'empalme_01', nLongGrafica: 30, esEmpalme: true, bHabilitar: true },
  { nombre: 'elem_03', nLongGrafica: 200, esEmpalme: false, bHabilitar: false },
  { nombre: 'empalme_02', nLongGrafica: 15, esEmpalme: true, bHabilitar: true },
]

export function CElementosTrGShowcase() {
  const [elementos, setElementos] = useState<ElementoEntry[]>(DEFAULTS)
  const [nombreGrafico, setNombreGrafico] = useState('TRAMO-001')
  const [newNombre, setNewNombre] = useState('')
  const [newLong, setNewLong] = useState('100')
  const [newEsEmpalme, setNewEsEmpalme] = useState(false)

  const tramo = useMemo(() => {
    const t = new CElementosTrG()
    t.sNombreGrafico = nombreGrafico
    for (const e of elementos) {
      t.agregarElemento({ bHabilitar: e.bHabilitar, nLongGrafica: e.nLongGrafica, esEmpalme: e.esEmpalme }, e.nombre)
    }
    return t
  }, [elementos, nombreGrafico])

  const longitudTotal = useMemo(() => tramo.longitudTotal(), [tramo])
  const nTotalOverride = tramo.nTotalElementos
  const nTotalBase     = tramo.collElementos.size

  const toggle = (nombre: string, field: 'bHabilitar' | 'esEmpalme') =>
    setElementos(prev => prev.map(e => e.nombre === nombre ? { ...e, [field]: !e[field] } : e))

  const removeElemento = (nombre: string) =>
    setElementos(prev => prev.filter(e => e.nombre !== nombre))

  const addElemento = () => {
    const name = newNombre.trim()
    if (!name || elementos.some(e => e.nombre === name)) return
    setElementos(prev => [...prev, {
      nombre: name,
      nLongGrafica: parseFloat(newLong) || 0,
      esEmpalme: newEsEmpalme,
      bHabilitar: true,
    }])
    setNewNombre('')
    setNewLong('100')
    setNewEsEmpalme(false)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CElementosTrG
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/Utilerias/Tramo/c_elementos_tramo_g.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Colección gráfica de elementos de tramo. Extiende <code>CElementos</code> añadiendo{' '}
        <code>sNombreGrafico</code>, override de <code>nTotalElementos</code> (solo habilitados)
        y <code>longitudTotal()</code> que excluye instancias <code>c_elemento_empalme_g</code>.
      </Typography>

      <Grid container spacing={3}>

        {/* Panel izquierdo: atributos + añadir */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="sNombreGrafico"
                subheader="Slot propio de CElementosTrG (read/write)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  label="nombre_grafico"
                  value={nombreGrafico}
                  onChange={e => setNombreGrafico(e.target.value)}
                  size="small"
                  fullWidth
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Métricas calculadas"
                subheader="Override de nTotalElementos + longitudTotal()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                        collElementos.size (padre)
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={nTotalBase} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'primary.light' }}>
                      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                        <strong>nTotalElementos</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={nTotalOverride} size="small" color="primary" />
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: 'success.light' }}>
                      <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>
                        <strong>longitudTotal()</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${longitudTotal.toFixed(1)} m`} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <code>nTotalElementos</code> = habilitados ·{' '}
                  <code>longitudTotal</code> excluye empalmes
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="agregarElemento()"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="nombre (clave Map)"
                    value={newNombre}
                    onChange={e => setNewNombre(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="nLong_Grafica (m)"
                    value={newLong}
                    onChange={e => setNewLong(e.target.value)}
                    size="small"
                    type="number"
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={newEsEmpalme}
                        onChange={e => setNewEsEmpalme(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={<Typography variant="caption">es c_elemento_empalme_g</Typography>}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={addElemento}
                    disabled={!newNombre.trim()}
                  >
                    agregarElemento()
                  </Button>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Panel derecho: tabla de elementos */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
              title="collElementos — Map<string, CElementoGrafico>"
              subheader="Activa/desactiva bHabilitar y esEmpalme para ver el efecto en las métricas"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>nombre (clave)</TableCell>
                    <TableCell align="right">nLong_Grafica</TableCell>
                    <TableCell align="center">bHabilitar</TableCell>
                    <TableCell align="center">esEmpalme</TableCell>
                    <TableCell align="center">en longitudTotal</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {elementos.map(e => {
                    const contada = e.bHabilitar && !e.esEmpalme
                    return (
                      <TableRow
                        key={e.nombre}
                        sx={
                          !e.bHabilitar
                            ? { opacity: 0.4 }
                            : e.esEmpalme
                              ? { backgroundColor: 'warning.light' }
                              : undefined
                        }
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {e.nombre}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 11 }}>
                          {e.nLongGrafica} m
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            size="small"
                            checked={e.bHabilitar}
                            onChange={() => toggle(e.nombre, 'bHabilitar')}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            size="small"
                            checked={e.esEmpalme}
                            onChange={() => toggle(e.nombre, 'esEmpalme')}
                            color="warning"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={contada ? `+${e.nLongGrafica} m` : '—'}
                            size="small"
                            color={contada ? 'success' : 'default'}
                            variant={contada ? 'filled' : 'outlined'}
                            sx={{ fontSize: 10 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => removeElemento(e.nombre)}
                            sx={{ minWidth: 'auto', px: 0.5, fontSize: 14 }}
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Naranja = <code>esEmpalme</code> (excluido de <code>longitudTotal()</code>) ·
                  Opaco = <code>bHabilitar=false</code> (excluido de <code>nTotalElementos</code> y <code>longitudTotal()</code>) ·
                  Verde = contribuye a la suma
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Jerarquía */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="Jerarquía — CElementos → CElementosTrG"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip label="CElementos" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Chip label="CElementosTrG" size="small" color="primary" sx={{ fontFamily: 'monospace' }} />
                <Typography variant="caption" color="text.secondary">
                  +<code>sNombreGrafico</code> ·
                  override <code>nTotalElementos</code> (habilitados) ·
                  <code>longitudTotal()</code> (habilitados sin empalmes)
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
