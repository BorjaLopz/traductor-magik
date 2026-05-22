/**
 * Migracion de: c_plano_e.magik
 * Clase Magik:  c_plano_e
 * Metodos:      new, init, Proyecto, Nombre, Tipo, Comentario
 *
 * Intencion:
 *   Representar un plano con sus propiedades basicas.
 */

import React, { useMemo } from 'react';

// =============================================================================
// TIPOS
// =============================================================================

export interface PlanoData {
  proyecto: string;
  nombre: string;
  tipo: string;
  comentario: string;
}

// =============================================================================
// CLASE PRINCIPAL
// =============================================================================

export class PlanoE {
  sProyecto: string = '';
  sNombre: string = '';
  sTipo: string = '';
  sComentario: string = '';

  // Magik: new(PoPlano)
  static create(plano: PlanoData): PlanoE {
    const inst = new PlanoE();
    inst.init(plano);
    return inst;
  }

  // Magik: init(PoPlano)
  init(plano: PlanoData): this {
    this.sProyecto = plano.proyecto;
    this.sNombre = plano.nombre;
    this.sTipo = plano.tipo;
    this.sComentario = plano.comentario;
    return this;
  }

  // Magik: Proyecto
  async proyecto(): Promise<string> {
    return this.sProyecto;
  }

  // Magik: Nombre
  async nombre(): Promise<string> {
    return this.sNombre;
  }

  // Magik: Tipo (uppercase)
  async tipo(): Promise<string> {
    return this.sTipo.toUpperCase();
  }

  // Magik: Comentario
  async comentario(): Promise<string> {
    return this.sComentario;
  }
}

// =============================================================================
// COMPONENTE REACT — demo
// =============================================================================

export function PlanoEUI() {
  const plano = useMemo(() => PlanoE.create({
    proyecto: 'PROY-001',
    nombre: 'PLANO-DET-01',
    tipo: 'detalle',
    comentario: 'Plano de detalle del tramo.',
  }), []);

  return (
    <div style={s.wrapper}>
      <div style={s.title}>c_plano_e</div>
      <div style={s.meta}>Proyecto: {plano.sProyecto}</div>
      <div style={s.meta}>Nombre: {plano.sNombre}</div>
      <div style={s.meta}>Tipo: {plano.sTipo.toUpperCase()}</div>
      <div style={s.meta}>Comentario: {plano.sComentario}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
  title  : { fontSize: 13, fontWeight: 'bold' },
  meta   : { fontSize: 12, color: '#555' },
};

export default PlanoEUI;
