import { crearEvento } from "./actions";

export default async function NuevoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Crear evento</h1>
      {error && <p role="alert">{error}</p>}
      <form action={crearEvento}>
        <label>
          Nombre del evento
          <input name="name" type="text" required />
        </label>
        <label>
          Lugar (venue)
          <input name="venue" type="text" required />
        </label>
        <label>
          Ciudad
          <input name="city" type="text" required />
        </label>
        <label>
          Categoria
          <input name="category" type="text" placeholder="Concierto, teatro, festival..." />
        </label>
        <label>
          Fecha y hora
          <input name="starts_at" type="datetime-local" required />
        </label>
        <button type="submit">Crear (queda en borrador)</button>
      </form>
    </main>
  );
}
