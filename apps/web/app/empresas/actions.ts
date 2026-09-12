"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// empresa_leads no tiene policy de insert para sesiones anonimas (solo
// select/update para admin, ver migracion 0010) — el formulario publico
// de /empresas inserta con la service role key, igual que pqrs/ordenes.
export type CrearLeadState = {
  status: "idle" | "ok" | "error";
  mensaje?: string;
};

export async function crearLeadEmpresa(
  _prevState: CrearLeadState,
  formData: FormData
): Promise<CrearLeadState> {
  const nombre = String(formData.get("nombre") || "").trim();
  const empresa = String(formData.get("empresa") || "").trim();
  const correo = String(formData.get("correo") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();
  const mensaje = String(formData.get("mensaje") || "").trim();

  if (!nombre || !correo) {
    return { status: "error", mensaje: "Nombre y correo son obligatorios." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("empresa_leads").insert({
    nombre,
    empresa: empresa || null,
    correo,
    telefono: telefono || null,
    mensaje: mensaje || null,
  });

  if (error) {
    return { status: "error", mensaje: "No pudimos enviar tu solicitud. Intenta de nuevo o escribenos por WhatsApp." };
  }

  return { status: "ok" };
}
