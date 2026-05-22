// =============================================================================
// MIGRACIÓN: c_resumen_materiales  →  CResumenMateriales.tsx
// Jerarquía Magik: c_resumen_materiales  extends  :layout_element
// =============================================================================

import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Tipos de datos
// ---------------------------------------------------------------------------

export type TipoPlan = 'SEMBRADO' | 'COMPLETO';

export interface CeldaTexto {
  texto: string;
  editable: boolean; // true → c_captura_texto, false → c_texto_grafico
}

export interface TablaSeccion {
  nombre: string;
  filas: CeldaTexto[][];  // [row][col]
  cols: number;
  numRows: number;        // sin cabecera
}

export interface SeccionMateriales {
  titulo: string;
  tabla: TablaSeccion;
}

// ---------------------------------------------------------------------------
// Constantes: listas de descripción por sección
// ---------------------------------------------------------------------------

const DESC_ZONA_URBANA: string[] = [
  'B.D.F.O.',
  'DISTRIB. OPTICO',
  'ECALERILLA P/F. O.',
  'ESCALERILLA EXIST.',
  'ESCALERILLA PROY.',
  'PROT. MECÁNICA',
  'COND. METALICO',
  'MANGUERA',
  'COND. AÉREO',
  'COND. AÉREO TREN.',
  'CABLE FACHADERO',
  'VARILLA AEREA',
  'VARIOS',
];

const DESC_ZONA_SUBURBANA: string[] = [
  'DUCTO DE P. ENTERR.',
  'DUCT. ENTERR DERIV.',
  'DUCT. ENTERR BACKET',
  'DUCT. BAJO CALZADA',
  'DUCTO AEREO',
  'DUCTO PUENTE',
  'T.C. EXISTENTE',
  'T.C. PROYECTADA',
  'REF. T.C. EXISTENTE',
  'COND. SUBTERR.',
  'TUBO ACERO',
  'TUBO P.V.C.',
  'CABLE TIERRA',
  'CABLE COBRE',
  'PROT. MANGUERA',
  'PROT. M.C. AEREO',
  'PROT. HORMIGON',
  'PROT. MADERA',
  'PROT. HIERRO',
  'CRUCE ESPECIAL',
  'VARIOS',
];

const DESC_TRAMO: string[] = [
  '',
  'ESCALERILLA EXIST.',
  'ESCALERILLA PROY.',
  'COND. METALICO',
  'MANGUERA',
  'COND. AÉREO',
  'COND. AÉREO TREN.',
  'CABLE FACHADERO',
  'VARILLA AEREA',
  'B.D.F.O.',
  'VARIOS',
];

const DESC_DERIVACIONES: string[] = [
  'S.D.V. EXISTENTE',
  'S.D.V. PROYECTADA',
  'S.D.V. PROY. ESPEC.',
  'CAJA EMPALME EXIST.',
  'CAJA EMPALME PROY.',
  'CAJA EMPALM ESPEC.',
  'TUBO AÉREO',
  'VARIOS',
];

const DESC_PERMISOS: string[] = [
  'INST. MARG. AUTOP.',
  'INST. MARG. FEDERAL',
  'INST. MARG. PROV.',
  'INST. MARG. MUNIC.',
  'INST. VIA FÉRREA',
  'CRUCE AUTOP.',
  'CRUCE FEDERAL',
  'CRUCE PROV.',
  'CRUCE MUNIC.',
  'CRUCE VIA FÉRREA',
  'CRUCE CANAL',
  'CRUCE RIO',
  'INST. ESPACIO VERDE',
  'CRUCE ESPECIAL',
  'VARIOS',
];

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

/**
 * Migración de c_resumen_materiales (extends :layout_element).
 * Tabla de materiales de construcción dividida en 5 secciones:
 * ZonaUrbana, ZonaSubUrbana, Tramo, Derivaciones, Permisos.
 * Cuando sTipo = "SEMBRADO" sólo se crean las 3 primeras secciones.
 */
export class CResumenMateriales {
  // ── Slots ──────────────────────────────────────────────────────────────────
  sTipo: TipoPlan = 'COMPLETO';
  bTablas_Creadas: boolean = false;

  // Secciones de tabla (equivale a los display_column / c_tabla por sección)
  tablaZonaUrbana:    TablaSeccion | null = null;
  tablaZonaSubUrbana: TablaSeccion | null = null;
  tablaTramo:         TablaSeccion | null = null;
  tablaDerivaciones:  TablaSeccion | null = null;
  tablaPermisos:      TablaSeccion | null = null;

  // ── inicializa(coord?) ─────────────────────────────────────────────────────
  // Magik: inicializa(pCoord?) → prvCreaCfgTablas() → prvLlenaCeldas()
  inicializa(tipo: TipoPlan = 'COMPLETO'): this {
    this.sTipo = tipo;
    if (!this.bTablas_Creadas) {
      this._prvCreaCfgTablas();
      this._prvLlenaCeldas();
      this.bTablas_Creadas = true;
    }
    return this;
  }

  // ── prvCreaCfgTablas() ─────────────────────────────────────────────────────
  // Magik: crea estructuras c_tabla con dimensiones para cada sección.
  private _prvCreaCfgTablas(): void {
    this.tablaZonaUrbana    = this._creaTabla('ZONA URBANA',    DESC_ZONA_URBANA.length);
    this.tablaZonaSubUrbana = this._creaTabla('ZONA SUBURBANA', DESC_ZONA_SUBURBANA.length);
    this.tablaTramo         = this._creaTabla('TRAMO',          DESC_TRAMO.length);

    if (this.sTipo !== 'SEMBRADO') {
      this.tablaDerivaciones = this._creaTabla('DERIVACIONES', DESC_DERIVACIONES.length);
      this.tablaPermisos     = this._creaTabla('PERMISOS',     DESC_PERMISOS.length);
    }
  }

  // Crea estructura de tabla con cabecera DESCRIPCION/CANTIDAD + N filas de datos
  private _creaTabla(nombre: string, numRows: number): TablaSeccion {
    // Fila 0 = cabecera (DESCRIPCION | CANTIDAD)
    const filas: CeldaTexto[][] = [];
    filas.push([
      { texto: 'DESCRIPCION', editable: false },
      { texto: 'CANTIDAD',    editable: false },
    ]);
    for (let i = 0; i < numRows; i++) {
      filas.push([
        { texto: '', editable: false }, // descripción (llena en _prvLlenaCeldas)
        { texto: '', editable: true  }, // cantidad (c_captura_texto — editable)
      ]);
    }
    return { nombre, filas, cols: 2, numRows };
  }

  // ── prvLlenaCeldas() ──────────────────────────────────────────────────────
  // Magik: llena columna de descripciones con c_texto_grafico.new_from()
  private _prvLlenaCeldas(): void {
    this._llenaColumna(this.tablaZonaUrbana!,    DESC_ZONA_URBANA);
    this._llenaColumna(this.tablaZonaSubUrbana!, DESC_ZONA_SUBURBANA);
    this._llenaColumna(this.tablaTramo!,         DESC_TRAMO);
    if (this.tablaDerivaciones) this._llenaColumna(this.tablaDerivaciones, DESC_DERIVACIONES);
    if (this.tablaPermisos)     this._llenaColumna(this.tablaPermisos,     DESC_PERMISOS);
  }

  // ── prvLlena_Columna(tabla, totRen, base, lista, col) ─────────────────────
  // Magik: itera range(1,totRen) y asigna c_texto_grafico.new_from(lista[i])
  private _llenaColumna(tabla: TablaSeccion, lista: string[]): void {
    for (let i = 0; i < lista.length; i++) {
      tabla.filas[i + 1][0].texto = lista[i]; // col 0 = descripción
    }
  }

  // ── Cantidades_ZonaUrbana(list) ───────────────────────────────────────────
  // Magik: Cantidades_ZonaUrbana(pList) — inyecta cantidades en col 1
  cantidades_ZonaUrbana(list: string[]): void {
    this._inyectaCantidades(this.tablaZonaUrbana, list);
  }

  cantidades_ZonaSubUrbana(list: string[]): void {
    this._inyectaCantidades(this.tablaZonaSubUrbana, list);
  }

  cantidades_Tramo(list: string[]): void {
    this._inyectaCantidades(this.tablaTramo, list);
  }

  cantidades_Derivaciones(list: string[]): void {
    this._inyectaCantidades(this.tablaDerivaciones, list);
  }

  cantidades_Permisos(list: string[]): void {
    this._inyectaCantidades(this.tablaPermisos, list);
  }

  private _inyectaCantidades(tabla: TablaSeccion | null, list: string[]): void {
    if (!tabla) return;
    list.forEach((val, i) => {
      if (tabla.filas[i + 1]) {
        tabla.filas[i + 1][1].texto = val;
      }
    });
  }

  // ── getSecciones() ────────────────────────────────────────────────────────
  getSecciones(): SeccionMateriales[] {
    const result: SeccionMateriales[] = [];
    if (this.tablaZonaUrbana)    result.push({ titulo: 'ZONA URBANA',    tabla: this.tablaZonaUrbana });
    if (this.tablaZonaSubUrbana) result.push({ titulo: 'ZONA SUBURBANA', tabla: this.tablaZonaSubUrbana });
    if (this.tablaTramo)         result.push({ titulo: 'TRAMO',          tabla: this.tablaTramo });
    if (this.tablaDerivaciones)  result.push({ titulo: 'DERIVACIONES',   tabla: this.tablaDerivaciones });
    if (this.tablaPermisos)      result.push({ titulo: 'PERMISOS',       tabla: this.tablaPermisos });
    return result;
  }

  // ── reset() ───────────────────────────────────────────────────────────────
  reset(): void {
    this.bTablas_Creadas = false;
    this.tablaZonaUrbana = null;
    this.tablaZonaSubUrbana = null;
    this.tablaTramo = null;
    this.tablaDerivaciones = null;
    this.tablaPermisos = null;
  }
}

// =============================================================================
// Componente React — CResumenMaterialesUI
// =============================================================================

const uiStyle: React.CSSProperties = {
  fontFamily : 'monospace',
  fontSize   : 12,
  background : '#1e1e2e',
  color      : '#cdd6f4',
  padding    : 16,
  borderRadius: 8,
  minWidth   : 700,
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  marginBottom: 16,
};

const thStyle: React.CSSProperties = {
  background: '#313244',
  border: '1px solid #45475a',
  padding: '4px 8px',
  textAlign: 'left',
  color: '#cba6f7',
  fontSize: 11,
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #45475a',
  padding: '3px 8px',
  fontSize: 11,
};

const tdEditStyle: React.CSSProperties = {
  ...tdStyle,
  background: '#181825',
};

const secTitleStyle: React.CSSProperties = {
  background: '#45475a',
  color: '#f38ba8',
  fontWeight: 'bold',
  padding: '4px 8px',
  border: '1px solid #585b70',
  textAlign: 'center',
  letterSpacing: 2,
};

// Fila de tabla con cantidades editables
function TablaSeccionView({
  seccion,
  onCantidadChange,
}: {
  seccion: SeccionMateriales;
  onCantidadChange: (secNombre: string, rowIdx: number, val: string) => void;
}) {
  const { tabla } = seccion;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={secTitleStyle}>{tabla.nombre}</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            {tabla.filas[0].map((cel, ci) => (
              <th key={ci} style={thStyle}>{cel.texto}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.filas.slice(1).map((fila, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? '#1e1e2e' : '#181825' }}>
              {fila.map((cel, ci) => (
                <td key={ci} style={cel.editable ? tdEditStyle : tdStyle}>
                  {cel.editable ? (
                    <input
                      type="text"
                      value={cel.texto}
                      onChange={e => onCantidadChange(tabla.nombre, ri, e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#a6e3a1',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        width: '100%',
                        outline: 'none',
                      }}
                      placeholder="—"
                    />
                  ) : (
                    <span style={{ color: ri % 2 === 0 ? '#cdd6f4' : '#bac2de' }}>
                      {cel.texto || <span style={{ color: '#585b70' }}>—</span>}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CResumenMaterialesUI() {
  const [tipo, setTipo]           = useState<TipoPlan>('COMPLETO');
  const [instancia]               = useState(() => new CResumenMateriales());
  const [secciones, setSecciones] = useState<SeccionMateriales[]>([]);
  const [creado, setCreado]       = useState(false);
  const [msg, setMsg]             = useState('');

  const totalCantidades = useMemo(() => {
    let total = 0;
    secciones.forEach(sec => {
      sec.tabla.filas.slice(1).forEach(fila => {
        const v = parseFloat(fila[1].texto);
        if (!isNaN(v)) total += v;
      });
    });
    return total;
  }, [secciones]);

  function handleInicializa() {
    instancia.reset();
    instancia.inicializa(tipo);
    setSecciones(instancia.getSecciones().map(sec => ({
      ...sec,
      tabla: {
        ...sec.tabla,
        filas: sec.tabla.filas.map(fila => fila.map(cel => ({ ...cel }))),
      },
    })));
    setCreado(true);
    setMsg(`Tablas creadas — tipo: ${tipo} — secciones: ${instancia.getSecciones().length}`);
  }

  function handleCantidadChange(secNombre: string, rowIdx: number, val: string) {
    setSecciones(prev =>
      prev.map(sec => {
        if (sec.tabla.nombre !== secNombre) return sec;
        const filas = sec.tabla.filas.map((f, fi) => {
          if (fi !== rowIdx + 1) return f;
          return f.map((cel, ci) => ci === 1 ? { ...cel, texto: val } : cel);
        });
        return { ...sec, tabla: { ...sec.tabla, filas } };
      })
    );
  }

  function handleCargarEjemplo() {
    if (!creado) return;
    const mock13  = DESC_ZONA_URBANA.map((_, i)    => String((i + 1) * 10));
    const mock21  = DESC_ZONA_SUBURBANA.map((_, i) => String((i + 1) * 5));
    const mock11  = DESC_TRAMO.map((_, i)          => i === 0 ? '' : String(i * 7));
    const mock8   = DESC_DERIVACIONES.map((_, i)   => String(i * 3));
    const mock15  = DESC_PERMISOS.map((_, i)       => String(i * 2));

    instancia.cantidades_ZonaUrbana(mock13);
    instancia.cantidades_ZonaSubUrbana(mock21);
    instancia.cantidades_Tramo(mock11);
    instancia.cantidades_Derivaciones(mock8);
    instancia.cantidades_Permisos(mock15);

    setSecciones(instancia.getSecciones().map(sec => ({
      ...sec,
      tabla: {
        ...sec.tabla,
        filas: sec.tabla.filas.map(fila => fila.map(cel => ({ ...cel }))),
      },
    })));
    setMsg('Cantidades de ejemplo cargadas.');
  }

  const btnBase: React.CSSProperties = {
    padding: '5px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, marginRight: 8,
  };

  return (
    <div style={uiStyle}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CResumenMateriales
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          layout_element → tabla de materiales GIS FO
        </span>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <label style={{ color: '#89dceb', fontSize: 12 }}>sTipo:</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as TipoPlan)}
          style={{ background: '#313244', color: '#cdd6f4', border: '1px solid #45475a',
                   borderRadius: 4, padding: '3px 6px', fontFamily: 'monospace', fontSize: 12 }}
        >
          <option value="COMPLETO">COMPLETO (5 secciones)</option>
          <option value="SEMBRADO">SEMBRADO (3 secciones)</option>
        </select>

        <button
          onClick={handleInicializa}
          style={{ ...btnBase, background: '#a6e3a1', color: '#1e1e2e' }}
        >
          inicializa()
        </button>

        <button
          onClick={handleCargarEjemplo}
          disabled={!creado}
          style={{ ...btnBase, background: creado ? '#89b4fa' : '#313244',
                   color: creado ? '#1e1e2e' : '#585b70' }}
        >
          Cargar cantidades ejemplo
        </button>

        {creado && (
          <span style={{ color: '#a6e3a1', fontSize: 11 }}>
            Total acumulado: <strong>{totalCantidades.toFixed(0)}</strong>
          </span>
        )}
      </div>

      {/* Mensaje de estado */}
      {msg && (
        <div style={{ background: '#313244', border: '1px solid #45475a', borderRadius: 4,
                      padding: '4px 10px', marginBottom: 10, color: '#f9e2af', fontSize: 11 }}>
          {msg}
        </div>
      )}

      {/* Tabla de estado bTablas_Creadas */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        {[
          { label: 'bTablas_Creadas', val: creado },
          { label: 'secciones',       val: creado, extra: `${secciones.length}` },
        ].map(item => (
          <div key={item.label} style={{ background: '#313244', borderRadius: 4,
                                         padding: '4px 10px', fontSize: 11 }}>
            <span style={{ color: '#585b70' }}>{item.label}: </span>
            <span style={{ color: item.val ? '#a6e3a1' : '#f38ba8' }}>
              {item.extra ?? String(item.val)}
            </span>
          </div>
        ))}
      </div>

      {/* Secciones */}
      {!creado && (
        <div style={{ color: '#585b70', fontSize: 12, textAlign: 'center', padding: 32 }}>
          Pulsa inicializa() para crear las tablas.
        </div>
      )}

      {secciones.map(sec => (
        <TablaSeccionView
          key={sec.tabla.nombre}
          seccion={sec}
          onCantidadChange={handleCantidadChange}
        />
      ))}
    </div>
  );
}
