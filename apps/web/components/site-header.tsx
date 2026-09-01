import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = perfil?.role ?? null;
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Monarca Tickets — inicio">
          <Image src="/logo.png" alt="Monarca Tickets" width={172} height={52} priority />
        </Link>
        <nav className="site-nav">
          <Link href="/eventos" className="nav-link">
            Eventos
          </Link>
          {user ? (
            <>
              <Link href="/mi-cuenta" className="nav-link">
                Mi cuenta
              </Link>
              {role === "organizador" && (
                <Link href="/panel" className="nav-link">
                  Panel
                </Link>
              )}
              {role === "admin" && (
                <Link href="/crm" className="nav-link">
                  CRM
                </Link>
              )}
              <form action="/logout" method="post">
                <button type="submit" className="btn btn-secondary btn-sm">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Ingresar
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
