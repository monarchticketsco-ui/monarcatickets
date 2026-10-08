import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarFichaOrganizador, asignarEventoOrganizador, quitarEventoOrganizador } from "../actions";
import { getFourvenuesEventById, getFourvenuesEvents, getFourvenuesTicketsByEvent } from "@/lib/fourvenues";
import { moneda } from "@/lib/fv-admin";
import { fechaCorta } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

const TICKET_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export default async function OrganizadorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: organizador } = await admin
    .from("organizers")
    .select(
      "id, legal_name, nit, commission_rate, contact_name, contact_phone, contact_email, commercial_owner, notas, created_at, fourvenues_event_id"
    )
    .eq("id", id)
    .single();

  if (!organizador) notFound();

  // Eventos asignados (varios por organizador) + respaldo del campo legacy.
  const { data: filas } = await admin
    .from("organizer_events")
    .select("fourvenues_event_id")
    .eq("organizer_id", id)
    .order("created_at", { ascending: true });
  const eventIds = (filas ?? []).map((f) => f.fourvenues_event_id as string);
  if (organizador.fourvenues_event_id && !eventIds.includes(organizador.fourvenues_event_id)) {
    eventIds.unshift(organizador.fourvenues_event_id);
  }

  const [asignados, catalogo] = await Promise.all([
    Promise.all(
      eventIds.map(async (eid) => {
        const evento = await getFourvenuesEventById(eid);
        const tickets = evento ? await getFourvenuesTicketsByEvent(evento._id) : [];
        return { id: eid, evento, tickets };
      })
    ),
    getFourvenuesEvents({ incluirPasados: true }).catch(() => []),
  ]);
  const disponibles = catalogo.filter((e) => !eventIds.includes(e._id));

  const actualizarFichaConId = actualizarFichaOrganizador.bind(null, id);
  const asignarEventoConId = asignarEventoOrganizador.bind(null, id);

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
                Porcentaje acordado con el Polinizador. El cobro al comprador (precio + cargo por servicio) lo define y procesa FourVenues.
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

      <h2>Eventos de FourVenues asignados</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Un Polinizador puede tener varios eventos. En su panel elige cuál ver con un selector.
      </p>
      <div className="card" style={{ maxWidth: 620 }}>
        {asignados.length === 0 ? (
          <p className="muted" style={{ margin: "0 0 16px" }}>
            Sin eventos asignados todavía: el Panel Polinizador de este organizador mostrará un aviso.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 10 }}>
            {asignados.map(({ id: eid, evento }) => (
              <li key={eid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span>
                  {evento ? (
                    <>
                      <strong>{evento.name}</strong>
                      <br />
                      <small className="muted">{fechaCorta(evento)} · {evento.location?.name}</small>
                    </>
                  ) : (
                    <>
                      <strong>Evento no encontrado en FourVenues</strong>
                      <br />
                      <small className="muted">ID {eid} — revisa el ID.</small>
                    </>
                  )}
                </span>
                <form action={quitarEventoOrganizador.bind(null, id, eid)}>
                  <button type="submit" className="btn">Quitar</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={asignarEventoConId} className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <label htmlFor="evento_id">Agregar un evento</label>
            <select id="evento_id" name="evento_id" defaultValue="">
              <option value="">Elige un evento de FourVenues…</option>
              {disponibles.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} · {fechaCorta(e)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="evento_id_manual">…o pega su ID de FourVenues</label>
            <input id="evento_id_manual" name="evento_id_manual" type="text" placeholder="ej. gss0259prb0doouygcgf7y2rdc1q6prm" />
          </div>
          <button type="submit" className="btn btn-primary">Agregar evento</button>
        </form>
      </div>

      <h2>Eventos y ventas (FourVenues)</h2>
      {asignados.length === 0 ? (
        <p className="empty-state">
          Este Polinizador todavia no tiene eventos de FourVenues asignados. Agrega uno arriba para que vea sus ventas en
          su panel.
        </p>
      ) : (
        asignados.map(({ id: eid, evento, tickets }) => {
          if (!evento) return null;
          const validos = tickets.filter((t) => t.status !== "refunded" && t.status !== "cancelled");
          const ingresos = validos.reduce((acc, t) => acc + (t.total_price || 0), 0);
          return (
            <section key={eid} style={{ marginBottom: 32 }}>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="value" style={{ fontSize: "1.05rem" }}>{evento.name}</div>
                  <div className="label">{fechaCorta(evento)} · {evento.location?.name}</div>
                </div>
                <div className="stat-card">
                  <div className="value">{validos.length}</div>
                  <div className="label">Entradas vendidas</div>
                </div>
                <div className="stat-card">
                  <div className="value">{moneda(ingresos, evento.currency)}</div>
                  <div className="label">Ingresos brutos</div>
                </div>
              </div>

              {tickets.length === 0 ? (
                <p className="empty-state">Todavia no hay tickets emitidos para este evento.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Asistente</th>
                        <th>Correo</th>
                        <th>Localidad</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.slice(0, 100).map((t) => (
                        <tr key={t._id}>
                          <td>{t.full_name || "—"}</td>
                          <td>{t.email || "—"}</td>
                          <td>{evento.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "—"}</td>
                          <td>{moneda(t.total_price || 0, evento.currency)}</td>
                          <td>
                            <span className={TICKET_BADGE[t.status] ?? "badge"}>{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tickets.length > 100 && <p className="muted">Mostrando 100 de {tickets.length} tickets.</p>}
                </div>
              )}
            </section>
          );
        })
      )}
    </>
  );
}
