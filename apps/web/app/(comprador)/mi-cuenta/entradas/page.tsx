import QRCode from "qrcode";
import { requireComprador, getEventosAsignados } from "@/lib/admin";
import { getFourvenuesTicketsByEmail, type FVEvent, type FVTicket } from "@/lib/fourvenues";

export const dynamic = "force-dynamic";

const ESTADO_BADGE: Record<string, string> = {
  active: "badge badge-green",
  used: "badge",
  refunded: "badge badge-danger",
  cancelled: "badge badge-danger",
};

export default async function MisEntradasPage() {
  const { user } = await requireComprador();

  const eventosAsignados = await getEventosAsignados().catch(() => [] as string[]);
  const entradas = user.email
    ? await getFourvenuesTicketsByEmail(user.email, eventosAsignados).catch(() => [])
    : [];

  // Los QR se generan como data URL en el servidor a partir del codigo
  // que entrega FourVenues (mismo patron que usabamos con Bold: nada se
  // guarda en disco, solo se pinta la imagen).
  const qrPorBoleto = new Map<string, string>();
  await Promise.all(
    entradas.map(async ({ ticket }) => {
      if (!ticket.qr_code) return;
      const dataUrl = await QRCode.toDataURL(ticket.qr_code, { margin: 1, width: 220 });
      qrPorBoleto.set(ticket._id, dataUrl);
    })
  );

  const grupos = new Map<string, { event: FVEvent; tickets: FVTicket[] }>();
  for (const { ticket, event } of entradas) {
    const grupo = grupos.get(event._id);
    if (grupo) grupo.tickets.push(ticket);
    else grupos.set(event._id, { event, tickets: [ticket] });
  }
  const gruposOrdenados = [...grupos.values()].sort(
    (a, b) => new Date(b.event.start_date).getTime() - new Date(a.event.start_date).getTime()
  );

  return (
    <>
      <div className="eyebrow">TICKETING</div>
      <h1 style={{ marginBottom: 4 }}>Mis entradas</h1>
      <p className="page-lede">Todas tus entradas, por evento.</p>

      {gruposOrdenados.length === 0 ? (
        <p className="empty-state" style={{ marginTop: 20 }}>
          Todavia no tienes entradas. Las entradas que compres con el correo {user.email} apareceran aqui
          automaticamente.
        </p>
      ) : (
        gruposOrdenados.map(({ event, tickets }) => (
          <div key={event._id} style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <div>
                <h2 style={{ margin: "0 0 2px" }}>{event.name}</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {new Date(event.start_date).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "long", timeStyle: "short" })}
                  {" · "}
                  {event.location?.city}
                </p>
              </div>
              <span className="badge">
                {tickets.length} {tickets.length === 1 ? "entrada" : "entradas"}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14 }}>
              {tickets.map((ticket, i) => (
                <div
                  key={ticket._id}
                  className="card"
                  style={{ width: 200, textAlign: "center" }}
                >
                  {qrPorBoleto.get(ticket._id) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrPorBoleto.get(ticket._id)}
                      alt={`Codigo QR de la entrada ${i + 1}`}
                      width={160}
                      height={160}
                      style={{ display: "block", margin: "0 auto 10px", borderRadius: 8, background: "#fff" }}
                    />
                  )}
                  <p style={{ margin: "0 0 2px", fontSize: "0.85rem", fontWeight: 700 }}>{ticket.full_name || "Entrada"}</p>
                  <p style={{ margin: "0 0 8px", fontSize: "0.72rem", color: "var(--muted)" }}>{event.name}</p>
                  <span className={ESTADO_BADGE[ticket.status] ?? "badge"} style={{ fontSize: "0.68rem" }}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
