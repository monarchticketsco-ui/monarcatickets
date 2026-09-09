import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";
import { esEventoActivo, tiposDeBoletoPorEvento } from "@/lib/api-eventos";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiClient(req, "eventos:leer");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: eventoCrudo } = await admin
    .from("events")
    .select("id, name, description, venue, city, category, starts_at, ends_at, status, image_url")
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .maybeSingle();

  if (!eventoCrudo) {
    return NextResponse.json({ error: "evento_no_encontrado" }, { status: 404 });
  }

  const evento = { ...eventoCrudo, activo: esEventoActivo(eventoCrudo.status) };

  const tiposPorEvento = await tiposDeBoletoPorEvento(admin, [id]);
  const boletos = tiposPorEvento.get(id) ?? [];

  return NextResponse.json({ evento, tipos_de_boleto: boletos });
}
