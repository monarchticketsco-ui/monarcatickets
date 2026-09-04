import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; revisaCorreo?: string; tipo?: string }>;
}) {
  const { error, revisaCorreo, tipo } = await searchParams;
  const esEmpresa = tipo === "empresa";
  const role = esEmpresa ? "organizador" : "comprador";

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
        <p className="event-card-eyebrow" style={{ marginBottom: 4 }}>
          {esEmpresa ? "Portal empresas" : "Portal personas"}
        </p>
        <h1>{esEmpresa ? "Crea tu cuenta de empresa" : "Crea tu cuenta"}</h1>
        <p className="muted" style={{ marginTop: -8, marginBottom: 20 }}>
          {esEmpresa
            ? "Para vender los boletos de tus eventos en Monarca Tickets."
            : "Para comprar boletos y guardar tus entradas digitales."}
        </p>
        {error && <p role="alert">{error}</p>}
        <form action={signup} className="form">
          <input type="hidden" name="role" value={role} />
          <div className="field">
            <label htmlFor="full_name">{esEmpresa ? "Nombre de la empresa o representante" : "Nombre completo"}</label>
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
          <button type="submit" className="btn btn-primary">
            Crear cuenta
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20 }}>
          ¿Ya tienes cuenta? <a href="/login">Ingresa</a>
        </p>
        <p className="muted" style={{ marginTop: 6, fontSize: "0.85rem" }}>
          {esEmpresa ? (
            <>¿Vienes a comprar boletos? <a href="/signup?tipo=persona">Crea tu cuenta de persona</a></>
          ) : (
            <>¿Vas a vender boletos de tu evento? <a href="/signup?tipo=empresa">Crea tu cuenta de empresa</a></>
          )}
        </p>
      </div>
    </main>
  );
}
