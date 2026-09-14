import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

const LEAD_BADGE: Record<string, string> = {
  nuevo: "badge badge-blue",
  contactado: "badge badge-warning",
  convertido: "badge badge-green",
  descartado: "badge",
};

export default async function CrmDashboardPage() {
  const { supabase } = await requireAdmin();

  const [
    { count: organizadoresCount },
    { data: eventos },
    { data: ordenesPagadas },
    { data: ordenesRecientes },
    { data: leadsRecientes },
    { count: pqrsAbiertasCount },
  ] = await Promise.all([
    supabase.from("organizers").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id, status"),
    supabase.from("orders").select("total_cop").eq("status", "pagada"),
    supabase
      .from("orders")
      .select("id, total_cop, status, created_at, events(name), profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("empresa_leads")
      .select("id, nombre, empresa, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("pqrs_solicitudes").select("id", { count: "exact", head: true }).neq("estado", "cerrada"),
  ]);

  const eventosList = eventos ?? [];
  const ingresosTotalesCop = (ordenesPagadas ?? []).reduce((acc, o) => acc + o.total_cop, 0);

  const eventosPorEstado = eventosList.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});
  const resumenEstados =
    Object.entries(eventosPorEstado)
      .map(([estado, cantidad]) => `${estado}: ${cantidad}`)
      .join(" · ") || "sin eventos";

  return (
    <>
      <h1>Dashboard</h1>
      <p className="page-lede">Resumen general de Monarca Tickets.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{organizadoresCount ?? 0}</div>
          <div className="label">Organizadores</div>
        </div>
        <div className="stat-card">
          <div className="value">{eventosList.length}</div>
          <div className="label">Eventos totales</div>
        </div>
        <div className="stat-card">
          <div className="value">${ingresosTotalesCop.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP</div>
        </div>
        <div className="stat-card">
          <div className="value">{pqrsAbiertasCount ?? 0}</div>
          <div className="label">PQRS pendientes</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ fontSize: "1rem" }}>{resumenEstados}</div>
          <div className="label">Eventos por estado</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div>
          <div className="section-head">
            <h2>Ordenes recientes</h2>
            <Link href="/crm/ordenes" className="text-link">
              Ver todas →
            </Link>
          </div>
          {!ordenesRecientes || ordenesRecientes.length === 0 ? (
            <p className="empty-state">Todavia no hay ordenes.</p>
          ) : (
            <ul className="list-plain">
              {ordenesRecientes.map((orden) => {
                const evento = orden.events as unknown as { name: string } | null;
                const comprador = orden.profiles as unknown as { full_name: string | null } | null;
                return (
                  <li key={orden.id} className="card" style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <span>
                        <strong>{evento?.name ?? "—"}</strong>
                        <span className="muted"> — {comprador?.full_name ?? "—"}</span>
                      </span>
                      <span className={ORDEN_BADGE[orden.status] ?? "badge"}>{orden.status}</span>
                    </div>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                      ${orden.total_cop.toLocaleString("es-CO")} ·{" "}
                      {new Date(orden.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="section-head">
            <h2>Solicitudes de empresas</h2>
            <Link href="/crm/organizadores" className="text-link">
              Ver todas →
            </Link>
          </div>
          {!leadsRecientes || leadsRecientes.length === 0 ? (
            <p className="empty-state">Todavia no hay solicitudes.</p>
          ) : (
            <ul className="list-plain">
              {leadsRecientes.map((lead) => (
                <li key={lead.id} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span>
                      <strong>{lead.nombre}</strong>
                      <span className="muted"> — {lead.empresa ?? "—"}</span>
                    </span>
                    <span className={LEAD_BADGE[lead.estado] ?? "badge"}>{lead.estado}</span>
                  </div>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                    {new Date(lead.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
