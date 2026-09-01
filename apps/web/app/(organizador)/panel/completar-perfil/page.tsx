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
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440 }}>
        <h1>Completa tu perfil de organizador</h1>
        {error && <p role="alert">{error}</p>}
        <form action={crearOrganizador} className="form">
          <div className="field">
            <label htmlFor="legal_name">Razon social</label>
            <input id="legal_name" name="legal_name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="nit">NIT</label>
            <input id="nit" name="nit" type="text" required />
          </div>
          <button type="submit" className="btn btn-primary">
            Continuar
          </button>
        </form>
      </div>
    </main>
  );
}
