import Link from "next/link";
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

const CUENTA = [
  {
    titulo: "Todo desde tu cuenta",
    texto: "Consulta tus entradas y el historial de tus eventos desde un solo lugar.",
    pronto: false,
  },
  { titulo: "Cashless Monarca", texto: "Recarga saldo antes del evento y disfruta sin efectivo.", pronto: true },
  { titulo: "Tu manilla. Tu cuenta.", texto: "Vincula tu manilla Monarca a tu perfil y administra tu saldo.", pronto: true },
  {
    titulo: "Tu saldo bajo control",
    texto: "Consulta tus consumos y administra tu saldo después del evento.",
    pronto: true,
  },
];

export default async function HomePage() {
  // Los eventos vienen siempre de FourVenues (motor de ticketing). Nada de esta
  // portada es dato propio: si FourVenues no tiene eventos vigentes, se dice.
  const eventosFV = await getFourvenuesEvents().catch(() => []);

  const eventos = eventosFV
    .filter((e) => eventoVigente(e))
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      city: e.location?.city ?? "",
      fecha: e.display_date || e.start_date,
      inicio: e.start_date,
      image: e.image_url || null,
    }))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const ciudades = Array.from(new Set(eventosFV.map((e) => e.location?.city).filter(Boolean) as string[])).sort();
  const proximo = eventos[0];
  const destacados = eventos.slice(0, 12);
  const usarMarquee = destacados.length >= 5;

  const tarjeta = (e: (typeof destacados)[number], key: string) => (
    <Link
      key={key}
      href={`/eventos/${e.slug}`}
      className="mq-ev"
      style={
        {
          "--c": COLORES[hashString(e.slug) % COLORES.length],
          ...(e.image
            ? { backgroundImage: `linear-gradient(180deg, transparent 25%, #040812ee), url("${e.image}")` }
            : {}),
        } as React.CSSProperties
      }
    >
      <b>{e.name}</b>
      <span>
        {diaMes(e.fecha)}
        {e.city ? ` · ${e.city}` : ""}
      </span>
    </Link>
  );

  const pista = (lista: typeof destacados, reverse: boolean, prefix: string) => {
    // Se repite hasta cubrir el ancho y se duplica para que el bucle sea continuo.
    let base = lista;
    while (base.length < 8) base = base.concat(lista);
    const doble = base.concat(base);
    return (
      <div className="mq-marquee">
        <div className={`mq-track${reverse ? " mq-reverse" : ""}`}>
          {doble.map((e, i) => tarjeta(e, `${prefix}-${i}`))}
        </div>
      </div>
    );
  };

  return (
    <main className="mq-scope mq-home">
      <div className="mq-noise" aria-hidden="true" />

      <section className="mq-container mq-hero" style={{ position: "relative", zIndex: 2 }}>
        <div>
          <div className="mq-eyebrow">MONARCA TICKETS · COLOMBIA</div>
          <h1>
            Vive más.
            <br />
            <span className="mq-gradient-text">Nosotros movemos el acceso.</span>
          </h1>
          <p className="mq-lead">
            Descubre experiencias, administra tus entradas y llega al evento con todo listo desde un mismo lugar.
          </p>
          <form className="mq-searchbox" action="/eventos" method="get">
            <input name="q" type="search" placeholder="Evento, artista o lugar" aria-label="Evento, artista o lugar" />
            <select name="ciudad" aria-label="Ciudad" defaultValue="">
              <option value="">Ciudad</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input name="fecha" type="date" aria-label="Fecha" />
            <button type="submit" className="mq-btn mq-primary">
              Buscar
            </button>
          </form>
        </div>

        <div className="mq-hero-visual" aria-hidden="true">
          <div className="mq-orb" />
          <div className="mq-ticket mq-big">
            <div className="mq-eyebrow">TICKET DIGITAL</div>
            {proximo ? (
              <>
                <h2>{proximo.name}</h2>
                <p className="mq-sub">{proximo.city || "Colombia"}</p>
                <div className="mq-line" />
                <div className="mq-row">
                  <div>
                    <small>
                      {new Date(proximo.fecha)
                        .toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ })
                        .replace(".", "")
                        .toUpperCase()}
                    </small>
                    <br />
                    <span className="mq-time">
                      {new Date(proximo.inicio).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: TZ,
                      })}
                    </span>
                  </div>
                  <div className="mq-qr" />
                </div>
              </>
            ) : (
              <>
                <h2>
                  Tu próximo
                  <br />
                  evento
                </h2>
                <p className="mq-sub">Colombia</p>
                <div className="mq-line" />
                <div className="mq-row">
                  <div>
                    <small>MUY PRONTO</small>
                  </div>
                  <div className="mq-qr" />
                </div>
              </>
            )}
          </div>
          <div className="mq-ticket mq-small">
            <div className="mq-wingline" />
            <h3>
              Tu experiencia
              <br />
              comienza aquí.
            </h3>
            <small className="mq-tagline">Accede · Vive · Recuerda</small>
          </div>
        </div>
      </section>

      <section className="mq-section">
        <div className="mq-container">
          <div className="mq-eyebrow">PRÓXIMAS EXPERIENCIAS</div>
          <h2>Eventos destacados</h2>
        </div>
        {destacados.length === 0 ? (
          <div className="mq-container">
            <div className="mq-empty">Estamos preparando los próximos eventos. Vuelve pronto.</div>
          </div>
        ) : usarMarquee ? (
          <>
            {pista(destacados, false, "a")}
            {pista([...destacados].reverse(), true, "b")}
          </>
        ) : (
          <div className="mq-container">
            <div className="mq-static-row">{destacados.map((e) => tarjeta(e, e.slug))}</div>
          </div>
        )}
        <div className="mq-container mq-more">
          <Link href="/eventos" className="mq-btn">
            Ver todos los eventos →
          </Link>
        </div>
      </section>

      <section className="mq-section">
        <div className="mq-container">
          <div className="mq-eyebrow">TU CUENTA MONARCA</div>
          <h2>
            Tu evento, más simple
            <br />
            de principio a fin.
          </h2>
          <div className="mq-benefits">
            {CUENTA.map((x, i) => (
              <div className="mq-card" key={x.titulo}>
                <div className="mq-icon-dot" />
                <small>
                  0{i + 1}
                  {x.pronto && <span className="mq-soon">Próximamente</span>}
                </small>
                <h3>{x.titulo}</h3>
                <p>{x.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mq-section">
        <div className="mq-container mq-cta-panel">
          <div>
            <div className="mq-eyebrow">MONARCA PARA ORGANIZADORES</div>
            <h2>
              Tu evento merece más
              <br />
              que una ticketera.
            </h2>
            <p className="mq-section-copy">Vende, administra y entiende tu evento desde un solo ecosistema.</p>
          </div>
          <Link href="/empresas" className="mq-btn mq-primary">
            Conoce Monarca para Organizadores
          </Link>
        </div>
      </section>
    </main>
  );
}
