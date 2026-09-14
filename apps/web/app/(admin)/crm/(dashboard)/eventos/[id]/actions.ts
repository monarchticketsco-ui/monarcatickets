"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Version admin de las acciones de edicion de evento (ver tambien
// app/(organizador)/panel/eventos/[id]/actions.ts). Usa siempre la
// service role key: el admin puede editar cualquier evento, no solo los
// de un organizador especifico, y varias tablas (ticket_types,
// event_location_images) no tienen policy de escritura para admin via
// RLS normal (ver migracion 0002).

export async function actualizarCoreAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") || "").trim();
  const venue = String(formData.get("venue") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const startsAtRaw = String(formData.get("starts_at") || "").trim();
  const endsAtRaw = String(formData.get("ends_at") || "").trim();

  if (!name || !venue || !city || !startsAtRaw) {
    redirect(
      `/crm/eventos/${eventId}?error=${encodeURIComponent("Nombre, lugar, ciudad y fecha de inicio son obligatorios")}`
    );
  }

  const { error } = await admin
    .from("events")
    .update({
      name,
      venue,
      city,
      category: category || null,
      starts_at: new Date(startsAtRaw).toISOString(),
      ends_at: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    })
    .eq("id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function actualizarEstadoAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const status = String(formData.get("status") || "");
  const validos = ["borrador", "publicado", "en_venta", "finalizado", "cancelado"];
  if (!validos.includes(status)) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent("Estado invalido")}`);
  }

  const { error } = await admin.from("events").update({ status }).eq("id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function actualizarImagenAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const imageUrl = String(formData.get("image_url") || "").trim();

  const { error } = await admin.from("events").update({ image_url: imageUrl || null }).eq("id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function actualizarBannerAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const bannerUrl = String(formData.get("banner_url") || "").trim();

  const { error } = await admin.from("events").update({ banner_url: bannerUrl || null }).eq("id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

// ---------------------------------------------------------------------
// Imagenes de localidades/zonas (galeria publica del evento) — version
// admin, mismo patron que app/(organizador)/panel/eventos/[id]/actions.ts
// pero sin la verificacion de dueno (el admin puede editar cualquier
// evento).
// ---------------------------------------------------------------------
export async function subirImagenLocalidadAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const file = formData.get("imagen") as File | null;

  if (!file || file.size === 0) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent("Selecciona una imagen")}`);
  }

  if (!file.type.startsWith("image/")) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent("El archivo debe ser una imagen")}`);
  }

  if (file.size > 8 * 1024 * 1024) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent("La imagen no puede pesar mas de 8MB")}`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `localidades/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await admin.storage.from("event-media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: pub } = admin.storage.from("event-media").getPublicUrl(path);

  const { error: insertError } = await admin.from("event_location_images").insert({
    event_id: eventId,
    image_url: pub.publicUrl,
  });

  if (insertError) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function eliminarImagenLocalidadAdmin(imageId: string, eventId: string) {
  await requireAdmin();
  const admin = createAdminClient();

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

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function crearTipoDeBoletoAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") || "").trim();
  const priceCop = Number(formData.get("price_cop"));
  const capacity = Number(formData.get("capacity"));
  const etapa = String(formData.get("etapa") || "").trim();
  const saleStartsAtRaw = String(formData.get("sale_starts_at") || "").trim();
  const saleEndsAtRaw = String(formData.get("sale_ends_at") || "").trim();

  const { error } = await admin.from("ticket_types").insert({
    event_id: eventId,
    name,
    price_cop: priceCop,
    capacity,
    etapa: etapa || null,
    sale_starts_at: saleStartsAtRaw ? new Date(saleStartsAtRaw).toISOString() : null,
    sale_ends_at: saleEndsAtRaw ? new Date(saleEndsAtRaw).toISOString() : null,
  });

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function actualizarTipoDeBoletoAdmin(eventId: string, ticketTypeId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = String(formData.get("name") || "").trim();
  const priceCop = Number(formData.get("price_cop"));
  const capacity = Number(formData.get("capacity"));
  const etapa = String(formData.get("etapa") || "").trim();
  const saleStartsAtRaw = String(formData.get("sale_starts_at") || "").trim();
  const saleEndsAtRaw = String(formData.get("sale_ends_at") || "").trim();

  if (!name || !Number.isFinite(priceCop) || priceCop < 0 || !Number.isFinite(capacity) || capacity < 0) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent("Datos de la localidad invalidos")}`);
  }

  const { data: actual } = await admin
    .from("ticket_types")
    .select("sold_count")
    .eq("id", ticketTypeId)
    .eq("event_id", eventId)
    .single();

  if (actual && capacity < actual.sold_count) {
    redirect(
      `/crm/eventos/${eventId}?error=${encodeURIComponent(
        `El aforo no puede ser menor a los boletos ya vendidos (${actual.sold_count})`
      )}`
    );
  }

  const { error } = await admin
    .from("ticket_types")
    .update({
      name,
      price_cop: priceCop,
      capacity,
      etapa: etapa || null,
      sale_starts_at: saleStartsAtRaw ? new Date(saleStartsAtRaw).toISOString() : null,
      sale_ends_at: saleEndsAtRaw ? new Date(saleEndsAtRaw).toISOString() : null,
    })
    .eq("id", ticketTypeId)
    .eq("event_id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}

export async function actualizarDetallesAdmin(eventId: string, formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

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

  const { error } = await admin
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
    .eq("id", eventId);

  if (error) {
    redirect(`/crm/eventos/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/crm/eventos/${eventId}`);
}
