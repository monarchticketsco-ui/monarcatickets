import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  await requireAdmin();

  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("id, full_name, phone, created_at")
    .eq("role", "comprador")
    .order("created_at", { ascending: false })
    .limit(300);

  if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

  const [{ data: perfiles }, { data: ordenesPagadas }] = await Promise.all([
    query,
    admin.from("orders").select("user_id, total_cop").eq("status", "pagada"),
  ]);

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
  const hayFiltros = Boolean(desde || hasta);
  const queryString = new URLSearchParams();
  if (desde) queryString.set("desde", desde);
  if (hasta) queryString.set("hasta", hasta);
  const exportHref = `/crm/clientes/export${queryString.toString() ? `?${queryString.toString()}` : ""}`;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ marginBottom: 0 }}>Clientes</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={exportHref} className="btn btn-secondary">
            Descargar CSV
          </a>
          <Link href="/crm/clientes/nuevo" className="btn btn-primary">
            + Crear cliente
          </Link>
        </div>
      </div>
      <p className="page-lede">Compradores registrados en Monarca Tickets.</p>

      <form className="form-row" style={{ marginBottom: 20, flexWrap: "wrap" }}>
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
          <Link href="/crm/clientes" className="nav-link" style={{ alignSelf: "flex-end", padding: "10px 0" }}>
            Limpiar filtros
          </Link>
        )}
      </form>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{clientes.length}</div>
          <div className="label">Clientes {hayFiltros ? "(filtrados)" : "(ultimos 300)"}</div>
        </div>
      </div>

      {clientes.length === 0 ? (
        <p className="empty-state">
          {hayFiltros ? "No hay clientes registrados en ese rango de fechas." : "Todavia no hay clientes registrados."}
        </p>
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
                    <td>
                      <Link href={`/crm/clientes/${c.id}`} className="nav-link" style={{ padding: 0 }}>
                        {c.full_name ?? "Sin nombre"}
                      </Link>
                    </td>
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
