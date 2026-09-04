import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroCarousel } from "@/components/hero-carousel";
import { EventSearchBar } from "@/components/event-search-bar";
import { Reveal } from "@/components/reveal";
import { imagenDeEvento } from "@/lib/event-visuals";
import { BLOG_POSTS } from "@/lib/blog-posts";

const CATEGORIAS_HOME = [
  {
    etiqueta: "Conciertos",
    categoria: "Concierto",
    icon: <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
  },
  {
    etiqueta: "Deportes",
    categoria: "Deportivo",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v6m0 6v6M4.2 7.8l5.3 3.9M14.5 12.3l5.3 3.9M4.2 16.2l5.3-3.9M14.5 11.7l5.3-3.9" />
      </>
    ),
  },
  {
    etiqueta: "Familiares",
    categoria: "Familiar",
    icon: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-6a3 3 0 1 1 0 6M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7M16 14c3.5.4 6 3.3 6 7" />,
  },
  {
    etiqueta: "Fiestas",
    categoria: "Festival",
    icon: <path d="m12 2 2.2 6.8H21l-5.6 4 2.2 6.8L12 15.6l-5.6 4 2.2-6.8L3 8.8h6.8L12 2Z" />,
  },
] as const;

// Shuffle deterministico (mismo resultado en server y cliente) para que
// "Recomendados" no muestre el mismo orden cronologico que "Proximos
// eventos" — se siente curado en vez de una copia de la misma lista.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, venue, city, starts_at, category, image_url")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true })
    .limit(30);

  const todos = eventos ?? [];
  const conFecha = todos.map((e) => ({
    ...e,
    fecha: new Date(e.starts_at).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }),
  }));

  const destacados = conFecha.slice(0, 6);
  const recomendados = [...conFecha].sort((a, b) => hashString(a.id) - hashString(b.id)).slice(0, 4);
  const proximos = conFecha.slice(0, 20);
  const ciudades = Array.from(new Set(todos.map((e) => e.city))).sort();

  return (
    <main className="home-sections">
      <div className="container-x">
        <EventSearchBar ciudades={ciudades} />
      </div>

      <div className="container-x">
        <Reveal>
          <HeroCarousel eventos={destacados} />
        </Reveal>
      </div>

      {recomendados.length > 0 && (
        <div className="container-x">
          <Reveal>
            <div className="section-head">
              <h2>Recomendados para ti</h2>
              <Link href="/eventos" className="nav-link">
                Ver todos →
              </Link>
            </div>
            <p className="recomendados-note">Una selección variada, distinta de tus próximos eventos por fecha.</p>
            <div className="recomendados-grid">
              {recomendados.map((e) => (
                <Link href={`/eventos/${e.id}`} key={e.id} className="recomendado-card">
                  <img src={e.image_url || imagenDeEvento(e.id, e.category, 500)} alt="" />
                  <span className="recomendado-badge">Recomendado</span>
                  <div className="recomendado-body">
                    {e.category && <p className="event-card-eyebrow">{e.category}</p>}
                    <h3>{e.name}</h3>
                    <p>
                      {e.city} · {e.fecha}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      )}

      <div className="container-x">
        <Reveal>
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
        </Reveal>
      </div>

      <div className="category-band">
        <div className="container-x">
        <Reveal>
          <div className="section-head">
            <h2>Explora por categoría</h2>
          </div>
          <div className="category-grid">
            {CATEGORIAS_HOME.map((c) => (
              <Link
                key={c.categoria}
                href={`/eventos?categoria=${encodeURIComponent(c.categoria)}`}
                className="category-tile"
              >
                <img src={imagenDeEvento(c.categoria, c.categoria, 500)} alt="" />
                <svg
                  className="category-tile-icon"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {c.icon}
                </svg>
                <h3>{c.etiqueta}</h3>
              </Link>
            ))}
          </div>
        </Reveal>
        </div>
      </div>

      <div className="blog-band">
        <div className="container-x">
          <Reveal>
            <div className="section-head">
              <h2>Desde el blog</h2>
              <Link href="/blog" className="nav-link">
                Ver todos →
              </Link>
            </div>
            <ul className="blog-grid">
              {BLOG_POSTS.slice(0, 5).map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="blog-card">
                    <div className="blog-card-media">
                      <img
                        src={`https://images.unsplash.com/photo-${post.imagenId}?w=700&q=70&auto=format&fit=crop`}
                        alt=""
                      />
                    </div>
                    <div className="blog-card-body">
                      <p className="blog-card-tag">{post.categoria}</p>
                      <h3>{post.titulo}</h3>
                      <p>{post.extracto}</p>
                      <p className="blog-card-meta">{post.minutosLectura} min de lectura</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
