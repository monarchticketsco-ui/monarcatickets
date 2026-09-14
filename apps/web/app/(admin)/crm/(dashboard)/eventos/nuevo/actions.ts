"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function crearEventoAdmin(formData: FormData) {
  await requireAdmin();

  const organizerId = String(formData.get("organizer_id") || "");
  const name = String(formData.get("name") || "");
  const venue = String(formData.get("venue") || "");
  const city = String(formData.get("city") || "");
  const category = String(formData.get("category") || "");
  const startsAt = String(formData.get("starts_at") || "");
  const imageUrl = String(formData.get("image_url") || "").trim();

  if (!organizerId) {
    redirect(`/crm/eventos/nuevo?error=${encodeURIComponent("Selecciona un organizador.")}`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("events")
    .insert({
      organizer_id: organizerId,
      name,
      venue,
      city,
      category: category || null,
      starts_at: new Date(startsAt).toISOString(),
      image_url: imageUrl || null,
      status: "borrador",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/crm/eventos/nuevo?error=${encodeURIComponent(error?.message ?? "error")}`);
  }

  redirect(`/crm/eventos/${data.id}`);
}
