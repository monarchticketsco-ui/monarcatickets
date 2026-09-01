import { requireAdmin } from "@/lib/admin";
import { actualizarDianStatus } from "./actions";

const ESTADOS_DIAN = ["no_habilitado", "en_proceso", "habilitado"] as const;

const DIAN_BADGE: Record<string, string> = {
  no_habilitado: "badge badge-danger",
  en_proceso: "badge badge-warning",
  habilitado: "badge badge-green",
};

const ORDEN_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
};

export default async function CrmPage() {
  const { supabase } = await requireAdmin();

  const [organizersRes, eventsRes, ordenesRecientesRes, pagadasRes] = await Promise.all([
    supabase
      .from("organizers")
      .select("id, legal_name, nit, dian_status, commission_rate, events(count)")
      .order("legal_name", { ascending: true }),
    supabase.from("events").select("id, status"),
    supabase
      .from("orders")
      .select("id, total_cop, status, created_at, events(name), profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("orders").select("total_cop").eq("status", "pagada"),
  ]);

  const organizadores = organizersRes.data ?? [];
  const eventos = eventsRes.data ?? [];
  const ordenesRecientes = ordenesRecientesRes.data ?? [];
  const ingresosTotalesCop = (pagadasRes.data ?? []).reduce((acc, o) => acc + o.total_cop, 0);

  const eventosPorEstado = eventos.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  const resumenEstados =
    Object.entries(eventosPorEstado)
      .map(([estado, cantidad]) => `${estado}: ${cantidad}`)
      .join(" · ") || "sin eventos";

  return (
    <main className="container">
      <h1>CRM — Monarca Tickets</h1>
      <p className="page-lede">Panel interno para revisar organizadores, habilitacion DIAN y ordenes de la plataforma.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{organizadores.length}</div>
          <div className="label">Organizadores</div>
        </div>
        <div className="stat-card">
          <div className="value">{eventos.length}</div>
          <div className="label">Eventos totales</div>
        </div>
        <div className="stat-card">
          <div className="value">${ingresosTotalesCop.toLocaleString("es-CO")}</div>
          <div className="label">Ingresos confirmados COP</div>
        </div>
        <div className="stat-card">
          <div className="value" style={{ fontSize: "1rem" }}>{resumenEstados}</div>
          <div className="label">Eventos por estado</div>
        </div>
      </div>

      <h2>Organizadores</h2>
      {organizadores.length === 0 ? (
        <p className="empty-state">Todavia no hay organizadores registrados.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Razon social</th>
                <th>NIT</th>
                <th>Comision</th>
                <th>Eventos</th>
                <th>Estado DIAN</th>
                <th>Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {organizadores.map((o) => {
                const totalEventos = Array.isArray(o.events) ? (o.events[0]?.count ?? 0) : 0;
                return (
                  <tr key={o.id}>
                    <td>{o.legal_name}</td>
                    <td>{o.nit}</td>
                    <td>{o.commission_rate}%</td>
                    <td>{totalEventos}</td>
                    <td>
                      <span className={DIAN_BADGE[o.dian_status] ?? "badge"}>{o.dian_status}</span>
                    </td>
                    <td>
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          const nuevoEstado = String(formData.get("dian_status")) as
                            | "no_habilitado"
                            | "en_proceso"
                            | "habilitado";
                          await actualizarDianStatus(o.id, nuevoEstado);
                        }}
                        style={{ display: "flex", gap: 8 }}
                      >
                        <select name="dian_status" defaultValue={o.dian_status} style={{ minWidth: 140 }}>
                          {ESTADOS_DIAN.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-secondary btn-sm">
                          Guardar
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>Ordenes recientes</h2>
      {ordenesRecientes.length === 0 ? (
        <p className="empty-state">Todavia no hay ordenes.</p>
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
              {ordenesRecientes.map((orden) => {
                const evento = orden.events as unknown as { name: string } | null;
                const comprador = orden.profiles as unknown as { full_name: string | null } | null;
                return (
                  <tr key={orden.id}>
                    <td>{new Date(orden.created_at).toLocaleString("es-CO")}</td>
                    <td>{evento?.name ?? "—"}</td>
                    <td>{comprador?.full_name ?? "—"}</td>
                    <td>${orden.total_cop.toLocaleString("es-CO")}</td>
                    <td>
                      <span className={ORDEN_BADGE[orden.status] ?? "badge"}>{orden.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
