import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";
import { buscarOCrearComprador } from "@/lib/comprador-guest";
import { crearLinkDePago, BoldError } from "@/lib/bold";
import { validarAsistentes } from "@/lib/asistentes";

// Crea una orden + link de pago Bold para un comprador que no tiene
// sesion en el sitio (ej. alguien comprando por WhatsApp). Misma logica
// de reserva de cupo que /api/checkout (el flujo del sitio web), pero
// el comprador se identifica por sus datos de contacto en vez de una
// cookie de sesion.
export async function POST(req: NextRequest) {
  const auth = await requireApiClient(req, "ordenes:crear");
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const ticketTypeId = body?.ticket_type_id;
  const quantity = Number(body?.cantidad);
  const comprador = body?.comprador;

  if (
    !ticketTypeId ||
    typeof ticketTypeId !== "string" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10 ||
    !comprador?.correo ||
    !comprador?.nombre
  ) {
    return NextResponse.json(
      { error: "datos_invalidos", detalle: "Se requiere ticket_type_id, cantidad (1-10) y comprador.{nombre,correo}" },
      { status: 400 }
    );
  }

  // Boletos nominativos: un asistente (nombre + cedula) por cada unidad,
  // igual que en el checkout del sitio -- ver lib/asistentes.ts.
  const asistentesResult = validarAsistentes(body?.asistentes, quantity);
  if (!asistentesResult.ok) {
    return NextResponse.json({ error: "asistentes_invalidos", detalle: asistentesResult.error }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: tipo } = await admin
    .from("ticket_types")
    .select("id, name, price_cop, event_id, events(name, status)")
    .eq("id", ticketTypeId)
    .single();

  const evento = tipo?.events as unknown as { name: string; status: string } | null;

  if (!tipo || !evento || evento.status !== "en_venta") {
    return NextResponse.json({ error: "boleto_no_disponible" }, { status: 404 });
  }

  let compradorId: string;
  try {
    compradorId = await buscarOCrearComprador({
      correo: comprador.correo,
      nombre: comprador.nombre,
      telefono: comprador.telefono,
    });
  } catch {
    return NextResponse.json({ error: "error_creando_comprador" }, { status: 500 });
  }

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
    .insert({ user_id: compradorId, event_id: tipo.event_id, total_cop: totalCop, status: "pendiente" })
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
    asistentes: asistentesResult.asistentes,
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
      email: comprador.correo,
    });

    return NextResponse.json({
      orden_id: orden.id,
      estado: "pendiente",
      total_cop: totalCop,
      checkout_url: link.url,
    });
  } catch (e) {
    await admin.rpc("liberar_cupo", { p_ticket_type_id: ticketTypeId, p_cantidad: quantity });
    await admin.from("orders").update({ status: "fallida" }).eq("id", orden.id);

    const detalle = e instanceof BoldError ? e.message : "error_desconocido";
    return NextResponse.json({ error: "error_creando_pago", detalle }, { status: 502 });
  }
}
