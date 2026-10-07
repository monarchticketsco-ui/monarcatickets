import Link from "next/link";
import QRCode from "qrcode";
import { requireComprador } from "@/lib/admin";
import { getFourvenuesTicketsByEmail, type FVEvent, type FVTicket } from "@/lib/fourvenues";
import { eventoVigente, fechaEvento, horarioEvento } from "@/lib/fv-format";
import { estadoBoleto } from "@/lib/fv-ui";

export const dynamic = "force-dynamic";

const TONO: Record<string, string> = {
  ok: "mq-badge",
  info: "mq-badge mq-badge-blue",
  malo: "mq-badge mq-badge-red",
  neutro: "mq-badge mq-badge-muted",
};

export default async function MisEntradasPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const historial = tab === "historial";
  const { user } = await requireComprador();

  const entradas = user.email ? await getFourvenuesTicketsByEmail(user.email).catch(() => []) : [];

  // Los QR se generan en el servidor como data URL a partir del codigo que
  // entrega FourVenues: nada se guarda en disco, solo se pinta la imagen.
  const qrPorBoleto = new Map<string, string>();
  if (!historial) {
    await Promise.all(
      entradas
        .filter(({ event }) => eventoVigente(event))
        .map(async ({ ticket }) => {
          if (!ticket.qr_code) return;
          qrPorBoleto.set(ticket._id, await QRCode.toDataURL(ticket.qr_code, { margin: 1, width: 240 }));
        })
    );
  }

  const grupos = new Map<string, { event: FVEvent; tickets: FVTicket[] }>();
  for (const { ticket, event } of entradas) {
    if (eventoVigente(event) === historial) continue; // proximos vs historial
    const grupo = grupos.get(event._id);
    if (grupo) grupo.tickets.push(ticket);
    else grupos.set(event._id, { event, tickets: [ticket] });
  }
  const orden = historial ? -1 : 1;
  const gruposOrdenados = [...grupos.values()].sort(
    (a, b) => orden * (new Date(a.event.start_date).getTime() - new Date(b.event.start_date).getTime())
  );

  return (
    <>
      <div className="mq-dash-title">
        <div className="eyebrow">TICKETING</div>
        <h1>Mis entradas</h1>
        <p className="page-lede">Todas tus entradas, evento por evento.</p>
      </div>

      <div className="mq-tabs" role="tablist" aria-label="Entradas">
        <Link href="/mi-cuenta/entradas" className={historial ? "" : "is-active"} role="tab" aria-selected={!historial}>
          Próximos
        </Link>
        <Link href="/mi-cuenta/entradas?tab=historial" className={historial ? "is-active" : ""} role="tab" aria-selected={historial}>
          Historial
        </Link>
      </div>

      {gruposOrdenados.length === 0 ? (
        <div className="mq-panel-card mq-soon-card" style={{ marginTop: 24 }}>
          <h3>{historial ? "Aún no tienes eventos anteriores." : "Todavía no tienes entradas."}</h3>
          <p>
            Las entradas que compres con el correo {user.email} aparecen aquí automáticamente.{" "}
            <Link href="/eventos" className="mq-textlink">
              Explora eventos
            </Link>
            .
          </p>
        </div>
      ) : (
        gruposOrdenados.map(({ event, tickets }) => (
          <section key={event._id}>
            <div className="mq-event-label">
              <div>
                <small>{[event.location?.name, event.location?.city].filter(Boolean).join(" · ") || "Evento"}</small>
                <h2>{event.name}</h2>
              </div>
              <span>
                {tickets.length} {tickets.length === 1 ? "entrada" : "entradas"} · {fechaEvento(event)} · {horarioEvento(event)}
              </span>
            </div>

            <div className="mq-ticket-grid">
              {tickets.map((ticket, i) => {
                const estado = estadoBoleto(ticket);
                const qr = qrPorBoleto.get(ticket._id);
                return (
                  <div key={ticket._id} className="mq-tcard">
                    <div>
                      <span className={TONO[estado.tono]}>{estado.texto}</span>
                      <small>
                        Entrada {i + 1} de {tickets.length}
                      </small>
                      <h3>{ticket.full_name || "Entrada"}</h3>
                      <p>
                        {event.name}
                        {ticket.entry_time && (
                          <>
                            <br />
                            Ingresó el{" "}
                            {new Date(ticket.entry_time).toLocaleString("es-CO", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "America/Bogota",
                            })}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="mq-qrbox">
                      {qr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qr} alt={`Código QR de la entrada ${i + 1}`} width={128} height={128} />
                      ) : (
                        <div className="mq-qr-off">{historial ? "Evento finalizado" : "QR no disponible"}</div>
                      )}
                      {qr && <small>QR de acceso</small>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </>
  );
}
