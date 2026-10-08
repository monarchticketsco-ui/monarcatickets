"use client";

import { seleccionarEventoActivo } from "@/app/(organizador)/panel/actions";

// Selector de evento del Panel Polinizador (solo se muestra con 2+ eventos).
export function EventoSelector({
  eventos,
  activo,
}: {
  eventos: { id: string; nombre: string }[];
  activo: string | null;
}) {
  return (
    <form action={seleccionarEventoActivo} className="mq-evento-selector">
      <label htmlFor="mq-evento-activo">Evento</label>
      <select
        id="mq-evento-activo"
        name="evento"
        defaultValue={activo ?? undefined}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {eventos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
    </form>
  );
}
