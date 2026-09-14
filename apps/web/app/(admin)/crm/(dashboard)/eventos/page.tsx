import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

export default async function CrmEventosPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("events")
    .select("id, name, city, starts_at, status, organizers(legal_name)")
    .order("starts_at", { ascending: false })
    .limit(300);

  if (desde) query = query.gte("starts_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("starts_at", `${hasta}T23:59:59`);

  const { data: eventos } = await query;
  const items = eventos ?? [];
  const hayFiltros = Boolean(desde || hasta);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ marginBottom: 0 }}>Eventos</h1>
        <Link href="/crm/eventos/nuevo" className="btn btn-primary">
          + Crear evento
        </Link>
      </div>
      <p className="page-lede">Todos los eventos de la plataforma, de todos los organizadores.</p>

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
          <Link href="/crm/eventos" className="nav-link" style={{ alignSelf: "flex-end", padding: "10px 0" }}>
            Limpiar filtros
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="empty-state">
          {hayFiltros ? "No hay eventos en ese rango de fechas." : "Todavia no hay eventos creados."}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Organizador</th>
                <th>Ciudad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => {
                const organizador = e.organizers as unknown as { legal_name: string } | null;
                return (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{organizador?.legal_name ?? "—"}</td>
                    <td>{e.city}</td>
                    <td>{new Date(e.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</td>
                    <td>
                      <span className={ESTADO_BADGE[e.status] ?? "badge"}>{e.status}</span>
                    </td>
                    <td>
                      <Link href={`/crm/eventos/${e.id}`} className="btn btn-secondary btn-sm">
                        Editar
                      </Link>
                    </td>
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
