import Image from "next/image";
import Link from "next/link";
import { login } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; acceso?: string }>;
}) {
  const { error, acceso } = await searchParams;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const esOrganizador = acceso === "organizador";

  return (
    <main className="mq-scope mq-page">
      <div className="mq-noise" aria-hidden="true" />
      <div className="mq-login-wrap">
        <div className="mq-login-card">
          <Link href="/" className="mq-logo" aria-label="Monarca Tickets — inicio">
            <Image src="/logo.png" alt="Monarca Tickets" width={152} height={32} priority />
          </Link>
          <h1>Bienvenido de vuelta.</h1>
          <p className="mq-sub">Selecciona cómo quieres ingresar.</p>

          <form action={login}>
            <div className="mq-seg" role="radiogroup" aria-label="Tipo de acceso">
              <label>
                <input type="radio" name="acceso" value="asistente" defaultChecked={!esOrganizador} />
                <span>ASISTENTE</span>
              </label>
              <label>
                <input type="radio" name="acceso" value="organizador" defaultChecked={esOrganizador} />
                <span>ORGANIZADOR</span>
              </label>
            </div>

            {error && (
              <p className="mq-alert" role="alert">
                {error}
              </p>
            )}

            <div className="mq-field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="mq-field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <p className="mq-linkrow">
              <Link href="/recuperar-password">¿Olvidaste tu contraseña?</Link>
            </p>

            {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} action="login" />}
            <button type="submit" className="mq-btn mq-primary">
              Iniciar sesión
            </button>
          </form>

          <p className="mq-login-foot">
            ¿No tienes cuenta? <Link href="/signup">Crea una</Link>
            <br />
            ¿Vas a vender boletos? <Link href="/empresas">Conoce Monarca para Organizadores</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
