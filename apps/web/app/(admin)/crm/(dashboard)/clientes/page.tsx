import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientesPage() {
  const { supabase } = await requireAdmin();

  const [{ data: perfiles }, { data: ordenesPagadas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("role", "comprador")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase.from("orders").select("user_id, total_cop").eq("status", "pagada"),
  ]);

  const admin = createAdminClient();
  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailPorId = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? "—"]));

  const statsPorCliente = new Map<string, { pedidos: number; total: number }>();
  for (const o of ordenesPagadas ?? []) {
    const prev = statsPorCliente.get(o.user_id) ?? { pedidos: 0, total: 0 };
    prev.pedidos += 1;
    prev.total += o.total_cop;
    statsPorCliente.set(o.user_id, prev);
  }

  const clientes = perfiles ?? [];

  return (
    <>
      <h1>Clientes</h1>
      <p className="page-lede">Compradores registrados en Monarca Tickets.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{clientes.length}</div>
          <div className="label">Clientes (ultimos 300)</div>
        </div>
      </div>

      {clientes.length === 0 ? (
        <p className="empty-state">Todavia no hay clientes registrados.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Telefono</th>
                <th>Cliente desde</th>
                <th>Pedidos pagados</th>
                <th>Total gastado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const stats = statsPorCliente.get(c.id) ?? { pedidos: 0, total: 0 };
                return (
                  <tr key={c.id}>
                    <td>{c.full_name ?? "—"}</td>
                    <td>{emailPorId.get(c.id) ?? "—"}</td>
                    <td>{c.phone ?? "—"}</td>
                    <td>{new Date(c.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>{stats.pedidos}</td>
                    <td>${stats.total.toLocaleString("es-CO")}</td>
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
