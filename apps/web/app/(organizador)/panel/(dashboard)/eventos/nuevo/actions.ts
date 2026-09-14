"use server";

import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";

export async function crearEvento(formData: FormData) {
  const { supabase, organizer } = await requireOrganizer();

  const name = String(formData.get("name"));
  const venue = String(formData.get("venue"));
  const city = String(formData.get("city"));
  const category = String(formData.get("category") || "");
  const startsAt = String(formData.get("starts_at"));
  const imageUrl = String(formData.get("image_url") || "").trim();

  const { data, error } = await supabase
    .from("events")
    .insert({
      organizer_id: organizer.id,
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
    redirect(`/panel/eventos/nuevo?error=${encodeURIComponent(error?.message ?? "error")}`);
  }

  redirect(`/panel/eventos/${data.id}`);
}
