import Link from "next/link";
import { requireOrganizer } from "@/lib/organizer";

export default async function PanelOrganizadorPage() {
  const { supabase, organizer } = await requireOrganizer();

  const { data: eventos } = await supabase
    .from("events")
    .select("id, name, city, starts_at, status")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });

  return (
    <main>
      <h1>{organizer.legal_name}</h1>
      <p>
        Estado DIAN: <strong>{organizer.dian_status}</strong>
        {organizer.dian_status !== "habilitado" && (
          <> — no vas a poder emitir facturas hasta habilitarte con la DIAN.</>
        )}
      </p>

      <Link href="/panel/eventos/nuevo">+ Crear evento</Link>

      <h2>Tus eventos</h2>
      {!eventos || eventos.length === 0 ? (
        <p>Todavia no has creado ningun evento.</p>
      ) : (
        <ul>
          {eventos.map((e) => (
            <li key={e.id}>
              <Link href={`/panel/eventos/${e.id}`}>
                {e.name} — {e.city} — {new Date(e.starts_at).toLocaleDateString("es-CO")} —{" "}
                {e.status}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
