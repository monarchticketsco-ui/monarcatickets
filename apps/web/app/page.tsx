import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/hero-carousel";
import { EventSearchBar } from "@/components/event-search-bar";
import { imagenDeEvento } from "@/lib/event-visuals";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, venue, city, starts_at, category")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true })
    .limit(24);

  const todos = eventos ?? [];
  const destacados = todos.slice(0, 5);
  const proximos = todos.slice(0, 8);
  const ciudades = Array.from(new Set(todos.map((e) => e.city))).sort();

  return (
    <main className="container">
      <HeroCarousel eventos={destacados} />
      <EventSearchBar ciudades={ciudades} />

      <div className="section-head">
        <h2>Próximos eventos</h2>
        <Link href="/eventos" className="nav-link">
          Ver todos →
        </Link>
      </div>

      {proximos.length === 0 ? (
        <p className="empty-state">No hay eventos en venta todavia.</p>
      ) : (
        <ul className="event-grid">
          {proximos.map((e) => (
            <li key={e.id}>
              <Link href={`/eventos/${e.id}`} className="event-card">
                <div className="event-card-media">
                  <img src={imagenDeEvento(e.id, e.category, 500)} alt="" />
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
