// Adaptador para el bot de WhatsApp (Dapta): traduce lo que entrega la
// Channel Manager API de FourVenues al formato simple que usa el agente
// (ids, nombres en español, precios en COP). No guarda nada: FourVenues
// sigue siendo la unica fuente de eventos, precios, disponibilidad y pago.
import type { FVEvent, FVPrice, FVTicketRate } from "@/lib/fourvenues";

const TZ = "America/Bogota";

export type BotTipoBoleto = {
  id: string; // _id de la tarifa en FourVenues (ticket_rate_id)
  nombre: string;
  precio_cop: number; // precio base por boleto
  cargo_servicio_cop: number; // cargo de servicio por boleto
  total_cop: number; // lo que paga el comprador por boleto
  disponibles: number;
  minimo: number;
  maximo: number;
  nominativo: boolean;
  incluye?: string;
};

export type BotEvento = {
  id: string; // _id del evento en FourVenues
  name: string;
  description: string;
  venue: string;
  city: string;
  starts_at: string; // ISO (start_date)
  ends_at: string;
  fecha: string; // fecha de promocion legible, ej. "12 de diciembre de 2026"
  hora_inicio: string;
  edad_minima: number | null;
  image_url: string;
  url: string;
  activo: boolean;
  tipos_de_boleto: BotTipoBoleto[];
};

export function sinTildes(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function cargoServicio(p: Pick<FVPrice, "price" | "fee_type" | "fee_quantity">): number {
  if (!p.fee_quantity) return 0;
  return p.fee_type === "percentage" ? Math.round((p.price * p.fee_quantity) / 100) : p.fee_quantity;
}

/** Una tarifa se puede vender ahora mismo si FourVenues la marca disponible, tiene precio vigente y cupo. */
export function tarifaVendible(t: FVTicketRate): boolean {
  if (!t.available || !t.current_price) return false;
  if (t.valid_from && new Date(t.valid_from).getTime() > Date.now()) return false;
  return (t.availability?.available ?? 0) > 0;
}

function aTipo(t: FVTicketRate): BotTipoBoleto {
  const p = t.current_price as FVPrice;
  const cargo = cargoServicio(p);
  return {
    id: t._id,
    nombre: t.name,
    precio_cop: p.price,
    cargo_servicio_cop: cargo,
    total_cop: p.price + cargo,
    disponibles: t.availability?.available ?? 0,
    minimo: Math.max(t.min || 1, 1),
    maximo: t.max > 0 ? t.max : t.availability?.available ?? 0,
    nominativo: !!t.nominative,
    incluye: p.includes || undefined,
  };
}

export function aBotEvento(e: FVEvent, siteUrl: string): BotEvento {
  const tipos = (e.ticket_rates ?? []).filter(tarifaVendible).map(aTipo);
  const fechaBase = e.display_date || e.start_date;
  return {
    id: e._id,
    name: e.name,
    description: e.description,
    venue: e.location?.name ?? "",
    city: e.location?.city ?? "",
    starts_at: e.start_date,
    ends_at: e.end_date,
    fecha: new Date(fechaBase).toLocaleDateString("es-CO", { dateStyle: "long", timeZone: TZ }),
    hora_inicio: new Date(e.start_date).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", timeZone: TZ }),
    edad_minima: e.age ?? null,
    image_url: e.image_url,
    url: `${siteUrl}/eventos/${e.slug}`,
    activo: tipos.length > 0,
    tipos_de_boleto: tipos,
  };
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://monarcatickets.com";
}
