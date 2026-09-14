import Link from "next/link";
import { requireOrganizer } from "@/lib/organizer";
import { createAdminClient } from "@/lib/supabase/admin";

const DIAN_BADGE: Record<string, string> = {
  no_habilitado: "badge badge-danger",
  en_proceso: "badge badge-warning",
  habilitado: "badge badge-green",
};

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

export default async function PanelDashboardPage() {
  const { supabase, organizer } = await requireOrganizer();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });

  const eventosList = eventos ?? [];
  const eventIds = eventosList.map((e) => e.id);
  const eventosMap = new Map(eventosList.map((e) => [e.id, e.name]));

  const admin = createAdminClient();
  const { data: ordenes } = eventIds.length
    ? await admin.from("orders").select("total_cop, status").in("event_id", eventIds)
    : { data: [] as { total_cop: number; status: string }[] };

  const { data: ventasRecientes } = eventIds.length
    ? await admin
        .from("orders")
        .select("id, event_id, total_cop, status, created_at, profiles(full_name)")
        .in("event_id", eventIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] as { id: string; event_id: string; total_cop: number; status: string; created_at: string; profiles: unknown }[] };

  const ventasList = ventasRecientes ?? [];

  const ingresosCop = (ordenes ?? [])
    .filter((o) => o.status === "pagada")
    .reduce((acc, o) => acc + o.total_cop, 0);

  const ahora = Date.now();
  const proximo = eventosList
    .filter((e) => new Date(e.starts_at).getTime() > ahora)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ marginBottom: 0 }}>{organizer.legal_name}</h1>
        <Link href="/panel/eventos/nuevo" className="btn btn-primary">
          + Crear evento
        </Link>
      </div>
      <p className="muted">
        Estado DIAN (habilitacion para facturar electronicamente):{" "}
        <span className={DIAN_BADGE[organizer.dian_status] ?? "badge"}>{organizer.dian_status}</span>
        {organizer.dian_status !== "habilitado" && " — no vas a poder publicar boletos en venta hasta habilitarte."}
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{eventosList.length}</div>
          <div className="label">Eventos</div>
        </div>
        <div className="stat-card">
          <div className="value">${ingresosCop.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ fontSize: proximo ? "1.05rem" : "1.6rem" }}>
            {proximo ? proximo.name : "—"}
          </div>
          <div className="label">Proximo evento</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Ventas recientes</h2>
        <Link href="/panel/ordenes" className="text-link">
          Ver todas →
        </Link>
      </div>
      {ventasList.length === 0 ? (
        <p className="empty-state">Todavia no hay ventas para tus eventos.</p>
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
              {ventasList.map((o) => {
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

      <div className="section-head">
        <h2>Eventos recientes</h2>
        {eventosList.length > 5 && (
          <Link href="/panel/eventos" className="text-link">
            Ver todos →
          </Link>
        )}
      </div>
      {eventosList.length === 0 ? (
        <p className="empty-state">Todavia no has creado ningun evento.</p>
      ) : (
        <ul className="list-plain">
          {eventosList.slice(0, 5).map((e) => (
            <li key={e.id} className="card" style={{ padding: "16px 20px" }}>
              <Link
                href={`/panel/eventos/${e.id}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", textDecoration: "none", color: "inherit" }}
              >
                <span>
                  <strong>{e.name}</strong>
                  <span className="muted"> — {e.city} — {new Date(e.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</span>
                </span>
                <span className={ESTADO_BADGE[e.status] ?? "badge"}>{e.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
