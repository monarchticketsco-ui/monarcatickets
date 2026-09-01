import { NextResponse } from "next/server";

// API publica para socios (blueprint seccion 09).
// TODO (Fase 6): autenticacion por API key (tabla api_clients), rate
// limiting, y devolver el catalogo de eventos publicados con
// disponibilidad. Por ahora placeholder para no romper el build.
export async function GET() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
