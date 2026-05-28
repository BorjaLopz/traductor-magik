import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  FormControl, Grid, InputLabel, MenuItem, Select,
  Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloRutaCablesFoSigp,
  type SelloRutaCablesFoSigpConfig,
} from '../models/CSelloRutaCablesFoSigp'

// ─── Color cells reference ────────────────────────────────────────────────────

const RED_CELLS = [
  { tabla: 'tbl_4',         cell: '(1,1)', label: '"RED PRINCIPAL DE FIBRA OPTICA"' },
  { tabla: 'tbl_inf_adm_1', cell: '(1,2)', label: 'pep' },
  { tabla: 'tbl_inf_adm_3', cell: '(2,1)', label: 'numcable' },
  { tabla: 'tbl_inf_adm_3', cell: '(2,5)', label: 'const_opb' },
  { tabla: 'tbl_inf_adm_3', cell: '(3,5)', label: 'const_oei' },
  { tabla: 'tbl_inf_adm_3', cell: '(4,5)', label: 'const_oe' },
  { tabla: 'tbl_inf_adm_3', cell: '(2,6)', label: 'desm_opb' },
  { tabla: 'tbl_inf_adm_3', cell: '(3,6)', label: 'desm_oei' },
  { tabla: 'tbl_inf_adm_3', cell: '(4,6)', label: 'desm_oe' },
]

// ─── valor_propiedad live preview ─────────────────────────────────────────────

function ValorPropiedadCard({ sello }: { sello: CSelloRutaCablesFoSigp }) {
  const entries: [string, string, string][] = [
    ['pep',       sello.pep,       'tbl_inf_adm_1(1,2)'],
    ['vobo',      sello.vobo,      'tbl_inf_adm_1(2,3)'],
    ['proyecto',  sello.proyecto,  'tbl_inf_adm_2(2,2)'],
    ['programa',  sello.programa,  'tbl_inf_adm_2(2,3)'],
    ['numcable',  sello.numcable,  'tbl_inf_adm_3(2,1)'],
    ['supervisor',sello.supervisor,'tbl_inf_adm_3(2,2)'],
    ['siglas',    sello.siglas,    'tbl_inf_adm_3(4,1)'],
    ['fecha',     sello.fecha,     'tbl_inf_adm_3(4,3)'],
    ['const_opb', sello.constOpb,  'tbl_inf_adm_3(2,5)'],
    ['const_oei', sello.constOei,  'tbl_inf_adm_3(3,5)'],
    ['const_oe',  sello.constOe,   'tbl_inf_adm_3(4,5)'],
    ['desm_opb',  sello.desmOpb,   'tbl_inf_adm_3(2,6)'],
    ['desm_oei',  sello.desmOei,   'tbl_inf_adm_3(3,6)'],
    ['desm_oe',   sello.desmOe,    'tbl_inf_adm_3(4,6)'],
    ['jaladocable',sello.jaladocable,'tbl_4(4,1)'],
    ['distritos', sello.distritos, 'tbl_inf_adm_3(6,1)'],
    ['hoja',      sello.hoja,      'tbl_inf_adm_3(7,6)'],
  ]
  return (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
      <Box component="thead">
        <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
          {['Atributo', 'Valor attr', 'Efectivo (uppercase)', 'Celda'].map(h => (
            <Box component="th" key={h} sx={{ p: '3px 6px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
          ))}
        </Box>
      </Box>
      <Box component="tbody">
        {entries.map(([attr, val, cell]) => {
          const effective = sello.valorPropiedad(val, '(GIS — Fase 5)')
          const hasOverride = val.trim().length > 0
          return (
            <Box component="tr" key={attr} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box component="td" sx={{ p: '2px 6px', color: 'primary.main' }}>{attr}</Box>
              <Box component="td" sx={{ p: '2px 6px', color: hasOverride ? 'success.main' : 'text.disabled' }}>
                {val || '—'}
              </Box>
              <Box component="td" sx={{ p: '2px 6px', fontWeight: hasOverride ? 'bold' : 'normal', color: hasOverride ? 'text.primary' : 'text.secondary' }}>
                {effective}
              </Box>
              <Box component="td" sx={{ p: '2px 6px', color: 'text.secondary' }}>{cell}</Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

// ─── Table schematic ──────────────────────────────────────────────────────────

function TableSchematic() {
  const SCALE = 1.6
  const W = (w: number) => w * SCALE
  const H = (h: number) => h * SCALE

  // Total width ≈ 150mm (tbl_4/tbl_inf_adm_3)
  const totalW = W(150)

  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 9 }}>
      {/* tbl_4: 5 rows, 150mm wide */}
      <Box sx={{ display: 'flex', flexDirection: 'column', border: '1.5px solid #555', width: totalW, mb: 0.25 }}>
        {[
          { h: 15, label: '(1,1) "RED PRINCIPAL DE FIBRA OPTICA" [red, bold]' },
          { h: 15, label: '(2,1) CTL info [GIS]' },
          { h: 12, label: '(3,1) NCO info [GIS]' },
          { h: 10, label: '(4,1) "JALADO DE CABLE DE:" → jaladocable' },
          { h: 30, label: '(5,1) [vacío]' },
        ].map(({ h, label }, i) => (
          <Box key={i} sx={{
            height: H(h), px: 0.5,
            display: 'flex', alignItems: 'center',
            borderBottom: i < 4 ? '1px solid #bbb' : 'none',
            bgcolor: i === 0 ? '#ffebee' : i === 3 ? '#fff9e6' : '#fafafa',
            overflow: 'hidden',
          }}>
            <Typography sx={{ fontSize: 8, fontFamily: 'monospace', color: '#444', whiteSpace: 'nowrap' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">tbl_4 (5×1 · 150mm)</Typography>

      {/* tbl_inf_adm_1: 2 rows × 3 cols */}
      <Box sx={{ display: 'flex', flexDirection: 'column', border: '1.5px solid #555', width: totalW, mt: 1, mb: 0.25 }}>
        {[
          {
            cols: [
              { w: 22.5, label: '"PEPS:" [bold]' },
              { w: 52.5, label: 'pep [red,bold]' },
              { w: 75,   label: '"VoBo RNUM"' },
            ],
          },
          {
            cols: [
              { w: 22.5, label: '—' },
              { w: 52.5, label: '—' },
              { w: 75,   label: 'vobo' },
            ],
          },
        ].map((row, ri) => (
          <Box key={ri} sx={{ display: 'flex', height: H(10), borderBottom: ri < 1 ? '1px solid #bbb' : 'none' }}>
            {row.cols.map((col, ci) => (
              <Box key={ci} sx={{
                width: W(col.w), height: '100%', px: 0.3,
                display: 'flex', alignItems: 'center',
                borderRight: ci < row.cols.length - 1 ? '1px solid #bbb' : 'none',
                bgcolor: ri === 0 && ci === 1 ? '#ffebee' : '#fafafa',
                overflow: 'hidden',
              }}>
                <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: '#444' }}>{col.label}</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">tbl_inf_adm_1 (2×3 · 22.5+52.5+75mm)</Typography>

      {/* tbl_inf_adm_2: 2 rows × 4 cols */}
      <Box sx={{ display: 'flex', flexDirection: 'column', border: '1.5px solid #555', width: totalW, mt: 1, mb: 0.25 }}>
        {[
          {
            h: 6,
            cols: [
              { w: 22.5, label: '"REALIZO:"' },
              { w: 52.5, label: '"PROYECTO:"' },
              { w: 37.5, label: '"PROGRAMA"' },
              { w: 37.5, label: '—' },
            ],
          },
          {
            h: 10.5,
            cols: [
              { w: 22.5, label: 'logo empresa' },
              { w: 52.5, label: 'proyecto' },
              { w: 37.5, label: 'programa' },
              { w: 37.5, label: '—' },
            ],
          },
        ].map((row, ri) => (
          <Box key={ri} sx={{ display: 'flex', height: H(row.h), borderBottom: ri < 1 ? '1px solid #bbb' : 'none' }}>
            {row.cols.map((col, ci) => (
              <Box key={ci} sx={{
                width: W(col.w), height: '100%', px: 0.3,
                display: 'flex', alignItems: 'center',
                borderRight: ci < row.cols.length - 1 ? '1px solid #bbb' : 'none',
                bgcolor: ri === 1 && ci === 0 ? '#e8f5e9' : '#fafafa',
                overflow: 'hidden',
              }}>
                <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: '#444' }}>{col.label}</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">tbl_inf_adm_2 (2×4 · 22.5+52.5+37.5+37.5mm)</Typography>

      {/* tbl_inf_adm_3: 7 rows × 6 cols — summary only */}
      <Box sx={{ border: '1.5px solid #555', width: totalW, mt: 1, mb: 0.25, bgcolor: '#f3e5f5', p: 0.5 }}>
        <Typography sx={{ fontSize: 8, fontFamily: 'monospace', color: '#666' }}>
          tbl_inf_adm_3 (7×6) · 22.5+22.5+30+10.5+27+37.5mm · rows 7.5×5+15+7.5
        </Typography>
        <Typography sx={{ fontSize: 7.5, fontFamily: 'monospace', color: '#444', mt: 0.5, lineHeight: 1.5 }}>
          Row 1: No.Cable | SUPERVISO | — | — | CONSTRUCCION | DESMONTAJE{'\n'}
          Row 2: numcable | supervisor | — | OPB: | const_opb🔴 | desm_opb🔴{'\n'}
          Row 3: SIGLAS  | — | FECHA | OEI: | const_oei🔴 | desm_oei🔴{'\n'}
          Row 4: siglas  | — | fecha | OE:  | const_oe🔴  | desm_oe🔴{'\n'}
          Row 5: DISTRITOS AFECTADOS (col span){'\n'}
          Row 6: distritos🔴{'\n'}
          Row 7: — | — | — | — | — | hoja
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">tbl_inf_adm_3 (7×6 · detalle completo)</Typography>
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CSelloRutaCablesFoSigpShowcase() {
  const [empproyecto, setEmpproyecto] = useState('')
  const [pep,         setPep]         = useState('')
  const [vobo,        setVobo]        = useState('')
  const [proyecto,    setProyecto]    = useState('')
  const [programa,    setPrograma]    = useState('')
  const [numcable,    setNumcable]    = useState('')
  const [supervisor,  setSupervisor]  = useState('')
  const [siglas,      setSiglas]      = useState('')
  const [fecha,       setFecha]       = useState('')
  const [constOpb,    setConstOpb]    = useState('')
  const [constOei,    setConstOei]    = useState('')
  const [constOe,     setConstOe]     = useState('')
  const [desmOpb,     setDesmOpb]     = useState('')
  const [desmOei,     setDesmOei]     = useState('')
  const [desmOe,      setDesmOe]      = useState('')
  const [jaladocable, setJaladocable] = useState('')
  const [distritos,   setDistritos]   = useState('')
  const [hoja,        setHoja]        = useState('PLANO 2 DE 3')

  const config = useMemo<SelloRutaCablesFoSigpConfig>(() => ({
    empproyecto: empproyecto || undefined,
    pep:         pep         || undefined,
    vobo:        vobo        || undefined,
    proyecto:    proyecto    || undefined,
    programa:    programa    || undefined,
    numcable:    numcable    || undefined,
    supervisor:  supervisor  || undefined,
    siglas:      siglas      || undefined,
    fecha:       fecha       || undefined,
    constOpb:    constOpb    || undefined,
    constOei:    constOei    || undefined,
    constOe:     constOe     || undefined,
    desmOpb:     desmOpb     || undefined,
    desmOei:     desmOei     || undefined,
    desmOe:      desmOe      || undefined,
    jaladocable: jaladocable || undefined,
    distritos:   distritos   || undefined,
    hoja:        hoja        || undefined,
  }), [empproyecto, pep, vobo, proyecto, programa, numcable, supervisor,
       siglas, fecha, constOpb, constOei, constOe, desmOpb, desmOei, desmOe,
       jaladocable, distritos, hoja])

  const sello       = useMemo(() => new CSelloRutaCablesFoSigp(config), [config])
  const empresapMap = useMemo(() => sello.enumTipoEmpresap(), [sello])
  const logoP       = sello.logoProyecta()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_ruta_cables_fo_sigp
        <Chip label="Fase 2 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="allowed_on_menu=false" size="small" color="default" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_sello_ruta_cables_fo_sigp.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Variante SIGP del sello de Ruta de Cables FO. 4 tablas, 18 atributos de override.
        Patrón <code>valor_propiedad</code>: si el atributo tiene valor, sobreescribe el dato GIS;
        si no, usa el valor computado por <code>calcula_informacion</code> (Fase 5).
        9 celdas siempre rojas (construcción/desmontaje OPB/OEI/OE + title).
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: inputs */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* empresa + logo */}
            <Card variant="outlined">
              <CardHeader
                title="Empresa proyecta"
                subheader="enum_tipo_empresap → logo tbl_inf_adm_2(2,1)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>empproyecto</InputLabel>
                    <Select
                      value={empproyecto}
                      label="empproyecto"
                      onChange={e => setEmpproyecto(e.target.value)}
                    >
                      <MenuItem value="">— (sin override, GIS) —</MenuItem>
                      {[...empresapMap.entries()].map(([k, v]) => (
                        <MenuItem key={k} value={v}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                    <Box sx={{ color: 'text.secondary', mb: 0.5 }}>logo derivado:</Box>
                    <Box sx={{ color: logoP ? 'primary.main' : 'text.disabled', fontWeight: 'bold' }}>
                      {logoP || '(GIS: project.user!_empresa_proyecto)'}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* PEP / OE refs */}
            <Card variant="outlined">
              <CardHeader
                title="Referencias OE"
                subheader="Atributos de construcción y desmontaje (celdas rojas)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  <TextField label="pep"      value={pep}     onChange={e => setPep(e.target.value)}     size="small" fullWidth helperText="tbl_inf_adm_1(1,2) — rojo" />
                  <TextField label="vobo"     value={vobo}    onChange={e => setVobo(e.target.value)}    size="small" fullWidth helperText="tbl_inf_adm_1(2,3)" />
                  <Divider><Typography variant="caption">Construcción</Typography></Divider>
                  <TextField label="const_opb" value={constOpb} onChange={e => setConstOpb(e.target.value)} size="small" fullWidth helperText="tbl_inf_adm_3(2,5) — rojo" />
                  <TextField label="const_oei" value={constOei} onChange={e => setConstOei(e.target.value)} size="small" fullWidth helperText="tbl_inf_adm_3(3,5) — rojo" />
                  <TextField label="const_oe"  value={constOe}  onChange={e => setConstOe(e.target.value)}  size="small" fullWidth helperText="tbl_inf_adm_3(4,5) — rojo" />
                  <Divider><Typography variant="caption">Desmontaje</Typography></Divider>
                  <TextField label="desm_opb" value={desmOpb} onChange={e => setDesmOpb(e.target.value)} size="small" fullWidth helperText="tbl_inf_adm_3(2,6) — rojo" />
                  <TextField label="desm_oei" value={desmOei} onChange={e => setDesmOei(e.target.value)} size="small" fullWidth helperText="tbl_inf_adm_3(3,6) — rojo" />
                  <TextField label="desm_oe"  value={desmOe}  onChange={e => setDesmOe(e.target.value)}  size="small" fullWidth helperText="tbl_inf_adm_3(4,6) — rojo" />
                </Stack>
              </CardContent>
            </Card>

            {/* Other attributes */}
            <Card variant="outlined">
              <CardHeader
                title="Datos proyecto / contenido"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  <TextField label="proyecto"   value={proyecto}   onChange={e => setProyecto(e.target.value)}   size="small" fullWidth />
                  <TextField label="programa"   value={programa}   onChange={e => setPrograma(e.target.value)}   size="small" fullWidth />
                  <TextField label="numcable"   value={numcable}   onChange={e => setNumcable(e.target.value)}   size="small" fullWidth helperText="tbl_inf_adm_3(2,1) — rojo" />
                  <TextField label="supervisor" value={supervisor} onChange={e => setSupervisor(e.target.value)} size="small" fullWidth />
                  <TextField label="siglas"     value={siglas}     onChange={e => setSiglas(e.target.value)}     size="small" fullWidth />
                  <TextField label="fecha"      value={fecha}      onChange={e => setFecha(e.target.value)}      size="small" fullWidth />
                  <TextField label="jaladocable" value={jaladocable} onChange={e => setJaladocable(e.target.value)} size="small" fullWidth multiline rows={2} />
                  <TextField label="distritos"  value={distritos}  onChange={e => setDistritos(e.target.value)}  size="small" fullWidth helperText="tbl_inf_adm_3(6,1) — rojo" />
                  <TextField label="hoja"       value={hoja}       onChange={e => setHoja(e.target.value)}       size="small" fullWidth helperText='Default: "PLANO 2 DE 3"' />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: live preview + structure */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* valor_propiedad live table */}
            <Card variant="outlined">
              <CardHeader
                title="Patrón valor_propiedad — resolución de atributos"
                subheader="Verde = override activo · (GIS — Fase 5) = valor computado por calcula_informacion"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0, overflowX: 'auto' }}>
                <ValorPropiedadCard sello={sello} />
              </CardContent>
            </Card>

            {/* Schematic */}
            <Card variant="outlined">
              <CardHeader
                title="Estructura de tablas"
                subheader="4 tablas apiladas verticalmente · coordenadas desde coordInicio"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TableSchematic />
              </CardContent>
            </Card>

            {/* Color cells + table dims */}
            <Card variant="outlined">
              <CardHeader
                title="Celdas coloreadas (asigna_celdas_a_colorear)"
                subheader="o_color_linea = {1.0, 0.0, 0.0} — siempre rojas"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {RED_CELLS.map(({ tabla, cell, label }) => (
                    <Chip
                      key={`${tabla}${cell}`}
                      label={`${tabla}${cell} — ${label}`}
                      size="small"
                      sx={{ fontFamily: 'monospace', fontSize: 10, bgcolor: '#ffebee', color: '#c62828' }}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Dim', 'Rows (mm)', 'Cols (mm)', 'Coord oy−'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 6px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_4',         '5×1', '15+15+12+10+30=82',         '150',                        '0'],
                      ['tbl_inf_adm_1', '2×3', '10+10=20',                  '22.5+52.5+75=150',           '82'],
                      ['tbl_inf_adm_2', '2×4', '6+10.5=16.5',               '22.5+52.5+37.5+37.5=150',   '102'],
                      ['tbl_inf_adm_3', '7×6', '7.5×5+15+7.5=60',          '22.5+22.5+30+10.5+27+37.5=150', '118.5'],
                    ].map(([n, d, r, c, oy], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '2px 6px', color: 'primary.main' }}>{n}</Box>
                        <Box component="td" sx={{ p: '2px 6px' }}>{d}</Box>
                        <Box component="td" sx={{ p: '2px 6px', color: 'text.secondary' }}>{r}</Box>
                        <Box component="td" sx={{ p: '2px 6px', color: 'text.secondary' }}>{c}</Box>
                        <Box component="td" sx={{ p: '2px 6px' }}>{oy}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
