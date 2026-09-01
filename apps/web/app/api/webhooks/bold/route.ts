import { NextRequest, NextResponse } from "next/server";
import { verificarFirmaWebhook } from "@/lib/bold";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const { error } = await admin
      .from("orders")
      .update({ status: "pagada", bold_payment_id: boldPaymentId })
      .eq("id", ordenId)
      .eq("status", "pendiente");

    if (error) {
      return NextResponse.json({ error: "error_actualizando_orden" }, { status: 500 });
    }

    // TODO (Fase 2.1): generar tickets con QR firmado por cada order_item,
    // emitir factura DIAN (Factus/Alegra) y notificar al comprador por
    // correo. El estado 'pagada' ya es la fuente de verdad del pago —
    // esto puede correr async sin bloquear la respuesta al webhook.
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
