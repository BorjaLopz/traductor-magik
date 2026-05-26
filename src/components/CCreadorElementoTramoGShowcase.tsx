import { useMemo, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider, Grid,
  IconButton, List, ListItem, ListItemText, MenuItem, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import {
  CCreadorElementoTramoG,
  type GisRecord,
  type IElementoTramoG,
  type SpliceClosureRecord,
} from '../models/CCreadorElementoTramoG'

interface ProducedItem {
  step:        number
  cveSello:    string
  inputKind:   string
  inputId:     string
  tipoEmp?:    string
  resultKind:  string
  configurado: boolean
}

const KIND_COLOR: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'default'> = {
  empalme:              'primary',
  empalme_derivacion:   'secondary',
  empalme_subterraneo:  'warning',
  seccion:              'success',
  nodo:                 'info',
}

const SAMPLE_INPUTS: GisRecord[] = [
  { kind: 'splice_closure', id: 'SC-001', 'user!_tipo_emp': 'DERIVACION' },
  { kind: 'splice_closure', id: 'SC-002', 'user!_tipo_emp': 'PRINCIPAL' },
  { kind: 'sheath',         id: 'SH-101', longitud: 540 },
  { kind: 'building',       id: 'BD-A12', nombre: 'CEDO XOLA' },
]

export function CCreadorElementoTramoGShowcase() {
  const [cveSello, setCveSello]       = useState<string>('ET')
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [tipoEmp, setTipoEmp]         = useState<string>('DERIVACION')
  const [produced, setProduced]       = useState<ProducedItem[]>([])

  const factory = useMemo(() => new CCreadorElementoTramoG(cveSello), [cveSello])

  const sampleInput = SAMPLE_INPUTS[selectedIdx]
  const effectiveInput: GisRecord = useMemo(() => {
    if (sampleInput.kind === 'splice_closure') {
      return { ...sampleInput, 'user!_tipo_emp': tipoEmp } satisfies SpliceClosureRecord
    }
    return sampleInput
  }, [sampleInput, tipoEmp])

  const onCrear = () => {
    let result: IElementoTramoG | undefined
    let error: string | undefined
    try {
      result = factory.creaElementoTramo(effectiveInput)
    } catch (e) {
      error = (e as Error).message
    }
    if (!result) {
      // mostrar el error en la lista
      setProduced(prev => [
        ...prev,
        {
          step: prev.length + 1,
          cveSello,
          inputKind: effectiveInput.kind,
          inputId:   effectiveInput.id,
          tipoEmp:   effectiveInput.kind === 'splice_closure' ? effectiveInput['user!_tipo_emp'] : undefined,
          resultKind: `error: ${error ?? 'desconocido'}`,
          configurado: false,
        },
      ])
      return
    }
    setProduced(prev => [
      ...prev,
      {
        step:        prev.length + 1,
        cveSello,
        inputKind:   effectiveInput.kind,
        inputId:     effectiveInput.id,
        tipoEmp:     effectiveInput.kind === 'splice_closure' ? effectiveInput['user!_tipo_emp'] : undefined,
        resultKind:  result.kind,
        configurado: result.configurado,
      },
    ])
  }

  const isSplice = sampleInput.kind === 'splice_closure'

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        c_creador_elemento_tramo_g
        <Chip label="Fase 1 · SIMPLE · score 10" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="factory" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/c_creador_elemento_tramo_g.magik</code> — package <code>user</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Inputs factory + record */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Inputs"
              subheader="sCveSello + RoElemento (is_kind_of? cascade)"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="new(RsCveSello)"
                  value={cveSello}
                  onChange={e => setCveSello(e.target.value)}
                  size="small"
                  fullWidth
                  helperText='"ET" = estudio de transmisión · cualquier otro → subterráneo'
                />

                <Divider />

                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={selectedIdx}
                  onChange={(_, v) => v !== null && setSelectedIdx(v as number)}
                >
                  {SAMPLE_INPUTS.map((s, i) => (
                    <ToggleButton key={s.id} value={i}>
                      {s.kind} · {s.id}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                {isSplice && (
                  <TextField
                    select
                    label="user!_tipo_emp"
                    value={tipoEmp}
                    onChange={e => setTipoEmp(e.target.value)}
                    size="small"
                    fullWidth
                    helperText='Sólo lee la rama "ET" → DERIVACION vs resto'
                  >
                    <MenuItem value="DERIVACION">DERIVACION</MenuItem>
                    <MenuItem value="PRINCIPAL">PRINCIPAL</MenuItem>
                    <MenuItem value="MULTIPUNTO">MULTIPUNTO</MenuItem>
                  </TextField>
                )}

                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                  <div>RoElemento.kind = "{effectiveInput.kind}"</div>
                  <div>RoElemento.id   = "{effectiveInput.id}"</div>
                  {effectiveInput.kind === 'splice_closure' && (
                    <div>user!_tipo_emp = "{effectiveInput['user!_tipo_emp']}"</div>
                  )}
                </Box>

                <Button variant="contained" size="small" onClick={onCrear}>
                  Crea_Elemento_Tramo()
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de dispatch + producidos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Resultado factory"
              subheader="Tabla de dispatch + lista de elementos producidos"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Alert severity="info" sx={{ fontSize: 11, mb: 1.5 }}>
                splice_closure + ET + DERIVACION → <code>empalme_derivacion</code><br />
                splice_closure + ET + otro       → <code>empalme</code><br />
                splice_closure + ≠ ET            → <code>empalme_subterraneo</code><br />
                sheath   → <code>seccion</code><br />
                building → <code>nodo</code>
              </Alert>

              {produced.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Sin producciones todavía.
                </Typography>
              ) : (
                <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
                  {produced.map(p => (
                    <ListItem
                      key={p.step}
                      disableGutters
                      secondaryAction={
                        <Chip
                          label={p.resultKind}
                          size="small"
                          color={KIND_COLOR[p.resultKind] ?? 'default'}
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            #{p.step} · cve={p.cveSello} · {p.inputKind}({p.inputId}){p.tipoEmp ? `, tipo=${p.tipoEmp}` : ''}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.secondary' }}>
                            configurado = {String(p.configurado)}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {produced.length > 0 && (
                <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton size="small" onClick={() => setProduced([])}>✕</IconButton>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
