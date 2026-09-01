import { redirect } from "next/navigation";
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

  const { data: ordenes } = await supabase
    .from("orders")
    .select(
      "id, total_cop, status, created_at, events(name, venue, city, starts_at), order_items(id, quantity, unit_price_cop, ticket_types(name))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
      {!ordenes || ordenes.length === 0 ? (
        <p className="empty-state">Todavia no has comprado boletos.</p>
      ) : (
        <ul className="list-plain">
          {ordenes.map((orden) => {
            const evento = orden.events as unknown as {
              name: string;
              venue: string;
              city: string;
              starts_at: string;
            } | null;
            const items = (orden.order_items ?? []) as unknown as {
              id: string;
              quantity: number;
              unit_price_cop: number;
              ticket_types: { name: string } | null;
            }[];

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

                {orden.status === "pagada" && (
                  <p className="muted" style={{ fontSize: "0.85rem", marginTop: 10, marginBottom: 0 }}>
                    Boletos individuales con QR: todavia no se generan automaticamente (proxima
                    fase) — esta orden ya quedo confirmada como pagada.
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
