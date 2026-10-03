"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const captchaToken = formData.get("captchaToken");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken: String(captchaToken) } : undefined,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  // Cada rol tiene su propio panel — igual que decidio el equipo de
  // diseno en ROUTING_HANDOFF.md: admin a Management, organizador
  // (Polinizador) a su panel, cualquier otra persona logueada a Mi
  // Cuenta. Nunca mostramos un atajo publico a Management: esto solo se
  // activa si el perfil ya tiene ese rol en la base de datos.
  const userId = data.user?.id;
  if (userId) {
    const { data: perfil } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (perfil?.role === "admin") redirect("/crm");

    const { data: organizador } = await supabase
      .from("organizers")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();
    if (organizador) redirect("/panel");
  }

  redirect("/mi-cuenta");
}
