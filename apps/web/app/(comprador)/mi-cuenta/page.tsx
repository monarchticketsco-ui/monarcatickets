import Link from "next/link";
import { requireComprador } from "@/lib/admin";
import { getFourvenuesTicketsByEmail } from "@/lib/fourvenues";

export const dynamic = "force-dynamic";

export default async function MiCuentaResumenPage() {
  const { supabase, user } = await requireComprador();

  const { data: perfil } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const entradas = user.email ? await getFourvenuesTicketsByEmail(user.email).catch(() => []) : [];

  const ahora = Date.now();
  const proximas = entradas
    .filter((e) => new Date(e.event.start_date).getTime() >= ahora)
    .sort((a, b) => new Date(a.event.start_date).getTime() - new Date(b.event.start_date).getTime());

  const proximoEvento = proximas[0]?.event;
  const entradasProximoEvento = proximas.filter((e) => e.event._id === proximoEvento?._id);

  const nombre = perfil?.full_name?.trim().split(" ")[0] || "de vuelta";

  return (
    <>
      <div className="eyebrow">PRÓXIMA EXPERIENCIA</div>
      <h1 style={{ marginBottom: 4 }}>Hola, {nombre}</h1>
      <p className="page-lede">Todo lo de tus próximas entradas, en un solo lugar.</p>

      {proximoEvento ? (
        <div className="card" style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between" }}>
          <div>
            <small className="muted">PRÓXIMO EVENTO</small>
            <h2 style={{ margin: "6px 0" }}>{proximoEvento.name}</h2>
            <p className="muted" style={{ margin: 0 }}>
              {new Date(proximoEvento.start_date).toLocaleString("es-CO", {
                timeZone: "America/Bogota",
                dateStyle: "full",
                timeStyle: "short",
              })}
              <br />
              {proximoEvento.location?.city}, {proximoEvento.location?.country}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <Link href="/mi-cuenta/entradas" className="btn btn-primary btn-sm">
                Ver entradas
              </Link>
            </div>
          </div>
          <span className="badge badge-green" style={{ alignSelf: "flex-start" }}>
            {entradasProximoEvento.length} {entradasProximoEvento.length === 1 ? "entrada" : "entradas"}
          </span>
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 20 }}>
          Todavia no tienes entradas para próximos eventos.{" "}
          <Link href="/eventos" className="text-link">
            Explora eventos
          </Link>
          .
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">{entradas.length}</div>
          <div className="label">Entradas totales</div>
        </div>
        <div className="stat-card">
          <div className="value">{proximas.length}</div>
          <div className="label">Para próximos eventos</div>
        </div>
      </div>
    </>
  );
}
