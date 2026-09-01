import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente de backend con la service role key: se salta RLS por diseno.
// Usar SOLO en Route Handlers / Server Actions que corren en el servidor
// (checkout, webhooks de Bold, payouts, DIAN) — nunca importar este
// archivo desde un Client Component ni exponer SUPABASE_SERVICE_ROLE_KEY
// al bundle del navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
