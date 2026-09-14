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

const SIN_RESULTADOS = "00000000-0000-0000-0000-000000000000";

export default async function CrmDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    passwordActualizada?: string;
    desde?: string;
    hasta?: string;
    organizerId?: string;
    eventId?: string;
  }>;
}) {
  const { passwordActualizada, desde, hasta, organizerId, eventId } = await searchParams;
  const { supabase } = await requireAdmin();

  // Opciones para los selects del filtro.
  const [{ data: organizadoresOpciones }, { data: eventosOpciones }] = await Promise.all([
    supabase.from("organizers").select("id, legal_name").order("legal_name", { ascending: true }),
    supabase
      .from("events")
      .select("id, name, organizer_id, organizers(legal_name)")
      .order("name", { ascending: true }),
  ]);

  // El evento del filtro manda sobre el organizador (es mas especifico).
  // Si solo hay organizador, el alcance son todos sus eventos.
  let idsFiltro: string[] | null = null;
  if (eventId) {
    idsFiltro = [eventId];
  } else if (organizerId) {
    idsFiltro = (eventosOpciones ?? []).filter((e) => e.organizer_id === organizerId).map((e) => e.id);
  }
  const idsParaQuery = idsFiltro ? (idsFiltro.length ? idsFiltro : [SIN_RESULTADOS]) : null;
  const hayFiltros = Boolean(desde || hasta || organizerId || eventId);

  let eventosQuery = supabase.from("events").select("id, status");
  if (idsParaQuery) eventosQuery = eventosQuery.in("id", idsParaQuery);

  let ordenesPagadasQuery = supabase.from("orders").select("total_cop").eq("status", "pagada");
  if (idsParaQuery) ordenesPagadasQuery = ordenesPagadasQuery.in("event_id", idsParaQuery);
  if (desde) ordenesPagadasQuery = ordenesPagadasQuery.gte("created_at", `${desde}T00:00:00`);
  if (hasta) ordenesPagadasQuery = ordenesPagadasQuery.lte("created_at", `${hasta}T23:59:59`);

  let ordenesRecientesQuery = supabase
    .from("orders")
    .select("id, total_cop, status, created_at, events(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);
  if (idsParaQuery) ordenesRecientesQuery = ordenesRecientesQuery.in("event_id", idsParaQuery);
  if (desde) ordenesRecientesQuery = ordenesRecientesQuery.gte("created_at", `${desde}T00:00:00`);
  if (hasta) ordenesRecientesQuery = ordenesRecientesQuery.lte("created_at", `${hasta}T23:59:59`);

  const [
    { count: organizadoresCount },
    { data: eventos },
    { data: ordenesPagadas },
    { data: ordenesRecientes },
    { data: leadsRecientes },
    { count: pqrsAbiertasCount },
  ] = await Promise.all([
    supabase.from("organizers").select("id", { count: "exact", head: true }),
    eventosQuery,
    ordenesPagadasQuery,
    ordenesRecientesQuery,
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
      {passwordActualizada && (
        <p className="alert-success" role="status">
          Tu contraseña se actualizo correctamente.
        </p>
      )}

      <form className="form-row" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="organizerId">Organizador</label>
          <select id="organizerId" name="organizerId" defaultValue={organizerId ?? ""} style={{ minWidth: 180 }}>
            <option value="">Todos</option>
            {(organizadoresOpciones ?? []).map((o) => (
              <option key={o.id} value={o.id}>
                {o.legal_name}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="eventId">Evento</label>
          <select id="eventId" name="eventId" defaultValue={eventId ?? ""} style={{ minWidth: 200 }}>
            <option value="">Todos</option>
            {(eventosOpciones ?? []).map((e) => {
              const organizador = e.organizers as unknown as { legal_name: string } | null;
              return (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {organizador ? ` — ${organizador.legal_name}` : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="desde">Desde</label>
          <input id="desde" name="desde" type="date" defaultValue={desde ?? ""} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="hasta">Hasta</label>
          <input id="hasta" name="hasta" type="date" defaultValue={hasta ?? ""} />
        </div>
        <button type="submit" className="btn btn-secondary" style={{ alignSelf: "flex-end" }}>
          Filtrar
        </button>
        {hayFiltros && (
          <Link href="/crm" className="nav-link" style={{ alignSelf: "flex-end", padding: "10px 0" }}>
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{organizadoresCount ?? 0}</div>
          <div className="label">Organizadores</div>
        </div>
        <div className="stat-card">
          <div className="value">{eventosList.length}</div>
          <div className="label">Eventos {hayFiltros ? "(filtrados)" : "totales"}</div>
        </div>
        <div className="stat-card">
          <div className="value">${ingresosTotalesCop.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP {hayFiltros ? "(filtrados)" : ""}</div>
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
            <h2>Ordenes recientes {hayFiltros ? "(filtradas)" : ""}</h2>
            <Link href="/crm/ordenes" className="text-link">
              Ver todas →
            </Link>
          </div>
          {!ordenesRecientes || ordenesRecientes.length === 0 ? (
            <p className="empty-state">
              {hayFiltros ? "No hay ordenes con esos filtros." : "Todavia no hay ordenes."}
            </p>
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
