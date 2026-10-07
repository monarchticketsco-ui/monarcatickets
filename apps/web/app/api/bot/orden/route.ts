import { NextRequest, NextResponse } from "next/server";
import { requireApiClient } from "@/lib/api-auth";
import { getFourvenuesTicketsByEmail } from "@/lib/fourvenues";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Estado de las compras de un cliente, buscado por el correo con el que
// compro. FourVenues no tiene "numero de orden" consultable por API, asi
// que el bot pregunta el correo. Nunca devuelve el QR ni datos de contacto
// de terceros. Requiere x-api-key con scope ordenes:leer.
export async function GET(req: NextRequest) {
  const auth = await requireApiClient(req, "ordenes:leer");
  if ("error" in auth) return auth.error;

  const correo = (new URL(req.url).searchParams.get("correo") ?? "").trim().toLowerCase();
  if (!EMAIL.test(correo)) {
    return NextResponse.json({ error: "correo_invalido" }, { status: 400 });
  }

  try {
    const compras = await getFourvenuesTicketsByEmail(correo);
    const boletos = compras.map(({ ticket, event }) => {
      const tarifa = event.ticket_rates?.find((t) => t._id === ticket.ticket_rate_id);
      return {
        evento: event.name,
        fecha: new Date(event.display_date || event.start_date).toLocaleDateString("es-CO", {
          dateStyle: "long",
          timeZone: "America/Bogota",
        }),
        lugar: event.location?.name ?? "",
        tipo: tarifa?.name ?? "",
        a_nombre_de: ticket.full_name,
        estado: ticket.status,
        total_cop: ticket.total_price,
        ya_ingreso: !!ticket.entry_time,
      };
    });
    return NextResponse.json({ correo, total: boletos.length, boletos });
  } catch (err) {
    console.error("bot/orden error", err);
    return NextResponse.json({ error: "error_consultando_orden" }, { status: 502 });
  }
}
