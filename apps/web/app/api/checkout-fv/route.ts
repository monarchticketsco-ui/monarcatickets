import { NextRequest, NextResponse } from "next/server";
import { createFourvenuesCheckout } from "@/lib/fourvenues";

type AsistenteInput = { full_name: string; email: string; phone: string };

// Checkout respaldado 100% por FourVenues (Channel Manager API): no toca
// Supabase ni Bold. Recibe la tarifa elegida y los datos de cada boleto
// (nominativos), crea la sesion de pago en FourVenues y devuelve la URL
// de pago (dLocal Colombia: tarjeta, Nequi, PSE, Mercado Pago) para que
// el navegador redirija ahi.
export async function POST(req: NextRequest) {
  let body: { ticketRateId?: string; priceId?: string; tickets?: AsistenteInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  const { ticketRateId, priceId, tickets } = body;
  if (!ticketRateId || !priceId || !Array.isArray(tickets) || tickets.length === 0) {
    return NextResponse.json({ error: "faltan_datos" }, { status: 400 });
  }

  for (const t of tickets) {
    if (!t.full_name?.trim() || !t.email?.trim() || !t.phone?.trim()) {
      return NextResponse.json(
        { error: "asistentes_invalidos", detalle: "Nombre, correo y telefono son obligatorios para cada boleto." },
        { status: 400 }
      );
    }
  }

  try {
    const resultado = await createFourvenuesCheckout({
      ticketRateId,
      tickets: tickets.map((t) => ({ price_id: priceId, full_name: t.full_name.trim(), email: t.email.trim(), phone: t.phone.trim() })),
    });
    return NextResponse.json({ checkoutUrl: resultado.payment_url });
  } catch (err) {
    console.error("checkout-fv error", err);
    return NextResponse.json({ error: "checkout_fallido" }, { status: 502 });
  }
}
