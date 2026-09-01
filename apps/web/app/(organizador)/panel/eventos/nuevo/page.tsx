import { CATEGORIAS } from "@/lib/event-visuals";
import { crearEvento } from "./actions";

export default async function NuevoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="container">
      <h1>Crear evento</h1>
      {error && <p role="alert">{error}</p>}
      <div className="card" style={{ maxWidth: 480 }}>
        <form action={crearEvento} className="form">
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
    </main>
  );
}
