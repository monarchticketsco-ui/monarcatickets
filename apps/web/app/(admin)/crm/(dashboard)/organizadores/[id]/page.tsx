import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarFichaOrganizador } from "../actions";

const EVENTO_BADGE: Record<string, string> = {
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

export default async function OrganizadorDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string; desde?: string; hasta?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { eventId, desde, hasta } = await searchParams;
  const admin = createAdminClient();

  const { data: organizador } = await admin
    .from("organizers")
    .select(
      "id, legal_name, nit, commission_rate, contact_name, contact_phone, contact_email, commercial_owner, notas, created_at"
    )
    .eq("id", id)
    .single();

  if (!organizador) notFound();

  const { data: eventos } = await admin
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", id)
    .order("starts_at", { ascending: false });

  const eventosList = eventos ?? [];
  const eventIds = eventosList.map((e) => e.id);
  const eventosMap = new Map(eventosList.map((e) => [e.id, e.name]));

  // El evento del filtro solo cuenta si de verdad es de este organizador.
  const eventoFiltro = eventId && eventIds.includes(eventId) ? eventId : undefined;
  const idsParaVentas = eventoFiltro ? [eventoFiltro] : eventIds;
  const hayFiltrosVentas = Boolean(eventoFiltro || desde || hasta);

  let ventasQuery = admin
    .from("orders")
    .select("id, event_id, total_cop, ticket_service_cop, status, created_at, profiles(full_name)")
    .in("event_id", idsParaVentas.length ? idsParaVentas : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false })
    .limit(300);

  if (desde) ventasQuery = ventasQuery.gte("created_at", `${desde}T00:00:00`);
  if (hasta) ventasQuery = ventasQuery.lte("created_at", `${hasta}T23:59:59`);

  const { data: ventasData } = await ventasQuery;
  const ventas = ventasData ?? [];
  // Ingreso real del organizador: el total cobrado menos el Ticket
  // Service, que Monarca retiene (ver migracion 0012).
  const totalPagado = ventas
    .filter((v) => v.status === "pagada")
    .reduce((acc, v) => acc + (v.total_cop - v.ticket_service_cop), 0);

  const actualizarFichaConId = actualizarFichaOrganizador.bind(null, id);

  return (
    <>
      <p>
        <Link href="/crm" className="nav-link" style={{ padding: 0 }}>
          ← Volver al CRM
        </Link>
      </p>
      <h1 style={{ marginBottom: 0 }}>{organizador.legal_name}</h1>
      <p className="page-lede">
        NIT {organizador.nit} · Cliente desde {new Date(organizador.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}
      </p>

      <h2>Ficha del organizador</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Datos de contacto, responsable comercial y % de Ticket Service acordado. Solo visibles para el equipo de Monarca
        Tickets.
      </p>
      <div className="card" style={{ maxWidth: 620 }}>
        <form action={actualizarFichaConId} className="form" style={{ maxWidth: "none" }}>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 240px" }}>
              <label htmlFor="legal_name">Razon social</label>
              <input id="legal_name" name="legal_name" type="text" defaultValue={organizador.legal_name} required />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="nit">NIT</label>
              <input id="nit" name="nit" type="text" defaultValue={organizador.nit} required />
            </div>
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <label htmlFor="contact_name">Nombre de contacto</label>
              <input id="contact_name" name="contact_name" type="text" defaultValue={organizador.contact_name ?? ""} />
            </div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="contact_phone">Telefono de contacto</label>
              <input id="contact_phone" name="contact_phone" type="tel" defaultValue={organizador.contact_phone ?? ""} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="contact_email">Correo de contacto</label>
            <input id="contact_email" name="contact_email" type="email" defaultValue={organizador.contact_email ?? ""} />
          </div>
          <div className="form-row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 220px" }}>
              <label htmlFor="commercial_owner">Responsable comercial (Monarca Tickets)</label>
              <input
                id="commercial_owner"
                name="commercial_owner"
                type="text"
                placeholder="Nombre del asesor"
                defaultValue={organizador.commercial_owner ?? ""}
              />
            </div>
            <div className="field" style={{ flex: "1 1 140px" }}>
              <label htmlFor="commission_rate">Ticket Service (%)</label>
              <input
                id="commission_rate"
                name="commission_rate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                defaultValue={organizador.commission_rate}
              />
              <p className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0" }}>
                Se suma al precio de cada boleto y lo paga el comprador al pagar con Bold.
              </p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="notas">Notas internas</label>
            <textarea id="notas" name="notas" rows={3} defaultValue={organizador.notas ?? ""} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar ficha
          </button>
        </form>
      </div>

      <h2>Ventas realizadas</h2>
      <form className="form-row" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="eventId">Evento</label>
          <select id="eventId" name="eventId" defaultValue={eventoFiltro ?? ""} style={{ minWidth: 200 }}>
            <option value="">Todos los eventos</option>
            {eventosList.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
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
        {hayFiltrosVentas && (
          <Link href={`/crm/organizadores/${id}`} className="nav-link" style={{ alignSelf: "flex-end", padding: "10px 0" }}>
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{ventas.length}</div>
          <div className="label">Ventas {hayFiltrosVentas ? "(filtradas)" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="value">${totalPagado.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP (sin Ticket Service)</div>
        </div>
      </div>

      {eventosList.length === 0 ? (
        <p className="empty-state">Este organizador todavia no tiene eventos.</p>
      ) : ventas.length === 0 ? (
        <p className="empty-state">
          {hayFiltrosVentas ? "No hay ventas con esos filtros." : "Todavia no hay ventas para este organizador."}
        </p>
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
              {ventas.map((v) => {
                const comprador = v.profiles as unknown as { full_name: string | null } | null;
                return (
                  <tr key={v.id}>
                    <td>{new Date(v.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>{eventosMap.get(v.event_id) ?? "—"}</td>
                    <td>{comprador?.full_name ?? "—"}</td>
                    <td>${v.total_cop.toLocaleString("es-CO")}</td>
                    <td>
                      <span className={ORDEN_BADGE[v.status] ?? "badge"}>{v.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>Eventos</h2>
      {eventosList.length === 0 ? (
        <p className="empty-state">Este organizador todavia no tiene eventos.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Ciudad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {eventosList.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.city}</td>
                  <td>{new Date(e.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                  <td>
                    <span className={EVENTO_BADGE[e.status] ?? "badge"}>{e.status}</span>
                  </td>
                  <td>
                    <Link href={`/crm/eventos/${e.id}`} className="btn btn-secondary btn-sm">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
