import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaCorreo?: string }>;
}) {
  const { error, revisaCorreo } = await searchParams;

  if (revisaCorreo) {
    return (
      <main>
        <h1>Revisa tu correo</h1>
        <p>Te enviamos un enlace de confirmacion para activar tu cuenta.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Crear cuenta</h1>
      {error && <p role="alert">{error}</p>}
      <form action={signup}>
        <label>
          Nombre completo
          <input name="full_name" type="text" required />
        </label>
        <label>
          Correo
          <input name="email" type="email" required />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" required minLength={8} />
        </label>
        <fieldset>
          <legend>Voy a usar Monarca Tickets para...</legend>
          <label>
            <input type="radio" name="role" value="comprador" defaultChecked /> Comprar boletos
          </label>
          <label>
            <input type="radio" name="role" value="organizador" /> Vender boletos de mis eventos
          </label>
        </fieldset>
        <button type="submit">Crear cuenta</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <a href="/login">Ingresa</a>
      </p>
    </main>
  );
}
