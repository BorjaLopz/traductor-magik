import { useMemo, useState } from 'react'
import {
  Box, Chip, Divider, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material'
import { CSelloCompetenciaTelmex } from '../models/CSelloCompetenciaTelmex'
import type { CompetenciaData } from '../models/CSelloCompetenciaTelmex'
import type { ITabla, ITablas, ICeldas, ICelda, IElementos, IBordesElemento } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure ────────────────────────────────────────────────────────

interface MockCellData {
  texto:      string | undefined
  color:      string | undefined
  alineacion: string | undefined
  bordeDer:   boolean
  bordeIzq:   boolean
  bordeInf:   boolean
}

function emptyCell(): MockCellData {
  return { texto: undefined, color: undefined, alineacion: undefined, bordeDer: true, bordeIzq: true, bordeInf: true }
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
      get longitud()          { return lens[n] ?? 0 },
      set longitud(v: number) { lens[n] = v },
    }) }
  }

  get columnas() {
    const lens = this._colLen
    return { elemento: (n: number) => ({
      get longitud()          { return lens[n] ?? 0 },
      set longitud(v: number) { lens[n] = v },
    }) }
  }

  get celdas(): ICeldas {
    const cells = this._cells
    return {
      celda: (r: number, c: number): ICelda => {
        const cell = cells[r]?.[c] ?? emptyCell()
        const bordes: IBordesElemento = {
          get bordeDer()           { return cell.bordeDer },
          set bordeDer(v: boolean) { cell.bordeDer = v },
          get bordeIzq()           { return cell.bordeIzq },
          set bordeIzq(v: boolean) { cell.bordeIzq = v },
          get bordeInf()           { return cell.bordeInf },
          set bordeInf(v: boolean) { cell.bordeInf = v },
        }
        const elementos: IElementos = { obtenerElemento: () => bordes }
        return {
          get elemento(): unknown {
            if (cell.texto === undefined) return undefined
            const t = new CTextoGrafico(cell.texto)
            t.color      = cell.color
            t.alineacion = cell.alineacion
            return t
          },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) {
              cell.texto      = v.texto
              cell.color      = v.color
              cell.alineacion = v.alineacion
            }
          },
          elementos,
        }
      },
    }
  }

  getCell(r: number, c: number): MockCellData { return this._cells[r]?.[c] ?? emptyCell() }
  get numRows() { return this._rows }
  get numCols()  { return this._cols }
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
    return this._tables.get(nombre) ?? this.crearTabla(10, 3, nombre)
  }

  desplegar(_w: unknown): void {}
  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

class ShowcaseSello extends CSelloCompetenciaTelmex {
  initShowcase(tablas: ITablas): void {
    this._tablas = tablas
    this.configurarTabla()
    this.etiquetarCeldas()
  }
}

// ── Default data ───────────────────────────────────────────────────────────────

const DEMO_DATA: CompetenciaData = {
  predDeshabitado: '2',
  tvSatelital:     '5',
  tvCable:         '8',
  operteles:       '3',
  opertelesInalam: '1',
  telmexInalam:    '4',
  telPubCompet:    '0',
  casetaLadafon:   '1',
  casetaLadatel:   '2',
  solicitud:       '7',
}

const TABLA = 'tbl_contenido'
const ROWS  = 10
const COLS  = 3

const FIELD_LABELS: [keyof CompetenciaData, string][] = [
  ['predDeshabitado', 'Predio Deshabitado'],
  ['tvSatelital',     'TV Satelital'],
  ['tvCable',         'TV Cable'],
  ['operteles',       'Operteles'],
  ['opertelesInalam', 'Operteles Inalámbrico'],
  ['telmexInalam',    'Telmex Inalámbrico'],
  ['telPubCompet',    'Tel. Pública Competencia'],
  ['casetaLadafon',   'Caseta Ladafon'],
  ['casetaLadatel',   'Caseta Ladatel'],
  ['solicitud',       'Solicitud'],
]

// ── Component ─────────────────────────────────────────────────────────────────

export function CSelloCompetenciaTelmexShowcase() {
  const [data, setData] = useState<CompetenciaData>(DEMO_DATA)

  const tabla = useMemo<MockTabla | undefined>(() => {
    const mock  = new MockTablas()
    const sello = new ShowcaseSello(data)
    sello.initShowcase(mock)
    return mock.getTable(TABLA)
  }, [data])

  const cell      = (r: number, c: number) => tabla?.getCell(r, c) ?? emptyCell()
  const colWidths = Array.from({ length: COLS }, (_, i) => tabla?.getColLen(i + 1) ?? 0)

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sello GIS competencia Telmex — tabla 10 × 3. Col 1: símbolo GIS (stub).
        Col 2: etiqueta fija con color. Col 3: conteo desde GIS (:user!_building).
      </Typography>

      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace', fontSize: 10 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#263238' }}>
              {Array.from({ length: COLS }, (_, i) => (
                <TableCell key={i} sx={{ color: '#fff', fontSize: 9, py: 0.5, px: 1 }}>
                  {['Símbolo', 'Etiqueta', 'Total'][i]} ({colWidths[i]} mm)
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: ROWS }, (_, ri) => {
              const r = ri + 1
              return (
                <TableRow
                  key={r}
                  sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}
                >
                  {Array.from({ length: COLS }, (_, ci) => {
                    const c  = ci + 1
                    const cd = cell(r, c)
                    const isSymbol = c === 1
                    return (
                      <TableCell
                        key={c}
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          px: 1, py: 0.5,
                          color:  isSymbol ? '#78909c' : (cd.color ?? '#212121'),
                          bgcolor: isSymbol ? '#eceff1'
                                 : c === 2  ? '#f3f4f6'
                                 : '#fff',
                          borderRight:  cd.bordeDer ? undefined : 'none',
                          borderLeft:   cd.bordeIzq ? undefined : 'none',
                          borderBottom: cd.bordeInf ? undefined : 'none',
                          textAlign: 'center',
                        }}
                      >
                        {isSymbol ? '◉' : (cd.texto ?? '')}
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

      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
        Datos de competencia (simula GIS :user!_building — editable)
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        {FIELD_LABELS.map(([key, label]) => (
          <TextField
            key={key}
            label={label}
            value={data[key] ?? ''}
            size="small"
            slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
            onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="◉ Gris = símbolo GIS (p_xxx) — stub Fase 5" size="small" sx={{ bgcolor: '#eceff1', fontSize: 10 }} />
        <Chip label="Azul = OPERTELES (color original)" size="small" sx={{ bgcolor: '#e8eaf6', fontSize: 10 }} />
        <Chip label="Azul = TEL/PUB COMPET. [0,0,1]" size="small" sx={{ bgcolor: '#e3f2fd', fontSize: 10 }} />
        <Chip label="Verde = CASETA LADATEL [0,0.295,0]" size="small" sx={{ bgcolor: '#e8f5e9', fontSize: 10 }} />
        <Chip label="Col 3 = GIS :user!_building.obtener_inventario_detallado()" size="small" variant="outlined" sx={{ fontSize: 10 }} />
      </Box>
    </Box>
  )
}
