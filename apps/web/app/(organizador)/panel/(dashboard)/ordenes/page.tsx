import { requireOrganizer } from "@/lib/organizer";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

export default async function PanelOrdenesPage() {
  const { supabase, organizer } = await requireOrganizer();

  const { data: eventos } = await supabase.from("events").select("id, name").eq("organizer_id", organizer.id);
  const eventosMap = new Map((eventos ?? []).map((e) => [e.id, e.name]));
  const eventIds = [...eventosMap.keys()];

  const admin = createAdminClient();
  const { data: ordenes } = eventIds.length
    ? await admin
        .from("orders")
        .select("id, event_id, total_cop, ticket_service_cop, status, created_at, profiles(full_name)")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false })
        .limit(300)
    : {
        data: [] as {
          id: string;
          event_id: string;
          total_cop: number;
          ticket_service_cop: number;
          status: string;
          created_at: string;
          profiles: unknown;
        }[],
      };

  const items = ordenes ?? [];
  // Ingreso real del organizador: el total cobrado menos el Ticket
  // Service, que Monarca retiene (ver migracion 0012). El "Total" de
  // cada fila abajo si es el cobro completo que hizo Bold al comprador.
  const totalPagado = items
    .filter((o) => o.status === "pagada")
    .reduce((acc, o) => acc + (o.total_cop - o.ticket_service_cop), 0);

  return (
    <>
      <h1>Ordenes de venta</h1>
      <p className="page-lede">Compras realizadas para tus eventos.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{items.length}</div>
          <div className="label">Ordenes</div>
        </div>
        <div className="stat-card">
          <div className="value">${totalPagado.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP</div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Todavia no hay ordenes para tus eventos.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Comprador</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const comprador = o.profiles as unknown as { full_name: string | null } | null;
                return (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>{eventosMap.get(o.event_id) ?? "—"}</td>
                    <td>{comprador?.full_name ?? "—"}</td>
                    <td>${o.total_cop.toLocaleString("es-CO")}</td>
                    <td>
                      <span className={ORDEN_BADGE[o.status] ?? "badge"}>{o.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
