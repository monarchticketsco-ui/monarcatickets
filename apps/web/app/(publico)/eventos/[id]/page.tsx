import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { imagenDeEvento } from "@/lib/event-visuals";
import { ComprarBoton } from "./comprar-boton";

export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evento } = await supabase
    .from("events")
    .select("id, name, description, venue, city, starts_at, status, category")
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .single();

  if (!evento) notFound();

  const { data: tiposDeBoleto } = await supabase
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  const ventaAbierta = evento.status === "en_venta";

  return (
    <main className="container">
      <div
        className="hero-slide"
        style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: 28 }}
      >
        <img src={imagenDeEvento(evento.id, evento.category, 1400)} alt="" />
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
          })}
        </p>
        {evento.description && <p>{evento.description}</p>}
      </div>

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
    </main>
  );
}
