import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarCliente, eliminarCliente } from "../actions";
import { getFourvenuesTicketsByEmail } from "@/lib/fourvenues";
import { moneda } from "@/lib/fv-admin";
import { fechaCorta } from "@/lib/fv-format";

const TICKET_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: perfil } = await admin
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .eq("id", id)
    .single();

  if (!perfil || perfil.role !== "comprador") notFound();

  const { data: usuario } = await admin.auth.admin.getUserById(id);
  const correo = usuario?.user?.email ?? "—";

  const entradas = correo !== "—" ? await getFourvenuesTicketsByEmail(correo).catch(() => []) : [];
  const validas = entradas.filter(({ ticket }) => ticket.status !== "refunded" && ticket.status !== "cancelled");
  const totalGastado = validas.reduce((acc, { ticket }) => acc + (ticket.total_price || 0), 0);
  const actualizarClienteConId = actualizarCliente.bind(null, id);

  return (
    <>
      <p>
        <Link href="/crm/clientes" className="nav-link" style={{ padding: 0 }}>
          ← Volver a clientes
        </Link>
      </p>
      <h1 style={{ marginBottom: 0 }}>{perfil.full_name ?? "Cliente sin nombre"}</h1>
      <p className="page-lede">
        {correo} · Cliente desde {new Date(perfil.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{validas.length}</div>
          <div className="label">Entradas</div>
        </div>
        <div className="stat-card">
          <div className="value">{moneda(totalGastado)}</div>
          <div className="label">Total gastado</div>
        </div>
      </div>

      <h2>Editar cliente</h2>
      <div className="card" style={{ maxWidth: 480 }}>
        <form action={actualizarClienteConId} className="form" style={{ maxWidth: "none" }}>
          <div className="field">
            <label htmlFor="full_name">Nombre completo</label>
            <input id="full_name" name="full_name" type="text" defaultValue={perfil.full_name ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="phone">Telefono</label>
            <input id="phone" name="phone" type="tel" defaultValue={perfil.phone ?? ""} />
          </div>
          <p className="muted" style={{ fontSize: "0.82rem", margin: 0 }}>
            El correo no se puede editar aqui — es el usuario de acceso del cliente.
          </p>
          <button type="submit" className="btn btn-primary">
            Guardar cambios
          </button>
        </form>
      </div>

      <h2>Entradas (FourVenues)</h2>
      {entradas.length === 0 ? (
        <p className="empty-state">Este cliente todavia no tiene entradas compradas con este correo.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Fecha</th>
                <th>Localidad</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map(({ ticket, event }) => (
                <tr key={ticket._id}>
                  <td>{event.name}</td>
                  <td>{fechaCorta(event)}</td>
                  <td>{event.ticket_rates?.find((r) => r._id === ticket.ticket_rate_id)?.name ?? "—"}</td>
                  <td>{moneda(ticket.total_price || 0, event.currency)}</td>
                  <td>
                    <span className={TICKET_BADGE[ticket.status] ?? "badge"}>{ticket.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Eliminar cliente</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Elimina la cuenta y el acceso del cliente por completo. Sus entradas siguen existiendo en FourVenues, pero ya no va a poder iniciar sesion. Esta accion no se puede deshacer.
      </p>
      <form action={eliminarCliente.bind(null, id)}>
        <button type="submit" className="btn btn-secondary btn-sm">
          Eliminar cliente
        </button>
      </form>
    </>
  );
}
