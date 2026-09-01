// Genera una credencial para un cliente de la API publica (app/api/v1/*)
// y la inserta en api_clients (solo se guarda el hash, nunca la llave en
// texto plano). Uso:
//   node scripts/crear-api-client.mjs "Nombre de la empresa" scope1,scope2,...
// Ejemplo:
//   node scripts/crear-api-client.mjs "Bot WhatsApp Monarca" eventos:leer,ordenes:crear,ordenes:leer,pqrs:crear
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes, createHash } from "node:crypto";

function loadEnv(path) {
  const out = {};
  const txt = readFileSync(path, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const [, , companyName, scopesArg] = process.argv;
if (!companyName || !scopesArg) {
  console.error('Uso: node scripts/crear-api-client.mjs "Nombre" scope1,scope2,...');
  process.exit(1);
}
const scopes = scopesArg.split(",").map((s) => s.trim());

const env = loadEnv(new URL("../.env.local", import.meta.url));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rawKey = "mnk_live_" + randomBytes(24).toString("base64url");
const keyHash = createHash("sha256").update(rawKey).digest("hex");

const { data, error } = await supabase
  .from("api_clients")
  .insert({ company_name: companyName, api_key_hash: keyHash, scopes, rate_limit_per_min: 60 })
  .select("id")
  .single();

if (error) {
  console.error("Error creando el cliente:", error.message);
  process.exit(1);
}

console.log(`Cliente creado: ${companyName} (id ${data.id})`);
console.log(`Scopes: ${scopes.join(", ")}`);
console.log("\nLLAVE (solo se muestra una vez, guardala ya):");
console.log(rawKey);
