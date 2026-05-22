import React, { useState } from 'react';

// ============================================================
// Tipos
// ============================================================

export type GeomTipo = 'point' | 'line' | 'polygon' | 'text';

export interface LegendEntry {
  /** Campo/feature-type del GIS */
  fieldName: string;
  /** Identificador del estilo (sw_gis!gis_point_style, etc.) */
  styleId: string;
  /** Nombre del símbolo (solo point styles lo tienen) */
  symbolName?: string;
  /** Tipo de geometría — determina si aplica deduplicación de punto */
  geomTipo: GeomTipo;
  /** Descripción original tal como llega del super */
  description: string;
  /** Estado de construcción embebido en la descripción: "Existente" / "Desmontaje" / "Proyectado" */
  estadoConstruccion?: string;
}

export interface ProcessedEntry extends LegendEntry {
  /** Descripción final después de parsear + añadir estado */
  descriptionFinal: string;
  /** Motivo por el que fue filtrado — undefined si se incluye */
  filtradoPor?: string;
}

// ============================================================
// Constantes de filtrado (fieldsNames Magik originales)
// ============================================================
const FIELD_CONNECTION_LOCATION = 'connection_location';
const FIELD_TIERRA               = 'tierra';
const FIELD_LEADER_AC            = 'leader_ac';
const DESC_NODO_CENTRAL          = 'Nodo/Central';
const DESC_CANALIZACION          = 'Canalización';

// ============================================================
// Clase CLegendLayoutSigc
// ============================================================

/**
 * Migración de c_legend_layout_sigc (Magik → TypeScript).
 *
 * En Magik extiende :legend_layout del framework Smallworld.
 * Aquí se representa como clase plana con la lógica de negocio pura;
 * el framework GIS se simula mediante parámetros de entrada/salida.
 *
 * Responsabilidades:
 *  1. dinamicEntries(): modifica las entradas de leyenda heredadas del super.
 *     - Parsea la descripción: toma la parte antes del primer ".".
 *     - Añade sufijo de estado de construcción (" Existente" / " Desmontaje" / " Proyectado").
 *     - Deduplica point styles con el mismo symbolName.
 *     - Filtra: Nodo/Central+connection_location, tierra, Canalización+leader_ac.
 *  2. geometrySet(): caché lazy — devuelve la lista del super y la almacena.
 *  3. inicializa(): configura la leyenda con parámetros fijos.
 */
export class CLegendLayoutSigc {
  // Slots migrados
  geometriasLeyenda: LegendEntry[] | null = null;
  entradasLeyenda:   ProcessedEntry[] | null = null;

  // Parámetros de configuración de la leyenda (fijados en inicializa)
  titulo              = '';
  viewportContentsOnly = false;
  displayFullBounds   = false;
  includeText         = false;

  // -----------------------------------------------------------
  // inicializa() — post_initialisation en Magik
  // -----------------------------------------------------------
  inicializa(): void {
    this.titulo               = 'Simbología';
    this.viewportContentsOnly = true;
    this.displayFullBounds    = false;
    this.includeText          = false;
  }

  // -----------------------------------------------------------
  // geometrySet(superGeometries) — caché lazy
  //
  // Magik:
  //   geometry_set >> _self.geometrias_leyenda _is _unset
  //     _then _self.geometrias_leyenda << super.geometry_set
  //   _endmethod
  // -----------------------------------------------------------
  geometrySet(superGeometries: LegendEntry[]): LegendEntry[] {
    if (this.geometriasLeyenda === null) {
      this.geometriasLeyenda = superGeometries;
    }
    return this.geometriasLeyenda;
  }

  // -----------------------------------------------------------
  // dynamicEntries(superEntries) — corazón del filtrado
  //
  // Magik: dynamic_entries() iterates over super.dynamic_entries(),
  // re-inits each with parsed description + appended construction state,
  // deduplicates point styles by symbolName,
  // filters specific field/description combinations.
  // -----------------------------------------------------------
  dynamicEntries(superEntries: LegendEntry[]): ProcessedEntry[] {
    // Reset caché
    this.entradasLeyenda = null;

    const result: ProcessedEntry[] = [];

    // Seguimiento de symbolNames ya vistos (solo para point styles)
    const seenSymbolNames = new Set<string>();

    for (const entry of superEntries) {
      // 1. Parsear descripción: tomar lo que está antes del primer "."
      const rawDesc   = entry.description;
      const dotIndex  = rawDesc.indexOf('.');
      const baseDesc  = dotIndex >= 0 ? rawDesc.substring(0, dotIndex) : rawDesc;

      // 2. Determinar sufijo de estado de construcción
      let sufijo = '';
      const ec = entry.estadoConstruccion;
      if (ec === 'Existente')   sufijo = ' Existente';
      else if (ec === 'Desmontaje')  sufijo = ' Desmontaje';
      else if (ec === 'Proyectado')  sufijo = ' Proyectado';

      const descFinal = baseDesc + sufijo;

      // 3. Comprobar deduplicación de point styles
      //    Solo aplica a entradas de tipo sw_gis!gis_point_style
      let filtradoPor: string | undefined;

      if (entry.geomTipo === 'point' && entry.symbolName) {
        if (seenSymbolNames.has(entry.symbolName)) {
          filtradoPor = `Duplicado point style: symbolName="${entry.symbolName}"`;
        } else {
          seenSymbolNames.add(entry.symbolName);

          // 4. Filtros especiales — se aplican dentro del bloque de point styles
          //    (igual que en el Magik original donde el if está dentro del loop
          //    de loelementos que ya tiene al menos un elemento con ese style)
          if (descFinal === DESC_NODO_CENTRAL && entry.fieldName === FIELD_CONNECTION_LOCATION) {
            filtradoPor = `description="${DESC_NODO_CENTRAL}" + fieldName="${FIELD_CONNECTION_LOCATION}"`;
          } else if (entry.fieldName === FIELD_TIERRA) {
            filtradoPor = `fieldName="${FIELD_TIERRA}"`;
          } else if (descFinal === DESC_CANALIZACION && entry.fieldName === FIELD_LEADER_AC) {
            filtradoPor = `description="${DESC_CANALIZACION}" + fieldName="${FIELD_LEADER_AC}"`;
          }
        }
      } else {
        // Para geometrías no-point, aplicar solo el filtro de tierra
        if (entry.fieldName === FIELD_TIERRA) {
          filtradoPor = `fieldName="${FIELD_TIERRA}"`;
        }
      }

      const processed: ProcessedEntry = {
        ...entry,
        descriptionFinal: descFinal,
        filtradoPor,
      };

      result.push(processed);
    }

    // Almacenar solo las incluidas en el caché de entradas
    this.entradasLeyenda = result.filter(e => !e.filtradoPor);
    return result; // devuelve TODAS (incluidas + filtradas) para poder mostrar el pipeline
  }
}

// ============================================================
// Datos mock para la UI demo
// ============================================================

const MOCK_ENTRIES: LegendEntry[] = [
  {
    fieldName: 'cable_fo',
    styleId: 'style_cable_fo_exist',
    symbolName: 'sym_cable_fo',
    geomTipo: 'line',
    description: 'Cable FO. Sección urbana',
    estadoConstruccion: 'Existente',
  },
  {
    fieldName: 'cable_fo',
    styleId: 'style_cable_fo_proy',
    symbolName: 'sym_cable_fo_proy',
    geomTipo: 'line',
    description: 'Cable FO. Sección proyectada',
    estadoConstruccion: 'Proyectado',
  },
  {
    fieldName: 'nodo',
    styleId: 'style_nodo_a',
    symbolName: 'sym_nodo',
    geomTipo: 'point',
    description: 'Nodo/Central. Tipo A',
    estadoConstruccion: 'Existente',
  },
  {
    // Este debe ser filtrado: description="Nodo/Central" + fieldName="connection_location"
    fieldName: FIELD_CONNECTION_LOCATION,
    styleId: 'style_nodo_conn',
    symbolName: 'sym_nodo_conn',
    geomTipo: 'point',
    description: 'Nodo/Central. Conexión',
    estadoConstruccion: 'Existente',
  },
  {
    // Este debe ser filtrado: fieldName="tierra"
    fieldName: FIELD_TIERRA,
    styleId: 'style_tierra',
    symbolName: 'sym_tierra',
    geomTipo: 'point',
    description: 'Tierra. Puesta a tierra',
    estadoConstruccion: 'Existente',
  },
  {
    // Duplicado — mismo symbolName que el primero de tipo point "sym_nodo"
    fieldName: 'nodo_sec',
    styleId: 'style_nodo_dup',
    symbolName: 'sym_nodo',
    geomTipo: 'point',
    description: 'Nodo Secundario. Igual símbolo',
    estadoConstruccion: 'Proyectado',
  },
  {
    // Este debe ser filtrado: description="Canalización" + fieldName="leader_ac"
    fieldName: FIELD_LEADER_AC,
    styleId: 'style_can_leader',
    symbolName: 'sym_can_leader',
    geomTipo: 'point',
    description: 'Canalización. Acometida',
    estadoConstruccion: 'Existente',
  },
  {
    fieldName: 'ducto',
    styleId: 'style_ducto',
    symbolName: 'sym_ducto',
    geomTipo: 'point',
    description: 'Ducto. Subterráneo',
    estadoConstruccion: 'Desmontaje',
  },
  {
    fieldName: 'empalme',
    styleId: 'style_empalme',
    geomTipo: 'polygon',
    description: 'Empalme. Caja de empalme',
    estadoConstruccion: 'Existente',
  },
];

// ============================================================
// Estilos UI
// ============================================================

const uiS: Record<string, React.CSSProperties> = {
  container:  { fontFamily: 'monospace', fontSize: 12, padding: 16 },
  title:      { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  subtitle:   { fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 4, color: '#555' },
  row:        { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', borderBottom: '1px solid #eee' },
  badge:      { padding: '1px 6px', borderRadius: 3, fontSize: 11, fontWeight: 600 },
  badgeGreen: { background: '#d4edda', color: '#155724' },
  badgeRed:   { background: '#f8d7da', color: '#721c24' },
  badgeBlue:  { background: '#cce5ff', color: '#004085' },
  badgeGray:  { background: '#e2e3e5', color: '#383d41' },
  col:        { flex: 1, minWidth: 0, wordBreak: 'break-word' },
  colNarrow:  { width: 80, flexShrink: 0 },
  colMed:     { width: 140, flexShrink: 0 },
  header:     { fontWeight: 700, fontSize: 11, color: '#888' },
  config:     { background: '#f8f9fa', border: '1px solid #dee2e6', padding: 8, borderRadius: 4, marginBottom: 8 },
  configRow:  { display: 'flex', gap: 16, flexWrap: 'wrap' },
  configItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  label:      { fontSize: 11, color: '#666' },
  value:      { fontSize: 12, fontWeight: 600 },
};

function GeomBadge({ tipo }: { tipo: GeomTipo }) {
  const colors: Record<GeomTipo, React.CSSProperties> = {
    point:   { background: '#fff3cd', color: '#856404' },
    line:    { background: '#cce5ff', color: '#004085' },
    polygon: { background: '#d4edda', color: '#155724' },
    text:    { background: '#e2e3e5', color: '#383d41' },
  };
  return (
    <span style={{ ...uiS.badge, ...colors[tipo] }}>{tipo}</span>
  );
}

function EstadoBadge({ ec }: { ec?: string }) {
  if (!ec) return null;
  const colors: Record<string, React.CSSProperties> = {
    Existente:  { background: '#d4edda', color: '#155724' },
    Desmontaje: { background: '#f8d7da', color: '#721c24' },
    Proyectado: { background: '#cce5ff', color: '#004085' },
  };
  return (
    <span style={{ ...uiS.badge, ...(colors[ec] ?? uiS.badgeGray) }}>{ec}</span>
  );
}

// ============================================================
// CLegendLayoutSigcUI — componente React demo
// ============================================================

export function CLegendLayoutSigcUI() {
  const [instance] = useState(() => {
    const inst = new CLegendLayoutSigc();
    inst.inicializa();
    return inst;
  });

  const allProcessed = instance.dynamicEntries(MOCK_ENTRIES);
  const included     = allProcessed.filter(e => !e.filtradoPor);
  const excluded     = allProcessed.filter(e => !!e.filtradoPor);

  return (
    <div style={uiS.container}>
      <div style={uiS.title}>c_legend_layout_sigc — Pipeline de entradas de leyenda</div>

      {/* Configuración de la instancia */}
      <div style={uiS.config}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>inicializa() → configuración de la leyenda</div>
        <div style={uiS.configRow}>
          <div style={uiS.configItem}>
            <span style={uiS.label}>título</span>
            <span style={uiS.value}>"{instance.titulo}"</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>viewportContentsOnly</span>
            <span style={uiS.value}>{String(instance.viewportContentsOnly)}</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>displayFullBounds</span>
            <span style={uiS.value}>{String(instance.displayFullBounds)}</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>includeText</span>
            <span style={uiS.value}>{String(instance.includeText)}</span>
          </div>
        </div>
      </div>

      {/* Entradas originales (super) */}
      <div style={uiS.subtitle}>Entradas del super ({MOCK_ENTRIES.length})</div>
      <div>
        <div style={{ ...uiS.row, borderBottom: '2px solid #ccc' }}>
          <div style={{ ...uiS.colNarrow, ...uiS.header }}>geomTipo</div>
          <div style={{ ...uiS.colMed,    ...uiS.header }}>fieldName</div>
          <div style={{ ...uiS.colMed,    ...uiS.header }}>estado</div>
          <div style={{ ...uiS.col,       ...uiS.header }}>description</div>
        </div>
        {MOCK_ENTRIES.map((e, i) => (
          <div key={i} style={uiS.row}>
            <div style={uiS.colNarrow}><GeomBadge tipo={e.geomTipo} /></div>
            <div style={uiS.colMed}>{e.fieldName}</div>
            <div style={uiS.colMed}><EstadoBadge ec={e.estadoConstruccion} /></div>
            <div style={uiS.col}>{e.description}</div>
          </div>
        ))}
      </div>

      {/* Entradas incluidas */}
      <div style={uiS.subtitle}>
        Entradas incluidas en la leyenda ({included.length})
        <span style={{ ...uiS.badge, ...uiS.badgeGreen, marginLeft: 8 }}>INCLUIDAS</span>
      </div>
      <div>
        <div style={{ ...uiS.row, borderBottom: '2px solid #ccc' }}>
          <div style={{ ...uiS.colNarrow, ...uiS.header }}>geomTipo</div>
          <div style={{ ...uiS.colMed,    ...uiS.header }}>fieldName</div>
          <div style={{ ...uiS.col,       ...uiS.header }}>descriptionFinal</div>
        </div>
        {included.map((e, i) => (
          <div key={i} style={uiS.row}>
            <div style={uiS.colNarrow}><GeomBadge tipo={e.geomTipo} /></div>
            <div style={uiS.colMed}>{e.fieldName}</div>
            <div style={uiS.col}>{e.descriptionFinal}</div>
          </div>
        ))}
      </div>

      {/* Entradas filtradas */}
      <div style={uiS.subtitle}>
        Entradas filtradas ({excluded.length})
        <span style={{ ...uiS.badge, ...uiS.badgeRed, marginLeft: 8 }}>EXCLUIDAS</span>
      </div>
      <div>
        <div style={{ ...uiS.row, borderBottom: '2px solid #ccc' }}>
          <div style={{ ...uiS.colNarrow, ...uiS.header }}>geomTipo</div>
          <div style={{ ...uiS.colMed,    ...uiS.header }}>fieldName</div>
          <div style={{ ...uiS.col,       ...uiS.header }}>descriptionFinal</div>
          <div style={{ ...uiS.col,       ...uiS.header }}>filtradoPor</div>
        </div>
        {excluded.map((e, i) => (
          <div key={i} style={{ ...uiS.row, background: '#fff5f5' }}>
            <div style={uiS.colNarrow}><GeomBadge tipo={e.geomTipo} /></div>
            <div style={uiS.colMed}>{e.fieldName}</div>
            <div style={uiS.col}>{e.descriptionFinal}</div>
            <div style={{ ...uiS.col, color: '#721c24' }}>{e.filtradoPor}</div>
          </div>
        ))}
      </div>

      {/* Tabla de resumen */}
      <div style={uiS.subtitle}>Resumen del pipeline</div>
      <div style={uiS.config}>
        <div style={uiS.configRow}>
          <div style={uiS.configItem}>
            <span style={uiS.label}>Total super</span>
            <span style={uiS.value}>{MOCK_ENTRIES.length}</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>Incluidas</span>
            <span style={{ ...uiS.value, color: '#155724' }}>{included.length}</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>Filtradas</span>
            <span style={{ ...uiS.value, color: '#721c24' }}>{excluded.length}</span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>Duplicados point style</span>
            <span style={{ ...uiS.value, color: '#856404' }}>
              {excluded.filter(e => e.filtradoPor?.startsWith('Duplicado')).length}
            </span>
          </div>
          <div style={uiS.configItem}>
            <span style={uiS.label}>Filtros negocio</span>
            <span style={{ ...uiS.value, color: '#721c24' }}>
              {excluded.filter(e => !e.filtradoPor?.startsWith('Duplicado')).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CLegendLayoutSigcUI;
