// Script de verificacion de un solo uso para la Fase 2.1 (boletos con QR
// + correo de confirmacion). Crea una orden de prueba, la marca 'pagada'
// a mano (sin pasar por Bold), corre la MISMA logica de generacion de
// boletos que usa el webhook (espejo de lib/tickets.ts, mismo algoritmo
// de firma) y verifica: se crean los boletos correctos, la firma es
// valida, y volver a correr la generacion no duplica boletos (idempotencia).
// Al final borra todo lo que creo — no deja datos de prueba en la base.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

function loadEnv(path) {
  const out = {};
  const txt = readFileSync(path, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = loadEnv(new URL("../.env.local", import.meta.url));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function claveDeFirma() {
  return env.TICKET_QR_SECRET || env.SUPABASE_SERVICE_ROLE_KEY || "monarca-tickets-dev-secret";
}
function firmarTicket(ticketId) {
  const firma = crypto.createHmac("sha256", claveDeFirma()).update(ticketId).digest("hex").slice(0, 24);
  return `${ticketId}.${firma}`;
}
function verificarFirmaTicket(qrSigned) {
  const [ticketId, firma] = qrSigned.split(".");
  if (!ticketId || !firma) return { valido: false };
  const esperada = crypto.createHmac("sha256", claveDeFirma()).update(ticketId).digest("hex").slice(0, 24);
  const a = Buffer.from(firma);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { valido: false };
  return { valido: true, ticketId };
}
async function generarBoletosParaOrden(admin, ordenId, holderUserId) {
  const { data: items, error: itemsError } = await admin.from("order_items").select("id, quantity").eq("order_id", ordenId);
  if (itemsError) throw itemsError;
  if (!items || items.length === 0) return [];
  const itemIds = items.map((i) => i.id);
  const { data: existentes, error: existentesError } = await admin.from("tickets").select("order_item_id").in("order_item_id", itemIds);
  if (existentesError) throw existentesError;
  const itemsConBoletos = new Set((existentes ?? []).map((t) => t.order_item_id));
  const filas = [];
  for (const item of items) {
    if (itemsConBoletos.has(item.id)) continue;
    for (let i = 0; i < item.quantity; i++) {
      const id = crypto.randomUUID();
      filas.push({ id, order_item_id: item.id, qr_signed: firmarTicket(id), holder_user_id: holderUserId });
    }
  }
  if (filas.length === 0) return [];
  const { data: creados, error: insertError } = await admin.from("tickets").insert(filas).select("id, order_item_id, qr_signed");
  if (insertError) throw insertError;
  return creados ?? [];
}

async function main() {
  const fallos = [];
  function assert(cond, msg) {
    if (!cond) fallos.push(msg);
    console.log(`  ${cond ? "OK" : "FALLO"} — ${msg}`);
  }

  console.log("1) Preparando comprador y evento de prueba...");
  const email = "test.fase21@monarcatickets.local";
  const { data: existentes } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  let comprador = existentes?.users.find((u) => u.email === email);
  if (!comprador) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { role: "comprador", full_name: "Comprador de Prueba" },
    });
    if (error) throw new Error(`crear comprador: ${error.message}`);
    comprador = data.user;
  }
  await supabase.from("profiles").upsert({ id: comprador.id, role: "comprador", full_name: "Comprador de Prueba" });

  const { data: tipoBoleto, error: tipoError } = await supabase
    .from("ticket_types")
    .select("id, price_cop, event_id")
    .limit(1)
    .single();
  if (tipoError || !tipoBoleto) throw new Error(`no hay ticket_types para probar: ${tipoError?.message}`);

  console.log("2) Creando orden de prueba (pendiente) con 2 boletos...");
  const cantidad = 2;
  const { data: orden, error: ordenError } = await supabase
    .from("orders")
    .insert({
      user_id: comprador.id,
      event_id: tipoBoleto.event_id,
      status: "pendiente",
      total_cop: tipoBoleto.price_cop * cantidad,
    })
    .select("id")
    .single();
  if (ordenError) throw new Error(`crear orden: ${ordenError.message}`);

  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .insert({ order_id: orden.id, ticket_type_id: tipoBoleto.id, quantity: cantidad, unit_price_cop: tipoBoleto.price_cop })
    .select("id")
    .single();
  if (itemError) throw new Error(`crear order_item: ${itemError.message}`);

  console.log("3) Marcando la orden 'pagada' (simulando SALE_APPROVED de Bold)...");
  await supabase.from("orders").update({ status: "pagada", bold_payment_id: `test-${orden.id}` }).eq("id", orden.id);

  console.log("4) Generando boletos con QR (misma logica que el webhook)...");
  const creados = await generarBoletosParaOrden(supabase, orden.id, comprador.id);
  assert(creados.length === cantidad, `se crearon ${creados.length} boletos (esperado ${cantidad})`);

  console.log("5) Verificando firma de cada boleto...");
  for (const t of creados) {
    const v = verificarFirmaTicket(t.qr_signed);
    assert(v.valido && v.ticketId === t.id, `firma valida para boleto ${t.id}`);
  }
  const firmaAlterada = creados[0].qr_signed.slice(0, -1) + (creados[0].qr_signed.endsWith("0") ? "1" : "0");
  assert(!verificarFirmaTicket(firmaAlterada).valido, "una firma alterada se detecta como invalida");

  console.log("6) Re-generando sobre la misma orden (simulando un reintento del webhook)...");
  const segundaVuelta = await generarBoletosParaOrden(supabase, orden.id, comprador.id);
  assert(segundaVuelta.length === 0, "la segunda llamada no crea boletos nuevos (idempotencia)");

  const { data: totalEnBD } = await supabase.from("tickets").select("id").eq("order_item_id", item.id);
  assert((totalEnBD ?? []).length === cantidad, `la base de datos tiene exactamente ${cantidad} boletos para la orden (no duplico)`);

  console.log("7) Limpiando datos de prueba...");
  await supabase.from("tickets").delete().eq("order_item_id", item.id);
  await supabase.from("order_items").delete().eq("id", item.id);
  await supabase.from("orders").delete().eq("id", orden.id);

  console.log("\n" + (fallos.length === 0 ? "TODO OK — Fase 2.1 (generacion de boletos) verificada." : `${fallos.length} verificacion(es) fallaron.`));
  if (fallos.length > 0) {
    console.error(fallos);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
