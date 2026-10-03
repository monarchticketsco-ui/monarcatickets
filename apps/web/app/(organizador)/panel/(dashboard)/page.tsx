import Link from "next/link";
import { requireOrganizer, getEventoYTicketsDelOrganizador } from "@/lib/organizer";

export const dynamic = "force-dynamic";

export default async function PanelResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordActualizada?: string }>;
}) {
  const { passwordActualizada } = await searchParams;
  const { organizer } = await requireOrganizer();
  const { evento, tickets } = await getEventoYTicketsDelOrganizador(organizer.fourvenues_event_id);

  const vendidos = tickets.filter((t) => t.status !== "refunded" && t.status !== "cancelled");
  const ingresos = vendidos.reduce((acc, t) => acc + (t.total_price || 0), 0);

  const diasParaElEvento = evento
    ? Math.ceil((new Date(evento.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <h1 style={{ marginBottom: 0 }}>{organizer.legal_name}</h1>
      </div>
      {passwordActualizada && (
        <p className="alert-success" role="status">
          Tu contraseña se actualizo correctamente.
        </p>
      )}

      {!evento ? (
        <div className="empty-state" style={{ marginTop: 20 }}>
          Todavia no tienes un evento asignado. Escribele a Monarca Tickets para que te vinculen el evento en
          FourVenues y empieces a ver tus datos aqui.
        </div>
      ) : (
        <>
          <div className="card" style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between" }}>
            <div>
              <small className="muted">TU EVENTO</small>
              <h2 style={{ margin: "6px 0" }}>{evento.name}</h2>
              <p className="muted" style={{ margin: 0 }}>
                {new Date(evento.start_date).toLocaleString("es-CO", {
                  timeZone: "America/Bogota",
                  dateStyle: "full",
                  timeStyle: "short",
                })}
                <br />
                {evento.location?.name ? `${evento.location.name} — ` : ""}
                {evento.location?.city}, {evento.location?.country}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <Link href="/panel/mi-evento" className="btn btn-primary btn-sm">
                  Ver mi evento
                </Link>
                <Link href={`/eventos/${evento.slug}`} className="btn btn-secondary btn-sm" target="_blank">
                  Ver pagina publica ↗
                </Link>
              </div>
            </div>
            {diasParaElEvento !== null && (
              <span className={`badge ${diasParaElEvento >= 0 ? "badge-green" : ""}`} style={{ alignSelf: "flex-start" }}>
                {diasParaElEvento > 0
                  ? `Faltan ${diasParaElEvento} dias`
                  : diasParaElEvento === 0
                    ? "Es hoy"
                    : "Evento finalizado"}
              </span>
            )}
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="value">{vendidos.length}</div>
              <div className="label">Entradas vendidas</div>
            </div>
            <div className="stat-card">
              <div className="value">
                {ingresos.toLocaleString("es-CO", { style: "currency", currency: evento.currency || "COP", maximumFractionDigits: 0 })}
              </div>
              <div className="label">Ingresos brutos</div>
            </div>
            <div className="stat-card">
              <div className="value">{evento.ticket_rates?.length ?? 0}</div>
              <div className="label">Tarifas activas</div>
            </div>
          </div>

          <div className="section-head">
            <h2>Accesos rapidos</h2>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/panel/ventas" className="card" style={{ padding: "16px 20px", textDecoration: "none", color: "inherit", flex: "1 1 200px" }}>
              <strong>Ventas & Tickets</strong>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>Desglose por tarifa</p>
            </Link>
            <Link href="/panel/asistentes" className="card" style={{ padding: "16px 20px", textDecoration: "none", color: "inherit", flex: "1 1 200px" }}>
              <strong>Asistentes</strong>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>{vendidos.length} personas con entrada</p>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
