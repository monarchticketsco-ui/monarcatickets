import Link from "next/link";
import { requireOrganizer, getEventoYTicketsDelOrganizador } from "@/lib/organizer";
import { fechaEvento, horarioEvento } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

export default async function MiEventoPage() {
  const { organizer } = await requireOrganizer();
  const { evento } = await getEventoYTicketsDelOrganizador(organizer.fourvenues_event_id);

  if (!evento) {
    return (
      <>
        <div className="eyebrow">MI EVENTO</div>
        <h1>Sin evento asignado</h1>
        <p className="empty-state" style={{ marginTop: 20 }}>
          Todavia no tienes un evento asignado. Escribele a Monarca Tickets para que te vinculen el evento en
          FourVenues.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="eyebrow">MI EVENTO</div>
      <h1 style={{ marginBottom: 4 }}>{evento.name}</h1>
      <p className="page-lede">
        {fechaEvento(evento, "full")} · {horarioEvento(evento)}
      </p>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="form-row" style={{ flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: "1 1 240px" }}>
            <small className="muted">LUGAR</small>
            <p style={{ margin: "4px 0 0" }}>
              {evento.location?.name}
              <br />
              {evento.location?.full_address || `${evento.location?.city}, ${evento.location?.country}`}
            </p>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <small className="muted">CODIGO</small>
            <p style={{ margin: "4px 0 0" }}>{evento.code || "—"}</p>
          </div>
          <div style={{ flex: "1 1 120px" }}>
            <small className="muted">EDAD MINIMA</small>
            <p style={{ margin: "4px 0 0" }}>{evento.age ? `${evento.age}+` : "Todo publico"}</p>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <small className="muted">DRESS CODE</small>
            <p style={{ margin: "4px 0 0" }}>{evento.outfit || "—"}</p>
          </div>
        </div>
        {evento.description && (
          <>
            <small className="muted">DESCRIPCION</small>
            <p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{evento.description}</p>
          </>
        )}
        <div style={{ marginTop: 18 }}>
          <Link href={`/eventos/${evento.slug}`} className="btn btn-secondary btn-sm" target="_blank">
            Ver pagina publica ↗
          </Link>
        </div>
      </div>

      <div className="section-head">
        <h2>Tarifas</h2>
      </div>
      {!evento.ticket_rates || evento.ticket_rates.length === 0 ? (
        <p className="empty-state">Este evento todavia no tiene tarifas configuradas en FourVenues.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {evento.ticket_rates.map((tarifa) => (
            <div key={tarifa._id} className="card" style={{ flex: "1 1 220px", minWidth: 220 }}>
              <strong>{tarifa.name}</strong>
              <p style={{ margin: "6px 0", fontSize: "1.3rem", fontWeight: 700 }}>
                {(tarifa.current_price?.price ?? 0).toLocaleString("es-CO", {
                  style: "currency",
                  currency: evento.currency || "COP",
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                {tarifa.availability.sold} vendidas · {tarifa.availability.available} disponibles
              </p>
              <span className={`badge ${tarifa.available ? "badge-green" : "badge-danger"}`} style={{ marginTop: 10, display: "inline-block" }}>
                {tarifa.available ? "En venta" : "Agotada"}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
