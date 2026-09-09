import type { SupabaseClient } from "@supabase/supabase-js";

// Helpers compartidos entre /api/v1/eventos y /api/v1/eventos/[id] para no
// duplicar la logica de "activo" y de localidades/precios (ticket_types).

export type TipoDeBoleto = {
  id: string;
  nombre: string;
  precio_cop: number;
  disponibles: number;
};

// "Activo" = boletos a la venta en este momento. Un evento "publicado"
// existe y es visible mas no necesariamente esta en venta todavia; eso
// distingue publicado (activo:false) de en_venta (activo:true). Los demas
// estados (borrador, finalizado, cancelado) ya estan filtrados fuera de
// la API publica, pero la funcion es segura para cualquier valor.
export function esEventoActivo(status: string): boolean {
  return status === "en_venta";
}

// Trae los tipos de boleto (localidades + precios) de varios eventos de
// una sola consulta, agrupados por event_id.
export async function tiposDeBoletoPorEvento(
  admin: SupabaseClient,
  eventIds: string[]
): Promise<Map<string, TipoDeBoleto[]>> {
  const mapa = new Map<string, TipoDeBoleto[]>();
  if (eventIds.length === 0) return mapa;

  const { data } = await admin
    .from("ticket_types")
    .select("id, event_id, name, price_cop, capacity, sold_count")
    .in("event_id", eventIds)
    .order("price_cop", { ascending: false });

  for (const t of data ?? []) {
    const lista = mapa.get(t.event_id) ?? [];
    lista.push({
      id: t.id,
      nombre: t.name,
      precio_cop: t.price_cop,
      disponibles: t.capacity - t.sold_count,
    });
    mapa.set(t.event_id, lista);
  }
  return mapa;
}
