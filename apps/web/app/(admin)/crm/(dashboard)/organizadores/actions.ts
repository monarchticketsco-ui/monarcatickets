"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------
// Crear la cuenta de una empresa organizadora desde el CRM. El portal
// empresas (/empresas) ya no permite auto-registro: un admin contacta al
// cliente (o convierte un lead de empresa_leads) y crea la cuenta aqui.
// La contrasena temporal solo se muestra una vez, igual que las llaves
// de API — el admin la copia y se la entrega al cliente por un canal
// privado.
// ---------------------------------------------------------------------
export type CrearOrganizadorState = {
  status: "idle" | "ok" | "error";
  mensaje?: string;
  correo?: string;
  password?: string;
  legalName?: string;
};

function generarPasswordTemporal(): string {
  const alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"; // sin 0/O/1/l/I
  const bytes = crypto.randomBytes(12);
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += alfabeto[bytes[i] % alfabeto.length];
  }
  return pass;
}

export async function crearOrganizadorAdmin(
  _prevState: CrearOrganizadorState,
  formData: FormData
): Promise<CrearOrganizadorState> {
  await requireAdmin();

  const legalName = String(formData.get("legal_name") || "").trim();
  const nit = String(formData.get("nit") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const contactName = String(formData.get("contact_name") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim();
  const commercialOwner = String(formData.get("commercial_owner") || "").trim();
  const commissionRaw = String(formData.get("commission_rate") || "").trim();
  const commissionRate = commissionRaw === "" ? 10 : Number(commissionRaw);
  const leadId = String(formData.get("lead_id") || "").trim();

  if (!legalName || !nit || !correo) {
    return { status: "error", mensaje: "Razon social, NIT y correo son obligatorios." };
  }
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    return { status: "error", mensaje: "El Ticket Service debe ser un numero entre 0 y 100." };
  }

  const admin = createAdminClient();
  const password = generarPasswordTemporal();

  const { data: nuevoUsuario, error: authError } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    user_metadata: { role: "organizador", full_name: legalName },
  });

  if (authError || !nuevoUsuario.user) {
    return { status: "error", mensaje: authError?.message ?? "No se pudo crear el usuario." };
  }

  const { error: organizerError } = await admin.from("organizers").insert({
    owner_user_id: nuevoUsuario.user.id,
    legal_name: legalName,
    nit,
    contact_name: contactName || null,
    contact_phone: contactPhone || null,
    contact_email: correo,
    commercial_owner: commercialOwner || null,
    commission_rate: commissionRate,
  });

  if (organizerError) {
    // Sin fila de organizador, la cuenta quedaria huerfana — la borramos
    // para poder reintentar limpio (ej. si el NIT ya existia).
    await admin.auth.admin.deleteUser(nuevoUsuario.user.id);
    return { status: "error", mensaje: organizerError.message };
  }

  if (leadId) {
    await admin.from("empresa_leads").update({ estado: "convertido" }).eq("id", leadId);
  }

  revalidatePath("/crm", "layout");
  return { status: "ok", correo, password, legalName };
}

// ---------------------------------------------------------------------
// Leads del portal empresas (/empresas): el admin los marca contactado o
// descartado a medida que avanza la conversacion comercial.
// ---------------------------------------------------------------------
export async function actualizarEstadoLead(
  leadId: string,
  estado: "nuevo" | "contactado" | "convertido" | "descartado"
) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("empresa_leads").update({ estado }).eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm", "layout");
}

// ---------------------------------------------------------------------
// Ficha CRM del organizador: contacto, responsable comercial, % de Ticket
// Service y notas internas.
// ---------------------------------------------------------------------
export async function actualizarFichaOrganizador(organizerId: string, formData: FormData) {
  await requireAdmin();

  const legalName = String(formData.get("legal_name") || "").trim();
  const nit = String(formData.get("nit") || "").trim();
  const contactName = String(formData.get("contact_name") || "").trim();
  const contactPhone = String(formData.get("contact_phone") || "").trim();
  const contactEmail = String(formData.get("contact_email") || "").trim();
  const commercialOwner = String(formData.get("commercial_owner") || "").trim();
  const commissionRaw = String(formData.get("commission_rate") || "").trim();
  const notas = String(formData.get("notas") || "").trim();

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizers")
    .update({
      legal_name: legalName,
      nit,
      contact_name: contactName || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      commercial_owner: commercialOwner || null,
      commission_rate: commissionRaw === "" ? undefined : Number(commissionRaw),
      notas: notas || null,
    })
    .eq("id", organizerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/crm/organizadores/${organizerId}`);
  revalidatePath("/crm", "layout");
}
