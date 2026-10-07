import Link from "next/link";
import { EventSearchBar } from "@/components/event-search-bar";
import { getFourvenuesEvents } from "@/lib/fourvenues";
import { eventoVigente } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

const TZ = "America/Bogota";
const COLORES = ["#176bff", "#1ed7dd", "#35e27b", "#725cff", "#1188ff", "#20d6a4"];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function diaMes(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("es-CO", { day: "2-digit", month: "short", timeZone: TZ })
    .replace(".", "")
    .toUpperCase();
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ciudad?: string; fecha?: string }>;
}) {
  const { q, ciudad, fecha } = await searchParams;

  // Catalogo en vivo desde FourVenues (Channel Manager API): no se lee
  // ninguna tabla local de eventos. Ver lib/fourvenues.ts.
  let eventosFV: Awaited<ReturnType<typeof getFourvenuesEvents>> = [];
  let errorCatalogo = false;
  try {
    eventosFV = await getFourvenuesEvents();
  } catch {
    errorCatalogo = true;
  }

  const ciudades = Array.from(new Set(eventosFV.map((e) => e.location?.city).filter(Boolean) as string[])).sort();

  let eventos = eventosFV;
  if (q) {
    const qLower = q.toLowerCase();
    eventos = eventos.filter(
      (e) => e.name.toLowerCase().includes(qLower) || (e.location?.name ?? "").toLowerCase().includes(qLower)
    );
  }
  if (ciudad) eventos = eventos.filter((e) => e.location?.city === ciudad);
  if (fecha) {
    eventos = eventos.filter(
      (e) => (e.display_date || e.start_date)?.slice(0, 10) === fecha || e.start_date?.slice(0, 10) === fecha
    );
  }
  eventos = [...eventos].sort(
    (a, b) => new Date(a.display_date || a.start_date).getTime() - new Date(b.display_date || b.start_date).getTime()
  );

  const hayFiltros = Boolean(q || ciudad || fecha);

  return (
    <main className="mq-scope mq-page">
      <div className="mq-noise" aria-hidden="true" />

      <div className="mq-container mq-page-head">
        <div className="mq-eyebrow">EXPERIENCIAS MONARCA</div>
        <h1>Encuentra lo que te mueve.</h1>
        <p className="mq-lead">Boletos disponibles ahora mismo en Colombia.</p>
        <EventSearchBar ciudades={ciudades} defaultValues={{ q, ciudad, fecha }} />
      </div>

      <div className="mq-container mq-body">
        {errorCatalogo && (
          <div className="mq-empty-block">
            No pudimos cargar el catálogo de eventos en este momento. Intenta de nuevo en unos minutos.
          </div>
        )}

        {!errorCatalogo && hayFiltros && (
          <p className="mq-results">
            {eventos.length} resultado{eventos.length === 1 ? "" : "s"} · <Link href="/eventos">Limpiar filtros</Link>
          </p>
        )}

        {!errorCatalogo && eventos.length === 0 && (
          <div className="mq-empty-block">
            {hayFiltros ? "No encontramos eventos con esos filtros." : "Estamos preparando los próximos eventos. Vuelve pronto."}
          </div>
        )}

        {!errorCatalogo && eventos.length > 0 && (
          <ul className="mq-grid">
            {eventos.map((e) => {
              const desde = (e.ticket_rates ?? [])
                .filter((t) => t.available && t.current_price)
                .map((t) => t.current_price!.price)
                .sort((a, b) => a - b)[0];
              const agotado = (e.ticket_rates ?? []).length > 0 && desde === undefined;
              return (
                <li key={e._id}>
                  <Link
                    href={`/eventos/${e.slug}`}
                    className="mq-ev"
                    style={
                      {
                        "--c": COLORES[hashString(e.slug) % COLORES.length],
                        ...(e.image_url
                          ? { backgroundImage: `linear-gradient(180deg, transparent 25%, #040812ee), url("${e.image_url}")` }
                          : {}),
                      } as React.CSSProperties
                    }
                  >
                    {!eventoVigente(e) && <span className="mq-ev-flag">Finalizado</span>}
                    {eventoVigente(e) && agotado && <span className="mq-ev-flag">Agotado</span>}
                    <b>{e.name}</b>
                    <span>
                      {diaMes(e.display_date || e.start_date)}
                      {e.location?.city ? ` · ${e.location.city}` : ""}
                    </span>
                    {desde !== undefined && <em className="mq-ev-price">Desde ${desde.toLocaleString("es-CO")}</em>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
