/**
 * CResumenOptico.tsx
 * Migración de c_resumen_optico.magik  (red de fibra óptica)
 *
 * Jerarquía Magik: c_resumen_optico extends :c_base_sello_fibra
 * Propósito: sello "RESUMEN ÓPTICO" para planos de CEDO.
 * Cuatro sub-tablas apiladas verticalmente:
 *   tbl_titulo_nco  — NCO + Distrito
 *   tbl_titulo      — "RESUMEN OPTICO"
 *   tbl_contenido   — cabeceras + N filas de datos (1 por divisor)
 *   tbl_total       — total de servicios ópticos
 *
 * calcula_datos_celdas() recorre la red:
 *   CEDO → divisores → puerto entrada → fibras → pines → terminales
 *   Para cada terminal calcula carga por puerto (1-8) y acumula servicios.
 */

import React, { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Constante compartida — divisor_equivalencia
// Magik: define_shared_constant(:divisor_equivalencia, property_list.new_with(:|A|,1,...))
// Mapea letras de divisor A-S (sin I, N, Q) a índices 1-16
// ---------------------------------------------------------------------------
export const DIVISOR_EQUIVALENCIA: Record<string, number> = {
  A:1, B:2, C:3, D:4, E:5, F:6, G:7, H:8,
  J:9, K:10, L:11, M:12, O:13, P:14, R:15, S:16,
};

// ---------------------------------------------------------------------------
// Tipos — equivalentes a las estructuras GIS del original
// ---------------------------------------------------------------------------

type EstadoConstruccion = 'EXISTENTE' | 'PROYECTO';
type TipoConexion       = 'SENCILLA' | 'DOBLE';

/** Terminal óptica — itert en el loop de calcula_datos_celdas */
interface Terminal {
  nombre              : string;           // e.g. "FOA3"
  conexion            : TipoConexion;
  construction_status : EstadoConstruccion;
  limite_fo?: {
    carga_corto_pla_cal      : number;
    terminal_distribucions   : { id: number }[]; // tamaño para dividir carga
  };
}

/** Divisor óptico — iterDivisor en el loop de calcula_datos_celdas */
interface Divisor {
  name           : string;      // letra, e.g. "A"
  output_ports   : { id: number }[]; // tamaño = num. puertos → tot = size * 8
  terminales     : Terminal[];  // terminales conectadas downstream
  cuenta_principal: string;     // cuenta del cable principal (LoAtrPrin.user!_cuenta)
}

/** CEDO — equivale a .oCedo */
interface Cedo {
  id    : string;
  nombre: string;
  divisores: Divisor[];
}

/** Fila de datos — property_list con claves :terminal, :|1|..|8|, :|N_edo_constr|, :serv, :fib, :tot */
interface FilaDatos {
  terminal : string;
  cols     : Record<number, string>;        // 1-8 → valor de carga o "R"
  edos     : Record<number, 'E' | 'P'>;     // 1-8 → estado construcción
  serv     : number;
  fib      : string;
  tot      : number;
}

// ---------------------------------------------------------------------------
// Mock GIS — simula CEDO con divisores y terminales
// ---------------------------------------------------------------------------
const MOCK_CEDO: Cedo = {
  id: 'CEDO-001', nombre: 'CEDO NORTE',
  divisores: [
    {
      name: 'A', output_ports: [{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8}],
      cuenta_principal: 'FO-100',
      terminales: [
        { nombre:'FOA1', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:8,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA2', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:6,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA3', conexion:'SENCILLA', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:4,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA4', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:8,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA5', conexion:'SENCILLA', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:3,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA6', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:5,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA7', conexion:'PROYECTO', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:2,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOA8', construccion_status:'EXISTENTE' as EstadoConstruccion, conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:7,  terminal_distribucions:[{id:1}] } },
      ],
    },
    {
      name: 'B', output_ports: [{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8}],
      cuenta_principal: 'FO-101',
      terminales: [
        { nombre:'FOB1', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:8,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOB2', conexion:'DOBLE',    construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:16, terminal_distribucions:[{id:1}] } },
        { nombre:'FOB3', conexion:'SENCILLA', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:4,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOB4', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:6,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOB5', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:8,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOB6', conexion:'SENCILLA', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:2,  terminal_distribucions:[{id:1}] } },
      ],
    },
    {
      name: 'C', output_ports: [{id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8}],
      cuenta_principal: 'FO-102',
      terminales: [
        { nombre:'FOC1', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:8,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOC2', conexion:'SENCILLA', construction_status:'PROYECTO',  limite_fo:{ carga_corto_pla_cal:5,  terminal_distribucions:[{id:1}] } },
        { nombre:'FOC3', conexion:'SENCILLA', construction_status:'EXISTENTE', limite_fo:{ carga_corto_pla_cal:7,  terminal_distribucions:[{id:1}] } },
      ],
    },
  ],
};

const MOCK_NCO   = { siglas: 'NCO-01', nombre: 'NODO CENTRAL OPTICO NORTE' };
const MOCK_DIST  = 'DISTRITO NORTE';

// ---------------------------------------------------------------------------
// calcula_datos_celdas — lógica principal de conectividad
// Magik: recorre divisores → pines → terminales → acumula carga por puerto
// ---------------------------------------------------------------------------
async function calculaDatosCeldas(cedo: Cedo): Promise<FilaDatos[]> {
  await new Promise(r => setTimeout(r, 150)); // simula latencia GIS

  // Magik: .ocedo.obtener_divisores().as_sorted_collection(criterio).elements()
  const divisoresOrdenados = [...cedo.divisores].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return divisoresOrdenados.map(div => {
    // Fila inicial — Magik: LoRenglon = property_list.new_with(:terminal,"FO"+name, :|1|,"R",...)
    const fila: FilaDatos = {
      terminal: `FO${div.name}`,
      cols    : { 1:'R',2:'R',3:'R',4:'R',5:'R',6:'R',7:'R',8:'R' },
      edos    : { 1:'P',2:'P',3:'P',4:'P',5:'P',6:'P',7:'P',8:'P' },
      serv    : 0,
      fib     : div.cuenta_principal,
      tot     : div.output_ports.length * 8,  // Magik: output_ports().size * 8
    };

    for (const ter of div.terminales) {
      // Magik: identifica_ter = itert.user!_nombre.substitute_string("FO","")
      const identifica = ter.nombre.replace('FO', '');
      if (!identifica) continue;

      // Magik: split_by(".").an_element() para DOBLE
      const clave = ter.conexion === 'DOBLE'
        ? identifica.split('.')[0]
        : identifica;

      // Magik: clave.numbers_and_strings[1]=letra, [2]=numero
      const matchLetra  = clave.match(/^([A-Z]+)/);
      const matchNumero = clave.match(/(\d+)$/);
      if (!matchLetra || !matchNumero) continue;

      const letraEnClave  = matchLetra[1];
      const numeroEnClave = parseInt(matchNumero[1], 10);
      if (numeroEnClave < 1 || numeroEnClave > 8) continue;

      // Magik: _if itert.construction_status = "EXISTENTE" → LoRenglon[N_edo_constr] = "E"
      if (ter.construction_status === 'EXISTENTE') {
        fila.edos[numeroEnClave] = 'E';
      }

      const limFo = ter.limite_fo;
      if (
        limFo &&
        limFo.carga_corto_pla_cal > 0 &&
        div.name === letraEnClave          // Magik: iterdivisor.name = letra_en_clave
      ) {
        // Magik: LoCarga = limTer.carga / limTer.terminal_distribucions.size
        const carga = Math.floor(
          limFo.carga_corto_pla_cal / limFo.terminal_distribucions.length,
        );

        let cargaReal = 0;

        if (ter.conexion === 'DOBLE') {
          // Magik: primera terminal → "8", segunda → (carga - 8)
          const esPrimera = ter.nombre.slice(3, 4) === String(numeroEnClave);
          if (esPrimera) {
            fila.cols[numeroEnClave] = '8';
            cargaReal = 8;
          } else {
            fila.cols[numeroEnClave] = String(carga - 8);
            cargaReal = carga - 8;
          }
        } else {
          // SENCILLA
          cargaReal += carga;
          fila.cols[numeroEnClave] = String(cargaReal);
        }

        fila.serv += cargaReal;
      }
    }

    return fila;
  });
}

// ---------------------------------------------------------------------------
// dimensiona_tabla — Magik: [6] + [4] × oRenglones
// En TypeScript: simplemente devuelve el número de filas de datos
// ---------------------------------------------------------------------------
function dimensionaTabla(numDivisores: number): number {
  return numDivisores; // 1 fila cabecera + numDivisores filas datos
}

// ---------------------------------------------------------------------------
// Subcomponente — celda de dato (verde si EXISTENTE, rojo si PROYECTO)
// Magik: llena_datos_celdas → asigna_texto_celda con LoColorVerde/LoColorRojo
// ---------------------------------------------------------------------------
function CeldaDato({ valor, estado }: { valor: string; estado: 'E' | 'P' }) {
  const esExistente = estado === 'E' || valor === 'R';
  return (
    <td style={{
      padding      : '1px 3px',
      textAlign    : 'center',
      fontSize     : 10,
      color        : valor === 'R'
        ? '#666'
        : esExistente ? '#1a8c1a' : '#cc0000',
      fontWeight   : valor !== 'R' && !esExistente ? 'bold' : 'normal',
      border       : '1px solid #2a7a2a',
      whiteSpace   : 'nowrap',
    }}>
      {valor}
    </td>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — CResumenOptico
// ---------------------------------------------------------------------------
export function CResumenOpticoUI() {
  const [datos,   setDatos]   = useState<FilaDatos[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [tTotal,  setTTotal]  = useState(0);
  const [tServ,   setTServ]   = useState(0);

  async function cargar() {
    setLoading(true);
    // Magik: calcula_datos_celdas() → .oDatos
    const filas = await calculaDatosCeldas(MOCK_CEDO);
    setDatos(filas);
    setTServ(filas.reduce((s, f) => s + f.serv, 0));
    setTTotal(filas.reduce((s, f) => s + f.tot, 0));
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []); // eslint-disable-line

  // Colores de las cabeceras — Magik: LoColorVerde/LoColorOro/LoColorNco
  const cs: Record<string, React.CSSProperties> = {
    cellVerde : { color: '#1a8c1a', fontWeight: 'bold', textAlign: 'center', fontSize: 10, border: '1px solid #2a7a2a', padding: '2px 4px' },
    cellOro   : { color: '#b8a200', fontWeight: 'bold', textAlign: 'center', fontSize: 10, border: '1px solid #2a7a2a', padding: '2px 4px' },
    cellNco   : { color: '#cc44aa', fontWeight: 'bold', textAlign: 'center', fontSize: 10, border: '1px solid #2a7a2a', padding: '2px 4px' },
    cellRojo  : { color: '#cc0000', fontWeight: 'bold', textAlign: 'left',   fontSize: 10, border: '1px solid #2a7a2a', padding: '2px 8px' },
    cellSmall : { color: '#1a8c1a', fontWeight: 'bold', textAlign: 'center', fontSize: 8,  border: '1px solid #2a7a2a', padding: '2px 2px', whiteSpace: 'pre-line' as const },
    th        : { background: '#e8f5e9', border: '1px solid #2a7a2a', padding: '2px 3px', textAlign: 'center' as const, fontSize: 9 },
  };

  const NUM_ROWS = dimensionaTabla(MOCK_CEDO.divisores.length);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12, padding: 12 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 10, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
        <span style={{ fontWeight: 'bold', fontSize: 13 }}>CResumenOptico</span>
        <span style={{ color: '#777', marginLeft: 8, fontSize: 11 }}>
          :c_base_sello_fibra → sello RESUMEN ÓPTICO · {NUM_ROWS} divisores · CEDO: {MOCK_CEDO.nombre}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
        <button onClick={cargar} disabled={loading}
          style={{ padding: '4px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
                   background: loading ? '#ccc' : '#1a8c1a', color: '#fff', fontSize: 11 }}>
          {loading ? 'calculando…' : 'calcula_datos_celdas()'}
        </button>
        <span style={{ fontSize: 11, color: '#555' }}>
          oRenglones: {MOCK_CEDO.divisores.length} · dimensiona_tabla: [6, {Array(MOCK_CEDO.divisores.length).fill(4).join(', ')}]
        </span>
      </div>

      {datos && (
        <div style={{ overflowX: 'auto' }}>
          {/* tbl_titulo_nco — 1×2: NCO | Distrito */}
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                {/* Magik: asigna_texto_celda(:tbl_titulo_nco,1,1, nco_titulo, 20, :centre_centre, LoColorNco) */}
                <td style={{ ...cs.cellNco, width: '65%', height: 18 }}>
                  NCO {MOCK_NCO.siglas} ({MOCK_NCO.nombre})
                </td>
                {/* Magik: asigna_texto_celda(:tbl_titulo_nco,1,2, dto_titulo, 20, :centre_centre, LoColorOro) */}
                <td style={{ ...cs.cellOro, width: '35%', height: 18 }}>
                  DTO: {MOCK_DIST}
                </td>
              </tr>
            </tbody>
          </table>

          {/* tbl_titulo — 1×1: "RESUMEN OPTICO" */}
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 0 }}>
            <tbody>
              <tr>
                {/* Magik: asigna_texto_celda(:tbl_titulo,1,1,"RESUMEN OPTICO",40,:centre_centre,LoColorVerde) */}
                <td style={{ ...cs.cellVerde, height: 20, fontSize: 14, letterSpacing: 2 }}>
                  RESUMEN OPTICO
                </td>
              </tr>
            </tbody>
          </table>

          {/* tbl_contenido — cabecera + N filas de datos */}
          <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 0 }}>
            <thead>
              {/* Magik: etiqueta_celdas → tbl_contenido fila 1 */}
              <tr>
                <th style={{ ...cs.th, width: '8%'  }}>TER</th>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <th key={n} style={{ ...cs.th, width: '4%', color: '#1a8c1a' }}>{n}</th>
                ))}
                <th style={{ ...cs.cellSmall, width: '13%', background: '#e8f5e9' }}>{'Total de Clientes\na Atender'}</th>
                <th style={{ ...cs.cellSmall, width: '8%',  background: '#e8f5e9' }}>{'No.Fibra\nPrincipal'}</th>
                <th style={{ ...cs.cellSmall, width: '15%', background: '#e8f5e9' }}>{'Capacidad de\nServicios en divisor'}</th>
              </tr>
            </thead>
            <tbody>
              {!datos && (
                <tr><td colSpan={12} style={{ textAlign: 'center', color: '#888', padding: 8 }}>
                  Pulsa calcula_datos_celdas()
                </td></tr>
              )}
              {datos.map((fila, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f9fff9' : '#fff' }}>
                  {/* terminal — Magik: iterRenglones[:terminal].write_string, LoColorVerde */}
                  <td style={{ ...cs.cellVerde, fontWeight: 'bold' }}>{fila.terminal}</td>
                  {/* cols 1-8 — verde si estado E, rojo si P */}
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <CeldaDato key={n} valor={fila.cols[n]} estado={fila.edos[n]} />
                  ))}
                  {/* :serv — total clientes */}
                  <td style={{ ...cs.cellRojo, textAlign: 'center' }}>{fila.serv}</td>
                  {/* :fib — No.Fibra Principal / cuenta cable principal */}
                  <td style={{ ...cs.cellRojo, textAlign: 'center' }}>{fila.fib}</td>
                  {/* :tot — capacidad divisor = output_ports.size × 8 */}
                  <td style={{ ...cs.cellRojo, textAlign: 'center' }}>{fila.tot}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* tbl_total — "Total de servicios Opticos a atender N" */}
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                {/* Magik: texto = "Total de servicios Opticos a atender " + t_serv.write_string */}
                <td style={{ ...cs.cellRojo, height: 16 }}>
                  Total de servicios Ópticos a atender &nbsp;
                  <strong>{tServ}</strong>
                  <span style={{ color: '#888', marginLeft: 16, fontSize: 10 }}>
                    (capacidad total: {tTotal})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tabla diagnóstico divisor_equivalencia */}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
          divisor_equivalencia (shared_constant)
        </summary>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {Object.entries(DIVISOR_EQUIVALENCIA).map(([k, v]) => (
            <span key={k} style={{ background: '#e8f5e9', border: '1px solid #2a7a2a',
                                   borderRadius: 3, padding: '1px 6px', fontSize: 10 }}>
              {k}→{v}
            </span>
          ))}
        </div>
      </details>

      {/* Tabla diagnóstico .oDatos */}
      {datos && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: '#666' }}>
            .oDatos — property_list por divisor
          </summary>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 4, overflow: 'auto' }}>
            {JSON.stringify(datos.map(f => ({
              terminal: f.terminal, cols: f.cols, edos: f.edos, serv: f.serv, fib: f.fib, tot: f.tot,
            })), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default CResumenOpticoUI;
