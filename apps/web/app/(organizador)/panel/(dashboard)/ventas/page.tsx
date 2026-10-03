import { requireOrganizer, getEventoYTicketsDelOrganizador } from "@/lib/organizer";

export const dynamic = "force-dynamic";

const ESTADO_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export default async function VentasPage() {
  const { organizer } = await requireOrganizer();
  const { evento, tickets } = await getEventoYTicketsDelOrganizador(organizer.fourvenues_event_id);

  if (!evento) {
    return (
      <>
        <div className="eyebrow">VENTAS &amp; TICKETS</div>
        <h1>Sin evento asignado</h1>
        <p className="empty-state" style={{ marginTop: 20 }}>
          Cuando Monarca Tickets te asigne tu evento, aqui veras el desglose de ventas por tarifa.
        </p>
      </>
    );
  }

  const porTarifa = new Map<string, { nombre: string; vendidos: number; ingresos: number }>();
  for (const t of tickets) {
    if (t.status === "refunded" || t.status === "cancelled") continue;
    const actual = porTarifa.get(t.ticket_rate_id) ?? {
      nombre: evento.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "Tarifa",
      vendidos: 0,
      ingresos: 0,
    };
    actual.vendidos += 1;
    actual.ingresos += t.total_price || 0;
    porTarifa.set(t.ticket_rate_id, actual);
  }
  const tarifas = [...porTarifa.values()].sort((a, b) => b.ingresos - a.ingresos);
  const totalVendidos = tarifas.reduce((acc, t) => acc + t.vendidos, 0);
  const totalIngresos = tarifas.reduce((acc, t) => acc + t.ingresos, 0);

  const ventasOrdenadas = [...tickets].sort((a, b) => (b.entry_time ? 1 : 0) - (a.entry_time ? 1 : 0));

  return (
    <>
      <div className="eyebrow">VENTAS &amp; TICKETS</div>
      <h1 style={{ marginBottom: 4 }}>{evento.name}</h1>
      <p className="page-lede">Desglose de ventas por tarifa, con datos en vivo de FourVenues.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{totalVendidos}</div>
          <div className="label">Entradas vendidas</div>
        </div>
        <div className="stat-card">
          <div className="value">
            {totalIngresos.toLocaleString("es-CO", { style: "currency", currency: evento.currency || "COP", maximumFractionDigits: 0 })}
          </div>
          <div className="label">Ingresos brutos</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Por tarifa</h2>
      </div>
      {tarifas.length === 0 ? (
        <p className="empty-state">Todavia no hay ventas para este evento.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {tarifas.map((t) => (
            <div key={t.nombre} className="card" style={{ flex: "1 1 200px", minWidth: 200 }}>
              <strong>{t.nombre}</strong>
              <p style={{ margin: "6px 0", fontSize: "1.2rem", fontWeight: 700 }}>{t.vendidos} vendidas</p>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {t.ingresos.toLocaleString("es-CO", { style: "currency", currency: evento.currency || "COP", maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="section-head">
        <h2>Ultimos tickets</h2>
      </div>
      {ventasOrdenadas.length === 0 ? (
        <p className="empty-state">Todavia no hay tickets emitidos para este evento.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tarifa</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasOrdenadas.slice(0, 50).map((t) => (
                <tr key={t._id}>
                  <td>{t.full_name || "—"}</td>
                  <td>{t.email || "—"}</td>
                  <td>{evento.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "—"}</td>
                  <td>
                    {(t.total_price || 0).toLocaleString("es-CO", { style: "currency", currency: t.payment_currency || "COP", maximumFractionDigits: 0 })}
                  </td>
                  <td>
                    <span className={ESTADO_BADGE[t.status] ?? "badge"}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventasOrdenadas.length > 50 && (
            <p className="muted" style={{ marginTop: 10, fontSize: "0.8rem" }}>
              Mostrando los primeros 50 de {ventasOrdenadas.length} tickets.
            </p>
          )}
        </div>
      )}
    </>
  );
}
