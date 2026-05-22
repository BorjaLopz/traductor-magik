/**
 * Migración de: c_elemento_empalme_derivacion_g.magik
 * Clase Magik:  c_elemento_empalme_derivacion_g  —  package user
 * Hereda:       c_elemento_empalme_g  →  CElementoEmpalmeGBase (stub inline)
 * Autor orig.:  dsanchez / Sigma Tao  (31-03-2005, rev. 05-04-2005)
 *
 * Elemento gráfico de croquis para empalme con derivación.
 * Extiende c_elemento_empalme_g añadiendo:
 *  - etiqueta "ED-NNN" (vs "ER-NNN" del padre)
 *  - etiqueta con nombre de derivada (Etiqueta_2, row 19/20)
 *  - símbolo "empalme_derivacion" (fork / T-junction)
 *  - nLong_grafica = 40 (vs el valor mayor del padre)
 *  - reposicionar_Area: bbox anclado a oPto_Contacto
 *
 * Sin cálculos espaciales → no requiere Turf.js.
 * Sin interacción con mapa → no requiere OpenLayers.
 * Renderizado: SVG puro en React (equivale a draw_content_on en Smallworld).
 */

import React, { useState } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

/** Entidad del mundo GIS que este elemento representa gráficamente */
export interface EntidadEmpalmeDerivacion {
  numEmpalme: number;   // user!_num_empalme → "ED-42"
  nomDeriva:  string;   // user!_nom_deriva  → etiqueta de localidad
}

/** bounding_box.new(xMin,yMin,xMax,yMax) en Magik */
export interface BBoxMM {
  xMin: number; yMin: number; xMax: number; yMax: number;
}

/** Punto de contacto (oPto_Contacto) — donde el elemento conecta con el cable */
export interface PtoContacto { x: number; y: number; }

/** c_texto_grafico — etiqueta de texto interna */
export interface TextoGrafico {
  sTexto:      string;
  nTamanio:    number;
  sAlineacion: string;
  nMargenSup:  number;
  nMargenInf:  number;
}

/** c_simbolo_grafico — símbolo gráfico interno */
export interface SimboloGrafico {
  sNombre:    string;
  nMargenSup: number;
  nMargenInf: number;
}

type ElementoInterno = TextoGrafico | SimboloGrafico;

/** Coleccion de elementos (oElementos en Magik) */
class ColeccionElementos {
  private mapa = new Map<string, ElementoInterno>();

  /** Agregar_elemento(elem, key) */
  agregarElemento(elem: ElementoInterno, key: string): void {
    this.mapa.set(key, elem);
  }

  /** obten_elemento(key) */
  obtenElemento(key: string): ElementoInterno | undefined {
    return this.mapa.get(key);
  }

  getAll(): Map<string, ElementoInterno> { return this.mapa; }
}

// =============================================================================
// CLASE BASE STUB — c_elemento_empalme_g
// (El fichero ElementoEmpalmeG.tsx no está en el proyecto: se incluye stub mínimo)
// =============================================================================

export class CElementoEmpalmeGBase {

  /** RoObjeto — la entidad GIS que se representa */
  protected oEntidad: EntidadEmpalmeDerivacion;

  /** Nombre del símbolo GIS a usar */
  sNombreSimbolo = 'empalme';

  /** Descripción / código del elemento (ej. "ER-42") */
  sDescripcion = '';

  /** Longitud gráfica del elemento en mm */
  nLongGrafica = 150;

  /** Área (bounding box) asignada al elemento */
  oArea: BBoxMM = { xMin: 0, yMin: 0, xMax: 150, yMax: 150 };

  /** Punto de contacto — ancla del elemento en el diagrama */
  oPtoContacto: PtoContacto = { x: 0, y: 0 };

  /** Colección de elementos internos (etiquetas + símbolo) */
  oElementos = new ColeccionElementos();

  /**
   * collEtiquetas: mapa de nombre → número de fila (de 20) donde se posiciona.
   * Magik: _self.collEtiquetas[:Etiqueta_1] << 14
   */
  collEtiquetas: Record<string, number> = {};

  constructor(entidad: EntidadEmpalmeDerivacion) {
    this.oEntidad    = entidad;
    this.sDescripcion = `ER-${entidad.numEmpalme}`;
  }

  /** pos_etiqueta(key) → devuelve la fila asignada a esa etiqueta */
  posEtiqueta(key: string): number {
    return this.collEtiquetas[key] ?? 0;
  }

  /** _super.configurar_elementos() — base stub */
  configurarElementos(): void { /* stub del padre */ }

  /** _super.dfn_ubicacion_elementos_internos() — base stub */
  dfnUbicacionElementosInternos(): void { /* stub del padre */ }
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class CElementoEmpalmeDerivacionG extends CElementoEmpalmeGBase {

  /**
   * Magik: {:sNombre_derivada, _unset} — slot de instancia (access :writable, :private)
   * Nombre de la derivación (ej. "Localidad Norte").
   */
  private sNombreDerivada: string;

  /**
   * Magik: c_elemento_empalme_derivacion_g.new(RoObjeto)
   *
   *   _super.new(RoObjeto)
   *   _self.sNombre_Simbolo << "empalme_derivacion"
   *   _self.sDescripcion    << "ED-" + oEntidad.user!_num_empalme.write_string
   *   _self.nLong_Grafica   << 40
   *   _self.sNombre_derivada << oEntidad.user!_nom_deriva.write_string
   *   _return _clone
   */
  constructor(entidad: EntidadEmpalmeDerivacion) {
    super(entidad);
    this.sNombreSimbolo  = 'empalme_derivacion';
    this.sDescripcion    = `ED-${entidad.numEmpalme}`;   // "ED-" en lugar de "ER-"
    this.nLongGrafica    = 40;                           // comentario original: "40 #150 * 1"
    this.sNombreDerivada = entidad.nomDeriva;
    this.crearElementosInternos();
  }

  /**
   * Magik: c_elemento_empalme_derivacion_g.configurar_elementos()
   *
   *   _super.configurar_elementos()
   *   LoLbl = oElementos.obten_elemento(:Etiqueta_2)
   *   LoLbl.sTexto << _self.sNombre_derivada
   */
  override configurarElementos(): void {
    super.configurarElementos();
    const lbl = this.oElementos.obtenElemento('Etiqueta_2') as TextoGrafico | undefined;
    if (lbl) lbl.sTexto = this.sNombreDerivada;
  }

  /**
   * Magik: c_elemento_empalme_derivacion_g.dfn_ubicacion_elementos_internos()
   *
   * Divide la altura del área en 20 renglones y calcula nMargen_Sup/Inf de
   * cada elemento en función de su posición de fila (collEtiquetas[key]).
   *
   *   LnAltEnMM = oArea.YMax - oArea.yMin
   *   LnAltRen  = LnAltEnMM / 20
   *
   *   Para cada etiqueta (key):
   *     nNumRenSup = pos_etiqueta(key).as_integer()
   *     nNumRenInf = 20 - 2 - pos_etiqueta(key).as_integer()
   *     nMargen_Sup = LnAltRen * (nNumRenSup / 10)
   *     nMargen_Inf = LnAltRen * (nNumRenInf / 10)
   *
   *   Para Simbolo_1:
   *     LnAlturaSim = (300/552) * nLong_grafica   → proporción del símbolo
   *     LV          = ((150+80)/552) * LnAlturaSim → offset punta de flecha
   *     nMargen_Sup = LV / 10
   *     nMargen_Inf = (LV * -1) / 10
   */
  override dfnUbicacionElementosInternos(): void {
    const NUM_REN = 20;
    const altMM   = this.oArea.yMax - this.oArea.yMin;
    const altRen  = altMM / NUM_REN;

    // ── Etiqueta_1 ────────────────────────────────────────────────────────
    const posEt1 = Math.trunc(this.posEtiqueta('Etiqueta_1'));
    const supEt1 = posEt1;
    const infEt1 = NUM_REN - 2 - posEt1;
    const lbl1   = this.oElementos.obtenElemento('Etiqueta_1') as TextoGrafico | undefined;
    if (lbl1) {
      lbl1.nMargenSup = altRen * (supEt1 / 10);
      lbl1.nMargenInf = altRen * (infEt1 / 10);
    }

    // ── Etiqueta_2 ────────────────────────────────────────────────────────
    const posEt2 = Math.trunc(this.posEtiqueta('Etiqueta_2'));
    const supEt2 = posEt2;
    const infEt2 = NUM_REN - 2 - posEt2;
    const lbl2   = this.oElementos.obtenElemento('Etiqueta_2') as TextoGrafico | undefined;
    if (lbl2) {
      lbl2.nMargenSup = altRen * (supEt2 / 10);
      lbl2.nMargenInf = altRen * (infEt2 / 10);
    }

    // ── Simbolo_1 ─────────────────────────────────────────────────────────
    // Proporción: símbolo nativo 300w × 552h. A escala nLong_grafica (=40mm):
    const sim = this.oElementos.obtenElemento('Simbolo_1') as SimboloGrafico | undefined;
    if (sim) {
      // "El 552 es la altura aprox del símbolo teniendo un ancho de 300"
      const altSim = (300 / 552) * this.nLongGrafica;  // ≈ 21.74 mm
      // "150+80 para que la punta de la flecha empate con el pto de contacto"
      const lv     = ((150 + 80) / 552) * altSim;       // ≈ 9.07 mm
      sim.nMargenSup =  lv / 10;   // ≈ 0.907
      sim.nMargenInf = -lv / 10;   // ≈ -0.907 (extensión hacia abajo)
    }
  }

  /**
   * Magik: c_elemento_empalme_derivacion_g.Crea_elementos_internos()  [_private]
   *
   *   LoLbl1 = c_texto_grafico.new("ER")  → tam=25, centre_centre, row=14
   *   LoLbl2 = c_texto_grafico.new("Localidad") → tam=30, centre_centre, row=19
   *   LoSim  = c_simbolo_grafico.new(sNombreSimbolo)
   *
   *   collEtiquetas[:Etiqueta_1] << 14
   *   collEtiquetas[:Etiqueta_2] << 19
   */
  private crearElementosInternos(): void {
    // Etiqueta_1 — código del empalme (filledvalue inicial "ER", luego sobreescrito)
    const lbl1: TextoGrafico = { sTexto:'ER', nTamanio:25, sAlineacion:'centre_centre', nMargenSup:0, nMargenInf:0 };
    this.collEtiquetas['Etiqueta_1'] = 14;   // fila 14 de 20
    this.oElementos.agregarElemento(lbl1, 'Etiqueta_1');

    // Etiqueta_2 — nombre de localidad/derivada ("Localidad" como valor inicial)
    const lbl2: TextoGrafico = { sTexto:'Localidad', nTamanio:30, sAlineacion:'centre_centre', nMargenSup:0, nMargenInf:0 };
    this.collEtiquetas['Etiqueta_2'] = 19;   // fila 19 de 20 (casi al fondo)
    this.oElementos.agregarElemento(lbl2, 'Etiqueta_2');

    // Símbolo — "empalme_derivacion" (fork T-junction)
    const sim: SimboloGrafico = { sNombre: this.sNombreSimbolo, nMargenSup:0, nMargenInf:0 };
    this.oElementos.agregarElemento(sim, 'Simbolo_1');

    // Aplica textos dinámicos y márgenes de posición
    this.configurarElementos();
    this.dfnUbicacionElementosInternos();
  }

  /**
   * Magik: c_elemento_empalme_derivacion_g.reposicionar_Area(RoArea)
   *
   *   LnAlturaArea = RoArea.YMax - RoArea.YMin    ← calculado pero no usado en el return
   *   LnDistEnXInf = 0                            ← calculado pero no usado
   *   LnDistEnYInf = LnAlturaArea / 2             ← calculado pero no usado
   *   LnDistEnXSup = _self.nLong_grafica          ← calculado pero no usado
   *   LnDistEnYSup = LnAlturaArea / 2             ← calculado pero no usado
   *
   *   _return bounding_box.new(
   *     oPto_Contacto.X + 0,                      → xMin = oPto.X
   *     oPto_Contacto.Y - nLong_grafica/2,         → yMin = oPto.Y - 20
   *     oPto_Contacto.X + nLong_grafica,           → xMax = oPto.X + 40
   *     oPto_Contacto.Y + nLong_grafica/2)         → yMax = oPto.Y + 20
   *
   * NOTA: LnDistEnX/Y son variables intermedias calculadas y no utilizadas
   * en el return — comportamiento real del código Magik original.
   */
  reposicionarArea(_areaBase: BBoxMM): BBoxMM {
    const half = this.nLongGrafica / 2;   // 20mm
    return {
      xMin: this.oPtoContacto.x,
      yMin: this.oPtoContacto.y - half,
      xMax: this.oPtoContacto.x + this.nLongGrafica,
      yMax: this.oPtoContacto.y + half,
    };
  }

  /** Devuelve los datos de renderizado del elemento para el componente React */
  buildLayout(): {
    descripcion:   string;
    sNombreDer:    string;
    bbox:          BBoxMM;
    etiqueta1Txt:  string;
    etiqueta2Txt:  string;
    etiqueta1Row:  number;
    etiqueta2Row:  number;
    simNombre:     string;
    simMargenSup:  number;
    nLong:         number;
    altRen:        number;
  } {
    const lbl1 = this.oElementos.obtenElemento('Etiqueta_1') as TextoGrafico;
    const lbl2 = this.oElementos.obtenElemento('Etiqueta_2') as TextoGrafico;
    const sim  = this.oElementos.obtenElemento('Simbolo_1')  as SimboloGrafico;
    const bbox = this.reposicionarArea(this.oArea);
    const alt  = bbox.yMax - bbox.yMin;   // = nLong_grafica = 40
    return {
      descripcion:  this.sDescripcion,
      sNombreDer:   this.sNombreDerivada,
      bbox,
      etiqueta1Txt: lbl1?.sTexto ?? '',
      etiqueta2Txt: lbl2?.sTexto ?? '',
      etiqueta1Row: this.collEtiquetas['Etiqueta_1'] ?? 14,
      etiqueta2Row: this.collEtiquetas['Etiqueta_2'] ?? 19,
      simNombre:    sim?.sNombre ?? '',
      simMargenSup: sim?.nMargenSup ?? 0,
      nLong:        this.nLongGrafica,
      altRen:       alt / 20,
    };
  }
}

// =============================================================================
// SVG — renderizado del símbolo "empalme_derivacion"
// =============================================================================

interface SvgEmpalmeProps {
  entidad: EntidadEmpalmeDerivacion;
  width?:  number;
  height?: number;
}

/**
 * Renderiza el elemento c_elemento_empalme_derivacion_g como SVG.
 * Equivale al método draw_content_on del pipeline de renderizado Smallworld.
 *
 * Layout (20 filas):
 *   rows  0-12: símbolo fork (T-junction con rombo)
 *   row   14:   Etiqueta_1 "ED-NNN"
 *   row   19:   Etiqueta_2 nombre derivada
 */
export function ElementoEmpalmeDerivacionGSvg({ entidad, width = 200, height = 180 }: SvgEmpalmeProps) {
  const elem = new CElementoEmpalmeDerivacionG(entidad);
  const lay  = elem.buildLayout();

  const NUM_REN = 20;
  const rowH    = height / NUM_REN;

  // Posición Y de cada fila (centro del renglón)
  const rowY = (row: number) => rowH * row + rowH / 2;

  // Cable horizontal: mitad superior del bbox
  const cableY  = rowH * 6;                   // fila 6 — centro del símbolo
  const juncX   = width  * 0.30;              // X del nudo de derivación
  const endX    = width  * 0.85;              // fin del cable principal

  // Rama vertical hacia abajo (derivación)
  const branchY1 = cableY;
  const branchY2 = rowY(lay.etiqueta1Row - 1); // hasta justo antes de la etiqueta

  // Diamante en el nudo
  const DIAMOND = 7;

  return (
    <svg width={width} height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}>

      {/* Grid de renglones (debug visual) */}
      {Array.from({ length: NUM_REN }, (_, i) => (
        <line key={`gr-${i}`} x1={0} y1={rowH * i} x2={width} y2={rowH * i}
          stroke="#f0f0f0" strokeWidth={0.5} />
      ))}

      {/* Cable horizontal principal */}
      <line x1={0} y1={cableY} x2={endX} y2={cableY}
        stroke="#1a3a5c" strokeWidth={2.5} />

      {/* Rama vertical (derivación) */}
      <line x1={juncX} y1={branchY1} x2={juncX} y2={branchY2}
        stroke="#1a3a5c" strokeWidth={2} />

      {/* Flecha / arrowhead al final de la rama */}
      <polygon
        points={`${juncX},${branchY2 + 8} ${juncX - 5},${branchY2} ${juncX + 5},${branchY2}`}
        fill="#1a3a5c" />

      {/* Rombo en el nudo (junction) — símbolo "empalme_derivacion" */}
      <polygon
        points={`${juncX},${cableY - DIAMOND} ${juncX + DIAMOND},${cableY} ${juncX},${cableY + DIAMOND} ${juncX - DIAMOND},${cableY}`}
        fill="#1a3a5c" />

      {/* Círculo en el extremo izquierdo (punto de contacto) */}
      <circle cx={0} cy={cableY} r={4} fill="#1a3a5c" />

      {/* Etiqueta_1 — código "ED-NNN" — fila 14 */}
      <text
        x={width / 2} y={rowY(lay.etiqueta1Row)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.max(8, width * 0.075)} fontWeight="bold" fill="#1a3a5c">
        {lay.descripcion}
      </text>

      {/* Etiqueta_2 — nombre derivada — fila 19 */}
      <text
        x={width / 2} y={rowY(lay.etiqueta2Row)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={Math.max(7, width * 0.065)} fill="#555">
        {lay.sNombreDer}
      </text>
    </svg>
  );
}

// =============================================================================
// COMPONENTE REACT — demo interactivo
// =============================================================================

export function ElementoEmpalmeDerivacionGUI() {
  const [numEmpalme, setNumEmpalme] = useState(42);
  const [nomDeriva,  setNomDeriva]  = useState('Localidad Norte');

  const entidad  = { numEmpalme, nomDeriva };
  const elem     = new CElementoEmpalmeDerivacionG(entidad);
  const lay      = elem.buildLayout();

  // Para la tabla de márgenes calculados
  const lbl1 = elem['oElementos'].obtenElemento('Etiqueta_1') as TextoGrafico;
  const lbl2 = elem['oElementos'].obtenElemento('Etiqueta_2') as TextoGrafico;
  const sim  = elem['oElementos'].obtenElemento('Simbolo_1')  as SimboloGrafico;

  return (
    <div style={s.frame}>
      <h3 style={s.title}>c_elemento_empalme_derivacion_g — Empalme con derivación</h3>

      {/* Controles */}
      <div style={s.controls}>
        <div style={s.row}>
          <label style={s.lbl}>numEmpalme (user!_num_empalme)</label>
          <input type="number" style={s.inp} value={numEmpalme} min={1} max={999}
            onChange={e => setNumEmpalme(+e.target.value)} />
          <code style={s.code}>{`"ED-${numEmpalme}"`}</code>
        </div>
        <div style={s.row}>
          <label style={s.lbl}>nomDeriva (user!_nom_deriva)</label>
          <input type="text" style={s.inp} value={nomDeriva}
            onChange={e => setNomDeriva(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>

        {/* SVG del símbolo */}
        <div style={s.card}>
          <p style={s.subtitle}>Renderizado SVG (200×180px)</p>
          <div style={{ border: '1px solid #ddd', display: 'inline-block' }}>
            <ElementoEmpalmeDerivacionGSvg entidad={entidad} width={200} height={180} />
          </div>
          <p style={s.meta}>
            nLong_grafica = {lay.nLong} mm  ·  altRen = {lay.altRen.toFixed(2)} mm
          </p>
        </div>

        {/* Panel derecho */}
        <div style={{ flex: 1, minWidth: 280 }}>

          {/* BBox reposicionado */}
          <p style={s.subtitle}>reposicionar_Area( oPto=(0,0) )</p>
          <table style={s.table}>
            <thead>
              <tr>{['Coord', 'Fórmula Magik', 'Valor (mm)'].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['xMin', 'oPto.X + 0',               lay.bbox.xMin],
                ['yMin', 'oPto.Y − nLong/2',          lay.bbox.yMin],
                ['xMax', 'oPto.X + nLong',            lay.bbox.xMax],
                ['yMax', 'oPto.Y + nLong/2',          lay.bbox.yMax],
              ].map(([k, f, v]) => (
                <tr key={k as string}>
                  <td style={s.td}><code>{k}</code></td>
                  <td style={s.td}><code style={{ fontSize: 10 }}>{f}</code></td>
                  <td style={{ ...s.td, textAlign: 'right' as const }}>{v as number}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Márgenes calculados */}
          <p style={{ ...s.subtitle, marginTop: 10 }}>dfn_ubicacion_elementos_internos</p>
          <table style={s.table}>
            <thead>
              <tr>{['Elemento', 'Fila', 'nMargenSup', 'nMargenInf'].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={s.td}>Etiqueta_1</td>
                <td style={{ ...s.td, textAlign: 'center' as const }}>{lay.etiqueta1Row}/20</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{lbl1?.nMargenSup.toFixed(3)}</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{lbl1?.nMargenInf.toFixed(3)}</td>
              </tr>
              <tr>
                <td style={s.td}>Etiqueta_2</td>
                <td style={{ ...s.td, textAlign: 'center' as const }}>{lay.etiqueta2Row}/20</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{lbl2?.nMargenSup.toFixed(3)}</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{lbl2?.nMargenInf.toFixed(3)}</td>
              </tr>
              <tr>
                <td style={s.td}>Simbolo_1</td>
                <td style={{ ...s.td, textAlign: 'center' as const }}>calc.</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{sim?.nMargenSup.toFixed(3)}</td>
                <td style={{ ...s.td, textAlign: 'right' as const }}>{sim?.nMargenInf.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>

          {/* Fórmula del símbolo */}
          <p style={{ ...s.subtitle, marginTop: 10 }}>Fórmula Simbolo_1 (nLong={lay.nLong}mm)</p>
          <table style={s.table}>
            <thead>
              <tr>{['Variable Magik', 'Fórmula', 'Valor'].map(h =>
                <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['LnAlturaSim', '(300/552) × nLong',       ((300/552)*lay.nLong).toFixed(3)],
                ['LV',          '(230/552) × LnAlturaSim', (((150+80)/552)*((300/552)*lay.nLong)).toFixed(3)],
                ['nMargenSup',  'LV / 10',                  (sim?.nMargenSup ?? 0).toFixed(4)],
                ['nMargenInf',  '(LV × -1) / 10',           (sim?.nMargenInf ?? 0).toFixed(4)],
              ].map(([k, f, v]) => (
                <tr key={k as string}>
                  <td style={s.td}><code style={{ fontSize: 10 }}>{k}</code></td>
                  <td style={s.td}><code style={{ fontSize: 10 }}>{f}</code></td>
                  <td style={{ ...s.td, textAlign: 'right' as const }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  frame   : { display:'flex', flexDirection:'column', gap:12, width:740, border:'1px solid #bbb', borderRadius:6, padding:16, fontFamily:'sans-serif', fontSize:13 },
  title   : { margin:'0 0 4px', fontSize:14, fontWeight:'bold' },
  subtitle: { margin:'0 0 4px', fontSize:11, color:'#888', fontWeight:'bold' },
  meta    : { margin:'4px 0 0', fontSize:10, color:'#888' },
  controls: { display:'flex', flexDirection:'column', gap:8 },
  row     : { display:'flex', alignItems:'center', gap:8 },
  lbl     : { minWidth:220, fontSize:11, color:'#555' },
  inp     : { width:120, padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:12 },
  code    : { fontSize:11, color:'#0a5', fontFamily:'monospace' },
  card    : { border:'1px solid #ddd', borderRadius:4, padding:12 },
  table   : { width:'100%', borderCollapse:'collapse' as const, marginTop:4 },
  th      : { background:'#2E4057', color:'#fff', padding:'4px 8px', textAlign:'left' as const, fontSize:11 },
  td      : { padding:'4px 8px', borderBottom:'1px solid #eee', fontSize:12 },
};

export default ElementoEmpalmeDerivacionGUI;
