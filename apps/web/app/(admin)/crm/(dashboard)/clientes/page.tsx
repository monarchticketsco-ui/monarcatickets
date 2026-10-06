import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventosConTickets } from "@/lib/fv-admin";

export const dynamic = "force-dynamic";

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

  const { data: perfiles } = await query;

  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailPorId = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? "—"]));

  // Entradas y gasto salen de FourVenues (por correo del comprador), no de
  // la tabla local de ordenes.
  const statsPorCorreo = new Map<string, { pedidos: number; total: number }>();
  try {
    for (const { tickets } of await getEventosConTickets()) {
      for (const t of tickets) {
        if (t.status === "refunded" || t.status === "cancelled") continue;
        const k = (t.email || "").trim().toLowerCase();
        const prev = statsPorCorreo.get(k) ?? { pedidos: 0, total: 0 };
        prev.pedidos += 1;
        prev.total += t.total_price || 0;
        statsPorCorreo.set(k, prev);
      }
    }
  } catch {
    // FourVenues no respondio: las columnas quedan en 0.
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
                <th>Entradas</th>
                <th>Total gastado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const stats = statsPorCorreo.get((emailPorId.get(c.id) ?? "").toLowerCase()) ?? { pedidos: 0, total: 0 };
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
