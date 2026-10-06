import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getEventosConTickets, moneda } from "@/lib/fv-admin";
import { eventoVigente, fechaCorta } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

const LEAD_BADGE: Record<string, string> = {
  nuevo: "badge badge-blue",
  contactado: "badge badge-warning",
  convertido: "badge badge-green",
  descartado: "badge",
};

export default async function CrmDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordActualizada?: string; eventId?: string }>;
}) {
  const { passwordActualizada, eventId } = await searchParams;
  const { supabase } = await requireAdmin();

  let eventosFV: Awaited<ReturnType<typeof getEventosConTickets>> = [];
  let errorFV = false;
  try {
    eventosFV = await getEventosConTickets();
  } catch {
    errorFV = true;
  }

  const [{ count: organizadoresCount }, { data: leadsRecientes }, { count: pqrsAbiertasCount }] = await Promise.all([
    supabase.from("organizers").select("id", { count: "exact", head: true }),
    supabase.from("empresa_leads").select("id, nombre, empresa, estado, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("pqrs_solicitudes").select("id", { count: "exact", head: true }).neq("estado", "cerrada"),
  ]);

  const enAlcance = eventId ? eventosFV.filter((e) => e.event._id === eventId) : eventosFV;
  const vendidos = enAlcance.reduce((acc, e) => acc + e.vendidos, 0);
  const ingresos = enAlcance.reduce((acc, e) => acc + e.ingresos, 0);
  const vigentes = enAlcance.filter((e) => eventoVigente(e.event)).length;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="page-lede">Resumen general de Monarca Tickets — datos en vivo de FourVenues.</p>
      {passwordActualizada && (
        <p className="alert-success" role="status">
          Tu contraseña se actualizo correctamente.
        </p>
      )}
      {errorFV && (
        <p className="empty-state">No pudimos consultar FourVenues en este momento. Los totales de ventas no estan disponibles.</p>
      )}

      <form className="form-row" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="eventId">Evento</label>
          <select id="eventId" name="eventId" defaultValue={eventId ?? ""} style={{ minWidth: 220 }}>
            <option value="">Todos</option>
            {eventosFV.map((e) => (
              <option key={e.event._id} value={e.event._id}>
                {e.event.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary" style={{ alignSelf: "flex-end" }}>
          Filtrar
        </button>
        {eventId && (
          <Link href="/crm" className="nav-link" style={{ alignSelf: "flex-end", padding: "10px 0" }}>
            Limpiar filtro
          </Link>
        )}
      </form>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{organizadoresCount ?? 0}</div>
          <div className="label">Polinizadores (cuentas)</div>
        </div>
        <div className="stat-card">
          <div className="value">{enAlcance.length}</div>
          <div className="label">Eventos en FourVenues ({vigentes} vigentes)</div>
        </div>
        <div className="stat-card">
          <div className="value">{vendidos}</div>
          <div className="label">Entradas vendidas</div>
        </div>
        <div className="stat-card">
          <div className="value">{moneda(ingresos)}</div>
          <div className="label">Ingresos brutos</div>
        </div>
        <div className="stat-card">
          <div className="value">{pqrsAbiertasCount ?? 0}</div>
          <div className="label">PQRS pendientes</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div>
          <div className="section-head">
            <h2>Eventos</h2>
            <Link href="/crm/eventos" className="text-link">
              Ver todos →
            </Link>
          </div>
          {enAlcance.length === 0 ? (
            <p className="empty-state">No hay eventos en FourVenues.</p>
          ) : (
            <ul className="list-plain">
              {enAlcance.slice(0, 5).map(({ event, vendidos: v, ingresos: i }) => (
                <li key={event._id} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <span>
                      <strong>{event.name}</strong>
                      <span className="muted"> — {event.location?.city}</span>
                    </span>
                    <span className={eventoVigente(event) ? "badge badge-green" : "badge"}>
                      {eventoVigente(event) ? "Vigente" : "Finalizado"}
                    </span>
                  </div>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                    {fechaCorta(event)} · {v} vendidas · {moneda(i)}
                  </p>
                </li>
              ))}
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
