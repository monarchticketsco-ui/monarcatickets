import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Busca o crea el perfil de un comprador que llega por un canal sin
// sesion web (hoy: la API publica / bot de WhatsApp). No usa contrasena
// real — el comprador nunca inicia sesion con ella; el registro solo
// existe para asociarle sus ordenes y boletos, igual que cualquier otro
// usuario de la plataforma.
export async function buscarOCrearComprador(params: { correo: string; nombre: string; telefono?: string }) {
  const admin = createAdminClient();
  const correo = params.correo.trim().toLowerCase();

  const { data: existentes } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existente = existentes?.users.find((u) => u.email?.toLowerCase() === correo);

  if (existente) {
    await admin
      .from("profiles")
      .update({ full_name: params.nombre, phone: params.telefono ?? null })
      .eq("id", existente.id);
    return existente.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: correo,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: { role: "comprador", full_name: params.nombre, phone: params.telefono },
  });

  if (error || !data.user) {
    throw new Error(`No se pudo crear el comprador: ${error?.message ?? "error desconocido"}`);
  }

  return data.user.id;
}
