import Link from "next/link";
import { requireComprador } from "@/lib/admin";
import { actualizarPerfil } from "../actions";

export const dynamic = "force-dynamic";

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
      <div className="mq-dash-title">
        <div className="eyebrow">CUENTA</div>
        <h1>Perfil</h1>
        <p className="page-lede">Tu información personal y seguridad.</p>
      </div>

      {error && (
        <p className="mq-alert" role="alert">
          {error}
        </p>
      )}
      {passwordActualizada && (
        <p className="mq-ok" role="status">
          Tu contraseña se actualizó correctamente.
        </p>
      )}

      <div className="mq-profile-grid">
        <div className="mq-panel-card">
          <b>Información personal</b>
          <div className="mq-profile-row">
            <span>Correo electrónico</span>
            <strong>{user.email}</strong>
          </div>
          <form action={actualizarPerfil} className="mq-profile-form">
            <div className="mq-field">
              <label htmlFor="full_name">Nombre completo</label>
              <input id="full_name" name="full_name" type="text" defaultValue={perfil?.full_name ?? ""} autoComplete="name" />
            </div>
            <div className="mq-field">
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" name="phone" type="tel" defaultValue={perfil?.phone ?? ""} autoComplete="tel" />
            </div>
            <button type="submit" className="mq-btn mq-primary">
              Guardar cambios
            </button>
          </form>
        </div>

        <div className="mq-panel-card">
          <b>Seguridad</b>
          <div className="mq-profile-row">
            <span>Contraseña</span>
            <strong>••••••••••</strong>
          </div>
          <p style={{ color: "#8492a6", fontSize: 14, lineHeight: 1.6, margin: "14px 0 18px" }}>
            Cambia la contraseña con la que ingresas a tu cuenta.
          </p>
          <Link href="/cuenta/contrasena" className="mq-btn mq-ghost">
            Cambiar contraseña
          </Link>
        </div>
      </div>
    </>
  );
}
