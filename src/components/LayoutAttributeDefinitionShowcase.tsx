import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider, FormControlLabel,
  Grid, MenuItem, Stack, Switch, TextField, Typography,
} from '@mui/material'
import { LayoutAttributeDefinition, type LayoutAttributeType } from '../models/LayoutAttributeDefinition'

interface Row {
  attr:  LayoutAttributeDefinition
  show:  boolean
}

const INITIAL: { name: string; type: LayoutAttributeType; show: boolean }[] = [
  { name: 'outline',         type: 'reference', show: true  },
  { name: 'fill',            type: 'reference', show: true  },
  { name: 'shadow',          type: 'boolean',   show: true  },
  { name: 'locked',          type: 'boolean',   show: true  },
  { name: 'modificados',     type: 'boolean',   show: false },
  { name: 'elementosBdGis',  type: 'reference', show: false },
]

export function LayoutAttributeDefinitionShowcase() {
  const initialRows: Row[] = useMemo(
    () => INITIAL.map(spec => {
      const a = new LayoutAttributeDefinition(spec.name, spec.type)
      a.allowedOnPropertiesPage = spec.show
      return { attr: a, show: spec.show }
    }),
    [],
  )
  const [rows, setRows] = useState<Row[]>(initialRows)

  const [draftName, setDraftName] = useState<string>('')
  const [draftType, setDraftType] = useState<LayoutAttributeType>('string')

  const toggle = (i: number, val: boolean) => {
    setRows(prev => {
      const next = [...prev]
      next[i].attr.allowedOnPropertiesPage = val
      next[i] = { attr: next[i].attr, show: val }
      return next
    })
  }

  const addAttr = () => {
    if (!draftName.trim()) return
    const a = new LayoutAttributeDefinition(draftName.trim(), draftType)
    a.allowedOnPropertiesPage = true
    setRows(prev => [...prev, { attr: a, show: true }])
    setDraftName('')
  }

  const visibles = rows.filter(r => r.show)

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        layout_attribute_definition
        <Chip label="Fase 1 · SIMPLE · score 1" size="small" sx={{ ml: 1.5 }} color="success" />
        <Chip label="extension :sw" size="small" variant="outlined" sx={{ ml: 1 }} />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/layout_attribute_definition.magik</code> — package <code>sw</code>
      </Typography>

      <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
        Añade un setter que escribe <code>.properties[:allowed_on_properties_page?]</code>.
        Controla si el atributo aparece en la ventana de propiedades de un <code>layout_element</code>.
      </Typography>

      <Grid container spacing={3}>
        {/* Lista atributos */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardHeader
              title="Atributos definidos"
              subheader={`${rows.length} totales · ${visibles.length} visibles en properties_page`}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Box component="table" sx={{ width: '100%', fontFamily: 'monospace', fontSize: 12, borderCollapse: 'collapse', '& th, & td': { p: 0.75, borderBottom: '1px solid', borderColor: 'divider', textAlign: 'left' } }}>
                <thead>
                  <tr>
                    <Box component="th" sx={{ color: 'text.secondary' }}>name</Box>
                    <Box component="th" sx={{ color: 'text.secondary' }}>type</Box>
                    <Box component="th" sx={{ color: 'text.secondary' }}>:allowed_on_properties_page?</Box>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.attr.name}>
                      <Box component="td">{r.attr.name}</Box>
                      <Box component="td" sx={{ color: 'primary.main' }}>{r.attr.type}</Box>
                      <Box component="td">
                        <FormControlLabel
                          control={<Switch size="small" checked={r.show} onChange={e => toggle(i, e.target.checked)} />}
                          label={<Box sx={{ fontFamily: 'monospace', fontSize: 11 }}>{r.show ? '_true' : '_false'}</Box>}
                          sx={{ m: 0 }}
                        />
                      </Box>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1}>
                <TextField
                  label="name"
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  label="type"
                  value={draftType}
                  onChange={e => setDraftType(e.target.value as LayoutAttributeType)}
                  size="small"
                  sx={{ width: 120 }}
                >
                  <MenuItem value="string">string</MenuItem>
                  <MenuItem value="number">number</MenuItem>
                  <MenuItem value="boolean">boolean</MenuItem>
                  <MenuItem value="reference">reference</MenuItem>
                </TextField>
                <Box component="button"
                  onClick={addAttr}
                  sx={{ px: 2, borderRadius: 1, border: '1px solid', borderColor: 'primary.main', bgcolor: 'primary.main', color: '#fff', cursor: 'pointer', fontFamily: 'monospace' }}
                >
                  +
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Properties Page preview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined">
            <CardHeader
              title="Properties page (layout_element)"
              subheader="Sólo se muestran atributos con allowed_on_properties_page? = _true"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              {visibles.length === 0 ? (
                <Typography variant="body2" color="text.disabled">
                  Sin atributos visibles.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {visibles.map(v => (
                    <Box key={v.attr.name} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', fontSize: 12 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{v.attr.name}</span>
                        <Box component="span" sx={{ color: 'text.secondary' }}>{v.attr.type}</Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                .properties (raw)
              </Typography>
              <Box sx={{ mt: 0.5, p: 1, bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: 1, fontFamily: 'monospace', fontSize: 11 }}>
                {rows.map(r => (
                  <div key={r.attr.name}>
                    {r.attr.name}.properties[:allowed_on_properties_page?] = {String(r.show)}
                  </div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
