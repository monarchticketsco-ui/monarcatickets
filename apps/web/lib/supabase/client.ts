import { createBrowserClient } from "@supabase/ssr";

// Cliente para componentes del navegador. Usa la anon key: la seguridad
// real la da RLS (ver supabase/migrations/0001_init.sql), no este archivo.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
