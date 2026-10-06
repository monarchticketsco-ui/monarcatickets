// Datos agregados de FourVenues para Management (CRM). Todo sale en vivo
// de la API — Monarca ya no guarda copia local de eventos, ordenes ni
// tickets (FourVenues es el motor unico).
import { cache } from "react";
import { getFourvenuesEvents, getFourvenuesTicketsByEvent, type FVEvent, type FVTicket } from "@/lib/fourvenues";

export type EventoConTickets = {
  event: FVEvent;
  tickets: FVTicket[];
  /** Tickets validos (no reembolsados ni cancelados). */
  vendidos: number;
  /** Suma de total_price de tickets validos. */
  ingresos: number;
};

const esValido = (t: FVTicket) => t.status !== "refunded" && t.status !== "cancelled";

/** Todos los eventos (vigentes y pasados) con sus tickets. Cacheado por request. */
export const getEventosConTickets = cache(async (): Promise<EventoConTickets[]> => {
  const eventos = await getFourvenuesEvents({ incluirPasados: true });
  const items = await Promise.all(
    eventos.map(async (event) => {
      const tickets = await getFourvenuesTicketsByEvent(event._id);
      const validos = tickets.filter(esValido);
      return {
        event,
        tickets,
        vendidos: validos.length,
        ingresos: validos.reduce((acc, t) => acc + (t.total_price || 0), 0),
      };
    })
  );
  return items.sort(
    (a, b) =>
      new Date(b.event.display_date || b.event.start_date).getTime() -
      new Date(a.event.display_date || a.event.start_date).getTime()
  );
});

export function aforoDelEvento(e: FVEvent): { vendidas: number; disponibles: number } {
  return (e.ticket_rates ?? []).reduce(
    (acc, r) => ({
      vendidas: acc.vendidas + (r.availability?.sold ?? 0),
      disponibles: acc.disponibles + (r.availability?.available ?? 0),
    }),
    { vendidas: 0, disponibles: 0 }
  );
}

export const moneda = (n: number, currency = "COP") =>
  n.toLocaleString("es-CO", { style: "currency", currency, maximumFractionDigits: 0 });
