import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarFichaOrganizador } from "../actions";
import { getFourvenuesEventById, getFourvenuesTicketsByEvent } from "@/lib/fourvenues";
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

  const eventoAsignado = organizador.fourvenues_event_id
    ? await getFourvenuesEventById(organizador.fourvenues_event_id)
    : null;
  const tickets = eventoAsignado ? await getFourvenuesTicketsByEvent(eventoAsignado._id) : [];
  const validos = tickets.filter((t) => t.status !== "refunded" && t.status !== "cancelled");
  const ingresos = validos.reduce((acc, t) => acc + (t.total_price || 0), 0);

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
                Porcentaje acordado con el Polinizador. El cobro al comprador (precio + cargo por servicio) lo define y procesa FourVenues.
              </p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="fourvenues_event_id">Evento de FourVenues asignado (Panel Polinizador)</label>
            <input
              id="fourvenues_event_id"
              name="fourvenues_event_id"
              type="text"
              placeholder="ID del evento en FourVenues (ej. gss0259prb0doouygcgf7y2rdc1q6prm)"
              defaultValue={organizador.fourvenues_event_id ?? ""}
            />
            <p className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0" }}>
              {eventoAsignado
                ? `Evento actual: ${eventoAsignado.name} (${eventoAsignado.slug}).`
                : organizador.fourvenues_event_id
                  ? "No se encontro ese evento en FourVenues — revisa el ID."
                  : "Sin evento asignado todavia: el Panel Polinizador de este organizador mostrara un aviso."}
              {" "}El ID se copia de FourVenues (Management lo asigna, uno por organizador por ahora).
            </p>
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

      <h2>Evento y ventas (FourVenues)</h2>
      {!eventoAsignado ? (
        <p className="empty-state">
          Este Polinizador todavia no tiene un evento de FourVenues asignado. Asignalo en la ficha (campo "Evento de
          FourVenues asignado") para que vea sus ventas en su panel.
        </p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="value" style={{ fontSize: "1.05rem" }}>{eventoAsignado.name}</div>
              <div className="label">{fechaCorta(eventoAsignado)} · {eventoAsignado.location?.name}</div>
            </div>
            <div className="stat-card">
              <div className="value">{validos.length}</div>
              <div className="label">Entradas vendidas</div>
            </div>
            <div className="stat-card">
              <div className="value">{moneda(ingresos, eventoAsignado.currency)}</div>
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
                      <td>{eventoAsignado.ticket_rates?.find((r) => r._id === t.ticket_rate_id)?.name ?? "—"}</td>
                      <td>{moneda(t.total_price || 0, eventoAsignado.currency)}</td>
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
        </>
      )}
    </>
  );
}
