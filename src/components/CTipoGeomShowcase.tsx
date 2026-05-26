import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid, MenuItem,
  Stack, TextField, Typography, Button, Divider, List, ListItem, ListItemText, IconButton,
} from '@mui/material'
import { CTipoGeom, type TipoGeometria } from '../models/CTipoGeom'

const TIPOS: TipoGeometria[] = ['point', 'line', 'area', 'text', 'raster']

const DATASET_OPTS = ['sw_gis', 'sw_gisb', 'sigp', 'sigc', 'cobre_planos']
const TABLA_OPTS_BY_DATASET: Record<string, string[]> = {
  sw_gis:        ['cable_segment', 'duct', 'manhole', 'fiber_splice'],
  sw_gisb:       ['cable_segment_bak', 'duct_bak'],
  sigp:          ['proyecto_lin', 'proyecto_area', 'proyecto_punto'],
  sigc:          ['cable_planos', 'cedo'],
  cobre_planos:  ['planos_cu', 'distritos', 'centrales'],
}

const ICON_BY_TIPO: Record<TipoGeometria, string> = {
  point:  '●',
  line:   '╱',
  area:   '▭',
  text:   '𝐓',
  raster: '▦',
}

interface RegEntry {
  id:     string
  dataset:    string
  tabla:      string
  tipoGeom:   TipoGeometria
}

export function CTipoGeomShowcase() {
  const [dataset,  setDataset]  = useState<string>(DATASET_OPTS[0])
  const [tabla,    setTabla]    = useState<string>(TABLA_OPTS_BY_DATASET[DATASET_OPTS[0]][0])
  const [tipoGeom, setTipoGeom] = useState<TipoGeometria>('line')
  const [registry, setRegistry] = useState<RegEntry[]>([
    { id: '01', dataset: 'sw_gis', tabla: 'cable_segment', tipoGeom: 'line' },
    { id: '02', dataset: 'sw_gis', tabla: 'manhole',       tipoGeom: 'point' },
    { id: '03', dataset: 'sigp',   tabla: 'proyecto_area', tipoGeom: 'area' },
  ])

  const instancia = useMemo(() => new CTipoGeom(dataset, tabla, tipoGeom), [dataset, tabla, tipoGeom])

  const tablasDisponibles = TABLA_OPTS_BY_DATASET[dataset] ?? []

  const onDatasetChange = (v: string) => {
    setDataset(v)
    const first = TABLA_OPTS_BY_DATASET[v]?.[0] ?? ''
    setTabla(first)
  }

  const onAddToRegistry = () => {
    const id = String(registry.length + 1).padStart(2, '0')
    setRegistry(prev => [...prev, { id, dataset, tabla, tipoGeom }])
  }

  const removeEntry = (id: string) => setRegistry(prev => prev.filter(e => e.id !== id))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_Tipo_Geom
        <Chip label="Fase 1 · SIMPLE · score 1" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="DTO" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_Tipo_Geom.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Constructor */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="new(PoDataset, PoTabla, PoTipo_geom)"
              subheader="3 slots writable — escribe directo al estado interno"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="PoDataset"
                  value={dataset}
                  onChange={e => onDatasetChange(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {DATASET_OPTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="PoTabla"
                  value={tabla}
                  onChange={e => setTabla(e.target.value)}
                  size="small"
                  fullWidth
                  disabled={tablasDisponibles.length === 0}
                >
                  {tablasDisponibles.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>

                <TextField
                  select
                  label="PoTipo_geom"
                  value={tipoGeom}
                  onChange={e => setTipoGeom(e.target.value as TipoGeometria)}
                  size="small"
                  fullWidth
                >
                  {TIPOS.map(t => (
                    <MenuItem key={t} value={t}>
                      <Box component="span" sx={{ width: 18, display: 'inline-block', fontFamily: 'monospace' }}>{ICON_BY_TIPO[t]}</Box>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>

                <Divider />

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  <div>.oDataset    = "{instancia.oDataset}"</div>
                  <div>.oTabla      = "{instancia.oTabla}"</div>
                  <div>.oTipo_geom  = "{instancia.oTipo_geom}"</div>
                </Box>

                <Button variant="contained" size="small" onClick={onAddToRegistry}>
                  Añadir al registro de corte
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Registro */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Registro de c_Tipo_Geom"
              subheader="Caso de uso: lista que el corte geográfico itera para saber qué tablas pintar"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {registry.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Registro vacío.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {registry.map(r => (
                    <ListItem
                      key={r.id}
                      disableGutters
                      secondaryAction={<IconButton size="small" onClick={() => removeEntry(r.id)}>✕</IconButton>}
                    >
                      <Box component="span" sx={{ width: 24, mr: 1, fontFamily: 'monospace', fontSize: 16, textAlign: 'center' }}>
                        {ICON_BY_TIPO[r.tipoGeom]}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                            {r.dataset}.{r.tabla}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                            tipo_geom = :{r.tipoGeom}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
