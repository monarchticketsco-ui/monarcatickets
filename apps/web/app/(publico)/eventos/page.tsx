import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Catalogo publico — solo eventos publicados/en venta (lo aplica la
// policy events_select_public_or_owner). Filtro por ciudad/categoria
// se agrega cuando haya suficientes eventos para justificarlo.
export default async function EventosPage() {
  const supabase = await createClient();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, venue, city, starts_at, category")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true });

  return (
    <main className="container">
      <div className="page-lede" style={{ marginBottom: 28 }}>
        <h1>Eventos</h1>
        <p className="page-lede">Boletos disponibles ahora mismo en Colombia.</p>
      </div>

      {!eventos || eventos.length === 0 ? (
        <p className="empty-state">No hay eventos en venta todavia.</p>
      ) : (
        <ul className="event-grid">
          {eventos.map((e) => (
            <li key={e.id}>
              <Link href={`/eventos/${e.id}`} className="event-card">
                {e.category && <p className="event-card-eyebrow">{e.category}</p>}
                <h3>{e.name}</h3>
                <p className="muted">
                  {e.city} · {new Date(e.starts_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
