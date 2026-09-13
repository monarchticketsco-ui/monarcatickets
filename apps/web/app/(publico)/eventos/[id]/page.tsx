import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { imagenDeEvento } from "@/lib/event-visuals";
import { ComprarBoton } from "./comprar-boton";

const ACOMODACION: Record<string, string> = {
  libre: "En orden de llegada",
  numerada: "Numerada",
};

type TicketTypeRow = {
  id: string;
  name: string;
  price_cop: number;
  capacity: number;
  sold_count: number;
  etapa: string | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
};

// Agrupa los tipos de boleto por localidad (name) preservando el orden de
// aparicion, y ordena cada grupo cronologicamente (preventa antes que
// etapas siguientes) para que se lea como una tabla de precios por zona,
// no como una lista plana de 15 filas sueltas.
function agruparPorLocalidad(tipos: TicketTypeRow[]) {
  const orden: string[] = [];
  const grupos = new Map<string, TicketTypeRow[]>();
  for (const t of tipos) {
    if (!grupos.has(t.name)) {
      grupos.set(t.name, []);
      orden.push(t.name);
    }
    grupos.get(t.name)!.push(t);
  }
  return orden
    .map((nombre) => {
      const filas = grupos.get(nombre)!;
      filas.sort((a, b) => {
        const fa = a.sale_starts_at ? new Date(a.sale_starts_at).getTime() : -Infinity;
        const fb = b.sale_starts_at ? new Date(b.sale_starts_at).getTime() : -Infinity;
        return fa - fb;
      });
      const precios = filas.map((f) => f.price_cop);
      return { nombre, filas, precioMin: Math.min(...precios), precioMax: Math.max(...precios) };
    })
    .sort((a, b) => b.precioMax - a.precioMax);
}

export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evento } = await supabase
    .from("events")
    .select(
      "id, name, description, venue, city, starts_at, status, category, image_url, banner_url, doors_open_at, min_age, seating_type, capacity, food_sale, alcohol_sale, wheelchair_accessible, pregnant_allowed, venue_address, lineup, pulep_code, responsable_razon_social, responsable_nit, responsable_direccion, responsable_email, terms_extra"
    )
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .single();

  if (!evento) notFound();

  const [{ data: tiposDeBoleto }, { data: imagenesLocalidad }] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, name, price_cop, capacity, sold_count, etapa, sale_starts_at, sale_ends_at")
      .eq("event_id", id)
      .order("price_cop", { ascending: false }),
    supabase
      .from("event_location_images")
      .select("id, image_url")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const ventaAbierta = evento.status === "en_venta";

  // Ficha tecnica: solo se muestran los datos que el organizador lleno.
  const ficha: { valor: string; etiqueta: string }[] = [];
  if (evento.category) ficha.push({ valor: evento.category, etiqueta: "Categoria" });
  if (evento.min_age) ficha.push({ valor: `${evento.min_age}+ anos`, etiqueta: "Edad minima" });
  if (evento.seating_type) {
    ficha.push({ valor: ACOMODACION[evento.seating_type] ?? evento.seating_type, etiqueta: "Acomodacion" });
  }
  if (evento.capacity) ficha.push({ valor: `${evento.capacity}`, etiqueta: "Aforo" });
  if (evento.doors_open_at) {
    ficha.push({
      valor: new Date(evento.doors_open_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }),
      etiqueta: "Apertura de puertas",
    });
  }
  if (evento.food_sale !== null) ficha.push({ valor: evento.food_sale ? "Si" : "No", etiqueta: "Venta de comida" });
  if (evento.alcohol_sale !== null) ficha.push({ valor: evento.alcohol_sale ? "Si" : "No", etiqueta: "Venta de licor" });
  if (evento.wheelchair_accessible !== null) {
    ficha.push({ valor: evento.wheelchair_accessible ? "Si" : "No", etiqueta: "Acceso movilidad reducida" });
  }
  if (evento.pregnant_allowed !== null) {
    ficha.push({ valor: evento.pregnant_allowed ? "Si" : "No", etiqueta: "Acceso mujeres embarazadas" });
  }

  const direccionCompleta = [evento.venue, evento.venue_address, evento.city, "Colombia"]
    .filter(Boolean)
    .join(", ");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
  const ahora = Date.now();

  const tieneResponsable =
    evento.responsable_razon_social || evento.responsable_nit || evento.responsable_direccion || evento.responsable_email;
  const tieneLegal = tieneResponsable || evento.pulep_code;

  const zonas = tiposDeBoleto ? agruparPorLocalidad(tiposDeBoleto) : [];

  return (
    <main className="container">
      <div
        className="hero-slide"
        style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: 28 }}
      >
        <img src={evento.banner_url || evento.image_url || imagenDeEvento(evento.id, evento.category, 1400)} alt="" />
        <div className="hero-slide-scrim" />
        <div className="hero-slide-content" style={{ maxWidth: "none" }}>
          {evento.category && <p className="event-card-eyebrow">{evento.category}</p>}
          <h1 style={{ margin: "6px 0 0" }}>{evento.name}</h1>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <p className="page-lede">
          {evento.venue} · {evento.city} ·{" "}
          {new Date(evento.starts_at).toLocaleString("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "America/Bogota",
          })}
        </p>
        {evento.description && <p>{evento.description}</p>}
      </div>

      {evento.lineup && (
        <section className="event-section">
          <h2>Artistas principales</h2>
          <p style={{ whiteSpace: "pre-line", margin: 0 }}>{evento.lineup}</p>
        </section>
      )}

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
          {evento.venue}
          {evento.venue_address ? ` — ${evento.venue_address}` : ""} — {evento.city}
          {" · "}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-link">
            Como llegar (Google Maps)
          </a>
        </p>
        <div className="map-embed" style={{ margin: 0 }}>
          <iframe src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa de ${evento.venue}`} />
        </div>
      </section>

      {imagenesLocalidad && imagenesLocalidad.length > 0 && (
        <section className="event-section">
          <h2>Mapa de localidades</h2>
          <p className="muted" style={{ margin: "0 0 16px" }}>
            Ubica tu localidad antes de comprar.
          </p>
          <div className="localidad-gallery">
            {imagenesLocalidad.map((img) => (
              <div className="localidad-frame" key={img.id}>
                <img src={img.image_url} alt="Mapa de localidades del venue" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="event-section">
        <h2>Boletos</h2>
        {zonas.length === 0 ? (
          <p className="empty-state">Todavia no hay boletos a la venta para este evento.</p>
        ) : (
          <div className="ticket-zones">
            {zonas.map((zona) => (
              <div className="ticket-zone" key={zona.nombre}>
                <div className="ticket-zone-head">
                  <h3>{zona.nombre}</h3>
                  <span className="muted price">
                    {zona.precioMin === zona.precioMax
                      ? `$${zona.precioMin.toLocaleString("es-CO")} COP`
                      : `Desde $${zona.precioMin.toLocaleString("es-CO")} COP`}
                  </span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Etapa</th>
                        <th>Precio</th>
                        <th>Ventana de venta</th>
                        <th>Disponibilidad</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {zona.filas.map((t) => {
                        const disponibles = t.capacity - t.sold_count;
                        const agotado = disponibles <= 0;
                        const finalizado = Boolean(t.sale_ends_at) && new Date(t.sale_ends_at as string).getTime() < ahora;
                        const proximamente = Boolean(t.sale_starts_at) && new Date(t.sale_starts_at as string).getTime() > ahora;
                        const comprable = ventaAbierta && !agotado && !finalizado && !proximamente;

                        let badgeClase = "badge badge-green";
                        let badgeTexto = `${disponibles} disponibles`;
                        if (agotado) {
                          badgeClase = "badge badge-danger";
                          badgeTexto = "Agotado";
                        } else if (finalizado) {
                          badgeClase = "badge";
                          badgeTexto = "Finalizada";
                        } else if (proximamente) {
                          badgeClase = "badge badge-blue";
                          badgeTexto = "Proximamente";
                        }

                        return (
                          <tr key={t.id} className={!comprable ? "ticket-row-inactiva" : undefined}>
                            <td>{t.etapa || "Precio unico"}</td>
                            <td className="price-cell">${t.price_cop.toLocaleString("es-CO")}</td>
                            <td className="muted">
                              {t.sale_starts_at || t.sale_ends_at ? (
                                <>
                                  {t.sale_starts_at &&
                                    new Date(t.sale_starts_at).toLocaleDateString("es-CO", {
                                      timeZone: "America/Bogota",
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  {t.sale_starts_at && t.sale_ends_at && " – "}
                                  {t.sale_ends_at &&
                                    new Date(t.sale_ends_at).toLocaleDateString("es-CO", {
                                      timeZone: "America/Bogota",
                                      day: "numeric",
                                      month: "short",
                                    })}
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td>
                              <span className={badgeClase}>{badgeTexto}</span>
                            </td>
                            <td className="ticket-action-cell">
                              {comprable && <ComprarBoton ticketTypeId={t.id} disponibles={disponibles} />}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
        {!ventaAbierta && zonas.length > 0 && (
          <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
            La venta de boletos para este evento aun no esta abierta.
          </p>
        )}
      </section>

      {tieneLegal && (
        <section className="event-section legal-block" style={{ margin: "0 0 20px" }}>
          {evento.pulep_code && (
            <p>
              <strong>PULEP:</strong> {evento.pulep_code}
            </p>
          )}
          {tieneResponsable && (
            <>
              <p style={{ marginTop: 10 }}>
                <strong>Responsable del evento</strong>
              </p>
              {evento.responsable_razon_social && <p>Razon social: {evento.responsable_razon_social}</p>}
              {evento.responsable_nit && <p>NIT: {evento.responsable_nit}</p>}
              {evento.responsable_direccion && <p>Direccion: {evento.responsable_direccion}</p>}
              {evento.responsable_email && <p>Contacto: {evento.responsable_email}</p>}
            </>
          )}
        </section>
      )}

      <section className="event-section">
        <h2>Terminos y condiciones</h2>
        {evento.terms_extra && <p style={{ whiteSpace: "pre-line" }}>{evento.terms_extra}</p>}
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
