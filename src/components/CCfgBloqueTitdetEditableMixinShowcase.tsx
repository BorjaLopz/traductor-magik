import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip,
  Grid, Stack, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material'
import {
  CCfgBloqueTitdetEditable,
  TablaBordesImpl,
  type Lado,
  LADOS,
} from '../models/CCfgBloqueTitdetEditableMixin'

// ─── Snapshot helpers ────────────────────────────────────────────────────────

type Snap = Record<string, boolean> // key: "ren,col,lado"

function toSnap(tbl: TablaBordesImpl): Snap {
  const s: Snap = {}
  for (let r = 1; r <= tbl.totalRenglones; r++)
    for (let c = 1; c <= tbl.totalColumnas; c++)
      for (const lado of LADOS)
        s[`${r},${c},${lado}`] = tbl.getBordeCelda(r, c, lado)
  return s
}

function gb(snap: Snap, r: number, c: number, lado: Lado): boolean {
  return snap[`${r},${c},${lado}`] ?? false
}

// ─── Constantes de configuración ─────────────────────────────────────────────

const MIXIN = new CCfgBloqueTitdetEditable()
const TABLA_ROWS: Record<string, number> = { titulo: 3, detalle: 5 }
const TABLA_COLS = 6

// Colores por columna para cfg_tbl_detalle
const COL_COLOR: Record<number, string> = {
  1: '#f3f3f3', 2: '#f3f3f3',
  3: '#e8f5e9', 4: '#e8f5e9', 5: '#fff9c4', 6: '#e8f5e9',
}

// ─── Componente celda ────────────────────────────────────────────────────────

function Celda({
  sup, inf, izq, der,
  before, changed, colColor,
  label,
}: {
  sup: boolean; inf: boolean; izq: boolean; der: boolean
  before?: { sup: boolean; inf: boolean; izq: boolean; der: boolean }
  changed?: boolean
  colColor?: string
  label?: string
}) {
  const borde = (activo: boolean, ladoKey: Lado): string => {
    const wasOn = before ? before[ladoKey === 'superior' ? 'sup' : ladoKey === 'inferior' ? 'inf' : ladoKey === 'izquierda' ? 'izq' : 'der'] : activo
    if (activo && !wasOn) return '2.5px solid #1976d2'  // activado (azul)
    if (!activo && wasOn) return '2px dashed #e53935'   // apagado (rojo punteado)
    return activo ? '2px solid #424242' : '1px dotted #ccc'
  }
  return (
    <Box sx={{
      width: 44, height: 28,
      borderTop:    borde(sup, 'superior'),
      borderBottom: borde(inf, 'inferior'),
      borderLeft:   borde(izq, 'izquierda'),
      borderRight:  borde(der, 'derecha'),
      backgroundColor: changed ? colColor ?? '#fffde7' : 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8, color: '#999', userSelect: 'none',
      transition: 'all 0.15s',
    }}>
      {label}
    </Box>
  )
}

// ─── Componente grilla ───────────────────────────────────────────────────────

function TableGrid({
  snap, before, rows, cols, showCoords,
}: {
  snap: Snap
  before?: Snap
  rows: number
  cols: number
  showCoords?: boolean
}) {
  return (
    <Box>
      {showCoords && (
        <Box sx={{ display: 'flex', ml: '18px', mb: '2px' }}>
          {Array.from({ length: cols }, (_, c) => (
            <Box key={c} sx={{ width: 44, textAlign: 'center', fontSize: 9, color: 'text.disabled' }}>
              c{c + 1}
            </Box>
          ))}
        </Box>
      )}
      {Array.from({ length: rows }, (_, r) => (
        <Box key={r} sx={{ display: 'flex', alignItems: 'center' }}>
          {showCoords && (
            <Box sx={{ width: 18, fontSize: 9, color: 'text.disabled', textAlign: 'right', pr: '2px' }}>
              r{r + 1}
            </Box>
          )}
          {Array.from({ length: cols }, (_, c) => {
            const ren = r + 1; const col = c + 1
            const changed = before
              ? LADOS.some(l => gb(snap, ren, col, l) !== gb(before, ren, col, l))
              : false
            const bef = before ? {
              sup: gb(before, ren, col, 'superior'),
              inf: gb(before, ren, col, 'inferior'),
              izq: gb(before, ren, col, 'izquierda'),
              der: gb(before, ren, col, 'derecha'),
            } : undefined
            return (
              <Tooltip
                key={c}
                title={
                  <Box sx={{ fontSize: 10 }}>
                    <div>sup: {gb(snap, ren, col, 'superior') ? '✓' : '✗'}</div>
                    <div>inf: {gb(snap, ren, col, 'inferior') ? '✓' : '✗'}</div>
                    <div>izq: {gb(snap, ren, col, 'izquierda') ? '✓' : '✗'}</div>
                    <div>der: {gb(snap, ren, col, 'derecha') ? '✓' : '✗'}</div>
                  </Box>
                }
              >
                <Box component="span">
                  <Celda
                    sup={gb(snap, ren, col, 'superior')}
                    inf={gb(snap, ren, col, 'inferior')}
                    izq={gb(snap, ren, col, 'izquierda')}
                    der={gb(snap, ren, col, 'derecha')}
                    before={bef}
                    changed={changed}
                    colColor={COL_COLOR[col]}
                    label={`${ren},${col}`}
                  />
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}

// ─── Showcase principal ───────────────────────────────────────────────────────

export function CCfgBloqueTitdetEditableMixinShowcase() {
  const [mode, setMode] = useState<'titulo' | 'detalle'>('titulo')

  const rows = TABLA_ROWS[mode]

  const snapBefore = useMemo(() => {
    const tbl = new TablaBordesImpl(rows, TABLA_COLS, true)
    return toSnap(tbl)
  }, [rows])

  const snapAfter = useMemo(() => {
    const tbl = new TablaBordesImpl(rows, TABLA_COLS, true)
    if (mode === 'titulo') {
      MIXIN.cfgTblTitulo(tbl)
    } else {
      MIXIN.cfgTblDetalle(tbl)
    }
    return toSnap(tbl)
  }, [mode, rows])

  // Cuenta bordes modificados
  const cambios = useMemo(() => {
    let apagados = 0; let encendidos = 0
    for (const key of Object.keys(snapBefore)) {
      if (snapBefore[key] && !snapAfter[key]) apagados++
      if (!snapBefore[key] && snapAfter[key]) encendidos++
    }
    return { apagados, encendidos }
  }, [snapBefore, snapAfter])

  const metodosLlamados = mode === 'titulo'
    ? [
        { nombre: 'apagaBordesInfSupDeTodosRensEnCols', args: 'cols {1,2,totCols-1,totCols}', efecto: 'sup+inf → false en columnas externas' },
        { nombre: 'apagaBordesAModoEnContornoSup', args: '—', efecto: 'patrón fijo fila 1, cols 1-5' },
        { nombre: 'apagaBordesAModoEnContornoInf', args: '—', efecto: 'patrón fijo fila 3, col 3' },
      ]
    : [
        { nombre: 'apagaBordesInfSupDeTodosRensEnCols', args: 'cols {1,2,totCols-1,totCols}', efecto: 'sup+inf → false en columnas externas' },
        { nombre: 'apagaTodosLosBordesDeTodosRensEnCols', args: 'cols {3,4,5,6}', efecto: 'limpia los 4 bordes de zona interior' },
        { nombre: 'prendeBordesDeDetalle', args: 'cols {3,4,5,6}', efecto: 'borde exterior del rectángulo interior' },
        { nombre: 'prendeLineasDeCeldasEditables', args: 'cols {5}', efecto: 'inferior → true en filas 2..totRens-1 de col 5' },
      ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CCfgBloqueTitdetEditableMixin
        <Chip label="Fase 1 · SIMPLE" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/c_cfg_bloque_titdet_editable_mixin.magik</code>
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        Mixin sin estado que configura los bordes de celdas en las tablas de título y detalle
        de un bloque editable. <code>def_mixin</code> → función mixin de TypeScript.
        Hover sobre cada celda para ver el estado de sus 4 bordes.
      </Typography>

      <Grid container spacing={3}>

        {/* ─── Selector de modo ──────────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, v) => v && setMode(v)}
              size="small"
            >
              <ToggleButton value="titulo">
                cfg_tbl_titulo (3×6)
              </ToggleButton>
              <ToggleButton value="detalle">
                cfg_tbl_detalle (5×6)
              </ToggleButton>
            </ToggleButtonGroup>
            <Chip label={`${cambios.apagados} bordes apagados`} size="small" color="error" variant="outlined" />
            <Chip label={`${cambios.encendidos} bordes encendidos`} size="small" color="primary" variant="outlined" />
          </Stack>
        </Grid>

        {/* ─── Comparativa antes / después ───────────────────────────────── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Antes — TablaBordesImpl(todos activos)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader="Todos los bordes = true (estado inicial)"
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <TableGrid snap={snapBefore} rows={rows} cols={TABLA_COLS} showCoords />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title={`Después — ${mode === 'titulo' ? 'cfgTblTitulo()' : 'cfgTblDetalle()'}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader={
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.3, mt: 0.3 }}>
                  <Box component="span" sx={{ fontSize: 11, color: '#1976d2', fontWeight: 700 }}>━</Box>
                  <Typography variant="caption">activado</Typography>
                  <Box component="span" sx={{ fontSize: 11, color: '#e53935', fontWeight: 700 }}>┅</Box>
                  <Typography variant="caption">apagado</Typography>
                  <Box component="span" sx={{ fontSize: 11, color: '#424242', fontWeight: 700 }}>━</Box>
                  <Typography variant="caption">sin cambio activo</Typography>
                  <Box component="span" sx={{ fontSize: 11, color: '#ccc' }}>┄</Box>
                  <Typography variant="caption">sin cambio inactivo</Typography>
                </Stack>
              }
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <TableGrid snap={snapAfter} before={snapBefore} rows={rows} cols={TABLA_COLS} showCoords />
              {mode === 'detalle' && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip label="cols 1-2: externos" size="small" sx={{ fontSize: 10, bgcolor: '#f3f3f3' }} />
                  <Chip label="cols 3-4,6: interior" size="small" sx={{ fontSize: 10, bgcolor: '#e8f5e9' }} />
                  <Chip label="col 5: editable" size="small" sx={{ fontSize: 10, bgcolor: '#fff9c4' }} />
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Secuencia de métodos ───────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title={`Secuencia de llamadas en ${mode === 'titulo' ? 'cfgTblTitulo()' : 'cfgTblDetalle()'}`}
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1}>
                {metodosLlamados.map((m, i) => (
                  <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <Chip label={i + 1} size="small" sx={{ fontSize: 10, minWidth: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {m.nombre}
                        {m.args !== '—' && (
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                            {' '}({m.args})
                          </Box>
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {m.efecto}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Patrón mixin TypeScript ─────────────────────────────────────── */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardHeader
              title="Patrón mixin — uso en TypeScript"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                component="pre"
                sx={{
                  fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', p: 1.5, m: 0,
                  backgroundColor: 'grey.50', borderRadius: 1,
                  border: '1px solid', borderColor: 'divider',
                }}
              >
{`// Magik: def_mixin(:c_cfg_bloque_titdet_editable_mixin)
// TypeScript: función mixin factory

// 1. Mixin en una clase existente
class MiSello extends CCfgBloqueTitdetEditableMixin(ClaseBase) {
  configurar(tblTitulo: TablaBordes, tblDetalle: TablaBordes) {
    this.cfgTblTitulo(tblTitulo);
    this.cfgTblDetalle(tblDetalle);
  }
}

// 2. Uso standalone (este showcase)
const mixin = new CCfgBloqueTitdetEditable();
const tbl   = new TablaBordesImpl(5, 6);
mixin.cfgTblDetalle(tbl);`}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}
