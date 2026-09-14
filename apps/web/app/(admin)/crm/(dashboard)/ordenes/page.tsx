import { requireAdmin } from "@/lib/admin";

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

export default async function CrmOrdenesPage() {
  const { supabase } = await requireAdmin();

  const { data: ordenes } = await supabase
    .from("orders")
    .select("id, total_cop, status, created_at, events(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(300);

  const items = ordenes ?? [];
  const totalPagado = items.filter((o) => o.status === "pagada").reduce((acc, o) => acc + o.total_cop, 0);

  return (
    <>
      <h1>Ordenes de compra</h1>
      <p className="page-lede">Compras realizadas en toda la plataforma.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{items.length}</div>
          <div className="label">Ordenes (ultimas 300)</div>
        </div>
        <div className="stat-card">
          <div className="value">${totalPagado.toLocaleString("es-CO")}</div>
          <div className="label">Total confirmado COP</div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="empty-state">Todavia no hay ordenes.</p>
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
              {items.map((orden) => {
                const evento = orden.events as unknown as { name: string } | null;
                const comprador = orden.profiles as unknown as { full_name: string | null } | null;
                return (
                  <tr key={orden.id}>
                    <td>{new Date(orden.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>{evento?.name ?? "—"}</td>
                    <td>{comprador?.full_name ?? "—"}</td>
                    <td>${orden.total_cop.toLocaleString("es-CO")}</td>
                    <td>
                      <span className={ORDEN_BADGE[orden.status] ?? "badge"}>{orden.status}</span>
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
