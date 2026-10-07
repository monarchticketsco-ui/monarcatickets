import Link from "next/link";
import { notFound } from "next/navigation";
import { getFourvenuesEventBySlug } from "@/lib/fourvenues";
import { fechaEvento, horarioEvento, estadoTarifa, ARTISTAS_ETIQUETA } from "@/lib/fv-format";
import { ComprarBoton } from "./comprar-boton";

export const dynamic = "force-dynamic";

// Esta pagina es un espejo en vivo de FourVenues (Channel Manager API): nombre,
// fecha, lugar, tarifas, precios y disponibilidad salen de ahi. Pendiente por
// decidir (ver conversacion con Juan Manuel, sept 2026): codigo PULEP,
// responsable legal y terminos extra por evento no existen en FourVenues; si
// son requisito legal, hay que decidir donde viven (una tabla liviana en
// Supabase indexada por el slug del evento, sin tocar boletos ni precios).
export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const evento = await getFourvenuesEventBySlug(slug);

  if (!evento) notFound();

  const direccionCompleta =
    evento.location?.full_address || [evento.location?.name, evento.location?.city, "Colombia"].filter(Boolean).join(", ");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;

  const ficha: { valor: string; etiqueta: string }[] = [];
  if (evento.age) ficha.push({ valor: `${evento.age}+ años`, etiqueta: "Edad mínima" });
  if (evento.outfit) ficha.push({ valor: evento.outfit, etiqueta: "Dress code" });
  if (evento.music_genres?.length) ficha.push({ valor: evento.music_genres.map(ARTISTAS_ETIQUETA).join(", "), etiqueta: "Música" });
  if (evento.ambiences?.length) ficha.push({ valor: evento.ambiences.map(ARTISTAS_ETIQUETA).join(", "), etiqueta: "Ambiente" });

  const zonas = evento.ticket_rates ?? [];

  return (
    <main className="mq-scope mq-page">
      <div className="mq-noise" aria-hidden="true" />

      <section className="mq-event-hero">
        {evento.image_url && <div className="mq-event-hero-bg" style={{ backgroundImage: `url("${evento.image_url}")` }} />}
        <div className="mq-container mq-event-hero-inner">
          <div className="mq-eyebrow">
            <Link href="/eventos">← EVENTOS</Link>
          </div>
          <h1>{evento.name}</h1>
          <div className="mq-event-meta">
            <span className="mq-chip">
              <b>{fechaEvento(evento)}</b>
            </span>
            <span className="mq-chip">{horarioEvento(evento)}</span>
            {(evento.location?.name || evento.location?.city) && (
              <span className="mq-chip">{[evento.location?.name, evento.location?.city].filter(Boolean).join(" · ")}</span>
            )}
          </div>
        </div>
      </section>

      <div className="mq-container mq-body">
        <div className="mq-event-layout">
          <div className="mq-event-main">
            {evento.description && (
              <section>
                <div className="mq-eyebrow">EL EVENTO</div>
                <h2>Sobre esta experiencia</h2>
                <p className="mq-prose">{evento.description}</p>
              </section>
            )}

            {(evento.artists?.length ?? 0) > 0 && (
              <section>
                <div className="mq-eyebrow">LINE-UP</div>
                <h2>Artistas</h2>
                <div className="mq-artists">
                  {evento.artists!.map((a) => (
                    <div key={a.name} className="mq-artist">
                      {a.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url} alt="" width={44} height={44} />
                      )}
                      <b>{a.name}</b>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {ficha.length > 0 && (
              <section>
                <div className="mq-eyebrow">DETALLES</div>
                <h2>Antes de llegar</h2>
                <div className="mq-facts">
                  {ficha.map((f) => (
                    <div className="mq-fact" key={f.etiqueta}>
                      <small>{f.etiqueta}</small>
                      <strong>{f.valor}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mq-eyebrow">UBICACIÓN</div>
              <h2>{evento.location?.name || "Lugar del evento"}</h2>
              <p className="mq-prose" style={{ whiteSpace: "normal" }}>
                {direccionCompleta} ·{" "}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mq-textlink">
                  Cómo llegar (Google Maps)
                </a>
              </p>
              <div className="mq-map">
                <iframe
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${evento.location?.name ?? "la ubicación"}`}
                />
              </div>
            </section>

            <section>
              <div className="mq-eyebrow">LEGAL</div>
              <h2>Términos y condiciones</h2>
              <div className="mq-legal">
                <p>
                  Para evitar ser estafado, ten presente que Monarca Tickets no tiene vendedores ni promotores externos.
                  La originalidad de las entradas solo se verifica en la entrada del evento. Una vez confirmada la
                  compra, no hay reintegros de dinero, salvo cancelación o cambio informado por el organizador.
                </p>
                <p>
                  Consulta las{" "}
                  <Link href="/legal/condiciones" className="mq-textlink">
                    condiciones generales, política de privacidad y seguridad
                  </Link>{" "}
                  y la{" "}
                  <Link href="/legal/cancelaciones" className="mq-textlink">
                    política de cancelaciones y cambios
                  </Link>{" "}
                  de Monarca Tickets.
                </p>
              </div>
            </section>
          </div>

          <aside className="mq-event-side" id="boletos">
            <div className="mq-buy">
              <div className="mq-eyebrow">ENTRADAS</div>
              <h2>Boletos</h2>
              <p className="mq-buy-note">Los precios incluyen el cargo de servicio que se muestra en cada tarifa. El pago es seguro y se hace en una página externa.</p>

              {zonas.length === 0 ? (
                <div className="mq-empty-block" style={{ marginTop: 0, padding: 22 }}>
                  Todavía no hay boletos a la venta para este evento.
                </div>
              ) : (
                zonas.map((zona) => {
                  const precio = zona.current_price;
                  const disponibles = zona.availability?.available ?? 0;
                  const estado = estadoTarifa(zona);
                  const agotado = estado.tipo !== "disponible";
                  const pillClase =
                    estado.tipo === "disponible" ? "" : estado.tipo === "no-iniciada" ? " mq-pill-blue" : " mq-pill-red";

                  return (
                    <div className={`mq-rate${agotado ? " mq-rate-off" : ""}`} key={zona._id}>
                      <div className="mq-rate-head">
                        <h3>{zona.name}</h3>
                        {precio && <span className="mq-rate-price">${precio.price.toLocaleString("es-CO")}</span>}
                      </div>
                      {precio && (precio.includes || precio.additional_info) && (
                        <p className="mq-rate-sub">{[precio.includes, precio.additional_info].filter(Boolean).join(" · ")}</p>
                      )}
                      {precio && precio.fee_quantity > 0 && (
                        <p className="mq-rate-sub">
                          + {precio.fee_type === "percentage" ? `${precio.fee_quantity}% de servicio` : `$${precio.fee_quantity.toLocaleString("es-CO")} de servicio`}
                        </p>
                      )}
                      <div className="mq-rate-foot">
                        <span className={`mq-pill${pillClase}`}>{estado.texto}</span>
                      </div>
                      {!agotado && precio && (
                        <ComprarBoton
                          ticketRateId={zona._id}
                          priceId={precio._id}
                          disponibles={disponibles}
                          precioCop={precio.price}
                          feeType={precio.fee_type}
                          feeQuantity={precio.fee_quantity}
                          max={zona.max}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
