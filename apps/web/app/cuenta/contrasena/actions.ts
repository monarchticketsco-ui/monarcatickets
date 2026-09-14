"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function cambiarPassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const password = String(formData.get("password") || "");
  const confirmar = String(formData.get("confirmar") || "");

  if (password.length < 8) {
    redirect(`/cuenta/contrasena?error=${encodeURIComponent("La contrasena debe tener al menos 8 caracteres.")}`);
  }
  if (password !== confirmar) {
    redirect(`/cuenta/contrasena?error=${encodeURIComponent("Las contrasenas no coinciden.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/cuenta/contrasena?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/cuenta/contrasena?ok=1");
}
