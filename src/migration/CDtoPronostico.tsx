// =============================================================================
// MIGRACIÓN: c_dto_pronostico  →  CDtoPronostico.tsx
// Jerarquía Magik: c_dto_pronostico  extends  :layout_element
// Autor original:  dsanchez, 03-Abril-2005 (Sigma Tao / Traza: Planos)
// =============================================================================
// Propósito: sello de layout para planos de red telefónica de cobre.
// Contiene 3 sub-tablas apiladas verticalmente (total ~33 mm × 28 mm):
//   tbl_Titulo       2×2  (10 mm) — DTO / D.A.O.C.  + captura
//   tbl_pares        3×2  ( 9 mm) — P.PRINC./P.SEC/ABNS.EXIST. + captura
//   tbl_pronosticos  3×3  ( 9 mm) — N/N+1/SAT. + 2 cols captura vacías
// =============================================================================

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

export type CeldaTipo = 'texto_grafico' | 'captura_texto';

export interface DtoCelda {
  tipo:      CeldaTipo;
  texto:     string;       // valor inicial / por defecto
  tamano:    number;       // nTamanio (pt)
  alineacion: 'centre_left' | 'center' | 'top_left';
}

export interface DtoSubTabla {
  nombre:    string;
  filas:     number;
  cols:      number;
  alturas:   number[];     // altura de cada fila en mm
  anchos:    number[];     // ancho de cada columna en mm
  celdas:    DtoCelda[][]; // [fila 0-based][col 0-based]
  bordesDibujados:      boolean;
  colsInternasDibujadas: boolean;
  rengsInternosDibujados: boolean;
  coordOrigen: { x: number; y: number };
  bordeInfCeldas: Set<string>; // "f,c" → borde inferior activo
}

export interface DtoTablas {
  titulo:       DtoSubTabla;
  pares:        DtoSubTabla;
  pronosticos:  DtoSubTabla;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

// Equivale a c_texto_grafico.new(texto) / c_texto_grafico.new_from(base, texto)
function textoGrafico(texto: string, tamano: number, base?: DtoCelda): DtoCelda {
  return {
    tipo     : 'texto_grafico',
    texto,
    tamano,
    alineacion: base?.alineacion ?? 'centre_left',
  };
}

// Equivale a c_Captura_Texto.new(texto) / c_Captura_Texto.new_from(base, texto?)
function capturaTexto(texto: string, tamano: number, base?: DtoCelda): DtoCelda {
  return {
    tipo     : 'captura_texto',
    texto,
    tamano,
    alineacion: base?.alineacion ?? 'centre_left',
  };
}

// Crea matriz de celdas vacías [filas][cols]
function matrizVacia(filas: number, cols: number): DtoCelda[][] {
  return Array.from({ length: filas }, () =>
    Array.from({ length: cols }, (): DtoCelda => ({
      tipo: 'texto_grafico', texto: '', tamano: 10, alineacion: 'centre_left',
    }))
  );
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_dto_pronostico (extends :layout_element).
 * Sello de layout para pronósticos de red de pares de cobre.
 * Tres sub-tablas apiladas verticalmente gestionadas por prvCrea_Cfg_Tablas().
 * Inicialización lazy en draw_content_on: si bTablas_creadas=false, inicializa.
 */
export class CDtoPronostico {
  // Slots
  oTablas:         DtoTablas | null = null;
  oCoordOrigen:    { x: number; y: number } = { x: 0, y: 0 };
  bTablas_creadas: boolean = false; // _false en Magik, no _unset

  // ── inicializa(coord?) ────────────────────────────────────────────────────
  // Magik: inicializa(_optional RoCoord)
  //   set_fill_colour(_unset) → transparente
  //   c_tablas.new(_self) → estructura interna
  //   prvCrea_Cfg_Tablas() → stacks 3 sub-tablas con coordenadas calculadas
  //   bounds = area_total() → no aplicable en React
  //   prvLlena_Celdas_de_tablas() → asigna contenido
  inicializa(coord: { x: number; y: number } = { x: 0, y: 0 }): this {
    this.oCoordOrigen = coord;
    // Crea las 3 sub-tablas con sus coordenadas apiladas
    this._prvCreaCfgTablas();
    // Llena el contenido de cada sub-tabla
    this._prvLlenaCeldasDeTablas();
    this.bTablas_creadas = true;
    return this;
  }

  // ── draw_content_on(window) ───────────────────────────────────────────────
  // Magik: if bTablas_creadas = false → inicializa + Agrega_LYM + send_to_back
  // Inicialización lazy — solo crea tablas si no existen todavía.
  drawContentOn(): DtoTablas | null {
    if (!this.bTablas_creadas) {
      this.inicializa(this.oCoordOrigen);
    }
    return this.oTablas;
  }

  // ── prvCrea_Cfg_Tablas() ──────────────────────────────────────────────────
  // Magik: prvCrea_Cfg_Tablas()
  //   Apila 3 tablas verticalmente:
  //     titulo     en oCoordOrigen            → devuelve LnAltura=10
  //     pares      en (x, y - 10)             → devuelve LnAltura=9
  //     pronosticos en (x, y - 10 - 9 = y-19) → devuelve LnAltura=9
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
  //   Sin bordes, sin líneas internas
  //   Renglones: [5, 5] mm   Columnas: [10, 23] mm
  //   Activa borde inferior en celda(1,2)
  //   Retorna: LnAltura = 5+5 = 10 mm
  private _prvCreaCfgTblTitulo(coord: { x: number; y: number }): number {
    const titulo: DtoSubTabla = {
      nombre    : 'tbl_Titulo',
      filas     : 2, cols: 2,
      alturas   : [5, 5],
      anchos    : [10, 23],
      celdas    : matrizVacia(2, 2),
      bordesDibujados      : false, // bDibuja_bordes? = false
      colsInternasDibujadas: false,
      rengsInternosDibujados: false,
      coordOrigen: coord,
      bordeInfCeldas: new Set(['0,1']), // celda(1,2) → idx [0][1] — borde inferior
    };
    if (!this.oTablas) {
      this.oTablas = {
        titulo,
        pares:       null as unknown as DtoSubTabla,
        pronosticos: null as unknown as DtoSubTabla,
      };
    } else {
      this.oTablas.titulo = titulo;
    }
    return titulo.alturas.reduce((a, b) => a + b, 0); // 10 mm
  }

  // ── _prvCreaCfgTblPares(coord) ────────────────────────────────────────────
  // Magik: crea_tabla(3, 2, :tbl_pares)
  //   Bordes exteriores activos, sin columnas internas, con renglones internos
  //   Renglones: [3, 3, 3] mm   Columnas: [15, 18] mm
  //   Retorna: 3+3+3 = 9 mm
  private _prvCreaCfgTblPares(coord: { x: number; y: number }): number {
    const pares: DtoSubTabla = {
      nombre    : 'tbl_pares',
      filas     : 3, cols: 2,
      alturas   : [3, 3, 3],
      anchos    : [15, 18],
      celdas    : matrizVacia(3, 2),
      bordesDibujados      : true,  // bDibuja_bordes? = true
      colsInternasDibujadas: false, // bDibuja_Columnas_Internas? = false
      rengsInternosDibujados: true, // bDibuja_Renglones_Internos? = true
      coordOrigen: coord,
      bordeInfCeldas: new Set(),
    };
    this.oTablas!.pares = pares;
    return pares.alturas.reduce((a, b) => a + b, 0); // 9 mm
  }

  // ── _prvCreaCfgTblPronostico(coord) ───────────────────────────────────────
  // Magik: crea_tabla(3, 3, :tbl_pronosticos)
  //   Bordes por defecto (líneas comentadas → bordes activos)
  //   Renglones: [3, 3, 3] mm   Columnas: [7, 8, 18] mm
  //   Retorna: 3+3+3 = 9 mm
  private _prvCreaCfgTblPronostico(coord: { x: number; y: number }): number {
    const pronosticos: DtoSubTabla = {
      nombre    : 'tbl_pronosticos',
      filas     : 3, cols: 3,
      alturas   : [3, 3, 3],
      anchos    : [7, 8, 18],
      celdas    : matrizVacia(3, 3),
      bordesDibujados      : true, // bloques comentados → bordes ON por defecto
      colsInternasDibujadas: true,
      rengsInternosDibujados: true,
      coordOrigen: coord,
      bordeInfCeldas: new Set(),
    };
    this.oTablas!.pronosticos = pronosticos;
    return pronosticos.alturas.reduce((a, b) => a + b, 0); // 9 mm
  }

  // ── _prvLlenaCeldasDeTablas() ─────────────────────────────────────────────
  // Magik: prvLlena_Celdas_de_tablas() → llama los 3 métodos de llenado
  private _prvLlenaCeldasDeTablas(): void {
    this._prvLlenaTblTitulo();
    this._prvLlenaTblPares();
    this._prvLlenaTblPronostico();
  }

  // ── _prvLlenaTblTitulo() ──────────────────────────────────────────────────
  // Col 1: c_texto_grafico "DTO." / "D.A O.C."   tamaño 26, centre_left
  // Col 2: c_Captura_Texto "LJC-1" / "538.3 MTS" tamaño  4, centre_left
  private _prvLlenaTblTitulo(): void {
    const t = this.oTablas!.titulo;
    const base = textoGrafico('DTO.', 26);
    t.celdas[0][0] = textoGrafico('DTO.',      26, base);
    t.celdas[1][0] = textoGrafico('D.A O.C.', 26, base);

    const baseC = capturaTexto('LJC-1', 4);
    t.celdas[0][1] = capturaTexto('LJC-1',     4, baseC);
    t.celdas[1][1] = capturaTexto('538.3 MTS', 4, baseC);
  }

  // ── _prvLlenaTblPares() ───────────────────────────────────────────────────
  // Col 1: "P.PRINC." / "P.SEC" / "ABNS. EXIST."  tamaño 18, centre_left
  // Col 2: "300+200" / "230+380" / "166"           tamaño  3, centre_left (captura)
  private _prvLlenaTblPares(): void {
    const p = this.oTablas!.pares;
    const base = textoGrafico('P.PRINC.', 18);
    p.celdas[0][0] = textoGrafico('P.PRINC.',    18, base);
    p.celdas[1][0] = textoGrafico('P.SEC',       18, base); // new_from(LoTit1)
    p.celdas[2][0] = textoGrafico('ABNS. EXIST.',18, base); // new_from(LoTit1)

    const baseC = capturaTexto('300+200', 3);
    p.celdas[0][1] = capturaTexto('300+200', 3, baseC);
    p.celdas[1][1] = capturaTexto('230+380', 3, baseC); // new_from(LoCapTxt1)
    p.celdas[2][1] = capturaTexto('166',     3, baseC); // new_from(LoCapTxt1)
  }

  // ── _prvLlenaTblPronostico() ──────────────────────────────────────────────
  // Col 1: "N" / "N+1" / "SAT."  tamaño 18, centre_left  (texto_grafico)
  // Col 2: "", "", ""             tamaño  2, centre_left  (captura vacía)
  // Col 3: "", "", ""             tamaño  2, centre_left  (captura vacía)
  private _prvLlenaTblPronostico(): void {
    const pr = this.oTablas!.pronosticos;
    const base = textoGrafico('N', 18);
    pr.celdas[0][0] = textoGrafico('N',    18, base);
    pr.celdas[1][0] = textoGrafico('N+1',  18, base); // new_from(LoTit1)
    pr.celdas[2][0] = textoGrafico('SAT.', 18, base); // new_from(LoTit1)

    // Columnas 2 y 3: captura vacía (new_from con misma base)
    const baseC2 = capturaTexto('', 2);
    for (let f = 0; f < 3; f++) {
      pr.celdas[f][1] = capturaTexto('', 2, baseC2); // col 2
      pr.celdas[f][2] = capturaTexto('', 2, baseC2); // col 3
    }
  }

  // ── agregarLYM(lym) ───────────────────────────────────────────────────────
  // Magik: Agrega_LYM(RoLym) → oTablas.Agrega_LYM(lym)
  agregarLYM(_lym: unknown): void { /* stub — no hay layout manager real */ }

  reset(): void {
    this.oTablas         = null;
    this.bTablas_creadas = false;
  }
}

// =============================================================================
// Componente React — CDtoPronosticoUI
// =============================================================================

const SCALE = 5; // px por mm — escala visual

const ui: Record<string, React.CSSProperties> = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, maxWidth: 900,
  },
  header: { borderBottom: '1px solid #45475a', paddingBottom: 8, marginBottom: 12 },
  btn: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#a6e3a1', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  },
  btnBlue: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#89b4fa', color: '#1e1e2e', fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  },
  btnGray: {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: '#313244', color: '#585b70', fontFamily: 'monospace', fontSize: 12,
  },
  msg: {
    background: '#313244', border: '1px solid #45475a', borderRadius: 4,
    padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11,
  },
  meta: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginBottom: 12 },
  metaItem: { background: '#313244', borderRadius: 4, padding: '3px 8px', fontSize: 11 },
};

// Renderiza una sub-tabla con bordes configurables y celdas editables
function SubTablaView({
  tabla,
  onCellChange,
}: {
  tabla: DtoSubTabla;
  onCellChange: (tablaNombre: string, f: number, c: number, val: string) => void;
}) {
  const totalAncho = tabla.anchos.reduce((a, b) => a + b, 0) * SCALE;

  return (
    <div style={{ marginBottom: 0 }}>
      {/* Nombre de la sub-tabla */}
      <div style={{
        background: '#313244', color: '#89dceb', fontSize: 10,
        padding: '1px 6px', borderBottom: '1px solid #45475a',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>:{tabla.nombre}</span>
        <span style={{ color: '#585b70' }}>
          {tabla.filas}f×{tabla.cols}c
          {' '}[{tabla.alturas.join('+')}]mm×[{tabla.anchos.join('+')}]mm
          {!tabla.bordesDibujados && ' · sin bordes'}
          {!tabla.colsInternasDibujadas && ' · sin cols int'}
          {!tabla.rengsInternosDibujados && ' · sin rens int'}
        </span>
      </div>

      {/* Tabla CSS */}
      <table style={{
        borderCollapse: 'collapse',
        width           : totalAncho,
        tableLayout     : 'fixed',
        border          : tabla.bordesDibujados ? '1px solid #89b4fa' : 'none',
      }}>
        <colgroup>
          {tabla.anchos.map((a, ci) => (
            <col key={ci} style={{ width: a * SCALE }} />
          ))}
        </colgroup>
        <tbody>
          {tabla.celdas.map((fila, fi) => (
            <tr key={fi}>
              {fila.map((celda, ci) => {
                const bordeInf = tabla.bordeInfCeldas.has(`${fi},${ci}`);
                const bordeRight = tabla.colsInternasDibujadas && ci < tabla.cols - 1;
                const bordeBottom = (tabla.rengsInternosDibujados && fi < tabla.filas - 1) || bordeInf;
                const h = tabla.alturas[fi] * SCALE;

                return (
                  <td key={ci} style={{
                    height         : h,
                    padding        : '1px 3px',
                    verticalAlign  : 'middle',
                    borderRight    : bordeRight  ? '1px solid #45475a' : 'none',
                    borderBottom   : bordeBottom ? (bordeInf ? '2px solid #cba6f7' : '1px solid #45475a') : 'none',
                    overflow       : 'hidden',
                  }}>
                    {celda.tipo === 'captura_texto' ? (
                      <input
                        type="text"
                        defaultValue={celda.texto}
                        onChange={e => onCellChange(tabla.nombre, fi, ci, e.target.value)}
                        style={{
                          background : 'transparent',
                          border     : '1px dashed #45475a',
                          borderRadius: 2,
                          color      : '#a6e3a1',
                          fontFamily : 'monospace',
                          fontSize   : Math.max(celda.tamano * 0.4, 9),
                          width      : '100%',
                          outline    : 'none',
                          padding    : '0 2px',
                        }}
                        title={`c_Captura_Texto tamaño=${celda.tamano}pt`}
                      />
                    ) : (
                      <span style={{
                        color    : '#cdd6f4',
                        fontSize : Math.max(celda.tamano * 0.4, 9),
                        fontWeight: celda.tamano >= 20 ? 'bold' : 'normal',
                        display  : 'block',
                        overflow : 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                        title={`c_texto_grafico tamaño=${celda.tamano}pt`}
                      >
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

export function CDtoPronosticoUI() {
  const [instancia]    = useState(() => new CDtoPronostico());
  const [tablas, setTablas] = useState<DtoTablas | null>(null);
  const [creado, setCreado] = useState(false);
  const [msg,    setMsg]    = useState('');

  // Estado editable de las celdas (copia local para React)
  const [cells, setCells] = useState<Record<string, string>>({});

  function handleInicializa() {
    instancia.reset();
    instancia.inicializa({ x: 0, y: 0 });
    // Deep clone para el estado React
    const t = instancia.oTablas!;
    setTablas({
      titulo      : { ...t.titulo,      bordeInfCeldas: t.titulo.bordeInfCeldas,      celdas: t.titulo.celdas.map(r => [...r])      },
      pares       : { ...t.pares,       bordeInfCeldas: t.pares.bordeInfCeldas,       celdas: t.pares.celdas.map(r => [...r])       },
      pronosticos : { ...t.pronosticos, bordeInfCeldas: t.pronosticos.bordeInfCeldas, celdas: t.pronosticos.celdas.map(r => [...r]) },
    });
    setCells({});
    setCreado(true);
    setMsg('inicializa() ejecutado — 3 sub-tablas creadas — bTablas_creadas: true');
  }

  function handleDrawContentOn() {
    const result = instancia.drawContentOn();
    if (result) {
      setTablas({ ...result });
      setCreado(true);
      setMsg('drawContentOn() — inicialización lazy completada.');
    }
  }

  function handleCellChange(tablaNombre: string, f: number, c: number, val: string) {
    setCells(prev => ({ ...prev, [`${tablaNombre}:${f},${c}`]: val }));
  }

  const totalH = tablas
    ? (tablas.titulo.alturas.reduce((a,b)=>a+b,0) +
       tablas.pares.alturas.reduce((a,b)=>a+b,0) +
       tablas.pronosticos.alturas.reduce((a,b)=>a+b,0))
    : 0;
  const totalW = tablas
    ? tablas.titulo.anchos.reduce((a,b)=>a+b,0)
    : 0;

  return (
    <div style={ui.wrap}>
      {/* Cabecera */}
      <div style={ui.header}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CDtoPronostico
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          layout_element → sello DTO pronóstico (red de pares de cobre)
        </span>
      </div>

      {/* Controles */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handleInicializa}   style={ui.btn}>inicializa()</button>
        <button onClick={handleDrawContentOn} disabled={creado}
          style={creado ? ui.btnGray : ui.btnBlue}>
          drawContentOn() (lazy)
        </button>
        <button onClick={() => { instancia.reset(); setTablas(null); setCreado(false); setMsg('reset()'); }}
          style={{ ...ui.btnGray, marginLeft: 0 }}>
          reset()
        </button>
      </div>

      {/* Mensaje */}
      {msg && <div style={ui.msg}>{msg}</div>}

      {/* Metadatos */}
      {tablas && (
        <div style={ui.meta}>
          {[
            { k: 'bTablas_creadas', v: String(creado) },
            { k: 'totalWidth',      v: `${totalW} mm (${totalW * SCALE}px)` },
            { k: 'totalHeight',     v: `${totalH} mm (${totalH * SCALE}px)` },
            { k: 'sub-tablas',      v: '3 (titulo + pares + pronosticos)' },
            { k: 'celdas editadas', v: String(Object.keys(cells).length) },
          ].map(item => (
            <div key={item.k} style={ui.metaItem}>
              <span style={{ color: '#585b70' }}>{item.k}: </span>
              <span style={{ color: '#a6e3a1' }}>{item.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      {tablas && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 11 }}>
          <span>
            <span style={{ color: '#cdd6f4' }}>━ </span>
            <span style={{ color: '#cdd6f4' }}>c_texto_grafico (fijo)</span>
          </span>
          <span>
            <span style={{ color: '#a6e3a1' }}>┄ </span>
            <span style={{ color: '#a6e3a1' }}>c_Captura_Texto (editable)</span>
          </span>
          <span>
            <span style={{ color: '#cba6f7' }}>━ </span>
            <span style={{ color: '#cba6f7' }}>borde inferior especial (celda 1,2)</span>
          </span>
        </div>
      )}

      {/* Sub-tablas apiladas */}
      {!tablas && (
        <div style={{ color: '#585b70', textAlign: 'center', padding: 32, fontSize: 12 }}>
          Pulsa inicializa() para generar las tablas.
        </div>
      )}

      {tablas && (
        <div style={{
          display: 'inline-block', border: '1px solid #45475a',
          background: '#181825', borderRadius: 4, overflow: 'hidden',
        }}>
          <SubTablaView tabla={tablas.titulo}      onCellChange={handleCellChange} />
          <SubTablaView tabla={tablas.pares}       onCellChange={handleCellChange} />
          <SubTablaView tabla={tablas.pronosticos} onCellChange={handleCellChange} />
        </div>
      )}

      {/* Tabla de dimensiones */}
      {tablas && (
        <div style={{ marginTop: 14, fontSize: 11 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['Sub-tabla','Filas×Cols','Alturas (mm)','Anchos (mm)','Bordes','Coord (y)'].map(h => (
                  <th key={h} style={{ background:'#313244', border:'1px solid #45475a',
                                       padding:'3px 8px', color:'#cba6f7', textAlign:'left', fontSize:11 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([tablas.titulo, tablas.pares, tablas.pronosticos] as DtoSubTabla[]).map((t, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#1e1e2e' : '#181825' }}>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px', color:'#89b4fa' }}>:{t.nombre}</td>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px' }}>{t.filas}×{t.cols}</td>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px', color:'#f9e2af' }}>[{t.alturas.join(', ')}]</td>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px', color:'#f9e2af' }}>[{t.anchos.join(', ')}]</td>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px', color: t.bordesDibujados ? '#a6e3a1' : '#f38ba8' }}>
                    {t.bordesDibujados ? '✔' : '✘'}
                  </td>
                  <td style={{ border:'1px solid #45475a', padding:'3px 8px', color:'#585b70' }}>
                    y={t.coordOrigen.y}
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
