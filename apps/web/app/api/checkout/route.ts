import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearLinkDePago, BoldError } from "@/lib/bold";

// Paso 2 del flujo de pago (blueprint Fig. 3):
// recibe { ticketTypeId, quantity }, valida contra el cupo disponible,
// reserva el cupo de forma atomica (reservar_cupo, migracion 0003), crea
// la orden en estado 'pendiente' y llama a Bold para crear el link de
// pago. El comprador se redirige al link devuelto.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "no_autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ticketTypeId = body?.ticketTypeId;
  const quantity = Number(body?.quantity);

  if (
    !ticketTypeId ||
    typeof ticketTypeId !== "string" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10
  ) {
    return NextResponse.json({ error: "datos_invalidos" }, { status: 400 });
  }

  const { data: tipo } = await supabase
    .from("ticket_types")
    .select("id, name, price_cop, event_id, events(name, status)")
    .eq("id", ticketTypeId)
    .single();

  const evento = tipo?.events as unknown as { name: string; status: string } | null;

  if (!tipo || !evento || !["publicado", "en_venta"].includes(evento.status)) {
    return NextResponse.json({ error: "boleto_no_disponible" }, { status: 404 });
  }

  const admin = createAdminClient();

  // Reserva atomica de cupo — falla con 'sin_cupo' si no alcanza.
  const { error: reservaError } = await admin.rpc("reservar_cupo", {
    p_ticket_type_id: ticketTypeId,
    p_cantidad: quantity,
  });

  if (reservaError) {
    return NextResponse.json({ error: "sin_cupo" }, { status: 409 });
  }

  const totalCop = tipo.price_cop * quantity;

  const { data: orden, error: ordenError } = await admin
    .from("orders")
    .insert({ user_id: user.id, event_id: tipo.event_id, total_cop: totalCop, status: "pendiente" })
    .select("id")
    .single();

  if (ordenError || !orden) {
    await admin.rpc("liberar_cupo", { p_ticket_type_id: ticketTypeId, p_cantidad: quantity });
    return NextResponse.json({ error: "error_creando_orden" }, { status: 500 });
  }

  const { error: itemError } = await admin.from("order_items").insert({
    order_id: orden.id,
    ticket_type_id: ticketTypeId,
    quantity,
    unit_price_cop: tipo.price_cop,
  });

  if (itemError) {
    await admin.rpc("liberar_cupo", { p_ticket_type_id: ticketTypeId, p_cantidad: quantity });
    await admin.from("orders").update({ status: "fallida" }).eq("id", orden.id);
    return NextResponse.json({ error: "error_creando_orden" }, { status: 500 });
  }

  try {
    const link = await crearLinkDePago({
      referencia: orden.id,
      montoCop: totalCop,
      descripcion: `${evento.name} - ${tipo.name} x${quantity}`,
      email: user.email ?? undefined,
    });

    return NextResponse.json({ checkoutUrl: link.url });
  } catch (e) {
    await admin.rpc("liberar_cupo", { p_ticket_type_id: ticketTypeId, p_cantidad: quantity });
    await admin.from("orders").update({ status: "fallida" }).eq("id", orden.id);

    const detalle = e instanceof BoldError ? e.message : "error_desconocido";
    return NextResponse.json({ error: "error_creando_pago", detalle }, { status: 502 });
  }
}
