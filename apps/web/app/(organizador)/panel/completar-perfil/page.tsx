import { crearOrganizador } from "./actions";

// Paso previo a usar el panel: crea la fila en `organizers` que conecta
// al usuario con sus eventos. dian_status queda en 'no_habilitado' por
// defecto — bloquea la publicacion de eventos hasta que se resuelva
// (blueprint seccion 05).
export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Completa tu perfil de organizador</h1>
      {error && <p role="alert">{error}</p>}
      <form action={crearOrganizador}>
        <label>
          Razon social
          <input name="legal_name" type="text" required />
        </label>
        <label>
          NIT
          <input name="nit" type="text" required />
        </label>
        <button type="submit">Continuar</button>
      </form>
    </main>
  );
}
