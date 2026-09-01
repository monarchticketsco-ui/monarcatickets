import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Ingresar</h1>
      {error && <p role="alert">{error}</p>}
      <form action={login}>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" required />
        </label>
        <button type="submit">Ingresar</button>
      </form>
      <p>
        ¿No tienes cuenta? <a href="/signup">Crea una</a>
      </p>
    </main>
  );
}
