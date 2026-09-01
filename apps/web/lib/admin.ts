import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Helper compartido por el CRM: exige sesion con perfil role = 'admin'.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!perfil || perfil.role !== "admin") redirect("/");

  return { supabase, user };
}
