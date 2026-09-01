import Link from "next/link";
import { requireOrganizer } from "@/lib/organizer";

const ESTADO_BADGE: Record<string, string> = {
  borrador: "badge",
  publicado: "badge badge-blue",
  en_venta: "badge badge-green",
  finalizado: "badge",
  cancelado: "badge badge-danger",
};

const DIAN_BADGE: Record<string, string> = {
  no_habilitado: "badge badge-danger",
  en_proceso: "badge badge-warning",
  habilitado: "badge badge-green",
};

export default async function PanelOrganizadorPage() {
  const { supabase, organizer } = await requireOrganizer();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });

  return (
    <main className="container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
        <h1 style={{ marginBottom: 0 }}>{organizer.legal_name}</h1>
        <Link href="/panel/eventos/nuevo" className="btn btn-primary">
          + Crear evento
        </Link>
      </div>
      <p className="muted">
        Estado DIAN: <span className={DIAN_BADGE[organizer.dian_status] ?? "badge"}>{organizer.dian_status}</span>
        {organizer.dian_status !== "habilitado" && " — no vas a poder publicar boletos en venta hasta habilitarte."}
      </p>

      <h2>Tus eventos</h2>
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
                  <span className="muted"> — {e.city} — {new Date(e.starts_at).toLocaleDateString("es-CO")}</span>
                </span>
                <span className={ESTADO_BADGE[e.status] ?? "badge"}>{e.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
