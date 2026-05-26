import { useState, useMemo } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Chip,
  Grid, IconButton, Stack, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import {
  CCuadroResumenDelCable,
  COL_MAP,
  type CuadroResumenRow,
} from '../models/CCuadroResumenDelCable'

const EMPTY_ROW: CuadroResumenRow = {
  distrito:     '',
  cable:        '',
  capacidad:    '',
  totalFibras:  '',
  cuentas:      '',
  posicion:     '',
  nco:          '',
  trayectoria:  '',
  nse:          '',
  clasificacion:'',
  viviendas:    '',
  distanciaNco: '',
}

const SAMPLE_ROWS: [string, CuadroResumenRow][] = [
  ['k1', { distrito: 'NORTE', cable: 'CF-001', capacidad: '96', totalFibras: '48',
            cuentas: '120', posicion: '1.A.1.I.1.1', nco: 'NCO-NORTE', trayectoria: 'T-01',
            nse: 'B/C', clasificacion: 'RESIDENCIAL', viviendas: '200', distanciaNco: '1.25' }],
  ['k2', { distrito: 'SUR', cable: 'CF-002', capacidad: '48', totalFibras: '24',
            cuentas: '85', posicion: '1.B.2.D.2.3', nco: 'NCO-SUR', trayectoria: 'T-02',
            nse: 'C/D', clasificacion: 'MIXTA', viviendas: '150', distanciaNco: '2.10' }],
]

export function CCuadroResumenDelCableShowcase() {
  const [rows, setRows] = useState<[string, CuadroResumenRow][]>(SAMPLE_ROWS)
  const [newRow, setNewRow] = useState<CuadroResumenRow>(EMPTY_ROW)
  const [showAdd, setShowAdd] = useState(false)

  const resumenMap = useMemo(
    () => new Map(rows),
    [rows]
  )

  const sello = useMemo(
    () => CCuadroResumenDelCable.newWith(resumenMap),
    [resumenMap]
  )

  const dynamicAttribs = useMemo(() => sello.definedAttributesDinamicos(), [sello])

  const cellData = useMemo(() => sello.buildCellData(), [sello])

  const addRow = () => {
    if (!newRow.distrito.trim()) return
    const key = `k${Date.now()}`
    setRows(prev => [...prev, [key, { ...newRow }]])
    setNewRow(EMPTY_ROW)
    setShowAdd(false)
  }

  const removeRow = (key: string) => {
    setRows(prev => prev.filter(([k]) => k !== key))
  }

  const updateNewRow = (field: keyof CuadroResumenRow) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewRow(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CCuadroResumenDelCable
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip
          label={`allowedOnMenu = ${CCuadroResumenDelCable.allowedOnMenu}`}
          size="small"
          sx={{ ml: 1 }}
          variant="outlined"
        />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_cuadro_resumen_del_cable.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Sello GIS que genera una tabla resumen de cables FO por distrito. Extiende{' '}
        <code>CBaseSelloFibra</code> — esta versión muestra la lógica de datos pura.
      </Typography>

      <Grid container spacing={3}>

        {/* Filas de datos (LoElemResumen) */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title={`LoElemResumen — Map<string, CuadroResumenRow> (${rows.length} entradas)`}
              subheader="Cada entrada es un distrito con datos del cable que lo alimenta"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
              action={
                <Tooltip title="Añadir distrito">
                  <IconButton size="small" onClick={() => setShowAdd(v => !v)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell><strong>Col 6 · distrito</strong></TableCell>
                      <TableCell>Col 3 · cable</TableCell>
                      <TableCell>Col 5 · capacidad</TableCell>
                      <TableCell>Col 9 · total-fibras</TableCell>
                      <TableCell>Col 10 · cuentas</TableCell>
                      <TableCell>Col 1 · nco</TableCell>
                      <TableCell>Col 2 · trayectoria</TableCell>
                      <TableCell>Col 4 · posicion</TableCell>
                      <TableCell>Col 8 · viviendas</TableCell>
                      <TableCell>Col 7 · dist-nco</TableCell>
                      <TableCell>Col 12 · nse</TableCell>
                      <TableCell>Col 11 · clasificacion</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(([key, row]) => (
                      <TableRow key={key} hover>
                        <TableCell><strong>{row.distrito.toUpperCase()}</strong></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.cable}</TableCell>
                        <TableCell>{row.capacidad}</TableCell>
                        <TableCell>{row.totalFibras}</TableCell>
                        <TableCell>{row.cuentas}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.nco}</TableCell>
                        <TableCell>{row.trayectoria}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{row.posicion}</TableCell>
                        <TableCell>{row.viviendas}</TableCell>
                        <TableCell>{row.distanciaNco}</TableCell>
                        <TableCell>{row.nse}</TableCell>
                        <TableCell>{row.clasificacion}</TableCell>
                        <TableCell padding="none">
                          <IconButton size="small" onClick={() => removeRow(key)}>
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    {showAdd && (
                      <TableRow sx={{ backgroundColor: 'action.selected' }}>
                        {(
                          ['distrito','cable','capacidad','totalFibras','cuentas',
                           'nco','trayectoria','posicion','viviendas','distanciaNco',
                           'nse','clasificacion'] as (keyof CuadroResumenRow)[]
                        ).map(field => (
                          <TableCell key={field} sx={{ py: 0.5 }}>
                            <TextField
                              value={newRow[field]}
                              onChange={updateNewRow(field)}
                              size="small"
                              placeholder={field}
                              sx={{ width: 90 }}
                              slotProps={{ input: { style: { fontSize: 12 } } }}
                            />
                          </TableCell>
                        ))}
                        <TableCell padding="none">
                          <Button size="small" onClick={addRow} disabled={!newRow.distrito.trim()}>
                            OK
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Atributos dinámicos generados */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title={`definedAttributesDinamicos() — ${dynamicAttribs.length} atributos`}
              subheader='Magik: layout_attribute_definition.new("col_renglon_distrito", :string)'
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>nombre del atributo</TableCell>
                      <TableCell>tipo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dynamicAttribs.map((attr, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {attr.name}
                          {attr.name === 'titulo' && (
                            <Chip label="fijo" size="small" sx={{ ml: 1, fontSize: 10 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{attr.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COL_MAP + celdas calculadas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="COL_MAP — columnas de la tabla"
                subheader="12 columnas fijas de tbl_cuadro_resumen_del_cable"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ p: 0 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell>#</TableCell>
                      <TableCell>campo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(COL_MAP).map(([col, idx]) => (
                      <TableRow key={col} hover>
                        <TableCell sx={{ width: 40, color: 'primary.main', fontWeight: 700 }}>
                          {idx}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{col}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={`buildCellData() — ${cellData.length} celdas de datos`}
                subheader="Equivalente al loop llena_datos_celdas en Magik"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell>fila</TableCell>
                        <TableCell>col</TableCell>
                        <TableCell>campo</TableCell>
                        <TableCell>valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cellData.map((c, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ color: 'text.secondary' }}>{c.row}</TableCell>
                          <TableCell sx={{ color: 'primary.main', fontWeight: 700 }}>{c.col}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{c.colName}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{c.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* isDynamicAttrKey demo */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="isDynamicAttrKey(key) — filtro de atributos editables"
              subheader='Magik: key.numbers_and_strings.size > 1 — identifica claves con renglon numérico'
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {[
                  'nco_1_norte', 'cable_2_sur', 'titulo', 'locked',
                  'distancia-nco_1_norte', 'total-fibras_3_oriente',
                ].map(key => (
                  <Chip
                    key={key}
                    label={key}
                    size="small"
                    color={sello.isDynamicAttrKey(key) ? 'success' : 'default'}
                    variant={sello.isDynamicAttrKey(key) ? 'filled' : 'outlined'}
                    sx={{ fontFamily: 'monospace', fontSize: 11 }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Verde = atributo editable (override manual) · Gris = atributo fijo (ignorado)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
