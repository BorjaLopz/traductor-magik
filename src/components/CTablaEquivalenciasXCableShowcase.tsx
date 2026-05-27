import { useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Grid,
  Slider, Stack, TextField, Typography,
} from '@mui/material'
import { COLORES_FIBRA } from '../models/CTablaEquivalencias'

// ─── Palette helper ──────────────────────────────────────────────────────────

const PALETTE_CSS: Record<string, string> = {
  NATURAL:  '#f5f5dc', AZUL:     '#1565c0', AMARILLO: '#f9a825',
  ROJO:     '#c62828', VERDE:    '#2e7d32', NARANJA:  '#e65100',
  VIOLETA:  '#6a1b9a', CAFE:     '#4e342e', GRIS:     '#9e9e9e',
  NEGRO:    '#212121', ROSA:     '#e91e63', BLANCO:   '#eeeeee',
}
const PALETTE_TEXT: Record<string, string> = {
  NATURAL: '#333', AZUL: '#fff', AMARILLO: '#333', ROJO: '#fff',
  VERDE: '#fff', NARANJA: '#fff', VIOLETA: '#fff', CAFE: '#fff',
  GRIS: '#333', NEGRO: '#fff', ROSA: '#fff', BLANCO: '#333',
}

// ─── tbl_1 preview ───────────────────────────────────────────────────────────

const SCALE = 3.2
const COL_W = 99 * SCALE

function Tbl1Preview({ nomCable, tipoCable }: { nomCable: string; tipoCable: string }) {
  const rows = [
    { h: 6, content: nomCable,                   bg: '#fff9c4', bold: true, pt: 14 },
    { h: 6, content: 'TABLA DE EQUIVALENCIAS',   bg: '#e3f2fd', bold: true, pt: 10 },
    { h: 6, content: tipoCable || '—',            bg: '#fff9c4', bold: false, pt: 11 },
  ]
  return (
    <Box sx={{ display: 'inline-block', border: '1.5px solid #555', fontFamily: 'monospace', width: COL_W }}>
      {rows.map(({ h, content, bg, bold, pt }, i) => (
        <Box key={i} sx={{
          height: h * SCALE, bgcolor: bg,
          borderBottom: i < 2 ? '1px solid #aaa' : 'none',
          display: 'flex', alignItems: 'center', px: 0.7,
        }}>
          <Typography sx={{ fontSize: pt, fontFamily: 'monospace', fontWeight: bold ? 'bold' : 'normal' }}>
            {content}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ─── tbl_6 group-color matrix ─────────────────────────────────────────────────

function Tbl6Preview({ numGrupos, numeroFibras }: { numGrupos: number; numeroFibras: number }) {
  const ROW_H = Math.max(18, numeroFibras * 5 * 0.5)
  return (
    <Box sx={{ display: 'inline-block', border: '1.5px solid #555', fontFamily: 'monospace' }}>
      {Array.from({ length: numGrupos }, (_, i) => {
        const g = i + 1
        const colorName = COLORES_FIBRA[(g - 1) % COLORES_FIBRA.length]
        const bg  = PALETTE_CSS[colorName]  ?? '#ccc'
        const fg  = PALETTE_TEXT[colorName] ?? '#000'
        return (
          <Box key={g} sx={{
            width: 13 * SCALE * 0.7,
            height: ROW_H,
            bgcolor: bg,
            borderBottom: i < numGrupos - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography sx={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold', color: fg, lineHeight: 1.2 }}>
              {g}
            </Typography>
            <Typography sx={{ fontSize: 7, fontFamily: 'monospace', color: fg, lineHeight: 1.2, textAlign: 'center' }}>
              {colorName}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

const DIFFS = [
  { aspect: 'Fuente de datos',  parent: 'obtenDatos() en draw time (GIS)',    child: 'Constructor — DatosCableXCable' },
  { aspect: 'Cell fill API',    parent: 'draw_vtext_transform (canvas)',       child: 'asignarTextoCelda() — mismo API que etiquetas' },
  { aspect: 'tbl_1 row 1',      parent: '— (vacío)',                          child: 'nom_cable = "CABLE_<siglas>_<no>"' },
  { aspect: 'tbl_1 row 3',      parent: '— (vacío)',                          child: 'tipo_cable = Locable.spec_id' },
  { aspect: 'tbl_3 tamaño',     parent: '30pt, rotado 90°',                   child: '40pt, rotado 90°' },
  { aspect: 'tbl_4 contenido',  parent: 'Cuatro draw_vtext separados (+y)',   child: 'Una celda multiline "PISO:…\\nSALA:…\\n…"' },
  { aspect: 'tbl_6 celda/gpo',  parent: 'Dos draws (número + color)',         child: 'Una celda "num\\ncolor"' },
  { aspect: 'Bay origen',       parent: 'l_pin_inicio.strw_connect_point',    child: '.loRme (pre-inyectado)' },
]

export function CTablaEquivalenciasXCableShowcase() {
  const [siglasCentral, setSiglasCentral] = useState('CTL1')
  const [central,       setCentral]       = useState('CENTRAL PERALVILLO')
  const [cableNo,       setCableNo]       = useState('C-0042')
  const [tipoCable,     setTipoCable]     = useState('FO-72F-G652D')
  const [piso,          setPiso]          = useState('P2')
  const [sala,          setSala]          = useState('SALA-A')
  const [fila,          setFila]          = useState('F03')
  const [bastidor,      setBastidor]      = useState('B12')
  const [numGrupos,     setNumGrupos]     = useState(6)
  const [numeroFibras,  setNumeroFibras]  = useState(12)

  const cap     = numGrupos * numeroFibras
  const nomCable = siglasCentral
    ? `CABLE_${siglasCentral}_${cableNo}`
    : `CABLE_____${cableNo}`

  const bastInfo = `PISO:${piso}  SALA:${sala}  FILA:${fila}  BASTIDOR:${bastidor}`

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_tabla_equivalencias_x_cable
        <Chip label="Fase 5 · COMPLEJO" size="small" sx={{ ml: 1.5 }} color="warning" />
        <Chip label="extends CTablaEquivalencias" size="small" variant="outlined" sx={{ ml: 1 }} />
        <Chip label="datos pre-inyectados" size="small" color="success" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>planos_fo/source/ruta_cables/sellos/c_tabla_equivalencias_x_cable.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
        Variante de <code>c_tabla_equivalencias</code> donde los datos del cable se reciben en el constructor
        (no se obtienen de GIS en <code>draw_content_on</code>). Usa <code>asigna_texto_celda()</code>
        para llenar celdas — mismo mecanismo que las etiquetas estáticas. Misma estructura de 11 tablas.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1, alignItems: 'flex-start' }}>

        {/* Left: inputs + previews */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="DatosCableXCable — constructor"
                subheader="Simulación de los parámetros que llegan vía new_with(PoDatos)"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <TextField size="small" fullWidth label="siglas central"
                      value={siglasCentral} onChange={e => setSiglasCentral(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField size="small" fullWidth label="nombre central"
                      value={central} onChange={e => setCentral(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField size="small" fullWidth label="cable_no"
                      value={cableNo} onChange={e => setCableNo(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField size="small" fullWidth label="tipo cable (spec_id)"
                      value={tipoCable} onChange={e => setTipoCable(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField size="small" fullWidth label="piso"
                      value={piso} onChange={e => setPiso(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField size="small" fullWidth label="sala"
                      value={sala} onChange={e => setSala(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField size="small" fullWidth label="fila"
                      value={fila} onChange={e => setFila(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <TextField size="small" fullWidth label="bastidor"
                      value={bastidor} onChange={e => setBastidor(e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption">num_de_grupos: {numGrupos}</Typography>
                    <Slider min={1} max={12} value={numGrupos}
                      onChange={(_, v) => setNumGrupos(v as number)} marks step={1} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption">numero_fibras: {numeroFibras} → cap={cap}</Typography>
                    <Slider min={1} max={24} value={numeroFibras}
                      onChange={(_, v) => setNumeroFibras(v as number)}
                      marks={[1,2,4,6,8,12,24].map(v => ({ value: v }))} step={null} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Vista previa tbl_1 (3×1, col=99mm)"
                subheader={`escala ${SCALE}× · fila 1 = nom_cable · fila 2 = header · fila 3 = tipo_cable`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Tbl1Preview nomCable={nomCable} tipoCable={tipoCable} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Contenido de tbl_4 (bastidor): <code style={{ fontSize: 10 }}>{bastInfo}</code>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                  tbl_3 (CTL): <strong>{central || '—'}</strong> · 40pt · rotado 90°
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title={`tbl_6 — ${numGrupos} grupos (tubo holgado + color)`}
                subheader={`${numGrupos} renglones × ${numeroFibras}×5mm = cada renglon ${numeroFibras * 5}mm alto`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Tbl6Preview numGrupos={numGrupos} numeroFibras={numeroFibras} />
                  <Box>
                    <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>
                      Cada celda = "{`"num\\ncolor"`}"<br />
                      ej. "1\nNATURAL", "2\nAZUL"…
                    </Typography>
                    <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary', mt: 1 }}>
                      20pt · sin alineación explícita
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* Right: diff table + structure reference */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>

            <Card variant="outlined">
              <CardHeader
                title="Diferencias vs c_tabla_equivalencias"
                titleTypographyProps={{ variant: 'subtitle2' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Aspecto', 'c_tabla_equivalencias', 'x_cable'].map(h => (
                        <Box component="th" key={h} sx={{ p: '4px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {DIFFS.map(({ aspect, parent, child }) => (
                      <Box component="tr" key={aspect} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '3px 8px', fontWeight: 'bold', color: 'text.secondary' }}>{aspect}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'text.disabled', fontSize: 10 }}>{parent}</Box>
                        <Box component="td" sx={{ p: '3px 8px', color: 'success.main', fontSize: 10 }}>{child}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Slots (campos de instancia)"
                subheader="9 slots poblados en new_with(PoDatos) antes de llamar a super.new_with()"
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Magik slot', 'TypeScript', 'Origen en PoDatos'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {[
                      { slot: 'LoCable',         ts: 'loCable: unknown',        key: ':Locable' },
                      { slot: 'LoRme',            ts: 'loRme: unknown',          key: ':rme' },
                      { slot: 'LoCableObjeto',    ts: 'loCableObjeto: unknown',  key: 'c_cable_fo.new(LoCable)' },
                      { slot: 'central',          ts: 'central: string',         key: ':central' },
                      { slot: 'piso',             ts: 'piso: string',            key: ':piso' },
                      { slot: 'sala',             ts: 'sala: string',            key: ':sala' },
                      { slot: 'fila',             ts: 'fila: string',            key: ':fila' },
                      { slot: 'bastidor',         ts: 'bastidor: string',        key: ':bastidor' },
                      { slot: 'num_de_grupos',    ts: 'numGrupos: number',       key: ':num_de_grupos' },
                      { slot: 'numero_fibras',    ts: 'numeroFibras: number',    key: ':numero_fibras' },
                      { slot: 'capacidad_cable',  ts: 'get capacidadCable()',    key: ':capacidad_cable' },
                    ].map(({ slot, ts, key }) => (
                      <Box component="tr" key={slot} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box component="td" sx={{ p: '2px 8px', color: 'primary.main' }}>{slot}</Box>
                        <Box component="td" sx={{ p: '2px 8px' }}>{ts}</Box>
                        <Box component="td" sx={{ p: '2px 8px', color: 'text.secondary', fontSize: 10 }}>{key}</Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader
                title="Contenido de tbl_7..tbl_9 (primera fila simulada)"
                subheader={`${cap} renglones × 5mm cada uno — indexados 1..capacidad_cable`}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheaderTypographyProps={{ variant: 'caption' }}
              />
              <CardContent sx={{ pt: 0 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      {['Fibra abs.', 'tbl_7 COLOR F.O.', 'tbl_8 FIBRA', 'tbl_9 FIBRA/gpo'].map(h => (
                        <Box component="th" key={h} sx={{ p: '3px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {Array.from({ length: Math.min(cap, 12) }, (_, absIdx) => {
                      const absF    = absIdx + 1
                      const grpIdx  = Math.floor(absIdx / numeroFibras)
                      const fInGrp  = (absIdx % numeroFibras) + 1
                      const color   = COLORES_FIBRA[fInGrp - 1] ?? '?'
                      const bg      = PALETTE_CSS[color] ?? '#ccc'
                      return (
                        <Box component="tr" key={absF} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                          <Box component="td" sx={{ p: '2px 8px', color: 'text.disabled' }}>{absF}</Box>
                          <Box component="td" sx={{ p: '2px 8px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 10, height: 10, bgcolor: bg, border: '1px solid #ccc', borderRadius: 0.5, flexShrink: 0 }} />
                              <span>{color}</span>
                              <Typography component="span" sx={{ fontSize: 9, color: 'text.disabled', ml: 0.5 }}>
                                (gpo {grpIdx + 1})
                              </Typography>
                            </Box>
                          </Box>
                          <Box component="td" sx={{ p: '2px 8px' }}>{absF}</Box>
                          <Box component="td" sx={{ p: '2px 8px', color: 'primary.main' }}>{fInGrp}</Box>
                        </Box>
                      )
                    })}
                    {cap > 12 && (
                      <Box component="tr">
                        <Box component="td" colSpan={4} sx={{ p: '3px 8px', color: 'text.disabled', fontStyle: 'italic' }}>
                          … {cap - 12} filas más
                        </Box>
                      </Box>
                    )}
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
