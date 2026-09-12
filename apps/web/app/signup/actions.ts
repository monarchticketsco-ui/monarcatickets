"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name") || "");
  const captchaToken = formData.get("captchaToken");

  // El auto-registro de organizadores quedo cerrado (ver /empresas): esa
  // cuenta la crea un admin desde el CRM. Si alguien intenta forzar
  // role=organizador en el POST igual queda como comprador.
  const role = "comprador";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
      ...(captchaToken ? { captchaToken: String(captchaToken) } : {}),
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Sin confirmacion de correo (proyecto configurado asi) ya hay sesion:
  // mandamos directo a completar el perfil de organizador si aplica.
  if (data.session) {
    redirect(role === "organizador" ? "/panel/completar-perfil" : "/");
  }

  redirect("/signup?revisaCorreo=1");
}
