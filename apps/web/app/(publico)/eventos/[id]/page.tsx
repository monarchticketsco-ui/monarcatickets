import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { imagenDeEvento } from "@/lib/event-visuals";
import { ComprarBoton } from "./comprar-boton";

const ACOMODACION: Record<string, string> = {
  libre: "En orden de llegada",
  numerada: "Numerada",
};

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
      "id, name, description, venue, city, starts_at, status, category, image_url, doors_open_at, min_age, seating_type, capacity, food_sale, alcohol_sale, wheelchair_accessible, pregnant_allowed, venue_address, lineup, pulep_code, responsable_razon_social, responsable_nit, responsable_direccion, responsable_email, terms_extra"
    )
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .single();

  if (!evento) notFound();

  const [{ data: tiposDeBoleto }, { data: imagenesLocalidad }] = await Promise.all([
    supabase
      .from("ticket_types")
      .select("id, name, price_cop, capacity, sold_count")
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
      valor: new Date(evento.doors_open_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
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

  const tieneResponsable =
    evento.responsable_razon_social || evento.responsable_nit || evento.responsable_direccion || evento.responsable_email;
  const tieneLegal = tieneResponsable || evento.pulep_code;

  return (
    <main className="container">
      <div
        className="hero-slide"
        style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: 28 }}
      >
        <img src={evento.image_url || imagenDeEvento(evento.id, evento.category, 1400)} alt="" />
        <div className="hero-slide-scrim" />
        <div className="hero-slide-content" style={{ maxWidth: "none" }}>
          {evento.category && <p className="event-card-eyebrow">{evento.category}</p>}
          <h1 style={{ margin: "6px 0 0" }}>{evento.name}</h1>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <p className="page-lede">
          {evento.venue} · {evento.city} ·{" "}
          {new Date(evento.starts_at).toLocaleString("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
        {evento.description && <p>{evento.description}</p>}
      </div>

      {evento.lineup && (
        <div style={{ marginBottom: 8 }}>
          <h2>Artistas principales</h2>
          <p style={{ whiteSpace: "pre-line" }}>{evento.lineup}</p>
        </div>
      )}

      {ficha.length > 0 && (
        <>
          <h2>Detalles del evento</h2>
          <div className="stat-grid">
            {ficha.map((f) => (
              <div className="stat-card" key={f.etiqueta}>
                <div className="value" style={{ fontSize: "1.15rem" }}>{f.valor}</div>
                <div className="label">{f.etiqueta}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Ubicacion</h2>
      <p className="muted" style={{ margin: "0 0 12px" }}>
        {evento.venue}
        {evento.venue_address ? ` — ${evento.venue_address}` : ""} — {evento.city}
      </p>
      <div className="map-embed">
        <iframe src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Mapa de ${evento.venue}`} />
      </div>

      {imagenesLocalidad && imagenesLocalidad.length > 0 && (
        <>
          <h2>Localidades y zonas</h2>
          <div className="gallery-grid">
            {imagenesLocalidad.map((img) => (
              <img key={img.id} src={img.image_url} alt="Mapa de localidades del venue" loading="lazy" />
            ))}
          </div>
        </>
      )}

      <h2>Boletos</h2>
      {!tiposDeBoleto || tiposDeBoleto.length === 0 ? (
        <p className="empty-state">Todavia no hay boletos a la venta para este evento.</p>
      ) : (
        <div className="card">
          {tiposDeBoleto.map((t) => {
            const disponibles = t.capacity - t.sold_count;
            return (
              <div className="ticket-row" key={t.id}>
                <div className="ticket-info">
                  <h3 style={{ margin: "0 0 4px" }}>{t.name}</h3>
                  <p className="price" style={{ margin: 0 }}>
                    ${t.price_cop.toLocaleString("es-CO")} COP
                  </p>
                  <span className={`badge ${disponibles > 0 ? "badge-green" : "badge-danger"}`}>
                    {disponibles > 0 ? `${disponibles} disponibles` : "Agotado"}
                  </span>
                </div>
                {ventaAbierta && <ComprarBoton ticketTypeId={t.id} disponibles={disponibles} />}
              </div>
            );
          })}
        </div>
      )}
      {!ventaAbierta && tiposDeBoleto && tiposDeBoleto.length > 0 && (
        <p className="muted" style={{ marginTop: 16 }}>
          La venta de boletos para este evento aun no esta abierta.
        </p>
      )}

      {tieneLegal && (
        <div className="legal-block">
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
        </div>
      )}

      <h2>Terminos y condiciones</h2>
      {evento.terms_extra && <p style={{ whiteSpace: "pre-line" }}>{evento.terms_extra}</p>}
      <p className="muted">
        Para evitar ser estafado, ten presente que Monarca Tickets no tiene vendedores ni promotores externos. La
        originalidad de las entradas solo se verifica en la entrada del evento. Una vez confirmada la compra, no hay
        reintegros de dinero, salvo cancelacion o cambio informado por el organizador.
      </p>
      <p className="muted">
        Consulta las{" "}
        <a href="/legal/condiciones" className="nav-link" style={{ display: "inline" }}>
          condiciones generales, politica de privacidad y seguridad
        </a>{" "}
        y la{" "}
        <a href="/legal/cancelaciones" className="nav-link" style={{ display: "inline" }}>
          politica de cancelaciones y cambios
        </a>{" "}
        de Monarca Tickets.
      </p>
    </main>
  );
}
