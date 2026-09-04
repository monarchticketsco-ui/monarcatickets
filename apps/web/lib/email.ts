import { Resend } from "resend";

// Correo de confirmacion de compra (Fase 2.1). Se manda "best effort"
// desde el webhook de Bold, despues de que la orden ya quedo marcada
// 'pagada' y los boletos ya se generaron -- si esto falla o RESEND_API_KEY
// no esta configurada, la compra sigue siendo valida (el correo nunca es
// la fuente de verdad del pago).
//
// Sin un dominio verificado en Resend, la cuenta solo puede enviar al
// correo del dueno de la cuenta (modo pruebas de Resend) -- para mandar
// a cualquier comprador hace falta verificar un dominio propio en
// resend.com/domains y usarlo en RESEND_FROM_EMAIL.
function clienteResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function formatoCOP(cop: number): string {
  return `$${cop.toLocaleString("es-CO")}`;
}

export async function enviarConfirmacionCompra(params: {
  to: string;
  nombre?: string | null;
  eventoNombre: string;
  eventoVenue: string;
  eventoCiudad: string;
  eventoFechaTexto: string;
  totalCop: number;
  cantidadBoletos: number;
}): Promise<{ enviado: boolean; motivo?: string }> {
  const resend = clienteResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada -- se omite el correo de confirmacion.");
    return { enviado: false, motivo: "sin_api_key" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Monarca Tickets <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://monarcatickets-web.vercel.app";
  const primerNombre = params.nombre?.trim().split(" ")[0];
  const saludo = primerNombre ? `Hola ${primerNombre},` : "Hola,";
  const textoBoletos = params.cantidadBoletos === 1 ? "1 boleto" : `${params.cantidadBoletos} boletos`;

  const html = `
  <div style="background:#070b16;padding:32px 16px;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#0d1326;border:1px solid #1e2745;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,#3b63f0,#3ddc84);padding:20px 24px;">
        <p style="margin:0;color:#04121a;font-weight:700;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">Monarca Tickets</p>
      </div>
      <div style="padding:28px 24px;color:#f4f6fb;">
        <p style="margin:0 0 4px;font-size:15px;color:#8f9bbf;">${saludo}</p>
        <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;">Tu compra quedo confirmada 🎟️</h1>
        <div style="background:#131a33;border:1px solid #1e2745;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:17px;font-weight:700;">${params.eventoNombre}</p>
          <p style="margin:0 0 4px;font-size:14px;color:#8f9bbf;">${params.eventoVenue}, ${params.eventoCiudad}</p>
          <p style="margin:0;font-size:14px;color:#8f9bbf;">${params.eventoFechaTexto}</p>
        </div>
        <p style="margin:0 0 6px;font-size:14px;color:#8f9bbf;">${textoBoletos} · Total pagado</p>
        <p style="margin:0 0 24px;font-size:24px;font-weight:700;">${formatoCOP(params.totalCop)}</p>
        <a href="${siteUrl}/mi-cuenta" style="display:inline-block;background:linear-gradient(90deg,#3b63f0,#3ddc84);color:#04121a;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px;font-size:15px;">
          Ver mis boletos
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#5f6a8c;">
          Tus boletos digitales con codigo QR ya estan disponibles en tu cuenta de Monarca Tickets.
        </p>
      </div>
    </div>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Tu compra para ${params.eventoNombre} esta confirmada`,
      html,
    });

    if (error) {
      console.error("[email] Resend devolvio un error enviando la confirmacion:", error);
      return { enviado: false, motivo: "error_resend" };
    }

    return { enviado: true };
  } catch (err) {
    console.error("[email] Excepcion enviando el correo de confirmacion:", err);
    return { enviado: false, motivo: "excepcion" };
  }
}
