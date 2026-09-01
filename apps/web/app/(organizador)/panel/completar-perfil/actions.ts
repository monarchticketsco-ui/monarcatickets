"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function crearOrganizador(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const legalName = String(formData.get("legal_name"));
  const nit = String(formData.get("nit"));

  const { error } = await supabase.from("organizers").insert({
    owner_user_id: user.id,
    legal_name: legalName,
    nit,
  });

  if (error) {
    redirect(`/panel/completar-perfil?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/panel");
}
