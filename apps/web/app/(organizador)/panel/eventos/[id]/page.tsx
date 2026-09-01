import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";
import { crearTipoDeBoleto, publicarEvento } from "./actions";

export default async function GestionEventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase, organizer } = await requireOrganizer();

  const { data: evento } = await supabase
    .from("events")
    .select("id, name, venue, city, category, starts_at, status")
    .eq("id", id)
    .eq("organizer_id", organizer.id)
    .single();

  if (!evento) notFound();

  const { data: tiposDeBoleto } = await supabase
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  const crearTipoDeBoletoConId = crearTipoDeBoleto.bind(null, id);
  const publicarEventoConId = publicarEvento.bind(null, id);

  return (
    <main>
      <h1>{evento.name}</h1>
      {error && <p role="alert">{error}</p>}
      <p>
        {evento.venue} — {evento.city} — {new Date(evento.starts_at).toLocaleString("es-CO")}
      </p>
      <p>
        Estado: <strong>{evento.status}</strong>
      </p>

      {evento.status === "borrador" && (
        <form action={publicarEventoConId}>
          <button type="submit">Publicar (pasar a en venta)</button>
        </form>
      )}

      <h2>Tipos de boleto (aforo)</h2>
      {!tiposDeBoleto || tiposDeBoleto.length === 0 ? (
        <p>Todavia no has agregado tipos de boleto.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Vendidos</th>
              <th>Aforo</th>
            </tr>
          </thead>
          <tbody>
            {tiposDeBoleto.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>${t.price_cop.toLocaleString("es-CO")}</td>
                <td>{t.sold_count}</td>
                <td>{t.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Agregar tipo de boleto</h3>
      <form action={crearTipoDeBoletoConId}>
        <label>
          Nombre
          <input name="name" type="text" placeholder="General, VIP, Palco..." required />
        </label>
        <label>
          Precio (COP)
          <input name="price_cop" type="number" min={0} required />
        </label>
        <label>
          Aforo (cupos disponibles)
          <input name="capacity" type="number" min={1} required />
        </label>
        <button type="submit">Agregar</button>
      </form>
    </main>
  );
}
