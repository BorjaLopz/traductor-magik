import { useMemo, useState } from 'react'
import {
  Box, Chip, IconButton, Paper, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material'
import { CCuadroResumenUsuariosTelcel } from '../models/CCuadroResumenUsuariosTelcel'
import type { TelcelRow } from '../models/CCuadroResumenUsuariosTelcel'
import type { ITabla, ITablas, ICeldas, ICelda, IElementos, IBordesElemento } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure (same pattern as other fibra showcases) ───────────────

interface MockCellData {
  texto: string | undefined
  color: string | undefined
  estilo: string | undefined
  bordeDer: boolean
  bordeIzq: boolean
  bordeSup: boolean
  bordeInf: boolean
}

function emptyCell(): MockCellData {
  return { texto: undefined, color: undefined, estilo: undefined, bordeDer: true, bordeIzq: true, bordeSup: true, bordeInf: true }
}

class MockTabla implements ITabla {
  coordenadaOrigen: [number, number] = [0, 0]
  private _cells: MockCellData[][]
  private _rowLen: number[]
  private _colLen: number[]
  readonly rows: number
  readonly cols: number

  constructor(rows: number, cols: number) {
    this.rows = rows
    this.cols = cols
    this._cells = Array.from({ length: rows + 1 }, () =>
      Array.from({ length: cols + 1 }, emptyCell)
    )
    this._rowLen = new Array(rows + 1).fill(0)
    this._colLen = new Array(cols + 1).fill(0)
  }

  get renglones() {
    const lens = this._rowLen
    return { elemento: (n: number) => ({ get longitud() { return lens[n] ?? 0 }, set longitud(v: number) { lens[n] = v * 10 } }) }
  }

  get columnas() {
    const lens = this._colLen
    return { elemento: (n: number) => ({ get longitud() { return lens[n] ?? 0 }, set longitud(v: number) { lens[n] = v * 10 } }) }
  }

  get celdas(): ICeldas {
    const cells = this._cells
    return {
      celda: (r: number, c: number): ICelda => {
        const cell = cells[r]?.[c] ?? emptyCell()
        const bordes: IBordesElemento = {
          get bordeDer() { return cell.bordeDer }, set bordeDer(v) { cell.bordeDer = v },
          get bordeIzq() { return cell.bordeIzq }, set bordeIzq(v) { cell.bordeIzq = v },
          get bordeSup() { return cell.bordeSup }, set bordeSup(v) { cell.bordeSup = v },
          get bordeInf() { return cell.bordeInf }, set bordeInf(v) { cell.bordeInf = v },
        }
        const elementos: IElementos = { obtenerElemento: () => bordes }
        return {
          get elemento(): unknown {
            if (cell.texto === undefined) return undefined
            const t = new CTextoGrafico(cell.texto)
            t.color = cell.color
            t.estilo = cell.estilo
            return t
          },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) { cell.texto = v.texto; cell.color = v.color; cell.estilo = v.estilo }
          },
          elementos,
        }
      },
    }
  }

  getCell(r: number, c: number): MockCellData { return this._cells[r]?.[c] ?? emptyCell() }
  getColLen(n: number) { return this._colLen[n] ?? 0 }
  getRowLen(n: number) { return this._rowLen[n] ?? 0 }
}

class MockTablas implements ITablas {
  private _tables = new Map<string, MockTabla>()
  crearTabla(renglones: number, columnas: number, nombre: string): ITabla {
    const t = new MockTabla(renglones, columnas)
    this._tables.set(nombre, t)
    return t
  }
  elemento(nombre: string): ITabla { return this._tables.get(nombre) ?? this.crearTabla(4, 5, nombre) }
  desplegar(_w: unknown): void {}
  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

class ShowcaseCuadro extends CCuadroResumenUsuariosTelcel {
  initShowcase(tablas: ITablas): void {
    this._tablas = tablas
    this.configurarTabla()
    this.etiquetarCeldas()
    this.llenarDatosCeldas()
  }
}

// ── Default mock data ─────────────────────────────────────────────────────────

const DEFAULT_ROWS: [string, TelcelRow][] = [
  ['A', { no: '1', usuarios: 'TELMEX NORTE AGUASCALIENTES',  id: 'AGS-001', pes: '12A', fibras: '24' }],
  ['B', { no: '2', usuarios: 'TELMEX SUR AGUASCALIENTES',    id: 'AGS-002', pes: '12B', fibras: '12' }],
  ['C', { no: '3', usuarios: 'TELCEL ZONA CENTRO',           id: 'ZC-003',  pes: '8A',  fibras: '48' }],
  ['D', { no: '4', usuarios: 'TELCEL ZONA NORTE',            id: 'ZN-004',  pes: '8B',  fibras: '36' }],
]

const TABLE_NAME = 'tbl_cuadro_resumen_usuarios_telcel'
const COLS = 5

// ── Component ─────────────────────────────────────────────────────────────────

export function CCuadroResumenUsuariosTelcelShowcase() {
  const [rows, setRows] = useState<[string, TelcelRow][]>(DEFAULT_ROWS)

  const tabla = useMemo<MockTabla | undefined>(() => {
    const dataMap = new Map(rows)
    const mock = new MockTablas()
    const sello = new ShowcaseCuadro(dataMap)
    sello.initShowcase(mock)
    return mock.getTable(TABLE_NAME)
  }, [rows])

  const totalRows = tabla?.rows ?? 0

  const cell = (r: number, c: number) => tabla?.getCell(r, c) ?? emptyCell()

  const COL_WIDTHS = [1, 2, 3, 4, 5].map(c => ((tabla?.getColLen(c) ?? 0) / 10).toFixed(0) + 'mm')

  const addRow = () =>
    setRows(prev => {
      const n = prev.length + 1
      const key = String.fromCharCode(65 + prev.length)
      return [...prev, [key, { no: String(n), usuarios: `USUARIO ${n}`, id: `ID-${n}0${n}`, pes: `${n}A`, fibras: '12' }]]
    })

  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx))

  const updateField = (idx: number, field: keyof TelcelRow, value: string) =>
    setRows(prev => prev.map((entry, i) => i === idx ? [entry[0], { ...entry[1], [field]: value }] : entry))

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sello dinámico de usuarios Telcel. Extiende CBaseSelloFibra.
        Número de filas depende del tamaño de LoElemResumen. Título mergeado sobre 5 columnas.
      </Typography>

      {/* Table preview */}
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace', fontSize: 10, tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#102027' }}>
              {['No.', 'Usuarios', 'ID', 'PES', 'Fibras Asig.'].map((h, i) => (
                <TableCell key={i} sx={{ color: '#fff', fontSize: 9, py: 0.5, px: 0.75 }}>
                  {h} <span style={{ opacity: 0.6 }}>({COL_WIDTHS[i]})</span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: totalRows }, (_, ri) => {
              const r = ri + 1
              return (
                <TableRow
                  key={r}
                  sx={{
                    bgcolor: r === 1 ? '#1a237e' : r === 2 ? '#283593' : ri % 2 === 0 ? '#f5f5f5' : '#fff',
                  }}
                >
                  {Array.from({ length: COLS }, (_, ci) => {
                    const c = ci + 1
                    const { texto, color, bordeDer, bordeIzq, bordeSup } = cell(r, c)
                    const isTitleRow = r === 1
                    const isHeaderRow = r === 2
                    // Title row: skip all cols except col 2 which holds the text
                    if (isTitleRow && c !== 2) {
                      return (
                        <TableCell
                          key={c}
                          sx={{
                            py: 0.5, px: 0.75,
                            borderRight: !bordeDer ? 'none' : undefined,
                            borderLeft: !bordeIzq ? 'none' : undefined,
                            borderTop: !bordeSup ? 'none' : undefined,
                          }}
                        />
                      )
                    }
                    const colorKey = color ?? ''
                    const isGreen = colorKey.includes('128') || color === 'rgb(0,128,0)'
                    return (
                      <TableCell
                        key={c}
                        colSpan={isTitleRow ? COLS : 1}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: isTitleRow ? 11 : isHeaderRow ? 10 : 9,
                          px: 0.75, py: 0.5,
                          color: isTitleRow || isHeaderRow ? '#fff' : isGreen ? '#1b5e20' : '#0d47a1',
                          fontWeight: isHeaderRow ? 700 : 400,
                          textAlign: c === 2 && r > 2 ? 'left' : 'center',
                          borderRight: !bordeDer ? 'none' : undefined,
                          borderLeft: !bordeIzq ? 'none' : undefined,
                          borderTop: !bordeSup ? 'none' : undefined,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
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

      {/* Data editor */}
      <Stack direction="row" sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="#263238">
          Datos de LoElemResumen ({rows.length} filas)
        </Typography>
        <Chip label="+ Añadir fila" size="small" onClick={addRow} sx={{ cursor: 'pointer', fontSize: 10 }} />
      </Stack>

      {rows.map(([key, row], idx) => (
        <Paper key={key} variant="outlined" sx={{ mb: 1, p: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Tooltip title="Eliminar fila">
              <IconButton size="small" onClick={() => removeRow(idx)} sx={{ fontSize: 10 }}>×</IconButton>
            </Tooltip>
            {(['no', 'usuarios', 'id', 'pes', 'fibras'] as (keyof TelcelRow)[]).map(field => (
              <TextField
                key={field}
                label={field}
                value={row[field]}
                size="small"
                slotProps={{ htmlInput: { style: { fontSize: 10 } } }}
                sx={{ width: field === 'usuarios' ? 200 : 90 }}
                onChange={e => updateField(idx, field, e.target.value)}
              />
            ))}
          </Stack>
        </Paper>
      ))}

      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Cols 1,4,5 datos → azul oscuro" size="small" sx={{ bgcolor: '#e8eaf6', fontSize: 10 }} />
        <Chip label="Cols 2,3 datos → verde oscuro" size="small" sx={{ bgcolor: '#e8f5e9', fontSize: 10 }} />
        <Chip label="Fila 1 título mergeado visualmente" size="small" variant="outlined" sx={{ fontSize: 10 }} />
      </Box>
    </Box>
  )
}
