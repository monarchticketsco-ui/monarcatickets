import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: evento } = await supabase
    .from("events")
    .select("id, name, description, venue, city, starts_at, status")
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .single();

  if (!evento) notFound();

  const { data: tiposDeBoleto } = await supabase
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  return (
    <main>
      <h1>{evento.name}</h1>
      <p>
        {evento.venue} — {evento.city} — {new Date(evento.starts_at).toLocaleString("es-CO")}
      </p>
      {evento.description && <p>{evento.description}</p>}

      <h2>Boletos</h2>
      {!tiposDeBoleto || tiposDeBoleto.length === 0 ? (
        <p>Todavia no hay boletos a la venta para este evento.</p>
      ) : (
        <ul>
          {tiposDeBoleto.map((t) => {
            const disponibles = t.capacity - t.sold_count;
            return (
              <li key={t.id}>
                {t.name} — ${t.price_cop.toLocaleString("es-CO")} —{" "}
                {disponibles > 0 ? `${disponibles} disponibles` : "agotado"}
                {/* TODO (Fase 2): boton "comprar" que llama a /api/checkout */}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
