import { useState } from 'react'
import {
  Alert, Box, Chip, Divider, Table, TableBody, TableCell, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material'
import {
  type TituloMontajeTbaData,
  creaTituloMontajeTba,
  describePlanFlowTba,
  MARCO_CONFIG_TBA,
  NORTE_TBA,
  SELLOS_TBA,
  PARTICULARES_TBA,
  CONEXION_EMPALME_TBA,
  VIEWPORT_LOCALIZACION_TBA,
  VIEWPORT_UBICACION_TBA,
} from '../models/CPlanoMontajeTba'
import { PAGE_SIZE } from '../models/CFactoryPlanos'

// ─── SVG page diagram ──────────────────────────────────────────────────────────
// Marco 4×2, same page size as base Principales variant.

const SVG_W = 420
const PW    = PAGE_SIZE.width    // 12400
const PH    = PAGE_SIZE.height   // 8400
const SVG_H = SVG_W * (PH / PW)

const sx = (x: number) => (x / PW) * SVG_W
const sy = (y: number) => (y / PH) * SVG_H
const fy = (y: number) => SVG_H - sy(y)

// Compute absolute bounds from page-relative offsets (bounding_box auto-normalizes)
function relBounds(dx0: number, dy0FromYmax: number, dx1: number, dy1FromYmax: number) {
  const ax0 = 0  + dx0
  const ay0 = PH + Math.min(dy0FromYmax, dy1FromYmax)  // normalized ymin
  const ax1 = 0  + dx1
  const ay1 = PH + Math.max(dy0FromYmax, dy1FromYmax)  // normalized ymax
  return { x0: ax0, y0: ay0, x1: ax1, y1: ay1 }
}

const SELLO_COLORS: Record<string, string> = {
  'c_sello_ruta_cables_fo':       '#e65100',
  'c_sello_estandar_base_fo':     '#2e7d32',
  'c_notas_constructor':          '#7b1fa2',
  'c_datos_de_red':               '#1565c0',
  'c_cuadro_simbologia_planos_fo':'#00695c',
  'c_notas_considerar':           '#ad1457',
  'c_tabla_ps_telealim':          '#4527a0',
  'c_lista_materiales':           '#37474f',
}

function PageDiagram({ titulo }: { titulo: string }) {
  const norte    = relBounds(NORTE_TBA.dx0FromXmin, NORTE_TBA.dy0FromYmax, NORTE_TBA.dx1FromXmin, NORTE_TBA.dy1FromYmax)
  const vpLoc    = relBounds(VIEWPORT_LOCALIZACION_TBA.dx0FromXmin, VIEWPORT_LOCALIZACION_TBA.dy0FromYmax, VIEWPORT_LOCALIZACION_TBA.dx1FromXmin, VIEWPORT_LOCALIZACION_TBA.dy1FromYmax)
  const vpUbic   = relBounds(VIEWPORT_UBICACION_TBA.dx0FromXmin, VIEWPORT_UBICACION_TBA.dy0FromYmax, VIEWPORT_UBICACION_TBA.dx1FromXmin, VIEWPORT_UBICACION_TBA.dy1FromYmax)
  const empalme  = relBounds(CONEXION_EMPALME_TBA.dx0FromXmin, CONEXION_EMPALME_TBA.dy0FromYmax, CONEXION_EMPALME_TBA.dx1FromXmin, CONEXION_EMPALME_TBA.dy1FromYmax)

  return (
    <svg width={SVG_W} height={SVG_H}
      style={{ display: 'block', border: '1px solid #ccc', borderRadius: 4, background: '#fafafa' }}>
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f5f5f5" />

      {/* Page outline */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H}
        fill="none" stroke="#bbb" strokeWidth={1} strokeDasharray="4 2" />
      <text x={2} y={8} fontSize={4.5} fontFamily="Arial" fill="#aaa">
        marco largo={MARCO_CONFIG_TBA.largo}, alto={MARCO_CONFIG_TBA.alto} · {PW}×{PH}
      </text>

      {/* Sellos (lower-left strip) */}
      {SELLOS_TBA.map(s => {
        const b     = s.bounds
        const color = SELLO_COLORS[s.nombre] ?? '#555'
        const w     = sx(b.x1 - b.x0)
        const h     = sy(b.y1 - b.y0)
        if (w < 1 || h < 1) return (
          <circle key={s.nombre} cx={sx(b.x0)} cy={fy(b.y0)} r={2}
            fill={color} opacity={0.6} />
        )
        return (
          <g key={s.nombre}>
            <rect x={sx(b.x0)} y={fy(b.y1)} width={w} height={h}
              fill={color} fillOpacity={0.13} stroke={color} strokeWidth={0.7} />
            <text x={sx(b.x0) + w / 2} y={fy(b.y1) + h / 2}
              textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill={color}>
              {s.nombre.replace(/^c_/, '')}
            </text>
          </g>
        )
      })}

      {/* Particulares */}
      {PARTICULARES_TBA.map(s => {
        const b     = s.bounds
        const color = SELLO_COLORS[s.nombre] ?? '#555'
        const w     = sx(b.x1 - b.x0)
        const h     = sy(b.y1 - b.y0)
        if (w < 1 || h < 1) return (
          <circle key={s.nombre} cx={sx(b.x0)} cy={fy(b.y0)} r={2}
            fill={color} opacity={0.5} />
        )
        return (
          <g key={s.nombre}>
            <rect x={sx(b.x0)} y={fy(b.y1)} width={w} height={h}
              fill={color} fillOpacity={0.09} stroke={color} strokeWidth={0.5} strokeDasharray="2 1" />
            <text x={sx(b.x0) + w / 2} y={fy(b.y1) + h / 2}
              textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill={color}>
              {s.nombre.replace(/^c_/, '')}
            </text>
          </g>
        )
      })}

      {/* Norte (top-left, narrow) */}
      <rect x={sx(norte.x0)} y={fy(norte.y1)} width={sx(norte.x1 - norte.x0)} height={sy(norte.y1 - norte.y0)}
        fill="#1565c0" fillOpacity={0.15} stroke="#1565c0" strokeWidth={0.7} />
      <text x={sx(norte.x0) + sx((norte.x1 - norte.x0) / 2)} y={fy(norte.y1) + sy((norte.y1 - norte.y0) / 2)}
        textAnchor="middle" fontSize={3.5} fontFamily="Arial" fill="#1565c0">
        norte
      </text>

      {/* VP Localizacion */}
      <rect x={sx(vpLoc.x0)} y={fy(vpLoc.y1)} width={sx(vpLoc.x1 - vpLoc.x0)} height={sy(vpLoc.y1 - vpLoc.y0)}
        fill="#f57f17" fillOpacity={0.18} stroke="#f57f17" strokeWidth={0.8} />
      <text x={sx(vpLoc.x0) + sx((vpLoc.x1 - vpLoc.x0) / 2)} y={fy(vpLoc.y1) + sy((vpLoc.y1 - vpLoc.y0) / 2)}
        textAnchor="middle" fontSize={4} fontFamily="Arial" fill="#e65100">
        VP Loc.
      </text>

      {/* VP Ubicacion */}
      <rect x={sx(vpUbic.x0)} y={fy(vpUbic.y1)} width={sx(vpUbic.x1 - vpUbic.x0)} height={sy(vpUbic.y1 - vpUbic.y0)}
        fill="#8e24aa" fillOpacity={0.15} stroke="#8e24aa" strokeWidth={0.8} />
      <text x={sx(vpUbic.x0) + sx((vpUbic.x1 - vpUbic.x0) / 2)} y={fy(vpUbic.y1) + sy((vpUbic.y1 - vpUbic.y0) / 2)}
        textAnchor="middle" fontSize={4} fontFamily="Arial" fill="#6a1b9a">
        VP Ubic.
      </text>

      {/* Conexion Empalme */}
      <rect x={sx(empalme.x0)} y={fy(empalme.y1)} width={sx(empalme.x1 - empalme.x0)} height={sy(empalme.y1 - empalme.y0)}
        fill="#c62828" fillOpacity={0.14} stroke="#c62828" strokeWidth={0.8} strokeDasharray="2 1" />
      <text x={sx(empalme.x0) + sx((empalme.x1 - empalme.x0) / 2)} y={fy(empalme.y1) + sy((empalme.y1 - empalme.y0) / 2)}
        textAnchor="middle" fontSize={3.8} fontFamily="Arial" fill="#c62828">
        ConexEmpalme [?]
      </text>

      {/* Title */}
      <text x={SVG_W / 2} y={SVG_H - 4}
        textAnchor="middle" fontSize={4.5} fontFamily="Arial" fill="#555">
        {titulo.split('\n')[0]}
      </text>

      <text x={SVG_W - 2} y={9} fontSize={4} fontFamily="Arial" fill="#bbb" textAnchor="end">
        {PW}×{PH} u
      </text>
    </svg>
  )
}

// ─── Default form data ────────────────────────────────────────────────────────

const DEFAULT_DATA: TituloMontajeTbaData = {
  tbaIdentificador: 'TBA-0042',
  programaTipo:     'FTTH Acceso Local',
  centralSiglas:    'NCO',
  centralNombre:    'Nodo Central Oriente',
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

export function CPlanoMontajeTbaShowcase() {
  const [data, setData] = useState<TituloMontajeTbaData>(DEFAULT_DATA)
  const titulo = creaTituloMontajeTba(data)
  const flow   = describePlanFlowTba()

  const set = (field: keyof TituloMontajeTbaData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 290, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CPlanoMontajeTba</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Plano de montaje TBA · familia propia · no relacionado con Principales
        </Typography>
        <Chip label="Fase 5 — GIS/Layout" size="small" color="error"  sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="COMPLEJO"            size="small" color="info"   sx={{ mb: 1, mr: 0.5 }} />
        <Chip label="TBA Engine"          size="small" color="default" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Alert severity="info" sx={{ fontSize: 11, mb: 1.5, py: 0.5 }}>
          Única clase que llama <code>_super.genera_plano()</code>. Dos viewports
          (localizacion + ubicacion) en franja superior. Norte 1000u de ancho
          (vs 4000u en Principales). Título sin <code>.uppercase</code>.
        </Alert>

        <Typography variant="subtitle2" gutterBottom>Jerarquía</Typography>
        <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5, fontFamily: 'monospace', fontSize: 10 }}>
          CFactoryPlanos<br />
          └─ <strong>CPlanoMontajeTba</strong><br />
          &nbsp;&nbsp;&nbsp;&nbsp;slots: _oEngine (TbaEngine)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_oPafManager
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>genera_plano() — flujo</Typography>
        <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #a5d6a7', p: 1, borderRadius: 1, mb: 1.5 }}>
          {flow.map((step, i) => (
            <Typography key={i} variant="caption"
              sx={{ display: 'block', fontFamily: 'monospace', fontSize: 9.5, lineHeight: 1.6,
                fontWeight: step.includes('_super') ? 700 : undefined,
                color: step.includes('_super') ? '#1b5e20' : undefined }}>
              {step}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          crea_titulo() — 4 campos (sin .uppercase)
        </Typography>
        {(
          [
            ['tbaIdentificador', 'TBA identificador'],
            ['programaTipo',     'Programa tipo'],
            ['centralSiglas',    'Central siglas'],
            ['centralNombre',    'Central nombre'],
          ] as [keyof TituloMontajeTbaData, string][]
        ).map(([field, label]) => (
          <TextField key={field} size="small" fullWidth label={label}
            value={data[field]} onChange={set(field)} sx={{ mb: 0.75 }} />
        ))}

        <Box sx={{ bgcolor: '#e8f5e9', border: '1px solid #81c784', p: 1, borderRadius: 1, mt: 0.5, mb: 1.5 }}>
          <Typography variant="caption"
            sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 10, lineHeight: 1.6 }}>
            {titulo}
          </Typography>
        </Box>
        <Typography variant="caption" color="warning.main" sx={{ fontSize: 10 }}>
          El Magik original NO llama .uppercase — resultado en case mixto.
        </Typography>
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 340 }}>
        <Typography variant="subtitle2" gutterBottom>
          Diagrama de página — franja superior: VP Loc + VP Ubic + ConexEmpalme
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Dashed = elemento condicional o via generador_sellos. Sellos en mitad inferior.
        </Typography>
        <PageDiagram titulo={titulo} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Elementos clave</Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Método</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Descripción</TableCell>
              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 700 }}>Condición</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { m: 'AddMarco()',               d: 'c_marco 4×2, returns marco (no AddTitulo)',          c: '—' },
              { m: 'AddSellos()',              d: '3 sellos: ruta_cables_fo + estandar_base_fo + notas',c: '—' },
              { m: 'AddViewportLocalizacion()',d: 'c_vp_localizacion_tba, 1.5× buffer',                 c: 'irLocalizacionTba() ≠ null' },
              { m: 'AddViewportUbicacion()',   d: 'c_vp_ubicacion_tba, ACE varía en tba_en_gis?',       c: 'irUbicacionTba() ≠ null' },
              { m: 'AddParticulares()',        d: '5 generador_sellos + norte + conexEmpalme',          c: '—' },
              { m: 'AddConexionEmpalme()',     d: 'c_conexion_empalme diagrama de empalme',             c: 'cable+empalme ≠ null' },
              { m: 'agregar_elementos()',      d: 'anotacion + empalme + gasas del engine',             c: '—' },
              { m: 'crea_titulo()',            d: '"PLANO MONTAJE DE TBA\\ntba\\nprograma\\nctl"',      c: 'sin .uppercase' },
            ].map(row => (
              <TableRow key={row.m}>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, fontFamily: 'monospace' }}>{row.m}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: '#444' }}>{row.d}</TableCell>
                <TableCell sx={{ fontSize: 9.5, py: 0.4, color: row.c !== '—' ? '#e65100' : '#999' }}>
                  {row.c}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          VP Ubicacion — ACE condicional
        </Typography>
        <Box sx={{ bgcolor: '#f3e5f5', border: '1px solid #ce93d8', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: 9.5 }}>
          if (!tba_en_gis?):<br />
          &nbsp;&nbsp;ace_name = "{VIEWPORT_UBICACION_TBA.aceNameNonGis}"<br />
          else:<br />
          &nbsp;&nbsp;ace_name = "{VIEWPORT_UBICACION_TBA.aceNameGis}"<br />
          &nbsp;&nbsp;style_system_category = :{VIEWPORT_UBICACION_TBA.styleSystemCategory}<br />
          &nbsp;&nbsp;display_style = "{VIEWPORT_UBICACION_TBA.displayStyle}"
        </Box>
      </Box>
    </Box>
  )
}
