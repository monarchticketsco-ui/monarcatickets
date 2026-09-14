import Link from "next/link";
import { requireOrganizer } from "@/lib/organizer";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

export default async function PanelEventosPage() {
  const { supabase, organizer } = await requireOrganizer();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ marginBottom: 0 }}>Mis eventos</h1>
        <Link href="/panel/eventos/nuevo" className="btn btn-primary">
          + Crear evento
        </Link>
      </div>
      {!eventos || eventos.length === 0 ? (
        <p className="empty-state">Todavia no has creado ningun evento.</p>
      ) : (
        <ul className="list-plain">
          {eventos.map((e) => (
            <li key={e.id} className="card" style={{ padding: "16px 20px" }}>
              <Link
                href={`/panel/eventos/${e.id}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", textDecoration: "none", color: "inherit" }}
              >
                <span>
                  <strong>{e.name}</strong>
                  <span className="muted"> — {e.city} — {new Date(e.starts_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}</span>
                </span>
                <span className={ESTADO_BADGE[e.status] ?? "badge"}>{e.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
