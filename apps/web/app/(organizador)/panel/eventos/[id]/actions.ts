"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganizer } from "@/lib/organizer";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function actualizarImagen(eventId: string, formData: FormData) {
  const { supabase, organizer } = await requireOrganizer();

  const imageUrl = String(formData.get("image_url") || "").trim();

  const { error } = await supabase
    .from("events")
    .update({ image_url: imageUrl || null })
    .eq("id", eventId)
    .eq("organizer_id", organizer.id);

  if (error) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}

export async function publicarEvento(eventId: string) {
  const { supabase, organizer } = await requireOrganizer();

  if (organizer.dian_status !== "habilitado") {
    redirect(
      `/panel/eventos/${eventId}?error=${encodeURIComponent(
        "Tu perfil de organizador debe estar habilitado ante la DIAN antes de poner boletos en venta. El equipo de Monarca Tickets revisa y activa este estado desde el CRM."
      )}`
    );
  }

  const { error } = await supabase
    .from("events")
    .update({ status: "en_venta" })
    .eq("id", eventId);

  if (error) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}

// ---------------------------------------------------------------------
// Detalles del evento: ficha tecnica, ubicacion, cumplimiento legal
// (PULEP / responsable) y terminos especificos. Todo opcional.
// ---------------------------------------------------------------------
export async function actualizarDetalles(eventId: string, formData: FormData) {
  const { supabase, organizer } = await requireOrganizer();

  const num = (name: string) => {
    const v = String(formData.get(name) || "").trim();
    return v === "" ? null : Number(v);
  };
  const str = (name: string) => {
    const v = String(formData.get(name) || "").trim();
    return v === "" ? null : v;
  };
  const bool = (name: string) => {
    const v = String(formData.get(name) || "");
    if (v === "si") return true;
    if (v === "no") return false;
    return null;
  };
  const doorsOpenRaw = String(formData.get("doors_open_at") || "").trim();

  const { error } = await supabase
    .from("events")
    .update({
      doors_open_at: doorsOpenRaw ? new Date(doorsOpenRaw).toISOString() : null,
      min_age: num("min_age"),
      seating_type: str("seating_type"),
      capacity: num("capacity"),
      food_sale: bool("food_sale"),
      alcohol_sale: bool("alcohol_sale"),
      wheelchair_accessible: bool("wheelchair_accessible"),
      pregnant_allowed: bool("pregnant_allowed"),
      venue_address: str("venue_address"),
      lineup: str("lineup"),
      pulep_code: str("pulep_code"),
      responsable_razon_social: str("responsable_razon_social"),
      responsable_nit: str("responsable_nit"),
      responsable_direccion: str("responsable_direccion"),
      responsable_email: str("responsable_email"),
      terms_extra: str("terms_extra"),
    })
    .eq("id", eventId)
    .eq("organizer_id", organizer.id);

  if (error) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}

// ---------------------------------------------------------------------
// Imagenes de localidades/zonas del venue (galeria publica del evento).
// Se suben con la service-role key porque el bucket "event-media" no
// tiene policies de insert para el rol autenticado (ver migracion 0006).
// ---------------------------------------------------------------------
export async function subirImagenLocalidad(eventId: string, formData: FormData) {
  const { organizer } = await requireOrganizer();
  const admin = createAdminClient();

  const { data: evento } = await admin
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", organizer.id)
    .single();

  if (!evento) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent("Evento no encontrado")}`);
  }

  const file = formData.get("imagen") as File | null;

  if (!file || file.size === 0) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent("Selecciona una imagen")}`);
  }

  if (!file.type.startsWith("image/")) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent("El archivo debe ser una imagen")}`);
  }

  if (file.size > 8 * 1024 * 1024) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent("La imagen no puede pesar mas de 8MB")}`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `localidades/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await admin.storage.from("event-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: pub } = admin.storage.from("event-media").getPublicUrl(path);

  const { error: insertError } = await admin.from("event_location_images").insert({
    event_id: eventId,
    image_url: pub.publicUrl,
  });

  if (insertError) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}

export async function eliminarImagenLocalidad(imageId: string, eventId: string) {
  const { organizer } = await requireOrganizer();
  const admin = createAdminClient();

  const { data: evento } = await admin
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", organizer.id)
    .single();

  if (!evento) {
    redirect(`/panel/eventos/${eventId}?error=${encodeURIComponent("Evento no encontrado")}`);
  }

  const { data: imagen } = await admin
    .from("event_location_images")
    .select("id, image_url")
    .eq("id", imageId)
    .eq("event_id", eventId)
    .single();

  if (imagen) {
    const marker = "/object/public/event-media/";
    const idx = imagen.image_url.indexOf(marker);
    if (idx !== -1) {
      const path = imagen.image_url.slice(idx + marker.length);
      await admin.storage.from("event-media").remove([path]);
    }
    await admin.from("event_location_images").delete().eq("id", imageId);
  }

  revalidatePath(`/panel/eventos/${eventId}`);
}
