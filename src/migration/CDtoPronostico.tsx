/**
 * CDtoPronostico.tsx
 * Migración de c_dto_pronostico.magik  (Sigma Tao / Traza: Planos, dsanchez 2005)
 *
 * Jerarquía Magik: c_dto_pronostico extends :layout_element
 * Propósito: sello de layout "Resumen de materiales" para planos de red de cobre.
 * Tres sub-tablas apiladas verticalmente, total ~33 mm alto × 33 mm ancho.
 */

import React, { useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Tipos — equivalentes a los slots y estructuras internas del original
// ---------------------------------------------------------------------------

/** Tipo de celda — Magik: c_texto_grafico vs c_Captura_Texto */
export type CeldaTipo = 'texto_grafico' | 'captura_texto';

/** Celda individual — equivale a los objetos que Magik asigna a .oElemento */
export interface DtoCelda {
  tipo      : CeldaTipo;
  texto     : string;
  tamano    : number;          // nTamanio (pt)
  alineacion: 'centre_left' | 'center' | 'top_left';
}

/** Sub-tabla — equivale a cada objeto creado por crea_tabla() */
export interface DtoSubTabla {
  nombre                : string;
  filas                 : number;
  cols                  : number;
  alturas               : number[];   // nLongitud por renglón (mm)
  anchos                : number[];   // nLongitud por columna (mm)
  celdas                : DtoCelda[][];
  bordesDibujados       : boolean;    // bDibuja_bordes?
  colsInternasDibujadas : boolean;    // bDibuja_Columnas_Internas?
  rengsInternosDibujados: boolean;    // bDibuja_Renglones_Internos?
  coordOrigen           : { x: number; y: number };
  bordeInfCeldas        : Set<string>; // "fi,ci" → borde inferior especial activo
}

/** Colección de sub-tablas — equivale a c_tablas */
export interface DtoTablas {
  titulo     : DtoSubTabla;
  pares      : DtoSubTabla;
  pronosticos: DtoSubTabla;
}

// ---------------------------------------------------------------------------
// Helpers — equivalentes a c_texto_grafico.new / c_Captura_Texto.new
// ---------------------------------------------------------------------------

/** Magik: c_texto_grafico.new(texto) o .new_from(base, texto) */
function textoGrafico(texto: string, tamano: number, base?: DtoCelda): DtoCelda {
  return { tipo: 'texto_grafico', texto, tamano, alineacion: base?.alineacion ?? 'centre_left' };
}

/** Magik: c_Captura_Texto.new(texto) o .new_from(base, texto?) — celda editable */
function capturaTexto(texto: string, tamano: number, base?: DtoCelda): DtoCelda {
  return { tipo: 'captura_texto', texto, tamano, alineacion: base?.alineacion ?? 'centre_left' };
}

/** Crea matriz vacía de celdas [filas][cols] */
function matrizVacia(filas: number, cols: number): DtoCelda[][] {
  return Array.from({ length: filas }, () =>
    Array.from({ length: cols }, (): DtoCelda => ({
      tipo: 'texto_grafico', texto: '', tamano: 10, alineacion: 'centre_left',
    }))
  );
}

// ---------------------------------------------------------------------------
// Clase principal — CDtoPronostico
// Magik: def_slotted_exemplar(:c_dto_pronostico, {:oTablas, :oCoordOrigen,
//                             :oWindow, :bTablas_Creadas}, :layout_element)
// ---------------------------------------------------------------------------
export class CDtoPronostico {
  // Slots Magik
  oTablas        : DtoTablas | null           = null;
  oCoordOrigen   : { x: number; y: number }   = { x: 0, y: 0 };
  bTablas_creadas: boolean                    = false; // slot :bTablas_Creadas

  // ── inicializa(coord?) ────────────────────────────────────────────────────
  // Magik: inicializa(_optional RoCoord)
  //   set_fill_colour(_unset)  → sello transparente (no aplica en HTML)
  //   c_tablas.new(_self)      → crea contenedor de tablas
  //   prvCrea_Cfg_Tablas()     → apila las 3 tablas con coords calculadas
  //   bounds = area_total()    → ajusta límites del layout (no aplica en HTML)
  //   prvLlena_Celdas_de_tablas() → asigna contenido a cada celda
  //   bTablas_creadas = true
  inicializa(coord: { x: number; y: number } = { x: 0, y: 0 }): this {
    this.oCoordOrigen = coord;
    this._prvCreaCfgTablas();
    this._prvLlenaCeldasDeTablas();
    this.bTablas_creadas = true;
    return this;
  }

  // ── draw_content_on(window) ───────────────────────────────────────────────
  // Magik: if bTablas_Creadas = false → inicializa + Agrega_LYM + send_to_back
  //        oTablas.Despliega(window)
  // Guard de inicialización lazy: solo crea tablas la primera vez.
  drawContentOn(): DtoTablas | null {
    if (!this.bTablas_creadas) {
      this.inicializa(this.oCoordOrigen);
    }
    return this.oTablas;
  }

  // ── prvCrea_Cfg_Tablas() ──────────────────────────────────────────────────
  // Magik: prvCrea_Cfg_Tablas()
  //   Apila 3 tablas verticalmente descontando altura acumulada en Y:
  //     titulo      → en oCoordOrigen          (devuelve LnAltura=10)
  //     pares       → en (x, y - 10)           (devuelve LnAltura=9)
  //     pronosticos → en (x, y - 10 - 9 = y-19)(devuelve LnAltura=9)
  //   LoCoord = coordinate.new(x, LoCoord.y - LnAltura) → nuevo origen Y
  private _prvCreaCfgTablas(): void {
    const { x, y } = this.oCoordOrigen;
    const alturaTitulo     = this._prvCreaCfgTblTitulo({ x, y });
    const coordPares       = { x, y: y - alturaTitulo };
    const alturaPares      = this._prvCreaCfgTblPares(coordPares);
    const coordPronosticos = { x, y: coordPares.y - alturaPares };
    this._prvCreaCfgTblPronostico(coordPronosticos);
  }

  // ── _prvCreaCfgTblTitulo(coord) ───────────────────────────────────────────
  // Magik: crea_tabla(2, 2, :tbl_Titulo)
  //   bDibuja_bordes? = false, bDibuja_Columnas_Internas? = false,
  //   bDibuja_Renglones_Internos? = false
  //   Renglones: [5, 5] mm   Columnas: [10, 23] mm
  //   Celda(1,2).oElementos.obten_elemento(:bordes_celda).bBorde_inf? = true
  //   Retorna: LnAltura = 5+5 = 10 mm
  private _prvCreaCfgTblTitulo(coord: { x: number; y: number }): number {
    const titulo: DtoSubTabla = {
      nombre                : 'tbl_Titulo',
      filas                 : 2,
      cols                  : 2,
      alturas               : [5, 5],
      anchos                : [10, 23],
      celdas                : matrizVacia(2, 2),
      bordesDibujados       : false,
      colsInternasDibujadas : false,
      rengsInternosDibujados: false,
      coordOrigen           : coord,
      // celda(1,2) → índice [0][1] en base-0 — borde inferior especial
      bordeInfCeldas        : new Set(['0,1']),
    };
    this.oTablas = {
      titulo,
      pares      : null as unknown as DtoSubTabla,
      pronosticos: null as unknown as DtoSubTabla,
    };
    return titulo.alturas.reduce((a, b) => a + b, 0); // 10
  }

  // ── _prvCreaCfgTblPares(coord) ────────────────────────────────────────────
  // Magik: crea_tabla(3, 2, :tbl_pares)
  //   bDibuja_bordes? = true, bDibuja_Columnas_Internas? = false,
  //   bDibuja_Renglones_Internos? = true
  //   Renglones: [3, 3, 3] mm   Columnas: [15, 18] mm
  //   Retorna: LnAltura = 3+3+3 = 9 mm
  private _prvCreaCfgTblPares(coord: { x: number; y: number }): number {
    const pares: DtoSubTabla = {
      nombre                : 'tbl_pares',
      filas                 : 3,
      cols                  : 2,
      alturas               : [3, 3, 3],
      anchos                : [15, 18],
      celdas                : matrizVacia(3, 2),
      bordesDibujados       : true,
      colsInternasDibujadas : false,
      rengsInternosDibujados: true,
      coordOrigen           : coord,
      bordeInfCeldas        : new Set(),
    };
    this.oTablas!.pares = pares;
    return pares.alturas.reduce((a, b) => a + b, 0); // 9
  }

  // ── _prvCreaCfgTblPronostico(coord) ───────────────────────────────────────
  // Magik: crea_tabla(3, 3, :tbl_pronosticos)
  //   Los flags bDibuja_* están comentados → bordes ON por defecto
  //   Renglones: [3, 3, 3] mm   Columnas: [7, 8, 18] mm
  //   Retorna: LnAltura = 3+3+3 = 9 mm
  private _prvCreaCfgTblPronostico(coord: { x: number; y: number }): number {
    const pronosticos: DtoSubTabla = {
      nombre                : 'tbl_pronosticos',
      filas                 : 3,
      cols                  : 3,
      alturas               : [3, 3, 3],
      anchos                : [7, 8, 18],
      celdas                : matrizVacia(3, 3),
      bordesDibujados       : true,  // flags comentados en Magik → activados
      colsInternasDibujadas : true,
      rengsInternosDibujados: true,
      coordOrigen           : coord,
      bordeInfCeldas        : new Set(),
    };
    this.oTablas!.pronosticos = pronosticos;
    return pronosticos.alturas.reduce((a, b) => a + b, 0); // 9
  }

  // ── _prvLlenaCeldasDeTablas() ─────────────────────────────────────────────
  // Magik: prvLlena_Celdas_de_tablas() → llama los 3 métodos de llenado
  private _prvLlenaCeldasDeTablas(): void {
    this._prvLlenaTblTitulo();
    this._prvLlenaTblPares();
    this._prvLlenaTblPronostico();
  }

  // ── _prvLlenaTblTitulo() ──────────────────────────────────────────────────
  // Col 1 (texto_grafico): "DTO." / "D.A O.C."    tamaño 26, centre_left
  // Col 2 (captura_texto): "LJC-1" / "538.3 MTS"  tamaño  4, centre_left
  private _prvLlenaTblTitulo(): void {
    const t    = this.oTablas!.titulo;
    const base = textoGrafico('DTO.', 26);
    t.celdas[0][0] = textoGrafico('DTO.',     26, base);
    t.celdas[1][0] = textoGrafico('D.A O.C.', 26, base); // new_from(LoTit1)

    const baseC = capturaTexto('LJC-1', 4);
    t.celdas[0][1] = capturaTexto('LJC-1',     4, baseC);
    t.celdas[1][1] = capturaTexto('538.3 MTS', 4, baseC); // new_from(LoCapTxt1)
  }

  // ── _prvLlenaTblPares() ───────────────────────────────────────────────────
  // Col 1 (texto_grafico): "P.PRINC." / "P.SEC" / "ABNS. EXIST."  tamaño 18
  // Col 2 (captura_texto): "300+200" / "230+380" / "166"           tamaño  3
  private _prvLlenaTblPares(): void {
    const p    = this.oTablas!.pares;
    const base = textoGrafico('P.PRINC.', 18);
    p.celdas[0][0] = textoGrafico('P.PRINC.',     18, base);
    p.celdas[1][0] = textoGrafico('P.SEC',        18, base); // new_from(LoTit1)
    p.celdas[2][0] = textoGrafico('ABNS. EXIST.', 18, base); // new_from(LoTit1)

    const baseC = capturaTexto('300+200', 3);
    p.celdas[0][1] = capturaTexto('300+200', 3, baseC);
    p.celdas[1][1] = capturaTexto('230+380', 3, baseC); // new_from(LoCapTxt1)
    p.celdas[2][1] = capturaTexto('166',     3, baseC); // new_from(LoCapTxt1)
  }

  // ── _prvLlenaTblPronostico() ──────────────────────────────────────────────
  // Col 1 (texto_grafico): "N" / "N+1" / "SAT."  tamaño 18
  // Col 2 (captura_texto): vacío ×3               tamaño  2  (new_from(base))
  // Col 3 (captura_texto): vacío ×3               tamaño  2  (new_from(base))
  private _prvLlenaTblPronostico(): void {
    const pr   = this.oTablas!.pronosticos;
    const base = textoGrafico('N', 18);
    pr.celdas[0][0] = textoGrafico('N',    18, base);
    pr.celdas[1][0] = textoGrafico('N+1',  18, base); // new_from(LoTit1)
    pr.celdas[2][0] = textoGrafico('SAT.', 18, base); // new_from(LoTit1)

    // cols 2 y 3: c_Captura_Texto.new("") + new_from(base) × 3
    const baseC2 = capturaTexto('', 2);
    const baseC3 = capturaTexto('', 2);
    for (let f = 0; f < 3; f++) {
      pr.celdas[f][1] = capturaTexto('', 2, baseC2);
      pr.celdas[f][2] = capturaTexto('', 2, baseC3);
    }
  }

  // ── agregarLYM(lym) ───────────────────────────────────────────────────────
  // Magik: Agrega_LYM(RoLym) → oTablas.Agrega_LYM(lym)
  // En Smallworld añade todos los layout elements a la página activa.
  // Sin equivalente directo en HTML — stub preservado para completitud.
  agregarLYM(_lym: unknown): void { /* stub — layout manager no aplica en React */ }

  /** Reinicia el sello — permite re-ejecutar inicializa() */
  reset(): void {
    this.oTablas         = null;
    this.bTablas_creadas = false;
  }
}

// ---------------------------------------------------------------------------
// Subcomponente — renderiza una DtoSubTabla como tabla HTML
// ---------------------------------------------------------------------------

const SCALE = 5; // px por mm

function SubTablaView({
  tabla,
  values,
  onCellChange,
}: {
  tabla       : DtoSubTabla;
  values      : Record<string, string>;
  onCellChange: (nombre: string, fi: number, ci: number, val: string) => void;
}) {
  const totalPx = tabla.anchos.reduce((a, b) => a + b, 0) * SCALE;

  return (
    <div>
      {/* Cabecera de sub-tabla */}
      <div style={{
        background: '#313244', color: '#89dceb',
        padding: '2px 6px', fontSize: 10,
        display: 'flex', justifyContent: 'space-between',
        borderBottom: '1px solid #45475a',
      }}>
        <span style={{ fontWeight: 'bold' }}>:{tabla.nombre}</span>
        <span style={{ color: '#585b70' }}>
          {tabla.filas}f×{tabla.cols}c · [{tabla.alturas.join('+')}]mm × [{tabla.anchos.join('+')}]mm
          {!tabla.bordesDibujados       && ' · sin borde externo'}
          {!tabla.colsInternasDibujadas && ' · sin cols int'}
          {!tabla.rengsInternosDibujados && ' · sin rens int'}
        </span>
      </div>

      {/* Tabla HTML */}
      <table style={{
        borderCollapse: 'collapse',
        width          : totalPx,
        tableLayout    : 'fixed',
        border         : tabla.bordesDibujados ? '1px solid #89b4fa' : 'none',
      }}>
        <colgroup>
          {tabla.anchos.map((a, ci) => <col key={ci} style={{ width: a * SCALE }} />)}
        </colgroup>
        <tbody>
          {tabla.celdas.map((fila, fi) => (
            <tr key={fi}>
              {fila.map((celda, ci) => {
                const bordeInf   = tabla.bordeInfCeldas.has(`${fi},${ci}`);
                const bordeRight = tabla.colsInternasDibujadas && ci < tabla.cols - 1;
                const bordeBot   = (tabla.rengsInternosDibujados && fi < tabla.filas - 1) || bordeInf;
                const key        = `${tabla.nombre}:${fi},${ci}`;

                return (
                  <td key={ci} style={{
                    height       : tabla.alturas[fi] * SCALE,
                    padding      : '1px 3px',
                    verticalAlign: 'middle',
                    overflow     : 'hidden',
                    borderRight  : bordeRight ? '1px solid #45475a' : 'none',
                    borderBottom : bordeBot
                      ? bordeInf ? '2px solid #cba6f7' : '1px solid #45475a'
                      : 'none',
                  }}>
                    {celda.tipo === 'captura_texto' ? (
                      // c_Captura_Texto → input editable
                      <input
                        type="text"
                        value={values[key] ?? celda.texto}
                        onChange={e => onCellChange(tabla.nombre, fi, ci, e.target.value)}
                        style={{
                          background: 'transparent',
                          border    : '1px dashed #45475a',
                          borderRadius: 2,
                          color     : '#a6e3a1',
                          fontFamily: 'monospace',
                          fontSize  : Math.max(celda.tamano * 0.4, 9),
                          width     : '100%',
                          outline   : 'none',
                          padding   : '0 2px',
                          boxSizing : 'border-box',
                        }}
                        title={`c_Captura_Texto · nTamanio=${celda.tamano}pt`}
                      />
                    ) : (
                      // c_texto_grafico → texto fijo
                      <span style={{
                        color     : '#cdd6f4',
                        fontSize  : Math.max(celda.tamano * 0.4, 9),
                        fontWeight: celda.tamano >= 18 ? 'bold' : 'normal',
                        display   : 'block',
                        overflow  : 'hidden',
                        whiteSpace: 'nowrap',
                      }} title={`c_texto_grafico · nTamanio=${celda.tamano}pt`}>
                        {celda.texto || <span style={{ color: '#585b70' }}>—</span>}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — CDtoPronosticoUI
// ---------------------------------------------------------------------------
export function CDtoPronosticoUI() {
  const [instancia] = useState(() => new CDtoPronostico());
  const [tablas,    setTablas]  = useState<DtoTablas | null>(null);
  const [creado,    setCreado]  = useState(false);
  const [modo,      setModo]    = useState<'ninguno' | 'inicializa' | 'lazy'>('ninguno');
  // Estado editable de celdas captura_texto (propagado hacia arriba desde inputs)
  const [values, setValues]     = useState<Record<string, string>>({});

  const snapshot = useCallback(() => {
    const t = instancia.oTablas!;
    // Clona tablas para trigger de re-render React
    setTablas({
      titulo     : { ...t.titulo,      bordeInfCeldas: t.titulo.bordeInfCeldas,      celdas: t.titulo.celdas.map(r => [...r]) },
      pares      : { ...t.pares,       bordeInfCeldas: t.pares.bordeInfCeldas,       celdas: t.pares.celdas.map(r => [...r]) },
      pronosticos: { ...t.pronosticos, bordeInfCeldas: t.pronosticos.bordeInfCeldas, celdas: t.pronosticos.celdas.map(r => [...r]) },
    });
  }, [instancia]);

  function handleInicializa() {
    instancia.reset();
    instancia.inicializa({ x: 0, y: 0 });
    snapshot();
    setValues({});
    setCreado(true);
    setModo('inicializa');
  }

  function handleDrawContentOn() {
    // Guard: drawContentOn solo inicializa si bTablas_creadas = false
    instancia.drawContentOn();
    snapshot();
    setCreado(true);
    setModo('lazy');
  }

  function handleReset() {
    instancia.reset();
    setTablas(null);
    setValues({});
    setCreado(false);
    setModo('ninguno');
  }

  function handleCellChange(nombre: string, fi: number, ci: number, val: string) {
    const key = `${nombre}:${fi},${ci}`;
    setValues(prev => ({ ...prev, [key]: val }));
  }

  const totalAltura = tablas
    ? tablas.titulo.alturas.reduce((a,b)=>a+b,0)
    + tablas.pares.alturas.reduce((a,b)=>a+b,0)
    + tablas.pronosticos.alturas.reduce((a,b)=>a+b,0)
    : 0;
  const totalAncho = tablas
    ? Math.max(
        tablas.titulo.anchos.reduce((a,b)=>a+b,0),
        tablas.pares.anchos.reduce((a,b)=>a+b,0),
        tablas.pronosticos.anchos.reduce((a,b)=>a+b,0),
      )
    : 0;

  const s: Record<string, React.CSSProperties> = {
    wrap   : { fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e', color: '#cdd6f4', padding: 16, borderRadius: 8 },
    header : { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
    btn    : { padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8 },
    btnBlue: { padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#89b4fa', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8 },
    btnGray: { padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#313244', color: '#585b70', fontFamily: 'monospace', fontSize: 12, marginRight: 8 },
    meta   : { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
    chip   : { background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 },
    chipKey: { color: '#585b70' },
    chipVal: { color: '#a6e3a1' },
  };

  return (
    <div style={s.wrap}>
      {/* Cabecera */}
      <div style={s.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>CDtoPronostico</span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          :layout_element → sello "Resumen de materiales" (red de pares de cobre)
        </span>
      </div>

      {/* Controles — draw_content_on / inicializa / reset */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleInicializa}   style={s.btn}>inicializa()</button>
        <button onClick={handleDrawContentOn} style={!creado ? s.btnBlue : s.btnGray}
          title={creado ? 'bTablas_creadas=true → guard no re-crea' : 'bTablas_creadas=false → crea tablas'}>
          drawContentOn() {creado ? '(guard ON)' : '(lazy)'}
        </button>
        <button onClick={handleReset} style={s.btnGray}>reset()</button>
      </div>

      {/* Estado */}
      {modo !== 'ninguno' && (
        <div style={{ background: '#313244', border: '1px solid #45475a', borderRadius: 4, padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11 }}>
          {modo === 'inicializa'
            ? 'inicializa() ejecutado — prvCrea_Cfg_Tablas() + prvLlena_Celdas_de_tablas() — bTablas_creadas: true'
            : 'drawContentOn() — guard: bTablas_creadas=true → Despliega sin re-crear'}
        </div>
      )}

      {/* Metadatos */}
      {tablas && (
        <div style={s.meta}>
          {[
            { k: 'bTablas_creadas', v: String(creado) },
            { k: 'ancho total',     v: `${totalAncho} mm (${totalAncho * SCALE}px)` },
            { k: 'alto total',      v: `${totalAltura} mm (${totalAltura * SCALE}px)` },
            { k: 'sub-tablas',      v: '3 (titulo + pares + pronosticos)' },
            { k: 'celdas editadas', v: String(Object.keys(values).length) },
          ].map(({ k, v }) => (
            <div key={k} style={s.chip}>
              <span style={s.chipKey}>{k}: </span>
              <span style={s.chipVal}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      {tablas && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 11 }}>
          <span><span style={{ color: '#cdd6f4' }}>━ </span><span style={{ color: '#585b70' }}>c_texto_grafico (fijo)</span></span>
          <span><span style={{ color: '#a6e3a1' }}>┄ </span><span style={{ color: '#585b70' }}>c_Captura_Texto (editable)</span></span>
          <span><span style={{ color: '#cba6f7' }}>━ </span><span style={{ color: '#585b70' }}>borde inferior especial — celda(1,2)</span></span>
        </div>
      )}

      {/* Sello — 3 sub-tablas apiladas verticalmente */}
      {!tablas && (
        <div style={{ color: '#585b70', textAlign: 'center', padding: 32 }}>
          Pulsa inicializa() o drawContentOn() para generar el sello.
        </div>
      )}

      {tablas && (
        <div style={{ display: 'inline-block', border: '1px solid #45475a', background: '#181825', borderRadius: 4, overflow: 'hidden' }}>
          <SubTablaView tabla={tablas.titulo}      values={values} onCellChange={handleCellChange} />
          <SubTablaView tabla={tablas.pares}       values={values} onCellChange={handleCellChange} />
          <SubTablaView tabla={tablas.pronosticos} values={values} onCellChange={handleCellChange} />
        </div>
      )}

      {/* Tabla de dimensiones y coordenadas */}
      {tablas && (
        <div style={{ marginTop: 14, fontSize: 11 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['Sub-tabla', 'F×C', 'Alturas (mm)', 'Anchos (mm)', 'Bordes', 'Coord Y origen'].map(h => (
                  <th key={h} style={{ background: '#313244', border: '1px solid #45475a', padding: '3px 8px', color: '#cba6f7', textAlign: 'left', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([tablas.titulo, tablas.pares, tablas.pronosticos] as DtoSubTabla[]).map((t, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#1e1e2e' : '#181825' }}>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px', color: '#89b4fa' }}>:{t.nombre}</td>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px' }}>{t.filas}×{t.cols}</td>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px', color: '#f9e2af' }}>[{t.alturas.join(', ')}]</td>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px', color: '#f9e2af' }}>[{t.anchos.join(', ')}]</td>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px', color: t.bordesDibujados ? '#a6e3a1' : '#f38ba8' }}>
                    {t.bordesDibujados ? '✔' : '✘'}
                  </td>
                  <td style={{ border: '1px solid #45475a', padding: '3px 8px', color: '#585b70' }}>
                    y = {t.coordOrigen.y}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CDtoPronosticoUI;
