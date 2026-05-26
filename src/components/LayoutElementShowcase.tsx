import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider,
  FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography,
} from '@mui/material'
import {
  LayoutElement,
  LAYOUT_ELEMENT_DEFINED_ATTRIBUTES,
  type AreaDibujo,
  type Dataset,
  type DatasetCollection,
  type GisRecord,
  type ViewportLike,
} from '../models/LayoutElement'

// =============================================================================
// MOCK DATASET — sustituye mit_manager.modelit_dataset / gis_program_manager
// =============================================================================

function makeColl(records: GisRecord[]): DatasetCollection {
  return { at: (id) => records.find(r => r.id === id) }
}

const SAMPLE_GIS: GisRecord[] = [
  { id: 'CS-001', source_collection: 'cable_segment' },
  { id: 'CS-002', source_collection: 'cable_segment' },
  { id: 'MH-A',   source_collection: 'manhole'       },
  { id: 'MH-B',   source_collection: 'manhole'       },
]

const MOCK_DATASET: Dataset = {
  collection: (name) => {
    const recs = SAMPLE_GIS.filter(r => r.source_collection === name)
    return recs.length > 0 ? makeColl(recs) : undefined
  },
}

const SAMPLE_VIEWPORT: ViewportLike = {
  transform: { scaleX: 0.5, scaleY: 0.5 },
  bounds:    { xmin: 100, ymin: 100, xmax: 600, ymax: 500 },
}

export function LayoutElementShowcase() {
  const el = useMemo(() => new LayoutElement(), [])

  // ── Atributos
  const [locked, setLocked]               = useState(el.locked)
  const [agregarCedos, setAgregarCedos]   = useState(el.agregar_cedos)

  // ── Serializa ↔ deserializa
  const [selectedIds, setSelectedIds] = useState<string[]>([SAMPLE_GIS[0].id, SAMPLE_GIS[2].id])
  const [refs, setRefs] = useState<string>('—')
  const [restored, setRestored] = useState<string>('—')

  const onGuardarBdGis = () => {
    const records = SAMPLE_GIS.filter(r => selectedIds.includes(r.id))
    el.guardarElementosBdGis(records)
    setRefs(JSON.stringify(el.elementos_bd_gis, null, 2))
  }

  const onObtenerBdGis = () => {
    const recs = el.obtenerElementosBdGis(MOCK_DATASET)
    setRestored(JSON.stringify(recs, null, 2))
  }

  // ── TransformaCoordenada
  const [areaKind, setAreaKind] = useState<AreaDibujo['kind']>('canvas')
  const [escala, setEscala]     = useState<number>(0.1)
  const [coordX, setCoordX]     = useState<number>(100)
  const [coordY, setCoordY]     = useState<number>(50)
  const [seg, setSeg]           = useState<boolean>(true)
  const transformed = el.transformaCoordenada(
    { kind: areaKind },
    { x: coordX, y: coordY },
    escala,
    seg ? { scaleX: 0.5, scaleY: 0.5 } : undefined,
  )

  // ── indicadores
  const [pozoX, setPozoX]               = useState(150)
  const [pozoY, setPozoY]               = useState(150)
  const [pbConLinea, setPbConLinea]     = useState(true)
  const [pbLineaAbajo, setPbLineaAbajo] = useState(false)
  const [pbTomaVP, setPbTomaVP]         = useState(true)
  const [pbConPunta, setPbConPunta]     = useState(true)
  const indCfg = el.indicadores({
    poAreaDibujo:     { kind: 'page' },
    poRegistro:       { ...SAMPLE_GIS[2], coord: { x: pozoX, y: pozoY } },
    pyCampoGeom:      'geom',
    roViewport:       SAMPLE_VIEWPORT,
    pbTomaEnCuentaVP: pbTomaVP,
    pbConLinea,
    pbConPunta,
    pnAncho:          50,
    pnAlto:           20,
    pnDistXp:         30,
    pnDistYp:         15,
    pbLineaAbajo,
    paDiseno:         ['triangle', 'red', 10, 10, 0],
  })

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        layout_element
        <Chip label="Fase 2 · COMPLEJO · score 8" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extension :sw" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/layout_element.magik</code> — package <code>sw</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* defined_attributes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="defined_attributes (9 atributos compartidos)"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Box
                component="table"
                sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse', '& th, & td': { p: 0.5, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'left' } }}
              >
                <thead>
                  <tr>
                    <Box component="th">name</Box>
                    <Box component="th">type</Box>
                    <Box component="th">props_page</Box>
                  </tr>
                </thead>
                <tbody>
                  {LAYOUT_ELEMENT_DEFINED_ATTRIBUTES.map(a => (
                    <tr key={a.name}>
                      <Box component="td">:{a.name}</Box>
                      <Box component="td" sx={{ color: 'primary.main' }}>{a.type}</Box>
                      <Box component="td">{a.allowedOnPropertiesPage === false ? '_false' : '(default)'}</Box>
                    </tr>
                  ))}
                </tbody>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={<Switch size="small" checked={locked} onChange={e => { setLocked(e.target.checked); el.locked = e.target.checked }} />}
                  label={<Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>locked = {String(locked)}</Box>}
                />
                <FormControlLabel
                  control={<Switch size="small" checked={agregarCedos} onChange={e => { setAgregarCedos(e.target.checked); el.agregar_cedos = e.target.checked }} />}
                  label={<Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>agregar_cedos = {String(agregarCedos)}</Box>}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Serialize/Deserialize */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="guardar / obtener elementos_bd_gis"
              subheader="GisRecord[] ↔ ElementRef[] = [{ collection: id }]"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption">Selecciona records GIS a serializar:</Typography>
                {SAMPLE_GIS.map(r => (
                  <FormControlLabel
                    key={r.id}
                    control={
                      <Switch
                        size="small"
                        checked={selectedIds.includes(r.id)}
                        onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))}
                      />
                    }
                    label={<Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>{r.source_collection}/{r.id}</Box>}
                    sx={{ m: 0 }}
                  />
                ))}
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" onClick={onGuardarBdGis}>guardar_bd_gis</Button>
                  <Button size="small" variant="outlined"  onClick={onObtenerBdGis} disabled={!el.elementos_bd_gis}>obtener_bd_gis</Button>
                </Stack>
                <Box>
                  <Typography variant="caption" color="text.secondary">elementos_bd_gis (refs)</Typography>
                  <Box sx={{ p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 10, whiteSpace: 'pre-wrap' }}>
                    {refs}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">obtener → records reconstruidos</Typography>
                  <Box sx={{ p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 10, whiteSpace: 'pre-wrap' }}>
                    {restored}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* TransformaCoordenada */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="TransformaCoordenada"
              subheader="canvas → escala fija; otros → passthrough; opcional segunda transform"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select label="PoAreaDibujo.kind" value={areaKind}
                  onChange={e => setAreaKind(e.target.value as AreaDibujo['kind'])}
                  size="small" fullWidth
                >
                  <MenuItem value="canvas">canvas (aplica escala)</MenuItem>
                  <MenuItem value="page">page (sin escala)</MenuItem>
                  <MenuItem value="other">other (sin escala)</MenuItem>
                </TextField>
                <TextField type="number" label="escala" value={escala} onChange={e => setEscala(Number(e.target.value) || 0)} size="small" fullWidth />
                <Stack direction="row" spacing={1}>
                  <TextField type="number" label="coord.x" value={coordX} onChange={e => setCoordX(Number(e.target.value))} size="small" fullWidth />
                  <TextField type="number" label="coord.y" value={coordY} onChange={e => setCoordY(Number(e.target.value))} size="small" fullWidth />
                </Stack>
                <FormControlLabel
                  control={<Switch size="small" checked={seg} onChange={e => setSeg(e.target.checked)} />}
                  label={<Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>segunda transform (×0.5)</Box>}
                />
                <Box sx={{ p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  → ({transformed.x}, {transformed.y})
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* indicadores */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="indicadores(...) → c_style_y_viewport_layout config"
              subheader="Calcula bounds + flags + obj relacionado a partir del pozo"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1}>
                  <TextField type="number" label="pozo.x" value={pozoX} onChange={e => setPozoX(Number(e.target.value))} size="small" fullWidth />
                  <TextField type="number" label="pozo.y" value={pozoY} onChange={e => setPozoY(Number(e.target.value))} size="small" fullWidth />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel control={<Switch size="small" checked={pbConLinea}   onChange={e => setPbConLinea(e.target.checked)}   />} label="con_linea" />
                  <FormControlLabel control={<Switch size="small" checked={pbLineaAbajo} onChange={e => setPbLineaAbajo(e.target.checked)} />} label="linea_abajo" />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel control={<Switch size="small" checked={pbTomaVP}     onChange={e => setPbTomaVP(e.target.checked)}     />} label="toma_vp" />
                  <FormControlLabel control={<Switch size="small" checked={pbConPunta}   onChange={e => setPbConPunta(e.target.checked)}   />} label="con_punta (entrada)" />
                </Stack>
                <Alert severity="warning" sx={{ fontSize: 10 }}>
                  BUG documentado: el original sobreescribe <code>con_punta = "No"</code> y <code>usa_viewport = "Si"</code> incondicionalmente al final.
                </Alert>
                <Box sx={{ p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 10, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(indCfg, null, 2)}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
