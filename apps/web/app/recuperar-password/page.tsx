import Link from "next/link";
import { solicitarRecuperacion } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default async function RecuperarPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; enviado?: string }>;
}) {
  const { error, enviado } = await searchParams;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <h1>Recuperar contraseña</h1>
        {error && <p role="alert">{error}</p>}
        {enviado ? (
          <p className="alert-success" role="status">
            Si el correo que ingresaste esta registrado, te enviamos un enlace para restablecer tu contraseña.
            Revisa tu bandeja de entrada (y la carpeta de spam).
          </p>
        ) : (
          <>
            <p className="page-lede" style={{ marginTop: 0 }}>
              Ingresa el correo de tu cuenta y te enviamos un enlace para crear una contraseña nueva.
            </p>
            <form action={solicitarRecuperacion} className="form">
              <div className="field">
                <label htmlFor="email">Correo</label>
                <input id="email" name="email" type="email" required />
              </div>
              {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} action="recuperar_password" />}
              <button type="submit" className="btn btn-primary">
                Enviar enlace
              </button>
            </form>
          </>
        )}
        <p className="muted" style={{ marginTop: 20 }}>
          <Link href="/login">← Volver a ingresar</Link>
        </p>
      </div>
    </main>
  );
}
