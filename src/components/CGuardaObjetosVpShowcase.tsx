import { useState, useMemo } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip,
  FormControl, Grid, IconButton, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, Tooltip, Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import {
  CGuardaObjetosVp,
  OBJETOS,
  type GisObject,
  type ResultSetElement,
  type GisListResult,
  type GsfrResult,
} from '../models/CGuardaObjetosVp'

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeObj = (sourceCollection: string, id: number): GisObject => ({
  sourceCollection,
  id,
})

const makeRwo = (sourceCollection: string, id: number): ResultSetElement => ({
  rwo: { sourceCollection, id },
})

// Tipos relevantes para cada sección
const TIPOS_ELEMENTOS    = ['figure_eight']
const TIPOS_CANALIZACION = ['underground_route', 'aerial_route']
const TIPOS_ESTRUCTURAS  = ['uub', 'pole', 'building']
const TIPOS_GSFR         = OBJETOS.slice(0, 12) as string[]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ObjectAdder({
  label,
  tipos,
  items,
  onAdd,
  onRemove,
}: {
  label: string
  tipos: string[]
  items: GisObject[]
  onAdd: (obj: GisObject) => void
  onRemove: (idx: number) => void
}) {
  const [tipo, setTipo] = useState(tipos[0])
  const nextId = items.length + 1

  return (
    <Card variant="outlined">
      <CardHeader
        title={label}
        titleTypographyProps={{ variant: 'subtitle2' }}
        action={
          <Tooltip title="Añadir objeto">
            <IconButton size="small" onClick={() => onAdd(makeObj(tipo, nextId * 10 + items.length))}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>tipo</InputLabel>
            <Select
              value={tipo}
              label="tipo"
              onChange={e => setTipo(e.target.value)}
            >
              {tipos.map(t => (
                <MenuItem key={t} value={t} sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {items.length === 0 ? (
          <Typography variant="caption" color="text.disabled">sin objetos</Typography>
        ) : (
          <Stack spacing={0.5}>
            {items.map((obj, i) => (
              <Stack key={i} direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                <Chip
                  label={`${obj.sourceCollection} · id=${obj.id}`}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: 11 }}
                />
                <IconButton size="small" onClick={() => onRemove(i)}>
                  <DeleteIcon fontSize="inherit" color="error" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

function GisListResultView({ result }: { result: GisListResult }) {
  const entries = Object.entries(result) as [keyof GisListResult, NonNullable<GisListResult[keyof GisListResult]>][]

  if (entries.length === 0) {
    return <Typography variant="caption" color="text.disabled">sin resultado (añade objetos arriba)</Typography>
  }

  return (
    <Stack spacing={1}>
      {entries.map(([key, rows]) => (
        <Box key={key}>
          <Chip
            label={`:${key} → ${rows.length} entrada${rows.length > 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 0.5, fontFamily: 'monospace' }}
          />
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell>tipo</TableCell>
                <TableCell>id</TableCell>
                <TableCell>rot</TableCell>
                <TableCell>hor</TableCell>
                <TableCell>ver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((entry, i) => (
                <TableRow key={i} hover>
                  {entry.map((v, j) => (
                    <TableCell key={j} sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {String(v)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Stack>
  )
}

function GsfrResultView({ result }: { result: GsfrResult }) {
  if (result.size === 0) {
    return <Typography variant="caption" color="text.disabled">sin resultado (añade objetos al result-set)</Typography>
  }

  return (
    <Stack spacing={1}>
      {[...result.entries()].map(([key, rows]) => (
        <Stack key={key} direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={key}
            size="small"
            color={key.endsWith('_ano_tipo') ? 'warning' : key.endsWith('_sim') ? 'info' : 'default'}
            sx={{ fontFamily: 'monospace', fontSize: 11 }}
          />
          <Typography variant="caption" color="text.secondary">
            {rows.length} entrada{rows.length > 1 ? 's' : ''} · ids: {rows.map(e => e[1]).join(', ')}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

// ─── Main Showcase ────────────────────────────────────────────────────────────

export function CGuardaObjetosVpShowcase() {
  const [elementos, setElementos]       = useState<GisObject[]>([makeObj('figure_eight', 101)])
  const [canalizacion, setCanalizacion] = useState<GisObject[]>([makeObj('underground_route', 201), makeObj('aerial_route', 202)])
  const [estructuras, setEstructuras]   = useState<GisObject[]>([makeObj('uub', 301), makeObj('building', 302)])
  const [resulSet, setResulSet]         = useState<ResultSetElement[]>([
    makeRwo('uub', 401), makeRwo('building', 402), makeRwo('figure_eight', 403),
  ])
  const [gsfrTipo, setGsfrTipo] = useState(TIPOS_GSFR[0])

  const guardaObjetos = useMemo(() => {
    const g = new CGuardaObjetosVp()
    g.elementos   = elementos
    g.canalizacion = canalizacion
    g.estructuras  = estructuras
    g.oResulSet    = resulSet
    return g
  }, [elementos, canalizacion, estructuras, resulSet])

  const listaResult  = useMemo(() => guardaObjetos.generaLista(), [guardaObjetos])
  const gsfrResult   = useMemo(() => guardaObjetos.generaListaGsfr(), [guardaObjetos])

  const addRwo = () => {
    const id = 400 + resulSet.length + 1
    setResulSet(prev => [...prev, makeRwo(gsfrTipo, id)])
  }

  const removeRwo = (i: number) => setResulSet(prev => prev.filter((_, idx) => idx !== i))

  const remove = (setter: React.Dispatch<React.SetStateAction<GisObject[]>>) =>
    (i: number) => setter(prev => prev.filter((_, idx) => idx !== i))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CGuardaObjetosVp
        <Chip label="Fase 2 · MODERADO" size="small" sx={{ ml: 1.5 }} color="info" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_guarda_objetos_vp.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Contenedor de objetos GIS de un viewport. Agrupa elementos por tipo de colección
        para configurar visibilidad (rotación, mov. horizontal/vertical).
      </Typography>

      <Grid container spacing={3}>

        {/* Constante OBJETOS */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title={`OBJETOS — ${OBJETOS.length} tipos de colección permitidos (shared_constant)`}
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {OBJETOS.map(o => (
                  <Chip
                    key={o}
                    label={o}
                    size="small"
                    variant="outlined"
                    color={o.startsWith('user!_') ? 'secondary' : 'default'}
                    sx={{ fontFamily: 'monospace', fontSize: 10 }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Morado = objetos de usuario (<code>user!_*</code>) · Gris = objetos del modelo base
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inputs: tres colecciones de objetos */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ObjectAdder
            label="elementos (figure_eight)"
            tipos={TIPOS_ELEMENTOS}
            items={elementos}
            onAdd={obj => setElementos(prev => [...prev, obj])}
            onRemove={remove(setElementos)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ObjectAdder
            label="canalizacion (rutas)"
            tipos={TIPOS_CANALIZACION}
            items={canalizacion}
            onAdd={obj => setCanalizacion(prev => [...prev, obj])}
            onRemove={remove(setCanalizacion)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ObjectAdder
            label="estructuras (pozos, postes, edificios)"
            tipos={TIPOS_ESTRUCTURAS}
            items={estructuras}
            onAdd={obj => setEstructuras(prev => [...prev, obj])}
            onRemove={remove(setEstructuras)}
          />
        </Grid>

        {/* generaLista() output */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="generaLista()"
              subheader="Magik: property_list con claves :gazas, :canalizaciones, :aerea, :pozos, :centrales, :postes"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <GisListResultView result={listaResult} />
            </CardContent>
          </Card>
        </Grid>

        {/* generaListaGsfr() — result-set input + output */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="generaListaGsfr()"
              subheader="Magik: hash_table con claves {tipo}_sim / {tipo}_ano — filtrado por OBJETOS"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {/* Result-set editor */}
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>tipo RWO</InputLabel>
                  <Select
                    value={gsfrTipo}
                    label="tipo RWO"
                    onChange={e => setGsfrTipo(e.target.value)}
                  >
                    {TIPOS_GSFR.map(t => (
                      <MenuItem key={t} value={t} sx={{ fontFamily: 'monospace', fontSize: 12 }}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button size="small" startIcon={<AddIcon />} onClick={addRwo} variant="outlined">
                  Añadir al oResulSet
                </Button>
              </Stack>

              <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                {resulSet.map((el, i) => (
                  <Stack key={i} direction="row" sx={{ alignItems: 'center' }} spacing={1}>
                    <Chip
                      label={`rwo: ${el.rwo?.sourceCollection} · id=${el.rwo?.id}`}
                      size="small"
                      sx={{ fontFamily: 'monospace', fontSize: 11 }}
                    />
                    <IconButton size="small" onClick={() => removeRwo(i)}>
                      <DeleteIcon fontSize="inherit" color="error" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Resultado ({gsfrResult.size} claves en el Map):
                </Typography>
                <GsfrResultView result={gsfrResult} />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Azul = <code>_sim</code> · Gris = <code>_ano</code> · Naranja = <code>_ano_tipo</code> (solo uub)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
