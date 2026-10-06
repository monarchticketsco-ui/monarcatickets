import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { aforoDelEvento, getEventosConTickets, moneda } from "@/lib/fv-admin";
import { eventoVigente, fechaCorta, horarioEvento } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

export default async function CrmEventosPage() {
  await requireAdmin();

  let eventos: Awaited<ReturnType<typeof getEventosConTickets>> = [];
  let error = false;
  try {
    eventos = await getEventosConTickets();
  } catch {
    error = true;
  }

  return (
    <>
      <h1>Eventos</h1>
      <p className="page-lede">
        Espejo en vivo de FourVenues. Los eventos, localidades y precios se crean y editan en FourVenues; aqui solo se
        consultan. Para que un Polinizador vea su evento, asignalo desde su ficha en Polinizadores.
      </p>

      {error && <p className="empty-state">No pudimos consultar FourVenues en este momento.</p>}

      {!error && eventos.length === 0 ? (
        <p className="empty-state">No hay eventos en FourVenues.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Lugar</th>
                <th>Fecha</th>
                <th>Localidades</th>
                <th>Vendidas</th>
                <th>Ingresos brutos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {eventos.map(({ event, vendidos, ingresos }) => {
                const aforo = aforoDelEvento(event);
                return (
                  <tr key={event._id}>
                    <td>
                      <strong>{event.name}</strong>
                      <div className="muted" style={{ fontSize: "0.78rem" }}>ID {event._id}</div>
                    </td>
                    <td>
                      {event.location?.name}
                      <div className="muted" style={{ fontSize: "0.78rem" }}>{event.location?.city}</div>
                    </td>
                    <td>
                      {fechaCorta(event)}
                      <div className="muted" style={{ fontSize: "0.78rem" }}>{horarioEvento(event)}</div>
                    </td>
                    <td>{event.ticket_rates?.length ?? 0}</td>
                    <td>
                      {vendidos}
                      <div className="muted" style={{ fontSize: "0.78rem" }}>{aforo.disponibles} disp.</div>
                    </td>
                    <td>{moneda(ingresos, event.currency)}</td>
                    <td>
                      <span className={eventoVigente(event) ? "badge badge-green" : "badge"}>
                        {eventoVigente(event) ? "Vigente" : "Finalizado"}
                      </span>
                    </td>
                    <td>
                      <Link href={`/eventos/${event.slug}`} className="btn btn-secondary btn-sm" target="_blank">
                        Ver publico ↗
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
