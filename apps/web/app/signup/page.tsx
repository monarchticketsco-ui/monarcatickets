import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaCorreo?: string }>;
}) {
  const { error, revisaCorreo } = await searchParams;

  if (revisaCorreo) {
    return (
      <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
        <div className="card" style={{ width: "100%", maxWidth: 420 }}>
          <h1>Revisa tu correo</h1>
          <p>Te enviamos un enlace de confirmacion para activar tu cuenta.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440 }}>
        <h1>Crear cuenta</h1>
        {error && <p role="alert">{error}</p>}
        <form action={signup} className="form">
          <div className="field">
            <label htmlFor="full_name">Nombre completo</label>
            <input id="full_name" name="full_name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required minLength={8} />
          </div>
          <fieldset>
            <legend>Voy a usar Monarca Tickets para...</legend>
            <label>
              <input type="radio" name="role" value="comprador" defaultChecked /> Comprar boletos
            </label>
            <label>
              <input type="radio" name="role" value="organizador" /> Vender boletos de mis eventos
            </label>
          </fieldset>
          <button type="submit" className="btn btn-primary">
            Crear cuenta
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20 }}>
          ¿Ya tienes cuenta? <a href="/login">Ingresa</a>
        </p>
      </div>
    </main>
  );
}
