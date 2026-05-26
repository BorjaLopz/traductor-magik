import { useMemo } from 'react'
import { Box, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { CSelloReconcentracion } from '../models/CSelloReconcentracion'
import type { IBordesElemento, ICelda, ICeldas, IElementos, ITabla, ITablas } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure ───────────────────────────────────────────────────────

interface MockCell {
  texto: string | undefined
  bordeDer: boolean
}

class MockTabla implements ITabla {
  coordenadaOrigen: [number, number] = [0, 0]
  private _grid: MockCell[][]  // 1-indexed; [0] unused

  constructor(rows: number, cols: number) {
    this._grid = Array.from({ length: rows + 1 }, () =>
      Array.from({ length: cols + 1 }, () => ({ texto: undefined, bordeDer: true }))
    )
  }

  get renglones() {
    const lengths: number[] = []
    return { elemento: (_n: number) => ({ get longitud() { return lengths[_n] ?? 0 }, set longitud(v: number) { lengths[_n] = v } }) }
  }
  get columnas() {
    const lengths: number[] = []
    return { elemento: (_n: number) => ({ get longitud() { return lengths[_n] ?? 0 }, set longitud(v: number) { lengths[_n] = v } }) }
  }

  get celdas(): ICeldas {
    const grid = this._grid
    return {
      celda: (r: number, c: number): ICelda => {
        const cell = grid[r]?.[c] ?? { texto: undefined, bordeDer: true }
        const bordes: IBordesElemento = {
          get bordeDer() { return cell.bordeDer },
          set bordeDer(v: boolean) { cell.bordeDer = v },
          bordeIzq: true,
        }
        const elementos: IElementos = { obtenerElemento: (_tipo: string) => bordes }
        return {
          get elemento() { return cell.texto !== undefined ? new CTextoGrafico(cell.texto) : undefined },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) cell.texto = v.texto
          },
          elementos,
        }
      },
    }
  }

  getGrid(): MockCell[][] { return this._grid }
}

class MockTablas implements ITablas {
  private _tables = new Map<string, MockTabla>()

  crearTabla(renglones: number, columnas: number, nombre: string): ITabla {
    const t = new MockTabla(renglones, columnas)
    this._tables.set(nombre, t)
    return t
  }

  elemento(nombre: string): ITabla {
    return this._tables.get(nombre) ?? this.crearTabla(11, 8, nombre)
  }

  desplegar(_window: unknown): void { /* no-op in showcase */ }

  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

// Subclass to expose protected inicializar flow without GIS runtime
class ShowcaseSello extends CSelloReconcentracion {
  initShowcase(tablas: ITablas): void {
    this._tablas = tablas
    this.configurarTabla()
    this.etiquetarCeldas()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const ROWS = 11
const COLS = 8

const GROUP_HEADERS = ['Precableado', 'Reconcentración', 'Reconexión', 'Rehabilitación']

export function CSelloReconcentracionShowcase() {
  const grid = useMemo<MockCell[][]>(() => {
    const mock = new MockTablas()
    const sello = new ShowcaseSello()
    sello.initShowcase(mock)
    return mock.getTable('tbl_reconcentracion')?.getGrid() ?? []
  }, [])

  const cell = (r: number, c: number): MockCell =>
    grid[r]?.[c] ?? { texto: undefined, bordeDer: true }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tabla de bajantes 11 × 8. Labels estáticos resueltos en tiempo de compilación.
        Columna "UC" se llena desde GIS (Fase 5).
      </Typography>

      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ fontFamily: 'monospace', fontSize: 11, minWidth: 640 }}>
          <TableHead>
            {/* Row 1: Title header */}
            <TableRow sx={{ bgcolor: '#263238' }}>
              {Array.from({ length: COLS }, (_, i) => {
                const c = i + 1
                const { texto, bordeDer } = cell(1, c)
                return (
                  <TableCell
                    key={c}
                    sx={{
                      color: '#fff', fontFamily: 'monospace', fontSize: 10, px: 0.5, py: 0.5,
                      borderRight: bordeDer ? undefined : 'none',
                      textAlign: 'center',
                    }}
                  >
                    {texto ?? ''}
                  </TableCell>
                )
              })}
            </TableRow>
            {/* Row 2: Group headers */}
            <TableRow sx={{ bgcolor: '#37474f' }}>
              {Array.from({ length: COLS }, (_, i) => {
                const c = i + 1
                const { texto, bordeDer } = cell(2, c)
                return (
                  <TableCell
                    key={c}
                    sx={{
                      color: '#fff', fontFamily: 'monospace', fontSize: 9, px: 0.5, py: 0.5,
                      borderRight: bordeDer ? undefined : 'none',
                      textAlign: 'center',
                    }}
                  >
                    {texto ?? ''}
                  </TableCell>
                )
              })}
            </TableRow>
            {/* Row 3: UC / Total subheaders */}
            <TableRow sx={{ bgcolor: '#546e7a' }}>
              {Array.from({ length: COLS }, (_, i) => {
                const c = i + 1
                const { texto } = cell(3, c)
                return (
                  <TableCell key={c} sx={{ color: '#fff', fontFamily: 'monospace', fontSize: 9, px: 0.5, py: 0.5, textAlign: 'center' }}>
                    {texto ?? ''}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Rows 4–11: data rows */}
            {Array.from({ length: ROWS - 3 }, (_, rowIdx) => {
              const r = rowIdx + 4
              return (
                <TableRow key={r} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}>
                  {Array.from({ length: COLS }, (_, colIdx) => {
                    const c = colIdx + 1
                    const { texto } = cell(r, c)
                    const isLabel = c % 2 === 1  // odd cols = label codes
                    return (
                      <TableCell
                        key={c}
                        sx={{
                          fontFamily: 'monospace', fontSize: 9, px: 0.5, py: 0.5,
                          textAlign: 'center',
                          bgcolor: isLabel ? '#e8f5e9' : '#fff8e1',
                          color: isLabel ? '#2e7d32' : '#5d4037',
                        }}
                      >
                        {texto ?? (isLabel ? '' : '—')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Verde = código cable (estático)" size="small" sx={{ bgcolor: '#e8f5e9', fontSize: 10 }} />
        <Chip label="Amarillo = UC total (dinámico, Fase 5)" size="small" sx={{ bgcolor: '#fff8e1', fontSize: 10 }} />
        <Chip label={`Grupos: ${GROUP_HEADERS.join(' · ')}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
      </Box>
    </Box>
  )
}
