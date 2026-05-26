import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  FormControl, FormControlLabel, Grid, InputLabel,
  MenuItem, Select, Stack, Switch, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import {
  CProyecto,
  type DisenioRecord,
  type NodoRecord,
  type PepsPorTipo,
} from '../models/CProyecto'

// ─── Datos de muestra fijos (OEs del diseño) ────────────────────────────────

const OE_LOCALS_NORMAL = [
  {
    numOe: 'OE-001',
    pep: { clave: 'D-FIBRA-CONS-001', catalogoPep: { tipoTrabajo: 'CONSTRUCCION' } },
    tramoCobre: false,
    segmentoLocals: [],
    oeiLocal: { numOei: 'OEI-001', opLocal: { numOp: 'OPB-001' } },
  },
  {
    numOe: 'OE-002',
    pep: { clave: 'J-FIBRA-DESM-001', catalogoPep: { tipoTrabajo: 'DESMONTAJE' } },
    tramoCobre: false,
    segmentoLocals: [],
    oeiLocal: { numOei: 'OEI-001', opLocal: { numOp: 'OPB-001' } },
  },
  {
    numOe: 'OE-003',
    pep: { clave: 'D-FIBRA-CONS-002', catalogoPep: { tipoTrabajo: 'CONSTRUCCION' } },
    tramoCobre: false,
    segmentoLocals: [],
    oeiLocal: { numOei: 'OEI-002', opLocal: { numOp: 'OPB-002' } },
  },
]

const OEI_FALC = [
  {
    tipoOei: 'SECUNDARIA',
    valorOei: 'OEI-FALC-001',
    oeLocals: [
      {
        numOe: 'OE-FALC-001',
        pep: { clave: 'D-FALC-SEC-CONS', catalogoPep: { tipoTrabajo: 'CONSTRUCCION' } },
        tramoCobre: false as boolean | undefined,
        segmentoLocals: [] as unknown[],
        oeiLocal: { numOei: 'OEI-FALC-001', opLocal: { numOp: 'OPB-FALC-001' } },
      },
      {
        numOe: 'OE-FALC-002',
        pep: { clave: 'J-FALC-SEC-DESM', catalogoPep: { tipoTrabajo: 'DESMONTAJE' } },
        tramoCobre: false as boolean | undefined,
        segmentoLocals: [] as unknown[],
        oeiLocal: { numOei: 'OEI-FALC-001', opLocal: { numOp: 'OPB-FALC-001' } },
      },
    ],
  },
]

// ─── Componente ──────────────────────────────────────────────────────────────

export function CProyectoShowcase() {
  const [nombreDisenio,  setNombreDisenio]  = useState('CTL-2024-001')
  const [nombreProyecto, setNombreProyecto] = useState('CTL-2024-001')
  const [esFalc,         setEsFalc]         = useState(false)
  const [tipoDisenio,    setTipoDisenio]    = useState('canalizacion')
  const [tipoProyecto,   setTipoProyecto]   = useState('fibra')
  const [centralNombre,  setCentralNombre]  = useState('CENTRAL CHAPULTEPEC')
  const [centralArea,    setCentralArea]    = useState('CIUDAD DE MEXICO')
  const [centralDiv,     setCentralDiv]     = useState('CENTRO')
  const [planMonth,      setPlanMonth]      = useState(3)
  const [planYear,       setPlanYear]       = useState(2024)
  const [estadoNodo,     setEstadoNodo]     = useState('Jalisco')
  const [ciudadNodo,     setCiudadNodo]     = useState('Guadalajara')

  const nombreProyectoReal = esFalc ? `FALC-${nombreProyecto}` : nombreProyecto

  const disenio: DisenioRecord = useMemo(() => ({
    name: nombreDisenio,
    tipoDiseno: tipoDisenio,
    tipoProyecto,
    inventario: 'GARCIA JUAN',
    superviso: 'MARTINEZ PEDRO',
    vobo: 'LOPEZ ANA',
    proyectista: 'HERNANDEZ CARLOS',
    distrito: { numDto: '101' },
    proyecto: {
      name: nombreProyectoReal,
      planningStart: { month: planMonth, year: planYear },
      central: { central: 'CTL', nombre: centralNombre, area: centralArea, division: centralDiv },
      empresaProyecto: 'INGENIERÍA GEO SA DE CV',
      empresaRevisora: 'TELMEX SA DE CV',
      supervisor: 'RAMIREZ JOSE',
      vb: 'TORRES MARIA',
      proyectistaProyecto: 'HERNANDEZ CARLOS',
      programa: 'FTTH-2024',
      programaAnyo: planYear,
      programaTipo: 'CONSTRUCCION',
      fechaEntrega: `${planYear}-12-31`,
      pepConsCanal: 'D-CTL-CANAL',
      pepConsPpal:  'D-CTL-PPAL',
      pepConsSecu:  'D-CTL-SECU-FALLBACK',
      pepDesmCanal: 'J-CTL-CANAL',
      pepDesmPpal:  'J-CTL-PPAL',
      pepDesmSecu:  'J-CTL-SECU-FALLBACK',
      pepRecoPpal:  'Y-CTL-PPAL',
      pepRecoSecu:  'Y-CTL-SECU',
      pepRehaCanal: 'D-CTL-REHA-CANAL',
      pepRehaPpal:  'D-CTL-REHA-PPAL',
      pepRehaSecu:  'D-CTL-REHA-SECU-FALLBACK',
    },
    oeLocals: OE_LOCALS_NORMAL,
    oeiLocals: esFalc && tipoDisenio === 'secundaria' ? OEI_FALC : [],
  }), [
    nombreDisenio, nombreProyectoReal, esFalc, tipoDisenio, tipoProyecto,
    centralNombre, centralArea, centralDiv, planMonth, planYear,
  ])

  const nodo: NodoRecord = useMemo(() => ({
    siglas: 'CTL',
    tipoNodo: 'CTL',
    estado: estadoNodo,
    ciudad: ciudadNodo,
    delegacionMunicipio: 'Guadalajara',
    colonia: 'Centro',
    codigoPostal: '44100',
    poblacion: ciudadNodo,
    datosNco: ['NCO OCCIDENTE', 'OCT'],
  }), [estadoNodo, ciudadNodo])

  const proyecto = useMemo(() => {
    const p = new CProyecto(disenio)
    p.oNodo = nodo
    return p
  }, [disenio, nodo])

  const pepsPorTipo: PepsPorTipo = useMemo(() => proyecto.obtenPepsPorTipo(), [proyecto])

  const isFalcActive = esFalc && tipoDisenio === 'secundaria'

  const getterRows = [
    ['nombre', proyecto.nombre],
    ['cveCentral', proyecto.cveCentral],
    ['nombreCentral', proyecto.nombreCentral],
    ['areaTelmex', proyecto.areaTelmex],
    ['divisionTelmex', proyecto.divisionTelmex],
    ['programa', proyecto.programa],
    ['anioPrograma', proyecto.anioPrograma],
    ['tipoOperacion', proyecto.tipoOperacion],
    ['fechaEntrega', proyecto.fechaEntrega],
    ['mesAnio', proyecto.mesAnio],
    ['numeroDistrito', proyecto.numeroDistrito],
  ]

  const responsablesRows = [
    ['proyectistaProyecto', proyecto.proyectistaProyecto],
    ['proyectistaDisenio', proyecto.proyectistaDisenio],
    ['supervisor (proyecto)', proyecto.supervisor],
    ['supervisorDisenio', proyecto.supervisorDisenio],
    ['supervisorTelmex', proyecto.supervisorTelmex],
    ['supervisorTelmexDisenio', proyecto.supervisorTelmexDisenio],
    ['empresaProyecto', proyecto.empresaProyecto],
    ['empresaRevisora', proyecto.empresaRevisora],
    ['realizoInventario', proyecto.realizoInventario],
  ]

  const geoRows = [
    ['estado', proyecto.estado],
    ['ciudad', proyecto.ciudad],
    ['delegacionMunicipio', proyecto.delegacionMunicipio],
    ['colonia', proyecto.colonia],
    ['cpPral', proyecto.cpPral],
    ['tipoCentral', proyecto.tipoCentral],
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CProyecto
        <Chip label="Fase 2 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/Entidad/c_proyecto.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Fachada del proyecto activo en el sistema GIS. Expone getters para nombre, central,
        responsables y PEPs. Los métodos <code>PEP_Cons/Desm/Reha_Sec</code> tienen lógica
        especial para diseños <strong>FALC + secundaria</strong>: buscan la PEP directamente
        en las OEs del diseño en lugar de usar el campo del proyecto.
      </Typography>

      <Grid container spacing={3}>

        {/* ─── Panel izquierdo: configuración ──────────────────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Diseño activo"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Nombre diseño"
                    value={nombreDisenio}
                    onChange={e => setNombreDisenio(e.target.value)}
                    size="small" fullWidth
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>tipoDiseno</InputLabel>
                    <Select value={tipoDisenio} label="tipoDiseno"
                      onChange={e => setTipoDisenio(e.target.value)}>
                      <MenuItem value="canalizacion">canalizacion</MenuItem>
                      <MenuItem value="secundaria">secundaria</MenuItem>
                      <MenuItem value="fibra_optica">fibra_optica</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>tipoProyecto</InputLabel>
                    <Select value={tipoProyecto} label="tipoProyecto"
                      onChange={e => setTipoProyecto(e.target.value)}>
                      <MenuItem value="fibra">fibra</MenuItem>
                      <MenuItem value="cobre">cobre</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Proyecto"
                subheader={isFalcActive ? '⚡ Modo FALC activo — PEPs desde OEs' : 'Modo normal — PEPs desde campo'}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption', color: isFalcActive ? 'warning.main' : 'text.secondary' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Nombre proyecto"
                    value={nombreProyecto}
                    onChange={e => setNombreProyecto(e.target.value)}
                    size="small" fullWidth
                    helperText={`Efectivo: ${nombreProyectoReal}`}
                  />
                  <FormControlLabel
                    control={
                      <Switch size="small" checked={esFalc}
                        onChange={e => setEsFalc(e.target.checked)}
                        color="warning"
                      />
                    }
                    label={<Typography variant="caption">Prefijo FALC (+ tipoDiseno=secundaria activa lógica especial)</Typography>}
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Mes planif."
                      type="number"
                      value={planMonth}
                      onChange={e => setPlanMonth(Math.min(12, Math.max(1, +e.target.value)))}
                      size="small" sx={{ width: 100 }}
                      slotProps={{ htmlInput: { min: 1, max: 12 } }}
                    />
                    <TextField
                      label="Año planif."
                      type="number"
                      value={planYear}
                      onChange={e => setPlanYear(+e.target.value)}
                      size="small" sx={{ flex: 1 }}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Central" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="Nombre" value={centralNombre}
                    onChange={e => setCentralNombre(e.target.value)} size="small" fullWidth />
                  <TextField label="Área" value={centralArea}
                    onChange={e => setCentralArea(e.target.value)} size="small" fullWidth />
                  <TextField label="División" value={centralDiv}
                    onChange={e => setCentralDiv(e.target.value)} size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Nodo (geográfico)" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="Inyectado vía oNodo en lugar de query GIS"
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <TextField label="Estado" value={estadoNodo}
                    onChange={e => setEstadoNodo(e.target.value)} size="small" fullWidth />
                  <TextField label="Ciudad" value={ciudadNodo}
                    onChange={e => setCiudadNodo(e.target.value)} size="small" fullWidth />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ─── Panel derecho: getters ───────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Ubicación compuesta"
                subheader="Magik: division_telmex + '  /  ' + area_telmex + '  /  ' + nombre_central + ' / ' + diseño.name"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 12, p: 1, backgroundColor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  {proyecto.ubicacion || '—'}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  <code>mesAnio</code>: <strong>{proyecto.mesAnio || '—'}</strong>
                </Typography>
              </CardContent>
            </Card>

            {/* PEPs con FALC */}
            <Card variant="outlined">
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>PEPs Sec (lógica FALC)</span>
                    {isFalcActive
                      ? <Chip label="FALC activo — PEP desde OE" size="small" color="warning" />
                      : <Chip label="Normal — PEP desde campo proyecto" size="small" variant="outlined" />
                    }
                  </Stack>
                }
                subheader="pepConsSec / pepDesmSec / pepRehaSec — si diseño=secundaria + nombre FALC: busca en oeiLocals[0].oeLocals"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>getter</TableCell>
                      <TableCell>valor</TableCell>
                      <TableCell>origen</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {([
                      ['pepConsSec', proyecto.pepConsSec, 'CONSTRUCCION'],
                      ['pepDesmSec', proyecto.pepDesmSec, 'DESMONTAJE'],
                      ['pepRehaSec', proyecto.pepRehaSec, 'REHABILITACION'],
                    ] as [string, string, string][]).map(([key, val, tipo]) => (
                      <TableRow key={key} sx={isFalcActive ? { backgroundColor: 'warning.light' } : undefined}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{key}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}><strong>{val || '—'}</strong></TableCell>
                        <TableCell>
                          <Chip
                            label={isFalcActive ? `OE tipo_trabajo=${tipo}` : 'proyecto.pepXxxSecu'}
                            size="small"
                            color={isFalcActive ? 'warning' : 'default'}
                            variant="outlined"
                            sx={{ fontSize: 10 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Todos los PEPs */}
            <Card variant="outlined">
              <CardHeader title="Todos los PEPs" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>getter</TableCell><TableCell>valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {([
                      ['pepConsCan',   proyecto.pepConsCan],
                      ['pepConsPrinc', proyecto.pepConsPrinc],
                      ['pepConsSec',   proyecto.pepConsSec],
                      ['pepDesmCan',   proyecto.pepDesmCan],
                      ['pepDesmPrinc', proyecto.pepDesmPrinc],
                      ['pepDesmSec',   proyecto.pepDesmSec],
                      ['pepRecoPrinc', proyecto.pepRecoPrinc],
                      ['pepRecoSec',   proyecto.pepRecoSec],
                      ['pepRehaCan',   proyecto.pepRehaCan],
                      ['pepRehaPrinc', proyecto.pepRehaPrinc],
                      ['pepRehaSec',   proyecto.pepRehaSec],
                    ] as [string, string][]).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{k}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{v || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Datos generales */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined">
                  <CardHeader title="Datos del proyecto" titleTypographyProps={{ variant: 'subtitle2' }} />
                  <CardContent sx={{ pt: 0 }}>
                    <Table size="small">
                      <TableBody>
                        {getterRows.map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 10 }}>{k}</TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{v || '—'}</TableCell>
                          </TableRow>
                        ))}
                        {geoRows.map(([k, v]) => (
                          <TableRow key={k} sx={{ backgroundColor: 'info.light' }}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 10 }}>{k} *</TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{v || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      * Azul = del NodoRecord inyectado (GIS stub)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined">
                  <CardHeader title="Responsables" titleTypographyProps={{ variant: 'subtitle2' }} />
                  <CardContent sx={{ pt: 0 }}>
                    <Table size="small">
                      <TableBody>
                        {responsablesRows.map(([k, v]) => (
                          <TableRow key={k}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 10 }}>{k}</TableCell>
                            <TableCell sx={{ fontSize: 11 }}>{v || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

          </Stack>
        </Grid>

        {/* ─── obten_peps_por_tipo() ────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="obtenPepsPorTipo() — OEs del diseño agrupadas por rubro y tipo"
              subheader="D/B=construcción · J=desmontaje · tipo=fibra|cobre según tipoProyecto del diseño"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                {(['construccion', 'desmontaje'] as const).map(rubro => (
                  <Grid key={rubro} size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      {rubro}
                    </Typography>
                    {(['fibra', 'cobre', 'canal'] as const).map(tipo => {
                      const entries = pepsPorTipo[rubro][tipo]
                      if (!entries.length) return null
                      return (
                        <Box key={tipo} sx={{ mb: 1 }}>
                          <Chip label={tipo} size="small" color={tipo === 'fibra' ? 'primary' : 'default'}
                            variant="outlined" sx={{ mb: 0.5, fontSize: 10 }} />
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                <TableCell>pep</TableCell>
                                <TableCell>opb</TableCell>
                                <TableCell>oei</TableCell>
                                <TableCell>oe</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {entries.map((e, i) => (
                                <TableRow key={i}>
                                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 10 }}>{e.pep}</TableCell>
                                  <TableCell sx={{ fontSize: 10 }}>{e.opb || '—'}</TableCell>
                                  <TableCell sx={{ fontSize: 10 }}>{e.oei || '—'}</TableCell>
                                  <TableCell sx={{ fontSize: 10 }}>{e.oe}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      )
                    })}
                    {(['fibra','cobre','canal'] as const).every(t => !pepsPorTipo[rubro][t].length) && (
                      <Typography variant="caption" color="text.secondary">Sin OEs de {rubro}</Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Fuente de datos: <code>disenio.oeLocals</code> (3 OEs de muestra fijas) ·
                Cambia <code>tipoProyecto</code> a <em>cobre</em> para ver la clasificación cambiar
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
