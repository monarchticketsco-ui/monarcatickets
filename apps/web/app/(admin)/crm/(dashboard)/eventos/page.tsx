import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

export default async function CrmEventosPage() {
  const { supabase } = await requireAdmin();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, city, starts_at, status, organizers(legal_name)")
    .order("starts_at", { ascending: false })
    .limit(300);

  const items = eventos ?? [];

  return (
    <>
      <h1>Eventos</h1>
      <p className="page-lede">Todos los eventos de la plataforma, de todos los organizadores.</p>

      {items.length === 0 ? (
        <p className="empty-state">Todavia no hay eventos creados.</p>
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
