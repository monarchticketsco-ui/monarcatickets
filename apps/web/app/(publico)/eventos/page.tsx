import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventSearchBar } from "@/components/event-search-bar";
import { imagenDeEvento } from "@/lib/event-visuals";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string; fecha?: string; categoria?: string }>;
}) {
  const { q, ciudad, fecha, categoria } = await searchParams;
  const supabase = await createClient();

  // Ciudades para el selector del buscador — se calculan sobre el
  // catalogo completo (sin filtros) para que la lista no cambie al buscar.
  const { data: todosLosEventos } = await supabase
    .from("events")
    .select("city")
    .in("status", ["publicado", "en_venta"]);
  const ciudades = Array.from(new Set((todosLosEventos ?? []).map((e) => e.city))).sort();

  let query = supabase
    .from("events")
    .select("id, name, venue, city, starts_at, category, image_url")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true });

  if (q) query = query.ilike("name", `%${q}%`);
  if (ciudad) query = query.eq("city", ciudad);
  if (categoria) query = query.eq("category", categoria);
  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59`);
    query = query.gte("starts_at", inicio.toISOString()).lte("starts_at", fin.toISOString());
  }

  const { data: eventos } = await query;
  const hayFiltros = Boolean(q || ciudad || fecha || categoria);

  return (
    <main className="container">
      <div className="page-lede" style={{ marginBottom: 8 }}>
        <h1>Eventos</h1>
        <p className="page-lede">Boletos disponibles ahora mismo en Colombia.</p>
      </div>

      <EventSearchBar ciudades={ciudades} defaultValues={{ q, ciudad, fecha, categoria }} />

      {hayFiltros && (
        <p className="muted" style={{ marginTop: -24, marginBottom: 24 }}>
          {eventos?.length ?? 0} resultado{eventos?.length === 1 ? "" : "s"} ·{" "}
          <Link href="/eventos" className="nav-link" style={{ padding: 0 }}>
            Limpiar filtros
          </Link>
        </p>
      )}

      {!eventos || eventos.length === 0 ? (
        <p className="empty-state">
          {hayFiltros ? "No encontramos eventos con esos filtros." : "No hay eventos en venta todavia."}
        </p>
      ) : (
        <ul className="event-grid">
          {eventos.map((e) => (
            <li key={e.id}>
              <Link href={`/eventos/${e.id}`} className="event-card">
                <div className="event-card-media">
                  <img src={e.image_url || imagenDeEvento(e.id, e.category, 500)} alt="" />
                  {e.category && <p className="event-card-eyebrow">{e.category}</p>}
                </div>
                <div className="event-card-body">
                  <h3>{e.name}</h3>
                  <p className="muted">
                    {e.city} ·{" "}
                    {new Date(e.starts_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
