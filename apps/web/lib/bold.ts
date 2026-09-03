import crypto from "crypto";

// Cliente de la API de Link de Pagos de Bold.
// Doc: https://developers.bold.co/pagos-en-linea/api-link-de-pagos
//      https://developers.bold.co/pagos-en-linea/llaves-de-integracion
//      https://developers.bold.co/webhook
//
// Confirmado con soporte de Bold (sep-2026): la API de Link de pagos
// funciona con las MISMAS llaves del "Boton de pagos" — no hay llaves
// separadas para "API pagos en linea". Ambas variables se sacan del
// panel de Bold en Pagos > Boton de pagos > Llaves de produccion:
//
// BOLD_API_KEY: "Llave de identidad". Va en el header
//   `Authorization: x-api-key <llave>` de cada request a
//   POST /online/link/v1.
// BOLD_WEBHOOK_SECRET: "Llave secreta". Bold la usa como llave HMAC-SHA256
//   sobre el body del webhook (codificado en base64 antes de firmar) para
//   producir el header `x-bold-signature`. En modo pruebas Bold firma con
//   un string vacio.
const BOLD_API_KEY = process.env.BOLD_API_KEY;
const BOLD_BASE_URL = "https://integrations.api.bold.co";

export class BoldError extends Error {}

export async function crearLinkDePago(params: {
  referencia: string;
  montoCop: number;
  descripcion: string;
  email?: string;
}) {
  if (!BOLD_API_KEY) {
    throw new BoldError("Falta configurar BOLD_API_KEY");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const res = await fetch(`${BOLD_BASE_URL}/online/link/v1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `x-api-key ${BOLD_API_KEY}`,
    },
    body: JSON.stringify({
      amount_type: "CLOSE",
      amount: {
        currency: "COP",
        total_amount: params.montoCop,
        tip_amount: 0,
      },
      reference: params.referencia,
      description: params.descripcion.slice(0, 100),
      payer_email: params.email,
      callback_url: siteUrl ? `${siteUrl}/mi-cuenta/ordenes/${params.referencia}` : undefined,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.errors?.length) {
    throw new BoldError(`Bold rechazo la creacion del link: ${JSON.stringify(data?.errors ?? data)}`);
  }

  return data.payload as { payment_link: string; url: string };
}

// Verifica la firma HMAC-SHA256 del webhook segun developers.bold.co/webhook:
// base64(rawBody) -> HMAC-SHA256 con la llave secreta -> hex, comparado
// contra el header x-bold-signature.
export function verificarFirmaWebhook(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;

  const secret = process.env.BOLD_WEBHOOK_SECRET ?? "";
  const encoded = Buffer.from(rawBody).toString("base64");
  const hash = crypto.createHmac("sha256", secret).update(encoded).digest("hex");

  const hashBuf = Buffer.from(hash);
  const sigBuf = Buffer.from(signature);
  if (hashBuf.length !== sigBuf.length) return false;

  return crypto.timingSafeEqual(hashBuf, sigBuf);
}
