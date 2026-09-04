import { redirect } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { actualizarPerfil } from "./actions";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente de pago",
  pagada: "Pagada",
  fallida: "Fallida",
  reembolsada: "Reembolsada",
};

const ESTADO_BADGE: Record<string, string> = {
  pendiente: "badge badge-warning",
  pagada: "badge badge-green",
  fallida: "badge badge-danger",
  reembolsada: "badge",
};

const TICKET_ESTADO_LABEL: Record<string, string> = {
  valido: "Valido",
  usado: "Usado",
  cancelado: "Cancelado",
  transferido: "Transferido",
};

type OrdenConTickets = {
  id: string;
  total_cop: number;
  status: string;
  created_at: string;
  events: { name: string; venue: string; city: string; starts_at: string } | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price_cop: number;
    ticket_types: { name: string } | null;
    tickets: { id: string; qr_signed: string; status: string }[];
  }[];
};

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  const { data: ordenesData } = await supabase
    .from("orders")
    .select(
      "id, total_cop, status, created_at, events(name, venue, city, starts_at), order_items(id, quantity, unit_price_cop, ticket_types(name), tickets(id, qr_signed, status))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const ordenes = (ordenesData ?? []) as unknown as OrdenConTickets[];

  // Los QR se generan como data URL en el servidor (no hace falta guardar
  // archivos): cada boleto pagado obtiene la suya, indexada por id de
  // boleto, para pintarlas mas abajo sin volver a tocar la base de datos.
  const idsBoletos = ordenes.flatMap((orden) => orden.order_items.flatMap((item) => item.tickets.map((t) => t.id)));
  const qrPorBoleto = new Map<string, string>();
  await Promise.all(
    ordenes.flatMap((orden) =>
      orden.order_items.flatMap((item) =>
        item.tickets.map(async (ticket) => {
          const dataUrl = await QRCode.toDataURL(ticket.qr_signed, { margin: 1, width: 220 });
          qrPorBoleto.set(ticket.id, dataUrl);
        })
      )
    )
  );
  void idsBoletos; // solo documenta la forma de qrPorBoleto, no se usa directo

  return (
    <main className="container">
      <h1>Mi cuenta</h1>
      {error && <p role="alert">{error}</p>}

      <h2>Perfil</h2>
      <div className="card" style={{ maxWidth: 440 }}>
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

      <h2>Mis compras</h2>
      {ordenes.length === 0 ? (
        <p className="empty-state">Todavia no has comprado boletos.</p>
      ) : (
        <ul className="list-plain">
          {ordenes.map((orden) => {
            const evento = orden.events;
            const items = orden.order_items ?? [];
            const totalBoletos = items.reduce((sum, item) => sum + item.tickets.length, 0);

            return (
              <li key={orden.id} className="card">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{evento?.name ?? "Evento"}</h3>
                    {evento && (
                      <p className="muted" style={{ margin: 0 }}>
                        {evento.venue}, {evento.city} — {new Date(evento.starts_at).toLocaleString("es-CO")}
                      </p>
                    )}
                  </div>
                  <span className={ESTADO_BADGE[orden.status] ?? "badge"}>
                    {ESTADO_LABEL[orden.status] ?? orden.status}
                  </span>
                </div>

                <ul className="list-plain" style={{ gap: 4, marginTop: 14 }}>
                  {items.map((item) => (
                    <li key={item.id} className="muted">
                      {item.ticket_types?.name ?? "Boleto"} x{item.quantity} — $
                      {item.unit_price_cop.toLocaleString("es-CO")} c/u
                    </li>
                  ))}
                </ul>

                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                  Total: ${orden.total_cop.toLocaleString("es-CO")} · Comprado el{" "}
                  {new Date(orden.created_at).toLocaleDateString("es-CO")}
                </p>

                {orden.status === "pagada" && totalBoletos > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <p className="muted" style={{ fontSize: "0.82rem", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Tus boletos
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                      {items.flatMap((item) =>
                        item.tickets.map((ticket, i) => (
                          <Link
                            key={ticket.id}
                            href={`/mi-cuenta/boleto/${ticket.id}`}
                            style={{
                              width: 180,
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius)",
                              padding: 12,
                              textAlign: "center",
                              display: "block",
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            {qrPorBoleto.get(ticket.id) && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={qrPorBoleto.get(ticket.id)}
                                alt={`Codigo QR del boleto ${i + 1}`}
                                width={140}
                                height={140}
                                style={{ display: "block", margin: "0 auto 8px", borderRadius: 8, background: "#fff" }}
                              />
                            )}
                            <p style={{ margin: "0 0 2px", fontSize: "0.8rem", fontWeight: 700 }}>
                              {item.ticket_types?.name ?? "Boleto"} #{i + 1}
                            </p>
                            <span
                              className={ticket.status === "valido" ? "badge badge-green" : "badge"}
                              style={{ fontSize: "0.68rem" }}
                            >
                              {TICKET_ESTADO_LABEL[ticket.status] ?? ticket.status}
                            </span>
                            <p style={{ margin: "8px 0 0", fontSize: "0.7rem", color: "var(--green)" }}>
                              Ver / descargar →
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {orden.status === "pagada" && totalBoletos === 0 && (
                  <p className="muted" style={{ fontSize: "0.85rem", marginTop: 10, marginBottom: 0 }}>
                    Estamos generando tus boletos con codigo QR — si llevas mas de unos minutos
                    viendo este mensaje, escribenos a soporte.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
