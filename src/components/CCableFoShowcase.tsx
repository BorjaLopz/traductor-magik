import { CCableFo, type PinRecord, type SheathRecord } from '../models/CCableFo'

const mockPins: Array<PinRecord> = [
  { bundle_number: '1', fiber_number: 1, fiber_owner_record: { 'user!_cuenta': 'CTA-001' } },
  { bundle_number: '1', fiber_number: 2, fiber_owner_record: undefined },
  { bundle_number: '1', fiber_number: 3, fiber_owner_record: { 'user!_cuenta': 'CTA-003' } },
  { bundle_number: '2', fiber_number: 4, fiber_owner_record: { 'user!_cuenta': 'CTA-004' } },
  { bundle_number: '2', fiber_number: 5, fiber_owner_record: { 'user!_cuenta': 'CTA-005' } },
  { bundle_number: '3', fiber_number: 6, fiber_owner_record: undefined },
  { bundle_number: '3', fiber_number: 7, fiber_owner_record: { 'user!_cuenta': 'CTA-007' } },
]

const mockSheath: SheathRecord = {
  obtenerPines: (n?: number) => (n !== undefined ? mockPins.slice(0, n) : mockPins),
  mit_sheath_pins: { size: mockPins.length },
}

export function CCableFoShowcase() {
  const cableInicio = new CCableFo(mockSheath, false)
  const cableFinal = new CCableFo(mockSheath, true)
  const grupos = cableInicio.getGrupos()
  const pinLookup = mockPins[3]
  const grupoEncontrado = cableInicio.getGrupoFibra(pinLookup)
  const sheath = cableInicio.getSheath(pinLookup)

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 700 }}>
      <h3>CCableFo — extremo=false (todos los pines)</h3>
      {grupos.map((g, i) => (
        <div
          key={i}
          style={{ marginBottom: 12, border: '1px solid #ccc', borderRadius: 4, padding: 8 }}
        >
          <strong>
            Grupo {g.numero}: {g.description}
          </strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
            {g.fibras.map((f, j) => (
              <li key={j}>{f.description}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3 style={{ marginTop: 24 }}>CCableFo — extremo=true ({mockPins.length} pines)</h3>
      <p style={{ color: '#666', fontSize: 13 }}>
        Grupos: {cableFinal.getGrupos().length} | Fibras totales:{' '}
        {cableFinal.getGrupos().reduce((s, g) => s + g.fibras.length, 0)}
      </p>

      <h3 style={{ marginTop: 24 }}>getGrupoFibra(pin fiber_number={pinLookup.fiber_number})</h3>
      {grupoEncontrado ? (
        <pre style={{ background: '#f5f5f5', padding: 8 }}>
          {`numero: ${grupoEncontrado.numero}\ndescription: ${grupoEncontrado.description}\nfibras: ${grupoEncontrado.fibras.length}`}
        </pre>
      ) : (
        <p>undefined</p>
      )}

      <h3 style={{ marginTop: 24 }}>getSheath(pin fiber_number={pinLookup.fiber_number})</h3>
      <p style={{ background: '#f5f5f5', padding: 8 }}>
        {sheath !== undefined ? 'SheathRecord encontrado (mit_sheath_pins.size=' + sheath.mit_sheath_pins.size + ')' : 'undefined'}
      </p>

      <h3 style={{ marginTop: 24 }}>descripcionFibra</h3>
      <ul>
        {mockPins.map((p, i) => (
          <li key={i}>{cableInicio.descripcionFibra(p)}</li>
        ))}
      </ul>
    </div>
  )
}
