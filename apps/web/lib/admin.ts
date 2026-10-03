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

// Helper compartido por Mi Cuenta: exige sesion (cualquier usuario logueado).
export async function requireComprador() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

// Lista de eventos de FourVenues que ya tienen un organizador asignado
// (ver organizers.fourvenues_event_id). Se usa para que "Mis entradas"
// encuentre boletos de eventos que ya terminaron y por eso no aparecen
// en el catalogo publico de FourVenues. Requiere el cliente admin porque
// RLS solo deja ver el propio organizador.
export async function getEventosAsignados(): Promise<string[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizers")
    .select("fourvenues_event_id")
    .not("fourvenues_event_id", "is", null);

  return (data ?? [])
    .map((o) => o.fourvenues_event_id)
    .filter((id): id is string => Boolean(id));
}
