import { useMemo, useState } from 'react'
import {
  Box, Chip, Divider, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import { CResumenDelProyecto } from '../models/CResumenDelProyecto'
import type { ResumenItem } from '../models/CResumenDelProyecto'
import type { ITabla, ITablas, ICeldas, ICelda, IElementos, IBordesElemento } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure ────────────────────────────────────────────────────────

interface MockCellData {
  texto:     string | undefined
  alineacion: string | undefined
  color:     string | undefined
  bordeDer:  boolean
  bordeIzq:  boolean
}

function emptyCell(): MockCellData {
  return { texto: undefined, alineacion: undefined, color: undefined, bordeDer: true, bordeIzq: true }
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
    return { elemento: (n: number) => ({
      get longitud()         { return lens[n] ?? 0 },
      set longitud(v: number) { lens[n] = v },
    }) }
  }

  get columnas() {
    const lens = this._colLen
    return { elemento: (n: number) => ({
      get longitud()         { return lens[n] ?? 0 },
      set longitud(v: number) { lens[n] = v },
    }) }
  }

  get celdas(): ICeldas {
    const cells = this._cells
    return {
      celda: (r: number, c: number): ICelda => {
        const cell = cells[r]?.[c] ?? emptyCell()
        const bordes: IBordesElemento = {
          get bordeDer()          { return cell.bordeDer },
          set bordeDer(v: boolean) { cell.bordeDer = v },
          get bordeIzq()          { return cell.bordeIzq },
          set bordeIzq(v: boolean) { cell.bordeIzq = v },
        }
        const elementos: IElementos = { obtenerElemento: () => bordes }
        return {
          get elemento(): unknown {
            if (cell.texto === undefined) return undefined
            const t = new CTextoGrafico(cell.texto)
            t.alineacion = cell.alineacion
            t.color      = cell.color
            return t
          },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) {
              cell.texto     = v.texto
              cell.alineacion = v.alineacion
              cell.color     = v.color
            }
          },
          elementos,
        }
      },
    }
  }

  getCell(r: number, c: number): MockCellData { return this._cells[r]?.[c] ?? emptyCell() }
  get numRows() { return this._rows }
  get numCols() { return this._cols }
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
    return this._tables.get(nombre) ?? this.crearTabla(5, 4, nombre)
  }

  desplegar(_w: unknown): void {}
  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

class ShowcaseResumen extends CResumenDelProyecto {
  initShowcase(tablas: ITablas): void {
    this._tablas = tablas
    this.configurarTabla()
    this.etiquetarCeldas()
  }
}

// ── Default data ───────────────────────────────────────────────────────────────

const DEFAULT_ITEMS: ResumenItem[] = [
  ['Cable de fibra óptica 24 hilos', 'FO-24H',    '250 M'],
  ['Empalme de fibra óptica',        'EMP-FO',    '4 PZA'],
  ['Terminal de distribución',       'TERM-DIS',  '2 PZA'],
  ['Manga de empalme subterráneo',   'MANGA-SUB', '1 PZA'],
  ['CEDO tipo pedestal',             'CEDO-PED',  '1 PZA'],
]

const TABLA = 'tbl_lista_materiales'
const COLS  = 4

// ── Component ─────────────────────────────────────────────────────────────────

export function CResumenDelProyectoShowcase() {
  const [items, setItems] = useState<ResumenItem[]>(DEFAULT_ITEMS)

  const tabla = useMemo<MockTabla | undefined>(() => {
    const mock  = new MockTablas()
    const sello = new ShowcaseResumen(items)
    sello.initShowcase(mock)
    return mock.getTable(TABLA)
  }, [items])

  const cell      = (r: number, c: number) => tabla?.getCell(r, c) ?? emptyCell()
  const rows      = tabla?.numRows ?? 0
  const colWidths = Array.from({ length: COLS }, (_, i) => tabla?.getColLen(i + 1) ?? 0)

  const updateItem = (idx: number, field: 0 | 1 | 2, value: string) => {
    setItems(prev => {
      const next = [...prev] as ResumenItem[]
      const item = [...next[idx]] as ResumenItem
      item[field] = value
      next[idx] = item
      return next
    })
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sello GIS «RESUMEN DEL PROYECTO» — tabla dinámica (2 + n) × 4. Fila 1: título.
        Fila 2: encabezados fijos. Filas 3+: materiales del proyecto. Extiende CBaseSelloFibra.
      </Typography>

      {/* Table preview */}
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#b71c1c' }}>
              {Array.from({ length: COLS }, (_, i) => (
                <TableCell key={i} sx={{ color: '#fff', fontSize: 9, py: 0.5, px: 1 }}>
                  Col {i + 1} ({colWidths[i]} mm)
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }, (_, ri) => {
              const r      = ri + 1
              const isTitle  = r === 1
              const isHeader = r === 2
              return (
                <TableRow key={r}>
                  {Array.from({ length: COLS }, (_, ci) => {
                    const c = ci + 1
                    const { texto, color } = cell(r, c)
                    const textColor = color ?? (isTitle || isHeader ? '#c62828' : '#212121')
                    return (
                      <TableCell
                        key={c}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          px: 1, py: 0.5,
                          fontWeight: (isTitle || isHeader) ? 700 : 400,
                          color: textColor,
                          bgcolor: isTitle   ? '#ffebee'
                                 : isHeader  ? '#fce4ec'
                                 : c === 1  ? '#fff3e0'
                                 : '#fff',
                          textAlign: isTitle ? 'center' : 'left',
                          whiteSpace: 'pre',
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

      {/* Editor */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
        Materiales del proyecto (editable)
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {items.map((item, idx) => (
          <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 1 }}>
            <TextField
              label="Descripción"
              value={item[0]}
              size="small"
              slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
              onChange={e => updateItem(idx, 0, e.target.value)}
            />
            <TextField
              label="Material"
              value={item[1]}
              size="small"
              slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
              onChange={e => updateItem(idx, 1, e.target.value)}
            />
            <TextField
              label="Total"
              value={String(item[2])}
              size="small"
              slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
              onChange={e => updateItem(idx, 2, e.target.value)}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Rojo = título / celdas coloreadas (o_color_linea)" size="small" sx={{ bgcolor: '#ffebee', fontSize: 10 }} />
        <Chip label="Rosa = fila de encabezados" size="small" sx={{ bgcolor: '#fce4ec', fontSize: 10 }} />
        <Chip label="Naranja = número de fila" size="small" sx={{ bgcolor: '#fff3e0', fontSize: 10 }} />
        <Chip label="TOTAL = atributos GIS ?? cantidad (Fase 5)" size="small" variant="outlined" sx={{ fontSize: 10 }} />
      </Box>
    </Box>
  )
}
