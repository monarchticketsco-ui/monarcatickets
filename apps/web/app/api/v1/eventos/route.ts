import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";

// API publica para integraciones de terceros (bot de WhatsApp, etc.).
// Ver documentacion en /docs/api-partners.md.
export async function GET(req: NextRequest) {
  const auth = await requireApiClient(req, "eventos:leer");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const ciudad = searchParams.get("ciudad");
  const categoria = searchParams.get("categoria");
  const fecha = searchParams.get("fecha");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  const admin = createAdminClient();
  let query = admin
    .from("events")
    .select("id, name, description, venue, city, category, starts_at, status, image_url")
    .in("status", ["publicado", "en_venta"])
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (q) query = query.ilike("name", `%${q}%`);
  if (ciudad) query = query.eq("city", ciudad);
  if (categoria) query = query.eq("category", categoria);
  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59`);
    query = query.gte("starts_at", inicio.toISOString()).lte("starts_at", fin.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "error_consultando_eventos" }, { status: 500 });
  }

  return NextResponse.json({ eventos: data });
}
