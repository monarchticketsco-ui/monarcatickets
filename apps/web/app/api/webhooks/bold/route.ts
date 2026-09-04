import { NextRequest, NextResponse } from "next/server";
import { verificarFirmaWebhook } from "@/lib/bold";
import { createAdminClient } from "@/lib/supabase/admin";
import { generarBoletosParaOrden } from "@/lib/tickets";
import { enviarConfirmacionCompra } from "@/lib/email";

// Paso 5 del flujo de pago (blueprint Fig. 3): unica fuente de verdad de
// que un pago se confirmo. Bold reintenta si no respondemos 200 en <2s
// (15min, 1h, 4h, 8h, 24h), asi que este handler debe ser rapido e
// idempotente.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-bold-signature");

  if (!verificarFirmaWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "firma_invalida" }, { status: 401 });
  }

  let evento: any;
  try {
    evento = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "json_invalido" }, { status: 400 });
  }

  const tipo: string | undefined = evento?.type;
  const data = evento?.data ?? {};
  const ordenId: string | undefined = data?.metadata?.reference;
  const boldPaymentId: string | undefined = data?.payment_id ?? evento?.subject;

  if (!ordenId || !boldPaymentId || !tipo) {
    return NextResponse.json({ error: "payload_incompleto" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: ordenActual } = await admin
    .from("orders")
    .select("id, status")
    .eq("id", ordenId)
    .single();

  if (!ordenActual) {
    return NextResponse.json({ error: "orden_no_encontrada" }, { status: 404 });
  }

  // Idempotencia: un reintento del mismo evento no debe reprocesar nada.
  if (ordenActual.status === "pagada" || ordenActual.status === "fallida") {
    return NextResponse.json({ ok: true, ya_procesada: true });
  }

  if (tipo === "SALE_APPROVED") {
    const { data: ordenPagada, error } = await admin
      .from("orders")
      .update({ status: "pagada", bold_payment_id: boldPaymentId })
      .eq("id", ordenId)
      .eq("status", "pendiente")
      .select("user_id, total_cop, event_id")
      .single();

    if (error || !ordenPagada) {
      return NextResponse.json({ error: "error_actualizando_orden" }, { status: 500 });
    }

    // Fase 2.1: generar los boletos individuales con QR firmado y avisarle
    // al comprador por correo. El estado 'pagada' ya es la fuente de
    // verdad del pago -- si alguno de estos dos pasos falla, no revertimos
    // ni fallamos el webhook (Bold reintentaria un evento que en realidad
    // ya se proceso). Simplemente queda registrado en los logs para
    // resolverlo a mano.
    try {
      await generarBoletosParaOrden(admin, ordenId, ordenPagada.user_id);
    } catch (err) {
      console.error(`[bold webhook] No se pudieron generar los boletos de la orden ${ordenId}:`, err);
    }

    try {
      const [{ data: authUser }, { data: perfil }, { data: evento }, { data: items }] = await Promise.all([
        admin.auth.admin.getUserById(ordenPagada.user_id),
        admin.from("profiles").select("full_name").eq("id", ordenPagada.user_id).single(),
        admin.from("events").select("name, venue, city, starts_at").eq("id", ordenPagada.event_id).single(),
        admin.from("order_items").select("quantity").eq("order_id", ordenId),
      ]);

      const correo = authUser?.user?.email;
      if (correo && evento) {
        const cantidadBoletos = (items ?? []).reduce((sum, item) => sum + (item.quantity as number), 0);
        await enviarConfirmacionCompra({
          to: correo,
          nombre: perfil?.full_name,
          eventoNombre: evento.name,
          eventoVenue: evento.venue,
          eventoCiudad: evento.city,
          eventoFechaTexto: new Date(evento.starts_at).toLocaleString("es-CO", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
          }),
          totalCop: ordenPagada.total_cop,
          cantidadBoletos,
        });
      }
    } catch (err) {
      console.error(`[bold webhook] No se pudo enviar el correo de confirmacion de la orden ${ordenId}:`, err);
    }

    // TODO (Fase 2.2): emitir factura DIAN (Factus/Alegra).
  } else if (tipo === "SALE_REJECTED" || tipo === "VOID_APPROVED") {
    const { data: items } = await admin
      .from("order_items")
      .select("ticket_type_id, quantity")
      .eq("order_id", ordenId);

    await admin
      .from("orders")
      .update({ status: "fallida" })
      .eq("id", ordenId)
      .eq("status", "pendiente");

    for (const item of items ?? []) {
      await admin.rpc("liberar_cupo", {
        p_ticket_type_id: item.ticket_type_id,
        p_cantidad: item.quantity,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
