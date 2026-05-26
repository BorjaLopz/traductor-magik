import { useState, useMemo } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip,
  Grid, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  CTramoFoE,
  type SeccionRecord,
  type EmpalmeRecord,
  type NodoRecord,
  type TramoRecord,
  type TramoElemento,
} from '../models/CTramoFoE'

interface SeccionConfig { nombre: string; longitudFibra: number }

const DEFAULTS: SeccionConfig[] = [
  { nombre: 'SEC-01', longitudFibra: 200 },
  { nombre: 'SEC-02', longitudFibra: 150 },
  { nombre: 'SEC-03', longitudFibra: 180 },
]

// Construye la cadena de SeccionRecord[] a partir de un array plano de configs.
// SEC-01: intersectaNodoOrigen=true, empalmesSalida=[E1→SEC-02]
// SEC-02: intersectaNodoOrigen=false, empalmesSalida=[E2→SEC-03]
// SEC-03: intersectaNodoOrigen=false, empalmesSalida=[]  (terminal)
function buildChain(configs: SeccionConfig[], tramo: TramoRecord): SeccionRecord[] {
  const secs: SeccionRecord[] = configs.map((c, i) => ({
    tipo: 'seccion' as const,
    numRuta: tramo.numRuta,
    numTramo: tramo.numTramo,
    nombre: c.nombre,
    longitudFibra: c.longitudFibra,
    intersectaNodoOrigen: i === 0,
    empalmesSalida: [],
  }))

  // Conectar con empalmes hacia adelante
  for (let i = 0; i < secs.length - 1; i++) {
    const empalme: EmpalmeRecord = {
      tipo: 'empalme',
      id: `EMP-${String(i + 1).padStart(2, '0')}`,
      seccionSalida: secs[i + 1],
    }
    secs[i].empalmesSalida = [empalme]
  }

  return secs
}

const TIPO_COLORS: Record<string, string> = {
  nodo: '#e3f2fd',
  seccion: '#e8f5e9',
  empalme: '#fff3e0',
}

const TIPO_LABELS: Record<string, string> = {
  nodo: 'Nodo',
  seccion: 'Sección',
  empalme: 'Empalme',
}

function elementoLabel(el: TramoElemento): string {
  switch (el.tipo) {
    case 'nodo':    return el.nombre ? `${el.clli} (${el.nombre})` : el.clli
    case 'seccion': return `${(el as SeccionRecord & { nombre?: string }).nombre ?? 'sec'} · ${el.longitudFibra} m`
    case 'empalme': return el.id
  }
}

export function CTramoFoEShowcase() {
  const [numRuta,        setNumRuta]        = useState('97')
  const [numTramo,       setNumTramo]       = useState('01')
  const [nomRuta,        setNomRuta]        = useState('CHAPULTEPEC-POLANCO')
  const [nomTramo,       setNomTramo]       = useState('TRAMO PRINCIPAL')
  const [clliOrigen,     setClliOrigen]     = useState('CHAPULTEPEC')
  const [clliDestino,    setClliDestino]    = useState('POLANCO')
  const [secciones,      setSecciones]      = useState<SeccionConfig[]>(DEFAULTS)
  const [sinTramo,       setSinTramo]       = useState(false)

  const tramoRecord: TramoRecord = useMemo(() => ({
    numRuta, numTramo, nomRuta, nomTramo,
  }), [numRuta, numTramo, nomRuta, nomTramo])

  const nodoOrigen: NodoRecord  = useMemo(() => ({ tipo: 'nodo', clli: clliOrigen, nombre: clliOrigen }), [clliOrigen])
  const nodoDestino: NodoRecord = useMemo(() => ({ tipo: 'nodo', clli: clliDestino, nombre: clliDestino }), [clliDestino])

  const chain = useMemo(() => buildChain(secciones, tramoRecord), [secciones, tramoRecord])

  const tramo = useMemo(() => {
    const t = new CTramoFoE()
    if (!sinTramo) {
      t.initFromData(tramoRecord, chain, nodoOrigen, nodoDestino)
    }
    return t
  }, [tramoRecord, chain, nodoOrigen, nodoDestino, sinTramo])

  const elementos = tramo.obtenElementosTramo
  const elementosArray = Array.isArray(elementos) ? elementos : []

  const updateLong = (i: number, v: string) =>
    setSecciones(prev => prev.map((s, j) => j === i ? { ...s, longitudFibra: Math.max(0, parseFloat(v) || 0) } : s))

  const addSeccion = () =>
    setSecciones(prev => [...prev, { nombre: `SEC-${String(prev.length + 1).padStart(2, '0')}`, longitudFibra: 100 }])

  const removeSeccion = () =>
    setSecciones(prev => prev.length > 1 ? prev.slice(0, -1) : prev)

  // long_tramo excluye la sección inicial — destacar visualmente
  const longTramoVal = typeof tramo.longTramo === 'number' ? tramo.longTramo : undefined
  const longInicial  = secciones[0]?.longitudFibra ?? 0
  const longTotal    = secciones.reduce((s, c) => s + c.longitudFibra, 0)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CTramoFoE
        <Chip label="Fase 1 · MODERADO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/Entidad/c_tramo_fo_e.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Modelo de tramo de fibra óptica. Recorre la cadena{' '}
        <code>nodo_origen → sec → empalme → sec → … → nodo_destino</code>,
        acumula longitud y cuenta empalmes. Todos los getters usan{' '}
        <code>prvValida_tramo()</code> como guardia y devuelven <code>sValor_Defecto</code>{' '}
        ("<em>vacio</em>") si no hay tramo asignado.
      </Typography>

      <Grid container spacing={3}>

        {/* ─── Configuración ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="TramoRecord"
                subheader="Identificadores del tramo (user!_num_ruta / user!_num_tramo)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1}>
                    <TextField label="num_ruta"  value={numRuta}  onChange={e => setNumRuta(e.target.value)}
                      size="small" sx={{ width: 90 }} />
                    <TextField label="num_tramo" value={numTramo} onChange={e => setNumTramo(e.target.value)}
                      size="small" sx={{ flex: 1 }} />
                  </Stack>
                  <TextField label="nom_ruta"  value={nomRuta}  onChange={e => setNomRuta(e.target.value)}  size="small" fullWidth />
                  <TextField label="nom_tramo" value={nomTramo} onChange={e => setNomTramo(e.target.value)} size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Nodos" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="clli origen"  value={clliOrigen}  onChange={e => setClliOrigen(e.target.value)}  size="small" fullWidth />
                  <TextField label="clli destino" value={clliDestino} onChange={e => setClliDestino(e.target.value)} size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Cadena de secciones"
                subheader={`${secciones.length} secciones · ${secciones.length - 1} empalmes`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  {secciones.map((s, i) => (
                    <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', minWidth: 60, fontSize: 10 }}>
                        {s.nombre}
                        {i === 0 && <Chip label="inicial" size="small" sx={{ ml: 0.5, fontSize: 9, height: 14 }} />}
                      </Typography>
                      <TextField
                        label="m"
                        type="number"
                        value={s.longitudFibra}
                        onChange={e => updateLong(i, e.target.value)}
                        size="small"
                        sx={{ width: 80 }}
                        slotProps={{ htmlInput: { min: 0, step: 10 } }}
                      />
                      {i === 0 && (
                        <Chip
                          label="¡NO suma!"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ fontSize: 9, height: 18 }}
                        />
                      )}
                    </Stack>
                  ))}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={addSeccion}>+ Sección</Button>
                    <Button size="small" onClick={removeSeccion} disabled={secciones.length <= 1}>- Última</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Guardia prvValida_tramo()" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant={sinTramo ? 'contained' : 'outlined'}
                    color={sinTramo ? 'error' : 'inherit'}
                    onClick={() => setSinTramo(v => !v)}
                  >
                    {sinTramo ? 'oTramo = undefined' : 'oTramo asignado'}
                  </Button>
                  <Chip
                    label={`existe() = ${tramo.existe()}`}
                    size="small"
                    color={tramo.existe() ? 'success' : 'error'}
                  />
                </Stack>
                {sinTramo && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    Todos los getters devuelven <code>"{tramo.sValorDefecto}"</code>
                  </Typography>
                )}
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ─── Resultados ────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* Getters */}
            <Card variant="outlined">
              <CardHeader title="Getters" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                  <TableBody>
                    {([
                      ['sNumRuta',        tramo.sNumRuta],
                      ['sNumTramo',       tramo.sNumTramo],
                      ['nombre',          tramo.nombre],
                      ['nombreRuta',      tramo.nombreRuta],
                      ['nodoOrigen',      typeof tramo.nodoOrigen === 'string' ? tramo.nodoOrigen : (tramo.nodoOrigen as NodoRecord).clli],
                      ['nodoDestino',     typeof tramo.nodoDestino === 'string' ? tramo.nodoDestino : (tramo.nodoDestino as NodoRecord).clli],
                      ['numEmpalmes',     String(tramo.numEmpalmes)],
                      ['longTramo (m)',   String(tramo.longTramo)],
                    ] as [string, string][]).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{k}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          <strong>{v || '—'}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Longitud */}
            <Card variant="outlined">
              <CardHeader
                title="Longitud — por qué la sección inicial NO suma"
                subheader="Magik: LnLong_Tramo se actualiza sólo al recuperar la sección de SALIDA del empalme"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow sx={{ backgroundColor: 'warning.light' }}>
                      <TableCell sx={{ fontSize: 11 }}>SEC-01 (inicial, no suma)</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                        <s>{longInicial} m</s>
                      </TableCell>
                    </TableRow>
                    {secciones.slice(1).map((s, i) => (
                      <TableRow key={i} sx={{ backgroundColor: 'success.light' }}>
                        <TableCell sx={{ fontSize: 11 }}>{s.nombre} (suma)</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{s.longitudFibra} m</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>longTramo total</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {typeof longTramoVal === 'number' ? `${longTramoVal} m` : tramo.sValorDefecto}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ opacity: 0.5 }}>
                      <TableCell sx={{ fontSize: 10 }}>suma de todas (referencia)</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: 10 }}>{longTotal} m</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* collObjetos */}
            <Card variant="outlined">
              <CardHeader
                title={`obtenElementosTramo — ${elementosArray.length} elementos`}
                subheader="Magik: collObjetos (rope) — orden exacto del recorrido prvGenera_Lista_objetos()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                {elementosArray.length > 0 ? (
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {elementosArray.map((el, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Chip
                          label={
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" sx={{ fontSize: 9, display: 'block', opacity: 0.7 }}>
                                {TIPO_LABELS[el.tipo]}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: 10, fontFamily: 'monospace' }}>
                                {elementoLabel(el)}
                              </Typography>
                            </Box>
                          }
                          size="small"
                          sx={{
                            height: 'auto',
                            py: 0.3,
                            backgroundColor: TIPO_COLORS[el.tipo],
                            border: '1px solid rgba(0,0,0,0.12)',
                          }}
                        />
                        {i < elementosArray.length - 1 && (
                          <Typography variant="caption" color="text.secondary">→</Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {typeof elementos === 'string' ? `"${elementos}" (sValor_Defecto)` : 'Sin elementos — verificar nodos y sección inicial'}
                  </Typography>
                )}
                <Table size="small" sx={{ mt: 1.5 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>#</TableCell>
                      <TableCell>tipo</TableCell>
                      <TableCell>identificador</TableCell>
                      <TableCell align="right">longitud</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {elementosArray.map((el, i) => (
                      <TableRow key={i} sx={{ backgroundColor: TIPO_COLORS[el.tipo] }}>
                        <TableCell sx={{ fontSize: 10 }}>{i + 1}</TableCell>
                        <TableCell>
                          <Chip label={el.tipo} size="small" sx={{ fontSize: 9 }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {elementoLabel(el)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                          {el.tipo === 'seccion' ? `${el.longitudFibra} m` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
