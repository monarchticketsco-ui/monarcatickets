import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEventosConTickets } from "@/lib/fv-admin";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || "";
  const hasta = searchParams.get("hasta") || "";

  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("id, full_name, phone, created_at")
    .eq("role", "comprador")
    .order("created_at", { ascending: false });

  if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

  const { data: perfiles } = await query;
  const clientes = perfiles ?? [];

  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailPorId = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  // Entradas y gasto salen de FourVenues (por correo del comprador), no de
  // la tabla local de ordenes.
  const statsPorCorreo = new Map<string, { pedidos: number; total: number }>();
  try {
    for (const { tickets } of await getEventosConTickets()) {
      for (const t of tickets) {
        if (t.status === "refunded" || t.status === "cancelled") continue;
        const k = (t.email || "").trim().toLowerCase();
        const prev = statsPorCorreo.get(k) ?? { pedidos: 0, total: 0 };
        prev.pedidos += 1;
        prev.total += t.total_price || 0;
        statsPorCorreo.set(k, prev);
      }
    }
  } catch {
    // FourVenues no respondio: las columnas quedan en 0.
  }

  const encabezados = ["Nombre", "Correo", "Telefono", "Cliente desde", "Entradas", "Total gastado COP"];
  const filas = clientes.map((c) => {
    const stats = statsPorCorreo.get((emailPorId.get(c.id) ?? "").toLowerCase()) ?? { pedidos: 0, total: 0 };
    return [
      c.full_name ?? "",
      emailPorId.get(c.id) ?? "",
      c.phone ?? "",
      new Date(c.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }),
      String(stats.pedidos),
      String(stats.total),
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = "﻿" + [encabezados.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clientes-monarca-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
