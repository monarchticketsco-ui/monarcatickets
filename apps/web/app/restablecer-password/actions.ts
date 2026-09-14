"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function actualizarPasswordRecuperada(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/recuperar-password?error=${encodeURIComponent("El enlace expiro. Solicita uno nuevo.")}`);
  }

  const password = String(formData.get("password") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (password.length < 8) {
    redirect(`/restablecer-password?error=${encodeURIComponent("La contrasena debe tener al menos 8 caracteres.")}`);
  }
  if (password !== confirmar) {
    redirect(`/restablecer-password?error=${encodeURIComponent("Las contrasenas no coinciden.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/restablecer-password?error=${encodeURIComponent(error.message)}`);
  }

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const destino = perfil?.role === "admin" ? "/crm" : perfil?.role === "organizador" ? "/panel" : "/mi-cuenta";

  redirect(`${destino}?passwordActualizada=1`);
}
