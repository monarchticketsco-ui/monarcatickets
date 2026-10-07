import Link from "next/link";
import { requireComprador } from "@/lib/admin";
import { getFourvenuesTicketsByEmail } from "@/lib/fourvenues";
import { eventoVigente, fechaEvento, horarioEvento } from "@/lib/fv-format";

export const dynamic = "force-dynamic";

export default async function MiCuentaResumenPage() {
  const { supabase, user } = await requireComprador();

  const { data: perfil } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  // Mis entradas sale de FourVenues, buscando por el correo de la cuenta.
  const entradas = user.email ? await getFourvenuesTicketsByEmail(user.email).catch(() => []) : [];

  const proximas = entradas
    .filter((e) => eventoVigente(e.event))
    .sort((a, b) => new Date(a.event.start_date).getTime() - new Date(b.event.start_date).getTime());

  const proximoEvento = proximas[0]?.event;
  const entradasProximoEvento = proximas.filter((e) => e.event._id === proximoEvento?._id);
  const eventosAnteriores = new Set(entradas.filter((e) => !eventoVigente(e.event)).map((e) => e.event._id)).size;

  const nombre = perfil?.full_name?.trim().split(" ")[0] || "de vuelta";

  return (
    <>
      <div className="mq-dash-title">
        <div className="eyebrow">PRÓXIMA EXPERIENCIA</div>
        <h1>Hola, {nombre}</h1>
        <p className="page-lede">Todo listo para tu próxima experiencia.</p>
      </div>

      {proximoEvento ? (
        <div className="mq-user-hero">
          <div>
            <small>PRÓXIMO EVENTO</small>
            <h2>{proximoEvento.name}</h2>
            <p>
              {fechaEvento(proximoEvento, "full")} · {horarioEvento(proximoEvento)}
              <br />
              {[proximoEvento.location?.name, proximoEvento.location?.city].filter(Boolean).join(" · ")}
            </p>
            <div className="mq-actions">
              <Link href="/mi-cuenta/entradas" className="mq-btn mq-primary">
                Ver entradas
              </Link>
              <Link href="/mi-cuenta/cashless" className="mq-btn mq-ghost">
                Cashless
              </Link>
            </div>
          </div>
          <div className="mq-user-art" aria-hidden="true">
            <div className="mq-ticket">
              <div className="mq-eyebrow">TICKET DIGITAL</div>
              <h2>{proximoEvento.name}</h2>
              <p className="mq-sub">{proximoEvento.location?.city || "Colombia"}</p>
              <div className="mq-line" />
              <div className="mq-row">
                <div>
                  <small>{fechaEvento(proximoEvento)}</small>
                  <br />
                  <span className="mq-time">{horarioEvento(proximoEvento)}</span>
                </div>
                <div className="mq-qr" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mq-panel-card mq-soon-card" style={{ marginTop: 24 }}>
          <span className="mq-badge mq-badge-blue">Sin planes por ahora</span>
          <h3>Todavía no tienes entradas para próximos eventos.</h3>
          <p>
            Las entradas que compres con el correo {user.email} aparecen aquí automáticamente.{" "}
            <Link href="/eventos" className="mq-textlink">
              Explora eventos
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mq-kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="mq-kpi">
          <small>Entradas</small>
          <strong>{entradas.length}</strong>
          <span>{proximas.length} para próximos eventos</span>
        </div>
        <div className="mq-kpi">
          <small>Este evento</small>
          <strong>{entradasProximoEvento.length}</strong>
          <span>{entradasProximoEvento.length === 1 ? "entrada" : "entradas"}</span>
        </div>
        <div className="mq-kpi">
          <small>Saldo Cashless</small>
          <strong>—</strong>
          <span className="mq-badge mq-badge-blue" style={{ alignSelf: "flex-start" }}>
            Próximamente
          </span>
        </div>
      </div>

      <div className="mq-panel-card mq-secondary">
        <div>
          <div className="mq-eyebrow">EVENTOS ANTERIORES</div>
          <b>
            {eventosAnteriores > 0
              ? `${eventosAnteriores} ${eventosAnteriores === 1 ? "evento" : "eventos"} en tu historial.`
              : "Tu historial vive en Mis entradas."}
          </b>
        </div>
        <Link href="/mi-cuenta/entradas?tab=historial" className="mq-btn mq-ghost">
          Ver historial →
        </Link>
      </div>
    </>
  );
}
