import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiClient } from "@/lib/api-auth";

const TIPOS_VALIDOS = ["peticion", "queja", "reclamo", "sugerencia", "soporte_compra"];

export async function POST(req: NextRequest) {
  const auth = await requireApiClient(req, "pqrs:crear");
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const tipo = body?.tipo;
  const nombre = body?.nombre;
  const correo = body?.correo;
  const mensaje = body?.mensaje;

  if (!TIPOS_VALIDOS.includes(tipo) || !nombre || !correo || !mensaje) {
    return NextResponse.json(
      {
        error: "datos_invalidos",
        detalle: `Se requiere tipo (${TIPOS_VALIDOS.join(" | ")}), nombre, correo y mensaje`,
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pqrs_solicitudes")
    .insert({
      tipo,
      canal: "api",
      api_client_id: auth.client.id,
      nombre,
      documento: body?.documento ?? null,
      correo,
      telefono: body?.telefono ?? null,
      referencia_orden: body?.referencia_orden ?? null,
      mensaje,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "error_creando_pqrs" }, { status: 500 });
  }

  return NextResponse.json({ pqrs_id: data.id, estado: "abierta" }, { status: 201 });
}
