"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// organizers no tiene politica RLS de escritura para admin (solo el dueno
// puede hacer update de su propia fila) — por diseno, las escrituras de
// negocio del CRM se hacen con la service role key una vez requireAdmin()
// confirmo la sesion y el rol contra la fila propia del usuario (eso si
// respeta RLS: profiles_select_own_or_admin).
export async function actualizarDianStatus(
  organizerId: string,
  nuevoEstado: "no_habilitado" | "en_proceso" | "habilitado"
) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizers")
    .update({ dian_status: nuevoEstado })
    .eq("id", organizerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}

// ---------------------------------------------------------------------
// Credenciales de API (api_clients) — modulo del CRM para que el admin
// genere y revoque llaves de integradores externos (ej. el bot de
// WhatsApp) sin tener que correr el script scripts/crear-api-client.mjs
// a mano. api_clients no tiene politica de insert/delete para sesiones
// normales (solo select para admin), asi que igual que arriba se usa la
// service role key una vez requireAdmin() confirma el rol.
export type CrearApiClienteState = {
  status: "idle" | "ok" | "error";
  mensaje?: string;
  companyName?: string;
  apiKey?: string;
  scopes?: string[];
};

export async function crearApiCliente(
  _prevState: CrearApiClienteState,
  formData: FormData
): Promise<CrearApiClienteState> {
  await requireAdmin();

  const companyName = String(formData.get("company_name") || "").trim();
  const scopes = formData.getAll("scopes").map(String);
  const rateLimitRaw = Number(formData.get("rate_limit_per_min"));
  const rateLimit = Number.isFinite(rateLimitRaw) && rateLimitRaw > 0 ? Math.floor(rateLimitRaw) : 60;

  if (!companyName) {
    return { status: "error", mensaje: "El nombre del integrador es obligatorio." };
  }
  if (scopes.length === 0) {
    return { status: "error", mensaje: "Selecciona al menos un scope." };
  }

  const rawKey = "mnk_live_" + crypto.randomBytes(24).toString("base64url");
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const admin = createAdminClient();
  const { error } = await admin.from("api_clients").insert({
    company_name: companyName,
    api_key_hash: keyHash,
    scopes,
    rate_limit_per_min: rateLimit,
  });

  if (error) {
    return { status: "error", mensaje: error.message };
  }

  revalidatePath("/crm");
  return { status: "ok", companyName, apiKey: rawKey, scopes };
}

export async function revocarApiCliente(clientId: string) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("api_clients").delete().eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}
