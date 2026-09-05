import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

// Boletos individuales con QR firmado (Fase 2.1, ver blueprint tabla
// `tickets`). El QR no es solo el id del boleto: es `id.firma`, donde
// `firma` es un HMAC-SHA256 del id con una llave secreta del servidor.
// Asi, cuando mas adelante construyamos el escaneo en puerta, alguien no
// puede fabricar un boleto valido con solo adivinar/copiar un uuid — hace
// falta la llave del servidor para producir una firma que calce.
//
// TICKET_QR_SECRET es opcional: si no esta configurada (por ejemplo, no
// se ha agregado todavia en Vercel), usamos SUPABASE_SERVICE_ROLE_KEY
// como llave de firma para que la generacion de boletos funcione en
// produccion sin depender de una variable de entorno nueva. Se
// recomienda configurar TICKET_QR_SECRET aparte cuando se construya el
// escaneo en puerta, para no reusar una llave con otros privilegios.
function claveDeFirma(): string {
  return process.env.TICKET_QR_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "monarca-tickets-dev-secret";
}

export function firmarTicket(ticketId: string): string {
  const firma = crypto.createHmac("sha256", claveDeFirma()).update(ticketId).digest("hex").slice(0, 24);
  return `${ticketId}.${firma}`;
}

export function verificarFirmaTicket(qrSigned: string): { valido: boolean; ticketId?: string } {
  const [ticketId, firma] = qrSigned.split(".");
  if (!ticketId || !firma) return { valido: false };

  const esperada = crypto.createHmac("sha256", claveDeFirma()).update(ticketId).digest("hex").slice(0, 24);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { valido: false };

  return { valido: true, ticketId };
}

/**
 * Genera un registro en `tickets` (con QR firmado) por cada unidad
 * comprada en cada `order_item` de una orden ya pagada. Idempotente: si
 * un `order_item` ya tiene boletos generados (por ejemplo, un reintento
 * del webhook de Bold que de algun modo llego hasta aca) no vuelve a
 * generarlos para ese item.
 */
type Asistente = { nombre?: string; documento?: string };

export async function generarBoletosParaOrden(
  admin: SupabaseClient,
  ordenId: string,
  holderUserId: string
): Promise<{ id: string; order_item_id: string; qr_signed: string }[]> {
  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("id, quantity, asistentes")
    .eq("order_id", ordenId);

  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];

  const itemIds = items.map((item) => item.id as string);
  const { data: existentes, error: existentesError } = await admin
    .from("tickets")
    .select("order_item_id")
    .in("order_item_id", itemIds);

  if (existentesError) throw existentesError;
  const itemsConBoletos = new Set((existentes ?? []).map((t) => t.order_item_id as string));

  const filas: {
    id: string;
    order_item_id: string;
    qr_signed: string;
    holder_user_id: string;
    holder_name: string | null;
    holder_document: string | null;
  }[] = [];
  for (const item of items) {
    if (itemsConBoletos.has(item.id as string)) continue; // ya generados, no duplicar
    const cantidad = item.quantity as number;
    // Boletos nominativos: cada unidad comprada trae su propio asistente
    // (capturado en el checkout, ver migracion 0008). Ordenes viejas sin
    // este dato quedan con holder_name/holder_document en null.
    const asistentes = (item.asistentes as Asistente[] | null) ?? [];
    for (let i = 0; i < cantidad; i++) {
      const id = crypto.randomUUID();
      const asistente = asistentes[i];
      filas.push({
        id,
        order_item_id: item.id as string,
        qr_signed: firmarTicket(id),
        holder_user_id: holderUserId,
        holder_name: asistente?.nombre?.trim() || null,
        holder_document: asistente?.documento?.trim() || null,
      });
    }
  }

  if (filas.length === 0) return [];

  const { data: creados, error: insertError } = await admin
    .from("tickets")
    .insert(filas)
    .select("id, order_item_id, qr_signed");

  if (insertError) throw insertError;
  return creados ?? [];
}
