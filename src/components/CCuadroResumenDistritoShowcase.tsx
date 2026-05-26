import { useMemo, useState } from 'react'
import {
  Box, Chip, Divider, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import { CCuadroResumenDistrito } from '../models/CCuadroResumenDistrito'
import type { DistritoRecord } from '../models/CCuadroResumenDistrito'
import type { ITabla, ITablas, ICeldas, ICelda, IElementos, IBordesElemento } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure ────────────────────────────────────────────────────────

interface MockCellData {
  texto: string | undefined
  estilo: string | undefined
  color: string | undefined
  bordeDer: boolean
  bordeIzq: boolean
}

function emptyCell(): MockCellData {
  return { texto: undefined, estilo: undefined, color: undefined, bordeDer: true, bordeIzq: true }
}

class MockTabla implements ITabla {
  coordenadaOrigen: [number, number] = [0, 0]
  private _rows: number
  private _cols: number
  private _cells: MockCellData[][]
  private _rowLen: number[]
  private _colLen: number[]

  constructor(rows: number, cols: number) {
    this._rows = rows
    this._cols = cols
    this._cells = Array.from({ length: rows + 1 }, () =>
      Array.from({ length: cols + 1 }, emptyCell)
    )
    this._rowLen = new Array(rows + 1).fill(0)
    this._colLen = new Array(cols + 1).fill(0)
  }

  get renglones() {
    const lens = this._rowLen
    return {
      elemento: (n: number) => ({
        get longitud() { return lens[n] ?? 0 },
        set longitud(v: number) { lens[n] = v * 10 },
      }),
    }
  }

  get columnas() {
    const lens = this._colLen
    return {
      elemento: (n: number) => ({
        get longitud() { return lens[n] ?? 0 },
        set longitud(v: number) { lens[n] = v * 10 },
      }),
    }
  }

  get celdas(): ICeldas {
    const cells = this._cells
    return {
      celda: (r: number, c: number): ICelda => {
        const cell = cells[r]?.[c] ?? emptyCell()
        const bordes: IBordesElemento = {
          get bordeDer() { return cell.bordeDer },
          set bordeDer(v) { cell.bordeDer = v },
          get bordeIzq() { return cell.bordeIzq },
          set bordeIzq(v) { cell.bordeIzq = v },
        }
        const elementos: IElementos = { obtenerElemento: () => bordes }
        return {
          get elemento(): unknown {
            return cell.texto !== undefined ? (() => {
              const t = new CTextoGrafico(cell.texto!)
              t.estilo = cell.estilo
              t.color = cell.color
              return t
            })() : undefined
          },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) {
              cell.texto = v.texto
              cell.estilo = v.estilo
              cell.color = v.color
            }
          },
          elementos,
        }
      },
    }
  }

  getCell(r: number, c: number): MockCellData { return this._cells[r]?.[c] ?? emptyCell() }
  get rows() { return this._rows }
  get cols() { return this._cols }
  getRowLen(n: number) { return this._rowLen[n] ?? 0 }
  getColLen(n: number) { return this._colLen[n] ?? 0 }
}

class MockTablas implements ITablas {
  private _tables = new Map<string, MockTabla>()

  crearTabla(renglones: number, columnas: number, nombre: string): ITabla {
    const t = new MockTabla(renglones, columnas)
    this._tables.set(nombre, t)
    return t
  }

  elemento(nombre: string): ITabla {
    return this._tables.get(nombre) ?? this.crearTabla(6, 4, nombre)
  }

  desplegar(_w: unknown): void {}
  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

class ShowcaseCuadro extends CCuadroResumenDistrito {
  initShowcase(tablas: ITablas): void {
    this._tablas = tablas
    this.configurarTabla()
    this.etiquetarCeldas()
  }
}

// ── Default mock district data ─────────────────────────────────────────────────

const DEFAULT: DistritoRecord = {
  distrito:    'DTO. NORTE - AGUASCALIENTES',
  fibras:      '144',
  cuentas:     '320',
  trayectoria: 'TRAMO A-B-C',
  nco:         'NCO-NORTE-001',
  nse:         'AB',
  clasifcomer:  'RESIDENCIAL',
  viviendas:   '1250',
  datos:       '45',
  clientes:    '12',
  distancia:   '850 M',
}

// ── Component ─────────────────────────────────────────────────────────────────

const COLS = 4
const ROWS = 6
const TABLE_NAME = 'tbl_cuadro_resumen_distrito'

export function CCuadroResumenDistritoShowcase() {
  const [distrito, setDistrito] = useState<DistritoRecord>(DEFAULT)

  const tabla = useMemo<MockTabla | undefined>(() => {
    const mock = new MockTablas()
    const sello = new ShowcaseCuadro(distrito)
    sello.initShowcase(mock)
    return mock.getTable(TABLE_NAME)
  }, [distrito])

  const cell = (r: number, c: number) => tabla?.getCell(r, c) ?? emptyCell()

  const COLOR_MAP: Record<string, string> = {
    'rgb(0,0,255)': '#1565c0',
    'rgb(77,204,77)': '#2e7d32',
    'rgb(255,0,0)': '#c62828',
  }
  const fgColor = (hex: string | undefined) => COLOR_MAP[hex ?? ''] ?? '#212121'

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sello GIS de resumen por distrito (6 × 4). Extiende CBaseSelloFibra.
        Columnas pares = datos dinámicos, impares = etiquetas estáticas.
      </Typography>

      {/* Table preview */}
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#263238' }}>
              {Array.from({ length: COLS }, (_, i) => (
                <TableCell key={i} sx={{ color: '#fff', fontSize: 9, py: 0.5, px: 1 }}>
                  Col {i + 1} (w={((tabla?.getColLen(i + 1) ?? 0) / 10).toFixed(1)} mm)
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: ROWS }, (_, ri) => {
              const r = ri + 1
              return (
                <TableRow key={r} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  {Array.from({ length: COLS }, (_, ci) => {
                    const c = ci + 1
                    const { texto, estilo, color, bordeDer, bordeIzq } = cell(r, c)
                    const isDynamic = c % 2 === 0
                    return (
                      <TableCell
                        key={c}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          px: 1, py: 0.5,
                          fontWeight: estilo === 'Bold' ? 700 : 400,
                          color: fgColor(color),
                          bgcolor: isDynamic ? '#e3f2fd' : '#f3e5f5',
                          borderRight: !bordeDer ? 'none' : undefined,
                          borderLeft: !bordeIzq ? 'none' : undefined,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {texto ?? ''}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Data editor */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
        Datos de distrito (editable)
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        {(Object.keys(DEFAULT) as (keyof DistritoRecord)[]).map(key => (
          <TextField
            key={key}
            label={key}
            value={distrito[key]}
            size="small"
            slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
            onChange={e => setDistrito(prev => ({ ...prev, [key]: e.target.value }))}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Morado = etiqueta estática (col 1, 3)" size="small" sx={{ bgcolor: '#f3e5f5', fontSize: 10 }} />
        <Chip label="Azul = dato dinámico (col 2, 4)" size="small" sx={{ bgcolor: '#e3f2fd', fontSize: 10 }} />
        <Chip label="Rojo = fibras asignadas" size="small" sx={{ bgcolor: '#ffebee', fontSize: 10 }} />
        <Chip label="Verde = NSE / CLASIF / DATOS / CLIENTES" size="small" sx={{ bgcolor: '#e8f5e9', fontSize: 10 }} />
      </Box>
    </Box>
  )
}
