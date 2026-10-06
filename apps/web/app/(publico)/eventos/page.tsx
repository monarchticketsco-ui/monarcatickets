import Link from "next/link";
import { EventSearchBar } from "@/components/event-search-bar";
import { imagenDeEvento } from "@/lib/event-visuals";
import { getFourvenuesEvents } from "@/lib/fourvenues";
import { fechaCorta } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string; fecha?: string; categoria?: string }>;
}) {
  const { q, ciudad, fecha } = await searchParams;

  // Catalogo en vivo desde FourVenues (Channel Manager API) -- ya no se
  // lee la tabla local `events`. Ver lib/fourvenues.ts.
  let eventosFV: Awaited<ReturnType<typeof getFourvenuesEvents>> = [];
  let errorCatalogo = false;
  try {
    eventosFV = await getFourvenuesEvents();
  } catch {
    errorCatalogo = true;
  }

  const ciudades = Array.from(new Set(eventosFV.map((e) => e.location?.city).filter(Boolean))).sort();

  let eventos = eventosFV;
  if (q) {
    const qLower = q.toLowerCase();
    eventos = eventos.filter((e) => e.name.toLowerCase().includes(qLower));
  }
  if (ciudad) eventos = eventos.filter((e) => e.location?.city === ciudad);
  if (fecha) {
    eventos = eventos.filter((e) => (e.display_date || e.start_date)?.slice(0, 10) === fecha || e.start_date?.slice(0, 10) === fecha);
  }
  eventos = [...eventos].sort((a, b) => new Date(a.display_date || a.start_date).getTime() - new Date(b.display_date || b.start_date).getTime());

  const hayFiltros = Boolean(q || ciudad || fecha);

  return (
    <main className="container">
      <div className="page-lede" style={{ marginBottom: 8 }}>
        <h1>Eventos</h1>
        <p className="page-lede">Boletos disponibles ahora mismo en Colombia.</p>
      </div>

      <EventSearchBar ciudades={ciudades} defaultValues={{ q, ciudad, fecha }} />

      {errorCatalogo && (
        <p className="empty-state">
          No pudimos cargar el catalogo de eventos en este momento. Intenta de nuevo en unos minutos.
        </p>
      )}

      {!errorCatalogo && hayFiltros && (
        <p className="muted" style={{ marginTop: -24, marginBottom: 24 }}>
          {eventos.length} resultado{eventos.length === 1 ? "" : "s"} ·{" "}
          <Link href="/eventos" className="nav-link" style={{ padding: 0 }}>
            Limpiar filtros
          </Link>
        </p>
      )}

      {!errorCatalogo && eventos.length === 0 ? (
        <p className="empty-state">
          {hayFiltros ? "No encontramos eventos con esos filtros." : "No hay eventos en venta todavia."}
        </p>
      ) : (
        !errorCatalogo && (
          <ul className="event-grid">
            {eventos.map((e) => (
              <li key={e._id}>
                <Link href={`/eventos/${e.slug}`} className="event-card">
                  <div className="event-card-media">
                    <img src={e.image_url || imagenDeEvento(e._id, undefined, 500)} alt="" decoding="async" />
                  </div>
                  <div className="event-card-body">
                    <h3>{e.name}</h3>
                    <p className="muted">
                      {e.location?.city} ·{" "}
                      {fechaCorta(e)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </main>
  );
}
