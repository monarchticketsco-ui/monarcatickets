import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MqNavLinks } from "@/components/mq-nav-links";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = perfil?.role ?? null;
  }

  return (
    <header className="mq-scope mq-nav">
      <Link href="/" className="mq-logo" aria-label="Monarca Tickets — inicio">
        <Image src="/logo.png" alt="Monarca Tickets" width={152} height={32} priority />
      </Link>
      <Link href="/" className="mq-logo-icon" aria-label="Monarca Tickets — inicio">
        <Image src="/logo-icon.png" alt="" width={38} height={30} priority />
      </Link>
      <MqNavLinks>
        <Link href="/">Inicio</Link>
        <Link href="/empresas">Organizadores</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/soporte">Soporte</Link>
        {user ? (
          <>
            <Link href="/mi-cuenta">Mi cuenta</Link>
            {role === "organizador" && <Link href="/panel">Panel</Link>}
            {role === "admin" && <Link href="/crm">Panel</Link>}
            <form action="/logout" method="post">
              <button type="submit" className="mq-btn">
                Salir
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="mq-btn">
            Log In
          </Link>
        )}
      </MqNavLinks>
    </header>
  );
}
