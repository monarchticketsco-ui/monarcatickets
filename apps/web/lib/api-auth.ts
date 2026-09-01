import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Autenticacion de la API publica (app/api/v1/*) para integraciones de
// terceros (ej. el bot de WhatsApp). No usa cookies de sesion: el
// cliente manda su llave en el header `x-api-key`. La llave nunca se
// guarda en texto plano — solo su hash sha256 (api_clients.api_key_hash),
// asi que si alguien lee la base de datos no puede reconstruir la llave.
export type ApiClient = {
  id: string;
  company_name: string;
  scopes: string[];
};

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function requireApiClient(
  req: NextRequest,
  scope: string
): Promise<{ client: ApiClient } | { error: NextResponse }> {
  const rawKey = req.headers.get("x-api-key");

  if (!rawKey) {
    return { error: NextResponse.json({ error: "falta_api_key" }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("api_clients")
    .select("id, company_name, scopes")
    .eq("api_key_hash", hashApiKey(rawKey))
    .maybeSingle();

  if (!client) {
    return { error: NextResponse.json({ error: "api_key_invalida" }, { status: 401 }) };
  }

  if (!client.scopes.includes(scope)) {
    return {
      error: NextResponse.json({ error: "sin_permiso", scope_requerido: scope }, { status: 403 }),
    };
  }

  return { client };
}
