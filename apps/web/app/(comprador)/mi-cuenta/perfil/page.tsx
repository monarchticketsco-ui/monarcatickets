import Link from "next/link";
import { requireComprador } from "@/lib/admin";
import { actualizarPerfil } from "../actions";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; passwordActualizada?: string }>;
}) {
  const { error, passwordActualizada } = await searchParams;
  const { supabase, user } = await requireComprador();

  const { data: perfil } = await supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).single();

  return (
    <>
      <div className="eyebrow">CUENTA</div>
      <h1 style={{ marginBottom: 4 }}>Perfil</h1>
      <p className="page-lede">Tu informacion personal y seguridad.</p>

      {error && <p role="alert">{error}</p>}
      {passwordActualizada && (
        <p className="alert-success" role="status">
          Tu contraseña se actualizo correctamente.
        </p>
      )}

      <div className="card" style={{ maxWidth: 440, marginTop: 20 }}>
        <p className="muted" style={{ marginTop: 0 }}>
          {user.email} · {perfil?.role ?? "comprador"}
        </p>
        <form action={actualizarPerfil} className="form">
          <div className="field">
            <label htmlFor="full_name">Nombre completo</label>
            <input id="full_name" name="full_name" type="text" defaultValue={perfil?.full_name ?? ""} />
          </div>
          <div className="field">
            <label htmlFor="phone">Telefono</label>
            <input id="phone" name="phone" type="tel" defaultValue={perfil?.phone ?? ""} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 440, marginTop: 16 }}>
        <p className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          Cambia la contraseña con la que ingresas a tu cuenta.
        </p>
        <Link href="/cuenta/contrasena" className="btn btn-secondary">
          Cambiar contraseña
        </Link>
      </div>
    </>
  );
}
