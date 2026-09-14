"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------
// Crear un cliente (comprador) desde el CRM. Mismo patron que crear
// organizador: se genera una contrasena temporal que solo se muestra una
// vez, para que el admin se la entregue al cliente por un canal privado.
// El trigger on_auth_user_created ya crea la fila en profiles a partir
// de user_metadata, asi que no hace falta un insert aparte.
// ---------------------------------------------------------------------
export type CrearClienteState = {
  status: "idle" | "ok" | "error";
  mensaje?: string;
  correo?: string;
  password?: string;
  fullName?: string;
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

export async function crearClienteAdmin(
  _prevState: CrearClienteState,
  formData: FormData
): Promise<CrearClienteState> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") || "").trim();
  const correo = String(formData.get("correo") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();

  if (!fullName || !correo) {
    return { status: "error", mensaje: "Nombre y correo son obligatorios." };
  }

  const admin = createAdminClient();
  const password = generarPasswordTemporal();

  const { data: nuevoUsuario, error: authError } = await admin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
    user_metadata: { role: "comprador", full_name: fullName, phone: phone || undefined },
  });

  if (authError || !nuevoUsuario.user) {
    return { status: "error", mensaje: authError?.message ?? "No se pudo crear el usuario." };
  }

  revalidatePath("/crm/clientes");
  return { status: "ok", correo, password, fullName };
}

export async function actualizarCliente(clienteId: string, formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ full_name: fullName || null, phone: phone || null })
    .eq("id", clienteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/crm/clientes/${clienteId}`);
  revalidatePath("/crm/clientes");
}

export async function eliminarCliente(clienteId: string) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(clienteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm/clientes");
  redirect("/crm/clientes");
}
