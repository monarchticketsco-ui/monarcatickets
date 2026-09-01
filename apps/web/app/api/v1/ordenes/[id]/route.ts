import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiClient(req, "ordenes:leer");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data: orden } = await admin
    .from("orders")
    .select("id, status, total_cop, created_at, events(name)")
    .eq("id", id)
    .maybeSingle();

  if (!orden) {
    return NextResponse.json({ error: "orden_no_encontrada" }, { status: 404 });
  }

  const evento = orden.events as unknown as { name: string } | null;

  return NextResponse.json({
    orden_id: orden.id,
    estado: orden.status,
    total_cop: orden.total_cop,
    evento: evento?.name ?? null,
    creada_en: orden.created_at,
  });
}
