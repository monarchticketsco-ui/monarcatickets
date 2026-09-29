import { notFound } from "next/navigation";
import { imagenDeEvento } from "@/lib/event-visuals";
import { getFourvenuesEventBySlug } from "@/lib/fourvenues";
import { ComprarBoton } from "./comprar-boton";

export const dynamic = "force-dynamic";

// NOTA IMPORTANTE (ver conversacion con Juan Manuel, sept 2026): esta
// pagina dejo de leer Supabase (`events`/`ticket_types`) y ahora es un
// espejo en vivo de FourVenues (Channel Manager API). FourVenues no
// tiene equivalente para varios campos que la version anterior si
// mostraba -- codigo PULEP, responsable legal (razon social/NIT),
// terminos extra por evento, ni el mapa de localidades por imagen. Se
// omiten por ahora: si son un requisito legal para Colombia (PULEP lo
// es), hay que decidir donde vuelven a vivir -- lo mas simple es una
// tablita liviana en Supabase indexada por el slug del evento de
// FourVenues, sin tocar boletos/ordenes/precios.
export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const evento = await getFourvenuesEventBySlug(slug);

  if (!evento) notFound();

  const direccionCompleta = evento.location?.full_address || [evento.location?.name, evento.location?.city, "Colombia"].filter(Boolean).join(", ");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;

  const ficha: { valor: string; etiqueta: string }[] = [];
  if (evento.age) ficha.push({ valor: `${evento.age}+ anos`, etiqueta: "Edad minima" });
  if (evento.outfit) ficha.push({ valor: evento.outfit, etiqueta: "Dress code" });

  const zonas = evento.ticket_rates ?? [];

  return (
    <main className="container">
      <div
        className="hero-slide"
        style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: 28 }}
      >
        <img src={evento.image_url || imagenDeEvento(evento._id, undefined, 1400)} alt="" />
        <div className="hero-slide-scrim" />
        <div className="hero-slide-content" style={{ maxWidth: "none" }}>
          <h1 style={{ margin: "6px 0 0" }}>{evento.name}</h1>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <p className="page-lede">
          {evento.location?.name} · {evento.location?.city} ·{" "}
          {new Date(evento.start_date).toLocaleString("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "America/Bogota",
          })}
        </p>
        {evento.description && <p>{evento.description}</p>}
      </div>

      {ficha.length > 0 && (
        <section className="event-section">
          <h2>Detalles del evento</h2>
          <div className="stat-grid" style={{ margin: 0 }}>
            {ficha.map((f) => (
              <div className="stat-card" key={f.etiqueta}>
                <div className="value" style={{ fontSize: "1.15rem" }}>{f.valor}</div>
                <div className="label">{f.etiqueta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="event-section">
        <h2>Ubicacion</h2>
        <p className="muted" style={{ margin: "0 0 16px" }}>
          {evento.location?.name} — {evento.location?.city}
          {" · "}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-link">
            Como llegar (Google Maps)
          </a>
        </p>
        <div className="map-embed" style={{ margin: 0 }}>
          <iframe src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa de ${evento.location?.name}`} />
        </div>
      </section>

      <section className="event-section">
        <h2>Boletos</h2>
        {zonas.length === 0 ? (
          <p className="empty-state">Todavia no hay boletos a la venta para este evento.</p>
        ) : (
          <div className="ticket-zones">
            {zonas.map((zona) => {
              const precio = zona.current_price;
              const disponibles = zona.availability?.available ?? 0;
              const agotado = disponibles <= 0 || !zona.available;

              return (
                <div className="ticket-zone" key={zona._id}>
                  <div className="ticket-zone-head">
                    <h3>{zona.name}</h3>
                    {precio && <span className="muted price">${precio.price.toLocaleString("es-CO")} COP</span>}
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Precio</th>
                          <th>Disponibilidad</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={agotado ? "ticket-row-inactiva" : undefined}>
                          <td className="price-cell">
                            <div>${precio?.price.toLocaleString("es-CO") ?? "—"}</div>
                            {precio && precio.fee_quantity > 0 && (
                              <div className="price-fee-note">
                                + {precio.fee_type === "percentage" ? `${precio.fee_quantity}% servicio` : `$${precio.fee_quantity.toLocaleString("es-CO")} servicio`}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={agotado ? "badge badge-danger" : "badge badge-green"}>
                              {agotado ? "Agotado" : `${disponibles} disponibles`}
                            </span>
                          </td>
                          <td className="ticket-action-cell">
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
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="event-section">
        <h2>Terminos y condiciones</h2>
        <p className="muted">
          Para evitar ser estafado, ten presente que Monarca Tickets no tiene vendedores ni promotores externos. La
          originalidad de las entradas solo se verifica en la entrada del evento. Una vez confirmada la compra, no hay
          reintegros de dinero, salvo cancelacion o cambio informado por el organizador.
        </p>
        <p className="muted" style={{ margin: 0 }}>
          Consulta las{" "}
          <a href="/legal/condiciones" className="text-link">
            condiciones generales, politica de privacidad y seguridad
          </a>{" "}
          y la{" "}
          <a href="/legal/cancelaciones" className="text-link">
            politica de cancelaciones y cambios
          </a>{" "}
          de Monarca Tickets.
        </p>
      </section>
    </main>
  );
}
