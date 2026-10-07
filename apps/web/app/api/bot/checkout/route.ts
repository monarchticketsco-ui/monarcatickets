import { NextRequest, NextResponse } from "next/server";
import { requireApiClient } from "@/lib/api-auth";
import { createFourvenuesCheckout, getFourvenuesEvents } from "@/lib/fourvenues";
import { cargoServicio, tarifaVendible } from "@/lib/bot-fv";

export const dynamic = "force-dynamic";

type Persona = { nombre?: string; correo?: string; telefono?: string };
type Body = {
  ticket_type_id?: string; // _id de la tarifa (viene de tipos_de_boleto[].id)
  cantidad?: number | string;
  comprador?: Persona;
  // Compatibilidad con el payload plano del flujo de Dapta.
  nombre?: string;
  correo?: string;
  telefono?: string;
  asistentes?: Persona[] | string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseAsistentes(raw: Body["asistentes"]): Persona[] {
  let v: unknown = raw;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? (v as Persona[]) : [];
}

// Crea el pago en FourVenues (checkout hospedado, dLocal Colombia) y
// devuelve el enlace para que el bot lo envie por WhatsApp. FourVenues
// envia los boletos (QR) al correo de cada boleto una vez pagado.
// Requiere x-api-key con scope ordenes:crear.
export async function POST(req: NextRequest) {
  const auth = await requireApiClient(req, "ordenes:crear");
  if ("error" in auth) return auth.error;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "payload_invalido" }, { status: 400 });
  }

  const rateId = String(body.ticket_type_id ?? "").trim();
  const cantidad = Number(body.cantidad) || 1;
  const comprador: Persona = {
    nombre: body.comprador?.nombre ?? body.nombre,
    correo: body.comprador?.correo ?? body.correo,
    telefono: body.comprador?.telefono ?? body.telefono,
  };
  const nombre = comprador.nombre?.trim() ?? "";
  const correo = comprador.correo?.trim() ?? "";
  const telefono = (comprador.telefono ?? "").replace(/[^\d+]/g, "");

  if (!rateId) return NextResponse.json({ error: "falta_ticket_type_id" }, { status: 400 });
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return NextResponse.json({ error: "cantidad_invalida" }, { status: 400 });
  }
  if (!nombre || !EMAIL.test(correo) || telefono.length < 7) {
    return NextResponse.json(
      { error: "comprador_invalido", detalle: "Nombre, correo valido y telefono son obligatorios." },
      { status: 400 }
    );
  }

  const asistentes = parseAsistentes(body.asistentes);
  if (asistentes.length !== 0 && asistentes.length !== cantidad) {
    return NextResponse.json(
      { error: "asistentes_invalidos", detalle: `Se esperaban ${cantidad} asistentes o ninguno.` },
      { status: 400 }
    );
  }

  try {
    const eventos = await getFourvenuesEvents();
    const tarifa = eventos.flatMap((e) => e.ticket_rates ?? []).find((t) => t._id === rateId);

    if (!tarifa) return NextResponse.json({ error: "tipo_de_boleto_no_encontrado" }, { status: 404 });
    if (!tarifaVendible(tarifa) || !tarifa.current_price) {
      return NextResponse.json({ error: "tipo_de_boleto_no_disponible" }, { status: 409 });
    }
    const disponibles = tarifa.availability?.available ?? 0;
    const maximo = tarifa.max > 0 ? Math.min(tarifa.max, disponibles) : disponibles;
    if (cantidad > maximo || cantidad < Math.max(tarifa.min || 1, 1)) {
      return NextResponse.json(
        { error: "cantidad_fuera_de_rango", minimo: Math.max(tarifa.min || 1, 1), maximo },
        { status: 409 }
      );
    }

    const tickets = Array.from({ length: cantidad }, (_, i) => {
      const a = asistentes[i] ?? {};
      const aCorreo = a.correo?.trim();
      const aTel = (a.telefono ?? "").replace(/[^\d+]/g, "");
      return {
        price_id: tarifa.current_price!._id,
        full_name: a.nombre?.trim() || nombre,
        email: aCorreo && EMAIL.test(aCorreo) ? aCorreo : correo,
        phone: aTel.length >= 7 ? aTel : telefono,
      };
    });

    const r = await createFourvenuesCheckout({ ticketRateId: rateId, tickets });
    const unitario = tarifa.current_price.price + cargoServicio(tarifa.current_price);

    return NextResponse.json({
      orden_id: r.payment_id,
      checkout_url: r.payment_url,
      cantidad,
      total_cop: r.total_amount ?? unitario * cantidad,
      boletos_a_nombre_de: tickets.map((t) => t.full_name),
      boletos_enviados_a: [...new Set(tickets.map((t) => t.email))],
    });
  } catch (err) {
    console.error("bot/checkout error", err);
    return NextResponse.json({ error: "checkout_fallido" }, { status: 502 });
  }
}
