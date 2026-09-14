import { requireAdmin } from "@/lib/admin";
import { CATEGORIAS } from "@/lib/event-visuals";
import { crearEventoAdmin } from "./actions";

export default async function NuevoEventoAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await searchParams;

  const { data: organizadores } = await supabase
    .from("organizers")
    .select("id, legal_name")
    .order("legal_name", { ascending: true });

  return (
    <>
      <h1>Crear evento</h1>
      <p className="page-lede">Crea un evento y asignalo a un organizador. Queda en borrador hasta publicarlo.</p>
      {error && <p role="alert">{error}</p>}
      <div className="card" style={{ maxWidth: 480 }}>
        <form action={crearEventoAdmin} className="form">
          <div className="field">
            <label htmlFor="organizer_id">Organizador</label>
            <select id="organizer_id" name="organizer_id" required defaultValue="">
              <option value="" disabled>
                Selecciona un organizador
              </option>
              {(organizadores ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.legal_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="name">Nombre del evento</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="venue">Lugar (venue)</label>
            <input id="venue" name="venue" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="city">Ciudad</label>
            <input id="city" name="city" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="category">Categoria</label>
            <select id="category" name="category" defaultValue="">
              <option value="">Sin categoria</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="starts_at">Fecha y hora</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required />
          </div>
          <div className="field">
            <label htmlFor="image_url">URL de imagen de banner (opcional)</label>
            <input id="image_url" name="image_url" type="url" placeholder="https://..." />
            <p className="muted" style={{ fontSize: "0.82rem", margin: "2px 0 0" }}>
              Si la dejas vacia, usamos una foto segun la categoria del evento.
            </p>
          </div>
          <button type="submit" className="btn btn-primary">
            Crear (queda en borrador)
          </button>
        </form>
      </div>
    </>
  );
}
