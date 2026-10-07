import Link from "next/link";
import { requireOrganizer, getEventoYTicketsDelOrganizador } from "@/lib/organizer";
import { fechaEvento, horarioEvento } from "@/lib/fv-format";
import { dineroCOP, serieDiaria } from "@/lib/fv-ui";
import { MqChart } from "@/components/mq-chart";

export const dynamic = "force-dynamic";

export default async function PanelResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordActualizada?: string }>;
}) {
  const { passwordActualizada } = await searchParams;
  const { organizer } = await requireOrganizer();
  const { evento, tickets } = await getEventoYTicketsDelOrganizador(organizer.fourvenues_event_id);

  const vendidos = tickets.filter((t) => t.status !== "refunded" && t.status !== "cancelled" && t.status !== "canceled");
  const ingresos = vendidos.reduce((acc, t) => acc + (t.total_price || 0), 0);
  const dentro = vendidos.filter((t) => t.entry_time).length;

  const tarifas = evento?.ticket_rates ?? [];
  const disponibles = tarifas.reduce((acc, r) => acc + (r.availability?.available ?? 0), 0);
  const capacidad = vendidos.length + disponibles;
  const pctVendido = capacidad > 0 ? Math.round((vendidos.length / capacidad) * 1000) / 10 : null;
  const pctDentro = vendidos.length > 0 ? Math.round((dentro / vendidos.length) * 1000) / 10 : null;

  const porTarifa = tarifas
    .map((r) => {
      const n = vendidos.filter((t) => t.ticket_rate_id === r._id).length;
      return { id: r._id, nombre: r.name, vendidos: n, total: n + (r.availability?.available ?? 0) };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.vendidos - a.vendidos);

  const actividad = [...vendidos]
    .filter((t) => t.created_at || t.entry_time)
    .sort(
      (a, b) =>
        new Date(b.entry_time || b.created_at || 0).getTime() - new Date(a.entry_time || a.created_at || 0).getTime()
    )
    .slice(0, 5)
    .map((t) => ({
      id: t._id,
      tipo: t.entry_time ? "Acceso validado" : "Venta",
      tarifa: tarifas.find((r) => r._id === t.ticket_rate_id)?.name ?? "Tarifa",
      valor: t.entry_time ? null : t.total_price,
      cuando: new Date(t.entry_time || t.created_at!).toLocaleString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
      }),
    }));

  const diasParaElEvento = evento
    ? Math.ceil((new Date(evento.end_date || evento.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <div className="mq-dash-title">
        <div className="eyebrow">PANEL DE POLINIZADOR</div>
        <h1>Bienvenido, {organizer.legal_name}.</h1>
        <p className="page-lede">Así se está moviendo tu evento ahora mismo.</p>
      </div>

      {passwordActualizada && (
        <p className="mq-ok" role="status">
          Tu contraseña se actualizó correctamente.
        </p>
      )}

      {!evento ? (
        <div className="mq-panel-card mq-soon-card" style={{ marginTop: 24 }}>
          <span className="mq-badge mq-badge-blue">Sin evento asignado</span>
          <h3>Todavía no tienes un evento vinculado.</h3>
          <p>
            Escríbele a Monarca Tickets para que te vinculen tu evento y empieces a ver tus ventas, asistentes y accesos
            aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="mq-kpis">
            <div className="mq-kpi">
              <small>Ingresos brutos</small>
              <strong>{dineroCOP(ingresos, evento.currency || "COP")}</strong>
              <span>{vendidos.length} {vendidos.length === 1 ? "boleto" : "boletos"} vendidos</span>
            </div>
            <div className="mq-kpi">
              <small>Tickets vendidos</small>
              <strong>
                {vendidos.length.toLocaleString("es-CO")}
                {capacidad > 0 && <span style={{ fontSize: 15, color: "#7f8da2" }}> / {capacidad.toLocaleString("es-CO")}</span>}
              </strong>
              <span>{pctVendido !== null ? `${pctVendido.toLocaleString("es-CO")}% de la capacidad en venta` : "—"}</span>
            </div>
            <div className="mq-kpi">
              <small>Asistentes dentro</small>
              <strong>{dentro.toLocaleString("es-CO")}</strong>
              {pctDentro !== null ? (
                <span className="mq-badge mq-badge-blue" style={{ alignSelf: "flex-start" }}>{pctDentro.toLocaleString("es-CO")}% de los vendidos</span>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="mq-kpi">
              <small>Cashless</small>
              <strong>—</strong>
              <span className="mq-badge mq-badge-blue" style={{ alignSelf: "flex-start" }}>Próximamente</span>
            </div>
          </div>

          <div className="mq-dash-grid">
            <div className="mq-panel-card">
              <div className="mq-panel-card-head">
                <b>Evolución de ventas</b>
                <small>Últimos 30 días</small>
              </div>
              <MqChart valores={serieDiaria(vendidos, 30)} />
            </div>
            <div className="mq-panel-card">
              <div className="mq-panel-card-head">
                <b>Actividad reciente</b>
              </div>
              {actividad.length === 0 ? (
                <p style={{ color: "#8492a6", fontSize: 14, marginTop: 14 }}>Aún no hay movimientos para mostrar.</p>
              ) : (
                actividad.map((a) => (
                  <div className="mq-row-item" key={a.id + a.tipo}>
                    <span>
                      {a.tipo} · {a.tarifa}
                      <br />
                      <small style={{ color: "#64748b" }}>{a.cuando}</small>
                    </span>
                    {a.valor !== null ? <b>{dineroCOP(a.valor, evento.currency || "COP")}</b> : <span className="mq-badge">OK</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mq-dash-grid mq-even">
            <div className="mq-panel-card">
              <div className="mq-panel-card-head">
                <b>Tickets por categoría</b>
                <small>Vendidos / en venta</small>
              </div>
              {porTarifa.length === 0 ? (
                <p style={{ color: "#8492a6", fontSize: 14, marginTop: 14 }}>Todavía no hay tarifas con movimiento.</p>
              ) : (
                porTarifa.map((r) => (
                  <div className="mq-row-item" key={r.id} style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <span>{r.nombre}</span>
                      <b>
                        {r.vendidos.toLocaleString("es-CO")} / {r.total.toLocaleString("es-CO")}
                      </b>
                    </div>
                    <div className="mq-bar">
                      <i style={{ width: `${Math.min(100, (r.vendidos / r.total) * 100)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mq-panel-card">
              <div className="mq-panel-card-head">
                <b>Tu evento</b>
                {diasParaElEvento !== null && (
                  <span className={`mq-badge${diasParaElEvento >= 0 ? "" : " mq-badge-muted"}`}>
                    {diasParaElEvento > 0 ? `Faltan ${diasParaElEvento} días` : diasParaElEvento === 0 ? "Es hoy" : "Finalizado"}
                  </span>
                )}
              </div>
              <h3 style={{ margin: "14px 0 6px", fontSize: 20, overflowWrap: "anywhere" }}>{evento.name}</h3>
              <p style={{ color: "#8492a6", fontSize: 14, lineHeight: 1.7 }}>
                {fechaEvento(evento, "full")} · {horarioEvento(evento)}
                <br />
                {[evento.location?.name, evento.location?.city].filter(Boolean).join(" — ")}
              </p>
              <div className="mq-actions">
                <Link href="/panel/mi-evento" className="mq-btn mq-primary">
                  Ver mi evento
                </Link>
                <Link href={`/eventos/${evento.slug}`} className="mq-btn mq-ghost" target="_blank">
                  Página pública ↗
                </Link>
              </div>
            </div>
          </div>

          <div className="mq-panel-card mq-soon-card">
            <span className="mq-badge mq-badge-blue">Próximamente</span>
            <h3>Canales, RRPP y Cashless en vivo.</h3>
            <p>
              Los links individuales de RRPP, las comisiones por canal y el consumo Cashless se conectan en la siguiente
              fase de la integración. Hoy ves ventas, asistentes y accesos reales desde FourVenues.
            </p>
          </div>
        </>
      )}
    </>
  );
}
