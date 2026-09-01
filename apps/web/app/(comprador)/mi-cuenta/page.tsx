import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarPerfil } from "./actions";

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente de pago",
  pagada: "Pagada",
  fallida: "Fallida",
  reembolsada: "Reembolsada",
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
    <main>
      <h1>Mi cuenta</h1>
      {error && <p role="alert">{error}</p>}

      <h2>Perfil</h2>
      <p>
        Correo: {user.email} — Rol: {perfil?.role ?? "comprador"}
      </p>
      <form action={actualizarPerfil}>
        <label>
          Nombre completo
          <input name="full_name" type="text" defaultValue={perfil?.full_name ?? ""} />
        </label>
        <label>
          Telefono
          <input name="phone" type="text" defaultValue={perfil?.phone ?? ""} />
        </label>
        <button type="submit">Guardar</button>
      </form>

      <h2>Mis compras</h2>
      {!ordenes || ordenes.length === 0 ? (
        <p>Todavia no has comprado boletos.</p>
      ) : (
        <ul>
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
              <li key={orden.id}>
                <p>
                  <strong>{evento?.name ?? "Evento"}</strong>
                  {evento && ` — ${evento.venue}, ${evento.city} — ${new Date(evento.starts_at).toLocaleString("es-CO")}`}
                </p>
                <p>
                  Estado: {ESTADO_LABEL[orden.status] ?? orden.status} — Total: $
                  {orden.total_cop.toLocaleString("es-CO")} — Comprado el{" "}
                  {new Date(orden.created_at).toLocaleDateString("es-CO")}
                </p>
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.ticket_types?.name ?? "Boleto"} x{item.quantity} — $
                      {item.unit_price_cop.toLocaleString("es-CO")} c/u
                    </li>
                  ))}
                </ul>
                {orden.status === "pagada" && (
                  <p>
                    <em>
                      Boletos individuales con QR: todavia no se generan automaticamente
                      (proxima fase) — esta orden ya quedo confirmada como pagada.
                    </em>
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
