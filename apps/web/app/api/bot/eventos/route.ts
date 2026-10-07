import { NextRequest, NextResponse } from "next/server";
import { requireApiClient } from "@/lib/api-auth";
import { getFourvenuesEvents } from "@/lib/fourvenues";
import { eventoVigente } from "@/lib/fv-format";
import { aBotEvento, siteUrl, sinTildes } from "@/lib/bot-fv";

export const dynamic = "force-dynamic";

// Eventos para el bot de WhatsApp (Dapta). Lee FourVenues en vivo y
// responde en el formato que espera el agente. Requiere x-api-key con
// scope eventos:leer.
export async function GET(req: NextRequest) {
  const auth = await requireApiClient(req, "eventos:leer");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const q = sinTildes(searchParams.get("q") ?? "");
  const ciudad = sinTildes(searchParams.get("ciudad") ?? "");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  try {
    const crudos = await getFourvenuesEvents();
    const base = siteUrl();
    const eventos = crudos
      .filter(eventoVigente)
      .map((e) => aBotEvento(e, base))
      .filter((e) => !q || sinTildes(e.name).includes(q))
      .filter((e) => !ciudad || sinTildes(e.city).includes(ciudad))
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, limit);

    return NextResponse.json({ eventos });
  } catch (err) {
    console.error("bot/eventos error", err);
    return NextResponse.json({ error: "error_consultando_eventos" }, { status: 502 });
  }
}
