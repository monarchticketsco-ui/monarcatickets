import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Punto de retorno para los enlaces que manda Supabase Auth por correo
// (recuperacion de contrasena, confirmacion de registro si se llegara a
// activar). El link trae un "code" (flujo PKCE) que se intercambia aqui
// por una sesion real antes de mandar al usuario a completar la accion.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si el enlace falla: en recuperacion de contrasena se pide uno nuevo;
  // en confirmacion de registro la cuenta ya puede estar confirmada.
  const esRecuperacion = next.startsWith("/restablecer-password");
  const destino = esRecuperacion ? "/recuperar-password" : "/login";
  const mensaje = esRecuperacion
    ? "El enlace no es valido o ya expiro. Solicita uno nuevo."
    : "El enlace ya se uso o expiro. Si ya confirmaste tu correo, inicia sesion.";
  return NextResponse.redirect(`${origin}${destino}?error=${encodeURIComponent(mensaje)}`);
}
