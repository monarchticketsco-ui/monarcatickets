// Script de un solo uso: siembra organizadores y eventos demo para que
// el sitio se pueda ver con contenido real. Se corre a mano con
// `node scripts/seed-demo.mjs` desde apps/web — no forma parte del
// build ni se importa desde la app.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

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

const ORGANIZADORES = [
  { legal_name: "Radiante Producciones S.A.S.", nit: "900111222-1" },
  { legal_name: "Cumbre Live Entertainment S.A.S.", nit: "900111222-2" },
  { legal_name: "Fundación Teatral Andina", nit: "900111222-3" },
  { legal_name: "Risas Colectivas S.A.S.", nit: "900111222-4" },
  { legal_name: "Deportes y Espectáculos del Caribe S.A.S.", nit: "900111222-5" },
  { legal_name: "Nodo Conferencias & Ferias S.A.S.", nit: "900111222-6" },
];

// tipo de boleto: [nombre, precio_cop, aforo]
const GA = (precio, aforo) => ["General", precio, aforo];
const VIP = (precio, aforo) => ["VIP", precio, aforo];

const EVENTOS = [
  { org: 0, name: "Luces de Neón — Radiante en Concierto", venue: "Movistar Arena", city: "Bogotá", category: "Concierto", date: "2026-09-18T20:00:00-05:00", tickets: [GA(180000, 3000), VIP(350000, 500)] },
  { org: 0, name: "Vuelo Nocturno Tour — Mareas", venue: "Explanada Parque Norte", city: "Medellín", category: "Concierto", date: "2026-09-25T20:00:00-05:00", tickets: [GA(150000, 2500), VIP(280000, 400)] },
  { org: 0, name: "Acústico Íntimo — Juliana Restrepo", venue: "Teatro Los Cristales", city: "Cali", category: "Concierto", date: "2026-10-02T19:30:00-05:00", tickets: [GA(120000, 600), VIP(220000, 120)] },
  { org: 0, name: "Bajo el Mismo Cielo — Los Andinos", venue: "Coliseo Vicente Díaz Romero", city: "Bucaramanga", category: "Concierto", date: "2026-10-09T20:00:00-05:00", tickets: [GA(130000, 1800), VIP(240000, 300)] },
  { org: 1, name: "Festival Horizonte", venue: "Parque Simón Bolívar", city: "Bogotá", category: "Festival", date: "2026-10-17T14:00:00-05:00", tickets: [GA(220000, 8000), VIP(450000, 800)] },
  { org: 1, name: "Cumbia Fest Caribe", venue: "Gran Malecón", city: "Barranquilla", category: "Festival", date: "2026-11-01T16:00:00-05:00", tickets: [GA(150000, 5000), VIP(300000, 600)] },
  { org: 1, name: "Raíces — Festival de Música Andina", venue: "Parque Olaya Herrera", city: "Pereira", category: "Festival", date: "2026-11-08T15:00:00-05:00", tickets: [GA(90000, 3000), VIP(180000, 300)] },
  { org: 2, name: "Hamlet, una tragedia contemporánea", venue: "Teatro Colón", city: "Bogotá", category: "Teatro", date: "2026-09-20T19:00:00-05:00", tickets: [GA(70000, 400), VIP(130000, 80)] },
  { org: 2, name: "La Dama Duende", venue: "Teatro Metropolitano", city: "Medellín", category: "Teatro", date: "2026-09-27T19:30:00-05:00", tickets: [GA(65000, 500), VIP(120000, 100)] },
  { org: 2, name: "Sueños de Papel", venue: "Teatro Municipal Enrique Buenaventura", city: "Cali", category: "Teatro", date: "2026-10-04T16:00:00-05:00", tickets: [GA(45000, 450), VIP(80000, 60)] },
  { org: 3, name: "Noche de Stand Up: Sin Filtro", venue: "Teatro Nacional", city: "Bogotá", category: "Comedia", date: "2026-09-19T21:00:00-05:00", tickets: [GA(60000, 350), VIP(110000, 60)] },
  { org: 3, name: "Comediantes en Fuga", venue: "Centro de Convenciones", city: "Cartagena", category: "Comedia", date: "2026-10-03T20:00:00-05:00", tickets: [GA(55000, 400), VIP(100000, 70)] },
  { org: 3, name: "Risas al Parque", venue: "Auditorio Fundadores", city: "Medellín", category: "Comedia", date: "2026-10-11T20:00:00-05:00", tickets: [GA(50000, 380), VIP(95000, 60)] },
  { org: 4, name: "Clásico Andino: Halcones vs. Titanes FC", venue: "Estadio El Campín", city: "Bogotá", category: "Deportivo", date: "2026-09-22T19:00:00-05:00", tickets: [GA(45000, 12000), VIP(150000, 1200)] },
  { org: 4, name: "Final Copa Pacífico: Marinos FC vs. Cóndores", venue: "Estadio Pascual Guerrero", city: "Cali", category: "Deportivo", date: "2026-10-06T18:00:00-05:00", tickets: [GA(40000, 10000), VIP(140000, 1000)] },
  { org: 4, name: "Noche de Boxeo: Guerreros del Ring", venue: "Coliseo Elías Chegwin", city: "Barranquilla", category: "Deportivo", date: "2026-10-20T20:00:00-05:00", tickets: [GA(60000, 2500), VIP(200000, 300)] },
  { org: 5, name: "Cumbre de Innovación Digital CO26", venue: "Plaza Mayor", city: "Medellín", category: "Conferencia", date: "2026-09-29T08:00:00-05:00", tickets: [GA(150000, 1200), VIP(400000, 150)] },
  { org: 5, name: "Foro Nacional de Emprendimiento", venue: "Cámara de Comercio", city: "Bucaramanga", category: "Conferencia", date: "2026-10-13T09:00:00-05:00", tickets: [GA(90000, 500), VIP(220000, 80)] },
  { org: 1, name: "Circo Familiar: Mundo de Fantasía", venue: "Carpa Villa Country", city: "Bogotá", category: "Familiar", date: "2026-09-26T16:00:00-05:00", tickets: [GA(35000, 1500), VIP(70000, 200)] },
  { org: 1, name: "Feria de Juegos y Magia", venue: "Parque Caldas", city: "Manizales", category: "Familiar", date: "2026-10-25T14:00:00-05:00", tickets: [GA(25000, 2000), VIP(50000, 150)] },
];

async function crearOrganizador(def, i) {
  const email = `demo.organizador${i + 1}@monarcatickets.local`;
  const password = randomUUID();

  const { data: existentes } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = existentes?.users.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "organizador", full_name: def.legal_name },
    });
    if (error) throw new Error(`crear usuario ${email}: ${error.message}`);
    user = data.user;
  }

  const { data: organizerExistente } = await supabase
    .from("organizers")
    .select("id")
    .eq("nit", def.nit)
    .maybeSingle();

  if (organizerExistente) return organizerExistente.id;

  const { data: organizer, error: orgError } = await supabase
    .from("organizers")
    .insert({
      owner_user_id: user.id,
      legal_name: def.legal_name,
      nit: def.nit,
      dian_status: "habilitado",
      commission_rate: 10,
    })
    .select("id")
    .single();

  if (orgError) throw new Error(`crear organizer ${def.legal_name}: ${orgError.message}`);
  return organizer.id;
}

async function main() {
  console.log("Creando organizadores demo...");
  const organizerIds = [];
  for (let i = 0; i < ORGANIZADORES.length; i++) {
    const id = await crearOrganizador(ORGANIZADORES[i], i);
    organizerIds.push(id);
    console.log(`  ✓ ${ORGANIZADORES[i].legal_name} -> ${id}`);
  }

  console.log("\nCreando eventos demo...");
  let creados = 0;
  let saltados = 0;
  for (const ev of EVENTOS) {
    const { data: existente } = await supabase
      .from("events")
      .select("id")
      .eq("name", ev.name)
      .eq("organizer_id", organizerIds[ev.org])
      .maybeSingle();

    if (existente) {
      saltados++;
      continue;
    }

    const { data: evento, error } = await supabase
      .from("events")
      .insert({
        organizer_id: organizerIds[ev.org],
        name: ev.name,
        venue: ev.venue,
        city: ev.city,
        category: ev.category,
        starts_at: ev.date,
        status: "en_venta",
      })
      .select("id")
      .single();

    if (error) throw new Error(`crear evento ${ev.name}: ${error.message}`);

    const { error: ticketsError } = await supabase.from("ticket_types").insert(
      ev.tickets.map(([name, price_cop, capacity]) => ({
        event_id: evento.id,
        name,
        price_cop,
        capacity,
      }))
    );
    if (ticketsError) throw new Error(`crear tipos de boleto ${ev.name}: ${ticketsError.message}`);

    creados++;
    console.log(`  ✓ ${ev.name} (${ev.city})`);
  }

  console.log(`\nListo. ${creados} eventos creados, ${saltados} ya existían.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
