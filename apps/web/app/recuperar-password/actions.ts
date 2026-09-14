"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function solicitarRecuperacion(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const captchaToken = formData.get("captchaToken");

  if (!email) {
    redirect(`/recuperar-password?error=${encodeURIComponent("Ingresa tu correo.")}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://monarcatickets-web.vercel.app";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/restablecer-password`,
    ...(captchaToken ? { captchaToken: String(captchaToken) } : {}),
  });

  // Mostramos siempre el mismo mensaje, exista o no una cuenta con ese
  // correo, para no revelar que correos estan registrados.
  redirect("/recuperar-password?enviado=1");
}
