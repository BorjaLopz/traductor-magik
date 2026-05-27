import { useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Slider, Stack, Typography,
} from '@mui/material'
import { COLORES_FIBRA } from '../models/CTablaEquivalencias'

// ─── Column header reference data ────────────────────────────────────────────

const HEADERS = [
  { col: 1, label: 'CTL.',         w: 8,  desc: 'Nombre central' },
  { col: 2, label: 'DISTRIB. SECC.', w: 18, desc: 'Piso / Sala / Fila / Bastidor del bastidor de inicio' },
  { col: 3, label: 'CABLE NO.',    w: 10, desc: 'Número de cable (user!_numero_cable)' },
  { col: 4, label: 'TUBO HOLGADO.',w: 13, desc: 'Número de grupo + nombre color tubo (COLORES_FIBRA[grupo])' },
  { col: 5, label: 'COLOR F.O.',   w: 13, desc: 'Color de fibra (COLORES_FIBRA[fibra])' },
  { col: 6, label: 'FIBRA',        w: 8,  desc: 'Número de fibra absoluto (1..capacidad_cable)' },
  { col: 7, label: 'FIBRA',        w: 8,  desc: 'Número de fibra dentro del grupo (1..numero_fibras)' },
  { col: 8, label: 'DTO.',         w: 13, desc: 'Distrito (fiber_owner_record.user!_distrito)' },
  { col: 9, label: 'FIBRA CTL.',   w: 8,  desc: 'Cuenta (fiber_owner_record.user!_cuenta)' },
]

// ─── Visual schematic ─────────────────────────────────────────────────────────

const SCALE = 0.55  // px per mm

interface TableBlock {
  x: number
  w: number
  label: string
  col: number
  rowLabel?: string
}

function TablaSchematic({ numGrupos, numeroFibras }: { numGrupos: number; numeroFibras: number }) {
  const cap = numGrupos * numeroFibras
  const HEADER_H  = 8 * SCALE
  const DATA_H    = cap * 5 * SCALE

  const blocks: TableBlock[] = [
    { x: 0,   w: 8,  label: 'CTL.',          col: 1 },
    { x: 80,  w: 18, label: 'DIST. SECC.',   col: 2 },
    { x: 260, w: 10, label: 'CABLE NO.',     col: 3 },
    { x: 360, w: 13, label: 'TUBO HOLGADO.', col: 4, rowLabel: `${numGrupos} grupos × ${numeroFibras}f` },
    { x: 490, w: 13, label: 'COLOR F.O.',    col: 5 },
    { x: 620, w: 8,  label: 'FIBRA',         col: 6 },
    { x: 700, w: 8,  label: 'FIBRA',         col: 7 },
    { x: 780, w: 13, label: 'DTO.',           col: 8 },
    { x: 910, w: 8,  label: 'FIBRA CTL.',    col: 9 },
  ]

  const totalW = (910 + 8) * SCALE

  return (
    <Box sx={{ overflowX: 'auto' }}>
      {/* tbl_1 header */}
      <Box sx={{
        width: 99 * SCALE, height: 18 * SCALE,
        border: '1.5px solid #555', bgcolor: '#e3f2fd', mb: 0.5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }}>
          TABLA DE EQUIVALENCIAS
        </Typography>
      </Box>

      {/* tbl_2 header row */}
      <Box sx={{ display: 'flex', width: totalW, border: '1.5px solid #555', borderBottom: 'none', mb: 0 }}>
        {blocks.map(b => (
          <Box key={b.col} sx={{
            width: b.w * SCALE,
            height: HEADER_H,
            borderRight: '1px solid #555',
            bgcolor: '#e3f2fd',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            '&:last-child': { borderRight: 'none' },
          }}>
            <Typography sx={{ fontSize: 7, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2, px: 0.3 }}>
              {b.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* data columns */}
      <Box sx={{ display: 'flex', width: totalW, border: '1.5px solid #555' }}>
        {blocks.map(b => (
          <Box key={b.col} sx={{
            width: b.w * SCALE,
            height: DATA_H,
            borderRight: '1px solid #aaa',
            bgcolor: b.col === 4 ? '#fff3e0' : '#fafafa',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            '&:last-child': { borderRight: 'none' },
          }}>
            {b.rowLabel && (
              <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: 'text.secondary', writing: 'vertical-rl', textAlign: 'center' }}>
                {b.rowLabel}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        tbl_2 inicia en (ox, oy−180) · tbl_3..tbl_11 inician en (ox+X, oy−260) · escala {SCALE}×
        {cap > 0 && ` · capacidad_cable = ${cap}`}
      </Typography>
    </Box>
  )
}

// ─── Fiber color palette ──────────────────────────────────────────────────────

const PALETTE_CSS: Record<string, string> = {
  NATURAL:  '#f5f5dc',
  AZUL:     '#1565c0',
  AMARILLO: '#f9a825',
  ROJO:     '#c62828',
  VERDE:    '#2e7d32',
  NARANJA:  '#e65100',
  VIOLETA:  '#6a1b9a',
  CAFE:     '#4e342e',
  GRIS:     '#9e9e9e',
  NEGRO:    '#212121',
  ROSA:     '#e91e63',
  BLANCO:   '#eeeeee',
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CTablaEquivalenciasShowcase() {
  const [numGrupos,    setNumGrupos]    = useState(4)
  const [numeroFibras, setNumeroFibras] = useState(12)
  const cap = numGrupos * numeroFibras

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla_equivalencias
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends c_base_sello_fibra" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="dinámica por capacidad_cable" size="small" color="info" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/detalles_construccion/sellos/c_tabla_equivalencias.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Tabla de equivalencias fibra-distrito-cuenta para planos de detalles de construcción FO.
        Sin slots. El tamaño de la tabla depende de <code>capacidad_cable = num_de_grupos × numero_fibras</code>{' '}
        obtenido de GIS. Con datos: 11 tablas. Sin datos: solo tbl_1 y tbl_2.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: controls + schematic */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Dimensiones dinámicas"
                subheader={`capacidad_cable = ${numGrupos} × ${numeroFibras} = ${cap} fibras`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ px: 1 }}>
                  <Typography variant="caption">num_de_grupos: {numGrupos}</Typography>
                  <Slider
                    min={1} max={12} value={numGrupos}
                    onChange={(_, v) => setNumGrupos(v as number)}
                    marks step={1}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="caption">numero_fibras: {numeroFibras}</Typography>
                  <Slider
                    min={1} max={24} value={numeroFibras}
                    onChange={(_, v) => setNumeroFibras(v as number)}
                    marks={[1,2,4,6,8,12,24].map(v => ({ value: v }))}
                    step={null}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Esquema de tablas"
                subheader="Vista proporcional de tbl_2 + columnas de datos"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <TablaSchematic numGrupos={numGrupos} numeroFibras={numeroFibras} />
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: column reference + color palette + table sizes */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Columnas de tbl_2 (encabezado)"
                subheader="1 renglon × 9 columnas · alto 8 mm · inicio (ox, oy−180)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Col', 'Ancho', 'Etiqueta', 'Datos (Fase 5)'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {HEADERS.map(({ col, label, w, desc }) => (
                      <Box component="tr" key={col} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', color: 'primary.main' }}>{col}</Box>
                        <Box component="td" sx={{ p: '3px 8px' }}>{w} mm</Box>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold' }}>{label}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.secondary', fontSize: 10 }}>{desc}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={`COLORES_FIBRA — ${COLORES_FIBRA.length} colores`}
                subheader="Secuencia estándar para tubo holgado y fibra FO"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0.5 }}>
                  {COLORES_FIBRA.map((c, i) => (
                    <Box key={c} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{
                        width: 14, height: 14,
                        bgcolor: PALETTE_CSS[c] ?? '#ccc',
                        border: '1px solid #ccc',
                        borderRadius: 0.5,
                        flexShrink: 0,
                      }} />
                      <Typography sx={{ fontSize: 10, fontFamily: 'monospace' }}>
                        {i + 1}. {c}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Tablas de datos (tbl_3..tbl_11)"
                subheader={`${cap} renglones × 5 mm c/u = ${cap * 5} mm de altura`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Tabla', 'X offset', 'Ancho', 'Filas', 'Contenido'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { t: 'tbl_3',  x:   0, w:  8, filas: cap,         content: 'CTL. (nombre central, rotado 90°)' },
                      { t: 'tbl_4',  x:  80, w: 18, filas: cap,         content: 'PISO / SALA / FILA / BASTIDOR' },
                      { t: 'tbl_5',  x: 260, w: 10, filas: cap,         content: 'Número de cable' },
                      { t: 'tbl_6',  x: 360, w: 13, filas: numGrupos,   content: `${numGrupos} gpos × ${numeroFibras}f = num tubo + color` },
                      { t: 'tbl_7',  x: 490, w: 13, filas: cap,         content: 'Color fibra (COLORES_FIBRA[f])' },
                      { t: 'tbl_8',  x: 620, w:  8, filas: cap,         content: 'Fibra absoluta (1..capacidad)' },
                      { t: 'tbl_9',  x: 700, w:  8, filas: cap,         content: 'Fibra por grupo (1..num_fibras)' },
                      { t: 'tbl_10', x: 780, w: 13, filas: cap,         content: 'Distrito (fiber_owner_record)' },
                      { t: 'tbl_11', x: 910, w:  8, filas: cap,         content: 'Cuenta (fiber_owner_record)' },
                    ].map(({ t, x, w, filas, content }) => (
                      <Box component="tr" key={t} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '2px 8px', color: 'primary.main', fontWeight: 'bold' }}>{t}</Box>
                        <Box component="td" sx={{ p: '2px 8px' }}>+{x} mm</Box>
                        <Box component="td" sx={{ p: '2px 8px' }}>{w} mm</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: filas === cap ? 'text.primary' : 'warning.main' }}>{filas}</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: 'text.secondary', fontSize: 10 }}>{content}</Box>
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
