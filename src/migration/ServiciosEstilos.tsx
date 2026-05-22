/**
 * Migración de: c_servicios_estilos.magik
 * Clase Magik:  c_servicios_estilos  —  package user
 * Autor orig.:  dvalenci / GE Network Solutions (11-02-2002, rev. 28-Jul-2011)
 *
 * Servicio singleton de estilos GIS: adapta fuente, color y escala de texto
 * según el estado de construcción del objeto (PROYECTADO / EXISTENTE / sin estado).
 *
 * Sin cálculos espaciales ni interacción con mapa →
 * no requiere Turf.js ni OpenLayers.
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** font.new_logical("bold") / font.new_logical("plain") */
export type FontStyle = 'bold' | 'plain';

/** colour.called(:red / :green / :black) */
export interface ColourStyle {
  name: 'red' | 'green' | 'black';
  hex:  string;
}

/** Magik: colour.called(:X) — tabla de colores nominales */
const COLOURS: Record<ColourStyle['name'], ColourStyle> = {
  red:   { name: 'red',   hex: '#CC0000' },
  green: { name: 'green', hex: '#228B22' },
  black: { name: 'black', hex: '#000000' },
};

/**
 * Propiedades de un estilo de texto Magik.
 * Objeto retornado por actual_text_style / actual_text_styles[:left_right].
 */
export interface TextStyleProperties {
  xscale: number;
  yscale: number;
  font:   FontStyle;
  colour: ColourStyle;
}

/**
 * PoRwo_est con class_name = :gis_text_style
 *   LoEstilo = PoRwo_est.actual_text_styles[:left_right]
 */
export interface GisTextStyle {
  className: 'gis_text_style';
  actualTextStyles: { leftRight: TextStyleProperties };
}

/**
 * PoRwo_est con class_name = :rwo_style
 *   LoEstilo = PoRwo_est.actual_text_style
 */
export interface RwoStyle {
  className: 'rwo_style';
  actualTextStyle: TextStyleProperties;
}

/**
 * Unión abierta: incluye el caso "otro tipo" que en Magik hace _return PoRwo_est
 * sin modificar (else branch).
 */
export type AnyStyleInput =
  | GisTextStyle
  | RwoStyle
  | { className?: string; [key: string]: unknown };

// =============================================================================
// CLASE PRINCIPAL — Singleton
// =============================================================================

export class CServiciosEstilos {

  /** Magik: {:st_arbol, _unset} — slot de instancia (no usado en métodos transcritos) */
  private stArbol: unknown = null;

  /** Magik: define_shared_variable(:singleton, _unset, :private) */
  private static _singleton: CServiciosEstilos | null = null;

  /** Magik: init() → _return _self  (constructor privado para forzar singleton) */
  private constructor() {}

  /** Magik: new() → _return _clone.init() */
  static new(): CServiciosEstilos {
    return new CServiciosEstilos();
  }

  /**
   * Magik: c_servicios_estilos.singleton()
   *
   *   _if _self.singleton _is _unset
   *     _self.singleton << _self.new()
   *   _endif
   *   _return _self.singleton
   */
  static singleton(): CServiciosEstilos {
    if (CServiciosEstilos._singleton === null) {
      CServiciosEstilos._singleton = CServiciosEstilos.new();
    }
    return CServiciosEstilos._singleton;
  }

  /**
   * Magik: c_servicios_estilos.obtener_estilo_blanco_y_negro_txt(PoRwo_est, _optional Pc_construccion)
   *
   * 1. Extrae LoEstilo según class_name:
   *      :gis_text_style → actual_text_styles[:left_right]
   *      :rwo_style      → actual_text_style
   *      otro            → _return PoRwo_est sin modificar
   *
   * 2. Calcula font / colour / escala según Pc_construccion:
   *      "PROYECTADO"      → bold · red · xscale/yscale +10% (Math.trunc ≡ .truncated)
   *      undefined (_unset) → plain · black · escala original
   *      otro valor         → plain · green · escala original
   *
   * 3. Retorna LoEstilo.copy_with_properties(:font, :xscale, :yscale, :colour)
   *
   * NOTA: el Magik original usa LoEstilo.xscale (no yscale) para calcular el
   * incremento de AMBOS ejes. Se replica exactamente ese comportamiento.
   */
  obtenerEstiloBlancoYNegroTxt(
    poRwoEst:        AnyStyleInput,
    pcConstruccion?: string,
  ): TextStyleProperties | AnyStyleInput {

    // ── Extracción del estilo base ─────────────────────────────────────────
    let loEstilo: TextStyleProperties;

    if (poRwoEst.className === 'gis_text_style') {
      loEstilo = (poRwoEst as GisTextStyle).actualTextStyles.leftRight;
    } else if (poRwoEst.className === 'rwo_style') {
      loEstilo = (poRwoEst as RwoStyle).actualTextStyle;
    } else {
      // _else → _return PoRwo_est  (devuelve la entrada sin modificar)
      return poRwoEst;
    }

    // ── Cálculo de propiedades según estado de construcción ────────────────
    let loFont:    FontStyle;
    let loColor:   ColourStyle;
    let loEscalaX: number;
    let loEscalaY: number;

    if (pcConstruccion === 'PROYECTADO') {
      loFont    = 'bold';
      loColor   = COLOURS.red;
      // .truncated en Magik ≡ Math.trunc() en TypeScript
      // NOTA orig.: ambos ejes incrementan con xscale (no yscale) — se preserva el comportamiento
      loEscalaX = loEstilo.xscale + Math.trunc(loEstilo.xscale * 0.10);
      loEscalaY = loEstilo.yscale + Math.trunc(loEstilo.xscale * 0.10);
    } else {
      loFont    = 'plain';
      // _if Pc_construccion _is _unset → :black   _else → :green
      loColor   = pcConstruccion === undefined ? COLOURS.black : COLOURS.green;
      loEscalaX = loEstilo.xscale;
      loEscalaY = loEstilo.yscale;
    }

    // LoEstilo.copy_with_properties(:font, :xscale, :yscale, :colour)
    return { ...loEstilo, font: loFont, colour: loColor, xscale: loEscalaX, yscale: loEscalaY };
  }

  /**
   * Magik: c_servicios_estilos.obtiener_estilo_blanco_y_negro_linea(rwo_est)
   * Cuerpo completamente vacío en el Magik original → stub.
   */
  obtenerEstiloBlancoYNegroLinea(_rwoEst: AnyStyleInput): void {
    // Stub — método vacío en el original
  }
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

type EstiloTipo      = 'gis_text_style' | 'rwo_style' | 'unknown';
type ConstruccionOpt = 'PROYECTADO' | 'EXISTENTE' | 'undefined';

const BASE_XSCALE = 20;

const BASE_STYLE: TextStyleProperties = {
  xscale: BASE_XSCALE,
  yscale: BASE_XSCALE,
  font:   'plain',
  colour: COLOURS.black,
};

const TIPO_LABELS: Record<EstiloTipo, string> = {
  'gis_text_style': ':gis_text_style → actual_text_styles[:left_right]',
  'rwo_style':      ':rwo_style → actual_text_style',
  'unknown':        'otro tipo → _return PoRwo_est sin modificar',
};

const CONSTRUCCION_LABELS: Record<ConstruccionOpt, string> = {
  PROYECTADO: '"PROYECTADO"  → bold · red · +10% escala',
  EXISTENTE:  '"EXISTENTE"   → plain · green · escala original',
  undefined:  '_unset (omitido) → plain · black · escala original',
};

const isTextStyle = (r: unknown): r is TextStyleProperties =>
  typeof r === 'object' && r !== null && 'font' in r && 'colour' in r;

export function ServiciosEstilosUI() {
  const [estiloTipo,   setEstiloTipo]   = useState<EstiloTipo>('gis_text_style');
  const [construccion, setConstruccion] = useState<ConstruccionOpt>('PROYECTADO');
  const [xscale,       setXscale]       = useState(BASE_XSCALE);

  // Singleton reutilizado entre renders
  const servicio = CServiciosEstilos.singleton();

  // Construye el AnyStyleInput según el tipo de estilo seleccionado
  const buildInput = (): AnyStyleInput => {
    const base: TextStyleProperties = { ...BASE_STYLE, xscale, yscale: xscale };
    if (estiloTipo === 'gis_text_style') {
      return { className: 'gis_text_style', actualTextStyles: { leftRight: base } };
    }
    if (estiloTipo === 'rwo_style') {
      return { className: 'rwo_style', actualTextStyle: base };
    }
    return { className: 'unknown_class', rawData: 'no text style props' };
  };

  const pcConstruccion = construccion === 'undefined' ? undefined : construccion;
  const input          = buildInput();
  const result         = servicio.obtenerEstiloBlancoYNegroTxt(input, pcConstruccion);
  const tsResult       = isTextStyle(result) ? result : null;

  const xscaleIn  = xscale;
  const yscaleIn  = xscale;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_servicios_estilos — obtener_estilo_blanco_y_negro_txt</h3>

      {/* Controles */}
      <div style={s.controls}>

        <div style={s.row}>
          <label style={s.lbl}>Tipo de estilo entrada (class_name)</label>
          <select style={s.sel} value={estiloTipo}
            onChange={e => setEstiloTipo(e.target.value as EstiloTipo)}>
            {(Object.keys(TIPO_LABELS) as EstiloTipo[]).map(k => (
              <option key={k} value={k}>{TIPO_LABELS[k]}</option>
            ))}
          </select>
        </div>

        <div style={s.row}>
          <label style={s.lbl}>Pc_construccion (_optional)</label>
          <select style={s.sel} value={construccion}
            onChange={e => setConstruccion(e.target.value as ConstruccionOpt)}>
            {(Object.keys(CONSTRUCCION_LABELS) as ConstruccionOpt[]).map(k => (
              <option key={k} value={k}>{CONSTRUCCION_LABELS[k]}</option>
            ))}
          </select>
        </div>

        <div style={s.row}>
          <label style={s.lbl}>xscale / yscale base</label>
          <input type="range" min={8} max={48} value={xscale}
            onChange={e => setXscale(+e.target.value)} style={{ flex: 1 }} />
          <span style={s.val}>{xscale}</span>
        </div>
      </div>

      {/* Resultado */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>

        {/* Preview de texto renderizado */}
        <div style={{ ...s.card, flex: '0 0 260px' }}>
          <p style={s.subtitle}>Preview texto</p>
          <div style={{
            background: '#f8f8f8', border: '1px solid #ddd', borderRadius: 4,
            padding: 16, minHeight: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {tsResult ? (
              <span style={{
                fontSize:   Math.max(9, tsResult.xscale * 0.55),
                fontWeight: tsResult.font === 'bold' ? 'bold' : 'normal',
                color:      tsResult.colour.hex,
                transition: 'all 0.2s',
              }}>
                Texto GIS ejemplo
              </span>
            ) : (
              <span style={{ color: '#aaa', fontSize: 11, fontStyle: 'italic' }}>
                Entrada devuelta sin modificar
              </span>
            )}
          </div>
          {tsResult && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                ...s.badge,
                background: tsResult.colour.name === 'red' ? '#fff0f0'
                  : tsResult.colour.name === 'green' ? '#f0fff0' : '#f0f0f0',
                borderColor: tsResult.colour.hex,
                color: tsResult.colour.hex,
              }}>
                {tsResult.font} · {tsResult.colour.name}
                {' · '}xscale {tsResult.xscale} · yscale {tsResult.yscale}
              </div>
            </div>
          )}
        </div>

        {/* Tabla de propiedades antes / después */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <p style={s.subtitle}>Propiedades — antes vs. resultado</p>
          <table style={s.table}>
            <thead>
              <tr>
                {['Propiedad Magik', 'Entrada (base)', 'Resultado calculado'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tsResult ? (
                <>
                  <tr>
                    <td style={s.td}><code>font</code></td>
                    <td style={s.td}><code>plain</code></td>
                    <td style={s.td}>
                      <code style={{ fontWeight: tsResult.font === 'bold' ? 'bold' : 'normal',
                        color: tsResult.font === 'bold' ? '#c00' : '#333' }}>
                        {tsResult.font}
                      </code>
                    </td>
                  </tr>
                  <tr>
                    <td style={s.td}><code>colour</code></td>
                    <td style={s.td}>
                      <span style={{ color: '#000' }}>■ black (#000000)</span>
                    </td>
                    <td style={s.td}>
                      <span style={{ color: tsResult.colour.hex }}>
                        ■ {tsResult.colour.name} ({tsResult.colour.hex})
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={s.td}><code>xscale</code></td>
                    <td style={{ ...s.td, textAlign: 'right' as const }}>{xscaleIn}</td>
                    <td style={{ ...s.td, textAlign: 'right' as const,
                      color: tsResult.xscale !== xscaleIn ? '#c00' : '#333' }}>
                      {tsResult.xscale}
                      {tsResult.xscale !== xscaleIn && (
                        <span style={{ fontSize: 10, marginLeft: 4, color: '#c00' }}>
                          (+{tsResult.xscale - xscaleIn} trunc)
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={s.td}><code>yscale</code></td>
                    <td style={{ ...s.td, textAlign: 'right' as const }}>{yscaleIn}</td>
                    <td style={{ ...s.td, textAlign: 'right' as const,
                      color: tsResult.yscale !== yscaleIn ? '#c00' : '#333' }}>
                      {tsResult.yscale}
                      {tsResult.yscale !== yscaleIn && (
                        <span style={{ fontSize: 10, marginLeft: 4, color: '#c00' }}>
                          (+{tsResult.yscale - yscaleIn} trunc)
                        </span>
                      )}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={3} style={{ ...s.td, textAlign: 'center' as const, color: '#888' }}>
                    class_name desconocido → <code>_return PoRwo_est</code> (else branch, sin modificar)
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Traza de la lógica aplicada */}
          <p style={{ ...s.subtitle, marginTop: 12 }}>Traza Magik → TypeScript</p>
          <table style={s.table}>
            <thead>
              <tr>
                {['Paso', 'Magik', 'TypeScript'].map(h =>
                  <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.td}>1. Extracción</td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>
                    {estiloTipo === 'gis_text_style'
                      ? 'actual_text_styles[:left_right]'
                      : estiloTipo === 'rwo_style'
                      ? 'actual_text_style'
                      : '_return PoRwo_est'}
                  </code>
                </td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>
                    {estiloTipo === 'gis_text_style'
                      ? 'actualTextStyles.leftRight'
                      : estiloTipo === 'rwo_style'
                      ? 'actualTextStyle'
                      : 'return poRwoEst'}
                  </code>
                </td>
              </tr>
              <tr>
                <td style={s.td}>2. Construcción</td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>
                    {construccion === 'PROYECTADO'
                      ? 'Pc_construccion = "PROYECTADO"'
                      : construccion === 'undefined'
                      ? 'Pc_construccion _is _unset'
                      : 'otro valor'}
                  </code>
                </td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>
                    {construccion === 'PROYECTADO'
                      ? 'pcConstruccion === "PROYECTADO"'
                      : construccion === 'undefined'
                      ? 'pcConstruccion === undefined'
                      : 'else branch'}
                  </code>
                </td>
              </tr>
              <tr>
                <td style={s.td}>3. Copia</td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>copy_with_properties(...)</code>
                </td>
                <td style={s.td}>
                  <code style={{ fontSize: 10 }}>{`{ ...loEstilo, font, colour, xscale, yscale }`}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame    : { display:'flex', flexDirection:'column', gap:12, width:760, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title    : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle : { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  controls : { display:'flex', flexDirection:'column', gap:8 },
  row      : { display:'flex', alignItems:'center', gap:8 },
  lbl      : { minWidth:240, fontSize:11, color:'#555' },
  sel      : { flex:1, padding:'3px 8px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  val      : { minWidth:28, textAlign:'right', fontSize:12, fontFamily:'monospace' },
  card     : { border:'1px solid #ddd', borderRadius:4, padding:12 },
  table    : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th       : { background:'#2E4057', color:'#fff', padding:'4px 8px', textAlign:'left' as const, fontSize:11 },
  td       : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:12 },
  badge    : { padding:'6px 10px', border:'1px solid', borderRadius:4, fontSize:11 },
};

export default ServiciosEstilosUI;
