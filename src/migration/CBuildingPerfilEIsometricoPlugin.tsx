// =============================================================================
// MIGRACIÓN: c_building_perfil_e_isometrico_plugin  →  CBuildingPerfilEIsometricoPlugin.tsx
// Jerarquía Magik: c_building_perfil_e_isometrico_plugin (:pni_editor_plugin)
// Fuente: planos_fo/source/detalles_construccion/gui/c_building_perfil_e_isometrico_plugin.magik
// =============================================================================
//
// Plugin GIS que genera perfil vertical (floor_vertical) e isométrico (user!_area_3d)
// de un edificio seleccionado en el mapa. Consume databus :map_selection.
// Genera geometrías 3D: pseudo_chain con sectores de cubo por piso.
// =============================================================================

import React, { useCallback, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// Tipos (D4/D5)
// ---------------------------------------------------------------------------

export interface LengthValue {
  value: number;
  valueIn(units: string): number;
}

function makeLengthValue(v: number): LengthValue {
  return { value: v, valueIn: (_units: string) => v };
}

export interface FloorRecord {
  id: string;
  floorVertical: [number, number, number, number] | undefined; // Extent (xmin,ymin,xmax,ymax)
}

export interface MitBuildingStructure {
  floors: FloorRecord[];
  floorWidth: LengthValue;
  floorLength: LengthValue;
  riserLength: LengthValue;
  area3d: unknown | undefined; // user!_area_3d
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
  worldUnits: string;
}

export interface BuildingRecord {
  id: string;
  name: string;
  mitBuildingStructure: MitBuildingStructure | undefined;
  sourceCollectionName: string;
}

export interface IsometricoGeom {
  line5: Array<Array<[number, number]>>; // pseudo_chain → sectors
}

// ---------------------------------------------------------------------------
// Interfaces de la clase migrada
// ---------------------------------------------------------------------------

export interface ICBuildingPerfilEIsometricoPlugin {
  edificio: BuildingRecord | undefined;
  creaPerfil(bs: MitBuildingStructure): void;
  creaIsometricoEdificio(xIni: number, yIni: number): IsometricoGeom;
  swDatabusDataAvailable(dataTypeName: string, data: unknown): boolean;
  intPerfilEIsometrico(): void;
}

// ---------------------------------------------------------------------------
// Helpers geométricos (equivalencias Magik → TS)
// ---------------------------------------------------------------------------

type Coordinate = [number, number];

// Equivalente a mbs.crea_sector_cubo(origin, fre, fon, alt)
// Devuelve los 3 planos visibles del cubo isométrico simplificado
function creaSectorCubo(
  origin: Coordinate,
  fre: number,
  fon: number,
  alt: number,
): Array<Coordinate[]> {
  const [x0, y0] = origin;
  // cara frontal (perfil)
  const front: Coordinate[] = [
    [x0, y0], [x0 + fon, y0], [x0 + fon, y0 + alt], [x0, y0 + alt], [x0, y0],
  ];
  // cara superior
  const top: Coordinate[] = [
    [x0, y0 + alt], [x0 + fon, y0 + alt],
    [x0 + fon + fre * 0.5, y0 + alt + fre * 0.3],
    [x0 + fre * 0.5, y0 + alt + fre * 0.3], [x0, y0 + alt],
  ];
  // cara lateral derecha
  const side: Coordinate[] = [
    [x0 + fon, y0], [x0 + fon + fre * 0.5, y0 + fre * 0.3],
    [x0 + fon + fre * 0.5, y0 + alt + fre * 0.3],
    [x0 + fon, y0 + alt], [x0 + fon, y0],
  ];
  return [front, top, side];
}

// ---------------------------------------------------------------------------
// Clase principal
// ---------------------------------------------------------------------------

export class CBuildingPerfilEIsometricoPlugin implements ICBuildingPerfilEIsometricoPlugin {
  // D1: prefijo _, D3: no readonly (tiene setter en Magik :writable)
  private _edificio: BuildingRecord | undefined;

  // Equivalente a databus_consumer_data_types shared constant
  static readonly DATABUS_CONSUMER_DATA_TYPES: string[] = ['map_selection'];

  get edificio(): BuildingRecord | undefined { return this._edificio; }
  set edificio(v: BuildingRecord | undefined) { this._edificio = v; }

  // ── sw_databus_data_available(data_type_name, data) ─────────────────────
  // Magik: reacciona a :map_selection; habilita acción si edificio válido
  // Retorna true si la acción debe habilitarse
  swDatabusDataAvailable(dataTypeName: string, selection: BuildingRecord[]): boolean {
    if (dataTypeName !== 'map_selection') return false;
    if (selection.length !== 1) return false;
    const building = selection[0];
    if (building.sourceCollectionName !== 'building') return false;

    this._edificio = building;
    const mbs = building.mitBuildingStructure;
    if (mbs === undefined) return false;
    if (mbs.floors.length < 1) return false;

    // Habilita si faltan geometrías (floor_vertical o user!_area_3d sin generar)
    const faltaFloorVertical = mbs.floors.some(f => f.floorVertical === undefined);
    const faltaArea3d = mbs.area3d === undefined;
    return faltaFloorVertical || faltaArea3d;
  }

  // ── crea_perfil(bs) ──────────────────────────────────────────────────────
  // Magik: itera all_floors_iter(), asigna bounding_box como floor_vertical
  creaPerfil(bs: MitBuildingStructure): void {
    const w = bs.floorWidth.valueIn(bs.worldUnits);
    const h = bs.floorLength.valueIn(bs.worldUnits);
    const altura = bs.riserLength.valueIn(bs.worldUnits);

    const x0 = bs.box.xmin - 6 * h;
    let y0 = bs.box.ymin;

    bs.floors.forEach((flo, i) => {
      const xmin = x0;
      const xmax = x0 + h;
      const ymin = y0 + i * altura;
      const ymax = ymin + altura;
      // bounding_box.new(xmin, ymin, xmax, ymax) → Extent
      flo.floorVertical = [xmin, ymin, xmax, ymax];
      y0 = ymin + altura;
    });

    // void — no readonly solo lectura detectada en fuente
    void w;
  }

  // ── crea_isometrico_edificio(xIni, yIni) ────────────────────────────────
  // Magik: genera pseudo_chain con sector_rope por piso → record_transaction insert
  creaIsometricoEdificio(xIni: number, yIni: number): IsometricoGeom {
    const mbs = this._edificio?.mitBuildingStructure;
    if (mbs === undefined) throw new Error('edificio sin mit_building_structure');

    const sectors: Array<Coordinate[]> = [];
    let y = yIni;

    for (let npiso = 1; npiso <= mbs.floors.length; npiso++) {
      const fre = mbs.floorLength.value;
      const fon = mbs.floorWidth.value;
      const alt = mbs.riserLength.value;
      const cubo = creaSectorCubo([xIni, y], fre, fon, alt);
      sectors.push(...cubo);
      y += alt;
    }

    return { line5: sectors };
  }

  // ── int!perfil_e_isometrico() ────────────────────────────────────────────
  // Magik: crea perfil (floor_vertical) + isométrico (user!_area_3d) en transacción
  intPerfilEIsometrico(): { perfilCreado: boolean; isometricoCreado: boolean } {
    if (this._edificio === undefined) throw new Error('edificio no disponible');

    const bs = this._edificio.mitBuildingStructure;
    if (bs === undefined) throw new Error('edificio sin mit_building_structure');

    let perfilCreado = false;
    let isometricoCreado = false;

    // Genera floor_vertical si falta en algún piso
    if (bs.floors.some(f => f.floorVertical === undefined)) {
      this.creaPerfil(bs);
      perfilCreado = true;
    }

    // Genera user!_area_3d si falta
    if (bs.area3d === undefined) {
      const w = bs.floorWidth.valueIn(bs.worldUnits);
      const h = bs.floorLength.valueIn(bs.worldUnits);
      const x = (bs.box.xmin - 6 * h) / 2;
      const geom = this.creaIsometricoEdificio(x, 0);
      // record_transaction.new_insert() → stub: asigna directamente
      bs.area3d = geom;
      isometricoCreado = true;
      void w;
    }

    return { perfilCreado, isometricoCreado };
  }
}

// =============================================================================
// Mock data
// =============================================================================

function makeMockBuilding(id: string, hasFloorVertical = false, hasArea3d = false): BuildingRecord {
  const floors: FloorRecord[] = Array.from({ length: 3 }, (_, i) => ({
    id: `PISO-${i + 1}`,
    floorVertical: hasFloorVertical ? ([0, i * 5, 10, (i + 1) * 5] as [number, number, number, number]) : undefined,
  }));
  return {
    id,
    name: `Edificio ${id}`,
    sourceCollectionName: 'building',
    mitBuildingStructure: {
      floors,
      floorWidth: makeLengthValue(8),
      floorLength: makeLengthValue(10),
      riserLength: makeLengthValue(5),
      area3d: hasArea3d ? { line5: [] } : undefined,
      box: { xmin: 100, ymin: 200, xmax: 110, ymax: 210 },
      worldUnits: 'm',
    },
  };
}

const MOCK_BUILDINGS: BuildingRecord[] = [
  makeMockBuilding('ED-001', false, false),    // sin perfil ni isométrico → acción habilitada
  makeMockBuilding('ED-002', true, false),     // sin isométrico → habilitada
  makeMockBuilding('ED-003', true, true),      // todo generado → deshabilitada
];

// =============================================================================
// Componente React — CBuildingPerfilEIsometricoPluginUI
// =============================================================================

const SX = {
  wrap: {
    fontFamily: 'monospace', fontSize: 12, background: '#1e1e2e',
    color: '#cdd6f4', padding: 16, borderRadius: 8, minWidth: 700,
  } as React.CSSProperties,
  card: {
    background: '#181825', border: '1px solid #45475a', borderRadius: 6,
    padding: 10, marginBottom: 12,
  } as React.CSSProperties,
  title: {
    color: '#f9e2af', fontSize: 11, marginBottom: 8, letterSpacing: 1,
  } as React.CSSProperties,
  row: {
    display: 'grid', gridTemplateColumns: '220px 1fr', gap: 4,
    fontSize: 11, padding: '2px 0',
  } as React.CSSProperties,
  k: { color: '#89dceb' } as React.CSSProperties,
  v: { color: '#a6e3a1' } as React.CSSProperties,
  vMuted: { color: '#fab387' } as React.CSSProperties,
  empty: { color: '#585b70', fontStyle: 'italic' } as React.CSSProperties,
  badge: (enabled: boolean) => ({
    padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 'bold',
    background: enabled ? '#1e3a2e' : '#3a2e1e',
    color: enabled ? '#a6e3a1' : '#f38ba8',
  }) as React.CSSProperties,
  btn: {
    padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
  } as React.CSSProperties,
  btnDisabled: {
    padding: '6px 14px', borderRadius: 4, border: 'none',
    fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
    cursor: 'not-allowed', opacity: 0.4,
  } as React.CSSProperties,
  table: { fontSize: 10, width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
  th: { padding: '2px 6px', color: '#585b70', textAlign: 'left' } as React.CSSProperties,
  td: { padding: '2px 6px' } as React.CSSProperties,
};

function FloorRow({ floor }: { floor: FloorRecord }) {
  return (
    <div style={{ ...SX.row, padding: '3px 0', borderBottom: '1px solid #313244' }}>
      <span style={SX.k}>{floor.id}</span>
      <span style={floor.floorVertical ? SX.v : SX.empty}>
        {floor.floorVertical
          ? `[${floor.floorVertical.map(n => n.toFixed(1)).join(', ')}]`
          : '— _unset (floor_vertical)'}
      </span>
    </div>
  );
}

export function CBuildingPerfilEIsometricoPluginUI() {
  const [buildings, setBuildings] = useState<BuildingRecord[]>(() =>
    MOCK_BUILDINGS.map(b => ({
      ...b,
      mitBuildingStructure: b.mitBuildingStructure
        ? {
            ...b.mitBuildingStructure,
            floors: b.mitBuildingStructure.floors.map(f => ({ ...f })),
          }
        : undefined,
    }))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionEnabled, setActionEnabled] = useState(false);
  const [log, setLog] = useState<Array<{ ok: boolean; msg: string }>>([]);

  const plugin = useMemo(() => new CBuildingPerfilEIsometricoPlugin(), []);

  const addLog = useCallback((ok: boolean, msg: string) => {
    setLog(prev => [{ ok, msg }, ...prev].slice(0, 8));
  }, []);

  const handleSelectBuilding = useCallback((building: BuildingRecord) => {
    setSelectedId(building.id);
    const enabled = plugin.swDatabusDataAvailable('map_selection', [building]);
    setActionEnabled(enabled);
    addLog(true, `sw_databus_data_available(:map_selection) → acción ${enabled ? 'HABILITADA' : 'deshabilitada'} para ${building.name}`);
  }, [plugin, addLog]);

  const handleCreaPerfilIsometrico = useCallback(() => {
    try {
      const result = plugin.intPerfilEIsometrico();
      // Refrescar estado del building seleccionado
      setBuildings(prev => prev.map(b =>
        b.id === selectedId ? { ...b, mitBuildingStructure: b.mitBuildingStructure ? { ...b.mitBuildingStructure } : undefined } : b
      ));
      setActionEnabled(false);
      const msgs: string[] = [];
      if (result.perfilCreado) msgs.push('floor_vertical generado en cada piso');
      if (result.isometricoCreado) msgs.push('user!_area_3d (pseudo_chain) generado');
      addLog(true, `✓ int!perfil_e_isometrico() → ${msgs.join(' | ')}`);
    } catch (e) {
      addLog(false, `✗ ${(e as Error).message}`);
    }
  }, [plugin, selectedId, addLog]);

  const handleReset = useCallback(() => {
    const fresh = MOCK_BUILDINGS.map(b => ({
      ...b,
      mitBuildingStructure: b.mitBuildingStructure
        ? {
            ...b.mitBuildingStructure,
            floors: b.mitBuildingStructure.floors.map(f => ({ ...f })),
            area3d: b.mitBuildingStructure.area3d,
          }
        : undefined,
    }));
    setBuildings(fresh);
    setSelectedId(null);
    setActionEnabled(false);
    plugin.edificio = undefined;
    addLog(true, '↻ estado reiniciado — mock buildings restaurados');
  }, [plugin, addLog]);

  const selectedBuilding = buildings.find(b => b.id === selectedId);

  return (
    <div style={SX.wrap}>
      {/* Cabecera */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #45475a', paddingBottom: 8 }}>
        <span style={{ color: '#cba6f7', fontWeight: 'bold', fontSize: 13 }}>
          CBuildingPerfilEIsometricoPlugin
        </span>
        <span style={{ color: '#585b70', marginLeft: 8, fontSize: 11 }}>
          plugin GIS · perfil vertical + isométrico · Fase 5 — GIS
        </span>
        <button
          onClick={handleReset}
          style={{ float: 'right', ...SX.btn, background: '#313244', color: '#cdd6f4', fontSize: 10 }}
        >
          ↻ reset
        </button>
      </div>

      {/* Constante y slots */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Shared constant</div>
          <div style={SX.row}>
            <span style={SX.k}>DATABUS_CONSUMER_DATA_TYPES</span>
            <span style={SX.v}>{CBuildingPerfilEIsometricoPlugin.DATABUS_CONSUMER_DATA_TYPES.join(', ')}</span>
          </div>
        </div>
        <div style={{ ...SX.card, flex: 1 }}>
          <div style={SX.title}>Slots (D1 — prefijo _)</div>
          <div style={SX.row}>
            <span style={SX.k}>_edificio</span>
            <span style={plugin.edificio ? SX.v : SX.empty}>
              {plugin.edificio?.name ?? '— _unset'}
            </span>
          </div>
          <div style={SX.row}>
            <span style={SX.k}>activate_crea_perfil_e_isometrico.enabled</span>
            <span style={SX.badge(actionEnabled)}>
              {actionEnabled ? 'true' : 'false'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulador de databus :map_selection */}
      <div style={SX.card}>
        <div style={SX.title}>
          sw_databus_data_available(:map_selection, data) — seleccionar edificio
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {buildings.map(b => {
            const mbs = b.mitBuildingStructure;
            const hasAllFloors = mbs?.floors.every(f => f.floorVertical !== undefined) ?? false;
            const hasArea3d = mbs?.area3d !== undefined;
            return (
              <div
                key={b.id}
                onClick={() => handleSelectBuilding(b)}
                style={{
                  padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
                  background: selectedId === b.id ? '#313244' : 'transparent',
                  borderLeft: `3px solid ${selectedId === b.id ? '#89b4fa' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ color: '#a6e3a1', minWidth: 70 }}>{b.id}</span>
                <span style={{ color: '#cdd6f4', flex: 1 }}>{b.name}</span>
                <span style={SX.badge(!hasAllFloors)}>
                  {hasAllFloors ? 'floor_vertical ✓' : 'floor_vertical _unset'}
                </span>
                <span style={SX.badge(!hasArea3d)}>
                  {hasArea3d ? 'area_3d ✓' : 'area_3d _unset'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle del edificio seleccionado */}
      {selectedBuilding?.mitBuildingStructure && (
        <div style={SX.card}>
          <div style={SX.title}>
            mit_building_structure — {selectedBuilding.name}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={SX.row}>
                <span style={SX.k}>floor_width</span>
                <span style={SX.v}>{selectedBuilding.mitBuildingStructure.floorWidth.value} m</span>
              </div>
              <div style={SX.row}>
                <span style={SX.k}>floor_length</span>
                <span style={SX.v}>{selectedBuilding.mitBuildingStructure.floorLength.value} m</span>
              </div>
              <div style={SX.row}>
                <span style={SX.k}>riser_length (altura piso)</span>
                <span style={SX.v}>{selectedBuilding.mitBuildingStructure.riserLength.value} m</span>
              </div>
              <div style={SX.row}>
                <span style={SX.k}>user!_area_3d</span>
                <span style={selectedBuilding.mitBuildingStructure.area3d ? SX.v : SX.empty}>
                  {selectedBuilding.mitBuildingStructure.area3d ? 'pseudo_chain generado' : '— _unset'}
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...SX.title, marginBottom: 4 }}>all_floors_iter()</div>
              {selectedBuilding.mitBuildingStructure.floors.map(f => (
                <FloorRow key={f.id} floor={f} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Acción principal */}
      <div style={SX.card}>
        <div style={SX.title}>crea_perfil_e_isometrico() → int!perfil_e_isometrico()</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actionEnabled ? (
            <button
              onClick={handleCreaPerfilIsometrico}
              style={{ ...SX.btn, background: '#89b4fa', color: '#1e1e2e' }}
            >
              Crear Perfil + Isométrico
            </button>
          ) : (
            <button style={SX.btnDisabled} disabled>
              Crear Perfil + Isométrico
            </button>
          )}
          <span style={{ color: '#585b70', fontSize: 10 }}>
            {actionEnabled
              ? 'pni_run_transaction → int!perfil_e_isometrico()'
              : selectedId
                ? 'geometrías ya completas — acción deshabilitada'
                : 'seleccionar edificio del mapa primero'}
          </span>
        </div>
      </div>

      {/* Log de eventos */}
      {log.length > 0 && (
        <div style={SX.card}>
          <div style={SX.title}>Log de eventos</div>
          {log.map((entry, i) => (
            <div key={i} style={{ fontSize: 10, padding: '2px 0', color: entry.ok ? '#a6e3a1' : '#f38ba8' }}>
              {entry.msg}
            </div>
          ))}
        </div>
      )}

      {/* Equivalencias Magik → TS */}
      <div style={SX.card}>
        <div style={SX.title}>Equivalencias aplicadas</div>
        <table style={SX.table}>
          <thead>
            <tr><th style={SX.th}>Magik</th><th style={SX.th}>→</th><th style={SX.th}>TypeScript</th></tr>
          </thead>
          <tbody>
            {[
              ['databus_consumer_data_types', 'static readonly DATABUS_CONSUMER_DATA_TYPES: string[]'],
              ['.edificio (slot :writable)', 'private _edificio: BuildingRecord | undefined'],
              ['sw_databus_data_available()', 'swDatabusDataAvailable(): boolean (acción enabled)'],
              ['pni_run_transaction(_self, :|int!perfil...|)', 'async → wrapper sincrónico en demo'],
              ['bounding_box.new(xmin,ymin,xmax,ymax)', '[number,number,number,number] (ol Extent)'],
              ['sector_rope.new() + .add_last(sec)', 'Array<Coordinate[]>'],
              ['pseudo_chain.new_for_world(sr, world)', 'IsometricoGeom { line5: Coordinate[][] }'],
              ['property_list.new_with(:line_5, pc)', '{ line5: sectors }'],
              ['record_transaction.new_insert().run()', 'asignación directa (stub DB)'],
              ['_try _when db_thing_readonly', 'try/catch'],
              ['condition.raise(:user_error, :string, msg)', 'throw new Error(msg)'],
              ['length_value.new(v,:m).convert_to(units)', 'LengthValue.valueIn(units)'],
              ['mbs.number_of_floors / upto()', 'Array.length / for loop'],
              ['_unset', 'undefined'],
            ].map(([magik, ts]) => (
              <tr key={magik}>
                <td style={{ ...SX.td, color: '#f9e2af' }}>{magik}</td>
                <td style={{ ...SX.td, color: '#585b70' }}>→</td>
                <td style={{ ...SX.td, color: '#89dceb' }}>{ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
