import { requireAdmin } from "@/lib/admin";
import { getEventosConTickets, moneda } from "@/lib/fv-admin";

export const dynamic = "force-dynamic";

const ESTADO_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export default async function CrmTicketsPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const { eventId } = await searchParams;
  await requireAdmin();

  let eventos: Awaited<ReturnType<typeof getEventosConTickets>> = [];
  let error = false;
  try {
    eventos = await getEventosConTickets();
  } catch {
    error = true;
  }

  const filas = eventos
    .filter((e) => !eventId || e.event._id === eventId)
    .flatMap(({ event, tickets }) =>
      tickets.map((t) => ({
        t,
        evento: event.name,
        tarifa: event.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "—",
        moneda: event.currency,
      }))
    );

  return (
    <>
      <h1>Tickets</h1>
      <p className="page-lede">Todos los tickets emitidos en FourVenues (en vivo). Reembolsos y cambios se gestionan en FourVenues.</p>

      {error && <p className="empty-state">No pudimos consultar FourVenues en este momento.</p>}

      <form className="form-row" style={{ marginBottom: 20 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="eventId">Evento</label>
          <select id="eventId" name="eventId" defaultValue={eventId ?? ""} style={{ minWidth: 220 }}>
            <option value="">Todos</option>
            {eventos.map((e) => (
              <option key={e.event._id} value={e.event._id}>
                {e.event.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary" style={{ alignSelf: "flex-end" }}>
          Filtrar
        </button>
      </form>

      {!error && filas.length === 0 ? (
        <p className="empty-state">Todavia no hay tickets emitidos.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Asistente</th>
                <th>Correo</th>
                <th>Evento</th>
                <th>Localidad</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.slice(0, 300).map(({ t, evento, tarifa, moneda: cur }) => (
                <tr key={t._id}>
                  <td>{t.full_name || "—"}</td>
                  <td>{t.email || "—"}</td>
                  <td>{evento}</td>
                  <td>{tarifa}</td>
                  <td>{moneda(t.total_price || 0, cur)}</td>
                  <td>
                    <span className={ESTADO_BADGE[t.status] ?? "badge"}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filas.length > 300 && <p className="muted">Mostrando 300 de {filas.length} tickets.</p>}
        </div>
      )}
    </>
  );
}
