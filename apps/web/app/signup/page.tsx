import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "./actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { PasswordField } from "@/components/password-field";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaCorreo?: string; tipo?: string }>;
}) {
  const { error, revisaCorreo, tipo } = await searchParams;

  // El auto-registro de empresas quedo cerrado: la cuenta de organizador
  // la crea un admin desde el CRM despues de contactar al cliente (ver
  // /empresas). Cualquier visita a /signup?tipo=empresa se redirige alla.
  if (tipo === "empresa") redirect("/empresas");

  const role = "comprador";
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <main className="mq-scope mq-page">
      <div className="mq-noise" aria-hidden="true" />
      <div className="mq-login-wrap">
        <div className="mq-login-card">
          <Link href="/" className="mq-logo" aria-label="Monarca Tickets — inicio">
            <Image src="/logo.png" alt="Monarca Tickets" width={152} height={32} priority />
          </Link>

          {revisaCorreo ? (
            <>
              <h1>Revisa tu correo.</h1>
              <p className="mq-sub">Te enviamos un enlace de confirmación para activar tu cuenta.</p>
              <p className="mq-login-foot">
                <Link href="/login">Volver a iniciar sesión</Link>
              </p>
            </>
          ) : (
            <>
              <h1>Crea tu cuenta.</h1>
              <p className="mq-sub">Para comprar boletos y guardar tus entradas digitales.</p>

              {error && (
                <p className="mq-alert" role="alert">
                  {error}
                </p>
              )}

              <form action={signup}>
                <input type="hidden" name="role" value={role} />
                <div className="mq-field">
                  <label htmlFor="full_name">Nombre completo</label>
                  <input id="full_name" name="full_name" type="text" autoComplete="name" required />
                </div>
                <div className="mq-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <PasswordField autoComplete="new-password" minLength={8} />
                {turnstileSiteKey && <TurnstileWidget siteKey={turnstileSiteKey} action="signup" />}
                <button type="submit" className="mq-btn mq-primary">
                  Crear cuenta
                </button>
              </form>

              <p className="mq-login-foot">
                ¿Ya tienes cuenta? <Link href="/login">Ingresa</Link>
                <br />
                ¿Vas a vender boletos? <Link href="/empresas">Conoce Monarca para Organizadores</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
