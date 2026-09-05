import { login } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <h1>Ingresar</h1>
        {error && <p role="alert">{error}</p>}
        <form action={login} className="form">
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" required />
          </div>
          {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} action="login" />}
          <button type="submit" className="btn btn-primary">
            Ingresar
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20 }}>
          ¿No tienes cuenta? <a href="/signup">Crea una</a>
        </p>
      </div>
    </main>
  );
}
