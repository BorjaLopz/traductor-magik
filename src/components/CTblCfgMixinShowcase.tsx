import { useMemo, useState } from 'react'
import {
  Box, Chip, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { CTblCfgMixin } from '../models/CTblCfgMixin'
import type { ITablaBordes, LadoBorde } from '../models/CTblCfgMixin'

// ── Mock table ─────────────────────────────────────────────────────────────────

interface CellBorders { superior: boolean; inferior: boolean; derecha: boolean; izquierda: boolean }

function allOn(): CellBorders { return { superior: true, inferior: true, derecha: true, izquierda: true } }

class MockTablaBordes implements ITablaBordes {
  private _grid: CellBorders[][]   // 1-indexed — [0] rows unused
  private _rows: number
  private _cols: number

  constructor(rows: number, cols: number) {
    this._rows = rows
    this._cols = cols
    this._grid = Array.from({ length: rows + 1 }, () =>
      Array.from({ length: cols + 1 }, allOn)
    )
  }

  activarBordeCelda(ren: number, col: number, lado: LadoBorde, valor: boolean): void {
    const cell = this._grid[ren]?.[col]
    if (cell) cell[lado] = valor
  }

  get columnas() { return { totalElementos: this._cols } }
  get renglones() { return { totalElementos: this._rows } }

  getCell(r: number, c: number): CellBorders { return this._grid[r]?.[c] ?? allOn() }
  get numRows() { return this._rows }
  get numCols()  { return this._cols }
}

// ── Config ─────────────────────────────────────────────────────────────────────

const ROWS = 3
const COLS_TITULO  = 5   // apagaBordesAModoEnContornoSup hardcodes cols 1–5
const COLS_DETALLE = 8   // cfgTblDetalle uses inner cols 3–6 + outer totCols-1/totCols

type Mode = 'ninguno' | 'titulo' | 'detalle'

const mixin = new CTblCfgMixin()

function buildGrid(mode: Mode): { grid: MockTablaBordes; cols: number } {
  const cols = mode === 'detalle' ? COLS_DETALLE : COLS_TITULO
  const tbl  = new MockTablaBordes(ROWS, cols)
  if (mode === 'titulo')  mixin.cfgTblTitulo(tbl)
  if (mode === 'detalle') mixin.cfgTblDetalle(tbl)
  return { grid: tbl, cols }
}

const BORDER_STYLE = '2px solid #1565c0'
const BORDER_OFF   = '1px dashed #e0e0e0'

// ── Component ─────────────────────────────────────────────────────────────────

export function CTblCfgMixinShowcase() {
  const [mode, setMode] = useState<Mode>('titulo')

  const { grid, cols } = useMemo(() => buildGrid(mode), [mode])

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mixin de configuración de bordes de tabla. Métodos aplican reglas de visibilidad
        de bordes a un objeto tabla. Azul sólido = borde activo · Gris punteado = apagado.
      </Typography>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_e, v) => v && setMode(v as Mode)}
        size="small"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="ninguno">Sin configurar</ToggleButton>
        <ToggleButton value="titulo">cfgTblTitulo</ToggleButton>
        <ToggleButton value="detalle">cfgTblDetalle</ToggleButton>
      </ToggleButtonGroup>

      {/* Grid */}
      <Box
        sx={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${cols}, 56px)`,
          gap: 0,
          mb: 3,
        }}
      >
        {Array.from({ length: ROWS }, (_, ri) => {
          const r = ri + 1
          return Array.from({ length: cols }, (_, ci) => {
            const c = ci + 1
            const b = grid.getCell(r, c)
            return (
              <Box
                key={`${r}-${c}`}
                sx={{
                  width:  56,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontFamily: 'monospace',
                  color: '#546e7a',
                  bgcolor: '#fafafa',
                  borderTop:    b.superior  ? BORDER_STYLE : BORDER_OFF,
                  borderBottom: b.inferior  ? BORDER_STYLE : BORDER_OFF,
                  borderRight:  b.derecha   ? BORDER_STYLE : BORDER_OFF,
                  borderLeft:   b.izquierda ? BORDER_STYLE : BORDER_OFF,
                }}
              >
                {r},{c}
              </Box>
            )
          })
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Chip
          label="Azul sólido = borde activo"
          size="small"
          sx={{ bgcolor: '#e3f2fd', fontSize: 10, border: '2px solid #1565c0' }}
        />
        <Chip
          label="Gris punteado = borde apagado"
          size="small"
          sx={{ bgcolor: '#fafafa', fontSize: 10, border: '1px dashed #e0e0e0' }}
        />
      </Box>

      {/* Method notes */}
      {mode === 'titulo' && (
        <Box sx={{ fontSize: 11, fontFamily: 'monospace', color: '#37474f', lineHeight: 1.8 }}>
          <div>cfgTblTitulo (5 cols):</div>
          <div>① apagaBordesInfSupDeTodosRensEnCols → cols {'{1,2,4,5}'}: sup+inf OFF</div>
          <div>② apagaBordesAModoEnContornoSup → fila 1 bordes específicos OFF</div>
          <div>③ apagaBordesAModoEnContornoInf → fila 3 col 3: inf+izq+der OFF</div>
        </Box>
      )}
      {mode === 'detalle' && (
        <Box sx={{ fontSize: 11, fontFamily: 'monospace', color: '#37474f', lineHeight: 1.8 }}>
          <div>cfgTblDetalle (8 cols):</div>
          <div>① apagaBordesInfSupDeTodosRensEnCols → cols {'{1,2,7,8}'}: sup+inf OFF</div>
          <div>② apagaTodosLosBordesDeTodosRensEnCols → cols {'{3,4,5,6}'}: todos OFF</div>
          <div>③ prendeBordesDeDetalle → cols {'{3,4,5,6}'}: contorno exterior ON</div>
          <div>④ prendeLineasDeCeldasEditables → col {'{5}'}: filas internas inf ON</div>
        </Box>
      )}
    </Box>
  )
}
