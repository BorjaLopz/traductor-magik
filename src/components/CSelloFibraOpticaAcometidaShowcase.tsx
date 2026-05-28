import { useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, MenuItem, Select, Slider, Stack, TextField, Typography,
} from '@mui/material'
import {
  CSelloFibraOpticaAcometida,
  TABLE_LAYOUT, SELLO_WIDTH_MM, SELLO_HEIGHT_MM,
  LABELS_DIVISION, LABELS_POBLACION, LABELS_ENLACE,
  LABELS_OPERL, LABELS_OPERR, LABELS_APROBO,
  COLORED_CELLS, ENUM_EMPRESAR, ENUM_EMPRESAP,
  resolveEmpresa, DEFAULT_ATTRIBS,
} from '../models/CSelloFibraOpticaAcometida'
import type { SelloFibraAcometidaAttribs, EmpresaRevisora, EmpresaProyectista } from '../models/CSelloFibraOpticaAcometida'

// ─── SVG sello renderer ───────────────────────────────────────────────────────

type CellContent = { label?: string; value?: string; bold?: boolean; colored?: boolean; center?: boolean }

function buildCellMap(a: SelloFibraAcometidaAttribs): Map<string, CellContent> {
  const m = new Map<string, CellContent>()
  const k = (t: string, r: number, c: number) => `${t}:${r}:${c}`

  const { nombre } = resolveEmpresa(a.empreviso)

  // tbl_Empresa
  m.set(k('tbl_Empresa',   1, 1), { label: a.empreviso ?? 'LOGO', center: true })
  m.set(k('tbl_Empresa',   1, 2), { label: nombre, center: true })

  // tbl_Proyecto
  m.set(k('tbl_Proyecto',  1, 1), { label: 'PROYECTO DE FIBRA OPTICA', center: true })

  // tbl_division
  LABELS_DIVISION.forEach((lbl, i) => {
    m.set(k('tbl_division', i + 1, 1), { label: lbl })
    const vals = [a.sot, a.direccionSot, a.telefono, a.responsableArea]
    m.set(k('tbl_division', i + 1, 2), { value: vals[i] ?? '' })
  })

  // tbl_enlace (labels at cols 1,3,5; values at cols 2,4,6)
  const enlaceVals = [a.enlace, a.anillo, a.pess]
  LABELS_ENLACE.forEach((lbl, i) => {
    m.set(k('tbl_enlace', 1, i * 2 + 1), { label: lbl })
    m.set(k('tbl_enlace', 1, i * 2 + 2), { value: enlaceVals[i] ?? '', bold: true })
  })

  // tbl_poblacion
  LABELS_POBLACION.forEach((lbl, i) => {
    m.set(k('tbl_poblacion', i + 1, 1), { label: lbl })
    const vals = [a.usuario, a.direccionUser, a.coloniaCp, a.municipio, a.central]
    m.set(k('tbl_poblacion', i + 1, 2), { value: vals[i] ?? '' })
  })

  // tbl_Operacion
  LABELS_OPERL.forEach((lbl, i) => {
    m.set(k('tbl_Operacion', i + 1, 1), { label: lbl })
    const vals = [a.pep, a.opb, a.oePep]
    m.set(k('tbl_Operacion', i + 1, 2), { value: vals[i] ?? '', colored: true, bold: true })
  })
  LABELS_OPERR.forEach((lbl, i) => {
    m.set(k('tbl_Operacion', i + 1, 3), { label: lbl })
    const vals = [a.refSisa, a.oei, a.oeRef]
    m.set(k('tbl_Operacion', i + 1, 4), { value: vals[i] ?? '', colored: true, bold: true })
  })

  // tbl_PlanoNum
  m.set(k('tbl_PlanoNum', 1, 1), { label: 'PLANO No.' })
  m.set(k('tbl_PlanoNum', 1, 2), { value: a.plano ?? '', bold: true })
  m.set(k('tbl_PlanoNum', 1, 3), { label: 'DE' })

  // tbl_EscalaRuta
  m.set(k('tbl_EscalaRuta', 1, 1), { label: 'ESCALA' })
  m.set(k('tbl_EscalaRuta', 1, 2), { value: a.escala ?? '', bold: true })

  // tbl_Aprobo
  LABELS_APROBO.forEach((lbl, i) => {
    m.set(k('tbl_Aprobo', i + 1, 1), { label: lbl })
  })
  m.set(k('tbl_Aprobo', 1, 2), { value: a.empreproy ?? '' })
  m.set(k('tbl_Aprobo', 2, 2), { value: a.empreviso ?? '' })
  m.set(k('tbl_Aprobo', 2, 3), { label: 'FECHA' })
  m.set(k('tbl_Aprobo', 2, 4), { value: CSelloFibraOpticaAcometida.fechaElaboracion() })

  return m
}

const COLORED_SET = new Set(COLORED_CELLS.map(([t, r, c]) => `${t}:${r}:${c}`))

function SelloSvg({ attribs, scale }: { attribs: SelloFibraAcometidaAttribs; scale: number }) {
  const PAD  = 12
  const cells = buildCellMap(attribs)
  const colored = attribs.blancoNegro === 'SI' ? '#555' : '#c62828'

  const elements: React.ReactNode[] = []

  Object.entries(TABLE_LAYOUT).forEach(([name, def]) => {
    const { posX, posY, rowLens, colLens } = def
    let y = PAD + posY * scale

    for (let r = 1; r <= def.rows; r++) {
      const rh = rowLens[r] * scale
      let x = PAD + posX * scale

      for (let c = 1; c <= def.cols; c++) {
        const cw  = colLens[c] * scale
        const key = `${name}:${r}:${c}`
        const cell = cells.get(key)
        const isColored = COLORED_SET.has(key)

        const fill = name === 'tbl_MarcoSello'
          ? 'none'
          : isColored
            ? (attribs.blancoNegro === 'SI' ? '#eee' : '#ffebee')
            : '#fff'

        const strokeColor = name === 'tbl_MarcoSello' ? '#333' : '#aaa'
        const strokeW     = name === 'tbl_MarcoSello' ? 1.5 : 0.5

        elements.push(
          <rect key={`r-${key}`} x={x} y={y} width={cw} height={rh}
            fill={fill} stroke={strokeColor} strokeWidth={strokeW} />,
        )

        if (cell) {
          const text  = cell.label ?? cell.value ?? ''
          const isVal = cell.value !== undefined
          const fs    = Math.min(isVal ? 6.5 : 5.5, rh * 0.55)
          const fill  = isColored ? colored : isVal ? '#1a237e' : '#37474f'

          if (text.length > 0) {
            elements.push(
              <text key={`t-${key}`}
                x={cell.center ? x + cw / 2 : x + 2}
                y={y + rh / 2}
                fontSize={fs}
                fontFamily="monospace"
                fontWeight={cell.bold ? 700 : 400}
                textAnchor={cell.center ? 'middle' : 'start'}
                dominantBaseline="middle"
                fill={fill}>
                {text.length > 18 ? text.slice(0, 17) + '…' : text}
              </text>,
            )
          }
        }

        x += cw
      }
      y += rh
    }
  })

  const svgW = PAD * 2 + SELLO_WIDTH_MM  * scale
  const svgH = PAD * 2 + SELLO_HEIGHT_MM * scale

  return (
    <svg width={svgW} height={svgH}
      style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 4 }}>
      {elements}
      {/* Dimension labels */}
      <text x={PAD + SELLO_WIDTH_MM * scale / 2} y={PAD - 3}
        fontSize={8} fontFamily="monospace" textAnchor="middle" fill="#888">
        {SELLO_WIDTH_MM} mm
      </text>
      <text x={PAD - 3} y={PAD + SELLO_HEIGHT_MM * scale / 2}
        fontSize={8} fontFamily="monospace" textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90, ${PAD - 3}, ${PAD + SELLO_HEIGHT_MM * scale / 2})`} fill="#888">
        {SELLO_HEIGHT_MM} mm
      </text>
    </svg>
  )
}

// ─── Showcase ────────────────────────────────────────────────────────────────

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <TextField
      label={label} value={value} size="small" fullWidth
      onChange={e => onChange(e.target.value)}
      slotProps={{ htmlInput: { style: { fontSize: 10, fontFamily: 'monospace' } } }}
    />
  )
}

export function CSelloFibraOpticaAcometidaShowcase() {
  const [attribs, setAttribs] = useState<SelloFibraAcometidaAttribs>({ ...DEFAULT_ATTRIBS })
  const [scale, setScale] = useState(2.4)

  const set = <K extends keyof SelloFibraAcometidaAttribs>(k: K, v: SelloFibraAcometidaAttribs[K]) =>
    setAttribs(prev => ({ ...prev, [k]: v }))

  const str = (k: keyof SelloFibraAcometidaAttribs) => (attribs[k] as string | undefined) ?? ''

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CSelloFibraOpticaAcometida
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="error" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_sello_fibra_optica_acometida.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Extiende <code>c_base_sello_fibra</code> · 10 tablas · 25 atributos · marco 210×200 mm
      </Typography>

      <Grid container spacing={3}>

        {/* ── Left: controls ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader title="Empresa" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_Empresa — logo + nombre" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">empreviso (empresa que revisa)</Typography>
                    <Select value={attribs.empreviso ?? ''} size="small" fullWidth displayEmpty
                      onChange={e => set('empreviso', (e.target.value as EmpresaRevisora) || undefined)}>
                      <MenuItem value="">(ninguna → TELMEX)</MenuItem>
                      {ENUM_EMPRESAR.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">empreproy (empresa que proyecta)</Typography>
                    <Select value={attribs.empreproy ?? ''} size="small" fullWidth displayEmpty
                      onChange={e => set('empreproy', (e.target.value as EmpresaProyectista) || undefined)}>
                      <MenuItem value="">(ninguna)</MenuItem>
                      {ENUM_EMPRESAP.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                    </Select>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">blanco_negro</Typography>
                    <Select value={attribs.blancoNegro} size="small" fullWidth
                      onChange={e => set('blancoNegro', e.target.value as 'SI' | 'NO')}>
                      <MenuItem value="NO">NO (color)</MenuItem>
                      <MenuItem value="SI">SI (B&N)</MenuItem>
                    </Select>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="División / SOT" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_division" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field label="SOT"          value={str('sot')}             onChange={v => set('sot', v)} />
                  <Field label="Dirección SOT" value={str('direccionSot')}   onChange={v => set('direccionSot', v)} />
                  <Field label="Teléfono"      value={str('telefono')}       onChange={v => set('telefono', v)} />
                  <Field label="Responsable"   value={str('responsableArea')} onChange={v => set('responsableArea', v)} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Enlace" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_enlace" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field label="Enlace" value={str('enlace')} onChange={v => set('enlace', v)} />
                  <Field label="Anillo" value={str('anillo')} onChange={v => set('anillo', v)} />
                  <Field label="PESS"   value={str('pess')}   onChange={v => set('pess', v)} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Población / Usuario" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_poblacion" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field label="Usuario"      value={str('usuario')}      onChange={v => set('usuario', v)} />
                  <Field label="Dirección"    value={str('direccionUser')} onChange={v => set('direccionUser', v)} />
                  <Field label="Colonia y CP" value={str('coloniaCp')}    onChange={v => set('coloniaCp', v)} />
                  <Field label="Del./Mpio."   value={str('municipio')}    onChange={v => set('municipio', v)} />
                  <Field label="Central"      value={str('central')}      onChange={v => set('central', v)} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Operación" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_Operacion — celdas coloreadas rojo" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field label="PEP"      value={str('pep')}     onChange={v => set('pep', v)} />
                  <Field label="OPB"      value={str('opb')}     onChange={v => set('opb', v)} />
                  <Field label="OE PEP"   value={str('oePep')}   onChange={v => set('oePep', v)} />
                  <Field label="REF SISA" value={str('refSisa')} onChange={v => set('refSisa', v)} />
                  <Field label="OEI"      value={str('oei')}     onChange={v => set('oei', v)} />
                  <Field label="OE REF"   value={str('oeRef')}   onChange={v => set('oeRef', v)} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Plano / Escala" titleTypographyProps={{ variant: 'subtitle2' }}
                subheader="tbl_PlanoNum + tbl_EscalaRuta" subheaderTypographyProps={{ variant: 'caption' }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field label="Plano No." value={str('plano')}  onChange={v => set('plano', v)} />
                  <Field label="Escala"    value={str('escala')} onChange={v => set('escala', v)} />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader title="Escala SVG" titleTypographyProps={{ variant: 'subtitle2' }} />
              <CardContent sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {scale.toFixed(1)} px/mm
                </Typography>
                <Slider min={1.2} max={4} step={0.2} value={scale}
                  onChange={(_, v) => setScale(v as number)} size="small" />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* ── Right: SVG preview ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardHeader
              title="Sello completo — draw_content_on"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader={`210×200 mm · 10 tablas posicionadas absolutamente · celdas rojas = tbl_Operacion cols 2/4`}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 680 }}>
                <SelloSvg attribs={attribs} scale={scale} />
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '12px !important' }}>
              <Stack spacing={1}>
                <Box sx={{ fontFamily: 'monospace', fontSize: 10,
                  bgcolor: 'action.hover', p: 1, borderRadius: 1,
                  display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: '2px 10px', justifyContent: 'start' }}>
                  {[
                    ['tbl_MarcoSello',  '1×1',  '200×210'],
                    ['tbl_Empresa',     '1×2',  '30×175'],
                    ['tbl_division',    '4×2',  '28×120'],
                    ['tbl_Proyecto',    '1×1',  '10×175'],
                    ['tbl_enlace',      '1×6',  '7×175'],
                    ['tbl_poblacion',   '5×2',  '35×120'],
                    ['tbl_Operacion',   '3×4',  '30×120'],
                    ['tbl_PlanoNum',    '1×3',  '10×97'],
                    ['tbl_EscalaRuta',  '1×4',  '10×95'],
                    ['tbl_Aprobo',      '2×4',  '20×200'],
                  ].map(([n, dim, sz]) => [
                    <Chip key={`${n}c`} label={n} size="small" sx={{ fontFamily: 'monospace', fontSize: 8, height: 16 }} />,
                    <Typography key={`${n}d`} variant="caption" color="text.secondary">{dim}</Typography>,
                    <Typography key={`${n}s`} variant="caption" color="text.secondary">{sz} mm</Typography>,
                  ])}
                </Box>

                <Divider />

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label="CBaseSelloFibra" size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                  <Typography variant="caption" color="text.secondary">→</Typography>
                  <Chip label="CSelloFibraOpticaAcometida" size="small" color="error" sx={{ fontFamily: 'monospace' }} />
                  <Typography variant="caption" color="text.secondary">
                    25 attribs · obten_registros / llena_datos_celdas → Fase 5
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
