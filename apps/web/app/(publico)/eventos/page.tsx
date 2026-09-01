import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Catalogo publico — solo eventos publicados/en venta (lo aplica la
// policy events_select_public_or_owner). Filtro por ciudad/categoria
// se agrega cuando haya suficientes eventos para justificarlo.
export default async function EventosPage() {
  const supabase = await createClient();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, venue, city, starts_at, category")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true });

  return (
    <main>
      <h1>Eventos</h1>
      {!eventos || eventos.length === 0 ? (
        <p>No hay eventos en venta todavia.</p>
      ) : (
        <ul>
          {eventos.map((e) => (
            <li key={e.id}>
              <Link href={`/eventos/${e.id}`}>
                {e.name} — {e.city} — {new Date(e.starts_at).toLocaleDateString("es-CO")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
