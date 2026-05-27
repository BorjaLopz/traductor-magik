import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  FormControl, Grid, InputLabel, MenuItem, Select,
  FormControlLabel, Switch, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloRutaCablesFo,
  TIPOS_PEPS_BA,
  TIPOS_PEPS_FIBRA,
  TIPOS_PEPS_FTTB,
  type SelloRutaCablesFoConfig,
} from '../models/CSelloRutaCablesFo'

// ─── Logo derivation display ─────────────────────────────────────────────────

function LogoDerivation({ sello }: { sello: CSelloRutaCablesFo }) {
  const logoR = sello.logoRevisa()
  const logoP = sello.logoProyecta()
  return (
    <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {[
          ['tbl_logo_telmex (1,1)', logoR],
          ['tbl_logo_imtsa  (1,1)', logoP || '(GIS: project.user!_empresa_proyecto)'],
        ].map(([k, v]) => (
          <>
            <Box key={`k${k}`} sx={{ color: 'text.secondary' }}>{k}</Box>
            <Box key={`v${k}`} sx={{ color: 'primary.main', fontWeight: 'bold' }}>{v}</Box>
          </>
        ))}
      </Box>
      {sello.empreviso.toUpperCase().includes('TELMEX') && (
        <Typography sx={{ mt: 1, fontSize: 10, color: 'warning.main' }}>
          ⚠ TELMEX detectado → sufijo _EP añadido
        </Typography>
      )}
    </Box>
  )
}

// ─── PEP constants reference ──────────────────────────────────────────────────

function PepList({ label, fields }: { label: string; fields: readonly string[] }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
        {label} ({fields.length} campos)
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
        {fields.map(f => (
          <Box component="li" key={f}
            sx={{ fontFamily: 'monospace', fontSize: 10, color: 'text.secondary', lineHeight: 1.6 }}>
            {f}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// ─── Table layout schematic ───────────────────────────────────────────────────

function TableSchematic({ pTotRen }: { pTotRen: number }) {
  const sello = useMemo(() => new CSelloRutaCablesFo(), [])
  const frameH = sello.computeFrameHeight(pTotRen)

  // Scaled representation (total footprint ~185mm wide × 250mm tall)
  const SCALE = 1.4
  const W     = 185 * SCALE
  const BLOCK = (mm: number) => mm * SCALE

  return (
    <Box>
      <Box sx={{
        position: 'relative',
        width: W,
        height: BLOCK(250) + 16,
        border: '2px solid #444',
        bgcolor: '#fafafa',
        fontFamily: 'monospace',
        fontSize: 9,
        overflow: 'hidden',
      }}>
        {/* tbl_1 — tipo plano (ox+150, top) */}
        <Box sx={{
          position: 'absolute',
          left: BLOCK(150), top: 0,
          width: BLOCK(35), height: BLOCK(11),
          border: '1px dashed #aaa',
          bgcolor: '#fff9e6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: '#888' }}>tbl_1</Typography>
        </Box>

        {/* tbl_2 — nombre enlace (ox+11, oy−11) */}
        <Box sx={{
          position: 'absolute',
          left: BLOCK(11), top: BLOCK(11),
          width: BLOCK(35), height: BLOCK(11),
          border: '1px solid #90caf9',
          bgcolor: '#e3f2fd',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 7, fontFamily: 'monospace' }}>tbl_2</Typography>
        </Box>

        {/* tbl_general outer frame */}
        <Box sx={{
          position: 'absolute',
          left: 0, top: 0,
          width: BLOCK(185), height: BLOCK(Math.min(frameH, 250)),
          border: '2px solid #555',
          pointerEvents: 'none',
        }} />

        {/* tbl_3 — admin data (ox+380/SCALE ≈ implied; show scaled) */}
        <Box sx={{
          position: 'absolute',
          left: BLOCK(Math.min(380 * 0.13, 80)), top: BLOCK(Math.min(220 * 0.13, 40)),
          width: BLOCK(104 * 0.13), height: BLOCK(64 * 0.13),
          border: '1px solid #a5d6a7',
          bgcolor: '#f1f8e9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 7, fontFamily: 'monospace' }}>tbl_3</Typography>
        </Box>

        {/* tbl_7 — hoja/de (ox+11, oy−1580 → near bottom) */}
        <Box sx={{
          position: 'absolute',
          left: BLOCK(11), top: BLOCK(230),
          width: BLOCK(155), height: BLOCK(8),
          border: '1px solid #ce93d8',
          bgcolor: '#f3e5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography sx={{ fontSize: 7, fontFamily: 'monospace' }}>
            tbl_7: HOJA:[ ] DE:[ ]
          </Typography>
        </Box>

        {/* tbl_8 label */}
        <Box sx={{
          position: 'absolute',
          left: BLOCK(11), bottom: 2,
          right: 4,
          border: '1px dashed #ef9a9a',
          bgcolor: '#fff3e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: BLOCK(8),
        }}>
          <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: '#e65100' }}>
            tbl_8 PEPs — Fase 5 (dinámica)
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Vista esquemática simplificada · tbl_general: 185×{frameH} mm
        {pTotRen !== 10 && ` (expandido: ${pTotRen} ren PEP)`}
      </Typography>
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CSelloRutaCablesFoShowcase() {
  const [empreviso,       setEmpreviso]       = useState('')
  const [empproyecto,     setEmpproyecto]     = useState('')
  const [blancoNegro,     setBlancoNegro]     = useState(false)
  const [nombreEnlace,    setNombreEnlace]    = useState('')
  const [cable,           setCable]           = useState('')
  const [titulo,          setTitulo]          = useState('')
  const [numeroDehoja,    setNumeroDehoja]    = useState('')
  const [totalHojas,      setTotalHojas]      = useState('')
  const [telefono,        setTelefono]        = useState('')
  const [dirArea,         setDirArea]         = useState('')
  const [responsableArea, setResponsableArea] = useState('')
  const [pTotRen,         setPTotRen]         = useState(10)

  const config = useMemo<SelloRutaCablesFoConfig>(() => ({
    empreviso:       empreviso      || undefined,
    empproyecto:     empproyecto    || undefined,
    blancoNegro:     blancoNegro    || undefined,
    nombreEnlace:    nombreEnlace   || undefined,
    cable:           cable          || undefined,
    titulo:          titulo         || undefined,
    numeroDehoja:    numeroDehoja   || undefined,
    totalHojas:      totalHojas     || undefined,
    telefono:        telefono       || undefined,
    dirArea:         dirArea        || undefined,
    responsableArea: responsableArea || undefined,
  }), [empreviso, empproyecto, blancoNegro, nombreEnlace, cable,
       titulo, numeroDehoja, totalHojas, telefono, dirArea, responsableArea])

  const sello = useMemo(() => new CSelloRutaCablesFo(config), [config])
  const empresarMap = useMemo(() => sello.enumTipoEmpresar(), [sello])
  const empresapMap = useMemo(() => sello.enumTipoEmpresap(), [sello])

  const frameH = sello.computeFrameHeight(pTotRen)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_sello_ruta_cables_fo
        <Chip label="Fase 2 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="allowed_on_menu=false" size="small" color="default" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_sello_ruta_cables_fo.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Sello principal de los planos Ruta de Cables FO. 11 tablas fijas + tbl_8 dinámica (PEPs).
        La tabla tbl_8 se crea con filas calculadas por GIS; ajusta_marco_y_bounds expande el marco.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>

        {/* LEFT: controls */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            {/* Company enums */}
            <Card variant="outlined">
              <CardHeader
                title="Empresas (atributos enum)"
                subheader="enum_tipo_empresar / enum_tipo_empresap"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>empreviso (empresa que revisa)</InputLabel>
                    <Select
                      value={empreviso}
                      label="empreviso (empresa que revisa)"
                      onChange={e => setEmpreviso(e.target.value)}
                    >
                      <MenuItem value="">— (sin override) —</MenuItem>
                      {[...empresarMap.entries()].map(([k, v]) => (
                        <MenuItem key={k} value={v}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>empproyecto (empresa que proyecta)</InputLabel>
                    <Select
                      value={empproyecto}
                      label="empproyecto (empresa que proyecta)"
                      onChange={e => setEmpproyecto(e.target.value)}
                    >
                      <MenuItem value="">— (sin override) —</MenuItem>
                      {[...empresapMap.entries()].map(([k, v]) => (
                        <MenuItem key={k} value={v}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch checked={blancoNegro} onChange={e => setBlancoNegro(e.target.checked)} size="small" />
                    }
                    label={
                      <Typography variant="caption">
                        blanco_negro = {blancoNegro ? '"SI"' : '"NO"'} (default)
                      </Typography>
                    }
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Content overrides */}
            <Card variant="outlined">
              <CardHeader
                title="Atributos de contenido"
                subheader="Sobreescriben los valores obtenidos por GIS"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.2}>
                  {[
                    ['nombre_enlace → tbl_2(1,1)',  nombreEnlace,    setNombreEnlace,    'font 50'],
                    ['cable → tbl_5(2,1)',           cable,           setCable,           'font 30'],
                    ['titulo → tbl_1(1,1)',          titulo,          setTitulo,          'font 70'],
                    ['numero_de_hoja → tbl_7(1,3)', numeroDehoja,    setNumeroDehoja,    'font 30'],
                    ['total_hojas → tbl_7(1,5)',    totalHojas,      setTotalHojas,      'font 30'],
                    ['responsable_area → tbl_3(6,2)', responsableArea, setResponsableArea, 'font 30'],
                    ['dir_area → tbl_3(7,2)',        dirArea,         setDirArea,         'font 30'],
                    ['telefono → tbl_3(8,2)',        telefono,        setTelefono,        'font 30'],
                  ].map(([labelStr, val, setter, hint]) => (
                    <TextField
                      key={labelStr as string}
                      label={labelStr as string}
                      value={val as string}
                      onChange={e => (setter as (v: string) => void)(e.target.value)}
                      size="small"
                      fullWidth
                      helperText={hint as string}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* ajustaMarcoYBounds */}
            <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
              <CardHeader
                title="ajusta_marco_y_bounds"
                subheader="Total renglones PEPs → altura del marco"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <TextField
                  label="p_tot_ren (total renglones PEP)"
                  type="number"
                  value={pTotRen}
                  onChange={e => setPTotRen(Math.max(10, Number(e.target.value) || 10))}
                  size="small"
                  fullWidth
                  helperText="Mínimo 10 (valor base)"
                />
                <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: 11 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                    <Box sx={{ color: 'text.secondary' }}>tbl_general row 1</Box>
                    <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      250 + ({pTotRen}−10)×8 = {frameH} mm
                    </Box>
                    <Box sx={{ color: 'text.secondary' }}>bounds.ymax +=</Box>
                    <Box sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      ({pTotRen}−10)×80 = {(pTotRen - 10) * 80} mm
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* RIGHT: preview + reference */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>

            {/* Logo derivation */}
            <Card variant="outlined">
              <CardHeader
                title="Derivación de logos"
                subheader='llena_datos_celdas — "logo_" + empreviso.uppercase (TELMEX → + "_EP")'
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <LogoDerivation sello={sello} />
              </CardContent>
            </Card>

            {/* Schematic */}
            <Card variant="outlined">
              <CardHeader
                title="Esquema de tablas (simplificado)"
                subheader="11 tablas fijas + tbl_8 dinámica (Fase 5)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TableSchematic pTotRen={pTotRen} />
              </CardContent>
            </Card>

            {/* Table structure reference */}
            <Card variant="outlined">
              <CardHeader
                title="Estructura de tablas"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'Dim (ren×col)', 'Coord (ox+, oy−)', 'Contenido'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 6px', textAlign: 'left', fontWeight: 'bold', fontSize: 10 }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      ['tbl_general',    '1×1',  '0, 0',        '185×250 mm — marco exterior'],
                      ['tbl_1',          '1×1',  '+150, 0',     '11×155 mm — tipo plano, sin bordes'],
                      ['tbl_2',          '1×1',  '+11, −11',    '11×155 mm — nombre_enlace'],
                      ['tbl_3',          '8×2',  '+380, −220',  '8×8mm rows, 51+53 cols — datos admin'],
                      ['tbl_logo_imtsa', '1×1',  '+11, −940',   '48×51 mm — logo empresa proyecta'],
                      ['tbl_4',          '8×1',  '+521, −940',  '8×8mm rows, 53 col — datos proyecto'],
                      ['tbl_logo_telmex','2×1',  '+1051, −940', '48×51 mm — logo empresa revisa'],
                      ['tbl_5',          '2×1',  '+11, −1420',  '8+8mm rows, 51 col — CABLES'],
                      ['tbl_6',          '2×1',  '+1051, −1420','8+8mm rows, 51 col — Vo.Bo.'],
                      ['tbl_7',          '1×5',  '+11, −1580',  '8mm row, 95+4×15 cols — HOJA/DE'],
                      ['tbl_8',          'dyn×5','+11, −1660',  '8mm rows, 5×31 cols — PEPs (Fase 5)'],
                    ].map(([nombre, dim, coord, desc], i) => (
                      <Box component="tr" key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '2px 6px', color: 'primary.main' }}>{nombre}</Box>
                        <Box component="td" sx={{ p: '2px 6px' }}>{dim}</Box>
                        <Box component="td" sx={{ p: '2px 6px', color: 'text.secondary' }}>{coord}</Box>
                        <Box component="td" sx={{ p: '2px 6px' }}>{desc}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* PEP constants */}
            <Card variant="outlined">
              <CardHeader
                title="Constantes tipos_peps (filtrar_campos_x_proyecto)"
                subheader="Se usa la lista según el nombre del proyecto (BA_*, FTTB_*, o default)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <PepList label="tipos_peps_fibra (default)" fields={TIPOS_PEPS_FIBRA} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <PepList label='tipos_peps_ba (BA_*)' fields={TIPOS_PEPS_BA} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <PepList label='tipos_peps_fttb (FTTB_*)' fields={TIPOS_PEPS_FTTB} />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  <strong>Fase 5:</strong> <code>filtrar_campos_x_proyecto()</code> cruza estas listas con
                  los campos físicos del dataset GIS del proyecto para obtener los campos PEP válidos.
                  <code>crea_tabla_peps()</code> crea tbl_8 con tantas filas como OEs existan en el diseño.
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}
