import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MobileNavToggle } from "@/components/mobile-nav-toggle";

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
          <Image src="/logo.png" alt="Monarca Tickets" width={152} height={32} priority />
        </Link>
        <Link href="/" className="brand-icon" aria-label="Monarca Tickets — inicio">
          <Image src="/logo-icon.png" alt="" width={44} height={28} priority />
        </Link>
        <MobileNavToggle>
          <Link href="/eventos" className="nav-link">
            Eventos
          </Link>
          <Link href="/soporte" className="nav-link">
            Soporte
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
              <Link href="/empresas" className="nav-link">
                Portal empresas
              </Link>
              <Link href="/personas" className="btn btn-primary btn-sm">
                Portal personas
              </Link>
            </>
          )}
        </MobileNavToggle>
      </div>
    </header>
  );
}
