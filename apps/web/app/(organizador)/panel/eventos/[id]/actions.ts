"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";

export async function crearTipoDeBoleto(eventId: string, formData: FormData) {
  const { supabase } = await requireOrganizer();

  const name = String(formData.get("name"));
  const priceCop = Number(formData.get("price_cop"));
  const capacity = Number(formData.get("capacity"));

  const { error } = await supabase.from("ticket_types").insert({
    event_id: eventId,
    name,
    price_cop: priceCop,
    capacity,
  });

  if (error) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}

export async function publicarEvento(eventId: string) {
  const { supabase } = await requireOrganizer();

  // TODO (fase 3): bloquear si organizer.dian_status !== 'habilitado',
  // segun lo que definas con tu contador (blueprint seccion 05).
  const { error } = await supabase
    .from("events")
    .update({ status: "en_venta" })
    .eq("id", eventId);

  if (error) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}
