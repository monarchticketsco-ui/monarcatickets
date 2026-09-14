import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarPasswordRecuperada } from "./actions";

export default async function RestablecerPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/recuperar-password?error=${encodeURIComponent("El enlace expiro. Solicita uno nuevo.")}`);

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <h1>Crea tu nueva contraseña</h1>
        <p className="muted" style={{ marginTop: 0 }}>{user.email}</p>
        {error && <p role="alert">{error}</p>}
        <form action={actualizarPasswordRecuperada} className="form">
          <div className="field">
            <label htmlFor="password">Nueva contraseña</label>
            <input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input id="confirmar" name="confirmar" type="password" required minLength={8} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar y continuar
          </button>
        </form>
      </div>
    </main>
  );
}
