import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import {
  titleForTipo,
  keysOrder,
  descFromKey,
  applyExternalNamePrefix,
  buildEstructuraKey,
  buildElementoKey,
  buildFigureEightLabel,
  resolveDescKind,
  KEY_PARTS_COLLECTIONS,
  COL_WIDTHS,
  ROW_HEIGHT,
  TABLE_NAME,
  CListaMaterialesEsquemaRed,
  type TipoLista,
  type DescKind,
} from '../models/CListaMaterialesEsquemaRed'

// ─── Desc-kind badge ──────────────────────────────────────────────────────────

const KIND_COLOR: Record<DescKind, string> = {
  sheath:   '#e8f5e9',
  specId:   '#e3f2fd',
  tipoConex:'#fce4ec',
  keyParts: '#fff8e1',
  extName:  '#f3e5f5',
}

const KIND_LABEL: Record<DescKind, string> = {
  sheath:   'sheath → buildSheathDesc',
  specId:   'spec_id → spec_id',
  tipoConex:'tipoConex → user!_tipo_conexion',
  keyParts: 'keyParts → descFromKey(key)',
  extName:  'extName → external_name',
}

// ─── Interactive desc-kind demo ───────────────────────────────────────────────

function DescKindDemo() {
  const [collName,      setCollName]      = useState('underground_route')
  const [hasSpecId,     setHasSpecId]     = useState(false)
  const [hasTipoConex,  setHasTipoConex]  = useState(false)
  const [externalName,  setExternalName]  = useState('CEDO')
  const [descMatRaw,    setDescMatRaw]    = useState('')
  const [sampleKey,     setSampleKey]     = useState('underground_route|ZANJA ABIERTA')

  const kind        = resolveDescKind(collName, hasSpecId, hasTipoConex)
  const fixedDesc   = applyExternalNamePrefix(descMatRaw, externalName)

  const COLL_OPTIONS = [
    'sheath', 'underground_route', 'figure_eight', 'user!_terminal_fo',
    'uub', 'mit_internal_connection', 'node', 'splice_closure',
  ]

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        resolveDescKind — decision tree
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">collName</Typography>
          <Select
            value={collName} size="small" fullWidth
            onChange={e => setCollName(e.target.value)}
            sx={{ mt: 0.5 }}
          >
            {COLL_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">capabilities</Typography>
          <Box>
            <FormControlLabel
              control={<Switch size="small" checked={hasSpecId}    onChange={e => setHasSpecId(e.target.checked)} />}
              label={<Typography variant="caption">hasSpecId</Typography>}
              sx={{ display: 'block' }}
            />
            <FormControlLabel
              control={<Switch size="small" checked={hasTipoConex} onChange={e => setHasTipoConex(e.target.checked)} />}
              label={<Typography variant="caption">hasTipoConexion</Typography>}
              sx={{ display: 'block' }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: KIND_COLOR[kind], p: 1.5, borderRadius: 1, mb: 1.5, border: '1px solid #ddd' }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          resolveDescKind("{collName}", {String(hasSpecId)}, {String(hasTipoConex)}) = "{kind}"
        </Typography><br />
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#555' }}>
          → {KIND_LABEL[kind]}
        </Typography>
      </Box>

      {/* If keyParts kind, show descFromKey demo */}
      {kind === 'keyParts' && (
        <Box sx={{ bgcolor: '#fff8e1', p: 1, borderRadius: 1, mb: 1.5 }}>
          <TextField
            label="key (iterkey)" value={sampleKey} size="small" fullWidth sx={{ mb: 0.5 }}
            onChange={e => setSampleKey(e.target.value)}
          />
          <Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>
            descFromKey("{sampleKey}") → "{descFromKey(sampleKey)}"
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      {/* applyExternalNamePrefix demo */}
      <Typography variant="subtitle2" gutterBottom>applyExternalNamePrefix — CEDO/empty fix</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
        <TextField
          label="descMat" value={descMatRaw} size="small"
          onChange={e => setDescMatRaw(e.target.value)}
          helperText='empty = triggers prefix'
        />
        <TextField
          label="externalName" value={externalName} size="small"
          onChange={e => setExternalName(e.target.value)}
          helperText='"CEDO" = triggers prefix'
        />
      </Box>
      <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
        applyExternalNamePrefix("{descMatRaw}", "{externalName}")<br />
        <b>→ "{fixedDesc}"</b><br />
        trigger: {!descMatRaw ? '!descMat=true' : externalName === 'CEDO' ? 'externalName="CEDO"' : 'no prefix applied'}
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Reference table */}
      <Typography variant="subtitle2" gutterBottom>Todos los casos (decisión en orden)</Typography>
      <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 10.5, width: '100%' }}>
        <thead>
          <tr>
            {['#', 'Condición Magik', 'DescKind', 'Valor resultante'].map(h => (
              <Box component="th" key={h} sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['1', 'source_collection.name _is :sheath',              'sheath',   'external_name + clase + fiber_qty'],
            ['2', 'responds_to?(:spec_id)',                           'specId',   'spec_id.write_string'],
            ['3', 'responds_to?(:user!_tipo_conexion)',               'tipoConex','user!_tipo_conexion.write_string'],
            ['4', 'collection _is :underground_route | :figure_eight | :user!_terminal_fo | :uub', 'keyParts', 'Iterkey.split_by("|")[2]'],
            ['5', '(else)',                                           'extName',  'source_collection.external_name'],
            ['+', 'post: desc="" OR external_name="CEDO"',           '—',        'prepend external_name'],
          ].map(([n, cond, k, val]) => (
            <tr key={n} style={{ background: k !== '—' ? KIND_COLOR[k as DescKind] ?? 'white' : '#fff' }}>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontWeight: 'bold' }}>{n}</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 9.5 }}>{cond}</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace' }}>{k}</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, color: '#333', fontSize: 10 }}>{val}</Box>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}

// ─── Key builder demo ─────────────────────────────────────────────────────────

function KeyBuilderDemo() {
  const [eCollName,   setECollName]   = useState('underground_route')
  const [eTipoObra,   setETipoObra]   = useState('ZANJA ABIERTA')
  const [eSpecId,     setESpecId]     = useState('TUB-100')

  const [elCollName,  setElCollName]  = useState('node')
  const [elSpecId,    setElSpecId]    = useState('NDS-12')
  const [feExtName,   setFeExtName]   = useState('CABLE FO ')
  const [feClase,     setFeClase]     = useState('A')
  const [feFibers,    setFeFibers]    = useState(12)

  const estructKey = buildEstructuraKey(eCollName,
    eCollName === 'underground_route' ? eTipoObra : undefined,
    eCollName === 'uub' ? eSpecId : undefined,
  )
  const feLabel    = buildFigureEightLabel(feExtName, feClase, feFibers)
  const elemKey    = buildElementoKey(elCollName,
    elCollName !== 'figure_eight' ? elSpecId || undefined : undefined,
    elCollName === 'figure_eight' ? feLabel : undefined,
  )

  const ESTRUCT_COLLS = ['underground_route', 'uub', 'figure_eight', 'other_struct']
  const ELEM_COLLS    = ['node', 'splice_closure', 'figure_eight', 'mit_internal_connection', 'other']

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>buildEstructuraKey</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end', mb: 1 }}>
        <Box sx={{ minWidth: 160 }}>
          <Typography variant="caption" color="text.secondary">collName</Typography>
          <Select value={eCollName} size="small" fullWidth sx={{ mt: 0.5 }} onChange={e => setECollName(e.target.value)}>
            {ESTRUCT_COLLS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </Box>
        {eCollName === 'underground_route' && (
          <TextField label="tipoObraCo" value={eTipoObra} size="small" onChange={e => setETipoObra(e.target.value)} />
        )}
        {eCollName === 'uub' && (
          <TextField label="specId" value={eSpecId} size="small" onChange={e => setESpecId(e.target.value)} />
        )}
      </Box>
      <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 2 }}>
        buildEstructuraKey("{eCollName}", ...) → "{estructKey}"
      </Box>

      <Typography variant="subtitle2" gutterBottom>buildElementoKey · buildFigureEightLabel</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end', mb: 1 }}>
        <Box sx={{ minWidth: 160 }}>
          <Typography variant="caption" color="text.secondary">collName</Typography>
          <Select value={elCollName} size="small" fullWidth sx={{ mt: 0.5 }} onChange={e => setElCollName(e.target.value)}>
            {ELEM_COLLS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </Box>
        {elCollName !== 'figure_eight' && (
          <TextField label="specId (optional)" value={elSpecId} size="small"
            onChange={e => setElSpecId(e.target.value)}
            helperText="leave empty for bare key"
          />
        )}
        {elCollName === 'figure_eight' && (
          <>
            <TextField label="externalName" value={feExtName} size="small" onChange={e => setFeExtName(e.target.value)} />
            <TextField label="clase" value={feClase} size="small" sx={{ width: 60 }} onChange={e => setFeClase(e.target.value)} />
            <TextField label="fiberQty" type="number" value={feFibers} size="small" sx={{ width: 80 }} onChange={e => setFeFibers(Number(e.target.value))} />
          </>
        )}
      </Box>
      {elCollName === 'figure_eight' && (
        <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#fff8e1', p: 0.75, borderRadius: 1, mb: 0.5 }}>
          buildFigureEightLabel("{feExtName}", "{feClase}", {feFibers}) → "{feLabel}"
        </Box>
      )}
      <Box sx={{ fontFamily: 'monospace', fontSize: 11, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
        buildElementoKey("{elCollName}", ...) → "{elemKey}"
      </Box>
    </Box>
  )
}

// ─── Comparison vs CListaMaterialesEsquema ────────────────────────────────────

function ComparisonPanel() {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        CListaMaterialesEsquemaRed vs CListaMaterialesEsquema
      </Typography>
      <Box component="table" sx={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
        <thead>
          <tr>
            {['Aspecto', 'CListaMaterialesEsquema', 'CListaMaterialesEsquemaRed'].map(h => (
              <Box component="th" key={h} sx={{ border: '1px solid #ddd', px: 1, py: 0.4, background: '#f5f5f5', textAlign: 'left' }}>{h}</Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Base class',          'CBaseSelloFibra',           'CBaseSelloFibra'],
            ['tipo slot',           "'red' | 'estructuras'",     "'red' | 'estructuras' (igual)"],
            ['Table geometry',      '[6,60,35,20] mm / 6mm rows','[6,60,35,20] mm / 6mm rows (igual)'],
            ['etiqueta_celdas',     'titleForTipo + headers',    'identical'],
            ['keys_Order',          'keysOrder (natural sort)',   're-used (shared)'],
            ['llena_datos_celdas',  'descFromKey(key) only',     '5-branch desc_mat + CEDO fix'],
            ['select_from_map',     'estructuras + elementos',   '+ fusion counting (mit_internal_connection)'],
            ['Key for underground_route','collName+"|"',         'collName+"|"+tipo_obra_co'],
            ['Key for uub',         'collName+"|"',              'collName+"|"+spec_id'],
            ['Key for figure_eight','collName+"|"',              'collName+"|"+external_name+clase+qty+"metros"'],
            ['desc sheath branch',  'descFromKey only',          'buildSheathDesc (external_name+clase+qty)'],
            ['desc CEDO fix',       'not present',               'applyExternalNamePrefix'],
          ].map(([asp, base, red]) => (
            <tr key={asp}>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontWeight: 'bold', fontSize: 10.5 }}>{asp}</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10 }}>{base}</Box>
              <Box component="td" sx={{ border: '1px solid #eee', px: 1, py: 0.3, fontFamily: 'monospace', fontSize: 10,
                bgcolor: base !== red && red !== 'identical' ? '#fffde7' : 'transparent' }}>{red}</Box>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}

// ─── Main showcase ─────────────────────────────────────────────────────────────

export function CListaMaterialesEsquemaRedShowcase() {
  const [tipo, setTipo] = useState<TipoLista>('red')

  function handleTipo(_: unknown, val: TipoLista | null) { if (val) setTipo(val) }

  const inst = CListaMaterialesEsquemaRed.newWith(tipo)

  return (
    <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap' }}>

      {/* ── Left panel ── */}
      <Box sx={{ width: 300, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>CListaMaterialesEsquemaRed</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Lista de materiales RED para planos esquema · extends CBaseSelloFibra
        </Typography>
        <Chip label="Fase 5 — GIS" size="small" color="warning" sx={{ mb: 1, mr: 1 }} />
        <Chip label="MODERADO" size="small" color="info" sx={{ mb: 1 }} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>tipo (slot)</Typography>
        <ToggleButtonGroup
          value={tipo} exclusive onChange={handleTipo} size="small" sx={{ mb: 1.5 }}
        >
          <ToggleButton value="red">red</ToggleButton>
          <ToggleButton value="estructuras">estructuras</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ bgcolor: '#fffde7', p: 1, borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            inst.tipo = "{inst.tipo}"<br />
            titleForTipo → "{titleForTipo(tipo)}"
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Colecciones con key especial</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10.5, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1.5 }}>
          <b>Estructuras:</b><br />
          {KEY_PARTS_COLLECTIONS.map(c => (
            <div key={c} style={{ color: c === 'underground_route' || c === 'uub' ? '#1565c0' : '#555' }}>
              {c === 'underground_route' && '→ name|tipo_obra_co'}
              {c === 'uub' && '→ name|spec_id'}
              {c !== 'underground_route' && c !== 'uub' && `${c} → name|`}
            </div>
          ))}
          <br /><b>Fusiones:</b><br />
          mit_internal_connection → key :mit_internal_connection<br />
          (solo tipo_conexion="FUSION" + PROYECTADO)
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>Tabla</Typography>
        <Typography variant="caption" color="text.secondary">
          {TABLE_NAME} · [{COL_WIDTHS.join('+')}] mm · {ROW_HEIGHT} mm/fila<br />
          Filas = 2 + ht.size (Fase 5)
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>GIS stubs</Typography>
        {['configurarTabla', 'etiquetarCeldas', 'actualizarDatos', 'llenarDatosCeldas',
          'obtenerListaMateriales', 'elementosDeProyecto', 'selectFromMap'].map(m => (
          <Chip key={m} label={m} size="small" color="warning"
            sx={{ mr: 0.5, mb: 0.5, fontSize: 9, height: 18 }} />
        ))}
      </Box>

      {/* ── Right panel ── */}
      <Box sx={{ flex: 1, minWidth: 340 }}>

        <DescKindDemo />

        <Divider sx={{ my: 2 }} />

        <KeyBuilderDemo />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          keysOrder — natural sort (re-used from CListaMaterialesEsquema)
        </Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 10.5, bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 2 }}>
          {(() => {
            const keys = ['sheath|12F', 'node|2', 'underground_route|ZANJA', 'node|10', 'sheath|48F', 'node|1']
            return (
              <>
                <div>input:  {JSON.stringify(keys)}</div>
                <div>sorted: {JSON.stringify(keysOrder(keys))}</div>
              </>
            )
          })()}
        </Box>

        <Divider sx={{ my: 2 }} />

        <ComparisonPanel />
      </Box>
    </Box>
  )
}
