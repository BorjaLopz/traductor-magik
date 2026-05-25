import { useState, useMemo } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, TextField, Typography, Stack, Tooltip,
} from '@mui/material'
import { CPlanoE, type PlanoRecord } from '../models/CPlanoE'

const DEFAULTS: PlanoRecord = {
  'user!_proyecto':   'PROY-2025-001',
  'user!_nombre':     'Plano Red Secundaria Norte',
  'user!_tipo':       'construccion',
  'user!_comentario': 'Incluye tramo canalizado Av. Insurgentes',
}

export function CPlanoEShowcase() {
  const [record, setRecord] = useState<PlanoRecord>(DEFAULTS)

  const plano = useMemo(() => new CPlanoE(record), [record])

  const update = (key: keyof PlanoRecord) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setRecord(prev => ({ ...prev, [key]: e.target.value || undefined }))

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        CPlanoE
        <Chip label="Fase 1 · SIMPLE · score 1" size="small" sx={{ ml: 1.5 }} color="success" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/Sellos/Entidad/c_plano_e.magik</code>
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Input — simula el record GIS */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="PlanoRecord (input GIS)"
              subheader="Simula el objeto que llega del dataset Smallworld"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="user!_proyecto"
                  value={record['user!_proyecto']}
                  onChange={update('user!_proyecto')}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="user!_nombre"
                  value={record['user!_nombre']}
                  onChange={update('user!_nombre')}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="user!_tipo"
                  value={record['user!_tipo']}
                  onChange={update('user!_tipo')}
                  size="small"
                  fullWidth
                  helperText="getter aplica .toUpperCase() — prueba en minúsculas"
                />
                <TextField
                  label="user!_comentario (opcional)"
                  value={record['user!_comentario'] ?? ''}
                  onChange={update('user!_comentario')}
                  size="small"
                  fullWidth
                  helperText="Vacío → undefined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Output — getters de CPlanoE */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="CPlanoE (output getters)"
              subheader="new CPlanoE(record) — valores en tiempo real"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                <GetterRow label=".proyecto" value={plano.proyecto} />
                <GetterRow label=".nombre"   value={plano.nombre} />
                <GetterRow
                  label=".tipo"
                  value={plano.tipo}
                  note="Magik: .sTipo.uppercase"
                  highlight
                />
                <GetterRow
                  label=".comentario"
                  value={plano.comentario}
                  isOptional
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function GetterRow({
  label,
  value,
  note,
  highlight,
  isOptional,
}: {
  label: string
  value: string | undefined
  note?: string
  highlight?: boolean
  isOptional?: boolean
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
      <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace', minWidth: 120 }}>
        {label}
      </Typography>
      <Tooltip title={note ?? ''} placement="top" disableHoverListener={!note}>
        <Typography
          variant="body2"
          sx={{ fontWeight: highlight ? 700 : 400, fontFamily: 'monospace' }}
          color={value === undefined ? 'text.disabled' : 'text.primary'}
        >
          {value === undefined ? 'undefined' : value}
        </Typography>
      </Tooltip>
      {isOptional && (
        <Chip label="string | undefined" size="small" variant="outlined" sx={{ fontSize: 10 }} />
      )}
      {note && (
        <Typography variant="caption" color="text.secondary">
          ← {note}
        </Typography>
      )}
    </Box>
  )
}
