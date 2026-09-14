import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualizarCliente, eliminarCliente } from "../actions";

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

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

  const { data: ordenes } = await admin
    .from("orders")
    .select("id, total_cop, status, created_at, events(name)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const items = ordenes ?? [];
  const totalGastado = items.filter((o) => o.status === "pagada").reduce((acc, o) => acc + o.total_cop, 0);
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
          <div className="value">{items.length}</div>
          <div className="label">Pedidos</div>
        </div>
        <div className="stat-card">
          <div className="value">${totalGastado.toLocaleString("es-CO")}</div>
          <div className="label">Total gastado (pagados)</div>
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

      <h2>Pedidos</h2>
      {items.length === 0 ? (
        <p className="empty-state">Este cliente todavia no ha hecho ningun pedido.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => {
                const evento = o.events as unknown as { name: string } | null;
                return (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>{evento?.name ?? "—"}</td>
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

      <h2>Eliminar cliente</h2>
      <p className="muted" style={{ maxWidth: "60ch" }}>
        Elimina la cuenta y el acceso del cliente por completo. Sus pedidos anteriores quedan en el historial de
        ordenes, pero ya no va a poder iniciar sesion. Esta accion no se puede deshacer.
      </p>
      <form action={eliminarCliente.bind(null, id)}>
        <button type="submit" className="btn btn-secondary btn-sm">
          Eliminar cliente
        </button>
      </form>
    </>
  );
}
