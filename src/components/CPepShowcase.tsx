import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, Stack, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import {
  CPep,
  type PepAttributes,
  type PepData,
} from '../models/CPep'

const DEFAULT_ATTRS: PepAttributes = {
  empreviso: '',
  pep: '',
  opb: '',
  oei: '',
  oe: '',
  programa_proyecto: '',
  ot: '',
  desmontaje: '',
  canalizacion: '',
  principal: '',
  reconcentracion: '',
}

const MOCK_GIS_DATA: PepData = {
  opb:              'OPB-NORTE-01',
  oei:              'OEI-NORTE-01',
  oe:               'OE-CONST-01',
  oe_desm:          'OE-DESM-01',
  oe_canal:         'OE-CANAL-01',
  oe_reco:          'OE-RECO-01',
  proyectista:      'Juan Pérez',
  supervisor:       'María López',
  supervisor_telmex:'Carlos Ruiz',
  pep:              'PEP-2025-001',
  desmontaje:       'DESM-REF-001',
  reconcentracion:  'RECO-REF-001',
  principal:        'PRINC-REF-001',
  canalizacion:     'CANAL-REF-001',
  ruta:             'RUTA-A1',
  programa_proyecto:'PROG-2025',
  ot:               'OT-12345',
}

const COLOR_CSS = `rgb(${Math.round(0.0 * 255)}, ${Math.round(0.8 * 255)}, ${Math.round(0.3 * 255)})`

export function CPepShowcase() {
  const [attrs, setAttrs] = useState<PepAttributes>(DEFAULT_ATTRS)

  const pep = useMemo(() => new CPep(attrs), [attrs])
  const enumMap = useMemo(() => pep.enumTipoEmpresaR(), [pep])
  const mergedData = useMemo(() => pep.infoSelloPropiedades(MOCK_GIS_DATA), [pep])
  const coloredCells = useMemo(() => pep.asignaCeldasAColorear(), [pep])
  const dynData = useMemo(() => pep.llenaDatosDinamicos(), [pep])

  const updateAttr = (key: keyof PepAttributes) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAttrs(prev => ({ ...prev, [key]: e.target.value || undefined }))

  const attrFields: (keyof PepAttributes)[] = [
    'empreviso', 'pep', 'opb', 'oei', 'oe',
    'programa_proyecto', 'ot', 'desmontaje', 'canalizacion', 'principal', 'reconcentracion',
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CPep
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_pep.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Sello de PEP para planos de cobre. Extiende <code>c_base_sello_cobre</code>.
        Define 6 tablas con etiquetas fijas y datos dinámicos del dataset GIS.
        Los atributos del sello sobreescriben los datos GIS al renderizar.
      </Typography>

      <Grid container spacing={3}>

        {/* Atributos editables del sello */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardHeader
              title="PepAttributes (atributos del sello)"
              subheader="Vacío = usa dato GIS; con valor = override en uppercase"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                {attrFields.map(field => (
                  <TextField
                    key={field}
                    label={field}
                    value={attrs[field] ?? ''}
                    onChange={updateAttr(field)}
                    size="small"
                    fullWidth
                    slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: 13 } } }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* valorPropiedad — override vs GIS */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="infoSelloPropiedades(gisData) — resultado del merge"
                subheader="Magik: valor_propiedad(prop, dato_actual) — attr uppercase gana sobre dato GIS"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell>campo</TableCell>
                        <TableCell>dato GIS (mock)</TableCell>
                        <TableCell>resultado final</TableCell>
                        <TableCell>fuente</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(
                        ['opb','oei','oe','programa_proyecto','ot',
                         'pep','canalizacion','desmontaje','reconcentracion','principal'] as (keyof PepData)[]
                      ).map(field => {
                        const gisVal = MOCK_GIS_DATA[field]
                        const merged = mergedData[field]
                        const overridden = merged !== gisVal
                        return (
                          <TableRow key={field} hover sx={overridden ? { backgroundColor: 'success.50' } : {}}>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{field}</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{gisVal}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: overridden ? 700 : 400 }}>
                              {merged}
                            </TableCell>
                            <TableCell>
                              {overridden
                                ? <Chip label="atributo" size="small" color="success" />
                                : <Chip label="GIS" size="small" variant="outlined" />}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={2}>

              {/* enum_tipo_empresar */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardHeader
                    title="enumTipoEmpresaR()"
                    subheader="Magik: hash_table"
                    titleTypographyProps={{ variant: 'subtitle2' }}
                    subheaderTypographyProps={{ variant: 'caption' }}
                  />
                  <CardContent>
                    <Stack spacing={0.5} divider={<Divider flexItem />}>
                      {Array.from(enumMap.entries()).map(([k, v]) => (
                        <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">{k}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {v}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* llenaDatosDinamicos */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardHeader
                    title="llenaDatosDinamicos()"
                    subheader="tbl_Ruta cols 2–3"
                    titleTypographyProps={{ variant: 'subtitle2' }}
                    subheaderTypographyProps={{ variant: 'caption' }}
                  />
                  <CardContent>
                    <Stack spacing={0.5} divider={<Divider flexItem />}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">col 2</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{dynData.plano}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">col 3</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{dynData.de}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* COLOR_LINEA */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined">
                  <CardHeader
                    title="COLOR_LINEA"
                    subheader="Magik: {0.0, 0.8, 0.3}"
                    titleTypographyProps={{ variant: 'subtitle2' }}
                    subheaderTypographyProps={{ variant: 'caption' }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: COLOR_CSS,
                          border: '1px solid',
                          borderColor: 'divider',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {COLOR_CSS}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {coloredCells.length} celdas coloreadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>

          </Stack>
        </Grid>

        {/* TABLE_CONFIGS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="TABLE_CONFIGS — configura_tabla()"
              subheader="6 tablas anidadas con dimensiones fijas (Magik: pl_tam_*)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>tabla</TableCell>
                    <TableCell align="center">filas</TableCell>
                    <TableCell align="center">cols</TableCell>
                    <TableCell>alturas</TableCell>
                    <TableCell>anchos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Object.entries(CPep.TABLE_CONFIGS) as [string, typeof CPep.TABLE_CONFIGS[keyof typeof CPep.TABLE_CONFIGS]][]).map(
                    ([id, cfg]) => (
                      <TableRow key={id} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{id}</TableCell>
                        <TableCell align="center">{cfg.rows}</TableCell>
                        <TableCell align="center">{cfg.cols}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                          [{cfg.rowHeights.join(', ')}]
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                          [{cfg.colWidths.join(', ')}]
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* CELL_LABELS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="CELL_LABELS — etiqueta_celdas()"
              subheader="Etiquetas de encabezado fijas asignadas a celdas col 1"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>tabla</TableCell>
                    <TableCell align="center">fila</TableCell>
                    <TableCell align="center">col</TableCell>
                    <TableCell>texto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CPep.CELL_LABELS.map(([tableId, row, col, text], i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                        <Tooltip title={tableId} placement="right">
                          <span>{tableId.replace('tbl_', '')}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary' }}>{row}</TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary' }}>{col}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* asignaCeldasAColorear */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title={`asignaCeldasAColorear() — ${coloredCells.length} celdas`}
              subheader="Magik: rope con {:tbl_X, fila, col, o_color_linea} — celdas de datos resaltadas en verde"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {coloredCells.map((c, i) => (
                  <Chip
                    key={i}
                    label={`${c.tableId.replace('tbl_', '')} [${c.row},${c.col}]`}
                    size="small"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      backgroundColor: COLOR_CSS,
                      color: '#fff',
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
