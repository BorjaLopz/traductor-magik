import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import {
  TABLE_LAYOUT,
  SELLO_WIDTH_MM,
  SELLO_HEIGHT_MM,
  COLORED_CELLS,
  LABELS_DIVISION,
  LABELS_POBLACION,
  LABELS_ENLACE,
  LABELS_OPERL,
  LABELS_OPERR,
  LABELS_APROBO,
  ENUM_EMPRESAR,
  ENUM_EMPRESAP,
  resolveEmpresaRof,
  DEFAULT_ATTRIBS,
  type SelloFibraRofAttribs,
  type EmpresaRevisora,
  type EmpresaProyectista,
  type TableDef,
} from '../models/CSelloFibraOpticaRof'
import { CSelloFibraOpticaRof } from '../models/CSelloFibraOpticaRof'

// ─── helpers ─────────────────────────────────────────────────────────────────

function rowHeight(tbl: TableDef): number {
  return tbl.rowLens.slice(1).reduce((a, b) => a + b, 0)
}
function colWidth(tbl: TableDef): number {
  return tbl.colLens.slice(1).reduce((a, b) => a + b, 0)
}

type CellMap = Map<string, string>

function buildCellMap(a: SelloFibraRofAttribs): CellMap {
  const m = new Map<string, string>()
  const set = (t: string, r: number, c: number, v: string) => m.set(`${t}:${r}:${c}`, v)

  const { logo: _logo, nombre } = resolveEmpresaRof(a.empreviso)
  set('tbl_Empresa', 1, 2, nombre)

  set('tbl_Proyecto', 1, 1, 'PROYECTO DE FIBRA OPTICA')

  LABELS_DIVISION.forEach((lbl, i) => set('tbl_division', i + 1, 1, lbl))
  set('tbl_division', 1, 2, a.sot             ?? '')
  set('tbl_division', 2, 2, a.direccionSot    ?? '')
  set('tbl_division', 3, 2, a.telefono        ?? '')
  set('tbl_division', 4, 2, a.responsableArea ?? '')

  LABELS_ENLACE.forEach((lbl, i) => set('tbl_enlace', 1, i * 2 + 1, lbl))
  set('tbl_enlace', 1, 2, a.enlace ?? '')
  set('tbl_enlace', 1, 4, a.anillo ?? '')
  set('tbl_enlace', 1, 6, a.pess   ?? '')

  LABELS_POBLACION.forEach((lbl, i) => set('tbl_poblacion', i + 1, 1, lbl))
  set('tbl_poblacion', 1, 2, a.estado    ?? '')
  set('tbl_poblacion', 2, 2, a.ciudad    ?? '')
  set('tbl_poblacion', 3, 2, (a.colonia ?? '') + (a.codigoPostal ? '  ' + a.codigoPostal : ''))
  set('tbl_poblacion', 4, 2, a.municipio ?? '')
  set('tbl_poblacion', 5, 2, a.central   ?? '')

  // tbl_coordenadas — labels commented out in source; renders empty
  LABELS_OPERL.forEach((lbl, i) => set('tbl_Operacion', i + 1, 1, lbl))
  LABELS_OPERR.forEach((lbl, i) => { if (lbl) set('tbl_Operacion', i + 1, 3, lbl) })
  set('tbl_Operacion', 1, 2, a.pep    ?? '')
  set('tbl_Operacion', 2, 2, a.opb    ?? '')
  set('tbl_Operacion', 3, 2, a.oePep  ?? '')
  set('tbl_Operacion', 2, 4, a.oei    ?? '')
  set('tbl_Operacion', 3, 4, a.oeRef  ?? '')

  set('tbl_PlanoNum',  1, 1, 'PLANO No.')
  set('tbl_PlanoNum',  1, 2, a.noPlano ?? '')
  set('tbl_PlanoNum',  1, 3, '')
  set('tbl_EscalaRuta', 1, 1, 'ESCALA')
  set('tbl_EscalaRuta', 1, 2, a.escala ?? '')

  LABELS_APROBO.forEach((lbl, i) => set('tbl_Aprobo', i + 1, 1, lbl))
  set('tbl_Aprobo', 2, 3, 'FECHA')

  return m
}

// ─── SVG renderer ────────────────────────────────────────────────────────────

const RED: [number,number,number] = [1.0, 0.0, 0.0]
const BLACK: [number,number,number] = [0.0, 0.0, 0.0]
const GRAY: [number,number,number] = [0.5, 0.5, 0.5]

function rgbCss([r,g,b]: [number,number,number]): string {
  return `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`
}

interface SelloSvgProps {
  attribs: SelloFibraRofAttribs
  scale:   number
}

function SelloSvg({ attribs, scale }: SelloSvgProps) {
  const cells   = buildCellMap(attribs)
  const blancoNegro = attribs.blancoNegro === 'SI'
  const W = SELLO_WIDTH_MM  * scale
  const H = SELLO_HEIGHT_MM * scale

  const coloredSet = new Set(COLORED_CELLS.map(([t,r,c]) => `${t}:${r}:${c}`))

  const renderTable = (name: string, tbl: TableDef) => {
    const x0 = tbl.posX * scale
    const y0 = tbl.posY * scale
    const cells_out: JSX.Element[] = []

    let curY = y0
    for (let r = 1; r <= tbl.rows; r++) {
      const rh = tbl.rowLens[r] * scale
      let curX = x0
      for (let c = 1; c <= tbl.cols; c++) {
        const cw = tbl.colLens[c] * scale
        const key = `${name}:${r}:${c}`
        const label = cells.get(key) ?? ''
        const isColored = coloredSet.has(key)
        const textColor = isColored
          ? rgbCss(blancoNegro ? GRAY : RED)
          : rgbCss(BLACK)
        const strokeColor = isColored
          ? rgbCss(blancoNegro ? GRAY : RED)
          : '#222'
        const showRight = tbl.drawColInternal !== false || c === tbl.cols
        const showRightBorder = showRight || c === 1

        cells_out.push(
          <g key={key}>
            <rect
              x={curX} y={curY} width={cw} height={rh}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isColored ? 0.8 : 0.5}
            />
            {label && (
              <foreignObject x={curX + 1} y={curY + 0.5} width={cw - 2} height={rh - 1}>
                <div
                  style={{
                    fontSize: Math.max(5, 5.5 * scale),
                    fontFamily: 'Arial, sans-serif',
                    color: textColor,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 2,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontWeight: isColored ? 'bold' : 'normal',
                    lineHeight: 1.1,
                  }}
                >
                  {label}
                </div>
              </foreignObject>
            )}
          </g>
        )
        void showRightBorder
        curX += cw
      }
      curY += rh
    }
    return <g key={name}>{cells_out}</g>
  }

  return (
    <svg
      width={W} height={H}
      style={{ border: '1px solid #999', background: '#fff', display: 'block' }}
    >
      {/* outer marco */}
      <rect x={0} y={0} width={W} height={H} fill="none" stroke="#333" strokeWidth={1} />

      {/* logo placeholder */}
      <rect
        x={TABLE_LAYOUT.tbl_Empresa.posX * scale}
        y={TABLE_LAYOUT.tbl_Empresa.posY * scale}
        width={TABLE_LAYOUT.tbl_Empresa.colLens[1] * scale}
        height={TABLE_LAYOUT.tbl_Empresa.rowLens[1] * scale}
        fill="#e8e8e8" stroke="#aaa" strokeWidth={0.5}
      />
      <text
        x={(TABLE_LAYOUT.tbl_Empresa.posX + TABLE_LAYOUT.tbl_Empresa.colLens[1] / 2) * scale}
        y={(TABLE_LAYOUT.tbl_Empresa.posY + TABLE_LAYOUT.tbl_Empresa.rowLens[1] / 2) * scale}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.max(4, 4 * scale)} fill="#888" fontFamily="Arial"
      >
        LOGO
      </text>

      {/* tbl_coordenadas label: empty in source (all commented out) */}
      {renderTable('tbl_coordenadas', TABLE_LAYOUT.tbl_coordenadas)}

      {Object.entries(TABLE_LAYOUT)
        .filter(([n]) => n !== 'tbl_MarcoSello' && n !== 'tbl_coordenadas')
        .map(([name, tbl]) => renderTable(name, tbl))}
    </svg>
  )
}

// ─── Control panel ───────────────────────────────────────────────────────────

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <TextField
      label={label} value={value} size="small" fullWidth
      sx={{ mb: 1 }}
      onChange={e => onChange(e.target.value)}
    />
  )
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function CSelloFibraOpticaRofShowcase() {
  const [attribs, setAttribs] = useState<SelloFibraRofAttribs>({ ...DEFAULT_ATTRIBS })
  const [scale, setScale]     = useState(2.5)

  const set = <K extends keyof SelloFibraRofAttribs>(k: K, v: SelloFibraRofAttribs[K]) =>
    setAttribs(prev => ({ ...prev, [k]: v }))

  // static instance for method demos
  const inst = new CSelloFibraOpticaRof()

  const { nombre } = resolveEmpresaRof(attribs.empreviso)
  const tableRows = Object.entries(TABLE_LAYOUT).map(([name, tbl]) => ({
    name,
    posX: tbl.posX,
    posY: tbl.posY,
    w: colWidth(tbl).toFixed(1),
    h: rowHeight(tbl).toFixed(1),
    rows: tbl.rows,
    cols: tbl.cols,
  }))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Controls ── */}
      <Box sx={{ width: 280, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CSelloFibraOpticaRof</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Sello fibra óptica ROF · 210×200 mm · 11 tablas
        </Typography>

        <Typography variant="subtitle2" mt={1}>Empresa revisora</Typography>
        <Select
          value={attribs.empreviso ?? ''}
          size="small" fullWidth sx={{ mb: 1 }}
          onChange={e => set('empreviso', (e.target.value as EmpresaRevisora) || undefined)}
          displayEmpty
        >
          <MenuItem value="">(sin selección → ULTIMA_MILLA)</MenuItem>
          {ENUM_EMPRESAR.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          → {nombre}
        </Typography>

        <Typography variant="subtitle2">Empresa proyectista</Typography>
        <Select
          value={attribs.empreproy ?? ''}
          size="small" fullWidth sx={{ mb: 2 }}
          onChange={e => set('empreproy', (e.target.value as EmpresaProyectista) || undefined)}
          displayEmpty
        >
          <MenuItem value="">(sin selección)</MenuItem>
          {ENUM_EMPRESAP.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">División / SOT</Typography>
        <Field label="SOT"          value={attribs.sot             ?? ''} onChange={v => set('sot', v || undefined)} />
        <Field label="Dirección SOT" value={attribs.direccionSot   ?? ''} onChange={v => set('direccionSot', v || undefined)} />
        <Field label="Teléfono"     value={attribs.telefono        ?? ''} onChange={v => set('telefono', v || undefined)} />
        <Field label="Responsable"  value={attribs.responsableArea ?? ''} onChange={v => set('responsableArea', v || undefined)} />

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Enlace</Typography>
        <Field label="Enlace" value={attribs.enlace ?? ''} onChange={v => set('enlace', v || undefined)} />
        <Field label="Anillo" value={attribs.anillo ?? ''} onChange={v => set('anillo', v || undefined)} />
        <Field label="PES"    value={attribs.pess   ?? ''} onChange={v => set('pess', v || undefined)} />

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Población</Typography>
        <Field label="Estado"       value={attribs.estado      ?? ''} onChange={v => set('estado', v || undefined)} />
        <Field label="Ciudad"       value={attribs.ciudad      ?? ''} onChange={v => set('ciudad', v || undefined)} />
        <Field label="Colonia"      value={attribs.colonia     ?? ''} onChange={v => set('colonia', v)} />
        <Field label="Código Postal" value={attribs.codigoPostal ?? ''} onChange={v => set('codigoPostal', v)} />
        <Field label="Del./Mpio."   value={attribs.municipio   ?? ''} onChange={v => set('municipio', v || undefined)} />
        <Field label="Central"      value={attribs.central     ?? ''} onChange={v => set('central', v || undefined)} />

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Operación</Typography>
        <Field label="PEP"    value={attribs.pep    ?? ''} onChange={v => set('pep', v || undefined)} />
        <Field label="OPB"    value={attribs.opb    ?? ''} onChange={v => set('opb', v || undefined)} />
        <Field label="OE/PEP" value={attribs.oePep  ?? ''} onChange={v => set('oePep', v || undefined)} />
        <Field label="OEI"    value={attribs.oei    ?? ''} onChange={v => set('oei', v || undefined)} />
        <Field label="OE/REF" value={attribs.oeRef  ?? ''} onChange={v => set('oeRef', v || undefined)} />

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Plano / Escala</Typography>
        <Field label="No. Plano" value={attribs.noPlano ?? ''} onChange={v => set('noPlano', v || undefined)} />
        <Field label="Escala"    value={attribs.escala  ?? ''} onChange={v => set('escala', v || undefined)} />

        <Divider sx={{ my: 1 }} />
        <FormControlLabel
          control={
            <Switch
              checked={attribs.blancoNegro === 'SI'}
              onChange={e => set('blancoNegro', e.target.checked ? 'SI' : 'NO')}
            />
          }
          label="Blanco y Negro"
        />

        <Typography variant="subtitle2" mt={2}>Zoom ({scale.toFixed(1)}×)</Typography>
        <Slider
          min={1} max={5} step={0.1} value={scale}
          onChange={(_, v) => setScale(v as number)}
        />

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2">Métodos de clase</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          fechaElaboracion() = {CSelloFibraOpticaRof.fechaElaboracion()}<br />
          tramosEnRuta() = "{inst.tramosEnRuta()}"<br />
          enumTipoEmpresaR(): {JSON.stringify([...inst.enumTipoEmpresaR().entries()])}<br />
          enumTipoEmpresaP(): {JSON.stringify([...inst.enumTipoEmpresaP().entries()])}
        </Typography>
      </Box>

      {/* ── SVG preview ── */}
      <Box sx={{ flex: 1, minWidth: 400, overflow: 'auto' }}>
        <SelloSvg attribs={attribs} scale={scale} />

        <Typography variant="subtitle2" mt={2}>Dimensiones de tablas (mm)</Typography>
        <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, mt: 1 }}>
          <thead>
            <tr>
              {['Tabla','posX','posY','W','H','Rows','Cols'].map(h => (
                <Box component="th" key={h} sx={{ border: '1px solid #ccc', px: 1, py: 0.5, background: '#f5f5f5' }}>
                  {h}
                </Box>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(r => (
              <tr key={r.name}>
                {[r.name, r.posX, r.posY, r.w, r.h, r.rows, r.cols].map((v, i) => (
                  <Box component="td" key={i} sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>
                    {String(v)}
                  </Box>
                ))}
              </tr>
            ))}
          </tbody>
        </Box>

        <Typography variant="subtitle2" mt={2}>Colored cells (rojo / gris en B&N)</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
          {COLORED_CELLS.map(([t,r,c]) => `${t}[${r},${c}]`).join(' · ')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Nota: tbl_Operacion[1,4] comentado en fuente — 5 celdas coloreadas (vs 6 en Acometida)
        </Typography>

        <Typography variant="subtitle2" mt={2}>tbl_coordenadas</Typography>
        <Typography variant="body2" sx={{ fontSize: 11 }}>
          Tabla creada en configura_tabla() con 6 columnas (15+60+14+34+18+34 = 175 mm)
          pero sus etiquetas están comentadas en la fuente — renderiza como fila vacía entre
          tbl_poblacion (termina en 125.5 mm) y tbl_Operacion (inicia en 134 mm).
        </Typography>
      </Box>
    </Box>
  )
}
