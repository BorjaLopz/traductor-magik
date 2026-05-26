import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, FormControlLabel, Grid, MenuItem,
  Stack, Switch, TextField, Typography,
} from '@mui/material'
import { CTraductor, TRADUCTOR_TABLAS } from '../models/CTraductor'

type MethodKey =
  | 'tipoSuperficie'
  | 'mes'
  | 'tipoCentral'
  | 'metodoPep'
  | 'tipoPlano'
  | 'tipoCaseta'
  | 'nombreAtributoPep'

const METHODS: { key: MethodKey; label: string; magik: string }[] = [
  { key: 'tipoSuperficie',     label: 'tipoSuperficie',     magik: 'Tipo_Superficie(PsTipo_Sup)' },
  { key: 'mes',                label: 'mes',                magik: 'Mes(PnNumeroMes, _optional formato_largo?)' },
  { key: 'tipoCentral',        label: 'tipoCentral',        magik: 'Tipo_Central(PsTipoCtl)' },
  { key: 'metodoPep',          label: 'metodoPep',          magik: 'metodo_pep(PsPEPSel)' },
  { key: 'tipoPlano',          label: 'tipoPlano',          magik: 'tipo_plano(Id_Tipo_Plano)' },
  { key: 'tipoCaseta',         label: 'tipoCaseta',         magik: 'tipo_caseta(p_descripcion)' },
  { key: 'nombreAtributoPep',  label: 'nombreAtributoPep',  magik: 'nombre_atributo_pep(psym_nombre_pep)' },
]

export function CTraductorShowcase() {
  const traductor = useMemo(() => new CTraductor(), [])
  const [method, setMethod]       = useState<MethodKey>('tipoSuperficie')
  const [key, setKey]             = useState<string>('Acera')
  const [formatoLargo, setFmt]    = useState<boolean>(false)
  const [mesNum, setMesNum]       = useState<number>(1)

  const tablas: Record<MethodKey, Record<string, string> | undefined> = {
    tipoSuperficie:    TRADUCTOR_TABLAS.tipoSuperficie,
    tipoCentral:       TRADUCTOR_TABLAS.tipoCentral,
    metodoPep:         TRADUCTOR_TABLAS.metodoPep,
    tipoPlano:         TRADUCTOR_TABLAS.tipoPlano,
    tipoCaseta:        TRADUCTOR_TABLAS.tipoCaseta,
    nombreAtributoPep: TRADUCTOR_TABLAS.nombreAtributoPep,
    mes:               undefined,
  }

  const defaultsByMethod: Record<MethodKey, string> = {
    tipoSuperficie:    '""',
    tipoCentral:       '"CTL"',
    metodoPep:         'undefined (sin default en Magik)',
    tipoPlano:         '""',
    tipoCaseta:        '""',
    nombreAtributoPep: 'undefined (tabla local sin default)',
    mes:               '""',
  }

  const callMethod = (): string => {
    switch (method) {
      case 'tipoSuperficie':    return traductor.tipoSuperficie(key)
      case 'tipoCentral':       return traductor.tipoCentral(key)
      case 'metodoPep':         return traductor.metodoPep(key) ?? '_unset'
      case 'tipoPlano':         return traductor.tipoPlano(key)
      case 'tipoCaseta':        return traductor.tipoCaseta(key)
      case 'nombreAtributoPep': return traductor.nombreAtributoPep(key) ?? '_unset'
      case 'mes':               return traductor.mes(mesNum, formatoLargo)
    }
  }

  const result = callMethod()
  const tabla  = tablas[method]
  const tablaKeys = tabla ? Object.keys(tabla) : []

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_Traductor
        <Chip label="Fase 1 · SIMPLE · score 9" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_traductor.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Selector + inputs */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Método"
              subheader={METHODS.find(m => m.key === method)?.magik}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select
                  label="método"
                  value={method}
                  onChange={e => {
                    const v = e.target.value as MethodKey
                    setMethod(v)
                    const t = tablas[v]
                    if (t) setKey(Object.keys(t)[0])
                  }}
                  size="small"
                  fullWidth
                >
                  {METHODS.map(m => <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>)}
                </TextField>

                {method === 'mes' ? (
                  <>
                    <TextField
                      select
                      label="PnNumeroMes"
                      value={mesNum}
                      onChange={e => setMesNum(Number(e.target.value))}
                      size="small"
                      fullWidth
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                      ))}
                      <MenuItem value={0}>0 (fuera de rango)</MenuItem>
                      <MenuItem value={13}>13 (fuera de rango)</MenuItem>
                    </TextField>
                    <FormControlLabel
                      control={<Switch checked={formatoLargo} onChange={e => setFmt(e.target.checked)} />}
                      label={`formato_largo? = ${formatoLargo ? '_true' : '_false'}`}
                    />
                  </>
                ) : (
                  <TextField
                    select
                    label="argumento (key)"
                    value={tablaKeys.includes(key) ? key : '__custom'}
                    onChange={e => {
                      if (e.target.value === '__custom') setKey('clave_inexistente')
                      else setKey(e.target.value)
                    }}
                    size="small"
                    fullWidth
                  >
                    {tablaKeys.map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                    <MenuItem value="__custom">— probar key inexistente —</MenuItem>
                  </TextField>
                )}

                {method !== 'mes' && (
                  <TextField
                    label="key (editable)"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    size="small"
                    fullWidth
                  />
                )}

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  <div>default_value = {defaultsByMethod[method]}</div>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultado + tabla */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Resultado"
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
              <Box sx={{ p: 2, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 14 }}>
                → "{result}"
              </Box>

              {tabla && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
                    Tabla completa ({Object.keys(tabla).length} entradas)
                  </Typography>
                  <Box sx={{ maxHeight: 280, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <Box component="th" sx={{ textAlign: 'left', p: 0.5, bgcolor: 'action.hover' }}>key</Box>
                          <Box component="th" sx={{ textAlign: 'left', p: 0.5, bgcolor: 'action.hover' }}>value</Box>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(tabla).map(([k, v]) => (
                          <tr key={k} style={k === key ? { background: '#fff3cd' } : undefined}>
                            <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>{k}</Box>
                            <Box component="td" sx={{ p: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>{v}</Box>
                          </tr>
                        ))}
                      </tbody>
                    </Box>
                  </Box>
                </>
              )}

              {method === 'mes' && (
                <Box sx={{ mt: 2, fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                  Tabla generada al vuelo (Magik la reconstruye en cada llamada).
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
