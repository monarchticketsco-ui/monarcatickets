import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cambiarPassword } from "./actions";

export default async function CambiarPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const volverHref = perfil?.role === "admin" ? "/crm" : perfil?.role === "organizador" ? "/panel" : "/mi-cuenta";

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", paddingTop: 64 }}>
      <div className="card" style={{ width: "100%", maxWidth: 420 }}>
        <p>
          <Link href={volverHref} className="nav-link" style={{ padding: 0 }}>
            ← Volver
          </Link>
        </p>
        <h1>Cambiar contraseña</h1>
        <p className="muted" style={{ marginTop: 0 }}>{user.email}</p>
        {error && <p role="alert">{error}</p>}
        {ok && (
          <p className="alert-success" role="status">
            Tu contraseña se actualizo correctamente.
          </p>
        )}
        <form action={cambiarPassword} className="form">
          <div className="field">
            <label htmlFor="password">Nueva contraseña</label>
            <input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input id="confirmar" name="confirmar" type="password" required minLength={8} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar contraseña
          </button>
        </form>
      </div>
    </main>
  );
}
