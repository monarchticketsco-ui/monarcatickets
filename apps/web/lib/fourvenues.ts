// Monarca Tickets — cliente de la Channel Manager API de FourVenues.
//
// FourVenues es ahora el motor de catalogo, precios y checkout: esta
// pagina deja de leer las tablas locales `events`/`ticket_types` y en su
// lugar consulta esta API en cada carga (sin copia local, por decision
// del cliente). La llave vive en FOURVENUES_CHANNEL_API_KEY (.env.local /
// Vercel) y nunca se expone al navegador — todo pasa por Server
// Components o Route Handlers, nunca por "use client".
//
// Docs: https://docs.fourvenues.com/channel-manager

const FV_BASE = "https://channels-service.fourvenues.com";

function apiKey(): string {
  const key = process.env.FOURVENUES_CHANNEL_API_KEY;
  if (!key) throw new Error("Falta FOURVENUES_CHANNEL_API_KEY en las variables de entorno.");
  return key;
}

async function fvFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${FV_BASE}${path}`, {
    ...init,
    headers: {
      "X-Api-Key": apiKey(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    // Catalogo y precios cambian con frecuencia (disponibilidad); no
    // cacheamos para no mostrar cupo vendido como disponible.
    cache: "no-store",
  });

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "");
    throw new Error(`FourVenues ${path} respondio ${res.status}: ${cuerpo.slice(0, 300)}`);
  }

  const json = (await res.json()) as { data: T; success: boolean };
  return json.data;
}

export type FVLocation = {
  name: string;
  address: string;
  city: string;
  country: string;
  full_address: string;
  timezone: string;
};

export type FVPrice = {
  _id: string;
  name: string | null;
  price: number;
  valid_until: string;
  fee_type: "percentage" | "fixed";
  fee_quantity: number;
  quantity: number;
};

export type FVTicketRate = {
  _id: string;
  name: string;
  slug: string;
  valid_from: string;
  type: string;
  prices: FVPrice[];
  current_price: FVPrice | null;
  min: number;
  max: number;
  nominative: boolean;
  available: boolean;
  availability: { sold: number; available: number };
  fields: { type: string; required: boolean; label: string; slug: string }[];
};

export type FVEvent = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  code: string;
  display_date: string;
  start_date: string;
  end_date: string;
  age: number | null;
  outfit: string | null;
  image_url: string;
  location: FVLocation;
  currency: string;
  ticket_rates?: FVTicketRate[];
};

/** Catalogo publico — usado por /eventos. */
export async function getFourvenuesEvents(): Promise<FVEvent[]> {
  return fvFetch<FVEvent[]>("/events?populate=ticket-rates&limit=100");
}

/** Detalle de un evento por slug — usado por /eventos/[slug]. */
export async function getFourvenuesEventBySlug(slug: string): Promise<FVEvent | null> {
  try {
    return await fvFetch<FVEvent>(`/events/by-slug/${encodeURIComponent(slug)}?populate=ticket-rates`);
  } catch {
    return null;
  }
}

export type FVCheckoutTicket = {
  price_id: string;
  full_name: string;
  email: string;
  phone: string;
};

export type FVCheckoutResult = {
  payment_id: string;
  payment_url: string;
  total_amount: number;
  tickets: { qr_code: string; status: string; total_price: number }[];
};

/**
 * Crea la sesion de pago en FourVenues (checkout hospedado por ellos,
 * via dLocal Colombia: tarjeta, Nequi, PSE, Mercado Pago). Redirigimos
 * al comprador a `payment_url`; FourVenues se encarga de enviarle el
 * boleto (QR) por email una vez pagado, gracias a `send_resources`.
 */
export async function createFourvenuesCheckout(params: {
  ticketRateId: string;
  tickets: FVCheckoutTicket[];
}): Promise<FVCheckoutResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://monarcatickets-web.vercel.app";
  return fvFetch<FVCheckoutResult>("/tickets/checkout", {
    method: "POST",
    body: JSON.stringify({
      redirect_url: `${siteUrl}/checkout-fv/ok`,
      error_url: `${siteUrl}/checkout-fv/error`,
      ticket_rate_id: params.ticketRateId,
      send_resources: true,
      tickets: params.tickets,
    }),
  });
}
