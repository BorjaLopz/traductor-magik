import { useMemo, useState } from 'react'
import {
  Box, Card, CardContent, CardHeader, Chip, Divider,
  Grid, MenuItem, TextField, Typography, Stack, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  configurePrinterForCentralizedPlot,
  defaultWindcplotOptions,
  devmodeSettings,
  type CentralizaPlanosConfig,
  type DevmodeSettingsArgs,
  type PrintSetupDialog,
} from '../models/PlotFilter'

const MOCK_DIALOG: PrintSetupDialog = {
  valueNames: [
    'dmDeviceName',
    'dmOrientation',
    'dmPaperSize',
    'dmPaperLength',
    'dmPaperWidth',
    'dmScale',
    'dmCopies',
    'dmPrintQuality',
    'dmColor',
    'dmYResolution',
    'wDevice',
  ],
  values: {
    dmDeviceName:   'HP_LaserJet_Trunc',
    dmOrientation:  1,
    dmPaperSize:    9,
    dmPaperLength:  297,
    dmPaperWidth:   210,
    dmScale:        100,
    dmCopies:       1,
    dmPrintQuality: 300,
    dmColor:        1,
    dmYResolution:  300,
    wDevice:        'HP_LaserJet_Color_Pro_M281fdw_Departamento_Ingenieria',
  },
}

const MOCK_CONFIG: CentralizaPlanosConfig = {
  servidorCache: 'SRV-CACHE-01',
  hostName:      'SRV-CACHE-01',
  impresoraPdf:  'PDFCreator',
  impresora:     'PDFCreator-Centralizado',
  tamanoPapel:   [841, 594],
}

type Mode = 'saved' | 'server-cache' | 'centraliza' | 'standard'

const MODE_INFO: Record<Mode, { label: string; desc: string }> = {
  'saved':        { label: 'saved cache',     desc: 'saved_settings? = _true Y .properties[:saved_devmode_settings] _isnt _unset → devuelve cache' },
  'server-cache': { label: 'server cache',    desc: 'servidor_cache == host_name Y impresoraPdf == printer → configura_impresora_para_centralizar_plano' },
  'centraliza':   { label: 'centraliza',      desc: 'printer == cp.impresora → configura_impresora_para_centralizar_plano' },
  'standard':     { label: 'standard dm*',    desc: 'caso por defecto → itera dm* con dmDeviceName ← wDevice (workaround 32-char Win32)' },
}

export function PlotFilterShowcase() {
  const [mode, setMode] = useState<Mode>('standard')
  const [printer, setPrinter] = useState<string>('IMPRESORA_LOCAL_X')
  const [hostName, setHostName] = useState<string>(MOCK_CONFIG.hostName)
  const [savedCache, setSavedCache] = useState<string>(' -f dmCopies=2 -f dmScale=80')
  const [orientation, setOrientation] = useState<number>(MOCK_DIALOG.values.dmOrientation as number)

  const dialog = useMemo<PrintSetupDialog>(() => ({
    ...MOCK_DIALOG,
    values: { ...MOCK_DIALOG.values, dmOrientation: orientation },
  }), [orientation])

  const args = useMemo<DevmodeSettingsArgs>(() => {
    const base: DevmodeSettingsArgs = {
      dialog,
      config: { ...MOCK_CONFIG, hostName },
      currentPrinter: printer,
      useSavedSettings: false,
    }
    switch (mode) {
      case 'saved':
        return { ...base, useSavedSettings: true, savedSettings: savedCache }
      case 'server-cache':
        return {
          ...base,
          config: { ...MOCK_CONFIG, hostName: MOCK_CONFIG.servidorCache },
          currentPrinter: MOCK_CONFIG.impresoraPdf,
        }
      case 'centraliza':
        return { ...base, currentPrinter: MOCK_CONFIG.impresora }
      case 'standard':
      default:
        return base
    }
  }, [mode, printer, hostName, savedCache, dialog])

  const result = useMemo(() => devmodeSettings(args), [args])
  const centralizaPreview = useMemo(
    () => configurePrinterForCentralizedPlot(dialog, MOCK_CONFIG.impresora, ...MOCK_CONFIG.tamanoPapel),
    [dialog],
  )

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        plot_filter
        <Chip label="Fase 1 · MODERADO · score 3" size="small" sx={{ ml: 1.5 }} color="info" />
      </Typography>
      <Typography variant="caption" color="text.secondary" gutterBottom component="p">
        Fuente: <code>adiciones_layout/source/plot_filter.magik</code> — módulo <code>sw</code>
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_, v) => v && setMode(v)}
        >
          {(Object.keys(MODE_INFO) as Mode[]).map(m => (
            <ToggleButton key={m} value={m}>{MODE_INFO[m].label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {MODE_INFO[mode].desc}
      </Typography>

      <Grid container spacing={3}>
        {/* ── Inputs ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Inputs"
              subheader="Diálogo Win32 + c_centraliza_planos + _self.printer"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                {mode === 'saved' && (
                  <TextField
                    label=".properties[:saved_devmode_settings]"
                    value={savedCache}
                    onChange={e => setSavedCache(e.target.value)}
                    size="small"
                    fullWidth
                  />
                )}

                {mode === 'standard' && (
                  <>
                    <TextField
                      label="_self.printer.write_string"
                      value={printer}
                      onChange={e => setPrinter(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="system.host_name"
                      value={hostName}
                      onChange={e => setHostName(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </>
                )}

                <TextField
                  label="dialog.values.dmOrientation"
                  value={orientation}
                  onChange={e => setOrientation(Number(e.target.value) || 0)}
                  size="small"
                  select
                  fullWidth
                  helperText="1 = portrait · 2 = landscape (forzado en centraliza)"
                >
                  <MenuItem value={1}>1 — portrait</MenuItem>
                  <MenuItem value={2}>2 — landscape</MenuItem>
                </TextField>

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  c_centraliza_planos (mock)
                </Typography>
                <Box component="dl" sx={{ m: 0, fontSize: 12, fontFamily: 'monospace' }}>
                  {Object.entries(MOCK_CONFIG).map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ color: 'text.secondary', minWidth: 130 }}>{k}</Box>
                      <Box>{Array.isArray(v) ? `[${v.join(', ')}]` : String(v)}</Box>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Outputs ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Output"
              subheader="devmode_settings(args) — opts para windcplot"
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <OutputBlock label="devmode_settings()" value={result} />
                <OutputBlock label="default_windcplot_options()" value={defaultWindcplotOptions()} />
                <OutputBlock
                  label="configurePrinterForCentralizedPlot() preview"
                  value={centralizaPreview}
                  caption="Llamada directa con cp.impresora + cp.tamano_papel (841×594)"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function OutputBlock({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="primary" sx={{ fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0, p: 1.25,
          bgcolor: 'grey.900', color: 'grey.100',
          borderRadius: 1, fontSize: 12,
          whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        }}
      >
        {value || '(vacío)'}
      </Box>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {caption}
        </Typography>
      )}
    </Box>
  )
}
