import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiClient(req, "eventos:leer");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: evento } = await admin
    .from("events")
    .select("id, name, description, venue, city, category, starts_at, status, image_url")
    .eq("id", id)
    .in("status", ["publicado", "en_venta"])
    .maybeSingle();

  if (!evento) {
    return NextResponse.json({ error: "evento_no_encontrado" }, { status: 404 });
  }

  const { data: tiposDeBoleto } = await admin
    .from("ticket_types")
    .select("id, name, price_cop, capacity, sold_count")
    .eq("event_id", id)
    .order("price_cop", { ascending: false });

  const boletos = (tiposDeBoleto ?? []).map((t) => ({
    id: t.id,
    nombre: t.name,
    precio_cop: t.price_cop,
    disponibles: t.capacity - t.sold_count,
  }));

  return NextResponse.json({ evento, tipos_de_boleto: boletos });
}
