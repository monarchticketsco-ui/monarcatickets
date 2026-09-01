import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Helper compartido por las paginas del panel: exige sesion y perfil de
// organizador completo, o redirige al paso que falte.
export async function requireOrganizer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, legal_name, nit, dian_status, commission_rate")
    .eq("owner_user_id", user.id)
    .single();

  if (!organizer) redirect("/panel/completar-perfil");

  return { supabase, user, organizer };
}
