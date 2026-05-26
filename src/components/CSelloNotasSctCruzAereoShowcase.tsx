import { useMemo, useState } from 'react'
import {
  Box, Chip, Divider, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableRow, TextField, Typography,
} from '@mui/material'
import { CSelloNotasSctCruzAereo } from '../models/CSelloNotasSctCruzAereo'
import type { ITabla, ITablas, ICeldas, ICelda, IElementos, IBordesElemento } from '../models/CBaseSello'
import { CTextoGrafico } from '../gis/CTextoGrafico'

// ── Mock infrastructure ────────────────────────────────────────────────────────

interface MockCellData {
  texto:      string | undefined
  alineacion: string | undefined
}

function emptyCell(): MockCellData {
  return { texto: undefined, alineacion: undefined }
}

class MockTabla implements ITabla {
  coordenadaOrigen: [number, number] = [0, 0]
  private _cells: MockCellData[][]
  private _rowLen: number[]
  private _colLen: number[]

  constructor(rows: number, cols: number) {
    this._cells  = Array.from({ length: rows + 1 }, () =>
      Array.from({ length: cols + 1 }, emptyCell),
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
        const cell   = cells[r]?.[c] ?? emptyCell()
        const bordes: IBordesElemento = { bordeDer: true, bordeIzq: true }
        const elementos: IElementos   = { obtenerElemento: () => bordes }
        return {
          get elemento(): unknown {
            if (cell.texto === undefined) return undefined
            const t = new CTextoGrafico(cell.texto)
            t.alineacion = cell.alineacion
            return t
          },
          set elemento(v: unknown) {
            if (v instanceof CTextoGrafico) {
              cell.texto      = v.texto
              cell.alineacion = v.alineacion
            }
          },
          elementos,
        }
      },
    }
  }

  getCell(r: number, c: number): MockCellData { return this._cells[r]?.[c] ?? emptyCell() }
  getColLen(n: number)                        { return this._colLen[n] ?? 0 }
  getRowLen(n: number)                        { return this._rowLen[n] ?? 0 }
}

class MockTablas implements ITablas {
  private _tables = new Map<string, MockTabla>()

  crearTabla(renglones: number, columnas: number, nombre: string): ITabla {
    const t = new MockTabla(renglones, columnas)
    this._tables.set(nombre, t)
    return t
  }

  elemento(nombre: string): ITabla {
    return this._tables.get(nombre) ?? this.crearTabla(2, 1, nombre)
  }

  desplegar(_w: unknown): void {}
  getTable(nombre: string): MockTabla | undefined { return this._tables.get(nombre) }
}

class ShowcaseCruzAereo extends CSelloNotasSctCruzAereo {
  initShowcase(tablas: ITablas, estado: string, tipoCable: string): void {
    this._tablas    = tablas
    this._estado    = estado.toUpperCase()
    this._tipoCable = tipoCable
    this.configurarTabla()
    this.etiquetarCeldas()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const TIPOS_CABLE = ['FIBRAS ÓPTICAS', 'COBRE']

export function CSelloNotasSctCruzAereoShowcase() {
  const [estado,    setEstado]    = useState('JALISCO')
  const [tipoCable, setTipoCable] = useState('FIBRAS ÓPTICAS')

  const tabla = useMemo<MockTabla | undefined>(() => {
    const mock  = new MockTablas()
    const sello = new ShowcaseCruzAereo()
    sello.initShowcase(mock, estado, tipoCable)
    return mock.getTable('tbl_notas_grales')
  }, [estado, tipoCable])

  const titulo = tabla?.getCell(1, 1).texto ?? 'NOTAS SCT'
  const notas  = tabla?.getCell(2, 1).texto ?? ''
  const colW   = tabla?.getColLen(1) ?? 160
  const row1H  = tabla?.getRowLen(1) ?? 10
  const row2H  = tabla?.getRowLen(2) ?? 110

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sello GIS «NOTAS SCT — CRUZAMIENTO AÉREO» — tabla 2 × 1.
        Notas 1–4: heredadas de CSelloNotasSct. Notas 5–8: específicas de cruce aéreo con postes.
        Dimensiones extendidas: renglon 2 = 110 mm (padre: 55 mm), col 1 = 160 mm (padre: 155 mm).
      </Typography>

      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small" sx={{ fontFamily: 'monospace', width: 'auto', minWidth: 320 }}>
          <TableBody>
            {/* Row 1: title */}
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: 11,
                  textAlign: 'center',
                  bgcolor: '#263238',
                  color: '#fff',
                  px: 2, py: 0.75,
                  letterSpacing: 1,
                }}
              >
                {titulo} ({row1H} mm)
              </TableCell>
            </TableRow>
            {/* Row 2: notes text */}
            <TableRow>
              <TableCell
                sx={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  verticalAlign: 'top',
                  bgcolor: '#fafafa',
                  px: 1.5, py: 1,
                  maxWidth: 520,
                }}
              >
                {notas}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1, color: '#263238' }}>
        Parámetros GIS (simula attributes del layout_element — editable)
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        <TextField
          label="Estado"
          value={estado}
          size="small"
          slotProps={{ htmlInput: { style: { fontSize: 11 } } }}
          onChange={e => setEstado(e.target.value)}
        />
        <Select
          value={tipoCable}
          size="small"
          onChange={e => setTipoCable(e.target.value)}
          sx={{ fontSize: 11 }}
        >
          {TIPOS_CABLE.map(t => (
            <MenuItem key={t} value={t} sx={{ fontSize: 11 }}>{t}</MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`Col 1 = ${colW} mm`}   size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label={`Fila 1 = ${row1H} mm (título)`}  size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label={`Fila 2 = ${row2H} mm (notas)`}   size="small" variant="outlined" sx={{ fontSize: 10 }} />
        <Chip label="Notas 1–4 = CSelloNotasSct (padre)" size="small" sx={{ bgcolor: '#e8f5e9', fontSize: 10 }} />
        <Chip label="Notas 5–8 = CruzAereo override"     size="small" sx={{ bgcolor: '#e3f2fd', fontSize: 10 }} />
        <Chip label="allowed_on_menu = false"             size="small" sx={{ bgcolor: '#fce4ec', fontSize: 10 }} />
      </Box>
    </Box>
  )
}
